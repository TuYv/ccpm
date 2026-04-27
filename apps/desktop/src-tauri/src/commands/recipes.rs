use claude_preset_core::{
    fs::{default_claude_dir, default_preset_manager_dir},
    recipes::{
        activate_recipe, deactivate_recipe, delete_recipe, get_active_for, get_recipe,
        list_recipes, read_active, save_recipe, write_active,
    },
    types::{ActiveState, Recipe, Scope},
};
use std::path::PathBuf;

use super::presets::ScopeArg;

fn scope_to_dir(scope: &Scope, claude_dir: &std::path::Path) -> PathBuf {
    match scope {
        Scope::Global => claude_dir.to_path_buf(),
        Scope::Project(p) => PathBuf::from(p),
    }
}

#[tauri::command]
pub fn list_recipes_cmd() -> Result<Vec<Recipe>, String> {
    let pm = default_preset_manager_dir();
    list_recipes(&pm).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_recipe_cmd(id: String) -> Result<Recipe, String> {
    let pm = default_preset_manager_dir();
    get_recipe(&pm, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_recipe_cmd(recipe: Recipe) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    save_recipe(&pm, &recipe).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_recipe_cmd(id: String) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    delete_recipe(&pm, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn activate_recipe_cmd(id: String, scope: ScopeArg) -> Result<String, String> {
    let pm = default_preset_manager_dir();
    let claude = default_claude_dir();
    let core_scope: Scope = scope.into();
    let scope_dir = scope_to_dir(&core_scope, &claude);
    activate_recipe(&scope_dir, &pm, &id, &core_scope).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn deactivate_recipe_cmd(scope: ScopeArg) -> Result<(), String> {
    let pm = default_preset_manager_dir();
    let core_scope: Scope = scope.into();
    deactivate_recipe(&pm, &core_scope).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_active_state_cmd() -> Result<ActiveState, String> {
    let pm = default_preset_manager_dir();
    read_active(&pm).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_active_recipe_id_cmd(scope: ScopeArg) -> Result<Option<String>, String> {
    let pm = default_preset_manager_dir();
    let core_scope: Scope = scope.into();
    get_active_for(&pm, &core_scope).map_err(|e| e.to_string())
}
