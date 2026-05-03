import type { SearchHit } from "./searcher.js";

export interface PresetSource {
  repo: string;             // e.g. "owner/name" — short form (full URL via url field)
  url: string;              // GitHub blob URL pointing to the actual CLAUDE.md
  homepage: string | null;
  path: string;             // path within the repo, e.g. "packages/ts/CLAUDE.md"
  branch: string;
  stars: number;
  language: string | null;
  pushed_at: string;
  discovered_at: string;
  score: number;            // 0..1, debug only
  readme: string | null;    // upstream README.md (truncated), shown in detail panel
}

export interface PresetEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  tested_on: string;
  author: string;
  tags: string[];
  source: PresetSource;
}

export function normalizeToPreset(
  hit: SearchHit,
  score: number,
  readme: string | null = null,
): PresetEntry {
  const id = hit.repo.replace("/", "-").toLowerCase().replace(/[^a-z0-9-]/g, "-");

  // Tags: prefer the repo's own GitHub topics; fall back to language as single tag.
  const topics = (hit.topics ?? []).filter(Boolean).slice(0, 8);
  const tags = topics.length > 0
    ? topics
    : hit.language
      ? [hit.language.toLowerCase()]
      : [];

  return {
    id,
    name: hit.repo,
    description: hit.description ?? `Discovered from ${hit.repo}`,
    version: "1.0.0",
    tested_on: new Date().toISOString().slice(0, 10),
    author: hit.repo.split("/")[0],
    tags,
    source: {
      repo: hit.repo,
      url: `https://github.com/${hit.repo}/blob/${hit.default_branch}/${hit.path}`,
      homepage: hit.homepage,
      path: hit.path,
      branch: hit.default_branch,
      stars: hit.stars,
      language: hit.language,
      pushed_at: hit.pushed_at,
      discovered_at: new Date().toISOString(),
      score,
      readme,
    },
  };
}
