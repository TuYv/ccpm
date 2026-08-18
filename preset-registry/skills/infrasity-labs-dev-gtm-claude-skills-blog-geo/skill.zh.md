---
name: blog-geo
description: >
  AI citation readiness audit ONLY (does not touch Google rankings, use
  blog-rewrite for combined Google+AI work). Use whenever the user wants
  their content to rank in ChatGPT, Perplexity, Claude, Gemini, or Google
  AI Overviews. AI citation optimization audit scoring blog posts for
  ChatGPT, Perplexity, and Google AI Overview citability. Evaluates
  passage-level citability, Q&A formatting, entity clarity, structured
  data, and AI crawler accessibility. Generates citation capsules and a
  0-100 AI Citation Readiness score. Use when user says "geo", "ai
  citation", "ai optimization", "citation audit", "aeo", "perplexity
  optimization", "chatgpt citation".
user-invokable: true
argument-hint: "<file-path>"
---
# 博客 GEO：AI 引用优化审计

评估博客文章在 ChatGPT、Perplexity 和 Google AI Overviews 中的 AI 引用就绪度。生成引用胶囊，以及 0-100 分的 AI 引用就绪度评分，并提供针对各平台的具体建议。

## 交叉引用

此技能涵盖 FLOW 的第 3 个触点（AI 助手引用：ChatGPT、Perplexity、Claude、Gemini、Copilot、You.com），并对第 2 个触点（SERP 加 AI Overviews）有所贡献。触点映射：`skills/blog/references/flow-alignment.md`。

对于与 AI 引用直接相关的提示词（AI-supporting-pages-rewrite-prompt、ai-detector-test、ChatGPT 发现、可见性提示词），请参阅 `/blog flow optimize`。

## 关键研究数据

在整个审计过程中参考以下基准数据：

- 只有 11% 的域名同时被 ChatGPT 和 Perplexity 引用（Digital Bloom，域名级别）
- 80% 的 LLM 引用来源未进入 Google 前 100 名（Ahrefs）
- 品牌通过第三方来源被引用的可能性高出 6.5 倍（AirOps）
- 120-180 词的章节获得的 ChatGPT 引用量高出 70%（SE Ranking，2025 年 11 月）
- 包含 `<thead>` 的对比表格可将 AI 引用率提高 47%（方向性数据）
- 内容新鲜度：排名靠前的引用中，有 76.4% 在过去 30 天内更新过（Ahrefs，约 1700 万条引用）

## 审计流程

### 第 1 步：读取内容

从博客文章中提取：
- 完整正文及字数
- 标题结构（H1、H2、H3 层级）
- 各个段落及其字数
- FAQ 章节（如有）
- Schema 标记（JSON-LD、microdata、RDFa）
- robots.txt 提及内容或 meta robots 指令
- 所有 TL;DR 或摘要框
- 对比表格及其 HTML 结构
- 编号列表/有序列表
- 定义式格式

### 第 2 步：段落级可引用性（4 分）

检查标题之间的每个章节是否包含可供 AI 提取的段落：

| 检查项 | 标准 |
|-------|----------|
| 字数 | 每个章节包含 120-180 词且内容完整独立的段落 |
| 上下文独立性 | 每个段落从周围上下文中提取出来后仍然语义完整 |
| 论断结构 | 段落包含：具体论断 + 支持证据 + 来源归属 |
| 完整性 | 段落能够回答一个问题，无需读者阅读相邻章节 |

**评分：**统计满足全部标准的段落数量，并与章节总数进行比较。
- 4 分：80% 以上的章节包含可引用段落
- 3 分：60-79%
- 2 分：40-59%
- 1 分：20-39%
- 0 分：低于 20%

### 第 3 步：问答格式（3 分）

检查标题格式和回答结构：

| 检查项 | 标准 |
|-------|----------|
| 问题式标题 | 60-70% 的 H2 以问题形式表述 |
| 答案优先格式 | 每个 H2 下的开头段落直接给出答案 |
| FAQ 章节 | 包含由结构化问答对组成的专门 FAQ 章节 |

**评分：**
- 3 分：满足全部三项标准
- 2 分：满足两项标准
- 1 分：满足一项标准
- 0 分：一项都不满足

### 第 4 步：实体清晰度（3 分）

检查主题一致性和消歧情况：

| 检查项 | 标准 |
|-------|----------|
| 规范主题 | 每个页面只有一个明确无歧义的主要主题 |
| 命名一致性 | 全文使用相同的实体名称（不使用容易造成混淆的同义词） |
| 引言陈述 | 在引言段落中清晰陈述主题 |
| 标题与内容匹配 | 标题准确反映内容重点 |

**评分：**
- 3 分：满足全部四项标准
- 2 分：满足三项标准
- 1 分：满足一项或两项标准
- 0 分：均未满足

### 步骤 5：便于提取的内容结构（3 分）

检查是否存在便于 AI 提取的内容模式：

| 检查项 | 标准 |
|-------|----------|
| TL;DR 摘要框 | 顶部包含一段 40-60 词、可独立理解的摘要 |
| 对比表格 | 使用规范 HTML `<thead>` 的表格（引用率高出 47%） |
| 有序列表 | 使用编号列表呈现流程和分步说明 |
| 定义格式 | 使用清晰的定义模式来格式化关键术语 |
| 引用胶囊 | 每个主要章节中包含 40-60 词的明确陈述 |

