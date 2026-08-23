---
name: brainstorming
description: "Use when defining ambiguous or high-complexity new features, product behavior, UI/component design, architecture choices, contract changes, or when grilling/pressure-testing a plan or design. Routine small requests stay on the fast path."
---
<EXPLICIT-MODE-GATE>
如果激活模式为显式（`~/.config/aegis/config.toml` 中包含
`activation_mode = "explicit"`，或环境中可见 `AEGIS_ACTIVATION_MODE=explicit`），
并且当前用户请求未按名称显式调用 Aegis 或此技能，则返回快速路径：简洁作答，
无需采用此工作流的检查清单、仪式或文档要求。如果用户显式提到了 Aegis
或此技能，则照常继续。
</EXPLICIT-MODE-GATE>

# 执行

→ 直接拷问或对计划/设计进行压力测试？→ 进入下方的 `Grilling Mode`。温和的质疑意图？→ 使用其单行模式确认。访谈期间，不要开始常规设计产物、文档编写、任务规划或实现。
→ 新功能、产品行为、UI/组件设计、架构/契约变更，或模糊的中高复杂度工作？→ **先设计。在所需的设计/规格获得批准之前，不得实现。**
  1. 探索项目上下文 → 阅读权威文档，检查现有模式
  2. 每次提出一个澄清问题（优先使用多项选择）
  3. 提出 2-3 种方案，说明权衡，并给出你的建议
  4. 分节呈现设计 → 每节之后获取用户批准
  5. 编写规格 → 自我审查 → 用户审查 → 转入 writing-plans
→ 硬性关卡：对于符合此技能的任务，在设计/规格批准要求得到满足之前，绝对不要编写代码、搭建项目脚手架或调用实现类技能。

## 路由样例

以下各行是对方法行为的校准预期，而不是运行时
正则表达式路由器。Agent 根据证据选择路由；路由选择
不是要向用户提出的问题。

| 场景 | 路由 |
| --- | --- |
| 想法还没想清楚，先梳理功能设计 | 常规头脑风暴，优先紧凑输出 |
| 讨论公共 API 契约和兼容边界 | 常规头脑风暴，先完成设计章节再实现 |
| 盘问/拷问/审问这个方案，不要顺着我 | `Grilling Mode` |
| 修复登录按钮的空指针 | `systematic-debugging` |
| review 当前 PR / diff / 当前代码 | `requesting-code-review` |
| 给我一个有目标的方案 | 当目标意图明确时使用 `goal-framing`；否则进行常规头脑风暴 |
| 把按钮文案从保存改成提交 | 快速路径；无需设计流程 |

# 将头脑风暴中的想法转化为设计

通过自然的协作式对话，帮助将想法转化为完整的设计和规格。

首先了解当前项目上下文和权威边界，然后每次提出一个问题以完善想法。当你理解要构建的内容后，呈现能够稳定推进工作的最小设计产物，并获取所需的批准。

<HARD-GATE>
对于符合此技能的工作，在你呈现所需的设计/规格并且用户在此工作流要求批准之处予以批准之前，绝对不要调用任何实现类技能、编写任何代码、搭建任何项目脚手架或采取实现行动。
</HARD-GATE>

## 拷问模式

### 模式优先级

当拷问模式处于活动状态时，它会覆盖常规的头脑风暴执行
流程。暂停 `Checklist`、`The Process`、`Compact output contract`
以及所有文档或设计转换要求，直到用户退出
访谈；继续保留禁止实现的硬性关卡。

### 盘问模式进入信号

- **直接：** 用户要求盘问或审问某个想法、计划或设计，或者明确要求进行压力测试。直接触发短语包括 `grill me`、`grill this plan`、`审问我`、`盘问我` 和 `拷问我`。立即进入该模式。
- **委婉：** 用户要求挑战假设、寻找漏洞、进行红队测试，或针对想法、计划或设计草案表示“别顺着我”。只询问：`Grill or normal brainstorming?` 仅在确认后进入该模式。
- **非盘问：** 单纯/字面地提及某个短语，或者对 PR、diff 或当前代码进行审查。按通常方式解释字面短语；将实现审查路由至 `requesting-code-review`。

### 开场卡片

用户进入该模式后，用用户的语言输出以下内容一次，然后开始访谈：

```text
◆ Grilling Session
Target: <idea / plan / design>
Question path: value -> boundaries -> failure modes -> acceptance
Pace: deep (default) | fast (user-requested)
```

### 节奏

