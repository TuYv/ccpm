---
name: systematic-debugging
description: "Use when encountering a bug, test failure, or unexpected behavior, before proposing fixes"
---
# 执行

Bug、失败或意外行为：

1. **隔离** — 读取错误信息、复现问题、检查差异，并沿诊断层级向上深入：
   L1 症状 → L2 逻辑 → L3 系统 → L4 架构 → L5 跨系统
   契约 → L6 平台 → L7 规范缺口。这些层级是观察高度，而非单一因果链；在停止的高度明确分类因果形态。只有在因果证明能够解释复现生成器，或到达 T 类边界时才能停止。
2. **识别所有者** — 对比正常工作的行为，追踪异常值，定位规范所有者，并将重复所有者视为一项发现。
3. **编辑前决策** — 当涉及共享逻辑、契约、回退、适配器、生产者/消费者接缝或事实来源边界时，在修复前运行 Patch-Shape Triage 和 Ripple Signal Triage。对于任何新的源代码路径或非平凡源代码编辑，明确 Change Necessity。对于新的分支、回退、适配器、所有者或兼容性路径，运行 Minimality Check；对于过载的所有者或复杂度增长，运行 Pre-Edit Complexity Check。在 Change Necessity 选择 `code-change` 后、首次修复编辑前，按照 `test-driven-development` 为修复切片负责 TDD Route（默认 `off`；在行为、Bug 修复、共享逻辑、契约、持久化、权限或迁移风险场景下为 `strict`）。
4. **证明** — 使用最小的复现或验证测试一个假设。只有在已记录的 `TDD Route: strict` 时才要求先有失败测试；在 `TDD Mode: off` 时，不要求失败测试或 RED/GREEN 循环。三次修复失败后必须停止并质疑架构。
5. **修复并收尾** — 在规范所有者处进行最小修复，按风险比例进行验证，审查架构，并同时关闭修复轨道和退役轨道。如果仍有任何症状，停止并单独诊断。

完成条件：置信度 ≥ B，因果状态与复现证据或外部终端相匹配，轨道明确，无 H 信号，并且所需的 D 证据通过。

## 核心不变量

在规范所有者处找到根因并修复 Bug 类别。最小修复并不是文本差异最小，而是所有者层面足够的最小修复。

## 快速 Bug 通道

对于低风险、可复现、单一所有者且没有 patch-shape 信号的 Bug，保持简洁回读：`Symptom`、`Reproduction`、`Root Cause`、`Change Necessity`、`Fix Boundary` 和 `Verification`。只有在因果证明所有者的 `Quick Exit Proof` 通过时，才能跳过因果卡片。
快速 Bug 通道必须在源代码编辑前明确 Change Necessity。一句话可以涵盖用户可见需求、无需更改/非代码选项、代码必须更改的原因、最小边界，以及明确的决策标记，例如 `Decision: code-change`。如果出现共享逻辑、契约、回退、重复所有者、消费者修补或跨模块行为，则离开此通道。

`Aegis Visibility` 命名证据/所有者/补丁形态/验证影响。
将根因、避免的错误修复、边界、证据、复杂度和风险传递给
`verification-before-completion`；无需单独的回执。

## 修复前先诊断

1. 阅读完整的错误信息/堆栈，并记录输入、环境、版本和成功标准。
2. 稳定地复现问题。如果问题不稳定，**仅当证据表明复现具有间歇性或依赖时序时**，才阅读
   `feedback-loop-construction.md` 并构建有界循环。将复现缩减为承载问题的元素作为测试输入，但不要缩小修复范围：仍然要向上钻取；在正确的接缝处进行测试。
3. 检查近期变更，并与正常工作的示例进行比较。代码是证据；如果权威来源、术语表、代码和测试彼此不一致，应组合使用
   `establishing-project-context`，而不是默默地重新定义术语。
4. 对组件边界进行插桩，然后沿着错误值追溯其来源。**仅当观察到的错误值已位于其来源下游的多个调用或组件之后时**，才阅读
   `root-cause-tracing.md`。
5. 陈述一个假设，并用单变量证据证伪它。不要堆叠推测性的修复。每轮结束时都使用 `Goal | DeeperCause | Evidence |
   Risk/Unknown | Decision`。

### 规范归属者与补丁形态检查关卡

在编辑之前继续向上追溯，除非有证据证明局部位置是规范归属者，尤其当候选位置具有以下任一信号时：

- 关键词、短语、正则表达式、否定词列表或示例文本例外；
- 局部保护条件、额外条件、`try`/`catch`、提前返回或一次性分支；
- fallback、适配器、兼容性分支、提示分支或遗留路径扩展；
- 消费者/调用方/就绪状态/呈现层补丁；
- 下游逻辑重新解析原始文本，或在类型化意图、规范化状态、契约或其他事实来源已存在的情况下重新推断操作/状态；
- 没有生产者/归属者证据的制品/下载/导出/回读/缓存补丁。

```text
PatchShape:
CanonicalOwner:
UpwardDrillSignal:
Decision: fix owner | continue investigation | escalate
```

局部测试变绿并不能消除分诊要求；更名后的载体也不代表出现了新的方向。

