---
name: developmental-band-translator
description: Tags harness-decomposed curriculum items (KUDs, LTs, criteria) with a school's developmental band metadata while preserving source voice and labels. Supply the band schema; the skill derives mapping rules from it.
disable-model-invocation: false
user-invocable: true
effort: medium
skill_id: curriculum-alignment/developmental-band-translator
skill_name: Developmental Band Translator
domain: curriculum-alignment
version: "1.0"
evidence_strength: moderate
evidence_sources:
  - "Wiggins, G. & McTighe, J. (2005) — Understanding by Design (2nd ed.), ASCD: backward design establishes the principle that curriculum alignment begins from stated outcomes and works backward through learning targets; band-tagging is an alignment operation on that model."
  - "Wiggins, G. & McTighe, J. (2011) — The Understanding by Design Guide to Creating High-Quality Units, ASCD: KUD as the canonical unit of translation between frameworks."
  - "Vygotsky, L. S. (1978) — Mind in Society: The Development of Higher Psychological Processes, Harvard University Press: the Zone of Proximal Development provides the theoretical basis for developmental banding as an age-and-readiness construct rather than a pure age construct."
  - "Heritage, M. (2008) — Learning Progressions: Supporting Instruction and Formative Assessment, CCSSO: progressions are developmental rather than age-deterministic; band mappings must preserve this."
  - "Webb, N. L. (1997) — Criteria for Alignment of Expectations and Assessments in Mathematics and Science Education, CCSSO Research Monograph No. 6: alignment is multi-dimensional (categorical concurrence, depth-of-knowledge, range, balance) — band translation addresses only the age-range dimension and must not be mistaken for full alignment."
input_schema:
  required:
    - field: band_schema
      type: string
      description: "The school or programme's developmental band definitions. Must include band labels, approximate age or grade ranges, and any named groupings. Example: REAL School Budapest uses Bands A-F — A (Water+Air Dragons, K-2, ages 5-7), B (Earth Dragons, G3-4, ages 7-9), C (Fire Dragons, G5-6, ages 9-11), D (Metal+Light Dragons, G7-8, ages 11-13), E (G9-10, ages 13-15), F (G11-12, ages 15-17)."
    - field: kud_json
      type: string
      description: The harness-produced KUD file (kud.json). Each item must include at minimum item_id, content_statement, knowledge_type, and source_block_id.
    - field: lts_json
      type: string
      description: The harness-produced LT file (lts.json). Each LT must include lt_id, lt_name, lt_definition, kud_item_ids, and knowledge_type.
    - field: progression_structure_json
      type: string
      description: The harness-produced progression_structure.json for the source. Must include band_labels, source_type, and age_range_hint (or per-band approximate_age_range). If both age-range fields are absent, the skill returns request_age_range_context in skill_flags and halts.
  optional:
    - field: criterion_bank_json
      type: string
      description: The harness-produced criterion_bank.json if criterion-level band tagging is also required. Optional — if omitted the skill tags only KUD items and LTs.
    - field: source_name
      type: string
      description: Human-readable source name (e.g. "UK DfE Statutory RSHE, July 2025") for output provenance. Defaults to progression_structure.source_slug if omitted.
    - field: user_age_range_override
      type: string
      description: Explicit age-range mapping supplied by the user when a source has no native band structure (flat list). Required only when the skill emits a request_age_range_context error.
output_schema:
  type: object
  fields:
    - field: source_metadata
      type: object
      description: Source name, source_type, source_band_labels (unchanged), and skill run provenance (version, timestamp, invoker).
    - field: band_tagged_kud
      type: array
      description: Every KUD item with school_band (string or array), band_confidence, source_band_preserved, source_voice_preserved (always true), ambiguity_flag, teacher_review_flag, and band_rationale.
    - field: band_tagged_lts
      type: array
      description: Every LT with school_band (string or array), band_confidence, source_band_preserved, source_voice_preserved (always true), ambiguity_flag, teacher_review_flag, and band_rationale. Band is assigned from the LT's constituent KUD items using the aggregation rule described in the prompt.
    - field: band_tagged_criteria
      type: array
      description: Present only if criterion_bank_json was supplied. Same field set as LTs. Inherit band from parent LT unless a criterion explicitly narrows the age range.
    - field: summary_counts
      type: object
      description: Counts of items per school band, ambiguity flags, teacher review flags, and low-confidence tags. For rapid quality scanning.
    - field: skill_flags
      type: array
      description: Any skill-level warnings (missing age range, CASEL-style frameworks requiring full teacher review, source-voice preservation warnings if any rewriting was detected).
