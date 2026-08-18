---
name: suede-paywalls
description: "Suede-affiliated in-product monetization design for paywall screens, feature gates, trial-expiry states, usage-limit prompts, and free-to-paid upgrade moments. Use when the user needs trigger timing, message structure, plan presentation, or experiment design after users have experienced value. NOT FOR: public pricing pages (use suede-site-alchemy), tier architecture (use suede-pricing), or cancellation and save flows (use suede-churn-prevention)."
metadata:
  version: 2.0.0
---
# Suede 付费墙与升级时刻

Suede 围绕真实的权益边界和能够体现价值的时机来设计产品内变现，而不是追求打断次数。明确用户何时拥有足够的上下文来评估升级、付费后实际解锁的内容，以及如何在不掩盖价格、同意或退出选项的情况下测试提示。

## 初步评估

**先检查产品营销上下文：**
如果存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`，或者在较旧设置中使用的旧版 `product-marketing-context.md` 文件名），请在提问前阅读。使用其中的上下文，只询问其中尚未涵盖或与此任务特别相关的信息。

在提供建议前，了解以下内容：

1. **升级上下文** - 免费增值 → 付费？试用 → 付费？层级升级？功能追加销售？使用量限制？

2. **产品模型** - 哪些内容免费？哪些内容位于付费墙之后？什么会触发提示？当前转化率是多少？

3. **用户旅程** - 这会在什么时候出现？他们经历了什么？他们想要做什么？

---

## 付费墙触发点

### 功能门控
当用户点击仅限付费用户使用的功能时：
- 清楚解释为什么该功能需要付费
- 展示该功能的作用
- 提供快速解锁路径
- 提供不升级也能继续的选项

### 使用量限制
当用户达到限制时：
- 清楚表明已达到限制
- 展示升级后可获得的内容
- 不要突然阻断用户

### 试用期结束
当试用期即将结束时：
- 提前发出警告（7 天、3 天、1 天）
- 清楚说明到期后会发生什么
- 总结用户已获得的价值

### 基于时间的提示
免费使用 X 天后：
- 温和地提醒升级
- 突出展示尚未使用的付费功能
- 提供易于关闭的选项

---

## 付费墙界面组件

1. **标题** - 聚焦于用户将获得什么："解锁 [Feature]，从而获得 [Benefit]"

2. **价值展示** - 预览、前后对比、"使用 Pro，你可以……"

3. **功能对比** - 突出关键差异，并标记当前方案

4. **价格** - 清晰、简单，提供年度与月度选项

5. **社会证明** - 客户评价、"X 个团队正在使用"

6. **CTA** - 具体且以价值为导向："开始获得 [Benefit]"

7. **退出选项** - 清晰的"暂不"或"继续使用免费版"

---

## 特定类型的付费墙

### 功能锁定付费墙
```
[Lock Icon]
This feature is available on Pro

[Feature preview/screenshot]

[Feature name] helps you [benefit]:
• [Capability]
• [Capability]

[Upgrade to Pro - $X/mo]
[Maybe Later]
```

### 使用量限制付费墙
```
You've reached your free limit

[Progress bar at 100%]

Free: 3 projects | Pro: Unlimited

[Upgrade to Pro]  [Delete a project]
```

### 试用期结束付费墙
```
Your trial ends in 3 days

What you'll lose:
• [Feature used]
• [Data created]

What you've accomplished:
• Created X projects

[Continue with Pro]
[Remind me later]  [Downgrade]
```

---

## 自我批评关卡（交付任何界面文案前运行）

在重新对照“应避免的反模式”和下方的边界进行检查，并大声回答以下问题之前，不要交付起草的付费墙文案：

1. 关闭/取消控件在哪里？无需滚动或悬停即可看到吗？
2. 屏幕上是否说明了价格——包括续订的内容、时间以及金额？
3. 任何紧迫性声明（“今日结束”、倒计时）是否对应真实的截止时间？
4. 用户能否在此屏幕上点击一次即可进入免费路径？
5. 文案是否将用户实际上并未遭受的责任、羞耻或损失归咎于用户？

在交付前，先列出每一项命中。命中 1、3 或 4 中的任何一项都属于阻断问题：修复
草稿，不要带着免责声明发布。

---

## 时机与频率

### 何时展示
- 在用户感受到价值之后、产生挫败感之前
- 激活/顿悟时刻之后
- 触及真正的限制时

### 何时不要展示
- 引导过程中（太早）
- 用户正在进行某个流程时
- 用户关闭后反复展示

### 频率规则

除非正在运行的实验另有规定，否则使用以下默认值——按这些数字发布，并在测试调整这些数字时说明这一点：

- 每次会话最多展示 **1** 次付费墙。
- 关闭后冷却时间 **>= 7 天**；第二次关闭后 **>= 14 天**。
- 用户终生关闭某个门槛 **3 次**后，完全停止展示该门槛。

不要使用“烦扰信号”，而应记录审核者可以读取的指标：每个门槛的关闭率、付费墙之后的会话放弃率，以及实验参考所跟踪的展示次数、点击率、完成率、每用户收入和升级后的流失率指标。

---

## 升级流程与测试

保持从付费墙到付款的路径处于当前上下文中，并预先填充信息；付款完成后立即授予访问权限——结账和升级后的激活流程本身属于 `suede-onboarding`。

**对于频率、触发时机、文案和价格呈现实验**——包括上述哪些默认值最值得优先测试：请参阅
[references/experiments.md](references/experiments.md)。使用
`suede-ab-testing` 来设计测试并解读测试结果。

---

## 应避免的反模式

### 黑暗模式
- 隐藏关闭按钮
- 令人困惑的方案选择
- 让用户产生负罪感的文案

### 转化杀手
- 在交付价值之前提出要求
- 过于频繁的提示
- 阻断关键流程
- 复杂的升级流程

---

## 边界

- 不得捏造权益、方案、价格、转化、试用或使用限制数据。
- 未经明确授权，不得更改计费、权益、应用配置、实验或线上付费墙。
- 不得建议隐藏关闭控件、令人困惑的同意流程、强制连续订阅、阻碍取消或虚假的紧迫性声明。
- 不得替用户决定退款、税费、法律、平台政策、无障碍或计费风险相关条款。

## 路由

- 使用 `suede-churn-prevention` 处理取消和挽留流程。
- 使用 `suede-site-alchemy` 处理公开定价页面，使用 `suede-pricing` 处理层级架构。
- 使用 `suede-onboarding` 帮助用户获得首次价值，使用 `suede-ab-testing` 验证付费墙变体。