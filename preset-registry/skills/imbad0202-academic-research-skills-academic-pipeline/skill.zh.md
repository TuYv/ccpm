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

一个轻量级编排器，负责管理从研究探索到最终稿件的完整学术流水线。它不执行实质性工作——只负责检测阶段、推荐模式、分派技能、管理阶段转换和跟踪状态。

> **路由规范（v3.9.2）：** 有关跨技能路由规则，请参阅 `.claude/CLAUDE.md` 中的“Routing Discipline (v3.9.2)”以及 `shared/references/intent_clarification_protocol.md`。本技能假定路由已确定——含义模糊的跨阶段材料应已在上游得到澄清。

**v3.6.3（选择启用）：** 设置 `ARS_PASSPORT_RESET=1`，将 FULL 检查点提升为上下文重置边界。在新会话中使用 `resume_from_passport=<hash>`，从记录的阶段继续。请参阅 [`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md)。

**v3.8（选择启用）：** 设置 `ARS_CLAIM_AUDIT=1`，在阶段 4 → 阶段 5 的转换过程中启用 L3 声明忠实度审计门禁。设置该标志后，编排器会在 v3.7.1 引用时溯源终结器之后、`formatter_agent` 的硬门禁之前分派 `claim_ref_alignment_audit_agent`。该审计会按照 8 行矩阵生成 `claim_audit_results[]` + `uncited_assertions[]` + `claim_drifts[]` + `constraint_violations[]` + `audit_sampling_summaries[]` 聚合结果；HIGH-WARN 类别会通过格式化器的 REFUSE 规则 6-10 阻止输出。v3.8.0 默认关闭——启用计划推迟至获得校准后证据时再实施（规范 §5 模式标志理由）。请参阅 `agents/claim_ref_alignment_audit_agent.md` 和编排器 §3.6 正文。

**v2.0 核心改进**：
1. **强制用户确认检查点**——每个阶段完成后，都必须获得用户确认才能继续下一步
2. **学术诚信检查**——论文完成后、提交评审前，运行已声明参考文献、已登记声明和已报告数据检查；公开分母、抽样情况、未知状态和阻断性结论
3. **两阶段评审**——首次完整评审 + 修订后的重点验证评审
4. **最终诚信检查**——修订完成后，使用全新输入重新运行最终检查契约；只有在明确完整列出指定登记总体时，`100%` 才适用
5. **可审计**——对工作流产物进行版本控制、哈希计算和留存；确定性检查可以重放，但不承诺生成式输出在字节层面完全一致
6. **流程文档**——阶段 6 生成一份“论文创作过程记录”PDF，用于记录人机协作历史（在完成流水线的最终确认之前交付）

## 快速开始

**完整工作流（从头开始）：**
```
I want to write a research paper on the impact of AI on higher education quality assurance
```
--> academic-pipeline 启动，从阶段 1（RESEARCH）开始

**中途接入（已有论文）：**
```
I already have a paper, help me review it
```
--> academic-pipeline 检测到中途接入，从阶段 2.5（INTEGRITY）开始

**修订模式（已收到审稿人反馈）：**
```
I received reviewer comments, help me revise
```
--> academic-pipeline 检测到该请求，从阶段 4（REVISE）开始

**从通行证恢复（跨会话上下文重置，需主动启用）：**
```
resume_from_passport=<hash> [stage=<n>] [mode=<m>]
```
--> 加载 Material Passport（Schema 9），定位与 `<hash>` 匹配的 `kind: boundary` 条目，并确认不存在位于其后且已使用该条目的 `kind: resume` 条目。如果设置了 `pending_decision`，则会先触发决策提示，以便将用户的分支选择记录到审计账本中；即使用户提供了 `stage=`，也绝不会跳过该提示。完成提示后（或未设置 `pending_decision` 时立即执行），下一阶段按以下规则确定：(a) 如果提供了 `stage=<n>` CLI 覆盖值，则使用该值；否则 (b) 使用匹配选项的 `next_stage`；否则 (c) 使用边界条目中记录的 `next` 字段。CLI `stage=`/`mode=` 覆盖值的优先级高于选项路由。
- **门控条件（生成）**：生成边界的会话中必须设置 `ARS_PASSPORT_RESET=1`。如果没有该标志，则不会写入任何 `kind: boundary` 条目，也就没有可用于恢复的内容。
- **门控条件（恢复）**：无需标志。任何会话都可以针对包含与该哈希匹配的有效边界条目的通行证调用 `resume_from_passport=<hash>`。
- **用途**：在一个*全新的* Claude Code 会话中调用。在生成边界的同一会话中恢复不会节省 token，还可能丢失仍在该会话中有效的上下文。
- **阶段**：任意。根据上述路由规则确定恢复阶段。
- **参考资料**：[`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md) — 参见 §「`resume_from_passport` 模式契约」。

**执行流程：**
1. 检测用户当前所处阶段和可用材料
2. 为每个阶段推荐最佳模式
3. 为每个阶段分派相应的 skill
4. **每个阶段完成后，主动提示并等待用户确认**
5. 全程跟踪进度；可随时查看 Pipeline Status Dashboard

---

## 触发条件

### 触发关键词

**英语**：academic pipeline, research to paper, full paper workflow, paper pipeline, end-to-end paper, research-to-publication, complete paper workflow

**韩语**：학술 파이프라인, 연구부터 논문까지, 논문 전체 워크플로, 연구 주제 설정부터 논문 완성까지, 연구-논문 전 과정

### 不触发的场景

