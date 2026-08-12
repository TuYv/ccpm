---
name: git-workflow-and-versioning
description: Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, or when you need to organize work across multiple parallel streams. Use when cutting a release, choosing a semantic version bump, tagging, or writing a changelog.
---
# Git 工作流与版本控制

## 概述

Git 是你的安全网。将提交视为存档点，将分支视为沙盒，将历史记录视为文档。随着 AI 智能体高速生成代码，规范的版本控制是确保变更易于管理、审查和回退的机制。

## 何时使用

始终使用。每项代码变更都要经过 git。

## 核心原则

### 基于主干的开发（推荐）

确保 `main` 始终可部署。在短期功能分支上工作，并在 1-3 天内合并回主干。长期存在的开发分支会产生隐性成本——它们会逐渐偏离主干、引发合并冲突并延迟集成。DORA 的研究始终表明，基于主干的开发与高绩效工程团队存在相关性。

```
main ──●──●──●──●──●──●──●──●──●──  (always deployable)
        ╲      ╱  ╲    ╱
         ●──●─╱    ●──╱    ← short-lived feature branches (1-3 days)
```

这是推荐的默认方式。使用 gitflow 或长期分支的团队可以根据自己的分支模型调整这些原则（原子提交、小规模变更、描述清晰的消息）——提交纪律比具体的分支策略更重要。

- **开发分支会产生成本。** 分支每多存在一天，合并风险就会进一步累积。
- **发布分支是可以接受的。** 当你需要在 main 继续向前推进的同时稳定某个发布版本时，可以使用发布分支。
- **功能开关优于长期分支。** 与其将未完成的工作放在分支上数周，不如将其隐藏在功能开关后进行部署。

### 1. 尽早提交，频繁提交

每个成功的增量都应有自己的提交。不要积累大量未提交的变更。

```
Work pattern:
  Implement slice → Test → Verify → Commit → Next slice

Not this:
  Implement everything → Hope it works → Giant commit
```

提交就是存档点。如果下一项变更破坏了某些内容，你可以立即回退到上一个已知正常的状态。

### 2. 原子提交

每个提交只做一件逻辑上独立的事情：

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

### 3. 描述清晰的消息

提交消息应解释*为什么*，而不只是说明*做了什么*：

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
- `docs` — 仅文档
- `chore` — 工具、依赖项、配置

### 4. 将关注点分开

不要将格式调整与行为变更混在一起。不要将重构与功能开发混在一起。每种类型的变更都应该作为单独的提交——最好也作为单独的 PR：

```
# Good: Separate concerns
git commit -m "refactor: extract validation logic to shared utility"
git commit -m "feat: add phone number validation to registration"

# Bad: Mixed concerns
git commit -m "refactor validation and add phone number field"
```

**将重构与功能开发分开。** 重构变更和功能变更是两种不同的变更——应分别提交。这样，每项变更都更容易审查、回退，也更容易在历史记录中理解。较小的清理工作（如重命名变量）可由审查者酌情决定是否纳入功能提交。

### 5. 控制变更规模

每个提交/PR 以约 100 行为目标。超过约 1000 行的变更应该拆分。有关如何拆解大型变更，请参阅 `code-review-and-quality` 中的拆分策略。

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
- 保持分支生命周期短暂（在 1-3 天内合并）——长期存在的分支会产生隐性成本
- 合并后删除分支
- 对于尚未完成的功能，优先使用功能开关，而不是长期存在的分支

### 分支命名

```
feature/<short-description>   → feature/task-creation
fix/<short-description>       → fix/duplicate-tasks
chore/<short-description>     → chore/update-deps
refactor/<short-description>  → refactor/auth-module
```

## 使用 Worktree

对于并行的 AI 代理工作，使用 git worktree 同时操作多个分支：

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
- 多个代理可以同时开发不同功能
- 无需切换分支（每个目录都有自己的分支）
- 如果某个实验失败，删除对应的 worktree 即可——不会丢失任何内容
- 在显式合并之前，各项变更彼此隔离

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

这种模式意味着你最多只会损失一个增量的工作成果。如果代理的行为失控，`git reset --hard HEAD` 可以让你回到上一个成功状态。

## 变更摘要

每次修改后，都应提供结构化摘要。这样可以简化审查、记录范围约束，并暴露非预期的变更：

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

这种模式能够及早发现错误的假设，并为审查者提供清晰的变更全貌。“DIDN'T TOUCH”部分尤为重要——它表明你严格遵守了范围约束，没有擅自进行未经请求的全面改造。

## 提交前的规范检查

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

使用 git hooks 将其自动化：

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

- **仅当项目需要生成的文件时才提交它们**（例如 `package-lock.json`、Prisma migrations）
- **不要提交**构建输出（`dist/`、`.next/`）、环境文件（`.env`）或 IDE 配置（`.vscode/settings.json`，除非它是共享配置）
- **确保 `.gitignore` 包含以下内容**：`node_modules/`、`dist/`、`.env`、`.env.local`、`*.pem`

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

