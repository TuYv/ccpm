---
name: load-pr-comments
description: Use to load open/unresolved PR review comments then aggregate them as tasks in .specs/comments/*.md for parallel agents to fix.
---
# 将未解决的 PR 审查评论加载为并行任务

仅加载处于开放/未解决状态的 PR 审查线程，并将其重写为 `.specs/comments/*.md` 下的分组 markdown 任务文件，确保每个文件都可以由单独的并行代理实现，且彼此之间没有重叠。

## 关键指南

- 你**必须仅加载 resolved state 为 false 的线程**。跳过已解决的线程。
- 你**必须将每条评论重写为可执行的 TASK 要求**，而不是摘要。保留实质内容（代码建议、确切指令）不变。
- 你**不得在 GitHub 上发布、回复或修改任何内容**。此 skill 仅对 API 执行只读操作。
- 你**必须对评论进行分组**，使每个文件都可以独立实现，并且文件之间**不得有重复内容**。

## 步骤 0：验证有哪些工具可用

1. 检查是否已安装并完成身份验证的 GitHub CLI：

   ```bash
   gh auth status
   ```

2. 检查 GitHub MCP server 是否可用：

   ```bash
   mcp__MCP_DOCKER__pull_request_read
   ```
   或者，如果是直接安装的，则使用不带 `MCP_DOCKER` 前缀的类似命令。

- 如果两者都可用，使用对仓库具有足够访问权限的任意一个。
- 如果 github mcp server 可用但结构不同，请进行调整以符合预期结构。
- 如果两者都不可用，请尝试通过 curl 直接加载，前提是仓库为公开仓库。如果仓库为私有仓库，请要求用户安装 GitHub CLI 或 GitHub MCP server。
- 如果未安装 MCP server，但已安装 github cli 且未完成身份验证，请要求用户运行 `gh auth login` 完成身份验证。

## 步骤 1：解析目标 PR

- 显式传入的 PR 参数**始终优先**于当前分支解析。如果传入了 PR 编号或 URL，则使用它（类似 `https://github.com/{owner}/{repo}/pull/{n}` 的 URL → 编号 `{n}`），并且**不要**查询当前分支。
- 否则，默认使用**当前分支**对应的 PR：

```bash
gh pr view --json number,url,headRefName   # 当前分支的 PR
```

- 解析仓库 owner/name：

```bash
gh repo view --json owner,name
```

- 如果当前分支不存在 PR，`gh pr view` 会报错 `"no pull requests found"` — **停止并报告该分支没有关联的 PR**（要求用户提供 PR 编号/URL）。

## 步骤 2：获取未解决的评论

已解决/未解决状态是 GraphQL 中的 `reviewThreads { isResolved }` 概念 — REST `/pulls/{n}/comments` 端点不会公开此信息。使用以下两种方法之一；如果主要方法不可用，则回退到另一种方法。

### 主要方法：gh CLI（GraphQL）

直接在 jq 中过滤 `isResolved == false`：

```bash
gh api graphql -f query='
query($owner:String!,$repo:String!,$pr:Int!){
  repository(owner:$owner,name:$repo){
    pullRequest(number:$pr){
      reviewThreads(first:100){
        nodes {
          isResolved
          isOutdated
          path
          line
          startLine
          originalLine
          comments(first:50){
            nodes { author{login} body diffHunk url }
          }
        }
      }
    }
  }
}' -F owner=OWNER -F repo=REPO -F pr=PR_NUMBER \
  --jq '[.data.repository.pullRequest.reviewThreads.nodes[]
         | select(.isResolved==false)
         | {path, isOutdated,
            line: (.line // .startLine // .originalLine),
            comments: [.comments.nodes[]
             | {author: .author.login, url, body, diffHunk}]}]'
```

这会返回每个未解决线程及其文件 `path`、`isOutdated` 标志、可用的 `line`，以及按顺序排列的评论（作者、正文、永久链接 `url`、`diffHunk`）。

IMPORTANT：对于 OUTDATED 线程，`line` 为 `null`（diff 已移动）。上面的 jq 已经回退到 `line // startLine // originalLine`，因此只要存在任何定位点，`line` 就不会为 null。当这三个值全部为 null 时，在模板中完全省略 `:<line>` 片段——绝不要渲染 `path:null`。

### 回退方案：GitHub MCP

如果 GitHub MCP 服务器（`MCP_DOCKER`）可用，请使用 `mcp__MCP_DOCKER__pull_request_read` 工具，并设置 `method: "get_review_comments"`：

```
mcp__MCP_DOCKER__pull_request_read
  method: "get_review_comments"
  owner: "OWNER"
  repo: "REPO"
  pullNumber: PR_NUMBER
  perPage: 100
```

它会返回 `review_threads[]`，其中每个线程包含 `is_resolved`、`is_outdated`、`is_collapsed`（全部为 snake_case——已根据此工具的响应进行验证）以及 `comments[]`（`body`、`path`、`author`、`html_url`）。仅保留 `is_resolved` 为 `false` 的线程。请注意，MCP 评论对象提供 `path`，但不提供行号，因此应使用 `html_url` 作为位置锚点。当 `pageInfo.hasNextPage` 为 true 时，使用 `after: <endCursor>` 进行分页。

## 步骤 3：分组并改写为任务

将未解决的线程转换为面向并行代理的、重点明确的任务文件。

首先去重（分组之前）：如果两个或更多线程在同一个 `path` 的相同或重叠行上要求进行相同更改，或包含完全相同的建议修复，则将它们合并为一项需求。不要为每个重复线程分别输出一行——这在重复琐碎建议聚集的 nitpick 文件中尤其重要。

每个线程的改写规则：

- 删除对话语境和作者姓名。输出任务，而不是对话记录。
- 如果是 HUMAN reviewer 留下了反馈，将该反馈写成需求。
- 如果只有 bot/AI 建议存在（Claude、CodeRabbit、Copilot 等），将该修复建议写成需求。
- 保留实质内容——不要删去代码块、建议 diff 或精确措辞。
- 添加上下文：简短的问题描述，以及指向文件/行的链接（评论的 `url`/`html_url`，并在可用时附上 `path:line`）。如果 `line` 为 null（已过时/无法锚定的线程），只写 `path`，不要添加 `:line` 片段，并注明它已过时。

改写前/后示例（明确“改写为任务，而不是总结”）：

- 原始线程（bot）："commands is incorrect, real commands is more like ```/add-task /plan-task /implement-task```"
- 任务需求："- [ ] 将列出的命令替换为正确的命令：`/add-task`、`/plan-task`、`/implement-task`"（原建议保持原样，删除对话语境——不是“修复命令”。）

分组规则：

- 按文件或功能分组，使两个代理不会修改同一区域 → 无冲突、无重复工作。
- 不要在多个文件中重复同一条评论。
- 将 nitpick / 琐碎的一行修改汇总到一个组合文件中（例如 `nitpicks.md`）。
- 总文件数上限为 ≤5 个。不要将不相关的更改过度合并——每个文件都必须是一个单一、重点明确且可独立实现的工作单元。

## 步骤 4：处理 `.gitignore`

确保生成的评论文件会被忽略。此操作具有幂等性：仅当条目缺失时才追加，并且如果 `.gitignore` 不存在，`>>` 会创建它。

```bash
grep -qF '.specs/comments/*.md' .gitignore 2>/dev/null || printf '\n.specs/comments/*.md\n' >> .gitignore
```

## 步骤 5：写入文件

```bash
mkdir -p .specs/comments
```

使用以下模板，将每个分组写入 `.specs/comments/<kebab-topic>.md`：

```markdown
# Tasks: <focused topic, e.g. Fix incorrect command names in README-zh>

## <Topic 1>

File: `<path>:<line>` (omit `:<line>` when line is null; append " (outdated)" if isOutdated)
<Issue description for the change>

### Requirements

- [ ] <Reviewer requirement or bot fix suggestion, substance preserved>
- [ ] <Next requirement in this topic>

## <Topic 2>

File: `<path>:<line>` 
<Issue description for the change>

### Requirements

- [ ] <Reviewer requirement or bot fix suggestion, substance preserved>
- [ ] <Next requirement in this topic>

```

## 步骤 6：报告

总结：目标 PR（编号 + URL）、已加载的未解决线程数量、创建的文件及其主题，以及任何被跳过的线程（已解决）或遇到的限制（例如 MCP 不可用）。

## 边界情况

| 情况 | 处理方式 |
|-----------|----------|
| 当前分支没有 PR | `gh pr view` 报错 → 报告该情况并请求提供 PR 编号/URL |
| 参数是 URL | 提取 `/pull/` 后面的末尾编号 |
| 未解决线程数量为 0 | 不创建文件；报告“没有未解决的评论” |
| 线程数量 >100 | 分页（GraphQL `after` 游标 / MCP `after`） |
| MCP 不可用 | 使用 gh GraphQL；如果两者都不可用，则报告该限制 |
| 仅存在已解决的线程 | 跳过全部线程；报告没有可处理的线程 |