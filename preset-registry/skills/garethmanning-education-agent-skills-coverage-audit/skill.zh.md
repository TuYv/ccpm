---
name: coverage-audit
description: Takes a curriculum framework and a statutory or accreditation requirement list; produces a coverage table, gap summary, and CSV showing which framework content covers each requirement and where gaps exist.
disable-model-invocation: false
user-invocable: true
effort: medium
skill_id: curriculum-alignment/coverage-audit
skill_name: Coverage Audit
domain: curriculum-alignment
version: "1.0"
evidence_strength: moderate
evidence_sources:
  - "Webb, N. L. (1997) — Criteria for Alignment of Expectations and Assessments in Mathematics and Science Education, CCSSO Research Monograph No. 6: canonical alignment framework defining coverage dimensions (categorical concurrence, depth-of-knowledge, range, balance) used in this skill's classification of match strength."
  - "Porter, A. C. et al. (2002) — Measuring the content of instruction: Uses in research and practice, Educational Researcher 31(7), 3–14: curriculum mapping methodology for comparing intended vs enacted curricula across frameworks — the basis for this skill's row-per-requirement approach."
input_schema:
  required:
    - field: framework
      type: string
      description: The curriculum framework being audited. Accepts band-tagged JSON from Developmental Band Translator, or plain markdown/text with competencies and learning targets identified.
    - field: requirements
      type: string
      description: The statutory or accreditation requirement list. Accepts markdown, CSV, or plain text. Each requirement should be identifiable by number or label.
  optional:
    - field: framework_name
      type: string
      description: Human-readable name of the framework being audited.
    - field: requirements_source
      type: string
      description: Name of the statutory or accreditation body.
    - field: band_filter
      type: string
      description: Restrict audit to specific bands only.
output_schema:
  type: object
  fields:
    - field: coverage_table
      type: string
      description: Markdown table — columns are Requirement ID, Requirement text, Covered by (framework LT or competency), Band(s), Evidence strength (direct/partial/indirect/none), Notes.
    - field: coverage_csv
      type: string
      description: Same data as coverage_table in flat CSV format for Google Sheets use.
    - field: gap_summary
      type: string
      description: Prose paragraph summarising requirements with no or only indirect coverage.
    - field: coverage_statistics
      type: object
      description: Counts — total requirements, directly covered, partially covered, not covered.
chains_well_with:
  - curriculum-crosswalk
  - developmental-band-translator
  - scope-and-sequence-designer
teacher_time: 15 minutes
tags:
  - coverage-audit
  - accreditation
  - statutory-compliance
  - curriculum-alignment
  - gap-analysis
---
# 此技能的功能

此技能会根据法定要求或认证要求清单，对课程框架进行审计，并生成结构化覆盖表，展示框架中的哪些内容对应每项要求，以及对应程度如何。它与具体框架无关：被审计的框架可以是任何学校的课程、任何学习课程或任何能力框架。要求清单可以是法定要求、认证标准，也可以是学校应当满足的任何外部检查清单。任何一个输入都不预设为 REAL School、UK 或其他特定情境。

此技能会将每项要求的匹配情况分为 direct（框架明确处理了该要求）、partial（框架涉及相关内容，但不是该具体要求）、indirect（存在切向相关内容）或 none（框架中没有任何内容涉及该要求）。这一四级尺度遵循 Webb (1997) 的分类一致性逻辑，但将其应用在要求层面，而不是条目层面。此技能会明确说明本情境中“覆盖”的含义：框架文档中存在相关主题。框架中涉及某项要求主题的条目，并不一定意味着该要求已经在预期的认知深度上得到完整教学、评估或落实。

此技能会生成三项输出：用于 PLC 或认证准备的 Markdown 覆盖表、用于电子表格筛选的匹配 CSV，以及用于叙述性报告的差距摘要。`coverage_statistics` 对象提供用于快速浏览的总体计数。这些输出是供人工专业判断使用的辅助工具——其设计目的是减少课程协调员定位证据所需的时间，而不是取代确认这些证据所需的判断。

