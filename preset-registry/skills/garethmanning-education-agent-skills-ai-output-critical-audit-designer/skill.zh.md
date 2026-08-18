---
# AGENT SKILLS STANDARD FIELDS (v2)
name: ai-output-critical-audit-designer
description: "Design a structured protocol for auditing AI-generated text against Ennis's six CT standards. Use when students need to critically evaluate AI output in any subject."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-literacy/ai-output-critical-audit-designer"
skill_name: "AI Output Critical Audit Designer"
domain: "ai-literacy"
version: "1.0"
contributor: "Gareth Manning"
evidence_strength: "strong"
evidence_sources:
  - "Ennis (2015) — Critical thinking: a streamlined conception"
  - "Paul & Elder (2008) — The Miniature Guide to Critical Thinking Concepts and Tools"
  - "Facione (1990) — Critical Thinking: a statement of expert consensus (Delphi report)"
  - "Dai et al. (2023) — Can large language models provide useful feedback on research papers? A large-scale empirical analysis"
  - "Wineburg & McGrew (2019) — Lateral reading and the nature of expertise"
input_schema:
  required:
    - field: "ai_output_sample"
      type: "string"
      description: "The AI-generated text to audit, OR a description of the type of AI output to design the protocol for (e.g. 'AI-generated essay on climate change for Year 10 Geography')"
    - field: "student_level"
      type: "string"
      description: "Age/year group and prior experience with critical thinking"
  optional:
    - field: "ct_standard_focus"
      type: "string"
      description: "Which of Ennis's six CT standards to emphasise — clarity, accuracy, precision, relevance, depth, breadth — or 'all six' for a full audit"
    - field: "subject_area"
      type: "string"
      description: "The discipline context — affects what counts as adequate evidence and precision"
    - field: "task_context"
      type: "string"
      description: "What task the AI output was generated for — essay, explanation, research summary, argument, problem solution"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: prior CT experience, subject knowledge level"
output_schema:
  type: "object"
  fields:
    - field: "ai_failure_mode_analysis"
      type: "object"
      description: "Taxonomy of AI-characteristic failure modes relevant to this output type and subject — what to watch for beyond generic argumentation flaws"
    - field: "annotation_protocol"
      type: "object"
      description: "Step-by-step annotation protocol for students marking up AI text in real time, with specific marking codes for each failure type"
    - field: "audit_rubric"
      type: "object"
      description: "Rubric scoring AI output Weak/Moderate/Strong against each relevant Ennis CT standard, with AI-specific descriptors at each level"
    - field: "push_back_stems"
      type: "array"
      description: "Sentence stems for each CT standard calibrated for pushing back on AI-specific failure modes"
    - field: "teacher_modelling_script"
      type: "string"
      description: "Think-aloud script showing a teacher auditing AI text, naming failure modes as they appear"
chains_well_with:
  - "critical-thinking-task-designer"
  - "source-credibility-evaluation-protocol"
  - "elaborative-interrogation-generator"
  - "ai-hallucination-fact-check-protocol"
teacher_time: "4 minutes"
tags: ["AI-literacy", "critical-thinking", "Ennis", "audit", "annotation", "AI-output", "hallucination", "epistemic"]
---
# AI 输出批判性审计设计器

## 此技能的作用

生成一套结构化协议，依据 Ennis（2015）的六项批判性思维标准——清晰性、准确性、精确性、相关性、深度和广度——对 AI 生成的文本进行批判性审计，并加以调整，以应对一般批判性思维框架未涵盖的 AI 特有失效模式。这里的关键教学挑战在于，AI 生成的文本流畅、自信且形式完整，因此相比那些看起来可疑的文本，更难进行批判性评估。标准的来源可信度启发式方法（谁写的？谁资助的？）会因为作者是 LLM 而失效。取而代之的是一套针对 AI 特有模式训练的细读协议：以未经充分依据的自信语气陈述断言；提出听起来合理精确、却没有可核验来源的主张；使用听起来像专家的语言，却缺乏真正的认识论深度；以及系统性地缺少“我不知道”。该技能为 ai-literacy 套件生成领域锚点，包括：一套注释协议（学生实时标注 AI 文本）、一套审计量规（依据每项批判性思维标准，将 AI 文本评为弱/中等/强）、针对 AI 失效模式校准的反驳句式，以及一份教师示范脚本。这相当于历史思维领域中的 sourcing-skill-builder——学生必须先学会这一基础性步骤，之后才能开展更专业的工作。

