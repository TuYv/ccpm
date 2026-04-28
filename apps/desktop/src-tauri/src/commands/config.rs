use ccpm_core::{
    baseline::{capture_baseline, restore_baseline},
    config::{load_config, save_config},
    fs::{default_claude_dir, default_preset_manager_dir},
    types::AppConfig,
};

#[tauri::command]
pub fn get_config() -> Result<AppConfig, String> {
    let pm_dir = default_preset_manager_dir();
    load_config(&pm_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_config(config: AppConfig) -> Result<(), String> {
    let pm_dir = default_preset_manager_dir();
    save_config(&pm_dir, &config).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn capture_baseline_cmd() -> Result<(), String> {
    let pm_dir = default_preset_manager_dir();
    let claude_dir = default_claude_dir();
    capture_baseline(&claude_dir, &pm_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn restore_baseline_cmd() -> Result<(), String> {
    let pm_dir = default_preset_manager_dir();
    let claude_dir = default_claude_dir();
    restore_baseline(&claude_dir, &pm_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn baseline_status() -> bool {
    let pm_dir = default_preset_manager_dir();
    pm_dir.join("baseline").join("manifest.json").exists()
}
