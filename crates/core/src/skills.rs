use crate::{
    error::AppError,
    fs::atomic_write,
    state::{read_installed, write_installed},
    types::{Scope, SkillMeta},
};
use std::path::Path;

/// Validate the install_path: must be relative, no `..`, no absolute path.
fn safe_install_path(rel: &str) -> bool {
    let p = std::path::Path::new(rel);
    !rel.is_empty()
        && !p.is_absolute()
        && !p.components().any(|c| c == std::path::Component::ParentDir)
}

/// Install a skill to scope_dir. Writes content to `<scope_dir>/<install_path>`,
/// then updates installed.json's skills list for the given scope.
pub fn install_skill(
    scope_dir: &Path,
    pm_dir: &Path,
    meta: &SkillMeta,
    content: &str,
    scope: &Scope,
) -> Result<(), AppError> {
    if !safe_install_path(&meta.install_path) {
        return Err(AppError::InvalidInput(format!(
            "skill install_path 不安全：'{}'",
            meta.install_path
        )));
    }
    let target = scope_dir.join(&meta.install_path);
    atomic_write(&target, content)?;

    let mut state = read_installed(pm_dir)?;
    let list = match scope {
        Scope::Global => &mut state.global_skills,
        Scope::Project(path) => state.project_skills.entry(path.clone()).or_default(),
    };
    if !list.contains(&meta.id) {
        list.push(meta.id.clone());
    }
    write_installed(pm_dir, &state)
}

/// Uninstall a skill: delete file at install_path and remove from installed.json.
/// If install_path's parent directory becomes empty, remove it too.
pub fn uninstall_skill(
    scope_dir: &Path,
    pm_dir: &Path,
    meta: &SkillMeta,
    scope: &Scope,
) -> Result<(), AppError> {
    if !safe_install_path(&meta.install_path) {
        return Err(AppError::InvalidInput(format!(
            "skill install_path 不安全：'{}'",
            meta.install_path
        )));
    }
    let target = scope_dir.join(&meta.install_path);
    if target.exists() {
        std::fs::remove_file(&target)?;
    }
    // Clean up empty parent dirs up to scope_dir.
    let mut parent = target.parent().map(|p| p.to_path_buf());
    while let Some(p) = parent {
        if p == scope_dir || !p.exists() {
            break;
        }
        if std::fs::read_dir(&p)?.next().is_none() {
            let _ = std::fs::remove_dir(&p);
            parent = p.parent().map(|q| q.to_path_buf());
        } else {
            break;
        }
    }

    let mut state = read_installed(pm_dir)?;
    match scope {
        Scope::Global => state.global_skills.retain(|id| id != &meta.id),
        Scope::Project(path) => {
            if let Some(list) = state.project_skills.get_mut(path) {
                list.retain(|id| id != &meta.id);
                if list.is_empty() {
                    state.project_skills.remove(path);
                }
            }
        }
    }
    write_installed(pm_dir, &state)
}

/// Returns IDs of skills installed for a given scope.
pub fn list_installed_skills(pm_dir: &Path, scope: &Scope) -> Result<Vec<String>, AppError> {
    let state = read_installed(pm_dir)?;
    Ok(match scope {
        Scope::Global => state.global_skills,
        Scope::Project(path) => state.project_skills.get(path).cloned().unwrap_or_default(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn meta(id: &str) -> SkillMeta {
        SkillMeta {
            id: id.to_string(),
            name: id.to_string(),
            description: "d".to_string(),
            category: "c".to_string(),
            compatible_tools: vec!["claude".to_string()],
            version: "1.0.0".to_string(),
            author: "a".to_string(),
            install_path: format!(".claude/skills/{}/SKILL.md", id),
            source: None,
        }
    }

    #[test]
    fn test_install_skill_writes_file_and_records_state() {
        let dir = tempdir().unwrap();
        let scope = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&scope).unwrap();
        std::fs::create_dir_all(&pm).unwrap();

        install_skill(&scope, &pm, &meta("tdd"), "# TDD", &Scope::Global).unwrap();
        let installed = scope.join(".claude/skills/tdd/SKILL.md");
        assert!(installed.exists());
        assert_eq!(std::fs::read_to_string(&installed).unwrap(), "# TDD");

        let list = list_installed_skills(&pm, &Scope::Global).unwrap();
        assert_eq!(list, vec!["tdd"]);
    }

    #[test]
    fn test_uninstall_skill_removes_file_and_state() {
        let dir = tempdir().unwrap();
        let scope = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&scope).unwrap();
        std::fs::create_dir_all(&pm).unwrap();

        install_skill(&scope, &pm, &meta("tdd"), "# TDD", &Scope::Global).unwrap();
        uninstall_skill(&scope, &pm, &meta("tdd"), &Scope::Global).unwrap();

        let installed = scope.join(".claude/skills/tdd/SKILL.md");
        assert!(!installed.exists());
        // Parent dir should also be cleaned up.
        assert!(!scope.join(".claude/skills/tdd").exists());
        let list = list_installed_skills(&pm, &Scope::Global).unwrap();
        assert!(list.is_empty());
    }

    #[test]
    fn test_install_skill_rejects_traversal() {
        let dir = tempdir().unwrap();
        let scope = dir.path().to_path_buf();
        let pm = dir.path().join("pm");
        let mut bad = meta("evil");
        bad.install_path = "../escape.md".to_string();
        let result = install_skill(&scope, &pm, &bad, "x", &Scope::Global);
        assert!(matches!(result, Err(AppError::InvalidInput(_))));
    }

    #[test]
    fn test_install_skill_idempotent() {
        let dir = tempdir().unwrap();
        let scope = dir.path().join("claude");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&scope).unwrap();
        std::fs::create_dir_all(&pm).unwrap();

        install_skill(&scope, &pm, &meta("tdd"), "# TDD v1", &Scope::Global).unwrap();
        install_skill(&scope, &pm, &meta("tdd"), "# TDD v2", &Scope::Global).unwrap();

        let list = list_installed_skills(&pm, &Scope::Global).unwrap();
        assert_eq!(list, vec!["tdd"]); // not duplicated
        let installed = scope.join(".claude/skills/tdd/SKILL.md");
        assert_eq!(std::fs::read_to_string(&installed).unwrap(), "# TDD v2");
    }

    #[test]
    fn test_install_skill_project_scope() {
        let dir = tempdir().unwrap();
        let project = dir.path().join("proj");
        let pm = dir.path().join("pm");
        std::fs::create_dir_all(&project).unwrap();
        std::fs::create_dir_all(&pm).unwrap();
        let scope = Scope::Project(project.to_string_lossy().to_string());

        install_skill(&project, &pm, &meta("tdd"), "# TDD", &scope).unwrap();
        let list = list_installed_skills(&pm, &scope).unwrap();
        assert_eq!(list, vec!["tdd"]);
    }
}
