---
name: kotlin-coroutines-structured-concurrency
description: Use when writing or reviewing Kotlin code that stores CoroutineScope, launches from init/non-suspending APIs, calls runBlocking, or catches broad exceptions around suspend calls.
---
# Kotlin 协程：结构化并发

## 核心原则

结构良好的协程是一个自包含的异步工作单元——单一入口、单一出口，并且作用域限定在调用点已知的生命周期内。

**作用域通常应绑定到调用方的生命周期，而不应作为属性存储在被调用方中。** 存储的 `CoroutineScope` 是一个强烈的代码审查信号：该类必须证明自己负责取消、错误报告、重启行为和生命周期。大多数存储库、管理器、用例和数据源都无法做到这一点，因此它们应当改为暴露 `suspend` API。

修复方法几乎总是相同的：**将 API 设为 `suspend`，并让调用方拥有作用域。**

## 何时使用此技能

当你编写或审查 Kotlin 代码，并看到以下任一情况时：

- 类中包含 `private val scope: CoroutineScope`（构造函数参数被存储为属性）
- 存在 `init { scope.launch { ... } }` 代码块
- 非挂起的公共函数，其函数体为 `scope.launch { ... }`
- 在支持挂起的应用程序代码中使用 `runBlocking { ... }`，或者在本应使用 `runTest` 的测试中使用它
- 在未重新抛出 `CancellationException` 的情况下，使用 `runCatching { suspendCall() }`，或者在 `suspend` 调用周围捕获 `Exception` / `Throwable`
- 在挂起操作周围使用 `catch (e: CancellationException)`（或等效写法），但未重新抛出异常

## 静默取消缺陷

不受自身管理的 `CoroutineScope` 属性之所以如此危险，原因在于：**一旦作用域被取消，之后在该作用域上执行的每一次 `launch` 都会静默地以已取消状态结束——没有异常、没有日志、什么都没有。** 工作根本不会执行。这是最难诊断的协程缺陷之一，通常出现在某个类长期持有其并不拥有的生命周期引用时。

如果 API 是 `suspend`，就不会发生这种情况：调用方的作用域要么仍处于活动状态（工作会执行），要么调用点被取消（调用方知道这一情况）。

## 反模式及修复方法

### 1. 将 CoroutineScope 存储为属性

```kotlin
// ❌ BAD
@Inject
class UserRepository(
    private val scope: CoroutineScope,
    private val api: UserApi,
) {
    fun refresh() {
        scope.launch { _state.value = api.fetchUser() }
    }
}

// ✅ GOOD
@Inject
class UserRepository(
    private val api: UserApi,
) {
    suspend fun refresh(): User = api.fetchUser()
}
```

存储库不再需要了解任何协程相关内容。调用方（ViewModel 或用例）决定使用什么作用域、如何处理错误，以及采用什么取消语义。

### 2. init 代码块中的启动操作

```kotlin
// ❌ BAD: construction-time side effect, unbounded work
class UserSession(private val scope: CoroutineScope, private val api: Api) {
    init { scope.launch { _user.value = api.load() } }
}
```

构造函数会立即返回。调用方无法使用 `await` 等待加载完成、无法看到错误，也无法取消。类虽然处于“活动”状态，但其状态尚未确定。

```kotlin
// ✅ GOOD: explicit bootstrap, caller owns the suspension
class UserSession(private val api: Api) {
    private var _user: User? = null
    val user: User get() = checkNotNull(_user) { "Call init() first" }

    suspend fun init() { _user = api.load() }
}
```

### 3. 非 UI 类中的即发即弃

**非 UI 类**（仓库、管理器、用例、数据源）上的非挂起公共函数，在类自身持有的作用域中启动协程。调用方得不到结果、错误或取消通知，也无法保证任务曾经执行过。

```kotlin
// ❌ BAD — repository with stored scope and fire-and-forget public API
class AnalyticsClient(private val scope: CoroutineScope, private val api: Api) {
    fun track(event: Event) {
        scope.launch { api.send(event) }      // caller has no idea what happens
    }
    fun signOut() {
        scope.launch { api.signOut() }        // silent failure if scope cancelled
    }
}
```

