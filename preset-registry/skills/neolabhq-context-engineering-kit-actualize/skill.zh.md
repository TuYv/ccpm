---
name: actualize
description: "Reconcile the project's FPF state with recent repository changes"
---
# 更新知识库

此命令是维护动态保证论证的核心组成部分。它使你的 FPF 知识库（`.fpf/`）与项目代码库不断演变的实际情况保持同步。

该命令针对最近的 git 变更执行三部分审计，以发现潜在的上下文漂移、陈旧证据和过时决策。这与 FPF 规范演化循环（B.4）的**观察**阶段保持一致，并有助于管理**认知债务**（B.3.4）。

## 操作（运行时）

### 第 1 步：检查 Git 变更

运行 git 命令，以识别自上次更新以来的变更：

```bash
# Get current commit hash
git rev-parse HEAD

# Check for changes since last known baseline
# (Read .fpf/.baseline file if it exists, otherwise use initial commit)
git diff --name-only <baseline_commit> HEAD

# List all changed files
git diff --stat <baseline_commit> HEAD
```

### 第 2 步：分析报告中的上下文漂移

1. 检查核心项目配置中发生变更的文件：
   - `package.json`、`go.mod`、`Cargo.toml`、`requirements.txt`
   - `Dockerfile`、`docker-compose.yml`
   - `.env.example`、配置文件

2. 如果配置文件发生了变更：
   - 重新读取项目结构（README、配置文件）
   - 将检测到的上下文与 `.fpf/context.md` 进行比较
   - 向用户展示差异

3. 询问用户是否希望更新 `context.md`

### 第 3 步：分析报告中的证据陈旧性（认知债务）

1. 读取 `.fpf/evidence/` 中的所有证据文件
2. 检查每个证据文件中的 `carrier_ref` 字段
3. 与 git diff 中发生变更的文件进行交叉核对
4. 如果某个被引用的文件发生了变更：
   - 将该证据标记为 **陈旧**
   - 注明受影响的假设

### 第 4 步：分析报告中的决策相关性

1. 读取 `.fpf/decisions/` 中的所有 DRR 文件
2. 回溯到源证据文件和假设文件
3. 如果基础文件发生了变更：
   - 将该 DRR 标记为**可能已过时**

### 第 5 步：更新基线

创建或更新 `.fpf/.baseline` 文件：

```
# FPF Actualization Baseline
# Last actualized: 2025-01-15T16:00:00Z
commit: abc123def456
```

### 第 6 步：展示调查结果

输出结构化报告：

```markdown
## Actualization Report

**Baseline**: abc123 (2025-01-10)
**Current**: def456 (2025-01-15)
**Files Changed**: 42

### Context Drift

The following configuration files have changed:
- package.json (+5 dependencies)
- Dockerfile (base image updated)

**Action Required**: Review and update `.fpf/context.md` if constraints have changed.

### Stale Evidence (3 items)

| Evidence | Hypothesis | Changed File |
|----------|------------|--------------|
| ev-benchmark-api | api-optimization | src/api/handler.ts |
| ev-test-auth | auth-module | src/auth/login.ts |
| ev-perf-db | db-indexing | migrations/002.sql |

**Action Required**: Re-validate to refresh evidence for affected hypotheses.

### Decisions to Review (1 item)

| DRR | Affected By |
|-----|-------------|
| DRR-2025-01-10-api-design | src/api/handler.ts changed |

**Action Required**: Consider re-evaluating decision via `/fpf:propose-hypotheses`.

### Summary

- Context drift detected: YES
- Stale evidence: 3 items
- Decisions to review: 1 item

Run `/fpf:decay` for detailed freshness management.
```

## 文件：.fpf/.baseline

记录上次实际化时间点：

```yaml
# FPF Actualization Baseline
last_actualized: 2025-01-15T16:00:00Z
commit: abc123def456789
branch: main
```

## 何时运行

- **开始新工作之前**：确保知识库处于最新状态
- **重大变更之后**：将证据与代码变更同步
- **每周维护**：作为定期维护的一部分
- **做出决策之前**：确保证据仍然有效