---
name: google-ads-expert
description: "Build profitable Google Ads campaigns by applying Perry Marshall's 80/20 principles to paid search optimization Use when: **Setting up a new Google Ads account** from scratch; **Optimizing existing campaigns** that are underperforming; **Structuring campaigns** for maximum quality score and ROI; **Applying 80/20 thinking** to identify high-leverage optimizations; **Scaling profitable campaigns** without wasting budget"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# Google Ads 专家——用 80/20 思维掌握付费搜索

> 将佩里·马歇尔的 80/20 原则应用于付费搜索优化，打造可盈利的 Google Ads 广告系列

## 何时使用此技能

- **从零开始设置新的 Google Ads 账号**
- **优化表现不佳的现有广告系列**
- **构建广告系列结构**，以最大限度提升质量得分和投资回报率
- **应用 80/20 思维**，找出高杠杆的优化措施
- **扩展可盈利的广告系列**，同时避免浪费预算
- **在潜在客户点击之前进行资格筛选**（节省无效点击产生的费用）
- **确定优化工作的优先级**，以获得最大影响

## 方法论基础

| 方面 | 详细信息 |
|--------|---------|
| **来源** | 《Google Ads 终极指南》《80/20 销售与营销》 |
| **专家** | 佩里·马歇尔——Google Ads 教育先驱、80/20 营销大师 |
| **核心原则** | “大多数人认为流量占成功要素的 80%，但实际上它只占 20%。转化才占 80%。一旦转化表现稳固，流量方面的难题自然会迎刃而解。” |


## Claude 负责什么，以及你决定什么

| Claude 负责 | 你决定 |
|-------------|------------|
| 构建内容框架 | 最终信息表达 |
| 建议说服技巧 | 品牌调性 |
| 创建草稿变体 | 版本选择 |
| 识别优化机会 | 发布时间 |
| 分析竞争对手的方法 | 战略方向 |

## 此技能的作用

此技能将 Google Ads 技术专长与战略性的 80/20 思维相结合，帮助你从一开始就构建可盈利的广告系列。

你将学会：

1. **将 80/20 原则应用于广告系列**——找出能够带来 80% 结果的 20% 工作
2. **围绕质量得分设计结构**——组织广告系列，以实现最高相关性
3. **拉动枪栓**——在访客产生费用之前筛选他们
4. **优化正确的事项**——按照正确顺序逐层剥开优化这颗洋葱
5. **实现盈利性扩展**——了解何时以及如何增加支出
6. **以转化为核心进行思考**——将转化置于流量之前

最终结果：广告系列能够持续赚钱，而不只是获得点击。

## 使用方法

### 提示词示例

```
Help me structure a Google Ads campaign for [business/product] using Perry Marshall's
match type segmentation approach. I want to maximize Quality Score and control.
```

```
Apply 80/20 analysis to my Google Ads account. Here are my top 20 keywords by spend:
[list]. Where should I focus my optimization efforts for maximum impact?
```

```
Create a lead qualification strategy for my Google Ads campaigns. I sell [product]
and waste money on [type of bad clicks]. How do I "rack the shotgun"?
```

```
My campaigns are profitable at $X/day but I want to scale. Use the 80/20 approach
to help me identify how to increase spend without killing ROI.
```

```
Prioritize my optimization checklist for [campaign type]. What's the 80/20 order
of operations I should follow before spending more money?
```

## 说明

### Google Ads 的 80/20 框架

