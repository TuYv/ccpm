import { Octokit } from "@octokit/rest";
import { mkdir, writeFile } from "node:fs/promises";
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

      // Write the CLAUDE.md content next to the preset entry.
      const presetDir = join(REGISTRY_DIR, "presets", "auto-discovered", entry.id);
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
      // Continue with others; don't abort.
    }
  }

  // Update auto-discovered/index.json (separate from main index.json so curated entries are not overwritten)
  const autoDir = join(REGISTRY_DIR, "presets", "auto-discovered");
  await mkdir(autoDir, { recursive: true });
  await writeFile(
    join(autoDir, "index.json"),
    JSON.stringify(
      {
        version: "1",
        updated_at: new Date().toISOString(),
        presets: accepted,
      },
      null,
      2,
    ),
  );
  console.log(`Wrote ${accepted.length} auto-discovered presets`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