- **深入：** 当某个决策问题会造成阻塞或依赖上一个回答时，每轮只问一个决策问题。在等待回答前，说明推荐答案和最相关的权衡。
- **快速：** 仅当用户明确要求快速或批量访谈时（例如 `fast`、`batch`、`快问` 或 `一次问几个`），最多提出三个相互独立的决策问题。为每个问题提供建议和权衡，然后等待用户回答。对于存在依赖关系的后续问题，恢复为深入节奏。

1. 提问前，先探索代码库和当前权威文档以获取事实。不要向用户询问可在本地找到的事实。
2. 决策权属于用户。不要将建议、暂定回答或共同理解检查点视为最终批准。
3. 除一次性的开场卡片外，每轮内容应仅限于观察、建议以及所选节奏对应的问题。在访谈进行期间，不要执行完整的设计流程、编写文档、制定计划或实施。
4. 当用户表示停止、推迟或问题已经足够时结束。使用结构化的 `Challenge Result` 再次确认。该总结不会授予完成权限。

```text
Challenge Result
- Survived assumptions
- Rejected assumptions
- New evidence needed
- Design changes required
- Residual risks
- Return state: interview | design | approaches | writing-plans
```

5. 如果用户要求在访谈后继续，则返回常规的头脑风暴设计门禁。设计/规范仍需获得规定的批准，之后才能规划或实施。

## 路由至其他流程 / 文档必要性门禁

不要将此工作流强加给低复杂度工作。微小的
措辞修改、由单一负责人处理的错误修复、简单的配置/状态问题、局部
实用工具修改，或机械性的多文件修改，都可以通过简明的
意图、基线检查、TDD/调试和验证来推进，无需创建任何新
文档。在编写任何规范、计划、ADR 或
基线制品前，先执行文档必要性门禁：

1. 是否已有规范/计划/ADR/基线覆盖此次变更范围？
   -> 就地更新该权属文档；绝不创建同级文档。
2. 此范围是否持久/不可逆（架构、公共 API、负责人、依赖
   方向、迁移、兼容路径退役）、涉及跨会话/跨人员
   交接、需要审批，或要求权威依据？
   -> 是：针对该范围编写最小制品（参见“文档”）。
   -> 否：不编写文档；在会话中保留精简草案。
3. 在编辑时和收尾时重新检查；如果不确定性或影响扩大，
   则升级为最小的稳定化规范。

### 路由优先级

1. 需要转交其他流程的情况应首先离开此工作流（`systematic-debugging`、
   `requesting-code-review`、目标意图明确时的 `goal-framing`，
   以及快速路径微任务）。
2. `Grilling Mode` 需要明确的质询意图。普通讨论、评估或需要澄清理解，
   均不属于质询。
3. 否则，运行正常的头脑风暴流程，并根据证据提升深入程度：
   契约、所有者、持久化、迁移、安全性、消费者数量或
   影响范围。应在获得证据后升级，而不是仅仅因为最初的
   请求听起来很宏大。
4. 文件数量本身并非设计信号：机械性的多文件变更
   仍可走快速路径，而单文件的契约变更仍可能需要完整
   设计。

## 角色与权限契约

### 由智能体决定的事项

直接解决以下事项，无需询问用户：

- 仓库调查策略和证据收集顺序
- 已接受所有者内部的文件和函数组织方式
- 测试命令和与工作量相称的验证机制
- 策略已允许时，选择内联执行还是使用子智能体执行
- 不改变产品行为、契约、权限或持久边界的可逆实现结构

### 由用户决定的事项

仅就以下事项询问用户：

- 产品行为或偏好
- 不可逆、破坏性、外部、公开、生产环境或敏感影响
- 只有用户才能作出的明确产品或契约承诺
- 无法从仓库、工具和权限文档中获取的必要信息

每个向用户提出的问题都必须通过以下检验：

> 如果用户选择另一个答案，哪项设计边界、行为、所有者、
> 验收标准或风险决策会发生变化？

如果没有任何变化，就不要询问。当问题通过此检验时，
应附上推荐选项及其理由，让用户在已界定的选项之间作出决定，
而不是自行研究。这种分类明确了哪些决定由用户作出；它不会移除此工作流
已定义的审批节点。

## 检查清单

你必须为以下每一项创建一个任务，并按顺序完成：

1. **探索项目上下文** — 检查文件、文档、最近的提交、权限
   文档，并被动吸收相关有效 `CONTEXT.md` 中的语言，而不
   加载主动建模
