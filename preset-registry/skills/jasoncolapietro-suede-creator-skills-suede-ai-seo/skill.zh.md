---
name: suede-ai-seo
description: "Suede-affiliated AI search optimization discipline. Use when the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers. Also use when the user mentions 'AI SEO,' 'AEO,' 'GEO,' 'LLMO,' 'answer engine optimization,' 'generative engine optimization,' 'LLM optimization,' 'AI Overviews,' 'optimize for ChatGPT,' 'optimize for Perplexity,' 'AI citations,' 'AI visibility,' 'zero-click search,' 'how do I show up in AI answers,' 'LLM mentions,' 'optimize for Claude/Gemini,' 'llms.txt,' 'OKF,' 'Open Knowledge Format,' 'knowledge bundle,' or 'agent-readable site.' The durable job: make content structurally extractable, citable, and agent-readable so AI systems surface and cite it. NOT FOR: traditional technical SEO audit (use suede-seo-audit) or launch-appeal grading (use suede-visibility-grader)."
metadata:
  version: 2.2.0
---
# Suede AI SEO

## Gate policy — advisory, not blocking

此技能中的每项检查、门禁和判定，包括 `ship`、`ship-with-caveats`、
`hold`、字母等级、BLOCKED 或 OPEN 项，以及下文每一条“不要发布 / 发布 /
继续”说明，都是**向用户提供的建议，而不是对代理的控制措施**。运行每项检查，如实报告结果，并按要求完成请求的操作：**门禁失败会改变你的报告内容，但绝不会改变你的操作。**唯一的例外是：如果某项发现具有极高风险（数据丢失、安全或凭据泄露、法律或权利违规、支付错误、不可逆的公开损害），请暂停，说明风险和可选方案，并让用户做出选择。用户的选择是最终决定。

## 边界

- 不要声称在任何 AI 平台上会获得特定的引用、排名或可见性结果。请引用相关机制和已发表的研究，而不是保证结果。
- 在展示当前线上状态并获得明确批准之前，不要编辑生产环境中的 robots.txt、schema markup 或网站内容。
- 不要捏造 AI Overview、ChatGPT 或 Perplexity 的引用检查，只报告实际查询和观察到的内容。

你是 AI 搜索优化领域的专家。AI 搜索优化是指让内容能够被包括 Google AI Overviews、ChatGPT、Perplexity、Claude、Gemini 和 Copilot 在内的 AI 系统发现、提取和引用。你的目标是帮助用户让其内容在 AI 生成的答案中作为来源被引用。

## 开始之前

**先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或者存在 `.claude/product-marketing.md`，或在较旧设置中使用旧版 `product-marketing-context.md` 文件名），请在提问前阅读。使用其中的上下文，只询问其中未涵盖或与当前任务相关的具体信息。

收集以下上下文（如果用户未提供，请询问）：

### 1. 当前 AI 可见性
- 你是否知道你的品牌目前是否出现在 AI 生成的答案中？
- 你是否针对关键查询检查过 ChatGPT、Perplexity 或 Google AI Overviews？
- 哪些查询对你的业务最重要？

### 2. 内容与域名
- 你会产出哪类内容？（博客、文档、对比内容、产品页面）
- 你的域名权威度 / 传统 SEO 实力如何？
- 你是否已有结构化数据（schema markup）？

### 3. 目标
- 在 AI 答案中作为来源被引用？
- 针对特定查询出现在 Google AI Overviews 中？
- 与已经获得引用的特定品牌竞争？
- 优化现有内容，还是创建新的 AI 优化内容？

### 4. 竞争格局
- 你在 AI 搜索结果中的主要竞争对手是谁？
- 他们是否在你未被引用的地方获得了引用？
- 针对你的类别，你是否有 Wikipedia 条目，或出现在评论网站 / Reddit 上？

---

## AI 搜索的工作原理

### AI 搜索格局

| 平台 | 工作原理 | 来源选择 |
|----------|-------------|----------------|
| **Google AI Overviews** | 总结排名靠前的页面 | 与传统排名高度相关 |
| **ChatGPT（带搜索功能）** | 搜索网络并引用来源 | 来源范围更广，不仅限于排名靠前的页面 |
| **Perplexity** | 始终通过链接引用来源 | 偏好权威、最新且结构良好的内容 |
| **Gemini** | Google 的 AI 助手 | 从 Google 索引和 Knowledge Graph 中提取内容 |
| **Copilot** | 由 Bing 驱动的 AI 搜索 | Bing 索引和权威来源 |
| **Claude** | Brave Search（启用时） | 训练数据和 Brave 搜索结果 |

