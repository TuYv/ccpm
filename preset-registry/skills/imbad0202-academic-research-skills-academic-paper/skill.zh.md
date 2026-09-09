---
name: academic-paper
description: "12-agent academic paper writing pipeline. 11 modes (full/plan/outline/revision/revision-coach/abstract/lit-review/format-convert/citation-check/disclosure/rebuttal-audit). 6 paper types, 5 citation formats, bilingual abstracts, LaTeX/DOCX-via-Pandoc/PDF output. Style Calibration + Writing Quality Check + Anti-Patterns with IRON RULE markers. Triggers: write paper, academic paper, guide my paper, parse reviews, audit my rebuttal, check my response draft, AI disclosure, 寫論文, 學術論文, 引導我寫論文, 審查意見, 評估回覆, 논문 작성, 초록 작성, 논문 수정, 논문 계획을 도와줘, 심사 의견 반영, 답변서 점검, AI 사용 고지."
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

一个通用型学术论文写作工具 — 覆盖所有学科的 12-Agent 流水线，并以高等教育领域为默认参考。

**v2.5** 新增两项写作质量功能：
- **风格校准**（接收步骤 10，可选）— 提供 3 篇以上过往论文，流水线将学习你的写作风格（句子节奏、词汇偏好、引文整合风格）。在起草过程中作为软性指导应用；学科规范始终优先。参见 `shared/style_calibration_protocol.md`。
- **写作质量检查**（`references/writing_quality_check.md`）— 在草稿自审步骤中应用的情境敏感型写作诊断：含糊或过度使用的术语、打断论证的标点、铺垫性开头、影响清晰度的段落和句子结构。提示进行判断时，应服从作者和发表场所的要求，而非配额（#825）。

> **路由规范（v3.9.2）：** 有关跨 Skill 路由规则，请参见 `.claude/CLAUDE.md` 中的“Routing Discipline (v3.9.2)”以及 `shared/references/intent_clarification_protocol.md`。此 Skill 假定路由已确定 — 模糊的跨阶段材料应已在上游得到澄清。

## 快速开始

**最简命令：**
```
Write a paper on the impact of AI on higher education quality assurance
```

```
Write a paper on the impact of declining birth rates on private university management strategies
```

**执行流程：**
1. 配置访谈 — 论文类型、学科、引文格式、输出格式
2. 文献检索 — 系统化检索策略、来源筛选
3. 架构设计 — 论文结构、大纲、字数分配
4. 论证构建 — 主张-证据链、逻辑流
5. 全文起草 — 分章节草稿、语体调整
6. 引文合规性 + 双语摘要（并行）
7. 同行评审 — 五视角分类评估、修订建议
8. 输出格式化 — LaTeX/DOCX（通过 Pandoc）/PDF/Markdown

---

## 触发条件

### 触发关键词

**英语**：撰写论文、学术论文、论文大纲、撰写摘要、修改论文、文献综述论文、检查引文、转换为 LaTeX、转换格式、格式化论文、会议论文、期刊文章、学位论文篇章、研究论文、指导我写论文、帮助我规划论文、逐步撰写论文、起草手稿、撰写方法论、撰写讨论、解析评审意见、修订路线图、帮助我修改、我收到了审稿人意见、转换引用格式

**繁體中文**：寫論文、學術論文、論文大綱、寫摘要、修改論文、文獻回顧論文、檢查引用、轉 LaTeX、轉換格式、研討會論文、期刊文章、學位論文、研究論文、引導我寫論文、幫我規劃論文、逐步寫論文、寫方法論、寫討論、審查意見、修訂路線圖、幫我修改、我收到審查意見、轉換引用格式

**韩语**：撰写论文、论文草稿、论文大纲、撰写摘要、修改论文、确认引文、检查引用格式、转换为 LaTeX、转换格式、撰写学位论文、撰写期刊论文、撰写会议论文、帮我规划论文、逐步撰写论文、我收到了评审意见、采纳评审意见、检查回复信、披露 AI 使用情况

### 计划模式激活

当用户希望获得指导、分步骤规划，或对论文结构表示不确定时，激活 `plan` 模式。**默认规则**：当 `plan` 与 `full` 之间存在歧义时，优先选择 `plan`。

> 有关完整的意图信号和激活规则，请参阅 `references/plan_mode_protocol.md`。

### 不会触发

| 场景 | 改用 |
|----------|-------------|
| 深度研究 / 事实核查（非论文写作） | `deep-research` |
| 论文审阅（结构化评审） | `academic-paper-reviewer` |
| 完整的研究到论文流程 | `academic-pipeline` |

### 与 `deep-research` 的区别

| 功能 | `academic-paper` | `deep-research` |
|---------|-------------------|-----------------|
| 主要输出 | 可发表的论文草稿 | 研究报告 |
| 结构 | 期刊就绪（IMRaD 等） | APA 7.0 报告 |
| 引用 | 多格式（APA/Chicago/MLA/IEEE/Vancouver） | 仅 APA 7.0 |
| 摘要 | 双语（zh-TW + EN） | 单一语言 |
| 同行评审 | 模拟五维度评审 | 编辑评审 |
| 输出格式 | LaTeX/DOCX（通过 Pandoc）/PDF/Markdown | 仅 Markdown |
| 修订循环 | 最多 2 轮，提供针对性反馈 | 最多 2 轮 |

---

## Agent 团队（12 个 Agent）

