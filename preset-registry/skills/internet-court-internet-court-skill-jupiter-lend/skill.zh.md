---
name: jupiter-lend
version: 0.1.3
description: Interact with Jupiter Lend Protocol. Read-only SDK (@jup-ag/lend-read) for querying liquidity pools, lending markets (jlTokens), and vaults. Write SDK (@jup-ag/lend) for lending (deposit/withdraw) and vault operations (deposit collateral, borrow, repay, manage positions).
homepage: https://jup.ag/lend
metadata:
  protocol: jupiter-lend
  category: defi
  chains: [solana]
---
# Jupiter Lend 协议

Jupiter Lend（由 Fluid Protocol 提供支持）是 Solana 上的借贷协议。它提供**流动性池**、**借贷市场（jlTokens）**以及用于杠杆头寸的**Vault**。

该协议使用两个主要 SDK：

- `@jup-ag/lend-read`：用于所有程序（Liquidity、Lending、Vaults）的只读查询
- `@jup-ag/lend`：用于写入操作（存入、提取、借款、还款）

## Agent 使用

以下是一些可用于演示 Jupiter Lend 集成的示例提示：

- 发现所有可用的 Vault 并列出它们
- 获取某个用户的所有 Vault 头寸
- 在单笔交易中存入抵押品并借款
- 为某个头寸偿还最大债务并提取最大抵押品
- 获取用户的 Earn（jlToken）头寸和底层资产余额
- 为套利或清算构建闪电贷
- 获取某个代币的流动性利率和 APY
- 创建新的 Vault 头寸（positionId 0）、存入抵押品并借款

## SDK 安装

```bash
# For read operations (queries, prices, positions)
npm install @jup-ag/lend-read

# For write operations (transactions)
npm install @jup-ag/lend
```

---

# 1. 核心概念与协议术语

理解 Jupiter Lend 的架构和术语，有助于你构建更好的集成。

### 架构：双层模型

- **流动性层（单一订单簿）**：所有资产所在的基础层。它管理代币限额、利率曲线和统一流动性。用户不会直接与此层交互。
- **协议层**：面向用户的模块（Lending 和 Vaults），位于流动性层之上，并通过跨程序调用（CPIs）与其交互。

### 术语

- **jlToken（Jupiter Lend Token）**：向 Lending 协议供应代币时收到的生息资产（例如 `jlUSDC`）。随着利息累积，兑换率会提高，使你的 `jlToken` 价值更多底层 `USDC`。
- **Exchange Price**：用于在“原始”存储数量和实际代币数量之间进行换算的汇率。随着供应资产产生利息或债务累积利息，该汇率会持续上升。
- **Collateral Factor (CF)**：开立或管理头寸时允许的最大贷款价值比（LTV）。
- **Liquidation Threshold (LT)**：头寸变得抵押不足并符合清算条件时的 LTV。
- **Liquidation Max Limit (LML)**：LTV 的绝对最大上限。如果头寸的风险比率超过此边界，协议会自动吸收该头寸，以保护流动性提供者。
- **Liquidation Penalty**：清算人在代表高风险头寸偿还债务时获得的折扣比例。
- **Rebalance**：将上层协议的记账（Vaults/Lending）与其在流动性层上的实际头寸同步的操作。它还会同步订单簿，以计入任何已激活的累积奖励。
- **Tick-based Architecture**：Vaults 协议根据风险等级（债务与抵押品的比率）将头寸分组到不同的“ticks”中。这使协议能够高效地管理风险，并大规模处理清算。
- **Dust Borrow**：有意保留在头寸中的极小剩余债务，用于处理除法取整带来的复杂情况。
- **Sentinel Values**：`MAX_WITHDRAW_AMOUNT` 和 `MAX_REPAY_AMOUNT` 等常量，用于告知协议动态计算某个头寸在数学上可能提取/偿还的最大数量。

### 金额和单位

所有 SDK 金额均使用**基础单位**（最小代币单位，例如，对于 6 位小数，`1_000_000` = 1 USDC）。

---

# 2. Jupiter Earn（借贷）

Jupiter Earn 允许用户供应资产以赚取收益。作为回报，用户会收到生息的 `jlTokens`（例如 `jlUSDC`）。

