---
name: resolve-fixed-pr-comments
description: Verify what PR review comments have been addressed (committed/pushed OR uncommitted local changes) and resolve the threads that are genuinely fixed or no longer relevant.
---
# 解决已修复的 PR 审查评论

仅加载处于打开/未解决状态的 PR 审查线程，对照代码库的当前状态逐一验证（修复可能已经提交/推送，也可能仅存在于尚未提交的本地更改中——两者都算），并且仅解决那些确实已修复或不再相关的线程。唯一允许的写入操作是解决线程。不得触碰其他任何内容。

## 关键准则

**违反这些规则中的任何一条都意味着任务失败。** 如果任务失败，你将被杀死！

- 如果不确定，请让线程保持未解决状态。宁可让已修复的评论保持未解决，也不要错误地解决尚未修复的评论。
- 你必须仅加载 `isResolved`/`is_resolved` 为 false 的线程。跳过已解决的线程。
- 你必须仅观察代码库的当前状态。读取文件现在的实际内容。不得根据代码过去的状态、某次提交所做的更改或 Git 历史来判断修复情况——唯一有效的判断依据是当前文件是否满足要求。
- 无论修复已经提交/推送，还是仅存在于尚未提交的本地更改中，都是有效的。两者均可作为证据。按工作区的当前状态进行检查。
- 你不得修改代码、创建/编辑/删除任何文件，也不得运行测试、代码检查工具、格式化工具或构建。
- 你不得执行推送、拉取、提交、暂存、检出、切换、重置、还原、变基、合并、拣选提交或任何会更改状态的 Git 操作。仅允许执行只读检查（`git status`、`git diff`、`git log`、`git branch`），且只能用于观察当前状态。
- 你不得在 PR 中添加评论、回复线程、提交审查、批准或请求更改。对 GitHub 唯一允许的写入操作是解决确实已修复的线程。
- 你必须保持批判性并追求完美。仅当评论中的所有要求都已在当前代码库中得到完全满足时，才算“已修复”。仅部分处理的评论、尚未处理的细节建议以及“差不多”的更改，都应保持未解决状态。
- 你不得解决任何未对照实际文件进行验证的线程。未验证 → 不解决。

## 危险信号——停止并保持未解决

如果你的推理符合以下任何一种情况，请勿解决该线程：

- “修复可能已经在那里了，我直接解决吧。” → 不行。对照当前文件进行验证，否则保持未解决。
- “提交消息说已经修复了。” → 提交消息和历史记录不能作为证据。读取当前文件。
- “评论中的大部分问题已经处理了。” → 部分处理 ≠ 已修复。保持未解决。
- “这只是个细节建议，解决它能让 PR 更整洁。” → 尚未处理的细节建议应保持未解决。
- “代码已经移动，所以它不再相关了。” → 仅当该要求在当前代码中确实已得到满足或确实已经过时时，才能解决——不能仅仅因为难以验证就解决。
- “我自己快速修一下，然后解决。” → 禁止。不得编辑代码。如果它尚未修复，就让它保持未解决。
- “我会回复说明为什么解决它。” → 禁止。不得回复或评论。静默解决，或者保持未解决。
- “这个分支看起来已经完成了，所以我会把所有线程都解决掉。” → 必须逐个线程解决，每个线程都要有各自经过验证的证据。

### 合理化借口对照表

| 借口 | 事实 |
|--------|---------|
| “修复已经提交，所以完成了。” | 阅读当前文件并确认要求已得到满足。已提交 ≠ 已验证。 |
| “Git diff 显示了这项更改。” | diff 只反映历史变化。应确认当前文件内容满足要求，而不是仅仅确认发生过更改。 |
| “它还未提交，所以暂时不算数。” | 未提交的本地更改同样是有效证据。按工作树的当前状态进行检查。 |
| “我只要做个小修复，然后解决讨论就行了。” | 严禁编辑代码。未修复 → 不解决。 |
| “回复一下比较礼貌。” | 不要回复或评论。唯一允许的写入操作是解决讨论。 |
| “吹毛求疵的问题无关紧要，解决掉让页面整洁些。” | 无论问题多么微不足道，只要尚未处理，就不能解决讨论。 |
| “审查者显然会接受这一点。” | 你不是审查者。只能根据要求是否已满足来解决讨论，而不能根据对审查结果的预测来决定。 |
| “不能 100% 确定，但很可能已经修复了。” | 不确定 = 保持未解决状态。 |

## 使用方法

