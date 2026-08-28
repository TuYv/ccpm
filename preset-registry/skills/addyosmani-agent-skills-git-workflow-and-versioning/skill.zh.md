---
name: git-workflow-and-versioning
description: Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, opening or reviewing a pull request (PR), pushing to a remote, or when you need to organize work across multiple parallel streams. Use when cutting a release, choosing a semantic version bump, tagging, or writing a changelog.
---
# Git 工作流与版本控制

## 概述

Git 是你的安全网。将提交视为保存点，将分支视为沙盒，将历史记录视为文档。随着 AI 智能体高速生成代码，规范的版本控制正是让变更保持可管理、可审查和可回退的机制。

## 何时使用

始终使用。每一项代码变更都要经过 git。

## 核心原则

### 基于主干的开发（推荐）

确保 `main` 始终可部署。在短期存在的功能分支上工作，并在 1-3 天内将其合并回主干。长期存在的开发分支会带来隐性成本——它们会产生分歧、造成合并冲突并延迟集成。DORA 的研究一贯表明，基于主干的开发与高绩效工程团队之间存在相关性。

```
main ──●──●──●──●──●──●──●──●──●──  (always deployable)
        ╲      ╱  ╲    ╱
         ●──●─╱    ●──╱    ← short-lived feature branches (1-3 days)
```

这是推荐的默认方式。使用 gitflow 或长期分支的团队可以根据自己的分支模型调整这些原则（原子提交、小型变更、描述性消息）——提交纪律比具体的分支策略更重要。

- **开发分支会带来成本。** 分支每多存在一天，合并风险就会增加。
- **发布分支是可以接受的。** 当你需要在 main 继续向前推进的同时稳定某个版本时，可以使用发布分支。
- **功能开关优于长期分支。** 与其将未完成的工作放在分支上数周，不如将其隐藏在功能开关之后进行部署。

### 1. 尽早提交，频繁提交

每一个成功的增量都应有其独立的提交。不要积累大量未提交的变更。

```
Work pattern:
  Implement slice → Test → Verify → Commit → Next slice

Not this:
  Implement everything → Hope it works → Giant commit
```

提交就是保存点。如果下一项变更破坏了某些功能，你可以立即回退到上一个已知正常的状态。

### 2. 原子提交

每个提交只完成一件逻辑上独立的事情：

```
# Good: Each commit is self-contained
git log --oneline
a1b2c3d Add task creation endpoint with validation
d4e5f6g Add task creation form component
h7i8j9k Connect form to API and add loading state
m1n2o3p Add task creation tests (unit + integration)

# Bad: Everything mixed together
git log --oneline
x1y2z3a Add task feature, fix sidebar, update deps, refactor utils
```

### 3. 描述性消息

提交消息应解释*为什么*，而不只是*做了什么*：

```
# Good: Explains intent
feat: add email validation to registration endpoint

Prevents invalid email formats from reaching the database.
Uses Zod schema validation at the route handler level,
consistent with existing validation patterns in auth.ts.

# Bad: Describes what's obvious from the diff
update auth.ts
```

**格式：**
```
<type>: <short description>

<optional body explaining why, not what>
```

**类型：**
- `feat` — 新功能
- `fix` — 错误修复
- `refactor` — 既不修复错误也不添加功能的代码变更
- `test` — 添加或更新测试
- `docs` — 仅文档变更
- `chore` — 工具、依赖项、配置

### 4. 保持关注点分离

不要将格式变更与行为变更混在一起。不要将重构与功能开发混在一起。每种类型的变更都应该使用单独的提交——理想情况下，也应该使用单独的 PR：

```
# Good: Separate concerns
git commit -m "refactor: extract validation logic to shared utility"
git commit -m "feat: add phone number validation to registration"

# Bad: Mixed concerns
git commit -m "refactor validation and add phone number field"
```

**将重构与功能开发分开。** 重构变更和功能变更是两种不同的变更——请分别提交。这样可以使每项变更更容易审查、回滚，并在历史记录中更容易理解。小规模的清理工作（例如重命名变量）可由审查者酌情决定是否包含在功能提交中。

### 5. 控制变更规模

每个提交/PR 的目标规模约为 100 行。超过约 1000 行的变更应该拆分。有关如何拆分大型变更，请参阅 `code-review-and-quality` 中的拆分策略。

```
~100 lines  → Easy to review, easy to revert
~300 lines  → Acceptable for a single logical change
~1000 lines → Split into smaller changes
```

## 分支策略

### 功能分支

```
main (always deployable)
  │
  ├── feature/task-creation    ← One feature per branch
  ├── feature/user-settings    ← Parallel work
  └── fix/duplicate-tasks      ← Bug fixes
```

