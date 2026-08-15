---
name: workshop-facilitation
description: Facilitate workshop sessions in a one-step, multi-turn flow. Use when an interactive skill needs consistent pacing, options, and progress tracking.
intent: >-
  Provide the canonical facilitation pattern for interactive skills: one step at a time, with clear progress, adaptive recommendations at decision points, and predictable interruption handling.
type: interactive
theme: workshops-facilitation
best_for:
  - "Adding structured facilitation to any PM workshop or guided session"
  - "Running interactive sessions with numbered recommendations and progress tracking"
  - "Ensuring your workshops stay on track and end with actionable choices"
scenarios:
  - "I want to run a structured positioning workshop with my product team — set up the facilitation protocol"
  - "Help me facilitate a discovery sprint kickoff with clear questions, options, and progress labels"
estimated_time: "varies by workshop"
---
## 目的
为交互式技能提供规范的引导模式：每次推进一个步骤，清晰展示进度，在决策点提供自适应建议，并以可预测的方式处理中断。

## 输入

**无需提供任何内容** — 此技能定义了其他交互式技能所遵循的引导协议。
**以下内容也会有所帮助：** 如果单独调用此技能，请说明你希望引导的会话名称及其相关背景；这些背景信息将作为已提供的答案带入会话。

调用时提供的任何内容——技能名称后的文本、粘贴的背景信息汇总，或附加的 `ARGUMENTS:` 行——均视为已提供的答案。请使用这些信息并跳过其已涵盖的内容；不要重复提问。

**什么都没准备？也没问题。** 当其他技能引用此协议时，应根据该技能的“输入”部分确定需要提供哪些内容。

**调用示例：** `Facilitate a 45-minute retro on our failed beta launch using this protocol.`

## 核心概念
- **一次一个步骤：** 每轮只提出一个有针对性的问题。
- **会话预告 + 进入模式：** 首先说明预期情况，并提供 `Guided`、`Context dump` 或 `Best guess` 模式供选择。
- **进度可见性：** 显示面向用户的进度标签，例如 `Context Qx/8` 和 `Scoring Qx/5`。
- **决策点建议：** 仅在需要做出选择时使用编号选项，而不是在每次回答后都提供。
- **快速选择回答选项：** 对于常规的背景信息收集或评分问题，提供简洁的编号回答选项，并在适用时提供 `Other (specify)`。
- **灵活解析选择：** 接受 `#1`、`1`、`1 and 3`、`1,3` 或自定义文本，然后综合处理多选结果。
- **基于背景信息推进：** 基于先前的回答继续推进，避免重复询问已经解决的问题。
- **可安全中断的流程：** 直接回答元问题（例如“还剩多少个问题？”），重申当前状态，然后继续。
- **快速路径：** 如果用户请求一次性输出，则跳过多轮引导并交付精简结果。

## 应用
1. 首先简要预告预计所需时间和问题数量。
2. 请用户选择进入模式：
   - `1` 引导模式（每次一个问题）
   - `2` 背景信息汇总（粘贴已知背景信息；跳过重复内容）
   - `3` 最佳推测模式（推断缺失的详细信息并标明假设）
3. 每轮只提出一个问题，并等待回答后再继续。
4. 使用通俗易懂的语言提问；在有帮助时附上简短的回答格式示例。
5. 每轮显示进度：
   - 收集背景信息时显示 `Context Qx/8`
   - 评估或评分时显示 `Scoring Qx/5`
6. 仅当后续澄清能实质性提高建议质量时才进行追问。
7. 对于常规的背景信息收集或评分问题，在可行时提供可快速选择的编号回答选项：
   - 选项应保持简洁，并尽可能互斥。
   - 如果可能的答案是开放式的，则包含 `Other (specify)`。
   - 接受类似 `1,3` 或 `1 and 3` 的多选回答。
8. 仅在决策点提供编号建议：
   - 综合背景信息后，
   - 综合成熟度或画像后，
   - 选择优先事项或行动计划期间。
9. 接受数字或自定义选择，综合处理多选结果，然后继续。
10. 如果被元问题打断，请直接回答，然后重申进度和待回答的问题。
11. 如果用户表示停止或暂停，请立即停止并等待明确的恢复指令。
12. 最后提供清晰的总结、已做出的决定，以及（如果使用了最佳推测模式）一份 `Assumptions to Validate` 列表。

## 示例
**开场：**
“先简要说明一下：这大约需要 7-10 分钟，共 10 个左右的问题。你想以哪种方式开始？
1. 引导模式
2. 背景信息倾倒
3. 最佳推测模式”

**用户：** “2”

**引导者：** “请粘贴你已经掌握的信息。我会跳过已经回答的部分，只询问缺失的信息。”

**综合分析后的决策点：**
1. **优先进行上下文设计**（推荐）
2. 优先进行智能体编排
3. 优先进行团队-AI 协作引导

**用户：** “1 和 3”

**引导者：** “很好。我们会先进行上下文设计，同时并行开展团队-AI 协作引导。”

**调用时提供的内联输入：** 当用户在调用时一并提供背景信息，应将其视为已作答的内容，从第一个未回答的问题开始，并如实标注进度（如果 Q1 已涵盖，则从 `Context Q2/6` 开始）。完整对话记录，包括重复提问这一反面模式：[examples/inline-input-flow.md](examples/inline-input-flow.md)。

## 常见陷阱
- 在同一轮中询问多个问题。
- 每次回答后都给出建议（会增加交互阻力）。
- 使用简写标签，却不提供通俗易懂的问题。
- 隐藏进度，导致用户不知道还剩多少内容。
- 忽略用户选择的选项或自定义方向。
- 在最佳推测模式下运行时，未标明假设。

## 参考资料
- 将其作为交互式引导行为的事实依据。
- 与 `skills/*-workshop/SKILL.md` 中的研讨会技能和顾问型交互技能结合使用。