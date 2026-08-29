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
# Hyperliquid Reader（只读）

通过 [opencli](https://github.com/jackwener/opencli) 以及本仓库 [`opencli-plugins/hyperliquid`](https://github.com/himself65/finance-skills/tree/main/opencli-plugins/hyperliquid) 目录中的 `hyperliquid` 插件读取 [Hyperliquid](https://app.hyperliquid.xyz) —— 这个链上永续合约/现货 DEX —— 的市场数据（该插件与 opencli 内置的适配器分开，通过 opencli monorepo 子路径语法安装）。

**此 skill 仅支持只读和市场数据。** 它读取 Hyperliquid 完全公开的信息 API，用于分析：市场表、资金费率、订单簿和 K 线。它不会读取个人账户、下单/修改/取消订单或转移资金。插件中不存在交易路径——下单需要钱包签名操作，并通过一个本适配器从不调用的独立端点完成。

**工作方式**：每条命令都会向 `POST https://api.hyperliquid.xyz/info` 发送一个包含 `{ "type": "..." }` 请求体的请求，并对响应进行规范化。**无需 API 密钥、无需钱包、无需登录、无需运行应用**——信息 API 是公开的。

---

## 第 1 步：确保已安装并准备好 opencli + 插件

**当前环境状态：**

```
!`(command -v opencli && opencli hyperliquid markets --coin BTC -f json 2>&1 | head -3 && echo "READY" || echo "SETUP_NEEDED") 2>/dev/null || echo "NOT_INSTALLED"`
```

如果上面的状态显示 `READY`，请跳到第 2 步。否则：

### NOT_INSTALLED — 安装 opencli

```bash
npm install -g @jackwener/opencli
```

需要 Node.js >= 24 —— `hyperliquid` 插件声明了 `engines.node >= 24`。

### SETUP_NEEDED — 安装 Hyperliquid 插件

Hyperliquid 适配器**并未内置于 opencli**——它是一个独立插件：

```bash
opencli plugin install github:himself65/finance-skills/hyperliquid
```

完整设置到此结束——无需身份验证，无需启动步骤。使用 `opencli hyperliquid markets --coin BTC` 验证。

### 常见设置问题

| 症状 | 修复方法 |
|---|---|
| `opencli: command not found` | `npm install -g @jackwener/opencli`（Node ≥ 24） |
| `Unknown command: hyperliquid` | `opencli plugin install github:himself65/finance-skills/hyperliquid` |
| `hyperliquid info 429` | 触发速率限制——等待几秒后重试 |

---

## 第 2 步：确定用户需要什么

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 永续合约市场概览 / 按成交量排名靠前的市场 | `opencli hyperliquid markets` | `--sort`、`--limit`、`--coin` |
| 某个永续合约的价格 + 资金费率 + OI | `opencli hyperliquid markets --coin BTC` | — |
| 现货交易对概览 | `opencli hyperliquid spot-markets` | `--sort`、`--limit`、`--pair`、`--canonical-only` |
| 当前所有中间价 | `opencli hyperliquid mids` | `--coin <substring>` |
| 某个币种的订单簿 | `opencli hyperliquid book --coin ETH` | `--depth`、`--n-sig-figs` |
| OHLCV K 线 | `opencli hyperliquid candles --coin BTC --interval 1h` | `--limit` |
| 某个币种的历史资金费率 | `opencli hyperliquid funding-history --coin BTC` | `--hours`、`--limit` |
| 资金费率套利：HL vs Binance vs Bybit | `opencli hyperliquid funding-compare` | `--coin`、`--sort`、`--limit` |

---

## 第 3 步：执行命令

### 常规模式

```bash
# Use -f json or -f yaml for structured output
opencli hyperliquid markets --sort fundingAprPct --limit 15 -f json
opencli hyperliquid funding-compare --sort hlVsBinancePct --limit 20 -f md
opencli hyperliquid candles --coin BTC --interval 4h --limit 50 -f csv
opencli hyperliquid book --coin ETH --depth 5 -f json
```

### 关键规则

1. **Coin symbols are bare perp names** — `BTC`、`ETH`、`SOL`、`HYPE`（不带交易所前缀）。现货交易对为 `BASE/USDC`（例如 `PURR/USDC`）；对于 `book`/`candles`，可以传入 perp coin 或现货交易对。
2. **`markets` 是回答“X / 市场表现如何”时的默认视角** — 它会在每个 perp 的一行中提供标记价格/预言机价格/中间价、24 小时变化、每小时资金费率 + APR、未平仓量（币数量和名义价值），以及 24 小时交易量。使用 `--coin` 可筛选单个资产。
3. **资金费率有两种报告方式** — `fundingHrPct` 是原始每小时费率，以百分比表示；`fundingAprPct` 将其年化（`hourly × 24 × 365`）。比较不同资产的持有收益时，应优先使用 APR；回答“下一小时我需要支付多少”时，应使用每小时数值。
4. **`funding-compare` 是资金费率套利筛选器** — 它根据各交易场所自身的结算间隔进行年化（HL 为每小时，Binance/Bybit 通常为每 4 小时），并报告 `hlVsBinancePct` / `hlVsBybitPct` 价差。默认排序按照 HL 对 Binance 价差的**绝对值**进行排名（优先显示偏离最宽的情况）。`hlVsBinancePct` 为正表示 HL 多头支付的资金费率高于 Binance 多头。
5. **`book` 默认返回每一侧 10 个价位** — 增大 `--depth`（最大为 20）可获取更多价位，或使用 `--n-sig-figs 2..5` 聚合价格档位。根据最优买价和卖价计算价差/中间价。
6. **`candles` 获取 `--interval` 周期中最近的 `--limit` 根 K 线**（默认为 `1h`、100 根 K 线）。有效周期：`1m 3m 5m 15m 30m 1h 2h 4h 8h 12h 1d 3d 1w 1M`。最大值为 5000。
7. **`-f json`** 用于程序化处理 / 向其他 skill 传递数据；`-f md` 或 `-f table` 用于人类可读的输出。
8. **绝不要调用任何写操作。** 此 skill 仅提供只读市场数据 — 不读取账户、不下单、不修改或取消订单，也不进行转账。该插件有意不提供任何写入端点。

### 输出格式标志（`-f`）

| 格式 | 标志 | 最适合用于 |
|---|---|---|
| 表格 | `-f table`（默认） | 人类可读的终端输出 |
| JSON | `-f json` | 程序化处理、LLM 上下文 |
| YAML | `-f yaml` | 结构化且易读 |
| Markdown | `-f md` | 报告 |
| CSV | `-f csv` | 电子表格导出 |

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

1. **先给出核心数字，再展示表格。** 对于 `markets --coin BTC`：先用文字说明标记价格、24 小时变动、资金费率 APR 和未平仓量。对于完整的 `markets` 输出：先给出市场数量，以及涨跌幅最大的品种 / 资金费率最高的品种。
2. **以套利收益的角度描述资金费率**——例如：“BTC 永续合约资金费率为 +10.9% APR（多头向空头支付）”。正资金费率 ⇒ 多头向空头支付；负资金费率 ⇒ 空头向多头支付。
3. **对于 `funding-compare`，优先展示差异最大的情况**——指出币种、两个交易场所的 APR 以及价差，并记住价差是年化的；实际套利还需承担交易所和提现摩擦成本，因此应将其作为筛选结果，而不是保证获利的机会。
4. **对于 `book`，报告价差**——在倾倒所有价位之前（或代替倾倒所有价位），先给出最佳买价、最佳卖价、中间价和以 bps 计的价差。除非用户要求，否则不要粘贴 20 个价位。
5. **对于 `candles`，描述价格走势**——给出首个 / 最后一个收盘价、最高价 / 最低价以及方向；只有在用户需要完整序列时，才展示完整的 OHLCV 表格。
6. **在展示前进行积极筛选**——`markets` 包含约 180 个永续合约，`mids` 包含约 700 个市场；除非用户要求完整列表，否则按相关排序指标限制为前 15–20 个。
7. **为交易决策进行交叉参考**——Hyperliquid 是链上交易场所；对于股票 / 期权背景信息，将其与 `tradingview-reader` skill 配合使用。对于资金费率 / 基差交易，`funding-compare` 加上 `markets`（溢价、未平仓量）是核心视图。

---

## 第 5 步：诊断

```bash
opencli hyperliquid markets --coin BTC
```

成功返回 BTC 行，表明 opencli、插件和公共 API 均可访问。如果报错 `Unknown command: hyperliquid`，请重新安装插件（第 1 步）。如果出现 `hyperliquid info 4xx/5xx`，则表示上游 API 出现问题——稍等片刻后重试。

---

## 错误参考

| 错误 | 原因 | 修复方法 |
|---|---|---|
| `Unknown command: hyperliquid` | 未安装插件 | `opencli plugin install github:himself65/finance-skills/hyperliquid` |
| `hyperliquid info 429` | 触发速率限制 | 等待几秒后重试 |
| `hyperliquid info 422/500` | 请求体格式错误或上游问题 | 重新检查币种 / 时间间隔；等待片刻后重试 |
| `No perp market for coin "X"` | 符号错误或未上市 | 运行 `opencli hyperliquid markets`（或 `mids`）以查找准确的符号 |

---

## 参考文件

- `references/commands.md` — 每条命令及其所有标志、输出架构和分析师工作流（资金费率套利收益、基差 / 套利、现货快照）