| # | Agent | 角色 | 阶段 |
|---|-------|------|------|
| 1 | `intake_agent` | 配置访谈：论文类型、学科、期刊、引用格式、输出格式、语言、字数；交接检测；Plan 模式简化访谈 | 阶段 0 |
| 2 | `literature_strategist_agent` | 检索策略设计、来源筛选、注释书目、文献矩阵 | 阶段 1 |
| 3 | `structure_architect_agent` | 论文结构选择、详细大纲、字数分配、证据映射 | 阶段 2 |
| 4 | `argument_builder_agent` | 论证构建、主张—证据链、逻辑流、反驳论点处理；Plan 模式论证压力测试 | 阶段 3 / Plan 步骤 3 |
| 5 | `draft_writer_agent` | 逐节撰写完整草稿、学科语域调整、字数跟踪 | 阶段 4 |
| 6 | `citation_compliance_agent` | 引用格式核验、参考文献列表完整性、DOI 检查 | 阶段 5a |
| 7 | `abstract_bilingual_agent` | 双语摘要（zh-TW + EN），各 5–7 个关键词 | 阶段 5b |
| 8 | `peer_reviewer_agent` | 模拟双盲评审、五视角分类评估、修订建议（最多 2 轮） | 阶段 6 |
| 9 | `formatter_agent` | 转换为 LaTeX/DOCX（通过 Pandoc）/PDF/Markdown、期刊格式化、投稿附信、引用格式转换（APA 7 / Chicago / MLA / IEEE / Vancouver） | 阶段 7 |
| 10 | `socratic_mentor_agent` | Plan 模式苏格拉底式导师：逐章指导、收敛标准（4 个信号）、问题分类法（4 种类型）、INSIGHT 提取 | Plan 步骤 0–3 |
| 11 | `visualization_agent` | 解析论文数据并生成出版级图表代码（Python matplotlib / R ggplot2），支持 APA 7.0 格式、色盲友好调色板和 LaTeX 集成 | 阶段 4 / 阶段 7 |
| 12 | `revision_coach_agent` | 将非结构化评审意见解析为 Revision Roadmap，或将明确标识的真实委员会意见解析为独立的 #668 来源归因关注事项追踪器；可独立运行 | Revision-Coach 模式 |

---

## 输出格式

### 文本格式
LaTeX (.tex + .bib)、DOCX（通过 Pandoc）、PDF（通过 LaTeX 或 Pandoc）、Markdown。

### 图表
当论文包含定量结果时，`visualization_agent` 可以使用 Python（matplotlib/seaborn）或 R（ggplot2）生成符合 APA 7.0 格式且采用色盲友好调色板的出版级图表。图表以可运行代码 + LaTeX `\includegraphics` 集成代码的形式交付。有关图表类型决策树和代码模板，请参见 `references/statistical_visualization_standards.md`。

### 引文格式
APA 7.0（默认）、Chicago（著者-日期制或注释-书目制）、MLA 9、IEEE、Vancouver。`formatter_agent` 支持通过“将引文转换为 [format]”在任意两种受支持格式之间进行后期引文格式转换。

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

> 有关各阶段代理行为和输出说明的详细内容，请参见 `references/workflow_phase_details.md`。

### 审稿目标标准绑定（#684）

当阶段 0 已生成作者确认的 `ReviewTargetContext`（#683）后，
编排器会初始化一个仅指针的 `ReviewCriteriaBindingManifest`，并在形成性评估、内部评估者和外部专家组消费者之间保持不变地使用它。规范性生命周期、精确标记、封闭角色及明确的降级路径定义于
`shared/references/review_criteria_consumer_protocol.md`。

- 阶段 2 负责 `FORMATIVE` 回执。结构架构师将选定的标准 id 映射到计划章节和证据需求；后续写作阶段复用该回执，且不会重新解析目标。
- 阶段 6a 接收相同的指针权限和目标标准简报，同时保持对论文内容不可见；其预承诺工件负责 `INTERNAL` 回执。阶段 6b 接收该未经修改的工件，可在查看草稿后评估适用性，并负责所有严重/主要建设性发现的附属记录。
- 科学有效性、期刊契合度和投稿准备情况仍相互独立。标准绝不授权虚构证据、结果、方法或对作者贡献主张的修改。

绑定验证仅是一项交接一致性检查。它绝不提供编辑判断、严重性、检查点状态或作者分流建议。若绑定不可用，请披露 `criteria_binding_unavailable`；不要声称符合期刊要求，也不要从模型记忆中静默重建目标。

### 检查点规则

1. ⚠️ **铁律**：用户必须先确认 Paper Configuration Record，才能继续进入 Phase 1
2. **Phase 2 -> 3**：用户必须批准大纲（可以要求重组结构）
3. ⚠️ **铁律**：最多进行 2 轮修订；未解决的项目 -> "Acknowledged Limitations"
4. **同行评审**中的 Critical 严重性问题会阻止流程进入 Phase 7
5. 如果用户提供自己的来源，可以跳过 Phase 1（文献）

---

> **v3.4.0 合规要求（适用于 `full` 模式）：** 在最终确定之前，`compliance_agent` 会运行仅针对 RAISE 原则的检查（仅警告；主要研究不在 PRISMA-trAIce 范围内）。警告会列在披露声明中，但绝不会阻塞流程。参见 `shared/raise_framework.md §Scope disclaimer`。

## 分阶段调用契约（v3.9.2）

academic-paper 流程分为 8 个阶段（Phase 0 接收 → 7 格式化）。有两种调用模式：

**模式 A —— 编排器驱动（默认）：** `pipeline_orchestrator_agent`（位于 `academic-pipeline` skill 中）通过 Material Passport 进行状态跟踪，端到端运行所有阶段。

**模式 B —— 分阶段调用（跨会话恢复）：** 用户在多个会话中为每个阶段调用一个 agent，用于运行时间较长的项目。常见模式是：在一个会话中撰写草稿，下周返回后独立进行引文检查、摘要撰写或同行评审。

在模式 B 中，单阶段 agent（`docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md` 中的 Bucket A）在写入时必须严格限制在其所分配的阶段内。academic-paper 中的 7 个 Bucket A agent 是：`literature_strategist`（P1）、`structure_architect`（P2）、`draft_writer`（每次调用对应 P4/P6）、`citation_compliance`（P5a）、`abstract_bilingual`（P5b）、`peer_reviewer`（P6）、`formatter`（P7）。允许读取上游阶段的内容。

多阶段 agent（Bucket B：`argument_builder` P3+Plan、`visualization` P4+P7）必须严格按照调用者针对该阶段的调用要求执行工作，不得在同一次调用中扩展到其他阶段。下方的 v3.6.6 生成器-评估器契约还进一步约束了 `draft_writer` 和 `peer_reviewer` 的子阶段行为（Phase 4a/4b、Phase 6a/6b）。

