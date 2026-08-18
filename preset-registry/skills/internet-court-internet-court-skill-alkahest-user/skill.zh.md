---
name: alkahest-user
description: Interact with Alkahest escrow contracts as a buyer, seller, or oracle using the CLI
---
# Alkahest 用户技能

## Alkahest 是什么？

Alkahest 是一个基于 EAS（Ethereum Attestation Service）的托管协议，用于在 EVM 链上进行无需信任的交换。它支持：

- **代币托管**，具有可编程的释放条件（ERC20、ERC721、ERC1155、原生代币、资产包）
- **基于仲裁者的验证** — 释放条件由检查履行情况的仲裁者合约定义
- **可组合的需求** — 使用 AND/OR 逻辑组合多个条件
- **预言机仲裁** — 链下验证并在链上提交决策
- **提交-揭示** — 为自包含的履行数据提供抢跑保护

支持的链：Base Sepolia、Sepolia、Ethereum 主网。

## 角色

| 角色 | 描述 |
|------|-------------|
| **买方** | 使用资产 + 需求创建托管（他们希望获得的回报） |
| **卖方** | 履行需求以领取托管资产 |
| **预言机** | 验证履行情况，并为 TrustedOracleArbiter 提交链上决策 |

## CLI 设置

通过 `npm install -g alkahest-cli` 全局安装，然后使用以下命令运行：

```bash
alkahest [global-flags] <command> <subcommand> [options]
```

### 身份验证

按以下优先级通过其中一种方式提供钱包：

| 方法 | Flag / Env Var |
|--------|---------------|
| 私钥 flag | `--private-key 0x...` |
| 助记词 flag | `--mnemonic "word1 word2 ..."` |
| Ledger USB | `--ledger [--ledger-path <path>]` |
| 私钥环境变量 | `ALKAHEST_PRIVATE_KEY=0x...` |
| 助记词环境变量 | `ALKAHEST_MNEMONIC="word1 word2 ..."` |
| 兼容环境变量 | `PRIVATE_KEY=0x...` |

### 全局 Flags

```
--chain <name>          base-sepolia (default) | sepolia | ethereum
--rpc-url <url>         Custom RPC URL (overrides chain default)
--human                 Human-readable output (default: JSON)
```

### 输出格式

默认输出 JSON（适合程序化使用或 agent 使用）。所有 BigInt 都会被序列化为字符串。

```json
{ "success": true, "data": { "hash": "0x...", "uid": "0x..." } }
{ "success": false, "error": { "code": "ESCROW_CREATE_FAILED", "message": "..." } }
```

使用 `--human` 可输出带标签且缩进的结果。

## 买方工作流：创建托管

### 1. 编码需求

首先，编码用于指定释放条件的需求数据：

```bash
# Trusted oracle demand — oracle must approve fulfillment
alkahest arbiter encode-demand \
  --type trusted-oracle \
  --oracle 0xORACLE_ADDRESS \
  --data 0x
# Returns: { "success": true, "data": { "encoded": "0x..." } }
```

### 2. 创建托管

使用 `--arbiter` 地址以及第 1 步中编码后的 `--demand` 十六进制数据：

```bash
# ERC20 escrow with auto-approve
alkahest --private-key 0xKEY escrow create \
  --erc20 \
  --token 0xTOKEN_ADDRESS \
  --amount 1000000000000000000 \
  --arbiter 0xARBITER_ADDRESS \
  --demand 0xENCODED_DEMAND \
  --expiration 1735689600 \
  --approve

# ERC721 escrow
alkahest --private-key 0xKEY escrow create \
  --erc721 \
  --token 0xNFT_ADDRESS \
  --token-id 42 \
  --amount 0 \
  --arbiter 0xARBITER_ADDRESS \
  --demand 0xENCODED_DEMAND \
  --expiration 1735689600 \
  --approve

# Native token (ETH) escrow — no approve needed
alkahest --private-key 0xKEY escrow create \
  --native \
  --token 0x0000000000000000000000000000000000000000 \
  --amount 500000000000000000 \
  --arbiter 0xARBITER_ADDRESS \
  --demand 0xENCODED_DEMAND \
  --expiration 1735689600
```

