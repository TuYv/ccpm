---
name: blog-write
description: >
  Write new blog articles from scratch optimized for Google rankings and AI
  citations. Generates full articles with template selection, answer-first
  formatting, Key Takeaways summary box, information gain markers, citation capsules, sourced
  statistics, Pixabay/Unsplash images, built-in SVG chart generation, FAQ schema,
  internal linking zones, and proper heading hierarchy. Supports MDX, markdown,
  and HTML output.
  Use when user says "write blog", "new blog post", "create article",
  "write about", "draft blog", "generate blog post".
user-invokable: true
argument-hint: "<topic>"
---
# 博客作者：生成新文章

根据主题、简报或大纲撰写完整的博客文章。每篇文章均遵循双重优化的 6 大支柱（Google 排名 + AI 引用）。

**关键参考资料**（路径相对于仓库根目录；参考资料位于主 `blog` Skill 的 references 目录中，而不是 `blog-write/` 中）：

- `skills/blog/references/synthesis-contract.md`：综合输出的 6 条法则（v1.8.0；只要文章嵌入研究综合类正文，即适用）
- `skills/blog/references/content-templates.md`：模板选择指南和用法
- `skills/blog/references/quality-scoring.md`：5 类评分标准（内容 30、SEO 25、E-E-A-T 15、技术 15、AI 引用 15）
- `skills/blog/references/eeat-signals.md`：经验、专业能力、权威性和可信度标志
- `skills/blog/references/internal-linking.md`：链接策略和锚文本规则
- `skills/blog/references/visual-media.md`：图片来源和图表样式

## 工作流程

### 阶段 0：界面定位（在研究之前执行）

确定这篇文章旨在赢得 FLOW 5 中的哪些界面。具体选择会影响文章结构、篇幅、引用密度和行动号召。2026 年的 5 个界面是：

1. 自有网站（Google 自然搜索排名）
2. 包含 AI Overviews 的 SERP
3. AI 助手引用（ChatGPT、Perplexity、Claude、Gemini、Copilot、You.com）
4. 本地搜索结果包（不在博客内容的范围内；本地 SEO 请使用 claude-seo）
5. 社区和视频（Reddit、YouTube、LinkedIn、Quora、垂直论坛）

默认情况下，大多数文章以界面 1、2 和 3 为目标。如果同一查询也出现在社区中（Reddit 帖子、YouTube 评论），则应用双界面思维：既要优化文章以便内容提取，也要规划社区回响（详见 `/blog repurpose`）。

有关针对各界面的更深入工作流程，请参阅
`skills/blog/references/flow-alignment.md` 和 `/blog flow find`。

### 阶段 1：理解主题

1. **明确主题**——如果用户只提供了一个主题，请询问：
   - 目标受众（内容面向谁？）
   - 主要关键词/搜索意图
   - 期望字数（默认：2,000-2,500 字）
   - 平台/格式（MDX、markdown、HTML——如果位于项目中则自动检测）
2. **如果已有简报**——加载简报并跳至阶段 1.5

### 阶段 1.5：选择模板

从 `skills/blog/templates/` 中的 12 个模板里选择适当的内容模板（templates 目录归主 `blog` Skill 所有）。

1. **根据主题和搜索意图自动检测内容类型**：
   | 信号 | 模板 |
   |--------|----------|
   | “如何……”、流程、步骤 | `how-to-guide` |
   | “最佳 X”、“前 N 名”、列表格式 | `listicle` |
   | 客户成果、前后对比、指标 | `case-study` |
   | “X 与 Y 对比”、比较、替代方案 | `comparison` |
   | 宽泛主题、综合指南 | `pillar-page` |
   | “X 值得吗”、产品评估 | `product-review` |
   | 观点、预测、行业见解 | `thought-leadership` |
   | 专家引语、多来源汇总 | `roundup` |
   | 代码演练、工具演示、技术内容 | `tutorial` |
   | 突发新闻、算法更新、事件 | `news-analysis` |
   | 调查结果、实验、原创数据 | `data-research` |
   | 问答、知识库、“什么是 X” | `faq-knowledge` |

2. **加载匹配的模板**：读取 `skills/blog/templates/<type>.md`
3. **调整大纲** - 使用模板的章节结构、标题模式和字数指导来设计阶段 3 的大纲
4. **回退方案** - 如果没有明确匹配的模板，则使用下方阶段 3 中的通用大纲结构。告知用户选择了哪个模板（或没有匹配的模板）。

