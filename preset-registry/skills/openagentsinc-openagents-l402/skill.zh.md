---
name: l402
description: L402 agent commerce workflows with lnd, lnget, scoped macaroons, aperture, and MCP.
metadata:
  oa:
    project: l402
    identifier: l402
    version: "0.1.0"
    expires_at_unix: 1798761600
    capabilities:
      - http:outbound
      - filesystem:read
      - process:spawn
---
# L402

## 概述

使用 L402 构建和运营 Lightning 原生的代理商业流程。当任务涉及搭建 Lightning 支付基础设施（`lnd`）、使用远程签名器实施密钥隔离、烘焙限定权限范围的 macaroon、使用 `lnget` 为受 L402 保护的 API 付费、在 `aperture` 后方销售付费端点、通过 LNC 使用 Lightning MCP 查询节点状态，或编排端到端的买方和卖方工作流时，请使用此技能。

此技能基于 `~/code/lightning-agent-tools`，并且应仅用于 Bitcoin 和 Lightning。

## 环境

- 需要 `bash`、`curl` 和 `jq`。
- 需要能够访问 `~/code/lightning-agent-tools`（或通过 `LIGHTNING_AGENT_TOOLS_DIR` 覆盖）。
- Docker 是节点和签名器流程的默认运行时。
- 从源代码构建需要 Go 1.24+；可以使用 `npx` 实现零安装 MCP。

请将此技能用于具体的实现和运维，而不是通用的支付理论。

## 工作流

1. 首先选择角色路径：
- 买方代理：使用 `lnd` + 仅支付 macaroon + `lnget` 访问付费 API。
- 卖方代理：使用 `lnd` + 仅开票 macaroon + `aperture`，在后端前方设置付费墙。
- 观察者代理：通过 LNC 使用 Lightning MCP 服务器及只读工具。
- 完整闭环：集成买方和卖方，并进行明确的预算和令牌检查。

2. 运行预检：
- `scripts/check-l402-prereqs.sh buyer`
- `scripts/check-l402-prereqs.sh seller`
- `scripts/check-l402-prereqs.sh observer`
- `scripts/check-l402-prereqs.sh full`

3. 根据 [lightning-agent-tools 操作手册](references/lightning-agent-tools-playbook.md)引导启动技术栈：
- 从 `lightning-agent-tools/skills/*` 安装并启动节点组件。
- 使用 `lnget` 处理 L402 买方流量。
- 使用 `aperture` 托管付费端点。

4. 实施 [安全与 macaroon](references/security-and-macaroons.md) 中的安全模型：
- 生产环境默认使用仅观察模式 + 远程签名器。
- 烘焙并使用最小权限 macaroon（`pay-only`、`invoice-only`、`signer-only`、`read-only`）。
- 使管理员 macaroon 远离代理运行时路径。

5. 对于只读可观测性或助手节点自省，请使用 [MCP 可观测性](references/mcp-observability.md)：
- 配置 Lightning MCP 服务器，并通过 LNC 配对短语连接。
- 使用 MCP 工具获取状态、通道、发票、付款、对等节点和手续费估算。

6. 在生产流量接入前验证结果：
- 买方：运行 `lnget --no-pay` 和 `lnget --max-cost` 检查。
- 卖方：验证 402 质询和成功的付费重试。
- 安全性：验证活动配置中限定权限范围的 macaroon。

## 快速命令

```bash
# Node + lnget setup (buyer path)
~/code/lightning-agent-tools/skills/lnd/scripts/install.sh
~/code/lightning-agent-tools/skills/lnd/scripts/create-wallet.sh --mode standalone
~/code/lightning-agent-tools/skills/lnd/scripts/start-lnd.sh
~/code/lightning-agent-tools/skills/lnget/scripts/install.sh
lnget config init
lnget --max-cost 500 https://api.example.com/paid-data.json

# Scoped buyer credentials (recommended)
~/code/lightning-agent-tools/skills/macaroon-bakery/scripts/bake.sh --role pay-only

# Seller path (aperture)
~/code/lightning-agent-tools/skills/aperture/scripts/install.sh
~/code/lightning-agent-tools/skills/aperture/scripts/setup.sh --insecure --port 8081
~/code/lightning-agent-tools/skills/aperture/scripts/start.sh

# MCP read-only path
~/code/lightning-agent-tools/skills/lightning-mcp-server/scripts/install.sh
~/code/lightning-agent-tools/skills/lightning-mcp-server/scripts/configure.sh --production
```

## 参考文件

- [lightning-agent-tools-playbook](references/lightning-agent-tools-playbook.md)：实用的买方/卖方工作流及端到端 L402 循环。
- [security-and-macaroons](references/security-and-macaroons.md)：远程签名器层级、按角色限定作用域的 macaroons，以及生产环境加固。
- [mcp-observability](references/mcp-observability.md)：通过 LNC 设置 Lightning MCP，以及只读操作接口。