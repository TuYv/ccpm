---
name: auto-merge
description: Automatically merge open PRs that have passing CI, no blocking reviews, and no conflicts
metadata:
  title: Auto Merge
  category: core
  tags:
    - dev
    - meta
  var: ""
---
<!-- autoresearch: 变体 C — 安全强化（作者允许列表、大小上限、UNKNOWN 重试、分支阻止、空运行模式），避免拥有合并凭据的自主代理意外发布恶意或超大 PR -->

> **${var}** — 要操作的仓库（owner/repo）。如果为空，则使用 memory/watched-repos.md 中的所有仓库。
> 环境变量：`AUTO_MERGE_DRY_RUN=1` 仅记录操作意图而不执行合并。`MAX_AUTO_MERGE=N` 限制每次运行的合并数量（默认为 3）。

合并所有完全通过检查**并且**符合明确安全策略的开放 PR。之所以制定此策略，是因为此技能会以写入权限自主运行——门控中的缺陷就是会被发布到主分支的缺陷。

读取 memory/MEMORY.md 和 memory/watched-repos.md，以确定要操作的仓库。
读取 memory/logs/ 中最近 2 天的内容，避免重复记录已合并的 PR。

## 安全策略

仅当以下所有条件均满足时，PR 才可合并：

- **作者允许列表**：`author.login` 必须是 `dependabot[bot]`、`renovate[bot]`、`github-actions[bot]` 之一，或者出现在 memory/watched-repos.md 的 `## Trusted Authors` 章节下。如果没有允许列表，则只有这三个机器人登录名符合条件。
- **大小上限**：`additions + deletions ≤ 500`。可通过为 PR 添加 `auto-merge-large` 标签来覆盖此限制。
- **基础分支**：`baseRefName` 必须是 `main` 或 `master`。拒绝任何其他目标分支。
- **不是复刻仓库**：`isCrossRepository == false`（复刻仓库的 CI 可能被篡改）。
- **不是草稿**：`isDraft == false`。
- **尚未进入队列**：`autoMergeRequest == null`（如果人工启用了 GitHub 原生自动合并，应避免与其冲突）。
- **没有退出标签**：不能存在 {`do-not-merge`, `wip`, `hold`, `needs-review`, `blocked`} 中的任何标签。
- **可合并状态**：`mergeStateStatus == "CLEAN"`（这比 `mergeable == "MERGEABLE"` 更严格——CLEAN 还要求满足分支保护门控）。
- **评审**：`reviewDecision != "CHANGES_REQUESTED"`。
- **检查**：`statusCheckRollup` 中每个条目的 `conclusion` 都必须属于 `{SUCCESS, NEUTRAL, SKIPPED}`。任何 `FAILURE`、`TIMED_OUT`、`CANCELLED`、`PENDING` 或 `null` 结论都会使该 PR 失去资格。
- **重试上限**：此 PR 的尝试次数少于 3 次。如果某个 PR 在多次运行中已三次出现 `MERGE_FAIL`，则暂停处理——对看似处于 CLEAN 状态的 PR 反复合并失败，通常意味着存在某些不易察觉的问题（未显示的必需检查、分支保护配置漂移、令牌权限范围漂移）。将其明确报告并停止循环尝试。

## 步骤

0. **初始化状态**——每个 PR 的重试计数器保存在 `memory/topics/auto-merge-state.json` 中：
   ```bash
   mkdir -p memory/topics
   [ -f memory/topics/auto-merge-state.json ] || echo '{"prs":{},"last_run":null}' > memory/topics/auto-merge-state.json
   ```
   架构：
   ```json
   {
     "last_run": "2026-05-23T08:00:00Z",
     "prs": {
       "owner/repo#123": {
         "first_seen": "2026-05-21T10:00:00Z",
         "last_attempt": "2026-05-23T08:00:00Z",
         "attempts": 2,
         "last_outcome": "merge_failed",
         "last_error": "Pull Request is in unstable state"
       }
     }
   }
   ```
   PR 键采用 `<owner>/<repo>#<number>` 格式，因此状态可在多仓库运行之间保留。仅保留最近的 50 个条目（按 `last_attempt` 执行 LRU 淘汰）。写入后使用 `jq empty` 进行验证；如果失败，则从 `.bak` 恢复。

1. **列出每个受监控仓库的开放 PR**，并获取完整字段集：
   ```bash
   gh pr list -R owner/repo --state open --json number,title,author,isDraft,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,autoMergeRequest,isCrossRepository,labels,additions,deletions,baseRefName
   ```

2. **处理 UNKNOWN 状态** — GitHub 会延迟计算 `mergeStateStatus`。如果某个 PR 返回 `UNKNOWN`，等待 3 秒后重新查询一次：
   ```bash
   sleep 3 && gh pr view NUMBER -R owner/repo --json mergeStateStatus,mergeable,statusCheckRollup
   ```
   如果重试后仍为 UNKNOWN，则跳过该 PR，并将原因记为 `UNKNOWN-persistent`，留待下次运行重试。

