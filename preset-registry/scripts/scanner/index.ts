import { Octokit } from "@octokit/rest";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fetchFile, fetchReadme, searchClaudeMd } from "./searcher.js";
import { scoreHit } from "./scorer.js";
import { normalizeToPreset, type PresetEntry } from "./normalizer.js";
import { discoverSkills } from "./skills-scanner.js";
import { discoverMcps } from "./mcps-scanner.js";

const REGISTRY_DIR = process.env.REGISTRY_DIR ?? join(process.cwd(), "..", "..");
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("GITHUB_TOKEN required");
  process.exit(1);
}

type PresetSource = PresetEntry["source"];
interface RootIndexEntry {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  components?: string[];
  version: string;
  tested_on: string;
  author: string;
  source?: PresetSource;
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
      const readme = await fetchReadme(octokit, hit.repo);
      const entry = normalizeToPreset(hit, score, readme);
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

  // Build root index by walking presets/*/preset.json — this way the index always
  // reflects on-disk state, and a partial/rate-limited scan never shrinks it.
  const presetsDir = join(REGISTRY_DIR, "presets");
  const rootEntries: RootIndexEntry[] = [];
  if (existsSync(presetsDir)) {
    for (const dirent of await readdir(presetsDir, { withFileTypes: true })) {
      if (!dirent.isDirectory()) continue;
      const presetJsonPath = join(presetsDir, dirent.name, "preset.json");
      if (!existsSync(presetJsonPath)) continue;
      try {
        const m = JSON.parse(await readFile(presetJsonPath, "utf8"));
        rootEntries.push({
          id: m.id,
          name: m.name,
          description: m.description,
          tags: m.tags ?? [],
          components: m.components ?? Object.keys(m.files ?? {}),
          version: m.version,
          tested_on: m.tested_on,
          author: m.author,
          ...(m.source ? { source: m.source } : {}),
        });
      } catch {
        // Skip unparseable preset.json
      }
    }
  }
  // Stable order: curated alphabetical first, then auto-discovered by stars desc.
  rootEntries.sort((a, b) => {
    const aAuto = !!a.source;
    const bAuto = !!b.source;
    if (aAuto !== bAuto) return aAuto ? 1 : -1;
    if (aAuto && bAuto) return (b.source!.stars ?? 0) - (a.source!.stars ?? 0);
    return a.id.localeCompare(b.id);
  });

  const rootIndexPath = join(REGISTRY_DIR, "index.json");
  await writeFile(
    rootIndexPath,
    JSON.stringify(
      { version: "1", updated_at: new Date().toISOString(), presets: rootEntries },
      null,
      2,
    ),
  );

  // Clean up old auto-discovered/ subdirectory if it exists (legacy from earlier scanner version).
  const legacyDir = join(REGISTRY_DIR, "presets", "auto-discovered");
  if (existsSync(legacyDir)) {
    await rm(legacyDir, { recursive: true, force: true });
  }

  const auto = rootEntries.filter((e) => e.source).length;
  const curatedN = rootEntries.length - auto;
  console.log(
    `[presets] this run accepted ${accepted.length} new entries; index now has ${rootEntries.length} (${curatedN} curated + ${auto} auto-discovered)`,
  );

  // ── Skills namespace ────────────────────────────────────────────────────────
  try {
    await discoverSkills(octokit, REGISTRY_DIR);
  } catch (e) {
    console.error(`[skills] discovery failed: ${e}`);
  }

  // ── MCPs namespace ──────────────────────────────────────────────────────────
  try {
    await discoverMcps(octokit, REGISTRY_DIR);
  } catch (e) {
    console.error(`[mcps] discovery failed: ${e}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
