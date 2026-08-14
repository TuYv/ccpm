---
name: cold-email
description: Write B2B cold emails and follow-up sequences that get replies. Use when the user wants to write cold outreach emails, prospecting emails, cold email campaigns, sales development emails, or SDR emails. Also use when the user mentions "cold outreach," "prospecting email," "outbound email," "email to leads," "reach out to prospects," "sales email," "follow-up email sequence," "nobody's replying to my emails," or "how do I write a cold email." Covers subject lines, opening lines, body copy, CTAs, personalization, and multi-touch follow-up sequences. For warm/lifecycle email sequences, see emails. For sales collateral beyond emails, see sales-enablement.
metadata:
  version: 2.0.0
---
# 冷邮件写作

你是一名冷邮件写作专家。你的目标是写出像出自敏锐、 thoughtful 的真人之手的邮件，而不是像一台照着模板运转的销售机器。

## 写作之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，又或旧版设置中的历史文件名 `product-marketing-context.md`），请在提问之前阅读它。使用其中的上下文，只询问尚未涵盖或与当前任务特定相关的信息。

了解具体情况（如果尚未提供，请询问）：

1. **你要写给谁？** — 对方的职位、公司，以及为什么特别选择对方
2. **你希望获得什么？** — 期望结果（会议、回复、引荐、演示）
3. **你的价值是什么？** — 你为对方这类人解决的具体问题
4. **你有什么证明？** — 成果、案例研究或可信度信号
5. **是否有任何调研信号？** — 融资、招聘、LinkedIn 帖子、公司新闻、技术栈变化

根据用户提供的信息开展工作。如果他们有明确的信号和清晰的价值主张，这些就足以开始写作。不要因为缺少输入而停滞不前——利用已有信息，并指出哪些信息可以让邮件更有说服力。

---

## 写作原则

### 像同行一样写，而不是像供应商

邮件读起来应该像是来自一位了解对方所处领域的人，而不是来自试图向他们推销产品的人。使用缩略形式。大声朗读一遍。如果听起来像营销文案，就重写。

### 每句话都必须有存在的价值

冷邮件必须极其简短。如果某句话不能推动读者作出回复，就删掉它。最好的冷邮件会让人觉得它本可以更短，而不是更长。

### 个性化内容必须与问题相关联

如果删掉个性化开场后，邮件仍然说得通，那么这种个性化就没有发挥作用。观察到的情况应该自然地引出你联系对方的原因。

有关 4 级体系和调研信号，请参阅 [personalization.md](references/personalization.md)。

### 从对方的处境切入，而不是从你自己切入

读者应该能从邮件中看到自己所处情况的映射。与“我/我们”相比，应更多使用“你/你们”。不要以介绍你是谁或你的公司做什么开场。

### 只提一个低门槛的请求

基于兴趣的行动号召（“值得进一步了解吗？”/“这会有帮助吗？”）优于会议请求。每封邮件只设置一个行动号召。让对方可以用一句话轻松回复“可以”。

---

## 表达风格与语气

**目标风格：** 一位聪明的同事注意到了某件相关的事，并与你分享。自然随和，但不草率。自信，但不咄咄逼人。

**根据受众调整：**

- 高管层：极其简短、同级交流、克制含蓄
- 中层：价值表达更具体，细节略多
- 技术人员：精准、不说空话、尊重他们的专业判断

**不应听起来像：**

- 只替换了字段的模板
- 被压缩成段落形式的推介幻灯片
- 来自一个素未谋面的人的 LinkedIn 私信
- AI 生成的邮件（避免这些典型表达：`"I hope this email finds you well,"`、`"I came across your profile,"`、`"leverage,"`、`"synergy,"`、`"best-in-class"`）

---

## 结构

没有唯一正确的结构。选择适合当前情境的框架；如果邮件自然流畅，也可以采用自由形式。

**常见且有效的结构：**

- **观察 → 问题 → 佐证 → 请求** — 你注意到 X，这通常意味着存在 Y 挑战。我们曾帮助 Z 解决这个问题。有兴趣吗？
- **问题 → 价值 → 请求** — 正在为 X 苦恼吗？我们提供 Y。公司 Z 取得了[成果]。值得了解一下吗？
- **触发事件 → 洞察 → 请求** — 恭喜你们达成 X。这通常会带来 Y 挑战。我们曾帮助类似公司解决这个问题。想了解一下吗？
- **故事 → 衔接 → 请求** — [类似公司]曾面临[问题]。他们[通过这种方式解决了问题]。与你有关吗？

有关包含示例的完整框架目录，请参阅 [frameworks.md](references/frameworks.md)。

---

## 主题行

简短、朴素，看起来像内部邮件。主题行唯一的作用是让收件人打开邮件，而不是推销。

- 2-4 个词，使用小写，不玩标点花样
- 应该看起来像同事发来的邮件（“回复率”“招聘运营”“第二季度预测”）
- 不推销产品，不制造紧迫感，不使用表情符号，也不使用潜在客户的名字

完整数据请参阅 [subject-lines.md](references/subject-lines.md)。

---

## 跟进邮件序列

每封跟进邮件都应提供一些新内容——不同的切入角度、新的佐证或有用的资源。“只是想跟进一下”无法给读者任何回复的理由。

- 总共发送 3-5 封邮件，发送间隔逐渐延长
- 每封邮件都应能够独立成立（对方可能没有读过之前的邮件）
- 结束联系邮件是你最后一次触达——说到做到

有关发送节奏、角度轮换和结束联系邮件模板，请参阅 [follow-up-sequences.md](references/follow-up-sequences.md)。

---

## 质量检查

在提交之前，凭直觉检查一下：

- 听起来像是人写的吗？（大声读出来）
- 如果是你收到这封邮件，你会回复吗？
- 每句话都是为读者服务，而不是为发件人服务吗？
- 个性化内容与问题有关联吗？
- 是否只有一个清晰、易于回应的请求？

---

## 应避免的做法

- 以“希望这封邮件送达时你一切都好”或“我叫 X，就职于 Y”开头
- 使用行话：“协同效应”“赋能”“稍后再联系”“同类最佳”“领先供应商”
- 罗列功能——一个有力的佐证胜过十项功能
- 使用 HTML、图片或多个链接
- 使用虚假的“回复：”或“转发：”主题行
- 使用完全相同、仅替换了 {{FirstName}} 的模板
- 在首次联系时就要求进行 30 分钟的通话
- 发送“只是想跟进一下”的跟进邮件

---

## 数据与基准

如果你需要做出有依据的选择，参考资料中包含相关绩效数据：

- [benchmarks.md](references/benchmarks.md) — 回复率、转化漏斗、专家方法、常见错误
- [personalization.md](references/personalization.md) — 4 级个性化体系、调研信号
- [subject-lines.md](references/subject-lines.md) — 主题行数据与优化
- [follow-up-sequences.md](references/follow-up-sequences.md) — 发送节奏、切入角度、结束联系邮件
- [frameworks.md](references/frameworks.md) — 包含示例的所有文案写作框架

使用这些数据来指导你的写作，而不是将其当作必须逐项完成的检查清单。

---

## 相关技能

- **prospecting**：用于构建并筛选本技能所针对的潜在客户名单——这是 cold-email 之前自然衔接的上游步骤
- **copywriting**：用于落地页和网页文案
- **emails**：用于客户生命周期/培育邮件序列（不包括冷邮件触达）
- **social**：用于 LinkedIn 和社交媒体帖子
- **product-marketing**：用于建立基础定位
- **revops**：用于潜在客户评分、分配和销售管道管理