---
name: agent-evaluation
description: Evaluate and improve Claude Code commands, skills, and agents. Use when testing prompt effectiveness, validating context engineering choices, or measuring improvement quality.
---
# Claude Code 智能体的评估方法

评估智能体系统需要采用不同于传统软件甚至标准语言模型应用的方法。智能体会动态决策，每次运行的结果具有非确定性，而且通常不存在唯一正确答案。有效的评估必须考虑这些特性，同时提供可操作的反馈。稳健的评估框架能够推动持续改进、发现回归问题，并验证上下文工程方面的选择是否达到了预期效果。

## 核心概念

智能体评估需要采用以结果为中心的方法，同时考虑非确定性和多条有效路径。多维度评分标准可以涵盖各种质量方面：事实准确性、完整性、引用准确性、来源质量和工具使用效率。使用 LLM 作为评判者可以实现可扩展的评估，而人工评估则可以发现边缘情况。

关键在于，智能体可能会找到实现目标的其他路径——评估应判断它们是否在遵循合理流程的同时取得了正确的结果。

**性能驱动因素：95% 的发现**
对 BrowseComp 评估（用于测试浏览智能体查找难以获取的信息的能力）的研究发现，有三个因素可以解释 95% 的性能差异：

| 因素 | 可解释的方差 | 启示 |
|--------|-------------------|-------------|
| Token 使用量 | 80% | Token 越多，性能越好 |
| 工具调用次数 | ~10% | 更多探索会有所帮助 |
| 模型选择 | ~5% | 更好的模型会成倍提升效率 |

对 Claude Code 开发的启示：

- **Token 预算很重要**：应在符合实际情况的 Token 限制下进行评估
- **模型升级优于增加 Token**：与增加 Token 预算相比，升级模型能够带来更大的提升
- **多智能体验证**：验证将工作分配给具有独立上下文窗口的子智能体的架构

## 评估挑战

### 非确定性和多条有效路径

智能体可能会采用完全不同但都有效的路径来实现目标。一个智能体可能会搜索三个来源，而另一个则会搜索十个来源。它们可能使用不同的工具找到相同的答案。在这种情况下，检查特定步骤的传统评估方法会失效。

**解决方案**：解决方案是关注结果，而不是确切的执行路径。判断智能体是否通过合理的流程取得了正确的结果。

### 依赖上下文的失败

智能体的失败通常会以微妙的方式依赖于上下文。智能体可能在处理复杂查询时成功，却在处理简单查询时失败。它可能在使用一组工具时表现良好，但使用另一组工具时却失败。失败可能只有在长时间交互、上下文逐渐累积后才会出现。

**解决方案**：评估必须覆盖不同复杂程度，并测试长时间交互，而不能只测试孤立的查询。

### 综合质量维度

智能体质量并非单一维度。它包括事实准确性、完整性、连贯性、工具使用效率和流程质量。智能体可能在准确性方面得分很高，但在效率方面得分很低，反之亦然。

智能体可能在准确性方面得分很高，但在效率方面得分较低。

**解决方案**：评估量规必须涵盖多个维度，并根据使用场景设置适当的权重。

## 评估量规设计

### 多维量规

有效的量规应涵盖关键维度，并为各等级提供描述：

**指令遵循情况**（权重：0.30）

- 优秀（1.0）：精确遵循所有指令
- 良好（0.8）：存在不影响结果的轻微偏差
- 可接受（0.6）：遵循了主要指令，但遗漏了少量次要指令
- 较差（0.3）：忽略了重要指令
- 失败（0.0）：从根本上误解了任务

**输出完整性**（权重：0.25）

- 优秀：全面涵盖所有要求的方面
- 良好：涵盖大多数方面，仅有少量缺漏
- 可接受：涵盖关键方面，但存在一些缺漏
- 较差：缺少多个主要方面
- 失败：未处理根本性方面

**工具效率**（权重：0.20）

- 优秀：工具选择最优，调用次数最少
- 良好：工具选择得当，但存在轻微低效
- 可接受：使用了适当的工具，但存在一些冗余
- 较差：使用了错误的工具或调用次数过多
- 失败：严重误用工具或调用次数极度过多

**推理质量**（权重：0.15）

- 优秀：推理过程始终清晰且合乎逻辑
- 良好：推理总体合理，仅有少量缺漏
- 可接受：具备基本的推理过程
- 较差：推理不清晰或存在缺陷
- 失败：没有明显的推理过程

**响应连贯性**（权重：0.10）

- 优秀：结构良好，易于理解
- 良好：总体连贯，仅有少量问题
- 可接受：可以理解，但清晰度仍可提升
- 较差：难以理解
- 失败：不连贯

### 评分方法

将各维度的评估结果转换为数值分数（0.0 到 1.0），并应用适当的权重。计算加权总分。根据使用场景的要求设置通过阈值（一般用途通常为 0.7，关键操作通常为 0.85）。

## 评估方法

### 使用 LLM 作为评审者

使用 LLM 评估智能体输出具有良好的可扩展性，并能提供一致的判断。应设计能够涵盖所关注维度的评估提示词。基于 LLM 的评估可扩展至大型测试集，并提供一致的判断。关键在于设计能够涵盖所关注维度的有效评估提示词。

提供清晰的任务描述、智能体输出、标准答案（如有）、包含各等级描述的评估尺度，并要求给出结构化判断。

**评估提示词模板**：

```markdown
You are evaluating the output of a Claude Code agent.

## Original Task
{task_description}

## Agent Output
{agent_output}

## Ground Truth (if available)
{expected_output}

## Evaluation Criteria
For each criterion, assess the output and provide:
1. Score (1-5)
2. Specific evidence supporting your score
3. One improvement suggestion

### Criteria
1. Instruction Following: Did the agent follow all instructions?
2. Completeness: Are all requested aspects covered?
3. Tool Efficiency: Were appropriate tools used efficiently?
4. Reasoning Quality: Is the reasoning clear and sound?
5. Response Coherence: Is the output well-structured?

Provide your evaluation as a structured assessment with scores and justifications.
```

**思维链要求**：始终要求先给出理由，再给出分数。研究表明，与先打分的方法相比，这能将可靠性提高 15-25%。

