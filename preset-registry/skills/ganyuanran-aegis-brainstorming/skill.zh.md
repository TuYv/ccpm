---
name: brainstorming
description: "Use when defining ambiguous or high-complexity new features, product behavior, UI/component design, architecture choices, contract changes, or when grilling/pressure-testing a plan or design. Routine small requests stay on the fast path."
---
<EXPLICIT-MODE-GATE>
如果激活模式为显式模式（`~/.config/aegis/config.toml` 中包含
`activation_mode = "explicit"`，或环境中存在
`AEGIS_ACTIVATION_MODE=explicit`），且当前用户请求未明确点名调用
Aegis 或此技能，则返回快速路径：简洁作答，不使用此工作流的检查清单、流程仪式或文档要求。如果用户明确点名了 Aegis 或此技能，则照常继续。
</EXPLICIT-MODE-GATE>

# 执行

→ 直接盘问或对计划/设计进行压力测试？→ 进入下方的 `Grilling Mode`。温和的质疑意图？→ 使用其单行模式确认。访谈期间不要开始常规的设计产物、文档撰写、任务规划或实现。
→ 新功能、产品行为、UI/组件设计、架构/契约变更，或模糊的中高复杂度工作？→ **先设计。在所需设计/规格获批之前，不得实现。**
  1. 探索项目上下文 → 阅读权威文档，检查现有模式
  2. 每次提出一个澄清问题（优先使用选择题）
  3. 提出 2-3 种方案，说明权衡，并给出你的建议
  4. 分章节呈现设计 → 每一部分完成后获取用户批准
  5. 编写规格 → 自我审查 → 用户审查 → 转入 writing-plans
→ 硬性门禁：对于符合此技能范围的任务，在满足设计/规格审批要求之前，不要编写代码、搭建项目脚手架或调用实现类技能。

## 路由样例

下表各行是对方法行为的校准预期，而不是运行时
正则表达式路由器。Agent 根据证据选择路由；路由选择
不是要向用户提出的问题。

| 场景 | 路由 |
| --- | --- |
| 想法还没想清楚，先梳理功能设计 | 常规头脑风暴，优先紧凑输出 |
| 讨论公共 API 契约和兼容边界 | 常规头脑风暴，先完成设计章节再实现 |
| 盘问/拷问/审问这个方案，不要顺着我 | `Grilling Mode` |
| 修复登录按钮的空指针 | `systematic-debugging` |
| review 当前 PR / diff / 当前代码 | `requesting-code-review` |
| 给我一个有目标的方案 | 目标意图明确时使用 `goal-framing`；否则使用常规头脑风暴 |
| 把按钮文案从保存改成提交 | 快速路径；无需设计流程 |

# 将头脑风暴中的想法转化为设计

通过自然的协作式对话，帮助将想法转化为完整成形的设计和规格。

首先理解当前项目上下文和权威边界，然后每次提出一个问题来完善想法。理解要构建的内容后，呈现能够稳定推进工作的最小设计产物，并获取所需批准。

<HARD-GATE>
对于符合此技能范围的工作，在呈现所需设计/规格，并在此工作流要求批准的情况下获得用户批准之前，不要调用任何实现类技能、编写任何代码、搭建任何项目脚手架或执行实现操作。
</HARD-GATE>

## 盘问模式

### 模式优先级

当盘问模式处于激活状态时，它会覆盖常规的头脑风暴执行
流程。在用户退出访谈之前，暂停 `Checklist`、`The Process`、`Compact output contract`
以及所有文档或设计转换要求；仍需保留禁止实现的硬性门禁。

### 进入拷问模式的信号

