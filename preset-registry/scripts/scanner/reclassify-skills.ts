/**
 * 合集定分类：合集内 skill 的 category 全部继承所属合集的分类（skill 跟着合集走）；
 * 不在任何合集里的单例 skill 用自身文本分类（单例 repo 即它自己的合集）。
 *
 * 直接改写 skills/index.json 与 bundles/index.json，纯本地、不需要 API。
 * 改了 classify 规则后跑一次即可，无需重新全量扫描。
 *
 * Index-driven（不扫目录）：已发布的索引可能比本地目录多，扫目录会静默丢条目。
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { classifyBundle, classifySkill, type SkillCategory } from "./classify.js";

const REGISTRY_DIR = process.env.REGISTRY_DIR ?? join(process.cwd(), "..", "..");
const SKILLS_INDEX = join(REGISTRY_DIR, "skills", "index.json");
const BUNDLES_INDEX = join(REGISTRY_DIR, "bundles", "index.json");

interface SkillEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  summary_zh?: string | null;
  source?: { readme?: string | null } | null;
  [k: string]: unknown;
}

interface BundleEntry {
  id: string;
  name: string;
  summary_zh?: string | null;
  skill_ids: string[];
  category?: string;
  [k: string]: unknown;
}

async function main() {
  if (!existsSync(SKILLS_INDEX)) {
    console.error(`skills index not found: ${SKILLS_INDEX}`);
    process.exit(1);
  }

  const skillIndex = JSON.parse(await readFile(SKILLS_INDEX, "utf8"));
  const skills: SkillEntry[] = skillIndex.skills;
  const byId = new Map(skills.map((s) => [s.id, s]));

  const bundlesRaw = existsSync(BUNDLES_INDEX)
    ? JSON.parse(await readFile(BUNDLES_INDEX, "utf8"))
    : { bundles: [] };
  const bundles: BundleEntry[] = bundlesRaw.bundles ?? [];

  // 1) 每个合集算一个分类，成员继承。分类信号取合集自身描述：合集名 + 中文摘要 +
  //    首个成员的 README + 成员名/描述。
  const skillCategory = new Map<string, SkillCategory>();
  for (const b of bundles) {
    const members = b.skill_ids
      .map((id) => byId.get(id))
      .filter((s): s is SkillEntry => Boolean(s));
    const readme = members.find((m) => m.source?.readme)?.source?.readme ?? null;
    const category = classifyBundle({
      name: b.name,
      summary_zh: b.summary_zh,
      readme,
    });
    b.category = category;
    for (const id of b.skill_ids) skillCategory.set(id, category);
  }

  // 2) 落到每个 skill：合集内继承；单例（不在任何合集）用自身文本分类。
  const tally = new Map<string, number>();
  let changed = 0;
  let singletons = 0;
  for (const s of skills) {
    let category = skillCategory.get(s.id);
    if (!category) {
      singletons++;
      category = classifySkill({
        name: s.name,
        description: s.description,
        summary_zh: s.summary_zh,
        readme: s.source?.readme ?? null,
      });
    }
    if (s.category !== category) {
      s.category = category;
      changed++;
    }
    tally.set(category, (tally.get(category) ?? 0) + 1);
  }

  skills.sort(
    (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  );
  skillIndex.updated_at = new Date().toISOString();
  await writeFile(SKILLS_INDEX, JSON.stringify(skillIndex, null, 2));

  if (bundles.length > 0) {
    // b.category 已就地写到 bundlesRaw.bundles 上，直接落盘。
    bundlesRaw.updated_at = new Date().toISOString();
    await writeFile(BUNDLES_INDEX, JSON.stringify(bundlesRaw, null, 2));
  }

  const dist = [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `${c}=${n}`)
    .join("  ");
  console.log(
    `合集定分类完成：${skills.length} 个 skill（${changed} 改动，${singletons} 单例自分类，${bundles.length} 合集）。分布：${dist}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
