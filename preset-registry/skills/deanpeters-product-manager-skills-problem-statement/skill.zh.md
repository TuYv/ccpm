---
name: problem-statement
argument-hint: "[user and their struggle]"
description: Write a user-centered problem statement with who is blocked, what they are trying to do, why it matters, and how it feels. Use when framing discovery, prioritization, or a PRD.
intent: >-
  Articulate a problem from the user's perspective using an empathy-driven framework that captures who they are, what they're trying to do, what's blocking them, why, and how it makes them feel. Use this to align stakeholders on the problem before jumping to solutions, and to frame product work around user outcomes rather than feature requests.
type: component
theme: discovery-research
best_for:
  - "Framing a problem before anyone proposes a solution"
  - "Getting a team to agree on who is blocked and why it matters"
  - "Turning a vague complaint into something a team can act on"
scenarios:
  - "The team keeps jumping to solutions and we've never written down the actual problem"
  - "I need a crisp problem statement for a PRD that a skeptical exec will read"
estimated_time: "10-20 min"
---
## 目的
使用以同理心为驱动的框架，从用户视角清晰阐述问题，涵盖他们是谁、他们想做什么、什么在阻碍他们、原因是什么，以及这让他们有何感受。利用它在直接着手解决方案之前，帮助利益相关方就问题达成一致，并围绕用户成果而非功能请求来规划产品工作。

这不是需求文档，而是以人为本的问题叙事，旨在确保你正在解决一个值得解决的问题。

## 输入

**最适合提供：** 用户是谁，以及他们正努力完成什么。
**同样有用：** 什么在阻碍他们、为什么这很重要、他们有何感受，以及支持性证据。

调用时一并提供的任何内容——技能名称之后的文本、粘贴的上下文信息，或追加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些内容，并跳过其已涵盖的问题；不要重复询问。

**什么信息都没准备？也没问题。** 该技能会先询问用户是谁以及他们的目标是什么——没有明确“谁”的问题陈述，不过是一个在寻找掩护的解决方案。

**调用示例：** `Problem statement: clinic schedulers double-book exam rooms because the calendar doesn't show equipment availability.`

## 核心概念

### 问题框定框架
该框架以待办任务理论和同理心地图为基础，将问题组织为：

**问题框定叙事：**
- **我是：** [描述正在经历该问题的用户画像]
- **正试图：** [用户画像所关注的预期成果]
- **但是：** [阻碍其实现预期成果的障碍]
- **因为：** [问题的根本原因]
- **这让我感到：** [情绪影响]

**背景与约束：**
- [地理、技术、时间、人口统计等因素]

**最终问题陈述：**
- [单一、简洁且富有同理心的总结]

### 为什么这种结构有效
- **以用户画像为中心：** 促使你从用户视角看待问题
- **聚焦成果：** “正试图”强调期望的结果，而非任务
- **根本原因分析：** “因为”推动你越过表象，深入探究底层问题
- **情绪认同：** “这让我感到”赋予问题人性化色彩，并建立同理心
- **结合具体情境：** 约束条件体现了现实世界中的限制

### 反模式（这不是什么）
- **不是伪装成问题的解决方案：** “问题在于我们缺少由 AI 驱动的分析功能” = 偷偷塞入解决方案
- **不是业务问题：** “我们的收入下降了”不是用户问题（而是一种表象）
- **不是功能请求：** “用户需要一个仪表板”不是问题（他们究竟想完成什么？）
- **不能泛泛而谈：** “用户想要更好的 UX”过于模糊，无法转化为行动

### 何时使用
- 启动探索或问题验证工作时
- 在构思解决方案之前，协调利益相关方达成一致
- 向工程、设计或高管团队传达问题时
- 已收到功能请求，但其背后的根本问题尚不清晰时
- 阐述为什么某个问题值得解决时

### 何时不应使用
- 尚未开展任何用户研究时（不要猜测——先进行访谈）
- 用于内部运营问题时（本框架面向用户侧问题）
- 用作 PRD 的替代品时（本框架用于界定问题；PRD 用于定义解决方案）

---

## 应用

使用 `template.md` 获取完整的填写结构。

### 第 1 步：收集用户背景信息
在起草之前，请确保你已掌握：
- **用户访谈或研究：** 直接引述、观察到的行为、痛点
- **待办任务洞察：** 用户“雇用”你的产品来完成什么（参考 `skills/jobs-to-be-done/SKILL.md`）
- **用户画像清晰度：** 具体是谁遇到了这个问题（参考 `skills/proto-persona/SKILL.md`）
- **约束条件数据：** 地理、技术、时间、人口统计方面的限制

**如果缺少背景信息：** 开展探索性访谈、情境调查或用户跟踪观察。不要凭空捏造问题。

---

### 第 2 步：起草问题框定叙事

从用户画像的视角填写模板：

```markdown
## Problem Framing Narrative

**I am:** [Describe the key persona, highlighting 3-4 key characteristics]
- [Key pain point or characteristic 1]
- [Key pain point or characteristic 2]
- [Key pain point or characteristic 3]

**Trying to:**
- [Single sentence listing the desired outcomes the persona cares most about]

**But:**
- [Describe the barriers preventing the persona from achieving outcomes]
- [Job-to-be-done or outcome obstruction 1]
- [Job-to-be-done or outcome obstruction 2]
- [Job-to-be-done or outcome obstruction 3]

**Because:**
- [Describe the root cause empathetically]

**Which makes me feel:**
- [Describe the emotions from the persona's perspective]
```

