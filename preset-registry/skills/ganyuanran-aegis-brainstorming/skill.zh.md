---
name: brainstorming
description: "Use when defining ambiguous or high-complexity new features, product behavior, UI/component design, architecture choices, contract changes, or when grilling/pressure-testing a plan or design. Routine small requests stay on the fast path."
---
<EXPLICIT-MODE-GATE>
如果激活模式为显式模式（`~/.config/aegis/config.toml` 中包含
`activation_mode = "explicit"`，或环境中可见 `AEGIS_ACTIVATION_MODE=explicit`），
且当前用户请求未按名称显式调用 Aegis 或此技能，则返回快速路径：简洁作答，
无需执行此工作流的检查清单、仪式或文档要求。如果用户显式提及了 Aegis 或此技能，
则正常继续。
</EXPLICIT-MODE-GATE>

# 执行

→ 直接盘问或对计划/设计进行压力测试？→ 进入下方的`盘问模式`。仅有温和的质疑意图？→ 使用其单行模式确认。在访谈期间，不要开始常规设计产物、文档撰写、任务规划或实现。
→ 新功能、产品行为、UI/组件设计、架构/契约变更，或模糊的中高复杂度工作？→ **先设计。在所需设计/规范获得批准前，不得实现。**
  1. 探索项目上下文 → 阅读权威文档，检查现有模式
  2. 每次提出一个澄清问题（优先使用多项选择）
  3. 提出 2-3 种方案，说明权衡并给出你的建议
  4. 分节呈现设计 → 每节之后获得用户批准
  5. 编写规范 → 自我审查 → 用户审查 → 转入编写计划
→ 硬性门禁：对于符合此技能的任务，在设计/规范批准要求得到满足之前，切勿编写代码、搭建项目脚手架或调用实现类技能。

# 将头脑风暴中的想法转化为设计

通过自然的协作式对话，帮助将想法转化为完整的设计和规范。

首先理解当前项目上下文和权威边界，然后每次提出一个问题来逐步完善想法。理解要构建的内容后，呈现能够使工作稳定下来的最小设计产物，并获得所需批准。

<HARD-GATE>
对于符合此技能的工作，在你呈现所需的设计/规范并按此工作流的要求获得用户批准之前，切勿调用任何实现类技能、编写任何代码、搭建任何项目脚手架或采取实现行动。
</HARD-GATE>

## 盘问模式

### 模式优先级

盘问模式激活期间，它会覆盖常规的头脑风暴执行流程。在用户退出访谈之前，暂停`Checklist`、`The Process`、`Compact output contract`以及所有文档或设计转换要求；仍须保留禁止实现的硬性门禁。

### 盘问模式进入信号

- **直接：**用户要求盘问或审问某个想法、计划或设计，或明确要求进行压力测试。直接表述包括`grill me`、`grill this plan`、`审问我`、`盘问我`和`拷问我`。立即进入该模式。
- **温和：**用户要求质疑假设、查找漏洞、进行红队测试，或针对某个想法、计划或设计草案表示“别顺着我”。只询问：`Grill or normal brainstorming?` 仅在确认后进入该模式。
- **非盘问：**仅仅提及或按字面使用相关短语，或者请求审查 PR、差异或当前代码。正常解释字面短语；将实现审查转交给`requesting-code-review`。

### 开场卡片

用户进入该模式后，用用户的语言输出一次以下内容，然后开始访谈：

```text
◆ Grilling Session
Target: <idea / plan / design>
Question path: value -> boundaries -> failure modes -> acceptance
Pace: deep (default) | fast (user-requested)
```

### 节奏

- **深入：** 当某个决策问题会阻塞后续流程或依赖前一个回答时，每轮只问一个。等待用户回答前，先说明建议的答案和最相关的权衡。
- **快速：** 仅当用户明确要求快速或批量访谈时（例如 `fast`、`batch`、`快问` 或 `一次问几个`），最多询问三个相互独立的决策问题。为每个问题给出建议和权衡，然后等待用户回答。对于存在依赖关系的后续问题，恢复为深入节奏。

