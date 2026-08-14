---
name: using-chrisbanes-skills
description: Use when debugging, benchmarking, or profiling leads into Kotlin or Jetpack Compose source before the cause is known, or when a broad Kotlin or Compose review spans multiple design concerns.
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# 使用 chrisbanes skills

## 核心原则

根据代码所需的决策进行路由，而不是根据提示中提及的 API 数量进行路由。当某个技能集群的共享流程负责处理相关问题时，加载该集群；仅当某个专项技能的独立行为会改变同一项工作时，才添加该技能。

## 路由流程

1. 阅读任务以及使代码设计问题具体化的 Kotlin 源代码。
2. 如果某个专注技能明显匹配，则直接加载该技能并停止路由。
3. 否则，将观察到的每个代码信号与下表进行匹配，并加载能够覆盖相关工作的最小技能集合。
4. 仅当不同问题会影响同一项变更时才组合技能；不要推测性地加载相邻技能。
5. 当每个实质性问题都有一个专注技能负责，并且这些技能已在提供建议或进行编辑之前加载时，完成路由。

## 常见路由

| 任务信号 | 首先使用 |
|---|---|
| 广泛的 Compose 屏幕审查、局部或提升的 UI 状态、屏幕状态持有者、effect API、导航、snackbar、分析埋点、焦点请求或事件 Flow 收集 | [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md) |
| 重组、卡顿、编译器报告、可跳过性、不稳定参数、帧速率级 State 读取、反向写入或 `@ReadOnlyComposable` | [`compose-performance`](../compose-performance/SKILL.md) |
| Modifier 参数、根布局放置、可变视觉内容、原始内容参数、可选内容或布尔形状标志 | [`compose-component-design`](../compose-component-design/SKILL.md) |
| Compose 可见性、值、颜色、大小、过渡、内容切换或动画 API 选择 | [`compose-animations`](../compose-animations/SKILL.md) |
| 键盘、TV、桌面端、方向键、`FocusRequester`、`focusProperties`、按键事件或初始焦点行为 | [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md) |
| Compose UI 测试、截图测试、预览、语义、模拟图片加载、键盘输入、焦点断言或交互状态测试 | [`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md) |
| 协程作用域所有权、`init { launch }`、非挂起式启动 API、`runBlocking`、取消、`StateFlow`、`SharedFlow`、`Channel`、`stateIn` 或一次性事件 | [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md) |
| Kotlin 分支、`when` 表达式、守卫条件、密封类型穷尽性、智能类型转换、可空分支或复杂的 `if`/`else` 链 | [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) |
| Kotlin 函数放置、成员函数与顶层函数或扩展函数的选择、工厂、单字段领域类型、值类、Kotlin Multiplatform 源集、expect/actual 或平台服务 | [`kotlin-api-design`](../kotlin-api-design/SKILL.md) |
| 一个已就绪的 GitHub issue 或已确认的对话规格，需要在单独的实现会话之前进行结合仓库上下文的规划 | [`to-plan`](../to-plan/SKILL.md) |
| 轮询或推进 PR/MR、分类处理审查评论、修复 CI 失败或持续推动审查进展 | [`shepherd`](../shepherd/SKILL.md) |

## 组合使用技能

- 对于组件中的 Compose 事件处理，请使用 [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md)；当事件传递语义很重要时，再添加 [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md)。
- 对于性能工作，请从 [`compose-performance`](../compose-performance/SKILL.md) 开始。
- 对于由状态触发的动画，请使用 [`compose-animations`](../compose-animations/SKILL.md)；涉及所有权变更时，添加 [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md)；涉及帧率数值时，添加 [`compose-performance`](../compose-performance/SKILL.md)。
- 对于可复用的 UI 组件，请使用 [`compose-component-design`](../compose-component-design/SKILL.md)。
- 对于围绕焦点行为的测试，请先使用 [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md)，然后使用 [`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md) 来确定测试结构。
- 对于同时会改变分支结构的 Kotlin 状态、并发或平台边界工作，请将该技能集群与 [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) 结合使用。

## RED/GREEN 智能体场景

1. RED 为一个包含本地状态和 snackbar 的界面加载所有 Compose 技能。
   GREEN 首先加载 [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md)，仅在有明确依据表明存在其他关注点时才添加其他技能。
2. 新颖案例：一个可复用的卡片存在 modifier 问题，并带有高度动画。
   GREEN 使用 [`compose-component-design`](../compose-component-design/SKILL.md) 加上 [`compose-animations`](../compose-animations/SKILL.md)，而不是默认使用状态技能集群。
3. 反例：一个请求仅更改通用 Kotlin 中的守卫条件。
   GREEN 加载 [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md)，而不将其归入 API 设计。