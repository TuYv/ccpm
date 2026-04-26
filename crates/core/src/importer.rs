use crate::{error::AppError, types::PresetManifest};
use reqwest::StatusCode;
use std::collections::HashMap;

/// A bundle parsed from a GitHub URL — the result of import_from_github.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ImportedBundle {
    pub suggested_id: String,
    pub suggested_name: String,
    pub source_repo: String,
    pub source_url: String,
    pub claude_md: Option<String>,
    pub settings_json: Option<String>,
    /// skill_id → markdown content
    pub skills: HashMap<String, String>,
    /// mcp_id → JSON manifest content
    pub mcps: HashMap<String, String>,
}

impl ImportedBundle {
    /// Convert to a PresetManifest plus file_contents for activate_preset.
    pub fn to_manifest_and_files(&self) -> (PresetManifest, HashMap<String, String>) {
        let mut files = HashMap::new();
        let mut file_map = HashMap::new();
        if let Some(md) = &self.claude_md {
            files.insert("CLAUDE.md".to_string(), md.clone());
            file_map.insert("CLAUDE.md".to_string(), "CLAUDE.md".to_string());
        }
        if let Some(s) = &self.settings_json {
            files.insert("settings.json".to_string(), s.clone());
            file_map.insert("settings.json".to_string(), "settings.json".to_string());
        }
        let manifest = PresetManifest {
            id: self.suggested_id.clone(),
            name: self.suggested_name.clone(),
            description: format!("从 {} 导入", self.source_repo),
            tags: vec!["imported".to_string()],
            components: vec![],
            version: "1.0.0".to_string(),
            min_claude_code_version: None,
            tested_on: chrono::Utc::now().date_naive().to_string(),
            author: self.source_repo.clone(),
            files: file_map,
            skills: vec![],
            mcps: vec![],
        };
        (manifest, files)
    }
}

