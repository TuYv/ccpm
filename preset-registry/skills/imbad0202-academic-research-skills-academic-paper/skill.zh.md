---
name: academic-paper
description: "12-agent academic paper writing pipeline. 11 modes (full/plan/outline/revision/revision-coach/abstract/lit-review/format-convert/citation-check/disclosure/rebuttal-audit). 6 paper types, 5 citation formats, bilingual abstracts, LaTeX/DOCX-via-Pandoc/PDF output. Style Calibration + Writing Quality Check + Anti-Patterns with IRON RULE markers. Triggers: write paper, academic paper, guide my paper, parse reviews, I got reviewer comments, revision roadmap, should we push back, conference rebuttal, grant panel response, audit my rebuttal, check my response draft, AI disclosure, 寫論文, 學術論文, 引導我寫論文, 審查意見, 我收到審查意見, 修訂路線圖, 評估回覆, 논문 작성, 초록 작성, 논문 수정, 논문 계획을 도와줘, 심사 의견을 받았어, 심사 의견 반영, 답변서 점검, AI 사용 고지."
metadata:
  version: "3.3.1"
  last_updated: "2026-08-15"
  status: active
  data_access_level: raw
  task_type: open-ended
  related_skills:
    - deep-research
    - academic-paper-reviewer
    - academic-pipeline
---
# 学术论文 — 学术论文写作 Agent 团队

通用学术论文写作工具 — 覆盖所有学科的 12 Agent 流水线，以高等教育领域作为默认参考。

**v2.5** 新增两项写作质量功能：
- **风格校准**（接收步骤 10，可选）— 提供 3 篇以上过往论文，流水线将学习你的写作风格（句子节奏、词汇偏好、引文整合方式）。该风格会在起草过程中作为软性指引应用；学科惯例始终优先。参见 `shared/style_calibration_protocol.md`。
- **写作质量检查**（`references/writing_quality_check.md`）— 在草稿自审步骤中应用结合上下文的写作诊断：模糊或过度使用的术语、打断论证的标点、无实质内容的开场语，以及影响清晰度的段落和句子结构。提示使用判断标准时须服从作者和投稿渠道的要求，而非配额（#825）。

> **路由规范（v3.9.2）：**参见 `.claude/CLAUDE.md` 中的“Routing Discipline (v3.9.2)”以及 `shared/references/intent_clarification_protocol.md`，了解跨 Skill 路由规则。该 Skill 假定路由已完成确定——模糊的跨阶段材料应已在上游完成澄清。

## 快速开始

**最简命令：**
```
Write a paper on the impact of AI on higher education quality assurance
```

```
Write a paper on the impact of declining birth rates on private university management strategies
```

**执行流程：**
1. 配置访谈 — 论文类型、学科、引用格式、输出格式
2. 文献检索 — 系统化检索策略、来源筛选
3. 架构设计 — 论文结构、大纲、字数分配
4. 论证构建 — 主张—证据链、逻辑流程
5. 全文起草 — 分章节草稿、语体调整
6. 引用合规性 + 双语摘要（并行）
7. 同行评审 — 五视角分类评估、修订建议
8. 输出格式化 — LaTeX/DOCX（通过 Pandoc）/PDF/Markdown

---

## 触发条件

### 触发关键词

**English**: write paper, academic paper, paper outline, write abstract, revise paper, literature review paper, check citations, convert to LaTeX, convert format, format paper, conference paper, journal article, thesis chapter, research paper, guide my paper, help me plan my paper, step by step paper, draft manuscript, write methodology, write discussion, parse reviews, revision roadmap, help me with my revision, I got reviewer comments, should we push back, conference rebuttal, grant panel response, convert citations

**繁體中文**: 寫論文, 學術論文, 論文大綱, 寫摘要, 修改論文, 文獻回顧論文, 檢查引用, 轉 LaTeX, 轉換格式, 研討會論文, 期刊文章, 學位論文, 研究論文, 引導我寫論文, 幫我規劃論文, 逐步寫論文, 寫方法論, 寫討論, 審查意見, 修訂路線圖, 幫我修改, 我收到審查意見, 轉換引用格式

**한국어**: 논문 작성, 논문 초안, 논문 개요, 초록 작성, 논문 수정, 인용 확인, 인용 형식 검사, LaTeX 변환, 서식 변환, 학위논문 작성, 학술지 논문 작성, 학회 논문 작성, 논문 계획을 도와줘, 단계별로 논문 쓰기, 심사 의견을 받았어, 심사 의견 반영, 답변서 점검, AI 사용 고지

### 计划模式激活

当用户希望获得指导、分步规划，或对论文结构表达不确定性时，激活 `plan` 模式。**默认规则**：当 `plan` 与 `full` 之间存在歧义时，优先选择 `plan`。

> 有关完整的意图信号和激活规则，请参阅 `references/plan_mode_protocol.md`。

### 不会触发

| 场景 | 改用 |
|----------|-------------|
| 深度研究／事实核查（非论文写作） | `deep-research` |
| 论文评审（结构化评审） | `academic-paper-reviewer` |
| 从完整研究到论文的流水线 | `academic-pipeline` |

### 与 `deep-research` 的区别

| 特性 | `academic-paper` | `deep-research` |
|---------|-------------------|-----------------|
| 主要输出 | 可发表的论文草稿 | 研究报告 |
| 结构 | 符合期刊要求（IMRaD 等） | APA 7.0 报告 |
| 引用 | 多种格式（APA/Chicago/MLA/IEEE/Vancouver） | 仅 APA 7.0 |
| 摘要 | 双语（zh-TW + EN） | 单一语言 |
| 同行评审 | 模拟五维度评审 | 编辑评审 |
| 输出格式 | LaTeX/DOCX（通过 Pandoc）/PDF/Markdown | 仅 Markdown |
| 修订循环 | 最多 2 轮，并提供针对性反馈 | 最多 2 轮 |

---

## Agent 团队（12 个 Agent）