### 人工评估

人工评估能够发现自动化评估遗漏的问题：

- 对异常查询生成的幻觉答案
- 对上下文的细微误解
- 自动化评估忽略的边缘情况
- 语气或处理方式方面的定性问题

在开发 Claude Code 时，请要求用户执行以下操作：

- 手动审查智能体的输出，以发现边缘情况
- 在不同复杂度级别中进行系统化抽样
- 跟踪失败模式，为提示词改进提供依据

### 最终状态评估

对于会生成产物（文件、配置、代码）的命令，应评估最终输出，而不是执行过程：

- 生成的代码能否正常运行？
- 配置是否有效？
- 输出是否符合要求？

## 测试集设计

**样本选择**
在开发过程中，从小规模样本开始。在智能体开发早期，由于存在大量容易取得的改进，任何变更都可能产生显著影响。小型测试集可以揭示较大的效果差异。

从真实使用模式中抽取样本。加入已知的边缘情况。确保覆盖不同的复杂度级别。

**复杂度分层**
测试集应涵盖不同的复杂度级别：简单（单次工具调用）、中等（多次工具调用）、复杂（大量工具调用、存在显著歧义）以及非常复杂（长时间交互、深度推理）。

## 上下文工程评估

### 测试提示词变体

迭代 Claude Code 提示词时，应进行系统化评估：

1. **基线**：在测试用例上运行当前提示词
2. **变体**：在相同用例上运行修改后的提示词
3. **比较**：衡量质量分数、令牌用量和效率
4. **分析**：确定哪些变更改善了哪些维度

### 测试上下文策略

应通过系统化评估来验证上下文工程方面的选择。在同一测试集上，使用不同的上下文策略运行智能体。比较质量分数、令牌用量和效率指标。

### 退化测试

通过在不同上下文长度下运行智能体，测试上下文退化对性能的影响。找出上下文开始引发问题的性能断崖点。确立安全运行限度。

## 高级评估：LLM 作为评判者

**关键洞见**：LLM 作为评判者并非单一技术，而是一系列方法，每种方法都适用于不同的评估场景。选择正确的方法并缓解已知偏差，是本技能所培养的核心能力。

### 评估方法分类

评估方法主要分为两类，它们具有不同的可靠性特征：

**直接评分**：由单个 LLM 按照明确定义的量表对一个回答进行评分。

- 最适合：客观标准（事实准确性、指令遵循情况、毒性）
- 可靠性：对于定义明确的标准，可靠性为中等到高
- 失效模式：评分校准漂移、对量表的理解不一致

**成对比较**：由 LLM 比较两个回答并选择更好的一个。

- 最适合：主观偏好（语气、风格、说服力）
- 可靠性：对于偏好评估，比直接评分更高
- 失效模式：位置偏差、长度偏差

MT-Bench 论文（Zheng 等，2023）的研究表明，在基于偏好的评估中，成对比较与人类评审者的判断一致性高于直接评分；而对于具有明确标准答案的客观标准，直接评分仍然适用。

### 偏差全景

LLM 评审者会表现出必须主动缓解的系统性偏差：

**位置偏差**：在成对比较中，位于第一位置的回答会受到优待。缓解措施：交换位置后评估两次，使用多数投票或一致性检查。

**长度偏差**：无论质量如何，较长的回答都会获得更高评分。缓解措施：在提示词中明确要求忽略长度，采用长度归一化评分。

**自我增强偏差**：模型会给自己的输出更高评分。缓解措施：使用不同的模型分别进行生成和评估，或者承认这一局限性。

**冗长偏差**：即使没有必要，详细解释也会获得更高评分。缓解措施：使用针对具体标准的评分规则，对无关细节进行扣分。

**权威偏差**：无论准确性如何，自信、权威的语气都会获得更高评分。缓解措施：要求引用证据，并增加事实核查层。

### 指标选择框架

根据评估任务的结构选择指标：

| 任务类型 | 主要指标 | 次要指标 |
|-----------|-----------------|-------------------|
| 二元分类（通过/失败） | 召回率、精确率、F1 | Cohen's κ |
| 有序量表（1-5 评分） | Spearman's ρ、Kendall's τ | Cohen's κ（加权） |
| 成对偏好 | 一致率、位置一致性 | 置信度校准 |
| 多标签 | Macro-F1、Micro-F1 | 各标签的精确率/召回率 |

关键洞见：较高的绝对一致性不如系统性分歧模式重要。与人类在特定标准上持续存在分歧的评审者，比仅存在随机噪声的评审者问题更严重。


## 评估指标参考

### 分类指标（通过/失败任务）

**精确率**：在所有被标记为通过的回答中，真正通过的比例是多少？

- 在误报成本较高时使用

**召回率**：在所有实际通过的回答中，我们识别出了多少？

- 在漏报成本较高时使用

**F1 分数**：精确率和召回率的调和平均值

- 用于取得平衡的单一数值总结

### 一致性指标（与人类判断比较）

**Cohen's Kappa**：对偶然一致性进行校正后的一致性
>
- > 0.8：几乎完全一致
- 0.6-0.8：高度一致
- 0.4-0.6：中度一致
- < 0.4：一般到较差的一致性

### 相关性指标（有序分数）

**Spearman's Rank Correlation**：排名之间的相关性
>
- > 0.9：相关性非常强
- 0.7-0.9：相关性强
- 0.5-0.7：相关性中等
- < 0.5：相关性弱

### 良好评估系统的指标

| 指标 | 良好 | 可接受 | 令人担忧 |
|--------|------|------------|------------|
| Spearman's rho | > 0.8 | 0.6-0.8 | < 0.6 |
| Cohen's Kappa | > 0.7 | 0.5-0.7 | < 0.5 |
| 位置一致性 | > 0.9 | 0.8-0.9 | < 0.8 |
| 长度与分数的相关性 | < 0.2 | 0.2-0.4 | > 0.4 |

## 评估方法

### 直接评分实现

直接评分需要三个组成部分：明确的标准、经过校准的量表，以及结构化的输出格式。

**标准定义模式**：

