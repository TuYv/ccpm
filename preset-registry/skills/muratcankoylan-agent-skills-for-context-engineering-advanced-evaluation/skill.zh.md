---
name: advanced-evaluation
description: "This skill should be used for advanced LLM evaluation: LLM-as-judge systems, direct scoring, pairwise comparison, rubric calibration, evaluator bias mitigation, confidence scoring, and automated quality assessment."
---
# 高级评估

本技能涵盖使用 LLM 作为评审来评估 LLM 输出的生产级技术。它综合了学术论文中的研究成果、行业实践和实际实施经验，将其转化为构建可靠评估系统的可执行模式。

**核心洞见**：LLM-as-a-Judge 并非单一技术，而是一系列方法，每种方法都适用于不同的评估场景。选择正确的方法并缓解已知偏差，是本技能培养的核心能力。

## 何时启用

在以下情况下启用本技能：

- 为 LLM 输出构建 LLM 评审系统
- 比较多个模型响应以选出最佳响应
- 在各评估团队之间建立一致的质量标准
- 调试结果不一致的评估系统
- 为提示词或模型变更设计 A/B 测试
- 专门为 LLM 评审或人类/LLM 混合评审创建评分量表
- 分析自动化判断与人类判断之间的相关性

对于由其他技能负责的相邻工作，请勿启用本技能：
- 通用确定性检查、回归测试套件、生产质量门禁或结果指标：`evaluation`。
- 自主循环治理、锁定的评分量表、回滚或 PR 审批边界：`harness-engineering`。
- 评估工具的工具 API 契约：`tool-design`。

## 核心概念

### 评估分类体系

根据是否存在真实参考答案，在以下两种主要方法之间进行选择：

**直接评分** — 当存在客观标准（事实准确性、指令遵循程度、毒性）时使用。由单个 LLM 按照定义明确的量表对一个响应进行评分。对于定义清晰的标准，可实现中等至较高的可靠性。需警惕评分校准漂移和对量表理解不一致的问题。

**成对比较** — 用于主观偏好（语气、风格、说服力）。由 LLM 比较两个响应并选择更好的一个。对于主观任务，相较于开放式直接评分，成对比较方法通常与人类偏好的相关性更高（claim-advanced-evaluation-position-swap）。需警惕位置偏差和长度偏差。

### 偏差全景

在每个评估系统中都应缓解以下系统性偏差：

**位置偏差**：位于第一位置的响应会受到优待。缓解方法是交换位置后评估两次，然后采用多数表决或一致性检查。

**长度偏差**：无论质量如何，较长的响应都会获得更高分。缓解方法是明确提示忽略长度，并采用长度归一化评分。

**自我增强偏差**：模型会给自己的输出更高评分。缓解方法是使用不同的模型分别进行生成和评估。

**冗长偏差**：即使没有必要，过多的细节也会获得更高分。缓解方法是使用针对具体标准的评分量表，对无关细节进行扣分。

**权威偏差**：无论准确性如何，自信的语气都会获得更高分。缓解方法是要求引用证据，并增加事实核查层。

### 指标选择框架

使指标与评估任务的结构相匹配：

| 任务类型 | 主要指标 | 次要指标 |
|-----------|-----------------|-------------------|
| 二元分类（通过/失败） | 召回率、精确率、F1 | Cohen's kappa |
| 有序量表（1-5 评分） | Spearman's rho、Kendall's tau | Cohen's kappa（加权） |
| 成对偏好 | 一致率、位置一致性 | 置信度校准 |
| 多标签 | Macro-F1、Micro-F1 | 各标签的精确率/召回率 |

应优先关注系统性分歧模式，而非绝对一致率，因为在特定标准上持续与人类意见不一致的评判器，比仅存在随机噪声的评判器问题更严重。

## 评估方法

### 直接评分实现

使用三个组成部分构建直接评分：明确的标准、经过校准的量表和结构化输出格式。

**标准定义模式**：
```
Criterion: [Name]
Description: [What this criterion measures]
Weight: [Relative importance, 0-1]
```

