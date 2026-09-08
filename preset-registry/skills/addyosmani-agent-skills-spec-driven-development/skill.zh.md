---
name: spec-driven-development
description: Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when drafting a PRD or requirements document with objectives and scope, or when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
---
# 规范驱动开发

## 概览

在编写任何代码之前，先写一份结构化规范。规范是你和人类工程师之间共享的事实来源——它定义了我们在构建什么、为什么构建，以及如何判断它是否完成。没有规范就写代码，等于在猜。

## 适用场景

- 启动新项目或新功能时
- 需求存在歧义或不完整时
- 变更会影响多个文件或模块时
- 即将做出架构决策时
- 任务的实现时间会超过 30 分钟时

**不应使用的情况：** 单行修复、拼写更正，或需求明确且自包含的变更。

## 门控工作流

规范驱动开发分为四个阶段，前面有一个范围检查（第 0 阶段），仅在一次请求包含多个可独立测试的能力时才启用。不要在当前阶段验证完成之前进入下一阶段。

```
SPECIFY ──→ PLAN ──→ TASKS ──→ IMPLEMENT
   │          │        │          │
   ▼          ▼        ▼          ▼
 Human      Human    Human      Human
 reviews    reviews  reviews    reviews
```

### 第 0 阶段：范围检查

大多数请求只描述一种能力。如果这次请求就是这种情况，跳过此阶段，直接进入 Specify —— 第 0 阶段是为例外情况准备的，不是默认流程，并且它不对单一能力功能设置任何层级。

**识别方式。** 如果一个请求把多个可独立测试的能力捆绑在一起，就先拆解再指定：

- 需求列出了不同的能力，它们各自有自己的使用方或数据（例如：身份、计费、通知、报告）
- 验收标准可以分成几组，而且这些组可以分别交付和验证
- 某个能力可以被删掉或替换，而不会重写其他能力的要求

**在编写任何规范之前先给出能力映射。** 这个映射要小而可审阅——一个模块表加上构建顺序，而不是项目计划：

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

- **稳定的模块 id。** 使用 kebab-case，一旦选定，在整个计划中不要改名。规范、计划以及后续命令都要按这些 id 选取工作，而不是猜当前激活的是哪个规范。
- **依赖方向单向，不允许循环。** 箭头只能朝一个方向。如果两个模块彼此都需要对方，那它们其实是同一个模块。
- **接口定义在边界处。** 映射里记录的是 `billing` 依赖 `identity`；它们之间的契约应写在提供方模块的规范里（见 `api-and-interface-design` 以设计它）。

这个映射和其他阶段一样需要门控。人类先审查模块边界、依赖方向和构建顺序，然后才能编写任何模块规范。把映射弄错代价很高；审查十行字并不高。

**然后按模块递归。** 按依赖顺序对每个模块执行 Specify → Plan → Tasks → Implement。每个模块都要有自己的 spec，范围限定在该模块的目标、边界和成功标准内。将已批准的 map 保存在项目根目录，并将每个模块的 spec 也放在其旁边，按模块 id 命名（`SPEC-identity.md`、`SPEC-billing.md`）——以 map，而不是文件名猜测，作为现有内容的索引。

### Phase 1: Specify

从高层愿景开始。向人类提出澄清问题，直到需求足够具体。

**立即暴露假设。** 在编写任何 spec 内容之前，先列出你正在做出的假设：

```
ASSUMPTIONS I'M MAKING:
1. This is a web application (not native mobile)
2. Authentication uses session-based cookies (not JWT)
3. The database is PostgreSQL (based on existing Prisma schema)
4. We're targeting modern browsers only (no IE11)
→ Correct me now or I'll proceed with these.
```

不要悄悄地用模糊需求自行补全。spec 的全部目的就是在写代码之前暴露误解——假设是最危险的误解形式。

**编写一份涵盖以下六个核心领域的 spec 文档：**

1. **Objective** — 我们在构建什么，为什么要做？用户是谁？成功是什么样子？

2. **Commands** — 带完整可执行命令和参数，而不只是工具名称。
   ```
   Build: npm run build
   Test: npm test -- --coverage
   Lint: npm run lint --fix
   Dev: npm run dev
   ```

3. **Project Structure** — 源代码放在哪里，测试放在哪里，文档放在哪里。
   ```
   src/           → Application source code
   src/components → React components
   src/lib        → Shared utilities
   tests/         → Unit and integration tests
   e2e/           → End-to-end tests
   docs/          → Documentation
   ```

4. **Code Style** — 一个真实的代码片段，比三段描述更能体现你的风格。包括命名约定、格式化规则，以及良好输出的示例。

5. **Testing Strategy** — 使用什么框架，测试放在哪里，覆盖率期望是什么，以及不同关注点对应哪些测试层级。

6. **Boundaries** — 三层系统：
   - **Always do:** 在提交前运行测试，遵循命名约定，校验输入
   - **Ask first:** 数据库 schema 变更、添加依赖、修改 CI 配置
   - **Never do:** 提交密钥、编辑 vendor 目录、未经批准移除失败测试

**Spec template:**

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

**将需求重构为成功标准。** 当收到模糊需求时，把它转化为具体条件：