```
Criterion: [Name]
Description: [What this criterion measures]
Weight: [Relative importance, 0-1]
```

**量表校准**：

- 1-3 分量表：二元判断并提供中立选项，认知负担最低
- 1-5 分量表：标准李克特量表，在粒度和可靠性之间取得良好平衡
- 1-10 分量表：粒度高，但更难校准，仅应在有详细评分规则时使用

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

**思维链要求**：所有评分提示词都必须要求先给出理由，再给出分数。研究表明，与先评分的方法相比，这可以将可靠性提高 15-25%。

### 成对比较实现

对于基于偏好的评估，成对比较本质上更加可靠，但需要缓解偏差。

**位置偏差缓解协议**：

1. 第一轮：回答 A 位于第一位，回答 B 位于第二位
2. 第二轮：回答 B 位于第一位，回答 A 位于第二位
3. 一致性检查：如果两轮结果不一致，则返回 TIE 并降低置信度
4. 最终判定：将两轮置信度取平均值，确定一致的胜出者

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

**置信度校准**：置信度分数应反映位置一致性：

- 两轮结果一致：置信度 = 各轮置信度的平均值
- 两轮结果不一致：置信度 = 0.5，判定结果 = TIE

## 评分规则生成

与开放式评分相比，定义良好的评分规则可将评估方差降低 40-60%。

### 评分规则组成部分

1. **等级描述**：明确界定每个分数等级的边界
2. **特征**：定义每个等级的可观察特征
3. **示例**：每个等级的代表性输出（如有可能）
4. **边界情况**：针对模糊情况的指导
5. **评分指南**：确保一致应用的一般原则

### 严格度校准

- **宽松**：较低的评分通过门槛，适合用于鼓励迭代
- **均衡**：公平且符合生产环境中的典型预期
- **严格**：高标准，适合安全关键型或高风险评估

### 领域适配

评分标准应使用特定领域的术语：

- “代码可读性”评分标准会提及变量、函数和注释。
- 文档评分标准关注清晰度、准确性和完整性
- 分析评分标准关注深度、准确性和可操作性

## 实用指南

### 评估流水线设计

生产环境中的评估系统需要多个层次：

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

### 避免评估陷阱

**反模式：评分时不提供理由**

- 问题：评分缺乏依据，难以调试或改进
- 解决方案：始终要求在评分前提供基于证据的理由

**反模式：单次成对比较**

- 问题：位置偏差会影响结果
- 解决方案：始终交换位置并检查一致性

**反模式：标准负载过重**

- 问题：衡量多个方面的标准并不可靠
- 解决方案：一个标准 = 一个可衡量的方面

**反模式：缺少边界情况指导**

- 问题：评估者对模糊情况的处理方式不一致
- 解决方案：在评分标准中纳入边界情况，并提供明确指导

**反模式：忽略置信度校准**

- 问题：高置信度的错误判断比低置信度的错误判断更糟糕
- 解决方案：根据位置一致性和证据强度校准置信度

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

### 扩展评估规模

对于大规模评估：

1. **LLM 评审小组（PoLL）**：使用多个模型作为评审，并汇总投票结果
   - 减少单个模型的偏差
   - 成本更高，但对于高风险决策更可靠

2. **分层评估**：使用快速、低成本的模型进行筛选，使用昂贵的模型处理边缘案例
   - 对于大规模评估具有较高的成本效益
   - 需要校准筛选阈值

3. **人在回路**：对明确的案例进行自动评估，对低置信度案例进行人工审核
   - 对于关键应用具有最佳可靠性
   - 设计反馈闭环以改进自动评估


## 示例

### 示例 1：针对准确性的直接评分

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

**第一次评估（A 在前）**：
```json
{ "winner": "B", "confidence": 0.8 }
```

**第二次评估（B 在前）**：
```json
{ "winner": "A", "confidence": 0.6 }
```
（注意：胜者为 A，因为 B 位于第一个位置）

**映射后的第二次评估**：
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

**输出**（已缩略）：
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

### 迭代改进工作流

1. **识别弱点**：通过评估找出智能体表现不佳之处
2. **推测原因**：问题出在提示词、上下文还是示例？
3. **修改提示词**：根据假设进行有针对性的修改
4. **重新评估**：使用修改后的提示词运行相同的测试用例
5. **比较**：修改是否改善了目标维度？
6. **检查回归**：其他维度是否受到影响？
7. **迭代**：重复以上步骤，直到质量达到阈值


## 指南

1. **始终要求先给出理由再评分**——思维链提示可将可靠性提高 15-25%

2. **在成对比较中始终交换位置**——单次比较会受到位置偏差的干扰

3. **使评分尺度的粒度与评分标准的具体程度相匹配**——如果没有详细的等级描述，就不要使用 1-10 分制

4. **区分客观标准和主观标准**——客观标准使用直接评分，主观标准使用成对比较

5. **包含置信度评分**——根据位置一致性和证据强度进行校准

6. **明确定义边界情况**——模棱两可的情况会导致最大的评估差异

7. **使用特定领域的评分标准**——通用评分标准会产生泛泛的（实用性较低的）评估

8. **依据人类判断进行验证**——只有当自动评估与人类评估相关时，它才有价值

9. **监控系统性偏差**——按标准和响应类型跟踪意见不一致的模式

10. **以迭代为导向进行设计**——评估系统会通过反馈循环得到改进

## 示例：评估 Claude Code 命令

假设你创建了一个 `/refactor` 命令，并希望评估其质量：

**测试用例**：

1. 简单：在单个文件中重命名一个变量
2. 中等：从现有代码中提取一个函数
3. 复杂：重构一个类以使用新的设计模式
4. 非常复杂：重构模块依赖关系

**评估标准**：

- 正确性：重构后的代码能正常工作吗？
- 完整性：是否更新了所有实例？
- 风格：是否遵循项目约定？
- 效率：是否避免了不必要的更改？

**评估提示词**：

```markdown
Evaluate this refactoring output:

Original Code:
{original}

Refactored Code:
{refactored}

Request:
{user_request}

Score 1-5 on each dimension with evidence:
1. Correctness: Does the code still work correctly?
2. Completeness: Were all relevant instances updated?
3. Style: Does it follow the project's coding patterns?
4. Efficiency: Were only necessary changes made?

Provide scores with specific evidence from the code.
```

