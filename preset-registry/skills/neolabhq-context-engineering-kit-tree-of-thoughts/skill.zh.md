---
name: tree-of-thoughts
description: Execute tasks through systematic exploration, pruning, and expansion using Tree of Thoughts methodology with meta-judge evaluation specifications and multi-agent evaluation
argument-hint: Task description and optional output path/criteria
---
# tree-of-thoughts

<task>
通过系统性探索解决方案空间、剪枝不具前景的分支、扩展可行方法并综合最佳方案，执行复杂的推理任务。
</task>

<context>
此命令针对需要在投入完整实现之前探索多条解决路径的任务，实现思维树（ToT）模式。它结合了创意采样、由元评审生成的评估规范、多视角评估、自适应策略选择和基于证据的综合，以产生更优的结果。

主要优势：

- **系统性探索** - 多个智能体探索解决方案空间的不同区域
- **结构化评估** - 元评审在评判前生成定制的评分标准和准则
- **独立验证** - 评审以机械化方式应用元评审规范，从而减少偏差
- **自适应策略** - 对明确胜出的方案进行完善，对存在分歧的决策进行综合，对失败方案进行重新设计
</context>

## 模式：思维树（ToT）

此命令实现一种包含元评审评估和自适应策略选择的八阶段系统推理模式：

```
Phase 1: Exploration (Propose Approaches)
         ┌─ Agent A → Proposals A1, A2 (with probabilities) ─┐
Task ───┼─ Agent B → Proposals B1, B2 (with probabilities) ─┼─┐
         └─ Agent C → Proposals C1, C2 (with probabilities) ─┘ │
                                                                │
Phase 1.5: Pruning Meta-Judge (runs in parallel with Phase 1) │
         Meta-Judge → Pruning Evaluation Specification YAML ───┤
                                                                │
Phase 2: Pruning (Vote for Best 3)                             │
         ┌─ Judge 1 → Votes + Rationale ─┐                     │
         ├─ Judge 2 → Votes + Rationale ─┼─────────────────────┤
         └─ Judge 3 → Votes + Rationale ─┘                     │
                 │                                              │
                 ├─→ Select Top 3 Proposals                     │
                 │                                              │
Phase 3: Expansion (Develop Full Solutions)                    │
         ┌─ Agent A → Solution A (from proposal X) ─┐          │
         ├─ Agent B → Solution B (from proposal Y) ─┼──────────┤
         └─ Agent C → Solution C (from proposal Z) ─┘          │
                                                                │
Phase 3.5: Evaluation Meta-Judge (runs in parallel w/ Phase 3)│
         Meta-Judge → Evaluation Specification YAML ───────────┤
                                                                │
Phase 4: Evaluation (Judge Full Solutions)                     │
         ┌─ Judge 1 → Report 1 ─┐                              │
         ├─ Judge 2 → Report 2 ─┼──────────────────────────────┤
         └─ Judge 3 → Report 3 ─┘                              │
                                                                │
Phase 4.5: Adaptive Strategy Selection                         │
         Analyze Consensus ────────────────────────────────────┤
                ├─ Clear Winner? → SELECT_AND_POLISH           │
                ├─ All Flawed (<3.0)? → REDESIGN (Phase 3)     │
                └─ Split Decision? → FULL_SYNTHESIS            │
                                         │                      │
Phase 5: Synthesis (Only if FULL_SYNTHESIS)                    │
         Synthesizer ────────────────────┴──────────────────────┴─→ Final Solution
```

## 流程

### 设置：创建目录结构

开始之前，请确保目录结构已存在：

```bash
mkdir -p .specs/research .specs/reports
```

**命名约定：**
- 提案：`.specs/research/{solution-name}-{YYYY-MM-DD}.proposals.[a|b|c].md`
- 筛选：`.specs/research/{solution-name}-{YYYY-MM-DD}.pruning.[1|2|3].md`
- 选择：`.specs/research/{solution-name}-{YYYY-MM-DD}.selection.md`
- 评估：`.specs/reports/{solution-name}-{YYYY-MM-DD}.[1|2|3].md`

