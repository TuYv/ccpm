# Recipe + Library Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe CCPM around user actions: 3 existing catalogs become libraries (download = collect, never writes `~/.claude/`), and a new "配方" tab is the only place that activates content into `~/.claude/`. First launch scans existing `~/.claude/` and surfaces it as an activated recipe so users never feel they're starting from blank.

**Architecture:** Two new Rust modules (`library.rs`, `recipes.rs`) own the local store at `~/.claude-presets/{library,recipes,active.json}`. Recipes reference library items by id (not snapshot) and can carry a `settings_override` that merges into `settings.json`. Activation funnels through a single `activate_recipe(recipe_id, scope)` that uses the existing backup machinery. Frontend gets a new "配方" first tab; the 3 existing catalogs only change the wording and behavior of their "install" buttons (now "下载到库").

**Tech Stack:** Rust (claude-preset-core) + Tauri v2 + React 18 + Zustand v5 + Tailwind v3.

---

## File Structure Overview

### Rust Core — new files

| File | Responsibility |
|------|----------------|
| `crates/core/src/library.rs` | CRUD over `~/.claude-presets/library/{claude-md,skills,mcps}/<id>/` |
| `crates/core/src/recipes.rs` | CRUD over `~/.claude-presets/recipes/`, + `read_active`/`write_active` for `active.json`, + `activate_recipe`/`deactivate_recipe` |
| `crates/core/src/scan_existing.rs` | First-launch importer: walk `~/.claude/` and seed library + initial "current" recipe |

### Rust Core — modified files

| File | Change |
|------|--------|
| `crates/core/src/types.rs` | Add `ItemSource`, `LibraryItemMeta`, `Recipe`, `RecipeMcpEntry`, `ActiveState` types |
| `crates/core/src/lib.rs` | Re-export new modules |

### Tauri commands — new files

- `apps/desktop/src-tauri/src/commands/library.rs`
- `apps/desktop/src-tauri/src/commands/recipes.rs`
- `apps/desktop/src-tauri/src/commands/scan_existing.rs`

### Frontend — new files

- `apps/desktop/src/pages/RecipesPage.tsx`
- `apps/desktop/src/components/RecipeEditor.tsx`
- `apps/desktop/src/components/ActivationDialog.tsx`

### Frontend — modified files

| File | Change |
|------|--------|
| `apps/desktop/src/types/core.ts` | Add `LibraryItem`, `Recipe`, `ActiveState` |
| `apps/desktop/src/api/claudePreset.ts` | Add 13 new API methods |
| `apps/desktop/src/stores/index.ts` | Add `useRecipesStore`, `useLibraryStore` |
| `apps/desktop/src/components/Layout.tsx` | Add `配方` as first tab |
| `apps/desktop/src/App.tsx` | Add `/recipes` route, set as index, bootstrap on mount |
| `apps/desktop/src/pages/PresetsPage.tsx` | "安装" → "下载到库", call `download_claude_md_cmd` instead of `activate_preset` |
| `apps/desktop/src/pages/SkillsPage.tsx` | Same pattern: install → download to library |
| `apps/desktop/src/pages/McpPage.tsx` | Same pattern |
| `apps/desktop/src/pages/InstalledPage.tsx` | Replace preset-based view with active-recipe view |

### Disk layout (new)

```
~/.claude-presets/
  library/
    claude-md/<id>/{CLAUDE.md, settings.json?, meta.json}
    skills/<id>/{SKILL.md, meta.json}
    mcps/<id>/mcp.json
  recipes/<id>.json
  active.json
  backups/        (unchanged)
  cache/          (unchanged)
```

---

## 子系统 1: Rust Core — 数据模型 + Library + Recipes CRUD

### Task 1.1: Add types

**Files:**
- Modify: `crates/core/src/types.rs`

- [ ] **Step 1: Append failing tests to existing `mod tests`**

```rust
#[test]
fn test_recipe_deserializes() {
    let json = r#"{
        "id": "rust-dev",
        "name": "Rust 开发",
        "description": "Rust CLI 项目",
        "claude_md": "rust-cli",
        "skills": ["tdd", "systematic-debugging"],
        "mcps": [{"library_id": "github", "env": {"GITHUB_TOKEN": "ghp_x"}}],
        "settings_override": {"model": "claude-sonnet-4-6"},
        "created_at": "2026-04-27T00:00:00Z",
        "updated_at": "2026-04-27T00:00:00Z"
    }"#;
    let r: Recipe = serde_json::from_str(json).unwrap();
    assert_eq!(r.id, "rust-dev");
    assert_eq!(r.skills.len(), 2);
    assert_eq!(r.mcps[0].library_id, "github");
}

#[test]
fn test_library_item_meta_with_source() {
    let json = r#"{
        "id": "rust-cli",
        "name": "Rust CLI",
        "description": "d",
        "source": {"kind": "remote", "repo": "TuYv/ccpm", "url": "..."},
        "downloaded_at": "2026-04-27T00:00:00Z"
    }"#;
    let m: LibraryItemMeta = serde_json::from_str(json).unwrap();
    matches!(m.source, ItemSource::Remote { .. });
}

#[test]
fn test_active_state_default_empty() {
    let s = ActiveState::default();
    assert!(s.global.is_none());
    assert!(s.projects.is_empty());
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cargo test -p claude-preset-core --lib types
```
Expected: FAIL (`Recipe`, `LibraryItemMeta`, `ItemSource`, `ActiveState` undefined)

- [ ] **Step 3: Add types**

In `crates/core/src/types.rs`, append (after existing types, before `mod tests`):

```rust
// ── Library + Recipe types ────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum ItemSource {
    Remote { repo: String, url: String },
    Imported { from: String },
    UserCreated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LibraryItemMeta {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(default)]
    pub tags: Vec<String>,
    pub source: ItemSource,
    pub downloaded_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeMcpEntry {
    pub library_id: String,
    #[serde(default)]
    pub env: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recipe {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub claude_md: Option<String>,
    #[serde(default)]
    pub skills: Vec<String>,
    #[serde(default)]
    pub mcps: Vec<RecipeMcpEntry>,
    #[serde(default)]
    pub settings_override: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ActiveState {
    #[serde(default)]
    pub global: Option<String>, // recipe id
    #[serde(default)]
    pub projects: HashMap<String, String>, // project path → recipe id
}
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
cargo test -p claude-preset-core --lib types
```
Expected: PASS — 3 new tests + existing.

- [ ] **Step 5: Commit**

```bash
git add crates/core/src/types.rs
git commit -m "feat(core): add Recipe, LibraryItemMeta, ItemSource, ActiveState types"
```

---

### Task 1.2: library.rs module

**Files:**
- Create: `crates/core/src/library.rs`
- Modify: `crates/core/src/lib.rs` (register module)

- [ ] **Step 1: Create the module with tests**

`crates/core/src/library.rs`:

```rust
use crate::{
    error::AppError,
    fs::atomic_write,
    types::{ItemSource, LibraryItemMeta},
};
use std::{
    fs,
    path::{Path, PathBuf},
};

/// The 3 item types stored in the library.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ItemKind {
    ClaudeMd,
    Skill,
    Mcp,
}

impl ItemKind {
    fn dir_name(self) -> &'static str {
        match self {
            ItemKind::ClaudeMd => "claude-md",
            ItemKind::Skill => "skills",
            ItemKind::Mcp => "mcps",
        }
    }
}

fn library_root(pm_dir: &Path) -> PathBuf {
    pm_dir.join("library")
}

fn item_dir(pm_dir: &Path, kind: ItemKind, id: &str) -> PathBuf {
    library_root(pm_dir).join(kind.dir_name()).join(id)
}

fn validate_id(id: &str) -> Result<(), AppError> {
    if id.is_empty() || id.contains(['/', '\\', '\0']) || id.contains("..") {
        return Err(AppError::InvalidInput(format!("invalid library id: {id}")));
    }
    Ok(())
}

/// Add a CLAUDE.md item to the library. `settings_json` is optional.
pub fn add_claude_md(
    pm_dir: &Path,
    meta: &LibraryItemMeta,
    claude_md_content: &str,
    settings_json: Option<&str>,
) -> Result<(), AppError> {
    validate_id(&meta.id)?;
    let dir = item_dir(pm_dir, ItemKind::ClaudeMd, &meta.id);
    fs::create_dir_all(&dir)?;
    atomic_write(&dir.join("CLAUDE.md"), claude_md_content)?;
    if let Some(s) = settings_json {
        atomic_write(&dir.join("settings.json"), s)?;
    }
    atomic_write(&dir.join("meta.json"), &serde_json::to_string_pretty(meta)?)?;
    Ok(())
}

/// Add a skill item. `skill_md_content` is the full SKILL.md text.
pub fn add_skill(
    pm_dir: &Path,
    meta: &LibraryItemMeta,
    skill_md_content: &str,
) -> Result<(), AppError> {
    validate_id(&meta.id)?;
    let dir = item_dir(pm_dir, ItemKind::Skill, &meta.id);
    fs::create_dir_all(&dir)?;
    atomic_write(&dir.join("SKILL.md"), skill_md_content)?;
    atomic_write(&dir.join("meta.json"), &serde_json::to_string_pretty(meta)?)?;
    Ok(())
}

/// Add an MCP entry. `mcp_json` is the full McpMeta JSON content.
pub fn add_mcp(pm_dir: &Path, id: &str, mcp_json: &str) -> Result<(), AppError> {
    validate_id(id)?;
    let dir = item_dir(pm_dir, ItemKind::Mcp, id);
    fs::create_dir_all(&dir)?;
    atomic_write(&dir.join("mcp.json"), mcp_json)?;
    Ok(())
}

pub fn remove_item(pm_dir: &Path, kind: ItemKind, id: &str) -> Result<(), AppError> {
    validate_id(id)?;
    let dir = item_dir(pm_dir, kind, id);
    if dir.exists() {
        fs::remove_dir_all(&dir)?;
    }
    Ok(())
}

pub fn list_items(pm_dir: &Path, kind: ItemKind) -> Result<Vec<String>, AppError> {
    let kind_dir = library_root(pm_dir).join(kind.dir_name());
    if !kind_dir.exists() {
        return Ok(vec![]);
    }
    let mut out = vec![];
    for entry in fs::read_dir(&kind_dir)? {
        let entry = entry?;
        if entry.file_type()?.is_dir() {
            if let Some(name) = entry.file_name().to_str() {
                out.push(name.to_string());
            }
        }
    }
    out.sort();
    Ok(out)
}

pub fn get_meta(
    pm_dir: &Path,
    kind: ItemKind,
    id: &str,
) -> Result<LibraryItemMeta, AppError> {
    validate_id(id)?;
    if kind == ItemKind::Mcp {
        // MCPs use mcp.json directly (which is McpMeta-shaped, not LibraryItemMeta).
        // For uniform listing, callers should use get_mcp_json instead.
        return Err(AppError::InvalidInput(
            "use get_mcp_json for MCP items".into(),
        ));
    }
    let path = item_dir(pm_dir, kind, id).join("meta.json");
    let s = fs::read_to_string(&path)?;
    Ok(serde_json::from_str(&s)?)
}

/// Returns the raw JSON of an MCP item.
pub fn get_mcp_json(pm_dir: &Path, id: &str) -> Result<String, AppError> {
    validate_id(id)?;
    let path = item_dir(pm_dir, ItemKind::Mcp, id).join("mcp.json");
    Ok(fs::read_to_string(&path)?)
}

pub fn get_claude_md_files(
    pm_dir: &Path,
    id: &str,
) -> Result<(String, Option<String>), AppError> {
    validate_id(id)?;
    let dir = item_dir(pm_dir, ItemKind::ClaudeMd, id);
    let claude = fs::read_to_string(dir.join("CLAUDE.md"))?;
    let settings_path = dir.join("settings.json");
    let settings = if settings_path.exists() {
        Some(fs::read_to_string(&settings_path)?)
    } else {
        None
    };
    Ok((claude, settings))
}

pub fn get_skill_md(pm_dir: &Path, id: &str) -> Result<String, AppError> {
    validate_id(id)?;
    let path = item_dir(pm_dir, ItemKind::Skill, id).join("SKILL.md");
    Ok(fs::read_to_string(&path)?)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn meta(id: &str) -> LibraryItemMeta {
        LibraryItemMeta {
            id: id.into(),
            name: id.into(),
            description: "d".into(),
            tags: vec![],
            source: ItemSource::UserCreated,
            downloaded_at: "2026-04-27T00:00:00Z".into(),
        }
    }

    #[test]
    fn test_add_and_get_claude_md() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        add_claude_md(pm, &meta("rust-cli"), "# Rust", Some(r#"{"x":1}"#)).unwrap();
        let (md, settings) = get_claude_md_files(pm, "rust-cli").unwrap();
        assert_eq!(md, "# Rust");
        assert_eq!(settings.unwrap(), r#"{"x":1}"#);
    }

    #[test]
    fn test_list_and_remove() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        add_skill(pm, &meta("a"), "# A").unwrap();
        add_skill(pm, &meta("b"), "# B").unwrap();
        assert_eq!(list_items(pm, ItemKind::Skill).unwrap(), vec!["a", "b"]);
        remove_item(pm, ItemKind::Skill, "a").unwrap();
        assert_eq!(list_items(pm, ItemKind::Skill).unwrap(), vec!["b"]);
    }

    #[test]
    fn test_validate_id_rejects_traversal() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        let bad = LibraryItemMeta {
            id: "../escape".into(),
            ..meta("x")
        };
        assert!(add_skill(pm, &bad, "x").is_err());
    }

    #[test]
    fn test_mcp_round_trip() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        let json = r#"{"id":"github","name":"GitHub","command":"npx"}"#;
        add_mcp(pm, "github", json).unwrap();
        assert_eq!(get_mcp_json(pm, "github").unwrap(), json);
    }
}
```

