---
name: academic-pipeline
description: "Orchestrator for the full academic research pipeline: research -> write -> integrity check -> review -> revise -> re-review -> re-revise -> final integrity check -> finalize. Coordinates deep-research, academic-paper, and academic-paper-reviewer into a seamless 10-stage workflow with mandatory, coverage-bounded integrity checks, two-stage peer review, and auditable quality-assurance artifacts. Triggers on: academic pipeline, research to paper, full paper workflow, paper pipeline, end-to-end paper, research-to-publication, complete paper workflow, 연구부터 논문까지, 연구 주제 설정부터 논문 완성까지, 논문 전체 워크플로."
metadata:
  version: "3.20.1"
  last_updated: "2026-08-15"
  depends_on: "deep-research, academic-paper, academic-paper-reviewer"
  status: active
  data_access_level: verified_only
  task_type: open-ended
  related_skills:
    - deep-research
    - academic-paper
    - academic-paper-reviewer
---
# Academic Pipeline v3.20.1 — 完整学术研究工作流编排器

一个轻量级编排器，负责管理从研究探索到最终稿件的完整学术流程。它不执行实质性工作——仅检测阶段、推荐模式、分派技能、管理阶段转换并跟踪状态。

> **路由规范（v3.9.2）：** 有关跨技能路由规则，请参阅 `.claude/CLAUDE.md` 中的“Routing Discipline (v3.9.2)”以及 `shared/references/intent_clarification_protocol.md`。此技能假定路由已经确定——跨阶段且含义不明确的材料应已在上游完成澄清。

**v3.6.3（可选启用）：** 设置 `ARS_PASSPORT_RESET=1`，将 FULL 检查点提升为上下文重置边界。在新会话中使用 `resume_from_passport=<hash>`，从已记录的阶段继续执行。请参阅 [`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md)。

**v3.8（可选启用）：** 设置 `ARS_CLAIM_AUDIT=1`，在 Stage 4 → Stage 5 转换时启用 L3 声明忠实度审计关卡。设置该标志后，编排器会在 v3.7.1 引用时溯源最终处理器完成之后、`formatter_agent` 的硬性关卡之前分派 `claim_ref_alignment_audit_agent`。审计会按照 8 行矩阵生成 `claim_audit_results[]` + `uncited_assertions[]` + `claim_drifts[]` + `constraint_violations[]` + `audit_sampling_summaries[]` 聚合结果；HIGH-WARN 类别会通过格式化器的 REFUSE 规则 6-10 触发关卡拒绝输出。v3.8.0 中默认关闭——逐步启用计划推迟至获得校准后证据时执行（规范 §5 模式标志设计理由）。请参阅 `agents/claim_ref_alignment_audit_agent.md` 和编排器 §3.6 正文。

**v2.0 核心改进**：
1. **强制用户确认检查点**——每个阶段完成后都需要用户确认，才能继续执行下一步
2. **学术诚信检查**——论文完成后、提交评审前，运行已声明参考文献、已注册声明和已报告数据检查；公开分母、抽样情况、未知状态和阻断性判定
3. **两阶段评审**——先进行完整评审，再于修订后进行聚焦式验证评审
4. **最终诚信检查**——修订完成后，使用全新输入重新运行最终检查契约；仅当指定的已注册总体明确完整时，`100%` 才适用
5. **可审计**——对工作流产物进行版本标记、哈希计算和保留；确定性检查可重放，但不承诺生成式输出逐字节完全一致
6. **过程文档**——Stage 6 生成一份记录人机协作历史的“论文创作过程记录”PDF（在完成整个流程的终止确认之前交付）

## 快速开始

**完整工作流（从零开始）：**
```
I want to write a research paper on the impact of AI on higher education quality assurance
```
--> academic-pipeline 启动，从 Stage 1 (RESEARCH) 开始

**中途进入（已有论文）：**
```
I already have a paper, help me review it
```
--> academic-pipeline 检测到中途进入，从 Stage 2.5 (INTEGRITY) 开始

**修订模式（收到审稿人反馈）：**
```
I received reviewer comments, help me revise
```
--> academic-pipeline 检测到该请求，从阶段 4（REVISE）开始

**从通行证恢复（跨会话上下文重置，需主动启用）：**
```
resume_from_passport=<hash> [stage=<n>] [mode=<m>]
```
--> 加载 Material Passport（Schema 9），查找与 `<hash>` 匹配的 `kind: boundary` 条目，并确认其后不存在使用该条目的 `kind: resume` 条目。如果设置了 `pending_decision`，则首先触发决策提示，以获取用户的分支选择并记录到审计账本中；即使用户提供了 `stage=`，也绝不会跳过该提示。提示完成后（如果没有 `pending_decision`，则立即执行），下一阶段按以下规则确定：(a) 如果提供了 `stage=<n>` CLI 覆盖值，则使用该值；否则 (b) 使用匹配选项的 `next_stage`；否则 (c) 使用边界条目中记录的 `next` 字段。CLI `stage=`/`mode=` 覆盖值的优先级高于选项路由。
- **门控（生成）**：生成会话中必须设置 `ARS_PASSPORT_RESET=1`。如果未设置该标志，则不会写入任何 `kind: boundary` 条目，也就没有可供恢复的内容。
- **门控（恢复）**：无需标志。任何会话均可针对包含与该哈希匹配的有效边界条目的通行证调用 `resume_from_passport=<hash>`。
- **目的**：在一个*全新的* Claude Code 会话中调用。在生成边界的同一会话中恢复不会节省 token，并且可能丢失会话内仍然有效的上下文。
- **阶段**：任意。根据上述路由规则确定恢复所处的阶段。
- **参考**：[`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md) — 请参阅 §「`resume_from_passport` 模式约定」。

