---
name: systematic-debugging
description: "Use when encountering a bug, test failure, or unexpected behavior, before proposing fixes"
---
# 执行

Bug、失败或意外行为：

1. **隔离** — 读取错误信息、复现问题、检查 diff，并逐层向上深入诊断层：
   L1 症状 → L2 逻辑 → L3 系统 → L4 架构 → L5 跨系统
   契约 → L6 平台 → L7 规范缺口。层级是观察高度，而非单一因果链；必须明确分类停止时所在高度的因果形态。只有在因果证明能够解释复现触发器，或抵达 T 类边界时，才能停止。
2. **确定负责人** — 对比正常工作的行为，追踪错误值，定位规范负责人，并将重复负责人视为一个问题。
3. **编辑前决策** — 当涉及共享逻辑、契约、回退、适配器、生产者/消费者接缝或权威数据边界时，在修复前运行 Patch-Shape Triage 和 Ripple Signal Triage。对于任何新的源代码路径或非平凡的源代码编辑，明确 Change Necessity。对于新的分支、回退、适配器、负责人或兼容路径，运行 Minimality Check；对于职责过载的负责人或复杂度增长，运行 Pre-Edit Complexity Check。在 Change Necessity 选择 `code-change` 后、首次修复编辑前，为修复切片负责 TDD Route：`off` 跳过自动 TDD；对于任何行为、bug 修复、共享/核心、契约、持久化、权限、迁移、生产者/消费者或有意义的回归信号，`auto` 选择 `strict`。只有满足所有微小/低风险/单一负责人/不改变行为的条件时，`light` 才成立；缺少明确的用户 TDD 表述绝不能作为自动选择 `light` 的依据。
4. **证明** — 用最小复现或验证测试一个假设。只有记录的 `TDD Route: strict` 才要求先有失败测试；使用 `TDD Mode: off` 时，不要求失败测试或 RED/GREEN 循环。三次修复失败后必须停止，并质疑架构。
5. **修复并收尾** — 在规范负责人处进行最小修复，按照风险程度进行验证，审查架构，并同时完成修复轨道和退役轨道。如果仍有任何症状，停止并单独诊断。

完成条件：置信度 ≥ B，因果状态与复现证据或外部终点相匹配，轨道明确，不存在 H 信号，并且所需的 D 证据通过。

## 核心不变量

在规范负责人处找到根因并修复 Bug 类别。最小修复不是文本 diff 最小的修复，而是负责人层面满足要求的最小修复。

## 快速 Bug 通道

对于没有补丁形态信号的低风险、可复现、单一负责人 Bug，保持简洁回读：`Symptom`、`Reproduction`、`Root Cause`、`Change Necessity`、`Fix Boundary` 和 `Verification`。只有在因果证明负责人的 `Quick Exit Proof` 通过时，才能跳过因果卡片。
快速 Bug 通道必须在源代码编辑前明确 Change Necessity。一句话可以涵盖用户可见需求、无需变更/非代码选项、必须修改代码的原因、最小边界，以及明确的决策令牌，例如 `Decision: code-change`。如果出现共享逻辑、契约、回退、重复负责人、消费者补丁或跨模块行为，必须离开此通道。

`Aegis Visibility`命名证据/所有者/补丁形态/验证效果。
将根因、避免的错误修复、边界、证据、复杂度和风险传递给
`verification-before-completion`；不要单独的回执。

## 修复前先诊断

1. 阅读完整的错误/堆栈，并记录输入、环境、版本和
   成功标准。
2. 稳定地重现问题。如果重现不稳定，仅当证据显示问题是间歇性或
   依赖时序时，才阅读
   `feedback-loop-construction.md`，并构建一个有界的自动化循环。
3. 检查近期变更，并与一个正常工作的示例进行比较。代码就是证据；如果
   权威来源、术语表、代码和测试彼此不一致，请组合使用
   `establishing-project-context`，不要悄悄重新定义术语。
4. 对组件边界进行插桩，然后沿着错误值追溯其来源。
   仅当观察到的错误值在其来源下游的多个调用或组件之后时，才阅读
   `root-cause-tracing.md`。
5. 陈述一个假设，并用单变量证据证伪它。不要堆叠推测性的修复。每个循环结束时都以
   `Goal | DeeperCause | Evidence |
   Risk/Unknown | Decision` 结束。

### 规范所有者和补丁形态门控

在编辑之前，除非证据证明局部位置是规范所有者，否则当候选项包含以下任一信号时，
继续向上追查：

- 关键字、短语、正则表达式、否定词列表或示例文本例外；
- 局部防护、额外条件、`try`/`catch`、提前返回或一次性分支；
- 回退、适配器、兼容性分支、提示分支或遗留路径扩展；
- 消费者/调用方/就绪状态/呈现层补丁；
- 下游逻辑重新解析原始文本，或在类型化意图、规范化状态、契约或其他事实来源
  已存在的情况下重新推断操作/状态；
- 没有生产者/所有者证据的构件/下载/导出/回读/缓存补丁。

```text
PatchShape:
CanonicalOwner:
UpwardDrillSignal:
Decision: fix owner | continue investigation | escalate
```

局部测试通过并不能消除分诊。在计划外修复之前，比较
不变量、所有者、补丁形态和拓扑；重命名后的载体不是新的方向。

当修复可能重新解释或废止现有语义、责任、契约或关系时，明确需要保留的行为、
风险最高的反例和重要未知项。对于每个已知的显式锚点或上游/下游引用，说明其角色
和处置方式：保留、重新绑定到规范所有者、说明理由后废止，或因冲突而拒绝。
将未解决的关系保留为未知；不要在下游重新推断它们。
先绑定角色，再绑定值，并废止无效的责任，而不是废止未经证实的载体能力。
标识符和选择器只是示例，并非触发条件。此有限提醒不是行为矩阵、
关系图、引用完整性证明，也不是穷举式发现声明。它不会新增构件、
TDD 风险信号或回归范围；现有的 TDD 路由所有者和已配置/默认模式仍然适用。

