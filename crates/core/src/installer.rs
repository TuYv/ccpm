use crate::{
    error::AppError,
    fs::{atomic_write, create_symlink, remove_symlink},
    registry::{load_pack_manifest, pack_type_subdir},
    state::{read_installed, write_installed},
    types::{ActivePackInfo, InstalledState, McpServerDef, PackManifest, PackType},
};
use chrono::Utc;
use std::{collections::HashMap, path::Path};

fn safe_filename(filename: &str) -> Result<&std::ffi::OsStr, AppError> {
    let p = std::path::Path::new(filename);
    if p.components().count() != 1
        || p.components()
            .any(|c| c == std::path::Component::ParentDir || c == std::path::Component::RootDir)
    {
        return Err(AppError::InvalidInput(format!("unsafe filename in pack: '{}'", filename)));
    }
    p.file_name().ok_or_else(|| AppError::InvalidInput("empty filename in pack".to_string()))
}

// ── CLAUDE.md install ────────────────────────────────────────────────────────

/// Install a claude-md pack: symlinks CLAUDE.md into claude_dir.
/// Backs up any real (non-symlink) CLAUDE.md via capture_baseline first.
pub fn install_claude_md(
    claude_dir: &Path,
    ccpm_dir: &Path,
    manifest: &PackManifest,
    source_name: &str,
) -> Result<(), AppError> {
    let pack_dir = ccpm_dir
        .join("library")
        .join(pack_type_subdir(&manifest.pack_type))
        .join(&manifest.id);
    let target = pack_dir.join("CLAUDE.md");
    let link = claude_dir.join("CLAUDE.md");

    if link.exists() && !link.is_symlink() {
        // Real file present — snapshot baseline before clobbering
        crate::baseline::capture_baseline(claude_dir, ccpm_dir)?;
        std::fs::remove_file(&link)?;
    } else if link.is_symlink() {
        remove_symlink(&link)?;
    }

    create_symlink(&target, &link)?;

    let mut state = read_installed(ccpm_dir)?;
    state.global.active_claude_md = Some(ActivePackInfo {
        pack_id: manifest.id.clone(),
        source_name: source_name.to_string(),
        version: manifest.version.clone(),
        linked_files: vec!["CLAUDE.md".to_string()],
        activated_at: Utc::now().to_rfc3339(),
    });
    write_installed(ccpm_dir, &state)
}

/// Remove the CLAUDE.md symlink and clear the active_claude_md record.
pub fn uninstall_claude_md(claude_dir: &Path, ccpm_dir: &Path) -> Result<(), AppError> {
    remove_symlink(&claude_dir.join("CLAUDE.md"))?;
    let mut state = read_installed(ccpm_dir)?;
    state.global.active_claude_md = None;
    write_installed(ccpm_dir, &state)
}

// ── Skill pack install ───────────────────────────────────────────────────────

/// Install a skill pack: symlinks each file into claude_dir/skills/.
pub fn install_skill_pack(
    claude_dir: &Path,
    ccpm_dir: &Path,
    manifest: &PackManifest,
    source_name: &str,
) -> Result<(), AppError> {
    let pack_dir = ccpm_dir
        .join("library")
        .join(pack_type_subdir(&manifest.pack_type))
        .join(&manifest.id);
    let skills_dir = claude_dir.join("skills");
    let mut linked = vec![];

    // Note: if symlink creation fails mid-loop, already-created symlinks are not rolled back.
    // The repair module (repair.rs) will clean up dangling symlinks on next startup.
    for filename in &manifest.files {
        let target = pack_dir.join(filename);
        let safe = safe_filename(filename)?;
        let link = skills_dir.join(safe);
        if link.is_symlink() {
            remove_symlink(&link)?;
        }
        create_symlink(&target, &link)?;
        linked.push(filename.clone());
    }

    let mut state = read_installed(ccpm_dir)?;
    state.global.active_skills.retain(|s| s.pack_id != manifest.id);
    state.global.active_skills.push(ActivePackInfo {
        pack_id: manifest.id.clone(),
        source_name: source_name.to_string(),
        version: manifest.version.clone(),
        linked_files: linked,
        activated_at: Utc::now().to_rfc3339(),
    });
    write_installed(ccpm_dir, &state)
}

/// Remove all symlinks for a skill pack and clear its state record.
pub fn uninstall_skill_pack(
    claude_dir: &Path,
    ccpm_dir: &Path,
    pack_id: &str,
) -> Result<(), AppError> {
    let mut state = read_installed(ccpm_dir)?;
    if let Some(info) = state
        .global
        .active_skills
        .iter()
        .find(|s| s.pack_id == pack_id)
        .cloned()
    {
        for filename in &info.linked_files {
            remove_symlink(&claude_dir.join("skills").join(filename))?;
        }
    }
    state.global.active_skills.retain(|s| s.pack_id != pack_id);
    write_installed(ccpm_dir, &state)
}

// ── Rule pack install ────────────────────────────────────────────────────────

