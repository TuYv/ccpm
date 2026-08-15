---
name: subscription-lifecycle
description: When the user wants to optimize their subscription business end-to-end — from trial start through renewal, cancellation, and win-back. Use when the user mentions "subscription lifecycle", "trial conversion", "churn", "cancellation", "win-back", "lapsed subscribers", "dunning", "billing retry", "grace period", "renewal rate", "subscriber LTV", or "resubscribe". For paywall design and pricing strategy, see monetization-strategy. For subscription analytics dashboards, see app-analytics.
metadata:
  version: 1.0.0
---
# 订阅生命周期

你需要优化订阅旅程的每个阶段：试用 → 付费 → 续订 → 取消挽回 → 赢回。

## 订阅生命周期

```
Install → Trial start → [Trial period] → Conversion → Renewal → ... → Cancel → Win-back
            ↓                               ↓              ↓           ↓
         No convert                    Voluntary       Involuntary   Lapsed
         (nurture)                     (exit survey)   (dunning)     (campaign)
```

## 各阶段的关键指标

| 阶段 | 指标 | 公式 | 基准 |
|-------|--------|---------|-----------|
| 试用 | 试用开始率 | Trials / Downloads | > 20% |
| 试用 | 试用转付费率 | Conversions / Trials | 25–40% 为强劲水平 |
| 留存 | 第 1 个月续订率 | M1 renewals / Subscribers | > 70% |
| 留存 | 第 6 个月续订率 | M6 renewals / Subscribers | > 50% |
| 流失 | 月流失率 | Lost subs / Start subs | < 5% 为良好；< 2% 为优秀 |
| 收入 | MRR | Active subs × monthly price | — |
| 收入 | LTV | ARPU / Monthly churn rate | — |
| 挽回 | 催款挽回率 | Recovered / Failed payments | > 30% |
| 赢回 | 重新订阅率 | Returns / Lapsed | 5–15% |

## 阶段 1 — 试用优化

### 试用时长

| 应用类型 | 建议试用期 | 备注 |
|----------|------------------|-------|
| 简单工具 | 3–7 天 | 价值很快就能体现 |
| 健康/健身 | 7–14 天 | 习惯养成需要时间 |
| 生产力 | 7–14 天 | 需要融入工作流 |
| 教育 | 7–14 天 | 完成第一节课程 |
| 娱乐 | 7 天 | 集中消费行为 |

**测试：** 对提供月度订阅的应用测试 7 天试用与 14 天试用——转化率可能会略有下降，但 LTV 通常会提高。

### 试用培育序列

在试用期间发送应用内消息（或推送通知），以促进用户激活：

```
Day 0: Welcome — "Your trial has started. Here's how to get the most from it."
Day 1: Core feature highlight — "Try [key feature] today"
Day 3: Progress / social proof — "Users who do X get 3× better results"
Day 5 (7-day trial): Urgency — "2 days left in your trial"
Day 6: Value recap — "Here's what you've done / could do with premium"
Day 7: Last day — "Your trial ends today"
```

**原则：** 消息应展示价值，而不只是制造压力。

### 试用结束 — 转化时刻

试用结束时，展示一个付费墙，其中：
- 回顾用户在试用期间取得的成果
- 展示使用最多的高级功能
- 提供 3 种方案选项（月度 / 年度 / 终身，如适用）
- 突出年度方案的优惠（“节省 40%”）

有关付费墙设计的详细信息，请参阅 `monetization-strategy`。

## 阶段 2 — 减少主动流失

### 用户为何取消订阅（以及如何解决）

| 原因 | 信号 | 解决方案 |
|--------|--------|-----|
| 忘记自己已订阅 | 会话次数少、未激活 | 改进新用户引导和通知策略 |
| 价值不足 | 功能使用率低 | 推广使用不足但价值较高的功能 |
| 价格太高 | 对价格敏感 | 推出更低档位的方案或暂停选项 |
| 应用存在问题 | 1 星评价 | 修复缺陷并回复评价 |
| 找到替代方案 | — | 监测竞品安装情况 |
| 季节性使用 | 每年在同一时间流失 | 提供暂停选项 |

### 取消流程

当用户发起取消订阅时（iOS — `ManagedSubscriptionGroup`）：

