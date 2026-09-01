---
name: long-task-continuation
description: "Use when a task is multi-step, may span context resets or sessions, uses subagents, or risks losing state before completion."
---
# 长任务续接

## 概述

使用此 skill 让长任务具备检查点、可恢复、漂移感知和证据门控能力。

这是一个协议 skill。它不会执行计划、调度子代理、运行测试，也不会授予完成权限。

## 权限边界

当前所有者：

- Method Pack 协议规范

此处不负责：

- 计划执行
- 子代理调度
- 主机守护进程 / watchdog / 自动重试
- 权威 `GateDecision`
- 证据充分性的最终判断
- 完成权限

## 使用时机

满足以下任一条件时使用此 skill：

- 任务包含多个阶段，或包含不止一个有意义的工作切片
- 任务可能被中断、压缩、恢复或移交
- 任务使用子代理
- 用户明确要求长任务连续性、恢复安全性或避免漂移
- 任务会更改架构、契约、共享工作流或验证门

对于简短的直接回答或单命令检查，不要强制使用此协议。

多步骤、由待办事项驱动或使用子代理的任务本身并不强制要求持久化记录；除非任务还涉及跨会话、需要移交或要求可恢复状态，否则保留行内检查点即可。

## 必需构件

在 `docs/aegis/work/YYYY-MM-DD-<slug>/` 下维护构件：

| 构件 | 文件 | 时机 |
|----------|------|------|
| TaskIntentDraft | `10-intent.md` 和可选的 `task-intent-draft.json` | 协议开始时 |
| BaselineReadSetHint | `10-intent.md`（行内） | 协议开始时 |
| BaselineUsageDraft | `10-intent.md`（行内）和可选的 `baseline-usage-draft.json` | 协议开始时，以及基线使用发生变化时 |
| ImpactStatementDraft | `10-intent.md`（行内） | 协议开始时 |
| TodoCheckpointDraft | `20-checkpoint.md` 和可选的 `todo-checkpoint-draft.json` | 每个检查点 |
| ResumeStateHint | `20-checkpoint.md`（行内） | 每次暂停 / 移交时 |
| DriftCheckDraft | `20-checkpoint.md`（行内）和可选的 `drift-check-draft.json` | 每个切片的协议流程 |
| EvidenceBundleDraft | `90-evidence.md` 和可选的 `evidence-bundle-draft.json` | 每个切片的协议流程 |
| Reflection | `99-reflection.md` | 完成候选阶段 |

仅针对中等及以上复杂度的任务。低复杂度任务跳过 work/。

`Execution Readiness View` 可以在 `10-intent.md` 或活动检查点中以内联形式包含，适用于工作流为中等 / 高复杂度、由子代理驱动、容易发生移交、长时间运行、对架构 / 契约敏感，或对兼容性 / 退役敏感的情况。它是现有草稿和父计划的人类可读呈现，不是新的 JSON 构件类型，也不具有完成权限。

无计划切片通道：

- 当父计划或父规范已经负责长任务工作流，而当前微切片只执行或细化一个有边界的父任务时，使用此通道。
- 记录紧凑的 Slice Card，而不是创建另一个持久化计划 / 规范：

  ```text
  Slice Card:
  - Goal:
  - Parent plan/spec:
  - Files:
  - Boundary:
  - Verification:
  - Stop:
  ```

- Slice Card 的 `Goal` 只用于锚定切片级别的完整性。
- 它本身不会授予整个任务的完成权限。
- 最终完成仍然需要根据父计划 / 父规范以及任何活动的目标框架执行 `verification-before-completion` Goal Closure，并通过统一的 Aegis impact/safety receipt 呈现，除非用户要求审计细节。

- 对于仍处于父计划、现有兼容性边界和已知验证路径内的微小切片，不要创建新的计划/规范文件。
- 如果需要持久化状态，请更新现有的检查点、证据和漂移记录。
- 仅当出现新的所有者、契约、模式、公共 API、架构边界、迁移、持久化、安全/权限、分发/发布面，或不明确的验证边界时，才应升级到此流程之外。

当持久化架构决策处于范围内时，这些工作记录是 ADR 自动回填的首选来源。在工作记录中保留 ADR 信号、源引用、备选方案、兼容性边界、漂移检查、退役说明和基线同步问题，不要依赖完成时的记忆。

这些是草稿/提示/投影输入，不是权威的运行时记录。

## Workspace Helper Protocol

当已配置或已安装 Aegis workspace support 时，请将其用于目标项目工作区和生命周期记录：

1. 在写入工作记录之前进行初始化：

   ```bash
   python <aegis-workspace-helper> init --root <target-project-root>
   ```

