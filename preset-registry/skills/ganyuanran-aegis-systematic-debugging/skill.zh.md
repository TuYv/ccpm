---
name: systematic-debugging
description: "Use when encountering a bug, test failure, or unexpected behavior, before proposing fixes"
---
# 执行

Bug、故障或意外行为：

1. **隔离** — 阅读错误信息、复现问题、检查差异，并沿诊断层级逐层向上深入：
   L1 症状 → L2 逻辑 → L3 系统 → L4 架构 → L5 跨系统
   合约 → L6 平台 → L7 规范缺口。这些层级是观察高度，而不是单一的因果链；
   在停止的高度，必须先明确分类因果形态，然后才能声称找到了根因。只有当因果证明能够解释
   复现生成器，或到达 T-class 边界时，才可以停止。
2. **确定负责人** — 对比正常行为，追踪异常值，定位规范负责人，并将重复负责人视为一项发现。
3. **编辑前决策** — 当涉及共享逻辑、合约、回退、适配器、生产者/消费者接缝或
   真相来源边界时，在修复前运行 Patch-Shape Triage 和 Ripple Signal Triage。
   对任何新的源代码路径或非平凡源代码编辑，显式呈现 Change Necessity。
   对新的分支、回退、适配器、负责人或兼容性路径运行 Minimality Check，
   对过载的负责人或复杂度增长运行 Pre-Edit Complexity Check。在 Change Necessity
   选择 `code-change` 后、首次修复编辑前，为该修复切片负责 TDD Route：
   `off` 跳过自动 TDD；`auto` 在出现任何行为、bugfix、共享/核心、合约、持久化、
   权限、迁移、生产者/消费者或有意义的回归信号时选择 `strict`。
   `light` 要求同时满足每一项微小/低风险/单一负责人/不改变行为的条件；
   缺少明确的用户 TDD 表述绝不能作为自动选择 `light` 的证据。
4. **证明** — 使用最小的复现或验证来检验一个假设。只有记录了
   `TDD Route: strict` 时，才要求先有失败测试；在 `TDD Mode: off` 下，
   不要要求失败测试或 RED/GREEN 循环。三次修复失败意味着必须停止并质疑架构。
5. **修复并关闭** — 在规范负责人处进行最小修复，按照风险比例进行验证，审查架构，
   并同时关闭修复轨道和退役轨道。如果仍有任何症状，停止并单独诊断。

完成条件：置信度 ≥ B，因果状态与复现证据或外部终点一致，轨道明确，无 H 信号，并且所需的 D 证据通过。

## 核心不变量

在规范负责人处找到根因并修复该类 Bug。最小修复并不是文本差异最小的修复；而是负责人层面充分修复所需的最小改动。

## 快速 Bug 通道

对于低风险、可复现、单一负责人且没有补丁形态信号的 Bug，保持简洁的回读内容：
`Symptom`、`Reproduction`、`Root Cause`、`Change
Necessity`、`Fix Boundary` 和 `Verification`。只有在因果证明负责人的
`Quick Exit Proof` 通过时，才可以跳过因果卡片。
快速 Bug 通道必须在源代码编辑前呈现 Change Necessity。一句话可以涵盖用户可见的需求、
无需变更/非代码选项、为何必须修改代码、最小边界，以及明确的决策标记，例如
`Decision: code-change`。如果出现共享逻辑、合约、回退、重复负责人、消费者补丁或跨模块行为，
则离开此通道。

`Aegis Visibility`命名了证据/所有者/补丁形态/验证效果。
将根本原因、避免的错误修复、边界、证据、复杂度和风险传递给
`verification-before-completion`；无需单独的回执。

## 修复前先诊断

1. 读取完整的错误信息/堆栈，并记录输入、环境、版本和成功标准。
2. 稳定地复现问题。如果复现不稳定，仅当证据表明复现具有间歇性或依赖时序时，才读取
   `feedback-loop-construction.md`，并构建一个有界的自动化循环。
3. 检查近期变更，并与一个正常工作的示例进行比较。代码就是证据；如果权威来源、术语表、代码和测试之间存在分歧，请组合使用
   `establishing-project-context`，不要默默地重新定义术语。
4. 对组件边界进行插桩，然后沿着错误值回溯其来源。仅当观察到的错误值在其源头之后经过了多个调用或组件时，才读取
   `root-cause-tracing.md`。
5. 提出一个假设，并使用单变量证据证伪它。不要堆叠推测性的修复。每次循环都以
   `Goal | DeeperCause | Evidence |
   Risk/Unknown | Decision`结束。

### 规范所有者与补丁形态门禁

在编辑之前，除非证据证明本地位置是规范所有者，否则当候选项属于以下任一信号时，应继续向上追溯：

- 关键词、短语、正则表达式、否定词列表或示例文本例外；
- 本地保护逻辑、额外条件、`try`/`catch`、提前返回或一次性分支；
- 回退逻辑、适配器、兼容性分支、提示分支或遗留路径扩展；
- 消费者/调用方/就绪状态/展示层补丁；
- 下游逻辑重新解析原始文本，或在类型化意图、规范化状态、契约或其他事实来源已存在的情况下重新推断操作/状态；
- 没有生产者/所有者证据的制品/下载/导出/回读/缓存补丁。

```text
PatchShape:
CanonicalOwner:
UpwardDrillSignal:
Decision: fix owner | continue investigation | escalate
```

