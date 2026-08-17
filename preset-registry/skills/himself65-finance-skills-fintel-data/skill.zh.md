---
name: fintel-data
description: >
  Query Fintel (fintel.io) institutional market intelligence
  via the REST API at https://api.fintel.io/v1 with FINTEL_API_KEY
  (X-API-KEY header), or the official MCP server at
  https://mcp.fintel.io/mcp. Read-only data: short interest, borrow
  rate/fee and shares available to borrow, daily short volume,
  fails-to-deliver (FTD), institutional ownership from SEC 13F filings,
  insider transactions from SEC Form 3/4/5, analyst price targets,
  ratings and forecasts, dividends and earnings history, earnings and
  dividend calendars, EOD price bars, last trade price, security master
  lookup by ticker/CUSIP/ISIN/FIGI, leaderboards, watchlists and alerts.
  Triggers: "fintel", "fintel.io", short interest, short squeeze data,
  borrow rate, cost to borrow, shares available to borrow, FTD, fails to
  deliver, short volume, 13F holders, institutional owners, who owns X,
  insider buying, insider selling, Form 4 transactions, analyst price
  target, days to cover, short interest ratio.
---
# Fintel 数据技能

Fintel（[fintel.io](https://fintel.io)）是一个机构级市场情报平台。  
其最具优势的数据集正是大多数其他提供商所欠缺的：**空头持仓、借券利率、卖空成交量、交割失败、13F 机构持股和内部人士交易**。

Fintel 提供两个基于同一数据契约的接口：

| 接口 | 端点 | 认证 | 最适合 |
|---|---|---|---|
| **REST** | `https://api.fintel.io/v1/*` | `X-API-KEY` 请求头 | 默认选择——任何 CLI 代理均可使用 curl |
| **MCP** | `https://mcp.fintel.io/mcp` | `X-API-KEY` 请求头 | MCP 原生客户端、工具自动发现 |

两者都需要 Fintel API 密钥。**此技能为只读**——仅可调用 GET 端点。该 API 还提供写入端点（创建/删除股票列表、提醒订阅、团队）；请勿调用这些端点。

---

## 第 1 步：解析 FINTEL_API_KEY

该技能按以下顺序解析 `FINTEL_API_KEY`：
1. `FINTEL_API_KEY` 环境变量
2. 当前目录下 `.env` 中的 `FINTEL_API_KEY`
3. git 仓库根目录下 `.env` 中的 `FINTEL_API_KEY`（这样 worktree 就能继承主检出目录中的密钥）

```
!`if [ -n "$FINTEL_API_KEY" ]; then echo "KEY_FROM_ENV_VAR"; elif [ -f .env ] && grep -qE "^FINTEL_API_KEY=" .env; then echo "KEY_FROM_LOCAL_DOTENV:$(pwd)/.env"; else GIT_COMMON=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null); if [ -n "$GIT_COMMON" ]; then ROOT=$(dirname "$GIT_COMMON"); if [ -f "$ROOT/.env" ] && grep -qE "^FINTEL_API_KEY=" "$ROOT/.env"; then echo "KEY_FROM_ROOT_DOTENV:$ROOT/.env"; else echo "KEY_NOT_SET"; fi; else echo "KEY_NOT_SET"; fi; fi`
```

然后根据结果执行操作：

- `KEY_FROM_ENV_VAR`——在 curl 调用中直接使用 `$FINTEL_API_KEY`。
- `KEY_FROM_LOCAL_DOTENV:<path>` / `KEY_FROM_ROOT_DOTENV:<path>`——在调用前加载一次：
  ```bash
  export FINTEL_API_KEY=$(grep -E "^FINTEL_API_KEY=" <path> | head -1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//')
  ```
