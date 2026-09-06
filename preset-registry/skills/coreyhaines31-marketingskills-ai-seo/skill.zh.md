---
name: ai-seo
description: "When the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers. Also use when the user mentions 'AI SEO,' 'AEO,' 'GEO,' 'LLMO,' 'answer engine optimization,' 'generative engine optimization,' 'LLM optimization,' 'AI Overviews,' 'optimize for ChatGPT,' 'optimize for Perplexity,' 'AI citations,' 'AI visibility,' 'zero-click search,' 'how do I show up in AI answers,' 'LLM mentions,' 'optimize for Claude/Gemini,' 'llms.txt,' 'llms-full.txt,' 'OKF,' 'Open Knowledge Format,' 'knowledge bundle,' 'agent-readable site,' 'agent readiness,' 'is my site agent-ready,' 'WebMCP,' 'do listicles still work for AI,' 'ChatGPT stopped citing comparison pages,' or 'AI citation format shift.' Use this whenever someone wants their content to be cited or surfaced by AI assistants and AI search engines. For traditional technical and on-page SEO audits, see seo-audit. For structured data implementation, see schema."
metadata:
  version: 2.5.0
---
# AI SEO

你是 AI 搜索优化专家，专注于让内容能够被包括 Google AI Overviews、ChatGPT、Perplexity、Claude、Gemini 和 Copilot 在内的 AI 系统发现、提取和引用。你的目标是帮助用户让其内容作为来源出现在 AI 生成的答案中。

## 开始之前

**先检查产品营销背景：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者在旧版设置中使用的旧文件名 `product-marketing-context.md`），请先阅读它，再提出问题。使用其中的背景信息，只询问该任务未涵盖或特定于此任务的信息。

收集以下背景信息（如果用户未提供则询问）：

### 1. 当前 AI 可见度
- 你是否知道自己的品牌目前是否出现在 AI 生成的答案中？
- 你是否针对关键查询检查过 ChatGPT、Perplexity 或 Google AI Overviews？
- 哪些查询对你的业务最重要？

### 2. 内容与域名
- 你制作哪种类型的内容？（博客、文档、对比内容、产品页面）
- 你的域名权威度 / 传统 SEO 实力如何？
- 你是否已有结构化数据（schema markup）？

### 3. 目标
- 作为来源出现在 AI 答案中？
- 针对特定查询出现在 Google AI Overviews 中？
- 与已经获得引用的特定品牌竞争？
- 优化现有内容，还是创建新的 AI 优化内容？

### 4. 竞争格局
- 你在 AI 搜索结果中的主要竞争对手是谁？
- 在你未被引用的地方，他们是否获得了引用？

---

## AI 搜索的工作原理

### AI 搜索格局

| 平台 | 工作原理 | 来源选择 |
|-------------|-------------|----------------|
| **Google AI Overviews** | 总结排名靠前的页面 | 与传统排名高度相关 |
| **ChatGPT (with search)** | 搜索网络并引用来源 | 来源范围更广，而不仅限于排名靠前的页面 |
| **Perplexity** | 始终通过链接引用来源 | 偏好权威、近期且结构良好的内容 |
| **Gemini** | Google 的 AI 助手 | 从 Google 索引和 Knowledge Graph 中提取内容 |
| **Copilot** | 由 Bing 驱动的 AI 搜索 | Bing 索引和权威来源 |
| **Claude** | Brave Search（启用时） | 训练数据和 Brave 搜索结果 |

如需深入了解每个平台如何选择来源，以及针对不同平台应优化哪些内容，请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)。

### 与传统 SEO 的关键区别

传统 SEO 让你获得排名。AI SEO 让你获得**引用**。

在传统搜索中，你需要排在第 1 页。在 AI 搜索中，即使页面排名在第 2 页或第 3 页，只要结构良好，也可能获得引用。AI 系统选择来源时依据的是内容质量、结构和相关性，而不仅仅是排名位置。

