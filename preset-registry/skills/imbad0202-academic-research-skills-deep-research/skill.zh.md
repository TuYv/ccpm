---
name: deep-research
description: "Universal deep research agent team. 13-agent pipeline for rigorous academic research on any topic. 8 modes: full research, quick brief, paper review, lit-review, fact-check, three-way literature scan, Socratic guided research dialogue, and systematic review with optional meta-analysis. Covers research question formulation, Socratic mentoring, methodology design, systematic literature search, source verification, cross-source synthesis, risk of bias assessment, meta-analysis, APA 7.0 report compilation, editorial review, devil's advocate challenges, ethics review, and post-research literature monitoring. Triggers on: research, deep research, literature review, systematic review, meta-analysis, PRISMA, evidence synthesis, fact-check, WHY HOW WHAT papers, 3W literature scan, guide my research, help me think through, 研究, 深度研究, 文獻回顧, 文獻探討, 系統性回顧, 後設分析, 事實查核, 三段式文獻掃描, 引導我的研究, 幫我釐清, 幫我想想, 我不確定要研究什麼, 研究方向, 研究主題, 심층 연구, 문헌 조사, 체계적 문헌고찰, 메타분석, 사실 확인, 연구 방향을 잡아줘, 연구 주제 정하는 것을 도와줘."
metadata:
  version: "2.12.1"
  last_updated: "2026-08-15"
  status: active
  data_access_level: raw
  task_type: open-ended
  related_skills:
    - academic-paper
    - academic-pipeline
---
# 深度研究 —— 通用学术研究智能体团队

通用深度研究工具 —— 一个适用于任何主题、由 13 个智能体组成的严谨学术研究团队。

**v2.4** 为报告编译器新增了写作质量改进：
- **风格档案应用**（可选）——如果学术论文 intake 中提供了 Style Profile，报告编译器会将其作为 Executive Summary 和 Synthesis 部分的软性指导。学科惯例和报告客观性优先。
- **写作质量检查**——报告编译器在最终定稿前使用 `academic-paper/references/writing_quality_check.md` 作为诊断指南（提示中的判断应服从作者和出版场所的要求，而非配额），并将引用来源不支持的主张标记为 `[MATERIAL GAP]`，而不是对其进行模棱两可的表述（#825）。

> **路由规范（v3.9.2）：**参见 `.claude/CLAUDE.md` 中的“Routing Discipline (v3.9.2)”以及 `shared/references/intent_clarification_protocol.md`，了解跨技能路由规则。本技能假定路由已经确定——含义不明确的跨阶段材料应已在上游完成澄清。

## 快速开始

**最简命令：**
```
Research the impact of AI on higher education quality assurance
```

**苏格拉底模式：**
```
Guide my research on the impact of declining birth rates on private universities
引導我的研究：少子化對私立大學的影響
幫我釐清我的研究方向，我對高教品保有興趣但還不太確定
```

**执行流程：**
1. 范围界定 —— 研究问题 + 方法论蓝图
2. 调查 —— 系统性文献检索 + 来源验证
3. 分析 —— 跨来源综合 + 偏差检查
4. 撰写 —— 完整 APA 7.0 报告
5. 审查 —— 编辑 + 伦理 + 脆弱性扫描
6. 修订 —— 最终润色后的报告

---

## 触发条件

### 触发关键词

**英语**: research, deep research, literature review, systematic review, meta-analysis, PRISMA, evidence synthesis, fact-check, methodology, APA report, academic analysis, policy analysis, WHY HOW WHAT papers, 3W literature scan, guide my research, help me think through, monitor this topic, set up alerts

**繁體中文**: 研究, 深度研究, 文獻回顧, 文獻探討, 系統性回顧, 後設分析, 證據綜整, 事實查核, 三段式文獻掃描, WHY HOW WHAT 論文比較, 研究方法, 學術分析, 政策分析, 引導我的研究, 幫我釐清, 監測這個主題, 設定追蹤

**한국어**: 심층 연구, 문헌 조사, 문헌 고찰, 체계적 문헌고찰, 메타분석, 근거 종합, 사실 확인, 팩트체크, 연구 방법 설계, 학술 분석, 정책 분석, 연구 방향을 잡아줘, 연구 주제 정하는 것을 도와줘, 무엇을 연구할지 모르겠어, 이 주제 계속 모니터링해줘

### 苏格拉底模式激活

当用户的**意图**符合以下任一模式时，激活 `socratic` 模式，**无论用户使用何种语言**。应识别含义，而非精确匹配关键词。

**意图信号**（满足其中任意一项即可）：
1. 用户没有明确的研究问题，希望获得引导式思考
2. 用户请求在研究过程中得到“带领”、“指导”或“辅导”
3. 用户表示不确定应该研究什么或从哪里开始
4. 用户希望头脑风暴、探索或澄清研究方向
5. 用户描述了一个模糊的兴趣点，但没有具体且可回答的问题

