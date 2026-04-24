use crate::{
    error::AppError,
    fs::atomic_write,
    state::{read_installed, write_installed},
    types::BaselineManifest,
};
use chrono::Utc;
use std::path::Path;

const BASELINE_FILES: &[&str] = &["CLAUDE.md", "settings.json"];

/// Capture ~/.claude/ state to pm_dir/baseline/. Never overwrites an existing baseline.
pub fn capture_baseline(claude_dir: &Path, pm_dir: &Path) -> Result<(), AppError> {
    let baseline_dir = pm_dir.join("baseline");
    let manifest_path = baseline_dir.join("manifest.json");
    if manifest_path.exists() {
        return Ok(()); // immutable once captured
    }
    std::fs::create_dir_all(&baseline_dir)?;
    let mut captured = vec![];
    for filename in BASELINE_FILES {
        let src = claude_dir.join(filename);
        if src.exists() && !src.is_symlink() {
            std::fs::copy(&src, baseline_dir.join(filename))?;
            captured.push(filename.to_string());
        }
    }
    // Shallow-copy skills/ and rules/ directories.
    for dir_name in &["skills", "rules"] {
        let src = claude_dir.join(dir_name);
        if src.is_dir() {
            copy_dir_shallow(&src, &baseline_dir.join(dir_name))?;
            captured.push(dir_name.to_string());
        }
    }
    let empty = captured.is_empty();
    let manifest = BaselineManifest {
        captured_at: Utc::now().to_rfc3339(),
        files: captured,
        empty,
    };
    atomic_write(&manifest_path, &serde_json::to_string_pretty(&manifest)?)?;
    Ok(())
}

/// Restore ~/.claude/ from baseline. Fails if no baseline exists.
/// Always clears the global activation record in installed.json after restore.
pub fn restore_baseline(claude_dir: &Path, pm_dir: &Path) -> Result<(), AppError> {
    let baseline_dir = pm_dir.join("baseline");
    let manifest_path = baseline_dir.join("manifest.json");
    if !manifest_path.exists() {
        return Err(AppError::BaselineNotFound);
    }
    let manifest: BaselineManifest =
        serde_json::from_str(&std::fs::read_to_string(&manifest_path)?)
            .map_err(|e| AppError::Parse(format!("baseline manifest 解析失败：{}", e)))?;

    if manifest.empty {
        // Baseline was empty — remove files that were written by this tool.
        let state = read_installed(pm_dir)?;
        if let Some(active) = &state.global {
            for rel_path in &active.files {
                if rel_path.contains("..") || std::path::Path::new(rel_path).is_absolute() {
                    continue;
                }
                let target = claude_dir.join(rel_path);
                if target.exists() || target.is_symlink() {
                    std::fs::remove_file(&target)?;
                }
            }
        }
        // Strip mcpServers from settings.json if it exists, keep other fields.
        let settings_path = claude_dir.join("settings.json");
        if settings_path.exists() {
            let content = std::fs::read_to_string(&settings_path)?;
            let mut settings: serde_json::Value = serde_json::from_str(&content)
                .map_err(|e| AppError::Parse(format!("settings.json 解析失败：{}", e)))?;
            if let Some(obj) = settings.as_object_mut() {
                obj.remove("mcpServers");
            }
            let write_path = if settings_path.is_symlink() {
                std::fs::canonicalize(&settings_path).unwrap_or_else(|_| settings_path.clone())
            } else {
                settings_path.clone()
            };
            atomic_write(&write_path, &serde_json::to_string_pretty(&settings)?)?;
        }
    } else {
        for filename in &manifest.files {
            let src = baseline_dir.join(filename);
            if filename == "skills" || filename == "rules" {
                if src.is_dir() {
                    copy_dir_shallow(&src, &claude_dir.join(filename))?;
                }
            } else if src.exists() {
                let dst = claude_dir.join(filename);
                if dst.is_symlink() {
                    std::fs::remove_file(&dst)?;
                }
                atomic_write(&dst, &std::fs::read_to_string(&src)?)?;
            }
        }
    }

    // Always clear global activations after any restore.
    let mut state = read_installed(pm_dir)?;
    state.global = None;
    write_installed(pm_dir, &state)?;
    Ok(())
}

