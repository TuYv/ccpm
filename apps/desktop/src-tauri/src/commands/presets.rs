use ccpm_core::{
    activator::{activate_preset, deactivate_preset},
    baseline::capture_baseline,
    config::load_config,
    fs::{default_claude_dir, default_preset_manager_dir, restore_backup_by_id},
    registry::{build_client, fetch_all_preset_files, fetch_index, fetch_preset_manifest},
    state::{read_backup_index, read_installed},
    types::{BackupEntry, PresetIndex, PresetManifest, RestoreOption, Scope},
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum ScopeArg {
    Global,
    Project { path: String },
}

impl From<ScopeArg> for Scope {
    fn from(s: ScopeArg) -> Self {
        match s {
            ScopeArg::Global => Scope::Global,
            ScopeArg::Project { path } => Scope::Project(path),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RestoreArg {
    Baseline,
    LastBackup,
    KeepFiles,
}

impl From<RestoreArg> for RestoreOption {
    fn from(r: RestoreArg) -> Self {
        match r {
            RestoreArg::Baseline => RestoreOption::Baseline,
            RestoreArg::LastBackup => RestoreOption::LastBackup,
            RestoreArg::KeepFiles => RestoreOption::KeepFiles,
        }
    }
}

fn scope_to_dir(scope: &Scope, claude_dir: &Path) -> PathBuf {
    match scope {
        Scope::Global => claude_dir.to_path_buf(),
        Scope::Project(path) => PathBuf::from(path),
    }
}

#[tauri::command]
pub async fn fetch_index_cmd(force_refresh: bool) -> Result<PresetIndex, String> {
    let pm_dir = default_preset_manager_dir();
    let config = load_config(&pm_dir).map_err(|e| e.to_string())?;
    let cache_dir = pm_dir.join("cache");

    if !force_refresh {
        if let Ok(Some(cached)) =
            ccpm_core::registry::load_from_cache(&cache_dir, config.cache_ttl_minutes)
        {
            return Ok(cached);
        }
    }

    let client = build_client(&config).map_err(|e| e.to_string())?;
    fetch_index(&client, &config.preset_source_url, &cache_dir)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_manifest(preset_id: String) -> Result<PresetManifest, String> {
    let pm_dir = default_preset_manager_dir();
    let config = load_config(&pm_dir).map_err(|e| e.to_string())?;
    let client = build_client(&config).map_err(|e| e.to_string())?;
    fetch_preset_manifest(&client, &config.preset_source_url, &preset_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_preset_files(preset_id: String) -> Result<HashMap<String, String>, String> {
    let pm_dir = default_preset_manager_dir();
    let config = load_config(&pm_dir).map_err(|e| e.to_string())?;
    let client = build_client(&config).map_err(|e| e.to_string())?;
    let manifest = fetch_preset_manifest(&client, &config.preset_source_url, &preset_id)
        .await
        .map_err(|e| e.to_string())?;
    fetch_all_preset_files(&client, &config.preset_source_url, &manifest)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn activate_preset_cmd(preset_id: String, scope: ScopeArg) -> Result<String, String> {
    let pm_dir = default_preset_manager_dir();
    let claude_dir = default_claude_dir();
    let config = load_config(&pm_dir).map_err(|e| e.to_string())?;

    capture_baseline(&claude_dir, &pm_dir).map_err(|e| e.to_string())?;

    let client = build_client(&config).map_err(|e| e.to_string())?;
    let manifest = fetch_preset_manifest(&client, &config.preset_source_url, &preset_id)
        .await
        .map_err(|e| e.to_string())?;
    let file_contents = fetch_all_preset_files(&client, &config.preset_source_url, &manifest)
        .await
        .map_err(|e| e.to_string())?;

    let core_scope: Scope = scope.into();
    let scope_dir = scope_to_dir(&core_scope, &claude_dir);
    let result = activate_preset(&scope_dir, &pm_dir, &manifest, &file_contents, &core_scope)
        .map_err(|e| e.to_string())?;
    Ok(result.backup_ref)
}

#[tauri::command]
pub fn activate_seed_preset_cmd(
    scope: ScopeArg,
    manifest: PresetManifest,
    file_contents: HashMap<String, String>,
) -> Result<String, String> {
    let pm_dir = default_preset_manager_dir();
    let claude_dir = default_claude_dir();

    capture_baseline(&claude_dir, &pm_dir).map_err(|e| e.to_string())?;

    let core_scope: Scope = scope.into();
    let scope_dir = scope_to_dir(&core_scope, &claude_dir);
    let result = activate_preset(&scope_dir, &pm_dir, &manifest, &file_contents, &core_scope)
        .map_err(|e| e.to_string())?;
    Ok(result.backup_ref)
}

#[tauri::command]
pub fn deactivate_preset_cmd(scope: ScopeArg, restore: RestoreArg) -> Result<(), String> {
    let pm_dir = default_preset_manager_dir();
    let claude_dir = default_claude_dir();
    let core_scope: Scope = scope.into();
    let scope_dir = scope_to_dir(&core_scope, &claude_dir);
    deactivate_preset(&scope_dir, &pm_dir, &core_scope, restore.into()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_backups() -> Result<Vec<BackupEntry>, String> {
    let pm_dir = default_preset_manager_dir();
    let index = read_backup_index(&pm_dir).map_err(|e| e.to_string())?;
    Ok(index.backups)
}

#[tauri::command]
pub fn restore_backup(backup_id: String) -> Result<(), String> {
    let pm_dir = default_preset_manager_dir();
    let claude_dir = default_claude_dir();
    let state = read_installed(&pm_dir).map_err(|e| e.to_string())?;
    restore_backup_by_id(&pm_dir, &claude_dir, &backup_id).map_err(|e| e.to_string())?;
    if state.global.as_ref().map(|a| a.backup_ref.as_str()) == Some(backup_id.as_str()) {
        let mut new_state = state;
        new_state.global = None;
        ccpm_core::state::write_installed(&pm_dir, &new_state)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