### 借贷模块（jlTokens）

访问 jlToken（Jupiter Lend 代币）市场、兑换价格和用户头寸。

```typescript
// Get all jlToken details at once
const allDetails = await client.lending.getAllJlTokenDetails();

// Get user's jlToken balance
const position = await client.lending.getUserPosition(USDC, userPublicKey);
```

## 借贷（Earn）

存入底层资产以获得生息代币，或提取这些资产。

```typescript
import { getDepositIxs, getWithdrawIxs } from "@jup-ag/lend/earn";
import BN from "bn.js";

// Deposit 1 USDC (base units: 1_000_000 for 6 decimals)
const { ixs: depositIxs } = await getDepositIxs({
  amount: new BN(1_000_000),
  asset: USDC_PUBKEY,
  signer: userPublicKey,
  connection,
});

// Withdraw 0.1 USDC (100_000 base units @ 6 decimals)
const { ixs: withdrawIxs } = await getWithdrawIxs({
  amount: new BN(100_000),
  asset: USDC_PUBKEY,
  signer: userPublicKey,
  connection,
});
```

---

# 3. Jupiter Borrow（Vaults）

Vault 负责处理抵押品存入和债务借款。

### Vault 模块与发现

访问 Vault 配置、头寸、兑换价格和清算数据。这对于动态列出所有可用的杠杆市场至关重要。

```typescript
// Discover all available vaults
const allVaults = await client.vault.getAllVaults();
const totalVaults = allVaults.length;

// Get comprehensive vault data (config + state + rates + limits) for a specific vault
const vaultId = 1;
const vaultData = await client.vault.getVaultByVaultId(vaultId);

// Check borrowing limits dynamically before prompting users
const borrowLimit = vaultData.limitsAndAvailability.borrowLimit;
const borrowable = vaultData.limitsAndAvailability.borrowable;
```

---

### 查找用户 Vault 头寸

在执行 Vault 操作（例如存入、借款或还款）之前，需要知道用户现有的 `positionId`（该 ID 对应一个 NFT）。

```typescript
const userPublicKey = new PublicKey("YOUR_WALLET_PUBKEY");

// Retrieve all positions owned by the user
// Each position includes full vault data: NftPosition & { vault: VaultEntireData }
const positions = await client.vault.getAllUserPositions(userPublicKey);

positions.forEach((p) => {
  console.log(`Position ID (nftId): ${p.nftId}`);
  console.log(`Vault ID: ${p.vault.constantViews.vaultId}`);
  console.log(`Collateral Supplied: ${p.supply.toString()}`);
  console.log(`Debt Borrowed: ${p.borrow.toString()}`);
});
```

## Vault（借款）

Vault 负责处理抵押品存入和债务借款。**所有 Vault 操作均使用 `getOperateIx` 函数。**

操作方向由 `colAmount` 和 `debtAmount` 的符号决定：

- **存入**：`colAmount` > 0，`debtAmount` = 0
- **提取**：`colAmount` < 0，`debtAmount` = 0
- **借款**：`colAmount` = 0，`debtAmount` > 0
- **还款**：`colAmount` = 0，`debtAmount` < 0

**哨兵值**：`MAX_REPAY_AMOUNT` 和 `MAX_WITHDRAW_AMOUNT` 已经带有符号（为负数）；请直接传入，不要对它们调用 `.neg()`。

**重要**：如果 `positionId` 为 `0`，则会创建一个新的头寸 NFT，SDK 会返回新的 `positionId`。

### 常见 Vault 模式

**1. 存入抵押品**

```typescript
import { getOperateIx } from "@jup-ag/lend/borrow";

// Deposit 1 USDC (base units: 1_000_000 for 6 decimals)
const { ixs, addressLookupTableAccounts, positionId: newPositionId } = await getOperateIx({
  vaultId: 1,
  positionId: 0, // 0 = create new position
  colAmount: new BN(1_000_000), // Positive = Deposit
  debtAmount: new BN(0),
  connection,
  signer,
});
```

**2. 借入债务**