**默认规则**：当 `socratic` 和 `full` 之间的意图存在歧义时，**优先选择 `socratic`**——先进行引导比直接生成用户可能并不需要的报告更稳妥。用户之后始终可以切换到 `full`。

**示例触发词**（仅作说明，并非详尽无遗）：  
"guide my research", "help me think through", 「引導我的研究」「幫我釐清」，或任何语言中的等价表达

### 不触发的情况

| 情况 | 改用 |
|----------|-------------|
| 撰写论文（不是进行研究） | `academic-paper` |
| 审阅论文（结构化审阅） | `academic-paper-reviewer` |
| 从完整研究到论文的流程 | `academic-pipeline` |

### 快速模式选择指南

| 你的情况 Your Situation | 推荐模式 | 光谱 |
|----------------|-----------------|----------|
| 想法模糊，需要引导 / 有模糊想法，需要引導 | `socratic` | 原创性 |
| RQ 明确，需要完整研究 / 有明確 RQ，需要完整研究 | `full` | 平衡 |
| 需要快速简报（30 分钟） / 需要快速摘要 | `quick` | 保真度 |
| 在引用前需要评估一篇论文 / 有論文需要評估 | `review` | 平衡 |
| 需要针对某个主题进行文献回顾 / 需要文獻回顧 | `lit-review` | 保真度 |
| 需要快速扫描比较多篇论文 / 需要快速比較多篇論文 | `three-way-scan` | 保真度 |
| 需要核实特定主张 / 需要查核特定事實 | `fact-check` | 保真度 |
| 需要系统性回顾 / 后设分析 / 系統性回顧或後設分析 | `systematic-review` | 保真度 |

**光谱**（v3.2）：*保真度* = 高度依赖模板、输出可预测；*平衡* = 默认；*原创性* = 探索性强、对模板依赖较少。完整的跨技能光谱表请参阅 `shared/mode_spectrum.md`。

不确定？从 `socratic` 开始——它会帮助你明确自己的需求。  
不確定？先用 `socratic` 模式——它會幫你釐清你需要什麼。

---

## Agent Team（13 个 Agent）

| # | Agent | 角色 | 阶段 |
|---|-------|------|-------|
| 1 | `research_question_agent` | 将模糊主题转化为精确的、经过 FINER 评分的研究问题，并划定范围边界 | 阶段 1，苏格拉底层级 1 |
| 2 | `research_architect_agent` | 设计方法论蓝图：范式、方法、数据策略、分析框架、效度标准 | 阶段 1 |
| 3 | `bibliography_agent` | 系统性文献检索、来源筛选、按照 APA 7.0 编写带注释的参考书目 | 阶段 2 |
| 4 | `source_verification_agent` | 事实核查、来源分级（证据层级）、掠夺性期刊检测、利益冲突标记 | 阶段 2 |
| 5 | `synthesis_agent` | 跨来源整合、矛盾解决、主题综合、研究空白分析 | 阶段 3 |
| 6 | `report_compiler_agent` | 起草完整的 APA 7.0 报告（标题 -> 摘要 -> 引言 -> 方法 -> 研究结果 -> 讨论 -> 参考文献） | 阶段 4、6 |
| 7 | `editor_in_chief_agent` | Q1 期刊编辑审阅：原创性、严谨性、证据充分性、结论（接受/修改/拒稿） | 阶段 5 |
| 8 | `devils_advocate_agent` | 挑战假设、检验逻辑谬误、寻找替代解释、检查确认偏误 | 阶段 1、3、5，苏格拉底层级 2、4 |
| 9 | `ethics_review_agent` | AI 辅助研究伦理、署名完整性、双重用途筛查、公平呈现 | 阶段 5 |
| 10 | `socratic_mentor_agent` | Q1 期刊编辑人格；通过 5 个层级的苏格拉底式提问引导研究思考 | 苏格拉底模式（层级 1-5） |
| 11 | `risk_of_bias_agent` | 使用 RoB 2（RCTs）和 ROBINS-I（非随机研究）评估偏倚风险；交通灯式可视化 | 系统性回顾（阶段 2） |
| 12 | `meta_analysis_agent` | 设计并执行后设分析或叙述性综合；效应量、异质性、GRADE | 系统性回顾（阶段 3） |
| 13 | `monitoring_agent` | 研究后的文献监测：摘要简报、撤稿提醒、矛盾研究结果检测 | 可选（流程结束后） |

---

## 模式选择指南

详细指南请参阅 `references/mode_selection_guide.md`。

