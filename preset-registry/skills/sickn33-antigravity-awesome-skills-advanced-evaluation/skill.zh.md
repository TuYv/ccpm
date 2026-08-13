---
name: advanced-evaluation
description: This skill should be used when the user asks to "implement LLM-as-judge", "compare model outputs", "create evaluation rubrics", "mitigate evaluation bias", or mentions direct scoring, pairwise comparison, position bias, evaluation pipelines, or automated quality assessment.
risk: safe
source: community
date_added: 2026-03-18
---
# 高级评估

本技能覆盖了使用 LLM 作为评判者来评估 LLM 输出的生产级技术。它综合了学术论文、行业实践和实际落地经验中的研究，形成可执行的模式，用于构建可靠的评估体系。

**核心洞察**：LLM-as-a-Judge 不是单一技术，而是一个方法族，每种方法适用于不同的评估场景。选择合适的方法并缓解已知偏见，是本技能所培养的核心能力。

## 何时使用
在以下场景启动本技能：

- 构建用于 LLM 输出的自动化评估流水线
- 比较多个模型响应以选出最佳答案
- 在评估团队中建立一致的质量标准
- 调试出现不一致结果的评估系统
- 为提示词或模型变更设计 A/B 测试
- 为人工或自动化评估创建评分规则
- 分析自动化判断与人工判断之间的相关性

## 核心概念

### 评估分类法

评估方法可分为两大类，具有不同的可靠性特征：

**直接评分**：单个 LLM 在定义好的量表上对一个响应进行打分。  
- 适用场景：客观标准（事实准确性、遵循指令、毒性）
- 可靠性：对于定义清晰的标准为中高水平
- 失败模式：分数标定漂移、量表解释不一致

**两两对比**：一个 LLM 比较两个响应并选择更好者。  
- 适用场景：主观偏好（语气、风格、说服力）
- 可靠性：在偏好类评估中通常高于直接评分
- 失败模式：位置偏差、长度偏差

来自 MT-Bench 论文（Zheng 等，2023）的研究表明，在基于偏好的评估中，两两对比与人工评审者的一致性高于直接评分，而直接评分在具有明确真值的客观标准场景下依然合适。

### 偏差全景

LLM 评审者会表现出系统性偏差，必须主动进行缓解：

**位置偏差**：在两两对比中，位于首位的响应更易被偏好。缓解方式：交换位置评估两次，使用多数投票或一致性检查。

**长度偏差**：更长的响应即使质量不高也会被评得更高。缓解方式：提示中明确要求忽略长度，或使用长度归一化评分。

**自我强化偏差**：模型倾向于给自身输出更高分。缓解方式：使用不同模型分别负责生成与评估，或在说明中明确局限。

**冗长偏差**：冗长的解释即使无关也可能得分更高。缓解方式：使用针对标准的评分规则，惩罚无关细节。

**权威偏差**：自信、权威的语气可能被高分偏好，即使不准确。缓解方式：要求提供证据引用，增加事实核验层。

### 指标选择框架

根据评估任务结构选择指标：

| 任务类型 | 主要指标 | 次要指标 |
|-----------|-----------------|-------------------|
| 二分类（通过/失败） | Recall, Precision, F1 | Cohen's κ |
| 顺序量表（1-5评分） | Spearman's ρ, Kendall's τ | Cohen's κ（加权） |
| 两两偏好 | 一致率, 位置一致性 | 置信度校准 |
| 多标签 | Macro-F1, Micro-F1 | 各标签精确率/召回率 |

关键洞察：高绝对一致率并不如系统性的分歧模式重要。一个评审者在某些标准上持续偏离人类判断，比随机噪声更值得警惕。

## 评估方法

### 直接评分实现

直接评分需要三个要素：清晰标准、校准量表和结构化输出格式。

**标准定义模式**：
```
Criterion: [Name]
Description: [What this criterion measures]
Weight: [Relative importance, 0-1]
```

**量表校准**：
- 1-3 量表：带中性选项的二元式，认知负担最低
- 1-5 量表：标准 Likert 量表，细分度与可靠性平衡较好
- 1-10 量表：细分度高，但更难校准，仅在有详细评分规则时使用

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

**思维链要求**：所有评分提示必须要求在给出分数前先给出理由。研究显示这比先给分再给理由的做法可将可靠性提高 15% 到 25%。

### 两两对比实现

两两对比在偏好类评估中本质上更可靠，但需要偏差缓解。

**位置偏差缓解协议**：
1. 第一轮：响应 A 在第一位，响应 B 在第二位
2. 第二轮：响应 B 在第一位，响应 A 在第二位
3. 一致性检查：若两轮结果冲突，则返回 TIE 并降低置信度
4. 最终结论：选取一致胜者，并取平均置信度

**两两对比的提示词结构**：
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

**置信度校准**：置信度应反映位置一致性：
- 两次评估一致：置信度 = 个体置信度平均值
- 两次评估不一致：置信度 = 0.5，结论 = TIE

### 评分规则生成

与开放式评分相比，定义良好的规则可将评估方差降低 40% 到 60%。