```kotlin
// ✅ GOOD
class AnalyticsClient(private val api: Api) {
    suspend fun track(event: Event) = api.send(event)
    suspend fun signOut() = api.signOut()
}
```

#### 例外：UI ↔ 状态持有者边界

UI 框架是非挂起的。Composable 的 `onClick`、Fragment 的 `onKeyEvent`、Activity 的 `onNewIntent`——它们都不能 `suspend`。状态持有者（ViewModel、Decompose Component、功能模型等——任何负责接收 UI 事件并持有 UI 状态的对象）**正是**将一次性 UI 事件转换为绑定到 UI 生命周期的异步工作的边界。这就是它的职责。

```kotlin
// ✅ GOOD — state holder absorbs a non-suspending UI event onto its scope
class FavouritesViewModel(private val repo: FavouritesRepository) : ViewModel() {
    fun onToggleFavourite(item: Item) {
        viewModelScope.launch { repo.toggleFavourite(item) }
    }
}

// in Compose:
ListItem(onClick = { viewModel.onToggleFavourite(item) })
```

这**不是**即发即弃反模式。以下三个条件必须全部满足：

1. **UI 界面的状态持有者**——ViewModel、Decompose Component、功能模型或等效的 UI 状态持有者。不能是仓库、管理器、用例或数据源。
2. **绑定到生命周期的作用域**——`viewModelScope`、销毁时会被取消的 Component 的 `coroutineScope`、Composable 的 `rememberCoroutineScope()`。不能是 `AppScope`，不能是注入的长生命周期作用域，也不能是临时创建的 `CoroutineScope(...)`。
3. **调用方确实是 UI 事件**——Composable 回调、按键处理程序、生命周期钩子。不能是另一个业务逻辑类通过状态持有者进行调用。

底层的仓库、用例和数据源层仍然公开 `suspend` API。状态持有者是非挂起 → 挂起转换**唯一**应当存在的层。

“感觉像状态持有者”还不够。问题在于“UI 是否直接绑定到它？”如果不是，则此例外不适用。

### 4. 未通过注入获得的存储作用域

同一种反模式，只是没有使用注入的作用域：

```kotlin
// ❌ BAD — same problem, scope is constructed in-class instead of injected
class FooManager {
    private val scope = MainScope()
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
}
```

现在生命周期不由任何对象负责，并且会永远存活。应改用 `suspend` API。

如果实例化操作嵌套在函数体内，情况也是如此——`fun foo() { CoroutineScope(...).launch { … } }` 只不过是多了几个步骤的存储型作用域。每次调用都会泄漏一个新的、不可取消的作用域；把它封装到 `by lazy` 属性中并不能解决根本问题（这个作用域本来就不应该存在）。

### 5. 启动协程的 DI 绑定单例 / 初始化器

有一种特别难以发现的模式：一个由 DI 绑定的类（`@SingleIn(AppScope)`、`@Singleton`、`Initializer.initialize()`）从其构造函数 / `init` 块 / `initialize()` 中启动协程。由此启动的工作会具有以下问题：

- **启动时间不确定**——取决于依赖图何时实例化该绑定。冷启动顺序是不可见的。
- **没有可观察的生命周期。** 代码库中的其他部分无法得知它是否正在运行或是否已经崩溃。
- **没有 `stop()` / 重启路径。** 如果上游进入异常状态，该循环无法取消。
- **没有可供 grep 查找的调用代码。** 阅读者无法找到“是谁在何时启动了它”。

§1 指出，作用域应与调用方的生命周期绑定。DI 绑定的变体间接违反了这一原则：虽然*作用域*可能是注入的，但*启动操作*隐藏在构造过程中——效果相同，却更难发现。

