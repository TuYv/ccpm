---
name: funda-data
description: >
  Query Funda AI financial data via two surfaces: the MCP server at
  https://funda.ai/api/mcp for analyst-grade research synthesis (DCF,
  comps, earnings previews/recaps, sector deep-dives, SEC filings,
  transcripts, supply-chain mapping, ownership flow, macro framing) via
  the agent_chat tool — OR the REST API at https://api.funda.ai/v1 with
  FUNDA_API_KEY for raw data (real-time quotes, intraday candles, EOD
  prices, financial statements, options chains/greeks/GEX, supply-chain
  KG, social sentiment, news, calendars, FRED, ESG, congressional
  trades, AI hiring signals). Triggers: "funda", "funda.ai", real-time
  quote, stock price, intraday, balance sheet, income statement, options
  chain, DCF, comps, earnings preview/recap, analyst estimates,
  10-K/10-Q/8-K, transcript, ownership flow, gamma exposure, supply
  chain, sector deep-dive, congressional trades, FRED. Prefer MCP for
  synthesis/analysis questions; use REST for raw structured data the MCP
  declines.
---
# Funda AI 技能

Funda AI 提供两个由相同数据支持、互为补充的使用界面：

| 界面 | 最适合 | 身份验证 | 输出 |
|---|---|---|---|
| **MCP**：位于 `https://funda.ai/api/mcp` 的 `agent_chat` | 研究、分析、综合 | OAuth（通过 `claude mcp add` 自动完成） | 带免责声明的综合文本 |
| **REST**：位于 `https://api.funda.ai` 的 `/v1/*` | 原始结构化数据 | `FUNDA_API_KEY` Bearer | JSON |

两者都需要有效的 [Funda AI](https://funda.ai) 订阅。

---

## 第 1 步：决定使用哪个界面

| 用户需求 | 界面 |
|---|---|
| DCF / 可比公司分析演练、行业观点、电话会议记录综合、公司概览 | MCP |
| 带判断的财报前瞻/回顾、超预期与不及预期的分解、叙事框架 | MCP |
| 实时或日内报价、日终价格历史 | REST |
| 原始期权链快照、希腊字母指标、GEX 时间序列 | REST |
| 财务报表中的特定项目（单个数字、JSON） | REST |
| 以行形式提供的 13F 申报、内部人士交易、国会议员交易 | REST |
| 带结构化情绪分析/事件时间线的新闻（JSON） | REST |
| 批量数据集下载 | REST |
| AI 公司招聘信号（OpenAI、Anthropic、Google、xAI） | REST |

对于含义不明确的研究类问题，**默认使用 MCP**。当用户需要机器可读的结构化数据时，**使用 REST**；或者当 MCP 拒绝请求时（实时价格、原始报价），也使用 REST。

MCP 还会拒绝买入/卖出建议、目标价、个性化投资组合建议、税务/法律建议和交易执行。这些请求不属于任何一个界面的服务范围——应礼貌拒绝，不要转而尝试 REST 以期获得不同答案。

---

## 第 2 步：MCP 流程（研究）

### 2a. 验证 MCP 是否已连接

```
!`claude mcp list 2>/dev/null | grep -iE "^funda:" || echo "FUNDA_MCP_NOT_CONNECTED"`
```

- 出现以 `funda:` 开头的行 → 已注册。该工具可通过 `mcp__funda__agent_chat` 调用。继续。
- 出现 `FUNDA_MCP_NOT_CONNECTED` → 请用户安装：
  ```bash
  claude mcp add --transport http funda https://funda.ai/api/mcp
  ```
  浏览器会打开一个标签页以进行 OAuth 授权（1 小时有效的令牌 + 30 天有效的刷新令牌，自动管理）。在工具完成注册之前，可能需要重启 Claude Code 会话。

### 2b. 组织问题

`agent_chat` 的每次调用都是一次全新的研究轮次，**不会保留跨调用记忆**——应将股票代码、时间范围和假设直接写入问题文本中。

| 用户需求 | 问题形式 |
|---|---|
| 财报前瞻 | “预览 MSFT 周四发布的 Q3 财报——各业务板块趋势、市场共识在哪些方面过于激进或保守，以及超预期/不及预期的规律。” |
| 财报回顾 | “详细分析 NVDA Q2：各业务板块超预期/不及预期情况、业绩指引与市场共识的对比，以及电话会议问答中有关数据中心需求的内容。” |
| 行业深度分析 | “总结 2026 年超大规模云服务商的资本开支周期——按公司划分的支出层级、供应商敞口、对毛利率的影响。” |
| 供应链 | “梳理 TSMC 的客户集中度和 N2 量产爬坡风险——按收入列出前三大敞口。” |
| 申报文件摘要 | “对比 PLTR 最新 10-K 与上一年度文件中新增加的风险因素。” |
| DCF | “基于数据中心业务增长 25%、终值利润率 10%、WACC 9% 的假设，演示 NVDA 的 DCF 分析——给出敏感性分析表。” |
| 宏观 | “美国目前处于 Dalio 长期债务周期的哪个阶段，这对久期配置意味着什么？” |
| 持股情况 | “在最新的 13F 申报中，CRWD 的机构持股是否发生了变化——净买入方与净卖出方分别如何？” |

如果用户只提供了股票代码，请在调用前先提出一个澄清问题，以确定本轮请求的范围
（业绩前瞻？业绩回顾？入门介绍？DCF？）——模糊的问题会浪费一次调用机会，
并且只会得到模糊的答案。

如果用户是在跟进之前的 Funda 回复，请在新问题中引用相关段落；
该智能体不记得之前的调用内容。

如需查看每个主题的更多问题示例，请参阅 `references/research-topics.md`。

### 2c. 调用工具

```
mcp__funda__agent_chat(question: "<full research question>")
```

典型运行时间为 15–60 秒；服务器会在整个过程中持续流式发送进度通知，
因此客户端不会超时。

响应结构：
- `content[0].text` — 答案以 `[Funda research output — fundamental analysis, informational only…]` 为前缀。请保留此前缀。
- `_meta["funda.io/conversation_id"]` — UUID。应用内历史记录页面为 `https://funda.ai/agent-chat?c=<id>`（`/agent-chat` 路由会重定向到 `/agent-chat-v2?c=<id>`）。
- `_meta["funda.io/timed_out"]` — 如果智能体达到了运行预算，则为 `true`。答案并不完整；可提议缩小范围后重试。

如果调用返回 403 `subscription_required`，说明 MCP 已注册，
但该账户尚未订阅——请引导用户前往 https://funda.ai
激活。

每次调用都会消耗一次研究机会。如果第一次的答案合理，不要仅仅换一种
问题表述就试探性地再次调用。

---

## 第 3 步：REST 流程（原始数据）

### 3a. 解析 FUNDA_API_KEY

该 Skill 按以下顺序解析 `FUNDA_API_KEY`：
1. `FUNDA_API_KEY` 环境变量
2. 当前目录下 `.env` 中的 `FUNDA_API_KEY`
3. git 仓库根目录下 `.env` 中的 `FUNDA_API_KEY`（这样工作树就能继承主检出目录中的密钥）

```
!`if [ -n "$FUNDA_API_KEY" ]; then echo "KEY_FROM_ENV_VAR"; elif [ -f .env ] && grep -qE "^FUNDA_API_KEY=" .env; then echo "KEY_FROM_LOCAL_DOTENV:$(pwd)/.env"; else GIT_COMMON=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null); if [ -n "$GIT_COMMON" ]; then ROOT=$(dirname "$GIT_COMMON"); if [ -f "$ROOT/.env" ] && grep -qE "^FUNDA_API_KEY=" "$ROOT/.env"; then echo "KEY_FROM_ROOT_DOTENV:$ROOT/.env"; else echo "KEY_NOT_SET"; fi; else echo "KEY_NOT_SET"; fi; fi`
```

