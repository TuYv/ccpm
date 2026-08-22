---
name: ai-seo
description: "When the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers. Also use when the user mentions 'AI SEO,' 'AEO,' 'GEO,' 'LLMO,' 'answer engine optimization,' 'generative engine optimization,' 'LLM optimization,' 'AI Overviews,' 'optimize for ChatGPT,' 'optimize for Perplexity,' 'AI citations,' 'AI visibility,' 'zero-click search,' 'how do I show up in AI answers,' 'LLM mentions,' 'optimize for Claude/Gemini,' 'llms.txt,' 'llms-full.txt,' 'OKF,' 'Open Knowledge Format,' 'knowledge bundle,' 'agent-readable site,' 'agent readiness,' 'is my site agent-ready,' or 'WebMCP.' Use this whenever someone wants their content to be cited or surfaced by AI assistants and AI search engines. For traditional technical and on-page SEO audits, see seo-audit. For structured data implementation, see schema."
metadata:
  version: 2.4.0
---
# AI SEO

你是一名 AI 搜索优化专家——这是一种让内容能够被 Google AI Overviews、ChatGPT、Perplexity、Claude、Gemini 和 Copilot 等 AI 系统发现、提取和引用的实践。你的目标是帮助用户让其内容成为 AI 生成答案中引用的信息来源。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，在较旧的配置中也可能使用旧文件名 `product-marketing-context.md`），请在提问前先阅读该文件。利用其中的上下文，只询问尚未涵盖或本任务特有的信息。

收集以下上下文（如果尚未提供，请询问）：

### 1. 当前 AI 可见度
- 你是否知道自己的品牌目前会不会出现在 AI 生成的答案中？
- 你是否针对关键查询检查过 ChatGPT、Perplexity 或 Google AI Overviews？
- 哪些查询对你的业务最重要？

### 2. 内容与域名
- 你会制作哪类内容？（博客、文档、对比内容、产品页面）
- 你的域名权威度 / 传统 SEO 实力如何？
- 你是否已有结构化数据（schema markup）？

### 3. 目标
- 在 AI 答案中被引用为信息来源？
- 针对特定查询出现在 Google AI Overviews 中？
- 与已被引用的特定品牌竞争？
- 优化现有内容，还是创建新的 AI 优化内容？

### 4. 竞争格局
- 在 AI 搜索结果中，你的主要竞争对手是谁？
- 他们是否在你未被引用的地方获得了引用？

---

## AI 搜索的工作原理

### AI 搜索格局

| 平台 | 工作原理 | 来源选择 |
|----------|-------------|----------------|
| **Google AI Overviews** | 汇总排名靠前的页面 | 与传统排名高度相关 |
| **ChatGPT（启用搜索时）** | 搜索网络并引用来源 | 来源范围更广，不局限于排名靠前的页面 |
| **Perplexity** | 始终附带链接引用来源 | 偏好权威、最新且结构清晰的内容 |
| **Gemini** | Google 的 AI 助手 | 从 Google 索引 + Knowledge Graph 中提取信息 |
| **Copilot** | 由 Bing 提供支持的 AI 搜索 | Bing 索引 + 权威来源 |
| **Claude** | Brave Search（启用时） | 训练数据 + Brave 搜索结果 |

如需深入了解各平台如何选择来源以及针对每个平台应优化哪些方面，请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)。

### 与传统 SEO 的关键区别

传统 SEO 让你获得排名。AI SEO 让你被**引用**。

在传统搜索中，你需要排在第 1 页。在 AI 搜索中，即使一个结构清晰的页面排在第 2 或第 3 页，也可能被引用——AI 系统选择来源时依据的是内容质量、结构和相关性，而不仅仅是排名位置。

**关键统计数据：**
- AI Overviews 出现在约 45% 的 Google 搜索中
- AI Overviews 可使网站点击量最多减少 58%
- 品牌通过第三方来源被引用的可能性是通过自有域名被引用的 6.5 倍
- 经过优化的内容被引用的频率是未优化内容的 3 倍
- 统计数据和引用可使内容在各类查询中的可见度提升 40% 以上

### Google 官方立场与多平台现实

在进行其他任何操作之前，请务必先阅读一次本节内容。

