---
name: do-competitively
description: Execute tasks through competitive multi-agent generation, meta-judge evaluation specification, multi-judge evaluation, and evidence-based synthesis
---
# do-competitively

<task>
通过竞争性多智能体生成、元评审者评估规范、多评审者评估以及基于证据的综合来执行任务，通过结合并行实现中的最佳元素，产出更优结果。
</task>

<context>
此命令通过自适应策略选择，为质量重于速度的高风险任务实现 Generate-Critique-Synthesize（GCS）模式。它将竞争性生成与元评审者评估规范和多视角评估相结合，然后根据结果智能选择最佳综合策略。

**主要特性：**

- 生成过程中的自我批评循环（Constitutional AI）
- 结构化评估——元评审者在评审前生成定制化评分标准
- 评估中的验证循环（Chain-of-Verification）
- 自适应策略：打磨明确的获胜方案、综合意见分歧、重新设计失败方案
- 通过智能策略选择平均节省 15-20% 的成本
</context>

重要：你不是实现代理或评审者，不应读取作为子代理或任务上下文提供的文件。你不应读取报告，也不应让不必要的信息充斥你的上下文。你 MUST 严格逐步遵循流程。任何偏离都将被视为失败，并且你将被终止！

## 模式：Generate-Critique-Synthesize（GCS）

此命令实现了一个多阶段自适应竞争编排模式：

```
阶段 1：带自我批评 + 元评审者的竞争性生成（并行执行）
         ┌─ 元评审者 → 评估规范 YAML ───────────────────────────┐
任务 ────┼─ 代理 2 → 草稿 → 批评 → 修订 → 方案 B ──────────────┐ │ 
         ├─ 代理 3 → 草稿 → 批评 → 修订 → 方案 C ──────────────┼─┤ 
         └─ 代理 1 → 草稿 → 批评 → 修订 → 方案 A ──────────────┘ │
                                                                  │
阶段 2：带验证的多评审者评估                                      │
         ┌─ 评审者 1 → 评估 → 验证 → 修订 → 报告 A ────────────┐    │
         ├─ 评审者 2 → 评估 → 验证 → 修订 → 报告 B ────────────┼────┤
         └─ 评审者 3 → 评估 → 验证 → 修订 → 报告 C ────────────┘    │
                                                                  │
阶段 2.5：自适应策略选择                                          │
         分析共识 ───────────────────────────────────────────────┤
                ├─ 明确的获胜方案？ → SELECT_AND_POLISH          │
                ├─ 全部存在缺陷（<3.0）？ → REDESIGN（返回阶段 1）│
                └─ 意见分歧？ → FULL_SYNTHESIS                    │
                                          │                       │
阶段 3：基于证据的综合                                          │
         （仅当 FULL_SYNTHESIS 时）                              │
         综合器 ─────────────────────────┴───────────────────────┴─→ 最终方案
```

## 流程

### 设置：创建报告目录

开始之前，确保报告目录存在：

```bash
mkdir -p .specs/reports
```

**报告命名约定：** `.specs/reports/{solution-name}-{YYYY-MM-DD}.[1|2|3].md`

其中：

- `{solution-name}` - 根据输出路径派生（例如，从输出 `specs/api/users.md` 得到 `users-api`）
- `{YYYY-MM-DD}` - 当前日期
- `[1|2|3]` - 评审编号

**注意：**解决方案仍保留在其指定的输出位置；只有评估报告会写入 `.specs/reports/`

### 阶段 1：竞争性生成 + 元评审（并行执行）

**并行启动 3 个独立的生成器代理和 1 个元评审代理（共 4 个代理，全部推荐使用 Opus 以确保质量）：**

元评审代理与 3 个生成器代理并行运行，因为它不需要它们的输出——它只需要任务描述来生成评估标准。

