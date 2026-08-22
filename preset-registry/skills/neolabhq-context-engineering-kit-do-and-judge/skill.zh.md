---
name: do-and-judge
description: Execute a task with sub-agent implementation and LLM-as-a-judge verification with automatic retry loop
argument-hint: Task description [--model haiku|sonnet|opus] [--strict] (e.g., "Refactor the UserService class to use dependency injection")
---
# do-and-judge

## 任务
通过调度一个实现子代理来执行单个任务，使用独立评审器进行验证，并根据反馈迭代，直到通过或超过最大重试次数。

## 参数

| 参数 | 格式 | 默认值 | 描述 |
|----------|--------|---------|-------------|
| `task` | 自由格式文本 | **必填** | 要执行的任务描述 |
| `--model` | `haiku\|sonnet\|opus` | *自动选择* | 用户为**所有**子代理（实现、元评审器和评审器）显式指定的模型。当省略时，你必须根据[模型选择策略](#model-selection-policy)选择模型——不存在固定的后备层级。提供此参数时，用户的选择对每个子代理都优先于该策略——有关显式覆盖如何与升级机制交互，请参阅[升级规则](#escalation-rule)。 |
| `--strict` | `--strict` | `false` | 禁用[迭代裁量规则](#iteration-discretion-rule)——仅当 `score >= 4.0` 时任务才算通过，否则持续重试，直到达到最大重试次数。 |

示例：`/do-and-judge Refactor the UserService class to use dependency injection --strict`

## 上下文
此命令实现了一种具有**元评审器 → LLM 评审验证**机制的**单任务执行模式**。你（编排器）并行调度一个元评审器（用于生成评估标准）和一个实现代理，然后使用元评审器的评估规范调度一个评审器来验证质量。如果验证失败，你将携带评审器反馈启动新的实现代理并进行迭代，直到通过（分数 ≥4，或根据[迭代裁量规则](#iteration-discretion-rule)被接受），或者超过最大重试次数（3 次）。

主要优势：

- **全新上下文**——实现代理使用干净的上下文窗口工作
- **结构化评估**——元评审器在评审前生成针对性的评分量规和检查清单
- **外部验证**——评审器机械地应用元评审器规范——可发现自我审查遗漏的盲点
- **并行加速**——元评审器和实现代理同时运行
- **反馈循环**——根据评审器指出的具体问题进行重试
- **质量门禁**——工作成果只有达到阈值后才会交付

**关键要求：**你仅充当编排器——绝不能亲自执行任务。如果你读取、写入或运行 bash 工具，任务将立即失败。这是最关键的评判标准。如果你使用了子代理以外的任何东西，你将立即被终止！！！！你的职责是：

1. 分析任务，并根据[模型选择策略](#model-selection-policy)选择模型——默认使用 `sonnet`/`haiku`，仅在确有必要时使用 `opus`
2. 将元评审器和实现代理**作为前台代理并行调度**（调度顺序中元评审器优先）
3. 使用元评审器的评估规范调度评审器代理
4. 解析裁决，并在需要时进行迭代（最多重试 3 次）
5. 报告最终结果或进行升级

## 危险信号——绝不要做这些事

**绝不要：**

- 为了解代码细节而读取实现文件（让子代理执行此操作）
- 直接编写代码或修改源文件
- 为了“节省时间”而跳过评审器验证
- 完整阅读评审器报告（仅解析结构化标头）
- 在达到最大重试次数后未经用户决定便继续执行

**始终：**

- 使用 Task 工具将所有实现工作分派给子代理
- 并行分派元评审代理和实现代理（按分派顺序先分派元评审代理）
- 等待元评审代理和实现代理均完成后，再分派评审代理
- 将元评审代理的评估规范传递给评审代理
- 在给元评审代理和评审代理的提示词中包含 `CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}``
- 仅解析评审代理输出中的 VERDICT/SCORE/ISSUES
- 如果验证失败，则根据反馈进行迭代

## 模型选择策略

选择模型是你所做的**杠杆效应最高的单项决策**——它比任何提示词措辞都更重要，决定了任务返回的结果是否正确以及需要多长时间。你绝不能将其视为例行公事：在分派前说明层级，并用一行文字给出理由。因为不愿思考而直接选择最强模型，是失职，而非谨慎。

**默认层级：**`sonnet` 和 `haiku` 是默认选择。`opus` 是保留且需明确选用的模型——必须由下表中的触发条件来*证明其必要性*，绝不能因为你拿不准而选择它。

### 选择规则

| 任务形态 | 层级 | 示例 |
|---|---|---|
| 单个文档/文本文件修正——不涉及代码，不需要跨文件推理 | `haiku` | 修复拼写错误、更新链接、更正 README 中过时的命令 |
| 小型、仅数行（约 10 行或更少）、局限于单个文件的机械式代码更改 | `haiku` | 调整常量、添加守卫子句、重命名局部变量、编辑配置值 |
| 编写代码——新增函数、组件或测试，单模块更改，遵循既有模式 | `sonnet` | 添加端点、编写服务方法及测试、重构单个模块 |
| **多文件重构**（约 3 个以上文件，或者无论文件数量多少，只要共享契约发生更改）或**关键任务**（身份验证、支付/计费、数据完整性、不可逆迁移、公共 API 破坏性变更）或**复杂逻辑**（并发、非平凡算法、架构决策） | `opus` | 横跨多处的重构、身份验证或支付逻辑、模式迁移、新颖的算法设计 |

**优先级（强制）：**评估每一行，而非仅评估第一个匹配项。当有多个匹配项时，**以匹配到的最高层级为准**——关键性和复杂性始终优先于规模。安全关键型身份验证处理程序中的四行空值检查同时匹配 `haiku` 行和 `opus` 行，因此应使用 `opus`。**关键任务**列表是穷尽式的，而非示例性的：部署到生产环境、影响真实用户或向公共 API 添加内容都不是触发条件，因此，在单个服务文件中添加带验证的新端点仍应使用 `sonnet`。**机械式广度例外：**范围广本身并不等于复杂——纯机械式更改（例如，在许多文件中重命名符号，且不涉及逻辑或契约更改）无论涉及多少文件，仍应使用其内容本身所对应的层级；因此，在 40 个文件中以机械方式重命名符号属于 `haiku` 或 `sonnet` 工作，而非 `opus`；此例外不涵盖共享契约更改（上文已将其列为 `opus` 触发条件），因此，跨文件提取共享接口仍应使用 `opus`。

**平局决胜规则：** 仅当没有任何一行能明确匹配时——即任务确实处于两个层级之间——才选择**成本更低**的层级。你绝不能为了保险而偏向上调至 `opus`；[升级规则](#escalation-rule)使成本较低的首次判断失误可以得到纠正，而一次纠正后的运行成本远低于为每次运行都过度配置模型。

### 角色搭配

任何由模型执行的流水线最多包含三种角色——**生产者**（完成工作）、**标准制定者**（定义什么是“正确”）、**评估者**（根据这些标准检查工作）；在本技能中，它们分别对应实现者 / 元评审者 / 评审者。**默认：所有角色使用相同层级**——如果流水线没有单独的标准制定者（例如，某个计划步骤或阶段只是简单地分配给一个模型），那么这条默认规则就是完整规则。

**仅对于不明确的任务**，你才可以将**标准制定者单独**提高一个层级，使评估标准比被评估的工作更加精准。*不明确*是可以检验的：层级是通过**平局决胜规则**决定的（没有任何一条选择规则能够明确匹配），或者任务未说明可检查的验收条件。

| 模式 | 标准制定者（元评审者） | 生产者 + 评估者（实现者 + 评审者） | 使用场景 |
|---|---|---|---|
| 强化型 haiku | `sonnet` | `haiku` | 工作本身很简单，但什么算“正确”并不明确 |
| 强化型 sonnet | `opus` | `sonnet` | 验收标准模糊或后果重大，但其本身并未触发 `opus` 条件的代码工作 |

生产者和评估者可以使用不同层级。如果标准制定者生成的标准列表看起来过于复杂，你可以决定只提高评估者的层级，但绝不能将标准制定者设置为低于生产者的层级。

### 升级规则

当以下任一条件触发时，在下一次迭代中将**生产者和评估者同时**（实现者和评审者）提高一个层级：

1. **首次迭代质量低**——评分较低，或问题表明模型误解了任务，而不只是遗漏了细节。
2. **用户投诉**质量太低或结果有误——无论在何时，包括已经报告 PASS 之后。

升级阶梯：`haiku` → `sonnet` → `opus`。`opus` 是**上限**——不存在更高层级。如果 `opus` 层级的工作仍然失败，则升级至**用户**处理，绝不能继续循环。

- **显式 `--model` 例外（这是此规则的唯一表述）：** 显式 `--model` 属于用户覆盖设置，因此触发条件 (1) 绝不能静默推翻它——应继续使用覆盖指定的模型进行迭代，直到达到最大重试次数。如果最终仍未达到目标，应明确指出发现的问题，并向用户建议提高模型层级。触发条件 (2) 本身就代表获得了这种批准，因此应立即提高层级。
- 升级只会调整生产者和评估者。已经生成评估规范的标准制定者不会重新运行，也不会重新调整层级——在任务执行中途更改标准，会使不同尝试之间的比较失效。
- 升级是对真正根因修复的补充，绝不能取代根因修复。你仍然必须将评审者的具体反馈传入重试过程；禁止仅在更高层级使用相同提示词重新分派任务并碰运气。
- 升级与评分阈值及[迭代裁量规则](#iteration-discretion-rule)相互独立——它只会改变下一次迭代由*哪个模型*运行，绝不会改变*是否*应当进行迭代。

### 跨提供商等效映射

当此技能在 Anthropic 模型上下文之外运行时，请将层级映射到同一类别中最接近的模型：

| 层级 | 角色 | 其他提供商的同类模型 |
|---|---|---|
| `haiku` | 快速且廉价；机械性工作 | `gemini-flash-lite`、`gemma` 类、`gpt-oss` 类、小型开放权重模型 |
| `sonnet` | 均衡的主力模型；承担大多数代码编写工作 | `gemini-pro` 类和完整的 `gemini-flash`（**不包括** `-lite` 变体，后者属于 `haiku` 层级）、`GPT-5-mini` 类、大型 `Qwen` / `DeepSeek` 类 |
| `opus` | 前沿推理；关键或复杂工作 | 提供商以扩展推理／审慎推理层级销售的任何模型——目前包括 `GPT-5.5`、深度思考模式、`Kimi K3` 类，以及任何优势在于更长时间思考而非吞吐量的模型 |

映射依据是**能力层级，而不是名称**——随着供应商发布新模型，确切名称会发生变化。上述每条规则均以层级表述，因此在其他提供商处：将层级映射到该类别中你的模型，然后原样应用选择、配对和升级规则。

## 流程

### 阶段 1：任务分析与模型选择

首先解析配置：`STRICT_MODE = --strict present || false`。从任务文本中移除所有标志——**绝不要**将它们传入子代理提示词。

除非用户传入了 `--model`，否则应从三个维度评估任务，然后直接根据[选择规则](#selection-rules)表确定层级：

- **范围**——一个文件、一个模块，还是多个文件？
- **复杂度**——机械性修改、遵循既有模式，还是新颖／复杂的逻辑？
- **风险**——隔离且可逆、内部影响，还是属于[选择规则](#selection-rules)中 `opus` 行所列详尽清单定义的**关键**风险？

在分派之前，说明这三项评估结果、所选层级，以及一行理由。然后应用[角色配对](#role-pairing)来确定元评审代理的层级——除非任务确实并非显而易见，否则应与实现代理使用相同层级。**如果用户传入了 `--model`，则这两个步骤都不执行：**实现代理、元评审代理和评审代理都使用这一个层级，并且角色配对绝不能将元评审代理提升至更高层级。

**专用代理：** `sdd` 插件中的常见代理包括：`sdd:developer`、`sdd:researcher`、`sdd:software-architect`、`sdd:tech-lead`、`sdd:business-analyst`。如果合适的专用代理不可用，则回退到无专门能力的通用代理。当任务与专用代理之间不存在直接关联，或代理不可用时，你必须始终使用通用代理！

### 阶段 2：并行分派元评审代理和实现代理

**关键要求**：在一条消息中使用两次 Task 工具调用，同时启动两个代理。元评审代理必须是消息中的第一个工具调用，以便在实现代理修改产物之前观察它们。

两个代理都以前台代理方式运行。等待两者全部完成后，再进入阶段 3。

#### 2.1 元评审代理提示词

元评审代理会生成针对该特定任务量身定制的评估规范（评分量表、检查清单、评分标准）。它将向你返回 YAML 格式的评估规范。

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

使用以下必需组成部分构建实现提示词：

**零样本思维链前缀（必需——必须位于最前面）**

```markdown
## Reasoning Approach

Before taking any action, think through this task systematically.

Let's approach this step by step:

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

**自我审查后缀（必需——必须位于最后）**

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

**分派**

根据任务和可用的智能体确定最佳智能体类型，例如：代码实现 -> `sdd:developer` 智能体。如果不确定，最好使用 `general-purpose` 智能体，而不是分派错误的智能体类型。

```
Use Task tool:
  - description: "Implement: {brief task summary}"
  - prompt: {constructed prompt with CoT + task + self-critique}
  - model: {selected implementation model}
  - subagent_type: "{selected agent type}"
```

#### 2.3 并行分派示例

在一条消息中同时发送两个 Task 工具调用。元评审智能体在前，实现智能体在后：

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

等待两者都返回后，再进入阶段 3。

### 阶段 3：分派评审智能体

元评审智能体和实现智能体均完成后，分派评审智能体。

关键要求：向评审智能体提供元评审智能体生成的评估规范 YAML，必须完全一致，不得跳过或添加任何内容，不得以任何方式修改，也不得缩短或概述其中的任何文本！

**从元评审智能体的输出中提取：**
- 最终的评估规范 YAML

**从实现智能体的输出中提取：**
- 摘要部分（修改的文件、关键变更）
- 修改文件的路径

#### 3.1 分析已有变更部分

分派评审智能体之前，评估代码库中是否存在需要让评审智能体知晓的已有变更。“已有变更”部分可防止评审智能体将之前的修改与当前实现智能体的工作混淆。

**何时包含：**

- 同一会话中较早完成的 do-and-judge 任务运行
- 用户在调用该技能之前手动进行的修改（可从对话上下文或 git 中看到）
- 在此任务之前运行的其他工具或智能体所做的变更

**何时省略：**

- 这是第一个任务，且没有已知的先前变更——完全省略该部分
- 对同一任务进行重试时，不要将实现智能体先前的尝试作为“已有变更”包含在内——这些尝试属于当前任务的迭代周期

**内容准则：**

- 使用高层次摘要：任务描述、受影响的文件/模块列表、变更的一般性质（创建、修改、删除）
- 不要包含代码块、差异或行级详细信息——保持简洁
- 清楚标明来源：“Previous Task: {description}”“User modifications (before current task)”等
- 如果已有变更来自多个来源，请为每个来源使用单独的小节

关键要求：避免读取完整的代码库或 git 历史记录，只需使用高层次的 git diff/status 来确定哪些文件发生了变更，或使用对话上下文来确定是否存在任何已有变更。

### 3.2 使用提示词和规范 YAML 启动 Judge

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

关键：绝不以任何格式提供分数阈值，包括 `threshold_pass` 或任何其他形式。Judge 绝不能知道分数阈值是多少，以免产生偏见！！！

**派发：**

```
Use Task tool:
  - description: "Judge: {brief task summary}"
  - prompt: {judge verification prompt with exact meta-judge specification YAML, and Pre-existing Changes section if applicable}
  - model: {judge model — MUST equal the current implementation model, including after escalation}
  - subagent_type: "sadd:judge"
```

### 阶段 4：解析裁决并迭代

解析 Judge 输出（不要阅读完整报告）：

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

注意：`retries` 仅统计当前周期内的尝试次数。在报告 PASS 后重新进入时，此预算会**重置**（参见[阶段 6 重新进入](#phase-6-final-report)）——即使先前的周期已达到上述限制，用户之后提出的质量投诉也会开启一个全新的周期，并再次获得最多 3 次重试机会。

#### 迭代裁量规则

你的主要任务是在达到目标质量的前提下完成任务。以下两种失败模式同样真实存在：

- 在细枝末节上耗尽重试次数和上下文，导致任务无法按时完成 → **任务失败**；开发者正在等待此结果，并且可能有依赖工作因此受阻，所以实现工作量必须与任务规模相称。
- 报告一个质量确实过差、无法视为已完成的结果 → **这是更严重的失败**。

对每个评审分数应用以下规则：

- **`score < 3.0` → 失败，无条件适用。没有裁量余地。** 根据评审反馈进行重试，直到通过或达到最大重试次数。
- **`3.0 <= score < 4.0` → 裁量区间。** 只有在此区间内，你才可以判定低于 `4.0` 目标的结果可以接受。固定的 `4.0` 目标已将实际下限设为 `3.0`，因此不需要单独设置有界降分保护机制。
- 在此区间内，如果未解决的问题仅为低/中优先级（任何高或严重级别的问题都会完全取消裁量权），并且没有任何问题违反任务的目标要求或造成实质性缺陷（即它们只是吹毛求疵的问题），那么在发起重试之前，你必须先推理判断再次尝试是否值得占用开发者的时间和你的上下文。
- **最多只能进行一次由吹毛求疵问题驱动的重试**，并且该重试计入重试预算。如果重试后仍然只出现吹毛求疵的问题，你必须报告通过（☑️ 已接受），并在最终报告中列出尚未解决的问题。如果重试结果的分数低于 `3.0`，则改为适用无条件失败规则。
- 你必须严格评判，不能宽松放行。在未达到目标时停止，必须是基于不存在真正违反要求的问题而作出的有意决定。如果存在真正的阻塞性问题，且在最大重试次数内无法完成任务，则必须将其上报为失败，绝不能掩饰或敷衍处理。
- **如果 `STRICT_MODE` 为 true，则整条规则禁用**：仅当 `score >= 4.0` 或达到最大重试次数时才停止。`--strict` 不会改变其他任何内容——`4.0` 目标、最大重试限制、`< 3.0` 无条件失败规则以及元评审/评审调度均不受影响。

### 阶段 5：根据反馈重试（如有需要）

#### 重试时的模型升级

在发起任何重试之前，你必须根据[升级规则](#escalation-rule)明确决定层级，并在输出中说明该决定——该规则完整适用。此外，还需遵循以下针对重试的补充依据：

- 此处的**触发条件 (1) 以 `score < 3.0` 为界**（或者问题表明模型误解了任务，而不仅仅是遗漏了细节）。
- 如果失败源于具体且可修复的缺陷，而非能力不足，则**保持当前层级**——对于范围明确、描述精确的问题，使用同层级模型并提供准确反馈，通常能更快解决。
- 如果 `opus` 仍然失败，则根据[错误处理](#error-handling)向用户升级报告。

**重试提示模板：**

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

**报告后重新进入流程：** 已报告的 PASS 并不意味着任务结束。如果用户随后表示结果有误或质量太低，则将其投诉作为反馈重新进入阶段 5——这属于[升级规则](#escalation-rule)的触发条件 (2)，因此将产出者和评估者的模型层级同时提升一级（除非已是 `opus`），然后重试。重试预算将**重置**：即使上一个周期已经用尽其重试次数，该投诉也会开启一个最多包含 3 次重试的新周期。

## 错误处理

### 如果超过最大重试次数

当任务在 3 次重试后仍未通过验证时：

1. **停止** - 不要继续
2. **报告** - 提供失败分析：
   - 原始任务要求
   - 所有评审结论和分数
   - 各次重试中持续存在的问题
3. **升级** - 向用户提供以下选项：
   - 为重试提供更多上下文/指导
   - 使用高一级模型层级重新运行（如果本次运行已使用 `opus`，则此选项不可用）
   - 修改任务要求
   - 中止任务
4. **等待** - 未经用户决定，不得继续

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

### 示例 1：文档更新（首次尝试即通过）

**输入：**

```
/do-and-judge Rewrite the API authentication section in docs/api-reference.md to cover the new OAuth2 flow
```

**执行过程：**

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

### 示例 2：重试并提升模型后通过

**输入：**

```
/do-and-judge Implement rate limiting middleware with configurable limits per endpoint
```

**执行过程：**

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

### 示例 3：需要提升模型的任务

**输入：**

```
/do-and-judge Migrate the database schema to support multi-tenancy
```

**执行过程：**

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

### 示例 4：连续执行 do-and-judge（来自上一个任务的预先存在的更改）

**输入（首次运行）：**

```
/do-and-judge add basic authentication module
```

**执行（首次运行）：**

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

**输入（同一会话中的第二次运行）：**

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

### 示例 5：执行 do-and-judge 前用户已修改代码库

**场景：**

用户在对话期间一直在处理一个电子商务代码库。他们在调用 do-and-judge 之前修改了购物车、商品目录和结账流程。

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

相关规则见[模型选择策略](#model-selection-policy)；以下习惯有助于确保这些规则得到贯彻：

- **明确说明理由** - 在分派任务前，说明范围、复杂度和风险，以及由此确定的层级；这是整个运行过程中影响最大的决策
- **`opus` 必须有充分依据，绝不能作为保险选择** - 所有重叠和难分高下的情况都应按照[选择规则](#selection-rules)中的优先级和决胜规则处理，绝不能凭直觉决定
- **不同角色使用同一层级** - 仅提升标准制定者（元评审）的层级，并且只针对非显而易见的任务（[角色配对](#role-pairing)）
- **根据证据升级** - 某次迭代的层级明显过低，或用户对质量提出投诉（[升级规则](#escalation-rule)）

### 元评审 + 评审验证

- **绝不跳过元评审** - 量身定制的评估标准比通用标准能产生更好的判断
- **重试时复用元评审规范** - 各次重试的评估规范保持不变；只有实现发生变化
- **仅解析评审的标题** - 不要阅读完整报告，以避免上下文污染
- **信任阈值** - 4/5.0 是质量门槛；低于该分数时，由[迭代裁量规则](#iteration-discretion-rule)决定如何处理（除非使用 `--strict`）
- **包含 CLAUDE_PLUGIN_ROOT** - 元评审和评审都需要解析后的插件根路径

### 迭代

- **聚焦修复** - 不要重写所有内容，只修复具体问题
- **逐字传递反馈** - 让实现代理看到问题的准确描述
- **使用相同的元评审规范** - 重试时不要重新运行元评审；评估标准不会改变
- **适当升级** - 不要针对根本性问题无休止地循环
- **保持投入适度** - 根据[迭代裁量规则](#iteration-discretion-rule)，让迭代投入与任务规模相匹配；由细枝末节驱动的重试最多只能进行一次

### 上下文管理

- **保持整洁** - 你负责编排，子代理负责实现
- **总结，不要复制** - 传递摘要，而不是完整的文件内容
- **信任子代理** - 它们可以自行读取文件
- **元评审 YAML** - 只将元评审 YAML 传递给评审，不要向其中添加任何额外文本或注释！
- **跟踪预先存在的变更** - 将先前修改的上下文传递给评审，防止混淆预先存在的变更与当前变更的归属