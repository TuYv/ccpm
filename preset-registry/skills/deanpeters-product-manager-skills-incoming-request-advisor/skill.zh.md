---
name: incoming-request-advisor
argument-hint: "[paste or describe the incoming message + who sent it]"
description: "Decode an incoming message into a structured breakdown separating the literal ask from the job-to-be-done. Use when a loaded Slack ping, email, mandate, or escalation needs a reply."
intent: >-
  Act as a chief-of-staff-grade analyst that decodes an incoming message into a structured breakdown, separating the literal ask from the job-to-be-done underneath it, reading sender power and stake from a product leader's chair, and opening the conversation toward a reply or next artifact. Trains the PM habit of finding the outcome before responding.
type: interactive
theme: stakeholder-comms
best_for:
  - "Triaging a loaded exec escalation before you fire back a reply"
  - "Decoding a vague feature request into the outcome underneath it"
  - "Reading power, stake, and subtext in a request from someone senior"
scenarios:
  - "My VP just Slacked me 'can we get the dashboard redesign into next sprint?' and I need to read what's really going on"
  - "I got a long escalation email from a frustrated customer-success lead and I don't know how to respond"
  - "A stakeholder sent a mandate that sounds like a build order and I want the job-to-be-done first"
estimated_time: "5-10 min"
---
## 目的

在回复之前，将收到的消息——Slack 提醒、电子邮件、指令、升级请求或仅供知悉的通知——解析为结构化的拆解。本技能如同一位坐在产品负责人位置上的幕僚长级分析师：它会将**字面诉求**与其背后的**待完成任务**区分开来，判断发送者的权力与利害关系，并推动对话走向回复或下一份产出物。

当请求到来，而你的第一反应是直接回答屏幕上的文字时，请使用本技能。它会放慢这种条件反射：找出期望的结果、结果服务于谁，以及为什么是现在——而不是如何构建。它不是程序员在拆解规格。当请求听起来像功能需求或开发指令时，本技能会探寻其背后的结果与待完成任务。

## 输入

**最适合提供：** 收到的消息本身——粘贴的文本、屏幕截图、图片、附件或 PDF。本技能会先从消息的任何载体中提取完整内容，再进行分析。

**以下信息也很有用：**
- 谁发送了消息，以及对方相对于你工作的表面角色（上游、同级、下游）
- 消息出现时的情境或对话线程
- 你接下来想要什么——仅分析，还是也需要起草回复

调用时一并提供的任何内容——技能名称后的文本、粘贴的消息、上下文备注或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。将消息*周围*的任何文字视为发送者或情境信息。使用这些信息，并跳过其中已经涵盖的问题；不要重复询问。

**什么信息都没准备？也没问题。** 只需放入消息即可。如果发送者或情境未知，并且会影响解读，顾问最多提出 3 个有针对性的问题，每次一个，然后在明确标注假设的前提下继续分析。如果消息的一部分无法辨认或被截断，顾问会说明这一点，并基于现有内容继续处理。

**调用示例：** `My VP DM'd me: "Any chance the dashboard redesign lands next sprint? Board's asking." Analyze this before I reply.`

## 核心概念

### 诉求与待完成任务

字面诉求是文字直接提出的请求。待完成任务则是发送者真正追求的结果。“我们能否在下个冲刺中完成仪表板重新设计？”是诉求；“我需要向董事会展示一些具体成果，证明我们响应迅速”可能才是待完成任务。**当待完成任务与诉求不同时，仅仅回应诉求，正是 PM 快速做出错误产品的原因。** 每次拆解都会明确区分这两者。

### 对发送者的判断：权力、利害关系、言外之意

回复之前，你需要先判断局势。是谁发送了消息？对方相对于你的工作扮演什么角色？是上游（他们决定你的优先事项）、同级（他们需要你的配合），还是下游（他们依赖你的产出）？即使措辞完全相同，权力和利害关系也会改变正确的回复方式。CEO 提出的“简单问一下”绝不是简单问一下。

### 成功标准与必备项（PM 容易混淆的区别）

两者并不相同，将它们混为一谈是 PM 的典型错误：
- **成功标准** = 发送者将如何*判断*结果是否奏效（通过/不通过的门槛、指标、完成的定义）
- **必备项** = 产出物中必须*包含*的内容（硬性要求）

一个交付成果即使满足了所有必备要求，仍可能不符合成功标准。将两者分开是本技能的核心理念。