有关详细的选择标准和意图映射，请参阅 `skills/blog/references/content-templates.md`。

### 阶段 2：研究

启动一个 `blog-researcher` 代理（或使用 WebSearch 进行内联研究）：

1. **查找 8-12 项最新统计数据**（优先选择 2025-2026 年的数据）
   - 搜索：`[topic] study 2025 2026 data statistics`
   - 优先选择第 1-3 级来源（参阅 `skills/blog/references/quality-scoring.md`）
   - 记录：统计数据、来源名称、URL、日期、研究方法
2. **查找封面图片**（宽幅、高质量、与主题相关）：
   - 搜索：`site:pixabay.com [topic] wide banner`（首选）
   - 备选：`site:unsplash.com [topic] wide`
   - 回退：`site:pexels.com [topic] wide banner`
   - 目标尺寸：1200x630（兼容 OG）或 1920x1080
   - 或通过 `blog-chart` 生成自定义 SVG 封面（在渐变背景上显示关键统计数据文本）
   - 或通过 `blog-image` 子技能生成自定义 AI 图片（如果已配置 nanobanana-mcp）
   - 有关封面图片尺寸的详细信息，请参阅 `skills/blog/references/visual-media.md`
3. **从开源平台查找 3-5 张内嵌图片**：
   - **Pixabay**（首选）：搜索 `site:pixabay.com [topic keywords]`
     - 从页面中提取图片 URL
     - 直接 URL：`https://cdn.pixabay.com/photo/YYYY/MM/DD/HH/MM/filename.jpg`
     - 验证 `curl -sI "<url>" | head -1` 返回 HTTP 200
   - **Unsplash**（备选）：搜索 `site:unsplash.com [topic keywords]`
     - 构建 URL：`https://images.unsplash.com/photo-<id>?w=1200&h=630&fit=crop&q=80`
   - **Pexels**（回退）：搜索 `site:pexels.com [topic keywords]`
4. **根据研究所得的统计数据规划 2-4 个数据可视化图表**
   - 选择多样化的图表类型（参阅 `skills/blog/references/visual-media.md`）
   - 将数据点映射到图表格式
5. **AI 图片生成**（可选，如果已配置 nanobanana-mcp）：
   - 当图库照片搜索结果不足（匹配良好的图片少于 3 张）或主题过于小众时
   - 通过 `blog-image` 子技能生成自定义主视觉图片和/或内嵌插图
   - 图库照片仍是默认选择——AI 生成仅作为补充，绝不替代图库照片
6. **NotebookLM 研究**（可选，如果用户有相关笔记本）：
   - 如果用户提及 NotebookLM 笔记本，或主题与已配置的笔记本相符
   - 通过 `blog-notebooklm` 查询基于用户所上传文档中来源信息的数据
   - 将 NotebookLM 的响应视为第 1 级来源（用户自己的原始文档）
   - 如果未配置或未通过身份验证，则静默回退
7. **查找相关的 YouTube 视频**（每篇文章 2-3 个）：
   - 使用 `blog-google` youtube 命令或通过 WebSearch 搜索 `site:youtube.com [topic] [year]`
   - 应用 `skills/blog/references/video-embeds.md` 中的质量标准（最低得分 50/100）
   - 选择最佳的 2-3 个视频。如果未找到，则静默回退。

### 阶段 3：大纲生成

在写作前创建结构化大纲。如果在阶段 1.5 中加载了模板，
请调整此框架以匹配模板的章节结构：

