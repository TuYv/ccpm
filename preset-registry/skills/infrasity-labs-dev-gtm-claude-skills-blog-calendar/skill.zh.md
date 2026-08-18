---
name: blog-calendar
description: >
  Generate editorial calendars for blogs with topic clusters, publishing
  schedules, content decay detection, freshness update plans, seasonal
  opportunities, content mix formula, template integration, and distribution
  scheduling. Plans monthly or quarterly calendars optimized for SEO topic
  authority and AI citation freshness requirements (30-day update cycles).
  Use when user says "editorial calendar", "content calendar", "blog calendar",
  "publishing schedule", "blog plan", "content plan", "what should I write".
user-invokable: true
argument-hint: "[<niche>]"
---
# 博客日历：编辑规划

生成编辑日历，包括主题集群、发布频率、内容新鲜度更新计划、内容衰减检测、模板建议、分发规划和季节性切入点。针对建立主题权威性（Google）和保持引用新鲜度（AI 平台）进行了优化。

## 交叉参考

此技能用于 FLOW 的 Find 阶段。在选择主题之前，运行
`/blog flow find` 以进行关键词发现、内容优先级排序和受众画像提示，这些信息应为集群选择和主题排序提供依据。

## 工作流程

### 步骤 1：了解博客

收集背景信息：
1. **细分领域/行业**：博客的主题是什么？
2. **现有内容**：扫描现有博客文章（使用 Glob 查找 *.md、*.mdx、*.html）
3. **发布频率**：他们能够多久发布一次？（默认：每周 2 次）
4. **时间范围**：按月还是按季度制定日历？
5. **业务目标**：博客应该推动什么目标？（流量、潜在客户、权威性）

### 步骤 2：主题集群设计

设计 3–5 个主题集群（支柱内容 + 支持内容）：

```
Cluster: [Pillar Topic]
├── Pillar Page: [Comprehensive guide - 3,000+ words]
├── Supporting: [Subtopic 1 - 2,000 words]
├── Supporting: [Subtopic 2 - 2,000 words]
├── Supporting: [Subtopic 3 - 1,500 words]
├── Comparison: [X vs Y - 1,500 words]
└── FAQ: [Common questions - 1,500 words]
```

每个集群都应：
- 瞄准一个主要关键词主题
- 全面覆盖该主题，以建立主题权威性
- 包含多样化的内容类型（指南、对比、操作教程、列表文章）
- 支持集群页面之间的内部链接

### 步骤 2.5：内容衰减检测

扫描现有博客文章 frontmatter 中的 `lastUpdated` 或 `date` 字段。
使用以下阈值，根据陈旧程度对每篇文章进行分类：

| 流量级别 | 陈旧阈值 | 风险阈值 |
|---------------|----------------|-------------------|
| 高流量文章 | 更新后超过 30 天 | 超过 90 天 |
| 中等流量文章 | 更新后超过 90 天 | 超过 180 天 |
| 低流量文章 | 更新后超过 180 天 | 超过 365 天 |

参考：排名靠前的 AI 引用中，76% 来自 30 天内更新过的内容。

输出衰减报告：

```
## Content Decay Report
| Post | Last Updated | Days Stale | Priority | Action |
|------|-------------|-----------|----------|--------|
| [slug] | [date] | [N] | Critical | Refresh immediately |
| [slug] | [date] | [N] | High | Schedule this month |
| [slug] | [date] | [N] | Medium | Schedule this quarter |
```

优先级：
- **紧急**：高流量文章陈旧超过 30 天：立即更新
- **高**：任何超过其陈旧阈值的文章：安排在本月更新
- **中**：接近其陈旧阈值的文章：安排在本季度更新
- **低**：仍在阈值范围内的文章：无需采取行动

### 步骤 3：内容新鲜度更新计划

AI 平台非常偏爱新鲜内容（排名靠前的引用中，76% 在 30 天内更新过）。

规划更新周期：
- **高优先级文章**（流量驱动内容）：每 30 天更新一次
- **中优先级文章**：每 90 天更新一次
- **低优先级文章**：每年更新一次
- **常青文章**：数据发生变化时更新

### 第 4 步：季节性与趋势热点

研究季节性机会：
1. **行业事件**：会议、产品发布、算法更新
2. **季节性趋势**：使用 WebSearch 查看该细分领域的 Google Trends
3. **年度报告**：重要研究会在何时发布新数据？
4. **算法更新**：Google 核心更新（通常每年 3-4 次）

#### 季节性趋势整合