2. 对于新的中型及以上任务流程，优先使用辅助工具创建生命周期记录，而不是手动创建文件：

   ```bash
   python <aegis-workspace-helper> new-work --root <target-project-root> --date YYYY-MM-DD --slug <slug> --title "<title>" --requested-outcome "<outcome>" --scope "<scope>" --change-kind <kind>
   ```

3. 每个切片完成后，通过辅助工具更新检查点、证据和漂移：

   ```bash
   python <aegis-workspace-helper> add-checkpoint --root <target-project-root> --work YYYY-MM-DD-<slug> ...
   python <aegis-workspace-helper> add-baseline-usage --root <target-project-root> --work YYYY-MM-DD-<slug> ...
   python <aegis-workspace-helper> add-attempt --root <target-project-root> --work YYYY-MM-DD-<slug> --slice-id <slice-id> --attempt-id <attempt-id> --attempt-status failed ...
   python <aegis-workspace-helper> add-evidence --root <target-project-root> --work YYYY-MM-DD-<slug> --slice-id <slice-id> --evidence-status <terminal-status> ...
   python <aegis-workspace-helper> add-drift-check --root <target-project-root> --work YYYY-MM-DD-<slug> ...
   ```

   对当前切片内失败的验证重试，请使用 `add-attempt`。
   仅当切片达到 `evidence-finalized`、`blocked` 或 `abandoned` 状态后，才使用 `add-evidence`。不要让失败的尝试创建另一个切片或正式的证据附属文件。

4. 在暂停、交接或准备完成之前，组装结构化证明包并检查工作区：

   ```bash
   python <aegis-workspace-helper> bundle --root <target-project-root> --work YYYY-MM-DD-<slug>
   python <aegis-workspace-helper> check --root <target-project-root>
   ```

这些辅助工具检查只验证工作区结构、索引覆盖范围和 JSON 附属文件的形状。它们不会决定证据是否充分，不会生成权威的 `GateDecision`，也不会授予完成权限。

## 启动协议

在执行长任务之前：

1. 说明请求的结果、范围、非目标和风险提示。
2. 如果存在目标框架，重新陈述目标、成功证据、停止条件和非目标。停止条件必须允许以下结果：已完成、已阻塞、需要验证和超出范围。
3. 确定在修改文件之前必须读取的基线引用。
4. 记录基线使用状态：
   - 必需的基线引用
   - 可选的已交付上下文引用（当宿主能够提供时）
   - 在计划之前已确认的引用
   - 计划中引用的引用
   - 缺失的引用
5. 创建或更新待办事项映射。
6. 如果父计划或工作流需要执行交接，则呈现或链接一个 `Execution Readiness View`：
   - 意图锁定
   - 范围边界
   - 基线锁定
   - 所有者 / 合约约束
   - 兼容性边界
   - 退役边界
   - 任务批次
   - 测试义务
   - 审查关卡
   - 漂移 / 回退规则
   - 完成前所需的证据
   - 建议性边界
7. 创建第一个检查点：
   - 当前待办事项
   - 当前活动切片
   - 已完成的待办事项
   - 证据引用
   - 阻塞项
   - 下一步
8. 如果缺少基线引用，则暂停并进入 `needs-baseline-readback` 状态。
9. 如果工作区辅助工具可用，则使用 `aegis-workspace.py new-work` 创建 / 索引第一个 `docs/aegis/work/` 文件，并在继续之前运行 `check --root <target-project-root>`。

## 重试收敛协议

验证失败表示当前切片中的又一次尝试，而不是新的切片。

- 复用当前的 `activeSlice` 作为 `--slice-id`。
- 使用 `add-attempt` 记录每次重试，而不是使用 `add-evidence`。
- 不要将失败的尝试追加到 `90-evidence.md`。
- 不要为尝试遥测创建常规提交。
- `docs/aegis/` 下仅进程性的差异不会重新启动已完成的业务代码验证。
- 当 `add-attempt` 报告 `process-artifact-pressure` 时，停止自动重试，并转入 `systematic-debugging` 或 `verification-before-completion`。
- 只有终态证据（`evidence-finalized`、`blocked` 或 `abandoned`）才有资格执行 `bundle`。

## 每切片协议

在每个工作切片之前，重新陈述：

1. 当前目标
2. 当前待办事项
3. 计划进行的修改
4. 明确不进行的修改
5. 验证命令或手动检查
6. 与 `Execution Readiness View` 的一致性（如果存在）

对于现有父计划下的微切片，使用 Planless Slice Lane，并陈述 Slice Card，而不是新建规划 / 规格说明文档。

每个工作切片之后，更新：

