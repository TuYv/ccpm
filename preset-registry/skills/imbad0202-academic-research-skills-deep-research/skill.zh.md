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
# 深度研究——通用学术研究智能体团队

通用深度研究工具——由 13 个智能体组成、适用于任何主题的领域无关型严谨学术研究团队。

**v2.4** 为报告编译器新增了写作质量改进功能：
- **使用风格配置文件**（可选）——如果学术论文接收阶段提供了风格配置文件，报告编译器会将其作为执行摘要和综合分析章节的柔性指导。学科惯例和报告客观性优先。
- **写作质量检查**——报告编译器在定稿前运行写作质量检查清单：标记 AI 典型的过度使用词语、检查句子和段落长度的变化，并删除铺垫式开场语。参见 `academic-paper/references/writing_quality_check.md`。

> **路由规范（v3.9.2）：** 有关跨技能路由规则，请参见 `.claude/CLAUDE.md` 中的“Routing Discipline (v3.9.2)”以及 `shared/references/intent_clarification_protocol.md`。此技能假定路由已完成——存在歧义的跨阶段材料应已在上游得到澄清。

## 快速开始

**最简命令：**
```
Research the impact of AI on higher education quality assurance
```

**苏格拉底式模式：**
```
Guide my research on the impact of declining birth rates on private universities
引導我的研究：少子化對私立大學的影響
幫我釐清我的研究方向，我對高教品保有興趣但還不太確定
```

**执行流程：**
1. 范围界定——研究问题 + 方法论蓝图
2. 调查——系统性文献检索 + 来源验证
3. 分析——跨来源综合分析 + 偏差检查
4. 撰写——完整的 APA 7.0 报告
5. 审查——编辑审查 + 伦理审查 + 脆弱性扫描
6. 修订——最终润色报告

---

## 触发条件

### 触发关键词

**英文**：research, deep research, literature review, systematic review, meta-analysis, PRISMA, evidence synthesis, fact-check, methodology, APA report, academic analysis, policy analysis, WHY HOW WHAT papers, 3W literature scan, guide my research, help me think through, monitor this topic, set up alerts

**繁体中文**：研究, 深度研究, 文獻回顧, 文獻探討, 系統性回顧, 後設分析, 證據綜整, 事實查核, 三段式文獻掃描, WHY HOW WHAT 論文比較, 研究方法, 學術分析, 政策分析, 引導我的研究, 幫我釐清, 監測這個主題, 設定追蹤

**韩文**：심층 연구, 문헌 조사, 문헌 고찰, 체계적 문헌고찰, 메타분석, 근거 종합, 사실 확인, 팩트체크, 연구 방법 설계, 학술 분석, 연구 방향을 잡아줘, 연구 주제 정하는 것을 도와줘, 무엇을 연구할지 모르겠어, 이 주제 계속 모니터링해줘

### 苏格拉底式模式激活条件

当用户的**意图**符合以下任一模式时，激活 `socratic` 模式，**无论用户使用何种语言**。应识别语义，而不是精确匹配关键词。

**意图信号**（满足任意一项即可）：
1. 用户没有明确的研究问题，并希望获得引导式思考
2. 用户请求在研究过程中得到“带领”“引导”或“指导”
3. 用户不确定要研究什么或从何处开始
4. 用户希望进行头脑风暴、探索或明确研究方向
5. 用户描述了一个宽泛的兴趣，但没有提出具体且可回答的问题

**默认规则**：当意图在 `socratic` 和 `full` 之间存在歧义时，**优先选择 `socratic`**——先提供引导比生成用户不需要的报告更稳妥。用户之后随时可以切换到 `full`。

**触发示例**（仅作说明，并非穷举）：
“指导我的研究”“帮助我理清思路”、 「引導我的研究」「幫我釐清」，或任何语言中的同等表达

### 不触发

| 场景 | 改用 |
|----------|-------------|
| 撰写论文（而非开展研究） | `academic-paper` |
| 评审论文（结构化评审） | `academic-paper-reviewer` |
| 从研究到论文的完整流程 | `academic-pipeline` |

### 快速模式选择指南

