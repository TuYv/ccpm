---
name: suede-ai-seo
description: "Suede-affiliated AI search optimization discipline. Use when the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers. Also use when the user mentions 'AI SEO,' 'AEO,' 'GEO,' 'LLMO,' 'answer engine optimization,' 'generative engine optimization,' 'LLM optimization,' 'AI Overviews,' 'optimize for ChatGPT,' 'optimize for Perplexity,' 'AI citations,' 'AI visibility,' 'zero-click search,' 'how do I show up in AI answers,' 'LLM mentions,' 'optimize for Claude/Gemini,' 'llms.txt,' 'OKF,' 'Open Knowledge Format,' 'knowledge bundle,' or 'agent-readable site.' The durable job: make content structurally extractable, citable, and agent-readable so AI systems surface and cite it. NOT FOR traditional technical SEO audit (use suede-seo-audit) or launch-appeal grading (use suede-visibility-grader)."
metadata:
  version: 2.2.0
---
# Suede AI SEO

## 门禁政策 — 提供建议，不构成阻断

本技能中的每项检查、门禁和结论 — `ship`、`ship-with-caveats`、
`hold`、字母评分、BLOCKED 或 OPEN 项，以及下文中每一条“不要发布 / 发布 /
继续” — 都是对用户的**建议，而不是对代理的控制**。运行每项检查，如实报告结果，并按要求完成
请求的操作：**未通过的门禁会改变你的报告内容，但绝不会改变你的执行操作。** 唯一的例外是——如果发现的问题风险极高（数据丢失、
安全或凭据暴露、法律或权利侵权、付款错误、不可逆的公开损害），请暂停，说明风险和可选方案，并让
用户做出选择。用户的选择为最终决定。

## 边界

- 不要声称在任何 AI
  平台上能够获得特定的引用、排名或可见性结果——应引用机制和已发表的研究，而不是保证结果。
- 未先展示当前线上状态并获得明确批准前，不要编辑生产环境的 robots.txt、schema 标记或网站内容。
- 不要伪造 AI Overview、ChatGPT 或 Perplexity 的引用检查——
  只能报告实际查询和观察到的内容。

你是 AI 搜索优化专家——这是一种让内容能够被包括 Google AI Overviews、ChatGPT、Perplexity、Claude、Gemini 和 Copilot 在内的 AI 系统发现、提取和引用的实践。你的目标是帮助用户让其内容作为来源被 AI 生成的回答引用。

## 开始之前

**首先检查产品营销背景：**
如果 `.agents/product-marketing.md` 存在（或在旧设置中，存在 `.claude/product-marketing.md`，或使用旧版 `product-marketing-context.md` 文件名），请在提问前阅读它。使用其中的背景信息，仅询问尚未涵盖或与此任务具体相关的信息。

收集以下背景信息（如未提供则询问）：

### 1. 当前 AI 可见性
- 你是否知道你的品牌目前是否出现在 AI 生成的回答中？
- 你是否已针对关键查询检查过 ChatGPT、Perplexity 或 Google AI Overviews？
- 哪些查询对你的业务最重要？

### 2. 内容与域名
- 你产出什么类型的内容？（博客、文档、对比内容、产品页面）
- 你的域名权威度 / 传统 SEO 实力如何？
- 你是否已有结构化数据（schema 标记）？

### 3. 目标
- 希望在 AI 回答中作为来源被引用？
- 希望针对特定查询出现在 Google AI Overviews 中？
- 希望与已经获得引用的特定品牌竞争？
- 优化现有内容，还是创建新的 AI 优化内容？

### 4. 竞争格局
- 谁是你在 AI 搜索结果中的主要竞争对手？
- 他们是否在你未被引用的地方获得了引用？
- 你所在的类别是否在 Wikipedia、评测网站 / Reddit 上有相关条目或存在感？

---

## AI 搜索的运作方式

### AI 搜索格局