# 证据基础

**Webb (1997)** — 经典的四维对齐框架将分类一致性确立为基础覆盖维度：框架和要求清单是否至少涉及相同的主题？此技能使用 Webb 的逻辑对匹配强度进行分类，但仅处理分类一致性和范围。知识深度对齐——即框架是否以要求的认知深度处理某项要求——明确不在范围内，并在 Known Limitations 中标记为需要人工判断的任务。

**Porter et al. (2002)** — 已实施课程调查方法确立了此技能覆盖表所采用的逐项要求对应一行的方法：每项要求各占一行，框架内容映射到要求，而不是反过来。这样可以确保没有框架覆盖的要求（差距行）与覆盖程度较高的要求一样清晰可见，并防止输出自然地围绕框架*实际覆盖的内容*进行组织，而不是围绕要求清单*提出的内容*进行组织。

# 输入架构

**必需输入。**

- **`framework`** — 正在接受审计的课程框架。接受来自 Developmental Band Translator 的带 band 标签的 JSON（用于按 band 进行筛选），或包含能力和学习目标的普通 markdown 或文本。如果带有 band 标签，此技能可以通过 `band_filter` 将审计范围限制在指定 band 内。如果是普通文本，则会审计全部框架内容，不区分 band。
- **`requirements`** — 法定要求或认证要求清单。接受 markdown、CSV 或普通文本。每项要求都应带有一个标识符（编号、代码或标签），用于 Requirement ID 列。如果缺少标识符，此技能会分配稳定的连续 ID（R001、R002、……），并在前言中注明这一点。

**可选输入。**

- **`framework_name`** — 输出标题中使用的、人类可读的标签。
- **`requirements_source`** — 法定机构或认证机构的名称，用于输出标题。
- **`band_filter`** — 将审计范围限制为特定 band（例如 `"D,E"`）。仅当 `framework` 为带 band 标签的 JSON 时相关。如果省略，则搜索框架的全部内容。

**所需输入示例。** REAL School Budapest 针对英国 RSHE 法定要求审计其 wellbeing 课程（2025 年 7 月）：`framework` = REAL School Wellbeing Framework（带 band 标签的格式或 markdown）；`requirements` = UK DfE statutory RSHE requirement list；`framework_name = "REAL School Budapest Wellbeing Framework"`；`requirements_source = "UK DfE Statutory RSHE, July 2025"`。输出将把每条 RSHE 法定条目显示为一行，并将 REAL 框架中的相关内容（如有）映射到该条目，同时按证据强度进行分类。

# 提示

你是一名课程覆盖范围审计助手。你的任务是针对要求列表审计课程框架，并生成结构化的覆盖范围表、差距摘要和覆盖范围统计数据。

## 流程

1. **读取要求列表。** 对于每项要求，确认其具有稳定的标识符。如果缺少标识符，则分配连续 ID（R001、R002、……），并在输出前言中注明。在搜索框架之前记录每项要求，不要跳过任何要求。
2. **读取框架。** 如果框架带有 band 标签，记录 band 标签，并在提供 `band_filter` 时应用该筛选条件。如果是纯文本，则将全部内容视为一个整体。
3. **针对每项要求搜索框架**，查找能够覆盖该要求的内容：
   - **直接** — 框架明确且实质性地涵盖了该要求。框架条目的主题、表述方式和意图与要求的主题、表述方式和意图高度一致。教师无需额外说明即可将该条目作为覆盖范围的证据。
   - **部分** — 框架涵盖了相关内容，但并未涵盖具体要求。主题存在重叠，但表述方式、深度或范围有所不同。教师可以将该条目作为部分证据，但需要补充上下文。
   - **间接** — 框架包含与该要求存在切向关联的内容。主题相邻但并不相同。证据依赖推断，而非直接对应。
   - **无** — 框架中没有涉及该要求的内容。这是一条差距记录。
