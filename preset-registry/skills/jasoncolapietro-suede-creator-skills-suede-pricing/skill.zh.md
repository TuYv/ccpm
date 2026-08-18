---
name: suede-pricing
description: "Suede-owned pricing and packaging discipline. Use when deciding what to charge, structuring tiers, choosing a value metric, comparing free trials with freemium, researching willingness to pay, planning a price increase, or tearing down a pricing page for clarity and AI-readability. NOT FOR: in-product upgrade screens (use suede-paywalls), offer bonuses and guarantees (use suede-offers), or executing billing changes."
metadata:
  version: 2.1.0
---
# Suede 定价与套餐设计

Suede 定价将经过验证的产品经济性、买家证据和商业约束，转化为可测试的价格、价值指标、层级和迁移计划。
它会生成决策简报和衡量计划，同时确保计费变更必须经过明确批准。

## 开始之前

**先检查产品营销背景：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者在较旧设置中使用旧版 `product-marketing-context.md` 文件名），请在提问前先阅读。使用其中的背景信息，只询问尚未涵盖或与此任务具体相关的信息。

收集以下背景信息（如未提供则询问）：

### 1. 业务背景
- 产品属于哪种类型？（SaaS、平台型市场、电商、服务）
- 你目前的定价是什么？（如有）
- 你的目标市场是什么？（SMB、中端市场、企业）
- 你的市场进入方式是什么？（自助服务、销售驱动、混合）

### 2. 价值与竞争
- 你提供的主要价值是什么？
- 客户会考虑哪些替代方案？
- 竞争对手如何定价？

### 3. 当前表现
- 你当前的转化率是多少？
- 你的 ARPU 和流失率是多少？
- 客户/潜在客户对定价有何反馈？

### 4. 目标
- 你是在优化增长、收入还是盈利能力？
- 是要向上拓展市场，还是向下扩展市场？

---

## 定价基础

三个轴，按以下顺序确定：**套餐设计**（每个层级包含什么）、**定价指标**（按什么收费）、**价格点**（收取多少）。

价格位于下一个最佳替代方案（价格下限）与客户感知价值（价格上限）之间。服务成本是基准线，但绝不是定价依据。

---

## 价值指标

### 什么是价值指标？

价值指标就是你收费所依据的内容——它应该随着客户获得的价值而增长。

**好的价值指标：**
- 使价格与交付的价值保持一致
- 易于理解
- 随客户成长而扩展
- 难以被操纵

### 常见价值指标

| 指标 | 最适合 | 示例 |
|--------|----------|---------|
| 按用户/席位 | 协作工具 | Slack、Notion |
| 按用量 | 可变消费 | AWS、Twilio |
| 按功能 | 模块化产品 | HubSpot 附加功能 |
| 按联系人/记录 | CRM、电子邮件工具 | Mailchimp |
| 按交易 | 支付、平台型市场 | Stripe |
| 固定费用 | 简单产品 | Basecamp |

### 选择你的价值指标

问自己：“客户使用更多的[指标]时，是否会获得更多价值？”
- 如果是 → 这是一个好的价值指标
- 如果不是 → 价格就没有与价值保持一致

### 需要超越的默认选项

这些是模型在未获提示时会优先采用的答案。每一种都可以使用，但只有在说明它为何优于此产品的替代方案之后才可以使用——绝不能默认采用：
**$9/$29/$99**（或任何固定的 3 倍阶梯）；不具备产品含义的 **Starter/Pro/Enterprise** 名称；当买家群体有两个或四个时仍然**恰好设置三个层级**；条件反射式地提供**年度付费 8 折**；在最高层级使用 **“联系我们”**，这会对买家以及如今负责筛选工具的代理隐藏价格（参见定价页面拆解）；当用量、记录数或交易数量能更好地反映价值时，仍然采用**按席位**收费。

---

## 层级结构概览

### 好-更好-最佳框架

**Good 层级（入门版）：** 核心功能、有限用量、低价  
**Better 层级（推荐版）：** 完整功能、合理限制、锚定价格  
**Best 层级（高级版）：** 全部功能、高级功能、Better 价格的 2-3 倍

### 层级差异化

- **功能限制** — 基础功能 vs. 高级功能
- **用量限制** — 功能相同，但限制不同
- **支持级别** — 电子邮件 → 优先支持 → 专属支持
- **访问权限** — API、SSO、自定义品牌

**有关详细的层级结构和基于用户画像的产品打包**：请参阅 [references/tier-structure.md](references/tier-structure.md)

---

## 定价研究

### Van Westendorp 方法

用于确定可接受价格范围的四个问题：
1. 太贵（不会考虑购买）
2. 太便宜（会质疑质量）
3. 虽然贵，但可能会考虑
4. 物超所值

分析各项结果的交集，以找出最佳定价区间。

### MaxDiff 分析

用于确定客户最看重哪些功能：
- 展示多组功能
- 询问：最重要的是什么？最不重要的是什么？
- 研究结果可为层级打包提供依据

