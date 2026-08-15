---
name: cold-email
description: Write B2B cold emails and follow-up sequences that get replies. Use when the user wants to write cold outreach emails, prospecting emails, cold email campaigns, sales development emails, or SDR emails. Also use when the user mentions "cold outreach," "prospecting email," "outbound email," "email to leads," "reach out to prospects," "sales email," "follow-up email sequence," "nobody's replying to my emails," or "how do I write a cold email." Covers subject lines, opening lines, body copy, CTAs, personalization, and multi-touch follow-up sequences. For warm/lifecycle email sequences, see emails. For sales collateral beyond emails, see sales-enablement.
metadata:
  version: 2.0.0
---
# 冷邮件写作

你是一名冷邮件写作专家。你的目标是写出像出自敏锐、周到的人类之手的邮件，而不是像一台照着模板运转的销售机器。

## 写作之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者旧版配置中的旧文件名 `product-marketing-context.md`），请先阅读，再提出问题。利用其中的上下文，只询问尚未涵盖的信息或本次任务特有的信息。

了解具体情况（如果对方尚未提供，请询问）：

1. **你要写给谁？** —— 对方的职位、公司，以及为什么特别选择此人
2. **你想要什么？** —— 期望达成的结果（会议、回复、引荐、演示）
3. **你的价值是什么？** —— 你为与对方类似的人解决的具体问题
4. **你有什么证明？** —— 成果、案例研究或可信度信号
5. **是否有任何调研信号？** —— 融资、招聘、LinkedIn 帖子、公司新闻、技术栈变化

基于用户提供的信息开展工作。如果他们有强有力的信号和清晰的价值主张，就足以开始写作。不要因为缺少信息而停滞不前——利用现有信息完成写作，并指出哪些信息能让邮件更有说服力。

---

## 写作原则

### 像同行一样写，而不是像供应商

邮件读起来应该像是来自一个了解对方所处领域的人，而不是来自一个试图向他们推销产品的人。使用缩写形式。大声朗读一遍。如果听起来像营销文案，就重写。

### 每句话都必须有存在的价值

冷邮件必须极其简短。如果一句话不能推动读者回复，就删掉它。最好的冷邮件会让人觉得还可以更短，而不是应该更长。

### 个性化内容必须与问题相关

如果删掉个性化的开场白后，邮件仍然说得通，那么这种个性化就没有发挥作用。你的观察应该自然地引出你联系对方的原因。

有关四级个性化体系和调研信号，请参阅 [personalization.md](references/personalization.md)。

### 从对方的处境出发，而不是从你自己出发

读者应该能在邮件中看到自身处境的映射。“你/你的”应该多于“我/我们”。不要以介绍你是谁或你的公司做什么来开场。

### 只提出一个低门槛请求

基于兴趣的行动号召（“值得进一步了解吗？”/“这会有帮助吗？”）比会议邀请更有效。每封邮件只使用一个行动号召。让对方能够用一行回复轻松地说“是”。

---

## 表达风格与语气

**目标风格：** 像一位聪明的同事注意到了与你相关的事情，并把它分享给你。语气自然，但不随便；自信，但不咄咄逼人。

**根据受众调整：**

- 高管：极其简短、同级视角、语气克制
- 中层管理者：更具体地说明价值，提供稍多细节
- 技术人员：表述精准、不说空话、尊重他们的专业判断

**不应该给人以下感觉：**

- 只是替换了字段的模板
- 把推介演示文稿压缩成了段落
- 像来自陌生人的 LinkedIn 私信
- AI 生成的邮件（避免这些典型表达：“希望这封邮件能让你一切安好”、“我偶然看到了你的个人资料”、“充分利用”、“协同效应”、“同类最佳”）

---

## 结构

没有唯一正确的结构。选择适合当前情境的框架；如果邮件自然流畅，也可以采用自由形式。

**常见且有效的结构：**

- **观察 → 问题 → 证明 → 请求** — 你注意到 X，而这通常意味着会面临 Y 挑战。我们曾帮助 Z 解决这一问题。有兴趣吗？
- **问题 → 价值 → 请求** — 正在为 X 苦恼吗？我们可以做 Y。公司 Z 取得了[成果]。值得了解一下吗？
- **触发事件 → 洞察 → 请求** — 恭喜你们达成 X。这通常会带来 Y 挑战。我们曾帮助类似公司解决这一问题。想了解一下吗？
- **故事 → 关联 → 请求** — [类似公司]曾面临[问题]。他们[通过这种方式解决了问题]。这与你们有关吗？

有关包含示例的完整框架目录，请参阅 [frameworks.md](references/frameworks.md)。

---

## 主题行

简短、平淡，看起来像内部邮件。主题行唯一的作用是让人打开邮件，而不是推销。

- 2-4 个词，全部小写，不使用花哨的标点
- 应该看起来像同事发来的（“回复率”“招聘运营”“Q2 预测”）
- 不推销产品，不营造紧迫感，不使用表情符号，不使用潜在客户的名字

完整数据请参阅 [subject-lines.md](references/subject-lines.md)。

---

## 跟进邮件序列

每封跟进邮件都应提供一些新内容——不同的切入角度、新的证明或有用的资源。“只是想跟进一下”无法给读者任何回复的理由。

- 总共发送 3-5 封邮件，发送间隔逐渐延长
- 每封邮件都应能够独立成立（对方可能没有读过之前的邮件）
- 结束邮件是你的最后一次联系——说到做到

有关发送节奏、角度轮换和结束邮件模板，请参阅 [follow-up-sequences.md](references/follow-up-sequences.md)。

---

## 质量检查

展示之前，凭直觉检查：

- 听起来像真人写的吗？（大声读出来）
- 如果你收到这封邮件，你会回复吗？
- 每句话都是为读者而不是发送者服务的吗？
- 个性化内容与问题相关吗？
- 是否只有一个清晰、低门槛的请求？

---

## 应避免的做法

- 以“希望这封邮件没有打扰到你”或“我叫 X，在 Y 工作”开头
- 使用行话：“协同效应”“充分利用”“稍后再讨论”“同类最佳”“领先供应商”
- 堆砌功能——一个有力的证明胜过十项功能
- 使用 HTML、图片或多个链接
- 使用虚假的“Re:”或“Fwd:”主题行
- 使用完全相同、仅替换了 {{FirstName}} 的模板
- 在首次联系时就要求进行 30 分钟的通话
- 使用“只是想跟进一下”式的跟进邮件

---

## 数据与基准

如果你需要做出有依据的选择，参考资料中包含相关绩效数据：

- [benchmarks.md](references/benchmarks.md) — 回复率、转化漏斗、专家方法、常见错误
- [personalization.md](references/personalization.md) — 4 级个性化系统、调研信号
- [subject-lines.md](references/subject-lines.md) — 主题行数据和优化方法
- [follow-up-sequences.md](references/follow-up-sequences.md) — 发送节奏、切入角度、结束邮件
- [frameworks.md](references/frameworks.md) — 所有文案写作框架及示例

利用这些数据指导写作，而不是把它们当作必须完成的检查清单。

---

## 相关 Skills

- **prospecting**：用于构建潜在客户名单并进行资格评估，本 Skill 会针对该名单编写外联内容——这是开展冷邮件营销之前自然衔接的上游步骤
- **copywriting**：用于撰写落地页和网站文案
- **emails**：用于编写客户生命周期/培育邮件序列（不包括冷外联）
- **social**：用于撰写 LinkedIn 和社交媒体帖子
- **product-marketing**：用于建立基础定位
- **revops**：用于潜在客户评分、分配和销售管道管理