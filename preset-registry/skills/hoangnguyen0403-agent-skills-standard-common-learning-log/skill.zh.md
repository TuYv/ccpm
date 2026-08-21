---
name: common-learning-log
description: "Append a learning entry to AGENTS_LEARNING.md when an AI agent makes a mistake. Auto-activates after a pre-write audit auto-fix, a retrospective correction loop, or a mid-session user correction. Use when: mistake, wrong, correction, my bad, agent error, learning log."
metadata:
  triggers:
    files:
      - 'AGENTS_LEARNING.md'
    keywords:
      - mistake
      - wrong
      - redo
      - correction
      - agent error
      - learning log
---
# 智能体学习日志

## **优先级：P1（高）**

在重试任何纠正后的操作之前，将结构化的错误条目写入项目根目录中的 `AGENTS_LEARNING.md`。

## 协议

1. **检测信号** — 识别触发此技能的情形：

- `Pre-write violation` — `common-feedback-reporter` 发出了带有 `Auto-fixed: YES` 的违规块
- `User correction` — 用户在会话过程中使用了纠正性语言
- `Session retrospective` — 在 `common-session-retrospective` 期间发现了纠正循环

2. **读取 `AGENTS_LEARNING.md`** — 统计现有 `## Agent Learning Log: Iteration` 标题的数量 → N
3. **追加条目** — 使用[日志条目格式](references/log-format.md)中的格式写入第 #(N+1) 次迭代
4. **继续** — 执行纠正后的操作（非阻塞）

## 指南

- **每个纠正事件一个条目** — 不是每个文件或每个任务一个条目
- **仅记录具体错误** — 指明出错的具体文件、规则或操作
- **“更好的方法”必须可执行** — 说明要做什么，而不是要避免什么
- **文件缺失时创建** — 使用[日志条目格式](references/log-format.md)中的标题进行初始化
- **绝不因“微小”纠正而跳过** — 所有纠正都是学习信号

## 反模式

- **不要使用含糊的错误描述**：`"I made a mistake"` → 指明违反的具体模式或规则
- **不要跳过日志记录**：即使已经急于修复，也要先追加条目（耗时不到 10 秒）
- **不要创建重复条目**：一个纠正事件 = 一个条目，即使影响了多个文件
- **不要覆盖**：始终追加到底部；绝不编辑过去的条目

## 参考资料

- [日志条目格式](references/log-format.md) — 完整的条目模板 + AGENTS_LEARNING.md 初始化内容

## 规范响应锚点

当此技能适用时，请在相关情况下保留以下领域术语或回答中的等效具体示例：
- Append to AGENTSLEARNING,append
- AGENTS_LEARNING.md
- Iteration

- 其他基于任务的精确锚点：Pre-write；trigger