提交是*你*追踪变更的方式；**版本**是你的*使用者*追踪变更的方式。一旦有任何其他对象依赖你的代码——另一个团队、已发布的软件包、已部署的客户端——在回答“我正在运行什么版本，升级是否安全？”时，“main 上的最新版本”就不再是一个充分的答案。版本号和变更日志正是回答这一问题的契约。

### 语义化版本控制

对于任何有使用者的内容，都应采用 `MAJOR.MINOR.PATCH` 版本格式，并让数字承载明确含义：

```
  MAJOR  breaking change — consumers must change their code to upgrade
  MINOR  new functionality, backward-compatible — safe to upgrade
  PATCH  bug fix, backward-compatible — safe to upgrade
```

版本号是一项承诺，因此要让代码与之匹配。一个改变了消费者所依赖行为的“补丁”，其实只是披着伪装的重大变更（海勒姆定律——参见 `api-and-interface-design` 技能）。如果不确定某项变更是否具有破坏性，就假定它具有破坏性；一次出人意料的主版本升级，远比破坏消费者的使用要廉价得多。

### 为发布打标签，并让标签成为事实来源

发布是历史中一个不可变的时间点，而不是一个不断移动的分支。为其打上标签，确保它始终可以被复现：

```bash
git tag -a v1.4.0 -m "Release 1.4.0"
git push origin v1.4.0
```

应从标签推导版本，而不是在散落的文件中手动编辑版本号，这样制品、标签和变更日志就永远不会彼此不一致。

### 维护一份为人类编写的变更日志

变更日志不是 `git log`。它是面向消费者、经过筛选整理的对“发生了什么变化，以及我是否需要关心？”这一问题的回答——按照 `Added / Changed / Fixed / Deprecated / Removed / Security` 分组，最新内容置顶，每个条目都围绕对用户的影响来表述，而不是描述内部机制。

```markdown
## [1.4.0] - 2025-06-12
### Added
- Bulk task import via CSV
### Fixed
- Timezone drift in recurring task due dates
### Deprecated
- `GET /v1/tasks/all` — use the paginated `GET /v1/tasks` (removal in 2.0)
```

在实施变更的同一次改动中编写相应条目，此时其影响仍然清晰——不要等到发布时再通过考古提交记录来还原。破坏性变更需要提供迁移说明和弃用窗口（遵循 `deprecation-and-migration` 技能）；实际发布版本是 `shipping-and-launch` 技能的职责——本节定义的是为其提供输入的版本控制契约。

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “等功能完成后我再提交” | 一个巨型提交无法审查、调试或回滚。每完成一个切片就提交。 |
| “提交消息不重要” | 提交消息就是文档。未来的你（以及未来的智能体）需要理解改了什么以及为什么要改。 |
| “之后我会把它们全部压缩” | 压缩提交会破坏开发过程的脉络。应从一开始就优先采用整洁的增量提交。 |
| “分支会增加开销” | 短期分支几乎没有成本，并且能防止相互冲突的工作发生碰撞。长期分支才是问题所在——应在 1-3 天内合并。 |
| “之后我会拆分这项变更” | 大型变更更难审查、部署风险更高，也更难回滚。应在提交审查前拆分，而不是之后。 |
| “我不需要 .gitignore” | 直到包含生产环境密钥的 `.env` 被提交。应立即进行配置。 |
| “这只是一个小修复，提升补丁版本就行” | 检查消费者能够观察到什么。他们所依赖的行为发生变化，就是主版本变更，无论差异有多小。 |
| “变更日志就是提交日志” | 提交是给你看的；变更日志是给消费者看的，应按影响进行筛选整理。从原始提交中生成变更日志会掩盖真正重要的内容。 |
| “我们会在发布时编写变更日志” | 到那时，只能依靠记忆还原影响，而且其中一半已经遗漏。应随变更一起编写对应条目。 |

## 危险信号

- 大量未提交的变更不断累积
- 使用“fix”“update”“misc”之类的提交消息
- 格式调整与行为变更混在一起
- 项目中没有 `.gitignore`
- 提交 `node_modules/`、`.env` 或构建制品
- 长期分支与主分支出现显著分歧
- 强制推送到共享分支
- 在次版本或补丁版本升级中发布破坏性变更
- 发布没有标签，或者手动编辑的版本号与标签不同步
- 面向用户的发布没有变更日志条目，或者变更日志只是堆砌提交消息

## 验证

对于每次提交：

- [ ] 提交只完成一项逻辑变更
- [ ] 提交消息解释了变更原因，并遵循类型约定
- [ ] 提交前测试已通过
- [ ] 差异中不包含任何密钥
- [ ] 不将仅格式化的变更与行为变更混在一起
- [ ] `.gitignore` 涵盖标准排除项

对于每次发布（任何有使用者的发布）：

- [ ] 版本号递增与变更匹配：破坏性变更 → 主版本，新增功能 → 次版本，修复 → 修订版本
- [ ] 发布已打标签，且版本号源自该标签，而不是通过手动编辑导致不同步
- [ ] 变更日志包含此版本经人工整理、按影响分组且易于阅读的条目