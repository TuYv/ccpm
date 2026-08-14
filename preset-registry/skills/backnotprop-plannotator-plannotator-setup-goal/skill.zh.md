---
name: plannotator-setup-goal
disable-model-invocation: true
description: Turn an idea or objective into a goal package for /goal. Interviews the user, builds a reviewed fact sheet via Plannotator, then explores the codebase to produce an execution plan.
---
# 设置目标

通过结构化探索、用户访谈和代码库探索，将一个想法转化为位于 `goals/<slug>/` 的目标包。

## 阶段

### 1. 重新表述

用你自己的话复述用户想要什么。如果对话中已经有丰富的上下文，则对其进行总结。如果目标内容很少或含糊不清，则对代码库进行最低限度的浅层探索，以便准确理解目标。控制在 2 至 3 句话内。等待用户确认或纠正后再继续。

明确 slug 后，创建目标目录：

```bash
mkdir -p goals/<slug>
```

将 `goals/<slug>/` 同时用于存放工作 JSON 文件和最终文档。JSON 文件用于记录来源和迭代状态；Markdown 文件则是供人阅读的权威目标包。

**浏览器会话耐心规则：** Plannotator 目标设置是由用户驱动的浏览器会话。启动访谈或 facts 命令后，必须保持绝对耐心，持续等待用户，直到他们提交、关闭，或明确要求你停止。不要仅仅因为 UI 处于空闲状态或用户需要时间，就关闭、终止、重启、刷新会话或打开第二个副本。绝不要通过关闭并重新打开会话来更新状态；如果前一个会话结束后需要重新运行，请更新工作 JSON 文件，并基于该文件启动一条新命令。

**可选：先进行深入盘问（一次一个问题的深度访谈）。** 当目标含糊不清或涉及许多相互依赖的决策时，在构建紧凑的访谈问题包之前，先*建议*进行一轮深入盘问；而当用户提出要求时（“grill me first”），则必须执行。这是可选加入的流程：对于清晰且范围明确的目标，应跳过此步骤，直接进入问题包阶段，以免深入盘问违背问题包所倡导的“问题更少、杠杆效应更高”理念。进行深入盘问时，逐字遵循下方协议，然后将已经明确的决策整合到质量更高的访谈问题包（阶段 2）中；或者，如果深入盘问已经完全明确了范围，则直接进入事实表（阶段 3）。

<!-- 下方深入盘问协议逐字改编自 Matt Pocock 的 /grill-me skill（MIT 许可）：
     https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md -->

> 就此计划的各个方面持续不断地向我提问，直到我们达成共识。沿着设计决策树的每个分支逐步推进，逐一解决各项决策之间的依赖关系。对于每个问题，都给出你推荐的答案。
>
> 每次只问一个问题。
>
> 如果某个问题可以通过探索代码库得到答案，就直接探索代码库，而不是提问。

### 2. 访谈问题包

构建一个紧凑的问题包，能够推导出此目标应产出的每一项“事实”。将这些问题整合在一起，以便用户可以在 Plannotator 目标设置 UI 中快速回答。对于每个问题，都要包含你推荐的答案；如果使用选项能让回答更快捷，就提供选项。

不要提出答案显而易见的确认性问题。如果可以从用户的请求、对话内容或浅层代码库探索中推断出答案，就直接推断并继续。如果某个看似显而易见的领域存在重要的细微差别，应将推断出的答案作为建议给出，同时提供选项或自定义的“补充/纠正此内容”路径，而不是让用户重新陈述显而易见的内容。

通常需要关注的问题领域：

- 功能/变更是什么
- 面向哪些用户
- 解决什么问题
- 哪些行为会发生变化
- 成功的标准是什么
- 哪些内容在范围内、哪些不在范围内（这是确定事实时最重要的领域）
- 需要考虑哪些边界情况
- 适用哪些约束或先例

**如果某个问题可以通过探索代码库来回答，就应探索代码库，而不是向用户提问。** 仅包含确实需要用户判断的问题。与其穷举显而易见的问题，不如提出更少但更具影响力的问题。

在向用户展示访谈包之前，先将其写入：

`goals/<slug>/interview.json`

```json
{
  "stage": "interview",
  "title": "Short human-readable title",
  "goalSlug": "<slug>",
  "questions": [
    {
      "id": "scope",
      "prompt": "What should be in scope?",
      "description": "Optional clarification.",
      "answerMode": "multi-custom",
      "recommendedAnswer": "Your recommended answer.",
      "recommendedOptionIds": ["ui", "server"],
      "options": [
        { "id": "ui", "label": "UI" },
        { "id": "server", "label": "Server" }
      ],
      "required": true
    }
  ]
}
```

支持的 `answerMode` 值：`text`、`single`、`multi`、`custom`、`single-custom`、`multi-custom`。

