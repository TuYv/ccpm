use ccpm_core::{
    activator::{activate_preset, deactivate_preset},
    baseline::{capture_baseline, restore_baseline},
    config::load_config,
    fs::{atomic_write, default_claude_dir, default_preset_manager_dir},
    registry::{build_client, fetch_all_preset_files, fetch_index, fetch_preset_manifest, load_from_cache},
    state::{read_installed},
    types::{RestoreOption, Scope},
};
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "ccpm", about = "Claude Code Preset Manager", version)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// List available presets (from cache or remote)
    List,
    /// Show currently activated presets
    Status,
    /// Activate a preset
    Use {
        preset_id: String,
        /// Activate globally (~/.claude/) instead of current project
        #[arg(long)]
        global: bool,
    },
    /// Restore configuration
    Restore {
        /// Restore to last backup instead of baseline
        #[arg(long)]
        last: bool,
        /// Restore a specific backup by ID
        #[arg(long, value_name = "BACKUP_ID")]
        backup: Option<String>,
    },
    /// Refresh preset cache from remote
    Fetch,
    /// Deactivate the current preset and optionally restore previous config
    Uninstall {
        #[arg(long)]
        global: bool,
        #[arg(long, value_name = "DIR")]
        project: Option<String>,
        #[arg(long, conflicts_with_all = ["restore_last", "no_restore"])]
        restore_baseline: bool,
        #[arg(long, conflicts_with_all = ["restore_baseline", "no_restore"])]
        restore_last: bool,
        #[arg(long, conflicts_with_all = ["restore_baseline", "restore_last"])]
        no_restore: bool,
    },
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_target(false).init();
    let cli = Cli::parse();
    if let Err(e) = run(cli).await {
        eprintln!("错误：{}", e);
        std::process::exit(1);
    }
}

async fn run(cli: Cli) -> Result<(), Box<dyn std::error::Error>> {
    let claude_dir = default_claude_dir();
    let pm_dir = default_preset_manager_dir();
    let config = load_config(&pm_dir)?;
    let cache_dir = pm_dir.join("cache");

    match cli.command {
        Command::List => {
            let index = if let Some(cached) = load_from_cache(&cache_dir, config.cache_ttl_minutes)? {
                cached
            } else {
                let client = build_client(&config)?;
                fetch_index(&client, &config.preset_source_url, &cache_dir).await?
            };
            if index.presets.is_empty() {
                println!("没有可用的 preset。");
            } else {
                println!("{:<24} {:<10} {}", "ID", "版本", "名称");
                println!("{}", "-".repeat(54));
                for p in &index.presets {
                    println!("{:<24} {:<10} {}", p.id, p.version, p.name);
                }
            }
        }

        Command::Status => {
            let state = read_installed(&pm_dir)?;
            if let Some(active) = &state.global {
                println!(
                    "全局：{} (v{}, 激活于 {})",
                    active.active_preset_id,
                    active.preset_version,
                    &active.activated_at[..10]
                );
            } else {
                println!("全局：未激活");
            }
            if state.projects.is_empty() {
                println!("项目：无");
            } else {
                for (path, active) in &state.projects {
                    println!(
                        "项目：{} (v{}, 激活于 {}) [{}]",
                        active.active_preset_id,
                        active.preset_version,
                        &active.activated_at[..10],
                        path
                    );
                }
            }
        }

        Command::Use { preset_id, global } => {
            // Capture baseline on first use (no-op if already captured).
            capture_baseline(&claude_dir, &pm_dir)?;

            let client = build_client(&config)?;
            println!("正在获取 preset '{}'...", preset_id);
            let manifest =
                fetch_preset_manifest(&client, &config.preset_source_url, &preset_id).await?;
            let file_contents =
                fetch_all_preset_files(&client, &config.preset_source_url, &manifest).await?;

            let scope = if global {
                Scope::Global
            } else {
                Scope::Project(std::env::current_dir()?.to_string_lossy().to_string())
            };
            let scope_dir = match &scope {
                Scope::Global => claude_dir.clone(),
                Scope::Project(path) => std::path::PathBuf::from(path),
            };

            let result = activate_preset(&scope_dir, &pm_dir, &manifest, &file_contents, &scope)?;
            println!("✓ 已激活「{}」", manifest.name);
            println!("  写入文件：{}", result.written_files.join(", "));
            println!("  备份 ID：{}", result.backup_ref);
        }

        Command::Restore { last, backup } => {
            if let Some(backup_id) = backup {
                let state = read_installed(&pm_dir)?;
                let active = state.global.as_ref().ok_or("当前无激活的全局 preset")?;
                let backup_dir = pm_dir.join("backups").join(&backup_id);
                if !backup_dir.exists() {
                    return Err(format!("备份 '{}' 不存在", backup_id).into());
                }
                for rel_path in &active.files {
                    let backup_file = backup_dir.join(rel_path);
                    let target = claude_dir.join(rel_path);
                    if backup_file.exists() {
                        let content = std::fs::read_to_string(&backup_file)?;
                        atomic_write(&target, &content)?;
                    }
                }
                println!("✓ 已从备份 '{}' 恢复", backup_id);
            } else if last {
                deactivate_preset(&claude_dir, &pm_dir, &Scope::Global, RestoreOption::LastBackup)?;
                println!("✓ 已恢复到上一个配置");
            } else {
                restore_baseline(&claude_dir, &pm_dir)?;
                println!("✓ 已恢复到基线（首次快照）配置");
            }
        }

        Command::Fetch => {
            let client = build_client(&config)?;
            let index =
                fetch_index(&client, &config.preset_source_url, &cache_dir).await?;
            println!("✓ 已刷新，共 {} 个 preset", index.presets.len());
        }

        Command::Uninstall { global, project, restore_baseline: rb, restore_last, no_restore } => {
            let scope = if let Some(path) = project {
                Scope::Project(path)
            } else if global {
                Scope::Global
            } else {
                Scope::Project(std::env::current_dir()?.to_string_lossy().to_string())
            };
            let scope_dir = match &scope {
                Scope::Global => claude_dir.clone(),
                Scope::Project(path) => std::path::PathBuf::from(path),
            };
            let restore = if rb {
                RestoreOption::Baseline
            } else if restore_last {
                RestoreOption::LastBackup
            } else if no_restore {
                RestoreOption::KeepFiles
            } else {
                RestoreOption::LastBackup // default: restore last backup
            };
            deactivate_preset(&scope_dir, &pm_dir, &scope, restore)?;
            println!("✓ 已卸载");
        }
    }
    Ok(())
}
