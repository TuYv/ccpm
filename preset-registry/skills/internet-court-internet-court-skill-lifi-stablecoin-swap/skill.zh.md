---
name: lifi-stablecoin-swap
description: |
  Build a production 1:1 stablecoin swap with LI.FI Intents — an interface or backend where
  the amount the user sends equals the amount they receive (no visible gas or solver fees),
  same-chain or cross-chain, filled by LI.FI's solver network and verifiable on-chain.

  USE THIS SKILL WHEN USER WANTS TO:
  - Build a 1:1 stablecoin swap interface ("send 100 USDC, receive 100 USDC"), same- or cross-chain
  - Add stablecoin transfers with a guaranteed output amount to an app, backend, or bot
  - Build enterprise/fintech-grade transfers with no visible gas or solver fees for the end user
  - Implement the LI.FI Intents quote -> approve -> escrow open -> status loop for stablecoins
  - Move USDC / USDT 1:1 across chains under an onboarded LI.FI integrator
  - Understand how the LI.FI integrator ID / Partner Portal enables 1:1 quoting
  - Use the @lifi/intent TypeScript SDK to quote, build, open, and track an intent order

  This skill is self-contained and covers the integration end to end via the `@lifi/intent` SDK
  (the primary path), with the raw `order.li.fi` REST endpoints as a language-agnostic option.
  For the wider LI.FI product surface (classic swaps/bridges, Composer, Earn), use the `lifi` skill.
---
# 使用 LI.FI Intents 构建 1:1 稳定币兑换

普通的加密货币转账会因 gas 和价差损失价值——发送 100 USDC，最终到账约 99.8。对于新银行、支付处理商或受监管的金融科技公司来说，这是不可接受的：他们的用户期望发送 100 就到账 100。

LI.FI Intents 让你能够准确实现这一点——**发送 100 USDC，收到 100 USDC**（也可以是 USDT 或其他受支持的稳定币），无论是同链还是跨链。LI.FI 网络中的 solver 会预付目标链上的 gas 并提供流动性，然后与用户的存款进行结算，因此终端用户从头到尾看到的都是同一个数字，而且可以通过公开的区块浏览器进行验证。

主要的集成方式是 **`@lifi/intent` TypeScript SDK**——它负责请求报价、构建链上订单并跟踪订单。对于非 TypeScript 后端，原始 REST API 位于第 §7 节。

---

## 1. 在你的集成商账户上启用 1:1 报价

1:1 稳定币报价是一项配置在你的 **LI.FI 集成商账户**上的功能：

1. 在 **LI.FI Partner Portal** 上注册集成商 ID — https://portal.li.fi
2. 与 LI.FI 完成集成协议。作为接入流程的一部分，LI.FI 会为你的集成商启用 1:1 稳定币报价。
3. 使用**你的集成商密钥**发出的报价请求，随后会针对受支持的稳定币交易对返回 1:1 的金额。

无论采用哪种方式，下面的集成代码都完全相同——决定报价是否以 1:1 返回的是已经完成接入的集成商账户。请参阅 https://docs.li.fi/lifi-intents/introduction，或联系 LI.FI 启用此功能。

---

## 2. 流程

`order.li.fi` 是 Intents API。托管流程是推荐的默认流程，共分为四步：

```
1. Quote     getQuotes(...)                              -> guaranteed output amount (1:1)
2. Approve   ERC-20 approve(InputSettlerEscrow, amount)  -> let the settler pull the input token
3. Open      escrow.open(StandardOrder) on-chain         -> locks funds, emits Open(orderId)
4. Track     GET /orders/status?onChainOrderId=...         -> Signed -> Delivered -> Settled
```

打开订单会发出 `Open(bytes32 indexed orderId, ...)`；solver 会监听该事件，并在目标链上完成交付，因此托管流程**不需要提交订单的调用**。持续轮询状态，直到资金到账，然后向用户展示目标交易。`orderId` 就是凭证——任何人都可以独立验证存款和交付是否匹配。

（此外还有 **Compact / gasless** 流程——先向 The Compact 存入一次资金，然后对每个订单进行链下签名并提交。除非你明确需要在一次性存款后实现 gasless，否则应使用托管流程。）

```bash
npm install @lifi/intent viem
```

（快速入门中的可运行界面还使用 `wagmi` + `@tanstack/react-query` 来支持钱包操作——其安装命令中包含这两个依赖。）

