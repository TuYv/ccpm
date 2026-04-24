use crate::{
    error::AppError,
    fs::atomic_write,
    types::{AppConfig, PresetIndex, PresetManifest},
};
use std::path::Path;

fn validate_preset_id(id: &str) -> Result<(), AppError> {
    if id.is_empty()
        || id.contains(['/', '\\', '\0'])
        || id.contains("..")
        || id.starts_with('-')
    {
        return Err(AppError::InvalidInput(format!("无效的 preset ID：'{}'", id)));
    }
    Ok(())
}

fn validate_filename(name: &str) -> Result<(), AppError> {
    let p = std::path::Path::new(name);
    if p.is_absolute() || p.components().any(|c| c == std::path::Component::ParentDir) {
        return Err(AppError::InvalidInput(format!("unsafe filename: '{}'", name)));
    }
    Ok(())
}

// ── Cache ─────────────────────────────────────────────────────────────────────

/// Loads the preset index from local cache. Returns None if missing or expired.
pub fn load_from_cache(cache_dir: &Path, ttl_minutes: u64) -> Result<Option<PresetIndex>, AppError> {
    let path = cache_dir.join("index.json");
    if !path.exists() {
        return Ok(None);
    }
    let metadata = std::fs::metadata(&path)?;
    let modified = metadata
        .modified()
        .map_err(|e| AppError::Io(e.to_string()))?;
    let age = std::time::SystemTime::now()
        .duration_since(modified)
        .unwrap_or_default();
    if age.as_secs() >= ttl_minutes * 60 {
        return Ok(None);
    }
    let content = std::fs::read_to_string(&path)?;
    let index: PresetIndex = serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("cache index 解析失败：{}", e)))?;
    Ok(Some(index))
}

fn write_to_cache(cache_dir: &Path, filename: &str, content: &str) -> Result<(), AppError> {
    std::fs::create_dir_all(cache_dir)?;
    atomic_write(&cache_dir.join(filename), content)
}

// ── HTTP fetch ────────────────────────────────────────────────────────────────

async fn fetch_text(client: &reqwest::Client, url: &str) -> Result<String, AppError> {
    let resp = client.get(url).send().await?;
    if !resp.status().is_success() {
        return Err(AppError::Network(format!(
            "HTTP {} fetching {}",
            resp.status(),
            url
        )));
    }
    Ok(resp.text().await?)
}

/// Fetches index.json from remote, writes to cache, returns parsed index.
pub async fn fetch_index(
    client: &reqwest::Client,
    source_url: &str,
    cache_dir: &Path,
) -> Result<PresetIndex, AppError> {
    let url = format!("{}/index.json", source_url.trim_end_matches('/'));
    let content = fetch_text(client, &url).await?;
    let index: PresetIndex = serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("remote index 解析失败：{}", e)))?;
    write_to_cache(cache_dir, "index.json", &content)?;
    Ok(index)
}

/// Fetches full preset manifest (preset.json) from remote.
pub async fn fetch_preset_manifest(
    client: &reqwest::Client,
    source_url: &str,
    preset_id: &str,
) -> Result<PresetManifest, AppError> {
    validate_preset_id(preset_id)?;
    let url = format!(
        "{}/presets/{}/preset.json",
        source_url.trim_end_matches('/'),
        preset_id
    );
    let content = fetch_text(client, &url).await?;
    serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("preset manifest 解析失败：{}", e)))
}

/// Fetches a single file from a preset's directory.
pub async fn fetch_preset_file(
    client: &reqwest::Client,
    source_url: &str,
    preset_id: &str,
    filename: &str,
) -> Result<String, AppError> {
    validate_preset_id(preset_id)?;
    validate_filename(filename)?;
    let url = format!(
        "{}/presets/{}/{}",
        source_url.trim_end_matches('/'),
        preset_id,
        filename
    );
    fetch_text(client, &url).await
}

/// Fetches all files declared in a preset manifest. Returns source_name -> content map.
pub async fn fetch_all_preset_files(
    client: &reqwest::Client,
    source_url: &str,
    manifest: &PresetManifest,
) -> Result<std::collections::HashMap<String, String>, AppError> {
    let mut contents = std::collections::HashMap::new();
    for src_name in manifest.files.keys() {
        let content = fetch_preset_file(client, source_url, &manifest.id, src_name).await?;
        contents.insert(src_name.clone(), content);
    }
    Ok(contents)
}

pub fn build_client(config: &AppConfig) -> Result<reqwest::Client, AppError> {
    let mut headers = reqwest::header::HeaderMap::new();
    if let Some(token) = &config.github_token {
        headers.insert(
            reqwest::header::AUTHORIZATION,
            format!("Bearer {}", token)
                .parse()
                .map_err(|_| AppError::Network("invalid token format".to_string()))?,
        );
    }
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(15))
        .default_headers(headers)
        .build()
        .map_err(|e| AppError::Network(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn make_index_json() -> String {
        r#"{
            "version": "1",
            "updated_at": "2025-04-23T10:00:00Z",
            "presets": [
                {
                    "id": "python-solo",
                    "name": "Python Solo",
                    "description": "d",
                    "version": "1.0.0",
                    "tested_on": "2025-04-01",
                    "author": "a"
                }
            ]
        }"#.to_string()
    }

    #[test]
    fn test_load_from_cache_fresh() {
        let dir = tempdir().unwrap();
        let cache_dir = dir.path().join("cache");
        std::fs::create_dir_all(&cache_dir).unwrap();
        std::fs::write(cache_dir.join("index.json"), make_index_json()).unwrap();
        let result = load_from_cache(&cache_dir, 60).unwrap();
        assert!(result.is_some());
        let index = result.unwrap();
        assert_eq!(index.presets.len(), 1);
        assert_eq!(index.presets[0].id, "python-solo");
    }

    #[test]
    fn test_load_from_cache_expired_returns_none() {
        let dir = tempdir().unwrap();
        let cache_dir = dir.path().join("cache");
        std::fs::create_dir_all(&cache_dir).unwrap();
        let path = cache_dir.join("index.json");
        std::fs::write(&path, make_index_json()).unwrap();
        // Set mtime to 2 hours ago
        let two_hours_ago = std::time::SystemTime::now() - std::time::Duration::from_secs(7200);
        let mtime = filetime::FileTime::from_system_time(two_hours_ago);
        filetime::set_file_mtime(&path, mtime).unwrap();
        let result = load_from_cache(&cache_dir, 60).unwrap();
        assert!(result.is_none(), "expired cache must return None");
    }

    #[test]
    fn test_load_from_cache_missing_returns_none() {
        let dir = tempdir().unwrap();
        let result = load_from_cache(dir.path(), 60).unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn test_validate_preset_id_rejects_traversal() {
        assert!(validate_preset_id("../escape").is_err());
        assert!(validate_preset_id("/abs/path").is_err());
        assert!(validate_preset_id("").is_err());
        assert!(validate_preset_id("-bad").is_err());
        assert!(validate_preset_id("python-solo").is_ok());
        assert!(validate_preset_id("my_preset_123").is_ok());
    }
}