2. **选择路径和范围** — 是真正的设计？还是诊断？据此进行路由，或先进行分解
3. **提出澄清问题** — 每次一个，了解目的、约束和成功标准
4. **起草工作产物** — `TaskIntentDraft`、`BaselineReadSetHint`、`BaselineUsageDraft`、`ImpactStatementDraft`
5. **添加新表面时运行存在性检查** — 仅当某种方案添加新的所有者、技能、产物、适配器、回退机制、工作流步骤或基准指标时
6. **提出 2-3 种方案** — 说明权衡，并给出你的建议
7. **呈现设计** — 按复杂度划分章节，并在需要时获得用户批准
8. **编写规格产物** — 仅在文档必要性门槛通过，且没有现有的所有者规格或计划覆盖该表面之后；如果已有覆盖，则更新该文档，而不是创建同级文档
9. **规格自审** — 检查占位符、矛盾、歧义、范围和边界
10. **用户审阅书面规格** — 在继续之前请用户审阅
11. **过渡到实施** — 调用 writing-plans 技能（终止状态）

**当前终端状态正在调用 writing-plans。** 不要调用任何其他实现技能。

## 流程

**理解想法：**
- 首先检查当前项目状态（文件、文档、近期提交）
- 在提出深入问题之前，阅读相关的权威文档
- 在问题、选项、场景和规范中使用现有的规范术语。
  如果术语逐渐明确或出现冲突，请编写
  `establishing-project-context`；不要只在规范中解决该问题。
- 如果请求是诊断、根因分析，或已批准计划的后续工作 → 路由到正确的工作流
- 如果请求跨越多个相互独立的子系统 → 首先指出并拆分
- 每次提出一个澄清问题，优先使用多项选择题
- 在探索过程中区分事实、假设和未知项

**工作产物：** 保留四份草稿：`TaskIntentDraft`（成果、目标、
成功证据、停止条件、非目标、范围、风险）、
`BaselineReadSetHint`（候选文档、权威性缺口）、
`BaselineUsageDraft`（必需引用、可选的已交付上下文引用、
制定计划前已确认的引用、已引用的引用、缺失的引用、建议性决策），
以及 `ImpactStatementDraft`（受影响的层、负责人、不变量、兼容性、
非目标）。范围发生变化时更新这些草稿。

**紧凑输出约定：** `Aegis Visibility`、`TaskIntentDraft`、`BaselineReadSetHint`、
`BaselineUsageDraft`、`Requirement Ready Check`、`ImpactStatementDraft`、
`Existence Check`、`Product Risk Lens`、`Architecture Integrity Lens`、
`Prior-Art & Reuse Lens`、`Baseline Role Alignment`、`Plan-Time Complexity
Check`、`Options` 和 `Decision Needed`。在扩展为完整设计结构之前，先使用这种紧凑形式。

此工作流中的 `Aegis Visibility` 说明为什么设计/规范澄清应先于实现，
以及这种克制能够降低哪些偏移、过度构建、责任方错误或缺失验收标准的风险。应使其自然且针对具体任务；
不要把它变成固定的技能追踪记录。

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

`Delivered context refs` 仅是可选的、由宿主投射的记录信息。它不能作为宿主已注入上下文载荷或模型已在内部使用该载荷的权威证明。该产物用于在推荐或批准设计之前，使基线/上下文注意力偏移变得可见。

当需求尚未得到确认且不完整时，请在推荐设计之前使用紧凑的 `Requirement Ready Check`：

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

在项目权威来源确认之前，将任务意图、对话、源文档和代理推断视为候选需求来源。如果决策不是 `ready`，则将设计保持在提案/规格澄清层面；不要将缺口转化为实施任务。

**存在性检查：** 在推荐添加新的所有者、技能、制品、宿主适配器、回退机制、兼容路径、工作流步骤或基准指标的方案之前，先检查其是否有存在的必要。以 `docs/current/AEGIS_MINIMALITY_REFERENCE.md` 作为参考。不要将此检查强加于复用现有所有者和制品的常规功能设计。

```text
Existence Check:
- Proposed new surface:
- Existing owner / reuse candidate:
- Why existing surface is insufficient:
- Creation proof:
- Entropy / retirement impact:
- Decision: reuse-existing | add-with-proof | defer | reject | needs-first-principles-review
```

如果决策为 `reuse-existing`，则推荐复用路径，而不是创建新的表层。如果决策为 `add-with-proof`，则将相关证明、验证信号以及任何退役触发条件纳入设计/规格。

