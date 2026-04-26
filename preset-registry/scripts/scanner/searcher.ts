import { Octokit } from "@octokit/rest";

export interface SearchHit {
  repo: string;
  default_branch: string;
  stars: number;
  path: string;
  pushed_at: string;
  description: string | null;
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

      // Enrich with real repo metadata (stars, pushed_at, default_branch).
      try {
        const [owner, repo] = fullName.split("/");
        const { data: repoData } = await octokit.repos.get({ owner, repo });
        if ((repoData.stargazers_count ?? 0) < minStars) continue;
        out.push({
          repo: fullName,
          default_branch: repoData.default_branch ?? "main",
          stars: repoData.stargazers_count ?? 0,
          path: item.path,
          pushed_at: repoData.pushed_at ?? "",
          description: repoData.description,
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
