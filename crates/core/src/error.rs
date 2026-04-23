use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("IO 错误：{0}")]
    Io(String),
    #[error("权限不足：{0}")]
    PermissionDenied(String),
    #[error("网络错误：{0}")]
    Network(String),
    #[error("解析错误：{0}")]
    Parse(String),
    #[error("符号链接错误：{0}")]
    Symlink(String),
    #[error("Claude Code 未初始化：请先运行一次 `claude` 以创建 ~/.claude/")]
    ClaudeNotInitialized,
    #[error("基线不存在：请先运行 `ccpm status` 以捕获基线")]
    BaselineNotFound,
    #[error("Pack 不存在：{0}")]
    PackNotFound(String),
    #[error("源不存在：{0}")]
    SourceNotFound(String),
    #[error("源 '{0}' 已存在")]
    SourceAlreadyExists(String),
    #[error("集合不存在：{0}")]
    CollectionNotFound(String),
    #[error("备份失败：{0}")]
    BackupFailed(String),
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        match e.kind() {
            std::io::ErrorKind::PermissionDenied => AppError::PermissionDenied(e.to_string()),
            _ => AppError::Io(e.to_string()),
        }
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Parse(e.to_string())
    }
}

impl From<reqwest::Error> for AppError {
    fn from(e: reqwest::Error) -> Self {
        AppError::Network(e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_io_error_converts() {
        let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "not found");
        let app_err: AppError = io_err.into();
        assert!(matches!(app_err, AppError::Io(_)));
    }

    #[test]
    fn test_permission_denied_converts() {
        let io_err = std::io::Error::new(std::io::ErrorKind::PermissionDenied, "denied");
        let app_err: AppError = io_err.into();
        assert!(matches!(app_err, AppError::PermissionDenied(_)));
    }

    #[test]
    fn test_serde_error_converts() {
        let bad_json = serde_json::from_str::<serde_json::Value>("not json").unwrap_err();
        let app_err: AppError = bad_json.into();
        assert!(matches!(app_err, AppError::Parse(_)));
    }

    #[test]
    fn test_pack_not_found_message() {
        let e = AppError::PackNotFound("tdd-pack".to_string());
        assert!(e.to_string().contains("tdd-pack"));
    }
}
