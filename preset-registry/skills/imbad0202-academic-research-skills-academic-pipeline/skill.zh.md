---
name: academic-pipeline
description: "Orchestrator for the full academic research pipeline: research -> write -> integrity check -> review -> revise -> re-review -> re-revise -> final integrity check -> finalize. Coordinates deep-research, academic-paper, and academic-paper-reviewer into a seamless 10-stage workflow with mandatory, coverage-bounded integrity checks, two-stage peer review, and auditable quality-assurance artifacts. Triggers on: academic pipeline, research to paper, full paper workflow, paper pipeline, end-to-end paper, research-to-publication, complete paper workflow, 연구부터 논문까지, 연구 주제 설정부터 논문 완성까지, 논문 전체 워크플로."
metadata:
  version: "3.21.2"
  last_updated: "2026-09-06"
  depends_on: "deep-research, academic-paper, academic-paper-reviewer"
  status: active
  data_access_level: raw
  task_type: open-ended
  related_skills:
    - deep-research
    - academic-paper
    - academic-paper-reviewer
---
# 学术流水线 v3.21.2 — 完整学术研究工作流编排器

一个轻量级编排器，用于管理从研究探索到最终稿件的完整学术流程。它不执行实质性工作——仅检测阶段、推荐模式、分发技能、管理转换并跟踪状态。

> **路由纪律（v3.9.2）：** 有关跨技能路由规则，请参阅 `.claude/CLAUDE.md` 中的“Routing Discipline (v3.9.2)”以及 `shared/references/intent_clarification_protocol.md`。此技能假定路由已完成确定——模糊的跨阶段材料应已在上游得到澄清。

**v3.6.3（选择启用）：** 设置 `ARS_PASSPORT_RESET=1`，将 FULL 检查点提升为上下文重置边界。在新会话中使用 `resume_from_passport=<hash>`，从已记录的阶段继续。参阅 [`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md)。

**v3.8（选择启用）：** 设置 `ARS_CLAIM_AUDIT=1`，在阶段 4 → 阶段 5 的转换中启用 L3 主张忠实度审计门禁。设置该标志后，编排器会在 v3.7.1 引文时来源追溯定稿器之后、`formatter_agent` 的硬门禁之前分发 `claim_ref_alignment_audit_agent`。该审计依据 8 行矩阵输出 `claim_audit_results[]` + `uncited_assertions[]` + `claim_drifts[]` + `constraint_violations[]` + `audit_sampling_summaries[]` 聚合结果；HIGH-WARN 类别通过格式化器 REFUSE 规则 6-10 拒绝门禁输出。v3.8.0 默认关闭——启用推进计划推迟至校准后证据产生之后（规范 §5 的模式标志理由）。参阅 `agents/claim_ref_alignment_audit_agent.md` 和编排器 §3.6 的说明文字。

**v2.0 核心改进**：
1. **强制用户确认检查点** — 每个阶段完成后，都需要用户确认才能继续下一步
2. **学术诚信检查** — 论文完成后、提交评审前，运行已声明参考文献、已注册主张和已报告数据检查；公开分母、抽样、未知状态和阻断性结论
3. **两阶段评审** — 首先进行完整评审，然后在修订后进行聚焦验证评审
4. **最终诚信检查** — 修订完成后，从新鲜输入重新运行最终检查契约；仅在指定的已注册总体被明确完整覆盖时，`100%` 才适用
5. **可审计性** — 对工作流工件进行版本化、哈希化和保留；确定性检查可重放，但不承诺生成式输出逐字节一致
6. **过程文档** — 阶段 6 生成“论文创建过程记录”PDF，记录人类与 AI 的协作历史（在完成流水线的最终确认之前交付）

## 快速开始

**完整工作流（从头开始）：**
```
I want to write a research paper on the impact of AI on higher education quality assurance
```
--> academic-pipeline 启动，从阶段 1（研究）开始

**中途进入（已有论文）：**
```
I already have a paper, help me review it
```
--> academic-pipeline 检测到中途进入，从阶段 2.5（诚信）开始

**修订模式（收到审稿人反馈）：**
```
I received reviewer comments, help me revise
```
--> academic-pipeline 检测到后，从 Stage 4（REVISE）开始

**从 passport 恢复（跨会话上下文重置，可选）：**
```
resume_from_passport=<hash> [stage=<n>] [mode=<m>]
```
--> 加载 Material Passport（Schema 9），定位与 `<hash>` 匹配的 `kind: boundary` 条目，并确认没有更晚的 `kind: resume` 条目消费它。如果设置了 `pending_decision`，会首先触发决策提示，以便在审计账本中记录用户选择的分支；即使用户提供了 `stage=`，也绝不会跳过该提示。在提示完成后（或在没有 `pending_decision` 时立即），下一阶段按以下顺序确定：(a) 如果提供了 `stage=<n>` CLI 覆盖，则使用该值；否则 (b) 使用匹配选项的 `next_stage`；否则 (c) 使用 boundary 条目中记录的 `next` 字段。CLI `stage=`/`mode=` 覆盖的优先级高于选项路由。
- **门控（emit）**：发出会话中必须设置 `ARS_PASSPORT_RESET=1`。如果没有该标志，则不会写入 `kind: boundary` 条目，也就没有可供恢复的内容。
- **门控（resume）**：无需设置标志。任何会话都可以针对包含与该哈希匹配的有效 boundary 条目的 passport，调用 `resume_from_passport=<hash>`。
- **意图**：在一个*全新的* Claude Code 会话中调用。在发出 boundary 的同一会话中恢复不会节省 token，还可能丢失当前会话中仍然有效的上下文。
- **阶段**：任意阶段。根据上述路由规则确定从相应阶段恢复。
- **参考**：[`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md) — 参见 §“`resume_from_passport` 模式契约”。