chains_well_with:
  - curriculum-crosswalk
  - kud-knowledge-type-mapper
  - learning-progression-builder
  - competency-framework-translator
  - scope-and-sequence-designer
teacher_time: 10 minutes
tags:
  - developmental-bands
  - curriculum-alignment
  - band-mapping
  - source-voice-preservation
  - Wiggins-McTighe
  - Vygotsky
  - ZPD
  - framework-translation
---
# 此 Skill 的作用

此 skill 会将一套外部课程框架（课程框架已由课程处理工具拆解为 KUD 项、学习目标以及（可选的）标准）标注为学校的发展阶段标签。学校的阶段模式作为输入提供；该 skill 读取该模式，根据来源的年龄范围推导出与学校阶段范围对应的映射表，并将该映射应用于每个项目。每个项目都会获得一个 `school_band` 值、一个置信度等级以及诊断标志。来源自身的阶段标签会与新的学校阶段标签原样并列保留，因此输出始终可以追溯到原始框架，并结合原始框架进行解读。

该 skill 执行的是元数据操作，而不是内容操作。它不会改写 KUD、LT 或 criteria，也不会重新解释来源的意图。它唯一要回答的问题是：“如果一名教师正在为某个学校阶段进行规划，并打开了这套框架，其中哪些内容与其相关？”当来源阶段跨越两个学校阶段时，该 skill 会采取有意保持保守的处理方式：分配两个候选阶段，设置歧义标志，并记录判定依据。下游 skill，尤其是 Curriculum Crosswalk skill，以及人工规划流程，会由教师运用专业判断解决这些歧义。

该 skill 处理三种常见的来源结构情形。大多数来源具有明确的阶段结构（Welsh CfW Progression Steps、NZ Curriculum Levels、IB PYP/MYP/DP phases），通常可以清晰映射，但偶尔会存在边界歧义。有些来源具有正式但经过压缩的结构（UK RSHE 有四个 Key Stage 标签，但法定文件中实际上只有两个年龄段），在这种情况下，该 skill 会先应用来源实际的 2-band 结构，并通过 `source_band_preserved` 记录正式标签。少数来源完全没有阶段结构（CASEL、某些能力框架），在这种情况下，该 skill 会根据发展性描述而非年龄进行映射，并为每个项目设置供教师审核的标志。

# 证据基础

**Wiggins & McTighe (2005, 2011)** — Understanding by Design 确立了 KUD（Know / Understand / Do）作为框架内容转化为可教学内容时的单元级架构，并将课程对齐定位为一种从既定结果出发的逆向设计操作。Developmental Band Translator 正是作用于 UbD 所规定的 KUD 层，并将学校阶段分配视为逆向设计流程中的一个步骤，该流程最终服务于课堂教师。

**Vygotsky (1978)** — 最近发展区这一概念为以下观点提供了基础：发展阶段划分并不是单纯按年龄进行分区。某一阶段的学习者由其在支持下能够完成的事情所定义，而不仅仅取决于其实际年龄。这为该 skill 在标注时同时使用年龄范围和发展性描述证据提供了依据，也说明了在缺少年龄证据时，该 skill 可以仅根据描述性推理分配学校阶段。

**Heritage (2008)** — 学习进阶相关文献进一步强调，进阶是发展轨迹，而不是日历。该 skill 将学校阶段视为轨迹上的阶段节点。当来源自身的进阶粒度比学校的更粗时（例如 RSHE 的 2-band 结构与学校的 6-band 模式之间的差异），该 skill 会通过歧义标志如实保留这种粗粒度，而不是强行制造虚假的精确性。

**Webb（1997）**——经典的对齐框架定义了四个对齐维度：类别一致性、知识深度一致性、知识范围对应性、表征平衡。Band 翻译主要处理*范围*维度（年龄跨度是否匹配？），并部分涉及*类别一致性*。该 skill 不声称评估知识深度或表征平衡方面的对齐情况；这一限制会在 `skill_flags` 和 Known Limitations 中报告。

# 输入模式

**必需输入。** 该 skill 需要四项输入：

