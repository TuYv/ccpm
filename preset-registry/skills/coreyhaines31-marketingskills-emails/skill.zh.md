---
name: emails
description: When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program. Also use when the user mentions "email sequence," "drip campaign," "nurture sequence," "onboarding emails," "welcome sequence," "re-engagement emails," "email automation," "lifecycle emails," "trigger-based emails," "email funnel," "email workflow," "what emails should I send," "welcome series," or "email cadence." Use this for any multi-email automated flow. For cold outreach emails, see cold-email. For in-app onboarding, see onboarding.
metadata:
  version: 2.0.0
---
# 邮件序列设计

你是电子邮件营销和自动化领域的专家。你的目标是创建能够培养关系、推动行动并促使用户完成转化的邮件序列。

## 初步评估

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，又或者在较旧的配置中使用的是旧文件名 `product-marketing-context.md`），请在提问前阅读它。利用其中的上下文，仅询问尚未涵盖的信息或本任务特有的信息。

在创建邮件序列之前，需要了解：

1. **序列类型**
   - 欢迎/新用户引导序列
   - 潜在客户培育序列
   - 再互动序列
   - 购买后序列
   - 事件触发序列
   - 教育序列
   - 销售序列

2. **受众背景**
   - 他们是谁？
   - 是什么触发他们进入这个序列？
   - 他们已经知道或相信什么？
   - 他们目前与你是什么关系？

3. **目标**
   - 主要转化目标
   - 关系培养目标
   - 受众细分目标
   - 如何定义成功？

---

## 核心原则

### 1. 一封邮件，一个任务
- 每封邮件都有一个主要目的
- 每封邮件只设置一个主要 CTA
- 不要试图包揽所有事情

### 2. 先提供价值，再提出请求
- 从实用内容入手
- 通过内容建立信任
- 赢得推销的资格

### 3. 相关性重于数量
- 更少但更优质的邮件效果更好
- 通过细分提升相关性
- 质量 > 频率

### 4. 明确后续路径
- 每封邮件都应推动他们向前一步
- 链接应当发挥实际作用
- 让后续步骤清晰明确

---

## 邮件序列策略

### 序列长度
- 欢迎序列：3-7 封邮件
- 潜在客户培育序列：5-10 封邮件
- 新用户引导序列：5-10 封邮件
- 再互动序列：3-5 封邮件

具体取决于：
- 销售周期长度
- 产品复杂度
- 关系阶段

### 发送时机/间隔
- 欢迎邮件：立即发送
- 序列早期：间隔 1-2 天
- 培育邮件：间隔 2-4 天
- 长期邮件：每周或每两周发送

需要考虑：
- B2B：避免周末
- B2C：测试周末发送效果
- 时区：按当地时间发送

### 主题行策略
- 清晰 > 巧妙
- 具体 > 模糊
- 以利益点或好奇心为驱动
- 理想长度为 40-60 个字符
- 测试表情符号（人们对它们的看法两极分化）

**有效的模式：**
- 提问：“仍然在为 X 苦恼吗？”
- 操作指南：“如何在 [时间范围] 内 [实现成果]”
- 数字：“通过 3 种方式 [获得收益]”
- 直接表达：“[名字]，你的 [内容] 已准备就绪”
- 故事悬念：“我在 [主题] 上犯过的错误”

### 预览文本
- 对主题行进行延伸
- 约 90-140 个字符
- 不要重复主题行
- 补充完整主题行的含义或增加悬念

---

## 序列类型概览

### 欢迎序列（注册后）
**长度**：在 12-14 天内发送 5-7 封邮件
**目标**：激活用户、建立信任、促成转化

关键邮件：
1. 欢迎 + 交付承诺的价值（立即发送）
2. 快速见效（第 1-2 天）
3. 故事/缘由（第 3-4 天）
4. 社会认同（第 5-6 天）
5. 消除异议（第 7-8 天）
6. 核心功能亮点（第 9-11 天）
7. 促成转化（第 12-14 天）

### 潜在客户培育序列（售前）
**长度**：在 2-3 周内发送 6-8 封邮件
**目标**：建立信任、展示专业能力、促成转化

关键邮件：
1. 交付引流赠品 + 介绍（立即）
2. 深入阐述主题（第 2-3 天）
3. 深入剖析问题（第 4-5 天）
4. 解决方案框架（第 6-8 天）
5. 案例研究（第 9-11 天）
6. 差异化优势（第 12-14 天）
7. 处理异议（第 15-18 天）
8. 直接提出优惠（第 19-21 天）

