---
name: blog-analyze
description: >
  Audit and score blog posts on a 5-category 100-point scoring system covering
  content quality, SEO optimization, E-E-A-T signals, technical elements, and
  AI citation readiness. Includes AI content detection (burstiness, phrase
  flagging, vocabulary diversity). Supports export formats (markdown, JSON,
  table) and batch analysis with sorting. Generates prioritized recommendations
  (Critical/High/Medium/Low) with specific fixes. Works with any format (MDX,
  markdown, HTML, URL). Use when user says "analyze blog", "audit blog",
  "blog score", "check blog quality", "blog review", "rate this blog",
  "blog health check".
user-invokable: true
argument-hint: "<file-path>"
---
# 博客分析器：质量审计与评分

从 5 个类别对博客文章进行 0-100 分评分，并提供按优先级排序的改进建议。包含 AI 内容检测分析。支持本地文件或已发布的 URL。

参考文档（路径均相对于仓库根目录）：
- `skills/blog/references/quality-scoring.md`：完整评分检查清单
- `skills/blog/references/eeat-signals.md`：E-E-A-T 评估标准
- `skills/blog/references/ai-slop-detection.md`：双层反射式方法（v1.8.0）
- `skills/blog/references/editorial-heuristics.md`：0-4 序数评分量表、P0-P3 严重程度（v1.8.0，与 `--rubric` 配合使用）
- `skills/blog/references/cognitive-load.md`：各章节的概念密度（v1.8.0，与 `--cognitive-load` 配合使用）

## 输入处理

- **本地文件**：直接读取文件
- **URL**：使用 WebFetch 获取并提取内容
- **目录**：扫描博客文件并审计全部文件（批处理模式）
- **标志**：`--format json|table`、`--batch`、`--sort score`、`--rubric`、`--cognitive-load`

### 可选模式（v1.8.0）

- `--rubric`：除 100 分制评分外，还输出 0-4 序数制的编辑启发式评分量表以及 P0-P3 严重程度标签。请参阅 `skills/blog/references/editorial-heuristics.md`。保留 100 分制 JSON schema，并将评分量表作为同级 `rubric` 字段添加。
- `--cognitive-load`：对文章运行 `scripts/cognitive_load.py`，并将各章节的负载热图作为同级 `cognitive_load` 字段嵌入。请参阅 `skills/blog/references/cognitive-load.md`。

这两种模式均为附加模式。默认行为（不使用标志）保持不变。

## 评分流程

### 第 1 步：内容提取

读取博客文章并提取：
- Frontmatter（title、description、date、lastUpdated、author、tags）
- 标题结构（H1、H2、H3 及其层级关系）
- 段落数量以及每段的字数
- 统计数据（任何带有或不带来源的数字声明）
- 图片（数量、是否存在 alt 文本、格式）
- 图表/SVG（数量、类型多样性）
- 链接（内部、外部、失效）
- 是否存在 FAQ 章节
- Schema 标记（存在的类型）
- Meta 标签（title、description、OG 标签、twitter cards）
- 用于突发性分析的句子长度
- 用于多样性评分的词汇 token

### 第 2 步：为每个类别评分

加载 `references/quality-scoring.md` 以获取完整检查清单。分别对以下各项评分：

#### 内容质量（30 分）
| 检查项 | 分值 | 通过标准 |
|-------|--------|---------------|
| 深度/全面性 | 7 | 全面涵盖主题，无重大缺漏 |
| 可读性（Flesch 60-70） | 7 | Flesch 60-70 为理想范围，55-75 可接受；年级水平 7-8；Gunning Fog 7-8 |
| 原创性/独特价值指标 | 5 | 原创数据、案例研究、第一手经验 |
| 句子和段落结构 | 4 | 平均句长 15-20 个词，超过 20 个词的句子占比 ≤25%；段落长度 40-80 个词；每 200-300 个词设置一个 H2 |
| 互动元素 | 4 | 摘要框、提示框、多样化内容块。接受："TL;DR"、"Key Takeaways"、"The Bottom Line"、"What You'll Learn"、"At a Glance"、"In Brief" |
| 语法/反模式 | 3 | 被动语态占比 ≤10%，AI 触发词每 1,000 个词 ≤5 个，过渡词占比 20-30%，文风简洁流畅 |