**执行流程：**
1. 检测用户当前所处的阶段和可用材料
2. 为每个阶段推荐最优模式
3. 为每个阶段调度相应的 skill
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

### 触发排除项

- 如果用户只需要单项功能（只搜索材料、只检查引用），则不需要使用 pipeline，直接触发相应的 skill
- 如果用户已经在使用某个 skill 的特定模式，则应尊重该入口；pipeline 需要主动选择
- pipeline 是可选的，不是强制的

---

## 流程阶段（10 个阶段）

| 阶段 | 名称 | 调用的 Skill / Agent | 可用模式 | 交付物 |
|-------|------|---------------------|----------------|-------------|
| 1 | RESEARCH | `deep-research` | socratic, full, quick | 研究问题简报、方法论、参考文献目录、综合分析 |
| 2 | WRITE | `academic-paper` | plan, full | 论文初稿 |
| **2.5** | **INTEGRITY** | **`integrity_verification_agent`** | **pre-review** | **完整性验证报告 + 修正后的论文** |
| 3 | REVIEW | `academic-paper-reviewer` | full（包括 Devil's Advocate） | 5 份评审报告 + 编辑决定 + 修订路线图 |
| 4 | REVISE | `academic-paper` | revision | 修订稿、给审稿人的回复 |
| **3'** | **RE-REVIEW** | **`academic-paper-reviewer`** | **re-review** | **验证性评审报告：修订回复检查清单 + 残留问题** |
| **4'** | **RE-REVISE** | **`academic-paper`** | **revision** | **第二版修订稿（如有需要）** |
| **4.5** | **FINAL INTEGRITY** | **`integrity_verification_agent`** | **final-check** | **最终验证报告（已声明的检查必须 PASS；已登记的分母以及未知/超出范围状态仍保持可见）** |
| 5 | FINALIZE | `academic-paper` | format-convert | 最终论文（默认为 MD；可用 Pandoc 时生成 DOCX，否则提供转换说明；询问是否需要 LaTeX；确认正确性；生成 PDF） |
| **6** | **PROCESS SUMMARY** | **orchestrator** | **auto** | **论文创建过程记录 MD + LaTeX to PDF（双语）** |

**并行化机会（v3.3）**：在阶段 2 中，`academic-paper` skill 的阶段 1（literature_strategist_agent）和 `visualization_agent` 可以在阶段 2（structure_architect_agent）完成大纲后并行运行。具体而言：
- 一旦大纲包含可视化计划，`visualization_agent` 就可以开始生成图表
- 与此同时，`argument_builder_agent` 可以构建 CER 链
- `draft_writer_agent` 会等待两者完成后再开始阶段 4

这与 PaperOrchestra 在大纲（步骤 1）之后并行执行图表生成（步骤 2）和文献综述（步骤 3）的方式一致，可以降低整体流程延迟。并行化是可选的，为保持简单，默认仍采用顺序执行。

---

## 流程状态机

1. **阶段 1 RESEARCH** -> 用户确认 -> 阶段 2
2. **阶段 2 WRITE** -> 用户确认 -> 阶段 2.5
3. **阶段 2.5 INTEGRITY** -> PASS -> 阶段 3（FAIL -> 修复并重新验证，最多 3 轮；随后进入 Integrity Check FAIL Loop -> 记录用户决定）
4. **阶段 3 REVIEW** -> Accept -> 阶段 4.5 / Minor|Major -> 阶段 4 / Reject -> 阶段 2 或结束
5. **阶段 4 REVISE** -> 用户确认 -> 阶段 3'
6. **阶段 3' RE-REVIEW** -> Accept|Minor -> 阶段 4.5 / Major -> 阶段 4'
7. **阶段 4' RE-REVISE** -> 用户确认 -> 阶段 4.5（不返回评审）
8. **阶段 4.5 FINAL INTEGRITY** -> PASS（零问题） -> 阶段 5（FAIL -> 修复并重新验证；3 轮未解决后 -> Integrity Check FAIL Loop -> 记录用户决定）
9. **阶段 5 FINALIZE** -> MD -> 可用 Pandoc 时通过 Pandoc 生成 DOCX（否则提供说明） -> 询问是否需要 LaTeX -> 确认 -> PDF -> 完成检查点（FULL） -> 阶段 6（用户可以拒绝阶段 6：标记为 `skipped`，流程直接进入 `completed`）
10. **阶段 6 PROCESS SUMMARY** -> 询问语言版本 -> 生成过程记录 MD -> LaTeX -> PDF -> 终端确认（`finish` / `end` / `done` / `confirm`，或明确无歧义的自然语言等价表达） -> 流程全局状态 `completed`

完整的状态转换定义请参阅 `references/pipeline_state_machine.md`。

---

## 自适应检查点系统

⚠️ **铁律 — 核心规则：每个阶段完成后，系统必须主动提示用户并等待确认。检查点的呈现形式会根据上下文和用户参与度进行调整。**

### 检查点类型

| 类型 | 使用时机 | 内容 |
|------|-----------|---------|
| FULL | 第一个检查点；完整性边界之后；阶段 5 完成后（最终交付物验收） | 完整交付物列表 + 决策仪表板 + 所有选项 |
| SLIM | 在非关键阶段连续 2 次以上回复“继续”后 | 单行状态 + 明确的继续/暂停提示 |
| MANDATORY | 完整性 FAIL；审查决策；阶段 5 入口门槛（最终定稿前） | 不可跳过；需要用户明确输入 |

### 决策仪表板（在 FULL 检查点展示）

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

