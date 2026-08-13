---
name: seo-content-brief
description: >
  Generate competitive SEO content briefs with per-section word counts,
  competitor scoring, keyword density guidance, and page-type templates.
  Supports both new page briefs and improve-existing-page briefs.
  Use when user says "content brief", "write a brief", "content outline",
  "blog brief", "service page brief", "brief for", "writing brief",
  "content plan", or "outline for".
user-invocable: true
argument-hint: "[url-or-keyword] [page-type]"
license: MIT
metadata:
  author: puneetindersingh
  original_author: puneetindersingh
  version: "1.0.0"
  category: seo
---
# SEO 内容简报生成器

生成以研究为依据的内容简报，帮助作者创作能够超越当前排名靠前结果的页面。简报包括带有差距评分的竞争对手分析、各章节字数明细、关键词布局规则，以及针对特定页面类型的模板。

## 流程

### 1. 确定简报模式

**改进模式**（提供了现有页面 URL）：
- 获取现有页面的内容和结构
- 识别已经表现出色的内容（予以保留）
- 识别缺失、内容单薄或过时的章节
- 在大纲中区分“保留/加强”和“新增”章节
- 如果有针对性的改进即可胜出，则不要建议全面重写

**新页面模式**（提供了关键词或主题，但未提供现有页面）：
- 仅使用目标网站的首页或站点地图了解业务背景
- 从头开始为新页面创建简报
- 聚焦于新页面可以填补的竞争差距

### 2. 获取背景信息

- 获取目标 URL 或首页，以了解业务
- 获取站点地图，以发现所有现有页面、分类和服务
- 这些背景信息对于网站相关性规则至关重要（见下文）

### 3. 分析 SERP

- 找出目标关键词排名前 5 的页面
- 过滤掉非竞争对手（Wikipedia、Reddit、Pinterest、Amazon、YouTube、政府网站、SEO 工具页面、招聘网站、目录网站、新闻聚合网站、社交平台）。完整列表请参阅 `references/excluded-domains.md`。
- 对每个真实竞争对手进行评分：内容深度（1-10）、格式（1-10）、SEO（1-10）、用户体验（1-10）
- 识别三类差距：
  - **主题差距：**竞争对手完全遗漏的子主题
  - **深度差距：**有所涉及但内容浅显的主题
  - **质量差距：**信息过时、缺少专家视角、格式较差
- 计算差距优先级：`Impact x Competitive Advantage / Effort`

### 4. 判断搜索意图

- **信息型：**用户希望学习相关知识（指南、操作方法、定义）
- **商业型：**用户在购买前进行研究（对比、评测、“最佳 X”）
- **交易型：**用户已准备采取行动（购买、预订、咨询、注册）
- **导航型：**用户正在寻找特定网站或页面

确定 Google 针对此查询更青睐哪种 SERP 内容形式：长篇指南、列表文章、对比表格、落地页、FAQ、视频、本地结果包。

### 5. 创建简报

应用 `references/page-type-templates.md` 中的页面类型模板，然后根据竞争对手差距和搜索意图进行定制。

## 关键规则

### 网站相关性规则

你建议的每个标题、子主题、关键词和 FAQ，都必须是目标网站基于其实际服务或产品能够可信地撰写的内容。

- 阅读网站首页和站点地图，了解其业务
- 如果竞争对手结构中的某些章节涉及该网站不提供的内容，请勿照搬
- 在提出每项建议之前，先问：“这个网站真的能够提供与此内容相符的服务或产品吗？”如果不能，则将其删除。

### 网站结构覆盖规则

为中心页、概览页、分类页或“类型”页面创建简报时：
- 大纲必须涵盖网站上现有的每个相关产品分类、服务或子页面
- 不要虚构不存在的分类，也不要遗漏确实存在的分类
- 每个分类都应作为独立章节出现，并附带内部链接建议
- 这可确保该页面作为一个完善的中心页，链接至所有子页面

对于非枢纽页面（单项服务页面、博客文章），应利用网站结构推荐相关内部链接，但不要强行将每个类别都纳入大纲。

### 输出语言规则

- 输出中绝不提及研究人员姓名、框架名称或工具名称（不得出现“Ben Goodey method”“Frase.io formula”“Princeton GEO”“Clearscope”“Backlinko”）
- 这些仅供内部思考使用。输出内容必须是清晰、专业的建议。
- 面向企业主或内容作者撰写，而不是面向 SEO 学术研究者

## 关键词密度与位置

完整规则请阅读 `references/keyword-density.md`。摘要：

**主关键词的使用：** 在高价值位置自然地使用主关键词。
- 不要以固定密度为优化目标。密度检查只能作为可选的内部可读性或关键词堆砌判断标准。
- 前 1-2 次出现有助于建立主题语境，之后的效果会逐渐减弱。
- 对于一篇 1,000 字的文章，应避免在标题、正文和替代文本中生硬地重复关键词。

**主关键词必须出现在：**
1. 标题标签中（靠近开头）
2. H1 标签中（靠近开头）
3. URL slug 中
4. 元描述中
5. 第一段/前 100 个词中
6. 至少一个图片替代文本中

**主关键词不需要出现在：**
- 每个 H2 或 H3 中（如果 H1 已涵盖主题，各子主题自然会承载相关语境）
- 每个段落或章节中

