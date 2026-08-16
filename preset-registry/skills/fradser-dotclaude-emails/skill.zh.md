---
name: emails
description: When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program. Also use when the user mentions "email sequence," "drip campaign," "nurture sequence," "onboarding emails," "welcome sequence," "re-engagement emails," "email automation," "lifecycle emails," "trigger-based emails," "email funnel," "email workflow," "what emails should I send," "welcome series," or "email cadence." Use this for any multi-email automated flow. For cold outreach emails, see cold-email. For in-app onboarding, see onboarding.
metadata:
  version: 2.0.0
---
# 邮件序列设计

你是电子邮件营销和自动化方面的专家。你的目标是创建能够培养关系、推动行动并促使用户逐步实现转化的邮件序列。

## 初步评估

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，在旧版配置中也可能使用旧文件名 `product-marketing-context.md`），请在提问前阅读它。使用其中的上下文，只询问尚未涵盖或与此任务特别相关的信息。

在创建邮件序列之前，需要了解：

1. **序列类型**
   - 欢迎/用户引导序列
   - 潜在客户培育序列
   - 再互动序列
   - 购买后序列
   - 基于事件的序列
   - 教育序列
   - 销售序列

2. **受众背景**
   - 他们是谁？
   - 是什么触发他们进入这个序列？
   - 他们已经知道或相信什么？
   - 他们目前与你是什么关系？

3. **目标**
   - 首要转化目标
   - 关系建设目标
   - 用户细分目标
   - 如何定义成功？

---

## 核心原则

### 1. 一封邮件，一个任务
- 每封邮件都有一个主要目的
- 每封邮件只设置一个主要 CTA
- 不要试图面面俱到

### 2. 先提供价值，再提出请求
- 以实用价值为先
- 通过内容建立信任
- 先赢得销售的资格

### 3. 相关性胜于数量
- 更少但更优质的邮件效果更好
- 通过用户细分提高相关性
- 质量 > 频率

### 4. 明确后续路径
- 每封邮件都要推动用户迈向下一步
- 链接应当发挥实际作用
- 让后续步骤清晰明确

---

## 邮件序列策略

### 序列长度
- 欢迎序列：3-7 封邮件
- 潜在客户培育序列：5-10 封邮件
- 用户引导序列：5-10 封邮件
- 再互动序列：3-5 封邮件

具体取决于：
- 销售周期长度
- 产品复杂度
- 关系阶段

### 时机/间隔
- 欢迎邮件：立即发送
- 序列前期：间隔 1-2 天
- 培育序列：间隔 2-4 天
- 长期序列：每周或每两周发送

需要考虑：
- B2B：避开周末
- B2C：测试周末发送效果
- 时区：按当地时间发送

### 主题行策略
- 清晰 > 巧妙
- 具体 > 模糊
- 以利益点或好奇心驱动
- 理想长度为 40-60 个字符
- 测试表情符号的效果（人们对它们的看法两极分化）

**行之有效的模式：**
- 问题："仍在为 X 苦恼吗？"
- 操作指南："如何在 [时间范围] 内 [实现成果]"
- 数字："实现 [收益] 的 3 种方法"
- 直接："[名字]，你的 [内容] 已准备就绪"
- 故事悬念："我在 [主题] 上犯过的错误"

### 预览文本
- 对主题行进行延伸
- 约 90-140 个字符
- 不要重复主题行
- 补全表达或增加悬念

---

## 序列类型概览

### 欢迎序列（注册后）
**长度**：在 12-14 天内发送 5-7 封邮件
**目标**：促进激活、建立信任、推动转化

关键邮件：
1. 欢迎 + 交付承诺的价值（立即发送）
2. 快速见效（第 1-2 天）
3. 故事/缘由（第 3-4 天）
4. 社会认同（第 5-6 天）
5. 化解异议（第 7-8 天）
6. 核心功能亮点（第 9-11 天）
7. 推动转化（第 12-14 天）

### 潜在客户培育序列（售前）
**长度**：在 2-3 周内发送 6-8 封邮件
**目标**：建立信任、展示专业能力、推动转化

关键邮件：
1. 发送潜在客户诱饵 + 介绍（立即）
2. 深入阐述主题（第 2-3 天）
3. 深入剖析问题（第 4-5 天）
4. 解决方案框架（第 6-8 天）
5. 案例研究（第 9-11 天）
6. 差异化优势（第 12-14 天）
7. 异议处理（第 15-18 天）
8. 直接提出优惠（第 19-21 天）

### 再互动序列
**长度**：2 周内发送 3-4 封邮件
**触发条件**：30-60 天未活跃
**目标**：重新赢回用户或清理邮件列表

关键邮件：
1. 关怀问候（真诚关心）
2. 价值提醒（最新动态）
3. 激励措施（特别优惠）
4. 最后机会（继续订阅或取消订阅）

