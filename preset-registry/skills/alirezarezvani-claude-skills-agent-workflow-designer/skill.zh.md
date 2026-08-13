---
name: "agent-workflow-designer"
description: "Design production-grade multi-agent workflows with clear pattern choice (sequential, parallel, hierarchical), handoff contracts, failure handling, and cost/context controls. Use when architecting a multi-step agent pipeline, choosing between single-agent vs multi-agent approaches, or refactoring an LLM workflow that suffers from context bloat or unreliable handoffs."
---
# 智能体工作流设计器

**层级：** 强大  
**类别：** 工程  
**领域：** 多智能体系统 / AI 编排

---

## 概述

设计生产级多智能体工作流，明确选择合适的模式、交接契约、故障处理机制，以及成本与上下文控制措施。

## 核心能力

- 为多步骤智能体系统选择工作流模式
- 生成骨架配置，以快速搭建工作流
- 在长时间运行的流程中严格控制上下文和成本
- 搭建错误恢复与重试策略框架
- 提供相关文档指引，以权衡不同运维模式的利弊

---

## 适用场景

- 单个提示词不足以应对任务的复杂度
- 需要具有明确职责边界的专业智能体
- 希望在实现之前确定结构明确的工作流
- 需要通过验证循环设置质量或安全门禁

---

## 快速开始

```bash
# Generate a sequential workflow skeleton
python3 scripts/workflow_scaffolder.py sequential --name content-pipeline

# Generate an orchestrator workflow and save it
python3 scripts/workflow_scaffolder.py orchestrator --name incident-triage --output workflows/incident-triage.json
```

---

## 模式映射

- `sequential`：严格按步骤执行的依赖链
- `parallel`：针对独立子任务进行扇出/扇入处理
- `router`：按意图/类型分派，并提供回退机制
- `orchestrator`：由规划器协调存在依赖关系的专业智能体
- `evaluator`：生成器 + 质量门禁循环

详细模板：`references/workflow-patterns.md`

---

## 推荐工作流

1. 根据依赖关系的形态和风险状况选择模式。
2. 通过 `scripts/workflow_scaffolder.py` 生成配置骨架。
3. 为每条边定义交接契约字段。
4. 添加重试/超时机制和输出验证门禁。
5. 在扩展规模之前，使用较小的上下文预算进行试运行。

---

## 常见陷阱

- 对原本可通过一个结构良好的提示词解决的任务进行过度编排
- 未针对外部模型调用设置超时/重试策略
- 传递完整的上游上下文，而不是有针对性的产物
- 忽略各步骤成本的累积

## 最佳实践

1. 从能够满足需求的最小模式开始。
2. 确保交接载荷明确且有界。
3. 在扇入合成之前验证中间输出。
4. 在每个步骤中强制实施预算和超时限制。