- **直接触发：** 用户要求拷问或盘问某个想法、计划或设计，或明确要求进行压力测试。直接触发的表达包括 `grill me`、`grill this plan`、`审问我`、`盘问我` 和 `拷问我`。立即进入该模式。
- **软触发：** 用户要求挑战假设、找出漏洞、进行红队测试，或针对某个想法、计划或设计的草案表示“别顺着我”。只询问：`Grill or normal brainstorming?` 仅在用户确认后进入该模式。
- **不属于拷问：** 仅提及某个字面短语，或要求审查 PR、diff 或当前代码。正常解释字面短语；将实现审查路由至 `requesting-code-review`。

### 开场卡片

用户进入该模式后，用用户所使用的语言输出以下内容一次，然后开始访谈：

```text
◆ Grilling Session
Target: <idea / plan / design>
Question path: value -> boundaries -> failure modes -> acceptance
Pace: deep (default) | fast (user-requested)
```

### 节奏

- **深入：** 当某个决策问题会造成阻塞或依赖前一个回答时，每轮只问一个决策问题。在等待回答前，说明推荐答案和最相关的权衡。
- **快速：** 仅当用户明确要求进行快速或批量访谈时（例如 `fast`、`batch`、`快问` 或 `一次问几个`），最多询问三个相互独立的决策问题。为每个问题给出建议和权衡，然后等待用户回答。对于存在依赖关系的后续问题，恢复为深入节奏。

1. 在提问前，先探索代码库和当前的权威文档以获取事实。不要向用户询问可以在本地找到的事实。
2. 决策权归用户所有。不要将建议、暂定回答或对共同理解的检查点视为最终批准。
3. 除一次性的开场卡片外，每轮只保留观察、建议以及所选节奏对应的问题。访谈进行期间，不要输出完整的设计流程、编写文档、创建计划或进行实现。
4. 当用户表示停止、推迟或问题已经足够时结束访谈。使用结构化的 `Challenge Result` 再次确认。该总结不授予完成权限。

```text
Challenge Result
- Survived assumptions
- Rejected assumptions
- New evidence needed
- Design changes required
- Residual risks
- Return state: interview | design | approaches | writing-plans
```

5. 如果用户要求在访谈后继续，则返回正常的头脑风暴设计门禁。设计或规范仍需获得规定的批准，之后才能进行规划或实现。

## 转向其他流程 / 文档必要性门禁

不要将此工作流强加给低复杂度工作。微小的
措辞修改、单一负责人负责的错误修复、简单的配置或状态问题、局部
实用工具修改，或机械性的多文件修改，都可以通过简洁的
意图说明、基线检查、TDD/调试和验证来推进，而无需任何新
文档。在编写任何规范、计划、ADR 或
基线制品之前，先执行文档必要性门禁：

1. 是否已有规范/计划/ADR/基线覆盖此次变更范围？
   -> 就地更新该归属文档；绝不要创建同级文档。
2. 该范围是否持久或不可逆（架构、公共 API、负责人、依赖
   方向、迁移、兼容路径退役），是否涉及跨会话/跨人员
   交接、审批门禁或权威性要求？
   -> 是：为该范围编写最小化制品（参见“文档”）。
   -> 否：不要编写文档；将简短草案保留在当前会话中。
3. 在编辑时和收尾时重新检查；如果不确定性或影响扩大，则升级为最小的稳定化
   规范。

### 路由优先级

1. 应转交其他流程的情况应首先离开此工作流（`systematic-debugging`、
   `requesting-code-review`、目标意图明确时的 `goal-framing`、
   快速路径微任务）。
2. `拷问模式` 要求用户有明确的质疑意图。普通讨论、评估或澄清理解的需要
   不属于拷问。
3. 否则，运行常规的头脑风暴流程，并根据证据提升深入程度：
   契约、所有者、持久化、迁移、安全性、使用方数量或
   影响范围。应在获得证据后升级，而不能仅仅因为最初的
   请求听起来目标宏大就升级。
4. 文件数量本身并不是设计信号：机械性的多文件变更
   仍然可以走快速路径，而单文件的契约变更仍然可能需要完整
   设计。

## 角色与权限契约

### 由代理决定的事项

