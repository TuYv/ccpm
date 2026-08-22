---
name: status
description: "Display the current state of the FPF knowledge base"
---
# 状态检查

显示 FPF 知识库的当前状态。

## 操作（运行时）

1. **检查目录结构：** 验证 `.fpf/` 是否存在并包含所需的子目录。
2. **统计假设：** 列出每个知识层中的文件：
    - `.fpf/knowledge/L0/`（已提出）
    - `.fpf/knowledge/L1/`（已验证）
    - `.fpf/knowledge/L2/`（已确认）
    - `.fpf/knowledge/invalid/`（已拒绝）
3. **检查证据时效性：** 扫描 `.fpf/evidence/` 中是否存在已过期的证据。
4. **统计决策：** 列出 `.fpf/decisions/` 中的文件。
5. **向用户报告。**

## 状态报告格式

```markdown
## FPF Status

### Directory Structure
- [x] .fpf/ exists
- [x] knowledge/L0/ exists
- [x] knowledge/L1/ exists
- [x] knowledge/L2/ exists
- [x] evidence/ exists
- [x] decisions/ exists

### Current Phase
Based on hypothesis distribution: ABDUCTION | DEDUCTION | INDUCTION | DECISION | IDLE

### Hypothesis Counts

| Layer | Count | Status |
|-------|-------|--------|
| L0 (Proposed) | 3 | Awaiting verification |
| L1 (Verified) | 2 | Awaiting validation |
| L2 (Validated) | 1 | Ready for decision |
| Invalid | 1 | Rejected |

### Evidence Status

| Total | Fresh | Stale | Expired |
|-------|-------|-------|---------|
| 5 | 3 | 1 | 1 |

### Warnings

- 1 evidence file is EXPIRED: ev-benchmark-old-2024-06-15
- Consider running `/fpf:decay` to review stale evidence

### Recent Decisions

| DRR | Date | Winner |
|-----|------|--------|
| DRR-2025-01-15-use-redis | 2025-01-15 | redis-caching |
```

## 阶段检测逻辑

通过检查知识库状态来确定当前阶段：

| 条件 | 阶段 | 后续步骤 |
|-----------|-------|-----------|
| 不存在 `.fpf/` 目录 | 未初始化 | 运行 `/fpf:propose-hypotheses` |
| L0 > 0，L1 = 0，L2 = 0 | 溯因 | 继续进行验证 |
| L1 > 0，L2 = 0 | 演绎 | 继续进行确认 |
| L2 > 0，且没有近期 DRR | 归纳 | 继续进行审计和决策 |
| 存在近期 DRR | 决策完成 | 审查决策 |
| 全部为空 | 空闲 | 运行 `/fpf:propose-hypotheses` |

## 证据时效性检查

对于 `.fpf/evidence/` 中的每个证据文件：
1. 从 frontmatter 中读取 `valid_until` 字段
2. 与当前日期进行比较
3. 分类：
   - **新鲜：** `valid_until` > 今天 + 30 天
   - **陈旧：** `valid_until` > 今天，但 < 今天 + 30 天
   - **已过期：** `valid_until` < 今天

如果存在任何陈旧或已过期的证据，请警告用户并建议运行 `/fpf:decay`。

## 输出示例

```
## FPF Status

### Current Phase: DEDUCTION

You have 3 hypotheses in L0 awaiting verification.
Next step: Continue the FPF workflow to process L0 hypotheses.

### Hypothesis Counts

| Layer | Count |
|-------|-------|
| L0 | 3 |
| L1 | 0 |
| L2 | 0 |
| Invalid | 0 |

### Evidence Status

No evidence files yet (hypotheses not validated).

### No Warnings

All systems nominal.
```