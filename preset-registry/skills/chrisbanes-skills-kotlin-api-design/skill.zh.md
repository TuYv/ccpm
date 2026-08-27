---
name: kotlin-api-design
description: Use when designing or reviewing Kotlin function ownership, member or extension functions, factories, single-field domain types, value classes, data classes, Kotlin Multiplatform expect/actual declarations, or platform service boundaries.
---
# Kotlin API 设计

## 核心原则

将行为、类型和平台边界放置在对调用方而言含义最清晰的位置；在保留领域语言和平台独立性的前提下，使用最小的公共抽象。

## 流程

1. 命名领域概念、其所属的类型或模块，以及需要依赖它的调用方。
2. 在添加扩展、工厂、辅助函数或服务层之前，先确定函数的归属。
3. 审查对密封结果进行公共映射的代码时，明确列出调用方可见的每一种结果。标记隐藏某个子类型的兜底 `else`，并建议使用显式的子类型分支，以便契约保持穷尽性并保留智能类型转换。
4. 对于单字段领域概念，使用在保留其语义契约和互操作契约的前提下最小的类型。
5. 保持共享代码具有语义性；将原生 SDK 和平台细节置于接口之后，或置于经过严格论证的 expect/actual 边界之后。
6. 阅读下方针对所选决策的专题参考文档。
7. 当公共 API 表达了领域意图、平台细节保留在叶节点，并且调用方不再依赖没有明确归属的便利抽象时，流程结束。

## 主题路由

| 信号 | 阅读 |
|---|---|
| 成员函数与顶层函数、扩展、工厂、服务或接收者的选择 | [函数归属](references/functions.md) |
| 原始类型执着、单字段领域类型、`@JvmInline value class`、数据类、互操作性或 Compose 稳定性 | [值类](references/value-classes.md) |
| 源集、平台服务、原生 SDK、文件、传感器、权限、Compose Multiplatform 互操作或 expect/actual | [多平台边界](references/multiplatform-boundaries.md) |
| 分支、守卫条件的形式、密封结果映射或兜底 `else` | [Kotlin 控制流](../kotlin-control-flow/SKILL.md) |