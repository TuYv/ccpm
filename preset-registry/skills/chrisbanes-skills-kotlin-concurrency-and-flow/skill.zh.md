---
name: kotlin-concurrency-and-flow
description: Use when writing or reviewing Kotlin coroutine scope ownership, init launches, non-suspending launch APIs, runBlocking, cancellation, StateFlow, SharedFlow, Channel, stateIn, SharingStarted, state updates, or one-shot events.
---
# Kotlin 并发与 Flow

## 核心原则

为异步工作指定明确的所有者和生命周期，然后使用交付与重放语义符合产品契约的原语，对持久状态和瞬时事件进行建模。

## 步骤

1. 识别每个协程所有者、取消边界、生产者、消费者、持久状态和瞬时事件。
2. 在更改 API 之前，将其现有的调用方可见契约与所需的所有者和生命周期进行比较。如果某个挂起 API 已经将取消、结果和失败的所有权交给其调用方，则无需更改；不要仅仅为了方便而添加作用域、`launch`、回调或 deferred 包装器。
3. 选择生命周期拥有该工作的作用域；不要保留任意作用域，也不要将非结构化的 launch 隐藏在非挂起 API 背后。
4. 将可渲染的当前数据建模为状态；仅当数据丢失和重放行为被明确接受时，才将命令式的一次性工作建模为事件。
5. 根据生产者和消费者的生命周期选择 Flow 的共享与缓冲语义，而不是采用默认方案。
6. 阅读下方与当前实质性问题相关的专项参考资料。
7. 当取消、重启、重放和失败行为均可通过公共 API 观察到，且任何调用方都无须猜测工作由谁负责时，即可结束。

## 主题导航

| 信号 | 阅读 |
|---|---|
| 存储的 `CoroutineScope`、`init { launch }`、即发即弃 API、`runBlocking`、宽泛的 catch 或取消边界 | [结构化并发](references/structured-concurrency.md) |
| `StateFlow`、`SharedFlow`、`Channel`、`stateIn`、`SharingStarted`、`.value`、状态更新、哨兵值或一次性事件 | [Flow 状态与事件](references/flow-state-events.md) |
| Compose 收集或 UI 副作用处理 | [Compose 状态与副作用](../compose-state-and-effects/SKILL.md) |

## RED/GREEN 智能体场景

1. RED 在服务中存储一个长期存在的 `CoroutineScope`，并从任意调用方启动协程。GREEN 让所有权和取消行为遵循明确定义的生命周期边界。
2. 新颖案例：某个屏幕需要可重放的加载状态和不可重放的导航。GREEN 使用不同的状态与事件契约，并记录其交付语义。
3. 反例：某个挂起函数已经具有调用方拥有的作用域。GREEN 会报告无须更改代码，而不是仅仅为了让 API 看起来是异步的就添加内部作用域。