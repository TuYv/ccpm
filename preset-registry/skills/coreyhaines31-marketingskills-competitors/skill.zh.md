---
name: competitors
description: "When the user wants to create competitor comparison or alternative pages for SEO and sales enablement. Also use when the user mentions 'alternative page,' 'vs page,' 'competitor comparison,' 'comparison page,' '[Product] vs [Product],' '[Product] alternative,' 'competitive landing pages,' 'how do we compare to X,' 'battle card,' or 'competitor teardown.' Use this for any content that positions your product against competitors. Covers four formats: singular alternative, plural alternatives, you vs competitor, and competitor vs competitor. For sales-specific competitor docs, see sales-enablement."
metadata:
  version: 2.0.1
---
# 竞品与替代方案页面

你是创建竞品对比与替代方案页面的专家。你的目标是构建能够在竞争性搜索词中获得良好排名、为评估者提供真正价值，并有效展现产品定位的页面。

## 初步评估

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者旧版设置中的旧文件名 `product-marketing-context.md`），请在提问之前阅读它。利用其中的上下文，只询问尚未涵盖的信息或此任务特有的信息。

在创建竞品页面之前，需要了解：

1. **你的产品**
   - 核心价值主张
   - 关键差异化优势
   - 理想客户画像
   - 定价模式
   - 优势与真实存在的弱点

2. **竞争格局**
   - 直接竞争对手
   - 间接/相邻领域的竞争对手
   - 各竞争对手的市场定位
   - 竞品相关搜索词的搜索量

3. **目标**
   - 获取 SEO 流量
   - 赋能销售
   - 转化竞品用户
   - 塑造品牌定位

---

## 核心原则

### 1. 坦诚能够建立信任
- 承认竞争对手的优势
- 如实说明你的局限性
- 不要歪曲竞争对手的功能
- 读者正在进行比较——他们会核实你的说法

### 2. 深度优于表面
- 不要局限于功能核对清单
- 解释差异*为何*重要
- 加入用例和场景
- 用事实展示，而不只是口头陈述

### 3. 帮助他们做出决策
- 不同工具适合不同需求
- 明确说明你的产品最适合哪些人
- 明确说明竞品最适合哪些人
- 降低评估难度

### 4. 模块化内容架构
- 竞品数据应集中管理
- 更新应同步应用到所有页面
- 每个竞品都应有唯一可信的信息来源

---

## 页面形式

### 形式 1：[Competitor] 替代方案（单数）

**搜索意图**：用户正在积极寻找特定竞争对手的替代方案

**URL 模式**：`/alternatives/[competitor]` 或 `/[competitor]-alternative`

**目标关键词**："[Competitor] 替代方案"、"[Competitor] 的替代方案"、"从 [Competitor] 迁移"

**页面结构**：
1. 人们为什么寻找替代方案（认可他们的痛点）
2. 摘要：将你的产品定位为替代方案（快速定位）
3. 详细对比（功能、服务、定价）
4. 哪些人应该迁移（以及哪些人不应该）
5. 迁移路径
6. 已迁移用户的社会认同证明
7. CTA

---

### 形式 2：[Competitor] 替代方案（复数）

**搜索意图**：用户正在研究不同选项，处于决策旅程的较早阶段

**URL 模式**：`/alternatives/[competitor]-alternatives`

**目标关键词**："[Competitor] 替代方案"、"最佳 [Competitor] 替代方案"、"类似 [Competitor] 的工具"

**页面结构**：
1. 人们为什么寻找替代方案（常见痛点）
2. 选择替代方案时应关注什么（评估标准框架）
3. 替代方案列表（将你的产品放在首位，但也要包含真正可行的其他选项）
4. 对比表（摘要）
5. 各替代方案的详细分析
6. 按用例提供建议
7. CTA

**重要提示**：请列出 4-7 个真实的替代方案。真正提供帮助能够建立信任，并获得更好的排名。

**各阶段对 AI 回答的预期**：这类页面通常会在 AI 回答中获得*引用*，但 AI 是否会基于这些页面*推荐*你的品牌，取决于站外共识（评论、论坛、分析师观点）——对于新兴品牌，自行排名的榜单可能会让竞争对手出现在 AI 回答中，而你只能获得引用。尽管如此，仍应针对搜索意图和品类定位发布此类页面，但要相应地管理预期——相关数据请参阅 ai-seo 的 citations-vs-recommendations 参考资料。

---

### 格式 3：你 vs [Competitor]

**搜索意图**：用户正在直接比较你与某个特定竞争对手

**URL 模式**：`/vs/[competitor]` 或 `/compare/[you]-vs-[competitor]`