**量表校准** — 根据评分细则的详细程度选择量表粒度：
- 1-3：带中立选项的二元量表，认知负担最低
- 1-5：标准李克特量表，在粒度和可靠性之间达到最佳平衡
- 1-10：仅在每个等级都有详细评分细则时使用，因为校准难度更高

**直接评分的提示词结构**：
```
You are an expert evaluator assessing response quality.

## Task
Evaluate the following response against each criterion.

## Original Prompt
{prompt}

## Response to Evaluate
{response}

## Criteria
{for each criterion: name, description, weight}

## Instructions
For each criterion:
1. Find specific evidence in the response
2. Score according to the rubric (1-{max} scale)
3. Justify your score with evidence
4. Suggest one specific improvement

## Output Format
Respond with structured JSON containing scores, justifications, and summary.
```

在评分提示词中，要求先提供证据再给出分数，以便评判器在输出数值前，必须依据输出中可观察到的特征作出决定。

### 成对比较实现

在每次成对评估中应用位置偏差缓解措施：

1. 首先运行确定性预检查：两个候选项必须满足相同的 schema、来源证据要求和范围约束。
2. 第一次评判：Response A 位于第一位，Response B 位于第二位。
3. 第二次评判：Response B 位于第一位，Response A 位于第二位。
4. 一致性检查：如果两次评判结果不一致，则返回 TIE，并降低置信度。
5. 最终结论：给出一致认定的获胜者、平均置信度，以及明确的平局决胜理由。

**成对比较的提示词结构**：
```
You are an expert evaluator comparing two AI responses.

## Critical Instructions
- Do NOT prefer responses because they are longer
- Do NOT prefer responses based on position (first vs second)
- Focus ONLY on quality according to the specified criteria
- Ties are acceptable when responses are genuinely equivalent

## Original Prompt
{prompt}

## Response A
{response_a}

## Response B
{response_b}

## Comparison Criteria
{criteria list}

## Instructions
1. Analyze each response independently first
2. Compare them on each criterion
3. Determine overall winner with confidence level

## Output Format
JSON with per-criterion comparison, overall winner, confidence (0-1), and reasoning.
```

**置信度校准** — 将置信度与位置一致性对应起来：
- 两轮评估结果一致：confidence = 各轮置信度的平均值
- 两轮评估结果不一致：confidence = 0.5，verdict = TIE

### 评分量规生成

生成评分量规，以降低相较于开放式评分的评估方差。除非已在目标评估集上进行测量，否则应将具体的方差降低幅度视为因工作负载而异。

**应包含以下评分量规组成部分**：
1. **等级描述**：明确界定每个分数等级的边界
2. **特征**：定义每个等级的可观察特征
3. **示例**：每个等级的代表性文本（可选，但很有价值）
4. **边界情况**：针对模棱两可情况的指导
5. **评分指南**：确保一致应用的一般原则

根据使用场景**设置严格程度校准**：
- **宽松**：通过门槛较低，适合鼓励迭代
- **均衡**：典型的生产环境要求
- **严格**：适用于安全关键型或高风险评估的高标准

根据领域调整评分量规——使用领域特定术语。代码可读性评分量规应提及变量、函数和注释。医疗准确性评分量规应涉及临床术语和证据标准。

## 实用指南

### 评估流水线设计

使用以下分层构建生产级评估系统：标准加载器（评分量规 + 权重） -> 主评分器（直接评分或成对比较） -> 偏差缓解（位置互换等） -> 置信度评分（校准） -> 输出（分数 + 理由 + 置信度）。完整的可视化布局请参阅[评估流水线图](./references/evaluation-pipeline.md)。

### 决策框架：直接评分与成对比较

应用以下决策树：

```
Is there an objective ground truth?
+-- Yes -> Direct Scoring
|   Examples: factual accuracy, instruction following, format compliance
|
+-- No -> Is it a preference or quality judgment?
    +-- Yes -> Pairwise Comparison
    |   Examples: tone, style, persuasiveness, creativity
    |
    +-- No -> Consider reference-based evaluation
        Examples: summarization (compare to source), translation (compare to reference)
```