```
┌─────────────────────────────────────────────────────────────┐
│              80/20 IN GOOGLE ADS                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  80% of conversions come from 20% of keywords               │
│  80% of costs come from 20% of keywords                     │
│  80% of wasted spend comes from 20% of search terms         │
│                                                             │
│  BUT ALSO:                                                  │
│                                                             │
│  4% of keywords drive 64% of conversions (80/20 of 80/20)   │
│  1% of keywords drive ~50% of conversions                   │
│                                                             │
│  "Find the vital few, ignore the trivial many"              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**战略意义**：不要对所有内容进行同等程度的优化。找出表现最佳的部分，并让它们变得更好。找出表现最差的部分，并将其淘汰。

---

### 第 1 步：转化优先的思维方式

在担心流量之前，先把转化做好。

> “大多数人认为流量决定了 80% 的成败，但实际上只占 20%。转化才决定了 80% 的成败。”

**执行顺序：**

| 优先级 | 重点 | 原因 |
|----------|-------|-----|
| 1 | 落地页转化 | 如果这一步没做好，所有流量都会被浪费 |
| 2 | 优惠方案/价值主张 | 必须足够有吸引力，才能促成转化 |
| 3 | 广告与落地页的相关性 | 质量得分和转化都会得到提升 |
| 4 | 关键词选择 | 定位正确的搜索用户 |
| 5 | 流量扩展 | 只有在第 1-4 项都稳固之后才能进行 |

**转化基准：**
- 如果转化率 <1%，先修正落地页
- 如果转化率为 2-5%，可以优化广告
- 如果转化率 >5%，可以开始扩展流量

---

### 第 2 步：以质量得分为导向的广告系列结构

**匹配类型细分：**

按照匹配类型将关键词划分到不同的广告组或广告系列中：

```
Campaign: [Product Name]
├── Ad Group: Exact Match Keywords
│   └── [keyword] → dedicated ads
├── Ad Group: Phrase Match Keywords
│   └── "keyword" → dedicated ads
├── Ad Group: Modified Broad Match
│   └── +keyword → dedicated ads
└── Ad Group: Broad Match (for discovery)
    └── keyword → catch-all ads
```

**这种方法为何有效：**
- 完全匹配关键词可获得最高的相关性得分
- 可以对完全匹配（已知表现良好的关键词）进行激进出价
- 广泛匹配会成为发现新搜索词的“撒网式探索”
- 每种匹配类型都能采用适当的出价策略

**剥离并迁移技巧：**

1. **运行广泛匹配**，发现人们实际搜索的内容
2. **查看搜索词报告**，找出表现优异的搜索词
3. 从广泛匹配中**“剥离”**这些搜索词
4. 将它们**“迁移”**到各自独立的完全匹配广告组中
5. 为每个剥离出来的搜索词**创建专用广告**
6. 将完全匹配词作为**否定关键词添加**到广泛匹配广告系列中

**结果**：持续改进、更高的质量得分、更低的成本。

---

### 第 3 步：给霰弹枪上膛（点击前先筛选）

> “对客户进行分类、从不合格者中筛选出合格者的艺术，是你可以培养的最重要技能之一。”

**80/20 现实**：点击广告的人中有 80% 永远不会购买，而你却要为他们的每一次点击付费。

**预筛选策略：**

| 策略 | 工作原理 | 示例 |
|--------|--------------|---------|
| **在广告中标明价格** | 吓退不会购买的人 | “起价 $499/月” |
| **明确限定条件** | 只吸引合适的受众 | “仅限企业”或“适用于 50 人以上的团队” |
| **筛选性措辞** | 让用户自行筛选 | “如果你认真考虑……” |
| **否定关键词** | 屏蔽不合适的搜索者 | -free, -cheap, -DIY, -jobs |
| **宣传信息扩展** | 预先设定期望 | “项目最低预算 $10K” |

**五个强力排除条件：**

在成为潜在客户之前，他们应该通过以下条件：

1. **资金** - 他们是否有预算购买你的解决方案？
2. **权限** - 他们能否做出购买决定？
3. **需求** - 他们是否存在你所解决的问题？
4. **时机** - 他们是否已准备好立即采取行动？
5. **匹配度** - 他们是否是适合你的客户？

**落地页筛选：**
- 添加一个简短的测验：“[Product] 适合你吗？”
- 提供价格或“起价”，以便按预算进行筛选
- 使用面向理想客户的具体案例研究
- 让不会购买的人自行退出

---

### 第 4 步：优化洋葱

按照正确的顺序逐层推进优化：

```
                OPTIMIZATION PRIORITY
    ┌─────────────────────────────────────┐
    │                                     │
    │  OUTER LAYER (Do First)             │
    │  ├── Match type segmentation        │
    │  ├── Ad extensions (all of them)    │
    │  └── Negative keywords              │
    │                                     │
    │  MIDDLE LAYER (Do Second)           │
    │  ├── Ad copy split testing          │
    │  ├── Landing page optimization      │
    │  └── Bid adjustments by device      │
    │                                     │
    │  INNER LAYER (Do Third)             │
    │  ├── Audience targeting             │
    │  ├── Day/time bidding              │
    │  └── Geographic bid adjustments     │
    │                                     │
    │  CORE (Only After Everything Else)  │
    │  └── Increase budget/bids           │
    │                                     │
    └─────────────────────────────────────┘
