---
name: test-driven-development
description: "Use when the user explicitly requests strict or test-first TDD, or when the current conversation already contains an explicit `TDD Route: strict` decision from another Aegis workflow."
---
# 执行

→ 在原生直接技能宿主上误触发？→ **除非用户明确要求使用 TDD，或对话中已包含 `TDD Route: strict`，否则立即退出。**
  在 `off` 模式下，不要仅凭一般性的错误修复、契约、共享模块或高风险代码措辞就启动 RED / GREEN / REFACTOR。
  将控制权交还给 `using-aegis`、`systematic-debugging`、`writing-plans`，或带验证的快速路径。
→ 正在 TDD 路由 `strict` 下实现功能或修复错误？→ **没有先出现失败的测试，就不能编写生产代码。**
  门禁：复杂度为中等/高？→ 先转入头脑风暴或编写计划。
  模式：默认的 `off` 会禁用自动 TDD，但不会禁用完成验证；`auto` 会根据风险选择严格、轻量或跳过。
  变更必要性：在严格模式的 RED/GREEN 进入生产代码编辑之前，确认该工作切片确实需要修改代码。
  循环：RED（编写测试 → 观察其失败）→ GREEN（编写最少量代码 → 观察其通过）→ REFACTOR（清理代码 → 保持测试通过）
  回归：共享模块 → 相关测试。契约变更 → 生产者 + 消费者。核心逻辑 → 旧测试 + 新测试。
  命中涟漪信号 → 在宣称测试通过之前，覆盖生产者和消费者或真实用户路径。
  GREEN 仅能证明当前已表达的行为切片。
  GREEN 本身并不能证明父任务的验收条件已满足、业务价值已实现或工作最终完成。
→ 完成条件：已记录所选的 TDD 路由，严格路由的测试已通过，适用时已通过 TDD 预检门禁，对非简单源代码编辑已在编辑前检查复杂度风险，并且 `verification-before-completion` 已获得最新证据。

# 测试驱动开发（TDD）

## 概述

在 `TDD Route: strict` 下，先编写测试。观察其失败。编写最少量的
代码使其通过。

如果你没有观察到测试失败，就无法知道它是否测试了正确的内容。

TDD 模式有两个值：`off` 和 `auto`。默认的 `off` 模式会禁用
自动 TDD 路由，但绝不会禁用 `verification-before-completion`。
`auto` 允许 Aegis 根据任务风险选择 `TDD Route`。

在原生直接技能宿主上，自动进入此技能必须以对话中的字面标记为依据，
例如 `TDD Route: strict`、`strict TDD`、`test-first`
或 `RED / GREEN / REFACTOR`，而不能以一般性的高风险实现措辞为依据。

## 使用时机

仅当存在以下明确的进入信号之一时，才能进入此技能：

- 用户明确要求使用严格 TDD、测试优先开发或 RED / GREEN / REFACTOR
- 当前对话中已包含由另一个 Aegis 工作流记录的 `TDD Route: strict`

进入此技能已有合理依据后，典型的严格路由任务形态包括：新功能、错误
修复、重构、行为或逻辑变更、接口/数据契约变更、跨模块或共享模块变更，
以及核心逻辑重构。

例外情况（请询问你的协作伙伴）：一次性原型、生成的代码、配置文件、纯文档清理、只读诊断、仅修改注释。

## TDD 模式与路由

编辑源代码之前，作出决定：

```text
Aegis Visibility:
- Why this TDD route is strict, light, or skipped:
- What RED/GREEN proves:
- What still needs verification:

TDD Route:
- Mode: auto | off
- Decision: strict | light | skipped
- Strict authority: explicit user/project request | recorded auto decision | not applicable
- Test posture: diagnostic reproduction | post-change regression | strict RED test
- Reason:
- Verification:
```

在 `auto` 模式下，对于行为、错误修复、契约、共享/核心、生产者 /
消费者、持久化、权限、迁移，或具有显著回归风险的工作，使用 `strict`。
对于风险极低的微小编辑，如果有明确的回读或命令检查方式，则使用 `light`。
对于只读、仅文档、生成内容、一次性、仅注释，或受环境限制而不适合
TDD 的工作，使用 `skipped`。

