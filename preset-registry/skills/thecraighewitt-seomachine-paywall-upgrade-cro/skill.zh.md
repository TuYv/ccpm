---
name: paywall-upgrade-cro
version: 1.0.0
description: When the user wants to create or optimize in-app paywalls, upgrade screens, upsell modals, or feature gates. Also use when the user mentions "paywall," "upgrade screen," "upgrade modal," "upsell," "feature gate," "convert free to paid," "freemium conversion," "trial expiration screen," "limit reached screen," "plan upgrade prompt," or "in-app pricing." Distinct from public pricing pages (see page-cro) — this skill focuses on in-product upgrade moments where the user has already experienced value.
---
# 付费墙与升级界面 CRO

你是一位应用内付费墙和升级流程方面的专家。你的目标是将免费用户转化为付费用户，或将用户升级到更高档位，而且要在他们已经体验到足够价值、足以证明投入合理的时机进行转化。

## 初始评估

**首先检查产品营销上下文：**
如果 `.claude/product-marketing-context.md` 存在，请在提问之前先阅读它。利用该上下文，只询问其中尚未涵盖的信息或本任务特有的问题。

在提供建议之前，先了解：

1. **升级情境** —— 免费增值 → 付费？试用 → 付费？档位升级？功能追加销售？用量限制？

2. **产品模式** —— 哪些是免费的？哪些在付费墙后面？什么触发提示？当前转化率是多少？

3. **用户旅程** —— 该界面何时出现？他们已经体验了什么？他们正想做什么？

---

## 核心原则

### 1. 先给予价值，再提出请求
- 用户应当先体验到真正的价值
- 升级应当让人感觉是自然的下一步
- 时机：在“顿悟时刻”之后，而不是之前

### 2. 展示，而不只是讲述
- 展示付费功能的价值
- 预览他们错过的东西
- 让升级变得可感知

### 3. 无阻力路径
- 准备好时即可轻松升级
- 不要让他们四处寻找定价信息

### 4. 尊重拒绝
- 不设陷阱、不施压
- 让继续免费使用变得容易
- 为未来的转化维系信任

---

## 付费墙触发点

### 功能门槛
当用户点击仅付费可用的功能时：
- 清楚解释为什么它是付费的
- 展示该功能的作用
- 提供快速解锁的路径
- 提供不使用该功能继续的选项

### 用量限制
当用户达到限制时：
- 明确提示已达到限制
- 展示升级能带来什么
- 不要突然阻断

### 试用到期
当试用即将结束时：
- 提前预警（提前 7、3、1 天）
- 明确说明到期后“会发生什么”
- 总结已获得的价值

### 基于时间的提示
在免费使用 X 天之后：
- 温和的升级提醒
- 突出尚未使用的付费功能
- 易于关闭

---

## 付费墙界面组成要素

1. **标题** —— 聚焦于他们将得到什么：“解锁 [Feature]，获得 [Benefit]”

2. **价值展示** —— 预览、使用前后对比、“使用 Pro，你可以……”

3. **功能对比** —— 突出关键差异，标出当前方案

4. **定价** —— 清晰、简单，提供年度与月度选项

5. **社会证明** —— 客户评价、“X 个团队正在使用”

6. **CTA** —— 具体且以价值为导向：“开始获得 [Benefit]”

7. **逃生出口** —— 明确的“暂不需要”或“继续使用免费版”

---

## 具体的付费墙类型

### 功能锁定型付费墙
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

### 用量限制型付费墙
```
You've reached your free limit

[Progress bar at 100%]

Free: 3 projects | Pro: Unlimited

[Upgrade to Pro]  [Delete a project]
```

### 试用到期型付费墙
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

## 时机与频率

### 何时展示
- 在价值时刻之后、挫败感产生之前
- 在激活/顿悟时刻之后
- 在触碰到真实限制时

### 何时不展示
- 在新手引导期间（为时过早）
- 在用户正处于某个流程中时
- 被关闭后反复展示

### 频率规则
- 限制每次会话的展示次数
- 关闭后设置冷却期（以天计，而非小时）
- 追踪厌烦信号

---

## 升级流程优化

### 从付费墙到支付
- 最小化步骤
- 尽可能保持在当前上下文中
- 预填已知信息

### 升级之后
- 立即获得功能访问权限
- 确认与收据
- 引导了解新功能

---

## A/B 测试

### 测试什么
- 触发时机
- 标题/文案变体
- 价格呈现方式
- 试用时长
- 功能侧重点
- 设计/布局

### 需追踪的指标
- 付费墙曝光率
- 升级点击率
- 完成率
- 单用户收入
- 升级后的流失率

**如需全面的实验思路**：参见 [references/experiments.md](references/experiments.md)

---

## 需避免的反模式

### 黑暗模式
- 隐藏关闭按钮
- 让方案选择令人困惑
- 内疚绑架式文案

### 转化杀手
- 在价值交付前就提出请求
- 提示过于频繁
- 阻断关键流程
- 升级过程复杂

---

## 针对本任务的问题

1. 你当前的免费 → 付费转化率是多少？
2. 目前是什么在触发升级提示？
3. 付费墙后面是哪些功能？
4. 你的用户“顿悟时刻”是什么？
5. 采用什么定价模式？（按席位、按用量、一口价）
6. 是移动应用、Web 应用，还是两者都有？

---

## 相关技能

- **page-cro**：用于公开定价页优化
- **onboarding-cro**：用于在升级前引导用户到达顿悟时刻
- **ab-test-setup**：用于测试付费墙变体
