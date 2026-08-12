---
name: spec-driven-development
description: Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea.
---
# 规范驱动开发

## 概述

在编写任何代码之前，先编写结构化规范。规范是你与人类工程师之间共享的事实来源——它定义了我们要构建什么、为什么构建，以及如何判断工作已经完成。没有规范就编写代码无异于猜测。

## 何时使用

- 启动新项目或开发新功能
- 需求含糊或不完整
- 变更涉及多个文件或模块
- 即将做出架构决策
- 任务的实现时间将超过 30 分钟

**不应使用的情况：** 单行修复、拼写错误修正，或需求明确且自包含的变更。

## 分阶段门控工作流

规范驱动开发分为四个阶段。在当前阶段得到验证之前，不要进入下一阶段。

```
SPECIFY ──→ PLAN ──→ TASKS ──→ IMPLEMENT
   │          │        │          │
   ▼          ▼        ▼          ▼
 Human      Human    Human      Human
 reviews    reviews  reviews    reviews
```

### 阶段 1：制定规范

从高层愿景开始。向人类提出澄清问题，直到需求变得具体明确。

**立即明确假设。** 在编写任何规范内容之前，列出你所做的假设：

```
ASSUMPTIONS I'M MAKING:
1. This is a web application (not native mobile)
2. Authentication uses session-based cookies (not JWT)
3. The database is PostgreSQL (based on existing Prisma schema)
4. We're targeting modern browsers only (no IE11)
→ Correct me now or I'll proceed with these.
```

不要默默补全含糊不清的需求。规范的全部目的，就是在编写代码*之前*暴露误解——而假设是最危险的误解形式。

**编写一份涵盖以下六个核心领域的规范文档：**

1. **目标**——我们要构建什么，为什么要构建？用户是谁？成功是什么样的？

2. **命令**——提供包含参数的完整可执行命令，而不只是工具名称。
   ```
   Build: npm run build
   Test: npm test -- --coverage
   Lint: npm run lint --fix
   Dev: npm run dev
   ```

3. **项目结构**——源代码存放在哪里、测试放在哪里、文档归档在哪里。
   ```
   src/           → Application source code
   src/components → React components
   src/lib        → Shared utilities
   tests/         → Unit and integration tests
   e2e/           → End-to-end tests
   docs/          → Documentation
   ```

4. **代码风格**——一个展示实际风格的代码片段，胜过三段文字描述。应包括命名约定、格式化规则以及良好输出的示例。

5. **测试策略**——使用什么框架、测试存放在哪里、覆盖率要求，以及不同关注点分别采用哪些测试层级。

6. **边界**——三级体系：
   - **始终执行：** 提交前运行测试、遵循命名约定、验证输入
   - **先询问：** 更改数据库架构、添加依赖项、修改 CI 配置
   - **绝不执行：** 提交机密信息、编辑供应商目录、未经批准删除失败的测试

**规范模板：**

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

**将指令重新表述为成功标准。** 收到模糊的需求时，将其转化为具体条件：

```
REQUIREMENT: "Make the dashboard faster"

REFRAMED SUCCESS CRITERIA:
- Dashboard LCP < 2.5s on 4G connection
- Initial data load completes in < 500ms
- No layout shift during load (CLS < 0.1)
→ Are these the right targets?
```

这样，你就可以围绕一个明确的目标进行循环、重试和问题求解，而不是猜测“更快”意味着什么。

### 阶段 2：规划

基于已验证的规范，生成技术实施计划：

1. 识别主要组件及其依赖关系
2. 确定实施顺序（必须先构建什么）
3. 记录风险和缓解策略
4. 识别哪些内容可以并行构建，哪些必须按顺序进行
5. 定义各阶段之间的验证检查点

> 有关这些步骤背后的依赖关系图映射和垂直切片机制，请遵循 `planning-and-task-breakdown`；它是权威来源。以上要点只是简要概述；如果两者存在任何分歧，以 `planning-and-task-breakdown` 为准。
>
> **输出约定：** 按照 `/plan` 命令约定，将计划保存到 `tasks/plan.md`，并将任务列表保存到 `tasks/todo.md`。如果 `tasks/` 不存在，请创建它。下游命令（`/build` 等）依赖这些路径。

计划应当可以接受审查：人类应该能够阅读它，并说“是的，这种方法是正确的”或“不，请修改 X”。

### 阶段 3：任务

将计划拆分为离散、可实施的任务：

- 每项任务都应当能够在一次专注的工作会话中完成
- 每项任务都有明确的验收标准
- 每项任务都包含一个验证步骤（测试、构建、手动检查）
- 任务按依赖关系排序，而不是按主观认定的重要性排序
- 任何任务都不应要求修改超过约 5 个文件

> 有关完整的任务规模划分和依赖顺序安排机制，请遵循 `planning-and-task-breakdown`；它是权威来源。下面的模板是一个轻量级内联形式；如果两者存在任何分歧，以 `planning-and-task-breakdown` 为准。

**任务模板：**
```markdown
- [ ] Task: [Description]
  - Acceptance: [What must be true when done]
  - Verify: [How to confirm — test command, build, manual check]
  - Files: [Which files will be touched]
```

### 阶段 4：实施

按照 `skills/incremental-implementation/SKILL.md`（`incremental-implementation`）和 `skills/test-driven-development/SKILL.md`（`test-driven-development`），每次执行一项任务。使用 `skills/context-engineering/SKILL.md`（`context-engineering`）在每一步加载正确的规范章节和源文件，而不是将整个规范一股脑地塞给智能体。

## 保持规格说明持续有效

规格说明是一份持续演进的文档，而非一次性产物：

- **决策变更时更新** — 如果你发现数据模型需要更改，应先更新规格说明，然后再实现。
- **范围变更时更新** — 新增或移除的功能都应反映在规格说明中。
- **提交规格说明** — 规格说明应与代码一起纳入版本控制。
- **在 PR 中引用规格说明** — 链接到每个 PR 所实现的规格说明章节。

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “这很简单，我不需要规格说明” | 简单的任务不需要*冗长的*规格说明，但仍然需要验收标准。两行的规格说明也完全可以。 |
| “我会在写完代码后再写规格说明” | 那是文档记录，而不是规格说明。规格说明的价值在于迫使你在编写代码*之前*明确需求。 |
| “规格说明会拖慢我们的进度” | 花 15 分钟编写规格说明，可以避免数小时的返工。15 分钟的瀑布式规划，胜过 15 小时的调试。 |
| “反正需求也会变化” | 这正是规格说明需要持续演进的原因。即使规格说明已经过时，也仍然好过完全没有规格说明。 |
| “用户知道自己想要什么” | 即使请求很明确，也会包含隐含的假设。规格说明可以揭示这些假设。 |

## 危险信号

- 在没有任何书面需求的情况下开始编写代码
- 在明确“完成”的含义之前就询问“我是不是应该直接开始构建？”
- 实现任何规格说明或任务列表中均未提及的功能
- 在未记录的情况下做出架构决策
- 因为“要构建什么显而易见”而跳过规格说明

## 验证

在开始实现之前，请确认：

- [ ] 规格说明涵盖全部六个核心领域
- [ ] 人工审核并批准了规格说明
- [ ] 成功标准具体且可测试
- [ ] 已定义边界（Always/Ask First/Never）
- [ ] 规格说明已保存到代码仓库中的文件里