**可读性区间**（按每个角色应用，或使用默认值）：

| 受众 | Flesch 年级 | Flesch 易读度 | 评分影响 |
|----------|-------------|-------------|----------------|
| 消费者 | 6-8 | 60-80 | 在范围内即得满分 |
| 专业人士 | 8-10 | 50-60 | 在范围内即得满分 |
| 技术人员 | 10-12 | 30-50 | 在范围内即得满分 |
| 默认（无角色） | 7-8 | 60-70 | 当前评分保持不变 |

内容清晰度是影响 AI 引用概率的第 2 大因素（分数差异为 +32.83%）。美国成年人的平均阅读水平为 7 至 8 年级。

#### SEO 优化（25 分）
| 检查项 | 分值 | 通过标准 |
|-------|--------|---------------|
| 包含关键词的标题层级 | 5 | H1 -> H2 -> H3，不跳级，2-3 个标题中包含关键词 |
| 标题标签（40-60 个字符、包含关键词和有力词汇） | 4 | 关键词前置，情感倾向积极 |
| 关键词位置/密度 | 4 | 自然融入，不堆砌，出现在前 100 个单词内 |
| 内部链接（3-10 个上下文链接） | 4 | 描述性锚文本，双向链接 |
| URL 结构 | 3 | 简短、富含关键词、不含停用词、使用小写 |
| 元描述（150-160 个字符，包含统计数据） | 3 | 信息密集，包含一项统计数据 |
| 外部链接（第 1-3 层级） | 2 | 3-8 个指向权威来源的出站链接 |

#### E-E-A-T 信号（15 分）
| 检查项 | 分值 | 通过标准 |
|-------|--------|---------------|
| 作者署名（具名并附简介） | 4 | 真实姓名、资历明确，不含推销话术 |
| 来源引用（第 1-3 层级，行内） | 4 | 8 项以上独立统计数据，零捏造 |
| 信任指标 | 4 | 联系页面、关于页面、编辑政策 |
| 经验信号 | 3 | “在我们的测试中……”、原创照片/数据 |

在 E-E-A-T 下对来源引用进行评分时，应评估每项公开统计数据是否包含 FLOW 证据三元组：正文中的年份锚点、包含发布者和标题的行内引用，以及来源区块中附有检索日期的 URL。引用第 1-3 层级来源但缺少检索日期的文章，在此子类别中的得分低于包含完整三元组的文章。相关标准请参阅 `skills/blog/references/flow-alignment.md`。

#### 技术元素（15 分）
| 检查项 | 分值 | 通过标准 |
|-------|--------|---------------|
| Schema 标记（3 种以上类型可获加分） | 4 | 至少包含 BlogPosting + FAQ + Person |
| 图像优化 | 3 | AVIF/WebP、描述性替代文本、除 LCP 图像外均延迟加载 |
| 结构化数据元素 | 2 | 表格、列表、比较区块 |
| 页面速度信号 | 2 | LCP < 2.5s，无阻塞渲染的 JS |
| 移动端友好性 | 2 | 响应式设计，点击目标尺寸不小于 48px |
| OG/社交媒体元标签 | 2 | og:title、og:description、og:image、twitter:card |

#### AI 引用就绪度（15 分）
| 检查项 | 分值 | 通过标准 |
|-------|--------|---------------|
| 段落级可引用性（120-180 个单词） | 4 | 独立完整的章节，包含统计数据和来源 |
| 问答格式章节 | 3 | 60-70% 的 H2 使用问题形式，并包含 FAQ |
| 实体清晰度 | 3 | 主题实体明确无歧义，术语使用一致 |
| 便于提取的内容结构 | 3 | 答案优先、表格包含 thead、采用比较格式 |
| AI 爬虫可访问性 | 2 | SSR/SSG，无需通过 JS 才能访问内容 |

