use crate::{
    error::AppError,
    fs::atomic_write,
    state::{add_backup_entry, read_installed, write_installed},
    types::{ActivePresetInfo, BackupEntry, PresetManifest, RestoreOption, Scope},
};
use chrono::Utc;
use std::{collections::HashMap, io::Read, path::Path};

pub struct ActivateResult {
    pub written_files: Vec<String>,
    pub backup_ref: String,
}

/// Rejects target paths with `..` or absolute segments to prevent traversal.
fn safe_target_path(rel: &str) -> bool {
    let p = std::path::Path::new(rel);
    !rel.is_empty()
        && !p.is_absolute()
        && !p.components().any(|c| c == std::path::Component::ParentDir)
}

fn backup_id_now() -> String {
    Utc::now().format("%Y-%m-%dT%H-%M-%S%.6fZ").to_string()
}

/// Activate a preset into scope_dir.
///
/// Sequence (must not deviate):
///   1. Validate target paths
///   2. Create backup dir
///   3. Copy existing files → backup
///   4. Verify backup (read 1 byte)
///   5. Atomic-write new files
///   6. Record backup entry
///   7. Update installed.json
pub fn activate_preset(
    scope_dir: &Path,
    pm_dir: &Path,
    manifest: &PresetManifest,
    file_contents: &HashMap<String, String>,
    scope: &Scope,
) -> Result<ActivateResult, AppError> {
    // 1. Validate all target paths
    for target_rel in manifest.files.values() {
        if !safe_target_path(target_rel) {
            return Err(AppError::InvalidInput(format!(
                "preset 中存在不安全的目标路径：'{}'",
                target_rel
            )));
        }
    }

    // 2. Determine previous preset for backup record
    let state = read_installed(pm_dir)?;
    let previous_preset = match scope {
        Scope::Global => state.global.as_ref().map(|a| a.active_preset_id.clone()),
        Scope::Project(path) => state.projects.get(path.as_str()).map(|a| a.active_preset_id.clone()),
    };

    // 3. Create backup dir
    let backup_id = backup_id_now();
    let backup_dir = pm_dir.join("backups").join(&backup_id);
    std::fs::create_dir_all(&backup_dir)?;

    // 4. Back up existing files
    let mut backed_up = vec![];
    for target_rel in manifest.files.values() {
        let target = scope_dir.join(target_rel);
        if target.exists() {
            let backup_file = backup_dir.join(target_rel);
            if let Some(parent) = backup_file.parent() {
                std::fs::create_dir_all(parent)?;
            }
            let content = std::fs::read_to_string(&target)
                .map_err(|e| AppError::BackupFailed(format!("读取 {} 失败：{}", target.display(), e)))?;
            atomic_write(&backup_file, &content)
                .map_err(|e| AppError::BackupFailed(format!("备份 {} 失败：{}", target_rel, e)))?;
            backed_up.push(target_rel.clone());
        }
    }

    // 5. Verify each backed-up file (read 1 byte to confirm writability)
    for rel in &backed_up {
        let backup_file = backup_dir.join(rel);
        let mut f = std::fs::File::open(&backup_file)
            .map_err(|e| AppError::BackupFailed(format!("备份验证失败 {}: {}", rel, e)))?;
        let mut buf = [0u8; 1];
        let _ = f.read(&mut buf); // empty files are fine
    }

    // 6. Write new files atomically
    let mut written_files = vec![];
    for (src_name, target_rel) in &manifest.files {
        let content = file_contents.get(src_name).ok_or_else(|| {
            AppError::InvalidInput(format!("缺少文件内容：'{}'", src_name))
        })?;
        let target = scope_dir.join(target_rel);
        // Follow symlink so we write to the real file, not replace the link.
        let write_path = if target.is_symlink() {
            std::fs::canonicalize(&target).unwrap_or_else(|_| target.clone())
        } else {
            target.clone()
        };
        atomic_write(&write_path, content)?;
        written_files.push(target_rel.clone());
    }

    // 7. Record backup entry
    add_backup_entry(pm_dir, BackupEntry {
        id: backup_id.clone(),
        scope: scope.key().to_string(),
        previous_preset,
        created_at: Utc::now().to_rfc3339(),
        files: backed_up,
    })?;

    // 8. Update installed.json
    let mut state = read_installed(pm_dir)?;
    let active_info = ActivePresetInfo {
        active_preset_id: manifest.id.clone(),
        activated_at: Utc::now().to_rfc3339(),
        preset_version: manifest.version.clone(),
        files: written_files.clone(),
        backup_ref: backup_id.clone(),
    };
    match scope {
        Scope::Global => state.global = Some(active_info),
        Scope::Project(path) => { state.projects.insert(path.clone(), active_info); }
    }
    write_installed(pm_dir, &state)?;

    Ok(ActivateResult { written_files, backup_ref: backup_id })
}