1. 提问前，先探索代码库和当前的权威文档以获取事实。不要向用户询问可从本地找到的事实。
2. 决策权归用户所有。不要将建议、暂定答案或共同理解检查点视为最终批准。
3. 除了一次性的开场卡片外，每轮仅保留观察、建议以及所选节奏对应的问题。访谈进行期间，不要输出完整的设计流程、编写文档、创建计划或进行实现。
4. 当用户表示停止、推迟或问题已经足够时，结束访谈。总结已确认的决策、假设、未解决的问题以及下一项可选步骤。该总结并不授予完成工作的权限。
5. 如果用户要求在访谈结束后继续，则返回正常的头脑风暴设计门禁流程。设计/规格在进入规划或实现之前，仍需获得规定的批准。

## 转向其他流程 / 文档必要性门禁

不要将此工作流强加给低复杂度工作。微小的
措辞修改、单一负责人负责的缺陷修复、简单的配置/状态问题、局部
实用工具变更或机械式的多文件变更，都可以通过简明的
意图说明、基线检查、TDD/调试和验证来推进，而无须创建任何新
文档。在编写任何规格、计划、ADR 或
基线制品之前，先执行文档必要性门禁：

1. 是否已有规格/计划/ADR/基线覆盖此次变更范围？
   -> 就地更新该归属文档；绝不要创建同级文档。
2. 此范围是否具有持久性/不可逆性（架构、公共 API、负责人、依赖
   方向、迁移、兼容路径退役）、涉及跨会话/跨人员
   交接、受批准门禁约束或需要权威依据？
   -> 是：为该范围编写最小制品（参见“文档”）。
   -> 否：不编写文档；将精简草稿保留在当前会话中。
3. 在编辑时和收尾时重新检查；如果不确定性或影响增大，则升级为能够稳定局面的
   最小规格。

## 检查清单

你必须为以下每一项创建任务，并按顺序完成：

1. **探索项目上下文** — 检查文件、文档、近期提交、权威
   文档，并被动吸收相关生效的 `CONTEXT.md` 表述，而不加载主动
   建模
2. **选择路径和范围** — 是真正的设计？还是诊断？据此转向相应流程，或先进行拆分
3. **提出澄清问题** — 每次只问一个，理解目的/约束/成功标准
4. **起草工作制品** — `TaskIntentDraft`、`BaselineReadSetHint`、`BaselineUsageDraft`、`ImpactStatementDraft`
5. **添加新表面时执行存在性检查** — 仅当某种方案新增负责人、技能、制品、适配器、回退机制、工作流步骤或基准指标时
6. **提出 2-3 种方案** — 说明权衡并给出你的建议
7. **呈现设计** — 根据复杂度分节呈现，并在需要时获得用户批准
8. **编写规格制品** — 仅在通过文档必要性门禁，且没有现有的归属规格/计划覆盖该范围后进行；如果已有覆盖，则更新该文档，而不是创建同级文档
9. **规格自审** — 检查占位符、矛盾、歧义、范围和边界
10. **用户审阅书面规格** — 在继续之前，请用户进行审阅
11. **转入实现阶段** — 调用 writing-plans 技能（终止状态）

**终端状态正在调用 writing-plans。** 不要调用任何其他实现技能。

## 流程

**理解构想：**
- 首先检查当前项目状态（文件、文档、近期提交）
- 在提出深入问题之前，先阅读相关的权威文档
- 在问题、选项、场景和规范中使用现有的规范术语。
  如果术语已经明确或存在冲突，请编写
  `establishing-project-context`；不要只在规范中解决这一问题。
- 如果请求是诊断、根因分析或已批准计划的后续工作 → 转入正确的工作流
- 如果请求横跨多个相互独立的子系统 → 先标记并拆分
- 每次提出一个澄清问题，优先使用多项选择题
- 在探索过程中区分事实、假设和未知事项

