---
name: interview-me
description: Extracts what the user actually wants instead of what they think they should want. Achieves this through one-question-at-a-time interview until ~95% confidence about the underlying intent. Use when an ask is underspecified ("build me X" without "for whom" or "why now"), when the user explicitly invokes ("interview me", "grill me", "are we sure?", "stress-test my thinking"), or when you catch yourself silently filling in ambiguous requirements before any plan, spec, or code exists.
---
# 采访我

## 概述

人们提出的要求和他们真正想要的东西往往并不相同。他们提出“一个仪表盘”，是因为通常会这样提需求，而不是因为仪表盘能够解决他们的问题。他们说“让它更快”，却没有给出需要达到的具体数值。

发现这种差距成本最低的时机，是在任何计划、规范或代码出现之前。一旦开始构建，切换成本就会真实存在，而用户会把错误的东西合理化为“足够好”的东西。这种不匹配也就被固化了。

此技能会在这种差距尚未产生任何成本之前将其弥合。其他定义阶段的技能都假设你已经大致知道自己想要什么：`idea-refine` 根据一个想法生成多个变体，`spec-driven-development` 将需求写下来，`doubt-driven-development` 在计划起草完成后对其进行压力测试。Interview-me 位于所有这些步骤之前：你每次只提出一个问题，并附上你当前最合理的猜测，直到你能在用户回答之前预测出他们会说什么。

## 何时使用

在以下情况下应用此技能：

- 需求至少缺少以下一项：用户是**谁**、他们**为什么**想要它、怎样才算**成功**、具有约束力的**限制条件**是什么
- 请求只是惯常表达而非具体需求（“帮我构建 X”“让它更快”），而你无法在不猜测的情况下揭示其实际含义
- 你正打算基于尚未明确说出的假设开始行动
- 当两个合理的价值目标彼此冲突时（简单性与灵活性、成本与速度），用户尚未说明他们要优先优化哪一个
- 用户明确提出：“采访我”“盘问我”“在开始之前，我们确定吗？”“对我的想法进行压力测试”

**以下情况不要使用：**

- 请求明确且自包含（“重命名这个变量”“修正这个拼写错误”）
- 用户已明确要求优先追求速度而非验证
- 纯信息类请求（“X 如何工作？”“这段代码是做什么的？”）
- 机械性操作（重命名、格式调整、移动文件）
- 你已经有 ≥95% 的把握；在断定自己没有达到这个置信度之前，请重新阅读下方的停止条件

## 加载约束

此技能需要用户在线并能及时响应。**不要在非交互式上下文中调用**，例如 CI 流水线、定时运行、`/loop` 或 autonomous-loop。如果你正处于其中一种上下文，而请求的具体信息不足，请向用户指出这是一个阻塞项，而不是自行猜测。

## 流程

### 第 1 步：提出假设，并给出置信度数值

在提出任何问题之前，用**一句话**写下你当前对用户需求的最佳判断，并给出一个诚实的置信度数值（0–100%）：

```
HYPOTHESIS: You want a way to answer "how are we doing?" in standup, and "dashboard" was the convention that came to mind.
CONFIDENCE: ~30% — missing: who it's for, what "metrics" means in context, and what success looks like
```

这个数值会迫使你保持诚实。如果你写下了一个很高的数值，却无法真正预测用户对你接下来三个问题的反应，那么这个数值就是错误的。请从一个你能够合理证明的置信度开始。

当置信度低于约 70% 时，请在同一行附上一段简短的原因——还有哪些问题尚未解决，或缺少哪些信息。这会准确地告诉用户，访谈需要挖掘出什么，也能防止这个数值沦为模糊的信号。

### 第 2 步：每次只问一个问题，并附上你的猜测

格式：

```
Q: <one focused question>
GUESS: <your hypothesis for the answer, with the reasoning that produced it>
```

等待用户回应后，再提出下一个问题。

**为什么每次只问一个，而不是一次问一批：**

- 如果把假设埋在列表里，用户就无法逐一回应
- 批量提问会促使用户快速浏览，并给出流于表面的回答
- 第三个问题通常取决于第一个问题的答案；一次性全部提出会固化错误的思路框架
- 用户用于认真思考的精力是有限的；每次只用一个问题来消耗这份精力

**为什么要附上猜测：**

- 相比从头组织答案，用户对错误猜测的反应更快
- 这会迫使你提出一个可能明显出错的假设，从而让你保持诚实
- 这会暴露*你的*假设，而这正是访谈旨在揭示的内容

这里的风险是，出于礼貌，用户可能会顺着你的猜测表示同意。为了降低这种风险，要明显表现出你愿意承认自己可能猜错，并且偶尔故意朝着你预计用户会反驳的方向猜测。

### 第 3 步：分辨“想要的”与“应该想要的”