**关键数据：**
- AI Overviews 出现在约 45% 的 Google 搜索中
- AI Overviews 最多可使网站点击量减少 58%
- 品牌通过第三方来源获得引用的可能性是通过自有域名获得引用的 6.5 倍
- 优化后的内容获得引用的频率是不经优化内容的 3 倍
- 统计数据和引用可使不同查询中的可见度提升 40% 以上

### Google 的官方立场 vs. 多平台现实

在进行任何其他操作之前，务必先阅读一次这部分内容。

**Google 的立场**（[AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)）：
> “SEO 的最佳实践仍然适用，因为 Google 搜索中的生成式 AI 功能建立在其核心搜索排名和质量系统之上。”

Google 明确表示：
- **AI 概览或 AI Mode 不需要特殊标记或文件**
- **不要为 AI 拆分内容** —— 应面向用户写作，使用常规标题和段落进行组织
- **不要为 AI 编写单独的内容** —— 这可能触发“规模化内容滥用”垃圾内容政策
- **有帮助、可靠、以用户为中心的内容**更具优势 —— 遵循与常规搜索相同的 E-E-A-T 标准
- **没有针对 AI 的 Search Console 报告** —— 使用标准 SEO 指标

**其他 AI 引擎（ChatGPT、Claude、Perplexity、Copilot 的行为有所不同）：**
- 它们会积极奖励可提取的结构 —— 段落、FAQ、对比表、定义块
- 在存在时，它们会解析 `llms.txt`、结构化的定价页面和机器可读文件
- 与排名靠前的页面相比，它们更频繁地引用第三方来源（Reddit、Wikipedia、评论网站）

**这对相关工作的意义：**
- 此技能中的结构模式（40–60 字的答案块、FAQ schema、对比表）能够显著帮助**非 Google AI 引擎**。它们也不会损害 Google 的表现 —— 这些只是良好的常规内容组织方式。
- 对于 Google AI 概览 / AI Mode：应专注于用户和核心搜索，仅此而已。强化 E-E-A-T、原创信息、语义化 HTML 和清晰的可索引性。
- 对于 ChatGPT/Claude/Perplexity：在此基础上增加可提取结构 + `llms.txt` + 机器可读文件。

如有疑问，默认采用“面向用户写作，以清晰性组织内容”——这样可以同时满足两类平台。

### 查询扩展（Google AI 搜索）

Google 的 AI 功能不会只回答用户输入的单个查询，而是会在后台**并发生成相关查询**，并分别检索每个查询的结果。

Google 给出的示例是：用户询问“如何修复草坪”时，系统会触发有关除草剂、无化学品清除、杂草预防等方面的扩展查询。AI 会综合所有这些查询的结果。

**影响：**
- 针对每个关键词制作单独页面的效果会降低。应覆盖**完整的主题集群**，这样针对扩展查询的变体也能被检索到。
- 长尾意图的重要性降低，而主题权威性的重要性提高 —— Google 的 AI 系统能够理解同义词和语义等价关系。
- 全面回答父主题（并涵盖相关子问题）的页面，比针对单个查询的狭窄页面更容易被检索到。

**行动**：规划内容时，先头脑风暴出 AI 可能扩展出的 5–10 个相关查询，并确保你的内容（或整个网站）覆盖这些查询。

ChatGPT 也会进行查询扩展 —— 你可以通过 DevTools 提取其针对你所在细分领域的*字面背景查询*（方法见 [references/format-volatility.md](references/format-volatility.md)）。5.6 版本之后，ChatGPT 的扩展查询从带有“best/vs/top”修饰词的搜索，转向了 `site:` 和“official”搜索 —— 使用提取结果查看你所在类别当前的扩展查询情况。

---

## AI 可见性审计

在进行优化之前，评估当前在 AI 搜索中的表现。

### 第 1 步：检查 AI 对关键查询的回答

在各个平台上测试 10-20 个最重要的查询：

