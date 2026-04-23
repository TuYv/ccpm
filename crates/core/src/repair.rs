use crate::{
    error::AppError,
    fs::{create_symlink, is_symlink_to},
    state::read_installed,
    types::SymlinkStatus,
};
use std::path::Path;

/// Check all recorded symlinks and return a list of broken ones.
pub fn check_symlink_health(
    claude_dir: &Path,
    ccpm_dir: &Path,
) -> Result<Vec<SymlinkStatus>, AppError> {
    let state = read_installed(ccpm_dir)?;
    let library = ccpm_dir.join("library");
    let mut broken = vec![];

    // CLAUDE.md
    if let Some(active) = &state.global.active_claude_md {
        let link = claude_dir.join("CLAUDE.md");
        let target = library
            .join("claude-mds")
            .join(&active.pack_id)
            .join("CLAUDE.md");
        if !is_symlink_to(&link, &target) {
            broken.push(SymlinkStatus {
                link_path: link,
                target_path: target,
                is_valid: false,
                pack_id: active.pack_id.clone(),
            });
        }
    }

    // Skills
    for active in &state.global.active_skills {
        for filename in &active.linked_files {
            let link = claude_dir.join("skills").join(filename);
            let target = library.join("skills").join(&active.pack_id).join(filename);
            if !is_symlink_to(&link, &target) {
                broken.push(SymlinkStatus {
                    link_path: link,
                    target_path: target,
                    is_valid: false,
                    pack_id: active.pack_id.clone(),
                });
            }
        }
    }

    // Rules
    for active in &state.global.active_rules {
        for filename in &active.linked_files {
            let link = claude_dir.join("rules").join(filename);
            let target = library.join("rules").join(&active.pack_id).join(filename);
            if !is_symlink_to(&link, &target) {
                broken.push(SymlinkStatus {
                    link_path: link,
                    target_path: target,
                    is_valid: false,
                    pack_id: active.pack_id.clone(),
                });
            }
        }
    }

    Ok(broken)
}

/// Recreate all broken symlinks. Returns count of repaired links.
/// Only repairs links whose library target still exists.
pub fn repair_symlinks(claude_dir: &Path, ccpm_dir: &Path) -> Result<usize, AppError> {
    let broken = check_symlink_health(claude_dir, ccpm_dir)?;
    let count = broken.len();
    for status in broken {
        if status.target_path.exists() {
            create_symlink(&status.target_path, &status.link_path)?;
        }
    }
    Ok(count)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        installer::install_skill_pack,
        registry::save_pack_to_library,
        types::{PackManifest, PackType},
    };
    use tempfile::tempdir;

    fn skill_manifest() -> PackManifest {
        PackManifest {
            id: "tdd-pack".to_string(),
            name: "TDD".to_string(),
            version: "1.0.0".to_string(),
            pack_type: PackType::Skill,
            description: "d".to_string(),
            author: "a".to_string(),
            files: vec!["tdd-red.md".to_string()],
            servers: Default::default(),
        }
    }

    fn setup(tmp: &std::path::Path) -> (std::path::PathBuf, std::path::PathBuf) {
        let claude = tmp.join(".claude");
        let ccpm = tmp.join(".ccpm");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::create_dir_all(ccpm.join("library")).unwrap();
        (claude, ccpm)
    }

    #[test]
    fn test_check_health_no_broken_links() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup(dir.path());
        let manifest = skill_manifest();
        save_pack_to_library(&ccpm.join("library"), &manifest, &[("tdd-red.md", "# Red")])
            .unwrap();
        install_skill_pack(&claude, &ccpm, &manifest, "official").unwrap();
        let broken = check_symlink_health(&claude, &ccpm).unwrap();
        assert!(broken.is_empty(), "healthy env should have no broken links");
    }

    #[test]
    fn test_check_health_detects_broken_link() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup(dir.path());
        let manifest = skill_manifest();
        save_pack_to_library(&ccpm.join("library"), &manifest, &[("tdd-red.md", "# Red")])
            .unwrap();
        install_skill_pack(&claude, &ccpm, &manifest, "official").unwrap();
        // simulate reinstall: delete the symlink
        std::fs::remove_file(claude.join("skills").join("tdd-red.md")).unwrap();
        let broken = check_symlink_health(&claude, &ccpm).unwrap();
        assert_eq!(broken.len(), 1);
        assert_eq!(broken[0].pack_id, "tdd-pack");
    }

    #[test]
    fn test_repair_symlinks_restores_links() {
        let dir = tempdir().unwrap();
        let (claude, ccpm) = setup(dir.path());
        let manifest = skill_manifest();
        save_pack_to_library(&ccpm.join("library"), &manifest, &[("tdd-red.md", "# Red")])
            .unwrap();
        install_skill_pack(&claude, &ccpm, &manifest, "official").unwrap();
        std::fs::remove_file(claude.join("skills").join("tdd-red.md")).unwrap();
        repair_symlinks(&claude, &ccpm).unwrap();
        assert!(claude.join("skills").join("tdd-red.md").is_symlink());
    }
}