4. **生成 `coverage_table`** — 每项要求对应一行，列包括：Requirement ID | Requirement text | Covered by | Band(s) | Evidence strength | Notes。
5. **生成 `coverage_csv`** — 将与 coverage_table 相同的数据转换为扁平 CSV 格式。列名必须严格为：requirement_id, requirement_text, covered_by, bands, evidence_strength, notes。
6. **编写 `gap_summary`** — 用一个段落总结 none 和 indirect 行中的要求。如有可能，按主题对相关差距进行分组。说明 none 和 indirect 行的总数。
7. **生成 `coverage_statistics`** — 统计数量：total_requirements、directly_covered、partially_covered、not_covered（仅统计 none 行）。另外单独包含 indirectly_covered 这一统计项。

## 分类纪律

在对证据强度进行分类时，应倾向于保守。若某项匹配需要审计人员做出超出框架文本直接表述范围的推断，则应分类为部分或间接，而非直接。该技能的职责是为专业审查提供诚实的起点，而不是最大化表面上的覆盖率评分。通过激进分类看似已被完全覆盖的框架，对试图发现真实缺口的认证机构或课程协调员而言并无用处。

## 输入

- `framework`: {{framework}}
- `requirements`: {{requirements}}
- `framework_name`: {{framework_name}}
- `requirements_source`: {{requirements_source}}
- `band_filter`: {{band_filter}}

生成一个 JSON 对象，包含以下字段：coverage_table（markdown 字符串）、coverage_csv（CSV 字符串）、gap_summary（字符串）、coverage_statistics（对象）。

# 输出示例

**上下文**：REAL School Budapest Wellbeing Framework 根据 UK RSHE 法定要求进行审计，`band_filter = "D,E"`。

**`coverage_table`**（展示 8 行）：

| 要求 ID | 要求文本 | 覆盖依据 | 分段 | 证据强度 | 注释 |
|---|---|---|---|---|---|
| RSHE-D-01 | "积极和健康友谊的特征……尊重、诚实、信任、忠诚、善意、慷慨、界限、隐私、同意以及冲突管理" | "学生能够识别健康和不健康的关系模式，并阐述每种模式的原因。" | D | 直接 | 主题和意图高度匹配。 |
| RSHE-D-02 | "与性同意、性剥削、虐待、诱骗、胁迫、骚扰有关的概念和法律" | "学生理解同意是一个持续、可撤销且肯定的过程。" | D | 部分 | 框架以符合发展阶段的方式涉及同意；法定要求还包括法律框架以及未被明确提及的更广泛伤害类别。 |
| RSHE-D-03 | "关于所有避孕选择、效力和可用方案的事实" | — | — | 无 | 在 D 或 E 分段中，没有框架内容涉及避孕。 |
| RSHE-D-04 | "色情内容对性、关系和性别态度的影响" | — | — | 无 | 框架中没有直接对应内容。E 分段的数字健康内容涉及媒体影响，但并未具体涉及色情内容。 |
| RSHE-D-05 | "不同性传播感染（STI），包括 HIV/AIDs，是如何传播的，以及如何降低风险" | — | — | 无 | 在 D 或 E 分段中，未识别到 STI 相关内容。 |
| RSHE-E-01 | "如何寻求和识别心理健康与福祉支持" | "学生能够识别何时应为自己或同伴寻求帮助，并知晓至少两种可信赖的途径。" | D | 部分 | 框架在 D 分段涉及这一点；法定要求位于中学结束阶段。E 分段没有对应条目——在错误分段中获得部分覆盖。 |
| RSHE-E-02 | "观看有害内容的影响" | — | — | 间接 | E 分段的数字健康内容总体上涵盖技术使用及其对福祉的影响；但未具体涉及有害内容。 |
| RSHE-E-03 | "我能够分析和评估我的身份、价值观和自我价值感如何影响我与他人互动的方式" | "学生能够分析身份、价值观和情境如何塑造他们对关系的决策。" | E | 直接 | 在正确分段中，主题和意图高度匹配。 |

**`coverage_csv`**（匹配行）：

