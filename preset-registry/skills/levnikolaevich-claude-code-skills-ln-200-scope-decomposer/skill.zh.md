---
name: ln-200-scope-decomposer
description: "Decomposes scope into Epics, Stories, and RICE priorities. Use when user has project scope and wants full Agile breakdown."
disable-model-invocation: true
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 范围分解器（顶层编排器）

**类型：** L1 顶层编排器  
**类别：** 2XX 规划

顶层编排器，用于通过 Epic 和故事协调器，将完整计划从范围分解为用户故事。

## 目的

### 此技能的作用

协调新计划的完整分解流水线：
- 从 kanban_board.md 自动发现团队 ID
- **阶段 1：** 发现（团队 ID）
- **阶段 2：** Epic 分解（委托给 ln-210-epic-coordinator）
- **阶段 3：** 故事分解循环（批量预计算只读输入，然后按顺序针对每个 Epic 委托给 ln-220-story-coordinator）
- **阶段 4：** RICE 优先级排序循环（可选，预计算子运行时输入，然后按顺序针对每个适用的 Epic 委托给 ln-230-story-prioritizer）
- **阶段 5：** 总结（总数 + 后续步骤）

## 运行时契约

**必须阅读：** 加载 `references/coordinator_runtime_contract.md`、`references/scope_decomposition_runtime_contract.md`、`references/scope_decomposition_summary_contract.md`、`references/epic_plan_summary_contract.md`、`references/coordinator_summary_contract.md`

运行时系列：`scope-decomposition-runtime`

标识符：
- 范围标识符

阶段：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_EPIC_DECOMPOSITION`
4. `PHASE_3_STORY_LOOP`
5. `PHASE_4_PRIORITIZATION_LOOP`
6. `PHASE_5_FINALIZE`
7. `PHASE_6_SELF_CHECK`

协调器摘要契约：
- 使用来自 `ln-210` 的 `epic-plan`
- 使用来自 `ln-220` 的 `story-plan`
- 使用来自 `ln-230` 的 `story-prioritization-worker`
- 在 `PHASE_5_FINALIZE` 期间写入最终的 `scope-decomposition` 协调器摘要

## 工作器调用（必须）

**宿主技能调用：** 必须通过 `Skill(skill: "...", args: "...")` 进行委托。
- Claude：严格按照所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用技能中找到指定技能，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该技能工作流，然后携带其结果/工件返回此处。
- 不得内联工作器逻辑，也不得在未执行目标技能的情况下将工作器标记为完成。

各阶段委托的工作器：

- 阶段 2：`ln-210-epic-coordinator` — Epic 分解（创建/重新规划）
- 阶段 3：`ln-220-story-coordinator` — 按 Epic 进行故事分解（顺序执行）
- 阶段 4：`ln-230-story-prioritizer` — 按 Epic 进行可选的 RICE 优先级排序（顺序执行）

```text
# Phase 2 — Epic decomposition
node references/scripts/epic-planning-runtime/cli.mjs start --identifier {scopeIdentifier} --manifest-file {epicManifestPath}
Skill(skill: "ln-210-epic-coordinator", args: "{scopeIdentifier} --manifest-file {epicManifestPath}")
node references/scripts/scope-decomposition-runtime/cli.mjs record-epic-summary --identifier {scopeIdentifier} --payload-file {epicSummaryArtifactPath}

# Phase 3 — Story decomposition (per Epic, sequential)
node references/scripts/story-planning-runtime/cli.mjs start --epic {epicId} --manifest-file {storyManifestPath}
Skill(skill: "ln-220-story-coordinator", args: "{epicId} --manifest-file {storyManifestPath}")
node references/scripts/scope-decomposition-runtime/cli.mjs record-story-summary --identifier {scopeIdentifier} --payload-file {storySummaryArtifactPath}

