---
name: blog-brief
description: >
  Generate detailed content briefs for blog posts with target keywords,
  content outlines, competitive analysis, recommended statistics, image and
  chart suggestions, word count targets, internal linking architecture,
  template recommendations (12 types), TL;DR drafts, citation capsule
  planning, information gain prompts, and multi-channel distribution plans.
  Briefs are optimized for Google rankings and AI citations (GEO/AEO). Use
  when user says "content brief", "blog brief", "write brief", "outline blog",
  "plan blog post", "blog outline", "content outline".
user-invokable: true
argument-hint: "<topic>"
---
# 博客简报生成器：内容规划

生成全面的内容简报，指导博客写作，以最大限度提升 Google 排名和 AI 引用平台上的影响力。

参考文档：
- `references/content-templates.md`：模板选择标准
- `references/distribution-playbook.md`：特定渠道的分发策略
- `references/internal-linking.md`：链接架构模式
- `skills/blog/references/research-quality.md` - 五维质量评估标准、发布前陷阱类别、时效性下限（v1.8.0；跨技能引用位于编排器的 references 目录中）
- `skills/blog/references/synthesis-contract.md` - 综合输出的 6 条法则（v1.8.0）

## 自动加载的输入（v1.8.0）

如果项目根目录中存在 `DISCOURSE.md`（由 `/blog discourse` 生成），请在开始生成简报前加载它。使用观点讨论简报中的“新内容”“共识”主题和“逆向观点”部分，丰富本简报的竞争格局和信息增益部分。引用 DISCOURSE.md 中的内容时，使用相同的内联 `[name](url)` 格式。如果不存在 DISCOURSE.md，则行为保持不变。

## 交叉引用

有关以证据为导向的关键词发现、受众画像提示和内容优先级排序（简报生成的直接上游环节），请参阅 `/blog flow find`。

## 工作流程

### 第 1 步：主题收集

从用户处收集：
1. **主题或关键词**（必填）
2. **目标受众**（谁会阅读？）
3. **搜索意图**：信息型、商业型、交易型、导航型
4. **业务背景**：公司从事什么业务？CTA 是什么？

如果只提供了一个主题，则根据上下文推断其余信息。

### 第 2 步：关键词研究

使用 WebSearch：
1. 搜索目标关键词；分析当前排名靠前的内容
2. 确定**主要关键词**（精确匹配目标）
3. 确定 **3-5 个次要关键词**（相关术语、长尾关键词）
4. 确定 **3-5 个问题式查询**（类似“其他用户还问了这些问题”）
5. 记录**搜索意图**：搜索者实际想要什么？

### 第 2.5 步：模板推荐

分析主题、搜索意图和竞争格局，从 12 种内容模板中推荐一种。加载 `references/content-templates.md` 以获取选择标准。

**可用模板：**
| 模板 | 最适合 |
|----------|----------|
| `how-to-guide` | 分步骤的指导性内容 |
| `listicle` | 精选列表、排名项目、资源汇总 |
| `case-study` | 对特定示例或结果的深入分析 |
| `comparison` | 对 2 个或更多选项进行并列评估 |
| `pillar-page` | 链接到集群内容的综合主题中心 |
| `product-review` | 包含优点、缺点和结论的详细评估 |
| `thought-leadership` | 专家观点、行业趋势、预测 |
| `roundup` | 专家引述、工具合集、最佳榜单 |
| `tutorial` | 包含代码/配置示例的技术演练 |
| `news-analysis` | 包含专家评论的时效性报道 |
| `data-research` | 原始数据、调查结果、基准研究发现 |
| `faq-knowledge` | 以问题为导向的参考内容 |

**选择流程：**
1. 将搜索意图与模板优势相匹配
2. 检查排名靠前的竞争对手使用何种格式
3. 考虑用户可用的资源（数据、专业知识、工具）
4. 从 `templates/[type].md` 加载匹配的模板文件
5. 在简报输出中包含模板名称

