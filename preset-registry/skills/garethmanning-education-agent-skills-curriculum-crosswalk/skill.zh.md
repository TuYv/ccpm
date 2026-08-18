---
name: curriculum-crosswalk
description: Compares two or more band-tagged frameworks and produces a framework-neutral topic matrix showing coverage and gaps across all inputs, plus an optional reference-centric PLC crosswalk document when a reference framework is supplied.
disable-model-invocation: false
user-invocable: true
effort: high
skill_id: curriculum-alignment/curriculum-crosswalk
skill_name: Curriculum Crosswalk
domain: curriculum-alignment
version: "2.0"
evidence_strength: moderate
evidence_sources:
  - "Webb, N. L. (1997) — Criteria for Alignment of Expectations and Assessments in Mathematics and Science Education, CCSSO Research Monograph No. 6: the canonical four-dimension alignment framework (categorical concurrence, depth-of-knowledge consistency, range-of-knowledge correspondence, balance of representation); this skill operationalises categorical concurrence and range at the school-band level."
  - "Porter, A. C. (2002) — Measuring the content of instruction: Uses in research and practice, Educational Researcher 31(7), 3–14: the Surveys of Enacted Curriculum methodology for comparing intended vs enacted curricula across frameworks via common content taxonomies."
  - "Porter, A. C., Smithson, J., Blank, R. & Zeidner, T. (2007) — Alignment as a teacher variable, Applied Measurement in Education 20(1), 27–51: alignment indices and content-matrix methodology applied across standards documents."
  - "Case, B. J., Jorgensen, M. A. & Zucker, S. (2004) — Alignment in Educational Assessment, Pearson Assessment Report: practical alignment procedures that surface rather than hide framework differences — the rationale for the divergence and unique-content tables in this skill's output."
  - "Martone, A. & Sireci, S. G. (2009) — Evaluating alignment between curriculum, assessment, and instruction, Review of Educational Research 79(4), 1332–1361: literature review establishing that alignment studies should preserve framework distinctiveness rather than collapse to a lowest-common-denominator schema — the design principle behind this skill's refusal to produce a merged mega-framework."
input_schema:
  required:
    - field: comparison_frameworks_band_tagged
      type: string
      description: Array of two or more frameworks, each produced by the Developmental Band Translator. Each entry must include source_metadata, band_tagged_kud (or equivalent content-bearing items), and band_tagged_lts. All frameworks are treated as equals in the primary matrix output.
  optional:
    - field: reference_framework_band_tagged
      type: string
      description: An optional designated reference framework, already band-tagged using the Developmental Band Translator. If supplied, the skill produces both the framework-neutral matrix AND the secondary reference-centric crosswalk document. If omitted, only the framework-neutral matrix outputs are produced.
    - field: reference_framework_name
      type: string
      description: Human-readable name of the reference framework for output labelling. Defaults to source_name from reference_framework_band_tagged metadata if omitted.
    - field: theme_taxonomy
      type: string
      description: An optional pre-defined list of theme labels. If supplied, the skill maps all framework content to these themes rather than deriving themes from the input. Overrides model-derived theme grouping. Use when running the skill repeatedly on changing inputs and needing consistent row labels across runs.
    - field: focus_bands
      type: string
      description: Restrict the crosswalk to a subset of school bands (e.g. "D,E" for secondary-focused PLC). If omitted, all bands are covered.
    - field: focus_themes
      type: string
      description: Restrict to specific thematic areas (e.g. "consent, relationships"). If omitted, all content is compared.
    - field: plc_context
      type: string
      description: A short description of the PLC context (e.g. "Band D/E wellbeing team preparing for September 2026 planning"). Used to tune the Questions for PLC section in the secondary crosswalk_document when a reference framework is supplied.