进入模式 B 必须有明确的用户信号，即 `/ars-<mode>` slash command 或 `[direct-mode]` 前缀。根据 `.claude/CLAUDE.md` Routing Discipline + `shared/references/intent_clarification_protocol.md`，含义不明确的跨阶段输入默认需要澄清。

**执行（v3.9.2）：** Phase Boundary 会阻止 Bucket A agent继续执行；同时使用建议性验证器（`scripts/check_pipeline_integrity.py`）以及启用 hook 的运行时中的确定性 PreToolUse 写入范围保护（#134 rescope，PR #294）。多阶段封装仍保持前向范围（#134 Slices 3-5）。

## v3.6.6 生成器-评估器契约协议

> 这是 `academic-paper full` 模式中由契约控制的阶段拆分的权威编排区块。自 v3.6.6 起使用 Schema 13.1（`shared/sprint_contract.schema.json`）。模板：`shared/contracts/writer/full.json` + `shared/contracts/evaluator/full.json`。设计规范：`docs/design/2026-04-27-ars-v3.6.6-generator-evaluator-contract-design.md` §5。
>
> **仅适用于 `academic-paper full` 模式。** 九种非 full 模式（`plan`、`outline-only`、`revision`、`revision-coach`、`abstract-only`、`lit-review`、`format-convert`、`citation-check`、`disclosure`）在 v3.6.5 → v3.6.6 之间保持字节等价，不会调用此协议。（后来新增的 `rebuttal-audit` 模式同样是非 full 模式，也不会调用此协议。）流程边界不变：`academic-pipeline` 的 Stage 2 以 plan 或 full 模式分派 `academic-paper`（只有 full 模式会调用此协议）；Stage 3 分派独立的 `academic-paper-reviewer` skill（5 人小组的外部编辑审查）。此协议中的配对内 Phase 6 评估器与 Stage 3 reviewer 属于不同的审查层，详见设计文档 §5.1 审计结论 2。

### 概述

v3.6.6 将 Phase 4（writer drafting）和 Phase 6（in-pair evaluator review）拆分为 paper-blind / paper-visible 调用对，并由 `writer_full` 和 `evaluator_full` contract 进行门控。该拆分镜像 `academic-paper-reviewer/references/sprint_contract_protocol.md`（v3.6.2 reviewer 模式），但针对没有 panel 且（对于 writer）没有 scoring_plan 的 single-agent generator 模式进行了适配。

承重机制是**调用的物理隔离**：writer Phase 4a 永远看不到运行时 drafting artefacts；evaluator Phase 6a 永远看不到 writer Phase 4b draft。这会破坏在 in-pair self-quality gate 上“先读论文，再为标准找理由”的漂移路径。

### 四调用结构

对于每次 `academic-paper full` 调用，Phase 4 + Phase 6 会从两个单独调用扩展为四个独立模型调用。每个调用都有自己的 system prompt 和 user content，遵循下面的 system-vs-user content 纪律。

1. **Phase 4a — writer paper-blind pre-commitment。**
   - System prompt：`academic-paper/agents/draft_writer_agent.md` § "v3.6.6 Generator-Evaluator Contract Protocol" 中的 `### Phase 4a — Writer paper-blind pre-commitment` 小节。
   - User content：`writer_full` contract JSON + 仅 paper metadata（`title`、`field`、`word_count`）。
   - Output：`## Acceptance Criteria Paraphrase` section + 结尾 `[PRE-COMMITMENT-ACKNOWLEDGED]` tag。
   - Lint：3 项结构检查（见下文 § "Phase 4a / 6a output lint"）。
2. **Phase 4b — writer paper-visible drafting + self-scoring。**
   - System prompt：同一 agent 文件中的 `### Phase 4b — Writer paper-visible drafting + self-scoring` 小节。
   - User content：`writer_full` contract JSON（重新注入）+ 包装在 `<phase4a_output>...</phase4a_output>` data delimiter 中的 Phase 4a output + 上游 drafting artefacts（Paper Configuration Record、Paper Outline、Argument Blueprint、Annotated Bibliography，包括其 Search Strategy / Schema 2 `search_strategy`（#548 — writer 填入 search-bounded novelty claims 的边界）、可选 Style Profile、可选 Knowledge Isolation Directive）。
   - Output：`## Draft Body` → `## Dimension Scores` → `## Failure Condition Checks` → `## Writer Decision`。
   - Lint：4 项结构检查（见下文 § "Phase 4b / 6b output lint"）。
3. **Phase 6a — evaluator paper-blind pre-commitment。**
   - System prompt：`academic-paper/agents/peer_reviewer_agent.md` § "v3.6.6 Generator-Evaluator Contract Protocol" 中的 `### Phase 6a — Evaluator paper-blind pre-commitment` 小节。
   - User content：`evaluator_full` contract JSON + paper metadata + writer 最新的 `<phase4a_output>`（evaluator 必须按 `disagreement_handling.pre_commitment_check_protocol.check_writer_artifact` 验证的 writer artefact）+ 在启用时，pointer-only #684 manifest/Target Criteria Brief/`INTERNAL` marker。
   - Output：`## Contract Paraphrase` + `## Scoring Plan`（按 dimension 的 `dimension_id` / `what_to_look_for` / `what_triggers_block` / `what_triggers_warn`）+ pointer-only binding commitment（或 `criteria_binding_unavailable`）+ 结尾 `[PRE-COMMITMENT-ACKNOWLEDGED]` tag。不引入额外 H2。
   - Lint：5 项结构检查。
4. **Phase 6b — evaluator paper-visible scoring + decision。**
   - System prompt：同一 agent 文件中的 `### Phase 6b — Evaluator paper-visible scoring + decision` 小节。
   - User content：`evaluator_full` contract JSON（重新注入）+ 包装在 `<phase6a_output>...</phase6a_output>` 中的 Phase 6a output + writer 的 `<phase4a_output>`（按 `pre_commitment_check_protocol.check_writer_artifact` 无条件提供）+ writer Phase 4b draft（被 review 的 artefact）+ 当 Phase 6a 中提供过时，保持不变的 #684 authority。
   - Output：`## Dimension Scores` → `## Failure Condition Checks` → `## Review Body` → `## Evaluator Decision`，以及 role marker/unavailable disclosure，并在适用时提供单独验证的 constructive sidecar。
   - Lint：5 项结构检查。

