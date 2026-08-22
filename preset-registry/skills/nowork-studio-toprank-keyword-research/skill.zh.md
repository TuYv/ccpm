---
name: keyword-research
argument-hint: "<topic, niche, or seed keyword>"
description: >
  Discover, analyze, and prioritize keywords for SEO and GEO content strategies
  from a seed keyword or niche. Identifies high-value opportunities based on
  search volume, competition, intent, and business relevance. Generates topic
  clusters. For building a dated editorial calendar from your own Search
  Console data, use `content-planner` instead — this skill is seed-driven
  keyword discovery, not calendar scheduling. Use when asked to "find
  keywords", "keyword research", "keyword analysis", "search volume", "keyword
  difficulty", "content ideas from a seed", or any keyword discovery task.
---
# 关键词研究



为 SEO 和 GEO 内容策略发现、分析并确定关键词的优先级。根据搜索量、竞争程度、意图和业务相关性识别高价值机会。

## 必须触发此技能的情况

当对话涉及以下任一情况时，请使用此技能——即使用户没有使用 SEO 术语：

当任务需要可复用、能够影响策略的市场情报，而不仅仅是临时性回答时，请使用此技能。

- 启动新的内容策略或营销活动
- 拓展到新的主题或市场
- 为特定产品或服务寻找关键词
- 识别长尾关键词机会
- 了解所在行业的搜索意图
- 规划内容日历
- 研究用于 GEO 优化的关键词

## 此技能的作用

1. **关键词发现**：根据种子词生成全面的关键词列表
2. **意图分类**：根据用户意图对关键词进行分类（信息型、导航型、商业型、交易型）
3. **难度评估**：评估竞争水平和排名难度
4. **机会评分**：根据潜在投资回报率确定关键词的优先级
5. **聚类**：将相关关键词分组为主题集群
6. **GEO 相关性**：识别可能触发 AI 回答的关键词

## 快速开始

从以下任一提示词开始。

### 基础关键词研究

```
Research keywords for [topic/product/service]
```

```
Find keyword opportunities for a [industry] business targeting [audience]
```

### 指定具体目标

```
Find low-competition keywords for [topic] with commercial intent
```

```
Identify question-based keywords for [topic] that AI systems might answer
```

### 竞争研究

```
What keywords is [competitor URL] ranking for that I should target?
```

## 数据来源

> **注意：**所有集成都不是必需的。此技能无需任何 API 密钥即可工作——未连接任何工具时，由用户手动提供数据。

**连接了 ~~SEO 工具 + ~~搜索控制台时：**
自动获取历史搜索量数据、关键词难度评分、SERP 分析、来自 ~~搜索控制台的当前排名，以及与竞争对手关键词的重叠情况。此技能将获取种子关键词指标、相关关键词建议和搜索趋势数据。

**仅使用手动数据时：**
要求用户提供：
1. 种子关键词或主题描述
2. 目标受众和地理位置
3. 业务目标（流量、潜在客户、销售）
4. 当前域名权威度（如已知）或网站年限
5. 任何已知的关键词表现数据或搜索量估算

使用所提供的数据进行完整分析。在输出中注明哪些指标来自自动收集，哪些来自用户提供的数据。

## 说明

当用户请求关键词研究时：

1. **了解背景**

   如果未提供以下信息，请提出澄清问题：
   - 你的产品、服务或主题是什么？
   - 你的目标受众是谁？
   - 你的业务目标是什么？（流量、潜在客户、销售）
   - 你当前的域名权威度如何？（新网站、成熟网站等）
   - 是否有特定的地理位置定位要求？
   - 首选语言是什么？

2. **生成种子关键词**

   从以下内容开始：
   - 核心产品/服务术语
   - 以问题为导向的关键词（你解决哪些问题？）
   - 以解决方案为导向的关键词（你如何提供帮助？）
   - 针对特定受众的术语
   - 行业术语

3. **扩展关键词列表**

   为每个种子关键词生成变体：
   
   ```markdown
   ## Keyword Expansion Patterns
   
   ### Modifiers
   - Best [keyword]
   - Top [keyword]
   - [keyword] for [audience]
   - [keyword] near me
   - [keyword] [year]
   - How to [keyword]
   - What is [keyword]
   - [keyword] vs [alternative]
   - [keyword] examples
   - [keyword] tools
   
   ### Long-tail Variations
   - [keyword] for beginners
   - [keyword] for small business
   - Free [keyword]
   - [keyword] software/tool/service
   - [keyword] template
   - [keyword] checklist
   - [keyword] guide
   ```

4. **对搜索意图进行分类**

   对每个关键词进行分类：

   | 意图 | 信号 | 示例 | 内容类型 |
   |--------|---------|---------|--------------|
   | 信息型 | what、how、why、guide、learn | "what is SEO" | 博客文章、指南 |
   | 导航型 | 品牌名称、特定网站 | "google analytics login" | 主页、产品页面 |
   | 商业型 | best、review、vs、compare | "best SEO tools [current year]" | 对比文章、评测 |
   | 交易型 | buy、price、discount、order | "buy SEO software" | 产品页面、定价页面 |