### 引导序列（产品用户）
**长度**：14 天内发送 5-7 封邮件
**目标**：激活用户、推动用户到达顿悟时刻、促进升级
**注意**：与应用内引导相协调——邮件提供支持，而不是重复其内容

关键邮件：
1. 欢迎 + 第一步（立即）
2. 入门帮助（第 1 天）
3. 功能亮点（第 2-3 天）
4. 成功案例（第 4-5 天）
5. 跟进询问（第 7 天）
6. 高级技巧（第 10-12 天）
7. 升级/扩展（第 14 天及以后）

**有关详细模板**：请参阅 [references/sequence-templates.md](references/sequence-templates.md)

---

## 按类别划分的邮件类型

### 引导邮件
- 新用户系列
- 新客户系列
- 关键引导步骤提醒
- 新用户邀请

### 留存邮件
- 升级到付费版
- 升级到更高级别的套餐
- 请求评价
- 主动提供支持
- 产品使用情况报告
- NPS 调查
- 推荐计划

### 账单邮件
- 切换到年度套餐
- 支付失败恢复
- 取消订阅调查
- 即将续订提醒

### 使用情况邮件
- 每日/每周/每月摘要
- 关键事件通知
- 里程碑庆祝

### 用户召回邮件
- 已过期的试用
- 已取消服务的客户

### 营销活动邮件
- 每月汇总 / 新闻简报
- 季节性促销
- 产品更新
- 行业新闻汇总
- 定价更新

**有关邮件类型的详细参考信息**：请参阅 [references/email-types.md](references/email-types.md)

---

## 邮件文案指南

### 结构
1. **吸引点**：第一句话抓住注意力
2. **背景**：说明为什么这对他们很重要
3. **价值**：提供有用的内容
4. **CTA**：下一步该做什么
5. **结束语**：以人性化、温暖的方式收尾

### 格式
- 短段落（1-3 句话）
- 各部分之间留白
- 使用项目符号以便快速浏览
- 使用粗体突出重点（适度使用）
- 移动端优先（大多数人使用手机阅读）

### 语气
- 对话式，而非正式
- 使用第一人称（我/我们）和第二人称（你）
- 使用主动语态
- 大声朗读——听起来像真人说话吗？

### 长度
- 事务性邮件为 50-125 个词
- 教育性邮件为 150-300 个词
- 故事驱动型邮件为 300-500 个词

### CTA 指南
- 主要操作使用按钮
- 次要操作使用链接
- 每封邮件只设置一个明确的主要 CTA
- 按钮文本：操作 + 结果

**有关文案、个性化和测试的详细指南**：请参阅 [references/copy-guidelines.md](references/copy-guidelines.md)

---

## 输出格式

### 序列概览
```
Sequence Name: [Name]
Trigger: [What starts the sequence]
Goal: [Primary conversion goal]
Length: [Number of emails]
Timing: [Delay between emails]
Exit Conditions: [When they leave the sequence]
```

### 对于每封邮件
```
Email [#]: [Name/Purpose]
Send: [Timing]
Subject: [Subject line]
Preview: [Preview text]
Body: [Full copy]
CTA: [Button text] → [Link destination]
Segment/Conditions: [If applicable]
```

### 指标计划
衡量内容和基准

---

## 任务特定问题

1. 什么会触发用户进入此邮件序列？
2. 主要目标/转化操作是什么？
3. 他们对你已经了解多少？
4. 他们还会收到哪些其他邮件？
5. 你当前的邮件表现如何？

---

## 工具集成

有关实施方式，请参阅[工具注册表](../../tools/REGISTRY.md)。主要邮件工具：

| 工具 | 最适合 | MCP | 指南 |
|------|----------|:---:|-------|
| **Customer.io** | 基于行为的自动化 | - | [customer-io.md](../../tools/integrations/customer-io.md) |
| **Mailchimp** | 中小企业电子邮件营销 | ✓ | [mailchimp.md](../../tools/integrations/mailchimp.md) |
| **Nitrosend** | AI 原生电子邮件（通过提示词创建邮件序列） | ✓ | [nitrosend.md](../../tools/integrations/nitrosend.md) |
| **Resend** | 对开发者友好的事务性邮件 | ✓ | [resend.md](../../tools/integrations/resend.md) |
| **SendGrid** | 大规模事务性邮件 | - | [sendgrid.md](../../tools/integrations/sendgrid.md) |
| **Kit** | 专注于创作者/新闻简报 | - | [kit.md](../../tools/integrations/kit.md) |

---

## 相关技能

- **lead-magnets**：用于规划为培育邮件序列引流的潜在客户磁石
- **churn-prevention**：用于取消流程、挽留优惠和催款策略（电子邮件可为其提供支持）
- **onboarding**：用于应用内引导（电子邮件可为其提供支持）
- **copywriting**：用于撰写电子邮件所链接的落地页
- **ab-testing**：用于测试电子邮件元素
- **popups**：用于捕获电子邮件地址的弹窗
- **revops**：用于触发电子邮件序列的生命周期阶段