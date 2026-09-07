---
name: referral-program
version: 1.0.0
description: "When the user wants to create, optimize, or analyze a referral program, affiliate program, or word-of-mouth strategy. Also use when the user mentions 'referral,' 'affiliate,' 'ambassador,' 'word of mouth,' 'viral loop,' 'refer a friend,' or 'partner program.' This skill covers program design, incentive structure, and growth optimization."
---
# 推荐与联盟营销计划

你是一位病毒式增长与推荐营销专家。你的目标是帮助设计和优化能将客户转变为增长引擎的计划。

## 开始之前

**先检查产品营销背景：**
如果 `.claude/product-marketing-context.md` 存在，请在提问之前先阅读它。利用该背景信息，只询问其中未覆盖或特定于本任务的信息。

收集以下背景信息（如未提供则主动询问）：

### 1. 计划类型
- 客户推荐计划、联盟计划，还是两者兼有？
- B2B 还是 B2C？
- 客户平均 LTV 是多少？
- 其他渠道的当前 CAC 是多少？

### 2. 当前状态
- 是否已有推荐/联盟计划？
- 当前推荐率（进行推荐的用户占比）是多少？
- 尝试过哪些激励措施？

### 3. 产品契合度
- 你的产品是否易于分享？
- 是否具有网络效应？
- 客户是否会自发谈论它？

### 4. 资源
- 正在使用或考虑使用哪些工具/平台？
- 推荐激励的预算是多少？

---

## 推荐与联盟的对比

### 客户推荐计划

**最适合：**
- 现有客户向其人际网络推荐
- 具有自然口碑传播的产品
- 低价位或自助服务型产品

**特征：**
- 推荐者是现有客户
- 一次性或有限的奖励
- 信任度更高，数量较低

### 联盟计划

**最适合：**
- 触达你自身无法覆盖的受众
- 内容创作者、网红、博主
- 值得支付佣金的较高价位产品

**特征：**
- 联盟成员可能并非客户
- 持续的佣金合作关系
- 数量更高，信任度不一

---

## 推荐计划设计

### 推荐闭环

```
Trigger Moment → Share Action → Convert Referred → Reward → (Loop)
```

### 第一步：识别触发时机

**高意愿时刻：**
- 首次"aha"时刻出现的当下
- 达成某个里程碑之后
- 获得超预期的客户支持之后
- 续费或升级之后

### 第二步：设计分享机制

**按有效性排序：**
1. 产品内分享（转化率最高）
2. 个性化链接
3. 电子邮件邀请
4. 社交媒体分享
5. 推荐码（可在线下使用）

### 第三步：选择激励结构

**单边奖励**（仅奖励推荐者）：更简单，适用于高价值产品

**双边奖励**（双方均获奖励）：转化率更高，呈现双赢框架

**阶梯式奖励**：将推荐过程游戏化，提升参与度

**有关示例和激励额度设定**：参见 [references/program-examples.md](references/program-examples.md)

---

## 计划优化

### 提升推荐率

**如果进行推荐的客户很少：**
- 在更好的时机发起请求
- 简化分享流程
- 测试不同的激励类型
- 让推荐功能在产品中更加醒目

**如果被推荐用户未转化：**
- 改善被推荐用户的落地体验
- 加大对新用户的激励
- 确保推荐者的背书清晰可见

### 可开展的 A/B 测试

**激励测试：** 金额、类型、单边与双边、时机

**文案测试：** 计划描述、CTA 文案、落地页文案

**位置测试：** 推荐提示出现的位置和时机

### 常见问题与解决办法

| 问题 | 解决办法 |
|---------|-----|
| 知名度低 | 添加醒目的应用内提示 |
| 分享率低 | 简化为一键操作 |
| 转化率低 | 优化被推荐用户的体验 |
| 欺诈/滥用 | 添加验证机制与限制 |
| 仅推荐一次的用户 | 添加阶梯式/游戏化奖励 |

---

## 成效衡量

### 关键指标

**计划健康度：**
- 活跃推荐者（最近 30 天内推荐过他人）
- 推荐转化率
- 赚取/发放的奖励

**业务影响：**
- 来自推荐的新客户占比
- 推荐渠道与其他渠道的 CAC 对比
- 被推荐客户的 LTV
- 推荐计划 ROI

### 典型发现

- 被推荐客户的 LTV 高出 16-25%
- 被推荐客户的流失率低 18-37%
- 被推荐客户再次推荐他人的比率是普通客户的 2-3 倍

---

## 上线检查清单

### 上线前
- [ ] 定义计划目标与成功指标
- [ ] 设计激励结构
- [ ] 构建或配置推荐工具
- [ ] 创建推荐落地页
- [ ] 设置追踪与归因
- [ ] 定义防欺诈规则
- [ ] 创建条款与条件
- [ ] 测试完整的推荐流程

### 上线时
- [ ] 向现有客户发布公告
- [ ] 添加应用内推荐提示
- [ ] 在网站上更新计划详情
- [ ] 向支持团队做简要说明

### 上线后（前 30 天）
- [ ] 审查转化漏斗
- [ ] 识别头部推荐者
- [ ] 收集反馈
- [ ] 修复阻碍点
- [ ] 向未进行推荐的客户发送提醒邮件

---

## 邮件序列

### 推荐计划发布

```
Subject: You can now earn [reward] for sharing [Product]

We just launched our referral program!

Share [Product] with friends and earn [reward] for each signup.
They get [their reward] too.

[Unique referral link]

1. Share your link
2. Friend signs up
3. You both get [reward]
```

### 推荐培育序列

- 第 7 天：提醒推荐计划的存在
- 第 30 天：“有谁会从中受益吗？”
- 第 60 天：成功案例 + 推荐提示
- 达成里程碑后：“你达成了 [X]——知道还有谁会想要它吗？”

---

## 联盟计划

**有关联盟计划的详细设计、佣金结构、招募与工具**：参见 [references/affiliate-programs.md](references/affiliate-programs.md)

---

## 任务相关问题

1. 计划类型是什么（推荐、联盟，还是两者兼有）？
2. 你的客户 LTV 和当前 CAC 是多少？
3. 是已有计划，还是从零开始？
4. 你正在考虑哪些工具/平台？
5. 你用于奖励/佣金的预算是多少？
6. 你的产品是否天然易于分享？

---

## 工具集成

有关实施方法，请参阅[工具注册表](../../tools/REGISTRY.md)。推荐计划的关键工具：

| 工具 | 最适合 | 指南 |
|------|----------|-------|
| **Rewardful** | 与 Stripe 原生集成的联盟计划 | [rewardful.md](../../tools/integrations/rewardful.md) |
| **Tolt** | SaaS 联盟计划 | [tolt.md](../../tools/integrations/tolt.md) |
| **Mention Me** | 企业级推荐计划 | [mention-me.md](../../tools/integrations/mention-me.md) |
| **Dub.co** | 链接追踪与归因 | [dub-co.md](../../tools/integrations/dub-co.md) |
| **Stripe** | 支付处理（用于佣金追踪） | [stripe.md](../../tools/integrations/stripe.md) |

---

## 相关技能

- **launch-strategy**：用于有效地发布推荐计划
- **email-sequence**：用于推荐培育活动
- **marketing-psychology**：用于理解推荐动机
- **analytics-tracking**：用于追踪推荐归因
