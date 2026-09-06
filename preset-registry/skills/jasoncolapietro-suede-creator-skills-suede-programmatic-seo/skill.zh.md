---
name: suede-programmatic-seo
description: "Suede-owned programmatic SEO discipline. Use when designing data-backed keyword, location, directory, integration, or comparison pages at scale, including templates, index-worthiness gates, internal links, and rollout checks. NOT FOR: auditing an existing site (use suede-seo-audit), planning editorial content (use suede-content-strategy), or publishing bulk pages without approval."
metadata:
  version: 2.0.0
---
# Suede 程序化 SEO

## Gate policy — advisory, not blocking

本技能中的每项检查、门槛和判定，包括 `ship`、`ship-with-caveats`、`hold`、字母等级、BLOCKED 或 OPEN 项，以及下方所有“不要发布 / 不要上线 / 不要继续”的行，均是**向用户提供的建议，而不是对代理的控制**。运行每项检查，如实报告结果，并按要求完成操作：**检查失败只会改变你的报告内容，不会改变你的执行行为。** 唯一例外是：如果发现极高风险的问题（数据丢失、安全或凭据泄露、法律或权利违规、支付错误、不可逆的公开损害），请暂停，说明风险和可选方案，并让用户做出选择。用户的选择是最终决定。

Suede 程序化 SEO 将可辩护的数据和持续存在的搜索意图，转化为有边界的页面体系，并设置明确的可索引价值、独特性、链接和发布门槛。它将规模视为样例页面质量达标后获得的结果，而不是页面数量目标。

## Initial Assessment