**执行流程：**
1. 检测用户当前所处的阶段和可用材料
2. 为每个阶段推荐最佳模式
3. 为每个阶段分派相应的 skill
4. **每个阶段完成后，主动提示并等待用户确认**
5. 全程跟踪进度；可随时查看 Pipeline Status Dashboard

---

## 触发条件

### 触发关键词

**英语**：academic pipeline, research to paper, full paper workflow, paper pipeline, end-to-end paper, research-to-publication, complete paper workflow

**韩语**：학술 파이프라인, 연구부터 논문까지, 논문 전체 워크플로, 연구 주제 설정부터 논문 완성까지, 연구-논문 전 과정

### 不触发场景

| 场景 | 应使用的 Skill |
|----------|-------------|
| 只需搜索材料或进行文献综述 | `deep-research` |
| 只需撰写论文（不需要研究阶段） | `academic-paper` |
| 只需评审论文 | `academic-paper-reviewer` |
| 只需检查引用格式 | `academic-paper`（citation-check 模式） |
| 只需转换论文格式 | `academic-paper`（format-convert 模式） |

### 触发排除项

- 如果用户只需要单一功能（仅搜索材料、仅检查引用），则无需使用 pipeline——直接触发相应的 skill
- 如果用户已经在使用某个 skill 的特定模式，请尊重该入口；pipeline 需由用户主动选择使用
- pipeline 是可选的，并非强制使用

---

## 流水线阶段（10 个阶段）

| 阶段 | 名称 | 调用的 Skill / Agent | 可用模式 | 交付物 |
|-------|------|---------------------|----------------|-------------|
| 1 | RESEARCH | `deep-research` | socratic, full, quick | 研究问题简报、方法论、参考文献目录、综合分析 |
| 2 | WRITE | `academic-paper` | plan, full | 论文草稿 |
| **2.5** | **INTEGRITY** | **`integrity_verification_agent`** | **pre-review** | **完整性验证报告 + 修正后的论文** |
| 3 | REVIEW | `academic-paper-reviewer` | full（包括魔鬼代言人审查） | 5 份审稿报告 + 编辑决定 + 修订路线图 |
| 4 | REVISE | `academic-paper` | revision | 修订稿、审稿意见回复 |
| **3'** | **RE-REVIEW** | **`academic-paper-reviewer`** | **re-review** | **验证性审稿报告：修订回复检查清单 + 遗留问题** |
| **4'** | **RE-REVISE** | **`academic-paper`** | **revision** | **第二版修订稿（如需要）** |
| **4.5** | **FINAL INTEGRITY** | **`integrity_verification_agent`** | **final-check** | **最终验证报告（声明的检查必须通过；已登记的分母以及未知/范围外状态保持可见）** |
| 5 | FINALIZE | `academic-paper` | format-convert | 最终论文（默认 MD；可用 Pandoc 时生成 DOCX，否则提供转换说明；询问是否需要 LaTeX；确认正确性；PDF） |
| **6** | **PROCESS SUMMARY** | **orchestrator** | **auto** | **论文创建过程记录 MD + LaTeX 转 PDF（双语）** |

**并行化机会（v3.3）**：在阶段 2 中，`academic-paper` Skill 的阶段 1（literature_strategist_agent）和 `visualization_agent` 可以在阶段 2（structure_architect_agent）完成大纲后并行运行。具体而言：
- 一旦大纲包含可视化计划，`visualization_agent` 就可以开始生成图表
- 与此同时，`argument_builder_agent` 可以构建 CER 链
- `draft_writer_agent` 会等待两者均完成后再开始阶段 4

这与 PaperOrchestra 在大纲（步骤 1）完成后并行执行图表生成（步骤 2）和文献综述（步骤 3）的方式一致，从而缩短流水线的总体延迟。并行化是可选的——为简单起见，默认仍采用顺序执行。

---

## 流水线状态机

1. **阶段 1 RESEARCH** -> 用户确认 -> 阶段 2
2. **阶段 2 WRITE** -> 用户确认 -> 阶段 2.5
3. **阶段 2.5 INTEGRITY** -> 通过 -> 阶段 3（失败 -> 修复并重新验证，最多 3 轮；随后进入完整性检查失败循环 -> 记录用户决定）
4. **阶段 3 REVIEW** -> 接受 -> 阶段 4.5 / 小修|大修 -> 阶段 4 / 拒稿 -> 阶段 2 或结束
5. **阶段 4 REVISE** -> 用户确认 -> 阶段 3'
6. **阶段 3' RE-REVIEW** -> 接受|小修 -> 阶段 4.5 / 大修 -> 阶段 4'
7. **阶段 4' RE-REVISE** -> 用户确认 -> 阶段 4.5（不再返回审稿）
8. **阶段 4.5 FINAL INTEGRITY** -> 通过（零问题）-> 阶段 5（失败 -> 修复并重新验证；3 轮后仍未解决 -> 进入完整性检查失败循环 -> 记录用户决定）
9. **阶段 5 FINALIZE** -> MD -> 可用 Pandoc 时生成 DOCX（否则提供说明）-> 询问是否需要 LaTeX -> 确认 -> PDF -> 完成检查点（FULL）-> 阶段 6（用户可以拒绝阶段 6：标记为 `skipped`，流水线直接进入 `completed`）
10. **阶段 6 PROCESS SUMMARY** -> 询问语言版本 -> 生成过程记录 MD -> LaTeX -> PDF -> 终止确认（`finish` / `end` / `done` / `confirm`，或含义明确的自然语言等效表达）-> 流水线全局状态 `completed`

