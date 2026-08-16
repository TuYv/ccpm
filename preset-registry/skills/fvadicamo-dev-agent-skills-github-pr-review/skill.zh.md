---
name: github-pr-review
description: Handles PR review comments and feedback resolution. Use when user wants to resolve PR comments, handle review feedback, fix review comments, address PR review, check review status, respond to reviewer, verify PR readiness, review PR comments, analyze review feedback, evaluate PR comments, assess review suggestions, or triage PR comments. Fetches comments via GitHub CLI, classifies by severity, applies fixes with user confirmation, commits with proper format, replies to threads.
---
# GitHub PR 审查

根据严重程度确定优先级，解决拉取请求审查意见、应用修复并回复讨论线程。

## 当前 PR

!`gh pr view --json number,title,state,milestone -q '"PR #\(.number): \(.title) (\(.state)) | Milestone: \(.milestone.title // "none")"' 2>/dev/null`

## 核心工作流

### 1. 获取、筛选评论并进行分类

```bash
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
PR=$(gh pr view --json number -q '.number')
LAST_PUSH=$(git log -1 --format=%cI HEAD)

# Inline review comments - filter out replies (keep only originals)
gh api repos/$REPO/pulls/$PR/comments?per_page=100 --jq '
  [.[] | select(.in_reply_to_id == null) |
   {id, path, user: .user.login, created_at, body: .body[0:200]}]
'

# PR-level reviews with non-empty body (CodeRabbit sections, Gemini, etc.)
gh api repos/$REPO/pulls/$PR/reviews?per_page=100 --jq '
  [.[] | select(.body | length > 0) |
   {id, user: .user.login, state, submitted_at, body: .body[0:500]}]
'
```

**交叉核对附加到审查的评论**：CodeRabbit 的审查正文会注明“Actionable comments posted: N”。如果通用 `pulls/$PR/comments` 端点返回的该审查者新增原始评论少于 N 条，则部分评论可能只能通过审查专用端点获取。获取这些评论，并按评论 ID 合并：

```bash
# $REVIEW_ID from the reviews fetch above; $EXPECTED from parsing "Actionable comments posted: N"
gh api repos/$REPO/pulls/$PR/reviews/$REVIEW_ID/comments?per_page=100 --jq '
  [.[] | select(.in_reply_to_id == null) |
   {id, path, user: .user.login, created_at, body: .body[0:200]}]
'
```

继续操作前，按 `id` 去重。仅通过审查专用端点发现的评论也是有效的行内评论，应以相同方式处理（采用相同的分类方式和相同的 `in_reply_to` 回复机制）。

**筛选新增评论和已查看评论**：将 `created_at`/`submitted_at` 与 `$LAST_PUSH` 进行比较。最后一次推送后发布的评论属于新增评论。在汇总表中将更早的评论标记为“上一轮”。

**解析 CodeRabbit 审查正文**：初始获取操作会截断正文，以便进行分类。对于来自 CodeRabbit 的审查（`user.login` 以 `coderabbitai` 开头），请单独获取完整正文：

```bash
gh api repos/$REPO/pulls/$PR/reviews?per_page=100 --jq '
  [.[] | select(.user.login | startswith("coderabbitai")) |
   {id, submitted_at, body}]
'
```

CodeRabbit 会发布结构化的 `<details>` 块，其中包含差异范围之外、重复项和细节建议评论。每个块都包含文件路径、行范围、严重程度，以及可选的“Prompt for AI Agents”和预构建上下文。完整的解析指南请参阅 `references/coderabbit_parsing.md`。

**在可用时使用 CodeRabbit AI 提示词**：如果评论（或审查正文）包含“Prompt for AI Agents”`<details>` 块，请使用它来理解问题和建议的处理方法。在提出修复方案之前，始终先阅读实际代码。如果审查正文包含“Prompt for all review comments with AI agents”块，请先阅读该块以了解跨评论的上下文，然后再处理各条评论。

按严重程度对所有评论进行分类，并按以下顺序处理：CRITICAL > HIGH > MEDIUM > LOW。

