---
name: advanced-evaluation
description: This skill should be used when the user asks to "implement LLM-as-judge", "compare model outputs", "create evaluation rubrics", "mitigate evaluation bias", or mentions direct scoring, pairwise comparison, position bias, evaluation pipelines, or automated quality assessment.
risk: safe
source: community
date_added: 2026-03-18
---
# 高级评估

本技能涵盖了使用 LLM 作为裁判进行 LLM 输出评估的生产级技术。它将学术论文、行业实践和实际落地经验中的研究成果整合为可执行模式，用于构建可靠的评估体系。

**关键见解**：LLM-as-a-Judge 不是单一技术，而是一系列方法家族，每种方法适用于不同的评估场景。选择合适方法并缓解已知偏差，是本技能培养的核心能力。

## 何时使用
在以下场景启用本技能：

- 为 LLM 输出构建自动化评估流水线
- 比较多个模型回复以选择最佳版本
- 在评估团队之间建立一致的质量标准
- 调试出现结果不一致的评估系统
- 为提示词或模型变更设计 A/B 测试
- 为人工或自动化评估创建评分规范
- 分析自动化判断与人工判断之间的相关性

## 核心概念

### 评估分类

评估方法可分为两类，且具有不同的可靠性特征：

**直接评分**：单个 LLM 对单条回复按定义量表打分。
- 最适用：客观指标（事实准确性、指令遵循、毒性）
- 可靠性：对定义明确的指标通常为中到高
- 失效模式：评分标定漂移、量表解释不一致

**成对比较**：LLM 比较两条回复并选出更优者。
- 最适用：主观偏好（语气、风格、说服力）
- 可靠性：在偏好类评估中高于直接评分
- 失效模式：位置偏差、长度偏差

MT-Bench 论文（Zheng et al., 2023）的研究表明，在基于偏好的评估中，成对比较与人工评审的一致性高于直接评分，而在有明确真值的客观指标上，直接评分仍然合适。

### 偏差图谱

LLM 裁判会表现出需要主动缓解的系统性偏差：

**位置偏差**：在成对比较中，处于第一位的回复更容易被优待。缓解方式：交换顺序重复评估，使用多数票或一致性检查。

**长度偏差**：更长的回复即使质量不高也更容易被打更高分。缓解方式：明确提示忽略长度，进行长度归一化评分。

**自我强化偏差**：模型倾向于给自身输出更高评分。缓解方式：使用不同模型进行生成与评估，或明确承认该局限。

**冗长偏差**：不必要的详细解释会获得更高分。缓解方式：使用按标准细分的评分细则，对无关细节进行惩罚。

**权威偏差**：自信且权威的措辞会获得更高分，即便准确性不足。缓解方式：要求引用证据，引入事实核验层。

### 指标选择框架

根据评估任务结构选择指标：

| 任务类型 | 主要指标 | 次要指标 |
|-----------|----------|----------|
| 二分类（pass/fail） | Recall, Precision, F1 | Cohen's κ |
| 序数评分（1-5 评级） | Spearman's ρ, Kendall's τ | Cohen's κ（加权） |
| 成对偏好 | Agreement rate, Position consistency | Confidence calibration |
| 多标签 | Macro-F1, Micro-F1 | Per-label precision/recall |

核心见解：高绝对一致性比不上系统性的分歧模式。一种在特定标准上始终与人工判断分歧的裁判，比随机噪声更具问题。

## 评估方法

### 直接评分实现

直接评分需要三个要素：明确标准、标定量表、结构化输出格式。

**标准定义模式**：
```
Criterion: [Name]
Description: [What this criterion measures]
Weight: [Relative importance, 0-1]
```

**量表标定**：
- 1-3 量表：带中立选项的二分法，认知负荷最低
- 1-5 量表：标准 Likert 量表，颗粒度与可靠性平衡良好
- 1-10 量表：颗粒度高但更难标定，仅在有详细评分细则时使用

**直接评分的提示结构**：
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

**链式思考要求**：所有打分提示都必须先给出理由再给分。研究显示，这可比“先打分后解释”的方式提升 15-25% 的可靠性。

