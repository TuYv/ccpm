# Skill / MCP Source Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Skills and MCP pages to feature parity with the Presets page — surface the upstream GitHub source on every item via a clickable button, and showcase upstream README plus star/language signals so users can judge "what makes this excellent" at a glance.

**Architecture:** Three phases: (1) repair the broken serde plumbing so `source` actually flows from registry JSON → Rust → IPC → TypeScript (same root cause we just fixed for presets); (2) extend the existing skill/mcp scanners and backfill scripts to capture `stars / language / pushed_at / readme` (currently only `repo / url / branch / path / discovered_at` are persisted); (3) wire the data into the existing card-based detail UIs as a GitHub button, repo meta line, freshness/star chips, and a collapsible "Upstream README" panel rendered through `MarkdownPreview`.

**Tech Stack:** Rust + serde for `crates/core/src/types.rs`; `tauri-plugin-shell` already in place via `openExternal`; React + inline-styled `card`/`SectionLabel` components in `apps/desktop/src/pages/{SkillsPage,McpPage}.tsx`; `@octokit/rest` + `tsx` for `preset-registry/scripts/scanner/*.ts`; `react-markdown` + `rehype-highlight` already loaded through `MarkdownPreview`.

---

## File Structure

**Modify:**
- `crates/core/src/types.rs` — extend `SkillMeta` / `McpMeta`, add `SkillSource` / `McpSource`
- `apps/desktop/src/types/core.ts` — mirror Rust types
- `apps/desktop/src/pages/SkillsPage.tsx` — GitHub button, source line, README panel
- `apps/desktop/src/pages/McpPage.tsx` — same treatment
- `preset-registry/scripts/scanner/skills-scanner.ts` — enrich source with stars/language/pushed_at/readme
- `preset-registry/scripts/scanner/mcps-scanner.ts` — same enrichment
- All `preset-registry/skills/*/skill.json` (110 files) — backfilled in place
- All `preset-registry/mcps/*/mcp.json` (14 files) — backfilled in place

**Create:**
- `preset-registry/scripts/scanner/backfill-skill-readmes.ts`
- `preset-registry/scripts/scanner/backfill-mcp-readmes.ts`

**Boundaries:**
- Rust types own the registry shape (single source of truth, serde-tested).
- The TS types shadow the Rust shape and exist only because Tauri IPC strips unknowns.
- Scanner is a pure write-side concern — backfill scripts share its `fetchReadme`/source-enrichment helpers via re-export, never duplicate.
- UI changes are isolated to the two page files; `MarkdownPreview` and `openExternal` are reused unchanged.

---

## Task 1: Add `SkillSource` Rust struct + serde roundtrip

**Files:**
- Modify: `crates/core/src/types.rs:6-25`

- [ ] **Step 1: Write the failing test**

Append to the existing test module in `crates/core/src/types.rs` (find the block near line 410 where `SkillMeta` is already tested):

```rust
#[test]
fn test_skill_meta_roundtrip_with_source() {
    let json = r#"{
        "id": "anthropics-skills-pdf",
        "name": "PDF Skill",
        "description": "Read and write PDFs",
        "category": "Anthropic 官方",
        "compatible_tools": ["claude-code"],
        "version": "1.0.0",
        "author": "anthropics",
        "install_path": ".claude/skills/anthropics-skills-pdf/SKILL.md",
        "source": {
            "repo": "anthropics/skills",
            "url": "https://github.com/anthropics/skills/blob/main/pdf/SKILL.md",
            "path": "pdf/SKILL.md",
            "branch": "main",
            "discovered_at": "2026-04-29T00:00:00Z",
            "stars": 1234,
            "language": "Python",
            "pushed_at": "2026-05-01T12:00:00Z",
            "readme": "# Skills\n\nOfficial skill repo."
        }
    }"#;
    let s: SkillMeta = serde_json::from_str(json).unwrap();
    let src = s.source.expect("source must round-trip");
    assert_eq!(src.repo, "anthropics/skills");
    assert_eq!(src.stars, 1234);
    assert_eq!(src.readme.as_deref(), Some("# Skills\n\nOfficial skill repo."));
    let back = serde_json::to_string(&s).unwrap();
    assert!(back.contains("\"readme\""));
}

#[test]
fn test_skill_meta_without_source_still_parses() {
    let json = r#"{
        "id": "x", "name": "x", "description": "x", "category": "x",
        "version": "1.0.0", "author": "x", "install_path": "x"
    }"#;
    let s: SkillMeta = serde_json::from_str(json).unwrap();
    assert!(s.source.is_none());
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p ccpm-core test_skill_meta_roundtrip_with_source`
Expected: FAIL — `source` field unknown to `SkillMeta`.

