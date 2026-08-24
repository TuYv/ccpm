---
name: academic-pipeline
description: "Orchestrator for the full academic research pipeline: research -> write -> integrity check -> review -> revise -> re-review -> re-revise -> final integrity check -> finalize. Coordinates deep-research, academic-paper, and academic-paper-reviewer into a seamless 10-stage workflow with mandatory, coverage-bounded integrity checks, two-stage peer review, and auditable quality-assurance artifacts. Triggers on: academic pipeline, research to paper, full paper workflow, paper pipeline, end-to-end paper, research-to-publication, complete paper workflow, 연구부터 논문까지, 연구 주제 설정부터 논문 완성까지, 논문 전체 워크플로."
metadata:
  version: "3.21.1"
  last_updated: "2026-08-24"
  depends_on: "deep-research, academic-paper, academic-paper-reviewer"
  status: active
  data_access_level: raw
  task_type: open-ended
  related_skills:
    - deep-research
    - academic-paper
    - academic-paper-reviewer
---
# Academic Pipeline v3.21.1 — 完整学术研究工作流编排器

一个轻量级编排器，负责管理从研究探索到最终稿件的完整学术流程。它不执行实质性工作——仅检测阶段、推荐模式、分派技能、管理阶段转换并跟踪状态。

> **路由规范（v3.9.2）：** 有关跨技能路由规则，请参阅 `.claude/CLAUDE.md` 中的“Routing Discipline (v3.9.2)”以及 `shared/references/intent_clarification_protocol.md`。本技能假定路由已经确定——跨阶段的歧义材料应已在上游完成澄清。

**v3.6.3（可选启用）：** 设置 `ARS_PASSPORT_RESET=1`，将 FULL 检查点提升为上下文重置边界。在新会话中使用 `resume_from_passport=<hash>`，即可从记录的阶段继续。参见 [`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md)。

**v3.8（可选启用）：** 设置 `ARS_CLAIM_AUDIT=1`，以在阶段 4 → 阶段 5 的转换过程中启用 L3 声明忠实度审计关卡。设置该标志后，编排器会在 v3.7.1 引用时溯源信息终结器运行之后、`formatter_agent` 的硬性关卡之前分派 `claim_ref_alignment_audit_agent`。该审计会根据 8 行矩阵生成 `claim_audit_results[]` + `uncited_assertions[]` + `claim_drifts[]` + `constraint_violations[]` + `audit_sampling_summaries[]` 聚合结果；HIGH-WARN 类会通过格式化器的 REFUSE 规则 6-10 阻止输出。v3.8.0 中默认关闭——渐进启用计划推迟至获得校准后证据之后（规范 §5 中的模式标志设计理由）。参见 `agents/claim_ref_alignment_audit_agent.md` 和编排器 §3.6 的正文说明。

**v2.0 核心改进**：
1. **强制用户确认检查点**——每个阶段完成后都需要用户确认，才能继续下一步
2. **学术诚信检查**——论文完成后、提交审阅前，运行已声明参考文献、已登记声明和已报告数据检查；明确提供分母、抽样情况、未知状态和阻断性判定
3. **两阶段审阅**——首次完整审阅 + 修订后的重点验证审阅
4. **最终诚信检查**——修订完成后，基于全新输入重新运行最终检查契约；仅当指定的已登记总体被明确确认为完整时，`100%` 才适用
5. **可审计**——对工作流产物进行版本标记、哈希计算和留存；确定性检查可重放，但不承诺生成式输出在字节层面完全一致
6. **过程文档**——阶段 6 生成一份记录人机协作历史的“论文创作过程记录”PDF（在标志流程完成的最终确认之前交付）

## 快速开始

**完整工作流（从零开始）：**
```
I want to write a research paper on the impact of AI on higher education quality assurance
```
--> academic-pipeline 启动，从阶段 1（RESEARCH）开始

**中途进入（已有论文）：**
```
I already have a paper, help me review it
```
--> academic-pipeline 检测到中途进入，从阶段 2.5（INTEGRITY）开始

**修订模式（已收到审稿人反馈）：**
```
I received reviewer comments, help me revise
```
--> academic-pipeline 检测到该请求，从阶段 4（REVISE）开始

**从护照恢复（跨会话上下文重置，可选启用）：**
```
resume_from_passport=<hash> [stage=<n>] [mode=<m>]
```
--> 加载材料护照（Schema 9），定位与 `<hash>` 匹配的 `kind: boundary` 条目，并确认其后不存在使用该条目的 `kind: resume` 条目。如果设置了 `pending_decision`，则会先触发决策提示，以便将用户的分支选择记录到审计账本中；即使用户提供了 `stage=`，也绝不会跳过该提示。完成提示后（如果没有 `pending_decision`，则立即执行），下一阶段按以下顺序确定：(a) 如果提供了 `stage=<n>` CLI 覆盖值，则使用该值；否则，(b) 使用匹配选项的 `next_stage`；否则，(c) 使用边界条目中记录的 `next` 字段。CLI `stage=`/`mode=` 覆盖值的优先级高于选项路由。
- **门控（发出）**：发出边界的会话中必须设置 `ARS_PASSPORT_RESET=1`。如果没有该标志，则不会写入任何 `kind: boundary` 条目，也就没有可供恢复的内容。
- **门控（恢复）**：无需标志。任何会话都可以对包含与该哈希匹配的有效边界条目的护照调用 `resume_from_passport=<hash>`。
- **用途**：在一个*全新的* Claude Code 会话中调用。在发出边界的同一会话中恢复不会节省 token，并且可能丢失会话中仍然有效的上下文。
- **阶段**：任意。根据上述路由规则确定的阶段恢复。
- **参考资料**：[`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md) — 请参阅 §"`resume_from_passport` mode contract"。

