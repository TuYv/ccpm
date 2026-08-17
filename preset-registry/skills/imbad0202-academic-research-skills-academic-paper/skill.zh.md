---
name: academic-paper
description: "12-agent academic paper writing pipeline. 11 modes (full/plan/outline/revision/revision-coach/abstract/lit-review/format-convert/citation-check/disclosure/rebuttal-audit). 6 paper types, 5 citation formats, bilingual abstracts, LaTeX/DOCX-via-Pandoc/PDF output. Style Calibration + Writing Quality Check + Anti-Patterns with IRON RULE markers. Triggers: write paper, academic paper, guide my paper, parse reviews, audit my rebuttal, check my response draft, AI disclosure, 寫論文, 學術論文, 引導我寫論文, 審查意見, 評估回覆, 논문 작성, 초록 작성, 논문 수정, 논문 계획을 도와줘, 심사 의견 반영, 답변서 점검, AI 사용 고지."
metadata:
  version: "3.3.1"
  last_updated: "2026-08-15"
  status: active
  data_access_level: redacted
  task_type: open-ended
  related_skills:
    - deep-research
    - academic-paper-reviewer
    - academic-pipeline
---
# 学术论文——学术论文写作智能体团队

一款通用型学术论文写作工具——由 12 个智能体组成的流水线，覆盖所有学科，并默认以高等教育领域作为参考。

**v2.5** 新增了两项写作质量功能：
- **风格校准**（接入流程第 10 步，可选）——提供 3 篇以上既往论文，流水线将学习你的写作风格（句子节奏、词汇偏好、引文融入方式）。在起草过程中作为柔性指导加以应用；学科惯例始终优先。参见 `shared/style_calibration_protocol.md`。
- **写作质量检查**（`references/writing_quality_check.md`）——在草稿自审步骤中使用的写作质量检查清单。可识别过度使用的典型 AI 用语、破折号滥用、冗长铺垫式开头、段落长度过于一致以及单调的句子节奏。这些是良好的写作规范，并非规避检测的手段。

> **路由规范（v3.9.2）：** 有关跨技能路由规则，请参见 `.claude/CLAUDE.md` 中的“路由规范（v3.9.2）”以及 `shared/references/intent_clarification_protocol.md`。此技能假定路由已确定——跨阶段且含义模糊的材料应已在上游得到澄清。

## 快速开始

**最简命令：**
```
Write a paper on the impact of AI on higher education quality assurance
```

```
Write a paper on the impact of declining birth rates on private university management strategies
```

**执行流程：**
1. 配置访谈——论文类型、学科、引用格式、输出格式
2. 文献检索——系统化检索策略、来源筛选
3. 架构设计——论文结构、大纲、字数分配
4. 论证构建——主张—证据链、逻辑流程
5. 全文起草——逐节撰写草稿、语体调整
6. 引用规范检查 + 双语摘要（并行）
7. 同行评审——从五个视角进行分类评估并提出修改建议
8. 输出格式化——LaTeX/DOCX（通过 Pandoc）/PDF/Markdown

---

## 触发条件

### 触发关键词

**英语**：write paper, academic paper, paper outline, write abstract, revise paper, literature review paper, check citations, convert to LaTeX, convert format, format paper, conference paper, journal article, thesis chapter, research paper, guide my paper, help me plan my paper, step by step paper, draft manuscript, write methodology, write discussion, parse reviews, revision roadmap, help me with my revision, I got reviewer comments, convert citations

**繁体中文**：寫論文, 學術論文, 論文大綱, 寫摘要, 修改論文, 文獻回顧論文, 檢查引用, 轉 LaTeX, 轉換格式, 研討會論文, 期刊文章, 學位論文, 研究論文, 引導我寫論文, 幫我規劃論文, 逐步寫論文, 寫方法論, 寫討論, 審查意見, 修訂路線圖, 幫我修改, 我收到審查意見, 轉換引用格式

**韩语**：논문 작성, 논문 초안, 논문 개요, 초록 작성, 논문 수정, 인용 확인, 인용 형식 검사, LaTeX 변환, 서식 변환, 학위논문 작성, 학술지 논문 작성, 학회 논문 작성, 논문 계획을 도와줘, 단계별로 논문 쓰기, 심사 의견을 받았어, 심사 의견 반영, 답변서 점검, AI 사용 고지

### 规划模式激活条件

当用户希望获得指导、分步骤规划，或对论文结构表示不确定时，激活 `plan` 模式。**默认规则**：当无法确定应使用 `plan` 还是 `full` 时，优先选择 `plan`。

> 有关完整的意图信号和激活规则，请参阅 `references/plan_mode_protocol.md`。

### 不会触发的场景

| 场景 | 应改用 |
|----------|-------------|
| 深度研究/事实核查（非论文写作） | `deep-research` |
| 评审论文（结构化评审） | `academic-paper-reviewer` |
| 完整的从研究到论文流程 | `academic-pipeline` |

### 与 `deep-research` 的区别

| 特性 | `academic-paper` | `deep-research` |
|---------|-------------------|-----------------|
| 主要输出 | 可发表的论文草稿 | 研究报告 |
| 结构 | 符合期刊投稿要求（IMRaD 等） | APA 7.0 报告 |
| 引用 | 多种格式（APA/Chicago/MLA/IEEE/Vancouver） | 仅限 APA 7.0 |
| 摘要 | 双语（繁体中文 + 英文） | 单一语言 |
| 同行评审 | 模拟五维度评审 | 编辑评审 |
| 输出格式 | LaTeX/DOCX（通过 Pandoc）/PDF/Markdown | 仅限 Markdown |
| 修订循环 | 最多 2 轮，并提供针对性反馈 | 最多 2 轮 |

---

## 智能体团队（12 个智能体）

