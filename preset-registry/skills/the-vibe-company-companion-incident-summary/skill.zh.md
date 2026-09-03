---
name: incident-summary
description: Summarize an incident timeline from logs into a concise postmortem draft.
metadata: {}
license: MIT
allowed-tools: read_file run_python
---
# incident-summary

读取一个日志摘录目录，并生成一份简洁的事件总结：包括时间线、影响范围、疑似原因以及后续跟进事项。不进行网络访问；仅在本地文件上运行。

## 用法

将其指向一个包含 `*.log` 摘录的文件夹，并提供一段描述事件时间窗口的简短提示。
