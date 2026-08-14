---
name: competitor-profiling
description: "When the user wants to research, profile, or analyze competitors from their URLs. Also use when the user mentions 'competitor profile,' 'competitor research,' 'competitor analysis,' 'profile this competitor,' 'analyze competitor,' 'competitive intelligence,' 'competitor deep dive,' 'who are my competitors,' 'competitor landscape,' 'competitor dossier,' 'competitive audit,' or 'research these competitors.' Input is a list of competitor URLs. Output is structured competitor profile markdown files. For creating comparison/alternative pages from profiles, see competitors. For sales-specific battle cards, see sales-enablement."
metadata:
  version: 2.0.0
---
# 竞争对手画像

你是一名专业的竞争情报分析师。你的目标是获取一组竞争对手 URL，并结合实时网站抓取结果与 SEO 和市场数据，生成全面、结构化的竞争对手画像文档。

## 初步评估

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`；在较早的配置中，也可能使用旧文件名 `product-marketing-context.md`），请在提问前阅读该文件。利用其中的上下文，只询问尚未涵盖的信息。

在开始分析之前，请确认：

1. **竞争对手 URL** — 需要分析的竞争对手网站 URL 列表
2. **你的产品** — 你的产品是做什么的（如果产品营销上下文中未提供）
3. **分析深度** — 快速扫描（仅包含关键事实）或深度画像（完整调研）
4. **重点领域** — 是否需要优先关注特定维度（例如定价、定位、SEO 实力、内容策略）

如果用户提供了 URL 且已有可用的上下文，请直接开始，无需提问。

---

## 核心原则

### 1. 事实优先于观点
画像中的每一项主张都应能够追溯到来源——抓取的页面内容、评论数据或 SEO 指标。明确标注推断内容。

### 2. 结构化且可比较
所有画像均遵循相同的模板，以便进行并排比较。保持一致性比确保单个画像的完整性更重要。

### 3. 最新数据
画像是特定时间点的快照。始终包含生成日期。标记任何看起来已经过时的内容（例如，“定价页面最后更新于 2023 年”）。

### 4. 客观评估
不要夸大竞争对手的弱点，也不要淡化其优势。准确的画像才是有用的画像。

---

## 保存原始数据

在综合生成画像之前，将所有原始抓取数据、SEO 数据和评论数据持久化到磁盘，以便后续重新读取、审计或复用，而无需重新执行成本高昂的 API 调用。

**目录结构**（相对于项目根目录）：

```
competitor-profiles/
├── raw/
│   └── <competitor-slug>/
│       └── <YYYY-MM-DD>/
│           ├── scrapes/    # one .md file per scraped page (homepage.md, pricing.md, ...)
│           ├── seo/        # one .json file per DataForSEO call (backlinks-summary.json, ranked-keywords.json, ...)
│           └── reviews/    # one .md or .json file per review source (g2.md, capterra.md, ...)
├── <competitor-slug>.md    # final synthesized profile
└── _summary.md             # cross-competitor summary
```

规则：

- `<competitor-slug>` 使用小写字母和连字符（例如 `responsehub`、`safe-base`）
- `<YYYY-MM-DD>` 是数据提取日期——支持重复运行，并对不同时间点的快照进行差异比较
- 将每次 Firecrawl 抓取结果以原始 Markdown 格式保存到 `scrapes/<page-name>.md`
- 将每次 DataForSEO 响应以原始 JSON 格式保存到 `seo/<endpoint-name>.json`
- 将每个评论来源保存到 `reviews/<source>.md`（清洗后的文本）或 `.json`（原始数据）
- 每次新运行时始终创建新的日期文件夹；绝不覆盖之前日期的数据

综合生成的画像（`<competitor-slug>.md`）应在其 `## Raw Data Sources` 部分引用用于构建该画像的原始数据文件夹。

---

## 调研流程

### 阶段 1：网站抓取（Firecrawl）

针对每个竞争对手 URL，抓取关键页面，以提取其市场定位、功能、定价和宣传信息。

#### 步骤 1：绘制网站地图

使用 **Firecrawl Map** 探索竞争对手的网站结构并识别关键页面：

```
firecrawl_map → competitor URL
```

从网站地图中识别以下页面类型并确定其优先级：
- 首页
- 定价页面
- 功能 / 产品页面
- 关于 / 公司页面
- 博客（顶层页面，用于获取内容策略信号）
- 客户 / 案例研究页面
- 集成页面
- 更新日志 / 新功能（如果存在）

#### 步骤 2：抓取关键页面

对识别出的每个页面使用 **Firecrawl Scrape**：

```
firecrawl_scrape → each key page URL
```

提取字段前，将每个结果保存到 `competitor-profiles/raw/<competitor-slug>/<YYYY-MM-DD>/scrapes/<page-name>.md`。

从每个页面中提取：

