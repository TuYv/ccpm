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
  version: "2.2.5"
  category: seo
---
# AI 搜索 / GEO 优化（2026 年 5 月）

## 主要来源：Google 的 AI 优化指南

Google 的官方立场发布于 Search Central 文档中：

> “从 Google 的角度来看，针对生成式 AI 搜索进行优化**仍然属于 SEO**。AEO 和 GEO 只是对同一项工作的重新命名。”

阅读 `references/google-ai-optimization-guide.md` 以获取完整综合内容、误区澄清列表（`llms.txt`、分块、AI 改写、提及刷量均已被 Google 认定为无效），以及用于评估内容质量的 Who/How/Why 测试。

审计应将 GEO 发现描述为**应用于 AI 搜索界面的 SEO 基础原则**，而不是一门独立的优化学科。当社区建议与 Google 的主要来源相矛盾时，应以 Google 的观点为准，并在报告中注明这一矛盾。

## 关键统计数据

| 指标 | 数值 | 来源 |
|--------|-------|--------|
| AI Overviews 覆盖范围 | 每月活跃用户超过 25 亿，数据据报道来自 Google I/O 2026 主题演讲报道；未经 Google 自有来源确认；覆盖 200 多个国家和地区 | 第三方 I/O 报道 |
| AI Overviews 查询覆盖率 | 约 50% 的查询（第三方测量结果；因国家和地区而异） | 行业数据 |
| AI Mode 月活跃用户 | 超过 10 亿，据报道来自 Google I/O 2026 主题演讲报道；未经 Google 自有来源确认 | 第三方 I/O 报道 |
| AI Mode 模型 | Gemini 2.5 的定制版本 | Google |
| AI 引荐会话增长率 | 527%（2025 年 1 月至 5 月） | SparkToro |
| ChatGPT 周活跃用户 | 9 亿 | OpenAI |
| Perplexity 月查询量 | 超过 5 亿 | Perplexity |

## 关键洞察：品牌提及 > 反向链接

**品牌提及与 AI 可见性的相关性比反向链接高 3 倍。**
（Ahrefs 于 2025 年 12 月对 75,000 个品牌进行的研究）

| 信号 | 与 AI 引用的相关性 |
|--------|------------------------------|
| YouTube 提及 | 约 0.737（最强） |
| Reddit 提及 | 高 |
| Wikipedia 存在度 | 高 |
| LinkedIn 存在度 | 中等 |
| Domain Rating（反向链接） | 约 0.266（弱） |

**只有 11% 的域名**会针对同一查询同时被 ChatGPT 和 Google AI Overviews 引用，因此针对不同平台进行优化至关重要。

---

## GEO 分析标准（已更新）

### 1. 可引用性评分（25%）

**134-167 个单词的段落长度最适合被 AI 引用。**此外，**约 44% 的 AI
引用来自页面最前 30% 的内容**（SE Ranking 研究），应将最适合引用的、自成一体的答案置于前面，而不是埋在首屏以下。

**强信号：**
- 清晰、可直接引用且包含具体事实/统计数据的句子
- 自成一体的答案区块（无需上下文即可提取）
- 在章节开头 40-60 个单词内直接给出答案
- 使用具体来源为主张注明出处
- 遵循“X 是……”或“X 指的是……”模式的定义
- 其他地方找不到的独特数据点

**弱信号：**
- 模糊、笼统的陈述
- 没有证据支持的观点
- 被埋藏的结论
- 没有具体数据点

### 2. 结构可读性（20%）

**92% 的 AI Overview 引用来自排名前 10 的页面**，但其中 47% 来自排名低于第 5 位的页面，这表明其采用了不同的选择逻辑。

**强信号：**
- 清晰的 H1->H2->H3 标题层级
- 基于问题的标题（匹配查询模式）
- 简短段落（2-4 句）
- 使用表格呈现对比数据
- 使用有序/无序列表呈现分步内容或多项内容
- FAQ 部分采用清晰的问答格式