如果诊断跨越 L3、触发了补丁形态信号、用户质疑根因主张、先前的修复留下了症状、
复合/根拓扑具有合理可能性、同一事件存在两个或更多有锚点的表现、
不同发生场景的重现条件出现分歧，或上游生产者/配置/默认值/契约/规范仍未被排除，
请在**声称根因之前**阅读 `root-cause-claim-contract.md`。它是
Pre-Claim Gate、因果闭合/证伪证明、层级上限证明和因果拓扑门控的唯一所有者。

### 变更必要性

此决策由行为触发，而不是由提示触发。它适用于任何新的源代码路径。在创建该路径或进行非平凡的源代码编辑之前，先公开：

```text
Change Necessity:
- User-visible need:
- No-change / non-code option:
- Why code change is necessary:
- Minimum change boundary:
- Decision: no-change | docs/config-only | code-change | needs-clarification
```

`no-change` 会阻止源代码编辑；`docs/config-only` 会限制编辑范围；`needs-clarification` 会暂停操作；`code-change` 会将最小边界带入修复和验证阶段。

### 最小性与所有者适配

对于任何计划新增的分支、回退、适配器、兼容路径或所有者：

```text
Minimality Check:
- Existing owner / reuse path:
- Correct owner and bug class:
- New path and existence proof:
- Invalid responsibility retired or scheduled:
- Legitimate capability on the same carrier retained, if any:
- Verdict: sufficient repair | local patch | needs first-principles review
```

`local patch` 需要保留理由和退役触发条件。对于新的非普通修复面，按照 `docs/current/AEGIS_MINIMALITY_REFERENCE.md` 执行 `Existence Check`。如果退役涉及旧代码、外部兼容性或持久化状态风险，则组合使用 `anti-entropy-governance`；它负责选择退役路径，但绝不授予破坏性权限。

在编辑过载的或多用途的所有者之前：

```text
Pre-Edit Complexity Check:
- Target edit file:
- Existing pressure signal:
- Owner fit and safer boundary:
- Decision: edit-in-place | extract helper | add owner file | split task | pause for plan update

Pre-Edit Owner-Fit Decision:
- Edit intent: wiring-only | move-out / extract-first | local-fix-without-new-responsibility | new-responsibility | emergency / compatibility patch
- Owner fit and safer boundary:
- Decision: edit-in-place | extract helper | add owner file | split task | pause for plan update
```

使用 `using-aegis/references/complexity-governance.md` 识别压力信号。默认不要在原地新增 `new-responsibility`。如果更安全的边界会改变已批准的形态，先更新计划或规范。

### 修复与按比例验证

只实施一个所有者修复；不要顺便进行“附带”工作。在严格 TDD 下，先创建最小的失败测试。关闭 TDD 时，复现结果是诊断证据，而不是 RED 门槛，也不是生产代码编辑的前置条件。

验证必须与风险相匹配：

- 本地单一所有者修复：原始复现加上聚焦的回归测试；
- 共享、契约或跨模块修复：规范所有者，以及受影响的消费者和兼容性边界；
- 回退或所有者退役：主路径、残留引用、负向场景和边界检查；
- 时序或并发修复：**仅当证据表明轮询、休眠或竞争时序属于成因的一部分时**，才阅读 `condition-based-waiting.md`；
- 无效状态跨越多个受信边界：**仅在已知根本修复，并且证据表明需要第二个独立验证边界之后**，才阅读 `defense-in-depth.md`。

在针对 failed/
persistent / divergent 修复或三次失败进行下一次修复之前；针对 unclear/disputed stop /
Layer Stop Card / intervention；或针对 plausible compound root，请先阅读
`advanced-debugging-governance.md`。Closeout 触发条件：
repair-added patch-shape；multi-site/one-regression；
remaining pattern/anomaly/duplicate/wrong-owner/downstream repair；
uninspected same-symptom fix；open recurrence/unsupported root status；
missing compound topology-specific member/anti-disguise proof；
outside-repo authority；unmigrated
published-contract break；undefined spec；missing permission/info。它们会路由至 H/T/D；
细节不是因果证明。

对于配置了 workspace 支持的非简单调试：

```bash
python <aegis-workspace-helper> init --root <target-project-root>
python <aegis-workspace-helper> new-work --root <target-project-root> ...
python <aegis-workspace-helper> add-evidence --root <target-project-root> --work <YYYY-MM-DD-slug> ...
python <aegis-workspace-helper> check --root <target-project-root>
```

失败的尝试使用 `<aegis-workspace-helper> add-attempt`；`add-evidence` 仅限终端使用。

快速 bug 修复或快速 bug 修复压力不会跳过此流程：如果 Ripple Signal
Triage 触发，请在编辑之前记录，并验证规范所有者以及受影响的下游路径。记录仅供参考，不是完成授权依据。

## 闭环

始终报告：

- **修复** — 原因、所有者、最小变更、兼容性、验证。
- **退役** — 无效的职责状态、载体/能力处置、保留原因/触发条件、移除检查。

确认复现、相同模式的处理、权威性、复杂度和退役状态。
置信度：A = 直接回归证据；B = 有边界未知项的强证据；C = 部分解决且尚未完成。

`Trace Digest` 可以总结审计证据；绝不能暴露思维链，或替代根因、规则作用和验证证据。