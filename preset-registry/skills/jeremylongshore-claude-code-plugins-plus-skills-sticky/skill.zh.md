---
name: sticky
description: |
  Use when the user wants to set auto-routing mode: on (every task-shaped message routes), auto (intent-verb messages route — default), or off (no auto-routing). Intent-detection runs by default; use this skill to expand to full sticky or disable entirely.
  Trigger with /hyperflow:sticky, "make hyperflow sticky", "stop using hyperflow", "is hyperflow sticky", "auto-route to hyperflow", "disable hyperflow auto-routing".
allowed-tools: Read, Write, Edit, Bash(rm:*), Bash(ls:*)
argument-hint: "<on|auto|off|status>"
version: 4.9.0
license: MIT
compatibility: Designed for Claude Code
tags: [session, automation, routing]
---
# Sticky

设置项目级自动路由模式。共有三种状态：

| 状态 | 默认？ | 行为 |
|---|---|---|
| `auto` | 是（当 `.sticky` 不存在时） | **意图检测路由**——包含链式启动动词（`audit`、`debug`、`fix`、`brainstorm`、`scope`、`deploy`、`review`……）的消息会自动路由。纯对话直接通过。 |
| `on` | — | **完全 sticky**——每条任务型消息都会路由，即使没有明确的意图动词 |
| `off` | — | **禁用所有自动路由**——只有显式的 `/hyperflow:*` 斜杠命令会触发链 |

意图检测是最低保障——用户无需选择启用即可使用（编排器会扫描每条用户消息中的链式启动动词，并在匹配时进行路由）。Sticky `on` 提高上限；sticky `off` 降低下限。

完整规范：[`DOCTRINE.md`](../hyperflow/DOCTRINE.md) 第 1 层自动路由条款（意图动词分类、路由契约和绕过模式）。

## 子命令

| 子命令 | 描述 |
|---|---|
| `on` | 设置状态：on——对每条任务型消息启用完全 sticky 路由 |
| `auto` | 设置状态：auto——仅进行意图动词路由（默认） |
| `off` | 设置状态：off——禁用所有自动路由，包括意图检测 |
| `status` | 显示当前状态（on / auto / off / 切换时间） |

未提供子命令时的默认子命令：`status`。

## 状态持久化

Sticky 状态存储在 `.hyperflow/.sticky`（项目范围，已被 gitignore）。文件格式：

```
state: on
since: 2026-05-17T14:30:00Z
trigger: user-mention   # or: explicit-toggle | session-default
```

会话启动钩子读取此文件，并在 sticky 处于 on 状态时打印一行提示（`Sticky mode: ON since 2026-05-17 14:30 — task-shaped messages auto-route through hyperflow`）。Sticky 会持续跨会话生效，直到显式切换为 off。

## 子命令详情

### `on`

使用 `state: on` + ISO-8601 时间戳 + `trigger: explicit-toggle` 写入 `.hyperflow/.sticky`。打印：

```
Sticky mode: ON (full routing)
Every task-shaped message now routes through hyperflow, even without intent verbs.
Disable with /hyperflow:sticky off · or relax to verb-only routing with /hyperflow:sticky auto.
```

### `auto`

使用 `state: auto` + 时间戳写入 `.hyperflow/.sticky`。当文件不存在时，这是默认状态；在 `off` 之后显式设置此状态，可以重新启用意图检测，而无需进入完全 sticky 模式。打印：

```
Sticky mode: AUTO (intent-detection routing, default)
Messages containing chain-starter verbs (audit, debug, fix, brainstorm, scope, deploy, review, …) auto-route.
Pure conversation passes through. Expand to full routing with /hyperflow:sticky on.
```

### `off`

将 `.hyperflow/.sticky` 的内容替换为 `state: off` + 时间戳。（保留该文件而不是删除，以便会话启动钩子显示最近的历史记录。）打印：

