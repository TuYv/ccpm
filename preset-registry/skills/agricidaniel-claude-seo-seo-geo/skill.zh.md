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
  version: "2.2.4"
  category: seo
---
# AI 搜索 / GEO 优化（2026 年 5 月）

## 主要来源：Google 的 AI 优化指南

Google 在 Search Central 文档中发布的官方立场：

> “从 Google 的角度来看，生成式 AI 搜索优化**仍然是 SEO**。
> AEO 和 GEO 只是对同一项工作重新包装后的称谓。”

请阅读 `references/google-ai-optimization-guide.md`，了解完整综述、误区澄清清单（`llms.txt`、分块、AI 改写、刷提及量，这些做法均被 Google 否定为无效），以及用于评估内容质量的 Who/How/Why 测试。

审计应将 GEO 相关发现表述为**应用于 AI 搜索界面的 SEO 基础原则**，而不是一门独立的优化学科。当社区建议与 Google 的一手来源相矛盾时，应以 Google 为准，并在报告中注明这一矛盾。

## 关键统计数据

| 指标 | 数值 | 来源 |
|--------|-------|--------|
| AI Overviews 覆盖人数 | 每月活跃用户超过 25 亿；数据来自 Google I/O 2026 主题演讲的媒体报道，尚未得到 Google 自有来源确认；覆盖 200 多个国家/地区 | 第三方 I/O 报道 |
| AI Overviews 查询覆盖率 | 约占查询的 50%（第三方测量；因国家/地区而异） | 行业数据 |
| AI Mode 月度用户数 | 超过 10 亿；数据来自 Google I/O 2026 主题演讲的媒体报道，尚未得到 Google 自有来源确认 | 第三方 I/O 报道 |
| AI Mode 模型 | Gemini 2.5 的定制版本 | Google |
| AI 引荐会话增长率 | 527%（2025 年 1 月至 5 月） | SparkToro |
| ChatGPT 每周活跃用户数 | 9 亿 | OpenAI |
| Perplexity 每月查询量 | 超过 5 亿次 | Perplexity |

## 关键洞察：品牌提及 > 反向链接

**品牌提及与 AI 可见度的相关性是反向链接的 3 倍以上。**
（Ahrefs 于 2025 年 12 月对 75,000 个品牌开展的研究）

| 信号 | 与 AI 引用的相关性 |
|--------|------------------------------|
| YouTube 提及 | 约 0.737（最强） |
| Reddit 提及 | 高 |
| Wikipedia 收录情况 | 高 |
| LinkedIn 收录情况 | 中等 |
| 域名评级（反向链接） | 约 0.266（弱） |

对于同一查询，**只有 11% 的域名**会同时被 ChatGPT 和 Google AI Overviews 引用，因此针对不同平台进行专项优化至关重要。

---

## GEO 分析标准（已更新）

### 1. 可引用性评分（25%）

适合 AI 引用的**最佳段落长度为 134-167 个单词**。此外，**约 44% 的 AI 引用来自页面前 30% 的内容**（SE Ranking 研究），因此应将最适合引用且能独立成义的答案前置，而不是将其埋在首屏以下。

**强信号：**
- 清晰、可直接引用且包含具体事实或统计数据的句子
- 能独立成义的答案区块（无需上下文即可提取）
- 在章节开头 40-60 个单词内直接给出答案
- 为论断注明具体来源
- 遵循“X 是……”或“X 指的是……”模式的定义
- 其他地方找不到的独特数据点

**弱信号：**
- 含糊、笼统的陈述
- 没有证据支持的观点
- 被埋在深处的结论
- 没有具体数据点

### 2. 结构可读性（20%）

**92% 的 AI Overview 引用来自排名前 10 的页面**，但其中 47% 来自排名低于第 5 位的页面，这表明其采用了不同的选择逻辑。

**强信号：**
- 清晰的 H1->H2->H3 标题层级
- 使用问题式标题（与查询模式匹配）
- 短段落（2-4 句话）
- 使用表格呈现比较数据
- 使用有序/无序列表呈现分步或包含多个项目的内容
- 采用清晰问答格式的常见问题解答部分

**弱信号：**
- 大段文字堆砌，毫无结构
- 标题层级不一致
- 没有列表或表格
- 信息埋藏在段落中

### 3. 多模态内容（15%）

包含多模态元素的内容，其**被选中率高出 156%**。

**检查以下内容：**
- 文本 + 相关图片
- 视频内容（嵌入或链接）
- 信息图和图表
- 交互式元素（计算器、工具）
- 支持媒体内容的结构化数据

### 4. 权威性与品牌信号（20%）

**强信号：**
- 包含资历信息的作者署名
- 发布日期和最后更新日期
- **时效性**：发布不到 3 个月的内容被 AI 答案引用的可能性约高出 3 倍；超过 6 个月未更新的页面会失去被引用的资格（SE Ranking，130 万条引用研究）。制定定期更新计划是投入产出比最高的 GEO 策略之一。
- 引用一手来源（研究、官方文档、数据）
- 组织资质和隶属关系
- 附有出处的专家引述
- 在 Wikipedia、Wikidata 中有实体条目
- 在 Reddit、YouTube、LinkedIn 上被提及

