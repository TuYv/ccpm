---
name: meta-tags-optimizer
argument-hint: "<URL or page title to optimize>"
description: >
  Optimize title tags, meta descriptions, Open Graph, and Twitter cards for
  maximum click-through rate. Generates multiple A/B test variations with
  character counting and SERP preview. Use when asked to "optimize title tag",
  "write meta description", "improve CTR", "Open Graph tags", "fix my meta
  tags", "social media preview", "my click rate is low", "title optimization",
  or any meta tag task.
---
# Meta 标签优化器

此技能可创建具有吸引力且经过优化的 Meta 标签，从而提高搜索结果的点击率，并增强社交媒体分享效果。它涵盖标题标签、Meta 描述和社交媒体 Meta 标签。

## 必须触发此技能的情况

当对话涉及以下任何情况时，请使用此技能——即使用户没有使用 SEO 术语：

只要任务需要生成可直接进入质量审查、部署或监控流程的可交付成果或转换结果，就应使用此技能。

- 为新页面创建 Meta 标签
- 优化现有 Meta 标签以提高 CTR
- 为页面的社交媒体分享做好准备
- 修复重复或缺失的 Meta 标签
- 对标题和描述的不同版本进行 A/B 测试
- 针对特定 SERP 功能进行优化
- 为不同类型的页面创建 Meta 标签

## 此技能的作用

1. **创建标题标签**：撰写具有吸引力且经过关键词优化的标题
2. **撰写 Meta 描述**：创建能够吸引点击的描述
3. **Open Graph 优化**：为页面的社交分享做好准备
4. **Twitter Card 设置**：优化 Twitter 专用 Meta 标签
5. **CTR 分析**：提出改进建议以提高点击率
6. **字符计数**：确保长度适合在 SERP 中展示
7. **A/B 测试建议**：提供用于测试的不同版本

## 快速开始

从以下任一提示词开始。

### 创建 Meta 标签

```
Create meta tags for a page about [topic] targeting [keyword]
```

```
Write title and meta description for this content: [content/URL]
```

### 优化现有标签

```
Improve these meta tags for better CTR: [current tags]
```

### 社交媒体标签

```
Create Open Graph and Twitter card tags for [page/URL]
```

## 数据源

**已连接~~搜索控制台 + ~~SEO 工具时：**
自动获取当前 Meta 标签、按查询划分的 CTR 数据、竞争对手的标题/描述模式、SERP 预览数据，以及展示量/点击量指标，以识别优化机会。

**仅有手动数据时：**
要求用户提供：
1. 当前标题和 Meta 描述（如果要优化现有内容）
2. 目标主要关键词和 2-3 个次要关键词
3. 页面 URL 和主要内容/价值主张
4. 竞争对手 URL，或 SERP 中表现良好的标题示例

使用所提供的数据执行完整工作流程。在输出中注明哪些指标来自自动收集，哪些来自用户提供的数据。

## 说明

当用户请求优化 Meta 标签时：

1. **收集页面信息**

   ```markdown
   ### Page Analysis
   
   **Page URL**: [URL]
   **Page Type**: [blog/product/landing/service/homepage]
   **Primary Keyword**: [keyword]
   **Secondary Keywords**: [keywords]
   **Target Audience**: [audience]
   **Primary CTA**: [action you want users to take]
   **Unique Value Prop**: [what makes this page special]
   ```

2. **创建经过优化的标题标签**

   ```markdown
   ### Title Tag Optimization
   
   **Requirements**:
   - Length: 50-60 characters (displays fully in SERP)
   - Include primary keyword (preferably near front)
   - Make it compelling and click-worthy
   - Match search intent
   - Include brand name if appropriate
   
   **Title Tag Formula Options**:
   
   1. **Keyword | Benefit | Brand**
      "[Primary Keyword]: [Benefit] | [Brand Name]"
      
   2. **Number + Keyword + Promise**
      "[Number] [Keyword] That [Promise/Result]"
      
   3. **How-to Format**
      "How to [Keyword]: [Benefit/Result]"
      
   4. **Question Format**
      "What is [Keyword]? [Brief Answer/Hook]"
      
   5. **Year + Keyword**
      "[Keyword] in [Year]: [Hook/Update]"
   
   **Generated Title Options**:
   
   | Option | Title | Length | Power Words | Keyword Position |
   |--------|-------|--------|-------------|------------------|
   | 1 | [Title] | [X] chars | [words] | [Front/Middle] |
   | 2 | [Title] | [X] chars | [words] | [Front/Middle] |
   | 3 | [Title] | [X] chars | [words] | [Front/Middle] |
   
   **Recommended**: Option [X]
   **Reasoning**: [Why this option is best]
   
   **Title Tag Code**:
   ```html
   <title>[Selected Title]</title>
   ```
   ```

3. **撰写元描述**

   ```markdown
   ### Meta Description Optimization
   
   **Requirements**:
   - Length: 150-160 characters (displays fully in SERP)
   - Include primary keyword naturally
   - Include clear call-to-action
   - Match page content accurately
   - Create urgency or curiosity
   - Avoid duplicate descriptions
   
   **Meta Description Formula**:
   
   [What the page offers] + [Benefit to user] + [Call-to-action]
   
   **Power Elements to Include**:
   - Numbers and statistics
   - Current year
   - Emotional triggers
   - Action verbs
   - Unique value proposition
   
   **Generated Description Options**:
   
   | Option | Description | Length | CTA | Emotional Trigger |
   |--------|-------------|--------|-----|-------------------|
   | 1 | [Description] | [X] chars | [CTA] | [Trigger] |
   | 2 | [Description] | [X] chars | [CTA] | [Trigger] |
   | 3 | [Description] | [X] chars | [CTA] | [Trigger] |
   
   **Recommended**: Option [X]
   **Reasoning**: [Why this option is best]
   
   **Meta Description Code**:
   ```html
   <meta name="description" content="[Selected Description]">
   ```
   ```

