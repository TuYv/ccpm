---
name: using-chrisbanes-skills
description: Use when debugging, benchmarking, or profiling leads into Kotlin or Jetpack Compose source before the cause is known, or when a broad Kotlin or Compose review spans multiple design concerns.
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# 使用 chrisbanes 技能

## 核心原则

根据代码需要做出的决策进行路由，而不是根据提示中提到的 API 数量进行路由。当某个技能集的共享流程负责处理相关问题时，加载一个技能集；只有当某个专门技能的独立行为会改变同一项工作时，才额外加载该技能。

## 路由流程

1. 阅读任务以及使代码设计问题具体化的 Kotlin 源代码。
2. 如果某个聚焦技能明确匹配，则直接加载该技能并停止路由。
3. 否则，将观察到的每个代码信号与下表进行匹配，并加载能够覆盖这项工作的最小技能集合。
4. 仅当不同问题会影响同一项修改时才组合技能；不要推测性地加载相邻技能。
5. 当每个实质性问题都有一个专门的负责技能，并且这些技能已在提供建议或进行编辑之前加载完成时，结束路由。

## 常见路由

| 任务信号 | 从以下技能开始 |
|---|---|
| 广泛的 Compose 屏幕评审、本地或提升的 UI 状态、屏幕状态持有者、副作用 API、导航、snackbar、分析、焦点请求或事件 Flow 收集 | [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md) |
| 重组、卡顿、编译器报告、可跳过性、不稳定参数、帧率 State 读取、回写或 `@ReadOnlyComposable` | [`compose-performance`](../compose-performance/SKILL.md) |
| Modifier 参数、根布局放置、可变视觉内容、原始类型内容参数、可选内容或 Boolean 形状标志 | [`compose-component-design`](../compose-component-design/SKILL.md) |
| Compose 可见性、值、颜色、大小、过渡、内容替换或动画 API 的选择 | [`compose-animations`](../compose-animations/SKILL.md) |
| 键盘、TV、桌面端、D-pad、`FocusRequester`、`focusProperties`、按键事件或初始焦点行为 | [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md) |
| Compose UI 测试、截图测试、预览、语义、伪造图片加载、键盘输入、焦点断言或交互状态测试 | [`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md) |
| 协程作用域所有权、`init { launch }`、非挂起的启动 API、`runBlocking`、取消、`StateFlow`、`SharedFlow`、`Channel`、`stateIn` 或一次性事件 | [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md) |
| Kotlin 分支、`when` 表达式、守卫条件、密封类型穷举性、智能转换、可空分支或复杂的 `if`/`else` 链 | [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) |
| Kotlin 函数放置、成员函数与顶层函数或扩展函数、工厂、单字段领域类型、值类、Kotlin Multiplatform 源集、expect/actual 或平台服务 | [`kotlin-api-design`](../kotlin-api-design/SKILL.md) |
| 计划中的 Gradle 执行，或以 Gradle 为中心的构建、检查、警告清理或失败处理流程 | [`gradle-run`](../gradle-run/SKILL.md) |
| 一个现成的 GitHub issue 或聊天中的任务，需要在单独的实现会话之前进行了解仓库的规划 | [`to-plan`](../to-plan/SKILL.md) |
| 轮询或跟进 PR/MR、整理评审评论、修复 CI 失败或推动评审进展 | [`shepherd`](../shepherd/SKILL.md) |

## 组合使用技能

- 对于组件中的 Compose 事件处理，请使用 [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md)，当事件传递语义很重要时，再添加 [`kotlin-concurrency-and-flow`](../kotlin-concurrency-and-flow/SKILL.md)。
- 对于性能相关工作，请从 [`compose-performance`](../compose-performance/SKILL.md) 开始。
- 对于由状态触发的动画，请使用 [`compose-animations`](../compose-animations/SKILL.md)；对于所有权变更，添加 [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md)；对于帧率数值，添加 [`compose-performance`](../compose-performance/SKILL.md)。
- 对于可复用的 UI 组件，请使用 [`compose-component-design`](../compose-component-design/SKILL.md)。
- 对于围绕焦点行为的测试，请先使用 [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md)，然后使用 [`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md) 确定测试结构。
- 对于同时会改变分支结构的 Kotlin 状态、并发或平台边界相关工作，将该技能集群与 [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) 组合使用。
- 不执行任何 Gradle 操作的 Kotlin 或 Compose 建议不会加载 [`gradle-run`](../gradle-run/SKILL.md)。

## RED/GREEN 代理场景

1. RED 为一个包含本地状态和 snackbar 的屏幕加载所有 Compose 技能。
   GREEN 首先加载 [`compose-state-and-effects`](../compose-state-and-effects/SKILL.md)，只有在有证据表明存在相关问题时才添加其他技能。
2. 新颖案例：一个可复用卡片存在 modifier 问题和高度动画。
   GREEN 使用 [`compose-component-design`](../compose-component-design/SKILL.md) 加 [`compose-animations`](../compose-animations/SKILL.md)，而不是默认使用状态技能集群。
3. 反例：一个请求仅改变了 common Kotlin 中的守卫条件。
   GREEN 加载 [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md)，而不是转向 API 设计。