**迭代**：
如果评估发现该命令经常遗漏实例：

1. 添加明确指令："Search the entire codebase for all occurrences"
2. 使用相同的测试用例重新评估
3. 比较完整性评分
4. 检查正确性是否出现回归



# LLM 评估的偏差缓解技术

本参考资料详细介绍了缓解 LLM 即裁判系统中已知偏差的具体技术。

## 位置偏差

### 问题

在成对比较中，LLM 会系统性地偏好处于特定位置的响应。研究表明：
- GPT 存在轻微的首位偏差（在平局情况下约有 55% 的概率偏好第一个位置）
- Claude 也表现出类似的模式
- 较小的模型通常表现出更强的偏差

### 缓解措施：位置交换协议

```python
async def position_swap_comparison(response_a, response_b, prompt, criteria):
    # Pass 1: Original order
    result_ab = await compare(response_a, response_b, prompt, criteria)
    
    # Pass 2: Swapped order
    result_ba = await compare(response_b, response_a, prompt, criteria)
    
    # Map second result (A in second position → B in first)
    result_ba_mapped = {
        'winner': {'A': 'B', 'B': 'A', 'TIE': 'TIE'}[result_ba['winner']],
        'confidence': result_ba['confidence']
    }
    
    # Consistency check
    if result_ab['winner'] == result_ba_mapped['winner']:
        return {
            'winner': result_ab['winner'],
            'confidence': (result_ab['confidence'] + result_ba_mapped['confidence']) / 2,
            'position_consistent': True
        }
    else:
        # Disagreement indicates position bias was a factor
        return {
            'winner': 'TIE',
            'confidence': 0.5,
            'position_consistent': False,
            'bias_detected': True
        }
```

### 替代方案：多次打乱顺序

为了获得更高的可靠性，请使用多种位置排序：

```python
async def multi_shuffle_comparison(response_a, response_b, prompt, criteria, n_shuffles=3):
    results = []
    for i in range(n_shuffles):
        if i % 2 == 0:
            r = await compare(response_a, response_b, prompt, criteria)
        else:
            r = await compare(response_b, response_a, prompt, criteria)
            r['winner'] = {'A': 'B', 'B': 'A', 'TIE': 'TIE'}[r['winner']]
        results.append(r)
    
    # Majority vote
    winners = [r['winner'] for r in results]
    final_winner = max(set(winners), key=winners.count)
    agreement = winners.count(final_winner) / len(winners)
    
    return {
        'winner': final_winner,
        'confidence': agreement,
        'n_shuffles': n_shuffles
    }
```

## 长度偏差

### 问题

无论质量如何，LLM 都倾向于给较长的响应更高的评分。这表现为：
- 冗长的响应获得虚高的分数
- 简洁但完整的响应受到惩罚
- 填充内容和重复内容反而得到奖励

### 缓解措施：明确提示

在提示词中加入反长度偏差指令：

```
CRITICAL EVALUATION GUIDELINES:
- Do NOT prefer responses because they are longer
- Concise, complete answers are as valuable as detailed ones
- Penalize unnecessary verbosity or repetition
- Focus on information density, not word count
```

### 缓解措施：长度归一化评分

```python
def length_normalized_score(score, response_length, target_length=500):
    """Adjust score based on response length."""
    length_ratio = response_length / target_length
    
    if length_ratio > 2.0:
        # Penalize excessively long responses
        penalty = (length_ratio - 2.0) * 0.1
        return max(score - penalty, 1)
    elif length_ratio < 0.3:
        # Penalize excessively short responses
        penalty = (0.3 - length_ratio) * 0.5
        return max(score - penalty, 1)
    else:
        return score
```

### 缓解措施：单独设置长度标准

将长度设为单独、明确的标准，避免其受到隐性奖励：

```python
criteria = [
    {"name": "Accuracy", "description": "Factual correctness", "weight": 0.4},
    {"name": "Completeness", "description": "Covers key points", "weight": 0.3},
    {"name": "Conciseness", "description": "No unnecessary content", "weight": 0.3}  # Explicit
]
```

## 自我增强偏差

### 问题

模型会对自身（或相似模型）生成的输出给出高于其他模型所生成输出的评分。

### 缓解措施：跨模型评估

使用与生成模型不同的模型家族进行评估：

```python
def get_evaluator_model(generator_model):
    """Select evaluator to avoid self-enhancement bias."""
    if 'gpt' in generator_model.lower():
        return 'claude-4-5-sonnet'
    elif 'claude' in generator_model.lower():
        return 'gpt-5.2'
    else:
        return 'gpt-5.2'  # Default
```

### 缓解措施：盲评

评估前移除回复中的模型归属信息：

```python
def anonymize_response(response, model_name):
    """Remove model-identifying patterns."""
    patterns = [
        f"As {model_name}",
        "I am an AI",
        "I don't have personal opinions",
        # Model-specific patterns
    ]
    anonymized = response
    for pattern in patterns:
        anonymized = anonymized.replace(pattern, "[REDACTED]")
    return anonymized
```

## 冗长偏差

### 问题

即使额外细节无关或不正确，详尽的解释也会获得更高的评分。

### 缓解措施：相关性加权评分

```python
async def relevance_weighted_evaluation(response, prompt, criteria):
    # First, assess relevance of each segment
    relevance_scores = await assess_relevance(response, prompt)
    
    # Weight evaluation by relevance
    segments = split_into_segments(response)
    weighted_scores = []
    for segment, relevance in zip(segments, relevance_scores):
        if relevance > 0.5:  # Only count relevant segments
            score = await evaluate_segment(segment, prompt, criteria)
            weighted_scores.append(score * relevance)
    
    return sum(weighted_scores) / len(weighted_scores)
```

### 缓解措施：在评分标准中加入冗长惩罚

在评分标准中明确加入冗长惩罚：

