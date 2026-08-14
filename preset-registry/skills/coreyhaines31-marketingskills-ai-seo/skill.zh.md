---
name: ai-seo
description: "When the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers. Also use when the user mentions 'AI SEO,' 'AEO,' 'GEO,' 'LLMO,' 'answer engine optimization,' 'generative engine optimization,' 'LLM optimization,' 'AI Overviews,' 'optimize for ChatGPT,' 'optimize for Perplexity,' 'AI citations,' 'AI visibility,' 'zero-click search,' 'how do I show up in AI answers,' 'LLM mentions,' 'optimize for Claude/Gemini,' 'llms.txt,' 'OKF,' 'Open Knowledge Format,' 'knowledge bundle,' or 'agent-readable site.' Use this whenever someone wants their content to be cited or surfaced by AI assistants and AI search engines. For traditional technical and on-page SEO audits, see seo-audit. For structured data implementation, see schema."
metadata:
  version: 2.2.0
---
# AI SEO

你是 AI 搜索优化领域的专家——这是一种让内容能够被 Google AI Overviews、ChatGPT、Perplexity、Claude、Gemini 和 Copilot 等 AI 系统发现、提取和引用的实践。你的目标是帮助用户让其内容成为 AI 生成答案中引用的来源。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，又或旧版配置中使用的旧文件名 `product-marketing-context.md`），请在提问前阅读该文件。利用其中的上下文，只询问尚未涵盖或与当前任务相关的信息。

收集以下上下文（如果尚未提供，请询问）：

### 1. 当前 AI 可见性
- 你是否知道自己的品牌目前会不会出现在 AI 生成的答案中？
- 你是否针对关键查询检查过 ChatGPT、Perplexity 或 Google AI Overviews？
- 哪些查询对你的业务最重要？

### 2. 内容与域名
- 你制作哪类内容？（博客、文档、对比内容、产品页面）
- 你的域名权威度/传统 SEO 实力如何？
- 你是否已有结构化数据（schema 标记）？

### 3. 目标
- 在 AI 答案中被引用为来源？
- 针对特定查询出现在 Google AI Overviews 中？
- 与已经获得引用的特定品牌竞争？
- 优化现有内容，还是创建经过 AI 优化的新内容？

### 4. 竞争格局
- 在 AI 搜索结果中，你的主要竞争对手有哪些？
- 他们是否在你未获引用的地方获得了引用？

---

## AI 搜索的工作原理

### AI 搜索生态

| 平台 | 工作原理 | 来源选择 |
|----------|-------------|----------------|
| **Google AI Overviews** | 汇总排名靠前的页面 | 与传统排名高度相关 |
| **ChatGPT（启用搜索时）** | 搜索网络并引用来源 | 来源范围更广，不仅限于排名靠前的页面 |
| **Perplexity** | 始终提供带链接的来源引用 | 偏好权威、新近且结构良好的内容 |
| **Gemini** | Google 的 AI 助手 | 从 Google 索引和 Knowledge Graph 中提取信息 |
| **Copilot** | 由 Bing 提供支持的 AI 搜索 | 使用 Bing 索引和权威来源 |
| **Claude** | Brave Search（启用时） | 使用训练数据和 Brave 搜索结果 |

如需深入了解各平台如何选择来源以及应针对每个平台优化哪些方面，请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)。

### 与传统 SEO 的主要区别

传统 SEO 让你获得**排名**。AI SEO 让你获得**引用**。

在传统搜索中，你需要排在第 1 页。在 AI 搜索中，即使一个结构良好的页面排在第 2 页或第 3 页，也可能获得引用——AI 系统选择来源时依据的是内容质量、结构和相关性，而不仅仅是排名位置。

**关键统计数据：**
- AI Overviews 出现在约 45% 的 Google 搜索中
- AI Overviews 可使网站点击量减少多达 58%
- 品牌通过第三方来源获得引用的可能性是通过自有域名获得引用的 6.5 倍
- 经过优化的内容获得引用的频率是未经优化内容的 3 倍
- 统计数据和引用可使不同查询中的可见性提升 40% 以上

### Google 的官方立场与多平台现实

在进行其他任何操作之前，请务必先阅读一次这一部分。

