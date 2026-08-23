---
name: writing-commit-messages
description: >-
  Writes Git commit messages. Activates when the user asks to write
  a commit message, draft a commit message, or similar.
---
# 编写提交消息

编写符合项目提交风格指南的提交消息。

## 格式

```
<subsystem>: <summary>

<reference issues/PRs/etc.>

<long form description>
```

## 规则

### 主题行

- **子系统前缀**：使用简短的小写标识符，表示发生变更的代码区域（例如 `terminal`、`vt`、`lib`、`config`、`font`）。根据差异中的文件路径确定。如果变更涉及 macOS 应用，请使用 `macos`。对于 GTK，请使用 `gtk`。对于构建系统，请使用 `build`。在有助于表达且范围互斥时，使用带 `/` 的嵌套子系统（例如 `terminal/osc`）。
- **摘要**：以小写字母开头（不要大写），使用祈使语气，末尾不加句号。保持简洁——整个主题行最好不超过 60 个字符。

### 引用

- 如果变更与 GitHub issue、PR 或讨论相关，请在主题之后空一行，将相关编号各自单独列在一行中。例如 `#1234`
- 如果没有引用，请完全省略此部分（不要留空行）。

### 详细描述

- 从较高层面描述**更改了什么**、**之前的行为是什么**以及**新行为如何运作**。
- 使用普通段落，而不是项目符号。每行约 72 个字符时换行。
- 重点说明*为什么*以及*如何实现*，而不是复述差异内容。
- 保持语气直接且技术化，不使用填充短语。
- 不要超过少量几个段落；越精简越好。

## 工作流程

- 如果存在 `.jj`，所有命令都使用 `jj` 而不是 `git`。
- 运行 diff，查看自上次提交以来有哪些变更。
- 根据已更改的文件路径确定子系统。
- 从差异上下文或分支名称中识别引用的 issue/PR。
- 按照上述格式起草提交消息。
- 创建提交。
- 不要推送提交；将其留给用户操作。