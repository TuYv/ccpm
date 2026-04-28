use crate::{
    error::AppError,
    fs::atomic_write,
    library::{self, ItemKind},
    state::{add_backup_entry, read_backup_index},
    types::{ActiveState, BackupEntry, McpMeta, Recipe, Scope},
};
use chrono::Utc;
use std::{collections::HashMap, fs, path::Path};

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
        && !rel.contains('\0')
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

    // Files we'll create (didn't exist before) — tracked so a partial-write
    // rollback can clean them up.
    let created: Vec<String> = target_rels
        .iter()
        .filter(|rel| !backed_up.contains(rel))
        .cloned()
        .collect();

    // Persist the BackupEntry BEFORE any writes to scope_dir, so a crash
    // mid-write is still discoverable for manual recovery.
    add_backup_entry(
        pm_dir,
        BackupEntry {
            id: backup_id.clone(),
            scope: scope.key().to_string(),
            previous_preset: None,
            created_at: Utc::now().to_rfc3339(),
            files: backed_up.clone(),
            created_files: created.clone(),
        },
    )?;

    // 3-5. Wrap writes in a closure so we can rollback atomically on failure.
    let write_result: Result<(), AppError> = (|| {
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
        Ok(())
    })();

    // On any write error, attempt rollback: restore backed_up files and
    // delete created files. active.json is NOT updated, so the activation
    // is not visible to the user.
    if let Err(e) = write_result {
        for rel in &backed_up {
            let backup_file = pm_dir.join("backups").join(&backup_id).join(rel);
            let target = scope_dir.join(rel);
            if let Ok(content) = std::fs::read_to_string(&backup_file) {
                let _ = atomic_write(&target, &content);
            }
        }
        for rel in &created {
            let target = scope_dir.join(rel);
            if target.exists() {
                let _ = std::fs::remove_file(&target);
            }
        }
        return Err(e);
    }

    // 7. Update active.json (only after successful writes)
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

