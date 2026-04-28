use crate::{
    error::AppError,
    fs::atomic_write,
    types::{BackupEntry, BackupIndex, InstalledState},
};
use std::path::Path;

const MAX_BACKUPS: usize = 20;

pub fn read_installed(pm_dir: &Path) -> Result<InstalledState, AppError> {
    let path = pm_dir.join("installed.json");
    if !path.exists() {
        return Ok(InstalledState::default());
    }
    let content = std::fs::read_to_string(&path)?;
    serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("installed.json 解析失败：{}", e)))
}

pub fn write_installed(pm_dir: &Path, state: &InstalledState) -> Result<(), AppError> {
    std::fs::create_dir_all(pm_dir)?;
    atomic_write(
        &pm_dir.join("installed.json"),
        &serde_json::to_string_pretty(state)?,
    )
}

pub fn read_backup_index(pm_dir: &Path) -> Result<BackupIndex, AppError> {
    let path = pm_dir.join("backups").join("index.json");
    if !path.exists() {
        return Ok(BackupIndex::default());
    }
    let content = std::fs::read_to_string(&path)?;
    serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("backup index 解析失败：{}", e)))
}

pub fn write_backup_index(pm_dir: &Path, index: &BackupIndex) -> Result<(), AppError> {
    let path = pm_dir.join("backups").join("index.json");
    std::fs::create_dir_all(path.parent().unwrap())?;
    atomic_write(&path, &serde_json::to_string_pretty(index)?)
}

/// Appends a backup entry and prunes oldest entries beyond MAX_BACKUPS (FIFO).
pub fn add_backup_entry(pm_dir: &Path, entry: BackupEntry) -> Result<(), AppError> {
    let mut index = read_backup_index(pm_dir)?;
    index.backups.push(entry);
    if index.backups.len() > MAX_BACKUPS {
        let drain_count = index.backups.len() - MAX_BACKUPS;
        index.backups.drain(..drain_count);
    }
    write_backup_index(pm_dir, &index)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::ActivePresetInfo;
    use tempfile::tempdir;

    fn make_active(id: &str) -> ActivePresetInfo {
        ActivePresetInfo {
            active_preset_id: id.to_string(),
            activated_at: "2025-04-23T10:00:00Z".to_string(),
            preset_version: "1.0.0".to_string(),
            files: vec!["CLAUDE.md".to_string()],
            backup_ref: "2025-04-23T10-00-00-000000Z".to_string(),
        }
    }

    #[test]
    fn test_read_installed_missing_returns_default() {
        let dir = tempdir().unwrap();
        let state = read_installed(dir.path()).unwrap();
        assert!(state.global.is_none());
        assert!(state.projects.is_empty());
    }

    #[test]
    fn test_installed_roundtrip() {
        let dir = tempdir().unwrap();
        let state = InstalledState {
            global: Some(make_active("python-solo")),
            projects: [("/myproject".to_string(), make_active("frontend-team"))]
                .into_iter()
                .collect(),
            ..Default::default()
        };
        write_installed(dir.path(), &state).unwrap();
        let loaded = read_installed(dir.path()).unwrap();
        assert_eq!(loaded.global.unwrap().active_preset_id, "python-solo");
        assert!(loaded.projects.contains_key("/myproject"));
    }

    #[test]
    fn test_backup_index_empty_by_default() {
        let dir = tempdir().unwrap();
        let index = read_backup_index(dir.path()).unwrap();
        assert!(index.backups.is_empty());
    }

    #[test]
    fn test_add_backup_entry_roundtrip() {
        let dir = tempdir().unwrap();
        add_backup_entry(
            dir.path(),
            BackupEntry {
                id: "ts1".to_string(),
                scope: "global".to_string(),
                previous_preset: Some("old-preset".to_string()),
                created_at: "2025-04-23T10:00:00Z".to_string(),
                files: vec!["CLAUDE.md".to_string()],
                created_files: vec![],
            },
        )
        .unwrap();
        let index = read_backup_index(dir.path()).unwrap();
        assert_eq!(index.backups.len(), 1);
        assert_eq!(index.backups[0].id, "ts1");
        assert_eq!(
            index.backups[0].previous_preset.as_deref(),
            Some("old-preset")
        );
    }

    #[test]
    fn test_read_installed_corrupt_json_returns_parse_error() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("installed.json");
        std::fs::write(&path, "not valid json {{{{").unwrap();
        let result = read_installed(dir.path());
        assert!(
            matches!(result, Err(AppError::Parse(_))),
            "corrupt installed.json must return Parse error"
        );
    }

    #[test]
    fn test_read_backup_index_corrupt_json_returns_parse_error() {
        let dir = tempdir().unwrap();
        let backups_dir = dir.path().join("backups");
        std::fs::create_dir_all(&backups_dir).unwrap();
        std::fs::write(backups_dir.join("index.json"), "{corrupt}").unwrap();
        let result = read_backup_index(dir.path());
        assert!(
            matches!(result, Err(AppError::Parse(_))),
            "corrupt backup index must return Parse error"
        );
    }

    #[test]
    fn test_backup_index_prunes_to_max_20() {
        let dir = tempdir().unwrap();
        for i in 0..25usize {
            add_backup_entry(
                dir.path(),
                BackupEntry {
                    id: format!("ts{:02}", i),
                    scope: "global".to_string(),
                    previous_preset: None,
                    created_at: "2025-04-23T10:00:00Z".to_string(),
                    files: vec![],
                    created_files: vec![],
                },
            )
            .unwrap();
        }
        let index = read_backup_index(dir.path()).unwrap();
        assert_eq!(index.backups.len(), 20, "must prune to MAX_BACKUPS");
        assert_eq!(index.backups[0].id, "ts05", "oldest entries must be pruned");
        assert_eq!(index.backups[19].id, "ts24");
    }
}
