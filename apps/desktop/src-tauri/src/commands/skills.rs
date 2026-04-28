use ccpm_core::{
    config::load_config,
    fs::{default_claude_dir, default_preset_manager_dir},
    registry::{
        build_client, fetch_skill_content, fetch_skills_index, load_skills_from_cache,
    },
    skills::{install_skill, list_installed_skills, uninstall_skill},
    types::{Scope, SkillIndex, SkillMeta},
};
use std::path::PathBuf;

use super::presets::ScopeArg;

fn scope_to_dir(scope: &Scope, claude_dir: &std::path::Path) -> PathBuf {
    match scope {
        Scope::Global => claude_dir.to_path_buf(),
        Scope::Project(path) => PathBuf::from(path),
    }
}

#[tauri::command]
pub async fn fetch_skills_index_cmd(force_refresh: bool) -> Result<SkillIndex, String> {
    let pm_dir = default_preset_manager_dir();
    let config = load_config(&pm_dir).map_err(|e| e.to_string())?;
    let cache_dir = pm_dir.join("cache");
    if !force_refresh {
        if let Ok(Some(cached)) = load_skills_from_cache(&cache_dir, config.cache_ttl_minutes) {
            return Ok(cached);
        }
    }
    let client = build_client(&config).map_err(|e| e.to_string())?;
    fetch_skills_index(&client, &config.preset_source_url, &cache_dir)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn install_skill_cmd(meta: SkillMeta, scope: ScopeArg) -> Result<(), String> {
    let pm_dir = default_preset_manager_dir();
    let claude_dir = default_claude_dir();
    let config = load_config(&pm_dir).map_err(|e| e.to_string())?;
    let client = build_client(&config).map_err(|e| e.to_string())?;
    let content = fetch_skill_content(&client, &config.preset_source_url, &meta.id)
        .await
        .map_err(|e| e.to_string())?;
    let core_scope: Scope = scope.into();
    let scope_dir = scope_to_dir(&core_scope, &claude_dir);
    install_skill(&scope_dir, &pm_dir, &meta, &content, &core_scope).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn uninstall_skill_cmd(meta: SkillMeta, scope: ScopeArg) -> Result<(), String> {
    let pm_dir = default_preset_manager_dir();
    let claude_dir = default_claude_dir();
    let core_scope: Scope = scope.into();
    let scope_dir = scope_to_dir(&core_scope, &claude_dir);
    uninstall_skill(&scope_dir, &pm_dir, &meta, &core_scope).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_installed_skills_cmd(scope: ScopeArg) -> Result<Vec<String>, String> {
    let pm_dir = default_preset_manager_dir();
    let core_scope: Scope = scope.into();
    list_installed_skills(&pm_dir, &core_scope).map_err(|e| e.to_string())
}