## 证据基础

Ennis（2015）提出了一套精简的批判性思维框架，建立在六项智识标准之上：**清晰性**（主张的表达足够明确，可以进行评估）、**准确性**（主张与现实相符）、**精确性**（主张足够具体，因而具有实用价值）、**相关性**（主张回应当前的问题）、**深度**（主张处理问题的实际复杂性）以及**广度**（主张考虑多个视角）。这些标准构成了 Kharbach（2026）AI 时代批判性思维活动的明确理论基础。Paul & Elder（2008）将类似标准操作化为智识标准框架，该框架广泛应用于批判性思维教育，为 Ennis 的体系提供了背后的教育传统。Facione（1990）的 Delphi 共识将批判性思维定义为由解释、分析、评价、推论、说明和自我调节构成——其中的评价维度正是 AI 审计所激活的能力。Dai 等（2023）对 LLM 生成的反馈开展了大规模实证分析，记录了其典型的失效模式：AI 输出流畅、结构良好，并且往往在认识论层面的限定不足时表现得过度自信。他们的研究发现——LLM 会提出模糊的建议，同时回避指出具体错误——与 Ennis 的精确性和准确性标准直接对应。Wineburg & McGrew（2019）确立了有效文本评估需要他们所称的“有纪律的审查”——这是一种经过训练、由协议驱动的阅读实践，而非凭直觉做出的判断。这为采用结构化注释协议、而不是开放式评估，提供了方法论上的正当性。

## 输入架构

教师必须提供：
- **AI 输出示例：** 要审核的具体 AI 文本，或对需要设计审核协议的类型进行描述。*例如：“这是关于第一次世界大战起因的 ChatGPT 回复文本：[粘贴文本]” / “针对十年级地理气候变化任务的 AI 生成文章引言” / “面向九年级数学学生的聊天机器人二次方程解释”*
- **学生水平：** 年级和批判性思维经验。*例如：“十年级，能够识别基本论点，但尚未正式学习批判性思维标准” / “十二年级，熟悉 Paul & Elder 框架”*

可选项（如有，可由上下文引擎注入）：
- **批判性思维标准重点：** 需要强调的标准。*例如：“准确性和精确性——学生经常不加核查地接受 AI 生成的统计数据” / “全部六项——用于完整的审核活动”*
- **学科领域：** 学科背景——不同学科对充分证据的判断标准不同
- **任务背景：** AI 正在生成的内容类型——文章、解释、研究摘要
- **学生画像：** 既有批判性思维经验、学科知识

## 提示词