- **`band_schema`** —— 学校或项目的发展阶段定义。必须包括阶段标签、大致年龄或年级范围，以及任何命名分组。该 skill 读取这些内容来构建映射表；它不假定任何特定的阶段体系。*示例*："REAL School Budapest 使用 A–F 阶段——A（Water+Air Dragons，K–2，5–7 岁），B（Earth Dragons，G3–4，7–9 岁），C（Fire Dragons，G5–6，9–11 岁），D（Metal+Light Dragons，G7–8，11–13 岁），E（G9–10，13–15 岁），F（G11–12，15–17 岁）。"
- **`kud_json`** —— KUD 文件。每个条目的必需字段：`item_id`、`content_statement`、`knowledge_type`、`source_block_id`。该 skill 使用 `source_block_id` 在 progression structure 中查找区块原生的阶段标签。
- **`lts_json`** —— LT 文件。每个 LT 的必需字段：`lt_id`、`lt_name`、`lt_definition`、`kud_item_ids`、`knowledge_type`。LT 根据其组成的 KUD 条目继承阶段，其规则为最大跨度规则（见 Prompt）。
- **`progression_structure_json`** —— progression structure。必需字段：`band_labels`、`source_type`，以及顶层的 `age_range_hint` 或每个阶段的 `approximate_age_range`。如果两种年龄范围字段均缺失，该 skill 会在 `skill_flags` 中返回 `request_age_range_context` 并停止运行。

**可选输入。**

- **`criterion_bank_json`** —— 如果提供，也会为 criteria 添加标签。Criteria 继承其父级 LT 的阶段，除非其内容收窄到更具体的年龄范围信号。
- **`source_name`** —— 用于输出元数据的友好名称。
- **`user_age_range_override`** —— 用户提供的年龄范围映射，当来源没有原生阶段结构，且第一次调用因返回 `request_age_range_context` 而停止时使用。

**必需输入的完整示例。** 对 REAL School Budapest 针对 `uk-statutory-rshe` 的运行而言：`band_schema` = "REAL School Budapest 使用 A–F 阶段——A（Water+Air Dragons，K–2，5–7 岁），B（Earth Dragons，G3–4，7–9 岁），C（Fire Dragons，G5–6，9–11 岁），D（Metal+Light Dragons，G7–8，11–13 岁），E（G9–10，13–15 岁），F（G11–12，15–17 岁）"；`kud_json` = 包含 279 个条目的 KUD 文件；`lts_json` = 包含 44 个 LT 的文件；`progression_structure_json` = 一个声明了 `band_labels: ["End of Primary (Year 6)", "End of Secondary (Year 11)"]`、`source_type: "national_statutory_curriculum"`，以及年龄范围分别为 5–11 岁和 11–16 岁的结构。

# 提示

你是一名课程阶段翻译助手。你的任务是为一个外部框架添加学校的发展阶段标签——该框架已经由课程处理框架完成拆解，同时完整保留来源自身的表述和标签，不做任何改动。

## 学校学段架构

仔细阅读提供的 `band_schema`。其中定义了学校的学段标签、年级跨度、年龄范围以及任何命名分组。你生成的所有学段分配都必须使用该架构中定义的学段标签，且必须完全一致。

## 流程

1. **读取进阶结构。** 注意 `source_type`、`band_labels` 和年龄范围。如果 `age_range_hint` 和各学段的 `approximate_age_range` 均不存在，则在 `skill_flags` 中发出 `request_age_range_context`，不要进行任何标记，然后停止。
2. **为该来源构建学段映射表。** 使用 `band_schema` 以及来源中各学段的年龄范围，确定每个来源学段与哪些学校学段存在重叠。如果某个来源学段的年龄范围跨越多个学校学段，则将所有重叠的学校学段列为候选项，并注明存在歧义。如果来源学段能够明确映射到一个学校学段，则记录为低歧义。在继续之前，将此映射表记录在推理中；步骤 3–5 中的每个标记决定都必须能够追溯到该映射表。
3. **标记每一项 KUD。**
   - 查找其 `source_block_id`，以确定来源学段。
   - 应用学段映射表，获得候选学校学段。
   - `school_band`：如果没有歧义，则为单个学段字符串；如果存在歧义，则为学段数组。
   - `band_confidence`：如果只有一个学校学段，且来源年龄范围 ≤ 学校最窄学段跨度，则为 `high`；如果涉及两个学校学段，则为 `medium`；如果涉及三个或更多学段，或仅根据发展性描述推断得出，则为 `low`。
   - `source_band_preserved`：来源中的原生标签必须完全保留，例如 "Key Stage 2"、"End of Primary"、"Progression Step 3"。
   - `source_voice_preserved`：始终为 `true`。如果需要改写内容才能使其适配某个学校学段，则不要改写内容，而应将此字段设为 `false`，并添加一个 skill flag。此字段用于证明未进行改写。
   - `ambiguity_flag`：当 `school_band` 为数组时为 `true`。
   - `teacher_review_flag`：在以下情况下为 `true`：(a) `school_band` 跨越三个或更多学段；(b) 置信度为 `low`；(c) `source_type` 是没有年龄分段的倾向性/能力框架，例如 CASEL；或 (d) 内容陈述包含发展性语言，其所指学段会比来源标签所允许的范围更窄。
   - `band_rationale`：用一句话解释该分配结果。