### System prompt vs user content discipline

与 `sprint_contract_protocol.md` §2 中的评审者模式保持逐字一致：

- **系统提示仅承载不变量策略文本**：agent 文件的 `## v3.6.6 Generator-Evaluator Contract Protocol` 块中的阶段子部分说明、lint 描述以及阶段边界标签约定。
- **用户内容承载 contract JSON（每次调用重新注入）以及该阶段允许使用的运行时输入**：论文元数据、`<phase4a_output>` / `<phase6a_output>` 分隔块、上游起草产物、论文草稿。

所有动态 LLM 输出（Phase Na 运行时输出、论文内容）都通过数据分隔符置于用户内容中，绝不放入系统提示。这可以防止将每篇论文的动态内容意外提升为不变量策略层的一部分。

### Schema field name vs runtime emission distinction

`pre_commitment_artifacts`（snake_case，使用反引号）是 `shared/sprint_contract.schema.json` 中的 schema 字段名，即冻结契约基线中的配置声明。“writer Phase 4a pre-commitment output”是运行时输出，即 writer agent 在 Phase 4a 中实际输出的 Markdown 文本。运行时输出位于 `<phase4a_output>` 中，并会被交接给 Phase 4b / Phase 6a / Phase 6b。`disagreement_handling`（schema 字段）与“evaluator Phase 6a pre-commitment output”（运行时输出）也是相同的模式。混淆这两者会导致无法区分契约基线配置与 LLM 生成的内容。

### Phase 4a / 6a output lint

根据 `sprint_contract_protocol.md` §4 的枚举约定，按模式区分结构检查项数量：

- **Writer Phase 4a（3 项检查）**：按顺序包含必需部分（`## Acceptance Criteria Paraphrase`、末尾的 `[PRE-COMMITMENT-ACKNOWLEDGED]`）；释义段落数量 ≥ `pre_commitment_artifacts.acceptance_criteria_paraphrase.minimum_dimensions`；Phase 4a 内容仅引用 contract JSON + 论文元数据。**不得包含 `## Scoring Plan` 部分**——`writer_full` 不携带 scoring_plan。
- **Evaluator Phase 6a（5 项检查）**：按顺序包含必需部分（`## Contract Paraphrase`、`## Scoring Plan`、末尾的 `[PRE-COMMITMENT-ACKNOWLEDGED]`）；每个验收维度对应一个 `### <Dn>: <name>` 子部分；每个 scoring_plan 子部分都包含 `disagreement_handling.scoring_plan.per_dimension_criteria` 的四字段结构（`dimension_id`、`what_to_look_for`、`what_triggers_block`、`what_triggers_warn`）；Phase 6a 内容仅引用 contract JSON + 论文元数据 + writer 的 `<phase4a_output>`，以及仅提供论文盲审 #684 指针权威（不得包含完整草稿 / 论文内容）。绑定承诺是 Scoring Plan 后的非列表指针数据，不是额外的 H2。

重试语义：首次尝试 lint 失败 → 根据系统提示中指出的具体 lint 缺口重试一次；第二次失败 → 根据下方“Single-agent generator unusable handling”一节，将该角色标记为不可用。

### 第 4b / 6b 阶段输出检查

- **Writer Phase 4b（4 项检查）**：按顺序要求以下部分 — `## Draft Body`、`## Dimension Scores`、`## Failure Condition Checks`、`## Writer Decision`；Dimension Scores 必须与七个 writer 维度 D1–D7 一一对应（依据 `shared/contracts/writer/full.json`）；Failure Condition Checks 必须与 F1 / F4 / F2 / F3 / F0 一一对应；Writer Decision 必须可根据 F-condition 严重性优先级推导。**不进行多异议重试**（writer 没有可供异议对照的 scoring_plan）。**不进行一致性检查**（writer Phase 4a 不会发出 scoring_plan 触发词）。
- **Evaluator Phase 6b（5 项检查）**：按顺序要求以下部分 — `## Dimension Scores`、`## Failure Condition Checks`、`## Review Body`、`## Evaluator Decision`；Dimension Scores 必须与五个 evaluator 维度 D1–D5 一一对应（依据 `shared/contracts/evaluator/full.json`）；Failure Condition Checks 必须与 F1 / F2 / F3 / F6 / F4 / F5 / F0 一一对应；一致性检查（Phase 6b 的分数必须与 Phase 6a `disagreement_handling.scoring_plan.per_dimension_criteria` 中的触发词进行子字符串匹配）；Evaluator Decision 必须可根据 F-condition 严重性优先级推导。**不进行多异议重试**（evaluator 的阶段内异议通过 `disagreement_handling.disagreement_resolution` 中的 F-condition action 编码，而不是作为重试触发条件）。

多异议重试仍仅适用于 reviewer（`academic-paper-reviewer` skill）；generator 模式没有 panel，也没有 scoring_plan 异议锚点。

三种模式的检查数量汇总：

| 阶段 | Reviewer（零接触） | Writer | Evaluator |
|---|---|---|---|
| Phase 1 / 4a / 6a | 5 | 3 | 5 |
| Phase 2 / 4b / 6b | 6 | 4 | 5 |

### 单代理 generator 不可用处理

当 writer 或 evaluator 阶段变为不可用时（Phase Na 两次 lint 失败，或 Phase Nb lint 失败），`academic-paper` 会发出阶段级中止标签，并转交用户干预：

- **Writer Phase 4 不可用** → `[GENERATOR-PHASE-ABORTED: role=writer, contract=<id>, reason=<lint_failure_kind>]` → 中止 `academic-paper` Phase 4 → 由用户干预决定重试 / 回退 / 回归 Phase 3（Argument Blueprint）。
- **Evaluator Phase 6 不可用** → `[GENERATOR-PHASE-ABORTED: role=evaluator, contract=<id>, reason=<lint_failure_kind>]` → 中止 `academic-paper` Phase 6 → 由用户干预决定重试 / 回退 / 回归 Phase 5（Drafting completion）。

