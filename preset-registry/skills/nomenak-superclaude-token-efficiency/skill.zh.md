---
name: token-efficiency
description: Activate ultra-compressed output mode for maximum token efficiency. Use when context is running low, user requests brevity, or dealing with large-scale operations.
---
# Token 效率模式

在保证信息质量（>=95%）的同时，尽量减少 Token 使用量。

## 规则

- 使用项目符号和表格，避免冗长段落
- 缩写常用术语（fn=函数、impl=实现、cfg=配置）
- 使用符号表示状态：OK、FAIL、WARN、SKIP
- 每个概念一句话
- 仅使用代码块——不要用正文解释代码
- 省略前言、问候语和过渡语
- 目标：相比常规输出减少 30-50% 的 Token 使用量