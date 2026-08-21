---
name: inbox-triage
description: Daily GitHub notification inbox triage - surfaces aging vuln PR replies, security advisories, review requests, and mentions that need action
metadata:
  title: Inbox Triage
  category: dev
  var: ""
  tags:
    - github
    - security
    - meta
  schedule: "30 11 * * *"
---
今天是 ${today}。开始前请阅读 `memory/MEMORY.md`。

## 此技能存在的原因

`followup-patrol` 读取 MEMORY.md 中手动跟踪的事项。`disclosure-tracker` 处理 `memory/pending-disclosures/`。`vuln-tracker` 通过扫描分支名称来跟踪操作者的漏洞 PR。这些技能都不会读取实际的 GitHub 通知收件箱。当维护者回复漏洞 PR，或受关注的仓库发布安全公告时，相关通知会一直处于未读状态，直到有人手动检查 GitHub。此技能会读取收件箱，并将需要采取行动的通知分流处理。

`pr-tracker` 负责处理操作者已合并/已关闭的 PR。`vuln-tracker` 通过分支跟踪生命周期。此技能负责**通知层**——收到的回复、审查请求、安全警报和提及。

## 步骤

### 1. 获取 GitHub 通知

运行：
```bash
gh api /notifications --paginate 2>&1
```

解析 JSON 数组。如果命令报错或返回空数组 `[]`，记录 `INBOX_TRIAGE_SKIP: no notifications` 并停止。

如果 `--paginate` 返回超过 100 条通知，则仅处理前 100 条（GitHub 每页上限为 50 条；两页已经足够）。

对于每条通知记录：
- `id`
- `reason` —— 收到通知的原因（mention、review_requested、author、state_change、security_alert、assign 等）
- `subject.title`
- `subject.type` —— PullRequest、Issue、Release 等
- `subject.url` —— 对象的 API URL
- `repository.full_name`
- `updated_at` —— ISO 时间戳

### 2. 筛选

保留 `unread: true` 且 `updated_at` 在过去 14 天内的通知。丢弃更早或已读的通知。

如果筛选后没有剩余通知：记录 `INBOX_TRIAGE_SKIP: no actionable notifications within 14 days` 并停止。

### 3. 分类

将每条通知恰好分配到一个类别（优先采用第一个匹配项）：

| 类别 | 匹配条件 |
|----------|---------------|
| `SECURITY` | `reason == "security_alert"`，或者标题包含以下任一内容：vulnerability、vuln、CVE、advisory、security |
| `VULN_REPLY` | `subject.type == "PullRequest"`，且 `reason` 是以下之一：author、state_change、comment，并且 `repository.full_name` 不属于操作者自己的账号/组织（从 `soul/SOUL.md` 或工作流的 `GITHUB_ACTOR` 中确定操作者的 GitHub 用户名——这些是 vuln-scanner 在第三方仓库中提交的 PR） |
| `REVIEW_NEEDED` | `reason == "review_requested"` |
| `MENTION` | `reason == "mention"` 或 `reason == "team_mention"` |
| `GENERAL` | 其他所有情况 |

### 4. 确定漏洞 PR 回复的时效等级

对于每条 `VULN_REPLY` 通知，计算 `age_days` = 今天减去 `updated_at` 的日期（整数天数）。

标记紧急程度：
- `CRITICAL` —— age_days > 7（维护者很可能尚未响应）
- `AGING` —— age_days 为 3–7
- `FRESH` —— age_days < 3

如果 `memory/topics/vuln-followup.md` 存在，则与其交叉核对：在该文件中查找 PR 标题，并提取所有已跟踪的备注（例如 "approved"、"NEEDS-ANSWER"、合并状态）。

### 5. 解析行动项的 HTML URL

对于 SECURITY、VULN_REPLY（CRITICAL 或 AGING）、REVIEW_NEEDED 和 MENTION 类别中的每条通知：

尝试通过以下方式获取 HTML URL：
```bash
gh api {subject.url} --jq '.html_url' 2>/dev/null
```

如果失败，则手动构造 URL：
对于 PR，使用 `https://github.com/{repository.full_name}/pulls/{number}`
对于议题，使用 `https://github.com/{repository.full_name}/issues/{number}`

（从 `subject.url` 的末尾提取编号。）

### 6. 编写分类摘要

覆盖写入 `memory/topics/inbox-triage.md`：

