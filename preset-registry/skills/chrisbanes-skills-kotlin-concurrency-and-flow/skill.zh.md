---
name: kotlin-concurrency-and-flow
description: Use when writing or reviewing Kotlin coroutine scope ownership, init launches, non-suspending launch APIs, runBlocking, cancellation, StateFlow, SharedFlow, Channel, stateIn, SharingStarted, state updates, or one-shot events.
---
# Kotlin 并发与 Flow

## 核心原则

为异步工作指定明确的所有者和生命周期，然后使用交付与重放语义符合产品契约的原语，对持久状态和瞬时事件进行建模。

## 流程

1. 识别每个协程所有者、取消边界、生产者、消费者、持久状态和瞬时事件。
2. 选择其生命周期能够拥有该工作的作用域；不要持有任意作用域，也不要在非挂起 API 背后隐藏非结构化的启动操作。
3. 将可渲染的当前数据建模为状态；只有当事件丢失与重放行为明确可接受时，才将命令式的一次性工作建模为事件。
4. 根据生产者和消费者的生命周期选择 Flow 的共享与缓冲语义，而不是采用默认设置。
5. 阅读下方与当前重点问题相关的参考资料。
6. 当取消、重启、重放和失败行为均可通过公共 API 观察到，并且调用方不必猜测工作由谁拥有时，即告完成。

## 主题导航

| 信号 | 阅读 |
|---|---|
| 存储的 `CoroutineScope`、`init { launch }`、即发即弃 API、`runBlocking`、宽泛捕获或取消边界 | [结构化并发](references/structured-concurrency.md) |
| `StateFlow`、`SharedFlow`、`Channel`、`stateIn`、`SharingStarted`、`.value`、状态更新、哨兵值或一次性事件 | [Flow 状态与事件](references/flow-state-events.md) |
| Compose 收集或 UI 副作用处理 | [Compose 状态与副作用](../compose-state-and-effects/SKILL.md) |

## RED/GREEN 智能体场景

1. RED 在服务中存储一个长期存在的 `CoroutineScope`，并从任意调用方启动协程。GREEN 让所有权和取消行为遵循明确的生命周期边界。
2. 新颖案例：某个屏幕需要可重放的加载状态和不可重放的导航。GREEN 使用彼此独立的状态契约和事件契约，并记录其交付语义。
3. 反例：某个挂起函数已经拥有由调用方管理的作用域。GREEN 不会仅仅为了让 API 看起来是异步的而添加内部作用域。