| # | Agent | 角色 | 阶段 |
|---|-------|------|-------|
| 1 | `intake_agent` | 配置访谈：论文类型、学科、期刊、引用格式、输出格式、语言、字数；交接检测；Plan 模式简化访谈 | 阶段 0 |
| 2 | `literature_strategist_agent` | 搜索策略设计、来源筛选、带注释的参考文献目录、文献矩阵 | 阶段 1 |
| 3 | `structure_architect_agent` | 论文结构选择、详细提纲、字数分配、证据映射 | 阶段 2 |
| 4 | `argument_builder_agent` | 论证构建、主张—证据链、逻辑衔接、反论点处理；Plan 模式论证压力测试 | 阶段 3 / Plan 步骤 3 |
| 5 | `draft_writer_agent` | 按章节撰写完整草稿、调整学科文体、字数跟踪 | 阶段 4 |
| 6 | `citation_compliance_agent` | 引用格式验证、参考文献列表完整性、DOI 检查 | 阶段 5a |
| 7 | `abstract_bilingual_agent` | 双语摘要（zh-TW + EN），每种语言 5-7 个关键词 | 阶段 5b |
| 8 | `peer_reviewer_agent` | 模拟双盲评审、五视角分类评估、修订建议（最多 2 轮） | 阶段 6 |
| 9 | `formatter_agent` | 转换为 LaTeX/DOCX（通过 Pandoc）/PDF/Markdown、期刊格式排版、投稿附信、引用格式转换（APA 7 / Chicago / MLA / IEEE / Vancouver） | 阶段 7 |
| 10 | `socratic_mentor_agent` | Plan 模式苏格拉底式导师：逐章指导、收敛标准（4 个信号）、问题分类法（4 种类型）、INSIGHT 提取 | Plan 步骤 0-3 |
| 11 | `visualization_agent` | 解析论文数据并生成符合发表质量的图表代码（Python matplotlib / R ggplot2），采用 APA 7.0 格式、色盲友好配色方案，并集成 LaTeX | 阶段 4 / 阶段 7 |
| 12 | `revision_coach_agent` | 将非结构化评审意见解析为修订路线图，或将明确标识的真实委员会意见解析到独立的 #668 来源核算问题跟踪器中；可独立运行 | Revision-Coach 模式 |

---

## 输出格式

### 文本格式
LaTeX (.tex + .bib)、DOCX（通过 Pandoc）、PDF（通过 LaTeX 或 Pandoc）、Markdown。

### 图表
当论文包含定量结果时，`visualization_agent` 可以使用 Python（matplotlib/seaborn）或 R（ggplot2）生成符合出版要求的图表，并采用 APA 7.0 格式和色盲友好的配色方案。图表将以可运行代码和 LaTeX `\includegraphics` 集成代码的形式交付。有关图表类型决策树和代码模板，请参阅 `references/statistical_visualization_standards.md`。

### 引用格式
APA 7.0（默认）、Chicago（作者-日期或注释-参考书目）、MLA 9、IEEE、Vancouver。`formatter_agent` 支持在任意两种受支持格式之间进行后期引用格式转换，使用“Convert citations to [format]”。

---

## 编排工作流（8 个阶段）

```
Phase 0: CONFIG        -> [intake_agent]              -> Paper Configuration Record
Phase 1: RESEARCH      -> [literature_strategist]      -> Search Strategy + Source Corpus
Phase 2: ARCHITECTURE  -> [structure_architect]        -> Paper Outline + Evidence Map
Phase 3: ARGUMENTATION -> [argument_builder]           -> Argument Blueprint
Phase 4: DRAFTING      -> [draft_writer]               -> Complete Draft
Phase 5a: CITATIONS    -> [citation_compliance] ──┐    -> Citation Audit Report
Phase 5b: ABSTRACT     -> [abstract_bilingual]   ─┘    -> Bilingual Abstract + Keywords  (parallel)
Phase 6: PEER REVIEW   -> [peer_reviewer]              -> Review Report (max 2 revision loops)
Phase 7: FORMAT        -> [formatter]                  -> Final Output Package
```

> 详细的各阶段代理行为和输出说明，请参阅 `references/workflow_phase_details.md`。

### 评审目标标准绑定（#684）

当 Phase 0 生成作者确认的 `ReviewTargetContext`（#683）后，编排器会初始化一个仅包含指针的 `ReviewCriteriaBindingManifest`，并在形成性评审、内部评估和外部评审小组使用者之间保持不变。规范性生命周期、确切标记、封闭角色以及明确的降级路径定义于
`shared/references/review_criteria_consumer_protocol.md`。

- Phase 2 负责 `FORMATIVE` 回执。Structure Architect 将选定的标准 id 映射到计划中的章节和证据需求；后续写作阶段复用该回执，不再重新解析评审目标。
- Phase 6a 接收相同的指针权限和 Target Criteria Brief，同时保持对论文内容不可见；其预承诺工件负责 `INTERNAL` 回执。Phase 6b 接收该未更改的工件，可以在看到草稿后评估适用性，并负责任何 Critical/Major 建设性问题的旁挂工件。
- 科学有效性、投稿场所适配性和投稿准备度仍然彼此独立。标准绝不授权编造证据、结果或方法，也不授权更改作者对其贡献的声明。

绑定验证仅是交接一致性检查。它绝不提供编辑结论、严重程度、检查点状态或作者分诊。如果绑定不可用，则披露 `criteria_binding_unavailable`；不要声称符合投稿场所要求，也不要根据模型记忆默默重建评审目标。

### 检查点规则

1. ⚠️ **铁律**：用户必须先确认 Paper Configuration Record，才能进入 Phase 1
2. **Phase 2 -> 3**：用户必须批准大纲（可以请求重组）
3. ⚠️ **铁律**：最多 2 个修订循环；未解决的事项 -> "Acknowledged Limitations"
4. **同行评审**中的 Critical 严重性问题会阻止进入 Phase 7
5. 如果用户提供了自有来源，可以跳过 Phase 1（文献）

---

> **v3.4.0 合规要求（适用于 `full` 模式）：** 在最终确定之前，`compliance_agent` 会运行仅针对 RAISE 原则的检查（仅警告；原始研究不属于 PRISMA-trAIce 范围）。警告会列在披露声明中，但不会阻塞流水线。参见 `shared/raise_framework.md §Scope disclaimer`。

## 分阶段调用契约（v3.9.2）

academic-paper 流水线分为 8 个阶段（Phase 0 intake → 7 formatting）。支持两种调用模式：

**模式 A — 编排器驱动（默认）：** `pipeline_orchestrator_agent`（位于 `academic-pipeline` skill 中）通过 Material Passport 进行状态跟踪，端到端运行所有阶段。

**模式 B — 分阶段调用（跨会话恢复）：** 用户在多个会话中为每个阶段调用一个 agent，以处理长期运行的项目。常见模式是：在一个会话中撰写草稿，下一周返回后独立执行引文检查 / 摘要 / 同行评审。