直接解决以下事项，无需询问用户：

- 仓库调查策略和证据收集顺序
- 已接受所有者内部的文件和函数组织方式
- 测试命令和与变更相称的验证机制
- 在策略已经允许的情况下，选择内联执行还是子代理执行
- 不改变产品行为、契约、权限或持久边界的可逆实现结构

### 由用户决定的事项

仅在以下方面询问用户：

- 产品行为或偏好
- 不可逆、破坏性、外部、公开、生产环境或敏感影响
- 只有用户才能作出的明确产品/契约承诺
- 无法从仓库、工具和权限文档中获得的必要信息

向用户提出的每个问题都必须通过以下检验：

> 如果用户选择另一个答案，哪项设计边界、行为、所有者、
> 验收标准或风险决策会发生变化？

如果都不会变化，就不要询问。这一分类阐明了哪些决策由
用户决定；它不会移除此工作流已经定义的审批点。

## 检查清单

你必须为以下每一项创建一个任务，并按顺序完成：

1. **探索项目上下文** — 检查文件、文档、近期提交、权限
   文档，并被动吸收相关活跃 `CONTEXT.md` 中的表述，而不
   加载活跃建模
2. **选择路径和范围** — 是真正的设计？还是诊断？据此进行路由，或先行拆解
3. **提出澄清问题** — 每次一个，了解目的、约束和成功标准
4. **起草工作产物** — `TaskIntentDraft`、`BaselineReadSetHint`、`BaselineUsageDraft`、`ImpactStatementDraft`
5. **添加新表面时运行存在性检查** — 仅当某个方案新增所有者、技能、产物、适配器、回退机制、工作流步骤或基准指标时
6. **提出 2-3 种方案** — 包含权衡分析和你的建议
7. **展示设计** — 按复杂度分节，并在必要时获得用户批准
8. **编写规范产物** — 仅在文档必要性门禁通过，且没有现有所有者规范/计划覆盖该表面后执行；如果已有覆盖，则更新该文档，而不是创建同级文档
9. **规范自审** — 检查占位符、矛盾、歧义、范围和边界
10. **用户审阅书面规范** — 在继续之前，请用户进行审阅
11. **过渡到实施** — 调用 `writing-plans` 技能（终止状态）

**终端状态正在调用 writing-plans。** 请勿调用任何其他实现技能。

## 流程

**理解想法：**
- 首先检查当前项目状态（文件、文档、近期提交）
- 在提出深入问题之前，先阅读相关的权威文档
- 在问题、选项、场景和规格说明中使用现有的规范术语。
  如果术语逐渐明确或出现冲突，请编写
  `establishing-project-context`；不要只在规格说明中解决。
- 如果请求是对已批准计划的诊断、根因分析或后续跟进 → 路由到正确的工作流
- 如果请求跨越多个相互独立的子系统 → 先标记并拆分
- 每次只提出一个澄清问题，优先使用多项选择题
- 在探索过程中区分事实、假设和未知事项

**工作产物：** 保留四份草稿：`TaskIntentDraft`（成果、目标、成功证据、停止条件、非目标、范围、风险）、`BaselineReadSetHint`（候选文档、权威依据缺口）、`BaselineUsageDraft`（必需引用、可选的已交付上下文引用、规划前已确认的引用、已引用的引用、缺失的引用、建议性决策）以及 `ImpactStatementDraft`（受影响的层、负责人、不变量、兼容性、非目标）。范围发生变化时刷新这些草稿。

**紧凑输出约定：** `Aegis Visibility`、`TaskIntentDraft`、`BaselineReadSetHint`、`BaselineUsageDraft`、`Requirement Ready Check`、`ImpactStatementDraft`、`Existence Check`、`Product Risk Lens`、`Architecture Integrity Lens`、`Baseline Role Alignment`、`Plan-Time Complexity Check`、`Options` 和 `Decision Needed`。在扩展为完整的设计结构之前，先使用这种紧凑形式。