- 从 `main`（或团队的默认分支）创建分支
- 保持分支生命周期短暂（在 1-3 天内合并）——长期存在的分支会带来隐性成本
- 合并后删除分支
- 对于尚未完成的功能，优先使用功能标志，而不是长期存在的分支

### 分支命名

```
feature/<short-description>   → feature/task-creation
fix/<short-description>       → fix/duplicate-tasks
chore/<short-description>     → chore/update-deps
refactor/<short-description>  → refactor/auth-module
```

## 使用工作树

对于并行的 AI 智能体工作，请使用 git 工作树同时运行多个分支：

```bash
# Create a worktree for a feature branch
git worktree add ../project-feature-a feature/task-creation
git worktree add ../project-feature-b feature/user-settings

# Each worktree is a separate directory with its own branch
# Agents can work in parallel without interfering
ls ../
  project/              ← main branch
  project-feature-a/    ← task-creation branch
  project-feature-b/    ← user-settings branch

# When done, merge and clean up
git worktree remove ../project-feature-a
```

优势：
- 多个智能体可以同时开发不同的功能
- 无需切换分支（每个目录都有自己的分支）
- 如果某个实验失败，只需删除工作树——不会丢失任何内容
- 在显式合并之前，变更彼此隔离

## 保存点模式

```
Agent starts work
    │
    ├── Makes a change
    │   ├── Test passes? → Commit → Continue
    │   └── Test fails? → Revert to last commit → Investigate
    │
    ├── Makes another change
    │   ├── Test passes? → Commit → Continue
    │   └── Test fails? → Revert to last commit → Investigate
    │
    └── Feature complete → All commits form a clean history
```

这种模式意味着你永远不会丢失超过一个增量的工作。如果代理偏离了轨道，`git reset --hard HEAD` 可以让你回到上一个成功状态。

## 变更摘要

每次修改后，都要提供结构化摘要。这会让审查更加容易，记录范围控制情况，并暴露意外变更：

```
CHANGES MADE:
- src/routes/tasks.ts: Added validation middleware to POST endpoint
- src/lib/validation.ts: Added TaskCreateSchema using Zod

THINGS I DIDN'T TOUCH (intentionally):
- src/routes/auth.ts: Has similar validation gap but out of scope
- src/middleware/error.ts: Error format could be improved (separate task)

POTENTIAL CONCERNS:
- The Zod schema is strict — rejects extra fields. Confirm this is desired.
- Added zod as a dependency (72KB gzipped) — already in package.json
```

这种模式可以及早发现错误的假设，并为审查者提供清晰的变更范围图谱。`DIDN'T TOUCH` 部分尤其重要——它表明你遵守了范围控制，没有擅自进行改造。

## 提交前清理

每次提交前：

```bash
# 1. Check what you're about to commit
git diff --staged

# 2. Ensure no secrets
git diff --staged | grep -i "password\|secret\|api_key\|token"

# 3. Run tests
npm test

# 4. Run linting
npm run lint

# 5. Run type checking
npx tsc --noEmit
```

使用 git hooks 自动执行：

```json
// package.json (using lint-staged + husky)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## 处理生成的文件

- **仅在项目有此要求时提交生成的文件**（例如 `package-lock.json`、Prisma 迁移文件）
- **不要提交**构建输出（`dist/`、`.next/`）、环境文件（`.env`）或 IDE 配置（`.vscode/settings.json`，除非是共享配置）
- **应有一个 `.gitignore`**，涵盖：`node_modules/`、`dist/`、`.env`、`.env.local`、`*.pem`

## 使用 Git 进行调试

```bash
# Find which commit introduced a bug
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
# Git checkouts midpoints; run your test at each to narrow down

# View what changed recently
git log --oneline -20
git diff HEAD~5..HEAD -- src/

# Find who last changed a specific line
git blame src/services/task.ts

# Search commit messages for a keyword
git log --grep="validation" --oneline
```

## 发布与版本控制

提交是你追踪变更的方式；**版本**是你的*使用者*追踪变更的方式。一旦有其他对象依赖你的代码——另一个团队、已发布的软件包、已部署的客户端——“main 上的最新版本”就不再足以回答“我运行的是什么版本，以及升级是否安全？”版本号和变更日志就是回答这些问题的契约。

### 语义化版本控制

对于任何有使用者的内容，都应使用 `MAJOR.MINOR.PATCH` 进行版本控制，并让版本号承载明确含义：

```
  MAJOR  breaking change — consumers must change their code to upgrade
  MINOR  new functionality, backward-compatible — safe to upgrade
  PATCH  bug fix, backward-compatible — safe to upgrade
