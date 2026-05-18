use ccpm_core::{
    config::load_config,
    fs::default_preset_manager_dir,
    registry::{build_client, fetch_bundles_index, load_bundles_from_cache},
    types::BundleIndex,
};

#[tauri::command]
pub async fn fetch_bundles_index_cmd(force_refresh: bool) -> Result<BundleIndex, String> {
    let pm_dir = default_preset_manager_dir();
    let config = load_config(&pm_dir).map_err(|e| e.to_string())?;
    let cache_dir = pm_dir.join("cache");
    if !force_refresh {
        if let Ok(Some(cached)) = load_bundles_from_cache(&cache_dir, config.cache_ttl_minutes) {
            return Ok(cached);
        }
    } else {
        let _ = std::fs::remove_file(cache_dir.join("bundles-index.json"));
    }
    let client = build_client(&config).map_err(|e| e.to_string())?;
    fetch_bundles_index(&client, &config.preset_source_url, &cache_dir, force_refresh)
        .await
        .map_err(|e| e.to_string())
}