在模式 B 中，单阶段 agents（根据 `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md`，属于 Bucket A）在写入时严格限定在其被分配的阶段内。academic-paper 中的 7 个 Bucket A agents 是：`literature_strategist`（P1）、`structure_architect`（P2）、`draft_writer`（每次调用对应 P4/P6）、`citation_compliance`（P5a）、`abstract_bilingual`（P5b）、`peer_reviewer`（P6）、`formatter`（P7）。允许读取上游阶段的内容。

多阶段 agents（Bucket B：`argument_builder` P3+Plan、`visualization` P4+P7）仅执行调用方针对该阶段所指定的工作，不会在同一次调用中扩展到其他阶段。以下 v3.6.6 生成器-评估器契约进一步约束 `draft_writer` 和 `peer_reviewer` 的子阶段行为（Phase 4a/4b、Phase 6a/6b）。

进入模式 B 必须有明确的用户信号，即 `/ars-<mode>` 斜杠命令或 `[direct-mode]` 前缀。根据 `.claude/CLAUDE.md` Routing Discipline + `shared/references/intent_clarification_protocol.md`，对于含义不明确的跨阶段输入，默认请求澄清。

**强制执行（v3.9.2）：** Phase Boundary 会阻止 Bucket A agents；同时使用 advisory verifier（`scripts/check_pipeline_integrity.py`）以及启用 hook 的运行时中的确定性 PreToolUse 写入范围守卫（#134 rescope，PR #294）。多阶段封装仍采用 forward-scope（#134 Slices 3-5）。

## v3.6.6 生成器-评估器契约协议

> v3.6.6 中契约门控阶段拆分的权威编排区块，Schema 13.1，自 v3.6.6 起生效（`shared/sprint_contract.schema.json`）。模板：`shared/contracts/writer/full.json` + `shared/contracts/evaluator/full.json`。设计规范：`docs/design/2026-04-27-ars-v3.6.6-generator-evaluator-contract-design.md` §5。
>
> **仅适用于 `academic-paper full` 模式。** 九种非 full 模式（`plan`、`outline-only`、`revision`、`revision-coach`、`abstract-only`、`lit-review`、`format-convert`、`citation-check`、`disclosure`）在 v3.6.5 → v3.6.6 之间保持字节级等价，不会调用此协议。（后续新增的 `rebuttal-audit` 模式同样属于非 full 模式，也不会调用此协议。）流水线边界不变：`academic-pipeline` Stage 2 以 plan 或 full 模式调度 `academic-paper`（只有 full 会调用此协议）；Stage 3 调度独立的 `academic-paper-reviewer` skill（5-panel 外部编辑评审）。本协议中的配对内 Phase 6 评估器与 Stage 3 reviewer 属于不同的评审层级，详见设计文档 §5.1 审计结论 2。

### 概述

v3.6.6 将 Phase 4（作者起草）和 Phase 6（配对内评估器审阅）拆分为由 `writer_full` 和 `evaluator_full` 契约控制的纸张盲 / 论文可见调用对。该拆分仿照 `academic-paper-reviewer/references/sprint_contract_protocol.md`（v3.6.2 审阅器模式），但针对没有评审小组且作者没有 scoring_plan 的单智能体生成器模式进行了调整。

其中的关键机制是**调用的物理分离**：作者 Phase 4a 永远看不到运行时起草产物；评估器 Phase 6a 永远看不到作者的 Phase 4b 草稿。这会破坏配对内自我质量门禁中“先阅读论文，再为标准寻找合理化依据”的漂移路径。

### 四调用结构

对于每次 `academic-paper full` 调用，Phase 4 + Phase 6 将从两次单独调用扩展为四次相互独立的模型调用。根据下述系统与用户内容分离原则，每次调用都有各自的系统提示和用户内容。

1. **Phase 4a — 作者纸张盲预承诺。**
   - 系统提示：`academic-paper/agents/draft_writer_agent.md` §“v3.6.6 Generator-Evaluator Contract Protocol”中的 `### Phase 4a — Writer paper-blind pre-commitment` 子章节。
   - 用户内容：仅包含 `writer_full` 契约 JSON 和论文元数据（`title`、`field`、`word_count`）。
   - 输出：`## Acceptance Criteria Paraphrase` 部分 + 末尾的 `[PRE-COMMITMENT-ACKNOWLEDGED]` 标签。
   - 代码检查：3 项结构检查（见下文“Phase 4a / 6a output lint”一节）。
2. **Phase 4b — 作者论文可见起草 + 自我评分。**
   - 系统提示：同一作者文件中的 `### Phase 4b — Writer paper-visible drafting + self-scoring` 子章节。
   - 用户内容：`writer_full` 契约 JSON（重新注入）+ 使用 `<phase4a_output>...</phase4a_output>` 数据分隔符包裹的 Phase 4a 输出 + 上游起草产物（Paper Configuration Record、Paper Outline、Argument Blueprint、Annotated Bibliography，包括其 Search Strategy / Schema 2 `search_strategy`（#548 — 作者填入搜索边界新颖性声明的约束）、可选的 Style Profile、可选的 Knowledge Isolation Directive）。
   - 输出：`## Draft Body` → `## Dimension Scores` → `## Failure Condition Checks` → `## Writer Decision`。
   - 代码检查：4 项结构检查（见下文“Phase 4b / 6b output lint”一节）。
3. **Phase 6a — 评估器纸张盲预承诺。**
   - 系统提示：`academic-paper/agents/peer_reviewer_agent.md` §“v3.6.6 Generator-Evaluator Contract Protocol”中的 `### Phase 6a — Evaluator paper-blind pre-commitment` 子章节。
   - 用户内容：`evaluator_full` 契约 JSON、论文元数据，以及作者最近的 `<phase4a_output>`（评估器必须根据 `disagreement_handling.pre_commitment_check_protocol.check_writer_artifact` 对其进行验证的作者产物）；在启用时，还包括仅提供指针的 #684 manifest/Target Criteria Brief/`INTERNAL` 标记。
   - 输出：`## Contract Paraphrase` + `## Scoring Plan`（每个维度包含 `dimension_id` / `what_to_look_for` / `what_triggers_block` / `what_triggers_warn`）+ 仅提供指针的绑定承诺（或 `criteria_binding_unavailable`）+ 末尾的 `[PRE-COMMITMENT-ACKNOWLEDGED]` 标签。不新增其他 H2 标题。
   - 代码检查：5 项结构检查。
