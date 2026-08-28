---
name: compose-component-design
description: Use when designing or reviewing reusable Jetpack Compose component APIs with modifier parameters, root layout placement, caller-provided variable content, primitive content parameters, optional content, or boolean shape flags.
---
# Compose 组件设计

## 核心原则

让可复用组件可由调用方放置和组合：组件负责其不变的结构，同时调用方保留因使用场景而异的放置方式、内容和策略选择。

## 流程

1. 明确所请求的 API 关注点，并将修改限制在该范围内。聚焦于插槽的审查并不授权进行无关的 modifier、命名或清理修改。
2. 说明组件不变的视觉结构，并识别每个可变区域、放置问题和策略选择。当请求涉及其中多个关注点时，逐一报告；不要在发现第一个有效的 modifier 或插槽问题后就停止。
3. 当根部放置属于请求的工作范围，或属于广泛的组件 API 设计时，除非具体的 API 边界使其他放置方式更为正确，否则应在组件根部接受并应用调用方传入的 modifier。
4. 对于由调用方控制且不受约束的视觉区域，使用插槽，而不是不断增加基础内容参数或布尔形状标志。将语义和设计系统约束保留为基础参数。
5. 将简单的条件结构保留在内联位置；仅提取具有连贯可复用契约的结构。
6. 在编辑公共签名之前，阅读下方相关的聚焦参考文档。
7. 如果现有 API 已满足所请求的关注点，则不进行任何修改。否则，应在调用方能够定位组件、提供可变内容并理解所有权，且不存在隐藏开关时完成。

## 主题路由

| 信号 | 阅读 |
|---|---|
| Modifier 参数、根布局放置、modifier 排序或条件布局包装器 | [Modifier 和布局](references/modifier-layout.md) |
| 由调用方控制的可变视觉区域、可选内容、基础内容参数或布尔形状标志 | [插槽 API](references/slot-apis.md) |
| 动画属于公共组件契约 | [Compose 动画](../compose-animations/SKILL.md) |
| 设计组件时状态所有权发生变化 | [Compose 状态与副作用](../compose-state-and-effects/SKILL.md) |
| 需要语义或截图覆盖 | [Compose UI 测试模式](../compose-ui-testing-patterns/SKILL.md) |