```

**佩里的法则：**

> “你的第一反应不应该是‘我要投入更多资金’。你的第一反应应该是‘我是否已经优化了所有真正可以优化的地方？’”

---

### 第 5 步：80/20 预算分配

**应该把钱投向哪里：**

| 表现水平 | 预算分配 | 策略 |
|-------------------|-------------------|----------|
| **表现最好的 20% 关键词** | 64% 的预算 | 积极扩大规模 |
| **中间 60%** | 30% 的预算 | 测试并优化 |
| **表现最差的 20%** | 6% 的预算 | 削减或暂停 |

**识别你的 80/20：**

1. 导出过去 90 天的关键词数据
2. 按转化次数排序（不是点击次数！）
3. 计算占总转化次数的累计百分比
4. 标记达到 80% 转化次数的位置
5. 统计达到该位置涉及多少个关键词（通常约为 20%）
6. 这些就是你的“关键少数”

**80/20 中的 80/20：**
- 在排名前 20% 的关键词中，还存在另一个 80/20
- 4% 的关键词通常会带来 50% 以上的转化
- 这些关键词值得拥有独立的广告系列和专属着陆页

---

### 第 6 步：实现盈利性扩展

**何时扩展：**

只有在满足以下条件后：
- [ ] 转化跟踪准确无误
- [ ] 当前支出水平下的 ROI 为正
- [ ] 主要关键词的质量得分达到 7 分以上
- [ ] 所有优化层面均已处理
- [ ] 你了解自己的客户获取经济模型

**如何扩展：**

| 方法 | 适用时机 | 风险等级 |
|--------|-------------|------------|
| **提高优胜关键词的出价** | 排名前 20% 的关键词 | 低 |
| **添加相似关键词** | 已验证有效的广告组 | 中 |
| **扩展匹配类型** | 精确匹配 → 词组匹配 | 中 |
| **新的广告系列/受众群体** | 核心部分稳固后 | 较高 |
| **增加每日预算** | 完成以上所有事项后 | 低 |

**应停止扩展的警示信号：**
- CPA 增长超过 20%
- 转化率显著下降
- 质量得分持续下降
- 展示次数份额未随预算增加而提升

---

### 第 7 步：高级 80/20 策略

**分级产品策略：**

> “20% 的人愿意为更好的体验支付 4 倍的价格。”

如果你的主要产品价格为 $100，可以考虑：
- 标准版：$100（面向 80% 的人群）
- 高级版：$400（面向 16% 的人群）
- 精英版：$1,600（面向 4% 的人群）

**为每个层级分别投放广告系列**——它们的经济模型各不相同。

**预测性预算：**

使用 80/20 数学模型预测市场规模：
- 如果有 1,000 人以 $50 的价格购买
- 约 200 人愿意支付 $200（4 倍）
- 约 40 人愿意支付 $800（16 倍）
- 约 8 人愿意支付 $3,200（64 倍）

**为每个细分群体规划广告系列和着陆页。**

---

## 示例

### 示例 1：电商商店优化

**情况**：一家销售专业厨房设备的在线商店，每月在 Google Ads 上花费 $5,000，转化率为 2.5%。希望提高 ROI。

**80/20 分析：**

导出 90 天的数据后发现：
- 147 个活跃关键词
- 23 个关键词（16%）带来了 81% 的销售额
- 6 个关键词（4%）带来了 52% 的销售额
- 87 个关键词（59%）没有产生任何转化

**行动计划：**

**1. 立即执行（外层）：**
- 暂停 87 个零转化关键词 → 每月节省约 $800
- 根据搜索字词报告添加否定关键词
- 启用所有广告附加信息（此前缺少宣传信息和结构化摘要）

**2. 结构调整（匹配类型）：**
- 为排名前 23 的关键词创建精确匹配广告系列
- 为排名前 6 的关键词分别创建广告组
- 将现有关键词移至词组匹配/广泛匹配，以发现新机会

**3. 更有效地筛选客户：**
- 在广告中添加价格：“$89 起——高端厨房工具”
- 着陆页：添加“本产品适合哪些人”部分
- 否定关键词：-cheap、-wholesale、-bulk、-used

**4. 扩展优胜项：**
- 排名前 6 的关键词：出价提高 30%
- 为排名前 3 的产品创建专属着陆页
- 基于已转化用户创建再营销名单

**60 天后的结果：**
- 支出：$4,200/月（下降 16%）
- 转化量：提升 34%
- ROAS：从 3.2x 提升至 5.1x

---

### 示例 2：B2B SaaS 潜在客户开发

**情况**：一家 SaaS 公司通过 Google Ads 获取潜在客户。获得了大量点击，但潜在客户质量较低。销售团队抱怨有太多只问不买的人。

**问题诊断：**

运用 80/20 思维：
- 80% 的潜在客户不合格（规模太小、没有预算、使用场景不匹配）
- 80% 的广告浪费来自广泛匹配式撒网

**Rack the Shotgun 实施方案：**

**1. 广告文案筛选：**
之前："Project Management Software - Free Trial"
之后："Project Management for Teams 50+ | Starting $499/mo"

**2. 落地页筛选：**
添加了“[Product] 是否适合您？”测验：
- 团队规模？
- 当前使用的工具？
- 预算范围？
- 计划何时实施？

分数 < 60 = 提供博客内容
分数 60-80 = 自助试用
分数 > 80 = 预约销售通话

**3. 广告系列结构：**
- 为企业级关键词设置单独的广告系列
- 为 SMB 关键词设置单独的广告系列
- 使用不同的落地页和不同的筛选级别

**4. 否定关键词：**
添加：-free, -open source, -small business, -startup, -cheap, -alternative to [competitor targeting SMB]

**结果：**
- 点击量：下降 40%
- 成本：下降 35%
- 合格潜在客户：提升 60%
- 销售接受的潜在客户：提升 180%
- 每个合格潜在客户的成本：下降 58%

---

## 检查清单与模板

### 广告系列审计检查清单（80/20 版本）

```markdown
## Google Ads 80/20 Audit: [Account Name]

