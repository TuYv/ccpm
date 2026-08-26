---
name: utility-pm-critic
description: Run adversarial review on a PM artifact via the pm-critic sub-agent. Dispatches natively on Claude Code with the pm-skills plugin (invokes @agent-pm-skills:pm-critic); on non-Claude clients (Codex CLI, Cursor, Windsurf, Copilot, Gemini CLI) reads agents/pm-critic.md and executes the system prompt inline. Returns findings graded P0/P1/P2/P3 with concrete fix suggestions per finding, plus a layered Status Summary section and machine-readable Status YAML block per master plan D26.
license: Apache-2.0
metadata:
  classification: utility
  version: "1.0.0"
  updated: 2026-05-17
  category: review
  frameworks: [triple-diamond]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# PM Critic（调度技能）

此技能是 `pm-critic` 子代理的跨客户端调度包装器。它的存在是为了让使用非 Claude 客户端的用户能够执行与 Claude Code 用户意图相同的对抗性评审，而不依赖原生插件子代理基础设施。

根据主计划 D11（修订版）和 D30，子代理是 Claude Code 的插件功能。非 Claude 客户端（Codex CLI、Cursor、Windsurf、Copilot、Gemini CLI）无法原生加载 `agents/pm-critic.md`。此技能用于弥合这一差距。

## 适用场景

- 你希望对 PM 工件进行对抗性评审（PRD、OKR 集合、用户画像、精益画布、会议回顾、访谈综合、问题陈述、假设、边界情况目录、复盘等）
- 你正在使用非 Claude AI 客户端运行，且 `pm-critic` 子代理不可原生使用
- 你正在使用 Claude Code，并且更偏好技能调用语义而不是子代理语义（例如，在混合使用技能和子代理意图的多步骤工作流中保持一致性）

## 不适用场景

- 你希望进行结构化 lint / 仓库级审计 -> 改用 `utility-pm-skill-auditor`（它会同时审计技能和仓库状态）
- 你希望编写工件（此技能仅用于评审） -> 使用相应的阶段技能（`deliver-prd`、`foundation-okr-writer` 等）
- 你希望进行代码评审 -> 使用专门的代码评审工具（此技能用于 PM 工件）
- 你希望强制执行样式规则，例如全面清理 em dash -> 这是 `pm-release-conductor` 的 G0 gate，而不是此技能

## 指令

**运行时检测步骤。** 确定是哪个 AI 客户端正在调用此技能。

### 如果你正在运行已安装 pm-skills 插件的 Claude Code

对目标工件调用 `@agent-pm-skills:pm-critic`。将工件路径作为参数传入（如果未提供参数，则使用会话上下文中最近的工件）。将子代理的发现结果返回给用户。此技能无需进一步操作——子代理会在其自己的上下文窗口中原生处理评审。

### 如果你正在使用任何其他 AI 客户端

Codex CLI、Cursor、Windsurf、Copilot、Gemini CLI、ChatGPT，或任何不支持原生 pm-skills 插件子代理的其他客户端：

1. 读取规范的子代理定义 `agents/pm-critic.md`
2. 将该文件中的系统提示正文作为本轮的操作指令执行
3. 读取用户指定的目标 PM 工件（来自 `$ARGUMENTS` 的路径，或会话中最近生成的工件）
4. 读取 pm-critic 系统提示针对该工件类型所引用的规范文档（例如，OKR 集合对应的 `skills/foundation-okr-writer/SKILL.md`，PRD 对应的 `skills/deliver-prd/SKILL.md`）
5. 按 P0/P1/P2/P3 级别生成发现结果，并提供具体的修复建议；格式遵循 `docs/guides/adversarial-review.md` 中记录的输出结构
6. 按主计划 D26 规定的分层结构结束输出：
   - Section (1)：完整的、便于人类阅读的发现结果（P0/P1/P2/P3 报告）
   - Section (2)：使用散文形式的 `## Status Summary`，总结发现的问题以及用户接下来应采取的行动
   - Section (3)：包含机器可读字段的 `## Status` YAML 块

## 输出格式

请参阅 `references/TEMPLATE.md` 了解规范的输出结构（包含依据 D26 分层的 Status 封装）。请参阅 `references/EXAMPLE.md` 查看针对 PRD 执行真实跨客户端调度的完整示例。

## 组合

- **技能：** 此调度技能可与所有生成 PM 产物的技能组合使用（deliver-prd、foundation-okr-writer、foundation-meeting-recap、foundation-persona、foundation-lean-canvas、discover-interview-synthesis 等）。先运行其中任意一个技能，然后对生成的产物运行此技能。
- **子代理：** 在 Claude Code 上，此技能会调度 `pm-critic` 子代理。在非 Claude 环境中，此技能即为内联执行；无需进一步调度。
- **工作流：** `pm-workflow-orchestrator`（已发布 v2.24.0）可以在跨客户端兼容性的质量门禁步骤中调用此技能。

## 跨客户端说明

请参阅[子代理兼容性矩阵](../../docs/reference/sub-agent-compatibility.md)，了解全部 4 个子代理及调度技能的规范跨客户端状态。截至 v2.16.0，此技能的状态摘要为：Claude Code + Codex CLI 上为 PRODUCTION；Cursor / Windsurf / Copilot CLI / Gemini CLI 上为 EXPERIMENTAL。希望在非 Claude 客户端上验证跨客户端可靠性的维护者，可以在该客户端上重新运行 [`maintainer-gate-testing-codex.md`](../../docs/internal/release-plans/v2.16.0/maintainer-gate-testing-codex.md) 测试套件。

“读取并内联执行”模式依赖于 AI 能够：

1. 读取作为参考提供的文件路径（大多数 AI 客户端支持此功能）
2. 将该文件的内容视为当前轮次的操作指令（大多数 AI 客户端支持对 SKILL.md 样式指令执行此操作）
3. 在调用时读取其他被引用的规范文档（所有主要 AI 客户端均支持此功能）

如果这些能力中的任何一项在某个客户端上不可靠，则该客户端无法有效使用此调度技能。

## 参考文件

- 规范的子代理定义：[`agents/pm-critic.md`](../../agents/pm-critic.md)
- 行为规范：[`docs/internal/release-plans/v2.16.0/spec_pm-critic.md`](../../docs/internal/release-plans/v2.16.0/spec_pm-critic.md)
- 面向用户的指南：[`docs/guides/adversarial-review.md`](../../docs/guides/adversarial-review.md)
- 运行时组件目录：[`docs/reference/runtime-components.md`](../../docs/reference/runtime-components.md)
- 输出模板：`references/TEMPLATE.md`
- 完整示例：`references/EXAMPLE.md`