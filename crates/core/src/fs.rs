use crate::error::AppError;
use std::{
    io::Write,
    path::{Path, PathBuf},
};

/// Atomic write: temp→fsync→rename. Auto-creates parent dirs.
pub fn atomic_write(path: &Path, content: &str) -> Result<(), AppError> {
    if let Some(parent) = path.parent() {
        if !parent.as_os_str().is_empty() {
            std::fs::create_dir_all(parent)?;
        }
    }
    // Unique tmp name avoids collisions under concurrent writes.
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.subsec_nanos())
        .unwrap_or(0);
    let tmp = path.with_file_name(format!(
        ".{}.{}.{}.tmp",
        path.file_name().unwrap_or_default().to_string_lossy(),
        std::process::id(),
        nonce,
    ));
    {
        let mut file = std::fs::File::create(&tmp)?;
        file.write_all(content.as_bytes())?;
        file.sync_all()?;
    }
    std::fs::rename(&tmp, path)?;
    // fsync parent dir so the rename survives a crash.
    if let Some(parent) = path.parent() {
        if let Ok(dir) = std::fs::File::open(parent) {
            let _ = dir.sync_all();
        }
    }
    Ok(())
}

/// Create symlink link → target. Auto-creates link's parent dir.
pub fn create_symlink(target: &Path, link: &Path) -> Result<(), AppError> {
    if let Some(parent) = link.parent() {
        std::fs::create_dir_all(parent)?;
    }
    #[cfg(unix)]
    std::os::unix::fs::symlink(target, link).map_err(|e| {
        AppError::Symlink(format!(
            "创建符号链接 {} -> {} 失败：{}",
            link.display(),
            target.display(),
            e
        ))
    })?;
    #[cfg(not(unix))]
    return Err(AppError::Symlink("当前平台不支持符号链接".to_string()));
    Ok(())
}

/// Remove symlink without deleting the target file.
/// Returns an error if the path exists but is not a symlink — prevents accidental data loss.
pub fn remove_symlink(link: &Path) -> Result<(), AppError> {
    if !link.exists() && !link.is_symlink() {
        return Ok(());
    }
    if !link.is_symlink() {
        return Err(AppError::Symlink(format!(
            "拒绝删除非符号链接文件：{}",
            link.display()
        )));
    }
    std::fs::remove_file(link)
        .map_err(|e| AppError::Symlink(format!("删除符号链接 {} 失败：{}", link.display(), e)))
}

/// Returns true if link is a symlink pointing exactly to target AND target exists.
pub fn is_symlink_to(link: &Path, target: &Path) -> bool {
    if !target.exists() {
        return false;
    }
    match std::fs::read_link(link) {
        Ok(actual) => actual == target,
        Err(_) => false,
    }
}

/// Returns ~/.claude/
pub fn default_claude_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("/tmp"))
        .join(".claude")
}

/// Returns ~/.claude/.preset-manager/ (all app state lives here).
pub fn default_preset_manager_dir() -> PathBuf {
    default_claude_dir().join(".preset-manager")
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_atomic_write_creates_file() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("out.md");
        atomic_write(&path, "hello").unwrap();
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "hello");
    }

    #[test]
    fn test_atomic_write_no_tmp_leftover() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("out.md");
        atomic_write(&path, "content").unwrap();
        let tmp = path.with_file_name(".out.md.tmp");
        assert!(!tmp.exists());
    }

    #[test]
    fn test_atomic_write_creates_parent_dirs() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("a/b/c/out.md");
        atomic_write(&path, "nested").unwrap();
        assert!(path.exists());
    }

    #[test]
    fn test_create_symlink_works() {
        let dir = tempdir().unwrap();
        let target = dir.path().join("target.md");
        std::fs::write(&target, "content").unwrap();
        let link = dir.path().join("link.md");
        create_symlink(&target, &link).unwrap();
        assert!(link.exists());
        assert_eq!(std::fs::read_to_string(&link).unwrap(), "content");
    }

    #[test]
    fn test_create_symlink_creates_parent() {
        let dir = tempdir().unwrap();
        let target = dir.path().join("target.md");
        std::fs::write(&target, "x").unwrap();
        let link = dir.path().join("subdir").join("link.md");
        create_symlink(&target, &link).unwrap();
        assert!(link.exists());
    }

    #[test]
    fn test_remove_symlink_works() {
        let dir = tempdir().unwrap();
        let target = dir.path().join("target.md");
        std::fs::write(&target, "x").unwrap();
        let link = dir.path().join("link.md");
        create_symlink(&target, &link).unwrap();
        remove_symlink(&link).unwrap();
        assert!(!link.exists());
        assert!(target.exists(), "删除符号链接不应删除目标文件");
    }

    #[test]
    fn test_is_symlink_to_works() {
        let dir = tempdir().unwrap();
        let target = dir.path().join("target.md");
        std::fs::write(&target, "x").unwrap();
        let link = dir.path().join("link.md");
        create_symlink(&target, &link).unwrap();
        assert!(is_symlink_to(&link, &target));
        assert!(!is_symlink_to(&link, &dir.path().join("other.md")));
    }

    #[test]
    fn test_preset_manager_dir_under_claude() {
        let pm = default_preset_manager_dir();
        assert!(pm.to_string_lossy().contains(".claude"));
        assert!(pm.to_string_lossy().contains(".preset-manager"));
    }

    #[test]
    fn test_remove_symlink_rejects_regular_file() {
        let dir = tempdir().unwrap();
        let file = dir.path().join("regular.md");
        std::fs::write(&file, "content").unwrap();
        let result = remove_symlink(&file);
        assert!(result.is_err(), "must not delete a regular file");
        assert!(file.exists(), "regular file must survive");
    }

    #[test]
    fn test_is_symlink_to_returns_false_when_target_missing() {
        let dir = tempdir().unwrap();
        let link = dir.path().join("link.md");
        let target = dir.path().join("ghost.md"); // does not exist
        assert!(!is_symlink_to(&link, &target));
    }

    #[test]
    fn test_is_symlink_to_returns_false_for_dangling_symlink() {
        let dir = tempdir().unwrap();
        let target = dir.path().join("target.md");
        std::fs::write(&target, "x").unwrap();
        let link = dir.path().join("link.md");
        create_symlink(&target, &link).unwrap();
        // Delete the target — now the symlink is dangling
        std::fs::remove_file(&target).unwrap();
        assert!(!is_symlink_to(&link, &target), "dangling symlink must not be valid");
    }

    #[test]
    fn test_atomic_write_tmp_name_is_unique() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("out.md");
        // Write twice rapidly; both should succeed without collisions
        atomic_write(&path, "first").unwrap();
        atomic_write(&path, "second").unwrap();
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "second");
    }
}
