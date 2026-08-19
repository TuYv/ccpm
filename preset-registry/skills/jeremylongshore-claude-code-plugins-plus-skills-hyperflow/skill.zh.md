---
name: hyperflow
description: |
  Use when applying Hyperflow's orchestration doctrine in Codex, Antigravity, Grok, or another single-agent surface. Auto-invoke for non-trivial engineering work: build, implement, add, refactor, debug, fix, review, audit, plan, scope, design, brainstorm, ship, or deploy.
  Trigger with /hyperflow:hyperflow, "use hyperflow", "apply the doctrine", or automatically on any task-shaped message.
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Skill, AskUserQuestion, WebSearch, WebFetch, Bash(git:*), Bash(gh:*), Bash(npm:*), Bash(pnpm:*), Bash(npx:*), Bash(python3:*)
argument-hint: "[task]"
version: 1.0.0
license: MIT
compatibility: Portable doctrine — Claude Code, Codex App/CLI, OpenCode, Antigravity, Cursor, Grok
tags: [orchestration, doctrine, autonomy, multi-agent, portable]
---
# Hyperflow 准则（单代理移植版）

在加载技能但不提供完整 Claude Code 多代理运行时的环境中，应用 Hyperflow 的行为底线。

## 运行时适配

Codex、OpenCode、Antigravity 和 Grok 通常运行一个前台代理（或宿主特定的子代理 API）。当完整准则要求在审查员下调度并行工作者时：

- 当宿主的子代理 API 存在时，优先使用它（Codex spawn、OpenCode Task、Grok `spawn_subagent`）。
- 否则自行完成工作，每次处理一个连贯的批次。
- 在进入下一批之前自行审查每个批次。
- 对累积 diff 运行最终集成自审。
- 保留相同的自主性、澄清、提交节奏、文件优先产物、无归属标注和安全规则。

## 可移植函数路由器（Codex / OpenCode / Grok）

这些宿主将 Hyperflow 作为技能加载，而非原生 Claude 风格的斜杠命令。将这些用户消息视为函数别名，并在当前线程内联执行匹配的技能工作流：

| 用户说 | 运行 |
|---|---|
| `/hyperflow:plan`, `hyperflow plan`, `design with hyperflow`, `decompose with hyperflow` | `plan` |
| `/hyperflow:dispatch`, `hyperflow dispatch`, `run the hyperflow plan` | `dispatch` |
| `/hyperflow:workflow`, `hyperflow workflow`, `run a workflow` | `workflow` |
| `/hyperflow:trace`, `hyperflow trace`, `debug with hyperflow` | `trace` |
| `/hyperflow:audit`, `hyperflow audit`, `review with hyperflow` | `audit` |
| `/hyperflow:deploy`, `hyperflow deploy`, `ship with hyperflow` | `deploy` |
| `/hyperflow:cache`, `hyperflow cache` | `cache` |
| `/hyperflow:status`, `hyperflow status` | `status` |
| `/hyperflow:sticky`, `hyperflow sticky` | `sticky` |
| `/hyperflow:bridge`, `hyperflow bridge` | `bridge` |
| `/hyperflow:flush`, `hyperflow flush` | `flush` |
| `/hyperflow:background`, `hyperflow background` | `background` |
| `/hyperflow:scaffold`, `hyperflow scaffold` | `scaffold` |

在这些环境中，不要回答 `/hyperflow:*` 是未知命令。移除别名，加载匹配的 `skills/<name>/SKILL.md`，并遵循其工作流。如果该工作流要求使用不可用的 Claude Code 工具（`Agent`、`Skill` 或 `AskUserQuestion`），则模拟它们：使用可见标签内联执行工作者/审查员步骤，内联继续链式技能，并在缺少结构化问题 UI 时使用下方的交互回退方案。

## 子代理与自动链式调用

### Codex

当 Codex 提供多代理工具时，将 Hyperflow 代理调度映射到 Codex 子代理，而不是回退为内联工作：

- 将 Hyperflow 的 `Agent` 工作者/搜索者/编写者调用映射到 Codex 工作者或探索者子代理。
- 如果可调用工具名为 `multi_agent_v1.spawn_agent`，则对实现者/编写者执行使用 `agent_type: worker`，对搜索/代码库研究任务使用 `agent_type: explorer`，然后在审查前收集结果。
- 当运行时支持并行子代理调用时，同时生成独立的同级工作者。
- 每个代理均在当前会话模型上运行——不要按角色切换模型。将推理强度与任务复杂度相匹配：简单文档/配置检查使用 `low`，常规规划/审查使用 `medium`，调试、架构、安全或最终集成审查使用 `high`。
- 绝不请求或默认使用 `xhigh`。

当 Codex 在当前会话中未提供子代理工具时，使用上面的单代理移植方案：以内联方式执行 worker/reviewer 阶段，并使用清晰的标签标明后继续。

### Grok

Grok CLI / Grok Build 会从 `~/.grok/skills/`、项目的 `.grok/skills/` 以及兼容的 Claude/Cursor skill 目录加载 skills。项目规则来自 `AGENTS.md` / `CLAUDE.md` 和 `.grok/rules/`。运行时信号通常包含 `GROK_AGENT=1`。

