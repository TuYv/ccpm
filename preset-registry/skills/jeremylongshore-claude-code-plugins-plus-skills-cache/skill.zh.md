---
name: cache
description: |
  Use when the user wants to view, search, add, edit, prune, archive, or clear hyperflow memory entries. CRUD interface for `.hyperflow/memory/` — never modifies source code, only memory files.
  Trigger with /hyperflow:cache, "show memory", "search memory for X", "clear memory", "what does hyperflow remember about Y".
allowed-tools: Read, Write, Edit, Bash(ls:*), Bash(mv:*), Bash(rm:*), Glob, Grep, Agent, AskUserQuestion
argument-hint: "<show|search|add|edit|prune|archive|clear|stats|migrate|off|compact> [args]"
version: 3.1.3
license: MIT
compatibility: Designed for Claude Code
tags: [memory, persistence, project-state]
---
# 缓存

`.hyperflow/memory/` 的 CRUD 接口。完整协议：[memory-system.md](references/memory-system.md)。

## 存储

所有操作均针对项目根目录下的 `.hyperflow/memory/`。绝不修改源代码文件——如果被要求“记住关于文件 Y 的 X”，只能添加一条记忆条目，绝不编辑 Y。

## 子命令

| 子命令 | 描述 |
|---|---|
| `show [tag]` | 打印索引，或按标签筛选条目 |
| `search <query>` | 跨所有记忆文件进行全文搜索 |
| `add <category> <title>` | 追加新条目（提示输入详细信息） |
| `edit <entry-id>` | 通过日期+标题 slug 查找条目并原地更新 |
| `prune` | 移除过时、已被替代和孤立的条目 |
| `archive` | 将超过 30 天的条目移至冷存储 |
| `clear` | 清除所有记忆（需确认，可恢复） |
| `stats` | 统计数量、层级分布、标签频率、最早/最新条目 |
| `migrate` | 从旧版 `~/.claude/hyperflow-memory.md` 导入条目 |
| `off` | 禁用本次会话的记忆写入 |
| `compact` | 将老化的记忆条目汇总为存根，并生成按月归档的 sidecar 文件 |

## 子命令详情

### `show [tag]`
无参数 → 打印 `index.md`。指定标签 → 在所有文件中筛选匹配的条目。  
输出表格：`Date | Title | Tags | File | Tier`

### `search <query>`
在 `learnings.md`、`decisions.md`、`pitfalls.md`、`patterns.md`、`conventions.md` 中使用 grep/ripgrep 进行搜索。  
返回 `file:line` + 摘要片段，并按相关性排序。

### `add <category> <title>`
类别：`learning` `decision` `pitfall` `pattern` `convention`  
通过 AskUserQuestion 提示输入：`what`、`why it matters`、`tags`（受控词汇表）。  
使用以下格式追加到对应文件：
```
### [YYYY-MM-DD] <title>  `[tag1, tag2]`
**What:** ...
**Why it matters:** ...
**Evidence:** ...
```
这就是完整的写入内容。`index.md` 是派生文件——`scripts/memory-index.py` 会在下一次会话开始时重建它。绝不要手动追加索引行；如需立即刷新，请运行 `python3 scripts/memory-index.py .hyperflow`。

### `edit <entry-id>`
按日期+标题 slug 定位条目。显示当前值，提示输入新值，然后原地更新。

### `prune`
根据 [memory-system.md](references/memory-system.md) 中的清理协议：
- 移除超过 7 天的 `[SUPERSEDED]` 条目
- 移除其引用文件已不存在的条目（`test -f`）
- 将超过 90 天未被引用的条目归档到 `.hyperflow/memory/archive/YYYY-MM.md`
打印移除/归档数量的摘要。

### `archive`
将超过 30 天的热条目压缩到 `.hyperflow/memory/archive/YYYY-MM.md`。  
在原文件中保留一行摘要。存根保留其日期，因此派生索引会自动将其重新分层为 `cold`。

### `clear`
通过 AskUserQuestion 确认：“This wipes all memory for this project. Are you sure?”  
如果确认 → 将所有内容移至 `.hyperflow/memory/archive/cleared-<timestamp>.md`，然后将文件重置为空存根。

### `stats`
打印：条目总数、hot/warm/cold 数量、标签频率表、最早和最新条目的日期。

### `migrate`
读取 `~/.claude/hyperflow-memory.md`，筛选与当前项目路径匹配的条目。  
将匹配的条目追加到 `learnings.md`。保留旧版文件不变。  
打印迁移条目的数量。

### `off`
打印：“本次会话已禁用记忆写入。”不修改任何文件。

### `compact`
由用户调用的记忆压缩。将超过 7 天的条目总结为存根行，并将完整文本保存在每月归档 sidecar 中：`.hyperflow/memory/archive/YYYY-MM.md`。

流程：
1. compact 子命令处理器读取目标记忆文件（默认为 `learnings.md`；传入路径可指定其他目标）。
2. 日期/标签解析器将条目拆分为 hot（≤7 天，保留）和符合条件（>7 天）的条目。`[domain, type]` 和旧版反引号包裹的 `` `[domain, type]` `` 标签形式均可接受。
3. Compaction Writer 将所有符合条件的条目一次性批量分派。
4. Stub formatter 将每个替换行渲染为 `### [YYYY-MM-DD] Short title  [domain, type] — summarized, see archive/YYYY-MM.md`。
5. Dedup Reviewer 执行源文件端存根行匹配和归档端标题匹配（两端均匹配日期 + 标题 + 标签），以防止重复。
6. Archive-sidecar writer 将接受的条目追加到 `archive/YYYY-MM.md`，并按每个条目的日历月份分组。
7. 重写源文件，用存根替换原始条目。
8. compact 子命令处理器刷新 `.hyperflow/memory/.checksums`（记忆范围内的 sidecar — 不同于由脚手架陈旧性检查负责的 `.hyperflow/.checksums`），并输出摘要后退出。

