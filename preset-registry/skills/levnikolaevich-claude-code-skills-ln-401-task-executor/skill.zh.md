---
name: ln-401-task-executor
description: "Executes implementation tasks through Todo, In Progress, To Review. Use when task needs coding with KISS/YAGNI. Not for test tasks."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-line__outline, mcp__hex-line__read_file, mcp__hex-line__edit_file, mcp__hex-line__write_file, mcp__hex-line__verify, mcp__hex-line__changes, mcp__hex-line__inspect_path, mcp__hex-graph__index_project, mcp__hex-graph__find_symbols, mcp__hex-graph__inspect_symbol, mcp__hex-graph__analyze_edit_region
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 实现任务执行器

**类型：** L3 工作器

使用任务描述和所链接的指南，执行单个实现（或重构）任务，将其从 Todo 推进至 To Review。

## 目的与范围
- 仅处理一个选定任务；绝不触碰其他任务。
- 遵循任务的技术方案/计划/AC；应用 KISS/YAGNI 原则及指南中的模式。
- 更新此任务的跟踪器/看板状态：Todo -> In Progress -> To Review。
- 运行类型检查/lint；按照任务说明更新文档/测试/配置。
- 不用于测试任务（带有 "tests" 标签的任务交由 ln-404-test-executor）。

**Hex MCP 加速（如可用）：** 在读取大型代码文件之前，使用范围明确的 `inspect_path(path=<relevant dir>)` 和 `outline(file_path)`；除非确实有意需要，否则避免对仓库根目录进行通配符清单扫描。搜索/发现时先使用 `grep_search(output_mode="summary")`，仅当后续编辑需要规范代码片段时，才升级为 `output_mode="content", edit_ready=true`；仅将 `allow_large_output=true` 作为明确的最后手段。在发现模式下使用 `read_file()` 了解结构并读取目标范围；当后续编辑需要 `revision` 和校验和时，在调用 `edit_file()` 前使用 `read_file(edit_ready=true, verbosity="full")` 刷新该文件。对于现有代码的编辑，先运行一次 `index_project(path=project_root)`，并在进行非简单编辑前使用 `analyze_edit_region(...)`。编辑后：`edit_file(base_revision=rev)` -> `verify(checksums)`。交接前：使用 `changes()` 审查差异。
## 输入

| 输入 | 必需 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `taskId` | 是 | 参数、父级 Story、看板、用户 | 要执行的任务 |

**解析方式：** 任务解析链。
**状态筛选：** Todo

## 任务存储模式

**强制阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/tracker_provider_contract.md`、`references/provider_file.md` 和 `references/input_resolution_pattern.md`

提取：`task_provider` = 任务管理 → 提供方（`linear` | `github` | `file`）。此技能中的操作保持与提供方无关——规范操作集参见 `references/tracker_provider_contract.md`，传输绑定参见 `provider_*.md`。


工具策略：遵循宿主 `AGENTS.md` 中的 MCP 偏好；仅当缺少宿主策略或 MCP 行为不明确时，才加载 `references/mcp_tool_preferences.md` 和 `references/mcp_integration_patterns.md`。——代码文件优先使用 hex-line MCP（如可用），语义编辑风险问题使用 hex-graph。

## 模式检测

启动时检测运行模式：

**计划模式已启用：**
- 步骤 1-2：加载任务上下文（只读，计划模式下允许）
- 生成执行计划（要创建/修改的文件、实现方法）→ 写入计划文件
- 调用 ExitPlanMode → 停止。不要实施。
- 步骤 3-6：获批后 → 执行实现

**正常模式：**
- 步骤 1-6：执行标准工作流，不中途停止

## 使用 TodoWrite 跟踪进度

在任何模式下运行时，技能都**必须**创建详细的待办事项清单，以跟踪**所有**步骤。

**规则：**
1. 在步骤 1 之前**立即**创建待办事项
2. 每个工作流步骤 = 一个单独的待办事项；实施步骤需要包含子项
3. 开始步骤前标记为 `in_progress`，完成后标记为 `completed`

**待办事项模板（10 项）：**

```
Step 1: Resolve taskId
  - Resolve via args / Story context / kanban / AskUserQuestion (Todo filter)

Step 2: Load Context
  - Fetch full task description + linked guides/manuals/ADRs

Step 2b: Goal Articulation Gate
  - Complete 4 questions from references/goal_articulation_gate.md (<=25 tokens each)

Step 2c: Implementation Blueprint
  - From task "Affected Components": extract file paths (Glob/Grep or narrow `inspect_path(path=<component dir>)` to find actual paths)
  - Read each file (or key sections) to understand current structure
  - IF modifying existing code in supported languages: `index_project(path=project_root)` once, then use path-scoped `find_symbols` / `inspect_symbol` for exact symbol identity and `analyze_edit_region` before editing non-trivial ranges
  - IF `find_symbols` returns `partial ... truncated=1` or a broad candidate set: refine to `name + file` or `workspace_qualified_name` before planning from it
  - Output:
    ## Implementation Blueprint: {taskId}
    **Files to create:** [list with brief purpose]
    **Files to modify:** [list with what changes]
    **Change order (dependencies first):**
    1. {file} — {what and why first}
    2. {file} — {depends on step 1}
    **Risks:** {shared files with parallel tasks, if any}
  - Scope: ONLY files of this task. Do not analyze other tasks.

  - **Checkpoint:** Emit PHASE_3 checkpoint with structured `blueprint` payload:
    `{ "blueprint": { "change_order": [{ "file": "...", "action": "create|modify", "reason": "..." }] } }`
    Guard blocks PHASE_4 if blueprint is missing from the checkpoint.