```
# [Title as Question - Include Primary Keyword]

## Introduction (100-150 words)
- Hook with surprising statistic
- Problem/opportunity statement
- What the reader will learn

> **Key Takeaways**
> - [Core finding with statistic and source]
> - [Second key insight or recommendation]
> - [Third actionable takeaway]
> (3-5 bullets, 40-60 words combined)

## H2: [Question Format] (300-400 words)
- Answer-first paragraph (40-60 words with stat + source)
- Supporting evidence
- [Image placement]
- Practical advice
- [CITATION CAPSULE placeholder]
- [INTERNAL-LINK: anchor text → target description]

## H2: [Question Format] (300-400 words)
- Answer-first paragraph
- [Chart: type + data description]
- Analysis and implications
- [CITATION CAPSULE placeholder]
- [INTERNAL-LINK: anchor text → target description]

## H2: [Statement for Variety] (300-400 words)
- Answer-first paragraph
- Real-world example or case study
- [Image placement]
- [CITATION CAPSULE placeholder]

## H2: [Question Format] (300-400 words)
- Answer-first paragraph
- [Chart: type + data description]
- Step-by-step guidance
- [CITATION CAPSULE placeholder]
- [INTERNAL-LINK: anchor text → target description]

## H2: [Question Format] (200-300 words)
- Answer-first paragraph
- Forward-looking analysis

## [CTA Section or Inline Placement]
- See `skills/blog/references/cta-placement.md` for placement rules by content type
- Place CTA after value delivery, not at arbitrary positions
- Single focused CTA per post (266% more conversions)
- [CTA: contextual call-to-action matching article topic]

## FAQ Section (3-5 questions, 40-60 words each answer)
- [INTERNAL-LINK: anchor text → detailed content]

## Conclusion (100-150 words)
- Key takeaways (bulleted)
- Call to action
- [INTERNAL-LINK: anchor text → next logical content]
```

在开始写作前向用户展示大纲并征得批准。

**视觉元素节奏**：每隔 300-500 个单词插入 `[IMAGE]`、`[CHART]`、`[VIDEO]` 或 `[CALLOUT]` 标记。交替使用不同类型（不得连续使用相同类型）。请参阅 `skills/blog/references/content-rules.md` 的“视觉节奏”部分以及 `skills/blog/references/cta-placement.md` 中有关 CTA 定位的规则。

### 阶段 4：图表生成（内置）

当研究人员发现适合制作图表的数据（3 个以上可比较的指标、趋势数据、前后对比）时：

1. 使用多样性规则选择图表类型（每篇文章中不得重复使用相同类型）
2. 调用 `blog-chart` 子技能，并传入：图表类型、标题、数据值、来源、平台格式
3. 将返回的 SVG 直接嵌入文章中的 `<figure>` 包装器内
4. 每篇 2,000 词的文章以包含 2-4 个图表为目标
5. 均匀分布图表——绝不要将它们集中在一起

有关图表类型选择和样式规则，请参阅 `skills/blog/references/visual-media.md`。

### 阶段 5：内容写作

按照以下规则撰写完整文章：

#### 5a. Frontmatter
```yaml
---
title: "[Question-format title with primary keyword]"
description: "[Fact-dense, 150-160 chars, includes 1 statistic]"
coverImage: "[URL from Pixabay/Unsplash/Pexels or generated SVG path]"
coverImageAlt: "[Descriptive sentence about the cover image]"
ogImage: "[Same as coverImage, or custom OG image URL]"
date: "YYYY-MM-DD"
lastUpdated: "YYYY-MM-DD"
author: "[Author name]"
tags: ["keyword1", "keyword2", "keyword3"]
---
```

如果平台使用不同的字段名（例如 `image`、`hero`、`thumbnail`），
请进行调整，以匹配项目现有的 frontmatter 约定。

#### 5b. 摘要框（关键要点）

在引言之后（第一个 H2 正文部分之前）立即添加摘要框：

```markdown
> **Key Takeaways**
> - [Core finding with statistic] ([Source], year)
> - [Second key insight or recommendation]
> - [Third actionable takeaway]
```

要求：
- 3-5 个要点，总计 40-60 个单词
- 必须内容完整独立——无需阅读文章即可理解
- 包含 1 项具体统计数据及来源名称
- 说明关键发现、建议或答案
- 默认标签：“Key Takeaways”。如果启用了 persona，请使用该 persona 的 `summary_label`
- 向后兼容：重写时接受现有的 TL;DR 摘要框

#### 5c. 答案优先格式（关键要求）
每个 H2 章节都必须以一段 40-60 个单词的文字开头，其中包含：
- 至少一项具体统计数据及来源归属
- 对标题隐含问题的直接回答

格式：
```markdown
## How Does X Impact Y in 2026?

[Stat from source] ([Source Name](url), year). [Direct answer to the heading
question in 1-2 more sentences, explaining the implication and what this means
for the reader.]
```

**FLOW 证据三要素（撰写要求，而不只是审核要求）：**

每项公开统计数据在撰写时都必须包含三个组成部分：