此工作流中的 `Aegis Visibility` 用于说明为何应先澄清设计/规格说明，再开始实现，以及这种克制能够降低哪些偏移、过度构建、责任方错误或缺少验收标准的风险。应使其自然且针对具体任务；不要将其变成固定的技能跟踪记录。

当设计方向依赖特定基线文档或当前权威引用时，使用紧凑的 `BaselineUsageDraft`：

```text
BaselineUsageDraft:
- Required baseline refs:
- Delivered context refs:
- Acknowledged before plan refs:
- Cited in design refs:
- Missing refs:
- Decision: continue | needs-baseline-readback | needs-verification | pause-for-user | blocked
```

`Delivered context refs` 只是可选的、由宿主投射的记录信息。它并不能作为权威证据，证明宿主已注入上下文载荷或模型已在内部使用该载荷。该产物的作用是在推荐或批准设计之前，使基线/上下文注意力的偏移变得可见。

当需求尚未得到确认且并不完整时，在推荐设计之前使用紧凑的 `Requirement Ready Check`：

```text
Requirement Ready Check:
- Requirement source refs:
- Goals and scope refs:
- User / scenario refs:
- Requirement item refs:
- Acceptance / verification criteria refs:
- Open blocker questions:
- Decision: ready | needs-source | needs-goal-alignment | needs-scenario | needs-acceptance-criteria | needs-clarification | needs-user-decision | blocked
```

在项目权威来源确认之前，应将任务意图、对话、源文档和智能体推断视为候选需求来源。如果决定不是 `ready`，则将设计保持在提案/规格澄清层面；不要将缺口转化为实施任务。

**存在性检查：** 在推荐添加新的所有者、Skill、工件、宿主适配器、回退方案、兼容路径、工作流步骤或基准指标的方法之前，请先检查它是否需要存在。以 `docs/current/AEGIS_MINIMALITY_REFERENCE.md` 为参考。不要将此检查强行应用于复用现有所有者和工件的普通功能设计。

```text
Existence Check:
- Proposed new surface:
- Existing owner / reuse candidate:
- Why existing surface is insufficient:
- Creation proof:
- Entropy / retirement impact:
- Decision: reuse-existing | add-with-proof | defer | reject | needs-first-principles-review
```

如果决定为 `reuse-existing`，请推荐复用路径，而不是创建新表面。如果决定为 `add-with-proof`，请将证明、验证信号以及任何退役触发条件纳入设计/规格。

**产品风险视角：** 对于存在歧义的产品、功能、UI、工作流或架构选择，请添加一个精简的审查视角，而不是进行角色扮演：

```text
Product Risk Lens:
- Value:
- Non-goals:
- Trade-offs:
- Decision needed:
```

这是一个审查视角，而不是角色输出。它不会取代基线证据、已批准的需求或当前权威文档；它只是在实施前明确呈现产品风险和决策点。

**规划阶段复杂度检查：** 在为中等/高工作量任务选择实施方向之前，请检查可能涉及的所有者文件及其当前形态。这是一项提供建议性设计约束的检查，而不是门禁，也不是完成情况的权威依据。不要将其强行应用于微小的低风险编辑。

有关共享工件类别、压力信号解读和超出预算时的处理方式，请参阅 `using-aegis/references/complexity-governance.md`。

```text
Complexity Budget:
- Artifact class:
- Target files / artifacts:
- Current pressure:
- Projected post-change pressure:
- Budget result: within-budget | at-risk | over-budget
- Planned governance:

Plan-Time Complexity Check:
- Better file boundary:
- Recommendation: edit-in-place | extract helper | add owner file | split task | defer refactor
```

**探索方案：** 提出 2-3 种方案，说明其权衡并给出建议。明确范围边界：包含什么、推迟什么、什么应归于其他位置。

