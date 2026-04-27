import { Octokit } from "@octokit/rest";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fetchFile, searchClaudeMd } from "./searcher.js";
import { scoreHit } from "./scorer.js";
import { normalizeToPreset, type PresetEntry } from "./normalizer.js";

const REGISTRY_DIR = process.env.REGISTRY_DIR ?? join(process.cwd(), "..", "..");
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("GITHUB_TOKEN required");
  process.exit(1);
}

interface RootIndexEntry {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  components?: string[];
  version: string;
  tested_on: string;
  author: string;
  source?: PresetEntry["source"];
}

async function main() {
  const octokit = new Octokit({ auth: TOKEN });
  console.log("Searching CLAUDE.md (stars>500)…");
  let hits;
  try {
    hits = await searchClaudeMd(octokit, 500);
  } catch (e) {
    console.error(`Search failed: ${e}. Aborting this run; no changes committed.`);
    return;
  }
  console.log(`Found ${hits.length} candidates`);

  const accepted: PresetEntry[] = [];
  for (const hit of hits) {
    try {
      const content = await fetchFile(octokit, hit.repo, hit.default_branch, hit.path);
      if (!content) continue;
      const score = scoreHit(hit, content);
      if (score < 0.4) continue;
      const entry = normalizeToPreset(hit, score);
      accepted.push(entry);

      // Write under presets/<id>/ directly so the existing activation flow finds it.
      // owner-repo prefix in the id avoids collisions with curated short slugs.
      const presetDir = join(REGISTRY_DIR, "presets", entry.id);
      await mkdir(presetDir, { recursive: true });
      await writeFile(join(presetDir, "CLAUDE.md"), content);
      await writeFile(
        join(presetDir, "preset.json"),
        JSON.stringify(
          {
            id: entry.id,
            name: entry.name,
            description: entry.description,
            tags: entry.tags,
            version: entry.version,
            tested_on: entry.tested_on,
            author: entry.author,
            files: { "CLAUDE.md": "CLAUDE.md" },
            source: entry.source,
          },
          null,
          2,
        ),
      );
    } catch (e) {
      console.warn(`Skipping ${hit.repo}: ${e}`);
    }
  }

  // Merge into root presets/index.json: keep all CURATED entries (no source field),
  // replace any prior auto-discovered (has source field) with this run's results.
  const rootIndexPath = join(REGISTRY_DIR, "index.json");
  let curated: RootIndexEntry[] = [];
  if (existsSync(rootIndexPath)) {
    const root = JSON.parse(await readFile(rootIndexPath, "utf8"));
    curated = (root.presets ?? []).filter((p: RootIndexEntry) => !p.source);
  }
  const newRootPresets: RootIndexEntry[] = [
    ...curated,
    ...accepted.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      tags: e.tags,
      components: ["CLAUDE.md"],
      version: e.version,
      tested_on: e.tested_on,
      author: e.author,
      source: e.source,
    })),
  ];
  await writeFile(
    rootIndexPath,
    JSON.stringify(
      {
        version: "1",
        updated_at: new Date().toISOString(),
        presets: newRootPresets,
      },
      null,
      2,
    ),
  );

  // Clean up old auto-discovered/ subdirectory if it exists (legacy from earlier scanner version).
  const legacyDir = join(REGISTRY_DIR, "presets", "auto-discovered");
  if (existsSync(legacyDir)) {
    await rm(legacyDir, { recursive: true, force: true });
  }

  console.log(
    `Wrote ${accepted.length} auto-discovered presets (curated kept: ${curated.length})`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
