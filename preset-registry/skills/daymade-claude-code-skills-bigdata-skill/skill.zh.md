---
name: bigdata-skill
description: >-
  Pull Bigdata.com (RavenPack) financial and news data via the official
  `bigdata-client` SDK and `/v1/*` REST endpoints — structured financials,
  prices, analyst estimates, daily entity-sentiment series, annotated chunk
  search, screener — when the Bigdata MCP returns only pre-synthesized tearsheets
  but you need the machine-readable substrate. Use when the user mentions
  Bigdata.com, RavenPack, a `bd_v2_` key, the bigdata MCP, rp_entity_id,
  chunk/query_unit cost, or wants structured financials, fundamentals, prices,
  sentiment, or annotated news.
---
# Bigdata.com SDK + REST 工具包

获取 Bigdata.com MCP 服务器未提供的结构化底层数据。MCP
会返回清晰的文本和预先综合的概览报告，但其搜索工具
提供的数据块不包含每个数据块的情绪或实体范围，其概览报告
提供的则是聚合值，而不是可用于构建数据管道的财政期间时间序列、全市场筛选器或
逐字段 JSON。官方 `bigdata-client` SDK 加上一个基于
*相同后端、相同 JWT* 的轻量级 REST 直通层，即可访问包含这些数据的官方
`/v1/*` 端点。此技能打包了一个恰好实现上述功能的工具包——
已经完成调试，也已加入成本保护——让你不必再次付出
探索成本。

## 此技能解决的核心问题（请先阅读本节）

Bigdata MCP 服务器会用一段易读的文本或一份预先综合的概览报告
回答“NVIDIA 的市场情绪如何？”——对于一轮聊天而言确实很有用。
但一旦你需要可用于构建数据管道的**机器可读底层数据**，
MCP 就无法提供：

- 它的**搜索**工具仅返回包含文本和相关性的数据块——**不含每个数据块的
  情绪数值，也不含实体字符范围**；
- 它的**概览报告**提供的是聚合值（单一情绪分数、预期摘要）
  ——**而不是**可供计算的财政期间时间序列、全市场筛选器或
  逐字段 JSON。

解决方法是一种通用模式，而不是 Bigdata 特有的技巧：

> **当 MCP 数据源只返回综合生成的输出，但你需要其底层的
> 结构化字段时，请改用供应商的 SDK 或 REST。** MCP 针对
> 聊天交互进行了优化，而不是数据管道。

关键在于，对于 Bigdata，这些结构化字段来自**官方、公开记录的
REST 端点**（`docs.bigdata.com/api-reference/...`），并非隐藏的
后端——而且 Bigdata 正在**逐步淘汰 SDK（生命周期于 2026-12-31 结束），转而采用此
REST API**，因此这里的 REST 层是面向未来的兼容路径，而不是权宜之计。
SDK（`bigdata_client.Bigdata`）涵盖搜索和知识图谱；**`bd._api.http`**
则可以访问 SDK 从未封装的所有 `/v1/*` 端点。随附的
`bigdata_toolkit` 将二者封装在一个 `BigdataClient` 之后。

## 何时使用此技能

在任何语言中出现以下任一情况时触发：

- 用户正在使用 **Bigdata.com / RavenPack**，且 MCP 结果显得信息不足——
  “情绪分数在哪里？”、“我需要实体级数据”、“日历在哪里？”。
- 他们需要某个股票代码的**前瞻性/结构化**财务数据：分析师
  预期、财报或事件日历、盈利意外、分析师评级、
  目标价、公司筛选器/全市场范围。
- 他们需要带有数值情绪和实体范围的**带注释新闻数据块**，或者
  情绪时间序列/共同提及图谱。
- 他们提到了 **`bd_v2_` API 密钥**、`rp_entity_id`、`query_unit`/数据块
  成本、`bigdata-client`，或者“bigdata MCP 不够用”。
- 他们正在构建**投资研究数据集**，需要一个可复用且
  具备成本意识的数据拉取层，而不是一次性的 MCP 调用。

## 设置（一次性）

**1 — API 密钥（绝不要硬编码）。** 如果缺少密钥，客户端会立即失败：

```bash
export BIGDATA_API_KEY=bd_v2_xxxxxxxx
```

**2 — 使用官方 SDK 的隔离 Python 环境。** 随附的工具包会导入
`bigdata_client`；只需安装一次：

