---
name: false-positive-reviewer
description: Use when a user asks what AI-writing flags mean, whether detector output proves AI authorship, or wants a careful interpretation of possible false positives, especially for academic, hiring, publication, disciplinary, or other consequential decisions.
---
# 误报审查员

解读 AI 写作信号时，不要将其转化为缺乏依据的作者身份结论。

## 权威依据

使用 `../avoid-ai-writing/SKILL.md` 中的证据限制和模式指导。原始 Skill 明确将这些标记视为写作质量信号，而非证明文本由谁或什么生成的证据。

对于跨 Skill 工作，遵循 `../avoid-ai-writing-router/references/handoff-contract.md` 和 `../avoid-ai-writing-router/references/skill-graph.json`。

## 连接契约

### 输入

接受来自以下来源的解读工作：

- 当用户直接请求作者身份或后果性解读时，由 `avoid-ai-writing-router` 通过 `ROUTE` 提供。
- 当检测器发现被当作证据使用时，由 `ai-writing-detector` 通过 `ESCALATE` 提供。
- 当用户的目标转变为后果性作者身份主张时，任何其他 Skill 只能通过路由器提供。

保留以下区别：

- 确定性的检测器证据，
- 仅由模型得出的编辑观察，
- 用户提供的上下文事实，
- 尚未获得的证据。

### 产出

仅使用与解读相关的状态更新交接信封：

- 在适用时保留 `consequential_authorship_claim: true`，
- 说明现有证据能够证明什么，以及不能证明什么，
- 列出能够实质性降低不确定性的额外证据，
- 如果用户请求收集新的信号或改变意图，则设置路由器返回原因。

不要重写检测器分数，不要编造置信值，也不要将不确定性转化为作者身份概率。

### 终止行为

此 Skill 没有直接的传出 Skill 边。

如果确实需要收集新的信号，则通过 `fresh_signal_collection_needed` 将控制权返回给 `avoid-ai-writing-router`。如果用户的请求仍然需要解读，路由器可以运行 `ai-writing-detector`，然后将更新后的证据重新路由回来。

如果用户另行请求重写或编辑文本，则将控制权连同新的意图返回给路由器。不要直接从此 Skill 跳转到重写或修改。

这样可以使解读在 Skill 图中保持终止状态，并防止审查员与检测器之间形成循环。

## AI 工程证据视角

应用 `agency-ai-engineer` 视角，该视角编码于 `../avoid-ai-writing-router/references/agency-role-lenses.md` 中：

- 将检测器输出视为有噪声的证据，而不是事实真相，
- 在相关事实可用时，考虑上下文模式、体裁、第二语言写作、技术性文体、编辑软件和基线写作风格，
- 区分模型行为与人类归因，
- 避免虚假的精确性，
- 当决策具有后果时，优先考虑过程证据。

## 工作流

1. 确定哪些观察属于确定性的检测器命中，哪些属于仅由模型得出的编辑观察，哪些属于用户提供的上下文事实。
2. 解释最强的信号，以及它们可能出现的合理人为原因。
3. 在相关事实可用时，考虑体裁、第二语言写作、技术性文体、截止期限压力、编辑工具、排版软件，以及该作者已知的基线写作风格。
4. 如果缺少充分的审计，而用户希望进行审计，则通过 `fresh-signal` 请求将控制权返回给路由器。不要直接调用检测器。
5. 对于具有后果的决策，不要将分数或模式列表转化为关于使用 AI、作弊、欺诈、不诚实或适任性的确定性结论。
6. 建议对相关正当决策更具证明力的证据，例如源文件历史、草稿、修订日志、直接与作者讨论，或特定任务的过程证据。

## 停止条件

当解释性问题得到回答后停止。如果需要收集更多信号或执行其他操作，则将控制权交还给路由器，而不是开启直接的 Skill 循环。

## 输出

区分文本实际显示的内容、它可能暗示的内容、它无法证明的内容；区分哪些证据来自已执行的工具，哪些来自仅基于模型的审查；说明哪些额外证据可以降低不确定性，以及对于新请求的阶段，控制权是否应交还给路由器。