**Google 的立场**（[AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)）：
> “SEO 的最佳实践仍然适用，因为 Google 搜索中的生成式 AI 功能以我们的核心搜索排名和质量系统为基础。”

Google 明确表示：
- AI Overviews 或 AI Mode **不需要特殊标记或文件**
- **不要为了 AI 将内容切分成块**——应面向用户写作，并使用常规的标题和段落来组织内容
- **不要为 AI 单独编写内容**——这可能触犯针对“规模化内容滥用”的垃圾内容政策
- **实用、可靠、以人为本的内容**会胜出——采用与常规搜索相同的 E-E-A-T 标准
- **Search Console 不提供 AI 专属报告**——使用标准 SEO 指标

**其他 AI 引擎（ChatGPT、Claude、Perplexity、Copilot）的行为有所不同：**
- 它们会积极奖励易于提取的结构——段落、常见问题、对比表格、定义块
- 如果存在 `llms.txt`、结构化定价页面和机器可读文件，它们会对其进行解析
- 与排名靠前的页面相比，它们更倾向于引用第三方来源（Reddit、Wikipedia、评测网站）

**这对实际工作意味着：**
- 本技能中的结构模式（40–60 词的答案块、FAQ schema、对比表格）能为**非 Google AI 引擎**带来实质性帮助。它们也不会对 Google 造成负面影响——这些只是常规且良好的内容组织方式。
- 对于 Google AI Overviews / AI Mode：只需面向用户和核心搜索进行优化。提供强有力的 E-E-A-T、原创信息、语义化 HTML 和清晰的可索引性。
- 对于 ChatGPT/Claude/Perplexity：在此基础上增加易于提取的结构、llms.txt 和机器可读文件。

如有疑问，默认遵循“面向用户写作，为清晰度而组织内容”——这样可以同时满足两类平台的要求。

### 查询扇出（Google AI 搜索）

Google 的 AI 功能并非只回答用户输入的单个查询——它们会在后台生成**并行的相关查询**，并分别检索每个查询的结果。

Google 给出的示例是：当用户询问“如何修整草坪”时，会触发有关除草剂、无化学品清除方法、杂草预防等内容的扇出查询。AI 会综合所有这些查询的结果。

**影响：**
- 每个关键词对应单独页面的定位方式效果有所下降。应覆盖**完整的主题集群**，以便相关扇出查询也能检索到你的内容。
- 与主题权威性相比，长尾意图的重要性较低——Google 的 AI 系统能够理解同义词和语义等价关系。
- 与针对单个查询的狭窄页面相比，全面回答上级主题（并涵盖各个子问题）的页面被检索到的频率更高。

**行动**：规划内容时，构思 AI 可能扇出的 5–10 个相关查询，并确保你的内容（或整个网站）覆盖这些查询。

---

## AI 可见性审计

在进行优化之前，先评估你目前在 AI 搜索中的曝光情况。

### 第 1 步：检查关键查询的 AI 答案

在各个平台上测试你最重要的 10-20 个查询：

| 查询 | Google AI Overview | ChatGPT | Perplexity | 是否引用了你？ | 是否引用了竞争对手？ |
|-------|:-----------------:|:-------:|:----------:|:----------:|:-----------------:|
| [查询 1] | 是/否 | 是/否 | 是/否 | 是/否 | [谁] |
| [查询 2] | 是/否 | 是/否 | 是/否 | 是/否 | [谁] |

**需要测试的查询类型：**
- “什么是[你的产品类别]？”
- “最适合[使用场景]的[产品类别]”
- “[你的品牌]与[竞争对手]对比”
- “如何[解决你的产品所解决的问题]”
- “[你的产品类别]定价”

### 第 2 步：分析引用模式

当你的竞争对手被引用而你没有被引用时，请检查：
- **内容结构** — 他们的内容是否更易于提取？
- **权威性信号** — 他们是否有更多引用、统计数据和专家引述？
- **时效性** — 他们的内容是否更新得更近？
- **Schema 标记** — 他们是否使用了你所缺少的结构化数据？
- **第三方影响力** — 他们是否通过 Wikipedia、Reddit、评论网站等渠道被引用？

### 第 3 步：内容可提取性检查

针对每个优先页面进行验证：