其中：
- `{solution-name}` - 从输出路径派生（例如，从输出路径 `specs/api/users.md` 派生出 `users-api`）
- `{YYYY-MM-DD}` - 当前日期

**注意：** 解决方案仍保留在其指定的输出位置；只有研究和评估文件会存放到 `.specs/`

### 阶段 1：探索（提出方法）

**并行启动 3 个独立智能体**（建议使用 Sonnet 以提高速度）：

1. 每个智能体接收**完全相同的任务描述和上下文**
2. 每个智能体**生成 6 种高层次方法**（而非完整实现）
3. 对于每种方法，智能体需要提供：
   - **方法描述**（2-3 段）
   - **关键设计决策**及权衡
   - **概率估计**（0.0-1.0）
   - **复杂度估计**（低/中/高）
   - **潜在风险**和故障模式
4. 将提案保存到 `.specs/research/{solution-name}-{date}.proposals.[a|b|c].md`

**关键原则：** 通过从所有可能方法的完整分布中进行概率采样，实现系统化探索。

**探索智能体的提示词模板：**

```markdown
<task>
{task_description}
</task>

<constraints>
{constraints_if_any}
</constraints>

<context>
{relevant_context}
</context>

<output>
{.specs/research/{solution-name}-{date}.proposals.[a|b|c].md - each agent gets unique letter identifier}
</output>

Instructions:

Let's approach this systematically by first understanding what we're solving, then exploring the solution space.

**Step 1: Decompose the problem**
Before generating approaches, break down the task:
- What is the core problem being solved?
- What are the key constraints and requirements?
- What subproblems must any solution address?
- What are the evaluation criteria for success?

**Step 2: Map the solution space**
Identify the major dimensions along which solutions can vary:
- Architecture patterns (e.g., monolithic vs distributed)
- Implementation strategies (e.g., eager vs lazy)
- Trade-off axes (e.g., performance vs simplicity)

**Step 3: Generate 6 distinct high-level approaches**

**Sampling guidance:**
Please sample approaches at random from the [full distribution / tails of the distribution]
- For first 3 approaches aim for high probability, over 0.80
- For last 3 approaches aim for diversity - explore different regions of the solution space, such that the probability of each response is less than 0.10

For each approach, provide:
   - Name and one-sentence summary
   - Detailed description (2-3 paragraphs)
   - Key design decisions and rationale
   - Trade-offs (what you gain vs what you sacrifice)
   - Probability (0.0-1.0)
   - Complexity estimate (low/medium/high)
   - Potential risks and failure modes

**Step 4: Verify diversity**
Before finalizing, check:
- Are approaches genuinely different, not minor variations?
- Do they span different regions of the solution space?
- Have you covered both conventional and unconventional options?


CRITICAL:
- Do NOT implement full solutions yet - only high-level approaches
- Ensure approaches are genuinely different, not minor variations
```

### 阶段 1.5：分派剪枝元评审员

**关键要求**：剪枝元评审员必须与阶段 1 探索智能体**并行启动**。元评审员无需探索输出即可生成剪枝标准——它只需要原始任务描述。

剪枝元评审员负责生成一份评估规范（评分量表、检查清单、评分标准），用于评估参与剪枝的高层级提案。

**剪枝元评审员的提示词模板：**

```markdown
## Task

Generate an evaluation specification yaml for pruning high-level solution proposals. You will produce rubrics, checklists, and scoring criteria that judge agents will use to select the top 3 proposals for full development.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt
{Original task description from user}

## Context
{Any relevant codebase context, file paths, constraints}

## Artifact Type
proposals (high-level approaches with probability estimates, not full implementations)

## Evaluation Focus
Feasibility, alignment with requirements, potential for high-quality result, risk manageability

## Instructions
Return only the final evaluation specification YAML in your response.
The specification should support comparative evaluation and ranking of proposals.
```

