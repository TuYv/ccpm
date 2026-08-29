---
name: commit-hygiene
description: Atomic commits, PR size limits, commit thresholds, stacked PRs
when-to-use: When committing code, creating PRs, or when change set is growing large
user-invocable: false
effort: low
---
# 提交规范 Skill


**目的：** 保持提交原子化、PR 易于审查，并确保 git 历史记录整洁。在变更变得过大之前，提醒何时应该提交。

---

## 核心理念

```
┌─────────────────────────────────────────────────────────────────┐
│  ATOMIC COMMITS                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  One logical change per commit.                                  │
│  Each commit should be self-contained and deployable.            │
│  If you need "and" to describe it, split it.                     │
├─────────────────────────────────────────────────────────────────┤
│  SMALL PRS WIN                                                   │
│  ─────────────────────────────────────────────────────────────  │
│  < 400 lines changed = reviewed in < 1 hour                      │
│  > 1000 lines = likely rubber-stamped or abandoned               │
│  Smaller PRs = faster reviews, fewer bugs, easier reverts        │
├─────────────────────────────────────────────────────────────────┤
│  COMMIT EARLY, COMMIT OFTEN                                      │
│  ─────────────────────────────────────────────────────────────  │
│  Working code? Commit it.                                        │
│  Test passing? Commit it.                                        │
│  Don't wait for "done" - commit at every stable point.           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 提交大小阈值

### 警告阈值（该提交了！）

| 指标 | 黄色区域 | 红色区域 | 操作 |
|--------|-------------|----------|--------|
| **变更文件数** | 5-10 个文件 | > 10 个文件 | 立即提交 |
| **新增行数** | 150-300 行 | > 300 行 | 立即提交 |
| **删除行数** | 100-200 行 | > 200 行 | 立即提交 |
| **变更总数** | 250-400 行 | > 400 行 | 立即提交 |
| **距上次提交的时间** | 30-60 分钟 | > 60 分钟 | 考虑提交 |

### 理想的提交大小

```
┌─────────────────────────────────────────────────────────────────┐
│  IDEAL COMMIT                                                    │
│  ─────────────────────────────────────────────────────────────  │
│  Files: 1-5                                                      │
│  Lines: 50-200 total changes                                     │
│  Scope: Single logical unit of work                              │
│  Message: Describes ONE thing                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 检查当前状态（频繁运行）

### 快速状态检查

```bash
# See what's changed (staged + unstaged)
git status --short

# Count files and lines changed
git diff --stat
git diff --cached --stat  # Staged only

# Get totals
git diff --shortstat
# Example output: 8 files changed, 245 insertions(+), 32 deletions(-)
```

### 详细变更分析

```bash
# Full diff summary with file names
git diff --stat HEAD

# Just the numbers
git diff --numstat HEAD | awk '{add+=$1; del+=$2} END {print "+"add" -"del" total:"add+del}'

# Files changed count
git status --porcelain | wc -l
```

### 提交前检查脚本

```bash
#!/bin/bash
# scripts/check-commit-size.sh

# Thresholds
MAX_FILES=10
MAX_LINES=400
WARN_FILES=5
WARN_LINES=200

# Get stats
FILES=$(git status --porcelain | wc -l | tr -d ' ')
STATS=$(git diff --shortstat HEAD 2>/dev/null)
INSERTIONS=$(echo "$STATS" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo 0)
DELETIONS=$(echo "$STATS" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo 0)
TOTAL=$((INSERTIONS + DELETIONS))

echo "📊 Current changes: $FILES files, +$INSERTIONS -$DELETIONS ($TOTAL total lines)"

# Check thresholds
if [ "$FILES" -gt "$MAX_FILES" ] || [ "$TOTAL" -gt "$MAX_LINES" ]; then
    echo "🔴 RED ZONE: Commit immediately! Changes are too large."
    echo "   Consider splitting into multiple commits."
    exit 1
elif [ "$FILES" -gt "$WARN_FILES" ] || [ "$TOTAL" -gt "$WARN_LINES" ]; then
    echo "🟡 WARNING: Changes getting large. Commit soon."
    exit 0
else
    echo "🟢 OK: Changes are within healthy limits."
    exit 0
fi
```

---

## 何时提交

### 提交触发条件（满足任意一项即可提交）

| 触发条件 | 示例 |
|---------|---------|
| **测试通过** | 刚刚让一个测试变绿 → 提交 |
| **功能完成** | 完成一个函数 → 提交 |
| **重构完成** | 跨文件重命名变量 → 提交 |
| **Bug 修复** | 修复问题 → 提交 |
| **即将切换上下文** | 准备处理其他事情 → 提交 |
| **编译通过** | 代码编译/lint 均无问题 → 提交 |
| **达到阈值** | > 5 个文件或 > 200 行 → 提交 |

### 以下情况应立即提交

