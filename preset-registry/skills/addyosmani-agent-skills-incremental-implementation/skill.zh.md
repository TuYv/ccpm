---
name: incremental-implementation
description: Delivers changes incrementally. Use when implementing any feature or change that touches more than one file. Use when you're about to write a large amount of code at once, or when a task feels too big to land in one step.
---
# 增量式实现

## 概述

以轻量的垂直切片逐步构建——实现一个部分，进行测试，验证结果，然后再扩展。避免一次性实现整个功能。每次增量都应使系统保持在可运行、可测试的状态。正是这种执行纪律让大型功能变得易于管理。

## 何时使用

- 实现任何涉及多个文件的变更
- 根据任务拆解构建新功能
- 重构现有代码
- 任何你想在测试前编写超过约 100 行代码的时候

**何时不应使用：** 范围已经足够小的单文件、单函数变更。

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

1. **实现** 最小且完整的功能部分
2. **测试**——运行测试套件（如果没有测试，则编写一个）
3. **验证**——确认该切片按预期工作（测试通过、构建成功、手动检查无误）
4. **提交**——使用描述清晰的消息保存进度（有关原子提交的指导，请参阅 `git-workflow-and-versioning`）
5. **进入下一个切片**——延续当前成果，不要重新开始

## 切片策略

### 垂直切片（首选）

构建一条贯穿整个技术栈的完整路径：

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

当前端和后端需要并行开发时：

```
Slice 0: Define the API contract (types, interfaces, OpenAPI spec)
Slice 1a: Implement backend against the contract + API tests
Slice 1b: Implement frontend against mock data matching the contract
Slice 2: Integrate and test end-to-end
```

### 风险优先切片

首先处理风险最高或最不确定的部分：

```
Slice 1: Prove the WebSocket connection works (highest risk)
Slice 2: Build real-time task updates on the proven connection
Slice 3: Add offline support and reconnection
```

如果 Slice 1 失败，你会在投入 Slice 2 和 Slice 3 之前发现问题。

## 实现规则

### 规则 0：简单优先

在编写任何代码之前，先问自己：“能够奏效的最简单方案是什么？”

编写代码后，按照以下检查项对其进行审查：
- 能否用更少的代码行实现？
- 这些抽象是否值得其带来的复杂性？
- 资深工程师看到后是否会说“为什么不直接……”？
- 我是在为假设中的未来需求构建，还是在为当前任务构建？

```
SIMPLICITY CHECK:
✗ Generic EventBus with middleware pipeline for one notification
✓ Simple function call

✗ Abstract factory pattern for two similar components
✓ Two straightforward components with shared utilities

✗ Config-driven form builder for three forms
✓ Three form components
```

三行相似的代码优于过早的抽象。首先实现朴素且显然正确的版本。只有在通过测试证明其正确性后再进行优化。

### 规则 0.5：范围纪律

只改动任务要求的内容。

不要：
- “清理”与你的改动相邻的代码
- 重构你并未修改的文件中的导入
- 删除你没有完全理解的注释
- 因为规范中未包含的功能“看起来有用”就添加它们
- 对你只是阅读的文件进行语法现代化改造

如果你发现任务范围之外有值得改进之处，请记录下来——不要修复它：

```
NOTICED BUT NOT TOUCHING:
- src/utils/format.ts has an unused import (unrelated to this task)
- The auth middleware could use better error messages (separate task)
→ Want me to create tasks for these?
```

### 规则 1：一次只做一件事

每个增量只更改一项逻辑内容。不要混合不同关注点：

**错误：** 一个提交同时添加新组件、重构现有组件并更新构建配置。

**正确：** 三个独立的提交——每项更改各一个。

### 规则 2：保持可编译

每个增量完成后，项目都必须能够构建，并且现有测试必须通过。不要让代码库在各个切片之间处于损坏状态。

### 规则 3：为未完成功能使用功能开关

如果某项功能尚未准备好提供给用户，但你需要合并多个增量：

