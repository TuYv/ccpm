---
name: blog-geo
description: >
  AI citation readiness audit as part of SEO, covering classic Google search
  and AI search surfaces together. Use whenever the user wants their content
  to rank or be cited in ChatGPT, Perplexity, Claude, Gemini, Copilot,
  You.com, Google AI Overviews, or Google AI Mode. AI citation optimization
  audit scoring blog posts for major answer surfaces. Evaluates
  evidence-backed citability, purpose clarity, entity clarity, structured
  data, and AI crawler accessibility. Suggests evidence-backed explanations and a
  0-100 AI Citation Readiness score. Use when user says "geo", "ai
  citation", "ai optimization", "citation audit", "aeo", "perplexity
  optimization", "chatgpt citation".
user-invokable: true
argument-hint: "<file-path>"
license: MIT
---
# 博客 GEO：AI 引用优化审计

对博客文章在 ChatGPT、Perplexity、Claude、Gemini、Copilot、You.com、Google AI Overviews 和 Google AI Mode 中的 AI 引用就绪度进行评分，将其视为一套 SEO 工作流，而非独立领域。生成一个 0-100 分的内部 AI 引用就绪度启发式评分，并提供针对各平台的建议。该评分并非经过校准的引用概率。

Google 于 2026-05-15 发布的指南将生成式 AI 优化归入 SEO：要获得 Google 可见性，无需特殊标记、llms.txt 要求或单独的 GEO/AEO 操作手册。GEO/AEO 仅可用作简写标签。

## 交叉引用

此 Skill 涵盖 FLOW 层面 3（AI 助手引用：ChatGPT、Perplexity、Claude、Gemini、Copilot、You.com），并对层面 2（SERP 加 AI Overviews）有所贡献。层面映射：`skills/blog/references/flow-alignment.md`。

对于与 AI 引用直接相关的提示词（AI 支持页面重写、基于证据的质量跟进、ChatGPT 发现、可见性提示词），请参阅 `/blog flow optimize`。

## 证据规范

仅当报告包含来源信息块，且其中列出了 URL、发布者、方法、样本量、引擎或版本、查询类别、检索日期和失效日期时，才使用量化的 AI 引用基准。如果缺少任何字段，请将该基准标记为方向性参考，或删除该数值。默认启发式规则：

- 自包含且有证据支持的解释有助于内容复用，但 Google 并未规定段落长度或“分块”要求。
- 带有语义化表头的比较表格可能提高内容的可提取性，但如果没有包含日期的来源信息块，请勿引用提升幅度。
- AI Overviews 的覆盖率取决于研究方法：应引用带日期的区间，而非固定值。

## 审计流程

### 第 1 步：读取内容

从博客文章中提取：
- 完整的正文文本和字数
- 标题结构（H1、H2、H3 层级）
- 各个段落及其字数
- FAQ 部分（如有）
- Schema 标记（JSON-LD、microdata、RDFa）
- robots.txt 提及内容或 meta robots 指令
- 任何 TL;DR 或摘要框
- 比较表格及其 HTML 结构
- 编号列表/有序列表
- 定义式格式

### 第 2 步：基于证据的可引用性（4 分）

检查各标题之间的每个部分是否包含可供 AI 提取的段落：

| 检查项 | 标准 |
|-------|----------|
| 上下文独立性 | 每个段落在脱离周围上下文后仍然表意完整 |
| 论断结构 | 段落包含：具体论断 + 支持性证据 + 来源注明 |
| 完整性 | 段落无需读者阅读相邻部分即可回答某个问题 |

**评分：**统计符合证据和完整性标准的重要部分。不要按部分长度评分。
- 4 分：80% 以上的部分包含可引用段落
- 3 分：60-79%
- 2 分：40-59%
- 1 分：20-39%
- 0 分：低于 20%

### 第 3 步：目的契合度与读者实用性（3 分）

检查标题格式和回答结构：

| 检查项 | 标准 |
|-------|----------|
| 目的明确 | 引言明确说明页面主题、目标受众和读者任务 |
| 实用的部分开头 | 重要部分开门见山地陈述要点 |
| 与意图匹配的格式 | 仅在适合材料内容时使用陈述式标题、问题、FAQ、表格和列表 |

**评分：**
- 3 分：满足全部三项标准
- 2 分：满足两项标准
- 1 分：满足一项标准
- 0 分：均未满足