- ✅ 测试从失败变为通过
- ✅ 你即将进行一次“大改动”
- ✅ 你已经连续编码 30 分钟以上
- ✅ 你即将尝试有风险的操作
- ✅ 当前状态“可以正常工作”

### 不要等到

- ❌ 代码“完美”
- ❌ 所有功能都完成
- ❌ 完整的测试覆盖率
- ❌ 自己进行代码审查
- ❌ 文档完成

---

## 原子提交模式

### 良好的原子提交

```
✅ "Add email validation to signup form"
   - 3 files: validator.ts, signup.tsx, signup.test.ts
   - 120 lines changed
   - Single purpose: email validation

✅ "Fix null pointer in user lookup"
   - 2 files: userService.ts, userService.test.ts
   - 25 lines changed
   - Single purpose: fix one bug

✅ "Refactor: Extract PaymentProcessor class"
   - 4 files: payment.ts → paymentProcessor.ts + types
   - 180 lines changed
   - Single purpose: refactoring
```

### 糟糕的提交（过于庞大）

```
❌ "Add authentication, fix bugs, update styles"
   - 25 files changed
   - 800 lines changed
   - Multiple purposes mixed

❌ "WIP"
   - Unknown scope
   - No clear purpose
   - Hard to review/revert

❌ "Updates"
   - 15 files changed
   - Mix of features, fixes, refactors
   - Impossible to review properly
```

---

## 拆分大型改动

### 策略 1：按层拆分

```
Instead of one commit with:
  - API endpoint + database migration + frontend + tests

Split into:
  1. "Add users table migration"
  2. "Add User model and repository"
  3. "Add GET /users endpoint"
  4. "Add UserList component"
  5. "Add integration tests for user flow"
```

### 策略 2：按功能切片

```
Instead of one commit with:
  - All CRUD operations for users

Split into:
  1. "Add create user functionality"
  2. "Add read user functionality"
  3. "Add update user functionality"
  4. "Add delete user functionality"
```

### 策略 3：先重构

```
Instead of:
  - Feature + refactoring mixed

Split into:
  1. "Refactor: Extract validation helpers" (no behavior change)
  2. "Add email validation using new helpers" (new feature)
```

### 策略 4：按风险级别

```
Instead of:
  - Safe changes + risky changes together

Split into:
  1. "Update dependencies" (safe, isolated)
  2. "Migrate to new API version" (risky, separate)
```

---

## PR 大小指南

### 最佳 PR 大小

| 指标 | 最佳 | 可接受 | 过大 |
|--------|---------|------------|-----------|
| **文件数** | 1-10 | 10-20 | > 20 |
| **变更行数** | 50-200 | 200-400 | > 400 |
| **提交数** | 1-5 | 5-10 | > 10 |
| **审查时间** | < 30 分钟 | 30-60 分钟 | > 60 分钟 |

### PR 大小与缺陷率

```
┌─────────────────────────────────────────────────────────────────┐
│  RESEARCH FINDINGS (Google, Microsoft studies)                  │
│  ─────────────────────────────────────────────────────────────  │
│  PRs < 200 lines: 15% defect rate                               │
│  PRs 200-400 lines: 23% defect rate                             │
│  PRs > 400 lines: 40%+ defect rate                              │
│                                                                 │
│  Review quality drops sharply after 200-400 lines.              │
│  Large PRs get "LGTM" rubber stamps, not real reviews.          │
└─────────────────────────────────────────────────────────────────┘
```

### PR 过大时

```bash
# Check PR size before creating
git diff main --stat
git diff main --shortstat

# If too large, consider:
# 1. Split into multiple PRs (stacked PRs)
# 2. Create feature flag and merge incrementally
# 3. Use draft PR for early feedback
```

---

## 提交消息格式

### 结构

```
<type>: <description> (50 chars max)

[optional body - wrap at 72 chars]

[optional footer]
```

### 类型

| 类型 | 用途 |
|------|---------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `refactor` | 既不修复问题也不添加功能的代码变更 |
| `test` | 添加或更新测试 |
| `docs` | 仅文档变更 |
| `style` | 格式调整，不涉及代码变更 |
| `chore` | 构建、配置、依赖项 |

### 示例

```
feat: Add email validation to signup form

fix: Prevent null pointer in user lookup

refactor: Extract PaymentProcessor class

test: Add integration tests for checkout flow

chore: Update dependencies to latest versions
```

---

## Git 工作流集成

### 用于大小检查的提交前钩子

```bash
#!/bin/bash
# .git/hooks/pre-commit

MAX_LINES=400
MAX_FILES=15

FILES=$(git diff --cached --name-only | wc -l | tr -d ' ')
STATS=$(git diff --cached --shortstat)
INSERTIONS=$(echo "$STATS" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo 0)
DELETIONS=$(echo "$STATS" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo 0)
TOTAL=$((INSERTIONS + DELETIONS))

if [ "$TOTAL" -gt "$MAX_LINES" ]; then
    echo "❌ Commit too large: $TOTAL lines (max: $MAX_LINES)"
    echo "   Consider splitting into smaller commits."
    echo "   Use 'git add -p' for partial staging."
    exit 1
fi

if [ "$FILES" -gt "$MAX_FILES" ]; then
    echo "❌ Too many files: $FILES (max: $MAX_FILES)"
    echo "   Consider splitting into smaller commits."
    exit 1
fi

echo "✅ Commit size OK: $FILES files, $TOTAL lines"
```

