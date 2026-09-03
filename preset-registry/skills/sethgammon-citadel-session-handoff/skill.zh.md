---
name: session-handoff
license: MIT
description: >-
  Synthesizes the current session into a structured HANDOFF block for context
  transfer between sessions. Captures what was built, decisions made, and
  unresolved items.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - handoff
  - session summary
last-updated: 2026-03-20
---
# /session-handoff — 上下文交接

## 定位

在结束一个会话并希望为下一个会话保留上下文时使用。
编排器（Archon、Fleet）也会在会话边界处自动调用此技能。

**不要使用的情形：** 你想从已完成的战役中提取可复用的模式（使用 `/learn`）、为失败的战役撰写结构化复盘（使用 `/postmortem`），或是要产出文档而非上下文交接。

## 协议

1. **收集会话数据**（并行执行）：
   - `git log --oneline -20` 和 `git diff HEAD --stat`
   - 读取 `.planning/campaigns/` 中带有 `status: active` 的文件
   - 读取 `.planning/fleet/` 中带有 `status: active` 或 `needs-continue` 的文件

2. **确定主线**：如果存在处于活跃状态的战役，以该战役的当前阶段作为锚点。如果有多条战役处于活跃状态，则逐一列出。如果没有战役，则以最近的 git 提交作为参照框架。

3. **将数据映射到 HANDOFF 字段**：
   - *变更了什么*：战役活跃时取战役阶段产出；否则取本次会话的提交主题行
   - *关键决策*：包含权衡词（"instead"、"because"、"not"）的提交信息；或对话中的明确表述
   - *未决事项*：标记为 `blocked` 或 `parked` 的战役条目；本次会话新增的 TODO；任何被明确推迟的内容
   - *后续步骤*：战役活跃时取其下一阶段；否则取上述内容中最优先的未关闭事项

4. 输出 HANDOFF 块。

## 输出格式

```
---HANDOFF---
- {what was built or changed — be specific}
- {key decisions and tradeoffs — include reasoning}
- {unresolved items — what's blocking}
- {next steps — what the next session should do first}
---
```

控制在 3-5 条，150 词以内。这是上下文交接，不是报告。

## 质量门禁

- 每一条都必须可执行或包含有效信息
- 不得出现含糊表述（“在 X 上取得了进展”）
- 相关之处给出具体的文件引用
- 决策需包含理由，而不只是结论

## 边缘情形

**`.planning/` 不存在**：跳过战役与舰队检查。视为“没有活跃战役”，仅基于 git 上下文继续。

**战役文件损坏或无法解析**（frontmatter 格
