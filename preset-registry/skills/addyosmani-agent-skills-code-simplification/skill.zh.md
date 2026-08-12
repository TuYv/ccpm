---
name: code-simplification
description: Simplifies code for clarity. Use when refactoring code for clarity without changing behavior. Use when code works but is harder to read, maintain, or extend than it should be. Use when reviewing code that has accumulated unnecessary complexity.
---
# 代码简化

> 灵感来源于 [Claude Code Simplifier 插件](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md)。此处将其改编为一种与模型无关、由流程驱动的技能，适用于任何 AI 编码代理。

## 概述

在完全保留行为的同时，通过降低复杂度来简化代码。目标不是减少代码行数，而是让代码更易于阅读、理解、修改和调试。每次简化都必须通过一个简单的检验：“新加入团队的成员能否比理解原始代码更快地理解它？”

## 何时使用

- 功能已经正常运行且测试通过，但实现方式显得过于复杂时
- 在代码审查期间发现可读性或复杂度问题时
- 遇到嵌套层级很深的逻辑、过长的函数或含义不清的名称时
- 重构在时间压力下编写的代码时
- 整合散落在多个文件中的相关逻辑时
- 合并引入了重复或不一致之处的更改后

**何时不应使用：**

- 代码已经简洁且易读——不要为了简化而简化
- 你尚未理解代码的作用——先理解，再简化
- 代码对性能至关重要，而“更简单”的版本会明显变慢
- 你即将彻底重写该模块——简化即将废弃的代码只会浪费精力

## 五项原则

### 1. 完全保留行为

不要改变代码的功能，只改变其表达方式。所有输入、输出、副作用、错误行为和边界情况都必须保持完全一致。如果无法确定某项简化是否保留了原有行为，就不要进行这项简化。

```
ASK BEFORE EVERY CHANGE:
→ Does this produce the same output for every input?
→ Does this maintain the same error behavior?
→ Does this preserve the same side effects and ordering?
→ Do all existing tests still pass without modification?
```

### 2. 遵循项目约定

简化意味着让代码与代码库更加一致，而不是强加外部偏好。简化之前：

```
1. Read CLAUDE.md / project conventions
2. Study how neighboring code handles similar patterns
3. Match the project's style for:
   - Import ordering and module system
   - Function declaration style
   - Naming conventions
   - Error handling patterns
   - Type annotation depth
```

破坏项目一致性的简化不是真正的简化——它只是在制造无谓的变动。

### 3. 清晰优先于巧妙

如果紧凑的代码需要停下来思考才能理解，那么显式的代码会更好。

```typescript
// UNCLEAR: Dense ternary chain
const label = isNew ? 'New' : isUpdated ? 'Updated' : isArchived ? 'Archived' : 'Active';

// CLEAR: Readable mapping
function getStatusLabel(item: Item): string {
  if (item.isNew) return 'New';
  if (item.isUpdated) return 'Updated';
  if (item.isArchived) return 'Archived';
  return 'Active';
}
```

```typescript
// UNCLEAR: Chained reduces with inline logic
const result = items.reduce((acc, item) => ({
  ...acc,
  [item.id]: { ...acc[item.id], count: (acc[item.id]?.count ?? 0) + 1 }
}), {});

// CLEAR: Named intermediate step
const countById = new Map<string, number>();
for (const item of items) {
  countById.set(item.id, (countById.get(item.id) ?? 0) + 1);
}
```

### 4. 保持平衡

简化有一种失败模式：过度简化。请注意以下陷阱：

- **过于激进地内联** — 移除一个为概念赋予名称的辅助函数，会使调用处更难阅读
- **合并不相关的逻辑** — 将两个简单函数合并为一个复杂函数，并不会让代码更简单
- **移除“没有必要的”抽象** — 有些抽象是为了可扩展性或可测试性而存在，而不是为了处理复杂性
- **以减少行数为优化目标** — 更少的行数并不是目标；更容易理解才是

### 5. 将范围限定在发生变更的部分

默认只简化最近修改的代码。除非明确要求扩大范围，否则应避免顺手重构无关代码。没有明确范围的简化会在差异中产生噪声，并可能导致意外的回归问题。

## 简化流程

### 第 1 步：动手之前先理解（切斯特顿栅栏原则）

在修改或删除任何内容之前，先理解它为何存在。这就是切斯特顿栅栏原则：如果你看到横跨道路的栅栏，却不明白它为什么在那里，就不要将其拆除。先理解原因，再判断该原因是否仍然适用。