```bash
uv venv .venv --python 3.12
uv pip install --python .venv/bin/python bigdata-client
# Behind a slow/blocked PyPI (e.g. mainland China) add a mirror, and unset any
# outbound proxy for the install step so uv reaches the index directly:
#   --index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

**3 — 出站代理（仅当你的网络需要通过代理访问
`api.bigdata.com` 时）。** 有两种等效方式——官方 SDK 均支持：使用环境变量，或在代码中使用 `BigdataClient(proxy=...)`。环境变量最简单：

```bash
export HTTPS_PROXY=http://<host>:<port>     # plus WSS_PROXY for chat/WebSocket
```

如果代理执行 TLS 拦截（使用自签名 CA），并且你遇到 SSL 握手错误，官方解决方案是 `BigdataClient(verify_ssl="<proxy-CA>.pem")`——而不是盲目重试。

**4 — 让随附的软件包可导入**，方法是将此技能的 `scripts/`
添加到 `PYTHONPATH`（或使用 `sys.path.insert(0, "<this-skill>/scripts")`）。

**对整个调用链进行冒烟测试**（实体解析和配额查询免费；`--with-search`
会增加一次约消耗 1 个 query_unit 的分块搜索）：

```bash
BIGDATA_API_KEY=bd_v2_xxx PYTHONPATH=scripts .venv/bin/python scripts/probe_example.py
```

## 快速开始

```python
import sys
sys.path.insert(0, "<this-skill>/scripts")          # so `import bigdata_toolkit` resolves
from bigdata_toolkit import (
    BigdataClient, EntityResolver, AnnotatedSearcher,
    StructuredDataREST, CostTracker, CostModel, rc,   # rc = SSL-retry wrapper
)

c  = BigdataClient()                                  # SDK + REST escape hatch, one object
er = EntityResolver(c)
nvda = rc(lambda: er.resolve_id("NVIDIA", country="US"))   # -> 'E09E2B'  (rp_entity_id is the gateway key)

# --- Structured financials the MCP does NOT expose (REST escape hatch) ---
rest = StructuredDataREST(c)
est  = rc(lambda: rest.analyst_estimates(nvda, period="quarter", limit=5))  # forward consensus
surp = rc(lambda: rest.latest_surprise(nvda))                               # last EPS/revenue surprise
cal  = rc(lambda: rest.events_calendar(nvda, categories=["earnings-call"],
                                       start_date="2026-06-01", end_date="2026-12-31"))

# --- Annotated chunks the MCP STRIPS: sentiment + entity spans (cost-guarded) ---
s    = AnnotatedSearcher(c)
docs = rc(lambda: s.search_entity(nvda, keyword="data center", chunk_limit=10))
# each chunk dict: {"sentiment": float, "entities": [{"key": rp_id, "start", "end"}], "text", ...}