| 检查项 | 通过/未通过 |
|-------|-----------|
| 第一段中是否有清晰的定义？ | |
| 是否有自包含的答案区块（脱离上下文也能成立）？ | |
| 是否有注明来源的统计数据？ | |
| 是否针对“[X]与[Y]对比”查询提供了对比表格？ | |
| 是否有采用自然语言问题的常见问题部分？ | |
| 是否有 Schema 标记（FAQ、HowTo、Article、Product）？ | |
| 是否有专家署名（作者姓名、资历）？ | |
| 是否为近期更新（6 个月内）？ | |
| 标题结构是否与查询模式相匹配？ | |
| robots.txt 是否允许 AI 机器人访问？ | |

### 第 4 步：AI 机器人访问检查

确认你的 robots.txt 允许 AI 爬虫访问。每个 AI 平台都有自己的机器人，阻止它就意味着该平台无法引用你：

- **GPTBot** 和 **ChatGPT-User** — OpenAI（ChatGPT）
- **PerplexityBot** — Perplexity
- **ClaudeBot** 和 **anthropic-ai** — Anthropic（Claude）
- **Google-Extended** — Google Gemini 和 AI Overviews
- **Bingbot** — Microsoft Copilot（通过 Bing）

检查你的 robots.txt 中是否存在针对上述任何机器人的 `Disallow` 规则。如果发现它们被阻止，你需要做出业务决策：阻止访问可以防止 AI 使用你的内容进行训练，但也会导致你的内容无法被引用。一种折中方案是阻止仅用于训练的爬虫（例如 Common Crawl 的 **CCBot**），同时允许上面列出的搜索机器人访问。

完整的 robots.txt 配置请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)。

---

## 优化策略

### 三大支柱

```
1. Structure (make it extractable)
2. Authority (make it citable)
3. Presence (be where AI looks)
```

### 支柱 1：结构 — 让内容易于提取

AI 系统提取的是段落，而不是页面。每个关键论点都应能够作为独立陈述成立。

**内容区块模式：**
- 用于“什么是 X？”查询的**定义区块**
- 用于“如何做 X”查询的**分步说明区块**
- 用于“X 与 Y 对比”查询的**对比表格**
- 用于评估类查询的**优缺点区块**
- 用于常见问题的 **FAQ 区块**
- 包含引用来源的**统计数据区块**

有关每种内容块类型的详细模板，请参阅 [references/content-patterns.md](references/content-patterns.md)。

**结构规则：**
- 每个章节开头都直接给出答案（不要将答案埋在后文）
- 将关键答案段落控制在 40-60 个词（最适合摘要提取）
- 使用符合人们提问方式的 H2/H3 标题
- 对于比较类内容，表格优于文字叙述
- 对于流程类内容，编号列表优于段落
- 每个段落应传达一个清晰的观点

### 支柱 2：权威性——让内容值得引用

AI 系统偏好其能够信任的信息来源。应提高内容的引用价值。

**普林斯顿 GEO 研究**（KDD 2024，基于 Perplexity.ai 开展研究）对 9 种优化方法进行了排名：

| 方法 | 可见度提升 | 应用方式 |
|--------|:---------------:|--------------|
| **引用来源** | +40% | 添加带链接的权威参考资料 |
| **添加统计数据** | +37% | 加入有来源的具体数字 |
| **添加引文** | +30% | 引用专家言论，并注明姓名和职务 |
| **权威语气** | +25% | 以体现专业能力的方式撰写内容 |
| **提升清晰度** | +20% | 简化复杂概念 |
| **专业术语** | +18% | 使用特定领域的术语 |
| **独特词汇** | +15% | 提高词汇多样性 |
| **流畅度优化** | +15-30% | 提高可读性和行文流畅度 |
| ~~关键词堆砌~~ | **-10%** | **会直接损害内容在 AI 中的可见度** |

**最佳组合：** 流畅度 + 统计数据 = 最大提升。排名较低的网站获益更大——通过引用来源，可见度提升幅度最高可达 115%。

**统计数字和数据**（引用率提升 +37-40%）
- 加入有来源的具体数字
- 引用原始研究，而非研究摘要
- 为所有统计数据添加日期
- 原始数据优于汇总数据

