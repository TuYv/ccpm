// Translation backfill: generates Chinese `summary_zh` for every preset / skill / mcp
// so the desktop app can show a quick "what is this and what's it for" line to CN users.
//
// Persistence model: scanner overwrites per-item JSON on every run, so we cannot rely
// on summary_zh living solely there. Source of truth is `<registryDir>/translations.json`,
// keyed by `${type}:${id}` with a content hash. After translation we mirror the
// summary into per-item JSONs and patch the three index.json files so the client
// can read summary_zh without loading the cache.
//
// Configuration (env):
//   ANTHROPIC_API_KEY        — required; if absent, this step is a no-op (logged)
//   ANTHROPIC_BASE_URL       — optional; override API endpoint (relay / proxy / CodePlan)
//   TRANSLATION_MODEL        — default "claude-haiku-4-5"
//   TRANSLATION_README_CHARS  — default 2000 (readme truncation, by character count)
//   TRANSLATION_CONCURRENCY   — default 3 (parallel API calls)
//   TRANSLATION_MAX_PER_RUN   — default 200 (new/stale translations per scanner run; <=0 means unlimited)
//
// On per-item API failure: log and continue. Never fails the workflow.

import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

type EntryType = "preset" | "skill" | "mcp";

interface CacheEntry {
  hash: string;
  summary_zh: string;
  translated_at: string;
}

interface TranslationsCache {
  version: "1";
  updated_at: string;
  entries: Record<string, CacheEntry>;
}

interface ItemSpec {
  type: EntryType;
  id: string;
  filePath: string;
  data: any;
}

interface RunOpts {
  registryDir: string;
  apiKey: string;
  baseURL?: string;
  model: string;
  readmeChars: number;
  concurrency: number;
  maxTranslationsPerRun: number;
}

interface TranslationBudget {
  tryTake(): boolean;
  remaining(): number;
}

function parseMaxTranslationsPerRun(value: string | undefined): number {
  if (!value) return 200;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 200;
  return Math.floor(parsed);
}

function createTranslationBudget(max: number): TranslationBudget {
  let remaining = max > 0 ? max : Number.POSITIVE_INFINITY;
  return {
    tryTake() {
      if (remaining <= 0) return false;
      remaining -= 1;
      return true;
    },
    remaining() {
      return remaining;
    },
  };
}

function formatBudget(value: number): string {
  return Number.isFinite(value) ? String(value) : "unlimited";
}

const PROMPT_SYSTEM =
  "你是一名技术写作者，帮助中文用户快速理解开源工具的用途。" +
  "根据给定的英文项目信息，输出一句中文摘要，描述「它是什么 + 能解决什么问题 / 适合什么场景」。" +
  "要求：80 字以内；不要前缀（如『摘要：』）；不要 Markdown；不要罗列特性；不要复述项目名；保持自然口语，避免翻译腔。";

const BUNDLE_PROMPT_SYSTEM =
  "你是一名技术写作者，帮助中文用户快速理解开源工具集的整体用途。" +
  "根据给定的英文项目信息（一组配合使用的技能/工具），输出一句中文摘要，描述「这套合集解决什么场景、组合起来的价值是什么」。" +
  "要求：80 字以内；不要前缀；不要 Markdown；不要罗列每个成员；保持自然口语，避免翻译腔；强调合集的整体定位而非单个成员。";

interface BundleSpec {
  id: string;          // slug, e.g. "jimliu-baoyu-skills"
  repo: string;        // upstream, e.g. "JimLiu/baoyu-skills"
  name: string;        // display name
  url: string;
  kind: "skill";       // future: could grow to "preset" / "mcp" bundles
  skill_ids: string[];
  stars: number;
  readme: string;
  members: Array<{ id: string; name: string; description: string }>;
}

