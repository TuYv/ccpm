---
name: compose-component-design
description: Use when designing or reviewing reusable Jetpack Compose component APIs with modifier parameters, root layout placement, caller-provided variable content, primitive content parameters, optional content, or boolean shape flags.
---
# Compose 组件设计

## 核心原则

让可复用组件可由调用方放置和组合：组件负责其不变的结构，同时调用方保留因使用场景而异的放置方式、内容和策略选择。

## 流程

1. 说明所请求的 API 关注点，并将修改限制在该范围内。聚焦于插槽的审查并不授权进行无关的修饰符、命名或清理修改。
2. 说明组件不变的视觉结构，并识别每个可变区域、放置问题和策略选择。
3. 当根节点放置属于请求工作的一部分，或属于广泛的组件 API 设计时，除非具体的 API 边界使其他放置方式更为正确，否则应接受并在组件根节点应用调用方提供的修饰符。
4. 使用插槽表示由调用方控制且不受约束的视觉区域，而不是不断增加基础内容参数或布尔形状标志。将语义和设计系统约束保留为基础参数。
5. 将简单的条件结构保留在内联位置；仅提取出连贯且可复用的契约。
6. 在编辑公共签名之前，先阅读下方相关的聚焦参考文档。
7. 如果现有 API 已满足所请求的关注点，则以不做任何修改结束。否则，应在调用方能够定位组件、提供可变内容，并理解所有权且不依赖隐藏开关时结束。

## 主题路由

| 信号 | 阅读 |
|---|---|
| 修饰符参数、根布局放置、修饰符排序或条件布局包装器 | [修饰符与布局](references/modifier-layout.md) |
| 由调用方控制的可变视觉区域、可选内容、基础内容参数或布尔形状标志 | [插槽 API](references/slot-apis.md) |
| 动画属于公共组件契约 | [Compose 动画](../compose-animations/SKILL.md) |
| 在设计组件时状态所有权发生变化 | [Compose 状态与副作用](../compose-state-and-effects/SKILL.md) |
| 需要语义或截图覆盖 | [Compose UI 测试模式](../compose-ui-testing-patterns/SKILL.md) |

## RED/GREEN 代理场景

1. RED 为可复用卡片公开 `title: String`、`icon: ImageVector?` 以及若干显示标志。GREEN 保留不变的外壳结构，并通过命名插槽将可变区域交给调用方。
2. 新颖案例：一个组件既需要根修饰符，也需要由调用方提供的尾部内容。GREEN 在根节点应用修饰符，并提供尾部插槽，而不泄漏组件的 `RowScope`；仅当某个区域的子布局有意交由调用方控制时，才保留作用域接收者。
3. 反例：一个私有屏幕辅助函数只有一个固定子项，且没有调用方。GREEN 保持简单，不为假设中的复用而臆造插槽。
4. 聚焦反例：一个状态标签有意将语义枚举映射为固定文案，而任务只询问它是否需要插槽。GREEN 保持工作区不变，而不是添加无关的根修饰符。