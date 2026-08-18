---
name: web3-data
description: >
  Two services in one skill:
  (1) Web3 on-chain data via Chainbase CLI — use when the user asks about blockchain data,
  token holders, wallet addresses, token prices, ENS domains, transactions, DeFi portfolios,
  or any on-chain analytics. Triggers: "top holders of", "who holds", "wallet address",
  "token price", "token transfers", "ENS domain", "on-chain data", "blockchain query",
  "SQL query on-chain", across Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche,
  zkSync, and other EVM chains.
  (2) Crypto social intelligence via Tops (chainbase tops) — use when the user asks about
  trending crypto narratives, social mentions, Twitter/X crypto discussions, narrative
  discovery, topic heat, or KOL/community signals. Triggers: "trending topics", "crypto
  narrative", "what's trending in crypto", "social mentions", "who is talking about",
  "crypto twitter", "KOL signals", "narrative search", "topic posts".
---
# Web3 数据探索器（Chainbase）

通过 [Chainbase CLI](https://github.com/chainbase-labs/cli) 查询链上数据。

## 快速参考

**安装**：`npm install -g chainbase-cli`（或使用 `npx chainbase-cli`）

**身份验证**：通过 `chainbase config set api-key YOUR_KEY` 设置 API 密钥，或使用环境变量 `CHAINBASE_API_KEY`。如果未设置，则回退到 `demo` 密钥。如果受到速率限制，请引导用户前往 https://platform.chainbase.com 获取密钥。

**x402 支付**：通过 `--x402` 标志支持按调用付费的小额支付。设置方式：`chainbase config set private-key 0x...`

```bash
# Top token holders
chainbase token top-holders 0xdAC17F958D2ee523a2206206994597C13D831ec7 --chain 1 --limit 10

# Token price
chainbase token price 0xdAC17F958D2ee523a2206206994597C13D831ec7

# ENS resolve
chainbase domain ens-resolve vitalik.eth

# SQL query
chainbase sql execute "SELECT * FROM ethereum.blocks ORDER BY number DESC LIMIT 5"
```

使用 `--json` 获取可供机器解析的输出。使用 `--chain <id>` 指定目标链。

## 链 ID

| 链 | ID | 链 | ID |
|---|---|---|---|
| Ethereum | 1 | Optimism | 10 |
| BSC | 56 | Base | 8453 |
| Polygon | 137 | zkSync | 324 |
| Avalanche | 43114 | Arbitrum | 42161 |

除非用户另有指定，否则默认使用 Ethereum（chain 1）。

## 路由逻辑

将用户意图匹配到合适的 CLI 命令：

| 用户需求 | CLI 命令 |
|---|---|
| 最新区块号 | `chainbase block latest` |
| 区块详情 | `chainbase block detail <number>` |
| 交易详情 | `chainbase tx detail <hash>` |
| 钱包交易历史 | `chainbase tx list <address>` |
| 代币信息（名称、符号、供应量） | `chainbase token metadata <contract>` |
| 代币价格 | `chainbase token price <contract>` |
| 历史代币价格 | `chainbase token price-history <contract> --from <ts> --to <ts>` |
| 持有者地址列表 | `chainbase token holders <contract>` |
| 代币主要持有者 / 谁持有某代币 | `chainbase token top-holders <contract>` |
| 代币转账历史 | `chainbase token transfers --contract <addr>` |
| 原生代币余额（ETH/BNB） | `chainbase balance native <address>` |
| 钱包的 ERC20 代币余额 | `chainbase balance tokens <address>` |
| DeFi 投资组合仓位 | `chainbase balance portfolios <address>` |
| 地址持有的 ENS 域名 | `chainbase domain ens <address>` |
| ENS 名称 → 地址 | `chainbase domain ens-resolve <name>` |
| 地址 → ENS 名称 | `chainbase domain ens-reverse <address>` |
| Space ID 解析（BSC） | `chainbase domain spaceid-resolve <domain>` |
| Space ID 反向解析（BSC） | `chainbase domain spaceid-reverse <address>` |
| 调用智能合约函数 | `chainbase contract call --address <contract> --function "fn" --abi '[...]' --params '[...]'` |
| **以上未涵盖的任何需求** | **SQL API**：`chainbase sql execute "SELECT ..."` |

## 工作流

1. **识别意图** — 确定用户需要哪些数据
2. **解析标识符** — 如果用户提供的是代币名称（例如“USDT”），查找其合约地址。常见代币：
   - USDT：`0xdAC17F958D2ee523a2206206994597C13D831ec7`（ETH）
   - USDC：`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`（ETH）
   - WETH：`0xC02aaA39b223FE8D0A0e5c4F27eAD9083C756Cc2`（ETH）
   - DAI：`0x6B175474E89094C44Da98b954EedeAC495271d0F`（ETH）
   - WBTC：`0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599`（ETH）
   - 如果未知，则使用 `chainbase token metadata <contract>`，或向用户询问合约地址
3. **选择命令** — 使用上面的路由表；对于复杂或自定义查询，回退到 SQL API
4. **执行** — 运行 CLI 命令。需要以编程方式解析输出时，添加 `--json`
5. **展示结果** — 使用表格清晰地展示列表数据，并突出关键洞察

## 全局选项

所有命令都支持以下选项：

| 选项 | 描述 | 默认值 |
|---|---|---|
| `--chain <id>` | 目标链 | `1`（Ethereum） |
| `--json` | 可供机器解析的 JSON 输出 | `false` |
| `--page <n>` | 分页结果的页码 | `1` |
| `--limit <n>` | 每页结果数量 | `20` |
| `--x402` | 启用 x402 小额支付模式 | `false` |

## SQL API 回退方案

当 CLI 命令无法满足查询需求时，将用户意图转换为 SQL：

```bash
chainbase sql execute "SELECT from_address, SUM(value) as total FROM ethereum.token_transfers WHERE contract_address = '0x...' GROUP BY from_address ORDER BY total DESC LIMIT 20"
```

常见表结构模式（将 `ethereum` 替换为链名称）：
- `{chain}.blocks` — 区块数据
- `{chain}.transactions` — 交易
- `{chain}.token_transfers` — ERC20 转账
- `{chain}.token_metas` — 代币元数据
- `{chain}.logs` — 事件日志

SQL 限制：每次查询最多返回 100,000 条结果。

如需查看完整命令帮助，请运行 `chainbase --help` 或 `chainbase <command> --help`。

---

# 加密社交情报（Tops）

通过 `chainbase tops` 查询加密社交信号。无需 API 密钥 — 可免费使用。

**服务：** [Tops](https://tops.chainbase.com) — 趋势叙事、主题发现、Twitter/X 提及。
**基础 URL：** `https://api.chainbase.com/tops`（由 CLI 在内部调用）
**速率限制：** 10 req/s · 60 req/min · 600 req/hour（按客户端 IP 计算）

## 快速参考

```bash
# 列出热门加密主题（默认：英语）
chainbase tops trending
chainbase tops trending --language zh   # 中文
chainbase tops trending --language ko   # 韩语

# 获取主题的结构化详细信息
chainbase tops topic <topic_id>

# 获取某个主题下的帖子/推文
chainbase tops posts <topic_id>

# 按关键词搜索叙事候选主题
chainbase tops search "RWA"
chainbase tops search "AI Agent"

# 搜索近期 Twitter/X 提及
chainbase tops mentions "Ethereum ETF"
```

使用 `--json` 获取可供机器解析的输出。

## 路由逻辑

将用户意图匹配到正确的子命令：

| 用户需求 | CLI 命令 |
|---|---|
| 当前加密领域有哪些热门趋势 | `chainbase tops trending [--language <lang>]` |
| 某个特定主题的详细信息 / 摘要 | `chainbase tops topic <topic_id>` |
| 某个主题下的原始推文 / 帖子 | `chainbase tops posts <topic_id>` |
| 查找与某个叙事关键词相关的主题 | `chainbase tops search <keyword>` |
| 某个项目或关键词近期在 Twitter/X 上的提及 | `chainbase tops mentions <keyword>` |

## 工作流

### 趋势跟踪
1. `chainbase tops trending` → 获取当前热门主题（注意 `id` 字段）
2. `chainbase tops topic <id>` → 深入查看摘要、关键词和代表性推文
3. `chainbase tops posts <id>` → 获取原始推文，用于情绪分析

### 叙事发现
1. `chainbase tops search <keyword>` → 根据模糊词查找候选主题
2. 对候选主题进行聚类和总结，确定目标主题 ID
3. `chainbase tops topic <id>` → 确认主题详细信息

### 实时监控
1. `chainbase tops mentions <keyword>` → 监控某个项目/代币的社交提及
2. 从结果中提取立场、情绪和关键发声者

## 数据架构

**Story**（主题）：`id`、`keyword`、`summary`、`score`、`current_rank`、`rank_status`（`new`/`up`/`down`/`same`）、`is_new`、`authors[]`、`tweet_urls[]`、`first_tweet_time`、`snapshot_time`

**Tweet**：`id`、`text`、`media_json`、`user` → `{user_id, name, screen_name, blue_verified, profile_image}`