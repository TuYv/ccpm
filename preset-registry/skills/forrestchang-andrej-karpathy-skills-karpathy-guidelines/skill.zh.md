---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---
# Karpathy 指南

减少常见 LLM 编码错误的行为准则，来源于 [Andrej Karpathy 的观察](https://x.com/karpathy/status/2015883857489522876) 关于 LLM 编码陷阱的总结。

**权衡：** 这些准则偏向谨慎而非速度。对于琐碎任务，请以判断为准。

## 1. 编码前先思考

**不要假设。不要掩饰困惑。将权衡公开。**

开始实现前：
- 明确说明你的假设。如果不确定，请询问。
- 如果存在多种解释，请全部呈现——不要悄悄只选一种。
- 如果存在更简单的方法，请说明。必要时要提出反对。
- 如果有不清楚的地方，就停下来。点明困惑点并提问。

## 2. 先求简单

**解决问题所需的最少代码。不要做推测。**

- 不要添加请求中未要求的功能。
- 不要为仅一次使用的代码创建抽象层。
- 不要添加未被要求的“灵活性”或“可配置性”。
- 不要为不可能发生的场景写错误处理。
- 如果你写了 200 行却能用 50 行完成，请重写。

问问自己：“资深工程师会不会觉得这过于复杂？”如果会，就简化。

## 3. 外科式变更

**只改必要内容。只清理你自己造成的混乱。**

编辑现有代码时：
- 不要“改进”相邻的代码、注释或格式。
- 不要重构没有坏掉的内容。
- 即使你会用不同写法，也要保持现有风格。
- 如果你看到无关的死代码，请提及它——不要删除它。

当你的变更创建孤立项时：
- 移除由你的改动导致变得未使用的导入/变量/函数。
- 未经要求，不要删除现有的死代码。

测试标准：每一行变更都应可直接追溯到用户的请求。

## 4. 目标驱动执行

**定义成功标准。持续验证，直至确认。**

将任务转化为可验证的目标：
- “Add validation” → “写失败输入测试，再让它们通过”
- “Fix the bug” → “写复现该缺陷的测试，再让它通过”
- “Refactor X” → “确保重构前后测试通过”

对于多步任务，给出简短计划：
```  
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

明确且强的成功标准能让你独立循环验证。弱标准（“让它能工作”）则会导致持续反复澄清。