| 场景 | 应使用的 Skill |
|----------|-------------|
| 仅需搜索资料或进行文献综述 | `deep-research` |
| 仅需撰写论文（无需研究阶段） | `academic-paper` |
| 仅需评审论文 | `academic-paper-reviewer` |
| 仅需检查引用格式 | `academic-paper`（citation-check 模式） |
| 仅需转换论文格式 | `academic-paper`（format-convert 模式） |

### 触发排除条件

- 如果用户只需要单一功能（仅搜索资料、仅检查引用），则无需使用 pipeline——直接触发相应的 skill
- 如果用户已经在使用某个 skill 的特定模式，应遵循该入口；pipeline 需由用户主动选择启用
- pipeline 是可选的，并非强制使用

---

## 流水线阶段（10 个阶段）

| 阶段 | 名称 | 调用的 Skill / Agent | 可用模式 | 交付物 |
|-------|------|---------------------|----------------|-------------|
| 1 | 研究 | `deep-research` | socratic, full, quick | 研究问题简报、方法论、参考文献、综合分析 |
| 2 | 写作 | `academic-paper` | plan, full | 论文草稿 |
| **2.5** | **完整性检查** | **`integrity_verification_agent`** | **pre-review** | **完整性验证报告 + 修正后的论文** |
| 3 | 评审 | `academic-paper-reviewer` | full（包括魔鬼代言人评审） | 5 份评审报告 + 编辑决定 + 修订路线图 |
| 4 | 修订 | `academic-paper` | revision | 修订稿、对评审意见的回复 |
| **3'** | **重新评审** | **`academic-paper-reviewer`** | **re-review** | **验证性评审报告：修订回复检查清单 + 遗留问题** |
| **4'** | **再次修订** | **`academic-paper`** | **revision** | **第二版修订稿（如需要）** |
| **4.5** | **最终完整性检查** | **`integrity_verification_agent`** | **final-check** | **最终验证报告（声明的检查必须通过；已登记的分母以及未知/超出范围的状态保持可见）** |
| 5 | 最终定稿 | `academic-paper` | format-convert | 最终论文（默认为 MD；可用 Pandoc 时生成 DOCX，否则提供转换说明；询问是否需要 LaTeX；确认正确性；PDF） |
| **6** | **流程总结** | **编排器** | **auto** | **论文创作过程记录 MD + LaTeX 转 PDF（双语）** |

**并行化机会（v3.3）**：在阶段 2 中，`academic-paper` Skill 的阶段 1（literature_strategist_agent）和 `visualization_agent` 可以在阶段 2（structure_architect_agent）完成大纲后并行运行。具体而言：
- 大纲包含可视化计划后，`visualization_agent` 即可开始生成图表
- 与此同时，`argument_builder_agent` 可以构建 CER 链
- `draft_writer_agent` 会等待两者均完成后再开始阶段 4

这与 PaperOrchestra 在大纲（步骤 1）完成后并行执行绘图生成（步骤 2）和文献综述（步骤 3）的方式一致，从而减少流水线的总体延迟。并行化是可选的——为简单起见，默认仍采用顺序执行。

---

## 流水线状态机

1. **阶段 1 研究** -> 用户确认 -> 阶段 2
2. **阶段 2 写作** -> 用户确认 -> 阶段 2.5
3. **阶段 2.5 完整性检查** -> 通过 -> 阶段 3（失败 -> 修复并重新验证，最多 3 轮；之后进入完整性检查失败循环 -> 记录用户决定）
4. **阶段 3 评审** -> 接受 -> 阶段 4.5 / 小修|大修 -> 阶段 4 / 拒绝 -> 阶段 2 或结束
5. **阶段 4 修订** -> 用户确认 -> 阶段 3'
6. **阶段 3' 重新评审** -> 接受|小修 -> 阶段 4.5 / 大修 -> 阶段 4'
7. **阶段 4' 再次修订** -> 用户确认 -> 阶段 4.5（不再返回评审）
8. **阶段 4.5 最终完整性检查** -> 通过（零问题）-> 阶段 5（失败 -> 修复并重新验证；3 轮后仍未解决 -> 进入完整性检查失败循环 -> 记录用户决定）
9. **阶段 5 最终定稿** -> MD -> 可用 Pandoc 时生成 DOCX（否则提供说明）-> 询问是否需要 LaTeX -> 确认 -> PDF -> 完成检查点（完整模式）-> 阶段 6（用户可以拒绝阶段 6：标记为 `skipped`，流水线直接进入 `completed`）
10. **阶段 6 流程总结** -> 询问语言版本 -> 生成流程记录 MD -> LaTeX -> PDF -> 终止确认（`finish` / `end` / `done` / `confirm`，或含义明确的自然语言等效表达）-> 流水线全局状态 `completed`

参见 `references/pipeline_state_machine.md` 了解完整的状态转换定义。

---

## 自适应检查点系统

⚠️ **铁律——核心规则：每个阶段完成后，系统必须主动提示用户并等待确认。检查点的呈现方式会根据上下文和用户参与程度进行调整。**

### 检查点类型

| 类型 | 使用时机 | 内容 |
|------|-----------|---------|
| FULL | 首个检查点；完整性边界之后；阶段 5 完成时（最终交付物验收） | 完整交付物列表 + 决策仪表板 + 所有选项 |
| SLIM | 在非关键阶段连续收到 2 次以上“continue”响应后 | 单行状态 + 明确的继续/暂停提示 |
| MANDATORY | 完整性检查 FAIL；审查决策；阶段 5 入口门禁（最终定稿之前） | 不可跳过；需要用户明确输入 |

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

