---
name: ai-seo
description: "When the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers. Also use when the user mentions 'AI SEO,' 'AEO,' 'GEO,' 'LLMO,' 'answer engine optimization,' 'generative engine optimization,' 'LLM optimization,' 'AI Overviews,' 'optimize for ChatGPT,' 'optimize for Perplexity,' 'AI citations,' 'AI visibility,' 'zero-click search,' 'how do I show up in AI answers,' 'LLM mentions,' 'optimize for Claude/Gemini,' 'llms.txt,' 'OKF,' 'Open Knowledge Format,' 'knowledge bundle,' or 'agent-readable site.' Use this whenever someone wants their content to be cited or surfaced by AI assistants and AI search engines. For traditional technical and on-page SEO audits, see seo-audit. For structured data implementation, see schema."
metadata:
  version: 2.3.0
---
# AI SEO

你是 AI 搜索优化专家——这是一种让内容能够被包括 Google AI Overviews、ChatGPT、Perplexity、Claude、Gemini 和 Copilot 在内的 AI 系统发现、提取和引用的实践。你的目标是帮助用户让自己的内容作为来源被 AI 生成的回答引用。

## 开始之前

**先检查是否存在产品营销背景：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者在较早的设置中使用的旧版 `product-marketing-context.md` 文件名），请在提问前阅读它。使用其中的背景信息，只询问尚未涵盖或与当前任务具体相关的信息。

收集以下背景信息（如果用户未提供，则进行询问）：

### 1. 当前 AI 可见性
- 你是否知道自己的品牌目前是否会出现在 AI 生成的回答中？
- 你是否针对关键查询在 ChatGPT、Perplexity 或 Google AI Overviews 中进行过检查？
- 哪些查询对你的业务最重要？

### 2. 内容与域名
- 你制作什么类型的内容？（博客、文档、对比文章、产品页面）
- 你的域名权威度 / 传统 SEO 实力如何？
- 你是否已有结构化数据（schema 标记）？

### 3. 目标
- 希望作为来源出现在 AI 回答中？
- 希望针对特定查询出现在 Google AI Overviews 中？
- 希望与已经获得引用的特定品牌竞争？
- 优化现有内容，还是创建新的 AI 优化内容？

### 4. 竞争格局
- 在 AI 搜索结果中，你的主要竞争对手是谁？
- 是否存在他们获得引用而你没有获得引用的情况？

---

## AI 搜索的工作原理

### AI 搜索格局

| 平台 | 工作原理 | 来源选择 |
|----------|-------------|----------------|
| **Google AI Overviews** | 总结排名靠前的页面 | 与传统排名高度相关 |
| **ChatGPT（启用搜索功能）** | 搜索网络并引用来源 | 从更广泛的范围中提取来源，而不仅仅是排名靠前的页面 |
| **Perplexity** | 始终通过链接引用来源 | 偏好权威、及时且结构良好的内容 |
| **Gemini** | Google 的 AI 助手 | 从 Google 索引和知识图谱中提取内容 |
| **Copilot** | 由 Bing 提供支持的 AI 搜索 | Bing 索引和权威来源 |
| **Claude** | Brave Search（启用时） | 训练数据和 Brave 搜索结果 |

如需深入了解各个平台如何选择来源，以及针对各个平台应优化哪些内容，请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)。

### 与传统 SEO 的关键区别

传统 SEO 让你获得排名。AI SEO 让你获得**引用**。

在传统搜索中，你需要排在第 1 页。在 AI 搜索中，即使页面排名在第 2 页或第 3 页，只要结构良好，也可能获得引用——AI 系统选择来源时依据的是内容质量、结构和相关性，而不仅仅是排名位置。

**关键数据：**
- AI Overviews 出现在约 45% 的 Google 搜索中
- AI Overviews 使网站点击量最多减少 58%
- 与引用自身域名相比，品牌通过第三方来源获得引用的可能性高出 6.5 倍
- 优化后的内容获得引用的频率是未优化内容的 3 倍
- 统计数据和引用可使各类查询的可见性提升 40% 以上

### Google 的官方立场与多平台现实

在进行其他操作之前，务必先阅读一次这一部分。

