---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---
编写一份交接文档，总结当前对话，以便新的代理能够继续工作。将其保存到用户操作系统的临时目录中，而不是当前工作区。

在文档中包含一个“建议技能”部分，列出下一个代理应通过 Skill 工具调用的技能。

不要重复其他产物（规范、计划、ADR、议题、提交、差异）中已经记录的内容。请通过路径或 URL 引用它们。

对任何敏感信息进行脱敏，例如 API 密钥、密码或个人身份信息。

如果用户传入了参数，请将其视为下一会话的工作重点描述，并据此调整文档内容。