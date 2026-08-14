---
name: kotlin-flow-state-event-modeling
description: Use when writing or reviewing Kotlin Flow state and event APIs with StateFlow, MutableStateFlow.update, SharedFlow, Channel, stateIn, SharingStarted, .value, receiveAsFlow, one-shot events, or sentinel initial values.
---
# Kotlin Flow：状态与事件建模

## 核心原则

**选择符合重放、扇出和同步读取需求的原语。** `StateFlow`、`SharedFlow`、基于 `Channel` 的流以及冷 `Flow` 在缓冲方式、每次发射的接收者以及是否存在 `.value` 方面各不相同。选择错误会导致事件丢失、共享协程泄漏，或迫使你将虚假的领域哨兵值引入状态。

## 何时使用此技能

当你编写或审查涉及以下情况的 Kotlin 代码时：

- 使用 `MutableStateFlow<T>(SomeSentinel)`——`NoUser`、`Empty`、`Loading` 等——因为真实值需要异步获取
- 在函数内部调用 `.stateIn(...)`，而不是将其赋值给属性
- 对某个流使用 `SharingStarted.WhileSubscribed(...)`，但该流的 `.value` 会被同步读取且必须保持最新
- 将 `MutableSharedFlow` 用于导航事件、Snackbar 或其他不允许丢失的一次性发射
- 对 `StateFlow` 使用 `.map { }`，但消费者仍然需要同步访问 `.value`
- 使用 `MutableStateFlow.value = _state.value.copy(...)`，或在 `update { ... }` 内部构建高开销对象的更新代码

## 用于单消费者、仅触发一次事件的 SharedFlow

`SharedFlow` 默认没有重放缓冲区。如果发射发生的确切时刻没有任何收集器正在收集，该事件就会丢失。对于由**单个 UI 消费者**处理的导航或 Snackbar 等恰好一次事件，将带缓冲的 `Channel` 作为 `Flow` 暴露，通常更符合其语义：

```kotlin
// ❌ BAD
private val _navEvents = MutableSharedFlow<NavigationEvent>()
val navEvents: SharedFlow<NavigationEvent> = _navEvents.asSharedFlow()

// ✅ GOOD
private val _navEvents = Channel<NavigationEvent>(Channel.BUFFERED)
val navEvents: Flow<NavigationEvent> = _navEvents.receiveAsFlow()
```

`Channel.receiveAsFlow()` 是**扇出，而非广播**：存在多个收集器时，每个事件只会传递给**一个**收集器。`Channel.BUFFERED` 的容量是有限的，因此发送操作可能会挂起，`trySend` 也可能失败。如果多个观察者都必须看到同一个事件，请改用显式状态、持久化存储，或经过有意配置的 `SharedFlow`。

## 被无效哨兵默认值污染的 StateFlow

`StateFlow` 强制要求提供初始值。当真实值需要异步获取时，开发者有时会虚构领域值——`NoUser`、`EmptyUser`、占位 ID——导致每个消费者都不得不将该哨兵值当作真实数据处理。

```kotlin
// ❌ BAD — sentinel leaks into the type
class UserSession(private val db: Db) {
    private val _user = MutableStateFlow<User>(NoUser)
    val user: StateFlow<User> = _user.asStateFlow()
    init { scope.launch { _user.value = db.load() } }
}
```

一种解决方法是**分阶段处理**：在真实值存在之前，不要暴露 `StateFlow`。

```kotlin
// ✅ GOOD — bootstrap suspends; observers only see real users
class UserSession(private val db: Db) {
    private var _user: MutableStateFlow<User>? = null
    val user: StateFlow<User>
        get() = checkNotNull(_user) { "Call login() first" }

    suspend fun login() {
        _user = MutableStateFlow(db.load())
    }
}
```

如果缺失、加载中或错误确实是一种状态，就应显式地对其建模（`User?`、`sealed interface UserUiState`、`Result` 等）。真正的问题是用一个虚假的领域值冒充真实数据，而不是所有初始值都有问题。

## 使用 `update { ... }` 修改 MutableStateFlow

相比读取 `.value` 后再将其写回，应优先使用 `MutableStateFlow.update { current -> ... }`。`update` 会基于最新状态以原子方式应用转换，从而避免多个协程修改同一状态时发生更新丢失。

```kotlin
// BAD — read/modify/write can lose concurrent updates.
_state.value = _state.value.copy(
    selectedId = id,
    details = details,
)

// GOOD — transform starts from the latest state.
_state.update { current ->
    current.copy(
        selectedId = id,
        details = details,
    )
}
```

除非对象创建依赖当前状态，否则应将其放在 `update` 块之外。更新 lambda 可能会被重试，因此其中的昂贵操作或副作用可能会执行多次：

```kotlin
// GOOD — details does not depend on current state, so build it once.
val details = Details.from(response)
_state.update { current ->
    current.copy(details = details)
}

// GOOD — derived value depends on current state, so compute it inside.
_state.update { current ->
    val nextItems = current.items.replaceById(updatedItem)
    current.copy(items = nextItems)
}
```

该代码块应当是纯粹且快速的状态转换：不要在其中进行网络调用、数据库写入、产生副作用的日志记录、生成随机 ID 或读取时间，除非这些值已在进入该代码块之前捕获。

## 在函数内部使用 `stateIn()`

