---
name: academic-pipeline
description: "Orchestrator for the full academic research pipeline: research -> write -> integrity check -> review -> revise -> re-review -> re-revise -> final integrity check -> finalize. Coordinates deep-research, academic-paper, and academic-paper-reviewer into a seamless 10-stage workflow with mandatory, coverage-bounded integrity checks, two-stage peer review, and auditable quality-assurance artifacts. Triggers on: academic pipeline, research to paper, full paper workflow, paper pipeline, end-to-end paper, research-to-publication, complete paper workflow, 연구부터 논문까지, 연구 주제 설정부터 논문 완성까지, 논문 전체 워크플로."
metadata:
  version: "3.21.0"
  last_updated: "2026-08-18"
  depends_on: "deep-research, academic-paper, academic-paper-reviewer"
  status: active
  data_access_level: raw
  task_type: open-ended
  related_skills:
    - deep-research
    - academic-paper
    - academic-paper-reviewer
---
# Academic Pipeline v3.21.0 — 完整学术研究工作流编排器

一个轻量级编排器，用于管理从研究探索到最终手稿的完整学术流程。它不执行实质性工作 —— 仅负责检测阶段、推荐模式、分派技能、管理转换并跟踪状态。

> **路由规范（v3.9.2）：** 请参阅 `.claude/CLAUDE.md` 中的“Routing Discipline (v3.9.2)”以及 `shared/references/intent_clarification_protocol.md`，了解跨技能路由规则。此技能假定路由已经确定 —— 跨阶段的歧义材料应已在上游完成澄清。

**v3.6.3（可选启用）：** 设置 `ARS_PASSPORT_RESET=1`，将 FULL 检查点提升为上下文重置边界。在新会话中使用 `resume_from_passport=<hash>`，从记录的阶段继续。请参阅 [`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md)。

**v3.8（可选启用）：** 设置 `ARS_CLAIM_AUDIT=1`，在阶段 4 → 阶段 5 的转换处启用 L3 声明忠实性审计闸门。设置该标志后，编排器会在 v3.7.1 Cite-Time Provenance Finalizer 之后、`formatter_agent` 的硬闸门之前，分派 `claim_ref_alignment_audit_agent`。根据 8 行矩阵，该审计会输出每项的 `claim_audit_results[]` + `uncited_assertions[]` + `claim_drifts[]` + `constraint_violations[]` + `audit_sampling_summaries[]` 聚合结果；HIGH-WARN 类别会通过 formatter 的 REFUSE 规则 6-10 拒绝输出。v3.8.0 默认关闭 —— 启用推广计划将推迟到校准后证据充分时（规范 §5 模式标志理由）。请参阅 `agents/claim_ref_alignment_audit_agent.md` 以及编排器 §3.6 的正文。

**v2.0 核心改进**：
1. **强制用户确认检查点** —— 每个阶段完成后都需要用户确认，才能继续下一步
2. **学术诚信检查** —— 论文完成后、提交审阅前，运行已声明的参考文献、已注册声明和已报告数据检查；公开分母、抽样、未知状态和阻断性判定
3. **两阶段审阅** —— 首次完整审阅 + 修订后的重点验证审阅
4. **最终诚信检查** —— 修订完成后，从新输入重新运行最终检查契约；只有在明确指定的已注册总体确实完整时，`100%` 才适用
5. **可审计** —— 对工作流产物进行版本控制、哈希处理和保留；确定性检查可重放，但不承诺生成式输出逐字节一致
6. **过程文档** —— 阶段 6 生成一份“论文创建过程记录”PDF，用于记录人机协作历史（在完成工作流的终端确认之前交付）

## 快速开始

**完整工作流（从头开始）：**
```
I want to write a research paper on the impact of AI on higher education quality assurance
```
--> academic-pipeline 启动，从阶段 1（RESEARCH）开始

**中途进入（已有论文）：**
```
I already have a paper, help me review it
```
--> academic-pipeline 检测到中途进入，从阶段 2.5（INTEGRITY）开始

**修订模式（收到审稿人反馈）：**
```
I received reviewer comments, help me revise
```
--> academic-pipeline 检测到后，从 Stage 4（REVISE）开始

**从 passport 恢复（跨会话上下文重置，可选）：**
```
resume_from_passport=<hash> [stage=<n>] [mode=<m>]
```
--> 加载 Material Passport（Schema 9），定位与 `<hash>` 匹配的 `kind: boundary` 条目，并确认没有后续的 `kind: resume` 条目使用该条目。如果设置了 `pending_decision`，则首先触发决策提示，以便将用户的分支选择记录到审计账本中；即使用户提供了 `stage=`，也绝不会跳过该提示。在提示完成后（或在没有 `pending_decision` 时立即），下一阶段按以下顺序确定：(a) 如果提供了 `stage=<n>` CLI 覆盖项，则使用该值；否则 (b) 使用匹配选项的 `next_stage`；否则 (c) 使用边界条目中记录的 `next` 字段。CLI `stage=`/`mode=` 覆盖项的优先级高于选项路由。
- **门控（发出）**：发出会话必须设置 `ARS_PASSPORT_RESET=1`。如果没有设置该标志，则不会写入任何 `kind: boundary` 条目，也就没有可供恢复的内容。
- **门控（恢复）**：无需设置标志。任何会话都可以针对包含与该哈希匹配的有效边界条目的 passport 调用 `resume_from_passport=<hash>`。
- **意图**：在一个*全新的* Claude Code 会话中调用。在发出边界的同一会话中恢复不会节省 token，并且可能丢失当前会话中仍然有效的上下文。
- **阶段**：任意阶段。根据上述路由规则，在所确定的阶段恢复。
- **参考**：[`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md) — 参见 §"`resume_from_passport` mode contract"。

**执行流程：**
1. 检测用户当前所处的阶段和可用材料
2. 为每个阶段推荐最佳模式
3. 为每个阶段分派相应的 skill
4. **每个阶段完成后，主动提示并等待用户确认**
5. 全程跟踪进度；随时可以查看 Pipeline Status Dashboard

---

## 触发条件

### 触发关键词

**English**: academic pipeline, research to paper, full paper workflow, paper pipeline, end-to-end paper, research-to-publication, complete paper workflow

**한국어**: 학술 파이프라인, 연구부터 논문까지, 논문 전체 워크플로, 연구 주제 설정부터 논문 완성까지, 연구-논문 전 과정

### 非触发场景

