use crate::{error::AppError, fs::atomic_write, types::BaselineManifest};
use chrono::Utc;
use std::path::Path;

const BASELINE_FILES: &[&str] = &["CLAUDE.md", "settings.json"];

/// Capture ~/.claude/ state to ~/.ccpm/baseline/. NEVER overwrites existing baseline.
pub fn capture_baseline(claude_dir: &Path, ccpm_dir: &Path) -> Result<(), AppError> {
    let baseline_dir = ccpm_dir.join("baseline");
    let manifest_path = baseline_dir.join("manifest.json");
    if manifest_path.exists() {
        return Ok(()); // baseline exists — never overwrite
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
    // Backup skills/ and rules/ directories (shallow copy)
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
pub fn restore_baseline(claude_dir: &Path, ccpm_dir: &Path) -> Result<(), AppError> {
    let baseline_dir = ccpm_dir.join("baseline");
    let manifest_path = baseline_dir.join("manifest.json");
    if !manifest_path.exists() {
        return Err(AppError::BaselineNotFound);
    }
    let manifest: BaselineManifest =
        serde_json::from_str(&std::fs::read_to_string(&manifest_path)?)
            .map_err(|e| AppError::Parse(format!("baseline manifest 解析失败：{}", e)))?;
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
    Ok(())
}

/// Shallow copy: copies only direct file children of src into dst. Subdirectories are skipped.
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
    use tempfile::tempdir;

    fn setup_dirs(tmp: &std::path::Path) -> (std::path::PathBuf, std::path::PathBuf) {
        let claude = tmp.join(".claude");
        let ccpm = tmp.join(".ccpm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&ccpm).unwrap();
        (claude, ccpm)
    }

    #[test]
    fn test_capture_saves_existing_files() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup_dirs(dir.path());
        std::fs::write(claude.join("CLAUDE.md"), "# 原始").unwrap();
        std::fs::write(claude.join("settings.json"), r#"{"theme":"dark"}"#).unwrap();

        capture_baseline(&claude, &ccpm).unwrap();

        let baseline = ccpm.join("baseline");
        assert_eq!(std::fs::read_to_string(baseline.join("CLAUDE.md")).unwrap(), "# 原始");
        let manifest: crate::types::BaselineManifest = serde_json::from_str(
            &std::fs::read_to_string(baseline.join("manifest.json")).unwrap(),
        ).unwrap();
        assert!(!manifest.empty);
        assert!(manifest.files.contains(&"CLAUDE.md".to_string()));
        assert!(manifest.files.contains(&"settings.json".to_string()));
    }

    #[test]
    fn test_capture_empty_when_no_files() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup_dirs(dir.path());
        capture_baseline(&claude, &ccpm).unwrap();
        let manifest: crate::types::BaselineManifest = serde_json::from_str(
            &std::fs::read_to_string(ccpm.join("baseline").join("manifest.json")).unwrap(),
        ).unwrap();
        assert!(manifest.empty);
    }

    #[test]
    fn test_capture_is_idempotent() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup_dirs(dir.path());
        std::fs::write(claude.join("CLAUDE.md"), "# 原始").unwrap();
        capture_baseline(&claude, &ccpm).unwrap();
        std::fs::write(claude.join("CLAUDE.md"), "# 已修改").unwrap();
        capture_baseline(&claude, &ccpm).unwrap(); // second call must not overwrite
        assert_eq!(
            std::fs::read_to_string(ccpm.join("baseline").join("CLAUDE.md")).unwrap(),
            "# 原始"
        );
    }

    #[test]
    fn test_restore_writes_files_back() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup_dirs(dir.path());
        std::fs::write(claude.join("CLAUDE.md"), "# 原始").unwrap();
        capture_baseline(&claude, &ccpm).unwrap();
        std::fs::write(claude.join("CLAUDE.md"), "# ccpm 写入").unwrap();
        restore_baseline(&claude, &ccpm).unwrap();
        assert_eq!(std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(), "# 原始");
    }

    #[test]
    fn test_restore_fails_when_not_captured() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup_dirs(dir.path());
        let result = restore_baseline(&claude, &ccpm);
        assert!(matches!(result, Err(crate::error::AppError::BaselineNotFound)));
    }
}