一次处理一个讨论线程：(1) 加载未解决的讨论线程及其 GraphQL 节点 `id`；(2) 对每个线程，读取其引用的当前文件，并依据现有内容检查每一项要求；(3) 只有在要求已完全满足或已过时的情况下才解决讨论，否则跳过。报告解决了哪些讨论、保留了哪些讨论以及相应原因。

## 第 0 步：验证有哪些工具可用

1. 检查 GitHub CLI 是否已安装并完成身份验证：

   ```bash
   gh auth status
   ```

2. 检查 GitHub MCP 服务器是否可用：

   ```bash
   mcp__MCP_DOCKER__pull_request_read
   ```
   如果是直接安装，也可以使用不带 `MCP_DOCKER` 前缀的类似命令。

- 如果两者都可用，可以使用其中任何一个，只要它对仓库拥有足够的访问权限。
- 如果 GitHub MCP 服务器可用，但其结构不同，请进行调整以适配预期结构。
- 如果两者均不可用，在公共仓库的情况下，尝试通过 curl 直接加载。如果是私有仓库，请用户安装 GitHub CLI 或 GitHub MCP 服务器。
- 如果未安装 MCP 服务器，但已安装 GitHub CLI 且尚未完成身份验证，请用户运行 `gh auth login` 进行身份验证。

## 第 1 步：确定目标 PR

- 显式指定的 PR 参数始终优先于根据当前分支确定 PR。如果传入了 PR 编号或 URL，请使用该参数（例如 URL `https://github.com/{owner}/{repo}/pull/{n}` → 编号 `{n}`），并且不要查询当前分支。
- 否则，默认使用当前分支对应的 PR：

```bash
gh pr view --json number,url,headRefName   # current branch's PR
```

- 获取仓库所有者和名称：`gh repo view --json owner,name`。
- 如果该分支不存在对应的 PR，`gh pr view` 会报错并显示 “no pull requests found”——立即停止，并报告该分支没有关联的 PR（请用户提供 PR 编号或 URL）。

## 第 2 步：获取未解决的评论

已解决/未解决状态是 GraphQL 的 `reviewThreads { isResolved }` 概念——REST `/pulls/{n}/comments` 端点不会公开该状态。使用以下两种方法之一；如果主要方法不可用，则改用另一种方法。

### 首选：gh CLI (GraphQL)

直接在 jq 中筛选 `isResolved == false`：

```bash
gh api graphql -f query='
query($owner:String!,$repo:String!,$pr:Int!){
  repository(owner:$owner,name:$repo){
    pullRequest(number:$pr){
      reviewThreads(first:100){
        nodes {
          id
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
         | {id, path, isOutdated,
            line: (.line // .startLine // .originalLine),
            comments: [.comments.nodes[]
             | {author: .author.login, url, body, diffHunk}]}]'
```

这会返回每个未解决的线程，包括其 GraphQL 节点 `id`（在第 4 步中解决该线程时需要）、文件 `path`、`isOutdated` 标志、可用的 `line`，以及按顺序排列的评论（作者、正文、永久链接 `url`、`diffHunk`）。

重要：对于 OUTDATED 线程，`line` 为 `null`（差异位置已发生变化）。上面的 jq 已经使用 `line // startLine // originalLine` 进行回退，因此只要存在任意锚点，`line` 就不会为空。当这三个值全部为 null 时，请在模板中完全省略 `:<line>` 段——绝不要渲染 `path:null`。

### 后备方案：GitHub MCP

如果 GitHub MCP 服务器（`MCP_DOCKER`）可用，请使用 `mcp__MCP_DOCKER__pull_request_read` 工具，并将 `method` 设为 `"get_review_comments"`：

```
mcp__MCP_DOCKER__pull_request_read
  method: "get_review_comments"
  owner: "OWNER"
  repo: "REPO"
  pullNumber: PR_NUMBER
  perPage: 100
```

它会返回 `review_threads[]`，其中每个线程都包含 `is_resolved`、`is_outdated`、`is_collapsed`（全部采用 snake_case——已根据该工具的响应验证）以及 `comments[]`（`body`、`path`、`author`、`html_url`）。仅保留 `is_resolved` 为 `false` 的线程。请注意，MCP 评论对象会提供 `path`，但不会提供行号，因此请使用 `html_url` 作为位置锚点。当 `pageInfo.hasNextPage` 为 true 时，使用 `after: <endCursor>` 进行分页。

> MCP 审查线程对象还包含线程节点 `id`（即 `PRRT_...` 节点 ID）。请为每个线程捕获该值——第 4 步中使用 `method: "resolve_thread"` 调用 `mcp__MCP_DOCKER__pull_request_review_write` 时需要它。