function buildUserPrompt(item: ItemSpec, readmeChars: number): string {
  const d = item.data ?? {};
  const name = d.name ?? d.id ?? "(unknown)";
  const desc = d.description ?? "";
  const tags = Array.isArray(d.tags) ? d.tags.join(", ") : "";
  const readme: string = d.source?.readme ?? "";
  const readmeSlice = readme.slice(0, readmeChars);

  return [
    `项目名: ${name}`,
    `英文描述: ${desc}`,
    tags ? `标签: ${tags}` : "",
    readmeSlice ? `README 片段:\n${readmeSlice}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function contentHash(item: ItemSpec, readmeChars: number): string {
  const d = item.data ?? {};
  const payload = JSON.stringify({
    description: d.description ?? "",
    tags: d.tags ?? [],
    readme: (d.source?.readme ?? "").slice(0, readmeChars),
  });
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

async function loadCache(path: string): Promise<TranslationsCache> {
  if (!existsSync(path)) {
    return { version: "1", updated_at: new Date().toISOString(), entries: {} };
  }
  try {
    const raw = JSON.parse(await readFile(path, "utf8"));
    if (raw?.version === "1" && raw.entries && typeof raw.entries === "object") {
      return raw as TranslationsCache;
    }
  } catch {
    // fall through, return empty
  }
  return { version: "1", updated_at: new Date().toISOString(), entries: {} };
}

async function collectItems(registryDir: string): Promise<ItemSpec[]> {
  const items: ItemSpec[] = [];

  const sources: Array<{ dir: string; type: EntryType; manifest: string }> = [
    { dir: "presets", type: "preset", manifest: "preset.json" },
    { dir: "skills", type: "skill", manifest: "skill.json" },
    { dir: "mcps", type: "mcp", manifest: "mcp.json" },
  ];

  for (const src of sources) {
    const root = join(registryDir, src.dir);
    if (!existsSync(root)) continue;
    for (const dirent of await readdir(root, { withFileTypes: true })) {
      if (!dirent.isDirectory()) continue;
      const filePath = join(root, dirent.name, src.manifest);
      if (!existsSync(filePath)) continue;
      try {
        const data = JSON.parse(await readFile(filePath, "utf8"));
        items.push({
          type: src.type,
          id: data.id ?? dirent.name,
          filePath,
          data,
        });
      } catch {
        // unparseable — skip
      }
    }
  }

  return items;
}

async function translate(client: Anthropic, model: string, item: ItemSpec, readmeChars: number): Promise<string> {
  const resp = await client.messages.create({
    model,
    max_tokens: 200,
    system: PROMPT_SYSTEM,
    messages: [{ role: "user", content: buildUserPrompt(item, readmeChars) }],
  });
  const block = resp.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return "";
  return block.text.trim();
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= tasks.length) break;
      try {
        await tasks[i]();
      } catch {
        // task itself logs; never let one rejection take down the worker
      }
    }
  });
  await Promise.all(workers);
}

function slugifyRepo(repo: string): string {
  return repo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function bundleDisplayName(repo: string): string {
  const base = repo.split("/").pop() ?? repo;
  return base
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function collectSkillBundles(items: ItemSpec[]): BundleSpec[] {
  const byRepo = new Map<string, ItemSpec[]>();
  for (const item of items) {
    if (item.type !== "skill") continue;
    const repo: string | undefined = item.data?.source?.repo;
    if (!repo) continue;
    if (!byRepo.has(repo)) byRepo.set(repo, []);
    byRepo.get(repo)!.push(item);
  }

  const bundles: BundleSpec[] = [];
  for (const [repo, members] of byRepo) {
    if (members.length < 2) continue;
    members.sort((a, b) => a.id.localeCompare(b.id));
    const first = members[0];
    bundles.push({
      id: slugifyRepo(repo),
      repo,
      name: bundleDisplayName(repo),
      url: first.data?.source?.url ?? `https://github.com/${repo}`,
      kind: "skill",
      skill_ids: members.map((m) => m.id),
      stars: Number(first.data?.source?.stars ?? 0),
      readme: String(first.data?.source?.readme ?? ""),
      members: members.map((m) => ({
        id: m.id,
        name: String(m.data?.name ?? m.id),
        description: String(m.data?.description ?? ""),
      })),
    });
  }
  bundles.sort((a, b) => (b.stars - a.stars) || a.id.localeCompare(b.id));
  return bundles;
}

