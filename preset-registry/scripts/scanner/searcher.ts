import { Octokit } from "@octokit/rest";

export interface SearchHit {
  repo: string; // "owner/name"
  default_branch: string;
  stars: number;
  path: string;
  pushed_at: string;
  description: string | null;
}

export async function searchClaudeMd(octokit: Octokit, minStars = 500): Promise<SearchHit[]> {
  const q = `filename:CLAUDE.md stars:>${minStars}`;
  const out: SearchHit[] = [];
  for (let page = 1; page <= 5; page++) {
    const { data } = await octokit.search.code({ q, per_page: 100, page });
    for (const item of data.items) {
      const repo = item.repository;
      out.push({
        repo: repo.full_name,
        default_branch: (repo as any).default_branch ?? "main",
        stars: (repo as any).stargazers_count ?? 0,
        path: item.path,
        pushed_at: (repo as any).pushed_at ?? "",
        description: repo.description,
      });
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