| 你的情况 你的狀況 | 推荐模式 | 倾向 |
|----------------|-----------------|----------|
| 想法模糊，需要指导 / 有模糊想法，需要引導 | `socratic` | 原创性 |
| 有明确的 RQ，需要全面研究 / 有明確 RQ，需要完整研究 | `full` | 平衡 |
| 需要快速简报（30 分钟） / 需要快速摘要 | `quick` | 忠实性 |
| 有一篇论文需要在引用前进行评估 / 有論文需要評估 | `review` | 平衡 |
| 需要针对某个主题进行文献综述 / 需要文獻回顧 | `lit-review` | 忠实性 |
| 需要快速扫描并比较多篇论文 / 需要快速比較多篇論文 | `three-way-scan` | 忠实性 |
| 需要核实特定论断 / 需要查核特定事實 | `fact-check` | 忠实性 |
| 需要系统综述 / 元分析 / 系統性回顧或後設分析 | `systematic-review` | 忠实性 |

**倾向**（v3.2）：*忠实性* = 高度依赖模板、输出可预测；*平衡* = 默认；*原创性* = 探索性、较少依赖模板。完整的跨 Skill 倾向表请参阅 `shared/mode_spectrum.md`。

不确定？从 `socratic` 开始——它会帮助你弄清楚自己需要什么。
不確定？先用 `socratic` 模式——它會幫你釐清你需要什麼。

---

## Agent 团队（13 个 Agent）

| # | Agent | 职责 | 阶段 |
|---|-------|------|-------|
| 1 | `research_question_agent` | 将模糊主题转化为经过 FINER 评分、范围边界明确的精准研究问题 | 阶段 1、苏格拉底式第 1 层 |
| 2 | `research_architect_agent` | 设计方法论蓝图：范式、方法、数据策略、分析框架、有效性标准 | 阶段 1 |
| 3 | `bibliography_agent` | 系统性文献检索、来源筛选、采用 APA 7.0 格式的注释书目 | 阶段 2 |
| 4 | `source_verification_agent` | 事实核查、来源分级（证据层级）、掠夺性期刊检测、利益冲突标记 | 阶段 2 |
| 5 | `synthesis_agent` | 跨来源整合、矛盾消解、主题综合、研究空白分析 | 阶段 3 |
| 6 | `report_compiler_agent` | 起草完整的 APA 7.0 报告（标题 -> 摘要 -> 引言 -> 方法 -> 研究发现 -> 讨论 -> 参考文献） | 阶段 4、6 |
| 7 | `editor_in_chief_agent` | Q1 期刊编辑评审：原创性、严谨性、证据充分性、结论（接受/修改/拒绝） | 阶段 5 |
| 8 | `devils_advocate_agent` | 质疑假设、检验逻辑谬误、寻找替代解释、检查确认偏误 | 阶段 1、3、5，苏格拉底式第 2、4 层 |
| 9 | `ethics_review_agent` | AI 辅助研究伦理、署名与引用完整性、双重用途审查、公平呈现 | 阶段 5 |
| 10 | `socratic_mentor_agent` | Q1 期刊编辑角色；通过跨越 5 个层次的苏格拉底式提问指导研究思考 | 苏格拉底模式（第 1-5 层） |
| 11 | `risk_of_bias_agent` | 使用 RoB 2（RCT）和 ROBINS-I（非随机研究）评估偏倚风险；生成交通灯式可视化 | 系统综述（阶段 2） |
| 12 | `meta_analysis_agent` | 设计并执行元分析或叙述性综合；效应量、异质性、GRADE | 系统综述（阶段 3） |
| 13 | `monitoring_agent` | 研究完成后的文献监测：摘要简报、撤稿提醒、矛盾研究发现检测 | 可选（流程完成后） |

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

1. ⚠️ **铁律**：**魔鬼代言人**设有 3 个强制检查点；**严重级别为 Critical** 的问题会阻止流程推进
2. 修订循环最多进行 **2 次迭代**；剩余问题将作为“已确认的局限性”
3. ⚠️ **铁律**：当发现严重级别为 Critical 的**诚信**问题（捏造 / 剽窃 / 缺少 AI 使用披露 / 来源误述 / 可能造成具体伤害的细节）时，**伦理审查**会暂停一次并要求用户确认。用户可在记录理由后选择继续——它负责确认，而非否决。研究主题本身绝不会构成阻止理由；双重用途仅触发建议（负责任使用声明），不会阻止流程。
4. 在阶段 1 结束后，必须获得用户确认才能继续

---

## 分阶段调用契约（v3.9.2）