| 严重程度 | 标识 | 操作 |
|----------|------------|--------|
| CRITICAL | `critical.svg`, `_🔒 Security_`, `_🚨 Critical_`, `_🔴 Critical_`, "security", "vulnerability" | 必须修复 |
| HIGH | `high-priority.svg`, `_⚠️ Potential issue_`, `_🐛 Bug_`, `_⚡ Performance_`, `_🟠 Major_`, "High Severity" | 应当修复 |
| MEDIUM | `medium-priority.svg`, `_🛠️ Refactor suggestion_`, `_💡 Suggestion_`, "Medium Severity" | 建议修复 |
| LOW | `low-priority.svg`, `_🧹 Nitpick_`, `_🔧 Optional_`, `_🟡 Minor_`, `_🔵 Trivial_`, `_⚪ Info_`, "style", "nit" | 可选 |

当一条评论同时包含类型标签和次级颜色徽章（例如 `_💡 Suggestion_ | _🟠 Major_`）时，颜色徽章表示**强制采用**的严重程度，并覆盖基于类型的默认严重程度。

完整的检测模式（Gemini 徽章、CodeRabbit 表情符号、Cursor 评论、关键词回退、相关评论启发式规则）请参阅 `references/severity_guide.md`。

### 2. 显示审查摘要表

处理之前，显示所有评论的结构化概览：

```
| # | ID         | Severity | File:Line          | Type     | Status   | Summary            |
|---|------------|----------|--------------------|----------|----------|--------------------|
| 1 | 123456789  | CRITICAL | src/auth.py:45     | inline   | new      | SQL injection risk |
| 2 | 987654321  | HIGH     | src/db.py:346-350  | outside  | new      | Missing join cond  |
| 3 | 555555555  | HIGH     | src/chunk.py:188   | duplicate| previous | Stale metadata     |
| 4 | 444444444  | LOW      | tests/test_q.py:12 | nitpick  | previous | Naming convention  |
```

- **类型**：`inline`、`outside`（差异范围之外）、`duplicate`、`minor`、`nitpick`（来自 CodeRabbit 各部分）或 `review`（通用 PR 级别）
- **状态**：`new`（在最近一次推送后发布）或 `previous`（来自之前的轮次）
- 对相关评论（同一文件、同一根本原因、涉及“同样适用于”范围）进行分组，并注明评论集群
- 去重：如果同一问题既以内联评论的形式出现，又出现在 CodeRabbit 审查正文的某个部分中（例如重复项），则只保留一个条目，并注明两个来源

如果评论数量**超过 10 条**，建议将审查摘要保存到 Claude 的记忆中，以便跨会话跟踪。摘要应包括：PR 编号、评论 ID、严重程度、状态（新建/已处理/已推迟/不修复）和简要描述。这有助于在后续推送后收到新评论时保持连续性。

### 3. 处理每条评论

对于每条评论，按严重程度顺序处理：

1. **显示上下文**：评论 ID、严重程度、文件:行号、引用内容
2. **检查 AI 提示词**：如果此评论提供了 CodeRabbit 的“Prompt for AI Agents”，则使用它来理解问题和建议的处理方式
3. **检查建议的修复方案**：如果 CodeRabbit 包含“Proposed fix”或“Suggested fix”代码块，则将其作为起点（但需要验证其正确性）
4. **读取受影响的代码**并提出修复方案（即使 AI 提示词或建议的修复方案提供了上下文，也始终要读取实际代码）
5. **处理“同样适用于”**：如果评论引用了其他行范围，则在修复中包含所有位置
6. 应用前**向用户确认**
7. 如果获得批准，则**应用修复**
8. **验证评论中的所有问题**均已解决（包含多个问题的评论很常见）

### 4. 提交更改

使用 git-commit skill 格式。功能性修复应分别提交，外观修复应批量提交：

| 更改类型 | 策略 |
|-------------|----------|
| 功能性（CRITICAL/HIGH） | 每项修复单独提交 |
| 外观（MEDIUM/LOW） | 合并为单个 `style:` 提交 |

在提交正文中引用评论 ID。

### 5. 回复讨论线程

#### 行内评论

**重要**：通过 JSON 使用 `--input -`。`-f in_reply_to=...` 语法不起作用。

```bash
COMMIT=$(git rev-parse --short HEAD)
gh api repos/$REPO/pulls/$PR/comments \
  --input - <<< '{"body": "Fixed in '"$COMMIT"'. Brief explanation.", "in_reply_to": 123456789}'
```