返回 `{ "success": true, "data": { "hash": "0x...", "uid": "0x...", ... } }`。保存 `uid` —— 这是托管 UID。

### 3. 等待履约

```bash
alkahest --private-key 0xKEY escrow wait \
  --erc20 --uid 0xESCROW_UID
# Blocks until fulfilled. Returns: { payment, fulfillment, fulfiller }
```

### 4. 取回已过期的托管（如果未履约）

```bash
alkahest --private-key 0xKEY escrow reclaim \
  --erc20 --uid 0xESCROW_UID
```

### 5. 获取托管详情

```bash
alkahest --private-key 0xKEY escrow get \
  --erc20 --uid 0xESCROW_UID
```

## 卖方工作流：履约托管

### 使用 StringObligation（链下验证的工作）

```bash
# 1. Create fulfillment referencing the escrow
alkahest --private-key 0xKEY string create \
  --item "Here is my completed deliverable" \
  --ref-uid 0xESCROW_UID
# Returns: { uid: "0xFULFILLMENT_UID", ... }

# 2. If escrow uses TrustedOracleArbiter, oracle arbitrates
alkahest --private-key 0xORACLE_KEY arbiter arbitrate \
  --obligation 0xFULFILLMENT_UID \
  --demand 0xDEMAND_HEX \
  --decision true

# 3. Collect the escrow
alkahest --private-key 0xSELLER_KEY escrow collect \
  --erc20 \
  --escrow-uid 0xESCROW_UID \
  --fulfillment-uid 0xFULFILLMENT_UID
```

### 使用 barter（代币兑换）

```bash
# Create a barter offer: bid ERC20 for ERC20
alkahest --private-key 0xKEY barter create \
  --bid-type erc20 --ask-type erc20 \
  --bid-token 0xBID_TOKEN --bid-amount 1000000000000000000 \
  --ask-token 0xASK_TOKEN --ask-amount 2000000000000000000 \
  --expiration 1735689600 \
  --approve

# Counterparty fulfills the barter
alkahest --private-key 0xCOUNTERPARTY_KEY barter fulfill \
  --uid 0xBARTER_UID \
  --bid-type erc20 --ask-type erc20 \
  --approve
```

支持的 barter 交易对：`erc20/erc20`、`erc20/erc721`、`erc20/erc1155`。`--permit` 仅在履约 ERC20 ask 时受支持。

## 预言机工作流：仲裁

```bash
# Approve a fulfillment
alkahest --private-key 0xORACLE_KEY arbiter arbitrate \
  --obligation 0xFULFILLMENT_UID \
  --demand 0xDEMAND_HEX \
  --decision true

# Reject a fulfillment
alkahest --private-key 0xORACLE_KEY arbiter arbitrate \
  --obligation 0xFULFILLMENT_UID \
  --demand 0xDEMAND_HEX \
  --decision false
```

对于自动仲裁（监听请求并自动作出决定），请直接使用 TypeScript SDK —— 参见 `references/typescript-sdk.md`。

## 提交-揭示工作流

当履约数据是自包含的（例如字符串答案）时，使用提交-揭示机制以防止抢先交易。

```bash
# 1. Compute commitment hash
alkahest --private-key 0xKEY commit-reveal compute-commitment \
  --ref-uid 0xESCROW_UID \
  --claimer 0xSELLER_ADDRESS \
  --payload 0xPAYLOAD_HEX \
  --salt 0xSALT_HEX \
  --schema 0xSCHEMA_UID
# Returns: { commitment: "0x..." }

# 2. Commit (sends bond as ETH)
alkahest --private-key 0xKEY commit-reveal commit \
  --commitment 0xCOMMITMENT_HASH \
  --bond-amount 10000000000000000

# 3. Wait at least 1 block, then reveal
alkahest --private-key 0xKEY commit-reveal reveal \
  --payload 0xPAYLOAD_HEX \
  --salt 0xSALT_HEX \
  --schema 0xSCHEMA_UID \
  --ref-uid 0xESCROW_UID
# Returns: { uid: "0xOBLIGATION_UID", ... }

# Check deadline and slashed bond recipient
alkahest --private-key 0xKEY commit-reveal info

# Slash an unrevealed commitment's bond
alkahest --private-key 0xKEY commit-reveal slash-bond \
  --commitment 0xCOMMITMENT_HASH
```