将此命令作为受监控的前台进程运行，并耐心等待浏览器会话结束。当用户正在阅读、编辑或提问时，该命令可能看起来处于空闲状态；请让它继续运行：

```bash
plannotator setup-goal interview goals/<slug>/interview.json --json
```

该命令会在 stdout 中返回包含已提交答案的 JSON。在继续之前，将该结果原样写入 `goals/<slug>/interview-result.json`。一种便捷的写法是：

```bash
plannotator setup-goal interview goals/<slug>/interview.json --json | tee goals/<slug>/interview-result.json
```

如果用户在会话结束后进行了修改，请更新 `interview.json` 并重新运行命令，而不是凭记忆重新构建整个访谈包。如果会话被关闭，请停止并告知用户目标设置已关闭。

在进入事实阶段之前，请阅读每个答案并仔细留意：

- 如果用户在答案或备注中写了问题、不确定性、"not sure"、"needs context" 或类似疑虑，请停止并在聊天中处理这些问题。在用户获得足够的背景信息或你重新运行修订后的访谈包之前，不要进入事实阶段。
- 如果用户跳过了某个问题但留下了备注，请将该备注视为有意提供的反馈，而不是空答案。在继续之前，应回应该备注、完善问题，或做出有记录的假设。
- 如果用户跳过了某个问题且未留下备注，仅当缺失的答案不会造成阻碍时才继续；否则，请在聊天中提出尽可能精简的后续问题。

### 3. 事实表

事实是对目标中每项结果的简单描述。它应该易于测试和验证。事实可以描述某项具体功能或系统某个方面的作用。事实也可以明确具体的 UI 和 UX。同样，事实实际上就是任何可以通过自动化或手动测试进行测试和验证的内容。事实的措辞应保持简单。从某种意义上说，事实表是一份设计规范，但更简洁，并使用人类用户能够轻松想象和理解的语言。

根据 `goals/<slug>/interview-result.json` 准备事实审查包。每条事实都应包含是否建议进行自动验证，以及是否预先选中自动验证。

在向用户展示事实审查包之前，先将其写入文件。如果是在之前一轮事实审查后进行修订，请从 `facts-review.json` 和 `facts-result.json` 开始，纳入之前已接受且带有 `"accepted": true` 的事实，并保留其状态。

`goals/<slug>/facts-review.json`

```json
{
  "stage": "facts",
  "title": "Short human-readable title",
  "goalSlug": "<slug>",
  "facts": [
    {
      "id": "fact-1",
      "text": "The accepted fact text.",
      "accepted": false,
      "removed": false,
      "recommendedAutomatedVerification": true,
      "automatedVerification": true
    }
  ]
}
```

将以下命令作为受监控的前台进程运行，并耐心等待浏览器会话结束。在用户审查、编辑或提问期间，该命令可能看起来处于空闲状态；请让它继续运行：

```bash
plannotator setup-goal facts goals/<slug>/facts-review.json --json
```

该命令会在标准输出中返回 JSON，其中包含已接受、已编辑或已移除的事实，以及自动验证选择。将该结果原样写入 `goals/<slug>/facts-result.json`。一种便捷的方式是：

```bash
plannotator setup-goal facts goals/<slug>/facts-review.json --json | tee goals/<slug>/facts-result.json
```

将 `goals/<slug>/facts.md` 写成一份扁平、易读的已接受事实列表。每条事实占一行；仅当事实本身无法清晰表述时，才添加简短说明。同时写入 `goals/<slug>/facts.meta.json`，保留每条已接受事实的 `id`、最终 `text`、`comment`、`recommendedAutomatedVerification` 和 `automatedVerification` 值。

如果用户在 UI 中编辑或移除了事实，请直接应用该结果。如果会话被关闭，请停止操作并告知用户事实审查已关闭。

### 4. 规划

探索代码库。找出并验证实现每条已接受事实的路径。对于 `automatedVerification: true` 的事实，应视为必须提供具体的自动化检查，除非你记录了阻碍原因。跟踪代码路径，确定涉及的文件和系统，并指出风险与未知因素。持续完善，直到你对操作顺序充满信心。

编写 `goals/<slug>/plan.md`：

- 解决方案思路（简要）
- 按顺序列出的步骤，以及每一步涉及的文件/系统
- 每一步的验证方式（具体命令或检查）
- 值得指出的风险或待确认问题

使用 Plannotator 对计划进行把关：

```bash
plannotator annotate goals/<slug>/plan.md --gate
```

如果未获批准，请根据反馈修订并再次提交把关，直到获得批准。

### 5. 目标输出

编写 `goals/<slug>/goal.md`：

- 清晰表述的目标（1-3 句话）
- 引用 `facts.md` 作为共识
- 引用 `plan.md` 作为执行计划
- 完成条件

告知用户：

```
Done! Launch a goal with `/goal goals/<slug>/goal.md`
```