- [ ] **Step 3: Add `SkillSource` struct and `source` field**

In `crates/core/src/types.rs`, replace the section around line 4-25 with:

```rust
// ── Skill registry types ──────────────────────────────────────────────────────

/// Auto-discovered skill provenance — populated by the registry scanner.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillSource {
    pub repo: String,
    pub url: String,
    pub path: String,
    pub branch: String,
    pub discovered_at: String,
    #[serde(default)]
    pub stars: Option<u64>,
    #[serde(default)]
    pub language: Option<String>,
    #[serde(default)]
    pub pushed_at: Option<String>,
    #[serde(default)]
    pub readme: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillMeta {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    #[serde(default)]
    pub compatible_tools: Vec<String>,
    pub version: String,
    pub author: String,
    /// Relative install path under scope_dir. e.g. ".claude/skills/<id>/SKILL.md"
    pub install_path: String,
    #[serde(default)]
    pub source: Option<SkillSource>,
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test -p ccpm-core test_skill_meta`
Expected: both new tests PASS, existing skill tests still PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/core/src/types.rs
git commit -m "feat(core): add SkillSource and surface source on SkillMeta"
```

---

## Task 2: Add `McpSource` Rust struct + serde roundtrip

**Files:**
- Modify: `crates/core/src/types.rs:27-58`

- [ ] **Step 1: Write the failing test**

Append to the test module:

```rust
#[test]
fn test_mcp_meta_roundtrip_with_source() {
    let json = r#"{
        "id": "modelcontextprotocol-servers-everything",
        "name": "everything",
        "description": "Reference MCP server",
        "category": "Reference",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-everything"],
        "required_env": [],
        "optional_env": [],
        "source": {
            "repo": "modelcontextprotocol/servers",
            "url": "https://github.com/modelcontextprotocol/servers/blob/main/src/everything/README.md",
            "path": "src/everything/README.md",
            "branch": "main",
            "discovered_at": "2026-04-29T00:00:00Z",
            "stars": 5000,
            "readme": "# Everything"
        }
    }"#;
    let m: McpMeta = serde_json::from_str(json).unwrap();
    let src = m.source.expect("source must round-trip");
    assert_eq!(src.repo, "modelcontextprotocol/servers");
    assert_eq!(src.stars, Some(5000));
    let back = serde_json::to_string(&m).unwrap();
    assert!(back.contains("\"readme\""));
}

#[test]
fn test_mcp_meta_without_source_still_parses() {
    let json = r#"{
        "id": "x", "name": "x", "description": "x",
        "category": "x", "command": "x"
    }"#;
    let m: McpMeta = serde_json::from_str(json).unwrap();
    assert!(m.source.is_none());
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p ccpm-core test_mcp_meta_roundtrip_with_source`
Expected: FAIL — `source` unknown.

- [ ] **Step 3: Add `McpSource` struct and `source` field**

In `crates/core/src/types.rs`, the `McpSource` struct mirrors `SkillSource` exactly (intentionally separate to allow future divergence). Add it directly above `McpMeta`:

```rust
/// Auto-discovered MCP provenance — populated by the registry scanner.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpSource {
    pub repo: String,
    pub url: String,
    pub path: String,
    pub branch: String,
    pub discovered_at: String,
    #[serde(default)]
    pub stars: Option<u64>,
    #[serde(default)]
    pub language: Option<String>,
    #[serde(default)]
    pub pushed_at: Option<String>,
    #[serde(default)]
    pub readme: Option<String>,
}
```

Then extend `McpMeta` with one field:

```rust
    #[serde(default)]
    pub optional_env: Vec<McpRequiredEnv>,
    #[serde(default)]
    pub source: Option<McpSource>,
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test -p ccpm-core test_mcp_meta`
Expected: both new tests PASS, existing mcp tests still PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/core/src/types.rs
git commit -m "feat(core): add McpSource and surface source on McpMeta"
```