**评分：**
- 3 分：存在 4-5 个元素
- 2 分：存在 3 个元素
- 1 分：存在 1-2 个元素
- 0 分：不存在任何元素

### 步骤 6：AI 爬虫可访问性（2 分）

检查 AI 爬虫索引的技术要求：

| 检查项 | 标准 |
|-------|----------|
| 静态 HTML | 内容以静态 HTML 渲染，而非隐藏在 JavaScript 之后 |
| robots.txt | 允许以下 AI 爬虫：GPTBot、ChatGPT-User、ClaudeBot、PerplexityBot |
| HTML 中的 Schema | Schema 标记位于静态 HTML 中，而非通过 JS 注入 |
| 页面大小 | 页面大小合理，未超出 AI 爬虫的限制 |

**评分：**
- 2 分：满足全部标准
- 1 分：满足大多数标准，但存在一个问题
- 0 分：存在多个阻碍 AI 爬虫的问题

### 步骤 7：针对不同平台的分析

根据各 AI 平台的引用偏好评估文章：

#### ChatGPT
- 偏好“最佳 X”类列表文章（占引用量的 43.8%）
- 偏好引用充分、具有权威性的内容
- 时效性很重要：近期更新的内容会被优先考虑
- 域名权威性会影响被引用的可能性

#### Perplexity
- 偏好 Reddit 来源（占全部引用量的 6.6%）
- 内容衰减速度快：引用窗口为 2-3 天
- 新鲜度是最关键的因素
- 偏好经过社区验证的内容

#### Google AI Overviews
- 偏好 Google 自有资源（占引用量的 23%）
- 高域名评级与引用高度相关
- 出现在 49% 的 SERP 中
- 偏好已在自然搜索结果中排名靠前的内容

针对每个平台，提供：
- 当前可引用性评级（高 / 中 / 低）
- 提高被引用可能性的具体改进建议
- 内容格式建议

### 步骤 8：生成引用胶囊

为文章中的每个 H2 章节编写一个引用胶囊：

- **长度**：40-60 词，可独立理解
- **结构**：具体论点 + 数据点 + 来源说明
- **目的**：一段 AI 可直接引用的文字
- **格式**：作为作者可嵌入文章的建议新增内容呈现

示例：
```
According to [Source], [specific claim with number]. This represents
[context/comparison], making it [significance]. [Supporting detail
that reinforces the claim].
```

每个 H2 章节生成一个胶囊。使用其所属的章节标题为每个胶囊添加标签。

### 步骤 9：计算 AI 引用就绪度评分（0-100）

将 15 分制的子类别得分映射为 0-100 的展示分数：

| 类别 | 原始分数 | 展示权重 | 最高展示分数 |
|----------|-----------|----------------|-------------------|
| 段落级可引用性 | /4 | x6.75 | 27 |
| 问答格式 | /3 | x6.67 | 20 |
| 实体清晰度 | /3 | x6.67 | 20 |
| 内容结构 | /3 | x6.67 | 20 |
| AI 爬虫可访问性 | /2 | x6.5 | 13 |
| **总计** | **/15** | | **100** |

评分阈值：
- 90-100：优秀：非常适合被 AI 系统引用
- 70-89：良好：稍作改进即可引用
- 50-69：需要改进：在可引用性方面存在显著不足
- 低于 50：较差：需要进行重大结构调整

### 步骤 10：生成报告

输出以下报告：

```
## AI Citation Readiness Report: [Title]

**AI Citation Readiness Score: [X]/100**: [Rating]

### Score Breakdown
| Category | Raw | Display | Max |
|----------|-----|---------|-----|
| Passage-Level Citability | X/4 | X | 27 |
| Q&A Formatting | X/3 | X | 20 |
| Entity Clarity | X/3 | X | X | 20 |
| Content Structure | X/3 | X | 20 |
| AI Crawler Accessibility | X/2 | X | 13 |
| **Total** | **X/15** | **X** | **100** |

### Per-Section Citability Analysis
| Section (H2) | Word Count | Self-Contained | Claim+Evidence | Citable |
|---------------|-----------|----------------|----------------|---------|
| [heading] | [N] | Yes/No | Yes/No | Yes/No |

### Platform-Specific Optimization
#### ChatGPT
- [specific recommendations]

#### Perplexity
- [specific recommendations]

#### Google AI Overviews
- [specific recommendations]

### Generated Citation Capsules

#### [H2 Section 1]
> [40-60 word citation capsule]

#### [H2 Section 2]
> [40-60 word citation capsule]

### Technical Recommendations
- [ ] [Technical fix with specifics]

### Priority Action Items
1. [Most impactful improvement]
2. [Second most impactful]
3. [Third most impactful]

Run `/blog analyze <file>` for full content quality scoring.
```

### 可选：搜索表现上下文（blog-google）

如果 blog-google 凭据包含 Tier 1 (GSC)，且该文章已有已发布的 URL：

1. 查询 GSC：`python3 skills/blog-google/scripts/run.py gsc_query --property <property> --filter-page <url> --json`
2. 添加到特定平台分析中：
   - 当前展示次数、点击次数、点击率和平均排名
   - 为该 URL 带来流量的搜索查询
3. 检查索引状态：`python3 skills/blog-google/scripts/run.py gsc_inspect <url> --json`
4. 报告索引状态、规范网址选择情况和移动设备易用性。
5. 如果未配置，则静默回退。