本地测试变绿并不能消除分诊。在进行计划外修复之前，比较不变量、所有者、补丁形态和拓扑；载体被重命名并不意味着出现了新的方向。

当修复会改变身份、选择器、优先级、作用域或角色绑定，并且一个值可能承担多个角色时，应在打补丁之前，明确需要保留的、有证据支持的行为、风险最高的反例以及重要的未知项。
先绑定角色，再绑定值；淘汰无效的职责，而不是分别以证据证明载体能力无效。这个有界的、由风险触发的提醒并不是通用行为矩阵，也不是穷尽式发现声明。它不会创建制品、添加 TDD 风险信号，也不会扩大回归范围。通过现有的路由所有者解析已配置/默认的 TDD 模式：`off` 会跳过自动 TDD，而 `auto` 仍会从上述现有信号中进行选择。

如果诊断跨越 L3、触发了补丁形态信号、用户质疑根因主张、先前的修复留下了症状、复合/根拓扑具有合理可能性、同一事件存在两个或更多有锚点的表现、不同发生场景的复现条件出现分歧，或者上游生产者/配置/默认值/契约/规范仍未被排除，请在**声称根本原因之前**读取
`root-cause-claim-contract.md`。它是 Pre-Claim Gate、因果闭合/证伪证明、层级上限证明以及 Causal Topology Gate 的唯一所有者。

### 变更必要性

此决策由行为触发，而非由提示触发。它适用于任何新的源代码路径。在该路径或进行非平凡的源代码编辑之前，先公开：

```text
Change Necessity:
- User-visible need:
- No-change / non-code option:
- Why code change is necessary:
- Minimum change boundary:
- Decision: no-change | docs/config-only | code-change | needs-clarification
```

`no-change` 会阻止源代码编辑；`docs/config-only` 会缩小编辑范围；
`needs-clarification` 会暂停；`code-change` 会将最小边界带入
修复和验证阶段。

### 最小性与所有者适配性

对于任何拟议的分支、回退、适配器、兼容性路径或新的所有者：

```text
Minimality Check:
- Existing owner / reuse path:
- Correct owner and bug class:
- New path and existence proof:
- Invalid responsibility retired or scheduled:
- Legitimate capability on the same carrier retained, if any:
- Verdict: sufficient repair | local patch | needs first-principles review
```

`local patch` 需要保留理由和退役触发条件。对于新的非普通修复面，在
`docs/current/AEGIS_MINIMALITY_REFERENCE.md` 中运行 `Existence Check`。如果退役涉及旧代码、
外部兼容性或持久状态风险，则组合使用
`anti-entropy-governance`；它负责选择退役路径，但绝不授予破坏性权限。

在编辑职责过载或用途混杂的所有者之前：

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

使用 `using-aegis/references/complexity-governance.md` 了解压力信号。
默认不要在原处添加 `new-responsibility`。如果更安全的边界改变了已批准的形态，
请先更新计划/规范。

## 修复与成比例的验证

实现一个所有者修复；不要顺带捆绑“既然如此”的工作。在严格 TDD 下，先创建
最小的失败测试。关闭 TDD 时，复现是诊断证据，而不是 RED 门槛，也不是生产编辑的前置条件。

验证必须与风险相匹配：

- 本地单一所有者修复：原始复现加上聚焦的回归测试；
- 共享/契约/跨模块修复：规范所有者，以及受影响的使用者和兼容性边界；
- 回退/所有者退役：主路径、遗留引用、负向检查和边界检查；
- 时序/并发修复：**仅当证据表明轮询、休眠或竞态时序属于成因的一部分时**，才阅读 `condition-based-waiting.md`；
- 无效状态跨越多个受信边界：**仅当根本修复已知，且证据表明需要第二个独立验证边界之后**，才阅读 `defense-in-depth.md`。

在再次修复失败、持续或偏离预期的修复，或连续三次失败之前，先阅读 `advanced-debugging-governance.md`；对于不明确或存在争议的停止条件、Layer Stop Card 或干预措施；或可能存在的复合根因，也应如此。收尾触发条件包括：修复引入了补丁形态问题；多处修改导致一次回归；仍存在模式/异常/重复项/错误责任方/下游修复；未检查的同症状修复；仍处于开放状态的复发/根因不受支持状态；缺少复合拓扑特定成员或反伪装证明；仓库外部的权威依据；已发布契约的破坏尚未迁移；规范未定义；缺少权限/信息。它们会转交 H/T/D；细节不是因果证明。

对于配置了工作区支持的非平凡调试：

```bash
python <aegis-workspace-helper> init --root <target-project-root>
python <aegis-workspace-helper> new-work --root <target-project-root> ...
python <aegis-workspace-helper> add-evidence --root <target-project-root> --work <YYYY-MM-DD-slug> ...
python <aegis-workspace-helper> check --root <target-project-root>
```

快速错误修复或快速修复压力不能跳过此流程：如果 Ripple Signal
Triage 被触发，请在编辑之前记录，并验证规范责任方以及受影响的下游路径。记录仅供参考，不具备完成授权。

## 收尾

始终报告：

- **修复** — 原因、责任方、最小变更、兼容性、验证。
- **退役** — 无效的责任状态、载体/能力处置、保留原因/触发条件、移除检查。

确认复现、同模式处理、权威依据、复杂性和退役情况。置信度：A = 直接回归证据；B = 具有边界明确未知因素的强证据；C = 部分证据且问题尚未解决。

`Trace Digest` 可以总结审计证据；绝不能暴露思维链，或替代根因、规则影响和验证证据。