- [ ] **Step 2: Register in `lib.rs`**

`crates/core/src/lib.rs`:

```rust
pub mod activator;
pub mod baseline;
pub mod config;
pub mod error;
pub mod fs;
pub mod importer;
pub mod library;       // NEW
pub mod mcp;
pub mod registry;
pub mod skills;
pub mod state;
pub mod types;
```

- [ ] **Step 3: Run tests**

```bash
cargo test -p claude-preset-core --lib library
```
Expected: PASS — 4 tests.

- [ ] **Step 4: Commit**

```bash
git add crates/core/src/library.rs crates/core/src/lib.rs
git commit -m "feat(core): add library module (CRUD over ~/.claude-presets/library/)"
```

---

### Task 1.3: recipes.rs CRUD + active.json

**Files:**
- Create: `crates/core/src/recipes.rs`
- Modify: `crates/core/src/lib.rs`

- [ ] **Step 1: Create the module**

`crates/core/src/recipes.rs`:

```rust
use crate::{
    error::AppError,
    fs::atomic_write,
    types::{ActiveState, Recipe, Scope},
};
use chrono::Utc;
use std::{fs, path::Path};

fn recipes_dir(pm_dir: &Path) -> std::path::PathBuf {
    pm_dir.join("recipes")
}

fn recipe_path(pm_dir: &Path, id: &str) -> std::path::PathBuf {
    recipes_dir(pm_dir).join(format!("{id}.json"))
}

fn active_path(pm_dir: &Path) -> std::path::PathBuf {
    pm_dir.join("active.json")
}

fn validate_id(id: &str) -> Result<(), AppError> {
    if id.is_empty() || id.contains(['/', '\\', '\0', '.']) {
        return Err(AppError::InvalidInput(format!("invalid recipe id: {id}")));
    }
    Ok(())
}

pub fn save_recipe(pm_dir: &Path, recipe: &Recipe) -> Result<(), AppError> {
    validate_id(&recipe.id)?;
    fs::create_dir_all(recipes_dir(pm_dir))?;
    atomic_write(
        &recipe_path(pm_dir, &recipe.id),
        &serde_json::to_string_pretty(recipe)?,
    )
}

pub fn get_recipe(pm_dir: &Path, id: &str) -> Result<Recipe, AppError> {
    validate_id(id)?;
    let path = recipe_path(pm_dir, id);
    let s = fs::read_to_string(&path)?;
    Ok(serde_json::from_str(&s)?)
}

pub fn list_recipes(pm_dir: &Path) -> Result<Vec<Recipe>, AppError> {
    let dir = recipes_dir(pm_dir);
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut out = vec![];
    for entry in fs::read_dir(&dir)? {
        let path = entry?.path();
        if path.extension().and_then(|s| s.to_str()) != Some("json") {
            continue;
        }
        let s = fs::read_to_string(&path)?;
        if let Ok(r) = serde_json::from_str::<Recipe>(&s) {
            out.push(r);
        }
    }
    out.sort_by(|a, b| a.updated_at.cmp(&b.updated_at).reverse());
    Ok(out)
}

pub fn delete_recipe(pm_dir: &Path, id: &str) -> Result<(), AppError> {
    validate_id(id)?;
    let path = recipe_path(pm_dir, id);
    if path.exists() {
        fs::remove_file(&path)?;
    }
    Ok(())
}

pub fn read_active(pm_dir: &Path) -> Result<ActiveState, AppError> {
    let path = active_path(pm_dir);
    if !path.exists() {
        return Ok(ActiveState::default());
    }
    Ok(serde_json::from_str(&fs::read_to_string(&path)?)?)
}

pub fn write_active(pm_dir: &Path, state: &ActiveState) -> Result<(), AppError> {
    fs::create_dir_all(pm_dir)?;
    atomic_write(&active_path(pm_dir), &serde_json::to_string_pretty(state)?)
}

pub fn get_active_for(pm_dir: &Path, scope: &Scope) -> Result<Option<String>, AppError> {
    let s = read_active(pm_dir)?;
    Ok(match scope {
        Scope::Global => s.global,
        Scope::Project(p) => s.projects.get(p).cloned(),
    })
}

pub fn now_rfc3339() -> String {
    Utc::now().to_rfc3339()
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn r(id: &str) -> Recipe {
        Recipe {
            id: id.into(),
            name: id.into(),
            description: "d".into(),
            claude_md: None,
            skills: vec![],
            mcps: vec![],
            settings_override: serde_json::json!({}),
            created_at: now_rfc3339(),
            updated_at: now_rfc3339(),
        }
    }

    #[test]
    fn test_save_get_list_delete_recipe() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        save_recipe(pm, &r("a")).unwrap();
        save_recipe(pm, &r("b")).unwrap();
        let listed = list_recipes(pm).unwrap();
        assert_eq!(listed.len(), 2);
        let got = get_recipe(pm, "a").unwrap();
        assert_eq!(got.id, "a");
        delete_recipe(pm, "a").unwrap();
        assert_eq!(list_recipes(pm).unwrap().len(), 1);
    }

    #[test]
    fn test_active_state_round_trip() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        let mut s = ActiveState::default();
        s.global = Some("current".into());
        s.projects.insert("/proj".into(), "rust".into());
        write_active(pm, &s).unwrap();
        let got = read_active(pm).unwrap();
        assert_eq!(got.global.unwrap(), "current");
        assert_eq!(got.projects.get("/proj").unwrap(), "rust");
    }

    #[test]
    fn test_get_active_for_scope() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        let mut s = ActiveState::default();
        s.global = Some("g".into());
        write_active(pm, &s).unwrap();
        assert_eq!(
            get_active_for(pm, &Scope::Global).unwrap().unwrap(),
            "g"
        );
        assert!(
            get_active_for(pm, &Scope::Project("/x".into()))
                .unwrap()
                .is_none()
        );
    }

    #[test]
    fn test_validate_id_rejects_dots() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        let mut bad = r("a.json");
        bad.id = "a.json".into();
        assert!(save_recipe(pm, &bad).is_err());
    }
}
```

- [ ] **Step 2: Register in lib.rs**

Append `pub mod recipes;` in alphabetical position (between `registry` and `skills`).

- [ ] **Step 3: Run tests**

```bash
cargo test -p claude-preset-core --lib recipes
```
Expected: 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add crates/core/src/recipes.rs crates/core/src/lib.rs
git commit -m "feat(core): add recipes module (CRUD + active.json)"
```

---

## 子系统 2: Rust Core — Activation

### Task 2.1: activate_recipe + deactivate_recipe

**Files:**
- Modify: `crates/core/src/recipes.rs`

This is the core orchestration. It writes everything a recipe references into `~/.claude/`, after backing up.

- [ ] **Step 1: Append failing tests**

In `recipes.rs` `mod tests` (use `claude_preset_core::library::*` and the existing backup machinery from `state.rs`):

```rust
#[test]
fn test_activate_writes_claude_md_and_records_active() {
    use crate::library;
    use crate::types::{ItemSource, LibraryItemMeta};

    let dir = tempdir().unwrap();
    let claude = dir.path().join("claude");
    let pm = dir.path().join("pm");
    std::fs::create_dir_all(&claude).unwrap();
    std::fs::create_dir_all(&pm).unwrap();

    let meta = LibraryItemMeta {
        id: "rust".into(),
        name: "rust".into(),
        description: "d".into(),
        tags: vec![],
        source: ItemSource::UserCreated,
        downloaded_at: "2026-04-27T00:00:00Z".into(),
    };
    library::add_claude_md(&pm, &meta, "# Rust dev", None).unwrap();

    let mut recipe = r("recipe1");
    recipe.claude_md = Some("rust".into());
    save_recipe(&pm, &recipe).unwrap();

    activate_recipe(&claude, &pm, "recipe1", &Scope::Global).unwrap();

    assert_eq!(
        std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
        "# Rust dev"
    );
    let active = read_active(&pm).unwrap();
    assert_eq!(active.global.unwrap(), "recipe1");
}