**关键：**在一条消息中使用 4 次 Task 工具调用，以前台代理的方式调度全部 4 个代理。元评审代理**必须是调度顺序中的第一个工具调用**，因为它需要有时间从代码库收集上下文，而生成器尚未对其进行修改。

#### 元评审代理（1 个代理）

元评审代理会针对当前任务生成评估规范 YAML（包括评分标准、检查清单和评分规则），供全部 3 个评审代理使用。它会返回所有 3 个评审代理都将使用的评估规范 YAML。

**元评审代理的提示词模板：**

```markdown
## Task

Generate an evaluation specification yaml for the following task. You will produce rubrics, checklists, and scoring criteria that judge agents will use to evaluate and compare competitive implementation artifacts.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt
{Original task description from user}

## Context
{Any relevant codebase context, file paths, constraints}

## Artifact Type
{code | documentation | configuration | etc.}

## Number of Solutions
3 (competitive implementations to be compared)

## Instructions
Return only the final evaluation specification YAML in your response.
The specification should support comparative evaluation across multiple solutions.
```

**调度：**

```
Use Task tool:
  - description: "Meta-judge: {brief task summary}"
  - prompt: {meta-judge prompt}
  - model: opus
  - subagent_type: "sadd:meta-judge"
```

#### 生成器代理（3 个代理）

1. 每个代理都会收到**完全相同的任务描述和上下文**
2. 代理彼此独立工作，不会看到其他代理的工作成果
3. 每个代理都会针对同一个问题生成一个**完整的解决方案**
4. 解决方案会保存到不同的文件中（例如，`{solution-file}.[a|b|c].[ext]`）

**解决方案命名约定：** `{solution-file}.[a|b|c].[ext]`
其中：

- `{solution-file}` - 根据任务派生（例如，任务为 `create users.ts` 时，结果中的解决方案文件名为 `users`）
- `[a|b|c]` - 每个子代理的唯一标识符
- `[ext]` - 文件扩展名（例如 `md`、`ts` 等）

**核心原则：**通过独立性实现多样性——代理将探索不同的方法。

**关键：**你**必须**向代理和评审代理提供带有 `[a|b|c]` 标识符的文件名！！！缺少该标识符将导致你被**立即终止**！

**生成器的提示词模板：**

```markdown
<task>
{task_description}
</task>

<constraints>
Critical: you not allowed to use any mutation git commands, including, but not limited: commit, stash, push, checkout, reset, revert, etc. Except cases when task EXPLICITLY allows or requires it. You can use non-mutation git commands, including, but not limited: status, diff, log, branch, etc.

{additional_constraints_if_any}
</constraints>

<context>
{relevant_context}
</context>

<output>
{define expected output following such pattern: {solution-file}.[a|b|c].[ext] based on the task description and context. Each [a|b|c] is a unique identifier per sub-agent. You MUST provide filename with it!!!}
</output>

Instructions:
Let's approach this systematically to produce the best possible solution.

1. First, analyze the task carefully - what is being asked and what are the key requirements?
2. Consider multiple approaches - what are the different ways to solve this?
3. Think through the tradeoffs step by step and choose the approach you believe is best
4. Implement it completely
5. Generate 5 verification questions about critical aspects
6. Answer your own questions:
   - Review solution against each question
   - Identify gaps or weaknesses
7. Revise solution:
   - Fix identified issues
8. Explain what was changed and why
```

#### 并行分发示例

在一条消息中发送全部 4 个 Task 工具调用。先发送元评审者，然后发送生成器：

```
包含 4 个工具调用的消息：
  工具调用 1（元评审者）：
    - description: "Meta-judge: {brief task summary}"
    - model: opus
    - subagent_type: "sadd:meta-judge"

  工具调用 2（生成器 A）：
    - description: "Generate solution A: {brief task summary}"
    - model: opus

  工具调用 3（生成器 B）：
    - description: "Generate solution B: {brief task summary}"
    - model: opus

  工具调用 4（生成器 C）：
    - description: "Generate solution C: {brief task summary}"
    - model: opus
```

