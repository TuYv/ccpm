---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---
# Web 界面指南

审查文件是否符合 Web 界面指南。

## 工作原理

1. 从下方源 URL 获取最新指南
2. 读取指定文件（或提示用户提供文件/匹配模式）
3. 根据所获取指南中的所有规则进行检查
4. 以简洁的 `file:line` 格式输出发现的问题

## 指南来源

每次审查前获取最新指南：

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

使用 WebFetch 获取最新规则。所获取的内容包含全部规则和输出格式说明。

## 用法

当用户提供文件或匹配模式参数时：
1. 从上方源 URL 获取指南
2. 读取指定文件
3. 应用所获取指南中的所有规则
4. 使用指南中指定的格式输出发现的问题

如果未指定文件，请询问用户要审查哪些文件。