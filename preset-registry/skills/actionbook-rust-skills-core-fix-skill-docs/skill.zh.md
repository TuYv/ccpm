---
name: core-fix-skill-docs
description: "Internal maintenance support for checking and fixing generated Rust skill documentation references. Use only when explicitly invoked by /fix-skill-docs."
disable-model-invocation: true
argument-hint: "[crate_name] [--check-only]"
context: fork
agent: general-purpose
---
# 修复 Skill 文档

> **版本：** 2.1.0 | **最后更新：** 2025-01-27

检查并修复动态 Skill 中缺失的参考文件。

## 用法

```
/fix-skill-docs [crate_name] [--check-only] [--remove-invalid]
```

**参数：**
- `crate_name`：要检查的特定 crate（可选，默认为全部）
- `--check-only`：仅报告问题，不进行修复
- `--remove-invalid`：移除无效引用，而不是创建文件

## 执行模式检测

**关键：检查 Agent 基础设施是否可用。**

此 Skill 可以在两种模式下运行：
- **Agent 模式**：使用后台 Agent 获取文档
- **内联模式**：使用 agent-browser CLI 或 WebFetch 直接执行

---

## Agent 模式（插件安装）

**当 Agent 基础设施可用时，使用后台 Agent 获取文档：**

### 说明

#### 1. 扫描 Skills 目录

```bash
# If crate_name provided
skill_dir=~/.claude/skills/{crate_name}

# Otherwise scan all
for dir in ~/.claude/skills/*/; do
    # Process each skill
done
```

#### 2. 解析 SKILL.md 中的引用

从 Documentation 部分提取引用的文件：

```markdown
## Documentation
- `./references/file1.md` - Description
```

#### 3. 检查文件是否存在

```bash
if [ ! -f "{skill_dir}/references/{filename}" ]; then
    echo "MISSING: {filename}"
fi
```

#### 4. 报告状态

```
=== {crate_name} ===
SKILL.md: OK
references/:
  - sync.md: OK
  - runtime.md: MISSING

Action needed: 1 file missing
```

#### 5. 修复缺失文件（Agent 模式）

启动后台 Agent 获取文档：

```
Task(
  subagent_type: "general-purpose",
  run_in_background: true,
  prompt: "Fetch documentation for {crate_name}/{module} from docs.rs.
           Use agent-browser CLI to navigate to https://docs.rs/{crate_name}/latest/{crate_name}/{module}/
           Extract the main documentation and save to ~/.claude/skills/{crate_name}/references/{module}.md"
)
```

---

## 内联模式（仅安装 Skills）

**当 Agent 基础设施不可用时，直接执行：**

### 第 1 步：扫描 Skills 目录

```bash
# List all skills
ls ~/.claude/skills/

# Or check specific skill
ls ~/.claude/skills/{crate_name}/
```

### 第 2 步：解析 SKILL.md 中的引用

读取 SKILL.md 并提取所有 `./references/*.md` 模式：

```bash
# Using Read tool
Read("~/.claude/skills/{crate_name}/SKILL.md")

# Look for lines like:
# - `./references/sync.md` - Sync primitives
# - `./references/runtime.md` - Runtime configuration
```

### 第 3 步：检查文件是否存在

```bash
# Check each referenced file
for ref in references; do
  if [ ! -f "~/.claude/skills/{crate_name}/references/${ref}.md" ]; then
    echo "MISSING: ${ref}.md"
  fi
done
```

### 第 4 步：报告状态

输出格式：
```
=== {crate_name} ===
SKILL.md: OK
references/:
  - sync.md: OK
  - runtime.md: MISSING

Action needed: 1 file missing
```

### 第 5 步：修复缺失文件（内联模式）

对于每个缺失的文件：

**使用 agent-browser CLI：**
```bash
agent-browser open "https://docs.rs/{crate_name}/latest/{crate_name}/{module}/"
agent-browser get text ".docblock"
# Save output to ~/.claude/skills/{crate_name}/references/{module}.md
agent-browser close
```

**使用 WebFetch 作为备用方案：**
```
WebFetch("https://docs.rs/{crate_name}/latest/{crate_name}/{module}/",
         "Extract the main documentation content for this module")
```

然后写入内容：
```bash
Write("~/.claude/skills/{crate_name}/references/{module}.md", <fetched_content>)
```

### 步骤 6：更新 SKILL.md（如果使用 --remove-invalid）

如果设置了 `--remove-invalid` 标志且无法获取文件：

```bash
# Read current SKILL.md
Read("~/.claude/skills/{crate_name}/SKILL.md")

# Remove the invalid reference line
Edit("~/.claude/skills/{crate_name}/SKILL.md",
     old_string="- `./references/{invalid_file}.md` - Description",
     new_string="")
```

---

## 工具优先级

1. **agent-browser CLI** - 获取文档的首选工具
2. **WebFetch** - agent-browser 不可用时的备用方案
3. **编辑 SKILL.md** - 用于删除无效引用（仅限 --remove-invalid）

---

## 示例

### 检查所有 Skill（--check-only）

```bash
/fix-skill-docs --check-only

# Output:
=== tokio ===
SKILL.md: OK
references/:
  - sync.md: OK
  - runtime.md: MISSING
  - task.md: OK

=== serde ===
SKILL.md: OK
references/:
  - derive.md: OK

Summary: 1 file missing in 1 skill
```

### 修复指定 Crate

```bash
/fix-skill-docs tokio

# Fetches missing runtime.md from docs.rs
# Reports success
```

### 删除无效引用

```bash
/fix-skill-docs tokio --remove-invalid

# If runtime.md cannot be fetched:
# Removes reference from SKILL.md instead
```

---

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| Agent 不可用 | 仅安装了 Skill | 使用内联模式 |
| Skills 目录为空 | 未安装任何 Skill | 先运行 /sync-crate-skills |
| docs.rs 不可用 | 网络问题 | 重试或使用 --remove-invalid |
| 权限被拒绝 | 目录问题 | 检查 ~/.claude/skills/ 权限 |
| SKILL.md 格式无效 | Skill 已损坏 | 重新生成 Skill |