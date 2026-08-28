---
name: executing-plans
description: "Use when executing a written implementation plan across sessions or with review checkpoints. Small or single-slice plans stay inline. For same-session independent tasks, use subagent-driven-development instead."
---
# 执行计划

## 概述

加载计划，进行批判性审查，执行所有任务，并在完成后报告。

**开始时宣布：**“我正在使用 executing-plans skill 来实现此计划。”

对于非平凡的执行任务，请加入 `Aegis Visibility`：简要说明当前切片与其计划、检查点、偏移或验证边界之间的联系。完成时，将计划遵循情况、证据、复杂度和剩余风险传递给
`verification-before-completion`，以生成统一回执。

如果有可用的子代理，且计划确实包含相互独立的任务，优先使用
`subagent-driven-development`；不支持子代理并不会阻止内联执行。同一任务的代理共享一个工作区，协调者仍是唯一的 Git 变更负责人。

## 流程

### 步骤 1：加载并审查计划
1. 读取计划文件
2. 如果计划或活动检查点包含 `Execution Readiness View`，请在实施前阅读它，并将计划与其意图锁定、范围边界、基线锁定、所有者 / 合约约束、兼容性边界、退役边界、测试义务、审查关卡、偏移 / 回退规则，以及完成前所需的证据进行比较。
3. 批判性地审查——识别计划中存在的任何问题或疑虑
4. 如果该视图与计划、基线或当前工作区证据相矛盾，请返回计划审查，或在编辑前刷新咨询交接信息。
5. 在实施前运行 TDD Route Guard：确认 `Mode`、`Decision`、`Strict authority`、严格信号、轻量适用性、`Test posture` 和验证结果。严格步骤必须有明确的用户 / 项目请求或已记录的自动决策；仅凭计划批准或风险标签不构成授权。缺失的关闭模式记录只能修复为 `Mode: off / Decision:
   skipped`，不得加载 TDD。缺失 / 不受支持的自动决策应返回计划审查。存在任何严格信号，或其微小 / 低风险 / 单一所有者 / 无行为变更证明不完整时，自动轻量记录均不受支持。只有记录了严格授权的 `Decision: strict` 才能授权名为 `Write failing test`、`Verify RED`、`GREEN` 或 `REFACTOR` 的步骤。不得在执行期间推断 `strict`。
6. 如果存在疑虑：在开始前与人类协作者提出
7. 在首次写入前，捕获 `TaskStartSnapshot`：根目录、`HEAD`、分支或 detached 状态、上游分歧、已暂存 / 未暂存 / 未跟踪路径、活动中的 Git 操作，以及 `git worktree list --porcelain`。保留任务开始前已有的状态；不得对其执行 stash、reset、clean 或 commit。
8. 除非规则要求独立历史，或另一个目标拥有该分支，否则复用当前分支。如果有充分理由，请在安全的情况下于当前工作区中切换 / 创建该分支；工作树仍然要求并发检出或阻塞脏状态。
9. 如果没有疑虑：创建 TodoWrite 并继续

### 步骤 1.5：长任务检查点设置

如果计划包含多个任务、可能跨越多个会话，或包含架构 / 合约 / 工作流变更：

1. 宣布：“我正在使用 long-task-continuation skill，以保持此计划具有检查点并能感知偏移。”
2. 加载 `aegis:long-task-continuation`。
3. 根据计划创建初始检查点：
   - 当前待办事项
   - 活跃任务
   - 已完成任务
   - 证据引用
   - 阻塞项
   - 下一步
4. 在每项任务开始前，重新陈述当前检查点。
5. 在每项任务完成后，更新检查点、证据引用和偏移检查。

在进行验证驱动的计划外编辑之前，读取保留的 `PatchShape`、
`CanonicalOwner`、`UpwardDrillSignal`、结果和证据引用。编辑前，将它们
与候选方案的比较交由 `systematic-debugging` 处理；由它决定这些方向是否
趋于一致。已证实的独立 canonical-owner 根目录仍沿用正常计划路径。