### 第 4 步：实体清晰度（3 分）

检查主题一致性和歧义消除情况：

| 检查项 | 标准 |
|-------|----------|
| 规范主题 | 每个页面有且只有一个明确无歧义的主要主题 |
| 命名一致 | 始终使用相同的实体名称（不使用容易引起混淆的同义词） |
| 引言陈述 | 在引言段落中清晰陈述主题 |
| 标题与内容匹配 | 标题准确反映内容重点 |

**评分：**
- 3 分：满足全部四项标准
- 2 分：满足三项标准
- 1 分：满足一项或两项标准
- 0 分：均未满足

### 第 5 步：便于提取的内容结构（3 分）

检查是否采用便于 AI 提取的内容模式：

| 检查项 | 标准 |
|-------|----------|
| 摘要 | 在有助于目标读者时提供可独立阅读的可选摘要 |
| 对比表格 | 使用 `<thead>` 等语义化表头或清晰列标签的表格 |
| 有序列表 | 对流程和分步说明使用编号列表 |
| 定义格式 | 使用清晰的定义模式来格式化关键术语 |
| 有证据支持的说明 | 重要且可复用的论断包含足够的上下文和来源支持 |

**评分：**
- 3 分：具备 4-5 项要素
- 2 分：具备 3 项要素
- 1 分：具备 1-2 项要素
- 0 分：均不具备

### 第 6 步：AI 爬虫可访问性（2 分）

检查 AI 爬虫索引的技术要求：

| 检查项 | 标准 |
|-------|----------|
| 已渲染内容 | 重要内容存在于渲染后的 DOM 中，并且目标爬虫可以访问 |
| Google 可见性 | Googlebot 可正常抓取和索引。Google AI 功能不要求使用特殊的 GEO/AEO 文件或标记 |
| 非 Google AI 爬虫 | 如果网站希望在非 Google 答案引擎中获得可见性，请检查 robots.txt 对 GPTBot、ChatGPT-User、ClaudeBot、PerplexityBot 及其他有相关文档说明的爬虫的处理方式 |
| Schema 一致性 | 结构化数据会进入渲染后的 DOM，并与可见内容一致 |
| 页面大小 | 页面大小合理，未超出 AI 爬虫限制 |

**评分：**
- 2 分：Google 抓取和索引不存在问题，且所选非 Google
  爬虫的策略符合网站声明的目标
- 1 分：Google 可以索引，但某个所选非 Google 爬虫或渲染
  检查项需要复核
- 0 分：Google 抓取或索引受到阻止，或者多个所选爬虫
  被无意阻止

### 第 7 步：特定平台分析

评估每个声明支持的平台是否具备可观察到的就绪条件。产品行为会因模式、查询集、地理位置和日期而变化，因此不要根据供应商提供的样本推断因果性偏好。

#### ChatGPT
- 检查实质性论断是否有来源支持，并且无需依赖
  特定内容格式也能发挥作用。
- 将当前引用样本视为非因果性背景，而不是将其视为列表式文章、
  时效性或域名权威性规则。

#### Perplexity
- 当查询具有时效性时，检查可抓取性、来源忠实度和内容新鲜度。在描述产品行为之前，
  使用当前日志或可复现的工具验证观察结果。

#### Google AI Overviews
- 遵循 Google 的常规 SEO 指南：确保内容有用、可抓取、可编入索引，
  并且符合摘要展示条件。要在 Google 中获得可见性，无需特殊的 GEO/AEO 标记或 llms.txt。
- 分别衡量搜索可见性和 AI 功能可见性。样本中观察到的自然搜索结果重合
  并不能证明存在偏好，也不能保证内容会被收录。

#### Google AI Mode
- 在报告中将其与 AI Overviews 分开处理。强调常规搜索的收录资格、
  清晰的页面用途、可访问的文本，以及可见内容与结构化数据之间的一致性。

#### Claude、Gemini、Copilot 和 You.com
- 评估内容清晰度、来源可访问性、时效性，以及 robots
  策略是否有意允许或阻止各个已有文档说明的爬虫。
- 仅在有最新文档、日志或测试结果可用时，才使用特定于引擎的建议。

