---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---
# Web 界面指南

检查文件是否符合 Web 界面指南。

## 工作原理

1. 从下方的源 URL 获取最新指南
2. 读取指定的文件（或提示用户提供文件/模式）
3. 对照已获取指南中的所有规则进行检查
4. 以简洁的 `file:line` 格式输出检查结果

## 指南来源

每次审查前获取最新的指南：

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

使用 WebFetch 获取最新规则。获取到的内容包含所有规则以及输出格式说明。

## 用法

当用户提供文件或模式参数时：
1. 从上述源 URL 获取指南
2. 读取指定的文件
3. 应用已获取指南中的所有规则
4. 使用指南中指定的格式输出检查结果

如果未指定文件，请询问用户要审查哪些文件。
