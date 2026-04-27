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
