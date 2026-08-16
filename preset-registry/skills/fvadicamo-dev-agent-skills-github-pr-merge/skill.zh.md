---
name: github-pr-merge
description: Merges GitHub Pull Requests after validating pre-merge checklist. Use when user wants to merge PR, close PR, finalize PR, complete merge, approve and merge, or execute merge. Runs pre-merge validation (tests, lint, CI, comments), confirms with user, merges with proper format, handles post-merge cleanup.
---
# GitHub PR 合并

在验证合并前检查清单并处理合并后清理工作之后，合并拉取请求。

## 当前 PR

!`gh pr view --json number,title,state -q '"PR #\(.number): \(.title) (\(.state))"' 2>/dev/null`

## 核心工作流程

### 1. 检查评论状态

确认所有评审评论都至少有一条回复：

```bash
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
PR=$(gh pr view --json number -q '.number')

# Find unreplied comment IDs
gh api repos/$REPO/pulls/$PR/comments --jq '
  [.[] | select(.in_reply_to_id) | .in_reply_to_id] as $replied |
  [.[] | select(.in_reply_to_id == null) | select(.id | IN($replied[]) | not) | .id]
'
```

**如果存在未回复的评论：**
- **停止**合并流程
- 告知用户：“发现未回复的评论：[IDs]。请先运行 github-pr-review。”
- **绝不**通过此技能回复评论

### 2. 检查里程碑

```bash
gh pr view $PR --json milestone -q '.milestone.title // "none"'
```

- 如果已分配里程碑：将其包含在检查清单摘要（第 5 步）中
- 如果没有里程碑：检查是否存在开放的里程碑并警告用户

```bash
gh api repos/$REPO/milestones --jq '[.[] | select(.state=="open")] | length'
```

如果存在开放的里程碑，但该 PR 未分配里程碑，则在检查清单中显示警告：
`- Milestone: ⚠ not assigned (open milestones exist)`

不要因为缺少里程碑而阻止合并。这仅是一条警告。

### 3. 运行验证

运行测试、代码检查，并验证 CI 检查。所有检查都**必须**通过才能继续。

```bash
gh pr checks $PR
```

### 4. 验证变更日志的完整性

如果仓库中没有 `CHANGELOG.md`，则跳过。否则，请确保此次合并将发布的每个提交都已反映在变更日志中，从而避免发布晋级合并（`develop` → `main`）遗漏未记录的提交。

列出此 PR 将引入基础分支的提交，以及它向变更日志中添加的内容：

```bash
BASE=$(gh pr view $PR --json baseRefName -q .baseRefName)
HEAD=$(gh pr view $PR --json headRefName -q .headRefName)
git log --oneline origin/$BASE..origin/$HEAD
git diff origin/$BASE...origin/$HEAD -- CHANGELOG.md
```

- 每个会改变已发布行为的提交（`feat`/`fix`/`perf`、影响行为的 `refactor`）都**必须**有对应的变更日志条目；不改变已发布行为的纯 `chore`/`docs`/`test` 提交可以省略。
- 对于发布晋级合并，还要确认版本已递增（顶部的 `## [x.y.z]` 条目是新增的），并且与清单文件中的版本一致。
- **如果任何改变行为的提交未记录在变更日志中：停止。**报告未记录的提交，并要求用户在合并前更新变更日志和版本。**绝不**通过此技能编辑变更日志。

### 5. 向用户确认

**合并前始终显示检查清单摘要并询问用户：**

```
Pre-merge checklist:
- Comments: all replied
- Tests: passing
- Lint: passing
- CI: green
- Milestone: v0.1.0 (or ⚠ not assigned)
- Changelog: complete (or n/a)

Ready to merge PR #X. Proceed?
```

### 6. 执行合并

首先确定合并方向。它决定是否可以删除头分支：

```bash
gh pr view $PR --json baseRefName,headRefName -q '"\(.headRefName) -> \(.baseRefName)"'
```

**分支删除规则：**
- **主题分支 → `develop`**（头分支是 `feature`/`fix`/等分支）：该分支的使命已经完成。建议删除它，并使用 `--delete-branch` 合并。
- **`develop` → `main`**（或任何以长期分支作为头分支的情况）：**绝不**删除头分支。`develop` 和 `main` 是永久分支。省略 `--delete-branch`，并且不要建议删除分支。

```bash
# Add --delete-branch ONLY for a topic branch merging into develop.
gh pr merge $PR --merge --delete-branch --body "$(cat <<'EOF'
- Key change 1
- Key change 2
- Key change 3

Reviews: N/N addressed
Tests: X passed (Y% cov)
Refs: Task N, Req M
EOF
)"
```

对于 `develop` → `main` 合并，运行相同的命令，但**不要**使用 `--delete-branch`。

**合并策略**：始终使用 `--merge`（合并提交），绝不使用 squash 或 rebase。

### 7. 合并后清理

同步接收合并的分支（PR 的基础分支），而不是始终同步 `develop`：

```bash
BASE=$(gh pr view $PR --json baseRefName -q .baseRefName)
git checkout "$BASE" && git pull origin "$BASE"
```

### 8. 检查里程碑完成情况

如果 PR 关联了里程碑，请检查其中的所有事项现在是否均已关闭：

```bash
MILESTONE=$(gh pr view $PR --json milestone -q '.milestone.number // empty')
if [ -n "$MILESTONE" ]; then
  gh api repos/$REPO/milestones/$MILESTONE \
    --jq '"Open: \(.open_issues) | Closed: \(.closed_issues) | \(.title)"'
fi
```

- 如果 `open_issues == 0`：通知用户，并询问是否关闭该里程碑

```bash
gh api repos/$REPO/milestones/$MILESTONE --method PATCH --field state="closed"
```

- 如果 `open_issues > 0`：报告剩余未关闭事项的数量。无需采取操作。
- **绝不**在没有用户明确确认的情况下自动关闭里程碑。

## 合并消息格式

使用简洁的格式以保持 git 日志整洁：

```
- Key change 1 (what was added/fixed)
- Key change 2
- Key change 3

Reviews: 7/7 addressed (Gemini 5, Codex 2)
Tests: 628 passed (88% cov)
Refs: Task 8, Req 14-15
```

- 变更最多列出 3-5 个要点
- 审查摘要、测试结果和任务引用各占一行
- 不使用标题（##），不添加冗长的章节
- 总计：最多约 10 行

## 重要规则

- **始终**在合并前运行测试、lint 和 CI 检查
- **始终**确认所有审查评论均已得到回复
- **始终**在合并前检查里程碑分配情况（如果缺失则发出警告，但不要阻止合并）
- **始终**（对于包含 CHANGELOG 的仓库）确认其涵盖了本次合并所发布的每一个改变行为的提交；如果有任何遗漏，**停止**并报告
- **始终**在执行合并前征得用户确认
- **始终**使用合并提交（`--merge`），绝不使用 squash/rebase
- **始终**仅在将主题分支（`feature`/`fix`/等）合并到 `develop` 时删除头分支
- **绝不**删除 `develop` 或 `main`。对于 `develop` → `main` 合并，省略 `--delete-branch`，并且绝不建议删除分支
- **始终**在合并后检查里程碑完成情况，并报告未关闭事项的数量
- **绝不**在测试、lint 或 CI 检查失败时进行合并
- **绝不**跳过用户确认
- **绝不**在没有用户明确确认的情况下关闭里程碑
- **绝不**通过此 skill 回复 PR 评论——请改用 github-pr-review
- 如果存在未回复的评论，**停止**合并，并引导用户使用审查 skill