---
name: strategic-compact
description: Suggests manual context compaction at logical intervals to preserve context through task phases rather than arbitrary auto-compaction. Use when a session is approaching a context limit and a task phase is a natural place to compact.
---
# 战略性压缩技能

建议在工作流程中的关键节点手动执行 `/compact`，而不是依赖任意时机触发的自动压缩。

## 何时启用

- 运行接近上下文限制（200K+ tokens）的长会话
- 处理多阶段任务（研究 → 规划 → 实现 → 测试）
- 在同一会话中切换不相关的任务
- 完成重要里程碑并开始新工作后
- 当响应速度变慢或连贯性下降时（上下文压力）

## 为什么要进行战略性压缩？

自动压缩会在任意时机触发：
- 经常在任务执行过程中触发，导致重要上下文丢失
- 无法感知任务的逻辑边界
- 可能中断复杂的多步骤操作

在逻辑边界进行战略性压缩：
- **探索之后、执行之前** — 压缩研究上下文，保留实施计划
- **完成里程碑之后** — 为下一阶段重新开始
- **重大上下文切换之前** — 在开始不同任务前清除探索上下文

## 工作原理

`suggest-compact.js` 脚本在 PreToolUse（Edit/Write）时运行，并结合两个信号：

1. **上下文大小（主要）** — 从会话记录（钩子负载中的 `transcript_path`）读取最新的 `usage` 记录，并对 `input_tokens + cache_read_input_tokens + cache_creation_input_tokens` 求和（即该轮次的真实上下文大小）。在根据窗口大小调整的阈值处建议执行 `/compact`——200k 窗口为 160k tokens，1M 窗口为 250k tokens（通过 `[1m]` 模型标记检测，或在观察到的 tokens 已超过 200k 时推断）——此后每当上下文再增长 60k tokens 时重新提醒
2. **工具调用次数（次要）** — 统计会话中的工具调用次数；在达到可配置阈值时给出建议（默认：50 次调用），此后每增加 25 次调用再次建议

## 钩子设置

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
- `COMPACT_CONTEXT_THRESHOLD` — 给出上下文大小建议前的上下文 token 数（默认：200k 窗口为 160000，1M 窗口为 250000；`0` 表示禁用上下文信号）
- `COMPACT_CONTEXT_INTERVAL` — 再次给出建议前需增加的上下文 token 数（默认：60000）
- `ECC_CONTEXT_WINDOW_TOKENS` — 显式指定上下文窗口大小（以 tokens 为单位），覆盖自动检测。对于报告的 id 中缺少 `[1m]` 标记的大窗口模型（例如 400k Opus 4.x 或新的 1M 窗口模型系列），请设置此项，以便阈值根据实际窗口缩放，而不是默认采用 200k 并夸大上下文使用量。
- `CLAUDE_CODE_AUTO_COMPACT_WINDOW` — Claude Code 的原生窗口大小覆盖值（以 tokens 为单位）；当未设置 `ECC_CONTEXT_WINDOW_TOKENS` 时，将其作为回退值使用。

> 否则，上下文窗口会根据 `[1m]` 模型标记自动检测，或在观察到的 token 已超过 200k 时推断得出。对于两种信号都不具备的大上下文窗口模型，请设置上述某个覆盖项，以便在正确的时机触发 `/compact` 建议。

## 压缩决策指南

使用此表判断何时进行压缩：

| 阶段转换 | 是否压缩？ | 原因 |
|-----------------|----------|-----|
| 调研 → 规划 | 是 | 调研上下文较为庞杂；计划才是提炼后的产出 |
| 规划 → 实现 | 是 | 计划已记录下来（写入文件，或者如果你有任务列表，则记录在任务列表中）；释放上下文空间以便编写代码 |
| 实现 → 测试 | 视情况而定 | 如果测试会引用最近的代码，则保留上下文；如果要切换关注点，则进行压缩 |
| 调试 → 下一个功能 | 是 | 调试跟踪信息会污染与其无关工作的上下文 |
| 实现过程中 | 否 | 丢失变量名、文件路径和部分完成状态的代价很高 |
| 某种方案失败后 | 是 | 在尝试新方案前，清除关于死胡同方案的推理 |

## 压缩后会保留什么

了解哪些内容会保留，有助于你放心地进行压缩：

| 保留 | 丢失 |
|----------|------|
| CLAUDE.md 指令 | 中间推理和分析 |
| 磁盘上的文件 | 之前读取过的文件内容 |
| 记忆文件（`~/.claude/memory/`） | 多轮对话上下文 |
| Git 状态（提交、分支） | 工具调用历史和次数 |
| 任务列表——**仅当你拥有待办事项工具时**（见下文） | 用户口头表达的细微偏好 |

> ### 不要依赖任务列表在压缩后继续存在——它可能根本不存在
>
> Claude Code **2.1.233 在 Opus 4.8、Sonnet 5、Fable 5、Mythos 5
> 及更新模型上默认移除了待办事项/任务工具**（`TodoWrite`、`TaskCreate/Get/Update/List`）。
> `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` 可以将其恢复，但这是按机器设置的
> 环境配置——**它不会随此 skill 一起传递**，因此你不能假定
> 读者拥有这些工具。
>
> 这一点很重要，因为“我的待办事项列表在压缩后仍会保留”是人们进行压缩
> *而不是*将状态记录下来的原因。如果这些工具不存在，就没有任何列表可以保留，
> 计划也就直接丢失了。**压缩前将计划写入文件**——无论使用哪个版本和模型，
> 文件都会保留。将任务列表视为一种可能不存在的便利工具，绝不要将其用作持久记录。

## 最佳实践

1. **规划后进行压缩**——计划最终确定**并写入文件**后，进行压缩以重新开始
2. **调试后进行压缩**——继续工作前，清除解决错误时产生的上下文
3. **不要在实现过程中压缩**——为相关更改保留上下文
4. **阅读建议**——hook 会告诉你*何时*适合压缩，由你决定*是否*压缩
5. **压缩前先写入**——压缩前将重要上下文保存到文件或记忆中
6. **使用带摘要的 `/compact`**——添加自定义消息：`/compact Focus on implementing auth middleware next`

## 相关内容

- [长篇指南](https://x.com/affaanmustafa/status/2014040193557471352)——Token 优化章节
- 记忆持久化 hook——用于保存压缩后仍需保留的状态
- `continuous-learning` skill——在会话结束前提取模式