```kotlin
// ❌ BAD — new sharing coroutine every call
fun getPreferences(): StateFlow<Prefs> =
    repo.prefsFlow.stateIn(scope, SharingStarted.Eagerly, Prefs.Default)
```

每次调用 `getPreferences()` 都会在 `scope` 上启动一个永不结束的新协程。反复读取时，性能会迅速恶化。

```kotlin
// ✅ GOOD — one shared instance, computed once
val preferences: StateFlow<Prefs> =
    repo.prefsFlow.stateIn(viewModelScope, SharingStarted.Eagerly, Prefs.Default)
```

## 将 `WhileSubscribed` 与同步 `.value` 搭配使用

当没有活跃的收集器时，`SharingStarted.WhileSubscribed(timeout)` 会断开与上游的连接。断开连接期间，`.value` 返回最后缓存的值，该值可能已经过时，也可能仍然是初始值。

**规则：**如果在没有活跃收集器的情况下，`.value` 必须是最新值或已完成初始化，请使用 `SharingStarted.Eagerly` 或显式初始化。当允许使用过时值或缓存值，并且消费者主要以异步方式进行收集时，可以使用 `WhileSubscribed`。

## 对 `StateFlow` 使用 `.map` 会丢失 `.value`

```kotlin
// ❌ BAD — `name.value` won't compile; it's now a plain Flow
val name: Flow<String> = userState.map { it.name }
```

如果需要同步访问 `.value`，请使用 `.stateIn(...)` 终止该链：

```kotlin
// ✅ GOOD
val name: StateFlow<String> = userState
    .map { it.name }
    .stateIn(viewModelScope, SharingStarted.Eagerly, userState.value.name)
```

社区的“派生状态流”工具会在每次读取 `.value` 时运行转换——仅适用于快速且幂等的转换。默认使用 `.stateIn(...)`。

## 决策：选择哪种 Flow 类型？

| 需求 | 原语 |
|------|-----------|
| 始终有值的状态，同时由异步收集器**和**同步代码读取 | `StateFlow`；当 `.value` 很重要时，通常搭配 `SharingStarted.Eagerly` |
| 热流，多个订阅者，**不**要求同步访问 `.value` | `SharedFlow` |
| 供**一个**消费者使用的离散事件，恰好交付一次 | 考虑 `Channel(BUFFERED).receiveAsFlow()` |
| 冷流，每次收集对应一个消费者 | 普通 `Flow` |

如果你打算使用 `SharedFlow`，先问问自己：丢失一次发射是否会导致缺陷，以及必须有多少个消费者看到它？如果一个消费者必须恰好处理一次，`Channel` 可能更合适。如果每个观察者都必须看到它，请将其建模为持久状态，或有意地配置广播流。

## 快速参考

| 表现 | 问题 | 修复方式 |
|---------|---------|-----|
| `MutableStateFlow<X>(FakeDomainValue)` | 无效的占位默认值 | 显式建模缺失状态，或使用分阶段初始化 |
| 将 `MutableSharedFlow<Event>` 用于单消费者的导航/snackbar | 默认事件流可能丢失事件 | 考虑 `Channel(BUFFERED).receiveAsFlow()` |
| `fun foo() = flow.stateIn(...)` | 每次调用都会创建共享协程 | 将其设为 `val` / 共享实例 |
| `WhileSubscribed` + `.value` 必须是最新的/已初始化的 | 数据陈旧或仍为初始值 | 使用 `SharingStarted.Eagerly` 或显式初始化 |
| 将 `stateFlow.map { ... }` 作为状态使用 | 丢失 `.value` | 以 `.stateIn(...)` 结束 |
| `_state.value = _state.value.copy(...)` | 非原子的读取/修改/写入 | `_state.update { it.copy(...) }` |
| 在不使用当前状态的 `update { ... }` 内部创建昂贵对象 | 如果更新重试，相关工作可能重复执行 | 在 `update` 之前构建；内部仅保留依赖当前状态的转换 |

## 审查期间的危险信号

| 想法 | 实际情况 |
|---------|---------|
| “因为有多个订阅者，所以我们需要 `SharedFlow`” | 多个订阅者会改变语义。`Channel.receiveAsFlow()` 不是广播；应有意识地选择事件模型。 |
| “我们将使用 `WhileSubscribed` 来节省资源” | 只有在可以接受读取到陈旧值/初始 `.value` 时才适用。应用前请先验证。 |
| “在真实数据加载完成之前，我们先使用一个哨兵值” | 消费者会将其视为真实的领域数据；应优先采用显式的 UI/状态建模或分阶段处理。 |
| “为了方便，我会在 `update` 内部构造新对象” | 该 lambda 可能会重试。除非对象依赖当前状态，否则应在外部构造。 |

## 相关内容

- [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) — 在建模状态和事件时选择 `when`、守卫条件、穷尽性、智能类型转换和提前返回。
- [`kotlin-coroutines-structured-concurrency`](../kotlin-coroutines-structured-concurrency/SKILL.md) — 作用域所有权、初始化启动、即发即弃边界、取消、`runBlocking`
- [`compose-side-effects`](../compose-side-effects/SKILL.md) — 在 Compose 中收集事件流并接入副作用
- [`compose-state-hoisting`](../compose-state-hoisting/SKILL.md) — 状态持有者向纯状态驱动的 UI 暴露流的位置