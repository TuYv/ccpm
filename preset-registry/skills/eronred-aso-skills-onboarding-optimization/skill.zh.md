---
name: onboarding-optimization
description: When the user wants to improve their app's onboarding experience, increase activation rate, reduce Day 1 drop-off, or optimize the first-run flow. Use when the user mentions "onboarding", "first-run", "activation", "tutorial", "day 1 retention", "new user flow", "permission prompts", "sign-up conversion", "onboarding funnel", or "users dropping off early". For overall retention strategy, see retention-optimization. For paywall placement, see monetization-strategy.
metadata:
  version: 1.0.0
---
# 新手引导优化

你需要优化首次使用体验，以最大限度地提升激活率——激活是指新用户完成能够预测长期留存的核心操作的那一刻。

## 激活原则

**激活 ≠ 注册。** 激活是用户第一次从你的应用中获得真正价值的时刻。在做其他任何事情之前，先确定这一时刻。

| 应用类型 | 激活事件 |
|----------|-----------------|
| 健身 | 完成第一次锻炼 |
| 生产力 | 创建第一个任务或项目 |
| 社交 | 建立第一次连接或发布第一条内容 |
| 金融 | 关联第一个账户或设置第一份预算 |
| 游戏 | 完成第一个关卡或第一场比赛 |
| 冥想 | 完成第一次冥想 |
| 照片/视频 | 编辑或导出第一张照片 |

**规则：** 新手引导中的所有内容都应引导用户尽快完成这一个激活事件。

## 初步评估

1. 检查是否存在 `app-marketing-context.md`
2. 询问：**你的激活事件是什么？**
3. 询问：**有多少百分比的新用户会在 24 小时内完成激活？**（基准值）
4. 询问：**用户会在哪里流失？**（如果已知，是在哪一步）
5. 询问：**当前的新手引导需要多长时间？**（步骤数、页面数）
6. 询问：**是否已设置 Firebase/Mixpanel 漏斗？**

## 新手引导审查框架

### 第 1 步——绘制当前流程

列出从打开应用到完成激活之间的每个页面：

```
App open → [Screen 1] → [Screen 2] → ... → Activation event
```

标记每个页面：**必需** | **增加价值** | **只会增加阻力**

移除或推迟所有只会增加阻力的内容。

### 第 2 步——为每个页面评分

| 因素 | 问题 | 评分 |
|--------|---------|-------|
| **必要性** | 如果没有这个页面，用户能否完成激活？ | 0 = 跳过 |
| **时机** | 现在是提出此要求的正确时机吗？ | |
| **价值交换** | 用户是否理解这会给自己带来什么好处？ | |
| **认知负荷** | 这需要用户做出多少个决定？ | |

### 第 3 步——权限请求时机

权限请求是首要的用户流失点。规则如下：

| 权限 | 何时请求 | 绝不要在何时请求 |
|-----------|------------|-----------|
| 推送通知 | 激活之后，而非之前 | 冷启动时 |
| 位置 | 功能需要使用位置时 | 注册期间 |
| 摄像头/麦克风 | 在实际使用时根据上下文请求 | 用户获得任何价值之前 |
| 通讯录 | 使用社交功能时 | 新手引导期间 |
| 跟踪（ATT） | 用户已经投入使用之后 | 首次打开时 |

**权限预请求页面：** 在系统权限提示之前，始终先展示一个外观类似原生界面的说明页面。理解“为什么”需要授予权限的用户，其授权率会提高至 2–3 倍。

### 第 4 步——注册阻力

| 模式 | 影响 | 建议 |
|---------|--------|---------------|
| 获得价值前必须注册 | 高流失率 | 推迟到激活后 |
| 仅支持邮箱+密码 | 中等流失率 | 添加 Sign in with Apple + Google |
| 冗长的个人资料设置 | 高流失率 | 最多询问 1 个问题，其余推迟 |
| 必须验证邮箱 | 扼杀用户动能 | 推迟或设为可选 |

**访客模式／注册前试用：** 允许用户在必须创建账户之前体验核心价值。从访客 → 注册用户的转化率通常为 40–60%，而设置强制门槛时仅为 15–30%。

## 按应用类型划分的引导模式

### 价值优先（推荐用于大多数应用）

```
Open → Core feature demo / interactive preview
     → Activation moment
     → "Save your progress" → Sign-up
     → Permission asks
     → Personalization
```

### 个性化优先（适用于健康、健身和 AI 应用）

```
Open → 3–5 personalization questions (show progress bar)
     → "Your plan is ready" reveal moment
     → Sign-up gate (invested now)
     → Activation
```

### 社交优先（社交应用）

```
Open → Sign in with Apple/Google (single tap)
     → Find friends / follow suggestions
     → First feed with content
     → Activation (post, comment, react)
```

## 漏斗基准

| 步骤 | 基准 | 较差 |
|------|-----------|------|
| 打开应用 → 首次互动 | > 85% | < 70% |
| 注册转化率 | > 60% | < 40% |
| 推送权限授予率 | > 50% | < 30% |
| 激活（D0） | > 40% | < 20% |
|第 1 天留存率 | > 30% | < 15% |

## 个性化问题

如果包含个性化环节，请遵循以下规则：
- 引导流程中最多包含 **3–5 个问题**
- 每个问题都必须对体验产生明显影响
- 显示进度指示器（第 1 步，共 3 步）
- 使用可视化选项，而非文本输入
- 绝不要索取不会立即使用的数据

## 付费墙在引导流程中的位置

**规则：**在展示付费墙之前先让用户感受到价值。

| 位置 | 适用情况 |
|-----------|-----------|
| 激活之前 | 几乎从不适用——用户尚无判断价值的参照 |
| 激活时 | 效果良好——用户刚刚感受到价值 |
| 激活后，第 1 天 | 对订阅制应用效果最佳 |
| 情境式（功能门槛） | 适用于基于功能的付费墙 |

有关付费墙设计的详细信息，请参阅 `monetization-strategy`。

## 输出格式

### 引导流程审计

```
Current flow:
  [Screen 1] — Required / friction
  [Screen 2] — Value-adding
  [Screen 3] — Required / friction
  ...
  [Activation event] — Step N

Drop-off analysis:
  Biggest drop: [screen] ([X]% exit rate if known)
  Estimated cause: [hypothesis]

Recommended changes:
1. [Remove / defer X] — Expected impact: [lift in activation]
2. [Reorder Y before Z] — Expected impact: [rationale]
3. [Add pre-permission screen for Z] — Expected impact: [grant rate improvement]

Revised flow:
  Open → [Screen] → [Screen] → Activation → Sign-up → Permissions
  Estimated steps removed: [N]
  Estimated time to activation: [Xs → Xs]
```

### 权限请求屏幕文案模板

```
[Icon representing the permission]

[Benefit headline — what the user gets]
e.g., "Get notified when your goal is complete"

[One-line explanation]
e.g., "We'll only send you reminders you set — no spam."

[Allow button]     [Not now]
```

## 相关技能

- `retention-optimization` — 第 7/30 天留存策略
- `monetization-strategy` — 付费墙位置与试用设计
- `ab-test-store-listing` — 测试引导流程的不同版本
- `app-analytics` — 设置激活漏斗跟踪
- `rating-prompt-strategy` — 激活后何时请求用户评分