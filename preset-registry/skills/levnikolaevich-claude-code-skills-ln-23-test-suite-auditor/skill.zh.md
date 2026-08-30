---
name: ln-23-test-suite-auditor
description: "Audits whether an existing test suite proves important behavior as a sustainable portfolio. Use when test confidence or lifecycle control is uncertain; not to implement tests or review one delivery."
---
# 测试套件审计员

**目标：** 将测试组合审计为一个只读的生命周期与置信度系统。确定它能够检测哪些重要故障，哪些证据不可信或已过时，以及哪些新增、变更、合并、退役或明确省略的内容能够构成最小且可持续的测试组合。

**执行契约：** 将下方按顺序排列的复选框工作流视为此技能的完成定义。将每个复选框跟踪为 `PENDING`，然后使用具体证据将其解决为 `PROVEN`，使用表明其条件触发器不存在的证据将其解决为 `CLEARED`，或解决为 `UNPROVEN`；阅读、提及、委派、跳过或工具失败都不能作为证明。
返回前，解决所有 `PENDING`，仅将 `PROVEN` 和 `CLEARED` 项计为已完成，将此技能的判定、决策和批准规则应用于每个 `UNPROVEN` 项，并在开头添加 **Checklist: X/Y complete**<br>**Incomplete: None | section/item — reason; outcome impact; exact next action**；列出每个 `UNPROVEN` 项。

## 工具路由

| 需求 | 首选工具 | 使用时机 | 备用方案 |
|---|---|---|---|
| 源代码与测试清单 | 原生文件列表、搜索、清单文件和测试配置 | 映射领域、测试类型、运行器、fixture 以及生成区域时 | 仓库树以及已知的测试入口 |
| 测试与代码的关系 | 语言服务器或宿主原生代码智能工具 | 映射单元、调用方、实现、路由和测试目标时 | 通过直接读取验证命名和路径搜索结果 |
| 执行与可信度 | 通过 shell 执行仓库定义的测试命令 | 确定通过/失败状态、耗时、顺序依赖或可复现性时 | 检查 CI 结果和配置；将执行不可用标记为不可执行 |
| 覆盖率与遗漏行为 | 现有覆盖率工具和报告 | 已配置覆盖率数据且其范围与源代码范围可比较时 | 静态的行为到测试映射；绝不臆造百分比 |
| 不稳定性与隔离证据 | 仓库支持的重复运行、乱序运行、并行运行或种子控制运行 | 怀疑测试依赖顺序、时间、随机性或共享状态时 | 历史记录、CI 日志和代码路径证据 |
| 断言强度 | 测试读取结果、失败输出和已配置的变异测试 | 确定测试是否会因有意义的行为缺陷而失败时 | 结合具体断言进行反事实推理 |
| 框架语义 | 官方测试运行器或框架文档 | 某项发现依赖生命周期、fixture、重试、隔离或模拟行为时 | 一手来源的网络研究；否则标记为 `UNVERIFIED` |

仅运行安全的测试和诊断命令。审计期间不要重写快照、更新黄金文件、重新生成 fixture，或接受发生变化的输出。

## 证据规则

- 覆盖率表明代码被执行过，而不是提供了证明。重要行为必须有断言或可观测的判定依据。
- 当一个慢速测试独特地保护关键流程时，它并不具有低价值；当一个快速测试只验证框架行为时，它也不具有高价值。
- 必须将不稳定失败与间歇性失败的产品依赖项或真正的非确定性需求区分开来。
- 删除建议必须证明测试依据已过时，或其他证据以相同或更高的可信度覆盖了所有仍需验证的行为和失败模式。
- 合并建议必须证明存在重复或碎片化覆盖，并且必须保留不同的业务场景和失败场景、判定依据强度以及失败定位能力；更大的测试并不天然更好。
- 已知的回归防护以及罕见关键边界情况的唯一证明，不会仅因为数值启发式指标较低就成为删除候选。
- 真实依赖项并不天然构成测试缺陷。应判断其版本、状态、所有权、重置机制、可用性和失败证据是否能使结果可复现。
- 将组合操作（`KEEP`、`ADD`、`UPDATE`、`MERGE`、`DELETE`、`NO_TEST`）与执行状态（`PASS`、`FAIL`、`BLOCKED`、`UNPROVEN`、`QUARANTINED`）分开。`NO_TEST` 要求已有证明、其他控制措施或对剩余风险的明确接受。
- 默认不要要求新增注册表。优先使用可从仓库原生测试路径、行为名称、标签、需求、CI 配置和评审证据中推导出的可追溯性。
- 外部测试指导只有在说明了此测试套件中的具体弱点时，才具有可操作性。