**弱信号：**
- 匿名作者
- 没有日期
- 未引用任何来源
- 品牌在各平台上均无存在感

### 5. 技术可访问性（20%）

**AI 爬虫不会执行 JavaScript。** 服务端渲染至关重要。

**检查以下内容：**
- 服务端渲染（SSR）与仅客户端内容
- `robots.txt` 中的 AI 爬虫访问权限
- `llms.txt` 文件是否存在及其配置
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
| CCBot | Common Crawl | 训练数据（通常被屏蔽） | 是 |
| anthropic-ai | Anthropic | Claude 训练 | 是 |
| Bytespider | ByteDance | TikTok/抖音 AI | 是 |
| cohere-ai | Cohere | Cohere 模型 | 是 |
| Google-Extended | Google | 选择退出 Gemini/Vertex 训练与事实依据功能 | 是 |
| Google-CloudVertexBot | Google | 网站所有者请求的 Vertex AI Agent 抓取 | 是 |
| Google-Agent | Google | 代理式浏览（Project Mariner），代表用户执行操作 | **否（用户触发）** |
| Google-NotebookLM | Google | 获取用户单独添加的来源 URL | **否（用户触发）** |
| Google Messages | Google | 用户触发的获取操作 | **否（用户触发）** |

**建议：** 允许 GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot，以提升在 AI 搜索中的可见性。如有需要，可屏蔽 CCBot 和训练爬虫。

> **用户触发的获取工具按设计会忽略 robots.txt**（Google-Agent、Google-NotebookLM、Google Messages、ChatGPT-User）。robots.txt 无法屏蔽它们，请使用服务端访问控制。Google 的权威抓取/robots 参考文档已迁移至 **developers.google.com/crawling**（迁移日期为 2025-11-20）；IP 范围文件现位于 `/crawling/ipranges/`，`googlebot.json` 已更名为 `common-crawlers.json`。新兴方案：**Web Bot Auth**（RFC 9421）允许机器人通过 `Signature-Agent` 标头 + 密钥目录进行身份验证（Google-Agent 已采用）；反向 DNS 验证仍是备用方案。

---

## llms.txt 标准

阅读 `references/llmstxt-evidence.md`，了解有关为何 `/llms.txt` 目前并非主流 AI 搜索系统引用影响因素的一手证据（Mueller、Illyes、SE Ranking 的 30 万个域名研究、OtterlyAI 的服务器日志审计）。claude-seo 会报告其是否存在，但不会为其分配任何引用排名权重。

> **Google 现在已明确说明这一点。** Google 的 AI 优化指南（更新于 2026-06-29）指出，对于 Google 搜索（包括其生成式 AI 功能），你**不**需要 `llms.txt` / AI 文本文件，并且这样做“既不会损害（也不会改善）你在 Google 搜索中的可见性或排名，因为 Google 搜索会忽略这些文件”。Mueller 还单独将 llms.txt 的发现用途称为“一条死路”。为**非 Google** AI 服务保留该文件没有问题；切勿将其推荐为影响 Google 排名或引用的手段。来源：developers.google.com/search/docs/fundamentals/ai-optimization-guide

新兴的 **llms.txt** 标准可为 AI 爬虫提供结构化内容指引。

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

**检查以下事项：**
- 是否存在 `/llms.txt`
- 结构化内容指引
- 重点页面说明
- 联系方式/权威性信息

---

## RSL 1.0（真正简单的许可）

用于机器可读 AI 许可条款的新标准（2025 年 12 月）。

**支持方：** Reddit、Yahoo、Medium、Quora、Cloudflare、Akamai、Creative Commons

**检查以下事项：** RSL 的实施情况以及许可条款是否适当。

---

## 特定平台优化

| 平台 | 主要引用来源 | 优化重点 |
|----------|---------------------|-------------------|
| **Google AI Overviews** | 与排名高度相关，引用已经取得良好排名的页面 | 传统 SEO + 段落优化 |
| **Google AI Mode**（Gemini 2.5 的定制版本） | 与排名相关性较弱；来源池更广（根据 Ahrefs 的数据，每个查询引用约 9 个域名） | 独立的展示面：新鲜度、实体权威性、排名第 5 位之后的可引用段落 |
| **ChatGPT** | Wikipedia（47.9%）、Reddit（11.3%） | 实体存在度、权威来源 |
| **Perplexity** | Reddit（46.7%）、Wikipedia | 社区认可、讨论 |
| **Bing Copilot** | Bing 索引、权威网站 | Bing SEO、IndexNow |

> **Google 有两个引用引擎，而非一个。** AI Mode 和 AI Overviews 得出相同
> 结论的比例约为 86%，但引用相同 URL 的比例仅为 **13.7%**
>（Ahrefs 研究，54 万组查询对）。应将它们视为两个独立的展示面：在经典搜索中
> 获得良好排名有助于进入 AI Overviews，但 AI Mode 会从更广泛的来源池中选取内容，
> 在那里，新鲜度和实体权威性比原始排名位置更重要。应分别对两者评分。
>
> **用户体验现已统一，但展示面仍然不同。** 在 Google I/O 2026（2026-05-19）上，
> Google 将 AI Overviews 和 AI Mode 合并为“一个无缝的 AI 搜索体验”
>（问题 → AI Overview → 在 AI Mode 中继续追问），并配备了新的智能搜索
> 框。*体验*上是一个统一流程，但两个引用引擎在技术上仍然不同
>（使用不同的模型/链接集合），因此应继续分别对两者评分。

