---
name: ln-402-task-reviewer
description: "Reviews task implementation for quality, code standards, and test coverage. Use when task is in To Review. Sets task Done or To Rework."
allowed-tools: Read, Grep, Glob, Bash, WebFetch, mcp__context7, mcp__hex-graph__audit_workspace, mcp__hex-graph__find_references, mcp__hex-graph__analyze_changes, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline, mcp__hex-line__changes
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L3 执行者  
**类别：** 4XX 执行

# 任务审查者

**每次任务执行后都必须进行。** 审查 To Review 中的单个任务，并决定将其置为 Done 还是 To Rework，同时立即修复问题或提供清晰的返工说明。

> **此技能并非可选。** 每个已执行的任务都必须立即接受审查。不得例外，不得批量处理，不得跳过。

## 目的与范围
- 解析任务 ID（按照输入解析链）；通过配置的跟踪器提供方（`getTask`、`getStory`）分别加载完整任务及其父 Story。
- 检查架构、正确性、配置规范性、文档和测试。
- 对于测试任务，按照规划器模板验证基于风险的限制和优先级（≤15）。
- 仅更新此任务：接受（Done）或退回（To Rework），并提供与最佳实践相关联的明确原因和修复建议。

## 输入

| 输入 | 必需 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `taskId` | 是 | 参数、父 Story、看板、用户 | 要审查的任务 |

**解析方式：** 任务解析链。  
**状态筛选：** To Review

## 阶段 0：工具配置

**必须读取：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md` 和 `references/input_resolution_pattern.md`

提取：`task_provider` = 任务管理 -> 提供方（`linear` | `github` | `file`）。操作应保持与提供方无关；仅在执行跟踪器 I/O 时加载所选提供方的传输参考文档。

## 任务存储模式

此技能使用的跟踪器操作：`getTask`、`getStory`、`updateStatus`（Done | To Rework）、`addComment`、`createTask`（用于具有副作用的 [BUG] 任务）。

## 模式检测

启动时检测运行模式：

**计划模式已启用：**
- 步骤 1-3：解析任务并加载上下文（只读，计划模式下允许）
- 生成审查计划（文件、检查项）→ 写入计划文件
- 调用 ExitPlanMode → 停止。不要执行审查。
- 步骤 4-9：批准后 → 执行完整审查

**普通模式：**
- 步骤 1-9：无需停止，执行标准工作流

## 计划模式支持

条件读取：仅在计划模式启用时加载 `references/plan_mode_pattern.md` 的工作流 A。  
工具策略：遵循宿主 AGENTS.md 中的 MCP 偏好设置；仅当宿主策略缺失或 MCP 行为不明确时，加载 `references/mcp_tool_preferences.md` 和 `references/mcp_integration_patterns.md`。

**关键：在计划模式下，计划文件 = 审查计划（将要检查的内容）。绝不要将审查发现或结论写入计划文件。**

**审查计划格式：**

```
REVIEW PLAN for Task {ID}: {Title}

| Field | Value |
|-------|-------|
| Task | {ID}: {Title} |
| Status | {To Review} |
| Type | {impl/test/refactor} |
| Story | {Parent ID}: {Parent Title} |

Files to review:
- {file1} (deliverable)
- {file2} (affected component)

| # | Check | Will Verify |
|---|-------|-------------|
| 1 | Approach | Technical Approach alignment |
| 2 | Clean Code | No dead code, no backward compat shims |
| 3 | Config | No hardcoded creds/URLs |
| 4 | Errors | try/catch on external calls |
| 5 | Logging | ERROR/INFO/DEBUG levels |
| 6 | Comments | WHY not WHAT, docstrings |
| 7 | Naming | Project conventions |
| 8 | Docs | API/env/README updates |
| 9 | Tests | Updated/risk-based limits |
| 10 | AC | 4 criteria validation |
| 11 | Side-effects | Pre-existing bugs in touched files |
| 12 | Destructive ops | Safety guards from destructive_operation_safety.md (loaded in step 4) |
| 13 | Algorithm correctness | Loop invariants, collection keys, unbounded ops, shared state leaks |
| 14 | Event channels | Channel name consistency in diff |
| 15 | CI Checks | lint/typecheck pass per ci_tool_detection.md |