`[GENERATOR-PHASE-ABORTED]` 不构成有效的 Phase 6b 输出，且不能进入 Stage 3 reviewer dispatch。存在两条有效的 Stage 3 进入路径（依据设计文档 §5.1）：

- **标准路径**：evaluator Phase 6b 发出 F0 `evaluator_decision=accept` 或 F4 `evaluator_decision=accept_with_dissent_note`。
- **例外路径**：在第 2 轮结束时，in-pair revision loop 耗尽，且 mandatory-dimension block 再次出现后，evaluator Phase 6b 发出 F5 `evaluator_decision=flag_for_reviewer_stage`。

`academic-paper` 不对 writer / evaluator 携带 panel cardinality invariant（没有 `panel_size` 字段 — Schema 13.1 §3.3.5 reviewer-conditional）。generator 侧不存在 `[PANEL-SHRUNK]` 对应机制；`[GENERATOR-PHASE-ABORTED]` 是阶段级中止。

**运行监控**：在 v3.6.6 部署后的前三个月内跟踪 `[GENERATOR-PHASE-ABORTED]` 发生率。分母按每次 `academic-paper full` 运行计算，即一次用户感知的顶层调用。5% 阈值为 `(runs_with_any_abort) / (total_runs)`。如果该比率超过 5%，v3.6.7 将引入优雅降级回退（参见下文 §“已知限制”）。

### 跨会话恢复范围

v3.6.6 的生成器-评估器轮次（Phase 4a + Phase 4b + Phase 6a + Phase 6b + 对内修订循环）是一个**会话内原子单元**。在轮次中途手动拆分会话 → 写作者的 Phase 4a 输出会丢失；新会话必须从 Phase 0 重新启动 `academic-paper full` 模式。

v3.6.3 的 `ARS_PASSPORT_RESET=1` `reset_boundary[]` 机制（根据 `academic-pipeline/references/passport_as_reset_boundary.md`）作用于 `academic-pipeline` 阶段边界，而非 `academic-paper` 内部阶段边界。`academic-paper` 内部阶段（4a / 4b / 6a / 6b）**不是**边界点；它们之间不会发出 `kind: boundary` 台账条目。如果运行数据表明有必要，v3.6.7+ 可能引入 `pre_commitment_history[]`，以跨会话持久化写作者的 Phase 4a 产物——参见下文 §“已知限制”。

## 已知限制

- **v3.6.6 中没有优雅降级回退**：当写作者或评估器阶段通过 `[GENERATOR-PHASE-ABORTED]` 中止时，`academic-paper full` 将中止并转入用户干预。v3.6.7 可能引入一种回退，将受影响阶段降级为 v3.6.5 的单调用行为，并记录该降级。v3.6.6 以仅中止行为发布。有关运行监控的 5% / 三个月要求，请参见上文 §“单代理生成器不可用处理”。
- **不支持轮次中途跨会话恢复**：四阶段生成器-评估器轮次是一个会话内原子单元。在轮次中途手动拆分会话会丢失写作者的 Phase 4a 产物，并强制从 Phase 0 重新启动。v3.6.7+ 可能在 Schema 9 中引入 `pre_commitment_history[]` 台账条目，以跨会话边界持久化写作者的 Phase 4a 产物；v3.6.6 未实现此功能。
- **对内 Phase 6 评估器与 `academic-paper-reviewer` 外部审稿**：对内 `peer_reviewer_agent`（采用 v3.6.6 契约门控的 Phase 6 评估器）与独立的 `academic-paper-reviewer` skill（Stage 3 的 5 面板外部编辑审稿）服务于不同审稿层级，并按照设计文档 §1“已知限制”保留为已知技术债务。路由 / 合并决策推迟至 v3.7.x。

## 运行模式（11 种模式）

详见 `references/mode_selection_guide.md`。

| 模式 | 触发条件 | 代理 | 输出 |
|------|---------|--------|--------|
| `full` | “撰写论文” | 全部 9 个（+ 11 个，如为定量研究） | 完整论文草稿（如适用，包含图表） |
| `outline-only` | “论文大纲” | 1->2->3 | 详细大纲 + 证据地图 |
| `revision` | “修订论文” | 8->5->6 | 补丁文档 + 确定性应用的修订草稿 + 应用报告（#390；修订日志通过 `templates/revision_tracking_template.md`） |
| `abstract-only` | “撰写摘要” | 1->7 | 双语摘要 + 关键词 |
| `lit-review` | “文献综述” | 1->2 | 注释书目 + 综合分析 |
| `format-convert` | “转换为 LaTeX” / “将引文转换为 [格式]” | 仅 9 | 格式化文档；包括引文格式转换（APA 7 / Chicago / MLA / IEEE / Vancouver） |
| `citation-check` | “检查引文” | 仅 6 | 引文错误报告 |
| `plan` | “指导我的论文” / “帮助我规划论文” | 1->10->3->4 | 章节计划 + INSIGHT 集合 |
| `revision-coach` | “解析审稿意见” / “修订路线图” / “我收到了审稿人意见” / “我们是否应当反驳” / “会议答辩” / “基金评审组回复” / 明确识别出的真实委员会通信 | 仅 12 | 同行评审路径：不可变的 Roadmap 核心 + 明确的作者侧边栏 + 可选的 Tracking Template/Response Skeleton。委员会路径：独立的 #668 关切追踪器 + 占位回复骨架；不使用 Schema 11、审稿人义务/严重性或裁定。 |
| **`disclosure`** (v3.2) | **“Nature 的 AI 披露” / “生成 AI 使用声明”** | **仅 9** | **默认期刊路径：`REQUIRED` / `ACTION_ONLY` / `NOT_REQUIRED` / `UNKNOWN` 适用性加上类型化暂停状态；政策锚定路径：按锚点特定方式渲染** |
| **`rebuttal-audit`** | **“审计我的回复” / “检查我的答辩” / “我是否遗漏了任何审稿意见”**（同时要求提供审稿意见和现有答辩草稿） | **仅 12（仅解析）** | **答辩 QA 报告：逐条意见覆盖情况 + 缺口 + 风险标记。不生成新的回复；仅提供建议。不会生成 Schema 11 / Material Passport / 已验证状态。** |