### AI 搜索中的引用界面与控制（2026）

Google 在 AI Overviews **和** AI Mode 中新增了许多 AI 引用/来源界面（2026 年 5 月）：

- **首选来源**：用户可选择网站，这些网站会在 AI 回答中获得“首选”徽章；自 2026-04-30 起支持所有语言（已选择超过 345K 个来源）；Google 正在努力将其用作排名信号。*快速见效的方法：*鼓励你的受众将品牌添加为首选来源。
- **“高引用率”徽章**：通过提供被其他文章引用的原创一手报道获得。
- **社区观点**：提升 Reddit、论坛和第一手内容的展示权重。
- 内联链接、桌面端悬停**链接预览**以及醒目的链接轮播。

**控制 AI 功能中的展示：**不存在 **AI 专用的选择退出文件**。内容是否出现在 AI Overviews 和 AI Mode 中，由标准预览/索引指令控制，包括 `nosnippet`、`data-nosnippet`、`max-snippet`、`noindex`（与上文针对第三方 AI 爬虫的 robots 控制不同）。来源：developers.google.com/search/docs/appearance/ai-features

**搜索智能体（已上线，而不仅是 WebMCP）：**Google 的“信息智能体”会在后台运行以监控主题，同时还针对部分品类提供智能体式预订/电话服务（将于 2026 年夏季向美国用户逐步推出），因此，面向智能体的页面优化（真实的交互元素、无障碍树、布局稳定性）现在不仅影响引用，也会影响操作执行。

---

## 输出

生成 `GEO-ANALYSIS.md`，其中包含：

1. **GEO 就绪度评分：XX/100**
2. **平台评分明细**（Google AIO、ChatGPT、Perplexity 评分）
3. **AI 爬虫访问状态**（允许/阻止了哪些爬虫）
4. **llms.txt 状态**（存在、缺失、建议）
5. **品牌提及分析**（在 Wikipedia、Reddit、YouTube、LinkedIn 上的存在情况）
6. **段落级可引用性**（识别出最佳的 134-167 词内容块）
7. **服务端渲染检查**（JavaScript 依赖分析）
8. **影响最大的 5 项更改**
9. **Schema 建议**（用于提升 AI 可发现性）
10. **内容重排建议**（需要重写的具体段落）

---

## 快速见效

1. 在前 60 个词中添加“什么是 [topic]？”定义
2. 创建 134-167 词、可独立理解的回答内容块
3. 添加问题形式的 H2/H3 标题
4. 加入有来源的具体统计数据
5. 添加发布日期/更新日期
6. 为作者实现 Person schema
7. 在 robots.txt 中允许关键 AI 爬虫

## 中等工作量

1. 创建 `/llms.txt` 文件（可选：Google Search 会忽略，但可能对其他 AI 爬虫有帮助）
2. 添加包含资历以及 Wikipedia/LinkedIn 链接的作者简介
3. 确保关键内容采用服务端渲染
4. 在 Reddit、YouTube 上建立实体影响力
5. 添加包含数据的对比表格
6. 实现 FAQ 章节（采用结构化形式；商业网站不要使用 schema）

## 高影响力

1. 开展原创研究/调查（具备独特的可引用性）
2. 为品牌/关键人物建立 Wikipedia 页面
3. 建立 YouTube 频道并在内容中提及品牌
4. 实现全面的实体链接（跨平台使用 sameAs）
5. 开发独特的工具或计算器

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `ai_optimization_chat_gpt_scraper` 检查 ChatGPT 网页搜索针对目标查询返回的结果（真实的 GEO 可见性检查），并结合使用 `ai_opt_llm_ment_search` 和 `ai_opt_llm_ment_top_domains`，跟踪品牌在各 AI 平台上的大语言模型提及情况。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 解析失败、连接被拒绝） | 清楚地报告错误。不要猜测网站内容。建议用户验证 URL 后重试。 |
| AI 爬虫被 robots.txt 阻止 | 准确报告哪些爬虫被阻止、哪些爬虫被允许。提供为启用 AI 搜索可见性而需要添加的具体 robots.txt 指令。 |
| 未找到 llms.txt | 说明该文件缺失（此文件为可选文件；Google Search 会忽略它），并为非 Google AI 爬虫提供可直接使用的 llms.txt 模板。 |
| 未检测到结构化数据 | 报告这一缺口，并提供具体的 schema 建议（Article、Organization、Person），以提高内容被 AI 发现的能力。 |

## FLOW 框架集成

对于提示词引导的 AI 内容优化，请使用 `/seo flow optimize <url>`；FLOW 的 21 个优化阶段提示词可通过基于证据的 AI 提示词，补充 GEO 的可引用性和结构分析。