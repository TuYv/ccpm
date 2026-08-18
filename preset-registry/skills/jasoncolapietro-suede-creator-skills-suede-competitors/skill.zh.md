---
name: suede-competitors
description: "Suede-owned comparison-page discipline for honest alternative, versus, and competitor-comparison content that serves evaluators and search intent. Use when planning or writing a public page that positions products against named alternatives from verified evidence. NOT FOR: gathering the underlying competitor evidence (use suede-competitor-profiling), internal battle cards (use suede-sales-enablement), or scaled page generation (use suede-programmatic-seo)."
metadata:
  version: 2.0.1
---
# Suede 竞品与替代方案页面

使用这套 Suede 对比页面操作手册来满足竞争性搜索意图，同时确保每项产品声明都是最新、有来源且公平的。

## 初始评估

检查 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`，或旧版 `product-marketing-context.md`）是否存在；如果存在，请阅读它——你的价值主张、ICP、定价模式以及坦诚的弱点决定了哪些对比是有理有据的，而这些内容通常已经记录在其中。

然后处理下方“特定任务问题”中的信息收集清单；只询问上下文文件中尚未回答的问题。当前的竞品证据——定价、功能、评分——来自 `suede-competitor-profiling`，不要依赖记忆。

---

## 页面格式

### 格式 1：[Competitor] Alternative（单数）

**搜索意图**：用户正在积极寻找从某个特定竞品切换出去的方案

**URL 模式**：`/alternatives/[competitor]` 或 `/[competitor]-alternative`

**目标关键词**："[Competitor] alternative"、"alternative to [Competitor]"、"switch from [Competitor]"

**页面结构**：
1. 用户为何寻找替代方案（认可并回应他们的痛点）
2. 摘要：你作为替代方案的定位（快速定位）
3. 详细对比（功能、服务、定价）
4. 谁应该切换（以及谁不应该切换）
5. 迁移路径
6. 切换用户的社会证明
7. CTA

---

### 格式 2：[Competitor] Alternatives（复数）

**搜索意图**：用户正在研究各种选项，处于决策旅程的较早阶段

**URL 模式**：`/alternatives/[competitor]-alternatives`

**目标关键词**："[Competitor] alternatives"、"best [Competitor] alternatives"、"tools like [Competitor]"

**页面结构**：
1. 用户为何寻找替代方案（常见痛点）
2. 替代方案应关注什么（评估标准框架）
3. 替代方案列表（将你放在首位，但也要纳入真实可选方案）
4. 对比表（摘要）
5. 对每个替代方案进行详细拆解
6. 按使用场景给出推荐
7. CTA

**重要**：纳入 4-7 个真实的替代方案。真正提供帮助有助于建立信任，也能获得更好的排名。

**按阶段划分的 AI 答案预期**：这些页面可以在 AI 答案中获得*引用*，但 AI 是否会从中*推荐*你的品牌，还取决于站外共识（评论、论坛、分析师）。对于新兴品牌，自我排名的列表可能会让竞品获得曝光，而品牌本身只能得到引用。将其视为一个假设，并把当前的可见性证据和声明验证交给 `suede-seo-audit`。

---

### 格式 3：你 vs [Competitor]

**搜索意图**：用户正在直接比较你与某个特定竞品

**URL 模式**：`/vs/[competitor]` 或 `/compare/[you]-vs-[competitor]`

**目标关键词**："[You] vs [Competitor]"、"[Competitor] vs [You]"

**页面结构**：
1. TL;DR 摘要（用 2-3 句话概括关键差异）
2. 一览对比表
3. 按类别进行详细对比（功能、定价、支持、易用性、集成）
4. [You] 最适合哪些用户
5. [Competitor] 最适合哪些用户（保持诚实）
6. 客户怎么说（来自切换用户的推荐语）
7. 迁移支持
8. CTA

---

### 格式 4：[竞争对手 A] vs [竞争对手 B]

**搜索意图**：用户正在比较两个竞争对手（并非直接比较你）

**URL 模式**：`/compare/[competitor-a]-vs-[competitor-b]`

**页面结构**：
1. 两款产品概览
2. 按类别进行比较
3. 各自最适合哪些人
4. 第三个选项（介绍你自己）
5. 对三者进行比较的表格
6. CTA

**为什么有效**：获取竞争对手相关词的搜索流量，并将你定位为业内知识丰富的选项。

---

## 应拒绝的陈词滥调

一篇依靠惯性写成的比较页面，通常一开始就包含以下内容。每一项都会让评估者认定该页面是在做营销，而不是进行研究——应明确拒绝这些做法：

- **稻草人式竞争对手。** 将弱点描述成漫画式的 caricature（“笨重”“为 2015 年打造”），而不是具体、有来源、用户确实会遇到的限制。
- **“赢家”行。** 不要设置结论行、奖杯，也不要设置最终指向你的十分制评分。由读者做决定；页面负责提供证据。
- **虚假的平衡。** “他们适合企业，我们适合其他所有人”并没有让步。真正的让步应明确指出：对于你希望争取的某类读者，竞争对手在哪种情况下是更值得购买的选择。
- **每一行都偏向你的表格。** 如果比较维度是诚实选定的，部分行的结果就会对竞争对手有利。如果没有任何一行如此，说明这些维度是为了赢得比较而非提供信息而选的。

对于剩下的两个默认做法——使用 ✓/✗ 的功能表，以及没有真实阻力的迁移部分——请参考 [references/templates.md](references/templates.md) 中的具体前后对比：“Comparison Table Best Practices”和“Migration Section”。

---

## 必要部分

### TL;DR 摘要
每个页面都应以一段供快速浏览者阅读的摘要开头，用 2-3 句话说明关键差异。

### 段落式比较
不要止步于表格。针对每个维度撰写一段文字，解释差异以及这些差异分别在何时重要。

### 功能比较
针对每个类别：描述各自的处理方式，列出优势和局限，并给出最终建议。

### 定价比较
包括逐层级比较、各层级包含的内容、隐藏成本，以及针对示例团队规模的总成本计算。

### 适用对象
明确说明每个选项最理想的客户群体。诚实的建议能够建立信任。

每个页面至少要指出一个竞争对手确实胜出的维度，并说明读者不应因此切换——与其他声明一样，提供来源、URL 和核查日期。不要使用模棱两可的表述（“一些团队更喜欢……”），而要做出让步：明确指出具体读者，以及具体原因。没有此类维度的页面尚未完成；这意味着比较范围是为了确保答案而设定的。

### 迁移部分
说明哪些内容可以迁移、哪些内容需要重新配置、提供哪些支持，以及已经完成切换的客户引述。

**详细模板**：请参阅 [references/templates.md](references/templates.md)

---

## 内容架构

### 集中的竞争对手数据
为每个竞争对手创建单一事实来源，其中包含：
- 定位和目标受众
- 定价（所有层级）
- 功能评级
- 优势和弱点
- 最适合 / 不理想的使用场景
- 常见投诉（来自评价）
- 迁移说明

**数据结构和示例**：请参阅 [references/content-architecture.md](references/content-architecture.md)

---

## 研究流程

### 深入的竞争对手研究

针对每个竞争对手，收集：

1. **产品研究**：注册、使用产品，并记录功能、UX 和局限性
2. **定价研究**：当前定价、包含的内容、隐藏费用
3. **评价挖掘**：从 G2、Capterra、TrustRadius 中整理常见的好评和投诉主题
4. **客户反馈**：与转投你们产品的客户（以及从你们产品转出的客户）交流
5. **内容研究**：研究其定位、对比页面和更新日志

### 持续更新

- **每季度**：核实定价，检查重大功能变更
- **收到通知时**：客户提及竞争对手发生变化
- **每年**：全面更新所有竞争对手数据

---

## SEO 注意事项

### 关键词定位

| 格式 | 主要关键词 |
|--------|-----------------|
| Alternative（单数） | [Competitor] alternative, alternative to [Competitor] |
| Alternatives（复数） | [Competitor] alternatives, best [Competitor] alternatives |
| 你们 vs 竞争对手 | [You] vs [Competitor], [Competitor] vs [You] |
| 竞争对手 vs 竞争对手 | [A] vs [B], [B] vs [A] |

### 内部链接
- 在相关竞争对手页面之间互相链接
- 从功能页面链接到相关对比页面
- 创建链接到所有竞争对手内容的中心页

### Schema 标记
考虑针对“What is the best alternative to [Competitor]?”等常见问题使用 FAQ schema。

---

## 交付前检查

以下边界要求在任何对比页面发布前进行最终声明审核。
这就是该审核——应当在完成初稿后作为第二轮检查执行，而不是在撰写过程中进行：

1. 重新阅读所有关于竞争对手的声明：定价、套餐内容、功能可用性、评分、评价数量、客户评价、员工人数、融资情况。
2. 每条声明都必须附有来源 URL 和核查日期。缺少其中任何一项的声明都应当**删除，或在页面中明确标记为未经核实**——绝不能将其弱化为含糊的措辞（“据报道”“许多用户认为”“以……著称”）。为无来源的声明加上模糊表述，只会保留声明，却失去责任追踪。
3. 任何来源时间超过一个季度的声明，都必须在发布前重新核查，不能直接沿用。定价页面会发生变化。
4. 关于你们自身当前可见性，或 AI 回答如何引用该页面的声明，无法在此处验证——应将这些内容交由 `suede-seo-audit` 处理。

---

## 输出格式

三个交付物，所有交付物的 schema 都已在参考资料中定义——不要自行设计结构：

- **竞争对手数据文件**——集中管理的每个竞争对手记录；结构参见 [references/content-architecture.md](references/content-architecture.md)。
- **页面内容**——URL、meta 标签、按章节组织的完整文案、表格、CTA；章节模板参见 [references/templates.md](references/templates.md)。
- **页面集合计划**——需要创建的页面，按照搜索量和证据准备情况确定优先级。

---

## 针对任务的问题

1. 人们转而使用你们产品的常见原因是什么？
2. 你们是否有关于转用你们产品的客户引言？
3. 你们与竞争对手的定价相比如何？
4. 你们是否提供迁移支持？

---

## 边界

- 不要编造、选择性摘取，或将过时的竞争对手主张、价格、功能、客户评价或排名表述为当前事实。
- 未经明确授权和最终主张审核，不要发布、部署、索引或更新对比页面。
- 不要以暗示关联的方式使用竞争对手商标，也不要在未获权利许可的情况下复用受保护的创意资产。
- 不要判定某个选项对所有人而言都是最佳选择；应说明受众、标准、权衡、来源和核查日期。

## 路由

- 需要当前竞争对手证据 -> 使用 `suede-competitor-profiling`。
- 需要为“常见投诉”和转换原因部分挖掘评论或整合论坛内容 -> 使用 `suede-customer-research`。
- 需要可规模化的对比页面架构 -> 使用 `suede-programmatic-seo`。
- 需要最终页面文案或自然流量 QA -> 使用 `suede-copy` 或 `suede-seo-audit`。
- 需要内部竞争卡片 -> 使用 `suede-sales-enablement`。
- 从这些技能中，将诚实的公开替代方案和对比页面撰写路由回 `suede-competitors`。