针对每个平台，提供：
- 当前可引用性评级（高 / 中 / 低）
- 针对清晰度、来源忠实度、实用性和可抓取性的具体改进建议
- 内容格式建议

### 第 8 步：强化可复用的证据

对于缺乏支持的重要章节，提出一项可独立理解的改进，其中包含具体论断、
理解该论断所需的背景，以及经验证的来源或透明的原创方法。不要为了填充而扩充每个章节，
不要强制规定字数范围，也不要编造统计数据。

### 第 9 步：计算 AI 引用就绪度评分（0-100）

将 15 分制的子类别分数映射为 0-100 的展示分数：

| 类别 | 原始分数 | 展示权重 | 最高展示分数 |
|----------|-----------|----------------|-------------------|
| 证据支持的可引用性 | /4 | x6.75 | 27 |
| 目的契合度与读者实用性 | /3 | x6.67 | 20 |
| 实体清晰度 | /3 | x6.67 | 20 |
| 内容结构 | /3 | x6.67 | 20 |
| AI 爬虫可访问性 | /2 | x6.5 | 13 |
| **总计** | **/15** | | **100** |

评级阈值：
- 90-100：优秀：非常适合被 AI 系统引用
- 70-89：良好：经过少量改进即可引用
- 50-69：需要改进：可引用性方面存在明显不足
- 低于 50：较差：需要进行重大重构

### 第 10 步：生成报告

输出以下报告：

```
## AI Citation Readiness Report: [Title]

**AI Citation Readiness Heuristic: [X]/100**: [Rating]

This is an internal editorial heuristic, not a calibrated probability.

### Score Breakdown
| Category | Raw | Display | Max |
|----------|-----|---------|-----|
| Evidence-Backed Citability | X/4 | X | 27 |
| Purpose Fit and Reader Utility | X/3 | X | 20 |
| Entity Clarity | X/3 | X | 20 |
| Content Structure | X/3 | X | 20 |
| AI Crawler Accessibility | X/2 | X | 13 |
| **Total** | **X/15** | **X** | **100** |

### Per-Section Citability Analysis
| Section (H2) | Purpose Clear | Self-Contained | Claim+Evidence | Ready |
|---------------|---------------|----------------|----------------|-------|
| [heading] | Yes/No | Yes/No | Yes/No | Yes/No |

### Platform-Specific Optimization
#### ChatGPT
- [specific recommendations]

#### Perplexity
- [specific recommendations]

#### Google AI Overviews
- [specific recommendations]

#### Google AI Mode
- [specific recommendations]

#### Claude / Gemini / Copilot / You.com
- [specific recommendations]

### Evidence Improvements

#### [H2 Section 1]
> [Self-contained, source-backed improvement sized to the material]

#### [H2 Section 2]
> [Self-contained, source-backed improvement sized to the material]

### Technical Recommendations
- [ ] [Technical fix with specifics]

### Priority Action Items
1. [Most impactful improvement]
2. [Second most impactful]
3. [Third most impactful]

Run `/blog analyze <file>` for full content quality scoring.
```

### 可选：搜索效果上下文（blog-google）

如果 blog-google 凭据包含 Tier 1（GSC），并且文章已有已发布的 URL：

1. 按网页和查询维度查询 GSC，然后将结果行筛选为该 URL：
   `python3 skills/blog-google/scripts/run.py gsc_query --property <property> --dimensions query,page --json`
2. 添加到平台专项分析中：
   - 当前展示次数、点击次数、CTR、平均排名
   - 为此 URL 带来流量的搜索查询
3. 检查索引编入情况：`python3 skills/blog-google/scripts/run.py gsc_inspect <url> --json`
4. 报告索引编入状态、规范网址选择和移动设备易用性。
5. 如果跳过，请报告 `SKIPPED: credentials unavailable` 或
   `SKIPPED: unpublished URL`。

### 可选：AI 引用就绪度启发式评估

要获取按引擎划分的就绪度视图（不同于 `/blog analyze` 所评估的 15 分制 AI 引用就绪度类别），请运行：

```bash
python3 scripts/ai_citation_score.py <file> --format markdown
```

它会返回一个未经校准的 0-100 总体启发式评分，以及 Google AI Overview、Perplexity 和 ChatGPT 的各引擎子评分、因素明细和最多三项影响最大的修复建议。旧版 `overall_probability` 输出仅作为兼容性别名保留。