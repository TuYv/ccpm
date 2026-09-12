---
name: using-chrisbanes-skills
description: Use when routing Kotlin or Jetpack Compose work, or physical Android benchmark evidence that needs a configuration decision, especially when several Kotlin or Compose concerns overlap.
---
# 使用 chrisbanes 技能

## 核心原则

按代码需要做出的决策进行路由，而不是按提及的 API 数量进行路由。
当一个集群的共享流程负责该关注点时，加载该集群；仅当其独立行为会改变同一项工作时，才添加专门技能。

## 路由流程

1. 阅读任务。对于 Kotlin 或 Compose 工作，检查使该关注点具体化的源代码。对于 Android 基准测试比较，则检查提供的报告、配置和跟踪记录。
2. 如果一个聚焦的技能明显匹配，直接加载它并停止路由。
3. 在加载 Compose 技能之前，指出已检查源代码中的具体 Compose API 或可组合项，或指出创建或设计 Compose 代码的明确请求。假设性的 UI 使用者不构成证据。如果两种形式的证据都不存在，即使任务提到了 UI、路由或导航，也应留在 Kotlin 集群中。
4. 将每个观察到的代码信号与下表进行匹配。
5. 仅当第二个技能负责同一变更中的独立决策时才添加它；不要推测性地加载相邻技能。
6. 当每个实质性关注点都有一个聚焦的负责方，并且在给出建议或进行编辑前已加载这些技能时，完成路由。

## 常见路由

| 任务信号 | 首先使用 |
|---|---|
| 已证实的 Compose 状态、副作用、屏幕所有权或 UI 事件收集 | [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md) |
| 重组、稳定性、帧率读取、反向写入或 `@ReadOnlyComposable` | [`compose-performance`](../compose-performance/SKILL.md) |
| 组件修饰符、调用方放置、插槽或公开内容形态 | [`compose-component-design`](../compose-component-design/SKILL.md) |
| 可见性、值、转场、内容切换或其他动效 API 的选择 | [`compose-animations`](../compose-animations/SKILL.md) |
| 键盘、TV、D-pad、焦点目标、自定义遍历或按键事件 | [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md) |
| Compose UI、截图、语义、焦点/按键或交互状态测试 | [`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md) |
| 协程所有权、原始 `Thread` 或 `Executor` 工作、取消、Flow 状态/事件、共享或重放 | [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md) |
| Kotlin 分类、`when`、守卫、穷尽性、智能转换或空值分支 | [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) |
| Kotlin 函数所有权、领域类型、expect/actual 或平台边界 | [`kotlin-api-design`](../kotlin-api-design/SKILL.md) |
| 计划执行 Gradle，或以 Gradle 为中心的警告/失败工作流 | [`gradle-run`](../gradle-run/SKILL.md) |
| 比较实体 Android 基准测试配置、排名反转或 Android 默认值 | [`android-benchmark-comparison`](../android-benchmark-comparison/SKILL.md) |
| Kotlin 库发布准备、发布或就绪状态 | [`release-kotlin-library`](../release-kotlin-library/SKILL.md) |
| 一个已准备好的 GitHub issue 或聊天中的任务需要基于仓库进行规划 | [`to-plan`](../to-plan/SKILL.md) |
| 轮询 PR/MR、审查评论、CI 失败或例行跟进 | [`shepherd`](../shepherd/SKILL.md) |

## 组合边界

- 仅当交付、重放、共享或取消是独立关注点时，才将 [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md)
  添加到 Compose 状态工作中。仅当动画工作也改变状态所有权或性能这一关注点时，才添加它们。
- 当任务也需要测试结构时，将焦点导航与 UI 测试配对。
- 当 Kotlin 关注点也改变分支逻辑时，添加 [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md)。纯 Kotlin 路由交付加上密封映射仍属于 Kotlin 集群；没有第 3 步所要求的证据时，不要添加 Compose。
- 仅针对计划中的 Gradle 执行或现有 Gradle 工作流加载 [`gradle-run`](../gradle-run/SKILL.md)，而非针对附带的 Kotlin 或 Compose 建议。