use ccpm_core::{
    config::load_config,
    fs::default_preset_manager_dir,
    library::{
        self, add_claude_md, add_mcp, add_skill, get_claude_md_files, get_meta, get_mcp_json,
        get_skill_md, list_items, remove_item, ItemKind,
    },
    registry::{build_client, fetch_skill_content},
    types::{ItemSource, LibraryItemMeta, McpMeta, SkillMeta},
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ItemKindArg {
    ClaudeMd,
    Skill,
    Mcp,
}

impl From<ItemKindArg> for ItemKind {
    fn from(v: ItemKindArg) -> Self {
        match v {
            ItemKindArg::ClaudeMd => ItemKind::ClaudeMd,
            ItemKindArg::Skill => ItemKind::Skill,
            ItemKindArg::Mcp => ItemKind::Mcp,
        }
    }
}

#[tauri::command]
pub fn list_library_items(kind: ItemKindArg) -> Result<Vec<String>, String> {
    let pm = default_preset_manager_dir();
    list_items(&pm, kind.into()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_library_meta(kind: ItemKindArg, id: String) -> Result<LibraryItemMeta, String> {
    let pm = default_preset_manager_dir();
    let kind: ItemKind = kind.into();
    if kind == ItemKind::Mcp {
        return Err("MCP items must be fetched via get_library_mcp_json".to_string());
    }
    get_meta(&pm, kind, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_library_claude_md(id: String) -> Result<(String, Option<String>), String> {
    let pm = default_preset_manager_dir();
    get_claude_md_files(&pm, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_library_skill_md(id: String) -> Result<String, String> {
    let pm = default_preset_manager_dir();
    get_skill_md(&pm, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_library_mcp_json(id: String) -> Result<String, String> {
    let pm = default_preset_manager_dir();
    get_mcp_json(&pm, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_library_claude_md(
    meta: LibraryItemMeta,
    claude_md: String,
    settings_json: Option<String>,
) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    add_claude_md(&pm, &meta, &claude_md, settings_json.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_library_skill(meta: LibraryItemMeta, skill_md: String) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    add_skill(&pm, &meta, &skill_md).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_library_mcp(id: String, mcp_json: String) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    add_mcp(&pm, &id, &mcp_json).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_library_item(kind: ItemKindArg, id: String) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    remove_item(&pm, kind.into(), &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn download_skill_to_library_cmd(skill: SkillMeta) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    let config = load_config(&pm).map_err(|e| e.to_string())?;
    let client = build_client(&config).map_err(|e| e.to_string())?;
    let body = fetch_skill_content(&client, &config.preset_source_url, &skill.id)
        .await
        .map_err(|e| e.to_string())?;

    let meta = LibraryItemMeta {
        id: skill.id.clone(),
        name: skill.name.clone(),
        description: skill.description.clone(),
        tags: {
            let mut t = vec![skill.category.clone()];
            t.extend(skill.compatible_tools.iter().cloned());
            t
        },
        source: ItemSource::Remote {
            repo: String::new(),
            url: String::new(),
        },
        downloaded_at: chrono::Utc::now().to_rfc3339(),
    };

    add_skill(&pm, &meta, &body).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn download_mcp_to_library_cmd(mcp: McpMeta) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    let json = serde_json::to_string_pretty(&mcp).map_err(|e| e.to_string())?;
    add_mcp(&pm, &mcp.id, &json).map_err(|e| e.to_string())
}
