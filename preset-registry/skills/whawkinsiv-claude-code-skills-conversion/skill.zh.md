---
name: conversion
description: "Use this skill when the user needs to improve conversion rates, reduce funnel drop-off, optimize signup flows, or increase trial-to-paid conversion. Covers funnel analysis, friction reduction, behavioral psychology, social proof, and A/B testing strategies."
---
# 转化率优化

每个页面只有一个任务。如果你说不清这个任务是什么，那这个页面就是失败的。本技能帮你找到用户流失的位置并加以修复。

## 核心原则

- 摩擦是敌人。每个字段、每次点击、每个决策点都在消耗转化率。
- 不要猜——去测量。但也不要测量一切——只测量能带来收入的东西。
- 社会认同是 SaaS 中最被低估的转化杠杆。
- 速度本身就是一项功能。每 100ms 的加载时间会损失约 1% 的转化率。
- 最好的优化往往是做减法，而不是做加法。

---

## 找到你最大的瓶颈

在优化之前，先找出用户究竟在哪里流失。

### 第 1 步：绘制漏斗

```
Typical SaaS funnel:
  Landing page visit → Signup page viewed → Account created →
  Onboarding started → Key action completed → Returned next week →
  Upgrade page viewed → Subscription created
```

### 第 2 步：测量流失率

**告诉 AI：**
```
Analyze our conversion funnel:
- Pull the number of users at each step: [list your funnel steps]
- Calculate the drop-off % between each step
- Identify the step with the biggest drop-off — that's our priority
- Show results in a table: Step | Users | Drop-off %
```

**如果你还没有分析数据：**先搭建好（参见 analytics-instrumentation 技能）。在此期间，手动追踪：统计注册数、激活数、付费客户数。即使是粗略的数字也能揭示最大的流失点。

### 第 3 步：诊断原因

针对流失最严重的环节，用以下框架评估该页面/流程：

1. **清晰度：**用户知道要做什么、为什么做吗？
2. **动机：**完成这一步的价值显而易见吗？
3. **摩擦：**是什么让这一步变得比实际需要的更难？
4. **焦虑：**哪些顾虑或异议可能会让用户停下脚步？
5. **干扰：**哪些元素在与主操作争夺注意力？

---

## 注册与账号创建

- 尽量减少字段数。邮箱 + 密码最理想。仅邮箱或 SSO 更佳。
- 其他一切（公司名称、职位、团队规模）都推迟到引导流程中。
- 在用户输入之前就展示密码要求，而不是等他们输入失败之后。
- 如果你的受众使用社交登录（Google、GitHub），应让它在视觉上足够醒目。
- 注册之后，直接进入价值环节——而不是走进“请查收邮件”的死胡同。

**告诉 AI：**
```
Simplify our signup flow:
- Reduce to email + password (or email-only with magic link)
- Add Google Sign-In as the most prominent option
- After signup, redirect directly to onboarding (not "check your email")
- Defer all profile questions (name, company, role) to later
```

---

## 定价页优化

- 始终包含一个推荐/高亮的档位。
- 默认展示年度定价，月付作为切换选项。
- 使用价格锚定：先展示最贵的方案，或突出中间档位。
- 对犹豫不决的用户，“永久免费”比“免费试用”转化效果更好。
- 添加常见问题区：“可以随时取消吗？”、“我的数据会怎样？”、“有开通费吗？”

**告诉 AI：**
```
Optimize our pricing page:
- Highlight the recommended tier with a visual badge ("Most Popular")
- Default to annual pricing (show monthly as toggle)
- Add a comparison table showing features by tier
- Add FAQ section below pricing addressing common objections
- Add social proof near the CTA: "[X] teams already use [Product]"
```

---

## 试用转付费

- **反向试用：**先给完整权限，再降级——用户会产生损失厌恶。
- 展示用量与套餐限额的对比：“本月您已使用 1,000 次 API 调用中的 847 次。”
- 在价值产生的时刻触发升级提示，而不是靠定时器。
- 把限额表述为成长：“您的团队在壮大！升级以添加无限成员。”