# Phase 4 — RICE prioritization (optional, per Epic, sequential)
node references/scripts/planning-worker-runtime/cli.mjs start --skill ln-230 --identifier {identifier} --manifest-file {prioritizationManifestPath} --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}
child_run = { skill, run_id, identifier, summary_artifact_path }
childSummaryArtifactPath = .hex-skills/runtime-artifacts/runs/{parent_run_id}/story-prioritization-worker/ln-230--{identifier}.json
Skill(skill: "ln-230-story-prioritizer", args: "{identifier} --epic {epicId} --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}")
Read {childSummaryArtifactPath}
node references/scripts/scope-decomposition-runtime/cli.mjs record-prioritization-summary --identifier {scopeIdentifier} --payload-file {childSummaryArtifactPath}
```

## TodoWrite 格式（强制）

```text
- Phase 1: Discover top-level scope context (pending)
- Phase 2: Run Epic decomposition (pending)
- Phase 3: Run sequential Story loop (pending)
- Phase 4: Run optional prioritization loop (pending)
- Phase 5: Finalize scope summary (pending)
- Phase 6: Self-check (pending)
```

### 何时使用此 Skill

此 Skill 应在以下情况下使用：
- 启动需要完整分解的新计划（scope → Epics → Stories）
- 在单个工作流中自动完成 Epic + Story 创建
- 相比手动逐步调用，更倾向于使用完整流水线
- 需要为新项目采用高时间效率的方法（端到端 2-3 小时）

**替代方案：** 如需精细控制，请手动调用协调器：
1. [ln-210-epic-coordinator](../ln-210-epic-coordinator/SKILL.md) - CREATE/REPLAN Epics
2. [ln-220-story-coordinator](../ln-220-story-coordinator/SKILL.md) - CREATE/REPLAN Stories（每个 Epic 调用一次）
3. [ln-230-story-prioritizer](../ln-230-story-prioritizer/SKILL.md) - RICE 优先级排序（每个 Epic 调用一次）

### 何时不应使用

在以下情况下，请勿使用：
- 计划已有 Epics → 改用 ln-210-epic-coordinator 的 REPLAN 模式
- 需要重新规划现有 Stories → 对每个 Epic 使用 ln-220-story-coordinator 的 REPLAN 模式
- 只需创建 Epic → 直接使用 ln-210-epic-coordinator
- 只需为特定 Epic 创建 Story → 直接使用 ln-220-story-coordinator

---

## 核心概念

### 编排器模式

**ln-200-scope-decomposer 是一个纯协调器**——它不会直接执行工作：
- ✅ 发现上下文（Team ID）
- ✅ 做出路由决策（调用哪个协调器）
- ✅ 通过 Skill 工具委派所有工作（ln-210、ln-220、ln-230）
- ✅ 管理工作流状态（Epic 创建 → Story 循环）
- ❌ 不研究项目文档（由 ln-210 完成）
- ❌ 不生成 Epic/Story 文档（由 ln-210/ln-220 完成）
- ❌ 不创建跟踪器议题（由协调器通过已配置的提供商完成）
- ❌ 不向用户发出提示（所有用户交互均由协调器处理）

**协调器：**
- **ln-210-epic-coordinator：** 创建 3-7 个 Epics（如适用，Epic 0 用于基础设施；Epic 1-N 用于业务领域）
- **ln-220-story-coordinator：** 为每个 Epic 创建 5-10 个 Stories（包含内联标准研究）

### 顺序 Story 分解

**关键约束：** Epic N 的 Stories 必须先完成，然后才能开始 Epic N+1（ln-220 包含用户交互——无法跨多个 Epics 并行处理交互式对话）。

**为何必须顺序执行？**
- ln-220-story-coordinator 包含用户交互（Story 预览确认）
- 交互式对话无法并行处理（用户必须逐一审查每个 Epic 的 Stories）
- 确保 Epic N 的 Stories 获得批准并完成创建后，再开始 Epic N+1
- 可以先批量完成只读准备工作（Epic 元数据、子项清单、产物路径），但 Story 创建本身仍须顺序执行

**示例：** 6 个 Epics → 顺序调用 ln-220 共 6 次（Epic 0 → Epic 1 → Epic 2 → ... → Epic 5）

### 基础设施 Epic = Epic 0

**保留编号：** Epic 0 保留给基础设施 Epic（如果由 ln-210 提出）。

**编号：**
- 如果存在基础设施 Epic → Epic 0（基础设施）、Epic 1-N（业务领域）
- 否则 → Epic 1-N（仅业务领域）

**决策：** ln-210-epic-coordinator 的阶段 1 步骤 3 会自动确定是否需要基础设施 Epic（新项目、多技术栈、安全/监控要求）。

### 自动发现

**团队 ID**：从 `docs/tasks/kanban_board.md` 的跟踪器配置表中自动发现（参见 CLAUDE.md 中的“配置自动发现”）。

**回退方案：** 如果缺少 kanban_board.md → ln-210-epic-coordinator 将直接询问用户

---

## 工作流

### 阶段 1：发现（自动化）

从 `docs/tasks/kanban_board.md` 自动发现团队 ID。

**验证：**
- 团队 ID 存在于 kanban_board.md 中
- 如果缺失 → 跳过（ln-210 将向用户询问）

**编排器层级无需用户确认**——协调器负责处理所有用户交互。

**输出：** 团队 ID（如果未找到，则为 None）

### 阶段 2：Epic 分解（委托）

**目标：** 为计划创建所有 Epic。

受管协调器启动：
```
🔄 [ORCHESTRATOR] Phase 2: Delegating Epic creation to ln-210-epic-coordinator

