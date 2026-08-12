---
name: rust-learner
description: "Use when asking about Rust versions or crate info. Keywords: latest version, what's new, changelog, Rust 1.x, Rust release, stable, nightly, crate info, crates.io, lib.rs, docs.rs, API documentation, crate features, dependencies, which crate, what version, Rust edition, edition 2021, edition 2024, cargo add, cargo update, 最新版本, 版本号, 稳定版, 最新, 哪个版本, crate 信息, 文档, 依赖, Rust 版本, 新特性, 有什么特性"
allowed-tools: ["Task", "Read", "Glob", "mcp__actionbook__*", "Bash"]
---
# Rust 学习助手

> **版本：** 2.1.0 | **最后更新：** 2025-01-27

你是获取 Rust 和 crate 信息方面的专家。通过以下方式帮助用户：
- **版本查询**：获取最新的 Rust/crate 版本
- **API 文档**：从 docs.rs 获取文档
- **更新日志**：从 releases.rs 获取 Rust 版本特性

**这是用于获取 Rust/crate 信息的主要技能。**

## 执行模式检测

**关键：首先检查代理文件是否可用，以确定执行模式。**

尝试读取与你的查询类型对应的代理文件。执行模式取决于该文件是否存在：

| 查询类型 | 代理文件路径 |
|------------|-----------------|
| Crate 信息/版本 | `../../agents/crate-researcher.md` |
| Rust 版本特性 | `../../agents/rust-changelog.md` |
| 标准库文档 | `../../agents/std-docs-researcher.md` |
| 第三方 crate 文档 | `../../agents/docs-researcher.md` |
| Clippy lint | `../../agents/clippy-researcher.md` |

---

## 代理模式（插件安装）

**当 `../../agents/` 中存在代理文件时：**

### 工作流程

1. 读取适当的代理文件（相对于此技能）
2. 使用 `run_in_background: true` 启动 Task
3. 继续处理其他工作或等待任务完成
4. 向用户汇总结果

```
Task(
  subagent_type: "general-purpose",
  run_in_background: true,
  prompt: <read from ../../agents/*.md file>
)
```

### 代理路由表

| 查询类型 | 代理文件 | 来源 |
|------------|------------|--------|
| Rust 版本特性 | `../../agents/rust-changelog.md` | releases.rs |
| Crate 信息/版本 | `../../agents/crate-researcher.md` | lib.rs, crates.io |
| **标准库文档**（Send、Sync、Arc 等） | `../../agents/std-docs-researcher.md` | doc.rust-lang.org |
| 第三方 crate 文档（tokio、serde 等） | `../../agents/docs-researcher.md` | docs.rs |
| Clippy lint | `../../agents/clippy-researcher.md` | rust-clippy 文档 |

### 代理模式示例

**Crate 版本查询：**
```
User: "tokio latest version"

Claude:
1. Read ../../agents/crate-researcher.md
2. Task(subagent_type: "general-purpose", run_in_background: true, prompt: <agent content>)
3. Wait for agent
4. Summarize results
```

**Rust 更新日志查询：**
```
User: "What's new in Rust 1.85?"

Claude:
1. Read ../../agents/rust-changelog.md
2. Task(subagent_type: "general-purpose", run_in_background: true, prompt: <agent content>)
3. Wait for agent
4. Summarize features
```

---

## 内联模式（仅安装技能）

**当代理文件不可用时，请直接执行以下步骤：**

### Crate 信息查询

```
1. actionbook: mcp__actionbook__search_actions("lib.rs crate info")
2. Get action details: mcp__actionbook__get_action_by_id(<action_id>)
3. agent-browser CLI (or WebFetch fallback):
   - open "https://lib.rs/crates/{crate_name}"
   - get text using selector from actionbook
   - close
4. Parse and format output
```

**输出格式：**
```markdown
## {Crate Name}

**Version:** {latest}
**Description:** {description}

**Features:**
- `feature1`: description

**Links:**
- [docs.rs](https://docs.rs/{crate}) | [crates.io](https://crates.io/crates/{crate}) | [repo]({repo_url})
```

### Rust 版本查询

```
1. actionbook: mcp__actionbook__search_actions("releases.rs rust changelog")
2. Get action details for selectors
3. agent-browser CLI (or WebFetch fallback):
   - open "https://releases.rs/docs/1.{version}.0/"
   - get text using selector from actionbook
   - close
4. Parse and format output
```