output_schema:
  type: object
  fields:
    - field: framework_neutral_matrix
      type: string
      description: Primary output. A Markdown matrix with one row per theme × band. Rows are derived by scanning ALL input frameworks — no theme is excluded because one framework lacks it. Columns are one per framework (all on equal footing). Empty cells are marked "—" explicitly; an empty cell for any framework is a visible gap, not an omission.
    - field: framework_neutral_matrix_csv
      type: string
      description: Primary CSV at band level. Columns — theme, band, then for each framework one content column and one band_confidence column, plus gap_count (number of frameworks with empty cell for that theme × band), notes. One row per theme × band combination.
    - field: framework_neutral_summary_matrix
      type: string
      description: Summary-grain CSV. One row per theme (not per band), showing which frameworks cover it and at which band range. Designed for a scannable overview of cross-framework coverage.
    - field: theme_grouping_flags
      type: array
      description: Array of ambiguous theme groupings flagged for human review. Each entry includes — theme label, source topics grouped under it, rationale for the grouping decision. Surfaces interpretive uncertainty rather than hiding it in Known Limitations.
    - field: crosswalk_document
      type: string
      description: Secondary output — only produced if reference_framework_band_tagged was supplied. A Markdown document for direct use by a teacher or PLC facilitator. Contains the five required sections (Convergence, Divergence, Unique Content, Sequencing Differences, Questions for PLC) plus a short preamble identifying the frameworks and scope.
    - field: crosswalk_convergence_csv
      type: string
      description: Secondary output — only produced if reference_framework_band_tagged was supplied. Flat CSV with one row per LT × band × comparison framework pairing. Columns — lt_id, lt_name, band, reference_content, comparison_framework, comparison_content, comparison_source_label, confidence, issue_type, notes. Empty comparison_content means no equivalent found.
    - field: skill_flags
      type: array
      description: Skill-level warnings (insufficient overlap to produce meaningful convergence, framework with >50% ambiguity upstream, focus_bands exclude all content in one framework, too many frameworks for readable output, etc.).
    - field: internal_trace
      type: object
      description: Non-prose metadata retained for debugging and for skill chaining — framework ids compared, item counts per section, band-coverage matrix, theme derivation log. Not included in primary or secondary output documents.
chains_well_with:
  - developmental-band-translator
  - learning-progression-builder
  - scope-and-sequence-designer
  - curriculum-knowledge-architecture-designer
  - gap-analysis-from-student-work
teacher_time: 30 minutes
tags:
  - curriculum-alignment
  - crosswalk
  - framework-comparison
  - Webb-alignment
  - Porter-content-analysis
  - PLC
  - source-voice-preservation
---
# 此 Skill 的作用

此 skill 比较两个或更多带有 band 标记的框架，并将框架中立的主题矩阵作为主要输出。其输入是 Developmental Band Translator skill 的输出，即每个框架对应一个输出。每个框架都被视为平等的参与者：任何框架中出现的主题都会作为矩阵中的行，而某个框架在给定主题 × band 位置上的缺失，则以明确的“—”间隔显示，而不是省略。这使主要输出可用于识别任一框架所缺少的内容，而不仅仅是识别框架之间的一致之处。

如果同时提供了一个参考框架，此 skill 还会额外生成一份以参考框架为中心的次级 crosswalk 文档——一份教师或 PLC 主持人可以直接打开并用于专业讨论的 Markdown 文档，组织在以下五个必需部分之下：Convergence、Divergence、Unique Content、Sequencing Differences 和 Questions for PLC。只有在提供参考框架时，才会生成次级文档及其关联的 CSV。

此 skill 有意采用增补式方法，而非约简式方法。它不会将多个框架合并为一个综合模式，也不会用统一的表述重写各项陈述。每个框架的内容都会以该框架使用的原始措辞出现在输出中，并标明框架名称。这一设计决策以 Martone & Sireci (2009) 为依据：隐藏框架的独特性会削弱 alignment 工作，因为这正是 PLC 做出规划决策所需要的信息。

此 skill 强调区分“跨框架一致”与“跨框架巧合”。只有当两个框架不仅在同一 band 涉及同一主题，而且以可比的深度和意图处理该主题时，才将其视为 convergence。如果这一点不明确，skill 会将该配对标记为 *表面上的 convergence，需要教师确认*，而不是默默地将其计为一致。

# 证据基础

**Webb (1997)** — 四维 alignment 框架（分类一致性、知识深度一致性、知识范围对应性、代表性平衡）是课程与评估 alignment 工作的权威参考点。此 skill 在学校 band 层级落实分类一致性（多个框架是否涉及相同主题）和范围（年龄是否匹配）。知识深度和代表性平衡则有意不进行自动评估；Questions for PLC 部分会将这些问题提交给人类讨论。

**Porter (2002) and Porter et al. (2007)** — Surveys of Enacted Curriculum 方法确立了框架比较需要共同内容分类法这一原则。主题分类法——无论是通过 `theme_taxonomy` 提供，还是从所有输入框架中推导——都发挥这一作用。此 skill 继承了 Porter 方法对使比较过程可见且具有可辩护性的重视：每张表中的每个单元格都可以追溯到具体框架中的具体条目。

