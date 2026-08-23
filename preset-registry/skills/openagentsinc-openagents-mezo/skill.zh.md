---
name: mezo
description: Mezo integration workflows for apps, autonomous agents, and Mezo Earn operations.
metadata:
  oa:
    project: mezo
    identifier: mezo
    version: "0.2.0"
    expires_at_unix: 1798761600
    capabilities:
      - http:outbound
      - filesystem:read
---
# Mezo

## 概述

将应用程序和智能体工作流与 Mezo 协议集成。当任务需要设置 Mezo 网络（测试网/主网）、配置 Hardhat 或 Foundry、连接 Mezo Passport 钱包、执行 mezod/validator-kit 操作、实现 Mezo Earn 自动化（锁定/投票/领取/poke/激励），进行合约部署验证，或满足 Mezo 特定的 dApp 要求（例如使用 BTC 支付 Gas 以及 MUSD 集成要求）时，请使用此技能。

## 环境

- 需要 `bash` 和 `curl`。
- Hardhat/Passport 工作流需要 Node.js。
- `mezod` 工作流需要 Go。

当用户需要实际的 Mezo 集成工作，而不是通用的区块链建议时，请执行此工作流。

## 工作流

1. 首先选择集成目标：
- 应用层 EVM 集成（Hardhat/Foundry + RPC + 部署流程）。
- 钱包用户体验集成（标准 EVM 钱包或 Mezo Passport）。
- 节点/运营者路径（`mezod` 和 validator-kit）。
- Mezo Earn 操作（veBTC 生命周期、计量器投票、奖励领取和激励发布）。

2. 根据 [network-and-env](references/network-and-env.md) 配置网络和工具链：
- 设置正确的链（测试网为 `31611`，主网为 `31612`）。
- 应用 Hardhat/Foundry 配置。
- 使用 `scripts/check-rpc.sh` 验证 RPC 健康状况和链 ID，或使用 `scripts/preflight.sh` 执行完整的预检。

3. 根据 [passport-and-wallet](references/passport-and-wallet.md) 实现钱包连接路径：
- 如果应用同时需要 BTC 原生钱包和 EVM 钱包选项，请使用 Mezo Passport。
- 如果不需要 Passport，请使用标准 EVM 钱包流程和手动网络配置。

4. 如果任务与 Mezo Earn 相关，请遵循 [mezo-earn-automation](references/mezo-earn-automation.md)：
- 使用 Mezo 文档和 tigris 部署中提供的规范主网/测试网合约。
- 围绕 `vote`、`poke` 和奖励领取构建可感知 epoch 的自动化循环。
- 对锁定更新、投票和激励发布应用安全限制。

5. 完成部署健全性检查：
- 确认 RPC 返回预期的链 ID。
- 使用已配置的签名者/提供者部署合约。
- 在正确的区块浏览器（`explorer.test.mezo.org` 或 `explorer.mezo.org`）上确认交易。

6. 发布前应用 Mezo 特定约束：
- BTC 是 Gas 资产。
- 如果用户询问 Mezo Market 功能是否已准备就绪，请强制执行参考资料中的要求（MUSD 集成、审计报告、主网功能）。

7. 如果任务与节点/验证者相关，请遵循 [mezod-and-validator-kit](references/mezod-and-validator-kit.md)：
- 选择部署模式（docker/native/helm/manual）。
- 遵循同步和运维要求。
- 仅在请求验证者加入网络时包含 PoA 提交命令。

## 快速命令

```bash
# Testnet RPC health + chain id check
scripts/check-rpc.sh https://rpc.test.mezo.org 31611

# Mainnet provider check
scripts/check-rpc.sh https://rpc-http.mezo.boar.network 31612

# Preflight with signer + RPC failover
scripts/preflight.sh testnet ~/.config/openagents/mezo-agent.env
scripts/preflight.sh mainnet ~/.config/openagents/mezo-agent.env
```

## 参考文件

- [network-and-env](references/network-and-env.md)：链参数、RPC 端点、Hardhat/Foundry 配置、部署验证。
- [passport-and-wallet](references/passport-and-wallet.md)：Mezo Passport 设置和钱包路径决策。
- [mezo-earn-automation](references/mezo-earn-automation.md)：Mezo Earn 的合约映射、ABI 方法和智能体自动化循环。
- [mezod-and-validator-kit](references/mezod-and-validator-kit.md)：mezod 前置条件、validator-kit 模式、同步/PoA 操作。