### 扩展评估规模

对于大规模评估，请采用以下策略之一：

1. **LLM 评审组（PoLL）**：使用多个模型作为评审者，并汇总投票，以减少单个模型的偏差。成本更高，但对于高风险决策更可靠。

2. **分层评估**：使用快速且廉价的模型进行筛选，并使用昂贵的模型处理边界情况。需要对筛选阈值进行校准。

3. **人工参与闭环**：自动处理明确的情况，并将低置信度决策转交人工审核。设计反馈循环，以持续改进自动化评估。

## 示例

### 示例 1：准确性的直接评分

**输入**：
```
Prompt: "What causes seasons on Earth?"
Response: "Seasons are caused by Earth's tilted axis. As Earth orbits the Sun,
different hemispheres receive more direct sunlight at different times of year."
Criterion: Factual Accuracy (weight: 1.0)
Scale: 1-5
```

**输出**：
```json
{
  "criterion": "Factual Accuracy",
  "score": 5,
  "evidence": [
    "Correctly identifies axial tilt as primary cause",
    "Correctly explains differential sunlight by hemisphere",
    "No factual errors present"
  ],
  "justification": "Response accurately explains the cause of seasons with correct
scientific reasoning. Both the axial tilt and its effect on sunlight distribution
are correctly described.",
  "improvement": "Could add the specific tilt angle (23.5 degrees) for completeness."
}
```

### 示例 2：带位置交换的成对比较

**输入**：
```
Prompt: "Explain machine learning to a beginner"
Response A: [Technical explanation with jargon]
Response B: [Simple analogy-based explanation]
Criteria: ["clarity", "accessibility"]
```

**第一轮（A 在前）**：
```json
{ "winner": "B", "confidence": 0.8 }
```

**第二轮（B 在前）**：
```json
{ "winner": "A", "confidence": 0.6 }
```
（注意：胜者是 A，因为 B 位于第一个位置）

**映射后的第二轮结果**：
```json
{ "winner": "B", "confidence": 0.6 }
```

**最终结果**：
```json
{
  "winner": "B",
  "confidence": 0.7,
  "positionConsistency": {
    "consistent": true,
    "firstPassWinner": "B",
    "secondPassWinner": "B"
  }
}
```

### 示例 3：评分标准生成

**输入**：
```
criterionName: "Code Readability"
criterionDescription: "How easy the code is to understand and maintain"
domain: "software engineering"
scale: "1-5"
strictness: "balanced"
```

**输出**（节选）：
```json
{
  "levels": [
    {
      "score": 1,
      "label": "Poor",
      "description": "Code is difficult to understand without significant effort",
      "characteristics": [
        "No meaningful variable or function names",
        "No comments or documentation",
        "Deeply nested or convoluted logic"
      ]
    },
    {
      "score": 3,
      "label": "Adequate",
      "description": "Code is understandable with some effort",
      "characteristics": [
        "Most variables have meaningful names",
        "Basic comments present for complex sections",
        "Logic is followable but could be cleaner"
      ]
    },
    {
      "score": 5,
      "label": "Excellent",
      "description": "Code is immediately clear and maintainable",
      "characteristics": [
        "All names are descriptive and consistent",
        "Comprehensive documentation",
        "Clean, modular structure"
      ]
    }
  ],
  "edgeCases": [
    {
      "situation": "Code is well-structured but uses domain-specific abbreviations",
      "guidance": "Score based on readability for domain experts, not general audience"
    }
  ]
}
```

## 指南

1. **始终要求先提供证据，再给出分数**——证据优先的提示词可使判断更易于审核，并减少缺乏依据的数值评分

2. **在成对比较中始终交换位置**——单轮比较会受到位置偏差的影响

3. **使评分尺度的粒度与评分标准的具体程度相匹配**——如果没有详细的等级描述，请勿使用 1-10 分制

