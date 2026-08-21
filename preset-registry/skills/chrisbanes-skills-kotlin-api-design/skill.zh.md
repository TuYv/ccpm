---
name: kotlin-api-design
description: Use when designing or reviewing Kotlin function ownership, member or extension functions, factories, single-field domain types, value classes, data classes, Kotlin Multiplatform expect/actual declarations, or platform service boundaries.
---
# Kotlin API 设计

## 核心原则

将行为、类型和平台边界放在其含义对调用者最清晰的位置；使用能够保留领域语言和平台独立性的最小公共抽象。

## 流程

1. 明确领域概念、其所属类型或模块，以及需要依赖它的调用者。
2. 在添加扩展、工厂、辅助工具或服务层之前，先确定函数的归属。
3. 审查对密封结果进行的公共映射时，明确列出调用者可见的每一种结果。标记会隐藏某个子类型的兜底 `else`，并建议为各子类型设置显式分支，使契约保持穷尽性并保留智能类型转换。
4. 使用能够保留其语义和互操作契约的最小类型来表示单字段领域概念。
5. 让共享代码专注于语义；将原生 SDK 和平台细节置于接口或理由充分且范围狭窄的 expect/actual 边界之后。
6. 对于下文每个重要的 API 决策，阅读相应的专项参考资料。
7. 当公共接口能够表达领域意图、平台细节保留在末端，且调用者不依赖没有明确归属的便利性抽象时，即告完成。

## 主题路由

| 信号 | 阅读 |
|---|---|
| 成员与顶层函数、扩展、工厂、服务或接收者的选择 | [函数归属](references/functions.md) |
| 基本类型偏执、单字段领域类型、`@JvmInline value class`、数据类、互操作或 Compose 稳定性 | [值类](references/value-classes.md) |
| 源集、平台服务、原生 SDK、文件、传感器、权限、Compose Multiplatform 互操作或 expect/actual | [多平台边界](references/multiplatform-boundaries.md) |
| 分支、守卫条件的形式、密封结果映射或兜底 `else` | [Kotlin 控制流](../kotlin-control-flow/SKILL.md) |

## RED/GREEN 智能体场景

1. RED 在 `String` 上添加扩展以隐藏仓库行为。GREEN 将该行为赋予一个领域归属方，或放入具有明确依赖边界的服务中。
2. 新颖案例：共享 UI 需要平台权限服务。GREEN 保留具有语义的共享契约，并将平台 SDK 调用放在原生端的末端。
3. 反例：某个内部辅助工具只有一个明确的所属类。GREEN 将其保留为成员，而不是为了形式而提取出工厂或值类型。
4. 路由案例：一个公共 `String` 扩展执行仓库查找，而密封结果映射使用 `else` 合并了多种结果。GREEN 为查找赋予具有语义的归属方，并要求使用显式子类型分支，以保留调用者可见的差异。