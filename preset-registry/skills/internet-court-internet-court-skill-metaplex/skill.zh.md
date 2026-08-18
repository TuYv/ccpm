---
name: metaplex
description: Metaplex development on Solana — NFTs, tokens, compressed NFTs, candy machines, token launches, autonomous agents. Use when working with Token Metadata, Core, Bubblegum, Candy Machine, Genesis, Agent Registry, or the mplx CLI.
license: Apache-2.0
metadata:
  author: metaplex-foundation
  version: "0.3.0"
  openclaw: {"emoji":"💎","os":["darwin","linux","win32"],"requires":{"bins":["node"]},"homepage":"https://metaplex.com/docs"}
---
# Metaplex 开发技能

## 概述

Metaplex 为 Solana 上的 NFT 和代币提供标准基础设施：
- **Agent Registry**：为 MPL Core 资产提供链上代理身份、钱包和执行委托
- **Genesis**：提供公平分配和流动性毕业机制的代币发行协议
- **Core**：新一代 NFT 标准（推荐用于新的 NFT 项目）
- **Token Metadata**：同质化代币以及传统 NFT/pNFT
- **Bubblegum**：使用 Merkle 树的压缩 NFT（cNFT），以极低成本实现大规模应用
- **Candy Machine**：具有可配置铸造规则的 NFT 发售工具

## 工具选择

> **直接执行时优先使用 CLI，而不是 SDK**。只有当用户明确需要代码时才使用 SDK。

| 方式 | 使用场景 |
|----------|-------------|
| **CLI (`mplx`)** | 默认选择——直接执行，无需编写代码 |
| **Umi SDK** | 用户需要代码时使用——默认的 SDK 选择。涵盖所有程序（TM、Core、Bubblegum、Genesis） |
| **Kit SDK** | 用户明确使用 @solana/kit，或要求最少依赖时使用。仅支持 Token Metadata——不支持 Core/Bubblegum/Genesis |

## 任务路由

> **重要**：在执行任何命令或编写任何代码之前，必须先阅读与你的任务对应的详细文件。命令语法、必需标志、设置步骤和批处理规则**仅位于**详细文件中。不要凭记忆猜测命令。

| 任务类型 | 阅读此文件 |
|-----------|----------------|
| 任何 CLI 操作（代理指南、批处理、浏览器链接） | `./references/cli.md` |
| CLI：Agent Registry（身份、委托、撤销、代币关联） | `./references/cli.md` + `./references/cli-agent.md` |
| CLI：Core NFT/Collection | `./references/cli.md` + `./references/cli-core.md` + `./references/metadata-json.md` |
| CLI：Token Metadata NFT | `./references/cli.md` + `./references/cli-token-metadata.md` + `./references/metadata-json.md` |
| CLI：压缩 NFT（Bubblegum） | `./references/cli.md` + `./references/cli-bubblegum.md` + `./references/metadata-json.md` |
| CLI：Candy Machine（NFT 发售） | `./references/cli.md` + `./references/cli-candy-machine.md` + `./references/metadata-json.md` |
| CLI：代币发行 / bonding curve（Genesis） | `./references/cli.md` + `./references/cli-genesis.md` |
| CLI：执行 / 资产签名者钱包 / 代理金库 | `./references/cli.md` + `./references/cli-core.md`（execute 部分） |
| SDK：执行 / 资产签名者 PDA / 代理金库 | `./references/sdk-umi.md` + `./references/sdk-core.md`（execute 部分） |
| CLI：同质化代币 | `./references/cli.md` + `./references/cli-toolbox.md` |
| SDK 设置（Umi） | `./references/sdk-umi.md` |
| SDK：Core NFT | `./references/sdk-umi.md` + `./references/sdk-core.md` + `./references/metadata-json.md` |
| SDK：Token Metadata | `./references/sdk-umi.md` + `./references/sdk-token-metadata.md` + `./references/metadata-json.md` |
| SDK：压缩 NFT（Bubblegum） | `./references/sdk-umi.md` + `./references/sdk-bubblegum.md` + `./references/metadata-json.md` |
| SDK：使用 Kit 的 Token Metadata | `./references/sdk-token-metadata-kit.md` + `./references/metadata-json.md` |
| SDK：Agent Registry（身份、钱包、委托） | `./references/sdk-umi.md` + `./references/sdk-agent.md` |
| SDK：代币发行 + bonding curve 交换（Genesis） | `./references/sdk-umi.md` + `./references/sdk-genesis.md` |
| SDK：底层 Genesis（自定义 bucket、预售、归属） | `./references/sdk-umi.md` + `./references/sdk-genesis-low-level.md` |
| 链下 metadata JSON 格式/架构（NFT 或代币） | `./references/metadata-json.md` |
| 账户结构、PDA、概念 | `./references/concepts.md` |
| CLI 错误、本地网络问题 | `./references/cli-troubleshooting.md` |