在选择方案之前，对任何拟议的新表面执行 `Existence Check`。如果候选方向在完成存在性检查后仍会引入新的所有者、重复的所有者、回退方案、适配器、仅用于兼容性的载体、删除优先问题、未经验证的假设或“长期稳定”声明，则升级至 `first-principles-review` 及其 `Decision Hygiene Review`。不要让任何一项检查成为普遍适用的设计仪式；一旦决策面变得清晰，就返回此工作流。

当核心决策是在内部退役、保留兼容性与持久状态确认之间进行选择时，组合使用 `anti-entropy-governance`。它会对删除目标进行分类，选择 `delete-first | compat-exception |
confirmation-first`，并将破坏性操作权限置于设计技能之外。

当主要风险并非宽泛的策略问题，而是架构一致性问题时，请使用范围更窄的 `Architecture Integrity Lens`：规范所有者不明确、职责重叠、调用方回退、陈旧路径仍承载实际逻辑，或可能存在更高层级的所有者、契约或事实来源简化方案。在推荐方案之前，该透镜应先回答不变量、规范所有者/契约、职责重叠、更高层级的简化、退役/证伪条件以及结论。

**基线角色对齐：** 当一个问题可能同时涉及“应该构建什么”和“它应该位于何处”时，应将需求事实与架构事实分开：

```text
Baseline Role Alignment:
- Product / Requirement Baseline:
- Architecture / Runtime Boundary Baseline:
- Result: aligned | Design Defect | Implementation Drift | missing-authority | needs-clarification
- scope: requirements | architecture | both
- Next action:
```

当相关需求、设计或基线有误时，使用 `Design Defect`。当工作偏离正确且未发生变化的基线时，使用 `Implementation Drift`。`Architecture Defect` 和 `Architecture Drift` 仍分别作为架构范围内 `Design Defect` 和架构范围内 `Implementation Drift` 的兼容别名。这是一种评审透镜，而不是运行时门禁或完成权限。

**呈现设计：** 根据复杂度调整章节规模。仅涵盖重要的方面：架构、组件、数据流、错误处理、测试、兼容性边界。当正在决定行为、契约、架构或面向用户的流程时，应在实施前获得对设计的批准。

**ADR 信号：** 当设计/规范涉及持久性的架构层面（所有者、公共契约、制品形态、依赖方向、事实来源、宿主兼容性、运行时就绪边界、回退、适配器或退役计划）时，应标记 ADR 信号、来源引用、真正的备选方案，以及供后续完成时处理的预期基线同步问题。不要根据尚未执行的想法创建已接受的架构记忆。

**为隔离而设计：** 每个单元 = 一个明确的用途、定义良好的接口、可独立测试。人们能否在不阅读内部实现的情况下理解它？能否在不破坏使用方的情况下更改内部实现？

**现有代码库：** 遵循现有模式。仅在有助于当前目标时纳入有针对性的改进。如果设计涉及契约、兼容性、回退或重复的所有者 → 直接指出。

## 设计探查

仅当探查能够改变设计方向，并且现有仓库证据不足时，才允许进行探查：

```text
Design Probe
- Question
- Expected decision impact
- Target and effect boundary
- Why existing evidence is insufficient
- Stop condition
- Evidence produced
- Cleanup
```

优先采用只读执行。一次性探针不得创建需要维护的所有者、公共契约、兼容性承诺或隐蔽的持久化路径。它是设计证据，而不是交付的实现。

## 软件场景配置

仅应用相关的配置，而不是为每项任务加载所有视角：

- `greenfield-feature`：价值、最小可交付行为、最小所有者、验收标准、明确的未来非目标；
- `existing-system-change`：当前状态、目标状态、二者之间的差异、需要保持的不变量、调用方、迁移和退役；
- `refactor`：需要保持的可观察行为、所有权/耦合缺陷、依赖方向、旧路径退役、行为保持证据；
- `public-contract`：使用方、版本控制、优先级、错误、兼容性、迁移、负面用例；
- `persistence-migration`：数据所有者、模式演进、部分迁移、崩溃恢复、备份/回滚、读写切换；
- `ui-workflow`：用户旅程以及加载/空白/错误/部分完成/成功/取消/
  重试状态、无障碍性、不可逆操作、恢复；