```python
rubric_levels = [
    {
        "score": 5,
        "description": "Complete and concise. All necessary information, nothing extraneous.",
        "characteristics": ["Every sentence adds value", "No repetition", "Appropriately scoped"]
    },
    {
        "score": 3,
        "description": "Complete but verbose. Contains unnecessary detail or repetition.",
        "characteristics": ["Main points covered", "Some tangents", "Could be more concise"]
    },
    # ... etc
]
```

## 权威偏差

### 问题

无论准确性如何，自信、权威的语气都会获得更高的评分。

### 缓解措施：证据要求

要求为各种主张提供明确证据：

```
For each claim in the response:
1. Identify whether it's a factual claim
2. Note if evidence or sources are provided
3. Score based on verifiability, not confidence

IMPORTANT: Confident claims without evidence should NOT receive higher scores than 
hedged claims with evidence.
```

### 缓解措施：事实核查层

在评分前添加事实核查步骤：

```python
async def fact_checked_evaluation(response, prompt, criteria):
    # Extract claims
    claims = await extract_claims(response)
    
    # Fact-check each claim
    fact_check_results = await asyncio.gather(*[
        verify_claim(claim) for claim in claims
    ])
    
    # Adjust score based on fact-check results
    accuracy_factor = sum(r['verified'] for r in fact_check_results) / len(fact_check_results)
    
    base_score = await evaluate(response, prompt, criteria)
    return base_score * (0.7 + 0.3 * accuracy_factor)  # At least 70% of score
```

## 聚合偏差检测

监控生产环境中的系统性偏差：

```python
class BiasMonitor:
    def __init__(self):
        self.evaluations = []
    
    def record(self, evaluation):
        self.evaluations.append(evaluation)
    
    def detect_position_bias(self):
        """Detect if first position wins more often than expected."""
        first_wins = sum(1 for e in self.evaluations if e['first_position_winner'])
        expected = len(self.evaluations) * 0.5
        z_score = (first_wins - expected) / (expected * 0.5) ** 0.5
        return {'bias_detected': abs(z_score) > 2, 'z_score': z_score}
    
    def detect_length_bias(self):
        """Detect if longer responses score higher."""
        from scipy.stats import spearmanr
        lengths = [e['response_length'] for e in self.evaluations]
        scores = [e['score'] for e in self.evaluations]
        corr, p_value = spearmanr(lengths, scores)
        return {'bias_detected': corr > 0.3 and p_value < 0.05, 'correlation': corr}
```

## 汇总表

| 偏差 | 主要缓解措施 | 次要缓解措施 | 检测方法 |
|------|-------------------|---------------------|------------------|
| 位置 | 位置互换 | 多次打乱 | 一致性检查 |
| 长度 | 明确提示 | 长度归一化 | 长度与分数的相关性 |
| 自我强化 | 跨模型评估 | 匿名化 | 模型对比研究 |
| 冗长 | 相关性加权 | 评分标准惩罚 | 相关性评分 |
| 权威性 | 证据要求 | 事实核查层 | 置信度与准确性的相关性 |

# Claude Code 的 LLM 评审器实现模式

本参考资料提供了实用的提示模式和工作流，用于在开发过程中评估 Claude Code 的命令、技能和智能体。

## 模式 1：结构化评估工作流

最可靠的评估遵循一种将各项关注点分离的结构化工作流：

```
Define Criteria → Gather Test Cases → Run Evaluation → Mitigate Bias → Interpret Results
```

### 第 1 步：定义评估标准

在评估之前，先制定明确的标准。以可复用的格式记录这些标准：

```markdown
## Evaluation Criteria for [Command/Skill Name]

### Criterion 1: Instruction Following (weight: 0.30)
- **Description**: Does the output follow all explicit instructions?
- **1 (Poor)**: Ignores or misunderstands core instructions
- **3 (Adequate)**: Follows main instructions, misses some details
- **5 (Excellent)**: Follows all instructions precisely

### Criterion 2: Output Completeness (weight: 0.25)
- **Description**: Are all requested aspects covered?
- **1 (Poor)**: Major aspects missing
- **3 (Adequate)**: Core aspects covered with gaps
- **5 (Excellent)**: All aspects thoroughly addressed

### Criterion 3: Tool Efficiency (weight: 0.20)
- **Description**: Were appropriate tools used efficiently?
- **1 (Poor)**: Wrong tools or excessive redundant calls
- **3 (Adequate)**: Appropriate tools with some redundancy
- **5 (Excellent)**: Optimal tool selection, minimal calls

### Criterion 4: Reasoning Quality (weight: 0.15)
- **Description**: Is the reasoning clear and sound?
- **1 (Poor)**: No apparent reasoning or flawed logic
- **3 (Adequate)**: Basic reasoning present
- **5 (Excellent)**: Clear, logical reasoning throughout

### Criterion 5: Response Coherence (weight: 0.10)
- **Description**: Is the output well-structured and clear?
- **1 (Poor)**: Difficult to follow or incoherent
- **3 (Adequate)**: Understandable but could be clearer
- **5 (Excellent)**: Well-structured, easy to follow
```

### 第 2 步：创建测试用例

按复杂度级别组织测试用例：

```markdown
## Test Cases for /refactor Command

### Simple (Single Operation)
- **Input**: Rename variable `x` to `count` in a single file
- **Expected**: All instances renamed, code still runs
- **Complexity**: Low

### Medium (Multiple Operations)
- **Input**: Extract function from 20-line code block
- **Expected**: New function created, original call site updated, behavior preserved
- **Complexity**: Medium

### Complex (Cross-File Changes)
- **Input**: Refactor class to use Strategy pattern
- **Expected**: Interface created, implementations separated, all usages updated
- **Complexity**: High

### Edge Case
- **Input**: Refactor code with conflicting variable names in nested scopes
- **Expected**: Correct scoping preserved, no accidental shadowing
- **Complexity**: Edge case
```

### 第 3 步：运行直接评分评估

使用此提示词模板评估单个输出：