### 成对比较实现

成对比较在基于偏好的评估中天然更可靠，但需要进行偏差缓解。

**位置偏差缓解流程**：
1. 第一轮：回复 A 在第一位，回复 B 在第二位
2. 第二轮：回复 B 在第一位，回复 A 在第二位
3. 一致性检查：如果两轮结论不一致，返回 TIE 并降低置信度
4. 最终裁决：给出一致胜者，并使用平均置信度

**成对比较的提示结构**：
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

**置信度标定**：置信度应反映位置一致性：
- 两轮结论一致：置信度 = 各轮置信度平均值
- 两轮结论不一致：置信度 = 0.5，裁决 = TIE

### 评分细则生成

与开放式评分相比，定义清晰的评分细则可将评估方差降低 40-60%。

**评分细则组成**：
1. **分级说明**：每个分数档位的清晰边界
2. **特征**：定义每个档位的可观察特征
3. **示例**：每个档位的代表性文本（可选但有价值）
4. **边界案例**：处理歧义情境的指导
5. **评分指南**：确保一致应用的通用原则

**严格度标定**：
- **宽松**：通过分值门槛较低，适合于迭代过程中的激励
- **平衡**：公平、适用于生产环境的典型预期
- **严格**：标准更高，适合安全关键或高风险评估

**领域适配**：评分细则应使用领域特定术语。`code readability` 细则会提及变量、函数和注释。`medical accuracy` 细则会引用临床术语和证据标准。

## 实践指导

### 评估流水线设计

生产级评估系统需要多层结构：

```
┌─────────────────────────────────────────────────┐
│                 Evaluation Pipeline              │
├─────────────────────────────────────────────────┤
│                                                   │
│  Input: Response + Prompt + Context               │
│           │                                       │
│           ▼                                       │
│  ┌─────────────────────┐                         │
│  │   Criteria Loader   │ ◄── Rubrics, weights    │
│  └──────────┬──────────┘                         │
│             │                                     │
│             ▼                                     │
│  ┌─────────────────────┐                         │
│  │   Primary Scorer    │ ◄── Direct or Pairwise  │
│  └──────────┬──────────┘                         │
│             │                                     │
│             ▼                                     │
│  ┌─────────────────────┐                         │
│  │   Bias Mitigation   │ ◄── Position swap, etc. │
│  └──────────┬──────────┘                         │
│             │                                     │
│             ▼                                     │
│  ┌─────────────────────┐                         │
│  │ Confidence Scoring  │ ◄── Calibration         │
│  └──────────┬──────────┘                         │
│             │                                     │
│             ▼                                     │
│  Output: Scores + Justifications + Confidence     │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 常见反模式

**反模式：无依据评分**
- 问题：分数缺乏依据，难以调试或改进
- 解决方案：始终要求在评分前给出基于证据的理由

**反模式：单次成对比较**
- 问题：位置偏差会污染结果
- 解决方案：始终交换位置并检查一致性

**反模式：过载的评估标准**
- 问题：同时衡量多项内容的标准不可靠
- 解决方案：一个标准 = 一个可衡量方面

**反模式：缺少边界案例指导**
- 问题：评估者对模糊案例处理不一致
- 解决方案：在量表中加入边界案例并提供明确指导

**反模式：忽略置信度校准**
- 问题：高置信度却错误的判断比低置信度更糟
- 解决方案：根据位置一致性和证据强度校准置信度

### 决策框架：直接评分与成对比较

使用此决策树：

```
Is there an objective ground truth?
├── Yes → Direct Scoring
│   └── Examples: factual accuracy, instruction following, format compliance
│
└── No → Is it a preference or quality judgment?
    ├── Yes → Pairwise Comparison
    │   └── Examples: tone, style, persuasiveness, creativity
    │
    └── No → Consider reference-based evaluation
        └── Examples: summarization (compare to source), translation (compare to reference)