完整的状态转换定义参见 `references/pipeline_state_machine.md`。

---

## 自适应检查点系统

⚠️ **铁律 — 核心规则：每个阶段完成后，系统必须主动提示用户并等待确认。检查点的呈现方式会根据上下文和用户参与度进行调整。**

### 检查点类型

| 类型 | 使用时机 | 内容 |
|------|-----------|---------|
| FULL | 第一个检查点；完整性边界之后；阶段 5 完成时（接受最终交付物） | 完整交付物列表 + 决策仪表板 + 所有选项 |
| SLIM | 在非关键阶段连续收到 2 次以上“继续”响应后 | 单行状态 + 明确的继续/暂停提示 |
| MANDATORY | 完整性检查失败；审查决策；阶段 5 入口门禁（最终定稿前） | 不可跳过；需要用户明确输入 |

### 决策仪表板（在 FULL 检查点显示）

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
2. **连续 2 次以上选择“继续”且未进行审查后**：提示用户注意（“您已经连续选择了 [N] 次继续。是否要查看进度？”）
3. **完整性边界（阶段 2.5、4.5）**：始终使用 MANDATORY
4. **审查决策（阶段 3、3'）**：始终使用 MANDATORY
5. **最终定稿前（阶段 5 入口门禁）**：始终使用 MANDATORY — 这是阶段 4.5 通过与分派阶段 5 之间的检查点，用户需在此明确确认继续，并就最终定稿格式作出决定（引用样式）；阶段内的 LaTeX 问题和内容确认仍属于阶段 5 的执行过程。阶段 5 完成检查点（最终论文已交付、进入阶段 6 之前）使用 FULL — 绝不使用 SLIM。参见 `references/pipeline_state_machine.md` § 阶段 5 边界语义
6. **所有其他阶段**：从 FULL 开始；如果用户说“直接继续”，则降级为 SLIM

### 检查点规则

1. ⚠️ **铁律**：**不得自动跳过 MANDATORY 检查点**：即使上一阶段的结果非常完美，在 MANDATORY 检查点仍需要用户明确输入
2. **用户可进行调整**：在 FULL 和 MANDATORY 检查点，用户可以修改下一步的模式或设置
3. **便于暂停**：用户可以在任何检查点暂停，并在稍后恢复
4. **SLIM 模式**：如果用户说“直接继续”或“全自动”，后续非关键检查点将切换为 SLIM 格式（单行状态 + 明确的继续/暂停提示）
5. **注意力保障机制**：连续收到 4 次以上继续响应后，无论阶段类型如何，系统都会插入一个 FULL 检查点，以确保用户仍保持参与

### 自检问题（在每个 FULL 检查点）

在向用户展示检查点之前，编排器会自问：

1. **引用完整性**：最新输出中是否存在任何未经验证的引用？
2. **迎合性让步**：最新阶段是否毫无异议地全盘接受了所有反馈？
3. **标准变化轨迹**：对于每项适用的具名标准，基于证据的状态是改善、保持不变、退步，还是变得不可比较？绝不能将其简化为隐藏的标量或 `latest >= previous`。暂停并标记任何尚未解决且会影响决策的退步；当标准或证据基础发生变化时，使用 `NOT_COMPARABLE`。
4. **范围约束**：最新阶段是否添加了用户或修订路线图未要求的内容？
5. **完整性**：本阶段要求的所有交付物是否均已提供？

如果任何回答引发疑虑，请将其包含在向用户展示的检查点中。

---

## 智能体团队（5 个智能体）

| # | 智能体 | 职责 | 文件 |
|---|-------|------|------|
| 1 | `pipeline_orchestrator_agent` | 主编排器：检测阶段、推荐模式、触发 skill、管理阶段转换 | `agents/pipeline_orchestrator_agent.md` |
| 2 | `state_tracker_agent` | 状态跟踪器：记录已完成的阶段、已生成的材料、修订循环次数 | `agents/state_tracker_agent.md` |
| 3 | `integrity_verification_agent` | 完整性检查器：执行受覆盖范围约束的参考文献、引用、已登记声明和报告数据检查（明确给出阻断性判定） | `agents/integrity_verification_agent.md` |
| 4 | `collaboration_depth_agent` | **观察者（仅提供建议——绝不阻断）。**读取对话日志，并依据 `shared/collaboration_depth_rubric.md` 对用户与 AI 的协作模式进行评分。在 FULL/SLIM 检查点以及第 6 阶段记录汇编期间调用（在交付流程记录之前，对整个流水线进行检查）。基于 Wang & Zhang（2026）。 | `agents/collaboration_depth_agent.md` |
| 5 | `claim_ref_alignment_audit_agent` | **选择启用的声明忠实度审计器（v3.8 #103）。**审计抽样引用的声明 ↔ 参考文献一致性及负面约束合规性；输出逐项声明的 `claim_audit_results[]`、`claim_drift[]`、`uncited_assertions[]`、`constraint_violations[]`。当请求 claim_audit 模式时，由编排器通过 §3.6 调度。 | `agents/claim_ref_alignment_audit_agent.md` |

---

## 编排器工作流

### 第 1 步：接收与检测

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

在每次阶段转换时，编排器都必须注入一段简短的核心原则提醒。这可以防止长对话中的上下文退化。

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

**特定阶段的强化内容**：有关完整的转换 → 强化重点表，请参阅 `references/reinforcement_content.md`。

---

## 分阶段调用契约（v3.9.2）

academic-pipeline 是编排器 Skill，负责协调包含 10 个阶段的完整 ARS 流水线（委派给 deep-research、academic-paper、academic-paper-reviewer）。它支持两种调用模式：