1. **首个检查点**：始终使用 FULL
2. **连续 2 次以上收到“continue”且未进行审查后**：提示用户注意（“You've continued [N] times in a row. Want to review progress?”）
3. **完整性边界（阶段 2.5、4.5）**：始终使用 MANDATORY
4. **审查决策（阶段 3、3'）**：始终使用 MANDATORY
5. **最终定稿之前（阶段 5 入口门禁）**：始终使用 MANDATORY——这是阶段 4.5 PASS 与阶段 5 调度之间的检查点，用户需在此明确确认继续，并作出最终定稿格式决策（引用样式）；阶段内的 LaTeX 问题和内容确认仍属于阶段 5 的执行过程。阶段 5 完成检查点（最终论文已交付、阶段 6 之前）使用 FULL——绝不使用 SLIM。参见 `references/pipeline_state_machine.md` § 阶段 5 边界语义
6. **所有其他阶段**：从 FULL 开始；如果用户说“just continue”，则降级为 SLIM

### 检查点规则

1. ⚠️ **铁律**：**不得自动跳过 MANDATORY 检查点**：即使上一阶段的结果完美无缺，在 MANDATORY 检查点仍需要用户明确输入
2. **用户可以调整**：在 FULL 和 MANDATORY 检查点，用户可以修改下一步的模式或设置
3. **便于暂停**：用户可以在任意检查点暂停，并在之后恢复
4. **SLIM 模式**：如果用户说“just continue”或“fully automatic”，后续非关键检查点将切换为 SLIM 格式（单行状态 + 明确的继续/暂停提示）
5. **参与度保障机制**：连续收到 4 次以上继续响应后，无论阶段类型如何，系统都会插入一个 FULL 检查点，以确保用户仍保持参与

### 自检问题（在每个 FULL 检查点）

在向用户呈现检查点之前，编排器会自问：

1. **引用完整性**：最新输出中是否存在任何未经验证的引用？
2. **迎合性让步**：最新阶段是否在没有提出异议的情况下，不加批判地接受了所有反馈？
3. **标准变化轨迹**：对于每个适用的具名标准，基于证据的状态是改善、保持不变、退步，还是变得不可比较？绝不能将其简化为隐藏的标量或 `latest >= previous`。对于任何尚未解决且会影响决策的退步，应暂停并予以标记；当标准或证据基础发生变化时，使用 `NOT_COMPARABLE`。
4. **范围约束**：最新阶段是否添加了用户或修订路线图未要求的内容？
5. **完整性**：此阶段所需的所有交付物是否均已提供？

如果任何答案引发担忧，请将其纳入呈现给用户的检查点内容中。

---

## 智能体团队（5 个智能体）

| # | 智能体 | 角色 | 文件 |
|---|-------|------|------|
| 1 | `pipeline_orchestrator_agent` | 主编排器：检测阶段、推荐模式、触发技能、管理阶段转换 | `agents/pipeline_orchestrator_agent.md` |
| 2 | `state_tracker_agent` | 状态跟踪器：记录已完成的阶段、已生成的材料和修订循环次数 | `agents/state_tracker_agent.md` |
| 3 | `integrity_verification_agent` | 完整性检查器：执行受覆盖范围约束的参考文献、引用、已登记声明和报告数据检查（明确给出阻断性结论） | `agents/integrity_verification_agent.md` |
| 4 | `collaboration_depth_agent` | **观察者（仅提供建议——绝不阻断）。**读取对话日志，并依据 `shared/collaboration_depth_rubric.md` 对用户与 AI 的协作模式进行评分。在 FULL/SLIM 检查点以及第 6 阶段记录汇编期间调用（在交付流程记录之前，对整个工作流进行检查）。基于 Wang & Zhang（2026）。 | `agents/collaboration_depth_agent.md` |
| 5 | `claim_ref_alignment_audit_agent` | **可选的声明忠实度审计器（v3.8 #103）。**审计抽样引用的声明 ↔ 参考文献一致性及负面约束合规性；输出逐声明的 `claim_audit_results[]`、`claim_drift[]`、`uncited_assertions[]`、`constraint_violations[]`。当请求 claim_audit 模式时，由编排器通过 §3.6 调度。 | `agents/claim_ref_alignment_audit_agent.md` |

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

**特定阶段的强化内容**：有关完整的“转换 → 强化重点”表，请参阅 `references/reinforcement_content.md`。

---

## 分阶段调用契约（v3.9.2）

academic-pipeline 是编排器技能，负责协调涵盖 10 个阶段的完整 ARS 流水线（委派给 deep-research、academic-paper、academic-paper-reviewer）。有两种调用模式：

**模式 A — 编排器驱动（默认）：** `pipeline_orchestrator_agent` 端到端运行所有阶段，并通过 Material Passport 跟踪状态。编排器会在适当的检查点调度 `state_tracker_agent`、`integrity_verification_agent`、`collaboration_depth_agent` 和 `claim_ref_alignment_audit_agent`。

**模式 B — 分阶段执行（跨会话恢复）：** 用户跨多个会话逐个调用阶段代理，通常通过 `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>` 实现（请参阅 `references/passport_as_reset_boundary.md`）。

在模式 B 中，下游技能（deep-research、academic-paper、academic-paper-reviewer）中的**单阶段代理（根据 `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md` 归为 Bucket A）在执行写入操作时，必须严格限制在其获分配的阶段内**。academic-pipeline 本身的 5 个代理在设计上均为跨阶段代理或元代理（Bucket C/D）——它们在设计上没有边界限制：

- `pipeline_orchestrator_agent`（D — 编排器，可查看完整流水线）
- `state_tracker_agent`（D — 元状态，覆盖所有阶段）
- `integrity_verification_agent`（C — Stage 2.5 / 4.5 跨技能关卡）
- `collaboration_depth_agent`（C — FULL/SLIM 检查点 + Stage 6 记录编制，仅提供建议）
- `claim_ref_alignment_audit_agent`（C — 可选择启用的声明审计，与阶段正交）

