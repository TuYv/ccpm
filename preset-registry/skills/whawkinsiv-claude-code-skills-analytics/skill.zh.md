---
name: analytics
description: "Use this skill when the user needs to set up analytics, design event tracking, define key metrics, build funnels, or instrument their SaaS product for data-driven decisions. Covers event naming conventions, tracking strategy, funnel analytics, and data quality."
---
# 分析与数据埋点

追踪决策，而非仪表盘。这个技能帮你搭建能够回答关键问题的分析体系——而不是淹没在数据海洋里。

## 核心原则

- 每个指标都应该关联到一项你会根据结果而改变做法的行动。
- 在构建阶段就完成事件埋点，而不是事后补充。这样做要轻松 10 倍。
- 更多数据 ≠ 更好的决策。每个阶段专注于 5-10 个关键指标。
- 数据质量比数据数量更重要。一个干净的漏斗胜过五十个坏掉的漏斗。

---

## 选择分析工具

追踪事件不需要写代码。选一个工具、加上代码片段、然后在界面中配置即可。

### 按阶段推荐

| 阶段 | 工具 | 理由 | 费用 |
|-------|------|-----|------|
| 获得收入前 | **PostHog** | 产品分析、漏斗、会话回放。专为 SaaS 打造。 | 免费（每月 100 万事件） |
| 获得收入前 | **Plausible** | 简单、隐私优先的流量分析。 | $9/月 |
| $0-5K MRR | **PostHog** 或 **Mixpanel** | 更深入的漏斗分析、同期群留存 | 免费额度或约 $200/月 |
| $5K+ MRR | **Amplitude** 或 **Heap** | 高级分析、实验功能 | $500+/月 |

**给独立创始人的建议：** 从 **PostHog**（免费档）开始。它涵盖产品分析、漏斗、会话录制和功能开关——这些你都会用到。

如果只需要基础的流量分析（访客来自哪里），可以加上 **Plausible** 或 **Google Analytics 4**（免费）。

### 设置

**告诉 AI：**
```
Set up PostHog analytics:
1. Create a PostHog project and get the API key
2. Add the PostHog JavaScript snippet to our app (in the <head> or layout component)
3. Verify it's tracking page views by checking the PostHog dashboard
4. Configure: exclude admin/test accounts from tracking
```

---

## 该追踪什么（按阶段）

### 上线前（只需这 3 项）
1. 落地页访问（流量来源）
2. 候补名单/注册转化
3. 访客在哪里流失

### 0-$1K MRR（增加这些）
4. 注册 → 激活率（完成关键操作）
5. 激活耗时（从注册到完成关键操作的小时数）
6. D7 留存（1 周后回访的比例）
7. 免费 → 付费转化

### $1K-$10K MRR（增加这些）
8. 功能采用率（每周使用各功能的用户比例）
9. 同期群留存曲线（跟踪每个月注册用户随时间的变化）
10. 扩展收入触发点（升级前出现了什么行为）
11. 流失率及流失原因

---

## 事件命名规范

使用一致的命名规则，让任何阅读这些事件的人都能看懂。

**格式：** [对象] [动作]，用过去时，每个单词首字母大写（Title Case）。

| 事件名 | 触发时机 |
|------------|--------------|
| Signup Form Submitted | 用户完成注册 |
| Project Created | 用户创建第一个/任意项目 |
| Dashboard Viewed | 用户访问主仪表盘 |
| Report Exported | 用户下载或分享报告 |
| Subscription Upgraded | 用户升级到更高档套餐 |
| Invite Sent | 用户邀请队友 |

**规则：**
- 对象在前、动作在后（便于在工具中分组）
- 使用过去时（事件已经发生）
- 要具体：用 "Signup Form Submitted" 而不是 "Form Submitted"
- 永远不要在事件名中包含个人数据

### 事件属性

每个事件都应包含上下文：

```
"Project Created"
  template_used: "blank" | "marketing" | "engineering"
  source: "dashboard" | "onboarding" | "api"

"Subscription Upgraded"
  from_plan: "free"
  to_plan: "pro"
  billing_period: "annual"
  trigger: "usage_limit" | "feature_gate" | "self_serve"
```

