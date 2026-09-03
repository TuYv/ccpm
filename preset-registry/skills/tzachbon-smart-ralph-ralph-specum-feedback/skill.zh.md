---
name: ralph-specum-feedback
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-feedback`, or explicitly asks Ralph Specum in Codex to draft or submit feedback.
metadata:
  surface: helper
  action: feedback
---
# Ralph Specum 反馈

使用本技能收集针对 Ralph Specum 的产品反馈或错误报告。

## 操作

1. 概述问题、请求或缺失的行为。
2. 收集最小可复现的上下文、受影响的文件、命令、环境详细信息，以及问题出现在 Codex 包还是 Claude 插件侧。
3. 如果 `gh` 可用且用户希望提交，则创建一个 GitHub issue。
4. 如果 `gh` 不可用或用户只想要草稿，则生成可直接粘贴的 issue 正文以及仓库的 issue URL。

## 输出

保持报告具体明确。包含预期行为、实际行为、复现步骤，以及任何相关的状态文件或日志。
