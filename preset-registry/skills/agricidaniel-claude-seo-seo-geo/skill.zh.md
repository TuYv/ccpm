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
  version: "2.2.6"
  category: seo
---
# AI 搜索 / GEO 优化（2026 年 5 月）

## 主要来源：Google 的 AI 优化指南

Google 在 Search Central 文档中发布的官方立场：

> “从 Google 的角度看，针对生成式 AI 搜索进行优化**仍然是 SEO**。
> AEO 和 GEO 只是同一项工作的重新包装标签。”

阅读 `references/google-ai-optimization-guide.md`，了解完整综合说明、辟谣清单（`llms.txt`、分块、AI 改写、提及量刷榜，Google 均认为无效），以及用于内容质量评估的 Who/How/Why 测试。

审计应将 GEO 发现表述为**应用于 AI 搜索界面的 SEO 基础原则**，而不是一个独立的优化学科。当社区建议与 Google 这一主要来源相矛盾时，应以 Google 为准，并在报告中注明该矛盾。

## 关键统计数据

| 指标 | 数值 | 来源 |
|--------|-------|--------|
| AI Overviews 覆盖范围 | 25 亿+ 月活跃用户，来自 Google I/O 2026 主题演讲报道；未由 Google 自有来源确认；200+ 个国家/地区 | 第三方 I/O 报道 |
| AI Overviews 查询覆盖率 | 约 50% 的查询（第三方测量；因国家/地区而异） | 行业数据 |
| AI Mode 月用户数 | 10 亿+，来自 Google I/O 2026 主题演讲报道；未由 Google 自有来源确认 | 第三方 I/O 报道 |
| AI Mode 模型 | Gemini 2.5 的定制版本 | Google |
| AI 引荐会话增长 | 527%（2025 年 1 月至 5 月） | SparkToro |
| ChatGPT 周活跃用户 | 9 亿 | OpenAI |
| Perplexity 月查询量 | 5 亿+ | Perplexity |

## 关键洞察：品牌提及 > 反向链接

**品牌提及与 AI 可见性的相关性比反向链接强 3 倍。**
（Ahrefs 2025 年 12 月对 75,000 个品牌的研究）

| 信号 | 与 AI 引用的相关性 |
|--------|------------------------------|
| YouTube 提及 | 约 0.737（最强） |
| Reddit 提及 | 高 |
| Wikipedia 存在度 | 高 |
| LinkedIn 存在度 | 中等 |
| Domain Rating（反向链接） | 约 0.266（弱） |

**只有 11% 的域名**会在同一查询中同时被 ChatGPT 和 Google AI Overviews 引用，因此针对特定平台进行优化至关重要。

---

## GEO 分析标准（已更新）

### 1. 可引用性评分（25%）

**最佳段落长度：134-167 个词**，适合 AI 引用。此外，**约 44% 的 AI
引用来自页面前 30% 的内容**（SE Ranking 研究），因此应将最可引用、可独立理解的答案前置，而不是埋在首屏以下。

**强信号：**
- 清晰、可引用的句子，包含具体事实/统计数据
- 可独立理解的答案块（无需上下文即可提取）
- 在章节前 40-60 个词内直接回答
- 主张附有具体来源
- 定义遵循 “X is...” 或 “X refers to...” 模式
- 其他地方找不到的独特数据点

**弱信号：**
- 含糊、笼统的陈述
- 没有证据支持的观点
- 被埋藏的结论
- 没有具体数据点

### 2. 结构可读性（20%）

**92% 的 AI Overview 引用来自排名前 10 的页面**，但 47% 来自排名低于第 5 位的页面，这表明其选择逻辑有所不同。

**强信号：**
- 清晰的 H1->H2->H3 标题层级
- 基于问题的标题（匹配查询模式）
- 短段落（2-4 句）
- 用表格呈现对比数据
- 用有序/无序列表呈现分步或多项内容
- FAQ 部分采用清晰的问答格式

