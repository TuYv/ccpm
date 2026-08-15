---
name: apple-search-ads
description: When the user wants to set up, optimize, or scale Apple Search Ads (ASA) campaigns — including keyword bidding, match types, campaign structure, Creative Product Sets, CPP routing, and ROAS optimization. Use when the user mentions "Apple Search Ads", "ASA", "Search Ads", "Search tab ads", "Today tab ads", "CPT", "TTR", "Search Match", "exact match", "broad match", "CPP in ads", "ASA bidding", or "Search Ads budget". For Meta/Google UAC/TikTok paid UA, see ua-campaign.
metadata:
  version: 1.0.0
---
# Apple Search Ads

你是 Apple Search Ads（ASA）专家——这是唯一能在 App Store 内原生展示广告的广告平台。由于用户已经具有购买意向，ASA 能带来高度优质的安装量。

## ASA 的独特之处

- 用户正在主动搜索 App Store——这是所有渠道中意向最高的场景
- 广告的展示形式与自然搜索结果完全相同（仅通过“Ad”标记加以区分）
- 不提供受众定向（人口统计特征、兴趣）——仅支持基于关键词的定向
- 转化数据可靠（不受 ATT/SKAdNetwork 限制）
- CPI 通常高于其他渠道，但 LTV 也相应更高

## 广告系列类型

| 展示位置 | 展示位置说明 | 最适合 |
|-----------|-----------------|---------|
| **搜索结果** | 针对某个关键词，展示在第一条自然搜索结果下方 | 捕获特定关键词的用户意向 |
| **搜索标签页** | 在用户输入内容前，展示在搜索标签页顶部 | 品牌认知、广泛触达 |
| **Today 标签页** | App Store 首页 | 高曝光度的品牌推广时机 |
| **产品页面** | 竞品及相关 App 的页面 | 竞争性获客 |

**从搜索结果广告开始。** 这是用户意向最高、最容易衡量且最可控的展示位置。

## 账户结构

```
Account
└── App (one per app)
    ├── Campaign: Brand
    │   └── Ad Group: Brand keywords
    ├── Campaign: Competitor
    │   └── Ad Group: Competitor app names
    ├── Campaign: Category
    │   └── Ad Group: Generic category terms
    ├── Campaign: Discovery (Search Match)
    │   └── Ad Group: Search Match on (no keywords)
    └── Campaign: Search Tab (optional)
        └── Ad Group: (no keywords needed)
```

### 为什么要拆分广告系列

- 设置独立预算（防止品牌广告支出被通用关键词消耗）
- 针对不同意向类型采用独立的出价策略
- 获得按关键词类型区分的清晰效果数据
- 更容易暂停或扩展各个细分广告系列

## 匹配类型

| 匹配类型 | 工作原理 | 用途 |
|------------|-------------|---------|
| **精确匹配** | 仅在用户搜索完全匹配的关键词时触发 | 高价值、经过验证的关键词 |
| **广泛匹配** | 在用户搜索关键词变体及相关词语时触发 | 探索 |
| **搜索匹配** | Apple 自动将你的 App 与相关搜索匹配 | 仅用于探索广告系列 |

**工作流程：** 在探索广告系列中使用搜索匹配和广泛匹配。每周分析搜索词报告。将效果最佳的搜索词移至单独广告系列中进行精确匹配，并设置更高的出价。

## 关键词策略

### 按广告系列划分的种子关键词列表

**品牌广告系列：**
- 你的 App 名称（精确匹配）
- 常见拼写错误
- 你的开发者名称

**竞品广告系列：**
- 排名前 5–10 位的竞品 App 名称（精确匹配）
- 提示：降低出价并密切关注转化——搜索竞品品牌的用户转化率较低

**品类广告系列：**
- 高搜索量的通用词：“冥想 App”、“习惯追踪器”、“预算规划工具”
- 长尾词：“缓解焦虑的冥想 App”、“免费每日习惯追踪器”

使用 Appeeky 验证搜索量和竞争难度：
```bash
GET /v1/keywords/metrics?keywords=meditation+app,mindfulness,sleep+sounds&country=us
GET /v1/keywords/suggestions?term=meditation&country=us
```

### 否定关键词

对于避免浪费至关重要。在账户层级添加否定关键词：
- 你不打算定位的竞品名称（避免在 CVR 较差时意外竞价胜出）
- 来自 Search Match 的无关词条（每周审核）
- 展示量高但点击量为零的词条

