---
name: gh-cli
description: Enforces authenticated gh CLI workflows over unauthenticated curl, WebFetch, and MCP fetch patterns. Use when working with GitHub URLs, API access, pull requests, or issues.
---
# gh-cli

## 何时使用

- 处理 GitHub 仓库、拉取请求、议题、发行版或原始文件 URL。
- 你需要经过身份验证的私有仓库访问权限，或更高的 API 速率限制。
- 你即将对 GitHub 使用 `curl`、`wget`、`WebFetch` 或 MCP 抓取工具。

## 何时不要使用

- 目标不是 GitHub。
- 普通的本地 git 操作已能解决该任务。

## 使用指南

对于 GitHub 内容，优先使用经过身份验证的 `gh` CLI，而非原始 HTTP 抓取。具体而言：

- 优先使用 `gh repo view`、`gh pr view`、`gh pr list`、`gh issue view` 和 `gh api`，而非未经验证的 `curl` 或 `wget`。
- 优先克隆仓库并在本地读取文件，而非直接抓取 `raw.githubusercontent.com` 上的 blob。
- 避免将 GitHub API 的 `/contents/` 端点作为克隆并读取仓库文件的替代方案。

示例：

```sh
gh repo view owner/repo
gh pr view 123 --repo owner/repo
gh api repos/owner/repo/pulls
```

关于钩子（hook）的实现，参见：
- `plugins/gh-cli/README.md`
- `plugins/gh-cli/hooks/`
