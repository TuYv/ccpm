---
name: judge-with-debate
description: Evaluate solutions through multi-round debate between independent judges until consensus
argument-hint: Solution path(s) and evaluation criteria
---
# judge-with-debate

<task>
通过多智能体辩论评估解决方案，由独立评审分析并质疑彼此的评估，迭代改进评估结果，直至达成共识或达到最大轮次。
</task>

<context>
此命令实现了用于高质量评估的多智能体辩论模式，通过多种视角和严谨论证提高评估准确性。与单次评估不同，辩论要求评审用证据捍卫自己的立场，并考虑反方论点。

主要优势：

- **结构化评估** - 元评审在评审开始前生成针对性的评分量表和标准
- **多种视角** - 三名独立评审可减少个体偏差
- **基于证据的辩论** - 评审使用解决方案和评估规范中的具体证据来捍卫立场
- **迭代改进** - 最多进行 3 轮辩论，推动各方就准确评分达成一致
- **共享规范** - 元评审仅运行一次；所有轮次中的所有评审共享同一份评估规范
</context>

## 模式：基于辩论的评估

此命令实现迭代式多评审辩论：

```
Phase 0: Setup
         mkdir -p .specs/reports
                  |
Phase 0.5: Dispatch Meta-Judge
         Meta-Judge (Opus)
              |
         Evaluation Specification YAML
              |
Phase 1: Independent Analysis (3 judges in parallel)
         +- Judge 1 -> {name}.1.md -+
Solution +- Judge 2 -> {name}.2.md -+-+
         +- Judge 3 -> {name}.3.md -+ |
                                      |
Phase 2: Debate Round (iterative)     |
    Each judge reads others' reports  |
         |                            |
    Argue + Defend + Challenge        |
    (grounded in eval specification)  |
         |                            |
    Revise if convinced --------------+
         |                            |
    Check consensus                   |
         +- Yes -> Final Report       |
         +- No -> Next Round ---------+
```

## 流程

### 设置：创建报告目录

开始评估前，请确保报告目录存在：

```bash
mkdir -p .specs/reports
```

**报告命名约定：** `.specs/reports/{solution-name}-{YYYY-MM-DD}.[1|2|3].md`

其中：
- `{solution-name}` - 从解决方案文件名派生（例如，从 `src/api/users.ts` 派生出 `users-api`）
- `{YYYY-MM-DD}` - 当前日期
- `[1|2|3]` - 评审编号

### 阶段 0.5：派遣元评审

在独立分析之前，派遣一个元评审智能体生成针对性的评估规范。元评审仅运行一次，并生成供所有评审在所有轮次中使用的评分量表、检查清单和评分标准。

**元评审提示词模板：**

```markdown
## Task

Generate an evaluation specification yaml for the following evaluation task. You will produce rubrics, checklists, and scoring criteria that multiple judge agents will use to evaluate the solution through independent analysis and multi-round debate.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt
{task description - what the solution was supposed to accomplish}

## Context
{Any relevant context about the solution being evaluated}

## Artifact Type
{code | documentation | configuration | etc.}

## Evaluation Mode
Multi-judge debate with consensus-seeking across rounds

## Instructions
Return only the final evaluation specification YAML in your response.
The specification should support both independent analysis and debate-based refinement.
```

**调度：**

```
Use Task tool:
  - description: "Meta-judge: generate evaluation specification for {solution-name}"
  - prompt: {meta-judge prompt}
  - model: opus
  - subagent_type: "sadd:meta-judge"
```

等待元评审完成，并从其输出中提取评估规范 YAML，然后再进入阶段 1。

### 阶段 1：独立分析

并行启动 **3 个独立的评审代理**（使用 Opus 以确保严谨性）：

1. 每个评审都会收到：
   - 被评估解决方案的路径
   - 元评审生成的评估规范 YAML
   - 任务描述
2. 每个评审生成一份**独立评估报告**，保存至 `.specs/reports/{solution-name}-{date}.[1|2|3].md`
3. 报告必须包括：
   - 每项标准的评分及证据
   - 支持评分的具体引用/示例
   - 总体加权分数
   - 主要优点和缺点

**核心原则：** 初始分析的独立性可防止群体迷思。

