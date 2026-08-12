---
name: domain-cli
description: "Use when building CLI tools. Keywords: CLI, command line, terminal, clap, structopt, argument parsing, subcommand, interactive, TUI, ratatui, crossterm, indicatif, progress bar, colored output, shell completion, config file, environment variable, 命令行, 终端应用, 参数解析"
globs: ["**/Cargo.toml"]
user-invocable: false
---
# CLI 领域

> **第 3 层：领域约束**

## 领域约束 → 设计影响

| 领域规则 | 设计约束 | Rust 影响 |
|-------------|-------------------|------------------|
| 用户易用性 | 清晰的帮助和错误信息 | clap derive 宏 |
| 配置优先级 | CLI > 环境变量 > 配置文件 | 分层配置加载 |
| 退出码 | 出错时返回非零值 | 正确处理 Result |
| 标准输出/标准错误 | 数据与错误分离 | 使用 eprintln! 输出错误 |
| 可中断 | 处理 Ctrl+C | 信号处理 |

---

## 关键约束

### 用户通信

```
RULE: Errors to stderr, data to stdout
WHY: Pipeable output, scriptability
RUST: eprintln! for errors, println! for data
```

### 配置优先级

```
RULE: CLI args > env vars > config file > defaults
WHY: User expectation, override capability
RUST: Layered config with clap + figment/config
```

### 退出码

```
RULE: Return non-zero on any error
WHY: Script integration, automation
RUST: main() -> Result<(), Error> or explicit exit()
```

---

## 向下追溯 ↓

从约束到设计（第 2 层）：

```
"Need argument parsing"
    ↓ m05-type-driven: Derive structs for args
    ↓ clap: #[derive(Parser)]

"Need config layering"
    ↓ m09-domain: Config as domain object
    ↓ figment/config: Layer sources

"Need progress display"
    ↓ m12-lifecycle: Progress bar as RAII
    ↓ indicatif: ProgressBar
```

---

## 关键 Crate

| 用途 | Crate |
|---------|-------|
| 参数解析 | clap |
| 交互式提示 | dialoguer |
| 进度条 | indicatif |
| 彩色输出 | colored |
| 终端 UI | ratatui |
| 终端控制 | crossterm |
| 控制台实用工具 | console |

## 设计模式

| 模式 | 用途 | 实现 |
|---------|---------|----------------|
| 参数结构体 | 类型安全的参数 | `#[derive(Parser)]` |
| 子命令 | 命令层级结构 | `#[derive(Subcommand)]` |
| 配置分层 | 覆盖优先级 | CLI > 环境变量 > 配置文件 |
| 进度 | 用户反馈 | `ProgressBar::new(len)` |

## 代码模式：CLI 结构

```rust
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "myapp", about = "My CLI tool")]
struct Cli {
    /// Enable verbose output
    #[arg(short, long)]
    verbose: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new project
    Init { name: String },
    /// Run the application
    Run {
        #[arg(short, long)]
        port: Option<u16>,
    },
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Init { name } => init_project(&name)?,
        Commands::Run { port } => run_server(port.unwrap_or(8080))?,
    }
    Ok(())
}
```

---

## 常见错误

| 错误 | 违反的领域规则 | 修复方式 |
|---------|-----------------|-----|
| 将错误输出到标准输出 | 破坏管道传输 | eprintln! |
| 没有帮助文本 | 用户体验不佳 | #[arg(help = "...")] |
| 出错时 panic | 错误的退出码 | Result + 正确处理 |
| 长时间操作没有进度提示 | 用户无法确定当前状态 | indicatif |

---

## 追溯至第 1 层

| 约束 | 第 2 层模式 | 第 1 层实现 |
|------------|-----------------|------------------------|
| 类型安全的参数 | 派生宏 | clap Parser |
| 错误处理 | Result 传播 | anyhow + 退出码 |
| 用户反馈 | 进度 RAII | indicatif ProgressBar |
| 配置优先级 | 构建器模式 | 分层来源 |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 错误处理 | m06-error-handling |
| 类型驱动的参数 | m05-type-driven |
| 进度生命周期 | m12-lifecycle |
| 异步 CLI | m07-concurrency |