/// Install a rule pack: symlinks each file into claude_dir/rules/.
pub fn install_rule_pack(
    claude_dir: &Path,
    ccpm_dir: &Path,
    manifest: &PackManifest,
    source_name: &str,
) -> Result<(), AppError> {
    let pack_dir = ccpm_dir
        .join("library")
        .join(pack_type_subdir(&manifest.pack_type))
        .join(&manifest.id);
    let rules_dir = claude_dir.join("rules");
    let mut linked = vec![];

    // Note: if symlink creation fails mid-loop, already-created symlinks are not rolled back.
    // The repair module (repair.rs) will clean up dangling symlinks on next startup.
    for filename in &manifest.files {
        let target = pack_dir.join(filename);
        let safe = safe_filename(filename)?;
        let link = rules_dir.join(safe);
        if link.is_symlink() {
            remove_symlink(&link)?;
        }
        create_symlink(&target, &link)?;
        linked.push(filename.clone());
    }

    let mut state = read_installed(ccpm_dir)?;
    state.global.active_rules.retain(|r| r.pack_id != manifest.id);
    state.global.active_rules.push(ActivePackInfo {
        pack_id: manifest.id.clone(),
        source_name: source_name.to_string(),
        version: manifest.version.clone(),
        linked_files: linked,
        activated_at: Utc::now().to_rfc3339(),
    });
    write_installed(ccpm_dir, &state)
}

/// Remove all symlinks for a rule pack and clear its state record.
pub fn uninstall_rule_pack(
    claude_dir: &Path,
    ccpm_dir: &Path,
    pack_id: &str,
) -> Result<(), AppError> {
    let mut state = read_installed(ccpm_dir)?;
    if let Some(info) = state
        .global
        .active_rules
        .iter()
        .find(|r| r.pack_id == pack_id)
        .cloned()
    {
        for filename in &info.linked_files {
            remove_symlink(&claude_dir.join("rules").join(filename))?;
        }
    }
    state.global.active_rules.retain(|r| r.pack_id != pack_id);
    write_installed(ccpm_dir, &state)
}

// ── MCP pack install (settings.json merge) ───────────────────────────────────

/// Install an MCP pack: merges its servers into settings.json.
pub fn install_mcp_pack(
    claude_dir: &Path,
    ccpm_dir: &Path,
    manifest: &PackManifest,
    source_name: &str,
) -> Result<(), AppError> {
    let mut state = read_installed(ccpm_dir)?;
    state.global.active_mcps.retain(|m| m.pack_id != manifest.id);
    state.global.active_mcps.push(ActivePackInfo {
        pack_id: manifest.id.clone(),
        source_name: source_name.to_string(),
        version: manifest.version.clone(),
        linked_files: vec![],
        activated_at: Utc::now().to_rfc3339(),
    });
    write_installed(ccpm_dir, &state)?;
    rebuild_settings_json(claude_dir, ccpm_dir, &state)
}

/// Remove an MCP pack's servers from settings.json.
pub fn uninstall_mcp_pack(
    claude_dir: &Path,
    ccpm_dir: &Path,
    pack_id: &str,
) -> Result<(), AppError> {
    let mut state = read_installed(ccpm_dir)?;
    state.global.active_mcps.retain(|m| m.pack_id != pack_id);
    write_installed(ccpm_dir, &state)?;
    rebuild_settings_json(claude_dir, ccpm_dir, &state)
}

/// Regenerate settings.json from all active MCP packs.
/// Preserves existing non-mcpServers fields (e.g. theme).
pub fn rebuild_settings_json(
    claude_dir: &Path,
    ccpm_dir: &Path,
    state: &InstalledState,
) -> Result<(), AppError> {
    let settings_path = claude_dir.join("settings.json");
    let mut settings: serde_json::Value = if settings_path.exists() {
        // follows symlinks automatically
        match std::fs::read_to_string(&settings_path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_else(|e| {
                eprintln!("warn: settings.json parse failed ({}), using empty", e);
                serde_json::json!({})
            }),
            Err(_) => serde_json::json!({}),
        }
    } else {
        serde_json::json!({})
    };
    // After rebuilding, ensure settings.json is a real file (remove symlink if present)
    if settings_path.is_symlink() {
        std::fs::remove_file(&settings_path)?;
    }

    let mut mcp_servers: HashMap<String, McpServerDef> = HashMap::new();
    for active in &state.global.active_mcps {
        let manifest = load_pack_manifest(
            &ccpm_dir.join("library"),
            PackType::Mcp,
            &active.pack_id,
        )?;
        for (name, def) in manifest.servers {
            mcp_servers.insert(name, def);
        }
    }

    settings["mcpServers"] = serde_json::to_value(&mcp_servers)?;
    atomic_write(&settings_path, &serde_json::to_string_pretty(&settings)?)
}

// ── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        registry::save_pack_to_library,
        types::{McpServerDef, PackManifest, PackType},
    };
    use tempfile::tempdir;

    fn setup(tmp: &std::path::Path) -> (std::path::PathBuf, std::path::PathBuf) {
        let claude = tmp.join(".claude");
        let ccpm = tmp.join(".ccpm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(ccpm.join("library")).unwrap();
        (claude, ccpm)
    }

    fn skill_manifest() -> PackManifest {
        PackManifest {
            id: "tdd-pack".to_string(),
            name: "TDD Pack".to_string(),
            version: "1.0.0".to_string(),
            pack_type: PackType::Skill,
            description: "d".to_string(),
            author: "a".to_string(),
            files: vec!["tdd-red.md".to_string(), "tdd-green.md".to_string()],
            servers: Default::default(),
        }
    }

    fn claude_md_manifest() -> PackManifest {
        PackManifest {
            id: "python-solo".to_string(),
            name: "Python Solo".to_string(),
            version: "1.0.0".to_string(),
            pack_type: PackType::ClaudeMd,
            description: "d".to_string(),
            author: "a".to_string(),
            files: vec!["CLAUDE.md".to_string()],
            servers: Default::default(),
        }
    }

    fn mcp_manifest() -> PackManifest {
        let mut servers = std::collections::HashMap::new();
        servers.insert(
            "git".to_string(),
            McpServerDef {
                command: "uvx".to_string(),
                args: vec!["mcp-server-git".to_string()],
                env: Default::default(),
            },
        );
        PackManifest {
            id: "git-pack".to_string(),
            name: "Git MCP".to_string(),
            version: "1.0.0".to_string(),
            pack_type: PackType::Mcp,
            description: "d".to_string(),
            author: "a".to_string(),
            files: vec![],
            servers,
        }
    }

    #[test]
    fn test_install_skill_pack_creates_symlinks() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup(dir.path());
        let manifest = skill_manifest();
        save_pack_to_library(
            &ccpm.join("library"),
            &manifest,
            &[("tdd-red.md", "# Red"), ("tdd-green.md", "# Green")],
        )
        .unwrap();
        install_skill_pack(&claude, &ccpm, &manifest, "official").unwrap();
        assert!(claude.join("skills").join("tdd-red.md").is_symlink());
        assert!(claude.join("skills").join("tdd-green.md").is_symlink());
        assert_eq!(
            std::fs::read_to_string(claude.join("skills").join("tdd-red.md")).unwrap(),
            "# Red"
        );
    }

    #[test]
    fn test_install_claude_md_creates_symlink() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup(dir.path());
        let manifest = claude_md_manifest();
        save_pack_to_library(
            &ccpm.join("library"),
            &manifest,
            &[("CLAUDE.md", "# Python")],
        )
        .unwrap();
        install_claude_md(&claude, &ccpm, &manifest, "official").unwrap();
        assert!(claude.join("CLAUDE.md").is_symlink());
        assert_eq!(
            std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
            "# Python"
        );
    }

    #[test]
    fn test_install_mcp_pack_updates_settings_json() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup(dir.path());
        let manifest = mcp_manifest();
        save_pack_to_library(&ccpm.join("library"), &manifest, &[]).unwrap();
        install_mcp_pack(&claude, &ccpm, &manifest, "official").unwrap();
        let settings: serde_json::Value = serde_json::from_str(
            &std::fs::read_to_string(claude.join("settings.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(settings["mcpServers"]["git"]["command"], "uvx");
    }

    #[test]
    fn test_uninstall_skill_pack_removes_symlinks() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup(dir.path());
        let manifest = skill_manifest();
        save_pack_to_library(
            &ccpm.join("library"),
            &manifest,
            &[("tdd-red.md", "# Red"), ("tdd-green.md", "# Green")],
        )
        .unwrap();
        install_skill_pack(&claude, &ccpm, &manifest, "official").unwrap();
        uninstall_skill_pack(&claude, &ccpm, "tdd-pack").unwrap();
        assert!(!claude.join("skills").join("tdd-red.md").exists());
        assert!(!claude.join("skills").join("tdd-green.md").exists());
    }

    #[test]
    fn test_uninstall_mcp_pack_removes_servers() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup(dir.path());
        let manifest = mcp_manifest();
        save_pack_to_library(&ccpm.join("library"), &manifest, &[]).unwrap();
        install_mcp_pack(&claude, &ccpm, &manifest, "official").unwrap();
        uninstall_mcp_pack(&claude, &ccpm, "git-pack").unwrap();
        let settings: serde_json::Value = serde_json::from_str(
            &std::fs::read_to_string(claude.join("settings.json")).unwrap(),
        )
        .unwrap();
        assert!(settings["mcpServers"]
            .as_object()
            .map(|m| m.is_empty())
            .unwrap_or(true));
    }

    #[test]
    fn test_install_updates_installed_json() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup(dir.path());
        let manifest = skill_manifest();
        save_pack_to_library(
            &ccpm.join("library"),
            &manifest,
            &[("tdd-red.md", "# Red"), ("tdd-green.md", "# Green")],
        )
        .unwrap();
        install_skill_pack(&claude, &ccpm, &manifest, "official").unwrap();
        let state = crate::state::read_installed(&ccpm).unwrap();
        // multi-scope: skills are in state.global
        assert_eq!(state.global.active_skills.len(), 1);
        assert_eq!(state.global.active_skills[0].pack_id, "tdd-pack");
    }
}