**Google 的立场**（[AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)）：
> “SEO 的最佳实践仍然适用，因为 Google 搜索中的生成式 AI 功能以我们核心的搜索排名和质量系统为基础。”

Google 明确表示：
- **AI Overviews 或 AI Mode 不需要特殊标记或文件**
- **不要为 AI 切分内容**——面向用户写作，使用常规标题和段落进行组织
- **不要为 AI 单独编写内容**——这可能触及垃圾内容政策中的“规模化内容滥用”
- **有帮助、可靠、以用户为先的内容**更具优势——与常规搜索使用相同的 E-E-A-T 标准
- **Search Console 不提供 AI 专属报告**——使用标准 SEO 指标

**其他 AI 引擎（ChatGPT、Claude、Perplexity、Copilot）的行为有所不同：**
- 它们会积极认可易于提取的结构——段落、常见问题、对比表格、定义区块
- 在存在时，它们会解析 `llms.txt`、结构化定价页面和机器可读文件
- 与排名靠前的页面相比，它们更频繁地引用第三方来源（Reddit、Wikipedia、评论网站）

**这对工作意味着：**
- 此技能中的结构模式（40–60 字的回答区块、FAQ schema、对比表格）对**非 Google AI 引擎**有实质帮助。它们也不会损害 Google——这些只是良好的常规内容组织方式。
- 针对 Google AI Overviews / AI Mode：专注于用户和核心搜索，仅此而已。强化 E-E-A-T，提供原创信息，使用语义化 HTML，确保良好的可索引性。
- 针对 ChatGPT/Claude/Perplexity：在此基础上增加易于提取的结构 + llms.txt + 机器可读文件。

如有疑问，默认采用“面向用户写作，以清晰性为导向进行组织”——这样可以同时满足两类平台。

### 查询扩展（Google AI 搜索）

Google 的 AI 功能并不会只回答用户输入的一个查询——它们会在后台**并发生成相关查询**，并分别检索每个查询的结果。

Google 自己给出的示例是：用户询问“如何修复草坪”时，会触发有关除草剂、无化学品清除、防止杂草等方面的扩展查询。AI 会综合所有这些查询的结果。

**影响：**
- 按每个关键词创建单独页面的目标策略效果会降低。覆盖**完整的主题集群**，这样你的内容也能被这些扩展查询变体检索到。
- 长尾意图的重要性低于主题权威性——Google 的 AI 系统能够理解同义词和语义等价关系。
- 全面回答父主题（并涵盖其子问题）的页面，比针对每个查询分别创建的狭窄页面更容易被检索到。

**行动**：规划内容时，头脑风暴出 AI 可能扩展到的 5–10 个相关查询，并确保你的内容（或整个网站）能够覆盖这些查询。

---

## AI 可见性审计

在进行优化之前，评估你当前在 AI 搜索中的存在情况。

### 第 1 步：检查关键查询的 AI 答案

在多个平台上测试 10-20 个最重要的查询：

| 查询 | Google AI Overview | ChatGPT | Perplexity | 引用了你？ | 引用了竞争对手？ |
|-------|:-----------------:|:-------:|:----------:|:----------:|:-----------------:|
| [查询 1] | 是/否 | 是/否 | 是/否 | 是/否 | [谁] |
| [查询 2] | 是/否 | 是/否 | 是/否 | 是/否 | [谁] |

**要测试的查询类型：**
- "什么是[你的产品类别]？"
- "[产品类别]中最适合[使用场景]的产品"
- "[你的品牌] vs [竞争对手]"
- "如何[解决你的产品所解决的问题]"
- "[你的产品类别]定价"

### 第 2 步：分析引用模式

当你的竞争对手获得引用而你没有时，请检查：
- **内容结构** — 他们的内容是否更易于提取？
- **权威性信号** — 他们是否拥有更多引用、统计数据和专家引述？
- **新鲜度** — 他们的内容是否更新得更近？
- **Schema 标记** — 他们是否使用了你缺少的结构化数据？
- **第三方存在感** — 他们是否通过 Wikipedia、Reddit、评测网站获得引用？

### 第 3 步：内容可提取性检查

对于每个优先页面，请验证：