**次要关键词：**
- 在正文内容中分布 5-8 个密切相关的辅助词
- 使用 10-15 个覆盖相关概念的更广泛语义词
- 在自然的情况下用于 H2-H6 子标题
- 同义词可以提高可读性，并且不计入关键词密度

**各章节的关键词指导：** 对大纲中的每个章节，明确说明：
- 标题中应使用哪个关键词（主关键词或次要关键词）
- 正文是否应包含主关键词或其变体
- 示例：“在 H2 中使用次要关键词 ‘structural drafting services’。正文：提及一次主关键词。”

**分布：** 均匀分布主关键词。不要将其过度集中在开头或某一个章节中。

## 元标签规则

**标题标签：**
- 50-60 个字符（不得少于 50 个字符，也不得超过 60 个字符）
- 主关键词放在最前面，品牌名称放在最后
- 使用竖线或短横线分隔品牌（与网站现有格式保持一致）
- 尽可能以成果、数字或具体信息开头

**元描述：**
- 130-150 个字符（不得少于 130 个字符，也不得超过 150 个字符）
- 使用主动语态，通过独特卖点和具体信息扩展标题内容
- 以行动号召结尾
- 末尾不要添加品牌名称（标题中已经包含）
- 不要使用引号（Google 会在引号处截断内容）

## 信息增益（不可妥协）

每份内容简报都必须明确指出该内容将增加哪些当前排名页面均未提供的新价值。必须具体：
- 专有数据或原创研究
- 包含真实成果的案例研究
- 专家引述或第一手经验
- 原创综合分析或独特框架
- 不能是“更多细节”或“更好的格式”

## E-E-A-T 要求

列出该内容所需的确切信任信号：
- 与主题相关的作者资质和个人简介
- 专家引述或权威来源引用
- 注明日期的研究、数据或统计资料
- 最后更新日期
- 对 YMYL 主题（健康、金融、法律、安全）尤其重要

## 内部链接

- 建议 3-5 个具体的内部链接机会，并提供锚文本
- 指明页面是中心页（链接到主题集群页面）还是辐射页（链接到支柱页面）
- 使用站点地图中的网站结构查找真实的链接目标

## 输出格式

始终严格按照以下结构输出：

```
## Content Brief: [Primary Keyword]

### Search Intent
[Intent type, SERP format rewarded, target audience and knowledge level. 3-4 lines.]

### Competitor Analysis
| # | URL | Key H2 Sections | Est. Words | Score | Main Gap |
|---|-----|-----------------|------------|-------|----------|
| 1 | ... | ...             | ...        | X/40  | ...      |

### Content Gaps and Opportunities
[Bullet list: topic gaps, depth gaps, quality gaps with specifics]

### Winning Outline

**H1:** [H1 with primary keyword]
**URL Slug:** /[slug]
**Target Word Count:** ~[X] words (competitor avg: ~[X] words)

[Full H2/H3 outline with:
- Word count per section
- Content format notes (bullet list, table, definition box, etc.)
- Featured Snippet targets marked with "FS target"
- Per-section keyword guidance]

### Recommended Meta Tags

**Title**
[title, 60 chars max]

**Meta Description**
[description, 150 chars max]

### Unique Angle and Information Gain
[Specific paragraph: what exact new value this piece adds]

### E-E-A-T Requirements
[Bullet list of exact trust signals needed]

### Internal Linking Opportunities
[3-5 suggestions with anchor text and target URL]
```

## 仅大纲模式

当用户要求“仅提供大纲”或“内容大纲”而不是完整简报时，跳过竞争对手分析表、内容差距部分、信息增益部分和 E-E-A-T 部分。仅输出：

```
## Content Outline: [Primary Keyword]

**H1:** [H1 with primary keyword]
**URL Slug:** /[slug]
**Target Word Count:** ~[X] words (competitor avg: ~[X] words)

[Full H2/H3 outline with word counts, format notes, FS targets, keyword guidance, and a 1-2 sentence writing note per section]
```

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `serp_organic_live_advanced` 获取真实的 SERP 数据并进行竞争对手分析，使用 `kw_data_google_ads_search_volume` 获取关键词搜索量，使用 `dataforseo_labs_bulk_keyword_difficulty` 获取难度分数，使用 `dataforseo_labs_search_intent` 进行意图分类，并使用 `on_page_content_parsing_live` 提取竞争对手内容。

## Ahrefs 集成（可选）

如果 Ahrefs MCP 工具可用，请使用 `keywords-explorer-overview` 获取关键词搜索量和难度，使用 `serp-overview` 进行 SERP 分析，使用 `site-explorer-organic-keywords` 获取现有关键词排名，并使用 `site-explorer-top-pages` 获取竞争对手页面表现。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 目标 URL 无法访问 | 报告错误。不要猜测页面内容。请用户验证该 URL。 |
| 筛选后未找到竞争对手 | 扩大搜索范围，纳入部分匹配的竞争对手。在简报中注明竞争格局较为薄弱。 |
| 未找到站点地图 | 在缺少网站结构背景的情况下继续。注明内部链接建议可能不完整。 |
| 未指定页面类型 | 根据关键词意图和 SERP 格式自动检测。在简报中说明检测到的类型。 |
| 未指定目标字数 | 使用竞争对手平均字数作为基准。在大纲中注明这一点。 |