```kotlin
// ❌ BAD — singleton boots work as a side effect of being constructed
@SingleIn(AppScope::class)
@Inject
class TokenRefresher(
    @ForScope(AppScope::class) private val scope: CoroutineScope,
    private val auth: AuthService,
) {
    init {
        scope.launch {
            while (isActive) {
                delay(5.minutes)
                auth.refreshIfNeeded()
            }
        }
    }
}

// ❌ ALSO BAD — Initializer.initialize() that *launches*, not just registers
class TokenInvalidatorInitializer @Inject constructor(
    @ForScope(AppScope::class) private val scope: CoroutineScope,
    private val store: AuthStore,
    private val invalidator: TokenInvalidator,
) : Initializer {
    override fun initialize() {
        scope.launch { store.tokenChanges.collect { invalidator.invalidate() } }
    }
}
```

两者看起来都像“应用作用域单例”，但 **When NOT to apply** 中的例外*并不*意味着可以从 `init` / `initialize()` 启动协程。它允许单例在其 API 为挂起式 API 时拥有一个作用域。

#### 首先要问：这个后台循环类真的有必要存在吗？

大多数后台循环类之所以存在，只是因为没有人反转观察关系。按优先级排序，有三种解决方案：

**模式 1——将观察逻辑反转到使用方。** 该类持续观察状态，以便在状态发生变化时作出响应。但总有*某个地方*会修改这个状态——退出登录流程、个人资料切换、功能标志更新处理程序。该修改位置本身就已经处于协程上下文中，也是直接执行相关工作的自然位置。

```kotlin
// ✅ GOOD — no background loop, no scope, no class. The mutation site does the work.
class Authenticator(
    private val authStore: AuthStore,
    private val tokenInvalidator: TokenInvalidator,
) {
    suspend fun signOut() {
        authStore.clearTokens()
        tokenInvalidator.invalidate()   // direct call at the mutation site
    }
}
```

后台循环类已被**删除**。工作在状态发生变化的位置执行。

适用场景：状态的消费者具有明确的生命周期（用例、Authenticator、服务处理程序），并且可以内联执行响应操作。

**模式 2 —— 调度工作。** 真正具有周期性或延迟执行性质的工作。使用 WorkManager / BGTaskScheduler。入队操作是一次性的；将其设为挂起操作，并由一个已在启动时运行的编排器调用一次。

**模式 3 —— 显式命名的启动位置。** 有时，消费者是一个没有可观察生命周期的同步 API（例如 OpenTelemetry 的 `Sampler.shouldSample(...)`、AIDL 存根扇出、广播接收器桥接器）。观察操作必须存在于某个支持协程的位置，但它必须位于一个*显式命名的调用位置*，而不是类自身的 `init` 中。

```kotlin
// ✅ GOOD — work is named; an explicit call site owns the launch
@SingleIn(AppScope::class)
class OtelConfigurableSampler(...) : Sampler {
    @Volatile private var delegate: Sampler = ...

    suspend fun observeRate(featureFlags: FeatureFlags) {
        featureFlags.observe(OTEL_SAMPLING_RATE).collect { rate ->
            delegate = Sampler.traceIdRatioBased(rate.coerceIn(0.0, 1.0))
        }
    }

    override fun shouldSample(...) = delegate.shouldSample(...)
}

// wired explicitly at the OTel SDK init module:
applicationScope.launch { otelSampler.observeRate(featureFlags) }
```

适用场景：消费者是一个同步 API，它会在没有可观察生命周期的情况下调用*你的代码*。启动操作无法做到可逆，但仍必须在一个命名的调用位置清晰可见。

#### 判断适用哪种模式

“我能观察到消费者的生命周期吗？”

- **能，而且它们已经处于协程上下文中** → 模式 1。将订阅操作下推给它们；删除后台循环类。
- **工作是周期性的或延迟执行的** → 模式 2。调用一次挂起的入队操作。
- **不能，它们是没有可观察生命周期的同步 API** → 模式 3。使用显式启动位置，而不是 `init`。

如果看起来还有第四种答案适用——例如，“我想要一个替我启动所有内容的 `Bootable` 接口”——那只是同一种反模式外加了一层抽象。重点就是让启动操作*清晰可见*；通过接口自动发现会违背这一目的。