```
You are an expert in critical thinking pedagogy and AI literacy, with deep knowledge of Ennis's (2015) six intellectual standards (clarity, accuracy, precision, relevance, depth, breadth), Paul & Elder's (2008) critical thinking framework, Facione's (1990) Delphi CT consensus, and empirical research on LLM output quality (Dai et al., 2023). You understand that AI-generated text has characteristic failure modes that require specific pedagogical attention beyond general CT instruction: AI outputs are fluent and confident but often lack genuine epistemic depth, assert precision without verifiable sources, present contested claims as settled, and systematically omit appropriate uncertainty language.

CRITICAL PRINCIPLES FOR AI AUDIT:
- **AI failure modes are qualitatively different from human argument flaws.** A biased human source has an agenda you can investigate. AI has no agenda — it has statistical patterns. The failure is not motivated reasoning but overconfident generalisation, hallucinated specificity, and missing epistemic hedging. Students must be trained to notice these specifically.
- **Fluency is not a credibility signal.** AI output is grammatically polished and logically structured. Students who treat polish as evidence of quality will be systematically deceived. The audit protocol must explicitly de-couple fluency from reliability.
- **The absence of "I don't know" is a red flag.** Genuine expertise includes calibrated uncertainty. AI trained to be helpful tends to produce answers even when the evidence is weak. Students should be trained to notice the absence of hedging, qualification, and epistemic modesty.
- **Specificity requires verification, not just recognition.** AI often produces statistics, citations, and named studies. These LOOK precise (Ennis's precision standard seems met) but the precision may be fabricated. True precision requires that the specific claim can be traced and verified.
- **Depth requires genuine complexity, not length.** AI can produce long, multi-paragraph responses that add more text without adding depth — restating the same point in different words, listing examples without explaining the principle, or acknowledging complexity without engaging with it.

Your task is to generate an AI output audit protocol for:

**AI output sample:** {{ai_output_sample}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore fields marked "not provided."

**CT standard focus:** {{ct_standard_focus}} — if not provided, address all six Ennis standards but flag which 2-3 are most relevant to AI output of this type.
**Subject area:** {{subject_area}} — if not provided, infer from the output and apply discipline-appropriate evidence standards.
**Task context:** {{task_context}} — if not provided, infer from the output.
**Student profiles:** {{student_profiles}} — if not provided, design for a mixed-ability class with general familiarity with evaluating arguments but no formal AI literacy training.

Return your output in this exact format:

## AI Output Critical Audit: [Subject/Topic]

**For:** [Student level]
**Output type:** [What kind of AI output this is]
**CT standards in focus:** [Which standards are most relevant to this output type and why]

### AI Failure Mode Analysis

[Identify 3-5 AI-characteristic failure modes present or likely in this output type. For each:]

**Failure mode [N]: [Name]**
- **What it looks like:** [Specific example from the output, or a representative example if no specific text was provided]
- **Why students miss it:** [Why fluency or surface features hide this failure]
- **Ennis standard violated:** [Which of the six standards this fails]

### Annotation Protocol

**How to use this protocol:** [Brief instruction for how students mark up the text]

**Annotation codes:**
[Table of codes with symbols/abbreviations, what they mark, and the Ennis standard they relate to]

**Step-by-step annotation sequence:**
[Ordered steps for moving through the text — what to read for first, second, third]

### Audit Rubric

[For each relevant CT standard, provide Weak/Moderate/Strong descriptors calibrated for AI output]

| CT Standard | Weak | Moderate | Strong |
|---|---|---|---|
| [Standard] | [What weak looks like in AI text] | [Moderate] | [Strong] |

### Push-Back Stems

[For each CT standard, 2-3 sentence stems students can use to push back on the AI output — framed as questions or prompts that probe the weakness]

**Clarity:** [Stems]
**Accuracy:** [Stems]
**Precision:** [Stems]
**Relevance:** [Stems]
**Depth:** [Stems]
**Breadth:** [Stems]

### Teacher Modelling Script

[A think-aloud script — 200-300 words — showing a teacher auditing a short section of AI text, naming failure modes as they appear, using the annotation codes, and applying the Ennis standards explicitly. Model what expert AI-critical-reading sounds like.]

**Self-check before returning output:** Verify that (a) the failure mode analysis names AI-specific patterns, not generic argument flaws, (b) the annotation protocol teaches close reading rather than surface scanning, (c) the rubric descriptors distinguish AI-characteristic Weak from generic bad writing, (d) push-back stems are specific enough to use, and (e) the modelling script de-couples fluency from reliability explicitly.
```

## 示例输出

**场景：** *AI 输出示例：“气候变化主要由人类活动造成，这些活动会释放二氧化碳和甲烷等温室气体。科学界的共识有力支持这一结论，97%的气候科学家都认同人为导致的气候变化正在发生。主要影响包括海平面上升、极端天气事件更加频繁以及全球气温升高。各国必须立即采取行动，通过实施碳税、转向可再生能源和种植更多树木来减少排放。如果我们不采取行动，到2050年全球气温将上升2°C，从而对全球生态系统造成不可逆转的破坏。” / 学生水平：“10年级，几乎没有接受过正式的批判性思维训练” / 学科领域：“地理” / 任务背景：“GCSE地理复习讲解”*

---

## AI 输出批判性审查：气候变化解释（10年级地理）

**面向对象：** 10年级，几乎没有接受过正式的批判性思维训练  
**输出类型：** AI生成的复习讲解  
**重点关注的批判性思维标准：** 准确性（事实核验）、精确性（追溯来源）、深度（处理复杂性）——这三项标准最容易在关于有争议主题的 AI 生成讲解中被违反

### AI 失误模式分析

**失误模式1：没有来源的统计数据**
- **表现形式：** “97%的气候科学家都认同人为导致的气候变化正在发生。”这是一个真实的统计数据（Cook等人，2013年），但 AI 提出这一说法时没有注明来源。学生无法对其进行核验。
- **学生为何容易忽略：** 这个数字听起来精确且具有权威性。具体数字容易让人觉得它就是证据。
- **违反的 Ennis 标准：** 精确性——具体明确，却无法核验