```typescript
// Borrow 0.5 USDC (500_000 base units @ 6 decimals)
const { ixs, addressLookupTableAccounts } = await getOperateIx({
  vaultId: 1,
  positionId: EXISTING_POSITION_ID, // Use the nftId retrieved from the read SDK
  colAmount: new BN(0),
  debtAmount: new BN(500_000), // Positive = Borrow (0.5 USDC @ 6 decimals)
  connection,
  signer,
});
```

**3. 偿还债务（使用最大值哨兵）**

当用户希望偿还其*全部*债务时，不要尝试计算精确的微小余量。请使用 SDK 导出的 `MAX_REPAY_AMOUNT` 哨兵值。

```typescript
import { getOperateIx, MAX_REPAY_AMOUNT } from "@jup-ag/lend/borrow";

const { ixs, addressLookupTableAccounts } = await getOperateIx({
  vaultId: 1,
  positionId: EXISTING_POSITION_ID,
  colAmount: new BN(0),
  debtAmount: MAX_REPAY_AMOUNT, // Tells the protocol to clear the full debt
  connection,
  signer,
});
```

**4. 提取抵押品（使用最大值哨兵）**

同样地，要提取全部可用抵押品，请使用 `MAX_WITHDRAW_AMOUNT` 哨兵值。

```typescript
import { getOperateIx, MAX_WITHDRAW_AMOUNT } from "@jup-ag/lend/borrow";

const { ixs, addressLookupTableAccounts } = await getOperateIx({
  vaultId: 1,
  positionId: EXISTING_POSITION_ID,
  colAmount: MAX_WITHDRAW_AMOUNT, // Tells the protocol to withdraw everything
  debtAmount: new BN(0),
  connection,
  signer,
});
```

**5. 组合操作**

你可以使用 `getOperateIx` 在一笔交易中批量执行多个操作，例如存入抵押品 + 借款，或偿还债务 + 提取抵押品：

- **a. 在一笔交易中存入抵押品 + 借款：**
同时传入 `colAmount` 和 `debtAmount`，即可同时存入抵押品并借款。
  ```typescript
  const { ixs, addressLookupTableAccounts } = await getOperateIx({
    vaultId: 1,
    positionId: 0, // Create new position
    colAmount: new BN(1_000_000), // Deposit 1 USDC (6 decimals)
    debtAmount: new BN(500_000),  // Borrow 0.5 USDC (6 decimals)
    connection,
    signer,
  });
  ```
- **b. 在一笔交易中偿还债务 + 提取抵押品：**
同时偿还债务并提取抵押品。要全部偿还债务或提取最大可用数量，请使用最大值哨兵。
  ```typescript
  import { getOperateIx, MAX_WITHDRAW_AMOUNT, MAX_REPAY_AMOUNT } from "@jup-ag/lend/borrow";

  const { ixs, addressLookupTableAccounts } = await getOperateIx({
    vaultId: 1,
    positionId: EXISTING_POSITION_ID,
    colAmount: MAX_WITHDRAW_AMOUNT, // Withdraw all collateral
    debtAmount: MAX_REPAY_AMOUNT,   // Repay all debt
    connection,
    signer,
  });
  ```

---

---

# 4. 闪电贷

闪电贷允许你从协议中借入流动性，而无需预先提供抵押品。在完全相同的交易中归还借入的金额——**不收取闪电贷费用**。你可以直接借入所需资产，用于套利、清算或其他用途。

### 执行闪电贷（@jup-ag/lend）

`@jup-ag/lend` SDK 提供了简单的辅助函数，用于获取执行闪电贷所需的指令。最便捷的方式是使用 `getFlashloanIx`。

```typescript
import { getFlashloanIx } from "@jup-ag/lend/flashloan";
import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import BN from "bn.js";

async function executeFlashloan() {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const signer = new PublicKey("YOUR_WALLET_PUBKEY");
  const asset = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC

  const borrowAmount = new BN(100_000_000); // 100 USDC (base units, 6 decimals)

  // 1. Get the borrow and payback instructions
  const { borrowIx, paybackIx } = await getFlashloanIx({
    connection,
    signer,
    asset,
    amount: borrowAmount,
  });

  // 2. Define your custom instructions that utilize the borrowed funds
  const myCustomArbitrageInstructions = [
    // ... your instructions here
  ];

  // 3. Assemble the transaction: Borrow -> Custom Logic -> Payback
  const instructions = [
    borrowIx,
    ...myCustomArbitrageInstructions,
    paybackIx
  ];

  const latestBlockhash = await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: signer,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);
  // Sign and send...
}
```