3. **对每个 PR 应用安全策略**。为每个 PR 记录判定结果：`MERGE` 或 `SKIP:<specific-reason>`。原因必须指出未通过的门禁条件——例如 `SKIP:author-not-allowlisted:contributor123`、`SKIP:size-cap:823-lines`、`SKIP:mergeStateStatus=BEHIND`、`SKIP:label:do-not-merge`、`SKIP:check-failed:lint`、`SKIP:retry-cap:3-attempts`。不接受 `SKIP:not-ready` 这类含糊的原因。

4. **合并符合条件的 PR**，数量不超过 MAX_AUTO_MERGE（默认为 3）：
   - 如果 `AUTO_MERGE_DRY_RUN=1`，记录 `DRY_RUN:would-merge #N` 并继续——**不要**调用合并命令。
   - 否则：
     ```bash
     gh pr merge NUMBER -R owner/repo --squash --delete-branch
     ```
     每次尝试时，无论结果如何，都递增 `state.prs["<owner>/<repo>#<N>"].attempts`。如果 `first_seen` 不存在，则设置该字段。对于不再出现在开放列表中的 PR（自上次运行以来已合并或关闭），将其重置为 0（删除对应条目）。
     如果合并失败（退出码非零），捕获 stderr 并记录 `MERGE_FAIL #N: <stderr>`。在状态条目中记录 `last_outcome: merge_failed` 和 `last_error: <stderr ≤200 chars>`。失败的合并**不**计入每次运行的 `MAX_AUTO_MERGE` 上限——继续处理下一个符合条件的 PR。`attempts` 已达到 3 的 PR 会在第 3 步中通过 `SKIP:retry-cap:3-attempts` 被过滤掉；不要重试，而应在第 5b 步中将其报告出来。

5. **仅在**至少有一次真实（非试运行）合并成功，**或**至少有一个 PR 达到重试上限（见下方 5b）时发送通知。没有合并且没有达到上限 → 不发送通知，只记录一条日志。

   5a. **至少有一次合并成功：**
   ```
   *Auto Merge — ${today}*
   Merged N PR(s) on owner/repo:
   - #123: PR title (+45/-12, by @author) — squash merged abc1234
   Queue cleared. Self-improve cycle unblocked.
   ```

   5b. **至少有一个 PR 达到重试上限**（`AUTO_MERGE_RETRY_CAP`）——如果两种情况同时触发，则包含在同一条消息中，否则单独发送：
   ```
   *Auto Merge — retry cap*
   Hit retry cap (3 attempts) on:
   - owner/repo#40 — last error: "Pull Request is in unstable state"
   Stopping auto-merge attempts on this PR. Investigate manually.
   ```
   去重：如果过去 24 小时内已经通知过*完全相同*的一组达到上限的 PR 键，则不再重复通知（在 `memory/logs/` 中 grep 先前的 `AUTO_MERGE_RETRY_CAP` 条目）。

6. **持久化状态**——写入更新后的 `memory/topics/auto-merge-state.json`。将 `last_run` 更新为当前时间戳。使用 `jq empty` 验证；如果失败，则从本次运行前写入的 `.bak` 恢复。

7. **记录到 `memory/logs/${today}.md`** 的 `### auto-merge` 标题下：
   - `Mode`：`live | dry-run`
   - `Repo(s)`：列表
   - `Merged`：每行一条 `#N title @author +A-D SHA`
   - `Skipped`：每行一条 `#N SKIP:<reason>`
   - `Retry-capped`：每行一条 `owner/repo#N — <last_error>`（如无则留空）
   - `Totals`：`merged=X qualified=Y considered=Z retry_capped=R`
   - 如果符合条件的 PR 数量为零，请包含判定结果明细：`AUTO_MERGE_SKIP: 0/Z qualifying (behind=B blocked=L failing=F draft=D author-blocked=A size-blocked=S retry-capped=R)`

## 网络说明

`gh` 通过工作流的 GITHUB_TOKEN 进行身份验证——无需使用 curl。如果 `gh pr merge` 失败并显示 `Resource not accessible by integration`，则表示工作流令牌缺少该仓库的合并权限；记录一次，并且每 7 天最多通知一次（检查 `memory/logs/` 中是否有之前的通知），以避免告警轰炸。

## 约束

- 绝不合并作者不在允许列表中的 PR，即使其他所有门禁条件均已通过。
- 如果没有显式的 `auto-merge-large` 标签（由人工而非机器人设置），绝不绕过大小上限。
- 绝不在同一次运行中自动重试 `MERGE_FAIL`——如果第一次合并尝试失败，记录后继续处理下一个。
- 如果某个 PR 在多次运行中累计失败 3 次，则停止重试。通过达到重试上限的通知将其报告一次，并交由运维人员调查。
- 除合并外，不要修改 PR 状态（不发表评论、不编辑标签、不更新分支）。

## 将其作为智能体交付闭环运行

为了闭环处理智能体自身创建的 PR（来自 `feature`、`external-feature`、`self-improve` 等），请在 `memory/watched-repos.md` 的 `## Trusted Authors` 部分下添加智能体的 GitHub 身份：

```markdown
## Trusted Authors
- aeon-bot
- claude-code[bot]
```

加入允许列表后，智能体 PR 将遵循与机器人 PR 相同的安全策略，并在 CI 通过后自动合并。重试上限可防止智能体对卡住的 PR 产生失控行为。