**Google 的立场**（[AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)）：
> “SEO 的最佳实践仍然适用，因为 Google 搜索中的生成式 AI 功能以我们的核心搜索排名和质量系统为基础。”

Google 明确表示：
- AI Overviews 或 AI Mode **不需要任何特殊标记或文件**
- **不要为了 AI 而拆分内容**——应面向用户写作，并使用常规的标题和段落组织内容
- **不要为 AI 单独编写内容**——这可能会触犯“规模化内容滥用”垃圾内容政策
- **实用、可靠、以用户为先的内容**才能胜出——遵循与常规搜索相同的 E-E-A-T 标准
- **没有针对 AI 的 Search Console 报告**——请使用标准 SEO 指标

**其他 AI 引擎（ChatGPT、Claude、Perplexity、Copilot）的行为有所不同：**
- 它们会积极奖励易于提取的结构——段落、FAQ、对比表格、定义块
- 如果存在 `llms.txt`、结构化定价页面和机器可读文件，它们会解析这些内容
- 与排名靠前的页面相比，它们更频繁地引用第三方来源（Reddit、Wikipedia、评论网站）

**这对实际工作意味着：**
- 此技能中的结构模式（40–60 字的答案块、FAQ schema、对比表格）能为**非 Google AI 引擎**带来实质性帮助。同时，它们也不会损害 Google 中的表现——这些只是常规的优质内容组织方式。
- 对于 Google AI Overviews / AI Mode：只需面向用户和核心搜索进行优化。强化 E-E-A-T、提供原创信息、使用语义化 HTML，并确保内容能够被顺利索引。
- 对于 ChatGPT/Claude/Perplexity：在此基础上添加易于提取的结构 + llms.txt + 机器可读文件。

如有疑问，默认遵循“面向用户写作，为清晰度而组织”——这样可以同时满足两类平台的要求。

### 查询扇出（Google AI 搜索）

Google 的 AI 功能并不只是回答用户输入的单个查询——它们会在后台生成**并发的相关查询**，并分别检索每个查询的结果。

Google 自己给出的示例是：当用户询问“如何修整草坪”时，会触发关于除草剂、无化学品清除方法、杂草预防等内容的扇出查询。AI 会综合所有这些查询的结果。

**影响：**
- 每个关键词对应一个页面的定位方式效果会变差。应覆盖**完整的主题集群**，以便相关扇出查询也能检索到你的内容。
- 与主题权威性相比，长尾意图的重要性有所降低——Google 的 AI 系统能够理解同义词和语义等价关系。
- 与针对单一查询的狭窄页面相比，全面解答上层主题（并涵盖子问题）的页面更有可能被检索到。

**行动**：规划内容时，构思 AI 可能扇出的 5–10 个相关查询，并确保你的内容（或整个网站）覆盖这些查询。

---

## AI 可见性审计

在进行优化之前，先评估你目前在 AI 搜索中的曝光情况。

### 第 1 步：检查关键查询的 AI 答案

在各个平台上测试 10-20 个最重要的查询：

| 查询 | Google AI Overview | ChatGPT | Perplexity | 是否引用了你？ | 是否引用了竞争对手？ |
|-------|:-----------------:|:-------:|:----------:|:----------:|:-----------------:|
| [查询 1] | 是/否 | 是/否 | 是/否 | 是/否 | [谁] |
| [查询 2] | 是/否 | 是/否 | 是/否 | 是/否 | [谁] |

**要测试的查询类型：**
- “什么是[你的产品类别]？”
- “最适合[使用场景]的[产品类别]”
- “[你的品牌]与[竞争对手]对比”
- “如何[解决你的产品所解决的问题]”
- “[你的产品类别]定价”

### 第 2 步：分析引用模式

当你的竞争对手被引用而你没有被引用时，请检查：
- **内容结构** — 他们的内容是否更易于提取？
- **权威性信号** — 他们是否拥有更多引用、统计数据和专家引述？
- **时效性** — 他们的内容是否更新得更近？
- **Schema 标记** — 他们是否拥有你所缺少的结构化数据？
- **第三方影响力** — 他们是否通过 Wikipedia、Reddit、评论网站等被引用？