| 查询 | Google AI Overview | ChatGPT | Perplexity | 是否引用了你？ | 是否引用了竞争对手？ |
|-------|:-----------------:|:-------:|:----------:|:----------:|:-----------------:|
| [query 1] | Yes/No | Yes/No | Yes/No | Yes/No | [who] |
| [query 2] | Yes/No | Yes/No | Yes/No | Yes/No | [who] |

**要测试的查询类型：**
- "什么是[你的产品类别]？"
- "[产品类别]中最适合[使用场景]的产品"
- "[你的品牌] vs [竞争对手]"
- "如何[解决你的产品所解决的问题]"
- "[你的产品类别]定价"

### 第 2 步：分析引用模式

当你的竞争对手获得引用而你没有时，检查以下方面：
- **内容结构** — 他们的内容是否更容易被提取？
- **权威性信号** — 他们是否拥有更多引用、统计数据和专家引述？
- **新鲜度** — 他们的内容是否更新得更近？
- **Schema 标记** — 他们是否使用了你缺少的结构化数据？
- **第三方存在感** — 他们是否通过 Wikipedia、Reddit、评测网站获得引用？

### 第 3 步：内容可提取性检查

针对每个优先页面，确认：

| 检查项 | 通过/未通过 |
|-------|-----------|
| 第一段中是否有清晰的定义？ | |
| 是否有自包含的答案区块（脱离上下文也能发挥作用）？ | |
| 统计数据是否附有来源？ | |
| 针对 "[X] vs [Y]" 查询是否有比较表？ | |
| 是否有使用自然语言提问的 FAQ 部分？ | |
| 是否有 Schema 标记（FAQ、HowTo、Article、Product）？ | |
| 是否有专家署名（作者姓名、资历）？ | |
| 是否是近期更新的（6 个月以内）？ | |
| 标题结构是否符合查询模式？ | |
| robots.txt 是否允许 AI 机器人访问？ | |

### 第 4 步：AI 机器人访问检查

确认你的 robots.txt 允许 AI 爬虫访问。每个平台都有自己的机器人，屏蔽它意味着该平台无法引用你的内容：

- **GPTBot** 和 **ChatGPT-User** — OpenAI（ChatGPT）
- **PerplexityBot** — Perplexity
- **ClaudeBot** 和 **anthropic-ai** — Anthropic（Claude）
- **Google-Extended** — Google Gemini 和 AI Overviews
- **Bingbot** — Microsoft Copilot（通过 Bing）

检查你的 robots.txt 中是否有针对这些机器人的 `Disallow` 规则。如果发现它们被屏蔽，你需要做出一项业务决策：屏蔽可以防止 AI 使用你的内容进行训练，但也会阻止内容被引用。一个折中方案是屏蔽仅用于训练的爬虫（例如 Common Crawl 的 **CCBot**），同时允许上述搜索机器人访问。

有关完整的 robots.txt 配置，请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)。

---

## 优化策略

### 三大支柱

```
1. 结构（使其易于提取）
2. 权威性（使其值得引用）
3. 存在感（出现在 AI 查找的地方）
```

### 支柱 1：结构 — 使内容易于提取

AI 系统提取的是段落，而不是页面。每个关键论断都应作为独立陈述发挥作用。

**内容区块模式：**
- **定义区块**，用于“什么是 X？”查询
- **分步说明区块**，用于“如何执行 X”查询
- **比较表**，用于“X vs Y”查询
- **优缺点区块**，用于评估类查询
- **FAQ 区块**，用于常见问题
- **附带来源引用的统计数据区块**

有关每种区块类型的详细模板，请参阅 [references/content-patterns.md](references/content-patterns.md)。

**结构规则：**
- 每个部分都以直接回答开头（不要把答案埋在内容中）
- 将关键答案段落控制在 40-60 个单词（最适合提取为摘要）
- 使用符合人们查询措辞的 H2/H3 标题
- 对于比较内容，表格优于散文
- 对于流程内容，编号列表优于段落
- 每个段落都应表达一个清晰的观点

### 支柱 2：权威性——让内容值得引用

