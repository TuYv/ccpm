import { Octokit } from "@octokit/rest";
import { fetchReadmeFull } from "./searcher.js";
import type { RepoSignals, SearchHit } from "./searcher.js";

export interface AwesomeList {
  id: string;
  owner: string;
  repo: string;
}

// NOTE: hesreallyhim/awesome-claude-code is currently a stub README ("TOC: TODO")
// while the maintainer reorganizes. Re-add once they restore link content.
export const AWESOME_LISTS: AwesomeList[] = [
  { id: "josix/awesome-claude-md", owner: "josix", repo: "awesome-claude-md" },
  { id: "jqueryscript/awesome-claude-code", owner: "jqueryscript", repo: "awesome-claude-code" },
  { id: "ComposioHQ/awesome-claude-skills", owner: "ComposioHQ", repo: "awesome-claude-skills" },
  { id: "VoltAgent/awesome-agent-skills", owner: "VoltAgent", repo: "awesome-agent-skills" },
  { id: "travisvn/awesome-claude-skills", owner: "travisvn", repo: "awesome-claude-skills" },
  { id: "BehiSecc/awesome-claude-skills", owner: "BehiSecc", repo: "awesome-claude-skills" },
];

// Self-links: each awesome list points to itself; we don't want those as candidates.
const AWESOME_REPO_KEYS = new Set(AWESOME_LISTS.map((l) => `${l.owner}/${l.repo}`.toLowerCase()));

// Common owners that appear in awesome lists but never as preset repos.
const OWNER_BLOCKLIST = new Set([
  "github",
  "anthropics",        // upstream client repos — covered by skills-scanner
  "modelcontextprotocol",
  "topics",            // github topic pages
  "sponsors",
  "marketplace",
  "settings",
  "features",
  "pricing",
  "about",
  "contact",
  "security",
  "site",
  "user-attachments",  // image/file upload host (github.com/user-attachments/assets/...)
  "users",             // /users/<name>/...
  "orgs",              // /orgs/<name>/...
  "search",            // /search/... query URLs
  "raw.githubusercontent.com",
]);

const REPO_BLOCKLIST_SUFFIX = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".md"];

const LINK_RE = /https?:\/\/github\.com\/([A-Za-z0-9][\w.-]*)\/([A-Za-z0-9][\w.-]*?)(?=[\/#?)\s>"']|$)/g;
// shields.io badges encode the repo as `img.shields.io/github/<metric>/<owner>/<repo>`
// — lists like josix/awesome-claude-md use these badges instead of direct links.
const SHIELDS_RE =
  /img\.shields\.io\/github\/(?:stars|license|last-commit|forks|issues(?:-raw|-pr)?|contributors|commit-activity|languages\/top|release(?:-date)?|watchers)\/([A-Za-z0-9][\w.-]*)\/([A-Za-z0-9][\w.-]*?)(?=[\/?#&\s>"'.]|$)/gi;

interface ParsedLink {
  owner: string;
  repo: string;
}

function parseGitHubLinks(markdown: string): ParsedLink[] {
  const out: ParsedLink[] = [];
  const seen = new Set<string>();
  const consider = (rawOwner: string, rawRepo: string) => {
    if (!rawOwner || !rawRepo) return;
    const repo = rawRepo.replace(/[).,;:!?]+$/, "");
    if (OWNER_BLOCKLIST.has(rawOwner.toLowerCase())) return;
    if (REPO_BLOCKLIST_SUFFIX.some((s) => repo.toLowerCase().endsWith(s))) return;
    const key = `${rawOwner}/${repo}`.toLowerCase();
    if (AWESOME_REPO_KEYS.has(key)) return;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ owner: rawOwner, repo });
  };

  let m: RegExpExecArray | null;
  while ((m = LINK_RE.exec(markdown))) {
    consider(m[1], m[2]);
  }
  while ((m = SHIELDS_RE.exec(markdown))) {
    consider(m[1], m[2]);
  }
  return out;
}

export interface AwesomeCandidate {
  repo: string; // "owner/name"
  curated_by: string[]; // awesome list IDs
}

export async function collectCandidates(octokit: Octokit): Promise<AwesomeCandidate[]> {
  const byRepo = new Map<string, Set<string>>();

  for (const list of AWESOME_LISTS) {
    const readme = await fetchReadmeFull(octokit, `${list.owner}/${list.repo}`);
    if (!readme) {
      console.warn(`[awesome] could not fetch README for ${list.id}`);
      continue;
    }
    const links = parseGitHubLinks(readme);
    console.log(`[awesome] ${list.id}: ${links.length} unique repo links`);
    for (const { owner, repo } of links) {
      const key = `${owner}/${repo}`;
      const set = byRepo.get(key) ?? new Set<string>();
      set.add(list.id);
      byRepo.set(key, set);
    }
  }

  return Array.from(byRepo.entries())
    .map(([repo, ids]) => ({ repo, curated_by: Array.from(ids).sort() }))
    .sort((a, b) => b.curated_by.length - a.curated_by.length);
}

/**
 * Single tree call gives us CLAUDE.md path AND repo signals
 * (.claude-plugin/, skills/<x>/SKILL.md, .claude/commands/).
 */
async function probeRepo(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
): Promise<{ path: string; signals: RepoSignals } | null> {
  let paths: string[];
  try {
    const { data } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "1",
    });
    paths = (data.tree ?? []).map((t) => t.path ?? "");
  } catch {
    return null;
  }

  const claudeMdMatches = paths.filter((p) => /(?:^|\/)CLAUDE\.md$/i.test(p));
  if (claudeMdMatches.length === 0) return null;
  claudeMdMatches.sort((a, b) => a.split("/").length - b.split("/").length || a.length - b.length);
  const path = claudeMdMatches[0];

  const signals: RepoSignals = {
    has_claude_plugin: paths.some((p) => p === ".claude-plugin" || p.startsWith(".claude-plugin/")),
    has_skills_dir: paths.some((p) => /(?:^|\/)SKILL\.md$/i.test(p)) ||
      paths.some((p) => p === "skills" || p.startsWith("skills/")),
    has_commands_dir: paths.some((p) => p.startsWith(".claude/commands/")),
    claude_md_at_root: path === "CLAUDE.md",
  };
  return { path, signals };
}