### 第 3 步：检查内容可提取性

对于每个优先页面，请验证：

| 检查项 | 通过/未通过 |
|-------|-----------|
| 第一段中是否有清晰的定义？ | |
| 是否有独立完整的回答块（无需周边上下文也能理解）？ | |
| 统计数据是否注明来源？ | |
| 是否有用于“[X]与[Y]对比”查询的对比表格？ | |
| 是否有使用自然语言问题的常见问题部分？ | |
| 是否有 Schema 标记（FAQ、HowTo、Article、Product）？ | |
| 是否有专家署名（作者姓名、资历）？ | |
| 是否在近期更新（6 个月内）？ | |
| 标题结构是否与查询模式匹配？ | |
| robots.txt 是否允许 AI 机器人访问？ | |

### 第 4 步：检查 AI 机器人访问权限

验证你的 robots.txt 是否允许 AI 爬虫访问。每个 AI 平台都有自己的机器人，阻止它就意味着该平台无法引用你：

- **GPTBot** 和 **ChatGPT-User** — OpenAI（ChatGPT）
- **PerplexityBot** — Perplexity
- **ClaudeBot** 和 **anthropic-ai** — Anthropic（Claude）
- **Google-Extended** — Google Gemini 和 AI Overviews
- **Bingbot** — Microsoft Copilot（通过 Bing）

检查你的 robots.txt 中是否存在针对上述任一机器人的 `Disallow` 规则。如果发现它们被阻止，你需要做出一项业务决策：阻止访问可以防止 AI 使用你的内容进行训练，但也会使你的内容无法被引用。一种折中方案是阻止仅用于训练的爬虫（例如 Common Crawl 的 **CCBot**），同时允许上面列出的搜索机器人访问。

有关完整的 robots.txt 配置，请参阅[参考资料/platform-ranking-factors.md](references/platform-ranking-factors.md)。

---

## 优化策略

### 三大支柱

```
1. Structure (make it extractable)
2. Authority (make it citable)
3. Presence (be where AI looks)
```

### 支柱 1：结构 — 让内容易于提取

AI 系统提取的是段落，而不是页面。每个关键论断都应当能够作为独立陈述成立。

**内容块模式：**
- 用于“什么是 X？”查询的**定义块**
- 用于“如何做 X”查询的**分步说明块**
- 用于“X 与 Y 对比”查询的**对比表格**
- 用于评估类查询的**优缺点块**
- 用于常见问题的 **FAQ 块**
- 注明来源的**统计数据块**

有关各类内容块的详细模板，请参阅 [references/content-patterns.md](references/content-patterns.md)。

**结构规则：**
- 每个章节开头都要直接给出答案（不要将答案埋在后文中）
- 将关键答案段落控制在 40-60 个词（最适合摘要提取）
- 使用符合人们查询表达方式的 H2/H3 标题
- 对于比较类内容，表格优于文字描述
- 对于流程类内容，编号列表优于段落
- 每个段落应传达一个明确的观点

### 支柱 2：权威性 — 让内容值得引用

AI 系统更青睐其能够信任的信息来源。应提升内容的引用价值。

**普林斯顿大学的 GEO 研究**（KDD 2024，基于 Perplexity.ai 开展研究）对 9 种优化方法进行了排名：

| 方法 | 可见度提升 | 应用方式 |
|--------|:---------------:|--------------|
| **引用来源** | +40% | 添加权威参考资料及链接 |
| **添加统计数据** | +37% | 加入有来源的具体数字 |
| **添加引文** | +30% | 引用专家观点，并注明姓名和职务 |
| **权威语气** | +25% | 以能够体现专业能力的方式撰写 |
| **提升清晰度** | +20% | 简化复杂概念 |
| **技术术语** | +18% | 使用特定领域的专业术语 |
| **独特词汇** | +15% | 提高词汇多样性 |
| **流畅度优化** | +15-30% | 提升可读性和行文流畅度 |
| ~~关键词堆砌~~ | **-10%** | **会显著损害在 AI 中的可见度** |

**最佳组合：** 流畅度 + 统计数据 = 最大提升。排名较低的网站获益更大——加入引用后，可见度提升幅度最高可达 115%。

