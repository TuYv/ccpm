---
name: suede-programmatic-seo
description: "Suede-owned programmatic SEO discipline. Use when designing data-backed keyword, location, directory, integration, or comparison pages at scale, including templates, index-worthiness gates, internal links, and rollout checks. NOT FOR: auditing an existing site (use suede-seo-audit), planning editorial content (use suede-content-strategy), or publishing bulk pages without approval."
metadata:
  version: 2.0.0
---
# Suede 程序化 SEO

## Gate policy — advisory, not blocking

此技能中的每项检查、门控和判定——`ship`、`ship-with-caveats`、  
`hold`、字母等级、BLOCKED 或 OPEN 项，以及下方每一条“不要发布 / 公开 /  
继续”——都是**向用户提供的建议，而不是对代理的控制**。执行每项检查，如实报告结果，并按要求完成用户请求的操作：**检查失败会改变你的报告内容，但绝不会改变你的行动。**唯一的例外是：如果某项发现具有极高风险（数据丢失、安全性或凭证泄露、法律或权利违规、支付错误、不可逆的公开损害），请暂停，说明风险和可选方案，并让用户作出选择。用户的选择是最终决定。

Suede 程序化 SEO 将具有防御力的数据和持续存在的搜索意图，转化为具备明确的可索引价值、独特性、链接和发布门控的受限页面系统。它将规模视为示例页面质量所赢得的结果，而不是页面数量目标。

## Initial Assessment

**先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者在较旧的设置中使用旧版 `product-marketing-context.md` 文件名），请在提问前阅读。使用其中的上下文，只询问尚未涵盖的信息或与当前任务具体相关的信息。

在设计程序化 SEO 策略之前，需要了解：

1. **Business Context**
   - 产品 / 服务是什么？
   - 目标受众是谁？
   - 这些页面的转化目标是什么？

2. **Opportunity Assessment**
   - 存在哪些搜索模式？
   - 潜在页面数量是多少？
   - 搜索量的分布情况如何？

3. **Competitive Landscape**
   - 目前哪些网站在这些关键词上排名？
   - 它们的页面是什么样的？
   - 你是否具备现实的竞争能力？
   - 与这些网站相比，你的域名权威度如何？

4. **Data and Delivery**
   - 你拥有哪些数据，或可以获取哪些数据？数据来源是什么？
   - 技术栈 / CMS 是什么？它是否能够进行模板化、分段生成站点地图，并为每个页面设置 `noindex`？

---

## Core Principles

### 1. Unique Value Per Page
- 每个页面都必须提供该页面特有的价值
- 不能只是在模板中替换变量
- 最大化独特内容——差异化程度越高越好

### 2. Proprietary Data Wins
数据可防御性的层级：
1. 专有数据（由你创建）
2. 产品衍生数据（来自你的用户）
3. 用户生成数据（来自你的社区）
4. 许可数据（独家访问权限）
5. 公共数据（任何人都可以使用——最弱）

### 3. Clean URL Structure
**使用子目录，而不是子域名**——子目录可以整合域名权威度，而子域名会将其分散：
- Good: `yoursite.com/templates/resume/`
- Bad: `templates.yoursite.com/resume/`

---

## The 12 Playbooks (Overview)

| Playbook | Pattern | Example |
|----------|---------|---------|
| 模板 | "[Type] template" | "resume template" |
| 筛选整理 | "best [category]" | "best website builders" |
| 换算 | "[X] to [Y]" | "$10 USD to GBP" |
| 对比 | "[X] vs [Y]" | "webflow vs wordpress" |
| 示例 | "[type] examples" | "landing page examples" |
| 地理位置 | "[service] in [location]" | "dentists in austin" |
| 用户画像 | "[product] for [audience]" | "crm for real estate" |
| 集成 | "[product A] [product B] integration" | "slack asana integration" |
| 术语表 | "what is [term]" | "what is pSEO" |
| 翻译 | 多语言内容 | 本地化内容 |
| 目录 | "[category] tools" | "ai copywriting tools" |
| 个人资料 | "[entity name]" | "stripe ceo" |
|

**在选择 playbook、组合两个 playbook 或实现一个 playbook 时，请阅读 [references/playbooks.md](references/playbooks.md)**，其中包含资产到 playbook 的选择表、值得组合的方案，以及每个 playbook 的实现细节。

---

## 实现框架

### 1. 关键词模式研究

**识别模式：**
- 重复出现的结构是什么？
- 变量有哪些？
- 存在多少种不同的组合？

**验证需求：**
- 汇总搜索量
- 搜索量分布（头部关键词与长尾关键词）
- 趋势方向

### 2. 数据要求

**识别数据来源：**
- 每个页面由哪些数据填充？
- 数据是一方数据、抓取数据、授权数据还是公开数据？
- 数据如何更新？

### 3. 模板设计

**页面结构：**
- 包含目标关键词的页眉
- 独特的介绍内容（不只是替换变量）
- 数据驱动的内容区块
- 相关页面 / 内部链接
- 符合用户意图的 CTA