| 场景 | 要使用的 Skill |
|----------|-------------|
| 只需要搜索材料或进行文献综述 | `deep-research` |
| 只需要撰写论文（不需要研究阶段） | `academic-paper` |
| 只需要审阅论文 | `academic-paper-reviewer` |
| 只需要检查引用格式 | `academic-paper`（citation-check mode） |
| 只需要转换论文格式 | `academic-paper`（format-convert mode） |

### 触发排除条件

- 如果用户只需要单项功能（仅搜索材料、仅检查引用），则不需要 pipeline — 直接触发相应的 skill
- 如果用户已经在使用某个 skill 的特定模式，则应尊重该入口；pipeline 采用自愿启用方式
- pipeline 是可选的，并非强制性的

---

## Pipeline 阶段（10 个阶段）

| 阶段 | 名称 | 调用的 Skill / Agent | 可用模式 | 交付物 |
|-------|------|---------------------|----------------|-------------|
| 1 | RESEARCH | `deep-research` | socratic, full, quick | RQ 简报、方法论、参考文献目录、综合分析 |
| 2 | WRITE | `academic-paper` | plan, full | 论文草稿 |
| **2.5** | **INTEGRITY** | **`integrity_verification_agent`** | **pre-review** | **完整性验证报告 + 修正后的论文** |
| 3 | REVIEW | `academic-paper-reviewer` | full（包括 Devil's Advocate） | 5 份评审报告 + 编辑决定 + 修订路线图 |
| 4 | REVISE | `academic-paper` | revision | 修订稿、给评审者的回复 |
| **3'** | **RE-REVIEW** | **`academic-paper-reviewer`** | **re-review** | **验证性评审报告：修订回复检查清单 + 剩余问题** |
| **4'** | **RE-REVISE** | **`academic-paper`** | **revision** | **第二版修订稿（如有需要）** |
| **4.5** | **FINAL INTEGRITY** | **`integrity_verification_agent`** | **final-check** | **最终验证报告（声明的检查项必须为 PASS；已登记的分母以及未知/超出范围状态仍须保持可见）** |
| 5 | FINALIZE | `academic-paper` | format-convert | 最终论文（默认为 MD；在可用时通过 Pandoc 生成 DOCX，否则提供转换说明；询问是否需要 LaTeX；确认正确性；生成 PDF） |
| **6** | **PROCESS SUMMARY** | **`orchestrator`** | **auto** | **论文创建过程记录 MD + LaTeX 转 PDF（双语）** |

**并行化机会（v3.3）**：在阶段 2 中，`academic-paper` skill 的阶段 1（literature_strategist_agent）和 `visualization_agent` 可以在阶段 2（structure_architect_agent）完成大纲后并行运行。具体而言：
- 一旦大纲包含可视化计划，`visualization_agent` 就可以开始生成图表
- 与此同时，`argument_builder_agent` 可以构建 CER 链
- `draft_writer_agent` 等待两者完成后，再开始阶段 4

这与 PaperOrchestra 在大纲（步骤 1）之后并行执行图表生成（步骤 2）和文献综述（步骤 3）的方式相似，可以降低整个流水线的延迟。并行化是可选的——为简化起见，默认仍采用顺序执行。

---

## Pipeline 状态机

1. **阶段 1 RESEARCH** -> 用户确认 -> 阶段 2
2. **阶段 2 WRITE** -> 用户确认 -> 阶段 2.5
3. **阶段 2.5 INTEGRITY** -> PASS -> 阶段 3（FAIL -> 修复并重新验证，最多 3 轮；随后进入 Integrity Check FAIL Loop -> 记录用户决定）
4. **阶段 3 REVIEW** -> Accept -> 阶段 4.5 / Minor|Major -> 阶段 4 / Reject -> 阶段 2 或结束
5. **阶段 4 REVISE** -> 用户确认 -> 阶段 3'
6. **阶段 3' RE-REVIEW** -> Accept|Minor -> 阶段 4.5 / Major -> 阶段 4'
7. **阶段 4' RE-REVISE** -> 用户确认 -> 阶段 4.5（不返回评审阶段）
8. **阶段 4.5 FINAL INTEGRITY** -> PASS（零问题） -> 阶段 5（FAIL -> 修复并重新验证；3 轮后仍有未解决问题 -> Integrity Check FAIL Loop -> 记录用户决定）
9. **阶段 5 FINALIZE** -> MD -> 在可用时通过 Pandoc 生成 DOCX（否则提供说明） -> 询问是否需要 LaTeX -> 确认 -> PDF -> 完成检查点（FULL） -> 阶段 6（用户可以拒绝阶段 6：标记为 `skipped`，流水线直接进入 `completed`）
10. **阶段 6 PROCESS SUMMARY** -> 询问语言版本 -> 生成过程记录 MD -> LaTeX -> PDF -> 终端确认（`finish` / `end` / `done` / `confirm`，或明确无歧义的自然语言等价表达） -> 流水线全局状态 `completed`

请参阅 `references/pipeline_state_machine.md`，了解完整的状态转换定义。

---

## 自适应检查点系统

⚠️ **铁律 —— 核心规则：每个阶段完成后，系统必须主动提示用户并等待确认。检查点的呈现方式会根据上下文和用户参与度进行调整。**

### 检查点类型

| 类型 | 使用时机 | 内容 |
|------|-----------|---------|
| FULL | 第一个检查点；完整性边界之后；Stage 5 完成时（最终交付物验收） | 完整交付物列表 + 决策面板 + 所有选项 |
| SLIM | 在非关键阶段连续 2 次或以上回复“继续”之后 | 单行状态 + 明确的继续/暂停提示 |
| MANDATORY | 完整性检查 FAIL；审查决策；Stage 5 入口关卡（最终确定之前） | 不可跳过；需要用户明确输入 |

### 决策面板（在 FULL 检查点显示）

