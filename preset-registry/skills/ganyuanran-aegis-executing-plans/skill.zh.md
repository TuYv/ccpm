---
name: executing-plans
description: "Use when executing a written implementation plan across sessions or with review checkpoints. Small or single-slice plans stay inline. For same-session independent tasks, use subagent-driven-development instead."
---
# 执行计划

## 概述

加载计划，严格审查，执行所有任务，并在完成时报告。

**开始时宣布：**“我正在使用 executing-plans 技能来实施此计划。”

对于非简单执行，请包含 `Aegis Visibility`：简要说明当前工作切片与其计划、检查点、偏移或验证边界之间的关系。完成时，将计划遵循情况、证据、复杂度和剩余风险传递给 `verification-before-completion`，以生成统一回执。

如果子代理可用，且计划中包含真正相互独立的任务，优先使用 `subagent-driven-development`；缺少子代理支持并不妨碍内联执行。同一任务的代理共享同一个工作区，且协调者仍是唯一拥有 Git 修改权限的角色。

## 流程

### 第 1 步：加载并审查计划
1. 阅读计划文件
2. 如果计划或当前检查点包含 `Execution Readiness View`，请在实施前阅读它，并对照其意图锁定、范围边界、基线锁定、所有者／契约约束、兼容性边界、退役边界、测试义务、审查关卡、偏移／回退规则，以及完成前所需的证据来检查计划。
3. 严格审查——识别对计划的任何疑问或担忧
4. 如果该视图与计划、基线或当前工作树证据相矛盾，请在编辑前返回计划审查，或刷新咨询性交接信息。
5. 在实施前运行 TDD 路线守卫：确认 `Mode`、`Decision`、`Strict authority`、`Test posture` 和验证要求。严格步骤需要有记录的明确用户／项目授权；计划批准或风险标签不构成授权。缺少记录的关闭模式只能补记为 `Mode: off / Decision: skipped`，且不得加载 TDD。缺失或不受支持的自动决策应返回计划审查。只有 `Decision: strict` 且存在已记录的严格授权时，才可授权名为 `Write failing test`、`Verify RED`、`GREEN` 或 `REFACTOR` 的步骤。执行期间不得推断为 `strict`。
6. 如果存在担忧：在开始前向你的人工协作者提出
7. 在首次写入前，捕获 `TaskStartSnapshot`：根目录、`HEAD`、分支或分离状态、与上游的分歧、已暂存／未暂存／未跟踪的路径、当前进行中的 Git 操作，以及 `git worktree list --porcelain`。保留任务开始前已存在的状态；不要对其执行 stash、reset、clean 或 commit。
8. 除非规则要求独立历史记录，或另一个目标已占用当前分支，否则复用当前分支。如果理由充分且安全，请在当前工作区中切换／创建分支；即使使用工作树，仍需存在并发检出需求或阻塞性的脏状态。
9. 如果没有担忧：创建 TodoWrite 并继续

### 第 1.5 步：长任务检查点设置

如果计划包含多个任务、可能跨会话执行，或涉及架构／契约／工作流变更：

1. 宣布：“我正在使用 long-task-continuation 技能，使此计划保持检查点记录并感知偏移。”
2. 加载 aegis:long-task-continuation。
3. 根据计划创建初始检查点：
   - 当前待办事项
   - 当前任务
   - 已完成任务
   - 证据引用
   - 阻塞项
   - 下一步
4. 在每项任务开始前，重述当前检查点。
5. 在每项任务完成后，更新检查点、证据引用和偏移检查。

在进行验证驱动的计划外编辑之前，读取保留的 `PatchShape`、
`CanonicalOwner`、`UpwardDrillSignal`、结果和证据引用。编辑前，将它们
与候选方案的比较交由 `systematic-debugging`；由它判断这些方向是否趋于一致。
已证实为独立 canonical-owner 的根因仍沿正常计划路径处理。

### 步骤 2：执行任务

对于每个任务：
1. 将其标记为 in_progress
2. 严格遵循每个步骤（计划包含粒度适中的小步骤）
3. 在任务添加任何新的源代码路径之前，重述计划中的
   `Change Necessity`；如果计划未能将其延续下来，则创建一个简洁版本。
   计划获批本身并不能证明新的辅助函数、小型防护逻辑、
   新分支、回退机制、适配器或所有者是必要的。

   ```text
   Change Necessity:
   - User-visible need:
   - No-change / non-code option:
   - Why code change is necessary:
   - Minimum change boundary:
   - Decision: no-change | docs/config-only | code-change | needs-clarification
   ```

   如果决策不是 `code-change`，则暂停执行并返回计划
   审查，而不是进行编辑。如果决策是 `code-change`，则将
   最小边界落实到编辑和验证范围中。