1. **正文中的年份锚点。** 在统计数据之前、句子正文中写明“In 2026,”或“As of Q1 2026,”。
   仅将年份置于括号内不算。示例：
   - 正确：“In 2026, Ahrefs found a 58% lower CTR for position one when
     an AI Overview was present.”
   - 较弱：“Position-one CTR dropped 58% (Ahrefs, 2026).”

2. **包含发布者和标题的行内引用。** 不要只提及品牌，还要同时注明发布者以及文档标题
   （或报告名称）。示例：
   - 正确：“Ahrefs, AI Overviews CTR update, December 2025”
   - 较弱：“Ahrefs reported...”

3. **文章底部来源区块中的 URL 和检索日期。**
   严格遵循来源追溯规范，可让未来的读者和 AI 爬虫验证来源是否仍然支持所声明的内容。格式：
   - “[Publisher], [Title], retrieved YYYY-MM-DD, [full URL]”

**FLOW 质量标准（删除或替换）：**
公开声明必须使用经过验证的来源，否则应保持定性表述。如果某项统计数据
无法验证，则将其删除。如果较新的来源与其相矛盾，
则用经过验证的替代数据取代它。不要通过弱化模糊措辞
来保留无法注明来源的数字。

对于以证据为导向的优化提示（CTR 审核、AI 检测器测试、schema、
PAA 改写、ChatGPT 可见性），请参阅 `/blog flow optimize`。

#### 5d. 信息增益标记

在整篇文章中至少分布 2-3 个信息增益标记。这些标记向搜索引擎和 AI 系统
表明，内容包含其他地方无法获得的原创价值。

使用注释或可见标记为每项内容添加标签：

- `[ORIGINAL DATA]` - 作者亲自收集的专有调查、实验、A/B 测试结果、案例
  研究指标
- `[PERSONAL EXPERIENCE]` - 第一手观察、从直接参与中获得的经验教训、
  “当我们尝试 X 时，发生了 Y”类叙述
- `[UNIQUE INSIGHT]` - 他人尚未提出的分析、有数据支持的逆向观点、
  对现有研究之间关系的新颖解读

放置方式：
- 自然融入正文
- 在相关段落之前用作行内注释：`<!-- [ORIGINAL DATA] -->`
- 如果格式支持，也可用作可见的强调块：
  ```markdown
  > **Our finding:** [original observation backed by specific data]
  ```
- 每篇文章至少 2 个，综合性文章以 3 个为目标

这些标记直接对应内容质量评分类别中的“原创性/独特价值标记”标准
（请参阅 `skills/blog/references/quality-scoring.md`）。

#### 5e. 引用胶囊

为每个主要 H2 章节生成一个引用胶囊——一段 40-60 词、内容完整独立的
文本，便于 AI 系统直接提取和引用。

每个胶囊的要求：
- 40-60 词，内容完整独立（脱离上下文也能理解）
- 包含：一个具体论点 + 一个数据点 + 来源归属
- 采用陈述性、可引用的风格撰写
- 放置在 H2 章节正文中（而不是作为单独的内容块）

示例：
```markdown
According to a 2026 Gartner study, 58% of enterprise buyers now consult AI
assistants before contacting a vendor ([Gartner](https://www.gartner.com), 2026).
This shift means B2B content must answer specific questions concisely enough
for AI systems to extract and cite in their responses.
```

胶囊对应 `skills/blog/references/quality-scoring.md` 中的
“AI 引用就绪度”评分类别（15 分）。

#### 5f. 内部链接区域

使用占位符表示法标记整篇文章中的内部链接机会。用户（或后续处理流程）
会将这些占位符替换为实际 URL。

区域放置：
- **引言** - 链接到相关支柱内容或主题中心
- **每个 H2 章节** - 链接到支持性文章、深度解析、相关工具
- **FAQ 章节** - 将答案链接到对其进行扩展说明的详细内容
- **结论** - 链接到读者接下来应阅读的、逻辑上相关的内容

格式：
```markdown
[INTERNAL-LINK: anchor text → target description]
```

示例：
```markdown
For a deeper dive into keyword clustering, see our
[INTERNAL-LINK: complete guide to keyword clustering → pillar page on keyword research methodology].
```

每篇 2,000 词的文章以设置 5-10 个内部链接区域为目标。使用描述性锚文本
（切勿使用“点击此处”或“阅读更多”）。有关锚文本规则和链接策略，请参阅
`skills/blog/references/internal-linking.md`。