### 推断，而非臆造

本技能依据消息中的证据进行推理，并将每项猜测标记为推断。它绝不会把猜测表述为既定事实。所有推断都会汇总到末尾明确的**待验证假设**列表中，以便人工准确了解分析所依据的前提。

### 根据消息调整分析深度

分析框架包含十二个部分，但一句话的消息并不需要全部十二个部分。本技能会合并或跳过空白部分，并在模板要求时将其标记为“未说明”。用十二个内容密集的部分来过度填充一条简单消息，是一种失败模式，而不是严谨。

### 便利贴规则

分析中的每个要点都应为 4 到 8 个单词，仅使用 ASCII，简短且便于快速浏览——就像写在便利贴上一样。消息中的直接引语必须逐字保留，不受长度规则限制。

### 引导流程的权威来源

使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为本技能的默认交互协议。

它定义了：
- 会话预告 + 进入模式（引导式、上下文倾倒、最佳猜测）
- 每轮只提一个问题，并使用通俗易懂的提示语
- 识别调用时提供的内联上下文，从而跳过已回答的问题
- 中断处理以及暂停/恢复行为

针对本技能：粘贴的消息*就是*上下文倾倒。仅当发送者或情境确实未知，**且**会影响解读时才提出澄清问题——最多 3 个，每次一个。

## 应用

### 第 1 步——提取消息

无论消息以何种形式提供（截图、图像、文件、PDF 或文本），都应先提取完整消息，再进行分析。如果任何部分无法辨认或被截断，请明确说明，并根据现有内容继续处理。

### 第 2 步——只补充会影响解读的信息缺口

如果发送者身份或情境未知，且会影响分析，请最多提出 3 个有针对性的问题，每次一个：
1. “这是谁发来的？对方的角色与你的工作有何关系？”
2. “这条消息是在什么情境或对话线程中发来的？”
3. “你只需要分析，还是也需要起草回复？”

然后在清楚标注假设的前提下继续。**不要询问消息中已经回答的问题。**

### 第 3 步——呈现分析结果

使用下方结构，以 Markdown 格式呈现。根据消息调整分析深度：合并或跳过任何空白部分；模板要求时，将其标记为“未说明”。应用便利贴规则（每个要点 4–8 个单词，仅使用 ASCII；逐字引语除外）。使用 [`template.md`](template.md) 提供的可复制粘贴填写结构，供 PM 手动逐项完成。

```markdown
## Incoming Request Breakdown

### 1. Classify
- Message type and channel, one line
- Types: meeting prep, feedback, feature request, mandate, escalation, FYI, ask for help, other

### 2. Sender Read
- Who sent it, apparent role
- Relationship: upstream, peer, or downstream
- Power and stake where they matter

### 3. Literal Ask
- What they explicitly want, plain terms

### 4. Underlying Problem Space
- The job they are trying to get done
- The outcome behind the request
- Separate the ask from the need

### 5. Sentiment and Subtext
- Tone, urgency, frustration, enthusiasm, politics
- Quote the tell if there is one

### 6. Must-Haves vs Nice-to-Haves
- Hard requirements for the deliverable
- Soft preferences, clearly separated

### 7. Hard Negatives
- What they explicitly do not want
- "None stated" if none

### 8. Success Criteria
- Pass/fail bar, metric, or definition of done
- How they will judge the result worked
- Capture only what is stated; mark implied ones as inference
- "None stated" if none

### 9. Hard Constraints
- Drop-dead dates, budget, non-negotiables
- "None stated" if none

### 10. Gaps and Ambiguities
- What is unclear or missing before committing

### 11. Risks
- Scope, expectation, political, timeline landmines

### 12. Recommended Next Steps
- 2 to 4 concrete moves, ordered

### Assumptions to Validate
- [Anything inferred rather than stated]
- [Sender read or intent guessed]
- [Success criteria or constraints implied]
```

### 第 4 步 — 实时展开对话

呈现分析结果后，提出 1 到 3 个最关键的问题，以便完善建议，然后提供恰好 4 个后续选项：

1. **起草一份给发送者的回复**（推荐）
2. **为该请求拟定会议议程**
3. **将该请求重新表述为探索性问题框架**
4. **起草一份能够保障结果的反提案**

请用户回复 `1`、`2`、`3`、`4`，或类似 `1 and 3` 的组合，也可以自定义后续路径。