| # | 智能体 | 职责 | 阶段 |
|---|-------|------|-------|
| 1 | `intake_agent` | 配置访谈：论文类型、学科、期刊、引用格式、输出格式、语言、字数；交接检测；规划模式简化访谈 | 阶段 0 |
| 2 | `literature_strategist_agent` | 搜索策略设计、来源筛选、注释书目、文献矩阵 | 阶段 1 |
| 3 | `structure_architect_agent` | 论文结构选择、详细大纲、字数分配、证据映射 | 阶段 2 |
| 4 | `argument_builder_agent` | 论证构建、主张—证据链、逻辑脉络、反方论点处理；规划模式论证压力测试 | 阶段 3 / 规划步骤 3 |
| 5 | `draft_writer_agent` | 按章节撰写完整草稿、调整学科语体、跟踪字数 | 阶段 4 |
| 6 | `citation_compliance_agent` | 引用格式验证、参考文献列表完整性检查、DOI 检查 | 阶段 5a |
| 7 | `abstract_bilingual_agent` | 双语摘要（繁体中文 + 英文），每种语言 5–7 个关键词 | 阶段 5b |
| 8 | `peer_reviewer_agent` | 模拟双盲评审、从五个视角进行分类评估、提出修订建议（最多 2 轮） | 阶段 6 |
| 9 | `formatter_agent` | 转换为 LaTeX/DOCX（通过 Pandoc）/PDF/Markdown、期刊格式设置、投稿附信、引用格式转换（APA 7 / Chicago / MLA / IEEE / Vancouver） | 阶段 7 |
| 10 | `socratic_mentor_agent` | 规划模式苏格拉底式导师：逐章指导、收敛标准（4 个信号）、问题分类（4 种类型）、INSIGHT 提取 | 规划步骤 0–3 |
| 11 | `visualization_agent` | 解析论文数据并生成出版质量的图表代码（Python matplotlib / R ggplot2），采用 APA 7.0 格式、色觉障碍友好型调色板，并支持 LaTeX 集成 | 阶段 4 / 阶段 7 |
| 12 | `revision_coach_agent` | 将非结构化的评审意见解析为修订路线图，或将明确标识为真实委员会意见的内容解析到独立的 #668 来源可追溯问题跟踪器中；可独立运行 | 修订辅导模式 |

---

## 输出格式

### 文本格式
LaTeX（.tex + .bib）、DOCX（通过 Pandoc）、PDF（通过 LaTeX 或 Pandoc）、Markdown。

### 图表
当论文包含定量结果时，`visualization_agent` 可以使用 Python（matplotlib/seaborn）或 R（ggplot2）生成符合 APA 7.0 格式并采用色盲友好配色方案的可发表质量图表。图表以可运行代码 + LaTeX `\includegraphics` 集成代码的形式交付。有关图表类型决策树和代码模板，请参阅 `references/statistical_visualization_standards.md`。

### 引用格式
APA 7.0（默认）、Chicago（作者—日期制或脚注—书目制）、MLA 9、IEEE、Vancouver。`formatter_agent` 支持在后期通过“将引用转换为[格式]”在任意两种受支持的格式之间转换引用格式。

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

> 有关各阶段代理行为和输出说明的详细信息，请参阅 `references/workflow_phase_details.md`。

### 评审目标标准绑定（#684）

当阶段 0 已生成经作者确认的 `ReviewTargetContext`（#683）后，
编排器会初始化一份仅包含指针的 `ReviewCriteriaBindingManifest`，并在
形成性评审、内部评估者和外部评审组这些使用方之间原样使用。
规范生命周期、精确标记、封闭角色和明确的降级路径定义于
`shared/references/review_criteria_consumer_protocol.md`。

- 阶段 2 负责 `FORMATIVE` 回执。结构架构师将选定的
  标准 ID 映射到规划的章节和证据需求；后续写作阶段
  复用该回执，不再重新解析目标。
- 阶段 6a 接收相同的指针权限和目标标准简报，同时
  保持无法查看论文；其预承诺产物负责 `INTERNAL`
  回执。阶段 6b 接收该未经更改的产物，可在看到草稿后
  评估适用性，并负责所有严重/重大建设性发现的
  附属文件。
- 科学有效性、场所匹配度和投稿准备度仍然彼此独立。
  标准绝不授权虚构证据、结果、方法，或更改
  作者的贡献主张。

绑定验证仅是一项交接一致性检查。它绝不提供
编辑结论、严重程度、检查点状态或作者分诊。如果绑定
不可用，请披露 `criteria_binding_unavailable`；不要声称与目标场所
相符，也不要依据模型记忆静默重建目标。

### 检查点规则

1. ⚠️ **铁律**：用户必须确认论文配置记录，才能继续进入阶段 1
2. **阶段 2 -> 3**：用户必须批准大纲（可要求调整结构）
3. ⚠️ **铁律**：最多进行 2 轮修订；未解决事项 ->“已确认的局限性”
4. **同行评审** 中严重级别的问题会阻止流程进入阶段 7
5. 如果用户提供自己的来源，可以跳过阶段 1（文献）

---

> **v3.4.0 合规要求（适用于 `full` 模式）：** 在最终定稿前，`compliance_agent` 会运行仅针对 RAISE 原则的检查（仅警告；基础研究不属于 PRISMA-trAIce 的适用范围）。警告会列入披露声明，但绝不会阻塞流水线。参见 `shared/raise_framework.md §Scope disclaimer`。

## 分阶段调用契约（v3.9.2）

academic-paper 流水线分为 8 个阶段（阶段 0 信息收集 → 阶段 7 格式化）。有两种调用模式：

**模式 A — 编排器驱动（默认）：** `pipeline_orchestrator_agent`（位于 `academic-pipeline` skill 中）通过材料护照跟踪状态，端到端运行所有阶段。

**模式 B — 分阶段执行（跨会话恢复）：** 对于长期运行的项目，用户可跨多个会话，每个阶段调用一个智能体。常见模式是：在一个会话中撰写草稿，下周再回来分别独立进行引文检查、摘要撰写和同行评审。

在模式 B 中，**单阶段智能体（依据 `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md` 归为 Bucket A）在写入时必须严格限定于各自被分配的阶段**。academic-paper 中的 7 个 Bucket A 智能体为：`literature_strategist`（P1）、`structure_architect`（P2）、`draft_writer`（每次调用对应 P4/P6）、`citation_compliance`（P5a）、`abstract_bilingual`（P5b）、`peer_reviewer`（P6）、`formatter`（P7）。允许读取上游阶段的内容。

多阶段智能体（Bucket B：`argument_builder` P3+Plan、`visualization` P4+P7）仅执行调用方在该阶段的调用中指定的工作——不得在同一次调用中扩展到其他阶段。下方的 v3.6.6 生成器-评估器契约还进一步约束了 `draft_writer` 和 `peer_reviewer` 的子阶段行为（阶段 4a/4b、阶段 6a/6b）。