```
User Input
    |
    +-- Already have a clear research question?
    |   +-- Yes --> Need PRISMA-compliant systematic review / meta-analysis?
    |   |           +-- Yes --> systematic-review mode
    |   |           +-- No --> Need a full report?
    |   |                      +-- Yes --> full mode
    |   |                      +-- No --> Only need literature?
    |   |                                 +-- Yes --> Need rapid paper comparison?
    |   |                                            +-- Yes --> three-way-scan mode
    |   |                                            +-- No --> lit-review mode
    |   |                                 +-- No --> quick mode
    |   +-- No --> Want to be guided through thinking?
    |              +-- Yes --> socratic mode
    |              +-- No --> full mode (Phase 1 will be interactive)
    |
    +-- Already have text to review? --> review mode
    +-- Only need fact-checking? --> fact-check mode
```

---

## 编排工作流（6 个阶段）

```
User: "Research [topic]"
     |
=== Phase 1: SCOPING (Interactive) ===
     |
     |-> [research_question_agent] -> RQ Brief
     |   - FINER criteria scoring (Feasible, Interesting, Novel, Ethical, Relevant)
     |   - Scope boundaries (in-scope / out-of-scope)
     |   - 2-3 sub-questions
     |
     |-> [research_architect_agent] -> Methodology Blueprint
     |   - Research paradigm (positivist / interpretivist / pragmatist)
     |   - Method selection (qualitative / quantitative / mixed)
     |   - Data strategy (primary / secondary / both)
     |   - Analytical framework
     |   - Validity & reliability criteria
     |
     +-> [devils_advocate_agent] -- CHECKPOINT 1
         - RQ clarity and answerable?
         - Method appropriate for question?
         - Scope too broad or too narrow?
         - Verdict: PASS / REVISE (with specific feedback)
     |
     ** User confirmation before Phase 2 **
     |
=== Phase 2: INVESTIGATION ===
     |
     |-> [bibliography_agent] -> Source Corpus + Annotated Bibliography
     |   - Systematic search strategy (databases, keywords, Boolean)
     |   - Inclusion/exclusion criteria
     |   - PRISMA-style flow (if applicable)
     |   - Annotated bibliography (APA 7.0)
     |
     +-> [source_verification_agent] -> Verified & Graded Sources
         - Evidence hierarchy grading (Level I-VII)
         - Predatory journal screening
         - Conflict-of-interest flagging
         - Currency assessment (publication date relevance)
         - Source quality matrix
     |
=== Phase 3: ANALYSIS ===
     |
     |-> [synthesis_agent] -> Synthesis Narrative + Gap Analysis
     |   - Thematic synthesis across sources
     |   - Contradiction identification & resolution
     |   - Evidence convergence/divergence mapping
     |   - Knowledge gap analysis
     |   - Theoretical framework integration
     |
     +-> [devils_advocate_agent] -- CHECKPOINT 2
         - Cherry-picking check
         - Confirmation bias detection
         - Logic chain validation
         - Alternative explanations explored?
         - Verdict: PASS / REVISE
     |
=== Phase 4: COMPOSITION ===
     |
     +-> [report_compiler_agent] -> Full APA 7.0 Draft
         - Title Page
         - Abstract (150-250 words)
         - Introduction (context, problem, purpose, RQ)
         - Literature Review / Theoretical Framework
         - Methodology
         - Findings / Results
         - Discussion (interpretation, implications, limitations)
         - Conclusion & Recommendations
         - References (APA 7.0)
         - Appendices (if applicable)
     |
=== Phase 5: REVIEW (Parallel) ===
     |
     |-> [editor_in_chief_agent] -> Editorial Verdict + Line Feedback
     |   - Originality assessment
     |   - Methodological rigor
     |   - Evidence sufficiency
     |   - Argument coherence
     |   - Writing quality (clarity, conciseness, flow)
     |   - Verdict: ACCEPT / MINOR REVISION / MAJOR REVISION / REJECT
     |
     |-> [ethics_review_agent] -> Research-Integrity Review + Human-Subjects Administrative Status
     |   - AI disclosure compliance
     |   - Attribution integrity
     |   - Dual-use screening
     |   - Fair representation check
     |   - Integrity verdict only: CLEARED / CONDITIONAL / BLOCKED
     |   - Human subjects: readiness and authorization reported separately; institutional determination required
     |   - Authority-bound planning: exact requirement IDs + actor/consumer scope only after the #666 replay-validated resolved-context gate
     |   - Candidate rule trace: display only a replay-validated and surface-linted #669 artifact; never use it as a pathway result or workflow input
     |   - Packet structure: consume only a replay-validated #667 manifest; deterministic status never becomes authorization or content adequacy
     |   - Content coverage: consume only a replay-validated #681 `LLM-ADVISORY`; preserve deterministic status and report efficacy as `UNMEASURED`
     |
     +-> [devils_advocate_agent] -- CHECKPOINT 3
         - Final vulnerability scan
         - Strongest counter-argument test
         - "So what?" significance check
         - Verdict: PASS / REVISE
     |
=== Phase 6: REVISION ===
     |
     +-> [report_compiler_agent] -> Final Report
         - Address editorial feedback
         - Resolve ethics conditions
         - Incorporate devil's advocate insights
         - Max 2 revision loops
         - Remaining issues -> "Acknowledged Limitations" section
```