- `security-permission`：信任边界、攻击者能力、权限所有者、敏感数据、降级/撤销、安全失败、可审计性；
- `operational-release`：部署边界、可观测性、部分发布、回滚、兼容性窗口、运维人员恢复。

## 设计就绪与设计完成

满足以下条件时，方案选择即为就绪：

- 预期结果和主要场景已明确；
- 范围和非目标已明确；
- 当前行为和目标差异已有事实依据；
- 关键不变量和可能的规范所有者已识别；
- 至少存在一项可观察的验收标准；
- 不存在仍可能改变方案类别的未决未知事项。

并非必须消除所有未知事项；只有会改变决策的未知事项才会阻碍收敛。

满足所有适用条件时，设计即可移交：

- 选定的方案和规范所有者已明确；
- 固定行为/契约与由实现决定的选择已分离；
- 已对备选方案进行实质性比较，或根据证据将其排除；
- 关键假设已有证据支持或已被明确接受；
- 在适用情况下，已涵盖失败/恢复和使用方影响；
- 验收标准是可观察的，并可供验证使用；
- 新的所有者、回退机制、适配器、兼容性或持久化机制有创建依据，并已处理退役/回滚；
- 每项由用户决定的事项均已获得用户的真实批准。

设计完成意味着方法已就绪，而不是获得了完成授权。只有在满足这些条件后，才能过渡到 writing-plans；不要将尚未解决且会改变决策的未知事项带入计划。

## 设计之后

**文档：**

1. **Aegis 项目工作区初始化（仅首次创建）：**
   如果 `docs/aegis/` 不存在且已配置的 Aegis 工作区支持可用，则初始化目标项目：
   `python <aegis-workspace-helper> init --root <target-project-root>`。
   如果已安装的 Aegis 工作区支持不可用，则手动创建：
   a. 创建 `docs/aegis/README.md` — 描述工作区的用途和结构
   b. 创建 `docs/aegis/INDEX.md` — 空索引，后续将在下方追加内容
   c. 根据下方的「BASELINE-GOVERNANCE.md 模板」章节创建 `docs/aegis/BASELINE-GOVERNANCE.md`
   d. 如果项目已有代码，则使用下方的「初始基线快照模板」创建初始基线快照：
      `docs/aegis/baseline/YYYY-MM-DD-initial-baseline.md`
   如果 `docs/aegis/` 已存在，则直接使用它——不要重新创建。

2. **在需要时编写经过验证的规格产物：**
   使用能够稳定任务的最小产物：
   - 规格简报：`docs/aegis/specs/YYYY-MM-DD-<topic>-brief.md`，适用于在规划前需要明确内容、原因和验收标准的中等复杂度任务。
   - 设计规格：`docs/aegis/specs/YYYY-MM-DD-<topic>-design.md`，适用于高复杂度、架构、契约、迁移、跨模块或因行为存在歧义而需要用户审查的任务。
   规格始终存放在 `specs/` 中，绝不能存放在 `work/` 中。`docs/aegis/work/`
   保存会话级草稿，而不是项目文档；只有在通过文档必要性门禁后，才能将草稿提升至
   `specs/` 或 `plans/`。

3. **更新 INDEX.md：**
   优先使用已配置的 Aegis 工作区支持：`python <aegis-workspace-helper> append-index --root
   <target-project-root> --path docs/aegis/specs/<filename>.md --kind spec
   --title "<title>"`。如果工作区支持不可用，则手动将新的规格条目追加到
   `docs/aegis/INDEX.md`。
   追加后，如果已配置工作区支持，请运行 `python <aegis-workspace-helper> check --root
   <target-project-root>`。此操作仅验证结构和索引覆盖情况；它不授予完成确认权限。
   INDEX 记录规则：创建文档时登记该文档；更新现有文档不会更改索引；取代或删除文档时
   更新索引。

