---
name: claude-handoff
description: Hand the current conversation off to a fresh background agent that picks up the work immediately.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---
编写当前对话的交接摘要，以便新代理能够继续工作。不要保存摘要，而是启动一个以该摘要作为提示词的后台代理：`claude --bg --name "<descriptive name>" "<handoff summary>"`。它会在当前工作目录中启动并立即返回；用户可通过 `claude agents` 管理它。

始终传递 `-n`/`--name` 并指定一个描述性名称（例如 `--name "Fix login bug"`）；该名称会设置在任务列表、会话选择器和终端标题中显示的名称。

在摘要中包含一个“建议技能”部分，列出下一个代理应通过 Skill 工具调用哪些技能。

不要重复其他产物（规范、计划、ADR、议题、提交、差异）中已经记录的内容。请通过路径或 URL 引用它们。

隐去任何敏感信息，例如 API 密钥、密码或个人身份信息，因为该摘要将成为代理的提示词。

如果用户传递了参数，请将其视为对下一个会话重点的描述，并据此调整摘要。