Expected output: Verdict (`Done | To Rework`) + Issues + Fix actions
```

## 使用 TodoWrite 跟踪进度

以任何模式运行时，技能都必须创建详细的待办事项清单，以跟踪所有步骤。

**规则：**
1. 在步骤 1 之前立即创建待办事项
2. 每个工作流步骤对应一个单独的待办事项；包含多项检查的步骤应设置子项
3. 开始步骤前标记为 `in_progress`，完成后标记为 `completed`

**待办事项模板（约 11 项）：**

```
Step 1: Resolve taskId
  - Resolve via args / Story context / kanban / AskUserQuestion (To Review filter)

Step 2: Load Task
  - Load task by ID, detect type

Step 3: Read Context
  - Load full task + parent Story + affected components

Step 3b: Goal Articulation Gate
  - State what specific quality question this review must answer (<=25 tokens each)

Step 4: Review Checks
  - Verify approach alignment with Story Technical Approach
  - Check clean code: no dead code, no backward compat shims
  - Cross-file DRY: Grep src/ for new function/class names (count mode). 3+ similar → CONCERN
  - Check config hygiene, error handling, logging
  - Check comments, naming, docs updates
  - Verify tests updated/run (risk-based limits for test tasks)

Step 5: AC Validation
  - Validate implementation against 4 AC criteria

Step 6: Side-Effect Bug Detection
  - Scan for bugs outside task scope, create [BUG] tasks

Step 7: Decision
  - Apply minor fixes or set To Rework with guidance

Step 8: Mechanical Verification
  - Run lint/typecheck per ci_tool_detection.md (only if verdict=Done)

Step 9: Update & Commit
  - Set task status, update kanban, post review comment
  - If Done: leave branch changes uncommitted for downstream branch ownership rules