// Suppress unused-import warning for read_backup_index / ItemKind / HashMap
// (kept for future use by scan_existing and recipe expansion).
#[allow(unused_imports, dead_code)]
fn _force_use_imports() {
    let _ = read_backup_index;
    let _: Option<ItemKind> = None;
    let _: Option<HashMap<String, String>> = None;
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
    fn test_activate_rolls_back_on_missing_skill() {
        use crate::library;
        use crate::types::{ItemSource, LibraryItemMeta};
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();
        std::fs::write(claude.join("CLAUDE.md"), "# original").unwrap();

        let m = LibraryItemMeta {
            id: "cm".into(),
            name: "cm".into(),
            description: "".into(),
            tags: vec![],
            source: ItemSource::UserCreated,
            downloaded_at: "2026-04-27T00:00:00Z".into(),
        };
        library::add_claude_md(&pm, &m, "# new", None).unwrap();

        let mut rec = r("rfail");
        rec.claude_md = Some("cm".into());
        rec.skills = vec!["does-not-exist".into()]; // missing library item
        save_recipe(&pm, &rec).unwrap();

        let result = activate_recipe(&claude, &pm, "rfail", &Scope::Global);
        assert!(result.is_err());
        // Original CLAUDE.md restored
        assert_eq!(
            std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
            "# original",
            "CLAUDE.md should be restored after partial-write rollback"
        );
        // active.json should not reflect a successful activate
        assert!(read_active(&pm).unwrap().global.is_none());
    }

    #[test]
    fn test_activate_rejects_traversal_in_skill_id() {
        use crate::library;
        use crate::types::{ItemSource, LibraryItemMeta};
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();

        let m = LibraryItemMeta {
            id: "cm".into(),
            name: "cm".into(),
            description: "".into(),
            tags: vec![],
            source: ItemSource::UserCreated,
            downloaded_at: "2026-04-27T00:00:00Z".into(),
        };
        library::add_claude_md(&pm, &m, "# x", None).unwrap();

        let mut rec = r("rtraversal");
        rec.claude_md = Some("cm".into());
        rec.skills = vec!["../etc".into()];
        save_recipe(&pm, &rec).unwrap();

        let result = activate_recipe(&claude, &pm, "rtraversal", &Scope::Global);
        assert!(matches!(result, Err(AppError::InvalidInput(_))));
        // CLAUDE.md should not have been written either
        assert!(!claude.join("CLAUDE.md").exists());
    }

    #[test]
    fn test_settings_override_non_object_is_skipped() {
        use crate::library;
        use crate::types::{ItemSource, LibraryItemMeta};
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();
        std::fs::write(
            claude.join("settings.json"),
            r#"{"model":"sonnet","keep":true}"#,
        )
        .unwrap();

        let m = LibraryItemMeta {
            id: "cm".into(),
            name: "cm".into(),
            description: "".into(),
            tags: vec![],
            source: ItemSource::UserCreated,
            downloaded_at: "2026-04-27T00:00:00Z".into(),
        };
        library::add_claude_md(&pm, &m, "# x", None).unwrap();

        let mut rec = r("rarr");
        rec.claude_md = Some("cm".into());
        rec.settings_override = serde_json::json!([1, 2, 3]); // array root — bug bait
        save_recipe(&pm, &rec).unwrap();

        activate_recipe(&claude, &pm, "rarr", &Scope::Global).unwrap();

        // Existing settings.json must NOT be turned into an array
        let v: serde_json::Value = serde_json::from_str(
            &std::fs::read_to_string(claude.join("settings.json")).unwrap(),
        )
        .unwrap();
        assert!(v.is_object(), "settings.json must remain an object after non-object override");
        // Original keys must survive
        assert_eq!(v["keep"], true);
    }

    #[test]
    fn test_restore_after_activate_removes_created_files() {
        use crate::library;
        use crate::types::{ItemSource, LibraryItemMeta};
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();
        // No pre-existing CLAUDE.md → it'll be CREATED by activation

        let m = LibraryItemMeta {
            id: "cm".into(),
            name: "cm".into(),
            description: "".into(),
            tags: vec![],
            source: ItemSource::UserCreated,
            downloaded_at: "2026-04-27T00:00:00Z".into(),
        };
        library::add_claude_md(&pm, &m, "# new", None).unwrap();

        let mut rec = r("rcreate");
        rec.claude_md = Some("cm".into());
        save_recipe(&pm, &rec).unwrap();

        let backup_id = activate_recipe(&claude, &pm, "rcreate", &Scope::Global).unwrap();
        assert!(claude.join("CLAUDE.md").exists());

        // Restore: should DELETE the created CLAUDE.md (since it didn't exist before)
        crate::fs::restore_backup_by_id(&pm, &claude, &backup_id).unwrap();
        assert!(
            !claude.join("CLAUDE.md").exists(),
            "CLAUDE.md should be removed since it was created by activation"
        );
    }

    #[test]
    fn test_activate_fails_when_claude_md_library_item_missing() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();
        std::fs::write(claude.join("CLAUDE.md"), "# original").unwrap();

        let mut rec = r("rmissing");
        rec.claude_md = Some("does-not-exist".into()); // never added to library
        save_recipe(&pm, &rec).unwrap();

        let result = activate_recipe(&claude, &pm, "rmissing", &Scope::Global);
        assert!(result.is_err(), "must fail when claude_md library item missing");
        // Original file restored
        assert_eq!(
            std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
            "# original",
            "CLAUDE.md must be restored after activation failed"
        );
        // active.json not updated
        assert!(read_active(&pm).unwrap().global.is_none());
    }

    #[test]
    fn test_activate_empty_recipe_does_nothing_to_files_but_updates_active() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();
        std::fs::write(claude.join("CLAUDE.md"), "# untouched").unwrap();

        let rec = r("rempty");
        save_recipe(&pm, &rec).unwrap();

        activate_recipe(&claude, &pm, "rempty", &Scope::Global).unwrap();
        // CLAUDE.md untouched (recipe doesn't reference it)
        assert_eq!(
            std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
            "# untouched"
        );
        // active.json reflects the empty recipe is "active"
        assert_eq!(read_active(&pm).unwrap().global.as_deref(), Some("rempty"));
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
}