## CLI 功能

`mplx` CLI 可以直接处理大多数 Metaplex 操作。**请先阅读 `./references/cli.md`，了解代理指南（批处理、JSON 输出、浏览器链接），然后再阅读对应程序的文件。**

> **CLI v0.1.0 破坏性变更**（适用于从旧版本迁移的代理/脚本）：
> - 现在使用 `--offchain <file>` 代替 `--json <file>`（后者曾用于传递链下元数据文件路径）。`--json` 现在是 OCLIF 用于机器可读输出的标准标志。
> - 现在所有命令在传入 `--json` 时都会返回结构化 JSON — 请将其用于程序化操作和代理场景。

| 任务 | CLI 支持 |
|------|-------------|
| 注册代理身份 | ✅ |
| 获取代理数据 | ✅ |
| 撤销执行委托 | ✅ |
| 设置代理代币（Genesis 链接） | ✅（需要资产签名者模式） |
| 创建同质化代币 | ✅ |
| 创建 Core NFT/Collection | ✅ |
| 创建 TM NFT/pNFT | ✅ |
| 转移 TM NFT | ✅ |
| 转移同质化代币 | ✅ |
| 转移 Core NFT | ✅ |
| 上传到 Irys | ✅ |
| Candy Machine 空投 | ✅（设置/配置/插入 — 铸造需要 SDK） |
| 压缩 NFT（cNFT） | ✅（批量限制约为 100 个，更大规模请使用 SDK） |
| 执行（资产签名者钱包） | ✅ |
| 检查 SOL 余额 / 空投 | ✅ |
| 按所有者/集合查询资产 | ❌ 仅支持 SDK（DAS API） |
| 代币发行（Genesis） | ✅ |
| 债券曲线交换（Genesis） | ✅ |

## 程序 ID

```
Agent Identity:  1DREGFgysWYxLnRnKQnwrxnJQeSMk2HmGaC6whw2B2p
Agent Tools:     TLREGni9ZEyGC3vnPZtqUh95xQ8oPqJSvNjvB7FGK8S
Genesis:         GNS1S5J5AspKXgpjz6SvKL66kPaKWAhaGRhCqPRxii2B
Core:            CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d
Token Metadata:  metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
Bubblegum V1:    BGUMAp9SX3uS4efGcFjPjkAQZ4cUNZhtHaMq64nrGf9D
Bubblegum V2:    BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY
Core Candy:      CMACYFENjoBMHzapRXyo1JZkVS6EtaDDzkjMrmQLvr4J
```

## 快速决策指南

### 自主代理

使用 **Agent Registry** 为 MPL Core 资产注册链上身份和执行委托。推荐使用 **Mint Agent API**（`mintAndSubmitAgent`） — 它会在单笔交易中创建 Core 资产并注册身份。对于现有资产，直接使用 `registerIdentityV1`。任何 Core 资产都已经通过 Core 的 Execute hook 内置了钱包（资产签名者 PDA）；注册表会添加可发现的身份记录，并允许所有者委托链下执行者来操作代理。代理还可以选择通过 `setAgentTokenV1` 关联 Genesis 代币。请阅读 `./references/cli-agent.md`（CLI），或阅读 `./references/sdk-umi.md` + `./references/sdk-agent.md`（SDK）。

