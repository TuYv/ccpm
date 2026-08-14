---
name: plannotator-review
description: Open Plannotator's browser-based code review UI for the current worktree or a pull request URL, then act on the feedback that comes back.
disable-model-invocation: true
---
# Plannotator 审查

当用户希望在 Plannotator 中审查当前代码更改，而不是直接阅读内联 diff 时，请使用此技能。

运行：

```bash
plannotator review [optional-pr-url]
```

行为：

1. 使用 Bash 启动该命令。
2. 等待命令执行完成。
3. 如果命令返回反馈或批注，请在同一对话中处理。
4. 如果命令返回批准/LGTM 风格的消息，请确认审查已通过并继续。

不要要求用户将 shell 命令复制到聊天中。请自行运行该命令。