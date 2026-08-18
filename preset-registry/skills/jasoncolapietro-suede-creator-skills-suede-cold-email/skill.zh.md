---
name: suede-cold-email
description: "Suede-owned B2B cold-email discipline for evidence-based personalization, subject lines, opening lines, concise bodies, one clear CTA, and bounded follow-up sequences. Use when writing or repairing outbound email to qualified prospects. NOT FOR: building or qualifying the prospect list (use suede-prospecting), lifecycle or nurture email (use suede-emails), or broader sales collateral (use suede-sales-enablement)."
metadata:
  version: 2.0.0
---
# Suede 冷邮件写作

使用这份 Suede 冷邮件指南，撰写简洁、有证据支撑、听起来像真人且尊重收件人的外联邮件。

## 写作前

**先检查产品营销背景：**
如果存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`，或者在旧版设置中使用的旧文件名 `product-marketing-context.md`），请在提问前阅读。使用其中的背景信息，只询问尚未涵盖或与当前任务相关的具体信息。

了解以下情况（如未提供，请询问）：

1. **你要写给谁？** —— 对方的职位、公司，以及为什么特别选择对方
2. **你想达成什么？** —— 目标结果（会议、回复、引荐、演示）
3. **价值是什么？** —— 你为类似他们的人解决的具体问题
4. **你的证明是什么？** —— 成果、案例研究或可信度信号
5. **有哪些研究信号？** —— 融资、招聘、LinkedIn 帖子、公司新闻、技术栈变化

根据用户提供的信息开展工作。如果对方有强信号和清晰的价值主张，这些就足以开始写作。不要因为缺少信息而停滞不前——利用现有信息，并指出哪些补充内容可以让邮件更有说服力。

---

## 写作原则

### 像同行一样写，而不是像供应商一样写

邮件读起来应该像是来自一个了解对方工作环境的人，而不是一个试图向对方推销产品的人。使用缩略形式。大声读出来。如果听起来像营销文案，就重写。

### 每句话都必须有存在的价值

冷邮件必须极其简短。如果一句话不能推动读者回复，就删掉。最好的冷邮件让人觉得本来还可以更短，而不是更长。

### 个性化必须与问题相关联

如果删掉个性化开场，邮件仍然说得通，那么这种个性化就没有发挥作用。这个观察应该自然地引出你联系对方的原因。

参见 [personalization.md](references/personalization.md)，了解四级体系和研究信号。

### 从对方的世界出发，而不是从你的世界出发

读者应该能在邮件中看到自己的处境。“你/你的”应该多于“我/我们”。不要以介绍你是谁或你的公司做什么开头。

### 只提出一个低阻力的请求

基于兴趣的 CTA（“值得了解一下吗？”/“这会有帮助吗？”）胜过直接提出会议请求。每封邮件只使用一个 CTA。让对方只需用一句话回复“可以”，就能轻松答应。

---

## 语气与风格

**目标语气：** 一个聪明的同事注意到了相关信息，并把它分享出来。口语化但不随意。自信但不强势。

**根据受众调整：**

- C-suite：极其简短、以同行的口吻表达、含蓄克制
- 中层：提供更具体的价值，细节稍多
- 技术人员：表述精准、不说空话、尊重他们的智力

**不应呈现出的感觉：**

- 只替换了字段的模板
- 把演示文稿压缩成段落后的推销稿
- 发给陌生人的 LinkedIn 私信
- AI 生成的邮件（避免明显的套路：“希望这封邮件能找到你时一切都好”、“我看到了你的个人资料”、“利用”、“协同效应”、“同类最佳”）

---

## 结构

没有唯一正确的结构。选择适合具体情境的框架；如果邮件不需要框架也能自然展开，也可以自由发挥。

**常见且有效的结构：**

- **观察 → 问题 → 证明 → 请求** — 你注意到 X，这通常意味着存在 Y 挑战。我们曾帮助 Z 解决这一问题。有兴趣了解一下吗？
- **问题 → 价值 → 请求** — 正在为 X 苦恼吗？我们能做 Y。Z 公司看到了[结果]。值得了解一下吗？
- **触发点 → 洞察 → 请求** — 恭喜你们实现了 X。这通常会带来 Y 挑战。我们曾帮助类似公司解决这一问题。想了解一下吗？
- **故事 → 衔接 → 请求** — [类似公司]遇到了[问题]。他们[用这种方式解决了问题]。这对你们有参考价值吗？

如需查看包含示例的完整框架目录，请参阅 [frameworks.md](references/frameworks.md)。

---

## 主题行

简短、平淡、看起来像内部邮件。主题行唯一的任务是让对方打开邮件——而不是进行销售。

- 2-4 个单词，使用小写，不要玩标点花样
- 应该看起来像来自同事（“回复率”“招聘运营”“Q2 预测”）
- 不要推销产品，不要制造紧迫感，不要使用表情符号，不要使用潜在客户的名字

完整数据请参阅 [subject-lines.md](references/subject-lines.md)。

---

## 后续跟进序列

每次跟进都应带来新的内容——不同的角度、新的证明、有用的资源。“只是来跟进一下”不会给读者回复的理由。

- 总共发送 3-5 封邮件，间隔逐渐增加
- 每封邮件都应独立成立（对方可能没有读过之前的邮件）
- 结束联系邮件是最后一次触达——要兑现承诺

关于节奏、角度轮换和结束联系邮件模板，请参阅 [follow-up-sequences.md](references/follow-up-sequences.md)。

---

## 质量检查

在提交草稿前，按以下清单检查一遍。每一项都应对应文本中可以观察到的内容，而不是对文本的主观感受。

- [ ] 正文中“You/your”的数量多于“I/we”
- [ ] 删除个性化句子后，紧接着的句子会变得不连贯
- [ ] 只有一个请求，并且对方可以用一行回复回答
- [ ] 正文少于 75 个单词
- [ ] 草稿中完全没有出现 What to Avoid 中的任何字符串——逐条检查该列表中的术语，而不是凭整体印象判断
- [ ] 朗读时使用了缩写形式，并且没有任何句子读起来像营销文案

任何一项不符合，都意味着需要在提交前重写。不要附带免责声明提交一份有问题的草稿。

---

## 输出格式

每封邮件都必须按照以下格式输出，并逐字使用这些字段标签。

```
Subject: [2-4 words, lowercase]

