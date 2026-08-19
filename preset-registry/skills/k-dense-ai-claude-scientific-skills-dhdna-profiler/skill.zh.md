---
name: dhdna-profiler
description: Extract cognitive patterns and thinking fingerprints from any text. Use this skill when the user wants to analyze how someone thinks, understand cognitive style, profile writing or speech patterns, compare thinking styles between people, asks "what's my thinking style", "analyze how this person reasons", "cognitive profile", "thinking pattern", "DHDNA", "digital DNA", or wants to understand the mind behind any text. Also trigger when the user provides text and wants deeper insight into the author's reasoning patterns, decision-making style, or cognitive signature.
allowed-tools: Read Write
license: MIT license
metadata:
  version: "1.1"
  skill-author: AHK Strategies (ashrafkahoush-ux)
---
# DHDNA 分析器 — 认知模式提取

一种用于提取任意文本作者认知指纹的结构化系统。基于数字人类 DNA（DHDNA）框架——该理论认为，每个心智都有一种独特的特征模式，并通过其推理、决策、价值判断和沟通方式表现出来。

已发表研究：[DHDNA 预印本（DOI: 10.5281/zenodo.18736629）](https://doi.org/10.5281/zenodo.18736629) | [IDNA Consolidation v2（DOI: 10.5281/zenodo.18807387）](https://doi.org/10.5281/zenodo.18807387)

## 核心概念

正如生物 DNA 通过碱基对编码生理身份一样，数字人类 DNA 通过思维模式编码认知身份。每个人在分析深度、创造范围、情绪处理、战略思维和伦理推理方面的组合，都会形成一种**独特的认知特征**——如同指纹一样具有辨识度。

分析器不会将思维评判为“好”或“坏”。它描绘的是一个心智运作方式的拓扑结构。

## 12 个认知维度

分析文本时，根据文本中的证据，为每个维度按 1–10 分进行评分：

| #   | 维度                     | 衡量内容                                               | 低分（1-3）                    | 高分（8-10）                         |
| --- | ------------------------ | ------------------------------------------------------ | ------------------------------ | ------------------------------------ |
| 1   | **分析深度**             | 逻辑严谨性、结构化推理、因果链                         | 直觉式、整体式、基于模式       | 系统化、以证明为导向、精确           |
| 2   | **创造范围**             | 连接的新颖性、隐喻运用、横向思维                       | 传统式、渐进式                 | 打破范式、跨领域综合                 |
| 3   | **情绪处理**             | 情绪词汇、共情信号、情感整合                           | 疏离、临床式                   | 情感丰富、融入感受                   |
| 4   | **语言精确性**           | 词汇复杂度、句子结构、修辞                             | 简单、直接                     | 结构复杂、细腻                       |
| 5   | **伦理推理**             | 价值观信号、公平意识、对后果的认知                     | 务实、注重结果                 | 原则驱动、以正义为导向               |
| 6   | **战略思维**             | 长期规划、竞争意识、资源优化                           | 战术式、被动反应               | 多步规划、博弈论式                   |
| 7   | **记忆整合**             | 对过往经验、历史模式和连续性的引用                     | 聚焦当下                       | 深厚的历史意识、由先例驱动           |
| 8   | **社交智能**             | 受众意识、换位思考、关系框架                           | 自我指涉                       | 深度关注他者、构建联盟               |
| 9   | **领域专长**             | 技术深度、专业知识、对术语的驾驭能力                   | 通才                           | 深度专家                             |
| 10  | **直觉推理**             | 直觉信号、启发式捷径、模式跳跃                         | 有条不紊、循序渐进             | 信念式跳跃、洞察驱动                 |
| 11  | **时间取向**             | 思维的时间跨度——聚焦过去、现在或未来                   | 锚定当下                       | 跨越时间、从历史延伸至未来主义         |
| 12  | **元认知**               | 对自身思维的觉察、对不确定性的承认                     | 缺乏反思                       | 深度自省、思考思维本身               |

### 6 组张力对

各维度之间存在张力——某一维度得分较高时，其对应维度的得分往往较低。这些张力正是认知特征的核心标志：

| Pair           | Tension                    | What It Reveals                                                        |
| -------------- | -------------------------- | ---------------------------------------------------------------------- |
| DIM 1 ↔ DIM 10 | 分析型 ↔ 直觉型            | 逻辑 vs. 直觉——思维如何得出结论                                       |
| DIM 3 ↔ DIM 6  | 情感型 ↔ 战略型            | 内心 vs. 头脑——什么驱动决策                                           |
| DIM 2 ↔ DIM 5  | 创造型 ↔ 道德型            | 自由 vs. 框架——在规则之内或之外进行创新                               |
| DIM 4 ↔ DIM 12 | 语言型 ↔ 元认知型          | 表达 vs. 自我觉察——外在技艺 vs. 内在反思                              |
| DIM 7 ↔ DIM 11 | 记忆型 ↔ 时间型            | 过去 vs. 时间本身——经验 vs. 时间跨度                                  |
| DIM 8 ↔ DIM 9  | 社交型 ↔ 领域型            | 广度 vs. 深度——人际能力 vs. 技术精通                                  |

## 如何进行画像分析

### 阶段 1——证据收集

仔细阅读文本。针对每个维度，找出**具体的文本证据**：

- 能够体现该维度的直接引文
- 结构性模式（论点是如何构建的）
- 文本中存在的内容 AND 缺失的内容（缺口所揭示的信息与内容本身同样重要）
- 多个段落中反复出现的模式

### 阶段 2——评分

针对 12 个维度中的每一个：

1. 根据证据评分 1-10
2. 引用支持该分数的最有力文本证据
3. 标注置信度等级：HIGH（多个清晰信号）、MEDIUM（存在一些信号）、LOW（推断得出）

### 阶段 3——模式综合

完成评分后，识别：

**主导模式：** 得分最高的 2-3 个维度——这是思维的“核心区域”

**阴影模式：** 得分最低的 2-3 个维度——这是思维不会自然进入的区域

**标志性张力：** 哪些张力对之间的差距最大？与任何单个分数相比，它们更能定义认知风格。

**推理拓扑：** 思维如何在不同观点之间移动？

- 线性（A → B → C → 结论）
- 螺旋（从多个角度接近同一个观点，每次都更深入）
- 网络（连接彼此无关的领域，形成综合）
- 辩证（论题 → 反题 → 合题）
- 分形（在微观和宏观层面呈现相同模式）

**决策指纹：** 面对选择时，这种思维是否会：

- 先分析，再决策？（分析型主导）
- 先感受，再进行合理化？（情感型主导）
- 先设想结果，再逆向推导？（战略型主导）
- 质疑问题本身？（元认知型主导）

### 阶段 4——画像输出

以如下形式呈现画像：

```
═══════════════════════════════════════════
  DHDNA COGNITIVE PROFILE
  Subject: [Name or "Anonymous"]
  Text analyzed: [N words / N paragraphs]
  Confidence: [HIGH / MEDIUM / LOW]
═══════════════════════════════════════════

DIMENSION SCORES:
  1. Analytical Depth ···· [█████████·] 9/10
  2. Creative Range ······ [███████···] 7/10
  ... (all 12)

TENSION MAP:
  Analytical ████████░░ ↔ ░░████████ Intuitive
  Emotional  ███░░░░░░░ ↔ ░░░░░░████ Strategic
  ... (all 6 pairs)

DOMINANT PATTERN: [Top 2-3 dimensions]
SHADOW PATTERN: [Bottom 2-3 dimensions]
REASONING TOPOLOGY: [Linear / Spiral / Web / Dialectic / Fractal]
DECISION FINGERPRINT: [Analyze-first / Feel-first / Envision-first / Question-first]

NARRATIVE SYNTHESIS:
[2-3 paragraph natural language description of how this mind works,
what makes it distinctive, and what it might miss]

KEY QUOTES:
[3-5 most revealing quotes with dimension attribution]
═══════════════════════════════════════════
```

## 对比模式

当用户提供两篇或更多由不同作者撰写的文本时，分别生成个人档案，然后进行**对比综合**：

- 这些思维在哪些方面趋于一致？（共同的高维度）
- 这些思维在哪些方面存在分歧？（同一维度上的相反得分）
- 哪些张力组合会促成富有成效的分歧？
- 如果这些思维处于同一个房间中，对话会是什么样子？

## 自我档案模式

如果用户要求分析其自身的思维方式（使用对话历史作为文本），请保持透明：

- **在回顾对话内容之前先征得同意。** 说明你打算使用哪些内容作为素材，并等待对方回答  
  之前的对话是出于不同目的而写下的，不能在对方不知情的情况下挖掘这些内容来推断其心理特征。
- 根据目前为止的对话进行评分
- 承认对话文本可能无法代表其思维的全部范围
- 指出人们在面向 AI 写作时，思维方式往往不同于面向人类写作时
- 如果用户提供其他写作样本，可以提出重新分析

## 同意与范围

此技能会推断个人的认知与心理属性。这与总结文档不同，边界十分重要：

- **仅分析用户在当前请求中提供的文本。** 不要去寻找关于同一作者的更多材料——其他文件、早期会话，或任何你碰巧读到的内容。
- **对第三方的分析属于推测，必须明确说明这一点。** 当作者是不在当前对话中且未同意接受分析的人——例如转发邮件中的同事、申请材料中的候选人、论文作者——应将输出标注为基于单一文本样本的推断，而不是关于该个人的结论。
- **拒绝用于对某人作出具有重大影响的决策的分析。** 招聘、晋升、录取、临床、纪律或信贷决策均不在适用范围内；该框架没有经过支持此类用途的验证，而 1–10 的认知评分读起来会比实际情况权威得多。
- **所有内容都仅保留在当前会话中。** 除非用户要求，否则不会将档案写入其他位置，也不会发送给任何服务。

## 这不是什么

- 不是人格测试（MBTI、Big Five 等）——那些测试衡量的是行为倾向，而 DHDNA 衡量的是认知架构
- 不是对智力的评判——国际象棋特级大师和诗人的得分可能大不相同，但两者都展现出深厚的认知能力
- 不是静态不变的——一个人的 DHDNA 会随着学习、经历和成长而演变。档案是一个快照，而不是命运。

## 构建者

[AHK Strategies](https://ahkstrategies.net) — AI Horizon Knowledge  
完整平台：[themindbook.app](https://themindbook.app)  
研究：[DHDNA 论文（DOI: 10.5281/zenodo.18736629）](https://doi.org/10.5281/zenodo.18736629)