1. **第一个检查点**：始终使用 FULL
2. **连续 2 次以上未审查便“继续”后**：提示用户注意（“您已连续继续 [N] 次。要查看进度吗？”）
3. **完整性边界（阶段 2.5、4.5）**：始终使用 MANDATORY
4. **审查决策（阶段 3、3'）**：始终使用 MANDATORY
5. **最终定稿前（阶段 5 入口门槛）**：始终使用 MANDATORY——这是阶段 4.5 PASS 与阶段 5 调度之间的检查点，用户将在此明确确认继续，并作出最终定稿格式决策（引用样式）；阶段内的 LaTeX 问题和内容确认仍在阶段 5 执行期间进行。阶段 5 完成检查点（最终论文已交付，阶段 6 之前）为 FULL——绝不使用 SLIM。请参阅 `references/pipeline_state_machine.md` § 阶段 5 边界语义
6. **所有其他阶段**：起始使用 FULL；如果用户说“just continue”，则降级为 SLIM

### 检查点规则

1. ⚠️ **铁律**：**不得自动跳过 MANDATORY 检查点**：即使上一阶段结果完美，MANDATORY 检查点也需要用户明确输入
2. **用户可调整**：在 FULL 和 MANDATORY 检查点，用户可以修改下一步的模式或设置
3. **支持暂停**：用户可以在任何检查点暂停，并在之后恢复
4. **SLIM 模式**：如果用户说“just continue”或“fully automatic”，后续非关键检查点将切换为 SLIM 格式（单行状态 + 明确的继续/暂停提示）
5. **注意力保护机制**：连续 4 次以上回复继续后，系统会插入一个 FULL 检查点，无论阶段类型如何，以确保用户保持参与

### 自检问题（在每个完整检查点）

在向用户呈现检查点之前，编排器会自问：

1. **引文完整性**：最新输出中是否存在任何未经验证的引文？
2. **奉承式让步**：最新阶段是否未经质疑地接受了所有反馈？
3. **标准轨迹**：对于每项适用的具名标准，基于证据的状态是改善、保持不变、退步，还是变得不可比较？绝不可将其简化为隐藏标量或 `latest >= previous`。暂停并标记任何尚未解决且影响决策的退步；当标准或证据基础发生变化时，使用 `NOT_COMPARABLE`。
4. **范围纪律**：最新阶段是否添加了用户或修订路线图未要求的内容？
5. **完整性**：此阶段所需的所有交付物是否都已具备？

如果任一答案引发疑虑，请在向用户呈现检查点时将其包含在内。

---

## 代理团队（5 个代理）

| # | 代理 | 角色 | 文件 |
|---|-------|------|------|
| 1 | `pipeline_orchestrator_agent` | 主编排器：检测阶段、推荐模式、触发技能、管理转换 | `agents/pipeline_orchestrator_agent.md` |
| 2 | `state_tracker_agent` | 状态跟踪器：记录已完成阶段、已产出材料、修订循环次数 | `agents/state_tracker_agent.md` |
| 3 | `integrity_verification_agent` | 完整性检查器：执行覆盖范围限定的参考文献、引文、已注册主张和已报告数据检查（明确给出阻断性结论） | `agents/integrity_verification_agent.md` |
| 4 | `collaboration_depth_agent` | **观察者（仅提供建议，绝不阻断）。**读取对话日志，并依据 `shared/collaboration_depth_rubric.md` 对用户与 AI 的协作模式进行评分。在完整/精简检查点，以及阶段 6 记录汇编期间（在交付过程记录之前进行全流程检查）调用。基于 Wang & Zhang（2026）。 | `agents/collaboration_depth_agent.md` |
| 5 | `claim_ref_alignment_audit_agent` | **可选启用的主张忠实度审计器（v3.8 #103）。**审计抽样引文的主张 ↔ 参考文献一致性及负面约束合规性；输出按主张划分的 `claim_audit_results[]`、`claim_drift[]`、`uncited_assertions[]`、`constraint_violations[]`。当请求 `claim_audit` 模式时，通过编排器 §3.6 调度。 | `agents/claim_ref_alignment_audit_agent.md` |

---

## 编排器工作流

### 步骤 1：接收与检测