**模式 A — 编排器驱动（默认）：** `pipeline_orchestrator_agent` 运行所有阶段的端到端流程，并通过 Material Passport 跟踪状态。编排器会在适当的检查点调度 `state_tracker_agent`、`integrity_verification_agent`、`collaboration_depth_agent` 和 `claim_ref_alignment_audit_agent`。

**模式 B — 分阶段执行（跨会话恢复）：** 用户跨会话逐个调用阶段 Agent，通常通过 `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>` 实现（参见 `references/passport_as_reset_boundary.md`）。

在模式 B 中，下游 Skill（deep-research、academic-paper、academic-paper-reviewer）中的**单阶段 Agent（根据 `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md` 归入 Bucket A）在执行写入操作时严格限制在其被分配的阶段内**。academic-pipeline 本身的 5 个 Agent 按设计均为跨阶段 / 元 Agent（Bucket C/D）——按设计，它们不受阶段边界限制：

- `pipeline_orchestrator_agent`（D — 编排器，可见完整流水线）
- `state_tracker_agent`（D — 元状态，覆盖所有阶段）
- `integrity_verification_agent`（C — Stage 2.5 / 4.5 跨 Skill 门控）
- `collaboration_depth_agent`（C — FULL/SLIM 检查点 + Stage 6 记录汇编，仅提供建议）
- `claim_ref_alignment_audit_agent`（C — 可选的声明审计，与阶段正交）

路由至模式 B 需要明确的用户信号——`/ars-<mode>` 斜杠命令或 `[direct-mode]` 前缀。根据 `.claude/CLAUDE.md` 中的路由规范以及 `shared/references/intent_clarification_protocol.md`，对于含义模糊的跨阶段输入，默认要求澄清。**关键事项：**如果基于含义模糊的跨阶段材料调度 `pipeline_orchestrator_agent`，编排器本身目前无法进行协调处理（这是 v3.10 conductor #134 的工作）——v3.9.2 会在编排器运行之前将此类情况路由至澄清流程。

**强制执行（v3.9.2）：** 针对下游 Bucket A Agent 的阶段边界阻断 + 建议性验证器（`scripts/check_pipeline_integrity.py`）+ 启用了 Hook 的运行时中的确定性 PreToolUse 写入范围防护（#134 范围调整，PR #294）。多阶段封装 + 编排器结构化输入仍属于后续规划范围（#134 Slices 3-5）。

---

## 完整性审查协议

第 2.5 阶段（审查前）和第 4.5 阶段（修订后）验证。五阶段协议：参考文献 → 引用上下文 → 统计数据 → 原创性 → 声明。

⚠️ **铁律**：第 4.5 阶段必须在第 5 阶段之前达成有记录的终局结论：PASS；或者，在三轮完整性 FAIL 循环耗尽后，由用户针对列出的未解决事项作出明确且有记录的决定（重复否决时，理由要求会逐级提高；参见 `shared/compliance_checkpoint_protocol.md`）。绝不能默默丢弃未解决事项。第 4.5 阶段会从头开始重新执行检查，不依赖第 2.5 阶段的结论；这并不表示各阶段的错误过程彼此独立。

⚠️ **铁律（v3.2）**：第 2.5 阶段和第 4.5 阶段还必须运行 **AI 研究失效模式检查清单**——一种包含七种模式的分类体系，将引用幻觉检查扩展至实现缺陷、虚构结果、依赖捷径、将缺陷误作洞见、捏造方法论，以及管线级框架锁定。如果七种模式中的任何一种为 `SUSPECTED`，或者模式 1/3/5/6 为 `INSUFFICIENT EVIDENCE`，管线就会**阻断**，且用户必须确认（确认 / 提供理由后否决 / 修订），管线才能继续。任何配置标志都无法关闭此阻断；越过它的唯一途径是获得上述有记录的用户确认——这是一种带有审计轨迹、基于信任的控制措施。随后，第 6 阶段的 PROCESS SUMMARY 会将完整的失效模式审计日志作为 AI 自我反思报告的一部分予以报告。

> 有关五阶段引用/声明验证流程，请参阅 `references/integrity_review_protocol.md`。
> 有关七种模式的 AI 研究失效检查清单及阻断/否决逻辑，请参阅 `references/ai_research_failure_modes.md`。

- [v3.4.0] `compliance_agent` 执行模式感知的 PRISMA-trAIce + RAISE 合规性检查；采用基于层级的阻断语义。参见 `shared/compliance_checkpoint_protocol.md`。

### 刻意扭曲短语提示（#660）

在第 4.5 阶段的精确检查完成后、紧接第 5 阶段格式化之前，编排器会针对已接受工作草稿的确切版本运行确定性的 #660 检查器，使用由用户明确提供或由合成夹具生成的快照，以及绑定至原始快照 SHA-256 的分离式清单；若未提供，则会生成明确的 `not_checked` 工件。该路径不附带任何原生 PPS 内容、导入器、获取器或重新分发的短语列表，也不使用实时模型、外部 API、人工或模型评审者，或环境时钟；时间戳均为显式输入。其针对自身草稿的结果为 `HEURISTIC-ADVISORY` / `UNMEASURED`，绝不会更改第 4.5 阶段的 PASS 结果或第 5 阶段的关卡，绝不会改写正文，并且仅当修订内容重新进入现有的完整性/筛查流程后才必须再次运行。