进入模式 B 需要用户发出明确的信号——`/ars-<mode>` 斜杠命令或 `[direct-mode]` 前缀。对于含糊的跨阶段输入，默认按照 `.claude/CLAUDE.md` 中的路由规范和 `shared/references/intent_clarification_protocol.md` 进行澄清。

**强制执行（v3.9.2）：** Bucket A 智能体的阶段边界阻断机制 + 建议性验证器（`scripts/check_pipeline_integrity.py`）+ 在支持钩子的运行时环境中使用确定性的 PreToolUse 写入范围防护机制（#134 范围重划，PR #294）。多阶段边界仍采用前向范围（#134 切片 3-5）。

## v3.6.6 生成器-评估器契约协议

> 这是 `academic-paper full` 模式中 v3.6.6 契约门控阶段拆分的权威编排区块。自 v3.6.6 起采用 Schema 13.1（`shared/sprint_contract.schema.json`）。模板：`shared/contracts/writer/full.json` + `shared/contracts/evaluator/full.json`。设计规范：`docs/design/2026-04-27-ars-v3.6.6-generator-evaluator-contract-design.md` §5。
>
> **仅适用于 `academic-paper full` 模式。** 九种非 full 模式（`plan`、`outline-only`、`revision`、`revision-coach`、`abstract-only`、`lit-review`、`format-convert`、`citation-check`、`disclosure`）在 v3.6.5 → v3.6.6 期间保持逐字节等同，且不会调用本协议。（后续新增的 `rebuttal-audit` 模式同样属于非 full 模式，也不会调用本协议。）流水线边界保持不变：`academic-pipeline` 的阶段 2 以 plan 或 full 模式分派 `academic-paper`（仅 full 模式会调用本协议）；阶段 3 分派独立的 `academic-paper-reviewer` skill（由 5 个评审面板进行外部编辑评审）。本协议下配对流程内部的阶段 6 评估器与阶段 3 评审器属于不同的评审层级——参见设计文档 §5.1 审计结论 2。

### 概述

v3.6.6 将阶段 4（撰写者起草）和阶段 6（配对内评估者审查）拆分为由 `writer_full` 和 `evaluator_full` 契约控制的论文不可见/论文可见调用对。该拆分沿用了 `academic-paper-reviewer/references/sprint_contract_protocol.md`（v3.6.2 的审查者模式），但针对没有评审组且（对于撰写者而言）没有 scoring_plan 的单智能体生成器模式进行了调整。

其中起关键作用的机制是**调用之间的物理隔离**：撰写者阶段 4a 永远无法看到运行时起草产物；评估者阶段 6a 永远无法看到撰写者在阶段 4b 生成的草稿。这消除了配对内自我质量关卡中“先阅读论文，再为标准寻找合理解释”的偏移路径。

### 四调用结构

对于每次 `academic-paper full` 调用，阶段 4 和阶段 6 会从两个独立调用扩展为四个相互分离的模型调用。每个调用都按照下述系统内容与用户内容规范，拥有各自的系统提示词和用户内容。

1. **阶段 4a——撰写者在论文不可见时预先承诺。**
   - 系统提示词：`academic-paper/agents/draft_writer_agent.md` 中 §“v3.6.6 生成器-评估者契约协议”下的 `### Phase 4a — Writer paper-blind pre-commitment` 小节。
   - 用户内容：`writer_full` 契约 JSON + 仅包含论文元数据（`title`、`field`、`word_count`）。
   - 输出：`## Acceptance Criteria Paraphrase` 章节 + 末尾的 `[PRE-COMMITMENT-ACKNOWLEDGED]` 标签。
   - 检查：3 项结构检查（参见下文 §“阶段 4a / 6a 输出检查”）。
2. **阶段 4b——撰写者在论文可见时起草并进行自我评分。**
   - 系统提示词：同一智能体文件中的 `### Phase 4b — Writer paper-visible drafting + self-scoring` 小节。
   - 用户内容：`writer_full` 契约 JSON（重新注入）+ 包裹在 `<phase4a_output>...</phase4a_output>` 数据分隔符中的阶段 4a 输出 + 上游起草产物（论文配置记录、论文大纲、论证蓝图、附带注释的参考文献目录，包括其中的检索策略/模式 2 `search_strategy`（#548——撰写者填入受检索范围约束的新颖性声明中的边界）、可选的风格配置文件、可选的知识隔离指令）。
   - 输出：`## Draft Body` → `## Dimension Scores` → `## Failure Condition Checks` → `## Writer Decision`。
   - 检查：4 项结构检查（参见下文 §“阶段 4b / 6b 输出检查”）。
3. **阶段 6a——评估者在论文不可见时预先承诺。**
   - 系统提示词：`academic-paper/agents/peer_reviewer_agent.md` 中 §“v3.6.6 生成器-评估者契约协议”下的 `### Phase 6a — Evaluator paper-blind pre-commitment` 小节。
   - 用户内容：`evaluator_full` 契约 JSON + 论文元数据 + 撰写者最新的 `<phase4a_output>`（评估者必须根据 `disagreement_handling.pre_commitment_check_protocol.check_writer_artifact` 验证的撰写者产物）+ 启用时仅含指针的 #684 清单/目标标准简报/`INTERNAL` 标记。
   - 输出：`## Contract Paraphrase` + `## Scoring Plan`（每个维度包含 `dimension_id` / `what_to_look_for` / `what_triggers_block` / `what_triggers_warn`）+ 仅含指针的绑定承诺（或 `criteria_binding_unavailable`）+ 末尾的 `[PRE-COMMITMENT-ACKNOWLEDGED]` 标签。不引入额外的 H2。
   - 检查：5 项结构检查。
