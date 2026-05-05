import { Octokit } from "@octokit/rest";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import { fetchReadme } from "./searcher.js";

export interface SkillRepo {
  owner: string;
  name: string;
  branch: string;
  category: string;
}

/**
 * Pre-configured skill source repos (mirrored after CC Switch's defaults).
 * Each repo is walked recursively for SKILL.md files.
 */
export const SKILL_REPOS: SkillRepo[] = [
  { owner: "anthropics", name: "skills", branch: "main", category: "Anthropic 官方" },
  { owner: "ComposioHQ", name: "awesome-claude-skills", branch: "master", category: "Composio 社区" },
  { owner: "cexll", name: "myclaude", branch: "master", category: "社区精选" },
  { owner: "JimLiu", name: "baoyu-skills", branch: "main", category: "社区精选" },
];

const MAX_SKILLS_PER_REPO = 60;

export interface RepoMeta {
  stars: number;
  language: string | null;
  pushed_at: string;
  readme: string | null;
  license: string | null;
}

const repoMetaCache = new Map<string, RepoMeta>();

export async function fetchRepoMeta(octokit: Octokit, repoFullName: string): Promise<RepoMeta> {
  const cached = repoMetaCache.get(repoFullName);
  if (cached) return cached;
  const [owner, repo] = repoFullName.split("/");
  let stars = 0;
  let language: string | null = null;
  let pushed_at = "";
  let license: string | null = null;
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    stars = data.stargazers_count ?? 0;
    language = data.language ?? null;
    pushed_at = data.pushed_at ?? "";
    license = (data.license as { spdx_id?: string | null } | null)?.spdx_id ?? null;
    if (license === "NOASSERTION") license = null;
  } catch {
    // Leave defaults — repo may be private or rate-limited.
  }
  const readme = await fetchReadme(octokit, repoFullName);
  const meta: RepoMeta = { stars, language, pushed_at, readme, license };
  repoMetaCache.set(repoFullName, meta);
  return meta;
}

export interface SkillSource {
  repo: string;
  url: string;
  path: string;
  branch: string;
  discovered_at: string;
  stars?: number;
  language?: string | null;
  pushed_at?: string;
  readme?: string | null;
  license?: string | null;
}

export interface SkillEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  compatible_tools: string[];
  version: string;
  author: string;
  install_path: string;
  source: SkillSource;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function fetchFile(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  path: string,
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, ref, path });
    if (Array.isArray(data) || data.type !== "file") return null;
    return Buffer.from((data as { content: string }).content, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

export async function discoverSkills(
  octokit: Octokit,
  registryDir: string,
): Promise<SkillEntry[]> {
  const skillsDir = join(registryDir, "skills");
  const all: SkillEntry[] = [];

  for (const repo of SKILL_REPOS) {
    console.log(`[skills] scanning ${repo.owner}/${repo.name}@${repo.branch}…`);
    let tree;
    try {
      const r = await octokit.git.getTree({
        owner: repo.owner,
        repo: repo.name,
        tree_sha: repo.branch,
        recursive: "1",
      });
      tree = r.data.tree;
    } catch (e) {
      console.warn(`[skills] failed to read tree for ${repo.owner}/${repo.name}: ${e}`);
      continue;
    }

    const skillFiles = (tree ?? [])
      .filter((t) => /(?:^|\/)SKILL\.md$/i.test(t.path ?? ""))
      .slice(0, MAX_SKILLS_PER_REPO);

    let count = 0;
    for (const item of skillFiles) {
      const filePath = item.path!;
      const dirPath = dirname(filePath);
      const skillName = basename(dirPath);
      const id = slugify(`${repo.owner}-${repo.name}-${skillName}`);

      const content = await fetchFile(
        octokit,
        repo.owner,
        repo.name,
        repo.branch,
        filePath,
      );
      if (!content) continue;

      const fm = parseFrontmatter(content);
      const name = fm.name || skillName;
      const description = fm.description || `Skill from ${repo.owner}/${repo.name}`;

      const meta = await fetchRepoMeta(octokit, `${repo.owner}/${repo.name}`);
      const entry: SkillEntry = {
        id,
        name,
        description: description.slice(0, 500),
        category: repo.category,
        compatible_tools: ["claude", "codex", "gemini"],
        version: "1.0.0",
        author: repo.owner,
        // Preserves the original folder name so the skill stays drop-in
        // for Claude Code's ~/.claude/skills/<name>/SKILL.md convention.
        install_path: `.claude/skills/${skillName}/SKILL.md`,
        source: {
          repo: `${repo.owner}/${repo.name}`,
          url: `https://github.com/${repo.owner}/${repo.name}/blob/${repo.branch}/${filePath}`,
          path: filePath,
          branch: repo.branch,
          discovered_at: new Date().toISOString(),
          stars: meta.stars,
          language: meta.language,
          pushed_at: meta.pushed_at,
          readme: meta.readme,
          license: meta.license,
        },
      };
      all.push(entry);

      // Write skill files into the registry
      const outDir = join(skillsDir, id);
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, "skill.md"), content);
      await writeFile(
        join(outDir, "skill.json"),
        JSON.stringify(entry, null, 2),
      );
      count++;
    }
    console.log(`[skills]   wrote ${count} skills from ${repo.owner}/${repo.name}`);
  }

  // Build skills/index.json by walking the skills dir (incremental accumulation).
  const indexEntries: SkillEntry[] = [];
  if (existsSync(skillsDir)) {
    for (const dirent of await readdir(skillsDir, { withFileTypes: true })) {
      if (!dirent.isDirectory()) continue;
      const skillJson = join(skillsDir, dirent.name, "skill.json");
      if (!existsSync(skillJson)) continue;
      try {
        indexEntries.push(JSON.parse(await readFile(skillJson, "utf8")));
      } catch {
        // Skip bad files
      }
    }
  }
  // Sort: category alphabetical then name
  indexEntries.sort(
    (a, b) =>
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  );

  await mkdir(skillsDir, { recursive: true });
  await writeFile(
    join(skillsDir, "index.json"),
    JSON.stringify(
      {
        version: "1",
        updated_at: new Date().toISOString(),
        skills: indexEntries,
      },
      null,
      2,
    ),
  );

  console.log(
    `[skills] index now has ${indexEntries.length} entries (this run added ${all.length} fresh)`,
  );
  return all;
}
