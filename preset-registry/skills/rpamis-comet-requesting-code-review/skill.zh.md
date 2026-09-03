---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---
# 请求代码审查

派发一个代码审查子代理，在问题蔓延之前将其捕获。审查者收到的是精心构建的评估上下文——绝不是你的会话历史。这能让审查者专注于工作成果本身，而非你的思考过程，同时为你自己的上下文留出空间以便继续工作。

**核心原则：** 尽早审查，频繁审查。

## 何时请求审查

**强制：**
- 在子代理驱动的开发中，每完成一个任务后
- 完成主要功能后
- 合并到 main 之前

**可选但有价值：**
- 卡住的时候（换一个新视角）
- 重构之前（基线检查）
- 修复复杂 bug 之后

## 如何请求

**1. 获取 git SHA：**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. 派发代码审查子代理：**

派发一个 `general-purpose` 子代理，填写 [code-reviewer.md](code-reviewer.md) 中的模板

**占位符：**
- `{DESCRIPTION}` - 你所构建内容的简要摘要
- `{PLAN_OR_REQUIREMENTS}` - 它应当做什么
- `{BASE_SHA}` - 起始提交
- `{HEAD_SHA}` - 结束提交

**3. 根据反馈采取行动：**
- 立即修复 Critical 问题
- 在继续之前修复 Important 问题
- 记下 Minor 问题以备后续处理
- 如果审查者错了，予以反驳（附上理由）

## 示例

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch code reviewer subagent]
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types
  PLAN_OR_REQUIREMENTS: Task 2 from docs/superpowers/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## 与工作流的集成

**子代理驱动的开发：**
- 在每个任务之后都进行审查
- 在问题累积之前将其捕获
- 在进入下一个任务之前完成修复

**执行计划：**
- 在每个任务之后或自然的检查点处进行审查
- 获取反馈、应用反馈、继续推进

**临时开发：**
- 合并前审查
- 卡住时审查

## 危险信号

**绝不要：**
- 因为“它很简单”就跳过审查
- 忽视 Critical 问题
- 在 Important 问题未修复的情况下继续推进
- 与合理的技术反馈争论

**如果审查者错了：**
- 以技术理由进行反驳
- 展示证明其可行的代码/测试
- 请求澄清

参见模板：[code-reviewer.md](code-reviewer.md)