4. **标记每个 LT。** LT 的学校学段是其组成 KUD 项的学段并集（采用最大跨度规则）。如果任何组成项存在歧义，则该 LT 也存在歧义。如果任何组成项设置了 `teacher_review_flag`，或者该 LT 汇总了三个或更多学校学段，则触发 `teacher_review_flag`。
5. **标记 criteria**（如果提供了 `criterion_bank_json`）。每个 criterion 继承其父 LT 的学段，除非其内容将范围缩小。字段集合与 LT 相同。
6. **输出汇总计数和 skill flags。** 统计每个学校学段的项目数量、歧义标记数量、教师复核标记数量以及低置信度标记数量。如果某个来源中超过 50% 的项目存在歧义，则为其输出一个 skill flag（这表示存在值得复核的结构性不匹配）。

## 来源表述保留规则（硬性约束）

你是在为内容**打标签**，而不是改写内容。不要将内容陈述、LT 定义或标准描述释义、缩短，或“翻译”为学校偏好的表述风格。保持源内容原样不变。你生成的唯一新增文本是 `band_rationale`。

## CASEL / 扁平框架处理

如果 `source_type` 表明这是一个没有年龄结构的能力或倾向性框架（例如 CASEL），且未提供 `user_age_range_override`：
- 对每个项目设置 `teacher_review_flag: true`。
- 对每个项目设置 `band_confidence: low`。
- 根据描述的发育成熟度，将 `school_band` 映射到所提供的 `band_schema` 中的学校分段：早期发展内容（情绪标记、基本自我调节）→ schema 中最早的分段；中期发展内容（观点采择、协作解决问题）→ 中间范围的分段；晚期发展内容（系统层面的社会意识、抽象的伦理推理）→ schema 中较晚的分段。
- 输出 `skill_flag: casel_style_framework_full_teacher_review_required`。

## 输入

- `band_schema`: {{band_schema}}
- `source_name`: {{source_name}}
- `progression_structure_json`: {{progression_structure_json}}
- `kud_json`: {{kud_json}}
- `lts_json`: {{lts_json}}
- `criterion_bank_json`: {{criterion_bank_json}}
- `user_age_range_override`: {{user_age_range_override}}

将带有分段标签的输出生成为符合输出 schema 的单个 JSON 对象。不要改写源内容。不要臆造源内容无法支持的分段。

# 输出示例

**上下文**：已提供 REAL School Budapest 的分段 schema，作为 `band_schema`。来源：UK DfE Statutory RSHE（2025 年 7 月），`progression_structure.band_labels = ["End of Primary (Year 6)", "End of Secondary (Year 11)"]`，`source_type = "national_statutory_curriculum"`。

**已提供的输入**：

```json
{
  "band_schema": "REAL School Budapest uses Bands A–F — A (Water+Air Dragons, K–2, ages 5–7), B (Earth Dragons, G3–4, ages 7–9), C (Fire Dragons, G5–6, ages 9–11), D (Metal+Light Dragons, G7–8, ages 11–13), E (G9–10, ages 13–15), F (G11–12, ages 15–17). Bands are defined primarily by grade level; ages are approximate.",
  "source_name": "UK DfE Statutory RSHE, July 2025",
  "progression_structure_json": "{ \"band_labels\": [\"End of Primary (Year 6)\", \"End of Secondary (Year 11)\"], \"source_type\": \"national_statutory_curriculum\", \"age_range_hint\": { \"End of Primary (Year 6)\": \"5–11\", \"End of Secondary (Year 11)\": \"11–16\" } }"
}
```

**输出**：