**产品风险视角：** 对于含糊不清的产品、功能、UI、工作流或架构选择，添加一个简洁的审查视角，而不是进行角色画像扮演：

```text
Product Risk Lens:
- Value:
- Non-goals:
- Trade-offs:
- Decision needed:
```

这是一个审查视角，而不是角色画像输出。它不会取代基线证据、已批准的需求或当前的权威文档；它只是在实施之前，使产品风险和决策点清晰可见。

**计划阶段复杂度检查：** 在为中等/高强度工作选择实施方向之前，检查可能涉及的所有者文件及其当前形态。这是一项提供建议性设计压力的检查，并非关卡，也不具备完成情况的裁定权。不要将其强加于微小的低风险编辑。

有关共享制品类别、压力信号解读以及超出预算时的处理方式，请参阅 `using-aegis/references/complexity-governance.md`。

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

**探索方案：** 提出 2-3 种方案，说明各自的权衡，并给出建议。明确范围边界：哪些内容包含在内、哪些延后处理、哪些应归属于其他位置。

在选择方案之前，对任何拟议的新表层使用 `Existence Check`。如果候选方向在存在性检查后仍会引入新的所有者、重复的所有者、回退机制、适配器、仅用于兼容性的载体、删除优先的问题、未经验证的假设或“长期稳定”的声明，则升级至 `first-principles-review` 及其 `Decision Hygiene Review`。不要将任一检查变成通用的设计仪式；一旦决策面得到梳理，即返回此工作流。

当核心决策涉及内部退役、保留兼容性还是持久化状态确认时，组合使用 `anti-entropy-governance`。它会对删除目标进行分类，选择 `delete-first | compat-exception |
confirmation-first`，并将破坏性操作的授权保留在设计技能之外。

当主要风险并非宽泛的策略问题，而是架构一致性问题时，应使用范围更窄的 `Architecture Integrity Lens`：例如规范所有者不明确、职责重叠、调用方存在回退逻辑、陈旧路径仍承载实际逻辑，或可能存在更高层级的所有者 / 契约 / 单一事实来源简化方案。该透镜应先回答不变量、规范所有者 / 契约、职责重叠、更高层级简化、退役条件 / 证伪条件以及结论，然后再推荐方案。

**既有实践与复用透镜：** 当候选方案会引入新机制、协议、工件形态或非平凡的交互模式时，应先考察经过验证的外部实践，而不是自行发明。这一透镜由具体行为触发：当该方向对项目而言较为新颖、经过内部复用检查后仍有多个可行方案，或相关领域超出当前仓库证据的覆盖范围时，应研究既有先例。对于已经能对应到公认框架模式的常规工作，不要走形式化的调研流程；也不要因为 Web / 搜索工具不可用而阻碍方案选择。

```text
Prior-Art & Reuse Lens:
- Searched precedents: <bounded sources; index-first summary; cite anchor per claim>
- Adopt verbatim: <proven pattern + source>
- Adapt with reason: <tailored part -> project constraint / non-negotiable it maps to>
- Reject with reason: <project fact that makes the pattern inapplicable>
- Degraded: <no web/search tooling -> external basis unknown; internal-only evidence stated>
```

搜索结果是候选证据，而不是提示词载荷：应采用索引优先的方式进行总结并引用锚点，而不是粘贴原始页面。没有可引用锚点的“行业标准”主张应保持为 `unknown`。每项调整 / 拒绝决策都必须绑定到明确命名的项目约束或事实，而不是个人偏好。该透镜仅为方案建议提供输入；它始终只起咨询作用，不授予任何完成权限。

**基线角色对齐：** 当一个问题可能同时涉及“应该构建什么”和“它应该位于何处”时，应将需求事实与架构事实分开：

```text
Baseline Role Alignment:
- Product / Requirement Baseline:
- Architecture / Runtime Boundary Baseline:
- Result: aligned | Design Defect | Implementation Drift | missing-authority | needs-clarification
- scope: requirements | architecture | both
- Next action:
```

当相关需求、设计或基线有误时，使用 `Design Defect`。当工作偏离正确且未发生变化的基线时，使用 `Implementation Drift`。`Architecture Defect` 和 `Architecture Drift` 仍分别作为架构范围内 `Design Defect` 和架构范围内 `Implementation Drift` 的兼容别名。这是一种审查透镜，而不是运行时门禁或完成权限。

**呈现设计：** 根据复杂度调整各节的篇幅。只涵盖重要的方面：架构、组件、数据流、错误处理、测试、兼容性边界。当需要决定行为、契约、架构或面向用户的流程时，应在实现前获得设计批准。