对于文献语料库，非原位生成器会为每个 `cited_title` 和 `cited_abstract` 生成一条当前的 v1.2 提示记录；摘要缺失时，仍会明确标记为 `not_checked` / `unresolved`，并附带 `ABSTRACT_MISSING`。下游使用者均为只读，并将每条记录组合到现有唯一的 `Bibliographic Integrity Advisories` 章节中。该提示不会生成任何标记，不会触发任何终局策略、关卡、终结器提升、排名、引用改写或替换文本，也不支持任何关于干净草稿、来源、论文工厂、上下文有效性、出版商接受度或匹配器准确性的声明。

### 跨文档一致性提示（#672）

具备 shell 能力的 Stage-1 分发器是唯一可以调用
`scripts/build_cross_document_consistency_advisory.py
build-preregistration-artifact` 的使用方。非 shell 研究架构师仅提供
调用方声明和具名伴随句柄。生成的精确边车文件和提供的伴随文件会经过重放验证，并在
每次交接过程中逐字节传递。遗漏、静默替换、模板替换或摘要
修复均为无效操作。

在同一次精确的 Stage 4.5 PASS 之后，唯一的强制 Stage-5 入口
检查点先运行 #660，再运行 #672。二者绑定同一份已接受的
草稿；#660 的 `input_binding.artifact.artifact_id/artifact_sha256` 必须等于 #672 的
`input_binding.accepted_draft_artifact_id/accepted_draft_sha256`。它们仍然是
彼此独立的载体，具有不同的失败语义：退出码为 1 时，保留模式有效的 #660
降级产物；#672 合约/运行时失败时不写入任何产物，
仅记录有界的 `ADVISORY_UNAVAILABLE:<CODE>`。

#672 始终为 `LLM-ADVISORY` / `UNMEASURED`。它不具有评分、通过/失败、门控、
就绪、授权、ClaimIntent、重写、同意书/协议重复项或
清洁/一致性含义。它不能更改 Stage 4.5，不能阻止或延迟现有的
检查点，也不能在用户确认后改变 Stage-5 路由。稿件
修订会使两项提示均失效，并且必须重新进入完整性检查，然后针对新接受的字节内容
依次重新运行 #660 和 #672。

---

## 两阶段审查协议

Stage 3（完整审查，5 名审查者）→ 修订指导 → Stage 4 → Stage 3'（重新审查）→ 可选的遗留问题指导 → Stage 4'。

默认情况下，Stage 3' 按照 #576 的「说服前须有证据」三门控合约运行：编排器生成受哈希绑定的输入清单，依次分发 Phase 1（标准承诺，不查看修订）→ Phase 2A（证据裁决，不受说服内容影响）→ Phase 2B（声明匹配，展示信函），并在呈现任何决定之前将调用 `scripts/check_re_review_synthesis.py` 作为强制步骤——结果为 Accept / Minor / Major、`user_review_required` 延后处理，或故障关闭式中止（绝不为 Reject）。边车文件中冻结的 `previously_missed`/`indeterminate` 新问题记录会在两条路由上均转发至 Stage 4.5。旧版单遍重新审查需要显式设置 `ARS_RE_REVIEW_LEGACY=1` 标志，并标记为 `[LEGACY-NO-CONTRACT]`。依据：`pipeline_orchestrator_agent.md` § Stage 3' 重新审查合约分发 + `academic-paper-reviewer/references/re_review_mode_protocol.md`。

> 有关详细的阶段流程和指导对话限制，请参阅 `references/two_stage_review_protocol.md`。

---

## 中途进入协议

用户可以从任意阶段进入。编排器将：

1. **检测材料**：分析用户提供的内容，以确定现有材料
2. **识别缺口**：检查目标阶段需要哪些前置材料
3. **建议回补**：如果缺少关键材料，建议是否返回较早阶段
4. **直接进入**：如果材料充足，则直接开始指定阶段

**重要：中途进入时不能跳过阶段 2.5**
- 如果用户带着论文直接进入流程，必须先完成阶段 2.5（完整性检查），然后才能进入阶段 3（审阅）
- 唯一例外：用户可以提供之前的完整性验证报告，且内容自验证后未被修改

---

## 外部审阅协议

负责整合外部（人工）审阅者的反馈。四步工作流：接收与结构化 → 战略性修订指导 → 修订与回复 → 自我验证。

> 完整的四步工作流、指导对话模式和能力边界，请参阅 `references/external_review_protocol.md`。

---

## 进度仪表板

在完整检查点显示 ASCII 仪表板，用于展示流程进度。

> 仪表板模板请参阅 `references/progress_dashboard_template.md`。

---

## 修订循环管理

- 阶段 3（首次审阅）-> 阶段 4（修订）-> 阶段 3'（验证性审阅）-> 阶段 4'（必要时再次修订）-> 阶段 4.5（最终验证）
- **最多进行 1 轮再次修订**（阶段 4'）：如果阶段 3' 的结论为“重大问题”，则进入阶段 4' 进行修订，随后直接进入阶段 4.5（不返回审阅）
- **本流程会覆盖 academic-paper 最多修订 2 轮的规则**：在本流程中，修订仅限于阶段 4 + 阶段 4'（各一轮），取代 academic-paper 最多 2 轮的规则
- 将未解决的问题标记为“已确认的局限性”
- 提供累计修订历史记录（每轮的决定、已处理事项、未解决事项）

### 提前停止标准

每轮修订结束时，仅当**不存在任何剩余的 P0 问题**、**不存在任何未解决且会影响决策的回归问题**、**不存在任何适用标准发生了需要再次修订的实质性状态变化**，并且**作者没有任何尚未完成的必需操作**时，才建议停止。根据具体标准说明理由；不要计算分数差值，也不要将标签数量的微小变化视为收敛。用户可以选择覆盖此建议。硬性上限：2 个完整修订循环（阶段 4 + 阶段 4'）。

