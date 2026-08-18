---
name: dflow-phantom-connect
description: "Build Solana wallet-connected apps with Phantom Connect SDKs and DFlow spot trading. Use when user asks to connect a Phantom wallet, integrate Phantom in React, React Native, or vanilla JS, sign messages or transactions, build token-gated pages, mint NFTs, accept crypto payments, or swap/stream tokens with DFlow. Covers @phantom/react-sdk, @phantom/react-native-sdk, @phantom/browser-sdk, and DFlow spot trading and market-data streaming. Do NOT use for Ethereum or EVM wallet integrations, or non-DFlow DEX routing."
license: MIT
metadata:
  author: DFlow & Phantom Connect
  version: 1.1.0
  tags: [solana, phantom, wallet, trading, market-data]
  mcp-server: pond.dflow.net/mcp
---
# Phantom Connect + DFlow 技能

## 指南

### 第 1 步：确定用户想要构建的内容

确定所属领域，然后查阅相应的参考资料。

**钱包连接和 Solana 交互：**

- 连接 Phantom 钱包（React、React Native、原生 JS）
- 签名消息或交易
- 代币门控访问
- NFT 铸造
- 加密货币支付
- Solana 转账（SOL 或 SPL 代币）

**DFlow 交易与市场数据：**

- 现货代币兑换（报价、签名、提交、确认）
- 实时价格、订单簿深度或优先费流式数据

许多任务会同时涉及两者（例如，兑换 UI 既需要钱包连接，也需要 DFlow 交易）。在编写代码前，请阅读所有相关参考资料。

### 第 2 步：阅读相关参考资料

**Phantom Connect SDK**（钱包连接、签名、身份验证）：

- `references/react-sdk.md`：React hooks、组件、主题设置、PhantomProvider
- `references/react-native-sdk.md`：Expo 配置、polyfill、深层链接、移动端身份验证
- `references/browser-sdk.md`：BrowserSDK 初始化、事件、钱包发现、原生 JS

**Solana 模式**（交易、门控、铸造、支付）：

- `references/transactions.md`：SOL/SPL 转账、签名、费用估算
- `references/token-gating.md`：客户端和服务端的代币门控访问
- `references/nft-minting.md`：铸造页面、Metaplex Core、压缩 NFT
- `references/payments.md`：SOL/USDC 支付、带后端验证的结账流程

**DFlow**（兑换、流式数据）：

- `references/dflow-crypto-trading.md`：通过 `/order` 进行现货兑换（原子单位、base58 铸币地址、无钱包报价、优先费/平台费/赞助费）
- `references/dflow-websockets.md`：实时报价、订单簿和优先费流式数据（浏览器通过后端代理）

### 第 3 步：提出正确的问题

在实现之前，根据所属领域提出问题：

**对于 Phantom Connect 任务：**

- 使用哪个平台？（React、React Native、原生 JS）
- 是否需要社交登录（Google/Apple），还是仅支持扩展程序？

**对于 DFlow 任务：**

- 是否有 DFlow API 密钥？（有：使用带有 `x-api-key` 的生产环境主机。没有：使用开发环境主机，但会受到速率限制。生产环境密钥：pond.dflow.net/get-started/api-key。）所有 DFlow 功能共用一个密钥。
- 客户端环境是什么？（Web、移动端、后端、CLI）浏览器应用应将密钥保存在后端，并通过后端代理 DFlow HTTP 和 WebSocket。
- 是否收取平台费？如果是，需要多少 bps，以及使用哪个构建者拥有的费用账户（该账户必须已存在）？

### 第 4 步：实现

遵循参考文件中的模式。各领域的关键规则如下：

**Phantom Connect：**

- 所有 SDK 细节（provider 设置、hooks、组件、身份验证提供商）都位于 SDK 参考文件中。在编写 Phantom 集成代码前，请先阅读这些文件。

**DFlow：**