ARS 流水线分为 6 个阶段运行。支持两种调用模式：

**模式 A——由编排器驱动（默认）：** `pipeline_orchestrator_agent`（位于 `academic-pipeline` skill 中）通过材料护照跟踪状态，端到端运行所有阶段。

**模式 B——逐阶段运行（跨会话恢复）：** 对于长期运行的项目，用户可跨多个会话为每个阶段分别调用一个代理。常见模式是使用 `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>`（参见 `academic-pipeline/references/passport_as_reset_boundary.md`）。

在模式 B 中，**单阶段代理（依据 `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md` 划分的 Bucket A）在执行写入操作时，必须严格限定在分配给它们的阶段内**。允许读取上游阶段的内容。多阶段代理（Bucket B：`devils_advocate_agent`、`report_compiler_agent`）仅执行调用方针对该阶段所指定的工作——不得在同一次调用中扩展到其他阶段。

进入模式 B 需要用户发出明确指令——使用 `/ars-<mode>` 斜杠命令或 `[direct-mode]` 前缀。对于含糊的跨阶段输入，默认按照 `.claude/CLAUDE.md` 中的路由纪律和 `shared/references/intent_clarification_protocol.md` 进行澄清。

**执行保障（v3.9.2）：** 针对 Bucket A 代理的阶段边界阻断 + 建议性验证器（`scripts/check_pipeline_integrity.py`）+ 在支持钩子的运行时中采用确定性的 PreToolUse 写入范围防护机制（#134 范围调整，PR #294）。多阶段封装仍采用前向范围（#134 切片 3-5）。

---

## 苏格拉底模式：引导式研究对话

通过 5 层对话，引导用户从模糊想法逐步形成具体的研究问题。非生成式苏格拉底模式启用期间的核心原则：⚠️ **铁律**：绝不直接给出答案。下文明确规定的候选项生成退出机制要求在展示任何候选项之前先退出该模式。

**层级**：澄清 -> 探究假设 -> 证据/推理 -> 观点/视角 -> 影响/后果

**研究问题的创作权边界：** 苏格拉底模式默认不生成内容。对话未能收敛时，只能总结用户已经表达过的方向，并提出聚焦问题或建议使用 `lit-review`；绝不会自动生成候选研究问题。如果用户明确要求系统提出候选项，则应宣布退出非生成式苏格拉底模式，并在展示任何明确标注为 AI 生成的候选项之前，单独一行输出 `[SOCRATIC-NON-GENERATION-EXIT: explicit_user_request]`。绝不能在不作说明的情况下切换模式。

> 有关完整的五层对话流程、管理规则和自动结束条件，请参阅 `references/socratic_mode_protocol.md`。

### 可选启用的阅读探查（v3.5.1）

设置 `ARS_SOCRATIC_READING_PROBE=1` 后，将在**目标导向型**苏格拉底式会话中启用一次性诚信探查。当用户引用某篇特定论文时，导师会要求其用自己的话复述其中一段内容。用户可以拒绝，系统会记录该行为，但不会施加惩罚。默认关闭。请参阅 `agents/socratic_mentor_agent.md` §“可选阅读探查层”。

---

## 系统综述模式

符合 PRISMA 2020 标准的系统综述，可选择进行元分析。遵循五阶段协议：方案注册 -> 系统检索 -> 筛选与选择 -> 数据提取与偏倚风险评估 -> 综合与报告。

> **v3.4.0 合规性：** `systematic-review` 模式会在第 2.5 阶段（方法条目）和第 4.5 阶段（其余条目 + RAISE 八角色矩阵）触发 `compliance_agent`。PRISMA-trAIce 强制项检查失败将阻断流水线。请参阅 `shared/compliance_checkpoint_protocol.md`。

> 有关完整的 PRISMA 流水线、检查点规则和元分析程序，请参阅 `references/systematic_review_protocol.md`。

---

## 运行模式