**执行流程：**
1. 检测用户当前所处的阶段和可用材料
2. 为每个阶段推荐最佳模式
3. 为每个阶段分派相应的 skill
4. **每个阶段完成后，主动提示并等待用户确认**
5. 全程跟踪进度；可随时查看流水线状态仪表板

---

## 触发条件

### 触发关键词

**英语**：学术流水线、从研究到论文、完整论文工作流、论文流水线、端到端论文、从研究到发表、完整论文工作流

**韩语**：学术流水线、从研究到论文、完整论文工作流、从确定研究主题到完成论文、研究与论文全过程

### 不触发的场景

| 场景 | 要使用的 Skill |
|----------|-------------|
| 只需要搜索资料或进行文献综述 | `deep-research` |
| 只需要撰写论文（不需要研究阶段） | `academic-paper` |
| 只需要评审论文 | `academic-paper-reviewer` |
| 只需要检查引用格式 | `academic-paper`（citation-check 模式） |
| 只需要转换论文格式 | `academic-paper`（format-convert 模式） |

### 触发排除条件

- 如果用户只需要单一功能（仅搜索资料、仅检查引用），则无需使用流水线——直接触发相应的 skill
- 如果用户已经在使用某个 skill 的特定模式，请尊重该入口点；流水线为可选启用
- 流水线是可选的，而非强制的

---

## 流水线阶段（10 个阶段）

| 阶段 | 名称 | 调用的 Skill / Agent | 可用模式 | 交付物 |
|-------|------|---------------------|----------------|-------------|
| 1 | 研究 | `deep-research` | socratic, full, quick | 研究问题简报、方法论、参考文献、综合分析 |
| 2 | 写作 | `academic-paper` | plan, full | 论文草稿 |
| **2.5** | **完整性检查** | **`integrity_verification_agent`** | **pre-review** | **完整性验证报告 + 修正后的论文** |
| 3 | 评审 | `academic-paper-reviewer` | full（包括魔鬼代言人评审） | 5 份评审报告 + 编辑决定 + 修订路线图 |
| 4 | 修订 | `academic-paper` | revision | 修订稿、对评审意见的回复 |
| **3'** | **重新评审** | **`academic-paper-reviewer`** | **re-review** | **验证性评审报告：修订回复核对清单 + 遗留问题** |
| **4'** | **再次修订** | **`academic-paper`** | **revision** | **第二版修订稿（如需要）** |
| **4.5** | **最终完整性检查** | **`integrity_verification_agent`** | **final-check** | **最终验证报告（声明的检查项必须通过；已登记的分母以及未知/超出范围状态保持可见）** |
| 5 | 定稿 | `academic-paper` | format-convert | 最终论文（默认为 MD；如 Pandoc 可用，则通过 Pandoc 生成 DOCX，否则提供转换说明；询问是否需要 LaTeX；确认正确性；PDF） |
| **6** | **过程总结** | **orchestrator** | **auto** | **论文创作过程记录 MD + LaTeX 转 PDF（双语）** |

**并行化机会（v3.3）**：在阶段 2 中，`academic-paper` Skill 的阶段 1（literature_strategist_agent）和 `visualization_agent` 可以在阶段 2（structure_architect_agent）完成大纲后并行运行。具体而言：
- 一旦大纲包含可视化计划，`visualization_agent` 即可开始生成图表
- 同时，`argument_builder_agent` 可以构建 CER 链
- `draft_writer_agent` 会等待二者均完成后再开始阶段 4

这与 PaperOrchestra 在大纲（步骤 1）完成后并行执行图表生成（步骤 2）和文献综述（步骤 3）的方式一致，可降低流水线的整体延迟。并行化是可选的——为简单起见，默认仍采用顺序执行。

---

## 流水线状态机

1. **阶段 1 研究** -> 用户确认 -> 阶段 2
2. **阶段 2 写作** -> 用户确认 -> 阶段 2.5
3. **阶段 2.5 完整性检查** -> 通过 -> 阶段 3（失败 -> 修复并重新验证，最多 3 轮；之后进入完整性检查失败循环 -> 记录用户决定）
4. **阶段 3 评审** -> 接受 -> 阶段 4.5 / 小修|大修 -> 阶段 4 / 拒稿 -> 阶段 2 或结束
5. **阶段 4 修订** -> 用户确认 -> 阶段 3'
6. **阶段 3' 重新评审** -> 接受|小修 -> 阶段 4.5 / 大修 -> 阶段 4'
7. **阶段 4' 再次修订** -> 用户确认 -> 阶段 4.5（不再返回评审）
8. **阶段 4.5 最终完整性检查** -> 通过（零问题）-> 阶段 5（失败 -> 修复并重新验证；3 轮后仍未解决 -> 进入完整性检查失败循环 -> 记录用户决定）
9. **阶段 5 定稿** -> MD -> 如 Pandoc 可用，则通过 Pandoc 生成 DOCX（否则提供说明）-> 询问是否需要 LaTeX -> 确认 -> PDF -> 完成检查点（完整模式）-> 阶段 6（用户可以拒绝阶段 6：标记为 `skipped`，流水线直接进入 `completed`）
10. **阶段 6 过程总结** -> 询问语言版本 -> 生成过程记录 MD -> LaTeX -> PDF -> 终止确认（`finish` / `end` / `done` / `confirm`，或含义明确的自然语言等效表达）-> 流水线全局状态 `completed`

完整的状态转换定义请参见 `references/pipeline_state_machine.md`。

---

## 自适应检查点系统

⚠️ **铁律 — 核心规则：每个阶段完成后，系统必须主动提示用户并等待确认。检查点的呈现方式会根据上下文和用户参与度进行调整。**

### 检查点类型