4. **创建 Open Graph、Twitter Card 和其他元标签**

   生成 OG 标签（og:type、og:url、og:title、og:description、og:image）、Twitter Card 标签、规范 URL、robots、viewport、author 以及文章专用标签。然后将其组合成完整的元标签代码块。

   > **参考**：有关 OG 类型选择指南、Twitter Card 类型选择、所有 HTML 代码模板以及完整的元标签代码块模板，请参阅 [references/meta-tag-code-templates.md](references/meta-tag-code-templates.md)。

5. **CORE-EEAT 一致性检查**

   验证元标签是否符合内容质量标准（CORE-EEAT 基准）。

   ```markdown
   ### CORE-EEAT Meta Tag Alignment

   | Check | Status | Notes |
   |-------|--------|-------|
   | **C01 Intent Alignment**: Title promise matches actual content delivery | ✅/⚠️/❌ | [Does the title accurately represent what the page delivers?] |
   | **C02 Direct Answer**: Meta description reflects the core answer available in first 150 words | ✅/⚠️/❌ | [Does the description preview the direct answer?] |

   **If C01 fails**: Title is misleading — rewrite to match actual content.
   **If C02 fails**: Content may need restructuring to front-load the answer, or description should better reflect available content.
   ```

9. **提供 CTR 优化建议**

   ```markdown
   ## CTR Optimization Analysis

   ### Power Words Used
   - [Word 1] - Creates [emotion/action]
   - [Word 2] - Creates [emotion/action]

   ### CTR Boosting Elements

   | Element | Present | Impact |
   |---------|---------|--------|
   | Numbers | Yes/No | +20-30% CTR |
   | Current Year | Yes/No | +15-20% CTR |
   | Power Words | Yes/No | +10-15% CTR |
   | Question | Yes/No | +10-15% CTR |
   | Brackets | Yes/No | +10% CTR |

   ### A/B Test Suggestions

   Test these variations:

   **Version A** (Current):
   - Title: [Title]
   - Description: [Description]

   **Version B** (Test):
   - Title: [Alternative title]
   - Description: [Alternative description]
   - Hypothesis: [Why this might perform better]
   ```

## 验证检查点

### 输入验证
- [ ] 已确认主要关键词，且与页面内容匹配
- [ ] 已识别页面类型（博客/产品/落地页/服务/首页）
- [ ] 已明确定义目标受众和搜索意图
- [ ] 已清晰阐述独特价值主张

### 输出验证
- [ ] 标题长度为 50-60 个字符（可在 SERP 中完整显示）
- [ ] 元描述长度为 150-160 个字符
- [ ] 主要关键词同时出现在标题和描述中
- [ ] 已指定 Open Graph 图片（建议使用 1200x630px）
- [ ] 所有 HTML 语法均有效（没有未闭合的引号或标签）
- [ ] 已明确说明每个数据点的来源（~~搜索控制台 CTR 数据、~~SEO 工具竞品数据、用户提供或估算）

## 示例

**用户**：“为一篇关于‘how to start a podcast in [current year]’的博客文章创建元标签”

**输出**：

```markdown
## Meta Tags: How to Start a Podcast ([current year])

### Title Tag
```html
<title>How to Start a Podcast in [current year]: Complete Beginner's Guide</title>
```
**Length**: ~55 characters ✅
**Keyword**: "how to start a podcast" at front ✅
**Power Words**: "Complete", "Beginner's" ✅

### Meta Description
```html
<meta name="description" content="Learn how to start a podcast in [current year] with our step-by-step guide. Covers equipment, hosting, recording, and launching your first episode. Start podcasting today!">
```
**Length**: ~163 characters ✅
**Keyword**: Included naturally ✅
**CTA**: "Start podcasting today!" ✅

_Complete meta tag block (with OG, Twitter, Article tags) generated using template from [references/meta-tag-code-templates.md](references/meta-tag-code-templates.md)._

### A/B Test Variations

**Title Variation B**:
"Start a Podcast in [current year]: Step-by-Step Guide (+ Free Checklist)"

**Title Variation C**:
"How to Start a Podcast: [current year] Guide [Equipment + Software + Tips]"

**Description Variation B**:
"Want to start a podcast in [current year]? This guide covers everything: equipment ($100 budget option), best hosting platforms, recording tips, and how to get your first 1,000 listeners."
```

## 成功技巧

1. **将关键词前置** - 把重要术语放在开头
2. **匹配意图** - 描述应预先说明页面提供的内容
3. **具体明确** - 模糊的描述会被忽略
4. **测试不同版本** - 微小改动也能显著影响 CTR
5. **定期更新** - 添加当前年份并更新文案
6. **检查竞争对手** - 查看你的 SERP 中哪些做法行之有效


## 参考资料

- [元标签公式](references/meta-tag-formulas.md) — 经过验证的标题和描述公式
- [CTR 与社交媒体参考](references/ctr-and-social-reference.md) — 页面类型模板、CTR 数据和 OG 最佳实践

## 下一项最佳技能

- **首选**：[schema-markup-generator](../schema-markup-generator/SKILL.md) — 使用结构化数据完善 SERP 展示信息。