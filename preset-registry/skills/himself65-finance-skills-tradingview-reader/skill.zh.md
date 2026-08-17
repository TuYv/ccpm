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

通过 [opencli](https://github.com/jackwener/opencli) 和附加到正在运行的 TradingView.app 进程的 CDP，从 TradingView 的 macOS 桌面应用中读取报价、期权链和图表状态。由本仓库 [`opencli-plugins/tradingview`](https://github.com/himself65/finance-skills/tree/main/opencli-plugins/tradingview) 目录中的 `tradingview` 插件提供支持（这是一个独立于 opencli 内置适配器的插件，使用 opencli 的 monorepo 子路径语法安装）。

**此技能为只读。** 专为分析而设计：获取期权链、检查隐含波动率/希腊字母指标，以及捕获图表状态。它不会下单、发布观点、修改关注列表或更改图表布局。

> **无头模式替代方案**：对于普通报价、技术分析读数、筛选器、期货或不含希腊字母指标的期权链，优先使用同级的 `tradingview-mcp` 技能（内置 MCP 服务器，无需桌面应用，也无需通过 CDP 重新启动）。当你需要希腊字母指标/各行权价的隐含波动率偏斜、带合约数量的到期日，或与账户绑定的数据（关注列表、提醒、图表、TradingView 新闻）时，请使用*此*技能。

**重要提示**：与基于浏览器的 opencli 读取器（twitter、linkedin）不同，此读取器通过 Chrome DevTools Protocol 直接与正在运行的 TradingView 桌面应用通信。用户必须：(a) 已安装 `TradingView.app`；并且 (b) 已在该应用中登录。插件会处理带调试端口的重新启动。

**工作原理**：数据命令通过 CDP `Storage.getCookies` 获取会话 Cookie，然后直接从 Node 发起 HTTP 请求。即使从 TradingView 自己的页面发起请求，页面上下文中的 fetch 也会被浏览器 CORS 预检阻止——桌面应用使用 Electron 的主进程（Node 网络栈）绕过此限制，我们复现了这一路径。无需 Browser Bridge 扩展，也无需注册 `apps.yaml`。

---

## 第 1 步：确保 opencli 和插件已安装并准备就绪

**当前环境状态：**

```
!`(command -v opencli && opencli tradingview status 2>&1 | head -5 && echo "READY" || echo "SETUP_NEEDED") 2>/dev/null || echo "NOT_INSTALLED"`
```

如果上面的状态显示 `READY`，请跳到第 2 步。否则：

### NOT_INSTALLED — 安装 opencli

```bash
npm install -g @jackwener/opencli
```

需要 Node.js >= 24——下一步安装的 `tradingview` 插件声明了 `engines.node >= 24`。

### SETUP_NEEDED — 安装 TradingView 插件并使用 CDP 启动

TradingView 适配器**并未**内置于 opencli 中——它是一个独立插件：

```bash
# Install the plugin
opencli plugin install github:himself65/finance-skills/tradingview

# Relaunch TradingView.app with CDP enabled (one-time per session)
opencli tradingview launch
```

`launch` 步骤会退出正在运行的 TradingView，并使用 `--remote-debugging-port=9222` 重新打开它。如果用户有尚未保存的绘图，**请先提醒用户保存图表布局**。

### 常见设置问题

| 症状 | 解决方法 |
|---|---|
| `opencli: command not found` | `npm install -g @jackwener/opencli`（Node ≥ 24） |
| `Unknown command: tradingview` | `opencli plugin install github:himself65/finance-skills/tradingview` |
| `Cannot reach CDP at http://127.0.0.1:9222` | 应用未使用调试端口启动——运行 `opencli tradingview launch` |
| `No tradingview.com cookies found` | 应用已打开但尚未登录——请在桌面应用中登录 |
| `No TradingView tab found` | 在 TradingView 中打开任意图表或交易品种页面，然后重试 |
| 期权链为空/合约数量为 0 | 已登录账户的订阅等级不包含此交易品种的期权数据 |

---

## 第 2 步：确定用户需求

### 设置 / 图表检查

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 设置 / 连接检查 | `opencli tradingview status` | — |
| 使用 CDP 重新启动应用 | `opencli tradingview launch` | `--port 9222` |
| 查看图表上的内容 | `opencli tradingview chart-state` | `--tab <id>` |
| 截取图表 | `opencli tradingview screenshot --output ~/charts/nvda.png` | `--tab <id>` |

### 行情 + 期权

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 现货报价 | `opencli tradingview quote --ticker X` | `--exchange NASDAQ` |
| 期权链（完整） | `opencli tradingview options-chain --ticker X` | `--exchange` |
| 期权链（单个到期日、平值区间） | `opencli tradingview options-chain --ticker X --expiry YYYY-MM-DD` | `--type call\|put`, `--strikes-around-spot N` |
| 列出到期日 | `opencli tradingview options-expiries --ticker X` | — |

### 筛选器

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 通用筛选器（股票/加密货币/外汇/期货/债券） | `opencli tradingview screener --market america --columns ...` | `--filter <json>`, `--sort field:desc`, `--limit N`, `--label-product` |
| RSI < 30 且按成交量排序的美国股票 | `opencli tradingview screener --market america --columns "name,close,RSI\|60,volume" --filter '[{"left":"RSI\|60","operation":"less","right":30}]' --sort volume:desc` | — |
| 按市值排名靠前的加密货币 | `opencli tradingview screener --market coin --columns "name,close,change,market_cap_calc" --sort market_cap_calc:desc --limit 50` | — |
| 品种搜索 / 自动补全 | `opencli tradingview search --query "nvidia"` | `--type stock\|funds\|crypto\|...`, `--exchange`, `--country` |

### 新闻

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 全球新闻标题 | `opencli tradingview news --limit 25` | `--category`, `--area`, `--section`, `--provider` |
| 特定股票代码的新闻 | `opencli tradingview news --symbol NASDAQ:AAPL` | `--limit`, `--section analysis\|press_release\|...` |
| 按 ID 获取完整报道 | `opencli tradingview news --id <story-id>` | `--lang en` |

### 关注列表 + 提醒

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 列出所有关注列表 | `opencli tradingview watchlists` | — |
| 查看某个关注列表中的品种 | `opencli tradingview watchlists --id <wl-id>` | — |
| 彩色旗标列表（红色/橙色/黄色/绿色/蓝色/紫色） | `opencli tradingview watchlists --color red` | — |
| 列出所有提醒 | `opencli tradingview alerts --type list` | — |
| 活跃提醒 | `opencli tradingview alerts --type active` | — |
| 最近触发的提醒 | `opencli tradingview alerts --type triggered` | — |
| 离线期间触发的提醒 | `opencli tradingview alerts --type offline` | — |
| 完整提醒日志 | `opencli tradingview alerts --type log` | — |

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

1. 如果连接情况不确定，**先运行 `opencli tradingview status`**——它会报告 CDP 连接状态和当前活动的 TradingView 标签页。
2. **使用 `-f json`** 进行程序化处理（LLM 上下文、下游 Skill）。
3. **按到期日和 `--strikes-around-spot` 进行筛选**——完整期权链可能超过 3,000 行；未经筛选的完整转储通常并不是用户想要的结果。
4. 对于美国股票，**默认使用 `--exchange NASDAQ`**；对于 ETF（例如 SPY = NYSEARCA、QQQ = NASDAQ）或非美国上市标的，必须明确指定 `--exchange`。
5. 对于 `screener`，**`--columns` 至关重要**——它同时控制请求和输出表格。应包含 `name`，以及 `--filter` 或 `--sort` 中使用的所有字段。为指标追加 `|TF` 以指定其时间周期，例如 `RSI|60` 表示 1 小时 RSI。默认列适用于股票，但对于加密货币、外汇和期货，应替换这些列（它们的字段目录不同）。
6. 对于 `screener`，**`--filter` 是 JSON**——由 `{left, operation, right}` 子句组成的数组。始终在 shell 中使用单引号包裹 JSON，以避免转义问题。有关操作速查表，请参阅 `references/commands.md`。
7. 对于 `news`，**尽早缩小信息流范围**——全局信息流的数据量如洪流般庞大。应先使用 `--symbol`、`--category`、`--section` 或 `--provider`，再提高 `--limit`。
8. 对于 `search`，**优先使用搜索，而不是猜测**——当用户提供含义不明确的股票代码时（例如未指定交易所的“SPY”），先运行 `search --query SPY` 确认上市信息，然后在后续命令中传入 `--exchange`。
9. 对于 `watchlists` 和 `alerts`，**默认返回摘要**——当用户询问“我的自选列表里有什么？”时，他们想要的是列表名称和数量，而不是每一个标的代码。
10. **绝不要调用任何写入操作。** 此 Skill 为只读——不进行交易、不编辑自选列表、不创建或删除提醒，也不写入图表。该插件有意不公开写入端点（`/append`、`/replace`、`/create_alert` 等）。

### 输出格式标志（`-f`）

| 格式 | 标志 | 最适合 |
|---|---|---|
| 表格 | `-f table`（默认） | 人类可读的终端输出 |
| JSON | `-f json` | 程序化处理、LLM 上下文 |
| YAML | `-f yaml` | 结构化且易读的输出 |
| Markdown | `-f md` | 文档、报告 |
| CSV | `-f csv` | 导出到电子表格 |

### 输出列

- `quote` — `symbol`、`close`、`change`、`change_abs`、`currency`、`time`
- `options-chain` — `expiry`、`dte`、`strike`、`type`、`bid`、`ask`、`mid`、`iv`、`delta`、`gamma`、`theta`、`vega`、`rho`、`theo`、`bid_iv`、`ask_iv`、`symbol`
- `options-expiries` — `expiry`、`dte`、`contracts_count`
- `screener` — 动态；每个 `--columns` 条目对应一列，另加 `symbol`。（默认：`name`、`close`、`change`、`volume`、`market_cap_basic`、`sector.tr`。）
- `search` — `symbol`、`description`、`type`、`exchange`、`country`、`currency`
- `news`（列表模式）— `id`、`published`、`provider`、`title`、`urgency`、`related_symbols`、`link`
- `news`（报道模式，已设置 `--id`）— `id`、`published`、`provider`、`title`、`body`、`tags`、`link`
- `watchlists` — `id`、`name`、`symbol_count`、`symbols`
- `alerts` — `id`、`name`、`symbol`、`type`、`condition`、`value`、`active`、`status`、`fired_at`
- `chart-state` — `layout_id`、`symbol`、`interval`、`url`
- `screenshot` — `path`、`bytes`

---

## 第 4 步：呈现结果

1. **先给出结构摘要** — 对于期权链，先说明现货价格、所展示的到期日、平值行权价和隐含波动率环境，然后再展示表格。对于筛选器，先说明匹配项数量和所应用的筛选条件。
2. **展示前进行严格筛选** — 绝不要直接粘贴包含 3,000 行的期权链或 500 行的筛选结果。对于期权链，默认展示每个到期日 ATM ± 6 个行权价；对于筛选器，除非用户要求更多，否则最多展示前 20 项。
3. **突出波动率偏斜** — 同时展示看涨期权和看跌期权时，如果隐含波动率偏斜较为明显，应指出其方向。
4. **对于图表状态**，简洁地报告布局 ID + 交易品种 + 时间周期 + URL；并询问是否需要截图。
5. **对于新闻（列表模式）**，按提供商分组，并优先显示采用用户可能所在时区的时间戳（如果不确定，则始终使用 UTC ISO 格式）。包含链接，以便用户打开新闻。在报道模式（设置了 `--id`）下，正文为纯文本 — 按原样呈现，也可以适当截短。
6. **对于自选列表**，先汇总数量，再列出交易品种（例如，“3 个自选列表：财报（24 个交易品种）、AI 概念（12 个交易品种）、对冲（8 个交易品种）”）。除非用户要求，否则不要倾倒包含 100 个交易品种的自选列表内容。
7. **对于提醒**，按状态分组（活跃与已触发），并按 `fired_at` 降序排列最近触发的提醒。除非用户明确要求，否则不要暴露提醒 ID。
8. **对于筛选结果**，先用通俗文字说明涨跌幅最大者或极值（例如，“市值最高的是 NVDA，为 4.2 万亿美元；有 12 个标的低于 RSI<30 阈值”），然后再展示表格。
9. **将会话视为私密信息** — 除非用户要求，否则绝不要暴露 CDP 目标 ID、Cookie 或布局 ID。
10. **当用户正在做交易决策时，与 Funda 进行交叉核对** — TradingView 的期权/筛选器数据使用方便，但可能存在延迟；对于交易入场分析，还应从 `funda-data` skill 获取数据并进行核对。

---

## 第 5 步：诊断

```bash
opencli tradingview status
```

返回 CDP 连接状态和活跃的 TradingView 标签页。如果 CDP 已断开，请运行 `opencli tradingview launch`，使用调试端口重新启动。

---

## 错误参考

| 错误 | 原因 | 修复方法 |
|---|---|---|
| `Unknown command: tradingview` | 插件未安装 | `opencli plugin install github:himself65/finance-skills/tradingview` |
| `Cannot reach CDP at http://127.0.0.1:9222` | 应用启动时未启用调试端口 | `opencli tradingview launch` |
| `No tradingview.com cookies found` | 已退出 TradingView 登录 | 在桌面应用中登录 |
| `No TradingView tab found` | 应用已打开，但未加载任何 TradingView 页面 | 打开任意图表或交易品种页面，然后重试 |
| `scanner 400 / Empty chain / totalCount=0` | 订阅等级不支持此交易品种的期权 | 在桌面应用中检查账户等级 |
| `Symbol not found` | 交易所错误 | 显式传入 `--exchange`，或先运行 `opencli tradingview search --query <name>` |
| 请求频率受限 | 请求过多 | 等待几秒钟，然后重试 |

---

## 参考文件

- `references/commands.md` — 包含所有命令及其全部标志、输出示例和分析师工作流