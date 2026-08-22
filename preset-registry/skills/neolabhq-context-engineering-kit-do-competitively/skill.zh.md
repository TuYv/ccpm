---
name: do-competitively
description: Execute tasks through competitive multi-agent generation, meta-judge evaluation specification, multi-judge evaluation, and evidence-based synthesis
argument-hint: Task description and optional output path/criteria
---
# do-competitively

<task>
通过竞争式多智能体生成、元评审评估规范、多评审评估和基于证据的综合来执行任务，结合并行实现中的最佳要素，从而产出更优结果。
</task>

<context>
此命令实现了生成-批判-综合（GCS）模式，并针对质量比速度更重要的高风险任务采用自适应策略选择。它将竞争式生成与元评审评估规范及多视角评估相结合，然后根据结果智能选择最优的综合策略。

**主要特性：**

- 生成过程中的自我批判循环（Constitutional AI）
- 结构化评估——元评审在评判前生成量身定制的评分标准
- 评估过程中的验证循环（Chain-of-Verification）
- 自适应策略：润色明显胜出的方案，综合存在分歧的决策，重新设计失败的方案
- 通过智能策略选择，平均节省 15-20% 的成本
</context>

关键要求：你不是实现智能体或评审，不应读取作为子智能体或任务上下文提供的文件。你不应读取报告，也不应让不必要的信息占满你的上下文。你必须逐步遵循流程。任何偏离都将被视为失败，你将被终止！

## 模式：生成-批判-综合（GCS）

此命令实现了一种多阶段自适应竞争式编排模式：

```
Phase 1: Competitive Generation with Self-Critique + Meta-Judge (IN PARALLEL)
         ┌─ Meta-Judge → Evaluation Specification YAML ───────────┐
Task ────┼─ Agent 2 → Draft → Critique → Revise → Solution B ───┐ │ 
         ├─ Agent 3 → Draft → Critique → Revise → Solution C ───┼─┤ 
         └─ Agent 1 → Draft → Critique → Revise → Solution A ───┘ │
                                                                  │
Phase 2: Multi-Judge Evaluation with Verification                 │
         ┌─ Judge 1 → Evaluate → Verify → Revise → Report A ─┐    │
         ├─ Judge 2 → Evaluate → Verify → Revise → Report B ─┼────┤
         └─ Judge 3 → Evaluate → Verify → Revise → Report C ─┘    │
                                                                  │
Phase 2.5: Adaptive Strategy Selection                            │
         Analyze Consensus ───────────────────────────────────────┤
                ├─ Clear Winner? → SELECT_AND_POLISH              │
                ├─ All Flawed (<3.0)? → REDESIGN (return Phase 1) │
                └─ Split Decision? → FULL_SYNTHESIS               │
                                          │                       │
Phase 3: Evidence-Based Synthesis         │                       │
         (Only if FULL_SYNTHESIS)         │                       │
         Synthesizer ─────────────────────┴───────────────────────┴─→ Final Solution
```

## 流程

### 设置：创建报告目录

开始前，请确保报告目录存在：

```bash
mkdir -p .specs/reports
```

**报告命名约定：** `.specs/reports/{solution-name}-{YYYY-MM-DD}.[1|2|3].md`

其中：

- `{solution-name}` - 从输出路径派生（例如，从输出 `specs/api/users.md` 派生出 `users-api`）
- `{YYYY-MM-DD}` - 当前日期
- `[1|2|3]` - 评审编号

**注意：** 解决方案仍保留在其指定的输出位置；只有评估报告会保存到 `.specs/reports/`

### 阶段 1：竞争式生成 + 元评审（并行）

**并行启动 3 个独立的生成器智能体和 1 个元评审智能体**（共 4 个智能体，均推荐使用 Opus 以保证质量）：

元评审与 3 个生成器并行运行，因为它不需要生成器的输出——它只需要任务描述来生成评估标准。