**披露派发契约：**当 mode=`disclosure` 时，agent 9 采用其独立分支，并且在生成文本前**必须**加载 `references/disclosure_mode_protocol.md`。它不会运行常规的第 7 阶段格式化，也不会替换为通用的全流程 AI 声明；该协议负责选择场所数据库路径或政策锚点路径，并决定所有暂停与渲染事项。

### 快速模式选择指南

| 你的情况 | 推荐模式 | 光谱 |
|----------------|-----------------|----------|
| 从零开始，已有明确的 RQ | `full` | 平衡 |
| 写作前需要规划帮助 | `plan` | 原创 |
| 只需要大纲 | `outline-only` | 平衡 |
| 已有草稿，并收到评审反馈 | `revision` | 保真 |
| 有非结构化的评审意见 | `revision-coach` | 平衡 |
| 有来自真实委员会/机构评审办公室、需要跟踪的意见 | `revision-coach` 委员会通信变体 | 保真 |
| 只需要摘要 | `abstract-only` | 保真 |
| 需要检查/修复引文 | `citation-check` | 保真 |
| 需要转换格式（LaTeX、DOCX）或引文样式 | `format-convert` | 保真 |
| 想要撰写系统性文献综述论文 | `lit-review` | 保真 |
| 需要用于投稿的、特定场所的 AI 使用披露材料包 | `disclosure` | 保真 |
| 已有书面答辩草稿，需要根据评审意见进行质量检查 | `rebuttal-audit` | 保真 |

**光谱**（v3.2）：*保真* = 模板密集、输出可预测；*平衡* = 默认；*原创* = 探索性强、模板较少。完整的跨技能光谱表请参阅 `shared/mode_spectrum.md`。

不确定？从 `plan` 开始——它会逐步引导你。`disclosure` 是最后阶段；在论文完成后，指定计划投稿的场所再运行它。

**委员会通信路由：**仅当用户明确指出是真实的委员会/机构评审办公室时，才使用 `revision-coach` 变体。加载 `references/committee_correspondence_protocol.md`；不要根据语气推断其具有官方权威。该独立产物是一个有来源依据的起草辅助工具，绝不会进入同行评审 Schema 11。

### 模式选择逻辑

> 有关触发条件到模式的映射以及完整的选择流程图，请参阅 `references/mode_selection_guide.md`。

---

## Rebuttal-Audit 模式

`rebuttal-audit` 会评估作者**现有的**答辩/回复评审意见草稿，检查其覆盖范围、语气和证据。它属于咨询性质的质量检查——**不会**撰写或改写回复。

**输入门槛（路由）：**仅当用户同时提供以下两项时，才激活 `rebuttal-audit`：(a) 评审意见/决定信，以及 (b) 用于评估的现有答辩/回复草稿。如果只有 (a)（尚无草稿），则路由到 `revision-coach`（它会生成回复框架）。如果意图不明确，应先澄清，而不是猜测。

**生成内容：**
- 逐条意见覆盖表——将每个评审关切标记为草稿中已`addressed` / `partially` / `missing`。
- 缺口列表——草稿未能回答的关切。
- 风险标记——语气过于对抗、无证据支持的主张，或误解评审者实际要点的回复。
- 改进建议（咨询性质）。

**铁律 —— 完整性边界（不得虚假认证）：** `rebuttal-audit` 复用 `revision_coach_agent` 的评论解析能力，但独立调用在流水线之外运行，因此永远不会通过 Stage 4.5 final integrity。它 **不得** 生成 Schema 11 `commitment_extracted` ledger，**不得**写入 Material Passport，也 **不得**将包标记为 `ready_to_submit` 或任何已验证状态。生成 Schema 11 工件会错误地暗示该响应已进入流水线的可追溯系统。其输出仅为咨询性质的 QA 报告。

**与 `re-review` 的边界：** `academic-paper-reviewer` 的 `re-review` 模式验证的是**修订后的稿件**（作者声称的修改是否确实出现在论文中），并在流水线内运行。`rebuttal-audit` 验证的是**回复信本身**（回复是否覆盖每条评论、其语气/证据是否可靠），作为独立流程运行，仅提供咨询性质的结果。两者的工件和层级不同。

---

## 修订模式补丁协议（#390）

在修订模式下，`draft_writer_agent` 不会重新输出完整论文。本轮运行采用“锚定化 → 补丁 → 确定性应用 → 最终化器”流程，将重新生成范围限制在修订明确涉及的区块内（DELEGATE-52 blast-radius containment；规范 `docs/design/2026-06-10-390-diff-patch-revision-mode-spec.md`）：

1. **锚定草稿**（`scripts/ars_anchorize_draft.py` —— 幂等且内容中性）：每个区块都会获得一个稳定的 `<!--block:BNNNN-->` 标记和一份精确清单。在应用之前，不会重写草稿。
2. **绑定明确授权（#670）：** 验证不可变的 `revision-roadmap/1.0`、准确的已注册声明表面，以及完整的 `author-adjudication/1.0`。路线图分别保留严重程度、义务、成本范围和有界后果；作者分诊结果和准确目标仅存在于单独的明确 sidecar 中。
3. **写作者输出当前 patch 1.1**（`shared/contracts/patch/revision_patch.schema.json`）作为 sidecar —— 每个操作只能引用 `will_address` 项目，必须处于准确的目标/操作范围内，并明确声明 claim/collateral 数组。已注册声明的变动需要准确的作者批准替换内容；被拒绝的重叠需要准确的 collateral 授权。
4. **确定性应用**（`scripts/ars_apply_revision_patch.py`）会在结构分析或写入之前重放每一项绑定。当前的报告格式 1.3 携带机械推导出的授权见证，以及诚实的 `unregistered_claim_drift_review_required` E6 边界。如果 E6 后续检测到未注册表面发生漂移，该检查点没有默认开放的路径：作者必须明确选择 `restore`、`authorize_with_reason` 或 `pause`。构建和重放验证会将每个选择绑定到一个明确命名的、仅限本次运行的原始会话事件工件；sidecar 保留其重新计算出的摘要，但不保留路径或消息。未触及的区块保持字节级一致。
5. **持续证据：** 每次审阅写入、全部拒绝的无操作，以及完整性纠正轮次，都会进入 `revision-evidence-bundle/1.0`，其范围从一份准确的 integrity-PASS 草稿到准确的最终草稿。范围升级需要新的明确 sidecar 或更窄的补丁；旧式完整重新输出不能宣称当前授权 PASS。

