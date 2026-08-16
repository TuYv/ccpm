---
name: pr-link-issue
description: Append a GitHub issue link and its Linear ticket to the current PR's description. Use when asked to "link issue to pr", "fill in issue and linear in pr", "add issue refs to pr", or when given a GitHub issue URL and asked to attach it to the current PR. Resolves the Linear ticket automatically from the issue's linear-linkback comment.
---
# 在 PR 中关联 GitHub Issue 和 Linear Ticket

将 Sentry 风格的 `#### Issues` 块追加到 PR 描述中，同时引用 GitHub issue 和从该 issue 的 `linear-linkback` 评论中获取的 Linear ticket。

## 输入

- `<issue-url>` — GitHub issue URL，例如 `https://github.com/<owner>/<repo>/issues/<n>`。如果 PR 位于同一仓库中，也可以只提供 issue 编号。
- （可选）`<pr-number>` — 默认为当前分支上已打开的 PR。

## 步骤

1. **解析 PR 编号** — 如果用户已提供，则跳过：

   ```bash
   gh pr view --json number,body -q '.number'
   ```

   如果该分支上不存在 PR，则停止并告知用户。

2. 从输入 URL 中提取 issue 编号和仓库，或者接受当前仓库中不带 URL 的 `#1234`。

3. 从 issue 的 linear-linkback 评论中获取 Linear ticket：

   ```bash
   gh issue view <n> --repo <owner>/<repo> --json comments \
     -q '.comments[] | select(.author.login=="linear-code") | .body' \
     | grep -Eioe '[a-z]+-[0-9]+' | head -1
   ```

   如果没有匹配项，则改为询问用户 Linear key，或者将其省略。

4. 读取现有 PR 正文，以便追加内容而不是覆盖：

   ```bash
   gh pr view <pr-number> --json body -q '.body'
   ```

5. 构造新的正文。如果正文为空，则只使用 `#### Issues` 块。否则，在一个空行后追加该块。不要重复添加——如果已存在 `#### Issues`，则替换该部分，而不是添加第二个。

   格式：

   ```markdown
   #### Issues

   * Resolves: #<n>
   * Resolves: <linear-key>
   ```

6. 使用 heredoc 更新 PR，以保留换行：

   ```bash
   gh pr edit <pr-number> --body "$(cat <<'EOF'
   <new body>
   EOF
   )"
   ```

7. 输出最终的 PR URL 以进行确认：

   ```bash
   gh pr view <pr-number> --json url -q '.url'
   ```

## 注意事项

- Linear linkback 评论由 GitHub 用户 `linear-code` 发布。正文包含一个 Markdown 链接，其文本为 Linear key，例如 `PY-2357`。
- 每个仓库的项目 key 各不相同（sentry-python 使用 `PY-…`，sentry-javascript 使用 `JS-…`，等等）——正则表达式 `[a-z]+-[0-9]+` 可以覆盖这些情况。
- 不要删除现有 PR 内容。始终先读取，再追加或替换。
- 如果 issue 尚无 Linear linkback（例如刚创建的 issue），则仅添加 GitHub issue 引用，并告知用户缺少 Linear key。