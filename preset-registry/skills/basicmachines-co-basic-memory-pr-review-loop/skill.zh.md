---
name: pr-review-loop
description: Enforce the Basic Machines GitHub PR review loop before merging. Use whenever Codex is preparing to merge, squash-merge, auto-merge, declare a PR ready, monitor Codex comments, address review feedback, or wait for Codex approval on a GitHub PR, especially when the user says "approved", "merge", "ship", "PR is ready", "monitor Codex comments", or "address Codex feedback".
---
# PR 审查循环

## 硬性规则

不要仅仅因为 CI 已通过、分支可合并、审查线程已过时，或者当前没有可见的 Codex 线程，就合并 PR。

只有在满足以下条件之一时才能合并：

- Codex 已完成对最新 head 的审查，并留下了明确的点赞批准信号。
- 用户使用类似“无需等待 Codex 批准即可合并”或“绕过 Codex 门禁”的措辞，明确要求绕过此门禁。

Codex 通常会在 PR 描述/正文自身（即 GitHub Issue/PR 对象）上以表情回应的形式留下点赞，而不是在其“Codex Review”Issue 评论上。不要只检查 Issue 评论。

如果 Codex 在 PR 正文或相关评论上最新留下的新鲜表情回应是眼睛，则表示它正在审查。请等待并持续检查。

如果 Codex 留下的评论、审查正文或行内线程中包含实质性反馈，则该 PR 尚未获批。请自行判断：如果评论正确，就修复代码；如果评论错误或有意不值得修改，则回复并提供依据。无问题总结或仅含样板内容的审查正文不构成阻塞，但也不能替代必需的点赞。

## 信号

- PR 正文或评论上的眼睛表情回应：如果它比同一位置上最近的新鲜点赞更新，则表示尚在等待中。
- `chatgpt-codex-connector[bot]` 在 PR 正文/描述上的点赞表情回应：Codex 批准/没有建议。这是常见的批准信号。
- `chatgpt-codex-connector[bot]` 在 Codex Issue 评论上的点赞表情回应：同样是批准信号，但这并不是唯一需要查看的位置。
- Codex Issue 评论中写着“Didn't find any major issues”：这属于类似批准的上下文，但仍需确认 PR 正文/评论上的点赞，或者取得用户的明确绕过授权。
- 每个参与者针对当前最新 head 的 Codex 审查中，如果最新一条的状态为 `CHANGES_REQUESTED` 或包含实质性审查正文：即使没有行内线程，也属于阻塞性反馈。
- 包含实质性反馈的 Codex 评论、审查正文或审查线程：在完成处理、回复清晰的理由，或用户明确要求绕过之前，均会阻塞合并。
- 已过时的 Codex 评论：可作为有用的历史记录，但不代表批准。
- 空的 `reviewDecision`、`mergeable: MERGEABLE`、`mergeStateStatus: CLEAN` 和已通过的检查：这些都是必要的上下文，但并不代表 Codex 已批准。

## 循环工作流

1. 确定 PR 和当前 head SHA。

```bash
gh pr view <number> --json number,url,headRefOid,headRefName,mergeable,mergeStateStatus,statusCheckRollup
```

2. 读取最新 head 上的 Codex 状态。检查 Codex 可以留下状态的每一个 GitHub 位置：

- PR 正文/描述的表情回应：批准点赞可能位于此处。
- PR Issue 评论：Codex 会在此处发布“Codex Review”总结，其中包括已审查的提交。
- PR 审查和行内审查评论：Codex 会在此处发布可操作的问题。
- 审查线程：未解决且未过时的 Codex 线程在多次推送后仍会继续阻塞。不要根据单条评论中记录的放置提交来推断线程状态。

在 Codex 此前批准之后进行的任何代码推送，都会使该批准失效。对 PR 正文的实质性编辑应针对描述重新启动循环，但不会使代码 head 的审查失效，除非该编辑改变了审查范围。

首先检查 PR 正文的回应，并验证回应者身份，以及该回应对于当前 head 和当前 PR 描述是否仍然是最新的。状态汇总的范围限定为当前 head SHA，而 GraphQL `lastEditedAt` 会记录之后对 PR 对象所做的编辑。使用两者中较晚的时间戳作为批准时间的下限：