```

这个数字是一项承诺，因此代码必须与它保持一致。一个改变了消费者所依赖行为的“补丁”，只是披着伪装的重大变更（Hyrum 定律——参见 `api-and-interface-design` skill）。当无法确定某项变更是否会造成破坏性影响时，就假设它会；一次意外的重大版本升级，代价远低于破坏消费者。

### 标记发布版本，并让标签成为事实来源

发布版本是历史中不可变的节点，而不是一个会移动的分支。为它创建标签，使其始终可以被复现：

```bash
git tag -a v1.4.0 -m "Release 1.4.0"
git push origin v1.4.0
```

应从标签派生版本，而不是在分散的文件中手动编辑版本号，这样制品、标签和变更日志就永远不会相互不一致。

### 编写面向人类的变更日志

变更日志不是 `git log`。它是经过整理、面向消费者的“改了什么，我是否需要关心？”这一问题的答案——按 `Added / Changed / Fixed / Deprecated / Removed / Security` 分类，最新内容置顶，并且每一条都围绕用户影响来表述，而不是围绕内部实现机制。

```markdown
## [1.4.0] - 2025-06-12
### Added
- Bulk task import via CSV
### Fixed
- Timezone drift in recurring task due dates
### Deprecated
- `GET /v1/tasks/all` — use the paginated `GET /v1/tasks` (removal in 2.0)
```

应在实施变更的同一个改动中编写对应条目，此时对影响的记忆仍然清晰——而不是等到发布时再从提交记录的考古中重建。破坏性变更需要迁移说明和弃用窗口（遵循 `deprecation-and-migration` skill）；实际发布则是 `shipping-and-launch` skill 的职责所在——本节是为其提供输入的版本控制契约。

## 常见的自我辩解

| 自我辩解 | 现实 |
|---|---|
| “功能完成后我再提交” | 一个巨大的提交无法进行有效评审、调试或回滚。应为每个切片分别提交。 |
| “提交消息不重要” | 提交消息就是文档。未来的你（以及未来的智能体）需要理解改了什么以及为什么改。 |
| “之后我会把它们全部压缩” | 压缩提交会破坏开发过程的脉络。应从一开始就保持干净的增量提交。 |
| “分支会增加开销” | 短生命周期分支成本很低，还能防止相互冲突的工作彼此碰撞。真正的问题是长期存在的分支——应在 1-3 天内合并。 |
| “这个改动之后再拆分” | 大型改动更难评审、部署风险更高，也更难回滚。应在提交评审前拆分，而不是之后再拆。 |
| “我不需要 `.gitignore`” | 直到包含生产环境密钥的 `.env` 被提交进去。应立即设置。 |
| “只是一个小修复，把补丁版本号加一就行” | 检查消费者能够观察到什么。消费者所依赖的行为发生了变化，无论差异有多小，都是重大变更。 |
| “变更日志就是提交日志” | 提交记录是写给你自己的；变更日志是写给消费者的，应按影响进行整理。根据原始提交记录生成变更日志，会掩盖真正重要的内容。 |
| “发布时再写变更日志” | 到那时只能凭记忆重建影响，而且一半内容已经遗漏。应在变更发生时就写下对应条目。 |

## 危险信号

- 大量未提交的改动不断累积
- 提交消息类似于“修复”“更新”“杂项”
- 格式变更与行为变更混在一起
- 项目中没有 `.gitignore`
- 提交了 `node_modules/`、`.env` 或构建产物
- 长期存在且与 main 产生严重分歧的分支
- 对共享分支执行强制推送
- 破坏性变更却使用次版本或补丁版本升级发布
- 发布没有标签，或者手动编辑的版本号与标签不同步
- 面向用户的发布没有变更日志条目，或者变更日志只是直接倾倒提交消息

## 验证

对于每次提交：

- [ ] 提交只做一件逻辑上的事情
- [ ] 提交消息说明了原因，并遵循类型约定
- [ ] 提交前测试通过
- [ ] 差异中不包含任何机密信息
- [ ] 未将仅格式变更与行为变更混合在一起
- [ ] `.gitignore` 覆盖标准排除项

对于每次发布（任何有使用者的版本）：

- [ ] 版本升级与变更相匹配：破坏性变更 → 主版本，新增功能 → 次版本，修复 → 补丁版本
- [ ] 发布已打标签，且版本号从标签中派生，而不是手动编辑成不一致的版本
- [ ] 变更日志包含经过整理、可供人类阅读的条目，并按本版本的影响进行分组