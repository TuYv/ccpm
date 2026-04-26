import type { SearchHit } from "./searcher.js";

export interface PresetEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  tested_on: string;
  author: string;
  tags: string[];
  source: { repo: string; stars: number; discovered_at: string };
}

export function normalizeToPreset(hit: SearchHit, score: number): PresetEntry {
  const id = hit.repo.replace("/", "-").toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return {
    id,
    name: hit.repo,
    description: hit.description ?? `从 ${hit.repo} 自动发现`,
    version: "1.0.0",
    tested_on: new Date().toISOString().slice(0, 10),
    author: hit.repo.split("/")[0],
    tags: ["auto-discovered", `score-${Math.round(score * 100)}`],
    source: {
      repo: `https://github.com/${hit.repo}`,
      stars: hit.stars,
      discovered_at: new Date().toISOString(),
    },
  };
}