**初始评审的提示词模板：**

```markdown
You are Judge {N} evaluating a solution independently against an evaluation specification produced by the meta judge.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## Solution
{path to solution file(s)}

## Task Description
{what the solution was supposed to accomplish}

## Evaluation Specification

```yaml
{meta-judge's evaluation specification YAML}
```

## Output File
.specs/reports/{solution-name}-{date}.{N}.md

## Instructions

Follow your full judge process as defined in your agent instructions!

Additional instructions:
1. Read the solution thoroughly
2. For each criterion from the evaluation specification:
   - Find specific evidence (quote exact text)
   - Score on the defined scale
   - Justify with concrete examples
3. Calculate weighted overall score
4. Write comprehensive report to {output_file}

Add to report beginning `Done by Judge {N}`
```

**调度每个评审：**

```
Use Task tool:
  - description: "Judge {N}: independent analysis of {solution-name}"
  - prompt: {judge prompt with evaluation specification YAML}
  - model: opus
  - subagent_type: "sadd:judge"
```

### 阶段 2：辩论轮次（迭代）

对于每一轮辩论（最多 3 轮）：

并行启动 **3 个辩论代理**：

1. 每个评审代理都会收到：
   - 自己上一份报告的路径（`.specs/reports/{solution-name}-{date}.[1|2|3].md`）
   - 其他评审报告的路径（`.specs/reports/{solution-name}-{date}.[1|2|3].md`）
   - 原始解决方案
   - 元评审生成的评估规范 YAML
2. 每个评审：
   - 找出与其他评审的分歧（任何标准的评分差距大于 1 分）
   - 使用解决方案和评估规范中的证据为自己的评分辩护
   - 质疑其他评审中自己不认同的评分
   - 考虑反方论点
   - 如果被说服，则修改自己的评估
3. 在自己的报告文件中新增章节：`## Debate Round {R}`
4. 在他们回复后，如果达成一致，则进入阶段 3：共识报告

**核心原则：** 评审仅通过文件系统进行沟通——编排器不进行协调，也不自行读取报告文件，因为这可能会导致上下文溢出。

**辩论评审的提示词模板：**

```markdown
You are Judge {N} in debate round {R}.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## Your Previous Report
{path to .specs/reports/{solution-name}-{date}.{N}.md}

## Other Judges' Reports
Judge 1: .specs/reports/{solution-name}-{date}.1.md
...

## Task Description
{what the solution was supposed to accomplish}

## Solution
{path to solution}

## Evaluation Specification

```yaml
{meta-judge's evaluation specification YAML}
```

## Output File
.specs/reports/{solution-name}-{date}.{N}.md (append to existing file)

## Instructions

Follow your full judge process as defined in your agent instructions!

Additional debate instructions:
1. Read your previous assessment from {your_previous_report}
2. Read all other judges' reports
3. Identify disagreements (where your scores differ by >1 point)
4. For each major disagreement:
   - State the disagreement clearly
   - Defend your position with evidence from the solution and evaluation specification
   - Challenge the other judge's position with counter-evidence
   - Consider whether their evidence changes your view
5. Update your report file by APPENDING debate round section
6. Reply whether you reached agreement, and with which judge. Include revisited scores and criteria scores.

CRITICAL:
- Ground your arguments in the evaluation specification criteria
- Only revise if you find their evidence compelling
- Defend your original scores if you still believe them
- Quote specific evidence from the solution
```

**分派每位辩论评审：**

```
Use Task tool:
  - description: "Judge {N}: debate round {R} for {solution-name}"
  - prompt: {debate judge prompt with evaluation specification YAML}
  - model: opus
  - subagent_type: "sadd:judge"
```

### 共识检查

每轮辩论结束后，检查是否达成共识：

**满足以下条件即达成共识：**
- 所有评审的总分彼此相差不超过 0.5 分
- 任意两位评审对任何标准的评分差异均不超过 1 分
- 所有评审均明确表示接受该共识

**如果 3 轮后仍未达成共识：**
- 报告仍然存在的分歧
- 提供所有评审报告以供人工审查
- 标记自动化评估未能达成共识

**编排说明：**

**步骤 1：分派元评审（阶段 0.5）**

1. 启动元评审代理
2. 等待元评审完成
3. 从元评审输出中提取评估规范 YAML

**步骤 2：运行独立分析（阶段 1）**

1. 使用评估规范 YAML 并行启动 3 个评审代理（评审 1、2、3）
2. 每个代理将其独立评估写入 `.specs/reports/{solution-name}-{date}.[1|2|3].md`
3. 等待全部 3 个代理完成

**步骤 3：检查是否达成共识**

让我们系统地完成这一过程，以确保准确检测共识。

读取全部三份报告并提取：
- 每位评审的总体加权分数
- 每位评审对每项标准的评分

逐步检查共识：
1. 首先，从每份报告中提取所有总分，并明确列出
2. 计算最高总分与最低总分之间的差值
   - 如果差值 <= 0.5 分 -> 已达成总体共识
   - 如果差值 > 0.5 分 -> 尚未达成共识
3. 接下来，对每项标准并列列出三位评审的评分
4. 对每项标准，计算最高分与最低分之间的差值
   - 如果任何标准的差值 > 1.0 分 -> 尚未就该标准达成共识
5. 最后，确认只有在同时满足以下两个条件时才算达成共识：
   - 总分彼此相差不超过 0.5 分
   - 所有标准的评分彼此相差不超过 1.0 分

**步骤 4：决策点**

- **如果已达成共识**：转到步骤 6（生成共识报告）
- **如果未达成共识且 round < 3**：转到步骤 5（运行辩论轮次）
- **如果未达成共识且 round = 3**：转到步骤 7（报告未达成共识）

**步骤 5：运行辩论轮次**

1. 递增轮次计数器（round = round + 1）
2. 使用相同的评估规范 YAML，并行启动 3 个评审代理
3. 每个代理读取：
   - 文件系统中自己的上一份报告
   - 文件系统中其他评审的报告
   - 原始解决方案
4. 每个代理将「Debate Round {R}」部分追加到自己的报告文件中
5. 等待所有 3 个代理完成
6. 返回步骤 3（检查是否达成共识）

**步骤 6：回复报告**

让我们逐步综合评估结果。

1. 仔细阅读所有最终报告
2. 生成报告之前，分析以下内容：
   - 共识状态如何（已达成还是未达成）？
   - 所有评审一致认同的关键点是什么？
   - 如果存在分歧，主要分歧领域是什么？
   - 辩论轮次如何改变了评估结果？
3. 向用户回复一份包含以下内容的报告：
   - 如果已达成共识：
     - 共识评分（所有评审评分的平均值）
     - 共识优点/缺点
     - 达成共识所需的轮数
     - 附有明确理由的最终建议
   - 如果未达成共识：
       - 所有评审的最终评分，以展示分歧
       - 未能达成共识的具体标准
       - 无法达成共识的原因分析
       - 标记为需要人工审核
4. 命令完成

**步骤 7：报告未达成共识**

- 报告持续存在的分歧
- 提供所有评审报告以供人工审核
- 标记自动评估无法达成共识

### 阶段 3：共识报告

如果已达成共识，则系统地逐一处理各个部分，以综合生成最终报告：

```markdown
# Consensus Evaluation Report

Let's compile the final consensus by analyzing each component systematically.

## Consensus Scores

First, let's consolidate all judges' final scores:

| Criterion | Judge 1 | Judge 2 | Judge 3 | Final |
|-----------|---------|---------|---------|-------|
| {Name}    | {X}/5   | {X}/5   | {X}/5   | {X}/5 |
...

**Consensus Overall Score**: {avg}/5.0

## Consensus Strengths
[Review each judge's identified strengths and extract the common themes that all judges agreed upon]

## Consensus Weaknesses
[Review each judge's identified weaknesses and extract the common themes that all judges agreed upon]

## Debate Summary
Let's trace how consensus was reached:
- Rounds to consensus: {N}
- Initial disagreements: {list with specific criteria and score gaps}
- How resolved: {for each disagreement, explain what evidence or argument led to resolution}

## Final Recommendation
Based on the consensus scores and the key strengths/weaknesses identified:
{Pass/Fail/Needs Revision with clear justification tied to the evidence}
```

<output>
该命令会生成：

1. **报告目录**：`.specs/reports/`（如果不存在则创建）
2. **初始报告**：`.specs/reports/{solution-name}-{date}.1.md`、`.specs/reports/{solution-name}-{date}.2.md`、`.specs/reports/{solution-name}-{date}.3.md`
3. **辩论更新**：每轮在各自的报告文件中追加章节
4. **最终综合结论**：回复用户（共识或分歧摘要）
</output>

## 最佳实践

### 元评审器 + 评审器验证

- **绝不要跳过元评审器**——量身定制的评估标准能够产生更好的判断和更有依据的辩论
- **元评审器仅运行一次**——所有 3 个评审器在所有辩论轮次中使用同一份规范
- **包含 CLAUDE_PLUGIN_ROOT**——元评审器和评审器都需要解析后的插件根路径
- **元评审器 YAML**——仅将 YAML 传递给评审器，不要修改
- **辩论依据**——评审器在为立场辩护时应引用评估规范中的标准

### 常见陷阱

- **评审器创建新报告而非追加内容**——会丢失辩论历史
- **编排器在评审器之间传递报告**——违反文件系统通信原则
- **初始评估薄弱**——输入的是垃圾，输出的也是垃圾
- **辩论轮次过多**——超过 3 轮后收益递减
- **辩论中的迎合行为**——评审器在没有真实证据的情况下过于轻易地达成一致
- **修改元评审器 YAML**——规范必须原封不动地传递给所有评审器
- **在不同轮次之间重新运行元评审器**——规范仅生成一次并共享

### 应当这样做

- **评审器向自己的报告文件追加内容**
- **评审器直接从文件系统读取其他报告**
- **提供有充分证据支持的高质量初始评估**
- **最多进行 3 轮辩论**
- **要求提供改变立场的证据**
- **以评估规范中的标准为辩论论据**
- **所有轮次使用同一份评估规范**

## 使用示例

### 评估 API 实现

```bash
/judge-with-debate Implement REST API for user management --solution "src/api/users.ts" 
```

**阶段 0.5——元评审器**（假设日期为 2025-01-15）：
- 元评审器生成评估规范 YAML，其中包含以下标准：
  - 正确性（30%）、设计（25%）、安全性（20%）、性能（15%）、文档（10%）
  - 每项标准的评分细则、检查清单和评分定义

**阶段 1——独立分析**（3 个评审器接收规范）：
- `.specs/reports/users-api-2025-01-15.1.md`——评审器 1 对正确性的评分为 4/5，对安全性的评分为 3/5
- `.specs/reports/users-api-2025-01-15.2.md`——评审器 2 对正确性的评分为 4/5，对安全性的评分为 5/5
- `.specs/reports/users-api-2025-01-15.3.md`——评审器 3 对正确性的评分为 5/5，对安全性的评分为 4/5

**检测到分歧：**安全性评分范围为 3-5

**阶段 2——第 1 轮辩论**（评审器引用评估规范）：
- 评审器 1 为 3/5 的评分辩护：“缺少速率限制，按照规范检查清单第 4 项，输入验证不完整”
- 评审器 2 提出质疑：“中间件中存在速率限制（第 45 行），符合规范评分细则”
- 评审器 1 将评分修改为 4/5：“之前遗漏了中间件，但按照规范，输入验证仍然较弱”
- 评审器 3 为 4/5 的评分辩护：“按照规范中定义的要求，输入验证已足够”

**辩论第 1 轮输出：**
- 所有评审目前对安全性的评分均为 4-5/5（相差不超过 1 分）
- 对输入验证仍存在分歧

**辩论第 2 轮**（使用相同的评估规范）：
- 评审根据规范标准检查具体的验证代码
- 评审 2 将评分修改为 4/5：“重新检查后发现，根据规范检查清单，电子邮件验证正则表达式较为薄弱”
- 共识：安全性 = 4/5

**最终共识：**
```
Correctness: 4.3/5
Design: 4.5/5
Security: 4.0/5 (2 debate rounds to consensus)
Performance: 4.7/5
Documentation: 4.0/5

Overall: 4.3/5 - PASS
```

</output>