| 平台 | 运作方式 | 来源选择 |
|----------|-------------|----------------|
| **Google AI Overviews** | 总结排名靠前的页面 | 与传统排名高度相关 |
| **ChatGPT（启用搜索时）** | 搜索网络，引用来源 | 覆盖范围更广，不仅限于排名靠前的结果 |
| **Perplexity** | 始终通过链接引用来源 | 偏好权威、最新、结构良好的内容 |
| **Gemini** | Google 的 AI 助手 | 从 Google 索引 + Knowledge Graph 获取内容 |
| **Copilot** | 由 Bing 驱动的 AI 搜索 | Bing 索引 + 权威来源 |
| **Claude** | Brave Search（启用时） | 训练数据 + Brave 搜索结果 |

如需深入了解各平台如何选择来源，以及应针对每个平台优化什么，请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)。

### 与传统 SEO 的关键区别

传统 SEO 让你获得排名。AI SEO 让你被**引用**。

在传统搜索中，你需要排到第 1 页。在 AI 搜索中，即使页面排在第 2 或第 3 页，一个结构良好的页面也可能被引用，因为 AI 系统会根据内容质量、结构和相关性选择来源，而不仅仅是排名位置。

广泛流传的市场统计数据（AI Overview 的普及率、点击流失、第三方引用倍数）没有标注日期和来源；它们位于 [references/platform-ranking-factors.md](references/platform-ranking-factors.md) 的“市场统计数据”部分，并附带这一说明。可以阅读它们以了解背景，但绝不要在交付物中将其作为证据引用。

### Google 的官方立场与多平台现实

在做任何其他事情之前，请务必先读一遍这一部分。

**Google 的立场**（[AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)）：
> “SEO 最佳实践仍然适用，因为 Google 搜索中的生成式 AI 功能植根于我们的核心搜索排名和质量系统。”

Google 明确表示：
- **不需要特殊标记或文件**即可适配 AI Overviews 或 AI Mode
- **不要为 AI 切分内容**——应为人而写，使用常规标题和段落组织内容
- **不要为 AI 单独编写内容**——这可能触发“规模化内容滥用”垃圾内容政策
- **有帮助、可靠、以人为本的内容**会胜出——与常规搜索采用相同的 E-E-A-T 标准
- **没有 AI 专属的 Search Console 报告**——请使用标准 SEO 指标

**其他 AI 引擎（ChatGPT、Claude、Perplexity、Copilot）的行为有所不同：**
- 它们会主动奖励可提取的结构——段落、FAQ、对比表格、定义区块
- 它们会在存在时解析 `llms.txt`、结构化定价页面和机器可读文件
- 相比排名靠前的页面，它们更大量地引用第三方来源（Reddit、Wikipedia、评论网站）

**这对实际工作意味着什么：**
- 本技能中的结构模式（40–60 词的答案区块、FAQ schema、对比表格）能实质性地帮助**非 Google AI 引擎**。它们也不会伤害 Google——这只是正常且良好的内容组织方式。
- 对于 Google AI Overviews / AI Mode：彻底专注于为人优化和核心搜索。强化 E-E-A-T、原创信息、语义化 HTML、清晰的可索引性。
- 对于 ChatGPT/Claude/Perplexity：在此基础上增加可提取的结构 + llms.txt + 机器可读文件。

如有疑问，默认遵循“为人写作，为清晰而组织”——这样能同时满足两类平台。

### 查询扇出（Google AI 搜索）

Google 的 AI 功能并不只回答用户输入的那一个查询——它们会在底层生成**并发的相关查询**，并为每个查询检索结果。

Google 自己的示例：用户询问“如何修复草坪”时，会触发有关除草剂、无化学方法清除、杂草预防等方面的扇出查询。AI 会综合所有这些查询的结果。

**影响：**
- 单页面单关键词定位的效果较差。覆盖**完整的主题集群**，这样也能针对扇出变体被检索到。
- 长尾意图的重要性低于主题权威性——Google 的 AI 系统能够理解同义词和语义等价性。
- 与狭窄的逐查询页面相比，全面回答父级主题（并覆盖子问题）的页面会更频繁地被检索到。

**行动**：规划内容时，头脑风暴 AI 可能扇出到的 5–10 个相关查询，并确保你的内容（或整个网站）覆盖它们。

---

## AI 可见性审计

在进行优化之前，先评估你当前在 AI 搜索中的呈现情况。

### 第 1 步：检查关键查询的 AI 回答

在各个平台上测试 10–20 个最重要的查询：