**弱信号：**
- 没有结构的大段文字
- 标题层级不一致
- 没有列表或表格
- 信息埋在段落中

### 3. 多模态内容 (15%)

包含多模态元素的内容，获得选择的比例高出 **156%**。

**检查项：**
- 文本 + 相关图片
- 视频内容（嵌入或链接）
- 信息图和图表
- 交互元素（计算器、工具）
- 支持媒体的结构化数据

### 4. 权威性与品牌信号 (20%)

**强信号：**
- 带有资质说明的作者署名
- 发布日期和最后更新日期
- **时效性**，3 个月以内的内容被 AI 答案引用的可能性约高出 3 倍；闲置 6 个月以上的页面会失去引用资格（SE Ranking，130 万引用研究）。定期刷新计划是杠杆最高的 GEO 手段之一。
- 引用一手来源（研究、官方文档、数据）
- 组织资质和从属关系
- 带署名的专家引言
- 实体出现在 Wikipedia、Wikidata 中
- 在 Reddit、YouTube、LinkedIn 上被提及

**弱信号：**
- 匿名作者
- 没有日期
- 没有引用来源
- 品牌在各平台缺乏存在感

### 5. 技术可访问性 (20%)

**AI 爬虫不会执行 JavaScript。** 服务端渲染至关重要。

**检查项：**
- 服务端渲染（SSR）与纯客户端内容的对比
- `robots.txt` 中的 AI 爬虫访问权限
- `llms.txt` 文件是否存在及其配置
- RSL 1.0 许可条款

---

## AI 爬虫检测

检查 `robots.txt` 中是否包含这些 AI 爬虫：

| 爬虫 | 所有者 | 用途 | 是否遵守 robots.txt？ |
|---------|-------|---------|---|
| GPTBot | OpenAI | ChatGPT 网页搜索 | 是 |
| OAI-SearchBot | OpenAI | OpenAI 搜索功能 | 是 |
| ChatGPT-User | OpenAI | ChatGPT 浏览（用户触发） | 否（用户触发） |
| ClaudeBot | Anthropic | Claude 网页功能 | 是 |
| PerplexityBot | Perplexity | Perplexity AI 搜索 | 是 |
| CCBot | Common Crawl | 训练数据（通常被屏蔽） | 是 |
| anthropic-ai | Anthropic | Claude 训练 | 是 |
| Bytespider | ByteDance | TikTok/Douyin AI | 是 |
| cohere-ai | Cohere | Cohere 模型 | 是 |
| Google-Extended | Google | Gemini/Vertex 训练与 grounding 退出选项 | 是 |
| Google-CloudVertexBot | Google | 站点所有者请求的 Vertex AI Agent 抓取 | 是 |
| Google-Agent | Google | 代理式浏览（Project Mariner），代表用户操作 | **否（用户触发）** |
| Google-NotebookLM | Google | 获取用户单独添加的源 URL | **否（用户触发）** |
| Google Messages | Google | 用户触发的获取 | **否（用户触发）** |

**建议：** 允许 GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot，以获得 AI 搜索可见性。可按需屏蔽 CCBot 和训练爬虫。

> **用户触发的获取器按设计会忽略 robots.txt**（Google-Agent、Google-NotebookLM、Google Messages、ChatGPT-User）。robots.txt 无法屏蔽它们，请使用服务端访问控制。Google 的规范爬取/robots 参考文档已迁移到 **developers.google.com/crawling**（2025-11-20 迁移）；IP 范围文件现在位于 `/crawling/ipranges/`，并且 `googlebot.json` 已重命名为 `common-crawlers.json`。新兴方案：**Web Bot Auth**（RFC 9421）允许机器人通过 `Signature-Agent` header + key directory 进行身份验证（Google-Agent 使用）；反向 DNS 验证仍是备用方案。

---

## llms.txt 标准