- 交易是同步的：一次 `/order` 调用会返回一个可供签名的交易，随后对其进行签名、提交和确认。
- 作为安全最佳实践，请将 DFlow API 密钥保存在后端，而不要放在浏览器代码中。浏览器应用应通过后端代理 DFlow HTTP（`/order` 不提供 CORS）和 WebSocket 流。
- 开发环境端点（`dev-quote-api.dflow.net`）无需密钥即可使用，但会受到速率限制；生产环境需要从 pond.dflow.net/get-started/api-key 获取密钥。在生产环境中，报价流和订单簿流的访问权限按密钥授予。

### 第 5 步：处理错误

每个参考文件都包含特定于领域的错误处理。需要重点关注以下跨领域问题：

- 用户拒绝交易或签名请求
- 尝试执行需要签名的操作时钱包未连接
- DFlow API 返回 429（请求受限）：使用退避策略重试，或获取生产环境 API key
- DFlow 返回 `route_not_found`：可能的原因是该交易对在当前数量下流动性不足；同时检查 mint 地址，并确认 `amount` 使用的是原子单位

## 示例

### 示例 1：React 钱包连接

用户说：“为我的 Next.js 应用添加 Phantom 钱包登录”

操作：

1. 阅读 `references/react-sdk.md`
2. 安装 `@phantom/react-sdk`
3. 使用所需的身份验证提供商和 appId，将应用包裹在 PhantomProvider 中
4. 使用 `useModal` hook 创建连接按钮
5. 使用 `useAccounts` 显示已连接的钱包地址

结果：支持社交登录和扩展程序的可用钱包连接

### 示例 2：代币门控页面

用户说：“构建一个只有 BONK 持有者才能查看的页面”

操作：

1. 阅读 `references/react-sdk.md` 和 `references/token-gating.md`
2. 设置钱包连接
3. 查询已连接钱包的 BONK 代币余额
4. 根据余额阈值有条件地渲染内容
5. 对于生产环境：添加服务端签名验证

结果：检查钱包代币余额并对内容进行门控的页面

### 示例 3：DFlow 代币兑换

用户说：“使用 DFlow 添加兑换功能”

操作：

1. 询问：API key？客户端环境？平台费用？
2. 阅读 `references/dflow-crypto-trading.md`
3. 使用 `/order` 流程：请求订单（在浏览器中通过后端代理），反序列化返回的交易，进行签名，提交并确认
4. 在浏览器中，使用 Phantom SDK 进行签名和发送（参见 `references/transactions.md`）；在服务端，使用 keypair 进行签名，并通过 RPC 提交

结果：使用 DFlow 路由的可用兑换功能

### 示例 4：带钱包连接的完整兑换页面

用户说：“使用钱包连接和 DFlow 构建一个完整的兑换页面”

操作：

1. 询问：使用哪个平台？API key？平台费用？
2. 阅读相关的 SDK 参考文件以及 `references/dflow-crypto-trading.md`
3. 使用 Phantom SDK 设置钱包连接
4. 构建兑换表单；通过后端代理 `/order`，以便将 key 保留在服务端
5. 使用 Phantom SDK 进行签名和发送，然后确认

结果：结合 Phantom 钱包和 DFlow 交易的端到端兑换页面

### 示例 5：实时订单簿

用户说：“显示某个代币交易对的实时订单簿”

操作：

1. 阅读 `references/dflow-websockets.md`
2. 启动一个保存 key 的后端中继，通过 `x-api-key` header 打开 `/book-stream`，并将帧中继到浏览器
3. 使用 `{ op: "subscribe", base_mint, quote_mint }` 进行订阅；渲染按 slot 批量返回的 `updates[]`
4. 连接断开时重新连接并重新订阅

结果：实时流式订单簿，key 保留在服务端

## 资源

- Phantom Portal: phantom.com/portal/login
- Phantom Docs: docs.phantom.com/introduction
- SDK Examples: github.com/phantom/phantom-connect-sdk/tree/main/examples
- Phantom MCP Server: docs.phantom.com/resources/mcp-server
- DFlow MCP Server: pond.dflow.net/mcp
- DFlow MCP Docs: pond.dflow.net/ai/mcp
- DFlow Docs: pond.dflow.net/introduction