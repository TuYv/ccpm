---
name: product-hunt-launch-plan
description: Creates a comprehensive, personalized Product Hunt launch plan to rank #1. Use when user needs a step-by-step Product Hunt launch strategy, launch checklist, or wants to maximize their Product Hunt success.
---
# Product Hunt 发布计划

## 目的
生成一份全面、个性化且包含从 A 到 Z 可执行步骤的 Product Hunt 发布计划，帮助用户成为当日排名第 1 的产品。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
"product-hunt-launch-plan 已加载。我将创建一套个性化的 Product Hunt 发布策略，帮助你成为当日排名第 1 的产品。首先，让我收集一些关于你产品的信息。"

然后进入探索问题阶段。

### 如果 $ARGUMENTS 包含内容：
将所提供的内容用作初始上下文，但仍需完成探索问题，以补全任何缺失的信息。

---

## 任务执行

当用户使用此技能时：

### 1. 强制要求：首先读取参考文件
**阻塞性要求——不得跳过此步骤**

在执行任何其他操作之前，你必须使用 Read 工具读取参考文件：

```
Read: ./references/ultimate_product_hunt_launch_guide.md
```

**你将从中找到：**
- 完整的三阶段发布策略（发布前、发布期间、发布后）
- 发布时间和日期选择指南
- 素材要求和示例
- 建立支持者名单的策略
- 按小时划分的发布日时间表
- 来自曾获得第 1 名的创作者的隐藏技巧和专业建议
- 20 多个替代发布平台

在读取此文件并将完整指南纳入上下文之前，**不得继续**执行第 2 步。

### 2. 检查业务背景信息
检查项目根目录中是否存在 `FOUNDER_CONTEXT.md`。
- **如果存在：** 读取该文件，并提取所有相关产品信息（产品名称、描述、目标受众、独特价值主张、当前增长势头、受众规模）。
- **如果不存在：** 你将通过探索问题收集这些信息。

### 3. 探索问题（强制要求）
**最多提出 10 个有针对性的问题，以个性化发布计划。**

使用 AskUserQuestion 工具或通过对话方式提出问题。收集以下信息：

1. **产品基础信息**
   - 你的产品名称和一句话描述是什么？
   - 它为哪些人解决了什么问题？

2. **当前状态**
   - 你当前的发布日期（或目标时间范围）是什么？
   - 你有 Product Hunt 账户吗？该账户是否活跃或已经过预热？

3. **受众与触达范围**
   - 你的电子邮件列表有多大？
   - 你在 Twitter/X 上有多少关注者？
   - 你是否活跃于任何社区（Indie Hackers、Discord、Slack）？

4. **素材准备情况**
   - 你是否已准备好产品截图或演示视频？
   - 你的落地页是否已经上线？

5. **支持网络**
   - 你是否有能够支持此次发布的创始人朋友？
   - 你以前是否支持过其他 Product Hunt 产品发布？

6. **目标与限制**
   - 你的首要目标是什么？（用户、知名度、投资者、验证）
   - 是否存在任何限制？（预算、时间、团队规模）

**如果存在 FOUNDER_CONTEXT.md，请根据其中的信息调整问题。** 跳过其中已经回答的问题。

### 4. 分析与个性化
根据收集到的信息，评估：

- **支持力度：** 弱（少于 100 名支持者）、中等（100-300 名）、强（300-500 名以上）
- **素材准备情况：** 未准备好、部分准备好、完全准备好
- **时间安排：** 仓促（少于 2 周）、紧张（2-4 周）、理想（4 周以上）
- **受众触达范围：** 有限、中等、强

使用此评估来自定义建议。

### 5. 生成个性化发布计划
创建一份全面的计划，包括：

**第 1 部分：执行摘要**
- 产品概述（来自他们的输入）
- 建议的发布日期
- 根据他们当前的资源预测排名潜力
- 针对他们具体情况的关键成功因素

**第 2 部分：发布前阶段（根据他们的日期自定义时间线）**
- 每周行动事项
- 根据他们的细分领域提供具体的社区建议
- 根据他们缺少的内容定制资源创建检查清单
- 根据他们当前的触达范围制定支持者名单构建策略

**第 3 部分：发布周准备**
- 逐日倒计时计划
- 针对他们的产品个性化定制具体的外联模板
- 社交媒体帖子草稿
- 电子邮件文案建议

**第 4 部分：发布日作战计划**
- 按他们所在时区制定逐小时的时间线
- 根据他们的产品类型确定具体的发布平台
- 评论互动话术
- 监控设置

**第 5 部分：发布后策略**
- 后续行动
- 如何利用发布结果（即使没有获得第 1 名）
- 徽章/社会认同的实施方式

**第 6 部分：隐藏技巧与专业建议**
从参考指南中选出 5-10 个高级策略，并根据与他们具体情况的相关性进行选择。

**第 7 部分：其他发布平台**
列出参考指南中的 20 多个平台，并根据他们的产品类型（开发者工具、SaaS、AI 产品等）确定优先级。

### 6. 格式化并验证
- 按照**输出格式**部分组织输出
- 在呈现结果之前，完成**质量检查清单**自检

---

## 写作规则
硬性约束。不得自行解读。

### 核心规则
- 具体且可执行——不要提供“建设社区”之类的模糊建议
- 包含确切的时间线、数字和示例
- 根据他们的产品对每条建议进行个性化定制
- 在整个计划中反复提及他们的产品名称
- 提供可直接复制/粘贴的模板
- 按影响力确定行动优先级

