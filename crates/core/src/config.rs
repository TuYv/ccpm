use crate::{error::AppError, fs::atomic_write, types::{AppConfig, Source}};
use std::path::Path;

const BUILTIN_SOURCE_NAME: &str = "official";

pub fn load_config(ccpm_dir: &Path) -> Result<AppConfig, AppError> {
    let path = ccpm_dir.join("config.json");
    if !path.exists() {
        return Ok(AppConfig::default());
    }
    let content = std::fs::read_to_string(&path)?;
    serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("config.json 解析失败：{}", e)))
}

pub fn save_config(ccpm_dir: &Path, config: &AppConfig) -> Result<(), AppError> {
    std::fs::create_dir_all(ccpm_dir)?;
    let content = serde_json::to_string_pretty(config)?;
    atomic_write(&ccpm_dir.join("config.json"), &content)
}

pub fn add_source(
    ccpm_dir: &Path,
    name: &str,
    url: &str,
    token: Option<String>,
) -> Result<(), AppError> {
    let mut cfg = load_config(ccpm_dir)?;
    if cfg.sources.iter().any(|s| s.name == name) {
        return Err(AppError::SourceAlreadyExists(name.to_string()));
    }
    cfg.sources.push(Source {
        name: name.to_string(),
        url: url.to_string(),
        token,
    });
    save_config(ccpm_dir, &cfg)
}

pub fn remove_source(ccpm_dir: &Path, name: &str) -> Result<(), AppError> {
    if name == BUILTIN_SOURCE_NAME {
        return Err(AppError::Io("不能删除内置的 'official' 源".to_string()));
    }
    let mut cfg = load_config(ccpm_dir)?;
    let before = cfg.sources.len();
    cfg.sources.retain(|s| s.name != name);
    if cfg.sources.len() == before {
        return Err(AppError::SourceNotFound(name.to_string()));
    }
    save_config(ccpm_dir, &cfg)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_load_config_returns_default_when_missing() {
        let dir = tempdir().unwrap();
        let cfg = load_config(dir.path()).unwrap();
        assert_eq!(cfg.sources.len(), 1);
        assert_eq!(cfg.sources[0].name, "official");
        assert_eq!(cfg.cache_ttl_minutes, 60);
    }

    #[test]
    fn test_save_and_load_roundtrip() {
        let dir = tempdir().unwrap();
        let mut cfg = AppConfig::default();
        cfg.sources.push(Source {
            name: "community".to_string(),
            url: "https://example.com/registry".to_string(),
            token: None,
        });
        cfg.cache_ttl_minutes = 30;
        save_config(dir.path(), &cfg).unwrap();
        let loaded = load_config(dir.path()).unwrap();
        assert_eq!(loaded.sources.len(), 2);
        assert_eq!(loaded.cache_ttl_minutes, 30);
    }

    #[test]
    fn test_add_source_persists() {
        let dir = tempdir().unwrap();
        add_source(dir.path(), "my-src", "https://example.com", None).unwrap();
        let cfg = load_config(dir.path()).unwrap();
        assert!(cfg.sources.iter().any(|s| s.name == "my-src"));
    }

    #[test]
    fn test_remove_source_works() {
        let dir = tempdir().unwrap();
        add_source(dir.path(), "to-remove", "https://example.com", None).unwrap();
        remove_source(dir.path(), "to-remove").unwrap();
        let cfg = load_config(dir.path()).unwrap();
        assert!(!cfg.sources.iter().any(|s| s.name == "to-remove"));
    }

    #[test]
    fn test_remove_official_source_fails() {
        let dir = tempdir().unwrap();
        let result = remove_source(dir.path(), "official");
        assert!(result.is_err());
    }

    #[test]
    fn test_add_duplicate_source_fails() {
        let dir = tempdir().unwrap();
        add_source(dir.path(), "dup", "https://example.com", None).unwrap();
        let result = add_source(dir.path(), "dup", "https://example.com", None);
        assert!(result.is_err());
    }

    #[test]
    fn test_remove_nonexistent_source_fails() {
        let dir = tempdir().unwrap();
        let result = remove_source(dir.path(), "nonexistent");
        assert!(result.is_err());
    }
}
