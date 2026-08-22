---
name: systematic-debugging
description: "Use when encountering a bug, test failure, or unexpected behavior, before proposing fixes"
---
# 执行

错误、失败或意外行为：

1. **隔离** — 阅读错误信息、复现问题、检查差异，并逐层向上深入诊断层级：
   L1 症状 → L2 逻辑 → L3 系统 → L4 架构 → L5 跨系统
   契约 → L6 平台 → L7 规范缺口。各层级代表观察高度，
   并非一条因果链；在停止层级处，必须先明确归类因果形态，
   然后才能提出任何根因结论。只有当因果证明能够解释
   复发生成机制，或抵达 T 类边界时，才可停止。
2. **确定所有者** — 对比正常行为、追踪错误值、定位
   规范所有者，并将重复所有者视为一项发现。
3. **编辑前决策** — 当涉及共享逻辑、契约、回退机制、适配器、生产者/消费者接缝或事实来源
   边界时，在修复前执行补丁形态分诊和涟漪信号分诊。对于任何新的源代码
   路径或非平凡的源代码编辑，都要明确变更必要性。对于新的分支、
   回退机制、适配器、所有者或兼容路径，执行最小性检查；对于负担过重的所有者或复杂度增长，
   执行编辑前复杂度检查。
4. **证明** — 使用最小复现或
   验证来检验一个假设。仅当明确指定
   `TDD Route: strict` 时，才要求先有失败测试；当 `TDD Mode: off` 时，不要要求失败测试或
   RED/GREEN 循环。三次修复失败后，必须停止并质疑架构。
5. **修复并收尾** — 在规范所有者处进行最小修复，按照
   风险比例进行验证，审查架构，并同时完成修复轨道和
   退役轨道的收尾。如果仍有任何症状，停止并单独诊断。

完成条件：置信度 ≥ B，因果状态与复发证据或外部
终点相匹配，轨道明确，无 H 信号，并且所需的 D 证据通过。

## 核心不变量

找到根因，并在其规范所有者处修复该类错误。最小修复
不是文本差异最小的修复，而是所有者层面最小且充分的修复。

## 快速错误通道

对于低风险、可复现、单一所有者且没有补丁形态信号的错误，保持
回读简洁：`Symptom`、`Reproduction`、`Root Cause`、`Change
Necessity`、`Fix Boundary` 和 `Verification`。仅当
因果证明所有者的 `Quick Exit Proof` 通过时，才跳过因果卡片。
快速错误通道必须在编辑源代码前明确变更必要性。可以用一句话
涵盖用户可见的需求、不变更/非代码选项、代码必须
变更的原因、最小边界，以及显式决策令牌，例如
`Decision: code-change`。如果出现共享逻辑、契约、回退机制、重复
所有者、消费者补丁或跨模块行为，则离开此通道。

`Aegis Visibility` 指证据/所有者/补丁形态/验证方面的影响。
将根因、避免的错误修复、边界、证据、复杂度和风险传递给
`verification-before-completion`；无需单独的回执。

## 修复前诊断

1. 阅读完整的错误信息/堆栈，并记录输入、环境、版本和
   成功标准。
2. 稳定地复现。如果复现不稳定，**仅当证据表明复现具有间歇性或
   依赖时序时**，阅读 `feedback-loop-construction.md`，并构建一个有界的自动化循环。
3. 检查近期变更，并与正常示例进行对比。代码就是证据；如果
   权威来源、术语表、代码和测试之间存在分歧，则组合使用
   `establishing-project-context`，而不是悄然重新定义术语。
4. 对组件边界进行插桩，然后向源头追踪错误值。
   **仅当观察到的错误值距离其来源已有数次
   调用或多个组件时**，阅读 `root-cause-tracing.md`。
5. 陈述一个假设，并使用单变量证据证伪它。不要叠加
   推测性修复。每轮循环均以 `Goal | DeeperCause | Evidence |
   Risk/Unknown | Decision` 结束。

### 规范所有者与补丁形态关卡

在编辑之前，当候选项属于以下任一信号时，应继续向上排查，除非有证据证明本地位置是规范所有者：

- 关键字、短语、正则表达式、否定词列表或示例文本例外；
- 本地守卫、额外条件、`try`/`catch`、提前返回或一次性分支；
- 回退、适配器、兼容性分支、提示词分支或旧路径扩展；
- 消费方/调用方/就绪状态/展示层补丁；
- 当类型化意图、规范化状态、契约或其他事实来源已经存在时，下游逻辑仍重新解析原始文本或重新推断动作/状态；
- 在没有生产方/所有者证据的情况下，对制品/下载/导出/回读/缓存进行补丁修复。