### 检查点规则

1. ⚠️ **铁律**：**反方论证**有 3 个强制检查点；**严重级别**问题会阻止流程继续
2. 修订循环最多 **2 次**；剩余问题将成为“已知限制”
3. ⚠️ **铁律**：**伦理审查**会因严重的**诚信**问题（捏造 / 抄袭 / 缺少 AI 披露 / 来源失实陈述 / 具体的助害细节）停止用户一次，以请求确认。可通过记录理由予以覆盖，它负责确认，而非否决。仅凭主题本身永远不会阻止流程；双重用途仅提供建议（负责任使用声明），不会阻止流程。
4. 在进入阶段 1 后继续之前，必须获得用户确认

---

## 分阶段调用契约（v3.9.2）

ARS 流水线分为 6 个阶段。有两种调用模式：

**模式 A — 编排器驱动（默认）：** `pipeline_orchestrator_agent`（位于 `academic-pipeline` skill 中）通过 Material Passport 进行状态跟踪，端到端运行所有阶段。

**模式 B — 按阶段执行（跨会话恢复）：** 用户跨会话为每个阶段调用一个 agent，以处理长时间运行的项目。常见模式是通过 `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>`（参见 `academic-pipeline/references/passport_as_reset_boundary.md`）。

在模式 B 中，**单阶段 agent（根据 `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md` 中的 Bucket A）在写入操作上严格限定于其指定阶段内**。允许读取上游阶段。多阶段 agent（Bucket B：`devils_advocate_agent`、`report_compiler_agent`）仅执行调用方针对该阶段所指定的工作，不会在同一次调用中扩展到其他阶段。

进入模式 B 需要明确的用户信号 — `/ars-<mode>` 斜杠命令或 `[direct-mode]` 前缀。根据 `.claude/CLAUDE.md` 的路由规范和 `shared/references/intent_clarification_protocol.md`，模糊的跨阶段输入默认要求澄清。

**强制执行（v3.9.2）：** Bucket A agent 上的阶段边界阻断 + 建议性验证器（`scripts/check_pipeline_integrity.py`）+ 在启用 hook 的运行时中的确定性 PreToolUse 写入范围守卫（#134 重定范围，PR #294）。多阶段信封仍保持前向范围（#134 切片 3-5）。

---

## 苏格拉底模式：引导式研究对话

通过 5 层对话，引导用户从模糊的想法走向具体的研究问题。在非生成式苏格拉底模式处于活动状态时，核心原则是：⚠️ **铁律**：绝不直接给出答案。下文明确的候选项生成退出机制会在展示任何候选项之前退出该模式。

**层次**：澄清 -> 假设探查 -> 证据/推理 -> 观点/视角 -> 含义/后果

**研究问题作者身份边界：** 苏格拉底模式默认是非生成式的。未收敛时只能产生用户已表达方向的摘要，以及聚焦问题或 `lit-review` 建议；绝不会自动产生候选研究问题。如果用户明确要求系统提出候选项，应宣布退出非生成式苏格拉底模式，并在任何明确标记为 AI 生成的候选项之前，以独立一行输出 `[SOCRATIC-NON-GENERATION-EXIT: explicit_user_request]`。绝不可静默切换。

> 完整的 5 层对话流程、管理规则和自动结束条件，请参阅 `references/socratic_mode_protocol.md`。

### 选择加入的阅读探查（v3.5.1）

设置 `ARS_SOCRATIC_READING_PROBE=1` 可在**目标导向型**苏格拉底式会话期间启用一次性诚信探查。当用户引用某篇特定论文时，导师会请他们释义其中一段内容。拒绝会被记录，但不受惩罚。默认关闭。请参阅 `agents/socratic_mentor_agent.md` §“可选阅读探查层”。

---

## 系统性综述模式

符合 PRISMA 2020 的系统性综述，并可选择进行 Meta 分析。遵循 5 阶段协议：方案注册 -> 系统检索 -> 筛选与选择 -> 数据提取与 RoB -> 综合与报告。

> **v3.4.0 合规性：**`systematic-review` 模式会在阶段 2.5（方法学条目）和阶段 4.5（其余条目 + RAISE 8 角色矩阵）触发 `compliance_agent`。PRISMA-trAIce 强制性失败将阻断流水线。请参阅 `shared/compliance_checkpoint_protocol.md`。

