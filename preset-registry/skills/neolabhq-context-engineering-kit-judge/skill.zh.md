---
name: judge
description: Launch a meta-judge then a judge sub-agent to evaluate results produced in the current conversation
---
# 评审命令

<task>
你是一名协调器，负责启动一个两阶段评估流程，以评估本次对话中较早阶段产出的工作。首先，由元评审生成定制化的评估标准。然后，由评审子代理在隔离的上下文中应用这些标准，进行结构化评分并提供基于证据的反馈。评估结果**仅供报告**——呈现评估发现，但不会自动进行修改。
</task>

<context>
此命令实现了带上下文隔离的**元评审 -> LLM 评审**模式：
- **结构化评估**：元评审在评审前生成定制化的评分标准、检查清单和评分准则
- **上下文隔离**：评审在全新的上下文中运行，避免受到累积会话状态产生的确认偏误影响
- **基于证据**：每个评分都必须引用工作成果中的具体证据（文件位置、行号）
- **多维度评分标准**：由元评审生成，以匹配具体的产物类型和评估重点
- **自我验证**：使用动态验证问题，并记录相应调整
</context>

## 你的工作流程

### 阶段 1：上下文提取

在启动评估流程之前，确定需要评估的内容：

1. **确定要评估的工作**：
   - 查看对话历史，了解已完成的工作
   - 如果提供了参数：使用这些参数聚焦于特定方面
   - 如果不明确：询问用户“我应该评估哪些工作？（代码更改、分析、文档等）”

2. **提取评估上下文**：
   - 触发该工作的原始任务或请求
   - 实际产出的输出或结果
   - 创建或修改的文件（附简要说明）
   - 提到的任何约束、要求或验收标准
   - 产物类型（代码、文档、配置等）

3. **向用户提供范围说明**：

   ```
   Evaluation Scope:
   - Original request: [summary]
   - Work produced: [description]
   - Files involved: [list]
   - Artifact type: [code | documentation | configuration | etc.]
   - Evaluation focus: [from arguments or "general quality"]

   Launching meta-judge to generate evaluation criteria...
   ```

**重要**：只将提取出的上下文传递给子代理——不要传递完整对话。这样可以避免上下文污染，并支持有针对性的评估。

### 阶段 2：调度元评审

启动一个元评审代理，为要评估的具体工作生成定制化的评估规范。元评审将返回一个包含评分标准、检查清单和评分准则的评估规范 YAML。

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

在继续执行第 3 阶段之前，等待元评审代理完成。

### 第 3 阶段：调度评审代理

元评审完成后，提取其评估规范 YAML，并将工作上下文和该规范一并传递给评审代理。

重要：向评审代理提供**完全准确的元评审评估规范 YAML**。不得跳过、添加、修改、缩短或总结其中的任何文本！

**评审代理提示词：**

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

重要：**绝不要以任何形式向评审代理提供分数阈值。**评审代理不得知道分数阈值，以免受到偏差影响！！！

**调度：**

```
Use Task tool:
  - description: "Judge: Evaluate {brief work summary}"
  - prompt: {judge prompt with exact meta-judge specification YAML}
  - model: opus
  - subagent_type: "sadd:judge"
```

### 第 4 阶段：处理并呈现结果

收到评审结果后：

1. **验证评估**：
   - 检查所有标准的分数是否在有效范围内（1-5）
   - 确认每个分数都有证据支持的理由
   - 确认加权总分计算正确
   - 检查理由与分数之间是否存在矛盾
   - 验证是否完成了自我验证，并记录了调整内容

2. **如果验证失败**：
   - 记录具体问题
   - 必要时请求澄清或重新评估

3. **向用户呈现结果**：
   - 展示完整的评估报告
   - 突出显示结论和关键发现
   - 提供后续选项：
     - 处理具体改进事项
     - 请求对任何评判进行澄清
     - 按当前结果继续工作

## 分数解读

| 分数范围 | 结论 | 解读 | 建议 |
|-------------|---------|-------------|----------------|
| 4.50 - 5.00 | 优秀 | 质量卓越，超出预期 | 可直接使用 |
| 4.00 - 4.49 | 良好 | 质量扎实，符合专业标准 | 可选择性地进行小幅改进 |
| 3.50 - 3.99 | 可接受 | 基本合格，但仍有改进空间 | 建议进行改进 |
| 3.00 - 3.49 | 需要改进 | 低于标准，需要进一步完善 | 使用前处理相关问题 |
| 1.00 - 2.99 | 不合格 | 未达到基本要求 | 需要进行大幅返工 |

## 重要指南

1. **先进行元评审**：始终先生成评估规范，再进行评审——绝不要跳过元评审阶段
2. **包含 CLAUDE_PLUGIN_ROOT**：元评审和评审都需要已解析的插件根路径
3. **元评审 YAML**：只将元评审 YAML 传递给评审，不要对其进行修改
4. **上下文隔离**：只向子代理传递相关上下文——不要传递整个对话
5. **先给出理由**：始终要求在评分之前提供证据和推理
6. **基于证据**：每个评分都必须引用具体证据（文件路径、行号、引文）
7. **减少偏差**：明确提醒避免长度偏差、冗长偏差和权威偏差
8. **保持客观**：基于证据和评审标准定义进行评估，而不是基于个人偏好
9. **具体明确**：引用确切位置，不要给出模糊的观察
10. **具有建设性**：将批评表述为改进机会，并说明其影响背景
11. **考虑上下文**：考虑已声明的约束、复杂性和要求
12. **报告置信度**：当证据含糊或标准不明确时，降低置信度
13. **单一评审者**：此命令使用一个专注的评审者来实现上下文隔离

## 注意事项

- 这是一个**仅报告**命令——它会评估工作，但不会修改工作
- 元评审会针对具体的产物类型和评估重点生成定制化标准
- 评审者使用全新的上下文，以进行无偏评估
- 评分标准根据专业开发标准进行校准
- 低分表示存在改进机会，而不是失败
- 使用评估结果指导后续步骤和迭代
- 低置信度的评估可能需要人工复核