然后根据结果执行相应操作：

- `KEY_FROM_ENV_VAR` — 在 curl 调用中直接使用 `$FUNDA_API_KEY`。
- `KEY_FROM_LOCAL_DOTENV:<path>` / `KEY_FROM_ROOT_DOTENV:<path>` — 在调用前加载一次：
  ```bash
  export FUNDA_API_KEY=$(grep -E "^FUNDA_API_KEY=" <path> | head -1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//')
  ```
- `KEY_NOT_SET` — 向用户索取密钥。用户可以执行 `export FUNDA_API_KEY="..."`，也可以将 `FUNDA_API_KEY=...` 添加到仓库根目录的 `.env` 中（对于工作树，推荐使用后一种方式）。

### 3b. 查找正确的端点

将用户的请求与某个类别匹配，并阅读对应的
参考文件，以了解完整参数和响应架构。

| 类别 | 端点系列 | 参考文件 |
|---|---|---|
| 实时／批量／盘后报价 | `/v1/quotes?type=...` | `references/market-data.md` |
| 历史日终数据、日内 K 线、技术指标 | `/v1/stock-price`, `/v1/charts` | `references/market-data.md` |
| 大宗商品／外汇／加密货币报价 | `/v1/quotes?type=commodity-quotes` | `references/market-data.md` |
| 利润表／资产负债表／现金流量表／指标／比率 | `/v1/financial-statements` | `references/fundamentals.md` |
| 公司简介、同行公司、流通股、搜索、筛选器、列表 | `/v1/company-profile`, `/v1/company-details`, `/v1/search`, `/v1/companies` | `references/fundamentals.md` |
| 分析师预期、目标价、评级、DCF、综合评级 | `/v1/analyst?type=...` | `references/fundamentals.md` |
| 期权链、希腊字母指标、GEX、IV、最大痛点、资金流、筛选器 | `/v1/options/...` | `references/options.md` |
| 供应链知识图谱：供应商、客户、竞争对手、合作伙伴 | `/v1/supply-chain/...` | `references/supply-chain.md` |
| Twitter、Reddit、Polymarket、政府交易、所有权 | `/v1/twitter-posts`, `/v1/reddit-posts`, `/v1/polymarket/...`, `/v1/government-trading`, `/v1/ownership` | `references/alternative-data.md` |
| AI 增强新闻＋聚合情绪＋事件时间线 | `/v1/news/ticker`, `/v1/news/timeline`, `/v1/news/sentiment` | `references/news-enriched.md` |
| SEC 申报文件、财报／播客文字稿、研究报告 | `/v1/sec-filings`, `/v1/transcripts`, `/v1/investment-research-reports` | `references/filings-transcripts.md` |
| 财报／股息／IPO／拆股／经济日历 | `/v1/calendar?type=...` | `references/calendar-economics.md` |
| 美国国债利率、GDP/CPI 指标、FRED、风险溢价 | `/v1/economics`, `/v1/fred` | `references/calendar-economics.md` |
| 股票新闻、涨幅榜／跌幅榜、ETF 持仓、ESG、COT、批量数据、市场交易时间 | `/v1/news`, `/v1/market-performance`, `/v1/funds`, `/v1/esg`, `/v1/cot-report`, `/v1/bulk`, `/v1/market-hours` | `references/other-data.md` |
| AI 公司招聘信号（OpenAI、Anthropic、Google、xAI、Mercor、SurgeAI） | `/v1/recruit-...` | `references/recruit.md` |
| 通过 Bedrock 代理 Claude API | `/v1/claude/v1/messages` | `references/claude-proxy.md` |

