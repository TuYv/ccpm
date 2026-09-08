---
name: git-workflow-and-versioning
description: Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, splitting uncommitted work in a messy working tree into clean atomic commits, opening or reviewing a pull request (PR), pushing to a remote, or when you need to organize work across multiple parallel streams. Use when cutting a release, choosing a semantic version bump, tagging, or writing a changelog.
---
# Git 工作流与版本控制

## 概述

Git 是你的安全网。将提交视为保存点，将分支视为沙盒，将历史记录视为文档。随着 AI 代理高速生成代码，严格的版本控制是让变更保持可管理、可审查且可回退的机制。

## 适用时机

始终适用。每一处代码变更都应通过 git。

## 核心原则

### 基于主干的开发（推荐）

让 `main` 始终处于可部署状态。在短生命周期的功能分支上工作，并在 1-3 天内合并回主干。长期存在的开发分支是隐性成本：它们会产生分歧、造成合并冲突并延迟集成。DORA 研究持续表明，基于主干的开发与高绩效工程团队相关。

```
main ──●──●──●──●──●──●──●──●──●──  (always deployable)
        ╲      ╱  ╲    ╱
         ●──●─╱    ●──╱    ← short-lived feature branches (1-3 days)
```

这是推荐的默认模式。使用 gitflow 或长期分支的团队可以将这些原则（原子提交、小型变更、描述性消息）调整为适合其分支模型的方式，提交纪律比具体的分支策略更重要。

- **开发分支是成本。** 分支每多存活一天，就多积累一分合并风险。
- **发布分支可以接受。** 当你需要在 main 继续向前推进时稳定一个发布版本。
- **功能标志优于长期分支。** 与其将未完成的工作留在分支上数周，不如优先通过标志部署它们。

### 1. 尽早提交，频繁提交

每个成功的增量都应有独立的提交。不要积累大量未提交的变更。

```
Work pattern:
  Implement slice → Test → Verify → Commit → Next slice

Not this:
  Implement everything → Hope it works → Giant commit
```

提交是保存点。如果下一个变更导致问题，你可以立即回退到最后一个已知正常的状态。

### 2. 原子提交

每次提交只做一件逻辑上独立的事：

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
- `fix` — 缺陷修复
- `refactor` — 既不修复缺陷也不新增功能的代码变更
- `test` — 添加或更新测试
- `docs` — 仅文档变更
- `chore` — 工具、依赖项、配置

### 4. 保持关注点分离

不要把格式调整和行为变更混在一起。不要把重构和功能开发混在一起。每一种类型的变更都应该是单独的 commit——理想情况下也是单独的 PR：

```
# Good: Separate concerns
git commit -m "refactor: extract validation logic to shared utility"
git commit -m "feat: add phone number validation to registration"

# Bad: Mixed concerns
git commit -m "refactor validation and add phone number field"
```

**将重构与功能开发分开。** 重构变更和功能变更是两种不同的改动——请分别提交。这会让每个改动都更容易审查、回滚和在历史中理解。小范围清理（比如重命名变量）可以由审阅者酌情包含在功能 commit 中。

### 5. 控制变更规模

目标是每个 commit/PR 约 100 行。超过 1000 行的变更应拆分。有关如何拆分大型变更，请参见 `code-review-and-quality`。

```
~100 lines  → 易于审查，易于回滚
~300 lines  → 作为单个逻辑变更是可接受的
~1000 lines → 拆分为更小的变更
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
- 保持分支生命周期短暂——1 到 3 天内合并；长期存在的分支会带来隐藏成本
- 合并后删除分支
- 对未完成的功能，优先使用 feature flag，而不是长期存在的分支

### 分支命名

```
feature/<short-description>   → feature/task-creation
fix/<short-description>       → fix/duplicate-tasks
chore/<short-description>     → chore/update-deps
refactor/<short-description>  → refactor/auth-module
```

## 使用 Worktree

对于并行的 AI agent 工作，使用 git worktree 同时运行多个分支：

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

好处：
- 多个 agent 可以同时处理不同功能
- 无需切换分支（每个目录都有自己的分支）
- 如果某次实验失败，删除 worktree 即可——不会丢失任何内容
- 变更彼此隔离，直到显式合并

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

这个模式意味着你永远不会丢失超过一个增量的工作量。如果某个 agent 失控了，`git reset --hard HEAD` 会把你带回上一个成功状态。

## 变更摘要

在任何修改之后，都要提供结构化摘要。这会让审查更容易，记录作用范围控制，并暴露非预期更改：

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

这个模式能尽早捕捉错误假设，并让审阅者清楚地看到变更范围。“DIDN'T TOUCH” 这一部分尤其重要——它表明你遵守了作用范围，没有擅自扩大改动。

## 提交前卫生检查

在每次提交之前：

```bash
# 1. 检查你将要提交的内容
git diff --staged

# 2. 确保没有秘密信息
git diff --staged | grep -i "password\|secret\|api_key\|token"

# 3. 运行测试
npm test

# 4. 运行 lint
npm run lint

# 5. 运行类型检查
npx tsc --noEmit
```

通过 git hooks 自动化这一流程：

```json
// package.json (using lint-staged + husky)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## 处理生成文件

- **提交生成文件** 仅当项目预期需要它们时（例如 `package-lock.json`、Prisma migrations）
- **不要提交** 构建产物（`dist/`、`.next/`）、环境文件（`.env`）或 IDE 配置（`.vscode/settings.json`，除非是共享配置）
- **应有一个 `.gitignore`** 覆盖：`node_modules/`、`dist/`、`.env`、`.env.local`、`*.pem`

