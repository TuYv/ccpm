---
name: prepare-pr
description: Prepare GitHub pull request title and body files from the current branch diff, especially for non-interactive CI/autofix flows that must follow the repository PR template without pushing or creating the PR.
argument-hint: '<output-dir> [issue-number]'
allowedTools:
  - read_file
  - write_file
  - grep_search
  - glob
  - run_shell_command
---
# 准备 PR

仅创建 PR 元数据文件。不要推送、发表评论或运行 `gh pr create`。

## 输入

- 输出目录：默认为 `/tmp/autofix`
- Issue 编号：来自参数、`ISSUE` 或当前分支名称

## 必需输出

写入：

- `<output-dir>/pr-title.txt`
- `<output-dir>/pr-body.md`

## 工作流程

1. 使用 `git diff origin/main...HEAD` 检查当前分支差异，并使用 `git log -1 --pretty=%B` 查看最近的提交消息。
2. 如果 `<output-dir>/e2e-report.md` 存在，则读取它。
3. 读取 `.github/pull_request_template.md`。
4. 将符合 Conventional Commit 风格的标题写入 `pr-title.txt`。
5. 原样填充仓库 PR 模板，并将其写入 `pr-body.md`。

## PR 正文规则

- 完整保留模板中的每个章节标题，保持其原样。
- 不要将模板标题替换为 `Summary`、`Root Cause`、`Fix` 或 `Tests`。
- 使用连贯的正文说明动机和变更；除非有助于审阅者理解，否则避免逐文件罗列实现细节。
- 提供有用的审阅者测试计划，其中包含需要验证的具体行为。
- 在 `Evidence (Before & After)` 中简洁描述变更前后的行为；对于非 UI 变更则填写 `N/A`。
- 如实标记已测试的操作系统行。对于仅在 Linux 上进行的 CI 验证，标记 Linux 已测试，并将 macOS/Windows 标记为未测试。
- 包含风险、范围外内容和破坏性变更说明。
- 如果已知 Issue 编号，则在 `Linked Issues` 下添加 `Fixes #<issue-number>`。
- 保留 `<details><summary>中文说明</summary>` 部分，并在其中将英文正文翻译成中文。
- 不要按固定列宽对段落或列表项进行硬换行。

## 常见错误

- 编写自由格式的 PR 正文，而不是填充模板。
- 声称检查已通过，但实际上并未运行检查。
- 遗漏中文说明部分。
- 对不相关的 Issue 使用关闭关键词。