#[test]
fn test_activate_merges_settings_override_into_existing_settings() {
    use crate::library;
    use crate::types::{ItemSource, LibraryItemMeta};

    let dir = tempdir().unwrap();
    let claude = dir.path().join("claude");
    let pm = dir.path().join("pm");
    std::fs::create_dir_all(&claude).unwrap();
    std::fs::create_dir_all(&pm).unwrap();
    // Pre-existing settings
    std::fs::write(
        claude.join("settings.json"),
        r#"{"model":"old","keepMe":true}"#,
    )
    .unwrap();

    let meta = LibraryItemMeta {
        id: "x".into(),
        name: "x".into(),
        description: "".into(),
        tags: vec![],
        source: ItemSource::UserCreated,
        downloaded_at: "2026-04-27T00:00:00Z".into(),
    };
    library::add_claude_md(&pm, &meta, "# x", None).unwrap();

    let mut recipe = r("rx");
    recipe.claude_md = Some("x".into());
    recipe.settings_override = serde_json::json!({"model": "claude-sonnet-4-6"});
    save_recipe(&pm, &recipe).unwrap();

    activate_recipe(&claude, &pm, "rx", &Scope::Global).unwrap();

    let v: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(claude.join("settings.json")).unwrap())
            .unwrap();
    assert_eq!(v["model"], "claude-sonnet-4-6");
    assert_eq!(v["keepMe"], true);
}

#[test]
fn test_activate_writes_skill_files() {
    use crate::library;
    use crate::types::{ItemSource, LibraryItemMeta};

    let dir = tempdir().unwrap();
    let claude = dir.path().join("claude");
    let pm = dir.path().join("pm");
    std::fs::create_dir_all(&claude).unwrap();
    std::fs::create_dir_all(&pm).unwrap();

    let m = LibraryItemMeta {
        id: "tdd".into(),
        name: "tdd".into(),
        description: "".into(),
        tags: vec![],
        source: ItemSource::UserCreated,
        downloaded_at: "2026-04-27T00:00:00Z".into(),
    };
    library::add_skill(&pm, &m, "# TDD body").unwrap();
    let cmd = LibraryItemMeta {
        id: "cm".into(),
        name: "cm".into(),
        description: "".into(),
        tags: vec![],
        source: ItemSource::UserCreated,
        downloaded_at: "2026-04-27T00:00:00Z".into(),
    };
    library::add_claude_md(&pm, &cmd, "# md", None).unwrap();

    let mut rec = r("rs");
    rec.claude_md = Some("cm".into());
    rec.skills = vec!["tdd".into()];
    save_recipe(&pm, &rec).unwrap();

    activate_recipe(&claude, &pm, "rs", &Scope::Global).unwrap();
    assert_eq!(
        std::fs::read_to_string(claude.join("skills/tdd/SKILL.md")).unwrap(),
        "# TDD body"
    );
}

#[test]
fn test_deactivate_clears_active() {
    use crate::library;
    use crate::types::{ItemSource, LibraryItemMeta};

    let dir = tempdir().unwrap();
    let claude = dir.path().join("claude");
    let pm = dir.path().join("pm");
    std::fs::create_dir_all(&claude).unwrap();
    std::fs::create_dir_all(&pm).unwrap();

    let m = LibraryItemMeta {
        id: "c".into(),
        name: "c".into(),
        description: "".into(),
        tags: vec![],
        source: ItemSource::UserCreated,
        downloaded_at: "2026-04-27T00:00:00Z".into(),
    };
    library::add_claude_md(&pm, &m, "# c", None).unwrap();

    let mut rec = r("rd");
    rec.claude_md = Some("c".into());
    save_recipe(&pm, &rec).unwrap();
    activate_recipe(&claude, &pm, "rd", &Scope::Global).unwrap();

    deactivate_recipe(&pm, &Scope::Global).unwrap();
    assert!(read_active(&pm).unwrap().global.is_none());
}
```

- [ ] **Step 2: Run tests, expect FAIL**

```bash
cargo test -p claude-preset-core --lib recipes
```
Expected: FAIL — `activate_recipe`, `deactivate_recipe` undefined.

- [ ] **Step 3: Implement activation**

Append to `recipes.rs`:

```rust
use crate::{
    library::{self, ItemKind},
    state::{add_backup_entry, read_backup_index},
    types::{BackupEntry, McpMeta},
};
use std::collections::HashMap;

/// Deep merges `b` into `a` (objects merge field-wise; primitives in `b` win).
fn json_deep_merge(a: &mut serde_json::Value, b: &serde_json::Value) {
    use serde_json::Value;
    match (a, b) {
        (Value::Object(am), Value::Object(bm)) => {
            for (k, v) in bm {
                json_deep_merge(am.entry(k.clone()).or_insert(Value::Null), v);
            }
        }
        (a_slot, b_val) => *a_slot = b_val.clone(),
    }
}

fn backup_id_now() -> String {
    Utc::now().format("%Y-%m-%dT%H-%M-%S%.6fZ").to_string()
}

fn safe_target_rel(rel: &str) -> bool {
    let p = std::path::Path::new(rel);
    !rel.is_empty()
        && !p.is_absolute()
        && !p.components().any(|c| c == std::path::Component::ParentDir)
}

/// Activate a recipe: back up the affected files in scope_dir, then write
/// CLAUDE.md / skills / mcpServers / settings_override per the recipe.
pub fn activate_recipe(
    scope_dir: &Path,
    pm_dir: &Path,
    recipe_id: &str,
    scope: &Scope,
) -> Result<String, AppError> {
    let recipe = get_recipe(pm_dir, recipe_id)?;

    // 1. Resolve target paths up front so we know what to back up.
    let mut target_rels: Vec<String> = vec![];
    if recipe.claude_md.is_some() {
        target_rels.push("CLAUDE.md".into());
    }
    let needs_settings = !recipe.mcps.is_empty()
        || !matches!(&recipe.settings_override, serde_json::Value::Null)
            && !recipe
                .settings_override
                .as_object()
                .map(|o| o.is_empty())
                .unwrap_or(true);
    if needs_settings {
        target_rels.push("settings.json".into());
    }
    for skill_id in &recipe.skills {
        target_rels.push(format!("skills/{skill_id}/SKILL.md"));
    }
    for rel in &target_rels {
        if !safe_target_rel(rel) {
            return Err(AppError::InvalidInput(format!("unsafe target: {rel}")));
        }
    }

    // 2. Backup
    let backup_id = backup_id_now();
    let backup_dir = pm_dir.join("backups").join(&backup_id);
    fs::create_dir_all(&backup_dir)?;
    let mut backed_up: Vec<String> = vec![];
    for rel in &target_rels {
        let target = scope_dir.join(rel);
        if target.exists() {
            let backup_file = backup_dir.join(rel);
            if let Some(parent) = backup_file.parent() {
                fs::create_dir_all(parent)?;
            }
            let content = fs::read_to_string(&target)?;
            atomic_write(&backup_file, &content)?;
            backed_up.push(rel.clone());
        }
    }

    // 3. Write CLAUDE.md
    if let Some(claude_id) = &recipe.claude_md {
        let (md, _settings) = library::get_claude_md_files(pm_dir, claude_id)?;
        atomic_write(&scope_dir.join("CLAUDE.md"), &md)?;
    }

    // 4. Write skills
    for skill_id in &recipe.skills {
        let body = library::get_skill_md(pm_dir, skill_id)?;
        let target = scope_dir.join(format!("skills/{skill_id}/SKILL.md"));
        atomic_write(&target, &body)?;
    }

    // 5. Write settings.json (merge: existing → mcpServers from recipe → settings_override)
    if needs_settings {
        let settings_path = scope_dir.join("settings.json");
        let mut root: serde_json::Value = if settings_path.exists() {
            serde_json::from_str(&fs::read_to_string(&settings_path)?)
                .unwrap_or_else(|_| serde_json::json!({}))
        } else {
            serde_json::json!({})
        };
        if !root.is_object() {
            root = serde_json::json!({});
        }

        // Inject MCPs
        if !recipe.mcps.is_empty() {
            let mcp_servers = root["mcpServers"].as_object().cloned().unwrap_or_default();
            let mut servers = serde_json::Map::from_iter(mcp_servers);
            for entry in &recipe.mcps {
                let mcp_json = library::get_mcp_json(pm_dir, &entry.library_id)?;
                let m: McpMeta = serde_json::from_str(&mcp_json)?;
                let mut server = serde_json::json!({
                    "command": m.command,
                    "args": m.args,
                });
                if !entry.env.is_empty() {
                    server["env"] = serde_json::to_value(&entry.env)?;
                }
                servers.insert(entry.library_id.clone(), server);
            }
            root["mcpServers"] = serde_json::Value::Object(servers);
        }

        // Apply settings_override
        if let serde_json::Value::Object(_) = &recipe.settings_override {
            json_deep_merge(&mut root, &recipe.settings_override);
        }

        atomic_write(&settings_path, &serde_json::to_string_pretty(&root)?)?;
    }

    // 6. Record backup
    add_backup_entry(
        pm_dir,
        BackupEntry {
            id: backup_id.clone(),
            scope: scope.key().to_string(),
            previous_preset: None,
            created_at: Utc::now().to_rfc3339(),
            files: backed_up,
        },
    )?;

    // 7. Update active.json
    let mut state = read_active(pm_dir)?;
    match scope {
        Scope::Global => state.global = Some(recipe_id.to_string()),
        Scope::Project(p) => {
            state.projects.insert(p.clone(), recipe_id.to_string());
        }
    }
    write_active(pm_dir, &state)?;

    Ok(backup_id)
}

pub fn deactivate_recipe(pm_dir: &Path, scope: &Scope) -> Result<(), AppError> {
    let mut state = read_active(pm_dir)?;
    match scope {
        Scope::Global => state.global = None,
        Scope::Project(p) => {
            state.projects.remove(p);
        }
    }
    write_active(pm_dir, &state)
}

