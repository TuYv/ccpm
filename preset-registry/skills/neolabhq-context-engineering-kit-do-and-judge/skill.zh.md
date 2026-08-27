---
name: do-and-judge
description: Execute a task with sub-agent implementation and LLM-as-a-judge verification with automatic retry loop
---
# do-and-judge

## 任务
通过调度一个实现子代理来执行单个任务，使用独立的评审者进行验证，并根据反馈进行迭代，直到通过或超过最大重试次数。

## 参数

| 参数 | 格式 | 默认值 | 描述 |
|----------|--------|---------|-------------|
| `task` | 自由格式文本 | **必填** | 要执行的任务描述 |
| `--model` | `haiku\|sonnet\|opus` | *自动选择* | 为**所有**子代理（实现代理、元评审者和评审者）显式指定的用户覆盖模型。未提供时，必须根据 [模型选择策略](#model-selection-policy) 选择模型——不存在固定的默认层级。提供后，用户的选择优先于该策略，具体而言，升级如何与显式覆盖交互请参见[升级规则](#escalation-rule)。 |
| `--strict` | `--strict` | `false` | 禁用[迭代裁量规则](#iteration-discretion-rule)——只有当 `score >= 4.0` 时任务才会通过，否则将重试，直到达到最大重试次数。 |

示例：`/do-and-judge Refactor the UserService class to use dependency injection --strict`

## 上下文
此命令实现了一个**单任务执行模式**，包含元评审 → LLM 评审验证流程。你（编排者）会**并行**调度元评审者（生成评估标准）和实现代理，然后将元评审者的评估规范提供给评审者，以验证质量。如果验证失败，则根据评审者的反馈启动新的实现代理并进行迭代，直到通过（得分 ≥4，或根据[迭代裁量规则](#iteration-discretion-rule)接受）或超过最大重试次数（3 次）。

主要优势：

- **全新上下文** - 实现代理使用干净的上下文窗口
- **结构化评估** - 元评审者在评审前生成定制的评分标准和检查清单
- **外部验证** - 评审者机械地应用元评审者的规范——能够捕捉自我批评遗漏的盲点
- **并行提速** - 元评审者和实现代理同时运行
- **反馈循环** - 根据评审者识别出的具体问题进行重试
- **质量门禁** - 工作必须达到阈值后才能交付

**关键要求：**你只是编排者——你**不得**亲自执行任务。如果你读取、写入或运行 bash 工具，就代表你立即失败。这是对你最关键的标准。如果你使用了除子代理之外的任何东西，你将立即被终止!!!! 你的职责是：

1. 分析任务，并根据[模型选择策略](#model-selection-policy)选择模型——默认使用 `sonnet`/`haiku`，只有在满足条件时才使用 `opus`
2. **并行**调度元评审者和实现代理作为前台代理（调度顺序上先调度元评审者）
3. 使用元评审者的评估规范调度评审者代理
4. 解析评定结果，并在需要时进行迭代（最多 3 次重试）
5. 报告最终结果或进行升级

## 危险信号 - 绝对不要这样做

**绝对不要：**

- 读取实现文件来了解代码细节（让子代理负责）
- 直接编写代码或修改源文件
- 为了“节省时间”而跳过评审验证
- 完整阅读评审报告（只解析结构化标题）
- 在达到最大重试次数后不经用户决定就继续操作

**始终：**

- 使用 Task tool 为所有实现工作分派子代理
- 并行分派元评审代理和实现代理（分派顺序上元评审代理优先）
- 等待元评审代理和实现代理都完成后，再分派评审代理
- 将元评审代理的评估规范传递给评审代理
- 在发送给元评审代理和评审代理的提示中包含 `CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}``
- 仅从评审代理的输出中解析 VERDICT/SCORE/ISSUES
- 如果验证失败，则根据反馈进行迭代

## 模型选择策略

选择模型是你能做出的**最具杠杆作用的单一决策**——相比提示词的措辞，它更能决定任务是否正确完成以及所需时间。你**绝不能**把它当作形式要求：在分派之前，你必须说明所选级别，并给出一句话的理由。因为不愿思考而直接选择最强模型是一种失职，而不是谨慎。

**默认级别：**`sonnet` 和 `haiku`。`opus` 受到保留，必须满足下表中的触发条件并经过授权后才能使用——绝不能因为你不确定就选择它。

### 选择规则

| 任务类型 | 级别 | 示例 |
|---|---|---|
| 单个文档/文本文件修正——不涉及代码或跨文件推理 | `haiku` | 修复拼写错误、更新 README 中的链接、修正过时的命令 |
| 小型、少量代码行（约 10 行或更少）的机械式代码修改，限制在单个文件内 | `haiku` | 增大常量、添加保护性条件、重命名局部变量、编辑配置值 |
| 编写代码——新增函数、组件或测试，单模块修改，且已有成熟模式可遵循 | `sonnet` | 添加端点、编写服务方法及测试、重构单个模块 |
| **多文件重构**（约 3 个或更多文件，或任何涉及共享契约变更的文件数量）或**关键任务**（身份验证、支付/计费、数据完整性、不可逆迁移、公共 API 破坏性变更）或**复杂逻辑**（并发、非平凡算法、架构决策） | `opus` | 跨领域重构、身份验证或支付逻辑、模式迁移、新颖的算法设计 |

**优先级（强制执行）：**必须评估每一行规则，而不能只匹配第一条。当多个规则同时匹配时，选择**最高级别**——关键性和复杂性始终优先于规模。例如，安全关键的身份验证处理程序中的四行空值检查同时匹配 `haiku` 规则和 `opus` 规则，因此应选择 `opus`。关键任务列表是完整的，而非示例性的：发布到生产环境、涉及真实用户或添加到公共 API **不属于**触发条件，因此在单个服务文件中添加带验证的新端点仍应选择 `sonnet`。**机械式跨文件变更例外：**涉及范围广并不等于复杂——纯机械式的修改（例如在多个文件中重命名符号，且不改变逻辑或契约）应根据其内容所属级别选择，无论涉及多少文件，仍可属于 `haiku` 或 `sonnet`，而不是 `opus`；但这一例外**不适用于**共享契约变更（后者本身就是 `opus` 的触发条件），因此跨文件提取共享接口仍应选择 `opus`。

**平局决胜：**仅当没有任何行能够明确匹配时——任务确实处于两个层级之间——才选择更**便宜**的层级。你绝对**不能**为了留有余地而偏向 `opus`；[升级规则](#escalation-rule)使得便宜的首次猜测可以被挽救，而一次挽救运行的成本远低于为每次运行都过度配置。

### 角色配对

任何由模型分配的流水线最多包含三个角色——**生产者**（执行工作）、**标准制定者**（定义什么才算“正确”）、**评估者**（根据这些标准检查工作）；在此 skill 中，它们分别对应实现者 / 元评审者 / 评审者。**默认规则：所有角色使用相同的层级**——如果某个流水线没有单独的标准制定者（例如计划步骤或阶段只是被分配了一个模型），则此默认规则就是完整规则。

**仅对于不明显的任务**，你可以只将**标准制定者**提高一个层级，使其制定的标准比被评估的工作更加精准。*不明显*是可验证的：层级由**平局决胜**决定（没有任何 Selection Rules 行能够明确匹配），**或者**任务没有说明可检查的验收条件。

| 模式 | 标准制定者（元评审者） | 生产者 + 评估者（实现者 + 评审者） | 适用场景 |
|---|---|---|---|
| Sharpened-haiku | `sonnet` | `haiku` | 工作很简单，但什么才算“正确”并不明显 |
| Sharpened-sonnet | `opus` | `sonnet` | 验收标准含糊或后果严重的代码工作，但其本身并未触发 `opus` 条件 |

生产者和评估者**可以**使用不同的层级。如果标准制定者生成的标准列表看起来过于复杂，你可以决定只提高评估者的层级，但**不得**将标准制定者设为低于生产者的层级。

### 升级规则

当以下任一触发条件出现时，在下一次迭代中将**生产者和评估者**（实现者和评审者）都提高一个层级：

1. **首次迭代质量低**——得分较低，或出现表明模型误解了任务而不仅仅是遗漏细节的问题。
2. **用户抱怨**质量太低或结果不正确——无论何时，包括在已报告 PASS 之后。

层级阶梯：`haiku` → `sonnet` → `opus`。`opus` 是**上限**——没有更高的层级。如果 `opus` 层级的工作仍然失败，则应升级给**用户**，绝不能循环重试。

- **显式 `--model` 例外（关于此规则的唯一说明）：**显式的 `--model` 是用户覆盖设置，因此触发条件 (1) **不得**悄悄推翻它——继续使用覆盖模型进行迭代，直到达到最大重试限制。如果在最后仍未达到目标，指出发现的问题，并建议用户提升模型。触发条件 (2) **即表示获得了该批准**，因此应立即提升。
- 升级只会变更生产者和评估者。已经生成评估规范的标准制定者**不会**重新运行，也**不会**重新分配层级——在任务过程中更改标准会使不同尝试之间的比较失效。
- 升级是对真正的根因修复的补充，而**不是**替代方案。你仍然**必须**将评审者的具体反馈传递给重试；禁止只是以更高层级重新发送相同提示并寄希望于结果变好。
- 升级与得分阈值以及[迭代裁量规则](#iteration-discretion-rule)相互独立——它只会改变下一次迭代使用的模型，绝不会改变是否有必要进行迭代。

### 跨提供商等效性

当此技能在 Anthropic 模型上下文之外运行时，将层级映射到同一类别中最接近的模型：

| 层级 | 角色 | 其他提供商的可比模型 |
|---|---|---|
| `haiku` | 快速且廉价；机械性工作 | `gemini-flash-lite`、`gemma` 类、`gpt-oss` 类、小型开放权重模型 |
| `sonnet` | 均衡的主力模型；承担大多数代码编写工作 | `gemini-pro` 类和完整的 `gemini-flash`（**不是** `-lite` 变体，后者属于 `haiku` 层级）、`GPT-5-mini` 类、大型 `Qwen` / `DeepSeek` 类模型 |
| `opus` | 前沿推理；关键或复杂工作 | 提供商所销售的扩展式 / 深思熟虑推理层级——目前包括 `GPT-5.5`、深度思考模式、`Kimi K3` 类模型，以及任何优势在于更长时间推理而非吞吐量的模型 |

映射依据是**能力层级，而非名称**——随着供应商发布新模型，具体名称会不断变化。上述每条规则都以层级表示，因此在其他提供商的平台上：将层级映射到你所使用的同类别模型，然后原样应用选择、配对和升级规则。

## 流程

### 阶段 1：任务分析与模型选择

首先解析配置：`STRICT_MODE = --strict present || false`。从任务文本中删除所有标志——**绝不要**将它们传入子代理提示词。

除非用户传入了 `--model`，否则从以下三个维度评估任务，然后直接从 [选择规则](#selection-rules) 表中读取层级：

- **范围** —— 一个文件、一个模块，还是多个文件？
- **复杂度** —— 机械性编辑、既定模式，还是新颖 / 复杂的逻辑？
- **风险** —— 孤立且可逆、内部，还是根据 [选择规则](#selection-rules) 中 `opus` 行的完整列表所定义的**关键**任务？

在分派之前，说明这三个维度的判断结果、所选层级以及一句话的理由。然后应用[角色配对](#role-pairing)来决定元评审者层级——除非任务确实不明显，否则与实现层级相同。**如果用户传入了 `--model`，则两个步骤都不运行：**该单一层级同时用于实现、元评审和评审，并且角色配对绝不能将元评审者提升到该层级之上。

**专用代理：** `sdd` 插件中常见的代理包括：`sdd:developer`、`sdd:researcher`、`sdd:software-architect`、`sdd:tech-lead`、`sdd:business-analyst`。如果适当的专用代理不可用，则回退到不带专门化的通用代理。当任务与专用代理之间没有直接关联，或专用代理不可用时，**每次都必须使用通用代理！**

### 阶段 2：并行分派元评审者和实现代理（并行）

**关键：**在一条消息中使用两个 Task 工具调用来启动**两个**代理。元评审者**必须**是该消息中的第一个工具调用，以便它能在实现代理修改工件之前观察这些工件。

两个代理都作为**前台**代理运行。在继续阶段 3 之前，等待两者都完成。

#### 2.1 元评审者提示词

元评审者会生成针对特定任务定制的评估规范（评分标准、检查清单、评分准则）。它将向你返回评估规范 YAML。

```markdown
## Task

Generate an evaluation specification yaml for the following task. You will produce rubrics, checklists, and scoring criteria that a judge agent will use to evaluate the implementation artifact.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt
{Original task description from user}

## Context
{Any relevant codebase context, file paths, constraints}

## Artifact Type
{code | documentation | configuration | etc.}

## Instructions
Return only the final evaluation specification YAML in your response.
```

```
Use Task tool:
  - description: "Meta-judge: {brief task summary}"
  - prompt: {meta-judge prompt}
  - model: {meta-judge model — the user's `--model` if one was passed; otherwise same as implementation, or one tier up per Role Pairing}
  - subagent_type: "sadd:meta-judge"
```

#### 2.2 实现代理提示词

构建实现提示词时，必须包含以下组件：

**零样本思维链前缀（必需 - 必须位于最前）**

```markdown
## Reasoning Approach

Before taking any action, think through this task systematically.

Let's approach it step by step:

1. "Let me understand what this task requires..."
   - What is the specific objective?
   - What constraints exist?
   - What is the expected outcome?

2. "Let me explore the relevant code..."
   - What files are involved?
   - What patterns exist in the codebase?
   - What dependencies need consideration?

3. "Let me plan my approach..."
   - What specific modifications are needed?
   - What order should I make them?
   - What could go wrong?

4. "Let me verify my approach before implementing..."
   - Does my plan achieve the objective?
   - Am I following existing patterns?
   - Is there a simpler way?

Work through each step explicitly before implementing.
```

**任务正文**

```markdown
## Task
{Task description from user}

## Constraints
- Follow existing code patterns and conventions
- Make minimal changes to achieve the objective
- Do not introduce new dependencies without justification
- Ensure changes are testable
- Critical: you not allowed to use any mutation git commands, including, but not limited: commit, stash, push, checkout, reset, revert, etc. Except cases when task EXPLICITLY allows or requires it. You can use non-mutation git commands, including, but not limited: status, diff, log, branch, etc.

## Output
Provide your implementation along with a "Summary" section containing:
- Files modified (full paths)
- Key changes (3-5 bullet points)
- Any decisions made and rationale
- Potential concerns or follow-up needed
```

**自我批评后缀（必需 - 必须位于最后）**

```markdown
## Self-Critique Verification (MANDATORY)

Before completing, verify your work. Do not submit unverified changes.

### Verification Questions

| # | Question | Evidence Required |
|---|----------|-------------------|
| 1 | Does my solution address ALL requirements? | [Specific evidence] |
| 2 | Did I follow existing code patterns? | [Pattern examples] |
| 3 | Are there any edge cases I missed? | [Edge case analysis] |
| 4 | Is my solution the simplest approach? | [Alternatives considered] |
| 5 | Would this pass code review? | [Quality check] |

### Answer Each Question with Evidence

Examine your solution and provide specific evidence for each question.

### Revise If Needed

If ANY verification question reveals a gap:
1. **FIX** - Address the specific gap identified
2. **RE-VERIFY** - Confirm the fix resolves the issue
3. **UPDATE** - Update the Summary section

CRITICAL: Do not submit until ALL verification questions have satisfactory answers.
```

**调度**

根据任务和可用的 agent 确定最佳的 agent 类型，例如：代码实现 -> `sdd:developer` agent。如果不确定，最好使用 `general-purpose` agent，而不是调度错误的 agent 类型。

```
Use Task tool:
  - description: "Implement: {brief task summary}"
  - prompt: {constructed prompt with CoT + task + self-critique}
  - model: {selected implementation model}
  - subagent_type: "{selected agent type}"
```

#### 2.3 并行调度示例

在同一条消息中发送 BOTH Task 工具调用。先进行元评审，再进行实现：

```
Message with 2 tool calls:
  Tool call 1 (meta-judge):
    - description: "Meta-judge: {brief task summary}"
    - model: {meta-judge model — the user's `--model` if one was passed; otherwise same as implementation, or one tier up per Role Pairing}
    - subagent_type: "sadd:meta-judge"

  Tool call 2 (implementation):
    - description: "Implement: {brief task summary}"
    - model: {selected implementation model}
    - subagent_type: "{selected agent type}"
```

等待 BOTH 返回后，再继续执行第 3 阶段。

### 第 3 阶段：调度评审 agent

元评审和实现都完成后，调度评审 agent。

关键要求：向评审 agent 提供元评审的完整评估规范 YAML，不得跳过或添加任何内容，不得以任何方式修改，不得缩短或总结其中的任何文本！

**从元评审输出中提取：**
- 最终评估规范 YAML

**从实现输出中提取：**
- Summary 部分（已修改的文件、关键变更）
- 已修改文件的路径

#### 3.1 分析预先存在的变更部分

在调度评审 agent 之前，评估代码库中是否存在评审 agent 需要了解的预先存在的变更。“Pre-existing Changes”部分用于防止评审 agent 将之前的修改误认为是当前实现 agent 的工作。

**包含该部分的情况：**

- 同一会话中此前已完成过 do-and-judge 任务运行
- 用户在调用此 skill 之前进行的手动修改（可从对话上下文或 git 中看到）
- 在此任务之前由其他工具或 agent 执行的变更

**省略该部分的情况：**

- 这是第一个任务，且没有已知的预先存在的变更——完全省略该部分
- 在同一任务内重试时，不要将实现 agent 自己之前的尝试作为“预先存在的变更”——这些属于当前任务的迭代周期

**内容指南：**

- 使用高层次摘要：任务描述、受影响的文件/模块列表、变更的大致性质（创建、修改、删除）
- 不要包含代码块、差异或逐行细节——保持简洁
- 清楚标明来源：“Previous Task: {description}”、“User modifications (before current task)”等
- 如果存在多个预先存在的变更来源，请为每个来源使用单独的子部分

关键要求：避免读取完整代码库或 git 历史记录，只需使用高层次的 git diff/status 来确定哪些文件发生了变更，或使用对话上下文来确定是否存在预先存在的变更。

### 3.2 使用提示词和 specification YAML 启动 Judge

**Judge 提示词模板：**

```markdown
You are evaluating an implementation artifact against an evaluation specification produced by the meta judge.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt
{Original task description from user}

{IF pre-existing changes are known, include the following section — otherwise omit entirely}

## Pre-existing Changes (Context Only)

The following changes were made BEFORE the current implementation agent started working. They are NOT part of the current task's output. Focus your evaluation on the current task's changes. Only verify pre-existing changed files/logic if they directly relate to the current task requirements.

### {Source of changes: e.g., "Previous Task: {task description}" or "User modifications (before current task)"}
{High-level summary: what was done, which files/modules were created or modified}

{END conditional section}

## Evaluation Specification

```yaml
{meta-judge's evaluation specification YAML}
```

## Implementation Output
{Summary section from implementation agent}
{Paths to files modified}

## Instructions

Follow your full judge process as defined in your agent instructions!

## Output

CRITICAL: You must reply with this exact structured evaluation report format in YAML at the START of your response!
```

**重要：绝 NEVER 以任何格式提供评分阈值，包括 `threshold_pass` 或任何其他形式。Judge 绝不能知道评分阈值是多少，以免受到偏见影响！！！**

**调度：**

```
Use Task tool:
  - description: "Judge: {brief task summary}"
  - prompt: {judge verification prompt with exact meta-judge specification YAML, and Pre-existing Changes section if applicable}
  - model: {judge model — MUST equal the current implementation model, including after escalation}
  - subagent_type: "sadd:judge"
```

### 阶段 4：解析 Verdict 并迭代

解析 judge 输出（**不要**读取完整报告）：

```
Extract from judge reply:
- VERDICT: PASS or FAIL
- SCORE: X.X/5.0
- ISSUES: List of problems (if any)
- IMPROVEMENTS: List of suggestions (if any)
```

**决策逻辑：**

```
If score ≥4:
  → VERDICT: PASS
  → Report success with summary
  → Include IMPROVEMENTS as optional enhancements

If 3.0 ≤ score <4 and NOT STRICT_MODE:
  → Apply the Iteration Discretion Rule below
    → accepted → VERDICT: PASS (report outstanding issues)
    → declined → VERDICT: FAIL → go to "Check retry count" below

Otherwise (score <3.0, or score <4 with STRICT_MODE):
  → VERDICT: FAIL
  → Check retry count

  If retries < 3:
    → Decide the retry tier per Phase 5 "Model Escalation on Retry" (bump BOTH implementation and judge, or hold)
    → Dispatch retry implementation agent with judge feedback
    → Return to Phase 3 (judge verification with same meta-judge specification)

  If retries ≥ 3:
    → Escalate to user (see Error Handling)
    → Do NOT proceed without user decision
```

注意：`retries` 只统计**当前周期**内的尝试次数。在报告 PASS 后重新进入时，此预算会重置（参见[阶段 6：最终报告](#phase-6-final-report)中的 [Phase 6 Re-entry](#phase-6-final-report)）——即使之前的周期已经达到上述限制，后续用户质量投诉仍会开启一个最多可重试 3 次的新周期。

#### 迭代裁量规则

你的主要任务是在目标质量范围内**完成**任务。两种失败模式同样真实存在：

- 在无关紧要的问题上消耗重试次数和上下文，导致任务无法按时完成 → **任务失败**；开发者正在等待这一结果，后续依赖此结果的工作可能会被阻塞，因此实现投入 MUST 与任务规模相称。
- 报告一个质量确实过低、不能视为已完成的结果 → **更严重的失败**。

应用于每次评审评分：

- **`score < 3.0` → 无条件 FAIL。不得裁量。** 根据评审反馈重试，直到通过或达到最大重试次数。
- **`3.0 <= score < 4.0` → 裁量区间。** 只有在此区间内，才 MAY 决定接受低于 `4.0` 目标的结果。固定的 `4.0` 目标使有效下限为 `3.0`，因此不需要单独的有界降级保护。
- 在此区间内，当剩余问题**仅为**低/中优先级问题时（任何 High 或 Critical 级别的问题都会完全取消裁量权），并且这些问题均未破坏任务的目标要求或造成实质性缺陷（也就是说，它们只是无关紧要的问题），你 MUST 先进行推理——在派发重试之前——判断再次尝试是否值得开发者的时间和你的上下文消耗。
- **最多进行一次由无关紧要问题驱动的重试**，且该重试计入重试预算。如果再次出现的仍然只是无关紧要的问题，你 MUST 报告 PASS（☑️ ACCEPTED），并在最终报告中列出剩余问题。如果返回的评分低于 `3.0`，则适用无条件 FAIL 规则。
- 你 MUST 保持批判性，**不得宽松处理**。停止在目标分数之前必须是有意为之的决定，并且这一决定必须建立在不存在真正的、会破坏要求的问题这一事实上。若存在阻碍任务在最大重试次数内完成的真实阻塞问题，必须将其升级为失败，绝不能粉饰过去。
- **如果 `STRICT_MODE` 为 true，则整个规则均被禁用**：只有在 `score >= 4.0` 或达到最大重试次数时才能停止。`--strict` 不会改变其他任何内容——`4.0` 目标、最大重试次数限制、`< 3.0` 无条件 FAIL 规则以及 meta-judge/judge 的派发均不受影响。

### 阶段 5：根据反馈重试（如需要）

#### 重试时的模型升级

在派发任何重试之前，你 MUST 根据 [升级规则](#escalation-rule) 明确决定层级——该规则完整适用——并在输出中说明这一决定。除此之外，以下重试专属锚点也适用：

- **触发条件 (1) 在此处固定为 `score < 3.0`**（或存在表明模型误解了任务、而不仅仅是遗漏细节的问题）。
- 当失败源于具体且可修复的缺陷，而不是能力差距时，**保持当前层级**——范围狭窄、描述精确的问题，通过同层级重试并提供准确反馈可以更快解决。
- 如果 `opus` 仍然失败，则根据 [错误处理](#error-handling) 升级给用户。

**重试提示词模板：**

```markdown
## Retry Required

Your previous implementation did not pass judge verification.

## Original Task
{Original task description}

## Judge Feedback
VERDICT: FAIL
SCORE: {score}/5.0
ISSUES:
{list of issues from judge}

## Your Previous Changes
{files modified in previous attempt}

## Instructions
Let's fix the identified issues step by step.

1. Review each issue the judge identified
2. For each issue, determine the root cause
3. Plan the fix for each issue
4. Implement ALL fixes
5. Verify your fixes address each issue
6. Provide updated Summary section

CRITICAL: Focus on fixing the specific issues identified. Do not rewrite everything.
```

### 阶段 6：最终报告

任务通过验证后：

```markdown
## Execution Summary

**Task:** {original task description}
**Result:** ✅ PASS (or ☑️ ACCEPTED below target per the Iteration Discretion Rule)
**Strict Mode:** {STRICT_MODE}

### Verification
| Attempt | Score | Status |
|---------|-------|--------|
| 1 | {X.X}/5.0 | {PASS/ACCEPTED/FAIL} |
| {N} | {X.X}/5.0 | {PASS/ACCEPTED/FAIL} | (one row per retry that occurred, up to 3)

### Outstanding Issues (if accepted below target)
{Nitpicks left unresolved, with priority — omit this section when score >= 4.0}

### Files Modified
- {file1}: {what changed}
- {file2}: {what changed}

### Key Changes
- {change 1}
- {change 2}

### Suggested Improvements (Optional)
{IMPROVEMENTS from judge, if any}
```

**报告后的重新进入：**报告为 PASS **并不意味着**任务已关闭。如果用户随后表示结果错误或质量过低，则将其投诉作为反馈重新进入阶段 5——这属于[升级规则](#escalation-rule)触发条件（2），因此将生产者和评估者都提升一个等级（除非已经是 `opus`）并重试。重试预算会**重置**：即使之前的周期已经耗尽其重试次数，投诉也会开启一个最多 3 次重试的新周期。

## 错误处理

### 如果超过最大重试次数

当任务在 3 次重试后仍未通过验证时：

1. **停止** - 不要继续
2. **报告** - 提供失败分析：
   - 原始任务要求
   - 所有评审结论和分数
   - 多次重试中持续存在的问题
3. **升级** - 向用户提供以下选项：
   - 提供额外上下文/指导以进行重试
   - 在下一个模型等级上重新运行（如果本次运行已经使用 `opus`，则不可用）
   - 修改任务要求
   - 中止任务
4. **等待** - 未获得用户决定前不要继续

**升级报告格式：**

```markdown
## Task Failed Verification (Max Retries Exceeded)

### Task Requirements
{original task description}

### Verification History
| Attempt | Score | Key Issues |
|---------|-------|------------|
| 1 | {X.X}/5.0 | {issues} |
| 2 | {X.X}/5.0 | {issues} |
| 3 | {X.X}/5.0 | {issues} |

### Persistent Issues
{Issues that appeared in multiple attempts}

### Options
1. **Provide guidance** - Give additional context for another retry
2. **Escalate the tier** - Re-run implementation and judge one tier up (omit this option if already `opus`)
3. **Modify requirements** - Simplify or clarify task
4. **Abort** - Stop execution

Awaiting your decision...
```

## 示例

### 示例 1：文档更新（首次尝试通过）

**输入：**

```
/do-and-judge Rewrite the API authentication section in docs/api-reference.md to cover the new OAuth2 flow
```

**执行：**

```
Phase 1: Task Analysis
  - Complexity: Medium (rewriting existing documentation with new technical flow)
  - Risk: Low (documentation only, no code changes)
  - Scope: Small (single file, focused section)
  → Model: haiku (implementation + judge), sonnet (meta-judge)
    Reasoning: Single documentation file, no code written — no opus
    trigger fires. It is more than a one-line correction, so it straddles
    haiku/sonnet; the tie-breaker sends it DOWN to haiku, and escalation
    covers a thin first pass. The task states no checkable acceptance
    condition — the second non-obvious disjunct — so the sharpened-haiku
    pairing raises the meta-judge one tier to sonnet.
  → Agent type: general-purpose
    Reasoning: This is a documentation task — writing and restructuring
    prose, not implementing code. The sdd:developer agent is optimized
    for code implementation patterns, not technical writing. A
    general-purpose agent handles documentation tasks more effectively
    because it applies broader writing and reasoning skills without
    code-centric constraints.

Phase 2: Parallel Dispatch (single message, 2 tool calls)
  Tool call 1 — Meta-judge (Sonnet)...
    Meta-judge prompt sent:
    ┌─────────────────────────────────────────────────────────
    │ ## Task
    │ Generate an evaluation specification yaml for the
    │ following task. You will produce rubrics, checklists,
    │ and scoring criteria that a judge agent will use to
    │ evaluate the implementation artifact.
    │
    │ CLAUDE_PLUGIN_ROOT=...
    │
    │ ## User Prompt
    │ Rewrite the API authentication section in
    │ docs/api-reference.md to cover the new OAuth2 flow
    │
    │ ## Context
    │ Existing docs/api-reference.md contains an outdated
    │ "Authentication" section describing API key auth.
    │ The codebase recently migrated to OAuth2 with PKCE.
    │ Related source: src/auth/oauth2.ts, src/auth/config.ts.
    │
    │ ## Artifact Type
    │ documentation
    │
    │ ## Instructions
    │ Return only the final evaluation specification YAML
    │ in your response.
    └─────────────────────────────────────────────────────────
    → Generated evaluation specification YAML
    → 3 rubric dimensions (accuracy, completeness, clarity)
    → 5 checklist items

  Tool call 2 — Implementation (general-purpose + Haiku)...
    Implementation prompt sent (abbreviated):
    ┌─────────────────────────────────────────────────────────
    │ ## Reasoning Approach
    │ Before taking any action, think through this task
    │ systematically.
    │ [... step-by-step reasoning template ...]
    │
    │ ## Task
    │ Rewrite the API authentication section in
    │ docs/api-reference.md to cover the new OAuth2 flow.
    │ Replace the outdated API key auth documentation with
    │ OAuth2 + PKCE flow documentation including token
    │ endpoints, scopes, refresh token handling, and
    │ example requests.
    │
    │ ## Constraints
    │ - Follow existing documentation patterns and conventions
    │ - Make minimal changes to achieve the objective
    │ - Do not introduce new dependencies without justification
    │ - Ensure changes are testable
    │
    │ ## Output
    │ Provide your implementation along with a "Summary"
    │ section containing:
    │ - Files modified (full paths)
    │ - Key changes (3-5 bullet points)
    │ - Any decisions made and rationale
    │ - Potential concerns or follow-up needed
    │
    │ ## Self-Critique Verification (MANDATORY)
    │ [... verification questions and revision process ...]
    └─────────────────────────────────────────────────────────
    → Rewrote Authentication section in docs/api-reference.md
    → Added OAuth2 flow diagram, token endpoints, scopes table
    → Added code examples for authorization and token refresh
    → Summary: 1 file modified, authentication section rewritten

Phase 3: Dispatch Judge (with meta-judge specification)
  NOTE: No pre-existing changes — first task on a clean codebase.
  The "Pre-existing Changes" section is OMITTED from the judge prompt.

  Judge prompt sent:
  ┌─────────────────────────────────────────────────────────
  │ You are evaluating an implementation artifact against
  │ an evaluation specification produced by the meta judge.
  │
  │ CLAUDE_PLUGIN_ROOT=...
  │
  │ ## User Prompt
  │ Rewrite the API authentication section in
  │ docs/api-reference.md to cover the new OAuth2 flow
  │
  │ ## Evaluation Specification
  │ ```yaml
  │ {meta-judge's evaluation specification YAML}
  │ ```
  │
  │ ## Implementation Output
  │ Files: docs/api-reference.md (modified)
  │ Key changes: Replaced API key auth section with OAuth2
  │ + PKCE flow, added token endpoints, scopes table,
  │ and code examples for authorization and refresh...
  │
  │ ## Instructions
  │ Follow your full judge process...
  └─────────────────────────────────────────────────────────

  Judge (sadd:judge + Haiku)...   ← same tier as implementation
    → VERDICT: PASS, SCORE: 4.2/5.0
    → ISSUES: None
    → IMPROVEMENTS: Add error response examples for expired tokens

Phase 4: Parse Verdict
  → Score 4.2 ≥ 4.0 threshold → PASS
  → No retry needed (Phase 5 skipped)

Phase 6: Final Report
  ✅ PASS on attempt 1
  Files: docs/api-reference.md (modified)
```

### 示例 2：升级模型重试后通过

**输入：**

```
/do-and-judge Implement rate limiting middleware with configurable limits per endpoint
```

**执行：**

```
Phase 1: Task Analysis
  - Complexity: Medium (new middleware, established pattern)
  - Risk: Medium (middleware sits in front of all endpoints)
  - Scope: Small (single middleware + config schema)
  → Model: sonnet (implementation + meta-judge + judge)
    Reasoning: Code writing on an established pattern, confined to one
    module. No opus trigger fires — not multi-file, not complex logic,
    and rate limiting is on none of the critical list; breadth of reach
    is not itself a trigger. Same tier for all three roles.

Phase 2: Parallel Dispatch (Attempt 1)
  Tool call 1 — Meta-judge (Sonnet)...
    → Generated evaluation specification YAML
    → 4 rubric dimensions, 8 checklist items
  Tool call 2 — Implementation (sdd:developer + Sonnet)...
    → Created RateLimiter middleware
    → Added configuration schema

Phase 3: Dispatch Judge (with meta-judge specification)
  Judge (sadd:judge + Sonnet)...
    → VERDICT: FAIL, SCORE: 2.9/5.0
    → ISSUES:
      - Missing per-endpoint configuration (a stated requirement)
      - Limiter is not concurrency-safe under parallel requests
    → IMPROVEMENTS: Add monitoring hooks

Phase 5: Retry with Feedback
  Model Escalation on Retry:
    → Score 2.9 < 3.0 and the concurrency issue shows the task was
      misunderstood, not merely under-delivered → ESCALATE
    → Bump BOTH implementation and judge: sonnet → opus
    → Meta-judge NOT re-run, NOT re-tiered — same specification reused
  Implementation (sdd:developer + Opus)...
    → Added endpoint-specific limits
    → Replaced the counter with an atomic, concurrency-safe token bucket

Phase 3: Dispatch Judge (Attempt 2, same meta-judge specification)
  Judge (sadd:judge + Opus)...   ← escalated with the implementation
    → VERDICT: PASS, SCORE: 4.4/5.0
    → IMPROVEMENTS: Add metrics export

Phase 6: Final Report
  ✅ PASS on attempt 2
  Files: RateLimiter.ts, config/rateLimits.ts, adapters/RedisAdapter.ts
```

### 示例 3：需要升级的任务

**输入：**

```
/do-and-judge Migrate the database schema to support multi-tenancy
```

**执行：**

```
Phase 1: Task Analysis
  - Complexity: High (multi-tenancy affects every query path)
  - Risk: High (database schema change)
  - Scope: Large (schema, migrations, query layer)
  → Model: opus (implementation + meta-judge + judge)
    Reasoning: opus is EARNED here — two triggers fire: multi-file
    refactoring and critical (data integrity, irreversible migration).

Phase 2: Parallel Dispatch
  Meta-judge → evaluation specification YAML
  Implementation → initial migration scaffolding

Attempt 1: FAIL (2.8/5.0) - Missing tenant isolation in queries
Attempt 2: FAIL (3.2/5.0) - Incomplete migration script
Attempt 3: FAIL (3.3/5.0) - Edge cases in existing data migration

ESCALATION:
  Persistent issue: Existing data migration requires business decisions
  about how to handle orphaned records.

  Options presented to user (tier escalation omitted — already at the
  opus ceiling, no bump available):
  1. Provide guidance on orphan handling
  2. Simplify to new tenants only
  3. Abort

User chose: Option 1 - "Delete orphaned records older than 1 year"

Attempt 4 (with guidance): PASS (4.1/5.0)
```

### 示例 4：顺序执行 do-and-judge 运行（来自之前任务的预先存在的更改）

**输入（第一次运行）：**

```
/do-and-judge add basic authentication module
```

**执行（第一次运行）：**

```
Phase 1: Task Analysis
  - Complexity: High (new feature, security-sensitive)
  - Risk: High (authentication is critical)
  - Scope: Medium (new module, several files)
  → Model: opus (implementation + meta-judge + judge)
    Reasoning: opus is EARNED — the critical trigger fires on auth.
  - Pre-existing Changes: None

Phase 2: Parallel Dispatch (Attempt 1)
  Tool call 1 — Meta-judge (Opus)...
    Meta-judge prompt sent:
    ┌─────────────────────────────────────────────────────────
    │ ## Task
    │ Generate an evaluation specification yaml for the
    │ following task. You will produce rubrics, checklists,
    │ and scoring criteria that a judge agent will use to
    │ evaluate the implementation artifact.
    │
    │ CLAUDE_PLUGIN_ROOT=...
    │
    │ ## User Prompt
    │ Add basic authentication module
    │
    │ ## Context
    │ Express.js backend, src/auth/ directory does not exist
    │ yet. Existing middleware pattern in src/middleware/.
    │
    │ ## Artifact Type
    │ code
    │
    │ ## Instructions
    │ Return only the final evaluation specification YAML
    │ in your response.
    └─────────────────────────────────────────────────────────
    → Generated evaluation specification YAML
    → 4 rubric dimensions, 7 checklist items

  Tool call 2 — Implementation (sdd:developer + Opus)...
    Implementation prompt sent (abbreviated):
    ┌─────────────────────────────────────────────────────────
    │ ## Reasoning Approach
    │ Before taking any action, think through this task
    │ systematically.
    │ [... step-by-step reasoning template ...]
    │
    │ ## Task
    │ Add basic authentication module to the Express.js
    │ backend. Create login, logout, and register endpoints
    │ with proper middleware for route protection.
    │
    │ ## Constraints
    │ - Follow existing code patterns and conventions
    │ - Make minimal changes to achieve the objective
    │ - Do not introduce new dependencies without
    │   justification
    │ - Ensure changes are testable
    │
    │ ## Output
    │ Provide your implementation along with a "Summary"
    │ section containing:
    │ - Files modified (full paths)
    │ - Key changes (3-5 bullet points)
    │ - Any decisions made and rationale
    │ - Potential concerns or follow-up needed
    │
    │ ## Self-Critique Verification (MANDATORY)
    │ [... verification questions and revision process ...]
    └─────────────────────────────────────────────────────────
    → Created src/auth/AuthService.ts
    → Created src/auth/AuthMiddleware.ts
    → Created src/auth/auth.routes.ts
    → Modified src/app.ts
    → Summary: 4 files changed, auth module added

Phase 3: Dispatch Judge (with meta-judge specification)
  NOTE: No pre-existing changes — this is the first task on a clean codebase.
  The "Pre-existing Changes" section is OMITTED from the judge prompt.

  Judge prompt sent:
  ┌─────────────────────────────────────────────────────────
  │ You are evaluating an implementation artifact against
  │ an evaluation specification produced by the meta judge.
  │
  │ CLAUDE_PLUGIN_ROOT=...
  │
  │ ## User Prompt
  │ Add basic authentication module
  │
  │ ## Evaluation Specification
  │ ```yaml
  │ {meta-judge's evaluation specification YAML}
  │ ```
  │
  │ ## Implementation Output
  │ Files: src/auth/AuthService.ts (new), ...
  │ Key changes: Added login/logout/register endpoints...
  │
  │ ## Instructions
  │ Follow your full judge process...
  └─────────────────────────────────────────────────────────

  Judge (sadd:judge + Opus)...
    → VERDICT: FAIL, SCORE: 3.0/5.0
    → ISSUES:
      - Missing password hashing (plain-text storage)
      - No unit tests for AuthService
    → IMPROVEMENTS: Add rate limiting on login endpoint

Phase 5: Retry with Feedback (Attempt 2)
  Model Escalation on Retry:
    → Already at opus — the ceiling, no bump available. Retry at the
      same tier with the judge's specific feedback; if this fails
      repeatedly, escalate to the user rather than looping.
  Implementation (sdd:developer + Opus)...
    → Added bcrypt password hashing
    → Created tests/auth/AuthService.test.ts
    → Summary: 2 files modified, 1 file created

Phase 3: Dispatch Judge (Attempt 2, same meta-judge specification)
  NOTE: This is a retry within the SAME task — do NOT include the
  implementation agent's previous attempt as "pre-existing changes".
  The "Pre-existing Changes" section is still OMITTED.

  Judge (sadd:judge + Opus)...
    → VERDICT: PASS, SCORE: 4.3/5.0
    → IMPROVEMENTS: Add integration tests

Phase 6: Final Report
  ✅ PASS on attempt 2
  Files: AuthService.ts, AuthMiddleware.ts, auth.routes.ts,
         AuthService.test.ts, app.ts
```

**输入（第二次运行，同一会话）：**

```
/do-and-judge refactor auth module to use dependency injection
```

**执行（第二次运行）：**

```
Phase 1: Task Analysis
  - Complexity: Medium (refactoring existing code)
  - Risk: Medium (modifying working auth module)
  - Scope: Large (5 files across the module and its wiring)
  → Model: opus (implementation + meta-judge + judge)
    Reasoning: opus is EARNED — multi-file refactoring, and the module
    being rewired is the security-critical auth path.
  - Pre-existing Changes: Auth module created in previous task

Phase 2: Parallel Dispatch
  Tool call 1 — Meta-judge (Opus)...
    Meta-judge prompt sent:
    ┌─────────────────────────────────────────────────────────
    │ ## Task
    │ Generate an evaluation specification yaml for the
    │ following task. You will produce rubrics, checklists,
    │ and scoring criteria that a judge agent will use to
    │ evaluate the implementation artifact.
    │
    │ CLAUDE_PLUGIN_ROOT=...
    │
    │ ## User Prompt
    │ Refactor auth module to use dependency injection
    │
    │ ## Context
    │ Existing auth module at src/auth/ with AuthService,
    │ AuthMiddleware, auth.routes. Tests in tests/auth/.
    │
    │ ## Artifact Type
    │ code
    │
    │ ## Instructions
    │ Return only the final evaluation specification YAML
    │ in your response.
    └─────────────────────────────────────────────────────────
    → Generated evaluation specification YAML
    → 3 rubric dimensions, 5 checklist items

  Tool call 2 — Implementation (sdd:developer + Opus)...
    Implementation prompt sent (abbreviated):
    ┌─────────────────────────────────────────────────────────
    │ ## Reasoning Approach
    │ Before taking any action, think through this task
    │ systematically.
    │ [... step-by-step reasoning template ...]
    │
    │ ## Task
    │ Refactor the auth module to use dependency injection.
    │ AuthService should accept its dependencies via
    │ constructor instead of importing them directly.
    │
    │ ## Constraints
    │ - Follow existing code patterns and conventions
    │ - Make minimal changes to achieve the objective
    │ - Do not introduce new dependencies without
    │   justification
    │ - Ensure changes are testable
    │
    │ ## Output
    │ Provide your implementation along with a "Summary"
    │ section containing:
    │ - Files modified (full paths)
    │ - Key changes (3-5 bullet points)
    │ - Any decisions made and rationale
    │ - Potential concerns or follow-up needed
    │
    │ ## Self-Critique Verification (MANDATORY)
    │ [... verification questions and revision process ...]
    └─────────────────────────────────────────────────────────
    → Refactored AuthService to accept dependencies via constructor
    → Created src/auth/AuthServiceFactory.ts
    → Updated tests to use mocked dependencies
    → Summary: 4 files modified, 1 file created

Phase 3: Dispatch Judge (with meta-judge specification)
  NOTE: Pre-existing changes detected — the previous do-and-judge run
  created the auth module. Include "Pre-existing Changes" section so the
  judge does not confuse prior work with the current refactoring task.

  Judge prompt sent:
  ┌─────────────────────────────────────────────────────────
  │ You are evaluating an implementation artifact against
  │ an evaluation specification produced by the meta judge.
  │
  │ CLAUDE_PLUGIN_ROOT=...
  │
  │ ## User Prompt
  │ Refactor auth module to use dependency injection
  │
  │ ## Pre-existing Changes (Context Only)
  │
  │ The following changes were made BEFORE the current
  │ implementation agent started working. They are NOT part
  │ of the current task's output. Focus your evaluation on
  │ the current task's changes. Only verify pre-existing
  │ changed files/logic if they directly relate to the
  │ current task requirements.
  │
  │ ### Previous Task: "Add basic authentication module"
  │ The following files were created/modified as part of a
  │ previous task:
  │ - src/auth/AuthService.ts (new) - Authentication service
  │   with login/logout/register
  │ - src/auth/AuthMiddleware.ts (new) - Express middleware
  │   for route protection
  │ - src/auth/auth.routes.ts (new) - Auth API routes
  │ - tests/auth/AuthService.test.ts (new) - Unit tests for
  │   auth service
  │ - src/app.ts (modified) - Integrated auth routes and
  │   middleware
  │
  │ These files exist in the codebase and may be modified by
  │ the current task, but you should evaluate only the
  │ changes made by the current implementation agent for the
  │ current task (refactoring to dependency injection).
  │
  │ ## Evaluation Specification
  │ ```yaml
  │ {meta-judge's evaluation specification YAML}
  │ ```
  │
  │ ## Implementation Output
  │ Files: src/auth/AuthService.ts (modified), ...
  │ Key changes: Refactored to constructor injection...
  │
  │ ## Instructions
  │ Follow your full judge process...
  └─────────────────────────────────────────────────────────

  Judge (sadd:judge + Opus)...
    → VERDICT: PASS, SCORE: 4.5/5.0
    → ISSUES: None
    → IMPROVEMENTS: Add interface documentation

Phase 6: Final Report
  ✅ PASS on attempt 1
  Files: AuthService.ts (modified), AuthServiceFactory.ts (new),
         AuthMiddleware.ts (modified), AuthService.test.ts (modified),
         app.ts (modified)
```

### 示例 5：do-and-judge 前用户修改过的代码库

**场景：**

```text
The user has been working on an e-commerce codebase during the conversation. They modified the shopping cart, product catalog, and checkout flow before invoking do-and-judge.
```

**输入：**

```
/do-and-judge fix shopping cart module bug when it adds duplicated items
```

**执行：**

```
Phase 1: Task Analysis
  - Complexity: Medium (bug fix in existing module)
  - Risk: Medium (cart logic affects checkout)
  - Scope: Small (focused bug fix)
  → Model: sonnet (implementation + meta-judge + judge)
    Reasoning: Code writing on a contained bug plus a regression test.
    No opus trigger — not a multi-file refactor, nothing on the critical
    list (in-memory cart state, not billing), no intricate logic. Too
    much reasoning is needed for haiku, so sonnet for all three roles.
  - Pre-existing Changes: User modified several files before this task

Phase 2: Parallel Dispatch
  Tool call 1 — Meta-judge (Sonnet)...
    → Generated evaluation specification YAML
    → 3 rubric dimensions, 5 checklist items
  Tool call 2 — Implementation (sdd:developer + Sonnet)...
    → Fixed duplicate detection in CartService.addItem()
    → Added deduplication guard in cart.routes.ts
    → Added regression test for duplicate item scenario
    → Summary: 3 files modified

Phase 3: Dispatch Judge (with meta-judge specification)
  NOTE: The orchestrator is aware from git diff/status that the user
  modified several files before this task. Include "Pre-existing Changes"
  section so the judge focuses only on the bug fix.

  Judge prompt sent:
  ┌─────────────────────────────────────────────────────────
  │ You are evaluating an implementation artifact against
  │ an evaluation specification produced by the meta judge.
  │
  │ CLAUDE_PLUGIN_ROOT=...
  │
  │ ## User Prompt
  │ Fix shopping cart module bug when it adds duplicated items
  │
  │ ## Pre-existing Changes (Context Only)
  │
  │ The following changes were made BEFORE the current
  │ implementation agent started working. They are NOT part
  │ of the current task's output. Focus your evaluation on
  │ the current task's changes. Only verify pre-existing
  │ changed files/logic if they directly relate to the
  │ current task requirements.
  │
  │ ### User modifications (before current task)
  │ The user made changes to the following files/modules
  │ before this task was started:
  │ - src/cart/CartService.ts (modified) - Shopping cart
  │   business logic updates
  │ - src/cart/cart.routes.ts (modified) - Updated cart API
  │   endpoints
  │ - src/products/ProductCatalog.ts (modified) - Product
  │   listing changes
  │ - src/checkout/CheckoutFlow.ts (modified) - Checkout
  │   process updates
  │ - tests/cart/CartService.test.ts (modified) - Updated
  │   cart tests
  │
  │ The current task focuses specifically on fixing the
  │ duplicate items bug in the shopping cart module.
  │ Pre-existing changes to cart files may overlap with the
  │ current task scope — evaluate whether the implementation
  │ agent's changes correctly address the bug without
  │ breaking the pre-existing modifications.
  │
  │ ## Evaluation Specification
  │ ```yaml
  │ {meta-judge's evaluation specification YAML}
  │ ```
  │
  │ ## Implementation Output
  │ Files: src/cart/CartService.ts (modified), ...
  │ Key changes: Added duplicate item detection...
  │
  │ ## Instructions
  │ Follow your full judge process...
  └─────────────────────────────────────────────────────────

  Judge (sadd:judge + Sonnet)...   ← same tier as implementation
    → VERDICT: PASS, SCORE: 4.1/5.0
    → ISSUES: None
    → IMPROVEMENTS: Consider extracting deduplication logic
      into a shared utility

Phase 6: Final Report
  ✅ PASS on attempt 1
  Files: CartService.ts (modified), cart.routes.ts (modified),
         CartService.test.ts (modified)
```

## 最佳实践

### 模型选择

规则由 [Model Selection Policy](#model-selection-policy) 规定；以下习惯有助于贯彻这些规则：

- **大声说明理由** - 在调度之前说明范围、复杂度和风险，以及由此得出的层级；这是运行过程中影响最大的决策
- **`opus` 靠实力赢得，绝不是保守选项** - 根据 [Selection Rules](#selection-rules) 中的优先级和决胜规则解决所有重叠和并列，绝不要凭直觉
- **所有角色使用同一层级** - 仅提升标准制定者（元评审），且仅适用于不明显的任务（[Role Pairing](#role-pairing)）
- **基于证据升级** - 当某次迭代明显级别过低，或用户提出质量问题时（[Escalation Rule](#escalation-rule)）

### 元评审 + 评审验证

- **绝不要跳过元评审** - 定制的评估标准比通用标准能产生更好的评判结果
- **重试时复用元评审规范** - 评估规范在各次重试中保持不变；只有实现发生变化
- **仅解析评审的标题** - 不要读取完整报告，以避免上下文污染
- **相信阈值** - 4/5.0 是质量门槛；低于该分数时，由 [Iteration Discretion Rule](#iteration-discretion-rule) 决定（除非使用 `--strict`）
- **包含 CLAUDE_PLUGIN_ROOT** - 元评审和评审都需要已解析的插件根路径

### 迭代

- **专注于修复** - 不要全部重写，只修复具体问题
- **原样传递反馈** - 让实现代理看到确切的问题
- **使用相同的元评审规范** - 不要在重试时重新运行元评审；评估标准不会改变
- **适当升级** - 不要因根本性问题而无限循环
- **保持适度** - 根据 [Iteration Discretion Rule](#iteration-discretion-rule) 让迭代投入与任务规模相匹配；因吹毛求疵驱动的重试最多进行一次

### 上下文管理

- **保持简洁** - 由你负责编排，由子代理负责实现
- **总结而非复制** - 传递摘要，而不是完整的文件内容
- **信任子代理** - 它们可以自行读取文件
- **元评审 YAML** - 仅将元评审 YAML 传递给评审，不要向其中添加任何额外文本或注释！
- **跟踪预先存在的更改** - 将之前修改的上下文传递给评审，以避免混淆预先存在的更改与当前更改的归属