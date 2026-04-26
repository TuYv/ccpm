use claude_preset_core::{
    config::load_config,
    fs::default_preset_manager_dir,
    importer::{import_from_github, ImportedBundle},
    registry::build_client,
};

#[tauri::command]
pub async fn import_from_github_cmd(url: String) -> Result<ImportedBundle, String> {
    let pm_dir = default_preset_manager_dir();
    let config = load_config(&pm_dir).map_err(|e| e.to_string())?;
    let client = build_client(&config).map_err(|e| e.to_string())?;
    import_from_github(&client, &url)
        .await
        .map_err(|e| e.to_string())
}
