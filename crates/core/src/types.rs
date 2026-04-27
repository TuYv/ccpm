use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ── Skill registry types ──────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillMeta {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    #[serde(default)]
    pub compatible_tools: Vec<String>,
    pub version: String,
    pub author: String,
    /// Relative install path under scope_dir. e.g. ".claude/skills/<id>/SKILL.md"
    pub install_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillIndex {
    pub version: String,
    pub updated_at: String,
    pub skills: Vec<SkillMeta>,
}

// ── MCP registry types ────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpRequiredEnv {
    pub key: String,
    #[serde(default)]
    pub hint: String,
    #[serde(default)]
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpMeta {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub required_env: Vec<McpRequiredEnv>,
    #[serde(default)]
    pub optional_env: Vec<McpRequiredEnv>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpIndex {
    pub version: String,
    pub updated_at: String,
    pub mcps: Vec<McpMeta>,
}

// ── Preset manifest extensions ────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresetMcpRef {
    #[serde(rename = "ref")]
    pub r#ref: String,
    #[serde(default)]
    pub required_env: Vec<String>,
}

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
    #[serde(default)]
    pub tested_on: String,
    pub author: String,
    /// source_filename → target_rel_path (relative to scope root)
    #[serde(default)]
    pub files: HashMap<String, String>,
    /// IDs of skills bundled with this preset (resolved from skills catalog).
    #[serde(default)]
    pub skills: Vec<String>,
    /// MCP refs bundled with this preset.
    #[serde(default)]
    pub mcps: Vec<PresetMcpRef>,
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
    #[serde(default)]
    pub global_skills: Vec<String>,
    #[serde(default)]
    pub project_skills: HashMap<String, Vec<String>>,
    #[serde(default)]
    pub global_mcps: Vec<String>,
    #[serde(default)]
    pub project_mcps: HashMap<String, Vec<String>>,
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

/// A named preset source entry in config.sources.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SourceEntry {
    pub name: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// Active default source URL (used for all fetch operations).
    pub preset_source_url: String,
    /// All configured sources (name → url). `preset_source_url` is the active default.
    #[serde(default)]
    pub sources: Vec<SourceEntry>,
    pub claude_config_path: Option<String>,
    pub github_token: Option<String>,
    pub cache_ttl_minutes: u64,
    pub app_version: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        let default_url =
            "https://raw.githubusercontent.com/TuYv/ccpm/main/preset-registry".to_string();
        AppConfig {
            sources: vec![SourceEntry {
                name: "default".to_string(),
                url: default_url.clone(),
            }],
            preset_source_url: default_url,
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

// ── Library + Recipe types ────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum ItemSource {
    Remote { repo: String, url: String },
    Imported { from: String },
    UserCreated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LibraryItemMeta {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(default)]
    pub tags: Vec<String>,
    pub source: ItemSource,
    pub downloaded_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeMcpEntry {
    pub library_id: String,
    #[serde(default)]
    pub env: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recipe {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub claude_md: Option<String>,
    #[serde(default)]
    pub skills: Vec<String>,
    #[serde(default)]
    pub mcps: Vec<RecipeMcpEntry>,
    #[serde(default)]
    pub settings_override: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ActiveState {
    #[serde(default)]
    pub global: Option<String>,
    #[serde(default)]
    pub projects: HashMap<String, String>,
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
            ..Default::default()
        };
        let json = serde_json::to_string(&state).unwrap();
        let back: InstalledState = serde_json::from_str(&json).unwrap();
        assert_eq!(back.global.unwrap().active_preset_id, "python-solo");
    }

    #[test]
    fn test_app_config_default() {
        let cfg = AppConfig::default();
        assert_eq!(cfg.cache_ttl_minutes, 60);
        assert!(cfg.preset_source_url.contains("TuYv/ccpm"));
        assert!(cfg.preset_source_url.ends_with("/preset-registry"));
        assert!(cfg.github_token.is_none());
    }

    #[test]
    fn test_scope_key() {
        assert_eq!(Scope::Global.key(), "global");
        assert_eq!(Scope::Project("/foo".to_string()).key(), "/foo");
    }

    #[test]
    fn test_skill_meta_deserializes() {
        let json = r#"{
            "id": "systematic-debugging",
            "name": "系统性调试",
            "description": "结构化 bug 定位与修复",
            "category": "调试与测试",
            "compatible_tools": ["claude", "codex"],
            "version": "1.0.0",
            "author": "ccpm",
            "install_path": ".claude/skills/systematic-debugging/SKILL.md"
        }"#;
        let s: SkillMeta = serde_json::from_str(json).unwrap();
        assert_eq!(s.id, "systematic-debugging");
        assert_eq!(s.compatible_tools.len(), 2);
    }

    #[test]
    fn test_mcp_meta_deserializes() {
        let json = r#"{
            "id": "github",
            "name": "GitHub",
            "description": "读写 GitHub",
            "category": "官方 Anthropic",
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-github"],
            "required_env": [{"key": "GITHUB_TOKEN", "hint": "ghp_xxx", "description": "PAT"}]
        }"#;
        let m: McpMeta = serde_json::from_str(json).unwrap();
        assert_eq!(m.id, "github");
        assert_eq!(m.required_env[0].key, "GITHUB_TOKEN");
    }

    #[test]
    fn test_preset_manifest_with_skills_and_mcps() {
        let json = r#"{
            "id": "rust-cli",
            "name": "Rust CLI",
            "description": "d",
            "version": "1.0.0",
            "tested_on": "2025-04-01",
            "author": "a",
            "skills": ["tdd", "systematic-debugging"],
            "mcps": [{"ref": "github", "required_env": ["GITHUB_TOKEN"]}]
        }"#;
        let m: PresetManifest = serde_json::from_str(json).unwrap();
        assert_eq!(m.skills, vec!["tdd", "systematic-debugging"]);
        assert_eq!(m.mcps[0].r#ref, "github");
    }

    #[test]
    fn test_installed_state_with_components() {
        let state = InstalledState {
            global: None,
            projects: HashMap::new(),
            global_skills: vec!["tdd".to_string()],
            project_skills: HashMap::new(),
            global_mcps: vec!["github".to_string()],
            project_mcps: HashMap::new(),
        };
        let json = serde_json::to_string(&state).unwrap();
        let back: InstalledState = serde_json::from_str(&json).unwrap();
        assert_eq!(back.global_skills, vec!["tdd"]);
        assert_eq!(back.global_mcps, vec!["github"]);
    }

    #[test]
    fn test_installed_state_backward_compatible() {
        let json = r#"{"global":null,"projects":{}}"#;
        let state: InstalledState = serde_json::from_str(json).unwrap();
        assert!(state.global_skills.is_empty());
        assert!(state.global_mcps.is_empty());
    }

    #[test]
    fn test_recipe_deserializes() {
        let json = r#"{
            "id": "rust-dev",
            "name": "Rust 开发",
            "description": "Rust CLI 项目",
            "claude_md": "rust-cli",
            "skills": ["tdd", "systematic-debugging"],
            "mcps": [{"library_id": "github", "env": {"GITHUB_TOKEN": "ghp_x"}}],
            "settings_override": {"model": "claude-sonnet-4-6"},
            "created_at": "2026-04-27T00:00:00Z",
            "updated_at": "2026-04-27T00:00:00Z"
        }"#;
        let r: Recipe = serde_json::from_str(json).unwrap();
        assert_eq!(r.id, "rust-dev");
        assert_eq!(r.skills.len(), 2);
        assert_eq!(r.mcps[0].library_id, "github");
    }

    #[test]
    fn test_library_item_meta_with_source() {
        let json = r#"{
            "id": "rust-cli",
            "name": "Rust CLI",
            "description": "d",
            "source": {"kind": "remote", "repo": "TuYv/ccpm", "url": "..."},
            "downloaded_at": "2026-04-27T00:00:00Z"
        }"#;
        let m: LibraryItemMeta = serde_json::from_str(json).unwrap();
        matches!(m.source, ItemSource::Remote { .. });
    }

    #[test]
    fn test_active_state_default_empty() {
        let s = ActiveState::default();
        assert!(s.global.is_none());
        assert!(s.projects.is_empty());
    }
}
