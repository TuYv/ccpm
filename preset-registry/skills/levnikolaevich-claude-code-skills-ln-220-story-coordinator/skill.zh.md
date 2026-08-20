---
name: ln-220-story-coordinator
description: "Creates, replans, or appends 5-10 Stories per Epic with standards research and multi-epic routing. Use when Epic needs Story decomposition."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# Story 协调器

**类型：** L2 领域协调器  
**类别：** 2XX 规划

由运行时支持的 Story 规划协调器。运行时负责流程控制、暂停/恢复和工作器结果跟踪。

## 必读

执行前加载以下文件：
- `references/coordinator_runtime_contract.md`
- `references/story_planning_runtime_contract.md`
- `references/coordinator_summary_contract.md`
- `references/environment_state_contract.md`
- `references/storage_mode_detection.md`
- `references/problem_solving.md`

**必读：** 当 Epic、源文档或现有 Story 引用了 H/G/run ID，或者 researchgraph 布局可能改变 Story 拆分方式时，加载 `references/researchgraph_mcp_usage.md`。

## 目的

- 汇总 Epic 规划上下文
- 当标准研究会改变技术说明时，开展有针对性的研究
- 在检查现有 Story 之前构建理想的 Story 计划
- 按 Epic 分组检测路由和模式
- 在委派前批量准备子清单/工件
- 将创建或重新规划工作委派给独立工作器

## 输入

| 参数 | 必填 | 描述 |
|-----------|----------|-------------|
| `epicId` | 是 | 要拆分的 Epic |
| `autoApprove` | 否 | 如果为 false，运行时会暂停以等待预览确认 |

## 运行时

运行时系列：`story-planning-runtime`

标识符：
- `epic-{epicId}`

阶段：
1. `PHASE_0_CONFIG`
2. `PHASE_1_CONTEXT_ASSEMBLY`
3. `PHASE_2_RESEARCH`
4. `PHASE_3_PLAN`
5. `PHASE_4_ROUTING`
6. `PHASE_5_MODE_DETECTION`
7. `PHASE_6_DELEGATE`
8. `PHASE_7_FINALIZE`
9. `PHASE_8_SELF_CHECK`

终止阶段：
- `DONE`
- `PAUSED`

摘要流程：
- 使用来自 `ln-221` / `ln-222` 的子 `story-plan-worker` 工件
- 在 `PHASE_7_FINALIZE` 期间写入协调器 `story-plan` 工件

## 阶段映射

### 阶段 1：上下文汇总

解析 Epic，并仅汇总会改变 Story 拆分方式的规划输入：
- Epic 范围
- 成功标准
- 已知用户角色和约束
- 项目任务提供方

检查点载荷：
- `context_ready`

### 阶段 2：研究

仅在研究会改变 Story 技术说明或实现约束时，开展有针对性的研究。

不要让研究扩大 Story 范围。

如果存在 researchgraph 布局，请先使用 `verify_index`，然后仅查询相关的目标、假设、证据或运行记录。使用图谱结果作为确定 Story 范围、就绪情况和技术说明的依据；不要仅仅因为存在图谱债务就创建新的 Story 范围。

检查点载荷：
- `research_status`
- `research_file`

### 阶段 3：规划

在查看现有 Story 之前构建理想的 Story 计划。

规则：
- 仅使用垂直切片
- 当 Epic 确有需要时，规划 5-10 个 Story
- 使用简洁的 Story 陈述和可观察的验收标准
- 计划中不得包含编排说明
- 委派相关的验收标准必须说明为执行者提供了哪些支持（上下文、指令、工具、配置），而不能只说明执行者要做什么

检查点载荷：
- `ideal_plan_summary`

### 阶段 4：路由

将规划的 Story 路由到 Epic 分组。

快速路径：
- 所有 Story 都保留在已解析的 Epic 中

仅当路由存在歧义或需要确认时暂停。

检查点载荷：
- `routing_summary`

### 阶段 5：模式检测

确定每个 Epic 分组的模式：
- `CREATE`
- `REPLAN`
- `ADD`

检查点载荷：
- `epic_group_modes`

### 阶段 6：委派

阶段 6 包含两个内部步骤。

**阶段 6a：准备委派**
- 最终确定路由分组
- 生成工作器清单
- 为每个子项预先计算 `run_id` 和 `summary_artifact_path`
- 在执行前将预期工作器集合写入检查点

**阶段 6b：执行委派**

按分组委派：
- `ln-221-story-creator`
- `ln-222-story-replanner`

工作器仍可独立运行。在托管模式下，协调器通过 `planning-worker-runtime` 启动它们，传入 `runId + summaryArtifactPath`，将启动元数据存储在 `child_run` 中，然后通过 `record-epic` 记录生成的工作器产物。

工作器摘要类型：
- `story-plan-worker`

### 阶段 7：完成

仅在所有预期的工作器摘要均已记录后才完成。