fn copy_dir_shallow(src: &Path, dst: &Path) -> Result<(), AppError> {
    std::fs::create_dir_all(dst)?;
    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        if entry.path().is_file() {
            std::fs::copy(entry.path(), dst.join(entry.file_name()))?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        state::{read_installed, write_installed},
        types::{ActivePresetInfo, InstalledState},
    };
    use tempfile::tempdir;

    fn setup(tmp: &Path) -> (std::path::PathBuf, std::path::PathBuf) {
        let claude = tmp.join(".claude");
        let pm = tmp.join(".preset-manager");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();
        (claude, pm)
    }

    #[test]
    fn test_capture_saves_existing_files() {
        let dir = tempdir().unwrap();
        let (claude, pm) = setup(dir.path());
        std::fs::write(claude.join("CLAUDE.md"), "# 原始").unwrap();
        std::fs::write(claude.join("settings.json"), r#"{"theme":"dark"}"#).unwrap();
        capture_baseline(&claude, &pm).unwrap();
        let baseline = pm.join("baseline");
        assert_eq!(std::fs::read_to_string(baseline.join("CLAUDE.md")).unwrap(), "# 原始");
        let manifest: BaselineManifest = serde_json::from_str(
            &std::fs::read_to_string(baseline.join("manifest.json")).unwrap(),
        ).unwrap();
        assert!(!manifest.empty);
        assert!(manifest.files.contains(&"CLAUDE.md".to_string()));
    }

    #[test]
    fn test_capture_empty_when_no_files() {
        let dir = tempdir().unwrap();
        let (claude, pm) = setup(dir.path());
        capture_baseline(&claude, &pm).unwrap();
        let manifest: BaselineManifest = serde_json::from_str(
            &std::fs::read_to_string(pm.join("baseline").join("manifest.json")).unwrap(),
        ).unwrap();
        assert!(manifest.empty);
    }

    #[test]
    fn test_capture_is_idempotent() {
        let dir = tempdir().unwrap();
        let (claude, pm) = setup(dir.path());
        std::fs::write(claude.join("CLAUDE.md"), "# 原始").unwrap();
        capture_baseline(&claude, &pm).unwrap();
        std::fs::write(claude.join("CLAUDE.md"), "# 已修改").unwrap();
        capture_baseline(&claude, &pm).unwrap();
        assert_eq!(
            std::fs::read_to_string(pm.join("baseline").join("CLAUDE.md")).unwrap(),
            "# 原始"
        );
    }

    #[test]
    fn test_restore_writes_files_back() {
        let dir = tempdir().unwrap();
        let (claude, pm) = setup(dir.path());
        std::fs::write(claude.join("CLAUDE.md"), "# 原始").unwrap();
        capture_baseline(&claude, &pm).unwrap();
        std::fs::write(claude.join("CLAUDE.md"), "# ccpm 写入").unwrap();
        restore_baseline(&claude, &pm).unwrap();
        assert_eq!(std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(), "# 原始");
    }

    #[test]
    fn test_restore_fails_when_not_captured() {
        let dir = tempdir().unwrap();
        let (claude, pm) = setup(dir.path());
        let result = restore_baseline(&claude, &pm);
        assert!(matches!(result, Err(AppError::BaselineNotFound)));
    }

    #[test]
    fn test_empty_baseline_restore_removes_written_files() {
        let dir = tempdir().unwrap();
        let (claude, pm) = setup(dir.path());
        // Empty baseline (no user files)
        capture_baseline(&claude, &pm).unwrap();

        // Simulate tool writing a file
        std::fs::write(claude.join("CLAUDE.md"), "# written by tool").unwrap();
        let mut state = InstalledState::default();
        state.global = Some(ActivePresetInfo {
            active_preset_id: "python-solo".to_string(),
            activated_at: "2025-04-23T10:00:00Z".to_string(),
            preset_version: "1.0.0".to_string(),
            files: vec!["CLAUDE.md".to_string()],
            backup_ref: "backup-1".to_string(),
        });
        write_installed(&pm, &state).unwrap();

        restore_baseline(&claude, &pm).unwrap();
        assert!(!claude.join("CLAUDE.md").exists(), "tool-written file must be removed");
    }

    #[test]
    fn test_restore_clears_installed_json_global() {
        let dir = tempdir().unwrap();
        let (claude, pm) = setup(dir.path());
        std::fs::write(claude.join("CLAUDE.md"), "# 原始").unwrap();
        capture_baseline(&claude, &pm).unwrap();

        let mut state = InstalledState::default();
        state.global = Some(ActivePresetInfo {
            active_preset_id: "python-solo".to_string(),
            activated_at: "2025-04-23T10:00:00Z".to_string(),
            preset_version: "1.0.0".to_string(),
            files: vec!["CLAUDE.md".to_string()],
            backup_ref: "backup-1".to_string(),
        });
        write_installed(&pm, &state).unwrap();

        restore_baseline(&claude, &pm).unwrap();
        assert!(read_installed(&pm).unwrap().global.is_none());
    }
}