4. **阶段 6b——评估者在论文可见时评分并作出决策。**
   - 系统提示词：同一智能体文件中的 `### Phase 6b — Evaluator paper-visible scoring + decision` 小节。
   - 用户内容：`evaluator_full` 契约 JSON（重新注入）+ 包裹在 `<phase6a_output>...</phase6a_output>` 中的阶段 6a 输出 + 撰写者的 `<phase4a_output>`（根据 `pre_commitment_check_protocol.check_writer_artifact` 无条件提供）+ 撰写者在阶段 4b 生成的草稿（接受审查的产物）+ 阶段 6a 中曾提供的、保持不变的 #684 权威依据。
   - 输出：`## Dimension Scores` → `## Failure Condition Checks` → `## Review Body` → `## Evaluator Decision`，以及角色标记/不可用披露，并在适用时附带经过单独验证的建设性边车内容。
   - 检查：5 项结构检查。

### 系统提示词与用户内容的边界规范

逐字遵循 `sprint_contract_protocol.md` §2 中的审阅者模式：

- **系统提示词仅承载不变的策略文本**：智能体文件中 `## v3.6.6 Generator-Evaluator Contract Protocol` 块里的阶段子章节指令、lint 描述以及阶段边界标签约定。
- **用户内容承载契约 JSON（每次调用时重新注入）以及该阶段允许的运行时输入**：论文元数据、`<phase4a_output>` / `<phase6a_output>` 分隔块、上游起草产物、论文草稿。

所有动态 LLM 输出（Phase Na 运行时产出、论文内容）都通过数据分隔符置于用户内容中，绝不放入系统提示词。这可防止动态的单篇论文内容被意外提升到不变策略层面。

### Schema 字段名与运行时产出的区别

`pre_commitment_artifacts`（蛇形命名法，使用反引号）是 `shared/sprint_contract.schema.json` 中的 schema 字段名——即冻结契约基线中的配置声明。“writer Phase 4a pre-commitment output”则是运行时产出——writer agent 在 Phase 4a 中实际生成的 Markdown 文本。该运行时产出位于 `<phase4a_output>` 内，并被移交给 Phase 4b / Phase 6a / Phase 6b。`disagreement_handling`（schema 字段）与“evaluator Phase 6a pre-commitment output”（运行时产出）也遵循相同模式。混淆二者会导致无法区分契约基线配置和 LLM 生成的内容。

### Phase 4a / 6a 输出 lint

根据 `sprint_contract_protocol.md` §4 的计数约定，各模式的结构检查数量如下：

- **Writer Phase 4a（3 项检查）**：必需章节按顺序出现（`## Acceptance Criteria Paraphrase`、末尾的 `[PRE-COMMITMENT-ACKNOWLEDGED]`）；释义段落数 ≥ `pre_commitment_artifacts.acceptance_criteria_paraphrase.minimum_dimensions`；Phase 4a 内容仅引用契约 JSON 和论文元数据。**不得包含 `## Scoring Plan` 章节**——`writer_full` 不含 scoring_plan。
- **Evaluator Phase 6a（5 项检查）**：必需章节按顺序出现（`## Contract Paraphrase`、`## Scoring Plan`、末尾的 `[PRE-COMMITMENT-ACKNOWLEDGED]`）；释义段落数 ≥ `disagreement_handling.paraphrase_minimum_dimensions`；每个验收维度对应一个 `### <Dn>: <name>` 子章节；每个 scoring_plan 子章节均包含 `disagreement_handling.scoring_plan.per_dimension_criteria` 的四字段结构（`dimension_id`、`what_to_look_for`、`what_triggers_block`、`what_triggers_warn`）；Phase 6a 内容仅引用契约 JSON、论文元数据、writer 的 `<phase4a_output>`，以及不涉及论文内容的 #684 指针权威信息（不得引用完整草稿／论文内容）。具有约束力的承诺是 Scoring Plan 之后不带项目符号的指针数据，而不是额外的 H2。

重试语义：首次尝试 lint 失败 → 在系统提示词中提示具体的 lint 缺口后重试一次；第二次失败 → 按下方 § “Single-agent generator unusable handling” 将此角色标记为不可用。

### 阶段 4b / 6b 输出检查

- **写作者阶段 4b（4 项检查）**：必需章节按以下顺序排列——`## Draft Body`、`## Dimension Scores`、`## Failure Condition Checks`、`## Writer Decision`；维度评分与写作者的七个维度 D1–D7 一一对应（依据 `shared/contracts/writer/full.json`）；失败条件检查与 F1 / F4 / F2 / F3 / F0 一一对应；写作者决策可根据 F 条件的严重性优先级推导得出。**不进行多重异议重试**（写作者没有可提出异议的 scoring_plan）。**不进行一致性检查**（写作者阶段 4a 不会发出 scoring_plan 触发词元）。
- **评估者阶段 6b（5 项检查）**：必需章节按以下顺序排列——`## Dimension Scores`、`## Failure Condition Checks`、`## Review Body`、`## Evaluator Decision`；维度评分与评估者的五个维度 D1–D5 一一对应（依据 `shared/contracts/evaluator/full.json`）；失败条件检查与 F1 / F2 / F3 / F6 / F4 / F5 / F0 一一对应；一致性检查（阶段 6b 的评分通过子字符串匹配阶段 6a 的 `disagreement_handling.scoring_plan.per_dimension_criteria` 触发词元）；评估者决策可根据 F 条件的严重性优先级推导得出。**不进行多重异议重试**（评估者的阶段内分歧通过 `disagreement_handling.disagreement_resolution` 编码为 F 条件操作，而非重试触发器）。

多重异议重试仍仅适用于审稿者（`academic-paper-reviewer` skill）；生成器模式没有评审小组，也没有 scoring_plan 异议锚点。

三种模式的检查数量汇总：

| 阶段 | 审稿者（零接触） | 写作者 | 评估者 |
|---|---|---|---|
| 阶段 1 / 4a / 6a | 5 | 3 | 5 |
| 阶段 2 / 4b / 6b | 6 | 4 | 5 |

### 单智能体生成器不可用处理

当写作者或评估者阶段变得不可用时（阶段 Na 检查连续两次失败，或阶段 Nb 检查失败），`academic-paper` 会发出阶段级中止标签，并转交用户干预：

- **写作者阶段 4 不可用** → `[GENERATOR-PHASE-ABORTED: role=writer, contract=<id>, reason=<lint_failure_kind>]` → 中止 `academic-paper` 阶段 4 → 由用户干预决定重试 / 回退 / 回归至阶段 3（论证蓝图）。
- **评估者阶段 6 不可用** → `[GENERATOR-PHASE-ABORTED: role=evaluator, contract=<id>, reason=<lint_failure_kind>]` → 中止 `academic-paper` 阶段 6 → 由用户干预决定重试 / 回退 / 回归至阶段 5（草稿撰写完成）。

