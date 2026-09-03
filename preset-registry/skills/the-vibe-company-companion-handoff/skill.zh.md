---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---
撰写一份交接文档，总结当前对话的内容，以便一个全新的智能体能够继续这项工作。将文档保存到用户操作系统的临时目录——而不是当前工作区。

在文档中包含一个"建议技能"部分，指明下一个智能体应针对哪些技能调用 Skill 工具。

不要重复已在其他工件（specs、plans、ADRs、issues、commits、diffs）中记录的内容，改为通过路径或 URL 引用这些工件。

对任何敏感信息进行脱敏处理，例如 API 密钥、密码或个人身份信息。

如果用户传入了参数，请将其视为对下一个会话工作重点的描述，并据此调整文档内容。