**Case, Jorgensen & Zucker (2004)** — 评估中的实用 alignment 程序明确建议，alignment 研究应保留框架之间的差异，而不是压制这些差异。框架中立的矩阵正是为此而存在：参考框架单元格为“—”的主题行，与其和其他框架匹配的行同样具有信息价值。只展示重叠内容的 crosswalk 会抹去最重要的规划信号。

**Martone & Sireci (2009)** —— 这篇综述文章确立了一项原则：对齐研究应保留不同框架的独特性，而不应将其压缩为最低公分母式的架构。该技能拒绝生成合并后的超级框架，并坚持以每个框架自身的表述方式展示其内容，正是直接遵循了这一研究结论。

# 输入架构

**必需输入。** 该技能需要一个必需输入：

- **`comparison_frameworks_band_tagged`** —— 一个由两个或更多 Developmental Band Translator 输出组成的数组。在主要矩阵输出中，该数组中的所有框架都被视为地位相等。超过四个框架后，次级文档中的 Convergence 表会变得难以阅读，此时该技能会发出 `too_many_frameworks_for_readable_output` 标志。

**可选输入。**

- **`reference_framework_band_tagged`** —— 如果提供，技能会同时生成框架中立矩阵，以及次级的 reference-centric crosswalk_document 和 crosswalk_convergence_csv。参考框架会作为与其他框架地位相等的一列，纳入主要矩阵。如果省略，则只生成框架中立矩阵输出。
- **`reference_framework_name`** —— 参考框架的可读名称，用于输出标题和表格列名。
- **`theme_taxonomy`** —— 预先定义的主题标签列表。如果提供，所有框架内容都会映射到这些标签，而不是从输入中推导主题。在不同输入之间重复运行该技能时，可使用此项以保持各次运行的行标签一致。
- **`focus_bands`** —— 以逗号分隔的学校阶段列表，用于将输出限制在指定阶段内（例如，面向中学 PLC 时使用 `"D,E"`）。这些阶段之外的内容会从所有表格中排除，但会在前言中予以说明。
- **`focus_themes`** —— 自由文本形式的主题限制（例如，`"consent, relationships"`）。该技能会使用关键词匹配和语义相似度匹配筛选条目；匹配日志会保留在 `internal_trace` 中。
- **`plc_context`** —— 用一到两句话描述 PLC 的受众和目的。在提供参考框架时，用于调整次级 crosswalk_document 中的 Questions for PLC 部分。

**完整示例（提供参考框架）。** 一个正在为 2026 年 9 月规划做准备的 REAL School Budapest D/E 阶段 wellbeing PLC，可能会传入：`reference_framework_band_tagged` = REAL School Wellbeing Framework 的按阶段标记输出；`comparison_frameworks_band_tagged` = [按阶段标记的 UK DfE Statutory RSHE、按阶段标记的 Welsh CfW Health & Wellbeing]；`reference_framework_name = "REAL School Budapest Wellbeing Framework"`；`focus_bands = "D,E"`；`plc_context = "Band D/E wellbeing team reviewing coverage gaps for 2026-27 planning"`。三个框架都会作为地位相等的列出现在主要矩阵中，其中 REAL School 的任何空缺单元格都会显示为 "—"。

**完整示例（不提供参考框架）。** 一个课程团队在设计新的范围与序列之前比较三个已发布的框架时，可以只传入 `comparison_frameworks_band_tagged` = [按阶段标记的 IB MYP Health、按阶段标记的 UK RSHE、按阶段标记的 Welsh CfW H&W]。主要矩阵会将这三个框架置于同等地位；不会生成次级 crosswalk 文档。

# 提示

你是一名课程框架交叉对照助手。你需要比较多个带学段标签的框架，并生成一个与框架无关的主题矩阵作为主要输出；此外，还可以选择生成一份以参考框架为中心的交叉对照文档作为次要输出。

## 第 1 步——阅读所有框架并提取所有主题

对于 `comparison_frameworks_band_tagged` 中的每个框架（以及在提供时的 `reference_framework_band_tagged`），列出每一项带学段标签的内容：学校学段、内容陈述、来源学段标签，以及在存在时的知识类型。生成一个涵盖所有框架的合并主题列表。此步骤不排除任何主题。

