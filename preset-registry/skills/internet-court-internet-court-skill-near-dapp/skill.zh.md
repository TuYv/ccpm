---
name: near-dapp
description: >
  Build NEAR Protocol dApps. Use for: (1) creating new NEAR dApps with
  `create-near-app` (Vite+React, Next.js), (2) adding NEAR wallet connection
  to existing apps with `@hot-labs/near-connect` and `near-connect-hooks`,
  (3) building frontend UI for NEAR smart contracts, (4) integrating wallet
  sign-in/sign-out, contract calls, and transaction signing into web
  applications.
---
# NEAR dApp

## 决策路由

确定要遵循的路径：

### 路径 A：新建项目

用户希望从头开始创建一个新的 NEAR dApp。

1. 阅读 [references/create-near-app.md](references/create-near-app.md)
2. 运行脚手架：

```bash
npx create-near-app@latest
```

或使用参数：

```bash
npx create-near-app my-app --frontend vite-react --contract rs --install
```

**框架选项：** `vite-react` | `next-app` | `next-page`  
**合约选项：** `rs`（Rust）| `ts`（TypeScript）

3. 如果用户需要在脚手架生成的应用中连接钱包，还需遵循路径 B。

### 路径 B：现有项目

用户希望将 NEAR 钱包连接添加到现有的 React 应用中。

1. 阅读 [references/near-connect-hooks.md](references/near-connect-hooks.md) — React hooks API 和模式
2. 如果用户需要低级钱包 API 或非 React 集成，还需阅读 [references/near-connect.md](references/near-connect.md)

**快速设置：**

```bash
npm install near-connect-hooks @hot-labs/near-connect near-api-js
```

```tsx
// 1. Wrap app root with NearProvider
import { NearProvider } from 'near-connect-hooks';

<NearProvider config={{ network: 'mainnet' }}>
  <App />
</NearProvider>

// 2. Use hook in components
import { useNearWallet } from 'near-connect-hooks';

const { signedAccountId, signIn, signOut, viewFunction, callFunction } = useNearWallet();
```

### 路径 C：非 React 或原生 JS

直接使用 `@hot-labs/near-connect`，无需 React hooks。

1. 阅读 [references/near-connect.md](references/near-connect.md)

```bash
npm install @hot-labs/near-connect
```

```typescript
import { NearConnector } from "@hot-labs/near-connect";

const connector = new NearConnector({ network: "mainnet" });
connector.on("wallet:signIn", async (t) => {
  const wallet = await connector.wallet();
  const address = t.accounts[0].accountId;
});
await connector.connect();
```

## 关键模式

- **读取合约状态**（无需钱包）：`viewFunction({ contractId, method, args })`
- **写入合约**（需要钱包）：`callFunction({ contractId, method, args, deposit })`
- **转账 NEAR**：`transfer({ receiverId, amount })`
- **NEAR ↔ yoctoNEAR**：使用 `near-api-js` 中的 `nearToYocto()` / `yoctoToNear()`
- **1 NEAR** = `"1000000000000000000000000"` yoctoNEAR
- **默认 gas：** `"30000000000000"`（30 TGas）