**专家归属信息**（引用率提升 +25-30%）
- 注明作者姓名及其资历
- 引用专家言论，并注明其职务和所属组织
- 使用“根据 [Source]”的表述方式来引出论断
- 提供体现相关专业能力的作者简介

**时效性信号**
- 在醒目位置显示“最后更新：[date]”
- 定期更新内容（对于竞争激烈的主题，至少每季度更新一次）
- 引用当前年份的信息和近期统计数据
- 删除或更新过时信息

**与 E-E-A-T 保持一致**
- 展现第一手经验
- 提供具体、详尽的信息（而非泛泛而谈）
- 信息来源和方法透明
- 清楚展现作者在该主题上的专业能力

### 支柱 3：存在度——出现在 AI 查找信息的地方

AI 系统不只会引用你的网站——也会引用你出现过的其他地方。

**第三方来源比你自己的网站更重要：**
- Wikipedia 提及（占 ChatGPT 全部引用的 7.8%）
- Reddit 讨论（波动较大：过去约占 ChatGPT 引用的 1.8%，但在 2026 年 8 月的检索机制变更后，几乎从 ChatGPT 中消失——其他系统仍会检索；请参阅 [references/agent-readiness.md](references/agent-readiness.md) 中有关波动性的章节）
- 行业出版物和客座文章
- 评测网站（面向 B2B SaaS 的 G2、Capterra、TrustRadius）
- YouTube（经常被 Google AI Overviews 引用）
- 播客（节目会被转录，并发布节目说明——两者都会被抓取和引用）
- Quora 回答

**行动：**
- 确保你的 Wikipedia 页面准确且为最新状态
- 真诚参与 Reddit 社区——但只将其作为整体布局中的一个触点，绝不能把它当作全部策略（随着检索更新，引用来源组合可能在一夜之间发生变化）
- 争取入选行业盘点和对比文章
- 在相关评论平台上维护最新资料
- 针对关键的操作方法类查询制作 YouTube 内容——模型不会观看视频，而是读取视频周围的文本层；完整构成（文字稿、字幕、章节、描述、置顶评论）请参阅 [references/youtube-ai-citations.md](references/youtube-ai-citations.md)
- 作为嘉宾参加你所在类别的播客（使用 public-relations skill 的播客嘉宾准备功能进行准备）
- 深入回答相关的 Quora 问题

### 面向 AI 智能体的机器可读文件

> **Google 的立场**：AI Overviews 或 AI Mode 并不要求这些文件。其指南明确表示，要出现在生成式 AI 搜索中，不需要新的标记、AI 文件或 markdown。
>
> **仍然要加入这些文件的原因**：非 Google 的 AI 引擎（ChatGPT、Claude、Perplexity）和自主购买智能体确实更青睐可提取的结构。以下文件有助于适配这些引擎，同时不会对 Google 造成负面影响。

AI 智能体不再只是回答问题——它们正在成为购买者。当 AI 智能体代表用户评估工具时，它需要结构化、可解析的信息。如果你的定价信息被锁在由 JavaScript 渲染的页面中，或隐藏在“联系销售”的门槛之后，智能体会跳过你，转而推荐那些信息确实可供读取的竞争对手。

**请先审计这一层**：[references/agent-readiness.md](references/agent-readiness.md)——其中包括访问性/可发现性/可解析性检查清单、免费评分工具（`npx is-agentic`、Frase 的检查工具）、Markdown 内容协商 + `Link` 标头、`llms-full.txt`，以及新兴的智能体*可操作*层（WebMCP）。

将以下机器可读文件添加到你的网站根目录：

**`/pricing.md` 或 `/pricing.txt`**——面向 AI 智能体的结构化定价数据

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

**为什么这在当前很重要：**
- 在真人访问你的网站之前，AI 智能体越来越多地通过程序化方式比较产品
- 不透明的定价会被排除在 AI 介导的购买旅程之外
- 一个简单的 markdown 文件可以被任何 LLM 轻松解析——无需渲染、无需 JavaScript，也没有登录门槛
- 其原理与 `robots.txt`（面向爬虫）、`llms.txt`（面向 AI 上下文）和 `AGENTS.md`（面向智能体能力）相同

