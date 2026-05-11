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
//   TRANSLATION_README_CHARS — default 2000 (readme truncation, by character count)
//   TRANSLATION_CONCURRENCY  — default 3 (parallel API calls)
//
// On per-item API failure: log and continue. Never fails the workflow.

import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
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
}

const PROMPT_SYSTEM =
  "你是一名技术写作者，帮助中文用户快速理解开源工具的用途。" +
  "根据给定的英文项目信息，输出一句中文摘要，描述「它是什么 + 能解决什么问题 / 适合什么场景」。" +
  "要求：80 字以内；不要前缀（如『摘要：』）；不要 Markdown；不要罗列特性；不要复述项目名；保持自然口语，避免翻译腔。";

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
  if (!apiKey) {
    console.log("[translate] ANTHROPIC_API_KEY not set, skipping translation step");
    return;
  }
  const opts: RunOpts = {
    registryDir,
    apiKey,
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
    model: process.env.TRANSLATION_MODEL ?? "claude-haiku-4-5",
    readmeChars: Number(process.env.TRANSLATION_README_CHARS ?? "2000"),
    concurrency: Number(process.env.TRANSLATION_CONCURRENCY ?? "3"),
  };

  const cachePath = join(registryDir, "translations.json");
  const cache = await loadCache(cachePath);
  const items = await collectItems(registryDir);

  const client = new Anthropic({
    apiKey: opts.apiKey,
    ...(opts.baseURL ? { baseURL: opts.baseURL } : {}),
  });
  if (opts.baseURL) {
    console.log(`[translate] using custom base URL: ${opts.baseURL}`);
  }

  let hits = 0;
  let misses = 0;
  let failures = 0;

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
    `[translate] done. items=${items.length} cache_hits=${hits} translated=${misses} failed=${failures}`,
  );
}