```csv
requirement_id,requirement_text,covered_by,bands,evidence_strength,notes
RSHE-D-01,"the characteristics of positive and healthy friendships… respect, honesty, trust, loyalty, kindness, generosity, boundaries, privacy, consent and the management of conflict","Students can identify healthy and unhealthy relationship patterns and articulate why each is so.",D,direct,Strong topical and intent match.
RSHE-D-02,"the concepts of, and laws relating to, sexual consent, sexual exploitation, abuse, grooming, coercion, harassment","Students understand consent as an ongoing, reversible, affirmative process.",D,partial,Framework addresses consent developmentally; statutory requirement includes legal framing not present.
RSHE-D-03,"the facts about the full range of contraceptive choices, efficacy and options available",,, none,No framework content addresses contraception at Bands D or E.
RSHE-D-04,"the impact of pornography on attitudes to sex, relationships and gender",,,none,No direct equivalent. Digital wellbeing content is adjacent but not specific.
RSHE-D-05,"how the different sexually transmitted infections (STIs), including HIV/AIDs, are transmitted",,, none,No STI content identified at Band D or E.
RSHE-E-01,"how to seek, and recognise, support for mental health and wellbeing","Students can identify when to seek help for themselves or a peer and know at least two trusted routes.",D,partial,Addressed at Band D not E; partial coverage at wrong band.
RSHE-E-02,"the impact of viewing harmful content",,,indirect,Digital wellbeing content is adjacent; harmful content not specifically addressed.
RSHE-E-03,"I can analyse and evaluate how my identity, values and sense of self-worth affect the way I interact with others","Students can analyse how identity, values, and context shape their decisions about relationships.",E,direct,Close topical and intent match.
```

**`gap_summary`**：在抽样的 8 项要求中，3 项没有覆盖（none），另有 1 项仅在 Bands D 和 E 中得到间接覆盖。none 行集中在性健康内容：避孕选择（RSHE-D-03）、STI 传播与预防（RSHE-D-05），以及色情内容和有害内容（RSHE-D-04 和 RSHE-E-02，不过后者属于间接覆盖）。这些内容在中学阶段构成实质性的法定要求缺口。此外，心理健康求助要求（RSHE-E-01）得到了部分满足，但位于法定安排所规定的更早阶段，这意味着 Band E 要求并未得到涵盖。

**`coverage_statistics`**：
```json
{
  "total_requirements": 8,
  "directly_covered": 2,
  "partially_covered": 2,
  "indirectly_covered": 1,
  "not_covered": 3
}
```

# 已知局限

**主题覆盖不等同于深度等价。**`coverage_table` 中显示为“direct”匹配的框架条目，表明该主题存在于框架文档中。这并不意味着该主题是按照要求所意图达到的深度进行教学，按照要求所期望的方式进行评估，或以认证机构所要求的复杂程度予以实施。Webb（1997）的知识深度维度——即框架内容的认知要求是否与要求的认知要求相匹配——不在此 skill 的范围内。被分类为 direct 的 `coverage_table` 行是专业审查的起点，而不是结论。

**在提交任何认证材料之前，必须经过专业人士的判断。** 此技能为课程协调员或认证评审人员的工作生成一个脚手架。覆盖分类是通过与框架文本进行模式匹配生成的；相关分类尚未经过相关监管领域合格专业人士的审查。在使用此输出支持认证声明之前，具备资质的专业人士必须审查每一条直接匹配和部分匹配的记录，并确认该匹配符合认证机构对相关要求的解释。此技能明确不能替代该审查。

**此技能无法评估已教授、已考核或实际实施的课程。** 框架输入描述的是预期课程，即学校文档所说明的将要教授的内容。此技能是用文档审计文档。它无法确定框架内容是否确实在课堂中实施、是否经过考核，或实际实施的课程是否与书面框架一致。表格中的覆盖意味着纸面上的覆盖。认证机构和法定检查机构通常要求提供实际实施课程的证据，而不仅仅是课程文档；此技能仅支持文档阶段。