---

## Task 3: Mirror `SkillSource` / `McpSource` in TypeScript

**Files:**
- Modify: `apps/desktop/src/types/core.ts:134-176`

- [ ] **Step 1: Add interfaces above `SkillMeta`**

Replace the `// ── Skills` block:

```ts
// ── Skills ───────────────────────────────────────────────────────────────────

export interface SkillSource {
  repo: string;
  url: string;
  path: string;
  branch: string;
  discovered_at: string;
  stars?: number | null;
  language?: string | null;
  pushed_at?: string | null;
  readme?: string | null;
}

export interface SkillMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  compatible_tools: string[];
  version: string;
  author: string;
  install_path: string;
  source?: SkillSource | null;
}

export interface SkillIndex {
  version: string;
  updated_at: string;
  skills: SkillMeta[];
}
```

Replace the `// ── MCPs` block similarly:

```ts
// ── MCPs ─────────────────────────────────────────────────────────────────────

export interface McpRequiredEnv {
  key: string;
  hint?: string;
  description?: string;
}

export interface McpSource {
  repo: string;
  url: string;
  path: string;
  branch: string;
  discovered_at: string;
  stars?: number | null;
  language?: string | null;
  pushed_at?: string | null;
  readme?: string | null;
}

export interface McpMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  command: string;
  args: string[];
  required_env: McpRequiredEnv[];
  optional_env: McpRequiredEnv[];
  source?: McpSource | null;
}

export interface McpIndex {
  version: string;
  updated_at: string;
  mcps: McpMeta[];
}
```

- [ ] **Step 2: Type-check**

Run: `cd apps/desktop && npx tsc --noEmit -p tsconfig.json`
Expected: EXIT 0.

- [ ] **Step 3: Commit**

```bash
git add apps/desktop/src/types/core.ts
git commit -m "feat(desktop): mirror Skill/Mcp source types from Rust"
```

---

## Task 4: GitHub button on Skills page cards

**Files:**
- Modify: `apps/desktop/src/pages/SkillsPage.tsx`

- [ ] **Step 1: Read the file end-to-end**

Run: `wc -l apps/desktop/src/pages/SkillsPage.tsx` then read the full file. Confirm where each skill card is rendered (look for `className="card"` and the card body that shows skill name + description + install button). Note the exact JSX block — every later step must reuse the same indentation and surrounding conventions.

- [ ] **Step 2: Import `openExternal` and add a GitHub icon constant**

Near the top imports, add:

```ts
import { openExternal } from "../utils/openExternal";
```

In the same style as `RefreshIcon` / `CopyIcon` already used in the codebase (see `PresetsPage.tsx` for the canonical 16×16 SVG path constant), add at module scope:

```ts
const GithubIcon = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);
```

- [ ] **Step 3: Add a "GitHub" `Button` to each skill card's action row**

Find the action row inside the skill card (the same container that holds `Install` / `Uninstall` buttons). Insert immediately before the install button:

```tsx
{skill.source?.repo && (
  <Button
    size="sm"
    variant="subtle"
    onClick={() => openExternal(`https://github.com/${skill.source!.repo}`)}
    title={`在 GitHub 中打开 ${skill.source.repo}`}
  >
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {GithubIcon}
      <span>GitHub</span>
    </span>
  </Button>
)}
```

The variable name `skill` reflects whatever the surrounding `.map((skill) => ...)` callback uses; if the existing code uses `s` or `item`, match that exactly.

- [ ] **Step 4: Type-check + visual smoke**

Run: `cd apps/desktop && npx tsc --noEmit -p tsconfig.json` → EXIT 0.
Restart Tauri (`touch apps/desktop/src-tauri/src/lib.rs` if dev is running). Open Skills tab — every card with a discovered source should now show a `GitHub` button next to its install button. Click one — the OS browser should open the correct repo URL.

- [ ] **Step 5: Commit**

```bash
git add apps/desktop/src/pages/SkillsPage.tsx
git commit -m "feat(desktop): add GitHub-open button on skill cards"
```

---

## Task 5: GitHub button on MCP page cards

**Files:**
- Modify: `apps/desktop/src/pages/McpPage.tsx`

- [ ] **Step 1: Read the file end-to-end**

Run: `wc -l apps/desktop/src/pages/McpPage.tsx` then read the full file. Locate each MCP card and its action row.

- [ ] **Step 2: Import `openExternal` and add the GitHub icon**

If `GithubIcon` is not already imported from a shared location, declare it at module scope here too — copy the same SVG constant from Task 4 Step 2 (do NOT extract into a shared module yet; only deduplicate when a third call site appears).

```ts
import { openExternal } from "../utils/openExternal";