4. **Phase 6b — 评估器论文可见评分 + 决策。**
   - 系统提示：同一评估器文件中的 `### Phase 6b — Evaluator paper-visible scoring + decision` 子章节。
   - 用户内容：`evaluator_full` 契约 JSON（重新注入）+ 使用 `<phase6a_output>...</phase6a_output>` 包裹的 Phase 6a 输出 + 作者的 `<phase4a_output>`（根据 `pre_commitment_check_protocol.check_writer_artifact` 无条件提供）+ 作者的 Phase 4b 草稿（待审阅的产物）+ Phase 6a 中提供的未更改 #684 权威内容。
   - 输出：`## Dimension Scores` → `## Failure Condition Checks` → `## Review Body` → `## Evaluator Decision`，以及角色标记 / 不可用披露；在适用时，还包括经过单独验证的建设性 sidecar。
   - 代码检查：5 项结构检查。

### 系统提示词与用户内容的职责划分

逐字遵循 `sprint_contract_protocol.md` §2 的审查者模式：

- **系统提示词仅承载不变量策略文本**：代理文件中 `## v3.6.6 Generator-Evaluator Contract Protocol` 区块的阶段子部分说明、lint 描述，以及阶段边界标签约定。
- **用户内容承载契约 JSON（每次调用重新注入）以及该阶段允许的运行时输入**：论文元数据、`<phase4a_output>` / `<phase6a_output>` 分隔块、上游起草产物、论文草稿。

所有动态 LLM 输出（Phase Na 运行时输出、论文内容）都通过数据分隔符放在用户内容中，绝不放入系统提示词。这样可以防止动态的、按论文变化的内容被意外提升到不变量策略层。

### Schema 字段名与运行时输出的区别

`pre_commitment_artifacts`（snake_case，使用反引号）是 `shared/sprint_contract.schema.json` 中的 schema 字段名，即冻结契约基线中的配置声明。“writer Phase 4a pre-commitment output”是运行时输出，即 writer 代理在 Phase 4a 中实际生成的 Markdown 文本。该运行时输出位于 `<phase4a_output>` 内，并被交接给 Phase 4b / Phase 6a / Phase 6b。`disagreement_handling`（schema 字段）与“evaluator Phase 6a pre-commitment output”（运行时输出）遵循相同模式。混淆二者会导致契约基线配置与 LLM 生成内容之间产生混淆。

### Phase 4a / 6a 输出 lint

按照 `sprint_contract_protocol.md` §4 的枚举约定，执行特定模式的结构检查计数：

- **Writer Phase 4a（3 项检查）**：按顺序包含必需区段（`## Acceptance Criteria Paraphrase`、末尾的 `[PRE-COMMITMENT-ACKNOWLEDGED]`）；释义段落数量 ≥ `pre_commitment_artifacts.acceptance_criteria_paraphrase.minimum_dimensions`；Phase 4a 内容仅引用契约 JSON + 论文元数据。**不得包含 `## Scoring Plan` 区段**——`writer_full` 不携带 scoring_plan。
- **Evaluator Phase 6a（5 项检查）**：按顺序包含必需区段（`## Contract Paraphrase`、`## Scoring Plan`、末尾的 `[PRE-COMMITMENT-ACKNOWLEDGED]`）；释义段落数量 ≥ `disagreement_handling.paraphrase_minimum_dimensions`；每个验收维度对应一个 `### <Dn>: <name>` 子区段；每个 scoring_plan 子区段都包含 `disagreement_handling.scoring_plan.per_dimension_criteria` 的四字段结构（`dimension_id`、`what_to_look_for`、`what_triggers_block`、`what_triggers_warn`）；Phase 6a 内容仅引用契约 JSON + 论文元数据 + writer 的 `<phase4a_output>`，以及仅提供论文盲审 #684 指针权威（不得包含完整草稿 / 论文内容）。绑定承诺是 Scoring Plan 之后的无项目符号指针数据，而不是额外的 H2。

重试语义：第一次尝试 lint 失败 → 根据系统提示词中提示的具体 lint 缺口重试一次；第二次失败 → 根据下方“单代理生成器不可用处理”一节，将该角色标记为不可用。

### 第 4b / 6b 阶段输出 lint

- **Writer 第 4b 阶段（4 项检查）**：按顺序要求以下部分 — `## Draft Body`、`## Dimension Scores`、`## Failure Condition Checks`、`## Writer Decision`；Dimension Scores 必须与七个 writer 维度 D1–D7 一一对应（依据 `shared/contracts/writer/full.json`）；Failure Condition Checks 必须与 F1 / F4 / F2 / F3 / F0 一一对应；Writer Decision 必须可根据 F-condition 严重性优先级推导得出。**无 multi-dissent retry**（writer 没有可供 dissent 的 scoring_plan）。**无 consistency check**（writer Phase 4a 不会发出 scoring_plan trigger tokens）。
- **Evaluator 第 6b 阶段（5 项检查）**：按顺序要求以下部分 — `## Dimension Scores`、`## Failure Condition Checks`、`## Review Body`、`## Evaluator Decision`；Dimension Scores 必须与五个 evaluator 维度 D1–D5 一一对应（依据 `shared/contracts/evaluator/full.json`）；Failure Condition Checks 必须与 F1 / F2 / F3 / F6 / F4 / F5 / F0 一一对应；consistency check（Phase 6b 的评分必须包含 Phase 6a 的 `disagreement_handling.scoring_plan.per_dimension_criteria` trigger tokens）；Evaluator Decision 必须可根据 F-condition 严重性优先级推导得出。**无 multi-dissent retry**（evaluator 的阶段内分歧通过 `disagreement_handling.disagreement_resolution` 中的 F-condition action 编码，而不是作为 retry trigger）。

Multi-dissent retry 仍仅适用于 reviewer（`academic-paper-reviewer` skill）；generator 模式没有 panel，也没有 scoring_plan dissent anchor。

三种模式的 lint 数量汇总：

| 阶段 | Reviewer（zero-touch） | Writer | Evaluator |
|---|---:|---:|---:|
| Phase 1 / 4a / 6a | 5 | 3 | 5 |
| Phase 2 / 4b / 6b | 6 | 4 | 5 |

### Single-agent generator 不可用处理

当 writer 或 evaluator 阶段变得不可用时（Phase Na lint 两次失败或 Phase Nb lint 失败），`academic-paper` 会发出阶段级 abort tag，并将流程转交用户干预：