| 类型 | 使用时机 | 内容 |
|------|-----------|---------|
| FULL | 第一个检查点；完整性边界之后；阶段 5 完成时（最终交付物验收） | 完整交付物列表 + 决策面板 + 所有选项 |
| SLIM | 在非关键阶段连续收到 2 次以上“继续”响应后 | 单行状态 + 明确的继续/暂停提示 |
| MANDATORY | 完整性检查 FAIL；审查决策；阶段 5 入口门禁（最终定稿之前） | 不可跳过；需要用户明确输入 |

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
2. **连续 2 次以上未经审查便选择“继续”之后**：提示用户注意（“您已连续选择继续 [N] 次。是否要查看进度？”）
3. **完整性边界（阶段 2.5、4.5）**：始终为 MANDATORY
4. **审查决策（阶段 3、3'）**：始终为 MANDATORY
5. **最终定稿之前（阶段 5 入口门禁）**：始终为 MANDATORY — 这是阶段 4.5 PASS 与阶段 5 分派之间的检查点，用户需在此明确确认继续，并作出最终定稿格式决策（引用格式）；阶段内的 LaTeX 问题和内容确认仍保留在阶段 5 的执行过程中。阶段 5 完成检查点（最终论文已交付，进入阶段 6 之前）为 FULL — 绝不使用 SLIM。参见 `references/pipeline_state_machine.md` § 阶段 5 边界语义
6. **所有其他阶段**：从 FULL 开始；如果用户说“直接继续”，则降级为 SLIM

### 检查点规则

1. ⚠️ **铁律**：**不得自动跳过 MANDATORY 检查点**：即使前一阶段的结果完美无缺，在 MANDATORY 检查点仍需用户明确输入
2. **用户可调整**：在 FULL 和 MANDATORY 检查点，用户可以修改下一步的模式或设置
3. **便于暂停**：用户可以在任何检查点暂停，并在之后恢复
4. **SLIM 模式**：如果用户说“直接继续”或“全自动”，后续非关键检查点将切换为 SLIM 格式（单行状态 + 明确的继续/暂停提示）
5. **参与度保障机制**：连续 4 次以上收到继续响应后，无论阶段类型如何，系统都会插入一个 FULL 检查点，以确保用户仍保持参与

### 自检问题（在每个 FULL 检查点执行）

在向用户展示检查点之前，编排器会自问：

1. **引用完整性**：最新输出中是否存在任何未经核实的引用？
2. **迎合性让步**：最新阶段是否毫无异议地接受了所有反馈，而未提出任何不同意见？
3. **标准变化轨迹**：对于每项适用的具名标准，以证据为依据的状态是改善、保持不变、退步，还是变得不可比较？绝不能将其简化为隐藏的标量或 `latest >= previous`。如存在任何尚未解决且会影响决策的退步，应暂停并予以标记；当标准或证据基础发生变化时，使用 `NOT_COMPARABLE`。
4. **范围约束**：最新阶段是否添加了用户或修订路线图未要求的内容？
5. **完整性**：本阶段要求的所有交付物是否均已提供？

如果任何回答引发疑虑，请在向用户展示检查点时将其包含在内。

---

## 智能体团队（5 个智能体）

| # | 智能体 | 职责 | 文件 |
|---|-------|------|------|
| 1 | `pipeline_orchestrator_agent` | 主编排器：检测阶段、推荐模式、触发技能、管理转换 | `agents/pipeline_orchestrator_agent.md` |
| 2 | `state_tracker_agent` | 状态跟踪器：记录已完成的阶段、已生成的材料、修订循环次数 | `agents/state_tracker_agent.md` |
| 3 | `integrity_verification_agent` | 完整性检查器：执行受覆盖范围约束的参考文献、引用、已登记声明及报告数据检查（明确给出阻断性判定） | `agents/integrity_verification_agent.md` |
| 4 | `collaboration_depth_agent` | **观察者（仅提供建议——绝不阻断）。**读取对话日志，并依据 `shared/collaboration_depth_rubric.md` 对用户与 AI 的协作模式进行评分。在 FULL/SLIM 检查点以及阶段 6 记录汇编期间调用（对整个流程进行检查，在交付流程记录之前）。基于 Wang & Zhang（2026）。 | `agents/collaboration_depth_agent.md` |
| 5 | `claim_ref_alignment_audit_agent` | **选择启用的声明忠实度审计器（v3.8 #103）。**审计抽样引用的声明 ↔ 参考文献一致性及负向约束合规性；输出逐项声明的 `claim_audit_results[]`、`claim_drift[]`、`uncited_assertions[]`、`constraint_violations[]`。请求 claim_audit 模式时，由编排器通过 §3.6 调度。 | `agents/claim_ref_alignment_audit_agent.md` |

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

### 步骤 2：模式推荐

```
Based on entry point and user preferences, recommend modes for each stage:

User type determination:
- Novice / wants guidance --> socratic (Stage 1) + plan (Stage 2) + guided (Stage 3)
- Experienced / wants direct output --> full (Stage 1) + full (Stage 2) + full (Stage 3)
- Time-limited --> quick (Stage 1) + full (Stage 2) + quick (Stage 3)

Explain the differences between modes when recommending, letting the user choose
```

### 步骤 3：阶段执行

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

### 步骤 4：转换

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

在每次阶段转换时，编排器都必须注入一段简短的核心原则提醒。这可以防止长对话中的上下文衰减。

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

**特定阶段的强化内容**：有关完整的转换 → 强化重点对照表，请参阅 `references/reinforcement_content.md`。

---

## 分阶段调用契约（v3.9.2）

academic-pipeline 是编排器技能，负责协调包含 10 个阶段的完整 ARS 流水线（委派给 deep-research、academic-paper、academic-paper-reviewer）。它支持两种调用模式：

**模式 A — 编排器驱动（默认）：** `pipeline_orchestrator_agent` 端到端运行所有阶段，并通过材料护照跟踪状态。编排器会在适当的检查点调度 `state_tracker_agent`、`integrity_verification_agent`、`collaboration_depth_agent` 和 `claim_ref_alignment_audit_agent`。