#### 非行内评论（CodeRabbit 审查正文）

嵌入审查正文中的评论（差异外、重复、吹毛求疵）没有行内讨论线程。GitHub API 不支持直接回复审查正文。请发布一条普通的 PR 评论，并引用具体问题：

```bash
gh pr comment $PR --body "Fixed in $COMMIT. Addresses outside-diff comment on file/path.py:346-350."
```

**回复模板**（不使用表情符号，简洁且专业）：

| 情况 | 模板 |
|-----------|----------|
| 已修复 | `Fixed in [hash]. [brief description of fix]` |
| 不修复 | `Won't fix: [reason]` |
| 有意如此 | `By design: [explanation]` |
| 已推迟 | `Deferred to [issue/task]. Will address in future iteration.` |
| 已确认 | `Acknowledged. [brief note]` |

### 6. 运行测试并推送

运行项目测试套件。推送前所有测试都必须通过。将所有修复一起推送，以尽量减少审查循环。

### 7. 提交审查（可选）

处理完所有评论后，正式提交审查：

- `gh pr review $PR --approve --body "..."` - 所有评论均已处理，PR 已准备就绪
- `gh pr review $PR --request-changes --body "..."` - 仍存在关键问题
- `gh pr review $PR --comment --body "..."` - 更新进度，暂不作决定

### 8. 验证里程碑

```bash
gh pr view $PR --json milestone -q '.milestone.title // "none"'
```

如果 PR 没有里程碑，请检查是否存在开放的里程碑：

```bash
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
gh api repos/$REPO/milestones --jq '[.[] | select(.state=="open")] | .[] | "\(.number): \(.title)"'
```

如果存在开放的里程碑，请告知用户并建议进行分配：

```bash
gh pr edit $PR --milestone "[milestone-title]"
```

**不要**自动分配。这仅是一项提醒。

## 避免审查循环

当机器人（Gemini、Codex 等）审查每次推送时：

1. **批量修复**：积累所有修复后一次性推送
2. **草稿 PR**：修复期间将 PR 转换为草稿
3. **提交关键字**：某些机器人会遵循 `[skip ci]` 或 `[skip review]`

## 重要规则

- **始终**同时获取行内评论（`pulls/$PR/comments`）和审查正文（`pulls/$PR/reviews`）
- **始终**将 "Actionable comments posted: N" 与找到的原始评论进行交叉核对；当数量不匹配时，获取 `pulls/$PR/reviews/$REVIEW_ID/comments`
- **始终**解析 CodeRabbit 审查正文中的所有章节类型（差异外、重复、次要、吹毛求疵）
- **始终**优先使用 CodeRabbit 的 "Prompt for AI Agents" 作为上下文（如果有）
- **始终**在处理前显示审查摘要表
- **始终**在修改文件前请求确认
- **始终**验证多问题评论中的所有问题均已修复，包括 "also applies to" 范围
- **始终**在推送前运行测试
- **始终**使用标准模板回复已解决的讨论线程
- **始终**在处理完所有评论后提交正式审查（`gh pr review`）
- **始终**在最后检查里程碑，如果缺失则进行提醒
- **始终**在评论超过 10 条时，建议将审查摘要保存到记忆中
- **绝不**在提交消息或讨论线程回复中使用表情符号
- **绝不**在未经用户明确批准的情况下跳过 HIGH/CRITICAL 评论
- **绝不**自动分配里程碑——仅提出建议
- **功能性修复** -> 分别提交（每项修复一个提交）
- **外观修复** -> 合并为单个 `style:` 提交
- **重复评论** -> 按高于其标签的优先级处理（该问题此前已被指出）
- **相关评论** -> 当它们具有相同的根本原因或文件上下文时，将其归组并一起修复

## 参考资料

- `references/severity_guide.md` - 严重程度检测模式（Gemini 徽章、CodeRabbit 表情符号、Cursor 评论、关键词回退、相关评论启发式规则）
- `references/coderabbit_parsing.md` - CodeRabbit 审查正文结构、章节解析、“Prompt for AI Agents”的使用、重复内容及“also applies to”情况的处理