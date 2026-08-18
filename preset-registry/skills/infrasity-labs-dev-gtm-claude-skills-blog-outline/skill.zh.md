---
name: blog-outline
description: >
  SERP-informed outline generation with H2/H3 heading hierarchy, competitive
  content gap analysis, section-by-section word count targets, chart and image
  placement markers, FAQ question planning, and internal linking zones.
  Skeleton only: structure, H2/H3 hierarchy, word counts, FAQ slots. Use
  blog-brief instead if you need full competitive analysis, statistics
  research, and image suggestions. Lighter than a full content brief,
  generates article skeleton and structure only, ready for /blog write to
  consume. Use when user says "outline", "blog outline", "content outline",
  "structure blog", "plan sections", "article skeleton", "heading structure",
  "SERP analysis", "competitive outline", "plan article".
user-invokable: true
argument-hint: "<topic>"
---
# 博客大纲生成器：基于 SERP 的结构规划

根据 SERP 分析生成博客文章的框架大纲。相比完整的内容简报，这是一种更轻量的替代方案——无需深入的统计研究或全面的竞争分析，即可生成标题层级、章节目标和内容缺口说明。

## 交叉参考

有关大纲编写上游、以证据为导向的主题相关性和内容规划提示，请参阅 `/blog flow find`。`/blog flow optimize` 下的博客文章大纲提示可作为补充性的结构参考。

## 工作流程

### 第 1 步：主题与意图

向用户收集：
1. **主题或目标关键词**（必填）
2. **目标关键词**——希望获得排名的确切短语（如果与主题不同）
3. **搜索意图**——信息型、商业型或交易型

如果只提供了主题，则根据上下文推断关键词和意图。

### 第 2 步：SERP 分析

使用 WebSearch 分析目标关键词排名前 5 的结果：

1. 搜索目标关键词
2. 对排名前 5 的每个结果，记录：
   - **标题结构**——涵盖的 H2/H3 主题
   - **内容长度**——大致字数
   - **视觉元素**——图表、图片、视频、信息图
   - **常见问题**——是否包含常见问题部分或覆盖“其他用户还问了”中的问题
   - **独特角度**——每个结果的独特之处
   - **缺口**——缺失或薄弱之处

3. 如果搜索摘要信息不足，请对排名前 2-3 的结果使用 WebFetch，以提取详细的标题结构。

4. 汇总常见模式和错失的机会。

### 第 3 步：生成大纲

使用以下格式创建结构化大纲：

```
# Outline: [Topic]

## Title Suggestions
1. [Primary title - 40-60 chars, front-loaded keyword, power word]
2. [Alternative title - different angle]
3. [Alternative title - question format]

## Target Parameters
- **Primary keyword**: [keyword]
- **Search intent**: [Informational/Commercial/Transactional]
- **Target word count**: [X,XXX] words
- **H2 sections**: [6-8]
- **Target reading level**: Flesch 60-70

---

## Outline

### H2: [Section Title - Question Format] (~300-400 words)
- **Answer-first opener**: [What stat or fact should open this section?]
- **Key points to cover**:
  - [Point 1]
  - [Point 2]
  - [Point 3]
- **H3: [Subsection]** (if appropriate)
  - [What this subsection covers]
- **Key statistic to find**: [What data point would strengthen this section?]
- **Chart suggestion**: [Bar/Line/Donut/None] - [What data to visualize]
- **Image placement**: [Yes/No] - [Description of recommended image]

### H2: [Section Title] (~300-400 words)
[... repeat for 6-8 sections ...]

### FAQ Section (3-5 items)
1. [Question from People Also Ask] - [Brief answer direction]
2. [Question from People Also Ask] - [Brief answer direction]
3. [Question from People Also Ask] - [Brief answer direction]
4. [Question from SERP analysis] - [Brief answer direction]

### Conclusion (~100-150 words)
- Key takeaways to summarize
- Call to action direction

---

## Internal Linking Zones
- **Link TO from this post**: [Existing content that should be referenced]
- **Link FROM to this post**: [Existing content that should link here]

## Content Gaps to Exploit
1. [What competitors miss that this post should cover]
2. [Unique angle or original perspective to include]
3. [Format advantage - visuals, depth, or structure competitors lack]
```

标题生成指南：
- 60-70% 的 H2 标题应采用疑问句形式
- 每个 H2 都应包含明确的先给答案型段落提示
- 仅在主题确实需要细分时加入 H3 子标题
- 各部分的目标字数之和应等于整篇文章的目标字数
- 图表类型建议应多样化（不得有两个相同类型）
- 图片位置标记应均匀分布在整篇文章中

### 步骤 4：内容缺口

生成大纲后，添加专门的内容缺口分析：
1. 列出所有排名靠前的竞争对手都遗漏的 3-5 个主题或角度
2. 找出可加入原创数据、案例研究或独特观点的机会
3. 说明这篇文章可以具备的形式优势（更多视觉内容、更好的结构、
   对特定子主题进行更深入的探讨）

### 步骤 5：保存

将大纲保存至 `outlines/[slug]-outline.md` 或用户指定的路径。
确认大纲已准备就绪，可供 `/blog write` 使用。

如果 `outlines/` 目录不存在，请创建该目录。