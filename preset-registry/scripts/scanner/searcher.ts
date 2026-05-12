import { Octokit } from "@octokit/rest";

export interface RepoSignals {
  has_claude_plugin: boolean;
  has_skills_dir: boolean;
  has_commands_dir: boolean;
  // CLAUDE.md path is one segment from root (e.g. "CLAUDE.md"), not nested deep.
  claude_md_at_root: boolean;
}

export interface SearchHit {
  repo: string;
  default_branch: string;
  stars: number;
  path: string;
  pushed_at: string;
  description: string | null;
  topics: string[];
  language: string | null;
  homepage: string | null;
  license: string | null;
  signals?: RepoSignals;
  curated_by?: string[];
}

export async function searchClaudeMd(octokit: Octokit, minStars = 500): Promise<SearchHit[]> {
  const q = `filename:CLAUDE.md`;
  const out: SearchHit[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= 5; page++) {
    const { data } = await octokit.search.code({ q, per_page: 100, page });
    for (const item of data.items) {
      const fullName = item.repository.full_name;
      if (seen.has(fullName)) continue;
      seen.add(fullName);

      // Enrich with real repo metadata (stars, pushed_at, default_branch, topics, language).
      try {
        const [owner, repo] = fullName.split("/");
        const { data: repoData } = await octokit.repos.get({ owner, repo });
        if ((repoData.stargazers_count ?? 0) < minStars) continue;
        const licenseRaw = (repoData.license as { spdx_id?: string | null } | null)?.spdx_id ?? null;
        out.push({
          repo: fullName,
          default_branch: repoData.default_branch ?? "main",
          stars: repoData.stargazers_count ?? 0,
          path: item.path,
          pushed_at: repoData.pushed_at ?? "",
          description: repoData.description,
          topics: repoData.topics ?? [],
          language: repoData.language ?? null,
          homepage: repoData.homepage ?? null,
          license: licenseRaw === "NOASSERTION" ? null : licenseRaw,
        });
      } catch (e) {
        // Skip private/deleted/rate-limited repos silently.
        continue;
      }
    }
    if (data.items.length < 100) break;
  }
  return out;
}

export async function fetchFile(
  octokit: Octokit,
  repoFullName: string,
  ref: string,
  path: string,
): Promise<string | null> {
  const [owner, repo] = repoFullName.split("/");
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, ref, path });
    if (Array.isArray(data) || data.type !== "file") return null;
    return Buffer.from((data as any).content, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

const README_MAX_BYTES = 60_000;

export async function fetchReadme(
  octokit: Octokit,
  repoFullName: string,
): Promise<string | null> {
  const [owner, repo] = repoFullName.split("/");
  try {
    const { data } = await octokit.repos.getReadme({ owner, repo });
    const decoded = Buffer.from((data as any).content, "base64").toString("utf-8");
    if (decoded.length > README_MAX_BYTES) {
      return decoded.slice(0, README_MAX_BYTES) + "\n\n…(README truncated)";
    }
    return decoded;
  } catch {
    return null;
  }
}

/** Returns the full README without the preview truncation — for link parsing on long lists. */
export async function fetchReadmeFull(
  octokit: Octokit,
  repoFullName: string,
): Promise<string | null> {
  const [owner, repo] = repoFullName.split("/");
  try {
    const { data } = await octokit.repos.getReadme({ owner, repo });
    return Buffer.from((data as any).content, "base64").toString("utf-8");
  } catch {
    return null;
  }
}