在 `off` 模式下，不要自动要求 TDD、创建严格路线，或仅根据风险
推断出严格路线。用户/项目明确提出的 TDD 要求仍然适用；高风险工作可能
仍然需要回归覆盖，并在作出任何完成声明前执行 `verification-before-completion`。
对于计划或执行审查，`Mode: off / Decision: skipped` 是正常的
记录，除非用户/项目明确提出的严格要求覆盖它。该记录
不会加载此技能，也不会将诊断性复现转化为 RED。
已批准的计划本身并不提供严格路线的授权。
如果此技能在没有明确 TDD 请求或可见的
`TDD Route: strict` 标记的情况下仍被加载，请退出，而不是仅根据风险相关措辞
临时推断出自动严格路线。

让 `Aegis Visibility` 针对具体任务：说明路线决策和
回归边界，而不是笼统声称使用了 TDD。

## 前置检查门槛

TDD 是针对已批准行为或原子任务的实现纪律。
它不能替代任务路由、产品澄清或规划。

在编写测试或生产代码之前，如果当前请求具有以下任何中等或高复杂度信号，
请停止并将其路由到 brainstorming 或
writing-plans：

- 涉及多个文件、模块、页面、屏幕、服务或负责人
- 涉及用户可见的流程，例如导航、引导、结账、生命周期或
  恢复路径
- 涉及状态转换、路由规则、API 或数据契约、兼容性
  边界、迁移、权限或持久化
- 存在多个验收路径，或需要手动/视觉验证
- 产品行为不明确、存在相互冲突的约束，或需要长时间执行

对于这些任务，在执行 TDD 之前，要求具备基线阅读集、计划和原子任务。
高复杂度或存在歧义的任务还需要在规划前进行规格/设计审查。
只有对于意图、负责人、兼容性边界、验证路径以及切片目标/成功
证据均已明确的低复杂度工作，才可直接进行 TDD。

## 变更必要性

在严格的 RED/GREEN 进入生产代码编辑之前，明确呈现代码变更
决策。任何新的源代码路径都需要在 RED/GREEN 将其常态化为待实现工作之前
进行此项检查。这是“代码究竟是否应该变更？”
检查；它不是新的产物，也不属于 `using-aegis` 热路径。

这由行为触发，而不是由提示词触发。如果严格 TDD 即将添加
任何新的源代码路径或开始编辑生产源代码，即使用户没有要求，也要给出自然的
回读。极小的辅助函数、小型守卫、新分支、回退逻辑、适配器或负责人都不能例外。
示例：“代码必要性检查：非代码路径不足以解决问题，因为 <reason>；
最小变更边界为 <owner/files>，因此决策是变更代码。”

```text
变更必要性：
- 用户可感知的需求：
- 无需变更 / 非代码选项：
- 为何必须修改代码：
- 最小变更边界：
- 决策：no-change | docs/config-only | code-change | needs-clarification
```

如果决策为 `no-change`，不要为无需变更的事项编写测试或生产代码。如果决策为 `docs/config-only`，则转向这一更窄的范围并对其进行验证。如果决策为 `needs-clarification`，则在 RED/GREEN 之前暂停。如果决策为 `code-change`，则将最小边界贯彻到 `TDD Route`、RED 和回归范围中。

## 复杂度预算

在对非简单工作执行严格 TDD 之前，记录计划的复杂度预算，以免 RED/GREEN 在不知不觉中将错误或负担过重的所有者合理化。

```text
复杂度预算：
- 工件类别：
- 当前压力：
- 变更后预计压力：
- 计划的治理措施：
```

有关共享工件类别、压力信号和计划治理措施的含义，请参阅 `using-aegis/references/complexity-governance.md`。

## 编辑前复杂度检查

在编辑生产代码之前，检查预期的源代码编辑是否会向负担过重或错误的所有者添加逻辑。对于微小编辑，可以将此检查简化为一行。

有关共享压力信号和 `over-budget` 的含义，请参阅 `using-aegis/references/complexity-governance.md`。

```text
编辑前复杂度检查：
- 目标编辑文件：
- 现有压力信号：
- 所有者适配性：
- 更安全的编辑边界：
- 决策：edit-in-place | extract helper | add owner file | split task | pause for plan update

编辑前所有者适配性决策：
- 编辑意图：wiring-only | move-out / extract-first | local-fix-without-new-responsibility | new-responsibility | emergency / compatibility patch
- 所有者适配性：
- 更安全的编辑边界：
- 决策：edit-in-place | extract helper | add owner file | split task | pause for plan update
```

