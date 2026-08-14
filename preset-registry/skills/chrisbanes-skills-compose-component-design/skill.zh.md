---
name: compose-component-design
description: Use when designing or reviewing reusable Jetpack Compose component APIs with modifier parameters, root layout placement, caller-provided variable content, primitive content parameters, optional content, or boolean shape flags.
---
# Compose 组件设计

## 核心原则

让可复用组件可由调用方放置和组合：组件拥有其不变结构，而调用方保留随具体用途变化的放置方式、内容和策略选择。

## 流程

1. 说明组件不变的视觉结构，并识别每个可变区域、放置问题和策略选择。
2. 除非具体的 API 边界决定了其他位置更合适，否则应在组件根节点接受并应用调用方的修饰符。
3. 对于由调用方控制且不受约束的视觉区域，应使用插槽表示，而不是不断增加基本类型的内容参数或布尔型形态标志。语义和设计系统约束则继续使用基本类型参数。
4. 简单的条件结构应保持内联；仅提取具有完整且可复用契约的部分。
5. 在编辑公共签名之前，阅读下方相关的专题参考文档。
6. 当调用方能够放置组件、提供可变内容，并且无需借助隐藏的布局或内容开关即可理解所有权时，即可完成设计。

## 主题导航

| 信号 | 阅读 |
|---|---|
| 修饰符参数、根布局放置、修饰符顺序或条件式布局包装器 | [修饰符与布局](references/modifier-layout.md) |
| 由调用方控制的可变视觉区域、可选内容、基本类型的内容参数或布尔型形态标志 | [插槽 API](references/slot-apis.md) |
| 动画属于公共组件契约 | [Compose 动画](../compose-animations/SKILL.md) |
| 设计组件时发生状态所有权变更 | [Compose 状态与副作用](../compose-state-and-effects/SKILL.md) |
| 需要语义或截图覆盖 | [Compose UI 测试模式](../compose-ui-testing-patterns/SKILL.md) |

## RED/GREEN 智能体场景

1. RED 为可复用卡片公开 `title: String`、`icon: ImageVector?` 和多个显示标志。GREEN 保留不变的装饰结构，并将可变区域作为具名插槽提供给调用方。
2. 新颖案例：一个组件同时需要根修饰符和调用方提供的尾部内容。GREEN 在根节点应用修饰符并提供尾部插槽，同时不泄露内部布局。
3. 反例：一个私有的屏幕辅助函数只有一个固定子项且没有调用方。GREEN 保持简单，而不是为了假设的复用需求创造插槽。