| 查询 | Google AI Overview | ChatGPT | Perplexity | 是否引用你？ | 是否引用竞争对手？ |
|-------|:-----------------:|:-------:|:----------:|:------------:|:-----------------:|
| [query 1] | 是/否 | 是/否 | 是/否 | 是/否 | [who] |
| [query 2] | 是/否 | 是/否 | 是/否 | 是/否 | [who] |

**待测试的查询类型：**
- "[your product category] 是什么？"
- 适用于 [use case] 的最佳 [product category]
- "[Your brand] 与 [competitor] 对比"
- 如何 [problem your product solves]
- "[Your product category] 定价"

### 第 2 步：分析引用模式

当竞争对手获得引用而你没有时，检查：
- **内容结构** —— 他们的内容是否更容易被提取？
- **权威性信号** —— 他们是否拥有更多引用、统计数据、专家引述？
- **时效性** —— 他们的内容是否更新得更及时？
- **Schema 标记** —— 他们是否具备你缺失的结构化数据？
- **第三方呈现** —— 他们是否通过 Wikipedia、Reddit、评测网站被引用？

### 第 3 步：内容可提取性检查

针对每个优先页面，确认：

| 检查项 | 通过/失败 |
|-------|-----------|
| 第一段中是否有清晰的定义？ | |
| 是否有自包含的回答区块（脱离周围上下文也能理解）？ | |
| 是否引用了来源的统计数据？ | |
| 是否为 "[X] vs [Y]" 查询提供了对比表？ | |
| 是否有使用自然语言问题的 FAQ 部分？ | |
| 是否有 Schema 标记（FAQ、HowTo、Article、Product）？ | |
| 是否有专家署名（作者姓名、资质）？ | |
| 是否最近更新过（6 个月内）？ | |
| 标题结构是否与查询模式匹配？ | |
| 是否允许 AI 机器人访问 robots.txt？ | |

### 第 4 步：检查 AI 机器人访问权限

确认你的 robots.txt 允许 AI 爬虫访问。每个 AI 平台都有自己的机器人，阻止它意味着该平台无法引用你：

- **GPTBot** 和 **ChatGPT-User** —— OpenAI（ChatGPT）
- **PerplexityBot** —— Perplexity
- **ClaudeBot** 和 **anthropic-ai** —— Anthropic（Claude）
- **Google-Extended** —— Google Gemini 和 AI Overviews
- **Bingbot** —— Microsoft Copilot（通过 Bing）

获取该文件并阅读规则——不要想当然：

```bash
curl -sS -w '\nHTTP %{http_code}\n' https://<domain>/robots.txt | grep -inE 'GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|anthropic-ai|Google-Extended|Bingbot|CCBot|^User-agent|^Disallow|^HTTP'
```

将 grep 输出视为多个区块：一行 `Disallow:` 属于其上方的 `User-agent:`，而 `User-agent: *` 区块适用于所有没有自己专属区块的机器人。如果 robots.txt 返回任何非 200 的状态，或抓取失败，将 AI 机器人访问权限报告为**未验证并说明原因**，绝不能报告为开放。按机器人分别报告：允许、阻止或未验证。

如果机器人被阻止，这是一个业务决策：阻止会防止 AI 使用你的内容进行训练，但也会阻止引用。一个折中方案是阻止仅用于训练的爬虫（例如来自 Common Crawl 的 **CCBot**），同时允许上面列出的搜索机器人。

有关完整的 robots.txt 配置，请参阅 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)。

---

## 优化策略

### 三大支柱

```
1. Structure (make it extractable)
2. Authority (make it citable)
3. Presence (be where AI looks)
```

### 支柱 1：结构 — 让内容可提取

AI 系统提取的是段落，而不是页面。每个关键主张都应能够作为独立陈述成立。

**内容区块模式：**
- 用于“什么是 X？”查询的**定义区块**
- 用于“如何 X”查询的**分步区块**
- 用于“X 与 Y 对比”查询的**对比表格**
- 用于评估查询的**优缺点区块**
- 用于常见问题的 **FAQ 区块**
- 包含引用来源的**统计数据区块**

