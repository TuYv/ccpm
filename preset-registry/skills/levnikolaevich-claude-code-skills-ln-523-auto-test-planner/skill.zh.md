---
name: ln-523-auto-test-planner
description: "Plans automated tests (E2E/Integration/Unit) using Risk-Based Testing after manual testing. Use when Story needs a test task with prioritized scenarios."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# 自动化测试规划器

**类型：** L3 Worker

基于风险测试方法和真实的手动测试结果，创建具备全面自动化测试覆盖（E2E/集成/单元）的 Story 测试任务。

## 输入

| 输入 | 必需 | 来源 | 说明 |
|-------|----------|--------|-------------|
| `storyId` | 是 | args、git 分支、kanban、用户 | 要处理的 Story |

**解析方式：** Story 解析链。
**状态筛选器：** To Review

## 目的与范围
- **创建**全面的 Story 自动化测试任务
- **计算**基于风险的优先级（影响 x 概率）
- 根据手动测试结果**生成**包含 11 个章节的测试计划
- **委派**给 ln-301-task-creator（CREATE）或 ln-302-task-replanner（REPLAN）
- **不适用于**：手动测试、调研或编排

## 使用时机

- 当实现工作已完成且必须规划自动化测试覆盖时使用
- Story 中的所有实现 Task 状态 = Done
- ln-521 调研：如有则使用；如缺失，则生成最少量的内联调研
- ln-522 手动测试：如有则使用；如缺失，则标记为“根据策略跳过”

**自动化：** 在托管运行中支持 `autoApprove: true`，以跳过手动确认。

## 工作流

### 阶段 0：工具配置