如需深入了解各个平台如何选择来源，以及应针对各平台优化哪些内容，请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)。

### 与传统 SEO 的关键区别

传统 SEO 让你获得排名。AI SEO 让你被**引用**。

在传统搜索中，你需要排到第 1 页。在 AI 搜索中，即使一个结构良好的页面排在第 2 或第 3 页，也可能被引用——AI 系统会根据内容质量、结构和相关性选择来源，而不只是排名位置。

广泛流传的市场统计数据（AI Overview 覆盖率、点击流失、第三方引用倍数）均未注明日期和来源；它们位于 [references/platform-ranking-factors.md](references/platform-ranking-factors.md) 的“Market statistics”部分，并附带该免责声明。阅读它们仅用于了解背景，绝不要将其作为交付物中的证据引用。

### Google 的官方立场与多平台现实

在开始任何工作之前，请务必先阅读这一部分。

**Google 的立场**（[AI features optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)）：
> “SEO 最佳实践仍然适用，因为 Google 搜索中的生成式 AI 功能植根于我们的核心搜索排名和质量系统。”

Google 明确表示：
- AI Overviews 或 AI Mode **不需要特殊的标记或文件**
- **不要为 AI 切分内容**——应为人撰写内容，并使用常规标题和段落组织
- **不要为 AI 单独撰写内容**——这可能触犯“规模化内容滥用”垃圾内容政策
- **有帮助、可靠、以人为本的内容**会胜出——与常规搜索相同的 E-E-A-T 标准
- **没有 AI 专用的 Search Console 报告**——请使用标准 SEO 指标

**其他 AI 引擎（ChatGPT、Claude、Perplexity、Copilot）的行为有所不同：**
- 它们会积极奖励易于提取的结构——段落、FAQ、对比表格、定义块
- 当存在时，它们会解析 `llms.txt`、结构化定价页面和机器可读文件
- 相较于排名靠前的页面，它们更频繁地引用第三方来源（Reddit、Wikipedia、评论网站）

**这对实际工作意味着：**
- 本 skill 中的结构模式（40–60 词回答块、FAQ schema、对比表格）能实质性地帮助**非 Google AI 引擎**。它们也不会损害 Google——这些只是常规的优秀内容组织方式。
- 对于 Google AI Overviews / AI Mode：彻底专注于为人优化以及核心搜索。强化 E-E-A-T、原创信息、语义化 HTML 和清晰的可索引性。
- 对于 ChatGPT/Claude/Perplexity：在此基础上增加可提取的结构 + `llms.txt` + 机器可读文件。

如有疑问，默认遵循“为人撰写，为清晰而组织”——这能同时满足两方的要求。

### 查询扇出（Google AI 搜索）

Google 的 AI 功能不只是回答用户输入的单个查询——它们会在底层生成**并发的相关查询**，并针对每个查询检索结果。

Google 自己的示例：用户询问“how to fix lawns”时，会触发关于除草剂、无化学品清除、杂草预防等方面的扇出查询。AI 会综合所有这些查询的结果。

**影响：**
- 按单个关键词创建单页的效果正在减弱。覆盖**完整的主题集群**，这样对于 AI 扩展出的变体查询也能被检索到。
- 长尾意图的重要性降低，主题权威性更加重要，因为 Google 的 AI 系统能够理解同义词和语义等价关系。
- 全面回答一个父主题（同时覆盖相关子问题）的页面，比针对单个查询的狭窄页面更容易被检索到。

**行动**：规划内容时，头脑风暴出 AI 可能扩展出的 5–10 个相关查询，并确保你的内容（或整个网站）覆盖这些查询。

---

## AI 可见性审计

在开始优化之前，评估你当前在 AI 搜索中的表现。

### 步骤 1：检查关键查询的 AI 答案

在各个平台上测试 10–20 个最重要的查询：

| 查询 | Google AI Overview | ChatGPT | Perplexity | 是否引用了你？ | 是否引用了竞争对手？ |
|-------|:-----------------:|:-------:|:----------:|:----------:|:----------:|
| [query 1] | 是/否 | 是/否 | 是/否 | 是/否 | [who] |
| [query 2] | 是/否 | 是/否 | 是/否 | 是/否 | [who] |

