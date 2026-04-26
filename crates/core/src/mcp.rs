use crate::{
    error::AppError,
    fs::atomic_write,
    state::{read_installed, write_installed},
    types::{McpMeta, Scope},
};
use serde_json::{json, Value};
use std::{collections::HashMap, path::Path};

/// Path to the MCP config file for a scope.
/// Global → <claude_dir>/settings.json (mcpServers field, merged)
/// Project → <project_dir>/.mcp.json
fn mcp_config_path(scope_dir: &Path, scope: &Scope) -> std::path::PathBuf {
    match scope {
        Scope::Global => scope_dir.join("settings.json"),
        Scope::Project(_) => scope_dir.join(".mcp.json"),
    }
}

/// Read the existing config (or empty object) and return the `mcpServers` field
/// as a JSON object plus the full root document for re-write.
fn read_mcp_servers(path: &Path) -> Result<(Value, Value), AppError> {
    if !path.exists() {
        return Ok((json!({}), json!({})));
    }
    let content = std::fs::read_to_string(path)?;
    let root: Value = serde_json::from_str(&content)
        .map_err(|e| AppError::Parse(format!("MCP config 解析失败：{}", e)))?;
    let servers = root.get("mcpServers").cloned().unwrap_or_else(|| json!({}));
    Ok((root, servers))
}

/// Build the JSON server entry from McpMeta + user-provided env values.
fn build_server_entry(meta: &McpMeta, env: &HashMap<String, String>) -> Value {
    let mut entry = json!({
        "command": meta.command,
        "args": meta.args,
    });
    if !env.is_empty() {
        entry["env"] = serde_json::to_value(env).unwrap_or(json!({}));
    }
    entry
}

/// Install an MCP server: merge into config file's `mcpServers` field.
/// For global scope, this writes settings.json. For project scope, .mcp.json.
pub fn install_mcp(
    scope_dir: &Path,
    pm_dir: &Path,
    meta: &McpMeta,
    env: &HashMap<String, String>,
    scope: &Scope,
) -> Result<(), AppError> {
    // Validate that all required env keys have non-empty values.
    for required in &meta.required_env {
        match env.get(&required.key) {
            Some(v) if !v.is_empty() => {}
            _ => {
                return Err(AppError::InvalidInput(format!(
                    "MCP {} 需要环境变量 {}",
                    meta.id, required.key
                )))
            }
        }
    }

    let path = mcp_config_path(scope_dir, scope);
    let (mut root, mut servers) = read_mcp_servers(&path)?;
    let server_entry = build_server_entry(meta, env);
    servers
        .as_object_mut()
        .ok_or_else(|| AppError::Parse("mcpServers 字段不是对象".to_string()))?
        .insert(meta.id.clone(), server_entry);
    if !root.is_object() {
        root = json!({});
    }
    root["mcpServers"] = servers;
    let pretty = serde_json::to_string_pretty(&root)
        .map_err(|e| AppError::Parse(format!("MCP config 序列化失败：{}", e)))?;
    atomic_write(&path, &pretty)?;

    // Update installed.json
    let mut state = read_installed(pm_dir)?;
    let list = match scope {
        Scope::Global => &mut state.global_mcps,
        Scope::Project(path_key) => state.project_mcps.entry(path_key.clone()).or_default(),
    };
    if !list.contains(&meta.id) {
        list.push(meta.id.clone());
    }
    write_installed(pm_dir, &state)
}

/// Uninstall MCP server: remove from config and from installed.json.
pub fn uninstall_mcp(
    scope_dir: &Path,
    pm_dir: &Path,
    mcp_id: &str,
    scope: &Scope,
) -> Result<(), AppError> {
    let path = mcp_config_path(scope_dir, scope);
    if path.exists() {
        let (mut root, mut servers) = read_mcp_servers(&path)?;
        if let Some(obj) = servers.as_object_mut() {
            obj.remove(mcp_id);
        }
        root["mcpServers"] = servers;
        let pretty = serde_json::to_string_pretty(&root)
            .map_err(|e| AppError::Parse(format!("MCP config 序列化失败：{}", e)))?;
        atomic_write(&path, &pretty)?;
    }

    let mut state = read_installed(pm_dir)?;
    match scope {
        Scope::Global => state.global_mcps.retain(|id| id != mcp_id),
        Scope::Project(path_key) => {
            if let Some(list) = state.project_mcps.get_mut(path_key) {
                list.retain(|id| id != mcp_id);
                if list.is_empty() {
                    state.project_mcps.remove(path_key);
                }
            }
        }
    }
    write_installed(pm_dir, &state)
}

