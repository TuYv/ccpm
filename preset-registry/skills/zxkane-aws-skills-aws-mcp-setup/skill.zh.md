---
name: aws-mcp-setup
description: Configure AWS MCP servers for documentation search and API access. Use when setting up AWS MCP, configuring AWS documentation tools, troubleshooting MCP connectivity, or when user mentions aws-mcp, awsdocs, uvx setup, or MCP server configuration. Covers both Full AWS MCP Server (with uvx + credentials) and lightweight Documentation MCP (no auth required).
allowed-tools:
  - Bash(which *)
  - Bash(aws sts get-caller-identity*)
  - Bash(claude mcp *)
  - Bash(cat *mcp.json*)
  - Bash(cat *claude.json*)
---
# AWS MCP 服务器配置指南

## 概述

本指南帮助你为 AI 智能体配置 AWS MCP 工具。共有两种可选方案：

| 方案 | 要求 | 功能 |
|------|------|------|
| **完整 AWS MCP 服务器** | Python 3.10+、uvx、AWS 凭证 | 执行 AWS API 调用 + 文档搜索 |
| **AWS 文档 MCP** | 无 | 仅文档搜索 |

## 第 1 步：检查现有配置

在配置之前，先通过以下任一方法检查 AWS MCP 工具是否已可用：

### 方法 A：检查可用工具（推荐）

在智能体的可用工具中查找以下工具名称模式：
- `mcp__aws-mcp__*` 或 `mcp__aws__*` → 已配置完整 AWS MCP 服务器
- `mcp__*awsdocs*__aws___*` → 已配置 AWS 文档 MCP

**检查方法**：运行 `/mcp` 命令列出所有处于活动状态的 MCP 服务器。

### 方法 B：检查配置文件

智能体工具使用分层配置（优先级：本地 → 项目 → 用户 → 企业）：

| 范围 | 文件位置 | 使用场景 |
|------|----------|----------|
| 本地 | `.claude.json`（位于项目中） | 个人使用/实验 |
| 项目 | `.mcp.json`（项目根目录） | 团队共享 |
| 用户 | `~/.claude.json` | 跨项目的个人配置 |
| 企业 | 系统管理的目录 | 组织范围 |

检查这些文件中包含 `aws-mcp`、`aws` 或 `awsdocs` 键的 `mcpServers`：

```bash
# Check project config
cat .mcp.json 2>/dev/null | grep -E '"(aws-mcp|aws|awsdocs)"'

# Check user config
cat ~/.claude.json 2>/dev/null | grep -E '"(aws-mcp|aws|awsdocs)"'

# Or use Claude CLI
claude mcp list
```

如果 AWS MCP 已配置，则无需进一步设置。

## 第 2 步：选择配置方法

### 自动检测

运行以下命令以确定使用哪种方案：

```bash
# Check for uvx (requires Python 3.10+)
which uvx || echo "uvx not available"

# Check for valid AWS credentials
aws sts get-caller-identity || echo "AWS credentials not configured"
```

### 方案 A：完整 AWS MCP 服务器（推荐）

**适用条件**：uvx 可用且 AWS 凭证有效

**前提条件**：
- 安装了 `uv` 包管理器的 Python 3.10+
- 已配置 AWS 凭证（通过 profile、环境变量或 IAM 角色）

**所需 IAM 权限**：
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "aws-mcp:InvokeMCP",
      "aws-mcp:CallReadOnlyTool",
      "aws-mcp:CallReadWriteTool"
    ],
    "Resource": "*"
  }]
}
```

**配置**（添加到你的 MCP 设置中）：
```json
{
  "mcpServers": {
    "aws-mcp": {
      "command": "uvx",
      "args": [
        "mcp-proxy-for-aws@latest",
        "https://aws-mcp.us-east-1.api.aws/mcp",
        "--metadata", "AWS_REGION=us-west-2"
      ]
    }
  }
}
```

**凭证配置选项**：

1. **AWS Profile**（推荐用于开发）：
   ```json
   "args": [
     "mcp-proxy-for-aws@latest",
     "https://aws-mcp.us-east-1.api.aws/mcp",
     "--profile", "my-profile",
     "--metadata", "AWS_REGION=us-west-2"
   ]
   ```

2. **环境变量**：
   ```json
   "env": {
     "AWS_ACCESS_KEY_ID": "...",
     "AWS_SECRET_ACCESS_KEY": "...",
     "AWS_REGION": "us-west-2"
   }
   ```

3. **IAM 角色**（适用于 EC2/ECS/Lambda）：无需额外配置 - 使用实例凭证

**其他选项**：
- `--region <region>`：覆盖 AWS 区域
- `--read-only`：限制为只读工具
- `--log-level <level>`：设置日志级别（debug、info、warning、error）

**参考**：https://github.com/aws/mcp-proxy-for-aws

### 方案 B：AWS 文档 MCP 服务器（无需认证）

**适用条件**：
- 无 Python/uvx 环境
- 无 AWS 凭证
- 仅需要文档搜索（无需执行 API 调用）

**配置**：
```json
{
  "mcpServers": {
    "awsdocs": {
      "type": "http",
      "url": "https://knowledge-mcp.global.api.aws"
    }
  }
}
```

## 第 3 步：验证

配置完成后，验证工具是否可用：

**对于完整 AWS MCP**：
- 查找工具：`mcp__aws-mcp__aws___search_documentation`、`mcp__aws-mcp__aws___call_aws`

**对于文档 MCP**：
- 查找工具：`mcp__awsdocs__aws___search_documentation`、`mcp__awsdocs__aws___read_documentation`

## 故障排除

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `uvx: command not found` | 未安装 uv | 使用 `pip install uv` 安装或使用方案 B |
| `AccessDenied` 错误 | 缺少 IAM 权限 | 在 IAM 策略中添加 aws-mcp:* 权限 |
| `InvalidSignatureException` | 凭证问题 | 检查 `aws sts get-caller-identity` |
| 工具未出现 | MCP 未启动 | 更改配置后重启智能体 |
