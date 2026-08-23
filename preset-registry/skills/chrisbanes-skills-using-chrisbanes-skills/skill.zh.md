---
name: using-chrisbanes-skills
description: Use when debugging, benchmarking, or profiling leads into Kotlin or Jetpack Compose source before the cause is known, or when one task spans multiple Kotlin or Compose concerns, especially plain Kotlin Flow or navigation delivery plus sealed branching.
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# 使用 chrisbanes skills

## 核心原则

根据代码所需的决策进行路由，而不是根据提示中提到的 API 数量进行路由。当某个集群的共享流程负责处理该问题时，加载一个集群；只有当某个专项 skill 的独立行为会改变同一项工作时，才添加它。

## 路由流程

1. 阅读任务以及使代码设计问题具体化的 Kotlin 源代码。
2. 如果某个聚焦的 skill 明确匹配，直接加载它并停止路由。
3. 在加载 Compose skill 之前，指出所检查源代码中的具体 Compose API 或可组合项，或者确认任务明确要求创建或设计 Compose 代码。假设存在 UI 使用方不能作为依据。如果这两类依据都不存在，即使任务提到了 UI、路由或导航，也应留在 Kotlin 集群中。
4. 否则，将观察到的每个代码信号与下表进行匹配，并加载能够覆盖该工作的最小 skill 集合。
5. 仅当不同问题会影响同一项变更时才组合 skills；不要推测性地加载相邻的 skills。
6. 当每个实质性问题都由一个聚焦的负责人覆盖，并且在提供建议或进行编辑前已加载这些 skills 时，结束路由。

## 常见路由

| 任务信号 | 从以下 skill 开始 |
|---|---|
| 广泛的 Compose 屏幕审查、本地或提升后的 UI 状态、屏幕状态持有者、effect API、导航 effect、snackbar、分析埋点、焦点请求，或事件 Flow 收集，且有 Compose API、可组合屏幕或明确的全新 Compose 请求作为依据 | [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md) |
| 重组、卡顿、编译器报告、可跳过性、不稳定参数、帧率级 State 读取、反向写入或 `@ReadOnlyComposable` | [`compose-performance`](../compose-performance/SKILL.md) |
| Modifier 参数、根布局放置、可变视觉内容、基础内容参数、可选内容或布尔形态标志 | [`compose-component-design`](../compose-component-design/SKILL.md) |
| Compose 可见性、值、颜色、尺寸、过渡、内容切换或动画 API 的选择 | [`compose-animations`](../compose-animations/SKILL.md) |
| 键盘、TV、桌面端、方向键、`FocusRequester`、`focusProperties`、按键事件或初始焦点行为 | [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md) |
| Compose UI 测试、截图测试、预览、语义、伪造图片加载、键盘输入、焦点断言或交互状态测试 | [`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md) |
| 协程作用域所有权、`init { launch }`、非挂起式启动 API、`runBlocking`、取消、`StateFlow`、`SharedFlow`、`Channel`、`stateIn` 或一次性事件 | [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md) |
| Kotlin 分支、`when` 表达式、守卫条件、密封类型穷尽性、智能类型转换、可空分支或复杂的 `if`/`else` 链 | [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) |
| Kotlin 函数放置、成员函数与顶层函数或扩展函数的选择、工厂、单字段领域类型、值类、Kotlin Multiplatform 源集、expect/actual 或平台服务 | [`kotlin-api-design`](../kotlin-api-design/SKILL.md) |
| 计划执行 Gradle、紧凑的 Gradle 工作流记录、重复出现的 Gradle 失败特征，或以 Gradle 为中心的构建、检查、警告清理或失败处理工作流，包括应在再次运行前停止的诊断 | [`gradle-run`](../gradle-run/SKILL.md) |
| 一个已准备好的 GitHub issue 或聊天中的任务，需要在单独的实现会话之前进行结合仓库上下文的规划 | [`to-plan`](../to-plan/SKILL.md) |
| 轮询或推进 PR/MR、分类处理审查意见、修复 CI 失败或持续推动审查进展 | [`shepherd`](../shepherd/SKILL.md) |

## 组合技能

- 对于组件中的 Compose 事件处理，使用 [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md)；当事件传递语义很重要时，再添加 [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md)。
- 对于性能相关工作，从 [`compose-performance`](../compose-performance/SKILL.md) 开始。
- 对于由状态触发的动画，使用 [`compose-animations`](../compose-animations/SKILL.md)；涉及所有权变更时添加 [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md)，涉及帧率数值时添加 [`compose-performance`](../compose-performance/SKILL.md)。
- 对于可复用的 UI 组件，使用 [`compose-component-design`](../compose-component-design/SKILL.md)。
- 对于焦点行为相关的测试，先使用 [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md)，再使用 [`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md) 确定测试结构。
- 对于同时会改变分支结构的 Kotlin 状态、并发或平台边界相关工作，将相应技能集群与 [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) 组合使用。
- 对于纯 Kotlin 导航传输加密封路由映射，将 [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md) 与 [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) 组合使用。除非存在 Compose API 或状态/副作用所有权，或明确要求将其作为新代码，否则不要添加 [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md)。
- 不要根据潜在的 UI 使用方推断存在 Compose 关注点。应根据
  已检查的源代码进行路由，而不是根据任务中未提供的使用方进行路由。
- 如果没有计划执行 Gradle，也没有现有 Gradle 工作流的证据，则 Kotlin 或 Compose 建议不会加载
  [`gradle-run`](../gradle-run/SKILL.md)。

## RED/GREEN 智能体场景

1. RED 为具有本地状态和 snackbar 的屏幕加载所有 Compose 技能。
   GREEN 先加载 [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md)，并且仅在有证据表明存在相应关注点时才添加其他技能。
2. 新场景：一个可复用卡片存在 modifier 问题和高度动画。
   GREEN 使用 [`compose-component-design`](../compose-component-design/SKILL.md) 加 [`compose-animations`](../compose-animations/SKILL.md)，而不是默认使用状态技能集群。
3. 反例：请求只更改通用 Kotlin 中的一个守卫条件。
   GREEN 加载 [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md)，而不通过 API 设计进行路由。
4. 新场景：同时审查纯 Kotlin 的一次性路由传递和密封数据路由
   渲染器。GREEN 加载
   [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md) 和
   [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md)，而不是 Compose
   状态技能集群；提及一个假设的 UI 收集器并不能作为存在 Compose
   关注点的证据。
5. 绿地场景：任务明确要求设计一个新的 composable，用于
   收集一次性 Flow。即使该 composable 尚不存在，GREEN 也会加载
   [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md) 和
   [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md)。
6. 停止场景：一份简洁的 Gradle 记录反复出现相同的主要源代码故障。
   GREEN 加载 [`gradle-run`](../gradle-run/SKILL.md)，停止重复运行循环，并
   明确指出在进行任何修复或执行任何命令之前，应先对相关源代码进行重点检查。