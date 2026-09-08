---
name: incremental-implementation
description: Delivers changes incrementally in thin, verifiable slices. Use when implementing any feature or change that touches more than one file, or when picking up the next task from a plan. Use when rolling a change out behind a feature flag, when you're about to write a large amount of code at once, or when a task feels too big to land in one step.
---
# 增量式实现

## 概述

以薄的垂直切片进行构建——实现一小块，测试它，验证它，然后再扩展。避免一次性实现整个功能。每次增量都应让系统保持在可运行、可测试的状态。这种执行纪律能让大型功能变得可管理。

## 何时使用

- 实现任何多文件变更
- 基于任务拆解构建新功能
- 重构现有代码
- 任何时候你想在测试之前写超过约 100 行代码

**何时不使用：** 单文件、单函数且范围已经很小的变更。

## 增量循环

```
┌──────────────────────────────────────┐
│                                      │
│   Implement ──→ Test ──→ Verify ──┐  │
│       ▲                           │  │
│       └───── Commit ◄─────────────┘  │
│              │                       │
│              ▼                       │
│          Next slice                  │
│                                      │
└──────────────────────────────────────┘
```

对于每个切片：

1. **实现** 最小的完整功能块
2. **测试** — 运行测试套件（如果没有测试套件，则编写测试）
3. **验证** — 确认该切片按预期工作（测试通过、构建成功、手动检查）
4. **提交** -- 用描述性的提交信息保存进度（关于原子提交指导，见 `git-workflow-and-versioning`）
5. **进入下一个切片** — 继续推进，不要重新开始

## 切片策略

### 垂直切片（首选）

构建一条完整的端到端路径：

```
Slice 1: Create a task (DB + API + basic UI)
    → Tests pass, user can create a task via the UI

Slice 2: List tasks (query + API + UI)
    → Tests pass, user can see their tasks

Slice 3: Edit a task (update + API + UI)
    → Tests pass, user can modify tasks

Slice 4: Delete a task (delete + API + UI + confirmation)
    → Tests pass, full CRUD complete
```

每个切片都交付可用的端到端功能。

### 契约优先切片

当后端和前端需要并行开发时：

```
Slice 0: Define the API contract (types, interfaces, OpenAPI spec)
Slice 1a: Implement backend against the contract + API tests
Slice 1b: Implement frontend against mock data matching the contract
Slice 2: Integrate and test end-to-end
```

### 风险优先切片

先处理风险最高或最不确定的部分：

```
Slice 1: Prove the WebSocket connection works (highest risk)
Slice 2: Build real-time task updates on the proven connection
Slice 3: Add offline support and reconnection
```

如果 Slice 1 失败，你会在投入 Slice 2 和 Slice 3 之前发现这一点。

## 实施规则

### 规则 0：简洁优先

在写任何代码之前，先问：**“最简单可行的东西是什么？”**

写完代码后，按以下检查项审视它：
- 这能用更少的行数完成吗？
- 这些抽象是否值得它们的复杂度？
- 资深工程师看了会不会说“你为什么不直接……？”
- 我是在为假想的未来需求构建，还是在解决当前任务？

```text
SIMPLICITY CHECK:
✗ Generic EventBus with middleware pipeline for one notification
✓ Simple function call

✗ Abstract factory pattern for two similar components
✓ Two straightforward components with shared utilities

✗ Config-driven form builder for three forms
✓ Three form components
```

三行相似的代码，胜过一个过早的抽象。先实现朴素、显然正确的版本。只有在通过测试证明正确性之后，才去优化。

### Rule 0.5: Scope Discipline

只触及任务所要求的内容。

不要：
- 为一个通知去做一个带中间件管线的“通用 EventBus”
- 改动与你的更改无关的相邻代码
- 重构你没有在修改的文件中的导入
- 删除你没完全理解的注释
- 因为“看起来有用”就添加不在规格里的功能
- 现代化你只是读取的文件中的语法

如果你注意到作用域之外但值得改进的内容，不要修改，只记录下来：

```text
NOTICED BUT NOT TOUCHING:
- src/utils/format.ts has an unused import (unrelated to this task)
- The auth middleware could use better error messages (separate task)
→ Want me to create tasks for these?
```

### Rule 1: One Thing at a Time

每个增量只改变一件逻辑上的事。不要混在一起。

**坏做法：** 一个提交同时添加新组件、重构现有组件并更新构建配置。

