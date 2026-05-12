/**
 * Re-evaluates every auto-discovered preset in presets/ against the new
 * sharing-repo discriminator. Reports what would be removed; with --apply,
 * moves rejected entries to presets-legacy-backup/ and rebuilds index.json.
 *
 *   npx tsx purge-non-sharing.ts              # dry run
 *   npx tsx purge-non-sharing.ts --apply      # actually move
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SearchHit } from "./searcher.js";
import { detectShareSignals, isSharingRepo } from "./scorer.js";
import type { PresetSource } from "./normalizer.js";

const REGISTRY_DIR = process.env.REGISTRY_DIR ?? join(process.cwd(), "..", "..");
const PRESETS_DIR = join(REGISTRY_DIR, "presets");
const BACKUP_DIR = join(REGISTRY_DIR, "presets-legacy-backup");
const APPLY = process.argv.includes("--apply");

interface PresetFile {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  tested_on?: string;
  author?: string;
  files?: Record<string, string>;
  source?: PresetSource;
}

function fakeHitFromSource(p: PresetFile): SearchHit {
  const s = p.source!;
  return {
    repo: s.repo,
    default_branch: s.branch,
    stars: s.stars,
    path: s.path,
    pushed_at: s.pushed_at,
    description: p.description ?? null,
    topics: p.tags ?? [],
    language: s.language,
    homepage: s.homepage ?? null,
    license: s.license,
    // Old presets never captured .claude-plugin/skills probe — leave undefined.
    signals: undefined,
    curated_by: s.curated_by,
  };
}

async function main() {
  if (!existsSync(PRESETS_DIR)) {
    console.error(`No presets dir at ${PRESETS_DIR}`);
    process.exit(1);
  }

  const dirents = await readdir(PRESETS_DIR, { withFileTypes: true });
  const verdicts: { id: string; keep: boolean; reason: string; source: boolean }[] = [];

  for (const d of dirents) {
    if (!d.isDirectory()) continue;
    const dir = join(PRESETS_DIR, d.name);
    const presetJson = join(dir, "preset.json");
    const claudeMd = join(dir, "CLAUDE.md");
    if (!existsSync(presetJson)) continue;

    let p: PresetFile;
    try {
      p = JSON.parse(await readFile(presetJson, "utf8"));
    } catch {
      verdicts.push({ id: d.name, keep: true, reason: "unparseable preset.json — leaving alone", source: false });
      continue;
    }

    // Curated (no source field) entries are user-blessed — never touch.
    if (!p.source) {
      verdicts.push({ id: d.name, keep: true, reason: "curated (no source field)", source: false });
      continue;
    }

    const content = existsSync(claudeMd) ? await readFile(claudeMd, "utf8") : "";
    const hit = fakeHitFromSource(p);
    const signals = detectShareSignals(hit, content, p.source.readme ?? null);
    const sharing = isSharingRepo(signals);

    if (sharing) {
      const why = [
        signals.is_markdown_lang && "Markdown lang",
        signals.has_claude_plugin && ".claude-plugin",
        signals.sharing_intro_match && "sharing intro",
        signals.multi_list_endorsement >= 2 && `${signals.multi_list_endorsement} awesome-lists`,
        signals.desc_keyword_hit && "desc keyword",
        signals.has_skills_dir && "skills dir",
        signals.readme_second_person && "second-person README",
        signals.not_project_self_desc && "non-self-desc CLAUDE.md",
      ].filter(Boolean).join(", ");
      verdicts.push({ id: d.name, keep: true, reason: `sharing: ${why || "weak signals"}`, source: true });
    } else {
      verdicts.push({ id: d.name, keep: false, reason: "fails sharing discriminator", source: true });
    }
  }

  const toRemove = verdicts.filter((v) => !v.keep);
  const kept = verdicts.filter((v) => v.keep);
  const keptAuto = kept.filter((v) => v.source).length;
  const keptCurated = kept.length - keptAuto;

  console.log("\n=== Verdicts ===");
  for (const v of verdicts) {
    const mark = v.keep ? "KEEP" : "DROP";
    console.log(`  [${mark}] ${v.id.padEnd(60)} ${v.reason}`);
  }
  console.log(`\nSummary: keep ${kept.length} (${keptCurated} curated + ${keptAuto} auto), drop ${toRemove.length}`);

  if (!APPLY) {
    console.log("\nDry run. Re-run with --apply to actually move rejected entries to presets-legacy-backup/.");
    return;
  }

  if (toRemove.length === 0) {
    console.log("Nothing to drop. Done.");
    return;
  }

  await mkdir(BACKUP_DIR, { recursive: true });
  for (const v of toRemove) {
    const src = join(PRESETS_DIR, v.id);
    const dst = join(BACKUP_DIR, v.id);
    try {
      await rename(src, dst);
      console.log(`  moved ${v.id} → presets-legacy-backup/`);
    } catch (e) {
      console.warn(`  failed to move ${v.id}: ${e}`);
    }
  }

  // Rebuild index.json from the surviving on-disk presets so callers see fresh state.
  const surviving: unknown[] = [];
  for (const d of await readdir(PRESETS_DIR, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const presetJson = join(PRESETS_DIR, d.name, "preset.json");
    if (!existsSync(presetJson)) continue;
    try {
      const m = JSON.parse(await readFile(presetJson, "utf8"));
      surviving.push({
        id: m.id,
        name: m.name,
        description: m.description,
        tags: m.tags ?? [],
        components: m.components ?? Object.keys(m.files ?? {}),
        tested_on: m.tested_on,
        author: m.author,
        ...(m.source ? { source: m.source } : {}),
      });
    } catch {
      // skip
    }
  }
  await writeFile(
    join(REGISTRY_DIR, "index.json"),
    JSON.stringify(
      { version: "1", updated_at: new Date().toISOString(), presets: surviving },
      null,
      2,
    ),
  );
  console.log(`\nindex.json rebuilt with ${surviving.length} entries.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
