---
name: long-task-continuation
description: "Use when a task is multi-step, may span context resets or sessions, uses subagents, or risks losing state before completion."
---
# 长任务延续

## 概述

使用此技能可确保长任务具备检查点、可恢复、可感知偏移，并以证据作为门控依据。

这是一项协议技能。它不执行计划、不分派子代理、不运行测试，也不授予完成权限。

## 权限边界

当前负责：

- Method Pack 协议纪律

此处不负责：

- 计划执行
- 子代理分派
- 宿主守护进程 / 看门狗 / 自动重试
- 权威性 `GateDecision`
- 对证据充分性的最终判断
- 完成权限

## 何时使用

满足以下任一条件时，请使用此技能：

- 任务包含多个阶段或多个有实质意义的工作切片
- 任务可能被中断、压缩、恢复或移交
- 任务使用子代理
- 用户明确要求长任务连续性、恢复安全性或避免偏移
- 任务会更改架构、契约、共享工作流或验证门控

对于简短的直接回答或单命令检查，请勿强制使用此协议。

多步骤、由待办事项驱动或使用子代理的任务本身并不强制要求持久化记录；除非任务还会跨会话、需要移交或要求状态可恢复，否则保留内联检查点即可。

## 必需工件

在 `docs/aegis/work/YYYY-MM-DD-<slug>/` 下维护工件：

| 工件 | 文件 | 时机 |
|----------|------|------|
| TaskIntentDraft | `10-intent.md` 和可选的 `task-intent-draft.json` | 启动协议时 |
| BaselineReadSetHint | `10-intent.md`（内联） | 启动协议时 |
| BaselineUsageDraft | `10-intent.md`（内联）和可选的 `baseline-usage-draft.json` | 启动协议时以及基线使用情况发生变化时 |
| ImpactStatementDraft | `10-intent.md`（内联） | 启动协议时 |
| TodoCheckpointDraft | `20-checkpoint.md` 和可选的 `todo-checkpoint-draft.json` | 每个检查点 |
| ResumeStateHint | `20-checkpoint.md`（内联） | 每次暂停/移交时 |
| DriftCheckDraft | `20-checkpoint.md`（内联）和可选的 `drift-check-draft.json` | 按切片协议 |
| EvidenceBundleDraft | `90-evidence.md` 和可选的 `evidence-bundle-draft.json` | 按切片协议 |
| Reflection | `99-reflection.md` | 完成候选阶段 |

仅适用于中等及以上复杂度的任务。低复杂度任务跳过 work/。

当工作流为中/高复杂度、由子代理驱动、易于移交、长期运行、对架构 / 契约敏感，或对兼容性 / 退役敏感时，可以在 `10-intent.md` 或当前检查点中内联包含 `Execution Readiness View`。它是现有草案和父计划的人类可读呈现形式，而不是新的 JSON 工件类型，也不代表完成权限。

无计划切片通道：

- 当父计划或父规范已负责管理长任务工作流，而当前微切片仅执行或细化其中一项有明确边界的父任务时，请使用此通道。
- 记录一份紧凑的 Slice Card，而不是另行创建持久化计划/规范：

  ```text
  Slice Card:
  - Goal:
  - Parent plan/spec:
  - Files:
  - Boundary:
  - Verification:
  - Stop:
  ```

- Slice Card 的 `Goal` 仅用于锚定切片级完整性。
- 它本身并不授予整个任务的完成权限。
- 最终完成仍需要依据父计划/规范以及任何生效中的目标框架执行 `verification-before-completion` 目标闭环，并通过统一的 Aegis 影响/安全回执呈现，除非用户要求审计细节。

- 对于仍处于父计划、现有兼容性边界和已知验证路径之内的微小切片，不要创建新的计划/规范文件。
- 需要持久化状态时，更新现有的检查点、证据和漂移记录。
- 只有在出现新的负责人、契约、模式、公共 API、架构边界、迁移、持久化、安全/权限、分发/发布界面或不明确的验证边界时，才升级并脱离此执行通道。