```

### 规模化评估

对于高量级评估：

1. **Panel of LLMs (PoLL)**：使用多个模型作为评委，汇总投票
   - 减少单一模型偏差
   - 成本更高，但对高风险决策更可靠

2. **分层评估**：用快速便宜的模型进行初筛，用昂贵模型处理边界案例
   - 成本效益高，适合大规模场景
   - 需要校准筛选阈值

3. **人工在环**：对明确案例自动化评估，对低置信案例进行人工复核
   - 对关键应用具有最佳可靠性
   - 设计反馈闭环以改进自动化评估

## 示例

### 示例 1：用于准确性的直接评分

**输入**:
```
Prompt: "What causes seasons on Earth?"
Response: "Seasons are caused by Earth's tilted axis. As Earth orbits the Sun, 
different hemispheres receive more direct sunlight at different times of year."
Criterion: Factual Accuracy (weight: 1.0)
Scale: 1-5
```

**输出**:
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
  "improvement": "Could add the specific tilt angle (23.5°) for completeness."
}
```

### 示例 2：带位置交换的成对比较

**输入**:
```
Prompt: "Explain machine learning to a beginner"
Response A: [Technical explanation with jargon]
Response B: [Simple analogy-based explanation]
Criteria: ["clarity", "accessibility"]
```

**第一次通过（A 在前）**:
```json
{ "winner": "B", "confidence": 0.8 }
```

**第二次通过（B 在前）**:
```json
{ "winner": "A", "confidence": 0.6 }
```
（注：赢家是 A，因为 B 出现在第一位）

**映射后的第二次通过**:
```json
{ "winner": "B", "confidence": 0.6 }
```

**最终结果**:
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

### 示例 3：量表生成

**输入**:
```
criterionName: "Code Readability"
criterionDescription: "How easy the code is to understand and maintain"
domain: "software engineering"
scale: "1-5"
strictness: "balanced"
```

**输出**（简化）:
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

1. **始终在评分前要求理由** - 链式思考提示可将可靠性提升 15-25%

2. **始终在成对比较中交换位置** - 单次比较会被位置偏差所干扰

3. **将量表粒度与量表细化程度匹配** - 没有详细分级说明时不要使用 1-10

4. **区分客观与主观标准** - 客观标准用直接评分，主观标准用成对比较

5. **包含置信分数** - 按位置一致性和证据强度进行校准

6. **明确界定边界案例** - 模糊情境是评估方差最大的来源

7. **使用领域特定量表** - 通用量表会产生通用（且不够有用）的评估结果

8. **与人工判断进行验证** - 自动化评估只有在与人工评估相关性高时才有价值

9. **监控系统性偏差** - 按标准、响应类型和模型追踪分歧模式

10. **面向迭代进行设计** - 评估系统可通过反馈闭环持续改进

## 集成

该技能与以下内容集成：

- **context-fundamentals** - 评估提示词需要有效的上下文结构
- **tool-design** - 评估工具需要合适的模式与错误处理
- **context-optimization** - 评估提示词可针对 token 效率进行优化
- **evaluation** (foundational) - 该技能扩展了基础评估概念

## 参考

内部参考：
- LLM-as-Judge Implementation Patterns
- Bias Mitigation Techniques
- Metric Selection Guide

外部研究：
- [Eugene Yan: Evaluating the Effectiveness of LLM-Evaluators](https://eugeneyan.com/writing/llm-evaluators/)
- [Judging LLM-as-a-Judge (Zheng et al., 2023)](https://arxiv.org/abs/2306.05685)
- [G-Eval: NLG Evaluation using GPT-4 (Liu et al., 2023)](https://arxiv.org/abs/2303.16634)
- [Large Language Models are not Fair Evaluators (Wang et al., 2023)](https://arxiv.org/abs/2305.17926)

本集合中的相关技能：
- evaluation - 基础评估概念
- context-fundamentals - 用于评估提示词的上下文结构
- tool-design - 构建评估工具

---

## 技能元数据

**创建时间**：2024-12-24
**最近更新**：2024-12-24
**作者**：Muratcan Koylan
**版本**：1.0.0

## 局限性
- 仅在任务明确符合上述范围时使用该技能。
- 不要将输出视为替代特定环境验证、测试或专家审核。
- 若缺少必要的输入、权限、安全边界或成功标准，应停止并请求澄清。
