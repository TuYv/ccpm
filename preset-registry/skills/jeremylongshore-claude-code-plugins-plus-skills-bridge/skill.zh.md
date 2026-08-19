---
name: bridge
description: |
  Use when the user wants hyperflow's behavioral rules to apply outside the terminal CLI — in Claude Code Desktop, claude.ai web, or IDE extensions that don't load CLI plugins. Writes a managed doctrine block into the project's CLAUDE.md so autonomy + intent-routing + commit cadence + role separation + file-first rules carry over. Lossy (no slash commands, no actual skill dispatch) but useful.
  Trigger with /hyperflow:bridge, "make hyperflow work in desktop", "make hyperflow work in claude.ai", "embed hyperflow doctrine in CLAUDE.md", "portable hyperflow rules".
allowed-tools: Read, Write, Edit, Bash(cat:*), Bash(ls:*), Bash(date:*)
argument-hint: "<generate|refresh|remove|status>"
version: 4.10.1
license: MIT
compatibility: Designed for Claude Code · Output works in any surface that loads CLAUDE.md
tags: [portability, desktop, web, claude-md, bridge]
---
# Bridge

将 hyperflow doctrine 的可移植子集嵌入项目的 `CLAUDE.md`，使其应用于不会加载 CLI 插件的界面（Claude Code Desktop、claude.ai web、IDE 扩展）。doctrine 区块通过围栏标记进行管理，因此在插件更新时刷新它是幂等的，并且永远不会触碰你自己的 `CLAUDE.md` 内容。

源模板：[`templates/claude-md-doctrine.md`](../../templates/claude-md-doctrine.md)。Doctrine 背景：[DOCTRINE.md](../hyperflow/DOCTRINE.md)。

## 子命令

| 子命令 | 描述 |
|---|---|
| `generate` | 将 doctrine 区块写入项目的 `CLAUDE.md`（文件不存在时创建，不存在区块时追加，已存在时刷新） |
| `refresh` | 与 `generate` 相同——当区块已存在时用于明确表达刷新意图的别名 |
| `remove` | 从 `CLAUDE.md` 中移除 doctrine 区块（保留你自己的内容；如果移除后文件为空，则保留为空文件而不是删除文件） |
| `status` | 显示 doctrine 区块是否存在、其版本以及生成时间 |
| `mode <auto\|manual\|off>` | 设置此项目的自动桥接模式。写入 `.hyperflow/.bridge-mode`。session-start hook 会读取该文件并决定执行什么操作 |

未提供子命令时的默认子命令：`status`。

## 自动桥接（默认开启）

CLI session-start hook（`hooks/session-start`）会在每次会话启动时运行 `scripts/auto-bridge.py`。其行为取决于存储在 `.hyperflow/.bridge-mode` 中的模式：

| 模式 | 行为 |
|---|---|
| `auto`（`.bridge-mode` 不存在时的**默认模式**） | 如果 `./CLAUDE.md` 缺少 doctrine 区块**或**版本过旧，则**静默写入/刷新**该区块，并在 session-start 输出中打印一行通知。用户无需进行任何操作。 |
| `manual` | 从不写入。当区块缺失或版本过旧时，打印一行提示：`./CLAUDE.md doctrine block would be refreshed (version 4.11.0) — run /hyperflow:bridge refresh to apply`。 |
| `off` | 不执行任何操作。不写入，不提示。 |

这意味着：只需在项目中打开一次 Claude Code CLI，此后同一项目中的每个 Desktop / web / IDE 会话都会通过 `CLAUDE.md` 自动获得最新的 hyperflow doctrine。插件更新时也会自动刷新。

如需选择退出：`/hyperflow:bridge mode off`。如需要求显式刷新：`/hyperflow:bridge mode manual`。

## 写入内容

项目的 `./CLAUDE.md` 中会写入一个围栏区块（位于仓库根目录，Claude Code Desktop / web / CLI 都会在此查找该文件）：

