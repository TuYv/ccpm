---
name: ln-41-test-strategy-planner
description: "Designs risk-based test portfolio decisions and prioritized scenarios without changing code. Use when requirements need a test strategy; not for auditing or implementing tests."
---
# 测试策略规划器

**目标：** 针对请求的范围设计一套只读、基于风险的测试组合决策。在防止缺乏独特缺陷信号的测试无止境增长的同时，最大限度地提升对重要局部行为的信心，并明确如何保留、修改、合并、退役或有意省略受影响的证据。

**执行契约：** 将以下按顺序排列的复选框工作流视为此技能的完成定义。将每个复选框标记为 `PENDING`，然后使用具体证据将其解决为 `PROVEN`，使用表明其条件触发器不存在的证据将其解决为 `CLEARED`，或解决为 `UNPROVEN`；阅读、提及、委派、跳过或工具失败都不构成证明。
返回前，解决每个 `PENDING`，仅将 `PROVEN` 和 `CLEARED` 项计为已完成，对每个 `UNPROVEN` 项应用此技能的结论、决策和审批规则，并在开头加上 **Checklist: X/Y complete**<br>**Incomplete: None | section/item — reason; outcome impact; exact next action**；列出每个 `UNPROVEN` 项。

## 工具路由

| 需求 | 首选工具 | 使用时机 | 备用方案 |
|---|---|---|---|
| 需求和仓库规则 | 原生文件读取加 Git | 确定范围、当前工作、验收标准和受支持的命令 | 用户提供的需求，且明确说明限制 |
| 现有测试面 | 文件列表、搜索、清单、运行器配置和 CI | 映射测试层级、fixture、环境和约定 | 仓库树和已知测试入口 |
| 行为和边界 | 语言服务器或宿主原生代码智能工具 | 跟踪入口、消费者、信任边界、持久化、队列和外部契约 | 缩小范围的搜索，然后直接检查 |
| 现有证据 | 仓库定义的安全测试和覆盖率命令 | 确定哪些行为已有证明，以及信心薄弱的位置 | 检查测试和 CI；标记执行不可用 |
| 当前外部故障模式 | 官方文档、规范、公告和一手现场证据 | 外部契约或真实用户故障能够改变场景或优先级时 | 将该声明标记为 `UNVERIFIED`；不要臆造风险 |

保持运行只读。不要创建测试、fixture、快照、任务或文档，也不要更新被审查的实现。

## 证据规则

- 对于重大的业务风险，优先选择通过用户可观察边界获得的确定性端到端证据。只有在存在独特边界或确定性依据时，才选择契约或集成证据；仅当更广泛的证明不够精确或不够有用时，才针对重大的隔离局部规则选择单元证据。
- 覆盖率是发现证据，而不是证明。必须要求一个能够针对指定缺陷失败的预言器。
- 根据影响、合理的故障可能性、独特性、可检测性和恢复成本确定优先级；不要将这些判断转换为通用的数值阈值。
- 只有当现有测试的设置和断言证明相同的行为和故障模式时，才能用其减少差距。
- 框架、语言、ORM、序列化器或库的行为不属于产品测试，除非本地配置或集成改变了其契约。
- 将组合操作与执行状态分开。决策使用 `KEEP`、`ADD`、`UPDATE`、`MERGE`、`DELETE` 或 `NO_TEST`，证据状态仅使用 `PASS`、`FAIL`、`BLOCKED` 或 `UNPROVEN`。
- `NO_TEST` 是明确的风险决策，而不是遗漏的工作。说明现有证明、替代控制措施或已接受的剩余风险。
- 持久化测试登记表是可选的。除非规模或治理要求维护其他工件，否则优先使用仓库原生的测试名称、路径、标签、CI 配置和任务输出。
- 外部研究只有在为此计划增加具体的故障模式、边界或预言器时，才具有可执行性。

## 检查清单

### 1. 确定范围和证据

