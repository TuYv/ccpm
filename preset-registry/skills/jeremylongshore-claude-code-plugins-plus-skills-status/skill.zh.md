---
name: status
description: |
  Use when the user wants a one-screen view of current hyperflow project state — version, profile freshness, memory count, and live progress on every in-flight task. Read-only; never modifies state, never dispatches workers.
  Trigger with /hyperflow:status, "what is hyperflow doing", "show task progress", "where are we".
allowed-tools: Read, Bash(git:*), Bash(ls:*), Bash(stat:*), Bash(date:*), Bash(grep:*), Bash(sed:*), Bash(cut:*), Bash(head:*), Bash(awk:*), Glob, Grep
argument-hint: ""
version: 3.1.3
license: MIT
compatibility: Designed for Claude Code
tags: [introspection, read-only, project-state]
---
# 状态

当前 hyperflow 项目的只读快照，显示每个活动任务文件的实时进度。独立运行——不会自动串联，也不会被其他 skill 调用。通过 `/hyperflow:status` 手动调用。

该 skill 分为两个部分：

1. **静态快照** — 版本、配置文件新鲜度、记忆条目数量
2. **进行中的工作** — 每个任务的实时进度（子任务完成数/总数、令牌数、实际耗时、预计剩余时间）

## 读取内容

### 静态快照

| 字段 | 来源 | 回退值 |
|-------|--------|----------|
| 版本 | 匹配 `v*` 的最新 git 标签 + 标签提交日期 | `(missing)` |
| 配置文件 | `.hyperflow/profile.md` 文件修改时间 | `(missing)` |
| 记忆 | `.hyperflow/memory/index.md` 的行数减去标题行数 | `(none)` |
| 活动任务 | 匹配 `.hyperflow/tasks/*.md` 的文件 | `(none)` |
| 活动功能 | 匹配 `.hyperflow/features/*/feature.md` 的文件夹 | `(none)` |

### 活动功能（多阶段工作）

对于每个 `.hyperflow/features/*/feature.md`（参见 [feature-phases.md](../hyperflow/feature-phases.md)），解析其
`## Status` 块和阶段列表，然后针对每个 `phase-<n>-*/phase.md` 显示阶段状态和进度条：

```
── Feature: checkout-redesign ──  (2 / 3 phases)
  ✓ phase-1-data-layer   completed
  ▸ phase-2-api          in_progress  ████░░░░  2/5 tasks · running: T3-handlers
    phase-3-ui           pending      depends on phase-2
```

每个阶段的进度条使用与下面每个任务文件部分相同的解析方式（每个 `phase.md` 都包含形状相同的
`## Status` 块）。当不存在 `.hyperflow/features/*/` 时省略此部分。

### 进行中的工作（每个任务文件）

对于每个 `.hyperflow/tasks/*.md`，解析其 `## Status` 块（由 `/hyperflow:plan` 在创建时写入，并由 `/hyperflow:dispatch` 在每个子任务 PASS 后更新——参见 plan/SKILL.md 第 10 步）：

| 字段 | 来源 | 行为 |
|-------|--------|----------|
| Slug | 任务文件去掉 `.md` 后的 basename | 始终存在 |
| 完成数 / 总数 | Status 块中的 `Sub-tasks: <done> / <total>` | 如果 Status 缺失，则回退为统计 `[x]` 与 `[x]`+`[ ]` 复选框 |
| 已完成的子任务名称 | `## Batches` 部分中带 `[x]` 的行 | 列在进度条下方 |
| 正在运行的子任务 | 第一个 `[~]` 复选框（dispatch 在子任务执行期间将其标记为 `~`） | 如果没有则为 `(idle)` |
| 待处理子任务数 | `[ ]` 复选框数量 | 显示为 `N pending` |
| 已使用令牌数 | Status 块中的 `Tokens used:` 行 | 如果 Status 缺失则为 `(not tracked yet)` |
| 实际耗时 | Status 块中的 `Wall-clock:` 行 | 如果没有 `Started:` 则为 `(not started)` |
| 预计剩余时间 | Status 块中的 `ETA:` 行 | 如果完成的子任务少于 3 个则为 `(computing)` |

## 各字段的计算方式

### 版本

```bash
tag=$(git tag --sort=-v:refname | grep -E '^v[0-9]' | head -1)
released=$(git log -1 --format=%ci "$tag" 2>/dev/null | cut -d' ' -f1)
```

如果 `$tag` 为空 → 输出 `(missing)`。

### 配置文件新鲜度

```bash
profile=".hyperflow/profile.md"
now=$(date +%s)
mtime=$(stat -f %m "$profile" 2>/dev/null || stat -c %Y "$profile" 2>/dev/null)
hours=$(( (now - mtime) / 3600 ))
```

- 文件不存在 → `(missing)`
- `hours <= 24` → `fresh   (analyzed Xh ago)`
- `hours > 24` → `stale   (analyzed Xh ago)`

### Memory 条目数量

