---
name: suede-emails
description: "Suede-owned lifecycle email design for welcome, onboarding, nurture, re-engagement, post-purchase, and trigger-based sequences. Use when the user needs a multi-email flow with entry criteria, cadence, message roles, and a measurement plan — drip campaigns, welcome series, win-back flows, or trigger-based automations. NOT FOR: cold prospecting (use suede-cold-email), SMS as part of the same lifecycle program (use suede-sms), in-product activation flows (use suede-onboarding), or lifecycle-stage operations beyond email (use suede-revops)."
metadata:
  version: 2.0.0
---
# Suede 生命周期邮件系统

Suede 将生命周期邮件设计为一个具备同意意识的触发器、邮件角色、发送节奏和可衡量后续行动系统。在不臆测意图、不耗尽邮件列表、也不将生命周期消息与冷启动触达混淆的前提下，创建引导已知受众走向价值的邮件序列。

## 初始评估

**首先检查产品营销背景：**
如果 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`，或者在较旧的设置中使用旧版文件名 `product-marketing-context.md`）存在，请在提问前阅读它。使用该背景信息，并且仅询问其中尚未涵盖或与此任务具体相关的信息。

在创建序列之前，了解以下内容：

1. **序列类型**
   - 欢迎/引导序列
   - 潜在客户培育序列
   - 再互动序列
   - 购买后序列
   - 基于事件的序列
   - 教育序列
   - 销售序列

2. **受众背景**
   - 他们是谁？
   - 是什么触发他们进入此序列？
   - 他们已经知道/相信什么？
   - 他们目前与你之间是什么关系？
   - 他们已经在接收哪些其他邮件？
   - 当前需要超越的邮件表现是什么？

3. **目标**
   - 主要转化目标
   - 关系建设目标
   - 细分目标
   - 如何定义成功？

---

## 核心原则

一封邮件，一个任务：每封邮件只承担一个目的，并且只有一个主要 CTA。后续的一切——序列长度、角色、文案——都由此决定。

---

## 邮件序列策略

序列长度按下方“序列类型概览”中的类型设定；请使用这些数字，而不是通用范围。根据销售周期长度、产品复杂性和关系阶段进行调整。

### 时间安排/间隔
- 欢迎邮件：立即发送
- 序列早期：间隔 1-2 天
- 培育：间隔 2-4 天
- 长期：每周或每两周

考虑：
- B2B：避免周末
- B2C：测试周末
- 时区：按当地时间发送

### 主题行策略
- 清晰 > 巧妙
- 具体 > 模糊
- 以利益或好奇心驱动
- 理想长度为 40-60 个字符
- 测试表情符号（它们容易引发两极化反应）

**有效模式：**
- 问题：“还在为 X 苦恼吗？”
- 操作方法：“如何在 [时间范围] 内 [实现结果]”
- 数字：“获得 [益处] 的 3 种方法”
- 直接：“[名字]，你的 [物品] 已准备就绪”
- 故事预告：“我在 [主题] 上犯的错误”

### 预览文本
- 延续主题行
- 约 90-140 个字符
- 不要重复主题行
- 完成这个想法或增添悬念

---

## 序列类型概览

### 欢迎序列（注册后）
**长度**：在 12-14 天内发送 5-7 封邮件
**目标**：激活、建立信任、转化

关键邮件：
1. 欢迎 + 交付承诺的价值（立即）
2. 快速收获（第 1-2 天）
3. 故事/缘由（第 3-4 天）
4. 社会认同（第 5-6 天）
5. 克服异议（第 7-8 天）
6. 核心功能亮点（第 9-11 天）
7. 转化（第 12-14 天）

### 潜在客户培育序列（售前）
**长度**：在 2-3 周内发送 6-8 封邮件
**目标**：建立信任、展示专业能力、转化

关键邮件：
1. 交付引流赠品 + 介绍（立即）
2. 延展主题（第 2-3 天）
3. 深入剖析问题（第 4-5 天）
4. 解决方案框架（第 6-8 天）
5. 案例研究（第 9-11 天）
6. 差异化（第 12-14 天）
7. 异议处理（第 15-18 天）
8. 直接报价（第 19-21 天）

### 再互动序列
**长度**：2 周内发送 3-4 封邮件  
**触发条件**：30-60 天未活跃  
**目标**：挽回用户或清理列表  

关键邮件：
1. 问候（真诚关怀）
2. 价值提醒（有哪些新内容）
3. 激励措施（特别优惠）
4. 最后机会（继续订阅或取消订阅）

### 引导序列（产品用户）
**长度**：14 天内发送 5-7 封邮件  
**目标**：激活用户、推动其达到 aha 时刻、促成升级  
**注意**：与应用内引导协调——邮件提供支持，而非重复内容  

关键邮件：
1. 欢迎 + 第一步（立即发送）
2. 入门帮助（第 1 天）
3. 功能亮点（第 2-3 天）
4. 成功案例（第 4-5 天）
5. 问候（第 7 天）
6. 进阶技巧（第 10-12 天）
7. 升级/扩展（第 14 天以上）

**有关详细模板**：请参阅 [references/sequence-templates.md](references/sequence-templates.md)

---

## 按类别划分的邮件类型

六个类别：引导 · 留存 · 账单 · 使用 · 挽回 · 营销活动。

当你需要选择或设计单封邮件类型时，请阅读 [references/email-types.md](references/email-types.md)——其中包含每种类型的触发条件、时机、作用和文案模式，以及一份邮件审计检查清单。

---

## 邮件文案指南

### 结构
1. **钩子**：第一行吸引注意力
2. **背景**：为什么这对他们很重要
3. **价值**：有用的内容
4. **CTA**：下一步该做什么
5. **落款**：自然、温暖的结尾

### 格式
- 短段落（1-3 句话）
- 各部分之间留出空白
- 使用项目符号以便快速浏览
- 使用粗体强调（适量）
- 移动端优先（大多数人在手机上阅读）

### 语气
- 口语化，而非正式化
- 使用第一人称（I/we）和第二人称（you）
- 使用主动语态
- 大声读出来——听起来像人说的话吗？

**绝不要发布这些固定文案。** 这些是模型在未获得明确提示时会默认采用的生命周期邮件措辞，而且每一处都应替换为具体的句子：

- "We're thrilled to have you aboard!" / "We're excited to have you!"
- "Welcome to the family!" / "You're in good company"
- "Here's what you can do next" / "Let's get you started"
- "Don't miss out" / "Act now" / "Limited time only"
- "Quick question" / "Just checking in" / "Just following up"
- "We noticed you haven't..." / "We miss you!"
- "Ready to take your [X] to the next level?"
- "Unlock the full power of..." / "Supercharge your..."
- "As a valued customer" / "We value your feedback"

替换方式始终遵循同一种模式：说出这位读者做过的具体事情，或他们接下来会获得的具体内容。如果一句话对任何产品的任何收件人都成立，那么它只是上述固定文案的变体。

### 长度
- 事务性邮件为 50-125 个单词
- 教育性邮件为 150-300 个单词
- 故事驱动型邮件为 300-500 个单词

### CTA 指南
- 主要操作使用按钮
- 次要操作使用链接
- 每封邮件只设置一个明确的主要 CTA
- 按钮文本：操作 + 结果

**有关详细的文案、个性化和测试指南**：请参阅 [references/copy-guidelines.md](references/copy-guidelines.md)

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

### 对于每封电子邮件
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
```
Per email: open rate, click rate, unsubscribe rate
Per sequence: completion rate, primary-conversion rate, revenue or signups attributed
Baseline: [the user's current numbers for this audience, or "none supplied"]
Review point: [when to read results and what number would trigger a rewrite]
```

---

## 交付前自检

在呈现草拟的序列之前执行此检查。每个复选框都会针对你刚刚撰写的文案，检查本技能已经规定的一项规则。

- [ ] 每封电子邮件恰好有一个主要 CTA
- [ ] 每个主题行均为 40-60 个字符——进行字符计数，不要估算
- [ ] 没有任何预览文本重复其主题行
- [ ] 每封邮件的正文均在其类型对应的字数范围内（事务性 50-125 / 教育性 150-300 / 故事驱动型 300-500）
- [ ] 已为序列指定退出条件
- [ ] 文案中的任何位置都没有出现 Tone blocklist 中的字符串
- [ ] 已明确说明同意与抑制规则的假设，而不是默认其存在——说明使用哪个列表、采用哪种 opt-in，以及哪些情况会排除某个联系人

任何一个复选框未通过，都意味着必须在呈现之前修复。不要在注明失败项作为限定条件的情况下交付该序列。

---

## 实施交接

只有在读取用户已安装的工具和实时账户状态之后，才能选择服务提供商。Customer.io、Mailchimp、Resend、SendGrid、Kit 及类似服务可能支持工作流的部分环节，但此公开 Suede skill 不假设任何服务提供商、连接器、账户或权限可用。

在实施之前，返回：

1. 所需的触发器、受众、字段、抑制规则和退出标准
2. 与服务提供商无关的序列和事件契约
3. 必须检查的确切账户或集成
4. 在进行任何实时更改或发送之前，设置预览和审批检查点

---

## 边界

- 未获得明确授权，不得发送、安排发送、导入联系人、修改自动化流程或更改抑制列表。
- 不得臆造同意、可送达性、归因、受众或绩效数据。
- 不得承诺进入收件箱或带来收入；应将已观察到的结果与预测分开。
- 不得代表用户决定法律合规性、事务性分类或联系人资格。

## 路由

- 使用 `suede-lead-magnets` 处理为培育序列提供素材的资产。
- 使用 `suede-churn-prevention` 处理取消、挽留和催收策略。
- 使用 `suede-onboarding` 处理产品内激活，并使用 `suede-copy` 处理目标页面文案。
- 使用 `suede-ab-testing` 处理序列实验，并使用 `suede-revops` 处理生命周期阶段编排。
- 当同一生命周期项目还应通过短信触达用户时，使用 `suede-sms`——SMS 是叠加在电子邮件之上的渠道，不会取代电子邮件。
- 在序列中的任何电子邮件发送给真实收件人之前，使用 `suede-deslop`。
- 从这些技能中，将生命周期序列设计、发送节奏和消息角色重新路由回 `suede-emails`。