Step 3: Start Work
  - Set task to In Progress, update kanban

Step 4: Implement
  - 4a Pattern Reuse: IF creating new file/utility, Grep src/ for existing similar patterns
    (error handlers, validators, HTTP wrappers, config loaders). Reuse if found.
  - 4b Follow task plan/AC, apply KISS/YAGNI
  - 4c Architecture Guard: IF creating service function: (1) 3+ side-effect categories in **leaf** function → split (EXCEPT orchestrator functions that delegate sequentially — these are expected to have 3+ categories);
    (2) get_*/find_*/check_* naming → verify no hidden writes; (3) 3+ service imports in **leaf** function → flatten (orchestrator imports are expected)
    (4) **Frontend Guard (conditional):** IF affected files include `.tsx/.vue/.svelte/.html/.css` → **MANDATORY READ:** Load `references/frontend_design_guide.md`. Load project's design_guidelines.md if exists (design tokens source of truth). Verify: one composition per viewport; max 2 typefaces + 1 accent color; cards only when interaction requires; motion max 2-3 purposeful; WCAG 2.1 AA contrast (4.5:1 text, 3:1 UI elements)
  - Update docs and existing tests if impacted
  - Execute verify: methods from task AC (test/command/inspect)

Step 5: Quality
  - Run typecheck and lint (or project equivalents)
  - 5b Blueprint Completion: compare actual changes to blueprint; emit blueprint_status in PHASE_6 checkpoint

Step 6: Finish
  - Set task to To Review, update kanban
  - Add summary comment (changes, tests, docs)