**模式 B — 分阶段执行（跨会话恢复）：** 用户跨会话逐个调用阶段代理，通常通过 `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>` 实现（请参阅 `references/passport_as_reset_boundary.md`）。

在模式 B 中，下游技能（deep-research、academic-paper、academic-paper-reviewer）内的**单阶段代理（根据 `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md` 归入 Bucket A）在执行写入操作时，必须严格限定在其获分配的阶段内**。academic-pipeline 自身的 5 个代理在设计上都属于跨阶段代理/元代理（Bucket C/D）——它们在设计上不设边界：

- `pipeline_orchestrator_agent`（D — 编排器，可见完整流水线）
- `state_tracker_agent`（D — 元状态，涵盖所有阶段）
- `integrity_verification_agent`（C — Stage 2.5 / 4.5 跨技能门禁）
- `collaboration_depth_agent`（C — FULL/SLIM 检查点 + Stage 6 记录汇编，仅提供建议）
- `claim_ref_alignment_audit_agent`（C — 可选的主张审计，与阶段正交）

路由至模式 B 需要明确的用户信号——`/ars-<mode>` 斜杠命令或 `[direct-mode]` 前缀。根据 `.claude/CLAUDE.md` 中的路由规范及 `shared/references/intent_clarification_protocol.md`，对于含义不明确的跨阶段输入，默认要求用户澄清。**关键点：**如果针对含义不明确的跨阶段材料调度了 `pipeline_orchestrator_agent`，编排器本身目前无法协调处理（这是 v3.10 编排器 #134 的工作内容）——v3.9.2 会在编排器运行之前将此类情况路由至澄清流程。

**强制执行（v3.9.2）：**针对下游 Bucket A 代理的阶段边界阻断 + 建议性验证器（`scripts/check_pipeline_integrity.py`）+ 在支持钩子的运行时中使用确定性的 PreToolUse 写入范围守卫（#134 范围调整，PR #294）。多阶段信封 + 编排器结构化接收仍属于未来工作范围（#134 Slices 3-5）。

---

## 可选启用的探究分支账本（#743 alpha）

`ARS_INQUIRY_LEDGER=1` 启用受限的
`inquiry-branch-ledger/1.0` 记忆界面。未设置或设为 `0` 时，不会生成任何账本
产物、指针、提示或摘要。即使启用，单个线性分支也不会生成账本；记录的第二个
分支才是首个合法发布点。

编排器负责交互界面，而确定性运行时
`scripts/inquiry_branch_ledger.py` 负责验证、重放、追加、
配置文件预算检查、指针绑定和崩溃恢复。重放会为每个账本绑定接收
完全一致的配置文件；绝不会用当前的回退内容替代缺失的历史字节。AI 切面进入
`parked` 状态，并且只能通过显式的、与来源绑定的采纳回执转为作者所有。
重新打开仅将作者记录的一级产物标记为过时，绝不会重写
它们。

仅在阶段 1 设计冻结检查点、阶段 2.5 和 4.5 的强制检查点，或紧接在
记录到重新打开条件信号之后，呈现运行时的精简摘要。标志关闭或最多只有一个分支时，
完全省略该区块。每次显示的交互均提供 `skip`、`off` 和
重置为简单路径选项；这些选项会隐藏后续界面，但不会删除账本。
该摘要是辅助性的状态记忆，绝不会更改完整性判定或
检查点要求。完整协议和崩溃语义：
`docs/design/2026-08-17-743-inquiry-branch-ledger-design.md`。

---

## 完整性审查协议

阶段 2.5（审查前）和阶段 4.5（修订后）验证。五阶段协议：参考文献 → 引文上下文 → 统计数据 → 原创性 → 声明。

⚠️ **铁律**：阶段 4.5 必须在阶段 5 之前达成有记录的最终解决结果：PASS；或者——在完整性 FAIL 的三轮循环用尽后——由用户针对所列未解决事项作出明确且有记录的决定（重复推翻时，理由要求会逐步提高；请参阅 `shared/compliance_checkpoint_protocol.md`）。绝不能悄然丢弃未解决事项。阶段 4.5 会从头执行一次全新的检查，不依赖阶段 2.5 的结论；这并不表示其错误过程相互独立。

⚠️ **铁律（v3.2）**：阶段 2.5 和阶段 4.5 还必须运行 **AI 研究失败模式检查清单**——一种包含七种模式的分类体系，将引文幻觉检查扩展到实现缺陷、虚构结果、依赖捷径、将缺陷误作洞见、伪造方法论以及流水线层面的框架锁定。如果七种模式中的任何一种为 `SUSPECTED`，或者模式 1/3/5/6 为 `INSUFFICIENT EVIDENCE`，流水线将被**阻止**，并且用户必须确认（确认 / 提供理由后推翻 / 修订），流水线才能继续。任何配置标志都无法消除此阻止；唯一的继续途径是上述有记录的用户确认——一种带有审计追踪、基于信任的控制措施。随后，阶段 6 的流程摘要会将完整的失败模式审计日志作为 AI 自我反思报告的一部分进行报告。

> 有关五阶段引文/声明验证程序，请参阅 `references/integrity_review_protocol.md`。
> 有关七种 AI 研究失败模式检查清单及阻止/推翻逻辑，请参阅 `references/ai_research_failure_modes.md`。

- [v3.4.0] `compliance_agent` 运行模式感知的 PRISMA-trAIce + RAISE 合规检查；采用基于层级的阻断语义。参见 `shared/compliance_checkpoint_protocol.md`。

### 扭曲短语提示（#660）