统计 `.hyperflow/memory/index.md` 中表格主体的行数（以 `|` 开头的行，减去表头和分隔行）：

```bash
count=$(grep -c '^|' .hyperflow/memory/index.md 2>/dev/null)
entries=$(( count - 2 ))
```

如果文件不存在或 count ≤ 0 → `(none)`。

### 活跃任务列表

```bash
tasks=$(ls .hyperflow/tasks/*.md 2>/dev/null)
```

如果没有文件 → 显示 `(none)`，并完全跳过 In-flight 部分。

### 每个任务的 Status 解析

对于每个 `.hyperflow/tasks/<slug>.md`：

```bash
# Extract Status block fields
sub_done=$(grep '^Sub-tasks:' "$file" | sed -E 's|.*: *([0-9]+) */ *([0-9]+).*|\1|')
sub_total=$(grep '^Sub-tasks:' "$file" | sed -E 's|.*: *([0-9]+) */ *([0-9]+).*|\2|')
tokens=$(grep '^Tokens used:' "$file" | sed 's|^Tokens used: *||')
wall=$(grep '^Wall-clock:' "$file" | sed 's|^Wall-clock: *||')
eta=$(grep '^ETA:' "$file" | sed 's|^ETA: *||')
started=$(grep '^Started:' "$file" | sed 's|^Started: *||')
```

如果缺少 Status 块或其格式错误（此格式引入前的旧式任务文件），则回退到直接统计复选框：

```bash
done=$(grep -c '^- \[x\]' "$file" 2>/dev/null)
running=$(grep -c '^- \[~\]' "$file" 2>/dev/null)
pending=$(grep -c '^- \[ \]' "$file" 2>/dev/null)
total=$(( done + running + pending ))
```

### 已完成子任务名称（用于缩进列表）

```bash
grep '^- \[x\]' "$file" | sed -E 's|^- \[x\] *||' | head -5
```

最多显示**最后 3 个已完成任务** + **当前正在运行的子任务**。如果已完成任务超过 3 个，在列表前加上 `… (N earlier done)`。

### 正在运行的子任务

dispatch skill 会在 worker 运行时，将进行中的子任务标记为 `[~]`。PASS + commit 后，dispatch 会将 `[~]` → `[x]`。

```bash
running=$(grep '^- \[~\]' "$file" | sed -E 's|^- \[~\] *||' | head -1)
```

如果不存在 `[~]` 行 → dispatch 要么正处于子任务之间（空闲数毫秒），要么已将控制权交回。根据 `Last update:` 时间戳显示 `(idle — last update Xm Ys ago)`。

### 进度条

基于 `done / total` 的 20 字符 ASCII 进度条：

```
[████████████░░░░░░░░] 12/20  60%
```

使用 `█`（已完成）和 `░`（未完成）。不要使用 emoji 或彩色图标。

## 输出格式

逐字打印下面的块。如果没有进行中的任务，则省略 `── In-flight work ──` 部分。

```
── Hyperflow Status ─────────────────────────────────────────
Version       v3.0.0     (released 2026-05-16)
Profile       fresh      (analyzed 2h ago)
Memory        12 entries
Active tasks  2

── In-flight work ───────────────────────────────────────────
Task:         implement-auth
  Progress    [███████████░░░░░░░░░] 8/14  57%
  Last done   T7: Reset email worker
  Running     T8: Login UI (Implementer · 14s elapsed)
  Pending     6 sub-tasks
  Tokens      thinking 89.2k · worker 142.0k · total 231.2k
  Wall-clock  4m 22s elapsed
  ETA         ~3m 16s remaining   (avg 32s/sub-task · 6 left)

Task:         fix-login-bug
  Progress    [░░░░░░░░░░░░░░░░░░░░] 0/3   0%
  Status      not started (created 8m ago, no dispatch run yet)
─────────────────────────────────────────────────────────────
```

当 Profile 为 `(missing)` 时，省略 `(analyzed Xh ago)` 括号内容。

当 Version 为 `(missing)` 时，输出 `Version       (missing)`。

当不存在 `.hyperflow/tasks/*.md` 文件时，完全省略 `── In-flight work ──` 部分；仅保留快照块。

## ETA 计算

```
elapsed_seconds       = now - started_unix
avg_per_subtask       = elapsed_seconds / done
remaining_seconds     = avg_per_subtask * pending
```

格式化为 `Xm Ys` 或 `Hh Mm`（跳过值为零的前导单位）。当 `done < 3` 时显示 `(computing)`，因为数据点过少，无法得出有用的平均值。

如果任务具有多个批次，且根据规划器输出，下一个批次为 `sequential`，则将剩余时间乘以 `1.1`，以计入批次间的同步开销。

## 失败模式

每个部分都应优雅降级：

