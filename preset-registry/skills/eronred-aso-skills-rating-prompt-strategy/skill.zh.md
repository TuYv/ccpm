---
name: rating-prompt-strategy
description: When the user wants to improve their app's star rating, increase ratings volume, optimize when and how they prompt users for a review, or recover from a bad rating period. Use when the user mentions "app rating", "star rating", "review prompt", "SKStoreReviewRequest", "In-App Review API", "ask for review", "low rating", "rating drop", "get more reviews", or "recover from 1-star". For responding to reviews, see review-management. For overall ASO health, see aso-audit.
metadata:
  version: 1.0.0
---
# 评分提示策略

优化应用在何时、以何种方式以及向哪些用户显示评分提示——在最大限度提高高评分数量的同时，尽量减少低评分。评分既是 App Store 的排名信号，也是产品页面上的转化因素。

## 评分为何对 ASO 至关重要

- **搜索排名**——评分较高的应用在竞争激烈的关键词下排名更高
- **转化**——评分星级会显示在搜索结果中；一眼看去，4.8 分胜过 4.2 分
- **iOS：**评分可按版本重置（你可以在 App Store Connect 中申请重置）
- **Android：**评分是永久且累积的——一段时期内的差评很难挽回

## 核心原则

**只向已经体验到产品价值的用户发出评分提示。**过早提示会导致低评分。在用户获得成功的时刻提示，则会带来 4–5 星评分。

## iOS — SKStoreReviewRequest

Apple 的原生评分提示。规则：
- 无论调用多少次，每年最多显示 **3 次**
- Apple 控制显示逻辑——调用并不保证一定显示
- 切勿在发生错误、崩溃或令人沮丧的情况后发出提示
- 无法自定义提示界面

```swift
import StoreKit

// Call at the right moment
if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
    SKStoreReviewController.requestReview(in: scene)
}
```

## Android — Play In-App Review API

Google 的原生评分提示。规则：
- 没有硬性次数限制，但如果调用过于频繁，Google 会进行限流
- 在明确的积极时刻后显示
- 无法确定用户是否真的进行了评分（出于隐私考虑）

```kotlin
val manager = ReviewManagerFactory.create(context)
val request = manager.requestReviewFlow()
request.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val reviewInfo = task.result
        val flow = manager.launchReviewFlow(activity, reviewInfo)
        flow.addOnCompleteListener { /* proceed */ }
    }
}
```

## 时机框架

### 成功时刻触发器

在应用中定义 1–3 个用户满意度最高的“成功时刻”：

| 应用类型 | 合适的提示时刻 | 不合适的提示时刻 |
|----------|--------------------|--------------------|
| 健身 | 完成一次锻炼后 | 跳过一次训练后 |
| 效率工具 | 完成一个项目/任务后 | 保存失败或发生同步错误后 |
| 游戏 | 通过一个关卡或击败一个首领后 | 输掉或失败后 |
| 金融 | 首次成功完成交易后 | 遇到令人困惑的错误后 |
| 冥想 | 完成一次冥想后 | 冷启动时 |
| 购物 | 成功购买/收货后 | 结账失败后 |

### 基于会话的规则

只向符合所有条件的用户发出提示：

```
Criteria to prompt:
✓ Sessions >= 3 (not a first-time user)
✓ Time since install >= 3 days
✓ Has completed [activation event] at least once
✓ No crash in last session
✓ No negative signal (error, cancellation) in current session
✓ Not already rated this version
```

## 提示前调查（推荐）

在触发原生评分提示之前，先在应用内显示一个简单问题：

```
"Are you enjoying [App Name]?"
  [Yes, love it!]   [Not really]
```

- **“是”** → 触发 `SKStoreReviewRequest` / Play In-App Review
- **“不太满意”** → 显示反馈表单（电子邮件或应用内），**不要**触发原生评分提示

这样可以在不满意的用户给出 1–2 星评分之前将其筛除。

**预期提升：**使用预提示筛选后，平均可提升 0.3–0.8 星。

## 版本控制（iOS）

iOS 允许你在 App Store Connect 中按版本重置评分。请策略性地使用此功能：

- **在重大改进后重置**——如果你修复了用户投诉最多的问题
- 在用户不喜欢且有争议的改动之后，**不要重置**
- 重置后，在前 7 天开展积极的（但经过筛选的）评分提示活动
- 优先面向参与度最高的用户（会话历史最长）

## 从评分下降中恢复

### 诊断

1. 检查哪个版本导致了评分下降——与发布日期进行关联分析
2. 阅读该时间段内的 1 星评价——找出共同的投诉点
3. 在下一个版本中修复问题
4. 回复每一条 1–3 星评价（参见 `review-management` skill）

### 恢复活动

修复版本发布后：
1. 回复负面评价：“已在版本 X.X 中修复——请更新并告诉我们使用感受”
2. 一些用户会在收到回复后更新评分
3. 开展评分提示活动，面向最忠诚的用户（会话次数最多）
4. 不要向留下过负面评价的用户显示评分提示

### 时间线

```
Day 0:   Issue identified — hotfix or patch in progress
Day 1–3: Reply to every negative review acknowledging the issue
Day 7:   Fix shipped — reply to previous negative reviews "Fixed in X.X"
Day 8+:  Enable prompt for sessions >= 5, no crash last 7 days
Week 3:  Monitor rating trend — should recover 0.2–0.5 stars in 2–4 weeks
```

## 提示频率

| 平台 | 上限 | 建议 |
|----------|---------|-------------|
| iOS | 每 365 天 3 次（由 Apple 强制限制） | 每个版本 1–2 次 |
| Android | 无硬性限制（Google 会进行限流） | 每位用户每 30 天 1 次 |

切勿在同一次会话中显示两次评分提示。

## 输出格式

### 评分策略计划

```
Current rating: [X.X] ★  ([N] ratings)
Platform: iOS / Android / Both

Success moments identified:
1. [Event name] — fires when [condition]
2. [Event name] — fires when [condition]

Pre-prompt survey: Yes / No
  If yes: "Are you enjoying [App Name]?" → Yes / Not really

Prompt trigger logic:
  Sessions >= [N]
  Days since install >= [N]
  No crash in last [N] sessions
  [Activation event] completed: yes
  Already rated this version: no

Expected outcome: +[X] stars over [N] weeks

Recovery plan (if rating < 4.0):
  1. [Fix] — ship by [date]
  2. [Reply strategy] — [N] reviews to address
  3. [Prompt campaign] — start [date], target [segment]
```

## 相关 Skill

- `review-management`——回复评价以恢复评分
- `onboarding-optimization`——修复导致 1 星评价的激活问题
- `android-aso`——Play In-App Review API 相关背景
- `retention-optimization`——参与度高的用户会给出更好的评分