### 1. Data Pull (Last 90 Days)
- [ ] Export all keyword data with conversions
- [ ] Export Search Terms Report
- [ ] Export campaign/ad group performance
- [ ] Note current spend and ROAS

### 2. 80/20 Analysis
**Keywords:**
- Total active keywords: ___
- Keywords with 0 conversions: ___ (% of total: ___%)
- Keywords driving 80% of conversions: ___ (% of total: ___%)
- Keywords driving 50% of conversions: ___ (% of total: ___%)

**Campaigns:**
- Campaign driving most conversions: ___
- Campaign with worst ROAS: ___

### 3. Outer Layer Optimization
- [ ] Match types segmented? Y/N
- [ ] Negative keyword list comprehensive? Y/N
- [ ] All ad extensions enabled? Y/N
  - [ ] Sitelinks
  - [ ] Callouts
  - [ ] Structured snippets
  - [ ] Call extensions (if applicable)
  - [ ] Location (if applicable)

### 4. Qualification Assessment
- [ ] Price/qualification in ad copy? Y/N
- [ ] Landing page qualifies visitors? Y/N
- [ ] Negative keywords block non-buyers? Y/N

### 5. Priority Actions
1. Quick win:
2. Biggest impact:
3. Scale opportunity:

### 6. Budget Reallocation
- Pause: $___/month
- Shift to winners: $___/month
- Test budget: $___/month
```

### 广告系列结构模板

```markdown
## Campaign Structure: [Product/Service]

