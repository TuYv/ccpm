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

当项目选择启用多模型审计（`audit_model: multi`）时，此技能是 plan-auditor 和 sync-auditor 共用的唯一加载点。本文档说明了审计器调用的唯一 MCP 工具、该工具所实施的独立性规则，以及如何将返回的收敛结果纳入审计器的裁定。

## 何时使用收敛模式，何时使用单模型模式

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

该工具由 `moai mcp-server` stdio 服务器公开（随二进制文件提供的自托管 MCP 服务器）。此工具是收敛引擎的一层轻量封装：它不会重新实现 codex 或 GLM 后端，而是通过并行调用现有的单后端处理程序进行分发，并综合其结果。

### 输入参数

| 参数 | 类型 | 必需 | 说明 |
|---|---|---|---|
| `claude_verdict` | object | 是 | 当前会话中的 Claude 审查裁定。对象结构：`{verdict, summary, findings, next_steps}`——与单后端工具返回的 `review-output.schema.json` 相同。 |
| `target` | string | 否 | 次级后端审查的内容（`uncommittedChanges`、`baseBranch`）。原样传递。 |
| `focus` | string | 否 | 转发给次级后端的可选关注领域（例如 `concurrency`、`auth`）。 |
| `gates` | object | 否 | 每个审计器的门禁映射（`claude`/`codex`/`glm` ∈ `off`/`advisory`/`required`）。省略时，应用分布式默认值：claude 为必需，codex 为必需，glm 为建议性。 |
| `session_id` | string | 否 | 设置后，结果将持久化到 `.moai/state/audit-multi/<session>.json`，以便 multi-review-gate Stop hook 读取最新结果，而不是重新调用收敛流程。 |

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

- `overall_verdict` ∈ `{pass, fail}`——沿用现有的 review-output 值。不新增枚举值（分歧是一个标志，而不是裁定值）。
- 当检测到必需后端之间存在分歧，或仅建议性后端存在冲突时，`disagreement_flag` 为 `true`。
- `residual_risk_note` 以文字描述收敛结果（哪些后端失败，或分歧的具体形式）。应将其呈现在审计报告的残余风险部分。
- `fail_open_backends` 列出返回 `inconclusive` 的后端（缺失、未通过身份验证或发生错误），以便报告能够明确指出这些后端。

### 如何调用

调用工具时，将会话内 Claude 的分析归纳到
`claude_verdict` 对象中。请勿将完整的 Claude 分析文本作为提示词上下文
传递给辅助后端——请参阅下方的独立性规则。

```
result = mcp__moai__audit_multi({
  claude_verdict: { verdict: <your verdict>, summary: <one-line>, findings: [...], next_steps: [...] },
  target: "uncommittedChanges",
  focus: "concurrency",
  session_id: <current session id>
})
```

编排器侧的问题通道会得到保留：工具返回结构化结果，绝不会提示用户。遇到缺少锚点或无法得出结论的情况时，应在审计报告中呈现结构化的 `overall_verdict: fail` + `residual_risk_note`，并由编排器进行转译。

## 独立性规则（关键约束）

> **只将归纳后的 `claude_verdict` 对象传递给 MCP 工具——绝不要
> 将完整的 Claude 分析文本作为提示词上下文传递给辅助后端。**

辅助后端（codex、GLM）执行的是超级审查：提供互不相关的第二意见。一旦它们看到 Claude 的分析，其价值就会退化为对 Claude 推理的重新采样。收敛引擎从结构上强制执行此规则——`claude_verdict` 仅由综合步骤使用，而辅助后端只接收 `(target, focus)`——但审计器也不得通过将 Claude 的推理粘贴到 `focus` 字段中来破坏这一不变量。

具体而言：

- `focus` 只包含简短的领域名称（`concurrency`、`auth`、`secret handling`），
  而不是一段分析。
- `claude_verdict.summary` 是一行判定理由，而不是完整审查内容。
- 审计报告中呈现的发现来自
  `per_backend_verdicts[].findings`（各后端自己的发现），而不是
  再次复述 Claude 的发现。

## 收敛策略（如何得出 overall_verdict）

引擎根据以下 4 种情况推导 `overall_verdict`：

| 情况 | 条件 | overall_verdict | disagreement_flag |
|---|---|---|---|
| 1 | 所有必需后端均为 PASS | `pass` | `false` |
| 2 | 任一必需后端为 FAIL（没有必需后端为 PASS 与之形成分歧） | `fail` | `false` |
| 3 | 必需后端意见分裂（≥1 个必需后端为 PASS + ≥1 个必需后端为 FAIL） | `fail`（保守处理） | `true` |
| 4 | 仅咨询后端存在冲突（所有必需后端均为 PASS，≥1 个咨询后端为 FAIL） | `pass` | `true` |

由此可得两个不变量：

- **分歧仅供参考，并不会造成阻断。** `disagreement_flag: true` 的结果
  会在审计报告中作为剩余风险 + 咨询意见呈现；它本身绝不会
  硬性阻断流程。必需门禁契约按后端分别成立，
  因此唯一具有阻断效果的结果是必需后端为 FAIL（情况 2/3 →
  `overall_verdict: fail`）。
- **咨询后端绝不会将整体结果翻转为 fail。** 情况 4 会记录咨询后端的
  冲突，但仍保持 `overall_verdict: pass`。这是固定的用户策略条款：
  咨询后端的 FAIL 会被报告，但不会被强制执行。

## 失败开放原则

Codex 和 GLM 均为可选项。后端缺失、未经身份验证、发生错误或格式异常时，其 `per_backend_verdicts` 槽位中会产生 `verdict: inconclusive`，收敛过程则基于其余活跃后端继续进行。自主流程绝不会因缺少可选依赖而被硬性阻断——`evidence-of-absence ≠
evidence-of-failure`。

当所有非 Claude 后端均无法得出明确结论时，整体裁决将采用故障开放策略，回退到会话内 Claude 的裁决（始终可用的锚点）。

## 将结果纳入审计裁决

审计器裁决与收敛结果之间的关系如下：

| `overall_verdict` | `disagreement_flag` | 审计器操作 |
|---|---|---|
| `pass` | `false` | 标准 PASS。无需添加残余风险行。 |
| `pass` | `true` | PASS，并添加一个残余风险行，注明建议性后端之间的分歧。 |
| `fail` | （任意值） | FAIL。根据 `per_backend_verdicts` 指明裁决失败的必需后端。该阻断采用保守策略（情况 2/3）。 |

在所有情况下，都应在审计报告的残余风险部分逐字呈现 `residual_risk_note`，以便人工读者了解哪些后端之间存在分歧。

## 交叉引用

- `mcp__moai__codex_audit`、`mcp__moai__glm_audit` — 收敛引擎复用其处理程序的单后端工具（引擎不会重新实现这些工具）。
- `workflow.audit.gates.*` — 每个审计器的门控映射（`off`/`advisory`/`required`）。
- `workflow.multi.review_gate.enabled` — 多重审查门控 Stop hook 的选择启用开关（路径 C 的全自主门控）。默认关闭；通过本地配置选择启用。