在第 4.5 阶段精确通过之后、紧接第 5 阶段格式化之前，编排器使用由用户明确提供或由合成固件生成的快照，以及绑定到原始快照 SHA-256 的分离清单，对已被接受的工作草稿原文运行确定性的 #660 检查器；如果未提供，则生成明确的 `not_checked` 工件。该路径不附带任何原生 PPS 内容/导入器/获取器或重新分发的短语列表，也不使用实时模型、外部 API、人类或模型评判者或环境时钟；时间戳均为显式输入。其针对自身草稿的结果为 `HEURISTIC-ADVISORY` / `UNMEASURED`，绝不会改变第 4.5 阶段的 PASS 或第 5 阶段的门禁，绝不会重写正文，并且仅当修订稿重新进入现有的完整性/筛查序列后才可重新运行。

对于文献语料库，非原位生成器会为每个 `cited_title` 和 `cited_abstract` 分别生成一条当前的 v1.2 提示记录；缺失的摘要仍明确标记为 `not_checked` / `unresolved`，并带有 `ABSTRACT_MISSING`。下游使用方为只读，并将每条记录汇总到现有的唯一 `Bibliographic Integrity Advisories` 章节中。该提示不会生成任何标记，不会触发任何终止策略、门禁、终结器晋升、排序、引文重写或替换文本，也不支持任何关于干净草稿、来源、论文工厂、上下文有效性、出版商接受情况或匹配器准确性的声明。

### 跨文档一致性提示（#672）

具备 shell 能力的第 1 阶段分派器是唯一可以调用
`scripts/build_cross_document_consistency_advisory.py
build-preregistration-artifact` 的使用方。非 shell 研究架构师仅提供
调用方声明和具名配套句柄。生成的精确 sidecar 和所提供的配套文件会经过重放验证，并在
每次交接中逐字节传递。遗漏、静默替换、模板替换或摘要
修复均无效。

在同一个第 4.5 阶段精确 PASS 之后，第 5 阶段唯一的强制入口
检查点先运行 #660，再运行 #672。二者绑定到同一份已接受的
草稿；#660 的 `input_binding.artifact.artifact_id/artifact_sha256` 必须等于 #672 的
`input_binding.accepted_draft_artifact_id/accepted_draft_sha256`。二者仍是
彼此独立的载体，具有各自独立的失败语义：退出码为 1 时保留符合模式要求的 #660
降级工件；#672 合约/运行时失败不会写入工件，
仅记录有界的 `ADVISORY_UNAVAILABLE:<CODE>`。

#672 始终为 `LLM-ADVISORY` / `UNMEASURED`。它不包含分数、通过/失败、门禁、
就绪状态、授权、ClaimIntent、重写、同意书/协议重复项，也不表示
干净或一致。它不能改变第 4.5 阶段，不能阻断或延迟现有
检查点，也不能在用户确认后更改第 5 阶段的路由。手稿
修订会使两项提示均失效，并且必须重新进入完整性流程，然后针对新接受的字节
依次重新运行 #660 和 #672。

---

## 两阶段审查协议

阶段 3（完整审查，5 名审查者）→ 修订辅导 → 阶段 4 → 阶段 3'（重新审查）→ 可选的遗留问题辅导 → 阶段 4'。

默认情况下，阶段 3' 按照 #576「证据先于说服」三道关卡契约运行：编排器生成与哈希绑定的输入清单，依次执行阶段 1（承诺评审标准，不了解修订内容）→ 阶段 2A（证据裁定，不受说服性内容影响）→ 阶段 2B（主张匹配，公开修订信），并在呈现任何决定之前将调用 `scripts/check_re_review_synthesis.py` 作为强制步骤——结果包括接受 / 小修 / 大修、`user_review_required` 延后处理，或采用故障关闭机制中止（绝不使用拒绝）。旁车文件中冻结的 `previously_missed`/`indeterminate` 新问题记录会在两条路径上都转交至阶段 4.5。旧版单遍重新审查需要显式设置 `ARS_RE_REVIEW_LEGACY=1` 标志，并标记为 `[LEGACY-NO-CONTRACT]`。依据：`pipeline_orchestrator_agent.md` § 阶段 3' 重新审查契约分派 + `academic-paper-reviewer/references/re_review_mode_protocol.md`。

> 有关详细的阶段流程和辅导对话限制，请参阅 `references/two_stage_review_protocol.md`。

---

## 中途进入协议

用户可以从任意阶段进入。编排器将：

1. **检测材料**：分析用户提供的内容，以确定当前有哪些可用材料
2. **识别缺口**：检查目标阶段需要哪些前置材料
3. **建议回填**：如果缺少关键材料，建议是否返回较早的阶段
4. **直接进入**：如果材料充足，则直接开始指定阶段

**重要提示：中途进入不能跳过阶段 2.5**
- 如果用户携论文直接进入，请先完成阶段 2.5（完整性检查），然后再进入阶段 3（审查）
- 唯一例外：用户可以提供先前的完整性验证报告，且内容未经修改

---

## 外部审查协议

负责整合外部（人工）审查者的反馈。四步工作流：接收与结构化 → 策略性修订辅导 → 修订与回复 → 自我验证。

> 有关完整的四步工作流、辅导对话模式和能力边界，请参阅 `references/external_review_protocol.md`。

---

## 进度仪表板

在完整检查点显示 ASCII 仪表板，以展示流水线进度。

> 有关仪表板模板，请参阅 `references/progress_dashboard_template.md`。

---

## 修订循环管理

- 阶段 3（首次审查）-> 阶段 4（修订）-> 阶段 3'（验证性审查）-> 阶段 4'（再次修订，如有需要）-> 阶段 4.5（最终验证）
- **最多进行 1 轮再次修订**（阶段 4'）：如果阶段 3' 给出大修结论，则进入阶段 4' 进行修订，之后直接进入阶段 4.5（不再返回审查）
- **流水线规则会覆盖 academic-paper 最多修订 2 轮的规则**：在该流水线中，修订仅限于阶段 4 + 阶段 4'（各一轮），取代 academic-paper 最多修订 2 轮的规则
- 将未解决的问题标记为已知局限性
- 提供累计修订历史（每一轮的决定、已处理事项、未解决事项）

