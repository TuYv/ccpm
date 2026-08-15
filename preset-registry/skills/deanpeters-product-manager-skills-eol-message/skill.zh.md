---
name: eol-message
argument-hint: "[product or feature being retired]"
description: "Write a right-sized EOL announcement — brief notice through full phased comms — with rationale, customer impact, and next steps. Use when retiring a product, feature, or plan."
intent: >-
  Craft a clear, empathetic End-of-Life (EOL) message that communicates product or feature
  discontinuation, explains the rationale, addresses customer impact, provides transition support,
  and positions the replacement solution — sized to the blast radius. Use this to maintain customer
  trust during difficult transitions and reduce churn by demonstrating care and offering a clear
  path forward.
type: component
theme: eol-transition
best_for:
  - "Announcing a product, feature, or plan retirement without creating a support incident"
  - "Sizing the announcement to the change — a notice, not an opus, when the change is small"
  - "Handling the hard case: retiring something with no replacement"
scenarios:
  - "We're sunsetting our legacy module in December and I need to tell 800 accounts"
  - "We're discontinuing a hardware line with service contracts and channel partners — what do we send?"
estimated_time: "20-40 min"
---
# EOL 消息

## 目的

撰写清晰、富有同理心的产品生命周期终止（EOL）消息，用于传达停止提供的信息、解释原因、说明对客户的影响、提供过渡支持，并介绍后续安排。借此在艰难的过渡期维持客户信任，并减少因客户感到被遗弃而导致的流失。

这不是一则千篇一律的下线公告——它是一种以客户为中心的沟通方式，既承认客户将有所损失，又将此次变更定位为一种进步。此外，消息的**篇幅应与变更规模相匹配**：弃用一个开关只需一个段落，而停止提供一款旗舰产品则需要在数月内分阶段沟通。

## 输入

**最适合提供：**将停止提供什么（产品、功能或方案），以及大致时间。

**其他有用信息：**停止提供的原因、受影响的客户群体、迁移或替代路径、支持承诺，以及对表述内容构成限制的任何合同或监管措辞。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。使用这些信息，并跳过其已涵盖的问题；不要重复询问。

**什么信息都没准备？也没问题。**该技能会在起草前询问停止提供的对象、时间、原因及后续去向，然后推荐一种消息篇幅，用户也可以覆盖该建议。未说明原因和后续步骤的 EOL 消息会给人一种客户被遗弃的感觉——因此，无论如何都会询问这两项信息。

**调用示例：**
- `Draft an EOL message: retiring our legacy reporting module Dec 31, replaced by the new analytics dashboard; 400 accounts affected.`
- `We're killing a feature nobody uses. Give me the brief version — no replacement, 3 weeks notice.`

---

## 核心概念

### 使消息篇幅与变更规模相匹配

EOL 消息最常见的问题不在于语气，而在于分寸。针对一个弃用的复选框发布包含六个章节的公告，会让客户养成忽略通知的习惯。对于承载实际工作流程的产品只发布一行通知，则会引发支持事件。

| | **简短版** | **标准版** | **完整版** |
|---|---|---|---|
| 适用情形 | 功能、内部工具、无人使用的选项 | 商业产品、有活跃客户 | 收入关键型产品、硬件、受监管产品 |
| 篇幅 | 1-3 个段落 | 1 页，包含阶段表 | 多部分，在数月内分阶段发布 |
| 使用的章节 | 公告、时间表、行动号召 | 轻量涵盖全部 9 个章节 | 全部 9 个章节 + 合规与义务 |
| 提前通知时间 | 数周 | 6-12 个月 | 12-24 个月 |
| 渠道 | 应用内通知或变更日志 | 电子邮件 + 应用内通知 + 文档 | 电子邮件 + 客户团队 + 合作伙伴 + 新闻媒体 |

**大多数公告都适合采用标准版。**推荐一种篇幅，用一句话解释原因，并允许用户调整。如果用户为你认为应采用标准版的变更选择了简短版，应指出将缺失的唯一一项内容——通常是阶段表，而它正是避免客户提交“等等，它到底什么时候停止工作？”之类工单的关键。

### 三种过渡路径

你真正需要告诉客户的是他们接下来将去往何处。共有三种答案，而它们会产生截然不同的消息：