如果决策为 `pause for plan update`，请停止 TDD，并携带相关证据返回 `writing-plans` 或 `brainstorming`。

如果预测结果表明，此切片会使某个维护中的工件超出预算，而该切片本身并未同时治理这一超支问题，则不要像任务范围安全一样继续执行 RED/GREEN。请暂停并更新计划。

当目标编辑文件已超出预算或用途混杂时，请在编辑生产源代码之前对编辑意图进行分类。默认情况下，不得直接在原处添加 `new-responsibility`。只有在不增加新职责且验证边界清晰时，才可以继续执行 `wiring-only`、`move-out / extract-first` 和 `local-fix-without-new-responsibility`。`emergency / compatibility patch` 需要记录剩余风险和退出触发条件。

当中等或高复杂度任务需要项目记录时，请按需使用已配置的 Aegis 工作区支持。如果已安装 Aegis 工作区辅助工具，优先使用它（`python <aegis-workspace-helper> init --root <target-project-root>`）。如果任务需要在 `work/` 下保留过程记录，优先使用 `python <aegis-workspace-helper> new-work --root <target-project-root> ...`，以便对意图、检查点、偏移和证据路径建立索引，并使其结构可检查：

```text
docs/aegis/
  README.md
  INDEX.md
  BASELINE-GOVERNANCE.md
  adr/
  baseline/
  specs/
  plans/
  work/YYYY-MM-DD-<task-slug>/
    10-intent.md
    20-checkpoint.md
    90-evidence.md
    99-reflection.md
```

除非工作流需要这些内容，且现有项目中没有既定权威来源负责它们，否则不要将可复用的项目事实、决策、规范或计划提升到这些目录中。

## 红-绿-重构

### RED - 编写失败测试

明确：输入 | 输出 | 边界 | 验收标准。首先检查现有测试覆盖情况。编写一个最小测试，展示预期行为。
最小测试用于锚定下一个行为切片；除非父级验收标准已经完全明确，否则它本身并不能定义整个任务的完整性。

<Good>
```typescript
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
```
名称清晰，测试真实行为，一次只测试一件事
</Good>

<Bad>
```typescript
test('retry works', async () => {
  const mock = jest.fn()
    .mockRejectedValueOnce(new Error())
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce('success');
  await retryOperation(mock);
  expect(mock).toHaveBeenCalledTimes(3);
});
```
名称含糊，测试的是模拟对象而非代码
</Bad>

**要求：**
- 一个行为
- 名称清晰
- 使用真实代码（除非无法避免，否则不要使用模拟对象）
- 如果新功能会改变用户可观察到的行为，在编写更细粒度的单元测试之前，优先为主路径编写一个最小的端到端测试或集成测试
- 对于用户可见的工作，在认为单元测试已经足够之前，应覆盖主要用户旅程以及风险最高的体验下限或运维下限
- 为核心规则、边界条件和错误分支添加单元测试

### 验证 RED - 观察测试失败

**强制要求。绝不能跳过。**

```bash
npm test path/to/test.test.ts
```

确认：
- 测试失败（而不是发生错误）
- 失败消息符合预期
- 失败是因为功能缺失（而不是拼写错误）

**测试通过？** 你测试的是现有行为。修正测试。

**测试发生错误？** 修正错误，重新运行，直到测试按预期失败。

### GREEN - 最小代码

编写能让测试通过的最简单代码。

<Good>
```typescript
async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === 2) throw e;
    }
  }
  throw new Error('unreachable');
}
```
刚好足以通过测试
</Good>

<Bad>
```typescript
async function retryOperation<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number) => void;
  }
): Promise<T> {
  // YAGNI
}
```
过度设计
</Bad>

不要添加功能、重构其他代码，也不要进行超出测试要求的“改进”。

修复该行为真正的负责方。除非调试或设计工作流明确了为什么有必要添加新的回退机制、适配器或分支，以及将淘汰哪条旧路径，否则不要添加它们。

### 验证 GREEN - 看着它通过

**强制要求。**

```bash
npm test path/to/test.test.ts
```

确认：
- 测试通过
- 其他测试仍然通过
- 输出干净（无错误、无警告）

**测试失败？** 修复代码，而不是测试。

**其他测试失败？** 立即修复。