**分派：**

```
Use Task tool:
  - description: "Pruning Meta-judge: {brief task summary}"
  - prompt: {pruning meta-judge prompt}
  - model: opus
  - subagent_type: "sadd:meta-judge"
```

### 阶段 2：剪枝（投票选出前 3 个候选方案）

**等待阶段 1 探索智能体和阶段 1.5 剪枝元评审员均完成后，再继续执行。**

并行启动 **3 个独立评审员**（建议使用 Opus 以确保严谨性）：

1. 每个评审员都会收到**所有提案文件**（来自 `.specs/research/`）以及**剪枝元评审员的评估规范 YAML**
2. 评审员依据**元评审员生成的剪枝标准**评估每个提案
3. 每个评审员需生成：
   - **每个提案的评分**（附证据）
   - **投票选出要扩展的前 3 个提案**
   - **选择理由**
4. 投票结果保存到 `.specs/research/{solution-name}-{date}.pruning.[1|2|3].md`

**关键原则：**采用元评审员生成的标准进行独立评估，可以在不硬编码权重的情况下确保评估一致且贴合任务。

关键要求：向每个评审员提供剪枝元评审员评估规范 YAML 的原文，必须完全一致。不得跳过、添加、修改、缩短或概括其中的任何文本！

**剪枝评审员的提示词模板：**