## 第 3 步：根据当前代码库验证每个线程

对于每个未解决的线程，提取具体要求，并根据当前文件内容进行验证。严格遵循关键准则。

1. 确定评论实际要求的内容。如果某位真人审查者留下了反馈，则要求就是该反馈。如果只有机器人/AI 建议（Claude、CodeRabbit、Copilot 等），则要求就是其建议的修复方案。一个线程可能包含多个要求——必须满足所有要求，才能视为已修复。
2. 打开 `path` 所引用的文件并读取当前内容（使用 Read 工具；不需要使用 `git show :<path>`——只需读取工作树中的文件）。可以选择运行 `git diff -- <path>` 或 `git status`，但仅用于查看当前未提交的更改；绝不要将其作为推断历史记录的证据。
3. 确定处理结论：

| 处置结果 | 条件 | 操作 |
|-------------|-----------|--------|
| FIXED | 当前文件内容（已提交或未提交）完全满足该讨论串中的所有要求。 | 标记为在步骤 4 中解决。 |
| OBSOLETE | 评论所指的代码确实已不存在，或相关问题在当前代码中确实已无实际意义。 | 标记为在步骤 4 中解决。 |
| NOT FIXED | 任何要求尚未满足、仅部分满足，或你无法根据当前文件确认其已满足。 | 保持未解决。不要执行任何操作。 |
| UNSURE | 你无法有把握地验证要求是否已满足。 | 保持未解决。不要执行任何操作。 |

不要为了让讨论串通过验证而编辑代码。不要运行测试、构建或代码检查工具来“检查”。验证是指阅读当前源代码，并判断要求是否已满足。

## 步骤 4：解决确实已修复的讨论串

对于每个标记为 FIXED 或 OBSOLETE 的讨论串，使用步骤 2 中获取的讨论串节点 `id` 将其解决。使用任何可用的途径（优先使用你加载评论时所用的途径）。解决一个已经解决的讨论串是无害的空操作。

### 主要方式：gh CLI（GraphQL `resolveReviewThread` mutation）

`resolveReviewThread` mutation 接受一个 `ResolveReviewThreadInput`，其必填字段为 `threadId`（即步骤 2 中 `reviewThreads.nodes[].id` 的 GraphQL 节点 `id`）。已通过内省对照 GitHub 的 GraphQL schema 验证（`ResolveReviewThreadInput.threadId: ID!`）。

```bash
gh api graphql -f query='
mutation($threadId:ID!){
  resolveReviewThread(input:{threadId:$threadId}){
    thread { id isResolved }
  }
}' -F threadId='PRRT_kwDOxxxxxxxxxxxxxxxx'
```

成功时，响应为 `{"data":{"resolveReviewThread":{"thread":{"id":"PRRT_...","isResolved":true}}}}`。确认 `isResolved` 为 `true`。

### 备用方式：GitHub MCP（`pull_request_review_write` → `resolve_thread`）

GitHub MCP 服务器可以通过 `mcp__MCP_DOCKER__pull_request_review_write` 并将 `method` 设为 `"resolve_thread"` 来解决讨论串。它只需要 `threadId`（讨论串节点 ID，例如 `PRRT_kwDOxxx`）。根据该工具自身的文档，此方法不使用 `owner`/`repo`/`pullNumber`，但工具 schema 将它们标记为必填项——请传入 PR 的 owner/repo/pullNumber 以通过验证；在解决操作中，它们会被忽略。

```
mcp__MCP_DOCKER__pull_request_review_write
  method: "resolve_thread"
  threadId: "PRRT_kwDOxxxxxxxxxxxxxxxx"
  owner: "OWNER"
  repo: "REPO"
  pullNumber: PR_NUMBER
```

如果 MCP 服务器不可用，或其 `pull_request_review_write` 不包含 `resolve_thread`，请改用上面的 gh CLI GraphQL mutation。

> 仅允许使用 `resolve_thread`。不要使用 `unresolve_thread`、`create`、`submit_pending`、`delete_pending` 或任何 `event`（APPROVE/REQUEST_CHANGES/COMMENT）——这些都属于本 skill 禁止的写入操作。

### 参数说明

