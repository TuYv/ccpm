---
name: plannotator-archive
description: Browse saved plan decisions in Plannotator's read-only archive UI in the browser.
disable-model-invocation: true
---
# Plannotator 归档

当用户希望在 Plannotator 的只读归档界面中浏览已保存的计划决策时，请使用此技能。

运行：

```bash
plannotator archive
```

行为：

1. 使用 Bash 启动该命令。
2. 等待浏览器归档会话结束（归档为只读，因此不会返回任何反馈）。
3. 会话关闭后，确认用户已完成归档浏览，然后继续。

请自行运行该命令，而不是让用户手动调用 shell 语法。