const GithubIcon = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);
```

- [ ] **Step 3: Add the GitHub button to each MCP card's action row**

Replace `skill` with `mcp` (or whatever variable the existing `.map` callback uses):

```tsx
{mcp.source?.repo && (
  <Button
    size="sm"
    variant="subtle"
    onClick={() => openExternal(`https://github.com/${mcp.source!.repo}`)}
    title={`在 GitHub 中打开 ${mcp.source.repo}`}
  >
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {GithubIcon}
      <span>GitHub</span>
    </span>
  </Button>
)}
```

- [ ] **Step 4: Type-check + visual smoke**

Run: `cd apps/desktop && npx tsc --noEmit -p tsconfig.json` → EXIT 0.
Open MCPs tab in the running app — every card should display a GitHub button. Click one — opens the repo.

- [ ] **Step 5: Commit**

```bash
git add apps/desktop/src/pages/McpPage.tsx
git commit -m "feat(desktop): add GitHub-open button on mcp cards"
```

---

## Task 6: Extend `skills-scanner.ts` to enrich source metadata

**Files:**
- Modify: `preset-registry/scripts/scanner/skills-scanner.ts`

- [ ] **Step 1: Re-export `fetchReadme` and add a repo metadata cache**

In `searcher.ts`, `fetchReadme(octokit, repoFullName)` already exists — do not modify it. In `skills-scanner.ts`, import it and add a tiny helper `fetchRepoMeta` that calls `octokit.repos.get` once per repo (memoize across the same run since one repo yields many skills):

```ts
import { fetchReadme } from "./searcher.js";

interface RepoMeta {
  stars: number;
  language: string | null;
  pushed_at: string;
  readme: string | null;
}

const repoMetaCache = new Map<string, RepoMeta>();

