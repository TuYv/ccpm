/**
 * Recomputes each skill's topic `category` using classifySkill(), operating on
 * skills/index.json in place: every existing entry is preserved, only its
 * `category` is updated. Per-skill skill.json files are synced best-effort when
 * present on disk.
 *
 * Index-driven (not dir-driven) on purpose: the published index may legitimately
 * hold more entries than there are local skill dirs, so rebuilding from dirs
 * would silently drop entries. Use after changing the classifier rules.
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { classifySkill } from "./classify.js";

const REGISTRY_DIR = process.env.REGISTRY_DIR ?? join(process.cwd(), "..", "..");
const SKILLS_DIR = join(REGISTRY_DIR, "skills");
const INDEX_PATH = join(SKILLS_DIR, "index.json");

interface SkillEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  summary_zh?: string | null;
  source?: { readme?: string | null } | null;
  [k: string]: unknown;
}

interface SkillIndex {
  version: string;
  updated_at: string;
  skills: SkillEntry[];
}

async function main() {
  if (!existsSync(INDEX_PATH)) {
    console.error(`skills index not found: ${INDEX_PATH}`);
    process.exit(1);
  }

  const index: SkillIndex = JSON.parse(await readFile(INDEX_PATH, "utf8"));
  const tally = new Map<string, number>();
  let changed = 0;

  for (const skill of index.skills) {
    const category = classifySkill({
      name: skill.name,
      description: skill.description,
      summary_zh: skill.summary_zh,
      readme: skill.source?.readme ?? null,
    });
    if (skill.category !== category) {
      skill.category = category;
      changed++;
      // Sync the per-skill JSON when it exists locally (best-effort).
      const skillJsonPath = join(SKILLS_DIR, skill.id, "skill.json");
      if (existsSync(skillJsonPath)) {
        try {
          const onDisk = JSON.parse(await readFile(skillJsonPath, "utf8"));
          onDisk.category = category;
          await writeFile(skillJsonPath, JSON.stringify(onDisk, null, 2));
        } catch {
          // Leave the on-disk file untouched if unreadable.
        }
      }
    }
    tally.set(category, (tally.get(category) ?? 0) + 1);
  }

  index.skills.sort(
    (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  );
  index.updated_at = new Date().toISOString();
  await writeFile(INDEX_PATH, JSON.stringify(index, null, 2));

  const dist = [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `${c}=${n}`)
    .join("  ");
  console.log(
    `Reclassified ${index.skills.length} skills (${changed} changed). Distribution: ${dist}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