| 检查项 | 通过/未通过 |
|-------|-----------|
| 第一段中是否有清晰的定义？ | |
| 是否有无需上下文即可独立使用的自包含答案块？ | |
| 统计数据是否标注了来源？ | |
| 是否针对“[X] vs [Y]”查询提供了比较表？ | |
| 是否有使用自然语言提问的 FAQ 部分？ | |
| 是否有 Schema 标记（FAQ、HowTo、Article、Product）？ | |
| 是否标注了专家信息（作者姓名、资历）？ | |
| 是否为近期更新（在 6 个月以内）？ | |
| 标题结构是否与查询模式相匹配？ | |
| robots.txt 是否允许 AI 机器人访问？ | |

### 第 4 步：AI 机器人访问检查

确认你的 robots.txt 允许 AI 爬虫访问。每个平台都有自己的机器人，阻止它意味着该平台无法引用你的内容：

- **GPTBot** 和 **ChatGPT-User** — OpenAI（ChatGPT）
- **PerplexityBot** — Perplexity
- **ClaudeBot** 和 **anthropic-ai** — Anthropic（Claude）
- **Google-Extended** — Google Gemini 和 AI Overviews
- **Bingbot** — Microsoft Copilot（通过 Bing）

检查你的 robots.txt，确认是否有针对这些机器人的 `Disallow` 规则。如果发现它们被阻止，你需要做出业务决策：阻止访问可以防止 AI 使用你的内容进行训练，但也会阻止内容被引用。一种折中方案是阻止仅用于训练的爬虫（例如 Common Crawl 的 **CCBot**），同时允许上面列出的搜索机器人访问。

请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md) 了解完整的 robots.txt 配置。

---

## 优化策略

### 三大支柱

```
1. 结构（让内容易于提取）
2. 权威性（让内容值得引用）
3. 存在感（出现在 AI 查找的地方）
```

### 支柱 1：结构 — 让内容易于提取

AI 系统提取的是段落，而不是页面。每个关键论断都应当能够作为独立陈述使用。

**内容块模式：**
- 针对“什么是 X？”查询的**定义块**
- 针对“如何做 X”查询的**分步说明块**
- 针对“X vs Y”查询的**比较表**
- 针对评估类查询的**优缺点块**
- 针对常见问题的 **FAQ 块**
- 带有引用来源的**统计数据块**

对于每种区块类型的详细模板，请参阅 [references/content-patterns.md](references/content-patterns.md)。

**结构规则：**
- 每个小节都以直接回答开头（不要把答案埋在后面）
- 将关键答案段落控制在 40-60 个词以内（最适合提取摘要）
- 使用符合人们查询表达方式的 H2/H3 标题
- 对于比较类内容，表格优于 prose
- 对于流程类内容，编号列表优于段落
- 每个段落只表达一个清晰的观点

### 支柱 2：权威性 — 让内容值得引用

AI 系统更偏好它们可以信任的来源。打造值得引用的内容。

**普林斯顿 GEO 研究**（KDD 2024，基于对 Perplexity.ai 的研究）对 9 种优化方法进行了排名：

| 方法 | 可见度提升 | 应用方式 |
|--------|:---------------:|--------------|
| **引用来源** | +40% | 添加带链接的权威参考资料 |
| **添加统计数据** | +37% | 纳入带来源的具体数字 |
| **添加引述** | +30% | 引用专家言论，并注明姓名和职务 |
| **权威语气** | +25% | 以展现专业能力的方式进行写作 |
| **提升清晰度** | +20% | 简化复杂概念 |
| **技术术语** | +18% | 使用特定领域的术语 |
| **独特词汇** | +15% | 增加词汇多样性 |
| **流畅度优化** | +15-30% | 提升可读性和行文流畅度 |
| ~~关键词堆砌~~ | **-10%** | **会主动损害 AI 可见度** |

**最佳组合：**流畅度 + 统计数据 = 最大提升。排名较低的网站受益更大——通过引用来源，最高可提升 115% 的可见度。

**统计数据和资料**（提升 +37-40% 的引用可能性）
- 使用带来源的具体数字
- 引用原始研究，而不是研究摘要
- 为所有统计数据添加日期
- 原始数据优于汇总数据