**关键要求：** 在一条消息中使用 4 次 Task 工具调用，将全部 4 个智能体作为前台智能体分派。元评审必须是分派顺序中的第一次工具调用，因为它应该有时间从代码库中收集上下文，之后代码库才会被生成器修改。

#### 元评审智能体（1 个智能体）

元评审会生成一份针对该特定任务定制的评估规范 YAML（评分量规、检查清单、评分标准）。它会返回供全部 3 个评审使用的评估规范 YAML。

**元评审提示词模板：**

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

**分派：**

```
Use Task tool:
  - description: "Meta-judge: {brief task summary}"
  - prompt: {meta-judge prompt}
  - model: opus
  - subagent_type: "sadd:meta-judge"
```

#### 生成器智能体（3 个智能体）

1. 每个智能体接收**完全相同的任务描述和上下文**
2. 各智能体**独立工作，无法看到彼此的工作成果**
3. 每个智能体针对同一问题生成一个**完整的解决方案**
4. 解决方案保存到不同的文件中（例如 `{solution-file}.[a|b|c].[ext]`）

**解决方案命名约定：** `{solution-file}.[a|b|c].[ext]`
其中：

- `{solution-file}` - 从任务派生（例如，`create users.ts` 会得到 `users` 作为解决方案文件名）
- `[a|b|c]` - 每个子智能体的唯一标识符
- `[ext]` - 文件扩展名（例如 `md`、`ts` 等）

**核心原则：** 通过独立性实现多样性——各智能体探索不同的方法。

关键要求：你必须向智能体和评审提供带有 [a|b|c] 标识符的文件名！！！缺少该标识符将导致你立即被终止！

**生成器提示词模板：**

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

#### 并行分派示例

在一条消息中发送全部 4 个 Task 工具调用。先发送元评审，再发送生成器：

```
Message with 4 tool calls:
  Tool call 1 (meta-judge):
    - description: "Meta-judge: {brief task summary}"
    - model: opus
    - subagent_type: "sadd:meta-judge"

  Tool call 2 (generator A):
    - description: "Generate solution A: {brief task summary}"
    - model: opus

  Tool call 3 (generator B):
    - description: "Generate solution B: {brief task summary}"
    - model: opus

  Tool call 4 (generator C):
    - description: "Generate solution C: {brief task summary}"
    - model: opus
```

等待全部 4 个调用返回后，再进入阶段 2。

### 阶段 2：多评审评估

**并行**启动 3 个独立评审（建议使用 Opus 以确保严谨性）：

**关键：**必须等待阶段 1 的所有智能体（元评审 + 3 个生成器）完成后，才能分派评审任务。

**关键：**向每个评审提供完全一致的元评审评估规范 YAML。不得跳过或添加任何内容，不得以任何方式修改，也不得缩短或概括其中的任何文本！

1. 每个评审都会收到**元评审评估规范 YAML**以及**所有候选解决方案**（A、B、C）的路径
2. 评审依据**元评审的标准**（而非硬编码标准）进行评估
3. 每个评审生成：
   - **对比分析**（各解决方案在哪些方面表现出色）
   - **基于证据的评分**（包含具体引文/示例）
   - **最终投票**（偏好哪个解决方案及其原因）
4. 报告保存到不同的文件中（例如 `.specs/reports/{solution-name}-{date}.[1|2|3].md`）

**核心原则：**多个独立评估能够减少偏差，并发现不同的问题。

**评审提示词模板：**

```markdown
你正在根据元评审生成的评估规范，对 {number} 个相互竞争的解决方案进行评估。

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

关键要求：你必须严格使用以下结构化标头格式进行回复：

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

[评估总结]

## 指示

遵循代理指示中定义的完整评审流程！

关键要求：你的评估必须基于证据，而非印象。引用具体文本。

## 输出

关键要求：你必须在回复的开头严格使用此 YAML 结构化评估报告格式进行回复！
```