### 第 3 步：AI 内容检测

分析文章中 AI 生成内容的风险：

**突发性得分**（句子长度方差）：
- 计算整篇文章中句子长度的标准差
- 人类写作：方差较高（简短有力的句子 + 复杂的长句）
- AI 写作：方差较低（句子长度始终保持中等）
- 得分：0-10 分（10 = 突发性非常接近人类写作）

**已知 AI 短语检测**：标记以下 17 个短语的出现位置：
1. "It's important to note"
2. "In today's digital landscape"
3. "Delve into"
4. "Navigating the complexities"
5. "Let's explore"
6. "Furthermore"
7. "In conclusion"
8. "It is worth mentioning"
9. "Embark on"
10. "Cutting-edge"
11. "Leverage"（在非金融语境中用作动词）
12. "Game-changer"
13. "Revolutionize"
14. "Streamline"
15. "Harness the power"
16. "Dive deep"
17. "Unlock the potential"
18. 长破折号 (-)——统计所有实例，并标记为 AI 写作模式

**词汇多样性**（类符-形符比）：
- 计算唯一单词数 / 单词总数
- 人类写作：长篇内容的类符-形符比通常为 0.4-0.6
- AI 写作：类符-形符比通常低于 0.35（词汇重复）

**AI 内容风险评估**：
- 如果基于综合信号得出的 AI 概率 > 50%，则进行标记
- 提供触发标记的具体段落
- 建议进行人性化改写：加入个人轶事、改变句子节奏、使用领域术语

### 第 4 步：确定评级

| 分数 | 评级 | 操作 |
|-------|--------|--------|
| 90-100 | 卓越 | 原样发布，作为旗舰内容 |
| 80-89 | 优秀 | 稍作润色，即可发布 |
| 70-79 | 可接受 | 需要有针对性地改进 |
| 60-69 | 低于标准 | 需要大幅返工 |
| < 60 | 重写 | 存在根本性问题，从大纲重新开始 |

### 第 4.5 步：可选的序数评分量表（--rubric）

传入 `--rubric` 时，还需要按照 `skills/blog/references/editorial-heuristics.md` 中定义的 10 项编辑启发式标准对文章进行评分。每项启发式标准获得 0-4 分，并附带一个严重程度标签（P0 / P1 / P2 / P3 / none）。

该评分量表不会取代百分制评分。它会与百分制评分同时运行，并指出哪些发现属于阻塞问题，哪些只需润色。

评分量表输出格式可以是：
- Markdown 表格（默认），附加到主报告的 `### Editorial Heuristics Rubric` 标题下。
- 使用 `--format json` 时，输出为 JSON `rubric` 字段。

评分量表 JSON 模式：
```json
{
  "rubric": {
    "heuristics": [
      { "id": 1, "name": "Visibility of intent", "score": 3, "severity": "P2", "note": "Summary box generic" },
      ...
    ],
    "p0_count": 0,
    "p1_count": 1,
    "p2_count": 2,
    "p3_count": 3
  }
}
```

### 第 4.6 步：可选的认知负荷热力图（--cognitive-load）

传入 `--cognitive-load` 时，运行 `scripts/cognitive_load.py <file> --format json`，并在 JSON 输出中将结果嵌入 `cognitive_load` 字段下；或者在 Markdown 输出中附加一个 `### Cognitive Load Heatmap` Markdown 章节。有关阈值和解读方式，请参阅 `skills/blog/references/cognitive-load.md`。

### 第 5 步：生成报告

默认输出格式（Markdown）：