- 缺少 git 标签 → `Version  (missing)`
- 缺少 `.hyperflow/profile.md` → `Profile  (missing)`
- 缺少 `.hyperflow/memory/index.md` → `Memory  (none)`
- 没有 `.hyperflow/tasks/*.md` 文件 → `Active tasks  (none)`，不显示 In-flight 部分
- 存在任务文件但 Status 块格式错误或缺失 → 回退为复选框计数，tokens/ETA 显示 `(not tracked yet)`
- 缺少 `Started:` 行 → `Status  not started`，跳过 ETA

绝不能报错。绝不能修改任何文件。绝不能分派 agent。

## 准则

此 skill 不进行 Worker/Reviewer 分派，它是纯读取操作。它不计入一次 hyperflow run，也不会追加到 memory。输出风格遵循 [output-style.md](references/output-style.md)，不使用装饰性图标、破折号分隔符，使用纯文本状态词。

## 概述

`/hyperflow:status` 输出项目 hyperflow 状态的一屏快照，以及每个进行中任务的实时进度块。当在任务中途恢复会话、决定是否调用 `/hyperflow:dispatch`，或审计链式运行是否仍然健康时，此命令非常有用。纯读取操作，不使用 agents、不写入、不产生链式副作用。

## 前提条件

- Git 仓库（用于版本行，否则降级为 `(missing)`）。
- `.hyperflow/` 目录（用于 profile/memory/tasks 行，若缺失，各部分分别降级为 `(missing)` 或 `(none)`）。
- 调用本身没有前提条件，可在任何位置运行。

## 指令

完整操作规范请参阅上方的 [What to read](#what-to-read) 和 [How to compute each field](#how-to-compute-each-field)。摘要：

1. 从匹配 `v*` 的最新 git 标签读取版本。
2. 检查 `.hyperflow/profile.md` 的新鲜度；归类为 fresh/stale/missing。
3. 统计 `.hyperflow/memory/index.md` 中的条目。
4. Glob `.hyperflow/tasks/*.md` 并解析每个 Status 块以获取实时进度。
5. 渲染静态快照块；按任务渲染 In-flight 块（如有）。
6. 停止。不提示，不跟进。

## 输出

精确的输出块请参阅上方的 [Output format](#output-format)。包含两个部分：静态快照，以及（如果存在活动任务）包含每个任务进度条、最后完成的子任务、当前运行的子任务、待处理数量、tokens、墙钟时间和 ETA 的 In-flight work。

## 错误处理

| 失败情况 | 行为 |
|---|---|
| 不是 git 仓库 | `Version  (missing)`；如果 `.hyperflow/` 存在，其他内容仍然照常渲染。 |
| 缺少 `.hyperflow/profile.md` | `Profile  (missing)`（无括号补充信息）。 |
| 缺少 `.hyperflow/memory/index.md` | `Memory  (none)`。 |
| 没有任务文件 | 完全省略 In-flight 部分；只打印快照。 |
| 任务文件中的 Status 块格式错误 | 回退到统计 `[x]` 与 `[ ]` 复选框；tokens/ETA 显示 `(not tracked yet)`。 |
| BSD（macOS）与 GNU（Linux）之间的 `stat` 标志不同 | 先尝试 `stat -f %m`，然后回退到 `stat -c %Y`。 |

绝不会报错。绝不会修改任何文件。绝不会调度代理。

## 示例

### 健康项目，没有活动任务

```
── Hyperflow Status ─────────────────────────────────────────
Version       v3.1.2     (released 2026-05-16)
Profile       fresh      (analyzed 2h ago)
Memory        12 entries
Active tasks  (none)
─────────────────────────────────────────────────────────────
```

### 正在调度中，有两个活动任务

```
── Hyperflow Status ─────────────────────────────────────────
Version       v3.1.2     (released 2026-05-16)
Profile       fresh      (analyzed 2h ago)
Memory        12 entries
Active tasks  2

── In-flight work ───────────────────────────────────────────
Task:         implement-auth
  Progress    [███████████░░░░░░░░░] 8/14  57%
  Last done   T7: Reset email worker
  Running     T8: Login UI (Implementer · 14s elapsed)
  Pending     6 sub-tasks
  Tokens      thinking 89.2k · worker 142.0k · total 231.2k
  Wall-clock  4m 22s elapsed
  ETA         ~3m 16s remaining   (avg 32s/sub-task · 6 left)

Task:         fix-login-bug
  Progress    [░░░░░░░░░░░░░░░░░░░░] 0/3   0%
  Status      not started (created 8m ago, no dispatch run yet)
─────────────────────────────────────────────────────────────
```

### 全新安装（尚无 `.hyperflow/`）

```
── Hyperflow Status ─────────────────────────────────────────
Version       v3.1.2     (released 2026-05-16)
Profile       (missing)
Memory        (none)
Active tasks  (none)
─────────────────────────────────────────────────────────────
```

## 资源

- [output-style.md](references/output-style.md) — em-dash 样式、无装饰字符、使用普通状态词。
- [DOCTRINE.md](../hyperflow/DOCTRINE.md) — 编排规则（status 不受逐步代理调度限制）。