协调器输出：
- 为父运行时构建一个 `story-plan` 摘要
- 通过 `node references/scripts/story-planning-runtime/cli.mjs record-plan-summary` 写入该摘要
- 在进入 `PHASE_8_SELF_CHECK` 前持久化该产物

**模板合规性门禁：** 通过已配置的跟踪器提供程序获取每个已创建的 Story（按照 `references/tracker_provider_contract.md` 对每个 Story 执行 `getStory` 操作）。运行 `planning-runtime/lib/template-compliance.mjs` 中的 `validateTemplateCompliance(description, 'story')`。所有 Story 都必须通过（9 个章节且顺序正确）。在状态中记录 `template_compliance_passed`。若未记录，门禁将阻止进入 SELF_CHECK。

检查点载荷：
- `final_result`
- `template_compliance_passed`

### 阶段 8：自检

确认：
- 阶段覆盖完整
- 规划的 Story 数量与产出的 Story 数量一致
- 没有遗漏 Epic 分组

检查点载荷：
- `pass`
- `final_result`

## 待决事项

以下情况使用运行时的 `PAUSED + pending_decision`：
- 缺少上下文
- 路由确认
- `ADD` 与 `REPLAN` 存在歧义
- 当 `autoApprove=false` 时进行预览确认

不要仅在聊天中保留这些决策。

## 工作器契约

工作器：
- 不知道协调器的存在
- 不读取运行时状态
- 保持可独立运行
- 可接收 `summaryArtifactPath`
- 无论哪种情况，都返回共享摘要信封

预期摘要类型：
- 子工作器：`story-plan-worker`
- 协调器输出：`story-plan`

## 工作器调用（强制）

**宿主 Skill 调用：** 必须使用 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按照所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用 Skill 中找到指定的 Skill，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该 Skill 工作流，然后携其结果/产物返回此处。
- 不要内联工作器逻辑，也不要在未执行目标 Skill 的情况下将工作器标记为已完成。

| 阶段 | 工作器 | 上下文 |
|-------|--------|---------|
| 6 | `ln-221-story-creator` | CREATE 或 ADD 路径 |
| 6 | `ln-222-story-replanner` | REPLAN 路径 |

```text
node references/scripts/planning-worker-runtime/cli.mjs start --skill {worker} --identifier {identifier} --manifest-file {workerManifestPath} --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}
child_run = { skill, run_id, identifier, summary_artifact_path }
childSummaryArtifactPath = .hex-skills/runtime-artifacts/runs/{parent_run_id}/story-plan-worker/{worker}--{identifier}.json
Skill(skill: "{worker}", args: "{identifier} --ideal-plan {idealPlanJSON} --epic {epicId} --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}")
Read {childSummaryArtifactPath}
node references/scripts/story-planning-runtime/cli.mjs record-epic --epic {epicId} --payload-file {childSummaryArtifactPath}
node references/scripts/story-planning-runtime/cli.mjs record-plan-summary --epic {epicId} --payload-file {coordinatorSummaryPath}
```

## TodoWrite 格式（必需）

```text
- Phase 1: Assemble context (pending)
- Phase 2: Research only what changes Technical Notes (pending)
- Phase 3: Build ideal Story plan (pending)
- Phase 4: Route Stories by Epic (pending)
- Phase 5: Detect mode per group (pending)
- Phase 6a: Prepare delegation batch (pending)
- Phase 6b: Execute worker(s) sequentially (pending)
- Phase 7: Finalize result (pending)
- Phase 8: Self-check (pending)
```

## 关键规则

- 在检查现有 Story 之前构建理想计划。
- 仅使用调研来改进技术说明和实现的现实可行性。
- 不要让路由或预览审批只存在于聊天状态中。
- 仅批量执行只读准备工作。除非运行时语义明确允许，否则不要跨已路由分组并行执行 Story 变更。
- 当工作应由 worker 完成时，不要直接创建或更新 Story。
- 使用 worker 摘要，而不是自由文本形式的 worker 说明。

## 完成定义

- [ ] 已使用 Epic 作用域的标识符启动运行时
- [ ] 已为上下文组装创建检查点
- [ ] 已为调研创建检查点，或明确将其保持在最低限度
- [ ] 已为理想计划创建检查点
- [ ] 已为路由创建检查点
- [ ] 已为模式检测创建检查点
- [ ] 已记录所有预期的 worker 摘要
- [ ] 已记录协调器的 `story-plan` 摘要
- [ ] 已为最终结果创建检查点
- [ ] 所有已创建的 Story 均已通过模板合规性检查
- [ ] 已通过自检

## 元分析

可选参考：仅当用户请求运行后元分析或采用协议格式的运行反思时，才加载 `references/meta_analysis_protocol.md`。

技能类型：`planning-coordinator`。收到请求时，在所有阶段完成后运行。使用协议格式输出到聊天中。

## 参考文件

- `references/environment_state_contract.md`
- `references/storage_mode_detection.md`
- `references/replan_algorithm.md`

---

**版本：** 5.0.0
**最后更新：** 2026-02-03