当范围涉及持久性架构决策时，这些工作记录是 ADR 自动回填的首选来源。应在工作记录中保留 ADR 信号、来源引用、替代方案、兼容性边界、漂移检查、退役说明和基线同步问题，而不是在完成时依赖记忆。

这些是草案 / 提示 / 投影输入。它们不是权威运行时记录。

## 工作区辅助工具协议

当已配置的 Aegis 工作区支持或已安装的 Aegis 工作区支持可用时，将其用于目标项目工作区和生命周期记录：

1. 在写入工作记录前进行初始化：

   ```bash
   python <aegis-workspace-helper> init --root <target-project-root>
   ```

2. 对于新的中型及以上任务流程轨迹，优先使用辅助工具创建生命周期记录，而不是手动创建文件：

   ```bash
   python <aegis-workspace-helper> new-work --root <target-project-root> --date YYYY-MM-DD --slug <slug> --title "<title>" --requested-outcome "<outcome>" --scope "<scope>" --change-kind <kind>
   ```

3. 每个切片完成后，通过辅助工具更新检查点、证据和漂移：

   ```bash
   python <aegis-workspace-helper> add-checkpoint --root <target-project-root> --work YYYY-MM-DD-<slug> ...
   python <aegis-workspace-helper> add-baseline-usage --root <target-project-root> --work YYYY-MM-DD-<slug> ...
   python <aegis-workspace-helper> add-evidence --root <target-project-root> --work YYYY-MM-DD-<slug> ...
   python <aegis-workspace-helper> add-drift-check --root <target-project-root> --work YYYY-MM-DD-<slug> ...
   ```

4. 在暂停、移交或进入完成候选状态之前，汇集结构化证明包并检查工作区：

   ```bash
   python <aegis-workspace-helper> bundle --root <target-project-root> --work YYYY-MM-DD-<slug>
   python <aegis-workspace-helper> check --root <target-project-root>
   ```

这些辅助工具检查仅验证工作区结构、索引覆盖情况和 JSON 辅助文件的结构。它们不判定证据是否充分，不生成权威的 `GateDecision`，也不授予完成权限。

## 启动协议

在执行长任务之前：

1. 说明请求的结果、范围、非目标和风险提示。
2. 如果已有目标框架，则重述目标、成功证据、停止条件和非目标。停止条件必须允许已完成、受阻、需要验证和超出范围这些结果。
3. 确定更改文件前必须读取的基线引用。
4. 记录基线使用状态：
   - 必需的基线引用
   - 当宿主能够投影时，可选择记录已交付的上下文引用
   - 在计划前已确认的引用
   - 计划中引用的引用
   - 缺失的引用
5. 创建或更新待办事项映射。
6. 如果父计划或工作流需要执行移交，则呈现或链接一个 `Execution Readiness View`：
   - 意图锁定
   - 范围边界
   - 基线锁定
   - 负责人 / 契约约束
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
   - 活动切片
   - 已完成的待办事项
   - 证据引用
   - 阻塞项
   - 下一步
8. 如果缺少基线引用，则暂停于 `needs-baseline-readback`。
9. 如果工作区辅助工具可用，则使用 `aegis-workspace.py new-work` 创建第一个 `docs/aegis/work/` 文件并将其编入索引，然后在继续之前运行 `check --root
   <target-project-root>`。

## 每切片协议

在每个工作切片开始前，重述：

1. 当前目标
2. 当前待办事项
3. 计划进行的编辑
4. 明确不进行的编辑
5. 验证命令或手动检查
6. 存在 `Execution Readiness View` 时，与其保持一致的情况

对于现有父计划下的微型切片，请使用无计划切片通道并陈述切片卡，而不是新建规划/规格制品。

在每个工作切片完成后，更新：