```
Sticky mode: OFF
All auto-routing disabled — even intent verbs (audit, debug, fix, brainstorm, …) will no longer route.
Use explicit /hyperflow:* invocations. Re-enable with /hyperflow:sticky auto or /hyperflow:sticky on.
```

### `status`

读取 `.hyperflow/.sticky`。打印一行：

```
Sticky mode: ON since 2026-05-17 14:30 (trigger: user-mention)
```

或：

```
Sticky mode: AUTO since 2026-05-17 14:30 (trigger: default · intent-detection routing)
```

或：

```
Sticky mode: OFF (last changed: 2026-05-16 09:12)
```

或者，如果文件不存在：

```
Sticky mode: AUTO (default · file not yet written · intent-detection routing active)
```

## 行为契约

当 sticky 处于 ON 状态时，编排器 MUST 在每条新的用户消息上遵循以下路由规则：

1. **聊天型消息**（关于先前输出的问题、对待处理门控的“是”/“否”回答、类似“好的”/“谢谢”的确认、简短澄清）——正常传递，不进行链式路由。
2. **任务型消息**（任何以动词开头的新工作请求：“添加 X”“修复 Y”“重构 Z”“构建”“实现”“创建”“设计”“规划范围”“分解”“交付”）——自动路由：
   - **新工作**（无论用户询问的是*做什么* / *我们是否应该做*，还是描述了*如何做*并指定了具体文件 / 函数）→ 使用用户消息作为 `ARGUMENTS` 调用 `/hyperflow:plan`。当请求已经明确时，plan 会在内部跳过设计阶段，直接进入分解阶段。
   - **引用了现有任务文件**（例如“继续 auth 任务”）→ 使用匹配的 slug 调用 `/hyperflow:dispatch`。
3. **错误报告**（“X 坏了”“Y 测试失败”“Z 抛出……”）→ 调用 `/hyperflow:trace`。
4. **审查请求**（“审查这个”“审核 diff”“有什么问题吗？”）→ 调用 `/hyperflow:audit`。
5. **交付意图**（“交付吧”“推送”“发布”“部署”）→ 调用 `/hyperflow:deploy`。

路由决策会静默完成——打印一行简短信息（`Routing to /hyperflow:plan (sticky mode) …`）并调用对应命令。不要要求用户确认路由（根据 DOCTRINE 规则 8，这会构成虚构的门控）。Step 0 的链模式问题仍会在被路由的 skill 内触发。

**覆盖规则：**如果用户消息以 `/` 开头（任何斜杠命令），或包含 “without hyperflow” / “skip hyperflow” / “don't route”，则跳过该消息的路由；直接响应。

## 激活触发条件

意图检测路由（`state: auto`）是**默认设置**——对每个项目都处于激活状态，无需用户执行任何操作。编排器会根据 DOCTRINE 的意图动词分类扫描每条用户消息，并在匹配到链启动动词时进行路由。无需写入文件。

升级和降级：

1. **升级为完整 sticky（`on`）：**
   - 显式触发：用户运行 `/hyperflow:sticky on`。
   - 隐式触发：用户在非斜杠命令消息中提到 “hyperflow”，并且 `.hyperflow/.sticky` 不存在或状态为 `auto`。编排器写入 `state: on · trigger: user-mention · since: <ISO-8601>`，并打印 `Sticky mode: ON (upgraded from auto, activated by mention). Disable with /hyperflow:sticky off.`
2. **降级为仅意图模式（`auto`）：**用户运行 `/hyperflow:sticky auto`。
3. **完全禁用（`off`）：**用户运行 `/hyperflow:sticky off`。这也会禁用意图检测——之后只有显式的 `/hyperflow:*` 斜杠命令会触发路由。

状态绝不会被编排器静默更改。只有用户显式调用 `/hyperflow:sticky <state>`（或一次性的隐式 `hyperflow` 提及升级）才会修改 `.hyperflow/.sticky`。

