---
name: refactor
license: MIT
description: >-
  Safe multi-file refactoring with automatic rollback. Establishes a type/test
  baseline, plans all changes, executes file-by-file, and verifies zero
  regressions. Reverts if verification fails after two fix attempts.
  Handles renames, extracts, moves, splits, merges, and inlines.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - refactor
  - rename
  - extract
  - inline
  - move file
  - split file
  - merge files
last-updated: 2026-03-20
---
# /refactor — 安全的多文件重构

## 定位

在以下情况使用 `/refactor`：
- 在整个代码库中重命名某个符号、文件或模块
- 从现有代码中提取函数、组件、hook、类或模块
- 将函数或模块内联回其调用处
- 将一个或一组文件移动到新位置
- 将大文件拆分为较小的片段
- 将相关文件合并为一个
- 修改函数签名并更新所有调用点

**不要使用的情况：** 调试特定 bug（请使用 /systematic-debugging）；添加新功能（请使用 /marshal 或 /scaffold）；删除死代码（请使用 /marshal 进行针对性清理）。

**与 /organize 的边界：** /refactor 改变文件内部的代码结构（提取、内联、拆分、合并、重命名），并在这些操作中移动文件。仓库范围内的文件/目录摆放、统一命名清理、以及『这个应该归属何处』类决策属于 /organize。

**行为不发生改变。** 测试在重构前后都通过，没有新的类型错误 —— 这意味着重构是正确的。

## 命令

| 命令 | 行为 |
|---|---|
| `/refactor rename [old] to [new]` | 重命名符号、文件或模块 |
| `/refactor extract [target] from [source]` | 提取函数/组件/模块 |
| `/refactor inline [target]` | 将函数/模块内联到调用处 |
| `/refactor move [source] to [dest]` | 移动文件并更新导入 |
| `/refactor split [file]` | 将文件拆分为逻辑片段 |
| `/refactor merge [files...]` | 将相关文件合并为一个 |
| `/refactor [自由描述]` | 根据描述自动检测重构类型 |
| `/refactor --dry-run [以上任意命令]` | 仅制定计划，展示将要发生的变化 |

## 协议

### 阶段 1：建立基线

运行类型检查（通过 `node scripts/run-with-timeout.js 300 npm run typecheck`）和测试。记录错误/失败数量 —— 既有问题不是你的责任，但你绝不能增加新问题。如果你计划修改的文件中存在未提交的更改，需发出警告。

```
Baseline established:
  Typecheck: {pass | N errors (pre-existing)}
  Tests: {pass | N failures (pre-existing) | no test suite found}
  Git: {clean | M files with uncommitted changes}
```

### 阶段 2：制定计划

分析重构目标，产出具体计划。

1. **确定范围**：在代码库中搜索对目标的所有引用。
   使用 grep/搜索查找：
   - 引用目标的导入语句
   - 使用位置（函数调用、类型引用、组件使用）
   - 来自 index 文件的再导出
   - 引用目标的测试文件
   - 提及目标的文档或注释
   - 配置文件（例如路由定义、依赖注入）

2. **对重构类型进行分类**并应用针对该类型的分析：

   **重命名（符号）：** 所有导入 + 使用位置 + 字符串引用 + 动态访问模式（`obj[key]`）

   **重命名（文件/模块）：** 所有导入路径 + 路径别名 + 动态导入 + index 再导出

   **提取（函数/组件/模块）：** 要提取的代码、外围作用域依赖、返回给调用方的值、目标文件、接口设计

   **移动（文件）：** 旧路径的每一个导入 → 计算新的相对路径、检查别名边界变化、barrel 文件更新

   **拆分（文件）：** 逻辑分组、内部交叉引用、哪一组保留原始路径、每组新建的文件、需要时的 index

   **合并（文件）：** 重复/冲突内容、导入整合、合并后文件的组织方式

3. **产出计划** —— 列出每一个将要更改的文件以及更改内容：