编排运行遵循 `pipeline_orchestrator_agent.md` § 修订轮次补丁排序；模式 B 用户手动运行相同的脚本，确切命令见 `references/revision_patch_protocol.md`。诚实边界：已注册的表面和确切编辑权限由机器重放，但未注册的语义漂移仍需要 E6 审查。`scripts/claim_strength_drift_disposition.py` 仅完成对已报告行的显式处理；它并不使模型介导的检测变得确定性或完整。`academic-paper full` 的配对内第 6→4 阶段循环不属于此独立/管道修订契约。

---

## 规划模式：逐章引导式规划

通过一次一个章节的结构化对话，引导用户完成论文规划的苏格拉底式模式。构建完整的论文蓝图。

> 有关完整的逐章对话流程和论文蓝图结构，参见 `references/plan_mode_protocol.md`。

---

## 交接协议：deep-research -> academic-paper

`intake_agent` 会自动检测深度研究材料（研究问题简报 /
参考书目 / 综合分析 / INSIGHT 集合）并跳过冗余步骤。它还要求提供由构建器生成的精确 `preregistration-artifact/1.0` 交接收据，以及在提供时其明确命名的配套文件。接收环节会验证并原样携带这些字节；它不会推断状态、修复/重建附属文件、跟随其显示路径，或替换规划模板。之后用户的明确提供必须由指定确定性构建器生成的新附属文件表示。参见 `deep-research/SKILL.md` 的交接协议以及 `shared/references/cross_document_consistency_advisory_protocol.md`。

---

## 失败路径

详情参见 `references/failure_paths.md`。快速参考：

| 失败场景 | 处理策略 |
|---------|---------|
| 研究基础不足 | 建议先运行 `deep-research` |
| 选择了错误的论文结构 | 返回第 2 阶段，建议替代结构 |
| 字数显著超过/低于目标 | 识别存在问题的章节，建议删减/扩展 |
| 引文格式完全错误 | 重新运行整个引文阶段 |
| 同行评审拒稿 | 分析拒稿原因，建议重大修订或重构 |
| 规划模式未收敛 | 建议切换到仅大纲模式 |
| 交接材料不完整 | 列出缺失项，建议补充或重新运行 |
| 用户中途放弃 | 保存已完成的章节计划 |

---

## 完整学术管道

完整工作流参见 `academic-pipeline/SKILL.md`。

---

## 第 0 阶段：配置访谈

有关第 0 阶段配置访谈的完整字段定义，参见 `agents/intake_agent.md`。访谈涵盖 9 个核心项目：论文类型、学科、目标期刊、引文格式、输出格式、语言、摘要、字数和现有材料，以及共同作者、资金、可选的风格校准、领域证据配置文件（第 12 步）、引文验证级别（第 13 步，#392）和独立撤稿政策（第 14 步，#651）。两项引文政策默认均为仅标记，并需显式选择严格模式，分别为 `terminal_policies.citation_existence` 和 `terminal_policies.retraction` 提供种子值。当作者确认期刊/赛道/类型目标时，第 0 阶段还会在任何感知标准的消费者运行之前解析 #683 `ReviewTargetContext`，并初始化仅指针的 #684 绑定清单；缺失时使用显式的字段通用 `criteria_binding_unavailable` 路径。输出一份论文配置记录，等待用户确认。

---

## 文件结构

**Agent 定义**：`agents/{agent_name}.md` — 每个 Agent 一个文件（共 12 个，与上方 Agent Team 表格对应）。

**参考资料**（`references/` 中的 28 个文件）：
- 引文：`apa7_extended_guide`、`apa7_chinese_citation_guide`、`citation_format_switcher`
- 写作：`academic_writing_style`、`writing_quality_check`、`writing_judgment_framework`
- 结构：`paper_structure_patterns`（6 种类型）、`abstract_writing_guide`、`intro_title_rhetoric_guide`（CARS moves + 标题检查清单）
- 领域：`hei_domain_glossary`（双语）、`journal_submission_guide`、`latex_template_reference`、`domain_evidence_profiles`（咨询性筛选画像）
- 流程：`failure_paths`（12 个场景）、`mode_selection_guide`（11 种模式）、`plan_mode_protocol`、`workflow_phase_details`、`revision_patch_protocol`（#390 Mode B 命令 + 标记生命周期）
- 伦理：`credit_authorship_guide`（CRediT 14 种角色）、`funding_statement_guide`、`statistical_visualization_standards`
- 披露（v3.2）：`disclosure_mode_protocol`（默认期刊适用性/状态包：`REQUIRED`、`ACTION_ONLY`、`NOT_REQUIRED`、`UNKNOWN`，以及类型化暂停；单独的政策锚点呈现）、`venue_disclosure_policies`（v2 数据库：ICLR、NeurIPS、Nature、Science、ACL、EMNLP，以及医学出版政策目标 — ICMJE、NEJM、The Lancet、JAMA、BMJ、PLOS、Frontiers、出版商范围的 Chinese Nursing Journals Publishing House 中华护理杂志社、期刊层级的 International Eye Science 国际眼科杂志）
- 完整性（v3.3）：`anti_leakage_protocol`（知识隔离）、`vlm_figure_verification`（可选的 VLM 图表检查）
- 政策锚点（#108）：`policy_anchor_table`、`policy_anchor_disclosure_protocol`
- 元数据：`changelog`（版本历史）
- 另有：`deep-research/references/apa7_style_guide.md`（基础参考资料，在此扩展）

**模板**（`templates/` 中的 11 个文件）：`imrad`、`literature_review`、`case_study`、`theoretical_paper`、`policy_brief`、`conference_paper`、`latex_article_template.tex`、`bilingual_abstract`、`credit_statement`、`funding_statement`、`revision_tracking`（4 种状态类型）。