**评分规则组成**：
1. **级别说明**：每个分数等级的清晰边界
2. **特征描述**：定义每个等级的可观察特征
3. **示例**：每个级别的代表性文本（非必需但很有价值）
4. **边界场景**：对模糊情况的处理指南
5. **评分指导**：确保一致应用的通用原则

**严格度校准**：
- **宽松**：通过分数门槛较低，适合鼓励迭代
- **平衡**：公平、面向生产环境的常规期望
- **严格**：高标准，适合安全关键或高风险评估

**领域适配**：评分规则应采用领域特定术语。一个“代码可读性”规则会涉及变量、函数和注释；一个“医学准确性”规则会涉及临床术语和证据标准。

## 实践指导

### 评估流水线设计

生产级评估系统需要多层结构：

````
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
````

### 常见反模式

**反模式：未附带理由的评分**  
- 问题：评分缺乏依据，难以调试或改进  
- 解决方案：始终在评分前要求基于证据的理由

**反模式：单次成对比较**  
- 问题：位置偏差会污染结果  
- 解决方案：始终交换位置并检查一致性

**反模式：过载标准**  
- 问题：衡量多项内容的标准不可靠  
- 解决方案：一个标准 = 一个可衡量方面

**反模式：缺少边界情况指引**  
- 问题：评估者在模糊案例上处理不一致  
- 解决方案：在评分量表中包含边界情况并给出明确指引

**反模式：忽视置信度校准**  
- 问题：高置信度错误判断比低置信度错误更严重  
- 解决方案：将置信度与位置一致性和证据强度校准

### 决策框架：直接评分与成对比较

使用以下决策树：

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

### 评估扩展

对于大规模评估：

1. **Panel of LLMs (PoLL)**：使用多个模型作为评委，汇总投票  
   - 减少单一模型偏差  
   - 成本更高，但对高风险决策更可靠

2. **分层评估**：使用快速低成本模型进行筛选，用高成本模型处理边界案例  
   - 适合大规模场景下的成本效益  
   - 需要校准筛选阈值

3. **人工在环**：明确案例自动评估，低置信度案例由人工复核  
   - 关键应用下可靠性最好  
   - 设计反馈闭环以改进自动评估

## 示例

### 示例 1：准确性直接评分

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
  "improvement": "Could add the specific tilt angle (23.5°) for completeness."
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

**第一次（A 在前）**：
```json
{ "winner": "B", "confidence": 0.8 }
```

**第二次（B 在前）**：
```json
{ "winner": "A", "confidence": 0.6 }
```
（注意：获胜者为 A，因为 B 最初在第一个位置）

**映射后的第二次结果**：
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

### 示例 3：评分量表生成

**输入**：
```  
criterionName: "Code Readability"
criterionDescription: "How easy the code is to understand and maintain"
domain: "software engineering"
scale: "1-5"
strictness: "balanced"
```

**输出**（摘要）：
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

1. **始终在评分前要求理由** - 思维链提示可将可靠性提升 15%–25%

2. **成对比较时始终交换位置** - 单次比较会受位置偏差影响

3. **将评分粒度与量表细化程度匹配** - 不要使用 1-10 而缺少详细等级说明

4. **区分客观与主观标准** - 客观标准使用直接评分，主观标准使用成对比较

5. **包含置信度分数** - 与位置一致性和证据强度校准

6. **明确界定边界情况** - 模糊情境会导致最大评估差异

7. **使用领域特定量表** - 通用量表会产生通用且不够有用的评估

8. **与人工判断进行校验** - 自动评估仅在与人工评估相关时有价值

9. **监控系统性偏差** - 按标准、响应类型、模型追踪分歧模式

10. **面向迭代设计** - 评估系统应通过反馈闭环持续改进

## 集成

该技能与以下内容集成：

- **context-fundamentals** - 评估提示需要有效的上下文结构
- **tool-design** - 评估工具需要合适的 schema 和错误处理
- **context-optimization** - 评估提示可优化以提高令牌效率
- **evaluation**（基础） - 该技能扩展了基础评估概念

## 参考资料

内部参考：
- LLM-as-Judge Implementation Patterns
- Bias Mitigation Techniques
- Metric Selection Guide

外部研究：
- [Eugene Yan：Evaluating the Effectiveness of LLM-Evaluators](https://eugeneyan.com/writing/llm-evaluators/)
- [Judging LLM-as-a-Judge (Zheng et al., 2023)](https://arxiv.org/abs/2306.05685)
- [G-Eval: NLG Evaluation using GPT-4 (Liu et al., 2023)](https://arxiv.org/abs/2303.16634)
- [Large Language Models are not Fair Evaluators (Wang et al., 2023)](https://arxiv.org/abs/2305.17926)

本合集中的相关技能：
- evaluation - 基础评估概念
- context-fundamentals - 评估提示的上下文结构
- tool-design - 构建评估工具

---

## 技能元数据

**创建时间**：2024-12-24  
**最后更新**：2024-12-24  
**作者**：Muratcan Koylan  
**版本**：1.0.0

## 局限性
- 仅在任务明确符合上述范围时使用该技能。  
- 不要将输出替代特定环境的验证、测试或专家审查。  
- 如缺少所需输入、权限、安全边界或成功标准，请停止并要求澄清。