#### 5g. 段落规则
- 每个段落：40-80 个单词（绝不超过 150 个）
- 每个句子：最多 15-20 个单词
- 每个段落都以最重要的信息开头
- 目标 Flesch 阅读易读性分数：60-70

#### 5h. 标题规则
- 仅使用一个 H1（只用于标题）
- H2 用于主要章节（其中 60-70% 使用问句）
- H3 仅用于子章节——绝不跳过标题层级
- 在 2-3 个标题中自然融入主要关键词

#### 5i. 图片嵌入

标准 Markdown：
```markdown
![Descriptive alt text - topic keywords naturally](https://cdn.pixabay.com/photo/...)
```

使用 Next.js Image 的 MDX（如检测到）：
```mdx
![Descriptive alt text - topic keywords naturally](https://cdn.pixabay.com/photo/...)
```

- 将图片放在 H2 标题之后、正文之前
- 在整篇文章中均匀分布图片（不要集中放置）
- 替代文本应为完整的描述性句子

#### 5j. 图表嵌入

标准 Markdown/HTML：
```html
<figure>
  <svg viewBox="0 0 560 380" ...>...</svg>
  <figcaption>Source: [Source Name], [Year]</figcaption>
</figure>
```

MDX 格式：
```mdx
<figure className="chart-container" style={{margin: '2.5rem 0', textAlign: 'center', padding: '1.5rem', borderRadius: '12px'}}>
  <svg viewBox="0 0 560 380" ...>...</svg>
</figure>
```

#### 5k. 视频嵌入
使用 `skills/blog/references/video-embeds.md` 中的 srcdoc 延迟加载模式嵌入 YouTube 视频。
包含 aria-label，并为 AI 爬虫提供 noscript 后备内容。放在相关 H2 之后，各视频之间至少间隔 500 个单词。

#### 5l. 引用格式
始终使用行内归因：
```markdown
Organic CTR declined 61% with AI Overviews ([Seer Interactive](https://www.seerinteractive.com/), 2025).
```

#### 5m. FAQ 章节
添加 3-5 个 FAQ 条目，每个答案包含 40-60 个单词。每个答案都必须包含一项统计数据。

对于使用 FAQSchema 组件的 MDX：
```mdx
<FAQSchema faqs={[
  { question: "Question?", answer: "40-60 word answer with statistic and source." },
]} />
```

对于标准 Markdown：
```markdown
## Frequently Asked Questions

### Question text here?

Answer with statistic and source attribution (40-60 words).
```

#### 5n. 内部链接
- 每篇 2,000 个单词的文章包含 5-10 个内部链接
- 自然链接到相关的现有内容
- 使用描述性锚文本（不要使用“点击此处”）

### 阶段 6：质量检查

交付前，请验证：

#### 结构与内容
1. 每个 H2 均以统计数据和来源开头
2. 任何段落均不超过 150 个单词
3. 所有统计数据均注明 1-3 级来源
4. 包含 2-4 个类型多样的图表
5. 包含 3-5 张带有描述性替代文本的行内图片
6. frontmatter 中包含封面图片（coverImage + ogImage）
7. 包含含有 3-5 个条目的 FAQ 章节
8. 标题层级清晰（H1 -> H2 -> H3）
9. 元描述长度为 150-160 个字符，并包含一项统计数据

#### 新元素验证
10. 引言后包含 TL;DR 框（40-60 个单词，包含统计数据和来源）
11. 至少包含 2-3 个信息增益标记（`[ORIGINAL DATA]`、`[PERSONAL EXPERIENCE]` 或 `[UNIQUE INSIGHT]`）
12. 主要 H2 章节中包含引用胶囊（40-60 个单词、内容完整、可单独引用）
13. 在引言、H2 章节、FAQ 和结论中标记内部链接区域
14. 不包含禁用列表中可被检测为 AI 生成的短语（参见 `agents/blog-writer.md`）

#### 突发性与自然度检查
15. **句子长度变化** - 确认短句（8 个单词）和长句（25 个单词）混合使用。句子长度一致是 AI 创作的信号。
16. **禁用 AI 短语扫描** - 检查并移除：
    - "in today's digital landscape", "it's important to note", "dive into"
    - "game-changer", "navigate the landscape", "revolutionize", "seamlessly"
    - "cutting-edge", "harness the power of", "leverage"（用作动词时）
    - "delve", "crucial", "elevate", "foster", "landscape"（过度使用）
    - "multifaceted", "robust", "tapestry", "embark"
    - 完整列表位于 `agents/blog-writer.md`
