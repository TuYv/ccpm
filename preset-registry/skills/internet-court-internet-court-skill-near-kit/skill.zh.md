---
name: near-kit
description: TypeScript library for NEAR Protocol blockchain interaction. Use this skill when writing code that interacts with NEAR Protocol, including viewing contract data, calling contract methods, sending NEAR tokens, building transactions, creating type-safe contract wrappers, integrating wallets (Wallet Selector, HOT Connect), React hooks and providers (@near-kit/react), managing keys, testing with sandbox, meta-transactions (NEP-366), and message signing (NEP-413).
---
# near-kit

一个面向 NEAR Protocol 的 TypeScript 库，提供直观的、类似 fetch 的 API。

## 快速开始

```typescript
import { Near } from "near-kit";

// Read-only (no key needed)
const near = new Near({ network: "testnet" });
const data = await near.view("contract.near", "get_data", { key: "value" });

// With signing capability
const near = new Near({
  network: "testnet",
  privateKey: "ed25519:...",
  defaultSignerId: "alice.testnet",
});
await near.call("contract.near", "method", { arg: "value" });
await near.send("bob.testnet", "1 NEAR");
```

## 导入速查表

```typescript
// Core
import { Near } from "near-kit";

// Keys
import { generateKey, parseSeedPhrase, generateSeedPhrase } from "near-kit";
import { RotatingKeyStore, InMemoryKeyStore } from "near-kit";
import { FileKeyStore } from "near-kit/keys/file";
import { NativeKeyStore } from "near-kit/keys/native";

// Wallet adapters
import { fromHotConnect, fromWalletSelector } from "near-kit";

// NEP-413 verification
import { verifyNep413Signature } from "near-kit";

// Utilities
import { Amount, Gas, isValidAccountId } from "near-kit";
```

## 核心操作

### View 方法（只读、免费）

```typescript
const result = await near.view("contract.near", "get_data", { key: "value" });
const balance = await near.getBalance("alice.near");
const exists = await near.accountExists("alice.near");
```

### Call 方法（需要签名）

```typescript
await near.call(
  "contract.near",
  "method",
  { arg: "value" },
  { gas: "30 Tgas", attachedDeposit: "1 NEAR" },
);
```

### 发送 NEAR 代币

```typescript
await near.send("bob.near", "5 NEAR");
```

## 类型安全的合约

```typescript
import type { Contract } from "near-kit";

type MyContract = Contract<{
  view: {
    get_balance: (args: { account_id: string }) => Promise<string>;
  };
  call: {
    transfer: (args: { to: string; amount: string }) => Promise<void>;
  };
}>;

const contract = near.contract<MyContract>("token.near");

// View (no options needed)
await contract.view.get_balance({ account_id: "alice.near" });

// Call (options as second arg)
await contract.call.transfer(
  { to: "bob.near", amount: "10" },
  { attachedDeposit: "1 yocto" },
);
```

无类型合约代理：

```typescript
const guestbook = near.contract("guestbook.near-examples.testnet");

const total = await guestbook.view.total_messages();
const result = await guestbook.call.add_message(
  { text: "Hello!" },
  { gas: "30 Tgas" },
);
```

## 交易构建器

在单个原子交易中链接多个操作：

```typescript
const result = await near
  .transaction("alice.near")
  .functionCall("counter.near", "increment", {}, { gas: "30 Tgas" })
  .transfer("counter.near", "0.001 NEAR")
  .send();
```

**有关所有交易操作和元交易，请参阅 [references/transactions.md](references/transactions.md)**

## 配置

### 后端/脚本

```typescript
// Direct private key
const near = new Near({
  network: "testnet",
  privateKey: "ed25519:...",
  defaultSignerId: "alice.testnet",
});

// File-based keystore
import { FileKeyStore } from "near-kit/keys/file";
const near = new Near({
  network: "testnet",
  keyStore: new FileKeyStore("~/.near-credentials", "testnet"),
});

// High-throughput with rotating keys
import { RotatingKeyStore } from "near-kit";
const near = new Near({
  network: "mainnet",
  keyStore: new RotatingKeyStore({
    "bot.near": ["ed25519:key1...", "ed25519:key2...", "ed25519:key3..."],
  }),
});
```

**有关所有密钥存储和实用工具，请参阅 [references/keys-and-testing.md](references/keys-and-testing.md)**