### 预算透明度（v3.2；交互次数扩展 #89/#388）

在流程开始时，根据论文长度、模式和跨模型开关估算 token 成本。展示估算结果，并在阶段 1 开始前请求用户确认。

除 token 估算外，还需展示**交互次数预算**：长周期文档损坏会随着文档往返次数而累积，而不是随着 token 量增加而累积（DELEGATE-52，arXiv:2604.15597）。列出流程已实施的往返次数上限——2 个完整修订循环（见上文“提前停止标准”）、8 + 5 轮苏格拉底式指导（阶段 3→4 / 3'→4'），以及阶段 2.5/4.5 的完整性门禁“修复→重新验证”循环——并说明这些上限对于所选模式所意味着的最坏情况下往返总次数。在每个阶段检查点，将累计往返次数与阶段状态一并报告。**仅供参考**：该计数绝不会阻止流程；每个循环的上限仍是实际执行层。若一次运行超过其声明的最坏情况，则表明存在这些上限未涵盖的循环——应明确指出这一点，而不是默默继续。

---

## 跨运行裁决活动（#673；选择启用的建议性旁路通道）

状态跟踪器中的“裁决活动元数据”部分是唯一的生成方/状态权威来源。每次运行都会收到一个稳定且明确的 `run_id`。结构化处理程序首先以持久化方式应用其现有的作者选择、合规性覆盖、明确请求或 MANDATORY 检查点路由/状态效果，之后才以尽力而为的方式，将经过数据最小化处理的绑定追加到五行 `pending_adjudication_activity_bindings[]` 清单中。被拒绝的 MANDATORY 跳过操作会使状态保持不变，随后可选回执会存储 `skip_refused`。作者组使用 `artifact_group_stage`，并且可以同时保留阶段 3 和阶段 3-prime；回执阶段使用完整的阶段 1 至阶段 6 封闭枚举，其中不包含阶段 0。合规性处理允许仅包含普通报告且捕获数为零的组，并且仅在完全符合条件的覆盖情况下才要求配对的操作回执。

终止行为保持不变，并且优先运行。在已完成/已中止状态持久化之后，并且仅针对用户选择的本地存储，编排器会将明确的状态/产物根目录路径和明确的五行待处理数据传递给 `seal_terminal_inventory(state_path, artifact_root, pending_bindings)`，然后以尽力而为的方式运行密封清单的 `build-input`、幂等 `append-run` 以及可选的 `render`。该辅助程序负责计算哈希；它不会读取待处理状态、接受调用方提供的哈希、推断来源或执行扫描。根级 `run_id` 加上密封根级 `adjudication_activity_sources` 是确切的权威来源。任何活动故障都只是一项建议性诊断，不能影响已经持久化的终止结果。

活动数据绝不会进入材料护照、交接内容、流程记录、审阅者/模型/观察者/合规性输入、门控、裁决、检查点输入或阶段转换。任何实时模型、裁判、评估、网络/API、环境时钟、目录扫描或 glob 均不参与其中。完整详情和冻结的回执模式仍位于 `docs/design/2026-08-10-673-cross-run-adjudication-activity-spec.md` 和 `shared/contracts/activity/` 中。

---

## 可审计性与重放边界

流水线产物均经过版本控制、哈希处理且可供审计。可以针对相同的字节和配置重放确定性验证器。由 LLM 生成的文字和语义判断具有随机性，不提供字节级可复现性保证；应记录模型/配置和证据，以便检查差异。

> 有关标准化工作流契约、确定性重放边界、审计跟踪格式和产物跟踪，请参阅 `references/reproducibility_audit.md`。

---

## 阶段 6：流程总结协议

生成最终流程记录：论文创作历程、协作质量评估（6 个维度，1-100 分）以及 AI 自我反思报告。

**终止语义（#528）**：阶段 6 不是强制性的——用户可以在阶段 5 完成检查点拒绝执行该阶段（阶段 6 标记为 `skipped`；流水线仍以 `completed` 状态终止）。执行该阶段时，在流程记录交付后，编排器会提示用户进行终止确认——`finish` / `end` / `done` / `confirm`，或明确表示接受交付物的等效自然语言。确认后，阶段 6 将标记为 `completed`，并且流水线全局状态将设置为 `completed`；变更请求（其他语言版本、内容更正）会使阶段 6 保持 `in_progress`，且不被视为确认。请参阅 `references/pipeline_state_machine.md` § 阶段 6 终止语义。

> 有关完整工作流、必需的内容结构、评分维度和输出规范，请参阅 `references/process_summary_protocol.md`。

---

## 协作深度观察器（v3.5.0，仅提供建议——绝不阻塞）

`collaboration_depth_agent` 观察用户与流水线的协作模式。它**仅提供建议**，并且在任何检查点都**绝不阻塞**进程推进。它在设计上是 `non-blocking` 的，并在其 frontmatter 中携带 `blocking: false`，以此作为结构性保证。

**调用时机**：每个 FULL 检查点、每个 SLIM 检查点，以及阶段 6 记录汇编期间（全流水线分析会在生成和交付流程记录之前运行，因此其输出可以作为记录中的一个章节，由用户确认）。MANDATORY 检查点（阶段 2.5 / 4.5 完整性关卡）**不会**调用观察器——这些检查点关注的是完整性问题，不得受到干扰或弱化。

**具体作用**：读取刚完成阶段的对话范围（在检查点调用时）或整个流水线的对话（在阶段 6 记录汇编期间），依据 `shared/collaboration_depth_rubric.md` 中的规范评分量表对协作模式进行评分，并输出建议性区块/章节。维度包括：委托强度、认知警觉性、认知重新分配、区域分类（区域 1 / 区域 2 / 区域 3）。该评分量表基于 Wang & Zhang（2026）发表于 IJETHE 23:11 的研究（DOI 10.1186/s41239-026-00585-x）。

