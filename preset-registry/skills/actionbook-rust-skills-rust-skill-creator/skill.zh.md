---
name: rust-skill-creator
description: "Use when creating skills for Rust crates or std library documentation. Keywords: create rust skill, create crate skill, create std skill, 创建 rust skill, 创建 crate skill, 创建 std skill, 动态 rust skill, 动态 crate skill, skill for tokio, skill for serde, skill for axum, generate rust skill, rust 技能, crate 技能, 从文档创建skill, from docs create skill"
argument-hint: "<crate_name|std::module>"
context: fork
agent: general-purpose
---
# Rust Skill 创建器

> **版本：** 2.1.0 | **最后更新：** 2025-01-27
>
> 为 Rust crate 和标准库文档创建动态 Skill。

## 使用场景

此 Skill 用于处理以下创建 Skill 的请求：
- 第三方 crate（tokio、serde、axum 等）
- Rust 标准库（std::sync、std::marker 等）
- 任意 Rust 文档 URL

## 执行模式检测

**关键：检查相关命令/Skill 是否可用。**

此 Skill 依赖：
- `/create-llms-for-skills` 命令
- `/create-skills-via-llms` 命令

---

## Agent 模式（插件安装）

**当上述命令可用时（完整插件安装）：**

### 工作流程

#### 1. 确定目标

| 用户请求 | 目标类型 | URL 模式 |
|--------------|-------------|-------------|
| “创建 tokio skill” | 第三方 crate | `docs.rs/tokio/latest/tokio/` |
| “创建 Send trait skill” | 标准库 | `doc.rust-lang.org/std/marker/trait.Send.html` |
| “从 URL 创建 skill” + URL | 自定义 URL | 用户提供的 URL |

#### 2. 执行命令

使用 `/create-llms-for-skills` 命令：

```
/create-llms-for-skills <url> [requirements]
```

**示例：**

```bash
# For third-party crate
/create-llms-for-skills https://docs.rs/tokio/latest/tokio/

# For std library
/create-llms-for-skills https://doc.rust-lang.org/std/marker/trait.Send.html

# With specific requirements
/create-llms-for-skills https://docs.rs/axum/latest/axum/ "Focus on routing and extractors"
```

#### 3. 后续创建 Skill

生成 llms.txt 后，使用：

```
/create-skills-via-llms <crate_name> <llms_path> [version]
```

---

## 内联模式（仅安装 Skills）

**当上述命令不可用时，手动创建 Skill：**

### 第 1 步：确定目标并构造 URL

| 目标 | URL 模板 |
|--------|--------------|
| Crate 概览 | `https://docs.rs/{crate}/latest/{crate}/` |
| Crate 模块 | `https://docs.rs/{crate}/latest/{crate}/{module}/` |
| 标准库 trait | `https://doc.rust-lang.org/std/{module}/trait.{Name}.html` |
| 标准库 struct | `https://doc.rust-lang.org/std/{module}/struct.{Name}.html` |
| 标准库模块 | `https://doc.rust-lang.org/std/{module}/index.html` |

### 第 2 步：获取文档

```bash
# Using agent-browser CLI
agent-browser open "<documentation_url>"
agent-browser get text ".docblock"
agent-browser close
```

**或者使用 WebFetch 作为后备方案：**
```
WebFetch("<documentation_url>", "Extract API documentation including types, functions, and examples")
```

### 第 3 步：创建 Skill 目录

```bash
mkdir -p ~/.claude/skills/{crate_name}
mkdir -p ~/.claude/skills/{crate_name}/references
```

### 第 4 步：生成 SKILL.md

使用以下模板创建 `~/.claude/skills/{crate_name}/SKILL.md`：