```text
PatchShape:
CanonicalOwner:
UpwardDrillSignal:
Decision: fix owner | continue investigation | escalate
```

本地测试通过并不能免除分诊。在进行计划外修复之前，应比较不变量、所有者、补丁形态和拓扑；重命名载体并不意味着出现了新的方向。

如果诊断跨越 L3、触发了补丁形态信号、用户对根因论断提出异议、先前的修复仍遗留症状、复合/根因拓扑具有合理可能性、同一事件存在两个或更多有锚点的表现、不同表现的复现条件存在差异，或者上游生产方/配置/默认值/契约/规范仍未被排除，请在**宣称根因之前**阅读 `root-cause-claim-contract.md`。它是声明前关卡、因果闭合/证伪证据、层级上限证据和因果拓扑关卡的唯一所有者。

### 变更必要性

此决策由行为触发，而非由提示词触发。它适用于任何新的源代码路径。在引入该路径或进行非简单源代码编辑之前，应明确：

```text
Change Necessity:
- User-visible need:
- No-change / non-code option:
- Why code change is necessary:
- Minimum change boundary:
- Decision: no-change | docs/config-only | code-change | needs-clarification
```

`no-change` 阻止源代码编辑；`docs/config-only` 缩小其范围；`needs-clarification` 暂停处理；`code-change` 将最小变更边界带入修复和验证阶段。

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

`local patch` 需要保留理由和退役触发条件。对于新的非普通修复表面，应运行 `docs/current/AEGIS_MINIMALITY_REFERENCE.md` 中的 `Existence Check`。如果退役涉及旧代码、外部兼容性或持久化状态风险，应组合使用 `anti-entropy-governance`；它负责选择退役路径，但绝不会授予破坏性操作权限。

在编辑负担过重或用途混杂的所有者之前：

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

使用 `using-aegis/references/complexity-governance.md` 判断压力信号。
默认不要就地添加 `new-responsibility`。如果更安全的边界
改变了已批准的形态，请先更新计划/规范。

## 修复与相称验证

只实施一项归属方修复；不要捆绑“顺手处理”的工作。在严格 TDD 下，先创建
最小的失败测试。关闭 TDD 时，复现属于诊断证据，
而不是 RED 门禁，也不是修改生产代码的前提条件。

验证必须与风险相匹配：

- 局部单一归属方修复：原始复现加聚焦回归测试；
- 共享/契约/跨模块修复：规范归属方、受影响的使用方
  以及兼容性边界；
- 回退方案/归属方退役：主路径、残留引用、负向测试和
  边界检查；
- 时序/并发修复：**仅当证据表明轮询、休眠或竞态时序是原因的一部分时**
  才阅读 `condition-based-waiting.md`；
- 无效状态跨越多个可信边界：**仅在根本修复已明确，且证据表明
  需要第二个独立验证边界后**
  才阅读 `defense-in-depth.md`。

在修复失败/
持续无效/出现分歧或已失败三次时；在停止条件不明确/有争议 /
出现层级停止卡 / 需要干预时；或存在合理的复合根因时，**在再次修复前**阅读 `advanced-debugging-governance.md`。收尾触发条件：
修复引入了新的补丁形态；多位置/单一回归测试；
仍存在模式/异常/重复/错误归属方/下游修复；
存在未经检查的同症状修复；复发状态未关闭/根因缺乏支撑；
缺少针对复合拓扑特定成员/反伪装的证明；
权威依据位于仓库之外；已发布契约的破坏尚未迁移；
规范未定义；缺少权限/信息。这些情况会路由至 H/T/D；
细节并非因果证明。

对于已配置工作区支持的非简单调试：

```bash
python <aegis-workspace-helper> init --root <target-project-root>
python <aegis-workspace-helper> new-work --root <target-project-root> ...
python <aegis-workspace-helper> add-evidence --root <target-project-root> --work <YYYY-MM-DD-slug> ...
python <aegis-workspace-helper> check --root <target-project-root>
```

快速错误修复或紧急错误修复的压力不能跳过此流程：如果涟漪信号
分流被触发，请在编辑前记录，并验证规范归属方及
受影响的下游路径。记录仅供参考，不是完成判定的权威依据。

## 收尾

始终报告：

- **修复** — 原因、归属方、最小变更、兼容性、验证。
- **退役** — 旧路径状态、保留原因/触发条件、移除检查。

确认复现、同模式处理、权威依据、复杂度和
退役情况。置信度：A = 直接回归证据；B = 有力证据
且未知项范围有限；C = 证据不完整且问题尚未解决。

`Trace Digest` 可以汇总审计证据；绝不要暴露思维链，也不要
用其替代根因、规则影响和验证证据。