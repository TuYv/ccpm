---
name: kotlin-api-design
description: Use when designing or reviewing Kotlin function ownership, member or extension functions, factories, single-field domain types, value classes, data classes, Kotlin Multiplatform expect/actual declarations, or platform service boundaries.
---
# Kotlin API 设计

## 核心原则

将行为、类型和平台接缝放在其含义对调用方最清晰的位置；使用能够保留领域语言和平台独立性的最小公共抽象。

## 流程

1. 明确领域概念的名称、其所属的类型或模块，以及需要依赖它的调用方。
2. 在添加扩展、工厂、辅助函数或服务层之前，先确定函数的归属。
3. 使用能够保留其语义和互操作契约的最小类型来表示单字段领域概念。
4. 保持共享代码的语义性；将原生 SDK 和平台细节置于接口或有充分且明确理由的 expect/actual 边界之后。
5. 针对下方每一项重要的 API 决策，阅读对应的专项参考文档。
6. 当公共接口能够表达领域意图、平台细节保留在叶节点，并且调用方不依赖没有明确归属的便利抽象时，即告完成。

## 主题导航

| 信号 | 阅读 |
|---|---|
| 成员与顶层函数、扩展、工厂、服务或接收者的选择 | [函数归属](references/functions.md) |
| 基本类型偏执、单字段领域类型、`@JvmInline value class`、数据类、互操作或 Compose 稳定性 | [值类](references/value-classes.md) |
| 源集、平台服务、原生 SDK、文件、传感器、权限、Compose Multiplatform 互操作或 expect/actual | [多平台边界](references/multiplatform-boundaries.md) |
| 分支和守卫条件的结构 | [Kotlin 控制流](../kotlin-control-flow/SKILL.md) |

## RED/GREEN 智能体场景

1. RED 在 `String` 上添加扩展以隐藏仓库行为。GREEN 将该行为赋予一个领域所有者，或放入具有明确依赖边界的服务中。
2. 新颖案例：共享 UI 需要平台权限服务。GREEN 保留具有语义的共享契约，并将平台 SDK 调用放在原生叶节点。
3. 反例：一个内部辅助函数只有一个显而易见的所属类。GREEN 将其保留为成员，而不是为了形式上的完备将其提取为工厂或值类型。