**必须阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md` 和 `references/input_resolution_pattern.md`

提取：`task_provider` = 任务管理 → 提供方（`linear` | `file`）。

### 阶段 1：发现（自动化）

1. **解析 storyId：** 按照指南运行 Story 解析链（状态筛选器：[To Review]）。
2. 从 `docs/tasks/kanban_board.md` 自动发现 Team ID（参见 CLAUDE.md 中的“配置自动发现”）

### 阶段 2：Story + Task 分析（无对话）

**步骤 0：研究项目测试文件**
1. 扫描测试相关文件：
   - tests/README.md（命令、设置、环境）
   - 测试配置（jest.config.js、vitest.config.ts、pytest.ini）
   - 现有测试结构（tests/、__tests__/ 目录）
   - 覆盖率配置（.coveragerc、coverage.json）
2. 提取：测试命令、框架、模式、覆盖率阈值
3. 确保测试规划与项目实践保持一致

**步骤 1：加载调研和手动测试结果**
1. 获取 Story（必须带有标签 "user-story"）：
   - 如果 `task_provider` = `linear`：`get_issue(storyId)` — 提取 Story.id（UUID，而非短 ID）
   - 如果 `task_provider` = `file`：`Read story.md` — 提取 Story 元数据
2. 加载调研评论（来自 ln-521）："## 测试调研：{Feature}"
   - 如果 `task_provider` = `linear`：`list_comments(issueId=storyId)` → 查找匹配的评论
   - 如果 `task_provider` = `file`：`Glob("docs/tasks/epics/*/stories/*/comments/*.md")` → 查找匹配的评论
   - 如果未找到调研评论：基于 Story AC 和任务描述，生成 3-5 个关键测试领域的要点（内联生成，不进行外部调研）。
3. 加载手动测试结果评论（来自 ln-522）："## 手动测试结果"
   - 使用与上述调研评论相同的方法
   - 如果未找到手动测试结果：跳过手动测试覆盖分析。在输出中注明：“手动测试：根据策略跳过（简化模式）。”
4. 解析各部分：AC 结果（PASS/FAIL）、边界情况、错误处理、集成流程
5. 映射到测试设计：通过的 AC -> E2E，边界情况 -> 单元测试，错误 -> 错误处理，流程 -> 集成测试

**步骤 2：分析 Story 和 Tasks**
1. 解析 Story：目标、测试策略、技术说明
2. 获取所有子 Tasks（status = Done）：
   - 如果 `task_provider` = `linear`：`list_issues(parentId=Story.id, state="Done")`
   - 如果 `task_provider` = `file`：`Glob("docs/tasks/epics/*/stories/*/tasks/*.md")` → 按 `**Status:** Done` 筛选
3. 分析每个 Task：
   - 已实现的组件
   - 已添加的业务逻辑
   - 已创建的集成点
   - 条件分支（if/else/switch）
4. 确定需要测试的内容

### 阶段 3：手动测试结果的解析策略

**流程：** 查找包含 "Manual Testing Results" 标题的 Linear 评论 -> 验证格式版本 1.0 -> 使用正则表达式提取结构化章节（验收标准、按 AC 划分的测试结果、边界情况、错误处理、集成测试）-> 验证（至少有 1 个 PASSED AC、AC 数量与 Story 匹配、完整性检查）-> 将解析后的数据映射到测试设计结构

**错误处理：** 缺少评论 -> 使用回退方案（根据阶段 2 的逻辑进行内联研究或跳过），缺少格式版本 -> WARNING（尝试旧版解析），缺少必需章节 -> 使用回退方案，没有 PASSED AC -> ERROR（修复实现）

### 阶段 4：基于风险的测试规划（自动化）

**强制阅读：** 加载 `references/risk_based_testing_guide.md`，以了解评分和实用性门槛。
条件阅读：仅在规划完整测试策略，或风险/实用性决策存在歧义时，加载 `references/risk_based_testing_methodology.md`。

**E2E 优先方法：** 按业务风险（优先级 = 影响 x 概率）确定优先级，而非按覆盖率指标。

**工作流：**

**步骤 1：风险评估**

根据手动测试结果计算每个场景的优先级：

```
Priority = Business Impact (1-5) x Probability (1-5)
```

**决策标准：**
- 优先级 ≥15 -> **必须测试**
- 优先级 9-14 -> 如果尚未覆盖，**应该测试**
- 优先级 <=8 -> **跳过**（手动测试已足够）

**步骤 2：E2E 测试选择（2-5 个）：** 始终包含 2 个基准测试（正向 + 负向）+ 0-3 个额外测试（仅限优先级 ≥15）

**步骤 3：单元测试选择（0-15 个）：** 默认为 0。仅针对复杂业务逻辑（优先级 ≥15）添加：财务、安全、算法

**步骤 4：集成测试选择：** 默认为 0。仅当存在 E2E 覆盖缺口且优先级 ≥15 时添加：回滚、并发、外部 API 错误

**步骤 5：验证：** 每个测试均通过实用性标准（优先级 ≥15、置信度 ROI、行为导向、可预测、具体、非重复）

### 阶段 5：测试 Task 生成（自动化）

根据 `test_task_template.md` 生成完整的测试 Task（11 个章节）：

**章节 1-7：** 上下文、风险矩阵、E2E/集成/单元测试（包含优先级分数和理由）、覆盖范围、DoD

**章节 8：** 需要修复的现有测试（分析实现 Tasks 所影响的测试）

**章节 9：** 基础设施变更（packages、Docker、configs——基于测试依赖项）

**章节 10：** 文档更新（README、CHANGELOG、tests/README、配置文档）

**章节 11：** 遗留代码清理（不受支持的模式、向后兼容、死代码）

显示预览以供审阅。

### 阶段 6：确认与委派

**步骤 1：** 预览生成的测试计划（始终显示以确保透明度）

**步骤 2：** 确认逻辑：
- **autoApprove: true** -> 自动继续
- **手动运行** -> 提示用户输入 "confirm"

**步骤 3：** 检查是否存在现有测试任务

- 如果 `task_provider` = `linear`：`list_issues(parentId=Story.id, label="tests")`
- 如果 `task_provider` = `file`：`Glob("docs/tasks/epics/*/stories/*/tasks/*.md")` → 筛选 `**Labels:**` 中包含 `tests` 的文件

**决策：**
- **Count = 0** -> **创建模式**（步骤 4a）
- **Count >= 1** -> **重新规划模式**（步骤 4b）

**步骤 4a：创建模式**（如果 Count = 0）

托管委派流程：
1. 计算 `childRunId = {parent_run_id}--ln-301--{storyId}`
2. 计算 `childSummaryArtifactPath = .hex-skills/runtime-artifacts/runs/{parent_run_id}/task-plan/ln-301--{storyId}.json`
3. 在 `.hex-skills/test-planning/ln-301--{storyId}_manifest.json` 生成子清单
4. 使用两个传输输入启动 `task-plan-worker-runtime`
5. 在 `PHASE_6_DELEGATE_TASK_PLAN` 中为 `child_run` 元数据创建检查点
6. 使用 `--run-id` 和 `--summary-artifact-path` 调用 `ln-301-task-creator`
7. 仅读取生成的子 `task-plan` 产物

**传递给工作器：**
- taskType、teamId、storyData（Story.id、title、AC、Technical Notes、Context）
- researchFindings（来自 ln-521 评论）
- manualTestResults（来自 ln-522 评论）
- testPlan（e2eTests、integrationTests、unitTests、riskPriorityMatrix）
- infrastructureChanges、documentationUpdates、legacyCleanup

**工作器返回：** 任务 URL + `task-plan` 产物

**步骤 4b：重新规划模式**（如果 Count >= 1）

托管委派流程：
1. 计算 `childRunId = {parent_run_id}--ln-302--{storyId}`
2. 计算 `childSummaryArtifactPath = .hex-skills/runtime-artifacts/runs/{parent_run_id}/task-plan/ln-302--{storyId}.json`
3. 在 `.hex-skills/test-planning/ln-302--{storyId}_manifest.json` 生成子清单
4. 使用两个传输输入启动 `task-plan-worker-runtime`
5. 在 `PHASE_6_DELEGATE_TASK_PLAN` 中为 `child_run` 元数据创建检查点
6. 使用 `--run-id` 和 `--summary-artifact-path` 调用 `ln-302-task-replanner`
7. 仅读取生成的子 `task-plan` 产物

**传递给工作器：**
- 与创建模式相同的数据 + existingTaskIds

**工作器返回：** 操作摘要 + 子 `task-plan` 产物

**步骤 5：** 向调用方返回结构化摘要

---

## 运行时摘要产物

**必须阅读：** 加载 `references/test_planning_summary_contract.md`、`references/test_planning_worker_runtime_contract.md`、`references/task_plan_worker_runtime_contract.md`

运行时配置：
- family: `test-planning-worker`
- worker: `ln-523`
- 摘要类型：`test-planning-worker`
- 协调器使用的有效负载字段：`worker`、`status`、`warnings`、`test_task_id`、`test_task_url`、`coverage_summary`、`planned_scenarios`

调用规则：
- 独立运行：省略 `runId` 和 `summaryArtifactPath`
- 托管运行：同时传递 `runId` 和准确的 `summaryArtifactPath`
- 始终在终止结果之前写入经过验证的摘要

委派的子工作器规则：
- 委派给 `ln-301` 或 `ln-302` 时，`ln-523` 将成为父运行时
- 在委派前启动 `task-plan-worker-runtime`
- 在调用子 Skill 前对 `child_run` 元数据执行检查点保存
- 仅使用子工作器的 `task-plan` 构件，绝不使用子工作器的文本输出

## 完成定义

**已加载研究和手动测试结果：**
- [ ] 已找到研究评论“## 测试研究：{Feature}”（来自 ln-521）
- [ ] 已找到手动测试结果“## 手动测试结果”（来自 ln-522）
- [ ] 至少 1 项 AC 标记为 PASSED

**已生成基于风险的测试计划：**
- [ ] 已为所有场景计算风险优先级矩阵
- [ ] E2E 测试：基线正向测试 + 负向测试，仅当优先级 ≥15 时添加额外测试
- [ ] 集成测试：仅当 E2E 未覆盖且优先级 ≥15 时添加
- [ ] 单元测试：仅针对优先级 ≥15 的复杂业务逻辑
- [ ] 每项测试均满足全部 6 项实用性标准
- [ ] 不测试框架/库：每项测试仅验证我们的业务逻辑

**测试任务描述完整（11 个部分）：**
- [ ] 按模板填写全部 11 个部分
- [ ] 包含风险优先级矩阵
- [ ] 对基线 2 项测试之外的每项测试给出理由

**已执行工作器委派：**
- [ ] 创建模式：通过 `task-plan-worker-runtime` 委派给 ln-301-task-creator
- [ ] 重新规划模式：通过 `task-plan-worker-runtime` 委派给 ln-302-task-replanner
- [ ] 在委派前已对 `child_run` 元数据执行检查点保存
- [ ] 在最终摘要前已使用子工作器的 `task-plan` 构件
- [ ] 已返回跟踪器议题/故事 URL

**输出：**
- **创建模式：** 跟踪器议题/故事 URL + 确认信息
- **重新规划模式：** 操作摘要 + URL

## 参考文件

- **环境状态：** `references/environment_state_contract.md`
- **存储模式操作：** `references/storage_mode_detection.md`
- **基于风险的测试契约：** `references/risk_based_testing_guide.md`
- **可选方法论目录：** `references/risk_based_testing_methodology.md`
- **自动发现模式：** `references/auto_discovery_pattern.md`
- **测试任务模板：** `references/templates/test_task_template.md`（工作器 ln-301/ln-302 通过模板加载进行加载）
- **测试示例：** `references/risk_based_testing_examples.md`
- **必须阅读：** 加载 `references/research_tool_fallback.md`

## 关键规则

- **优先使用手动测试结果：** 如果 ln-522 的手动测试结果可用，请使用该结果。缺失时（简化模式），生成最少量的内联研究，并将手动测试标记为已跳过
- **E2E 优先，而非单元测试优先：** 基线始终为 2 项 E2E 测试（正向 + 负向）；仅当优先级 >= 15 时添加单元测试/集成测试
- **不测试框架：** 每项测试都必须验证我们的业务逻辑；绝不测试库/框架行为
- **强制实用性要求：** 基线之外的每项测试都必须满足全部 6 项实用性标准（参见 risk_based_testing_guide.md）
- **委派，而非创建：** 任务创建通过 ln-301/ln-302 工作器完成；此 Skill 仅生成计划
- **仅使用受管子运行：** 父子委派到 ln-301/ln-302 时必须使用 `task-plan-worker-runtime`、确定性的子 `runId`、完全一致的子 `summaryArtifactPath`，并且仅使用构件输出

## 最佳实践

**最小可行测试：** 从基线 E2E（正向 + 负向）开始。每个新增测试都必须满足全部 6 项实用性标准。

**基于风险的测试：** 按业务影响 × 发生概率确定优先级。根据实际手动测试结果，优先实施 E2E 测试。优先级 ≥15 的场景必须由测试覆盖。

**基于预期的测试：** 对于确定性测试，使用 `diff` 比较实际结果与预期结果。**必读：** 加载 `../ln-522-manual-tester/SKILL.md` — 参阅“测试设计原则”一节。

---

**版本：** 1.0.0
**最后更新：** 2026-01-15