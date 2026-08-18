---
name: atlassian-mcp
description: Integrates with Atlassian products to manage project tracking and documentation via MCP protocol. Use when querying Jira issues with JQL filters, creating and updating tickets with custom fields, searching or editing Confluence pages with CQL, managing sprints and backlogs, setting up MCP server authentication, syncing documentation, or debugging Atlassian API integrations.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: platform
  triggers: Jira, Confluence, Atlassian, MCP, tickets, issues, wiki, JQL, CQL, sprint, backlog, project management
  role: expert
  scope: implementation
  output-format: code
  related-skills: mcp-developer, api-designer, security-reviewer
---
# Atlassian MCP 专家

## 适用场景

- 使用 JQL 过滤器查询 Jira issue
- 搜索或创建 Confluence 页面
- 自动化 sprint 工作流和 backlog 管理
- 设置 MCP 服务器身份验证（OAuth/API tokens）
- 将会议记录同步到 Jira ticket
- 根据 issue 数据生成文档
- 调试 Atlassian API 集成问题
- 在官方 MCP 服务器与开源 MCP 服务器之间进行选择

## 核心工作流

1. **选择服务器** - 选择官方云端、开源或自托管 MCP 服务器
2. **进行身份验证** - 配置 OAuth 2.1、API tokens 或 PAT 凭据
3. **设计查询** - 为 Jira 编写 JQL，为 Confluence 编写 CQL；在完整执行前，先使用 `maxResults=1` 进行验证
4. **实现工作流** - 构建工具调用，处理分页和错误恢复
5. **验证权限** - 在任何写入或批量操作前，通过只读探测确认所需的 scopes
6. **部署** - 配置 IDE 集成，测试权限，监控速率限制

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| 服务器设置 | `references/mcp-server-setup.md` | 安装、选择服务器、配置 |
| Jira 操作 | `references/jira-queries.md` | JQL 语法、issue CRUD、sprint、board、issue 链接 |
| Confluence 操作 | `references/confluence-operations.md` | CQL 搜索、页面创建、space、评论 |
| 身份验证 | `references/authentication-patterns.md` | OAuth 2.0、API tokens、权限 scopes |
| 常见工作流 | `references/common-workflows.md` | issue 分流、文档同步、sprint 自动化 |

## 快速入门示例

### JQL 查询示例
```
# Open issues assigned to current user in a sprint
project = PROJ AND status = "In Progress" AND assignee = currentUser() ORDER BY priority DESC

# Unresolved bugs created in the last 7 days
project = PROJ AND issuetype = Bug AND status != Done AND created >= -7d ORDER BY created DESC

# Validate before bulk: test with maxResults=1 first
project = PROJ AND sprint in openSprints() AND status = Open ORDER BY created DESC
```

### CQL 查询示例
```
# Find pages updated in a specific space recently
space = "ENG" AND type = page AND lastModified >= "2024-01-01" ORDER BY lastModified DESC

# Search page text for a keyword
space = "ENG" AND type = page AND text ~ "deployment runbook"
```

### 最小 MCP 服务器配置
```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@sooperset/mcp-atlassian"],
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "user@example.com",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "CONFLUENCE_URL": "https://your-domain.atlassian.net/wiki",
        "CONFLUENCE_EMAIL": "user@example.com",
        "CONFLUENCE_API_TOKEN": "${CONFLUENCE_API_TOKEN}"
      }
    }
  }
}
```
> **注意：** 始终从环境变量或 secrets manager 加载 `JIRA_API_TOKEN` 和 `CONFLUENCE_API_TOKEN`，切勿将凭据硬编码。

## 约束

### 必须执行
- 遵守用户权限和工作区访问控制
- 在执行前验证 JQL/CQL 查询（先使用 `maxResults=1` 探测）
- 使用指数退避处理速率限制
- 对大型结果集使用分页（每页 50-100 个项目）
- 为网络故障实现错误恢复
- 记录 API 调用，以便调试和审计追踪
- 首先使用只读操作进行测试
- 记录所需的权限范围
- 在对生产数据执行任何写入或批量操作前进行确认

### 禁止执行
- 不得在代码中硬编码 API 令牌或 OAuth 密钥
- 不得忽略 Atlassian API 返回的速率限制标头
- 不得在未验证必填字段的情况下创建问题
- 不得跳过对用户提供的查询字符串进行输入清理
- 不得在未测试权限边界的情况下部署
- 不得在未显示确认提示的情况下更新生产数据
- 不得在同一会话中混用不同的身份验证方法
- 不得在日志或错误消息中暴露敏感的问题数据

## 输出模板

实现 Atlassian MCP 功能时，请提供：
1. MCP 服务器配置（JSON/环境变量）
2. 查询示例（包含说明的 JQL/CQL）
3. 带错误处理的工具调用实现
4. 身份验证设置说明
5. 权限要求的简要说明

[文档](https://jeffallan.github.io/claude-skills/skills/platform/atlassian-mcp/)