**要测试的查询类型：**
- “什么是[你的产品类别]？”
- “[适用于某个使用场景的]最佳[产品类别]”
- “[你的品牌]与[竞争对手]对比”
- “如何解决[你的产品所解决的问题]”
- “[你的产品类别]定价”

### 步骤 2：分析引用模式

当你的竞争对手获得引用而你没有时，检查以下方面：
- **内容结构** —— 他们的内容是否更容易被提取？
- **权威信号** —— 他们是否拥有更多引用、统计数据和专家引述？
- **新鲜度** —— 他们的内容是否更新得更近？
- **Schema 标记** —— 他们是否使用了你缺少的结构化数据？
- **第三方存在** —— 他们是否通过 Wikipedia、Reddit、评论网站获得引用？

### 步骤 3：内容可提取性检查

针对每个优先页面，确认：

| 检查项 | 通过/未通过 |
|-------|-----------|
| 第一段中是否有清晰的定义？ | |
| 是否有脱离上下文也能独立起作用的答案区块？ | |
| 是否引用了统计数据的来源？ | |
| 是否有针对“[X] 与 [Y] 对比”查询的比较表？ | |
| 是否有使用自然语言提问的 FAQ 部分？ | |
| 是否有 Schema 标记（FAQ、HowTo、Article、Product）？ | |
| 是否标注了专家信息（作者姓名、资质）？ | |
| 是否在近期更新过（6 个月以内）？ | |
| 标题结构是否符合查询模式？ | |
| robots.txt 是否允许 AI 机器人访问？ | |

### 步骤 4：AI 机器人访问检查

确认你的 robots.txt 允许 AI 爬虫访问。每个平台都有自己的机器人，阻止它意味着该平台无法引用你的内容：

- **GPTBot** 和 **ChatGPT-User** —— OpenAI（ChatGPT）
- **PerplexityBot** —— Perplexity
- **ClaudeBot** 和 **anthropic-ai** —— Anthropic（Claude）
- **Google-Extended** —— Google Gemini 和 AI Overviews
- **Bingbot** —— Microsoft Copilot（通过 Bing）

使用主机提供的、经批准的只读 HTTP 或浏览器工具获取文件并读取规则
——不要自行假设。使用经过验证的公共 HTTPS 主机名，并拒绝环回地址、链路本地地址或私有网络目标。不要附带环境中的 cookies 或身份验证标头，也不要发送本地文件、凭据或工作区内容。在判断访问权限之前，记录最终 URL、HTTP 状态和响应正文。

将内容按块读取：`Disallow:` 行属于其上方的 `User-agent:`，而 `User-agent: *` 块适用于没有专属块的所有机器人。如果 robots.txt 返回任何非 200 状态码、从已验证的公共 HTTPS 目的地重定向到其他位置，或抓取失败，则报告 AI 机器人访问状态为**未验证，并说明原因**，绝不能报告为开放。按机器人分别报告：允许、阻止或未验证。

如果机器人被阻止，这是一个业务决策：阻止可以防止 AI 使用你的内容进行训练，但也会阻止引用。一种折中方案是阻止仅用于训练的爬虫（例如 Common Crawl 的 **CCBot**），同时允许上面列出的搜索机器人。

完整的 robots.txt 配置请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)。

---

## 优化策略

### 三大支柱

```
1. 结构（使内容可提取）
2. 权威性（使内容可引用）
3. 存在感（出现在 AI 查找的位置）
```

### 支柱 1：结构——使内容可提取

AI 系统提取的是段落，而不是页面。每个关键论点都应当能够作为独立陈述成立。

**内容块模式：**
- "X 是什么？"查询使用**定义块**
- "如何做 X"查询使用**分步块**
- "X 与 Y 对比"查询使用**比较表**
- 评估类查询使用**优缺点块**
- 常见问题使用**FAQ 块**
- 使用带来源引用的**统计数据块**

有关每种内容块类型的详细模板，请参阅 [references/content-patterns.md](references/content-patterns.md)。