pub fn list_installed_mcps(pm_dir: &Path, scope: &Scope) -> Result<Vec<String>, AppError> {
    let state = read_installed(pm_dir)?;
    Ok(match scope {
        Scope::Global => state.global_mcps,
        Scope::Project(path) => state.project_mcps.get(path).cloned().unwrap_or_default(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn meta(id: &str) -> McpMeta {
        McpMeta {
            id: id.to_string(),
            name: id.to_string(),
            description: "d".to_string(),
            category: "c".to_string(),
            command: "npx".to_string(),
            args: vec!["-y".to_string(), format!("@example/{}", id)],
            required_env: vec![],
            optional_env: vec![],
        }
    }

    fn meta_with_env(id: &str, env_key: &str) -> McpMeta {
        let mut m = meta(id);
        m.required_env = vec![crate::types::McpRequiredEnv {
            key: env_key.to_string(),
            hint: "".to_string(),
            description: "".to_string(),
        }];
        m
    }

    #[test]
    fn test_install_mcp_global_writes_settings_json() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();

        install_mcp(&claude, &pm, &meta("filesystem"), &HashMap::new(), &Scope::Global).unwrap();
        let content = std::fs::read_to_string(claude.join("settings.json")).unwrap();
        let v: Value = serde_json::from_str(&content).unwrap();
        assert!(v["mcpServers"]["filesystem"]["command"] == "npx");
    }

    #[test]
    fn test_install_mcp_global_preserves_other_settings() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();
        std::fs::write(
            claude.join("settings.json"),
            r#"{"model":"claude-sonnet-4-6"}"#,
        )
        .unwrap();

        install_mcp(&claude, &pm, &meta("fs"), &HashMap::new(), &Scope::Global).unwrap();
        let content = std::fs::read_to_string(claude.join("settings.json")).unwrap();
        let v: Value = serde_json::from_str(&content).unwrap();
        assert_eq!(v["model"], "claude-sonnet-4-6");
        assert!(v["mcpServers"]["fs"].is_object());
    }

    #[test]
    fn test_install_mcp_project_writes_dot_mcp_json() {
        let dir = tempdir().unwrap();
        let project = dir.path().join("proj");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&project).unwrap();
        std::fs::create_dir_all(&pm).unwrap();
        let scope = Scope::Project(project.to_string_lossy().to_string());

        install_mcp(&project, &pm, &meta("fs"), &HashMap::new(), &scope).unwrap();
        let content = std::fs::read_to_string(project.join(".mcp.json")).unwrap();
        let v: Value = serde_json::from_str(&content).unwrap();
        assert!(v["mcpServers"]["fs"].is_object());
    }

    #[test]
    fn test_install_mcp_missing_required_env_returns_invalid_input() {
        let dir = tempfile::tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();

        let result = install_mcp(
            &claude,
            &pm,
            &meta_with_env("github", "GITHUB_TOKEN"),
            &HashMap::new(), // empty env, missing required token
            &Scope::Global,
        );
        assert!(matches!(result, Err(AppError::InvalidInput(_))));
        assert!(!claude.join("settings.json").exists(), "config file must not be written when validation fails");
    }

    #[test]
    fn test_install_mcp_rejects_missing_required_env() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();

        let result = install_mcp(
            &claude,
            &pm,
            &meta_with_env("github", "GITHUB_TOKEN"),
            &HashMap::new(),
            &Scope::Global,
        );
        assert!(matches!(result, Err(AppError::InvalidInput(_))));
    }

    #[test]
    fn test_install_mcp_with_required_env_succeeds() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();

        let env: HashMap<String, String> =
            [("GITHUB_TOKEN".to_string(), "ghp_xx".to_string())].into();
        install_mcp(
            &claude,
            &pm,
            &meta_with_env("github", "GITHUB_TOKEN"),
            &env,
            &Scope::Global,
        )
        .unwrap();
        let v: Value = serde_json::from_str(
            &std::fs::read_to_string(claude.join("settings.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(v["mcpServers"]["github"]["env"]["GITHUB_TOKEN"], "ghp_xx");
    }

    #[test]
    fn test_uninstall_mcp_removes_entry_only() {
        let dir = tempdir().unwrap();
        let claude = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(&pm).unwrap();

        install_mcp(&claude, &pm, &meta("fs"), &HashMap::new(), &Scope::Global).unwrap();
        install_mcp(&claude, &pm, &meta("postgres"), &HashMap::new(), &Scope::Global).unwrap();
        uninstall_mcp(&claude, &pm, "fs", &Scope::Global).unwrap();

        let v: Value = serde_json::from_str(
            &std::fs::read_to_string(claude.join("settings.json")).unwrap(),
        )
        .unwrap();
        assert!(v["mcpServers"]["fs"].is_null());
        assert!(v["mcpServers"]["postgres"].is_object());
        assert_eq!(
            list_installed_mcps(&pm, &Scope::Global).unwrap(),
            vec!["postgres"]
        );
    }
}
