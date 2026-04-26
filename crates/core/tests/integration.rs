use claude_preset_core::{
    activator::{activate_preset, deactivate_preset},
    baseline::{capture_baseline, restore_baseline},
    fs::restore_backup_by_id,
    state::{read_backup_index, read_installed},
    types::{PresetManifest, RestoreOption, Scope},
};
use std::collections::HashMap;
use tempfile::tempdir;

fn make_manifest(id: &str, files: &[(&str, &str)]) -> PresetManifest {
    PresetManifest {
        id: id.to_string(),
        name: id.to_string(),
        description: "test preset".to_string(),
        tags: vec!["test".to_string()],
        components: files.iter().map(|(k, _)| k.to_string()).collect(),
        version: "1.0.0".to_string(),
        min_claude_code_version: None,
        tested_on: "2025-04-01".to_string(),
        author: "test".to_string(),
        files: files
            .iter()
            .map(|(k, v)| (k.to_string(), v.to_string()))
            .collect(),
        skills: vec![],
        mcps: vec![],
    }
}

fn file_contents(pairs: &[(&str, &str)]) -> HashMap<String, String> {
    pairs
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_string()))
        .collect()
}

#[test]
fn test_full_activate_restore_flow() {
    let dir = tempdir().unwrap();
    let claude = dir.path().join(".claude");
    let pm = dir.path().join(".preset-manager");
    std::fs::create_dir_all(&claude).unwrap();
    std::fs::create_dir_all(&pm).unwrap();

    // User has existing CLAUDE.md and settings.json
    std::fs::write(claude.join("CLAUDE.md"), "# 用户原始配置").unwrap();
    std::fs::write(claude.join("settings.json"), r#"{"theme":"dark"}"#).unwrap();

    // Capture baseline first
    capture_baseline(&claude, &pm).unwrap();
    assert!(pm.join("baseline").join("CLAUDE.md").exists());

    // Activate python-solo preset
    let manifest = make_manifest(
        "python-solo",
        &[
            ("CLAUDE.md", "CLAUDE.md"),
            ("settings.json", "settings.json"),
        ],
    );
    let contents = file_contents(&[
        ("CLAUDE.md", "# Python 独立开发者"),
        ("settings.json", r#"{"mcpServers":{}}"#),
    ]);
    let result = activate_preset(&claude, &pm, &manifest, &contents, &Scope::Global).unwrap();

    // Files written correctly
    assert_eq!(
        std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
        "# Python 独立开发者"
    );
    assert!(!result.written_files.is_empty());

    // Backup created before write
    let backup_dir = pm.join("backups").join(&result.backup_ref);
    assert!(backup_dir.join("CLAUDE.md").exists());
    assert_eq!(
        std::fs::read_to_string(backup_dir.join("CLAUDE.md")).unwrap(),
        "# 用户原始配置"
    );

    // installed.json updated
    let state = read_installed(&pm).unwrap();
    let active = state.global.as_ref().unwrap();
    assert_eq!(active.active_preset_id, "python-solo");
    assert_eq!(active.preset_version, "1.0.0");
    assert_eq!(active.backup_ref, result.backup_ref);

    // Restore baseline — installed.json global cleared, files back to original
    restore_baseline(&claude, &pm).unwrap();
    assert_eq!(
        std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
        "# 用户原始配置"
    );
    assert!(read_installed(&pm).unwrap().global.is_none());
}

#[test]
fn test_switch_presets_creates_backup_chain() {
    let dir = tempdir().unwrap();
    let claude = dir.path().join(".claude");
    let pm = dir.path().join(".preset-manager");
    std::fs::create_dir_all(&claude).unwrap();
    std::fs::create_dir_all(&pm).unwrap();
    capture_baseline(&claude, &pm).unwrap();

    let m1 = make_manifest("python-solo", &[("CLAUDE.md", "CLAUDE.md")]);
    let m2 = make_manifest("frontend-team", &[("CLAUDE.md", "CLAUDE.md")]);

    activate_preset(
        &claude,
        &pm,
        &m1,
        &file_contents(&[("CLAUDE.md", "# Python")]),
        &Scope::Global,
    )
    .unwrap();

    activate_preset(
        &claude,
        &pm,
        &m2,
        &file_contents(&[("CLAUDE.md", "# Frontend")]),
        &Scope::Global,
    )
    .unwrap();

    assert_eq!(
        std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
        "# Frontend"
    );

    // Restore last backup — goes back to python
    deactivate_preset(&claude, &pm, &Scope::Global, RestoreOption::LastBackup).unwrap();
    assert_eq!(
        std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
        "# Python"
    );
    assert!(read_installed(&pm).unwrap().global.is_none());
}

#[test]
fn test_project_scope_activation() {
    let dir = tempdir().unwrap();
    let project = dir.path().join("myproject");
    let pm = dir.path().join(".preset-manager");
    std::fs::create_dir_all(&project).unwrap();
    std::fs::create_dir_all(&pm).unwrap();

    let manifest = make_manifest("frontend-team", &[("CLAUDE.md", "CLAUDE.md")]);
    let scope = Scope::Project(project.to_string_lossy().to_string());
    activate_preset(
        &project,
        &pm,
        &manifest,
        &file_contents(&[("CLAUDE.md", "# Frontend Team")]),
        &scope,
    )
    .unwrap();

    assert_eq!(
        std::fs::read_to_string(project.join("CLAUDE.md")).unwrap(),
        "# Frontend Team"
    );
    let state = read_installed(&pm).unwrap();
    assert!(
        state.global.is_none(),
        "project activation must not affect global"
    );
    assert!(state
        .projects
        .contains_key(project.to_string_lossy().as_ref()));
}

#[test]
fn test_project_backup_restores_to_project_dir_not_global_dir() {
    let dir = tempdir().unwrap();
    let claude = dir.path().join(".claude");
    let project = dir.path().join("myproject");
    let pm = dir.path().join(".claude-presets");
    std::fs::create_dir_all(&claude).unwrap();
    std::fs::create_dir_all(&project).unwrap();
    std::fs::create_dir_all(&pm).unwrap();

    std::fs::write(project.join("CLAUDE.md"), "# project original").unwrap();
    std::fs::write(claude.join("CLAUDE.md"), "# global untouched").unwrap();

    let manifest = make_manifest("frontend-team", &[("CLAUDE.md", "CLAUDE.md")]);
    let scope = Scope::Project(project.to_string_lossy().to_string());
    let result = activate_preset(
        &project,
        &pm,
        &manifest,
        &file_contents(&[("CLAUDE.md", "# project preset")]),
        &scope,
    )
    .unwrap();

    std::fs::write(project.join("CLAUDE.md"), "# changed after preset").unwrap();
    restore_backup_by_id(&pm, &claude, &result.backup_ref).unwrap();

    assert_eq!(
        std::fs::read_to_string(project.join("CLAUDE.md")).unwrap(),
        "# project original"
    );
    assert_eq!(
        std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
        "# global untouched"
    );
}

#[test]
fn test_project_scope_rejects_baseline_restore() {
    let dir = tempdir().unwrap();
    let project = dir.path().join("myproject");
    let pm = dir.path().join(".claude-presets");
    std::fs::create_dir_all(&project).unwrap();
    std::fs::create_dir_all(&pm).unwrap();

    let scope = Scope::Project(project.to_string_lossy().to_string());
    let result = deactivate_preset(&project, &pm, &scope, RestoreOption::Baseline);

    assert!(
        result.is_err(),
        "project scope must not use global baseline restore"
    );
}

#[test]
fn test_consecutive_activations_each_create_backup_entry() {
    let dir = tempdir().unwrap();
    let claude = dir.path().join(".claude");
    let pm = dir.path().join(".claude-presets");
    std::fs::create_dir_all(&claude).unwrap();
    std::fs::create_dir_all(&pm).unwrap();
    capture_baseline(&claude, &pm).unwrap();

    for (i, id) in ["python-solo", "frontend-team", "writing-docs"]
        .iter()
        .enumerate()
    {
        let manifest = make_manifest(id, &[("CLAUDE.md", "CLAUDE.md")]);
        activate_preset(
            &claude,
            &pm,
            &manifest,
            &file_contents(&[("CLAUDE.md", &format!("# preset {}", i))]),
            &Scope::Global,
        )
        .unwrap();
    }

    let index = read_backup_index(&pm).unwrap();
    assert_eq!(index.backups.len(), 3, "one backup entry per activation");
    // Entries are in chronological order
    assert_eq!(index.backups[0].previous_preset, None); // first activation: no previous
    assert_eq!(
        index.backups[1].previous_preset.as_deref(),
        Some("python-solo")
    );
    assert_eq!(
        index.backups[2].previous_preset.as_deref(),
        Some("frontend-team")
    );
}

#[test]
fn test_restore_baseline_after_multiple_activations() {
    let dir = tempdir().unwrap();
    let claude = dir.path().join(".claude");
    let pm = dir.path().join(".claude-presets");
    std::fs::create_dir_all(&claude).unwrap();
    std::fs::create_dir_all(&pm).unwrap();

    std::fs::write(claude.join("CLAUDE.md"), "# 原始配置").unwrap();
    capture_baseline(&claude, &pm).unwrap();

    // Activate 3 presets in sequence
    for id in ["p1", "p2", "p3"] {
        let manifest = make_manifest(id, &[("CLAUDE.md", "CLAUDE.md")]);
        activate_preset(
            &claude,
            &pm,
            &manifest,
            &file_contents(&[("CLAUDE.md", &format!("# {}", id))]),
            &Scope::Global,
        )
        .unwrap();
    }
    assert_eq!(
        std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
        "# p3"
    );

    // Restore baseline — must go all the way back to original
    restore_baseline(&claude, &pm).unwrap();
    assert_eq!(
        std::fs::read_to_string(claude.join("CLAUDE.md")).unwrap(),
        "# 原始配置",
        "restore_baseline must recover original content regardless of how many activations happened"
    );
    assert!(read_installed(&pm).unwrap().global.is_none());
}
