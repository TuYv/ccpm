# GitHub

## 概述
GitHub REST + GraphQL API — 代码托管平台（开发者工具原型）。

## 工作流

### 探索仓库
1. `searchRepos(q)` → 选择结果 → 从 `full_name` 获取 `owner`、`repo`
2. `getRepo(owner, repo)` → 描述、星标数、语言
3. `getRepoReadme(owner, repo)` → 经 base64 编码的 README 内容
4. `listIssues(owner, repo)` → 开放的议题
5. `listPullRequests(owner, repo)` → 开放的 PR

### 调查用户的工作
1. `getUserProfile(username)` → 个人简介、公开仓库数、关注者数
2. `searchRepos(q: "user:username")` → 该用户的仓库

### 提交议题
1. `searchRepos(q)` → 从 `full_name` 获取 `owner`、`repo`（或使用已知仓库）
2. `createIssue(owner, repo, title, body)` → `number`、`html_url`

### 管理议题
1. `listIssues(owner, repo)` → `issue_number`、`title`、`state`
2. `closeIssue(owner, repo, issue_number ← listIssues)` → `state: "closed"`
3. `reopenIssue(owner, repo, issue_number ← listIssues)` → `state: "open"`
4. `createComment(owner, repo, issue_number ← listIssues, body)` → `comment_id`、`html_url`
5. `deleteComment(owner, repo, comment_id ← createComment)` → 204

### 为仓库加星标／关注仓库
1. `searchRepos(q)` → 从 `full_name` 获取 `owner`、`repo`
2. `starRepo(owner, repo)` → 204
3. `unstarRepo(owner, repo)` → 204
4. `watchRepo(owner, repo)` → `subscribed`
5. `unwatchRepo(owner, repo)` → 204

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchRepos | 查找仓库 | q | total_count, items[].full_name, stargazers_count, language | 入口点，支持分页 |
| getRepo | 仓库详情 | owner, repo | full_name, description, stargazers_count, forks_count, language | 入口点 |
| getUserProfile | 用户资料 | username | login, name, bio, public_repos, followers, following | 入口点 |
| getRepoReadme | 仓库 README | owner ← getRepo, repo ← getRepo | name, content (base64), encoding | |
| listIssues | 仓库议题 | owner ← getRepo, repo ← getRepo | number, title, state, user.login, labels | 支持分页 |
| listPullRequests | 仓库 PR | owner ← getRepo, repo ← getRepo | number, title, state, user.login, head.ref, base.ref | 支持分页 |
| listContributors | 仓库贡献者 | owner ← getRepo, repo ← getRepo | login, contributions | 支持分页 |
| createIssue | 创建议题 | owner ← getRepo, repo ← getRepo, title, body | number, html_url | 写操作，谨慎 |
| closeIssue | 关闭议题 | owner, repo, issue_number ← listIssues | data（GraphQL 响应） | 写操作，谨慎。通过 github.com `/_graphql` 路由 |
| reopenIssue | 重新打开已关闭的议题 | owner, repo, issue_number ← listIssues | data（GraphQL 响应） | 写操作，谨慎 — closeIssue 的逆操作。通过 github.com `/_graphql` 路由 |
| createComment | 对议题／PR 发表评论 | owner, repo, issue_number ← listIssues, body | id, body, html_url | 写操作，谨慎 |
| deleteComment | 删除评论 | owner, repo, comment_id ← createComment | — (204) | 写操作，谨慎 — createComment 的逆操作 |
| forkRepo | 复刻仓库 | owner ← getRepo, repo ← getRepo | full_name | 写操作，谨慎 |
| starRepo | 为仓库加星标 | owner ← getRepo, repo ← getRepo | — (204) | 写操作，安全。（api.github.com — 目前被 cookie_session 拒绝，参见 DOC.md） |
| unstarRepo | 取消仓库星标 | owner ← getRepo, repo ← getRepo | count（关注者数量） | 写操作，谨慎 — starRepo 的逆操作。通过 github.com rails 端点路由 |
| watchRepo | 关注仓库 | owner ← getRepo, repo ← getRepo | count（关注者数量） | 写操作，谨慎。通过 github.com `/notifications/subscribe` 路由 |
| unwatchRepo | 取消关注仓库 | owner ← getRepo, repo ← getRepo | count（关注者数量） | 写操作，谨慎 — watchRepo 的逆操作。通过 github.com `/notifications/subscribe` 路由 |
| graphqlQuery | 执行 GraphQL | query, variables | data | 写操作（可能执行不受限制的 mutation） |

## 快速开始

```bash
# Search repositories
openweb github exec searchRepos '{"q":"react language:typescript","per_page":5}'

# Get repository details
openweb github exec getRepo '{"owner":"anthropics","repo":"claude-code"}'

# List issues
openweb github exec listIssues '{"owner":"anthropics","repo":"claude-code","per_page":5}'

# Get user profile
openweb github exec getUserProfile '{"username":"anthropics"}'

# Close an issue
openweb github exec closeIssue '{"owner":"imoonkey","repo":"openweb-test","issue_number":1,"state":"closed"}'

# Comment on an issue
openweb github exec createComment '{"owner":"imoonkey","repo":"openweb-test","issue_number":1,"body":"Looks good!"}'

# Star / unstar a repo
openweb github exec starRepo '{"owner":"imoonkey","repo":"openweb-test"}'
openweb github exec unstarRepo '{"owner":"imoonkey","repo":"openweb-test"}'

# Watch / unwatch a repo
openweb github exec watchRepo '{"owner":"imoonkey","repo":"openweb-test"}'
openweb github exec unwatchRepo '{"owner":"imoonkey","repo":"openweb-test"}'
```

## 已知限制

- **`closeIssue`、`reopenIssue`、`watchRepo`、`unwatchRepo`、`unstarRepo` 通过 github.com Web UI 路由**（传输方式：page），而不是通过 api.github.com REST。它们使用用户的 `_gh_sess` 浏览器 Cookie、从页面抓取的 `X-Fetch-Nonce`，以及每个表单对应的 `authenticity_token`。验证结果：5/5 通过（2026-04-19）。用于关闭/重新打开议题的持久化查询哈希已硬编码，并且**会随着 GitHub Web 版本发布而发生变化**——失效时，请通过 DevTools 中实际点击操作产生的 `_graphql` 请求重新捕获。
- **`starRepo`、`createIssue`、`createComment`、`deleteComment`、`forkRepo`、`graphqlQuery` 仍以 api.github.com 为目标**，并继续受到 Cookie 会话/Bearer 不匹配问题的影响。同样可采用 Web 重写模式（参见 `adapters/github-web.ts`）。
- 对公开仓库的读取操作无需身份验证即可使用（速率限制为每小时 60 个请求）；通过 Cookie 进行身份验证的读取操作也可使用（每小时 5000 个请求）。