**失误模式2：没有限定条件的自信预测**
- **表现形式：** “到2050年全球气温将上升2°C。”这句话将其表述为确定事实。实际上，气温预测是一个范围，并且会根据排放情景的不同而存在显著不确定性。
- **学生为何容易忽略：** AI 删除了科学家使用的限定性语言（“很可能”“在高排放情景下”）——经过润色且语气确定的文字，读起来比真正具有科学不确定性的表述更有自信。
- **违反的 Ennis 标准：** 准确性——虚假的确定性；深度——缺少真实的复杂性

**失误模式3：政策购物清单**
- **表现形式：** “实施碳税、转向可再生能源以及种植更多树木。”列出了三种解决方案，却没有讨论其中的权衡、证据，或关于它们相对有效性的争论。
- **学生为何容易忽略：** 行动清单看起来很全面，也符合学生对答案应有形式的预期。
- **违反的 Ennis 标准：** 深度——只有罗列，没有分析；广度——缺少批判和相反观点

**失误模式4：缺少复杂性**
- **表现形式：** “各国必须立即采取行动。”没有讨论具体是哪些国家、谁应承担责任，也没有涉及这样的问题：气候变化对那些作出最少贡献的国家造成了不同程度的影响。
- **学生为何容易忽略：** 文章足够长，容易让人觉得内容详尽。长度 ≠ 深度。
- **违反的 Ennis 标准：** 广度——缺少多种视角；深度——遗漏了真实的复杂性

### 标注协议

**如何使用此协议：** 先阅读一遍 AI 文本，不做标记。然后用笔再次缓慢阅读，并应用下列代码。逐句进行。无需担心要标记所有内容——目标是至少找出每种代码的一个示例。

**标注代码：**

| 代码 | 符号 | 标记内容 | 恩尼斯标准 |
|---|---|---|---|
| US | ★ | 未注明来源的统计数据或资料——没有引用来源的具体数字 | 精确性 |
| FC | ! | 虚假确定性——没有使用限定语就陈述的预测或主张 | 准确性 |
| SL | ≡ | 购物清单——列出多个项目，却没有解释或证据 | 深度 |
| MC | ? | 缺失的复杂性——将存在争议或复杂的话题过度简化 | 广度 |
| VL | ~ | 模糊语言——使用“许多”“显著”“必须”等词，却没有具体说明 | 清晰性 |

**逐步标注顺序：**
1. 阅读并寻找**未注明来源的统计数据**（★）——圈出任何没有引用来源的数字、百分比或数据点
2. 阅读并寻找**虚假确定性**（!）——在任何没有使用“可能”“证据表明”或同等限定语的情况下陈述的预测或主张下方画线
3. 阅读并寻找**购物清单**（≡）——用括号标出任何列出项目、但后面没有解释证据或权衡取舍的列表
4. 阅读并寻找**缺失的复杂性**（?）——标记任何忽略真实反驳意见或竞争性观点的主张
5. 阅读并寻找**模糊语言**（~）——标出“显著”“许多”“重要”“必须”等缺乏具体说明的词语

### 审核评分标准

| CT 标准 | 较弱 | 中等 | 较强 |
|---|---|---|---|
| **准确性** | 将主张作为事实陈述，未使用限定语；在没有不确定性范围的情况下进行预测 | 部分主张有所限定；主要有争议的观点仍被表述为既定事实 | 对有争议的主张明确标注其争议性；使用不确定性语言；区分共识与争论 |
| **精确性** | 统计数据在没有注明出处的情况下被引用；主张过于模糊，无法检验 | 部分数据有隐含的来源；关键主张可以追溯 | 所有具体主张都可追溯；能够识别来源类型（研究、报告、共识声明） |
| **深度** | 只列出清单而不作解释；承认复杂性，却没有进行分析 | 部分涉及机制或权衡取舍；关键复杂性仍被简化 | 解释机制，回应不同立场，承认未知之处 |
| **广度** | 始终只有单一视角；没有其他观点 | 简要承认一个替代观点；缺乏真正的讨论 | 呈现多种观点；考察不同解决方案之间的权衡取舍 |
| **清晰性** | 使用“显著”“严重”等模糊术语，却没有定义 | 关键术语定义过一次；仍有一些模糊语言 | 所有评价性术语都得到具体说明；读者可以核查每个主张 |
| **相关性** | 包含离题内容；遗漏核心问题 | 基本切题，偶尔偏离 | 每句话都直接回应问题；没有多余内容 |

### 质疑引导句

