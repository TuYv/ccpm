---
name: spec-driven-development
description: Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when drafting a PRD or requirements document with objectives and scope, or when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
---
# 规范驱动开发

## 概述

在编写任何代码之前，先编写结构化规范。规范是你与人类工程师之间共享的事实来源，它定义了我们要构建什么、为什么构建，以及如何判断它已经完成。没有规范的代码就是猜测。

## 何时使用

- 开始一个新项目或功能
- 需求模糊或不完整
- 变更涉及多个文件或模块
- 即将进行架构决策
- 任务实现预计需要超过 30 分钟

**何时不使用：** 单行修复、拼写更正，或需求明确且自包含的变更。

## 分阶段门控工作流

规范驱动开发包含四个阶段，前面有一个范围检查（阶段 0）。只有当一项请求包含多个可独立测试的能力时，才会启用范围检查。当前阶段未完成验证前，不要进入下一阶段。

```
SPECIFY ──→ PLAN ──→ TASKS ──→ IMPLEMENT
   │          │        │          │
   ▼          ▼        ▼          ▼
 Human      Human    Human      Human
 reviews    reviews  reviews    reviews
```

### 阶段 0：范围检查

大多数请求只描述一项能力。如果当前请求属于这种情况，则跳过此阶段，直接进入 Specify。阶段 0 只为例外情况存在，不应对单能力功能设置层级。

**检测。** 如果一项请求包含多个可独立测试的能力，则在编写规范之前进行分解：

- 需求列出了具有各自消费者或数据的不同能力（例如身份、计费、通知、报表）
- 验收标准聚集成多个组，而这些组可以分别发布和验证
- 某项能力可以被删减或替换，而无需重写其他能力的需求

**在编写任何规范之前，先提出能力映射。** 保持小巧且便于评审：只需要模块表和构建顺序，不需要项目计划：

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

- **稳定的模块 id。** 使用 kebab-case，并在整个计划中只选择一次，期间不得重命名。规范、计划和下游命令应使用这些 id 选择工作，而不是猜测当前生效的是哪个规范。
- **依赖方向，不得形成环。** 箭头只能指向一个方向。如果两个模块互相需要对方，则它们应合并为一个模块。
- **接口位于边界处。** 映射记录 `billing` 依赖 `identity`；两者之间的契约应归属于提供方模块的规范（设计该契约时请参阅 `api-and-interface-design`）。

**该映射也需要经过阶段门控，和每个阶段一样。** 在编写任何模块规范之前，由人类评审模块边界、依赖方向和构建顺序。映射错误的代价很高，而评审十行内容并不困难。

**然后按模块递归执行。** 按依赖顺序，为每个模块运行 Specify → Plan → Tasks → Implement。每个模块都有自己的 spec，范围限定为该模块的目标、边界和成功标准。将经批准的映射保存到项目根目录，并将每个模块的 spec 与其放在一起，按模块 ID 命名（`SPEC-identity.md`、`SPEC-billing.md`）——映射表，而不是通过猜测文件名，才是现有内容的索引。

### 阶段 1：Specify

从高层愿景开始。在需求具体明确之前，持续向人类提出澄清问题。

**立即说明假设。** 在写入任何 spec 内容之前，列出你所做的假设：

```
ASSUMPTIONS I'M MAKING:
1. This is a web application (not native mobile)
2. Authentication uses session-based cookies (not JWT)
3. The database is PostgreSQL (based on existing Prisma schema)
4. We're targeting modern browsers only (no IE11)
→ Correct me now or I'll proceed with these.
```

不要默默填补含糊的需求。spec 的全部目的，就是在编写代码之前暴露误解——假设是最危险的误解形式。

**编写一份涵盖以下六个核心领域的 spec 文档：**

1. **目标** —— 我们要构建什么以及为什么构建？用户是谁？成功是什么样的？

2. **命令** —— 提供带完整参数的可执行命令，而不只是工具名称。
   ```
   Build: npm run build
   Test: npm test -- --coverage
   Lint: npm run lint --fix
   Dev: npm run dev
   ```

3. **项目结构** —— 源代码存放在哪里，测试放在哪里，文档应该放在哪里。
   ```
   src/           → Application source code
   src/components → React components
   src/lib        → Shared utilities
   tests/         → Unit and integration tests
   e2e/           → End-to-end tests
   docs/          → Documentation
   ```

4. **代码风格** —— 一段真实的代码示例胜过三段对代码风格的描述。包括命名约定、格式化规则，以及良好输出的示例。

5. **测试策略** —— 使用什么框架，测试存放在哪里，覆盖率要求是什么，以及哪些关注点应使用哪些测试级别。

6. **边界** —— 三层体系：
   - **始终执行：** 提交前运行测试、遵循命名约定、验证输入
   - **先询问：** 修改数据库 schema、添加依赖、修改 CI 配置
   - **绝不执行：** 提交机密信息、编辑 vendor 目录、未经批准移除失败的测试

**Spec 模板：**

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

**外部规范工具：** 此工作流与格式无关。如果项目已经使用 OpenSpec 或其他规范系统，请保留该系统的工件格式和存储约定，而不要创建重复的 `SPEC.md`。此技能负责澄清、内容和审批门禁；外部工具负责规定已批准规范的表示方式。