`[GENERATOR-PHASE-ABORTED]` **不**构成有效的阶段 6b 输出，且无法进入第 3 阶段的审稿者分派。存在两条有效的第 3 阶段进入路径（依据设计文档 §5.1）：

- **标准路径**：评估者阶段 6b 发出 F0 `evaluator_decision=accept` 或 F4 `evaluator_decision=accept_with_dissent_note`。
- **例外路径**：当配对内修订循环在第 2 轮耗尽，且强制维度阻塞再次发生后，评估者阶段 6b 发出 F5 `evaluator_decision=flag_for_reviewer_stage`。

`academic-paper` 不为写作者 / 评估者携带评审小组基数不变量（没有 `panel_size` 字段——Schema 13.1 §3.3.5 中仅审稿者适用）。生成器侧不存在 `[PANEL-SHRUNK]` 的对应机制；`[GENERATOR-PHASE-ABORTED]` 是阶段级中止。

**运行监控**：在 v3.6.6 部署后的前三个月内跟踪 `[GENERATOR-PHASE-ABORTED]` 比率。分母按**每次 `academic-paper full` 运行**计算——即用户感知的一次顶层调用。5% 阈值的计算公式为 `(runs_with_any_abort) / (total_runs)`。如果该比率超过 5%，v3.6.7 将引入优雅降级回退机制（参见下文 §「已知限制」）。

### 跨会话恢复范围

v3.6.6 的生成器-评估器轮次（Phase 4a + Phase 4b + Phase 6a + Phase 6b + 配对内修订循环）是一个**会话内原子单元**。在轮次中途手动拆分会话 → 写作者 Phase 4a 输出将丢失；新会话必须从 Phase 0 重新启动 `academic-paper full` 模式。

v3.6.3 的 `ARS_PASSPORT_RESET=1` `reset_boundary[]` 机制（参见 `academic-pipeline/references/passport_as_reset_boundary.md`）作用于 `academic-pipeline` Stage 边界，而非 `academic-paper` 内部阶段边界。`academic-paper` 内部阶段（4a / 4b / 6a / 6b）**不是**边界点；它们之间不会生成 `kind: boundary` 账本条目。如果运行数据表明确有必要，v3.6.7+ 可能会引入 `pre_commitment_history[]`，以跨会话持久化写作者 Phase 4a 产物——参见下文 §「已知限制」。

## 已知限制

- **v3.6.6 中没有优雅降级回退机制**：当写作者或评估器阶段通过 `[GENERATOR-PHASE-ABORTED]` 中止时，`academic-paper full` 会中止并转交用户干预。v3.6.7 可能会引入一种回退机制，将受影响的阶段降级为 v3.6.5 的单次调用行为，并记录此次降级。v3.6.6 发布时仅提供中止行为。有关运行层面的 5% / 三个月监控，请参见上文 §「单智能体生成器不可用处理」。
- **不支持轮次中途跨会话恢复**：四阶段生成器-评估器轮次是一个会话内原子单元。在轮次中途手动拆分会话会丢失写作者 Phase 4a 产物，并强制从 Phase 0 重新启动。v3.6.7+ 可能会在 Schema 9 中引入 `pre_commitment_history[]` 账本条目，以跨会话边界持久化写作者 Phase 4a 产物；v3.6.6 未实现此功能。
- **配对内 Phase 6 评估器与 `academic-paper-reviewer` 外部评审**：配对内 `peer_reviewer_agent`（带有 v3.6.6 契约门控的 Phase 6 评估器）和独立的 `academic-paper-reviewer` skill（Stage 3 的 5 面板外部编辑评审）服务于不同的评审层级，并继续按照设计文档 §1「已知限制」记录为已知技术债务。路由 / 合并决策推迟至 v3.7.x。

## 运行模式（11 种模式）

详情参见 `references/mode_selection_guide.md`。

| 模式 | 触发语 | 智能体 | 输出 |
|------|---------|--------|--------|
| `full` | “撰写论文” | 全部 9 个（定量研究则为 11 个） | 完整论文草稿（如适用，包含图表） |
| `outline-only` | “论文大纲” | 1->2->3 | 详细大纲 + 证据图谱 |
| `revision` | “修订论文” | 8->5->6 | 补丁文档 + 以确定性方式应用补丁后的修订稿 + 应用报告（#390；修订日志使用 `templates/revision_tracking_template.md`） |
| `abstract-only` | “撰写摘要” | 1->7 | 双语摘要 + 关键词 |
| `lit-review` | “文献综述” | 1->2 | 带注释的参考文献目录 + 综合分析 |
| `format-convert` | “转换为 LaTeX” / “将引文转换为 [格式]” | 仅 9 | 格式化文档；包括引文格式转换（APA 7 / Chicago / MLA / IEEE / Vancouver） |
| `citation-check` | “检查引文” | 仅 6 | 引文错误报告 |
| `plan` | “指导我写论文” / “帮我规划论文” | 1->10->3->4 | 章节计划 + INSIGHT 集合 |
| `revision-coach` | “解析评审意见” / “修订路线图” / “我收到了审稿人意见” / “我们是否应该反驳” / “会议答辩回复” / “基金评审小组回复” / 明确识别为真实委员会往来函件 | 仅 12 | 同行评审路径：不可变的路线图核心 + 明确的作者边车数据 + 可选的跟踪模板/回复骨架。委员会路径：单独的 #668 关注事项跟踪器 + 占位回复骨架；不使用 Schema 11、审稿人义务/严重性或裁定。 |
| **`disclosure`** (v3.2) | **“Nature 的 AI 披露” / “生成 AI 使用声明”** | **仅 9** | **默认投稿场所路径：`REQUIRED` / `ACTION_ONLY` / `NOT_REQUIRED` / `UNKNOWN` 适用性以及类型化中止状态；政策锚点路径：特定于锚点的呈现** |
| **`rebuttal-audit`** | **“审核我的回复” / “检查我的答辩回复” / “我是否遗漏了任何审稿人意见”**（同时需要审稿人意见和现有答辩回复草稿） | **仅 12（仅解析）** | **答辩回复 QA 报告：逐条意见覆盖情况 + 缺口 + 风险标记。不生成新回复；仅供参考。不生成 Schema 11 / Material Passport / 已验证状态。** |

