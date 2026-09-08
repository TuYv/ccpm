---
name: growth
description: "Use this skill when the user needs to design a product-led growth strategy, build viral loops, improve activation metrics, or reduce churn. Covers PLG funnels, activation metrics, viral mechanics, retention strategies, and growth systems."
---
# 增长与产品驱动增长

在 PLG 模式下，产品就是你最好的销售员。这项技能帮助你把增长设计进产品——并提供可直接交给 Claude Code 的具体战术和提示词。

## 核心原则

- 增长是一套系统，而不是投机取巧。要构建循环，而不是一次性的营销活动。
- 激活是最重要的指标。从未体验到价值的用户其实已经流失了。
- 病毒式传播是设计出来的，不是偶然发生的。要把分享设计进产品里。
- 留存是根基。在漏水的桶上做增长是一场注定失败的游戏。
- 对于独立创始人：只选一个增长杠杆，让它跑通，然后再加下一个。

---

## PLG 漏斗

获客 → 激活 → 留存 → 收入 → 推荐

**最常见的错误：** 创始人首先关注获客。应该首先关注激活和留存——把注册用户引向一个漏水的桶毫无意义。

---

## 激活（从这里开始）

### 定义你的 Aha 时刻

用户首次体验到核心价值的具体动作：

| 产品类型 | 示例 Aha 时刻 |
|-------------|-------------------|
| 项目管理 | 创建了第一个项目 + 添加了一个任务 |
| 邮件工具 | 发送了第一个营销活动 |
| 数据分析 | 看到了第一个带有真实数据的仪表盘 |
| 设计工具 | 导出了第一个设计 |
| 日程安排 | 通过工具预订了第一次会议 |

**你的 Aha 时刻：** [让用户说出"我懂了，这真的有用"的动作]

### 快速引导用户达成 Aha

注册与 Aha 时刻之间的每一个页面都是流失风险。

**告诉 AI：**
```
Design the onboarding flow to get users to [your aha moment] in under 3 minutes:
1. After signup, skip the "check your email" screen — go directly to the product
2. Show a setup wizard (3-5 steps max) that collects only what's needed to deliver value
3. Pre-populate with sample data or templates so the product looks useful immediately
4. Add a progress checklist: "Complete your setup: ☑ Create [X] ☐ [Next step] ☐ [Final step]"
5. Show an empty state with a clear CTA on every empty page ("Create your first [X]")
```

### 激活邮件

将产品内引导与一套 5 封邮件的欢迎序列搭配使用，以推动尚未激活的用户。完整的欢迎序列模板（每封邮件均附可直接粘贴的文案）请参见 **email** 技能。

---

## 获客策略

选择一个与你产品匹配的策略。不要在所有策略上分散精力。

| 策略 | 最适合 | 投入 | 见效时间 |
|----------|----------|--------|-----------------|
| 免费工具 / 计算器 | 解决可量化问题的产品 | 中 | 1-3 个月 |
| 模板库 | 输出结果可定制的产品 | 中 | 2-4 个月 |
| 内容即产品 | 处于信息密集领域的产品 | 高 | 3-6 个月 |
| 社区驱动 | 拥有狂热小众用户群的产品 | 高 | 3-6 个月 |
| 集成 | 需要与其他工具连接的产品 | 中 | 每个集成 1-2 个月 |
| 免费增值 | 免费使用能带动口碑传播的产品 | 低 | 立即（但增长缓慢） |

**告诉 AI：**
```
Build a [free tool / template gallery / calculator] that:
- Solves a specific problem our ICP has (related to our product)
- Requires no signup to use
- Shows a teaser of our full product's value
- Includes a CTA: "Want more? [Product name] does this automatically."
- Is SEO-optimized so it attracts organic traffic
```

---

## 病毒式循环设计

病毒式循环包含 4 个环节：用户获得价值 → 有了分享的理由 → 新用户看到价值 → 完成转化 → 循环往复。

### SaaS 的病毒式机制

| 机制 | 原理 | 示例 |
|----------|-------------|---------|
| 协作邀请 | 产品需要多名用户 | "邀请你的团队来编辑这个" |
| 共享产出 | 用户创建可分享的内容 | 带有"Made with [Product]"标识的报告、链接、仪表盘 |
| 推荐奖励 | 带有激励的邀请 | "送 $20，得 $20" |
| 公开页面 | 用户内容可被 SEO 索引 | 公开个人主页、作品集、页面 |
| 嵌入式组件 | 用户网站上的挂件反向链接 | 徽章、聊天挂件、表单 |

