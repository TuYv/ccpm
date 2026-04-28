use ccpm_core::fs::default_claude_dir;
use serde_json::Value;
use std::fs;

#[tauri::command]
pub fn read_claude_settings() -> Result<Value, String> {
    let path = default_claude_dir().join("settings.json");
    if !path.exists() {
        return Ok(Value::Object(serde_json::Map::new()));
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_claude_settings(settings: Value) -> Result<(), String> {
    let dir = default_claude_dir();
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(dir.join("settings.json"), content).map_err(|e| e.to_string())
}