1. 已完成的待办事项
2. 证据引用
3. 如果新要求的引用已确认、已引用或被发现缺失，则更新基线使用情况
4. 阻塞项
5. 下一步
6. 漂移检查
7. 如果可用，则通过 `aegis-workspace.py add-checkpoint`、`aegis-workspace.py add-baseline-usage`、`aegis-workspace.py add-evidence` 和 `aegis-workspace.py add-drift-check` 更新辅助工具支持的 JSON 旁车文件
8. 验证失败：使用当前的 `--slice-id` 通过 `add-attempt` 记录；不要添加终态证据，也不要创建仅进程性的提交

当 patch-shape/ripple triage、H-class finding 或有界兼容性缓解措施触发时，局部通过的结果并不能消除该方向的问题。复用检查点中的表述和证据引用，以保留 `PatchShape`、`CanonicalOwner`、`UpwardDrillSignal`、决策、最新结果以及一个有界证据引用；不要复制原始日志或完整差异。

如果没有新鲜证据，则状态为 `needs-verification` 或 `partial`。

## 恢复协议

恢复工作时：

1. 读取最新检查点。
2. 如果存在，读取最新的恢复提示。
3. 重新阅读原始任务意图。
4. 重新阅读必需的基线引用。
5. 对于非简单工作，被动重新阅读相关活动 `CONTEXT.md` 中的措辞。
6. 如果存在，重新阅读 `Execution Readiness View`。
7. 将当前工作树状态与检查点声明进行比较。
8. 将当前切片与该视图中的意图、范围、基线、兼容性、退役、测试和评审锁进行比较。
9. 如果检查点、基线、上下文、视图和工作树之间存在任何不一致，对于语义冲突，编写 `establishing-project-context`；对于任何其他不一致，暂停或返回规划阶段。
10. 在进行未规划的修复之前，读取保留的不变量、所有者接缝、补丁形状和因果拓扑，并将比较路由至 `systematic-debugging`；仅有新的载体名称并不能证明存在新的方向。

绝不要仅凭记忆恢复工作。

## 漂移检查

在每个切片之后回答以下问题：

- 当前工作是否仍然服务于原始任务意图？
- 当前工作是否仍然服务于目标和停止条件？
- 该切片是否保持在兼容性边界之内？
- 是否出现了新的所有者、回退、适配器或分支？
- 退役轨道是否仍然明确？
- 证据包是否增长到足以支持下一项声明？
- 如果存在 `Execution Readiness View`，当前活动切片是否仍然符合其中的意图锁、范围围栏、基线锁、兼容性边界、退役边界、测试义务和评审门槛？

允许的决策：

- `continue`
- `pause-for-user`
- `needs-baseline-readback`
- `needs-verification`
- `blocked`

禁止的决策：

- `gate-passed`
- `completion-granted`
- `authoritatively-safe`

## 完成候选协议

在宣布工作完成之前：

1. 使用 aegis:verification-before-completion。
2. 确认每个待办事项都有状态。
3. 确认阻塞项已解决或已外部化。
4. 确认证据引用覆盖验收标准。
5. 确认漂移检查不存在阻塞状态。
6. 如果辅助工具可用且存在工作记录，运行 `python <aegis-workspace-helper> bundle --root <target-project-root> --work YYYY-MM-DD-<slug>`。
7. 如果辅助工具可用且任务写入了 `docs/aegis/` 记录，运行 `python <aegis-workspace-helper> check --root <target-project-root>`。
8. 将生成的 `GateInputPack` 仅视为未来运行时输入。
9. 如果工作范围包括持久化的架构决策，则将工作记录、证明包、漂移检查、证据引用和 ADR 信号传入 aegis:verification-before-completion，以进行 ADR Backfill Check。

Method Pack 输出仅属于经验证的证据和咨询性判断，不代表权威完成状态。

## 最小报告结构

长任务更新使用以下结构：

- `Aegis Visibility`：说明检查点、恢复、偏移、交接或父计划纪律为何影响下一步
- `TodoCheckpointDraft`：当前待办事项、已完成的待办事项、活动切片、下一步
- `BaselineUsageDraft`：必需引用、已确认引用、已引用引用、缺失引用、决策
- `Execution Readiness View`：存在 | 缺失 | 已刷新 | 已过时，以及存在时的对齐信号
- `Evidence`：命令、文件、日志或人工检查
- `Process Artifact Pressure`：已尝试的切片、重试次数、终止状态，以及是否已启用收敛停止
- `DriftCheckDraft`：范围、兼容性、退役、决策
- `Risk / Unknown`：未解决的阻塞因素或缺失的证据
- `Next`：下一项最小安全操作