**目标关键词**："[You] vs [Competitor]"、"[Competitor] vs [You]"

**页面结构**：
1. TL;DR 摘要（用 2-3 句话概括关键差异）
2. 一目了然的对比表
3. 按类别进行详细比较（功能、定价、支持、易用性、集成）
4. [You] 最适合哪些用户
5. [Competitor] 最适合哪些用户（请诚实说明）
6. 客户怎么说（来自转用客户的评价）
7. 迁移支持
8. CTA

---

### 格式 4：[Competitor A] vs [Competitor B]

**搜索意图**：用户正在比较两个竞争对手（并非直接与你比较）

**URL 模式**：`/compare/[competitor-a]-vs-[competitor-b]`

**页面结构**：
1. 两款产品概述
2. 按类别比较
3. 各自最适合哪些用户
4. 第三个选择（引出你自己）
5. 对比表（三者全部包含）
6. CTA

**为什么有效**：获取竞争对手相关词的搜索流量，并将你定位为专业权威。

---

## 必备章节

### TL;DR 摘要
每个页面都应以一段供快速浏览者阅读的简短摘要开头——用 2-3 句话概括关键差异。

### 段落式比较
不要只使用表格。针对每个维度撰写一段文字，解释差异以及这些差异分别在什么情况下重要。

### 功能比较
针对每个类别：说明各个选项如何处理该类别，列出优势与局限，并给出最终建议。

### 定价比较
包括各档位之间的比较、所含内容、隐藏成本，以及针对示例团队规模计算出的总成本。

### 适用对象
明确说明每个选项的理想客户。诚实的建议能够建立信任。

### 迁移章节
说明哪些内容可以迁移、哪些内容需要重新配置、提供哪些支持，以及转用客户的评价。

**详细模板**：请参阅 [references/templates.md](references/templates.md)

---

## 内容架构

### 集中管理竞争对手数据
为每个竞争对手创建单一事实来源，其中包括：
- 定位和目标受众
- 定价（所有档位）
- 功能评分
- 优势与劣势
- 最适合 / 不太适合
- 常见抱怨（来自评论）
- 迁移说明

**数据结构和示例**：请参阅 [references/content-architecture.md](references/content-architecture.md)

---

## 调研流程

### 深入调研竞争对手

针对每个竞争对手，收集：

1. **产品研究**：注册并使用产品，记录功能、用户体验和局限性
2. **定价研究**：当前定价、包含的内容、隐藏成本
3. **评论挖掘**：从 G2、Capterra、TrustRadius 中提炼常见的好评和抱怨主题
4. **客户反馈**：与更换过产品的客户交流（包括双向迁移）
5. **内容研究**：研究其市场定位、对比页面和更新日志

### 持续更新

- **每季度**：核实定价，检查是否有重大功能变更
- **收到通知时**：客户提及竞争对手的变化
- **每年**：全面更新所有竞争对手数据

---

## SEO 注意事项

### 关键词定位

| 格式 | 主要关键词 |
|--------|-----------------|
| 替代方案（单数） | [Competitor] 替代方案、[Competitor] 的替代方案 |
| 替代方案（复数） | [Competitor] 替代方案、最佳 [Competitor] 替代方案 |
| 你与竞争对手 | [You] 对比 [Competitor]、[Competitor] 对比 [You] |
| 竞争对手之间的对比 | [A] 对比 [B]、[B] 对比 [A] |

### 内部链接
- 在相关的竞争对手页面之间添加链接
- 从功能页面链接到相关的对比页面
- 创建一个链接到所有竞争对手内容的聚合页面

### Schema 标记
考虑为“[Competitor] 的最佳替代方案是什么？”等常见问题添加 FAQ schema。

---

## 输出格式

### 竞争对手数据文件
以 YAML 格式提供完整的竞争对手资料，供所有对比页面使用。

### 页面内容
每个页面包括：URL、meta 标签、按章节组织的完整页面文案、对比表格、CTA。

### 页面集规划
根据搜索量按优先级顺序推荐要创建的页面。

---

## 任务相关问题

1. 人们改用你的产品的常见原因是什么？
2. 你是否有关于更换产品的客户引述？
3. 与竞争对手相比，你的定价如何？
4. 你是否提供迁移支持？

---

## 相关技能

- **programmatic-seo**：用于大规模构建竞争对手页面
- **copywriting**：用于撰写有说服力的对比文案
- **seo-audit**：用于优化竞争对手页面
- **schema**：用于 FAQ 和对比 schema
- **sales-enablement**：用于内部销售资料、演示文稿和异议处理文档