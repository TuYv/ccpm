---
name: strategic-compact
description: Suggests manual context compaction at logical intervals to preserve context through task phases rather than arbitrary auto-compaction. Use when a session is approaching a context limit and a task phase is a natural place to compact.
---
# 战略性压缩技能

建议在工作流中的关键节点手动执行 `/compact`，而不是依赖任意触发的自动压缩。

## 何时启用

- 运行接近上下文限制（200K+ token）的长会话时
- 处理多阶段任务（研究 → 规划 → 实现 → 测试）时
- 在同一会话中切换不相关的任务时
- 完成一个重要里程碑并开始新工作后
- 响应速度变慢或连贯性下降时（上下文压力）

## 为什么要进行战略性压缩？

自动压缩会在任意节点触发：
- 经常在任务执行过程中触发，导致重要上下文丢失
- 无法感知任务的逻辑边界
- 可能中断复杂的多步骤操作

在逻辑边界进行战略性压缩：
- **探索之后、执行之前** — 压缩研究上下文，保留实施计划
- **完成一个里程碑之后** — 以全新状态开始下一阶段
- **上下文发生重大转换之前** — 在开始其他任务前清除探索上下文

## 工作原理

`suggest-compact.js` 脚本在 PreToolUse（Edit/Write）时运行，并结合以下两个信号：

1. **上下文大小（主要信号）** — 从会话记录（hook payload 中的 `transcript_path`）读取最新的 `usage` 记录，并计算 `input_tokens + cache_read_input_tokens + cache_creation_input_tokens` 的总和（即该轮次的真实上下文大小）。当达到根据上下文窗口缩放后的阈值时，建议执行 `/compact`——200k 窗口的阈值为 160k token，1M 窗口的阈值为 250k token（通过 `[1m]` 模型标记检测，或在观测到的 token 数已超过 200k 时推断）——此后每当上下文再增长 60k token 时重新提醒
2. **工具调用次数（次要信号）** — 统计会话中的工具调用次数；达到可配置的阈值时给出建议（默认：50 次调用），此后每增加 25 次调用再次建议

## Hook 设置

添加到你的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{ "type": "command", "command": "node ~/.claude/skills/strategic-compact/suggest-compact.js" }]
      },
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": "node ~/.claude/skills/strategic-compact/suggest-compact.js" }]
      }
    ]
  }
}
```

## 配置

环境变量：
- `COMPACT_THRESHOLD` — 首次建议前的工具调用次数（默认：50）
- `COMPACT_CONTEXT_THRESHOLD` — 触发上下文大小建议前的上下文 token 数（默认：200k 窗口为 160000，1M 窗口为 250000；`0` 会禁用上下文信号）
- `COMPACT_CONTEXT_INTERVAL` — 再次给出建议前需增加的上下文 token 数（默认：60000）
- `ECC_CONTEXT_WINDOW_TOKENS` — 显式指定上下文窗口大小（以 token 为单位），覆盖自动检测。对于报告的 id 中缺少 `[1m]` 标记的大窗口模型（例如 400k Opus 4.x，或新的 1M 窗口模型系列），请设置此变量，使阈值根据实际窗口缩放，而不是默认按 200k 计算并夸大上下文使用量。
- `CLAUDE_CODE_AUTO_COMPACT_WINDOW` — Claude Code 原生的窗口大小覆盖值，以 token 为单位；未设置 `ECC_CONTEXT_WINDOW_TOKENS` 时将其用作后备值。

> 上下文窗口在其他情况下会根据 `[1m]` 模型标记自动检测，或在观测到的 token 已超过 200k 时推断得出。对于两种信号都不具备的大窗口模型，请设置上述覆盖项之一，以便在恰当的时机触发 `/compact` 建议。

## 压缩决策指南

使用此表决定何时进行压缩：

| 阶段转换 | 是否压缩？ | 原因 |
|-----------------|----------|-----|
| 研究 → 规划 | 是 | 研究上下文十分庞杂；计划是提炼后的产出 |
| 规划 → 实现 | 是 | 计划已记录在 TodoWrite 或文件中；释放上下文空间以便编写代码 |
| 实现 → 测试 | 视情况而定 | 如果测试会引用最近的代码，则保留上下文；如果要切换关注点，则进行压缩 |
| 调试 → 下一个功能 | 是 | 调试跟踪信息会污染与后续无关工作所需的上下文 |
| 实现过程中 | 否 | 丢失变量名、文件路径和部分完成状态的代价很高 |
| 某种方法失败后 | 是 | 尝试新方法之前，清除关于错误方向的推理 |

## 压缩后保留的内容

了解哪些内容会保留，有助于你放心地进行压缩：

| 保留 | 丢失 |
|----------|------|
| CLAUDE.md 指令 | 中间推理和分析 |
| TodoWrite 任务列表 | 你之前读取过的文件内容 |
| 内存文件（`~/.claude/memory/`） | 多轮对话上下文 |
| Git 状态（提交、分支） | 工具调用历史和次数 |
| 磁盘上的文件 | 用户口头表达的细微偏好 |

## 最佳实践

1. **规划后进行压缩** — 在 TodoWrite 中最终确定计划后，进行压缩以便重新开始
2. **调试后进行压缩** — 继续工作前，清除解决错误时产生的上下文
3. **不要在实现过程中压缩** — 保留与相关改动有关的上下文
4. **阅读建议** — 钩子会告诉你*何时*压缩，由你决定*是否*压缩
5. **压缩前先写入** — 压缩前将重要上下文保存到文件或内存中
6. **使用带摘要的 `/compact`** — 添加自定义消息：`/compact Focus on implementing auth middleware next`

## 相关内容

- [长篇指南](https://x.com/affaanmustafa/status/2014040193557471352) — Token 优化章节
- 内存持久化钩子 — 用于保存压缩后仍需保留的状态
- `continuous-learning` 技能 — 在会话结束前提取模式