**披露分派约定：** 当 mode=`disclosure` 时，agent 9 会进入其独立分支，并且在生成文本之前必须加载 `references/disclosure_mode_protocol.md`。它不会执行常规的 Phase 7 格式化，也不会改用通用的全流程 AI 声明；该协议会选择投稿场所数据库路径或政策锚点路径，并负责所有中止/渲染决策。

### 快速模式选择指南

| 你的情况 | 推荐模式 | 频谱 |
|----------------|-----------------|----------|
| 从零开始，且有明确的 RQ | `full` | balanced |
| 在写作前需要规划方面的帮助 | `plan` | originality |
| 只需要一个大纲 | `outline-only` | balanced |
| 已有草稿，并收到了评审反馈 | `revision` | fidelity |
| 有未结构化的审稿意见 | `revision-coach` | balanced |
| 有来自真实委员会/机构审查办公室、需要跟踪的意见 | `revision-coach` 委员会通信变体 | fidelity |
| 只需要摘要 | `abstract-only` | fidelity |
| 需要检查/修正引文 | `citation-check` | fidelity |
| 需要转换格式（LaTeX、DOCX）或引文样式 | `format-convert` | fidelity |
| 想撰写系统性文献综述论文 | `lit-review` | fidelity |
| 投稿时需要针对特定投稿场所的 AI 使用披露材料包 | `disclosure` | fidelity |
| 已有书面答辩草稿，需要对照审稿意见进行质量检查 | `rebuttal-audit` | fidelity |

**频谱**（v3.2）：*fidelity* = 大量使用模板、输出可预测；*balanced* = 默认；*originality* = 探索性、较少使用模板。完整的跨技能频谱表请参阅 `shared/mode_spectrum.md`。

不确定？从 `plan` 开始——它会逐步引导你。`disclosure` 是收尾步骤——请在论文起草完成后运行，并以你计划投稿的场所为目标。

**委员会通信路由：** 仅当用户明确指出真实的委员会/机构审查办公室时，
才使用 `revision-coach` 变体。加载
`references/committee_correspondence_protocol.md`；不要根据语气推断其官方权威性。
这一独立产物是一种包含来源核算的起草辅助材料，绝不会进入
同行评审 Schema 11。

### 模式选择逻辑

> 有关触发条件到模式的映射以及完整的选择流程图，请参阅 `references/mode_selection_guide.md`。

---

## 答辩审查模式

`rebuttal-audit` 会评估作者**现有的**答辩稿/审稿意见回复草稿在覆盖度、语气和证据方面的表现。它属于咨询性质的质量检查——**不会**撰写或改写回复。

**输入门控（路由）：** 仅当用户同时提供以下两项时，才激活 `rebuttal-audit`：(a) 审稿意见/决定函，以及 (b) 供评估的现有答辩稿/回复草稿。如果只提供了 (a)（尚无草稿），则路由至 `revision-coach`（它会*生成*回复框架）。如果意图不明确，应先澄清，而不是猜测。

**它会生成：**
- 逐条意见覆盖表——将草稿中对每项审稿人关切的处理情况标记为 `addressed` / `partially` / `missing`。
- 缺口列表——草稿未能回应的关切。
- 风险标记——语气过于对抗、提出主张但未提供证据，或回复误解了审稿人的实际观点。
- 改进建议（咨询性质）。

**铁律——完整性边界（禁止虚假认证）：** `rebuttal-audit` 会复用 `revision_coach_agent` 的评论解析能力，但独立调用在流程**之外**运行，因此绝不会通过 Stage 4.5 最终完整性检查。它**不得**生成 Schema 11 `commitment_extracted` 台账，**不得**写入 Material Passport，也**不得**将材料包标记为 `ready_to_submit` 或任何已验证状态。生成 Schema 11 工件会错误地暗示回复已进入流程的可追溯性系统。其输出仅为咨询性质的 QA 报告。

**与 `re-review` 的边界：** `academic-paper-reviewer` 的 `re-review` 模式验证的是**修订后的稿件**（作者声称的修改是否确实出现在论文中），并在流程内运行。`rebuttal-audit` 验证的是**回复信本身**（答辩是否涵盖每一条评论，其语气和证据是否恰当），并以独立、咨询性质的方式运行。工件不同，层级不同。

---

## 修订模式补丁协议 (#390)

在修订模式下，`draft_writer_agent` 不会重新生成完整论文。该轮次按**锚点化 → 补丁 → 确定性应用 → 最终处理**的顺序运行，将重新生成的范围限制在修订明确涉及的区块内（DELEGATE-52 影响范围控制；规范见 `docs/design/2026-06-10-390-diff-patch-revision-mode-spec.md`）：