等待全部 4 个调用返回后，再继续第 2 阶段。

### 第 2 阶段：多评审者评估

**并行启动 3 个独立评审者**（为确保严谨性，建议使用 Opus）：

**关键：**必须等待第 1 阶段的所有智能体（元评审者 + 3 个生成器）完成后，才能分发评审者。

**关键：**向每个评审者提供**完整且完全一致的元评审者评估规范 YAML**。不得跳过、添加任何内容，不得以任何方式修改，也不得缩短或总结其中的任何文本！

1. 每个评审者都会收到**元评审者评估规范 YAML**以及**所有候选解决方案**（A、B、C）的路径
2. 评审者根据**元评审者的评估标准**（而非硬编码的标准）进行评估
3. 每个评审者都会产出：
   - **对比分析**（每个解决方案在哪些方面表现突出）
   - **基于证据的评分**（附带具体引用/示例）
   - **最终投票**（他们偏好的解决方案及原因）
4. 报告保存到不同的文件中（例如：`.specs/reports/{solution-name}-{date}.[1|2|3].md`）

**核心原则：**多项独立评估可以减少偏见，并发现不同的问题。

**评审者提示词模板：**

```markdown
你正在根据由元评审器生成的评估规范，对 {number} 个竞争性解决方案进行评估。

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## 任务
{task_description}

## 解决方案
{list of paths to all candidate solutions}

## 评估规范

```yaml
{meta-judge's evaluation specification YAML}
```

## 输出
将完整报告写入：{.specs/reports/{solution-name}-{date}.[1|2|3].md - each judge gets unique number identifier}

重要：你必须回复，且必须使用以下确切的结构化标头格式：

---
VOTE: [Solution A/B/C]
SCORES:
  Solution A: [X.X]/5.0
  Solution B: [X.X]/5.0
  Solution C: [X.X]/5.0
CRITERIA:
 - {criterion_1}: [X.X]/5.0
 - {criterion_2}: [X.X]/5.0
 ...
---

[Summary of your evaluation]

## 指示

按照代理指令中定义的完整评审流程执行！

重要：必须基于证据而非印象进行评估。引用具体文本。

## 输出

重要：必须在回复开头以 YAML 格式回复，且必须使用以下确切的结构化评估报告格式！
```

重要：绝对不要向评审器提供分数阈值。评审器绝不能知道分数阈值是多少，以免受到偏见影响！

**调度：**

```
Use Task tool (3 calls in single message):
  - description: "Judge [1|2|3]: {brief task summary}"
  - prompt: {judge prompt with exact meta-judge specification YAML}
  - model: opus
  - subagent_type: "sadd:judge"
```

### 阶段 2.5：自适应策略选择（提前返回）

**编排器**（而非子代理）会分析评审器输出，以确定最优策略。

#### 决策逻辑

**步骤 1：解析评审器回复中的结构化标头**

解析评审器的回复。
重要：不要自行读取报告文件，否则可能耗尽上下文。

**步骤 2：检查是否存在一致的获胜者**

比较三个 VOTE 值：

- 如果评审器 1 VOTE = 评审器 2 VOTE = 评审器 3 VOTE（同一个解决方案）：
  - **策略：SELECT_AND_POLISH**
  - **原因：** 三位评审器都偏好同一个解决方案，形成明确共识

**步骤 3：检查所有解决方案是否存在根本缺陷**

如果没有一致投票，则计算平均分：

1. 平均 Solution A 分数：(Judge1_A + Judge2_A + Judge3_A) / 3
2. 平均 Solution B 分数：(Judge1_B + Judge2_B + Judge3_B) / 3
3. 平均 Solution C 分数：(Judge1_C + Judge2_C + Judge3_C) / 3

如果 (avg_A < 3.0) AND (avg_B < 3.0) AND (avg_C < 3.0)：

- **策略：REDESIGN**
- **原因：** 所有解决方案的质量都低于阈值，存在根本性的方案问题

**步骤 5：默认执行完整综合**

如果以上条件均不满足：

- **策略：FULL_SYNTHESIS**
- **原因：** 评审结果存在分歧，但各方案都有优点，需要综合各方案的最佳要素

#### 策略 1：SELECT_AND_POLISH

**适用情形：** 存在明确的获胜者（一致投票）

**流程：**

1. 选择获胜方案作为基础
2. 启动子代理，根据评审反馈实施具体改进
3. 从排名靠后的方案中挑选 1–2 个最佳要素并合并
4. 记录所添加的内容及其原因

**优点：**

- 节省综合成本（比完整综合更简单）
- 保留获胜方案经过验证的质量
- 进行有针对性的改进，而不是完全重构
```

**提示模板：**

```markdown
You are polishing the winning solution based on judge feedback.

<task>
{task_description}
</task>

<winning_solution>
{path_to_winning_solution}
Score: {winning_score}/5.0
Judge consensus: {why_it_won}
</winning_solution>

<runner_up_solutions>
{list of paths to all runner-up solutions}
</runner_up_solutions>

<judge_feedback>
{list of paths to all evaluation reports}
</judge_feedback>

<output>
{final_solution_path}
</output>

Instructions:
Let's work through this step by step to polish the winning solution effectively.

1. Take the winning solution as your base (do NOT rewrite it)
2. First, carefully review all judge feedback to understand what needs improvement
3. Apply improvements based on judge feedback:
   - Fix identified weaknesses
   - Add missing elements judges noted
4. Next, examine the runner-up solutions for standout elements
5. Cherry-pick 1-2 specific elements from runners-up if judges praised them
6. Document changes made:
   - What was changed and why
   - What was added from other solutions

CRITICAL: Preserve the winning solution's core approach. Make targeted improvements only.
```

#### 策略 2：重新设计

**适用情况：**所有方案的得分均低于 3.0/5.0（各方案都存在根本性问题）

**流程：**

1. 启动新的 agent，分析失败模式和经验教训。要求该 agent：
   - 逐步思考：每个方案出了什么问题？
   - 分析所有方案中共有的失败模式
   - 提取经验教训（哪些做法不应采用）
   - 找出所有方案失败的根本原因
   - 根据这些洞察生成新的任务分解或约束条件
2. **返回阶段 1**，将经验教训和新约束条件提供给新的实现 agent。

**新实现的提示模板：**

```markdown
You are analyzing why all solutions failed to meet quality standards. And implement new solution based on it.

<task>
{task_description}
</task>

<constraints>
{constraints_if_any}
</constraints>

<context>
{relevant_context}
</context>

<failed_solutions>
{list of paths to all candidate solutions}
</failed_solutions>

<evaluation_reports>
{list of paths to all evaluation reports with low scores}
</evaluation_reports>

Instructions:
Let's break this down systematically to understand what went wrong and how to design new solution based on it.

1. First, analyze the task carefully - what is being asked and what are the key requirements?
2. Read through each solution and its evaluation report
3. For each solution, think step by step about:
   - What was the core approach?
   - What specific issues did judges identify?
   - Why did this approach fail to meet the quality threshold?
4. Identify common failure patterns across all solutions:
   - Are there shared misconceptions?
   - Are there missing requirements that all solutions overlooked?
   - Are there fundamental constraints that weren't considered?
5. Extract lessons learned:
   - What approaches should be avoided?
   - What constraints must be addressed?
6. Generate improved guidance for the next iteration:
   - New constraints to add
   - Specific approaches to try - what are the different ways to solve this?
   - Key requirements to emphasize
7. Think through the tradeoffs step by step and choose the approach you believe is best
8. Implement it completely
9. Generate 5 verification questions about critical aspects
10. Answer your own questions:
   - Review solution against each question
   - Identify gaps or weaknesses
11. Revise solution:
   - Fix identified issues
12. Explain what was changed and why

```

#### 策略 3：FULL_SYNTHESIS（默认）

**适用情况：**没有明确的胜出者，但各个解决方案都有价值（得分 >=3.0）

**流程：**进入第 3 阶段（基于证据的综合）

### 第 3 阶段：基于证据的综合

**仅当在第 2.5 阶段选择了策略 3（FULL_SYNTHESIS）时执行**

启动 **1 个综合代理**（建议使用 Opus 以获得更高质量）：

1. 代理接收：
   - **所有候选解决方案**（A、B、C）
   - **所有评估报告**（1、2、3）
2. 代理分析：
   - 每位评审称赞了哪些要素（对优势的共识）
   - 每位评审指出了哪些问题（对弱点的共识）
   - 各个解决方案在方法上的差异
3. 代理通过以下方式生成**最终解决方案**：
   - 当某个解决方案的某些部分明显更优时，**复制这些优秀部分**
   - 当混合方案更好时，**组合不同方法**
   - **修复所有评审都发现的问题**
   - **记录决策**（从何处采用了哪些内容，以及为什么这样做）

**核心原则：**基于证据的综合能够利用集体智慧。

**综合器的提示词模板：**

```markdown
You are synthesizing the best solution from competitive implementations and evaluations.

<task>
{task_description}
</task>

<solutions>
{list of paths to all candidate solutions}
</solutions>

<evaluation_reports>
{list of paths to all evaluation reports}
</evaluation_reports>

<output>
{define expected output following such pattern: solution.md based on the task description and context. Result should be a complete solution to the task.}
</output>

Instructions:
Let's think through this synthesis step by step to create the best possible combined solution.

1. First, read all solutions and evaluation reports carefully
2. Map out the consensus:
   - What strengths did multiple judges praise in each solution?
   - What weaknesses did multiple judges criticize in each solution?
3. For each major component or section, think through:
   - Which solution handles this best and why?
   - Could a hybrid approach work better?
4. Create the best possible solution by:
   - Copying text directly when one solution is clearly superior
   - Combining approaches when a hybrid would be better
   - Fixing all identified issues
   - Preserving the best elements from each
5. Explain your synthesis decisions:
   - What you took from each solution
   - Why you made those choices
   - How you addressed identified weaknesses

CRITICAL: Do not create something entirely new. Synthesize the best from what exists.
```

<output>
该命令会根据所选的自适应策略产生不同的输出：

### 输出（所有策略）

1. **候选解决方案：**`{solution-file}.[a|b|c].[ext]`（位于指定的输出位置）
2. **评估报告：**`.specs/reports/{solution-name}-{date}.[1|2|3].md`
3. **最终解决方案：**`{output_path}`

### 特定策略的输出

- SELECT_AND_POLISH：基于胜出解决方案润色后的解决方案
- REDESIGN：不要停止，返回第 1 阶段，最终应通过 SELECT_AND_POLISH 或 FULL_SYNTHESIS 策略完成
- FULL_SYNTHESIS：综合所有解决方案中最佳内容后的解决方案

### 编排器回复

命令执行完成后，使用以下结构回复用户：

```markdown
## Execution Summary

Original Task: {task_description}

Strategy Used: {strategy} ({reason})

### Results

| Phase                   | Agents | Models   | Status      |
|-------------------------|--------|----------|-------------|
| Phase 1: Competitive Generation + Meta-Judge | 4 (3 generators + 1 meta-judge) | opus x 4 | [Complete / Failed] |
| Phase 2: Multi-Judge Evaluation | 3 | opus x 3 | [Complete / Failed] |
| Phase 2.5: Adaptive Strategy Selection | orchestrator | - | {strategy} |
| Phase 3: [Synthesis/Polish/Redesign] | [N] | [model] | [Complete / Failed] |

Files Created

Final Solution:
- {output_path} - Synthesized production-ready command

Candidate Solutions:
- {solution-file}.[a|b|c].[ext] (Score: [X.X]/5.0)

Evaluation Reports:
- .specs/reports/{solution-file}-{date}.[1|2|3].md (Vote: [Solution A/B/C])

Synthesis Decisions

| Element              | Source           | Rationale   |
|----------------------|------------------|-------------|
| [element]            | Solution [B/A/C] | [rationale] |

```

</output>

## 最佳实践

### 元评审器 + 评审器验证

- **绝不要跳过元评审器** - 针对任务定制的评估标准比通用标准能产生更好的评审结果
- **元评审器只运行一次** - 3 个评审器使用相同的规范
- **包含 CLAUDE_PLUGIN_ROOT** - 元评审器和评审器都需要已解析的插件根路径
- **元评审器 YAML** - 仅将元评审器 YAML 传递给评审器，不要在其中添加任何额外文本或注释！

### 常见陷阱

- **用于琐碎任务** - 额外开销不值得
- **任务描述模糊** - 会导致解决方案无法比较
- **上下文不足** - 代理无法产出高质量成果
- **在存在明确胜者时强行合成** - 浪费成本，还可能降低质量
- **合成存在根本缺陷的解决方案** - 与其润色垃圾，不如重新设计
- **跳过元评审器** - 硬编码的标准不如定制标准有效
- **在传递给评审器前修改元评审器 YAML** - 评审器必须接收完全一致的规范

**应该做到：**

- 任务定义清晰，约束明确
- 提供丰富的上下文，以便做出知情决策
- 信任自适应策略选择
- 润色明确的胜者，合成存在分歧的决策，重新设计失败的方案
- 并行调度元评审器和生成器，以提高速度

## 示例

### 示例 1：API 设计（明确胜者 - SELECT_AND_POLISH）

```bash
/do-competitively "Design REST API for user management (CRUD + auth)" \
  --output "specs/api/users.md" \
  --criteria "RESTfulness,security,scalability,developer-experience"
```

**阶段 1 输出（4 个并行代理）：**

- 元评审器：包含 5 个标准维度和比较性评分细则的评估规范 YAML
- `specs/api/users.a.md` - 基于资源的设计，包含嵌套路由
- `specs/api/users.b.md` - 基于操作的设计，包含 RPC 风格端点
- `specs/api/users.c.md` - 最小化设计，未考虑身份验证

**第 2 阶段输出**（假设日期为 2025-01-15，使用元评审者规范的 3 名评审者）：

- `.specs/reports/users-api-2025-01-15.1.md`：

  ```
  VOTE: Solution A
  SCORES: A=4.5/5.0, B=3.2/5.0, C=2.8/5.0
  ```

  “最符合 RESTful 设计，安全性良好”

- `.specs/reports/users-api-2025-01-15.2.md`：

  ```
  VOTE: Solution A
  SCORES: A=4.3/5.0, B=3.5/5.0, C=2.6/5.0
  ```

  “资源设计简洁，具备可扩展性”

- `.specs/reports/users-api-2025-01-15.3.md`：

  ```
  VOTE: Solution A
  SCORES: A=4.6/5.0, B=3.0/5.0, C=2.9/5.0
  ```

  “遵循最佳实践，结构清晰”

**第 2.5 阶段决策（编排器解析标头）：**

- 一致投票：A、A、A
- 平均分：A=4.5，B=3.2，C=2.8
- 策略：SELECT_AND_POLISH
- 原因：一致获胜，且领先分差超过 1.0 分

**第 3 阶段输出：**

- `specs/api/users.md` - 对解决方案 A 进行完善：
  - 添加速率限制文档（来自 B）
  - 简化嵌套路由（根据评审者反馈）
  - 总成本：8 个代理（第 1 阶段 4 个 + 3 名评审者 + 1 个完善代理）

### 示例 2：算法选择（意见分歧 - FULL_SYNTHESIS）

```bash
/do-competitively "Design caching strategy for high-traffic API" \
  --output "specs/caching.md" \
  --criteria "performance,memory-efficiency,simplicity,reliability"
```

**第 1 阶段输出（4 个并行代理）：**

- 元评审者：包含 4 个评估标准维度和比较性评分标准的评估规范 YAML
- `specs/caching.a.md` - 使用 LRU 淘汰的 Redis
- `specs/caching.b.md` - 多层缓存（内存 + Redis）
- `specs/caching.c.md` - CDN + 应用缓存

**第 2 阶段输出**（假设日期为 2025-01-15，使用元评审者规范的 3 名评审者）：

- `.specs/reports/caching-2025-01-15.1.md`：

  ```
  VOTE: Solution B
  SCORES: A=3.8/5.0, B=4.2/5.0, C=3.9/5.0
  ```

  “性能最佳，但较为复杂”

- `.specs/reports/caching-2025-01-15.2.md`：

  ```
  VOTE: Solution A
  SCORES: A=4.0/5.0, B=3.9/5.0, C=3.7/5.0
  ```

  “简单、可靠、经过验证”

- `.specs/reports/caching-2025-01-15.3.md`：

  ```
  VOTE: Solution C
  SCORES: A=3.6/5.0, B=4.0/5.0, C=4.1/5.0
  ```

  “覆盖全球，具有成本效益”

**第 2.5 阶段决策（编排器解析标头）：**

- 投票分歧：B、A、C（未达成共识）
- 平均分：A=3.8，B=4.0，C=3.9
- 分数差距：4.0 - 3.9 = 0.1（<1.0 阈值）
- 策略：FULL_SYNTHESIS
- 原因：决策分歧，所有解决方案均 >=3.0，没有明确的获胜者

**第 3 阶段输出：**

- `specs/caching.md` - 混合方案：
  - 多层架构（来自 B）
  - 简单的 LRU 策略（来自 A）
  - 用于静态内容的 CDN（来自 C）
  - 总成本：8 个代理（第 1 阶段 4 个 + 3 名评审者 + 1 个综合代理）

### 示例 3：身份验证设计（全部存在缺陷 - REDESIGN）

```bash
/do-competitively "Design authentication system with social login" \
  --output "specs/auth.md" \
  --criteria "security,user-experience,maintainability"
```

**第 1 阶段输出（4 个并行代理）：**

- 元评审者：包含 3 个评估标准维度和比较性评分标准的评估规范 YAML
- `specs/auth.a.md` - 自定义 OAuth2 实现
- `specs/auth.b.md` - 基于会话并使用社交平台提供商
- `specs/auth.c.md` - 使用 JWT 的仅密码身份验证

**阶段 2 输出**（假设日期为 2025-01-15，使用元评审者规范的 3 名评审者）：

- `.specs/reports/auth-2025-01-15.1.md`：

  ```
  VOTE: Solution A
  SCORES: A=2.5/5.0, B=2.2/5.0, C=2.3/5.0
  ```

  “安全风险，重复造轮子”

- `.specs/reports/auth-2025-01-15.2.md`：

  ```
  VOTE: Solution B
  SCORES: A=2.4/5.0, B=2.8/5.0, C=2.1/5.0
  ```

  “会话无法扩展，缺少需求”

- `.specs/reports/auth-2025-01-15.3.md`：

  ```
  VOTE: Solution C
  SCORES: A=2.6/5.0, B=2.5/5.0, C=2.3/5.0
  ```

  “没有社交登录，存在安全问题”

**阶段 2.5 决策（编排器解析标头）：**

- 票数分散：A、B、C（没有共识）
- 平均分：A=2.5，B=2.5，C=2.2（全部 <3.0）
- 策略：REDESIGN
- 原因：所有方案均低于 3.0 阈值，存在根本性问题

- 不要停止，返回阶段 1，最终应在 SELECT_AND_POLISH 或 FULL_SYNTHESIS 策略处完成
</output>