```
BEFORE SIMPLIFYING, ANSWER:
- What is this code's responsibility?
- What calls it? What does it call?
- What are the edge cases and error paths?
- Are there tests that define the expected behavior?
- Why might it have been written this way? (Performance? Platform constraint? Historical reason?)
- Check git blame: what was the original context for this code?
```

如果你无法回答这些问题，就还没有做好简化的准备。请先阅读更多上下文。

### 第 2 步：识别简化机会

查找以下模式——每一种都是具体信号，而不是模糊的坏味道：

**结构复杂性：**

| 模式 | 信号 | 简化方式 |
|---------|--------|----------------|
| 深层嵌套（3 层以上） | 控制流难以理解 | 将条件提取为守卫子句或辅助函数 |
| 长函数（50 行以上） | 承担多个职责 | 拆分为具有描述性名称、职责集中的函数 |
| 嵌套三元表达式 | 需要在脑中维护状态才能解析 | 替换为 if/else 链、switch 或查找对象 |
| 布尔参数标志 | `doThing(true, false, true)` | 替换为选项对象或独立函数 |
| 重复条件判断 | 多处存在相同的 `if` 检查 | 提取为命名清晰的谓词函数 |

**命名与可读性：**

| 模式 | 信号 | 简化方式 |
|---------|--------|----------------|
| 泛化的名称 | `data`、`result`、`temp`、`val`、`item` | 重命名以描述其内容：`userProfile`、`validationErrors` |
| 缩写名称 | `usr`、`cfg`、`btn`、`evt` | 除非缩写是通用的（`id`、`url`、`api`），否则使用完整单词 |
| 误导性名称 | 名为 `get` 的函数同时还会修改状态 | 重命名以反映实际行为 |
| 解释“做什么”的注释 | `// increment counter` 位于 `count++` 上方 | 删除注释——代码本身已经足够清晰 |
| 解释“为什么”的注释 | `// Retry because the API is flaky under load` | 保留这些注释——它们传达了代码无法表达的意图 |

**冗余：**

| 模式 | 信号 | 简化方式 |
|---------|--------|----------------|
| 重复逻辑 | 多处出现相同的 5 行以上代码 | 提取为共享函数 |
| 死代码 | 无法执行的分支、未使用的变量、被注释掉的代码块 | 删除（确认它们确实无用之后） |
| 不必要的抽象 | 没有增加任何价值的包装器 | 内联包装器，直接调用底层函数 |
| 过度设计的模式 | 工厂的工厂、只有一种策略的策略模式 | 替换为简单直接的实现方式 |
| 多余的类型断言 | 转换为已经能够推断出的类型 | 删除断言 |

### 第 3 步：逐步应用更改

每次只进行一项简化。每次更改后都运行测试。**重构更改应与功能或错误修复更改分开提交。** 一个既进行重构又添加功能的 PR 实际上是两个 PR——请将它们拆分。

```
FOR EACH SIMPLIFICATION:
1. Make the change
2. Run the test suite
3. If tests pass → commit (or continue to next simplification)
4. If tests fail → revert and reconsider
```

避免将多项简化合并到一次未经测试的更改中。如果出现问题，你需要知道是哪项简化导致的。

**500 行规则：** 如果一次重构会涉及超过 500 行代码，应投入精力使用自动化工具（codemod、sed 脚本、AST 转换），而不是手动进行更改。如此规模的手动编辑容易出错，也会让审查变得十分耗费精力。

### 第 4 步：验证结果

完成所有简化后，退一步对整体进行评估：

```
COMPARE BEFORE AND AFTER:
- Is the simplified version genuinely easier to understand?
- Did you introduce any new patterns inconsistent with the codebase?
- Is the diff clean and reviewable?
- Would a teammate approve this change?
```

如果“简化后”的版本更难理解或审查，请还原更改。并非每次简化尝试都会成功。

## 特定语言指南

### TypeScript / JavaScript

