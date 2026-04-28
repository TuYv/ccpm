use ccpm_core::{
    fs::default_preset_manager_dir, state::read_installed, types::InstalledState,
};

#[tauri::command]
pub fn get_installed() -> Result<InstalledState, String> {
    let pm_dir = default_preset_manager_dir();
    read_installed(&pm_dir).map_err(|e| e.to_string())
}
