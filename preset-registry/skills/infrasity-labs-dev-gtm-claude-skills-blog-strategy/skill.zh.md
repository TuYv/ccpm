---
name: blog-strategy
description: >
  Blog strategy development including topic cluster architecture with
  hub-and-spoke design, audience mapping, competitive landscape analysis,
  AI citation surface strategy across ChatGPT/Perplexity/AI Overviews,
  distribution channel planning (YouTube, Reddit, review platforms for GEO),
  content scoring targets, measurement framework, and content differentiation
  through original research and first-hand experience.
  Use when user says "blog strategy", "content strategy", "blog positioning",
  "what should I blog about", "blog topics", "content pillars", "blog ideation".
user-invokable: true
argument-hint: "<niche>"
---
# 博客策略：定位与内容架构

制定全面的博客策略，通过建立主题权威性来提升
Google 排名，同时在 AI 引用平台上建立品牌影响力。
包括主题集群架构、AI 引用触点策略、内容
评分目标以及 GEO 专项优化计划。

**研究规范参考资料 (v1.8.0)**：
- `skills/blog/references/research-quality.md` - 五维评分标准、预检陷阱类别、跨来源聚类、新鲜度下限
- `skills/blog/references/synthesis-contract.md` - 综合输出的 6 条法则

**自动加载的输入 (v1.8.0)**：当项目根目录中存在 `DISCOURSE.md`（由 `/blog discourse` 生成）时，将其与本技能的权威来源规划一并加载，用于获取跨平台讨论信号。

## 交叉参考

策略规划应考虑 FLOW 五触点模型（自有网站、SERP 及 AI Overviews、AI 助手引用、本地搜索结果包、社区和视频）。本地搜索结果包相关工作委托给 `claude-seo`；其他所有工作均归入 claude-blog。完整映射参见 `skills/blog/references/flow-alignment.md`。

有关为战略规划提供输入、以证据为导向的受众画像、关键词研究和内容优先级排序提示词，请参阅 `/blog flow find`。

## 工作流程

### 第 1 步：探索

通过提问或项目分析收集背景信息：

1. **业务**：你销售什么产品或提供什么服务？你的客户是谁？
2. **博客目标**：流量？潜在客户？权威性？AI 引用？
3. **当前状态**：是否已有博客内容？（如果项目可用，请进行扫描）
4. **竞争对手**：你的 3-5 个主要竞争对手是谁？
5. **差异化优势**：你拥有哪些独特的专业知识或数据？
6. **资源**：写作产能（每周文章数）、视觉内容预算？

### 第 2 步：竞争格局

研究竞争对手的博客：
1. 使用 WebSearch 查找竞争对手的博客 URL
2. 对每个竞争对手评估：
   - 发布频率
   - 内容类型（指南、案例研究、对比、新闻）
   - 视觉质量（图片、图表、视频）
   - Schema 使用情况
   - 社交渠道分发（YouTube、Reddit、LinkedIn）
   - AI 引用情况（在 ChatGPT/Perplexity 中搜索行业术语）
3. 找出所有竞争对手都未能充分覆盖的空白领域

#### 竞争性 AI 引用分析

绘制竞争对手在各 AI 平台上的可见度图谱。使用 WebSearch 查找
竞争对手如何出现在目标关键词的 AI 生成回答中。

```
## Competitive AI Citation Map
| Query | ChatGPT Cites | Perplexity Cites | AI Overview Cites | Gap? |
|-------|--------------|-----------------|-------------------|------|
| [keyword] | [competitor/none] | [competitor/none] | [competitor/none] | [Yes/No] |
| [keyword] | [competitor/none] | [competitor/none] | [competitor/none] | [Yes/No] |
| [keyword] | [competitor/none] | [competitor/none] | [competitor/none] | [Yes/No] |
```

评估每个竞争对手的 AI 可见度：
- **高**：针对多个查询，在 3/3 个平台中均被引用
- **中**：仅在 1-2 个平台中被引用，或仅针对有限的查询被引用
- **低**：很少被引用，仅出现在小众查询中
- **无**：未检测到 AI 引用情况

识别 AI 引用缺口：即没有引用任何竞争对手的查询。这些查询代表了创建新内容的最高机会目标。

