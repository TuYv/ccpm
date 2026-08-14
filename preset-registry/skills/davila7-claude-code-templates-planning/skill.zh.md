---
name: planning
description: Create and manage persistent markdown planning files for structured task execution. Use when the user asks to "create a plan", "track progress", "start a research project", or when a task requires more than 5 tool calls and needs structured phase tracking to stay focused and avoid goal drift.
---
# AI Maestro 规划

解决执行问题——在复杂的多步骤任务中保持专注。使用持久化 Markdown 文件来跟踪目标、发现和进度，确保你永远不会丢失上下文。属于 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 套件的一部分。

## 何时使用

- 多步骤任务（3 个以上步骤）
- 研究项目
- 构建需要调用工具 5 次以上的功能
- 任何可能让你偏离目标的任务

## 三文件模式

在 `docs_dev/`（或 `$AIMAESTRO_PLANNING_DIR`）中创建：

| 文件 | 用途 | 更新时机 |
|------|---------|-------------|
| `task_plan.md` | 目标、阶段、决策、错误 | 每个阶段结束后 |
| `findings.md` | 研究、发现、资源 | 研究期间 |
| `progress.md` | 会话日志、测试结果 | 整个会话期间 |

## 快速开始

```bash
PLAN_DIR="${AIMAESTRO_PLANNING_DIR:-docs_dev}"
mkdir -p "$PLAN_DIR"
```

然后创建包含以下内容的 `task_plan.md`：
```markdown
# Task: [Goal]

## Phases
- [ ] Phase 1: Research
- [ ] Phase 2: Design
- [ ] Phase 3: Implement
- [ ] Phase 4: Test

## Decisions
| Decision | Rationale | Date |
|----------|-----------|------|

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
```

## 六条规则

1. **先创建计划**——如果没有 `task_plan.md`，绝不开始复杂工作
2. **决策前先阅读**——在做出任何重大决策前重新阅读计划
3. **行动后更新**——将阶段标记为已完成，并记录发生的变更
4. **两次行动规则**——每完成两次搜索/浏览操作后，将发现保存到 `findings.md`
5. **记录所有错误**——将每个错误及其尝试次数和解决方案记录到计划中
6. **绝不重复失败**——如果某项操作失败，请改变你的方法

## 三次失败处理协议

| 失败次数 | 行动 |
|--------|--------|
| 1 | 诊断根本原因，并实施针对性修复 |
| 2 | 尝试完全不同的方法 |
| 3 | 质疑现有假设，搜索类似问题 |
| 3 次之后 | 向用户请求协助，并记录所有尝试 |

## 五问重启法

迷失方向了？根据你的规划文件回答以下问题：

1. 我在哪里？（`task_plan.md` 中的当前阶段）
2. 我要去哪里？（剩余阶段）
3. 目标是什么？（目标部分）
4. 我了解了什么？（`findings.md`）
5. 我做了什么？（`progress.md`）

## 完整的 AI Maestro 体验

此技能可以独立运行，无需任何依赖。如需包括**记忆搜索**、**文档搜索**、**图查询**、**智能体消息传递**和**智能体管理**在内的完整体验，请安装完整的 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 平台。