**ADR 信号：** 当设计/规范涉及持久性的架构层面时
（所有者、公共契约、工件形态、依赖方向、
事实来源、宿主兼容性、运行时就绪边界、回退机制、
适配器或退役计划），请标记 ADR 信号、来源引用、真实的
替代方案，以及预期的基线同步问题，以便后续补全。不要
根据尚未执行的想法创建已接受的架构记忆。

**为隔离性而设计：** 每个单元 = 一个明确的用途、定义清晰的接口，并且可独立测试。人们能否在不阅读内部实现的情况下理解它？你能否在不破坏使用方的情况下更改内部实现？

**现有代码库：** 遵循现有模式。仅当有助于实现当前目标时，才纳入有针对性的改进。如果设计涉及契约、兼容性、回退机制或重复的所有者 → 请直接指出。

## 设计探针

仅当探针能够改变设计方向，并且现有的
仓库证据不足时，才允许使用：

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

优先采用只读执行。一次性探针不得创建需要维护的
所有者、公共契约、兼容性承诺或隐藏的持久化路径。它是
设计证据，而不是交付的实现。

## 软件场景配置

仅应用相关的配置，而不是为每项任务加载所有视角：

- `greenfield-feature`：价值、最小可交付行为、最小所有者、
  验收标准、明确的未来非目标；
- `existing-system-change`：当前状态、目标状态、两者之间的
  差异、需要保留的不变量、调用方、迁移和退役；
- `refactor`：需要保留的可观察行为、所有者/耦合缺陷、依赖
  方向、旧路径退役、行为保留证据；
- `public-contract`：使用方、版本控制、优先级、错误、兼容性、
  迁移、负面情况；
- `persistence-migration`：数据所有者、模式演进、部分迁移、
  崩溃恢复、备份/回滚、读写切换；
- `ui-workflow`：用户旅程，以及加载/空白/错误/部分完成/成功/取消/
  重试状态、无障碍性、不可逆操作、恢复；
- `security-permission`：信任边界、攻击者能力、权限所有者、
  敏感数据、降级/撤销、安全失败、可审计性；
- `operational-release`：部署边界、可观测性、部分发布、
  回滚、兼容性窗口、运维人员恢复。

## 设计就绪与设计完成

在满足以下条件时，方案选择已就绪：

- 已知期望结果和主要场景；
- 范围和非目标已明确；
- 当前行为和目标差异已有依据；
- 已确定关键不变量和可能的规范所有者；
- 至少存在一个可观察的验收标准；
- 不存在仍可能改变方案类别的未决未知事项。

并非每个未知项都必须消除；只有会改变决策的未知项才会阻碍
收敛。

当所有适用条件均满足时，即可移交设计：

- 所选方案和权威负责人已明确；
- 固定行为/契约与由实现方决定的选择已分离；
- 已对替代方案进行实质性比较，或依据证据将其排除；
- 关键假设已有证据支持或已被明确接受；
- 在适用情况下，已涵盖失败/恢复及对使用方的影响；
- 验收标准可观察，并可供验证使用；
- 新增负责人、回退方案、适配器、兼容机制或持久化机制均有创建
  证明，并有退役/回滚处理方案；
- 每项由用户负责的决策都已获得用户的真实批准。

设计完成表示方法已准备就绪，而非拥有完成授权。仅当这些条件满足后才过渡到
writing-plans；不要将尚未解决且会改变决策的未知项带入计划。

## 设计之后

**文档：**

1. **Aegis 项目工作区初始化（仅首次创建时）：**
   如果 `docs/aegis/` 不存在，且已配置的 Aegis 工作区支持
   可用，则初始化目标项目：
   `python <aegis-workspace-helper> init --root <target-project-root>`。
   如果已安装的 Aegis 工作区支持不可用，则手动创建：
   a. 创建 `docs/aegis/README.md` — 描述工作区用途和结构
   b. 创建 `docs/aegis/INDEX.md` — 空索引，将在下文追加内容
   c. 使用下方 "BASELINE-GOVERNANCE.md Template" 一节中的模板创建
      `docs/aegis/BASELINE-GOVERNANCE.md`
   d. 如果项目已有代码，则创建初始基线快照：
      `docs/aegis/baseline/YYYY-MM-DD-initial-baseline.md`，使用下方的
      "Initial Baseline Snapshot Template"
   如果 `docs/aegis/` 已存在，则直接使用，不要重新创建。