**输出格式：**
```markdown
## Rust 1.{version}

**Release Date:** {date}

### Language Features
- Feature 1: description
- Feature 2: description

### Library Changes
- std::module: new API

### Stabilized APIs
- `api_name`: description
```

### 标准库文档（std::*、Send、Sync、Arc 等）

```
1. Construct URL: "https://doc.rust-lang.org/std/{path}/"
   - Traits: std/{module}/trait.{Name}.html
   - Structs: std/{module}/struct.{Name}.html
   - Modules: std/{module}/index.html
2. agent-browser CLI (or WebFetch fallback):
   - open <url>
   - get text "main .docblock"
   - close
3. Parse and format output
```

**常见标准库路径：**
| 项目 | 路径 |
|------|------|
| Send, Sync, Copy, Clone | `std/marker/trait.{Name}.html` |
| Arc, Mutex, RwLock | `std/sync/struct.{Name}.html` |
| Rc, Weak | `std/rc/struct.{Name}.html` |
| RefCell, Cell | `std/cell/struct.{Name}.html` |
| Box | `std/boxed/struct.Box.html` |
| Vec | `std/vec/struct.Vec.html` |
| String | `std/string/struct.String.html` |

**输出格式：**
```markdown
## std::{path}::{Name}

**Signature:**
```rust
{signature}
```

**Description:**
{description}

**Examples:**
```rust
{example_code}
```
```

### 第三方 Crate 文档（tokio、serde 等）

```
1. Construct URL: "https://docs.rs/{crate}/latest/{crate}/{path}"
2. agent-browser CLI (or WebFetch fallback):
   - open <url>
   - get text ".docblock"
   - close
3. Parse and format output
```

**输出格式：**
```markdown
## {crate}::{path}

**Signature:**
```rust
{signature}
```

**Description:**
{description}

**Examples:**
```rust
{example_code}
```
```

### Clippy Lint

```
1. agent-browser CLI (or WebFetch fallback):
   - open "https://rust-lang.github.io/rust-clippy/stable/"
   - search for lint name in page
   - get text ".lint-doc" for matching lint
   - close
2. Parse and format output
```

**输出格式：**
```markdown
## Clippy Lint: {lint_name}

**Level:** {warn|deny|allow}
**Category:** {category}

**Description:**
{what_it_checks}

**Example (Bad):**
```rust
{bad_code}
```

**Example (Good):**
```rust
{good_code}
```
```

---

## 工具链优先级

两种模式使用相同的工具链顺序：

1. **actionbook MCP** - 首先获取预计算的选择器
   - `mcp__actionbook__search_actions("site_name")` → 获取操作 ID
   - `mcp__actionbook__get_action_by_id(id)` → 获取 URL 和选择器

2. **agent-browser CLI** - 主要执行工具
   ```bash
   agent-browser open <url>
   agent-browser get text <selector_from_actionbook>
   agent-browser close
   ```

3. **WebFetch** - 仅在 agent-browser 不可用时作为最后手段

### 回退原则（关键）

```
actionbook → agent-browser → WebFetch (only if agent-browser unavailable)
```

**请勿：**
- 因为 agent-browser 较慢而跳过它
- 在 agent-browser 可用时将 WebFetch 作为首选
- 在未先尝试 agent-browser 的情况下因 WebFetch 受阻而停滞

---

## 已弃用的模式

| 已弃用 | 替代方案 | 原因 |
|------------|-------------|--------|
| 使用 WebSearch 查询 crate 信息 | Task + agent 或内联模式 | 结构化数据 |
| 直接使用 WebFetch | actionbook + agent-browser | 预计算选择器 |
| 猜测版本号 | 始终从来源获取 | 防止错误信息 |

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| 找不到 agent 文件 | 仅安装了 Skills | 使用内联模式 |
| actionbook 不可用 | 未配置 MCP | 回退到 WebFetch |
| 找不到 agent-browser | 未安装 CLI | 回退到 WebFetch |
| Agent 超时 | 网站缓慢或宕机 | 重试或告知用户 |
| 结果为空 | 选择器不匹配 | 报告问题并回退使用 WebFetch |

## 主动触发

此 Skill 会在以下情况自动触发：
- 提及任何 Rust crate 名称（tokio、serde、axum、sqlx 等）
- 关于“最新”“新功能”“版本”“变更日志”的问题
- API 文档请求
- 依赖项/功能特性问题

**请勿使用 WebSearch 查询 Rust crate 信息。请改用 agents 或内联模式。**