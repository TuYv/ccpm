---
name: alkahest-developer
description: Help developers write code that interacts with Alkahest escrow contracts using the TypeScript, Rust, or Python SDK
---
# Alkahest 开发者技能

## 何时使用

当开发者想要编写与 Alkahest 托管合约交互的代码时，使用此技能。包括：

- 将 Alkahest 集成到应用程序中
- 编写创建托管、履行义务或仲裁的机器人/代理
- 构建自定义仲裁器或义务合约
- 理解 SDK 模式和 API

## SDK 概览

| SDK | 语言 | 包 | 基础 |
|-----|----------|---------|------------|
| TypeScript | TypeScript/JavaScript | `@alkahest/ts-sdk` | viem |
| Rust | Rust | `alkahest-rs` | alloy |
| Python | Python | `alkahest-py` | 基于 Rust SDK 的 PyO3 包装器 |

## 客户端设置

### TypeScript

```typescript
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { makeClient } from "@alkahest/ts-sdk";

const walletClient = createWalletClient({
  account: privateKeyToAccount("0xPRIVATE_KEY"),
  chain: baseSepolia,
  transport: http("https://rpc-url"),
});

// Full client with all extensions
const client = makeClient(walletClient);

// Custom addresses (optional)
const client = makeClient(walletClient, customAddresses);

// Minimal client for custom extension patterns
const minimal = makeMinimalClient(walletClient);
const extended = minimal.extend((base) => ({
  custom: makeErc20Client(base.viemClient, pickErc20Addresses(base.contractAddresses)),
}));
```

### Rust

```rust
use alkahest_rs::AlkahestClient;

// Full client with all extensions (Base Sepolia default)
let client = AlkahestClient::with_base_extensions(
    "0xPRIVATE_KEY",
    "https://rpc-url",
    None, // uses Base Sepolia addresses
).await?;

// Custom addresses
use alkahest_rs::{DefaultExtensionConfig, ETHEREUM_SEPOLIA_ADDRESSES};
let client = AlkahestClient::with_base_extensions(
    "0xPRIVATE_KEY",
    "https://rpc-url",
    Some(ETHEREUM_SEPOLIA_ADDRESSES),
).await?;

// Bare client + custom extensions
let bare = AlkahestClient::new("0xPRIVATE_KEY", "https://rpc-url").await?;
let extended = bare.extend::<Erc20Module>(Some(erc20_config)).await?;
```

### Python

```python
from alkahest_py import PyAlkahestClient

# Full client with all extensions (Base Sepolia default)
client = PyAlkahestClient("0xPRIVATE_KEY", "https://rpc-url")

# Custom addresses
from alkahest_py import DefaultExtensionConfig, PyErc20Addresses, ...
config = DefaultExtensionConfig(erc20_addresses=..., ...)
client = PyAlkahestClient("0xPRIVATE_KEY", "https://rpc-url", config)
```

## 核心模式

### 创建托管

**TypeScript：**
```typescript
// 1. Approve token
await client.erc20.util.approve({ address: TOKEN, value: amount }, "escrow");

// 2. Create escrow
const { hash, attested } = await client.erc20.escrow.default.doObligation(
  client.erc20.escrow.default.encodeObligationRaw({
    token: TOKEN, amount, arbiter: ARBITER, demand: DEMAND_BYTES,
  }),
);
const escrowUid = attested.uid;
```

**Rust：**
```rust
// 1. Approve
client.erc20().approve(&Erc20Data { address: token, value: amount }, ApprovalPurpose::Escrow).await?;

// 2. Create escrow
let receipt = client.erc20().escrow().default().make_statement(
    token, amount, arbiter, demand_bytes, expiration,
).await?;
let attested = client.get_attested_event(receipt)?;
```

**Python:**
```python
# 1. Approve
await client.erc20.util.approve(token_address, amount, "escrow")

# 2. Create escrow
uid = await client.erc20.escrow.default.create(
    token=token_address, amount=amount,
    arbiter=arbiter_address, demand=demand_bytes,
    expiration=expiration,
)
```

### 使用 StringObligation 完成履约

**TypeScript:**
```typescript
const { attested } = await client.stringObligation.doObligation(
  "fulfillment content",
  undefined,  // schema
  escrowUid,  // refUID
);
```

**Rust:**
```rust
let receipt = client.string_obligation().do_obligation(
    "fulfillment content", None, Some(escrow_uid),
).await?;
```

**Python:**
```python
uid = await client.string_obligation.do_obligation(
    "fulfillment content",
    ref_uid=escrow_uid,
)
```

### 收取托管款项

**TypeScript:**
```typescript
const { hash } = await client.erc20.escrow.default.collectObligation(
  escrowUid,
  fulfillmentUid,
);
```

**Rust:**
```rust
let receipt = client.erc20().escrow().default().collect_payment(
    escrow_uid, fulfillment_uid,
).await?;
```

**Python:**
```python
tx_hash = await client.erc20.escrow.default.collect(escrow_uid, fulfillment_uid)
```