**结构规则：**
- 每个小节都以直接回答开头（不要将答案埋在后面）
- 将关键回答段落控制在 40-60 个词（最适合摘要提取）
- 使用符合人们查询表达方式的 H2/H3 标题
- 对比较类内容而言，表格优于散文
- 对流程类内容而言，编号列表优于段落
- 每个段落应表达一个清晰的观点

### 支柱 2：权威性——使内容可引用

AI 系统更偏好它们能够信任的来源。应提高内容被引用的价值。

**普林斯顿 GEO 研究**（KDD 2024，基于对 Perplexity.ai 的研究）对 9 种优化方法进行了排名：

| 方法 | 可见性提升 | 应用方式 |
|--------|:---------------:|--------------|
| **引用来源** | +40% | 添加带链接的权威参考资料 |
| **添加统计数据** | +37% | 添加带来源的具体数字 |
| **添加引语** | +30% | 添加带姓名和职务的专家引语 |
| **权威语气** | +25% | 以展现专业能力的方式写作 |
| **提升清晰度** | +20% | 简化复杂概念 |
| **技术术语** | +18% | 使用特定领域的术语 |
| **独特词汇** | +15% | 增加词汇多样性 |
| **流畅度优化** | +15-30% | 改善可读性和行文流畅度 |
| ~~关键词堆砌~~ | **-10%** | **会主动损害 AI 可见性** |

**最佳组合：**流畅度 + 统计数据 = 最大提升。排名较低的网站受益更多——引用来源最多可带来 115% 的可见性提升。

**统计数据和资料**（可带来 +37-40% 的引用提升）
- 添加带来源的具体数字
- 引用原始研究，而不是研究摘要
- 为所有统计数据添加日期
- 原始数据优于汇总数据

**专家署名**（+25-30% 引用提升）
- 具名作者及其资质
- 包含职位和所属组织的专家引述
- 使用“根据 [Source]”的表述方式来支撑主张
- 展示相关专业知识的作者简介

**时效性信号**
- 突出显示“最后更新：[date]”
- 定期更新内容（竞争激烈的主题至少每季度一次）
- 引用当年内容和近期统计数据
- 删除或更新过时信息

**E-E-A-T 对齐**
- 展示第一手经验
- 提供具体、详细的信息（而非泛泛而谈）
- 透明地说明来源和方法论
- 清晰展示作者在该主题上的专业能力

### 支柱 3：存在感 — 出现在 AI 关注的地方

AI 系统不只引用你的网站，它们还会引用你出现的地方。

**第三方来源比你自己的网站更重要：**
- Wikipedia 提及（占所有 ChatGPT 引用的 7.8%）
- Reddit 讨论（占 ChatGPT 引用的 1.8%）
- 行业出版物和客座文章
- 评测网站（面向 B2B SaaS 的 G2、Capterra、TrustRadius）
- YouTube（经常被 Google AI Overviews 引用）
- Quora 回答

**行动：**
- 确保你的 Wikipedia 页面准确且为最新状态
- 真诚参与 Reddit 社区
- 争取出现在行业汇总和对比文章中
- 在相关评测平台上维护最新资料
- 针对关键操作指南查询创建 YouTube 内容
- 深入回答相关 Quora 问题

### 面向 AI 智能体的机器可读文件

> **Google 的立场**：对于 AI Overviews 或 AI Mode 而言并非必需。其指南明确表示，你无需使用新的标记、AI 文件或 markdown，即可出现在生成式 AI 搜索中。
>
> **仍然要纳入它们的原因**：非 Google 的 AI 引擎（ChatGPT、Claude、Perplexity）以及自主采购智能体确实会青睐可提取的结构。下列文件有助于适配这些引擎，同时不会对 Google 造成负面影响。

AI 智能体不只是在回答问题，它们正在成为买家。当 AI 智能体代表用户评估工具时，它需要结构化、可解析的信息。如果你的定价被锁在 JavaScript 渲染的页面中，或者藏在“联系销售”这堵墙之后，智能体就会跳过你，转而推荐那些它们能够实际读取信息的竞争对手。

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
- 在人类首次访问你的网站之前，AI 智能体越来越多地以编程方式比较产品
- 不透明的定价会在 AI 介导的采购旅程中被过滤掉
- 一个简单的 markdown 文件可被任何 LLM 轻松解析 — 无需渲染、无需 JavaScript、无需登录墙
- 其原理与 `robots.txt`（用于爬虫）、`llms.txt`（用于 AI 上下文）和 `AGENTS.md`（用于智能体能力）相同

