use crate::{
    error::AppError,
    fs::atomic_write,
    types::{Collection, InstalledState},
};
use std::path::Path;

fn validate_id(id: &str) -> Result<(), AppError> {
    if id.is_empty() || id.contains(['/', '\\', '\0', '.']) || id.starts_with('-') {
        return Err(AppError::InvalidInput(format!("无效的集合 ID：'{}'", id)));
    }
    Ok(())
}

pub fn read_installed(ccpm_dir: &Path) -> Result<InstalledState, AppError> {
    let path = ccpm_dir.join("installed.json");
    if !path.exists() {
        return Ok(InstalledState::default());
    }
    let content = std::fs::read_to_string(&path)?;
    serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("installed.json 解析失败：{}", e)))
}

pub fn write_installed(ccpm_dir: &Path, state: &InstalledState) -> Result<(), AppError> {
    std::fs::create_dir_all(ccpm_dir)?;
    let content = serde_json::to_string_pretty(state)?;
    atomic_write(&ccpm_dir.join("installed.json"), &content)
}

/// Each collection is stored as <id>.json under collections/ subdir.
pub fn save_collection(ccpm_dir: &Path, col: &Collection) -> Result<(), AppError> {
    validate_id(&col.id)?;
    let dir = ccpm_dir.join("collections");
    std::fs::create_dir_all(&dir)?;
    let content = serde_json::to_string_pretty(col)?;
    atomic_write(&dir.join(format!("{}.json", col.id)), &content)
}

pub fn load_collection(ccpm_dir: &Path, id: &str) -> Result<Collection, AppError> {
    validate_id(id)?;
    let path = ccpm_dir.join("collections").join(format!("{}.json", id));
    let content = std::fs::read_to_string(&path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            AppError::CollectionNotFound(id.to_string())
        } else {
            AppError::from(e)
        }
    })?;
    serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("collection '{}' 解析失败：{}", id, e)))
}

pub fn list_collections(ccpm_dir: &Path) -> Result<Vec<Collection>, AppError> {
    let dir = ccpm_dir.join("collections");
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut cols = vec![];
    for entry in std::fs::read_dir(&dir)? {
        let entry = entry?;
        if entry.path().extension().and_then(|e| e.to_str()) == Some("json") {
            let content = std::fs::read_to_string(entry.path())?;
            match serde_json::from_str::<Collection>(&content) {
                Ok(col) => cols.push(col),
                Err(e) => eprintln!("warn: skipping corrupt collection {:?}: {}", entry.path(), e),
            }
        }
    }
    cols.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(cols)
}

pub fn delete_collection(ccpm_dir: &Path, id: &str) -> Result<(), AppError> {
    validate_id(id)?;
    let path = ccpm_dir.join("collections").join(format!("{}.json", id));
    std::fs::remove_file(&path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            AppError::CollectionNotFound(id.to_string())
        } else {
            AppError::from(e)
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{ActivePackInfo, Collection};
    use tempfile::tempdir;

    fn make_active(pack_id: &str) -> ActivePackInfo {
        ActivePackInfo {
            pack_id: pack_id.to_string(),
            source_name: "official".to_string(),
            version: "1.0.0".to_string(),
            linked_files: vec!["tdd-red.md".to_string()],
            activated_at: "2026-04-23T10:00:00Z".to_string(),
        }
    }

    #[test]
    fn test_installed_roundtrip() {
        let dir = tempdir().unwrap();
        let mut state = InstalledState::default();
        state.global.active_claude_md = Some(make_active("python-solo"));
        state.global.active_skills.push(make_active("tdd-pack"));
        write_installed(dir.path(), &state).unwrap();
        let loaded = read_installed(dir.path()).unwrap();
        assert_eq!(loaded.global.active_claude_md.unwrap().pack_id, "python-solo");
        assert_eq!(loaded.global.active_skills.len(), 1);
    }

    #[test]
    fn test_read_installed_missing_returns_default() {
        let dir = tempdir().unwrap();
        let state = read_installed(dir.path()).unwrap();
        assert!(state.global.active_claude_md.is_none());
        assert!(state.global.active_skills.is_empty());
        assert!(state.projects.is_empty());
    }

    #[test]
    fn test_save_and_load_collection() {
        let dir = tempdir().unwrap();
        let col = Collection {
            id: "my-python".to_string(),
            name: "My Python Setup".to_string(),
            description: None,
            claude_md: Some("python-solo".to_string()),
            skills: vec!["tdd-pack".to_string()],
            mcps: vec![],
            rules: vec![],
            created_at: "2026-04-23T10:00:00Z".to_string(),
        };
        save_collection(dir.path(), &col).unwrap();
        let loaded = load_collection(dir.path(), "my-python").unwrap();
        assert_eq!(loaded.name, "My Python Setup");
        assert_eq!(loaded.skills.len(), 1);
    }

    #[test]
    fn test_list_collections() {
        let dir = tempdir().unwrap();
        for name in &["alpha", "beta", "gamma"] {
            let col = Collection {
                id: name.to_string(),
                name: name.to_string(),
                description: None,
                claude_md: None,
                skills: vec![],
                mcps: vec![],
                rules: vec![],
                created_at: "2026-04-23T10:00:00Z".to_string(),
            };
            save_collection(dir.path(), &col).unwrap();
        }
        let cols = list_collections(dir.path()).unwrap();
        assert_eq!(cols.len(), 3);
    }

    #[test]
    fn test_save_collection_rejects_invalid_id() {
        let dir = tempdir().unwrap();
        let col = Collection {
            id: "../escape".to_string(),
            name: "Bad".to_string(),
            description: None,
            claude_md: None,
            skills: vec![],
            mcps: vec![],
            rules: vec![],
            created_at: "2026-04-23T10:00:00Z".to_string(),
        };
        let result = save_collection(dir.path(), &col);
        assert!(result.is_err());
    }

    #[test]
    fn test_delete_collection() {
        let dir = tempdir().unwrap();
        let col = Collection {
            id: "to-delete".to_string(),
            name: "D".to_string(),
            description: None,
            claude_md: None,
            skills: vec![],
            mcps: vec![],
            rules: vec![],
            created_at: "2026-04-23T10:00:00Z".to_string(),
        };
        save_collection(dir.path(), &col).unwrap();
        delete_collection(dir.path(), "to-delete").unwrap();
        let result = load_collection(dir.path(), "to-delete");
        assert!(result.is_err());
    }
}