```

## 工作流（简明版）
当语义差异、克隆组、引用或审查影响范围很重要时，优先使用 `hex-graph`。在可用时，对于本地代码/配置/脚本/测试读取，优先使用 `hex-line`。如果 MCP 不可用、不受支持或尚未建立索引，请继续使用内置的 `Read/Grep/Glob/Bash`，并在审查中记录回退情况，不要因此阻塞。

1) **解析 taskId：** 按照指南运行任务解析链（状态过滤器：[To Review]）。
2) **加载任务：** 分别加载完整任务及其父级 Story。检测类型（标签为 "tests" -> 测试任务，否则为实现/重构任务）。
3) **读取上下文：** 完整任务 + 父级 Story；加载受影响的组件/文档；若有差异内容则进行审查。
   **Hex MCP 加速：** 当图已建立索引时，优先使用 `analyze_changes(path=project_root, base_ref="HEAD~1")` 获取语义风险快照；使用 `changes(path="src/", compare_against="HEAD~1")` 对结构变更进行 AST 级别的差异审查。
3b) **目标门禁：** 在审查前说明：(1) REAL GOAL：本次审查必须回答什么质量问题？(2) DONE：什么证据能证明质量足够？(3) NOT THE GOAL：流于表面的走过场式批准会是什么样？(4) INVARIANTS：存在哪些不明显的约束？仅当此门禁存在歧义或争议时，加载 `references/goal_articulation_gate.md`。
4) **审查检查项：**
   > **规范优先门禁：** 快速预检 AC：根据实现扫描任务 AC。如果任何 AC 明显未满足（BLOCKER 级别）→ 立即转为 To Rework，跳过其余质量检查。步骤 5 中仍需执行完整的 AC 验证。
   **强制读取：** 加载 `references/clean_code_checklist.md`、`references/destructive_operation_safety.md`
   - **目标验证（恢复悖论）：** 如果执行者阐明了 REAL GOAL（可见于任务评论或实现中），验证该目标是否与 Story 的目标交付物一致。如果执行者围绕次要对象来界定目标（例如，用“实现端点”代替“支持用户数据导出”）→ CONCERN：`GOAL-MISFRAME: executor goal targets secondary subject, may miss hidden constraints.`
   - **蓝图完成度（建议性）：** 如果执行者运行时数据可用（此任务对应的 `.hex-skills/runtime-artifacts/runs/`），从执行者检查点加载 PHASE_3 蓝图和 PHASE_6 `blueprint_status`。在以下情况下标记为 CONCERN：`completion_pct < 100` 且未说明跳过项目的理由，或者新增文件数量超过计划数量的 50% 且无合理说明。如果运行时数据不可用，则检查执行者摘要中的 `metadata.blueprint_status`。不属于 BLOCKER。
   - 方法：差异内容应与 Story 中的 Technical Approach 一致。如有不同 → 在代码注释中记录理由。
   - **整洁代码：** 按照检查清单验证全部 4 个类别。已替换的实现必须完全移除。如果重构更改了 API，则应更新调用方并移除旧签名。<!-- Defense-in-depth: also checked by ln-511 MNT-DC- -->
   - **跨文件 DRY：** 对任务创建的每个新函数/类/处理程序，使用 Grep 在 `src/` 中搜索相似名称/模式（计数模式）。如果 3 个以上文件包含相似逻辑 → 添加 CONCERN：`MNT-DRY-CROSS: {pattern} appears in {count} files — consider extracting to shared module.` 这可发现单任务审查遗漏的跨 Story 重复。<!-- Defense-in-depth: also checked by ln-511 MNT-DRY- -->
   - **跨文件 DRY 首选方式（hex-graph）：** 如果 hex-graph 已建立索引，使用 `audit_workspace(path=scan_path, verbosity="minimal", limit=5, clone_member_limit=3)` 并检查返回的 `clones`。仅当有限预览不足时才提高限制。筛选任一成员位于任务修改文件中的组。每个匹配项均记为 CONCERN：`MNT-DRY-CROSS`。如果 hex-graph 不可用，则回退到上述 Grep 名称搜索。
   - 不得硬编码凭据/URL/魔法数字；配置应放在环境变量/配置中。
   - 破坏性操作防护：使用上面已加载的 destructive_operation_safety.md 中的代码级防护表。CRITICAL/HIGH 严重级别 → BLOCKER：SEC-DESTR-{ID}。MEDIUM 严重级别 → CONCERN：SEC-DESTR-{ID}。
   - 错误处理：所有外部调用（API、DB、文件 I/O）均应封装在 try/catch 或等效机制中。不得吞掉异常。遵守分层；复用现有组件。<!-- Defense-in-depth: layers also checked by ln-511 ARCH-LB- -->
   - 副作用广度：具有 3 类以上副作用的**叶级**服务函数 → CONCERN：`ARCH-AI-SEB`。例外：编排器/协调器函数（导入 3 个以上服务并按顺序委派）通常应当具有多类副作用——不要标记。<!-- Defense-in-depth: also ln-511, ln-624 Rule 10 -->
   - 接口诚实性：具有读取型名称（get_/find_/check_）但包含写入副作用的函数 → CONCERN：`ARCH-AI-AH` <!-- Defense-in-depth: also ln-511, ln-643 Rule 6 -->
   - 日志记录：错误使用 ERROR；身份验证/支付事件使用 INFO；调试数据使用 DEBUG。日志中不得包含敏感数据。
   - 注释：解释原因而非表象；不得保留被注释掉的代码；公共方法应具有文档字符串。
   - 命名：遵循项目现有约定（检查 3 个以上相似文件）。除领域术语外不得使用缩写。不得使用单字母变量（循环中除外）。
   - 实体泄漏：不得直接从 API 端点返回 ORM 实体。应使用 DTO/响应模型。（身份验证/支付相关为 BLOCKER，其他情况为 CONCERN）<!-- Defense-in-depth: also checked by ln-511 ARCH-DTO- -->
   - 方法签名：公共方法不得使用布尔标志参数（应使用枚举/选项对象）；如果没有 DTO，参数不得超过 5 个。（NIT）<!-- Defense-in-depth: also checked by ln-511 MNT-SIG- -->
   - **算法正确性（循环、集合、边界）：** 循环内的 `break`/`continue`/`return` 是否处理了所有匹配项，而非仅处理第一个？字典/集合推导式是否正确处理重复键（后者覆盖前者可能导致数据丢失）？是否存在对用户控制的数据执行 `list(query.all())` 或无 LIMIT 的无界循环？是否存在会跨请求泄漏的可变共享状态（连接池 GUC、会话全局变量）？（若导致数据丢失/损坏则为 BLOCKER，否则为 CONCERN）<!-- Prefix: ALGO- -->
   - **事件通道一致性（任务范围内）：** 当任务差异涉及事件相关代码（NOTIFY/LISTEN/emit/subscribe/publish/on）时，验证：(1) 发布者中的通道名称字符串与订阅者中的通道名称字符串一致；(2) 如果通道名称是新的字符串字面量，使用 Grep 在 `src/` 中搜索匹配的监听者/发布者对应项。不匹配 → CONCERN：`ARCH-EVENT-MISMATCH: publisher '{pub_name}' has no matching subscriber`。孤立项 → CONCERN：`ARCH-EVENT-ORPHAN: subscriber '{sub_name}' has no matching publisher`。<!-- Defense-in-depth: also checked by ln-652 Rule 6, ln-511 ARCH-EVENT- -->
   - **简洁性标准（任务范围内）：** 在当前流程中检查 MNT-KISS-SCOPE 和 MNT-YAGNI-SCOPE；仅当报告其中一项建议性 CONCERN 时，加载 `references/simplicity_criterion.md`。
   - **代码效率（任务范围内）：** 从差异中抽查 2-3 个关键函数，检查是否存在不必要的中间变量、已有惯用写法却使用冗长模式，或框架已经处理却仍添加样板代码的情况。如果发现 → CONCERN：`MNT-EFF-SCOPE: {pattern} in {file}`。仅当项目上下文不明确时加载 `references/code_efficiency_criterion.md`。
   - **前端审查（有条件）：** 如果审查的文件包含 `.tsx/.vue/.svelte/.html/.css`，加载 `references/frontend_design_guide.md`，并检查无障碍性、组合结构、排版、文案、动效以及对设计系统的遵循情况。
   - 文档：如果公共 API 已更改 → 更新 API 文档。如果新增环境变量 → 更新 .env.example。如果新增概念 → 更新 README/架构文档。
   - 测试已更新/运行：对于实现/重构任务，确保调整受影响的测试；对于测试任务，按照规划器模板验证基于风险的限制和优先级（≤15）。
5) **AC 验证（实现任务强制执行）：**
   **强制读取：** 加载 `references/ac_validation_checklist.md`。根据以下 4 项标准验证实现：
   - **AC 完整性：** 覆盖所有 AC 场景（正常路径 + 错误 + 边界情况）。
   - **AC 具体性：** 满足精确要求（HTTP 状态码 200/401/403、耗时 <200ms、准确消息）。
   - **任务依赖关系：** 任务 N 仅使用任务 1 至 N-1（不得前向依赖 N+1、N+2）。
   - **数据库创建：** 任务仅创建 Story 范围内的表（不得一次性创建整个模式）。
   如果任何标准未通过 → 转为 To Rework，并提供检查清单中的具体指导。
6) **副作用缺陷检测（强制执行）：**
   在审查受影响代码时，主动扫描与当前任务无关的缺陷/问题：
   - 受影响文件中预先存在的缺陷
   - 相邻代码中已损坏的模式
   - 相关组件中的安全问题
   - 不受支持的 API、过时的依赖项
   - 调用方/被调用方函数中缺失的错误处理

**对于发现的每个副作用缺陷：**
   - 在同一个 Story 中创建新任务：
     - 使用已配置的跟踪器提供方的 `createTask` 操作。传入 `parentId = Story.id`、标签 `["bug", "discovered-in-review"]`、状态 `Backlog`，以及根据严重程度确定的优先级。
   - 标题：`[BUG] {Short description}`
   - 描述：位置、问题、建议的修复方式
   - 标签：`bug`、`discovered-in-review`
   - 优先级：根据严重程度确定（安全问题 → 1 Urgent，逻辑问题 → 2 High，样式问题 → 4 Low）
   - **不要推迟处理**——立即创建任务，审查者要发现执行者遗漏的问题

7) **决策（仅针对当前任务）：**
   - 如果只有细枝末节的问题：应用小幅修复并将状态设为 Done。
   - 如果仍有问题：将状态设为 To Rework，并添加评论说明原因（引用最佳实践）以及修复方法。
   - 副作用缺陷不会阻止将当前任务的状态设为 Done（它们属于单独的任务）。
   - **如果为 Done：** 保持分支更改未提交，并移交已接受的任务状态以及审查评论和摘要产物。
8) **机械验证（如果为 Done）：**
   **必须阅读：** 加载 `references/ci_tool_detection.md`
   如果 verdict == Done：
   - 按照 ci_tool_detection.md 中的发现层级检测 lint/typecheck 命令
   - 运行检测到的检查（按照指南设置超时：linters 为 2 分钟，typecheck 为 5 分钟）
   **必须阅读：** 加载 `references/output_normalization.md`
   - 如果有任何 FAIL → 按照 §1 normalize → §2 deduplicate → §4 truncate to 50 lines 应用输出规范化 → 将 verdict 覆盖为 To Rework，并附上规范化后的输出
   - 如果未检测到工具 → SKIP，并附上信息消息
9) **更新：** 通过已配置的跟踪器提供方（`updateStatus`）设置任务状态；更新看板：如果为 Done → **从看板中移除任务**（Done 分区只跟踪 Stories，不跟踪单个 Tasks）；如果为 To Rework → 将任务移动到 To Rework 分区；添加包含发现和所采取操作的审查评论。如果创建了副作用缺陷任务，请在评论中提及它们。

## 审查质量评分

**背景：** 量化审查结果可使下游决策具备可审计性，并可用于跟踪审查的一致性。

**公式：** `Quality Score = 100 - (20 × BLOCKER_count) - (10 × CONCERN_count) - (3 × NIT_count)`

**对步骤 3-5 中的每项发现进行分类：**

| 类别 | 权重 | 示例 |
|----------|--------|----------|
| BLOCKER | -20 | 未满足 AC、安全问题、缺少错误处理、采用了错误的方法 |
| CONCERN | -10 | 次优模式、缺少文档、测试存在缺口 |
| NIT | -3 | 命名、样式、小幅清理 |

**判定映射：**

| 分数 | 判定 | 操作 |
|-------|---------|--------|
| 90-100 | Done | 接受，直接应用细枝末节的修复 |
| 70-89 | Done (with notes) | 接受，记录相关问题以供将来处理 |
| <70 | To Rework | 退回，并针对每项发现提供修复指导 |

**注意：** 副作用缺陷（步骤 5）不会影响当前任务的质量评分——它们会成为单独的 [BUG] 任务。

## 关键规则
- 一次只处理一个任务；副作用缺陷 → 单独的 [BUG] 任务（不得扩大范围）。
- 质量门槛：在设为 Done 前解决所有范围内的问题，否则退回并提供明确的修复指导。
- 测试任务违规（限制/优先级 ≤15）→ To Rework。
- 在编辑/评论中保持任务所用语言（EN/RU）。
- 仅当判定为 Done 时运行机械检查（lint/typecheck）；如果为 To Rework，则跳过。

## 运行时摘要产物

**必须阅读：** 加载 `references/coordinator_summary_contract.md`、`references/worker_runtime_contract.md`、`references/task_worker_runtime_contract.md`

共享契约：
- 输出 `summary_kind=task-status`
- 独立模式省略 `runId` 和 `summaryArtifactPath`
- 托管模式需在工作进程写入经过验证的审查结果之前，传入 `runId` 和准确的 `summaryArtifactPath`

**监控器（2.1.98+）：** 对于预计耗时超过 30 秒的 lint/typecheck 命令，请使用 `Monitor`。后备方案：`Bash(run_in_background=true)`。

## 完成定义
- [ ] 已完成步骤 1-9：任务已解决、上下文已加载、审查检查已通过、AC 已验证、已创建副作用缺陷、机械验证已通过、决策已应用。
- [ ] 如果为 Done：审查通过后从看板中移除任务。如果为 To Rework：移动任务并附上修复指导。
- [ ] 已发布审查评论（发现的问题 + [BUG] 列表，如有）。
- [ ] 已将运行时摘要产物写入共享的 task-status 位置。

## 参考文件
- **环境状态：** `references/environment_state_contract.md`
- **存储模式操作：** `references/storage_mode_detection.md`
- **[强制] 问题解决方法：** `references/problem_solving.md`
- **AC 验证规则：** `references/ac_validation_rules.md`
- AC 验证检查清单：`references/ac_validation_checklist.md`（4 项标准：完整性、明确性、依赖项、数据库创建）
- **整洁代码检查清单：** `references/clean_code_checklist.md`
- **CI 工具检测：** `references/ci_tool_detection.md`
- **输出规范化：** `references/output_normalization.md`
- 看板格式：`docs/tasks/kanban_board.md`

---
**版本：** 5.2.0
**最后更新：** 2026-03-24