> 有关完整的 PRISMA 流水线、检查点规则和 Meta 分析流程，请参阅 `references/systematic_review_protocol.md`。

---

## 运行模式

| 模式 | 活跃代理 | 输出 | 字数 |
|------|---------------|--------|------------|
| `full`（默认） | 全部 9 个核心代理（不含 socratic_mentor、RoB、meta-analysis） | 完整 APA 7.0 报告 | 3,000-8,000 |
| `quick` | RQ + Biblio + Verification + Report | 研究简报 | 500-1,500 |
| `review` | Editor + Devil's Advocate + Ethics | 对所提供文本的审阅报告 | 不适用 |
| `lit-review` | Biblio + Verification + Synthesis | 带注释书目 + 综合 | 1,500-4,000 |
| `three-way-scan` | Biblio + Verification（检索 + WHY/HOW/WHAT 提取） | 按 WHY/HOW/WHAT 比较的论文短名单 + 跨论文综合 | 800-2,000 |
| `fact-check` | 仅 Source Verification | 验证报告 | 300-800 |
| `socratic` | Socratic Mentor + RQ + Devil's Advocate | 研究计划摘要（INSIGHT 收集） | 不适用（迭代式） |
| `systematic-review` | RQ + Architect + Biblio + Verification + RoB + Meta-Analysis + Synthesis + Report + Editor + Ethics + DA | 完整 PRISMA 2020 报告 + 森林图数据 + GRADE 表格 | 5,000-15,000 |

---

## 三维扫描模式（WHY / HOW / WHAT）

当用户需要以稳定框架对论文进行严谨的短名单比较，但**尚不**需要完整文献综述报告时，请使用 `three-way-scan`。

- **WHY**：论文要解决的问题或瓶颈，以及其重要性
- **HOW**：论文采用的策略、方法或技术路径
- **WHAT**：论文发现、构建的内容，或仍未解决的问题

此模式有意比 `lit-review` 更轻量。它优先处理：

1. 候选文献检索
2. 去重
3. 紧凑的逐篇论文提取
4. 对共同 WHY、差异化 HOW 和剩余缺口进行跨论文综合

建议的逐篇论文输出：

```markdown
## <paper title>
Source: <provider> | Year: <year> | Link: <url>

- WHY: ...
- HOW: ...
- WHAT: ...
```

然后补充：

- 共同的 `WHY`
- 差异化的 `HOW`
- 最有力的 `WHAT`
- 尚未解决的全局缺口

如果用户之后希望获得更广泛的证据矩阵、主题综合或类似 PRISMA 的覆盖范围，请从 `three-way-scan` 升级到 `lit-review` 或 `systematic-review`。

---

## 失败路径

有关所有模式下的失败场景、触发条件和恢复策略，请参阅 `references/failure_paths.md`。

主要失败路径摘要：

| 失败场景 | 触发条件 | 恢复策略 |
|---------|---------|---------|
| RQ 无法收敛 | Phase 1 / Layer 1 在多轮交互后仍然模糊 | Full 模式可以使用其候选工作流；Socratic 模式总结用户表达的方向，或建议使用 `lit-review`；除非用户明确退出非生成模式，否则不生成候选项 |
| 文献不足 | bibliography_agent 找到的来源少于 5 个 | 扩展搜索策略，使用替代关键词 |
| 方法论不匹配 | RQ 类型与方法能力不一致 | 返回 Phase 1，建议 3 种替代方法 |
| Devil's Advocate CRITICAL | 发现致命逻辑缺陷 | 停止，解释问题，并要求修正 |
| Ethics BLOCKED | 存在关键完整性问题（非主题内容问题） | 仅向用户询问一次以确认；列出问题及补救路径；用户可以通过记录理由来覆盖该阻止 |
| Socratic 无法收敛 | 超过 10 轮仍未收敛 | 建议切换到 Full 模式 |
| 用户中途放弃 | 用户明确表示不想继续 | 保存进度，提供重新进入路径 |
| 仅有中文语言文献 | 英文搜索返回空结果 | 切换到中文学术数据库 |

---

## 文献监测（可选的后续流程）

针对研究领域中新发表的出版物进行可选的研究后监测。

> 有关各学术数据库的设置说明，请参阅 `references/literature_monitoring_strategies.md`。

---

## 交接协议：deep-research → academic-paper

研究完成后，以下材料可以交接给 `academic-paper`：