```markdown
You are evaluating the output of a Claude Code command.

## Original Task
{paste the user's original request}

## Command Output
{paste the full command output including tool calls}

## Evaluation Criteria
{paste your criteria definitions from Step 1}

## Instructions
For each criterion:
1. Find specific evidence in the output that supports your assessment
2. Assign a score (1-5) based on the rubric levels
3. Write a 1-2 sentence justification citing the evidence
4. Suggest one specific improvement

IMPORTANT: Provide your justification BEFORE stating the score. This improves evaluation reliability.

## Output Format
For each criterion, respond with:

### [Criterion Name]
**Evidence**: [Quote or describe specific parts of the output]
**Justification**: [Explain how the evidence maps to the rubric level]
**Score**: [1-5]
**Improvement**: [One actionable suggestion]

### Overall Assessment
**Weighted Score**: [Calculate: sum of (score × weight)]
**Pass/Fail**: [Pass if weighted score ≥ 3.5]
**Summary**: [2-3 sentences summarizing strengths and weaknesses]
```

### 第 4 步：减少比较中的位置偏差

比较两个提示词变体（A 与 B）时，请使用以下两轮工作流：

**第一轮（A 在前）：**
```markdown
You are comparing two outputs from different prompt variants.

## Original Task
{task description}

## Output A (First Variant)
{output from prompt variant A}

## Output B (Second Variant)
{output from prompt variant B}

## Comparison Criteria
- Instruction Following
- Output Completeness
- Reasoning Quality

## Critical Instructions
- Do NOT prefer outputs because they are longer
- Do NOT prefer outputs based on their position (first vs second)
- Focus ONLY on quality differences
- TIE is acceptable when outputs are equivalent

## Analysis Process
1. Analyze Output A independently: [strengths, weaknesses]
2. Analyze Output B independently: [strengths, weaknesses]
3. Compare on each criterion
4. Determine winner with confidence (0-1)

## Output
Reasoning: [Explain why]
Winner: [A/B/TIE]
Confidence: [0.0-1.0]
```

**第二轮（B 在前）：**
重复使用相同的提示词，但交换顺序——将输出 B 放在前面，将输出 A 放在后面。

**结果解读：**
- 如果两轮结果一致 → 确认获胜者，并取置信度的平均值
- 如果两轮结果不一致 → 结果为平局，置信度为 0.5（检测到位置偏差）

## 模式 2：分层评估工作流

对于复杂评估，请采用分层方法：

```
Quick Screen (cheap model) → Detailed Evaluation (expensive model) → Human Review (edge cases)
```

### 第 1 层：快速筛选（使用 Haiku）

```markdown
Rate this command output 0-10 for basic adequacy.

Task: {brief task description}
Output: {command output}

Quick assessment: Does this output reasonably address the task?
Score (0-10):
One-line reasoning:
```

**决策规则**：分数 < 5 → 失败，分数 ≥ 7 → 通过，分数为 5-7 → 升级至详细评估

### 第 2 层：详细评估（使用 Opus）

对于临界案例，使用模式 1 中完整的直接评分提示词。

### 第 3 层：人工审核

对于低置信度的自动评估（置信度 < 0.6），将其加入人工审核队列：

```markdown
## Human Review Request

**Automated Score**: 3.2/5 (Confidence: 0.45)
**Reason for Escalation**: Low confidence, evaluator disagreed across passes

### What to Review
1. Does the output actually complete the task?
2. Are the automated criterion scores reasonable?
3. What did the automation miss?

### Original Task
{task}

### Output
{output}

### Automated Assessment
{paste automated evaluation}

### Human Override
[ ] Agree with automation
[ ] Override to PASS - Reason: ___
[ ] Override to FAIL - Reason: ___
```

## 模式 3：LLM 评审团（PoLL）

对于高风险评估，请使用多个模型::

### 工作流

1. **运行 3 次独立评估**，分别采用不同的提示词框架：
   - 评估 1：标准评判标准提示词
   - 评估 2：对抗性框架（“找出此输出存在的问题”）
   - 评估 3：用户视角（“开发者会满意吗？”）

2. **汇总结果**：
   - 取每项标准分数的中位数（不易受异常值影响）
   - 标记方差较高（std > 1.0）的标准以供审核
   - 总体通过需要获得多数一致同意

### 多评审提示词变体

**标准框架：**
```markdown
Evaluate this output against the specified criteria. Be fair and balanced.
```

**对抗性框架：**
```markdown
Your role is to find problems with this output. Be critical and thorough.
Look for: factual errors, missing requirements, inefficiencies, unclear explanations.
```

**用户视角：**
```markdown
Imagine you're a developer who requested this task.
Would you be satisfied with this result? Would you need to redo any work?
```

### 一致性分析

运行所有评审后，检查一致性：

| 标准 | 评审 1 | 评审 2 | 评审 3 | 中位数 | 标准差 |
|-----------|---------|---------|---------|--------|---------|
| 指令遵循情况 | 4 | 4 | 5 | 4 | 0.58 |
| 完整性 | 3 | 4 | 3 | 3 | 0.58 |
| 工具效率 | 2 | 3 | 4 | 3 | 1.00 ⚠️ |

工具效率存在**⚠️ 高方差**，这表明该标准需要更清晰的定义，或者输出在效率方面存在模糊特征。

## 模式 4：置信度校准

置信度分数应根据实际可靠性进行校准：

### 置信度因素

| 因素 | 高置信度 | 低置信度 |
|--------|-----------------|----------------|
| 位置一致性 | 两次评估结果一致 | 两次评估结果不一致 |
| 证据数量 | 3 条以上具体引用 | 引用模糊或无引用 |
| 标准一致性 | 所有标准的结果一致 | 各标准的分数差异较大 |
| 边界案例匹配度 | 与已知案例相似 | 新颖情形 |

### 补充校准提示词

将以下内容添加到评估提示词中：

```markdown
## Confidence Assessment

After scoring, assess your confidence:

1. **Evidence Strength**: How specific was the evidence you cited?
   - Strong: Quoted exact passages, precise observations
   - Moderate: General observations, reasonable inferences
   - Weak: Vague impressions, assumptions

2. **Criterion Clarity**: How clear were the criterion boundaries?
   - Clear: Easy to map output to rubric levels
   - Ambiguous: Output fell between levels
   - Unclear: Rubric didn't fit this case

3. **Overall Confidence**: [0.0-1.0]
   - 0.9+: Very confident, clear evidence, obvious rubric fit
   - 0.7-0.9: Confident, good evidence, minor ambiguity
   - 0.5-0.7: Moderate confidence, some ambiguity
   - <0.5: Low confidence, significant uncertainty

Confidence: [score]
Confidence Reasoning: [explain what factors affected confidence]
```