```markdown
---
name: {crate_name}
description: "Documentation for {crate_name} crate. Keywords: {keywords}"
---

# {Crate Name}

> **Version:** {version} | **Source:** docs.rs

## Overview

{Brief description from documentation}

## Key Types

### {Type1}
{Description and usage}

### {Type2}
{Description and usage}

## Common Patterns

{Usage patterns extracted from documentation}

## Examples

```rust
{Example code from documentation}
```

## Documentation

- `./references/overview.md` - Main overview
- `./references/{module}.md` - Module documentation

## Links

- [docs.rs](https://docs.rs/{crate})
- [crates.io](https://crates.io/crates/{crate})
```

### 第 5 步：生成参考文件

为每个主要模块或类型创建一个参考文件：

```bash
# Fetch and save module documentation
agent-browser open "https://docs.rs/{crate}/latest/{crate}/{module}/"
agent-browser get text ".docblock" > ~/.claude/skills/{crate_name}/references/{module}.md
agent-browser close
```

### 第 6 步：验证 Skill

```bash
# Check skill structure
ls -la ~/.claude/skills/{crate_name}/
cat ~/.claude/skills/{crate_name}/SKILL.md
```

---

## URL 构造辅助表

| 目标 | URL 模板 |
|--------|--------------|
| Crate 概览 | `https://docs.rs/{crate}/latest/{crate}/` |
| Crate 模块 | `https://docs.rs/{crate}/latest/{crate}/{module}/` |
| 标准库 trait | `https://doc.rust-lang.org/std/{module}/trait.{Name}.html` |
| 标准库 struct | `https://doc.rust-lang.org/std/{module}/struct.{Name}.html` |
| 标准库模块 | `https://doc.rust-lang.org/std/{module}/index.html` |

## 常用标准库路径

| 项目 | 路径 |
|------|------|
| Send、Sync、Copy、Clone | `std/marker/trait.{Name}.html` |
| Arc、Mutex、RwLock | `std/sync/struct.{Name}.html` |
| Rc、Weak | `std/rc/struct.{Name}.html` |
| RefCell、Cell | `std/cell/struct.{Name}.html` |
| Box | `std/boxed/struct.Box.html` |
| Vec | `std/vec/struct.Vec.html` |
| String | `std/string/struct.String.html` |
| Option | `std/option/enum.Option.html` |
| Result | `std/result/enum.Result.html` |

---

## 交互示例

### 示例 1：创建 Crate Skill（Agent 模式）

```
User: "Create a dynamic skill for tokio"

Claude:
1. Identify: Third-party crate "tokio"
2. Execute: /create-llms-for-skills https://docs.rs/tokio/latest/tokio/
3. Wait for llms.txt generation
4. Execute: /create-skills-via-llms tokio ~/tmp/{timestamp}-tokio-llms.txt
```

### 示例 2：创建 Crate Skill（内联模式）

```
User: "Create a dynamic skill for tokio"

Claude:
1. Identify: Third-party crate "tokio"
2. Fetch: agent-browser open "https://docs.rs/tokio/latest/tokio/"
3. Extract documentation
4. Create: ~/.claude/skills/tokio/SKILL.md
5. Create: ~/.claude/skills/tokio/references/
6. Save reference files for key modules (sync, task, runtime, etc.)
```

### 示例 3：创建标准库 Skill

```
User: "Create a skill for Send and Sync traits"

Claude:
1. Identify: Std library traits
2. (Agent Mode) Execute: /create-llms-for-skills https://doc.rust-lang.org/std/marker/trait.Send.html https://doc.rust-lang.org/std/marker/trait.Sync.html
   (Inline Mode) Fetch each URL, create skill manually
3. Complete skill creation
```

---

## 禁止事项

- 使用 `best-skill-creator` 创建 Rust 相关 Skill
- 在未经验证的情况下猜测文档 URL
- 跳过文档获取步骤

## 输出位置

所有生成的 Skill 均保存至：`~/.claude/skills/`

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| 找不到命令 | 仅安装了 Skills | 使用内联模式 |
| 找不到 URL | 无效的 crate/模块 | 验证 crate 是否存在于 crates.io 上 |
| 文档为空 | API 已更改 | 使用其他选择器 |
| 权限被拒绝 | 目录问题 | 检查 ~/.claude/skills/ 权限 |