```typescript
// SIMPLIFY: Unnecessary async wrapper
// Before
async function getUser(id: string): Promise<User> {
  return await userService.findById(id);
}
// After
function getUser(id: string): Promise<User> {
  return userService.findById(id);
}

// SIMPLIFY: Verbose conditional assignment
// Before
let displayName: string;
if (user.nickname) {
  displayName = user.nickname;
} else {
  displayName = user.fullName;
}
// After
const displayName = user.nickname || user.fullName;

// SIMPLIFY: Manual array building
// Before
const activeUsers: User[] = [];
for (const user of users) {
  if (user.isActive) {
    activeUsers.push(user);
  }
}
// After
const activeUsers = users.filter((user) => user.isActive);

// SIMPLIFY: Redundant boolean return
// Before
function isValid(input: string): boolean {
  if (input.length > 0 && input.length < 100) {
    return true;
  }
  return false;
}
// After
function isValid(input: string): boolean {
  return input.length > 0 && input.length < 100;
}
```

### Python

```python
# SIMPLIFY: Verbose dictionary building
# Before
result = {}
for item in items:
    result[item.id] = item.name
# After
result = {item.id: item.name for item in items}

# SIMPLIFY: Nested conditionals with early return
# Before
def process(data):
    if data is not None:
        if data.is_valid():
            if data.has_permission():
                return do_work(data)
            else:
                raise PermissionError("No permission")
        else:
            raise ValueError("Invalid data")
    else:
        raise TypeError("Data is None")
# After
def process(data):
    if data is None:
        raise TypeError("Data is None")
    if not data.is_valid():
        raise ValueError("Invalid data")
    if not data.has_permission():
        raise PermissionError("No permission")
    return do_work(data)
```

### React / JSX

```tsx
// SIMPLIFY: Verbose conditional rendering
// Before
function UserBadge({ user }: Props) {
  if (user.isAdmin) {
    return <Badge variant="admin">Admin</Badge>;
  } else {
    return <Badge variant="default">User</Badge>;
  }
}
// After
function UserBadge({ user }: Props) {
  const variant = user.isAdmin ? 'admin' : 'default';
  const label = user.isAdmin ? 'Admin' : 'User';
  return <Badge variant={variant}>{label}</Badge>;
}

// SIMPLIFY: Prop drilling through intermediate components
// Before — consider whether context or composition solves this better.
// This is a judgment call — flag it, don't auto-refactor.
```

## 常见的自我辩解

| 自我辩解 | 实际情况 |
|---|---|
| “代码能正常工作，没必要动它” | 难以阅读的可运行代码在出问题时也会难以修复。现在进行简化，可以为未来的每一次修改节省时间。 |
| “行数越少总是越简单” | 单行嵌套三元表达式并不比 5 行的 if/else 更简单。简单与否取决于理解速度，而不是行数。 |
| “我顺手快速简化一下这段无关代码” | 不限定范围的简化会产生充斥噪声的 diff，还可能给你原本无意修改的代码带来回归风险。保持专注。 |
| “类型已经让代码不言自明了” | 类型记录的是结构，而不是意图。一个命名良好的函数在解释*为什么*方面，比类型签名解释*是什么*更有效。 |
| “这个抽象以后可能会有用” | 不要保留基于猜测的抽象。如果现在没有使用，它就是没有价值的复杂性。将其移除，等需要时再重新添加。 |
| “原作者这么写肯定有他的理由” | 也许如此。检查 git blame——应用切斯特顿围栏原则。但累积的复杂性往往没有任何理由；它只是在压力下反复迭代留下的残余。 |
| “我会在添加这个功能时顺便重构” | 将重构与功能开发分开。混合修改更难审查、更难回滚，也更难通过历史记录理解。 |

## 危险信号

- 简化后需要修改测试才能通过（你很可能改变了行为）
- “简化”后的代码比原代码更长、更难理解
- 根据个人偏好重命名，而不是遵循项目约定
- 因为“这样能让代码更简洁”而移除错误处理
- 简化自己没有完全理解的代码
- 将大量简化合并到一个庞大且难以审查的提交中
- 在未被要求的情况下重构当前任务范围之外的代码

## 验证

完成一轮简化后：

- [ ] 所有现有测试均能通过，无需修改
- [ ] 构建成功，且没有新增警告
- [ ] Linter/formatter 检查通过（无样式回归）
- [ ] 每项简化都是可审查的增量修改
- [ ] diff 干净——没有混入无关修改
- [ ] 简化后的代码遵循项目约定（已对照 CLAUDE.md 或同等文档检查）
- [ ] 没有移除或削弱任何错误处理
- [ ] 没有遗留死代码（未使用的导入、不可达分支）
- [ ] 团队成员或审查代理会认可该修改总体上有所改进