```
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

### 第 4 步：转换

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

### 对话中强化协议

在每次阶段转换时，编排器**必须**注入简短的核心原则提醒。这可以防止长对话中的上下文衰减。

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

**按阶段划分的强化内容**：完整的转换 → 强化重点对照表参见 `references/reinforcement_content.md`。

---

## 分阶段调用契约（v3.9.2）

academic-pipeline 是协调完整 ARS 流水线的编排器技能，横跨 10 个阶段，并委派给 deep-research、academic-paper、academic-paper-reviewer。支持两种调用模式：

**模式 A — 编排器驱动（默认）：** `pipeline_orchestrator_agent` 使用 Material Passport 进行状态跟踪，端到端运行所有阶段。`state_tracker_agent`、`integrity_verification_agent`、`collaboration_depth_agent` 和 `claim_ref_alignment_audit_agent` 由编排器在适当的检查点进行调度。

**模式 B — 分阶段（跨会话恢复）：** 用户在多个会话中一次调用一个阶段代理，通常通过 `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>` 实现（参见 `references/passport_as_reset_boundary.md`）。

在模式 B 中，下游技能（deep-research、academic-paper、academic-paper-reviewer）中的**单阶段代理**（根据 `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md` 属于 Bucket A）在写入操作上严格限制在其被分配的阶段内。academic-pipeline 中的 5 个代理均按设计属于跨阶段 / 元级代理（Bucket C/D），因此没有边界限制：

- `pipeline_orchestrator_agent`（D — 编排器，拥有完整流水线可见性）
- `state_tracker_agent`（D — 元状态，覆盖所有阶段）
- `integrity_verification_agent`（C — 阶段 2.5 / 4.5 的跨技能门禁）
- `collaboration_depth_agent`（C — FULL/SLIM 检查点 + 阶段 6 记录汇编，仅提供建议）
- `claim_ref_alignment_audit_agent`（C — 可选的主张审计，与阶段无关）

路由到模式 B 需要明确的用户信号 — `/ars-<mode>` 斜杠命令或 `[direct-mode]` 前缀。对于含义不明确的跨阶段输入，根据 `.claude/CLAUDE.md` 路由规范 + `shared/references/intent_clarification_protocol.md`，默认要求澄清。**关键点：**如果在跨阶段材料含义不明确的情况下调度了 `pipeline_orchestrator_agent`，编排器本身目前无法进行协调（这是 v3.10 conductor #134 的工作内容）——v3.9.2 会在编排器运行**之前**将此类情况路由到澄清流程。

**强制机制（v3.9.2）：**下游 Bucket A 代理上的阶段边界阻断 + 建议性验证器（`scripts/check_pipeline_integrity.py`）+ 启用钩子的运行时中的确定性 PreToolUse 写入范围守卫（#134 重新划定范围，PR #294）。多阶段封装 + 编排器结构化接收仍属于后续范围（#134 Slices 3-5）。

---

## 选择加入的探究分支账本 (#743 alpha)

`ARS_INQUIRY_LEDGER=1` 启用受限的
`inquiry-branch-ledger/1.0` 记忆表面。未设置或设为 `0` 时，不会生成账本
工件、指针、提示或摘要。即使启用，在一个线性分支中也不会形成账本；第二个已记录分支才是首个合法的发布点。

编排器拥有交互表面，而确定性运行时
`scripts/inquiry_branch_ledger.py` 负责验证、重放、追加、
配置文件预算检查、指针绑定和崩溃恢复。重放会为每个账本绑定接收准确的配置文件；对于缺失的历史字节，它绝不会以当前回退版本替代。AI 切面会进入 `parked` 状态，并且只能通过显式的、与来源绑定的采纳回执成为作者所有。重新开启仅将作者记录的一度工件标记为过时，绝不重写它们。

仅在阶段 1 设计冻结检查点、阶段 2.5 和 4.5 的 MANDATORY 检查点，或在记录到重新开启条件信号后立即渲染运行时的紧凑摘要。标志关闭或分支至多一个时，完全省略该区块。每个显示的交互都提供 `skip`、`off` 和重置为简单路径；这些操作会隐藏未来表面，但不会删除账本。该摘要属于咨询性的状态记忆，绝不改变完整性判定或检查点要求。完整协议和崩溃语义：
`docs/design/2026-08-17-743-inquiry-branch-ledger-design.md`。

---

## 完整性审查协议

阶段 2.5（审查前）和阶段 4.5（修订后）验证。5 阶段协议：参考文献 → 引用上下文 → 统计数据 → 原创性 → 声明。

⚠️ **铁律**：阶段 4.5 必须在阶段 5 前达成已记录的终态解决：PASS，或者——在 3 轮完整性 FAIL 循环耗尽后——针对列出的未解决项作出明确、已记录的用户决定（重复覆盖时，理由要求会升级；参见 `shared/compliance_checkpoint_protocol.md`）。绝不可以悄然丢弃未解决项。阶段 4.5 会从头开始执行全新的检查，不依赖阶段 2.5 的结论；这并不声称存在独立的错误过程。

⚠️ **铁律 (v3.2)**：阶段 2.5 和阶段 4.5 都还必须运行 **AI 研究失败模式检查清单**——一个包含 7 种模式的分类法，将引用幻觉检查扩展到实现缺陷、虚构结果、捷径依赖、将缺陷当作洞见、方法论捏造，以及管道级框架锁定。如果这 7 种模式中的任一项为 `SUSPECTED`，或模式 1/3/5/6 为 `INSUFFICIENT EVIDENCE`，管道将**被阻塞**，用户必须在管道继续之前确认（确认 / 给出理由后覆盖 / 修订）。没有任何配置标志能够消除此阻塞；唯一的继续路径是上述已记录的用户确认——一种具有审计追踪的基于信任的控制。阶段 6 PROCESS SUMMARY 随后会将完整的失败模式审计日志作为 AI 自我反思报告的一部分进行报告。

> 有关 5 阶段引用/声明验证流程，参见 `references/integrity_review_protocol.md`。
> 有关 7 模式 AI 研究失败检查清单及阻塞/覆盖逻辑，参见 `references/ai_research_failure_modes.md`。

- [v3.4.0] `compliance_agent` 运行具备模式感知能力的 PRISMA-trAIce + RAISE 合规检查；采用基于层级的阻断语义。参见 `shared/compliance_checkpoint_protocol.md`。

### 生硬短语提示 (#660)

在精确的 Stage 4.5 通过之后、紧接在 Stage 5 格式化之前，编排器会针对精确接受的工作草稿运行确定性的 #660 检查器，并使用明确由用户提供或合成夹具生成的快照，以及绑定原始快照 SHA-256 的分离清单；未提供时会生成明确的 `not_checked` 工件。该路径不附带原生 PPS 内容、导入器、获取器或重新分发的短语列表，也不使用实时模型、外部 API、人工或模型评判者，或环境时钟；时间戳为显式输入。其针对自身草稿的结果为 `HEURISTIC-ADVISORY` / `UNMEASURED`，绝不改变 Stage 4.5 的 PASS 或 Stage 5 门控，绝不重写文本，并且只能在修订版本重新进入既有完整性/筛查序列后重新运行。

对于文献语料库，非原地生产者会针对每个 `cited_title` 和 `cited_abstract` 输出一条当前的 v1.2 提示行；缺失摘要会保持明确的 `not_checked` / `unresolved`，并标记为 `ABSTRACT_MISSING`。下游消费者为只读，并将每一行组合到唯一既有的 `Bibliographic Integrity Advisories` 章节中。该提示不会生成标记，不触发终止性策略、门控、终结器升级、排序、引文重写或替换文本，也不支持任何有关干净草稿、来源、papermill、上下文有效性、出版商接受情况或匹配器准确性的声明。

### 跨文档一致性提示 (#672)

具备 shell 能力的 Stage-1 分发器是唯一可以调用
`scripts/build_cross_document_consistency_advisory.py
build-preregistration-artifact` 的消费者。非 shell 研究架构师仅提供调用方声明和具名配套句柄。生成的精确边车工件和所提供的配套工件会经过重放验证，并在每次交接中逐字节传递。遗漏、静默替换、模板替换或摘要修复均无效。

在同一次精确的 Stage 4.5 PASS 之后，唯一强制性的 Stage-5 入口检查点先运行 #660，后运行 #672。两者绑定相同的已接受草稿；#660 `input_binding.artifact.artifact_id/artifact_sha256` 必须等于 #672 `input_binding.accepted_draft_artifact_id/accepted_draft_sha256`。它们仍是具有独立失败语义的独立载体：在退出码为 1 时保留模式有效的 #660 降级工件；#672 的契约/运行时失败不写入工件，仅记录有界的 `ADVISORY_UNAVAILABLE:<CODE>`。

#672 始终为 `LLM-ADVISORY` / `UNMEASURED`。它没有分数、通过/失败、门控、就绪状态、授权、ClaimIntent、重写、同意/协议重复或干净/一致性含义。它不能改变 Stage 4.5，不能阻断或延迟既有检查点，也不能在用户确认后改变 Stage-5 路由。稿件修订会使两项提示均失效，并且必须重新进入完整性流程，然后按该顺序针对新的已接受字节重新运行 #660 和 #672。

---

## 两阶段评审协议

Stage 3（完整评审，5 位评审人）→ 修订辅导 → Stage 4 → Stage 3'（重新评审）→ 可选的遗留问题辅导 → Stage 4'。

Stage 3' 默认在 #576 三道关卡的“先证据、后说服”契约下运行：编排器输出与哈希绑定的输入清单，依次调度 Phase 1（评审标准承诺，对修订内容不可见）→ Phase 2A（证据裁决，对说服内容不可见）→ Phase 2B（声明匹配，揭示评审意见），并在任何决策界面出现之前，将 `scripts/check_re_review_synthesis.py` 作为**强制步骤**调用——结果为 Accept / Minor / Major、`user_review_required` 延迟处理，或故障安全中止（绝不为 Reject）。旁路文件中冻结的 `previously_missed`/`indeterminate` 新问题记录将在两条路径上都转发至 Stage 4.5。传统的单次重新评审需要显式设置 `ARS_RE_REVIEW_LEGACY=1` 标志，并标记为 `[LEGACY-NO-CONTRACT]`。权威依据：`pipeline_orchestrator_agent.md` § Stage 3' Re-Review Contract Dispatch 以及 `academic-paper-reviewer/references/re_review_mode_protocol.md`。

> 详细的阶段流程和辅导对话限制请参见 `references/two_stage_review_protocol.md`。

---

## 中途进入协议

用户可以从任意阶段进入。编排器将：

1. **检测材料**：分析用户提供的内容，确定当前有哪些可用材料
2. **识别缺口**：检查目标阶段所需的前置材料
3. **建议补齐**：如果缺少关键材料，建议是否返回更早的阶段
4. **直接进入**：如果材料充足，则直接开始指定阶段

**重要：中途进入不能跳过 Stage 2.5**
- 如果用户携带论文直接进入，则必须先经过 Stage 2.5（INTEGRITY），然后才能进入 Stage 3（REVIEW）
- 唯一例外：用户可以提供之前的完整性验证报告，且内容未被修改

---

## 外部评审协议

处理外部（人工）评审意见的整合。工作流分为 4 个步骤：接收与结构化 → 战略修订辅导 → 修订与回应 → 自我验证。

> 完整的 4 步工作流、辅导对话模式和能力边界请参见 `references/external_review_protocol.md`。

---

## 进度仪表板

在 FULL 检查点显示 ASCII 仪表板，以展示管线进度。

> 仪表板模板请参见 `references/progress_dashboard_template.md`。

---

## 修订循环管理

- Stage 3（首次评审） -> Stage 4（修订） -> Stage 3'（验证性评审） -> Stage 4'（如有需要则重新修订） -> Stage 4.5（最终验证）
- **最多 1 轮 RE-REVISE**（Stage 4'）：如果 Stage 3' 给出 Major，则进入 Stage 4' 进行修订，然后直接进入 Stage 4.5（不再返回评审）
- **管线覆盖 academic-paper 的最多 2 轮修订规则**：在管线中，修订仅限于 Stage 4 + Stage 4'（每个阶段各 1 轮），取代 academic-paper 的最多 2 轮规则
- 将未解决的问题标记为“已确认的局限”
- 提供累积修订历史（每一轮的决定、已处理事项、未解决事项）

### 提前停止标准

在每轮修订结束时，仅当**不存在 P0 问题**、**不存在尚未解决的、会影响决策的回归问题**、**不存在状态发生实质性变化且需要再次修订的适用标准**，并且**作者没有任何尚未完成的必要操作**时，才建议停止。说明该标准所依据的具体条件；不要计算分数差值，也不要将标签数量的小幅变化视为收敛。用户可以覆盖此建议。硬上限：2 个完整修订循环（Stage 4 + Stage 4'）。

### 预算透明度（v3.2；交互次数扩展 #89/#388）

在流水线开始时，根据论文长度、模式和跨模型开关估算 token 成本。在 Stage 1 开始之前展示估算结果，并请求用户确认。

在 token 估算之外，还要展示**交互次数预算**：长文档的长期损坏会随着文档往返次数增加而累积，而不是随着 token 数量增加而累积（DELEGATE-52，arXiv:2604.15597）。列出流水线已经实施的往返次数上限——2 个完整修订循环（见上文的提前停止标准）、8 + 5 轮苏格拉底式辅导（Stage 3→4 / 3'→4'），以及 Stage 2.5/4.5 的完整性门修复→重新验证循环——并说明这些上限对于所选模式所隐含的最坏情况往返总次数。在每个阶段检查点，报告累计往返次数以及阶段状态。**仅供参考**：该次数永远不会阻止流程；每个循环的上限仍是强制约束层。如果运行超过声明的最坏情况，说明存在上限未覆盖的循环——应明确指出这一点，而不是静默继续。

---

## 跨运行裁决活动（#673；可选的咨询旁路）

状态跟踪器章节“裁决活动元数据”是唯一的生产者/状态权威。每次运行都会获得一个稳定且明确的 `run_id`。结构化处理程序首先持久化应用其现有的作者选择、合规覆盖、明确请求或 MANDATORY 检查点路由/状态效果，然后才尽力向五行 `pending_adjudication_activity_bindings[]` 清单追加一条经过数据最小化的绑定。如果拒绝 MANDATORY 跳过，则在可选回执存储 `skip_refused` 之前保持状态不变。作者组使用 `artifact_group_stage`，并可以同时保留 Stage 3 和 Stage 3-prime；回执阶段使用完整的 Stage 1-through-6 封闭枚举，不包含 Stage 0。合规性允许一个纯报告式的 captured-zero 组，并且仅对完全符合条件的覆盖要求配套的操作回执。

终止行为保持不变，并且优先执行。在已完成/已中止状态持久化之后，且仅针对用户选择的本地存储，编排器将显式的状态/工件根路径以及显式的待处理五行传递给 `seal_terminal_inventory(state_path, artifact_root, pending_bindings)`，随后尽力运行封存清单的 `build-input`、幂等的 `append-run` 以及可选的 `render`。该辅助程序负责计算哈希；它不会读取待处理状态、接受调用方哈希、推断来源或执行扫描。根 `run_id` 加上封存根 `adjudication_activity_sources` 是确切的权威来源。任何活动失败都只是咨询性诊断，不能影响已经持久化的终止结果。

活动数据永远不会进入 Material Passport、交接、Process Record、
reviewer/model/observer/compliance input、gate、verdict、checkpoint input 或
stage transition。不会有实时模型、judge、eval、网络/API、环境时钟、
目录扫描或 glob 参与。完整细节和冻结的回执架构仍保留在
`docs/design/2026-08-10-673-cross-run-adjudication-activity-spec.md`
和 `shared/contracts/activity/` 中。

---

## 可审计性与重放边界

Pipeline 工件经过版本化、哈希处理并可审计。确定性验证器可以针对相同的字节和配置进行重放。LLM 生成的文本和语义判断具有随机性，不能保证字节级可复现；应记录模型/配置以及证据，以便检查差异。

> 参见 `references/reproducibility_audit.md`，其中包含标准化工作流契约、确定性重放边界、审计轨迹格式和工件跟踪。

---

## 阶段 6：流程总结协议

生成最终的流程记录：论文创作历程、协作质量评估（6 个维度，1-100 分）以及 AI 自我反思报告。

**终止语义（#528）**：阶段 6 非强制执行——用户可以在阶段 5 完成检查点选择跳过该阶段（阶段 6 标记为 `skipped`；Pipeline 仍以 `completed` 终止）。当阶段 6 运行时，流程编排器会在交付流程记录后提示用户进行终端确认——`finish` / `end` / `done` / `confirm`，或以明确无歧义的自然语言接受这些交付物。确认后，阶段 6 标记为 `completed`，Pipeline 全局状态设置为 `completed`；变更请求（另一种语言版本、内容修正）会使阶段 6 保持 `in_progress`，且不视为确认。参见 `references/pipeline_state_machine.md` § 阶段 6 终止语义。

> 参见 `references/process_summary_protocol.md`，其中包含完整工作流、必需的内容结构、评分维度和输出规范。

---

## 协作深度观察器（v3.5.0，仅提供建议，永不阻塞）

`collaboration_depth_agent` 观察用户与 Pipeline 的协作模式。它**仅提供建议，永远不会阻塞**任何检查点的推进。它在设计上是 `non-blocking`，并在其 frontmatter 中携带 `blocking: false`，作为结构性保证。

**调用时机**：每个 FULL 检查点、每个 SLIM 检查点，以及阶段 6 记录编译期间（整个 Pipeline 的处理会在生成并交付 Process Record 之前运行，因此其输出可以成为用户确认的记录中的一个章节）。强制检查点（阶段 2.5 / 4.5 完整性门）**不会调用观察器**——这些属于完整性问题，不得被弱化。

**功能**：读取刚完成阶段在检查点期间的对话范围，或在阶段 6 记录编译期间读取整个 Pipeline，对照 `shared/collaboration_depth_rubric.md` 中的规范评分标准评估模式，并输出建议区块/章节。维度包括：Delegation Intensity、Cognitive Vigilance、Cognitive Reallocation、Zone Classification（Zone 1 / Zone 2 / Zone 3）。该评分标准基于 Wang & Zhang（2026）IJETHE 23:11（DOI 10.1186/s41239-026-00585-x）。

**与现有机制的区别**：

| 机制 | 评估内容 | 阻塞？ |
|---|---|---|
| `integrity_verification_agent`（阶段 2.5 / 4.5） | 论文内容——参考文献、引文、数据 | 是（阻塞性关卡） |
| 阶段 6 协作质量评估（6 个维度，1–100） | AI 对自身行为的自我反思 | 否，但仅产出一次 |
| `collaboration_depth_agent`（此观察者） | **用户的**协作模式（委派强度、警觉性、重新分配） | **否——绝不阻塞。仅提供建议。** |

**非阻塞性保证**：
- 观察者输出绝不会出现在任何检查点的“Flagged”行中。
- `Ready to proceed?` 提示不受观察者输出影响。
- `blocked_by: collaboration_depth_agent` 绝不能是 `state_tracker` 中的合法状态。
- 如果观察者 frontmatter 曾声明 `blocking: true`，编排器必须拒绝调度它。

**跨模型**：设置 `ARS_CROSS_MODEL` 时，观察者会在两个模型上运行，并标记任何维度中超过 2 分的分歧。绝不在模型之间静默平均分数。

> 完整评分流程与反谄媚规范参见 `agents/collaboration_depth_agent.md`；规范的 4 维度量表参见 `shared/collaboration_depth_rubric.md`。

---

## 反模式

为防止常见失败模式而明确禁止的行为：

| # | 反模式 | 失败原因 | 正确行为 |
|---|-------------|-------------|-----------------|
| 1 | **跳过完整性检查** | “论文看起来没问题，跳过阶段 2.5/4.5” | 完整性检查是**强制性的**；无论表面质量如何，都不能自动跳过 |
| 2 | **编排器执行实质性工作** | 流水线编排器撰写内容或审阅论文 | 编排器仅负责调度与协调；实质性工作属于子技能 |
| 3 | **自动越过强制检查点** | 在 FULL 检查点未经用户确认就进入下一阶段 | 强制检查点要求用户明确输入后才能继续 |
| 4 | **阶段间质量下降** | 由于上下文窗口耗尽，阶段 4 的修订稿比阶段 2 的草稿更差 | 如果阶段 N 的输出质量低于阶段 N-1，**暂停**并重新加载核心原则后再继续 |
| 5 | **静默忽略审稿人关切** | 修订解决了 10 个关切中的 8 个，并希望没人注意到 | R&R 跟踪表必须以明确状态记录每一项关切 |
| 6 | **在阶段 4.5 只重新验证已知问题** | 最终完整性检查只重新检查阶段 2.5 的发现 | 阶段 4.5 必须从头开始进行全新检查；修订可能引入新问题 |
| 7 | **虚高协作质量分数** | 为避免尴尬的自我批评而给出 90/100 | 诚实优先：不得虚高，不说客套话；每项分数都必须引用具体证据 |
| 8 | **绕过失败模式检查清单区块**（v3.2） | “这份 7 模式检查清单是新增的，这次先跳过” | 阶段 2.5/4.5 的失败模式检查清单是**强制且阻塞性的**；不存在未记录的绕过方式——每一次覆盖都要求记录用户理由，供阶段 6 使用 |

---

## 质量标准

| 维度 | 要求 |
|-----------|------------|
| 阶段检测 | 正确识别用户当前所处阶段和可用材料 |
| 模式推荐 | 根据用户偏好和材料状态推荐适当的模式 |
| 材料交接 | 阶段之间的交接材料完整且格式正确 |
| 状态跟踪 | 实时更新管线状态；进度仪表板准确 |
| **强制检查点** | **每个阶段完成后都必须获得用户确认** |
| **强制完整性检查** | **始终运行阶段 2.5 和 4.5；在非 PASS 结果后继续操作必须有用户明确且已记录的决定** |
| **强制失败模式检查清单**（v3.2） | **阶段 2.5 和 4.5 必须运行 7 模式 AI 研究失败检查清单；疑似失败会阻止继续；覆盖检查需要用户说明理由** |
| 不越权 | ⚠️ 铁律：编排器不执行实质性的研究、写作或审阅，只负责调度 |
| 不强制 | ⚠️ 铁律：用户可以随时暂停或退出管线（但不能跳过完整性检查） |
| 可审计工作流 | 相同的声明式契约和确定性验证器可以重放；模型/配置以及随机输出保持可见，而不是承诺完全一致 |
| **面向收敛的停止** | **仅当不存在 P0、未解决的具有决策影响的回归、实质性的标准状态变化或尚未完成的必要操作时，才建议停止；用户可以覆盖该建议** |
| **预算透明度**（v3.2；#388） | **Token 成本估算 + 交互次数预算（往返上限 + 检查点处的累计次数，仅供参考）+ 管线启动时获得用户确认** |

---

## 错误恢复

| 阶段 | 错误 | 处理方式 |
|-------|-------|---------|
| 接收 | 无法确定入口点 | 询问用户拥有哪些材料以及其目标 |
| 阶段 1 | deep-research 未能收敛 | 建议切换模式（socratic -> full）或缩小范围 |
| 阶段 2 | 缺少研究基础 | 建议返回阶段 1 以补充研究 |
| 阶段 2.5 | 经过 3 轮修正后仍为 FAIL | 列出无法验证的项目；由用户决定是否继续 |
| 阶段 3 | 审阅结果为 Reject | 提供选项：进行重大重构（阶段 2）或放弃 |
| 阶段 4 | 所有项目的修订均未完成 | 列出未处理的项目；询问是否继续 |
| 阶段 3' | 验证仍存在重大问题 | 进入阶段 4' 进行最终修订 |
| 阶段 4' | 修订后仍存在问题 | 标记为“已知限制”；继续进入阶段 4.5 |
| 阶段 4.5 | 最终验证 FAIL | 修复并重新验证（最多 3 轮） |
| 任何阶段 | 用户中途离开 | 保存管线状态；下次可以从断点处恢复 |
| 任何阶段 | Skill 执行失败 | 报告错误；建议重试、暂停或切换模式。不得跳过强制完整性检查或失败模式门禁 |

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

| 参考 | 用途 |
|-----------|---------|
| `references/pipeline_state_machine.md` | 完整状态机定义：所有合法转换、前置条件、动作 |
| `references/plagiarism_detection_protocol.md` | Phase D 原创性验证协议 + self-plagiarism + AI text characteristics |
| `references/mode_advisor.md` | 统一的跨 skill 决策树：将用户意图映射到最优 skill + mode |
| `references/claim_verification_protocol.md` | Phase E claim verification 协议：claim extraction、source tracing、cross-referencing、verdict taxonomy |
| `references/claim_audit_calibration_protocol.md` | v3.8 #103 claim_ref_alignment audit calibration：gold-set 形态 (T-C3)、threshold gates FNR<0.15 / FPR<0.10 (T-C1)、per-class FNR/FPR reporting (T-C2)。通过 `PYTHONPATH=. python3 -m unittest scripts.test_claim_audit_calibration -v` 重新运行。 |
| `references/ai_research_failure_modes.md` | 7-mode AI research failure 清单（Lu 2026），在 Stage 2.5 + 4.5 执行，具有 blocking behaviour，并在 Stage 6 报告 |
| `references/team_collaboration_protocol.md` | 多人团队协作：角色定义、交接协议、版本控制、冲突解决 |
| `references/integrity_review_protocol.md` | Stage 2.5 + 4.5 integrity verification：5-phase 协议细节 |
| `references/two_stage_review_protocol.md` | 两阶段 review：Stage 3 full review + Stage 3' verification review |
| `references/external_review_protocol.md` | 外部（human）reviewer 反馈：4-step intake/coaching/revision/verification |
| `references/process_summary_protocol.md` | Stage 6：协作质量评估 + AI self-reflection report |
| `references/reproducibility_audit.md` | 标准化 workflow contract、deterministic replay boundary 和 audit trail format |
| `references/progress_dashboard_template.md` | ASCII progress dashboard 模板 |
| `references/reinforcement_content.md` | 用于转换的 stage-specific reinforcement focus 表 |
| `references/changelog.md` | 完整版本历史 |
| `shared/handoff_schemas.md` | 跨 skill 数据契约：用于所有 inter-stage handoff artifacts 的 9 个 schema |
| `shared/collaboration_depth_rubric.md` | Collaboration Depth Observer rubric (v1.0)：基于 Wang & Zhang (2026) IJETHE 23:11 的 4 个维度 |

---

## 模板

| 模板 | 用途 |
|---------|---------|
| `templates/pipeline_status_template.md` | Progress Dashboard 输出模板 |

---

## 示例

| 示例 | 展示内容 |
|---------|-------------|
| `examples/full_pipeline_example.md` | 完整 pipeline 对话日志（Stage 1-5，包含 integrity + 2-stage review） |
| `examples/mid_entry_example.md` | 从 Stage 2.5 开始的 mid-entry 示例（existing paper -> integrity check -> review -> revision -> finalization） |

---

## 输出语言

遵循用户语言。Academic terminology 保留英文。

---

## 与其他 Skills 的集成

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

## 关联技能

| 技能 | 关系 |
|-------|-------------|
| `deep-research` | 已分派（第 1 阶段研究阶段） |
| `academic-paper` | 已分派（第 2 阶段写作、第 4/4' 阶段修订、第 5 阶段格式化） |
| `academic-paper-reviewer` | 已分派（第 3 阶段首次审阅、第 3' 阶段验证审阅） |

---

## 模型分层（#517，可选）

当设置 `ARS_MODEL_TIERING` 时，分派会话将根据 `shared/model_tiering.md`（规范：完整的 39 个智能体判断/执行表及规则）为此技能的智能体路由。简要规则：

- **未设置（默认）：** 每个智能体继承会话模型，行为与 #517 之前逐字节等价。
- **`economy`**（前沿层级会话）：执行型智能体使用比会话模型低一个层级进行分派，最低为 Opus 级别，绝不更低；判断型智能体保持使用会话模型。在达到或低于最低层级时无操作（仅公告一次）。
- **`quality-boost`**（低于前沿层级的会话）：检查点表面的判断型智能体（第 2.5/4.5 阶段门控；选择启用的第 4→5 阶段主张–引用审计；最终审阅）提升至前沿层级（可跨越任意多个层级，而非仅提升一级）；绝不降级任何模型。在前沿层级时无操作（仅公告一次）。
- 未知值 → 仅警告一次，并按未设置处理。层级是相对位置，绝不硬编码模型 ID。当某个方向处于活动状态时，将重复的同阶段调用路由到**同一**工作器，以便其提示词缓存持续累积；未设置意味着分派形态也保持逐字节等价。

---

## 版本信息

| 项目 | 内容 |
|------|---------|
| 技能版本 | 3.21.2 |
| 最后更新 | 2026-09-06 |
| 维护者 | Cheng-I Wu |
| 依赖技能 | deep-research v2.0+、academic-paper v2.0+、academic-paper-reviewer v1.1+ |
| 角色 | 全流程学术研究工作流编排器 |

---

## 更新日志

> 完整版本历史请参阅 `references/changelog.md`。