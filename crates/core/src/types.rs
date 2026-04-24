use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ── Registry types ────────────────────────────────────────────────────────────

/// Lightweight entry from index.json (no file contents).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresetMeta {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub components: Vec<String>,
    pub version: String,
    pub tested_on: String,
    pub author: String,
}

/// Root of index.json.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresetIndex {
    pub version: String,
    pub updated_at: String,
    pub presets: Vec<PresetMeta>,
}

/// Full preset manifest from preset.json.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresetManifest {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub components: Vec<String>,
    pub version: String,
    #[serde(default)]
    pub min_claude_code_version: Option<String>,
    pub tested_on: String,
    pub author: String,
    /// source_filename → target_rel_path (relative to scope root)
    #[serde(default)]
    pub files: HashMap<String, String>,
}

// ── Installed state ───────────────────────────────────────────────────────────

/// Per-scope activation record stored in installed.json.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivePresetInfo {
    pub active_preset_id: String,
    pub activated_at: String,
    pub preset_version: String,
    /// Target paths that were written (relative to scope root).
    pub files: Vec<String>,
    /// Backup timestamp ID created when this preset was activated.
    pub backup_ref: String,
}

/// Root of installed.json.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct InstalledState {
    #[serde(default)]
    pub global: Option<ActivePresetInfo>,
    #[serde(default)]
    pub projects: HashMap<String, ActivePresetInfo>,
}

// ── Backup ────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupEntry {
    pub id: String,
    pub scope: String,
    pub previous_preset: Option<String>,
    pub created_at: String,
    pub files: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BackupIndex {
    #[serde(default)]
    pub backups: Vec<BackupEntry>,
}

// ── App config ────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub preset_source_url: String,
    pub claude_config_path: Option<String>,
    pub github_token: Option<String>,
    pub cache_ttl_minutes: u64,
    pub app_version: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            preset_source_url:
                "https://raw.githubusercontent.com/owner/claude-preset-registry/main".to_string(),
            claude_config_path: None,
            github_token: None,
            cache_ttl_minutes: 60,
            app_version: "0.1.0".to_string(),
        }
    }
}

// ── Baseline manifest ─────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BaselineManifest {
    pub captured_at: String,
    pub files: Vec<String>,
    pub empty: bool,
}

// ── Scope / strategy enums ────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq)]
pub enum Scope {
    Global,
    Project(String),
}

impl Scope {
    pub fn key(&self) -> &str {
        match self {
            Scope::Global => "global",
            Scope::Project(path) => path.as_str(),
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub enum ConflictStrategy {
    Overwrite,
    Cancel,
}

#[derive(Debug, Clone, Copy)]
pub enum RestoreOption {
    Baseline,
    LastBackup,
    KeepFiles,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_preset_meta_deserializes() {
        let json = r#"{
            "id": "python-solo",
            "name": "Python 独立开发者",
            "description": "适合单人 Python 项目",
            "tags": ["python", "solo"],
            "components": ["CLAUDE.md", "settings.json"],
            "version": "1.2.0",
            "tested_on": "2025-04-01",
            "author": "rick"
        }"#;
        let meta: PresetMeta = serde_json::from_str(json).unwrap();
        assert_eq!(meta.id, "python-solo");
        assert_eq!(meta.tags.len(), 2);
    }

    #[test]
    fn test_preset_index_deserializes() {
        let json = r#"{
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
        }"#;
        let index: PresetIndex = serde_json::from_str(json).unwrap();
        assert_eq!(index.version, "1");
        assert_eq!(index.presets.len(), 1);
    }

    #[test]
    fn test_preset_manifest_files_map() {
        let json = r#"{
            "id": "python-solo",
            "name": "Python Solo",
            "description": "d",
            "version": "1.0.0",
            "tested_on": "2025-04-01",
            "author": "a",
            "files": {"CLAUDE.md": "CLAUDE.md", "settings.json": "settings.json"}
        }"#;
        let manifest: PresetManifest = serde_json::from_str(json).unwrap();
        assert_eq!(manifest.files.get("CLAUDE.md").unwrap(), "CLAUDE.md");
        assert_eq!(manifest.files.len(), 2);
    }

    #[test]
    fn test_installed_state_default_is_empty() {
        let state = InstalledState::default();
        assert!(state.global.is_none());
        assert!(state.projects.is_empty());
    }

    #[test]
    fn test_installed_state_roundtrip() {
        let state = InstalledState {
            global: Some(ActivePresetInfo {
                active_preset_id: "python-solo".to_string(),
                activated_at: "2025-04-23T10:00:00Z".to_string(),
                preset_version: "1.0.0".to_string(),
                files: vec!["CLAUDE.md".to_string()],
                backup_ref: "2025-04-23T10-00-00-000000Z".to_string(),
            }),
            projects: HashMap::new(),
        };
        let json = serde_json::to_string(&state).unwrap();
        let back: InstalledState = serde_json::from_str(&json).unwrap();
        assert_eq!(back.global.unwrap().active_preset_id, "python-solo");
    }

    #[test]
    fn test_app_config_default() {
        let cfg = AppConfig::default();
        assert_eq!(cfg.cache_ttl_minutes, 60);
        assert!(cfg.preset_source_url.contains("github"));
        assert!(cfg.github_token.is_none());
    }

    #[test]
    fn test_scope_key() {
        assert_eq!(Scope::Global.key(), "global");
        assert_eq!(Scope::Project("/foo".to_string()).key(), "/foo");
    }
}
