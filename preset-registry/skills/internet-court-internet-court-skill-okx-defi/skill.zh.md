---
name: okx-defi
description: "OKX-aggregated DeFi (no specific DApp named) — product discovery, deposit/withdraw/claim execution, AND positions viewing. **If the user names ANY third-party protocol/DApp (Aave, Lido, PancakeSwap, Uniswap, Curve, Compound, Morpho, Pendle, Kamino, Raydium, Hyperliquid, Polymarket, …), route to okx-dapp-discovery — NOT here, even for 'show my Aave positions'.** INVEST triggers: 'invest in DeFi', 'earn yield', 'find best APY', 'deposit/stake for yield', 'search DeFi products', 'redeem/withdraw position', 'claim DeFi rewards', 'borrow against asset', 'repay loan', 'add/remove CLMM liquidity', 'APY/TVL history', 'depth chart', yield farming, lending, staking, liquidity pools. PORTFOLIO triggers: 'check my DeFi positions', 'view DeFi holdings/portfolio', 'my staking/lending positions', 'DeFi balance', 'DeFi 持仓', '我的DeFi资产'. Do NOT use for: DEX swaps (okx-agentic-wallet), token prices (okx-dex), wallet token balances (okx-agentic-wallet)."
license: MIT
metadata:
  author: okx
  version: "4.2.1"
  homepage: "https://web3.okx.com"
---
# OKX DeFi（okx-defi-invest + okx-defi-portfolio 的实验性合并）

在一个 skill 下提供两项能力的多链、OKX 聚合 DeFi。两者都封装了同一组 `onchainos defi` CLI 命令。

## 预检

> 阅读 `../okx-agentic-wallet/_shared/preflight.md`。如果该文件不存在，则改为阅读 `_shared/preflight.md`。

## 意图路由

| 用户意图 | 参考文档 |
|---|---|
| 发现 / 搜索 DeFi 产品，寻找最佳 APY | [invest.md](references/invest.md) |
| 产品详情（APY、TVL、接受的代币） | [invest.md](references/invest.md) |
| 存入 / 质押 / 提供流动性 | [invest.md](references/invest.md) |
| 提取 / 赎回头寸（全部或部分） | [invest.md](references/invest.md) |
| 领取奖励（平台 / 投资 / V3 手续费 / 奖金 / 已解锁本金） | [invest.md](references/invest.md) |
| APY 历史、TVL 历史、V3 深度 / 价格图表 | [invest.md](references/invest.md) |
| 查看 DeFi 头寸 / 持仓概览（持仓） | [portfolio.md](references/portfolio.md) |
| 按协议查看头寸详情（持仓详情） | [portfolio.md](references/portfolio.md) |
| 确切参数 / 返回 schema — invest 和 charts 命令 | [invest-cli-reference.md](references/invest-cli-reference.md) |
| 确切参数 / 返回 schema — positions 命令 | [portfolio-cli-reference.md](references/portfolio-cli-reference.md) |
| 错误 / 存入失败 / calldata 过期 | [invest-troubleshooting.md](references/invest-troubleshooting.md) |
| 错误 / 持仓为空 / 地址格式问题 | [portfolio-troubleshooting.md](references/portfolio-troubleshooting.md) |

典型流程会跨越两项能力：查看头寸（Portfolio）→ 赎回或领取奖励（Invest）。当请求包含这类链式操作时，请同时阅读两个参考文件。

## Skill 路由

- 对于以 DApp 命名的投资 / 借贷 / 质押 / 头寸（“在 Aave 上”“我的 Hyperliquid 余额”）→ 使用 `okx-dapp-discovery`
- 对于代币价格 / 图表，或按名称 / 合约搜索代币 → 使用 `okx-dex`
- 对于 DEX 现货兑换执行 → 使用 `okx-agentic-wallet`
- 对于钱包代币余额 → 使用 `okx-agentic-wallet`
- 对于广播已签名交易 → 使用 `okx-agentic-wallet`
- 对于 Agentic Wallet 登录、余额、合约调用 → 使用 `okx-agentic-wallet`

## 链支持

CLI 会自动解析链名称（例如 `ethereum` → `1`、`bsc` → `56`、`solana` → `501`）。完整别名表：`references/portfolio.md` §Chain Support。

## 步骤 0：地址解析（两项能力共用）

当用户**未提供**钱包地址时，在运行任何 defi 命令**之前**，从 Agentic Wallet 自动解析地址：

```
1. onchainos wallet status          → 检查是否已登录，并获取活跃账户
2. onchainos wallet addresses       → 获取按链类别分组的地址：
                                       - XLayer 地址
                                       - EVM 地址（Ethereum、BSC、Polygon 等）
                                       - Solana 地址
3. 将地址匹配到目标链：
   - EVM 链 → 使用 EVM 地址
   - Solana  → 使用 Solana 地址
   - XLayer  → 使用 XLayer 地址
```

规则：
- 如果用户提供了明确的地址，直接使用该地址，跳过此步骤
- 如果钱包未登录，要求用户先登录（→ `okx-agentic-wallet`），或手动提供地址
- 如果用户说“检查所有账户”或“所有钱包”，使用 `wallet balance --all` 获取所有账户 ID，然后对每个账户执行 `wallet switch <id>` + `wallet addresses`
- 如果账户中有多个相同类型的地址，在继续操作前始终向用户确认解析出的地址

## 地址与链的兼容性（共享 — 关键）

`--address` 和链参数必须兼容。EVM 地址（`0x…`）只能查询 EVM 链；Solana 地址（base58）只能查询 `solana`。绝不能混用，否则 API 将返回错误 84019（地址格式错误）。

- `0x…` 地址 → 只能传入 EVM 链：`ethereum,bsc,polygon,arbitrum,base,xlayer,avalanche,optimism,fantom,linea,scroll,zksync`
- base58 地址 → 只能传入 `solana`
- Sui 地址 → 只能传入 `sui`；Tron 地址（`T…`）→ 只能传入 `tron`；TON 地址 → 只能传入 `ton`
- 如果用户希望查询跨 EVM 和 Solana 的持仓，分别使用对应地址进行**两次独立调用**

## 全局说明

- 所有 defi 命令的钱包地址参数均为 `--address`
- `defi positions` 使用 `--chains`（复数，以逗号分隔）；`defi position-detail` 使用 `--chain`（单数）
- CLI 参数详情请参阅 `references/invest-cli-reference.md`（invest 和 charts）以及 `references/portfolio-cli-reference.md`（positions）