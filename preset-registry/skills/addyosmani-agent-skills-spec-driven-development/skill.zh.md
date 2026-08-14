---
name: spec-driven-development
description: Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
---
# 规范驱动开发

## 概述

在编写任何代码之前，先编写一份结构化规范。规范是你与人类工程师之间共享的唯一事实来源——它定义了我们要构建什么、为什么要构建，以及如何确认工作已经完成。没有规范就编写代码等同于猜测。

## 何时使用

- 启动新项目或新功能时
- 需求含糊不清或不完整时
- 变更涉及多个文件或模块时
- 即将做出架构决策时
- 任务的实现时间预计超过 30 分钟时

**不应使用的情况：** 单行修复、拼写错误修正，或需求明确且自包含的变更。

## 分阶段审核工作流

规范驱动开发包含四个阶段。在此之前还有范围检查（阶段 0），仅当一个请求捆绑了多项可独立测试的能力时才会启用。在当前阶段通过验证之前，不要进入下一阶段。

```
SPECIFY ──→ PLAN ──→ TASKS ──→ IMPLEMENT
   │          │        │          │
   ▼          ▼        ▼          ▼
 Human      Human    Human      Human
 reviews    reviews  reviews    reviews
```

### 阶段 0：范围检查

大多数请求只描述一项能力。如果当前请求也是如此，请跳过此阶段，直接进入规范制定阶段——阶段 0 是为例外情况而设，而非常规步骤，并且不会为单一能力的功能强加层级结构。

**识别。** 当单项需求捆绑了多项可独立测试的能力时，应先进行拆分，再编写规范：

- 需求中明确提到多项不同的能力，且各自拥有自己的使用者或数据（例如身份、计费、通知、报告）
- 验收标准可以划分成若干组，每组都可以独立发布和验证
- 移除或替换其中一项能力时，无需重写其他能力的需求

**在编写任何规范之前，先提出一份能力图。** 它应当小巧且便于审核——只需包含模块表和构建顺序，而不是一份项目计划：

```markdown
# Capability Map: [Initiative Name]

| Module id | Responsibility | Depends on |
|---|---|---|
| identity | Accounts, sessions, SSO | — |
| billing | Plans, invoices, payments | identity |
| notifications | Email and webhook fan-out | identity |
| reporting | Usage dashboards | billing, notifications |

Build order: identity → billing, notifications → reporting
```

- **稳定的模块 ID。** 使用 kebab-case，确定后便不再更改，也绝不在计划执行过程中重命名。规范、计划和下游命令通过这些 ID 选择工作内容，而不是猜测当前正在使用哪份规范。
- **依赖方向明确且无循环。** 箭头只指向一个方向。如果两个模块彼此依赖，那么它们实际上应当是同一个模块。
- **接口位于边界处。** 能力图记录 `billing` 依赖 `identity`；两者之间的契约应归入提供方模块的规范（有关契约设计，请参阅 `api-and-interface-design`）。

**能力图与其他所有阶段一样，也必须经过审核。** 在编写任何模块规范之前，人类需要审核模块边界、依赖方向和构建顺序。能力图一旦出错，代价高昂；而审核十行内容并不昂贵。

**然后按模块递归执行。** 按依赖顺序为每个模块依次执行 Specify → Plan → Tasks → Implement。每个模块都有自己的规格说明，其范围限定为该模块的目标、边界和成功标准。将已批准的映射文件保存在项目根目录，并将每个模块的规格说明放在它旁边，以模块 id 命名（`SPEC-identity.md`、`SPEC-billing.md`）——已有内容应以映射文件为索引，而不是靠猜测文件名。

### 阶段 1：明确规格

从高层愿景开始。持续向用户提出澄清问题，直到需求变得具体明确。

**立即明确假设。** 在编写任何规格内容之前，列出你的假设：

```
ASSUMPTIONS I'M MAKING:
1. This is a web application (not native mobile)
2. Authentication uses session-based cookies (not JWT)
3. The database is PostgreSQL (based on existing Prisma schema)
4. We're targeting modern browsers only (no IE11)
→ Correct me now or I'll proceed with these.
```

不要默默补全含糊不清的需求。规格说明的全部目的，就是在编写代码*之前*暴露误解——假设是最危险的误解形式。

**编写一份涵盖以下六个核心领域的规格文档：**

1. **目标**——我们要构建什么，为什么要构建？用户是谁？成功是什么样的？

2. **命令**——提供包含参数的完整可执行命令，而不仅仅是工具名称。
   ```
   Build: npm run build
   Test: npm test -- --coverage
   Lint: npm run lint --fix
   Dev: npm run dev
   ```

3. **项目结构**——源代码放在哪里、测试放在哪里、文档放在哪里。
   ```
   src/           → Application source code
   src/components → React components
   src/lib        → Shared utilities
   tests/         → Unit and integration tests
   e2e/           → End-to-end tests
   docs/          → Documentation
   ```

4. **代码风格**——一个展示代码风格的真实代码片段，胜过三段文字描述。包括命名约定、格式化规则和良好输出的示例。

5. **测试策略**——使用什么框架、测试放在哪里、覆盖率要求，以及不同关注点分别采用哪些测试层级。

6. **边界**——三级体系：
   - **始终执行：** 提交前运行测试、遵循命名约定、验证输入
   - **先询问：** 数据库架构变更、添加依赖项、更改 CI 配置
   - **绝不执行：** 提交密钥、编辑供应商目录、未经批准删除失败的测试

**规格模板：**