> 设置提示：SDK 使用 `bigint` 字面量（`100_000_000n`）。`create-next-app` 默认将
> `tsconfig.json` 中的 `"target"` 设置为 `"ES2017"`，这会拒绝这些字面量——请将
> `"target"` 设置为 `"ES2020"`（或更高版本）。

---

## 3. 报价（1:1）

使用你的集成商密钥调用 `getQuotes`。`IntentApi(true)` 会将请求发送到主网 / 生产 solver 网络。金额以代币最小单位表示，类型为 `bigint`（100 USDC = `100_000_000n`，6 位小数）。对于已启用 1:1 且属于受支持稳定币交易对的集成商，输出金额等于输入金额。

```ts
import { IntentApi } from "@lifi/intent";

const api = new IntentApi(true);

const res = await api.getQuotes({
  user,                                              // the user's 0x address
  userChainId: 8453,                                 // source chain (Base)
  integratorKey: process.env.LIFI_INTEGRATOR_KEY,    // your onboarded integrator key
  inputs:  [{ sender: user,   asset: usdcOnBase, chainId: 8453,  amount: 100_000_000n }],
  outputs: [{ receiver: user, asset: usdcOnArb,  chainId: 42161, amount: 0n }],
});

const quote = res.quotes[0];
if (!quote) throw new Error("No quote available for this pair");
const received = BigInt(quote.preview.outputs[0].amount); // == 100_000_000n for a 1:1 pair
const quoteId = quote.quoteId;
```

---

## 4. 构建并打开订单

SDK 会为你构建 `StandardOrder` —— 传入普通的代币地址和链 ID；它会计算 nonce、截止时间、预言机以及 EIP-7930 编码。`getOracle` 提供验证器预言机（下方为 Polymer 地址）。然后在 SDK 提供的托管结算器上调用 `open(order)`。

```ts
import { Intent, type IntentDeps, type StandardEVM } from "@lifi/intent";
import type { WalletClient } from "viem";

const POLYMER_ORACLE = "0x0000003E06000007A224AeE90052fA6bb46d43C9" as const; // mainnet
const deps: IntentDeps = {
  getOracle: (verifier) => (verifier === "polymer" ? POLYMER_ORACLE : undefined),
};

type Tok = { address: `0x${string}`; chainId: number; decimals: number; name: string };
const ctx = (t: Tok, amount: bigint) => ({
  token: { address: t.address, name: t.name, chainId: BigInt(t.chainId),
           decimals: t.decimals, chainNamespace: "eip155" as const },
  amount,
});

const intent = new Intent({
  inputTokens:  [ctx(fromToken, 100_000_000n)],
  outputTokens: [ctx(toToken, received)],   // `received` from the quote
  verifier: "polymer",
  account: user,
  outputRecipient: user,
  lock: { type: "escrow" },
}, deps).order();

// asOrder() is a union (multichain | EVM | Solana); narrow to the single-chain EVM order
// so it matches the OPEN_ABI StandardOrder tuple.
const order   = intent.asOrder() as StandardEVM; // the StandardOrder struct
const orderId = intent.orderId();                // your tracking handle
const settler = intent.inputSettler;             // InputSettlerEscrow (0x000025c3...)

// 1) ERC-20 approve(settler, amountIn) for the source token if allowance is insufficient
//    (allowance check + ERC20 ABI shown in references/quickstart.md).
// 2) Open the order (full `open` ABI is in references/quickstart.md). viem's writeContract
//    needs `account` and `chain` when the wallet client has none bound:
const txHash = await wallet.writeContract({
  address: settler, abi: OPEN_ABI, functionName: "open", args: [order],
  account: user, chain: wallet.chain,
});
```

---

## 5. 跟踪订单直至结算

轮询 `GET https://order.li.fi/orders/status?onChainOrderId=<orderId>`：