当 Grok 提供 `spawn_subagent` 时，按以下方式映射 Hyperflow 调度：

| Hyperflow 角色 | Grok `subagent_type` |
|---|---|
| implementer / writer / general worker | `general-purpose` |
| searcher / codebase research | `explore` |
| plan-only research (no file writes) | `plan` |
| domain specialists (`architect`, `security-reviewer`, …) | 如果已注册匹配类型则使用该类型；否则使用 `general-purpose`，并在提示词中加入该专家角色说明 |

- 当运行时支持并行子代理调用时，同时生成相互独立的兄弟 worker。
- 如果子代理被禁用（`GROK_SUBAGENTS=0` 或配置禁用），以内联方式执行 worker/reviewer 阶段，并使用清晰的标签标明。
- 如果可用，优先使用原生的 `AskUserQuestion` 工具处理结构化关卡。
- 每个 agent 都运行在当前会话所使用的模型上——不支持按角色选择模型。
- 不要虚构 Claude Code 的 `Agent` 工具调用；使用 `spawn_subagent`，或以内联方式执行。

### Auto-chain（所有可移植宿主）

对于 `/hyperflow:workflow`，使用 workflow skill 中面向可移植环境的工作流适配器（Codex / OpenCode / Grok 分支），而不是回退到 `scope`：执行研究和规划；在需要时跟踪 `.hyperflow/tasks/` 进度；在提供子代理时使用并行子代理，否则以内联方式执行 worker/reviewer 阶段；执行对抗性验证、质量关卡、每个任务的 conventional commit，以及最终综合。不要将其描述为原生 Claude Code 动态工作流支持。

这些宿主可能不提供 Claude Code 的 `Skill` 交接工具。将每次 Hyperflow 交接都视为内联自动链：

- `plan` 以内联方式运行 amplify → design → decompose，然后在其构建位置关卡处**始终询问并停止**。它绝不会自动实现：选择“this session”时以内联方式继续进入 `dispatch`；选择“another session”时写入交接包；选择“stop”时保留计划。
- `dispatch` 提供 `audit` 和 `deploy` 结构化关卡，然后以内联方式运行所选的后续流程。
- `audit` 的修复关卡会继续进入 `plan`，并生成 audit-fix 任务（随后该任务会在自己的构建位置关卡处停止）。

不要以“Skill 工具不可用”为由停止。自动链是行为契约，而不是宿主 API 要求。

## 交互回退

当宿主缺少结构化提问 UI（或 `AskUserQuestion` 不可用）时，不要跳过问题，也不要默默选择推荐选项。以简洁的聊天块形式呈现相同的结构化关卡，并等待用户回答：

```text
Hyperflow Question
<question>

1. <recommended option> (Recommended) — <short consequence>
2. <option> — <short consequence>
```

对每个必需的澄清或结构化关卡都使用此回退方式：Amplify 交接、Spec 链模式、Spec brainstorming 问题、Scope 歧义问题、Dispatch audit/deploy 关卡、Audit 修复关卡、Deploy 提交包含范围和推送关卡，以及任何安全性/不可逆操作升级。禁止提出诸如“should I proceed?”之类虚构的确认问题。

在 Grok 上，若存在原生的 `AskUserQuestion` 工具，应优先使用；仅在该工具缺失时使用聊天块回退方案。

## 推理策略

- 每个代理都运行在当前会话模型上，不支持按角色选择模型。
- 根据任务/配置文件确定推理力度：琐碎的文档/配置检查使用 `low`，常规规划/审查使用 `medium`，调试、架构、安全和最终集成使用 `high`。
- 不要默认让便携式主机使用极端的最大力度模式（例如 Codex `xhigh`）。

## 核心规则

1. 无需确认即可执行任务型请求。
2. 只有在阅读相关代码后，并且确实存在歧义时，才进行澄清。
3. 将长篇计划、规范、任务拆解和审计内容放在 `.hyperflow/` 下。
4. 使用约定式提交，每个独立的用户任务对应一个提交。
5. 永远不要在提交、文档、注释、任务文件或记忆中将模型作为执行者。
6. 遵守 `security.md` 中的安全黑名单。

## 工作流路由

| 意图 | 工作流 |
|---|---|
| `brainstorm`、`design`、`explore`、“是否应该” | 先研究，提出关键问题，然后给出方案 |
| `scope`、`decompose`、“规划一下” | 映射受影响的文件，然后在 `.hyperflow/tasks/` 下编写任务图 |
| `big task`、`large migration`、`repo-wide audit`、`run a workflow`、`dynamic workflow` | 使用工作流技能：Claude Code 原生工作流，或 Codex/OpenCode/Grok 便携式适配器；否则通过 `scope` 进行拆解 |
| `build`、`implement`、`add`、`refactor` | 进行拆解，分批执行，自行审查，并为每个任务提交 |
| `debug`、`fix it`、“为什么 X 失败” | 先确定根本原因，再进行修复 |
| `audit`、`review`、“检查问题” | 先给出审查发现，然后提供/应用修复 |
| `ship`、`push`、`release`、`deploy` | 运行检查关卡，提交/发布，推送前询问 |

如需了解完整的多代理规范，请阅读 `DOCTRINE.md` 以及本目录中链接的参考文件。