- **Writer Phase 4 不可用** → `[GENERATOR-PHASE-ABORTED: role=writer, contract=<id>, reason=<lint_failure_kind>]` → 中止 `academic-paper` Phase 4 → 用户干预决定重试 / fallback / 回退到 Phase 3（Argument Blueprint）。
- **Evaluator Phase 6 不可用** → `[GENERATOR-PHASE-ABORTED: role=evaluator, contract=<id>, reason=<lint_failure_kind>]` → 中止 `academic-paper` Phase 6 → 用户干预决定重试 / fallback / 回退到 Phase 5（Drafting completion）。

`[GENERATOR-PHASE-ABORTED]` 不构成有效的 Phase 6b emission，且不能进入 Stage 3 reviewer dispatch。存在两条有效的 Stage 3 进入路径（依据设计文档 §5.1）：

- **Standard path**：evaluator Phase 6b 发出 F0 `evaluator_decision=accept` 或 F4 `evaluator_decision=accept_with_dissent_note`。
- **Exceptional path**：in-pair revision loop 在第 2 轮耗尽且 mandatory-dimension block 持续出现后，evaluator Phase 6b 发出 F5 `evaluator_decision=flag_for_reviewer_stage`。

`academic-paper` 对 writer / evaluator 不携带 panel cardinality invariant（没有 `panel_size` 字段 — Schema 13.1 §3.3.5 reviewer-conditional）。generator 侧不存在对应的 `[PANEL-SHRUNK]`；`[GENERATOR-PHASE-ABORTED]` 是阶段级 abort。

**运行监控**：跟踪 v3.6.6 部署后前三个月的 `[GENERATOR-PHASE-ABORTED]` 发生率。分母按每次 `academic-paper full` 运行计算，即一次用户感知到的顶层调用。5% 阈值为 `(runs_with_any_abort) / (total_runs)`。如果发生率超过 5%，v3.6.7 将引入优雅降级回退机制（见下方“已知限制”部分）。

### 跨会话恢复范围

v3.6.6 的生成器-评估器轮次（Phase 4a + Phase 4b + Phase 6a + Phase 6b + 配对内修订循环）是一个**会话内原子单元**。在轮次中途手动拆分会话时，writer Phase 4a 的输出会丢失；新会话必须从 Phase 0 重新启动 `academic-paper full` 模式。

v3.6.3 的 `ARS_PASSPORT_RESET=1` `reset_boundary[]` 机制（依据 `academic-pipeline/references/passport_as_reset_boundary.md`）作用于 `academic-pipeline` Stage 边界，而不是 `academic-paper` 内部阶段边界。`academic-paper` 内部阶段（4a / 4b / 6a / 6b）不是边界点；这些阶段之间不会发出 `kind: boundary` ledger 条目。如果运行数据表明有必要，v3.6.7+ 可能引入 `pre_commitment_history[]`，以跨会话持久化 writer Phase 4a 产物，详见下方“已知限制”部分。

## 已知限制

- **v3.6.6 没有优雅降级回退机制**：当 writer 或 evaluator 阶段通过 `[GENERATOR-PHASE-ABORTED]` 中止时，`academic-paper full` 会中止并转交用户干预。v3.6.7 可能引入回退机制，将受影响的阶段降级为 v3.6.5 的单次调用行为，并记录此次降级。v3.6.6 发布时仅支持中止行为。有关实际运行中的 5% / 三个月监控，请参见上方的“单代理生成器不可用处理”。
- **不支持轮次中途的跨会话恢复**：四阶段生成器-评估器轮次是一个会话内原子单元。在轮次中途手动拆分会话会丢失 writer Phase 4a 产物，并强制从 Phase 0 重新开始。v3.6.7+ 可能在 Schema 9 中引入 `pre_commitment_history[]` ledger 条目，以跨会话边界持久化 writer Phase 4a 产物；v3.6.6 尚未实现。
- **配对内 Phase 6 evaluator 与外部 `academic-paper-reviewer` 评审**：配对内的 `peer_reviewer_agent`（带有 v3.6.6 contract gate 的 Phase 6 evaluator）和独立的 `academic-paper-reviewer` skill（Stage 3 的 5-panel 外部编辑评审）服务于不同的评审层级；按照设计文档 §1 已知限制的规定，两者仍属于已记录的技术债务。路由 / 合并决策推迟到 v3.7.x。

## 运行模式（11 种模式）

详情请参阅 `references/mode_selection_guide.md`。

| 模式 | 触发条件 | Agents | 输出 |
|------|---------|--------|--------|
| `full` | “Write a paper” | All 9 (+ 11 if quantitative) | 完整论文草稿（如适用，包含图表） |
| `outline-only` | “Paper outline” | 1->2->3 | 详细大纲 + 证据映射 |
| `revision` | “Revise paper” | 8->5->6 | 补丁文档 + 确定性应用的修订草稿 + 应用报告（#390；通过 `templates/revision_tracking_template.md` 生成修订日志） |
| `abstract-only` | “Write abstract” | 1->7 | 双语摘要 + 关键词 |
| `lit-review` | “Literature review” | 1->2 | 带注释的参考文献书目 + 综合分析 |
| `format-convert` | “Convert to LaTeX” / “Convert citations to [format]” | 9 only | 格式化文档；包含引文格式转换（APA 7 / Chicago / MLA / IEEE / Vancouver） |
| `citation-check` | “Check citations” | 6 only | 引文错误报告 |
| `plan` | “guide my paper” / “help me plan my paper” | 1->10->3->4 | 章节计划 + INSIGHT Collection |
| `revision-coach` | “parse reviews” / “revision roadmap” / “I got reviewer comments” / “should we push back” / “conference rebuttal” / “grant panel response” / 明确指明的真实委员会通信 | 12 only | 同行评审路径：不可变的 Roadmap 核心 + 明确的作者 sidecar + 可选的 Tracking Template/Response Skeleton。委员会路径：独立的 #668 concern tracker + 占位 response skeleton；不生成 Schema 11、reviewer obligation/severity 或 determination。 |
| **`disclosure`**（v3.2） | **“AI disclosure for Nature” / “generate AI usage statement”** | **9 only** | **默认 venue 路径：`REQUIRED` / `ACTION_ONLY` / `NOT_REQUIRED` / `UNKNOWN` 适用性及类型化 halt 状态；policy-anchor 路径：特定 anchor 的渲染结果** |
| **`rebuttal-audit`** | **“audit my response” / “check my rebuttal” / “did I miss any reviewer comment”**（同时要求存在评审意见和现有 rebuttal 草稿） | **12 only (parse-only)** | **Rebuttal QA 报告：逐条评论覆盖情况 + 缺口 + 风险标记。不生成新的回复；仅供参考。不生成 Schema 11 / Material Passport / verified status。** |