1. **先提供暂停选项**，再让用户完全取消：「暂停 1–3 个月，而不是取消订阅」
2. **回顾使用价值**：「本月你已使用 [feature] X 次」
3. **提供折扣**：仅作为最后手段——连续 3 个月优惠 20–30%
4. **退出问卷**：始终询问「你为什么要取消订阅？」（点按一次即可，不要求长篇回答）

**取消订阅退出问卷选项：**
- 太贵了
- 使用频率不够高
- 缺少我需要的功能
- 转用竞品
- 技术问题
- 只是想暂停一段时间

### 需要关注的参与度信号

流失风险较高的用户：
- 每周会话次数 < 1（低于之前的基准水平）
- 已有 14 天以上未使用核心功能
- 已禁用推送通知
- 距离上次会话 > 7 天

在用户取消订阅前，触发重新互动推送或应用内消息。

## 阶段 3 — 非自愿流失（支付失败）

非自愿流失占所有订阅取消的 **20–40%**。

### 催缴策略

| 天数 | 操作 |
|-----|--------|
| 0 | 支付静默失败——Apple/Google 重试 |
| 3 | Apple/Google 第 2 次重试 |
| 7 | Apple/Google 第 3 次重试——显示应用内「更新付款方式」横幅 |
| 10 | 发送推送：「你的订阅无法续订——点按以更新」 |
| 14 | 宽限期结束——暂停订阅 |
| 15 | 最后一条应用内消息：「重新激活以保留访问权限」 |

**宽限期：**
- iOS：6 天（可在 App Store Connect 中配置，最长 16 天）
- Android：3 天（可配置）

尽可能延长宽限期——每多一天，都能挽回更多订阅用户。

### RevenueCat 集成

RevenueCat 会自动处理催缴。关键设置：
- 启用 Billing Retry（iOS）/ Account Hold（Android）
- 将宽限期配置为允许的最长时间
- 使用 RevenueCat webhooks，在每次支付失败事件发生时触发应用内消息

请参阅 `revenuecat.md` 集成指南。

## 阶段 4 — 用户召回活动

目标用户为最近 30–90 天内取消订阅或订阅已到期的流失订阅用户。

### 召回优惠阶梯

从力度最小的优惠开始；只有在用户没有响应时才逐步加大力度：

```
Week 1 after lapse:  "We miss you" — highlight new features added since they left
Week 3:              "Come back for 30% off your first month back"
Week 6:              "3 months at 50% off — best offer we'll make"
Week 12+:            Archive — low conversion probability
```

### 召回渠道

| 渠道 | 方式 |
|---------|-----|
| 推送通知 | 如果应用仍已安装，则通过应用内触达 |
| 电子邮件 | 如果已收集电子邮件地址 |
| Apple Win-Back Offer | StoreKit 2 中的原生 iOS 召回优惠 |
| 付费再营销 | 通过 Meta/Google 对流失订阅用户列表进行再营销 |

### StoreKit 2 召回优惠（iOS 18+）

Apple 原生支持面向流失订阅用户的订阅召回优惠：
- 在 App Store Connect → Subscriptions → Win-Back Offers 中进行设置
- 自动在 App Store 中向符合条件的流失用户展示
- 除 StoreKit 2 集成外，无需额外代码

## 输出格式

### 订阅健康状况报告

```
Lifecycle Metrics ([period]):

Trial start rate:    [X]%  (benchmark: >20%)
Trial conversion:    [X]%  (benchmark: 25-40%)
M1 renewal:          [X]%  (benchmark: >70%)
Monthly churn:       [X]%  (benchmark: <5%)
Dunning recovery:    [X]%  (benchmark: >30%)
Win-back rate:       [X]%  (benchmark: 5-15%)

LTV (estimated):    $[N]
MRR:                $[N]

Top issues:
1. [Stage] — [metric] is [X]% vs benchmark [Y]% — [recommended fix]
2. [Stage] — [metric] is [X]% vs benchmark [Y]% — [recommended fix]

Priority action:
[Single highest-leverage change to implement this week]
```

## 相关技能

- `monetization-strategy` — 付费墙设计、定价层级、试用设置
- `retention-optimization` — 通过互动策略减少主动流失
- `app-analytics` — 使用 Firebase + RevenueCat 跟踪上述指标
- `onboarding-optimization` — 解决导致用户未开始试用的早期流失问题
- `rating-prompt-strategy` — 满意的订阅用户是最理想的评分者