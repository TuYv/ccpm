---
name: good-docs-audit
description: Audit a doc, guide, README, or block of prose against the good-docs-writing style guide and report violations. Use when the user asks to review, critique, lint, or check the voice and tone of documentation or text. Produces a structured findings report (file:line, rule violated, offending text, suggested rewrite) and does NOT edit files unless explicitly asked.
---
# 优质文档审查

依据 `good-docs-writing` 规则审查目标文档，并报告文风偏离之处。默认行为是**仅报告**：给出发现的问题，不进行编辑。仅当用户明确要求修复、重写或应用更改时，才修改文件。

阅读 `references/audit-process.md`，了解审查流程、按优先级排列的违规检查清单、报告格式和报告规则。

不可妥协的要求：

- 首先阅读 `good-docs-writing`（及其 `references/style-guide.md`）。其中的规则是评判标准；本技能定义的是流程。
- 每项发现都必须引用 `file:line`，并逐字引用存在问题的文本。
- 给出真正符合目标文风的改写，而不是“考虑修改”。
- 不要虚构违规问题。报告简短是个好结果。