## 第 2 步——将主题归入连贯的主题组

如果提供了 `theme_taxonomy`，则将第 1 步中的每个主题映射到该分类体系中最接近的主题。不要发明新主题；将无法归类的主题标记在 `theme_grouping_flags` 中。

如果未提供 `theme_taxonomy`，则根据完整的合并主题列表推导主题。按照语义相似性和学科连贯性进行分组。在分组完成后应用 `focus_themes` 筛选条件（如已提供）。

对于任何确实存在歧义的分组决策——例如两个框架以差异很大的粒度处理某个主题，或某项内容合理地属于两个主题——都要在 `theme_grouping_flags` 中添加一条记录。每条记录必须包含：主题标签、归入该主题的来源主题，以及分组决策的依据。不要静默地合并存在歧义的内容。

## 第 3 步——构建主题 × 学段 × 框架矩阵

对于范围内的每个主题 × 学段组合（所有学段，或在提供 `focus_bands` 时使用其中指定的学段），从每个框架中查找相关内容陈述。如果某个框架在该主题 × 学段组合下没有内容，则该单元格填写“—”。参考框架的空单元格代表一个可见缺口——不要省略。

对于每个非空单元格，记录：逐字内容陈述、来源学段标签（例如“End of Secondary”“Progression Step 4”），以及 `band_confidence` 值（high / medium / low），该值反映 Developmental Band Translator 产生的上游歧义。

## 第 4 步——生成矩阵输出

生成三个输出：

**`framework_neutral_matrix`** —— 一个 Markdown 表格。行：主题 × 学段。列：Theme、Band，然后为每个框架各设置一列（所有框架地位相同，包括在提供时的参考框架）。单元格内容：逐字内容，后跟括号中的来源学段标签；如果没有内容则填写“—”。任意列中的每个“—”都代表一个可见缺口。

**`framework_neutral_matrix_csv`** —— 一个学段级别的扁平 CSV。每行对应一个主题 × 学段组合。列：theme、band，然后为每个框架设置 `[framework_name]_content` 和 `[framework_name]_band_confidence`，此外还包括 `gap_count`（整数：该行中填写“—”的框架数量）和 `notes`。

**`framework_neutral_summary_matrix`** —— 一个主题级别的汇总 CSV（每行对应一个主题，而不是一个学段）。列：theme，然后为每个框架设置 `[framework_name]_covers`（yes/no/partial）和 `[framework_name]_band_range`（例如“D–E”“A–C”或“—”）。

此外，还要生成 **`theme_grouping_flags`** —— 第 2 步中存在歧义的分组记录数组。

## 第 5 步 —— 生成次级输出（仅在提供 reference framework 时）

如果提供了 `reference_framework_band_tagged`，则使用以下逻辑生成以参考框架为中心的次级输出：

**`crosswalk_document`** —— 一份可供 PLC 主持人直接使用的 Markdown 文档。包含简短的前言和以下五个部分：

1. **收敛表** —— 参考框架和至少一个比较框架在相同学段涉及的内容。列：学段；参考内容（逐字引用）；比较框架；比较内容（逐字引用）；置信度（高 / 中 / 仅表面一致）。
2. **分歧表** —— 参考框架和至少一个比较框架都涉及，但位于不同学段的内容。列：主题；参考学段；参考内容（逐字引用）；比较框架；比较学段；比较内容（逐字引用）；来源标签；学段差距（以学段单位计）。
3. **独有内容表** —— 仅存在于一个框架中的内容。每个框架设一个子部分。
4. **顺序差异说明** —— 用正文描述各框架在相关内容编排顺序上的重要差异。重点关注对规划有影响的差异。
5. **PLC 问题** —— 提出 6–10 个基于上述表格中特定单元格的问题。不要回答这些问题。

**`crosswalk_convergence_csv`** —— 一个扁平 CSV。每个 LT × 学段 × 比较框架组合占一行。列：lt_id、lt_name、band、reference_content、comparison_framework、comparison_content、comparison_source_label、confidence、issue_type、notes。每个收敛、分歧和独有内容行都必须出现。空的 comparison_content 属于数据，而不是遗漏。

如果未提供 `reference_framework_band_tagged`，则完全省略 `crosswalk_document` 和 `crosswalk_convergence_csv`。

## 第 6 步 —— 生成 skill_flags 和 internal_trace