```
Refactoring Plan: {type} — {description}

Files to modify:
  1. {file}: {what changes and why}
  2. {file}: {what changes and why}
  ...

Files to create:
  - {file}: {extracted from where, contains what}

Files to delete:
  - {file}: {contents moved to where}

Risk assessment:
  - {any concerns: dynamic references, string-based lookups, config files}
```

4. 如果指定了 `--dry-run`，输出计划后停止。

### 阶段 3：执行

按以下顺序应用更改，以将中间状态的破坏降到最低：
1. 先创建新文件（仅包含导出，尚未被导入）
2. 更新导入方，使其指向新位置/新名称
3. 更新源文件（移除被提取的代码、重命名等）
4. 最后删除旧文件（仅在所有导入方都已更新之后）
5. 更新 index/barrel 文件

编辑前先读取每个文件。只做必要的最小更改 —— 不要重新格式化无关代码。

### 阶段 4：验证

运行阶段 1 的类型检查和测试。与基线对比 —— 是否有新增的错误或失败？搜索引用旧/已删除文件的导入路径。

```
Verification: PASS
  Typecheck: {pass | same N pre-existing errors}
  Tests: {pass | same N pre-existing failures}
  No new broken imports detected.
```

### 阶段 5：修复（如果验证失败）

允许尝试两次：读取错误，识别根因（遗漏的导入更新、缺失的再导出、类型不匹配），修复，然后重新运行验证。两次尝试均失败后：回退。

### 阶段 6：回退（如果修复失败）

1. 使用 `git checkout -- [files]` 恢复每一个被修改的文件
2. 移除任何新建的文件
3. 验证回退结果：类型检查应与基线完全一致
4. 报告问题所在

```
REVERTED — Refactoring could not be completed cleanly.

Root cause: {why the refactoring failed}
Errors encountered:
  - {error 1}
  - {error 2}

Suggestion: {what the user might do differently}
```

## 边缘情况

- **没有测试基线**：阶段 1 未找到测试套件 —— 输出："未找到测试。重构将在没有安全网的情况下进行 —— 中止还是继续？建议先运行 /test-gen。"等待用户确认后再继续。
- **基线类型检查失败**：在任何重构更改之前就已存在类型错误 —— 输出："基线类型检查失败。请先修复现有类型错误再进行重构，以建立干净的基线。"不要继续。
- **重构提交后构建失败**：阶段 4 检测到构建回归 —— 使用 `git revert HEAD --no-edit` 回退该提交，然后报告是哪个验证步骤引入了回归以及失败的错误是什么。
- **检测到循环依赖**：在范围分析中发现导入环 —— 视为阻塞项；输出："在 [file] 中检测到循环依赖。请先解决该循环再继续。"在没有用户明确决定之前不要修改该文件。
- **目标文件超过 500 行**：输出："警告：[file] 有 [N] 行。重构可能会将该文件拆分为多个片段。请在继续前确认范围。"在计划中展示提议的拆分方案并等待用户批准。

## 质量关卡

- **零新增类型错误** —— 必须是零个新增错误，而不只是更少。
- **零新增测试失败** —— 基线中的失败可以接受，新增失败不可以。
- **所有导入均可解析** —— 不得存在指向旧路径或已移除导出的悬空引用。
- **行为不变** —— 添加逻辑或更改返回值属于范围蔓延；停下，另行单独处理。
- **最小差异** —— 未触及的文件中不得有重新格式化、无关清理或空白字符变更。
- **计划与执行一致** —— 每个计划中的文件都被修改，未触及任何计划外的文件。

## 退出协议

报告结果：

```
=== Refactor Report ===

Type: {rename | extract | inline | move | split | merge}
Target: {what was refactored}

Changes:
  Modified: {N} files
  Created: {N} files
  Deleted: {N} files

Verification:
  Typecheck: {pass | same baseline errors}
  Tests: {pass | same baseline failures | no test suite}

Key decisions:
- {any non-obvious choices made during execution}
```

```
---HANDOFF---
- Refactored {target}: {what changed}
- {N} files modified, {N} created, {N} deleted
- Typecheck and tests pass (no regressions)
- {any follow-up suggestions}
- Reversibility: green -- single atomic commit, revert with git revert HEAD
---
```