1. **替代**——由你的另一款产品接替。消息侧重于连续性：哪些内容会延续，哪些方面会改善。此时，产品定位最为重要。
2. **迁移**——仍属于同一产品系列，但会迁移至不同层级、配置或平台。消息侧重于具体操作：客户必须做什么、何时完成，以及需要投入多少工作。应如实说明所需投入；低估迁移工作量是最快失去信任的方式。
3. **体面退出**——没有任何产品接替。消息侧重于尊重客户：坦诚说明原因、支持数据导出、给予充足的提前通知，并提供真正可行的替代方案，*包括竞争对手的产品*。点名竞争对手所付出的代价，要小于让客户陷入困境所造成的声誉损害。

团队最容易写糟的，是体面退出的公告，因为这正是他们最不愿面对的事情。同时，这也是客户对你评判最严苛的时刻。

### 生命周期关口（统一术语）

EOL 并非单一日期。把所有关口压缩成一则公告，正是引发“但我以为它还能用”这类支持请求浪潮的原因：

- **GA（全面上市）：** 正在积极销售并提供全面支持
- **NSC（状态变更通知）：** 正式传达决定；开始规划
- **EOS（停止销售）：** 新客户无法再购买
- **EOE（停止扩容）：** 现有客户无法增加容量或席位
- **EOR（停止续约）：** 现有合同将不再续签
- **EOM（停止维护）：** 停止提供错误修复和补丁
- **EOL（生命周期结束）：** 产品正式退役
- **EOSRV（停止服务）：** 所有支持与服务义务终止

简短消息应列出两到三个关口。完整消息应通过表格列出全部八个关口。**无论使用哪些关口，都要用客户能够理解的语言来定义它们**——“你可以继续使用，但我们不会再发布修复”胜过“EOM：3/2027”。

### EOL 消息框架

有效的 EOL 消息应在坦诚说明变更与体谅其对客户的影响之间取得平衡：

1. **公司背景：** 你是谁，以及你对客户的承诺
2. **公告事项：** 哪些内容将终止，以及将由什么取代
3. **决策理由：** 为什么这会让客户受益（而不只是让企业受益）
4. **现有产品背景：** 该产品是什么，以及它服务于哪些人
5. **客户影响：** 这将如何影响用户（承认由此造成的不便）
6. **过渡方案：** 客户将迁移到哪里，以及新旧方案之间的对比
7. **支持措施：** 你将如何帮助客户完成过渡
8. **时间表：** 关键日期和关口
9. **行动号召：** 后续步骤和联系信息

### 为什么此框架有效
- **同理心优先：** 先承认变更造成的不便，再解释决策理由
- **清晰明确：** 对变更内容和时间不存在任何歧义
- **聚焦支持：** 表明你不会在过渡中途抛下客户
- **面向未来：** 将变更描述为进步，而不是损失

### 便签规则

客户阅读一遍后，应该能够在一张便签上写清楚自己必须做什么，以及必须在何时之前完成。如果做不到，这条消息就只是装饰。发送前，应使用此规则检验每一版草稿。

### 反模式（不应这样做）
- **不是简短生硬的关闭通知：** “我们将停止提供产品 X。再见。”
- **不是以企业为中心：** 不要以“这能降低我们的成本”开头
- **不是含糊其辞：** “很快”不算时间表
- **不是自我辩解：** 不要责怪客户（“使用率过低迫使我们关闭产品”）
- **不是千篇一律：** 对每次产品退役都使用相同模板和相同篇幅，是比例失当

### 何时使用此框架
- 停止提供某个产品、功能或服务
- 将客户从旧平台迁移到新平台
- 逐步淘汰收购而来的产品
- 弃用某个技术栈或 API

### 何时不应使用此框架
- 对客户可执行操作没有影响的微小调整（不要过度沟通）
- 尚未制定过渡计划时（应在知道如何为客户提供支持*之后*再进行沟通）
- 如果你暗自希望客户不会注意到（应保持透明）

---

## 应用

使用 `template.md` 获取完整的填写结构。

### 第 1 步：确定篇幅和路径

在起草前，先确定两件事：

**篇幅：** 简短版、标准版或完整版。根据影响范围——客户数量、收入、合同，以及是否涉及硬件或合作伙伴——推荐一个版本，然后允许用户自行调整。用一句话说明更短的版本会省略哪些内容。

**路径：** 替代、迁移或平稳退出。这决定了消息的重点，以及“过渡方案”部分应当是定位声明还是退出计划。

### 第 2 步：收集背景信息

