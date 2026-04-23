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
    let tmp = path.with_extension("tmp");
    {
        let mut file = std::fs::File::create(&tmp)?;
        file.write_all(content.as_bytes())?;
        file.sync_all()?;
    }
    std::fs::rename(&tmp, path)?;
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
pub fn remove_symlink(link: &Path) -> Result<(), AppError> {
    if !link.exists() && !link.is_symlink() {
        return Ok(());
    }
    std::fs::remove_file(link)
        .map_err(|e| AppError::Symlink(format!("删除符号链接 {} 失败：{}", link.display(), e)))
}

/// Returns true if link is a symlink pointing exactly to target.
pub fn is_symlink_to(link: &Path, target: &Path) -> bool {
    match std::fs::read_link(link) {
        Ok(actual) => actual == target,
        Err(_) => false,
    }
}

/// Returns ~/.ccpm/
pub fn default_ccpm_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("/tmp"))
        .join(".ccpm")
}

/// Returns ~/.claude/
pub fn default_claude_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("/tmp"))
        .join(".claude")
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
        assert!(!path.with_extension("tmp").exists());
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
    fn test_ccpm_dir_contains_home() {
        let home = dirs::home_dir().unwrap();
        let ccpm = default_ccpm_dir();
        assert!(ccpm.starts_with(&home));
        assert!(ccpm.to_string_lossy().contains(".ccpm"));
    }
}