### 浏览器钱包

```typescript
import { NearConnector } from "@hot-labs/near-connect";
import { Near, fromHotConnect } from "near-kit";

const connector = new NearConnector({ network: "mainnet" });

connector.on("wallet:signIn", async (event) => {
  const near = new Near({
    network: "mainnet",
    wallet: fromHotConnect(connector),
  });

  await near.call("contract.near", "method", { arg: "value" });
});

connector.connect();
```

**有关 HOT Connect 和 Wallet Selector 集成，请参阅 [references/wallets.md](references/wallets.md)**

## React 绑定（@near-kit/react）

```tsx
import { NearProvider, useNear, useView, useCall } from "@near-kit/react";

function App() {
  return (
    <NearProvider config={{ network: "testnet" }}>
      <Counter />
    </NearProvider>
  );
}

function Counter() {
  const { data: count, isLoading } = useView<{}, number>({
    contractId: "counter.testnet",
    method: "get_count",
  });

  const { mutate: increment, isPending } = useCall({
    contractId: "counter.testnet",
    method: "increment",
  });

  if (isLoading) return <div>Loading...</div>;
  return (
    <button onClick={() => increment({})} disabled={isPending}>
      Count: {count}
    </button>
  );
}
```

**有关所有 React hooks、React Query/SWR 集成和 SSR 模式，请参阅 [references/react.md](references/react.md)**

## 使用 Sandbox 进行测试

```typescript
import { Near } from "near-kit";
import { Sandbox } from "near-kit/sandbox";

const sandbox = await Sandbox.start();
const near = new Near({ network: sandbox });

const testAccount = `test-${Date.now()}.${sandbox.rootAccount.id}`;
await near
  .transaction(sandbox.rootAccount.id)
  .createAccount(testAccount)
  .transfer(testAccount, "10 NEAR")
  .send();

await sandbox.stop();
```

**有关 sandbox 模式和 Vitest 集成，请参阅 [references/keys-and-testing.md](references/keys-and-testing.md)**

## 错误处理

```typescript
import {
  InsufficientBalanceError,
  FunctionCallError,
  NetworkError,
  TimeoutError,
} from "near-kit";

try {
  await near.call("contract.near", "method", {});
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    console.log(`Need ${error.required}, have ${error.available}`);
  } else if (error instanceof FunctionCallError) {
    console.log(`Panic: ${error.panic}`, `Logs: ${error.logs}`);
  }
}
```

## 单位格式化

所有金额都接受人类可读的格式：

```typescript
"10 NEAR"; // 10 NEAR
"10"; // 10 NEAR
10; // 10 NEAR
("30 Tgas"); // 30 trillion gas units
```

程序化格式化：

```typescript
import { Amount, Gas } from "near-kit";

Amount.NEAR(0.1);
Amount.yocto(1000n);
Amount.parse("5 NEAR");
Gas.parse("30 Tgas");
```

## 密钥实用工具

```typescript
import {
  generateKey,
  generateSeedPhrase,
  parseSeedPhrase,
  isValidAccountId,
} from "near-kit";

// Generate new keypair
const key = generateKey();
// key.publicKey, key.secretKey

// generateSeedPhrase() returns a string (just the phrase)
const seedPhrase = generateSeedPhrase();
// "word1 word2 word3 ... word12"

// parseSeedPhrase() returns a KeyPair-like object
const keyPair = parseSeedPhrase("word1 word2 ... word12");
// keyPair.publicKey, keyPair.secretKey

// Validation
isValidAccountId("alice.near"); // true
```

## NEP-413 验证

```typescript
import { Near, verifyNep413Signature } from "near-kit";

const near = new Near({ network: "testnet" });

const isValid = await verifyNep413Signature(
  signedMessage,
  { message: "log me in", recipient: "myapp.com", nonce: challengeBuffer },
  { near, maxAge: Infinity },
);
```

## 参考资料

有关特定主题的详细文档：

- **[React 绑定](references/react.md)** - Provider、hooks、React Query/SWR、SSR/Next.js
- **[钱包集成](references/wallets.md)** - HOT Connect、Wallet Selector、通用模式
- **[交易构建器](references/transactions.md)** - 所有操作、元交易（NEP-366）
- **[密钥与测试](references/keys-and-testing.md)** - 密钥存储、实用工具、sandbox、NEP-413 签名