**告诉 AI：**
```
Improve trial-to-paid conversion:
- Show usage meters on the dashboard: "X of Y [resource] used"
- When user hits 80% of a limit, show a gentle prompt: "You're growing! Upgrade for unlimited [resource]"
- 3 days before trial ends, show banner: "Your trial ends [date]. Keep everything by upgrading."
- After trial ends, downgrade features but keep their data intact
```

---

## 表单优化

- 多步表单比单个长表单转化率高出 20-40%。
- 展示进度：“第 2 步，共 3 步”
- 从简单/有趣的问题开始（而不是姓名/邮箱）。
- 使用智能默认值：预先选中最常见的选项。
- 失焦时进行行内校验。为已完成的字段显示对勾。

**告诉 AI：**
```
Convert our [signup/onboarding] form to multi-step:
- Step 1: The easiest, most engaging question
- Step 2: The information we need to deliver value
- Step 3: Account details (email, password)
- Add progress indicator ("Step 2 of 3")
- Validate inline on blur with green checkmarks
- Use appropriate input types (email, tel, number) for mobile keyboards
```

---

## 行为触发点

| 触发点 | 如何使用 |
|---------|--------------|
| **损失厌恶** | “您的免费试用还剩 3 天” > “立即升级” |
| **社会认同** | “本月已有 4,200 个团队注册” |
| **锚定效应** | 展示“之前”（手动、缓慢）与“之后”（使用你的产品）的对比 |
| **承诺/一致性** | 小的同意 → 大的同意。免费工具 → 注册 → 付费。 |
| **稀缺性（诚实使用）** | “本期仅剩 3 个名额”（仅在属实时使用） |

**告诉 AI：**
```
Add social proof and behavioral triggers to our [signup/pricing/landing] page:
- Add a live counter or recent activity: "[X] teams signed up this month"
- Add testimonial quotes near the CTA
- Add trust badges near payment forms (SSL, money-back guarantee)
- Frame the CTA as low-commitment: "Start free — no credit card required"
```

---

## A/B 测试（简易版）

你不需要复杂的测试基础设施。以下是为自举型创始人准备的做法：

### 何时进行 A/B 测试

- 每周至少有 100 个用户经过该流程
- 你有一个具体的假设，而不只是“我们换个东西试试”
- 改动足够大、会产生实质影响（按钮颜色无关紧要；标题文案才重要）

### 如何运行测试

**告诉 AI：**
```
Set up a simple A/B test:
- Create a feature flag that splits users 50/50
- Variant A: [current version]
- Variant B: [proposed change]
- Track [conversion event] for both variants
- Run until we have 100+ users per variant (or 2 weeks, whichever is longer)
- Show me the conversion rate for each variant
```

### 解读结果

- **差异 >20%：**很可能是真实效果。上线胜出版本。
- **差异 5-20%：**可能是真实效果。延长测试时间或增加测试用户数。
- **差异 <5%：**很可能只是噪声。要么改动无关紧要，要么你的测试需要更大流量。

**规则：**不要每天偷看结果并提前终止。事先定好周期并坚持执行。

---

## 应该测量什么

| 指标 | 它能告诉你什么 |
|--------|------------------|
| 注册率（访客 → 账号） | 你的落地页是否有说服力？ |
| 激活率（账号 → 关键操作） | 你的引导流程是否有效？ |
| 试用转付费率 | 你的产品是否提供了足够的价值？ |
| 价值实现时间 | 用户多快能达到“顿悟”时刻？ |
| 扩展收入触发点 | 什么行为出现在升级之前？ |

---

## 常见错误

| 错误 | 修正方法 |
|---------|-----|
| 优化低流量页面 | 把精力集中在漏斗中流量最大的环节 |
| 对按钮颜色做 A/B 测试 | 改为测试标题、CTA 和页面结构 |
| “为了收集数据”而添加更多字段 | 每个字段都在消耗转化率。推迟到以后再问。 |
| 忽视移动端 | 50% 以上的流量来自移动设备。优先在移动端测试。 |
| 小规模时使用复杂测试工具 | 在每周用户超过 1,000 人之前，功能开关就足够了 |

---

## 相关技能

- **growth** — PLG 策略、激活与病毒式传播循环
- **landing-page** — 构建并优化带来转化的页面
- **pricing** — 定价页优化与档位设计
- **analytics** — 追踪漏斗指标并衡量实验效果
- **copywriting** — 撰写能带来转化的 CTA 和标题