### 代币发行（代币生成事件 / 公平发行 / 债券曲线）

使用 **Genesis**。推荐使用 **Launch API**（`genesis launch create` / `createAndRegisterLaunch`） — 它会通过一个步骤完成所有操作。发行类型有两种：
- **`launchpool`**（默认）：可配置的分配方案、48 小时存入期，以及支持团队归属
- **`bonding-curve`**：即时债券曲线（恒定乘积 AMM） — 无存入窗口，交易立即开始，售罄后自动毕业到 Raydium CPMM。支持创建者费用、首次购买和代理模式。

阅读 `./references/cli.md` + `./references/cli-genesis.md`（CLI）或 `./references/sdk-genesis.md`（SDK 启动流程）。对于自定义 bucket、预售和归属期，请使用 `./references/sdk-genesis-low-level.md`。

### NFT：Core 与 Token Metadata

| 选择 | 适用场景 |
|--------|------|
| **Core** | 新的 NFT 项目，成本更低（便宜 87%）、插件、版税执行 |
| **Token Metadata** | 已有的 TM 集合，需要 editions、用于兼容旧版的 pNFT |

### 压缩 NFT（超大规模）

当需要以最低成本铸造数千个以上的 NFT 时，使用 **Bubblegum**。请参阅 `./references/cli-bubblegum.md`（CLI）或 `./references/sdk-bubblegum.md`（SDK）。

### 同质化代币

始终使用 **Token Metadata**。CLI 命令请阅读 `./references/cli-toolbox.md`。

### NFT 空投

使用 **Core Candy Machine**。请阅读 `./references/cli.md` + `./references/cli-candy-machine.md`。

### 应用在不使用 Candy Machine 的情况下铸造到 Core 集合中

向 Core 集合创建资产需要集合的更新权限（或 `UpdateDelegate`）进行签名——用户的钱包无法完成此操作，并且权限密钥绝不能放在前端。应用需要以下任一方案：自定义链上程序（由 PDA 获得 `UpdateDelegate`，铸造逻辑位于该程序中），或由持有委托密钥对的后端/API 对铸造进行签名。在设计铸造流程之前，请阅读 `./references/sdk-core.md` 中的“Minting into a Collection from an App”部分。

### 作为代理 / 金库 / 钱包的资产（执行）

当资产（NFT、代理或金库）需要持有 SOL/代币、转移资金、签署交易或拥有其他资产时，使用 **Core Execute**。每个 Core 资产都有一个可充当自主钱包的签名者 PDA。请阅读 `./references/cli-core.md`（CLI）或 `./references/sdk-core.md`（SDK）中的 execute 部分。

## 更多信息

当任务所需的深入细节超出技能参考文档的范围时（边缘情况、完整 API 能力、指南），请查阅 Metaplex 文档：

- 文档主页：https://metaplex.com/docs
- Agent Registry：https://metaplex.com/docs/agents
- Genesis：https://metaplex.com/docs/smart-contracts/genesis
- Core：https://metaplex.com/docs/smart-contracts/core
- Token Metadata：https://metaplex.com/docs/smart-contracts/token-metadata
- Bubblegum：https://metaplex.com/docs/smart-contracts/bubblegum-v2
- Candy Machine：https://metaplex.com/docs/smart-contracts/core-candy-machine
- Tokens：https://metaplex.com/docs/tokens
- NFTs：https://metaplex.com/docs/nfts
- CLI：https://metaplex.com/docs/dev-tools/cli
- Umi SDK：https://metaplex.com/docs/dev-tools/umi
- DAS API：https://metaplex.com/docs/dev-tools/das-api
- 协议费用：https://metaplex.com/docs/protocol-fees