```ts
const status = await fetch(
  `https://order.li.fi/orders/status?onChainOrderId=${orderId}`,
).then((r) => r.json());
// status.meta.orderStatus: Signed -> Delivered -> Settled (or Expired -> refundable)
```

| 状态 | 含义 |
|--------|---------|
| `Signed` | 订单已打开并广播至 solver 网络 |
| `Delivered` | Solver 已在目标链上交付资产 |
| `Settled` | Oracle 已验证交付；用户锁定的资金已释放给 solver（终态） |
| `Expired` | 截止时间前没有 solver 完成填充 — 用户可以申请退款 |

状态响应还会携带目标链/结算交易哈希 — 展示目标链交易，以便用户（以及你的运营/合规团队）可以在区块浏览器上验证交付。

---

## 6. 界面

简洁的 1:1 兑换 UI 有三个状态。不要在屏幕上展示 gas、价差和 solver 机制。

1. **报价** — 用户选择发送代币 + 链、接收代币 + 链以及金额。调用
   `getQuotes` 并显示接收金额；对于启用 1:1 的集成方，显示的金额相等
   （“发送 100 USDC → 接收 100 USDC”）。只显示一个数字；不要设置费用字段。
2. **进行中** — approve + open 之后，显示来自 `/orders/status` 的简单状态
   （“已提交 → 已交付 → 已结算”），并附上源交易的链接。
3. **完成** — 显示“已交付”，附上目标链交易链接和可验证的收据 `orderId`。提供“再次兑换”选项。

完整且可运行的 React / Next.js 界面位于
[`references/quickstart.md`](references/quickstart.md) — 包括完整的 `open` ABI、ERC-20
approve/allowance 步骤，以及 wallet hooks 所需的 wagmi `createConfig` + provider wiring。

---

## 7. 选项 2 — 原始 REST（任意语言）

无需 SDK；直接调用 `order.li.fi`。Intents API 对 `user`/`asset`/`receiver` 使用 **EIP-7930
可互操作地址**（地址中嵌入了链信息） — 例如 Base 上的 USDC
（链 id 8453 = `0x2105`，代币 `0x833589…02913`）编码为
`0x0001000002210514833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
（`0001`=版本，`0000`=EVM，`02`=链引用长度，`2105`=链 id，`14`=地址长度，后面是 20 字节的
地址）。金额以最小单位的字符串表示。

**报价** — `POST https://order.li.fi/quote/request`（使用你的集成方密钥）：

```jsonc
{
  "user": "<eip7930>",
  "intent": {
    "intentType": "oif-swap",
    "swapType": "exact-input",
    "inputs":  [{ "user": "<eip7930>", "asset": "<eip7930 source token>", "amount": "100000000" }],
    "outputs": [{ "receiver": "<eip7930>", "asset": "<eip7930 dest token>", "amount": null }]
  },
  "supportedTypes": ["oif-escrow-v0"]
}
```

读取 `quotes[0].preview.outputs[0].amount`（以及 `quoteId`、`validUntil`）。然后构建
`StandardOrder`，对其进行 ABI 编码，并在 `InputSettlerEscrow` 上调用 `open(order)`。该结构体：

```
tuple(
  address user, uint256 nonce, uint256 originChainId,
  uint32 expires,        // final deadline; refundable after this
  uint32 fillDeadline,   // solver fill cutoff; must be < expires
  address inputOracle,   // Polymer Oracle (below)
  uint256[2][] inputs,   // [tokenId (input token address as uint256), amount]
  tuple(bytes32 oracle, bytes32 settler, uint256 chainId, bytes32 token,
        uint256 amount, bytes32 recipient, bytes callbackData, bytes context)[] outputs
)
```

`outputs[].settler` 是 Output Settler；`recipient`/`token` 是填充至 bytes32 的地址；
对于普通转账，`callbackData`/`context` 为 `0x`。通过相同的
`GET /orders/status?onChainOrderId=...` 进行跟踪。

---

## 合约地址（在受支持的 EVM 链上相同）

| 合约 | 地址 |
|----------|---------|
| InputSettlerEscrow | `0x000025c3226C00B2Cdc200005a1600509f4e00C0` |
| Output Settler | `0x0000000000eC36B683C2E6AC89e9A75989C22a2e` |
| Polymer Oracle（主网） | `0x0000003E06000007A224AeE90052fA6bb46d43C9` |

受支持的链和可用路由由 solver 驱动且动态变化——请查询 `GET /chains/supported`
和 `GET /routes`，而不是将其硬编码。

---

## 资源

- LI.FI Intents — https://docs.li.fi/lifi-intents/introduction
- Intents 快速入门 — https://docs.li.fi/lifi-intents/quickstart
- Intents API 概览 — https://docs.li.fi/lifi-intents/intents-api/api-overview
- Partner Portal（注册您的集成方） — https://portal.li.fi
- 交互式 API 规范 — https://order.li.fi/docs