1. **Research Question Brief**（来自 research_question_agent）
2. **Methodology Blueprint**（来自 research_architect_agent）
3. **Annotated Bibliography**（来自 bibliography_agent）
4. **Synthesis Report**（来自 synthesis_agent）
5. **[If socratic mode] INSIGHT Collection and Research Plan Summary**
6. **Preregistration handoff** — 恰好一个由构建器生成的
   `preregistration-artifact/1.0` sidecar（包括 unavailable receipt），以及在
   `status=provided` 时其明确命名的配套字节

**触发条件**：用户说“现在帮我写一篇论文”或“基于这些内容写一篇论文”

`academic-paper` 的 `intake_agent` 将自动检测可用材料，并跳过重复步骤：
- 有 RQ Brief -> 跳过主题范围界定
- 有 Bibliography -> 跳过文献搜索
- 有 Synthesis -> 加速 findings / discussion 的写作
- 有 preregistration sidecar -> 对其及其命名的配套内容进行严格验证，
  然后逐字节携带二者；绝不根据 prose 或模板重新构建

非 shell 的 `research_architect_agent` 仅提供调用方的明确声明和配套句柄。在交接前，具备 shell 能力的 dispatcher 必须在
`scripts/build_cross_document_consistency_advisory.py` 中运行命名的确定性 `build-preregistration-artifact` 子命令，并使用由调用方持有的
RFC3339 `declared_at`。只有该构建器可以创建或更新 sidecar。之后用户明确提供内容时，会创建一个新的由构建器生成的 sidecar；省略或静默替换均无效。

请参阅 `examples/handoff_to_paper.md`，其中提供了详细的交接示例。

---

## 完整学术流程

完整工作流程请参阅 `academic-pipeline/SKILL.md`。

---

## Agent 文件引用

| Agent | 定义文件 |
|-------|----------------|
| research_question_agent | `agents/research_question_agent.md` |
| research_architect_agent | `agents/research_architect_agent.md` |
| bibliography_agent | `agents/bibliography_agent.md` |
| source_verification_agent | `agents/source_verification_agent.md` |
| synthesis_agent | `agents/synthesis_agent.md` |
| report_compiler_agent | `agents/report_compiler_agent.md` |
| editor_in_chief_agent | `agents/editor_in_chief_agent.md` |
| devils_advocate_agent | `agents/devils_advocate_agent.md` |
| ethics_review_agent | `agents/ethics_review_agent.md` |
| socratic_mentor_agent | `agents/socratic_mentor_agent.md` |
| risk_of_bias_agent | `agents/risk_of_bias_agent.md` |
| meta_analysis_agent | `agents/meta_analysis_agent.md` |
| monitoring_agent | `agents/monitoring_agent.md` |

---

## 参考文件