## 示例

完整的端到端交互请参阅 [`examples/conversation-flow.md`](examples/conversation-flow.md)，其中包括消息提取、信息缺口补全、呈现后的拆解分析以及最后的选项。

### 示例：高管发来的“快速”消息（完整拆解）

**粘贴的消息：** *“仪表板重新设计有可能在下个冲刺完成吗？董事会正在问。”* — 来自产品副总裁。

**智能体输出（节选）：**
- **分类：** 功能请求，Slack 私信
- **发送者解读：** 产品副总裁；上游；权力高、利害关系重大
- **字面请求：** 在下个冲刺交付仪表板重新设计
- **底层问题空间：** 需要可向董事会展示、能够证明团队响应及时的成果（推断）
- **成功标准：** 在董事会会议上有可展示的内容 — *并非*完整的重新设计（推断）
- **风险：** 为满足时间要求而承诺范围；“下个冲刺”会锚定预期
- **建议的后续步骤：** 确认董事会真正需要什么；提供一个可演示的部分

然后：“董事会会议日期是否已经确定？他们需要的是可运行的软件，还是一份可信的计划？”→ 提供 4 个选项，并推荐 **4 — 能够保障结果的反提案**（可演示的部分优于承诺过度的完整重新设计）。

### 示例：单行仅供知悉消息（减少分析深度）

**粘贴的消息：** *“提醒一下 — 法务已经批准了新条款。”* — 来自一位同级产品经理。

**智能体输出：** 仅包含分类（仅供知悉，Slack）+ 发送者解读 + 字面请求。第 4–11 节标记为“未说明”。建议的后续步骤：确认收到，并将其记录到发布检查清单中。不要针对一句话的信息堆砌十二个章节。

## 常见误区

### 误区 1：像拆解规格一样进行拆解
**症状：** 将形式上类似功能请求的内容视为开发指令，并直接跳到实施任务。

**后果：** 你高效地优化了错误的事情。你完成了请求，却错过了真正需要完成的工作，然后在完全按照对方所说的内容交付后，仍然疑惑为什么发送者并不满意。

**修正：** 始终执行第 4 节（底层问题空间）。在讨论“如何做”之前，先明确预期结果和待完成的工作。

### 误区 2：混淆成功标准与必备项
**症状：** 将“仪表板必须支持导出”与“他们会根据董事会是否感到放心来评判这项工作”列在同一个标题下。

**后果：** 你构建的交付成果满足了所有要求，却仍然未能达到真正的评判标准。这两者回答的是不同的问题 — *其中包含什么*与*他们如何衡量它*。

**修正：** 严格区分第 6 节和第 8 节。问问自己：这是盒子里的东西，还是他们用来衡量盒子的尺子？

### 误区 3：凭空编造，而非合理推断
**症状：** 将对发送者动机的猜测表述成消息中明确说明的事实。

**后果：** 对方基于虚构的确定性采取行动，带着错误的理解进入会议，并在假设破裂时失去信任。

**修正：** 将每个猜测都标记为推断，并在“待验证的假设”中明确列出。如果相关信息并非来自消息原文，那就是假设——请明确标注。

### 误区 4：过度解读一句话消息
**症状：** 对一条只有两句话的知会消息，也完整呈现全部十二个部分。

**后果：** 流于形式的分析。读者无法找到关键信息，拆解看似严谨，实则没有提供任何增量价值。

**修正：** 根据消息调整分析深度。折叠空白部分；标注“未提及”。一句话的简短消息只需一段话的解读。

## 参考资料

### 相关技能
- [`workshop-facilitation`](../workshop-facilitation/SKILL.md) — 此交互式技能的引导协议（权威依据）
- [`jobs-to-be-done`](../jobs-to-be-done/SKILL.md) — 深入分析第 4 部分中揭示的待办任务
- [`stakeholder-mapping`](../stakeholder-mapping/SKILL.md) — 将发送者解读扩展为完整的权力/利益相关者地图
- [`opportunity-solution-tree`](../opportunity-solution-tree/SKILL.md) — 选择选项 3（重新构建为探索框架）时使用
- [`problem-statement`](../problem-statement/SKILL.md) — 将底层问题空间转化为可共享的框架

### 来源材料
- Dean Peters 的原始提示词“Incoming Request Breakdown”（2026 年 7 月 8 日）

### 许可证
- CC BY-NC-SA 4.0（仓库许可证）