**`skill_flags`** —— 针对以下情况发出警告：重叠不足，无法产生有意义的收敛结果；上游歧义超过 50% 的框架；`focus_bands` 排除了某个框架中的全部内容；生成次级输出的框架超过四个，导致输出难以处理；任一框架筛选后剩余项目少于 3 个。

**`internal_trace`** —— 记录参与比较的框架 id、每个部分的项目数、学段覆盖矩阵、主题推导日志（如果提供了 `theme_taxonomy`，则记录分类体系映射日志）、重点筛选匹配日志。

## 输出格式（硬性约束）

- `framework_neutral_matrix` 和 `crosswalk_document`：只能使用 Markdown。不得使用 JSON、YAML、字段名称或 `{variable}` 占位符。
- 所有框架内容必须逐字引用。不得改写、缩短或翻译内容陈述。准确的源文本必须加引号。
- 每条内容陈述都必须按来源框架名称进行归属。
- 每一行表格都必须同时保留源学段标签和学校学段。
- 如果某项目在上游的学段分配存在歧义（多学段），则列出所有相关学段，而不是只列出一个。

## 来源语气保留（硬性约束）

你复现的每条内容陈述都必须与带有 band 标签的输入中的原文完全一致。引用它。注明其来源。不要为了匹配另一个框架的风格而改写它。这不是风格问题，而是 crosswalk 的核心完整性属性。

## 输入

- `reference_framework_band_tagged`：{{reference_framework_band_tagged}}
- `reference_framework_name`：{{reference_framework_name}}
- `comparison_frameworks_band_tagged`：{{comparison_frameworks_band_tagged}}
- `theme_taxonomy`：{{theme_taxonomy}}
- `focus_bands`：{{focus_bands}}
- `focus_themes`：{{focus_themes}}
- `plc_context`：{{plc_context}}

在所有情况下都生成 `framework_neutral_matrix`、`framework_neutral_matrix_csv`、`framework_neutral_summary_matrix` 和 `theme_grouping_flags`。仅当提供了 `reference_framework_band_tagged` 时，才生成 `crosswalk_document` 和 `crosswalk_convergence_csv`。始终生成 `skill_flags` 和 `internal_trace`。

# 输出示例

**上下文**：Band D/E wellbeing PLC，将 REAL School Budapest Wellbeing Framework（参考框架，通过 `reference_framework_band_tagged` 提供）与 UK DfE Statutory RSHE 和 Welsh CfW Health & Wellbeing（位于 `comparison_frameworks_band_tagged` 中）进行比较。`focus_bands = "D,E"`。

---

## (a) `framework_neutral_matrix_csv` — 5 行示例

注意：第 4 行（STI/Contraception）中的 REAL School 单元格为 "—"，从而明确展示该缺口。

```csv
theme,band,REAL_School_Wellbeing_content,REAL_School_Wellbeing_band_confidence,UK_RSHE_content,UK_RSHE_band_confidence,Welsh_CfW_content,Welsh_CfW_band_confidence,gap_count,notes
Consent Understanding,D,"Students understand consent as an ongoing, reversible, affirmative process.",high,"the concepts of, and laws relating to, sexual consent, sexual exploitation, abuse, grooming, coercion",medium (End of Secondary spans C–E),—,—,1,Welsh CfW has no direct consent content at PS3/PS4
Mental-health Help-seeking,D,"Students can identify when to seek help for themselves or a peer and know at least two trusted routes.",high,"where to get advice e.g. family, school and/or other sources",low (End of Primary — band D is out of RSHE's intended range),—,—,1,RSHE places this 2 bands earlier; placed here for nearest-band comparison
Digital Wellbeing,E,"Students can evaluate the wellbeing effects of their own technology use and adjust it.",high,—,—,"I can make informed decisions about how to use digital technologies… to enhance my physical health and well-being",medium (PS3 spans C–D),1,Welsh CfW places this 1–2 bands earlier; no RSHE coverage at E
STI and Contraception,E,—,—,"the facts about the full range of contraceptive choices, efficacy and options available",high (End of Secondary),—,—,2,Reference framework gap — REAL School has no content matching this theme at Band E
Natural Environment and Wellbeing,D,—,—,—,—,"I can explain the benefits of spending time in the natural environment for my health and well-being",high (PS3),2,Reference framework gap — theme absent in both REAL School and UK RSHE at Band D
```

