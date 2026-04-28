use ccpm_core::fs::default_claude_dir;
use serde::Serialize;
use std::{fs, path::PathBuf};

#[derive(Debug, Serialize)]
pub struct RecentProject {
    pub path: String,
    pub name: String,
    pub last_used: Option<String>, // ISO timestamp from history dir mtime
}

/// Encode a project path the way Claude Code's history dir uses (/ → -).
fn encode_path(path: &str) -> String {
    path.replace('/', "-")
}

#[tauri::command]
pub fn list_recent_projects() -> Result<Vec<RecentProject>, String> {
    // ~/.claude.json holds the canonical project paths under "projects".
    let home = dirs::home_dir().ok_or_else(|| "无法定位用户目录".to_string())?;
    let config_path = home.join(".claude.json");
    if !config_path.exists() {
        return Ok(vec![]);
    }
    let content = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let value: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    let projects = match value.get("projects").and_then(|v| v.as_object()) {
        Some(obj) => obj,
        None => return Ok(vec![]),
    };

    let history_dir: PathBuf = default_claude_dir().join("projects");
    let mut out = Vec::with_capacity(projects.len());
    for path in projects.keys() {
        let p = PathBuf::from(path);
        if !p.exists() {
            continue;
        }
        let name = p
            .file_name()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_else(|| path.clone());
        let last_used = history_dir
            .join(encode_path(path))
            .metadata()
            .and_then(|m| m.modified())
            .ok()
            .and_then(|t| {
                t.duration_since(std::time::UNIX_EPOCH).ok().map(|d| {
                    chrono::DateTime::<chrono::Utc>::from_timestamp(d.as_secs() as i64, 0)
                        .map(|dt| dt.to_rfc3339())
                        .unwrap_or_default()
                })
            });
        out.push(RecentProject {
            path: path.clone(),
            name,
            last_used,
        });
    }

    // Sort by last_used desc (None goes last).
    out.sort_by(|a, b| b.last_used.cmp(&a.last_used));
    Ok(out)
}