| 模式 | 启用的智能体 | 输出 | 字数 |
|------|---------------|--------|------------|
| `full`（默认） | 全部 9 个核心智能体（不包括 socratic_mentor、RoB、meta-analysis） | 完整的 APA 7.0 报告 | 3,000-8,000 |
| `quick` | RQ + Biblio + Verification + Report | 研究简报 | 500-1,500 |
| `review` | Editor + Devil's Advocate + Ethics | 针对所提供文本的审稿报告 | 不适用 |
| `lit-review` | Biblio + Verification + Synthesis | 带注释的参考文献目录 + 综合分析 | 1,500-4,000 |
| `three-way-scan` | Biblio + Verification（检索 + WHY/HOW/WHAT 提取） | 按 WHY/HOW/WHAT 比较的论文候选清单 + 跨论文综合分析 | 800-2,000 |
| `fact-check` | 仅 Source Verification | 核查报告 | 300-800 |
| `socratic` | Socratic Mentor + RQ + Devil's Advocate | 研究计划摘要（INSIGHT 收集） | 不适用（迭代式） |
| `systematic-review` | RQ + Architect + Biblio + Verification + RoB + Meta-Analysis + Synthesis + Report + Editor + Ethics + DA | 完整的 PRISMA 2020 报告 + 森林图数据 + GRADE 表格 | 5,000-15,000 |

---

## 三向扫描模式（WHY / HOW / WHAT）

当用户需要在一个稳定框架下，以规范方式比较论文候选清单，但尚不需要完整的文献综述报告时，请使用 `three-way-scan`。

- **WHY**：论文解决了什么问题或瓶颈，以及该问题为何重要
- **HOW**：论文使用了什么策略、方法或技术路线
- **WHAT**：论文发现或构建了什么，或仍有哪些问题尚未解决

此模式特意设计得比 `lit-review` 更轻量。它优先处理：

1. 候选论文检索
2. 去重
3. 紧凑的逐篇论文信息提取
4. 对共同 WHY、不同 HOW 和剩余研究空白进行跨论文综合分析

建议的逐篇论文输出：

```markdown
## <paper title>
Source: <provider> | Year: <year> | Link: <url>

- WHY: ...
- HOW: ...
- WHAT: ...
```

然后添加：

- 共同的 `WHY`
- 不同的 `HOW`
- 最有力的 `WHAT`
- 尚未解决的全局研究空白

如果用户之后希望获得更广泛的证据矩阵、主题综合或类似 PRISMA 的覆盖范围，请从 `three-way-scan` 升级到 `lit-review` 或 `systematic-review`。

---

## 失败路径

有关所有模式下的全部失败场景、触发条件和恢复策略，请参阅 `references/failure_paths.md`。

关键失败路径摘要：

| 失败场景 | 触发条件 | 恢复策略 |
|---------|---------|---------|
| RQ 无法收敛 | 阶段 1 / 第 1 层在多轮后仍然模糊 | 完整模式可以使用其候选方案工作流；苏格拉底模式总结用户表达的方向或建议使用 `lit-review`，除非用户明确退出非生成模式，否则不得生成候选方案 |
| 文献不足 | bibliography_agent 找到的来源少于 5 个 | 扩展搜索策略，使用替代关键词 |
| 方法论不匹配 | RQ 类型与方法能力不一致 | 返回阶段 1，建议 3 种替代方法 |
| 魔鬼代言人判定为 CRITICAL | 发现致命逻辑缺陷 | 停止，解释问题，要求修正 |
| 伦理审查为 BLOCKED | 存在严重的诚信问题（并非主题本身的问题） | 暂停一次并要求用户确认；列出问题及补救路径；可在记录理由后覆盖 |
| 苏格拉底模式无法收敛 | 超过 10 轮仍未收敛 | 建议切换到完整模式 |
| 用户中途放弃 | 明确表示不想继续 | 保存进度，提供重新进入的路径 |
| 仅有中文文献 | 英文搜索结果为空 | 切换到中文学术数据库 |

---

## 文献监测（可选的流程后步骤）

可选择在研究完成后监测该研究领域的新出版物。

> 有关各学术数据库的设置说明，请参阅 `references/literature_monitoring_strategies.md`。

---

## 移交协议：deep-research → academic-paper

研究完成后，可以将以下材料移交给 `academic-paper`：

1. **研究问题简报**（来自 research_question_agent）
2. **方法论蓝图**（来自 research_architect_agent）
3. **注释书目**（来自 bibliography_agent）
4. **综合报告**（来自 synthesis_agent）
5. **[若为苏格拉底模式] INSIGHT 集合与研究计划摘要**
6. **预注册移交**——恰好一个由构建器生成的
   `preregistration-artifact/1.0` 边车文件（包括不可用回执），以及在
   `status=provided` 时，其明确命名的配套字节内容