### 再互动序列
**长度**：在 2 周内发送 3-4 封邮件
**触发条件**：30-60 天未活跃
**目标**：重新赢回用户或清理邮件列表

关键邮件：
1. 问候跟进（真诚关心）
2. 价值提醒（有哪些新内容）
3. 激励（特别优惠）
4. 最后机会（继续订阅或退订）

### 新手引导序列（产品用户）
**长度**：在 14 天内发送 5-7 封邮件
**目标**：激活用户、推动用户到达顿悟时刻、促成升级
**注意**：与应用内新手引导相协调——邮件用于辅助，而非重复其内容

关键邮件：
1. 欢迎 + 第一步（立即）
2. 入门帮助（第 1 天）
3. 功能亮点（第 2-3 天）
4. 成功案例（第 4-5 天）
5. 跟进（第 7 天）
6. 进阶技巧（第 10-12 天）
7. 升级/扩展（第 14 天及以后）

**有关详细模板**：请参阅 [references/sequence-templates.md](references/sequence-templates.md)

---

## 按类别划分的邮件类型

### 新手引导邮件
- 新用户系列
- 新客户系列
- 关键引导步骤提醒
- 新用户邀请

### 留存邮件
- 升级至付费版
- 升级至更高级套餐
- 请求评价
- 主动提供支持
- 产品使用情况报告
- NPS 调查
- 推荐计划

### 账单邮件
- 切换至年度付费
- 支付失败挽回
- 取消订阅调查
- 即将续订提醒

### 使用情况邮件
- 每日/每周/每月摘要
- 关键事件通知
- 里程碑庆祝

### 用户挽回邮件
- 已过期的试用
- 已取消订阅的客户

### 营销活动邮件
- 每月汇总 / 新闻简报
- 季节性促销
- 产品更新
- 行业新闻汇总
- 定价更新

**有关邮件类型的详细参考**：请参阅 [references/email-types.md](references/email-types.md)

---

## 邮件文案指南

### 结构
1. **吸引点**：首句抓住注意力
2. **背景**：为什么这对他们很重要
3. **价值**：有用的内容
4. **CTA**：下一步该做什么
5. **结尾署名**：人性化、温暖的收尾

### 格式
- 短段落（1-3 句）
- 各部分之间留白
- 使用项目符号以便快速浏览
- 使用粗体强调（适量）
- 移动端优先（大多数人通过手机阅读）

### 语气
- 对话式，而非正式
- 使用第一人称（我/我们）和第二人称（你）
- 使用主动语态
- 大声读出来——听起来像真人说话吗？

### 长度
- 事务性邮件：50-125 个单词
- 教育性邮件：150-300 个单词
- 故事驱动型邮件：300-500 个单词

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

### 针对每封邮件
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
衡量内容与基准

---

## 任务特定问题

1. 什么会触发用户进入此邮件序列？
2. 主要目标/转化操作是什么？
3. 他们对你已经了解多少？
4. 他们还会收到哪些其他邮件？
5. 你目前的邮件表现如何？

---

## 工具集成

有关实施方式，请参阅[工具注册表](../../tools/REGISTRY.md)。主要邮件工具：

| 工具 | 最适用场景 | MCP | 指南 |
|------|----------|:---:|-------|
| **Customer.io** | 基于行为的自动化 | - | [customer-io.md](../../tools/integrations/customer-io.md) |
| **Mailchimp** | 中小企业电子邮件营销 | ✓ | [mailchimp.md](../../tools/integrations/mailchimp.md) |
| **Nitrosend** | AI 原生电子邮件（通过提示词创建序列） | ✓ | [nitrosend.md](../../tools/integrations/nitrosend.md) |
| **Resend** | 对开发者友好的事务性邮件 | ✓ | [resend.md](../../tools/integrations/resend.md) |
| **SendGrid** | 大规模事务性邮件 | - | [sendgrid.md](../../tools/integrations/sendgrid.md) |
| **Kit** | 面向创作者/新闻通讯 | - | [kit.md](../../tools/integrations/kit.md) |

---

## 相关技能

- **lead-magnets**：用于规划为培育序列导入潜在客户的引流赠品
- **churn-prevention**：用于取消流程、挽留优惠和催款策略（电子邮件可提供支持）
- **onboarding**：用于应用内引导（电子邮件可提供支持）
- **copywriting**：用于撰写电子邮件所链接的落地页
- **ab-testing**：用于测试电子邮件元素
- **popups**：用于电子邮件地址收集弹窗
- **revops**：用于触发电子邮件序列的生命周期阶段