- [ ] 明确功能、需求、验收标准、参与者、明确的非目标以及受保护的人类或系统结果；将请求的机制与其必须实现的结果区分开来；如果没有可供规划的具体行为，则返回 `BLOCKED`。
- [ ] 阅读适用的仓库说明并检查 Git 状态，以免将当前工作和无关变更误认为既有行为。
- [ ] 识别语言、框架、运行器、测试目录、固件、工厂、环境、CI 门禁、覆盖率、契约测试和手动测试面。
- [ ] 将现有证据以及受请求行为影响的每个测试映射到各项需求；根据实际判定依据，而不是测试名称或接近程度，将证明标记为 `PROVED`、`PARTIAL`、`MISSING` 或 `UNAVAILABLE`。
- [ ] 当手动、探索性、事件和生产证据揭示了自动化测试套件未覆盖的行为时，检查这些证据。
- [ ] 在提出场景之前，识别环境、数据、凭据、服务、设备、浏览器以及破坏性状态约束。
- [ ] 记录可能改变测试级别、优先级或可行性的假设和未知项；仅当不同解释会实质性改变策略时，才提出一个简洁的问题。

### 2. 构建风险图

- [ ] 从参与者触发开始，经过入口点、运行时连接和状态变更，追踪关键流程直到持久化结果或用户可见结果。
- [ ] 识别涉及金钱、身份验证、授权、所有权、数据完整性、破坏性操作、迁移、公共契约或不可逆工作流的、具有独特重要性的本地行为。
- [ ] 列举合理的缺陷类别：错误成功、拒绝有效输入、接受无效输入、边界错误、部分失败、重复交付、顺序问题、超时、重试、取消、竞态、回滚、恢复和兼容性偏移；说明会失去哪项受保护的结果，或会造成何种具体危害。
- [ ] 将产品风险与实现细节以及依赖项已经保证的行为区分开来；排除那些虽然技术上可以表示、但不会保护任何独特本地结果或决策的状态。
- [ ] 识别隐私敏感或受监管的测试数据，并要求使用合成、最小化或明确批准的固件。
- [ ] 仅当版本敏感的契约、反复出现的用户故障、滥用模式或互操作性风险可能改变风险图时，才使用当前的外部证据。
- [ ] 对风险进行定性排序，并解释并列或不确定性；不要在缺少频率或影响数据时臆造精确度。

### 3. 决定组合行动、级别和判定依据

- [ ] 为每项重大风险和受影响的测试各分配一个临时行动：当可信的独特证明仍然有效时使用 `KEEP`；对尚未证明的重大风险使用 `ADD`；当有价值的意图仍然存在，但依据、边界、设置或判定依据发生变化时使用 `UPDATE`；对可以安全合并的证明使用 `MERGE`；对过时、重复、琐碎或不可信的证明使用 `DELETE`；或者当其他控制措施或已接受的风险已经足够时使用 `NO_TEST`。
- [ ] 对于 `DELETE` 或 `MERGE`，证明测试依据已经过时，或指出能够保留所有仍需验证的重大行为、失败模式、判定依据和有用故障定位能力的替代证据；绝不要仅仅因为过时的证明已经存在就保留它。
- [ ] 对于隔离的本地规则选择单元测试；对于生产者与消费者之间的一致性选择契约测试；对于由系统拥有的边界选择集成测试；对于生产形态的旅程，如果其终端结果无法在更低层级得到证明，则选择端到端测试。
- [ ] 避免在每个级别重复验证同一行为，除非每个级别能够检测不同的故障类别。
- [ ] 为每个场景定义一个独立的判定依据：返回的契约、持久化状态、发出的事件、渲染行为、外部效果、不变量或确定性产物。
- [ ] 检查 mock 和 fake 是否绕过了该场景声称要证明的边界或失败语义。
- [ ] 对于 UI 或交互场景，要求使用稳定的、由仓库拥有的 ID 或专用测试钩子作为定位器；只有当可见文本或翻译后的文本、样式、布局、位置和偶然结构属于明确契约时，才可以断言它们；绝不能使用它们进行发现。
- [ ] 仅在风险图表明其具有实质性时，才纳入成功、无效、边界、授权、错误、恢复、并发和兼容性案例。
- [ ] 当默认值可能掩盖硬编码行为时，指定非默认配置、时间、区域设置、随机性、顺序或数据规模。
- [ ] 仅当受支持的契约或已知风险使其与决策相关时，才添加浏览器、设备、操作系统、运行时或版本单元格。
- [ ] 优先使用确定性的设置和有界数据；明确需要真实依赖项、模拟器、一次性环境或类生产拓扑的位置。
- [ ] 为每项组合行动定义仓库门禁或诊断角色、入口前置条件以及基于证据的完成标准；不要使用测试数量或原始覆盖率作为完成标准。