**质量检查：**
- **“我是谁”的具体性：** 你能想象出这个人吗？还是描述过于笼统（例如“忙碌的专业人士”）？
- **“试图做什么”的清晰度：** 这是成果（可衡量），还是任务（活动）？
- **“但是”的深度：** 这些是真正的障碍，还是仅仅带来不便？
- **“因为”的真实性：** 这是根本原因，还是仅仅是一种表象？
- **“让我感觉”的可信度：** 这些情绪来自研究，还是来自假设？

---

### 第 3 步：记录背景与约束条件

```markdown
## Context & Constraints

- [Enumerate geographic, technological, time-based, or demographic factors]
- [e.g., "Must work offline in rural areas with limited connectivity"]
- [e.g., "Used by non-technical users unfamiliar with complex software"]
- [e.g., "Time-sensitive: decisions must be made within 24 hours"]
```

**质量检查：**
- **相关性：** 这些约束条件是否会直接影响该问题？
- **具体性：** 它们是否足够具体，能够为设计决策提供依据？

---

### 第 4 步：拟定最终问题陈述

将叙事提炼为一句有力的话：

```markdown
## Final Problem Statement

[Single, concise statement that provides a powerful and empathetic summary]
```

**公式：** `[Persona] needs a way to [desired outcome] because [root cause], which currently [emotional/practical impact].`

**示例：** “企业 IT 管理员需要一种能在 5 分钟内完成用户账户配置的方法，因为当前流程需要人工审批，耗时超过 2 小时，进而导致项目延期并使最终用户感到沮丧。”

**质量检查：**
- **一个句子：** 如果需要多个句子才能表达，说明问题还不够明确凝练
- **可衡量：** 你能否判断问题是否已经解决？
- **有同理心：** 它能否引发情感共鸣？
- **易于分享：** 你能否在会议上说出这句话，并让利益相关者点头认同？

---

### 第 5 步：验证并推广共识

- **与用户一起测试：** 向亲身经历这一问题的人大声朗读。看看他们是否会说“对，完全正确！”
- **与利益相关者分享：** 包括产品、工程、设计和高管团队。看看它能否让所有人达成一致。
- **根据反馈迭代：** 如果有人说“我觉得这不是真正的问题”，就继续深入挖掘。

---

## 示例

完整示例（包括好的和不好的问题陈述）请参阅 `examples/sample.md`。

迷你示例摘录：

```markdown
**I am:** A software developer on a distributed team
**Trying to:** Communicate in real-time with my team without losing context
**But:** Email is too slow and IM is ephemeral
**Because:** No tool combines real-time chat with searchable history
**Which makes me feel:** Frustrated and disconnected
```

---

## 常见误区

### 误区 1：夹带解决方案
**症状：** “问题在于我们没有[某个具体功能]”

**后果：** 你在验证问题之前就已经预先确定了解决方案。

**修正：** 围绕用户期望的结果重新表述，而不是围绕某项功能。问一问：“他们想实现什么目标？”

---

### 误区 2：伪装成用户问题的业务问题
**症状：** “用户希望提高我们的收入”或“问题在于我们的流失率”

**后果：** 这些是公司的问题，而不是用户的问题。用户并不关心你的指标。

**修正：** 深入探究用户*为什么*流失，或*什么*会促使他们增加支出。从用户的视角来表述问题。

---

### 误区 3：过于笼统的用户画像
**症状：** “我是一名希望提高工作效率的忙碌专业人士”

**后果：** 范围太宽泛，无法据此采取行动。每款产品都声称能帮助“忙碌的专业人士”。

**修正：** 具体一些。“我是一名使用电子表格手动管理 50 多条潜在客户线索的销售代表，希望确定跟进事项的优先级，同时不错过高价值机会。”

---

### 误区 4：将症状当作根本原因
**症状：** “因为 UI 令人困惑”

**后果：** 你描述的是症状，而不是深层问题。

**修正：** 问一问：“为什么 UI 令人困惑？”不断追问“为什么”，直到找到根本原因（例如，“因为用户对于系统的运作方式没有形成心智模型”）。

---

### 误区 5：虚构情绪
**症状：** “这让我感到充满力量和愉悦”

**后果：** 这些话听起来像营销文案，而不是真实的用户情绪。

**修正：** 使用用户访谈中的原话。真实的情绪包括：“沮丧”“不知所措”“焦虑”“束手无策”。

---

## 参考资料

### 相关技能
- `skills/jobs-to-be-done/SKILL.md` — 为“Trying to”和“But”部分提供依据
- `skills/proto-persona/SKILL.md` — 定义“I am”用户画像
- `skills/positioning-statement/SKILL.md` — 问题陈述为定位提供依据
- `skills/user-story/SKILL.md` — 问题陈述指导故事的优先级排序

### 外部框架
- Clayton Christensen，*Jobs to Be Done* — 以结果为导向的问题框定方法的起源
- Osterwalder 和 Pigneur，*Value Proposition Canvas* — 客户的痛点、收益和任务
- Dave Gray，*Empathy Mapping* — 情绪框定技巧

### Dean 的作品
- [如适用，链接到 Dean Peters 的相关 Substack 文章]

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/framing-the-problem-statement.md`。

---

**技能类型：** 组件
**建议文件名：** `problem-statement.md`
**建议存放位置：** `/skills/components/`
**依赖项：** 引用 `skills/jobs-to-be-done/SKILL.md`、`skills/proto-persona/SKILL.md`