```markdown
# Spec: [Project/Feature Name]

## Objective
[What we're building and why. User stories or acceptance criteria.]

## Tech Stack
[Framework, language, key dependencies with versions]

## Commands
[Build, test, lint, dev — full commands]

## Project Structure
[Directory layout with descriptions]

## Code Style
[Example snippet + key conventions]

## Testing Strategy
[Framework, test locations, coverage requirements, test levels]

## Boundaries
- Always: [...]
- Ask first: [...]
- Never: [...]

## Success Criteria
[How we'll know this is done — specific, testable conditions]

## Open Questions
[Anything unresolved that needs human input]
```

**将指令重构为成功标准。** 收到模糊需求时，将其转化为具体条件：

```
REQUIREMENT: "Make the dashboard faster"

REFRAMED SUCCESS CRITERIA:
- Dashboard LCP < 2.5s on 4G connection
- Initial data load completes in < 500ms
- No layout shift during load (CLS < 0.1)
→ Are these the right targets?
```

这样，你就可以围绕明确的目标进行循环、重试和问题解决，而不是猜测“更快”究竟意味着什么。

### 阶段 2：规划

基于已验证的规范，生成技术实施计划：

1. 识别主要组件及其依赖关系
2. 确定实施顺序（必须先构建什么）
3. 记录风险及缓解策略
4. 确定哪些内容可以并行构建，哪些必须按顺序进行
5. 定义各阶段之间的验证检查点

> 有关这些步骤背后的依赖关系图映射和垂直切片机制，请遵循 `planning-and-task-breakdown`；它是规范来源。以上要点仅为简要概述；如果两者存在分歧，以 `planning-and-task-breakdown` 为准。
>
> **输出约定：** 将计划保存到 `tasks/plan.md`，并将任务列表记录到 `planning-and-task-breakdown` 定义的任务列表目标中（默认为 `tasks/todo.md`；项目也可以指定外部跟踪器）。如果 `tasks/` 不存在，请创建它。下游命令（`/build` 等）会使用这些默认位置。

计划应当可供评审：人类应该能够阅读它，并判断“是的，这种方法正确”或“不，请修改 X”。

### 阶段 3：任务

将计划拆分为离散且可实施的任务：

- 每个任务都应能在一次专注的工作会话中完成
- 每个任务都有明确的验收标准
- 每个任务都包含一个验证步骤（测试、构建、手动检查）
- 任务按依赖关系排序，而不是按主观重要性排序
- 任何任务需要修改的文件都不应超过约 5 个

> 有关完整的任务规模划分和依赖关系排序机制，请遵循 `planning-and-task-breakdown`；它是规范来源。以下模板是一种轻量级的内联形式；如果两者存在分歧，以 `planning-and-task-breakdown` 为准。

**任务模板：**
```markdown
- [ ] Task: [Description]
  - Acceptance: [What must be true when done]
  - Verify: [How to confirm — test command, build, manual check]
  - Files: [Which files will be touched]
```

### 阶段 4：实施

按照 `skills/incremental-implementation/SKILL.md`（`incremental-implementation`）和 `skills/test-driven-development/SKILL.md`（`test-driven-development`），逐个执行任务。在每个步骤中，使用 `skills/context-engineering/SKILL.md`（`context-engineering`）加载相关的规范章节和源文件，而不是将整个规范一股脑地提供给智能体。

## 让规范保持鲜活

规范是一份持续演进的文档，而不是一次性产物：

- **决策变化时更新** — 如果你发现数据模型需要更改，请先更新规范，然后再实施。
- **范围变化时更新** — 新增或删减的功能都应反映在规范中。
- **提交规范** — 规范应与代码一起纳入版本控制。
- **在 PR 中引用规范** — 链接回每个 PR 所实施的规范章节。

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “这很简单，我不需要规格说明” | 简单的任务不需要*冗长的*规格说明，但仍然需要验收标准。两行的规格说明就可以。 |
| “我会在编码完成后再写规格说明” | 那是文档，不是规格说明。规格说明的价值在于迫使你在编码*之前*厘清问题。 |
| “规格说明会拖慢我们的进度” | 花 15 分钟编写规格说明，可以避免数小时的返工。用 15 分钟走一遍瀑布式流程，胜过花 15 小时调试。 |
| “反正需求还是会变” | 所以规格说明才应该是一份动态更新的文档。过时的规格说明仍然好过没有规格说明。 |
| “用户知道自己想要什么” | 即使是明确的请求，也包含隐含的假设。规格说明能让这些假设显现出来。 |
| “这就是一个大功能；拆分它只会增加开销” | 如果验收标准可以归为若干可独立测试的组，那么单体式规格说明会迫使每个下游任务都对整个约定进行推理。用十行写一份能力地图，才是成本更低的替代方案。 |
| “我会在规划阶段进行拆分” | 规划是在规格说明内部拆分任务。到那时，过大的产物已经存在——模块边界和依赖方向必须在编写规格说明之前确定，而不是之后。 |

## 危险信号

- 在没有任何书面需求的情况下开始编写代码
- 在澄清“完成”的含义之前，就询问“我是不是直接开始构建就行？”
- 实现任何规格说明或任务列表中都未提及的功能
- 在不记录相关决定的情况下做出架构决策
- 因为“要构建什么显而易见”而跳过规格说明
- 一份规格说明中的需求横跨多个可独立测试的能力
- 由于未预先批准能力地图，导致模块边界或构建顺序在实现过程中被隐式决定

## 验证

在继续实现之前，请确认：

- [ ] 规格说明涵盖全部六个核心领域
- [ ] 人类已经审阅并批准规格说明
- [ ] 成功标准具体且可测试
- [ ] 已定义边界（Always/Ask First/Never）
- [ ] 规格说明已保存到代码仓库中的文件
- [ ] 如果请求包含多个可独立测试的能力，则在编写任何模块规格说明之前，能力地图（模块 id、依赖方向、构建顺序）已获批准
- [ ] 每份模块规格说明都可追溯到已批准地图中的某个模块 id