---
name: seo-geo
description: >
  Optimize content for AI Overviews (formerly SGE), ChatGPT web search,
  Perplexity, and other AI-powered search experiences. Generative Engine
  Optimization (GEO) analysis including brand mention signals, AI crawler
  accessibility, llms.txt compliance, passage-level citability scoring, and
  platform-specific optimization. Use when user says "AI Overviews", "SGE",
  "GEO", "AI search", "LLM optimization", "Perplexity", "AI citations",
  "ChatGPT search", or "AI visibility".
user-invocable: true
argument-hint: "[url]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.3.1"
  category: seo
---
# AI 搜索 / GEO 优化（2026 年 5 月）

## 主要来源：Google 的 AI 优化指南

Google 在 Search Central 文档中发布的官方立场：

> “从 Google 的角度来看，针对生成式 AI 搜索进行优化**仍然属于 SEO**。AEO 和 GEO 只是对同一项工作的重新命名。”

请阅读 `references/google-ai-optimization-guide.md` 以获取完整综合内容、误区澄清列表（`llms.txt`、分块、AI 改写、提及堆砌，这些做法均被 Google 认定为无效），以及用于评估内容质量的 Who/How/Why 测试。

审计应将 GEO 发现描述为**应用于 AI 搜索界面的 SEO 基础实践**，而不是一套独立的优化学科。当社区建议与 Google 的主要来源相矛盾时，应以 Google 的观点为准，并在报告中注明这一矛盾。

## 关键统计数据

| 指标 | 数值 | 来源 |
|--------|-------|--------|
| AI Overviews 覆盖的用户数 | 每月活跃用户超过 25 亿，据 Google I/O 2026 主题演讲报道；并非来自 Google 自有来源；覆盖 200 多个国家/地区 | 第三方 I/O 报道 |
| AI Overviews 查询覆盖率 | 约 50% 的查询（第三方测量结果；因国家/地区而异） | 行业数据 |
| AI Mode 月活跃用户数 | 超过 10 亿，据 Google I/O 2026 主题演讲报道；并非来自 Google 自有来源 | 第三方 I/O 报道 |
| AI Mode 模型 | Gemini 2.5 的定制版本 | Google |
| AI 引荐会话增长率 | 527%（2025 年 1 月至 5 月） | SparkToro |
| ChatGPT 周活跃用户数 | 9 亿 | OpenAI |
| Perplexity 月查询量 | 超过 5 亿 | Perplexity |

## 关键洞察：品牌提及 > 反向链接

**品牌提及与 AI 可见度的相关性比反向链接高 3 倍。**
（Ahrefs 于 2025 年 12 月针对 75,000 个品牌开展的研究）

| 信号 | 与 AI 引用的相关性 |
|--------|------------------------------|
| YouTube 提及 | 约 0.737（最强） |
| Reddit 提及 | 高 |
| Wikipedia 存在情况 | 高 |
| LinkedIn 存在情况 | 中等 |
| Domain Rating（反向链接） | 约 0.266（弱） |

**只有 11% 的域名**会因同一查询同时被 ChatGPT 和 Google AI Overviews 引用，因此平台特定的优化至关重要。

---

## GEO 分析标准（已更新）

### 1. 可引用性评分（25%）

**134-167 个单词是适合 AI 引用的最佳段落长度。**并且，AI
引用中约 **44% 来自页面的前 30%**（SE Ranking 的研究结果），应将最适合引用的、自成一体的答案前置，而不是将其埋在首屏以下。

**强信号：**
- 清晰、可直接引用且包含具体事实/统计数据的句子
- 自成一体的答案块（无需上下文即可提取）
- 在章节开头 40-60 个单词内直接回答问题
- 使用具体来源为主张提供归属
- 遵循“X 是……”或“X 指的是……”模式的定义
- 其他地方找不到的独特数据点

**弱信号：**
- 模糊、泛泛而谈的陈述
- 没有证据支撑的观点
- 被埋藏的结论
- 没有具体数据点

### 2. 结构可读性（20%）

**92% 的 AI Overview 引用来自排名前 10 的页面**，但其中 47% 来自排名低于第 5 位的页面，这表明其采用了不同的选择逻辑。

**强信号：**
- 清晰的 H1->H2->H3 标题层级
- 基于问题的标题（匹配查询模式）
- 简短段落（2-4 句话）
- 使用表格呈现对比数据
- 使用有序/无序列表呈现分步说明或多项内容
- 具有清晰问答格式的 FAQ 部分