function buildBundleUserPrompt(b: BundleSpec, readmeChars: number): string {
  const readmeSlice = b.readme.slice(0, readmeChars);
  const memberLines = b.members
    .slice(0, 10)
    .map((m) => `- ${m.name}: ${m.description.slice(0, 100)}`)
    .join("\n");
  return [
    `项目仓库: ${b.repo}`,
    `成员数量: ${b.skill_ids.length}`,
    readmeSlice ? `README 片段:\n${readmeSlice}` : "",
    `主要成员（前 10 个）:\n${memberLines}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function bundleContentHash(b: BundleSpec, readmeChars: number): string {
  const payload = JSON.stringify({
    repo: b.repo,
    members: b.members.map((m) => ({ id: m.id, desc: m.description })),
    readme: b.readme.slice(0, readmeChars),
  });
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

async function translateBundle(
  client: Anthropic,
  model: string,
  b: BundleSpec,
  readmeChars: number,
): Promise<string> {
  const resp = await client.messages.create({
    model,
    max_tokens: 200,
    system: BUNDLE_PROMPT_SYSTEM,
    messages: [{ role: "user", content: buildBundleUserPrompt(b, readmeChars) }],
  });
  const block = resp.content.find((c) => c.type === "text");
  if (!block || block.type !== "text") return "";
  return block.text.trim();
}

async function writeSkillBundlesIndex(
  registryDir: string,
  bundles: BundleSpec[],
  cache: TranslationsCache,
): Promise<void> {
  const bundlesDir = join(registryDir, "bundles");
  if (!existsSync(bundlesDir)) {
    await mkdir(bundlesDir, { recursive: true });
  }
  const out = {
    version: "1",
    updated_at: new Date().toISOString(),
    bundles: bundles.map((b) => ({
      id: b.id,
      repo: b.repo,
      name: b.name,
      url: b.url,
      kind: b.kind,
      stars: b.stars,
      skill_ids: b.skill_ids,
      summary_zh:
        cache.entries[`bundle:${b.id}`]?.summary_zh ??
        `来自 ${b.repo} 的 ${b.skill_ids.length} 个相关技能合集，适合按同一主题成组浏览和按需安装。`,
    })),
  };
  await writeFile(join(bundlesDir, "index.json"), JSON.stringify(out, null, 2));
}

async function runBundleTranslations(
  client: Anthropic,
  opts: RunOpts,
  cache: TranslationsCache,
  items: ItemSpec[],
  budget: TranslationBudget,
): Promise<{ total: number; hits: number; misses: number; failures: number; deferred: number }> {
  const bundles = collectSkillBundles(items);
  let hits = 0;
  let misses = 0;
  let failures = 0;
  let deferred = 0;

  const tasks = bundles.map((b) => async () => {
    const key = `bundle:${b.id}`;
    const hash = bundleContentHash(b, opts.readmeChars);
    const cached = cache.entries[key];
    if (cached?.hash === hash && cached.summary_zh) {
      hits++;
      return;
    }
    if (!budget.tryTake()) {
      deferred++;
      return;
    }
    try {
      const summary = await translateBundle(client, opts.model, b, opts.readmeChars);
      if (!summary) {
        failures++;
        console.warn(`[translate] empty bundle summary for ${key}`);
        return;
      }
      cache.entries[key] = {
        hash,
        summary_zh: summary,
        translated_at: new Date().toISOString(),
      };
      misses++;
      console.log(`[translate] ${key} (${summary.length} chars, ${b.skill_ids.length} skills)`);
    } catch (e) {
      failures++;
      console.warn(`[translate] failed ${key}: ${(e as Error).message}`);
    }
  });

  await runWithConcurrency(tasks, opts.concurrency);

  await writeSkillBundlesIndex(opts.registryDir, bundles, cache);

  return { total: bundles.length, hits, misses, failures, deferred };
}

async function patchIndex(
  registryDir: string,
  relPath: string,
  listKey: string,
  cache: TranslationsCache,
  type: EntryType,
): Promise<void> {
  const indexPath = join(registryDir, relPath);
  if (!existsSync(indexPath)) return;
  let raw: any;
  try {
    raw = JSON.parse(await readFile(indexPath, "utf8"));
  } catch {
    return;
  }
  const list = raw?.[listKey];
  if (!Array.isArray(list)) return;
  for (const entry of list) {
    if (!entry?.id) continue;
    const cached = cache.entries[`${type}:${entry.id}`];
    if (cached?.summary_zh) {
      entry.summary_zh = cached.summary_zh;
    } else if ("summary_zh" in entry) {
      delete entry.summary_zh;
    }
  }
  await writeFile(indexPath, JSON.stringify(raw, null, 2));
}

export async function runTranslations(registryDir: string): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const cachePath = join(registryDir, "translations.json");
  const cache = await loadCache(cachePath);
  const items = await collectItems(registryDir);

  if (!apiKey) {
    console.log("[translate] ANTHROPIC_API_KEY not set, applying cached summaries only");
    for (const item of items) {
      const cached = cache.entries[`${item.type}:${item.id}`];
      if (cached?.summary_zh && item.data.summary_zh !== cached.summary_zh) {
        item.data.summary_zh = cached.summary_zh;
        await writeFile(item.filePath, JSON.stringify(item.data, null, 2));
      }
    }
    await writeSkillBundlesIndex(registryDir, collectSkillBundles(items), cache);
    await patchIndex(registryDir, "index.json", "presets", cache, "preset");
    await patchIndex(registryDir, "skills/index.json", "skills", cache, "skill");
    await patchIndex(registryDir, "mcps/index.json", "mcps", cache, "mcp");
    return;
  }
  const opts: RunOpts = {
    registryDir,
    apiKey,
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
    model: process.env.TRANSLATION_MODEL ?? "claude-haiku-4-5",
    readmeChars: Number(process.env.TRANSLATION_README_CHARS ?? "2000"),
    concurrency: Number(process.env.TRANSLATION_CONCURRENCY ?? "3"),
    maxTranslationsPerRun: parseMaxTranslationsPerRun(process.env.TRANSLATION_MAX_PER_RUN),
  };
  const budget = createTranslationBudget(opts.maxTranslationsPerRun);
  console.log(`[translate] max new/stale translations this run: ${formatBudget(budget.remaining())}`);

  const client = new Anthropic({
    apiKey: opts.apiKey,
    ...(opts.baseURL ? { baseURL: opts.baseURL } : {}),
  });
  if (opts.baseURL) {
    console.log(`[translate] using custom base URL: ${opts.baseURL}`);
  }

  const bundleResult = await runBundleTranslations(client, opts, cache, items, budget);

  let hits = 0;
  let misses = 0;
  let failures = 0;
  let deferred = 0;

  const tasks = items.map((item) => async () => {
    const key = `${item.type}:${item.id}`;
    const hash = contentHash(item, opts.readmeChars);
    const cached = cache.entries[key];

    if (cached && cached.hash === hash && cached.summary_zh) {
      hits++;
      // Mirror summary back into per-item JSON (scanner may have wiped it).
      if (item.data.summary_zh !== cached.summary_zh) {
        item.data.summary_zh = cached.summary_zh;
        await writeFile(item.filePath, JSON.stringify(item.data, null, 2));
      }
      return;
    }

    if (!budget.tryTake()) {
      deferred++;
      return;
    }

    try {
      const summary = await translate(client, opts.model, item, opts.readmeChars);
      if (!summary) {
        failures++;
        console.warn(`[translate] empty summary for ${key}`);
        return;
      }
      cache.entries[key] = {
        hash,
        summary_zh: summary,
        translated_at: new Date().toISOString(),
      };
      item.data.summary_zh = summary;
      await writeFile(item.filePath, JSON.stringify(item.data, null, 2));
      misses++;
      console.log(`[translate] ${key} (${summary.length} chars)`);
    } catch (e) {
      failures++;
      console.warn(`[translate] failed ${key}: ${(e as Error).message}`);
    }
  });

  await runWithConcurrency(tasks, opts.concurrency);

  cache.updated_at = new Date().toISOString();
  await writeFile(cachePath, JSON.stringify(cache, null, 2));

  await patchIndex(registryDir, "index.json", "presets", cache, "preset");
  await patchIndex(registryDir, "skills/index.json", "skills", cache, "skill");
  await patchIndex(registryDir, "mcps/index.json", "mcps", cache, "mcp");

  console.log(
    `[translate] done. items=${items.length} cache_hits=${hits} translated=${misses} failed=${failures} deferred=${deferred} | bundles=${bundleResult.total} hits=${bundleResult.hits} translated=${bundleResult.misses} failed=${bundleResult.failures} deferred=${bundleResult.deferred} budget_remaining=${formatBudget(budget.remaining())}`,
  );
}