**将指令重新表述为成功标准。** 收到模糊需求时，将其转化为具体条件：

```
REQUIREMENT: "Make the dashboard faster"

REFRAMED SUCCESS CRITERIA:
- Dashboard LCP < 2.5s on 4G connection
- Initial data load completes in < 500ms
- No layout shift during load (CLS < 0.1)
→ Are these the right targets?
```

这样，你就可以围绕明确目标循环、重试并解决问题，而不必猜测“更快”具体意味着什么。

### 阶段 2：规划

根据已验证的规范，生成技术实施计划：

1. 确定主要组件及其依赖关系
2. 确定实施顺序（哪些内容必须先构建）
3. 记录风险及缓解策略
4. 确定哪些内容可以并行构建，哪些内容必须按顺序进行
5. 定义各阶段之间的验证检查点

> 遵循 `planning-and-task-breakdown`，了解这些步骤背后的依赖图映射和垂直切片机制；它是规范来源。如果上述要点与其存在任何差异，以 `planning-and-task-breakdown` 为准。
>
> **输出约定：** 将计划保存到 `tasks/plan.md`，并将任务列表记录在 `planning-and-task-breakdown` 定义的任务列表目标文件中（默认为 `tasks/todo.md`；项目也可以指定外部跟踪工具）。如果 `tasks/` 不存在，则创建它。后续命令（如 `/build`）默认依赖这些路径。

计划应当便于评审：人类应该能够阅读计划并说“是的，这是正确的方法”，或者说“不行，需要修改 X”。

### 阶段 3：任务

将计划拆分为离散、可实施的任务：

- 每个任务应能在一次专注的工作会话中完成
- 每个任务都有明确的验收标准
- 每个任务都包含验证步骤（测试、构建或手动检查）
- 任务应按依赖关系排序，而不是按主观重要性排序
- 每个任务不应要求修改超过约 5 个文件

> 遵循 `planning-and-task-breakdown`，了解完整的任务规模和依赖排序机制；它是规范来源。下面的模板是轻量级内联形式；如果两者存在任何差异，以 `planning-and-task-breakdown` 为准。

**任务模板：**
```markdown
- [ ] Task: [Description]
  - Acceptance: [What must be true when done]
  - Verify: [How to confirm — test command, build, manual check]
  - Files: [Which files will be touched]
```

### 阶段 4：实施

按照 `skills/incremental-implementation/SKILL.md`（`incremental-implementation`）和 `skills/test-driven-development/SKILL.md`（`test-driven-development`）逐个执行任务。使用 `skills/context-engineering/SKILL.md`（`context-engineering`）在每一步加载正确的规范章节和源文件，而不是将整份规范全部加载给代理。

## 保持规范持续有效

规范是一份持续演进的文档，而不是一次性产物：

- **决策发生变化时更新** — 如果发现数据模型需要变更，先更新规范，再实现。
- **范围发生变化时更新** — 新增或删减的功能都应反映在规范中。
- **提交规范** — 规范应与代码一起纳入版本控制。
- **在 PR 中引用规范** — 链接到每个 PR 所实现的规范章节。

## 常见的合理化借口

| 合理化借口 | 事实 |
|---|---|
| “这很简单，不需要规范” | 简单任务不需要*冗长*的规范，但仍然需要验收标准。两行规范也可以。 |
| “我写完代码后再写规范” | 那是文档，不是规范。规范的价值在于迫使你在编码之前明确需求。 |
| “规范会拖慢我们的进度” | 15 分钟的规范可以避免数小时的返工。15 分钟的瀑布式流程胜过 15 小时的调试。 |
| “反正需求还会变化” | 这正是规范应当持续演进的原因。一份过时的规范仍然胜过没有规范。 |
| “用户知道自己想要什么” | 即使需求很明确，也存在隐含假设。规范能够暴露这些假设。 |
| “这是一个大型功能；拆分它只会增加工作量” | 如果验收标准聚集成多个可以独立测试的组，单体规范会迫使所有后续任务都围绕完整契约进行推理。十行的能力地图是成本低廉的替代方案。 |
| “我会在规划阶段拆解” | 规划是在规范内部切分任务。到那时，过大的产物已经存在了——模块边界和依赖方向必须在编写规范之前决定，而不是之后。 |

## 警示信号

- 在没有任何书面需求的情况下开始编写代码
- 在明确“完成”的含义之前询问“我是不是应该直接开始构建？”
- 实现任何规范或任务列表中未提及的功能
- 在没有记录的情况下做出架构决策
- 因为“要构建什么显而易见”而跳过规范
- 一份规范的需求跨越多个可以独立测试的能力
- 因为事先没有批准能力地图，而在实现过程中才隐式决定模块边界或构建顺序

## 验证

开始实现之前，确认：

- [ ] 规范涵盖全部六个核心领域
- [ ] 人工审核者已经审阅并批准规范
- [ ] 成功标准具体且可测试
- [ ] 已定义边界（Always/Ask First/Never）
- [ ] 规范已保存到仓库中的文件
- [ ] 如果请求包含多个可以独立测试的能力，则在编写任何模块规范之前，已经批准能力地图（模块 id、依赖方向、构建顺序）
- [ ] 每份模块规范都能追溯到已批准地图中的模块 id