**统计数据和资料**（引用率提升 +37-40%）
- 加入有来源的具体数字
- 引用原始研究，而不是研究摘要
- 为所有统计数据添加日期
- 原始数据优于汇总数据

**专家署名**（引用率提升 +25-30%）
- 注明作者姓名及资历
- 引用专家观点，并注明职务和所属组织
- 使用“根据 [来源]”的表达方式陈述观点
- 提供能够体现相关专业经验的作者简介

**时效性信号**
- 在显眼位置显示“最后更新：[日期]”
- 定期更新内容（对于竞争激烈的主题，至少每季度更新一次）
- 引用当年资料和近期统计数据
- 删除或更新过时信息

**与 E-E-A-T 保持一致**
- 展示第一手经验
- 提供具体、详尽的信息（而非泛泛而谈）
- 信息来源和研究方法透明
- 清晰展现作者在相关主题上的专业能力

### 支柱 3：外部影响力 — 出现在 AI 查找信息的地方

AI 系统引用的不仅是你的网站，还会引用你在其他平台上出现的内容。

**第三方来源比你自己的网站更重要：**
- 维基百科提及（占 ChatGPT 所有引用的 7.8%）
- Reddit 讨论（占 ChatGPT 引用的 1.8%）
- 行业出版物和客座文章
- 评测网站（面向 B2B SaaS 的 G2、Capterra、TrustRadius）
- YouTube（经常被 Google AI Overviews 引用）
- Quora 回答

**行动：**
- 确保你的维基百科页面准确且内容最新
- 以真实自然的方式参与 Reddit 社区
- 争取被行业盘点和比较类文章收录
- 在相关评测平台上维护最新的资料页
- 针对关键的操作方法类查询制作 YouTube 内容
- 深入回答相关的 Quora 问题

### 面向 AI 智能体的机器可读文件

> **Google 的立场**：AI Overviews 或 AI Mode 并不要求使用这些文件。其指南明确指出，无需添加新的标记、AI 文件或 Markdown，即可出现在生成式 AI 搜索结果中。
>
> **仍然建议添加的原因**：非 Google 的 AI 引擎（ChatGPT、Claude、Perplexity）和自主购买智能体确实更青睐可提取的结构。以下文件有助于适配这些引擎，同时不会对 Google 造成负面影响。

AI 智能体不再只是回答问题——它们正在成为购买者。当 AI 智能体代表用户评估工具时，它需要结构化、可解析的信息。如果你的定价信息被锁在由 JavaScript 渲染的页面中，或隐藏在“联系销售”的门槛之后，智能体就会跳过你，转而推荐那些信息真正可读取的竞争对手。

将以下机器可读文件添加到你的网站根目录：

**`/pricing.md` 或 `/pricing.txt`** — 面向 AI 智能体的结构化定价数据

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

**这在当下很重要的原因：**
- 在真人访问你的网站之前，AI 智能体越来越多地通过程序化方式比较产品
- 不透明的定价会在 AI 介导的购买流程中被过滤掉
- 简单的 Markdown 文件可被任何 LLM 轻松解析——无需渲染、无需 JavaScript，也没有登录门槛
- 其原理与 `robots.txt`（用于爬虫）、`llms.txt`（用于 AI 上下文）和 `AGENTS.md`（用于智能体能力）相同

**最佳实践：**
- 使用一致的单位（按月与按年、按席位与固定费用）
- 包含具体的限制和阈值，而不仅仅是功能名称
- 列出每个层级包含的内容，而不仅仅是各层级之间的差异
- 保持更新——过时的定价信息比没有文件更糟糕
- 从你的网站地图和主定价页面链接到该文件