4. 将设计文档提交到 git。

5. 当最新的 `TaskIntentDraft`、`BaselineReadSetHint`、
   `BaselineUsageDraft` 和 `ImpactStatementDraft` 对设计产生实质性影响时，将它们以内联形式或附录形式纳入文档。

6. 记录明确的非目标和兼容性边界，以免后续实施计划发生偏移。
7. 跨仓库变更：针对每个仓库中的每个变更面分别做出决定；持久的跨仓库契约应在归属仓库中记录为 ADR，另一方只记录其本地影响（镜像关系，不重复记录）。

**规格自审：**
编写规格文档后，以全新的视角审视它：

1. **占位符扫描：** 是否存在任何“TBD”“TODO”、未完成的章节或模糊的要求？修复它们。
2. **内部一致性：** 是否有章节彼此矛盾？架构是否与功能描述相符？
3. **范围检查：** 范围是否足够聚焦，可以通过单个实施计划完成，还是需要进一步拆分？
4. **歧义检查：** 是否有任何要求可能产生两种不同的解释？如果有，选择其中一种并明确说明。
5. **边界检查：** 是否已明确标示不变量、兼容性边界、负责人、非目标，以及供后续补填完成信息的任何 ADR 信号？如果规格认可了一种高风险方案，请确认其中已反映 `first-principles-review` 的 `Decision Hygiene Review` 或 `Architecture
   Integrity Lens` 结果，或明确标记为无需执行。

直接在原文中修复所有问题。无需重新审查，只需修复后继续。

**用户审查门禁：**
设计规格通过审查循环后，请用户审查已编写的规格，然后再继续：

> “规范已编写并提交至 `<path>`。请审阅，并告知我在开始编写实施计划之前是否需要进行任何更改。”

当此工作流需要审阅时，等待用户响应。如果用户要求更改，请进行修改并重新运行规范审阅循环。只有在用户批准后才能继续。对于仅为确定中型任务验收标准而创建的小型 Spec Brief，除非项目规则要求正式批准步骤，否则用户审阅可以简短进行。

**实施：**

- 调用 writing-plans skill 创建详细的实施计划
- 不要调用任何其他 skill。writing-plans 是下一步。

## 关键原则

- **一次只问一个问题** - 不要用多个问题让用户不知所措
- **优先选择题** - 在可能的情况下，选择题比开放式问题更容易回答
- **严格遵循 YAGNI** - 从所有设计中移除不必要的功能
- **探索替代方案** - 在确定方案之前，始终提出 2-3 种方法
- **增量验证** - 展示设计并获得批准后再继续
- **保持灵活** - 当某些内容不合理时，返回并澄清

## BASELINE-GOVERNANCE.md 模板

首次创建 `docs/aegis/BASELINE-GOVERNANCE.md` 时，请使用此模板：