路由至模式 B 需要明确的用户信号——`/ars-<mode>` 斜杠命令或 `[direct-mode]` 前缀。对于存在歧义的跨阶段输入，默认按照 `.claude/CLAUDE.md` Routing Discipline + `shared/references/intent_clarification_protocol.md` 的规定要求澄清。**关键是：**如果针对存在歧义的跨阶段材料调度 `pipeline_orchestrator_agent`，编排器本身目前无法进行协调（这是 v3.10 conductor #134 的工作）——在 v3.9.2 中，此类情况会在编排器运行之前被路由至澄清流程。

**强制执行（v3.9.2）：**下游 Bucket A 代理上的 Phase Boundary 阻断 + 建议性验证器（`scripts/check_pipeline_integrity.py`）+ 在启用钩子的运行时中提供的确定性 PreToolUse 写入范围防护机制（#134 范围调整，PR #294）。多阶段封装 + 编排器结构化接收仍属于未来范围（#134 Slices 3-5）。

---

## 选择启用的探询分支账本（#743 alpha）

`ARS_INQUIRY_LEDGER=1` 会启用有界的
`inquiry-branch-ledger/1.0` 记忆界面。未设置或设为 `0` 时，不会生成任何账本
工件、指针、提示或摘要。即使已启用，单个线性分支也不会具现化账本；记录的
第二个分支才是第一个合法的发布点。

编排器负责交互界面，而确定性运行时
`scripts/inquiry_branch_ledger.py` 负责验证、重放、追加、
配置文件预算检查、指针绑定和崩溃恢复。对于每个账本绑定，重放都会接收
完全一致的配置文件；它绝不会在缺少历史字节时用当前回退项替代。AI 分面最初处于 `parked`
状态，并且只能通过显式的、与来源绑定的采纳回执转为作者所有。重新打开
只会将作者记录的一阶工件标记为过时，绝不会重写
它们。

仅在阶段 1 设计冻结检查点、阶段 2.5 和 4.5 的强制检查点，或紧接在
记录到重新打开条件信号之后，呈现运行时的紧凑摘要。关闭该标志或最多只有一个分支时，
应完全省略此区块。每个显示的交互都提供 `skip`、`off` 和
重置为简单路径选项；这些选项会隐藏后续界面，但不会删除账本。
该摘要是建议性的状态记忆，绝不会改变完整性判定或
检查点要求。完整协议和崩溃语义：
`docs/design/2026-08-17-743-inquiry-branch-ledger-design.md`。

---

## 完整性审查协议

阶段 2.5（审查前）和阶段 4.5（修订后）验证。五阶段协议：参考文献 → 引用语境 → 统计数据 → 原创性 → 声明。

⚠️ **铁律**：阶段 4.5 必须在阶段 5 之前达成有记录的最终解决结果：PASS；或者，在三轮完整性 FAIL 循环耗尽后，由用户针对列出的未解决事项作出明确且有记录的决定（重复推翻时，对理由的要求会逐步提高；参见 `shared/compliance_checkpoint_protocol.md`）。绝不允许静默丢弃未解决事项。阶段 4.5 会从头开始执行一次全新的检查，不依赖阶段 2.5 的结论；这并不表示各次检查的错误过程相互独立。

⚠️ **铁律（v3.2）**：阶段 2.5 和阶段 4.5 还必须运行 **AI 研究失败模式检查清单**——这是一套包含 7 种模式的分类体系，将引用幻觉检查扩展到实现缺陷、虚构结果、依赖捷径、将缺陷误当作洞见、捏造方法论以及流水线级框架锁定。如果 7 种模式中的任何一种为 `SUSPECTED`，或者模式 1/3/5/6 为 `INSUFFICIENT EVIDENCE`，流水线将被**阻断**，并且用户必须确认知悉（确认 / 提供理由后推翻 / 修订），流水线才能继续。任何配置标志都无法解除此阻断；唯一的通过方式是获得上述有记录的用户确认——这是一种带有审计记录、基于信任的控制措施。随后，阶段 6 的流程摘要会将完整的失败模式审计日志作为 AI 自我反思报告的一部分进行报告。

> 有关五阶段引用/声明验证流程，请参见 `references/integrity_review_protocol.md`。
> 有关包含 7 种模式的 AI 研究失败检查清单及阻断/推翻逻辑，请参见 `references/ai_research_failure_modes.md`。

- [v3.4.0] `compliance_agent` 运行模式感知的 PRISMA-trAIce + RAISE 合规性检查；采用基于层级的阻断语义。参见 `shared/compliance_checkpoint_protocol.md`。

### 扭曲短语建议（#660）

在第 4.5 阶段精确通过之后、紧接第 5 阶段格式化之前，编排器使用用户明确提供的快照或合成固件快照，以及绑定至原始快照 SHA-256 的分离清单，对已接受工作草稿的确切内容运行确定性的 #660 检查器；未提供快照时，会生成明确的 `not_checked` 工件。该路径不附带原生 PPS 内容、导入器、获取器或再分发的短语列表，也不使用实时模型、外部 API、人工或模型评判者，亦不使用环境时钟；时间戳均为显式输入。其针对自身草稿的结果为 `HEURISTIC-ADVISORY` / `UNMEASURED`，绝不会更改第 4.5 阶段的 PASS 结果或第 5 阶段关卡，绝不会重写正文，并且只有在修订版本重新进入现有的完整性/筛查序列后才能重新运行。

