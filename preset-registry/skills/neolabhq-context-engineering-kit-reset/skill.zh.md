---
name: reset
description: "Reset the FPF reasoning cycle to start fresh"
---
# 重置周期

重置 FPF 推理周期，以便重新开始。

## 操作（运行时）

### 选项 1：软重置（归档当前会话）

创建会话归档并清除活动工作：

1. **创建会话归档**

在 `.fpf/sessions/` 中创建一个文件，用于记录已完成或已放弃的会话：

```markdown
# In .fpf/sessions/session-2025-01-15-reset.md
---
id: session-2025-01-15-reset
action: reset
created: 2025-01-15T16:00:00Z
reason: user_requested
---

# Session Archive: 2025-01-15

**Reset Reason**: User requested fresh start

## State at Reset

### Hypotheses
- L0: 2 (proposed)
- L1: 1 (verified)
- L2: 0 (validated)
- Invalid: 1 (rejected)

### Files Archived
- .fpf/knowledge/L0/hypothesis-a.md
- .fpf/knowledge/L0/hypothesis-b.md
- .fpf/knowledge/L1/hypothesis-c.md

### Decision Status
No decision was finalized.

## Notes

Session ended without decision. Hypotheses preserved for potential future reference.
```

2. **将活动工作移至归档**（可选）

如果用户希望清空知识目录：

```bash
mkdir -p .fpf/archive/session-2025-01-15
mv .fpf/knowledge/L0/*.md .fpf/archive/session-2025-01-15/ 2>/dev/null || true
mv .fpf/knowledge/L1/*.md .fpf/archive/session-2025-01-15/ 2>/dev/null || true
mv .fpf/knowledge/L2/*.md .fpf/archive/session-2025-01-15/ 2>/dev/null || true
```

3. **向用户报告**

```markdown
## Reset Complete

Session archived to: .fpf/sessions/session-2025-01-15-reset.md

Current state:
- L0: 0 hypotheses
- L1: 0 hypotheses
- L2: 0 hypotheses

Ready for new reasoning cycle. Run `/fpf:propose-hypotheses` to start.
```

### 选项 2：硬重置（全部删除）

**警告**：这将永久删除所有 FPF 数据。

```bash
rm -rf .fpf/knowledge/L0/*.md
rm -rf .fpf/knowledge/L1/*.md
rm -rf .fpf/knowledge/L2/*.md
rm -rf .fpf/knowledge/invalid/*.md
rm -rf .fpf/evidence/*.md
rm -rf .fpf/decisions/*.md
```

仅在用户明确要求时执行此操作。

### 选项 3：决策重置（保留知识）

如果用户希望重新评估现有假设：

1. 将 L2 假设移回 L1（重新审核）
2. 或将 L1 假设移回 L0（重新验证）

```bash
# Re-audit: L2 -> L1
mv .fpf/knowledge/L2/*.md .fpf/knowledge/L1/

# Re-verify: L1 -> L0
mv .fpf/knowledge/L1/*.md .fpf/knowledge/L0/
```