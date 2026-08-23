---
name: moai-ref-cross-model-audit
description: >
  Cross-model audit convergence reference for the plan-auditor and sync-auditor
  agents. Documents how to invoke the `audit_multi` MCP tool to fan a code
  review out across the codex and GLM (z.ai) backends in parallel, converge
  their verdicts with the in-session Claude verdict, and fold the resulting
  per-backend verdicts + disagreement flag into the audit output. The single
  skill both audit entry points load — no duplication.

when_to_use: >
  Use when the project's `audit_model` is `multi` AND the auditor needs a
  cross-backend second opinion before reaching a verdict. Single-backend paths
  (claude-only, codex-only, or glm-only) do NOT load this skill — the
  `audit_multi` tool is the multi-model entry point only. Also use when the
  auditor must explain WHY the convergence result is a pass, fail, or
  advisory-only disagreement.

user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
---
# 跨模型审计收敛

当项目选择启用多模型审计（`audit_model: multi`）时，此技能是 plan-auditor 和 sync-auditor 使用的唯一加载点。它记录了审计器调用的唯一 MCP 工具、该工具强制执行的独立性规则，以及如何将返回的收敛结果纳入审计器的裁定。

## 何时使用收敛模式与单模型模式

| 项目设置 | 路径 | 技能 |
|---|---|---|
| `audit_model: claude`（默认） | Claude 单独审查 | （无——不需要第二意见） |
| `audit_model: codex` | Codex 单独审查 | `moai-ref-owasp-checklist` 等，不使用收敛模式 |
| `audit_model: glm` | GLM 单独审查 | （同上） |
| `audit_model: multi` | Claude + codex + GLM，进行收敛 | **此技能** |

单模型路径不会加载此技能。收敛仅适用于多模型场景。

## `audit_multi` MCP 工具

唯一的工具接口是：

```
mcp__moai__audit_multi
```

它由 `moai mcp-server` stdio 服务器（随二进制文件一同提供的自托管 MCP 服务器）公开。该工具是收敛引擎的轻量封装：它不会重新实现 codex 或 GLM 后端，而是通过并行调用现有的单后端处理程序进行扇出，并综合其结果。

### 输入参数

| 参数 | 类型 | 必需 | 说明 |
|---|---|---|---|
| `claude_verdict` | object | 是 | 当前会话中 Claude 的审查裁定。对象结构：`{verdict, summary, findings, next_steps}`——与单后端工具返回的 `review-output.schema.json` 相同。 |
| `target` | string | 否 | 次级后端审查的内容（`uncommittedChanges`、`baseBranch`）。原样传递。 |
| `focus` | string | 否 | 转发给次级后端的可选关注领域（例如 `concurrency`、`auth`）。 |
| `gates` | object | 否 | 每个审计器的门禁映射（`claude`/`codex`/`glm` ∈ `off`/`advisory`/`required`）。省略时，采用分布式默认值：claude 为 required，codex 为 required，glm 为 advisory。 |
| `session_id` | string | 否 | 设置后，结果将持久化到 `.moai/state/audit-multi/<session>.json`，以便 multi-review-gate Stop hook 读取最新结果，而不是再次调用收敛。 |
| `project_root` | string | 否*（在 worktree 中为必需）* | 后端应读取的工作树——本会话自身的 `git rev-parse --show-toplevel`。如果在 worktree 中省略此参数，扇出操作将改为读取主检出，因此后端审查的 diff 并不是正在接受审计的 diff，而且结果中不会对此作出任何说明。仅可在主检出中省略。无法使用的路径将被拒绝，并在错误中明确指出该路径，绝不会被静默替换。 |

### 输出结构

该工具返回一个 `ConvergenceResult`：

```json
{
  "per_backend_verdicts": [
    {"backend": "claude", "gate": "required", "verdict": "pass", "summary": "...", "findings": [], "next_steps": []},
    {"backend": "codex",  "gate": "required", "verdict": "fail", "summary": "...", "findings": [...], "next_steps": [...]},
    {"backend": "glm",    "gate": "advisory", "verdict": "pass", "summary": "...", "findings": [], "next_steps": []}
  ],
  "overall_verdict": "fail",
  "disagreement_flag": true,
  "residual_risk_note": "cross-model disagreement (advisory, NOT a block): pass=[claude(required), glm(advisory)] fail=[codex(required)]",
  "fail_open_backends": []
}
```

- `overall_verdict` ∈ `{pass, fail}` — 沿用现有的评审输出值。不新增
  枚举值（分歧是标志，而不是裁决值）。
- 当检测到必需后端之间的分裂或仅限建议的冲突时，`disagreement_flag` 为 `true`。
- `residual_risk_note` 以文字描述收敛结果（哪些后端失败，或分裂的具体情况）。请将其呈现在审计
  报告的残余风险部分。
- `fail_open_backends` 列出返回 `inconclusive` 的后端（缺失、
  未认证或发生错误）——将其呈现出来，以便报告能够明确指出这些后端。

