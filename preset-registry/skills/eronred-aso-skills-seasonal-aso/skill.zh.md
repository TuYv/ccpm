---
name: seasonal-aso
description: When the user wants to optimize their App Store listing for seasonal events, holidays, or trending moments — including keyword opportunities, metadata updates, screenshot theming, and timing strategy. Use when the user mentions "seasonal", "holiday", "Christmas", "New Year", "Valentine's Day", "summer", "back to school", "seasonal keywords", "trending now", "limited time", or wants to capitalize on a calendar event. For general keyword research, see keyword-research. For full metadata rewrites, see metadata-optimization.
metadata:
  version: 1.0.0
---
# 季节性 ASO

你帮助用户识别并把握与日历事件、节假日和热门时刻相关的季节性关键词机会及商店信息优化机会。

## 核心原则

**季节性排名竞争激烈且时效性强。**元数据需要 1–3 天才能被索引。应在活动前 2 周规划变更，并在高峰期过后 3–5 天恢复原状。

## 季节性日历（iOS — 美国）

| 事件 | 高峰期 | 目标关键词 |
|-------|-------------|-------------------|
| 新年 | 12 月 26 日至 1 月 7 日 | “新年”、“决心”、“目标”、“习惯”、“全新开始” |
| 情人节 | 2 月 1–14 日 | “情人节”、“爱情”、“情侣”、“浪漫”、“礼物” |
| 春季 / 复活节 | 3–4 月 | “春季”、“复活节”、“焕新”、“清洁”、“整理” |
| 母亲节 | 5 月 1–12 日 | “妈妈”、“母亲”、“家庭”、“送给妈妈的礼物” |
| 夏季 | 6–8 月 | “夏季”、“度假”、“旅行”、“户外”、“海滩” |
| 开学季 | 7 月 15 日至 9 月 10 日 | “学校”、“学习”、“学生”、“作业”、“计划工具” |
| 万圣节 | 10 月 1–31 日 | “万圣节”、“恐怖”、“诡异”、“服装”、“恶作剧” |
| 黑色星期五 | 11 月 20–30 日 | “优惠”、“促销”、“折扣”、“购物”、“礼物” |
| 圣诞节 | 12 月 1–26 日 | “圣诞节”、“礼物”、“假期”、“圣诞老人”、“家庭” |
| 年末 | 12 月 27–31 日 | “年度回顾”、“总结”、“2026 年目标”、“新年” |

## 工作流程

### 第 1 步 — 确定相关事件

1. 检查是否存在 `app-marketing-context.md`
2. 询问：**你要针对哪个事件或季节？**
3. 询问：**你的应用是做什么的？**（用于评估关键词相关性）
4. 判断该事件是否适合——并非每个季节性时刻都适用

### 第 2 步 — 研究季节性关键词

使用 Appeeky 查找季节性词语的搜索量：

```bash
GET /v1/keywords/metrics?keywords=christmas+planner,holiday+tracker
GET /v1/keywords/suggestions?term=christmas&country=us
GET /v1/keywords/trending?country=us&days=7
```

**筛选依据：**
- 搜索量激增（与此前 30 天的基准水平进行比较）
- 优先选择难度低于 60 的关键词（季节性关键词竞争激烈）
- 与应用核心功能的相关性

### 第 3 步 — 规划元数据变更

**关键词字段（100 个字符，iOS）：**
- 将表现不佳的关键词替换为季节性词语
- 添加 2–4 个季节性关键词，同时保留表现最佳的常青关键词
- 删除与你的核心使用场景无关的季节性词语

**副标题（30 个字符）：**
- 如果合适，可考虑使用季节性宣传语，例如：“你的假日计划工具”或“新年目标追踪工具”
- 仅在原副标题对关键词并不重要时进行更改

**宣传文本（170 个字符——无需审核）：**
- 应始终针对季节性事件进行更新——即时生效，无需审核
- 可用于：季节性行动号召、限时功能亮点、事件联动

**截图：**
- 为前 2 张截图添加季节性边框或主题
- 使用 `screenshot-optimization` Skill 获取创意指导

### 第 4 步 — 时间安排清单

```
Timeline (count back from event date):
- [ ] T-14 days: Research keywords, brief creative
- [ ] T-10 days: Write new metadata + promotional text
- [ ] T-7 days: Submit screenshot updates (no review needed)
- [ ] T-5 days: Submit keyword/subtitle update (review time buffer)
- [ ] T-0: Event peak — monitor rankings daily
- [ ] T+3 days: Revert metadata to evergreen version
- [ ] T+5 days: Revert promotional text
```

## 输出格式

### 季节性机会简报

```
🎄 Seasonal Opportunity: [Event Name]
   Peak window: [dates]
   Lead time needed: [X days]

Keyword Opportunities:
  High priority (volume spike, <60 difficulty):
  - "[keyword]" — vol [N], diff [N]
  - "[keyword]" — vol [N], diff [N]

  Secondary (relevant but competitive):
  - "[keyword]" — vol [N], diff [N]

Metadata Recommendations:
  Keyword field: [current] → [proposed — 100 chars]
  Subtitle: [keep / change to: "..."]
  Promo text: "[seasonal copy — 170 chars]"

Screenshots: [suggest seasonal theme or keep as-is]

Timeline:
  - Submit metadata by: [date]
  - Submit promo text by: [date]
  - Revert by: [date]
```

## 季节性与常青策略的权衡

| 因素 | 季节性 | 常青 |
|--------|----------|-----------|
| 搜索量 | 暂时非常高 | 稳定 |
| 竞争度 | 高峰期非常高 | 中等 |
| 风险 | 高峰过后排名下降 | 表现稳定 |
| 回报 | 安装量激增 | 持续增长 |

**规则：** 只替换已经表现不佳的常青关键词。绝不要为了季节性猜测而牺牲排名靠前的关键词。

## 热门时机（非日历事件）

对于病毒式传播的热门时机（新闻事件、病毒式内容、应用商店趋势）：
1. 使用 `GET /v1/keywords/trending?country=us&days=3` 发现新兴词条
2. 在 24–48 小时内采取行动（趋势窗口期很短）
3. 仅更新推广文本（即时生效，无需审核）
4. 趋势消退后恢复原状（通常为 3–7 天）

## 相关技能

- `keyword-research` — 深入分析季节性候选关键词
- `metadata-optimization` — 使用季节性词条重写完整元数据
- `screenshot-optimization` — 设计季节性截图主题
- `market-pulse` — 实时发现热门关键词和市场动向