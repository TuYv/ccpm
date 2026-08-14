---
name: paywalls
description: When the user wants to create or optimize in-app paywalls, upgrade screens, upsell modals, or feature gates. Also use when the user mentions "paywall," "upgrade screen," "upgrade modal," "upsell," "feature gate," "convert free to paid," "freemium conversion," "trial expiration screen," "limit reached screen," "plan upgrade prompt," "in-app pricing," "free users won't upgrade," "trial to paid conversion," or "how do I get users to pay." Use this for any in-product moment where you're asking users to upgrade. Distinct from public pricing pages (see cro) — this focuses on in-product upgrade moments where the user has already experienced value. For pricing decisions, see pricing.
metadata:
  version: 2.0.0
---
# 付费墙和升级页面 CRO

你是应用内付费墙和升级流程方面的专家。你的目标是在用户已经体验到足够的价值、足以证明付费承诺合理的时机，将免费用户转化为付费用户，或推动用户升级到更高等级的方案。

## 初步评估

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，再或者旧版配置中使用的旧文件名 `product-marketing-context.md`），请在提问之前阅读它。利用其中的上下文，只询问尚未涵盖的信息或此任务特有的信息。

在提供建议之前，了解以下内容：

1. **升级情境** - 免费增值 → 付费？试用 → 付费？方案等级升级？功能追加销售？用量限制？

2. **产品模式** - 哪些内容免费？哪些内容位于付费墙之后？什么会触发提示？当前转化率是多少？

3. **用户旅程** - 该页面何时出现？用户已经体验了什么？他们正在尝试做什么？

---

## 核心原则

### 1. 先提供价值，再提出付费
- 用户应当已经体验过真正的价值
- 升级应当让人感觉是自然而然的下一步
- 时机：在“顿悟时刻”之后，而不是之前

### 2. 展示，而不只是说明
- 展示付费功能的价值
- 预览他们错过了什么
- 让升级带来的收益变得具体可感

### 3. 无摩擦路径
- 当用户准备好时，可以轻松升级
- 不要让他们费力寻找定价信息

### 4. 尊重拒绝
- 不要困住或逼迫用户
- 让用户可以轻松继续使用免费版
- 维持信任，为未来的转化保留机会

---

## 付费墙触发点

### 功能门槛
当用户点击仅限付费用户使用的功能时：
- 清楚说明该功能为何需要付费
- 展示该功能的用途
- 提供快速解锁路径
- 提供不升级并继续使用的选项

### 用量限制
当用户达到用量上限时：
- 清楚表明已达到限制
- 展示升级能够获得什么
- 不要突然阻止用户操作

### 试用期结束
当试用期即将结束时：
- 提前提醒（7 天、3 天、1 天）
- 清楚说明到期后会发生什么
- 总结用户已经获得的价值

### 基于时间的提示
免费使用 X 天后：
- 温和地提醒用户升级
- 突出展示尚未使用的付费功能
- 可以轻松关闭

---

## 付费墙页面组件

1. **标题** - 聚焦用户能够获得什么：“解锁[功能]以实现[收益]”

2. **价值展示** - 预览、前后对比、“使用专业版，你可以……”

3. **功能对比** - 突出关键差异，并标明当前方案

4. **定价** - 清晰、简单，提供年度与月度选项

5. **社会认同** - 客户评价、“已有 X 个团队在使用”

6. **行动号召** - 具体且以价值为导向：“开始获得[收益]”

7. **退出选项** - 清晰的“暂不升级”或“继续使用免费版”

---

## 具体付费墙类型

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

### 用量限制付费墙
```
You've reached your free limit

[Progress bar at 100%]

Free: 3 projects | Pro: Unlimited

[Upgrade to Pro]  [Delete a project]
```

### 试用期到期付费墙
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

## 展示时机与频率

### 何时展示
- 在用户感受到价值之后、产生挫败感之前
- 在用户完成激活或出现“顿悟时刻”之后
- 当用户真正触及限制时

### 何时不应展示
- 在新用户引导期间（为时过早）
- 当用户正沉浸于操作流程时
- 用户关闭后反复展示

### 频率规则
- 限制每个会话中的展示次数
- 用户关闭后设置冷却期（以天而非小时计）
- 追踪用户的厌烦信号

---

## 升级流程优化

### 从付费墙到付款
- 尽量减少步骤
- 尽可能保持在当前情境中完成
- 预填已知信息

### 升级后
- 立即开放功能访问权限
- 提供确认信息和收据
- 引导用户了解新功能

---

## A/B 测试

### 测试内容
- 触发时机
- 标题/文案变体
- 价格呈现方式
- 试用期长度
- 功能侧重点
- 设计/布局

### 追踪指标
- 付费墙展示率
- 升级点击率
- 完成率
- 每用户收入
- 升级后的流失率

**有关全面的实验创意**：请参阅 [references/experiments.md](references/experiments.md)

---

## 应避免的反模式

### 黑暗模式
- 隐藏关闭按钮
- 令人困惑的套餐选择
- 使用让用户产生负罪感的文案

### 转化杀手
- 在用户感受到价值之前提出升级要求
- 提示过于频繁
- 阻断关键流程
- 升级流程过于复杂

---

## 特定任务问题

1. 你目前的免费 → 付费转化率是多少？
2. 目前由什么条件触发升级提示？
3. 哪些功能位于付费墙之后？
4. 用户的“顿悟时刻”是什么？
5. 采用什么定价模式？（按席位、按用量、固定价格）
6. 是移动应用、Web 应用，还是两者都有？

---

## 相关技能

- **churn-prevention**：用于取消流程、挽留优惠，以及减少升级后的用户流失
- **cro**：用于优化公开定价页面
- **onboarding**：用于在升级前推动用户达到顿悟时刻
- **ab-testing**：用于测试付费墙变体