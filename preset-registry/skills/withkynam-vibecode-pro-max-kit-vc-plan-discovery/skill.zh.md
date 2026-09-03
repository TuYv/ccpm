---
name: vc-plan-discovery
description: "Discover related plans for the current task: same feature folder full depth, other features active-only, general-plans active. Like vc-context-discovery but for plan artifacts."
argument-hint: "[feature folder name or task description]"
trigger_keywords: related plans, what was tried, plan history, feature backlog, plan discovery
layer: contract
metadata:
  author: vibecode-pro-max-kit
  version: "1.1.0"
---
# vc-plan-discovery

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md` —— 答案先行、语言平实、不使用未加解释的行话，较长的回复附带 TL;DR。

## 调用方式

**主要方法** —— 运行自动发现脚本。它会应用下方的范围规则（同功能全深度；其他功能仅 active；general-plans 始终 active），并且只提取每个 `.md` 文件开头的 YAML frontmatter 块（不读取整个文件）：

```bash
node .claude/skills/vc-plan-discovery/scripts/discover-plans.mjs [--feature <name>] [--json]
```

它将输出分组为 Active Plans / Backlog / Completed / Reports / References（每行格式：`- [name]: description (path)`），并在末尾打印一行 `Found N active, N backlog, N completed, N reports, N references`。它在根目录缺失时不会抛出异常，除非传入了错误的标志，否则以退出码 0 结束。使用 `--json` 可获得机器可读的对象。优先使用此方法而非下文的手动扫描——它是确定性的，且能避免将庞大的文件加载到上下文中。

按照**任务文件夹工件同址存放**（task-folder artefact colocation），该脚本会向每个 `{slug}_{date}/` 任务文件夹内部扫描一层，并列出同址存放的 `_PLAN_`/`_REPORT_`/`_REF_` 工件；同级的 `reports/`/`references/` 目录已弃用，仅存放旧有工件。

下方**范围规则**中的手动扫描是脚本失败时的后备方案。

## 目的

在做任何阶段工作之前，呈现与当前任务相关的所有计划，让智能体拥有完整的计划上下文——尝试过什么、正在进行什么、被推迟了什么，以及存在哪些报告和参考。

## 范围规则

- **同一功能文件夹**（来自任务上下文或参数）：读取 `active/`、`backlog/`、`completed/` 的全部内容，外加任何旧有的同级 `reports/`、`references/` —— 呈现每个带 frontmatter 的文件
- **其他功能文件夹**：仅读取 `active/` —— 呈现 frontmatter 的 `description` 或 `feature` 字段与任务领域匹配的计划
- **`general-plans/active/`**：始终扫描
- **`general-plans/completed/`、旧有的 `reports/`、`references/`**：仅在未识别出同一功能文件夹时扫描

按照**任务文件夹工件同址存放**，每个当前的工件（计划、规格、报告、参考）都应位于其对应的 `{slug}_{date}/` 任务文件夹之内 —— 向每个任务文件夹内部扫描一层。同级的 `reports/`/`references/` 目录已弃用，仅存放旧有工件。

## Frontmatter 读取

读取 frontmatter 字段：`name`、`description`、`type`、`feature`、`phase`

依据 `description` 字段进行相关性匹配与路由（与 vc-context-discovery 的做法相同）。

跳过没有 frontmatter 或 frontmatter 不完整的文件 —— 记录为“无 frontmatter，已跳过”。

输出：按文件夹分组的列表 —— Active Plans / Backlog / Completed / Reports / References —— 每个文件附带名称与描述。

## 何时调用

- 在每个循环步骤（research / validate / execute / update-process）开始时，与 `vc-context-discovery` 一起作为首个动作
- 智能体在任何需要了解以下内容的时刻：该功能存在哪些计划、此前尝试过什么、什么被推迟了、存在哪些参考

## 输出格式

```
### Active Plans
- [name]: description (path)

### Backlog
- [name]: description (path)

### Completed
- [name]: description (path)

### Reports
- [name]: description (path)

### References
- [name]: description (path)

Found N active, N backlog, N completed, N reports, N references
```