- `KEY_NOT_SET`——向用户索取密钥。密钥随 Fintel API 套餐提供（[fintel.io](https://fintel.io)，文档位于 [api.fintel.io/docs](https://api.fintel.io/docs)）。用户可以执行 `export FINTEL_API_KEY="..."`，也可以将 `FINTEL_API_KEY=...` 添加到仓库根目录的 `.env` 中（使用 worktree 时首选）。

---

## 第 2 步：解析证券

大多数端点通过 `{country}/{symbol}` 寻址，即 ISO 国家/地区代码加股票代码，例如 `us/AAPL`。当用户仅提供股票代码时，默认使用 `us`。

如果股票代码存在歧义，或者用户提供的是公司名称、CUSIP、ISIN 或 FIGI，请先进行解析：

```bash
# name / ticker / CUSIP / ISIN / FIGI search
curl -s -H "X-API-KEY: $FINTEL_API_KEY" "https://api.fintel.io/v1/securities?query=apple&country=us"
# exact identifier lookup (type: cusip, isin, ticker, id)
curl -s -H "X-API-KEY: $FINTEL_API_KEY" "https://api.fintel.io/v1/identifiers/isin/US0378331005"
```

---

## 第 3 步：将请求匹配到端点

| 用户需求 | 端点 | 说明 |
|---|---|---|
| 空头持仓、回补天数 | `/v1/securities/{country}/{symbol}/short-interest` | 过去一年，由 NYSE/NASDAQ 报告。可用性有限——必须为每个账户单独启用；403 表示没有访问权限 |
| 借券利率、借券成本、可借股数 | `/v1/securities/{country}/{symbol}/borrow-rate` | 最新证券借贷费用率、返佣率、可借股数 |
| 每日卖空成交量 | `/v1/securities/{country}/{symbol}/short-volume` | 过去一年：卖空、卖空豁免、总成交量 |
| 交割失败 / FTD | `/v1/securities/{country}/{symbol}/fails-to-deliver` | 过去一年的 SEC FTD 记录（仅限美国） |
| 机构持有人 / 13F 持有人 | `/v1/securities/{country}/{symbol}/owners` | 当前基于 SEC 13F 数据得出的持有人 |
| 内部人士交易 / Form 4 | `/v1/securities/{country}/{symbol}/insiders` | 基于 SEC Form 3/4/5；`count` 参数 |
| 分析师目标价 | `/v1/securities/{country}/{symbol}/price-targets` | 最高值、最低值、平均值、中位数 |
| 分析师买入/持有/卖出评级 | `/v1/securities/{country}/{symbol}/analyst-ratings` | 汇总推荐 |
| 营收 / EPS 预测 | `/v1/securities/{country}/{symbol}/forecast` | 汇总分析师预估 |
| EOD 价格历史 | `/v1/securities/{country}/{symbol}/eod` | `period`：1m、3m、6m、1y（默认）、2y、3y、5y、all |
| 最新价格及衍生统计数据 | `/v1/securities/{country}/{symbol}/last-price` | 52 周最高价/最低价、WTD/MTD/YTD 变动；若回退到 EOD 收盘价，则会包含 `meta.warnings=["quote_stale"]` |
| 股息历史 | `/v1/securities/{country}/{symbol}/dividends` | |
| 盈利历史和超预期情况 | `/v1/securities/{country}/{symbol}/earnings` | |
| 即将公布的盈利（一只股票 / 全市场） | `/v1/securities/{country}/{symbol}/calendar/earnings` 或 `/v1/calendar/earnings` | `from`/`to` ISO 日期，默认为今天起 +7d，时间窗口最长为 90d |
| 即将派发的股息（一只股票 / 全市场） | `/v1/securities/{country}/{symbol}/calendar/dividends` 或 `/v1/calendar/dividends` | 时间窗口规则相同 |
| 特定基本面指标 | `/v1/securities/{country}/{symbol}/data-points/{key}` | 通过 `/v1/data-definitions?query=...` 查找键 |
| 排名最高/最低的股票 | `/v1/leaderboards`，然后调用 `/v1/leaderboards/{key}/entries` | 503 not_available 表示稍后重试；`meta.status="beta"` 表示占位数据 |
| 证券资料、上市信息、标识符历史 | `/v1/securities/{country}/{symbol}` | |
| 用户的关注列表 | `/v1/stock-lists`、`/v1/stock-lists/{id}/items` | 每个列表还支持 `/insiders`、`/owners`、`/filings` |
| 用户的提醒 | `/v1/alerts`、`/v1/alert-messages` | |
| 账户 / 权限 | `/v1/account` | |

完整的参数详情、国家/交易所发现端点及更多
curl 示例：请阅读 `references/api-reference.md`。

---

## 第 4 步：调用 API

```bash
curl -s -H "X-API-KEY: $FINTEL_API_KEY" \
  "https://api.fintel.io/v1/securities/us/AAPL/short-volume" | python3 -m json.tool
```

- 成功响应为 JSON；部分响应包含 `meta` 对象（警告、
  新鲜度、状态）。如果存在 `meta.warnings`，请向用户展示。
- 错误返回 `{"error": {"code": "...", "message": "..."}}`——例如
  `unauthorized`（密钥错误/缺失）、`403`（账户未启用该数据集，
  做空兴趣数据集常见）、`503 not_available`（排名
  服务不可用——请稍后重试，不要将其视为空数据）。
- 使用量按账户计量——请谨慎进行批量调用；不要轮询。

---

## 第 5 步：MCP 替代方案（可选）

对于 MCP 原生环境，也可以从官方服务器发现相同的工具
（工具名称如 `fintel.get_short_interest`、
`fintel.get_security_owners`——与 REST 功能一致，权限相同）：

```bash
claude mcp add --transport http fintel https://mcp.fintel.io/mcp --header "X-API-KEY: your_key_here"
```

如果可以访问 shell，优先通过 curl 使用 REST——除密钥外
无需其他设置。当用户明确要求使用 MCP 或 shell
访问受限时使用 MCP（注意：两者都无法在 Claude.ai 的沙箱中使用）。

---

## 第 6 步：回复用户

- 清晰地格式化数字：价格保留 2 位小数，百分比保留 1-2
  位小数，股数使用逗号或缩写（2.3M、1.1B）。
- 对于做空数据：提供背景信息——做空兴趣占流通股的百分比、回补
  天数、借股费率趋势方向。高借股费率 + 可借股数下降
  是典型的逼空条件；只展示数据，不作预测。
- 对于持股/内部人士数据：使用表格（持有人、股数、变动、日期）。
  在 Form 4 数据中区分买入、卖出和期权行权。
- 注明数据来源：“Fintel”，并在相关情况下提供数据集出处（SEC 13F、Form
  3/4/5、NYSE/NASDAQ 做空报告）。
- 切勿将数据转化为交易建议、目标价或逼空判断——只呈现事实，
  让用户自行得出结论。

---

## 参考文件

- `references/api-reference.md`——完整的 REST 端点参考：所有 GET
  端点及其参数、默认值、限制、错误语义、MCP 工具
  名称映射和 curl 示例。