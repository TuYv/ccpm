---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---
收到，但我先按当前窗口要求先确认再动手：  
请先告诉我本次要使用的 **skill / plugin**（可直接选一个组，或一组多项）：

- 常用可选：`agent-reach`、`baoyu-skills`、`local-tools`、`browser`、`chrome`、`documents`、`presentations` 等  
- 你也可以回复“**不加载任何新增 skill，仅按当前环境**”
- 或列出要禁用的组（如有）

我确认后再直接生成并写入用户系统临时目录的交接文档。