最危险的回答，是用户说出了一个深思熟虑的答案*听起来应该有的样子*，而不是他们真正想要的东西。注意以下情况：

- 套用最佳实践话术、但缺乏具体内容的回答（“我希望它具有可扩展性”“整洁架构”）
- 遵从惯例的回答（“像大多数应用那样”“标准做法”）
- 类似“我可能应该……”“我想我应该……”“良好的工程实践认为……”这样的表述
- 把流行术语当作目标——用“现代化”“可扩展”“健壮”来回答，而不是给出具体结果

当你听到这些内容时，应该问的问题是：

> *“如果你不需要向任何人解释这样做的理由，你实际上想要什么？”*

这一个问题所起的作用，往往比前五个问题加起来还大。

### 第 4 步：用用户自己的话重述意图

当你有较高把握时，回复并说明你现在认为用户想要什么。保持简洁（5–8 行），尽可能使用他们的措辞，并以便于用户逐行确认或纠正的方式组织内容：

```
Here's what I now think you want:

- Outcome:      <one line>
- User:         <one line — who benefits>
- Why now:      <one line — what changed>
- Success:      <one line — how we know it worked>
- Constraint:   <one line — the binding limit>
- Out of scope: <one line — what we're explicitly not doing>

Yes / no / refine?
```

必须包含“范围之外”的内容，没有商量余地。一半的目标错位，都源于双方对哪些内容*不会*被构建存在未说出口的分歧。

### 第 5 步：确认——必须明确回答“是”，而不是“你觉得怎样都行”

通过此关的条件是明确回答“是”。以下回答**不算**“是”：

- “你觉得怎么做最好就怎么做。”→ 用户是在把决定权交给你，这意味着他们自己也没有 95% 的把握。重新提问，给出两个具体选项，让用户二选一。
- “听起来不错。”→ 含义模糊。追问：“有什么想调整的吗？”沉默并不代表确认。
- “可以，我们开始吧。”→ 这通常只是礼貌地结束对话，而不是表示认可。仍然要进行同样的追问。
- 沉默一阵后说“好吧，开始吧。”→ 用户已经放弃这场访谈，而不是达成了共识。停下来，询问你是否遗漏了什么。

如果用户纠正了你，应将纠正内容纳入理解并重新陈述。重复这一过程，直到得到明确的肯定答复。

### 95% 置信度停止条件

当你能对以下问题回答“是”时，就可以结束：

> *我能预测用户对我接下来会问的三个问题的反应吗？*

如果能，说明你们已经达成了共同理解。停止访谈并给出重新陈述。如果不能，说明访谈尚未完成；继续提出下一个问题。

这是一项可验证的测试，而不是凭感觉判断。它也有一个下限：如果你已经进行了好几轮，却仍然无法预测用户的反应，这反映出需求本身存在问题，而不是继续穷追不舍的理由。停下来并告诉用户：“我已经问了 X 个问题，但仍然无法预测你的反应。一定是缺少了某些基础信息。要退一步重新审视吗？”

## 输出

此技能的输出是一份**已确认的意图陈述**：即第 4 步中的重新陈述，并在第 5 步中得到明确的肯定答复。这就是交付物。规格、计划和任务清单属于下游产物；它们以此技能产出的意图为输入。

如果用户希望将该意图持久保存（用于跨多个会话的项目，或交接给另一位协作者），可以提议将其保存到 `docs/intent/[topic].md`。只有在用户确认后才能保存。

## 示例

下面是一个简短的前后对比。

**不使用 `interview-me`：**

```
User:  build me a dashboard for our metrics
Agent: <starts proposing chart libraries and layouts>
```

代理擅自假定了：这是给谁用的、需要哪些指标、“给我们团队”意味着什么，以及成功的标准是什么。这些都没有被明确说明。每一项假设都可能让用户之后说出“这不是我想要的”。

**使用 `interview-me`：**

```
User: build me a dashboard for our metrics

Agent:
HYPOTHESIS: You want a way to answer "how are we doing?" in standup, and "dashboard" came to mind because that's the conventional answer.
CONFIDENCE: ~30% — missing: who it's for, what "metrics" are, and what success looks like

Q:     When you say "how are we doing?", who's asking — you alone, the engineering team in standup, or up the chain (e.g., your manager, an exec, a board)?
GUESS: engineering team in standup, because "we" usually scopes that way and standups are where this question gets asked. If it's for execs the metrics and the framing change a lot.

User: It's actually for me. I keep losing track of which experiments are running and what their early signal looks like.

Agent:
Updated read: not a team dashboard at all. It's a personal experiment tracker. Confidence: ~60% — still missing: what "early signal" means and what done looks like.

Q:     Is the gap that you don't know which experiments exist, or that you can't see their results in one place?
GUESS: the second one. You have a list of experiments somewhere, but their results live in five different tools, and reconciling them by hand is what you're tired of.

User: First one actually. I literally don't have a list. They're spread across different docs.

Agent: <continues>
```