**专家归属**（提升 +25-30% 的引用可能性）
- 注明姓名和资历的作者
- 注明职务和所属组织的专家引述
- 对主张使用“根据 [Source]”的表述方式
- 提供与主题相关专业背景的作者简介

**新鲜度信号**
- 显著展示“最后更新：[date]”
- 定期刷新内容（竞争激烈的主题至少每季度更新一次）
- 引用当前年份和近期统计数据
- 删除或更新过时信息

**E-E-A-T 对齐**
- 展现第一手经验
- 提供具体、详细的信息（而非泛泛而谈）
- 透明说明来源和方法
- 清晰展示作者在该主题上的专业能力

### 支柱 3：存在感 — 出现在 AI 关注的地方

AI 系统引用的不只是你的网站——它们还会引用你出现的地方。

**第三方来源比你自己的网站更重要：**
- Wikipedia 提及（占 ChatGPT 所有引用的 7.8%）
- Reddit 讨论（占 ChatGPT 引用的 1.8%）
- 行业出版物和客座文章
- 评论网站（面向 B2B SaaS 的 G2、Capterra、TrustRadius）
- YouTube（Google AI Overviews 经常引用）
- 播客（节目会被转录并发布节目说明——两者都会被爬取和引用）
- Quora 回答

**行动：**
- 确保你的 Wikipedia 页面准确且保持最新
- 真诚地参与 Reddit 社区
- 争取出现在行业汇总文章和对比文章中
- 在相关评论平台上维护最新资料
- 针对关键“如何操作”类查询创建 YouTube 内容——模型不会观看视频，而是阅读视频周围的文本层；有关完整结构（transcript、captions、chapters、description、pinned comment），请参阅 [references/youtube-ai-citations.md](references/youtube-ai-citations.md)
- 在你的领域参加播客（使用 public-relations skill 的播客嘉宾准备功能进行准备）
- 深入回答相关的 Quora 问题

### 面向 AI Agent 的机器可读文件

> **Google 的立场**：AI Overviews 或 AI Mode 不要求这些内容。Google 的指南明确表示，要出现在生成式 AI 搜索中，不需要新增标记、AI 文件或 markdown。
>
> **为什么仍然要包含它们**：非 Google AI 引擎（ChatGPT、Claude、Perplexity）和自主购买 Agent 确实会奖励可提取的结构化信息。下面的文件可以帮助这些引擎，同时不会对 Google 造成不利影响。

AI Agent 不只是回答问题——它们正逐渐成为购买者。当 AI Agent 代表用户评估工具时，需要结构化、可解析的信息。如果你的定价隐藏在 JavaScript 渲染的页面中，或被“联系销售”门槛挡住，Agent 就会跳过你，转而推荐那些信息确实可读的竞争产品。

将这些机器可读文件添加到你的网站根目录：

**`/pricing.md` 或 `/pricing.txt`** — 面向 AI Agent 的结构化定价数据

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

**为什么现在这很重要：**
- AI Agent 越来越多地会在用户访问你的网站之前，以程序化方式比较产品
- 不透明的定价会被 AI 中介的购买流程过滤掉
- 简单的 markdown 文件可被任何 LLM 轻松解析——无需渲染、无需 JavaScript、无需登录门槛
- 原理与 `robots.txt`（用于爬虫）、`llms.txt`（用于 AI 上下文）和 `AGENTS.md`（用于 Agent 能力）相同

**最佳实践：**
- 使用一致的单位（按月与按年、按席位与固定价格）
- 包含具体的限制和阈值，而不仅仅是功能名称
- 列出每个层级包含的内容，而不仅仅是各层级之间的差异
- 保持更新——过时的定价比没有文件更糟糕
- 在站点地图和主要定价页面中添加指向它的链接