对于文献语料库，非原位生成器会针对每个 `cited_title` 和 `cited_abstract` 分别生成一条当前的 v1.2 建议记录；缺失的摘要会明确保持为 `not_checked` / `unresolved`，并带有 `ABSTRACT_MISSING`。下游使用者均为只读，并将每条记录整合到现有的唯一 `Bibliographic Integrity Advisories` 章节中。该建议不会生成任何标记，不会触发任何终止策略、关卡、终结器升级、排名、引文重写或替换文本，也不支持关于草稿无问题、来源、论文工厂、上下文有效性、出版商接受度或匹配器准确性的任何声明。

### 跨文档一致性建议（#672）

具备 shell 能力的第 1 阶段分派器是唯一可以调用
`scripts/build_cross_document_consistency_advisory.py
build-preregistration-artifact` 的使用者。无 shell 能力的研究架构师仅提供
调用方声明和已命名的配套句柄。由此产生的确切 sidecar
和所提供的配套项会经过重放验证，并在每次交接中逐字节原样传递。
遗漏、静默替换、模板替换或摘要修复均属无效。

在同一个精确的第 4.5 阶段 PASS 之后，唯一且强制执行的第 5 阶段入口
检查点先运行 #660，再运行 #672。两者绑定同一个已接受
草稿；#660 的 `input_binding.artifact.artifact_id/artifact_sha256` 必须等于 #672
的 `input_binding.accepted_draft_artifact_id/accepted_draft_sha256`。它们仍是
相互独立的载体，具有不同的失败语义：退出码为 1 时保留模式有效的 #660
降级工件；#672 合约/运行时失败时不写入任何工件，
仅记录有界的 `ADVISORY_UNAVAILABLE:<CODE>`。

#672 始终为 `LLM-ADVISORY` / `UNMEASURED`。它没有分数、通过/失败、关卡、
就绪状态、授权、ClaimIntent、重写、同意书/协议重复项或
无问题/一致性含义。它不能更改第 4.5 阶段，不能阻断或延迟现有
检查点，也不能在用户确认后更改第 5 阶段路由。手稿
修订会使两项建议均失效，并且必须重新进入完整性检查，然后按此顺序针对
新接受的字节重新运行 #660 和 #672。

---

## 两阶段审查协议

阶段 3（完整审查，5 名审查者）→ 修订指导 → 阶段 4 → 阶段 3'（复审）→ 可选的遗留问题指导 → 阶段 4'。

阶段 3' 默认按照 #576「证据先于说服」三道关卡契约运行：编排器会生成一份与哈希绑定的输入清单，依次执行第 1 阶段（标准承诺，不查看修订）→ 第 2A 阶段（证据裁定，不受说服内容影响）→ 第 2B 阶段（主张匹配，公开信函），并且在呈现任何决定之前，将调用 `scripts/check_re_review_synthesis.py` 作为强制步骤——结果为 Accept / Minor / Major、`user_review_required` 延后处理，或以关闭方式安全中止（绝不为 Reject）。无论走哪条路径，辅助文件中冻结的 `previously_missed`/`indeterminate` 新问题记录都会转交至阶段 4.5。旧版单轮复审需要显式设置 `ARS_RE_REVIEW_LEGACY=1` 标志，并会标记为 `[LEGACY-NO-CONTRACT]`。依据：`pipeline_orchestrator_agent.md` § 阶段 3' 复审契约分发 + `academic-paper-reviewer/references/re_review_mode_protocol.md`。

> 有关详细的阶段流程和指导对话限制，请参阅 `references/two_stage_review_protocol.md`。

---

## 中途进入协议

用户可以从任意阶段进入。编排器将：

1. **检测材料**：分析用户提供的内容，确定当前有哪些可用材料
2. **识别缺口**：检查目标阶段需要哪些前置材料
3. **建议补全**：如果缺少关键材料，建议是否返回较早的阶段
4. **直接进入**：如果材料充分，则直接开始指定阶段

**重要：中途进入不能跳过阶段 2.5**
- 如果用户带着论文直接进入，应先完成阶段 2.5（完整性检查），再进入阶段 3（审查）
- 唯一例外：用户可以提供此前的完整性验证报告，且内容未被修改

---

## 外部审查协议

处理外部（人工）审查者反馈的整合。四步工作流：接收与结构化 → 战略性修订指导 → 修订与回复 → 自我验证。

> 有关完整的四步工作流、指导对话模式和能力边界，请参阅 `references/external_review_protocol.md`。

---

## 进度仪表板

在 FULL 检查点显示 ASCII 仪表板，以展示流程进度。

> 有关仪表板模板，请参阅 `references/progress_dashboard_template.md`。

---

## 修订循环管理

- 阶段 3（首次审查）-> 阶段 4（修订）-> 阶段 3'（验证性审查）-> 阶段 4'（再次修订，如有需要）-> 阶段 4.5（最终验证）
- **最多进行 1 轮再次修订**（阶段 4'）：如果阶段 3' 给出 Major，则进入阶段 4' 进行修订，之后直接进入阶段 4.5（不返回审查阶段）
- **流程会覆盖 academic-paper 最多修订 2 轮的规则**：在此流程中，修订仅限于阶段 4 + 阶段 4'（各一轮），取代 academic-paper 最多修订 2 轮的规则
- 将未解决的问题标记为已确认的局限性
- 提供累积修订历史（每一轮的决定、已处理事项、未解决事项）

### 提前停止标准

在每轮修订结束时，仅当**不存在任何 P0 问题**、**不存在任何未解决且影响决策的回归**、**没有任何适用标准发生需要再次修订的实质性状态变化**，并且**作者没有任何尚未完成的必需操作**时，才建议停止。说明与标准绑定的依据；不要计算分数增量，也不要将标签数量的微小变化视为收敛。用户可以否决该建议。硬性上限：2 个完整修订循环（阶段 4 + 阶段 4'）。