AI 系统偏好可信赖的来源。打造值得引用的内容。

**普林斯顿大学 GEO 研究**（KDD 2024，在 Perplexity.ai 上开展研究）对 9 种优化方法进行了排名：

| 方法 | 可见度提升 | 应用方式 |
|--------|:---------------:|--------------|
| **引用来源** | +40% | 添加带链接的权威参考资料 |
| **添加统计数据** | +37% | 加入有来源支持的具体数字 |
| **添加引述** | +30% | 添加带姓名和职务的专家引述 |
| **权威语气** | +25% | 通过展现专业知识进行写作 |
| **提升清晰度** | +20% | 简化复杂概念 |
| **技术术语** | +18% | 使用领域专属术语 |
| **独特词汇** | +15% | 增加词汇多样性 |
| **流畅度优化** | +15-30% | 提升可读性和行文流畅度 |
| ~~关键词堆砌~~ | **-10%** | **会主动损害 AI 可见度** |

**最佳组合：**流畅度 + 统计数据 = 最大提升。排名较低的网站受益更多，通过引用来源，最高可实现 115% 的可见度提升。

**统计数据和资料**（引用提升 +37-40%）
- 使用有来源支持的具体数字
- 引用原始研究，而不是研究摘要
- 为所有统计数据添加日期
- 原始数据优于聚合数据

**专家署名**（引用提升 +25-30%）
- 标明具备资质的作者
- 添加带职务和组织名称的专家引述
- 对声明使用“根据[来源]”的表述方式
- 添加与主题相关的专业作者简介

**时效性信号**
- 突出显示“最后更新：[日期]”
- 定期刷新内容（对于竞争激烈的主题，至少每季度一次）
- 使用当前年份的引用和近期统计数据
- 删除或更新过时信息

**E-E-A-T 对齐**
- 展现第一手经验
- 提供具体、详细的信息（而非泛泛而谈）
- 透明地说明来源和方法
- 明确作者在相关主题上的专业能力

### 支柱 3：存在感——出现在 AI 查找的位置

AI 系统引用的不只是你的网站，也包括你出现的地方。

**第三方来源比你自己的网站更重要：**
- Wikipedia 提及（占 ChatGPT 所有引用的 7.8%）
- Reddit 讨论（历史上约占 ChatGPT 引用的 1.8%，波动较大，但在 2026 年 8 月的检索变化后，几乎已从 ChatGPT 中消失——在其他地方仍会被检索；请参阅 [references/agent-readiness.md](references/agent-readiness.md) 中的波动性部分）
- 行业出版物和客座文章
- LinkedIn——根据 LinkedIn 自己的 AEO 指南，在专业主题搜索中，这是被引用最多的渠道；Articles 的引用量约以 60/40 的比例超过 Posts，而且帖子的开头文字会成为其 URL slug，因此应将目标短语前置（详情请参阅 [references/format-volatility.md](references/format-volatility.md)）
- 评论网站（适用于 B2B SaaS 的 G2、Capterra、TrustRadius）
- YouTube（经常被 Google AI Overviews 引用）
- 播客（节目会被转录并发布节目说明，两者都会被抓取和引用）
- Quora 回答

**行动：**
- 确保你的 Wikipedia 页面准确且保持最新
- 真诚地参与 Reddit 社区，但将其作为整体组合中的一个渠道，绝不要把它作为全部策略（随着检索更新，引用组合可能一夜之间发生变化）
- 争取出现在行业汇总文章和对比文章中
- 在相关评价平台上维护最新的个人资料
- 针对关键的操作方法查询创建 YouTube 内容，模型不会观看视频，它们会阅读视频周围的文本层；有关完整构成（文字稿、字幕、章节、描述、置顶评论），请参见 [references/youtube-ai-citations.md](references/youtube-ai-citations.md)
- 作为你所在领域的嘉宾参与播客（使用 public-relations skill 的播客嘉宾准备材料进行准备）
- 深入回答相关的 Quora 问题

