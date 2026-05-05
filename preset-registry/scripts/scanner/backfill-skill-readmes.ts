// Backfill source metadata (stars, language, pushed_at, readme) into existing
// skill.json files without rerunning the full crawl.
//
// Usage (from scripts/scanner):
//   GITHUB_TOKEN=xxx pnpm tsx backfill-skill-readmes.ts
//   GITHUB_TOKEN=xxx pnpm tsx backfill-skill-readmes.ts --force

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
  const skillsDir = join(REGISTRY_DIR, "skills");
  if (!existsSync(skillsDir)) {
    console.error(`skills dir not found: ${skillsDir}`);
    process.exit(1);
  }

  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const dirent of await readdir(skillsDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const path = join(skillsDir, dirent.name, "skill.json");
    if (!existsSync(path)) continue;
    scanned++;

    let manifest: any;
    try {
      manifest = JSON.parse(await readFile(path, "utf8"));
    } catch {
      console.warn(`[skip] ${dirent.name}: unparseable skill.json`);
      failed++;
      continue;
    }

    if (!manifest.source?.repo) {
      skipped++;
      continue;
    }
    if (manifest.source.readme && !FORCE) {
      skipped++;
      continue;
    }

    const meta = await fetchRepoMeta(octokit, manifest.source.repo);
    manifest.source.stars = meta.stars;
    manifest.source.language = meta.language;
    manifest.source.pushed_at = meta.pushed_at;
    manifest.source.readme = meta.readme;
    manifest.source.license = meta.license;

    await writeFile(path, JSON.stringify(manifest, null, 2));
    updated++;
    console.log(`[ok]   ${manifest.source.repo} (${meta.readme ? meta.readme.length : 0} bytes, license=${meta.license ?? "—"})`);
  }

  console.log(
    `\nDone. scanned=${scanned} updated=${updated} skipped=${skipped} failed=${failed}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
