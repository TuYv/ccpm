---
name: kotlin-concurrency-and-flow
description: Use when writing or reviewing Kotlin coroutine scope ownership, raw Thread or Executor work, init launches, non-suspending launch APIs, runBlocking, cancellation, StateFlow, SharedFlow, Channel, stateIn, SharingStarted, state updates, or one-shot events.
---
# Kotlin 并发与 Flow

## 核心原则

为异步工作指定明确的所有者和生命周期，然后使用交付与重放语义符合产品契约的原语，分别对持久状态和瞬时事件进行建模。

## 操作流程

1. 识别每个协程所有者、取消边界、生产者、消费者、持久状态和瞬时事件。
2. 修改 API 之前，将其现有的调用方可见契约与所需的所有者和生命周期进行比较。如果一个挂起 API 已经将取消、结果和失败的所有权交给调用方，则保持不变并结束；不要仅仅为了方便而添加作用域、`launch`、回调或 deferred 包装器。
3. 选择生命周期能够拥有该工作的作用域；不要持有任意作用域，也不要通过非挂起 API 隐藏非结构化启动。
4. 将可渲染的当前数据建模为状态；只有在明确接受其丢失和重放行为时，才将命令式的一次性工作建模为事件。对于必须在收集器暂时中断期间仍能保留、且由单个消费者处理的导航交接，应选择通过 `receiveAsFlow()` 暴露的带缓冲 `Channel`；在确认事件丢失是缺陷后，不要继续使用 replay 为零的 `SharedFlow`。
5. 根据生产者和消费者的生命周期选择 Flow 共享与缓冲语义，而不是依赖默认值。
6. 阅读下面针对相关主题的专门参考文档。
7. 当取消、重启、重放和失败行为都能从公共 API 中观察到，并且调用方无需猜测工作由谁拥有时，即可结束。

## 主题路由

| 信号 | 阅读 |
|---|---|
| 存储的 `CoroutineScope`、原始 `Thread` 或 `Executor` 工作、`init { launch }`、即发即忘 API、`runBlocking`、宽泛的 catch 或取消边界 | [结构化并发](references/structured-concurrency.md) |
| `StateFlow`、`SharedFlow`、`Channel`、`stateIn`、`SharingStarted`、`.value`、状态更新或一次性事件 | [Flow 状态与事件](references/flow-state-events.md) |
| Compose 收集或 UI 效果处理 | [Compose 状态与效果](../compose-state-and-effects/SKILL.md) |