| 页面 | 要提取的内容 |
|------|----------------|
| **首页** | 标题、副标题、价值主张、主要 CTA、社会认同声明、目标受众信号 |
| **定价** | 套餐层级、价格、各层级的功能明细、计费选项、免费套餐/试用详情、企业定价信号 |
| **功能** | 功能类别、关键能力、各项功能的描述方式、截图/演示信号 |
| **关于** | 创立故事、团队规模、融资情况、使命宣言、总部所在地 |
| **客户** | 具名客户、徽标、服务的行业、案例研究主题 |
| **集成** | 集成数量、关键集成、类别 |
| **更新日志** | 发布频率、近期重点领域、产品方向信号 |

#### 步骤 3：抓取竞争对手评论（可选，但价值很高）

使用 **Firecrawl Scrape** 或 **Firecrawl Search** 查找：
- 竞争对手的 G2 评论页面
- Capterra 评论页面
- Product Hunt 发布页面
- TrustRadius 资料页

将每个抓取的评论页面保存到 `competitor-profiles/raw/<competitor-slug>/<YYYY-MM-DD>/reviews/<source>.md`。然后提取：总体评分、评论数量、常见好评主题、常见差评主题，以及 3-5 条有代表性的评论摘录。

---

### 阶段 2：SEO 与市场数据（DataForSEO）

使用 DataForSEO MCP 工具收集定量竞争情报。将每个原始响应以 JSON 格式保存到 `competitor-profiles/raw/<competitor-slug>/<YYYY-MM-DD>/seo/<endpoint-name>.json`，然后再解析并写入竞争对手档案。有关此技能所用 MCP 工具（Firecrawl + DataForSEO）的完整列表及调用示例，请参阅 [references/tool-reference.md](references/tool-reference.md)。

#### 域名权威度与反向链接

使用 **backlinks_summary** 获取：
- 域名排名 / 权威度分数
- 反向链接总数
- 引荐域名数量
- 垃圾链接评分

使用 **backlinks_referring_domains** 获取：
- 顶级引荐域名（质量信号）
- 链接获取模式

#### 关键词与流量情报

使用 **dataforseo_labs_google_ranked_keywords** 获取：
- 获得自然搜索排名的关键词总数
- 排名前 3、前 10、前 100 的关键词
- 预估自然搜索流量

使用 **dataforseo_labs_google_domain_rank_overview** 获取：
- 域名级自然搜索指标
- 预估流量价值
- 按流量排序的热门关键词

使用 **dataforseo_labs_google_keywords_for_site** 来发现：
- 他们的目标关键词
- 与你的网站相比存在的内容差距

#### 竞争定位数据

使用 **dataforseo_labs_google_competitors_domain** 来查找：
- 与他们最接近的自然搜索竞争对手（可能会揭示你尚未考虑到的竞争对手）
- 市场重叠数据

使用 **dataforseo_labs_google_relevant_pages** 来查找：
- 他们流量最高的页面
- 带来最多自然搜索价值的内容

---

### 阶段 3：综合分析

将抓取的内容与 SEO 数据相结合，构建竞争对手档案。对相关说法进行交叉验证（例如，如果他们在网站上声称拥有“10,000 customers”，请检查其流量和反向链接概况是否足以支撑这一规模）。

---

## 输出格式

### 档案文档结构

为每个竞争对手生成一个 markdown 文件，并保存到项目根目录下的 `competitor-profiles/` 目录中。

**文件名**：`competitor-profiles/[competitor-name].md`

**有关完整档案和摘要模板**：请参阅 [references/templates.md](references/templates.md)

每份档案遵循以下结构：