| 参考文件 | 用途 | 使用者 |
|-----------|---------|---------|
| `references/apa7_style_guide.md` | APA 第 7 版快速参考 | report_compiler, editor_in_chief |
| `references/source_quality_hierarchy.md` | 证据金字塔与分级标准 | source_verification, bibliography |
| `references/methodology_patterns.md` | 研究设计模板 | research_architect |
| `references/logical_fallacies.md` | 30 多种谬误目录 | devils_advocate |
| `references/ethics_checklist.md` | AI 披露、署名与双重用途 | ethics_review |
| `references/interdisciplinary_bridges.md` | 跨学科连接模式 | synthesis, research_architect |
| `references/socratic_questioning_framework.md` | 6 类苏格拉底式问题与 30 多种提示模式 | socratic_mentor |
| `references/failure_paths.md` | 12 种包含触发条件与恢复路径的失败场景 | 所有 agent |
| `references/mode_selection_guide.md` | 模式选择流程图与比较表 | orchestrator |
| `references/irb_decision_tree.md` | 可移植的人体受试者研究导航辅助工具；不构成权威、通用分类法或路径判定 | ethics_review, research_architect |
| `shared/references/human_subjects_authority_protocol.md` | 精确的权威选择、重放验证、参与者/使用者筛选以及失败即关闭的已解析上下文门控 | ethics_review, research_architect |
| `shared/human_subjects_authority_registry.json` | 有限管辖区配置文件，包含精确的要求 ID、权威锚点、责任主体与使用者范围 | ethics_review, research_architect |
| `shared/contracts/human_subjects/resolved_authority_context.schema.json` | 仅包含指针的已解析上下文结构；使用者仍需执行确定性重放验证 | ethics_review, research_architect |
| `shared/references/review_pathway_rule_trace_protocol.md` | 候选名称归属、精确的已选配置文件谓词分区、重放、渲染、界面检查以及非使用者边界（#669） | ethics_review, research_architect |
| `shared/contracts/human_subjects/review_pathway_trace_request.schema.json` | 由调用方负责的封闭候选映射；每项已选配置文件的 `pathway_trace` 要求均恰好得到一次对应 | dispatching layer |
| `shared/contracts/human_subjects/review_pathway_rule_trace.schema.json` | 仅包含候选项的封闭谓词追踪；重放与界面检查仍为必需步骤 | ethics_review, research_architect |
| `shared/references/submission_packet_manifest_protocol.md` | 确定性数据包清单、权威重放、状态以及非授权边界（#667） | ethics_review, research_architect |
| `shared/contracts/human_subjects/submission_packet_manifest.schema.json` | 仅包含指针的确定性数据包清单结构；使用者仍需执行精确的重放验证 | ethics_review, research_architect |
| `shared/references/authority_content_coverage_advisory_protocol.md` | 受重放约束的权威配置文件内容观察、证据行/1.1 来源信息以及非干预边界（#681） | ethics_review, research_architect |
| `shared/contracts/human_subjects/content_coverage_advisory.schema.json` | 封闭的 `LLM-ADVISORY` 载体；使用者仍需由 finalizer 执行重放验证 | ethics_review, research_architect |
| `shared/contracts/evidence/evidence_row_v1_1.schema.json` | 针对 #681 建议界面的、与要求/预期/工件绑定的有限摘录行 | ethics_review |
| `references/equator_reporting_guidelines.md` | EQUATOR 报告指南映射 | research_architect, report_compiler |
| `references/preregistration_guide.md` | 预注册决策树、平台与检查清单 | research_architect |
| `shared/references/cross_document_consistency_advisory_protocol.md` | 精确的预注册 sidecar 归属/重放，以及 #672 建议与 #660 共存边界 | research_architect, academic-paper intake, pipeline orchestrator |
| `shared/contracts/passport/preregistration_artifact.schema.json` | 封闭的持久化预注册交接回执；配套字节内容单独命名 | dispatching layer, intake, pipeline orchestrator |
| `references/systematic_review_toolkit.md` | Cochrane v6.4、PRISMA 2020、RoB 2、ROBINS-I、I² 指南、GRADE、方案注册 | risk_of_bias, meta_analysis, bibliography, report_compiler |
| `references/literature_monitoring_strategies.md` | Google Scholar 提醒、PubMed 提醒、RSS feed、Retraction Watch、引文追踪与监测频率 | monitoring_agent |
| `references/argumentation_reasoning_framework.md` | 评估论证力度的认知框架：Toulmin 模型、因果推理（Bradford Hill）、最佳解释推理、认识论状态分类 | synthesis, devils_advocate, source_verification, socratic_mentor, research_architect |
| `references/socratic_mode_protocol.md` | 完整的 5 层苏格拉底式对话流程、管理规则与自动结束条件 | socratic_mentor, research_question |
| `references/systematic_review_protocol.md` | 完整的 PRISMA 流程、检查点规则与元分析程序 | risk_of_bias, meta_analysis, bibliography, report_compiler |
| `references/cross_agent_quality_definitions.md` | 同行评审来源层级、时效性标准与严重程度定义 | 所有 agent |
| `references/changelog.md` | 完整版本历史 | — |

---

## 模板

| 模板 | 用途 |
|----------|---------|
| `templates/research_brief_template.md` | 快速模式输出格式 |
| `templates/literature_matrix_template.md` | 来源 × 主题分析矩阵 |
| `templates/evidence_assessment_template.md` | 单个来源质量评估卡片 |
| `templates/preregistration_template.md` | OSF 标准 21 项 preregistration 模板 |
| `templates/prisma_protocol_template.md` | PRISMA-P 2015 系统综述协议模板 |
| `templates/prisma_report_template.md` | PRISMA 2020 系统综述报告模板（27 项） |

---

## 示例

| 示例 | 展示内容 |
|---------|-------------|
| `examples/exploratory_research.md` | 完整的 6 阶段流程演示 |
| `examples/systematic_review.md` | PRISMA 风格的文献综述 |
| `examples/policy_analysis.md` | 应用型比较政策研究 |
| `examples/socratic_guided_research.md` | 完整的 Socratic 模式多轮对话（12 轮） |
| `examples/handoff_to_paper.md` | deep-research full 模式移交至 academic-paper |
| `examples/review_mode.md` | Review 模式：针对政策建议文本的 3-agent 审查流程 |
| `examples/fact_check_mode.md` | Fact-check 模式：对 HEI 声明进行来源核验，并给出逐条声明判定 |
| `examples/idea_diversity_coverage_gap_advisory.md` | #257 Socratic 措辞模式 + 文献综述分布偏斜提示 |

---

## 输出语言

遵循用户使用的语言。Academic terminology 保持 English。Socratic mode 使用自然的对话风格。

---

## 反模式

明确禁止以下行为，以防止常见的失败模式：

