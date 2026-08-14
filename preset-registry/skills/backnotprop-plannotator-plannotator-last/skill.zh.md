---
name: plannotator-last
description: Open Plannotator on the latest rendered assistant message and use the returned annotations to revise that message or continue.
disable-model-invocation: true
---
# Plannotator Last

当用户希望在 Plannotator 中标注助手的最新回复时，请使用此技能。

运行命令前不要发送评论性消息或状态消息。该命令以最新渲染的助手回复为目标，因此前言可能会被误当成要标注的内容。

运行：

```bash
plannotator last
```

行为：

1. 使用 Bash 启动该命令。
2. 等待标注会话结束。
3. 如果返回了反馈，请将其纳入后续回复。
4. 如果会话关闭但未提供反馈，请简要说明，然后继续。
5. 即使已批准，也仍可能附带备注——即结果包含 `"decision": "approved"` 以及 `"feedback"` 字段。请阅读这些备注，并在后续工作中遵循它们，但不要据此重做该消息：这些备注是指导意见，而不是变更请求。

请自行运行该命令，而不是让用户手动调用 shell 语法。