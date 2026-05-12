/**
 * Walks presets/ and rebuilds index.json from on-disk preset.json files.
 * Use after manual filesystem changes that index.json got out of sync with.
 */
import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const REGISTRY_DIR = process.env.REGISTRY_DIR ?? join(process.cwd(), "..", "..");
const PRESETS_DIR = join(REGISTRY_DIR, "presets");
const INDEX_PATH = join(REGISTRY_DIR, "index.json");

interface RootIndexEntry {
  id: string;
  name: string;
  description: string;
  tags: string[];
  components: string[];
  tested_on: string;
  author: string;
  source?: unknown;
}

async function main() {
  const entries: RootIndexEntry[] = [];
  for (const d of await readdir(PRESETS_DIR, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const p = join(PRESETS_DIR, d.name, "preset.json");
    if (!existsSync(p)) continue;
    try {
      const m = JSON.parse(await readFile(p, "utf8"));
      entries.push({
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
      console.warn(`unparseable: ${p}`);
    }
  }
  entries.sort((a, b) => {
    const aAuto = !!a.source;
    const bAuto = !!b.source;
    if (aAuto !== bAuto) return aAuto ? 1 : -1;
    if (aAuto && bAuto) {
      const aStars = (a.source as { stars?: number } | undefined)?.stars ?? 0;
      const bStars = (b.source as { stars?: number } | undefined)?.stars ?? 0;
      return bStars - aStars;
    }
    return a.id.localeCompare(b.id);
  });
  await writeFile(
    INDEX_PATH,
    JSON.stringify(
      { version: "1", updated_at: new Date().toISOString(), presets: entries },
      null,
      2,
    ),
  );
  console.log(`Rebuilt index.json with ${entries.length} entries from ${PRESETS_DIR}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