### 预算透明度（v3.2；交互次数扩展 #89/#388）

在流水线开始时，根据论文长度、模式和跨模型开关估算 token 成本。展示估算结果，并在阶段 1 开始之前请求用户确认。

在 token 估算结果之外，还应展示**交互次数预算**：长周期文档损坏会随文档往返次数而累积，而不是随 token 量累积（DELEGATE-52，arXiv:2604.15597）。列出流水线已实施的往返次数上限——2 个完整修订循环（参见上面的提前停止标准）、8 + 5 轮苏格拉底式辅导（阶段 3→4 / 3'→4'），以及阶段 2.5/4.5 的完整性门禁修复→重新验证循环——并说明这些上限对于所选模式所对应的最坏情况往返总次数。在每个阶段检查点，将累计往返次数与阶段状态一并报告。**仅供参考**：该计数永远不会阻止流程；各循环上限仍是实际执行约束。如果一次运行超过其声明的最坏情况，则表明存在一个未被这些上限覆盖的循环——应明确指出这一点，而不是静默继续。

---

## 跨运行裁决活动（#673；可选择启用的建议性旁路通道）

状态跟踪器中的“裁决活动元数据”部分是唯一的生成方/状态权威来源。每次运行都会获得一个稳定且显式的 `run_id`。结构化处理程序首先持久应用其现有的作者选择、合规覆盖、显式请求或 MANDATORY 检查点的路由/状态效果，然后才以尽力而为的方式，将经过数据最小化处理的绑定追加到五行 `pending_adjudication_activity_bindings[]` 清单中。被拒绝的 MANDATORY 跳过操作会先保持状态不变，之后可选回执再存储 `skip_refused`。作者组使用 `artifact_group_stage`，并且可以同时保留阶段 3 和阶段 3-prime；回执阶段使用完整的阶段 1 至阶段 6 闭合枚举，不包含阶段 0。对于合规处理，允许使用仅报告且捕获数量为零的普通组，并且仅在完全符合条件的覆盖情况下才要求配对的操作回执。

终止行为保持不变，并且优先执行。在已完成/已中止状态持久化之后，并且仅针对用户选择的本地存储，编排器会将显式状态/制品根目录路径以及显式的五行待处理记录传递给 `seal_terminal_inventory(state_path, artifact_root, pending_bindings)`，随后以尽力而为的方式运行已密封清单的 `build-input`、幂等的 `append-run` 以及可选的 `render`。该辅助程序会计算哈希；它不会读取待处理状态、接受调用方提供的哈希、推断来源或执行扫描。根级 `run_id` 加上已密封根级 `adjudication_activity_sources` 是确切的权威来源。任何活动失败都只是一项建议性诊断，不能影响已持久化的终止结果。

活动数据绝不会进入材料通行证、交接、流程记录、审阅者/模型/观察者/合规输入、门禁、裁决、检查点输入或阶段转换。任何实时模型、裁判、评估、网络/API、环境时钟、目录扫描或 glob 均不参与其中。完整细节和冻结的回执模式保留在 `docs/design/2026-08-10-673-cross-run-adjudication-activity-spec.md` 和 `shared/contracts/activity/` 中。

---

## 可审计性和重放边界

流水线产物均经过版本控制、哈希处理，并且可供审计。确定性验证器可以针对相同的字节和配置进行重放。由 LLM 生成的文本和语义判断具有随机性，不提供字节级可复现性保证；应记录模型/配置和证据，以便检查差异。

> 有关标准化工作流契约、确定性重放边界、审计轨迹格式和产物跟踪，请参阅 `references/reproducibility_audit.md`。

---

## 阶段 6：流程总结协议

生成最终流程记录：论文创作历程、协作质量评估（6 个维度，1-100 分）以及 AI 自我反思报告。

**终止语义（#528）**：阶段 6 并非强制执行——用户可以在阶段 5 完成检查点选择不执行（阶段 6 标记为 `skipped`；流水线仍以 `completed` 状态终止）。执行阶段 6 时，在交付流程记录后，编排器会提示用户进行终止确认——`finish` / `end` / `done` / `confirm`，或明确表示接受交付物的等效自然语言。确认后，阶段 6 标记为 `completed`，流水线全局状态设为 `completed`；变更请求（另一语言版本、内容修正）会使阶段 6 保持 `in_progress`，不视为确认。请参阅 `references/pipeline_state_machine.md` § 阶段 6 终止语义。

> 有关完整工作流、必需的内容结构、评分维度和输出规范，请参阅 `references/process_summary_protocol.md`。

---

## 协作深度观察器（v3.5.0，仅提供建议——绝不阻塞）

`collaboration_depth_agent` 观察用户与流水线的协作模式。它**仅提供建议**，在任何检查点都**绝不会阻塞**进程推进。它在设计上属于 `non-blocking`，并在其 frontmatter 中携带 `blocking: false`，以此作为结构性保证。

**调用时机**：每个 FULL 检查点、每个 SLIM 检查点，以及阶段 6 的记录编制期间（全流水线遍历会在生成并交付流程记录之前运行，因此其输出可以成为由用户确认的记录中的一个章节）。MANDATORY 检查点（阶段 2.5 / 4.5 完整性门禁）**不会**调用观察器——这些检查点关注完整性问题，绝不能削弱其作用。

**执行内容**：读取刚完成阶段的对话范围（在检查点调用时）或整个流水线的对话（在阶段 6 记录编制期间），依据 `shared/collaboration_depth_rubric.md` 中的规范量表对协作模式进行评分，并输出建议性区块/章节。维度包括：委派强度、认知警觉性、认知重新分配、区域分类（区域 1 / 区域 2 / 区域 3）。该量表基于 Wang & Zhang（2026）发表于 IJETHE 23:11 的研究（DOI 10.1186/s41239-026-00585-x）。