注意：不同平台之间的重合度仅为 12%。某个在 ChatGPT 上表现强劲的竞争对手，在 Perplexity 上可能完全没有出现。请分别独立分析每个平台。

### 第 3 步：受众映射

定义 2-3 个受众细分群体：

```
### Audience Segment: [Name]
- **Role**: [Job title / description]
- **Pain points**: [What problems do they have?]
- **Search behavior**: [What do they Google?]
- **AI behavior**: [What do they ask ChatGPT/Perplexity?]
- **Content preferences**: [Long guides? Quick answers? Video?]
- **Buying stage**: [Awareness / Consideration / Decision]
```

### 第 4 步：使用主题集群架构设计内容支柱

根据受众需求和竞争缺口设计 3-5 个内容支柱。
为每个支柱构建完整的中心辐射式集群模型。

```
### Pillar: [Topic Area]
- **Purpose**: Build authority in [topic]
- **Primary keywords**: [3-5 keywords]
- **Content types**: Pillar guide, supporting posts, comparisons, FAQ
- **Unique angle**: [What first-hand experience/data can you provide?]
- **Estimated posts**: [N] to achieve topic coverage
- **AI citation potential**: [High/Medium/Low] - [why]
```

#### 集群架构设计

为每个支柱设计完整的中心辐射式结构：

```
### Cluster Architecture: [Pillar Topic]

                    ┌──────────────────┐
                    │   Pillar Page    │
                    │   3,000-4,000w   │
                    └────────┬─────────┘
                             │
           ┌─────────────────┼──────────────────┐
           │                 │                   │
    ┌──────▼──────┐   ┌─────▼──────┐   ┌───────▼──────┐
    │  Spoke #1   │   │  Spoke #2  │   │   Spoke #3   │
    │  1,500-2,500│   │  1,500-2,500│  │  1,500-2,500 │
    └──────┬──────┘   └─────┬──────┘   └───────┬──────┘
           │                │                   │
           └────────────────┼───────────────────┘
                    (cross-links between spokes)
```

对于每个集群，请明确：
- 每个支柱包含 **8-12 个辐射主题**，每个主题分别针对一个特定的长尾关键词
- 所有集群页面之间的**内部链接计划**（每个辐射页面都链接至支柱页面，支柱页面链接至所有辐射页面，辐射页面之间交叉链接至相关的辐射页面）
- 从 12 个可用模板中为每篇内容分配一个**内容模板**：
  `how-to-guide`、`listicle`、`case-study`、`comparison`、`pillar-page`、
  `product-review`、`thought-leadership`、`roundup`、`tutorial`、
  `news-analysis`、`data-research`、`faq-knowledge`

```
### Cluster Build Plan: [Pillar Topic]
| # | Spoke Topic | Template | Target Keyword | Word Count | Internal Links |
|---|------------|----------|---------------|-----------|----------------|
| P | [Pillar title] | pillar-page | [keyword] | 3,000-4,000 | Links to all spokes |
| 1 | [Spoke title] | how-to-guide | [keyword] | 1,500-2,500 | Pillar + Spokes 2,3 |
| 2 | [Spoke title] | comparison | [keyword] | 1,500-2,500 | Pillar + Spokes 1,3 |
| 3 | [Spoke title] | listicle | [keyword] | 1,500-2,500 | Pillar + Spokes 1,2 |
| ... | ... | ... | ... | ... | ... |
```

参考：有关中心辐射模型和锚文本规则，请参阅 `references/internal-linking.md`。

### 第 5 步：差异化策略

2025 年 12 月核心更新会奖励第一手经验。规划如何证明真正的专业能力：

| 信号类型 | 实施方式 |
|-------------|---------------|
| 原创数据 | 开展调查、分析专有数据、进行实验 |
| 案例研究 | 记录真实的客户/项目成果及指标 |
| 公开构建 | 透明地分享过程、经验教训和失败 |
| 专家访谈 | 邀请具备第一手知识的从业者 |
| 工具评测 | 亲自测试产品，分享截图和结果 |
| 行业分析 | 针对公开数据提供独特视角 |

### 第 5.5 步：AI 引用覆盖面策略