## 反模式（sticky 开启时）

- 询问用户“要不要将此请求路由到 hyperflow？”——这是人为添加的门槛；用户已经通过 sticky 表示选择加入
- 跳过被路由 skill 内部的 Step 0 链模式问题——sticky 控制的是*路由*，而不是*门槛*
- 路由聊天形式的消息——回答问题不应该触发链
- 路由以 `/` 开头的消息——这些是显式斜杠命令；应原样遵从
- 用一大段话重复路由决策——一行简短提示即可（`Routing to /hyperflow:plan (sticky mode) …`）

## 流程

1. 从调用中解析子命令（默认为 `status`）。
2. 读取 `.hyperflow/.sticky`（如果不存在，则视为空）。
3. 执行子命令：写入文件（`on` / `off`），或打印状态（`status`）。
4. 打印确认信息。

## 概述

`/hyperflow:sticky` 切换按项目生效的粘性会话路由。它本身不执行路由——当 sticky 开启时，编排器的行为契约会负责路由。此 skill 是面向用户的开关和状态读取器。

## 前置条件

- `.hyperflow/` 目录可写。如果不存在，该 skill 会创建 `.hyperflow/`，并在其中写入 `.sticky`。

## 指令

请参见[子命令](#subcommands)和[行为契约](#behavioural-contract)。摘要：

1. 解析子命令（默认为 `status`）。
2. 根据所选子命令读取或写入 `.hyperflow/.sticky`。
3. 打印一行确认信息。

当 sticky 开启时，编排器会根据行为契约处理之后的每条用户消息——不会重新调用此 skill，契约位于 DOCTRINE 中。

## 输出

每个子命令（`on` / `off` / `status`）仅输出一行状态。不得输出多行内容。

## 错误处理

| 失败情况 | 行为 |
|---|---|
| `.hyperflow/` 缺失 | 创建该目录，然后写入 `.sticky`。 |
| `.hyperflow/.sticky` 存在但格式错误 | 打印一行警告，并视为 `OFF`。将格式错误的文件备份为 `.sticky.bak`。 |
| 无效子命令（不是 `on`/`off`/`status`） | 打印有效子命令列表并退出。 |

## 示例

### 启用 sticky 模式

```
/hyperflow:sticky on

Sticky mode: ON
Task-shaped messages now auto-route through /hyperflow:plan (which bounces straight to decomposition when the design is clear).
Chat-shaped messages (questions, answers, acknowledgments) still pass through normally.
Disable with /hyperflow:sticky off.
```

### sticky 通过随意提及激活

```
You: hey, let's use hyperflow for the next feature
[orchestrator: detects "hyperflow" mention, .hyperflow/.sticky doesn't exist yet]
Sticky mode: ON (activated by mention)
Task-shaped messages now auto-route. Disable with /hyperflow:sticky off.

You: add a search bar to the dashboard with debounced input
[orchestrator: task-shaped, clear request → routes to /hyperflow:plan]
Routing to /hyperflow:plan (sticky mode) …
```

### 检查状态

```
/hyperflow:sticky status

Sticky mode: ON since 2026-05-17 14:30 (trigger: user-mention)
```

### 对单条消息绕过

```
You: without hyperflow, just tell me what hooks.json controls
[orchestrator: contains "without hyperflow" → bypass for this message]
hooks.json declares the session lifecycle hooks the plugin registers with Claude Code…
```

### 禁用 sticky

```
/hyperflow:sticky off

Sticky mode: OFF
Task-shaped messages will no longer auto-route. Use explicit /hyperflow:* invocations.
```

## 资源

- [DOCTRINE.md](../hyperflow/DOCTRINE.md) — 第 1 层 sticky 会话条款（当 sticky 为 ON 时，编排器遵循的行为契约）。
- [output-style.md](../hyperflow/output-style.md) — 单行确认格式。