**工作产物：** 维护四份草稿：`TaskIntentDraft`（成果、目标、
成功证据、停止条件、非目标、范围、风险）、
`BaselineReadSetHint`（候选文档、权威依据缺口）、
`BaselineUsageDraft`（必需的参考资料、可选的已交付上下文参考资料、
计划前已确认的参考资料、已引用的参考资料、缺失的参考资料、建议性决策），
以及 `ImpactStatementDraft`（受影响的层、负责人、不变量、兼容性、
非目标）。范围发生变化时进行更新。

**紧凑输出约定：** `Aegis Visibility`、`TaskIntentDraft`、`BaselineReadSetHint`、
`BaselineUsageDraft`、`Requirement Ready Check`、`ImpactStatementDraft`、
`Existence Check`、`Product Risk Lens`、`Architecture Integrity Lens`、
`Baseline Role Alignment`、`Plan-Time Complexity Check`、`Options` 和
`Decision Needed`。在扩展为完整设计结构之前，先使用这种紧凑形式。

此工作流中的 `Aegis Visibility` 用于说明为什么设计/规范澄清必须先于实现，
以及这种克制能降低哪些偏移、过度构建、负责人错误或缺失验收标准的风险。
应使其表述自然且针对具体任务；不要将其变成固定的技能跟踪记录。

当设计方向依赖特定基线文档或当前权威参考资料时，使用紧凑的 `BaselineUsageDraft`：

```text
BaselineUsageDraft:
- Required baseline refs:
- Delivered context refs:
- Acknowledged before plan refs:
- Cited in design refs:
- Missing refs:
- Decision: continue | needs-baseline-readback | needs-verification | pause-for-user | blocked
```

`Delivered context refs` 只是可选的、由宿主投射的记录信息。它并不能作为权威证据，
证明宿主已注入上下文负载，或模型已在内部使用该负载。此产物的作用是在推荐或批准设计之前，
让对基线/上下文的注意力偏移变得可见。

当需求尚未得到确认且不完整时，在推荐设计之前使用紧凑的 `Requirement Ready Check`：

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

在项目权威来源确认之前，应将任务意图、对话、源文档和智能体推断视为候选需求来源。如果决策不是 `ready`，请将设计保持在提案/规格澄清层面；不要将缺口转化为实施任务。

**存在性检查：** 在推荐会新增所有者、技能、制品、主机适配器、回退机制、兼容路径、工作流步骤或基准指标的方法之前，请先检查其是否有存在的必要。以 `docs/current/AEGIS_MINIMALITY_REFERENCE.md` 作为参考。对于复用现有所有者和制品的普通功能设计，不要强制执行此检查。

```text
Existence Check:
- Proposed new surface:
- Existing owner / reuse candidate:
- Why existing surface is insufficient:
- Creation proof:
- Entropy / retirement impact:
- Decision: reuse-existing | add-with-proof | defer | reject | needs-first-principles-review
```

如果决策为 `reuse-existing`，请推荐复用路径，而不是新增承载面。如果决策为 `add-with-proof`，请将相关证明、验证信号和任何退役触发条件纳入设计/规格。

**产品风险视角：** 对于存在歧义的产品、功能、UI、工作流或架构选择，请添加一个精简的评审视角，而不是进行角色扮演：

```text
Product Risk Lens:
- Value:
- Non-goals:
- Trade-offs:
- Decision needed:
```

这是一个评审视角，而不是角色输出。它不会取代基准证据、已批准的需求或当前权威文档；它只是在实施前明确呈现产品风险和决策点。

**规划阶段复杂度检查：** 在为中等/高工作量任务选择实施方向之前，请检查可能涉及的所有者文件及其当前形态。这是一项提供设计压力提示的建议性检查，不是门禁，也不是完成情况的权威判据。不要对微小的低风险编辑强制执行此检查。

有关共享制品类别、压力信号解读和超出预算时的处理方式，请参阅 `using-aegis/references/complexity-governance.md`。

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

**探索方案：** 提出 2-3 种方案，说明各自的权衡并给出建议。明确范围边界：哪些内容包含在内、哪些延后处理、哪些应归属其他位置。

