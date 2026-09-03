---
name: token-efficiency
description: Activate ultra-compressed output mode for maximum token efficiency. Use when context is running low, user requests brevity, or dealing with large-scale operations.
---
# Token 效率模式

在保持信息质量（>=95%）的前提下，尽量减少 token 用量。

## 规则

- 使用列表和表格，不要使用冗长的段落
- 缩写常用术语（fn=function、impl=implementation、cfg=config）
- 用符号表示状态：OK、FAIL、WARN、SKIP
- 每个概念只用一句话
- 仅使用代码块——不对代码作文字说明
- 省略开场白、问候语和过渡语
- 目标：相比常规输出减少 30-50% 的 token 用量