---

# 5. 流动性

流动性层是 Jupiter Lend 的基础，持有所有底层资产。虽然你通常会与 Earn 层和 Borrow 层交互，但直接查询流动性层对于分析、仪表板和 APY 聚合器非常有用。

### 流动性模块

访问流动性池数据、利率以及用户的供应/借款头寸。

```typescript
const USDC = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// Get market data for a token (rates, prices, utilization)
const data = await client.liquidity.getOverallTokenData(USDC);

// View rates (basis points: 10000 = 100%)
const supplyApr = Number(data.supplyRate) / 100;
const borrowApr = Number(data.borrowRate) / 100;
```

---

# 6. Jupiter Lend 构建工具包

Jupiter Lend 构建工具包提供开发者组件、强大的实用工具和深入的文档，帮助你高效地构建 Jupiter Lend 应用并与其集成。

**基础 URL**：[https://developers.jup.ag/docs/lend](https://developers.jup.ag/docs/lend)

### 构建工具包文档索引

- **入门**：[概览](https://developers.jup.ag/docs/lend)、[API 与 SDK](https://developers.jup.ag/docs/lend/api-vs-sdk)
- **Earn**：[概览](https://developers.jup.ag/docs/lend/earn)、[存款](https://developers.jup.ag/docs/lend/earn/deposit)、[取款](https://developers.jup.ag/docs/lend/earn/withdraw)、[读取数据](https://developers.jup.ag/docs/lend/earn/read-data)
- **钱包集成（Privy）**：[使用 Privy 进行 Earn](https://developers.jup.ag/docs/lend/wallets/privy-earn)、[使用 Privy 进行 Borrow](https://developers.jup.ag/docs/lend/wallets/privy-borrow)
- **Borrow**：[概览](https://developers.jup.ag/docs/lend/borrow)、[创建头寸](https://developers.jup.ag/docs/lend/borrow/create-position)、[存款](https://developers.jup.ag/docs/lend/borrow/deposit)、[借款](https://developers.jup.ag/docs/lend/borrow/borrow)、[还款](https://developers.jup.ag/docs/lend/borrow/repay)、[取款](https://developers.jup.ag/docs/lend/borrow/withdraw)、[组合操作](https://developers.jup.ag/docs/lend/borrow/combined)、[清算](https://developers.jup.ag/docs/lend/borrow/liquidation)、[读取金库数据](https://developers.jup.ag/docs/lend/borrow/read-vault-data)
- **闪电贷**：[概览](https://developers.jup.ag/docs/lend/flashloan)、[执行](https://developers.jup.ag/docs/lend/flashloan/execute)
- **高级功能**：[高级/乘数操作](https://developers.jup.ag/docs/lend/advanced/multiply)、[高级/解除操作](https://developers.jup.ag/docs/lend/advanced/unwind)、[高级/使用抵押品还款并取出](https://developers.jup.ag/docs/lend/advanced/repay-with-collateral-max-withdraw)、[高级/金库兑换](https://developers.jup.ag/docs/lend/advanced/vault-swap)、[高级/存款后的利用率](https://developers.jup.ag/docs/lend/advanced/utilization-after-deposit)、[高级/原生质押金库/概览](https://developers.jup.ag/docs/lend/advanced/native-staked-vault)、[高级/原生质押金库/存款](https://developers.jup.ag/docs/lend/advanced/native-staked-vault/deposit)、[高级/原生质押金库/取款](https://developers.jup.ag/docs/lend/advanced/native-staked-vault/withdraw)
- **流动性**：[流动性/分析](https://developers.jup.ag/docs/lend/liquidity/analytics)
- **资源**：[资源/程序地址](https://developers.jup.ag/docs/lend/program-addresses)、[资源/IDL 与类型](https://developers.jup.ag/docs/lend/idl-and-types)、[资源/Dune](https://developers.jup.ag/docs/lend/dune)

---

# 7. 完整可运行示例

> 可直接复制粘贴的脚本。安装依赖：`npm install @solana/web3.js bn.js @jup-ag/lend @jup-ag/lend-read`

### 示例 1 — 发现头寸并存入（先读后写）

此示例演示如何使用只读 SDK（`@jup-ag/lend-read`）查询用户现有的 vault 头寸。如果目标 vault 存在头寸，则使用其 NFT ID。如果不存在，则改为创建新的头寸。最后，使用写入 SDK（`@jup-ag/lend`）将抵押品存入该头寸。

```typescript
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { Client } from "@jup-ag/lend-read";
import { getOperateIx } from "@jup-ag/lend/borrow";
import fs from "fs";
import path from "path";

const KEYPAIR_PATH = "/path/to/your/keypair.json";
const RPC_URL = "https://api.mainnet-beta.solana.com";
const VAULT_ID = 1;

const DEPOSIT_AMOUNT = new BN(1_000_000); // 1 USDC @ 6 decimals

function loadKeypair(keypairPath: string): Keypair {
  const fullPath = path.resolve(keypairPath);
  const secret = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  return Keypair.fromSecretKey(new Uint8Array(secret));
}

async function main() {
  const userKeypair = loadKeypair(KEYPAIR_PATH);
  const connection = new Connection(RPC_URL, { commitment: "confirmed" });
  const signer = userKeypair.publicKey;

  // 1. Read Data: Find existing user positions for the vault
  const client = new Client(connection);
  const positions = await client.vault.getAllUserPositions(signer);

  let targetPositionId = 0; // 0 = create new position

  const existing = positions.find((p) => p.vault.constantViews.vaultId === VAULT_ID);
  if (existing) {
    targetPositionId = existing.nftId;
    console.log(`Found existing position NFT: ${targetPositionId}`);
  }

  if (targetPositionId === 0) {
    console.log("No existing position found. Will create a new one.");
  }

  // 2. Write Data: Execute deposit
  const { ixs, addressLookupTableAccounts, nftId } = await getOperateIx({
    vaultId: VAULT_ID,
    positionId: targetPositionId,
    colAmount: DEPOSIT_AMOUNT,
    debtAmount: new BN(0), // Deposit only
    connection,
    signer,
  });

  if (!ixs?.length) throw new Error("No instructions returned.");

  // 3. Build the V0 Transaction Message
  const latestBlockhash = await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: signer,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: ixs,
  }).compileToV0Message(addressLookupTableAccounts ?? []);

  // 4. Sign and Send
  const transaction = new VersionedTransaction(message);
  transaction.sign([userKeypair]);

  const signature = await connection.sendTransaction(transaction, {
    skipPreflight: false,
    maxRetries: 3,
    preflightCommitment: "confirmed",
  });

  await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed");

  console.log(`Deposit successful! Signature: ${signature}`);
  if (targetPositionId === 0) {
    console.log(`New position created with NFT ID: ${nftId}`);
  }
}

main().catch(console.error);
```

---

### 示例 2 — 组合操作（存入、借款、还款、提取）

此示例演示如何创建一个头寸、存入抵押品并在单笔交易中借入债务。随后，它会在后续交易中使用完全相同的 `getOperateIx` 函数偿还债务并提取抵押品。它还展示了合并多个指令集时对 **地址查找表（ALTs）去重** 的关键步骤。

```typescript
import {
  Connection,
  Keypair,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { getOperateIx } from "@jup-ag/lend/borrow";
import fs from "fs";
import path from "path";

const KEYPAIR_PATH = "/path/to/your/keypair.json";
const RPC_URL = "https://api.mainnet-beta.solana.com";
const VAULT_ID = 1;

const DEPOSIT_AMOUNT = new BN(1_000_000);  // 1 USDC @ 6 decimals
const BORROW_AMOUNT = new BN(500_000);    // 0.5 USDC @ 6 decimals
const REPAY_AMOUNT = new BN(100_000);     // 0.1 USDC @ 6 decimals
const WITHDRAW_AMOUNT = new BN(200_000);  // 0.2 USDC @ 6 decimals

function loadKeypair(keypairPath: string): Keypair {
  const fullPath = path.resolve(keypairPath);
  const secret = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  return Keypair.fromSecretKey(new Uint8Array(secret));
}

async function main() {
  const userKeypair = loadKeypair(KEYPAIR_PATH);
  const connection = new Connection(RPC_URL, { commitment: "confirmed" });
  const signer = userKeypair.publicKey;

  // 1. Create position + Deposit + Borrow
  const { ixs: depositBorrowIxs, addressLookupTableAccounts: depositBorrowAlts, positionId } = await getOperateIx({
    vaultId: VAULT_ID,
    positionId: 0,
    colAmount: DEPOSIT_AMOUNT,
    debtAmount: BORROW_AMOUNT,
    connection,
    signer,
  });

  // 2. Repay + Withdraw
  const repayWithdrawResult = await getOperateIx({
    vaultId: VAULT_ID,
    positionId: positionId!,
    colAmount: WITHDRAW_AMOUNT.neg(),
    debtAmount: REPAY_AMOUNT.neg(),
    connection,
    signer,
  });

  // Merge instructions
  const allIxs = [...(depositBorrowIxs ?? []), ...(repayWithdrawResult.ixs ?? [])];

  // Merge and Deduplicate Address Lookup Tables (ALTs)
  const allAlts = [
    ...(depositBorrowAlts ?? []),
    ...(repayWithdrawResult.addressLookupTableAccounts ?? []),
  ];
  const seenKeys = new Set<string>();
  const mergedAlts = allAlts.filter((alt) => {
    const k = alt.key.toString();
    if (seenKeys.has(k)) return false;
    seenKeys.add(k);
    return true;
  });

  if (!allIxs.length) throw new Error("No instructions returned.");

  // Build the V0 Transaction Message
  const latestBlockhash = await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: signer,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: allIxs,
  }).compileToV0Message(mergedAlts);

  // Sign and Send
  const transaction = new VersionedTransaction(message);
  transaction.sign([userKeypair]);

  const signature = await connection.sendTransaction(transaction, {
    skipPreflight: false,
    maxRetries: 3,
    preflightCommitment: "confirmed",
  });

  await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed");

  console.log("Combined operate successful! Signature:", signature);
}

main().catch(console.error);
```

---

# 8. 资源

## API 文档

- **Jupiter Lend 概览**: [developers.jup.ag/docs/lend](https://developers.jup.ag/docs/lend)
- **Lend API（Earn）**: [api-reference/lend/earn](https://developers.jup.ag/api-reference/lend/earn) | 用于 Earn 操作的 REST API（存款/提款/铸造/赎回、代币、头寸、收益）
- **Lend API（Borrow）**: *（即将推出）*

## SDK

- **读取 SDK（`@jup-ag/lend-read`）**: [NPM](https://www.npmjs.com/package/@jup-ag/lend-read) | 用于查询流动性池、借贷市场（jlTokens）和金库的只读 SDK
- **写入 SDK（`@jup-ag/lend`）**: [NPM](https://www.npmjs.com/package/@jup-ag/lend) | 用于构建写入交易的核心 SDK（存款、提款、操作）

## 智能合约

- **公共代码仓库**: [Instadapp/fluid-solana-programs](https://github.com/Instadapp/fluid-solana-programs/)
- **IDL 和类型**: [IDL 和类型（`/target` 文件夹）](https://github.com/jup-ag/jupiter-lend/tree/main/target)

## 程序 ID（主网）


| 程序                   | 地址                                       |
| ------------------------- | --------------------------------------------- |
| 流动性                 | `jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC` |
| 借贷（Earn）             | `jup3YeL8QhtSx1e253b2FDvsMNC87fDrgQZivbrndc9` |
| 借贷奖励利率模型 | `jup7TthsMgcR9Y3L277b8Eo9uboVSmu1utkuXHNUKar` |
| 金库（Borrow）            | `jupr81YtYssSyPt8jbnGuiWon5f6x9TcDEFxYe3Bdzi` |
| 预言机                    | `jupnw4B6Eqs7ft6rxpzYLJZYSnrpRgPcr589n5Kv4oc` |
| 闪电贷                 | `jupgfSgfuAXv4B6R2Uxu85Z1qdzgju79s6MfZekN6XS` |