## 检查清单

### 1. 绘制测试组合与基线

- [ ] 检测测试运行器、配置、命令、目录、fixture、工厂、快照、基准文件、手动脚本、覆盖率以及变异测试工具。
- [ ] 将源代码领域和关键入口映射到单元测试、集成测试、契约测试、端到端测试和手动测试覆盖面。
- [ ] 在存在证据的情况下，将需求、产品风险、事故、公共契约和变更行为追溯到测试及结果；识别当前没有测试依据的测试，以及没有可信证明依据要素。
- [ ] 阅读仓库说明和 CI 配置，识别必需的测试套件、环境假设、重试、分片和排除项。
- [ ] 先运行最小的代表性测试套件，然后在可行时运行必需的测试门禁；记录环境、耗时、退出状态、失败、跳过和重试。
- [ ] 在评估测试组合之前，将生成的、供应商提供的、示例、迁移历史和基础设施 fixture 与产品测试区分开。
- [ ] 保持审计只读，并披露获准命令创建的任何缓存或测试产物。

### 2. 审计产品价值与覆盖率

- [ ] 识别具有独特关键性的本地逻辑：资金、身份验证、授权、数据完整性、算法、领域规则、破坏性操作和不可逆工作流。
- [ ] 将每个关键行为追溯到至少一个测试；对于相应缺陷，该测试的预期结果应会失败；名称/路径匹配和行覆盖率只能作为发现证据。
- [ ] 识别那些只是在重复证明语言、框架、数据库引擎、ORM、HTTP 客户端、密码学、序列化器或库行为的测试，而没有断言仓库自有的配置、查询、模式、适配、验证、失败处理或可观察结果。
- [ ] 检查端到端测试是否跨越与风险相关的、符合生产形态的边界，并证明最终的持久化结果或用户可见结果，而不只是中间状态、页面或模拟调用。
- [ ] 找出没有端到端证明的关键旅程，以及其行为已经在更低层级得到更可靠覆盖、但成本高昂的端到端测试。
- [ ] 在这些失败可能发生且代价高昂的情况下，检查错误、重试、超时、授权、并发、迁移、兼容性和恢复行为。
- [ ] 使用覆盖率数据定位未执行的关键路径，然后在报告缺口之前检查行为和断言。
- [ ] 将每个实质性缺口和范围内受影响的测试分类为 `KEEP`、`ADD`、`UPDATE`、`MERGE`、`DELETE` 或 `NO_TEST`，并根据影响、合理可预期的失败、独特性、可信度和维护成本提供依据；当有价值的意图仍然存在，但其依据、设置、边界、断言或预期结果必须改变时，使用 `UPDATE`。

### 3. 审计隔离性与确定性