#### 初始化器仍然可以使用——*前提是它们只执行注册*

当 `initialize()` *注册*监听器或钩子时，`Initializer` 模式是正确的。问题出在 `initialize()` *启动*协程时。

```kotlin
// ✅ GOOD Initializer — registers a contributor, doesn't launch
class FavouritesContributorInitializer @Inject constructor(
    private val registry: ContributorRegistry,
    private val favouritesContributor: FavouritesContributor,
) : Initializer {
    override fun initialize() {
        registry.register(favouritesContributor)
    }
}
```

**`Initializer.initialize()` 不得通过 `launch` 启动协程。** 如果你的实现这样做了，它就是模式 1/2/3 的候选对象。

#### 审查诊断

- 启动时刻在哪里定义？如果答案是“DI 在哪里实例化我，就在哪里启动”，那就有问题。
- 谁能观察工作是否正在运行？如果答案是“没有人”，那就有问题。
- 谁能停止或重新启动它？如果答案是“没有人”，那就有问题。
- 读者能否通过 grep 找到启动位置？如果不能，那就有问题。

如果答案是“消费者 / 编排器 / 指定的调用点”——那就没问题。

### 6. 吞掉 `CancellationException`

如果包围 `suspend` 调用的 `catch` 子句能够匹配 `CancellationException`——无论是直接匹配，还是通过 `Exception` / `Throwable` 匹配——却没有将其重新抛出，通常就会把取消变成无声的成功。父协程会认为子协程已经结束；子协程仍在继续运行（或者其副作用仍在继续）；取消契约被破坏。

这与 §1 中保存作用域的错误具有相同的失败形态，只是从另一端来看：§1 对调用方的生命周期*隐藏了*工作；这里则对工作本身*隐藏了*取消。

```kotlin
// ❌ BAD — catches CancellationException, never rethrows
suspend fun fetch() {
    try {
        api.load()
    } catch (e: Exception) {           // matches CancellationException too
        logger.warn("load failed", e)
    }
}

// ❌ ALSO BAD — runCatching has the same problem
suspend fun fetch() {
    runCatching { api.load() }
        .onFailure { logger.warn("load failed", it) }
}
```

可接受的写法：

```kotlin
// ✅ Separate catch first
try { api.load() }
catch (e: CancellationException) { throw e }
catch (e: Exception) { logger.warn("load failed", e) }

// ✅ Conditional rethrow inside the broad catch
try { api.load() }
catch (e: Exception) {
    if (e is CancellationException) throw e
    logger.warn("load failed", e)
}

// ✅ ensureActive() — good when the catch handles ordinary failures and you only need
// to rethrow if the current coroutine is cancelled
try { api.load() }
catch (e: Exception) {
    currentCoroutineContext().ensureActive()
    logger.warn("load failed", e)
}

// ✅ runCatching with explicit guard
runCatching { api.load() }
    .onFailure {
        if (it is CancellationException) throw it
        logger.warn("load failed", it)
    }

// ✅ runCatching terminated with getOrThrow (cancellation flows back out)
runCatching { api.load() }.getOrThrow()
```

触发条件是“`try` 内部存在 suspend 调用”，而不是“外围函数被声明为 `suspend`”。这适用于任何挂起主体内部——`suspend fun`、`launch { … }` lambda、Flow 的 `collect { … }` 等。

一种常见的例外是有意设置的局部超时：捕获由你自己的 `withTimeout` 抛出的 `TimeoutCancellationException`，并将其转换为领域结果，这可能是正确的做法。应让此类捕获保持精确，并紧邻超时发生的位置。不要以此为由吞掉任意取消异常。

捕获非取消异常的子类型（`IOException`、你自己的异常类型）没有问题——它们并不继承 `CancellationException`。

### 7. `runBlocking`

