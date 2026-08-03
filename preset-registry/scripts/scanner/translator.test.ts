import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runTranslations } from "./translator.js";

const ENV_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_BASE_URL",
  "TRANSLATION_MODEL",
  "TRANSLATION_CONCURRENCY",
  "TRANSLATION_MAX_PER_RUN",
] as const;

async function createRegistry(): Promise<string> {
  const registryDir = await mkdtemp(join(tmpdir(), "ccpm-translator-"));
  const skillDir = join(registryDir, "skills", "example-skill");
  await mkdir(skillDir, { recursive: true });

  const skill = {
    id: "example-skill",
    name: "Example Skill",
    description: "Helps developers test translation pipelines.",
    source: {
      repo: "example/example",
      readme: "A reusable tool for testing registry translations.",
    },
  };
  await writeFile(join(skillDir, "skill.json"), JSON.stringify(skill, null, 2));
  await writeFile(
    join(registryDir, "skills", "index.json"),
    JSON.stringify({ version: "1", skills: [skill] }, null, 2),
  );
  return registryDir;
}

async function withTranslationEnv(
  fetchImpl: typeof fetch,
  run: (registryDir: string) => Promise<void>,
): Promise<void> {
  const previousEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  const previousFetch = globalThis.fetch;
  const registryDir = await createRegistry();

  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_BASE_URL = "https://example.test/v1";
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_BASE_URL;
  process.env.TRANSLATION_MODEL = "test-model";
  process.env.TRANSLATION_CONCURRENCY = "1";
  process.env.TRANSLATION_MAX_PER_RUN = "1";
  globalThis.fetch = fetchImpl;

  try {
    await run(registryDir);
  } finally {
    globalThis.fetch = previousFetch;
    for (const key of ENV_KEYS) {
      const value = previousEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(registryDir, { recursive: true, force: true });
  }
}

test("fails the run when every attempted translation fails", { concurrency: false }, async () => {
  let calls = 0;
  const fetchImpl = (async () => {
    calls += 1;
    return new Response(
      JSON.stringify({ error: { message: "model not found", type: "model_not_found" } }),
      { status: 404, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  await withTranslationEnv(fetchImpl, async (registryDir) => {
    await assert.rejects(
      runTranslations(registryDir),
      /all 1 attempted translations failed; check TRANSLATION_MODEL, API credentials, and base URL/,
    );
  });
  assert.equal(calls, 1);
});

test("persists a successful translation without failing the run", { concurrency: false }, async () => {
  const fetchImpl = (async () =>
    new Response(
      JSON.stringify({ choices: [{ message: { content: "用于测试 Registry 翻译流程。" } }] }),
      { status: 200, headers: { "content-type": "application/json" } },
    )) as typeof fetch;

  await withTranslationEnv(fetchImpl, async (registryDir) => {
    await runTranslations(registryDir);

    const skill = JSON.parse(
      await readFile(join(registryDir, "skills", "example-skill", "skill.json"), "utf8"),
    );
    const cache = JSON.parse(await readFile(join(registryDir, "translations.json"), "utf8"));
    assert.equal(skill.summary_zh, "用于测试 Registry 翻译流程。");
    assert.equal(cache.entries["skill:example-skill"].summary_zh, skill.summary_zh);
  });
});
