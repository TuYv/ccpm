mod commands;

use commands::{
    claude_settings, config, importer, library, mcps, presets, recent_projects, recipes,
    scan_existing, skills, state,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            config::get_config,
            config::set_config,
            config::capture_baseline_cmd,
            config::restore_baseline_cmd,
            config::baseline_status,
            presets::fetch_index_cmd,
            presets::get_manifest,
            presets::get_preset_files,
            presets::activate_preset_cmd,
            presets::activate_seed_preset_cmd,
            presets::deactivate_preset_cmd,
            presets::list_backups,
            presets::restore_backup,
            state::get_installed,
            claude_settings::read_claude_settings,
            claude_settings::write_claude_settings,
            skills::fetch_skills_index_cmd,
            skills::install_skill_cmd,
            skills::uninstall_skill_cmd,
            skills::list_installed_skills_cmd,
            mcps::fetch_mcps_index_cmd,
            mcps::install_mcp_cmd,
            mcps::uninstall_mcp_cmd,
            mcps::list_installed_mcps_cmd,
            importer::import_from_github_cmd,
            library::list_library_items,
            library::get_library_meta,
            library::get_library_claude_md,
            library::get_library_skill_md,
            library::get_library_mcp_json,
            library::add_library_claude_md,
            library::add_library_skill,
            library::add_library_mcp,
            library::remove_library_item,
            library::download_skill_to_library_cmd,
            library::download_mcp_to_library_cmd,
            recipes::list_recipes_cmd,
            recipes::get_recipe_cmd,
            recipes::save_recipe_cmd,
            recipes::delete_recipe_cmd,
            recipes::activate_recipe_cmd,
            recipes::deactivate_recipe_cmd,
            recipes::get_active_state_cmd,
            recipes::get_active_recipe_id_cmd,
            scan_existing::is_first_launch_cmd,
            scan_existing::scan_and_seed_cmd,
            recent_projects::list_recent_projects,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