```
REQUIREMENT: "Make the dashboard faster"

REFRAMED SUCCESS CRITERIA:
- Dashboard LCP < 2.5s on 4G connection
- Initial data load completes in < 500ms
- No layout shift during load (CLS < 0.1)
→ Are these the right targets?
```

这样你就可以围绕明确目标进行循环、重试和问题求解，而不是猜测“更快”到底是什么意思。

### 阶段 2：计划

在验证后的规格基础上，生成技术实现计划：

1. 识别主要组件及其依赖关系
2. 确定实现顺序（什么必须先构建）
3. 标注风险及缓解策略
4. 识别哪些可以并行构建，哪些必须串行
5. 在各阶段之间定义验证检查点

> 遵循 `planning-and-task-breakdown` 中关于依赖图映射和垂直切片机制的说明；它是权威来源。上面的要点只是轻量级摘要；如果二者有任何不一致，以 `planning-and-task-breakdown` 为准。
>
> **输出约定：** 将计划保存到 `tasks/plan.md`，并将任务列表记录到 `planning-and-task-breakdown` 中定义的任务列表目标（默认是 `tasks/todo.md`；项目也可能指定外部跟踪器）。如果 `tasks/` 不存在，请创建它。后续命令（如 `/build`）依赖这些默认值。

计划应该是可审阅的：人类应当能够读完后说“是的，这就是正确的方法”，或者“不是，把 X 改掉”。

### 阶段 3：任务

将计划拆分为离散、可执行的任务：

- 每个任务都应能在一次专注的会话中完成
- 每个任务都有明确的验收标准
- 每个任务都包含验证步骤（测试、构建、人工检查）
- 任务按依赖关系排序，而不是按感知上的重要性排序
- 任何任务都不应要求修改超过约 5 个文件

> 遵循 `planning-and-task-breakdown` 中关于任务粒度和依赖排序的完整说明；它是权威来源。下面的模板只是一个轻量级的内联格式；如果二者有任何不一致，以 `planning-and-task-breakdown` 为准。

**任务模板：**
```markdown
- [ ] Task: [Description]
  - Acceptance: [What must be true when done]
  - Verify: [How to confirm — test command, build, manual check]
  - Files: [Which files will be touched]
```

### 阶段 4：实施

一次执行一个任务，遵循 `skills/incremental-implementation/SKILL.md`（`incremental-implementation`）和 `skills/test-driven-development/SKILL.md`（`test-driven-development`）。使用 `skills/context-engineering/SKILL.md`（`context-engineering`）在每一步加载正确的规格章节和源文件，而不是把整个规格都灌给模型。

## 保持规格的生命力

规格是一个活文档，而不是一次性产物：

- **当决策改变时更新** —— 如果你发现数据模型需要变更，先更新规格，再实施。
- **当范围变化时更新** —— 新增或删减的功能都应反映到规格中。
- **将规格纳入版本控制** —— 规格应与代码一起保存在版本控制中。
- **在 PR 中引用规格** —— 将每个 PR 实现的部分链接回规格中的相应章节。

## 常见合理化借口

| 合理化借口 | 现实 |
|---|---|
| “这很简单，我不需要规格说明” | 简单任务不需要*很长的*规格说明，但仍然需要验收标准。两行规格说明也可以。 |
| “我会在写完代码后再写规格说明” | 那是文档，不是规格说明。规格说明的价值在于迫使你在编码*之前*明确需求。 |
| “规格说明会拖慢我们的进度” | 15 分钟的规格说明可以避免数小时的返工。15 分钟的瀑布式工作流胜过 15 小时的调试。 |
| “需求反正还会变” | 所以规格说明应该是一份持续演进的文档。过时的规格说明仍然胜过没有规格说明。 |
| “用户知道自己想要什么” | 即使请求很明确，也存在隐含假设。规格说明可以将这些假设暴露出来。 |
| “这是一个大功能；拆分它只是增加开销” | 如果验收标准聚集成可独立测试的组，那么单体规格说明会迫使所有后续任务都围绕完整契约进行推理。十行的能力映射是成本低廉的替代方案。 |
| “我会在规划阶段进行拆解” | 规划是在规格说明内部切分任务。到那时，过大的产物已经存在了——模块边界和依赖方向必须在编写规格说明之前决定，而不是之后。 |

## 红旗

- 在没有任何书面需求的情况下开始编写代码
- 在明确“完成”的含义之前询问“我应该直接开始构建吗？”
- 实现任何规格说明或任务列表中都未提及的功能
- 做出架构决策却不记录
- 因为“要构建什么显而易见”而跳过规格说明
- 一份规格说明中的需求横跨多个可独立测试的能力
- 因为事先没有批准能力映射，而在实现过程中隐式决定模块边界或构建顺序

## 验证

在继续实现之前，确认：

- [ ] 规格说明涵盖全部六个核心领域
- [ ] 人工审阅者已经审阅并批准规格说明
- [ ] 成功标准具体且可测试
- [ ] 已定义边界（Always/Ask First/Never）
- [ ] 规格说明已保存到仓库中的文件
- [ ] 如果请求包含多个可独立测试的能力，则在编写任何模块规格说明之前，已经批准能力映射（模块 id、依赖方向、构建顺序）
- [ ] 每份模块规格说明都能追溯到已批准映射中的模块 id