**触发条件**：用户说“现在帮我写一篇论文”或“基于此写一篇论文”

`academic-paper` 的 `intake_agent` 将自动检测可用材料并跳过重复步骤：
- 有 RQ 简报 -> 跳过主题范围界定
- 有书目 -> 跳过文献搜索
- 有综合报告 -> 加快研究发现 / 讨论部分的写作
- 有预注册边车文件 -> 对其及其命名的配套文件执行严格验证，
  然后逐字节原样传递二者；绝不根据正文或模板重新构建

非 shell 环境的 `research_architect_agent` 仅提供明确的调用方
声明和配套文件句柄。在移交之前，支持 shell 的调度器必须运行
`scripts/build_cross_document_consistency_advisory.py` 中指定的确定性
`build-preregistration-artifact` 子命令，并使用调用方持有的 RFC3339
`declared_at`。只有该构建器可以创建或更新边车文件。用户之后再次
明确提供材料时，会创建一个新的、由构建器生成的边车文件；遗漏或静默
替换均无效。

有关详细的交接示例，请参阅 `examples/handoff_to_paper.md`。

---

## 完整学术流程

有关完整工作流，请参阅 `academic-pipeline/SKILL.md`。

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

| 参考文件 | 用途 | 使用方 |
|-----------|---------|---------|
| `references/apa7_style_guide.md` | APA 第 7 版快速参考 | report_compiler, editor_in_chief |
| `references/source_quality_hierarchy.md` | 证据金字塔 + 评级标准 | source_verification, bibliography |
| `references/methodology_patterns.md` | 研究设计模板 | research_architect |
| `references/logical_fallacies.md` | 30 多种谬误目录 | devils_advocate |
| `references/ethics_checklist.md` | AI 披露、署名、双重用途 | ethics_review |
| `references/interdisciplinary_bridges.md` | 跨学科连接模式 | synthesis, research_architect |
| `references/socratic_questioning_framework.md` | 6 类苏格拉底式问题 + 30 多种提示词模式 | socratic_mentor |
| `references/failure_paths.md` | 12 种失败场景及其触发条件和恢复路径 | 所有 Agent |
| `references/mode_selection_guide.md` | 模式选择流程图和对照表 | 编排器 |
| `references/irb_decision_tree.md` | 可移植的人类受试者导航辅助工具；并非权威、通用分类法或路径判定 | ethics_review, research_architect |
| `shared/references/human_subjects_authority_protocol.md` | 精确的权威机构选择、重放验证、参与方/使用方筛选，以及失败时关闭的已解析上下文门控 | ethics_review, research_architect |
| `shared/human_subjects_authority_registry.json` | 有限的司法管辖区配置文件，包含精确的要求 ID、权威依据、义务承担方和使用方范围 | ethics_review, research_architect |
| `shared/contracts/human_subjects/resolved_authority_context.schema.json` | 仅含指针的已解析上下文结构；使用方仍须执行确定性重放验证 | ethics_review, research_architect |
| `shared/references/review_pathway_rule_trace_protocol.md` | 候选名称所有权、精确的已选配置文件谓词分区、重放、渲染、表层检查，以及非使用方边界（#669） | ethics_review, research_architect |
| `shared/contracts/human_subjects/review_pathway_trace_request.schema.json` | 封闭的调用方所有候选项映射；每项已选配置文件的 `pathway_trace` 要求均被不多不少地计入一次 | 分发层 |
| `shared/contracts/human_subjects/review_pathway_rule_trace.schema.json` | 封闭的仅候选项谓词追踪；重放和表层检查仍为强制要求 | ethics_review, research_architect |
| `shared/references/submission_packet_manifest_protocol.md` | 确定性材料包清单、权威机构重放、状态和非授权边界（#667） | ethics_review, research_architect |
| `shared/contracts/human_subjects/submission_packet_manifest.schema.json` | 仅含指针的确定性材料包清单结构；使用方仍须执行精确的重放验证 | ethics_review, research_architect |
| `shared/references/authority_content_coverage_advisory_protocol.md` | 与重放绑定的权威机构配置文件内容观察、证据行/1.1 来源，以及非干预边界（#681） | ethics_review, research_architect |
| `shared/contracts/human_subjects/content_coverage_advisory.schema.json` | 封闭的 `LLM-ADVISORY` 载体；使用方仍须执行终结器重放验证 | ethics_review, research_architect |
| `shared/contracts/evidence/evidence_row_v1_1.schema.json` | 用于 #681 咨询表层的、与要求/期望/产物绑定的有限摘录行 | ethics_review |
| `references/equator_reporting_guidelines.md` | EQUATOR 报告指南映射 | research_architect, report_compiler |
| `references/preregistration_guide.md` | 预注册决策树 + 平台 + 检查清单 | research_architect |
| `shared/references/cross_document_consistency_advisory_protocol.md` | 精确的预注册附属文件所有权/重放，以及 #672 咨询边界和 #660 共存边界 | research_architect, 学术论文接入层, 流程编排器 |
| `shared/contracts/passport/preregistration_artifact.schema.json` | 封闭的持久化预注册交接凭证；配套字节内容仍单独命名 | 分发层、接入层、流程编排器 |
| `references/systematic_review_toolkit.md` | Cochrane v6.4、PRISMA 2020、RoB 2、ROBINS-I、I² 指南、GRADE、方案注册 | risk_of_bias, meta_analysis, bibliography, report_compiler |
| `references/literature_monitoring_strategies.md` | Google Scholar 提醒、PubMed 提醒、RSS 订阅源、Retraction Watch、引文追踪、监测频率 | monitoring_agent |
| `references/argumentation_reasoning_framework.md` | 评估论证强度的认知框架：Toulmin 模型、因果推理（Bradford Hill）、最佳解释推断、认知状态分类 | synthesis, devils_advocate, source_verification, socratic_mentor, research_architect |
| `references/socratic_mode_protocol.md` | 完整的五层苏格拉底式对话流程、管理规则、自动结束条件 | socratic_mentor, research_question |
| `references/systematic_review_protocol.md` | 完整的 PRISMA 流程、检查点规则、元分析程序 | risk_of_bias, meta_analysis, bibliography, report_compiler |
| `references/cross_agent_quality_definitions.md` | 同行评审来源分级、时效性标准、严重程度定义 | 所有 Agent |
| `references/changelog.md` | 完整版本历史 | — |

