---
name: core-dynamic-skills
description: "Internal command support for dynamic Rust crate skill management. Use only when explicitly invoked by /sync-crate-skills, /clean-crate-skills, or /update-crate-skill."
disable-model-invocation: true
argument-hint: "[--force] | <crate_name>"
context: fork
agent: general-purpose
---
# 动态技能管理器

> **版本：** 2.1.0 | **最后更新：** 2025-01-27

根据项目依赖，按需编排生成特定于 crate 的技能。

## 概念

动态技能具有以下特点：
- 在本地的 `~/.claude/skills/` 中生成
- 基于 Cargo.toml 依赖项
- 使用来自 docs.rs 的 llms.txt 创建
- 支持版本管理和更新
- 不提交到 rust-skills 仓库

## 触发场景

### 打开时提示

进入包含 Cargo.toml 的目录时：
1. 检测 Cargo.toml（单个项目或工作区）
2. 解析依赖项列表
3. 检查哪些 crate 缺少技能
4. 如果存在缺失项："发现 X 个依赖项没有技能。立即同步吗？"
5. 如果确认：运行 `/sync-crate-skills`

### 手动命令

- `/sync-crate-skills` - 同步所有依赖项
- `/clean-crate-skills [crate]` - 移除技能
- `/update-crate-skill <crate>` - 更新特定技能

## 执行模式检测

**关键：检查智能体和命令基础设施是否可用。**

尝试读取：`../../agents/` 目录  
检查 `/create-llms-for-skills` 和 `/create-skills-via-llms` 命令是否可用。

---

## 智能体模式（插件安装）

**当完整的插件基础设施可用时：**

### 架构

```
Cargo.toml
    ↓
Parse dependencies
    ↓
For each crate:
  ├─ Check ~/.claude/skills/{crate}/
  ├─ If missing: Check actionbook for llms.txt
  │     ├─ Found: /create-skills-via-llms
  │     └─ Not found: /create-llms-for-skills first
  └─ Load skill
```

### 工作流优先级

1. **actionbook MCP** - 检查预生成的 llms.txt
2. **/create-llms-for-skills** - 从 docs.rs 生成 llms.txt
3. **/create-skills-via-llms** - 从 llms.txt 创建技能

### 同步命令

```bash
/sync-crate-skills [--force]
```

1. 解析 Cargo.toml 中的依赖项
2. 对于每个依赖项：
   - 检查 `~/.claude/skills/{crate}/` 中是否存在技能
   - 如果缺失（或使用了 --force）：生成技能
3. 报告结果

---

## 内联模式（仅安装技能）

**当智能体/命令基础设施不可用时，手动执行：**

### 第 1 步：解析 Cargo.toml

```bash
# Read dependencies
cat Cargo.toml | grep -A 100 '\[dependencies\]' | grep -E '^[a-zA-Z]'
```

或者使用 Read 工具解析 Cargo.toml 并提取：
- `[dependencies]` 部分
- `[dev-dependencies]` 部分（可选）
- 工作区成员（如果是工作区项目）

### 第 2 步：检查现有技能

```bash
# List existing skills
ls ~/.claude/skills/
```

与依赖项进行比较，找出缺失的技能。

### 第 3 步：生成缺失的技能

对于每个缺失的 crate：

```bash
# 1. Fetch crate documentation
agent-browser open "https://docs.rs/{crate}/latest/{crate}/"
agent-browser get text ".docblock"
# Save content

# 2. Create skill directory
mkdir -p ~/.claude/skills/{crate}
mkdir -p ~/.claude/skills/{crate}/references

# 3. Create SKILL.md
# Use template from rust-skill-creator inline mode

# 4. Create reference files for key modules
agent-browser open "https://docs.rs/{crate}/latest/{crate}/{module}/"
agent-browser get text ".docblock"
# Save to ~/.claude/skills/{crate}/references/{module}.md

agent-browser close
```

**WebFetch 后备方案：**
```
WebFetch("https://docs.rs/{crate}/latest/{crate}/", "Extract API documentation overview, key types, and usage examples")
```

### 第 4 步：工作区支持

对于 Cargo 工作区项目：

```bash
# 1. Parse root Cargo.toml for workspace members
cat Cargo.toml | grep -A 10 '\[workspace\]'

# 2. For each member, parse their Cargo.toml
for member in members; do
  cat ${member}/Cargo.toml | grep -A 100 '\[dependencies\]'
done

# 3. Aggregate and deduplicate dependencies
# 4. Generate skills for missing crates
```

### 清理命令（内联）

```bash
# Clean specific crate
rm -rf ~/.claude/skills/{crate_name}

# Clean all generated skills
rm -rf ~/.claude/skills/*
```

### 更新命令（内联）

```bash
# Remove old skill
rm -rf ~/.claude/skills/{crate_name}

# Re-generate (same as sync for single crate)
# Follow Step 3 above for the specific crate
```

---

## 本地 Skills 目录

```
~/.claude/skills/
├── tokio/
│   ├── SKILL.md
│   └── references/
├── serde/
│   ├── SKILL.md
│   └── references/
└── axum/
    ├── SKILL.md
    └── references/
```

---

## 相关命令

- `/sync-crate-skills` - 主要同步命令
- `/clean-crate-skills` - 清理命令
- `/update-crate-skill` - 更新命令
- `/create-llms-for-skills` - 生成 llms.txt（仅限 Agent 模式）
- `/create-skills-via-llms` - 从 llms.txt 创建 Skills（仅限 Agent 模式）

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| 找不到命令 | 仅安装了 Skills | 使用内联模式 |
| 找不到 Cargo.toml | 不在 Rust 项目中 | 导航到项目根目录 |
| docs.rs 不可用 | 网络问题 | 重试或跳过该 crate |
| 权限被拒绝 | 目录问题 | 检查 ~/.claude/skills/ 的权限 |