/// Parse a GitHub repo URL into (owner, repo, optional ref).
/// Accepts: https://github.com/owner/repo, https://github.com/owner/repo/tree/branch
pub fn parse_github_repo_url(url: &str) -> Result<(String, String, Option<String>), AppError> {
    let url = url.trim();
    let stripped = url
        .strip_prefix("https://github.com/")
        .or_else(|| url.strip_prefix("http://github.com/"))
        .or_else(|| url.strip_prefix("github.com/"))
        .ok_or_else(|| AppError::InvalidInput(format!("不是 github.com URL：{}", url)))?;
    // Strip query string and anchor before splitting.
    let stripped = stripped.split(['?', '#']).next().unwrap_or("");
    let parts: Vec<&str> = stripped.trim_end_matches('/').split('/').collect();
    if parts.len() < 2 {
        return Err(AppError::InvalidInput(format!(
            "URL 缺少 owner/repo：{}",
            url
        )));
    }
    let owner = parts[0].to_string();
    let repo = parts[1].trim_end_matches(".git").to_string();
    let r#ref = if parts.len() >= 4 && parts[2] == "tree" {
        Some(parts[3].to_string())
    } else {
        None
    };
    Ok((owner, repo, r#ref))
}

/// Build the raw.githubusercontent.com base URL for a repo + branch.
pub fn build_raw_base(owner: &str, repo: &str, branch: &str) -> String {
    format!(
        "https://raw.githubusercontent.com/{}/{}/{}",
        owner, repo, branch
    )
}

/// Fetch a single file; returns Ok(None) if 404.
async fn fetch_optional(client: &reqwest::Client, url: &str) -> Result<Option<String>, AppError> {
    let resp = client.get(url).send().await?;
    if resp.status() == StatusCode::NOT_FOUND {
        return Ok(None);
    }
    if !resp.status().is_success() {
        let status = resp.status();
        let hint = if status == StatusCode::FORBIDDEN {
            "（可能是 GitHub API 限流，建议在设置中配置 token）"
        } else if status == StatusCode::NOT_FOUND {
            "（文件不存在）"
        } else {
            ""
        };
        return Err(AppError::Network(format!(
            "HTTP {} fetching {}{}",
            status, url, hint
        )));
    }
    Ok(Some(resp.text().await?))
}

/// Detect default branch via repos API.
async fn detect_default_branch(
    client: &reqwest::Client,
    owner: &str,
    repo: &str,
) -> Result<String, AppError> {
    let url = format!("https://api.github.com/repos/{}/{}", owner, repo);
    let resp = client
        .get(&url)
        .header("User-Agent", "claude-preset")
        .header("Accept", "application/vnd.github+json")
        .send()
        .await?;
    if !resp.status().is_success() {
        let status = resp.status();
        let hint = if status == StatusCode::FORBIDDEN {
            "（可能是 GitHub API 限流或仓库私有，建议在设置中配置 token）"
        } else if status == StatusCode::NOT_FOUND {
            "（仓库不存在或为私有）"
        } else {
            ""
        };
        return Err(AppError::Network(format!(
            "HTTP {} fetching {}{}",
            status, url, hint
        )));
    }
    let v: serde_json::Value = resp.json().await?;
    // "main" fallback handles both new repos and rare API responses missing the field.
    Ok(v["default_branch"].as_str().unwrap_or("main").to_string())
}

/// Import a bundle from a GitHub repo URL. Detects CLAUDE.md, settings.json,
/// .claude/skills/*.md, and .mcp.json. Missing files are simply omitted.
pub async fn import_from_github(
    client: &reqwest::Client,
    repo_url: &str,
) -> Result<ImportedBundle, AppError> {
    let (owner, repo, r#ref) = parse_github_repo_url(repo_url)?;
    let branch = match r#ref {
        Some(b) => b,
        None => detect_default_branch(client, &owner, &repo).await?,
    };
    let base = build_raw_base(&owner, &repo, &branch);

    let claude_md = fetch_optional(client, &format!("{}/CLAUDE.md", base)).await?;
    let settings_json = fetch_optional(client, &format!("{}/.claude/settings.json", base)).await?;
    // v1 imports CLAUDE.md + settings.json only.
    // Skills/MCPs directory enumeration requires Trees API and is deferred to v2.
    let skills = HashMap::new();
    let mcps = HashMap::new();

    Ok(ImportedBundle {
        suggested_id: format!("{}-{}", owner, repo).to_lowercase(),
        suggested_name: format!("{}/{}", owner, repo),
        source_repo: format!("{}/{}", owner, repo),
        source_url: repo_url.to_string(),
        claude_md,
        settings_json,
        skills,
        mcps,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_github_repo_url_basic() {
        let (o, r, b) = parse_github_repo_url("https://github.com/anthropics/claude-code").unwrap();
        assert_eq!(o, "anthropics");
        assert_eq!(r, "claude-code");
        assert!(b.is_none());
    }

    #[test]
    fn test_parse_github_repo_url_with_branch() {
        let (o, r, b) =
            parse_github_repo_url("https://github.com/anthropics/claude-code/tree/dev").unwrap();
        assert_eq!(o, "anthropics");
        assert_eq!(r, "claude-code");
        assert_eq!(b, Some("dev".to_string()));
    }

    #[test]
    fn test_parse_github_repo_url_rejects_non_github() {
        let result = parse_github_repo_url("https://gitlab.com/foo/bar");
        assert!(matches!(result, Err(AppError::InvalidInput(_))));
    }

    #[test]
    fn test_build_raw_base() {
        assert_eq!(
            build_raw_base("anthropics", "claude-code", "main"),
            "https://raw.githubusercontent.com/anthropics/claude-code/main"
        );
    }

    #[test]
    fn test_parse_github_repo_url_strips_query() {
        let (o, r, b) = parse_github_repo_url("https://github.com/anthropics/claude-code?tab=readme").unwrap();
        assert_eq!(o, "anthropics");
        assert_eq!(r, "claude-code");
        assert!(b.is_none());
    }

    #[test]
    fn test_parse_github_repo_url_strips_anchor() {
        let (o, r, _) = parse_github_repo_url("https://github.com/anthropics/claude-code#readme").unwrap();
        assert_eq!(o, "anthropics");
        assert_eq!(r, "claude-code");
    }

    #[test]
    fn test_parse_github_repo_url_strips_dot_git() {
        let (_, r, _) = parse_github_repo_url("https://github.com/anthropics/claude-code.git").unwrap();
        assert_eq!(r, "claude-code");
    }

    #[test]
    fn test_imported_bundle_to_manifest() {
        let b = ImportedBundle {
            suggested_id: "test-repo".to_string(),
            suggested_name: "test/repo".to_string(),
            source_repo: "test/repo".to_string(),
            source_url: "https://github.com/test/repo".to_string(),
            claude_md: Some("# hello".to_string()),
            settings_json: None,
            skills: HashMap::new(),
            mcps: HashMap::new(),
        };
        let (m, files) = b.to_manifest_and_files();
        assert_eq!(m.id, "test-repo");
        assert!(files.contains_key("CLAUDE.md"));
        assert!(!files.contains_key("settings.json"));
    }
}
