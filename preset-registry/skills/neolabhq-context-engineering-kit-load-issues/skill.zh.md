---
name: load-issues
description: Load all open issues from GitHub and save them as markdown files
---
从当前 GitHub 仓库加载所有未关闭的 issue，并将其保存为 `./specs/issues/` 目录中的 Markdown 文件。

按照以下步骤操作：

1. 使用 gh CLI 列出当前仓库中的所有未关闭 issue：
   - 运行 `gh issue list --limit 100` 获取所有未关闭的 issue

2. 获取每个未关闭 issue 的详细信息：
   - 运行 `gh issue view <number> --json number,title,body,state,createdAt,updatedAt,author,labels,assignees,url`
   - 提取所有相关元数据

3. 创建 issues 目录：
   - 运行 `mkdir -p ./specs/issues` 确保目录存在

4. 将每个 issue 保存为单独的 Markdown 文件：
   - 文件命名格式：`<number-padded-to-3-digits>-<kebab-case-title>.md`
   - 示例：`007-make-code-review-trigger-on-sql-sh-changes.md`

5. 为每个 issue 文件使用以下 Markdown 模板：

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

6. 保存所有 issue 后，提供以下汇总信息：
   - 加载的 issue 总数
   - 已创建文件的列表，包括其 issue 编号和标题

重要事项：按照正确的顺序执行所有步骤，并确保所有 issue 数据都正确格式化并保存到 Markdown 文件中。