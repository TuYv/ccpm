---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---
# Requesting Code Review

调度一个代码审查子代理，在问题级联之前发现它们。审查者获得的是经过精确构造的评估上下文——绝不是你的会话历史。

**核心原则：** 尽早审查，频繁审查。

## 何时请求审查

**强制：**
- 在子代理驱动开发中的每个任务完成后
- 完成重大功能后
- 合并到 main 之前

**可选但很有价值：**
- 卡住时（获得全新视角）
- 重构前（基线检查）
- 修复复杂 bug 后

## 如何请求

**1. 获取 git SHA：**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. 调度代码审查子代理：**

调度一个 `general-purpose` 子代理，填写 [code-reviewer.md](code-reviewer.md) 中的模板。

**占位符：**
- `{DESCRIPTION}` - 你构建内容的简要摘要
- `{PLAN_OR_REQUIREMENTS}` - 它应该做什么
- `{BASE_SHA}` - 起始提交
- `{HEAD_SHA}` - 结束提交

**3. 处理反馈：**
- 立即修复 Critical 问题
- 在继续之前修复 Important 问题
- 记录 Minor 问题以稍后处理
- 如果审查者错了，提出反驳（附上理由）

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

## 常见借口

| 借口 | 现实 |
|--------|---------|
| "我会自己审查 diff，而不是调度一个审查者" | 你是协调者——内联审查 diff 会消耗你继续推进工作所需的上下文窗口。调度一个审查子代理：diff 和评估过程都存在于它的上下文中，只有结论会返回给你。 |
| "审查者需要我的完整会话历史才能理解这个变更" | 给它精确构造的上下文，而不是你的会话历史。这能让审查者专注于工作成果，而不是你的思考过程。 |

## 危险信号

**绝不：**
- 因为“很简单”而跳过审查
- 忽略 Critical 问题
- 在 Important 问题未修复的情况下继续
- 与有效的技术反馈争论

**如果审查者错了：**
- 用技术理由提出反驳
- 展示证明其可用的代码/测试
- 请求澄清

参见模板：[code-reviewer.md](code-reviewer.md)