规划如何最大限度地提高跨平台 AI 引用率。80% 的 LLM 引用
来自自然搜索结果前 100 名之外。仅依靠传统 SEO
是不够的。

#### 站内优化

将每篇内容都构建为便于 AI 引用的形式：
- 每个 H2 均以答案优先的段落开篇（40-60 个词，包含统计数据 + 来源）
- **引用胶囊**：每个 H2 章节包含一段 40-60 个词、可独立理解的文本
- **问答格式**：60-70% 的 H2 标题采用问题形式
- 每篇文章都包含带有 schema 标记的 **FAQ 章节**
- **实体清晰度**：全文使用一致的术语（关键概念不使用同义词变体）
- **结构化数据**：为 Article、FAQ、HowTo 和 Review schema 添加 JSON-LD

#### 站外布局（关键：88-92% 的 AI 引用来自站外）

| 渠道 | AI 引用影响 | 优先行动 |
|---------|-------------------|-----------------|
| YouTube | 0.737 的相关性（最强） | 为支柱文章制作配套视频 |
| Reddit | 引用量激增 450% | 在 3-5 个 subreddit 中进行真实互动 |
| 评测平台 | 2.6-3.5 倍乘数效应 | 在 G2、Capterra（B2B）上维护资料页面 |
| Wikipedia/Wikidata | 可信度决胜因素 | 建立知名度，创建 Wikidata 条目 |
| 行业出版物 | 第 2-3 级引用来源 | 发布客座文章、提供专家评论 |

#### 跨平台监测

- 跟踪 ChatGPT、Perplexity、Google AI Overviews 中的品牌提及
- 各平台之间的重合度仅为 12%；需要分别针对每个平台进行优化
- 80% 的 LLM 引用来自自然搜索结果前 100 名之外
- 每月监测：在每个平台上搜索 10-20 个目标查询，并记录引用情况

参考：有关详细的 GEO 策略，请参阅 `references/geo-optimization.md`。

### 第 5.6 步：内容评分目标

设定所有博客内容都必须达到的质量标准：

```
### Content Quality Standards
| Metric | Target | Measured By |
|--------|--------|-------------|
| Blog quality score | 80+ | `/blog analyze` |
| E-E-A-T compliance | Named author + 8+ tier 1-3 sources | Manual review |
| AI citation readiness | Answer-first + FAQ + citation capsules | `/blog analyze` |
| Visual minimum | 2+ charts + 3+ images per post | Asset count |
| Internal links | 5+ per post (within cluster) | Link audit |
| Schema markup | Article + FAQ + relevant type | Structured data test |
| Word count | 1,500+ for spokes, 3,000+ for pillars | Word count tool |
```

每篇文章在发布前都应进行评分。质量评分低于 80 分的文章
应在上线前进行修订。

### 步骤 5.7：GEO 专项策略

针对所有内容规划段落级可引用性，并根据各 AI 平台进行定制。

| AI 平台 | 偏好 | 优化重点 |
|-------------|--------|-------------------|
| ChatGPT | 时效性、品牌权威性、对话式表达的清晰度 | 在 30 天内更新文章，明确定义实体 |
| Perplexity | 引用、来源多样性、结构化答案 | 第 1-3 层级来源、编号列表、数据表格 |
| Google AI Overviews | 结构化数据、schema、主题权威性 | FAQ schema、HowTo schema、完整的主题集群 |

各平台策略：
- **ChatGPT**：确保品牌名称一致出现，保持 30 天内的内容新鲜度，采用对话式、答案优先的格式
- **Perplexity**：最大限度增加外部引用数量（每篇文章 8 个以上），使用结构化数据表格，引用权威来源
- **AI Overviews**：完整覆盖主题集群，实施所有相关的 schema 类型，采用精选摘要格式

参考：`references/geo-optimization.md`，了解各平台的专项优化指南。

### 步骤 6：分发渠道策略

AI 可见性需要站外存在感（88-92% 的 AI 引用来自
站外信号）。规划品牌布局：