```typescript
// Feature flag for work-in-progress
const ENABLE_TASK_SHARING = process.env.FEATURE_TASK_SHARING === 'true';

if (ENABLE_TASK_SHARING) {
  // New sharing UI
}
```

这样，你就可以将小增量合并到主分支，而不会暴露未完成的工作。

### 规则 4：安全默认值

新代码应默认采用安全、保守的行为：

```typescript
// Safe: disabled by default, opt-in
export function createTask(data: TaskInput, options?: { notify?: boolean }) {
  const shouldNotify = options?.notify ?? false;
  // ...
}
```

### 规则 5：便于回滚

每个增量都应该可以独立还原：

- 增量式更改（新文件、新函数）易于还原
- 对现有代码的修改应保持最小且聚焦
- 数据库迁移应有对应的回滚迁移
- 避免在同一个提交中删除某项内容并替换它——应将它们分开

## 与代理协作

当指导代理以增量方式实现时：

```
"Let's implement Task 3 from the plan.

Start with just the database schema change and the API endpoint.
Don't touch the UI yet — we'll do that in the next increment.

After implementing, run the repository's test and build commands to
verify nothing is broken."
```

明确说明每个增量范围内包含什么，以及不包含什么。

## 增量检查清单

每完成一个增量后，使用仓库自身的命令进行验证（参见 test-driven-development 技能中的“先识别技术栈”一节）：

- [ ] 此变更只做一件事，并且完整地实现了它
- [ ] 所有现有测试仍然通过（仓库的测试命令：`npm test`、`./gradlew test`、`pytest`……）
- [ ] 构建成功（使用仓库的构建命令）
- [ ] 如果技术栈支持类型检查，则类型检查通过（`npx tsc --noEmit`、`mypy`……）
- [ ] 代码检查通过（使用仓库的代码检查命令）
- [ ] 新功能按预期工作
- [ ] 使用描述清晰的消息提交了此变更

**注意：** 每次变更可能影响某项验证时，都要运行相应的验证命令。成功运行后，除非代码此后发生了变化，否则不要重复运行同一命令——在代码未变的情况下重新运行不会提供任何新信息。

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我会在最后统一测试” | 缺陷会层层累积。增量 1 中的缺陷会导致增量 2-5 全部出错。逐个测试每个增量。 |
| “一次全部完成更快” | 这*感觉上*更快，直到某处出错，而你无法从 500 行变更中找出是哪一行导致的。 |
| “这些变更太小了，没必要分别提交” | 小提交没有成本。大提交会掩盖缺陷，并让回滚变得痛苦。 |
| “我之后再添加功能开关” | 如果功能尚未完成，就不应该对用户可见。现在就添加开关。 |
| “这个重构很小，可以顺便包含进去” | 将重构与功能开发混在一起，会让两者都更难审查和调试。将它们分开。 |
| “为了保险起见，我再运行一次构建命令” | 成功运行后，除非代码此后发生了变化，否则重复运行同一命令毫无意义。应在后续编辑后再次运行，而不是为了寻求心理安慰。 |

## 危险信号

- 编写超过 100 行代码却没有运行测试
- 在单个增量中包含多个不相关的变更
- 以“让我顺手快速添加这个”为由扩大范围
- 为了加快进度而跳过测试/验证步骤
- 增量之间构建或测试处于失败状态
- 大量未提交的变更不断累积
- 在第三个用例明确需要之前就构建抽象
- 以“反正已经在这里了”为由修改任务范围之外的文件
- 为一次性操作创建新的工具文件
- 在没有任何代码变更的情况下连续两次运行相同的构建/测试命令

## 验证

完成任务的所有增量后：

- [ ] 每个增量都已单独测试并提交
- [ ] 完整测试套件通过
- [ ] 构建无异常
- [ ] 功能按规定实现了端到端运行
- [ ] 没有未提交的变更

## 另请参阅

按增量验证是局部检查。在宣布任务完成之前，应将项目范围的完成定义作为最终关卡；无论任务是什么，每个增量都必须达到这一长期适用的标准。参见 `../../references/definition-of-done.md`。