- [ ] 检查共享数据库、文件系统、环境、进程、网络、缓存、时钟、随机数生成器和全局状态是否在测试之间发生泄漏。
- [ ] 检查成功和失败时的设置与清理、唯一测试数据、事务边界、清理操作以及并行安全的资源所有权。
- [ ] 使用可获得的最小区分矩阵诊断疑似不稳定测试：单独运行、在测试套件中运行、使用固定种子重复运行、随机打乱/反向运行以及并行运行；保留首次失败时的顺序、种子、工作进程和环境。
- [ ] 检测时间、时区、区域设置、随机性、休眠、调度器和竞态敏感性；当行为依赖这些因素时，要求使用可控时钟或种子。
- [ ] 对于真实依赖和模拟器，核实版本锁定、就绪状态、命名空间/状态重置、失败清理、凭据和 CI 可用性，而不是假设使用真实依赖或模拟对象中的任一方必然更好。
- [ ] 审查重试和隔离规则，确保它们保留首次失败和可复现性数据，而不是将初始失败转化为无声通过。
- [ ] 要求每个隔离测试在通过结果之外仍保持可见，并配有负责人或决策路径，以及明确的恢复、替换或退役触发条件；隔离是执行状态，而不是测试组合操作。
- [ ] 使用重复证据、日志和失败路径，将测试不稳定与真实的间歇性产品缺陷区分开。

### 4. 审计结构、维护性和判定依据

- [ ] 检查测试布局是否遵循源代码域或清晰的按类型划分约定，以及贡献者是否能够找到负责相应功能的测试。
- [ ] 查找孤立测试、已禁用的测试套件、重复的 fixture、碎片化的场景覆盖、过大的文件，以及掩盖归属关系的扁平目录。
- [ ] 识别原始触发因素已经结束的临时特征刻画、迁移、兼容性、事件、变通方案和回归测试；要求提供当前仍然独特的风险证据，或安全的合并或删除路径。
- [ ] 检查测试名称和编排是否表达行为意图、前置条件、操作和预期结果，而不是叙述实现细节。
- [ ] 对于 UI 和交互测试，拒绝与可见文本或翻译后的文案、样式、布局、位置或偶然结构耦合的定位器；要求使用稳定的、由仓库维护的 ID 或专用测试钩子，并将明确的文案断言与元素发现分开。
- [ ] 检查断言是否具体、是否包含否定性证明、状态与交互是否平衡、失败消息是否有用，以及是否能够抵抗误报。
- [ ] 标记无断言测试、薄弱的真值检查、仅依赖快照的证明、宽泛的异常接受，以及绕过被测行为的 mock。
- [ ] 检查预期值是否来自独立的契约、示例、不变量或黄金产物，而不是在测试中复现实现所使用的计算。
- [ ] 检查 mock、fake、模拟器和生成的客户端是否存在契约漂移；如果漂移可能造成虚假的信心，则要求增加契约测试，或采用其他可信方式与真实边界进行比较。
- [ ] 使用非默认配置值进行测试，因为使用默认值且通过的测试可能掩盖硬编码的端口、限制、超时、路径或功能行为。
- [ ] 对于关键的薄弱判定依据候选项，使用已有的变异测试结果或安全且有针对性的反事实验证；不要强制要求在整个仓库范围内进行变异测试。
- [ ] 审查手动测试是否具备可复现的设置、快速失败行为、明确的预期证据、幂等性、清理、可移植性和操作员文档。
- [ ] 检查 fixture 和辅助工具的抽象是否易读且默认值诚实；构建器中的隐藏行为不得使重要的测试条件变得不可见。
- [ ] 审查门禁的位置和套件成本：必需的门禁应保护实质性的发布风险，而较慢的诊断性或探索性证据应保持可发现，同时不应不必要地阻塞常规交付。

### 5. 验证发现并报告

