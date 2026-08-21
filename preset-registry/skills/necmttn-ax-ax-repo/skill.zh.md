---
name: ax-repo
description: Star the ax repo, file an issue / bug report, or fork-and-open-a-PR against github.com/Necmttn/ax on the user's behalf, by shelling out to the `gh` CLI. Triggers when the user says "star ax", "star the repo", "I want to support ax", "report this as an ax bug", "file an ax issue", "open an issue on ax", "this looks like an ax bug", "I want to contribute to ax", "fix this in ax", "open a PR against ax", or after an unhandled ax error when the user wants to report it. Acts only on an explicit user request - proactive star prompting is handled deterministically by the CLI (`ax star`), not this skill. Confirms before any account-mutating action (never stars without an explicit yes); falls back to a plain GitHub URL when `gh` is missing or unauthenticated. Do NOT auto-trigger on unrelated GitHub work or other repos.
role: framing
---
# ax:repo

让 AI 编码代理代表用户与 ax GitHub 仓库（`Necmttn/ax`）交互——**加星标**、**提交议题**或 **fork + 发起 PR**——用户完全不需要输入任何 `gh` 命令。所有操作都通过已安装的 `gh` CLI 执行；`axctl` 不提供这方面的操作界面。

仓库：`Necmttn/ax` · `https://github.com/Necmttn/ax`

## 何时触发

- “star ax” / “star the repo” / “I want to support ax” / “give ax a star”
- “report this as an ax bug” / “file an ax issue” / “open an issue on ax”
- “this looks like an ax bug”（在出现 `ax`/`axctl` 错误之后）
- “I want to contribute to ax” / “fix this in ax” / “open a PR against ax”

不要为**其他**仓库上的 GitHub 操作或一般的 `gh` 使用场景触发。议题和 PR 只能由用户发起。**加星标是例外**——你可以主动*提议*（参见“主动加星提示”），但提议 ≠ 执行：实际加星标始终需要用户明确同意。

## 不可协商的规则

1. **首先预检 `gh`（只读，无需确认）。**识别三种状态：
   - `gh` **缺失** → 回退到普通 URL（参见“回退方案”）。不要报错。
   - `gh` 已安装但**未认证** → 回退到普通 URL，并告知用户下次可以通过 `gh auth login` 直接完成操作。
   - `gh` 已安装且已认证 → 继续执行操作（变更操作仍需确认）。
2. **在任何会变更账户的调用之前进行确认**——加星标、创建议题、创建 PR 都会更改用户的 GitHub 账户/仓库。展示确切命令，并获得明确同意。只读检查（`gh auth status`、“是否已加星标”）无需确认。
3. **绝不能破坏调用方的退出码，也绝不能在 CI 中静默运行。**如果设置了 `$CI`，或者 stderr/stdin 不是 TTY，则不要运行会产生变更的 `gh` 调用——改为输出 URL。`gh` 调用失败不得中止用户的任务。

### 预检（在每次操作前运行）

```bash
if ! command -v gh >/dev/null 2>&1; then
  echo "GH_STATE=missing"
elif ! gh auth status >/dev/null 2>&1; then
  echo "GH_STATE=unauthed"   # gh auth status exits 4 when not logged in
else
  echo "GH_STATE=ok"
fi
```

- `missing` / `unauthed` → 对所选操作使用**回退方案**。
- `ok` → 对所选操作使用 `gh` 命令（确认后）。

## 操作

### 1. 加星标

会变更用户的账户 → **先确认**。

```bash
# Optional read-only check (no confirm): is it already starred?
#   exits 0 (starred) / non-zero / 404 (not starred)
gh api /user/starred/Necmttn/ax >/dev/null 2>&1 && echo "already starred"

# The star (after explicit yes):
gh api -X PUT /user/starred/Necmttn/ax     # silent 204 on success
```

