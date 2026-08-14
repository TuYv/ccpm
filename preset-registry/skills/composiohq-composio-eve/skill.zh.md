---
name: eve
description: Build durable backend AI agents with the eve framework. Use when creating, editing, or debugging an eve project — agent instructions, skills, tools, connections, channels, sandboxes, subagents, schedules, or evals.
---
# eve

eve 是一个文件系统优先的框架，用于构建持久化后端 AI 智能体。一个智能体就是磁盘上的一个目录——指令、技能、工具、连接、频道、子智能体和计划任务全都是文件——eve 会对其进行编译并运行。

## 事实来源

完整文档随 `eve` 包一起提供。不要依赖此技能获取指导——始终阅读随包提供的文档，因为它们与已安装的版本完全匹配：

```
node_modules/eve/docs/
```

请从 `node_modules/eve/docs/README.md` 开始阅读。它包含完整的索引和推荐阅读顺序。在编写任何 eve 代码之前，请先阅读其中的相关指南。

如果尚未安装 `eve`，请安装它（`npm install eve`），或使用 `npx eve init <agent-name>` 创建一个新的智能体脚手架，然后阅读随包提供的文档。

有关仓库本地的交接边界，请参阅 `references/source-of-truth.md`。