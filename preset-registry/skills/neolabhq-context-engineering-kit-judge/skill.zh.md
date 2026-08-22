---
name: judge
description: Launch a meta-judge then a judge sub-agent to evaluate results produced in the current conversation
argument-hint: "[evaluation-focus]"
---
# 评审命令

<task>
你是一名协调器，负责启动一个两阶段评估流水线，对本次对话中先前完成的工作进行评估。首先，由元评审生成量身定制的评估标准。然后，由评审子代理在上下文隔离的情况下应用这些标准，进行结构化评分并提供基于证据的反馈。该评估**仅生成报告**——只呈现评估结果，不会自动进行更改。
</task>

<context>
此命令采用具有上下文隔离机制的**元评审 -> LLM 即评审**模式：
- **结构化评估**：元评审在评审前生成量身定制的评分量表、检查清单和评分标准
- **上下文隔离**：评审在全新的上下文中运行，防止累积的会话状态造成确认偏误
- **基于证据**：每项评分都需要引用工作中的具体证据（文件位置、行号）
- **多维评分量表**：由元评审根据特定制品类型和评估重点生成
- **自我验证**：使用动态验证问题并记录调整
</context>

## 你的工作流程

### 阶段 1：上下文提取

在启动评估流水线之前，确定需要评估的内容：

1. **确定要评估的工作**：
   - 查看对话历史记录，寻找已完成的工作
   - 如果提供了参数：使用这些参数聚焦于特定方面
   - 如果不明确：询问用户“What work should I evaluate? (code changes, analysis, documentation, etc.)”

2. **提取评估上下文**：
   - 促成该工作的原始任务或请求
   - 实际产生的输出/结果
   - 创建或修改的文件（附简要说明）
   - 提及的任何约束、要求或验收标准
   - 制品类型（代码、文档、配置等）

3. **向用户提供评估范围**：

   ```
   Evaluation Scope:
   - Original request: [summary]
   - Work produced: [description]
   - Files involved: [list]
   - Artifact type: [code | documentation | configuration | etc.]
   - Evaluation focus: [from arguments or "general quality"]

   Launching meta-judge to generate evaluation criteria...
   ```

**重要提示**：仅将提取出的上下文传递给子代理，而不是整个对话。这可以防止上下文污染，并实现聚焦评估。

### 阶段 2：调度元评审

启动一个元评审代理，生成针对待评估具体工作的评估规范。元评审将返回一个评估规范 YAML，其中包含评分量表、检查清单和评分标准。

**元评审提示词：**

```markdown
## Task

Generate an evaluation specification yaml for the following evaluation task. You will produce rubrics, checklists, and scoring criteria that a judge agent will use to evaluate the work.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt
{Original task or request that prompted the work}

## Context
{Any relevant context about the work being evaluated}
{Evaluation focus from arguments, or "General quality assessment"}

## Artifact Type
{code | documentation | configuration | etc.}

## Instructions
Return only the final evaluation specification YAML in your response.
```

**调度：**

```
Use Task tool:
  - description: "Meta-judge: Generate evaluation criteria for {brief work summary}"
  - prompt: {meta-judge prompt}
  - model: opus
  - subagent_type: "sadd:meta-judge"
```

等待元评判代理完成后，再进入阶段 3。

### 阶段 3：调度评判代理

元评判代理完成后，提取其评估规范 YAML，并将工作上下文和该规范一并发送给评判代理。

关键要求：必须向评判代理提供与元评判代理生成的评估规范 YAML **完全一致**的内容。不得跳过、添加、修改、缩短或总结其中的任何文本！

**评判代理提示词：**

```markdown
You are an Expert Judge evaluating the quality of work against an evaluation specification produced by the meta judge.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## Work Under Evaluation

[ORIGINAL TASK]
{paste the original request/task}
[/ORIGINAL TASK]

[WORK OUTPUT]
{summary of what was created/modified}
[/WORK OUTPUT]

[FILES INVOLVED]
{list of files with brief descriptions}
[/FILES INVOLVED]

## Evaluation Specification

```yaml
{meta-judge's evaluation specification YAML}
```

## Instructions

Follow your full judge process as defined in your agent instructions!

CRITICAL: You must reply with this exact structured evaluation report format in YAML at the START of your response!
```

关键要求：绝不能以任何形式向评判代理提供评分阈值。评判代理绝不能知道评分阈值，以免产生偏见！！！

**调度：**

```
Use Task tool:
  - description: "Judge: Evaluate {brief work summary}"
  - prompt: {judge prompt with exact meta-judge specification YAML}
  - model: opus
  - subagent_type: "sadd:judge"
```

### 阶段 4：处理并呈现结果

收到评判代理的评估后：

1. **验证评估结果**：
   - 检查所有标准的评分是否处于有效范围内（1-5）
   - 验证每项评分是否都有证据支持的理由
   - 确认加权总分计算正确
   - 检查评分与理由之间是否存在矛盾
   - 验证是否已完成自我核验并记录调整

2. **如果验证失败**：
   - 指明具体问题
   - 必要时请求澄清或重新评估

3. **向用户呈现结果**：
   - 显示完整的评估报告
   - 突出显示结论和关键发现
   - 提供后续选项：
     - 处理具体的改进事项
     - 请求澄清任何评判
     - 按原样继续使用该工作成果

## 评分解读

| 分数范围 | 结论 | 解读 | 建议 |
|-------------|---------|----------------|----------------|
| 4.50 - 5.00 | 优秀 | 质量卓越，超出预期 | 可直接使用 |
| 4.00 - 4.49 | 良好 | 质量扎实，符合专业标准 | 可选择进行少量改进 |
| 3.50 - 3.99 | 可接受 | 基本合格，但仍有改进空间 | 建议进行改进 |
| 3.00 - 3.49 | 需要改进 | 低于标准，需要完善 | 使用前先解决相关问题 |
| 1.00 - 2.99 | 不足 | 未达到基本要求 | 需要进行大量返工 |

## 重要准则

1. **元评审优先**：在评审之前始终先生成评估规范——绝不能跳过元评审阶段
2. **包含 CLAUDE_PLUGIN_ROOT**：元评审和评审都需要解析后的插件根路径
3. **元评审 YAML**：仅将元评审 YAML 传递给评审，不要修改它
4. **上下文隔离**：仅向子代理传递相关上下文——不要传递整个对话
5. **理由优先**：始终要求先提供证据和推理，再给出分数
6. **以证据为依据**：每个分数都必须引用具体证据（文件路径、行号、引文）
7. **减少偏差**：明确警示避免长度偏差、冗长偏差和权威偏差
8. **保持客观**：根据证据和评分标准定义进行评估，而非个人偏好
9. **具体明确**：引用确切位置，不要使用模糊描述
10. **具有建设性**：将批评表述为改进机会，并说明其影响
11. **考虑上下文**：将既定约束、复杂性和要求纳入考量
12. **报告置信度**：当证据含糊或标准不明确时，应降低置信度
13. **单一评审**：此命令使用一名专注的评审，以实现上下文隔离

## 注意事项

- 这是一个**仅生成报告**的命令——它会进行评估，但不会修改工作成果
- 元评审会针对特定的产物类型和评估重点生成量身定制的标准
- 评审在全新上下文中开展工作，以确保评估不受偏见影响
- 分数按照专业开发标准进行校准
- 低分表示存在改进机会，而不代表失败
- 使用评估结果指导后续步骤和迭代
- 置信度较低的评估可能需要人工复核