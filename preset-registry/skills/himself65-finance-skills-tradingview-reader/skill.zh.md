---
name: tradingview-reader
description: >
  Read TradingView desktop app for market data, news, alerts, watchlists,
  and screener results using opencli (read-only).
  Use this skill whenever the user wants quotes, options chains, options
  expiries, screener results across stocks/crypto/forex/futures/bonds,
  gainers/losers/movers, news headlines or full story bodies, alerts
  (active list, fire log, offline fires), watchlists including colored
  flag lists, symbol search/autocomplete, chart state, or screenshots
  from their local TradingView.app. Triggers include: "options chain for
  X", "IV on Y", "show me SNDK puts", "TV screener for Y sector", "screen
  oversold stocks", "TV gainers", "crypto by market cap", "TradingView
  news on AAPL", "show my watchlists", "red flag list", "list my alerts",
  "what alerts fired", "search TV for nvidia", "what symbol is on my
  chart", "screenshot NVDA chart", "TradingView IV skew", "TV expiries
  for X". This skill is READ-ONLY — it does NOT place trades, modify
  watchlists, or change chart layouts.
---
# TradingView 读取器（只读）

通过 [opencli](https://github.com/jackwener/opencli) 和连接到正在运行的 TradingView.app 进程的 CDP，读取 TradingView macOS 桌面应用中的行情、期权链和图表状态。由本仓库 [`opencli-plugins/tradingview`](https://github.com/himself65/finance-skills/tree/main/opencli-plugins/tradingview) 目录中的 `tradingview` 插件提供支持（该插件独立于 opencli 内置的适配器，通过 opencli monorepo 的子路径语法安装）。

**此 skill 为只读。** 用于分析：获取期权链、检查 IV/greeks、捕获图表状态。它不会下单、发布观点、修改自选列表或更改图表布局。

> **无头替代方案**：对于普通行情、TA 读数、筛选器、期货或不含 greeks 的期权链，优先使用同级的 `tradingview-mcp` skill（内置 MCP server，无需桌面应用，也无需重新启动 CDP）。当你需要 greeks / 每个行权价的 IV skew、包含合约数量的到期日，或与账户绑定的数据（自选列表、提醒、图表、TV 新闻）时，才使用*此 skill*。

**重要提示**：与基于浏览器的 opencli 读取器（twitter、linkedin）不同，此读取器直接通过 Chrome DevTools Protocol 与正在运行的 TradingView 桌面应用通信。用户必须：(a) 已安装 `TradingView.app`，并且 (b) 已在该应用中登录。该插件会处理使用调试端口重新启动应用的过程。

**工作原理**：数据命令通过 CDP `Storage.getCookies` 获取会话 Cookie，然后直接从 Node 发起 HTTP 请求。即使在 TradingView 自己的页面中，页面上下文的 fetch 也会被浏览器 CORS 预检阻止——桌面应用使用 Electron 的主进程（Node 网络栈）绕过这一限制，我们复现了这条路径。无需 Browser Bridge 扩展，也无需注册 `apps.yaml`。

---

## 第 1 步：确保已安装并准备好 opencli + Plugin

**当前环境状态：**

```
!`(command -v opencli && opencli tradingview status 2>&1 | head -5 && echo "READY" || echo "SETUP_NEEDED") 2>/dev/null || echo "NOT_INSTALLED"`
```

如果上方状态显示 `READY`，则跳到第 2 步。否则：

### NOT_INSTALLED — 安装 opencli

```bash
npm install -g @jackwener/opencli
```

需要 Node.js >= 24 —— 下一步安装的 `tradingview` 插件声明了 `engines.node >= 24`。

### SETUP_NEEDED — 安装 TradingView 插件并使用 CDP 启动

TradingView 适配器**并未内置于 opencli**——它是一个独立插件：

```bash
# Install the plugin
opencli plugin install github:himself65/finance-skills/tradingview

# Relaunch TradingView.app with CDP enabled (one-time per session)
opencli tradingview launch
```

`launch` 步骤会退出正在运行的 TradingView，并使用 `--remote-debugging-port=9222` 重新打开它。如果用户有未保存的绘图，**请提醒用户先保存图表布局**。

### 常见设置问题

| 症状 | 修复方法 |
|---|---|
| `opencli: command not found` | `npm install -g @jackwener/opencli`（Node ≥ 24） |
| `Unknown command: tradingview` | `opencli plugin install github:himself65/finance-skills/tradingview` |
| `Cannot reach CDP at http://127.0.0.1:9222` | 应用未使用调试端口启动——运行 `opencli tradingview launch` |
| `No tradingview.com cookies found` | 应用已打开但未登录——在桌面应用中登录 |
| `No TradingView tab found` | 在 TradingView 中打开任意图表或标的页面，然后重试 |
| Empty chain / 0 contracts | 当前登录账户的订阅等级不包含该标的的期权 |

---

## 第 2 步：确定用户需要什么

### 设置 / 图表检查

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 设置 / 连接检查 | `opencli tradingview status` | — |
| 使用 CDP 重新启动应用 | `opencli tradingview launch` | `--port 9222` |
| 图表上有什么 | `opencli tradingview chart-state` | `--tab <id>` |
| 截取图表屏幕截图 | `opencli tradingview screenshot --output ~/charts/nvda.png` | `--tab <id>` |

### 报价 + 期权

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 现货报价 | `opencli tradingview quote --ticker X` | `--exchange NASDAQ` |
| 期权链（完整） | `opencli tradingview options-chain --ticker X` | `--exchange` |
| 期权链（单个到期日、平值区间） | `opencli tradingview options-chain --ticker X --expiry YYYY-MM-DD` | `--type call\|put`、`--strikes-around-spot N` |
| 列出到期日 | `opencli tradingview options-expiries --ticker X` | — |

### 选股器

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 通用选股器（股票/加密货币/外汇/期货/债券） | `opencli tradingview screener --market america --columns ...` | `--filter <json>`、`--sort field:desc`、`--limit N`、`--label-product` |
| RSI < 30、按成交量排序的美国股票 | `opencli tradingview screener --market america --columns "name,close,RSI\|60,volume" --filter '[{"left":"RSI\|60","operation":"less","right":30}]' --sort volume:desc` | — |
| 按市值排名靠前的加密货币 | `opencli tradingview screener --market coin --columns "name,close,change,market_cap_calc" --sort market_cap_calc:desc --limit 50` | — |
| 品种搜索 / 自动补全 | `opencli tradingview search --query "nvidia"` | `--type stock\|funds\|crypto\|...`、`--exchange`、`--country` |

### 新闻

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 全球新闻头条 | `opencli tradingview news --limit 25` | `--category`、`--area`、`--section`、`--provider` |
| 特定股票代码的新闻 | `opencli tradingview news --symbol NASDAQ:AAPL` | `--limit`、`--section analysis\|press_release\|...` |
| 按 id 获取完整报道 | `opencli tradingview news --id <story-id>` | `--lang en` |

### 自选列表 + 警报

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 列出所有自选列表 | `opencli tradingview watchlists` | — |
| 某个自选列表中的品种 | `opencli tradingview watchlists --id <wl-id>` | — |
| 彩色旗标列表（红色/橙色/黄色/绿色/蓝色/紫色） | `opencli tradingview watchlists --color red` | — |
| 列出所有警报 | `opencli tradingview alerts --type list` | — |
| 活跃警报 | `opencli tradingview alerts --type active` | — |
| 最近触发的警报 | `opencli tradingview alerts --type triggered` | — |
| 离线期间触发的警报 | `opencli tradingview alerts --type offline` | — |
| 完整警报日志 | `opencli tradingview alerts --type log` | — |

---

## 第 3 步：执行命令

### 通用模式

```bash
# Use -f json or -f yaml for structured output
opencli tradingview options-chain --ticker SNDK --expiry 2026-05-22 -f json
opencli tradingview options-chain --ticker NVDA --strikes-around-spot 8 -f csv
opencli tradingview quote --ticker SPY --exchange NYSEARCA -f json
```

### 关键规则

1. 如果连接状态不确定，首先运行 `opencli tradingview status` — 它会报告 CDP 连接状态和当前活跃的 TradingView 标签页。
2. 对于程序化处理（LLM 上下文、下游技能），使用 `-f json`。
3. 按到期日和 `--strikes-around-spot` 进行筛选 — 完整期权链可能包含 3,000 多行；未经筛选的完整转储通常不是用户想要的结果。
4. 对于美国股票，默认使用 `--exchange NASDAQ`；对于 ETF（例如 SPY = NYSEARCA、QQQ = NASDAQ）或非美国上市标的，必须显式指定 `--exchange`。
5. 对于 `screener`，`--columns` 至关重要 — 它同时控制请求和输出表格。包含 `name`，以及 `--filter` 或 `--sort` 中使用的任何字段。对于指标，追加 `|TF` 以指定其时间周期，例如使用 `RSI|60` 表示 1 小时 RSI。默认列适用于股票，但对于 crypto / forex / futures 应替换为其他列（它们使用不同的字段目录）。
6. 对于 `screener`，`--filter` 是 JSON — 由 `{left, operation, right}` 子句组成的数组。在 shell 中始终使用单引号包裹 JSON，以避免转义问题。操作符速查表请参阅 `references/commands.md`。
7. 对于 `news`，尽早缩小信息流范围 — 全局信息流的规模如同消防水带般庞大。在提高 `--limit` 之前，先使用 `--symbol`、`--category`、`--section` 或 `--provider`。
8. 对于 `search`，优先使用它，而不是凭猜测 — 当用户提供的 ticker 存在歧义时（例如未指定交易所的 "SPY"），先运行 `search --query SPY` 确认上市标的，然后在后续命令中传入 `--exchange`。
9. 对于 `watchlists` 和 `alerts`，默认使用摘要 — 用户询问“我的 watchlists 中有哪些内容？”时，需要的是列表名称和数量，而不是每个 symbol。
10. **绝 NEVER 调用任何写操作。** 此技能是只读的 — 不执行交易、不编辑 watchlist、不创建或删除 alert，也不写入图表。该插件有意不暴露写入端点（`/append`、`/replace`、`/create_alert` 等）。

### 输出格式标志（`-f`）

| 格式 | 标志 | 最适合 |
|---|---|---|
| 表格 | `-f table` (默认) | 人类可读的终端输出 |
| JSON | `-f json` | 程序化处理、LLM 上下文 |
| YAML | `-f yaml` | 结构化输出，易于阅读 |
| Markdown | `-f md` | 文档、报告 |
| CSV | `-f csv` | 电子表格导出 |

### 输出列

- `quote` — `symbol`、`close`、`change`、`change_abs`、`currency`、`time`
- `options-chain` — `expiry`、`dte`、`strike`、`type`、`bid`、`ask`、`mid`、`iv`、`delta`、`gamma`、`theta`、`vega`、`rho`、`theo`、`bid_iv`、`ask_iv`、`symbol`
- `options-expiries` — `expiry`、`dte`、`contracts_count`
- `screener` — 动态；每个 `--columns` 条目对应一列，另加 `symbol`。（默认：`name`、`close`、`change`、`volume`、`market_cap_basic`、`sector.tr`。）
- `search` — `symbol`、`description`、`type`、`exchange`、`country`、`currency`
- `news`（列表模式）— `id`、`published`、`provider`、`title`、`urgency`、`related_symbols`、`link`
- `news`（故事模式，已设置 `--id`）— `id`、`published`、`provider`、`title`、`body`、`tags`、`link`
- `watchlists` — `id`、`name`、`symbol_count`、`symbols`
- `alerts` — `id`、`name`、`symbol`、`type`、`condition`、`value`、`active`、`status`、`fired_at`
- `chart-state` — `layout_id`、`symbol`、`interval`、`url`
- `screenshot` — `path`、`bytes`

---

## 步骤 4：呈现结果

1. **先给出结构摘要** — 对于期权链，先说明现货价格、所展示的到期日、ATM 行权价和 IV 状态；然后再展示表格。对于筛选器，先给出匹配数量和所应用的筛选条件。
2. **展示前积极过滤** — 绝不要直接粘贴 3,000 行的期权链或 500 行的筛选结果。期权链默认展示每个到期日 ATM ± 6 个行权价；对于筛选结果，默认限制为前 20 条，除非用户要求查看更多。
3. **突出偏斜** — 同时展示看涨期权和看跌期权时，如果 IV 偏斜方向较为明显，请注明其方向。
4. **对于图表状态**，简洁地报告布局 id + 品种 + 周期 + URL；并提供截图选项。
5. **对于新闻（列表模式）**，按提供商分组，并优先使用用户可能所在时区的时间戳（如果无法确定，则始终使用 UTC ISO 格式）。包含链接，以便用户打开新闻。对于故事模式（已设置 `--id`），正文为纯文本 — 按原样呈现，可选择截短。
6. **对于自选列表**，在列出品种前先汇总数量（例如：“3 个自选列表：Earnings（24 个品种）、AI plays（12 个品种）、Hedges（8 个品种）”）。除非用户要求，否则不要倾倒包含 100 个品种的自选列表内容。
7. **对于提醒**，按状态分组（active 与 triggered/fired），并按 `fired_at` 降序排列最近触发的提醒。除非用户明确要求，否则不要公开提醒 id。
8. **对于筛选结果**，先用普通文字说明涨跌幅最大的品种或极端值（例如：“市值最高的是 NVDA，达 4.2 万亿美元；有 12 个品种低于 RSI<30 阈值”），然后再展示表格。
9. **将会话视为私有内容** — 除非用户要求，否则绝不公开 CDP target IDs、cookies 或 layout IDs。

---

## 步骤 5：诊断

```bash
opencli tradingview status
```

返回 CDP 连接状态和当前活跃的 TradingView 标签页。如果 CDP 未运行，请运行 `opencli tradingview launch`，使用调试端口重新启动。

---

## 错误参考

| 错误 | 原因 | 修复方法 |
|---|---|---|
| `Unknown command: tradingview` | 未安装插件 | `opencli plugin install github:himself65/finance-skills/tradingview` |
| `Cannot reach CDP at http://127.0.0.1:9222` | 应用启动时未使用调试端口 | `opencli tradingview launch` |
| `No tradingview.com cookies found` | 已退出 TradingView 登录状态 | 在桌面应用中登录 |
| `No TradingView tab found` | 应用已打开，但未加载 TradingView 页面 | 打开任意图表或品种页面，然后重试 |
| `scanner 400 / Empty chain / totalCount=0` | 订阅等级不包含该品种的期权 | 在桌面应用中检查账户等级 |
| `Symbol not found` | 交易所错误 | 显式传入 `--exchange`，或先运行 `opencli tradingview search --query <name>` |
| Rate limited | 请求过多 | 等待几秒后重试 |

---

## 参考文件

- `references/commands.md` — 每条命令及其所有标志、输出示例和分析师工作流