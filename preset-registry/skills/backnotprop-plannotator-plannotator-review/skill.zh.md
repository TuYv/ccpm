---
name: plannotator-review
description: Open Plannotator's browser-based code review UI for the current worktree or a pull request URL, then act on the feedback that comes back.
disable-model-invocation: true
---
# Plannotator 审查

当用户希望在 Plannotator 中审查当前代码更改，而不是直接在行内阅读差异时，使用此技能。

运行：

```bash
plannotator review [--base <ref>] [--diff-type <type>] [optional-pr-url]
```

正在审查堆叠分支中的某一层？传入 `--base <the branch immediately below yours>`，这样审查只会显示该层新增的内容，而不是自 `main` 以来的全部更改。这两个标志仅对当前会话有效（审查者可以在 UI 中修改任一标志；不会持久化），且仅适用于 git。

行为：

1. 使用 Bash 启动命令。
2. 等待命令完成。
3. 如果命令返回反馈或批注，请在同一对话中处理。
4. 如果命令返回批准或类似 LGTM 的消息，请确认审查已通过并继续。

不要要求用户将 shell 命令复制到聊天中。请自行运行命令。