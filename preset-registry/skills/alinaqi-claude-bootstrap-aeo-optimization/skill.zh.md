---
name: aeo-optimization
description: AI Engine Optimization - semantic triples, page templates, content clusters for AI citations
when-to-use: When optimizing content for AI engine discovery and citations
user-invocable: false
effort: medium
---
# AI 引擎优化（AEO）技能


**目的：** 针对 AI 引擎（ChatGPT、Claude、Perplexity、Google AI Overviews）优化内容，使你的品牌能够在 AI 生成的答案中被引用。

**来源：** 基于 [HubSpot 的 AEO 指南](https://www.hubspot.com/aeo)和行业最佳实践。

---

## 为什么 AEO 如今至关重要

```
┌────────────────────────────────────────────────────────────────┐
│  THE GREAT DECOUPLING                                          │
│  ────────────────────────────────────────────────────────────  │
│  Impressions ≠ Clicks anymore.                                 │
│  AI engines compile answers from multiple sources.             │
│  More buyer journey happens inside chat experiences.           │
│  58% of Google searches = zero clicks (AI overviews).          │
├────────────────────────────────────────────────────────────────┤
│  THE OPPORTUNITY                                               │
│  ────────────────────────────────────────────────────────────  │
│  Shape what AI engines say about your category and product.    │
│  Get cited as the authoritative source.                        │
│  Best answer > Best page ranking.                              │
└────────────────────────────────────────────────────────────────┘
```

**关键统计数据：**
- 70% 的消费者使用 ChatGPT 进行搜索
- 47% 的 Google 查询会显示 AI 概览
- ChatGPT 提示词平均长度：23 个单词（Google 为 4.2 个）
- AEO 市场规模：8.86 亿美元（2024 年）→ 73 亿美元（2031 年）

---

## AI 引擎如何选择答案

AI 引擎使用三种主要信号来选择用于生成答案的内容：

### 1. 共识

出现在多个可信来源中的事实会获得信任并被重复使用。

**如何建立共识：**
- 在你自己的各个页面中一致地重复关键事实
- 使用与行业领导者相同的术语
- 链接到权威的外部来源，并争取获得其反向链接
- 创建能够相互强化的内部内容集群

### 2. 信息增益

全新的见解胜过泛泛的建议。AI 引擎更青睐能够带来额外价值的内容。

**如何增加信息增益：**
- 原创研究和数据
- 包含具体细节的实例
- 明确的观点（而非模棱两可）
- 附有资历信息的专家引述
- 包含指标数据的案例研究

### 3. 实体与结构

明确的实体和整洁的结构能够减少歧义并提高内容的可引用性。

**如何优化结构：**
- 使用语义三元组（主语 → 谓语 → 宾语）
- 使用包含实体名称的清晰标题
- 使用 Schema 标记（Article、FAQ、Product）
- 使用简短且易于浏览的段落（2 至 4 句话）

---

## 语义三元组（对 AEO 至关重要）

**定义：** AI 引擎（以及人类）不会误读的简洁事实。

**模式：** `[Subject]` `[verb]` `[object]`。

### 示例

```
✅ GOOD (clear triples):
- HubSpot CRM syncs contact and company data.
- Lead Scoring assigns priority based on engagement.
- Workflows trigger email sequences from events.

❌ BAD (vague, no clear entity):
- The system helps with various tasks.
- It can do many things for users.
- This improves overall performance.
```

### 三重检查清单

对于每一项关键主张，请检查：
- [ ] 主语是否为明确的实体（产品、功能、品牌）？
- [ ] 动词是否具体且使用主动语态？
- [ ] 宾语是否具体且可衡量？

---

## 段落模式（功能 → 原理 → 结果）

每个实质性段落都应遵循以下结构：

```
[Feature] helps [User/Role] with [Job].
It [mechanism/inputs] to [process].
Teams see [metric/result] in [timeframe/context].

Triples:
- [Subject] [verb] [object].
- [Subject] [verb] [object].
```

### 示例

```markdown
Lead Scoring helps sales teams prioritize prospects. It combines
page views, email engagement, and firmographic data to assign a
numeric score, then auto-enrolls high scorers into follow-up
sequences. Reps focus on qualified accounts and book 40% more
meetings.

- Lead Scoring assigns scores from engagement data.
- High scorers trigger automated follow-up sequences.
```

---

## 页面模板

### 模板 1：类别解读页

**目标：** 定义类别，将其与你的产品关联起来，并获得引用。

```markdown
# What is [Category]? — [1-2 line value promise]

## What is [Category]? (~80 words)
[Plain definition in everyday language. Name adjacent entities.]

Triples:
1. [Subject] [verb] [object].
2. [Subject] [verb] [object].

## Why it matters now (~60 words)
[One paragraph. Mention shift to answers over links; tie to buyer outcomes.]

## How to apply it (3-5 bullets)
- [Action 1]
- [Action 2]
- [Action 3]

## FAQ
**Q: [Question]?**
A: [~1 sentence answer]

**Q: [Question]?**
A: [~1 sentence answer]

**Q: [Question]?**
A: [~1 sentence answer]

---
**Links:** [Category hub] | [Product/Feature] | [Credible source 1] | [Credible source 2]
**CTA:** [Demo / Template / Signup]
**Schema:** Article + FAQ. Author + last updated.
```

---

### 模板 2：产品与功能页面

**目标：** 阐明功能、适用场景和下一步操作，并强化与类别的关联。

```markdown
# [Product/Feature] — [Outcome in 3-5 words]

**[Product/Feature] enables [Outcome] for [User/Role].**

## [Feature Area 1]
[2-4 sentences using Feature → How → Outcome]

Triples:
1. [Subject] [verb] [object].
2. [Subject] [verb] [object].

## [Feature Area 2]
[2-4 sentences using Feature → How → Outcome]

Triples:
1. [Subject] [verb] [object].
2. [Subject] [verb] [object].

## [Feature Area 3]
[2-4 sentences using Feature → How → Outcome]

Triples:
1. [Subject] [verb] [object].
2. [Subject] [verb] [object].

## FAQ
**Q: [Question]?**
A: [~1 sentence]

**Q: [Question]?**
A: [~1 sentence]

**Q: [Question]?**
A: [~1 sentence]

---
**Links:** Back to [Category Explainer] | Forward to [Demo/Trial]
**Proof:** [Benchmark/Analyst/Customer proof]
**Notes:** Requirements/limits (pricing tier, integrations)
**Schema:** Article + FAQ. Author + last updated.
```

---

### 模板 3：对比／替代方案页面

**目标：** 通过明确的标准帮助读者做出决策，并获得公正的引用。

```markdown
# [Product] vs. [Alternative] — Which fits [Use case]?

## Comparison Table

| Criterion | [Product] | [Alt A] | [Alt B] | Source |
|-----------|-----------|---------|---------|--------|
| [Feature/Limit] | [value] | [value] | [value] | [link] |
| [Requirement] | [value] | [value] | [value] | [link] |
| [Best for] | [value] | [value] | [value] | [link] |

*Source-back all claims in the table or footnotes.*

## Fit Statements

1. **[Product]** suits [Team/Use case] when [Condition].
2. **[Alt A]** fits [Team/Use case] when [Condition].
3. **[Alt B]** works for [Team/Use case] when [Condition].

---
**Links:** [Category Explainer] | [Feature pages]
**CTA:** [Try / Demo / Talk to Sales]
**Schema:** Article. Author + last updated.
```

---

### 模板 4：用例 / 行业页面

**目标：** 在读者熟悉的情境中，将产品与成果联系起来。

```markdown
# [Industry/Use Case] — [Outcome KPI]

**Teams reduce [Metric] by [Y%] in [Timeframe].**

## Mini Case Study
[Company/Role] used [Product/Feature] to [Action], resulting in
[Metric improvement] within [Timeframe].

## How It Works

### [Feature 1]
[Feature → How → Outcome paragraph]

Triples:
1. [Subject] [verb] [object].
2. [Subject] [verb] [object].

### [Feature 2]
[Feature → How → Outcome paragraph]

Triples:
1. [Subject] [verb] [object].
2. [Subject] [verb] [object].

## Who Uses This
**Roles:** [Role 1], [Role 2], [Role 3]
**Workflows:** [Workflow 1], [Workflow 2]
**Integrations:** [Integration 1], [Integration 2]

---
**Links:** [Product/Feature pages] | [Supporting blog]
**CTA:** [Industry template / Demo variant]
**Schema:** Article. Author + last updated.
```

---

### 模板 5：配套博客文章

**目标：** 增加信息增量并支持你的内容集群。

```markdown
# [Topic] — [Specific promise]

## Opening (~60-80 words)
[State the problem. Align terminology with Category Explainer. Preview outcome.]

## [Section 1 Heading] (~120 words max)
[Feature → How → Outcome]

Triples:
1. [Subject] [verb] [object].
2. [Subject] [verb] [object].

**Internal link:** [Related page]
**External citation:** [Credible source]

## [Section 2 Heading] (~120 words max)
[Feature → How → Outcome]

Triples:
1. [Subject] [verb] [object].
2. [Subject] [verb] [object].

**Internal link:** [Related page]
**External citation:** [Credible source]

## Key Takeaway
[1-2 lines summarizing the main point]

**CTA:** [Single primary action]

---
**Schema:** Article. Author + last updated.
```

---

## 全站信任信号

### 每个页面的必备项

| 元素 | 实现方式 |
|---------|----------------|
| **Schema 标记** | Article + FAQ（如果存在 FAQ） |
| **作者署名** | 姓名、简介、资历、照片 |
| **最后更新日期** | 可见、机器可读 |
| **内部链接** | 每页 3-5 个（上游/下游） |
| **外部引用** | 每个章节 1-2 个可信来源 |
| **单一 CTA** | 演示、模板或注册（在接近末尾处重复一次） |

### Schema 实现

```html
<!-- Article Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Page Title]",
  "author": {
    "@type": "Person",
    "name": "[Author Name]",
    "url": "[Author Bio URL]"
  },
  "datePublished": "[ISO Date]",
  "dateModified": "[ISO Date]",
  "publisher": {
    "@type": "Organization",
    "name": "[Company]",
    "logo": "[Logo URL]"
  }
}
</script>

<!-- FAQ Schema (if FAQ section exists) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question 1]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer 1]"
      }
    },
    {
      "@type": "Question",
      "name": "[Question 2]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer 2]"
      }
    }
  ]
}
</script>
```

---

## 内容集群架构

```
                    ┌─────────────────────┐
                    │  Category Explainer │
                    │   "What is AEO?"    │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Product Page  │    │ Product Page  │    │ Product Page  │
│  "Feature A"  │    │  "Feature B"  │    │  "Feature C"  │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Blog Post    │    │  Use Case     │    │  Comparison   │
│  (supports)   │    │  (industry)   │    │  (vs. alt)    │
└───────────────┘    └───────────────┘    └───────────────┘
```

**链接规则：**
- 类别说明页向下链接到所有产品页面
- 产品页面向上链接到类别说明页
- 产品页面横向链接到相关功能
- 博客文章向上链接到产品页面
- 对比页面链接到类别说明页和相关产品页面

---

## AEO 写作检查清单

### 段落检查清单

- [ ] 遵循功能 → 工作原理 → 结果模式
- [ ] 包含 2-4 个句子（便于浏览）
- [ ] 包含 1-2 个语义三元组
- [ ] 指明具体实体（不使用含糊的“它”或“这”）
- [ ] 使用主动语态动词

### 章节检查清单

- [ ] 包含 1 个内部链接（上游或下游）
- [ ] 包含 1 个外部引用（可信来源）
- [ ] 章节标题指明一个实体
- [ ] 最多约 120 个单词

### 页面检查清单

- [ ] H1 包含主要实体和价值承诺
- [ ] 开篇主张是一个语义三元组
- [ ] 总共包含 3-5 个内部链接
- [ ] 总共包含 1-2 个外部引用
- [ ] 包含有 3 个问题的迷你常见问题解答（如适用）
- [ ] 仅设置一个主要 CTA
- [ ] Schema 标记（Article + FAQ）
- [ ] 作者姓名和个人简介链接
- [ ] 清晰显示最后更新日期

### 全站检查清单

- [ ] 每个关键类别都有对应的类别说明页
- [ ] 产品页面链接回类别说明页
- [ ] 已记录内容集群架构
- [ ] 已创建包含资历信息的作者简介页面
- [ ] 所有页面使用一致的术语

---

## 衡量 AEO 成效

### 关键指标

| 指标 | 跟踪方式 |
|--------|--------------|
| **AI 引用** | 在 ChatGPT、Claude、Perplexity 中手动检查 |
| **AI 中的品牌提及** | 在 AI 引擎中搜索“[品牌] + [类别]” |
| **答案份额** | 你相较于竞争对手被引用的频率 |
| **LLM 流量** | GA4 中来自 chatgpt.com、claude.ai、perplexity.ai 的引荐流量 |
| **展示次数与点击次数之间的差距** | GSC 展示次数与实际点击次数的对比 |

### 工具

- **HubSpot AEO Grader** - 评估你的品牌在 AI 中的可见度
- **Google Analytics 4** - 跟踪 LLM 引荐流量
- **Google Search Console** - 监控展示次数与点击次数之间的差距
- **手动 AI 查询** - 定期在 AI 引擎中测试你的品牌

---

## 常见的 AEO 错误

| 错误 | 修正方法 |
|---------|-----|
| 表述模糊（“它能帮助处理一些事情”） | 使用具体的实体和三元组 |
| 缺乏清晰的结构 | 使用“功能 → 方式 → 结果” |
| 缺少 schema | 添加 Article + FAQ schema |
| 没有作者署名 | 添加作者姓名、简介和资历 |
| 内容泛泛而谈 | 添加原创数据、示例和观点 |
| 孤立页面 | 将其链接至内容集群 |
| 态度模棱两可（“视情况而定”） | 明确表达立场 |
| 没有外部引用 | 每个章节添加 1-2 个可信来源 |

---

## AEO 与传统 SEO 的对比

| 方面 | 传统 SEO | AEO |
|--------|-----------------|-----|
| **目标** | 排在搜索结果第 1 页 | 在 AI 答案中被引用 |
| **成功指标** | 点击率 | 答案占有率 |
| **内容重点** | 关键词 | 实体 + 事实 |
| **结构** | 使用标题便于浏览 | 使用三元组便于提取 |
| **链接** | 通过反向链接建立权威性 | 通过引用形成共识 |
| **更新** | 定期刷新 | 持续确保准确性 |

---

## 快速参考

### 语义三元组模式
```
[Entity/Product] [active verb] [concrete object/result].
```

### 段落模式
```
[Feature] helps [User] with [Job].
It [mechanism] to [process].
Teams see [result] in [timeframe].
```

### 页面最低要求
- 3-5 个内部链接
- 每个章节 1-2 个外部引用
- 3 个带 schema 的 FAQ 问题
- 作者 + 最后更新时间
- 单一 CTA

### 内容层级
1. 类别说明页（顶部）
2. 产品/功能页面（中部）
3. 用例 / 对比 / 博客（支持内容）