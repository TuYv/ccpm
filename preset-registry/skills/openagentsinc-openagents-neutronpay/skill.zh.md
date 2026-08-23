---
name: neutronpay
description: Neutronpay MCP and SDK workflows for Lightning, stablecoin, and fiat payments.
metadata:
  oa:
    project: neutronpay
    identifier: neutronpay
    version: "0.1.0"
    expires_at_unix: 1798761600
    capabilities:
      - http:outbound
      - filesystem:read
      - process:spawn
---
# Neutronpay

## 概述

集成 Neutronpay 以支持智能体驱动的支付。当任务涉及将 Neutron MCP 服务器接入 AI 工具（Cursor/Claude/Windsurf）、构建 Neutron SDK 后端、运行 Neutron AI 智能体模板，或在 React 应用中添加闪电网络结账流程时，请使用此技能。

## 环境

- 需要 `bash`、`curl`、Node.js 和 `npx`。
- 需要从 `portal.neutron.me` 获取 Neutron 凭据。
- 需要能够通过互联网访问 Neutron 服务和 npm。

此技能用于实现和运维，而非通用支付理论。

## 工作流程

1. 首先选择集成路径：
- 面向使用工具调用的助手，采用 MCP 优先的 AI 工具集成（`neutron-mcp`）。
- 使用 SDK 后端集成（`neutron-sdk`）实现发票、支付和状态 API。
- 使用智能体运行时模板（`neutron-ai-agent`）实现按任务付费的自动化。
- 使用由 SDK 端点提供支持的前端结账组件（`neutron-react-payment-component`）。

2. 运行预检：
- 对于 MCP 配置工作，运行 `scripts/check-neutron-prereqs.sh mcp`。
- 对于后端 SDK 工作，运行 `scripts/check-neutron-prereqs.sh sdk`。
- 对于 `neutron-ai-agent` 流程，运行 `scripts/check-neutron-prereqs.sh agent`。

3. 根据 [mcp-sdk-agent-integration](references/mcp-sdk-agent-integration.md) 配置 MCP：
- 将 MCP 服务器配置添加到特定工具的设置中。
- 通过环境注入 `NEUTRON_API_KEY` 和 `NEUTRON_API_SECRET`。
- 重启或重新加载 MCP，并验证工具调用。

4. 实现 Neutron API 路径：
- 对于 MCP 用法：端到端验证余额查询和发票创建。
- 对于 SDK 用法：接入 `lightning.createInvoice`、交易状态检查和 webhook 处理。
- 对于智能体用法：接入 webhook 密钥验证以及从支付到任务完成的流程。

5. 应用安全和策略控制：
- 切勿提交真实的 API 密钥或密钥信息。
- 为每个环境使用独立凭据，并设置明确的支出和风险限额。
- 高金额付款必须经人工确认。

## 快速命令

```bash
# MCP preflight
scripts/check-neutron-prereqs.sh mcp

# Run Neutron MCP server
npx -y neutron-mcp

# SDK install in a repo
npm install neutron-sdk
```

## 参考文件

- [mcp-sdk-agent-integration](references/mcp-sdk-agent-integration.md)：MCP 设置、SDK 入口点、智能体模板和结账流程接入。