**弱信号：**
- 没有结构、堆砌成大段文字
- 标题层级不一致
- 没有列表或表格
- 信息隐藏在段落中

### 3. 多模态内容（15%）

包含多模态元素的内容，其被选中的概率高出 **156%**。

**检查以下内容：**
- 文本 + 相关图片
- 视频内容（嵌入或链接）
- 信息图表和图表
- 交互式元素（计算器、工具）
- 支持媒体内容的结构化数据

### 4. 权威性与品牌信号（20%）

**强信号：**
- 带有作者资历的作者署名
- 发布日期和最后更新日期
- **时效性**，3 个月以内的内容出现在 AI 答案中的概率约高出 3 倍；长期超过 6 个月未更新的页面会失去被引用资格（SE Ranking，基于 130 万条引用的研究）。定期更新机制是 GEO 中投入产出比最高的策略之一。
- 引用一手来源（研究、官方文档、数据）
- 组织资质和关联机构
- 带有归属信息的专家引言
- 在 Wikipedia、Wikidata 中的实体信息
- 在 Reddit、YouTube、LinkedIn 上的提及

**弱信号：**
- 作者身份不明
- 没有日期
- 没有引用来源
- 品牌在各平台上缺乏影响力

### 5. 技术可访问性（20%）

**AI 爬虫不会执行 JavaScript。** 服务端渲染至关重要。

**检查以下内容：**
- 服务端渲染（SSR）与仅客户端内容的区别
- `robots.txt` 中是否允许 AI 爬虫访问
- 是否存在并正确配置 `llms.txt` 文件
- RSL 1.0 许可条款

---

## AI 爬虫检测

检查 `robots.txt` 中是否包含以下 AI 爬虫：

| 爬虫 | 所有者 | 用途 | 是否遵守 robots.txt？ |
|---------|-------|---------|---|
| GPTBot | OpenAI | **仅用于模型训练**（不用于 ChatGPT Search） | 是 |
| OAI-SearchBot | OpenAI | **用于 ChatGPT Search 的可引用性**（决定是否引用该内容的爬虫） | 是 |
| ChatGPT-User | OpenAI | ChatGPT 浏览（由用户触发） | 否（由用户触发） |
| ClaudeBot | Anthropic | **仅用于模型训练**（不用于 Claude 的搜索功能） | 是 |
| Claude-SearchBot | Anthropic | **用于 Claude/Claude.ai 搜索结果的可引用性**（决定是否引用该内容的爬虫） | 是 |
| Claude-User | Anthropic | 代表用户浏览 Claude（由用户触发） | 否（由用户触发） |
| PerplexityBot | Perplexity | Perplexity AI 搜索 | 是 |
| CCBot | Common Crawl | 训练数据（通常会被屏蔽） | 是 |
| Bytespider | ByteDance | TikTok/Douyin AI | 是 |
| cohere-ai | Cohere | Cohere 模型 | 是 |
| Google-Extended | Google | **仅用于 Gemini/Vertex 训练和信息 grounding**（不用于 Google Search） | 是 |
| Google-CloudVertexBot | Google | 由网站所有者请求的 Vertex AI Agent 爬取 | 是 |
| Google-Agent | Google | 代理式浏览（Project Mariner），代表用户执行操作 | **否（由用户触发）** |
| Google-NotebookLM | Google | 获取单个用户添加的来源 URL | **否（由用户触发）** |
| Google Messages | Google | 由用户触发的获取 | **否（由用户触发）** |
| Applebot-Extended | Apple | **仅用于选择退出 Apple Intelligence / 生成式 AI 训练数据**（不用于 Siri、Spotlight 或 Safari 搜索；它本身不会爬取内容，而是对 Applebot 已获取的内容进行标记） | 是 |