### 等待履约

**TypeScript:**
```typescript
const result = await client.waitForFulfillment(
  client.contractAddresses.erc20EscrowObligation,
  escrowUid,
);
```

**Rust:**
```rust
let log = client.wait_for_fulfillment(
    client.erc20_address(Erc20Contract::EscrowObligation),
    escrow_uid,
    None, // from_block
).await?;
```

**Python:**
```python
result = await client.wait_for_fulfillment(
    escrow_contract_address,
    escrow_uid,
)
```

### 编码需求

**TypeScript:**
```typescript
// Trusted oracle
const demand = client.arbiters.general.trustedOracle.encodeDemand({
  oracle: ORACLE, data: "0x",
});

// Logical composition
const demand = client.arbiters.logical.all.encodeDemand({
  arbiters: [ARBITER_A, ARBITER_B],
  demands: [DEMAND_A, DEMAND_B],
});

// Attestation properties
const demand = client.arbiters.attestationProperties.attester.encodeDemand({
  attester: REQUIRED_ATTESTER,
});
```

**Rust:**
```rust
// Trusted oracle (ABI encoding)
use alloy::sol_types::SolValue;
let demand = TrustedOracleArbiter::DemandData { oracle, data: Bytes::new() }.abi_encode();

// Decode arbiter demand (auto-detects)
let decoded = client.arbiters().decode_arbiter_demand(arbiter_addr, &demand_bytes)?;
```

**Python:**
```python
# Trusted oracle
demand = client.arbiters.trusted_oracle.encode_demand(oracle=ORACLE, data=b"")

# Logical composition
demand = client.arbiters.logical.all.encode(
    arbiters=[ARBITER_A, ARBITER_B],
    demands=[DEMAND_A, DEMAND_B],
)
```

### 提交-揭示模式

**TypeScript:**
```typescript
// 1. Compute commitment
const commitment = await client.commitReveal.computeCommitment(
  escrowUid, claimerAddress, { payload, salt, schema },
);
// 2. Commit (sends bond as ETH)
await client.commitReveal.commit(commitment, bondAmount, commitDeadline);
// 3. Wait 1+ blocks, then reveal. The matching bond is reclaimed on reveal.
await client.commitReveal.doObligation(
  { payload, salt, schema }, escrowUid,
);
```

**Rust：**
```rust
let commitment = client.commit_reveal().compute_commitment(
    escrow_uid, claimer, &obligation_data,
).await?;
client.commit_reveal().commit(commitment, bond_amount, commit_deadline).await?;
// wait 1+ blocks; the matching bond is reclaimed on reveal
let receipt = client.commit_reveal().do_obligation(&obligation_data, Some(escrow_uid)).await?;
```

**Python：**
```python
commitment = await client.commit_reveal.compute_commitment(
    escrow_uid, claimer, payload, salt, schema,
)
await client.commit_reveal.commit(commitment, bond_amount, commit_deadline)
# wait 1+ blocks; the matching bond is reclaimed on reveal
uid = await client.commit_reveal.do_obligation(payload, salt, schema, ref_uid=escrow_uid)
```

## 原子支付工具

原子支付工具为现有托管提供单笔交易的支付和收款：

**TypeScript：**
```typescript
await client.erc20.payment.payErc20AndCollect(escrowUid);
```

**Rust：**
```rust
client.erc20().payment().pay_erc20_and_collect(escrow_uid).await?;
```

## 关键类型差异

| 概念 | TypeScript | Rust | Python |
|---------|-----------|------|--------|
| 地址 | `` `0x${string}` `` | `Address` | `str`（十六进制） |
| 大整数 | `bigint` | `U256` | `str`（十进制） |
| 字节 | `` `0x${string}` `` | `Bytes` / `FixedBytes<32>` | `bytes` / `str`（十六进制） |
| 回执 | `{ hash, attested }` | `TransactionReceipt` | `str`（交易哈希或 uid） |
| 证明 | `Attestation` 对象 | `IEAS::Attestation` | `PyAttestation` |

## 参考文档

- `references/typescript-api.md` — 完整的 TS SDK API 树
- `references/rust-api.md` — 完整的 Rust SDK API 树
- `references/python-api.md` — 完整的 Python SDK API 树
- `references/contracts.md` — 合约地址和数据模式
- `docs/website/Escrow Flow/Token Trading.mdx` — 代币交易演练
- `docs/website/Escrow Flow/Job Trading.mdx` — 预言机仲裁演练
- `docs/drafts/Escrow Flow (pt 2b - Frontrunning Protection).md` — commit-reveal 抢跑保护
- `docs/website/Escrow Flow/Composing Demands.mdx` — 使用逻辑仲裁器组合需求
- `docs/website/Writing Arbiters/` — 自定义仲裁器开发
- `docs/website/Writing Escrow Contracts.md` 和 `docs/website/Writing Fulfillment Contracts.md` — 自定义托管/履约开发
- `docs/mcp-server/` — 用于查找合约详细信息的 MCP 服务器