在选择方案之前，对任何拟议的新承载面执行 `Existence Check`。如果候选方向在存在性检查后仍会引入新所有者、重复所有者、回退机制、适配器、仅用于兼容性的载体、删除优先问题、未经验证的假设或“长期稳定”声明，请升级至 `first-principles-review` 及其 `Decision Hygiene Review`。不要将任一检查变成通用的设计仪式；决策面厘清后，应返回此工作流。

当核心决策涉及内部退役、保留兼容性或持久化状态确认时，组合使用 `anti-entropy-governance`。它会对
删除目标进行分类，选择 `delete-first | compat-exception |
confirmation-first`，并将破坏性操作权限置于设计 Skill 之外。

当主要风险并非宽泛的策略问题，而是架构一致性问题时，请使用范围更窄的 `Architecture Integrity Lens`：
规范所有者不明确、职责重叠、调用方回退、陈旧路径仍承载实际逻辑，或可能存在更高层级的
所有者 / 契约 / 单一事实来源简化方案。在推荐方案之前，该透镜应回答以下问题：
不变量、规范所有者 / 契约、职责重叠、更高层级的简化、退役 / 证伪条件以及结论。

**基线角色对齐：** 当一个问题可能同时涉及“应该构建什么”和“它应该位于何处”时，
应将需求事实与架构事实分开：

```text
Baseline Role Alignment:
- Product / Requirement Baseline:
- Architecture / Runtime Boundary Baseline:
- Result: aligned | Design Defect | Implementation Drift | missing-authority | needs-clarification
- scope: requirements | architecture | both
- Next action:
```

当相关需求、设计或基线有误时，使用 `Design Defect`。
当工作偏离正确且未发生变化的基线时，使用 `Implementation Drift`。
`Architecture Defect` 和 `Architecture Drift` 仍分别作为架构范围内
`Design Defect` 和架构范围内 `Implementation Drift` 的兼容别名。
这是一种评审透镜，而不是运行时门禁或完成状态的裁定机制。

**呈现设计：** 根据复杂度调整章节规模。只涵盖重要的方面：架构、组件、数据流、错误处理、测试、兼容性边界。当需要决定行为、契约、架构或面向用户的流程时，应在实施前获得设计批准。

**ADR 信号：** 当设计/规范涉及持久性的架构方面
（所有者、公共契约、制品形态、依赖方向、
单一事实来源、宿主兼容性、运行时就绪边界、回退、
适配器或退役计划）时，应标记 ADR 信号、来源引用、真实的
替代方案，以及预期后续完成的基线同步问题。不要根据尚未执行的构想
创建已接受的架构记忆。

**为隔离性而设计：** 每个单元 = 一个明确的用途、定义清晰的接口、可独立测试。是否有人无需阅读内部实现就能理解它？是否可以在不破坏使用方的情况下更改内部实现？

**现有代码库：** 遵循现有模式。仅在针对性改进服务于当前目标时才将其纳入设计。如果设计涉及契约、兼容性、回退或重复所有者 → 请直接指出。

## 设计完成后

**文档：**

1. **Aegis 项目工作区初始化（仅首次创建时）：**
   如果 `docs/aegis/` 不存在，并且已配置的 Aegis 工作区支持
   可用，则初始化目标项目：
   `python <aegis-workspace-helper> init --root <target-project-root>`。
   如果已安装的 Aegis 工作区支持不可用，则手动创建：
   a. 创建 `docs/aegis/README.md` — 描述工作区的用途和结构
   b. 创建 `docs/aegis/INDEX.md` — 空索引，将在下方追加内容
   c. 根据下方的 "BASELINE-GOVERNANCE.md Template" 章节创建
      `docs/aegis/BASELINE-GOVERNANCE.md`
   d. 如果项目已有代码，则使用下方的
      "Initial Baseline Snapshot Template" 创建初始基线快照：
      `docs/aegis/baseline/YYYY-MM-DD-initial-baseline.md`
   如果 `docs/aegis/` 已存在，则直接使用它 — 不要重新创建。