**先检查产品营销背景：**
如果存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`，也可能是旧版设置中的 `product-marketing-context.md` 文件名），请在提问前阅读。使用其中的背景信息，只询问尚未涵盖或与当前任务具体相关的信息。

在设计程序化 SEO 策略之前，需要了解：

1. **业务背景**
   - 产品/服务是什么？
   - 目标受众是谁？
   - 这些页面的转化目标是什么？

2. **机会评估**
   - 存在哪些搜索模式？
   - 潜在页面数量是多少？
   - 搜索量的分布情况如何？

3. **竞争格局**
   - 目前哪些网站在这些关键词上排名？
   - 他们的页面是什么样的？
   - 你是否具备现实的竞争能力？
   - 相较于竞争对手，你的域名权威度如何？

4. **数据与交付**
   - 你有哪些数据，或能够获取哪些数据？数据来源是什么？
   - 技术栈 / CMS 是什么？是否能够使用模板、分段生成站点地图，并为每个页面设置 `noindex`？

---

## Core Principles

### 1. 每个页面的独特价值
- 每个页面都必须提供该页面特有的价值
- 不能只是替换模板中的变量
- 最大化独特内容——差异化程度越高越好

### 2. 专有数据制胜
数据可辩护性的层级：
1. 专有数据（由你创建）
2. 产品衍生数据（来自你的用户）
3. 用户生成数据（来自你的社区）
4. 授权数据（独家访问权限）
5. 公共数据（任何人都可以使用——最弱）

### 3. 清晰的 URL 结构
**使用子目录，而不是子域名**——子目录可以整合域名权威度，而子域名会将其分散：
- 好：`yoursite.com/templates/resume/`
- 坏：`templates.yoursite.com/resume/`

---

## The 12 Playbooks (Overview)

| Playbook | Pattern | Example |
|----------|---------|---------|
| 模板 | “[类型] template” | “resume template” |
| 筛选整理 | “best [类别]” | “best website builders” |
| 转换 | “[X] to [Y]” | “$10 USD to GBP” |
| 比较 | “[X] vs [Y]” | “webflow vs wordpress” |
| 示例 | “[类型] examples” | “landing page examples” |
| 地点 | “[服务] in [地点]” | “dentists in austin” |
| 用户画像 | “[产品] for [受众]” | “crm for real estate” |
| 集成 | “[产品 A] [产品 B] integration” | “slack asana integration” |
| 术语表 | “what is [术语]” | “what is pSEO” |
| 翻译 | 多语言内容 | 本地化内容 |
| 目录 | “[类别] tools” | “ai copywriting tools” |
| 个人资料 | “[实体名称]” | “stripe ceo” |

**选择剧本时、叠加两个剧本时，或实现一个剧本时，请阅读 [references/playbooks.md](references/playbooks.md)**：其中包含资产到剧本的选择表、值得叠加的组合，以及每个剧本的实现细节。

---

## 实现框架

### 1. 关键词模式研究

**识别模式：**
- 重复出现的结构是什么？
- 变量有哪些？
- 存在多少种独特组合？

**验证需求：**
- 汇总搜索量
- 搜索量分布（头部与长尾）
- 趋势方向

### 2. 数据需求

**识别数据源：**
- 哪些数据用于填充每个页面？
- 数据来自第一方、抓取、授权，还是公共来源？
- 数据如何更新？

### 3. 模板设计

**页面结构：**
- 包含目标关键词的页眉
- 独特的简介（不只是替换变量）
- 数据驱动的版块
- 相关页面 / 内部链接
- 符合搜索意图的 CTA

**确保独特性：**
- 每个页面都需要提供独特价值
- 根据数据提供条件化内容
- 为每个页面提供原创洞察 / 分析

### 4. 内部链接架构

**中心与辐射模型：**
- 中心：主分类页面
- 辐射：单个程序化页面
- 在相关辐射页面之间交叉链接

**避免孤立页面：**
- 每个页面都可以从主站访问
- 为所有页面提供 XML sitemap
- 提供带有结构化数据的面包屑

### 5. 收录策略

- 优先处理高搜索量模式
- 对内容非常单薄的变体使用 noindex
- 有规划地管理抓取预算
- 按页面类型分离 sitemap

---

## 质量检查

### 上线前检查清单

在生成、发布或提交样本之外的任何页面进行收录之前，请对 **10 个页面，或计划页面总数的 5%（取较大者）组成的限定样本**运行以下检查。样本应覆盖整个数据范围（数据最完整、中位数和最单薄的行），绝不能只选择展示页面。**样本中至少 90% 的页面必须通过以下每一项检查**，之后才能生成、发布或提交样本之外的页面进行收录。样本失败意味着修复模板或缩小页面集合；绝不能先发布其余页面再观察结果。

**内容质量（是否值得收录的门槛）：**
- [ ] **每页至少有 5 个页面独有的数据字段**，这些字段与每个兄弟页面都不同，并且至少有一个字段是竞争对手页面未提供的
- [ ] **模板共享文本不超过 40%**：在兄弟页面之间，渲染后的正文词语中完全相同的部分不得超过 40%（以内容最单薄的行作为测量对象，而不是内容最完整的行）
- [ ] 回答查询模式背后的搜索意图，而不只是包含关键词
- [ ] 即使读者无法使用该产品，也能从页面中获得有价值的信息

**技术 SEO：**
- [ ] 标题和 meta description 唯一：任意两个页面都不能共享其中任一字符串
- [ ] 标题结构正确（使用一个包含页面变量的 H1）
- [ ] 已实现并通过验证的 Schema 标记
- [ ] 在真实样本页面上测量 Largest Contentful Paint，而不是凭假设判断

**内部链接：**
- [ ] 已连接到站点架构
- [ ] 已链接相关页面
- [ ] 没有孤立页面

**收录：**
- [ ] 已加入 XML sitemap
- [ ] 可抓取
- [ ] 没有冲突的 noindex

### 上线后监控

在每个阶段结束 30 天后，检查 Search Console 中的索引率（按页面类型 sitemap 计算：已索引 ÷ 已提交）：**低于 60% 意味着停止扩展页面集合，并重新运行样本门槛检查。** 将其余上线指标——排名、流量、互动、转化，以及低质量内容或人工操作警告——交给负责上线表现的 `suede-analytics`。

---

## 常见错误

- **低质量内容**：只是在完全相同的内容中替换城市名称
- **关键词蚕食**：多个页面定位相同关键词
- **过度生成**：创建没有搜索需求的页面
- **数据质量差**：信息过时或不正确
- **忽视用户体验**：页面是为 Google 存在的，而不是为用户存在的

---

## 输出契约

每次程序化 SEO 执行结束时，都要填写并附上以下代码块。写出字面模板，不要描述它们。

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

- 在有界样本通过此 skill 中的质量检查之前，不得生成、发布、提交或索引完整页面集合。当样本未通过或从未运行时，请按以下格式报告：指出阻塞门槛和失败数量，给出 2-4 个选项（修复模板、缩小页面集合、补充数据、仅发布通过的子集），并提出一项建议。是否越过门槛由用户根据上述门槛政策决定。
- 不得捏造源数据、声称排名或流量、抓取受限来源，也不得将关键词搜索量视为用户价值。
- 未经批准的实施范围和当前网站验证，不得更改生产路由、模板、规范链接、sitemap 或内部链接。

## 路由

- 使用 `suede-seo-audit` 审计已发布页面和技术搜索健康状况。
- 对于非模板化的编辑规划，使用 `suede-content-strategy`。
- 对于比较页面的证据和框架，使用 `suede-competitors`。
- 使用 `suede-ai-seo` 使生成的页面能够被 AI 答案引擎提取和引用——它负责可提取性标准。
- 使用 `suede-analytics` 定义并读取上线表现。