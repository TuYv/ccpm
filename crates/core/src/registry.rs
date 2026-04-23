use crate::{
    error::AppError,
    fs::atomic_write,
    types::{PackManifest, PackType, Source},
};
use std::path::Path;

/// Reads source's pack list from local cache; returns None if expired or missing.
pub fn load_from_cache(
    source_cache_dir: &Path,
    ttl_minutes: u64,
) -> Result<Option<Vec<PackManifest>>, AppError> {
    let path = source_cache_dir.join("index.json");
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
    let packs: Vec<PackManifest> = serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("cache index 解析失败：{}", e)))?;
    Ok(Some(packs))
}

/// Fetches index.json from remote source URL, writes to cache.
pub async fn fetch_index(
    source: &Source,
    source_cache_dir: &Path,
) -> Result<Vec<PackManifest>, AppError> {
    let url = format!("{}/index.json", source.url.trim_end_matches('/'));
    let client = build_client(source.token.as_deref())?;
    let resp = client.get(&url).send().await?;
    if !resp.status().is_success() {
        return Err(AppError::Network(format!(
            "HTTP {} fetching index from '{}'",
            resp.status(),
            source.name
        )));
    }
    let content = resp.text().await?;
    let packs: Vec<PackManifest> = serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("remote index 解析失败：{}", e)))?;
    std::fs::create_dir_all(source_cache_dir)?;
    atomic_write(&source_cache_dir.join("index.json"), &content)?;
    Ok(packs)
}

/// Downloads a pack from remote source into the library.
pub async fn fetch_pack(
    source: &Source,
    library_dir: &Path,
    manifest: &PackManifest,
) -> Result<(), AppError> {
    let client = build_client(source.token.as_deref())?;
    let type_subdir = pack_type_subdir(&manifest.pack_type);
    let pack_url_base = format!(
        "{}/packs/{}/{}",
        source.url.trim_end_matches('/'),
        type_subdir,
        manifest.id
    );

    let pack_json = fetch_text(&client, &format!("{}/pack.json", pack_url_base)).await?;

    let mut file_contents: Vec<(String, String)> = vec![];
    for filename in &manifest.files {
        let content = fetch_text(&client, &format!("{}/{}", pack_url_base, filename)).await?;
        file_contents.push((filename.clone(), content));
    }

    let pack_dir = library_dir.join(type_subdir).join(&manifest.id);
    std::fs::create_dir_all(&pack_dir)?;
    atomic_write(&pack_dir.join("pack.json"), &pack_json)?;
    for (filename, content) in &file_contents {
        atomic_write(&pack_dir.join(filename), content)?;
    }
    Ok(())
}

/// Saves a pack (with already-fetched file contents) into the library.
/// Used for testing and offline scenarios.
pub fn save_pack_to_library(
    library_dir: &Path,
    manifest: &PackManifest,
    files: &[(&str, &str)],
) -> Result<(), AppError> {
    let type_subdir = pack_type_subdir(&manifest.pack_type);
    let pack_dir = library_dir.join(type_subdir).join(&manifest.id);
    std::fs::create_dir_all(&pack_dir)?;
    let pack_json = serde_json::to_string_pretty(manifest)?;
    atomic_write(&pack_dir.join("pack.json"), &pack_json)?;
    for (filename, content) in files {
        atomic_write(&pack_dir.join(filename), content)?;
    }
    Ok(())
}

/// Reads a pack's manifest from the library.
pub fn load_pack_manifest(
    library_dir: &Path,
    pack_type: PackType,
    pack_id: &str,
) -> Result<PackManifest, AppError> {
    let type_subdir = pack_type_subdir(&pack_type);
    let path = library_dir.join(type_subdir).join(pack_id).join("pack.json");
    let content = std::fs::read_to_string(&path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            AppError::PackNotFound(pack_id.to_string())
        } else {
            AppError::from(e)
        }
    })?;
    serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("pack manifest 解析失败：{}", e)))
}

pub fn pack_type_subdir(pack_type: &PackType) -> &'static str {
    match pack_type {
        PackType::ClaudeMd => "claude-mds",
        PackType::Skill => "skills",
        PackType::Mcp => "mcps",
        PackType::Rule => "rules",
    }
}

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

fn build_client(token: Option<&str>) -> Result<reqwest::Client, AppError> {
    let mut headers = reqwest::header::HeaderMap::new();
    if let Some(t) = token {
        headers.insert(
            reqwest::header::AUTHORIZATION,
            format!("Bearer {}", t)
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
        r#"[
            {"id":"python-solo","name":"Python Solo","version":"1.0.0","type":"claude_md","description":"d","author":"a","files":["CLAUDE.md"],"servers":{}},
            {"id":"tdd-pack","name":"TDD Pack","version":"1.0.0","type":"skill","description":"d","author":"a","files":["tdd-red.md"],"servers":{}}
        ]"#.to_string()
    }

    #[test]
    fn test_load_from_cache_fresh() {
        let dir = tempdir().unwrap();
        let cache_dir = dir.path().join("cache").join("official");
        std::fs::create_dir_all(&cache_dir).unwrap();
        std::fs::write(cache_dir.join("index.json"), make_index_json()).unwrap();
        let packs = load_from_cache(&cache_dir, 60).unwrap();
        assert!(packs.is_some());
        assert_eq!(packs.unwrap().len(), 2);
    }

    #[test]
    fn test_load_from_cache_expired_returns_none() {
        let dir = tempdir().unwrap();
        let cache_dir = dir.path().join("cache").join("official");
        std::fs::create_dir_all(&cache_dir).unwrap();
        let path = cache_dir.join("index.json");
        std::fs::write(&path, make_index_json()).unwrap();
        // Set mtime to 2 hours ago
        let two_hours_ago =
            std::time::SystemTime::now() - std::time::Duration::from_secs(7200);
        let mtime = filetime::FileTime::from_system_time(two_hours_ago);
        filetime::set_file_mtime(&path, mtime).unwrap();
        let packs = load_from_cache(&cache_dir, 60).unwrap();
        assert!(packs.is_none(), "expired cache should return None");
    }

    #[test]
    fn test_save_and_load_pack_manifest() {
        let dir = tempdir().unwrap();
        let library_dir = dir.path().join("library");
        let manifest = crate::types::PackManifest {
            id: "tdd-pack".to_string(),
            name: "TDD".to_string(),
            version: "1.0.0".to_string(),
            pack_type: crate::types::PackType::Skill,
            description: "d".to_string(),
            author: "a".to_string(),
            files: vec!["tdd-red.md".to_string()],
            servers: Default::default(),
        };
        save_pack_to_library(&library_dir, &manifest, &[("tdd-red.md", "# Red phase")])
            .unwrap();
        let loaded = load_pack_manifest(
            &library_dir,
            crate::types::PackType::Skill,
            "tdd-pack",
        )
        .unwrap();
        assert_eq!(loaded.id, "tdd-pack");
        let file = library_dir
            .join("skills")
            .join("tdd-pack")
            .join("tdd-red.md");
        assert!(file.exists());
    }
}