### 如何调用

调用该工具时，将当前会话中的 Claude 分析归纳到
`claude_verdict` 对象中。不要将完整的 Claude 分析文本作为提示词上下文
传递给辅助后端——请参阅下方的独立性规则。

```
result = mcp__moai__audit_multi({
  claude_verdict: { verdict: <your verdict>, summary: <one-line>, findings: [...], next_steps: [...] },
  target: "uncommittedChanges",
  focus: "concurrency",
  session_id: <current session id>
})
```

编排器侧的提问通道会被保留：该工具返回结构化结果，绝不会向用户提问。当缺少锚点或出现不确定
情况时，请在审计报告中呈现结构化的 `overall_verdict: fail` + `residual_risk_note`
并由编排器进行转译。

## 独立性规则（至关重要）

> **仅将归纳后的 `claude_verdict` 对象传递给 MCP 工具——绝不要
> 将完整的 Claude 分析文本作为提示词上下文传递给辅助后端。**

辅助后端（codex、GLM）是超级评审器：它们提供不相关的第二意见。一旦
它们看到 Claude 的分析，其价值就会退化为对 Claude 推理的再次采样。收敛引擎从结构上强制执行这一点——
`claude_verdict` 仅由综合步骤使用，而辅助
后端接收 `(target, focus, project_root)`——即范围、领域名称和
目录，彼此之间不携带任何分析——但审计器也不得
通过将 Claude 的推理粘贴到 `focus` 字段中来破坏这一不变量。

具体而言：

- `focus` 携带简短的领域名称（`concurrency`、`auth`、`secret handling`），
  而不是一段分析。
- `claude_verdict.summary` 是一行裁决理由，而不是完整评审。
- 你在审计报告中呈现的发现来自
  `per_backend_verdicts[].findings`（每个后端自己的发现），而不是
  原样复述 Claude 的发现。

## 收敛策略（如何推导 overall_verdict）

引擎根据以下 4 种情况表推导 `overall_verdict`：

| 情况 | 条件 | overall_verdict | disagreement_flag |
|---|---|---|---|
| 1 | 所有必需后端均为 PASS | `pass` | `false` |
| 2 | 任一必需后端为 FAIL（没有必需后端为 PASS，因而不存在分裂） | `fail` | `false` |
| 3 | 必需后端之间出现分裂（≥1 个必需后端为 PASS + ≥1 个必需后端为 FAIL） | `fail`（保守处理） | `true` |
| 4 | 仅限建议的冲突（所有必需后端均为 PASS，≥1 个建议后端为 FAIL） | `pass` | `true` |

由此可得两个不变量：

- **分歧仅供参考，不构成阻断。** `disagreement_flag: true` 结果
  会作为残余风险和建议呈现在审计报告中；它本身绝不会
  硬性阻断流程。必需门禁契约按后端分别成立，
  因此唯一具有阻断性质的结果是必需后端为 FAIL（情况 2/3 →
  `overall_verdict: fail`）。
- **建议后端绝不会将总体裁决翻转为 fail。** 情况 4 会记录建议
  冲突，但保持 `overall_verdict: pass`。这是固定的用户策略条款：
  建议后端的 FAIL 会被报告，但不会被强制执行。

## 故障开放机制

Codex 和 GLM 均为可选项。后端缺失、未经身份验证、发生错误或格式异常时，其 `per_backend_verdicts` 对应位置中的结果为 `verdict: inconclusive`，收敛过程则基于其余活跃后端继续进行。自主流程绝不会因缺少可选依赖而被硬性阻断——`evidence-of-absence ≠
evidence-of-failure`。

当所有非 Claude 后端的结果均为不确定时，总体裁决将以故障开放方式采用当前会话中 Claude 的裁决（始终可用的锚点）。

## 将结果纳入审计裁决

审计器裁决与收敛结果的关系如下：

| `overall_verdict` | `disagreement_flag` | 审计器操作 |
|---|---|---|
| `pass` | `false` | 标准 PASS。无需添加剩余风险行。 |
| `pass` | `true` | PASS，并添加一行剩余风险，注明咨询性分歧。 |
| `fail` | （任意值） | FAIL。根据 `per_backend_verdicts` 指明未通过的必需后端。该阻断采取保守策略（情况 2/3）。 |

在所有情况下，都应在审计报告的剩余风险部分逐字呈现 `residual_risk_note`，以便人工读者了解哪些后端之间存在分歧。

## 交叉引用

- `mcp__moai__codex_audit`、`mcp__moai__glm_audit` — 收敛引擎复用其处理程序的单后端工具（引擎不会重新实现这些工具）。
- `workflow.audit.gates.*` — 各审计器的门控映射（`off`/`advisory`/`required`）。
- `workflow.multi.review_gate.enabled` — 多重审查门控 Stop hook（路径 C 的完全自主门控）的可选启用开关。默认关闭；可通过本地配置启用。