17. **缩略形式** - 确认自然使用缩略形式（"it's"、"we've"、"don't"、"isn't"）。正式的 AI 文体会避免使用缩略形式，而自然写作会使用它们。
18. **反问句** - 确认每 200-300 个单词至少使用一个反问句，以打破陈述句式的固定模式。
19. **YouTube 视频** - 嵌入 2-3 个视频，并提供延迟加载、aria-label 和 noscript 后备内容（参见 `skills/blog/references/video-embeds.md`）

### 阶段 6.5：交付契约执行

在阶段 7 之前，按照 `skills/blog/references/blog-delivery-contract.md` 运行包含 5 道门禁的交付契约。用户绝不能成为第一位审阅者；门禁才是。

步骤：

1. **能力发现 + 主视觉图**：运行 `python scripts/blog_preflight.py --draft <folder> --gate 1` 以枚举可用路径。如果已加载 `nanobanana-mcp`，则通过 MCP 工具生成主视觉图。否则运行 `python scripts/generate_hero.py --topic "<title>" --tags "<tags>" --out <folder>`（使用 Gemini、Unsplash、Pexels、Pixabay、Openverse 的阶梯式回退方案）。

2. **格式完整性**：通过 `python scripts/blog_render.py --md <slug>.md --out-dir <folder>` 将规范的 `.md` 渲染为 `.html` 和 `.pdf`。所有三种产物以及 `hero.<ext>` 都必须最终位于草稿文件夹中。

3. **内容审查（阻断性）**：针对渲染后的 `.html` 调度 `blog-reviewer` 代理（Task 工具）。该代理将其评分表输出到 `<folder>/review.md`，并以 `BLOCKING: true|false (reason)` 结尾。阈值：总分达到或超过 90/100，并且根据 `editorial-heuristics.md` 不存在任何 P0 问题。

4. **视觉 + 资源门禁**：运行 `python scripts/blog_preflight.py --draft <folder> --strict`。这会运行门禁 3（通过 patchright 在 3 种视口宽度下进行视觉验证）、门禁 4（读取 review.md 中的 BLOCKING 行）和门禁 5（资源 + 链接完整性）。退出码 0 = 交付；退出码 1 = 阻断。

5. **迭代**：遇到任何阻断时，从 `<folder>/preflight-report.json` 获取失败诊断，将该诊断作为输入重新调度 blog-writer 代理，然后从步骤 1 重新运行。最多迭代 3 次。如果第 3 次仍然失败，则停止并提供失败诊断，而不是草稿。

编排器负责维护循环计数器；此子技能本身绝不执行循环。

### 阶段 7：交付

仅在阶段 6.5 的所有门禁均通过后，才展示完成的文章。在摘要中包含 `<folder>/preview/*.png` 中的截图，以便用户在阅读正文之前了解他们将获得什么。

摘要模板：

```
## Blog Post Complete: [Title]

### Template Used
- [Template name] (or "generic outline - no template matched")

### Statistics
- [N] sourced statistics from tier 1-3 sources
- [N] unique sources cited

### Visual Elements
- Cover image: [source - Pixabay/Unsplash/Pexels or generated SVG]
- [N] inline images (Pixabay/Unsplash/Pexels)
- [N] SVG charts (types: bar, lollipop, donut, line)
- [N] YouTube video embeds (titles: ...)

### Dual-Optimization Elements
- TL;DR box: present (N words)
- Information gain markers: [N] ([types used])
- Citation capsules: [N] across H2 sections
- Internal linking zones: [N] marked

### Structure
- [N] H2 sections with answer-first formatting
- [N] FAQ items with schema
- Word count: ~[N] words
- Estimated reading time: [N] min

### Naturalness
- Sentence length variance: [pass/fail]
- AI phrase scan: [pass/fail]
- Contractions used: [yes/no]
- Rhetorical questions: [N] (target: 1 per 200-300 words)

### Next Steps
- Review and customize for your brand voice
- Resolve [INTERNAL-LINK] placeholders with actual URLs
- Add internal links to your existing content
- Run `/blog analyze <file>` to verify quality score
- Generate VideoObject schema: `/blog schema <file>` (includes video markup)
- Generate audio narration: `/blog audio generate <file>` (optional)
```