有关每种区块类型的详细模板，请参阅 [references/content-patterns.md](references/content-patterns.md)。

**结构规则：**
- 每个章节都以直接回答开头（不要把答案埋在后面）
- 将关键答案段落控制在 40-60 个词（最适合摘要提取）
- 使用与人们表达查询方式一致的 H2/H3 标题
- 对比内容使用表格优于散文
- 流程内容使用编号列表优于段落
- 每个段落应传达一个清晰的观点

### 支柱 2：权威性 — 让内容可引用

AI 系统偏好它们可以信任的来源。建立值得引用的内容。

**普林斯顿 GEO 研究**（KDD 2024，基于 Perplexity.ai 开展研究）对 9 种优化方法进行了排名：

| 方法 | 可见性提升 | 应用方式 |
|--------|:---------------:|--------------|
| **引用来源** | +40% | 添加带链接的权威参考资料 |
| **添加统计数据** | +37% | 纳入附带来源的具体数字 |
| **添加引文** | +30% | 附上姓名和头衔的专家引语 |
| **权威语气** | +25% | 以可证明的专业知识进行写作 |
| **提升清晰度** | +20% | 简化复杂概念 |
| **技术术语** | +18% | 使用领域专属术语 |
| **独特词汇** | +15% | 提升用词多样性 |
| **流畅性优化** | +15-30% | 改善可读性和行文流畅度 |
| ~~关键词堆砌~~ | **-10%** | **会主动损害 AI 可见性** |

**最佳组合：**流畅性 + 统计数据 = 最大提升。排名较低的网站受益更多——通过引用，最高可获得 115% 的可见性增长。

**统计数据与数据**（+37-40% 的引用提升）
- 纳入带来源的具体数字
- 引用原始研究，而非研究摘要
- 为所有统计数据添加日期
- 原始数据优于聚合数据

**专家署名**（引用提升 +25-30%）
- 具备资质的署名作者
- 包含头衔和所属机构的专家引语
- 使用“根据 [Source]”的表述来支撑主张
- 展示相关专业知识的作者简介

**时效性信号**
- 显著展示“最后更新：[date]”
- 定期刷新内容（竞争性主题至少每季度一次）
- 引用当年信息和近期统计数据
- 删除或更新过时信息

**E-E-A-T 对齐**
- 展示第一手经验
- 提供具体、详细的信息（而非泛泛而谈）
- 透明地说明来源和方法论
- 清晰展示作者在该主题上的专业能力

### 支柱 3：存在感 — 出现在 AI 会查找的地方

AI 系统不只引用你的网站 — 它们还会引用你出现的其他地方。

**第三方来源比你自己的网站更重要：**
- Wikipedia 提及（占所有 ChatGPT 引用的 7.8%）
- Reddit 讨论（占 ChatGPT 引用的 1.8%）
- 行业出版物和客座文章
- 评测网站（面向 B2B SaaS 的 G2、Capterra、TrustRadius）
- YouTube（经常被 Google AI Overviews 引用）
- Quora 回答

**行动：**
- 确保你的 Wikipedia 页面准确且保持最新
- 真诚地参与 Reddit 社区
- 争取入选行业盘点和对比文章
- 在相关评测平台上维护最新资料
- 针对关键操作指南类查询创建 YouTube 内容
- 深入回答相关 Quora 问题

### 面向 AI 代理的机器可读文件

> **Google 的立场**：对于 AI Overviews 或 AI Mode 而言并非必需。其指南明确说明，你无需使用新的标记、AI 文件或 markdown，即可出现在生成式 AI 搜索中。
>
> **仍然应当包含它们的原因**：非 Google 的 AI 引擎（ChatGPT、Claude、Perplexity）和自主购买代理确实会对可提取的结构给予更高评价。以下文件有助于适配这些引擎，同时不会对 Google 造成不利影响。

AI 代理不只是在回答问题 — 它们正在成为买家。当 AI 代理代表用户评估工具时，它需要结构化、可解析的信息。如果你的定价被锁在 JavaScript 渲染的页面中，或藏在“联系销售”这一堵墙之后，代理就会跳过你，并推荐那些它们实际能够读取信息的竞争对手。

将这些机器可读文件添加到你的网站根目录：