- 将季节性高峰映射到内容生产计划
- 在季节性高峰前 4-6 周规划内容，为索引预留时间
- 创建“常青内容与季节性热点结合”的内容（例如，每年更新的“X 指南 [Year]”）
- 跟踪行业报告的发布周期：
  - Ahrefs 年度 SEO 现状报告（通常在第一季度）
  - Google 年度搜索热榜（12 月）
  - HubSpot 营销现状报告（第一季度）
  - Gartner 技术成熟度曲线（8 月）
  - 该细分领域的重要会议日期
- 在安排计划之前，使用 WebSearch 验证趋势出现的时间

### 第 5 步：生成日历

#### 内容组合公式

应用建议的内容组合比例：
**60% 新内容 / 30% 时效性更新 / 10% 内容再利用**

| 发布频率 | 每月文章数 | 新内容 | 更新 | 再利用 |
|---------|-------------|-----|-----------|------------|
| 每周 2 篇 | 8 | 5 | 2 | 1 |
| 每周 3 篇 | 12 | 7 | 4 | 1 |
| 每周 4 篇 | 16 | 10 | 5 | 1 |
| 每周 1 篇 | 4 | 2-3 | 1 | 0-1 |

在新文章中，应力求内容类型多样化：
- **指南/操作方法**：占新内容的 30-40%
- **对比/替代方案**：15-20%
- **列表文章/汇总文章**：15-20%
- **案例研究/数据研究**：10-15%
- **思想领导力/新闻分析**：10-15%

#### 模板整合

对于每个新文章条目，从以下 12 个可用模板中推荐一个内容模板：
`how-to-guide`、`listicle`、`case-study`、`comparison`、`pillar-page`、
`product-review`、`thought-leadership`、`roundup`、`tutorial`、
`news-analysis`、`data-research`、`faq-knowledge`

完整模板详情请参阅：`references/content-templates.md`。

#### 月度日历格式

```
# Editorial Calendar: [Month Year]

## Publishing Cadence: [N] posts/week
## Content Mix: [N] new / [N] refreshes / [N] repurposed

### Week 1: [Date Range]
| Day | Type | Title | Template | Cluster | Target Keyword | Status |
|-----|------|-------|----------|---------|---------------|--------|
| Mon | New | [Title] | how-to-guide | [Cluster] | [keyword] | Draft |
| Thu | Update | [Existing post] | - | [Cluster] | [keyword] | Refresh |

### Week 2: [Date Range]
| Day | Type | Title | Template | Cluster | Target Keyword | Status |
|-----|------|-------|----------|---------|---------------|--------|
| Mon | New | [Title] | comparison | [Cluster] | [keyword] | Brief |
| Thu | New | [Title] | listicle | [Cluster] | [keyword] | Brief |

### Week 3: [Date Range]
[...]

### Week 4: [Date Range]
[...]

## Content Mix This Month
- New posts: [N]
- Freshness updates: [N]
- Repurposed content: [N]
- Content types: [guides, comparisons, how-tos, listicles, ...]

## Freshness Update Queue
| Post | Last Updated | Priority | Scheduled |
|------|-------------|----------|-----------|
| [slug] | [date] | High | Week 2 |
| [slug] | [date] | Medium | Week 4 |

## Seasonal Hooks
- [Event/trend and how to leverage it]
```

#### 季度日历格式

```
# Quarterly Editorial Plan: Q[N] [Year]

## Content Strategy
- Topic clusters: [N] active
- New posts planned: [N]
- Freshness updates planned: [N]
- Repurposed content: [N]
- Total content actions: [N]

## Month 1: [Month]
### Focus: [Primary cluster or theme]
| Week | Type | Title | Template | Cluster | Keyword |
|------|------|-------|----------|---------|---------|
| W1 | New | ... | how-to-guide | ... | ... |
| W1 | Update | ... | - | ... | ... |
| W2 | New | ... | comparison | ... | ... |
[...]

## Month 2: [Month]
### Focus: [Primary cluster or theme]
[...]

## Month 3: [Month]
### Focus: [Primary cluster or theme]
[...]

## Quarterly Goals
- [ ] Publish [N] new posts
- [ ] Update [N] existing posts for freshness
- [ ] Complete [Cluster] pillar + [N] supporting pages
- [ ] Achieve [metric target]
```

### 步骤 5.5：主题集群进度跟踪

跟踪每个主题集群的建设状态。优先完成部分建成的集群，而不是启动新的集群。

