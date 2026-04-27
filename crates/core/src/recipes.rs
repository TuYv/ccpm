use crate::{
    error::AppError,
    fs::atomic_write,
    types::{ActiveState, Recipe, Scope},
};
use chrono::Utc;
use std::{fs, path::Path};

fn recipes_dir(pm_dir: &Path) -> std::path::PathBuf {
    pm_dir.join("recipes")
}

fn recipe_path(pm_dir: &Path, id: &str) -> std::path::PathBuf {
    recipes_dir(pm_dir).join(format!("{id}.json"))
}

fn active_path(pm_dir: &Path) -> std::path::PathBuf {
    pm_dir.join("active.json")
}

fn validate_id(id: &str) -> Result<(), AppError> {
    if id.is_empty() || id.contains(['/', '\\', '\0', '.']) {
        return Err(AppError::InvalidInput(format!("invalid recipe id: {id}")));
    }
    Ok(())
}

pub fn save_recipe(pm_dir: &Path, recipe: &Recipe) -> Result<(), AppError> {
    validate_id(&recipe.id)?;
    fs::create_dir_all(recipes_dir(pm_dir))?;
    atomic_write(
        &recipe_path(pm_dir, &recipe.id),
        &serde_json::to_string_pretty(recipe)?,
    )
}

pub fn get_recipe(pm_dir: &Path, id: &str) -> Result<Recipe, AppError> {
    validate_id(id)?;
    let path = recipe_path(pm_dir, id);
    let s = fs::read_to_string(&path)?;
    Ok(serde_json::from_str(&s)?)
}

pub fn list_recipes(pm_dir: &Path) -> Result<Vec<Recipe>, AppError> {
    let dir = recipes_dir(pm_dir);
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut out = vec![];
    for entry in fs::read_dir(&dir)? {
        let path = entry?.path();
        if path.extension().and_then(|s| s.to_str()) != Some("json") {
            continue;
        }
        let s = fs::read_to_string(&path)?;
        if let Ok(r) = serde_json::from_str::<Recipe>(&s) {
            out.push(r);
        }
    }
    out.sort_by(|a, b| a.updated_at.cmp(&b.updated_at).reverse());
    Ok(out)
}

pub fn delete_recipe(pm_dir: &Path, id: &str) -> Result<(), AppError> {
    validate_id(id)?;
    let path = recipe_path(pm_dir, id);
    if path.exists() {
        fs::remove_file(&path)?;
    }
    Ok(())
}

pub fn read_active(pm_dir: &Path) -> Result<ActiveState, AppError> {
    let path = active_path(pm_dir);
    if !path.exists() {
        return Ok(ActiveState::default());
    }
    Ok(serde_json::from_str(&fs::read_to_string(&path)?)?)
}

pub fn write_active(pm_dir: &Path, state: &ActiveState) -> Result<(), AppError> {
    fs::create_dir_all(pm_dir)?;
    atomic_write(&active_path(pm_dir), &serde_json::to_string_pretty(state)?)
}

pub fn get_active_for(pm_dir: &Path, scope: &Scope) -> Result<Option<String>, AppError> {
    let s = read_active(pm_dir)?;
    Ok(match scope {
        Scope::Global => s.global,
        Scope::Project(p) => s.projects.get(p).cloned(),
    })
}

pub fn now_rfc3339() -> String {
    Utc::now().to_rfc3339()
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn r(id: &str) -> Recipe {
        Recipe {
            id: id.into(),
            name: id.into(),
            description: "d".into(),
            claude_md: None,
            skills: vec![],
            mcps: vec![],
            settings_override: serde_json::json!({}),
            created_at: now_rfc3339(),
            updated_at: now_rfc3339(),
        }
    }

    #[test]
    fn test_save_get_list_delete_recipe() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        save_recipe(pm, &r("a")).unwrap();
        save_recipe(pm, &r("b")).unwrap();
        let listed = list_recipes(pm).unwrap();
        assert_eq!(listed.len(), 2);
        let got = get_recipe(pm, "a").unwrap();
        assert_eq!(got.id, "a");
        delete_recipe(pm, "a").unwrap();
        assert_eq!(list_recipes(pm).unwrap().len(), 1);
    }

    #[test]
    fn test_active_state_round_trip() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        let mut s = ActiveState::default();
        s.global = Some("current".into());
        s.projects.insert("/proj".into(), "rust".into());
        write_active(pm, &s).unwrap();
        let got = read_active(pm).unwrap();
        assert_eq!(got.global.unwrap(), "current");
        assert_eq!(got.projects.get("/proj").unwrap(), "rust");
    }

    #[test]
    fn test_get_active_for_scope() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        let mut s = ActiveState::default();
        s.global = Some("g".into());
        write_active(pm, &s).unwrap();
        assert_eq!(
            get_active_for(pm, &Scope::Global).unwrap().unwrap(),
            "g"
        );
        assert!(
            get_active_for(pm, &Scope::Project("/x".into()))
                .unwrap()
                .is_none()
        );
    }

    #[test]
    fn test_validate_id_rejects_dots() {
        let dir = tempdir().unwrap();
        let pm = dir.path();
        let mut bad = r("a.json");
        bad.id = "a.json".into();
        assert!(save_recipe(pm, &bad).is_err());
    }
}