```json
{
  "source_metadata": {
    "source_name": "UK DfE Statutory RSHE, July 2025",
    "source_type": "national_statutory_curriculum",
    "source_band_labels": ["End of Primary (Year 6)", "End of Secondary (Year 11)"],
    "skill_version": "1.0",
    "run_timestamp": "2026-04-20T14:05:00Z"
  },
  "band_tagged_kud": [
    {
      "item_id": "blk_0002_item_01",
      "content_statement": "Young people understand the correct terms for different parts of the body",
      "knowledge_type": "Type 1",
      "school_band": ["A", "B", "C"],
      "band_confidence": "medium",
      "source_band_preserved": "End of Primary (Year 6)",
      "source_voice_preserved": true,
      "ambiguity_flag": true,
      "teacher_review_flag": true,
      "band_rationale": "Source groups all primary-age content into one band spanning ages 5–11; REAL Bands A–C cover this same range (5–7, 7–9, 9–11 respectively)."
    },
    {
      "item_id": "blk_0346_item_03",
      "content_statement": "Pupils can communicate their boundaries about physical contact and privacy needs",
      "knowledge_type": "Type 2",
      "school_band": ["A", "B", "C"],
      "band_confidence": "medium",
      "source_band_preserved": "End of Primary (Year 6)",
      "source_voice_preserved": true,
      "ambiguity_flag": true,
      "teacher_review_flag": true,
      "band_rationale": "Statutory End-of-Primary expectation covering ages 5–11; maps to REAL Bands A–C."
    },
    {
      "item_id": "blk_0210_item_02",
      "content_statement": "Students understand the concepts of, and laws relating to, sexual consent",
      "knowledge_type": "Type 1",
      "school_band": ["D", "E"],
      "band_confidence": "medium",
      "source_band_preserved": "End of Secondary (Year 11)",
      "source_voice_preserved": true,
      "ambiguity_flag": true,
      "teacher_review_flag": false,
      "band_rationale": "End-of-Secondary covers ages 11–16; REAL Bands D (11–13) and E (13–15) overlap this range."
    }
  ],
  "band_tagged_lts": [
    {
      "lt_id": "cluster_01_lt_01",
      "lt_name": "Identifying Body Parts and Privacy",
      "school_band": ["A", "B", "C"],
      "band_confidence": "medium",
      "source_band_preserved": "End of Primary (Year 6)",
      "source_voice_preserved": true,
      "ambiguity_flag": true,
      "teacher_review_flag": true,
      "band_rationale": "Aggregated from 4 KUD items all tagged End of Primary; max-span = REAL Bands A–C."
    }
  ],
  "summary_counts": {
    "total_kud_items": 279,
    "total_lts": 44,
    "kud_by_band": {"A-B-C_ambiguous": 176, "D-E_ambiguous": 103},
    "lts_by_band": {"A-B-C_ambiguous": 28, "D-E_ambiguous": 16},
    "teacher_review_flagged": 279,
    "low_confidence": 0
  },
  "skill_flags": [
    "high_ambiguity_rate_structural: 100% of items are ambiguous because source has 2 bands spanning 3 school bands each. This is expected for national_statutory_curriculum sources with compressed band structures; do not treat as a quality failure. Downstream planning must resolve via teacher judgement."
  ]
}
```

# 已知限制

**该 skill 不执行构念对齐。** 两个标记为同一学段的项目，并不因此就代表它们教授的是同一内容。Webb（1997）的分类一致性和知识深度维度不在本 skill 的范围内。该 skill 回答的是“这是否与该年龄段相关”，而不是“这是否符合学校的学习意图”。Curriculum Crosswalk skill 负责处理不同框架之间的关系，但构念对齐仍然需要人工判断。

**歧义无法通过该 skill 消除。** 当来源的学段结构比学校的结构更粗粒度时，尤其是英国 RSHE 的 2 学段结构，或任何学段数量少于学校 schema 的框架，该 skill 会有意保留歧义，而不是进行猜测。较高的歧义率（相对于 6 学段 schema，RSHE 的歧义率最高可达 100%）是对来源粒度的真实反映，并不表示质量失败。歧义会在下游由教师判断解决，这也是 `teacher_review_flag` 存在的原因。

**发展性描述符推断（CASEL 情况）是近似的。** 当框架没有年龄分段时，该 skill 会以描述符为依据，并使用所提供的 `band_schema` 作为参考进行映射：早期发展性描述符 → schema 中最早的学段；系统层面的描述符 → 较晚的学段。这些映射是基于发展心理学共识得出的、具有可辩护性的起点，但并不是框架特定的判定。以这种方式标记的内容应被视为供教师审核的支架，而不是经过验证的映射。

**该 skill 假定输入已经通过 harness 验证。** 它不会重新验证来源分解。如果上游 harness 生成了损坏的 KUD 或 LT 文件（先决条件图中存在循环、缺少 content_statement 等），该 skill 会将这些错误原样传递，并将其标记为学段内容。调用该 skill 前，请先运行 harness 自身的验证门禁。