```
## Topic Cluster Progress
| Cluster | Pillar | Spokes Published | Spokes Planned | Coverage |
|---------|--------|-----------------|----------------|----------|
| [Topic] | Published | 5/10 | 5 this quarter | 50% |
| [Topic] | Draft | 2/8 | 3 this quarter | 25% |
| [Topic] | Not started | 0/6 | 1 this quarter | 0% |
```

集群优先级规则：
- 覆盖率达到 50% 及以上的集群：完成优先级最高
- 已发布支柱页面但辐射页面较少的集群：优先级第二
- 新集群：仅当现有集群的覆盖率达到 75% 及以上时才启动
- 同时处于活跃建设状态的集群不得超过 3 个

### 步骤 5.6：分发排期

为每篇新文章规划跨渠道分发。在日历输出中包含分发时间。

```
## Distribution Schedule
| Post | Publish Date | LinkedIn | Reddit | Email | YouTube |
|------|-------------|----------|--------|-------|---------|
| [Title] | [Date] | Same day | +2-3 days | Next batch | If pillar |
```

渠道时间安排规则：
- **LinkedIn**：与发布同日（分享关键见解和链接）
- **Reddit**：发布后 2-3 天（分享真实见解，而不是只丢一个链接）
- **电子邮件简报**：每周批量发送（每期简报包含 2-3 篇文章）
- **YouTube**：仅为支柱文章规划配套视频（资源密集型）
- **Twitter/X**：与发布同日（以帖子串形式分享关键要点）

有关详细的渠道策略，请参阅：`references/distribution-playbook.md`。

### 步骤 5.7：内容新鲜度自动化

建立持续维护内容新鲜度的系统：

```
## Freshness Schedule: Next 30 Days
| Post | Last Updated | Next Refresh Date | Priority | Owner |
|------|-------------|-------------------|----------|-------|
| [slug] | [date] | [date + 30] | High | [name] |
| [slug] | [date] | [date + 90] | Medium | [name] |
```

自动化建议：
- 为高流量文章设置每 30 天更新一次的日历提醒
- 按“下次更新日期”升序列出文章（最紧急的排在最前）
- 根据流量/重要性确定更新顺序的优先级
- 每次更新后，更新 frontmatter 中的 `lastUpdated` 字段
- 跟踪更新历史，以衡量内容新鲜度对排名/引用的影响
- 建议为每次计划更新运行 `/blog rewrite`

### 步骤 6：保存与后续步骤

保存内容日历并建议：
1. 从 `/blog brief <first-topic>` 开始，创建第一份内容简报
2. 使用 `/blog write` 根据简报生成文章
3. 使用 `/blog rewrite` 对现有内容进行时效性更新
4. 下个月/季度重新运行 `/blog calendar`，制定下一阶段计划
5. 每周查看内容衰退报告，并优先处理严重项目
6. 每月跟踪主题集群进度，确保集群构建完成

### 步骤 7：Notion MCP（可选）

将内容日历发送到聊天后，尝试运行 `notion-query-data-sources`。如果它返回结果，则表示 Notion 已连接——执行以下推送操作。如果失败或不可用，则跳过并附加提醒。

**如果 Notion 已连接：**

编辑日历属于结构化数据（Title、Type、Template、Cluster、Keyword、Status、Publish Date、Author），非常适合使用 Notion 数据库。直接将其推送：

1. 调用 `notion-search`，在工作区中搜索现有的 Content Calendar 数据库
2. 如果找到：调用 `notion-create-pages`，将每个新文章/更新条目添加到现有数据库中——跳过已存在的条目（按 Title + Publish Date 匹配）
3. 如果未找到：调用 `notion-create-database`，使用以下属性初始化 Content Calendar 数据库：
   - Title (title)、Type (select: New / Refresh / Repurposed)、Template (select)、Cluster (select)、Keyword (rich text)、Status (select: Brief / Draft / Review / Published)、Publish Date (date)、Author (person)
   然后调用 `notion-create-pages`，使用内容日历中的所有条目填充该数据库
4. 调用 `notion-create-view`，添加一个按 Publish Date 分组的 Calendar 视图（以便团队直观查看日程安排）
5. 确认："✅ 编辑日历已推送到 Notion——已添加 [N] 个条目。Calendar 视图已创建。"

重新运行时（下个月/季度）：先调用 `notion-query-database-view` 获取现有条目，跳过重复项，仅添加新条目。

**如果未连接：**
> 💡 **Notion 未连接**——你的编辑日历仅输出到聊天中。连接 Notion MCP 连接器，即可自动将其推送到带有日历视图的 Notion 数据库，供整个团队跟踪。设置：[notion-mcp-server](https://github.com/makenotion/notion-mcp-server)