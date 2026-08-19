---
name: workflow
description: |
  Use when a task is too large for turn-by-turn orchestration and should run through the big-task workflow lane: system-wide changes, large migrations, repo-wide audits, high-confidence verification, or tasks explicitly asking to run a workflow. Claude Code uses native dynamic workflows; Codex, OpenCode, and Grok use the portable workflow adapter.
  Trigger with /hyperflow:workflow, "run a workflow", "dynamic workflow", "big task", "large migration", "repo-wide audit".
allowed-tools: Read, Glob, Grep, AskUserQuestion, Skill
argument-hint: "<big task description>"
version: 1.0.0
license: MIT
compatibility: Claude Code native workflows; Codex/OpenCode/Grok portable adapter
tags: [workflow, claude-code, codex, opencode, grok, large-task, orchestration, verification]
---
# 工作流

适用于超出常规逐轮编排规模的工作的重大任务路径：系统级变更、大型迁移、全仓库审计、高置信度验证，以及明确要求工作流的任务提示。

- 在 Claude Code 中，使用宿主动态工作流运行时。
- 在 Codex 中，当提供 Codex 子代理时，使用带有 Codex 子代理的可移植工作流适配器；否则在当前线程中以内联方式运行相同阶段。
- 在 OpenCode 中，当提供 Task/子代理分派时，使用可移植工作流适配器；否则在当前会话中以内联方式运行相同阶段。
- 在 Grok 中，当启用 `spawn_subagent` 时，使用可移植工作流适配器；否则在当前会话中以内联方式运行相同阶段。
- 在 Antigravity、桌面/Web 桥接模式，或任何无法保留适配器阶段的宿主中，用一行说明这一点，并使用 `chain-mode=auto` 路由至 `/hyperflow:plan`。

Claude Code 动态工作流要求 Claude Code v2.1.154 或更高版本，并且可通过 `/config`、托管设置、`~/.claude/settings.json` 或 `CLAUDE_CODE_DISABLE_WORKFLOWS=1` 禁用。禁用时，如果宿主是 Codex、OpenCode 或 Grok，则使用可移植适配器；否则使用 `chain-mode=auto` 路由至 `/hyperflow:plan`。

## 路由规则

- 在 Claude Code、Codex、OpenCode 和 Grok 中运行此技能。
- 当分诊返回 `flow=deep` 或 `flow=scientific`、`scope=system-wide`，或者用户提到 `big task`、`large migration`、`repo-wide audit`、`run a workflow` 或 `dynamic workflow` 时，自动路由至此处。
- 不要将中等规模的多文件工作、常规缺陷修复，或需要用户在实施阶段之间批准的任务路由至此处。重大任务工作流运行不应依赖任意的运行中用户输入；将需要大量批准的工作拆分为独立工作流，或使用 `spec -> scope -> dispatch`。
- 不要自动设置 `/effort ultracode` 或 `xhigh`。用户可以手动启用 `/effort ultracode` 以进行会话级工作流选择。

## 提供方契约

### Claude Code 原生工作流

运行此技能时，请求 Claude Code 工作流运行时为 `$ARGUMENTS` 创建动态工作流。生成的工作流必须在工作者提示中保留 Hyperflow 的原则，并且必须包含以下阶段：

1. 研究与规划
   - 梳理受影响的文件、依赖边、测试、文档和风险边界。
   - 在存在时读取 `.hyperflow/profile.md`、`.hyperflow/architecture.md`、`.hyperflow/conventions.md`、`.hyperflow/testing.md` 和 `.hyperflow/memory/index.md`。
   - 生成简洁的执行图，其中包含可并行化单元及其依赖关系。

2. 并行实施或调查
   - 按子系统或文件族分派独立代理。
   - 保持每个代理的描述简短且具体：目标、范围内文件、约束、验收标准和测试预期。
   - 当运行时支持模型路由时，使用能够安全完成工作的最轻量模型/阶段。

3. 对抗性验证
   - 针对每项实施或发现，运行独立验证代理。
   - 对于审计，在报告每项发现之前进行验证。
   - 对于实施，检查跨文件集成、回归风险、安全敏感路径和遗漏的测试。

4. 质量门禁与修复循环
   - 运行项目 lint、typecheck、build，以及 `.hyperflow/testing.md` 中指定的相关测试或检测到的 package scripts。
   - 仅针对已验证的失败重试并进行有针对性的修复。
   - 永远不要使用 `--no-verify`；永远不要强制推送到 main 或 master。

5. 最终综合
   - 返回一份协调一致的结果，其中包含已完成的工作、验证证据、未解决的风险、变更的文件以及后续行动。
   - 对于需要长期保留的项目经验，确定应追加到 `.hyperflow/memory/` 的内容，但不要臆造与本次运行无关的记忆条目。

### Codex 可移植工作流适配器

Codex 不提供 Claude Code 的动态工作流运行时。将 `/hyperflow:workflow` 视为一个围绕 Codex 子代理和内联回退机制的自定义 Hyperflow 工作流封装：

1. 研究与规划
   - 在存在时，读取上文列出的相同 `.hyperflow/` 缓存文件。
   - 对于需要持久化进度跟踪的实现或审计工作，编写或更新 `.hyperflow/tasks/<slug>.md`。
   - 构建执行图，其中包含可并行的单元、依赖关系、预期提交以及验证命令。