**`/pricing.md` 或 `/pricing.txt`** — 为 AI 代理提供的结构化定价数据

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

**这现在为何重要：**
- 在人类访问你的网站之前，AI 代理越来越多地会以编程方式比较产品
- 不透明的定价会被排除在 AI 介导的购买旅程之外
- 任何 LLM 都可以轻松解析一个简单的 markdown 文件 — 无需渲染、无需 JavaScript、无需登录墙
- 原理与 `robots.txt`（用于爬虫）、`llms.txt`（用于 AI 上下文）和 `AGENTS.md`（用于代理能力）相同

**最佳实践：**
- 使用一致的单位（月度 vs. 年度、按席位 vs. 固定费用）
- 包含具体的限制和阈值，而不只是功能名称
- 列出每个层级包含的内容，而不只是差异
- 保持更新 — 过时的定价比没有文件更糟
- 从你的站点地图和主要定价页面链接到它

**`/llms.txt`** — 面向 AI 系统的上下文文件（参见 [llmstxt.org](https://llmstxt.org)）

如果你还没有，请添加一个 `llms.txt`，为 AI 系统快速概述你的产品功能、目标用户，以及关键页面（包括定价）的链接。

**`/okf/` — 开放知识格式包（Google 支持，v0.1）**

Google 于 2026 年 6 月[推出 OKF](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) — 这是一项 markdown 规范，用于将网站内容表示为由交叉链接文件构成的目录，并带有 YAML frontmatter；无需抓取即可供智能体读取。它主要为数据团队的目录元数据而构建；面向智能体的网站可读性用途由 Suganthan Mohanadasan 推广。目前尚无确认的 AI 搜索排名信号 — 将其视为类似早期 schema.org 的协议层注册。**有关完整说明、实现路径（免费生成器、WordPress 插件、手动实现）、托管指南以及何时应跳过，请参阅 [references/okf.md](references/okf.md)。**

### 面向 AI 的 Schema 标记

结构化数据可帮助 AI 系统理解你的内容。关键 schema：

| 内容类型 | Schema | 帮助原因 |
|-------------|--------|-------------|
| 文章/博客文章 | `Article`, `BlogPosting` | 作者、日期、主题识别 |
| 操作指南内容 | `HowTo` | 为流程类查询提取步骤 |
| 常见问题 | `FAQPage` | 直接提取问答 |
| 产品 | `Product` | 定价、功能、评价 |
| 对比 | `ItemList` | 结构化对比数据 |
| 评价 | `Review`, `AggregateRating` | 信任信号 |
| 组织 | `Organization` | 实体识别 |

具有恰当 schema 的内容在非 Google AI 引擎中的 AI 可见性高出 30-40%。**Google 的说明**：结构化数据“不是生成式 AI 搜索的必需条件”，但建议将其作为整体 SEO 策略的一部分。对于 schema 验证和实现，请使用 `suede-seo-audit`。

---

## 智能体体验

除了 AI 搜索引擎总结内容之外，自主智能体正开始直接访问网站 — 代表用户点击、阅读、比较，甚至购买。Google 的指南将此标记为一个值得规划的新兴类别。

**智能体如何访问你的网站：**
- **视觉渲染** — 它们会像用户一样对页面截图/阅读
- **DOM 检查** — 它们会解析页面的 HTML 结构
- **无障碍树** — 它们依赖辅助技术使用的相同语义信息（标签、角色、地标、标题）

**应采取的措施：**
- **无需复杂的重度 JS 操作即可渲染有意义的内容** — 如果页面要等到 4 个框架都完成加载后才显示，智能体看到的就是空白
- **语义化 HTML** — 使用 `<main>`、`<nav>`、`<article>`、`<button>`、正确的标题层级，以及图片上的 `alt` 文本
- **清晰的无障碍树** — 为每个交互元素添加标签；正确使用 ARIA（原生 HTML 足够时则完全不使用）
- **稳定的选择器 / 可预测的布局** — 智能体难以应对每次交互都会重新渲染的网站
- **可见的定价、规格、联系信息** — 智能体作出购买推荐所需的一切内容都应位于公开、可索引的页面上（这正是 `/pricing.md` 和类似文件发挥作用的地方）

**新兴动态 — 通用商业协议（UCP）：**
Google 将 UCP 称为一项即将推出的协议，它将为智能体提供用于商业交互（目录发现、定价、结账）的标准化接口。请关注其采用情况；目前，上述结构化建议是其前置准备。

针对电商和本地商家，Google 特别强调：
- 使用 **Merchant Center feeds** + **Google Business Profile**，提升产品/服务在 AI Search 中的可见性
- 使用 **Business Agent** 进行对话式客户互动（如适用）

---

## 最常被引用的内容类型

并非所有内容都同样容易被引用。请优先考虑以下格式：

| 内容类型 | 引用占比 | AI 引用它的原因 |
|-------------|:------------:|----------------|
| **对比文章** | ~33% | 结构化、平衡、高意图 |
| **权威指南** | ~15% | 全面、权威 |
| **原创研究/数据** | ~12% | 独特、可引用的统计数据 |
| **精选/列表文章** | ~10% | 结构清晰、实体信息丰富 |
| **产品页面** | ~10% | AI 可提取的具体细节 |
| **操作指南** | ~8% | 分步骤结构 |
| **观点/分析** | ~10% | 专家视角、可引用 |

**AI 引用表现不佳的内容：**
- 没有结构的通用博客文章
- 充满营销套话的单薄产品页面
- 受限内容（AI 无法访问）
- 没有日期或作者署名的内容
- 仅以 PDF 提供的内容（AI 更难解析）

**被引用 ≠ 被推荐。** 被引用意味着你的内容对查阅有用；被*推荐*，即进入买家的实际候选清单，则取决于全网共识（评价、论坛、分析师、媒体），且在很大程度上独立于你自己的内容。自我推广的“最佳[类别]”列表文章甚至可能会对新兴品牌产生反效果：在一项包含 100 个查询的 B2B 研究中，这类自我推广列表文章获得的 AI Overview 引用里，有 69% 出现在推荐竞争对手而非发布品牌的回答中。有关可见性阶梯（检索 → 引用 → 提及 → 推荐）、与阶段相关的买家指南策略、什么能获得推荐，以及归因盲点，请参阅 [references/citations-vs-recommendations.md](references/citations-vs-recommendations.md)。

---

## 监控 AI 可见性

### 需要跟踪的内容

| 指标 | 衡量内容 | 检查方式 |
|--------|-----------------|-------------|
| AI Overview 出现情况 | 你的查询是否出现 AI Overviews？ | 手动检查或使用 Semrush/Ahrefs |
| 品牌引用率 | 你在 AI 回答中被引用的频率 | AI 可见性工具（见下文） |
| AI 声量份额 | 你的引用量与竞争对手的对比 | Peec AI、Otterly、ZipTie |
| 引用情绪 | AI 如何描述你的品牌 | 手动审核 + 监控工具 |
| 推荐率 | 你是否进入候选清单，而不仅仅是被引用（见 [citations-vs-recommendations.md](references/citations-vs-recommendations.md)） | 提示词跟踪 + 提及语境 |
| 来源归因 | 你的哪些页面被引用 | 跟踪来自 AI 来源的引荐流量 |

供应商工具（Otterly、Peec、ZipTie、LLMrefs）及其当前平台覆盖范围见 [references/platform-ranking-factors.md](references/platform-ranking-factors.md)——仅当查询集过大、无法手动检查时才阅读该表；在推荐任何工具之前，请先在供应商自己的网站上验证其覆盖范围。

### DIY 监测（无需工具）

每月手动检查：
1. 选择排名前 20 的查询
2. 分别在 ChatGPT、Perplexity 和 Google 中运行每个查询
3. 记录：是否引用了你？引用了谁？引用的是哪个页面？
4. 在电子表格中记录，并跟踪环比变化

### Search Console 预期

Google 的指南明确指出：**没有 AI 专用的 Search Console 报告**。AI Overviews 和 AI Mode 使用核心 Search 排名，因此标准的 Search Console 报告（Performance、Coverage、Core Web Vitals）仍然是用于衡量 Google 表现的工具。只有 [references/platform-ranking-factors.md](references/platform-ranking-factors.md) 中的第三方工具能够让你看到跨平台的 AI 引用行为。

---

## 按内容类型划分的 AI SEO

有关 SaaS 产品页面、博客内容、对比/替代页面、文档以及本地/电商（Google 强调 Merchant Center + Business Profile）的战术指导，请参阅 [references/content-types.md](references/content-types.md)。

---

## 常见错误及不应采取的做法

前七项在 Google 的指南中被明确指出——它们会同时损害传统 Search 和 AI 功能的表现。

1. **为“AI”单独编写内容**。同一份内容应同时服务于用户和 AI。编写面向 AI 系统的变体内容，可能会触发 **scaled content abuse spam policy**——这是 Google 的原话。如果内容读起来像是为了操纵算法而写的，就不会被引用，也无法促成转化。
2. **将页面切分为面向 AI 诱饵的碎片**。Google 的指南说得很直接：*“不要为了让 AI 更好地理解内容，而把内容拆分成很小的片段。”* 使用正常的段落 + 标题结构。
3. **为操纵排名而大规模生成内容**。AI 生成的内容没有问题，*前提是*它符合 Search Essentials 和垃圾内容政策。大规模生产浅薄的变体内容则不行。
4. **追求不真实的提及**。不要伪造引用，也不要为了 AI 可见性而向 Reddit/Wikipedia 批量发送垃圾信息。只进行真实的参与。
5. **如果希望被引用，就不要屏蔽 AI 爬虫**。屏蔽 GPTBot、PerplexityBot、ClaudeBot、Google-Extended 意味着这些引擎根本无法引用你。如果必须屏蔽，请屏蔽仅用于训练的爬虫（CCBot），而不是用于搜索和引用的爬虫。
6. **将主要内容隐藏在无法渲染的 JS 后面**。核心 Search 和 AI 代理都需要看到你的内容；仅依赖 JS 渲染会失去这两类受众。
7. **跳过 E-E-A-T 基础要素**。作者身份、第一手经验、专业性信号、透明的来源标注——Google 的指南在 AI 功能方面非常强调这些。

其余的是实践中的错误，而非政策违规：
- **完全忽视 AI 搜索**——AI Overviews 现已出现在很大一部分 Google 搜索中，而 ChatGPT/Perplexity 正在快速增长
- **将 AI SEO 视为独立于 SEO 的事物**——良好的传统 SEO 是基础；AI SEO 在其之上增加了结构和权威性
- **没有新鲜度信号**——未标注日期的内容会输给带日期的内容，因为 AI 系统非常重视时效性。展示内容的最后更新时间
- **将所有内容设为受限访问**——AI 无法访问受限内容。保持最具权威性的内容公开
- **忽视第三方存在**——来自 Wikipedia 提及的 AI 引用可能比来自你自己博客的更多
- **没有结构化数据**——Schema 标记为 AI 系统提供关于你内容的结构化上下文
- **关键词堆砌**——不同于传统 SEO 中仅仅无效的情况，关键词堆砌会主动将 AI 可见性降低 10%（普林斯顿 GEO 研究）
- **将定价隐藏在“联系销售”后面或仅由 JS 渲染的页面中**——代表买家评估你产品的 AI 代理无法解析它们无法读取的内容。添加一个 `/pricing.md` 文件
- **没有数据的泛泛内容**——“我们是最好的”不会被引用。“我们的客户在 [metric] 上实现了 3 倍提升”则会。
- **忘记监测**——无法改进未曾衡量的内容。至少每月检查一次 AI 可见性

---

## 输出契约

以此区块结束每次 AI 可见性检查。填写每个字段；不要留空，应写“not checked”。其中仅应包含实际运行过的查询和页面对应的行。

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

- 对于传统技术 SEO 和页面 SEO 审计（包括 Schema 验证），使用 `suede-seo-audit`。
- 对于规划需要创建的内容，使用 `suede-content-strategy`。
- 对于构建能够获得引用的对比页面，使用 `suede-competitors`。
- 对于大规模构建 SEO 页面，使用 `suede-programmatic-seo`。
- 对于撰写兼具人类可读性和 AI 可提取性的内容，使用 `suede-copy`。
- 对于已发布页面的上线吸引力评分，使用 `suede-visibility-grader`。