| 渠道 | AI 影响 | 策略 |
|---------|-----------|----------|
| YouTube | 0.737 相关性（最强） | 为支柱文章、操作指南和演示制作配套视频 |
| Reddit | 引用量激增 450% | 真诚参与 3-5 个 subreddit，分享见解而非链接 |
| 评论平台 | 2.6-3.5 倍引用乘数 | 在 G2、Capterra、TrustRadius（B2B）上维护资料页 |
| Wikipedia/Wikidata | 可信度的决胜因素 | 通过赢得媒体报道建立知名度，创建 Wikidata 条目 |
| 行业出版物 | 第 2-3 层级引用来源 | 客座文章、专家评论、研究贡献 |
| 社交媒体 | 品牌提及 | LinkedIn 思想领导力内容、Twitter/X 见解 |

预算分配建议：**40% 自有内容 / 60% 赢得媒体和内容分发**。

参考：`references/distribution-playbook.md`，了解详细的渠道策略和模板。

### 步骤 7：衡量框架

```
### Metrics to Track

#### Traditional SEO
- Organic traffic (monthly)
- Keyword rankings (top 10, top 3)
- Domain authority / Domain Rating
- Internal link coverage
- Core Web Vitals

#### AI Citation Metrics (New)
- Share of Voice in ChatGPT responses (manual tracking)
- AI Overview citation rate (Google Search Console)
- Perplexity mentions (manual tracking)
- AI referral traffic (GA4: source contains chatgpt, perplexity, claude)
- Brand mention volume (branded search + web mentions)

#### Content Quality
- Blog quality score via `/blog analyze` (target: 80+)
- Content freshness (% of posts updated within 30 days)
- Visual element coverage (charts + images per post)
- Citation tier quality (% tier 1-3 sources)

#### Business Impact
- Blog-attributed leads/conversions
- Email subscribers from blog
- Content-assisted revenue
```

### 第 8 步：生成策略文档

输出格式：

```
# 博客策略：[企业名称]

## 执行摘要
[用 2-3 句话说明战略方向]

## 受众
[细分受众摘要]

## 内容支柱与集群架构
[3-5 个内容支柱及完整的中心辐射式集群计划]
[每个集群的内部链接图]
[每篇内容对应的模板分配]

## 竞争定位
[我们的差异化方式——我们带来的独特价值]
[展示可利用空白的竞争性 AI 引用地图]

## AI 引用覆盖面策略
[站内优化检查清单]
[包含优先渠道的站外布局计划]
[针对特定平台的 GEO 策略]

## 内容质量标准
[所有内容的评分目标]
[E-E-A-T 合规要求]

## 分发渠道
[优先渠道及具体策略]

## 内容产出速度
- 新文章：[N] 篇/周
- 时效性更新：[N] 篇/月
- 视觉元素：每篇文章 [N] 个图表 + [N] 张图片

## 90 天路线图
### 第 1 个月：奠定基础
- [ ] 发布 [支柱 1] 指南及 [N] 篇配套辐射内容
- [ ] 设置 YouTube 频道 / Reddit 账号
- [ ] 建立衡量指标仪表板
- [ ] 完成竞争性 AI 引用审计

### 第 2 个月：扩展
- [ ] 发布 [支柱 2] 指南及 [N] 篇配套辐射内容
- [ ] 开展第一轮时效性更新
- [ ] 开始通过 Reddit/YouTube 分发
- [ ] 在评论平台上启动站外布局

### 第 3 个月：优化
- [ ] 使用 `/blog analyze` 审查所有文章（目标：80 分以上）
- [ ] 优化评分最低的文章
- [ ] 发布 [支柱 3] 指南
- [ ] 审查所有平台上的 AI 引用指标
- [ ] 根据数据调整策略

## 衡量
[关键绩效指标和跟踪方法——传统 SEO + AI 引用指标]

## 参考文档
- `references/internal-linking.md` - 中心辐射式模型、锚文本规则
- `references/distribution-playbook.md` - 渠道策略和模板
- `references/geo-optimization.md` - 针对特定 GEO 平台的优化
- `references/content-templates.md` - 12 种内容模板及其结构

## 后续步骤
1. 运行 `/blog calendar` 创建第一个月的编辑日历
2. 为第一个支柱页面运行 `/blog brief`
3. 运行 `/blog write` 生成第一篇文章
4. 为目标查询设置 AI 引用监控
```