2. **需要时编写经过验证的规格产物：**
   使用能够稳定任务的最小产物：
   - 规格简报：`docs/aegis/specs/YYYY-MM-DD-<topic>-brief.md`，适用于在规划前需要明确内容、原因和验收标准的中等规模
     任务。
   - 设计规格：`docs/aegis/specs/YYYY-MM-DD-<topic>-design.md`，适用于高
     复杂度、架构、契约、迁移、跨模块或存在歧义且
     需要用户审查的行为。
   规格始终存放在 `specs/` 中——绝不能存放在 `work/` 中。`docs/aegis/work/`
   保存会话级草稿，而非项目文档；只有通过文档必要性门禁后，才能将草稿提升至
   `specs/` 或 `plans/`。

3. **更新 INDEX.md：**
   优先使用已配置的 Aegis 工作区支持：`python <aegis-workspace-helper> append-index --root
   <target-project-root> --path docs/aegis/specs/<filename>.md --kind spec
   --title "<title>"`。如果工作区支持不可用，则手动将新的规格条目追加到
   `docs/aegis/INDEX.md`。
   追加后，如果已配置工作区支持，则运行 `python <aegis-workspace-helper> check --root
   <target-project-root>`。这仅验证
   结构和索引覆盖情况；它不授予完成权限。
   INDEX 记录规则：创建文档时登记该文档；更新现有
   文档不会更改索引；取代或删除文档时
   更新索引。

4. 将设计文档提交到 git。

5. 当最新的 `TaskIntentDraft`、`BaselineReadSetHint`、
   `BaselineUsageDraft` 和 `ImpactStatementDraft` 对设计产生实质影响时，
   将其直接包含在正文中或放入附录。

6. 明确记录非目标和兼容性边界，以免后续实施计划偏离方向。
7. 跨仓库变更：按每个仓库的各个变更面分别决策；持久的
   跨仓库契约应作为 ADR 记录在其归属仓库中，另一
   侧仅记录其本地影响（镜像关系，不重复记录）。

**规格自审：**
编写规格文档后，以全新的视角审视它：

1. **占位符扫描：** 是否存在任何“TBD”“TODO”、未完成的章节或模糊的要求？修复它们。
2. **内部一致性：** 是否有任何章节相互矛盾？架构是否与功能描述一致？
3. **范围检查：** 范围是否足够聚焦，可由单个实施计划完成，还是需要拆分？
4. **歧义检查：** 是否有任何要求可能被以两种不同方式解读？如果有，选择一种并明确说明。
5. **边界检查：** 是否已明确标注不变量、兼容性
   边界、负责人、非目标，以及后续补全完成记录所需的任何 ADR 信号？
   如果规格认可一种高风险方案，请确认已反映
   `first-principles-review` 的 `Decision Hygiene Review` 或 `Architecture
   Integrity Lens` 结果，或者明确标注其没有必要。

直接修复所有问题。无需重新审查——修复后继续即可。

**用户审查门禁：**
设计规格通过审查循环后，请用户审查已编写的规格，然后再继续：

> “规格已编写并提交至 `<path>`。请审阅，并告诉我在开始编写实施计划之前是否需要进行任何更改。”

当此工作流要求审阅时，请等待用户回复。如果用户要求更改，请进行修改并重新运行规格审阅循环。只有在用户批准后才能继续。对于仅用于明确中型任务验收标准的小型规格简报，除非项目规则要求正式审批步骤，否则用户审阅可以很简短。

**实施：**

- 调用 writing-plans skill 创建详细的实施计划
- 不要调用任何其他 skill。下一步是 writing-plans。

## 关键原则

- **一次只问一个问题** - 不要用多个问题让用户不知所措
- **首选多项选择** - 在可行的情况下，这比开放式问题更容易回答
- **坚决遵循 YAGNI** - 从所有设计中移除不必要的功能
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

创建第一个 `docs/aegis/baseline/YYYY-MM-DD-initial-baseline.md` 时：

应初始化项目的双重基线，而不是编写扁平化的仓库清单。
即使仓库仍处于早期阶段或仅完成部分定义，首个基线也应支持后续执行 `Baseline Role Alignment` 检查。

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

不要将首个引导基线压缩成通用的 10 字段检查清单。
如果项目信息较少，请保持各节简短并明确标注权威信息缺口，而不要进行猜测。