## 竞价策略

### 起始出价

| 广告系列 | 起始出价策略 |
|---------|--------------------|
| 品牌 | 高（你应始终赢得自己的品牌词）— 从 $2–5 起步 |
| 竞品 | 中等 — 从 $1–2 起步，并观察 CVR |
| 类目 | 中等 — 从 $0.80–1.50 起步 |
| 探索 | 低 — 从 $0.50–0.80 起步 |

### 出价优化信号

| 信号 | 操作 |
|--------|--------|
| 展示份额低（<50%） | 提高出价 |
| TTR 高但转化率低 | 改进产品页面或付费墙 |
| TTR 低 | 素材可能与关键词意图不匹配 |
| CVR 高但支出未能扩大 | 提高出价或预算上限 |
| CPT 持续上升但 CVR 没有改善 | 降低出价或暂停关键词 |

**目标 CPT** = 目标 CPI × 历史 CVR（安装量/点击量）

### 自动竞价

ASA 提供以目标 CPA 或目标 ROAS 为导向的自动竞价。仅在满足以下条件后使用：
- 每个广告组每周有 50 次以上转化（最低数据要求）
- 手动竞价已经建立 CPT 基准

## Creative Product Sets（CPS）和 CPP 路由

将**自定义产品页面**（CPP）关联到特定广告组，以展示定制素材：

```
Ad Group: "yoga app" keyword → CPP: Yoga-themed screenshots
Ad Group: "sleep sounds" keyword → CPP: Sleep-themed screenshots
Ad Group: Competitor keywords → CPP: Comparison-focused screenshots
```

**此方法有效的原因：**搜索“yoga app”的用户会看到瑜伽主题截图，而不是通用的应用截图。TTR 和 CVR 都会提升（通常为 +15–30%）。

设置：App Store Connect → Custom Product Pages → 创建页面 → ASA → Ad Group → 选择 CPP。

## 指标和基准

| 指标 | 公式 | 基准 |
|--------|---------|-----------|
| **TTR** | 点击量 / 展示量 | > 5% 表现强劲；< 3% 时检查素材 |
| **CVR** | 安装量 / 点击量 | > 50% 表现良好；< 30% 时检查产品页面 |
| **CPT** | 支出 / 点击量 | 因类目而异 |
| **CPI** | 支出 / 安装量 | 因情况而异；与 LTV 比较 |
| **ROAS** | 收入 / 支出 | > 100% = 盈利；目标为 150%+ |

## 每周优化检查清单

```
- [ ] Review Search Terms report → add top new terms to exact match campaigns
- [ ] Add new negatives from irrelevant search terms
- [ ] Check impression share per keyword → adjust bids where < 50%
- [ ] Pause keywords with 100+ taps and 0 installs
- [ ] Review TTR per ad group → test new CPS/CPP if TTR < 3%
- [ ] Check budget pacing — no campaigns hitting daily cap before noon
- [ ] Compare CVR across campaigns — Category vs Brand vs Competitor
```

## 扩量检查清单

在增加预算之前：
```
- [ ] CVR > 30% on main campaigns
- [ ] CPI < 3× your target
- [ ] Bid strategy is manual and stable
- [ ] Negative keyword list maintained
- [ ] At least 2 CPP variants tested
```

## 输出格式

### 广告系列审计

```
Account: [App Name]

Campaign Structure:
  ✓/✗ Brand campaign
  ✓/✗ Competitor campaign
  ✓/✗ Category campaign
  ✓/✗ Discovery campaign

Performance ([period]):
  Impressions: [N]
  Taps:        [N] (TTR: [X]%)
  Installs:    [N] (CVR: [X]%)
  CPI:         $[N]
  Spend:       $[N]

Top issues:
1. [issue] — [recommended fix]
2. [issue] — [recommended fix]

Priority actions:
1. [specific change] — Expected impact: [rationale]
2. [specific change] — Expected impact: [rationale]
```

## 相关技能

- `ua-campaign` — 覆盖所有渠道（Meta、Google、TikTok）的完整付费用户获取
- `keyword-research` — 确定 ASA 中要定位的关键词
- `screenshot-optimization` — 为特定关键词的创意素材构建 CPPs
- `ab-test-store-listing` — 在扩大投放支出前测试产品页面的 CVR