---
name: ralph-specum-help
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-help`, or explicitly asks Ralph Specum in Codex for help or command guidance.
metadata:
  surface: helper
  action: help
---
# Ralph Specum 帮助

使用本说明来解释 Codex 中的 Ralph Specum 功能面。

## 覆盖内容

- 主技能：`$ralph-specum`
- 辅助技能：`$ralph-specum-start`, `$ralph-specum-triage`, `$ralph-specum-research`, `$ralph-specum-requirements`, `$ralph-specum-design`, `$ralph-specum-tasks`, `$ralph-specum-prototype`, `$ralph-specum-implement`, `$ralph-specum-status`, `$ralph-specum-switch`, `$ralph-specum-cancel`, `$ralph-specum-index`, `$ralph-specum-refactor`, `$ralph-specum-feedback`, `$ralph-specum-help`
- 正常流程：启动目标拷问、批准、研究、产物批准、需求拷问、批准、设计拷问、批准、任务拷问、批准、实现
- 大型工作流程：先分诊，然后逐个启动每个已解除阻塞的 spec
- 快速模式：只有精确的 `--quick` 才会绕过