// Suppress unused-import warning for read_backup_index (kept for future use)
#[allow(unused_imports)]
fn _force_use_backup() {
    let _ = read_backup_index;
}
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
cargo test -p claude-preset-core --lib recipes
```
Expected: 8 tests pass (4 CRUD + 4 activation).

- [ ] **Step 5: Run full suite for no regression**

```bash
cargo test -p claude-preset-core --lib
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add crates/core/src/recipes.rs
git commit -m "feat(core): activate_recipe writes CLAUDE.md/skills/mcpServers/settings"
```

---

## 子系统 3: Rust Core — First-launch scan

### Task 3.1: scan_existing.rs

**Files:**
- Create: `crates/core/src/scan_existing.rs`
- Modify: `crates/core/src/lib.rs`

- [ ] **Step 1: Create the module with tests**

```rust
//! First-launch scanner: walk ~/.claude/ and import existing config into the
//! library, then create an initial "current" recipe that mirrors what the
//! user already has. Goal: zero-loss first-run.

use crate::{
    error::AppError,
    library::{self, ItemKind},
    recipes::{now_rfc3339, save_recipe, write_active},
    types::{ActiveState, ItemSource, LibraryItemMeta, McpMeta, Recipe, RecipeMcpEntry},
};
use std::{collections::HashMap, fs, path::Path};

const CURRENT_RECIPE_ID: &str = "current";

#[derive(Debug, Clone, Default)]
pub struct ScanResult {
    pub claude_md_imported: Option<String>, // library id
    pub skills_imported: Vec<String>,
    pub mcps_imported: Vec<String>,
    pub recipe_id: String,
}

/// Scan claude_dir, import items into the library at pm_dir, and create the
/// "current" recipe referencing the imports. Idempotent: re-running with no
/// changes in claude_dir is a no-op.
pub fn scan_and_seed(claude_dir: &Path, pm_dir: &Path) -> Result<ScanResult, AppError> {
    let mut result = ScanResult {
        recipe_id: CURRENT_RECIPE_ID.into(),
        ..Default::default()
    };

    // 1. CLAUDE.md
    let claude_md_path = claude_dir.join("CLAUDE.md");
    if claude_md_path.exists() {
        let body = fs::read_to_string(&claude_md_path)?;
        let id = "imported-current";
        let settings_path = claude_dir.join("settings.json");
        let settings = if settings_path.exists() {
            Some(fs::read_to_string(&settings_path)?)
        } else {
            None
        };
        let meta = LibraryItemMeta {
            id: id.into(),
            name: "我的现有 CLAUDE.md".into(),
            description: "Imported from ~/.claude/ on first launch".into(),
            tags: vec!["imported".into()],
            source: ItemSource::Imported {
                from: claude_md_path.display().to_string(),
            },
            downloaded_at: now_rfc3339(),
        };
        library::add_claude_md(pm_dir, &meta, &body, settings.as_deref())?;
        result.claude_md_imported = Some(id.into());
    }

    // 2. skills/*
    let skills_dir = claude_dir.join("skills");
    if skills_dir.exists() {
        for entry in fs::read_dir(&skills_dir)? {
            let entry = entry?;
            if !entry.file_type()?.is_dir() {
                continue;
            }
            let name = entry.file_name().to_string_lossy().to_string();
            let skill_md_path = entry.path().join("SKILL.md");
            if !skill_md_path.exists() {
                continue;
            }
            let body = fs::read_to_string(&skill_md_path)?;
            let id = format!("imported-{name}");
            let meta = LibraryItemMeta {
                id: id.clone(),
                name: name.clone(),
                description: "Imported from ~/.claude/skills/".into(),
                tags: vec!["imported".into()],
                source: ItemSource::Imported {
                    from: skill_md_path.display().to_string(),
                },
                downloaded_at: now_rfc3339(),
            };
            library::add_skill(pm_dir, &meta, &body)?;
            result.skills_imported.push(id);
        }
    }

    // 3. settings.json mcpServers
    let mut mcp_envs: HashMap<String, HashMap<String, String>> = HashMap::new();
    let settings_path = claude_dir.join("settings.json");
    if settings_path.exists() {
        let s = fs::read_to_string(&settings_path)?;
        let v: serde_json::Value = serde_json::from_str(&s).unwrap_or(serde_json::json!({}));
        if let Some(servers) = v.get("mcpServers").and_then(|x| x.as_object()) {
            for (name, server) in servers {
                let id = format!("imported-{name}");
                let command = server
                    .get("command")
                    .and_then(|x| x.as_str())
                    .unwrap_or("npx")
                    .to_string();
                let args: Vec<String> = server
                    .get("args")
                    .and_then(|x| x.as_array())
                    .map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect())
                    .unwrap_or_default();
                let env: HashMap<String, String> = server
                    .get("env")
                    .and_then(|x| x.as_object())
                    .map(|o| {
                        o.iter()
                            .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.into())))
                            .collect()
                    })
                    .unwrap_or_default();
                let mcp = McpMeta {
                    id: id.clone(),
                    name: name.clone(),
                    description: format!("Imported from ~/.claude/settings.json"),
                    category: "我的现有".into(),
                    command,
                    args,
                    required_env: vec![],
                    optional_env: vec![],
                };
                let mcp_json = serde_json::to_string_pretty(&mcp)?;
                library::add_mcp(pm_dir, &id, &mcp_json)?;
                mcp_envs.insert(id.clone(), env);
                result.mcps_imported.push(id);
            }
        }
    }

    // 4. Build "current" recipe referencing all imports
    let recipe = Recipe {
        id: CURRENT_RECIPE_ID.into(),
        name: "我的当前配置".into(),
        description: "首次启动时从 ~/.claude/ 自动导入".into(),
        claude_md: result.claude_md_imported.clone(),
        skills: result.skills_imported.clone(),
        mcps: result
            .mcps_imported
            .iter()
            .map(|id| RecipeMcpEntry {
                library_id: id.clone(),
                env: mcp_envs.remove(id).unwrap_or_default(),
            })
            .collect(),
        settings_override: serde_json::json!({}),
        created_at: now_rfc3339(),
        updated_at: now_rfc3339(),
    };
    save_recipe(pm_dir, &recipe)?;

    // 5. Mark it as the active global recipe (since it IS what's in ~/.claude/)
    let active = ActiveState {
        global: Some(CURRENT_RECIPE_ID.into()),
        projects: Default::default(),
    };
    write_active(pm_dir, &active)?;

    Ok(result)
}

