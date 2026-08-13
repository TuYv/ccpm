---
name: how-it-works
description: Explain how claude-mem captures observations, when memory injection kicks in, and where data lives. Use when the user asks "how does claude-mem work?" or "what is this thing doing?".
---
# claude-mem 如何工作

## 它的作用

每次 Claude 执行的 Read、Edit 和 Bash 都会转化为一条压缩后的观察。观察会在会话结束时被总结。相关观察会自动注入到未来的提示中，使下一个会话从上次的上下文开始——无需再次解释代码库，也无需重新发现决策。

## 何时启动

Memory 注入会在你在某个项目的第二次会话时开始。

新项目中的第一次会话会初始化记忆；后续会话会为相关的历史工作自动注入上下文。如果你想在一次流程中将整个仓库预先加载到记忆中（约 5 分钟，可选），请运行 `/learn-codebase`。

## 数据存储位置

所有内容都保存在本机的 ~/.claude-mem 中。

除你用于压缩配置的 AI 提供商调用（Claude / OpenRouter / Gemini）外，其他内容不会离开你的机器。SQLite 数据库、向量索引、日志和设置都位于该目录下，并且会在 `npx claude-mem uninstall` 时被完整清理。