## 模式 5：结构化输出格式

要求使用一致的输出结构，以便更轻松地进行分析：

### 评估输出模板

```markdown
## Evaluation Results

### Metadata
- **Evaluated**: [command/skill name]
- **Test Case**: [test case ID or description]
- **Evaluator**: [model used]
- **Timestamp**: [when evaluated]

### Criterion Scores

| Criterion | Score | Weight | Weighted | Confidence |
|-----------|-------|--------|----------|------------|
| Instruction Following | 4/5 | 0.30 | 1.20 | 0.85 |
| Output Completeness | 3/5 | 0.25 | 0.75 | 0.70 |
| Tool Efficiency | 5/5 | 0.20 | 1.00 | 0.90 |
| Reasoning Quality | 4/5 | 0.15 | 0.60 | 0.75 |
| Response Coherence | 4/5 | 0.10 | 0.40 | 0.80 |

### Summary
- **Overall Score**: 3.95/5.0
- **Pass Threshold**: 3.5/5.0
- **Result**: ✅ PASS

### Evidence Summary
- **Strengths**: [bullet points]
- **Weaknesses**: [bullet points]
- **Improvements**: [prioritized suggestions]

### Confidence Assessment
- **Overall Confidence**: 0.78
- **Flags**: [any concerns or caveats]
```

## Claude Code 开发的评估工作流

### 工作流：测试新命令

1. **编写 5-10 个测试用例**，涵盖不同复杂度级别
2. **对每个测试用例运行命令**，捕获完整输出
3. **快速筛查**所有输出，进行第 1 层级评估
4. **详细评估**失败和临界案例
5. **识别失败模式**，以指导提示词改进
6. **根据发现的具体弱点迭代提示词**
7. **重新评估**相同的测试用例，以衡量改进效果

### 工作流：比较提示词变体

1. **创建提示词变体**（例如，使用不同的指令表述）
2. **在相同的测试用例上运行两个变体**
3. **进行成对比较**，并交换位置
4. **计算每个变体的胜率**
5. **分析**每个变体更擅长处理哪些案例
6. **做出决定**：选择胜出者或创建混合版本

### 工作流：回归测试

1. **维护测试套件**，包含具有代表性的案例
2. **变更前**：运行评估，记录基准分数
3. **变更后**：重新运行评估
4. **比较**：标记回归（分数下降 > 0.5）
5. **调查**：为什么特定案例出现了回归？
6. **接受或还原**：根据整体影响决定

### 工作流：持续质量监控

1. **对生产环境中的使用情况进行抽样**（如果可用）
2. **对样本运行轻量级评估**
3. **持续跟踪指标**：
   - 按评估标准统计的平均分数
   - 失败率
   - 低置信度率
4. **在质量下降时发出警报**：分数相比基准下降 > 10%
5. **定期深入分析**：每月对随机样本进行详细评估

## 应避免的反模式

### ❌ 评分缺乏依据
**问题**：分数缺乏支撑，难以调试
**解决方案**：评分前始终要求提供证据

### ❌ 单次成对比较
**问题**：位置偏差会破坏结果
**解决方案**：始终交换位置并检查一致性

### ❌ 评估标准过载
**问题**：同时衡量多个方面的标准并不可靠
**解决方案**：一个标准 = 一个可衡量的方面

### ❌ 缺少边缘案例指南
**问题**：评估者处理模糊案例的方式不一致
**解决方案**：在评分细则中纳入边缘案例，并提供明确指导

### ❌ 忽略低置信度
**问题**：根据不确定的评估采取行动会导致错误结论
**解决方案**：将低置信度案例升级至人工审核

### ❌ 通用评分细则
**问题**：通用标准会产生模糊且无用的评估
**解决方案**：创建特定领域的评分细则（代码命令与文档命令与分析命令）

## 处理评估失败

当评估失败或产生不可靠的结果时，请使用以下恢复策略：

### 忽略格式错误的输出

当评估器产生无法解析或不完整的输出时：

1. **标记为无效并在分析中忽略** - 输出不正确，通常意味着思考过程中出现了幻觉

2. **不做任何更改，重试初始提示词** - 多次重试通常比单次提示更一致

3. **如果仍然产生错误输出，则标记为需要人工审核**：标记为“评估失败，需要手动检查”，并加入队列以便稍后处理

### 验证清单

在信任评估结果之前，请验证：

- [ ] 所有标准的分数均在有效范围内（1-5）
- [ ] 每个分数都有引用具体证据的理由说明
- [ ] 已提供合理的置信度分数
- [ ] 理由说明与所给分数之间不存在矛盾
- [ ] 加权总分计算正确

## 验证评估提示词（元评估）

在生产环境中使用评估提示词之前，请使用已知案例对其进行测试：

### 校准测试案例

创建一小组质量水平已知的输出：

| 测试类型 | 描述 | 预期分数 |
|-----------|-------------|----------------|
| 已知优质 | 明显优秀的输出 | 4.5+ / 5.0 |
| 已知劣质 | 明显较差的输出 | < 2.5 / 5.0 |
| 边界案例 | 处于临界水平的案例 | 3.0-3.5，并附有细致的解释 |

### 验证工作流

1. **已知优质测试**：评估一份明显优秀的输出
   - 如果分数 < 4.0 → 评分细则过于严格，或证据要求不明确

2. **已知劣质测试**：评估一份明显较差的输出
   - 如果分数 > 3.0 → 评分细则过于宽松，或标准不够具体

3. **边界测试**：评估一个处于临界水平的案例
   - 应得出中等分数（3.0-3.5），并附有详细解释
   - 如果置信度很高地给出高分或低分 → 标准缺乏细致区分

4. **一致性测试**：对同一评估运行 3 次
   - 分数方差应 < 0.5
   - 如果方差更大 → 标准需要更严格的定义

### 位置偏差验证

