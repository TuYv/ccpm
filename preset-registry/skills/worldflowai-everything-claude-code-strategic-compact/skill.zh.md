---
name: strategic-compact
description: Suggests manual context compaction at logical intervals to preserve context through task phases rather than arbitrary auto-compaction.
---
# 策略性压缩技能

在工作流中的策略性节点建议手动执行 `/compact`，而不是依赖任意的自动压缩。

## 为什么需要策略性压缩？

自动压缩会在任意节点触发：
- 经常在任务中途触发，丢失重要上下文
- 无法感知逻辑上的任务边界
- 可能中断复杂的多步骤操作

在逻辑边界处进行策略性压缩：
- **探索之后、执行之前** - 压缩调研上下文，保留实现计划
- **完成一个里程碑之后** - 为下一阶段全新开始
- **重大上下文切换之前** - 在开始不同任务前清除探索上下文

## 工作原理

`suggest-compact.sh` 脚本在 PreToolUse（Edit/Write）时运行，会：

1. **跟踪工具调用** - 统计会话中的工具调用次数
2. **阈值检测** - 在达到可配置阈值时给出建议（默认：50 次调用）
3. **周期性提醒** - 达到阈值后每 25 次调用提醒一次

## 钩子设置

添加到你的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "tool == \"Edit\" || tool == \"Write\"",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/strategic-compact/suggest-compact.sh"
      }]
    }]
  }
}
```

## 配置

环境变量：
- `COMPACT_THRESHOLD` - 首次建议前的工具调用次数（默认：50）

## 最佳实践

1. **规划完成后压缩** - 计划最终确定后，执行压缩以全新开始
2. **调试完成后压缩** - 继续之前清除错误排查上下文
3. **实现过程中不要压缩** - 保留相关变更所需的上下文
4. **阅读建议** - 钩子告诉你*何时*，由你决定*是否*

## 相关内容

- [长篇指南](https://x.com/affaanmustafa/status/2014040193557471352) - Token 优化章节
- 记忆持久化钩子 - 用于在压缩后仍能保留状态