- **将停止提供的产品：** 具体要终止的是什么？
- **后续去向：** 如果有替代方案，将由什么取代？
- **时间表：** 适用哪些关键节点？每个节点的日期是什么？
- **客户影响：** 涉及多少用户？哪些工作流程会受到干扰？
- **支持计划：** 迁移协助、培训、折扣、数据导出工具
- **原因：** 为什么要这样做？
- **约束条件：** 合同条款、监管要求、曾经作出的“终身”承诺

**如果缺少背景信息：** 在制定好过渡计划前，不要发送。客户会问“我现在该怎么办？”——你必须给出答案。可以起草，但不能发送。

---

### 第 3 步：起草过渡叙事

#### 公司背景

```markdown
**We are:** [Company and its relationship to the product being phased out]
- [Commitment to customers]
- [How the product line evolves]
- [Where you're headed]
```

**示例：**
```markdown
**We are:** Fieldlight, a field service management platform serving 4,000 service businesses
- We're committed to getting your technicians to the right job with the right information
- We continuously evolve the platform based on how crews actually work
- We're building toward scheduling that adapts in real time to what happens in the field
```

#### 公告

```markdown
**Announcing:**
- [Single sentence stating the EOL clearly and naming the landing place]
```

**示例：** “我们将于 2026 年 12 月 31 日停止提供 Fieldlight Classic Dispatch，并将所有账户迁移至 Fieldlight Next Scheduling。”

**平稳退出版本：** “我们将于 2027 年 6 月 30 日停止提供 Fieldlight Route Optimizer。我们没有替代产品，并希望坦率地说明这一点。”

#### 原因（聚焦客户收益）

```markdown
**Because:**
- [Reason 1]
- [Reason 2]
- [Reason 3]

**Which means for you:**
- [Impact and benefits from the customer's perspective]
```

**示例：**
```markdown
**Because:**
- Classic Dispatch runs on infrastructure that can't support real-time schedule changes
- Next Scheduling reoptimizes routes as jobs run long or get cancelled
- Consolidating lets us put all engineering effort into one scheduler instead of two

**Which means for you:**
- Schedules that adjust when the day goes sideways, instead of at 6am only
- Technician arrival windows you can actually promise customers
- Every future scheduling improvement lands in the product you're on
```

---

### 第 4 步：提供当前产品的背景信息

承认客户将失去什么。在 Brief 消息中跳过本节。

```markdown
**Our product** [name]
- **is a** [description and primary function]
- **that has served** [customer type] for [duration]
- **by providing** [key benefits it delivered]
```

---

### 第 5 步：承认对客户的影响

坦诚说明造成的干扰。在这里淡化客户需要付出的努力，是整条消息中危害最大的取巧做法。

```markdown
**We understand that this may affect you by:**
- [Impact 1 on operations or process]
- [Impact 2]
- [Impact 3]
```

**示例：**
```markdown
**We understand that this may affect you by:**
- Requiring you to rebuild recurring dispatch rules (most accounts: 2-3 hours)
- Retraining dispatchers on a different scheduling board
- Updating any integrations that read the Classic dispatch API
```

---

### 第 6 步：提出过渡解决方案

**替代或迁移路径**——使用定位陈述格式（参见
[`positioning-statement`](../positioning-statement/SKILL.md)）：

```markdown
**For** [affected customer]
- **that currently use** [old product]
- [replacement]
- **is a** [category]
- **that** [benefit, focused on continuity and improvement]

### Differentiation and Continuity
- **Like** [old product],
- [replacement]
- **provides** [what carries forward]
- **while also offering** [what's new]
```

**妥善退出路径**——将上述内容替换为坦诚的退出计划：

```markdown
### What Happens to Your Data
- [Export format, how to get it, how long it stays available]

### Alternatives We'd Point You To
- [Option 1, including competitors, with a note on fit]
- [Option 2]

### What We're Doing to Help
- [Extended access, export tooling, migration credits, refunds where owed]
```

---

### 第 7 步：概述支持措施和时间表

```markdown
**To ensure a smooth transition, we will:**
- [Support measure 1]
- [Support measure 2]
- [Support measure 3]

### Timeline
| Gate | Date | What it means for you |
|---|---|---|
| [Gate] | [Date] | [Plain-language consequence] |
```

**质量检查：**
- **预留充足时间：**Standard 通常为 6～12 个月；合同和硬件产品需要更长时间
- **使用客户能够理解的语言描述阶段节点：**使用“停止接收修复”，而不是“EOM”
- **明确说明数据导出截止日期：**客户何时会失去对自己数据的访问权限？