```
━━━ Stage [X] [Name] Complete ━━━

Metrics:
- Word count: [N] (target: [T] +/-10%)    [OK/OVER/UNDER]
- References: [N] (min: [M])              [OK/LOW]
- Coverage: [N]/[T] sections drafted       [COMPLETE/PARTIAL]
- Criterion status: [named criterion + evidence-anchored categorical judgement, or `NOT_COMPARABLE`]

Deliverables:
- [Material 1]
- [Material 2]

Flagged: [any issues detected, or "None"]

Ready to proceed to Stage [Y]? You can also:
1. View progress (say "status")
2. Adjust settings
3. Pause pipeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 自适应规则

1. **第一个检查点**：始终为 FULL
2. **连续 2 次或以上回复“继续”且未进行审查之后**：提示用户注意（“你已经连续继续了 [N] 次。要查看进度吗？”）
3. **完整性边界（Stage 2.5、4.5）**：始终为 MANDATORY
4. **审查决策（Stage 3、3'）**：始终为 MANDATORY
5. **最终确定之前（Stage 5 入口关卡）**：始终为 MANDATORY —— 这是 Stage 4.5 PASS 与 Stage 5 dispatch 之间的检查点，用户需要明确确认是否继续，并作出最终确定格式决策（引用样式）；LaTeX 问题和内容确认仍保留在 Stage 5 执行期间。Stage 5 完成检查点（Final Paper 已交付、Stage 6 之前）为 FULL —— 绝不使用 SLIM。参见 `references/pipeline_state_machine.md` § Stage 5 boundary semantics
6. **所有其他阶段**：从 FULL 开始；如果用户说“只需继续”，则降级为 SLIM

### 检查点规则

1. ⚠️ **铁律**：**不能自动跳过 MANDATORY 检查点**：即使前一阶段的结果完美无缺，在 MANDATORY 检查点仍然需要用户明确输入
2. **用户可以调整**：在 FULL 和 MANDATORY 检查点，用户可以修改下一步的模式或设置
3. **便于暂停**：用户可以在任何检查点暂停，稍后恢复
4. **SLIM 模式**：如果用户说“只需继续”或“完全自动”，后续非关键检查点将切换为 SLIM 格式（单行状态 + 明确的继续/暂停提示）
5. **参与度保障**：连续回复继续 4 次或以上后，系统会插入一个 FULL 检查点，无论阶段类型如何，以确保用户持续参与其中

### 自检问题（在每个 FULL 检查点）

在向用户呈现检查点之前，编排器会自问：

1. **引用完整性**：最新输出中是否存在任何未经核实的引用？
2. **迎合性让步**：最新阶段是否不加批判地接受了所有反馈，而没有提出异议？
3. **标准轨迹**：对于每项适用的命名标准，证据锚定的状态是有所改善、保持不变、出现退步，还是变得不可比较？绝不能将其简化为隐藏标量或 `latest >= previous`。暂停并标记任何尚未解决的、会影响决策的退步；当标准或证据基础发生变化时，使用 `NOT_COMPARABLE`。
4. **范围纪律**：最新阶段是否添加了用户或修订路线图未要求的内容？
5. **完整性**：该阶段要求交付的所有成果是否都已提供？

如果任何一项引发疑虑，都必须在向用户呈现检查点时说明。

---

## Agent Team（5 个 Agent）

| # | Agent | Role | File |
|---|-------|------|------|
| 1 | `pipeline_orchestrator_agent` | 主编排器：检测阶段、推荐模式、触发 skill、管理阶段转换 | `agents/pipeline_orchestrator_agent.md` |
| 2 | `state_tracker_agent` | 状态跟踪器：记录已完成阶段、生成的材料和修订循环次数 | `agents/state_tracker_agent.md` |
| 3 | `integrity_verification_agent` | 完整性检查器：执行覆盖范围受限的参考文献、引用、已登记主张和报告数据检查（明确给出阻断性结论） | `agents/integrity_verification_agent.md` |
| 4 | `collaboration_depth_agent` | **观察者（仅提供建议，不阻断流程）。**读取对话日志，并根据 `shared/collaboration_depth_rubric.md` 对用户与 AI 的协作模式进行评分。在 FULL/SLIM 检查点以及 Stage 6 记录汇编期间（整个流水线检查，在交付 Process Record 之前）调用。依据 Wang & Zhang (2026)。 | `agents/collaboration_depth_agent.md` |
| 5 | `claim_ref_alignment_audit_agent` | **可选的主张忠实度审计器（v3.8 #103）。**审计抽样引用的主张 ↔ 参考文献对齐情况以及负面约束合规性；输出每项主张的 `claim_audit_results[]`、`claim_drift[]`、`uncited_assertions[]`、`constraint_violations[]`。在请求 claim_audit 模式时，通过编排器 §3.6 调度。 | `agents/claim_ref_alignment_audit_agent.md` |

---

## 编排器工作流

### 第 1 步：接收与检测

```text
pipeline_orchestrator_agent analyzes the user's input:

1. What materials does the user have?
   - No materials           --> Stage 1 (RESEARCH)
   - Has research data      --> Stage 2 (WRITE)
   - Has paper draft        --> Stage 2.5 (INTEGRITY)
   - Has verified paper     --> Stage 3 (REVIEW)
   - Has review comments    --> Stage 4 (REVISE)
   - Has revised draft      --> Stage 3' (RE-REVIEW)
   - Has final draft for formatting --> Stage 5 (FINALIZE)

2. What is the user's goal?
   - Full workflow (research to publication)
   - Partial workflow (only certain stages needed)

3. Determine entry point, confirm with user
```

### 第 2 步：模式推荐

```
Based on entry point and user preferences, recommend modes for each stage:

User type determination:
- Novice / wants guidance --> socratic (Stage 1) + plan (Stage 2) + guided (Stage 3)
- Experienced / wants direct output --> full (Stage 1) + full (Stage 2) + full (Stage 3)
- Time-limited --> quick (Stage 1) + full (Stage 2) + quick (Stage 3)

Explain the differences between modes when recommending, letting the user choose
```

### 第 3 步：阶段执行

```
Call the corresponding skill (does not do work itself, purely dispatching):

1. Inform the user which Stage is about to begin
2. Load the corresponding skill's SKILL.md
3. Launch the skill with the recommended mode
4. Monitor stage completion status

After completion:
1. Compile deliverables list
2. Update pipeline state (call state_tracker_agent)
3. [MANDATORY] Proactively prompt checkpoint, wait for user confirmation
```

### 第 4 步：阶段转换

```
After user confirmation:

