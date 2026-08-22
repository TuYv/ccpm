---
name: load-issues
description: Load all open issues from GitHub and save them as markdown files
argument-hint: None required - loads all open issues automatically
allowed-tools: Bash(gh issue:*), Bash(mkdir:*), Write
---
加载当前 GitHub 仓库中的所有开放 Issue，并将它们保存为 `./specs/issues/` 目录下的 Markdown 文件。

请按照以下步骤操作：

1. 使用 gh CLI 列出当前仓库中的所有开放 Issue：
   - 运行 `gh issue list --limit 100` 获取所有开放 Issue

2. 对于每个开放 Issue，获取详细信息：
   - 运行 `gh issue view <number> --json number,title,body,state,createdAt,updatedAt,author,labels,assignees,url`
   - 提取所有相关元数据

3. 创建 Issue 目录：
   - 运行 `mkdir -p ./specs/issues` 以确保该目录存在

4. 将每个 Issue 保存为单独的 Markdown 文件：
   - 文件命名格式：`<number-padded-to-3-digits>-<kebab-case-title>.md`
   - 示例：`007-make-code-review-trigger-on-sql-sh-changes.md`

5. 每个 Issue 文件使用以下 Markdown 模板：

```markdown
# Issue #<number>: <title>

**Status:** <state>
**Created:** <createdAt>
**Updated:** <updatedAt>
**Author:** <author.name> (@<author.login>)
**URL:** <url>

## Description

<body>

## Labels

<labels or "None">

## Assignees

<assignees or "None">
```

6. 保存所有 Issue 后，提供以下摘要：
   - 已加载的 Issue 总数
   - 已创建文件的列表，包括对应的 Issue 编号和标题

重要提示：请按正确顺序执行所有步骤，并确保所有 Issue 数据均已在 Markdown 文件中正确格式化。