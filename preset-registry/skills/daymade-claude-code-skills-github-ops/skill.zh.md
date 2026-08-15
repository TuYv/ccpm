---
name: github-ops
description: Provides comprehensive GitHub operations using gh CLI and GitHub API. Activates when working with pull requests, issues, repositories, workflows, or GitHub API operations including creating/viewing/merging PRs, managing issues, querying API endpoints, and handling GitHub workflows in enterprise or public GitHub environments.
---
# GitHub 操作

## 概述

此技能提供使用 `gh` CLI 工具以及 GitHub REST/GraphQL API 执行 GitHub 操作的全面指南。在执行任何 GitHub 相关任务时使用此技能，包括拉取请求管理、议题跟踪、仓库操作、工作流自动化以及 API 交互。

## 何时使用此技能

此技能适用于涉及以下内容的任务：
- 创建、查看、编辑或合并拉取请求
- 管理 GitHub 议题或仓库设置
- 查询 GitHub API 端点（REST 或 GraphQL）
- 使用 GitHub Actions 工作流
- 对仓库执行批量操作
- 与 GitHub Enterprise 集成
- 通过 CLI 或 API 自动执行 GitHub 操作

## 核心操作

### 拉取请求

```bash
# Create PR with NOJIRA prefix (bypasses JIRA enforcement checks)
gh pr create --title "NOJIRA: Your PR title" --body "PR description"

# List and view PRs
gh pr list --state open
gh pr view 123

# Manage PRs
gh pr merge 123 --squash
gh pr review 123 --approve
gh pr comment 123 --body "LGTM"
```

📚 有关完整的拉取请求工作流，请参阅 `references/pr_operations.md`

**拉取请求标题约定：**
- 有 JIRA 工单：`GR-1234: Descriptive title`
- 无 JIRA 工单：`NOJIRA: Descriptive title`

### 议题

```bash
# Create and manage issues
gh issue create --title "Bug: Issue title" --body "Issue description"
gh issue list --state open --label bug
gh issue edit 456 --add-label "priority-high"
gh issue close 456
```

📚 有关详细的议题管理说明，请参阅 `references/issue_operations.md`

### 仓库

```bash
# View and manage repos
gh repo view --web
gh repo clone owner/repo
gh repo create my-new-repo --public
```

### 工作流

```bash
# Manage GitHub Actions
gh workflow list
gh workflow run workflow-name
gh run watch run-id
gh run download run-id
```

📚 有关高级工作流操作，请参阅 `references/workflow_operations.md`

### GitHub API

`gh api` 命令提供对 GitHub REST API 端点的直接访问。有关完整的 API 端点文档，请参阅 `references/api_reference.md`。

**基本 API 操作：**
```bash
# Get PR details via API
gh api repos/{owner}/{repo}/pulls/{pr_number}

# Add PR comment
gh api repos/{owner}/{repo}/issues/{pr_number}/comments \
  -f body="Comment text"

# List workflow runs
gh api repos/{owner}/{repo}/actions/runs
```

对于需要多个相关资源的复杂查询，请使用 GraphQL。有关 GraphQL 示例，请参阅 `references/api_reference.md`。

## 身份验证和配置

```bash
# Login to GitHub
gh auth login

# Login to GitHub Enterprise
gh auth login --hostname github.enterprise.com

# Check authentication status
gh auth status

# Set default repository
gh repo set-default owner/repo

# Configure gh settings
gh config set editor vim
gh config set git_protocol ssh
gh config list
```

## 输出格式

控制输出格式以便进行程序化处理：

```bash
# JSON output
gh pr list --json number,title,state,author

# JSON with jq processing
gh pr list --json number,title | jq '.[] | select(.title | contains("bug"))'

# Template output
gh pr list --template '{{range .}}{{.number}}: {{.title}}{{"\n"}}{{end}}'
```

📚 有关 Shell 模式和自动化策略，请参阅 `references/best_practices.md`

## 快速参考

**最常用的操作：**
```bash
gh pr create --title "NOJIRA: Title" --body "Description"  # Create PR
gh pr list                                                  # List PRs
gh pr view 123                                              # View PR details
gh pr checks 123                                            # Check PR status
gh pr merge 123 --squash                                    # Merge PR
gh pr comment 123 --body "LGTM"                            # Comment on PR
gh issue create --title "Title" --body "Description"       # Create issue
gh workflow run workflow-name                               # Run workflow
gh repo view --web                                          # Open repo in browser
gh api repos/{owner}/{repo}/pulls/{pr_number}              # Direct API call
```

## 资源

### references/pr_operations.md

全面的拉取请求操作，包括：
- 详细的 PR 创建模式（JIRA 集成、从文件读取正文、指定目标分支）
- 查看和筛选策略
- 审查工作流和批准模式
- PR 生命周期管理
- 批量操作和自动化示例

处理复杂的 PR 工作流或批量操作时，请加载此参考文档。

### references/issue_operations.md

详细的议题管理示例，包括：
- 使用标签和负责人创建议题
- 高级筛选和搜索
- 议题生命周期和状态管理
- 针对多个议题的批量操作
- 与 PR 和项目集成

大规模管理议题或设置议题工作流时，请加载此参考文档。

### references/workflow_operations.md

高级 GitHub Actions 工作流操作，包括：
- 工作流触发器和手动运行
- 运行监控和调试
- 构件管理
- 密钥和变量
- 性能优化策略

处理 CI/CD 工作流或调试失败的运行时，请加载此参考文档。

### references/best_practices.md

Shell 脚本模式和自动化策略，包括：
- 输出格式设置（JSON、模板、jq）
- 分页和大型结果集
- 错误处理和重试逻辑
- 批量操作和并行执行
- 企业版 GitHub 模式
- 性能优化

构建自动化脚本或处理企业级部署时，请加载此参考文档。

### references/api_reference.md

包含全面的 GitHub REST API 端点文档，包括：
- 完整的 API 端点参考及示例
- 请求/响应格式
- 身份验证模式
- 速率限制指南
- Webhook 配置
- 高级 GraphQL 查询模式

执行复杂的 API 操作或需要详细的端点规范时，请加载此参考文档。