node references/scripts/epic-planning-runtime/cli.mjs start --identifier {scopeIdentifier} --manifest-file {epicManifestPath}
child_run = { skill: "ln-210", run_id, identifier, summary_artifact_path }
node references/scripts/scope-decomposition-runtime/cli.mjs record-epic-summary --identifier {scopeIdentifier} --payload-file {epicSummaryArtifactPath}
```

**ln-210-epic-coordinator 将：**
- 阶段 1：研究项目文档（requirements.md、architecture.md、tech_stack.md）
- 阶段 2：自动提出领域划分 + 基础设施 Epic（Epic 0）→ 用户确认领域列表
- 阶段 3：构建理想的 Epic 计划（Epic 0-N）
- 阶段 5a：从文档中自动提取 Q1-Q4 → 生成所有 Epic 文档 → 显示批量预览 → 用户确认 → 创建所有 Epic
- 返回：Epic URL + 摘要

**完成后：** 通过已配置的跟踪器提供程序创建 Epic，并更新 kanban_board.md。

**输出：** 创建 3-7 个 Epic（如适用，Epic 0 用于基础设施；Epic 1-N 用于业务领域）

### 阶段 3：Story 分解循环（顺序执行，委托）

**目标：** 为每个 Epic 创建 Story。一次性准备只读子任务输入，然后顺序执行 Epic 循环。

**顺序循环逻辑：**

```
PREPARE once:
    1. Read epic-plan summary
    2. Precompute story child identifiers
    3. Precompute manifest paths + summary artifact paths

FOR EACH Epic (Epic 0, Epic 1, ..., Epic N):
    1. Invoke ln-220-story-coordinator for current Epic
    2. Wait for completion
    3. Verify Stories created in kanban_board.md
    4. Move to next Epic
```

### 停止条件（分解循环）

| 条件 | 操作 |
|-----------|--------|
| 所有 Epic 均已处理（Story + 可选的 RICE） | 停止——继续进入摘要 |
| ln-220 处理某个 Epic 时失败（协调器错误） | 停止——报告部分结果，并列出已完成的 Epic |
| 用户在 Story 确认期间取消 | 停止——报告已完成的 Epic，并跳过剩余部分 |
| Story 总数超过 80 | 停止——警告：“范围可能过大。是否继续？” |

**每个 Epic 的调用：**
```
🔄 [ORCHESTRATOR] Phase 3: Delegating Story creation for Epic N to ln-220-story-coordinator