### 3c. 调用端点

```bash
curl -s -H "Authorization: Bearer $FUNDA_API_KEY" \
  "https://api.funda.ai/v1/<endpoint>?<params>" | python3 -m json.tool
```

所有响应的格式均为 `{"code": "0", "message": "", "data": ...}`。非零
`code` 表示发生错误——请查看 `message`。

列表端点使用分页：`{"items": [...], "page": 0, "page_size": 20, "next_page": 1, "total_count": N}`。页码从 0 开始；数据全部获取完毕时，`next_page` 为 `-1`。

对于宽泛的股票代码概览（“介绍一下 AAPL”），请组合调用几个 REST
端点：使用 `/v1/company-profile` 获取行业/CEO/市值/价格，外加 `/v1/financial-statements?type=key-metrics-ttm` 和 `/v1/analyst?type=price-target-summary`。

---

## 第 4 步：回复用户

- 对于 MCP 综合分析：使用结构化形式呈现（表格、项目符号、标题），不要直接倾倒原始数据。保留 Funda 免责声明；绝不要将分析重新包装成投资建议、目标价或交易信号。
- 对于 MCP 响应，请引用 `https://funda.ai/agent-chat?c={conversation_id}`，以便用户查看智能体的完整时间线。
- 对于 REST 响应，请清晰地格式化数字（价格保留 2 位小数，比率保留 2-4 位小数，大数使用千位分隔符或 `$2.8T` 之类的缩写）。对比较数据使用表格；总结趋势，而不是直接倾倒时间序列。
- 对于 DCF / 估值工作，请呈现 Funda 使用的假设，以便用户进行调整。
- 注明来源：“Funda AI”（无论使用 MCP 还是 REST）。
- 绝不要提供交易建议——只呈现数据，让用户自行得出结论。

---

## 参考文件

**MCP 路径：**
- `references/research-topics.md` — 分类整理的示例问题，以及构建 `agent_chat` 查询的技巧。

**REST 路径：**
- `references/market-data.md` — 报价、历史价格、图表、技术指标
- `references/fundamentals.md` — 财务报表、公司简介/详情、搜索/筛选器、分析师、公司列表
- `references/options.md` — 期权链、希腊字母指标、GEX、资金流、IV、筛选器、合约级数据
- `references/supply-chain.md` — 供应链知识图谱、关系、图遍历
- `references/alternative-data.md` — Twitter、Reddit、Polymarket、政府官员交易、持股情况
- `references/news-enriched.md` — AI 增强新闻、事件时间线、聚合情绪
- `references/filings-transcripts.md` — SEC 申报文件、财报电话会议/播客文字稿、研究报告
- `references/calendar-economics.md` — 日历、经济数据、美国国债、FRED
- `references/other-data.md` — 新闻、市场表现、基金、ESG、COT、批量数据、市场交易时间
- `references/recruit.md` — AI 公司招聘信号、职位描述分类、产品集群、发布概率
- `references/claude-proxy.md` — 通过 Bedrock 使用 Claude API 代理