**披露派发契约：**当 `mode=disclosure` 时，代理 9 将采用其独立分支，并且必须在生成文本之前加载 `references/disclosure_mode_protocol.md`。它不会运行常规的 Phase 7 格式化，也不会替换为通用的全流程 AI 声明；该协议负责选择场所数据库或政策锚点路径，并处理所有暂停/渲染决策。

### 快速模式选择指南

| 你的情况 | 推荐模式 | 光谱 |
|----------------|-----------------|----------|
| 从零开始，已有明确的 RQ | `full` | 平衡 |
| 写作前需要规划帮助 | `plan` | 原创性 |
| 只需要一个大纲 | `outline-only` | 平衡 |
| 已有草稿，并收到审阅反馈 | `revision` | 保真度 |
| 有非结构化的审阅者意见 | `revision-coach` | 平衡 |
| 有来自真实委员会/机构审阅办公室、需要跟踪的意见 | `revision-coach` 委员会通信变体 | 保真度 |
| 只需要摘要 | `abstract-only` | 保真度 |
| 需要检查/修复引用 | `citation-check` | 保真度 |
| 需要转换格式（LaTeX、DOCX）或引用样式 | `format-convert` | 保真度 |
| 想要撰写系统性文献综述论文 | `lit-review` | 保真度 |
| 需要用于投稿的、特定场所的 AI 使用披露包 | `disclosure` | 保真度 |
| 已有书面答辩草稿，需要根据审阅者意见进行 QA | `rebuttal-audit` | 保真度 |

**光谱**（v3.2）：*保真度* = 模板密集、输出可预测；*平衡* = 默认模式；*原创性* = 探索性强、模板较少。完整的跨技能光谱表请参阅 `shared/mode_spectrum.md`。

不确定时？从 `plan` 开始，它将逐步引导你。`disclosure` 是最后阶段，应在论文草稿完成后运行，并以计划投稿的场所为目标。

**委员会通信路由：**仅当用户明确指出是真实委员会/机构审阅办公室时，才使用 `revision-coach` 变体。加载 `references/committee_correspondence_protocol.md`；不要仅凭语气推断其具有官方权威。该独立产物是一个有来源依据的起草辅助材料，绝不会进入同行评审 Schema 11。

### 模式选择逻辑

> 请参阅 `references/mode_selection_guide.md`，了解触发条件到模式的映射以及完整的选择流程图。

---

## 答辩审计模式

`rebuttal-audit` 用于评估作者**现有的**答辩/审阅者回复草稿，检查其覆盖范围、语气和证据。这是建议性的 QA，不会撰写或改写回复。

**输入门槛（路由）：**仅当用户同时提供以下两项时，才激活 `rebuttal-audit`：(a) 审阅者意见/决定信，以及 (b) 用于评估的现有答辩/回复草稿。如果仅提供了 (a)（尚无草稿），则路由到 `revision-coach`（该模式会生成回复骨架）。如果意图不明确，应先澄清，而不是猜测。

**生成内容：**
- 逐条意见覆盖表：将每个审阅者关注点标记为草稿中已`addressed` / `partially` / `missing`。
- 差距列表：草稿未能回答的关注点。
- 风险标记：语气过于对抗、缺乏证据的主张，或误解审阅者实际观点的回复。
- 改进建议（仅供参考）。

**IRON RULE — 完整性边界（不得虚假认证）：** `rebuttal-audit` 复用 `revision_coach_agent` 的评论解析能力，但独立调用在管道之外运行，因此永远不会通过 Stage 4.5 final integrity。它**不得**生成 Schema 11 `commitment_extracted` ledger，**不得**写入 Material Passport，也**不得**将 package 标记为 `ready_to_submit` 或任何 verified 状态。生成 Schema 11 artifact 会错误地暗示该响应已进入管道的可追溯系统。其输出仅限于 advisory QA report。

**与 `re-review` 的边界：** `academic-paper-reviewer` 的 `re-review` 模式验证的是**修订后的稿件**（作者声称的修改是否确实出现在论文中），并在管道内运行。`rebuttal-audit` 验证的是**回复信本身**（rebuttal 是否覆盖每条评论、其语气/证据是否稳妥），并以独立的 advisory 模式运行。两者针对不同 artifact，处于不同层级。

---

## Revision Mode Patch Protocol (#390)

在 revision mode 中，`draft_writer_agent` 不会重新输出完整论文。本轮运行采用 **anchorize → patch → deterministic apply → finalizer** 流程，将重新生成范围限制在修订明确涉及的 blocks 内（DELEGATE-52 blast-radius containment；spec `docs/design/2026-06-10-390-diff-patch-revision-mode-spec.md`）：