**与现有机制的区别**：

| 机制 | 评估内容 | 是否阻塞？ |
|---|---|---|
| `integrity_verification_agent`（阶段 2.5 / 4.5） | 论文内容——参考文献、引文、数据 | 是（阻塞性关卡） |
| 阶段 6 协作质量评估（6 个维度，1–100） | AI 对自身行为的自我反思 | 否，但仅生成一次 |
| `collaboration_depth_agent`（本观察器） | **用户的**协作模式（委托强度、警觉性、重新分配） | **否——绝不阻塞。仅提供建议。** |

**非阻塞保证**：
- 观察器输出绝不会出现在任何检查点的“已标记”行中。
- “准备继续吗？”提示不会因观察器输出而改变。
- `blocked_by: collaboration_depth_agent` 在 `state_tracker` 中绝不是合法状态。
- 如果观察器 frontmatter 声明 `blocking: true`，编排器必须拒绝调度它。

**跨模型**：设置 `ARS_CROSS_MODEL` 后，观察器会在两个模型上运行，并标记任何超过 2 分的维度差异。绝不会在模型之间悄然取分数平均值。

> 有关完整评分流程和反谄媚规范，请参阅 `agents/collaboration_depth_agent.md`；有关规范的 4 维评分量表，请参阅 `shared/collaboration_depth_rubric.md`。

---

## 反模式

为防止常见故障模式，明确禁止以下行为：

| # | 反模式 | 失败原因 | 正确行为 |
|---|-------------|-------------|-----------------|
| 1 | **跳过完整性检查** | “论文看起来没问题，跳过阶段 2.5/4.5” | 完整性检查是强制性的；无论感知到的质量如何，都不能自动跳过 |
| 2 | **编排器执行实质性工作** | 流水线编排器撰写内容或评审论文 | 编排器只负责调度和协调；实质性工作应由子技能完成 |
| 3 | **自动越过强制检查点** | 在 FULL 检查点未获得用户确认便进入下一阶段 | 强制检查点要求用户明确输入后才能继续 |
| 4 | **质量随阶段推进而下降** | 由于上下文窗口耗尽，阶段 4 的修订稿比阶段 2 的草稿更差 | 如果阶段 N 的输出质量 < 阶段 N-1，则暂停并重新加载核心原则，然后再继续 |
| 5 | **悄然遗漏评审者意见** | 修订只处理了 10 条意见中的 8 条，并寄希望于无人察觉 | R&R 跟踪表必须涵盖每一条意见，并明确标注状态 |
| 6 | **阶段 4.5 只重新核验已知问题** | 最终完整性检查只重新检查阶段 2.5 的发现 | 阶段 4.5 必须从头进行一次全新检查；修订可能会引入新问题 |
| 7 | **虚增协作质量分数** | 为避免尴尬的自我批评而给出 90/100 | 诚实优先：不虚增、不说客套话；每个分数都要引用具体证据 |
| 8 | **绕过故障模式检查清单区块**（v3.2） | “这份 7 模式检查清单是新增的，这次先跳过” | 阶段 2.5/4.5 的故障模式检查清单是强制且阻塞性的；不存在不留记录的绕过方式——每次覆盖都必须记录用户理由，供阶段 6 使用 |

---

## 质量标准

| 维度 | 要求 |
|-----------|------------|
| 阶段检测 | 正确识别用户当前所处阶段及已有材料 |
| 模式建议 | 根据用户偏好和材料状态推荐合适的模式 |
| 材料交接 | 阶段间的交接材料完整且格式正确 |
| 状态跟踪 | 实时更新流水线状态；进度仪表板准确无误 |
| **强制检查点** | **每个阶段完成后都必须获得用户确认** |
| **强制完整性检查** | **阶段 2.5 和 4.5 始终必须运行；如结果不是 PASS，必须获得用户明确且有记录的决定后才能继续** |
| **强制失败模式检查清单**（v3.2） | **阶段 2.5 和 4.5 必须运行包含 7 种模式的 AI 研究失败检查清单；疑似失败将阻止继续；覆盖检查结果需要用户说明理由** |
| 不越界 | ⚠️ 铁律：编排器不执行实质性的研究、写作或审查工作，只负责调度 |
| 不强迫 | ⚠️ 铁律：用户可以随时暂停或退出流水线（但不能跳过完整性检查） |
| 可审计工作流 | 可以使用相同的已声明契约和确定性验证器进行重放；模型/配置和随机输出保持可见，而不是承诺结果完全一致 |
| **具备收敛意识的停止机制** | **仅当不存在 P0、未解决且影响决策的回归、实质性的标准状态变更或尚未完成的必要操作时，才建议停止；用户可以覆盖此建议** |
| **预算透明度**（v3.2；#388） | **Token 成本估算 + 交互次数预算（往返次数上限 + 检查点处的累计次数，仅供参考）+ 流水线启动时的用户确认** |

---

## 错误恢复

