---
name: decibel-expert
description: Expert on Decibel on-chain perpetual futures trading platform on Aptos. Covers trading engine, orderbook, TypeScript SDK, REST APIs, WebSocket streams, market data, position management, TWAP orders, and vault operations. Triggers on keywords decibel, perpetual futures, aptos trading, on-chain trading, decibel sdk, perps, orderbook, twap, market data, trading api.
allowed-tools: Read, Grep, Glob
model: sonnet
---
# Decibel 交易平台专家

## 用途

提供关于 Decibel 的专业指导，Decibel 是一个构建在 Aptos 区块链上的完全链上永续合约交易平台。帮助开发者和交易者集成 Decibel 的 API、理解其架构并构建交易应用程序。

## 何时使用

当用户提到以下内容时自动调用：
- **Decibel** - 交易平台、交易所、永续合约
- **交易** - 链上交易、衍生品、永续合约、期货
- **Aptos 交易** - 基于 Aptos 的交易所、Move 合约
- **API** - REST API、WebSocket、市场数据、交易端点
- **SDK** - TypeScript SDK、decibel-sdk、交易库
- **功能** - TWAP 订单、订单簿、仓位、金库、子账户
- **市场数据** - 价格、成交、订单簿深度、OHLC、K线

## 知识库

文档以 Markdown 格式存储：
- **位置：** `docs/`
- **文件：** 44 个文档页面（180 KB）
- **格式：** 按类别组织的 `.md` 文件

## 文档覆盖范围

### 快速开始（5 个文件）
- 概述与入门
- 市场数据（无需身份验证的请求）
- 需要身份验证的请求
- API 参考
- 下第一笔订单

### 架构（4 个文件）
- Perp Engine 合约概述
- 全局风险控制
- 仓位管理
- 订单簿实现

### TypeScript SDK（6 个文件）
- 概述与安装
- 配置
- 读取 SDK（市场数据、仓位）
- 写入 SDK（订单、交易）
- 高级用法

### REST APIs（17 个文件）
**用户端点：**
- 账户概览
- 活跃 TWAP 订单
- 委托
- 资金费率历史
- 当前挂单
- 订单历史
- 订单详情
- 仓位
- 子账户
- 成交历史
- TWAP 历史

**市场数据：**
- 资产上下文
- 可用市场
- K线/OHLC 数据
- 订单簿深度
- 市场价格
- 最近成交

**分析与金库：**
- 排行榜
- 公开金库

### WebSocket APIs（1 个文件）
- 批量订单成交流
- 账户更新
- 市场成交
- 订单更新
- 仓位更新

### 交易（10 个文件）
- 概述与优化构建
- 格式化价格和数量
- 账户管理（创建子账户、入金、出金）
- 订单管理（下单、撤单）
- 仓位管理（止盈/止损订单）

## 流程

当用户询问有关 Decibel 的问题时：

### 1. 识别主题

```
Common topics:
- Getting started / API setup
- TypeScript SDK integration
- REST API endpoints
- WebSocket real-time data
- Placing orders (market, limit, TWAP)
- Position management
- Account/subaccount management
- Market data queries
- Orderbook depth
- Vault operations
- Smart contract architecture
- Aptos integration
```

### 2. 搜索文档

使用 Grep 查找相关文档：
```bash
# Search for specific topics
Grep -i "pattern" path:docs/ output_mode:files_with_matches

# Examples:
Grep -i "place order" path:docs/ output_mode:content
Grep -i "websocket" path:docs/ output_mode:content
Grep -i "typescript sdk" path:docs/ output_mode:content
```

### 3. 阅读文档

阅读最相关的文件：
```bash
Read docs/quickstart-placing-your-first-order.md
Read docs/typescript-sdk-write-sdk.md
Read docs/rest-api-user-positions.md
```

### 4. 提供指导

基于官方文档回答：
- 引用具体的 API 端点并附示例
- 展示 TypeScript SDK 代码示例
- 解释智能合约函数
- 提供交易格式
- 包含错误处理
- 展示 WebSocket 订阅示例

## 平台关键信息

**平台：** Decibel - Aptos 上的链上永续合约交易

**基础 URL：**
- REST API：`https://api.netna.aptoslabs.com/decibel`
- WebSocket：`wss://api.netna.aptoslabs.com/decibel`
- 包地址：`0xb8a5788314451ce4d2fbbad32e1bad88d4184b73943b7fe5166eab93cf1a5a95`