- [ ] 仅当生命周期、fixture、隔离、重试或 mocking 行为可能改变某项发现时，才研究运行器或框架语义；使用与版本匹配的官方来源。
- [ ] 在安全的情况下复现高严重性的不可信问题，并保留命令、种子、顺序和环境证据。
- [ ] 对具有同一根因的发现进行去重，例如由全局 fixture 导致多个不稳定的测试套件。
- [ ] 对每个候选项应用实质性和可接受替代方案门槛。要求在该套件已有证据表明的规模下，存在未被证明的具体关键行为、虚假的信心、交付风险或反复出现的维护成本。拒绝吹毛求疵、测试风格偏好、理论纯粹性、覆盖率虚荣、泛化的最佳实践，以及另一种同样可信的测试设计；当多种测试形态都可行时，要求覆盖风险并具备判定依据，而不是要求某一种首选实现。
- [ ] 在每项发现的必要解决方案中加入直接相关的 Markdown 实践链接：优先使用当前的官方文档或规范；只有当官方来源无法解决权衡问题时，才使用可信的第一方工程材料。打开并验证来源；该来源必须支持所提出的测试机制，而不只是支持缺陷类别。拒绝搜索结果链接、泛化的最佳实践文章和装饰性引用。
- [ ] 根据未被证明的关键行为、虚假的信心、交付阻塞和维护负担，将发现分类为 `P0`-`P3`。
- [ ] 包含受影响的行为、测试位置、证据、遗漏的缺陷类别、测试组合行动、当前折衷方案为何不可接受，以及最小可信修复方案，同时允许等价解决方案。
- [ ] 在存在证据时，报告对决策有用的测试组合信号：按证明状态划分的实质性风险、行动分布、必需门禁的结果和耗时、跳过、重试、隔离，以及孤立或过时的候选项。拒绝将测试总数、未排除项之外的通过率、原始覆盖率和层级比例作为独立的质量目标。
- [ ] 当必需的关键套件、环境或判定依据无法访问，且不存在可信的静态或历史回退方案时，使用 `BLOCKED`；当证据表明关键行为未被证明、必需门禁失败，或不可信的关键表面仍造成虚假信心时，使用 `FAIL`；仅对非阻塞性的测试组合或维护风险使用 `CONCERNS`；只有在必需证据可信且不存在关键缺口时，才使用 `PASS`。
- [ ] 返回包含可信覆盖范围、关键缺口、不可信表面、测试组合行动、限制和剩余测试风险的结论。

## 输出契约

```markdown
# Test Suite Audit

**Verdict:** PASS | CONCERNS | FAIL | BLOCKED

## Portfolio map and baseline
- Runners, suites, and test types
- Commands and environments executed
- Coverage, flake, and mutation evidence available

## Confidence summary
| Area | Status | Evidence |
|---|---|---|
| Critical behavior coverage | PASS / CONCERNS / FAIL | ... |
| Isolation and determinism | PASS / CONCERNS / FAIL | ... |
| Structure and maintenance | PASS / CONCERNS / FAIL | ... |
| Assertion and oracle strength | PASS / CONCERNS / FAIL | ... |
| Lifecycle and portfolio control | PASS / CONCERNS / FAIL | traceability, gates, quarantine, retirement triggers, and net portfolio effect |

## Portfolio decisions
| Test basis or protected risk | Existing evidence or affected test | Action | Gate and result | Replacement evidence or review trigger |
|---|---|---|---|---|
| ... | path / command / NONE | KEEP / ADD / UPDATE / MERGE / DELETE / NO_TEST | required / diagnostic; PASS / FAIL / BLOCKED / UNPROVEN / QUARANTINED | ... |

## Findings and portfolio actions
| Priority | Problem | Evidence and justification | Required resolution |
|---|---|---|---|
| P0 / P1 / P2 / P3 | Concrete confidence or maintenance defect | Test basis, behavior and test location, evidence, missed defect class, material risk, and why the current tradeoff is not acceptable | `KEEP` / `ADD` / `UPDATE` / `MERGE` / `DELETE` / `NO_TEST`, replacement evidence or accepted risk, the smallest sufficient correction, and a verified `[practice reference](URL)` to official or primary engineering guidance; allow equivalent test designs with the same risk coverage and oracle strength |

Use `None` when no candidate survives the evidence, materiality, portfolio-value, and acceptable-alternative gates.

## Portfolio control
Net additions, updates, merges, and deletions; `NO_TEST` decisions; required versus diagnostic gates; skips, retries, quarantine, and review or retirement triggers. Use only evidenced signals that can change a decision.

## Residual risks
Unexecuted suites, unavailable environments, accepted `NO_TEST` exposure, and behavior that remains unproven.
```