当修复可能重新解释或废止现有语义、责任或关系时，明确需要保留的行为、风险最高的反例以及重要未知项。对于每个已知的显式锚点或上游/下游引用，说明其角色和处置方式：保留、重新绑定到规范归属者、说明理由后废止，或因冲突而拒绝。将未解决的关系保留为未知；不要在下游重新推断它们。先绑定角色，再绑定值；废止无效的责任，而不是废止未经证实的载体能力。此限定性提醒不是行为矩阵、关系图、引用完整性证明，也不声称已穷举发现所有内容。它不会新增制品、TDD 风险信号或回归范围；现有的 TDD 路由归属者以及已配置/默认模式仍然适用。

如果诊断跨越 L3、出现补丁形态信号、用户质疑根因声明、先前的修复仍遗留症状、复合/根拓扑具有合理可能性、同一事件存在两个或更多有锚定的表现、不同发生场景的复现条件出现分歧，或者上游生产者/配置/默认值/契约/规范仍未被排除，则在**声称根因之前**阅读
`root-cause-claim-contract.md`。它是 Pre-Claim Gate、因果闭合/证伪证明、层级上限证明以及 Causal Topology Gate 的唯一归属者。

### 变更必要性

此决策由行为触发，而不是由提示触发。它适用于任何新的源代码路径。在该路径或非平凡源代码编辑之前，公开 `Change Necessity` 决策（`no-change | docs/config-only | code-change | needs-clarification`）；字段详情位于 `advanced-debugging-governance.md`。

### 最小化与所有者适配性

对于任何提议的分支、回退、适配器、兼容性路径或新所有者，运行 `Minimality Check`（字段位于 `advanced-debugging-governance.md`），并给出 `sufficient repair | local patch | needs first-principles review` 判定，同时移除无效职责：`local patch` 需要保留理由和退役触发条件。对于新的非普通修复面，运行 `docs/current/AEGIS_MINIMALITY_REFERENCE.md` 中的 `Existence Check`。如果退役涉及旧代码、外部兼容性或持久状态风险，则编排 `anti-entropy-governance`；它选择退役路径，但绝不授予破坏性权限。

在编辑过载或混合用途的所有者之前，完成 `Pre-Edit Complexity Check` 和 `Pre-Edit Owner-Fit Decision`（模板位于 `advanced-debugging-governance.md`）。

使用 `using-aegis/references/complexity-governance.md` 识别压力信号。

默认不要原地添加 `new-responsibility`。如果更安全的边界会改变已批准的形态，先更新计划/规格。

## 修复与相称的验证

实施一个所有者修复；不要捆绑“顺便”工作。在严格 TDD 下，先创建最小的失败测试。关闭 TDD 时，复现是诊断证据，而不是 RED 门槛或生产编辑的前置条件。

验证必须匹配风险：

- 本地单一所有者修复：原始复现加聚焦回归测试；
- 共享/契约/跨模块修复：规范所有者、受影响的消费者以及兼容性边界；
- 回退/所有者退役：主路径、残留引用、负向和边界检查；
- 时序/并发修复：**仅当证据表明轮询、休眠或竞态时序属于原因的一部分时**，才阅读 `condition-based-waiting.md`；
- 穿越多个可信边界的无效状态：**仅在已知根修复且证据表明需要第二个独立验证边界之后**，才阅读 `defense-in-depth.md`。

对于失败/持久化/分歧修复或三次失败，先阅读 `advanced-debugging-governance.md`；对于不明确/有争议的停止 / Layer Stop Card / intervention；或看似合理的复合根因。收尾触发条件：repair-added patch-shape；multi-site/one-regression；remaining pattern/anomaly/duplicate/wrong-owner/downstream repair；uninspected same-symptom fix；open recurrence/unsupported root status；missing compound topology-specific member/anti-disguise proof；outside-repo authority；unmigrated published-contract break；undefined spec；missing permission/info。它们将问题路由到 H/T/D；详情不是因果证据。

对于配置了工作区支持的非平凡调试：

```bash
python <aegis-workspace-helper> init --root <target-project-root>
python <aegis-workspace-helper> new-work --root <target-project-root> ...
python <aegis-workspace-helper> add-evidence --root <target-project-root> --work <YYYY-MM-DD-slug> ...
python <aegis-workspace-helper> check --root <target-project-root>
```

失败的尝试使用 `<aegis-workspace-helper> add-attempt`；`add-evidence` 仅用于终结性记录。

快速错误修复或快速修复压力不会跳过此步骤：如果 Ripple Signal
Triage 被触发，请在编辑前记录，并核实规范所有者及受影响的下游路径。记录仅供参考，不能作为完成依据。

## 闭环

始终报告：

- **修复** — 原因、所有者、最小改动、兼容性、验证。
- **退役** — 无效的职责状态、承载者/能力处置、保留原因/触发条件、移除检查。

确认复现、相同模式的处理、权威归属、复杂度和退役状态。为调试日志添加前缀（例如 `[DEBUG-a4f2]`）；关闭前确认已通过一次 grep 完成移除检查。置信度：A = 直接回归证据；B = 存在边界明确的未知项，但证据充分；C = 部分完成且尚未解决。

`Trace Digest` 可以总结审计证据；绝不能暴露思维链，或替代根因、规则影响和验证证据。