仅仅问了两个问题，代理就发现实际需求并不是“仪表板”，而是“列表”。交付物不同，范围不同，工作内容也不同。仪表板本来会是错误的选择。

## 与其他 Skill 的交互

- **`idea-refine`**：下游 Skill。如果确认后的意图是“我想要 X，但不知道如何界定范围”，则移交给 `idea-refine`，让它基于现在已经明确的意图生成不同方案。
- **`spec-driven-development`**：下游 Skill。如果确认后的意图很具体（“我想为 Y 用户实现 X，并以 Z 作为成功标准”），则移交给 `spec-driven-development`，将其编写成规范。
- **`planning-and-task-breakdown`**：位于此 Skill 下游两个环节之后（在规范之后）。
- **`doubt-driven-development`**：处于时间线的另一端。Interview-me 用于决策前的意图提取；doubt-driven 用于决策后的产物审查。二者都能发现偏差，但发生在不同阶段。
- **`source-driven-development`**：与本 Skill 正交。Interview-me 负责澄清用户想要什么；SDD 负责核实框架事实。它们并不冲突。

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “需求已经足够清楚了” | 如果你现在还不能用一句话写出用户期望的结果，那么需求就不够清楚。在做出判断之前，先执行步骤 1。 |
| “问太多问题会浪费他们的时间” | 回答 4–6 个有针对性的问题，所花费的时间很少。因为构建了错误的东西而浪费的时间却极其巨大，而且承担这一成本的是用户。 |
| “我可以边做边弄清楚” | 在代码已经存在之后再切换方向，其成本是现在的 10 倍。在实现过程中才开始探索，就意味着返工。 |
| “他们说‘你看着办’，所以我应该直接替他们决定” | “你看着办”是授权，而不是决策。给出两个具体选项，让他们重新选择。 |
| “我应该给他们几个选项来挑选” | 当用户知道自己想要什么，只是在不同权衡之间做选择时，选项才有效。但他们现在还不知道自己想要什么。罗列选项会扩大搜索范围；提问则会缩小范围。 |
| “如果我附上自己的猜测，就会诱导他们” | 诱导正是目的。对现成猜测做出反应，比从头开始构思更快。真正的风险是迎合，而不是诱导；可以通过明显表现出自己愿意承认错误来降低这种风险。 |
| “我们已经聊得够多了，我明白了” | 验证一下：你能预测他们对接下来三个问题的反应吗？如果不能，那你还没有真正明白。 |
| “用户已经说了‘是’，我们就完成了” | 如果这个“是”出现在模糊的复述之后，或只是对开放式的“听起来不错”表示认同，那么这个“是”没有实际意义。具体地重新陈述，并再次确认。 |

## 危险信号

- 在一条消息中提出三个或更多问题：这是批量提问，不是访谈
- 提问时没有附上你的假设：这是在做调查，而不是表明判断
- 将“你认为怎样最好就怎样做”视为最终答案
- 在用户明确确认你的复述之前，就产出规范、计划或任务列表
- 将问题表述为“最佳实践是什么？”，而不是“你实际想要什么？”
- 用户给出了彰显专业性的回答（“可扩展”“整洁”“现代”），而你没有进一步探究这是否是他们真正想要的，就直接接受
- 经过三个或更多轮次后，你的信心仍未明显提升：说明你问错了问题，应退后一步，重新构建问题
- 给出的信心数值低于约 70%，却没有说明原因：如果用户不知道还缺少什么，就无法帮助弥补差距
- 在用户确认之前保存意图文档（文档本身就暗示了用户并未明确给出的肯定答复）
- 在复述中跳过“Out of scope”这一行（对非目标存在未明说的分歧，占需求错位的一半）

## 验证

应用 interview-me 后：

- [ ] 第一轮中明确陈述了一个假设及其置信度数值
- [ ] 每个低于约 70% 的置信度数值都附有一行原因（仍有哪些问题尚未解决或缺少哪些信息）
- [ ] 每次只提出一个问题，并附上智能体的猜测
- [ ] 当用户给出意在彰显专业度或遵循惯例的回答时，至少进行了一次“如果不需要为自己的选择辩解，你实际上会想要什么？”的追问
- [ ] 向用户提供了一份具体的复述（结果 / 用户 / 为何是现在 / 成功标准 / 约束 / 范围之外）
- [ ] 用户明确以“是”确认了该复述（不能是“你看着办”、不能是“听起来不错”，也不能是保持沉默）
- [ ] 在停止点，智能体能够预测用户对接下来三个问题的反应
- [ ] 任何向下游技能（`idea-refine`、`spec-driven-development`）的移交，都基于已确认的意图进行表述，而不是基于最初表述不充分的请求