输出：`N entries compacted into archive/YYYY-MM.md · M stubs rejected as duplicates · source N→M lines`。完整协议见 [compaction.md](references/compaction.md)。

## 流程

1. 解析调用以确定子命令
2. 如果缺少子命令 → 列出上方的子命令表及每个子命令的一行描述
3. 执行子命令
4. 输出包含计数/变更摘要的结构化结果

## 概述

`/hyperflow:cache` 是面向 `.hyperflow/memory/` 下项目范围记忆的操作员接口。它是唯一会直接修改记忆文件的 skill（其他 skill 通过记忆系统协议追加内容）。子命令涵盖完整生命周期：显示、搜索、添加、编辑、清理、归档、清空、统计、迁移。所有操作均限定在项目本地 — 条目不会泄漏到其他项目。

## 前置条件

- `.hyperflow/` 已初始化（如果缺失，运行 `/hyperflow:scaffold` — cache 会在首次写入时创建 `.hyperflow/memory/`，但要求父目录已存在）。
- 对 `.hyperflow/memory/` 和 `.hyperflow/memory/archive/` 具有写入权限。
- 仅适用于 `migrate`：对 `~/.claude/hyperflow-memory.md`（旧版全局记忆）具有读取权限。

## 说明

完整操作规范请参见上方的 [Subcommands](#subcommands) 和 [Subcommand Details](#subcommand-details)。摘要：

1. 从用户的调用中解析子命令（如果未提供，则列出子命令）。
2. 为选定的子命令验证前置条件（例如，`clear` 需要 `AskUserQuestion` 确认；`migrate` 需要存在旧版文件）。
3. 针对 `.hyperflow/memory/` 执行子命令。
4. 输出包含计数以及任何文件级变更的结构化结果。

## 输出

每个子命令都会输出简洁摘要：

- `show` — 匹配条目表（日期 | 标题 | 标签 | 文件 | 层级）。
- `search` — 带摘要的 `file:line` 匹配结果，按相关性排序。
- `add` / `edit` — 包含新条目 id 和目标文件的确认行。
- `prune` / `archive` / `clear` — 已移除/归档/清除的条目数量及目标路径。
- `stats` — 总数 + hot/warm/cold 分类 + 前 N 个标签。
- `migrate` — 已迁移条目数量 + 源 legacy 文件路径。
- `off` — 单行 `Memory writes disabled for this session.`

## 错误处理

| 失败情况 | 行为 |
|---|---|
| `.hyperflow/memory/` 缺失 | 首次写入时自动创建骨架（index.md + 5 个类别文件 + archive/.gitkeep）；对于只读子命令，打印 `(no memory yet — invoke /hyperflow:scaffold first)`。 |
| 子命令未知 | 打印子命令表；通过 Levenshtein 距离建议最接近的匹配项。 |
| `add` 使用无效类别 | 拒绝并列出有效类别：learning, decision, pitfall, pattern, convention。 |
| `edit` 找不到条目 id | 按标题 slug + 日期列出 3 个最接近的匹配项。 |
| headless 模式下执行 `clear` 时未确认 | 拒绝并打印 `clear requires interactive confirmation`。不要清除数据。 |
| `migrate` 源文件缺失 | 打印 `(nothing to migrate — ~/.claude/hyperflow-memory.md not found)` 并停止。 |

## 示例

### 显示所有条目

```
/hyperflow:cache show

Date         Title                              Tags                  File              Tier
2026-05-16   Bash scoping required by validator [validator, marketplace] learnings.md   hot
2026-05-15   No AI attribution in commits       [convention, git]     conventions.md    hot
2026-05-14   Per-task commits in plugin dev     [convention, git]     conventions.md    hot
3 entries (3 hot, 0 warm, 0 cold)
```

### 搜索

```
/hyperflow:cache search "validator"

.hyperflow/memory/learnings.md:42 — "Jeremy's validator requires scoped Bash..."
.hyperflow/memory/decisions.md:8 — "...validator score of 73 → 94 after fix"
2 matches
```

### 添加一条学习记录

```
/hyperflow:cache add learning "Markdown frontmatter needs block scalar for colons"

? What: Block scalar (|) preserves : and backticks in YAML values
? Why it matters: prevents fatal YAML parse failures in marketplace validators
? Tags: yaml, validator, frontmatter
Added — .hyperflow/memory/learnings.md (entry 2026-05-16-block-scalar-frontmatter)
```

### 统计信息

```
/hyperflow:cache stats

Memory entries: 47
  Hot   (≤7d)   12
  Warm  (8-30d) 23
  Cold  (30d+)  12
Top tags: validator (8), convention (7), git (6), yaml (4)
Oldest: 2026-02-14   Newest: 2026-05-16
```

## 资源

- [memory-system.md](references/memory-system.md) — 完整协议：文件、层级、标签、清理规则。
- [compaction.md](references/compaction.md) — `/hyperflow:cache compact` 协议：存根格式、归档旁置文件、幂等性。
- [output-style.md](references/output-style.md) — 标签和表格约定。
- [DOCTRINE.md](../hyperflow/DOCTRINE.md) — 编排规则。