Body: (NN words — target under 75)
[the email exactly as it would be pasted into the send tool]

CTA: [the single ask, quoted from the body]

Personalization source: [the specific signal this email traces to — the post, the filing,
the job ad, the release — with enough detail that the user can confirm it is real]
```

每封邮件都必须包含 `Personalization source:`。这是让“不得虚构个性化内容”这一边界可审计的依据。它应当说明这封邮件所依据的具体真实来源——帖子、文件、招聘广告或发布内容——并提供足够的细节，让用户能够确认其真实性。如果无法指出真实来源，就不算有个性化内容，开头那句话也必须修改。

仅当用户要求的是一个序列而不是单封邮件时，才输出跟进表：

| # | 发送日 | 所携带的新角度 | 主题 |
|---|---|---|---|
| 1 | 0 | ... | ... |
| 2 | +3 | ... | ... |

总计 3-5 封邮件——有关发送节奏和角度轮换，请参阅 [follow-up-sequences.md](references/follow-up-sequences.md)。对于单条消息请求，完全省略此表。

---

## 应避免的事项

- 以“I hope this email finds you well”或“My name is X and I work at Y”开头
- 行话：“synergy”“leverage”“circle back”“best-in-class”“leading provider”
- 罗列功能——一个证明点胜过十项功能
- HTML、图片或多个链接
- 虚假的“Re:”或“Fwd:”主题行
- 只替换 {{FirstName}} 的雷同模板
- 首次触达时要求进行 30 分钟的通话
- 在跟进邮件中使用“Just checking in”

---

## 数据与基准

如果你需要做出有依据的选择，参考资料中包含绩效数据：

- [benchmarks.md](references/benchmarks.md) — 回复率、转化漏斗、专家方法、常见错误
- [personalization.md](references/personalization.md) — 4 级个性化体系、研究信号
- [subject-lines.md](references/subject-lines.md) — 主题行数据与优化方法
- [follow-up-sequences.md](references/follow-up-sequences.md) — 发送节奏、角度、结束跟进邮件
- [frameworks.md](references/frameworks.md) — 所有文案框架及示例

使用这些数据来指导写作，而不是把它们当作需要逐项满足的清单。

---

## 边界

- 不得捏造个性化内容、共同联系人、客户事实、结果、紧迫性或先前联系。
- 不得抓取受禁止的数据、暴露敏感个人信息，或建议规避同意要求、垃圾邮件规定或平台规则。
- 未获得针对确切收件人和邮件序列的明确授权，不得向任何人发送、安排、加入序列或进行跟进。
- 不得认定沉默即表示同意；在执行任何操作前，遵守退订请求和抑制名单。

## 路由

- 需要合格的潜在客户名单 -> 使用 `suede-prospecting`。
- 需要生命周期或培育邮件 -> 使用 `suede-emails`。
- 需要定位背景或营销资料 -> 使用 `suede-product-marketing` 或 `suede-sales-enablement`。
- 需要 CRM 阶段、潜在客户路由或抑制操作 -> 使用 `suede-revops`。
- 任何内容发送给真实收件人之前 -> 使用 `suede-deslop`。
- 对于来自这些技能的冷启动外呼消息和跟进邮件撰写，转回 `suede-cold-email`。