### Campaign 1: Brand (Exact)
- Match type: Exact
- Budget: 10% of total
- Keywords: Brand terms only
- Goal: Capture brand searches cheaply

### Campaign 2: Core Product (Exact)
- Match type: Exact
- Budget: 40% of total
- Keywords: Top 20% performers
- Ad groups: 1 per keyword theme (5-10 keywords max)
- Goal: Maximum ROAS

### Campaign 3: Core Product (Phrase/BMM)
- Match type: Phrase + Broad Match Modifier
- Budget: 30% of total
- Keywords: Same as exact but expanded
- Goal: Discover new exact match candidates

### Campaign 4: Discovery (Broad)
- Match type: Broad
- Budget: 10% of total
- Keywords: Category-level terms
- Goal: Find new keyword opportunities
- Review: Weekly search terms report

### Campaign 5: Competitor
- Match type: Exact
- Budget: 10% of total
- Keywords: Competitor brand names
- Goal: Conquest qualified traffic

### Negative Keyword Master List
Apply to all campaigns:
- [Non-buyer terms]: free, cheap, DIY, etc.
- [Wrong audience]: jobs, careers, salary, etc.
- [Irrelevant]: [specific to your business]
```

### Weekly Optimization Routine

```markdown
## Weekly Google Ads Check: [Week of ___]

### 10-Minute Daily Check
- [ ] Budget pacing on track?
- [ ] Any major CPA spikes?
- [ ] Disapproved ads?

### Weekly Deep Dive (30 min)

**Search Terms Report:**
- New terms to add as exact: ___
- New negative keywords: ___

**Performance Review:**
- Top performer this week: ___
- Worst performer this week: ___
- Action taken: ___

**Ad Testing:**
- Tests running: ___
- Tests to conclude: ___
- New tests to start: ___

**Quality Score Check:**
- Keywords <6 QS: ___
- Action: ___

### Monthly Strategic Review
- [ ] 80/20 analysis updated
- [ ] Budget reallocation needed?
- [ ] New campaign opportunities?
- [ ] Scaling opportunities?
```

---

## Skill 边界

### 此 Skill 擅长的工作
- 构建有说服力的内容结构
- 应用文案写作框架
- 创建多个草稿版本
- 分析竞争对手的方法

### 此 Skill 无法做到的事
- 保证转化率
- 取代品牌语调的塑造
- 了解你的特定受众
- 做出最终审批决定

## 参考资料

- **书籍**：《Google Ads 终极指南》《80/20 销售与营销》，作者 Perry Marshall
- **概念**：Peel and Stick、Racking the Shotgun、Five Power Disqualifiers
- **更新**：有关最新功能，请参阅 Google Ads 帮助中心
- **来源**：`sources/books/marshall-google-ads-8020.md`

## 相关 Skills

- **conversion-copywriting** - 撰写能够转化目标人群的广告
- **landing-page-copy** - 创建符合广告意图的落地页
- **copy-frameworks** - 用于广告文案的 AIDA、PAS 框架
- **grand-slam-offers** - 创建值得投放广告的优惠方案
- **jobs-to-be-done** - 了解搜索者真正想要什么