```

## 工作流（简要）
1) **解析 taskId：** 按照指南运行任务解析链（状态筛选器：[Todo]）。
2) **加载上下文：** 通过已配置的跟踪器提供程序（`getTask`）获取完整的任务描述；阅读链接的指南/手册/ADR/研究资料；如有需要，自动发现团队/配置。
2b) **目标门禁：** **强制阅读：** 加载 `references/goal_articulation_gate.md`——完成包含 4 个问题的门禁（每项不超过 25 个词元）。说明真实目标（以交付物为主语）、完成时的样子、非目标、不可变条件和隐藏约束。
2c) **实施蓝图：** 根据任务的“Affected Components”，通过 Glob/Grep 或范围受限的 `inspect_path(path=<component dir>)` 查找实际文件路径。阅读每个文件的关键部分。如果任务会修改受支持语言编写的现有代码，则构建一次图上下文（`index_project`），并使用限定路径范围的 `find_symbols` / `inspect_symbol` 确认准确的符号身份；在编辑非简单范围之前使用 `analyze_edit_region`。如果符号发现结果被截断，请细化为 `name + file` 或 `workspace_qualified_name`，然后再据此制定计划。输出结构化计划：要创建/修改的文件、修改顺序（依赖项优先）、风险（与并行任务共享的文件、外部调用方、公共 API 表面）。范围：仅限此任务。
3) **开始工作：** 通过已配置的跟踪器提供程序（`updateStatus`）将此任务更新为 In Progress；在看板中移动该任务（保留 Epic/Story 缩进）。
4) **实施（包含验证循环）：** **在编写新的工具函数/处理程序之前**，使用 Grep 在 `src/` 中搜索现有模式（错误处理、验证、配置访问）。如有则复用；如果无法复用，请在代码注释中说明理由。对于现有函数、类、路由或中间件的修改，先运行 `analyze_edit_region`，并考虑外部调用方、克隆同级项、下游流程和公共 API 风险。遵循复选框/计划；保持简单；避免硬编码值；复用现有组件；更新 Affected Components 中注明的文档；如果受到影响，则更新现有测试（此处不新增测试）。在创建服务函数之前，应用架构守卫（级联深度、接口诚实性、扁平编排；对于前端文件：**强制阅读** `references/frontend_design_guide.md`，如果存在则加载 design_guidelines.md，并验证组合/排版/WCAG 规则）。实施后，执行任务 AC 中的 `verify:` 方法：test → 运行指定测试；command → 执行并检查输出；inspect → 验证文件/内容存在。如果任何验证失败 → 修复后再继续。
5) **质量：** 运行类型检查和 lint（或项目中的等效检查）；确保 Existing Code Impact 中的指示均已处理。**蓝图完成情况：** 将实际变更与步骤 2c 中的蓝图进行比较——对每个计划内文件标记为已完成或已跳过（并说明理由），对每个计划外文件标记为已添加（并说明理由）。发出 PHASE_6 检查点：`{ "blueprint_status": { "planned_count": N, "completed": [...], "skipped": [{"file":"...","justification":"..."}], "added": [{"file":"...","justification":"..."}], "completion_pct": N } }`。如果缺失，守卫将阻止 PHASE_7。
6) **完成：** 通过已配置的跟踪器提供程序（`updateStatus`）将任务标记为 To Review；在看板中将其更新为 To Review；添加总结评论（变更内容、运行的测试、涉及的文档）。

## 提交前检查清单

**背景：** 在设置为 To Review 之前进行自我评估，可以减少反复审核，并尽早发现明显问题。

**必须阅读：** 加载 `references/code_efficiency_criterion.md`——在提交前进行自检。

在设置为 To Review 之前，请验证所有项目：

| # | 检查项 | 验证内容 |
|---|-------|--------|
| 0 | **AC 已验证** | 已执行每个 AC 的 `verify:` 方法，并提供通过证据 |
| 1 | **方案一致性** | 实现与 Story Technical Approach 一致 |
| 2 | **代码整洁** | 无死代码、无向后兼容垫片，并已删除未使用的导入 |
| 3 | **配置规范** | 无硬编码的凭据、URL 或魔法数字 |
| 4 | **文档已更新** | 受影响组件的文档已反映相关变更 |
| 5 | **测试通过** | 变更后现有测试仍然通过 |
| 6 | **模式复用** | 已对照现有代码库检查新工具；未引入重复模式 |
| 7 | **架构防护** | 级联深度 <= 2（叶函数）；名称表示读取的函数中不存在隐藏写入；叶函数中不存在长度 >= 3 的服务链（编排器导入除外）。前端文件：按照 `references/frontend_design_guide.md` 检查构图、排版和 WCAG |
| 8 | **破坏性操作安全** | 如果任务包含“Destructive Operation Safety”章节：(1) 在执行破坏性代码前已执行或规划备份步骤，(2) 代码中存在回滚机制，(3) 存在环境防护，(4) 已附上或引用预览/试运行证据 |
| 9 | **代码效率** | 无不必要的中间变量，冗长模式已替换为语言惯用写法，无样板式框架处理代码（依据 `references/code_efficiency_criterion.md`） |
| 10 | **蓝图完整** | 所有蓝图项目均已完成，或附有理由地跳过；已在 PHASE_6 检查点中输出 `blueprint_status` |

**必须阅读：** 加载 `references/destructive_operation_safety.md`，了解严重性分类和安全要求。

**HITL 关卡：** 如果任务严重性 = CRITICAL（依据上面加载的 destructive_operation_safety.md）：在标记为 To Review 之前，使用 `AskUserQuestion` 请求确认：“任务包含 CRITICAL 级破坏性操作：{operation}。备份计划：{plan}。是否继续？”在用户确认之前，不得标记为 To Review。

**如果任何检查未通过：** 在设置为 To Review 之前修复。不要依赖审核者来发现本可避免的问题。

## 关键规则
- 每次只更新单个任务；不得批量更改状态。
- 在编辑/评论中保持任务所用的语言（EN/RU）。
- 描述中不得包含代码片段；代码应存放在仓库中，而不是跟踪器描述中。
- 不得新建测试；仅在必要时更新现有测试。
- 保留编排器规定的 Foundation-First 顺序；不得重新排列任务。
- **不得提交。** 保持所有更改未提交——由审核者审核并提交。
- 在对现有代码进行非简单编辑之前，如果可以获得图谱影响证据，应使用该证据，而不是仅根据文件名猜测影响范围。

## 运行时摘要产物

**必须阅读：** 加载 `references/coordinator_summary_contract.md`、`references/worker_runtime_contract.md`、`references/task_worker_runtime_contract.md`

共享契约：
- 输出 `summary_kind=task-status`
- 独立模式省略 `runId` 和 `summaryArtifactPath`
- 托管模式在工作进程写入经验证的摘要之前，传入 `runId` 和准确的 `summaryArtifactPath`

**监控（2.1.98+）：** 当验证命令预计耗时超过 30 秒时，使用 `Monitor`。回退方案：`Bash(run_in_background=true)`。

## 完成定义
- [ ] 任务已选定并设置为“进行中”；看板已相应更新。
- [ ] 已阅读指南/手册/ADR/研究资料；实施方案与任务的技术方案保持一致。
- [ ] 已按照计划/验收标准完成实现；每项验收标准的 `verify:` 方法均已执行，并有通过证据。
- [ ] 文档和受影响的测试已更新。
- [ ] 类型检查和代码检查（或项目质量检查命令）已通过，并在评论中提供证据。
- [ ] 任务已设置为“待审查”；看板已移至“待审查”；已添加摘要评论。
- [ ] 运行时摘要制品已写入共享的任务状态位置。

## 参考文件
- **环境状态：** `references/environment_state_contract.md`
- **存储模式操作：** `references/storage_mode_detection.md`
- 指南/手册/ADR/研究资料：`docs/guides/`、`docs/manuals/`、`docs/adrs/`、`docs/research/`
- 看板格式：`docs/tasks/kanban_board.md`

---
**版本：** 3.0.0
**最后更新：** 2025-12-23