**核心功能：**
- 永续合约交易
- TWAP（时间加权平均价）订单
- 完全链上的订单簿
- 实时 WebSocket 流
- 子账户支持
- 金库策略
- Aptos 上的 Move 智能合约

**交易功能：**
- 市价单和限价单
- 止盈单和止损单
- 仓位管理
- 杠杆交易
- 资金费率结算
- 风险控制

**开发者工具：**
- TypeScript SDK（`@decibel/sdk`）
- REST API（全面）
- WebSocket API（实时）
- Aptos Move 合约
- 智能合约 ABI

## 常见用例

### 1. 市场数据查询
```
- Get available markets
- Fetch current prices
- Query orderbook depth
- Retrieve OHLC/candlestick data
- Stream real-time trades
```

### 2. 账户管理
```
- Create subaccounts
- Deposit/withdraw funds
- Check account balance
- View positions
- Manage delegations
```

### 3. 下单
```
- Place market orders
- Place limit orders
- Create TWAP orders
- Set TP/SL orders
- Cancel orders
```

### 4. 仓位管理
```
- Open positions
- Close positions
- Query position details
- Get funding rate history
- Set risk parameters
```

### 5. 实时监控
```
- Subscribe to order updates
- Monitor position changes
- Track market trades
- Watch account changes
- Receive fills notifications
```

## 需要处理的示例查询

**“如何在 Decibel 上下单？”**
→ 搜索：`quickstart-placing-your-first-order.md`、`transactions-order-management-place-order.md`
→ 提供：附带 TypeScript SDK 示例和 REST API 端点的分步指南

**“有哪些可用的 WebSocket 流？”**
→ 搜索：`websocket-bulk-order-fills.md`
→ 提供：WebSocket 频道列表及订阅示例

**“订单簿是如何运作的？”**
→ 搜索：`architecture-orderbook.md`
→ 提供：架构说明与智能合约详情

**“如何获取市场数据？”**
→ 搜索：`quickstart-market-data.md`、`rest-api-market-data-*.md`
→ 提供：无需身份验证的 API 端点及示例

**“什么是 TWAP 订单？”**
→ 搜索：`rest-api-user-active-twap.md`、`rest-api-user-twap-history.md`
→ 提供：TWAP 说明及下单与监控示例

## 集成模式

### TypeScript SDK
```typescript
import { DecibelClient } from '@decibel/sdk';

const client = new DecibelClient({
  apiKey: 'your-api-key',
  network: 'mainnet'
});

// Query market data
const markets = await client.getMarkets();
const prices = await client.getPrices();

// Place order
const order = await client.placeOrder({
  market: 'BTC-PERP',
  side: 'buy',
  type: 'limit',
  price: 50000,
  size: 1
});
```

### REST API
```bash
# Get market prices (unauthenticated)
GET https://api.netna.aptoslabs.com/decibel/market-data/prices

# Get account positions (authenticated)
GET https://api.netna.aptoslabs.com/decibel/user/positions
Headers: Authorization: Bearer {token}
```

### WebSocket
```javascript
const ws = new WebSocket('wss://api.netna.aptoslabs.com/decibel');

ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'trades',
  market: 'BTC-PERP'
}));
```

## 最佳实践

1. **始终阅读官方文档** - 使用 Grep 和 Read 工具
2. **提供完整示例** - 包含错误处理
3. **引用 API 端点** - 展示准确的 URL 和参数
4. **解释 Aptos 集成** - 参考 Move 合约
5. **展示 SDK 用法** - 在适用情况下优先使用 TypeScript SDK
6. **包含 WebSocket 示例** - 针对实时用例
7. **提及风险控制** - 解释仓位限制和安全功能
8. **参考交易格式化** - 展示正确的价格/数量编码

## 相关技能

- **Aptos 专家** - 用于区块链层面的问题
- **TypeScript** - 用于 SDK 集成帮助
- **WebSocket** - 用于实时流指导

## 备注

- Decibel 在 Aptos 区块链上完全链上运行
- 所有交易均通过智能合约结算
- TWAP 订单用于降低滑点
- 内置全面的风险控制
- 面向高级交易的金库策略
- 用于组织和委托的子账户