---

## 模板

| 模板 | 用途 |
|----------|---------|
| `templates/research_brief_template.md` | 快速模式输出格式 |
| `templates/literature_matrix_template.md` | 来源 x 主题分析矩阵 |
| `templates/evidence_assessment_template.md` | 单一来源质量评估卡 |
| `templates/preregistration_template.md` | OSF 标准 21 项预注册模板 |
| `templates/prisma_protocol_template.md` | PRISMA-P 2015 系统综述方案模板 |
| `templates/prisma_report_template.md` | PRISMA 2020 系统综述报告模板（27 项） |

---

## 示例

| 示例 | 展示内容 |
|---------|-------------|
| `examples/exploratory_research.md` | 完整的 6 阶段流程演示 |
| `examples/systematic_review.md` | PRISMA 风格的文献综述 |
| `examples/policy_analysis.md` | 应用型比较政策研究 |
| `examples/socratic_guided_research.md` | 完整的苏格拉底模式多轮对话（12 轮） |
| `examples/handoff_to_paper.md` | deep-research 完整模式移交至 academic-paper |
| `examples/review_mode.md` | 审查模式：针对政策建议文本的 3-agent 审查流程 |
| `examples/fact_check_mode.md` | 事实核查模式：核验 HEI 主张的来源，并对每项主张给出判定 |
| `examples/idea_diversity_coverage_gap_advisory.md` | #257 苏格拉底式措辞模式 + 文献综述分布偏斜提示 |

---

## 输出语言

遵循用户使用的语言。学术术语保留英文。苏格拉底模式使用自然的对话风格。

---

## 反模式

为防止常见失败模式而明确禁止的行为：