**有关详细的研究方法**：请参阅 [references/research-methods.md](references/research-methods.md)

---

## 何时应该提高价格

### 表明时机已到的信号

**市场信号：**
- 竞争对手已经提高价格
- 潜在客户对价格并不在意
- 收到“太便宜了！”之类的反馈

**业务信号：**
- 转化率非常高（>40%）
- 流失率非常低（每月 <3%）
- 单位经济效益强劲

**产品信号：**
- 自上次定价以来增加了显著价值
- 产品更加成熟、稳定

### 提价策略

1. **现有客户享受原价** — 仅对新客户采用新价格
2. **延迟提价** — 提前 3-6 个月宣布
3. **与价值挂钩** — 提高价格，但增加功能
4. **重构方案** — 完全调整产品方案

---

## 定价页面最佳实践

### 首屏区域
- 清晰的层级对比表
- 突出显示推荐层级
- 月付/年付切换
- 每个层级对应的主要 CTA

### 常见元素
- FAQ 部分
- 年付折扣提示（17-20%）
- 退款保证

### 定价心理学
- **锚定效应：** 先展示价格较高的选项
- **诱饵效应：** 中间层级应当体现最佳价值
- **魅力定价：** $49 而不是 $50（面向注重价值的客户）
- **整数定价：** $50 而不是 $49（面向高端客户）

---

## 定价页面拆解分析

当有人希望审核现有定价*页面*的**清晰度、透明度和 AI 可读性**时（而不是定价策略本身，也不是转化率优化——那属于 `suede-site-alchemy`），请运行一次**拆解分析**，从两个维度进行评分，并返回按优先级排序的改进项：

- **人类买家体验** — 价值主张的清晰度、方案差异化、认知负担、信任信号、定价心理学以及价格透明度。
- **AI 代理就绪度** — 日益负责筛选和比较工具的 LLM 和代理是否确实能够读取并引用你的定价：机器可读的价格（而不是锁定在图片中或隐藏在“联系我们”之后）、可提取的 FAQ/异议应对内容、以文本形式明确说明的各层级详细信息，以及结构化数据。如今，买家在访问网站之前就会询问 ChatGPT/Perplexity/Claude：“最好的 X 是什么，价格是多少？”*代理无法解析的定价页面，会让你错失那些甚至无法察觉的交易。*

**快速检查——“粘贴测试”：**将定价 URL 提供给具备浏览能力的 AI（Perplexity、带搜索功能的 ChatGPT、带网页访问功能的 Claude）——或粘贴渲染后的页面文本——然后询问“有哪些方案和价格？”如果结果明显遗漏，意味着抓取你页面的代理也可能会遇到困难（这是一种启发式判断，并不能证明每个代理都会失败）。

AI 就绪性方面的修复通常影响大、投入低（将价格放入文本中，添加 `Offer` schema）。将实现工作交给 **suede-seo-audit**（Product/Offer JSON-LD 和受支持的 schema 检查）以及 **suede-ai-seo**（可提取性、AI 机器人访问权限、`llms.txt`）。

**完整的 10 维度评估标准、评分方式和报告模板：**请参阅 [references/pricing-page-teardown.md](references/pricing-page-teardown.md)。（*AI 代理就绪性视角改编自 Kyle Poyar / Growth Unhinged。*）

---

## 输出：定价决策简报

每个不是拆解分析的定价或套餐设计项目都必须返回以下确切结构。逐字使用这些标题；如果某个标题尚未确定，也要保留该标题，并填写“not decided —
[what's missing]”，不要删除该标题。

```markdown
# Pricing Decision Brief — [product]

## Value metric
[What you charge for, and the one sentence proving usage of it tracks value.]

## Tier map
| Tier | Who it's for | Included | Limits | Price |
|------|--------------|----------|--------|-------|

## Price points + rationale
[Each number, and what it is anchored to: alternative, perceived value, or research.]

## Assumptions
[Every number taken on faith, flagged as assumption not measurement.]

## Validation plan
[What test or research confirms each assumption, and the metric that reads out.]

## Migration + grandfathering
[Existing customers: who moves, when, on what notice, and who is held.]

## What I did NOT decide
[Anything left to the user: committed price, published copy, billing changes.]
```

---

## 边界

- 未经验证的实时状态、最高成本检查和明确批准，不得创建或更改计费产品、价格、订阅或客户迁移。
- 除非当前研究或产品数据提供支持，否则不得将支付意愿、转化率、流失率或收入影响表述为已测量结果。
- 不得发布定价文案、选择祖父条款政策或让业务承诺某个价格；应向用户返回建议、假设和验证计划，由用户做出决定。

## 路由

- 使用 `suede-paywalls` 处理产品内升级和付费墙体验。
- 使用 `suede-offers` 处理奖励、保证和报价框架。
- 使用 `suede-ab-testing` 验证定价页面或套餐设计假设。
- 使用 `suede-revops` 处理已批准的交易台和销售管道实施。