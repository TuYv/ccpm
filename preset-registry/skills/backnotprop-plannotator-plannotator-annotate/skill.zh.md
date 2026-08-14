---
name: plannotator-annotate
description: Open Plannotator's annotation UI for a markdown file, plain-text config file (.yaml, .json, .toml, .ini, .csv, .log, …), HTML file, URL, or folder and then respond to the returned annotations.
disable-model-invocation: true
---
# Plannotator 标注

当用户希望在 Plannotator 中标注文档，而不是在聊天中直接审阅时，请使用此技能。

运行：

```bash
plannotator annotate <path-or-url>
```

行为：

1. 使用 Bash 启动该命令。
2. 等待浏览器中的审阅完成。
3. 如果返回了标注，请直接处理。
4. 如果会话在没有反馈的情况下关闭，请简短说明并继续。
5. 即使已批准，也可能附带备注——即带有
   `"feedback"` 字段的 `"decision": "approved"` 结果。请阅读这些备注，并在后续工作中遵循，
   但不要因此修改文档：它们是指导意见，而不是变更请求。
6. 如果命令报告无法将参数解析为文件、
   URL 或文件夹，请确定用户所指的目标，然后使用该目标的具体路径或 URL 自行重新运行命令。

不要让用户将 shell 命令粘贴到聊天中。请自行运行该命令。