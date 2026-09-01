---
name: babysit
description: Watch a pull request or review cycle until it is ready to merge. Use when asked to babysit, monitor, or keep checking PR comments, reviews, and CI until all actionable issues are resolved.
---
# 看护 PR

持续跟进 PR，直到它真正干净。如果评论或审查线程仍未解决，不要在一轮检查后就停止。

## 工作流程

1. 确定 PR 编号、分支和基础分支。
2. 确认 PR 不是草稿，并检查可合并性、检查、审查决定、评论和审查线程。
3. 等待待处理的检查完成。以合适的间隔轮询，通常是 30-60 秒，除非用户要求其他频率。
4. 阅读新评论和未解决的审查线程。机器人摘要很有用，但要对照代码验证可执行的问题。
5. 以聚焦的提交修复真实问题，运行相关测试/构建，推送，然后回到第 2 步。
6. 只有在验证代码或生成的产物已解决评论后，才解决过期的审查线程。
7. 只有在检查通过或被有意跳过、审查决定可接受、没有剩余可执行评论、也没有剩余未解决审查线程时，才停止。

## GitHub CLI 检查

使用 `gh pr view` 查看整体状态：

```bash
gh pr view <number> --json \
  number,state,isDraft,mergeable,mergeStateStatus,reviewDecision,headRefOid,statusCheckRollup,url
```

在使用 GraphQL 前解析仓库的 owner/name：

```bash
repo_json=$(gh repo view --json owner,name)
owner=$(jq -r '.owner.login // .owner.name' <<<"$repo_json")
repo=$(jq -r '.name' <<<"$repo_json")
```

使用 GraphQL 查询未解决的审查线程。包含 `pageInfo`；在第一页省略 `cursor`，然后在 `hasNextPage` 为 `true` 时使用 `-f cursor="$cursor"` 传入上一个 `endCursor`。

```bash
gh api graphql \
  -f query='query($owner:String!,$repo:String!,$number:Int!,$cursor:String){repository(owner:$owner,name:$repo){pullRequest(number:$number){reviewThreads(first:100,after:$cursor){pageInfo{hasNextPage endCursor}nodes{id,isResolved,isOutdated,path,line,comments(last:1){nodes{author{login},body,createdAt,url}}}}}}}' \
  -f owner="$owner" -f repo="$repo" -F number=<number>
```

当 PR 可能有很多审查线程时，使用这个循环：

```bash
thread_query='query($owner:String!,$repo:String!,$number:Int!,$cursor:String){repository(owner:$owner,name:$repo){pullRequest(number:$number){reviewThreads(first:100,after:$cursor){pageInfo{hasNextPage endCursor}nodes{id,isResolved,isOutdated,path,line,comments(last:1){nodes{author{login},body,createdAt,url}}}}}}}'
cursor_args=()

while :; do
  page=$(gh api graphql -f query="$thread_query" -f owner="$owner" -f repo="$repo" -F number=<number> "${cursor_args[@]}")
  printf '%s\n' "$page" | jq -r '.data.repository.pullRequest.reviewThreads.nodes[]
    | select(.isResolved==false)
    | [.id,.path,(.line//""),(.isOutdated|tostring),(.comments.nodes[-1].author.login//""),(.comments.nodes[-1].body|gsub("\n";" ")|.[0:240])]
    | @tsv'

  jq -e '.data.repository.pullRequest.reviewThreads.pageInfo.hasNextPage' >/dev/null <<<"$page" || break
  cursor=$(jq -r '.data.repository.pullRequest.reviewThreads.pageInfo.endCursor' <<<"$page")
  cursor_args=(-f cursor="$cursor")
done
```

使用 `jq` 过滤未解决的线程：

```bash
jq -r '.data.repository.pullRequest.reviewThreads.nodes[]
  | select(.isResolved==false)
  | [.id,.path,(.line//""),(.isOutdated|tostring),(.comments.nodes[-1].author.login//""),(.comments.nodes[-1].body|gsub("\n";" ")|.[0:240])]
  | @tsv'
```

只有在修复已验证时，才解决过期线程：

```bash
gh api graphql \
  -f query='mutation($threadId:ID!){resolveReviewThread(input:{threadId:$threadId}){thread{id,isResolved}}}' \
  -f threadId=<thread-id>
```

## 操作规则

- 在长时间检查仍待处理时，保持看护流程运行。
- 如果生成的文件属于分发内容，请在解决评论前验证源文件和生成的产物一致。
- 如果机器人报告的是针对过期代码的问题，请确认线程是否已过期，或是否已在最新 head 中解决。
- 在最终报告前，对 PR 状态、未解决线程、最近评论和本地 `git status` 做一次全新排查。
- 报告具体证据：最新提交 SHA、检查名称和结果、未解决线程数量、已运行的测试，以及任何保持未修改的本地脏文件。