### 4. 制定经过优先级排序的测试矩阵

- [ ] 对于每个决策，在已知的情况下，注明测试依据、受保护结果、风险、现有证据或受影响的测试、组合操作、级别、设置、判定标准、预期证据、环境、门禁和结果状态。
- [ ] 为证据定义审查或退役触发条件，尤其是其价值取决于契约、迁移、兼容性窗口、变通方案、事件、依赖项或临时风险的证据；不要在没有负责依据的情况下臆造日期。
- [ ] 对场景排序，使安全关键检查和高信息量检查先于成本高昂的广度测试执行，同时保留前置条件和状态依赖关系。
- [ ] 明确哪些场景可以并行运行，哪些场景共享可变状态、速率限制、账户、设备或环境设置。
- [ ] 将发布门禁场景与较慢的诊断性或探索性覆盖分开，避免测试计划使常规交付变得不切实际。
- [ ] 明确列出排除项，包括没有独特受保护结果或缺陷信号的场景、低价值重复、框架行为、不可行的环境以及已接受的剩余风险。
- [ ] 当策略可执行且决策已完备时使用 `READY`；当可以进行有价值的部分规划但缺少重要证据时使用 `INCONCLUSIVE`；当无法建立需求或安全关键边界时使用 `BLOCKED`。
- [ ] 返回判定、风险图、决策台账、组合净影响、环境需求、排除项、局限性和剩余风险。
- [ ] 针对每个 `INCONCLUSIVE` 或 `BLOCKED` 区域，说明下一步最小的证据收集行动。

## 输出契约

```markdown
# Test Strategy

**Verdict:** READY | INCONCLUSIVE | BLOCKED

## Scope and existing evidence
- Requirements, actors, and outcomes
- Existing suites, commands, and environments
- Assumptions and unavailable evidence

## Risk map
| Protected outcome | Behavior | Failure or defect class | Impact | Existing proof | Priority rationale |
|---|---|---|---|---|---|
| ... | ... | ... | ... | PROVED / PARTIAL / MISSING / UNAVAILABLE | ... |

## Portfolio decisions and prioritized scenarios
| Priority | Test basis and protected risk | Existing evidence or affected test | Action | Level, scenario, and environment | Oracle, gate, and result | Review or retirement trigger |
|---:|---|---|---|---|---|---|
| ... | ... | path / command / NONE | KEEP / ADD / UPDATE / MERGE / DELETE / NO_TEST | unit / contract / integration / E2E / manual | independent evidence; required / diagnostic; PASS / FAIL / BLOCKED / UNPROVEN | change that requires reconsideration |

## Portfolio effect
Tests added, updated, merged, and deleted; explain every `NO_TEST` decision and whether the maintained portfolio grows, shrinks, or stays neutral.

## Next evidence-gathering actions
Exact repository, environment, contract, or user decision needed for each `INCONCLUSIVE` or `BLOCKED` area.

## Exclusions and residual risks
Low-value duplication, unavailable environments, accepted gaps, and evidence still required.
```