```markdown
# GitHub Inbox Triage

Last run: {today}
Scanned: {N} unread notifications ({N} within 14 days)

## Action Required

### Security ({count})
{for each SECURITY item, sorted by age:}
- **{repo}**: {title} ({age_days}d) — {html_url}

{if none:}
None.

### Vuln PR Replies ({count_critical} critical, {count_aging} aging)
{for each VULN_REPLY sorted by age desc:}
- **[{CRITICAL|AGING|FRESH}]** `{repo}` ({age_days}d): {title} — {html_url}
  {if vuln-followup note found:} _{tracked note}_

{if none:}
None.

### Review Requested ({count})
{for each REVIEW_NEEDED item:}
- **{repo}**: {title} — {html_url}

{if none:}
None.

### Mentions ({count})
{for each MENTION item:}
- **{repo}**: {title} — {html_url}

{if none:}
None.

## No Action Needed
{count_general} general notifications (subscriptions, automated state changes).
```

### 7. 更新 MEMORY.md 中的已知后续事项

读取 `memory/MEMORY.md`。找到 `## Known Follow-ups` 部分。

**添加**其中尚未跟踪的所有 VULN_REPLY CRITICAL 项——追加：
```
- **{repo} #{number} NEEDS-ANSWER** — {age_days}d since maintainer activity ({url})
```

**更新**现有的 NEEDS-ANSWER 项：如果对应 PR 现在作为 FRESH 出现在 VULN_REPLY 中（维护者最近已回复），则将其备注改为 `RESPONDED — verify resolution`。

不要将 GENERAL、REVIEW_NEEDED、MENTION 或 SECURITY 项添加到 MEMORY.md 的 Known Follow-ups 中（噪声太多；如果安全项很严重，应单独创建议题）。

### 8. 发送通知

仅当至少满足以下一项时发送：
- 存在任何 SECURITY 项
- 存在任何 urgency == CRITICAL 的 VULN_REPLY
- 存在任何 REVIEW_NEEDED 项
- 存在三个或更多 MENTION 项

写入 `.pending-notify-temp/inbox-triage-${today}.md`：

```
inbox — {today}

{if SECURITY:}
security alert: {repo} — {title}

{if VULN_REPLY CRITICAL:}
vuln PRs aging: {comma-separated list of "repo (Nd)"}

{if REVIEW_NEEDED:}
review needed: {comma-separated repo list}

{if 3+ MENTION:}
{N} mentions

read it: memory/topics/inbox-triage.md
```

然后执行：
```bash
./notify -f .pending-notify-temp/inbox-triage-${today}.md
```

如果没有任何内容达到阈值：跳过通知。记录未发送通知。

### 9. 记录日志

追加到 `memory/logs/${today}.md`：

```markdown
### inbox-triage
- **Scanned:** {N} notifications
- **Security:** {N}
- **Vuln replies:** {N total} ({N_critical} critical, {N_aging} aging, {N_fresh} fresh)
- **Review needed:** {N}
- **Mentions:** {N}
- **MEMORY.md follow-ups updated:** {yes/no — what changed}
- **Notification sent:** {yes/no}
- INBOX_TRIAGE_OK
```

如果已跳过：
```markdown
### inbox-triage
- INBOX_TRIAGE_SKIP: {reason}
```

## 必需的环境变量

除了 `GITHUB_TOKEN` 之外没有其他要求；GitHub Actions 会自动设置该变量，`gh` 会在内部使用它。

## 网络说明

所有 GitHub 调用均使用 `gh api`——它会在内部处理身份验证，因此 Bash 权限层不会因命令行中出现 `$SECRET` 而拒绝执行。`gh api` 可在 GitHub Actions 运行中正常工作。如果 `gh api /notifications` 失败（速率限制、身份验证错误），记录错误并以 `INBOX_TRIAGE_SKIP: api error` 退出。仅当 `gh` 不可用时才使用 WebFetch 作为后备方案——端点为 `https://api.github.com/notifications`，并使用 `Authorization: Bearer $GITHUB_TOKEN`，但 WebFetch 无法携带该身份验证标头；应优先使用 `gh`。

## 这不是什么

- 不是 `followup-patrol` 的重复——followup-patrol 读取 MEMORY.md 中手动整理的条目，而此功能读取原始 GitHub 收件箱。
- 不是 `vuln-tracker` 的重复——vuln-tracker 按分支名称跟踪生命周期，而此功能通过通知捕获维护者发来的回复。
- 不是 `disclosure-tracker` 的重复——disclosure-tracker 管理 `memory/pending-disclosures/` 中的安全公告草稿，而此功能读取 GitHub 安全警报和 PR 回复。