---
name: create-pr
description: Create pull requests using GitHub CLI with proper templates and formatting
argument-hint: None required - interactive guide for PR creation
allowed-tools: Bash(gh pr:*), Bash(gh auth:*), Bash(git status:*), Bash(git push:*), Bash(git branch:*), Skill(git:commit)
---
# 如何使用 GitHub CLI 创建拉取请求

本指南介绍如何在我们的项目中使用 GitHub CLI 创建拉取请求。

**重要**：所有 PR 标题和描述都应使用英文编写。

## 前置条件

检查是否已安装 `gh`，如果尚未安装，请按照以下说明进行安装：

1. 如果尚未安装 GitHub CLI，请先安装：

   ```bash
   # macOS
   brew install gh

   # Windows
   winget install --id GitHub.cli

   # Linux
   # Follow instructions at https://github.com/cli/cli/blob/trunk/docs/install_linux.md
   ```

2. 通过 GitHub 进行身份验证：
   ```bash
   gh auth login
   ```

## 前置检查

创建 PR 之前，请检查是否存在未提交的更改：

1. 运行 `git status`，检查是否存在未提交的更改（已暂存、未暂存或未跟踪的文件）
2. 如果存在未提交的更改，请先使用 Skill 工具运行 `commit` skill：
   ```
   Skill: commit
   ```
3. 这可以确保在创建 PR 之前，你的所有工作都已提交

## 创建新的拉取请求

1. 首先，按照 @.github/pull_request_template.md 中的模板准备 PR 描述

2. 使用 `gh pr create --draft` 命令创建新的拉取请求：

   ```bash
   # Basic command structure
   gh pr create --draft --title "✨(scope): Your descriptive title" --body "Your PR description" --base main 
   ```

   对于格式要求更复杂的 PR 描述，请使用 `--body-file` 选项并严格遵循 PR 模板结构：

   ```bash
   # Create PR with proper template structure
   gh pr create --draft --title "✨(scope): Your descriptive title" --body-file .github/pull_request_template.md --base main
   ```

## 最佳实践

1. **语言**：PR 标题和描述始终使用英文

2. **PR 标题格式**：使用带有 emoji 的约定式提交格式

   - 标题开头始终包含一个合适的 emoji
   - 使用实际的 emoji 字符（而不是 `:sparkles:` 之类的代码表示形式）
   - 示例：
     - `✨(supabase): Add staging remote configuration`
     - `🐛(auth): Fix login redirect issue`
     - `📝(readme): Update installation instructions`

3. **描述模板**：始终使用 @.github/pull_request_template.md 中的 PR 模板结构：

4. **模板准确性**：确保 PR 描述严格遵循模板结构：

   - 不要修改或重命名 PR-Agent 部分（`pr_agent:summary` 和 `pr_agent:walkthrough`）
   - 保持所有章节标题与模板中的内容完全一致
   - 不要添加模板中没有的自定义章节

5. **草稿 PR**：工作仍在进行时，先创建为草稿
   - 在命令中使用 `--draft` 标志
   - 完成后，使用 `gh pr ready` 将其转换为可供审查状态

### 应避免的常见错误

1. **使用非英文文本**：所有 PR 内容都必须使用英文
2. **章节标题不正确**：始终使用模板中的确切章节标题
3. **添加自定义章节**：仅使用模板中定义的章节
4. **使用过时的模板**：始终参考当前的 @.github/pull_request_template.md 文件

### 缺失的章节

始终包含模板中的所有章节，即使其中一些被标记为“N/A”或“None”

## 其他 GitHub CLI PR 命令

以下是一些用于管理 PR 的其他实用 GitHub CLI 命令：

```bash
# List your open pull requests
gh pr list --author "@me"

# Check PR status
gh pr status

# View a specific PR
gh pr view <PR-NUMBER>

# Check out a PR branch locally
gh pr checkout <PR-NUMBER>

# Convert a draft PR to ready for review
gh pr ready <PR-NUMBER>

# Add reviewers to a PR
gh pr edit <PR-NUMBER> --add-reviewer username1,username2

# Merge a PR
gh pr merge <PR-NUMBER> --squash
```

## 使用模板创建 PR

为了使用一致的描述简化 PR 创建流程，你可以创建一个模板文件：

1. 使用你的 PR 模板创建一个名为 `pr-template.md` 的文件
2. 创建 PR 时使用该文件：

```bash
gh pr create --draft --title "feat(scope): Your title" --body-file pr-template.md --base main
```

## 相关文档

- [PR 模板](.github/pull_request_template.md)
- [约定式提交](https://www.conventionalcommits.org/)
- [GitHub CLI 文档](https://cli.github.com/manual/)