```markdown
# Baseline Governance

## 1. Baseline Roles
- Product / Requirement Baseline: confirmed requirement sources, target state,
  goals and scope, users / scenarios, requirement items, acceptance /
  verification criteria, non-goals, workflow constraints, open questions,
  change records, and approved requirement/spec intent.
- Architecture / Runtime Boundary Baseline: canonical owner, contract,
  source-of-truth boundary, dependency direction, compatibility, runtime-ready
  boundary, and retirement state.

## 2. Design Defect
A confirmed error, gap, contradiction, or wrong abstraction IN the relevant
requirement, design, or baseline.
- Fix the defective requirement/design/baseline first.
- Then align implementation to the corrected baseline.
- Do NOT patch implementation around a defective baseline.

## 3. Implementation Drift
Implementation, plan, review, or documentation has deviated from a confirmed,
correct, unchanged requirement or architecture baseline.
- Return to baseline via the simplest stable path.
- Do NOT "update baseline to match drift" without explicit review.

## 4. Compatibility Aliases
- Architecture Defect = architecture-scoped Design Defect.
- Architecture Drift = architecture-scoped Implementation Drift.
- New findings should report Design Defect / Implementation Drift plus
  `scope: requirements | architecture | both`.

## 5. Baseline Check Protocol
Before non-trivial changes:
1. Read the latest Product / Requirement Baseline candidate.
2. Read the latest Architecture / Runtime Boundary Baseline candidate.
3. Compare current work against requirement acceptance and architecture owner /
   contract boundaries.
4. Check for new anti-patterns not recorded in known list.
5. Report: aligned / Design Defect / Implementation Drift /
   missing-authority / needs-clarification, with
   `scope: requirements | architecture | both`.

## 6. Architecture Review — 7 Dimensions
After each non-trivial change:
1. **Ownership integrity** — every component has exactly one canonical owner
2. **Module boundaries** — no unauthorized cross-module coupling
3. **Contract changes** — all API/signature/behavior contract changes documented
4. **Cascade proliferation** — no new cascading dependency chains
5. **Dependency direction** — dependencies flow toward stability
6. **Retirement completeness** — old owners/fallbacks/paths removed or scheduled
7. **Entropy flow** — net complexity decreased or stayed; no unjustified new entities

## 7. Hard Boundaries
- BASELINE-GOVERNANCE.md is the constitution for THIS project's Aegis workspace
- Baseline snapshots in `baseline/` are evidence, not authority
- ADRs in `adr/` record decisions; they do not replace baseline governance
- This file is NEVER auto-updated — changes require explicit user review
```

## 初始基线快照模板

创建首个 `docs/aegis/baseline/YYYY-MM-DD-initial-baseline.md` 时：

应引导建立项目的双基线，而不是编写扁平化的仓库清单。
即使仓库仍处于早期阶段或仅完成了部分定义，首个基线也应支持后续执行 `Baseline Role Alignment` 检查。

最低结构要求：

```markdown
# <Project> Initial Baseline

Date: `YYYY-MM-DD`
Status: `initial dual-baseline snapshot`

## 1. Purpose
- why this baseline exists
- what later alignment checks should use it for

## 2. Workspace Structure
- top-level directories, entry points, substrate roots, or seams worth tracking

## 3. Current Authority Surfaces
- README / AGENTS / ADR / spec / baseline / external reference roots
- current authority gaps or missing documents

## 4. Product / Requirement Baseline
### 4.1 Current Truth
- confirmed requirement sources or current authority gaps
- target state, goals, and scope
- target users, roles, usage scenarios, or system scenarios
- functional, quality, constraint, and delivery / transition requirement items
- acceptance / verification criteria and evidence expectations
- success evidence, value claim, or phase focus already fixed

### 4.2 Non-negotiables
1. ...

### 4.3 Product Non-goals
- ...

## 5. Architecture / Runtime Boundary Baseline
### 5.1 Current Truth
- canonical owner or substrate split
- contract / source-of-truth boundary
- dependency direction or owner layering already fixed

### 5.2 Architecture Non-negotiables
1. ...

### 5.3 Architecture Non-goals
- ...

## 6. Ownership / Contract Snapshot
- important surface -> current owner
- contract seams, missing seam inventory, or boundary gaps

## 7. Current State and Risks
- current stage
- known risks, unknowns, or missing evidence

## 8. Alignment Use
- when to read the Product / Requirement Baseline
- when to read the Architecture / Runtime Boundary Baseline
- when to report `scope: both`

## 9. Compatibility Boundary
- what must NOT break during early work
```

不要将首个引导基线简化为通用的 10 字段检查清单。
如果项目信息较少，应保持各章节简短并明确标记权威信息缺口，而不是进行猜测。