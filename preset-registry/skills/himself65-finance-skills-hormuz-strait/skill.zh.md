---
name: hormuz-strait
description: >
  Check the current status of the Strait of Hormuz — shipping transit data, oil price impact,
  stranded vessels, insurance risk levels, diplomatic developments, and global trade impact.
  Use this skill whenever the user asks about the Strait of Hormuz, Hormuz chokepoint, Persian Gulf
  shipping risk, oil transit disruption, war risk premium in the Gulf, Middle East shipping routes,
  tanker traffic through Hormuz, oil supply chain risk, or geopolitical risk affecting energy markets.
  Triggers include: "Hormuz status", "Strait of Hormuz", "is Hormuz open", "shipping through the Gulf",
  "oil chokepoint", "Persian Gulf tanker traffic", "war risk premium", "Hormuz crisis",
  "energy supply chain risk", "oil transit disruption", "Middle East shipping",
  any mention of Hormuz or Persian Gulf in context of oil, shipping, or geopolitical risk.
---
# 霍尔木兹海峡监测 Skill

通过 [霍尔木兹海峡监测](https://hormuzstraitmonitor.com) 仪表板 API 获取霍尔木兹海峡的实时状态。涵盖船舶通行、油价、滞留船舶、保险风险、外交局势、全球贸易影响和危机时间线。

**此 Skill 为只读。** 它获取公开的仪表板数据，无需身份验证。

---

## 第 1 步：获取仪表板数据

使用 `curl` 获取仪表板 API：

```bash
curl -s https://hormuzstraitmonitor.com/api/dashboard
```

解析 JSON 响应。API 返回 `{ "success": true, "data": { ... }, "timestamp": "..." }`。

如果 `success` 为 `false` 或请求失败，请告知用户监测服务暂时不可用，并建议直接访问 https://hormuzstraitmonitor.com 查看。

---

## 第 2 步：确定用户需求

将用户的请求与相关数据部分进行匹配。如果用户要求提供总体状态更新，则展示所有部分。如果用户询问特定事项，则重点展示相关部分。

| 用户请求 | 数据部分 | 关键字段 |
|---|---|---|
| 总体状态 / “霍尔木兹海峡是否开放？” | `straitStatus` | `status`, `since`, `description` |
| 船舶交通 / 通行数量 | `shipCount` | `currentTransits`, `last24h`, `normalDaily`, `percentOfNormal` |
| 对油价的影响 | `oilPrice` | `brentPrice`, `change24h`, `changePercent24h`, `sparkline` |
| 滞留 / 受困船舶 | `strandedVessels` | `total`, `tankers`, `bulk`, `other`, `changeToday` |
| 保险 / 战争风险 | `insurance` | `level`, `warRiskPercent`, `normalPercent`, `multiplier` |
| 货物吞吐量 | `throughput` | `todayDWT`, `averageDWT`, `percentOfNormal`, `last7Days` |
| 外交局势 | `diplomacy` | `status`, `headline`, `parties`, `summary` |
| 全球贸易影响 | `globalTradeImpact` | `percentOfWorldOilAtRisk`, `estimatedDailyCostBillions`, `affectedRegions`, `lngImpact`, `alternativeRoutes`, `supplyChainImpact` |
| 危机时间线 / 事件 | `crisisTimeline` | `events[]`，包含 `date`, `type`, `title`, `description` |
| 油轮运费 / VLCC 运费 | `tankerRates` | `currentRate`, `preCrisisRate`, `changePercent`, `route`, `vesselType`, `trend`, `unit` |
| 最新新闻 | `news` | `title`, `source`, `url`, `publishedAt`, `description` |

---

## 第 3 步：展示数据

以清晰的格式展示结果，便于金融研究。根据用户的具体请求调整展示方式。

### 总体状态简报（默认）

当用户要求提供总体更新时，展示一份涵盖所有关键部分的简明简报：

1. **海峡状态** — 首先说明当前状态（例如 `"OPEN"`、`"RESTRICTED"`、`"CLOSED"`）、该状态已持续多长时间以及相关描述
2. **船舶交通** — 当前通行数量、过去 24 小时的通行数量以及相对于正常水平的百分比
3. **油价** — 布伦特原油价格及其 24 小时变动
4. **滞留船舶** — 按类型细分的船舶总数，以及今日变化
5. **保险风险** — 风险等级、战争风险保费百分比以及相对于正常水平的倍数
6. **货物吞吐量** — 今日 DWT 与平均值对比，以及相对于正常水平的百分比
7. **外交状态** — 当前状态、标题和简要摘要
8. **全球贸易影响** — 面临风险的全球石油占比、预计每日成本以及受影响最大的地区
9. **油轮运费** — 基准航线上当前的 VLCC 运费与危机前基准水平对比，并注明趋势方向

### 格式指南

- 对结构化数据（船舶数量、受影响地区、替代路线）使用表格
- 突出显示异常值——如果 `percentOfNormal` 低于 80% 或高于 120%，需特别指出
- 对于 `oilPrice.sparkline`，描述趋势（上涨、下跌、稳定），而不是列出原始数字
- 对于 `throughput.last7Days`，描述趋势方向
- 显示 `lastUpdated` 时间戳，以便用户了解数据的新鲜度
- 对于新闻条目，包含来源和链接
- 对于危机时间线事件，按时间顺序呈现，并标注事件类型

### 风险评估

根据数据提供简要的风险评估：

返回值均为大写。

| 保险等级 | 解读 |
|---|---|
| `NORMAL` | 风险未升高——航运正常运行 |
| `ELEVATED` | 存在一定的中断隐忧——需密切监控 |
| `HIGH` | 重大风险——正在发生中断或存在可信威胁 |
| `CRITICAL` | 严重中断——对全球石油供应产生重大影响 |
| `EXTREME` | 实际关闭——战争险保费达到数十年来的最高水平，大多数商业航运已停止 |

如果海峡状态并非完全开放，请突出说明：
- 对全球贸易的预计每日成本
- 哪些地区受影响最严重，以及这些地区的石油依赖程度
- 可用的替代路线，以及额外的运输天数和成本
- LNG 受到的影响（如适用）
- SPR（战略石油储备）可维持的天数

---

## 步骤 4：回复用户

- 首先说明最重要的信息：海峡状态和任何正在发生的中断
- 包含数据新鲜度信息（`lastUpdated` 时间戳）
- 如果情况达到风险升高或更严重的级别，主动提供全球贸易影响摘要
- 对于常规的“一切正常”状态，回复应保持简洁；对于正在发生的事件，则提供更详细的信息
- 添加免责声明：数据来源于 Hormuz Strait Monitor，可能存在延迟

---

## 参考文件

- `references/api_schema.md` — 完整的 API 响应模式，包含字段说明和数据类型

需要准确的字段名或数据类型详细信息时，请阅读该参考文件。