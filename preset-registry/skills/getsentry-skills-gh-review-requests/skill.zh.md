---
name: gh-review-requests
description: Fetch unread GitHub notifications for open PRs where review is requested from a specified team or opened by a team member. Use when asked to "find PRs I need to review", "show my review requests", "what needs my review", "fetch GitHub review requests", or "check team review queue".
allowed-tools: Bash
---
# GitHub 审查请求

获取开放（未合并）PR 中未读的 `review_requested` 通知，并按 GitHub 团队进行筛选。

**要求**：已完成身份验证的 GitHub CLI (`gh`)。

**要求**：用于 Python 包管理的 `uv` CLI，安装指南见 https://docs.astral.sh/uv/getting-started/installation/

## 第 1 步：确定团队

如果用户尚未指定团队，请询问：

> 我应该按哪个 GitHub 团队进行筛选？（例如 `streaming-platform`）

接受团队 slug (`streaming-platform`) 或显示名称 ("Streaming Platform")——在传递给脚本之前，将其转换为小写且以连字符分隔的 slug。

## 第 2 步：运行脚本

```bash
uv run scripts/fetch_review_requests.py --org getsentry --teams <team-slug>
```

要按多个团队进行筛选，请传入以逗号分隔的列表：

```bash
uv run scripts/fetch_review_requests.py --org getsentry --teams <team slugs>
```

### 脚本输出

```json
{
  "total": 3,
  "prs": [
    {
      "notification_id": "12345",
      "title": "feat(kafka): add workflow to restart a broker",
      "url": "https://github.com/getsentry/ops/pull/19144",
      "repo": "getsentry/ops",
      "pr_number": 19144,
      "author": "bmckerry",
      "reasons": ["opened by: bmckerry"]
    }
  ]
}
```

`reasons` 将包含以下一项或两项：
- `"review requested from: <Team Name>"` — 该团队是被请求的审查者
- `"opened by: <login>"` — PR 作者是团队成员

## 第 3 步：展示结果

以包含完整 URL 的 Markdown 表格展示结果：

| # | 标题 | URL | 原因 |
|---|-------|-----|--------|
| 1 | feat(kafka): add workflow to restart a broker | https://github.com/getsentry/ops/pull/19144 | opened by: evanh |

如果 `total` 为 0，请说明：“未找到该团队的未读审查请求。”

## 备用方案

如果脚本失败，请手动运行：

```bash
gh api notifications --paginate
```

然后针对每条 `review_requested` 通知进行检查：
- `gh api repos/{repo}/pulls/{number}` — 如果 `state == "closed"` 或已设置 `merged_at`，则跳过
- `gh api repos/{repo}/pulls/{number}/requested_reviewers` — 检查 `teams[].name`
- `gh api orgs/{org}/teams/{slug}/members` — 检查作者是否为成员