| 参数 | 途径 | 类型 | 必填 | 说明 |
|-----------|------|------|----------|-------------|
| `threadId` | gh CLI 和 MCP | string (`ID!`) | 是 | 评审讨论串的 GraphQL 节点 id（`reviewThreads.nodes[].id`，例如 `PRRT_kwDO...`）。这是讨论串 id，不是评论 id，也不是数字形式的 REST id。 |
| `method` | MCP | string | 是（MCP） | 必须为 `"resolve_thread"`。 |
| `owner` | MCP | string | 是（MCP schema） | 仓库所有者。`resolve_thread` 会忽略此参数，但工具 schema 要求必须提供。 |
| `repo` | MCP | string | 是（MCP schema） | 仓库名称。`resolve_thread` 会忽略此参数，但工具 schema 要求必须提供。 |
| `pullNumber` | MCP | number | 是（MCP schema） | PR 编号。`resolve_thread` 会忽略此参数，但工具 schema 要求必须提供。 |
| `clientMutationId` | gh CLI | string | 否 | GraphQL input 中可选的去重 token。通常省略。 |

## 第 5 步：报告

汇总结果，不采取任何进一步操作：

- 目标 PR（编号 + url）。
- 已加载的未解决讨论数量。
- 已解决的讨论，每项包含其 `path:line`（如果已过时，则为 `path`）、一行原因（FIXED / OBSOLETE），以及当前代码中的证据。
- 保持未解决的讨论，每项包含一行原因（NOT FIXED / partial / UNSURE）。
- 遇到的任何限制（例如 MCP 不可用、所有讨论均已解决）。

## 示例

**输入：** `resolve-fixed-pr-comments`（无参数，当前分支有 PR #42）

**过程：** 加载 PR #42 的未解决讨论（第 2 步）。讨论 A 位于 `src/auth.ts:30`，要求“为无效令牌添加错误处理”。读取当前的 `src/auth.ts`——现在令牌检查已由 `try/catch` 包裹（未提交的本地更改）。处置结果为 FIXED → 通过 `resolveReviewThread(threadId: "PRRT_...")` 解决。讨论 B 位于 `README.md:10`，是一条细节意见：“修正拼写错误 'teh'”。读取当前的 `README.md`——仍然写着“teh”。处置结果为 NOT FIXED → 保持未解决。

**输出：** “PR #42：已加载 2 个未解决讨论。已解决 1 个——src/auth.ts:30（FIXED：工作树中已在令牌验证周围添加 try/catch）。保持未解决 1 个——README.md:10（NOT FIXED：'teh' 拼写错误仍然存在）。”

**输入：** `resolve-fixed-pr-comments https://github.com/acme/app/pull/7`

**过程：** 参数优先于当前分支。PR #7。有一个讨论要求将 `getUser` → `fetchUser`，并更新其调用方。当前代码已重命名该函数，但一个调用方仍在使用 `getUser`。要求仅得到部分满足 → NOT FIXED → 保持未解决。

**输出：** “PR #7：已加载 1 个未解决讨论。已解决 0 个。保持未解决 1 个——src/user.ts:12（NOT FIXED：函数已重命名，但 src/page.ts:5 中的调用方仍在调用 getUser）。”

## 故障排除 / 常见问题

| 情况 | 处理方式 |
|-----------|----------|
| 当前分支没有 PR | `gh pr view` 报错 → 报告该问题并请求提供 PR 编号/URL。 |
| 参数是 URL | 提取 `/pull/` 后面的末尾编号。 |
| 未解决讨论为零 | 不解决任何内容；报告“没有未解决评论”。 |
| >100 个讨论 | 在验证前进行分页（GraphQL `after` 游标 / MCP `after`）。 |
| MCP 不可用 | 使用 gh GraphQL 加载和解决讨论；如果两者都不可用，则报告限制。 |
| MCP `resolve_thread` 因缺少 owner/repo/pullNumber 而拒绝请求 | 即使该方法会忽略这些字段，工具 schema 仍要求提供它们——传入该 PR 的 owner/repo/pullNumber。 |
| `Could not resolve to a node with the global id` | id 错误——确保传入的是来自 `reviewThreads.nodes[].id` 的讨论节点 `id`（`PRRT_...`），而不是评论 id 或数字 REST id。 |
| 对你并非有意处理的讨论，解决变更返回 `isResolved: true` | 你解决了错误的讨论——此技能不允许安全地自动撤销（取消解决是一种被禁止的写入操作）；向用户报告该情况。 |
| 修复仅存在于未提交的更改中 | 可作为有效证据——检查工作树文件，如果要求已满足，则解决讨论。 |
| 无法通过当前文件确认某项要求 | 保持该讨论处于 UNRESOLVED 状态。绝不基于假设解决讨论。 |
| 想要编辑代码以使讨论通过 | 禁止。不得修改代码。未修复的内容保持未解决。 |