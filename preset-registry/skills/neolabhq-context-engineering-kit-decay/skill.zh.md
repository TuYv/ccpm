---
name: decay
description: "Manage evidence freshness by identifying stale decisions and providing governance actions"
---
# 证据新鲜度管理

通过识别过时的决策并提供治理操作来管理**证据新鲜度**。实现 FPF B.3.4（证据衰减）。

**核心原则：** 证据具有时效性。基于过期证据做出的决策会带来隐性风险。

---

## 概念速览

### 什么是“过时”证据？

每项证据都有一个 `valid_until` 日期。6 个月前的基准测试可能已无法反映当前的系统性能。在重大依赖项更新之前进行的安全审计无法涵盖新的漏洞。

当证据过期时，其支持的决策将变得**值得质疑**——并不一定是错误的，只是未经验证。

### 什么是“豁免”？

**豁免 =“我知道这项证据已经过时，并暂时接受该风险。”**

适用于以下情况：
- 即将发布，没有时间重新运行所有测试
- 证据仅略微过期，很可能仍然有效
- 已安排明确日期对其进行妥善更新

豁免并不意味着忽略问题，而是**明确记录**你已知晓该风险，并在特定日期之前接受该风险。

### 三种操作

| 情况 | 操作 | 作用 |
|-----------|--------|--------------|
| 证据已过时，但决策仍然合理 | **更新** | 重新运行测试，获取最新证据 |
| 决策已失效，需要重新考虑 | **弃用** | 降低假设层级，重新开始评估 |
| 暂时接受风险 | **豁免** | 记录风险接受情况及截止日期 |

---

## 操作（运行时）

### 第 1 步：生成新鲜度报告

1. 列出 `.fpf/evidence/` 中的所有证据文件
2. 对于每个证据文件：
   - 从 frontmatter 中读取 `valid_until`
   - 与当前日期进行比较
   - 分类为 FRESH、STALE 或 EXPIRED

### 第 2 步：展示报告

```markdown
## Evidence Freshness Report

### EXPIRED (Requires Action)

| Evidence | Hypothesis | Expired | Days Overdue |
|----------|------------|---------|--------------|
| ev-benchmark-2024-06-15 | redis-caching | 2024-12-15 | 45 |
| ev-security-2024-07-01 | auth-module | 2025-01-01 | 14 |

### STALE (Warning)

| Evidence | Hypothesis | Expires | Days Left |
|----------|------------|---------|-----------|
| ev-loadtest-2024-10-01 | api-gateway | 2025-01-20 | 5 |

### FRESH

| Evidence | Hypothesis | Expires |
|----------|------------|---------|
| ev-unittest-2025-01-10 | validation-lib | 2025-07-10 |

### WAIVED

| Evidence | Waived Until | Rationale |
|----------|--------------|-----------|
| ev-perf-old | 2025-02-01 | Migration pending |
```

### 第 3 步：处理用户操作

根据用户的响应，执行以下操作之一：

#### 更新

用户：“更新 Redis 缓存证据”

1. 导航到 `.fpf/knowledge/L2/` 中的假设
2. 重新运行验证以创建最新证据

#### 弃用

用户：“弃用身份验证模块决策”

1. 将假设从 L2 移至 L1（或从 L1 移至 L0）
2. 创建弃用记录：

```markdown
# In .fpf/evidence/deprecate-auth-module-2025-01-15.md
---
id: deprecate-auth-module-2025-01-15
hypothesis_id: auth-module
action: deprecate
from_layer: L2
to_layer: L1
created: 2025-01-15T10:00:00Z
---

# Deprecation: auth-module

**Reason**: Evidence expired, technology landscape changed

**Next Steps**: Run `/fpf:propose-hypotheses` to explore alternatives
```

3. 移动假设文件：
```bash
mv .fpf/knowledge/L2/auth-module.md .fpf/knowledge/L1/auth-module.md
```

#### 豁免

用户：“豁免该基准测试，直到二月份”

1. 创建豁免记录：

```markdown
# In .fpf/evidence/waiver-benchmark-2025-01-15.md
---
id: waiver-benchmark-2025-01-15
evidence_id: ev-benchmark-2024-06-15
waived_until: 2025-02-01
created: 2025-01-15T10:00:00Z
---

# Waiver: ev-benchmark-2024-06-15

**Evidence**: ev-benchmark-2024-06-15
**Hypothesis**: redis-caching
**Waived Until**: 2025-02-01
**Rationale**: Migration pending, will re-run after completion

**Accepted By**: User
**Created**: 2025-01-15

**WARNING**: This evidence returns to EXPIRED status after 2025-02-01.
```

---

## 自然语言用法

**你不需要记住证据 ID。**只需描述你想要执行的操作。

### 工作流示例

```
User: /fpf:decay

Agent shows report with stale evidence

User: Waive the benchmark until February, we'll re-run it after the migration.

Agent: Creating waiver for ev-benchmark-2024-06-15 until 2025-02-01.
       Rationale: "Re-run after migration"

       [Creates .fpf/evidence/waiver-benchmark-2025-01-15.md]

User: The vendor API is being discontinued. Deprecate that decision.

Agent: Deprecating hypothesis-vendor-api from L2 to L1.
       [Moves file, creates deprecation record]

       Next step: Run /fpf:propose-hypotheses to explore alternatives.
```

---

## WLNK 原则

如果某个假设的*任何*证据已过期（且未被豁免），则该假设为 **STALE**。

这就是最弱环节（WLNK）原则：可靠性 = min(所有证据)。一条过期证据就会使整个决策的可信度受到质疑。

---

## 审计跟踪

所有操作都会被记录：

| 操作 | 记录的内容 |
|--------|-----------------|
| 弃用 | from_layer, to_layer, reason, date |
| 豁免 | evidence_id, until_date, rationale, date |

在 `.fpf/evidence/` 中创建的文件：
- `deprecate-{hypothesis}-{date}.md`
- `waiver-{evidence}-{date}.md`

---

## 常见工作流

### 每周维护
```
/fpf:decay                    # See what's stale
# For each stale item: refresh, deprecate, or waive
```

### 发布前
```
/fpf:decay                    # Check for stale decisions
# Either refresh evidence or explicitly waive with documented rationale
# Waiver rationales become part of release documentation
```

### 重大变更后
```
# Dependency update, API change, security advisory...
/fpf:decay                    # See what's affected
# Deprecate obsolete decisions
# Start new hypothesis cycle for replacements
```