`runBlocking` 会阻塞当前线程，直到 lambda 执行完毕。在支持挂起或受生命周期约束的应用程序路径中，这种做法是错误的：原本应该异步执行的线程现在被阻塞，结构化并发遭到破坏，而且任何上游取消都不会产生作用。这是“被调用方替调用方做出结构性决策”这一反模式最直接的体现。

```kotlin
// ❌ BAD — bridging to suspend by blocking the calling thread
fun saveUser(user: User) {
    runBlocking { repository.save(user) }
}
```

根据上下文，有三种修复方式：

**支持挂起的应用程序代码** — 将函数改为 `suspend`：

```kotlin
// ✅ GOOD
suspend fun saveUser(user: User) = repository.save(user)
```

如果直接调用方也无法挂起（非挂起的 UI 回调、`BroadcastReceiver` 钩子），请在边界处使用现有的生命周期绑定作用域——参见 §3 中 UI ↔ 状态持有者的例外情况。应当在边界处修复，而不是在 `saveUser` 内部修复。

确实存在合理的阻塞边界：CLI 工具中的 `main`、必须同步返回的 Java 互操作 API、没有挂起替代方案的框架回调，以及迁移适配层。将 `runBlocking` 保留在这一最外层边界，使其主体保持精简，并立即调用挂起代码。

**测试** — 使用 `runTest`：

```kotlin
// ❌ BAD — real time, slow tests, no virtual delay
@Test fun loadsUser() = runBlocking {
    assertThat(repository.load().name).isEqualTo("Alice")
}

// ✅ GOOD
@Test fun loadsUser() = runTest {
    assertThat(repository.load().name).isEqualTo("Alice")
}
```

`runTest` 提供虚拟时间（`delay()` 会立即返回）、`TestDispatcher` 集成以及正确的协程清理。在测试中使用基于真实时间的 `runBlocking` 会使测试变慢且不稳定。

**`ContentProvider` 例外情况** — Android 的 `ContentProvider` 方法（`query`、`insert`、`update`、`delete`、`onCreate`、`call`）从进程外部看是同步的。无法将它们改为挂起。在 `ContentProvider` 子类（直接或间接子类——不包括伴生对象）的*成员函数*内部，`runBlocking` 是不可避免的桥接方式。使其主体尽可能简短，并立即调用挂起代码：

```kotlin
// ✅ Acceptable in ContentProvider members only
class MyProvider : ContentProvider() {
    override fun query(...): Cursor? = runBlocking { dao.query(...) }
}
```

此例外情况*仅*适用于 `android.content.ContentProvider` 的子类。“它类似于 `ContentProvider`”并不适用，而且 `ContentProvider` 伴生对象中的 `runBlocking` 仍然属于常规违规——该辅助函数并不是框架同步接口的一部分。

## 快速参考

| 症状 | 反模式 | 修复方式 |
|---|---|---|
| 类具有 `private val scope: CoroutineScope` | 在被调用方中存储作用域 | 移除。将公共 API 改为 `suspend`。 |
| `init { scope.launch { ... } }` | 构造期间启动 | 移至 `suspend fun init()` / `login()` |
| 仓库、管理器或用例中存在 `fun foo() { scope.launch { ... } }` | 从非 UI 类中发起即发即弃操作 | 改为 `suspend fun foo()`，让 UI 状态持有者选择作用域 |
| 状态持有者中存在由 UI 调用的 `fun onClick() { viewModelScope.launch { ... } }` | UI ↔ 状态持有者边界——没问题 | 保持原样（参见 §3 的例外情况） |
| `private val scope = MainScope()` | 内部构造并存储的作用域 | 同上——移除，并将 API 改为 `suspend` |
| `@SingleIn(AppScope) class X(scope) { init { scope.launch { … } } }` | 受 DI 约束的不透明启动（§5） | 暴露 `suspend fun run()`，从启动编排器中启动 |
| `class Y : Initializer { override fun initialize() { scope.launch { … } } }` | 执行启动而非注册的初始化器（§5） | 同上——使用 `suspend fun run()`，由编排器管理生命周期 |
| `try { suspendCall() } catch (e: Exception\|Throwable\|CancellationException) { … }` 且未重新抛出 | 吞掉取消异常（§6） | 优先使用 `catch (e: CancellationException) { throw e }`；仅在符合意图时使用 `ensureActive()` |
| `runCatching { suspendCall() }.onFailure { … }` 且没有取消保护 | 与上方相同的形式（§6） | 添加 `if (it is CancellationException) throw it`，或以 `.getOrThrow()` 结束 |
| 在支持挂起的应用程序代码中使用 `runBlocking { … }` | 阻塞线程的桥接方式（§7） | 将调用方改为 `suspend`；或在边界处使用生命周期作用域 |
| 在测试中使用 `runBlocking { … }` | 同上——基于真实时间的桥接（§7） | 使用 `runTest { … }` |
| 在 `ContentProvider.query`/`insert`/… 成员内部使用 `runBlocking { … }` | 例外情况（§7） | 可以接受；使主体保持精简 |