### 步骤 3：竞争分析

分析目标关键词排名前 3-5 的页面：
1. **内容长度**：平均字数是多少？
2. **标题结构**：有多少个 H2？涵盖哪些主题？
3. **视觉元素**：竞争对手是否使用图表、图片、视频？
4. **内容缺口**：所有竞争对手都遗漏了什么？
5. **时效性**：它们最近一次更新是什么时候？
6. **Schema**：它们是否使用 FAQ 或其他富媒体搜索结果？（注意：HowTo 已于 2023 年 9 月弃用）
7. **模板模式**：排名靠前的结果使用何种内容格式？

### 步骤 4：统计数据研究

寻找文章应包含的 8-12 项统计数据：
1. 搜索：`[topic] study 2025 2026 data statistics research`
2. 优先选择第 1-3 级来源
3. 对每项统计数据，记录：数值、来源、URL、日期、研究方法
4. 确定 2-4 项适合用图表可视化的统计数据
5. 确定 1-2 项适合用于 TL;DR 和社交分享的统计数据

### 步骤 5：生成简报

输出格式：

```
# Content Brief: [Title Suggestion]

## Template
**Recommended**: [template-name]: [1-sentence rationale]
**Template file**: `templates/[type].md`

## Target Keywords
- **Primary**: [keyword]: [estimated monthly search volume if available]
- **Secondary**: [keyword 1], [keyword 2], [keyword 3]
- **Questions**: [question 1], [question 2], [question 3]

## Search Intent
[Informational/Commercial/Transactional]: [1-2 sentence explanation of
what the searcher wants]

## Content Parameters
- **Word count**: [2,000-2,500] words
- **Reading level**: Flesch 60-70 (expert-accessible)
- **Format**: [Markdown/MDX/HTML]
- **H2 sections**: [6-8]
- **Images**: 3-5 from Pixabay/Unsplash
- **Charts**: 2-4 via built-in blog-chart (diverse types)
- **FAQ items**: 3-5

## Recommended Title
[Question-format title including primary keyword, under 60 chars]

Alternative titles:
1. [Option 2]
2. [Option 3]

## Meta Description
[150-160 chars, fact-dense, includes 1 statistic, ends with value proposition]

## TL;DR Draft
> **TL;DR:** [40-60 word summary with key finding + 1 statistic + source.
> Should be self-contained; a reader who only reads this box gets the
> core value of the article.]

## Information Gain Opportunities
- **[ORIGINAL DATA]**: [Suggestion for proprietary data, survey, experiment,
  or benchmark the author can produce to differentiate this post]
- **[PERSONAL EXPERIENCE]**: [Suggestion for first-hand observation, test
  result, or case study to include: "When we tested X, we found Y"]
- **[UNIQUE INSIGHT]**: [Suggestion for contrarian take, novel analysis,
  or non-obvious connection that competitors have not covered]

## Content Outline

### Introduction (100-150 words)
- Hook: [Surprising statistic to open with]
- Problem: [What challenge does the reader face?]
- Promise: [What will they learn?]
- TL;DR box placement (after hook, before first H2)

### H2: [Question Format] (300-400 words)
- **Answer-first**: Open with [specific stat + source]
- Cover: [subtopic 1], [subtopic 2]
- **Image**: [Description of recommended image]
- **Key stat**: [Specific statistic to include]

### H2: [Question Format] (300-400 words)
- **Answer-first**: Open with [specific stat + source]
- Cover: [subtopic 1], [subtopic 2]
- **Chart**: [Type] showing [data description]
- **Key stat**: [Specific statistic to include]

[... repeat for 6-8 sections ...]

### FAQ Section (3-5 items)
1. [Question]: Answer with [stat + source]
2. [Question]: Answer with [stat + source]
3. [Question]: Answer with [stat + source]

### Conclusion (100-150 words)
- Key takeaways (bulleted)
- Call to action: [What should the reader do next?]

## Statistics to Include

| # | Statistic | Source | Year | Section |
|---|-----------|--------|------|---------|
| 1 | [stat] | [source + URL] | 2025 | H2: Section 1 |
| 2 | [stat] | [source + URL] | 2026 | H2: Section 2 |
| ... | ... | ... | ... | ... |

## Citation Capsule Plan
For each H2, plan a 40-60 word self-contained passage optimized for AI
extraction. Each capsule should include a stat, its source, and a clear
claim that can stand alone when quoted.

| Section | Capsule Focus | Key Stat | Source |
|---------|--------------|----------|--------|
| H2: [Section 1] | [Core claim this section makes] | [stat] | [source] |
| H2: [Section 2] | [Core claim this section makes] | [stat] | [source] |
| H2: [Section 3] | [Core claim this section makes] | [stat] | [source] |
| ... | ... | ... | ... |

## Cover Image

| Option | Details |
|--------|---------|
| Photo cover | [Pixabay/Unsplash/Pexels search terms for wide hero image] |
| Generated SVG | [Text-on-gradient concept with key stat, if data-heavy topic] |
| Dimensions | 1200x630 (OG-compatible) |

## Visual Element Plan

| # | Type | Data | Section |
|---|------|------|---------|
| 1 | [Bar chart] | [Data description] | H2: Section 2 |
| 2 | [Donut chart] | [Data description] | H2: Section 4 |
| 3 | [Image: Pixabay] | [Search terms] | H2: Section 1 |
| 4 | [Image: Pixabay] | [Search terms] | H2: Section 3 |

## Competitive Gaps to Exploit
1. [What competitors miss that we should cover]
2. [Unique angle or original data we can provide]
3. [Format advantage: charts/visuals competitors lack]

## Internal Link Architecture
- **Link TO** (from this new post to existing pages):
  1. [Page title/URL] - anchor text: "[descriptive anchor]"
  2. [Page title/URL] - anchor text: "[descriptive anchor]"
  3. [Page title/URL] - anchor text: "[descriptive anchor]"
  4. [Page title/URL] - anchor text: "[descriptive anchor]"
  5. [Page title/URL] - anchor text: "[descriptive anchor]"
- **Link FROM** (update these existing pages to link to this new post):
  1. [Page title/URL] - anchor text: "[descriptive anchor]"
  2. [Page title/URL] - anchor text: "[descriptive anchor]"
  3. [Page title/URL] - anchor text: "[descriptive anchor]"
  4. [Page title/URL] - anchor text: "[descriptive anchor]"
  5. [Page title/URL] - anchor text: "[descriptive anchor]"
- **Pillar connection**: [Which pillar page this belongs to, if applicable]
- **Cluster position**: [Hub / Spoke / Standalone]

## E-E-A-T Signals to Include
- **Experience**: [First-hand insight, case study, or test result]
- **Expertise**: [Author credentials relevant to topic]
- **Authority**: [Industry recognition, citations, partnerships]
- **Trust**: [Transparency, sourced data, no self-promotion]

## Distribution Plan
- **Reddit**: [Specific subreddits (r/sub1, r/sub2), posting approach (value-first
  comment vs. link post), authentic participation strategy, timing]
- **YouTube**: [Video companion concept, estimated length, key visuals from the
  post to reuse, thumbnail idea]
- **LinkedIn**: [Article excerpt angle, target audience segment, best posting
  time for the niche, engagement hook]
- **Email**: [Newsletter excerpt (2-3 sentences), subject line suggestion,
  CTA linking back to the full post]
- **Twitter/X**: [Thread hook (first tweet), 3-5 key tweet ideas built from
  statistics in the post, hashtag suggestions]
```

### 步骤 6：保存简报

将其保存到用户项目中的 `briefs/[slug]-brief.md`，或保存到用户指定的位置。确认简报已准备好供 `/blog write` 使用。