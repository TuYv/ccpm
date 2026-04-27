use crate::{
    error::AppError,
    fs::atomic_write,
    types::{ItemSource, LibraryItemMeta},
};
use std::{
    fs,
    path::{Path, PathBuf},
};

/// The 3 item types stored in the library.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ItemKind {
    ClaudeMd,
    Skill,
    Mcp,
}

impl ItemKind {
    fn dir_name(self) -> &'static str {
        match self {
            ItemKind::ClaudeMd => "claude-md",
            ItemKind::Skill => "skills",
            ItemKind::Mcp => "mcps",
        }
    }
}

fn library_root(pm_dir: &Path) -> PathBuf {
    pm_dir.join("library")
}

fn item_dir(pm_dir: &Path, kind: ItemKind, id: &str) -> PathBuf {
    library_root(pm_dir).join(kind.dir_name()).join(id)
}

fn validate_id(id: &str) -> Result<(), AppError> {
    if id.is_empty() || id.contains(['/', '\\', '\0']) || id.contains("..") {
        return Err(AppError::InvalidInput(format!("invalid library id: {id}")));
    }
    Ok(())
}

pub fn add_claude_md(
    pm_dir: &Path,
    meta: &LibraryItemMeta,
    claude_md_content: &str,
    settings_json: Option<&str>,
) -> Result<(), AppError> {
    validate_id(&meta.id)?;
    let dir = item_dir(pm_dir, ItemKind::ClaudeMd, &meta.id);
    fs::create_dir_all(&dir)?;
    atomic_write(&dir.join("CLAUDE.md"), claude_md_content)?;
    if let Some(s) = settings_json {
        atomic_write(&dir.join("settings.json"), s)?;
    }
    atomic_write(&dir.join("meta.json"), &serde_json::to_string_pretty(meta)?)?;
    Ok(())
}

pub fn add_skill(
    pm_dir: &Path,
    meta: &LibraryItemMeta,
    skill_md_content: &str,
) -> Result<(), AppError> {
    validate_id(&meta.id)?;
    let dir = item_dir(pm_dir, ItemKind::Skill, &meta.id);
    fs::create_dir_all(&dir)?;
    atomic_write(&dir.join("SKILL.md"), skill_md_content)?;
    atomic_write(&dir.join("meta.json"), &serde_json::to_string_pretty(meta)?)?;
    Ok(())
}

pub fn add_mcp(pm_dir: &Path, id: &str, mcp_json: &str) -> Result<(), AppError> {
    validate_id(id)?;
    let dir = item_dir(pm_dir, ItemKind::Mcp, id);
    fs::create_dir_all(&dir)?;
    atomic_write(&dir.join("mcp.json"), mcp_json)?;
    Ok(())
}

pub fn remove_item(pm_dir: &Path, kind: ItemKind, id: &str) -> Result<(), AppError> {
    validate_id(id)?;
    let dir = item_dir(pm_dir, kind, id);
    if dir.exists() {
        fs::remove_dir_all(&dir)?;
    }
    Ok(())
}

pub fn list_items(pm_dir: &Path, kind: ItemKind) -> Result<Vec<String>, AppError> {
    let kind_dir = library_root(pm_dir).join(kind.dir_name());
    if !kind_dir.exists() {
        return Ok(vec![]);
    }
    let mut out = vec![];
    for entry in fs::read_dir(&kind_dir)? {
        let entry = entry?;
        if entry.file_type()?.is_dir() {
            if let Some(name) = entry.file_name().to_str() {
                out.push(name.to_string());
            }
        }
    }
    out.sort();
    Ok(out)
}

pub fn get_meta(
    pm_dir: &Path,
    kind: ItemKind,
    id: &str,
) -> Result<LibraryItemMeta, AppError> {
    validate_id(id)?;
    if kind == ItemKind::Mcp {
        return Err(AppError::InvalidInput(
            "use get_mcp_json for MCP items".into(),
        ));
    }
    let path = item_dir(pm_dir, kind, id).join("meta.json");
    let s = fs::read_to_string(&path)?;
    Ok(serde_json::from_str(&s)?)
}

pub fn get_mcp_json(pm_dir: &Path, id: &str) -> Result<String, AppError> {
    validate_id(id)?;
    let path = item_dir(pm_dir, ItemKind::Mcp, id).join("mcp.json");
    Ok(fs::read_to_string(&path)?)
}

pub fn get_claude_md_files(
    pm_dir: &Path,
    id: &str,
) -> Result<(String, Option<String>), AppError> {
    validate_id(id)?;
    let dir = item_dir(pm_dir, ItemKind::ClaudeMd, id);
    let claude = fs::read_to_string(dir.join("CLAUDE.md"))?;
    let settings_path = dir.join("settings.json");
    let settings = if settings_path.exists() {
        Some(fs::read_to_string(&settings_path)?)
    } else {
        None
    };
    Ok((claude, settings))
}

pub fn get_skill_md(pm_dir: &Path, id: &str) -> Result<String, AppError> {
    validate_id(id)?;
    let path = item_dir(pm_dir, ItemKind::Skill, id).join("SKILL.md");
    Ok(fs::read_to_string(&path)?)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn meta(id: &str) -> LibraryItemMeta {
        LibraryItemMeta {
            id: id.into(),
            name: id.into(),
            description: "d".into(),
            tags: vec![],
            source: ItemSource::UserCreated,
            downloaded_at: "2026-04-27T00:00:00Z".into(),
        }
    }

    #[test]
    fn test_add_and_get_claude_md() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        add_claude_md(pm, &meta("rust-cli"), "# Rust", Some(r#"{"x":1}"#)).unwrap();
        let (md, settings) = get_claude_md_files(pm, "rust-cli").unwrap();
        assert_eq!(md, "# Rust");
        assert_eq!(settings.unwrap(), r#"{"x":1}"#);
    }

    #[test]
    fn test_list_and_remove() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        add_skill(pm, &meta("a"), "# A").unwrap();
        add_skill(pm, &meta("b"), "# B").unwrap();
        assert_eq!(list_items(pm, ItemKind::Skill).unwrap(), vec!["a", "b"]);
        remove_item(pm, ItemKind::Skill, "a").unwrap();
        assert_eq!(list_items(pm, ItemKind::Skill).unwrap(), vec!["b"]);
    }

    #[test]
    fn test_validate_id_rejects_traversal() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        let bad = LibraryItemMeta {
            id: "../escape".into(),
            ..meta("x")
        };
        assert!(add_skill(pm, &bad, "x").is_err());
    }

    #[test]
    fn test_mcp_round_trip() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        let json = r#"{"id":"github","name":"GitHub","command":"npx"}"#;
        add_mcp(pm, "github", json).unwrap();
        assert_eq!(get_mcp_json(pm, "github").unwrap(), json);
    }
}
