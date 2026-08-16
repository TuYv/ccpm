---
name: sred-work-summary
description: Go back through the previous year of work and create a Notion doc that groups relevant links into projects that can then be documented as SRED projects.
---
# SRED 工作总结

收集某个人在指定年份完成的所有 Github PR、Notion 文档和 Linear 工单。将这些内容的链接按项目分组。把所有内容放入一个私有 Notion 文档中，并返回该文档的链接。

## 前置条件

开始之前，请确保可以访问 Github、Notion 和 Linear。Notion 和 Linear 应使用 MCP 连接。Github 可以使用 MCP 连接，但如果你可以使用 `gh` CLI 工具，也可以改用该工具。

如果其中任何一项无法访问，请先提示用户授予访问权限，然后再继续。

## 流程

### 第 1 步

```bash
# Get the current year
date +%Y
```

此命令的输出是当前年份。
当前年份减一即为上一年。

### 第 2 步

向用户收集所有必需的信息：

*Github 用户名*：用户的 Github 用户名是什么？

*Github 仓库*：应在哪些 Github 仓库中搜索 PR？

用户可以指定一个以逗号分隔的列表，也可以提供一个包含仓库的目录。在第二种情况下，请在指定目录中使用以下命令：

```bash
# Find github repos
find . -maxdepth 2 -name ".git" -type d | sed 's/\/.git$//' | sort
```

确保：
- 列出的所有仓库都属于 `getsentry` Github 组织。

此命令的输出在下文中称为“用户仓库”。

*事件*：询问用户是否希望包含事件文档。

答案只能是是或否。如果答案是否，则后续搜索时将排除某些文档。

*其他用户*：询问是否还有其他用户可能创建过 Notion 文档。

这应该是一个以逗号分隔的姓名列表。将其记为“其他用户”。

### 第 3 步

创建一个标题为“SRED 工作总结 [current year]”的私有 Notion 文档。此文档在下文中称为工作总结。

如果已存在同名文档，请通知用户重命名现有文档并停止执行。

确保：
- 如果工作总结已存在，则停止执行。

### 第 4 步

时间范围为上一年的 2 月 1 日至当前年份的 1 月 31 日。
查找指定 Github 用户名在此时间范围内为用户仓库创建的所有 Github PR。
如果用户不希望包含事件文档，请忽略标题或描述中带有 `INC-X`、`inc-X` 的所有 Github PR。
使用 Github MCP 或 `gh` 命令执行此操作。

查找用户在此时间范围内创建的所有 Notion 文档。
如果用户不希望包含事件文档，请忽略标题中带有 `INC-XXXX` 的所有 Notion 文档。
使用 Notion MCP 执行此操作。

查找在此时间范围内分配给用户的所有 Linear 工单。
如果用户不希望包含事件文档，请忽略标题中带有 `INC-XXXX` 的所有 Linear 工单。
使用 Linear MCP 执行此操作。

确保：
- 所有 Github PR 都是在此时间范围内创建或合并的，并且由该用户发起。
- 所有 Notion 文档都是在此时间范围内创建的，并且由该用户创建。
- 所有 Linear 工单都是在此时间范围内创建或完成的，并且在完成时分配给该用户。

### 步骤 5

对于步骤 4 中找到的每个 Github PR、Notion 文档和 Linear 工单，将其链接添加到步骤 3 创建的私有文档中。

确保：
- 工作总结中包含所有 Github PR 的链接
- 工作总结中包含所有 Notion 文档的链接
- 工作总结中包含所有 Linear 工单的链接
- 不要截断链接列表。不要使用类似“...以及另外 75 个”的缩略形式。确保文档中完整显示所有 Github PR、Notion 文档和 Linear 工单。

### 步骤 6

运用你自己的判断，将工作总结文档中的所有 Github、Notion 和 Linear 工单链接按项目分组。该文档的格式如下所示。

```markdown
# Projects

## [Project Name]
*Summary*: [X] PRs, [X] Notion docs, [X] Linear tickets

### Pull Requests [X]
*[repository name]
[Links to all the PRs]
- [link] - [Merge date]

### Notion Docs [X]
[Links to all the Notion docs]
- [link] - [Creation date]

### Linear Tickets [X]
- [link] - [Creation date]
```

对于 Github PR，使用 PR 的标题和描述进行分组。
对于 Notion 文档，使用完整文档内容进行分组。
对于 Linear 工单，使用工单的标题和描述。

确保：
- 文件中的所有链接都已归入某个项目。
- 文件遵循上面指定的格式。
- 不要截断链接列表。不要使用类似“...以及另外 75 个”的缩略形式。确保文档中完整显示所有 Github PR、Notion 文档和 Linear 工单。

### 步骤 7

搜索由“其他用户”创建的 Notion 文档。找出其中与工作总结中的项目相关的文档，并将这些 Notion 文档的链接添加到工作总结中的相应项目下。

### 步骤 8

向用户返回工作总结 Notion 文档的链接。

确保：
- 最终输出中包含实际的 Notion 文档链接。

## 资源

以下是 2025 年工作总结文档的示例：https://www.notion.so/sentry/Work-Summary-Feb-2025-Jan-2026-3068b10e4b5d81d3a40cfa6ad3fe1078?source=copy_link