// In-process cache so repeat candidates (same repo surfaced by multiple awesome
// lists) only spend one repos.get call. See memory/feedback_scanner_ratelimit.md.
type RepoData = Awaited<ReturnType<Octokit["repos"]["get"]>>["data"];
const repoDataCache = new Map<string, RepoData | null>();

async function getRepoCached(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<RepoData | null> {
  const key = `${owner}/${repo}`;
  if (repoDataCache.has(key)) return repoDataCache.get(key) ?? null;
  try {
    const r = await octokit.repos.get({ owner, repo });
    repoDataCache.set(key, r.data);
    return r.data;
  } catch {
    repoDataCache.set(key, null);
    return null;
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// Spacing between candidate enrichments: PRs the burst rate well below the
// secondary rate-limit trigger threshold (~10+ req/s sustained).
const PER_CANDIDATE_DELAY_MS = 150;

/**
 * Enriches each candidate into a SearchHit by hitting repos.get + finding CLAUDE.md.
 * Drops candidates that aren't reachable, have no CLAUDE.md, or sit below minStars.
 */
export async function enrichCandidates(
  octokit: Octokit,
  candidates: AwesomeCandidate[],
  minStars: number,
): Promise<SearchHit[]> {
  const out: SearchHit[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const [owner, repo] = c.repo.split("/");
    if (!owner || !repo) continue;

    const repoData = await getRepoCached(octokit, owner, repo);
    if (!repoData) continue;

    const stars = repoData.stargazers_count ?? 0;
    if (stars < minStars) continue;

    const branch = repoData.default_branch ?? "main";
    const probe = await probeRepo(octokit, owner, repo, branch);
    if (!probe) {
      if (i < candidates.length - 1) await sleep(PER_CANDIDATE_DELAY_MS);
      continue;
    }

    const licenseRaw = (repoData.license as { spdx_id?: string | null } | null)?.spdx_id ?? null;
    out.push({
      repo: c.repo,
      default_branch: branch,
      stars,
      path: probe.path,
      pushed_at: repoData.pushed_at ?? "",
      description: repoData.description,
      topics: repoData.topics ?? [],
      language: repoData.language ?? null,
      homepage: repoData.homepage ?? null,
      license: licenseRaw === "NOASSERTION" ? null : licenseRaw,
      signals: probe.signals,
      curated_by: c.curated_by,
    });
    if (i < candidates.length - 1) await sleep(PER_CANDIDATE_DELAY_MS);
  }

  return out;
}

export async function discoverFromAwesomeLists(
  octokit: Octokit,
  minStars: number,
): Promise<SearchHit[]> {
  const candidates = await collectCandidates(octokit);
  console.log(`[awesome] ${candidates.length} unique candidates across all lists`);
  return enrichCandidates(octokit, candidates, minStars);
}