### 提前停止标准

在每轮修订结束时，仅当**不存在任何 P0 问题**、**不存在任何未解决且会影响决策的回归**、**不存在任何适用标准发生了需要再次修订的实质性状态变化**，并且**作者没有任何尚未完成的必需操作**时，才建议停止。应说明与标准相对应的依据；不要计算分数差值，也不要将标签数量的微小变化视为已收敛。用户可以推翻该建议。硬性上限：2 个完整修订循环（阶段 4 + 阶段 4'）。

### 预算透明度（v3.2；交互次数扩展 #89/#388）

在流水线启动时，根据论文长度、模式以及是否启用跨模型选项估算 token 成本。展示估算结果，并在阶段 1 开始前请求用户确认。

在 token 估算结果之外，还需展示**交互次数预算**：长周期文档损坏会随文档往返次数增加而累积，而不是随 token 量增加而累积（DELEGATE-52，arXiv:2604.15597）。列出流水线已实施的往返次数上限——2 个完整修订循环（见上文“提前停止”）、8 + 5 轮苏格拉底式辅导（阶段 3→4 / 3'→4'），以及阶段 2.5/4.5 的完整性门禁“修复→重新验证”循环——并说明这些上限对于所选模式意味着的最坏情况往返总次数。在每个阶段检查点，将累计往返次数与阶段状态一并报告。**仅供参考**：该次数永远不会造成阻断；各循环上限仍是执行约束层。如果一次运行超出了其声明的最坏情况，则表明存在一个未被这些上限覆盖的循环——应明确指出这一点，而不是静默继续。

---

## 跨运行裁决活动（#673；可选择启用的建议性旁路通道）

状态跟踪器中的“裁决活动元数据”部分是唯一的生成方/状态权威。每次运行都会获得一个稳定且明确的 `run_id`。结构化处理程序首先持久应用其现有的作者选择、合规覆盖、明确请求或 MANDATORY 检查点路由/状态效果，然后才尽力向五行 `pending_adjudication_activity_bindings[]` 清单追加一个经过数据最小化处理的绑定。被拒绝的 MANDATORY 跳过操作会先保持状态不变，之后可选回执才会存储 `skip_refused`。作者组使用 `artifact_group_stage`，并且可以同时保留阶段 3 和阶段 3-prime；回执阶段使用完整的阶段 1 至阶段 6 封闭枚举，其中不含阶段 0。对于仅包含普通报告且捕获数量为零的组，合规流程允许保留该组；只有完全符合条件的覆盖操作才需要配对的操作回执。

终止行为保持不变，并且优先执行。在已完成/已中止状态持久化之后，并且仅针对用户选择的本地存储，编排器会将明确的状态/工件根路径以及五行明确的待处理数据传递给 `seal_terminal_inventory(state_path, artifact_root, pending_bindings)`，随后尽力依次运行已封存清单的 `build-input`、幂等的 `append-run` 以及可选的 `render`。该辅助程序负责计算哈希；它不会读取待处理状态、接受调用方提供的哈希、推断来源或执行扫描。根级 `run_id` 加上已封存根级 `adjudication_activity_sources` 是确切的权威来源。任何活动失败都只是建议性诊断，不能影响已经持久化的终止结果。

活动数据绝不会进入材料护照、交接、流程记录、评审者/模型/观察器/合规输入、门禁、裁决、检查点输入或阶段转换。任何实时模型、裁判、评估、网络/API、环境时钟、目录扫描或 glob 都不会参与其中。完整细节和冻结的回执模式仍保留在 `docs/design/2026-08-10-673-cross-run-adjudication-activity-spec.md` 和 `shared/contracts/activity/` 中。

---

## 可审计性和重放边界

流水线制品均经过版本控制、哈希处理且可审计。确定性验证器可以针对相同的字节和配置进行重放。由 LLM 生成的文本和语义判断具有随机性，不提供字节级可复现性保证；应记录模型/配置和证据，以便检查差异。

> 有关标准化工作流契约、确定性重放边界、审计跟踪格式和制品追踪，请参阅 `references/reproducibility_audit.md`。

---

## 阶段 6：流程总结协议

生成最终流程记录：论文创作历程、协作质量评估（6 个维度，1-100 分）以及 AI 自我反思报告。

**终止语义（#528）**：阶段 6 并非强制执行——用户可以在阶段 5 完成检查点拒绝执行该阶段（阶段 6 标记为 `skipped`；流水线仍以 `completed` 状态终止）。执行该阶段时，在交付流程记录后，编排器会提示用户进行终止确认——`finish` / `end` / `done` / `confirm`，或明确表示接受交付成果的自然语言同义表达。确认后，阶段 6 标记为 `completed`，流水线全局状态设为 `completed`；变更请求（要求另一种语言版本、内容修正）会使阶段 6 保持 `in_progress`，且不视为确认。请参阅 `references/pipeline_state_machine.md` § 阶段 6 终止语义。

> 有关完整工作流、必需的内容结构、评分维度和输出规范，请参阅 `references/process_summary_protocol.md`。

---

## 协作深度观察器（v3.5.0，仅提供建议——绝不阻塞）

`collaboration_depth_agent` 观察用户与流水线的协作模式。它**仅提供建议**，并且在任何检查点都**绝不会阻塞**流程推进。它在设计上属于 `non-blocking`，并在其前置元数据中携带 `blocking: false`，以此作为结构性保证。

**调用时机**：每个 FULL 检查点、每个 SLIM 检查点，以及阶段 6 记录编制期间（全流水线遍历在生成并交付流程记录之前运行，因此其输出可以成为用户所确认记录中的一个章节）。MANDATORY 检查点（阶段 2.5 / 4.5 完整性门禁）**不会**调用观察器——这些检查点关注的是完整性问题，不得被弱化。

