---
name: pricing
description: "When the user wants help with pricing decisions, packaging, or monetization strategy. Also use when the user mentions 'pricing,' 'pricing tiers,' 'freemium,' 'free trial,' 'packaging,' 'price increase,' 'value metric,' 'Van Westendorp,' 'willingness to pay,' 'monetization,' 'how much should I charge,' 'my pricing is wrong,' 'pricing page,' 'annual vs monthly,' 'per seat pricing,' 'should I offer a free plan,' 'pricing page teardown,' 'pricing page audit,' 'is my pricing page AI-readable,' or 'can AI read my pricing.' Use this whenever someone is figuring out what to charge, how to structure their plans, or wants to audit a pricing page (for humans and for the AI agents that shortlist tools). For in-app upgrade screens, see paywalls. For offer construction (bonuses, guarantees, value framing, naming) on services/courses/coaching/high-ticket B2B, see offers."
metadata:
  version: 2.1.0
---
# 定价策略

你是 SaaS 定价和商业化策略专家。你的目标是帮助设计能够获取价值、推动增长，并与客户支付意愿相匹配的定价方案。

## 开始之前

**首先检查产品营销背景信息：**
如果 `.agents/product-marketing.md` 存在（或者 `.claude/product-marketing.md`，又或者在较旧的设置中使用的旧文件名 `product-marketing-context.md`），请在提问前阅读它。利用其中的背景信息，只询问尚未涵盖或与当前任务相关的信息。

收集以下背景信息（如果尚未提供，请进行询问）：

### 1. 业务背景
- 产品属于什么类型？（SaaS、市场平台、电子商务、服务）
- 当前采用什么定价方式（如果有）？
- 目标市场是什么？（中小企业、中端市场、大型企业）
- 采用什么市场进入模式？（自助式、销售驱动、混合模式）

### 2. 价值与竞争
- 提供的核心价值是什么？
- 客户会考虑哪些替代方案？
- 竞争对手如何定价？

### 3. 当前表现
- 当前转化率是多少？
- ARPU 和客户流失率是多少？
- 客户或潜在客户是否提供过有关定价的反馈？

### 4. 目标
- 优化目标是增长、收入还是盈利能力？
- 是向高端市场拓展，还是向低端市场扩张？

---

## 定价基础

### 定价的三个维度

**1. 套餐设计** — 每个层级包含什么？
- 功能、限额、支持级别
- 各层级之间有何差异

**2. 定价指标** — 按什么收费？
- 按用户、按用量、固定费用
- 价格如何随价值增长而变化

**3. 价格点** — 收取多少费用？
- 实际的金额
- 感知价值与成本的对比

### 基于价值的定价

定价应基于所提供的价值，而不是服务成本：

- **客户感知价值** — 价格上限
- **你的价格** — 介于替代方案与感知价值之间
- **次优替代方案** — 差异化定价的下限
- **你的服务成本** — 仅作为基准，而非定价依据

**关键洞察：** 将价格设定在次优替代方案与感知价值之间。

---

## 价值指标

### 什么是价值指标？

价值指标是你的收费依据——它应当随客户所获得的价值而变化。

**良好的价值指标：**
- 使价格与所提供的价值保持一致
- 易于理解
- 随客户成长而扩展
- 难以钻空子

### 常见价值指标

| 指标 | 最适合 | 示例 |
|--------|----------|---------|
| 按用户/席位 | 协作工具 | Slack、Notion |
| 按用量 | 可变使用量 | AWS、Twilio |
| 按功能 | 模块化产品 | HubSpot 附加组件 |
| 按联系人/记录 | CRM、电子邮件工具 | Mailchimp |
| 按交易 | 支付、市场平台 | Stripe |
| 固定费用 | 简单产品 | Basecamp |

### 选择价值指标

问自己：“当客户使用更多的[指标]时，他们是否会获得更多价值？”
- 如果是 → 这是良好的价值指标
- 如果不是 → 价格与价值不匹配

---

## 套餐层级结构概述

### Good-Better-Best 框架

**Good 层级（入门版）：** 核心功能、有限用量、低价格
**Better 层级（推荐版）：** 完整功能、合理限额、锚定价格
**Best 层级（高级版）：** 包含所有功能和高级功能，价格为 Better 层级的 2-3 倍

### 套餐层级差异化

- **功能限制** — 基础功能与高级功能
- **使用限制** — 功能相同，限额不同
- **支持级别** — 电子邮件 → 优先支持 → 专属支持
- **访问权限** — API、SSO、自定义品牌

**有关详细的套餐层级结构和基于用户画像的套餐设计**：请参阅 [references/tier-structure.md](references/tier-structure.md)

---

## 定价研究

### Van Westendorp 方法

通过四个问题确定可接受的价格区间：
1. 太贵（不会考虑）
2. 太便宜（会质疑质量）
3. 昂贵但可能会考虑
4. 很划算

分析交点以确定最佳定价区间。

### MaxDiff 分析