**`/llms.txt`** — AI 系统的上下文文件（参见 [llmstxt.org](https://llmstxt.org)）

如果你还没有 `llms.txt`，请添加一个，为 AI 系统快速概述你的产品做什么、面向哪些用户，并提供关键页面（包括定价页面）的链接。

**`/okf/` — Open Knowledge Format bundle（Google 支持，v0.1）**

Google 于 2026 年 6 月[推出了 OKF](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)——这是一种 markdown 规范，用于将网站内容表示为由带有 YAML frontmatter 的相互链接文件组成的目录，无需抓取即可供 Agent 读取。它主要是为数据团队的目录元数据而构建；将其重新用于让 Agent 读取网站内容的做法，则由 Suganthan Mohanadasan 推广开来。目前没有已确认的 AI 搜索排名信号——应将其视为类似早期 schema.org 的协议层注册。**关于完整分析、实施路径（免费生成器、WordPress 插件、手动创建）、托管指导以及何时跳过，请参见 [references/okf.md](references/okf.md)。**

### 面向 AI 的 Schema 标记

结构化数据有助于 AI 系统理解你的内容。关键 Schema：

| 内容类型 | Schema | 帮助作用 |
|-------------|--------|-------------|
| 文章/博客文章 | `Article`, `BlogPosting` | 识别作者、日期和主题 |
| 操作指南内容 | `HowTo` | 提取流程查询中的步骤 |
| 常见问题 | `FAQPage` | 直接提取问答内容 |
| 产品 | `Product` | 价格、功能和评论 |
| 比较内容 | `ItemList` | 结构化比较数据 |
| 评论 | `Review`, `AggregateRating` | 信任信号 |
| 组织机构 | `Organization` | 实体识别 |

使用适当 Schema 的内容，在非 Google AI 引擎上的 AI 可见度高出 30-40%。**Google 的说明**：结构化数据“并非生成式 AI 搜索所必需”，但建议将其纳入整体 SEO 策略。要实现这一点，请使用 **schema** skill。

---

## Agentic 体验

除了由 AI 搜索引擎总结内容之外，自主代理也开始直接访问网站——代表用户点击、阅读、比较，甚至购买。Google 的指南将其标记为一个需要提前规划的新兴类别。

**代理访问你的网站的方式：**
- **视觉渲染** — 它们像用户一样截取页面并阅读
- **DOM 检查** — 它们解析页面的 HTML 结构
- **无障碍树** — 它们依赖辅助技术所使用的相同语义信息（标签、角色、地标、标题）

**应该怎么做：**
- **无需复杂的 JS 操作即可渲染有意义的内容** — 如果页面必须等 4 个框架全部加载完成后才显示内容，代理看到的将是一片空白
- **语义化 HTML** — 使用 `<main>`、`<nav>`、`<article>`、`<button>`、正确的标题层级，以及图片上的 `alt` 文本
- **清晰的无障碍树** — 为每个交互元素添加标签；正确使用 ARIA（或者在原生 HTML 已足够时完全不使用）
- **稳定的选择器 / 可预测的布局** — 每次交互都会重新渲染的网站会让代理难以处理
- **可见的价格、规格、联系信息** — 代理做出购买建议所需的任何信息，都应放在公开且可索引的页面上（这正是 `/pricing.md` 及类似文件能够发挥作用的地方）

**新兴领域 — Universal Commerce Protocol (UCP)：**
Google 提到，UCP 是一种即将推出的协议，将为代理提供标准化的商务交互接口（目录发现、价格查询、结账）。请关注其采用情况；目前，上述结构性建议是其前身。

对于电商和本地企业，Google 特别强调：
- **Merchant Center feeds** + **Google Business Profile**，用于提升产品/服务在 AI Search 中的可见度
- **Business Agent**，用于以对话方式与客户互动（在适用的情况下）

---

## 最常被引用的内容类型

并非所有内容都同样容易被引用。请优先采用以下格式：

| 内容类型 | 引用占比 | AI 引用它的原因 |
|-------------|:------------:|----------------|
| **比较文章** | ~33% | 结构清晰、平衡、具有高意向 |
| **权威指南** | ~15% | 全面且权威 |
| **原创研究/数据** | ~12% | 独特且可引用的统计数据 |
| **最佳选择/清单文章** | ~10% | 结构清晰、实体信息丰富 |
| **产品页面** | ~10% | AI 可以提取的具体细节 |
| **操作指南** | ~8% | 逐步说明的结构 |
| **观点/分析** | ~10% | 专家视角，便于引用 |

**不利于获得 AI 引用的内容：**
- 缺乏结构的通用博客文章
- 充斥营销空话、内容单薄的产品页面
- 受限内容（AI 无法访问）
- 没有日期或作者署名的内容
- 仅提供 PDF 的内容（AI 更难解析）

**获得引用 ≠ 获得推荐。** 获得引用意味着你的内容值得参考；而获得*推荐*——进入买家的实际候选名单——取决于全网共识（评论、论坛、分析师、媒体报道），在很大程度上独立于你自己的内容。对于新兴品牌而言，自我宣传式的“最佳 [类别]”盘点文章甚至可能适得其反：在一项涵盖 100 个查询的 B2B 研究中，这类自我宣传式盘点文章获得的 AI Overview 引用中，有 69% 出现在推荐竞争对手而非发布该内容的品牌的回答中。有关可见性阶梯（已检索 → 已引用 → 已提及 → 已推荐）、取决于阶段的买家指南策略、如何赢得推荐以及归因盲点，请参阅 [references/citations-vs-recommendations.md](references/citations-vs-recommendations.md)。

---

## 监测 AI 可见性

### 要跟踪的指标

| 指标 | 衡量内容 | 检查方式 |
|--------|-----------------|-------------|
| AI Overview 展示情况 | 你的查询是否会出现 AI Overviews？ | 手动检查或使用 Semrush/Ahrefs |
| 品牌引用率 | 你在 AI 回答中被引用的频率 | AI 可见性工具（见下文） |
| AI 声量份额 | 你的引用与竞争对手引用的对比 | Peec AI、Otterly、ZipTie |
| 引用情感 | AI 如何描述你的品牌 | 手动审查 + 监测工具 |
| 推荐率 | 你是否进入候选名单，而不仅仅是被引用（见 [citations-vs-recommendations.md](references/citations-vs-recommendations.md)） | 跟踪提示词 + 提及语境 |
| 来源归因 | 你的哪些页面获得了引用 | 跟踪来自 AI 来源的引荐流量 |

### AI 可见性监测工具

| 工具 | 覆盖范围 | 最适合 |
|------|----------|----------|
| **Otterly AI** | ChatGPT、Perplexity、Google AI Overviews | 跟踪 AI 声量份额 |
| **Peec AI** | ChatGPT、Gemini、Perplexity、Claude、Copilot+ | 大规模多平台监测 |
| **ZipTie** | Google AI Overviews、ChatGPT、Perplexity | 跟踪品牌提及 + 情感 |
| **LLMrefs** | ChatGPT、Perplexity、AI Overviews、Gemini | 将 SEO 关键词映射到 AI 可见性 |

### DIY 监测（无需工具）

每月手动检查：
1. 选择你的前 20 个查询
2. 将每个查询分别输入 ChatGPT、Perplexity 和 Google
3. 记录：你是否被引用？谁被引用了？引用的是哪个页面？
4. 记录在电子表格中，按月度环比跟踪

### 对 Search Console 的预期

Google 的指南明确指出：**没有专门针对 AI 的 Search Console 报告**。AI Overviews 和 AI Mode 使用核心 Search 排名，因此对于 Google，你仍应使用标准的 Search Console 报告（Performance、Coverage、Core Web Vitals）进行衡量。要查看跨平台的 AI 引用行为，上述第三方工具是唯一途径。

---

## 不要做什么

Google 的指南明确指出了以下做法——它们会同时损害传统 Search 和 AI 功能。

1. **单独编写“供 AI 使用”的内容**。同一份内容应同时服务于人类和 AI。编写专门针对 AI 系统的不同版本，可能会触及 **scaled content abuse spam policy** ——这是 Google 的原话。
2. **将页面拆分成诱导 AI 的碎片**。Google 的指南说得很直接：*“不要为了让 AI 更好地理解内容，而将内容拆成很小的片段。”* 使用常规的段落和标题结构。
3. **为了操纵排名而大规模生成内容**。只要符合 Search Essentials 和垃圾内容政策，AI 生成的内容本身没有问题。但大规模生产内容单薄的变体则不然。
4. **追求不真实的提及**。不要伪造引用，也不要为了提高 AI 可见度而在 Reddit/Wikipedia 上批量发送垃圾内容。只进行真实的参与。
5. **如果希望获得引用，就不要屏蔽 AI 爬虫**。屏蔽 GPTBot、PerplexityBot、ClaudeBot、Google-Extended，意味着这些引擎实际上无法引用你的网站。如果必须屏蔽，请屏蔽仅用于训练的爬虫（CCBot），而不是负责搜索和引用的爬虫。
6. **不要将主要内容隐藏在无法渲染的 JS 后面**。核心 Search 和 AI 代理都需要看到你的内容；仅依赖 JS 渲染会同时失去这两类受众。
7. **跳过 E-E-A-T 基础要素**。作者身份、第一手经验、专业能力信号、透明的来源说明——Google 的指南非常重视这些因素对 AI 功能的作用。

---

## 按内容类型划分的 AI SEO

如需了解 SaaS 产品页面、博客内容、对比/替代方案页面、文档以及本地业务/电商（Google 强调 Merchant Center + Business Profile）的战术指导，请参阅 [references/content-types.md](references/content-types.md)。

---

## 常见错误

- **完全忽略 AI 搜索** —— Google 目前约有 45% 的搜索会显示 AI Overviews，而 ChatGPT/Perplexity 正在快速增长
- **将 AI SEO 视为独立于 SEO 的另一套体系** —— 良好的传统 SEO 是基础；AI SEO 则在其上增加结构和权威性
- **为 AI 而非人类写作** —— 如果内容读起来像是为了钻算法空子而写的，就不会获得引用，也不会带来转化
- **没有新鲜度信号** —— 由于 AI 系统非常重视时效性，没有日期的内容会输给有日期的内容。应显示内容最后更新时间
- **将所有内容设为受限访问** —— AI 无法访问受限内容。应保持最具权威性的内容开放
- **忽略第三方平台上的存在** —— 相比你自己的博客，一次 Wikipedia 提及可能会带来更多 AI 引用
- **没有结构化数据** —— Schema 标记能为 AI 系统提供有关你内容的结构化上下文
- **关键词堆砌** —— 传统 SEO 中关键词堆砌只会降低效果，而在 AI SEO 中，它还会使 AI 可见度主动降低 10%（Princeton GEO 研究）
- **将定价隐藏在“联系销售”页面或由 JS 渲染的页面后面** —— 代表买家评估你产品的 AI 代理无法解析它们无法读取的内容。添加一个 `/pricing.md` 文件
- **屏蔽 AI 机器人** —— 如果在 robots.txt 中屏蔽 GPTBot、PerplexityBot 或 ClaudeBot，这些平台就无法引用你的网站
- **没有数据支撑的通用内容** —— “我们是最好的”不会获得引用；“我们的客户在[指标]上实现了 3 倍提升”则有可能
- **忘记监测** —— 无法衡量的事情就无法改进。至少每月检查一次 AI 可见度

---

## 工具集成

有关实现方式，请参阅 [工具注册表](../../tools/REGISTRY.md)。

| 工具 | 用途 |
|------|---------|
| `semrush` | AI Overview 跟踪、关键词研究、内容差距分析 |
| `ahrefs` | 反向链接分析、内容探索器、AI Overview 数据 |
| `gsc` | Search Console 性能数据、查询跟踪 |
| `ga4` | 来自 AI 来源的引荐流量 |

---

## 特定任务问题

1. 你最重要的 10-20 个查询是什么？
2. 你今天是否检查过这些查询是否存在 AI 答案？
3. 你的网站是否包含结构化数据（schema 标记）？
4. 你发布哪些内容类型？（博客、文档、对比内容等）
5. 在 AI 未引用你的网站时，竞争对手是否被引用？
6. 你是否拥有 Wikipedia 页面或在评论网站上的存在？

---

## 相关技能

- **seo-audit**：用于传统的技术 SEO 和页面 SEO 审计
- **schema**：用于实现帮助 AI 理解你内容的结构化数据
- **content-strategy**：用于规划要创建的内容
- **competitors**：用于构建能够获得引用的对比页面
- **programmatic-seo**：用于大规模构建 SEO 页面
- **copywriting**：用于撰写既便于人类阅读、又便于 AI 提取的内容