阅读 `references/llmstxt-evidence.md`，其中包含主要来源证据（Mueller、Illyes、SE Ranking 对 30 万个域名的研究、OtterlyAI 的服务器日志审计），说明为什么 `/llms.txt` 目前并不是各大 AI 搜索系统的引用影响因素。claude-seo 会报告其存在，但不会赋予任何引用排名权重。

> **Google 现在已明确说明这一点。** Google 于 2026-05-15 发布、并于 2026-06-15 澄清的 AI 优化指南指出，Google Search 不需要 `llms.txt` 和其他 AI 文本文件；它们不会帮助或损害可见性或排名。
> 它们仍可能服务于非 Google 系统。绝不要将 `llms.txt` 推荐为 Google 排名或引用影响因素。来源：
> developers.google.com/search/docs/fundamentals/ai-optimization-guide

新兴的 **llms.txt** 标准为 AI 爬虫提供结构化内容指引。

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
- 结构化内容指引
- 重点页面概览
- 联系方式/权威性信息

---

## RSL 1.0（Really Simple Licensing）

面向机器可读 AI 许可条款的新标准（2025 年 12 月）。

**支持方：** Reddit、Yahoo、Medium、Quora、Cloudflare、Akamai、Creative Commons

**检查：** RSL 实现以及适当的许可条款。

---

## 特定平台优化

| 平台 | 主要引用来源 | 优化重点 |
|----------|---------------------|-------------------|
| **Google AI Overviews** | 与排名高度相关，会引用已经获得良好排名的页面 | 传统 SEO + 段落优化 |
| **Google AI Mode**（Gemini 2.5 的定制版本） | 与排名的相关性较弱；来源池更广（Ahrefs：每个查询约引用 9 个域名） | 独立的展示面：新鲜度、实体权威性、排名第 5 位之外的可引用段落 |
| **ChatGPT** | Wikipedia（47.9%）、Reddit（11.3%） | 实体存在、权威来源 |
| **Perplexity** | Reddit（46.7%）、Wikipedia | 社区验证、讨论 |
| **Bing Copilot** | Bing 索引、权威网站 | Bing SEO、IndexNow |

> **Google 有两个引用引擎，而不是一个。** AI Mode 和 AI Overviews 得出的结论约有 **86%** 相同，但引用的相同 URL 仅占 **13.7%**（Ahrefs 对 540K 组查询对的研究）。应将它们视为两个独立的展示面：在传统 Search 中排名良好会影响 AI Overviews，但 AI Mode 会从更广泛的来源池中获取内容，在其中新鲜度和实体权威性比原始排名更重要。应分别对两者进行评分。
>
> **UX 现在已经统一，但展示面仍然不同。** 在 Google I/O 2026（2026-05-19）上，Google 将 AI Overviews 和 AI Mode 合并为“一个无缝衔接的 AI Search 体验”（问题 → AI Overview → 在 AI Mode 中继续追问），并推出了新的智能 Search 框。*体验* 是一个完整流程，但两个引用引擎在技术上仍然不同（模型/链接集合不同），应继续分别评分。

### AI 搜索中的引用展示面与控制项（2026）

Google 在 AI Overviews **和** AI Mode 中新增了许多 AI 引用/来源展示面（2026 年 5 月）：

- **Preferred Sources**：符合条件的域名或子域名可由用户选择，使其内容更有可能出现在该用户的 Top Stories 中，并有资格在 AI Mode 或 AI Overviews 中显示首选来源徽章。这是**针对单个用户的偏好**，不是有文档说明的通用排名信号。发布者可以提供 Google 的交互式按钮或 deeplink，但不应承诺会提升全站排名。来源：developers.google.com/search/docs/appearance/preferred-sources
- **“Highly Cited” 徽章**：通过原创的一手报道获得，其他文章会引用这些报道。
- **Community Perspectives**：提升 Reddit、论坛和第一手内容的展示。
- 内联链接、桌面端悬停显示的 **Link Previews**，以及醒目的链接轮播。