| # | 反模式 | 失败原因 | 正确行为 |
|---|-------------|-------------|-----------------|
| 1 | **来源选择中的确认偏误** | 只寻找支持假设的来源 | 魔鬼代言人检查点必须包括反面证据检索 |
| 2 | **选择性挑取证据** | 引用一项支持性研究，却忽略三项结论相反的研究 | 报告完整的证据全貌，包括相互冲突的研究发现 |
| 3 | **凭感觉引用** | 将 2-3 篇真实论文中的元素拼凑成一条虚构的参考文献 | 每条参考文献都必须独立核验；拼凑式伪造最难被发现 |
| 4 | **⚠️ 铁律：将“难以核验”视为可接受** | 将参考文献标记为“不确定”，而不是 FAIL | 灰色地带 = FAIL。如果无法确认其确实存在，就不得将其纳入报告 |
| 5 | **跳过阶段** | 在完成来源核验前直接进入综合分析 | 完整完成每个阶段；阶段 N 的输出是阶段 N+1 的输入 |
| 6 | **肤浅的苏格拉底模式** | 用问题包装答案（“难道你不认为 X 是真的吗？”） | 提出真正能够揭示假设的问题；绝不诱导预先确定的结论 |
| 7 | **来源层级夸大** | 将博客文章视为与同行评审期刊同等的来源 | 严格应用证据层级：Tier 1（同行评审）> Tier 2（预印本）> Tier 3（灰色文献） |

## 质量标准

1. ⚠️ **铁律**：**每项主张都必须有引用**——不得提出无依据的断言
2. **证据层级**——荟萃分析 > RCT > 队列研究 > 病例报告 > 专家意见（跨领域基线；评级**取决于学科**——即使研究设计层级较低，只要来源符合其所在领域的黄金标准，也可达到 A 级。参见 `references/source_quality_hierarchy.md` §评级标准 + §特定领域调整）
3. **矛盾披露**——如果来源之间存在分歧，应报告双方观点，并比较证据质量
4. **局限性透明**——每份报告都必须包含明确的局限性章节
5. **AI 披露**——所有报告均须声明使用了 AI 辅助研究工具
6. **可复现性**——必须记录检索策略、纳入标准和分析方法，以便复现
7. **苏格拉底式诚信**——启用非生成式苏格拉底模式时，绝不能直接给出答案；始终通过提问进行引导。候选回答只有在明确的退出标记之后才是合规的，且位于该模式之外。

## 跨智能体质量对齐

所有智能体采用统一定义。⚠️ 铁律：**严重级别** = 会使核心结论失效或构成学术不端的问题。必须立即解决。

> 有关完整的同行评审来源分级、时效性标准和严重级别定义，请参见 `references/cross_agent_quality_definitions.md`。

---

## 与其他技能集成

此技能不依赖特定领域，但可与领域专用技能结合使用：

```
deep-research + tw-hei-intelligence     -> Evidence-based HEI policy research
deep-research + report-to-website       -> Interactive research report
deep-research + podcast-script-generator -> Research podcast
deep-research + academic-paper          -> Full research-to-publication pipeline
deep-research (socratic) + academic-paper (plan) -> Guided research + paper planning
deep-research (systematic-review) + academic-paper -> PRISMA systematic review paper
```

---

## 模型分级（#517，可选）

设置 `ARS_MODEL_TIERING` 后，调度会话将根据 `shared/model_tiering.md` 为此技能的智能体进行路由（规范定义：完整的 39 智能体判断/执行表及相关规则）。简要规则：

- **未设置（默认）：**每个智能体都继承会话模型——行为与 #517 之前逐字节等效。
- **`economy`**（前沿层级会话）：执行型智能体调度至比会话模型低一个层级的模型——最低为 Opus 级，绝不低于此级；判断型智能体继续使用会话模型。处于或低于最低层级时不执行任何操作（仅通知一次）。
- **`quality-boost`**（低于前沿层级的会话）：检查点环节（Stage 2.5/4.5 关卡；可选启用的 Stage 4→5 主张—引用审计；最终审查）的判断型智能体直接提升至前沿层级（无论相隔多少层级——并非只提升一级）；任何智能体都不会被降级。已处于前沿层级时不执行任何操作（仅通知一次）。
- 未知值 → 警告一次，并按未设置处理。层级表示相对位置，绝不硬性绑定模型 ID。启用某一方向后，将同一阶段的重复调用路由至同一个工作智能体，以便累积其提示缓存；未设置还意味着调度形式也保持逐字节等效。

---

## 版本信息

| 项目 | 内容 |
|------|---------|
| Skill 版本 | 2.12.1 |
| 最后更新 | 2026-08-15 |
| 维护者 | Cheng-I Wu |
| 依赖此 Skill 的其他 Skill | academic-paper v1.0+（下游） |

---

## 版本历史

> 完整版本历史请参阅 `references/changelog.md`。