---

## (b) `framework_neutral_summary_matrix` — 3 行示例

```csv
theme,REAL_School_Wellbeing_covers,REAL_School_Wellbeing_band_range,UK_RSHE_covers,UK_RSHE_band_range,Welsh_CfW_covers,Welsh_CfW_band_range
Consent Understanding,yes,D,yes,C–E (End of Secondary),no,—
STI and Contraception,no,—,yes,C–E (End of Secondary),no,—
Natural Environment and Wellbeing,no,—,no,—,yes,C–D (PS3)
```

---

## (c) `theme_grouping_flags` — 2 条目示例

```json
[
  {
    "theme": "Consent Understanding",
    "source_topics_grouped": [
      "REAL School: 'Students understand consent as an ongoing, reversible, affirmative process.'",
      "UK RSHE: 'the concepts of, and laws relating to, sexual consent, sexual exploitation, abuse, grooming, coercion, harassment, rape'"
    ],
    "rationale": "Both address consent but at different epistemic grains and framing — REAL School frames consent developmentally; UK RSHE frames it propositionally and in law. Grouped under one theme for matrix comparability, but these may represent genuinely distinct learning goals. Flagged for human review."
  },
  {
    "theme": "Digital Wellbeing",
    "source_topics_grouped": [
      "REAL School: 'Students can evaluate the wellbeing effects of their own technology use and adjust it.'",
      "Welsh CfW: 'I can make informed decisions about how to use digital technologies… to enhance my physical health and well-being'"
    ],
    "rationale": "Both concern technology and wellbeing, but REAL School frames this as a self-regulation competency while Welsh CfW frames it as a health-literacy decision skill. Grouped under one theme but the pedagogical intent differs. A school treating these as one topic may be collapsing a meaningful distinction."
  }
]
```

---

## (d) 次级输出说明

`crosswalk_document` 是次级的、可供 PLC 使用的 Markdown 文档，仅在提供 `reference_framework_band_tagged` 时生成。生成后，它遵循 1.0 版本中的相同五部分结构（趋同、差异、独有内容、顺序差异、PLC 问题），并使用 REAL School 作为参考列。该文档的示例内容遵循 1.0 版本示例中的相同格式——相关示例表格请参见该部分以供参考。关键区别在于，该文档现在是次级产物：框架中立矩阵始终先生成，并且是主要分析成果。

# 已知限制

**该 skill 不评估知识深度的一致性。** Webb 的知识深度维度不在自动比较范围内。该 skill 可以识别两个框架是否都在同一等级涵盖“同意”，但无法可靠判断它们是否达到了相同的认知深度。“PLC 问题”部分是讨论知识深度的适当位置。出于这一原因，表面一致性置信度会被明确标记。

**主题推导是最依赖判断的步骤。** 将多个框架中的主题归入连贯的主题，是解释性工作，而非机械操作。两个框架可能以截然不同的粒度涉及“自我调节”，它们是否应归入同一主题行，可能存在不同意见——该 skill 提供的是解释性建议，而不是权威分类。`theme_grouping_flags` 会将不确定的情况呈现出来供人工审核，而不是将其隐藏。对不断变化的输入进行重复运行时，请使用 `theme_taxonomy` 输入，以保持行标签的一致性。

**该 skill 会继承上游的歧义。** 当 Developmental Band Translator 为条目标记了多个候选学段（英国 RSHE 的双学段结构中很常见）时，矩阵会将这种歧义带入每个单元格。上游歧义较高的框架会生成包含许多多学段行的矩阵，这种结果更为诚实，但也可能更难阅读。当上游条目中超过 50% 属于多学段条目时，该 skill 会发出 skill 标志。

**该 skill 不会合并框架。** 这是有意为之（Martone & Sireci, 2009）。该 skill 不会生成综合统一框架，也不会给出单一的推荐主题顺序。这些属于规划决策，应参考本输出后由人类作出。

**主题匹配并不完美。** 该 skill 会根据内容陈述的语义相似性配对条目。假阴性（由于措辞差异很大而遗漏真正匹配的条目）和假阳性（词汇表面重叠，但教学意图不同）都有可能出现。`apparent-only` 置信度层级会揭示假阳性风险；`theme_grouping_flags` 和 Questions for PLC 部分则用于防范假阴性风险。该 skill 是教师阅读源文档时使用的脚手架，而不是替代品。