## 需求编码

`arbiter encode-demand` 命令可为任意仲裁器类型编码需求数据：

```bash
# Trusted oracle
alkahest arbiter encode-demand --type trusted-oracle \
  --oracle 0xORACLE --data 0x

# Attestation property arbiters
alkahest arbiter encode-demand --type recipient --recipient 0xADDRESS
alkahest arbiter encode-demand --type attester --attester 0xADDRESS
alkahest arbiter encode-demand --type schema --schema 0xSCHEMA_UID
alkahest arbiter encode-demand --type time-after --time 1735689600

# Logical composition (AllArbiter / AnyArbiter)
alkahest arbiter encode-demand --type all \
  --demands '[{"arbiter":"0xARB1","demand":"0xDEM1"},{"arbiter":"0xARB2","demand":"0xDEM2"}]'

alkahest arbiter encode-demand --type any \
  --demands '[{"arbiter":"0xARB1","demand":"0xDEM1"},{"arbiter":"0xARB2","demand":"0xDEM2"}]'
```

可用的 `--type` 值：`trusted-oracle`、`all`、`any`、`recipient`、`attester`、`schema`、`uid`、`ref-uid`、`revocable`、`time-after`、`time-before`、`time-equal`、`expiration-time-after`、`expiration-time-before`、`expiration-time-equal`。

### 需求解码

```bash
alkahest arbiter decode-demand \
  --arbiter 0xARBITER_ADDRESS \
  --demand 0xENCODED_HEX
```

## 确认仲裁器

用于买方手动批准履约：

```bash
# Confirm a fulfillment
alkahest --private-key 0xBUYER_KEY arbiter confirm \
  --fulfillment 0xFULFILLMENT_UID \
  --escrow 0xESCROW_UID \
  --type exclusive-revocable

# Revoke confirmation (revocable variants only)
alkahest --private-key 0xBUYER_KEY arbiter revoke \
  --fulfillment 0xFULFILLMENT_UID \
  --escrow 0xESCROW_UID \
  --type exclusive-revocable
```

类型：`exclusive-revocable`、`exclusive-unrevocable`、`nonexclusive-revocable`、`nonexclusive-unrevocable`。

## 支付

```bash
# ERC20 payment with auto-approve
alkahest --private-key 0xKEY payment pay \
  --erc20 \
  --token 0xTOKEN --amount 1000000000000000000 \
  --payee 0xRECIPIENT \
  --approve

# Native token payment
alkahest --private-key 0xKEY payment pay \
  --native \
  --token 0x0000000000000000000000000000000000000000 \
  --amount 500000000000000000 \
  --payee 0xRECIPIENT

# Get payment details
alkahest --private-key 0xKEY payment get --erc20 --uid 0xUID
```

## 证明

```bash
# Get raw attestation by UID
alkahest --private-key 0xKEY attestation get --uid 0xUID

# Decode attestation data by type
alkahest --private-key 0xKEY attestation decode \
  --uid 0xUID --type erc20-escrow
```

解码类型：`erc20-escrow`、`erc20-payment`、`erc721-escrow`、`erc721-payment`、`erc1155-escrow`、`erc1155-payment`、`string`、`commit-reveal`。

## 配置

```bash
# Show contract addresses for a chain
alkahest config show --chain base-sepolia

# List supported chains
alkahest config chains
```

## 托管类型

| 类型 | 标志 | 关键选项 |
|------|------|------------|
| ERC20 | `--erc20` | `--token`、`--amount` |
| ERC721 | `--erc721` | `--token`、`--token-id` |
| ERC1155 | `--erc1155` | `--token`、`--token-id`、`--amount` |
| 原生代币 | `--native` | `--amount` |
| 代币捆绑包 | `--bundle` | （仅 SDK 支持创建） |

所有托管类型都遵循相同的工作流程：创建 -> 等待 -> 收取（或在过期时收回）。

## 其他资源

- 有关 TypeScript SDK 的使用（复杂工作流、自动仲裁、捆绑托管），请参阅 `references/typescript-sdk.md`
- 有关所有合约地址和义务数据架构，请参阅 `references/contracts.md`
- 有关所有仲裁者类型和需求编码模式，请参阅 `references/arbiters.md`