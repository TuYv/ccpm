use crate::{error::AppError, fs::atomic_write, types::AppConfig};
use std::path::Path;

pub fn load_config(pm_dir: &Path) -> Result<AppConfig, AppError> {
    let path = pm_dir.join("config.json");
    if !path.exists() {
        return Ok(AppConfig::default());
    }
    let content = std::fs::read_to_string(&path)?;
    serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("config.json 解析失败：{}", e)))
}

pub fn save_config(pm_dir: &Path, config: &AppConfig) -> Result<(), AppError> {
    std::fs::create_dir_all(pm_dir)?;
    atomic_write(&pm_dir.join("config.json"), &serde_json::to_string_pretty(config)?)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_load_config_returns_default_when_missing() {
        let dir = tempdir().unwrap();
        let cfg = load_config(dir.path()).unwrap();
        assert_eq!(cfg.cache_ttl_minutes, 60);
        assert!(cfg.github_token.is_none());
        assert!(cfg.preset_source_url.contains("github"));
    }

    #[test]
    fn test_save_and_load_roundtrip() {
        let dir = tempdir().unwrap();
        let mut cfg = AppConfig::default();
        cfg.cache_ttl_minutes = 30;
        cfg.github_token = Some("ghp_test_token".to_string());
        save_config(dir.path(), &cfg).unwrap();
        let loaded = load_config(dir.path()).unwrap();
        assert_eq!(loaded.cache_ttl_minutes, 30);
        assert_eq!(loaded.github_token.as_deref(), Some("ghp_test_token"));
    }
}