**与现有机制的区别**：

| 机制 | 评估对象 | 是否阻塞？ |
|---|---|---|
| `integrity_verification_agent`（阶段 2.5 / 4.5） | 论文内容——参考文献、引文、数据 | 是（阻塞关卡） |
| 阶段 6 协作质量评估（6 个维度，1–100 分） | AI 对自身行为的自我反思 | 否，但仅生成一次 |
| `collaboration_depth_agent`（此观察器） | **用户的**协作模式（委派强度、警觉性、重新分配） | **否——绝不阻塞。仅提供建议。** |

**非阻塞保证**：
- 观察器输出绝不会出现在任何检查点的“Flagged”行中。
- `Ready to proceed?` 提示不受观察器输出影响。
- 在 `state_tracker` 中，`blocked_by: collaboration_depth_agent` 绝不是合法状态。
- 如果观察器的 frontmatter 曾声明 `blocking: true`，编排器必须拒绝调度它。

**跨模型**：设置 `ARS_CROSS_MODEL` 后，观察器会在两个模型上运行，并标记任何超过 2 分的维度差异。绝不会在模型之间静默取分数平均值。

> 完整的评分流程和反迎合规范请参阅 `agents/collaboration_depth_agent.md`；规范的四维评分标准请参阅 `shared/collaboration_depth_rubric.md`。

---

## 反模式

为防止常见故障模式，明确禁止以下行为：

| # | 反模式 | 失败原因 | 正确行为 |
|---|-------------|-------------|-----------------|
| 1 | **跳过完整性检查** | “论文看起来没问题，跳过阶段 2.5/4.5” | 完整性检查是强制性的；无论感知到的质量如何，都不能自动跳过 |
| 2 | **编排器执行实质性工作** | 流水线编排器撰写内容或审阅论文 | 编排器只负责调度和协调；实质性工作由子技能完成 |
| 3 | **自动越过强制检查点** | 在 FULL 检查点未经用户确认就进入下一阶段 | 强制检查点要求收到明确的用户输入后才能继续 |
| 4 | **质量随阶段推进而下降** | 由于上下文窗口耗尽，阶段 4 的修订稿比阶段 2 的初稿更差 | 如果阶段 N 的输出质量低于阶段 N-1，则暂停并重新加载核心原则，然后再继续 |
| 5 | **静默遗漏审稿人关切** | 修订只处理 10 项关切中的 8 项，并希望无人察觉 | R&R 跟踪表必须涵盖每一项关切，并明确记录其状态 |
| 6 | **阶段 4.5 仅重新验证已知问题** | 最终完整性检查仅重新检查阶段 2.5 的发现 | 阶段 4.5 必须从头进行一次全新的检查；修订可能会引入新问题 |
| 7 | **虚增协作质量分数** | 为避免尴尬的自我批评而给出 90/100 | 诚实优先：不虚增分数，不说客套话；每项评分都要引用具体证据 |
| 8 | **绕过故障模式检查清单区块**（v3.2） | “这份 7 模式检查清单是新加入的，这次先跳过” | 阶段 2.5/4.5 的故障模式检查清单是强制且阻塞性的；不存在不留记录的绕过方式——每次覆盖都需要记录用户的理由，以供阶段 6 使用 |

---

## 质量标准

