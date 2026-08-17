---
name: hyperliquid-reader
description: >
  Read Hyperliquid (app.hyperliquid.xyz) perp + spot market data via
  opencli (read-only, public info API). Use whenever the user wants
  Hyperliquid perpetual or spot markets, mark/oracle/mid prices, 24h
  change, funding rates (hourly or annualized APR), open interest, volume,
  the L2 order book, OHLCV candles, historical funding, or a cross-venue
  funding comparison (Hyperliquid vs Binance vs Bybit) for funding
  arbitrage. Triggers: "Hyperliquid funding for BTC", "HL perp markets",
  "funding on BTC perp", "Hyperliquid order book", "HL open interest",
  "funding arb Hyperliquid vs Binance", "Hyperliquid candles for SOL",
  "Hyperliquid spot markets", "PURR price on Hyperliquid", "hyperliquid",
  "hyperliquid.xyz", "HL DEX". READ-ONLY market data — no account, order,
  or trade operations.
---
# Hyperliquid 读取器（只读）

通过 [opencli](https://github.com/jackwener/opencli) 和此仓库 [`opencli-plugins/hyperliquid`](https://github.com/himself65/finance-skills/tree/main/opencli-plugins/hyperliquid) 目录中的 `hyperliquid` 插件，读取链上永续合约/现货 DEX [Hyperliquid](https://app.hyperliquid.xyz) 的市场数据（该插件独立于 opencli 的内置适配器，使用 opencli 的 monorepo 子路径语法安装）。

**此技能仅支持只读操作，并且仅限市场数据。** 它读取 Hyperliquid 完全公开的信息 API 以进行分析，包括市场表格、资金费率、订单簿和 K 线。它不会读取个人账户、下单/修改/取消订单或转移资金。该插件中不存在交易路径——下单需要在另一个端点上执行由钱包签名的操作，而此适配器绝不会调用该端点。

**工作原理**：每条命令都会向 `POST https://api.hyperliquid.xyz/info` 发送一次请求，请求体为 `{ "type": "..." }`，并对响应进行标准化。**无需 API 密钥、无需钱包、无需登录、无需运行应用程序**——信息 API 是公开的。

---

## 第 1 步：确保 opencli 和插件已安装并准备就绪

**当前环境状态：**

```
!`(command -v opencli && opencli hyperliquid markets --coin BTC -f json 2>&1 | head -3 && echo "READY" || echo "SETUP_NEEDED") 2>/dev/null || echo "NOT_INSTALLED"`
```

如果上面的状态显示 `READY`，请跳至第 2 步。否则：

### NOT_INSTALLED — 安装 opencli

```bash
npm install -g @jackwener/opencli
```

需要 Node.js >= 24——`hyperliquid` 插件声明了 `engines.node >= 24`。

### SETUP_NEEDED — 安装 Hyperliquid 插件

Hyperliquid 适配器**并未**内置于 opencli——它是一个独立插件：

```bash
opencli plugin install github:himself65/finance-skills/hyperliquid
```

这就是全部设置过程——无需认证，也无需启动步骤。使用 `opencli hyperliquid markets --coin BTC` 进行验证。

### 常见设置问题

| 现象 | 解决方法 |
|---|---|
| `opencli: command not found` | `npm install -g @jackwener/opencli`（Node ≥ 24） |
| `Unknown command: hyperliquid` | `opencli plugin install github:himself65/finance-skills/hyperliquid` |
| `hyperliquid info 429` | 受到速率限制——等待几秒后重试 |

---

## 第 2 步：确定用户的需求

| 用户请求 | 命令 | 关键选项 |
|---|---|---|
| 永续合约市场概览/按交易量排名 | `opencli hyperliquid markets` | `--sort`, `--limit`, `--coin` |
| 单个永续合约的价格、资金费率和未平仓量 | `opencli hyperliquid markets --coin BTC` | — |
| 现货交易对概览 | `opencli hyperliquid spot-markets` | `--sort`, `--limit`, `--pair`, `--canonical-only` |
| 所有当前中间价 | `opencli hyperliquid mids` | `--coin <substring>` |
| 某个币种的订单簿 | `opencli hyperliquid book --coin ETH` | `--depth`, `--n-sig-figs` |
| OHLCV K 线 | `opencli hyperliquid candles --coin BTC --interval 1h` | `--limit` |
| 某个币种的历史资金费率 | `opencli hyperliquid funding-history --coin BTC` | `--hours`, `--limit` |
| 资金费率套利：HL 与 Binance、Bybit 对比 | `opencli hyperliquid funding-compare` | `--coin`, `--sort`, `--limit` |

---

## 第 3 步：执行命令

### 通用模式

```bash
# Use -f json or -f yaml for structured output
opencli hyperliquid markets --sort fundingAprPct --limit 15 -f json
opencli hyperliquid funding-compare --sort hlVsBinancePct --limit 20 -f md
opencli hyperliquid candles --coin BTC --interval 4h --limit 50 -f csv
opencli hyperliquid book --coin ETH --depth 5 -f json
```

### 关键规则

1. **币种符号使用不带前缀的永续合约名称** — `BTC`、`ETH`、`SOL`、`HYPE`（不含交易所前缀）。现货交易对采用 `BASE/USDC` 格式（例如 `PURR/USDC`）；对于 `book`/`candles`，可以传入永续合约币种或现货交易对。
2. **对于“X / 市场表现如何”这类问题，默认使用 `markets` 视图** — 它按每个永续合约一行，提供标记价格、预言机价格、中间价、24 小时涨跌幅、每小时资金费率及其年化收益率、未平仓量（币数和名义价值）以及 24 小时交易量。使用 `--coin` 筛选单个资产。
3. **资金费率以两种方式报告** — `fundingHrPct` 是以百分比表示的原始每小时费率；`fundingAprPct` 对其进行年化（`hourly × 24 × 365`）。比较不同资产的持仓成本时，应优先使用年化收益率；对于“下一小时我需要支付多少”这类问题，则使用每小时费率。
4. **`funding-compare` 是资金费率套利筛选器** — 它根据每个平台各自的结算周期进行年化（HL 每小时，Binance/Bybit 通常每 4 小时），并报告 `hlVsBinancePct` / `hlVsBybitPct` 价差。默认排序按 HL 与 Binance 价差的**绝对值**排名（差异最大的排在最前）。`hlVsBinancePct` 为正表示 HL 多头支付的费用高于 Binance 多头。
5. **`book` 默认显示买卖双方各 10 档** — 可提高 `--depth`（最大值为 20）以显示更多档位，或使用 `--n-sig-figs 2..5` 聚合价格档位。根据最高买价和最低卖价计算价差和中间价。
6. **`candles` 获取最近的 `--limit` 根 `--interval` K 线**（默认 `1h`，100 根 K 线）。有效周期：`1m 3m 5m 15m 30m 1h 2h 4h 8h 12h 1d 3d 1w 1M`。最大值为 5000。
7. **`-f json`** 用于程序化处理或提供给其他技能；`-f md` 或 `-f table` 用于生成便于人类阅读的输出。
8. **切勿调用任何写入操作。** 此技能仅提供只读市场数据——不读取账户、不下单、不修改或取消订单，也不进行转账。该插件有意不提供任何写入端点。

### 输出格式标志（`-f`）

| 格式 | 标志 | 最适合 |
|---|---|---|
| 表格 | `-f table`（默认） | 便于人类阅读的终端输出 |
| JSON | `-f json` | 程序化处理、LLM 上下文 |
| YAML | `-f yaml` | 结构化、易读 |
| Markdown | `-f md` | 报告 |
| CSV | `-f csv` | 导出到电子表格 |

### 输出列

- `markets` — `coin`、`markPx`、`midPx`、`oraclePx`、`change24hPct`、`fundingHrPct`、`fundingAprPct`、`openInterest`、`oiNotional`、`dayNtlVlm`、`premiumPct`、`maxLeverage`
- `spot-markets` — `pair`、`base`、`markPx`、`midPx`、`change24hPct`、`dayNtlVlm`、`circulatingSupply`、`marketCap`、`canonical`
- `mids` — `coin`、`mid`
- `book` — `side`、`level`、`px`、`sz`、`orders`
- `candles` — `time`、`open`、`high`、`low`、`close`、`volume`、`trades`
- `funding-history` — `coin`、`fundingRatePct`、`fundingAprPct`、`premiumPct`、`time`
- `funding-compare` — `coin`、`hlAprPct`、`binanceAprPct`、`bybitAprPct`、`hlVsBinancePct`、`hlVsBybitPct`、`nextHlFunding`

---

## 第 4 步：呈现结果

1. **先给出关键数字，再展示表格。** 对于 `markets --coin BTC`：先用文字说明标记价格、24 小时涨跌幅、资金费率 APR 和未平仓合约量。对于完整的 `markets` 数据：先给出市场数量，并列出涨跌幅最大或资金费率最高的币种。
2. **从持有收益的角度描述资金费率**——例如，“BTC 永续合约的资金费率为 +10.9% APR（多头向空头支付）”。正资金费率 ⇒ 多头向空头支付；负资金费率 ⇒ 空头向多头支付。
3. **对于 `funding-compare`，优先展示差异最大的情况**——列出币种、两个交易场所各自的 APR 及其利差，并注意该利差已经年化；实际套利还会产生交易所手续费和提现摩擦，因此应将其呈现为筛选结果，而不是有保证的优势。
4. **对于 `book`，报告价差**——在列出每一档数据之前（或用这些数据取而代之），先给出最优买价、最优卖价、中间价以及以基点计的价差。除非用户要求，否则不要粘贴 20 档数据。
5. **对于 `candles`，描述价格走势**——给出首个和最后一个收盘价、最高价和最低价，以及走势方向；仅当用户需要完整序列时，才展示完整的 OHLCV 表格。
6. **展示前进行严格筛选**——`markets` 包含约 180 个永续合约，`mids` 包含约 700 个市场；除非用户要求完整列表，否则应根据相关排序标准将结果限制在前 15–20 项。
7. **为交易决策进行交叉参照**——Hyperliquid 是链上交易场所；如需股票或期权方面的背景信息，请将其与 `funda-data` 或 `tradingview-reader` 技能配合使用。对于资金费率/基差交易，`funding-compare` 加上 `markets`（溢价、未平仓合约量）构成核心视图。

---

## 第 5 步：诊断

```bash
opencli hyperliquid markets --coin BTC
```

成功返回 BTC 数据行，即可确认 opencli、插件和公共 API 均可访问。如果出现 `Unknown command: hyperliquid` 错误，请重新安装插件（第 1 步）。`hyperliquid info 4xx/5xx` 表示上游 API 出现问题——短暂等待后重试。

---

## 错误参考

| 错误 | 原因 | 修复方法 |
|---|---|---|
| `Unknown command: hyperliquid` | 未安装插件 | `opencli plugin install github:himself65/finance-skills/hyperliquid` |
| `hyperliquid info 429` | 请求受到速率限制 | 等待几秒后重试 |
| `hyperliquid info 422/500` | 请求正文格式错误或上游出现问题 | 重新检查币种/时间间隔；等待后重试 |
| `No perp market for coin "X"` | 交易代码错误或未上市 | 运行 `opencli hyperliquid markets`（或 `mids`）查找准确的交易代码 |

---

## 参考文件

- `references/commands.md` — 所有命令及其全部标志、输出模式和分析师工作流（资金费率持有收益、基差/套利、现货快照）