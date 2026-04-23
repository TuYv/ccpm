use ccpm_core::{
    baseline::capture_baseline,
    installer::{
        install_claude_md, install_mcp_pack, install_skill_pack,
        uninstall_skill_pack,
    },
    registry::save_pack_to_library,
    repair::{check_symlink_health, repair_symlinks},
    state::read_installed,
    types::{McpServerDef, PackManifest, PackType},
};
use std::collections::HashMap;
use tempfile::tempdir;

fn make_skill_manifest() -> PackManifest {
    PackManifest {
        id: "tdd-pack".to_string(),
        name: "TDD Pack".to_string(),
        version: "1.0.0".to_string(),
        pack_type: PackType::Skill,
        description: "d".to_string(),
        author: "a".to_string(),
        files: vec!["tdd-red.md".to_string(), "tdd-green.md".to_string()],
        servers: HashMap::new(),
    }
}

fn make_claude_md_manifest() -> PackManifest {
    PackManifest {
        id: "python-solo".to_string(),
        name: "Python Solo".to_string(),
        version: "1.0.0".to_string(),
        pack_type: PackType::ClaudeMd,
        description: "d".to_string(),
        author: "a".to_string(),
        files: vec!["CLAUDE.md".to_string()],
        servers: HashMap::new(),
    }
}

fn make_mcp_manifest() -> PackManifest {
    let mut servers = HashMap::new();
    servers.insert(
        "git".to_string(),
        McpServerDef {
            command: "uvx".to_string(),
            args: vec!["mcp-server-git".to_string()],
            env: HashMap::new(),
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
fn test_full_install_flow() {
    let dir = tempdir().unwrap();
    let claude = dir.path().join(".claude");
    let ccpm = dir.path().join(".ccpm");
    std::fs::create_dir_all(&claude).unwrap();
    std::fs::create_dir_all(ccpm.join("library")).unwrap();

    // User has existing CLAUDE.md
    std::fs::write(claude.join("CLAUDE.md"), "# 用户原始配置").unwrap();

    // Capture baseline
    capture_baseline(&claude, &ccpm).unwrap();

    // Install claude-md pack
    let cm_manifest = make_claude_md_manifest();
    save_pack_to_library(
        &ccpm.join("library"),
        &cm_manifest,
        &[("CLAUDE.md", "# Python Solo")],
    )
    .unwrap();
    install_claude_md(&claude, &ccpm, &cm_manifest, "official").unwrap();
    assert!(claude.join("CLAUDE.md").is_symlink());
    assert_eq!(
        std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
        "# Python Solo"
    );

    // Install skill pack
    let skill_manifest = make_skill_manifest();
    save_pack_to_library(
        &ccpm.join("library"),
        &skill_manifest,
        &[("tdd-red.md", "# Red"), ("tdd-green.md", "# Green")],
    )
    .unwrap();
    install_skill_pack(&claude, &ccpm, &skill_manifest, "official").unwrap();
    assert!(claude.join("skills").join("tdd-red.md").is_symlink());

    // Install MCP pack
    let mcp_manifest = make_mcp_manifest();
    save_pack_to_library(&ccpm.join("library"), &mcp_manifest, &[]).unwrap();
    install_mcp_pack(&claude, &ccpm, &mcp_manifest, "official").unwrap();
    let settings: serde_json::Value = serde_json::from_str(
        &std::fs::read_to_string(claude.join("settings.json")).unwrap(),
    )
    .unwrap();
    assert_eq!(settings["mcpServers"]["git"]["command"], "uvx");

    // Verify installed.json state — uses multi-scope state.global.*
    let state = read_installed(&ccpm).unwrap();
    assert_eq!(
        state.global.active_claude_md.as_ref().unwrap().pack_id,
        "python-solo"
    );
    assert_eq!(state.global.active_skills.len(), 1);
    assert_eq!(state.global.active_mcps.len(), 1);

    // Uninstall skill pack
    uninstall_skill_pack(&claude, &ccpm, "tdd-pack").unwrap();
    assert!(!claude.join("skills").join("tdd-red.md").exists());

    // Simulate reinstall: delete CLAUDE.md symlink
    std::fs::remove_file(claude.join("CLAUDE.md")).unwrap();
    let broken = check_symlink_health(&claude, &ccpm).unwrap();
    assert_eq!(broken.len(), 1);
    let repaired = repair_symlinks(&claude, &ccpm).unwrap();
    assert_eq!(repaired, 1);
    assert!(claude.join("CLAUDE.md").is_symlink());
}