| 维度 | 要求 |
|-----------|------------|
| 阶段检测 | 正确识别用户当前所处阶段及可用材料 |
| 模式推荐 | 根据用户偏好和材料状态推荐适当的模式 |
| 材料交接 | 阶段间的交接材料完整且格式正确 |
| 状态跟踪 | 实时更新流水线状态；进度仪表板准确无误 |
| **强制检查点** | **每个阶段完成后都必须获得用户确认** |
| **强制完整性检查** | **始终运行阶段 2.5 和 4.5；若结果不是 PASS，必须获得用户明确且有记录的决定后才能继续** |
| **强制失效模式检查清单** (v3.2) | **阶段 2.5 和 4.5 必须运行包含 7 种模式的 AI 研究失效检查清单；疑似失效将阻止继续；覆盖检查结果需用户提供理由** |
| 不越界 | ⚠️ 铁律：编排器不执行实质性的研究、写作或审阅工作，只负责分派任务 |
| 不强迫 | ⚠️ 铁律：用户可以随时暂停或退出流水线（但不能跳过完整性检查） |
| 可审计工作流 | 可以重放相同的已声明契约和确定性验证器；模型/配置和随机输出保持可见，而不是承诺结果完全相同 |
| **具备收敛意识的停止机制** | **仅当不存在 P0、未解决且影响决策的回归、实质性的标准状态变化或尚未完成的必要操作时，才建议停止；用户可以覆盖该建议** |
| **预算透明度** (v3.2; #388) | **Token 成本估算 + 交互次数预算（往返次数上限 + 在检查点处统计的累计次数，仅供参考）+ 流水线启动时的用户确认** |

---

## 错误恢复

| 阶段 | 错误 | 处理方式 |
|-------|-------|---------|
| 接入 | 无法确定进入点 | 询问用户拥有哪些材料以及目标是什么 |
| 阶段 1 | deep-research 未收敛 | 建议切换模式（socratic -> full）或缩小范围 |
| 阶段 2 | 缺少研究基础 | 建议返回阶段 1 补充研究 |
| 阶段 2.5 | 经过 3 轮修正后仍为 FAIL | 列出无法验证的项目；由用户决定是否继续 |
| 阶段 3 | 审阅结果为 Reject | 提供选项：进行重大重构（阶段 2）或放弃 |
| 阶段 4 | 未完成所有项目的修订 | 列出未处理的项目；询问是否继续 |
| 阶段 3' | 验证后仍存在重大问题 | 进入阶段 4' 进行最终修订 |
| 阶段 4' | 修订后仍存在问题 | 标记为 Acknowledged Limitations；继续进入阶段 4.5 |
| 阶段 4.5 | 最终验证为 FAIL | 修复并重新验证（最多 3 轮） |
| 任意阶段 | 用户中途离开 | 保存流水线状态；下次可从断点恢复 |
| 任意阶段 | Skill 执行失败 | 报告错误；建议重试、暂停或切换模式。不得跳过强制完整性门禁或失效模式门禁 |

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
| `references/plagiarism_detection_protocol.md` | Phase D 原创性验证协议 + 自我抄袭 + AI 文本特征 |
| `references/mode_advisor.md` | 统一的跨 Skill 决策树：将用户意图映射到最优 Skill + 模式 |
| `references/claim_verification_protocol.md` | Phase E 主张验证协议：主张提取、来源追踪、交叉核查、判定分类体系 |
| `references/claim_audit_calibration_protocol.md` | v3.8 #103 claim_ref_alignment 审计校准：gold-set 结构 (T-C3)、阈值门控 FNR<0.15 / FPR<0.10 (T-C1)、按类别报告 FNR/FPR (T-C2)。通过 `PYTHONPATH=. python3 -m unittest scripts.test_claim_audit_calibration -v` 重新运行。 |
| `references/ai_research_failure_modes.md` | 7 模式 AI 研究失败检查清单 (Lu 2026)，在 Stage 2.5 + 4.5 运行，具有阻断行为，并在 Stage 6 报告 |
| `references/team_collaboration_protocol.md` | 多人团队协调：角色定义、交接协议、版本控制、冲突解决 |
| `references/integrity_review_protocol.md` | Stage 2.5 + 4.5 完整性验证：5 阶段协议详情 |
| `references/two_stage_review_protocol.md` | 两阶段评审：Stage 3 全面评审 + Stage 3' 验证性评审 |
| `references/external_review_protocol.md` | 外部（人工）评审者反馈：4 步接收/指导/修订/验证 |
| `references/process_summary_protocol.md` | Stage 6：协作质量评估 + AI 自我反思报告 |
| `references/reproducibility_audit.md` | 标准化工作流契约、确定性重放边界和审计追踪格式 |
| `references/progress_dashboard_template.md` | ASCII 进度仪表板模板 |
| `references/reinforcement_content.md` | 用于阶段转换的特定 Stage 强化重点表 |
| `references/changelog.md` | 完整版本历史 |
| `shared/handoff_schemas.md` | 跨 Skill 数据契约：适用于所有阶段间交接产物的 9 个 schema |
| `shared/collaboration_depth_rubric.md` | Collaboration Depth Observer 量规 (v1.0)：基于 Wang & Zhang (2026) IJETHE 23:11 的 4 个维度 |

---

## 模板

| 模板 | 用途 |
|----------|---------|
| `templates/pipeline_status_template.md` | 进度仪表板输出模板 |

---

## 示例

| 示例 | 展示内容 |
|---------|-------------|
| `examples/full_pipeline_example.md` | 完整的 pipeline 对话日志（Stage 1-5，包含完整性验证 + 两阶段评审） |
| `examples/mid_entry_example.md` | 从 Stage 2.5 开始的中途进入示例（已有论文 -> 完整性检查 -> 评审 -> 修订 -> 最终定稿） |

---

## 输出语言

遵循用户所用语言。Academic terminology 保留 English。

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
| `deep-research` | 被调度（阶段 1 研究阶段） |
| `academic-paper` | 被调度（阶段 2 写作、阶段 4/4' 修订、阶段 5 格式化） |
| `academic-paper-reviewer` | 被调度（阶段 3 首次审阅、阶段 3' 验证性审阅） |

---

## 模型分层（#517，可选）

设置 `ARS_MODEL_TIERING` 后，调度会话将依据 `shared/model_tiering.md` 为此技能的智能体分配模型（规范定义：完整的 39 智能体判断/执行分类表及规则）。简要规则：

- **未设置（默认）：**每个智能体均继承会话模型——与 #517 之前的行为在字节层面完全一致。
- **`economy`**（前沿层级会话）：执行型智能体使用比会话模型低一个层级的模型——下限为 Opus 级，绝不更低；判断型智能体仍使用会话模型。处于或低于下限时不执行任何操作（仅提示一次）。
- **`quality-boost`**（低于前沿层级的会话）：检查点环节中的判断型智能体（阶段 2.5/4.5 门控；可选择启用的阶段 4→5 声明—引用审计；最终审阅）直接提升至前沿层级（无论相距多少层级——并非仅提升一级）；绝不降级。已处于前沿层级时不执行任何操作（仅提示一次）。
- 未知值 → 警告一次，并按未设置处理。层级表示相对位置，绝不硬编码固定模型 ID。启用某一方向时，同一阶段的重复调用应路由至同一个工作智能体，以便累积其提示词缓存；未设置也意味着调度结构在字节层面保持完全一致。

---

## 版本信息

| 项目 | 内容 |
|------|---------|
| 技能版本 | 3.21.0 |
| 最后更新 | 2026-08-18 |
| 维护者 | Cheng-I Wu |
| 依赖技能 | deep-research v2.0+、academic-paper v2.0+、academic-paper-reviewer v1.1+ |
| 角色 | 完整学术研究工作流编排器 |

---

## 更新日志

> 完整版本历史请参阅 `references/changelog.md`。