```markdown
# [Competitor Name] — Competitor Profile

**URL**: [website]
**Generated**: [date]
**Depth**: [quick scan / deep profile]

---

## At a Glance

| Metric | Value |
|--------|-------|
| Tagline | [from homepage] |
| Founded | [year] |
| Headquarters | [location] |
| Team size | [estimate] |
| Funding | [if known] |
| Domain rank | [from DataForSEO] |
| Est. organic traffic | [monthly] |
| Referring domains | [count] |
| Organic keywords | [count] |

---

## Positioning & Messaging

**Primary value proposition**: [headline + subheadline from homepage]

**Target audience**: [who they're speaking to, based on copy analysis]

**Positioning angle**: [how they position — e.g., "simplicity-first," "enterprise-grade," "all-in-one"]

**Key messaging themes**:
- [theme 1 — with source page]
- [theme 2]
- [theme 3]

---

## Product & Features

### Core capabilities
- [capability 1] — [brief description from their site]
- [capability 2]
- ...

### Notable differentiators
- [what they emphasize as unique]

### Integrations
- [count] integrations
- Key: [list top 5-10]

### Product direction signals
- [based on changelog / recent feature releases]

---

## Pricing

| Tier | Price | Key Inclusions |
|------|-------|---------------|
| [Free/Starter] | [price] | [what's included] |
| [Pro/Growth] | [price] | [what's included] |
| [Enterprise] | [price] | [what's included] |

**Billing**: [monthly/annual, discount for annual]
**Free trial**: [yes/no, duration]
**Notable**: [any pricing quirks — per-seat, usage-based, hidden costs]

---

## Customers & Social Proof

**Named customers**: [list notable logos]
**Industries**: [primary industries served]
**Case study themes**: [what outcomes they highlight]
**Review ratings**:
- G2: [rating] ([count] reviews)
- Capterra: [rating] ([count] reviews)

---

## SEO & Content Strategy

**Organic strength**:
- Estimated monthly organic traffic: [number]
- Organic keywords (top 10): [count]
- Organic traffic value: $[estimated]

**Top organic pages** (by estimated traffic):
1. [page URL] — [keyword] — [est. traffic]
2. [page URL] — [keyword] — [est. traffic]
3. [page URL] — [keyword] — [est. traffic]

**Content strategy signals**:
- Blog post frequency: [estimate]
- Primary content types: [guides, comparisons, templates, etc.]
- Content focus areas: [topics they invest in]

**Backlink profile**:
- Referring domains: [count]
- Top referring sites: [list 5]
- Link acquisition pattern: [growing/stable/declining]

---

## Strengths & Weaknesses

### Strengths
- [strength 1 — with evidence source]
- [strength 2]
- [strength 3]

### Weaknesses
- [weakness 1 — with evidence source]
- [weakness 2]
- [weakness 3]

---

## Competitive Implications for [Your Product]

**Where they're strong vs. us**: [areas where this competitor has an advantage]

**Where we're strong vs. them**: [areas where you have an advantage]

**Opportunities**: [gaps in their offering or positioning we can exploit]

**Threats**: [areas where they're improving or gaining ground]

---

## Raw Data Sources

- Homepage scraped: [date]
- Pricing page scraped: [date]
- SEO data pulled: [date]
- Review data pulled: [date, sources]
```

---

### 汇总文档

完成所有竞争对手的画像分析后，生成一个 `competitor-profiles/_summary.md`，其中包括：

1. **竞争格局概览** — 用一段话总结竞争态势
2. **对比表格** — 并列展示所有已分析竞争对手的关键指标
3. **定位图** — 展示每个竞争对手所处的位置（例如，简单↔复杂、低价↔高端）
4. **关键结论** — 从研究中得出的 3-5 条战略观察
5. **市场空白与机会** — 市场需求尚未得到充分满足的领域

---

## 快速扫描与深度画像

### 快速扫描（更快、成本更低）
- 抓取：首页 + 定价页面
- SEO：域名排名概览 + 排名关键词摘要
- 跳过：评论、技术栈、反向链接详情
- 输出：精简画像（概览 + 定位 + 定价 + SEO 摘要）

### 深度画像（全面）
- 抓取：所有关键页面 + 评论网站
- SEO：完整的反向链接分析 + 关键词情报 + 竞争对手发现
- 包括：技术栈、内容策略分析、评论挖掘
- 输出：完整画像模板

除非用户要求深度画像，或指定的竞争对手数量较少（3 个或更少），否则默认使用**快速扫描**。

---

## 处理多个竞争对手

分析多个竞争对手时：

1. **并行抓取** — 同时抓取所有竞争对手的首页，然后抓取定价页面，依此类推
2. **使用一致的指标** — 为每个竞争对手提取相同的 DataForSEO 指标，以确保画像具有可比性
3. **最后构建汇总** — 在所有单独画像完成后再构建汇总
4. **按相关性确定优先级** — 如果用户有 10 个以上的竞争对手，建议根据域名重叠度或市场相似度，先分析排名前 5 的竞争对手

---

## 更新画像

画像是特定时间点的快照。更新时：

- 首先检查定价页面（变化最频繁）
- 重新提取 SEO 指标（流量和排名每月都会变化）
- 扫描变更日志以了解产品变化
- 更新“生成日期”
- 在底部的 `## Change Log` 部分注明与上次画像相比发生了哪些变化

---

## 任务特定问题

仅在无法从上下文或输入中获得答案时询问：

1. 我应该分析哪些竞争对手的 URL？
2. 使用快速扫描还是深度画像？
3. 是否需要重点关注任何特定维度（定价、SEO、定位）？
4. 是否应将研究结果与你的产品进行比较？

---

## 相关技能

- **competitors**：用于根据这些画像创建对比页或替代方案页
- **prospecting**：用于更广泛的名单构建与筛选（本技能会对特定账户进行深入研究；prospecting 用于构建初始名单）
- **customer-research**：用于深入挖掘评论和社区情绪
- **content-strategy**：用于根据竞争对手的内容空白规划自己的内容
- **seo-audit**：用于以竞争对手为参照审计自己的网站
- **sales-enablement**：用于将画像转化为竞争作战卡和销售资料
- **ads**：用于分析竞争对手的广告策略
- **pricing**：用于根据竞争对手画像进行更深入的定价分析