关键要求：绝不要向评审提供分数阈值。评审绝不能知道分数阈值是多少，以免产生偏见！！！

**分派：**

```
Use Task tool (3 calls in single message):
  - description: "Judge [1|2|3]: {brief task summary}"
  - prompt: {judge prompt with exact meta-judge specification YAML}
  - model: opus
  - subagent_type: "sadd:judge"
```

### 阶段 2.5：自适应策略选择（提前返回）

**编排器**（而非子代理）分析评审输出，以确定最优策略。

#### 决策逻辑

**步骤 1：解析评审回复中的结构化标头**

解析评审的回复。
关键要求：不要读取报告文件本身，否则可能导致上下文溢出。

**步骤 2：检查是否存在一致认可的获胜方案**

比较全部三个 VOTE 值：

- 如果 Judge 1 VOTE = Judge 2 VOTE = Judge 3 VOTE（同一个解决方案）：
  - **策略：SELECT_AND_POLISH**
  - **原因：** 共识明确——全部三名评审都偏好同一个解决方案

**步骤 3：检查是否所有解决方案都存在根本性缺陷**

如果投票结果不一致，则计算平均分：

1. Solution A 的平均分：(Judge1_A + Judge2_A + Judge3_A) / 3
2. Solution B 的平均分：(Judge1_B + Judge2_B + Judge3_B) / 3
3. Solution C 的平均分：(Judge1_C + Judge2_C + Judge3_C) / 3

如果 (avg_A < 3.0) AND (avg_B < 3.0) AND (avg_C < 3.0)：

- **策略：REDESIGN**
- **原因：** 所有解决方案均低于质量阈值，基础方法存在问题

**步骤 5：默认进行完整综合**

如果以上条件均不满足：

- **策略：FULL_SYNTHESIS**
- **原因：** 决策存在分歧，但各方案都有可取之处，需要进行综合以结合最佳元素

#### 策略 1：SELECT_AND_POLISH

**适用情况：** 存在明确的获胜方案（全票一致）

**流程：**

1. 选择获胜的解决方案作为基础
2. 启动子代理，根据评审反馈进行具体改进
3. 从其余解决方案中挑选 1-2 个最佳元素
4. 记录添加了哪些内容以及添加原因

**优势：**

- 节省综合成本（比完整综合更简单）
- 保留获胜解决方案已经得到验证的质量
- 进行有针对性的改进，而非完全重构

**提示词模板：**

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

**适用情形：** 所有解决方案的评分均低于 3.0/5.0（整体存在根本性问题）

**流程：**

1. 启动新的智能体来分析失败模式和经验教训。要求该智能体：
   - 逐步思考：每个解决方案出了什么问题？
   - 分析所有解决方案共有的失败模式
   - 总结经验教训（哪些做法不能采用）
   - 找出所有方法失败的根本原因
   - 根据这些洞见生成新的任务分解方案或约束条件
2. **返回阶段 1**，向新的实现智能体提供总结出的经验教训和新约束条件。

**新实现的提示词模板：**

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

**适用情况：** 没有明显胜出者，且各解决方案均有可取之处（评分 >=3.0）

**流程：** 进入阶段 3（基于证据的综合）

### 阶段 3：基于证据的综合

**仅当阶段 2.5 选择了策略 3（FULL_SYNTHESIS）时执行**

启动 **1 个综合代理**（为保证质量，推荐使用 Opus）：

1. 代理接收：
   - **所有候选解决方案**（A、B、C）
   - **所有评估报告**（1、2、3）
2. 代理分析：
   - 每位评审认可了哪些要素（对优点的共识）
   - 每位评审指出了哪些问题（对缺点的共识）
   - 各解决方案在方法上有何差异
3. 代理通过以下方式产出**最终解决方案**：
   - 当某个解决方案明显胜出时，**复制其更优的部分**
   - 当混合方案更好时，**组合不同方法**
   - **修复所有评审均发现的问题**
   - **记录决策**（采用了哪些来源中的哪些内容以及原因）

