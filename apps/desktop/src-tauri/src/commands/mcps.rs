use claude_preset_core::{
    config::load_config,
    fs::{default_claude_dir, default_preset_manager_dir},
    mcp::{install_mcp, list_installed_mcps, uninstall_mcp},
    registry::{build_client, fetch_mcps_index, load_mcps_from_cache},
    types::{McpIndex, McpMeta, Scope},
};
use std::{collections::HashMap, path::PathBuf};

use super::presets::ScopeArg;

fn scope_to_dir(scope: &Scope, claude_dir: &std::path::Path) -> PathBuf {
    match scope {
        Scope::Global => claude_dir.to_path_buf(),
        Scope::Project(path) => PathBuf::from(path),
    }
}

#[tauri::command]
pub async fn fetch_mcps_index_cmd(force_refresh: bool) -> Result<McpIndex, String> {
    let pm_dir = default_preset_manager_dir();
    let config = load_config(&pm_dir).map_err(|e| e.to_string())?;
    let cache_dir = pm_dir.join("cache");
    if !force_refresh {
        if let Ok(Some(cached)) = load_mcps_from_cache(&cache_dir, config.cache_ttl_minutes) {
            return Ok(cached);
        }
    }
    let client = build_client(&config).map_err(|e| e.to_string())?;
    fetch_mcps_index(&client, &config.preset_source_url, &cache_dir)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn install_mcp_cmd(
    meta: McpMeta,
    scope: ScopeArg,
    env: HashMap<String, String>,
) -> Result<(), String> {
    let pm_dir = default_preset_manager_dir();
    let claude_dir = default_claude_dir();
    let core_scope: Scope = scope.into();
    let scope_dir = scope_to_dir(&core_scope, &claude_dir);
    install_mcp(&scope_dir, &pm_dir, &meta, &env, &core_scope).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn uninstall_mcp_cmd(mcp_id: String, scope: ScopeArg) -> Result<(), String> {
    let pm_dir = default_preset_manager_dir();
    let claude_dir = default_claude_dir();
    let core_scope: Scope = scope.into();
    let scope_dir = scope_to_dir(&core_scope, &claude_dir);
    uninstall_mcp(&scope_dir, &pm_dir, &mcp_id, &core_scope).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_installed_mcps_cmd(scope: ScopeArg) -> Result<Vec<String>, String> {
    let pm_dir = default_preset_manager_dir();
    let core_scope: Scope = scope.into();
    list_installed_mcps(&pm_dir, &core_scope).map_err(|e| e.to_string())
}