### 个性化规则
- 如果受众规模较小（<500）：重点关注社区建设和互惠策略
- 如果受众规模较大（5000+）：重点关注协同发布和势能积累策略
- 如果是开发者工具：重点关注 Hacker News、DevHunt、GitHub 社区
- 如果是 AI 产品：纳入 AI 专属目录
- 如果是 B2B SaaS：重点关注 LinkedIn 和专业社区
- 如果是消费者应用：重点关注 Twitter/X 和视觉素材

### 诚信规则
- 根据他们当前的情况，对成功概率作出切合实际的判断
- 如果时间线过于紧张，应明确指出并建议重新安排发布日期
- 如果素材薄弱，应优先进行完善
- 如果他们的支持者基础过小，不要承诺获得第 1 名

---

## 输出格式

```markdown
# Product Hunt Launch Plan: [Product Name]

## Executive Summary
**Product:** [Name] - [One-liner]
**Recommended Launch Date:** [Date] ([Day of week])
**Launch Time:** 12:01 AM PST
**Ranking Potential:** [Assessment based on their situation]
**Critical Success Factor:** [The ONE thing they must nail]

---

## Phase 1: Pre-Launch ([X] weeks out)

### Week [X]: [Focus Area]
- [ ] Action item 1
- [ ] Action item 2
...

### Week [X-1]: [Focus Area]
...

---

## Phase 2: Launch Week

### Day -7 to -1: Final Preparations
...

### Launch Day: Hour-by-Hour Battle Plan

**[Time in their timezone] - [Action]**
...

---

## Phase 3: Post-Launch

### Day 1-3: Immediate Actions
...

### Week 1: Capitalize on Results
...

---

## Your Personalized Tips

Based on your situation, focus on these advanced tactics:

1. **[Tip Name]:** [Specific advice for their situation]
...

---

## Alternative Launch Platforms (Prioritized for [Product Type])

### Launch This Week (Alongside Product Hunt)
| Platform | Why It Fits You |
|----------|-----------------|
...

### Launch Next Week
...

---

## Ready-to-Use Templates

### Supporter DM Template
[Personalized template with their product details]

### Launch Day Tweet Thread
[Draft thread they can customize]

### Email to Subscribers
[Draft email copy]

---

## Your Launch Checklist

### Assets Needed
- [ ] Item (Status: Ready/Needed)
...

### Support List Target
- [ ] Category: [X] people (Current: [Y])
...
```

---

## 参考资料

**在创建任何发布计划之前，必须使用 Read 工具读取此文件（参见步骤 1）：**

| 文件 | 用途 |
|------|---------|
| `./references/ultimate_product_hunt_launch_guide.md` | 来自 Tibo（2022 年度创作者）的完整 Product Hunt 策略，包括三阶段发布流程、隐藏技巧、专业建议以及 20 多个替代平台 |

**为什么这很重要：** 本指南包含来自一位曾多次排名第一的创作者经过实战检验的策略。其中的战术、时机和模板均已被证明有效，而非理论性建议。

---

## 质量检查清单（自我验证）

在最终确定输出内容之前，请验证以下所有事项：

### 执行前检查
- [ ] 我在创建计划之前已阅读 `./references/ultimate_product_hunt_launch_guide.md`
- [ ] 我已检查 `FOUNDER_CONTEXT.md` 是否存在，并在存在时阅读了该文件
- [ ] 我的上下文中包含完整的指南内容

### 信息收集检查
- [ ] 我提出了有针对性的问题，以了解他们的具体情况
- [ ] 我了解他们的产品、受众规模、时间安排和素材状态
- [ ] 我根据可用的上下文调整了问题

### 个性化检查
- [ ] 每个部分都按名称提及他们的产品
- [ ] 建议与他们的受众规模和触达能力相匹配
- [ ] 时间安排对于他们的发布日期而言切实可行
- [ ] 平台建议与他们的产品类型相匹配
- [ ] 模板包含他们产品的具体信息

### 完整性检查
- [ ] 涵盖所有三个阶段（发布前、发布期间、发布后）
- [ ] 包含发布日逐小时的时间安排
- [ ] 包含隐藏技巧/专业建议部分
- [ ] 已列出替代平台并确定优先级
- [ ] 提供可直接使用的模板
- [ ] 包含标注当前状态的检查清单

### 真实性检查
- [ ] 排名评估切实可行
- [ ] 指出薄弱环节并提供解决方案
- [ ] 已处理时间安排方面的问题
- [ ] 不作保证排名第一的虚假承诺

**如果任何一项检查未通过 → 在呈现之前进行修改。**

---

## 默认值与假设

除非用户另有指定，否则使用以下设置：

- **发布日：** 星期二、星期三或星期四（流量较高）
- **发布时间：** 太平洋标准时间凌晨 12:01（Product Hunt 重置时间）
- **目标排名：** 前 5 名（需要约 500 名积极互动的支持者）
- **准备时间：** 理想情况下至少 4 周
- **主要目标：** 获取用户并验证产品
- **猎手策略：** 自行发布（排名第一的产品中有 60% 是自行发布的）
- **素材格式：** 优先使用静态图片而非视频（互动率更高）

在执行摘要中记录所作的任何假设。

---