4. **区分客观标准与主观标准** - 客观标准使用直接评分，主观标准使用成对比较

5. **包含置信度分数** - 根据位置一致性和证据强度进行校准

6. **明确定义边界情况** - 模糊情形会导致最大的评估差异

7. **使用特定领域的评分细则** - 通用评分细则会产生泛化的（实用性较低的）评估结果

8. **根据人工判断进行验证** - 自动化评估只有在与人工评估相关时才有价值

9. **监控系统性偏差** - 按标准、响应类型和模型跟踪意见不一致的模式

10. **采用支持迭代的设计** - 评估系统可通过反馈循环不断改进

## 常见陷阱

1. **评分缺乏理由**：分数缺少依据，难以调试。始终要求在评分前提供基于证据的理由。

2. **单轮成对比较**：未交换位置时，位置偏差会使结果失真。始终交换位置评估两次，并检查一致性。

3. **标准负载过重**：同时衡量多个方面的标准会产生不可靠的分数。强制要求一个标准对应一个可衡量的方面。

4. **缺少边界情况指导**：如果没有明确说明，评估者对模糊情况的处理会不一致。在评分细则中纳入边界情况，并提供明确的判定规则。

5. **忽略置信度校准**：高置信度的错误判断比低置信度的错误判断更糟糕。根据位置一致性和证据强度校准置信度。

6. **评分细则漂移**：随着质量标准演变或模型能力提高，评分细则会逐渐失准。定期审查评分细则，并使用最新的人工标注示例重新锚定各评分等级。

7. **评估提示词敏感性**：评估提示词中的细微措辞变化可能导致分数显著波动。对评估提示词进行版本控制，并在部署提示词变更前运行回归测试。

8. **未受控的长度偏差**：即使更偏好简洁的响应，较长的响应仍会系统性地获得更高分。在评估提示词中加入明确的长度中立指令，并使用长度受控的测试对进行验证。

## 集成

此技能负责评判器设计和偏差缓解。相邻技能负责更广泛的质量关卡和基础设施：

- `evaluation`：通用确定性检查、回归套件、质量关卡和生产监控。
- `context-fundamentals`：评判器提示词的上下文结构。
- `tool-design`：评估工具的模式和错误处理。
- `context-optimization`：大规模评估的令牌和延迟效率。
- `harness-engineering`：自主循环中锁定的评估器接口和治理。

## 参考资料

内部参考资料：
- [LLM-as-Judge 实现模式](./references/implementation-patterns.md) - 阅读时机：从零开始构建评估流水线，或将 LLM 评判器集成到 CI/CD 中
- [偏差缓解技术](./references/bias-mitigation.md) - 阅读时机：评估结果呈现不一致或可疑的评分模式
- [指标选择指南](./references/metrics-guide.md) - 阅读时机：选择用于验证评估可靠性的统计指标
- [评估流水线图](./references/evaluation-pipeline.md) - 阅读时机：设计多阶段评估系统的架构

外部研究：
- [Eugene Yan：评估 LLM 评估器的有效性](https://eugeneyan.com/writing/llm-evaluators/) - 阅读时机：调研 LLM 评估领域的最新进展时
- [评判 LLM-as-a-Judge（Zheng 等，2023）](https://arxiv.org/abs/2306.05685) - 阅读时机：理解位置偏差和 MT-Bench 方法论时
- [G-Eval：使用 GPT-4 进行 NLG 评估（Liu 等，2023）](https://arxiv.org/abs/2303.16634) - 阅读时机：实现思维链评估评分时
- [大语言模型不是公平的评估器（Wang 等，2023）](https://arxiv.org/abs/2305.17926) - 阅读时机：诊断评估输出中的系统性偏差时

本合集中的相关技能：
- evaluation - 基础评估概念
- context-fundamentals - 评估提示词的上下文结构
- tool-design - 构建评估工具

---

## 技能元数据

**创建日期**：2025-12-24
**最后更新**：2026-05-15
**作者**：Agent Skills for Context Engineering Contributors
**版本**：2.1.0