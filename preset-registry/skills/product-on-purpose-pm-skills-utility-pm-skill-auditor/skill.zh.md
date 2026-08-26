---
name: utility-pm-skill-auditor
description: Run a repo-wide cross-cutting governance audit via the pm-skill-auditor sub-agent. Dispatches natively on Claude Code with the pm-skills plugin (invokes @agent-pm-skill-auditor); on non-Claude clients (Codex CLI, Cursor, Windsurf, Copilot, Gemini CLI) reads agents/pm-skill-auditor.md and executes the system prompt inline. Returns a layered audit report (full findings + Status Summary prose + Status YAML envelope per master plan D26) with cross-cutting findings graded P0/P1/P2/P3 plus aggregate counter audit and validator results table.
license: Apache-2.0
metadata:
  classification: utility
  version: "1.0.0"
  updated: 2026-05-17
  category: governance
  frameworks: [triple-diamond]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# PM Skill 审计器（调度技能）

面向多客户端的 `pm-skill-auditor` 子代理调度封装。检测运行时环境；在 Claude Code 上调度原生子代理；在非 Claude 客户端上读取 `agents/pm-skill-auditor.md` 并以内联方式执行。

## 使用时机

- 需要执行一次覆盖整个仓库的审计：所有强制执行的验证器、跨领域检查（skill-without-command、示例缺失、系列契约孤儿项等），以及针对 CONTEXT.md + AGENTS.md + README.md 中声明值的聚合计数器重新推导
- 在不支持原生 pm-skill-auditor 子代理的非 Claude AI 客户端上运行
- 在 Claude Code 上运行，并且更偏好技能调用语义（例如，在同时使用其他调度技能的工作流中进行串联）

## 不要使用时

- 想要审查特定的 PM 工件（PRD、OKR、persona） -> 请改用 `utility-pm-critic`
- 想要起草 CHANGELOG 条目 -> 请改用 `utility-pm-changelog-curator`（在 Phase 4 中提供）
- 想要发布版本 -> 请改用 `utility-pm-release-conductor`（在 Phase 5 中提供）
- 想要修复审计中发现的问题 -> 审计器仅负责检测；修复工作由维护者判断，或交由未来的 `pm-frontmatter-doctor`（v2.17+）处理

## 说明

**运行时检测步骤。** 确定调用此技能的是哪个 AI 客户端。

### 如果你在安装了 pm-skills 插件的 Claude Code 中运行

对仓库调用 `@agent-pm-skill-auditor`。传入 `$ARGUMENTS` 中的所有范围参数（例如 `--scope changed`、`--since-tag v2.15.0`、`--severity-floor P1`）。将子代理的审计报告返回给用户。

### 如果你在其他任何 AI 客户端中运行

Codex CLI、Cursor、Windsurf、Copilot、Gemini CLI，或任何其他不支持原生 pm-skills 插件子代理的客户端：

1. 读取规范的子代理定义 `agents/pm-skill-auditor.md`
2. 将该文件中的系统提示正文作为本轮操作指令执行
3. 执行四步审计流程：
   - 步骤 1：通过 Bash 调用验证器（优先将 `bash scripts/pre-tag-validate.sh` 作为规范入口点）
   - 步骤 2：运行目录 `docs/internal/release-plans/v2.16.0/spec_pm-skill-auditor.md#cross-cutting-check-catalog` 中的跨领域检查
   - 步骤 3：从文件系统重新推导聚合计数器，并与声明值进行比较
   - 步骤 4：编写分层输出报告
4. 应用 `$ARGUMENTS` 中的范围和严重性下限参数
5. 按照主计划 D26 返回分层输出（完整报告 + Status Summary + Status YAML）

## 跨客户端说明

请参阅[子代理兼容性矩阵](../../docs/reference/sub-agent-compatibility.md)，了解规范的跨客户端状态。此技能截至 v2.16.0 的摘要：Claude Code + Codex CLI 上为 PRODUCTION（Codex CLI 已成功通过 Bash 调用验证器套件，并生成包含重新推导聚合计数器的分层审计报告）；Cursor / Windsurf / Copilot CLI / Gemini CLI 上为 EXPERIMENTAL。

“读取规范的 agent 定义并内联执行”模式依赖于 AI 客户端能够：

1. 读取所引用的文件路径
2. 执行 Bash 以调用验证器脚本
3. 将 agent 定义正文视为当前轮次的操作指令

大多数 AI 客户端都支持这三项。如果其中任何一项在特定客户端上不可靠，该客户端将回退到手动调用验证器 + 手动执行跨切面检查。

## 参考文件

- 规范的子代理定义：[`agents/pm-skill-auditor.md`](../../agents/pm-skill-auditor.md)
- 行为规范：[`docs/internal/release-plans/v2.16.0/spec_pm-skill-auditor.md`](../../docs/internal/release-plans/v2.16.0/spec_pm-skill-auditor.md)
- 运行时组件目录：[`docs/reference/runtime-components.md`](../../docs/reference/runtime-components.md)
- 跨切面检查目录：`docs/internal/release-plans/v2.16.0/spec_pm-skill-auditor.md#cross-cutting-check-catalog`
- 预发布标签验证器包：`scripts/pre-tag-validate.{sh,ps1}`
- 输出模板：`references/TEMPLATE.md`
- 完整示例：`references/EXAMPLE.md`