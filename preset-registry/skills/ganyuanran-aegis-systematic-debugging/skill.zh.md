---
name: systematic-debugging
description: "Use when encountering a bug, test failure, or unexpected behavior, before proposing fixes"
---
# 执行

Bug、故障或意外行为：

1. **隔离** — 阅读错误信息、重现问题、检查差异，并沿诊断层级向上深入：
   L1 症状 → L2 逻辑 → L3 系统 → L4 架构 → L5 跨系统
   契约 → L6 平台 → L7 规范缺口。层级表示观察高度，而非单一因果链；在停止的高度，
   必须先明确分类因果形态，然后才能提出根因结论。只有当因果证明能够解释复现生成器，或达到 T 类边界时，才能停止。
2. **识别负责人** — 对比正常行为，追踪异常值，定位规范负责人，并将重复负责人视为一项发现。
3. **编辑前决策** — 当涉及共享逻辑、契约、回退、适配器、生产者/消费者接缝或事实来源边界时，在修复前运行 Patch-Shape Triage 和 Ripple Signal Triage。对于任何新的源代码路径或非平凡源代码编辑，明确 Change Necessity。对于新的分支、回退、适配器、负责人或兼容性路径，运行 Minimality Check；对于过载的负责人或复杂度增长，运行 Pre-Edit Complexity Check。在 Change Necessity 选择 `code-change` 后、第一次修复编辑前，为该修复切片负责 TDD Route：`off` 跳过自动 TDD；只要出现行为、bugfix、共享/核心、契约、持久化、权限、迁移、生产者/消费者或有意义的回归信号，`auto` 就选择 `strict`。`light` 要求同时满足每一项微小/低风险/单一负责人/不改变行为的条件；缺少明确的用户 TDD 措辞绝不能作为自动选择 `light` 的依据。
4. **证明** — 使用最小的重现或验证来测试一个假设。只有在记录的 `TDD Route: strict` 下才要求先有失败测试；使用 `TDD Mode: off` 时，不要要求失败测试或 RED/GREEN 循环。三次修复失败意味着停止并质疑架构。
5. **修复并闭环** — 在规范负责人处进行最小修复，按照风险相称的程度进行验证，审查架构，并同时结束修复轨道和退役轨道。如果仍有任何症状，停止并单独诊断。

完成条件：置信度 ≥ B，因果状态与复现证据或外部终点相符，轨道明确，无 H 信号，并且所需的 D 证据通过。

## 核心不变量

在规范负责人处找到根因并修复该 bug 类别。最小修复并不是文本差异最小；而是负责人层面充分修复所需的最小改动。

## 快速 bug 通道

对于没有 patch-shape 信号的低风险、可重现、单一负责人的 bug，保持回读简洁：`Symptom`、`Reproduction`、`Root Cause`、`Change
Necessity`、`Fix Boundary` 和 `Verification`。只有在因果证明负责人的 `Quick Exit Proof` 通过时，才能跳过因果卡片。
快速 bug 通道必须在源代码编辑前明确 Change Necessity。一句话可以涵盖用户可见需求、无变更/非代码选项、为什么必须修改代码、最小边界，以及一个明确的决策标记，例如
`Decision: code-change`。如果出现共享逻辑、契约、回退、重复负责人、消费者修补或跨模块行为，则退出此通道。

`Aegis Visibility`用于命名证据/负责人/补丁形态/验证效果。
将根本原因、避免的错误修复、边界、证据、复杂度和风险传递给
`verification-before-completion`；无需单独的回执。

## 修复前先诊断

1. 阅读完整的错误信息/堆栈，并记录输入、环境、版本和成功标准。
2. 稳定地复现问题。如果复现不稳定，则**仅当证据表明复现具有间歇性或依赖时序时**阅读
   `feedback-loop-construction.md`，并构建一个有界的自动化循环。
3. 检查近期变更，并与一个正常工作的示例进行比较。代码就是证据；如果权威来源、术语表、代码和测试彼此不一致，则组合使用
   `establishing-project-context`，而不是悄悄重新定义术语。
4. 为组件边界添加埋点，然后沿着错误值追溯其来源。
   **仅当观察到的错误值在其来源之后经过了多个调用或组件时**阅读
   `root-cause-tracing.md`。
5. 提出一个假设，并用单变量证据证伪它。不要堆叠推测性的修复。每轮结束时都使用
   `Goal | DeeperCause | Evidence |
   Risk/Unknown | Decision`。

### 规范负责人和补丁形态门槛

在编辑之前，除非证据证明本地位置是规范负责人，否则当候选项出现以下任一信号时，应继续向上追查：

- 关键字、短语、正则表达式、否定词列表或示例文本例外；
- 本地保护逻辑、额外条件、`try`/`catch`、提前返回或一次性分支；
- 回退逻辑、适配器、兼容性分支、提示词分支或遗留路径扩展；
- 消费者/调用方/就绪状态/展示层补丁；
- 下游逻辑重新解析原始文本，或在类型化意图、规范化状态、契约或其他事实来源已存在的情况下重新推断操作/状态；
- 没有生产者/负责人证据的制品/下载/导出/回读/缓存补丁。