# --- Always know your spend (chunk-billed; see Cost discipline) ---
ct = CostTracker(c); ct.snapshot()
# ... run a batch ...
print(ct.delta())     # {'delta_chunks':..., 'delta_query_units':..., 'usd_fast':...}
```

将**每个**网络调用都包装在 `rc(lambda: ...)` 中——首次握手时经常会出现 `SSL:
UNEXPECTED_EOF`，而 SDK 的内部重试机制无法处理这种情况。

## 路由——应使用哪项能力回答问题

| 用户需求 | 使用 | 模块 |
|---|---|---|
| 公司名称 / ISIN / CUSIP / SEDOL → `rp_entity_id` | `EntityResolver.resolve_id` / `.resolve_by_isin` | `kg.py`（SDK） |
| 前瞻性分析师一致预期（按财务期间划分的营收/EPS） | `StructuredDataREST.analyst_estimates` | `rest_ext.py` |
| 最新盈利超预期情况（实际值与预期值对比） | `.latest_surprise` | `rest_ext.py` |
| 即将公布的财报 / 事件日历（单家公司或整个市场） | `.events_calendar` | `rest_ext.py` |
| 分析师评级 / 目标价一致预期 | `.analyst_ratings` / `.price_target` | `rest_ext.py` |
| 完整财务报表（利润表 / 资产负债表 / 现金流量表，多年度） | `.income_statement` / `.balance_sheet` / `.cash_flow_statement` | `rest_ext.py` |
| TTM 估值指标与比率（EV/EBITDA、ROE、市盈率、利润率） | `.key_metrics_ttm` / `.company_ratios_ttm` | `rest_ext.py` |
| 公司概况（CEO、行业、员工人数、IPO 日期） | `.company_profile` | `rest_ext.py` |
| 每日 OHLC 价格 / 股息历史 | `.daily_prices` / `.dividends` | `rest_ext.py` |
| 按地区 / 产品分部划分的营收 | `.revenue_geographic_segments` / `.revenue_product_segments` | `rest_ext.py` |
| 每日实体情绪时间序列（不要自行从数据块聚合！） | `.entity_sentiment` | `rest_ext.py` |
| 共现图谱（供应链 / 竞争对手 / 客户 — ⚠️ 按数据块计费） | `.connected_entities` | `rest_ext.py` |
| 按市值 / 行业 / 国家构建股票池 | `.company_screener` | `rest_ext.py` |
| 带有情绪和实体跨度的新闻/申报文件/电话会议记录数据块 | `AnnotatedSearcher.search_entity` | `search.py`（SDK） |
| 以低 50% 的成本批量执行多项搜索（投资组合历史数据回填） | `BatchSearch`（创建→上传→轮询→下载） | `rest_ext.py` |
| 在回填前跟踪 / 预测配额支出 | `CostTracker` / `CostModel` | `cost.py` |
| 调用工具包尚未封装的端点 | `client.http.post("v1/<resource>/query", body)` | `client.py` |

> `income/balance/cash-flow/daily-prices/dividends/revenue-segments` 返回
> `{fields, values}` — 使用 `fields_values_to_records()` 将其封装为
> `[{field: value}]`。`*_ttm` / `company_profile` 端点返回的已经是扁平结构。
> 除 `connected_entities` 和 `AnnotatedSearcher`（按数据块计费）之外，
> 上述所有结构化端点均为**免费**（0 个数据块）。

## 数据的两个侧面（不要说“Bigdata 不适用于中国 / A 股”）

这种区分是最重要且不明显的结论——请准确表述：

| 侧面 | 路径 | A 股 / 中文结论 |
|---|---|---|
| **结构化财务数据**（预期、日历、超预期情况、评级、目标价、筛选器、**财务数据、价格、股息、营收分部、每日实体情绪**） | REST（`rest_ext.py`） | **可用**——通过使用**英文名称或 ISIN**（而非中文名称）解析得到的 `rp_entity_id` 访问。数据是最新的。存在少量数据缺口（某些 A 股目标价结果会返回实体，但不含数值目标价）。每日 `entity_sentiment` 序列位于**此处**，适用于任何可解析的实体——它**不是**下述死路。 |
| **非结构化中文 NLP**（中文新闻实体检测、每个数据块的中文情绪） | SDK 搜索（`search.py`） | **死路**——这是数据源层面的缺口，而不是 SDK 错误：中文实体检测率约为 0，每个数据块的 CJK 情绪是从文档级继承的值，并且 `language` 会将中文申报文件错误标记为英文。对于中文*数据块*内容，请将 Bigdata 与中国本土数据源搭配使用；Bigdata 则用于结构化数据侧（包括聚合的 `entity_sentiment`）+ ISIN/KG 交叉映射 + 英文数据块情绪。 |

## 成本控制

`1 query_unit = 10 chunks`（官方说明）。**只有分块搜索会计费**——结构化的
`/v1/*` 端点（预估、财务数据、价格、日历、意外数据、评级、情绪时间序列、筛选器……）均为**免费**（0 个分块，
已通过契约测试）。`connected_entities`（共同提及）和 `AnnotatedSearcher`
**会**按分块计费。

需要为分块付费时，可使用以下三种手段：

1. **使用 `ChunkLimit`，绝不要使用裸 `int`。** `Search.run(int)` 设置的是*文档*数量限制，
   并按完整的分块页面计费；`ChunkLimit(n)` 则按分块计费。
   `AnnotatedSearcher.search` 会强制为你使用 `ChunkLimit`。（我们曾观察到大约
   52 倍的差距——**这只是单次测量的数据点，并非官方文档中的说明**；请仅将具体倍数视为参考。无论如何，
   “使用 `ChunkLimit`”这条规则始终适用，因为 `max_chunks` 是官方计费单位。）
2. **重排序仅对*返回的*分块计费**（官方说明）——传入
   `rerank_threshold`，既可扩大召回范围，又只需为高相关性结果付费。
3. **批量搜索便宜 50%**（`$0.0075` 对比 `$0.015` / qu）——对于大型多查询回填任务，请使用
   `BatchSearch`。

在运行任务*之前*，使用 `CostModel` 拒绝超出预算的任务，并使用
`CostTracker.snapshot()` / `delta()` 测量实际支出。完整的成本核算说明 →
`references/cost_accounting.md`。

## 已知陷阱（均已解决——无需重复调试）

以下每个问题都曾耗费实际调试时间，并且已在工具包中修复或添加防护。完整的复现步骤和修复方案见
**`references/known_pitfalls.md`**：

1. **首次握手时出现 `SSL: UNEXPECTED_EOF`** → 使用 `rc()` 包装调用；SDK 的
   urllib3 重试机制只处理 HTTP 状态，不处理 SSL EOF。
2. **`All(entity, Keyword(kw))` 会引发 `TypeError`** → 使用 `&`
   运算符组合（`entity & Keyword(kw)`）；`All` 只接受单个可迭代对象。（已在
   `AnnotatedSearcher.entity_query` 中修复。）
3. **文档数量限制导致的 52 倍计费陷阱** → 始终使用 `ChunkLimit`，绝不要使用裸 `int`。
4. **循环中的闭包捕获问题** → 绑定循环变量：`rc(lambda q=q, dr=dr: ...)`。
5. **`analyst_estimates(period="quarter")` 在 `limit≈20` 以上时会返回 400。**
6. **`company_screener` 的过滤条件必须嵌套在 `"filters"` 下**——使用扁平的顶层
   键不会返回 400，而是会被静默丢弃 → 得到未筛选的数据全集。
7. **`Document.reporting_period` 始终为 `None`**（SDK 模型丢弃了 REST 原始数据中
   存在的一个字段）→ 使用 `fetch_reporting_period_raw`。

## 此技能不会执行的操作

- **绝不硬编码 API 密钥。** `BigdataClient` 会读取 `BIGDATA_API_KEY`，并在
  该变量不存在时立即失败——不提供明文回退机制（这正是密钥扫描器会捕获的模式）。
- **只读取——绝不写入或上传。** 每种方法都是只读
  查询（无论如何，`uploads` 在 API 密钥模式下都会引发 `NotImplementedError`），因此该
  工具包无法修改你的账户，也无法向任何位置推送数据。
- **绝不虚构端点或模式。** 此处的每个签名都已通过运行时
  L4 验证，或标记为 L3（已由文档确认，但尚未运行）；请参阅
  `references/verified_api_signatures.md`。对于新端点，请通过
  `docs.bigdata.com/llms.txt` 确认路径，而不要猜测。

## 文件布局

```
bigdata-skill/
├── SKILL.md                       # this file — routing + setup + quickstart
├── scripts/
│   ├── bigdata_toolkit/           # the verified, cost-guarded package
│   │   ├── client.py              # BigdataClient: SDK (.bd) + REST escape hatch (.http/.conn)
│   │   ├── kg.py                  # EntityResolver: name/ISIN/CUSIP/SEDOL → rp_entity_id
│   │   ├── search.py              # AnnotatedSearcher: chunks + sentiment + entity spans (SDK)
│   │   ├── rest_ext.py            # StructuredDataREST (estimates/financials/prices/dividends/sentiment/co-mentions/screener) + BatchSearch + fields_values_to_records — official REST
│   │   ├── cost.py                # CostTracker + CostModel: chunk billing + budget veto
│   │   └── retry.py               # rc(): SSL/transient-error retry passthrough
│   └── probe_example.py           # runnable end-to-end smoke test
└── references/
    ├── escape_hatch_architecture.md  # WHY the MCP is lossy; bd._api.http mechanism; adding endpoints
    ├── verified_api_signatures.md    # L4/L3-verified signatures + the two data faces, with evidence
    ├── cost_accounting.md            # chunk billing, the 52x trap, CostModel/CostTracker, budgeting
    └── known_pitfalls.md             # every pitfall above, with reproduction + fix
```

## 参考资料

| 当你需要……时阅读 | 文件 |
|---|---|
| 了解 MCP *为何*无法满足需求、REST 逃生通道如何运作（以及如何封装新的 `/v1/*` 端点） | `references/escape_hatch_architecture.md` |
| 查找经过验证的确切方法签名及其验证级别 | `references/verified_api_signatures.md` |
| 为历史数据回填制定预算，或调试意外的配额消耗 | `references/cost_accounting.md` |
| 诊断拉取数据时遇到的错误 | `references/known_pitfalls.md` |