```
## Blog Quality Report: [Title]

**Score: [X]/100** - [Rating]

### Score Breakdown
| Category | Score | Max | Notes |
|----------|-------|-----|-------|
| Content Quality | X | 30 | [1-line summary] |
| SEO Optimization | X | 25 | [1-line summary] |
| E-E-A-T Signals | X | 15 | [1-line summary] |
| Technical Elements | X | 15 | [1-line summary] |
| AI Citation Readiness | X | 15 | [1-line summary] |
| **Total** | **X** | **100** | |

### AI Content Risk
- **Burstiness score**: [X]/10 ([human-like / moderate / flat])
- **AI phrases detected**: [N] ([list phrases found])
- **Vocabulary diversity (TTR)**: [X] ([high / acceptable / low])
- **AI probability**: [X]% - [No concern / Review recommended / High risk]
- **Flagged passages**: [quote specific flat or formulaic sections, if any]

### Issues Found

#### Critical (Must Fix)
- [ ] [Issue with specific location and fix]

#### High Priority
- [ ] [Issue with specific location and fix]

#### Medium Priority
- [ ] [Issue with specific location and fix]

#### Low Priority
- [ ] [Issue with specific location and fix]

### Quick Stats
- Word count: [N]
- Paragraphs: [N] (X over 150 words)
- H2 sections: [N] (X as questions, X with answer-first formatting)
- Statistics: [N] sourced / [N] unsourced
- Images: [N] (X with alt text, formats: ...)
- Charts: [N] (types: ...)
- Internal links: [N]
- External links: [N] (tier breakdown: ...)
- Schema types: [list]
- OG/social tags: [present/missing]

### Recommended Actions
1. [Most impactful fix: Critical items first]
2. [Second most impactful]
3. [Third]

Run `/blog rewrite <file>` to apply these optimizations automatically.
```

## 导出格式

### 默认：Markdown 报告
如上所示的标准详细报告。

### JSON 导出（`--format json`）
供 CI/CD 或仪表板集成使用的机器可读输出：
```json
{
  "file": "post.md",
  "title": "...",
  "score": 78,
  "rating": "Acceptable",
  "categories": {
    "content_quality": { "score": 22, "max": 30 },
    "seo_optimization": { "score": 18, "max": 25 },
    "eeat_signals": { "score": 12, "max": 15 },
    "technical_elements": { "score": 13, "max": 15 },
    "ai_citation_readiness": { "score": 13, "max": 15 }
  },
  "ai_detection": {
    "burstiness": 6.2,
    "ai_phrases_found": ["Furthermore", "Let's explore"],
    "ttr": 0.44,
    "ai_probability": 32
  },
  "issues": {
    "critical": [],
    "high": [],
    "medium": [],
    "low": []
  }
}
```

### 表格导出（`--format table`）
便于快速审查的紧凑摘要：
```
File            | Score | Rating     | Content | SEO | EEAT | Tech | AI-Ready | AI Risk
post.md         |    78 | Acceptable |   22/30 | 18/25 | 12/15 | 13/15 |    13/15 |    32%
```

## 批量模式

当给定目录或 `--batch` 标志时，扫描博客文件并生成汇总表。使用 `--sort score` 按分数排序（默认升序）。

```
## Blog Audit Summary: [N] Posts Analyzed

| File | Score | Rating | Content | SEO | EEAT | Tech | AI-Ready | AI Risk | Top Issue |
|------|-------|--------|---------|-----|------|------|----------|---------|-----------|
| post-1.md | 85 | Strong | 26/30 | 20/25 | 13/15 | 14/15 | 12/15 | 18% | Missing OG tags |
| post-2.md | 42 | Rewrite | 10/30 | 8/25 | 5/15 | 9/15 | 10/15 | 71% | 12 fabricated stats |
| post-3.md | 71 | Acceptable | 20/30 | 16/25 | 10/15 | 12/15 | 13/15 | 25% | No answer-first |

### Priority Queue (Lowest Scoring First)
1. post-2.md (42): Full rewrite needed, high AI content risk
2. post-3.md (71): Answer-first formatting + stats needed
3. post-1.md (85): Add OG tags, minor polish

Run `/blog rewrite <file>` on each, starting from lowest score.
```