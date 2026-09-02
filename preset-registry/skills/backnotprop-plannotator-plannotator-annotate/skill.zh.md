---
name: plannotator-annotate
description: Open Plannotator's annotation UI for a markdown file, plain-text config file (.yaml, .json, .toml, .ini, .csv, .log, …), HTML file, URL, or folder and then respond to the returned annotations.
disable-model-invocation: true
---
# Plannotator 注释

当用户希望在 Plannotator 中注释文档，而不是直接在聊天中进行审阅时，使用此技能。

运行普通注释/反馈：

```bash
plannotator annotate <path-or-url>
```

当用户要求审阅、批准、接受或门控生成的计划/规范/文档时运行：

```bash
plannotator annotate <path-or-url> --gate --json
```

普通的 `annotate` 没有 **Approve** 按钮；它只支持提供反馈或关闭会话。除非存在 `--gate`，否则绝不要承诺可以执行批准操作。`--json` 只会更改输出格式，本身不会启用批准功能。

行为：

1. 使用 Bash 启动命令。
2. 等待浏览器审阅完成。
3. 如果返回了注释，直接处理这些注释。
4. 如果会话在没有反馈的情况下关闭，简要说明这一点并继续。
5. 在 `--gate --json` 会话中，批准结果仍可能包含备注，例如带有 `"decision": "approved"` 结果以及 `"feedback"` 字段。读取这些备注并将其带入后续工作，但不要因此修改文档：这些备注是指导，而不是修改请求。
6. 如果命令报告参数无法解析为文件、URL 或文件夹，判断用户指的是哪个目标，然后自行使用明确的路径或 URL 重新运行命令。

不要要求用户将 shell 命令粘贴到聊天中。自行运行命令。