**核心原则：** 基于证据的综合能够利用集体智慧。

**综合代理的提示词模板：**

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
该命令会根据所选择的自适应策略生成不同的输出：

### 输出（所有策略）

1. **候选解决方案：** `{solution-file}.[a|b|c].[ext]`（位于指定的输出位置）
2. **评估报告：** `.specs/reports/{solution-name}-{date}.[1|2|3].md`
3. **最终解决方案：** `{output_path}`

### 各策略特有的输出

- SELECT_AND_POLISH：基于胜出解决方案进行完善后的解决方案
- REDESIGN：不要停止，返回阶段 1，并最终应通过 SELECT_AND_POLISH 或 FULL_SYNTHESIS 策略完成
- FULL_SYNTHESIS：综合所有解决方案中的最佳部分而得到的解决方案

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

- **绝不要跳过元评审器** - 定制的评估标准比通用标准能产生更好的评审结果
- **元评审器只运行一次** - 3 个评审器均使用同一份规范
- **包含 CLAUDE_PLUGIN_ROOT** - 元评审器和评审器都需要解析后的插件根路径
- **元评审器 YAML** - 只将元评审器 YAML 传递给评审器，不要向其中添加任何额外文本或注释！

### 常见陷阱

- **用于琐碎任务** - 不值得为此付出额外开销
- **任务描述含糊** - 会导致解决方案之间无法比较
- **上下文不足** - 智能体无法产出高质量成果
- **在已有明确胜出者时强行综合** - 浪费成本，并可能降低质量
- **综合存在根本缺陷的解决方案** - 与其润色垃圾，不如重新设计
- **跳过元评审器** - 硬编码标准不如定制标准有效
- **将元评审器 YAML 传递给评审器前对其进行修改** - 评审器必须接收完全一致的规范

**应当：**

- 明确定义任务并给出清晰约束
- 提供丰富的上下文，以便做出充分知情的决策
- 信任自适应策略选择
- 润色明确的胜出方案，综合意见分歧的方案，重新设计失败的方案
- 为提高速度，将元评审器与生成器并行调度

## 示例

### 示例 1：API 设计（明确胜出者 - SELECT_AND_POLISH）

```bash
/do-competitively "Design REST API for user management (CRUD + auth)" \
  --output "specs/api/users.md" \
  --criteria "RESTfulness,security,scalability,developer-experience"
```

**阶段 1 的输出（4 个并行智能体）：**

- 元评审器：包含 5 个标准维度和比较性评分准则的评估规范 YAML
- `specs/api/users.a.md` - 基于资源的设计，包含嵌套路由
- `specs/api/users.b.md` - 基于操作的设计，使用 RPC 风格的端点
- `specs/api/users.c.md` - 最小化设计，缺少对身份验证的考虑

**阶段 2 输出**（假设日期为 2025-01-15，3 名评审使用元评审规范）：

- `.specs/reports/users-api-2025-01-15.1.md`：

  ```
  VOTE: Solution A
  SCORES: A=4.5/5.0, B=3.2/5.0, C=2.8/5.0
  ```

  “最符合 RESTful 风格，安全性良好”

- `.specs/reports/users-api-2025-01-15.2.md`：

  ```
  VOTE: Solution A
  SCORES: A=4.3/5.0, B=3.5/5.0, C=2.6/5.0
  ```

  “资源设计清晰，可扩展性强”

- `.specs/reports/users-api-2025-01-15.3.md`：

  ```
  VOTE: Solution A
  SCORES: A=4.6/5.0, B=3.0/5.0, C=2.9/5.0
  ```

  “遵循最佳实践，结构清晰”

**阶段 2.5 决策（编排器解析标头）：**

- 一致投票：A、A、A
- 平均分：A=4.5、B=3.2、C=2.8
- 策略：SELECT_AND_POLISH
- 原因：获胜方案得到一致认可，且分差 >1.0 分