**好做法：** 三个独立提交——每个改动对应一个。

### Rule 2: Keep It Compilable

每个增量之后，项目都必须能够构建，现有测试也必须通过。不要让代码库在中间步骤处于损坏状态。

### Rule 3: Feature Flags for Incomplete Features

如果某个功能还没准备好给用户使用，但你需要分批合并增量：

```typescript
// Feature flag for work-in-progress
const ENABLE_TASK_SHARING = process.env.FEATURE_TASK_SHARING === 'true';

if (ENABLE_TASK_SHARING) {
  // New sharing UI
}
```

这样你就可以把小增量合并到主分支，同时不暴露未完成的工作。

### Rule 4: Safe Defaults

新代码应默认采用安全、保守的行为：

```typescript
// Safe: disabled by default, opt-in
export function createTask(data: TaskInput, options?: { notify?: boolean }) {
  const shouldNotify = options?.notify ?? false;
  // ...
}
```

### Rule 5: Rollback-Friendly

每个增量都应该能独立回滚：

- 添加性的改动（新文件、新函数）最容易回滚
- 对现有代码的修改应尽量小而聚焦
- 数据库迁移应有对应的回滚迁移
- 不要在一个提交里先删除某物再用另一个东西替换它——应分成两个提交

## Working with Agents

当你指示一个 agent 逐步实现时：

```text
"Let's implement Task 3 from the plan.

Start with just the database schema change and the API endpoint.
Don't touch the UI yet — we'll do that in the next increment.

After implementing, run the repository's test and build commands to
verify nothing is broken."
```

明确说明每个增量的范围，以及**不**包含什么。

## Increment Checklist

每完成一个增量后，使用仓库自身的命令进行验证（见 test-driven-development skill 的 `Discover the Stack First` 部分）：

- [ ] 该更改只做一件事，并且把这件事完整做好
- [ ] 所有现有测试仍然通过（仓库的测试命令：`npm test`、`./gradlew test`、`pytest`，等等）
- [ ] 构建成功（仓库的构建命令）
- [ ] 类型检查通过，如果技术栈包含这一项（`npx tsc --noEmit`、`mypy`，等等）
- [ ] 代码检查通过（仓库的 lint 命令）
- [ ] 新功能按预期工作
- [ ] 该更改已使用描述性的提交信息提交

**注意：** 在每次可能影响某项验证的更改之后，都要运行对应的验证命令。某个命令一旦成功执行，除非代码发生了变化，否则不要重复运行相同的命令——在未变更的代码上再次运行不会带来任何新信息。

## 常见借口

| 借口 | 现实 |
|---|---|
| “我会等到最后一次性全测” | 缺陷会层层累积。第 1 个切片里的 bug 会让第 2-5 个切片都不对。每个切片都要测试。 |
| “一次做完更快” | 直到出问题、而你又在 500 行改动里找不到是哪一处导致的之前，感觉上确实更快。 |
| “这些改动太小了，不值得单独提交” | 小提交几乎没有成本。大提交会掩盖 bug，也让回滚更痛苦。 |
| “我之后再加 feature flag” | 如果功能还不完整，就不应该对用户可见。现在就把 flag 加上。 |
| “这次重构很小，可以顺手一起做” | 把重构和功能混在一起，会让两者都更难审查和调试。分开做。 |
| “让我再快速把这个也加上” | 这会扩大范围。 |
| “为了更快，跳过测试/验证步骤吧” | 这会引入问题。 |
| “在增量之间构建或测试坏掉了” | 先修复它。 |
| “未提交的改动越积越多” | 立即提交。 |
| “先搭抽象吧” | 直到第三个用例提出明确需求之前，都不要这么做。 |
| “我顺手把任务范围外的文件也改了” | 不要这么做。 |
| “创建新的工具文件，只为做一次性的操作” | 不要这么做。 |
| “在没有任何中间代码变更的情况下，连续两次运行同一个 build/test 命令” | 没有意义。 |

## 验证

在完成某个任务的所有增量之后：

- [ ] 每个增量都已单独测试并提交
- [ ] 整个测试套件通过
- [ ] 构建干净
- [ ] 功能按指定要求端到端正常工作
- [ ] 没有未提交的更改

## 另请参见

按增量验证是本地检查。在宣布任务完成之前，把项目范围的 Definition of Done 作为最后一道门槛，这是每个增量都必须达到的持续标准，无论任务是什么。参见 `../../references/definition-of-done.md`。