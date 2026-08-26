---
name: triangulate-spec-review
description: Review and improve architecture specs, ADRs, plugin or agent directory proposals, and other design documents by running multiple independent AI reviewers such as Claude, Qoder, Codex, or Cursor Agent against the same artifact, normalizing P1/P2/P3 findings, and iterating only on blocking or high-risk issues.
---
# 三角审查规范

使用独立的 AI 审查者作为规范的评估面。主代理负责综合、编辑、验证和最终建议。

## 工作流

1. 确定目标规范路径和验收门槛。如果用户未指定维度，则默认使用 `complexity`、`convenience` 和 `evolution`。
2. 阅读目标规范和附近的仓库说明。不要将你推测的修复方案或结论传递给审查者。
3. 对每位审查者使用相同的只读提示。要求其提供结构化的 `P1`/`P2`/`P3` 发现结果以及一个 `p1_p2_clear` 布尔值。
4. 至少运行两位审查者；条件允许时优先使用三位。使用 `scripts/run-triad-review.mjs` 进行可重复的本地运行。
5. 规范化发现结果。将审查者视为证据而非权威：首先修复一致的 `P1`/`P2` 问题，质疑薄弱或相互矛盾的发现；将 `P3` 留作待办事项，除非修复成本低且能澄清问题。
6. 如果用户要求进行编辑，则只修改所属规范或直接相关的辅助文档。不要将无关重构带入审查循环。
7. 运行本地验证，例如 `git diff --check`、相关测试，以及针对已重命名概念或过时路径的定向 `rg` 检查。
8. 重复审查者流程，直到每位指定的审查者都报告没有 `P1` 或 `P2`，或者用户停止循环。

## 资源

- 阅读 `references/review-loop.md`，了解提示契约、严重性标准、命令矩阵和迭代模式。
- 运行此技能的 `scripts/run-triad-review.mjs --target <path>` 脚本；脚本路径相对于 `triangulate-spec-review` 技能目录解析，用于执行一轮只读审查并写入规范化的 JSON 输出。

## 防护措施

- 向审查者传递原始产物和任务本地上下文，而不是预期答案。
- 除非工具要求更改命令语法，否则确保每位审查者的提示在实质上保持一致。
- 不要让审查者编辑文件。主代理在比较发现结果后应用更改。
- 不要根据平均分宣布通过。验收要求所需审查面没有任何 `P1`/`P2` 发现。