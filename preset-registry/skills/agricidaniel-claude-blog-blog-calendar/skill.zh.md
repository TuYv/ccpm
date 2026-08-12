---
name: blog-calendar
description: >
  Generate editorial calendars for blogs with topic clusters, publishing
  schedules, material-change reviews, update plans, seasonal
  opportunities, content mix formula, template integration, and distribution
  scheduling. Plans monthly or quarterly calendars around reader needs,
  evidence changes, and sustainable publishing capacity.
  Use when user says "editorial calendar", "content calendar", "blog calendar",
  "publishing schedule", "blog plan", "content plan", "what should I write".
user-invokable: true
argument-hint: "[<niche>]"
license: MIT
---
# 博客日历：编辑规划

生成编辑日历，其中包括主题集群、发布节奏、实质性变更审查、内容衰退调查、模板建议、分发规划和季节性切入点。它不会将发布或更新频率视为排名或引用信号。

## 交叉引用

此技能适用于 FLOW Find 阶段。在选择主题之前，请运行
`/blog flow find`，以进行关键词发现、内容优先级排序并获取受众画像提示，这些结果应为集群选择和主题排序提供依据。

## 工作流

### 第 1 步：了解博客

收集背景信息：
1. **细分领域/行业**：博客的主题是什么？
2. **现有内容**：扫描已有的博客文章（使用 Glob 查找 *.md、*.mdx、*.html）
3. **发布节奏**：他们能以多高的频率发布？（默认：每周 2 次）
4. **时间范围**：按月还是按季度制定日历？
5. **业务目标**：博客应推动什么？（流量、潜在客户、权威性）

### 第 2 步：主题集群设计

设计 3-5 个主题集群（支柱内容 + 支持内容）：

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
- 针对一个主要关键词主题
- 全面覆盖该主题，以建立主题权威性
- 包含多样化的内容类型（指南、对比、操作教程、列表文章）
- 支持集群页面之间的内部链接

### 第 2.5 步：内容衰退检测

扫描现有文章，查找实质性变更信号。日期属于内容清单元数据，
不能证明内容已经过时或仍然新鲜。

| 信号 | 审查问题 | 对优先级的影响 |
|--------|-----------------|-----------------|
| 查询或事实的易变性 | 价格、法律、产品、事件或指南是否发生了变化？ | 当变化的事实具有实质性影响时，提高优先级 |
| 表现趋势 | 在排除季节性因素和搜索界面因素后，是否出现持续下降？ | 重写之前先进行调查 |
| 来源可用性 | 重要来源是否已过时、存在矛盾或无法访问？ | 当声明失去支持时，提高优先级 |
| 读者意图 | 页面是否仍能解决当前任务？ | 当意图发生实质性变化时，提高优先级 |

不要仅仅因为 frontmatter 日期较早，或供应商示例中近期更新了引用，
就优先安排更新。

输出衰退报告：

```
## Content Decay Report
| Post | Material Change Evidence | Performance Context | Priority | Action |
|------|--------------------------|---------------------|----------|--------|
| [slug] | [changed fact/source/intent] | [surface and comparison] | Critical | Correct material error |
| [slug] | [documented change] | [sustained trend] | High | Schedule substantive review |
| [slug] | [no confirmed change] | [stable/unclear] | Low | Monitor |
```

优先级：
- **严重**：存在实质性错误或有害信息，需要纠正
- **高**：已确认的事实、来源、产品或意图变化影响了内容的实用性
- **中**：持续的表现变化需要进行调查
- **低**：没有实质性变化；仅进行监控，不编辑日期

### 第 3 步：内容时效性更新计划

围绕主题规划审核触发条件：
- **快速变化的主题**：当决定性事实或官方来源发生变化时审核
- **季节性主题**：在相关季节到来前，使用最新证据进行审核
- **产品或定价内容**：在有据可查的产品变更后审核
- **常青主题**：当证据、意图或表现表明有需要时审核

仅在内容发生实质性变更后修改 `lastUpdated`。

### 第 4 步：季节性与趋势热点

研究季节性机会：
1. **行业活动**：会议、产品发布、算法更新
2. **季节性趋势**：在可用时使用 Google Trends 界面、API 或导出的数据；如果仅依赖 WebSearch，请将趋势时间标记为未经验证
3. **年度报告**：重要研究何时发布新数据？
4. **算法更新**：在安排更新内容之前，对照 Google Search Status Dashboard 验证当前的 Google 更新时间线。不要依赖静态列表。

#### 季节性趋势整合

- 将季节性高峰映射到内容制作计划
- 在季节性高峰前 4-6 周规划内容，为索引预留提前量
- 创建“带有季节性热点的常青”内容（例如每年更新的“X 指南 [Year]”）
- 跟踪行业报告的发布周期：
  - Ahrefs 年度 SEO 现状报告（通常在第一季度）
  - Google 年度搜索（12 月）
  - HubSpot 营销现状报告（第一季度）
  - Gartner 技术成熟度曲线（8 月）
  - 细分领域内的重要会议日期