### REFACTOR - 清理代码

仅在变绿后：
- 消除重复
- 改进命名
- 提取辅助函数

保持测试为绿色。不要添加行为。

### 重复

为下一个功能编写下一个失败的测试。

## 回归范围

至少运行刚刚修改或添加的目标测试。根据影响扩大回归范围：

- 共享模块变更 -> 相关模块测试
- 接口或数据契约变更 -> 生产者和消费者测试
- 跨模块行为变更 -> 集成或端到端路径
- 核心逻辑重构 -> 旧行为回归测试加新行为测试
- 触发连锁影响信号分诊 -> 生产者和消费者测试，或能够证明下游影响仍然受控的真实用户路径

如果当前环境无法运行自动化测试，请说明阻碍因素，并提供可复现的手动验证步骤。

## 好的测试

| 质量 | 好 | 差 |
|---------|------|-----|
| **最小化** | 只测试一件事。名称中有“和”？拆分它。 | `test('validates email and domain and whitespace')` |
| **清晰** | 名称描述行为 | `test('test1')` |
| **体现意图** | 展示期望的 API | 掩盖代码应该做什么 |

## 严格路线的危险信号 - 停止并重新开始

这些危险信号仅适用于此技能已通过 `TDD Route: strict` 有效进入严格路线之后。不要将它们套用到路线为 `light` 或 `skipped` 的调试或回归工作上。

- 先写代码，后写测试
- 实现之后才写测试
- 测试立即通过
- 无法解释测试为何失败
- “稍后”再添加测试
- 辩解“就这一次”
- “我已经手动测试过了”
- “事后补测试也能达到同样的目的”
- “重要的是精神，而不是仪式”
- “保留作为参考”或“改造现有代码”
- “已经花了 X 个小时，删除太浪费了”
- “TDD 太教条了，我是在务实处理”
- “这次情况不同，因为……”

**所有这些都意味着：删除代码。使用 TDD 重新开始。**

## 示例：修复错误

**错误：** 接受了空电子邮件地址

**RED**
```typescript
test('rejects empty email', async () => {
  const result = await submitForm({ email: '' });
  expect(result.error).toBe('Email required');
});
```

**验证 RED**
```bash
$ npm test
FAIL: expected 'Email required', got undefined
```

**GREEN**
```typescript
function submitForm(data: FormData) {
  if (!data.email?.trim()) {
    return { error: 'Email required' };
  }
  // ...
}
```

**验证 GREEN**
```bash
$ npm test
PASS
```

**REFACTOR**
如果需要，为多个字段提取验证逻辑。

## 严格路线验证清单

- [ ] 已定义输入、输出、边界、兼容性和验收标准
- [ ] 每个新函数/方法都有一个先失败的测试
- [ ] 所有测试均通过，输出干净
- [ ] 回归：共享组件、契约或核心逻辑变更已运行相关测试
- [ ] 命中连锁影响信号：已覆盖下游路径或真实用户路径
- [ ] 如果自动化受阻 → 已记录阻碍因素和手动步骤
- [ ] GREEN 仅被视为局部行为证明，而不是最终完成
- [ ] 如果存在 `TaskIntentDraft`、父级计划/规范或 `Slice Card`，则在任何完成声明之前明确已覆盖和未覆盖的范围

无法勾选所有复选框？重新开始。

## 探索性工作和紧急例外

仅允许将探索性技术验证用作一次性学习。技术验证结束后，
在正式实现之前，将已确认的行为转化为测试。

当延迟造成的危险大于 TDD 不完整的风险时，紧急热修复可以优先采用最小且安全的修复。
记录原因，严格控制变更范围，并在同一工作单元或最近的下一个工作单元中
补充缺失的回归测试。

## 遇到困难时

不知道如何测试 → 先编写期望的 API。测试过于复杂 → 简化设计。必须模拟所有内容 → 降低耦合。

## 调试集成

发现缺陷？从 `systematic-debugging` 开始：复现问题、追踪责任归属，并
选择能够支持诊断结论的最小验证方式。当记录的
`TDD Route: strict` 生效时，在编辑生产代码之前，必须将复现过程转化为失败测试。
如果 `TDD Mode: off` 且没有严格路线，则应根据修复需要采用诊断性复现和
有针对性的变更后回归测试；不要仅凭推断开始 RED / GREEN。