4. 在进行任何非简单的源代码编辑之前，运行计划中的
   `Pre-Edit Complexity Check`，或创建一个简洁版本：

   对共享工件类别、压力信号和 `over-budget` 处理方式，
   使用 `using-aegis/references/complexity-governance.md`。

   ```text
   Complexity Budget:
   - Artifact class:
   - Target files / artifacts:
   - Current pressure:
   - Projected post-change pressure:
   - Budget result: within-budget | at-risk | over-budget
   - Planned governance:

   Pre-Edit Complexity Check:
   - Target edit file:
   - Existing pressure signal:
   - Safer edit boundary:
   - Decision: edit-in-place | extract helper | add owner file | split task | pause for plan update

   Pre-Edit Owner-Fit Decision:
   - Edit intent: wiring-only | move-out / extract-first | local-fix-without-new-responsibility | new-responsibility | emergency / compatibility patch
   - Owner fit:
   - Safer edit boundary:
   - Decision: edit-in-place | extract helper | add owner file | split task | pause for plan update
   ```

   如果检查结果与计划中的文件边界相冲突，则暂停并返回计划
   审查，而不是悄悄地将逻辑塞进负担过重的所有者中。如果
   预算结果为 `over-budget`，且任务也没有对该
   超支进行治理，则停止执行并返回计划审查，而不是将
   该任务当作仍然是原子任务强行推进。
   当目标编辑文件已超出预算或用途混杂时，
   默认不得在原处添加 `new-responsibility`。`wiring-only`、
   `move-out / extract-first` 和 `local-fix-without-new-responsibility` 只有在
   不增加新职责且验证边界清晰时才能继续。
   `emergency / compatibility patch` 需要说明剩余风险
   和退役触发条件。
5. 按指定要求运行验证
6. 协调器是 Git 变更操作的所有者。在完整一致的任务通过
   其计划验证后，先使用 `verification-before-completion`，然后再执行
   默认的本地提交；仅暂存任务所拥有的路径，并回读 `HEAD`、
   已提交文件列表和剩余任务差异。`no commit`、只读、
   无变更以及验证失败的任务不会创建常规提交。
7. 在将任务标记为已完成之前，更新 `TodoCheckpointDraft` 和 `DriftCheckDraft`。
   当存在 `Execution Readiness View` 时，漂移检查必须明确
   将当前切片与该视图的意图锁定、范围边界、
   基线锁定、兼容性边界、退役边界、测试
   义务和审查门槛进行比较。
8. 将其标记为已完成

### 第 3 步：完成开发

所有任务完成并验证后：

- 如果 Aegis 创建了分支/worktree，或者用户请求处理集成，
  使用 `aegis:finishing-a-development-branch`；
- 否则使用 `verification-before-completion`，报告本地任务提交
  以及 `Task clean` / `Repository clean`，并且不要凭空添加合并/PR 流程。

## 何时停止并寻求帮助

**遇到以下情况时，立即停止执行：**
- 遇到阻碍（缺少依赖项、测试失败、指令不明确）
- 计划存在导致无法开始的关键缺口
- 你不理解某条指令
- 验证反复失败

**应请求澄清，而不是猜测。**

## 何时重新执行先前步骤

**遇到以下情况时，返回审查（第 1 步）：**
- 合作伙伴根据你的反馈更新了计划
- 需要重新思考基本方法

**不要强行绕过阻碍**——停止并询问。

## 请记住
- 首先严格审查计划
- 严格按照计划步骤执行
- 不要跳过验证
- 当计划要求引用技能时，引用相应技能
- 遇到阻碍时停止，不要猜测
- 不要仅仅因为当前分支是 `main`/`master` 就创建分支
- 不要仅仅因为任务复杂、采用 TDD、需要规划或使用子代理，就触发 worktree

## 集成

**必需的工作流技能：**
- **aegis:writing-plans**——创建此技能所执行的计划
- **aegis:using-git-worktrees**——仅当已批准的 Git 生命周期表明必须进行并发检出时使用
- **aegis:finishing-a-development-branch**——仅当分支/worktree 的集成或清理在工作范围内时使用