**弱信号：**
- 没有结构、整篇堆砌文字
- 标题层级不一致
- 没有列表或表格
- 信息埋藏在段落中

### 3. 多模态内容（15%）

包含多模态元素的内容，其**被选中的概率高出 156%**。

**检查以下内容：**
- 文本 + 相关图片
- 视频内容（嵌入或链接）
- 信息图表和图表
- 交互式元素（计算器、工具）
- 支持媒体内容的结构化数据

### 4. 权威性与品牌信号（20%）

**强信号：**
- 带有资历信息的作者署名
- 发布日期和最后更新日期
- **时效性**：3 个月以内的内容在 AI 回答中被引用的可能性约高出 3 倍；长期超过 6 个月未更新的页面会失去被引用的资格（SE Ranking，基于 130 万条引用的研究）。制定定期更新计划，是 GEO 投入产出比最高的策略之一。
- 引用一手来源（研究、官方文档、数据）
- 组织资质和附属关系
- 署名明确的专家引言
- 在 Wikipedia、Wikidata 中具有实体信息
- 在 Reddit、YouTube、LinkedIn 上被提及

**弱信号：**
- 匿名作者
- 没有日期
- 没有引用来源
- 在各个平台上都没有品牌影响力

### 5. 技术可访问性（20%）

**AI 爬虫不会执行 JavaScript。**服务端渲染至关重要。

**检查以下内容：**
- 服务端渲染（SSR）与仅客户端内容的区别
- robots.txt 中是否允许 AI 爬虫访问
- 是否存在并正确配置 llms.txt 文件
- RSL 1.0 许可条款

---

## AI 爬虫检测

检查 `robots.txt` 中是否包含以下 AI 爬虫：

| 爬虫 | 所有者 | 用途 | 是否遵守 robots.txt？ |
|---------|-------|---------|---|
| GPTBot | OpenAI | ChatGPT 网页搜索 | 是 |
| OAI-SearchBot | OpenAI | OpenAI 搜索功能 | 是 |
| ChatGPT-User | OpenAI | ChatGPT 浏览（用户触发） | 否（用户触发） |
| ClaudeBot | Anthropic | Claude 网页功能 | 是 |
| PerplexityBot | Perplexity | Perplexity AI 搜索 | 是 |
| CCBot | Common Crawl | 训练数据（通常会被阻止） | 是 |
| anthropic-ai | Anthropic | Claude 训练 | 是 |
| Bytespider | ByteDance | TikTok/Douyin AI | 是 |
| cohere-ai | Cohere | Cohere 模型 | 是 |
| Google-Extended | Google | Gemini/Vertex 训练与 grounding 选择退出 | 是 |
| Google-CloudVertexBot | Google | 由网站所有者请求的 Vertex AI Agent 爬取 | 是 |
| Google-Agent | Google | 代理式浏览（Project Mariner），代表用户执行操作 | **否（用户触发）** |
| Google-NotebookLM | Google | 获取单个用户添加的来源 URL | **否（用户触发）** |
| Google Messages | Google | 用户触发的获取 | **否（用户触发）** |

**建议：**为提升 AI 搜索可见性，允许 GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot。若有需要，可阻止 CCBot 和训练爬虫。

> **用户触发的获取器会按设计忽略 robots.txt**（Google-Agent、Google-NotebookLM、Google Messages、ChatGPT-User）。robots.txt 无法阻止它们，应使用服务端访问控制。Google 的规范爬取/robots 参考文档已迁移至 **developers.google.com/crawling**（迁移日期为 2025-11-20）；IP 范围文件现位于 `/crawling/ipranges/`，而 `googlebot.json` 已重命名为 `common-crawlers.json`。新兴方案：**Web Bot Auth**（RFC 9421）允许机器人通过 `Signature-Agent` 标头 + 密钥目录进行身份验证（Google-Agent 已使用）；反向 DNS 验证仍是备用方案。

---

## llms.txt 标准