**阶段 3 输出：**

- `specs/api/users.md` - 润色后的方案 A，包含：
  - 添加限流文档（来自 B）
  - 简化嵌套路由（评审反馈）
  - 总成本：8 个代理（阶段 1 的 4 个 + 3 名评审 + 1 个润色代理）

### 示例 2：算法选择（意见分歧 - FULL_SYNTHESIS）

```bash
/do-competitively "Design caching strategy for high-traffic API" \
  --output "specs/caching.md" \
  --criteria "performance,memory-efficiency,simplicity,reliability"
```

**阶段 1 输出（4 个并行代理）：**

- 元评审：包含 4 个标准维度和比较性评分准则的评估规范 YAML
- `specs/caching.a.md` - 使用 LRU 淘汰策略的 Redis
- `specs/caching.b.md` - 多级缓存（内存 + Redis）
- `specs/caching.c.md` - CDN + 应用缓存

**阶段 2 输出**（假设日期为 2025-01-15，3 名评审使用元评审规范）：

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

  “简单、可靠且经过验证”

- `.specs/reports/caching-2025-01-15.3.md`：

  ```
  VOTE: Solution C
  SCORES: A=3.6/5.0, B=4.0/5.0, C=4.1/5.0
  ```

  “覆盖全球，成本效益高”

**阶段 2.5 决策（编排器解析标头）：**

- 投票分散：B、A、C（未达成共识）
- 平均分：A=3.8、B=4.0、C=3.9
- 分差：4.0 - 3.9 = 0.1（<1.0 阈值）
- 策略：FULL_SYNTHESIS
- 原因：意见分歧，所有方案得分均 >=3.0，且没有明显的获胜方案

**阶段 3 输出：**

- `specs/caching.md` - 混合方案：
  - 多级架构（来自 B）
  - 简单的 LRU 策略（来自 A）
  - 对静态内容使用 CDN（来自 C）
  - 总成本：8 个代理（阶段 1 的 4 个 + 3 名评审 + 1 个综合代理）

### 示例 3：身份验证设计（全部存在缺陷 - REDESIGN）

```bash
/do-competitively "Design authentication system with social login" \
  --output "specs/auth.md" \
  --criteria "security,user-experience,maintainability"
```

**阶段 1 输出（4 个并行代理）：**

- 元评审：包含 3 个标准维度和比较性评分准则的评估规范 YAML
- `specs/auth.a.md` - 自定义 OAuth2 实现
- `specs/auth.b.md` - 基于会话并使用社交登录提供方
- `specs/auth.c.md` - 使用仅密码身份验证的 JWT

**阶段 2 输出**（假设日期为 2025-01-15，3 名评审使用元评审规范）：

- `.specs/reports/auth-2025-01-15.1.md`：

  ```
  VOTE: Solution A
  SCORES: A=2.5/5.0, B=2.2/5.0, C=2.3/5.0
  ```

  “安全风险、重复造轮子”

- `.specs/reports/auth-2025-01-15.2.md`：

  ```
  VOTE: Solution B
  SCORES: A=2.4/5.0, B=2.8/5.0, C=2.1/5.0
  ```

  “会话无法扩展、缺少需求”

- `.specs/reports/auth-2025-01-15.3.md`：

  ```
  VOTE: Solution C
  SCORES: A=2.6/5.0, B=2.5/5.0, C=2.3/5.0
  ```

  “不支持社交登录、存在安全隐患”

**阶段 2.5 决策（编排器解析标头）：**

- 投票分散：A、B、C（未达成共识）
- 平均分：A=2.5，B=2.5，C=2.2（全部 <3.0）
- 策略：REDESIGN
- 原因：所有解决方案均低于 3.0 阈值，存在根本性问题

- 不要停止，返回阶段 1，并最终以 SELECT_AND_POLISH 或 FULL_SYNTHESIS 策略结束
</output>