5. **评估关键词难度**

   为每个关键词评分（1-100 分）：

   ```markdown
   ### Difficulty Factors
   
   **High Difficulty (70-100)**
   - Major brands ranking
   - High domain authority competitors
   - Established content (1000+ backlinks)
   - Paid ads dominating SERP
   
   **Medium Difficulty (40-69)**
   - Mix of authority and niche sites
   - Some opportunities for quality content
   - Moderate backlink requirements
   
   **Low Difficulty (1-39)**
   - Few authoritative competitors
   - Thin or outdated content ranking
   - Long-tail variations
   - New or emerging topics
   ```

6. **计算机会分数**

   公式：`Opportunity = (Volume × Intent Value) / Difficulty`

   **意图价值**根据搜索意图分配数值权重：
   - 信息型 = 1
   - 导航型 = 1
   - 商业型 = 2
   - 交易型 = 3

   ```markdown
   ### Opportunity Matrix
   
   | Scenario | Volume | Difficulty | Intent | Priority |
   |----------|--------|------------|--------|----------|
   | Quick Win | Low-Med | Low | High | ⭐⭐⭐⭐⭐ |
   | Growth | High | Medium | High | ⭐⭐⭐⭐ |
   | Long-term | High | High | High | ⭐⭐⭐ |
   | Research | Low | Low | Low | ⭐⭐ |
   ```

7. **识别 GEO 机会**

   可能触发 AI 回答的关键词：
   
   ```markdown
   ### GEO-Relevant Keywords
   
   **High GEO Potential**
   - Question formats: "What is...", "How does...", "Why is..."
   - Definition queries: "[term] meaning", "[term] definition"
   - Comparison queries: "[A] vs [B]", "difference between..."
   - List queries: "best [category]", "top [number] [items]"
   - How-to queries: "how to [action]", "steps to [goal]"
   
   **AI Answer Indicators**
   - Query is factual/definitional
   - Answer can be summarized concisely
   - Topic is well-documented online
   - Low commercial intent
   ```

8. **创建主题集群**

   将关键词分组为内容集群：

   ```markdown
   ## Topic Cluster: [Main Topic]
   
   **Pillar Content**: [Primary keyword]
   - Search volume: [X]
   - Difficulty: [X]
   - Content type: Comprehensive guide
   
   **Cluster Content**:
   
   ### Sub-topic 1: [Secondary keyword]
   - Volume: [X]
   - Difficulty: [X]
   - Links to: Pillar
   - Content type: [Blog post/Tutorial/etc.]
   
   ### Sub-topic 2: [Secondary keyword]
   - Volume: [X]
   - Difficulty: [X]
   - Links to: Pillar + Sub-topic 1
   - Content type: [Blog post/Tutorial/etc.]
   
   [Continue for all cluster keywords...]
   ```

9. **生成输出报告**

   生成一份包含以下内容的报告：执行摘要、重点关键词机会（快速见效、增长、GEO）、主题集群、内容日历和后续步骤。

   > **参考**：完整的报告模板和示例请参阅 [references/example-report.md](references/example-report.md)。

## 验证检查点

### 输入验证
- [ ] 已明确提供种子关键词或主题描述
- [ ] 已指定目标受众和业务目标
- [ ] 已确认地理位置和语言定位
- [ ] 已确定域名权威度或网站成熟度水平

### 输出验证
- [ ] 每项建议均引用具体数据点（而非泛泛而谈的建议）
- [ ] 每个关键词均包含搜索量和难度评分
- [ ] 关键词按意图分组并映射到内容类型
- [ ] 主题集群清晰展示支柱内容与集群内容之间的关系
- [ ] 明确说明每个数据点的来源（~~SEO 工具数据、用户提供或估算）

## 示例

> **参考**：有关“面向小型企业的项目管理软件”的完整示例报告，请参阅 [references/example-report.md](references/example-report.md)。

### 高级用法

- **意图映射**：`Map all keywords for [topic] by search intent and funnel stage`
- **季节性分析**：`Identify seasonal keyword trends for [industry]`
- **竞争对手差距**：`What keywords do [competitor 1], [competitor 2] rank for that I'm missing?`
- **本地关键词**：`Research local keywords for [business type] in [city/region]`

## 成功技巧

1. **从种子关键词开始**，这些关键词应描述你的核心产品或服务
2. **不要忽视长尾关键词**——它们通常具有最高的转化率
3. **使内容与意图相匹配**——信息型查询需要指南，而非销售页面
4. **将内容组织为集群**，以建立主题权威性
5. **优先处理可快速见效的机会**，以积累势头和可信度
6. **在策略中纳入 GEO 关键词**，以提高在 AI 中的可见性
7. **每季度审查一次**——关键词动态会随时间变化



## 参考资料

- [关键词意图分类体系](references/keyword-intent-taxonomy.md) — 包含信号词和内容策略的完整意图分类
- [主题集群模板](references/topic-cluster-templates.md) — 用于支柱内容和集群内容的中心辐射式架构模板
- [关键词优先级框架](references/keyword-prioritization-framework.md) — 优先级评分矩阵、类别和季节性关键词模式
- [示例报告](references/example-report.md) — 面向项目管理软件的完整关键词研究示例报告

## 下一个最佳技能

- **首选**：[content-writer](../content-writer/SKILL.md) — 将关键词机会转化为优化后的内容。