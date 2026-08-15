---
name: asc-metrics
description: When the user wants to analyze their own app's actual performance data from App Store Connect — real downloads, revenue, IAP, subscriptions, trials, or country breakdowns synced via Appeeky Connect. Use when the user asks about "my downloads", "my revenue", "how is my app performing", "ASC data", "sales and trends", "my subscription numbers", "App Store Connect metrics", or wants to compare periods or top markets. For third-party app estimates, see app-analytics. For subscription analytics depth, see monetization-strategy.
metadata:
  version: 1.0.0
---
# ASC 指标

你将分析同步到 Appeeky 中的用户**官方 App Store Connect 数据**——精确的下载量、收入、IAP、订阅和试用数据。这些是第一方数据，并非估算值。

## 前置条件

- 拥有已连接 ASC 的 Appeeky 账户（设置 → 集成 → App Store Connect）
- Indie 套餐或更高级套餐（每次请求消耗 2 个积分）
- 数据每晚同步；最多可提供 90 天的历史数据

如果尚未连接 ASC，请提示用户前往 [appeeky.com/settings](https://appeeky.com) 进行连接，然后返回。

## 初步评估

1. 检查 `app-marketing-context.md`——阅读该文件以了解应用背景
2. 询问：**你想分析什么？**（下载量、收入、订阅、国家/地区明细、趋势对比）
3. 询问：**哪个时间段？**（默认：过去 30 天）
4. 询问：**特定应用还是所有应用？**

## 获取数据

### 第 1 步——列出可用应用

```bash
GET /v1/connect/metrics/apps
```

如果尚不明确，请将用户的应用与某个 `app_apple_id` 匹配。

### 第 2 步——获取概览（应用组合）

```bash
GET /v1/connect/metrics?from=YYYY-MM-DD&to=YYYY-MM-DD
```

### 第 3 步——获取应用详情（单个应用）

```bash
GET /v1/connect/metrics/apps/:appId?from=YYYY-MM-DD&to=YYYY-MM-DD
```

响应包含：`daily[]`、`countries[]`、`totals`。

完整 API 参考见：[appeeky-connect.md](../../tools/integrations/appeeky-connect.md)

## 分析框架

### 环比对比

获取两个长度相同的时间窗口并进行比较：

| 指标 | 上一周期 | 当前周期 | 变化 |
|--------|-------------|----------------|--------|
| 下载量 | [N] | [N] | [+/-X%] |
| 收入 | $[N] | $[N] | [+/-X%] |
| 订阅量 | [N] | [N] | [+/-X%] |
| 试用量 | [N] | [N] | [+/-X%] |
| 试用 → 订阅转化率 | [X]% | [X]% | [+/-X pp] |

**需要关注的情况：**
- 下载量上升但收入持平 → 定价或付费墙存在问题
- 试用量上升但转化率持平 → 付费墙或新手引导存在问题
- 收入上升但下载量持平 → 变现能力得到良好改善

### 每日趋势分析

从 `daily[]` 中识别：
- **峰值**——是否由某项功能、更新或媒体报道触发？
- **下滑**——与应用更新、季节性因素或算法变化进行关联分析
- **趋势方向**——7 日移动平均值与此前 7 日对比

### 国家/地区明细

按下载量和收入对 `countries[]` 进行排序：
1. **下载量排名前 5**——你是否正在为这些市场投入 ASO？
2. **收入排名前 5**——ARPD（平均每次下载收入）越高，越应优先开展 ASO
3. **下载量高、收入低**——变现能力较弱的市场
4. **下载量低、收入高**——尚未充分开发的高价值市场（进行本地化）

### 收入质量检查

根据数据计算：

| 指标 | 公式 | 基准 |
|--------|---------|-----------|
| ARPD | 收入 / 下载量 | > $0.05 为良好；> $0.20 为优秀 |
| 试用率 | 试用量 / 下载量 | > 20% 表示付费墙触达能力强 |
| 订阅转化率 | 订阅量 / 试用量 | > 25% 表现强劲 |
| 每位订阅用户收入 | 收入 / 订阅量 | 取决于定价 |

## 输出格式

### 表现概览

```
📊 [App Name] — [Period]

Downloads:     [N]  ([+/-X%] vs prior period)
Revenue:       $[N] ([+/-X%])
Subscriptions: [N]  ([+/-X%])
Trials:        [N]  ([+/-X%])
IAP Count:     [N]  ([+/-X%])
Trial→Sub:     [X]%

Top Markets (downloads):
  1. [Country] — [N] downloads, $[N]
  2. [Country] — [N] downloads, $[N]
  3. [Country] — [N] downloads, $[N]

Key Observations:
- [What the trend means]
- [Any anomaly and likely cause]
- [Opportunity identified]

Recommended Actions:
1. [Specific action based on data]
2. [Specific action based on data]
```

### 趋势警报

检测到显著变化（>20%）时，进行标记：

```
⚠️  Downloads dropped [X]% this week
    Possible causes: [list 2-3 hypotheses]
    Next steps: [specific diagnostic actions]
```

## 常见问题

**“为什么我的下载量下降了？”**
1. 拉取每日趋势——从什么时候开始下降的？
2. 检查当天是否发布了更新
3. 检查关键词排名（使用 `keyword-research` 技能）
4. 检查竞品动态（使用 `competitor-analysis` 技能）

**“我应该针对哪些国家进行本地化？”**
拉取国家/地区明细 → 按下载量排序 → 标记下载量高的非英语市场 → 使用 `localization` 技能

**“我的变现情况是否正在改善？”**
按周期对比试用率和试用→订阅转化率 → 使用 `monetization-strategy` 技能改进付费墙

## 相关技能

- `app-analytics` — 完整的分析体系设置和 KPI 框架
- `monetization-strategy` — 提升订阅转化率并改进付费墙
- `retention-optimization` — 以这些指标作为输入来降低用户流失
- `localization` — 拓展国家/地区数据中表现最佳的市场
- `ua-campaign` — 验证付费安装是否反映在下载量激增中