```markdown
<!-- hyperflow:doctrine:start version=<X.Y.Z> generated=<ISO-8601> source=https://github.com/Mohammed-Abdelhady/hyperflow -->

# Hyperflow Doctrine (Portable Subset)

<the full template body — autonomy, intent-routing, commit cadence,
 role separation, file-first artefacts, no AI attribution, security
 blocklists, what's missing vs CLI>

<!-- hyperflow:doctrine:end -->
```

围栏标记（`hyperflow:doctrine:start` / `hyperflow:doctrine:end`）让 `refresh` 能够查找并仅替换 doctrine 区块，同时保持 `CLAUDE.md` 中的其他所有内容不变。可以将该区块放在 `CLAUDE.md` 中的任意位置；bridge 会保留其位置。

## 何时使用

| 情况 | 使用 bridge？ |
|---|---|
| 你仅在 Claude Code CLI（终端）中工作 | 否 — 插件会直接加载 doctrine；bridge 会造成重复 |
| 你在 Mac / Windows 上使用 Claude Code Desktop | **是** — bridge 为 Desktop 提供自主性 + 意图路由 + 提交节奏规则 |
| 你为此项目使用 claude.ai 网页应用 | **是** — 原因相同 |
| 你使用 VS Code / Cursor / JetBrains，且扩展会调用 `claude` CLI | 否 — CLI 插件会生效 |
| 你使用 VS Code / Cursor，且扩展直接与 API 通信 | **是** — API 会话会加载 `CLAUDE.md` |
| 你与使用不同终端的队友协作 | **是** — 提交生成的 `CLAUDE.md`，确保每个人无论使用何种终端都遵循相同规则 |

## 与完整 CLI 插件相比，保留 / 缺失的内容

| 能力 | CLI 插件 | CLAUDE.md bridge |
|---|---|---|
| 自主性规则（无需确认、最少输出、避免模棱两可） | 是 | **是** |
| 基于意图的路由（audit/debug/fix/brainstorm 动词） | 是 | **是（在 CLAUDE.md 中描述为编排器应遵循的规则）** |
| 每项任务的提交节奏 | 是 | **是** |
| 角色分离（worker 执行，reviewer 审查） | 是 | **是** |
| `.hyperflow/` 下的文件优先产物 | 是 | **是** |
| 二元门控规则（对是/否问题不给出建议） | 是 | **是** |
| 禁止 AI 归因规则 | 是 | **是** |
| 安全黑名单 | 是 | **是** |
| `/hyperflow:*` 斜杠命令 | 是 | 否 — 没有插件的终端无法分发具名 skill |
| 链式模式 Step-0 自动/手动问题 | 是 | 否 — 在 CLAUDE.md 模式下默认使用自动式链条 |
| 操作预选择（范围 Step 2.6 中的提交/分支/push） | 是 | 否 — 根据 CLAUDE.md 指引应用默认设置 |
| 来自 `worker-prompt.md` / `reviewer-prompt.md` 的每步 Worker → Reviewer 分发模板 | 是 | 部分 — 角色分离规则保留其精神；未嵌入精确提示词（否则会使 CLAUDE.md 过于臃肿） |
| 后台 agent、sticky 模式、status skill、cache skill | 是 | 否 — 这些需要各自的斜杠命令终端 |
| 自适应流程配置（`fast` / `standard` / `deep`） | 是 | 否 — 编排器根据消息复杂度推断 |

净覆盖：约为 hyperflow 行为价值的 70%。缺失的 30% 是斜杠命令及其封装基础设施。

## 子命令详情

### `generate` / `refresh`