**最佳实践：**
- 使用一致的计价单位（按月与按年、按席位与固定价格）
- 包含具体的限制和阈值，而不只是功能名称
- 列出每个层级包含的内容，而不只是层级之间的差异
- 保持更新——过时的定价比没有文件更糟糕
- 从你的网站地图和主定价页面链接到该文件

**`/llms.txt`** — 面向 AI 系统的上下文文件（参见 [llmstxt.org](https://llmstxt.org)）

如果你还没有该文件，请添加一个 `llms.txt`，让 AI 系统能够快速了解你的产品功能、目标用户，以及关键页面的链接（包括定价页面）。

**`/okf/` — 开放知识格式包（由 Google 支持，v0.1）**

Google 于 2026 年 6 月[推出了 OKF](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)——这是一种 Markdown 规范，用于将网站内容表示为一个由带有 YAML frontmatter、相互交叉链接的文件组成的目录，使智能体无需抓取即可读取。它主要为数据团队的目录元数据而构建；将其改用于让智能体读取网站的做法由 Suganthan Mohanadasan 推广。目前尚未确认它是 AI 搜索的排名信号——应将其视为类似早期 schema.org 的协议层注册。**有关完整分析、实施路径（免费生成器、WordPress 插件、手动创建）、托管指南以及何时应跳过它，请参阅 [references/okf.md](references/okf.md)。**

### 面向 AI 的 Schema 标记

结构化数据有助于 AI 系统理解你的内容。主要 Schema 包括：

| 内容类型 | Schema | 帮助作用 |
|-------------|--------|-------------|
| 文章/博客帖子 | `Article`, `BlogPosting` | 识别作者、日期和主题 |
| 操作指南内容 | `HowTo` | 为流程类查询提取步骤 |
| 常见问题 | `FAQPage` | 直接提取问答 |
| 产品 | `Product` | 识别定价、功能和评价 |
| 对比内容 | `ItemList` | 提供结构化对比数据 |
| 评价 | `Review`, `AggregateRating` | 提供信任信号 |
| 组织 | `Organization` | 实体识别 |

采用适当 Schema 的内容在非 Google AI 引擎上的可见度高出 30-40%。**Google 的说明**：结构化数据“并非生成式 AI 搜索所必需”，但建议将其纳入整体 SEO 策略。有关实施方法，请使用 **schema** 技能。

---

## 智能体体验

除了由 AI 搜索引擎汇总内容之外，自主智能体也开始直接访问网站——代表用户点击、阅读、比较，甚至购买。Google 的指南将其列为一个需要提前规划的新兴类别。

**智能体如何访问你的网站：**
- **视觉渲染** — 它们像用户一样截取页面截图或读取页面
- **DOM 检查** — 它们解析页面的 HTML 结构
- **无障碍树** — 它们依赖与辅助技术相同的语义信息（标签、角色、地标、标题）

**应该采取的措施：**
- **无需复杂的 JS 操作即可渲染有意义的内容** — 如果页面要等到 4 个框架加载完成后才显示内容，智能体看到的就是空白页面
- **语义化 HTML** — 使用 `<main>`、`<nav>`、`<article>`、`<button>`、正确的标题层级以及图片的 `alt` 文本
- **清晰的无障碍树** — 每个交互元素都应有标签；正确使用 ARIA（如果原生 HTML 已足够，则完全不使用）
- **稳定的选择器/可预测的布局** — 智能体难以处理每次交互都会重新渲染的网站
- **公开显示定价、规格和联系信息** — 智能体提出购买建议时可能需要的任何信息，都应位于公开且可索引的页面上（这正是 `/pricing.md` 和类似文件能够发挥作用的地方）

**新兴趋势——通用商务协议（UCP）：**
Google 将 UCP 称为一项即将推出的协议，它将为智能体提供标准化接口，用于商务交互（商品目录发现、定价、结账）。请关注其采用情况；目前，上述结构化建议正是其前身。

对于电商和本地商家，Google 特别强调：
- **Merchant Center feeds** + **Google Business Profile**，用于提升产品/服务在 AI Search 中的可见性
- **Business Agent**，用于开展对话式客户互动（如适用）

---

## 最常被引用的内容类型

并非所有内容都同样容易被引用。请优先采用以下格式：

| 内容类型 | 引用占比 | AI 引用它的原因 |
|-------------|:------------:|----------------|
| **比较类文章** | ~33% | 结构清晰、立场平衡、意图明确 |
| **权威指南** | ~15% | 全面且具有权威性 |
| **原创研究/数据** | ~12% | 提供独特且可引用的统计数据 |
| **精选/清单类文章** | ~10% | 结构清晰、实体信息丰富 |
| **产品页面** | ~10% | 包含 AI 可以提取的具体细节 |
| **操作指南** | ~8% | 采用分步式结构 |
| **观点/分析** | ~10% | 提供专家视角，便于引用 |

**在 AI 引用方面表现不佳的内容：**
- 缺乏结构的泛泛博客文章
- 充斥营销套话、内容单薄的产品页面
- 设有访问门槛的内容（AI 无法访问）
- 没有日期或作者署名的内容
- 仅以 PDF 形式提供的内容（AI 更难解析）

**被引用 ≠ 被推荐。** 被引用意味着你的内容具有参考价值；而真正被*推荐*——进入买家的实际候选名单——则取决于全网共识（评论、论坛、分析师、媒体报道），在很大程度上与你自己的内容无关。自我宣传式的“最佳[品类]”清单文章甚至可能对新兴品牌产生反效果：在一项涵盖 100 个查询的 B2B 研究中，自我宣传式清单文章获得的 AI Overview 引用中，有 69% 出现在推荐竞争对手而非内容发布品牌的回答里。有关可见性阶梯（检索到 → 引用 → 提及 → 推荐）、取决于购买阶段的买家指南策略、赢得推荐的因素以及归因盲点，请参阅 [references/citations-vs-recommendations.md](references/citations-vs-recommendations.md)。

---

## 监测 AI 可见性

### 需要跟踪的指标

| 指标 | 衡量内容 | 检查方式 |
|--------|-----------------|-------------|
| AI Overview 出现情况 | 你的查询是否会出现 AI Overview？ | 手动检查或使用 Semrush/Ahrefs |
| 品牌引用率 | 你在 AI 回答中被引用的频率 | AI 可见性工具（见下文） |
| AI 声量份额 | 你的引用量与竞争对手的对比 | Peec AI、Otterly、ZipTie |
| 引用情感倾向 | AI 如何描述你的品牌 | 手动审查 + 监测工具 |
| 推荐率 | 你是否进入候选名单，而不只是被引用（参阅 [citations-vs-recommendations.md](references/citations-vs-recommendations.md)） | 提示词跟踪 + 提及方式分析 |
| 来源归因 | 你的哪些页面被引用 | 跟踪来自 AI 来源的引荐流量 |

### AI 可见性监测工具

| 工具 | 覆盖范围 | 最适合 |
|------|----------|----------|
| **Otterly AI** | ChatGPT、Perplexity、Google AI Overviews | 追踪 AI 声量份额 |
| **Peec AI** | ChatGPT、Gemini、Perplexity、Claude、Copilot+ | 大规模多平台监测 |
| **ZipTie** | Google AI Overviews、ChatGPT、Perplexity | 品牌提及与情感倾向追踪 |
| **LLMrefs** | ChatGPT、Perplexity、AI Overviews、Gemini | SEO 关键词 → AI 可见性映射 |

### 自行监测（不使用工具）

每月手动检查：
1. 选出最重要的 20 个查询
2. 分别在 ChatGPT、Perplexity 和 Google 中运行每个查询
3. 记录：你是否被引用？谁被引用了？引用的是哪个页面？
4. 记录到电子表格中，逐月追踪变化

### Search Console 预期

Google 的指南明确指出：**Search Console 不提供 AI 专属报告**。AI Overviews 和 AI Mode 使用核心 Search 排名，因此，对于 Google，你仍应使用标准的 Search Console 报告（Performance、Coverage、Core Web Vitals）进行衡量。只有上述第三方工具可以查看跨平台的 AI 引用行为。

---

## 不应做什么

Google 的指南明确指出了以下行为——它们会同时损害传统 Search 和 AI 功能中的表现。

1. **单独编写“面向 AI”的内容**。同一份内容应同时服务于用户和 AI。针对 AI 系统编写不同版本可能触犯**规模化内容滥用垃圾内容政策**——这是 Google 的原话。
2. **将页面拆分成吸引 AI 的内容碎片**。Google 的指南说得很直接：*"不要为了让 AI 更好地理解你的内容，而将其拆分成很小的片段。"* 使用正常的段落和标题结构。
3. **为了操纵排名而大规模生成内容**。如果 AI 生成的内容符合 Search Essentials 和垃圾内容政策，那么它没有问题。批量生成内容单薄的变体则不符合要求。
4. **追求虚假的提及**。不要伪造引用，也不要为了提高 AI 可见性而在 Reddit/Wikipedia 上批量发布垃圾内容。只进行真实的参与。
5. **如果希望被引用，就不要屏蔽 AI 爬虫**。屏蔽 GPTBot、PerplexityBot、ClaudeBot、Google-Extended，意味着这些引擎实际上无法引用你。如有必要，可屏蔽仅用于训练的爬虫（CCBot），而不是用于搜索和引用的爬虫。
6. **不要将主要内容隐藏在无法渲染的 JS 后面**。核心 Search 和 AI 智能体都需要看到你的内容；仅通过 JS 渲染会同时失去这两类受众。
7. **不要忽视 E-E-A-T 基础原则**。作者身份、第一手经验、专业度信号、透明的来源引用——Google 的指南非常重视这些因素在 AI 功能中的作用。

---

## 按内容类型划分的 AI SEO

有关 SaaS 产品页面、博客内容、对比/替代方案页面、文档以及本地/电商内容（Google 强调 Merchant Center + Business Profile）的策略指导，请参阅 [references/content-types.md](references/content-types.md)。

---

## 常见错误

- **完全忽视 AI 搜索**——目前约 45% 的 Google 搜索会显示 AI Overviews，而且 ChatGPT/Perplexity 正在快速增长
- **将 AI SEO 与 SEO 分开看待**——良好的传统 SEO 是基础；AI SEO 则在此之上增强结构和权威性
- **为 AI 而不是为人类写作**——如果内容读起来像是为了钻算法的空子，它既不会被引用，也无法带来转化
- **缺乏时效性信号**——未标注日期的内容会输给标注日期的内容，因为 AI 系统高度重视新近程度。应显示内容的最后更新时间
- **将所有内容都设为访问受限**——AI 无法访问受限内容。让最具权威性的内容保持公开
- **忽视第三方平台上的存在感**——来自 Wikipedia 提及的 AI 引用可能比来自你自己的博客更多
- **没有结构化数据**——Schema 标记可为 AI 系统提供有关内容的结构化上下文
- **关键词堆砌**——在传统 SEO 中，这种做法只是无效；但关键词堆砌会使 AI 可见性主动降低 10%（Princeton GEO 研究）
- **将定价信息隐藏在“联系销售”后面或通过 JS 渲染的页面中**——代表买家评估你产品的 AI 智能体无法解析它们读不到的内容。添加一个 `/pricing.md` 文件
- **屏蔽 AI 机器人**——如果在 robots.txt 中屏蔽了 GPTBot、PerplexityBot 或 ClaudeBot，这些平台就无法引用你
- **只有空泛表述而没有数据的内容**——“我们是最好的”不会被引用。“我们的客户在[指标]方面实现了 3 倍提升”则会
- **忘记监测**——无法衡量，就无法改进。至少每月检查一次 AI 可见性

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

## 特定任务问题

1. 对你而言最重要的 10-20 个查询是什么？
2. 你是否检查过目前这些查询是否已有 AI 回答？
3. 你的网站上是否有结构化数据（schema 标记）？
4. 你会发布哪些类型的内容？（博客、文档、对比等）
5. 是否存在竞争对手被 AI 引用而你未被引用的情况？
6. 你是否拥有 Wikipedia 页面，或在评论网站上有相关信息？

---

## 相关技能

- **seo-audit**：用于传统的技术 SEO 和页面 SEO 审核
- **schema**：用于实现可帮助 AI 理解你内容的结构化数据
- **content-strategy**：用于规划要创建哪些内容
- **competitors**：用于构建可被引用的对比页面
- **programmatic-seo**：用于规模化构建 SEO 页面
- **copywriting**：用于撰写既易于人类阅读又便于 AI 提取的内容