/// Deactivate the current preset for a scope.
/// On RestoreOption::Baseline, delegates to baseline::restore_baseline (global only).
/// On RestoreOption::LastBackup, restores files from the backup recorded in installed.json.
/// On RestoreOption::KeepFiles, just clears the activation record.
pub fn deactivate_preset(
    scope_dir: &Path,
    pm_dir: &Path,
    scope: &Scope,
    restore: RestoreOption,
) -> Result<(), AppError> {
    let state = read_installed(pm_dir)?;
    let active = match scope {
        Scope::Global => state.global.as_ref(),
        Scope::Project(path) => state.projects.get(path.as_str()),
    };

    match restore {
        RestoreOption::Baseline => {
            // restore_baseline also clears installed.json global — return early.
            crate::baseline::restore_baseline(scope_dir, pm_dir)?;
            return Ok(());
        }
        RestoreOption::LastBackup => {
            if let Some(info) = active {
                let backup_dir = pm_dir.join("backups").join(&info.backup_ref);
                for target_rel in &info.files {
                    if !safe_target_path(target_rel) {
                        continue;
                    }
                    let backup_file = backup_dir.join(target_rel);
                    let target = scope_dir.join(target_rel);
                    if backup_file.exists() {
                        let content = std::fs::read_to_string(&backup_file)?;
                        atomic_write(&target, &content)?;
                    } else if target.exists() {
                        std::fs::remove_file(&target)?;
                    }
                }
            }
        }
        RestoreOption::KeepFiles => {}
    }

    // Clear activation record for this scope.
    let mut state = read_installed(pm_dir)?;
    match scope {
        Scope::Global => state.global = None,
        Scope::Project(path) => { state.projects.remove(path.as_str()); }
    }
    write_installed(pm_dir, &state)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn make_manifest(id: &str, files: &[(&str, &str)]) -> PresetManifest {
        PresetManifest {
            id: id.to_string(),
            name: id.to_string(),
            description: "d".to_string(),
            tags: vec![],
            components: vec![],
            version: "1.0.0".to_string(),
            min_claude_code_version: None,
            tested_on: "2025-04-01".to_string(),
            author: "a".to_string(),
            files: files.iter().map(|(k, v)| (k.to_string(), v.to_string())).collect(),
        }
    }

    fn setup(tmp: &Path) -> (std::path::PathBuf, std::path::PathBuf) {
        let scope_dir = tmp.join("claude");
        let pm_dir = tmp.join("preset-manager");
        std::fs::create_dir_all(&scope_dir).unwrap();
        std::fs::create_dir_all(&pm_dir).unwrap();
        (scope_dir, pm_dir)
    }

    #[test]
    fn test_activate_writes_files() {
        let dir = tempdir().unwrap();
        let (scope, pm) = setup(dir.path());
        let manifest = make_manifest("python-solo", &[("CLAUDE.md", "CLAUDE.md")]);
        let contents: HashMap<String, String> = [("CLAUDE.md".to_string(), "# Python".to_string())].into();
        let result = activate_preset(&scope, &pm, &manifest, &contents, &Scope::Global).unwrap();
        assert_eq!(result.written_files, vec!["CLAUDE.md"]);
        assert_eq!(std::fs::read_to_string(scope.join("CLAUDE.md")).unwrap(), "# Python");
    }

    #[test]
    fn test_activate_creates_backup_before_writing() {
        let dir = tempdir().unwrap();
        let (scope, pm) = setup(dir.path());
        std::fs::write(scope.join("CLAUDE.md"), "# original").unwrap();
        let manifest = make_manifest("python-solo", &[("CLAUDE.md", "CLAUDE.md")]);
        let contents: HashMap<String, String> = [("CLAUDE.md".to_string(), "# new".to_string())].into();
        let result = activate_preset(&scope, &pm, &manifest, &contents, &Scope::Global).unwrap();
        // Backup must exist and contain original content
        let backup = pm.join("backups").join(&result.backup_ref).join("CLAUDE.md");
        assert!(backup.exists(), "backup must be created before writing");
        assert_eq!(std::fs::read_to_string(&backup).unwrap(), "# original");
        assert_eq!(std::fs::read_to_string(scope.join("CLAUDE.md")).unwrap(), "# new");
    }

    #[test]
    fn test_activate_updates_installed_json() {
        let dir = tempdir().unwrap();
        let (scope, pm) = setup(dir.path());
        let manifest = make_manifest("python-solo", &[("CLAUDE.md", "CLAUDE.md")]);
        let contents: HashMap<String, String> = [("CLAUDE.md".to_string(), "# p".to_string())].into();
        activate_preset(&scope, &pm, &manifest, &contents, &Scope::Global).unwrap();
        let state = read_installed(&pm).unwrap();
        let active = state.global.unwrap();
        assert_eq!(active.active_preset_id, "python-solo");
        assert_eq!(active.preset_version, "1.0.0");
    }

    #[test]
    fn test_activate_rejects_traversal_target() {
        let dir = tempdir().unwrap();
        let (scope, pm) = setup(dir.path());
        let manifest = make_manifest("evil", &[("evil.md", "../escape.md")]);
        let contents: HashMap<String, String> = [("evil.md".to_string(), "bad".to_string())].into();
        let result = activate_preset(&scope, &pm, &manifest, &contents, &Scope::Global);
        assert!(result.is_err());
    }

    #[test]
    fn test_deactivate_last_backup_restores() {
        let dir = tempdir().unwrap();
        let (scope, pm) = setup(dir.path());
        std::fs::write(scope.join("CLAUDE.md"), "# original").unwrap();
        let manifest = make_manifest("python-solo", &[("CLAUDE.md", "CLAUDE.md")]);
        let contents: HashMap<String, String> = [("CLAUDE.md".to_string(), "# new".to_string())].into();
        activate_preset(&scope, &pm, &manifest, &contents, &Scope::Global).unwrap();
        assert_eq!(std::fs::read_to_string(scope.join("CLAUDE.md")).unwrap(), "# new");
        deactivate_preset(&scope, &pm, &Scope::Global, RestoreOption::LastBackup).unwrap();
        assert_eq!(std::fs::read_to_string(scope.join("CLAUDE.md")).unwrap(), "# original");
        let state = read_installed(&pm).unwrap();
        assert!(state.global.is_none());
    }

    #[test]
    fn test_deactivate_keep_files_clears_state_only() {
        let dir = tempdir().unwrap();
        let (scope, pm) = setup(dir.path());
        let manifest = make_manifest("python-solo", &[("CLAUDE.md", "CLAUDE.md")]);
        let contents: HashMap<String, String> = [("CLAUDE.md".to_string(), "# new".to_string())].into();
        activate_preset(&scope, &pm, &manifest, &contents, &Scope::Global).unwrap();
        deactivate_preset(&scope, &pm, &Scope::Global, RestoreOption::KeepFiles).unwrap();
        // File stays
        assert_eq!(std::fs::read_to_string(scope.join("CLAUDE.md")).unwrap(), "# new");
        // State is cleared
        assert!(read_installed(&pm).unwrap().global.is_none());
    }

    #[test]
    fn test_activate_project_scope() {
        let dir = tempdir().unwrap();
        let project_dir = dir.path().join("myproject");
        let pm_dir = dir.path().join("pm");
        std::fs::create_dir_all(&project_dir).unwrap();
        std::fs::create_dir_all(&pm_dir).unwrap();
        let manifest = make_manifest("frontend", &[("CLAUDE.md", "CLAUDE.md")]);
        let contents: HashMap<String, String> = [("CLAUDE.md".to_string(), "# fe".to_string())].into();
        let scope = Scope::Project(project_dir.to_string_lossy().to_string());
        activate_preset(&project_dir, &pm_dir, &manifest, &contents, &scope).unwrap();
        assert_eq!(std::fs::read_to_string(project_dir.join("CLAUDE.md")).unwrap(), "# fe");
        let state = read_installed(&pm_dir).unwrap();
        assert!(state.projects.contains_key(project_dir.to_string_lossy().as_ref()));
    }
}
