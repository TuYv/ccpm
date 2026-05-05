// Backfill README into existing preset.json files without re-running the full scanner search.
//
// Usage (from scripts/scanner):
//   GITHUB_TOKEN=xxx pnpm tsx backfill-readmes.ts
//
// Walks ../../presets/<id>/preset.json, fetches each repo's README via the GitHub API,
// and writes the content into source.readme (only when source exists and readme is missing
// or --force is passed). Curated presets without source are skipped.

import { Octokit } from "@octokit/rest";
import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchRepoMeta } from "./skills-scanner.js";

const REGISTRY_DIR =
  process.env.REGISTRY_DIR ?? join(process.cwd(), "..", "..");
const TOKEN = process.env.GITHUB_TOKEN;
const FORCE = process.argv.includes("--force");

if (!TOKEN) {
  console.error("GITHUB_TOKEN required");
  process.exit(1);
}

async function main() {
  const octokit = new Octokit({ auth: TOKEN });
  const presetsDir = join(REGISTRY_DIR, "presets");
  if (!existsSync(presetsDir)) {
    console.error(`presets dir not found: ${presetsDir}`);
    process.exit(1);
  }

  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const dirent of await readdir(presetsDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const presetJsonPath = join(presetsDir, dirent.name, "preset.json");
    if (!existsSync(presetJsonPath)) continue;
    scanned++;

    let manifest: any;
    try {
      manifest = JSON.parse(await readFile(presetJsonPath, "utf8"));
    } catch (e) {
      console.warn(`[skip] ${dirent.name}: unparseable preset.json`);
      failed++;
      continue;
    }

    if (!manifest.source?.repo) {
      skipped++;
      continue;
    }

    if (manifest.source.readme && manifest.source.license !== undefined && !FORCE) {
      skipped++;
      continue;
    }

    const meta = await fetchRepoMeta(octokit, manifest.source.repo);
    manifest.source.stars = meta.stars;
    manifest.source.language = meta.language;
    manifest.source.pushed_at = meta.pushed_at;
    manifest.source.readme = meta.readme;
    manifest.source.license = meta.license;

    await writeFile(presetJsonPath, JSON.stringify(manifest, null, 2));
    updated++;
    console.log(
      `[ok]   ${manifest.source.repo} (${meta.readme ? meta.readme.length : 0} bytes, license=${meta.license ?? "—"})`,
    );
  }

  console.log(
    `\nDone. scanned=${scanned} updated=${updated} skipped=${skipped} failed=${failed}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