## 使用 Git 进行调试

```bash
# 找出引入 bug 的提交
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
# Git 会检出中间点；在每一步运行测试以缩小范围

# 查看最近的变更
git log --oneline -20
git diff HEAD~5..HEAD -- src/

# 找出最后修改某一行的人
git blame src/services/task.ts

# 按关键词搜索提交信息
git log --grep="validation" --oneline
```

## 发布与版本管理

提交是你用来跟踪变更的方式；**版本**是你的消费者用来跟踪变更的方式。一旦你的代码被其他东西依赖——另一个团队、一个发布包、一个已部署的客户端——“main 上的最新版本”就不再足以回答“我现在运行的是什么，升级是否安全？” 版本号和变更日志就是回答这个问题的契约。

### 语义化版本

对于任何有消费者的东西，都使用 `MAJOR.MINOR.PATCH`，并让数字承载含义：

```
  MAJOR  breaking change — consumers must change their code to upgrade
  MINOR  new functionality, backward-compatible — safe to upgrade
  PATCH  bug fix, backward-compatible — safe to upgrade
```

这个数字就是一种承诺，因此让代码与它保持一致。一个改变了消费者所依赖行为的“补丁”，只是伪装成小改动的重大变更（Hyrum's Law，请参阅 `api-and-interface-design` skill）。当你不确定某项变更是否会造成破坏时，应假设它会；一次意外的重大版本升级，远比破坏消费者便宜得多。

### 标记发布版本，并让标签成为事实来源

发布版本是历史中不可变的节点，而不是一个不断移动的分支。为它创建标签，使其始终可以被复现：

```bash
git tag -a v1.4.0 -m "Release 1.4.0"
git push origin v1.4.0
```

应从标签派生版本，而不是在多个分散的文件中手动编辑版本号，这样 artifact、标签和变更日志就永远不会互相不一致。

### 编写面向人类的变更日志

变更日志不是 `git log`。它是经过整理、面向消费者的“改了什么，我是否需要关心？”的答案，应按 `Added / Changed / Fixed / Deprecated / Removed / Security` 分组，最新内容置于顶部，并且每条记录都应围绕用户影响来描述，而不是内部实现机制。

```markdown
## [1.4.0] - 2025-06-12
### Added
- Bulk task import via CSV
### Fixed
- Timezone drift in recurring task due dates
### Deprecated
- `GET /v1/tasks/all` — use the paginated `GET /v1/tasks` (removal in 2.0)
```

在实施变更的同一个变更集中编写对应条目，此时影响还很清晰；不要等到发布时再通过提交历史考古来重建。破坏性变更必须包含迁移说明和弃用窗口（遵循 `deprecation-and-migration` skill）；实际发布由 `shipping-and-launch` skill 负责，本节是为其提供依据的版本契约。

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “等功能完成后我再提交” | 一个巨大的提交既无法有效评审、调试，也无法回滚。应为每个切片分别提交。 |
| “提交消息不重要” | 提交消息就是文档。未来的你（以及未来的 agent）需要理解改了什么以及为什么改。 |
| “之后我会把它们全部压缩” | 压缩提交会破坏开发过程的脉络。从一开始就优先采用干净的增量提交。 |
| “分支会增加额外负担” | 短期分支成本很低，还能避免相互冲突的工作彼此碰撞。问题在于长期分支，应该在 1-3 天内合并。 |
| “之后再拆分这个变更” | 大型变更更难评审，部署风险更高，也更难回滚。应在提交之前拆分，而不是之后。 |
| “我不需要 `.gitignore`” | 直到 `.env` 中的生产环境密钥被提交进去。应立即设置。 |
| “这只是一个小修复，提升 patch 版本就行” | 检查消费者能够观察到什么。消费者依赖的行为发生变化就是 major 变更，无论 diff 有多小。 |
| “变更日志就是提交日志” | 提交是写给你自己的；变更日志是写给消费者的，应按影响进行整理。直接从原始提交生成变更日志，会掩盖真正重要的内容。 |
| “等发布时再写变更日志” | 到那时只能凭记忆重建影响，而且其中一半内容已经遗漏。应在变更发生时就写入对应条目。 |

## 危险信号

- 大量未提交的变更不断累积
- 提交消息类似于“修复”“更新”“杂项”
- 格式变更与行为变更混在一起
- 项目中没有 `.gitignore`
- 提交 `node_modules/`、`.env` 或构建产物
- 长期分支与 main 分支产生了严重分歧
- 向共享分支强制推送
- 破坏性变更却使用 minor 或 patch 版本升级发布
- 发布没有标签，或手动编辑的版本号与标签不同步
- 面向用户的发布没有变更日志条目，或者变更日志只是直接倾倒提交消息

## 验证

对于每个提交：

- [ ] 提交只做一件逻辑上的事情
- [ ] 提交消息说明原因，并遵循类型约定
- [ ] 提交前测试通过
- [ ] 差异中没有机密信息
- [ ] 没有将纯格式变更与行为变更混在一起
- [ ] `.gitignore` 覆盖标准排除项

对于每个发布（任何有消费者的发布）：

- [ ] 版本升级与变更相匹配：破坏性变更 → 主版本，新增功能 → 次版本，修复 → 补丁版本
- [ ] 发布已打标签，并且版本号来源于标签，而不是手动编辑后与标签不一致
- [ ] 变更日志包含针对该版本精心整理、按影响分类且便于人类阅读的条目