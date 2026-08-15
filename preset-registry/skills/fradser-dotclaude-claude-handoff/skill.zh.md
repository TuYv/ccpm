---
name: claude-handoff
description: Hands the current conversation to a fresh background agent that picks up the work immediately. Use when the user wants the work continued by a background agent.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---
编写当前对话的交接摘要，以便新的代理可以继续工作。不要保存摘要，而是启动一个以该摘要作为提示词的后台代理：`claude --bg --name "<descriptive name>" "<handoff summary>"`。它会在当前工作目录中启动并立即返回；用户通过 `claude agents` 对其进行管理。

始终使用 `-n`/`--name` 传入一个描述性名称（例如 `--name "Fix login bug"`）——该名称会作为显示名称出现在作业列表、会话选择器和终端标题中。

在摘要中包含一个“建议技能”部分，推荐该代理应调用的技能。

不要重复其他产物（PRD、计划、ADR、议题、提交、差异）中已经记录的内容。请通过路径或 URL 引用它们。

隐去所有敏感信息，例如 API 密钥、密码或个人身份信息——该摘要将成为代理的提示词。

如果用户传入了参数，请将其视为下一会话重点内容的描述，并据此调整摘要。