**控制 AI 功能中的展示：**不存在专门针对 AI 的 opt-out 文件。在 AI Overviews 和 AI Mode 中的展示由标准的预览/索引指令、`nosnippet`、`data-nosnippet`、`max-snippet`、`noindex` 控制（与上文提到的第三方 AI 爬虫 robots 控制项不同）。来源：developers.google.com/search/docs/appearance/ai-features

**搜索代理（实时运行，而不仅是 WebMCP）：**Google 的“Information Agents”会在后台监控主题，同时还为部分类别提供代理式预订/呼叫功能（将于 2026 年夏季逐步向美国用户开放），因此，面向代理优化页面（真实的交互元素、无障碍树、布局稳定性）如今对于执行操作同样重要，而不仅仅是获取引用。

---

## 输出

生成 `GEO-ANALYSIS.md`，包含：

1. **GEO 准备度评分：XX/100**
2. **平台细分**（Google AIO、ChatGPT、Perplexity 评分）
3. **AI 爬虫访问状态**（允许/阻止了哪些爬虫）
4. **llms.txt 状态**（存在、缺失、建议）
5. **品牌提及分析**（品牌是否出现在 Wikipedia、Reddit、YouTube、LinkedIn）
6. **段落级可引用性**（识别出长度最佳的 134-167 字答案块）
7. **服务端渲染检查**（JavaScript 依赖分析）
8. **影响最大的前 5 项改动**
9. **Schema 建议**（提升 AI 可发现性）
10. **内容重排建议**（指出需要重写的具体段落）

---

## 快速见效项

1. 在前 60 个词中添加“[主题] 是什么？”的定义
2. 创建 134-167 字的自包含答案块
3. 添加基于问题的 H2/H3 标题
4. 添加带来源的具体统计数据
5. 添加发布日期/更新日期
6. 为作者实施 Person schema
7. 在 robots.txt 中允许关键 AI 爬虫访问

## 中等工作量

1. 创建 `/llms.txt` 文件（可选：Google Search 会忽略它；但可能对其他 AI 爬虫有所帮助）
2. 添加包含资历信息以及 Wikipedia/LinkedIn 链接的作者简介
3. 确保关键内容采用服务端渲染
4. 在 Reddit、YouTube 上建立实体存在
5. 添加包含数据的比较表
6. 实施 FAQ 部分（结构化实现，不为商业网站使用 schema）

## 高影响力

1. 创建原创研究/调查（形成独特的可引用性）
2. 为品牌/关键人物建立 Wikipedia 词条或存在
3. 建立包含相关内容提及的 YouTube 频道
4. 实施全面的实体链接（跨平台使用 sameAs）
5. 开发独特的工具或计算器

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `ai_optimization_chat_gpt_scraper` 检查 ChatGPT 网络搜索对目标查询的返回结果（真实的 GEO 可见性检查），并使用 `ai_opt_llm_ment_search` 和 `ai_opt_llm_ment_top_domains` 跟踪各 AI 平台中的 LLM 提及情况。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 失败、连接被拒绝） | 清楚地报告错误。不要猜测网站内容。建议用户验证 URL 后重试。 |
| AI 爬虫被 robots.txt 阻止 | 准确报告哪些爬虫被阻止、哪些爬虫被允许。提供可添加的具体 robots.txt 指令，以启用 AI 搜索可见性。 |
| 未找到 llms.txt | 说明该文件不存在（它是可选文件；Google Search 会忽略它），并提供一个可直接使用的 llms.txt 模板，供非 Google AI 爬虫使用。 |
| 未检测到结构化数据 | 报告这一缺口，并提供具体的 schema 建议（Article、Organization、Person），以改善 AI 可发现性。 |

## FLOW 框架集成

对于由提示词指导的 AI 内容优化，请使用 `/seo flow optimize <url>`；FLOW 的 21 个优化阶段提示词可通过基于证据的 AI 提示词，将 GEO 的可引用性和结构分析结合起来。