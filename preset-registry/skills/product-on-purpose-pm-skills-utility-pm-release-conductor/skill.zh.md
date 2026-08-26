---
name: utility-pm-release-conductor
description: Walk the guided release runbook (6 gates G0/G1/G2/G2.5/G3/G4) via the pm-release-conductor sub-agent. Dispatches natively on Claude Code with the pm-skills plugin (invokes @agent-pm-skills:pm-release-conductor with native chain composition to pm-skill-auditor at G0 and pm-changelog-curator at G2); on non-Claude clients (Codex CLI, Cursor, Windsurf, Copilot, Gemini CLI) reads agents/pm-release-conductor.md and inlines auditor + curator behaviors at G0 + G2 via reference-and-execute-inline pattern (because non-Claude clients cannot natively chain to other sub-agents). Returns gate-by-gate output with explicit confirmation pauses, refuses bypass attempts, tags only the G2.5-captured SHA per master plan D22.
license: Apache-2.0
metadata:
  classification: utility
  version: "1.0.0"
  updated: 2026-05-17
  category: release
  frameworks: [triple-diamond]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# PM 发布协调器（调度技能）

面向多客户端的 `pm-release-conductor` 子代理调度封装器。在 Claude Code 上检测运行时并调度原生子代理；在非 Claude 客户端上读取 `agents/pm-release-conductor.md`，通过“引用 + 内联执行”模式内联链式组合。

> **状态摘要（v2.16.0）：** 在 Claude Code 上已达到生产可用状态（原生子代理路径）。根据 [`gate-test-results_2026-05-17_codex.md`](../../docs/internal/release-plans/v2.16.0/gate-test-results_2026-05-17_codex.md)，已在 Codex CLI 2026-05-17 上完成干运行验证；Codex CLI 上的实际发布尚未经过独立演练，因此请谨慎使用，并先运行 `--dry-run` 进行预演。在 Cursor / Windsurf / Copilot CLI / Gemini CLI 上为实验性功能（v2.16.0 发布时尚未测试）。
>
> 关于标准安全使用矩阵、已验证内容的详细信息以及 v2.17 扩展计划，请参阅[子代理兼容性矩阵](../../docs/reference/sub-agent-compatibility.md)。如果要在非 Claude 客户端上进行实际发布，最好先在该特定客户端上重新运行 [`maintainer-gate-testing-codex.md`](../../docs/internal/release-plans/v2.16.0/maintainer-gate-testing-codex.md) 中的测试工具。

## 何时使用

- 你正在非 Claude 客户端（Codex CLI、Cursor、Windsurf、Copilot、Gemini CLI）上执行 pm-skills 发布
- 你希望采用与 pm-release-conductor 在 Claude Code 上强制执行的相同 6 道门禁流程，并在相关门禁中内联审计员 + 策展员行为
- 你明确希望在 Claude Code 上使用技能调用语义，而不是子代理语义（少见；在 Claude Code 上优先使用原生子代理）

## 何时不要使用

- 你只需要审查 PM 工件 -> 使用 `utility-pm-critic`
- 你只需要进行治理审计（而不是发布） -> 使用 `utility-pm-skill-auditor`
- 你只需要起草 CHANGELOG（而不是发布） -> 使用 `utility-pm-changelog-curator`
- 你希望在**不进行明确门禁确认**的情况下执行发布操作 -> 协调器会拒绝绕过；此时应在协调器之外手动发布

## 说明

**运行时检测步骤。** 确定是哪个 AI 客户端正在调用此技能。

### 如果你正在运行已安装 pm-skills 插件的 Claude Code

使用 `$ARGUMENTS` 中用户指定的目标版本 + 可选标志调用 `@agent-pm-skills:pm-release-conductor`。原生子代理会遍历 6 道门禁，并通过 Agent 工具原生串联 `pm-skill-auditor`（G0、G2.5）和 `pm-changelog-curator`（G2）。将协调器逐门禁的输出返回给用户。

### 如果你正在运行其他任何 AI 客户端

Codex CLI、Cursor、Windsurf、Copilot、Gemini CLI，或任何不支持原生 pm-skills 插件子代理的其他客户端：

1. 读取规范的子代理定义 `agents/pm-release-conductor.md`
2. 读取规范的运行手册 `docs/contributing/release-runbook.md`（这是协调器关于门禁定义的参考来源）
3. 将系统提示正文作为你的操作说明执行
4. 内联遍历 6 道门禁。在需要链式组合的门禁中：
   - **G0（打标签前就绪检查）：** 不要串联 pm-skill-auditor，而是读取 `agents/pm-skill-auditor.md`，并内联执行审计员的 4 步审计流程。捕获分层输出（完整发现结果 + Status Summary + Status YAML）。将 Status YAML 作为 G0 子检查 5 的输入。
   - **G2（版本递增 + CHANGELOG 准备）：** 不要串联 pm-changelog-curator，而是读取 `agents/pm-changelog-curator.md`，并内联执行策展员的 8 步起草流程。捕获分层输出。将 Status YAML 作为 G2 子检查 3 的输入。
   - **G2.5（重新验证）：** 针对新的 HEAD，在子检查 5 中重新执行内联审计员流程。
5. 在每道门禁边界暂停，等待维护者明确确认
6. 拒绝任何绕过尝试；遵守拒绝协议
7. 按照 D22，仅在 G3 对 G2.5 捕获的 SHA 打标签
8. 在整个流程中持续返回逐门禁输出。

“引用 + 内联执行”模式实现了链式组合的跨客户端兼容性。Phase 2 GATE C 子尖峰验证了该模式的可靠性。

## 非 Claude 内联执行的关键注意事项

由于非 Claude 客户端无法原生进行链式调用，审计器和策展器的行为会在非 Claude 客户端上与指挥器处于同一个上下文窗口中。这会带来以下影响：

1. **上下文预算。** 合并后的 token 预算（指挥器 + 内联审计器 + 内联策展器 + 它们读取的子内容）在较长的发布流程中可能接近上下文限制。请据此进行规划。
2. **工具授权。** 指挥器的工具列表包括 Bash、Read、Edit、Grep、Glob、Agent。审计器需要 Bash + Read + Grep + Glob。策展器需要 Bash + Read + Grep。非 Claude 客户端上的内联执行应能够访问其中的**全部**工具（即不应运行在只读模式下）。
3. **拒绝级联。** 如果内联审计器拒绝执行（例如验证器无法调用），指挥器的 G0 子检查 5 将失败，门控流程会暂停。G2 阶段的策展器也是如此。

## 参考文件

- 规范子代理定义：[`agents/pm-release-conductor.md`](../../agents/pm-release-conductor.md)
- 规范运行手册：[`docs/contributing/release-runbook.md`](../../docs/contributing/release-runbook.md)
- 行为规范：[`docs/internal/release-plans/v2.16.0/spec_pm-release-conductor.md`](../../docs/internal/release-plans/v2.16.0/spec_pm-release-conductor.md)
- 链式子代理（在 G0 + G2.5 内联）：[`agents/pm-skill-auditor.md`](../../agents/pm-skill-auditor.md)
- 链式子代理（在 G2 内联）：[`agents/pm-changelog-curator.md`](../../agents/pm-changelog-curator.md)
- 预标签验证器包：`scripts/pre-tag-validate.{sh,ps1}`
- 运行时组件目录：[`docs/reference/runtime-components.md`](../../docs/reference/runtime-components.md)
- 输出模板：`references/TEMPLATE.md`
- 完整示例：`references/EXAMPLE.md`