如果已经加过星标，请告知用户并跳过——不要再次执行 PUT，也不要再次提示确认。取消星标（仅在用户提出要求时）：`gh api -X DELETE /user/starred/Necmttn/ax`。

你也可以直接运行 `ax star`，它会通过 `gh` 加星标（或输出 URL），并关闭 CLI 的周期性加星提醒。

**回退方案（gh 缺失/未认证）：**输出
`https://github.com/Necmttn/ax`，并告知用户点击 **Star**。

> 主动提示加星标不是此技能的职责——CLI 会以确定性的方式处理该提示（每天一次在 stderr 中显示的页脚，仅在交互式终端上出现，直到用户运行 `ax star` / `ax star --done`）。此技能只响应用户的明确请求。

### 2. 提交议题 / 错误报告

会产生变更（创建议题）→ **先确认**，并展示你将提交的标题/正文，以便用户在发送前进行编辑。

交互式（打开预填充的浏览器表单——当用户希望在 GitHub UI 中查看/编辑时，这是不错的默认选择）：

```bash
gh issue create --repo Necmttn/ax --web
```

非交互式（预填充标题 + 正文，例如你整理好的错误报告）：

```bash
gh issue create --repo Necmttn/ax \
  --title "<concise summary>" \
  --body "<body>" \
  --label feedback        # only if the user confirms; omit if unsure label exists
```

**错误报告模式。** 当因未处理的 `ax`/`axctl` 错误而发起报告时，根据失败信息进行预填充——绝不要让用户粘贴堆栈跟踪：

```bash
gh issue create --repo Necmttn/ax \
  --title "ingest: <one-line error>" \
  --body "$(cat <<'EOF'
**Command:** `ax <subcommand> <args>`
**ax version:** <output of `ax --version`>
**OS:** <uname -srm>

**What happened**
<one or two sentences>

**Error**
```
<the actual error output - trimmed, no secrets>
```
EOF
)"
```

提交前清除可能泄露私密数据的路径/令牌。先让用户确认整理好的正文。

**后备方案（gh 缺失/未认证）：** 输出网页端新建议题 URL。可以通过查询字符串预填充：
`https://github.com/Necmttn/ax/issues/new?title=<urlencoded>&body=<urlencoded>`
（普通的 `https://github.com/Necmttn/ax/issues/new` 也可以）。告诉用户在浏览器中检查并提交。

### 3. Fork + 发起 PR（贡献代码）

适用于代码变更。Fork + 克隆会对账户产生变更 → **在 fork 前和发起 PR 前都要确认**；在本地创建分支/提交无需确认。

```bash
# 1. Fork and clone in one step (creates a fork on the user's account):
gh repo fork Necmttn/ax --clone        # confirm: this creates a fork

# 2. From inside the clone, branch + make the change + commit:
git checkout -b <topic-branch>
# ...edits...
git commit -am "<conventional message>"
git push -u origin <topic-branch>

# 3. Open the PR against upstream (confirm before sending):
gh pr create --repo Necmttn/ax \
  --title "<title>" --body "<what + why>"
# or interactively review in browser:
gh pr create --repo Necmttn/ax --web
```

如果用户已经位于 `Necmttn/ax` 的克隆中，则跳过 fork 步骤；`gh pr create` 会主动提供将内容推送到 fork 的选项。

**后备方案（gh 缺失/未认证）：** 输出 `https://github.com/Necmttn/ax/fork`，并告诉用户在浏览器中进行 fork，然后手动克隆其 fork。

## 基本规则

- 在运行任何会产生变更的 `gh` 命令前，展示确切命令并获得肯定答复。
- 每次请求只执行一个操作——除非用户同时要求，否则不要既加星又提交议题。
- 不要虚构标签/里程碑；如果不确定 `--label` 是否存在，则将其省略。
- 议题正文应简短、客观且不含机密信息；绝不要粘贴原始对话记录。
- 如果任何 `gh` 操作失败，展示错误并提供 URL 后备方案——绝不要让它中断用户正在进行的任务。