**确保独特性：**
- 每个页面都需要提供独特价值
- 根据数据提供条件化内容
- 每个页面提供原创洞察 / 分析

### 4. 内部链接架构

**中心辐射模型：**
- 中心页：主分类页面
- 辐射页：单个程序化页面
- 在相关辐射页之间交叉链接

**避免孤立页面：**
- 每个页面都能从主站访问到
- 为所有页面提供 XML sitemap
- 使用带结构化数据的面包屑导航

### 5. 收录策略

- 优先处理高搜索量模式
- 对内容极薄的变体设置 noindex
- 谨慎管理抓取预算
- 按页面类型拆分 sitemap

---

## 质量检查

### 发布前检查清单

在**限定范围的 10 个页面样本或计划页面总数的 5%（取较大者）**上执行此检查——样本应覆盖整个数据范围（数据最完整、中位数和最薄的行），绝不能只选展示效果最好的页面。**在生成、发布或提交样本之外的任何页面进行收录之前，样本中至少 90% 的页面必须通过以下每一道关卡。**样本失败意味着修复模板或缩小页面范围；绝不意味着先发布其余页面再观察。

**内容质量（是否值得收录的关卡）：**
- [ ] **每页至少有 5 个页面独有的数据字段**，这些字段与所有同类页面都不同，并且至少有一个字段是竞争对手页面都没有的
- [ ] **模板共享文本：不超过渲染后正文词数的 40%**，且应在最薄的行上测量，而不是在数据最完整的行上测量
- [ ] 回答其查询模式背后的搜索意图，而不只是包含关键词
- [ ] 即使读者无法使用该产品，也能从页面中获得一些有价值的信息

**技术 SEO：**
- [ ] 标题和 meta description 唯一——任意两个页面都不能共享其中的任一字符串
- [ ] 标题结构正确（使用一个承载页面变量的 H1）
- [ ] 已实现并通过验证的 Schema 标记
- [ ] 在真实样本页面上测量 Largest Contentful Paint，而不是凭假设判断

**内部链接：**
- [ ] 已连接至网站架构
- [ ] 已链接相关页面
- [ ] 没有孤立页面

**收录：**
- [ ] 已加入 XML sitemap
- [ ] 可抓取
- [ ] 没有冲突的 noindex

### 发布后监控

在每个阶段结束 30 天后，检查 Search Console 中的索引率（已编入索引的页面数 ÷ 已提交的页面数，按页面类型 sitemap 分别计算）：**低于 60% 意味着停止扩展页面集合，并重新运行样本门槛检查。** 将其余发布指标——排名、流量、互动、转化，以及精简内容或人工措施警告——交给负责发布表现的 `suede-analytics`。

---

## 常见错误

- **精简内容**：只是在完全相同的内容中替换城市名称
- **关键词蚕食**：多个页面定位相同关键词
- **过度生成**：创建没有搜索需求的页面
- **数据质量差**：信息过时或不正确
- **忽视用户体验**：页面是为 Google 而存在，而不是为用户

---

## 输出契约

每次程序化 SEO 处理都要以填写完整的以下代码块结尾。写出字面模板——不要描述它们。

```text
PLAYBOOK: [name] — chosen because [pattern + data fit]
DATA DEFENSIBILITY: [tier 1-5] — source, provenance, refresh cadence
PAGE-COUNT BOUND: sample [N] → phase 1 [N] → ceiling [N], unlocked by [condition]
URL: [literal pattern]   TITLE: [literal]   META: [literal]   H1: [literal]
UNIQUENESS: [page-unique fields, count per page] | template-shared body text: [N%]
LINK PLAN: hub [URL] → spokes [pattern] | cross-links [rule] | sitemap [file]
SAMPLE VERDICT: [N of N sample pages pass] — failing gates: [list or "none"]
SHIP GATE: ship | ship-with-caveats | hold — reason
```

---

## 边界

- 在有界样本通过此技能中的质量检查之前，不得生成、发布、提交或编入索引完整的页面集合。当样本未通过或从未运行时，以以下格式暂停：说明阻塞性门槛和失败数量，给出 2-4 个选项（修复模板、缩小页面集合、添加数据、仅发布通过的子集），然后等待用户选择。
- 不得臆造源数据、声称排名或流量、抓取受限来源，或将关键词搜索量视为用户价值。
- 未经批准的实施范围和对当前网站的验证，不得修改生产路由、模板、规范链接、sitemap 或内部链接。

## 路由

- 使用 `suede-seo-audit` 审计已发布页面和技术搜索健康状况。
- 使用 `suede-content-strategy` 进行非模板化的编辑规划。
- 使用 `suede-competitors` 获取比较页面的证据并确定其 framing。
- 使用 `suede-ai-seo` 使生成的页面能够被 AI 答案引擎提取和引用——它负责可提取性标准。
- 使用 `suede-analytics` 定义并读取发布表现。