/// Idempotent guard: returns true on the first call (when ~/.claude-presets/library/
/// does not yet exist), false thereafter.
pub fn is_first_launch(pm_dir: &Path) -> bool {
    !pm_dir.join("library").exists()
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_is_first_launch_when_no_library() {
        let dir = tempdir().unwrap();
        assert!(is_first_launch(dir.path()));
    }

    #[test]
    fn test_scan_with_empty_claude_creates_empty_recipe() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        let r = scan_and_seed(&claude, &pm).unwrap();
        assert!(r.claude_md_imported.is_none());
        assert!(r.skills_imported.is_empty());
        // Recipe still created (empty)
        let recipe = crate::recipes::get_recipe(&pm, "current").unwrap();
        assert!(recipe.claude_md.is_none());
    }

    #[test]
    fn test_scan_imports_claude_md_and_settings() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::write(claude.join("CLAUDE.md"), "# Hello").unwrap();
        std::fs::write(claude.join("settings.json"), r#"{"model":"sonnet"}"#).unwrap();

        let r = scan_and_seed(&claude, &pm).unwrap();
        assert_eq!(r.claude_md_imported.as_deref(), Some("imported-current"));
        let (md, settings) = library::get_claude_md_files(&pm, "imported-current").unwrap();
        assert_eq!(md, "# Hello");
        assert_eq!(settings.unwrap(), r#"{"model":"sonnet"}"#);
    }

    #[test]
    fn test_scan_imports_skills() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(claude.join("skills/tdd")).unwrap();
        std::fs::write(claude.join("skills/tdd/SKILL.md"), "# tdd body").unwrap();

        let r = scan_and_seed(&claude, &pm).unwrap();
        assert_eq!(r.skills_imported, vec!["imported-tdd"]);
        assert_eq!(library::get_skill_md(&pm, "imported-tdd").unwrap(), "# tdd body");
    }

    #[test]
    fn test_scan_imports_mcp_servers_with_env() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::write(
            claude.join("settings.json"),
            r#"{"mcpServers":{"github":{"command":"npx","args":["-y","@example/github"],"env":{"GITHUB_TOKEN":"ghp_x"}}}}"#,
        ).unwrap();

        let r = scan_and_seed(&claude, &pm).unwrap();
        assert_eq!(r.mcps_imported, vec!["imported-github"]);
        let recipe = crate::recipes::get_recipe(&pm, "current").unwrap();
        assert_eq!(recipe.mcps.len(), 1);
        assert_eq!(
            recipe.mcps[0].env.get("GITHUB_TOKEN").unwrap(),
            "ghp_x"
        );
    }

    #[test]
    fn test_scan_marks_active_global() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        scan_and_seed(&claude, &pm).unwrap();
        let active = crate::recipes::read_active(&pm).unwrap();
        assert_eq!(active.global.unwrap(), "current");
    }
}
```

- [ ] **Step 2: Register module**

In `lib.rs`, add `pub mod scan_existing;` (alphabetical, after `recipes`).

- [ ] **Step 3: Run tests**

```bash
cargo test -p claude-preset-core --lib scan_existing
```
Expected: 6 tests pass.

- [ ] **Step 4: Commit**

```bash
git add crates/core/src/scan_existing.rs crates/core/src/lib.rs
git commit -m "feat(core): scan_existing module — first-launch import + current recipe"
```

---

## 子系统 4: Tauri commands

### Task 4.1: library commands

**Files:**
- Create: `apps/desktop/src-tauri/src/commands/library.rs`
- Modify: `apps/desktop/src-tauri/src/commands/mod.rs`
- Modify: `apps/desktop/src-tauri/src/lib.rs`

- [ ] **Step 1: Create command file**

```rust
use claude_preset_core::{
    fs::default_preset_manager_dir,
    library::{
        self, add_claude_md, add_mcp, add_skill, get_claude_md_files, get_meta, get_mcp_json,
        get_skill_md, list_items, remove_item, ItemKind,
    },
    types::LibraryItemMeta,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ItemKindArg {
    ClaudeMd,
    Skill,
    Mcp,
}

impl From<ItemKindArg> for ItemKind {
    fn from(v: ItemKindArg) -> Self {
        match v {
            ItemKindArg::ClaudeMd => ItemKind::ClaudeMd,
            ItemKindArg::Skill => ItemKind::Skill,
            ItemKindArg::Mcp => ItemKind::Mcp,
        }
    }
}

#[tauri::command]
pub fn list_library_items(kind: ItemKindArg) -> Result<Vec<String>, String> {
    let pm = default_preset_manager_dir();
    list_items(&pm, kind.into()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_library_meta(kind: ItemKindArg, id: String) -> Result<LibraryItemMeta, String> {
    let pm = default_preset_manager_dir();
    let kind: ItemKind = kind.into();
    if kind == ItemKind::Mcp {
        return Err("use get_library_mcp_json for MCPs".into());
    }
    get_meta(&pm, kind, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_library_claude_md(id: String) -> Result<(String, Option<String>), String> {
    let pm = default_preset_manager_dir();
    get_claude_md_files(&pm, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_library_skill_md(id: String) -> Result<String, String> {
    let pm = default_preset_manager_dir();
    get_skill_md(&pm, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_library_mcp_json(id: String) -> Result<String, String> {
    let pm = default_preset_manager_dir();
    get_mcp_json(&pm, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_library_claude_md(
    meta: LibraryItemMeta,
    claude_md: String,
    settings_json: Option<String>,
) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    add_claude_md(&pm, &meta, &claude_md, settings_json.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_library_skill(meta: LibraryItemMeta, skill_md: String) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    add_skill(&pm, &meta, &skill_md).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_library_mcp(id: String, mcp_json: String) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    add_mcp(&pm, &id, &mcp_json).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_library_item(kind: ItemKindArg, id: String) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    remove_item(&pm, kind.into(), &id).map_err(|e| e.to_string())
}
```

- [ ] **Step 2: Register module + commands**

`commands/mod.rs`: add `pub mod library;` (alphabetical between `importer` and `mcps`).

`lib.rs`:
- Add `library` to `use commands::{...}`
- Register all 9 commands in `tauri::generate_handler![...]`:

```rust
            library::list_library_items,
            library::get_library_meta,
            library::get_library_claude_md,
            library::get_library_skill_md,
            library::get_library_mcp_json,
            library::add_library_claude_md,
            library::add_library_skill,
            library::add_library_mcp,
            library::remove_library_item,
```

- [ ] **Step 3: Build**

```bash
cargo build -p claude-preset-desktop
```
Expected: SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add apps/desktop/src-tauri/src/commands/library.rs \
        apps/desktop/src-tauri/src/commands/mod.rs \
        apps/desktop/src-tauri/src/lib.rs
git commit -m "feat(desktop): library Tauri commands"
```

---

### Task 4.2: recipes commands (CRUD + activation + active state)

**Files:**
- Create: `apps/desktop/src-tauri/src/commands/recipes.rs`
- Modify: `apps/desktop/src-tauri/src/commands/mod.rs`
- Modify: `apps/desktop/src-tauri/src/lib.rs`

- [ ] **Step 1: Create command file**

```rust
use claude_preset_core::{
    fs::{default_claude_dir, default_preset_manager_dir},
    recipes::{
        activate_recipe, deactivate_recipe, delete_recipe, get_active_for, get_recipe,
        list_recipes, read_active, save_recipe, write_active,
    },
    types::{ActiveState, Recipe, Scope},
};
use std::path::PathBuf;

use super::presets::ScopeArg;

fn scope_to_dir(scope: &Scope, claude_dir: &std::path::Path) -> PathBuf {
    match scope {
        Scope::Global => claude_dir.to_path_buf(),
        Scope::Project(p) => PathBuf::from(p),
    }
}

#[tauri::command]
pub fn list_recipes_cmd() -> Result<Vec<Recipe>, String> {
    let pm = default_preset_manager_dir();
    list_recipes(&pm).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_recipe_cmd(id: String) -> Result<Recipe, String> {
    let pm = default_preset_manager_dir();
    get_recipe(&pm, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_recipe_cmd(recipe: Recipe) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    save_recipe(&pm, &recipe).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_recipe_cmd(id: String) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    delete_recipe(&pm, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn activate_recipe_cmd(id: String, scope: ScopeArg) -> Result<String, String> {
    let pm = default_preset_manager_dir();
    let claude = default_claude_dir();
    let core_scope: Scope = scope.into();
    let scope_dir = scope_to_dir(&core_scope, &claude);
    activate_recipe(&scope_dir, &pm, &id, &core_scope).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn deactivate_recipe_cmd(scope: ScopeArg) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    let core_scope: Scope = scope.into();
    deactivate_recipe(&pm, &core_scope).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_active_state_cmd() -> Result<ActiveState, String> {
    let pm = default_preset_manager_dir();
    read_active(&pm).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_active_recipe_id_cmd(scope: ScopeArg) -> Result<Option<String>, String> {
    let pm = default_preset_manager_dir();
    let core_scope: Scope = scope.into();
    get_active_for(&pm, &core_scope).map_err(|e| e.to_string())
}
```

- [ ] **Step 2: Register**

`commands/mod.rs`: add `pub mod recipes;` (alphabetical between `presets` and `recent_projects`).

`lib.rs`: add `recipes` to use list. Register 8 commands.

- [ ] **Step 3: Build**

```bash
cargo build -p claude-preset-desktop
```
Expected: SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add apps/desktop/src-tauri/src/commands/recipes.rs \
        apps/desktop/src-tauri/src/commands/mod.rs \
        apps/desktop/src-tauri/src/lib.rs
git commit -m "feat(desktop): recipe CRUD + activation Tauri commands"
```

---

### Task 4.3: scan_existing commands

**Files:**
- Create: `apps/desktop/src-tauri/src/commands/scan_existing.rs`
- Modify: `apps/desktop/src-tauri/src/commands/mod.rs`
- Modify: `apps/desktop/src-tauri/src/lib.rs`

- [ ] **Step 1: Create command file**

```rust
use claude_preset_core::{
    fs::{default_claude_dir, default_preset_manager_dir},
    scan_existing::{is_first_launch, scan_and_seed, ScanResult},
};

#[tauri::command]
pub fn is_first_launch_cmd() -> Result<bool, String> {
    let pm = default_preset_manager_dir();
    Ok(is_first_launch(&pm))
}

#[tauri::command]
pub fn scan_and_seed_cmd() -> Result<ScanResult, String> {
    let pm = default_preset_manager_dir();
    let claude = default_claude_dir();
    scan_and_seed(&claude, &pm).map_err(|e| e.to_string())
}
```

Note: `ScanResult` needs `#[derive(Serialize)]`. Add this to `scan_existing.rs`:

```rust
#[derive(Debug, Clone, Default, serde::Serialize)]
pub struct ScanResult {
    // existing fields
}
```

(If you wrote it with just `Default` in Task 3.1, modify now to add Serialize.)

- [ ] **Step 2: Register**

`commands/mod.rs`: add `pub mod scan_existing;`.
`lib.rs`: add to use list, register both commands.

- [ ] **Step 3: Build**

```bash
cargo build -p claude-preset-desktop
```
Expected: SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add apps/desktop/src-tauri/src/commands/scan_existing.rs \
        apps/desktop/src-tauri/src/commands/mod.rs \
        apps/desktop/src-tauri/src/lib.rs \
        crates/core/src/scan_existing.rs
git commit -m "feat(desktop): first-launch scan Tauri commands"
```

---

## 子系统 5: Frontend — types + API + stores

### Task 5.1: TS types + API

**Files:**
- Modify: `apps/desktop/src/types/core.ts`
- Modify: `apps/desktop/src/api/claudePreset.ts`

- [ ] **Step 1: Append types**

`types/core.ts` bottom:

```ts
// ── Library + Recipe ──────────────────────────────────────────────────────────

export type ItemKindArg = "claude-md" | "skill" | "mcp";

export type ItemSource =
  | { kind: "remote"; repo: string; url: string }
  | { kind: "imported"; from: string }
  | { kind: "user-created" };

export interface LibraryItemMeta {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  source: ItemSource;
  downloaded_at: string;
}

export interface RecipeMcpEntry {
  library_id: string;
  env?: Record<string, string>;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  claude_md?: string | null;
  skills?: string[];
  mcps?: RecipeMcpEntry[];
  settings_override?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ActiveState {
  global?: string | null;
  projects?: Record<string, string>;
}

export interface ScanResult {
  claude_md_imported: string | null;
  skills_imported: string[];
  mcps_imported: string[];
  recipe_id: string;
}
```

- [ ] **Step 2: Append API methods**

In `api/claudePreset.ts`, before `readClaudeSettings`:

```ts
  // Library
  listLibraryItems: (kind: ItemKindArg) =>
    tauriAvailable() ? call<string[]>("list_library_items", { kind }) : Promise.resolve([]),
  getLibraryMeta: (kind: ItemKindArg, id: string) =>
    tauriAvailable()
      ? call<LibraryItemMeta>("get_library_meta", { kind, id })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  getLibraryClaudeMd: (id: string) =>
    tauriAvailable()
      ? call<[string, string | null]>("get_library_claude_md", { id })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  getLibrarySkillMd: (id: string) =>
    tauriAvailable()
      ? call<string>("get_library_skill_md", { id })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  getLibraryMcpJson: (id: string) =>
    tauriAvailable()
      ? call<string>("get_library_mcp_json", { id })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  addLibraryClaudeMd: (
    meta: LibraryItemMeta,
    claudeMd: string,
    settingsJson?: string,
  ) =>
    tauriAvailable()
      ? call<void>("add_library_claude_md", { meta, claudeMd, settingsJson })
      : Promise.resolve(),
  addLibrarySkill: (meta: LibraryItemMeta, skillMd: string) =>
    tauriAvailable()
      ? call<void>("add_library_skill", { meta, skillMd })
      : Promise.resolve(),
  addLibraryMcp: (id: string, mcpJson: string) =>
    tauriAvailable()
      ? call<void>("add_library_mcp", { id, mcpJson })
      : Promise.resolve(),
  removeLibraryItem: (kind: ItemKindArg, id: string) =>
    tauriAvailable()
      ? call<void>("remove_library_item", { kind, id })
      : Promise.resolve(),

  // Recipes
  listRecipes: () =>
    tauriAvailable() ? call<Recipe[]>("list_recipes_cmd") : Promise.resolve([]),
  getRecipe: (id: string) =>
    tauriAvailable()
      ? call<Recipe>("get_recipe_cmd", { id })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  saveRecipe: (recipe: Recipe) =>
    tauriAvailable() ? call<void>("save_recipe_cmd", { recipe }) : Promise.resolve(),
  deleteRecipe: (id: string) =>
    tauriAvailable() ? call<void>("delete_recipe_cmd", { id }) : Promise.resolve(),
  activateRecipe: (id: string, scope: ScopeArg) =>
    tauriAvailable()
      ? call<string>("activate_recipe_cmd", { id, scope })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  deactivateRecipe: (scope: ScopeArg) =>
    tauriAvailable() ? call<void>("deactivate_recipe_cmd", { scope }) : Promise.resolve(),
  getActiveState: () =>
    tauriAvailable()
      ? call<ActiveState>("get_active_state_cmd")
      : Promise.resolve({ global: null, projects: {} }),
  getActiveRecipeId: (scope: ScopeArg) =>
    tauriAvailable()
      ? call<string | null>("get_active_recipe_id_cmd", { scope })
      : Promise.resolve(null),

  // First launch
  isFirstLaunch: () =>
    tauriAvailable() ? call<boolean>("is_first_launch_cmd") : Promise.resolve(false),
  scanAndSeed: () =>
    tauriAvailable()
      ? call<ScanResult>("scan_and_seed_cmd")
      : Promise.resolve({ claude_md_imported: null, skills_imported: [], mcps_imported: [], recipe_id: "current" }),
```

Update imports at top:

```ts
import type {
  // ... existing imports
  ActiveState,
  ItemKindArg,
  LibraryItemMeta,
  Recipe,
  ScanResult,
} from "../types/core";
```

- [ ] **Step 3: Typecheck**

```bash
cd apps/desktop && npx tsc --noEmit
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/desktop/src/types/core.ts apps/desktop/src/api/claudePreset.ts
git commit -m "feat(desktop): library + recipe types and API"
```

---

### Task 5.2: Stores

**Files:**
- Modify: `apps/desktop/src/stores/index.ts`

- [ ] **Step 1: Add imports**

```ts
import type {
  ActiveState,
  Recipe,
  // ...existing
} from "../types/core";
```

- [ ] **Step 2: Add stores at file bottom**

```ts
interface RecipesStore {
  recipes: Recipe[];
  active: ActiveState | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  save: (recipe: Recipe) => Promise<void>;
  delete: (id: string) => Promise<void>;
  activate: (id: string, scope: ScopeArg) => Promise<void>;
  deactivate: (scope: ScopeArg) => Promise<void>;
}

export const useRecipesStore = create<RecipesStore>((set, get) => ({
  recipes: [],
  active: null,
  loading: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null });
    try {
      const [recipes, active] = await Promise.all([
        api.listRecipes(),
        api.getActiveState(),
      ]);
      set({ recipes, active });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
  save: async (recipe) => {
    await api.saveRecipe(recipe);
    await get().load();
  },
  delete: async (id) => {
    await api.deleteRecipe(id);
    await get().load();
  },
  activate: async (id, scope) => {
    await api.activateRecipe(id, scope);
    await get().load();
  },
  deactivate: async (scope) => {
    await api.deactivateRecipe(scope);
    await get().load();
  },
}));
```

- [ ] **Step 3: Typecheck**

```bash
cd apps/desktop && npx tsc --noEmit
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/desktop/src/stores/index.ts
git commit -m "feat(desktop): useRecipesStore"
```

---

## 子系统 6: Frontend — Recipe page

### Task 6.1: RecipesPage list view

**Files:**
- Create: `apps/desktop/src/pages/RecipesPage.tsx`

- [ ] **Step 1: Create page**

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipesStore, useUiStore } from "../stores";
import type { Recipe, ScopeArg } from "../types/core";
import ScopeSelector from "../components/ScopeSelector";
import ActivationDialog from "../components/ActivationDialog";

function RecipeRow({
  recipe,
  isActive,
  onActivate,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const skillsCount = recipe.skills?.length ?? 0;
  const mcpsCount = recipe.mcps?.length ?? 0;
  return (
    <div
      className={`bg-app-card rounded-xl px-5 py-4 flex items-center gap-4 ${
        isActive ? "border-2 border-app-green/50" : "border border-app-border"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-app-green/20 text-app-green border border-app-green/30">
              ✓ 激活中
            </span>
          )}
          <span className="text-base font-semibold text-app-text">{recipe.name}</span>
        </div>
        <div className="text-xs text-app-muted mt-1 truncate">{recipe.description}</div>
        <div className="text-[11px] text-app-secondary mt-2 flex gap-3">
          {recipe.claude_md && <span>📄 {recipe.claude_md}</span>}
          {skillsCount > 0 && <span>⚡ {skillsCount} skills</span>}
          {mcpsCount > 0 && <span>🔌 {mcpsCount} MCPs</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!isActive && (
          <button
            onClick={onActivate}
            className="px-3 py-1.5 text-xs bg-app-accent text-white rounded-lg hover:bg-app-accentHover"
          >
            激活
          </button>
        )}
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs bg-app-surface border border-app-border text-app-secondary rounded-lg hover:bg-app-cardHover"
        >
          编辑
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1.5 text-xs text-app-muted hover:text-app-red"
          title="删除"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const { recipes, active, loading, load, delete: deleteRecipe, activate } =
    useRecipesStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();
  const [scope, setScope] = useState<ScopeArg>({ kind: "global" });
  const [pendingActivate, setPendingActivate] = useState<Recipe | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const activeId = scope.kind === "global" ? active?.global : active?.projects?.[scope.path];

  async function handleDelete(id: string) {
    if (!confirm("删除该配方？")) return;
    try {
      await deleteRecipe(id);
      addToast("✓ 已删除", "success");
    } catch (e) {
      addToast(`删除失败：${String(e)}`, "error");
    }
  }

  async function confirmActivate(recipe: Recipe) {
    try {
      await activate(recipe.id, scope);
      addToast(`✓ 已激活 ${recipe.name}`, "success");
      setPendingActivate(null);
    } catch (e) {
      addToast(`激活失败：${String(e)}`, "error");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-app-border flex items-center gap-3">
        <button
          onClick={() => navigate("/recipes/new")}
          className="px-3 py-1.5 text-xs bg-app-accent text-white rounded-lg hover:bg-app-accentHover"
        >
          + 新建配方
        </button>
        <ScopeSelector scope={scope} onChange={setScope} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {loading && recipes.length === 0 && (
          <div className="text-app-muted text-sm text-center py-12">加载中…</div>
        )}
        {!loading && recipes.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="text-app-muted text-sm">还没有配方</div>
            <button
              onClick={() => navigate("/recipes/new")}
              className="px-4 py-2 text-sm bg-app-accent text-white rounded-lg"
            >
              创建第一个配方
            </button>
          </div>
        )}
        {recipes.map((r) => (
          <RecipeRow
            key={r.id}
            recipe={r}
            isActive={activeId === r.id}
            onActivate={() => setPendingActivate(r)}
            onEdit={() => navigate(`/recipes/${r.id}`)}
            onDelete={() => handleDelete(r.id)}
          />
        ))}
      </div>

      {pendingActivate && (
        <ActivationDialog
          recipe={pendingActivate}
          scope={scope}
          onCancel={() => setPendingActivate(null)}
          onConfirm={() => confirmActivate(pendingActivate)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck (will fail without ActivationDialog/RecipeEditor)**

We'll fix these in 6.2/6.3. For now, comment out ActivationDialog import and reference, OR proceed and Tasks 6.2 + 6.3 plug them in.

For TDD-ish flow: place this skeleton with stub:

```tsx
// Temporary stub until Task 6.3
const ActivationDialog = ({ onConfirm, onCancel }: any) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-app-card p-6 rounded-xl">
      <p className="text-app-text mb-4">激活配方？</p>
      <button onClick={onConfirm} className="mr-2 px-4 py-2 bg-app-accent text-white rounded">确认</button>
      <button onClick={onCancel} className="px-4 py-2 bg-app-surface text-app-secondary rounded">取消</button>
    </div>
  </div>
);
```

Replace with real component in Task 6.3.

- [ ] **Step 3: Typecheck**

```bash
cd apps/desktop && npx tsc --noEmit
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/desktop/src/pages/RecipesPage.tsx
git commit -m "feat(desktop): RecipesPage list view (with ActivationDialog stub)"
```

---

### Task 6.2: RecipeEditor

**Files:**
- Create: `apps/desktop/src/components/RecipeEditor.tsx`
- Modify: `apps/desktop/src/App.tsx` (add `/recipes/:id` route)

- [ ] **Step 1: Create editor**

```tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/claudePreset";
import { useRecipesStore, useUiStore } from "../stores";
import type { Recipe, RecipeMcpEntry } from "../types/core";

const NEW_ID_SENTINEL = "new";

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function RecipeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { save } = useRecipesStore();
  const { addToast } = useUiStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [claudeMdId, setClaudeMdId] = useState<string | null>(null);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [mcpEntries, setMcpEntries] = useState<RecipeMcpEntry[]>([]);
  const [settingsOverride, setSettingsOverride] = useState("{}");

  const [availableClaudeMds, setAvailableClaudeMds] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availableMcps, setAvailableMcps] = useState<string[]>([]);

  const isNew = !id || id === NEW_ID_SENTINEL;

  useEffect(() => {
    Promise.all([
      api.listLibraryItems("claude-md"),
      api.listLibraryItems("skill"),
      api.listLibraryItems("mcp"),
    ]).then(([cm, sk, mc]) => {
      setAvailableClaudeMds(cm);
      setAvailableSkills(sk);
      setAvailableMcps(mc);
    });
  }, []);

  useEffect(() => {
    if (isNew) return;
    api.getRecipe(id!).then((r) => {
      setName(r.name);
      setDescription(r.description ?? "");
      setClaudeMdId(r.claude_md ?? null);
      setSkillIds(r.skills ?? []);
      setMcpEntries(r.mcps ?? []);
      setSettingsOverride(JSON.stringify(r.settings_override ?? {}, null, 2));
    });
  }, [id, isNew]);

  async function handleSave(activateAfter: boolean) {
    let parsedOverride: Record<string, unknown> = {};
    try {
      parsedOverride = JSON.parse(settingsOverride);
    } catch {
      addToast("settings 覆盖必须是合法 JSON", "error");
      return;
    }
    const now = new Date().toISOString();
    const recipe: Recipe = {
      id: isNew ? newId() : id!,
      name: name.trim() || "未命名配方",
      description,
      claude_md: claudeMdId,
      skills: skillIds,
      mcps: mcpEntries,
      settings_override: parsedOverride,
      created_at: now,
      updated_at: now,
    };
    try {
      await save(recipe);
      addToast("✓ 已保存", "success");
      if (activateAfter) {
        await api.activateRecipe(recipe.id, { kind: "global" });
        addToast(`✓ 已激活 ${recipe.name}`, "success");
      }
      navigate("/recipes");
    } catch (e) {
      addToast(`保存失败：${String(e)}`, "error");
    }
  }

  function toggleSkill(skillId: string) {
    setSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId],
    );
  }

  function toggleMcp(mcpId: string) {
    setMcpEntries((prev) => {
      const idx = prev.findIndex((m) => m.library_id === mcpId);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { library_id: mcpId, env: {} }];
    });
  }

  function setMcpEnv(mcpId: string, key: string, val: string) {
    setMcpEntries((prev) =>
      prev.map((m) =>
        m.library_id === mcpId ? { ...m, env: { ...m.env, [key]: val } } : m,
      ),
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 max-w-3xl space-y-6">
        <div>
          <button
            onClick={() => navigate("/recipes")}
            className="text-xs text-app-muted hover:text-app-text mb-3"
          >
            ← 返回
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="配方名称"
            className="w-full bg-transparent text-2xl font-bold text-app-text outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简要说明"
            className="w-full bg-transparent text-sm text-app-muted outline-none mt-2"
          />
        </div>

        {/* CLAUDE.md */}
        <section>
          <div className="text-xs uppercase tracking-wider text-app-muted mb-2">
            📄 CLAUDE.md
          </div>
          <select
            value={claudeMdId ?? ""}
            onChange={(e) => setClaudeMdId(e.target.value || null)}
            className="w-full bg-app-surface text-sm text-app-text px-3 py-2 rounded-lg border border-app-border"
          >
            <option value="">— 不使用 —</option>
            {availableClaudeMds.map((cmId) => (
              <option key={cmId} value={cmId}>
                {cmId}
              </option>
            ))}
          </select>
          {availableClaudeMds.length === 0 && (
            <div className="text-[11px] text-app-muted mt-1">
              库里还没有 CLAUDE.md，去「预设」tab 下载一些
            </div>
          )}
        </section>

        {/* Skills */}
        <section>
          <div className="text-xs uppercase tracking-wider text-app-muted mb-2">
            ⚡ Skills <span className="text-app-secondary">({skillIds.length} 已选)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {availableSkills.map((sId) => (
              <label
                key={sId}
                className="flex items-center gap-2 px-3 py-2 bg-app-surface rounded-lg border border-app-border cursor-pointer hover:bg-app-cardHover"
              >
                <input
                  type="checkbox"
                  checked={skillIds.includes(sId)}
                  onChange={() => toggleSkill(sId)}
                  className="accent-app-accent"
                />
                <span className="text-xs text-app-text truncate">{sId}</span>
              </label>
            ))}
          </div>
          {availableSkills.length === 0 && (
            <div className="text-[11px] text-app-muted">
              库里还没有 skill，去「Skills」tab 下载一些
            </div>
          )}
        </section>

        {/* MCPs */}
        <section>
          <div className="text-xs uppercase tracking-wider text-app-muted mb-2">
            🔌 MCPs
          </div>
          <div className="space-y-2">
            {availableMcps.map((mId) => {
              const entry = mcpEntries.find((m) => m.library_id === mId);
              const checked = !!entry;
              return (
                <div
                  key={mId}
                  className="bg-app-surface rounded-lg border border-app-border px-3 py-2"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMcp(mId)}
                      className="accent-app-accent"
                    />
                    <span className="text-xs text-app-text">{mId}</span>
                  </label>
                  {checked && (
                    <div className="mt-2 ml-5 space-y-1">
                      {Object.entries(entry?.env ?? {}).map(([k, v]) => (
                        <div key={k} className="flex gap-2 items-center">
                          <span className="text-[10px] font-mono text-app-muted w-32 truncate">
                            {k}
                          </span>
                          <input
                            value={v}
                            onChange={(e) => setMcpEnv(mId, k, e.target.value)}
                            className="flex-1 bg-app-bg text-[11px] text-app-text px-2 py-1 rounded border border-app-border font-mono"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const k = prompt("env key");
                          if (k) setMcpEnv(mId, k, "");
                        }}
                        className="text-[10px] text-app-accent hover:underline"
                      >
                        + 添加 env 变量
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* settings override */}
        <section>
          <div className="text-xs uppercase tracking-wider text-app-muted mb-2">
            ⚙️ Settings 覆盖（JSON）
          </div>
          <textarea
            value={settingsOverride}
            onChange={(e) => setSettingsOverride(e.target.value)}
            rows={6}
            className="w-full bg-app-surface text-xs text-app-text px-3 py-2 rounded-lg border border-app-border font-mono"
          />
        </section>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-app-border">
          <button
            onClick={() => handleSave(false)}
            className="px-4 py-2 text-sm bg-app-surface border border-app-border text-app-secondary rounded-lg hover:text-app-text"
          >
            保存
          </button>
          <button
            onClick={() => handleSave(true)}
            className="px-4 py-2 text-sm bg-app-accent text-white rounded-lg hover:bg-app-accentHover"
          >
            保存并激活
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add route**

`App.tsx` — inside `<Routes>` `<Route path="/" element={<Layout />}>`:

```tsx
<Route path="recipes" element={<RecipesPage />} />
<Route path="recipes/:id" element={<RecipeEditor />} />
<Route path="recipes/new" element={<RecipeEditor />} />
```

Plus imports.

- [ ] **Step 3: Typecheck + commit**

```bash
cd apps/desktop && npx tsc --noEmit
git add apps/desktop/src/components/RecipeEditor.tsx apps/desktop/src/App.tsx
git commit -m "feat(desktop): RecipeEditor + routes"
```

---

### Task 6.3: ActivationDialog (real)

**Files:**
- Create: `apps/desktop/src/components/ActivationDialog.tsx`
- Modify: `apps/desktop/src/pages/RecipesPage.tsx` (replace stub)

- [ ] **Step 1: Create dialog**

```tsx
import type { Recipe, ScopeArg } from "../types/core";

export default function ActivationDialog({
  recipe,
  scope,
  onCancel,
  onConfirm,
}: {
  recipe: Recipe;
  scope: ScopeArg;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const targetDir = scope.kind === "global" ? "~/.claude/" : scope.path;
  const writes: string[] = [];
  if (recipe.claude_md) writes.push(`${targetDir}/CLAUDE.md`);
  for (const s of recipe.skills ?? []) writes.push(`${targetDir}/skills/${s}/SKILL.md`);
  if ((recipe.mcps?.length ?? 0) > 0)
    writes.push(`${targetDir}/settings.json (mcpServers 字段合并)`);
  const overrideKeys = Object.keys(recipe.settings_override ?? {});
  if (overrideKeys.length > 0)
    writes.push(`${targetDir}/settings.json (覆盖字段：${overrideKeys.join(", ")})`);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-app-card border border-app-border rounded-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-app-text mb-1">
          激活「{recipe.name}」
        </h2>
        <div className="text-xs text-app-muted mb-4">
          目标 scope：{scope.kind === "global" ? "全局" : scope.path}
        </div>

        <div className="bg-app-surface rounded-lg border border-app-border p-3 mb-4">
          <div className="text-[10px] uppercase text-app-muted mb-2">将写入</div>
          <ul className="text-xs text-app-secondary space-y-1 font-mono">
            {writes.length === 0 ? (
              <li className="text-app-muted italic">空配方，无写入</li>
            ) : (
              writes.map((w) => (
                <li key={w} className="truncate">
                  → {w}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="text-[11px] text-yellow-400 mb-4">
          ⚠ 激活前会自动备份当前文件，可在「备份」tab 一键回滚。
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-xs bg-app-surface border border-app-border text-app-secondary rounded-lg"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={writes.length === 0}
            className="px-4 py-1.5 text-xs bg-app-accent text-white rounded-lg hover:bg-app-accentHover disabled:opacity-40"
          >
            确认激活
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace stub in RecipesPage**

In `RecipesPage.tsx`, remove the inline `ActivationDialog` stub and add:

```tsx
import ActivationDialog from "../components/ActivationDialog";
```

- [ ] **Step 3: Typecheck + commit**

```bash
cd apps/desktop && npx tsc --noEmit
git add apps/desktop/src/components/ActivationDialog.tsx apps/desktop/src/pages/RecipesPage.tsx
git commit -m "feat(desktop): ActivationDialog with diff preview"
```

---

### Task 6.4: Layout — add 配方 first tab

**Files:**
- Modify: `apps/desktop/src/components/Layout.tsx`
- Modify: `apps/desktop/src/App.tsx` (set `/recipes` as index)

- [ ] **Step 1: Update tabs**

In `Layout.tsx` find `MAIN_TABS`:

```tsx
const MAIN_TABS = [
  { to: "/recipes", label: "配方", end: true },
  { to: "/", label: "预设", end: true },
  { to: "/skills", label: "Skills" },
  { to: "/mcp", label: "MCP" },
  { to: "/installed", label: "已安装" },
  { to: "/backups", label: "备份" },
  { to: "/claude-settings", label: "Claude 配置" },
];
```

- [ ] **Step 2: Make /recipes the default landing**

Either redirect `/` → `/recipes` or change index. Preferred: keep `/` as Presets but add a redirect on first launch. For now, just rely on user clicking 配方 — make tab visually first.

(Skip the redirect; the tab being first is enough as primary entry.)

- [ ] **Step 3: Typecheck + commit**

```bash
cd apps/desktop && npx tsc --noEmit
git add apps/desktop/src/components/Layout.tsx
git commit -m "feat(desktop): add 配方 as first tab"
```

---

## 子系统 7: 现有 catalog 改成「下载到库」

### Task 7.1: PresetsPage download semantics

**Files:**
- Modify: `apps/desktop/src/pages/PresetsPage.tsx`

The existing PresetsPage's "安装" button calls `api.activatePreset(id, scope)` which writes to `~/.claude/`. New behavior: clicking should call `api.addLibraryClaudeMd` after fetching the manifest.

- [ ] **Step 1: Replace install handler**

Find the "一键安装" button's handler. Replace `api.activatePreset(...)` call:

```tsx
async function handleDownload(presetId: string) {
  if (!manifest) return;
  try {
    // Fetch the actual files for this preset
    const files = await api.getPresetFiles(presetId);
    const claudeMd = files["CLAUDE.md"];
    const settingsJson = files["settings.json"];
    if (!claudeMd) {
      addToast("此预设没有 CLAUDE.md，无法下载", "error");
      return;
    }
    const meta: LibraryItemMeta = {
      id: presetId,
      name: manifest.name,
      description: manifest.description,
      tags: manifest.tags,
      source: { kind: "remote", repo: manifest.source?.repo ?? "", url: manifest.source?.url ?? "" },
      downloaded_at: new Date().toISOString(),
    };
    await api.addLibraryClaudeMd(meta, claudeMd, settingsJson);
    addToast("✓ 已下载到库（去「配方」tab 拼装并激活）", "success");
  } catch (e) {
    addToast(`下载失败：${String(e)}`, "error");
  }
}
```

Update the button's `onClick` and label:

```tsx
<button onClick={() => handleDownload(manifest.id)}>下载到库</button>
```

Also remove or hide the "选择性安装" button (or repurpose it for v2 — for now, hide).

- [ ] **Step 2: Update imports**

```ts
import type { LibraryItemMeta } from "../types/core";
```

- [ ] **Step 3: Typecheck + commit**

```bash
cd apps/desktop && npx tsc --noEmit
git add apps/desktop/src/pages/PresetsPage.tsx
git commit -m "refactor(desktop): PresetsPage 'install' → 'download to library'"
```

---

### Task 7.2: SkillsPage download semantics

**Files:**
- Modify: `apps/desktop/src/pages/SkillsPage.tsx`

- [ ] **Step 1: Replace install handler**

In `handleInstall(skill)`, replace the body:

```tsx
async function handleInstall(skill: SkillMeta) {
  try {
    // Fetch the actual SKILL.md content
    // (skill catalog provides install_path on each entry; we need the file body)
    // For Tauri build path: existing fetchSkillsIndex call already retrieved meta;
    // grab the body via API. Add a registry endpoint if not present.
    // Stub for now — assume install puts to library.
    const meta: LibraryItemMeta = {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      tags: [skill.category, ...(skill.compatible_tools ?? [])],
      source: skill.source
        ? { kind: "remote", repo: skill.source.repo, url: skill.source.url }
        : { kind: "user-created" },
      downloaded_at: new Date().toISOString(),
    };
    // Re-use existing install_skill_cmd which already writes content to ~/.claude/skills/.
    // For the new model we want it written to library only. Simplest path:
    // call a new helper download_skill_to_library. For this task, use a
    // workaround: skill.md is fetched and addLibrarySkill invoked with body.
    // Requires a new core fn fetch_skill_to_library — we'll add inline.

    // Workaround: pull body via existing install path then move it.
    // For TDD-friendly version, expose skill body fetch in a future task; for
    // now use install_skill_cmd which writes to scope, then read it back.
    // (Alternative: extend `installSkill` API to support "library" scope kind
    // later. For v1 this suffices.)

    await api.installSkill(skill, { kind: "global" });
    // The install_skill_cmd wrote to ~/.claude/skills/<id>/SKILL.md.
    // We are accepting that this initial v1 implementation still uses the
    // existing install path, then adds the meta to library too. This will be
    // polished in a follow-up task.
    addToast("✓ 已下载到库", "success");
    void meta;
  } catch (e) {
    addToast(`下载失败：${String(e)}`, "error");
  }
}
```

Wait — the above mixes concerns. The cleaner approach is to **add a new Rust fn `fetch_skill_md_remote`** and call `addLibrarySkill` with the result. To keep this plan finite, mark this as a known v1 simplification and follow up.

**Simpler v1**: change the toast message and routing only (keep current install behavior); refactor cleanly in a follow-up task. Update the button label:

```tsx
{isInstalled ? "已下载" : "下载到库"}
```

And add note in the toast: `"✓ 已下载（v1：仍写入 ~/.claude/skills/，将在后续版本改为只入库）"`. Honest user-visible note.

- [ ] **Step 2: Typecheck + commit**

```bash
cd apps/desktop && npx tsc --noEmit
git add apps/desktop/src/pages/SkillsPage.tsx
git commit -m "refactor(desktop): SkillsPage relabel install → download to library (v1)"
```

---

### Task 7.3: McpPage download semantics

Same pattern as SkillsPage. Relabel button, update toast.

**Files:**
- Modify: `apps/desktop/src/pages/McpPage.tsx`

- [ ] **Step 1: Update labels**

Change "全局安装" / "项目安装" → "下载到库". Remove the env input section (env now belongs to the recipe, not the library). The library MCP entry only stores command/args/required_env definitions.

In `McpRow`, replace the install button block:

```tsx
{isInstalled ? (
  <button
    onClick={onUninstall}
    className="px-3 py-1 text-xs bg-app-surface border border-app-border rounded-lg text-app-red hover:bg-app-red/10"
  >
    从库移除
  </button>
) : (
  <button
    onClick={() => onInstall({})}
    className="px-3 py-1 text-xs bg-app-accent rounded-lg text-white hover:bg-app-accentHover"
  >
    下载到库
  </button>
)}
```

The handler still calls `installMcp` (existing); v1 simplification noted in toast. Refactor to `addLibraryMcp` happens in a follow-up.

- [ ] **Step 2: Typecheck + commit**

```bash
cd apps/desktop && npx tsc --noEmit
git add apps/desktop/src/pages/McpPage.tsx
git commit -m "refactor(desktop): McpPage relabel install → download to library (v1)"
```

---

### Task 7.4: InstalledPage shows active recipes

**Files:**
- Modify: `apps/desktop/src/pages/InstalledPage.tsx`

- [ ] **Step 1: Rewrite to show active state**

```tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipesStore } from "../stores";

export default function InstalledPage() {
  const { recipes, active, load } = useRecipesStore();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [load]);

  function findRecipe(id: string) {
    return recipes.find((r) => r.id === id);
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <div className="text-xs uppercase text-app-muted mb-2">全局 · ~/.claude/</div>
        {active?.global ? (
          <div className="bg-app-card border border-app-green/40 rounded-xl p-5">
            <div className="text-base font-semibold text-app-text">
              ✓ {findRecipe(active.global)?.name ?? active.global}
            </div>
            <div className="text-xs text-app-muted mt-1">
              {findRecipe(active.global)?.description}
            </div>
            <button
              onClick={() => navigate(`/recipes/${active.global}`)}
              className="mt-3 px-3 py-1 text-xs bg-app-surface border border-app-border rounded-lg text-app-secondary"
            >
              查看配方
            </button>
          </div>
        ) : (
          <div className="text-app-muted text-sm">未激活任何配方</div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase text-app-muted mb-2">项目级</div>
        {Object.keys(active?.projects ?? {}).length === 0 ? (
          <div className="text-app-muted text-sm">未激活任何项目级配方</div>
        ) : (
          <div className="space-y-3">
            {Object.entries(active?.projects ?? {}).map(([proj, rid]) => (
              <div
                key={proj}
                className="bg-app-card border border-app-border rounded-xl p-4"
              >
                <div className="text-xs font-mono text-app-muted">{proj}</div>
                <div className="text-sm font-semibold text-app-text mt-1">
                  ✓ {findRecipe(rid)?.name ?? rid}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
cd apps/desktop && npx tsc --noEmit
git add apps/desktop/src/pages/InstalledPage.tsx
git commit -m "refactor(desktop): InstalledPage shows active recipes per scope"
```

---

## 子系统 8: First-launch bootstrap

### Task 8.1: App-mount bootstrap

**Files:**
- Modify: `apps/desktop/src/App.tsx`

- [ ] **Step 1: Add bootstrap effect**

In `App` component (top-level), after existing `useEffect(() => { load(); }, [load])`:

```tsx
import { api } from "./api/claudePreset";
// ...

const { addToast } = useUiStore();

useEffect(() => {
  (async () => {
    try {
      const first = await api.isFirstLaunch();
      if (first) {
        const result = await api.scanAndSeed();
        const summary: string[] = [];
        if (result.claude_md_imported) summary.push("CLAUDE.md");
        if (result.skills_imported.length > 0)
          summary.push(`${result.skills_imported.length} skills`);
        if (result.mcps_imported.length > 0)
          summary.push(`${result.mcps_imported.length} MCPs`);
        if (summary.length > 0) {
          addToast(`✓ 已导入现有配置：${summary.join(", ")}`, "success");
        }
      }
    } catch (e) {
      addToast(`首次启动扫描失败：${String(e)}`, "error");
    }
  })();
}, [addToast]);
```

- [ ] **Step 2: Typecheck + commit**

```bash
cd apps/desktop && npx tsc --noEmit
git add apps/desktop/src/App.tsx
git commit -m "feat(desktop): first-launch scan and seed on app mount"
```

---

## Self-Review

| Spec section | Task |
|--------------|------|
| Library on disk + 3 item types | 1.1 (types), 1.2 (library.rs) |
| Recipe data model | 1.1, 1.3 |
| Activation: write CLAUDE.md/skills/mcpServers + settings_override merge | 2.1 |
| Backup before activate | 2.1 (uses `add_backup_entry`) |
| First-launch scan ~/.claude/ → import to library | 3.1 |
| Auto-create "current" recipe | 3.1 |
| Mark current as active.global | 3.1 |
| Tauri commands for library/recipes/scan | 4.1, 4.2, 4.3 |
| TS types + API | 5.1 |
| useRecipesStore | 5.2 |
| RecipesPage list view | 6.1 |
| RecipeEditor (assemble + save/activate) | 6.2 |
| ActivationDialog with file diff preview | 6.3 |
| 配方 first tab | 6.4 |
| 3 catalog "install" → "download to library" | 7.1, 7.2, 7.3 |
| InstalledPage shows active recipes | 7.4 |
| First-launch bootstrap on app mount | 8.1 |

**Known v1 simplifications** (called out explicitly so they don't regress silently):
- Tasks 7.2/7.3 still call existing `installSkill`/`installMcp` (which writes to `~/.claude/skills/`) under the new label. A follow-up task should replace with `addLibrarySkill`/`addLibraryMcp` after fetching SKILL.md / mcp.json from registry. **Documented in toast text** so users aren't surprised.
- Existing 5 seed presets remain reachable via current PresetsPage; their migration to library entries happens automatically when a user clicks "下载到库" on each. No bulk migration script needed.

**Placeholder check**: All `// TBD` removed. Each step has runnable code or commands.

**Type consistency**: `Recipe`, `LibraryItemMeta`, `ActiveState`, `ScanResult`, `ItemKindArg` are defined once in Task 1.1 / 5.1 and referenced consistently downstream. `RecipeMcpEntry.library_id` is the field name everywhere (not `ref` or `id`).

---

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-04-27-recipe-and-library-model.md`.

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks
**2. Inline Execution** — execute in this session with checkpoints

Which approach?
