---
name: checkpoint-mode
description: Pause for review every N tasks - selective autonomy pattern
agent_types: [orchestrator]
research_source: timdettmers.com
activation: configurable
---
# 检查点模式技能

## 概述

实现**选择性自主**——通过反馈循环，以较短周期开展自主工作。

**研究来源：** Tim Dettmers 的《使用智能体，否则就会落后》

---

## 理念

> “超过 90% 的代码都应由智能体编写，但系统设计应采用迭代方式，通过反馈循环，以较短周期开展自主工作。”
> — Tim Dettmers，2026

**持续自主模式存在的问题：**
- 可能在错误的方法上浪费资源
- 没有调整方向的机会
- 用户感觉与进展脱节

**解决方案：**
- 每完成 N 个任务或经过 M 分钟后暂停
- 生成成果摘要
- 等待明确批准后再继续

---

## 何时使用

### 在以下情况中使用检查点模式：
- **新颖项目**，其实施方法可能需要调整
- **高成本操作**（昂贵的 API 调用、云资源）
- **学习阶段**，用户希望引导方向
- **受监管环境**，需要审计跟踪记录

### 在以下情况中使用持续模式：
- **定义明确的 PRD**，具有清晰的需求
- **成熟的模式**，具有较高可信度
- **夜间构建**，不希望被中断
- **CI/CD 流水线**，需要完全自动化

---

## 配置

```bash
# Enable checkpoint mode
LOKI_AUTONOMY_MODE=checkpoint

# Pause frequency
LOKI_CHECKPOINT_FREQUENCY=10  # tasks
LOKI_CHECKPOINT_TIME=60  # minutes

# Always pause after these phases
LOKI_CHECKPOINT_PHASES="architecture,deployment"
```

---

## 检查点工作流

```
[Work on 10 tasks] → [Pause] → [Generate Summary] → [Wait for Approval]
                                                           ↓
                                              [User reviews and approves]
                                                           ↓
                                                    [Resume work]
```

### 到达检查点时：

1. **生成摘要**
   ```markdown
   # Checkpoint Summary

   ## Tasks Completed (10)
   - Implemented POST /api/todos endpoint
   - Added unit tests (95% coverage)
   - Set up CI/CD pipeline
   - ...

   ## Next Actions
   - Deploy to staging
   - Run integration tests
   - Security audit

   ## Resources Used
   - 15 minutes elapsed
   - 3 Haiku agents, 2 Sonnet agents
   - Estimated cost: $0.45
   ```

2. **创建批准信号**
   ```bash
   # System writes:
   .loki/signals/CHECKPOINT_SUMMARY_2026-01-14-10-30.md

   # User reviews and creates:
   .loki/signals/CHECKPOINT_APPROVED
   ```

3. **等待批准**
   - 编排器暂停执行
   - 监控批准信号
   - 检测到信号后恢复执行

---

## 智能体指令（编排器）

当 `LOKI_AUTONOMY_MODE=checkpoint` 时：

```python
completed_tasks = load_completed_tasks()
tasks_since_checkpoint = completed_tasks - last_checkpoint_count

if tasks_since_checkpoint >= CHECKPOINT_FREQUENCY:
    # Pause and generate summary
    summary = generate_checkpoint_summary()
    write_signal("CHECKPOINT_SUMMARY", summary)

    # Wait for approval
    log_info("Waiting for checkpoint approval...")
    while not signal_exists("CHECKPOINT_APPROVED"):
        sleep(5)

    # Resume work
    remove_signal("CHECKPOINT_APPROVED")
    log_info("Checkpoint approved. Resuming work...")
    last_checkpoint_count = completed_tasks
```

---

## 与其他模式的比较

| 模式 | 最适合 | 审批频率 | 使用场景 |
|------|----------|-------------------|----------|
| **永久模式** | 夜间构建 | 从不 | 完全自动化的 CI/CD |
| **检查点模式** | 新颖项目 | 每 10 个任务 | 学习新领域 |
| **监督模式** | 关键系统 | 每个任务 | 生产环境部署 |

---

## 指标

跟踪检查点的有效性：

```json
{
  "checkpoint_id": "cp-2026-01-14-001",
  "tasks_completed": 10,
  "time_elapsed_minutes": 15,
  "approval_time_seconds": 45,
  "course_corrections": 0,
  "user_satisfaction": "approved_without_changes"
}
```

存储位置：`.loki/metrics/checkpoint-mode/`

---

## 参考资料

- `references/production-patterns.md` - HN 生产环境洞见
- [timdettmers.com/use-agents-or-be-left-behind](https://timdettmers.com/2026/01/13/use-agents-or-be-left-behind/)

---

**版本：** 1.0.0