来源：[OpenAI 爬虫](https://platform.openai.com/docs/bots)、  
[Google 爬虫概览](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)、  
[Anthropic 爬虫支持文章](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)、  
[Apple Applebot-Extended 支持文章](https://support.apple.com/en-us/119829)。  
Anthropic 当前的爬虫支持文章仅记录了 ClaudeBot、Claude-User  
和 Claude-SearchBot；其中没有列出 `anthropic-ai`，因此已移除此前未经验证的  
`anthropic-ai` 行，而不是将其作为猜测保留。

**建议：**允许 OAI-SearchBot、Claude-SearchBot 和 PerplexityBot，以提高 AI  
搜索可见性。GPTBot、ClaudeBot、CCBot 和 Applebot-Extended 是仅用于训练的信号，  
应根据许可偏好决定允许或阻止它们，而不是根据搜索可见性来决定。

### 针对所作声明检查正确的 bot

有两对 bot 经常被混淆。**下面的每项声明只能由其对应 bot 的 robots.txt 状态提供支持**，请分别检查并分别报告。

| 你想要作出的声明 | 要检查的 Bot | 不支持该声明的 Bot |
|---|---|---|
|“内容可在 ChatGPT Search 中引用”| `OAI-SearchBot` | `GPTBot` |
|“内容可用于 OpenAI 模型训练”| `GPTBot` | `OAI-SearchBot` |
|“内容可用于 Gemini/Vertex 训练和 grounding”| `Google-Extended` | `Googlebot` |
|“内容符合 Google Search / AI Overviews 的收录条件”| `Googlebot` | `Google-Extended` |
|“内容可在 Claude 的搜索功能中引用”| `Claude-SearchBot` | `ClaudeBot` |
|“内容可用于 Anthropic 模型训练”| `ClaudeBot` | `Claude-SearchBot` |
|“内容可用于 Apple Intelligence 训练”| `Applebot-Extended` | `Applebot` |
|“内容可通过 Siri、Spotlight 或 Safari 搜索发现”| `Applebot` | `Applebot-Extended` |

- **`Google-Extended` 仅用于控制 Gemini 和 Vertex AI 的训练及 grounding 使用。**它不会影响普通 Google Search 的收录，也不会影响 AI Overviews 和 AI  
  Mode；后两者都基于 `Googlebot` 索引提供服务。**切勿将 `Google-Extended` 评分为“Google Search 准备度”信号，也切勿以被阻止的  
  `Google-Extended` 为依据，声称网站未出现在 Google Search 中。**
- **决定 ChatGPT Search 是否可以引用内容的爬虫是 `OAI-SearchBot`。  
  `GPTBot` 是 OpenAI 独立的训练爬虫。**检查 `GPTBot` 的访问权限无法说明  
  ChatGPT Search 是否能够引用该页面。阻止 `GPTBot` 但允许 `OAI-SearchBot` 的网站，  
  仍完全可以在 ChatGPT Search 中被引用。
- **决定内容能否在 Claude 自有搜索功能中引用的爬虫是 `Claude-SearchBot`。  
  `ClaudeBot` 是 Anthropic 独立的训练爬虫**（根据 Anthropic 的爬虫支持文章）。检查  
  `ClaudeBot` 的访问权限无法说明 Claude 搜索是否可以引用内容，反之亦然；请分别报告二者。
- **`Applebot-Extended` 是训练数据退出信号，并不是会自行抓取页面的爬虫。**根据 Apple 的支持文章，禁止  
  `Applebot-Extended` 会使网站退出 Apple Intelligence / 生成式模型的训练使用，但只要允许  
  `Applebot`，页面仍可通过 Siri、Spotlight 和 Safari 被发现。切勿以被阻止的  
  `Applebot-Extended` 为依据，声称网站未出现在 Apple 的搜索界面中。

不要在报告正文中交替使用这些名称。当报告爬虫访问情况时，请明确写出所检查的具体 user-agent，以及它所控制的具体能力。

> **用户触发的抓取器按设计会忽略 robots.txt**（Google-Agent、Google-NotebookLM、Google Messages、ChatGPT-User）。robots.txt 无法阻止它们，请使用服务器端访问控制。Google 的规范抓取/robots 参考文档已迁移至 **developers.google.com/crawling**（迁移日期：2025-11-20）；IP 范围文件现位于 `/crawling/ipranges/`，`googlebot.json` 已重命名为 `common-crawlers.json`。新兴方案：**Web Bot Auth**（RFC 9421）允许机器人通过 `Signature-Agent` 请求头和密钥目录进行身份验证（Google-Agent 已使用）；反向 DNS 验证仍是备用方案。

---

## llms.txt 标准

阅读 `references/llmstxt-evidence.md`，其中包含 Mueller、Illyes、SE Ranking 的 30 万域名研究以及 OtterlyAI 服务器日志审计提供的一手证据，说明为什么 `/llms.txt` 目前不是主要 AI 搜索系统的引用杠杆。claude-seo 会报告其存在，但不会赋予其任何引用排名权重。

> **Google 现在已明确说明这一点。** Google 的 AI 优化指南于
> 2026-05-15 发布，并于 2026-06-15 澄清，其中指出 `llms.txt` 和其他 AI 文本文件
> 对 Google Search 并无必要，也不会帮助或损害可见性或排名。
> 它们仍可能服务于非 Google 系统。绝不要将 `llms.txt` 推荐为 Google
> 排名或引用杠杆。来源：
> developers.google.com/search/docs/fundamentals/ai-optimization-guide

新兴的 **llms.txt** 标准为 AI 爬虫提供结构化内容指导。

**位置：** `/llms.txt`（域名根目录）

**格式：**
```
# Title of site
> Brief description

## Main sections
- [Page title](url): Description
- [Another page](url): Description

## Optional: Key facts
- Fact 1
- Fact 2
```

**检查以下内容：**
- 是否存在 `/llms.txt`
- 结构化内容指导
- 重点页面摘要
- 联系方式/权威性信息

---

## RSL 1.0（Really Simple Licensing）

用于机器可读 AI 授权条款的新标准（2025 年 12 月）。

**支持方：** Reddit、Yahoo、Medium、Quora、Cloudflare、Akamai、Creative Commons

**检查内容：** RSL 的实现情况以及适当的授权条款。

---

## 平台特定优化

| 平台 | 关键引用来源 | 优化重点 |
|----------|---------------------|---|
| **Google AI Overviews** | 与排名高度相关，会引用已经获得良好排名的页面 | 传统 SEO + 段落优化 |
| **Google AI Mode**（Gemini 2.5 的定制版本） | 与排名的相关性较弱；来源池更广（Ahrefs：每个查询约引用 9 个域名） | 独立的展示面：新鲜度、实体权威性，以及排名第 5 位之外的可引用段落 |
| **ChatGPT** | Wikipedia（47.9%）、Reddit（11.3%） | 实体存在度、权威来源 |
| **Perplexity** | Reddit（46.7%）、Wikipedia | 社区验证、讨论内容 |
| **Bing Copilot** | Bing 索引、权威网站 | Bing SEO、IndexNow |

> **Google 有两个引用引擎，而不是一个。** AI Mode 和 AI Overviews 得出的结论约有
> 86% 相同，但引用相同 URL 的比例仅为 **13.7%**
> （Ahrefs 研究，涵盖 54 万对查询）。请将它们视为独立的展示面：在传统 Search
> 中排名良好会影响 AI Overviews，但 AI Mode 来源于更广泛的内容池，
> 新鲜度和实体权威性的重要性高于原始排名位置。请同时对两者进行评分。
>
> **AI Mode 也是预订入口（2026-08-27）。** 航班价格跟踪
> （覆盖 180 多个国家和地区）及电子邮件提醒、通过集成合作伙伴预订酒店，
> 以及以积分或里程显示票价，如今都可以在 AI Mode 内完成。旅游和酒店客户应检查合作伙伴资格；
> 这里没有任何已记录的排名变化。
>
> **UX 现已统一，但展示面仍然不同。** 在 Google I/O 2026（2026-05-19）上，
> Google 将 AI Overviews 和 AI Mode 合并为“一个无缝衔接的 AI Search 体验”
> （提问 → AI Overview → 在 AI Mode 中继续追问），并推出了新的智能 Search
> 框。*体验* 是一个完整流程，但两个引用引擎在技术上仍然不同（模型/链接集合不同），
> 请继续分别对两者进行评分。

### AI 搜索中的引用界面与控制项（2026）

Google 在 AI Overviews **和** AI Mode 中新增了许多 AI 引用/来源界面（2026 年 5 月）：

- **Preferred Sources**，符合条件的域名或子域名可由用户选定，使其内容更有可能出现在该用户的 Top Stories 中，并有资格在 AI Mode 或 AI Overviews 中显示首选来源标识。这是一个**针对单个用户的偏好设置**，并非有文档说明的通用排名信号。发布者可以提供 Google 的交互式按钮或深层链接，但不应承诺能够提升全站排名。来源：
  developers.google.com/search/docs/appearance/preferred-sources
- **“Highly Cited” 标识**，通过其他文章引用原创的一手报道获得。
- **Community Perspectives**，提升 Reddit、论坛和第一手内容的展示位置。
- 内嵌链接、桌面端悬停显示的 **Link Previews**，以及醒目的链接轮播。

**控制 AI 功能中的展示：**不存在专用于 AI 的退出文件。在 AI Overviews 和 AI Mode 中的展示由标准的预览/索引指令、`nosnippet`、`data-nosnippet`、`max-snippet`、`noindex` 控制（这与上文第三方 AI 爬虫控制项不同）。来源：
developers.google.com/search/docs/appearance/ai-features

**搜索代理（实时运行，而不仅是 WebMCP）：**Google 的“Information Agents”会在后台监控主题，并针对部分类别提供代理式预订/呼叫功能（将于 2026 年夏季逐步向美国用户推出）。因此，面向代理优化页面（真实的交互元素、无障碍树、布局稳定性）如今对于执行操作同样重要，而不仅仅是获取引用。

---

## 输出

生成 `GEO-ANALYSIS.md`，包含：

1. **GEO 准备度评分：XX/100**
2. **平台细分**（Google AIO、ChatGPT、Perplexity 评分）
3. **AI 爬虫访问状态** -- 分别报告每个爬虫及其控制的能力。训练访问权限（`GPTBot`、`Google-Extended`、`CCBot`、`ClaudeBot`、`Applebot-Extended`）和搜索引用能力（`OAI-SearchBot`、`Googlebot`、`PerplexityBot`、`Claude-SearchBot`、`Applebot`）属于不同的发现，绝不能合并为一行。
4. **llms.txt 状态**（存在、缺失、建议）
5. **品牌提及分析**（在 Wikipedia、Reddit、YouTube、LinkedIn 上的存在情况）
6. **段落级可引用性**（识别出 134-167 词的最佳区块）
7. **服务器端渲染检查**（JavaScript 依赖分析）
8. **影响最大的前 5 项变更**
9. **Schema 建议**（提升 AI 可发现性）
10. **内容重新格式化建议**（指出需要重写的具体段落）

---

## 快速见效项

1. 在前 60 个词内添加“什么是 [topic]？”定义
2. 创建 134-167 词的自包含答案区块
3. 添加问题形式的 H2/H3 标题
4. 添加带来源的具体统计数据
5. 添加发布日期/更新日期
6. 为作者实施 Person schema
7. 在 robots.txt 中允许关键 AI 爬虫访问

## 中等工作量

1. 创建 `/llms.txt` 文件（可选：Google Search 会忽略它；可能对其他 AI 爬虫有所帮助）
2. 添加包含资历以及 Wikipedia/LinkedIn 链接的作者简介
3. 确保关键内容采用服务器端渲染
4. 在 Reddit、YouTube 上建立实体存在
5. 添加包含数据的比较表格
6. 实施 FAQ 区块（结构化内容；商业网站不应使用 schema）

## 高影响力

1. 创建原创研究/调查（具备独特的可引用性）
2. 为品牌/关键人物建立 Wikipedia 影响力
3. 建立包含相关内容提及的 YouTube 频道
4. 实施全面的实体关联（跨平台使用 sameAs）
5. 开发独特的工具或计算器

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `ai_optimization_chat_gpt_scraper` 检查 ChatGPT 网络搜索对目标查询返回的结果（真实的 GEO 可见性检查），并使用 `ai_opt_llm_ment_search` 和 `ai_opt_llm_ment_top_domains` 跟踪各 AI 平台中的 LLM 提及情况。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 失败、连接被拒绝） | 清楚地报告错误。不要猜测网站内容。建议用户验证 URL 后重试。 |
| AI 爬虫被 robots.txt 阻止 | 准确报告哪些爬虫被阻止、哪些爬虫被允许。提供用于启用 AI 搜索可见性的具体 robots.txt 指令。 |
| 未找到 llms.txt | 说明缺少该文件（可选文件；Google Search 会忽略它），并提供一个可直接使用的 llms.txt 模板，供非 Google AI 爬虫使用。 |
| 未检测到结构化数据 | 报告这一缺口，并提供具体的 schema 建议（Article、Organization、Person），以提升 AI 可发现性。 |

## FLOW 框架集成

对于由提示词引导的 AI 内容优化，请使用 `/seo flow optimize <url>`；FLOW 的 21 个优化阶段提示词可通过基于证据的 AI 提示词，将 GEO 的可引用性和结构分析作为补充。