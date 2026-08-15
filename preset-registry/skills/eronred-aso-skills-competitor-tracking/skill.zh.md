---
name: competitor-tracking
description: When the user wants to monitor competitor apps on an ongoing basis — tracking metadata changes, keyword shifts, screenshot updates, rating trends, or new features. Use when the user mentions "competitor monitoring", "track competitors", "competitor alert", "competitor changed their title", "watch a competitor app", "competitor weekly report", "competitive intelligence", or "what changed in competitor's listing". For a one-time deep competitive analysis, see competitor-analysis. For market-wide chart movements, see market-movers.
metadata:
  version: 1.0.0
---
# 竞品追踪

你负责建立并持续开展竞品监控——及时发现元数据变更、关键词变化、评分下降和新功能发布，避免它们影响你的排名。

## 一次性分析与持续追踪

| | `competitor-analysis` 技能 | 本技能（`competitor-tracking`） |
|---|---|---|
| **频率** | 一次性深入分析 | 每周/每月定期执行 |
| **输出** | 策略文档 | 变更日志 + 提醒 |
| **重点** | 差距分析、定位 | 发生了什么变化，以及为什么重要 |
| **数据** | 快照 | 差异（变更前与变更后） |

## 设置：定义你的监控列表

1. 检查是否存在 `app-marketing-context.md`
2. 询问：**你的前 3–5 个主要竞品是谁？**（如有可能，获取 App ID）
3. 询问：**你希望多久复盘一次？**（建议每周）
4. 询问：**你最关心哪些方面？**（关键词、评分、创意素材、定价）

如果竞品未知，请使用 Appeeky 识别竞品：
```bash
GET /v1/keywords/ranks?keyword=meditation&country=us&limit=10
GET /v1/apps/:id/intelligence  # check competitors array
```

## 追踪内容

### 元数据变更

每周使用 Appeeky 检查：
```bash
GET /v1/apps/:id  # title, subtitle, description
```

关注：
- **标题变更**——正在瞄准新的关键词或重新定位
- **副标题变更**——正在测试新的卖点或关键词
- **描述变更**——信息传达策略发生变化（对 Google Play 尤其重要）
- **截图更新**——采用新的创意方向，或上线 A/B 测试的胜出方案

### 关键词排名变化

```bash
GET /v1/apps/:id/keywords  # their ranking keywords
GET /v1/keywords/ranks?keyword=[shared keyword]  # who's ranking where
```

关注：
- 他们新获得排名的关键词（他们针对该词进行了优化——你是否也应该这样做？）
- 他们排名下降的关键词（抢占排名的机会）
- 某个竞品在共同关键词的排名上超越你

### 评分与评论

```bash
GET /v1/apps/:id/reviews?sort=recent&limit=20
GET /v1/apps/:id  # current rating
```

关注：
- 评分下降（他们发布了一个糟糕的更新——这是突出你的稳定性的机会）
- 围绕某一特定问题的一星评论激增（你可以解决的用户痛点）
- 新的正面评论称赞了你尚未提供的功能

### 榜单排名

```bash
GET /v1/market/movers?genre=[genre_id]&country=us
GET /v1/categories/:id/top?country=us&limit=25
```

关注：
- 某个竞品进入或跌出你所在类别的前 10 名
- 某个新竞品因榜单排名上升而进入你的市场

### 定价与付费墙

每 4–6 周手动检查一次：
- 试用期长度变化
- 价格变化（降价 = 激进增长；涨价 = 优化 LTV）
- 新的付费墙形式或套餐

## 每周竞品报告模板

每周一运行此分析：

```
Competitive Update — Week of [Date]

Apps tracked: [list names]

CHANGES DETECTED:
━━━━━━━━━━━━━━━━━
[Competitor Name]
  Metadata: [changed / no change]
    → [specific change if any]
  Top keywords: [gained X / lost Y / stable]
  Rating: [X.X → X.X] ([+/-N] ratings this week)
  Chart position: [#N → #N in category]
  New reviews theme: [if notable]

[Repeat per competitor]

OPPORTUNITIES IDENTIFIED:
1. [Competitor X dropped keyword Y — consider targeting it]
2. [Competitor X has surge of complaints about Z — your strength]
3. [Competitor X raised price — positioning opportunity]

THREATS:
1. [Competitor X now ranks #3 for [keyword] — we're at #8]
2. [New entrant spotted: [name] — check their metadata]

ACTION ITEMS:
1. [Specific response to a change]
2. [Keyword to target based on competitor gap]
```

## 每月深度分析触发条件

在以下情况下运行完整的 `competitor-analysis`：
- 竞品在分类榜单中跃升 10 个或更多名次
- 竞品更改其标题（表明进行了重大重新定位）
- 新竞品进入你所在分类的前 10 名
- 你在竞品近期重点布局的关键词上排名下降

## 自动化选项

### 手动（推荐小型团队使用）

设置日历提醒。执行上述 Appeeky API 调用。填写模板。

### 半自动化

构建一个每周调用 Appeeky 并对结果进行差异比较的脚本：

```bash
#!/bin/bash
APPS=("6759740679" "987654321" "111222333")
KEY="apk_your_key"

for APP_ID in "${APPS[@]}"; do
  echo "=== $APP_ID ==="
  curl -s "https://api.appeeky.com/v1/apps/$APP_ID" \
    -H "X-API-Key: $KEY" | jq '.data | {title, subtitle, rating, reviewCount}'
done
```

每周存储结果，并与前一周的输出进行差异比较。

### Appeeky MCP（在 Claude/Cursor 中）

每周一向你的智能体发出请求：
```
"Run a competitor check on apps [ID1], [ID2], [ID3] and 
compare their metadata and top keywords to last week."
```

智能体将使用 `get_app`、`get_app_keywords`、`get_app_reviews` 生成报告。

## 竞争应对手册

| 发生的变化 | 应对措施 |
|-------------|---------|
| 竞品在标题中瞄准你的第一关键词 | 防守：检查你的元数据是否已充分优化；考虑提高 ASA 出价 |
| 竞品放弃一个与你共有的关键词 | 机会：加大投入，并提高该词在 ASA 中的出价 |
| 竞品升级截图 | 审查你的截图——它们是否仍是该分类中最出色的？ |
| 竞品评分降至 4.0 以下 | 趁评分差距明显时，在宣传文本中提及你的评分 |
| 竞品推出你尚未拥有的功能 | 将其纳入路线图；同时突出你的差异化优势 |
| 新竞品进入前 10 名 | 对其运行完整的 `competitor-analysis` |

## 相关技能

- `competitor-analysis` — 一次性的深度竞争策略分析
- `keyword-research` — 根据发现的关键词缺口采取行动
- `market-movers` — 自动捕捉榜单层面的竞品排名变动
- `apple-search-ads` — 通过 ASA 出价应对竞品的关键词动向
- `aso-audit` — 发现竞争差距后，对自身进行审查