```bash
head_state_json="$(
  gh pr view <number> --json headRefOid,statusCheckRollup
)" || exit 1
head_sha="$(printf '%s' "$head_state_json" | jq -r '.headRefOid')"
head_started_at="$(
  printf '%s' "$head_state_json" \
    | jq -r '[.statusCheckRollup[] | .startedAt // empty] | min // empty'
)"

edit_state_json="$(
  gh api graphql \
    -F owner=<owner> \
    -F name=<repo> \
    -F number=<number> \
    -f query='query($owner:String!,$name:String!,$number:Int!){
      repository(owner:$owner,name:$name){
        pullRequest(number:$number){headRefOid lastEditedAt}
      }
    }'
)" || exit 1
edit_head_sha="$(
  printf '%s' "$edit_state_json" \
    | jq -r '.data.repository.pullRequest.headRefOid'
)"
body_edited_at="$(
  printf '%s' "$edit_state_json" \
    | jq -r '.data.repository.pullRequest.lastEditedAt // empty'
)"

if [ "$edit_head_sha" != "$head_sha" ]; then
  echo "Head changed while checking review state; reaction is not approval."
  exit 1
fi

body_reactions_available=true
if [ -z "$head_started_at" ]; then
  body_reactions_available=false
  approval_not_before="$body_edited_at"
  echo "No timestamped current-head checks; skipping PR-body reactions."
else
  approval_not_before="$(
    jq -nr \
      --arg head_started_at "$head_started_at" \
      --arg body_edited_at "$body_edited_at" \
      '[$head_started_at, $body_edited_at]
      | map(select(length > 0))
      | max // empty'
  )"
fi

if [ "$body_reactions_available" = true ]; then
  reactions_json="$(
    gh api "repos/<owner>/<repo>/issues/<number>/reactions" --paginate --slurp \
      -H "Accept: application/vnd.github+json"
  )"

  echo "Fresh Codex reaction state:"
  printf '%s' "$reactions_json" \
    | jq --arg approval_not_before "$approval_not_before" '
      def latest_reaction($content):
        [.[][]
        | select(.user.login == "chatgpt-codex-connector[bot]"
          and .content == $content
          and .created_at >= $approval_not_before)
        | {content, created_at, user: .user.login}]
        | sort_by(.created_at)
        | last // null;

      {approval: latest_reaction("+1"), pending: latest_reaction("eyes")}
      | .state = (
          if .approval != null
            and (.pending == null
              or .approval.created_at > .pending.created_at)
          then "approved"
          elif .pending != null then "pending"
          else "none"
          end
        )'
fi
```

`gh pr view --json reactionGroups` 可用于查看计数，但它不会显示是哪位用户作出了回应。使用上面的 REST 回应端点来证明 Codex 是在当前 head 活动开始且 PR 对象最后一次编辑之后留下点赞的。回应状态为 `approved` 时，即满足关卡中的回应部分。`pending` 表示最新的有效信号是注视表情，因此应继续等待；时间更新的点赞会取代较早的注视回应。如果当前 head 没有带时间戳的状态/检查活动，请跳过 PR 正文回应，并继续执行下方的审查和议题评论检查，而不是退出工作流。

然后检查 Codex 议题评论，并确认最新的「Reviewed commit」与当前头部提交的前缀匹配：

```bash
gh api "repos/<owner>/<repo>/issues/<number>/comments" --paginate \
  --slurp \
  | jq '[.[][] | select(.user.login | test("chatgpt-codex-connector"))
    | {id, created_at, html_url, body: .body[0:240]}]'
```

如果跳过了 PR 正文回应，则只能使用明确指出当前头部提交的议题评论，并且当 `body_edited_at` 非空时，该评论必须创建于此次编辑之后。其点赞回应还必须通过下文的操作者和 `approval_not_before` 检查。

顶层拉取请求审查与议题评论及审查线程属于不同的 API 接口。获取所有分页，并检查针对当前确切头部提交所提交的 Codex 审查：

```bash
head_sha="$(gh pr view <number> --json headRefOid --jq '.headRefOid')"

gh api "repos/<owner>/<repo>/pulls/<number>/reviews" --paginate --slurp \
  | jq --arg head_sha "$head_sha" \
    '[.[][]
    | select((.user.login | test("chatgpt-codex-connector"))
      and .commit_id == $head_sha)
    | {id, user: .user.login, state, submitted_at, html_url, body}]
    | sort_by(.user, .submitted_at, .id)
    | group_by(.user)
    | map(last)'
```