2. **在需要时编写经过验证的规格产物：**
   使用能够稳定任务的最小产物：
   - 规格简报：`docs/aegis/specs/YYYY-MM-DD-<topic>-brief.md`，适用于在规划前
     需要明确事项/原因/验收标准的中型任务。
   - 设计规格：`docs/aegis/specs/YYYY-MM-DD-<topic>-design.md`，适用于高
     复杂度、架构、契约、迁移、跨模块或需要用户审查的模糊
     行为。
   规格始终放入 `specs/`，绝不放入 `work/`。`docs/aegis/work/`
   存放会话级草稿，而非项目文档；只有通过文档必要性关卡后，才将草稿提升到
   `specs/` 或 `plans/`。

3. **更新 INDEX.md：**
   优先使用已配置的 Aegis 工作区支持：`python <aegis-workspace-helper> append-index --root
   <target-project-root> --path docs/aegis/specs/<filename>.md --kind spec
   --title "<title>"`。如果工作区支持不可用，则手动将新的规格条目追加
   到 `docs/aegis/INDEX.md`。
   追加后，如果已配置的工作区支持可用，则运行 `python <aegis-workspace-helper> check --root
   <target-project-root>`。这仅验证结构和索引覆盖情况；并不授予完成授权。
   INDEX 记录规则：创建文档时登记文档；更新现有
   文档不会更改索引；取代或删除文档时
   更新索引。

4. 将设计文档提交到 git。

5. 当最新的 `TaskIntentDraft`、`BaselineReadSetHint`、
   `BaselineUsageDraft` 和 `ImpactStatementDraft` 对设计产生实质性影响时，
   将它们直接包含在正文中或附录中。

6. 明确记录非目标和兼容性边界，避免后续实施计划偏离方向。
7. 跨仓库变更：按每个仓库中的每个变更面分别做出决定；持久的
   跨仓库契约应作为 ADR 记录在归属仓库中，另一侧只记录其本地影响
   （镜像关系，不重复记录）。

**规范自审：**
编写完规范文档后，以全新的视角重新审视它：

1. **占位符扫描：** 是否存在任何“TBD”“TODO”、未完成的章节或含糊的要求？修正它们。
2. **内部一致性：** 是否有任何章节彼此矛盾？架构是否与功能描述一致？
3. **范围检查：** 范围是否足够聚焦，能够由单个实施计划完成，还是需要拆分？
4. **歧义检查：** 是否有任何要求可能产生两种不同的解释？如果有，选择其中一种并明确说明。
5. **边界检查：** 是否清楚标明了不变量、兼容性边界、归属方、非目标，
   以及后续完成情况回填所需的任何 ADR 信号？如果规范认可了一种高风险方案，
   请确认其中已反映 `first-principles-review` 的 `Decision Hygiene Review`
   或 `Architecture Integrity Lens` 结果，或者已明确标记为无需进行。

直接就地修正所有问题。无需再次审查——修正后继续推进即可。

**用户审查关卡：**
设计规范审查循环通过后，在继续之前，请用户审查已编写的规范：

> “规范已编写并提交到 `<path>`。请审查并告知我，在我们开始编写实施计划之前，您是否希望进行任何修改。”

当此工作流要求审查时，等待用户回复。如果用户要求修改，请完成修改并重新运行规范审查循环。只有在用户批准后才能继续。对于仅用于确定中型任务验收标准而创建的小型规范简报，除非项目规则要求正式的批准步骤，否则用户审查可以较为简洁。

**实施：**

- 调用 writing-plans 技能创建详细的实施计划
- 不要调用任何其他技能。下一步必须是 writing-plans。

## 关键原则

- **一次只问一个问题** - 不要用多个问题让用户不知所措
- **优先使用选择题** - 在可行时，选择题比开放式问题更容易回答
- **坚决遵循 YAGNI** - 从所有设计中移除不必要的功能
- **探索替代方案** - 在确定方案之前，始终提出 2～3 种方法
- **增量验证** - 展示设计并获得批准后再继续
- **保持灵活** - 当某些内容不合理时，返回并进一步澄清

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

创建第一个 `docs/aegis/baseline/YYYY-MM-DD-initial-baseline.md` 时：

应为项目建立双基线，而不是编写扁平的仓库清单。
首个基线应确保后续能够执行 `Baseline Role Alignment` 检查，
即使仓库仍处于早期阶段或尚未完整定义也是如此。

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
如果项目内容较少，应保持各节简短并明确标记权威信息缺口，
而不是进行猜测。