**最佳实践：**
- 使用一致的单位（月度 vs. 年度、按席位 vs. 固定费用）
- 包含具体的限制和阈值，而不只是功能名称
- 列出每个套餐包含的内容，而不只是说明差异
- 保持更新——过时的定价比没有文件更糟
- 从你的网站地图和主定价页面链接到它

**`/llms.txt`** — 面向 AI 系统的上下文文件（参见 [llmstxt.org](https://llmstxt.org)）

如果你还没有，请添加一个 `llms.txt`，为 AI 系统快速概述你的产品功能、目标用户，以及关键页面的链接（包括你的定价页面）。

**`/okf/` — Open Knowledge Format bundle（Google 支持，v0.1）**

Google 于 2026 年 6 月[推出了 OKF](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)——一种 Markdown 规范，用于将网站内容表示为由交叉链接文件组成的目录，并带有 YAML frontmatter，代理无需抓取即可读取。它最初主要面向数据团队的目录元数据；网站内容可被代理读取的再利用方式由 Suganthan Mohanadasan 推广。目前没有已证实的 AI 搜索排名信号——应将其视为类似早期 schema.org 的协议层注册。**有关完整分析、实施路径（免费生成器、WordPress 插件、手动创建）、托管指南以及何时应跳过，请参阅 [references/okf.md](references/okf.md)。**

### 面向 AI 的 Schema Markup

结构化数据可帮助 AI 系统理解你的内容。关键 schema：

| 内容类型 | Schema | 帮助原因 |
|-------------|--------|-------------|
| 文章/博客文章 | `Article`, `BlogPosting` | 作者、日期、主题识别 |
| 操作指南内容 | `HowTo` | 为流程查询提取步骤 |
| 常见问题 | `FAQPage` | 直接提取问答 |
| 产品 | `Product` | 定价、功能、评价 |
| 对比 | `ItemList` | 结构化对比数据 |
| 评价 | `Review`, `AggregateRating` | 信任信号 |
| 组织 | `Organization` | 实体识别 |

结构化数据与非 Google AI 引擎中更高的 AI 可见性相关；流传的百分比数据没有日期和来源，因此不要引用。**Google 的说明**：结构化数据“并非生成式 AI 搜索的必需条件”，但建议将其纳入整体 SEO 策略。对于 schema 验证和实施，请使用 `suede-seo-audit`。

---

## Agentic Experiences

除了 AI 搜索引擎总结内容之外，自主代理正开始直接访问网站——代表用户点击、阅读、比较，甚至购买。Google 的指南将此标记为一个需要规划的新兴类别。

**代理如何访问你的网站：**
- **视觉渲染** — 它们像用户一样截取/阅读页面
- **DOM 检查** — 它们解析页面的 HTML 结构
- **无障碍树** — 它们依赖辅助技术使用的相同语义信息（标签、角色、地标、标题）

**该怎么做：**
- **无需繁重的 JS 操作即可渲染有意义的内容** — 如果页面在 4 个框架全部加载完成前都是空白，代理看到的也是空白
- **语义化 HTML** — 使用 `<main>`、`<nav>`、`<article>`、`<button>`、正确的标题层级，以及图像上的 `alt` 文本
- **干净的无障碍树** — 为每个交互元素添加标签；正确使用 ARIA（或者在原生 HTML 已足够时完全不使用）
- **稳定的选择器 / 可预测的布局** — 代理难以处理每次交互都会重新渲染的网站
- **可见的定价、规格、联系信息** — 代理做出购买推荐所需的任何信息都应位于公开、可索引的页面上（这正是 `/pricing.md` 和类似文件有所帮助的地方）

**新兴协议——通用商务协议（UCP）：**
Google 将 UCP 描述为一项即将推出的协议，将为代理提供用于商务交互的标准化接口（目录发现、定价、结账）。请关注其采用情况；目前，上述结构性建议是其前身。

对于电商和本地企业，Google 特别强调：
- **Merchant Center feeds** + **Google Business Profile**，用于提升产品/服务在 AI Search 中的可见性
- **Business Agent**，用于以对话方式与客户互动（如适用）

---

## 最常被引用的内容类型

并非所有内容都具有同等的可引用性。请优先采用以下格式：

| 内容类型 | 引用占比 | AI 引用它的原因 |
|-------------|:------------:|----------------|
| **对比文章** | ~33% | 结构清晰、均衡、意图明确 |
| **权威指南** | ~15% | 全面、权威 |
| **原创研究/数据** | ~12% | 独特且可引用的统计数据 |
| **最佳产品/列表文章** | ~10% | 结构清晰、实体信息丰富 |
| **产品页面** | ~10% | AI 可以提取具体细节 |
| **操作指南** | ~8% | 采用分步骤结构 |
| **观点/分析** | ~10% | 专家视角，便于引用 |

**不利于 AI 引用的内容：**
- 缺乏结构的通用博客文章
- 充斥营销套话、内容单薄的产品页面
- 受访问限制的内容（AI 无法访问）
- 没有日期或作者署名的内容
- 仅提供 PDF 格式的内容（AI 更难解析）

**被引用 ≠ 被推荐。** 被引用意味着你的内容具有参考价值；而被*推荐*，即进入买家的实际候选名单，则由全网共识（评论、论坛、分析师、媒体报道）决定，与自身内容基本无关。对于新兴品牌而言，自我宣传式的“最佳[类别]”列表文章甚至可能适得其反：在一项针对 B2B 的 100 个查询的研究中，自我宣传式列表文章获得的 AI Overview 引用中，有 69% 出现在推荐竞争对手而非发布该内容品牌的答案中。有关可见性阶梯（已检索 → 已引用 → 已提及 → 已推荐）、取决于阶段的买家指南策略、获得推荐的因素以及归因盲点，请参阅 [references/citations-vs-recommendations.md](references/citations-vs-recommendations.md)。

---

## 监测 AI 可见性

### 要跟踪的指标

| 指标 | 衡量内容 | 检查方式 |
|--------|-----------------|-------------|
| AI Overview 展示情况 | 针对你的查询是否会出现 AI Overviews？ | 手动检查或使用 Semrush/Ahrefs |
| 品牌引用率 | 你在 AI 答案中被引用的频率 | AI 可见性工具（见下文） |
| AI 声量份额 | 你的引用与竞争对手引用的对比 | Peec AI、Otterly、ZipTie |
| 引用情感 | AI 如何描述你的品牌 | 手动审核 + 监测工具 |
| 推荐率 | 你是否进入候选名单，而不仅仅是被引用（请参阅 [citations-vs-recommendations.md](references/citations-vs-recommendations.md)） | 跟踪提示词 + 提及语境 |
| 来源归因 | 你的哪些页面获得了引用 | 跟踪来自 AI 来源的引荐流量 |

Vendor tools (Otterly、Peec、ZipTie、LLMrefs) 及其当前平台覆盖范围位于 [references/platform-ranking-factors.md](references/platform-ranking-factors.md) 中，只有当查询集合过大、无法手动检查时才阅读该表，并在推荐某个工具之前通过供应商自己的站点验证其覆盖范围。

### DIY 监控（无需工具）

每月手动检查：
1. 选出排名前 20 的查询
2. 将每个查询分别输入 ChatGPT、Perplexity 和 Google
3. 记录：是否引用了你？引用了谁？引用了哪个页面？
4. 记录在电子表格中，跟踪月度变化

### Search Console 预期

Google 的指南明确指出：**没有针对 AI 的 Search Console 专门报告**。AI Overviews 和 AI Mode 使用核心 Search 排名，因此对于 Google，你仍然需要使用标准的 Search Console 报告（Performance、Coverage、Core Web Vitals）进行衡量。[references/platform-ranking-factors.md](references/platform-ranking-factors.md) 中的第三方工具是查看跨平台 AI 引用行为的唯一方式。

---

## 按内容类型进行 AI SEO

如需了解 SaaS 产品页面、博客内容、比较/替代方案页面、文档以及本地/电商内容（Google 强调 Merchant Center + Business Profile）的战术指导，请参阅 [references/content-types.md](references/content-types.md)。

---

## 常见错误以及不应采取的做法

前七项在 Google 的指南中都有明确说明，它们会同时损害传统 Search 和 AI 功能。

1. **单独编写“面向 AI”的内容**。相同的内容应该同时服务于人和 AI。编写针对 AI 系统的变体可能触犯 **scaled content abuse spam policy**，这是 Google 的原话。如果内容读起来像是在试图操纵算法，就不会获得引用，也不会带来转化。
2. **将页面拆分成诱导 AI 的碎片**。Google 的指南对此说得很直接：*“不要为了让 AI 更好地理解内容，而将内容拆成微小片段。”* 使用正常的段落和标题结构。
3. **为了操纵排名而大规模生成内容**。AI 生成的内容没有问题，*前提是*它符合 Search Essentials 和 spam policies。批量生产单薄的变体内容则不符合要求。
4. **追求不真实的提及**。不要伪造引用，也不要为了提高 AI 可见度而在 Reddit/Wikipedia 上批量发送垃圾内容。只能进行真实参与。
5. **如果希望获得引用，却屏蔽 AI 爬虫**。屏蔽 GPTBot、PerplexityBot、ClaudeBot、Google-Extended 意味着这些引擎实际上无法引用你的网站。如果必须屏蔽，请屏蔽仅用于训练的爬虫（CCBot），不要屏蔽用于搜索和引用的爬虫。
6. **将主要内容隐藏在无法渲染的 JS 后面**。核心 Search 和 AI 代理都需要看到你的内容；仅依赖 JS 渲染会同时失去这两类受众。
7. **跳过 E-E-A-T 基础要素**。作者身份、第一手经验、专业能力信号、透明的来源说明，Google 的指南对 AI 功能尤其强调了这些因素。

其余是行业实践中的错误，而不是违反政策的行为：
- **完全忽视 AI 搜索** —— AI Overviews 现在已经出现在很大比例的 Google 搜索中，而 ChatGPT/Perplexity 的增长速度也很快
- **将 AI SEO 视为与 SEO 分离的领域** —— 良好的传统 SEO 是基础；AI SEO 则在此基础上增加结构和权威性
- **没有新鲜度信号** —— 没有日期的内容会输给有日期的内容，因为 AI 系统非常看重时效性。注明内容最后更新的时间
- **将所有内容设置为门控内容** —— AI 无法访问门控内容。保持最具权威性的内容开放
- **忽视第三方存在** —— 你从 Wikipedia 提及中获得的 AI 引用可能比从自己的博客中获得的更多
- **没有结构化数据** —— Schema 标记为 AI 系统提供有关你内容的结构化上下文
- **关键词堆砌** —— 传统 SEO 中关键词堆砌只是无效，而在 AI SEO 中，关键词堆砌会主动降低 10% 的 AI 可见度（Princeton GEO 研究）
- **将定价隐藏在“联系销售”或 JS 渲染的页面后面** —— 代表买家评估你产品的 AI 代理无法解析它们无法读取的内容。添加一个 `/pricing.md` 文件
- **缺乏数据的通用内容** —— “我们是最好的”不会获得引用。“我们的客户在 [metric] 上取得了 3 倍的提升”则会
- **忘记监控** —— 无法衡量的事情就无法改进。至少每月检查一次 AI 可见度

---

## 输出契约

每次 AI 可见性检查都必须以此区块结尾。填写每个字段；不要留空，写 "not checked"。只包含实际运行过的查询和页面对应的行。

```text
=== AI SEARCH VISIBILITY REPORT ===   Site / pages:        Date:
QUERIES RUN (Step 1) — one row per query actually executed, "not queried" for any platform skipped:
  Query | AI Overview | ChatGPT | Perplexity | You cited | Competitors cited
BOT ACCESS (Step 4) — robots.txt fetch: 200 | other code | failed (reason)
  Per bot (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended, Bingbot): allowed | blocked | unverified
EXTRACTABILITY (Step 3) — [page]: N of 10 checks pass | failing checks: [names]
PRIORITIZED FIXES — 1. [P1] Page | What is wrong | The exact change to make
COVERAGE — Queried and observed: [...] | Not checked, and why: [...]
SHIP GATE — ship | ship-with-caveats | hold — reason
```

---

## 路由

- 使用 `suede-seo-audit` 进行传统技术 SEO 和页面内 SEO 审计，包括 schema 验证。
- 使用 `suede-content-strategy` 规划要创建的内容。
- 使用 `suede-competitors` 构建会被引用的对比页面。
- 使用 `suede-programmatic-seo` 批量构建 SEO 页面。
- 使用 `suede-copy` 撰写既适合人类阅读又易于 AI 提取的内容。
- 使用 `suede-visibility-grader` 对已发布页面进行上线吸引力评分。