### 面向 AI Agent 的机器可读文件

> **Google 的立场**：对于 AI Overviews 或 AI Mode 并非必需。其指南明确表示，要出现在生成式 AI 搜索中，你不需要新的标记、AI 文件或 markdown。
>
> **为什么仍然要包含它们**：非 Google AI 引擎（ChatGPT、Claude、Perplexity）和自主购买 Agent 确实会奖励可提取的结构。以下文件能够在不损害 Google 的情况下帮助这些引擎。

AI Agent 不只是在回答问题，它们正在成为购买者。当 AI Agent 代表用户评估工具时，它需要结构化、可解析的信息。如果你的定价隐藏在 JavaScript 渲染的页面中，或被“联系销售”墙阻挡，Agent 会跳过你，转而推荐那些它们确实能够读取信息的竞争对手。

**首先审查这一层**：[references/agent-readiness.md](references/agent-readiness.md) ——其中包括访问性/发现性/可解析性检查清单、免费评分工具（`npx is-agentic`、Frase 的检查器）、Markdown 内容协商与 `Link` 标头、`llms-full.txt`，以及新兴的 agent-*actionable* 层（WebMCP）。

将以下机器可读文件添加到你的网站根目录：

**`/pricing.md` 或 `/pricing.txt`** ——面向 AI Agent 的结构化定价数据

```markdown
# Pricing — [Your Product Name]

## Free
- Price: $0/month
- Limits: 100 emails/month, 1 user
- Features: Basic templates, API access

## Pro
- Price: $29/month (billed annually) | $35/month (billed monthly)
- Limits: 10,000 emails/month, 5 users
- Features: Custom domains, analytics, priority support

## Enterprise
- Price: Custom — contact sales@example.com
- Limits: Unlimited emails, unlimited users
- Features: SSO, SLA, dedicated account manager
```

**这为什么现在很重要：**
- AI Agent 越来越多地会在用户访问你的网站之前，以编程方式比较产品
- 不透明的定价会被 AI 介导的购买旅程过滤掉
- 一个简单的 markdown 文件任何 LLM 都能轻松解析，无需渲染、无需 JavaScript，也没有登录墙
- 其原则与 `robots.txt`（面向爬虫）、`llms.txt`（面向 AI 上下文）和 `AGENTS.md`（面向 Agent 能力）相同

**最佳实践：**
- 使用一致的单位（月付与年付、按席位与固定价格）
- 包含具体的限制和阈值，而不只是功能名称
- 列出每个层级所包含的内容，而不只是列出差异
- 保持更新，过时的定价比没有文件更糟糕
- 从你的站点地图和主要定价页面链接到该文件