2. 并行实现或调查
   - 如果 Codex 子代理工具可用，则同时分派相互独立的搜索者/工作者/写作者单元，并在评审前收集其结果。
   - 将实现和写作任务分配给工作者子代理；将代码库研究分配给探索者/搜索子代理。
   - 如果子代理不可用，则以内联方式逐个运行每个单元，并明确标注工作者和评审者角色。

3. 对抗性验证
   - 在报告每个已完成的单元之前，分别对其执行一次独立的验证流程。
   - 使用 Codex 的思考默认设置进行验证和最终集成评审。

4. 质量门禁与提交
   - 运行检测到的 lint、typecheck、build 以及相关测试。
   - 使用 conventional commits 为每个已接受的单元分别提交。
   - 永远不要使用 `--no-verify`；永远不要请求 `xhigh`。

5. 最终综合
   - 返回变更的文件、验证证据、未解决的风险以及后续行动。

### OpenCode 可移植工作流适配器

OpenCode 不提供 Claude Code 的动态工作流运行时。将 `/hyperflow:workflow` 视为一个围绕 OpenCode 的任务/子代理能力和内联回退机制的自定义 Hyperflow 工作流封装：

1. 研究与规划
   - 在存在时，读取上文列出的相同 `.hyperflow/` 缓存文件。
   - 对于需要持久化进度跟踪的实现或审计工作，编写或更新 `.hyperflow/tasks/<slug>.md`。
   - 构建执行图，其中包含可并行的单元、依赖关系、预期提交以及验证命令。

2. 并行实现或调查
   - 如果 OpenCode 提供 Task/子代理分派功能，则通过该路径发送相互独立的实现或调查单元。
   - 将每个子任务的范围限定为目标、涉及的文件、约束条件、验收标准和测试。
   - 如果任务分派不可用，则以内联方式逐个运行每个单元，并明确标注工作者和评审者角色。

3. 对抗性验证
   - 在报告每个已完成的单元之前，分别对其执行一次独立的验证流程。
   - 在当前会话模型上，以决策代理流程运行验证和最终集成评审。

4. 质量门禁与提交
   - 运行检测到的 lint、类型检查、构建和相关测试。
   - 使用 conventional commits 分别提交每个被接受的单元。
   - 绝不使用 `--no-verify`。

5. 最终汇总
   - 返回变更文件、验证证据、未解决风险和后续行动。

### Grok 可移植工作流适配器

Grok 不提供 Claude Code 的动态工作流运行时。将 `/hyperflow:workflow` 视为围绕 Grok `spawn_subagent` 和内联回退机制的自定义 Hyperflow 工作流封装：

1. 研究与规划
   - 存在时，读取上面列出的相同 `.hyperflow/` 缓存文件。
   - 对于需要持久化进度跟踪的实现或审计工作，编写或更新 `.hyperflow/tasks/<slug>.md`。
   - 构建执行图，其中包含可并行化单元、依赖关系、预期提交和验证命令。

2. 并行实现或调查
   - 如果 `spawn_subagent` 可用且未禁用子代理（`GROK_SUBAGENTS` / 配置），则一同分发独立单元：
     - 实现者/编写者 → `subagent_type: general-purpose`
     - 搜索者/研究者 → `subagent_type: explore`
   - 在审查前收集结果；当运行时允许时，并行生成独立的同级代理。
   - 如果子代理不可用，则以内联方式运行每个单元，并明确标注工作者和审查者。

3. 对抗性验证
   - 在报告每个已完成单元之前，为其运行单独的验证流程。
   - 使用当前会话模型，将验证和最终集成审查作为决策代理流程运行。

4. 质量门禁与提交
   - 运行检测到的 lint、类型检查、构建和相关测试。
   - 使用 conventional commits 分别提交每个被接受的单元。
   - 绝不使用 `--no-verify`。

5. 最终汇总
   - 返回变更文件、验证证据、未解决风险和后续行动。

## Claude Code 提示词骨架

将任务交给工作流运行时时，使用以下结构：

```text
Create a dynamic workflow for this Hyperflow big-task run.

Task:
<user task>

Doctrine:
- Preserve Hyperflow autonomy: execute reversible work without invented confirmations.
- Ask only for genuine ambiguity after codebase research.
- Keep plans, task decompositions, audits, and memory under .hyperflow/ when files are needed.
- Use conventional commits, one distinct task per commit.
- Never use --no-verify and never force-push to main/master.
- Respect the Hyperflow security blocklist in skills/hyperflow/security.md.

Required phases:
1. Research and planning.
2. Parallel implementation or investigation.
3. Adversarial verification.
4. Quality gates and focused repair loop.
5. Final synthesis.

Acceptance:
- Every substantive result is independently checked before being reported.
- Quality gates run or are explicitly marked unavailable with the command attempted.
- The final answer includes evidence, changed files, unresolved risks, and next actions.
```

## 保存以供复用

当一次运行成功且用户将重复执行时，提及 Claude Code 可以通过 `/workflows` 中的 `s` 保存生成的工作流。项目工作流保存在 `.claude/workflows/` 下；个人工作流保存在 `~/.claude/workflows/` 下。不要通过此技能直接创建这些文件，因为插件打包目前并未将 `.claude/workflows/` 作为一等组件提供。

Codex、OpenCode 和 Grok 适配器不会通过 `/workflows` 保存；可重复的行为来自此技能、`.hyperflow/tasks/`、项目记忆以及特定提供商的子代理/任务配置。