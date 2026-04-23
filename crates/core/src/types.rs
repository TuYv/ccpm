use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum PackType {
    ClaudeMd,
    Skill,
    Mcp,
    Rule,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpServerDef {
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub env: HashMap<String, String>,
}

/// 每个 pack.json 的内容
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    #[serde(rename = "type")]
    pub pack_type: PackType,
    pub description: String,
    pub author: String,
    #[serde(default)]
    pub files: Vec<String>,
    #[serde(default)]
    pub servers: HashMap<String, McpServerDef>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Source {
    pub name: String,
    pub url: String,
    pub token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub sources: Vec<Source>,
    pub cache_ttl_minutes: u64,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            sources: vec![Source {
                name: "official".to_string(),
                url: "https://raw.githubusercontent.com/owner/ccpm-registry/main".to_string(),
                token: None,
            }],
            cache_ttl_minutes: 60,
        }
    }
}

/// 单个激活的组件包记录
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivePackInfo {
    pub pack_id: String,
    pub source_name: String,
    pub version: String,
    /// 该包在目标目录创建的符号链接文件名列表（相对路径）
    pub linked_files: Vec<String>,
    pub activated_at: String,
}

/// 单个作用域（全局或某个项目）的激活状态
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ScopeState {
    pub active_claude_md: Option<ActivePackInfo>,
    pub active_skills: Vec<ActivePackInfo>,
    pub active_mcps: Vec<ActivePackInfo>,
    pub active_rules: Vec<ActivePackInfo>,
}

/// ~/.ccpm/installed.json 的完整状态
/// 支持多作用域：全局 + 各项目路径
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct InstalledState {
    /// 全局配置（~/.claude/）
    pub global: ScopeState,
    /// 各项目配置，key = 项目绝对路径
    pub projects: HashMap<String, ScopeState>,
}

/// 用户保存的集合（多组件的命名组合）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub claude_md: Option<String>,
    pub skills: Vec<String>,
    pub mcps: Vec<String>,
    pub rules: Vec<String>,
    pub created_at: String,
}

/// 基线快照的 manifest
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BaselineManifest {
    pub captured_at: String,
    pub files: Vec<String>,
    pub empty: bool,
}

/// 符号链接健康检查结果
#[derive(Debug, Clone)]
pub struct SymlinkStatus {
    pub link_path: std::path::PathBuf,
    pub target_path: std::path::PathBuf,
    pub is_valid: bool,
    pub pack_id: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_manifest_skill_deserializes() {
        let json = r#"{
            "id": "tdd-pack",
            "name": "TDD Pack",
            "version": "1.0.0",
            "type": "skill",
            "description": "TDD skills",
            "author": "rick",
            "files": ["tdd-red.md", "tdd-green.md"],
            "servers": {}
        }"#;
        let pack: PackManifest = serde_json::from_str(json).unwrap();
        assert_eq!(pack.id, "tdd-pack");
        assert!(matches!(pack.pack_type, PackType::Skill));
        assert_eq!(pack.files, vec!["tdd-red.md", "tdd-green.md"]);
    }

    #[test]
    fn test_pack_manifest_mcp_deserializes() {
        let json = r#"{
            "id": "git-pack",
            "name": "Git MCP",
            "version": "1.0.0",
            "type": "mcp",
            "description": "Git MCP server",
            "author": "rick",
            "files": [],
            "servers": {
                "git": {"command": "uvx", "args": ["mcp-server-git"], "env": {}}
            }
        }"#;
        let pack: PackManifest = serde_json::from_str(json).unwrap();
        assert!(matches!(pack.pack_type, PackType::Mcp));
        assert!(pack.servers.contains_key("git"));
    }

    #[test]
    fn test_installed_state_default_has_empty_global_and_no_projects() {
        let state = InstalledState::default();
        assert!(state.global.active_claude_md.is_none());
        assert!(state.global.active_skills.is_empty());
        assert!(state.projects.is_empty());
    }

    #[test]
    fn test_scope_state_default_is_empty() {
        let s = ScopeState::default();
        assert!(s.active_claude_md.is_none());
        assert!(s.active_skills.is_empty());
        assert!(s.active_mcps.is_empty());
        assert!(s.active_rules.is_empty());
    }

    #[test]
    fn test_app_config_default_has_official_source() {
        let cfg = AppConfig::default();
        assert_eq!(cfg.sources.len(), 1);
        assert_eq!(cfg.sources[0].name, "official");
        assert_eq!(cfg.cache_ttl_minutes, 60);
    }

    #[test]
    fn test_collection_roundtrip() {
        let col = Collection {
            id: "my-python".to_string(),
            name: "My Python".to_string(),
            description: None,
            claude_md: Some("python-solo".to_string()),
            skills: vec!["tdd-pack".to_string()],
            mcps: vec![],
            rules: vec!["no-comments-pack".to_string()],
            created_at: "2026-04-23T10:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&col).unwrap();
        let back: Collection = serde_json::from_str(&json).unwrap();
        assert_eq!(back.id, "my-python");
        assert_eq!(back.skills.len(), 1);
    }
}