**示例**（`examples/` 中的 9 个文件）：`imrad_hei_example`、`literature_review_example`、`plan_mode_guided_writing`、`chinese_paper_example`、`revision_mode_example`、`revision_recovery_example`、`clinical_citation_verification_checklist`、`clinical_epistemic_status_example`、`version_family_reconciliation_example`。

---

## 反模式

为防止常见失败模式而明确禁止的行为：

| # | 反模式 | 失败原因 | 正确行为 |
|---|-------------|-------------|-----------------|
| 1 | **模糊的默认词汇** | “delve into”“crucial”“it is important to note”通常不如学科自身术语精确 | 使用学科特定词汇；参见 `references/writing_quality_check.md`（诊断工具，而非禁令） |
| 2 | **打断论证的破折号** | 打断句子逻辑的插入语所增加的阅读成本高于其价值 | 在更通顺时使用括号、逗号，或重构句子 |
| 3 | **铺垫式开场** | “In this section, we will discuss...”没有增加任何信息 | 直接以论点或发现开头 |
| 4 | **填充或过载的段落** | 为满足预设长度而拉长或拆分段落，会掩盖论证实际转折之处 | 为每个段落的核心观点提供所需篇幅；不要为满足模板而填充、拆分或变动长度 |
| 5 | **⚠️ 铁律：伪造引文** | 编造看似可信但并不存在的参考文献 | 每条引文都必须通过 DOI 或 WebSearch 验证；参见 `academic-pipeline/agents/integrity_verification_agent.md` |
| 6 | **迎合式修订** | 不经批判性评估便接受所有审稿意见 | 当审稿人错误时，使用 REVIEWER_DISAGREE 状态；以证据说明理由 |
| 7 | **修订期间的范围蔓延** | 为“改进”论文而添加未被要求的章节或分析 | 修订只处理审稿人关切；新增内容需要用户明确批准 |
| 8 | **忽略失败路径** | 即使出现直接拒稿信号或致命方法学缺陷仍继续推进 | 检查 `references/failure_paths.md`；触发时调用 F11 Desk-Reject Recovery |

---

## 质量标准

### 写作质量
1. **每项论断都必须有引文**，或由论文自身的数据支持；对于 #548 的缺失/新颖性论断，则必须提供已记录的检索溯源，以及在存在时明确列出最接近的既有研究（否则，明确的相邻研究不存在声明即可；不存在的事实无法由任何来源进行引用）
2. **零引文孤立项** —— 文内引文与参考文献列表必须完全匹配
3. **语域一致** —— 采用符合该学科的学术语调
4. **逻辑流畅** —— 段落与章节之间应有清晰的过渡
5. **字数合规** —— 控制在目标字数的 +/-10% 以内

### 双语摘要质量
6. **独立撰写** —— zh-TW 和 EN 摘要应分别独立撰写，而非机械翻译
7. **结构对齐** —— 两份摘要应以相同顺序涵盖相同的关键要点
8. **关键词** —— 每种语言提供 5-7 个关键词，反映论文的核心概念
9. **字数要求** —— EN：150-300 个单词；zh-TW：300-500 个字符

### 引文质量
10. **格式合规** —— 100% 遵循所选引文格式
11. ⚠️ **铁律：DOI 纳入** —— 每个具有 DOI 的来源都必须包含 DOI；每条引文都必须通过 DOI 或 WebSearch 进行验证
12. **时效性** —— 标记超过 10 年的来源（奠基性研究除外）
13. **自引比例** —— 超过 15% 时予以标记

### 同行评审
14. **五个基于标准的维度** —— Originality、Methodological Rigor、Evidence Sufficiency、Argument Coherence 和 Writing Quality；根据证据报告分类判断，不进行数值汇总
15. **可执行的反馈** —— 每项批评都必须包含具体建议
16. **最多 2 轮修订** —— 未解决的问题转入 Acknowledged Limitations

### 必须包含的内容
⚠️ **铁律**：每篇论文都必须包含：Data Availability Statement、Ethics Declaration、Author Contributions (CRediT)、Conflict of Interest Statement、Funding Acknowledgment。
17. **AI 使用报告** —— 常规 `full` / `format-convert` 流程包含现有的通用 AI 工具使用声明；独立的 `disclosure` 模式则遵循所选期刊适用性/状态或政策锚定渲染契约
18. **Limitations 章节** —— 明确讨论研究局限性
19. **Ethics 声明** —— 在适用时提供（human subjects、sensitive data）

---

## 输出语言

遵循用户的语言。学术术语保留 English。无论正文使用何种主要语言，始终提供双语摘要。

---

## 与其他 Skills 的集成

```
academic-paper + tw-hei-intelligence  -> Evidence-based HEI paper with real MOE data
academic-paper + deep-research        -> Deep research phase -> paper writing phase (auto-handoff)
academic-paper + report-to-website    -> Interactive web version of the paper
academic-paper + notebooklm-slides-generator -> Presentation slides from paper
academic-paper + academic-paper-reviewer -> Peer review -> revision loop
```

---

## Model Tiering (#517，可选)

当设置了 `ARS_MODEL_TIERING` 时，调度会话会根据 `shared/model_tiering.md` 为此技能的代理进行路由（规范内容：完整的 39 个代理判断/执行表及规则）。简化规则：

- **未设置（默认）：** 每个代理都继承会话模型，与 #517 之前的行为逐字节等效。
- **`economy`**（frontier-tier 会话）：执行类型代理使用比会话模型低一个层级的模型进行调度，最低为 Opus-class，绝不会更低；判断类型代理保持使用会话模型。当会话模型处于最低层级或更低时无操作（仅通知一次）。
- **`quality-boost`**（低于 frontier-tier 的会话）：判断类型代理在检查点表面（Stage 2.5/4.5 门控；可选的 Stage 4→5 claim–ref 审计；最终审查）跳升至 frontier 层级（无论相隔多少层级，都不是只提升一个层级）；任何情况下都不会降级。当会话处于 frontier 层级时无操作（仅通知一次）。
- 未知值 → 仅警告一次，按未设置处理。层级表示相对位置，绝不硬编码为模型 id。当某个方向生效时，将重复的同阶段调用路由至同一个 worker，以便其提示缓存持续累积；未设置时，调度形状也保持逐字节等效。

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