1. 读取位于 `~/.claude/plugins/cache/hyperflow-marketplace/hyperflow/<version>/templates/claude-md-doctrine.md` 的模板（从活动插件安装中解析当前版本）。
2. 替换占位符：`__HYPERFLOW_VERSION__` → 当前插件版本，`__GENERATED_AT__` → 当前 UTC 时间戳（ISO-8601）。
3. 读取项目的 `./CLAUDE.md`。分为三种情况：
   - **文件不存在** — 使用仅包含 doctrine block 的内容创建 `./CLAUDE.md`。
   - **文件存在，但没有现有 doctrine block** — 将 doctrine block 追加到文件末尾（若文件尚未以空行结尾，则在前面加一个空行）。
   - **文件存在，且 doctrine block 已存在** — 查找 `<!-- hyperflow:doctrine:start … -->` 和 `<!-- hyperflow:doctrine:end -->` 标记，用新的 block 替换它们之间的全部内容（包括标记本身）。`CLAUDE.md` 中的所有其他内容均精确保留。
4. 写入更新后的 `CLAUDE.md`。
5. 输出：

```
Wrote hyperflow doctrine block to ./CLAUDE.md (version 4.10.1).
Surfaces that load CLAUDE.md (Desktop, claude.ai web, IDE extensions that talk to API) will now honor:
  · Autonomy rules
  · Intent-based routing (audit/debug/fix/brainstorm/scope/deploy verbs)
  · Per-task commit cadence
  · Role separation (workers execute, reviewers review)
  · File-first artefacts under .hyperflow/
  · No AI attribution
  · Security blocklists

Re-run `/hyperflow:bridge refresh` after updating the plugin to pick up doctrine changes.
What's NOT in the bridge: /hyperflow:* slash commands, plugin-loaded skill files, operational pre-elections. Those need the terminal CLI.
```

### `remove`

1. 读取 `./CLAUDE.md`。如果不存在，或未找到 doctrine 标记，则输出 `Nothing to remove — no hyperflow doctrine block in ./CLAUDE.md.` 并停止。
2. 找到 `<!-- hyperflow:doctrine:start … -->` 和 `<!-- hyperflow:doctrine:end -->` 标记；删除它们之间的所有内容（包括标记本身）。合并相邻的空行，避免文件最终出现三个连续换行。
3. 如果 `CLAUDE.md` 现在为空（或只包含空白字符），保留为空文件而不是删除，因为用户可能有其他工具依赖该文件存在。
4. 输出 `Removed hyperflow doctrine block from ./CLAUDE.md. Surfaces that loaded the doctrine block will revert to default behaviour.`

### `mode <auto|manual|off>`

将所选模式写入 `.hyperflow/.bridge-mode`。该文件只包含一个单词：`auto`、`manual` 或 `off`。会话启动钩子会在每次 CLI 会话启动时读取它。输出以下之一：

```
Auto-bridge: AUTO — ./CLAUDE.md doctrine block is silently maintained on every CLI session start.
Auto-bridge: MANUAL — session start prints an advisory when the block is stale; you run /hyperflow:bridge refresh.
Auto-bridge: OFF — no advisories, no writes. Use /hyperflow:bridge generate manually if you want the block.
```

当 `.bridge-mode` 不存在时，默认使用 `auto`（因此首次安装 hyperflow 时无需用户操作即可自动桥接）。显式设置 `auto` 是一次无实际变更的写入，仅用于记录该意图。

### `status`

读取 `./CLAUDE.md`。查找 doctrine 标记。输出以下之一：

```
Hyperflow doctrine block: PRESENT in ./CLAUDE.md
  Version generated: 4.10.1
  Generated at:      2026-05-17T15:30:00Z
  Plugin current:    4.10.1
  Status:            up to date · or · update available (re-run /hyperflow:bridge refresh)
```

```
Hyperflow doctrine block: NOT PRESENT in ./CLAUDE.md
  Use /hyperflow:bridge generate to add it.
```

```
Hyperflow doctrine block: NOT PRESENT (no ./CLAUDE.md in project root)
  Use /hyperflow:bridge generate to create ./CLAUDE.md with the doctrine block.
```

## 流程

1. 解析子命令（默认为 `status`）。
2. 定位项目的 `./CLAUDE.md`（仓库根目录）。
3. 按照上述详细说明执行子命令。
4. 输出单块确认信息。

## 概述

