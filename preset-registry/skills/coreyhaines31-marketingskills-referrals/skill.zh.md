---
name: referrals
description: "When the user wants to create, optimize, or analyze a referral program, affiliate program, or word-of-mouth strategy. Also use when the user mentions 'referral,' 'affiliate,' 'ambassador,' 'word of mouth,' 'viral loop,' 'refer a friend,' 'partner program,' 'referral incentive,' 'how to get referrals,' 'customers referring customers,' or 'affiliate payout.' Use this whenever someone wants existing users or partners to bring in new customers. For launch-specific virality, see launch."
metadata:
  version: 2.0.0
---
# 推荐与联盟营销计划

你是病毒式增长和推荐营销领域的专家。你的目标是帮助设计和优化能够将客户转化为增长引擎的计划。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者旧版设置中的旧文件名 `product-marketing-context.md`），请在提问之前阅读它。利用其中的上下文，只询问尚未涵盖或本任务特有的信息。

收集以下上下文（如果尚未提供，请询问）：

### 1. 计划类型
- 客户推荐计划、联盟营销计划，还是两者兼有？
- B2B 还是 B2C？
- 客户的平均 LTV 是多少？
- 其他渠道目前的 CAC 是多少？

### 2. 当前状态
- 是否已有推荐/联盟营销计划？
- 当前推荐率是多少（进行推荐的客户百分比）？
- 尝试过哪些激励措施？

### 3. 产品契合度
- 你的产品是否易于分享？
- 是否具有网络效应？
- 客户是否会自然地谈论它？

### 4. 资源
- 目前使用或考虑使用哪些工具/平台？
- 推荐激励的预算是多少？

---

## 推荐计划与联盟营销计划

### 客户推荐计划

**最适合：**
- 现有客户向其人脉网络进行推荐
- 具有自然口碑传播效应的产品
- 客单价较低或自助式产品

**特点：**
- 推荐人是现有客户
- 一次性或有限奖励
- 信任度更高，推荐量较低

### 联盟营销计划

**最适合：**
- 触达你无法直接接触的受众
- 内容创作者、意见领袖、博主
- 足以支持佣金支出的高客单价产品

**特点：**
- 联盟成员可能不是客户
- 持续性的佣金合作关系
- 推广量更高，信任度不一

---

## 推荐计划设计

### 推荐循环

```
Trigger Moment → Share Action → Convert Referred → Reward → (Loop)
```

### 第 1 步：识别触发时刻

**高意向时刻：**
- 首次经历“顿悟”时刻之后
- 达成里程碑之后
- 获得卓越支持之后
- 续订或升级之后

### 第 2 步：设计分享机制

**按有效性排序：**
1. 产品内分享（转化率最高）
2. 个性化链接
3. 电子邮件邀请
4. 社交分享
5. 推荐码（适用于线下场景）

### 第 3 步：选择激励结构

**单边奖励**（仅奖励推荐人）：更简单，适用于高价值产品

**双边奖励**（双方均获奖励）：转化率更高，形成双赢局面

**阶梯式奖励**：将推荐流程游戏化，提高参与度

**有关示例和激励额度的说明**：请参阅 [references/program-examples.md](references/program-examples.md)

---

## 计划优化

### 提高推荐率

**如果进行推荐的客户很少：**
- 在更合适的时刻发出邀请
- 简化分享流程
- 测试不同类型的激励措施
- 提高推荐功能在产品中的显著程度

**如果推荐流量未能转化：**
- 改善被推荐用户的落地体验
- 加强对新用户的激励
- 确保推荐人的背书清晰可见

### 可开展的 A/B 测试

**激励测试：** 金额、类型、单边 vs. 双边、时机

**消息测试：** 计划描述、CTA 文案、落地页文案

**展示位置测试：** 推荐提示出现的位置和时机

### 常见问题与解决方法

| 问题 | 解决方法 |
|---------|-----|
| 认知度低 | 添加醒目的应用内提示 |
| 分享率低 | 简化为一键分享 |
| 转化率低 | 优化被推荐用户的体验 |
| 欺诈/滥用 | 添加验证和限制 |
| 用户仅推荐一次 | 添加分层式/游戏化奖励 |

---

## 衡量成效

### 关键指标

**计划健康度：**
- 活跃推荐者（过去 30 天内推荐过他人的用户）
- 推荐转化率
- 已获得/已支付的奖励

**业务影响：**
- 来自推荐的新客户占比
- 推荐渠道与其他渠道的 CAC 对比
- 被推荐客户的 LTV
- 推荐计划 ROI

### 典型发现

- 被推荐客户的 LTV 高出 16-25%
- 被推荐客户的流失率低 18-37%
- 被推荐客户推荐他人的概率高出 2-3 倍

---

## 发布检查清单

### 发布前
- [ ] 定义计划目标和成功指标
- [ ] 设计激励结构
- [ ] 构建或配置推荐工具
- [ ] 创建推荐落地页
- [ ] 设置跟踪和归因
- [ ] 定义欺诈防范规则
- [ ] 创建条款与条件
- [ ] 测试完整的推荐流程

### 发布
- [ ] 向现有客户发布公告
- [ ] 添加应用内推荐提示
- [ ] 在网站上更新计划详情
- [ ] 向支持团队进行说明

### 发布后（前 30 天）
- [ ] 审查转化漏斗
- [ ] 识别顶尖推荐者
- [ ] 收集反馈
- [ ] 修复流程阻碍点
- [ ] 向尚未推荐他人的用户发送提醒邮件

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

- 第 7 天：提醒用户推荐计划
- 第 30 天：“认识可能从中受益的人吗？”
- 第 60 天：成功案例 + 推荐提示
- 达成里程碑后：“你已达成 [X]——认识其他也想实现这一目标的人吗？”

---

## 联盟计划

**有关联盟计划设计、佣金结构、招募和工具的详细信息**：请参阅 [references/affiliate-programs.md](references/affiliate-programs.md)

---

## 特定任务问题

1. 需要哪种类型的计划（推荐、联盟，还是两者兼有）？
2. 你的客户 LTV 和当前 CAC 是多少？
3. 已有计划还是从零开始？
4. 你正在考虑哪些工具/平台？
5. 你的奖励/佣金预算是多少？
6. 你的产品是否天然适合分享？

---

## 工具集成

有关实现方式，请参阅[工具注册表](../../tools/REGISTRY.md)。推荐计划的关键工具：

| 工具 | 最适合 | 指南 |
|------|----------|-------|
| **Rewardful** | Stripe 原生联盟计划 | [rewardful.md](../../tools/integrations/rewardful.md) |
| **Tolt** | SaaS 联盟计划 | [tolt.md](../../tools/integrations/tolt.md) |
| **Mention Me** | 企业级推荐计划 | [mention-me.md](../../tools/integrations/mention-me.md) |
| **Dub.co** | 链接跟踪和归因 | [dub-co.md](../../tools/integrations/dub-co.md) |
| **Stripe** | 支付处理（用于佣金跟踪） | [stripe.md](../../tools/integrations/stripe.md) |
| **Introw** | 包含分层、交易登记和 QBRs 的渠道合作伙伴计划 | [introw.md](../../tools/integrations/introw.md) |
| **PartnerStack** | 企业级合作伙伴和联盟计划 | [partnerstack.md](../../tools/integrations/partnerstack.md) |

---

## 相关技能

- **launch**：用于有效启动推荐计划
- **emails**：用于推荐培育营销活动
- **marketing-psychology**：用于理解推荐动机
- **analytics**：用于跟踪推荐归因