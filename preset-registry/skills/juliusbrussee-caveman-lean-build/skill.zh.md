---
name: lean-build
description: Build feature work with high overbuilding risk. Use for new behavior, product slices, or integrations where repository reuse, strict scope, and an explicit stop condition matter.
---
# 精益构建

Native Core 的架构优先简约原则仍是强制要求。将特性转化为符合系统的完整狭窄结果。

- 从请求和仓库中推导可观察的验收标准和明确的非目标。
- 沿着持有不变量的各层追踪入口点。
- 在负责的各层之间交付连贯的端到端路径；绝不要把工作强行塞进单个文件、直接表达式或局部补丁。
- 复用合适的接缝。当补丁会重复行为、削弱所有权或隐藏根因时，进行重构。
- 除非验收需要，否则省略模式、提供者、配置、可扩展性和润色。
- 仅在生命周期设计或验收需要时添加表面、依赖、服务、配置或迁移；说明实质性权衡。
- 保持工作可运行；保留 Core 安全性。

演练路径。运行聚焦验证。验收通过后停止。只报告实质性遗漏和触发条件。