## 重构指南

移除现有的违规实现：

1. **从叶子节点开始。** 选择距离任何 UI 最远的类——通常是仓库或数据源。它的公共接口应该最容易转换。
2. **将公共函数逐个转换为 `suspend` 函数。** 编译器会找出每一个调用方。
3. **在每个调用方中，有意识地选择作用域：** `viewModelScope`、`lifecycleScope`、`coroutineScope { }` 或显式 job。这正是之前缺失的选择。
4. **当不再有任何地方使用 `CoroutineScope` 构造函数参数时，将其删除。** 同时移除对应的注入绑定。

不要试图在一个 MR 中修复所有类。移除反模式是一项渐进式工作。

## 不适用的情况

- **负责接收 UI 事件的 UI 状态持有者。** 使用 `fun onClick(...) { viewModelScope.launch { ... } }` 的 ViewModel/Component/功能模型是正确的——这是框架所需要的边界。参见 §3 中的例外情况。
- **具有明确取消和错误策略的生命周期所有者。** Actor/服务、应用基础设施或应用级单例可以拥有作用域，前提是它们公开了清晰的 `close`/`cancel`/重启行为，或者以其他方式直接映射到应用生命周期。应显式注入 `Application.applicationScope`，而不是临时创建一个。**这并不意味着可以从 `init` / `initialize()` 启动协程**——参见 §5。
- **已经采用挂起形式的 API** 不需要进行任何此类改造。
- **测试** 有时会将 `TestScope` 用作刻意设计的环境作用域——这是另一种模式，具有显式的虚拟时间控制。

## 审查时的危险信号

出现以下想法，意味着该反模式又回来了：

| 想法 | 事实 |
|---|---|
| “我只要给作用域添加一个 `CoroutineExceptionHandler` 就行了” | 问题不在于错误处理。问题在于这个作用域根本不应该存在。 |
| “我需要从 `init` 启动协程，这样消费者到来时数据就准备好了” | 消费者读取尚未就绪的状态本身就是缺陷。请使用分阶段处理。 |
| “调用方不想处理 `suspend`” | 那么调用方可以在自己的作用域中选择触发后不等待。不要替他们做决定。 |
| “这只是一个很小的触发后不等待调用” | 静默取消会让每一次触发后不等待都可能变成静默失败。 |
| “我们已经捕获并记录了异常，所以没问题” | `catch` 是否重新抛出了 `CancellationException`？如果没有，协程就会在不知不觉中解除取消状态。（§6） |
| “这只是一个 `runBlocking`，而且位于非关键路径中” | 每个 `runBlocking` 都是在断言调用方没有异步选项。如果调用方有异步选项，那它就是错误的原语。（§7） |
| “使用 `runBlocking` 的测试更简单” | 它们按真实时间运行，无法快进 `delay`，并且会失去 `TestDispatcher` 的语义。请使用 `runTest`。（§7） |

## 相关内容

- [`kotlin-flow-state-event-modeling`](../kotlin-flow-state-event-modeling/SKILL.md) — `StateFlow`、`SharedFlow`、`Channel`、`stateIn`、一次性事件及相关建模。