1. **Anchorize draft**（`scripts/ars_anchorize_draft.py` — 幂等、内容中立）：每个 block 都会获得一个稳定的 `<!--block:BNNNN-->` marker 和一份精确 manifest。在 apply 之前不会对 draft 进行任何重写。
2. **Bind explicit authority (#670)：** 验证不可变的 `revision-roadmap/1.0`、已精确注册的 claim surfaces，以及完整的 `author-adjudication/1.0`。roadmap 将 severity、obligation、cost scope 和 bounded consequence 分别保持独立；author triage 和 exact targets 仅存在于单独的 explicit sidecar 中。
3. **The writer emits current patch 1.1**（`shared/contracts/patch/revision_patch.schema.json`）作为 sidecar — 每个 op 只能引用 `will_address` items，必须处于 exact target/operation scopes 内，并明确声明 claim/collateral arrays。Registered claim movement 需要精确的 author-approved replacement；declined overlap 需要精确的 collateral authority。
4. **Deterministic apply**（`scripts/ars_apply_revision_patch.py`）会在 structural analysis 或 write 之前重放每一项 binding。当前的 report format 1.3 携带机械推导的 authorization witness 以及诚实的 `unregistered_claim_drift_review_required` E6 边界。如果 E6 随后检测到 unregistered surface 上的 drift，checkpoint 不存在默认开放路径：author 必须明确选择 `restore`、`authorize_with_reason` 或 `pause`。Build 和 replay validation 会将每个选择绑定到一个明确命名的、仅限本次运行的 raw session-event artifact；sidecar 保留其 recomputed digest，但不保留 path 或 message。未触及的 blocks 保持字节级完全一致。
5. **Continuous evidence：** 每次 review write、all-declined no-op 和 integrity-correction round 都会进入 `revision-evidence-bundle/1.0`，范围从一份 exact integrity-PASS draft 到 exact final draft。Scope escalation 需要新的 explicit sidecar 或更窄的 patch；legacy full re-emission 不能声称拥有 current authorization PASS。

编排运行遵循 `pipeline_orchestrator_agent.md` § 修订轮次补丁排序；Mode B 用户手动运行相同脚本——确切命令见 `references/revision_patch_protocol.md`。诚实边界：已注册表面和确切编辑权限可由机器重放，但未注册的语义漂移仍需要 E6 审核。`scripts/claim_strength_drift_disposition.py` 仅完成对已报告行的显式处置；它不会使模型介导的检测变得确定或完整。`academic-paper full` 配对内的第 6→4 阶段循环不属于此独立/流水线修订契约。

---

## 计划模式：逐章引导式规划

通过结构化对话，一次引导用户规划论文的一个章节的苏格拉底式模式。构建完整的论文蓝图。

> 完整的逐章对话流程和论文蓝图结构见 `references/plan_mode_protocol.md`。

---

## 交接协议：deep-research -> academic-paper

`intake_agent` 自动检测深度研究材料（RQ Brief /
Bibliography / Synthesis / INSIGHT Collection）并跳过冗余步骤。它还要求提供由构建器生成的精确 `preregistration-artifact/1.0` 交接回执，以及在提供时其明确命名的配套文件。接收阶段会验证并原样携带这些字节；它不会推断状态、修复/重建附属文件、跟随其显示路径，或替换为规划模板。后续明确的用户提供必须由指定确定性构建器生成新的附属文件来表示。见 `deep-research/SKILL.md` 的交接协议以及 `shared/references/cross_document_consistency_advisory_protocol.md`。

---

## 失败路径

详见 `references/failure_paths.md`。快速参考：

| 失败场景 | 处理策略 |
|---------|---------|
| 研究基础不足 | 建议先运行 `deep-research` |
| 选择了错误的论文结构 | 返回第 2 阶段，建议替代结构 |
| 字数显著超出/低于目标 | 识别有问题的章节，建议删减/扩充 |
| 引文格式完全错误 | 重新运行整个引文阶段 |
| 同行评审拒稿 | 分析拒稿原因，建议重大修订或重构 |
| 计划模式未收敛 | 建议切换至仅大纲模式 |
| 交接材料不完整 | 列出缺失项，建议补充或重新运行 |
| 用户中途放弃 | 保存已完成的章节计划 |

---

## 完整学术流水线

完整工作流见 `academic-pipeline/SKILL.md`。

---

## 第 0 阶段：配置访谈

第 0 阶段配置访谈的完整字段定义见 `agents/intake_agent.md`。访谈涵盖 9 个核心项目：论文类型、学科、目标期刊、引文格式、输出格式、语言、摘要、字数和现有材料——此外还包括合著者、资助、可选的风格校准、领域证据配置文件（第 12 步）、引文验证级别（第 13 步，#392）以及独立撤稿政策（第 14 步，#651）。两项引文政策默认均为仅标记，并需明确选择严格模式，分别为 `terminal_policies.citation_existence` 和 `terminal_policies.retraction` 提供种子值。当作者确认期刊/赛道/类型目标时，第 0 阶段还会解析 #683 `ReviewTargetContext`，并在任何感知标准的消费者运行之前初始化 #684 仅指针绑定清单；缺失时使用明确的字段通用 `criteria_binding_unavailable` 路径。输出一份论文配置记录，等待用户确认。

---

## 文件结构

**Agent 定义**：`agents/{agent_name}.md` — 每个 Agent 一个文件（共 12 个，与上方 Agent Team 表一致）。

**References**（`references/` 中的 28 个文件）：
- 引用：`apa7_extended_guide`、`apa7_chinese_citation_guide`、`citation_format_switcher`
- 写作：`academic_writing_style`、`writing_quality_check`、`writing_judgment_framework`
- 结构：`paper_structure_patterns`（6 种类型）、`abstract_writing_guide`、`intro_title_rhetoric_guide`（CARS 语步 + 标题检查清单）
- 领域：`hei_domain_glossary`（双语）、`journal_submission_guide`、`latex_template_reference`、`domain_evidence_profiles`（咨询性筛查档案）
- 流程：`failure_paths`（12 种场景）、`mode_selection_guide`（11 种模式）、`plan_mode_protocol`、`workflow_phase_details`、`revision_patch_protocol`（#390 Mode B 命令 + 标记生命周期）
- 伦理：`credit_authorship_guide`（CRediT 的 14 项角色）、`funding_statement_guide`、`statistical_visualization_standards`
- 披露（v3.2）：`disclosure_mode_protocol`（默认的投稿 venue 适用性/状态组合：`REQUIRED`、`ACTION_ONLY`、`NOT_REQUIRED`、`UNKNOWN`，以及类型化暂停；单独的 policy-anchor 渲染）、`venue_disclosure_policies`（v2 数据库：ICLR、NeurIPS、Nature、Science、ACL、EMNLP，以及医学出版政策目标，包括 ICMJE、NEJM、The Lancet、JAMA、BMJ、PLOS、Frontiers、publisher-wide Chinese Nursing Journals Publishing House 中华护理杂志社、journal-level International Eye Science 国际眼科杂志）
- 完整性（v3.3）：`anti_leakage_protocol`（知识隔离）、`vlm_figure_verification`（可选的 VLM 图表检查）
- 政策锚点（#108）：`policy_anchor_table`、`policy_anchor_disclosure_protocol`
- 元数据：`changelog`（版本历史）
- 另外：`deep-research/references/apa7_style_guide.md`（基础参考文档，本扩展在此基础上编写）

**Templates**（`templates/` 中的 11 个文件）：`imrad`、`literature_review`、`case_study`、`theoretical_paper`、`policy_brief`、`conference_paper`、`latex_article_template.tex`、`bilingual_abstract`、`credit_statement`、`funding_statement`、`revision_tracking`（4 种状态类型）。

**Examples**（`examples/` 中的 9 个文件）：`imrad_hei_example`、`literature_review_example`、`plan_mode_guided_writing`、`chinese_paper_example`、`revision_mode_example`、`revision_recovery_example`、`clinical_citation_verification_checklist`、`clinical_epistemic_status_example`、`version_family_reconciliation_example`。

---

## 反模式

明确禁止以下做法，以防止常见的失败模式：

| # | 反模式 | 失败原因 | 正确做法 |
|---|-------------|-------------|-------------|
| 1 | **模糊的默认词汇** | “delve into”、“crucial”、“it is important to note”通常不如该学科自身的术语精确 | 使用学科特定词汇；参见 `references/writing_quality_check.md`（用于诊断，而非禁用） |
| 2 | **打断论证的长破折号** | 打破句子逻辑的插入性补充，其阅读成本高于带来的信息增益 | 在效果更好的情况下，使用括号、逗号，或重构句子 |
| 3 | **清嗓式开头** | “In this section, we will discuss...”没有增加任何信息 | 直接从论点或发现开始 |
| 4 | **填充式或负载过重的段落** | 为满足预设长度而拉长或拆分段落，会掩盖论证真正发生转折的位置 | 让每个段落拥有其观点所需的篇幅；不要为了满足模板而填充、拆分段落或刻意改变长度 |
| 5 | **⚠️ 铁律：虚构引用** | 编造听起来合理但并不存在的参考文献 | 每条引用都必须通过 DOI 或 WebSearch 验证；参见 `academic-pipeline/agents/integrity_verification_agent.md` |
| 6 | **迎合式修订** | 不加批判地接受审稿人的所有反馈 | 审稿人有误时使用 REVIEWER_DISAGREE 状态；用证据说明理由 |
| 7 | **修订期间的范围蔓延** | 为“改进”论文而加入未被要求的章节或分析 | 修订只处理审稿人的意见；新增内容需要用户明确批准 |
| 8 | **忽视失败路径** | 出现拒稿信号或致命的方法学缺陷时仍继续推进 | 检查 `references/failure_paths.md`；触发条件满足时调用 F11 Desk-Reject Recovery |

---

## 品質標準

### 寫作品質
1. **每項主張都必須附有引文**，或由論文本身的資料支持；對於 #548 的缺失／新穎性主張，則必須附上已記錄的搜尋來源，以及（若存在）所命名的最相近先前研究；否則，明確的相鄰研究缺失聲明本身即可，因為不存在可引用來證明缺失的來源
2. **零引文孤兒**：文內引文 <-> 參考文獻列表必須完全匹配
3. **一致的文體**：採用符合該學科的學術語調
4. **邏輯流暢**：段落與章節之間具有清楚的轉承
5. **字數符合要求**：須在目標字數的 +/-10% 以內

### 雙語摘要品質
6. **獨立撰寫**：zh-TW 與 EN 摘要必須獨立撰寫，不得是機械式翻譯
7. **結構對齊**：兩篇摘要須以相同順序涵蓋相同的關鍵要點
8. **關鍵詞**：每種語言提供 5-7 個關鍵詞，反映論文的核心概念
9. **字數**：EN：150-300 字；zh-TW：300-500 字元

### 引文品質
10. **格式符合要求**：100% 遵循所選定的引文格式
11. ⚠️ **鐵則：DOI 必須包含**：每個具有 DOI 的來源都必須包含 DOI；每則引文都必須透過 DOI 或 WebSearch 驗證
12. **時效性**：標記超過 10 年的來源（奠基性研究除外）
13. **自我引用比例**：若 >15%，則予以標記

### 同儕審查
14. **五個以評判標準為界定的面向**：Originality、Methodological Rigor、Evidence Sufficiency、Argument Coherence 與 Writing Quality；提出具備證據的類別判定，不進行數值彙總
15. **可執行的回饋**：每項批評都必須包含具體建議
16. **最多 2 輪修訂**：未解決的項目轉列為 Acknowledged Limitations

### 必要內容
⚠️ **鐵則**：每篇論文都必須包含：Data Availability Statement、Ethics Declaration、Author Contributions (CRediT)、Conflict of Interest Statement、Funding Acknowledgment。
17. **AI 使用報告**：一般的 `full` / `format-convert` 流程包含現有的通用 AI 工具使用聲明；獨立的 `disclosure` 模式則遵循所選期刊適用性／狀態或政策錨點的呈現契約
18. **Limitations 章節**：明確討論研究限制
19. **Ethics 聲明**：在適用時提供（人體受試者、敏感資料）

---

## 輸出語言

遵循使用者的語言。學術術語保留為 English。無論正文使用何種語言，雙語摘要一律提供。

---

## 與其他 Skills 的整合

```
academic-paper + tw-hei-intelligence  -> 具備真實 MOE 資料、以證據為基礎的 HEI 論文
academic-paper + deep-research        -> 深度研究階段 -> 論文撰寫階段（自動交接）
academic-paper + report-to-website    -> 論文的互動式網頁版本
academic-paper + notebooklm-slides-generator -> 根據論文製作簡報投影片
academic-paper + academic-paper-reviewer -> 同儕審查 -> 修訂迴圈
```

---

## 模型分級 (#517，可選)

当设置 `ARS_MODEL_TIERING` 时，调度会话会根据 `shared/model_tiering.md` 为此技能的代理路由（规范内容：完整的 39 个代理判断/执行表及规则）。简明规则：

- **未设置（默认）：**每个代理都继承会话模型，与 #517 之前的行为逐字节等效。
- **`economy`**（前沿层级会话）：执行类型代理调度到比会话模型低一个层级的模型，最低为 Opus 级，绝不会更低；判断类型代理保持使用会话模型。达到或低于最低层级时不执行任何操作（仅通知一次）。
- **`quality-boost`**（低于前沿层级的会话）：判断类型代理在检查点界面（Stage 2.5/4.5 gate；可选的 Stage 4→5 claim–ref 审计；最终审查）直接跃升至前沿层级（无论相隔多少层级，均不是只提升一个层级）；任何情况下都不会降级。在前沿层级时不执行任何操作（仅通知一次）。
- 未知值 → 仅警告一次，并按未设置处理。层级是相对位置，绝不固定为特定模型 ID。当某个方向处于激活状态时，将同一阶段的重复调用路由到**同一个**工作线程，以便其提示缓存持续累积；未设置时，调度形态也保持逐字节等效。

---

## 版本信息

| 项目 | 内容 |
|------|---------|
| 技能版本 | 3.3.1 |
| 最后更新 | 2026-08-15 |
| 维护者 | Cheng-I Wu |
| 依赖技能 | deep-research v1.0+（上游）、academic-paper-reviewer v1.0+（下游） |

---

## 版本历史

> 完整版本历史请参阅 `references/changelog.md`。