**告诉 AI：**
```
Add a sharing/invite mechanic to our product:
- After a user completes [key action], prompt: "Share this with your team" or "Invite a collaborator"
- Make shared links show a preview of the output (not just a signup page)
- Add "Made with [Product]" branding on shared/public outputs with a link to our homepage
- Track invite sends, invite accepts, and invite-to-signup conversion
```

---

## 留存机制

### 构建习惯回路

| 组成部分 | 是什么 | 示例 |
|-----------|-----------|---------|
| 触发器 | 促使用户回来的因素 | 邮件摘要、通知、日历事件 |
| 行动 | 用户在产品中做的事 | 查看仪表盘、回复评论、更新状态 |
| 奖励 | 用户获得的价值 | 新洞察、进度指示、完成的任务 |
| 投入 | 让离开变得更难的因素 | 更多数据、更多连接、更多历史记录 |

**告诉 AI：**
```
Build retention mechanics into the product:
1. Weekly email digest: summarize what happened this week + one insight or action item
2. Activity notifications: "[Name] commented on your [item]" — not time-based ("It's been 3 days")
3. Progress indicators: Show users their cumulative value ("You've saved 14 hours this month")
4. Data investment: The more they use it, the more valuable their data becomes (history, reports, trends)
```

### 功能渐进释放

不要在第 1 天就展示所有功能。在用户准备就绪时再逐步揭示功能：

**告诉 AI：**
```
Implement progressive feature disclosure:
- Week 1: Show only core features (the ones needed for the aha moment)
- Week 2: Surface advanced feature with a tooltip: "Now that you've [done X], try [advanced feature]"
- Week 3+: Unlock remaining features with brief explanations
- Gate premium features with a gentle upgrade prompt at the moment of need
```

---

## 需要追踪的指标

在你的分析工具中设置这些指标（参见 analytics-instrumentation 技能）：

| 阶段 | 关键指标 | 计算方式 |
|-------|-----------|-----------------|
| 获客 | 注册率 | 访客 → 注册用户 |
| 激活 | 激活率 | 注册用户 → 完成 Aha 时刻 |
| 激活 | 到达 Aha 的时长 | 从注册到关键动作的平均小时数/天数 |
| 留存 | D1/D7/D30 | 第 1、7、30 天回访用户的百分比 |
| 收入 | 免费转付费 | 免费用户 → 付费用户 |
| 推荐 | 病毒系数 | 发出的邀请数 × 邀请转化率 |

**告诉 AI：**
```
Set up growth tracking:
- Track signup events with source attribution (organic, paid, referral, direct)
- Track [aha moment action] completion with timestamp
- Calculate time-to-activate for each user
- Build a daily dashboard showing: signups, activations, D7 retention, free-to-paid conversion
- Alert me if activation rate drops below [X]% or D7 retention drops below [Y]%
```

---

## 增长实验

当你想改进某个指标时，将其表述为一个假设：

1. **假设：** "如果我们[做出改变]，那么[指标]将[改善]，因为[原因]。"
2. **指标：** 你具体要测量什么？
3. **周期：** 至少运行 1-2 周，或直到有 100+ 用户走过该流程。
4. **决策：** 指标有改善吗？选择上线或回滚。
5. **记录：** 把你学到的东西写下来，即使是（尤其是）来自失败的。

关于 A/B 测试的设置、实施和结果解读，请参见 **conversion** 技能的 A/B 测试部分。

---

## 常见错误

| 错误 | 解决办法 |
|---------|-----|
| 在激活之前就专注获客 | 先解决激活——把用户引向一个坏掉的引导流程毫无意义 |
| 构建没人使用的病毒式功能 | 病毒式循环必须是核心工作流的一部分，而不是附加的边角功能 |
| 测量虚荣指标（注册量） | 追踪激活率和留存率，而不只是注册量 |
| 同时尝试所有渠道 | 只选一个，让它跑通，然后再加下一个 |
| 复杂的 A/B 测试基础设施 | 使用简单的功能开关。只有 100 个用户时你不需要 Optimizely |

---

## 相关技能

- **conversion** — 漏斗优化、A/B 测试以及注册流程转化率优化
- **email** — 推动激活的欢迎序列和生命周期邮件
- **analytics** — 搭建支撑增长指标的追踪体系
- **retention** — 流失预防与用户挽回深度指南
- **pricing** — 定价层级与扩张收入机制