node references/scripts/story-planning-runtime/cli.mjs start --epic {epicId} --manifest-file {storyManifestPath}
child_run = { skill: "ln-220", run_id, identifier, summary_artifact_path }
node references/scripts/scope-decomposition-runtime/cli.mjs record-story-summary --identifier {scopeIdentifier} --payload-file {storySummaryArtifactPath}
```

**ln-220-story-coordinator 将执行以下操作（针对每个 Epic）：**
- 阶段 1：从 Epic 自动提取 Q1-Q6，并进行回退搜索（requirements.md、tech_stack.md）
- 阶段 2：通过内联 MCP Ref 研究标准（自动）
- 阶段 3：构建理想的 Story 计划（5-10 个 Story）
- 阶段 4a：生成所有 Story 文档 → 显示预览 → 用户确认 → 创建所有 Story
- 返回：Story URL + 摘要

**顺序执行约束说明：**
- ln-220 包含用户交互（确认 Story 预览）
- 无法并行执行——用户必须依次审核每个 Epic 的 Story
- Epic N 的 Story 获得批准 → 生成 Epic N+1 的 Story

**每个 Epic 完成后：** 通过已配置的跟踪器提供程序创建 Story，并更新 kanban_board.md。

**输出：** 总计 30-60 个 Story（每个 Epic 5-10 个 × 3-7 个 Epic）

**TodoWrite 格式（必需）：**
开始前，将各阶段和 Epic 迭代添加到待办事项中：
```
- Phase 1: Discovery (in_progress)
- Phase 2: Delegate to ln-210-epic-coordinator (pending)
- Phase 3: Delegate to ln-220 for Epic 0 (pending)
- Phase 3: Delegate to ln-220 for Epic 1 (pending)
- Phase 3: Delegate to ln-220 for Epic 2 (pending)
... (one todo per Epic)
- Phase 4: Delegate to ln-230 for Epic 0 (pending)
- Phase 4: Delegate to ln-230 for Epic 1 (pending)
... (one todo per Epic, optional)
- Phase 5: Summary (pending)
```
开始执行时将每一项标记为 in_progress，协调器成功返回后标记为 completed。

### 阶段 4：RICE 优先级排序循环（可选、顺序执行、委派）

**目标：** 使用 RICE 评分并结合市场调研，对每个适用 Epic 中的 Story 进行优先级排序。

> **可选：** 询问用户“是否对所有 Epic 运行 RICE 优先级排序？”如果用户拒绝，则跳至阶段 5。

**顺序循环逻辑：**

```
PREPARE once:
    1. Set prioritization_enabled=true|false in runtime state
    2. Determine expected_prioritization_epics (only Epics that should be prioritized)
    3. Precompute child identifiers, manifests, and artifact paths

FOR EACH expected Epic:
    1. Invoke ln-230-story-prioritizer for current Epic
    2. Wait for completion
    3. Verify prioritization.md created in docs/market/[epic-slug]/
    4. Move to next Epic
```

**每个 Epic 的调用：**
```
node references/scripts/planning-worker-runtime/cli.mjs start --skill ln-230 --identifier {identifier} --manifest-file {prioritizationManifestPath} --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}
child_run = { skill: "ln-230", run_id, identifier, summary_artifact_path }
node references/scripts/scope-decomposition-runtime/cli.mjs record-prioritization-summary --identifier {scopeIdentifier} --payload-file {childSummaryArtifactPath}
```

**ln-230-story-prioritizer 将执行以下操作（针对每个 Epic）：**
- 通过已配置的跟踪器提供程序加载 Story 元数据（`listStoriesByEpic`）
- 研究每个 Story 的市场规模和竞争情况
- 计算 RICE 分数并分配优先级（P0-P3）
- 生成 docs/market/[epic-slug]/prioritization.md

**跳过条件：**如果 Epic 仅包含技术或基础设施 Story，不存在有意义的业务排序决策，则不要将该 Epic 添加到 `expected_prioritization_epics`。

**每个 Epic 完成后：**将优先级排序表保存到 docs/market/[epic-slug]/prioritization.md，并记录在该 Epic 的摘要下。

**最终完成规则：**如果启用了优先级排序，则仅当所有 `expected_prioritization_epics` 都已记录 `story-prioritization-worker` 摘要后，才允许运行时执行最终完成操作。

**输出：**所有适用 Epic 的优先级排序表。

### 阶段 5：摘要和后续步骤

**目标：**使用从所有 Epic 级摘要中聚合的结果，提供完整的拆分概览。

```
🔄 [ORCHESTRATOR] Phase 5: Full decomposition complete

Initiative Decomposition Summary:
- Epics created: N Projects (Epic 0: Infrastructure [if exists], Epic 1-N: Business domains)
- Stories created: M Issues (breakdown per Epic)
- Prioritization completed: K Epic tables (aggregated across all expected Epic runs)
- Location: docs/tasks/kanban_board.md