| 阶段 | 错误 | 处理方式 |
|-------|-------|---------|
| 接收 | 无法确定入口点 | 询问用户拥有哪些材料以及其目标 |
| 阶段 1 | deep-research 无法收敛 | 建议切换模式（socratic -> full）或缩小范围 |
| 阶段 2 | 缺少研究基础 | 建议返回阶段 1 补充研究 |
| 阶段 2.5 | 经过 3 轮修正后仍为 FAIL | 列出无法验证的项目；由用户决定是否继续 |
| 阶段 3 | 审查结果为 Reject | 提供选项：进行重大重构（阶段 2）或放弃 |
| 阶段 4 | 未能完整修订所有项目 | 列出尚未处理的项目；询问是否继续 |
| 阶段 3' | 验证后仍存在重大问题 | 进入阶段 4' 进行最终修订 |
| 阶段 4' | 修订后问题仍然存在 | 标记为 Acknowledged Limitations；继续进入阶段 4.5 |
| 阶段 4.5 | 最终验证为 FAIL | 修复并重新验证（最多 3 轮） |
| 任意阶段 | 用户中途离开 | 保存流水线状态；下次可以从断点处恢复 |
| 任意阶段 | Skill 执行失败 | 报告错误；建议重试、暂停或切换模式。不得跳过强制完整性关卡或失败模式关卡 |

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
| `references/mode_advisor.md` | 统一的跨 Skill 决策树：将用户意图映射到最佳 Skill + 模式 |
| `references/claim_verification_protocol.md` | 阶段 E 主张验证协议：主张提取、来源追踪、交叉核验、结论分类体系 |
| `references/claim_audit_calibration_protocol.md` | v3.8 #103 claim_ref_alignment 审计校准：金标准集形态（T-C3）、阈值门槛 FNR<0.15 / FPR<0.10（T-C1）、按类别报告 FNR/FPR（T-C2）。通过 `PYTHONPATH=. python3 -m unittest scripts.test_claim_audit_calibration -v` 重新运行。 |
| `references/ai_research_failure_modes.md` | 7 类 AI 研究失败检查清单（Lu 2026），在阶段 2.5 + 4.5 运行并执行阻断行为，于阶段 6 报告 |
| `references/team_collaboration_protocol.md` | 多人团队协调：角色定义、交接协议、版本控制、冲突解决 |
| `references/integrity_review_protocol.md` | 阶段 2.5 + 4.5 完整性验证：五阶段协议详情 |
| `references/two_stage_review_protocol.md` | 两阶段审查：阶段 3 全面审查 + 阶段 3' 验证性审查 |
| `references/external_review_protocol.md` | 外部（人工）审稿人反馈：四步式接收/指导/修订/验证 |
| `references/process_summary_protocol.md` | 阶段 6：协作质量评估 + AI 自我反思报告 |
| `references/reproducibility_audit.md` | 标准化工作流契约、确定性重放边界和审计追踪格式 |
| `references/progress_dashboard_template.md` | ASCII 进度仪表板模板 |
| `references/reinforcement_content.md` | 用于转换的阶段特定强化重点表 |
| `references/changelog.md` | 完整版本历史 |
| `shared/handoff_schemas.md` | 跨 Skill 数据契约：适用于所有阶段间交接产物的 9 个 schema |
| `shared/collaboration_depth_rubric.md` | 协作深度观察者量规（v1.0）：基于 Wang & Zhang（2026）IJETHE 23:11 的 4 个维度 |

---

## 模板

| 模板 | 用途 |
|----------|---------|
| `templates/pipeline_status_template.md` | 进度仪表板输出模板 |

---

## 示例

| 示例 | 展示内容 |
|---------|-------------|
| `examples/full_pipeline_example.md` | 完整的流水线对话日志（阶段 1-5，包含完整性验证 + 两阶段审查） |
| `examples/mid_entry_example.md` | 从阶段 2.5 开始的中途进入示例（现有论文 -> 完整性检查 -> 审查 -> 修订 -> 定稿） |

---

## 输出语言

遵循用户使用的语言。学术术语保留为英文。

---

## 与其他 Skill 的集成

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
| `deep-research` | 调度（阶段 1 研究阶段） |
| `academic-paper` | 调度（阶段 2 写作、阶段 4/4' 修订、阶段 5 格式化） |
| `academic-paper-reviewer` | 调度（阶段 3 首次评审、阶段 3' 验证评审） |

---

## 模型分级（#517，可选）

设置 `ARS_MODEL_TIERING` 后，调度会话将根据 `shared/model_tiering.md` 为此技能的智能体选择模型（规范定义：完整的 39 智能体判断/执行表及规则）。简要规则：

- **未设置（默认）：**每个智能体都继承会话模型——与 #517 之前的行为逐字节等效。
- **`economy`**（前沿层级会话）：执行型智能体使用比会话模型低一个层级的模型——下限为 Opus 级，绝不低于此层级；判断型智能体继续使用会话模型。处于或低于下限时不执行任何操作（仅通知一次）。
- **`quality-boost`**（低于前沿层级的会话）：位于检查点界面（阶段 2.5/4.5 门控；可选启用的阶段 4→5 声明—引用审计；最终评审）的判断型智能体直接提升至前沿层级（无论相距多少个层级——并非仅提升一级）；绝不降级任何模型。已处于前沿层级时不执行任何操作（仅通知一次）。
- 未知值 → 警告一次，并按未设置处理。层级表示相对位置，绝不硬编码固定模型 ID。某一方向生效时，将同一阶段的重复调用路由至同一个工作智能体，以便累积其提示词缓存；未设置也意味着调度形式保持逐字节等效。

---

## 版本信息

| 项目 | 内容 |
|------|---------|
| 技能版本 | 3.20.1 |
| 最后更新 | 2026-08-15 |
| 维护者 | Cheng-I Wu |
| 依赖技能 | deep-research v2.0+、academic-paper v2.0+、academic-paper-reviewer v1.1+ |
| 角色 | 完整学术研究工作流编排器 |

---

## 变更日志

> 完整版本历史请参阅 `references/changelog.md`。