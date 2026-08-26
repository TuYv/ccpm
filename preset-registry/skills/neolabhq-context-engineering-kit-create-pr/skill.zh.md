---
name: create-pr
description: Create pull requests using GitHub CLI with proper templates and formatting
---
# 如何使用 GitHub CLI 创建拉取请求

本指南介绍如何在我们的项目中使用 GitHub CLI 创建拉取请求。

**重要**：所有 PR 标题和描述都应使用英文书写。

## 前置条件

检查是否已安装 `gh`，如果未安装，请按照以下说明进行安装：

1. 如果尚未安装 GitHub CLI，请先安装：

   ```bash
   # macOS
   brew install gh

   # Windows
   winget install --id GitHub.cli

   # Linux
   # Follow instructions at https://github.com/cli/cli/blob/trunk/docs/install_linux.md
   ```

2. 使用 GitHub 进行身份验证：
   ```bash
   gh auth login
   ```

## 创建前检查

创建 PR 之前，检查是否存在未提交的更改：

1. 运行 `git status`，检查是否存在未提交的更改（已暂存、未暂存或未跟踪的文件）
2. 如果存在未提交的更改，请先使用 Skill 工具运行 `commit` skill：
   ```
   Skill: commit
   ```
3. 这样可以确保在创建 PR 之前，所有工作都已提交

## 创建新的拉取请求

1. 首先，按照 @.github/pull_request_template.md 中的模板准备 PR 描述

2. 使用 `gh pr create --draft` 命令创建新的拉取请求：

   ```bash
   # Basic command structure
   gh pr create --draft --title "✨(scope): Your descriptive title" --body "Your PR description" --base main 
   ```

   对于需要正确格式化的更复杂 PR 描述，请使用 `--body-file` 选项，并采用准确的 PR 模板结构：

   ```bash
   # Create PR with proper template structure
   gh pr create --draft --title "✨(scope): Your descriptive title" --body-file .github/pull_request_template.md --base main
   ```

## 最佳实践

1. **语言**：PR 标题和描述始终使用英文

2. **PR 标题格式**：使用带有表情符号的 conventional commit 格式

   - 始终在标题开头添加适当的表情符号
   - 使用实际的表情符号字符（不要使用类似 `:sparkles:` 的代码表示形式）
   - 示例：
     - `✨(supabase): Add staging remote configuration`
     - `🐛(auth): Fix login redirect issue`
     - `📝(readme): Update installation instructions`

3. **描述模板**：始终使用 @.github/pull_request_template.md 中的 PR 模板结构：

4. **模板准确性**：确保 PR 描述严格遵循模板结构：

   - 不要修改或重命名 PR-Agent 部分（`pr_agent:summary` 和 `pr_agent:walkthrough`）
   - 保持所有章节标题与模板中的完全一致
   - 不要添加模板中没有的自定义章节

5. **草稿 PR**：在工作进行中时，以草稿状态开始
   - 在命令中使用 `--draft` 标志
   - 完成后使用 `gh pr ready` 将其转换为可供审查的状态

### 应避免的常见错误

1. **使用非英文文本**：所有 PR 内容都必须使用英文
2. **章节标题不正确**：始终使用模板中的准确章节标题
3. **添加自定义章节**：仅使用模板中定义的章节
4. **使用过时的模板**：始终参考当前的 @.github/pull_request_template.md 文件

### 缺失的部分

始终包含所有模板部分，即使其中一些标记为 “N/A” 或 “None”

## 其他 GitHub CLI PR 命令

以下是一些用于管理 PR 的其他实用 GitHub CLI 命令：

```bash
# 列出你已打开的拉取请求
gh pr list --author "@me"

# 检查 PR 状态
gh pr status

# 查看指定的 PR
gh pr view <PR-NUMBER>

# 在本地检出 PR 分支
gh pr checkout <PR-NUMBER>

# 将草稿 PR 转换为准备好审核
gh pr ready <PR-NUMBER>

# 向 PR 添加审核者
gh pr edit <PR-NUMBER> --add-reviewer username1,username2

# 合并 PR
gh pr merge <PR-NUMBER> --squash
```

## 使用模板创建 PR

为了通过一致的描述简化 PR 创建，你可以创建一个模板文件：

1. 创建一个名为 `pr-template.md` 的文件，其中包含你的 PR 模板
2. 创建 PR 时使用该文件：

```bash
gh pr create --draft --title "feat(scope): Your title" --body-file pr-template.md --base main
```

## 相关文档

- [PR 模板](.github/pull_request_template.md)
- [约定式提交](https://www.conventionalcommits.org/)
- [GitHub CLI 文档](https://cli.github.com/manual/)