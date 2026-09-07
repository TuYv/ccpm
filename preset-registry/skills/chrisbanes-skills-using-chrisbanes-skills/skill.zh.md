---
name: using-chrisbanes-skills
description: Use when debugging, benchmarking, or profiling leads into Kotlin or Jetpack Compose source before the cause is known, or when one task spans multiple Kotlin or Compose concerns, especially plain Kotlin Flow or navigation delivery plus sealed branching.
---
# 使用 chrisbanes skills

## 核心原则

根据代码需要作出的决策进行路由，而不是根据提到的 API 数量进行路由。
当某个技能集的通用流程负责处理该关注点时，加载一个技能集；只有当某个专门技能的独立行为会改变同一项工作时，才添加该技能。

## 路由流程

1. 阅读任务，以及使该关注点具体化的 Kotlin 源代码。
2. 如果某个专注型技能明确匹配，则直接加载该技能并停止路由。
3. 在加载 Compose 技能之前，必须在已检查的源代码中指出具体的 Compose API 或可组合函数，或者存在明确要求创建或设计 Compose 代码的请求。假设存在 UI 消费者不能作为证据。如果两种证据都不存在，即使任务提到了 UI、路由或导航，也应停留在 Kotlin 技能集。
4. 将每个观察到的代码信号与下表匹配。
5. 只有当第二个技能负责同一项变更中的独立决策时，才添加该技能；不要推测性地加载相邻技能。
6. 当每个实质性关注点都有一个专注型负责人，并且这些技能已在提供建议或进行编辑之前加载后，完成路由。

## 常见路由

| 任务信号 | 从以下技能开始 |
|---|---|
| 有证据表明存在 Compose 状态、效果、屏幕所有权或 UI 事件收集 | [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md) |
| 重组、稳定性、帧率读取、回写或 `@ReadOnlyComposable` | [`compose-performance`](../compose-performance/SKILL.md) |
| 组件修饰符、调用方放置位置、插槽或公共内容形态 | [`compose-component-design`](../compose-component-design/SKILL.md) |
| 可见性、值、过渡、内容切换或其他动画 API 选择 | [`compose-animations`](../compose-animations/SKILL.md) |
| 键盘、TV、D-pad、焦点目标、自定义遍历或按键事件 | [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md) |
| Compose UI、截图、语义、焦点/按键或交互状态测试 | [`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md) |
| 协程所有权、原始 `Thread` 或 `Executor` 工作、取消、Flow 状态/事件、共享或重放 | [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md) |
| Kotlin 分类、`when`、守卫条件、完备性、智能转换或 null 分支 | [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) |
| Kotlin 函数所有权、领域类型、expect/actual 或平台接缝 | [`kotlin-api-design`](../kotlin-api-design/SKILL.md) |
| 计划执行 Gradle，或以 Gradle 为中心的警告/失败流程 | [`gradle-run`](../gradle-run/SKILL.md) |
| Kotlin 库发布准备、发布或就绪性 | [`release-kotlin-library`](../release-kotlin-library/SKILL.md) |
| 一个现成的 GitHub issue 或聊天中的任务需要结合仓库信息进行规划 | [`to-plan`](../to-plan/SKILL.md) |
| 轮询 PR/MR、评审评论、CI 失败或例行跟进 | [`shepherd`](../shepherd/SKILL.md) |

## 组合边界

- 仅当交付、重放、共享或取消是独立关注点时，才将 [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md) 添加到 Compose 状态工作中。当动画工作也改变状态所有权或性能关注点时，才添加状态所有权或性能技能。
- 当任务还需要测试形态时，将焦点导航与 UI 测试配对。
- 当 Kotlin 关注点还会改变分支逻辑时，添加 [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md)。普通 Kotlin 路由交付加上密封映射仍属于 Kotlin 技能集；如果没有步骤 3 要求的证据，不要添加 Compose。
- 仅针对计划执行 Gradle 或现有 Gradle 工作流加载 [`gradle-run`](../gradle-run/SKILL.md)，不要因附带的 Kotlin 或 Compose 建议而加载。