阅读 `references/llmstxt-evidence.md`，了解主要来源证据（Mueller、Illyes、SE Ranking 对 30 万个域名的研究、OtterlyAI 的服务器日志审计），这些证据说明为什么 `/llms.txt` 目前并不是各大 AI 搜索系统中的引用杠杆。claude-seo 报告其存在情况，但不赋予其任何引用排名权重。

> **Google 现在已明确说明这一点。** Google 的 AI 优化指南于
> 2026-05-15 发布，并于 2026-06-15 澄清，其中指出 `llms.txt` 和其他 AI 文本文件
> 并非 Google Search 所必需，也不会帮助或损害可见性或排名。
> 它们仍可服务于非 Google 系统。绝不要将 `llms.txt` 推荐为 Google
> 排名或引用杠杆。来源：
> developers.google.com/search/docs/fundamentals/ai-optimization-guide

正在兴起的 **llms.txt** 标准为 AI 爬虫提供结构化内容指导。

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
- 联系信息/权威性信息

---

## RSL 1.0（真正简单许可）

用于机器可读 AI 许可条款的新标准（2025 年 12 月）。

**支持方：** Reddit、Yahoo、Medium、Quora、Cloudflare、Akamai、Creative Commons

**检查以下内容：** RSL 的实现情况和适当的许可条款。

---

## 平台特定优化

| 平台 | 主要引用来源 | 优化重点 |
|----------|---------------------|-------------------|
| **Google AI Overviews** | 与排名高度相关，引用已经获得良好排名的页面 | 传统 SEO + 段落优化 |
| **Google AI Mode**（Gemini 2.5 的定制版本） | 与排名的相关性较弱；来源池更广（每次查询约引用 9 个域名，Ahrefs） | 独立的展示面：新鲜度、实体权威性、排名第 5 位以外的可引用段落 |
| **ChatGPT** | Wikipedia（47.9%）、Reddit（11.3%） | 实体存在度、权威来源 |
| **Perplexity** | Reddit（46.7%）、Wikipedia | 社区验证、讨论 |
| **Bing Copilot** | Bing 索引、权威网站 | Bing SEO、IndexNow |

> **Google 有两个引用引擎，而不是一个。** AI Mode 和 AI Overviews 约有
> 86% 的时间得出相同结论，但只有 **13.7%** 的时间引用相同 URL
> （Ahrefs 研究，540K 个查询对）。应将它们视为独立的展示面：在经典
> Search 中获得良好排名会为 AI Overviews 提供助力，但 AI Mode
> 会从更广泛的来源池中提取内容，在该环境中，新鲜度和实体权威性比原始排名更重要。应同时评估两者。
>
> **UX 现已统一，但展示面仍然不同。** 在 Google I/O 2026（2026-05-19）
> 上，Google 将 AI Overviews 和 AI Mode 合并为“一个无缝衔接的 AI Search 体验”
>（问题 → AI Overview → 在 AI Mode 中继续提问），并推出了新的智能 Search
> 框。*体验* 是一条流程，但两个引用引擎在技术上仍然彼此独立（使用不同的模型/链接集），
> 因此仍应同时评估两者。

### AI 搜索中的引用展示形式与控制方式（2026）

Google 在 AI 概览**和** AI 模式中新增了多种 AI 引用/来源展示形式（2026 年 5 月）：

- **首选来源**：用户可以选择符合条件的域名或子域名，使其内容更有可能出现在该用户的焦点新闻中，并有资格在 AI 模式或 AI 概览中获得首选徽章。这是**针对单个用户的偏好设置**，而非有明确文档说明的通用排名信号。发布商可以提供 Google 的交互式按钮或深层链接，但不应承诺提升整个网站的排名。来源：
  developers.google.com/search/docs/appearance/preferred-sources
- **“高引用度”徽章**：通过发布被其他文章引用的原创一手报道获得。
- **社区观点**：提升 Reddit、论坛和第一手内容的展示权重。
- 内嵌链接、桌面端悬停**链接预览**以及醒目的链接轮播。