Next Steps:
1. Run ln-310-multi-agent-validator to validate all Stories
2. Use ln-400-story-executor to process each Story (tasks → execution → Done)
   OR use ln-300-task-coordinator to create tasks manually for each Story
```

**输出：**包含完整拆分结果的摘要消息

在 `PHASE_6_SELF_CHECK` 之前，写入最终的协调器工件：
```text
node references/scripts/scope-decomposition-runtime/cli.mjs record-scope-summary --identifier {scopeIdentifier} --payload-file {scopeSummaryPath}
```

---

## 关键规则

### 1. 编排器层级不得提示用户

**编排器不会提示用户：**
- ❌ 不得要求确认“是否继续拆分？”（多余——协调器已进行确认）
- ❌ 不得提供时间估算（会产生误导——实际时间会有所不同）
- ❌ 不得预览 Epic/Story（由协调器处理）

**所有用户交互均委托给协调器：**
- ln-210 阶段 2：领域审批（用户控制点 1）
- ln-210 阶段 5a：Epic 批次预览（用户控制点 2）
- ln-220 阶段 4a：逐个 Epic 进行 Story 预览（用户控制点 3，共 N 次）

### 2. 仅并行执行只读准备工作

- 对于元数据加载、清单生成和工件路径规划，允许进行批量准备。
- 不得跨 Epic 并行执行 Epic 或 Story 变更操作。
- 不得并行执行面向用户的预览检查点。

---

## 完成定义

在完成工作之前，验证所有检查点：

**✅ 已发现团队 ID（阶段 1）：**
- [ ] 已从 kanban_board.md 加载团队 ID，或已跳过（ln-210 将进行请求）

**✅ Epic 拆分完成（阶段 2）：**
- [ ] 已委托给 ln-210-epic-coordinator
- [ ] 已创建 3-7 个 Epic（如适用，Epic 0 用于基础设施；Epic 1-N 用于业务领域）
- [ ] 已返回 Epic URL
- [ ] Epic 在 kanban_board.md 中可见
- [ ] 已在运行时状态中记录 `epic-plan` 摘要

**✅ 用户故事拆解完成（阶段 3）：**
- [ ] 已按顺序将每个史诗委派给 ln-220-story-coordinator
- [ ] 每个史诗已创建 5-10 个用户故事
- [ ] 已返回每个史诗的用户故事 URL
- [ ] 所有用户故事均可在 kanban_board.md（Backlog 部分）中看到
- [ ] 已记录所有已处理史诗的 `story-plan` 摘要

**✅ RICE 优先级排序完成（阶段 4，可选）：**
- [ ] 已询问用户是否需要优先级排序（若用户拒绝则跳过）
- [ ] 运行时已记录是否启用优先级排序
- [ ] 启用优先级排序时，运行时已记录 `expected_prioritization_epics`
- [ ] 已将每个预期史诗委派给 ln-230-story-prioritizer
- [ ] 优先级排序表已保存至 docs/market/[epic-slug]/
- [ ] 已记录所有预期史诗的 `story-prioritization-worker` 摘要

**✅ 已提供摘要（阶段 5）：**
- [ ] 已显示总数（史诗数、用户故事数、每个史诗的明细）
- [ ] 已显示 kanban_board.md 的位置
- [ ] 已提供后续步骤（验证、创建任务）
- [ ] 已在自检前记录最终的 `scope-decomposition` 摘要

**输出：** 包含完整拆解结果（史诗 + 每个史诗的用户故事）的摘要消息

---

## 与生态系统的集成

### 调用方

用户直接调用：“拆解计划：[计划名称]”或“为[项目]创建史诗和用户故事”

### 调用（通过 Skill 工具）

- **ln-210-epic-coordinator**（阶段 2）- CREATE 模式（通过批量预览批量创建史诗）
- **ln-220-story-coordinator**（阶段 3，顺序循环）- 针对每个史诗使用 CREATE 模式（通过预览创建用户故事）
- **ln-230-story-prioritizer**（阶段 4，可选的顺序循环）- 针对每个史诗进行 RICE 优先级排序

### 下游流程

ln-200-scope-decomposer 完成后：
- **ln-310-multi-agent-validator** - 在创建任务之前验证所有已创建的用户故事
- **ln-400-story-executor** - 处理每个用户故事（任务 → 执行 → 完成）
  - 或者使用 **ln-300-task-coordinator** - 为每个用户故事手动创建任务

---

## 最佳实践

### 信任协调器

**信任协调器的结果：** 协调器返回摘要，编排器不再重新验证。

**错误处理：** 如果协调器返回错误，则向用户报告并停止流水线。

### 时间估算

**实际估算：** 完整拆解需要 2-3 小时（6 个史诗 × 平均 7 个用户故事 = 42 个用户故事）。

**明细：**
- 阶段 2（创建史诗）：30-45 分钟（批量预览可缩短时间）
- 阶段 3（创建用户故事）：1.5-2 小时（6 个史诗 × 每个史诗 15-20 分钟）
- 阶段 4（摘要）：2 分钟

**不要向用户提供时间估算** - 具体时间因项目复杂度和用户响应时间而异。

---

## 使用示例

**请求：**
```
"Decompose initiative: E-commerce Platform"
```

**执行过程：**

1. **阶段 1：发现**
   - 从 kanban_board.md 加载团队 ID

2. **阶段 2：史诗拆解**
   - 调用 ln-210-epic-coordinator
   - ln-210 创建 6 个史诗：
     - 史诗 11（基础设施史诗 0 模式）
     - 史诗 12-16（业务领域）
   - 输出：6 个史诗 URL

3. **阶段 3：用户故事拆解循环（顺序执行）**
   - **史诗 11：** 调用 ln-220 → 6 个用户故事（US017-US022）
   - **史诗 12：** 调用 ln-220 → 7 个用户故事（US023-US029）
   - **史诗 13：** 调用 ln-220 → 5 个用户故事（US030-US034）
   - **史诗 14：** 调用 ln-220 → 6 个用户故事（US035-US040）
   - **史诗 15：** 调用 ln-220 → 7 个用户故事（US041-US047）
   - **史诗 16：** 调用 ln-220 → 5 个用户故事（US048-US052）
   - 输出：共 36 个用户故事

4. **阶段 4：总结**
   ```
   🔄 [ORCHESTRATOR] Full decomposition complete

   Initiative: E-commerce Platform
   - Epics created: 6 Projects (Epic 11: Infrastructure, Epic 12-16: Business domains)
   - Stories created: 36 Issues
     - Epic 11: 6 Stories
     - Epic 12: 7 Stories
     - Epic 13: 5 Stories
     - Epic 14: 6 Stories
     - Epic 15: 7 Stories
     - Epic 16: 5 Stories
   - Location: docs/tasks/kanban_board.md

   Next Steps:
   1. Run ln-310-multi-agent-validator to validate all Stories
   2. Use ln-400-story-executor to process each Story (tasks → execution → Done)
   ```

**结果：** 通过完整的流水线自动化创建了 6 个 Epic 和 36 个 Story

---

## 阶段 6：元分析

可选参考：仅当用户要求进行运行后元分析或采用协议格式的运行反思时，加载 `references/meta_analysis_protocol.md`。

技能类型：`planning-coordinator`。收到请求时，在所有阶段完成后运行。使用 `planning-coordinator` 格式输出到聊天中。

## 参考文件

- **配置来源：** `docs/tasks/kanban_board.md`（Team ID、Next Epic Number）
- **Epic 协调器：** `ln-210-epic-coordinator/SKILL.md`
- **Story 协调器：** `ln-220-story-coordinator/SKILL.md`
- **Story 优先级排序器：** `ln-230-story-prioritizer/SKILL.md`
- **编号约定：** `references/numbering_conventions.md`（Epic 0 保留）

---

## 聊天输出前缀

使用表情符号前缀进行视觉区分：
- 🔄 [ORCHESTRATOR] - ln-200-scope-decomposer（顶层编排器）

**用途：** 在委派给多个协调器时，帮助用户跟踪编排器的进度。

---

**版本：** 2.0.0
**最后更新：** 2025-11-20