在使用成对比较之前，测试是否存在位置偏差：

```markdown
## Position Bias Test

Run this test with IDENTICAL outputs in both positions:

Test Case: [Same output text]
Position A: [Paste output]
Position B: [Paste identical output]

Expected Result: TIE with high confidence (>0.9)

If Result Shows Winner:
- Position bias detected
- Add stronger anti-bias instructions to prompt
- Re-test until TIE achieved consistently
```

### 评估提示词迭代

当校准测试失败时：

1. **识别失败模式**：过于严格？过于宽松？不一致？
2. **调整具体的评分细则等级**：添加示例，明确边界
3. **重新运行校准测试**：所有 4 项测试都必须通过
4. **记录变更**：跟踪哪些调整提高了可靠性

# LLM 评估的指标选择指南

本参考资料提供了有关如何针对不同评估场景选择适当指标的指导。

## 指标类别

### 分类指标

用于二元或多类别评估任务（通过/失败、正确/错误）。

#### 精确率

```
Precision = True Positives / (True Positives + False Positives)
```

**解读**：在评判模型认定为优质的所有响应中，实际优质的响应占多大比例？

**适用场景**：误报的代价较高时（例如，批准不安全的内容）

#### 召回率

```
Recall = True Positives / (True Positives + False Negatives)
```

**解读**：在所有实际优质的响应中，评判模型识别出了多大比例？

**适用场景**：漏报的代价较高时（例如，在筛选过程中遗漏优质内容）

#### F1 分数

```
F1 = 2 * (Precision * Recall) / (Precision + Recall)
```

**解释**：精确率与召回率的调和平均数

**适用场景**：你需要用一个数值来平衡这两个方面

### 一致性指标

用于比较自动化评估与人工判断。

#### Cohen's Kappa（κ）

```
κ = (Observed Agreement - Expected Agreement) / (1 - Expected Agreement)
```

**解释**：经随机一致性校正后的一致性
- κ > 0.8：几乎完全一致
- κ 0.6-0.8：高度一致
- κ 0.4-0.6：中度一致
- κ < 0.4：一致性一般至较差

**适用于**：二元或类别判断

#### 加权 Kappa

适用于分歧严重程度很重要的有序量表：

**解释**：对较大分歧的惩罚高于较小分歧

### 相关性指标

适用于有序分数或连续分数。

#### Spearman 等级相关系数（ρ）

**解释**：衡量排名之间的相关性，而非绝对值之间的相关性
- ρ > 0.9：相关性非常强
- ρ 0.7-0.9：相关性强
- ρ 0.5-0.7：相关性中等
- ρ < 0.5：相关性弱

**适用场景**：顺序比精确值更重要

#### Kendall's Tau（τ）

**解释**：与 Spearman 类似，但基于成对一致性

**适用场景**：存在大量并列值

#### Pearson 相关系数（r）

**解释**：分数之间的线性相关性

**适用场景**：精确分数值很重要，而不仅仅是顺序

### 成对比较指标

#### 一致率

```
Agreement = (Matching Decisions) / (Total Comparisons)
```

**解释**：一致情况所占的简单百分比

#### 位置一致性

```
Consistency = (Consistent across position swaps) / (Total comparisons)
```

**解释**：交换位置会以多高的频率改变决策？

## 指标选择决策树

```
What type of evaluation task?
│
├── Binary classification (pass/fail)
│   └── Use: Precision, Recall, F1, Cohen's κ
│
├── Ordinal scale (1-5 rating)
│   ├── Comparing to human judgments?
│   │   └── Use: Spearman's ρ, Weighted κ
│   └── Comparing two automated judges?
│       └── Use: Kendall's τ, Spearman's ρ
│
├── Pairwise preference
│   └── Use: Agreement rate, Position consistency
│
└── Multi-label classification
    └── Use: Macro-F1, Micro-F1, Per-label metrics
```

## 按使用场景选择指标

### 使用场景 1：验证自动化评估

**目标**：确保自动化评估与人工判断相关

**推荐指标**：
1. 主要指标：Spearman's ρ（适用于有序量表）或 Cohen's κ（适用于类别判断）
2. 次要指标：各项标准的一致性
3. 诊断指标：用于识别系统性错误的混淆矩阵

### 使用场景 2：比较两个模型

**目标**：确定哪个模型能生成更好的输出

**推荐指标**：
1. 主要指标：胜率（来自成对比较）
2. 次要指标：位置一致性（偏差检查）
3. 诊断指标：各项标准的细分结果

### 使用场景 3：质量监控

**目标**：持续跟踪评估质量

**推荐指标**：
1. 主要指标：与人工抽查结果的滚动一致性
2. 次要指标：分数分布稳定性
3. 诊断指标：偏差指标（位置、长度）

## 解读指标结果

### 良好评估系统的指标

| 指标 | 良好 | 可接受 | 需关注 |
|--------|------|------------|------------|
| Spearman's ρ | > 0.8 | 0.6-0.8 | < 0.6 |
| Cohen's κ | > 0.7 | 0.5-0.7 | < 0.5 |
| 位置一致性 | > 0.9 | 0.8-0.9 | < 0.8 |
| 长度相关性 | < 0.2 | 0.2-0.4 | > 0.4 |

### 警示信号

1. **高一致度但低相关性**：可能表明存在校准问题
2. **位置一致性低**：位置偏差正在影响结果
3. **长度相关性高**：长度偏差导致分数虚高
4. **各标准之间存在差异**：某些标准可能定义不明确

## 报告模板

```markdown
## Evaluation System Metrics Report

### Human Agreement
- Spearman's ρ: 0.82 (p < 0.001)
- Cohen's κ: 0.74
- Sample size: 500 evaluations

### Bias Indicators
- Position consistency: 91%
- Length-score correlation: 0.12

### Per-Criterion Performance
| Criterion | Spearman's ρ | κ |
|-----------|--------------|---|
| Accuracy | 0.88 | 0.79 |
| Clarity | 0.76 | 0.68 |
| Completeness | 0.81 | 0.72 |

### Recommendations
- All metrics within acceptable ranges
- Monitor "Clarity" criterion - lower agreement may indicate need for rubric refinement
```