**控制 AI 功能中的展示：**不存在**专用于 AI 的选择退出文件**。内容是否出现在 AI 概览和 AI 模式中，由标准预览/索引指令控制，包括 `nosnippet`、`data-nosnippet`、`max-snippet`、`noindex`（这些与上文所述的第三方 AI 爬虫 robots 控制不同）。来源：developers.google.com/search/docs/appearance/ai-features

**搜索智能体（已上线，而非仅限于 WebMCP）：**Google 的“信息智能体”会在后台运行以监控主题，此外还针对特定类别提供智能体式预订/电话呼叫功能（将于 2026 年夏季逐步向美国用户推出），因此，面向智能体的页面优化（真实的交互元素、无障碍树、布局稳定性）如今不仅影响引用，也影响操作执行。

---

## 输出

生成 `GEO-ANALYSIS.md`，其中包含：

1. **GEO 就绪度评分：XX/100**
2. **平台细分评分**（Google AIO、ChatGPT、Perplexity 评分）
3. **AI 爬虫访问状态**（允许/阻止了哪些爬虫）
4. **llms.txt 状态**（已存在、缺失、建议）
5. **品牌提及分析**（在 Wikipedia、Reddit、YouTube、LinkedIn 上的存在情况）
6. **段落级可引用性**（识别最佳的 134-167 词内容块）
7. **服务端渲染检查**（JavaScript 依赖分析）
8. **影响最大的 5 项变更**
9. **Schema 建议**（用于提升 AI 可发现性）
10. **内容格式调整建议**（需要重写的具体段落）

---

## 快速见效项

1. 在前 60 个词内添加“什么是[主题]？”的定义
2. 创建 134-167 词、可独立理解的回答内容块
3. 添加以问题形式表述的 H2/H3 标题
4. 包含有来源支持的具体统计数据
5. 添加发布日期/更新日期
6. 为作者实施 Person schema
7. 在 robots.txt 中允许关键 AI 爬虫

## 中等工作量

1. 创建 `/llms.txt` 文件（可选：Google 搜索会忽略它；可能对其他 AI 爬虫有帮助）
2. 添加包含资历及 Wikipedia/LinkedIn 链接的作者简介
3. 确保关键内容采用服务端渲染
4. 在 Reddit、YouTube 上建立实体存在
5. 添加包含数据的对比表格
6. 实施 FAQ 部分（采用结构化内容，而非面向商业网站的 schema）

## 高影响项

1. 开展原创研究/调查（形成独特的可引用性）
2. 为品牌/关键人物建立 Wikipedia 页面
3. 建立包含内容提及的 YouTube 频道
4. 实施全面的实体链接（跨平台使用 sameAs）
5. 开发独特的工具或计算器

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `ai_optimization_chat_gpt_scraper` 检查 ChatGPT 网页搜索针对目标查询返回的内容（真实的 GEO 可见性检查），并结合使用 `ai_opt_llm_ment_search` 和 `ai_opt_llm_ment_top_domains`，跟踪各 AI 平台中的 LLM 提及情况。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 失败、连接被拒绝） | 清晰报告错误。不要猜测网站内容。建议用户验证 URL 后重试。 |
| AI 爬虫被 robots.txt 阻止 | 准确报告哪些爬虫被阻止、哪些爬虫被允许。提供为启用 AI 搜索可见性而需要添加的具体 robots.txt 指令。 |
| 未找到 llms.txt | 说明该文件不存在（它是可选文件；Google 搜索会忽略它），并为非 Google AI 爬虫提供一个可直接使用的 llms.txt 模板。 |
| 未检测到结构化数据 | 报告这一缺失，并提供具体的 schema 建议（Article、Organization、Person），以提高 AI 可发现性。 |

## FLOW 框架集成

对于提示词引导的 AI 内容优化，请使用 `/seo flow optimize <url>`，FLOW 的 21 个优化阶段提示词可通过基于证据的 AI 提示词，与 GEO 的可引用性和结构分析形成互补。