1. 已完成的待办事项
2. 证据引用
3. 如果新要求的引用已得到确认、引用或被发现缺失，则更新基线使用情况
4. 阻塞项
5. 下一步
6. 漂移检查
7. 在可用时，通过 `aegis-workspace.py add-checkpoint`、`aegis-workspace.py add-baseline-usage`、`aegis-workspace.py add-evidence` 和 `aegis-workspace.py add-drift-check` 更新由辅助工具支持的 JSON 辅助文件

当补丁形态/连锁影响分诊、H 类发现或有边界的兼容性缓解措施被触发时，局部结果为绿色并不能排除该方向。复用检查点正文和证据引用，以保留 `PatchShape`、`CanonicalOwner`、`UpwardDrillSignal`、决策、最新结果以及一条有边界的证据引用；不要复制原始日志或完整差异。

如果没有新证据，则状态为 `needs-verification` 或 `partial`。

## 恢复协议

恢复工作时：

1. 阅读最新检查点。
2. 阅读最新的恢复提示（如果存在）。
3. 重新阅读原始任务意图。
4. 重新阅读所需的基线引用。
5. 对于非简单工作，被动重新阅读相关的现行 `CONTEXT.md` 表述。
6. 重新阅读 `Execution Readiness View`（如果存在）。
7. 将当前工作树状态与检查点声明进行比较。
8. 将该切片与视图中的意图、范围、基线、兼容性、退役、测试和审查锁定项进行比较。
9. 如果检查点、基线、上下文、视图和工作树之间存在任何分歧，则对于语义冲突，编排 `establishing-project-context`；对于任何其他分歧，暂停或返回规划阶段。
10. 在进行计划外修复之前，阅读保留的不变量、所有者接缝、补丁形态和因果拓扑，并将比较工作交由 `systematic-debugging` 处理；仅出现新的载体名称并不能证明这是一个新方向。

绝不要仅凭记忆恢复工作。

## 漂移检查

在每个切片完成后回答以下问题：

- 当前工作是否仍然服务于原始任务意图？
- 当前工作是否仍然服务于目标和停止条件？
- 该切片是否保持在兼容性边界内？
- 是否出现了任何新的所有者、回退方案、适配器或分支？
- 退役轨道是否仍然明确？
- 证据包是否充分增长，足以支持下一项声明？
- 如果存在 `Execution Readiness View`，当前切片是否仍然符合其中的意图锁、范围边界、基线锁、兼容性边界、退役边界、测试义务和审查关卡？

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
6. 如果辅助工具可用且存在工作记录，请运行 `python <aegis-workspace-helper> bundle --root <target-project-root>
   --work YYYY-MM-DD-<slug>`。
7. 如果辅助工具可用且任务写入了 `docs/aegis/` 记录，请运行 `python <aegis-workspace-helper> check --root <target-project-root>`。
8. 将生成的 `GateInputPack` 仅视为未来运行时的输入。
9. 如果范围内包含持久性架构决策，请将工作记录、证明包、漂移检查、证据引用和 ADR 信号传递给
   aegis:verification-before-completion，以进行 ADR 补录检查。

Method Pack 输出仅是经过验证的证据和建议性判断。它不具有完成状态的权威性。

## 最小报告格式

长任务更新请使用以下格式：

- `Aegis Visibility`：说明检查点、恢复、漂移、交接或父计划规范为何会影响下一步
- `TodoCheckpointDraft`：当前待办事项、已完成的待办事项、当前活动切片、下一步
- `BaselineUsageDraft`：必需引用、已确认引用、已引用内容、缺失引用、决策
- `Execution Readiness View`：present | absent | refreshed | stale，以及存在时的
  对齐信号
- `Evidence`：命令、文件、日志或人工检查
- `DriftCheckDraft`：范围、兼容性、退役、决策
- `Risk / Unknown`：未解决的阻塞项或缺失的证据
- `Next`：下一个最小且安全的操作