**告诉 AI：**
```
Set up event tracking for our core funnel:
- Track these events: [list your key events from the table above]
- Include these properties with each event: [relevant properties]
- Set user-level properties on identify: plan, signup_date, role
- Verify events are firing correctly in PostHog/Mixpanel
```

---

## 核心指标框架

### 最重要的 5 个指标

| 指标 | 它能告诉你什么 | 计算方式 |
|--------|------------------|-----------------|
| **注册率** | 你的营销有效吗？ | 访客 → 注册用户 |
| **激活率** | 你的引导流程有效吗？ | 注册用户 → 完成关键操作 |
| **D7 留存** | 你的产品能持续提供价值吗？ | 7 天后回访的用户比例 |
| **免费转付费** | 你的产品值得付费吗？ | 免费用户 → 付费用户 |
| **MRR** | 你的业务在增长吗？ | 所有月度订阅收入之和 |

### 搭建你的仪表盘

**告诉 AI：**
```
Create an analytics dashboard with these 5 charts:
1. Daily signups (line chart, last 30 days, by source)
2. Activation rate (% of signups who [completed key action], last 30 days)
3. D7 retention (% of each week's signups who returned 7 days later)
4. Free-to-paid conversion rate (last 30 days)
5. MRR (line chart, all time)

This should be the first thing I see when I open analytics.
```

---

## 漏斗埋点

定义你的核心漏斗，并追踪每一个步骤：

```
Typical SaaS funnel:
  1. Landing Page Viewed
  2. Signup Form Viewed
  3. Signup Form Submitted
  4. Onboarding Started
  5. [Key Activation Action] Completed
  6. Second Session (returned next day/week)
  7. Upgrade Page Viewed
  8. Subscription Created
```

**步骤之间最大的流失 = 你最大的机会。** 优先修复那里。

**告诉 AI：**
```
Instrument our conversion funnel:
- Track these events in order: [list your funnel steps]
- Build a funnel visualization showing drop-off between each step
- Set up an alert if any step's conversion drops below [X]% week-over-week
```

---

## 隐私与合规

上线前完成以下事项：

- [ ] 在你的隐私政策中加入对分析工具的说明
- [ ] 如有需要，添加 Cookie 同意横幅（取决于工具和所在地区）
- [ ] 在分析工具中启用 "anonymize IP"（IP 匿名化）
- [ ] 将管理员/测试账号排除在追踪之外
- [ ] 未经用户同意，绝不追踪个人身份信息（邮箱、姓名）到事件属性中
- [ ] 允许用户选择退出追踪
- [ ] 尊重浏览器的 Do Not Track（DNT）设置

**告诉 AI：**
```
Add privacy compliance for analytics:
- Add a cookie consent banner that loads analytics only after consent
- Exclude users with DNT enabled
- Add an "opt out of tracking" toggle in account settings
- Ensure no PII is sent in event properties
```

---

## 常见错误

| 错误 | 解决办法 |
|---------|-----|
| 从第一天起就追踪一切 | 从 5 个指标开始。等遇到它们无法回答的问题时再增加。 |
| 上线之后才做分析 | 在构建阶段就加入代码片段。从第一个用户开始追踪。 |
| 有仪表盘却没有行动 | 每个指标都应该有『如果下降了，我就做 X』的应对方案 |
| 忽视数据质量 | 第一个月里每周检查一次事件是否正常触发 |
| 过早为昂贵工具付费 | 在达到 $5K MRR 之前，PostHog 免费档能满足大部分需求 |

---

## 如果你现在还无法搭建分析体系

在能搭建之前，先用电子表格手动追踪这些数据：

| 周 | 注册数 | 已激活 | 留存（D7） | 已付费 | MRR |
|------|---------|-----------|---------------|------|-----|
| 第 1 周 | | | | | |
| 第 2 周 | | | | | |

哪怕是粗糙的手动追踪，也好过盲目摸索。尽快升级到正式工具。
