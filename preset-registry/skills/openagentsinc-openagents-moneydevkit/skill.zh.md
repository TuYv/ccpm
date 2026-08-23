---
name: moneydevkit
description: Money Dev Kit workflows for Lightning checkout and agent wallets.
metadata:
  oa:
    project: moneydevkit
    identifier: moneydevkit
    version: "0.1.0"
    expires_at_unix: 1798761600
    capabilities:
      - http:outbound
      - filesystem:read
---
# Money Dev Kit

## 概述

使用 Money Dev Kit 集成闪电网络支付工作流。当任务涉及为自主智能体设置 `@moneydevkit/agent-wallet`、接入 `@moneydevkit/nextjs` 或 `@moneydevkit/replit` 结账流程、通过 `@moneydevkit/create` 初始化凭据、验证 MDK 环境变量，或应用混合架构约束（托管 API 加自托管节点）时，请使用此技能。

## 环境

- 需要 `bash`、`curl` 和 Node.js 20+。
- 需要能够通过互联网访问 npm 和 Money Dev Kit 服务。

此技能用于实现任务，而非高层次的闪电网络理论。

## 工作流

1. 首先选择正确的集成路径：
- `agent-wallet` 路径适用于自主智能体和 CLI 自动化（无需 API 账户）。
- `nextjs` 或 `replit` 结账路径适用于托管式结账 UI 和商品目录工作流（需要凭据）。

2. 运行预检：
- 对于钱包自动化路径，运行 `scripts/check-mdk-prereqs.sh agent-wallet`。
- 对于 API/结账路径，运行 `scripts/check-mdk-prereqs.sh checkout`。

3. 执行所选路径：
- 智能体钱包流程请参阅 [agent-wallet-operations](references/agent-wallet-operations.md)。
- 结账流程请参阅 [checkout-integration](references/checkout-integration.md)。

4. 应用架构和托管约束：
- 在最终确定部署方案之前，请使用 [architecture-and-self-hosting](references/architecture-and-self-hosting.md)。
- 明确处理助记词托管、API 密钥管理，以及自托管与托管服务之间的选择。

5. 验证结果：
- 对于钱包路径：能够执行 `receive`、`send`，并通过 JSON 响应查看 `payments`。
- 对于结账路径：能够创建结账、渲染托管式结账页面、公开 `/api/mdk`，并验证已支付状态。

## 快速命令

```bash
# Agent wallet path (signet recommended for testing)
npx @moneydevkit/agent-wallet@latest init --network signet
npx @moneydevkit/agent-wallet@latest status
npx @moneydevkit/agent-wallet@latest balance

# Checkout path credential bootstrap
npx @moneydevkit/create@latest
```

## 参考文件

- [agent-wallet-operations](references/agent-wallet-operations.md)：无需账户的自托管 CLI 工作流。
- [checkout-integration](references/checkout-integration.md)：Next.js/Replit 接入、环境变量和结账循环。
- [architecture-and-self-hosting](references/architecture-and-self-hosting.md)：混合模型、信任边界和自托管配置项。