- 在安排计划前，使用 WebSearch 验证趋势时间

### 第 5 步：生成日历

#### 内容组合公式

以此规划启发式方法为起点，然后根据衰减风险、权威性缺口、
团队能力和可用来源材料进行调整：
**60% 新内容 / 30% 时效性更新 / 10% 内容再利用**

| 发布频率 | 每月文章数 | 新内容 | 更新 | 再利用 |
|---------|-------------|-----|-----------|------------|
| 每周 2 篇 | 8 | 5 | 2 | 1 |
| 每周 3 篇 | 12 | 7 | 4 | 1 |
| 每周 4 篇 | 16 | 10 | 5 | 1 |
| 每周 1 篇 | 4 | 2-3 | 1 | 0-1 |

在新文章中，力求内容类型多样化：
- **指南/操作方法**：占新内容的 30-40%
- **对比/替代方案**：15-20%
- **清单文章/汇总**：15-20%
- **案例研究/数据研究**：10-15%
- **思想领导力/新闻分析**：10-15%

#### 模板集成

对于每个新文章条目，从以下 12 个可用模板中推荐一个内容模板：
`how-to-guide`、`listicle`、`case-study`、`comparison`、`pillar-page`、
`product-review`、`thought-leadership`、`roundup`、`tutorial`、
`news-analysis`、`data-research`、`faq-knowledge`

完整模板详情请参阅：`skills/blog/references/content-templates.md`。

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

跟踪每个主题集群的建设状态。优先完成部分建成的集群，而不是启动新集群。

```
## Topic Cluster Progress
| Cluster | Pillar | Spokes Published | Spokes Planned | Coverage |
|---------|--------|-----------------|----------------|----------|
| [Topic] | Published | 5/10 | 5 this quarter | 50% |
| [Topic] | Draft | 2/8 | 3 this quarter | 25% |
| [Topic] | Not started | 0/6 | 1 this quarter | 0% |
```

集群优先级规则：
- 覆盖率达到 50% 及以上的集群：以完成建设为最高优先级
- 已发布支柱页面但辐射页面较少的集群：第二优先级
- 新集群：仅当现有集群覆盖率达到 75% 及以上时才启动
- 同时处于活跃建设状态的集群不得超过 3 个

### 步骤 5.6：分发排期

为每篇新文章规划跨渠道分发。在日历输出中包含分发时间安排。

```
## Distribution Schedule
| Post | Publish Date | LinkedIn | Reddit | Email | YouTube |
|------|-------------|----------|--------|-------|---------|
| [Title] | [Date] | Same day | +2-3 days | Next batch | If pillar |
```

渠道发布时间规则：
- **LinkedIn**：与发布同日（分享关键洞见和链接）
- **Reddit**：发布后 2 至 3 天（分享真正有价值的洞见，而不是只丢一个链接）
- **电子邮件简报**：每周批量发送（每期简报包含 2 至 3 篇文章）
- **YouTube**：仅为支柱文章规划配套视频（资源投入较大）
- **Twitter/X**：与发布同日（以帖子串形式分享关键要点）

有关详细的渠道策略，请参阅：`skills/blog/references/distribution-playbook.md`。

### 步骤 5.7：内容新鲜度自动化

建立一个持续维护内容新鲜度的系统：

```
## Material-Change Review Queue
| Post | Review Trigger | Evidence | Priority | Owner |
|------|----------------|----------|----------|-------|
| [slug] | [official source/product/fact changed] | [link or observation] | High | [name] |
| [slug] | [sustained performance or intent shift] | [surface-specific comparison] | Medium | [name] |
```

自动化建议：
- 针对快速变化的主题，监控官方来源或产品变更
- 按重大变动风险和对读者的影响对队列进行排序
- 仅将流量作为背景信息，而非需要更新的证据
- 仅在内容发生实质性变更后更新 `lastUpdated`
- 跟踪具体变更，并分别比较相关的搜索呈现形式
- 仅当实质性审查发现确有工作需要处理时，才建议使用 `/blog rewrite`

### 第 6 步：保存与后续步骤

除非用户指定其他路径，否则保存到 `calendars/[yyyy-mm]-editorial-calendar.md`。如果 `calendars/` 不存在，则创建该目录。

建议的工作流程：
1. 当定位或内容支柱不明确时，运行 `/blog strategy`
2. 对于以主题集群为主的日历，运行 `/blog cluster plan <seed-keyword>`
3. 对第一个排期主题使用 `/blog brief <first-topic>` 或 `/blog outline <first-topic>`
4. 使用 `/blog write` 根据已批准的简报或大纲生成文章
5. 使用 `/blog rewrite` 更新现有内容以保持时效性
6. 在下个月/季度重新运行 `/blog calendar`，制定下一份计划
7. 每周审查内容衰退报告，并优先处理严重项目
8. 每月跟踪主题集群进度，确保集群构建完成