**`/llms.txt`** — 面向 AI 系统的上下文文件（参见 [llmstxt.org](https://llmstxt.org)）

如果你还没有，请添加一个 `llms.txt`，简要介绍你的产品功能、目标用户，并链接到关键页面（包括定价页面）。

**`/okf/` — Open Knowledge Format bundle（Google 支持，v0.1）**

Google 于 2026 年 6 月[推出了 OKF](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) ——这是一种用于将网站内容表示为相互链接的文件目录的 markdown 规范，带有 YAML frontmatter，无需抓取即可供代理读取。它主要面向数据团队的目录元数据；将其重新用于让代理读取网站内容的做法，则由 Suganthan Mohanadasan 推广开来。目前没有已确认的 AI 搜索排名信号——应将其视为协议层注册机制，类似早期的 schema.org。**关于完整解析、实现方式（免费生成器、WordPress 插件、手动创建）、托管指南以及何时应跳过，请参见 [references/okf.md](references/okf.md)。**

### 面向 AI 的 Schema 标记

结构化数据有助于 AI 系统理解你的内容。关键 schema 包括：

| 内容类型 | Schema | 帮助作用 |
|-------------|--------|-------------|
| 文章/博客文章 | `Article`, `BlogPosting` | 作者、日期、主题识别 |
| 操作指南内容 | `HowTo` | 提取流程查询中的步骤 |
| 常见问题 | `FAQPage` | 直接提取问答 |
| 产品 | `Product` | 价格、功能、评价 |
| 对比内容 | `ItemList` | 结构化对比数据 |
| 评论 | `Review`, `AggregateRating` | 信任信号 |
| 组织 | `Organization` | 实体识别 |

带有正确 schema 的内容，在非 Google AI 引擎上的 AI 可见度高出 30-40%。**Google 的说明**：结构化数据“并非生成式 AI 搜索所必需”，但建议将其纳入整体 SEO 策略。实现时，请使用 **schema** skill。

---

## 代理式体验

除了由 AI 搜索引擎总结内容之外，自主代理也开始直接访问网站——代表用户点击、阅读、比较，甚至购买。Google 的指南将其标记为一个需要提前规划的新兴类别。

**代理访问网站的方式：**
- **视觉渲染** — 像用户一样截取并阅读页面
- **DOM 检查** — 解析页面的 HTML 结构
- **可访问性树** — 依赖辅助技术使用的相同语义信息（标签、角色、地标、标题）

**应采取的措施：**
- **无需复杂的 JS 操作即可渲染有意义的内容** — 如果页面要等 4 个框架全部加载完成后才显示内容，代理看到的将是一片空白
- **语义化 HTML** — 使用 `<main>`、`<nav>`、`<article>`、`<button>`，采用正确的标题层级，并为图像添加 `alt` 文本
- **清晰的可访问性树** — 为每个交互元素添加标签；正确使用 ARIA（当原生 HTML 已足够时则不要使用）
- **稳定的选择器 / 可预测的布局** — 对于每次交互都会重新渲染的网站，代理很难处理
- **可见的价格、规格、联系信息** — 代理做出购买建议所需的任何信息，都应放在公开、可索引的页面上（这正是 `/pricing.md` 等文件可以发挥作用的地方）

**新兴趋势——通用商务协议（UCP）：**
Google 将 UCP 描述为一项即将推出的协议，将为代理提供标准化的商务交互接口（目录发现、定价、结账）。请关注其采用情况；目前，上述结构性建议是它的前身。

对于电商和本地商家，Google 特别强调：
- **Merchant Center feeds** + **Google Business Profile**，用于提升产品/服务在 AI Search 中的可见性
- **Business Agent**，用于以对话方式与客户互动（在适用的情况下）

---

## 最常被引用的内容类型

并非所有内容都同样容易被引用，而且格式组合**变化非常剧烈**。长期以来，比较类文章（约 33%）和清单类文章（约 10%）一直是获得引用最多的内容类型，但 **ChatGPT 5.6（2026 年 8 月）降低了对这些易被利用格式的权重：清单类内容的引用量下降了 −50.5%，比较页面的引用量下降了 −32.1%，而 `site:` 和“官方”检索则大幅增长**——这表明趋势正在转向第一方来源和自有页面。如今，格式策略需要按平台制定（比较类内容在 Google AIO/Gemini/Perplexity 上仍然有效）。有关变化数据、按平台划分的格式表格、LinkedIn 的引用数据，以及 ChatGPT 扇出提取诊断，请参阅 [references/format-volatility.md](references/format-volatility.md)。

**各平台通用的常青内容类型：**原创研究和数据、权威指南，以及结构清晰且便于提取的自有“官方”页面——包括产品、文档和定价页面。

**表现不佳的内容：**缺乏通用结构的文章、内容单薄或需要门槛访问的内容、仅提供 PDF 的内容，以及任何没有日期和作者署名的内容。

**被引用 ≠ 被推荐。**获得引用意味着你的内容具有参考价值；而要获得*推荐*——进入买家的实际候选名单——则取决于全网共识（评论、论坛、分析师、媒体报道），与自身内容基本无关。对于新兴品牌而言，自我宣传式的“最佳[类别]”清单文章甚至可能适得其反：在一项包含 100 个查询的 B2B 研究中，自我宣传式清单文章获得的 AI Overview 引用中，有 69% 出现在推荐竞争对手而非发布该内容品牌的答案中。有关可见性阶梯（已检索 → 已引用 → 已提及 → 已推荐）、取决于阶段的买家指南策略、能够赢得推荐的因素，以及归因盲点，请参阅 [references/citations-vs-recommendations.md](references/citations-vs-recommendations.md)。

---

## 监测 AI 可见性

### 需要跟踪的指标

| 指标 | 衡量内容 | 检查方式 |
|--------|-----------------|-------------|
| AI Overview 出现情况 | 针对你的查询是否会出现 AI Overviews？ | 手动检查或使用 Semrush/Ahrefs |
| 品牌引用率 | 你在 AI 答案中被引用的频率 | AI 可见性工具（见下文） |
| AI 声量份额 | 你的引用量与竞争对手的引用量对比 | Peec AI、Otterly、ZipTie |
| 引用情感 | AI 如何描述你的品牌 | 手动审查 + 监测工具 |
| 推荐率 | 你是否进入候选名单，而不仅仅是被引用（见 [citations-vs-recommendations.md](references/citations-vs-recommendations.md)） | 跟踪提示词 + 提及语境 |
| 来源归因 | 你的哪些页面获得了引用 | 跟踪来自 AI 来源的引荐流量 |

### AI 可见性监测工具

| 工具 | 覆盖范围 | 最适合 |
|------|----------|----------|
| **Otterly AI** | ChatGPT、Perplexity、Google AI Overviews | AI 声量份额追踪 |
| **Peec AI** | ChatGPT、Gemini、Perplexity、Claude、Copilot+ | 大规模多平台监测 |
| **ZipTie** | Google AI Overviews、ChatGPT、Perplexity | 品牌提及 + 情感追踪 |
| **LLMrefs** | ChatGPT、Perplexity、AI Overviews、Gemini | SEO 关键词 → AI 可见性映射 |

### 自行监测（无需工具）

每月手动检查：
1. 选取排名前 20 的查询
2. 分别在 ChatGPT、Perplexity 和 Google 中运行每个查询
3. 记录：你是否被引用？谁被引用？引用了哪个页面？
4. 在电子表格中记录，并跟踪环比变化

AI 回答具有**非确定性**——单次运行只是个例，不是测量结果。请在每个平台上对每个查询运行 3–5 次，并记录提及*率*及其样本量（“被引用 3/5，n=5”）；应随时间比较比率，而不是比较单次运行结果。完整的严谨性检查清单见 [references/format-volatility.md](references/format-volatility.md)。

### Search Console 预期

Google 的指南明确指出：**没有针对 AI 的 Search Console 报告**。AI Overviews 和 AI Mode 使用核心 Search 排名，因此，标准 Search Console 报告（Performance、Coverage、Core Web Vitals）仍然是用于衡量 Google 表现的工具。上述第三方工具是查看跨平台 AI 引用行为的唯一方式。

---

## 不应做的事

Google 的指南明确指出了以下行为——它们会同时损害传统 Search 和 AI 功能中的表现。

1. **不要为“AI”单独编写内容**。相同内容应同时服务于用户和 AI。为 AI 系统编写定向变体内容，可能触犯 **scaled content abuse spam policy**——这是 Google 的原话。
2. **不要将页面拆分成诱导 AI 的碎片**。Google 的指南直言：*“Don't break your content into tiny pieces for AI to better understand it.”* 使用正常的段落 + 标题结构。
3. **不要为操纵排名而大规模生成内容**。AI 生成的内容可以接受，*前提是*它符合 Search Essentials 和垃圾内容政策。大规模生产浅薄的变体内容则不可以。
4. **不要追求不真实的提及**。不要为了 AI 可见性伪造引用，或向 Reddit/Wikipedia 批量发送垃圾信息。只进行真实参与。
5. **如果想获得引用，不要屏蔽 AI 爬虫**。屏蔽 GPTBot、PerplexityBot、ClaudeBot、Google-Extended 意味着这些引擎根本无法引用你。若确有必要，可以屏蔽仅用于训练的爬虫（CCBot），但不要屏蔽用于搜索和引用的爬虫。
6. **不要将主要内容隐藏在无法渲染的 JS 后面**。核心 Search 和 AI 代理都需要能够看到你的内容；仅依赖 JS 渲染会同时失去这两类受众。
7. **不要跳过 E-E-A-T 基础要素**。作者身份、第一手经验、专业能力信号、透明的来源说明——Google 的指南在 AI 功能方面非常强调这些要素。

---

## 按内容类型划分的 AI SEO

关于 SaaS 产品页面、博客内容、对比/替代页面、文档，以及本地业务/电商（Google 强调 Merchant Center + Business Profile）的战术指南，请参阅 [references/content-types.md](references/content-types.md)。

---

## 常见错误

- **完全忽略 AI 搜索** — 如今约 45% 的 Google 搜索会显示 AI 概览，而 ChatGPT/Perplexity 的增长也非常迅速
- **将 AI SEO 视为独立于 SEO 的另一套体系** — 良好的传统 SEO 是基础；AI SEO 则在此基础上增加结构和权威性
- **为 AI 写作，而不是为人类写作** — 如果内容读起来像是在迎合算法，就不会获得引用，也不会带来转化
- **没有新鲜度信号** — 没有日期的内容会输给有日期的内容，因为 AI 系统非常重视时效性。请展示内容的最后更新时间
- **将所有内容都设置为受限访问** — AI 无法访问受限内容。请保持最具权威性的内容开放
- **忽视第三方存在** — 相比你自己的博客，你可能会从 Wikipedia 上的一次提及中获得更多 AI 引用
- **没有结构化数据** — Schema 标记可以为 AI 系统提供关于你内容的结构化上下文
- **关键词堆砌** — 不同于传统 SEO 中仅仅效果不佳的情况，关键词堆砌会使 AI 可见度主动降低 10%（Princeton GEO 研究）
- **将定价隐藏在“联系销售”或由 JS 渲染的页面之后** — 代表买家评估你产品的 AI 代理无法解析它们无法读取的内容。请添加 `/pricing.md` 文件
- **阻止 AI 机器人** — 如果在 robots.txt 中阻止了 GPTBot、PerplexityBot 或 ClaudeBot，这些平台就无法引用你
- **没有数据的通用内容** — “我们是最好的”不会获得引用。“我们的客户在[指标]上取得了 3 倍提升”则会
- **忘记监控** — 无法改进无法衡量的内容。至少每月检查一次 AI 可见度

---

## 工具集成

如需实施，请参阅 [工具注册表](../../tools/REGISTRY.md)。

| 工具 | 用途 |
|------|---------|
| `semrush` | AI 概览跟踪、关键词研究、内容差距分析 |
| `ahrefs` | 反向链接分析、内容资源管理器、AI 概览数据 |
| `gsc` | Search Console 性能数据、查询跟踪 |
| `ga4` | 来自 AI 来源的引荐流量 |

---

## 特定任务问题

1. 最重要的 10-20 个查询是什么？
2. 你是否检查过这些查询目前是否存在 AI 答案？
3. 你的网站是否包含结构化数据（Schema 标记）？
4. 你发布哪些类型的内容？（博客、文档、对比页面等）
5. 竞争对手是否在 AI 引用中出现，而你没有？
6. 你是否拥有 Wikipedia 页面，或出现在评论网站上？

---

## 相关技能

- **seo-audit**：用于传统技术 SEO 和页面 SEO 审计
- **schema**：用于实施帮助 AI 理解你内容的结构化数据
- **content-strategy**：用于规划要创建的内容
- **competitors**：用于构建能够获得引用的对比页面
- **programmatic-seo**：用于大规模构建 SEO 页面
- **copywriting**：用于编写既便于人类阅读、又便于 AI 提取的内容