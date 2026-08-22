---
name: load-pr-comments
description: Use to load open/unresolved PR review comments then aggregate them as tasks in .specs/comments/*.md for parallel agents to fix.
argument-hint: Optional PR number or URL - defaults to the PR of the current git branch
---
# 将未解决的 PR 审查评论加载为并行任务

仅加载处于开放/未解决状态的 PR 审查线程，并将其改写为分组的 Markdown 任务文件，保存到 `.specs/comments/*.md` 下，确保每个任务都可由不同的并行代理分别实现，且互不重叠。

## 关键准则

- 你必须仅加载 resolved 状态为 false 的线程。跳过已解决的线程。
- 你必须将每条评论改写为可执行的任务要求，而不是摘要。原样保留其实质内容（代码建议、确切指令）。
- 你绝不能在 GitHub 上发布、回复或修改任何内容。此 Skill 对 API 仅执行只读操作。
- 你必须对评论进行分组，确保每个文件都可独立实现，并且文件之间不存在任何重复内容。

## 第 0 步：确认可用的工具

1. 检查 GitHub CLI 是否已安装并完成身份验证：

   ```bash
   gh auth status
   ```

2. 检查 GitHub MCP 服务器是否可用：

   ```bash
   mcp__MCP_DOCKER__pull_request_read
   ```
   或者，如果是直接安装的，则使用不带 `MCP_DOCKER` 前缀的类似命令。

- 如果两者都可用，可使用其中任意一种，只要其拥有访问该仓库所需的足够权限。
- 如果 GitHub MCP 服务器可用，但结构不同，请进行调整以符合预期结构。
- 如果两者均不可用，对于公开仓库，尝试直接通过 curl 加载。对于私有仓库，请用户安装 GitHub CLI 或 GitHub MCP 服务器。
- 如果未安装 MCP 服务器，但已安装 GitHub CLI 且尚未完成身份验证，请用户运行 `gh auth login` 进行身份验证。

## 第 1 步：确定目标 PR

- 显式指定的 PR 参数始终优先于当前分支解析。如果传入了 PR 编号或 URL，则使用它（例如 URL `https://github.com/{owner}/{repo}/pull/{n}` → 编号 `{n}`），并且不要查询当前分支。
- 否则，默认使用当前分支对应的 PR：

```bash
gh pr view --json number,url,headRefName   # current branch's PR
```

- 解析仓库所有者/名称：`gh repo view --json owner,name`。
- 如果当前分支不存在对应的 PR，`gh pr view` 会返回错误 `"no pull requests found"`——立即停止并报告该分支未关联任何 PR（请用户提供 PR 编号/URL）。

## 第 2 步：检索未解决的评论

已解决/未解决状态属于 GraphQL 的 `reviewThreads { isResolved }` 概念——REST 的 `/pulls/{n}/comments` 端点不会公开该状态。使用以下两种方法之一；如果首选方法不可用，则回退到另一种方法。

### 首选方法：gh CLI（GraphQL）

直接在 jq 中筛选 `isResolved == false`：

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

这会返回每个尚未解决的线程，包括其文件 `path`、`isOutdated` 标志、可用的 `line`，以及按顺序排列的评论（作者、正文、永久链接 `url`、`diffHunk`）。

重要提示：对于已过时的线程，`line` 为 `null`（差异位置已发生移动）。上面的 jq 已通过 `line // startLine // originalLine` 进行回退，因此只要存在任一锚点，`line` 就不会为 null。当这三个值全都为 null 时，请在模板中完全省略 `:<line>` 部分——绝不要渲染 `path:null`。

### 回退方案：GitHub MCP

如果 GitHub MCP 服务器（`MCP_DOCKER`）可用，请使用 `mcp__MCP_DOCKER__pull_request_read` 工具，并将 `method` 设置为 `"get_review_comments"`：

```
mcp__MCP_DOCKER__pull_request_read
  method: "get_review_comments"
  owner: "OWNER"
  repo: "REPO"
  pullNumber: PR_NUMBER
  perPage: 100
```

它会返回 `review_threads[]`，每个线程都包含 `is_resolved`、`is_outdated`、`is_collapsed`（全部采用 snake_case——已根据此工具的响应验证）和 `comments[]`（`body`、`path`、`author`、`html_url`）。仅保留 `is_resolved` 为 `false` 的线程。请注意，MCP 评论对象会提供 `path`，但不会提供行号，因此请使用 `html_url` 作为位置锚点。当 `pageInfo.hasNextPage` 为 true 时，使用 `after: <endCursor>` 进行分页。

## 第 3 步：分组并改写为任务

将尚未解决的线程转换为适合并行代理处理的聚焦任务文件。

首先去重（在分组之前）：如果两个或更多线程要求在同一个 `path`（以及相同或重叠的行）进行同一项更改，或者包含完全相同的修复建议，请将它们合并为一项要求。不要为每个重复线程分别生成一个列表项——这一点对挑剔意见文件尤其重要，因为重复的琐碎建议往往会集中出现。

每个线程的改写规则：

- 去掉对话式措辞和作者姓名。输出任务，而不是对话记录。
- 如果人类审阅者留下了反馈，请将该反馈写为要求。
- 如果只有机器人/AI 建议（Claude、CodeRabbit、Copilot 等），请将该修复建议写为要求。
- 保留实质内容——不要通过总结而丢失代码块、建议的差异或准确措辞。
- 添加上下文：简短的问题描述，以及文件/行的链接（评论的 `url`/`html_url`，外加 `path:line`，如有）。如果 `line` 为 null（线程已过时或无法锚定），则只写 `path`，不添加 `:line` 部分，并注明该线程已过时。

改写前后示例（务必遵循“改写为任务，不要总结”）：

- 原始线程（机器人）：“commands 不正确，实际的 commands 更像是 ```/add-task /plan-task /implement-task```”
- 任务要求：“- [ ] 将列出的命令替换为正确的命令：`/add-task`、`/plan-task`、`/implement-task`”（逐字保留建议，去掉对话式措辞——而不是“修复命令”）。

分组规则：

- 按文件或功能分组，确保两个代理绝不会修改同一区域 → 不产生冲突、不重复工作。
- 不要将同一条评论重复放入多个文件。
- 将挑剔意见/琐碎的单行更改汇总到一个合并文件中（例如 `nitpicks.md`）。
- 文件总数限制为 ≤5。不要过度合并无关的更改——每个文件都必须是一个单一、聚焦且可独立实施的工作单元。

## 步骤 4：处理 .gitignore

确保生成的评论文件被忽略。此操作具有幂等性：仅在条目缺失时追加，并且如果 `.gitignore` 不存在，`>>` 会创建该文件。

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

汇总以下内容：目标 PR（编号 + url）、加载的未解决线程数量、创建的文件及其主题，以及任何被跳过的线程（已解决）或遇到的限制（例如 MCP 不可用）。

## 边界情况

| 情况 | 处理方式 |
|-----------|----------|
| 当前分支没有 PR | `gh pr view` 报错 → 报告错误并请求提供 PR 编号/URL |
| 参数是 URL | 提取 `/pull/` 后面的末尾编号 |
| 未解决线程数为零 | 不创建任何文件；报告“没有未解决的评论” |
| 超过 100 个线程 | 分页（GraphQL `after` 游标 / MCP `after`） |
| MCP 不可用 | 使用 gh GraphQL；如果两者都不可用，则报告限制 |
| 仅存在已解决的线程 | 全部跳过；报告没有可执行项 |