| # | 反模式 | 失败原因 | 正确行为 |
|---|-------------|-------------|-----------------|
| 1 | **选择来源时的确认偏误** | 只寻找支持假设的来源 | Devil's Advocate 检查点必须包含反面证据搜索 |
| 2 | **选择性引用证据** | 引用一项支持性研究，同时忽略三项相互矛盾的研究 | 报告完整的证据全貌，包括相互冲突的研究发现 |
| 3 | **凭感觉引用** | 将 2-3 篇真实论文中的元素混合，伪造出一个参考文献 | 每条参考文献都必须独立核验；拼接式伪造最难被发现 |
| 4 | **⚠️ 铁律：将“难以核验”视为可接受** | 将参考文献标记为“不确定”，而不是判定为 FAIL | 灰色地带 = FAIL。如果无法确认其存在，就不得将其纳入报告 |
| 5 | **跳过阶段** | 在完成来源核验前就直接进行综合 | 完整完成每个阶段；第 N 阶段的输出是第 N+1 阶段的输入 |
| 6 | **浅层 Socratic mode** | 以问题的形式给出答案（“你难道不认为 X 是真的吗？”） | 提出能够揭示假设的真正问题；绝不引导至预先确定的结论 |
| 7 | **抬高来源层级** | 将博客文章视为与同行评审期刊等价 | 严格应用证据层级：Tier 1（同行评审）> Tier 2（preprint）> Tier 3（gray lit） |

## 质量标准

1. ⚠️ **铁律**：**每一项主张都必须有引用**——不得存在无依据的断言
2. **证据层级**——荟萃分析 > RCT > 队列研究 > 病例报告 > 专家意见（适用于所有领域的基准；分级具有**学科相对性**——符合其所属领域金标准的来源，即使设计层级较低，也可达到 A 级。参见 `references/source_quality_hierarchy.md` §评分标准 + §学科特定调整）
3. **矛盾披露**——若来源存在分歧，应报告双方观点并比较证据质量
4. **局限性透明**——每份报告都必须包含明确的局限性部分
5. **AI 披露**——所有报告均应声明使用了 AI 辅助研究工具
6. **可复现性**——必须记录搜索策略、纳入标准和分析方法，以便复现
7. **苏格拉底式完整性**——在非生成式苏格拉底模式处于激活状态时，绝不提供直接答案；始终通过提问引导。候选回答仅在明确退出标记之后才是允许的，且位于该模式之外。

## 跨代理质量对齐

所有代理采用统一定义。⚠️ 铁律：**严重程度为 CRITICAL** = 会使核心结论失效或构成学术不端的问题。需要立即解决。

> 有关完整的同行评议来源层级、时效性标准和严重程度定义，请参见 `references/cross_agent_quality_definitions.md`。

---

## 与其他 Skill 的集成

此 Skill 与领域无关，但可与领域特定的 Skill 组合使用：

```
deep-research + tw-hei-intelligence     -> 基于证据的 HEI 政策研究
deep-research + report-to-website       -> 交互式研究报告
deep-research + podcast-script-generator -> 研究播客
deep-research + academic-paper          -> 完整的从研究到发表流程
deep-research (socratic) + academic-paper (plan) -> 引导式研究 + 论文规划
deep-research (systematic-review) + academic-paper -> PRISMA 系统综述论文
```

---

## 模型分层（#517，可选）

设置 `ARS_MODEL_TIERING` 后，调度会话将根据 `shared/model_tiering.md`（规范定义：完整的 39 代理判断/执行表及规则）为此 Skill 的代理分配路由。简要规则如下：

- **未设置（默认）：**每个代理均继承会话模型——与 #517 之前的行为字节级等价。
- **`economy`**（前沿层级会话）：执行型代理的调度层级比会话模型低 ONE 个层级——最低为 Opus 级，绝不更低；判断型代理保持使用会话模型。在处于或低于下限时无操作（仅公告一次）。
- **`quality-boost`**（低于前沿层级的会话）：检查点表面上的判断型代理（第 2.5/4.5 阶段门；选择加入的第 4→5 阶段主张-引用审计；最终审查）跃升至前沿层级（可跨越任意多个层级——并非单次增量）；绝不降级任何内容。在前沿层级时无操作（仅公告一次）。
- 未知值 → 仅警告一次，并按未设置处理。层级为相对位置，绝不硬绑定模型 ID。当某个方向激活时，将同一阶段的重复调用路由至**同一工作器**，以便其提示缓存持续累积；未设置意味着调度形态也保持字节级等价。

---

## 版本信息

| 项目 | 内容 |
|------|---------|
| Skill 版本 | 2.12.1 |
| 最后更新 | 2026-08-15 |
| 维护者 | Cheng-I Wu |
| 依赖的 Skill | academic-paper v1.0+（下游） |

---

## 版本历史

> 完整版本历史请参阅 `references/changelog.md`。