**执行内容**：读取刚完成阶段的对话范围（在检查点）或整个流水线的对话（在阶段 6 记录编制期间），根据 `shared/collaboration_depth_rubric.md` 中的规范评分量表对协作模式进行评分，并生成建议性内容块/章节。维度包括：委派强度、认知警觉性、认知资源重新分配、区域分类（区域 1 / 区域 2 / 区域 3）。评分量表基于 Wang & Zhang（2026）发表于 IJETHE 23:11 的研究（DOI 10.1186/s41239-026-00585-x）。

**与现有机制的区别**：

| 机制 | 评估内容 | 是否阻塞？ |
|---|---|---|
| `integrity_verification_agent`（阶段 2.5 / 4.5） | 论文内容——参考文献、引文、数据 | 是（阻塞式关卡） |
| 阶段 6 协作质量评估（6 个维度，1–100 分） | AI 对自身行为的自我反思 | 否，但仅生成一次 |
| `collaboration_depth_agent`（此观察者） | **用户的**协作模式（委派强度、警觉性、重新分配） | **否——绝不阻塞。仅提供建议。** |

**非阻塞保证**：
- 观察者输出绝不会出现在任何检查点的“Flagged”行中。
- `Ready to proceed?` 提示不受观察者输出影响。
- `blocked_by: collaboration_depth_agent` 在 `state_tracker` 中绝不是合法状态。
- 如果观察者的 frontmatter 声明了 `blocking: true`，编排器必须拒绝调度它。

**跨模型**：设置 `ARS_CROSS_MODEL` 后，观察者会在两个模型上运行，并标记任何超过 2 分的维度分歧。绝不会在不同模型之间悄然取平均分。

> 有关完整评分流程和反迎合规范，请参阅 `agents/collaboration_depth_agent.md`；有关规范的 4 维度量表，请参阅 `shared/collaboration_depth_rubric.md`。

---

## 反模式

为防止常见故障模式，明确禁止以下行为：

| # | 反模式 | 失败原因 | 正确行为 |
|---|-------------|-------------|-----------------|
| 1 | **跳过完整性检查** | “论文看起来没问题，跳过阶段 2.5/4.5” | 完整性检查为强制要求；无论感知到的质量如何，都不能自动跳过 |
| 2 | **编排器执行实质性工作** | 流水线编排器撰写内容或审阅论文 | 编排器仅负责调度和协调；实质性工作由子技能完成 |
| 3 | **自动越过强制检查点** | 在完整检查点未获得用户确认便进入下一阶段 | 强制检查点要求先获得用户的明确输入，然后才能继续 |
| 4 | **质量随阶段推进而下降** | 由于上下文窗口耗尽，阶段 4 的修订稿质量低于阶段 2 的草稿 | 如果阶段 N 的输出质量低于阶段 N-1，请暂停并重新加载核心原则，然后再继续 |
| 5 | **悄然遗漏审稿人关切** | 修订只处理 10 项关切中的 8 项，并希望无人注意 | R&R 跟踪表必须涵盖每一项关切，并明确记录其状态 |
| 6 | **阶段 4.5 仅重新验证已知问题** | 最终完整性检查仅重新检查阶段 2.5 的发现 | 阶段 4.5 必须从头开始进行一次全新检查；修订可能引入新问题 |
| 7 | **虚增协作质量评分** | 为避免尴尬的自我批评而给出 90/100 分 | 诚实优先：不虚增评分，不说客套话；每项评分都要引用具体证据 |
| 8 | **绕过故障模式检查清单区块**（v3.2） | “这份 7 模式检查清单是新增的，这次运行先跳过” | 阶段 2.5/4.5 的故障模式检查清单是强制且具有阻塞性的；不存在不记录的绕过方式——每次覆盖都需要记录用户理由，以供阶段 6 使用 |

---

## 质量标准

| 维度 | 要求 |
|-----------|------------|
| 阶段检测 | 正确识别用户当前所处阶段和可用材料 |
| 模式推荐 | 根据用户偏好和材料状态推荐合适的模式 |
| 材料交接 | 阶段间的交接材料完整且格式正确 |
| 状态跟踪 | 实时更新流水线状态；进度仪表板准确无误 |
| **强制检查点** | **每个阶段完成后都必须获得用户确认** |
| **强制完整性检查** | **始终运行阶段 2.5 和 4.5；若结果不是 PASS，必须获得用户明确且有记录的决定后才能继续** |
| **强制失败模式检查清单**（v3.2） | **阶段 2.5 和 4.5 必须运行包含 7 种模式的 AI 研究失败检查清单；疑似失败将阻止继续；越过检查必须提供用户理由** |
| 不越权 | ⚠️ 铁律：编排器不执行实质性的研究、写作或审阅工作，只负责调度 |
| 不强迫 | ⚠️ 铁律：用户可以随时暂停或退出流水线（但不能跳过完整性检查） |
| 可审计的工作流 | 可以重放相同的声明契约和确定性验证器；模型/配置及随机输出保持可见，而非承诺完全一致 |
| **具备收敛意识的停止机制** | **仅当不存在 P0、尚未解决且影响决策的回归、实质性的标准状态变化或尚未完成的必要操作时，才建议停止；用户可以推翻该建议** |
| **预算透明度**（v3.2；#388） | **Token 成本估算 + 交互次数预算（往返轮次上限 + 检查点处的累计次数，仅供参考）+ 流水线启动时的用户确认** |

---

## 错误恢复

