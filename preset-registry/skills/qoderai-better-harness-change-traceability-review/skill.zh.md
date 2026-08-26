---
name: change-traceability-review
description: Use for change traceability review across specs, commits, PRs, branches, local diffs, and git history, including Spec Preparation,
  Review Readiness Checks, and Review Retrospectives, to generate or verify Story-linked specs, commit-message evidence,
  test evidence, risk signals, AI involvement, and review-flow improvement suggestions.
---
# 变更可追溯性审查

审查变更背后的可追溯性，而不是代码风格：Story 或 issue -> Spec
-> plan/tasks -> commit/branch/PR -> diff -> tests -> risk。默认使用中文，
并保持报告简洁、以决策为导向。将 spec 作为审查的事实来源；当代码明确服务于
spec 时，即可接受。

## 模式

- **Spec Preparation**：在实现或提交之前，创建或完善与 Story 关联的
  spec，并定义验收场景、plan/tasks、tests 以及 risk 证据，供后续提交引用。
  加载 [Spec Contract](references/spec-contract.md)。
- **Review Readiness Check**：在审查/合并之前，检查当前 diff、暂存的 diff、
  PR 文本、分支或选定的提交。加载 [Mode Rules](references/mode-rules.md)
  和 [Reporting](references/reporting.md)。
- **Review Retrospective**：检查近期历史记录，通常为最新的 30 个提交。
  识别提交消息习惯、薄弱的可追溯性、缺失的 Spec/Test/Risk 证据、过大或混合范围的
  提交、spec-doc 模式以及返工信号。加载 [Mode Rules](references/mode-rules.md)
  和 [Reporting](references/reporting.md)。

## 入口与路由

1. 根据用户请求或当前审查对象确定模式。
2. 首先阅读仓库说明：最近的 `AGENTS.md`、插件清单以及目标 spec 或 diff。
3. 使用 [Evidence Commands](references/evidence-commands.md) 收集范围受限的本地证据。
4. 应用相关契约：
   - Spec Preparation：[Spec Contract](references/spec-contract.md)
   - 提交：[Commit Contract](references/commit-contract.md)
   - 任何审查：[Mode Rules](references/mode-rules.md)
5. 使用 [Reporting](references/reporting.md) 生成报告。

除非生成的辅助工具和本地实验是该 skill 必须使用的持久资源，否则请将它们放在
`SKILL.md` 之外。