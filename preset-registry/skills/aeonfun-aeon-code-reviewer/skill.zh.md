---
name: [REPLACE: SKILL_NAME]
description: First-touch review of newly opened PRs on [REPLACE: WATCHED_REPO] — verdict + welcoming comment + label
metadata:
  category: dev
  var: ""
  tags:
    - dev
---
> **${var}** — 可选。要审查的 PR 编号。如果为空，则扫描 `[REPLACE: WATCHED_REPO]` 上所有新创建的 PR。

今天是 ${today}。审查 **[REPLACE: WATCHED_REPO]** 上的外部 PR，重点关注 **[REPLACE: REVIEW_FOCUS]**。

## 步骤

1. **列出候选项** — 过去 24 小时内创建、且尚未被此 Skill 审查过的所有开放 PR：

   ```bash
   if [ -n "${var:-}" ]; then
     PRS="$var"
   else
     PRS=$(gh pr list -R [REPLACE: WATCHED_REPO] --state open --json number,author,createdAt,additions,deletions \
       --jq '.[] | select(.author.login != "github-actions[bot]" and .author.login != "aeonframework") | .number')
   fi
   ```

   在 `memory/topics/[REPLACE: SKILL_NAME]-reviewed.json` 中记录之前审查过的 PR（一个由 PR 编号组成的扁平数组）。跳过其中已有的所有 PR。

2. **对于每个 PR** — 获取元数据和差异：

   ```bash
   gh pr view "$PR" -R [REPLACE: WATCHED_REPO] --json title,body,additions,deletions,files,author > .pr-meta.json
   gh pr diff "$PR" -R [REPLACE: WATCHED_REPO] > .pr-diff.patch
   ```

   如果 `additions + deletions > [REPLACE: MAX_PR_LINES]`，则跳过 — 将其标记为 `DEFERRED: too large for first-touch review`，留下备注，然后继续处理下一个。

3. **应用评审标准** — 给出以下四种结论之一：

   | 结论 | 触发条件 |
   |---------|---------|
   | **ACCEPT** | 修改了预期路径，遵循仓库约定，范围聚焦，并且差异中没有明显缺陷。 |
   | **NEEDS-CHANGES** | 意图合理，但存在具体问题：缺少测试、格式错误、假设不正确、命名问题。 |
   | **DEFER** | 超出此 Skill 的范围 — 需要人工审查者处理（大型重构、架构变更）。 |
   | **OUT-OF-SCOPE** | 修改了仓库不接受外部贡献的文件（例如锁文件、生成的资源）。 |

   评审标准应重点围绕 **[REPLACE: REVIEW_FOCUS]** — 这是此仓库最重要的评审视角。

4. **发表评论** — 使用友好、具体的语气。感谢贡献者，说明结论，并给出 1-3 条具体要点：

   ```bash
   gh pr comment "$PR" -R [REPLACE: WATCHED_REPO] --body "Thanks for the PR! [verdict text]

   - [bullet 1]
   - [bullet 2]"
   ```

5. **添加标签** — 通过 `gh pr edit "$PR" -R [REPLACE: WATCHED_REPO] --add-label "<label>"` 为 PR 添加标签 — 使用 `accepted` / `needs-changes` / `defer` / `out-of-scope`（如果目标仓库中不存在这些标签，请先创建）。

6. **通知** — 仅在结论为 `ACCEPT` 或 `OUT-OF-SCOPE` 时通过 `./notify` 发送通知 — 这些是需要操作人员采取行动的结论。对于 `NEEDS-CHANGES` 和 `DEFER` 保持静默（PR 上的评论即为通知信号）。

7. **记录日志** — 追加到 `memory/logs/${today}.md`：
   ```
   ## [REPLACE: SKILL_NAME]
   - **PRs reviewed**: N (skipped M as previously seen)
   - **Verdicts**: accept=X, needs-changes=Y, defer=Z, out-of-scope=W
   - **Status**: REVIEW_OK | REVIEW_QUIET (no new PRs)
   ```

## 网络说明

`gh` 通过工作流的 `GITHUB_TOKEN` 进行身份验证。要在 **[REPLACE: WATCHED_REPO]** 中评论 PR 或为其添加标签，该令牌需要拥有此仓库的 `pull-requests: write` 和 `issues: write` 权限 — 请确认工作流授予了这些权限，否则此 Skill 的写入操作将静默失败。

## 约束

- **保持友好**。这个 PR 可能是某人第一次为开源项目做贡献。先表示感谢，再说明具体问题。
- **绝不自动合并**。此 Skill 只负责首次审查，不负责自动合并。即使结论为 `ACCEPT`，仍需等待人工合并。
- **幂等**。重复运行此 Skill 时绝不能重复发表评论。由 `reviewed.json` 状态文件确保这一点。