### 步骤 2：执行任务

对于每项任务：
1. 将其标记为 in_progress
2. 严格遵循每个步骤（计划包含粒度适中的步骤）
3. 在任务添加任何新的源代码路径之前，重新陈述计划中的
   `Change Necessity`；如果计划未能将其传递下来，则创建一个简洁版本。计划获批本身并不能证明新增 helper、小型 guard、新分支、fallback、adapter 或 owner 是必要的。

   ```text
   Change Necessity:
   - User-visible need:
   - No-change / non-code option:
   - Why code change is necessary:
   - Minimum change boundary:
   - Decision: no-change | docs/config-only | code-change | needs-clarification
   ```

   如果决定不是 `code-change`，暂停执行并返回计划审查，而不是进行编辑。如果决定是 `code-change`，则将最小边界带入编辑和验证范围。
4. 在进行任何非平凡的源代码编辑之前，运行计划中的
   `Pre-Edit Complexity Check`，或创建一个简洁版本：

   使用 `using-aegis/references/complexity-governance.md` 了解共享 artifact
   类别、压力信号和 `over-budget` 处理。

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

   如果检查结果与计划的文件边界相矛盾，暂停并返回计划审查，而不是悄悄将逻辑塞入已过载的 owner。如果预算结果是 `over-budget`，且任务没有同时对该超支进行治理，则停止执行并返回计划审查，而不是假装任务仍然是原子任务并继续推进。
   当目标编辑文件超出预算或用途混杂时，默认不得在原处添加
   `new-responsibility`。只有在不添加新职责且验证边界明确的情况下，
   `wiring-only`、`move-out / extract-first` 和
   `local-fix-without-new-responsibility` 才可以继续。`emergency / compatibility patch` 需要残余风险和退役触发条件。
5. 按指定要求运行验证
6. 协调者是 Git 变更的负责人。在连贯的任务通过其计划中的验证后，在默认本地提交前使用 `verification-before-completion`，只暂存任务所属路径，并读回 `HEAD`、已提交的文件列表和剩余任务差异。`no commit`、只读、无变更和验证失败的任务不创建正常提交。
7. 在将任务标记为已完成之前，更新 `TodoCheckpointDraft` 和 `DriftCheckDraft`。当存在 `Execution Readiness View` 时，偏移检查必须明确将活跃切片与该视图的意图锁定、范围围栏、基线锁定、兼容性边界、退役边界、测试义务和审查门槛进行比较。
8. 将其标记为 completed

### 步骤 3：完成开发

所有任务完成并验证后：

- 如果 Aegis 创建了分支/工作树，或用户要求处理集成，
  使用 `aegis:finishing-a-development-branch`；
- 否则使用 `verification-before-completion`，报告本地任务提交，
  以及 `Task clean` / `Repository clean`，不要臆造合并/PR 流程。

## 何时停止并寻求帮助

**在以下情况下立即停止执行：**
- 遇到阻塞问题（缺少依赖、测试失败、指令不明确）
- 计划存在导致无法开始执行的关键缺陷
- 你不理解某条指令
- 验证反复失败

**应请求澄清，而不是猜测。**

## 何时重新审视前面的步骤

**在以下情况下返回审查（步骤 1）：**
- Partner 根据你的反馈更新了计划
- 基本方案需要重新思考

**不要强行解决阻塞问题**——停止并请求帮助。

## 记住
- 首先批判性地审查计划
- 严格按照计划步骤执行
- 不要跳过验证
- 计划要求时引用相应技能
- 遇到阻塞时停止，不要猜测
- 不要仅仅因为当前分支是 `main`/`master` 就创建分支
- 不要仅仅因为任务复杂度、TDD、规划或子代理而触发工作树

## 集成

**必需的工作流技能：**
- **aegis:writing-plans** - 创建此技能要执行的计划
- **aegis:using-git-worktrees** - 仅当已批准的 Git 生命周期表明需要并发检出时使用
- **aegis:finishing-a-development-branch** - 仅当分支/工作树集成或清理属于范围时使用