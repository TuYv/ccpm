---
name: commit-hygiene
description: Atomic commits, PR size limits, commit thresholds, stacked PRs
when-to-use: When committing code, creating PRs, or when change set is growing large
user-invocable: false
effort: low
---
# 提交卫生技能


**目的：** 保持提交的原子性、PR 易于审查，并确保 git 历史整洁。在变更规模变得过大之前，建议适时提交。

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
| **已更改文件** | 5-10 个文件 | > 10 个文件 | 立即提交 |
| **新增行数** | 150-300 行 | > 300 行 | 立即提交 |
| **删除行数** | 100-200 行 | > 200 行 | 立即提交 |
| **总变更量** | 250-400 行 | > 400 行 | 立即提交 |
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

### 提交触发条件（满足任意一项即提交）

| 触发条件 | 示例 |
|---------|---------|
| **测试通过** | 刚让测试变为通过 → 提交 |
| **功能完成** | 完成了一个函数 → 提交 |
| **重构完成** | 跨文件重命名了变量 → 提交 |
| **缺陷修复** | 修复了问题 → 提交 |
| **切换上下文之前** | 准备开始处理其他事情 → 提交 |
| **编译无误** | 代码编译或 lint 检查无误 → 提交 |
| **达到阈值** | > 5 个文件或 > 200 行 → 提交 |

### 出现以下情况时立即提交

- ✅ 之前失败的测试现在已通过
- ✅ 你准备进行一次“大改动”
- ✅ 你已经编码 30 分钟以上
- ✅ 你准备尝试有风险的操作
- ✅ 当前状态“可以正常工作”

### 不要等待以下条件

- ❌ “完美”的代码
- ❌ 所有功能完成
- ❌ 完整的测试覆盖率
- ❌ 自己完成代码审查
- ❌ 文档编写完成

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

### 不良提交（规模过大）

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

### 当 PR 过大时

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
| `fix` | Bug 修复 |
| `refactor` | 既不修复问题也不添加功能的代码变更 |
| `test` | 添加或更新测试 |
| `docs` | 仅文档变更 |
| `style` | 格式调整，无代码变更 |
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

### 部分暂存（拆分大型变更）

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

### 变更过大时取消暂存

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

### 开发过程中的定期检查

**Claude 应在每次重大变更后运行此检查：**

```bash
# Quick status
git diff --shortstat HEAD
```

**Claude 建议提交的阈值：**

| 条件 | Claude 操作 |
|-----------|---------------|
| 变更文件数 > 5 | 建议：“考虑提交当前变更” |
| 变更行数 > 200 | 建议：“变更规模正在增大，建议提交” |
| 文件数 > 10 或变更行数 > 400 | 警告：“⚠️ 请立即提交，以免变更变得难以管理” |
| 测试刚刚通过 | 建议：“这是一个很好的检查点——提交这些已通过测试的变更” |
| 重构完成 | 建议：“重构已完成——在添加功能前提交” |

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

## 堆叠式 PR（适用于大型功能）

当某项功能确实很大时，请使用堆叠式 PR：

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

### 创建堆叠式 PR

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

- [ ] 更改只服务于一个逻辑目的
- [ ] 测试通过（如适用）
- [ ] 代码检查/类型检查通过
- [ ] 更改的文件少于 10 个
- [ ] 总行数少于 400 行
- [ ] 提交消息只描述一件事

### 创建 PR 前

- [ ] 总行数少于 400 行（理想情况下少于 200 行）
- [ ] 所有提交都是原子性的
- [ ] 没有包含“WIP”或“fixup”的提交
- [ ] PR 标题描述了所做的更改
- [ ] 描述解释了为什么要改，而不只是改了什么

### 危险信号（停止并拆分）

- ❌ 提交消息中需要使用“and”
- ❌ 单次提交涉及超过 10 个文件
- ❌ 单次提交超过 400 行
- ❌ 混合了功能、修复和重构
- ❌ “我稍后会清理这个”

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

### 出现以下情况时立即提交

- ✅ 测试刚刚通过
- ✅ 更改超过 200 行
- ✅ 更改超过 5 个文件
- ✅ 即将切换任务
- ✅ 当前状态是“可正常工作”