**`/llms.txt`** — 面向 AI 系统的上下文文件（参见 [llmstxt.org](https://llmstxt.org)）

如果你还没有该文件，请添加一个 `llms.txt`，让 AI 系统能够快速了解你的产品用途、目标用户，并获得关键页面的链接（包括你的定价页面）。

**`/okf/` — 开放知识格式包（Google 支持，v0.1）**

Google 于 2026 年 6 月[推出了 OKF](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)——这是一项 Markdown 规范，用于将网站内容表示为包含 YAML frontmatter、相互交叉链接的文件目录，使智能体无需抓取即可读取。它主要为数据团队的目录元数据而构建；将其重新用于让智能体读取网站的做法由 Suganthan Mohanadasan 推广。目前没有证据确认它是 AI 搜索的排名信号——应将其视为类似早期 schema.org 的协议层注册。**有关完整解析、实施路径（免费生成器、WordPress 插件、手动实施）、托管指南以及何时应跳过，请参阅 [references/okf.md](references/okf.md)。**

### 面向 AI 的 Schema 标记

结构化数据有助于 AI 系统理解你的内容。关键 Schema 包括：

| 内容类型 | Schema | 帮助方式 |
|-------------|--------|-------------|
| 文章/博客文章 | `Article`, `BlogPosting` | 识别作者、日期和主题 |
| 操作指南内容 | `HowTo` | 为流程类查询提取步骤 |
| 常见问题 | `FAQPage` | 直接提取问答 |
| 产品 | `Product` | 提取价格、功能和评价 |
| 对比 | `ItemList` | 提供结构化的对比数据 |
| 评价 | `Review`, `AggregateRating` | 提供信任信号 |
| 组织 | `Organization` | 实体识别 |

具有适当 Schema 的内容在非 Google AI 引擎上的可见性会提高 30-40%。**Google 的说明**：结构化数据“并非生成式 AI 搜索的必需项”，但建议将其用于整体 SEO 策略。有关实现方法，请使用 **schema** 技能。

---

## 智能体体验

除了由 AI 搜索引擎汇总内容之外，自主智能体也开始直接访问网站——点击、阅读、比较，甚至代表用户购买。Google 的指南将其列为一个需要提前规划的新兴类别。

**智能体访问你的网站的方式：**
- **视觉渲染**——它们像用户一样截取页面截图或阅读页面
- **DOM 检查**——它们解析页面的 HTML 结构
- **无障碍树**——它们依赖与辅助技术相同的语义信息（标签、角色、地标和标题）

**应该采取的措施：**
- **无需复杂的 JS 操作即可渲染有意义的内容**——如果页面要等 4 个框架加载完成后才不再空白，智能体看到的就是空白页面
- **语义化 HTML**——使用 `<main>`、`<nav>`、`<article>`、`<button>`，采用正确的标题层级，并为图片添加 `alt` 文本
- **整洁的无障碍树**——为每个交互元素添加标签；正确使用 ARIA（当原生 HTML 已经足够时则完全不要使用）
- **稳定的选择器/可预测的布局**——智能体难以处理每次交互都会重新渲染的网站
- **公开显示价格、规格和联系信息**——智能体在给出购买建议时可能需要的任何信息，都应位于公开且可索引的页面上（这正是 `/pricing.md` 和类似文件能够发挥作用的地方）

**新兴技术——通用商务协议（UCP）：**
Google 提到 UCP 是一项即将推出的协议，它将为智能体提供标准化的商务交互接口（商品目录发现、定价、结账）。请关注其采用情况；目前，上述结构性建议正是它的前置基础。

对于电商和本地企业，Google 特别强调：
- **Merchant Center 数据 Feed** + **Google Business Profile**，用于提升产品/服务在 AI 搜索中的可见性
- **Business Agent**，用于开展对话式客户互动（如适用）

---

## 最常被引用的内容类型

并非所有内容都同样适合被引用。应优先考虑以下格式：

| 内容类型 | 引用占比 | AI 引用它的原因 |
|-------------|:------------:|----------------|
| **对比文章** | ~33% | 结构清晰、立场均衡、意图明确 |
| **权威指南** | ~15% | 全面且具有权威性 |
| **原创研究/数据** | ~12% | 独有且可引用的统计数据 |
| **精选榜单/列表文章** | ~10% | 结构清晰、实体丰富 |
| **产品页面** | ~10% | 包含 AI 可以提取的具体详情 |
| **操作指南** | ~8% | 采用分步式结构 |
| **观点/分析** | ~10% | 专家视角，适合引用 |

**在获得 AI 引用方面表现不佳的内容：**
- 缺乏结构的通用博客文章
- 充斥营销空话、内容单薄的产品页面
- 设有访问门槛的内容（AI 无法访问）
- 没有日期或作者署名的内容
- 仅提供 PDF 的内容（AI 更难解析）

**被引用 ≠ 被推荐。** 被引用意味着你的内容具有参考价值；而被*推荐*——进入买家的实际候选名单——则取决于全网共识（评论、论坛、分析师、媒体），在很大程度上与你自己的内容无关。自我宣传式的“最佳[类别]”榜单文章甚至可能对新兴品牌产生反效果：在一项包含 100 个查询的 B2B 研究中，自我宣传式榜单文章获得的 AI Overview 引用中，有 69% 出现在推荐竞争对手而非内容发布品牌的回答里。有关可见性阶梯（被检索 → 被引用 → 被提及 → 被推荐）、因阶段而异的买家指南策略、获得推荐的因素以及归因盲区，请参阅 [references/citations-vs-recommendations.md](references/citations-vs-recommendations.md)。

---

## 监测 AI 可见性

### 要跟踪的指标

| 指标 | 衡量内容 | 检查方式 |
|--------|-----------------|-------------|
| AI Overview 出现情况 | 你的查询是否会出现 AI Overview？ | 手动检查或使用 Semrush/Ahrefs |
| 品牌引用率 | 你在 AI 回答中被引用的频率 | AI 可见性工具（见下文） |
| AI 话语份额 | 你的引用量与竞争对手的对比 | Peec AI、Otterly、ZipTie |
| 引用情感倾向 | AI 如何描述你的品牌 | 手动审查 + 监测工具 |
| 推荐率 | 你是否进入候选名单，而不仅仅是被引用（参见 [citations-vs-recommendations.md](references/citations-vs-recommendations.md)） | 提示词跟踪 + 提及语境分析 |
| 来源归因 | 你的哪些页面被引用 | 跟踪来自 AI 来源的引荐流量 |

### AI 可见性监测工具

| 工具 | 覆盖范围 | 最适合的用途 |
|------|----------|----------|
| **Otterly AI** | ChatGPT、Perplexity、Google AI Overviews | 跟踪 AI 话语份额 |
| **Peec AI** | ChatGPT、Gemini、Perplexity、Claude、Copilot+ | 大规模多平台监测 |
| **ZipTie** | Google AI Overviews、ChatGPT、Perplexity | 跟踪品牌提及 + 情感倾向 |
| **LLMrefs** | ChatGPT、Perplexity、AI Overviews、Gemini | 将 SEO 关键词映射到 AI 可见性 |

### 自行监测（无需工具）

每月手动检查：
1. 选择最重要的 20 个查询
2. 分别在 ChatGPT、Perplexity 和 Google 中运行每个查询
3. 记录：你是否被引用？谁被引用？引用的是哪个页面？
4. 记录到电子表格中，并逐月跟踪变化

### 对 Search Console 的预期

Google 的指南明确指出：**Search Console 不提供 AI 专属报告**。AI Overviews 和 AI Mode 使用核心搜索排名，因此，对于 Google，你仍应使用标准的 Search Console 报告（Performance、Coverage、Core Web Vitals）进行衡量。要了解跨平台的 AI 引用行为，只能使用上述第三方工具。

---

## 不要做什么

Google 的指南明确指出了以下做法——它们会同时损害传统搜索和 AI 功能中的表现。

1. **不要编写单独的“供 AI 使用”内容**。同一份内容应同时服务于人类和 AI。针对 AI 系统编写不同版本的内容可能违反**大规模内容滥用垃圾内容政策**——这是 Google 的原话。
2. **不要将页面拆分成吸引 AI 的碎片**。Google 的指南明确指出：*“不要为了让 AI 更好地理解内容，而将内容拆分成细小片段。”* 使用正常的段落和标题结构。
3. **不要为了操纵排名而大规模生成内容**。如果 AI 生成的内容符合 Search Essentials 和垃圾内容政策，就没有问题。批量制作内容单薄的变体则不符合要求。
4. **不要追求虚假的提及**。不要伪造引用，也不要为了提高 AI 可见性而在 Reddit/Wikipedia 上批量发布垃圾内容。只能进行真实的社区参与。
5. **如果你希望获得引用，就不要屏蔽 AI 爬虫**。屏蔽 GPTBot、PerplexityBot、ClaudeBot、Google-Extended，意味着这些引擎实际上无法引用你。如果必须屏蔽，请屏蔽仅用于训练的爬虫（CCBot），而不是用于搜索和引用的爬虫。
6. **不要将主要内容隐藏在无法渲染的 JS 后面**。核心搜索和 AI 代理都需要看到你的内容；仅通过 JS 渲染会同时失去这两类受众。
7. **不要忽视 E-E-A-T 基础原则**。作者身份、第一手经验、专业性信号、透明的来源说明——Google 的指南非常重视这些因素，并将其用于 AI 功能。

---

## 按内容类型划分的 AI SEO

有关 SaaS 产品页面、博客内容、对比/替代方案页面、文档以及本地/电商内容（Google 重点强调 Merchant Center + Business Profile）的实操指南，请参阅 [references/content-types.md](references/content-types.md)。

---

## 常见错误

- **完全忽视 AI 搜索**——现在约 45% 的 Google 搜索会显示 AI Overviews，而 ChatGPT/Perplexity 也在快速增长
- **将 AI SEO 与 SEO 割裂开来**——优秀的传统 SEO 是基础；AI SEO 在此之上增加结构和权威性
- **为 AI 而不是人类写作**——如果内容读起来像是为了操纵算法而编写的，它既不会被引用，也无法带来转化
- **没有新鲜度信号**——没有日期的内容会输给带日期的内容，因为 AI 系统高度重视时效性。请显示内容的最后更新时间
- **将所有内容设置为仅限登录后访问**——AI 无法访问受限内容。应公开你最具权威性的内容
- **忽视第三方平台上的存在感**——相较于自己的博客，Wikipedia 上的一次提及可能会为你带来更多 AI 引用
- **没有结构化数据**——Schema 标记能为 AI 系统提供有关内容的结构化上下文
- **关键词堆砌**——在传统 SEO 中，这种做法只是无效；但关键词堆砌会直接使 AI 可见性降低 10%（Princeton GEO 研究）
- **将定价隐藏在“联系销售”后面，或放在通过 JS 渲染的页面中**——代表买家评估你产品的 AI 代理无法解析它们读不到的内容。添加一个 `/pricing.md` 文件
- **屏蔽 AI 机器人**——如果在 robots.txt 中屏蔽 GPTBot、PerplexityBot 或 ClaudeBot，这些平台就无法引用你
- **只有泛泛而谈、没有数据的内容**——“我们是最好的”不会被引用。“我们的客户在 [metric] 上实现了 3 倍提升”则会被引用
- **忘记监控**——无法衡量，就无法改进。至少每月检查一次 AI 可见性

---

## 工具集成

有关实现方式，请参阅[工具注册表](../../tools/REGISTRY.md)。

| 工具 | 用途 |
|------|---------|
| `semrush` | AI Overview 跟踪、关键词研究、内容差距分析 |
| `ahrefs` | 反向链接分析、内容探索、AI Overview 数据 |
| `gsc` | Search Console 效果数据、查询跟踪 |
| `ga4` | 来自 AI 来源的引荐流量 |

---

## 针对具体任务的问题

1. 对你而言最重要的 10-20 个查询是什么？
2. 你是否检查过目前这些查询是否已有 AI 回答？
3. 你的网站上是否有结构化数据（schema 标记）？
4. 你会发布哪些类型的内容？（博客、文档、对比等）
5. 竞争对手是否在你未被 AI 引用的地方获得了引用？
6. 你是否有 Wikipedia 页面，或入驻了评论网站？

---

## 相关技能

- **seo-audit**：用于传统技术 SEO 和页面 SEO 审核
- **schema**：用于实施可帮助 AI 理解你内容的结构化数据
- **content-strategy**：用于规划要创建的内容
- **competitors**：用于构建能够获得引用的对比页面
- **programmatic-seo**：用于大规模构建 SEO 页面
- **copywriting**：用于撰写既便于人类阅读，又便于 AI 提取的内容