```text
PatchShape:
CanonicalOwner:
UpwardDrillSignal:
Decision: fix owner | continue investigation | escalate
```

本地测试通过并不能消除分诊。在计划外修复之前，应比较不变量、负责人、补丁形态和拓扑；重命名后的载体并不代表新的方向。

如果诊断跨越 L3、触发补丁形态信号、用户质疑根本原因声明、先前的修复遗留了症状、复合/根拓扑具有合理可能性、同一事件存在两个或更多有锚点的表现、不同发生场景的复现条件出现分歧，或者尚未排除上游生产者/配置/默认值/契约/规范，则在**声称根本原因之前**阅读
`root-cause-claim-contract.md`。它是 Pre-Claim Gate、因果闭环/证伪证明、层级上限证明和 Causal Topology Gate 的唯一负责人。

### 变更必要性

此决策由行为触发，而非由提示词触发。它适用于任何新的源代码路径。在新增该路径或进行非平凡的源代码编辑之前，应明确：

```text
Change Necessity:
- User-visible need:
- No-change / non-code option:
- Why code change is necessary:
- Minimum change boundary:
- Decision: no-change | docs/config-only | code-change | needs-clarification
```

`no-change` 阻止源代码编辑；`docs/config-only` 缩小编辑范围；
`needs-clarification` 暂停操作；`code-change` 将最小边界带入修复和验证阶段。

### 最小化与所有者适配性

对于任何拟议的分支、回退、适配器、兼容性路径或新所有者：

```text
Minimality Check:
- Existing owner / reuse path:
- Correct owner and bug class:
- New path and existence proof:
- Old path retired or scheduled:
- Verdict: sufficient repair | local patch | needs first-principles review
```

`local patch` 需要保留理由和退役触发条件。对于新的非普通修复面，在
`docs/current/AEGIS_MINIMALITY_REFERENCE.md` 中执行 `Existence Check`。如果退役涉及旧代码、
外部兼容性或持久状态风险，则组合使用
`anti-entropy-governance`；它会选择退役路径，但绝不会授予破坏性权限。

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

使用 `using-aegis/references/complexity-governance.md` 获取压力信号。
默认情况下，不要在原位置添加 `new-responsibility`。如果更安全的边界
会改变已批准的形态，则先更新计划/规范。

## 修复与按比例进行的验证

实施一个所有者修复；不要顺便捆绑任何“既然在这里就一起做”的工作。在严格 TDD 下，先创建
最小的失败测试。关闭 TDD 时，复现是诊断证据，而不是 RED 门槛，也不是生产编辑的
前置条件。

验证必须与风险相匹配：

- 本地单一所有者修复：原始复现加上聚焦的回归测试；
- 共享/契约/跨模块修复：规范所有者，加上受影响的消费者
  和兼容性边界；
- 回退/所有者退役：主路径、残留引用、负向和
  边界检查；
- 时序/并发修复：**仅当证据确认轮询、休眠或竞态时序属于原因的一部分时**，才读取
  `condition-based-waiting.md`；
- 穿越多个可信边界的无效状态：**仅在根本修复已知，且证据表明需要第二个独立验证边界之后**，
  才读取 `defense-in-depth.md`。

对于失败的/持久性的/发散的修复或三次失败；对于不明确或存在争议的停止 /
Layer Stop Card / 干预；或对于看似合理的复合根因，**在进行另一次修复之前**读取
`advanced-debugging-governance.md`。收尾触发条件：
修复新增补丁形态；多位置/单回归；
仍存在的模式/异常/重复项/错误所有者/下游修复；
未检查的同症状修复；开放的复发/不受支持的根因状态；
缺失复合拓扑特定成员/反伪装证明；
仓库外权限；未迁移的
已发布契约破坏；未定义的规范；缺失权限/信息。它们会路由至 H/T/D；
细节不是因果证明。

对于配置了工作区支持的非简单调试：

```bash
python <aegis-workspace-helper> init --root <target-project-root>
python <aegis-workspace-helper> new-work --root <target-project-root> ...
python <aegis-workspace-helper> add-evidence --root <target-project-root> --work <YYYY-MM-DD-slug> ...
python <aegis-workspace-helper> check --root <target-project-root>
```

快速修复或快速修复的压力不能跳过这一步：如果 Ripple Signal
Triage 被触发，请在编辑前记录，并核实规范所有者以及受影响的下游路径。记录仅供参考，不能作为完成依据。

## 闭环

始终报告：

- **修复** — 原因、所有者、最小改动、兼容性、验证。
- **退役** — 旧路径状态、保留原因/触发条件、移除检查。

确认复现、同模式处理、权威性、复杂度和退役情况。置信度：A = 直接回归证据；B = 有限未知条件下的强证据；C = 部分解决且尚未解决。

`Trace Digest` 可以总结审计证据；绝不能暴露思维链，或替代根因、规则效果和验证证据。