async function fetchRepoMeta(octokit: Octokit, repoFullName: string): Promise<RepoMeta> {
  const cached = repoMetaCache.get(repoFullName);
  if (cached) return cached;
  const [owner, repo] = repoFullName.split("/");
  let stars = 0;
  let language: string | null = null;
  let pushed_at = "";
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    stars = data.stargazers_count ?? 0;
    language = data.language ?? null;
    pushed_at = data.pushed_at ?? "";
  } catch {
    // Leave defaults — repo may be private or rate-limited.
  }
  const readme = await fetchReadme(octokit, repoFullName);
  const meta = { stars, language, pushed_at, readme };
  repoMetaCache.set(repoFullName, meta);
  return meta;
}
```

- [ ] **Step 2: Extend `SkillSource` and the persisted skill.json shape**

Update the existing `SkillSource` interface in this file to include the new optional fields:

```ts
export interface SkillSource {
  repo: string;
  url: string;
  path: string;
  branch: string;
  discovered_at: string;
  stars?: number;
  language?: string | null;
  pushed_at?: string;
  readme?: string | null;
}
```

In the loop that emits each `SkillEntry` (search the file for the `source: {` literal), call `fetchRepoMeta` for `${owner}/${repo}` and spread the result into `source`:

```ts
const meta = await fetchRepoMeta(octokit, `${repo.owner}/${repo.name}`);
const source: SkillSource = {
  repo: `${repo.owner}/${repo.name}`,
  url: `https://github.com/${repo.owner}/${repo.name}/blob/${repo.branch}/${path}`,
  path,
  branch: repo.branch,
  discovered_at: new Date().toISOString(),
  stars: meta.stars,
  language: meta.language,
  pushed_at: meta.pushed_at,
  readme: meta.readme,
};
```

- [ ] **Step 3: Smoke-test the scanner against one repo**

Run a one-off invocation that visits a single repo to verify enrichment without burning the full quota:

```bash
cd preset-registry/scripts/scanner
GITHUB_TOKEN="$(gh auth token)" pnpm tsx -e "
import { Octokit } from '@octokit/rest';
import { discoverSkills } from './skills-scanner.js';
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
// Override SKILL_REPOS to a single small repo for this smoke run.
" 2>&1 | tail
```

If a focused entry-point doesn't exist, instead inspect the resulting JSON of one already-discovered skill after the next full run:

```bash
python3 -c "import json; d=json.load(open('preset-registry/skills/anthropics-skills-pdf/skill.json')) if False else None"
```

(Smoke check is satisfied by Task 8 backfill which produces the same shape.)

- [ ] **Step 4: Commit**

```bash
git add preset-registry/scripts/scanner/skills-scanner.ts
git commit -m "feat(registry): enrich skill source with stars, language, pushed_at, readme"
```

---

## Task 7: Extend `mcps-scanner.ts` to enrich source metadata

**Files:**
- Modify: `preset-registry/scripts/scanner/mcps-scanner.ts`

- [ ] **Step 1: Mirror Task 6's helper inside this file**

Either import the helper from `skills-scanner.ts` (preferred — single source of truth) by exporting `fetchRepoMeta` from it, or duplicate the helper here. Default to **export + import** — extract `fetchRepoMeta` plus its cache into the bottom of `skills-scanner.ts` and re-export. Then in `mcps-scanner.ts`:

```ts
import { fetchRepoMeta } from "./skills-scanner.js";
```

Update the existing `McpSource` (or equivalent persisted shape) similarly:

```ts
export interface McpSource {
  repo: string;
  url: string;
  path: string;
  branch: string;
  discovered_at: string;
  stars?: number;
  language?: string | null;
  pushed_at?: string;
  readme?: string | null;
}
```

In the loop that writes each mcp.json, enrich `source` the same way as Task 6 Step 2.

- [ ] **Step 2: Type-check both scanner files**

Run:

```bash
cd preset-registry/scripts/scanner
npx tsc --noEmit --target es2022 --module nodenext --moduleResolution nodenext --strict --esModuleInterop --skipLibCheck *.ts
```

Expected: EXIT 0.

- [ ] **Step 3: Commit**

```bash
git add preset-registry/scripts/scanner/skills-scanner.ts preset-registry/scripts/scanner/mcps-scanner.ts
git commit -m "feat(registry): enrich mcp source with stars, language, pushed_at, readme"
```

---

## Task 8: Backfill script for skill READMEs

**Files:**
- Create: `preset-registry/scripts/scanner/backfill-skill-readmes.ts`

- [ ] **Step 1: Write the script**

Modeled exactly on the existing `backfill-readmes.ts` (preset version). The shape:

```ts
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

    await writeFile(path, JSON.stringify(manifest, null, 2));
    updated++;
    console.log(`[ok]   ${manifest.source.repo} (${meta.readme ? meta.readme.length : 0} bytes)`);
  }

  console.log(
    `\nDone. scanned=${scanned} updated=${updated} skipped=${skipped} failed=${failed}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Type-check**

```bash
cd preset-registry/scripts/scanner
npx tsc --noEmit --target es2022 --module nodenext --moduleResolution nodenext --strict --esModuleInterop --skipLibCheck backfill-skill-readmes.ts skills-scanner.ts
```

Expected: EXIT 0.

- [ ] **Step 3: Run the backfill**

```bash
cd preset-registry/scripts/scanner
GITHUB_TOKEN="$(gh auth token)" pnpm tsx backfill-skill-readmes.ts 2>&1 | tail -40
```

Expected: ~110 `[ok] ...` lines, final `Done. scanned=110 updated=110 skipped=0 failed=0`. The cache in `fetchRepoMeta` should reduce GitHub API calls to ~4 (one per source repo) plus 4 README fetches.

- [ ] **Step 4: Sanity check one file**

```bash
python3 -c "
import json
d = json.load(open('preset-registry/skills/anthropics-skills-pdf/skill.json'))
src = d['source']
print('stars:', src.get('stars'))
print('language:', src.get('language'))
print('readme len:', len(src.get('readme') or ''))
"
```

Expected: stars > 0, language non-null, readme length > 100.

- [ ] **Step 5: Commit**

```bash
git add preset-registry/scripts/scanner/backfill-skill-readmes.ts preset-registry/skills/
git commit -m "feat(registry): backfill skill source metadata from upstream repos"
```

---

## Task 9: Backfill script for MCP READMEs

**Files:**
- Create: `preset-registry/scripts/scanner/backfill-mcp-readmes.ts`

- [ ] **Step 1: Write the script**

Identical structure to Task 8 but for the `mcps/` directory:

```ts
// Backfill source metadata into existing mcp.json files.
//
// Usage (from scripts/scanner):
//   GITHUB_TOKEN=xxx pnpm tsx backfill-mcp-readmes.ts

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
  const mcpsDir = join(REGISTRY_DIR, "mcps");
  if (!existsSync(mcpsDir)) {
    console.error(`mcps dir not found: ${mcpsDir}`);
    process.exit(1);
  }

  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const dirent of await readdir(mcpsDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const path = join(mcpsDir, dirent.name, "mcp.json");
    if (!existsSync(path)) continue;
    scanned++;

    let manifest: any;
    try {
      manifest = JSON.parse(await readFile(path, "utf8"));
    } catch {
      console.warn(`[skip] ${dirent.name}: unparseable mcp.json`);
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

    await writeFile(path, JSON.stringify(manifest, null, 2));
    updated++;
    console.log(`[ok]   ${manifest.source.repo} (${meta.readme ? meta.readme.length : 0} bytes)`);
  }

  console.log(
    `\nDone. scanned=${scanned} updated=${updated} skipped=${skipped} failed=${failed}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Type-check**

```bash
cd preset-registry/scripts/scanner
npx tsc --noEmit --target es2022 --module nodenext --moduleResolution nodenext --strict --esModuleInterop --skipLibCheck backfill-mcp-readmes.ts
```

Expected: EXIT 0.

- [ ] **Step 3: Run the backfill**

```bash
cd preset-registry/scripts/scanner
GITHUB_TOKEN="$(gh auth token)" pnpm tsx backfill-mcp-readmes.ts 2>&1 | tail -20
```

Expected: 14 `[ok] ...` lines, final `Done. scanned=14 updated=14 skipped=0 failed=0`.

- [ ] **Step 4: Sanity check one file**

```bash
python3 -c "
import json
d = json.load(open('preset-registry/mcps/everything/mcp.json'))
src = d['source']
print('stars:', src.get('stars'))
print('readme len:', len(src.get('readme') or ''))
"
```

Expected: stars > 0, readme length > 100.

- [ ] **Step 5: Commit**

```bash
git add preset-registry/scripts/scanner/backfill-mcp-readmes.ts preset-registry/mcps/
git commit -m "feat(registry): backfill mcp source metadata from upstream repos"
```

---

## Task 10: Show ★ stars + language chip + repo line on Skill cards

**Files:**
- Modify: `apps/desktop/src/pages/SkillsPage.tsx`

- [ ] **Step 1: Add `formatStars` helper**

Near the top of the file (alongside any existing helpers — see `PresetsPage.tsx:74-77` for the canonical):

```ts
function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
```

- [ ] **Step 2: Render `repo · ★ stars · language` on each card**

Inside the skill card body, immediately under the existing `description` paragraph (or wherever the meta row lives), add:

```tsx
{skill.source?.repo && (
  <div
    className="mono"
    style={{
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      fontSize: 11,
      color: "var(--ink-3)",
      marginTop: 6,
    }}
  >
    <span>{skill.source.repo}</span>
    {typeof skill.source.stars === "number" && skill.source.stars > 0 && (
      <span>★ {formatStars(skill.source.stars)}</span>
    )}
    {skill.source.language && <span>· {skill.source.language}</span>}
  </div>
)}
```

- [ ] **Step 3: Type-check + visual smoke**

`cd apps/desktop && npx tsc --noEmit -p tsconfig.json` → EXIT 0.
Open Skills tab — every card should now show its source repo, star count, and language under the description.

- [ ] **Step 4: Commit**

```bash
git add apps/desktop/src/pages/SkillsPage.tsx
git commit -m "feat(desktop): show repo, stars, language on skill cards"
```

---

## Task 11: Show ★ stars + language chip on MCP cards

**Files:**
- Modify: `apps/desktop/src/pages/McpPage.tsx`

- [ ] **Step 1: Mirror Task 10 verbatim**

Add the `formatStars` helper at module scope, then add the same `repo · ★ stars · language` block immediately under the description on each mcp card. The variable name in the `.map` callback is `mcp` (or whatever the file uses) — adjust references accordingly.

- [ ] **Step 2: Type-check + visual smoke**

`cd apps/desktop && npx tsc --noEmit -p tsconfig.json` → EXIT 0.
Open MCPs tab — every card shows source/stars/language.

- [ ] **Step 3: Commit**

```bash
git add apps/desktop/src/pages/McpPage.tsx
git commit -m "feat(desktop): show repo, stars, language on mcp cards"
```

---

## Task 12: Collapsible "Upstream README" panel on Skill cards

**Files:**
- Modify: `apps/desktop/src/pages/SkillsPage.tsx`

- [ ] **Step 1: Track expanded README per skill**

At the top of the component body (next to existing `useState`s), add:

```ts
const [readmeOpen, setReadmeOpen] = useState<Record<string, boolean>>({});
```

Toggle helper:

```ts
function toggleReadme(id: string) {
  setReadmeOpen((m) => ({ ...m, [id]: !m[id] }));
}
```

- [ ] **Step 2: Add the panel inside each card body**

Import `MarkdownPreview` and the chevron icon at the top:

```ts
import MarkdownPreview from "../components/MarkdownPreview";

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
  >
    <path d="M4 2L8 6L4 10" />
  </svg>
);
```

Below the source/stars meta row from Task 10, render:

```tsx
{skill.source?.readme && (
  <div style={{ marginTop: 10, borderTop: "1px solid var(--hairline)", paddingTop: 10 }}>
    <button
      type="button"
      onClick={() => toggleReadme(skill.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        background: "transparent",
        border: 0,
        cursor: "pointer",
        textAlign: "left",
        color: "var(--ink-3)",
        padding: 0,
      }}
    >
      <ChevronIcon open={!!readmeOpen[skill.id]} />
      <SectionLabel>Upstream README</SectionLabel>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: "auto" }}>
        {readmeOpen[skill.id] ? "收起" : "展开"}
      </span>
    </button>
    {readmeOpen[skill.id] && (
      <div style={{ marginTop: 10, maxHeight: 360, overflow: "auto" }}>
        <MarkdownPreview content={skill.source.readme} />
      </div>
    )}
  </div>
)}
```

- [ ] **Step 3: Type-check + visual smoke**

`cd apps/desktop && npx tsc --noEmit -p tsconfig.json` → EXIT 0.
Open Skills tab — each card with a non-null `source.readme` shows a collapsed "Upstream README" toggle. Click it — the README renders with full Markdown formatting (headings, code blocks, links).

- [ ] **Step 4: Commit**

```bash
git add apps/desktop/src/pages/SkillsPage.tsx
git commit -m "feat(desktop): expandable upstream README panel on skill cards"
```

---

## Task 13: Collapsible "Upstream README" panel on MCP cards

**Files:**
- Modify: `apps/desktop/src/pages/McpPage.tsx`

- [ ] **Step 1: Mirror Task 12 verbatim**

Add `readmeOpen` state and `toggleReadme` helper. Import `MarkdownPreview` and `ChevronIcon`. Render the same collapsible panel under the meta row, swapping `skill` → `mcp`.

- [ ] **Step 2: Type-check + visual smoke**

`cd apps/desktop && npx tsc --noEmit -p tsconfig.json` → EXIT 0.
Open MCPs tab — README panel works on each MCP card.

- [ ] **Step 3: Commit**

```bash
git add apps/desktop/src/pages/McpPage.tsx
git commit -m "feat(desktop): expandable upstream README panel on mcp cards"
```

---

## Final verification

- [ ] **Full type-check both ends**

```bash
cd apps/desktop && npx tsc --noEmit -p tsconfig.json
cargo test -p ccpm-core
```

Expected: both EXIT 0, all serde tests green.

- [ ] **End-to-end visual smoke**

In the running Tauri app, restart Rust if needed (`touch apps/desktop/src-tauri/src/lib.rs`), then for each tab:

1. **Presets** — selecting an auto-discovered preset still shows the GitHub button + Upstream README (regression check).
2. **Skills** — every card with a discovered source shows: repo / stars / language meta line, GitHub button, and a collapsible Upstream README panel that renders Markdown.
3. **MCPs** — same as Skills.

- [ ] **Push when satisfied**

The user typically reviews then asks to push. Default to local commits only — never `git push` without explicit instruction.