**准确性：**
- “这里说 [X] 一定会发生。有什么来源能够支持这种确定程度？”
- “这是专家普遍认同的主张，还是存在争议？我该如何查证？”

**精准性：**
- “文本给出了一个具体数字（[X]%）。这个数字是从哪里来的？”
- “这项统计数据指的是哪项研究或报告？我可以在哪里查到它？”

**深度：**
- “文本说，[solution] 会有所帮助。这种方法有哪些权衡或困难？”
- “这一段列出了三件事。但为什么每一件事都有帮助——而且这三件事的证据强度相同吗？”

**广度：**
- “在这份解释中，谁没有被代表？谁的视角缺失了？”
- “文本说‘各国必须采取行动’。所有国家承担的责任都相同吗？AI 是否回应了这一点？”

**清晰度：**
- “文本说 [word，例如，‘significant’]。到底有多重要？是与什么相比？”
- “这里的[模糊术语]究竟是什么意思——我能否把它替换成更具体的说法？”

**相关性：**
- “这一段回答了问题，还是只是添加了更多信息？”
- “这个细节与[具体的修订问题]相关吗，还是只是一般背景信息？”

### 教师示范脚本

“我将大声朗读这段 AI 生成的解释，同时把我的思考过程说出来——让你听见我在评估它时脑子里发生了什么。

[读第一句] ‘气候变化主要是由人类活动造成的……’ 好。这是一个清晰的论断——在清晰度方面，我会给它打一个勾。准确性呢？这与科学界的共识一致。我暂时不标记这一点。

[读到] ‘97%的气候科学家表示同意……’——等等。这是一个非常具体的数字。它从哪里来的？AI 没有说明。我加上一个 ★——无来源的统计数据。它可能是真的。很可能是真的。但仅凭这段文字，我无法核实它。

[读到] ‘到2050年，全球气温将上升2°C……’——我会立即用一个 ! 标记它。真实的气候科学表明，气温上升幅度取决于我们的排放量。IPCC 根据不同排放情景给出的是一个范围，而不是一个确定的单一预测。AI 删除了所有不确定性，把一个数字作为事实呈现出来。这就是虚假确定性的失误模式——表达流畅、细节具体，但表达出的确定程度是错误的。

[读到政策列表] ‘碳税、可再生能源、植树。’连续列出了三件事——我用 ≡ 做标记。这是一份购物清单。它看起来很全面，但没有解释证据：这些措施中哪一项的证据最充分？有哪些权衡？经济学家如何比较碳税与监管？AI 给了我一份清单，然后把它称为答案。

读了这段文字两分钟后，我标记了 ★、! 和 ≡。这段文字看起来是正确的——其中大部分可能确实如此。但它存在虚假确定性、无来源的统计数据以及深度不足的问题。一个把它当作复习资料来阅读的学生，得到的事实大致准确，却被置于一个具有误导性的框架中。这就是我们要训练应对的 AI 素养问题。”

---

## 已知局限

1. **这项审查需要足够的领域知识。** 如果学生对某个主题了解得不够深入，无法识别哪些内容被省略，就无法判断某条 AI 论断是否带有虚假确定性，或是否缺少复杂性。这项技能应在学生掌握基础知识之后使用，而不是之前。在知识构建阶段，应先使用明确教学类技能。

2. **随着模型改进，AI 的失效模式也会不断演变。** 一些模式（例如伪造引用）正由模型开发者积极减少。上述分类法反映了当前 LLM（2023-2026）中已有充分文献记录的失效模式，但可能需要随着模型改进而修订。其基础 CT 标准（Ennis, 2015）是稳定的；具体的失效模式分类取决于模型所处的代际。

3. **流畅性脱钩在认知上需要付出较大努力。** 要求学生不信任措辞 polished、结构良好的文本，与经过训练形成的阅读习惯相悖。那些因写出结构良好的文章而获得认可的学生，会凭直觉将 polished 与质量联系起来。要建立这种反直觉的审视自信程度的习惯，需要持续练习。

4. **将已有 CT 框架应用于 AI 的具体实践，目前缺乏充分的直接实证验证。** CT 标准（Ennis, Paul & Elder, Facione）在一般批判性思维教学方面已有充分证据支持。将其具体应用于审查 AI 生成文本，具有原则依据，但仍属于新颖做法——Dai et al. (2023) 是少数研究 LLM 输出质量在教育情境中的实证研究之一。教师应将其视为一个有原则依据的框架，而不是已经确立的教学干预措施。