### 部分暂存（拆分大型更改）

```bash
# Stage specific hunks interactively
git add -p

# Stage specific files
git add path/to/specific/file.ts

# Stage with preview
git add -N file.ts  # Intent to add
git diff            # See what would be added
git add file.ts     # Actually add
```

### 如果更改过大则取消暂存

```bash
# Unstage everything
git reset HEAD

# Unstage specific files
git reset HEAD path/to/file.ts

# Stage just what you need for THIS commit
git add -p
```

---

## Claude 集成

### 开发期间定期检查

**Claude 应在每次重大更改后运行此检查：**

```bash
# Quick status
git diff --shortstat HEAD
```

**Claude 建议提交时的阈值：**

| 条件 | Claude 操作 |
|-----------|---------------|
| 更改的文件数 > 5 | 建议：“考虑提交当前更改” |
| 更改的行数 > 200 | 建议：“更改正在变得过大，建议提交” |
| 文件数 > 10 或行数 > 400 | 警告：“⚠️ 立即提交，避免更改变得难以管理” |
| 测试刚刚通过 | 建议：“很好的检查点——提交这些已通过的测试” |
| 重构完成 | 建议：“重构完成——在添加功能前提交” |

### Claude 提交提醒消息

```
📊 Status: 7 files changed, +180 -45 (225 total)
💡 Approaching commit threshold. Consider committing current work.

---

📊 Status: 12 files changed, +320 -80 (400 total)
⚠️ Changes are large! Commit now to keep PRs reviewable.
   Suggested commit: "feat: Add user authentication flow"

---

📊 Status: 3 files changed, +85 -10 (95 total)
✅ Tests passing. Good time to commit!
   Suggested commit: "fix: Validate email format on signup"
```

---

## 堆叠 PR（适用于大型功能）

当一个功能确实很大时，请使用堆叠 PR：

```
┌─────────────────────────────────────────────────────────────────┐
│  STACKED PR PATTERN                                             │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  main ─────────────────────────────────────────────────────────│
│    └── PR #1: Database schema (200 lines) ← Review first       │
│         └── PR #2: API endpoints (250 lines) ← Review second   │
│              └── PR #3: Frontend (300 lines) ← Review third    │
│                                                                 │
│  Each PR is reviewable independently.                           │
│  Merge in order: #1 → #2 → #3                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 创建堆叠 PR

```bash
# Create base branch
git checkout -b feature/auth-schema
# ... make changes ...
git commit -m "feat: Add users table schema"
git push -u origin feature/auth-schema
gh pr create --base main --title "feat: Add users table schema"

# Create next branch FROM the first
git checkout -b feature/auth-api
# ... make changes ...
git commit -m "feat: Add authentication API endpoints"
git push -u origin feature/auth-api
gh pr create --base feature/auth-schema --title "feat: Add auth API endpoints"

# And so on...
```

---

## 检查清单

### 每次提交前

- [ ] 更改仅针对一个逻辑目的
- [ ] 测试通过（如适用）
- [ ] Lint/typecheck 通过
- [ ] 更改文件数 < 10
- [ ] 总行数 < 400
- [ ] 提交消息只描述一件事

### 创建 PR 前

- [ ] 总行数 < 400（理想情况下 < 200）
- [ ] 所有提交都是原子性的
- [ ] 没有 “WIP” 或 “fixup” 提交
- [ ] PR 标题描述了此次更改
- [ ] 描述解释了为什么更改，而不只是更改了什么

### 警示信号（停止并拆分）

- ❌ 提交消息中需要使用 “and”
- ❌ 一个提交中包含 > 10 个文件
- ❌ 一个提交中包含 > 400 行
- ❌ 混合了功能、修复和重构
- ❌ “我之后再清理”

---

## 快速参考

### 阈值

```
Files:  ≤ 5 = 🟢  |  6-10 = 🟡  |  > 10 = 🔴
Lines:  ≤ 200 = 🟢  |  201-400 = 🟡  |  > 400 = 🔴
Time:   ≤ 30min = 🟢  |  30-60min = 🟡  |  > 60min = 🔴
```

### 命令

```bash
# Quick status
git diff --shortstat HEAD

# Detailed file list
git diff --stat HEAD

# Partial staging
git add -p

# Check before PR
git diff main --shortstat
```

### 满足以下情况时立即提交

- ✅ 测试刚刚通过
- ✅ 更改超过 200 行
- ✅ 更改超过 5 个文件
- ✅ 即将切换任务
- ✅ 当前状态为“可正常工作”