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
const IMPORTED_CURRENT_ID: &str = "imported-current";
const IMPORTED_PREFIX: &str = "imported-";

#[derive(Debug, Clone, Default, serde::Serialize)]
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
        let id = IMPORTED_CURRENT_ID;
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
            let id = format!("{IMPORTED_PREFIX}{name}");
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
        let v: serde_json::Value = match serde_json::from_str(&s) {
            Ok(v) => v,
            Err(e) => {
                eprintln!(
                    "warning: ~/.claude/settings.json malformed, skipping mcpServers import: {e}"
                );
                serde_json::json!({})
            }
        };
        if let Some(servers) = v.get("mcpServers").and_then(|x| x.as_object()) {
            for (name, server) in servers {
                let id = format!("{IMPORTED_PREFIX}{name}");
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

    // 4. Build "current" recipe referencing all imports.
    // Preserve user-editable metadata (name/description/created_at) if a
    // current recipe already exists from a prior scan.
    let existing_current = crate::recipes::get_recipe(pm_dir, CURRENT_RECIPE_ID).ok();
    let (created_at, name, description) = match &existing_current {
        Some(r) => (r.created_at.clone(), r.name.clone(), r.description.clone()),
        None => (
            now_rfc3339(),
            "我的当前配置".to_string(),
            "首次启动时从 ~/.claude/ 自动导入".to_string(),
        ),
    };

    let recipe = Recipe {
        id: CURRENT_RECIPE_ID.into(),
        name,
        description,
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
        created_at,
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