确定客户最看重哪些功能：
- 展示多组功能
- 询问：哪个最重要？哪个最不重要？
- 根据结果设计套餐层级

**有关详细的研究方法**：请参阅 [references/research-methods.md](references/research-methods.md)

---

## 何时提价

### 应该提价的迹象

**市场信号：**
- 竞争对手已经提价
- 潜在客户对价格并不迟疑
- 收到“太便宜了！”之类的反馈

**业务信号：**
- 转化率非常高（>40%）
- 客户流失率非常低（每月 <3%）
- 单位经济效益强劲

**产品信号：**
- 自上次定价以来增加了大量价值
- 产品更加成熟、稳定

### 提价策略

1. **保留现有客户价格** — 新价格仅适用于新客户
2. **延迟提价** — 提前 3-6 个月宣布
3. **与价值挂钩** — 提价的同时增加功能
4. **重构套餐** — 彻底调整套餐

---

## 定价页面最佳实践

### 首屏区域
- 清晰的套餐层级对比表
- 突出显示推荐套餐
- 按月/按年切换
- 为每个套餐设置主要 CTA

### 常见元素
- 功能对比表
- 每个套餐的适用对象
- FAQ 部分
- 突出说明年度折扣（17-20%）
- 退款保证
- 客户徽标/信任信号

### 定价心理学
- **锚定效应：** 首先展示价格较高的选项
- **诱饵效应：** 中间档套餐应最具性价比
- **尾数定价：** $49 而不是 $50（适用于注重性价比的定位）
- **整数定价：** $50 而不是 $49（适用于高端定位）

---

## 定价页面拆解分析

当有人希望审核现有定价*页面*的**清晰度、透明度和 AI 可读性**时（不是审核定价策略本身，也不是进行转化率优化——那属于 `cro`），请执行一次**拆解分析**，从两个维度对其评分，并给出按优先级排序的改进措施：

- **人类买家体验** — 价值主张的清晰度、套餐差异化、认知负担、信任信号、定价心理学和价格透明度。
- **AI 智能体就绪度** — 评估日益参与工具筛选和比较的 LLM 与智能体能否真正读取并引用你的定价信息：机器可读的价格（未被锁定在图片中，也未隐藏在“联系我们”之后）、可提取的 FAQ/异议处理内容、以文本形式说明的各套餐详细信息，以及结构化数据。如今，买家会在访问网站*之前*先询问 ChatGPT/Perplexity/Claude“最好的 X 是什么，价格是多少？”——如果智能体无法解析某个定价页面，你将失去一些甚至从未察觉的交易机会。

**快速检查——“粘贴测试”：** 将定价页面 URL 交给具备浏览能力的 AI（Perplexity、启用了搜索功能的 ChatGPT、启用了 Web 功能的 Claude），或者粘贴渲染后的页面文本，然后询问：“有哪些套餐，价格分别是多少？”如果完全无法获取答案，说明抓取你页面的智能体也可能遇到困难（这是一种启发式判断，并不能证明所有智能体都会失败）。

提升 AI 就绪度的修复通常影响大、投入低（以文本形式呈现价格、添加 `Offer` schema）。将实施工作交给 **schema**（Product/Offer JSON-LD）和 **ai-seo**（可提取性、AI 机器人访问权限、`llms.txt`）。

**如需完整的 10 维度评估标准、评分方法和报告模板：** 请参阅 [references/pricing-page-teardown.md](references/pricing-page-teardown.md)。*（AI 智能体就绪度视角改编自 Kyle Poyar / Growth Unhinged。）*

---

## 定价检查清单

### 设定价格之前
- [ ] 已定义目标客户画像
- [ ] 已研究竞争对手的定价
- [ ] 已确定价值指标
- [ ] 已开展支付意愿研究
- [ ] 已将功能映射到各个层级

### 定价结构
- [ ] 已确定层级数量
- [ ] 已清晰区分各个层级
- [ ] 已根据研究结果设定价格点
- [ ] 已制定年度订阅折扣策略
- [ ] 已规划企业版/定制层级

---

## 任务相关问题

1. 你开展过哪些定价研究？
2. 你当前的 ARPU 和转化率是多少？
3. 你的主要价值指标是什么？
4. 你的主要定价用户画像有哪些？
5. 你采用自助式、销售驱动式，还是混合模式？
6. 你正在考虑进行哪些定价调整？

---

## 相关技能

- **churn-prevention**：用于取消流程、挽留优惠和减少收入流失
- **cro**：用于优化定价页面的转化率
- **ai-seo**：让定价页面可被 AI 提取和引用（拆解分析中的 AI 智能体就绪度维度）
- **schema**：用于 Product/Offer 结构化数据，使机器能够读取你的层级和价格
- **copywriting**：用于撰写定价页面文案
- **marketing-psychology**：用于应用定价心理学原则
- **ab-testing**：用于测试定价调整
- **revops**：用于交易审批流程和销售管道定价
- **sales-enablement**：用于提案模板和定价演示文稿