对于每个 Codex 操作者，只评估返回的、针对当前头部提交的最新审查；较新的审查会取代该操作者之前针对同一头部提交的顶层状态。最新的 `CHANGES_REQUESTED` 审查会造成阻塞。阅读每条最新的非空审查正文，并处理其中所有实质性发现，即使该审查没有内联线程也是如此。仅包含样板文本、只是随附于内联发现的 `COMMENTED` 审查，在这些发现得到解决后不会构成额外阻塞；它也不是批准信号。下文的审查线程解决状态仍是一项独立的门禁，绝不会仅因顶层审查历史而被取代。

对于相关的 Codex 议题评论，按操作者验证所有批准回应。评论上的汇总回应计数无法表明回应者的身份：

```bash
gh api "repos/<owner>/<repo>/issues/comments/<comment-id>/reactions" \
  --paginate --slurp \
  -H "Accept: application/vnd.github+json" \
  | jq --arg approval_not_before "$approval_not_before" '
    def latest_reaction($content):
      [.[][]
      | select(.user.login == "chatgpt-codex-connector[bot]"
        and .content == $content
        and .created_at >= $approval_not_before)
      | {content, created_at, user: .user.login}]
      | sort_by(.created_at)
      | last // null;

    {approval: latest_reaction("+1"), pending: latest_reaction("eyes")}
    | .state = (
        if .approval != null
          and (.pending == null
            or .approval.created_at > .pending.created_at)
        then "approved"
        elif .pending != null then "pending"
        else "none"
        end
      )'
```

最后，查询 GraphQL 审查线程。GitHub 会在 REST 载荷中记录评论位置对应的 SHA，但只有线程会显示在后续推送后反馈是否仍处于未解决且未过时状态：

```bash
gh api graphql --paginate --slurp \
  -F owner=<owner> \
  -F name=<repo> \
  -F number=<number> \
  -f query='query(
    $owner:String!
    $name:String!
    $number:Int!
    $endCursor:String
  ){
    repository(owner:$owner,name:$name){
      pullRequest(number:$number){
        reviewThreads(first:100,after:$endCursor){
          nodes{
            id isResolved isOutdated path line
            comments(first:100){
              nodes{author{login} body url createdAt commit{oid}}
            }
          }
          pageInfo{hasNextPage endCursor}
        }
      }
    }
  }' \
  | jq '[.[].data.repository.pullRequest.reviewThreads.nodes[]
    | select((.isResolved | not) and (.isOutdated | not))
    | select(any(.comments.nodes[];
        .author.login | test("chatgpt-codex-connector")))
    | {id, path, line, comments: .comments.nodes}]'
```

所有页面的结果都为空，意味着不存在尚未解决且未过时的 Codex 线程。保留已过时的线程作为审查历史记录，但不要将其评论的 SHA 视为当前的解决状态。

3. 如果最新的有效反应状态为 `pending`，请继续监控。不要因没有反馈而推断已经批准。

4. 如果 Codex 留下了反馈，请立即开始处理。不要等所有测试完成后才阅读和处理评论；这会浪费审查循环的时间。在检查反馈的同时，测试可以继续并行运行。

5. 对于每条 Codex 评论，请运用工程判断。

- 如果评论指出了实际问题，请进行修复、运行针对性验证、推送，并在新的 head 上重新开始循环。
- 如果评论有误、已过时、被有意排除在范围之外，或者不值得修改，请在 GitHub 上回复简洁的理由和证据。你并非必须修改代码。
- 如果权衡取舍不明确，请向用户说明相关取舍，并在作出选择前询问用户。

6. 每次推送后，从第 1 步重新开始。新的 head 需要 Codex 作出新的响应。

7. 仅当以下所有条件在同一个最新 head 上均得到满足时，循环才算完成：

- 必需的测试/检查均已通过。
- Codex 没有任何未处理的当前 head 评论、顶层审查发现，或
  尚未解决且未过时的审查线程。
- Codex 已留下点赞批准信号，或者用户明确覆盖了此门禁。

8. 合并前报告门禁状态：

```text
Codex gate: approved | waiting | blocking | overridden
Head: <sha>
Tests: passing | pending | failing
Evidence: <thumbs-up reaction, blocking comment URL, reply URL, or explicit user override>
```

9. 仅当门禁状态为 `approved` 或 `overridden`，并且测试在同一个 head 上通过时，才运行 `gh pr merge`。

## 此机制所防止的故障模式

PR `basicmachines-co/basic-memory-cloud#1366` 在 CI 变绿且现有 Codex 线程均已过时之后被合并，但当时 Codex 尚未留下点赞。随后，Codex 在已合并的 head 上发布了一条 P2 审查评论。此技能旨在防止这一错误再次发生。