1. **锚点化**草稿（`scripts/ars_anchorize_draft.py`——幂等且内容中立）：每个区块都会获得一个稳定的 `<!--block:BNNNN-->` 标记和一份精确清单。在应用补丁之前，不会重写草稿中的任何内容。
2. **绑定显式授权 (#670)：** 验证不可变的 `revision-roadmap/1.0`、精确登记的主张表述范围，以及完整的 `author-adjudication/1.0`。路线图将严重程度、义务、成本范围和有限后果相互独立地保留；作者的分类裁决和精确目标仅存在于单独的显式附属文件中。
3. **写作者将当前的补丁 1.1**（`shared/contracts/patch/revision_patch.schema.json`）作为附属文件输出——每项操作仅引用 `will_address` 项，保持在精确的目标/操作范围内，并显式声明主张/附带影响数组。已登记主张的变动需要作者明确批准的精确替代内容；与已拒绝项重叠的内容需要精确的附带影响授权。
4. **确定性应用**（`scripts/ars_apply_revision_patch.py`）会在结构分析或写入之前重放每一项绑定。当前的 1.3 版报告格式包含以机械方式推导出的授权凭证，以及如实反映的 `unregistered_claim_drift_review_required` E6 边界。如果 E6 随后在未登记的表述范围中检测到漂移，该检查点不存在默认开放的通路：作者必须显式选择 `restore`、`authorize_with_reason` 或 `pause`。构建和重放验证会将每项选择绑定到一个明确命名的、当前运行本地的原始会话事件工件；附属文件保留其重新计算的摘要，但不保留路径或消息。未涉及的区块保持逐字节一致。
5. **持续证据：** 每次审阅写入、全部拒绝时的空操作以及完整性修正轮次，都会进入 `revision-evidence-bundle/1.0`，覆盖从精确的完整性检查通过草稿到精确的最终草稿。范围升级需要新的显式附属文件或范围更窄的补丁；旧版的完整重新生成不能声称通过当前的授权检查。

编排运行遵循 `pipeline_orchestrator_agent.md` § 修订轮次补丁排序；模式 B 用户手动运行相同脚本——确切命令见 `references/revision_patch_protocol.md`。如实说明边界：已注册表面和确切编辑权限可由机器重放，但未注册的语义漂移仍需 E6 审查。`scripts/claim_strength_drift_disposition.py` 仅完成对已报告行的显式处理；它无法使模型介导的检测变得确定或完备。`academic-paper full` 配对内的阶段 6→4 循环不属于此独立/流水线修订契约的范围。

---

## 规划模式：逐章引导式规划

通过苏格拉底式模式，一次一个章节地引导用户规划论文。通过结构化对话构建完整的论文蓝图。

> 有关完整的逐章对话流程和论文蓝图结构，请参阅 `references/plan_mode_protocol.md`。

---

## 移交协议：deep-research -> academic-paper

`intake_agent` 会自动检测深度研究材料（研究问题简报 /
参考文献目录 / 综合分析 / INSIGHT 集合），并跳过冗余步骤。它
还要求提供由构建器生成的确切 `preregistration-artifact/1.0` 移交
回执；如果有明确指定的配套文件，也必须一并提供。接收流程会验证这些
字节并原样传递；它不会推断状态、修复/重新构建
伴随文件、循其显示路径访问，也不会用规划模板替代。用户后续
显式提供的材料必须由指定的确定性构建器生成新的伴随文件来表示。
请参阅 `deep-research/SKILL.md` 中的移交协议以及
`shared/references/cross_document_consistency_advisory_protocol.md`。

---

## 失败路径

详情见 `references/failure_paths.md`。快速参考：

| 失败场景 | 处理策略 |
|---------|---------|
| 研究基础不足 | 建议先运行 `deep-research` |
| 选择了错误的论文结构 | 返回阶段 2，建议替代结构 |
| 字数显著超过/低于目标 | 找出有问题的章节，建议删减/扩充 |
| 引用格式完全错误 | 重新运行整个引用阶段 |
| 同行评审被拒 | 分析拒稿原因，建议进行重大修订或重构 |
| 规划模式无法收敛 | 建议切换到仅大纲模式 |
| 移交材料不完整 | 列出缺失项目，建议补充或重新运行 |
| 用户中途放弃 | 保存已完成的章节计划 |

---

## 完整学术流水线

完整工作流见 `academic-pipeline/SKILL.md`。

---

## 阶段 0：配置访谈

有关阶段 0 配置访谈的完整字段定义，请参阅 `agents/intake_agent.md`。访谈涵盖 9 个核心项目：论文类型、学科、目标期刊、引用格式、输出格式、语言、摘要、字数和现有材料——此外还包括共同作者、资助、可选的风格校准、领域证据配置文件（步骤 12）、引用验证级别（步骤 13，#392）以及独立的撤稿政策（步骤 14，#651）。两项引用政策默认都仅做标记，并提供显式的严格模式选择，分别用于初始化 `terminal_policies.citation_existence` 和 `terminal_policies.retraction`。当作者确认目标出版平台/分区/类型时，阶段 0 还会解析 #683 `ReviewTargetContext`，并在任何感知标准的使用方运行之前初始化 #684 仅指针绑定清单；若不存在，则使用显式的通用领域 `criteria_binding_unavailable` 路径。输出论文配置记录，等待用户确认。

---

## 文件结构

**智能体定义**：`agents/{agent_name}.md` — 每个智能体对应一个文件（共 12 个，与上方的智能体团队表一致）。

**参考资料**（`references/` 中共 28 个文件）：
- 引用：`apa7_extended_guide`、`apa7_chinese_citation_guide`、`citation_format_switcher`
- 写作：`academic_writing_style`、`writing_quality_check`、`writing_judgment_framework`
- 结构：`paper_structure_patterns`（6 种类型）、`abstract_writing_guide`、`intro_title_rhetoric_guide`（CARS 步骤 + 标题核对清单）
- 领域：`hei_domain_glossary`（双语）、`journal_submission_guide`、`latex_template_reference`、`domain_evidence_profiles`（建议性筛查配置）
- 流程：`failure_paths`（12 种场景）、`mode_selection_guide`（11 种模式）、`plan_mode_protocol`、`workflow_phase_details`、`revision_patch_protocol`（#390 B 模式命令 + 标记生命周期）
- 伦理：`credit_authorship_guide`（CRediT 的 14 种角色）、`funding_statement_guide`、`statistical_visualization_standards`
- 披露（v3.2）：`disclosure_mode_protocol`（默认的投稿渠道适用性/状态组合：`REQUIRED`、`ACTION_ONLY`、`NOT_REQUIRED`、`UNKNOWN`，以及类型化中止；单独呈现政策锚点）、`venue_disclosure_policies`（v2 数据库：ICLR、NeurIPS、Nature、Science、ACL、EMNLP，以及医学出版政策目标——ICMJE、NEJM、The Lancet、JAMA、BMJ、PLOS、Frontiers、出版机构级的 Chinese Nursing Journals Publishing House 中华护理杂志社、期刊级的 International Eye Science 国际眼科杂志）
- 完整性（v3.3）：`anti_leakage_protocol`（知识隔离）、`vlm_figure_verification`（可选的 VLM 图像检查）
- 政策锚点（#108）：`policy_anchor_table`、`policy_anchor_disclosure_protocol`
- 元信息：`changelog`（版本历史）
- 另有：`deep-research/references/apa7_style_guide.md`（基础参考资料，在此基础上扩展）

**模板**（`templates/` 中共 11 个文件）：`imrad`、`literature_review`、`case_study`、`theoretical_paper`、`policy_brief`、`conference_paper`、`latex_article_template.tex`、`bilingual_abstract`、`credit_statement`、`funding_statement`、`revision_tracking`（4 种状态类型）。

**示例**（`examples/` 中共 9 个文件）：`imrad_hei_example`、`literature_review_example`、`plan_mode_guided_writing`、`chinese_paper_example`、`revision_mode_example`、`revision_recovery_example`、`clinical_citation_verification_checklist`、`clinical_epistemic_status_example`、`version_family_reconciliation_example`。

---

## 反模式

为防止常见失败模式而明确禁止的做法：

| # | 反模式 | 失败原因 | 正确做法 |
|---|-------------|-------------|-----------------|
| 1 | **AI 典型高频用语** | “delve into”“crucial”“it is important to note”会立即暴露 AI 写作痕迹 | 使用学科特定词汇；参见 `references/writing_quality_check.md` |
| 2 | **滥用破折号** | 每页使用两个以上的破折号会显露 AI 写作痕迹 | 使用括号、逗号，或重构句子 |
| 3 | **空洞的开场白** | “In this section, we will discuss...”没有增加任何信息 | 直接从论点或研究发现开始 |
| 4 | **段落长度千篇一律** | 每个段落都是 4–5 句话，会形成单调的 AI 节奏 | 自然调整段落长度（2–8 句话） |
| 5 | **⚠️ 铁律：捏造引用** | 编造看似可信、实际并不存在的参考文献 | 每条引用都必须通过 DOI 或 WebSearch 验证；参见 `academic-pipeline/agents/integrity_verification_agent.md` |
| 6 | **讨好式修订** | 不加批判地接受审稿人的所有反馈 | 当审稿人的意见有误时，使用 REVIEWER_DISAGREE 状态；以证据说明理由 |
| 7 | **修订期间范围蔓延** | 为了“改进”论文而添加未被要求的章节或分析 | 修订只处理审稿人提出的问题；新增内容需要用户明确批准 |
| 8 | **忽略失败路径** | 即使出现编辑直接拒稿信号或致命的方法学缺陷，仍继续推进 | 检查 `references/failure_paths.md`；触发时调用 F11 编辑直接拒稿恢复流程 |

---

## 质量标准

### 写作质量
1. **每项主张都必须有引用**，或得到论文自身数据的支持——对于 #548 中关于缺失性/新颖性的主张，则须提供有记录的检索来源，并在存在最接近的既有研究时指明该研究（否则，明确说明不存在相邻研究即可；没有任何来源能够引用某项缺失）
2. **引用零孤立**——文内引用与参考文献列表必须完全匹配
3. **语域一致**——采用适合相关学科的学术语气
4. **逻辑流畅**——段落与章节之间过渡清晰
5. **符合字数要求**——控制在目标字数的 +/-10% 以内

### 双语摘要质量
6. **独立撰写**——zh-TW 与 EN 摘要须分别独立撰写，**不得**进行机械翻译
7. **结构对齐**——两种语言的摘要须以相同顺序涵盖相同的要点
8. **关键词**——每种语言各 5-7 个，反映论文的核心概念
9. **字数**——EN：150-300 词；zh-TW：300-500 字符

### 引用质量
10. **格式合规**——100% 遵循所选引用格式
11. ⚠️ 铁律：**包含 DOI**——每个具有 DOI 的来源都必须包含 DOI；每条引用都必须通过 DOI 或 WebSearch 验证
12. **时效性**——标记发表于 10 年以前的来源（奠基性著作除外）
13. **自引比例**——若超过 15%，则予以标记

### 同行评审
14. **与标准绑定的五个维度**——原创性、方法严谨性、证据充分性、论证连贯性和写作质量；须基于证据给出分类判断，不得进行数值汇总
15. **可操作的反馈**——每项批评都必须包含具体建议
16. **最多 2 轮修订**——未解决的事项转为已确认的局限性

### 强制包含内容
⚠️ **铁律**：每篇论文都**必须**包含：数据可用性声明、伦理声明、作者贡献（CRediT）、利益冲突声明、资助致谢。
17. **AI 使用报告**——常规 `full` / `format-convert` 流程包含现有的通用 AI 工具使用声明；独立的 `disclosure` 模式则遵循所选投稿渠道的适用性/状态或政策锚点渲染约定
18. **局限性章节**——明确讨论研究局限性
19. **伦理声明**——适用时提供（涉及人类受试者、敏感数据）

---

## 输出语言

遵循用户所使用的语言。学术术语保留为 English。无论正文使用何种语言，始终提供双语摘要。

---

## 与其他 Skill 的集成

```
academic-paper + tw-hei-intelligence  -> Evidence-based HEI paper with real MOE data
academic-paper + deep-research        -> Deep research phase -> paper writing phase (auto-handoff)
academic-paper + report-to-website    -> Interactive web version of the paper
academic-paper + notebooklm-slides-generator -> Presentation slides from paper
academic-paper + academic-paper-reviewer -> Peer review -> revision loop
```

---

## 模型分级（#517，可选）

当设置了 `ARS_MODEL_TIERING` 时，分派会话将依据 `shared/model_tiering.md` 路由此技能的智能体（规范定义：完整的 39 智能体判断/执行表及规则）。简要规则：

- **未设置（默认）：**每个智能体都继承会话模型——与 #517 之前的行为在字节级别等效。
- **`economy`**（前沿层级会话）：执行型智能体使用比会话模型低一个层级的模型——下限为 Opus 级，绝不低于此层级；判断型智能体继续使用会话模型。处于或低于该下限时不执行任何操作（仅通知一次）。
- **`quality-boost`**（低于前沿层级的会话）：检查点环节（Stage 2.5/4.5 关卡；可选启用的 Stage 4→5 主张–引用审计；最终审查）的判断型智能体直接提升至前沿层级（无论相隔多少个层级——并非只提升一级）；任何模型都绝不会被降级。已处于前沿层级时不执行任何操作（仅通知一次）。
- 未知值 → 警告一次，并按未设置处理。层级表示相对位置，绝不硬编码绑定模型 id。当某个方向生效时，将同一阶段的重复调用路由至同一个工作智能体，以便累积其提示词缓存；未设置还意味着分派形态也保持字节级等效。

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