`/hyperflow:bridge` 是面向用户的 CLAUDE.md doctrine bridge 接口。它本身不会执行 doctrine，而是将规则写入终端 CLI 外部界面会加载的文件中。当宿主在会话启动时加载 `CLAUDE.md`，这些界面便会执行相应规则。

## 前提条件

- 项目根目录包含可写的 `./` 目录（桥接工具会写入 `./CLAUDE.md`）。
- 已安装 Hyperflow 插件（桥接工具从插件缓存读取其模板）。如果在插件上下文之外运行，桥接工具会回退到插件源代码树中随附的副本。

## 指令

请参阅 [子命令](#subcommands) 和 [子命令详情](#subcommand-details)。摘要：

1. 解析子命令（默认为 `status`）。
2. 根据所选子命令读取/写入 `./CLAUDE.md`。
3. 输出一个简短的确认块。

## 输出

- `generate` / `refresh` — 多行确认信息，列出当前会遵循哪些作用面；以及桥接工具中不包含的内容。
- `remove` — 单行确认信息。
- `status` — 三字段块（存在状态 / 版本 / 新鲜度）。

## 错误处理

| 失败情况 | 行为 |
|---|---|
| `./CLAUDE.md` 不可写 | 输出明确错误；如果与权限有关，建议执行 `chmod +w ./CLAUDE.md`。不得静默回退到隐藏位置。 |
| 找不到插件模板（在缓存插件外运行） | 相对于此 SKILL.md 所在目录，在 `<plugin-root>/templates/claude-md-doctrine.md` 查找模板。如果仍然找不到，请以清晰的错误信息拒绝执行。 |
| 现有 doctrine 块的标记格式错误（只有一个标记，缺少另一个） | 拒绝刷新；输出格式错误文件的行范围，并要求用户手动修复标记。不得自动修复——用户内容可能面临风险。 |
| 一个 CLAUDE.md 中存在多个 doctrine 块（重复） | 拒绝执行，并显示两个块的行范围。由用户决定保留哪个。 |
| 用户重复运行 `generate` | 幂等——每次运行都会使用最新模板 + 时间戳替换该块。不会重复添加。 |

## 示例

### Desktop 用户的首次设置

```
You: /hyperflow:bridge generate

Wrote hyperflow doctrine block to ./CLAUDE.md (version 4.10.1).
Surfaces that load CLAUDE.md (Desktop, claude.ai web, IDE extensions that talk to API) will now honor:
  · Autonomy rules
  · Intent-based routing (audit/debug/fix/brainstorm/scope/deploy verbs)
  · Per-task commit cadence
  · Role separation (workers execute, reviewers review)
  · File-first artefacts under .hyperflow/
  · No AI attribution
  · Security blocklists

Re-run `/hyperflow:bridge refresh` after updating the plugin to pick up doctrine changes.
What's NOT in the bridge: /hyperflow:* slash commands, plugin-loaded skill files, operational pre-elections. Those need the terminal CLI.
```

### 状态检查

```
You: /hyperflow:bridge status

Hyperflow doctrine block: PRESENT in ./CLAUDE.md
  Version generated: 4.10.0
  Generated at:      2026-05-15T09:12:00Z
  Plugin current:    4.10.1
  Status:            update available (re-run /hyperflow:bridge refresh)
```

### 插件更新后的刷新

```
You: /hyperflow:bridge refresh

Wrote hyperflow doctrine block to ./CLAUDE.md (version 4.10.1).
...
```

### 移除

```
You: /hyperflow:bridge remove

Removed hyperflow doctrine block from ./CLAUDE.md. Surfaces that loaded the doctrine block will revert to default behaviour.
```

## 资源

- [`templates/claude-md-doctrine.md`](../../templates/claude-md-doctrine.md) — bridge 写入的可移植 doctrine 模板。
- [DOCTRINE.md](../hyperflow/DOCTRINE.md) — 完整 doctrine（CLI 界面）。
- [output-style.md](../hyperflow/output-style.md) — 确认块格式。