---

### 第 8 步：提供明确的后续步骤

```markdown
### Call to Action
- [Specific first action, with the link or path]
- [How to get help, with real contact info]
```

---

### 最后一步：提供后续选项

交付草稿后，提供带编号的选项：

“接下来你可以选择：

1. **压力测试**——我会以持怀疑态度的客户视角重新阅读，并标出不清楚的内容
2. **调整篇幅**——为同一条消息生成 Brief 或 Full 版本
3. **按受众细分**——分别为企业客户、中小企业和合作伙伴生成不同版本，因为他们有不同的需求
4. **检查就绪情况论证**——如果决策本身仍需论证，请参阅 [`eol-readiness-advisor`](../eol-readiness-advisor/SKILL.md)

选一个数字、组合使用，或者告诉我你需要什么。"

---

## 示例

- `examples/sample.md` — Fieldlight Classic Dispatch（SaaS、标准篇幅、替代路径）
- `examples/sample-industrial.md` — NFA-200 控制器产品线（工业产品、完整篇幅、替代方案
  以及渠道和监管义务）

简短摘录：

```markdown
**Announcing:** We are retiring Fieldlight Classic Dispatch on December 31, 2026
**Because:** Classic can't support real-time schedule changes
**Which means for you:** Schedules that adjust when the day goes sideways
```

---

## 常见误区

### 误区 1：以业务为中心的理由
**表现：** “我们将停止提供产品 X，以降低成本并整合产品组合。”

**后果：** 客户会觉得自己成了业务决策的附带牺牲品。

**修正：** 从客户利益的角度阐述理由：“我们正在整合到产品 Y，这样就能将全部工程资源
投入到你们所要求的功能中。”

---

### 误区 2：时间表含糊不清
**表现：** “产品 X 很快将停止提供。”

**后果：** 客户无法制订计划。焦虑和客户流失都会增加。

**修正：** 针对明确命名的节点给出具体日期：“3 月 1 日：停止新购。12 月 31 日：全面
关停，也是数据导出的截止日期。”

---

### 误区 3：没有支持计划
**表现：** “你需要迁移到产品 Y。祝你好运！”

**后果：** 客户会觉得被抛弃。客户流失风险很高。

**修正：** 提供切实的帮助：一对一协助、自动迁移工具、过渡期定价、培训。

---

### 误区 4：忽视客户受到的影响
**表现：** 消息从公告直接跳到“这是新产品！”

**后果：** 客户会觉得他们的顾虑没有得到重视。

**修正：** 明确说明此次变更带来的干扰，包括客户需要花多长时间完成相关工作。

---

### 误区 5：语气生硬或带有防御性
**表现：** “由于使用率较低，我们将关闭产品 X。”

**后果：** 听起来像是在责怪那些确实使用该产品的客户。

**修正：** 保持同理心并着眼未来。低使用率是你的业务背景，并不是客户的过错。

---

### 误区 6：所有产品退役都采用同一种方式
**表现：** 每次退役都使用相同的完整篇幅模板，或者都只用一行变更日志说明。

**后果：** 对无关紧要的变更发布完整篇幅的通知，会让客户逐渐忽略你的消息——以至于真正
重要的通知也被忽略。对于真正的产品退役只发布一行变更日志，则会演变成支持事件。

**修正：** 有意识地选择简短、标准或完整篇幅，并说明原因。选择较短篇幅时，要清楚删掉了
哪个部分。

---

## 参考资料

### 相关 Skill

这些 Skill 均可独立使用——没有任何一个是本 Skill 的前置条件，本 Skill 也不是它们的
前置条件。如果你已完成就绪度评估并确定了强度级别，只需提及该级别（“Level 2”），本 Skill
就会相应调整消息篇幅。

- [`eol-readiness-advisor`](../eol-readiness-advisor/SKILL.md) — 如果产品退役本身仍需论证，
  可用于做出继续/终止决策并调节强度
- [`positioning-statement`](../positioning-statement/SKILL.md) — 为过渡解决方案提供依据
- [`problem-statement`](../problem-statement/SKILL.md) — 帮助构建客户影响部分
- [`proto-persona`](../proto-persona/SKILL.md) — 定义受影响的客户，以便制作细分版本

### 外部框架
- 危机沟通最佳实践——透明、同理心、行动
- 客户成功手册——产品过渡期间的客户留存

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的
  `prompts/eol-for-a-product-message.md`。