```markdown
You are evaluating {N} proposed approaches against an evaluation specification produced by the meta judge, to select the top 3 for full development.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## Task
{task_description}

## Proposals
{list of paths to all proposal files}
Read all proposals carefully before evaluating.

## Evaluation Specification

```yaml
{pruning meta-judge's evaluation specification YAML}
```

## Output
{.specs/research/{solution-name}-{date}.pruning.[1|2|3].md}

## Instructions

Follow your full judge process as defined in your agent instructions!

CRITICAL: You must reply with this exact structured evaluation report format in YAML at the START of your response!
```

**分派：**

```
Use Task tool:
  - description: "Pruning Judge {1|2|3}: {brief task summary}"
  - prompt: {pruning judge prompt with exact meta-judge specification YAML}
  - model: opus
  - subagent_type: "sadd:judge"
```

### 阶段 2b：选出排名前三的提案

评审完成投票后：

1. 使用排序选择制**汇总票数**：
   - 第一选择 = 3 分
   - 第二选择 = 2 分
   - 第三选择 = 1 分
2. 根据总分**选出排名前三的**提案
3. 通过比较各项标准的平均得分来**处理平局**
4. 在 `.specs/research/{solution-name}-{date}.selection.md` 中**记录选择结果**：
   - 票数统计
   - 入选提案
   - 共识理由

### 阶段 3：扩展（开发完整解决方案）

**并行**启动 **3 个独立代理**（建议使用 Opus 以保证质量）：

1. 每个代理会收到：
   - 要扩展的**一个入选提案**
   - **原始任务描述**和上下文
   - 筛选阶段的**评审反馈**（疑虑、问题）
2. 代理生成用于实施该提案的**完整解决方案**：
   - 完整的实现细节
   - 解决评审提出的疑虑
   - 记录扩展过程中做出的关键决策
3. 将解决方案保存至 `solution.a.md`、`solution.b.md`、`solution.c.md`

**关键原则：** 在了解评估反馈的基础上，集中开发经过验证的方法。

**扩展代理的提示词模板：**

```markdown
You are developing a full solution based on a selected proposal.

<task>
{task_description}
</task>

<selected_proposal>
{write selected proposal EXACTLY as it is. Including all details provided by the agent}
Read this carefully - it is your starting point.
</selected_proposal>

<judge_feedback>
{concerns and questions from judges about this proposal}
Address these in your implementation.
</judge_feedback>

<output>
solution.[*].md where [*] is your unique identifier (a, b, or c)
</output>

Instructions:

Let's work through this systematically to ensure we build a complete, high-quality solution.

**Step 1: Understand the proposal deeply**
Before implementing, analyze:
- What is the core insight or approach of this proposal?
- What are the key design decisions already made?
- What gaps need to be filled for a complete solution?

**Step 2: Address judge feedback**
For each concern raised by judges:
- What specific change or addition addresses this concern?
- How does this change integrate with the proposal's approach?

**Step 3: Decompose into implementation subproblems**
Break the solution into logical parts:
- What are the main components or sections?
- What must be defined first for other parts to build upon?
- What are the dependencies between parts?

**Step 4: Implement each subproblem**
For each component, work through:
- Core functionality and behavior
- Edge cases and error handling
- Integration points with other components

**Step 5: Self-verification**
Generate 3-5 verification questions about critical aspects, then answer them:
- Review solution against each question
- Identify gaps or weaknesses
- Fix identified issues

**Step 6: Document changes**
Explain what was changed from the original proposal and why.

<example>
**Example of good expansion thinking:**

Proposal: "Use event-driven architecture with message queue"

Step 1 Analysis:
- Core insight: Decouple components via async messaging
- Key decisions: Events as primary communication, eventual consistency
- Gaps: Need to define event schemas, queue technology, error handling

Step 2 - Addressing judge concern "What about message ordering?":
- Add partition keys for ordered processing within entity scope
- Document ordering guarantees and limitations

Step 3 - Subproblems:
1. Event schema definitions (foundational - others depend on this)
2. Producer interfaces (depends on schemas)
3. Consumer handlers (depends on schemas)
4. Error handling and dead letter queues (depends on both)
5. Integration patterns (builds on all above)
</example>

CRITICAL:
- Stay faithful to the selected proposal's core approach
- Do not switch to a different approach midway
- Address judge feedback explicitly
- Produce a complete, implementable solution
```

### 阶段 3.5：派发评估元裁判

**关键要求**：在启动阶段 3 扩展代理的同时，**并行启动评估元裁判**。元裁判生成评估标准时不需要扩展输出——它只需要原始任务描述。

评估元裁判会生成一份评估规范（评分量规、检查清单、评分标准），专门用于评估完整的解决方案实现。

**评估元裁判的提示词模板：**

```markdown
## Task

Generate an evaluation specification yaml for evaluating full solution implementations. You will produce rubrics, checklists, and scoring criteria that judge agents will use to evaluate and compare competitive implementations.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt
{Original task description from user}

## Context
{Any relevant codebase context, file paths, constraints}

## Artifact Type
{code | documentation | configuration | etc.}

## Number of Solutions
3 (full implementations developed from selected proposals)

## Instructions
Return only the final evaluation specification YAML in your response.
The specification should support comparative evaluation across multiple solutions.
```

**派发：**

```
Use Task tool:
  - description: "Evaluation Meta-judge: {brief task summary}"
  - prompt: {evaluation meta-judge prompt}
  - model: opus
  - subagent_type: "sadd:meta-judge"
```

### 阶段 4：评估（裁判完整解决方案）

**等待阶段 3 扩展代理和阶段 3.5 评估元裁判两者都完成后，再继续执行。**

并行启动 **3 个独立裁判**（建议使用 Opus 以确保严谨性）：

1. 每个裁判都会收到**所有解决方案文件**（solution.a.md、solution.b.md、solution.c.md）以及**评估元裁判生成的规范 YAML**
2. 裁判依据**元裁判生成的评估标准**进行评估
3. 每个裁判都会生成：
   - **对比分析**（各解决方案分别在哪些方面表现出色）
   - **基于证据的评分**（包含具体引用/示例）
   - **最终投票**（偏好哪个解决方案及其原因）
4. 报告保存至 `.specs/reports/{solution-name}-{date}.[1|2|3].md`

**核心原则：** 通过元裁判生成的规范，让多个独立裁判开展评估并提供明确证据，可以减少偏见，并发现不同方面的质量问题。

关键要求：必须向每个裁判提供评估元裁判所生成的评估规范 YAML 的完整原文。不得跳过、添加、修改、缩短或总结其中的任何文本！

关键要求：绝不向裁判提供分数阈值。裁判绝不能知道分数阈值是多少，以免产生偏见！！！

**评估裁判的提示词模板：**

```markdown
You are evaluating {number} full solutions against an evaluation specification produced by the meta judge.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## Task
{task_description}

## Solutions
{list of paths to all solution files}
Read all solutions carefully before evaluating.

## Evaluation Specification

```yaml
{evaluation meta-judge's evaluation specification YAML}
```

## Output
Write full report to: .specs/reports/{solution-name}-{date}.[1|2|3].md

CRITICAL: You must reply with this exact structured header format:

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

## Instructions

Follow your full judge process as defined in your agent instructions!

CRITICAL: You must reply with this exact structured evaluation report format in YAML at the START of your response!
```

**分派：**

```
Use Task tool:
  - description: "Evaluation Judge {1|2|3}: {brief task summary}"
  - prompt: {evaluation judge prompt with exact meta-judge specification YAML}
  - model: opus
  - subagent_type: "sadd:judge"
```

### 阶段 4.5：自适应策略选择（提前返回）

**编排器**（而非子代理）分析评审输出，以确定最优策略。

#### 决策逻辑

**步骤 1：解析评审回复中的结构化标头**

解析评审的回复。
关键：不要读取报告文件本身，因为它们可能导致你的上下文溢出。

**步骤 2：检查是否存在一致胜出的方案**

比较全部三个 VOTE 值：
- 如果评审 1 的 VOTE = 评审 2 的 VOTE = 评审 3 的 VOTE（同一个解决方案）：
  - **策略：SELECT_AND_POLISH**
  - **原因：**形成明确共识——三位评审都偏好同一个解决方案

**步骤 3：检查所有解决方案是否都存在根本缺陷**

如果投票结果不一致，则计算平均分：
1. 解决方案 A 的平均分：(Judge1_A + Judge2_A + Judge3_A) / 3
2. 解决方案 B 的平均分：(Judge1_B + Judge2_B + Judge3_B) / 3
3. 解决方案 C 的平均分：(Judge1_C + Judge2_C + Judge3_C) / 3

如果 (avg_A < 3.0) AND (avg_B < 3.0) AND (avg_C < 3.0)：
- **策略：REDESIGN**
- **原因：**所有解决方案均低于质量阈值，基本方法存在问题

**步骤 4：默认进行完整综合**

如果以上条件均不满足：
- **策略：FULL_SYNTHESIS**
- **原因：**决策存在分歧且各方案各有可取之处，需要综合各方案的最佳元素

#### 策略 1：SELECT_AND_POLISH

**适用情况：**存在明确胜出的方案（投票一致）

**流程：**
1. 选择胜出的解决方案作为基础
2. 启动子代理，根据评审反馈进行具体改进
3. 从次优解决方案中择优选取 1-2 个最佳元素
4. 记录添加了哪些内容以及添加原因

**优势：**
- 节省综合成本（比完整综合更简单）
- 保留胜出解决方案已经验证的质量
- 进行有针对性的改进，而不是彻底重构

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

Let's approach this polishing task methodically to improve without disrupting what works.

**Step 1: Understand why this solution won**
Analyze the winning solution:
- What are its core strengths that judges praised?
- What makes its approach superior to alternatives?
- Which parts should remain untouched?

**Step 2: Catalog improvement opportunities**
From judge feedback, identify:
- Specific weaknesses mentioned (list each one)
- Missing elements judges noted
- Areas where runner-ups were praised

**Step 3: Prioritize changes by impact**
For each improvement opportunity:
- High impact: Directly addresses judge criticism
- Medium impact: Adds praised element from runner-up
- Low impact: Nice-to-have refinement

Focus on high-impact changes first.

**Step 4: Apply improvements surgically**
For each change:
- Locate the specific section to modify
- Make the minimal change needed to address the issue
- Verify the change integrates cleanly with surrounding content

**Step 5: Cherry-pick from runners-up**
Review runner-up solutions for:
- 1-2 specific elements that judges praised
- Elements that complement (not conflict with) the winning approach
- Only incorporate if clearly superior to winning solution's version

**Step 6: Document all changes**
Record:
- What was changed and why (with reference to judge feedback)
- What was added from other solutions (cite source)
- What was intentionally left unchanged

CRITICAL: Preserve the winning solution's core approach. Make targeted improvements only.
```

#### 策略 2：重新设计

**适用情况：**所有解决方案的评分均低于 3.0/5.0（所有方案都存在根本性问题）

**流程：**
1. 启动新代理，分析失败模式和经验教训
2. **返回阶段 3**（扩展），向新的实现代理提供经验教训和新约束

**注意：**如果重新设计失败两次，则上报给用户以寻求指导。

**新实现的提示词模板：**

```markdown
You are analyzing why all solutions failed to meet quality standards, to inform a redesign. And implement new solution based on it.


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
{list of paths to all solution files}
Average scores: A={avg_a}/5.0, B={avg_b}/5.0, C={avg_c}/5.0
</failed_solutions>

<evaluation_reports>
{list of paths to all evaluation reports}
All solutions scored below 3.0/5.0 threshold.
</evaluation_reports>

<output>
.specs/research/{solution-name}-{date}.redesign-analysis.md
</output>

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

**适用情况：**没有明确的胜出方案，并且各解决方案都有可取之处（评分 >=3.0）

**流程：**进入阶段 5（基于证据的综合）

### 阶段 5：综合（基于证据的组合）

**仅当阶段 4.5 选择策略 3（FULL_SYNTHESIS）时执行**

启动 **1 个综合代理**（建议使用 Opus 以保证质量）：

1. 代理接收：
   - **所有解决方案**（来自指定的输出位置）
   - **所有评估报告**（来自 `.specs/reports/`）
   - 筛选阶段的**选择理由**（来自 `.specs/research/`）
2. 代理分析：
   - **共识优势**（多位评审肯定的内容）
   - **共识弱点**（多位评审批评的内容）
   - 各解决方案采用不同方法时的**互补要素**
3. 代理通过以下方式生成**最终解决方案**：
   - 当某个解决方案明显胜出时，**复制其中更优秀的部分**
   - 当混合方案更好时，**组合不同方法**
   - **修复评审发现的问题**
   - **记录决策**（采用了哪些方案中的哪些内容，以及原因）

**关键原则：** 基于证据的综合利用探索和评估过程中形成的集体智慧。

**综合者提示词模板：**

```markdown
You are synthesizing the best solution from explored, pruned, and evaluated implementations.

<task>
{task_description}
</task>

<solutions>
{list of paths to all solution files}
</solutions>

<evaluation_reports>
{list of paths to all evaluation reports}
</evaluation_reports>

<selection_rationale>
{path to selection.md explaining why these proposals were chosen}
</selection_rationale>

<output>
{output_path} - The final synthesized solution
</output>

Instructions:

Let's approach this synthesis systematically by first analyzing, then decomposing, then building.

**Step 1: Build the evidence base**
Before synthesizing, gather evidence from judge reports:
- What did multiple judges praise? (consensus strengths)
- What did multiple judges criticize? (consensus weaknesses)
- Where did judges disagree? (areas needing careful analysis)

**Step 2: Decompose into synthesis subproblems**
Break the solution into logical sections or components. For each component:
- Which solution handles this best? (cite evidence)
- Are there complementary elements from multiple solutions?
- What issues were identified that need fixing?

**Step 3: Solve each subproblem**
For each component/section, determine the synthesis strategy:

*Strategy A - Clear winner:* If one solution is clearly superior for this component:
- Copy that section directly
- Document: "Taken from Solution X because [judge evidence]"

*Strategy B - Complementary combination:* If solutions have complementary strengths:
- Identify what each contributes
- Combine carefully, ensuring consistency
- Document: "Combined X from Solution A with Y from Solution B because [rationale]"

*Strategy C - All flawed:* If all solutions have issues in this area:
- Start with the best version
- Apply fixes based on judge criticism
- Document: "Based on Solution X, modified to address [specific issues]"

**Step 4: Integrate and verify consistency**
After synthesizing all components:
- Check that combined elements work together
- Resolve any contradictions between borrowed sections
- Ensure consistent terminology and style

**Step 5: Document synthesis decisions**
Create a synthesis log:
- What you took from each solution (with specific citations)
- Why you made those choices (reference judge feedback)
- How you addressed identified weaknesses
- Any novel combinations or improvements

<example>
**Example synthesis decision for an API design:**

Component: Authentication flow
- Solution A: JWT with refresh tokens (praised for security by 2/3 judges)
- Solution B: Session-based (praised for simplicity by 1 judge, criticized for scalability)
- Solution C: OAuth2 only (criticized as over-engineered for use case)

Decision: Take Solution A's authentication flow directly.
Evidence: Judges 1 and 3 both noted "JWT approach provides good balance of security and statelessness"
Modification: None needed - this section was rated highest across judges.
</example>

**Step 6: Revise your solution**
- Generate 5 verification questions about critical aspects
- Answer your own questions:
   - Review solution against each question
   - Identify gaps or weaknesses
- Revise solution:
   - Fix identified issues
- Explain what was changed and why


CRITICAL:
- Do not create something entirely new - synthesize the best from what exists
- Cite your sources (which solution, which section)
- Explain every major decision
- Address all consensus weaknesses identified by judges
```

<output>
该命令会根据所选的自适应策略生成不同的输出：

### 输出（所有策略）

1. **研究目录：** `.specs/research/`（不存在时创建）
   - 提案：`.specs/research/{solution-name}-{date}.proposals.[a|b|c].md` - 带有概率的高层级方案
   - 筛选：`.specs/research/{solution-name}-{date}.pruning.[1|2|3].md` - 评审者的评估和投票
   - 选择：`.specs/research/{solution-name}-{date}.selection.md` - 投票统计和入选提案

2. **扩展输出：**
   - `solution.a.md`、`solution.b.md`、`solution.c.md` - 完整实现（位于指定的输出位置）

3. **报告目录：** `.specs/reports/`（不存在时创建）
   - 评估：`.specs/reports/{solution-name}-{date}.[1|2|3].md` - 最终评审报告

4. **最终解决方案：** `{output_path}`

### 特定策略的输出

- **SELECT_AND_POLISH**：基于获胜解决方案进行针对性改进后得到的完善版解决方案
- **REDESIGN**：不要停止；带着吸取的经验返回阶段 3；最终以 SELECT_AND_POLISH 或 FULL_SYNTHESIS 结束
- **FULL_SYNTHESIS**：综合所有解决方案中的最佳要素而形成的解决方案
</output>

## 最佳实践

### 元评审者 + 评审者验证

- **两个元评审者** - 分别用于筛选（提案）和评估（完整解决方案）的独立规范
- **元评审者与实现并行运行** - 不要阻塞流水线；筛选元评审者与阶段 1 同时运行，评估元评审者与阶段 3 同时运行
- **包含 CLAUDE_PLUGIN_ROOT** - 两个元评审者和所有评审者都需要解析后的插件根路径
- **元评审者 YAML** - 仅将 YAML 传递给评审者，不要对其进行修改

### 常见陷阱

- **探索不足** - 代理提出相似的方案
- **忽略评审者反馈** - 扩展时忽略筛选阶段提出的问题
- **提案含糊** - 缺少实现细节，无法进行适当评估
- **过度探索** - 提案过多，导致评估成本高昂
- **存在明确获胜方案时强行综合** - 浪费成本，并可能降低质量
- **综合存在根本缺陷的解决方案** - 与其完善垃圾方案，不如重新设计

### 建议

- **鼓励多样化探索** - 提示代理探索解决方案空间的不同区域
- **向后续阶段传递反馈** - 扩展代理应处理筛选阶段提出的问题
- **采用适当的详细程度** - 提案应包含足够的细节以供评估
- **积极筛选** - 仅扩展最有前景的 3 种方案
- **信任自适应策略选择** - 完善明确的获胜方案，综合意见分歧时的方案，重新设计失败的方案

## 示例：API 设计

```bash
/tree-of-thoughts "Design REST API for user management (CRUD + auth)" \
  --output "specs/api/users.md" \
  --criteria "RESTfulness,security,scalability,developer-experience"
```

**阶段 1 的输出**（假设日期为 2025-01-15）：
- `.specs/research/users-api-2025-01-15.proposals.a.md` - 代理 A 提出的 6 种方案
- `.specs/research/users-api-2025-01-15.proposals.b.md` - 代理 B 提出的 6 种方案
- `.specs/research/users-api-2025-01-15.proposals.c.md` - 代理 C 提出的 6 种方案

**阶段 1.5 输出**（与阶段 1 并行运行）：
- 剪枝元评审器（Opus，`sadd:meta-judge`）生成剪枝评估规范 YAML

**阶段 2 输出**（3 个评审器使用剪枝元评审规范）：
- `.specs/research/users-api-2025-01-15.pruning.1.md` - 前 3 名：基于资源的 REST、纯 REST、单体式
- `.specs/research/users-api-2025-01-15.pruning.2.md` - 前 3 名：纯 REST、混合式（服务）、基于资源的 REST
- `.specs/research/users-api-2025-01-15.pruning.3.md` - 前 3 名：基于资源的 REST、REST+GraphQL 混合式、纯 REST
- `.specs/research/users-api-2025-01-15.selection.md` - 入选：基于资源的 REST（8 分）、纯 REST（7 分）、单体式（4 分）

**阶段 3 输出：**
- `specs/api/users.a.md` - 包含嵌套路由的完整资源式设计
- `specs/api/users.b.md` - 使用简单端点的扁平 REST 设计
- `specs/api/users.c.md` - 内部采用面向服务架构的单体式 API

**阶段 3.5 输出**（与阶段 3 并行运行）：
- 评估元评审器（Opus，`sadd:meta-judge`）生成评估规范 YAML

**阶段 4 输出**（3 个评审器使用评估元评审规范）：
- `.specs/reports/users-api-2025-01-15.1.md`：
  ```
  VOTE: Solution A
  SCORES: A=4.2/5.0, B=3.8/5.0, C=3.4/5.0
  ```
  “因 A 更符合 REST 风格而倾向于 A，并批评 C 过于复杂”

- `.specs/reports/users-api-2025-01-15.2.md`：
  ```
  VOTE: Solution B
  SCORES: A=3.9/5.0, B=4.1/5.0, C=3.5/5.0
  ```
  “因 B 更简单而倾向于 B，并批评 A 的嵌套过深”

- `.specs/reports/users-api-2025-01-15.3.md`：
  ```
  VOTE: Solution A
  SCORES: A=4.3/5.0, B=3.6/5.0, C=3.2/5.0
  ```
  “因 A 更易于发现而倾向于 A，并批评 B 缺乏结构”

**阶段 4.5 决策（编排器解析标头）：**
- 票数分散：A、B、A（没有一致胜出的方案）
- 平均分：A=4.1、B=3.8、C=3.4（均 >=3.0）
- 策略：FULL_SYNTHESIS
- 原因：决策存在分歧且各有优点，需要综合

**阶段 5 输出（综合）：**
- `specs/api/users.md` - 基于资源的结构（来自 A）、最多 2 层嵌套（来自 B）、内部服务（来自 C）

</output>