| 阶段 | 错误 | 处理方式 |
|-------|-------|---------|
| 信息接收 | 无法确定切入点 | 询问用户拥有哪些材料及其目标 |
| 阶段 1 | deep-research 无法收敛 | 建议切换模式（socratic -> full）或缩小范围 |
| 阶段 2 | 缺少研究基础 | 建议返回阶段 1 补充研究 |
| 阶段 2.5 | 经过 3 轮修正后仍为 FAIL | 列出无法验证的项目；由用户决定是否继续 |
| 阶段 3 | 审阅结果为 Reject | 提供选项：进行重大重构（阶段 2）或放弃 |
| 阶段 4 | 未能完成所有项目的修订 | 列出尚未处理的项目；询问是否继续 |
| 阶段 3' | 验证后仍存在重大问题 | 进入阶段 4' 进行最终修订 |
| 阶段 4' | 修订后仍存在问题 | 标记为已确认的限制；继续进入阶段 4.5 |
| 阶段 4.5 | 最终验证结果为 FAIL | 修复并重新验证（最多 3 轮） |
| 任意阶段 | 用户中途离开 | 保存流水线状态；下次可从断点处恢复 |
| 任意阶段 | Skill 执行失败 | 报告错误；建议重试、暂停或切换模式。不得跳过强制完整性检查或失败模式关卡 |

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

| 参考文件 | 用途 |
|-----------|---------|
| `references/pipeline_state_machine.md` | 完整的状态机定义：所有合法转换、前置条件和操作 |
| `references/plagiarism_detection_protocol.md` | 阶段 D 原创性验证协议 + 自我抄袭 + AI 文本特征 |
| `references/mode_advisor.md` | 统一的跨技能决策树：将用户意图映射到最优技能和模式 |
| `references/claim_verification_protocol.md` | 阶段 E 主张验证协议：主张提取、来源追溯、交叉核验、裁定分类体系 |
| `references/claim_audit_calibration_protocol.md` | v3.8 #103 claim_ref_alignment 审计校准：金标准集结构（T-C3）、阈值门槛 FNR<0.15 / FPR<0.10（T-C1）、按类别报告 FNR/FPR（T-C2）。通过 `PYTHONPATH=. python3 -m unittest scripts.test_claim_audit_calibration -v` 重新运行。 |
| `references/ai_research_failure_modes.md` | 7 类 AI 研究失败检查清单（Lu 2026），在阶段 2.5 + 4.5 运行，具有阻断行为，并在阶段 6 报告 |
| `references/team_collaboration_protocol.md` | 多人团队协调：角色定义、交接协议、版本控制、冲突解决 |
| `references/integrity_review_protocol.md` | 阶段 2.5 + 4.5 完整性验证：五阶段协议详情 |
| `references/two_stage_review_protocol.md` | 两阶段评审：阶段 3 全面评审 + 阶段 3' 验证性评审 |
| `references/external_review_protocol.md` | 外部（人工）评审者反馈：四步接收/指导/修订/验证流程 |
| `references/process_summary_protocol.md` | 阶段 6：协作质量评估 + AI 自我反思报告 |
| `references/reproducibility_audit.md` | 标准化工作流契约、确定性重放边界和审计轨迹格式 |
| `references/progress_dashboard_template.md` | ASCII 进度仪表板模板 |
| `references/reinforcement_content.md` | 用于阶段转换的分阶段强化重点表 |
| `references/changelog.md` | 完整版本历史 |
| `shared/handoff_schemas.md` | 跨技能数据契约：适用于所有阶段间交接产物的 9 个 schema |
| `shared/collaboration_depth_rubric.md` | 协作深度观察者量表（v1.0）：基于 Wang & Zhang（2026）IJETHE 23:11 的 4 个维度 |

---

## 模板

| 模板 | 用途 |
|----------|---------|
| `templates/pipeline_status_template.md` | 进度仪表板输出模板 |

---

## 示例

| 示例 | 展示内容 |
|---------|-------------|
| `examples/full_pipeline_example.md` | 完整的流水线对话记录（阶段 1-5，包含完整性验证 + 两阶段评审） |
| `examples/mid_entry_example.md` | 从阶段 2.5 开始的中途进入示例（现有论文 -> 完整性检查 -> 评审 -> 修订 -> 定稿） |

---

## 输出语言

遵循用户使用的语言。学术术语保留英文。

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
| `deep-research` | 被调度（阶段 1 研究环节） |
| `academic-paper` | 被调度（阶段 2 写作、阶段 4/4' 修订、阶段 5 格式化） |
| `academic-paper-reviewer` | 被调度（阶段 3 首次评审、阶段 3' 验证性评审） |

---

## 模型分级（#517，可选）

设置 `ARS_MODEL_TIERING` 后，调度会话将依据 `shared/model_tiering.md` 为此技能的智能体分配模型（规范定义：完整的 39 智能体判断/执行表及相关规则）。简要规则：

- **未设置（默认）：**每个智能体都继承会话模型——行为与 #517 之前逐字节等效。
- **`economy`**（前沿层级会话）：执行型智能体使用比会话模型低一个层级的模型——下限为 Opus 级，绝不低于该层级；判断型智能体继续使用会话模型。会话模型处于或低于下限时不执行任何操作（仅通知一次）。
- **`quality-boost`**（低于前沿层级的会话）：检查点环节的判断型智能体（阶段 2.5/4.5 关卡；可选启用的阶段 4→5 论断—参考文献审计；最终评审）直接提升至前沿层级（无论相隔多少个层级——并非只提升一级）；任何智能体都不会被降级。已处于前沿层级时不执行任何操作（仅通知一次）。
- 未知值 → 警告一次，并按未设置处理。层级表示相对位置，绝不硬编码固定模型 ID。启用某个调整方向后，将同一阶段的重复调用路由至同一个工作智能体，以便累积其提示词缓存；未设置时，调度形式也保持逐字节等效。

---

## 版本信息

| 项目 | 内容 |
|------|---------|
| 技能版本 | 3.21.1 |
| 最后更新 | 2026-08-24 |
| 维护者 | Cheng-I Wu |
| 依赖技能 | deep-research v2.0+、academic-paper v2.0+、academic-paper-reviewer v1.1+ |
| 角色 | 完整学术研究工作流编排器 |

---

## 更新日志

> 完整版本历史请参阅 `references/changelog.md`。