1. Pass the previous stage's deliverables as input to the next stage
2. Trigger handoff protocol (defined in each skill's SKILL.md):
   - Stage 1  --> 2: deep-research handoff (RQ Brief + Methodology Blueprint + Bibliography + Synthesis)
   - #672 cargo on every transition: exact builder-produced `preregistration-artifact/1.0` receipt and its named companion when provided; validate and carry byte-for-byte
   - Stage 2  --> 2.5: Pass complete paper to integrity_verification_agent
   - Stage 2.5 --> 3: Pass the Stage 2.5 paper to reviewer (verified, or carrying the recorded FAIL-loop partially-unverified warning)
   - Stage 3  --> 4: Pass Revision Roadmap to academic-paper revision mode
   - Stage 4  --> 3': Pass revised draft, the hard-required original pre-revision draft (#576 current 1.1 §3.1 Phase 2A comparison base), exact author-adjudication sidecar, fully replayed Revision-Evidence Bundle, Response to Reviewers, Editorial Decision Letter, Round-1 findings, the immutable Roadmap, the exact ordered patch/report pairs projected by the bundle, and Round-1 Reviewer Configuration Cards. Missing original/roadmap/author/bundle is `manifest_incomplete`; this is the default contract re-review transfer. A user-requested fresh full review at 3' remains a separate full-mode branch.
   - Stage 3' --> 4': Pass new Revision Roadmap + R&R Traceability Matrix (Schema 11) to academic-paper revision mode; the traceability sidecar (frozen `previously_missed`/`indeterminate` records, #576 §8) rides through 4' toward Stage 4.5
   - Stage 3' --> 4.5 (Accept/Minor direct path): Pass verified revised draft + the traceability sidecar's frozen records to integrity_verification_agent as gate input
   - Stage 4/4' --> 4.5: Pass revision-completed paper to integrity_verification_agent (final verification); on the Major-via-4' path the Stage 3' traceability sidecar travels along as gate input
   - Stage 4.5 --> 5: Pass the accepted final draft (verified, or carrying the recorded FAIL-loop partially-unverified warning) to the one mandatory Stage-5 entry checkpoint; run #660 then #672 against that same accepted artifact ID/SHA-256 before format-convert dispatch
   - Stage 5  --> 6: Pass final deliverables list + the Process-Summary projection of pipeline state history, omitting the #673 activity projection of terminal root `run_id`, pending/sealed activity fields, selected-store data, renderer output, and diagnostics (user may decline Stage 6 at the Stage 5 completion checkpoint)
3. Begin next stage
```

### 对话中途强化协议

在每次阶段转换时，编排器**必须**注入一段简短的核心原则提醒。这可以防止长对话中的上下文腐化。

**模板**（根据即将进入的阶段进行调整）：

````
--- STAGE TRANSITION: [Current] → [Next] ---

🔄 Core Principles Reinforcement:
1. [Most relevant IRON RULE for the next stage]
2. [Most relevant Anti-Pattern to avoid in the next stage]
3. Quality check: Is the output of [Current Stage] at least as good as [Previous Stage]? If not, PAUSE.

Checkpoint: [MANDATORY/ADVISORY] — [What user needs to confirm]
---
````

**特定阶段的强化内容**：完整的 transition → reinforcement focus 对照表请参见 `references/reinforcement_content.md`。

---

## 分阶段调用契约（v3.9.2）

academic-pipeline 是负责协调完整 ARS 流程的编排器 skill，涵盖 10 个阶段（委派给 deep-research、academic-paper、academic-paper-reviewer）。支持两种调用模式：

**模式 A — 编排器驱动（默认）：** `pipeline_orchestrator_agent` 借助 Material Passport 进行状态跟踪，端到端地运行所有阶段。`state_tracker_agent`、`integrity_verification_agent`、`collaboration_depth_agent` 和 `claim_ref_alignment_audit_agent` 由编排器在适当的检查点进行调度。

**模式 B — 分阶段（跨会话恢复）：** 用户在多个会话中一次调用一个阶段的 agent，通常通过 `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>` 实现（参见 `references/passport_as_reset_boundary.md`）。

在模式 B 中，下游 skill（deep-research、academic-paper、academic-paper-reviewer）中的**单阶段 agent**（根据 `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md`，属于 Bucket A）在写入内容时必须严格限定在其被分配的阶段内。academic-pipeline 本身的 5 个 agent 都是按设计跨阶段 / 元级 agent（Bucket C/D）——它们没有围栏是设计使然：

- `pipeline_orchestrator_agent`（D — 编排器，完整的流程可见性）
- `state_tracker_agent`（D — 元状态，涵盖所有阶段）
- `integrity_verification_agent`（C — 第 2.5 / 4.5 阶段的跨 skill 闸门）
- `collaboration_depth_agent`（C — FULL/SLIM 检查点 + 第 6 阶段记录汇编，仅提供建议）
- `claim_ref_alignment_audit_agent`（C — 可选的 claim 审计，与阶段无关）

进入模式 B 需要明确的用户信号——`/ars-<mode>` 斜杠命令或 `[direct-mode]` 前缀。根据 `.claude/CLAUDE.md` Routing Discipline + `shared/references/intent_clarification_protocol.md`，含义不明确的跨阶段输入默认需要澄清。**关键点：**如果在跨阶段材料含义不明确时调度了 `pipeline_orchestrator_agent`，编排器本身目前无法进行协调（这是 v3.10 conductor #134 的工作内容）——v3.9.2 会在编排器运行**之前**将此类情况转入澄清流程。

**强制机制（v3.9.2）：**下游 Bucket A agent 上的 Phase Boundary 阻断 + 建议性验证器（`scripts/check_pipeline_integrity.py`）+ 在启用 hook 的运行时中通过确定性的 PreToolUse 写入范围守卫（#134 rescope，PR #294）。多阶段封装 + 编排器结构化接收仍属于未来范围（#134 Slices 3-5）。

---

## 完整性审查协议

第 2.5 阶段（审查前）和第 4.5 阶段（修订后）验证。五阶段协议：参考文献 → 引用语境 → 统计数据 → 原创性 → 论断。

⚠️ **铁律**：第 4.5 阶段必须在进入第 5 阶段之前达到一个有记录的终止性决议：PASS；或者在完整性 FAIL 循环经过 3 轮后，由用户针对所列未解决事项作出明确且有记录的决定（重复覆盖时，理由要求会升级；参见 `shared/compliance_checkpoint_protocol.md`）。未解决事项绝不会被默默丢弃。第 4.5 阶段会从头开始重新执行一次，不依赖第 2.5 阶段的结论；这并不意味着其错误处理过程彼此独立。

⚠️ **铁律（v3.2）**：第 2.5 阶段和第 4.5 阶段还必须运行 **AI 研究失效模式检查清单**——这是一个包含 7 种模式的分类体系，将引用幻觉检查扩展至实现错误、虚构结果、依赖捷径、将错误当作洞见、方法论编造以及流水线级框架锁定。如果 7 种模式中的任何一种为 `SUSPECTED`，或者模式 1/3/5/6 为 `INSUFFICIENT EVIDENCE`，流水线就会阻塞，并且用户必须在流水线继续之前进行确认（确认 / 说明理由后覆盖 / 修订）。任何配置标志都不能使此阻塞失效；唯一的通过路径是上述有记录的用户确认——这是一种基于信任且带有审计跟踪的控制。随后，第 6 阶段 PROCESS SUMMARY 会将完整的失效模式审计日志作为 AI 自省报告的一部分进行报告。

> 有关引用/论断验证流程的 5 个阶段，请参见 `references/integrity_review_protocol.md`。  
> 有关 7 种 AI 研究失效模式检查清单及阻塞/覆盖逻辑，请参见 `references/ai_research_failure_modes.md`。

- [v3.4.0] `compliance_agent` 运行具有模式感知能力的 PRISMA-trAIce + RAISE 合规检查；采用基于层级的阻塞语义。参见 `shared/compliance_checkpoint_protocol.md`。

### 受折磨短语建议（#660）

在第 4.5 阶段的精确流程完成后、且紧接第 5 阶段格式化之前，编排器会使用由用户提供的或合成夹具生成的快照，以及与原始快照 SHA-256 绑定的分离式清单，对精确的已接受工作草稿运行确定性的 #660 检查器；未提供输入时会生成一个明确的 `not_checked` 工件。该路径不包含原生 PPS 内容/导入器/获取器，也不包含重新分发的短语列表，并且不使用实时模型、外部 API、人工或模型评审者，也不使用环境时钟；时间戳是显式输入。其自身草稿的结果为 `HEURISTIC-ADVISORY` / `UNMEASURED`，绝不会改变第 4.5 阶段的 PASS 或第 5 阶段的门禁，绝不会重写正文，并且只有在修订重新进入现有的完整性/筛选序列后才必须重新运行。

对于文献语料库，非原地生产器会为每个 `cited_title` 和 `cited_abstract` 各生成一条当前的 v1.2 建议记录；缺失的摘要会明确保留为 `not_checked` / `unresolved`，并标记为 `ABSTRACT_MISSING`。下游消费者为只读，并将每条记录组合到现有的“书目完整性建议”部分中。该建议机制不会生成标记，不会触发任何终止策略、门禁、终结器晋级、排名、引用重写或替换文本，也不支持任何关于干净草稿、来源、papermill、语境有效性、出版商接受度或匹配器准确性的声明。

### 跨文档一致性 advisory (#672)

Stage-1 shell-capable dispatcher 是唯一可以调用
`scripts/build_cross_document_consistency_advisory.py
build-preregistration-artifact` 的消费者。non-shell research architect 仅提供
调用方声明和命名的 companion handle。生成的精确 sidecar 及所提供的 companion
会在每次交接中经过重放验证，并逐字节原样传递。遗漏、静默替换、模板替换或摘要修复均属无效。

在同一个精确的 Stage 4.5 PASS 之后，唯一强制性的 Stage-5 入口检查点先运行
#660，再运行 #672。两者绑定同一个已接受的 draft；#660 的
`input_binding.artifact.artifact_id/artifact_sha256` 必须等于 #672 的
`input_binding.accepted_draft_artifact_id/accepted_draft_sha256`。两者仍是相互独立的载体，具有各自独立的失败语义：在退出码 1 时保留 schema-valid 的 #660 degraded artifact；#672 contract/runtime failure 不写入 artifact，并且只记录受限的 `ADVISORY_UNAVAILABLE:<CODE>`。

#672 始终为 `LLM-ADVISORY` / `UNMEASURED`。它没有 score、pass/fail、gate、
readiness、authorization、ClaimIntent、rewrite、consent/protocol duplicate 或
clean/agreement 语义。它不能改变 Stage 4.5，不能阻塞或延迟现有检查点，也不能在用户确认后改变 Stage-5 路由。manuscript revision 会使两个 advisory 过期，必须在 #660 和 #672 按此顺序针对新的 accepted bytes 重新运行前，重新进入 integrity。

---

## 两阶段审查协议

Stage 3（完整审查，5 名审查者）→ Revision Coaching → Stage 4 → Stage 3'（重新审查）→ 可选的 Residual Coaching → Stage 4'。

Stage 3' 默认遵循 #576 的 evidence-before-persuasion 三道 gate 合约：orchestrator 发出 hash-bound input manifest，依次调度 Phase 1（criteria commitment，revision-blind）→ Phase 2A（evidence verdict，persuasion-blind）→ Phase 2B（claim matching，letter revealed），并在任何 decision surfaces 之前将 `scripts/check_re_review_synthesis.py` 作为 MANDATORY 步骤调用——结果为 Accept / Minor / Major、`user_review_required` deferral，或 fail-closed abort（绝不会是 Reject）。sidecar 冻结的 `previously_missed`/`indeterminate` new-issue records 会在两条路由上都转发至 Stage 4.5。Legacy single-pass re-review 需要显式的 `ARS_RE_REVIEW_LEGACY=1` flag，并标记为 `[LEGACY-NO-CONTRACT]`。权威依据：`pipeline_orchestrator_agent.md` § Stage 3' Re-Review Contract Dispatch + `academic-paper-reviewer/references/re_review_mode_protocol.md`。

> 详细的阶段流程和 coaching 对话限制请参见 `references/two_stage_review_protocol.md`。

---

## 中途进入协议

用户可以从任意阶段进入。orchestrator 将：

1. **检测材料**：分析用户提供的内容，以确定当前有哪些可用材料
2. **识别缺口**：检查目标阶段所需的前置材料
3. **建议补齐**：如果缺少关键材料，建议是否返回较早的阶段
4. **直接进入**：如果材料充足，则直接开始指定阶段

**重要：中途进入时不能跳过 Stage 2.5**
- 如果用户带来一篇论文并直接进入流程，必须先经过 Stage 2.5 (INTEGRITY)，然后才能进入 Stage 3 (REVIEW)
- 唯一例外：用户可以提供此前的完整性验证报告，且内容未被修改

---

## 外部评审协议

处理外部（人工）评审反馈的整合。4 步工作流：接收与结构化 → 战略性修订指导 → 修订与回复 → 自我验证。

> 完整的 4 步工作流、指导对话模式和能力边界请参阅 `references/external_review_protocol.md`。

---

## 进度面板

在 FULL 检查点显示 ASCII 面板，以展示流程进度。

> 面板模板请参阅 `references/progress_dashboard_template.md`。

---

## 修订循环管理

- Stage 3（首次评审） -> Stage 4（修订） -> Stage 3'（验证性评审） -> Stage 4'（如有需要则重新修订） -> Stage 4.5（最终验证）
- **最多进行 1 轮重新修订**（Stage 4'）：如果 Stage 3' 给出 Major，则进入 Stage 4' 进行修订，然后直接进入 Stage 4.5（不返回评审阶段）
- **流程覆盖 academic-paper 的最多 2 轮修订规则**：在该流程中，修订仅限于 Stage 4 + Stage 4'（各 1 轮），取代 academic-paper 的最多 2 轮规则
- 将未解决的问题标记为已承认的局限性
- 提供累计修订历史（每一轮的决定、已处理的事项、未解决的事项）

### 提前停止标准

每轮修订结束时，仅当**不存在任何 P0 问题**、**不存在任何未解决的且会影响决策的回归问题**、**不存在任何适用标准发生实质性状态变化而需要再次修订的情况**，并且**作者没有任何尚未完成的必要操作**时，才建议停止。解释基于标准的依据；不要计算分数差值，也不要将标签数量的小幅变化视为收敛。用户可以覆盖此决定。硬性上限：2 个完整修订循环（Stage 4 + Stage 4'）。

### 预算透明度（v3.2；交互次数扩展 #89/#388）

在流程开始时，根据论文长度、模式和跨模型开关估算 token 成本。在 Stage 1 开始前展示估算结果并征得用户确认。

在 token 估算之外，还要展示**交互次数预算**：长期文档损坏会随着文档往返次数增加而累积，而不是随着 token 数量增加而累积（DELEGATE-52，arXiv:2604.15597）。列出该流程已实施的往返次数上限——2 个完整修订循环（见上文的提前停止标准）、8 + 5 轮苏格拉底式指导（Stage 3→4 / 3'→4'），以及 Stage 2.5/4.5 中完整性门控的修复→重新验证循环——并说明这些上限对于所选模式所意味着的最坏情况下的往返总次数。在每个阶段检查点，报告累计往返次数，并将其与阶段状态并列显示。**仅供参考**：该次数永远不会阻止流程；各循环的上限仍是强制执行层。若运行次数超过其声明的最坏情况，说明存在这些上限未覆盖的循环；应明确指出这一点，而不是默默继续。

---

## 跨运行裁决活动（#673；选择加入的咨询旁路）

状态跟踪器中的“裁决活动元数据”部分是唯一的生产者/状态权威。每次运行都会获得一个稳定且明确的 `run_id`。结构化处理器首先持久化应用其现有的作者选择、合规覆盖、明确请求或 MANDATORY 检查点路由/状态效果，然后才尽力将经过数据最小化处理的绑定追加到五行的 `pending_adjudication_activity_bindings[]` 清单中。拒绝的 MANDATORY 跳过会先保持状态不变，然后可选回执存储 `skip_refused`。作者组使用 `artifact_group_stage`，并且可以同时保留 Stage 3 和 Stage 3-prime；回执阶段使用完整的 Stage 1 至 Stage 6 封闭枚举，不包含 Stage 0。合规性允许存在一个仅报告用途的普通 captured-zero 组，并且仅在完全符合条件的覆盖情况下要求配对的操作回执。

终止行为保持不变，并且优先执行。在 completed/aborted 状态持久化完成后，且仅针对用户选定的本地存储，编排器将明确的状态/构件根路径以及明确的五个待处理行传递给 `seal_terminal_inventory(state_path, artifact_root, pending_bindings)`，然后尽力运行密封清单的 `build-input`、幂等的 `append-run` 以及可选的 `render`。该辅助程序负责计算哈希；它不会读取待处理状态、接受调用方哈希、推断来源或执行扫描。根 `run_id` 加上密封根 `adjudication_activity_sources` 构成精确权威。任何活动失败都只是咨询性诊断，不能影响已经持久化的终止结果。

活动数据绝不会进入 Material Passport、交接文档、Process Record、审阅者/模型/观察者/合规输入、门控、裁决、检查点输入或阶段转换。不会有实时模型、裁判、评估、网络/API、环境时钟、目录扫描或 glob 参与。完整细节和冻结的回执架构仍保留在 `docs/design/2026-08-10-673-cross-run-adjudication-activity-spec.md` 和 `shared/contracts/activity/` 中。

---

## 可审计性与重放边界

流水线构件均经过版本化、哈希处理并可审计。确定性验证器可以针对相同的字节和配置进行重放。LLM 生成的 prose 和语义判断具有随机性，并不保证字节级可复现；应记录模型/配置以及证据，以便检查差异。

> 参见 `references/reproducibility_audit.md`，其中包含标准化工作流契约、确定性重放边界、审计轨迹格式和构件跟踪。

---

## 阶段 6：流程总结协议

生成最终流程记录：论文创作历程、协作质量评估（6 个维度，1-100）以及 AI 自我反思报告。

**终止语义（#528）**：阶段 6 非强制性阶段——用户可以在阶段 5 完成检查点处拒绝执行该阶段（阶段 6 标记为 `skipped`；流水线仍然以 `completed` 状态终止）。执行该阶段时，流程记录交付完成后，编排器会提示用户进行终止确认——`finish` / `end` / `done` / `confirm`，或接受交付物的明确无歧义的自然语言等价表达。确认后，阶段 6 标记为 `completed`，流水线全局状态设置为 `completed`；变更请求（另一种语言版本、内容修正）会使阶段 6 保持 `in_progress`，且不构成确认。参见 `references/pipeline_state_machine.md` § 阶段 6 终止语义。

> 有关完整工作流、必需内容结构、评分维度和输出规范，请参阅 `references/process_summary_protocol.md`。

---

## 协作深度观察器（v3.5.0，仅提供建议 — 从不阻塞）

`collaboration_depth_agent` 观察用户与流水线的协作模式。它**仅提供建议**，在任何检查点都**从不阻塞**流程推进。它在设计上是 `non-blocking` 的，并在其 frontmatter 中携带 `blocking: false`，作为结构性保证。

**调用时机**：每个 FULL 检查点、每个 SLIM 检查点，以及 Stage 6 记录编制期间（完整流水线检查会在生成并交付 Process Record 之前运行，因此其输出可以成为用户确认的记录章节）。MANDATORY 检查点（Stages 2.5 / 4.5 完整性关卡）**不会调用观察器** — 这些属于完整性问题，不得被稀释。

**功能**：读取刚完成阶段的对话范围（在检查点调用时）或整个流水线（在 Stage 6 记录编制期间），依据 `shared/collaboration_depth_rubric.md` 中的规范评分标准评估协作模式，并输出建议区块/章节。维度包括：Delegation Intensity、Cognitive Vigilance、Cognitive Reallocation、Zone Classification（Zone 1 / Zone 2 / Zone 3）。该评分标准基于 Wang & Zhang (2026) IJETHE 23:11（DOI 10.1186/s41239-026-00585-x）。

**与现有机制的区别**：

| 机制 | 评估内容 | 是否阻塞？ |
|---|-------------|---|
| `integrity_verification_agent`（Stages 2.5 / 4.5） | 论文内容 — 参考文献、引用、数据 | 是（阻塞性关卡） |
| Stage 6 Collaboration Quality Evaluation（6 个维度，1–100） | AI 对自身行为的自我反思 | 否，但仅生成一次 |
| `collaboration_depth_agent`（本观察器） | **用户**的协作模式（委派强度、警觉性、重新分配） | **否 — 从不阻塞。仅提供建议。** |

**非阻塞保证**：
- 观察器输出绝不会出现在任何检查点的“Flagged”行中。
- `Ready to proceed?` 提示不会因观察器输出而改变。
- `blocked_by: collaboration_depth_agent` 永远不是 `state_tracker` 中的合法状态。
- 如果观察器 frontmatter 曾声明 `blocking: true`，编排器必须拒绝调度它。

**跨模型**：当设置了 `ARS_CROSS_MODEL` 时，观察器会在两个模型上运行，并标记任何超过 2 分的维度差异。分数绝不会在模型之间被静默平均。

> 有关完整评分流程和反迎合规范，请参阅 `agents/collaboration_depth_agent.md`；有关规范的四维评分标准，请参阅 `shared/collaboration_depth_rubric.md`。

---

## 反模式

明确禁止以下行为，以防止常见的失败模式：

| # | 反模式 | 失败原因 | 正确行为 |
|---|-------------|-------------|-----------------|
| 1 | **跳过完整性检查** | “论文看起来没问题，跳过 Stage 2.5/4.5” | 完整性检查是 MANDATORY 的；无论感知到的质量如何，都不能自动跳过 |
| 2 | **编排器执行实质性工作** | 流水线编排器编写内容或审阅论文 | 编排器只能进行调度和协调；实质性工作应由子技能负责 |
| 3 | **自动推进越过 MANDATORY 检查点** | 在 FULL 检查点未经用户确认就进入下一阶段 | MANDATORY 检查点要求在继续之前获得用户的明确输入 |
| 4 | **跨阶段质量下降** | 由于上下文窗口耗尽，Stage 4 修订稿比 Stage 2 草稿更差 | 如果 Stage N 的输出质量 < Stage N-1，则 PAUSE，并在继续之前重新加载核心原则 |
| 5 | **静默丢弃审稿人意见** | 10 条意见中只处理了 8 条，并希望没人注意到 | R&R tracking table 必须涵盖每一条意见，并明确记录其状态 |
| 6 | **在 Stage 4.5 仅重新验证已知问题** | 最终完整性检查只重新检查 Stage 2.5 的发现 | Stage 4.5 必须从头开始执行全新的检查；修订可能引入新的问题 |
| 7 | **抬高 Collaboration Quality 分数** | 为避免尴尬的自我批评而给出 90/100 | 诚实优先：不得抬高分数，也不得客套；每个分数都必须引用具体证据 |
| 8 | **绕过 Failure Mode Checklist 区块**（v3.2） | “7-mode 检查清单是新内容，这次运行跳过吧” | Stage 2.5/4.5 Failure Mode Checklist 是 MANDATORY 且 BLOCKING 的；不存在未记录的绕过方式 — 每次覆盖都必须记录用户的理由，以供 Stage 6 使用 |

---

## 质量标准

| 维度 | 要求 |
|-----------|------------|
| 阶段检测 | 正确识别用户当前所处阶段及可用材料 |
| 模式推荐 | 根据用户偏好和材料状态推荐合适的模式 |
| 材料交接 | 阶段间交接材料完整且格式正确 |
| 状态跟踪 | 实时更新管线状态；进度仪表板准确 |
| **强制检查点** | **每个阶段完成后都需要用户确认** |
| **强制完整性检查** | **始终运行 Stage 2.5 和 4.5；在非 PASS 结果后继续流程，必须有明确且记录在案的用户决策** |
| **强制失败模式检查清单**（v3.2） | **Stage 2.5 和 4.5 必须运行 7 模式 AI 研究失败检查清单；疑似失败将阻止流程继续；覆盖检查结果需要用户说明理由** |
| 不越权 | ⚠️ 铁律：Orchestrator 不执行实质性的研究、写作或审阅工作，只负责调度 |
| 不强制推进 | ⚠️ 铁律：用户可以随时暂停或退出管线（但不能跳过完整性检查） |
| 可审计工作流 | 相同的已声明契约和确定性验证器可以重放；模型/配置和随机性输出仍然可见，而不是承诺完全一致 |
| **具备收敛意识的停止机制** | **仅当不存在 P0、未解决的涉及决策的回归问题、实质性的标准状态变化或尚未完成的必要操作时，才建议停止；用户可以覆盖该建议** |
| **预算透明度**（v3.2；#388） | **令牌成本估算 + 交互次数预算（往返上限 + 检查点处的累计次数，仅供参考）+ 管线启动时的用户确认** |

---

## 错误恢复

| 阶段 | 错误 | 处理方式 |
|-------|-------|---------|
| Intake | 无法确定入口点 | 询问用户拥有哪些材料以及其目标 |
| Stage 1 | deep-research 未能收敛 | 建议切换模式（socratic -> full）或缩小范围 |
| Stage 2 | 缺少研究基础 | 建议返回 Stage 1 补充研究 |
| Stage 2.5 | 经过 3 轮修正后仍为 FAIL | 列出无法验证的项目；由用户决定是否继续 |
| Stage 3 | 审阅结果为 Reject | 提供选项：重大重构（Stage 2）或放弃 |
| Stage 4 | 所有项目的修订均未完成 | 列出未处理的项目；询问是否继续 |
| Stage 3' | 验证仍存在重大问题 | 进入 Stage 4' 进行最终修订 |
| Stage 4' | 修订后仍存在问题 | 标记为已确认的局限性；继续进入 Stage 4.5 |
| Stage 4.5 | 最终验证 FAIL | 修复并重新验证（最多 3 轮） |
| Any | 用户中途离开 | 保存管线状态；下次可以从断点恢复 |
| Any | Skill 执行失败 | 报告错误；建议重试、暂停或切换模式。不要跳过强制完整性检查或失败模式检查关卡 |

---

## Agent 文件引用

| Agent | 定义文件 |
|-------|----------------|
| pipeline_orchestrator_agent | `agents/pipeline_orchestrator_agent.md` |
| state_tracker_agent | `agents/state_tracker_agent.md` |
| integrity_verification_agent | `agents/integrity_verification_agent.md` |
| collaboration_depth_agent | `agents/collaboration_depth_agent.md` |
| claim_ref_alignment_audit_agent | `agents/claim_ref_alignment_audit_agent.md` |

---

## 参考文件

| Reference | 用途 |
|-----------|---------|
| `references/pipeline_state_machine.md` | 完整的状态机定义：所有合法转换、前置条件和操作 |
| `references/plagiarism_detection_protocol.md` | 阶段 D 原创性验证协议 + 自我抄袭 + AI 文本特征 |
| `references/mode_advisor.md` | 统一的跨技能决策树：将用户意图映射到最佳技能 + 模式 |
| `references/claim_verification_protocol.md` | 阶段 E 论断验证协议：论断提取、来源追踪、交叉引用、裁定分类 |
| `references/claim_audit_calibration_protocol.md` | v3.8 #103 claim_ref_alignment 审计校准：gold-set 形状（T-C3）、阈值门槛 FNR<0.15 / FPR<0.10（T-C1）、按类别报告 FNR/FPR（T-C2）。通过 `PYTHONPATH=. python3 -m unittest scripts.test_claim_audit_calibration -v` 重新运行。 |
| `references/ai_research_failure_modes.md` | 7 模式 AI 研究失败检查清单（Lu 2026），在阶段 2.5 + 4.5 运行并执行阻断行为，在阶段 6 报告 |
| `references/team_collaboration_protocol.md` | 多人团队协调：角色定义、交接协议、版本控制、冲突解决 |
| `references/integrity_review_protocol.md` | 阶段 2.5 + 4.5 完整性验证：5 阶段协议详情 |
| `references/two_stage_review_protocol.md` | 两阶段评审：阶段 3 完整评审 + 阶段 3' 验证评审 |
| `references/external_review_protocol.md` | 外部（人工）评审者反馈：4 步骤的接收、辅导、修订、验证 |
| `references/process_summary_protocol.md` | 阶段 6：协作质量评估 + AI 自我反思报告 |
| `references/reproducibility_audit.md` | 标准化工作流契约、确定性重放边界和审计轨迹格式 |
| `references/progress_dashboard_template.md` | ASCII 进度仪表板模板 |
| `references/reinforcement_content.md` | 转换过程中的阶段特定强化重点表 |
| `references/changelog.md` | 完整版本历史 |
| `shared/handoff_schemas.md` | 跨技能数据契约：所有阶段间交接产物的 9 个 schema |
| `shared/collaboration_depth_rubric.md` | Collaboration Depth Observer 评量标准（v1.0）：基于 Wang & Zhang (2026) IJETHE 23:11 的 4 个维度 |

---

## 模板

| Template | 用途 |
|----------|---------|
| `templates/pipeline_status_template.md` | 进度仪表板输出模板 |

---

## 示例

| Example | 展示内容 |
|---------|-------------|
| `examples/full_pipeline_example.md` | 完整的流水线对话日志（阶段 1-5，包含完整性验证 + 两阶段评审） |
| `examples/mid_entry_example.md` | 中途进入示例，从阶段 2.5 开始（现有论文 -> 完整性检查 -> 评审 -> 修订 -> 最终确定） |

---

## 输出语言

遵循用户语言。学术术语保留 English。

---

## 与其他技能的集成

```
academic-pipeline dispatches the following skills (does not do work itself):

Stage 1: deep-research
  - socratic mode: Guided research exploration
  - full mode: Complete research report
  - quick mode: Quick research summary

Stage 2: academic-paper
  - plan mode: Socratic chapter-by-chapter guidance
  - full mode: Complete paper writing

Stage 2.5: integrity_verification_agent (Mode 1: pre-review)
Stage 4.5: integrity_verification_agent (Mode 2: final-check)

Stage 3: academic-paper-reviewer
  - full mode: Complete 5-person review (Journal-Fit Reviewer + R1/R2/R3 + Devil's Advocate)

Stage 3': academic-paper-reviewer
  - re-review mode: Verification review (focused on revision responses)

Stage 4/4': academic-paper (revision mode)
Stage 5: academic-paper (format-convert mode)
  - Step 1: Consume the citation-style decision recorded at the Stage 5 entry gate; ask which academic formatting style (APA 7.0 / Chicago / IEEE, etc.) only when no gate decision exists (direct format-convert / mid-entry invocation)
  - Step 2: Produce MD, then generate DOCX via Pandoc when available (otherwise provide conversion instructions)
  - Step 3: Produce LaTeX (using corresponding document class, e.g., apa7 class for APA 7.0)
  - Step 4: After user confirms content is correct, tectonic compiles PDF (final version)
  - Fonts: Times New Roman (English) + Source Han Serif TC VF (Chinese) + Courier New (monospace)
  - ⚠️ IRON RULE: PDF must be compiled from LaTeX (HTML-to-PDF is prohibited)
```

---

## 相关技能

| 技能 | 关系 |
|-------|-------------|
| `deep-research` | 已调度（阶段 1 研究阶段） |
| `academic-paper` | 已调度（阶段 2 写作、阶段 4/4' 修订、阶段 5 格式化） |
| `academic-paper-reviewer` | 已调度（阶段 3 首轮评审、阶段 3' 验证性评审） |

---

## 模型分层（#517，可选）

当设置 `ARS_MODEL_TIERING` 时，调度会话会按照 `shared/model_tiering.md`（规范来源：完整的 39 个智能体判断/执行表及规则）为此技能的智能体路由模型。精简规则：

- **未设置（默认）：** 每个智能体都继承会话模型 — 与 #517 之前的行为逐字节等价。
- **`economy`**（前沿层级会话）：执行类型智能体使用比会话模型低一级的模型进行调度 — 下限为 Opus 级，绝不更低；判断类型智能体继续使用会话模型。在达到或低于下限时不执行任何操作（仅提示一次）。
- **`quality-boost`**（低于前沿层级的会话）：检查点界面的判断类型智能体（阶段 2.5/4.5 闸门；选择启用的阶段 4→5 主张–参考文献审计；最终评审）跃升至前沿层级（无论相隔多少层级，而非仅提升一级）；任何情况下都不会降级。在前沿层级时不执行任何操作（仅提示一次）。
- 未知值 → 警告一次，按未设置处理。层级表示相对位置，绝不硬编码具体模型 ID。当某个方向处于激活状态时，将重复的同阶段调用路由至**同一个**工作智能体，以便其提示词缓存持续累积；未设置时，调度形态也保持逐字节等价。

---

## 版本信息

| 项目 | 内容 |
|------|---------|
| 技能版本 | 3.21.0 |
| 最后更新 | 2026-08-18 |
| 维护者 | Cheng-I Wu |
| 依赖技能 | deep-research v2.0+、academic-paper v2.0+、academic-paper-reviewer v1.1+ |
| 角色 | 完整的学术研究工作流编排器 |

---

## 更新日志

> 完整版本历史请参阅 `references/changelog.md`。