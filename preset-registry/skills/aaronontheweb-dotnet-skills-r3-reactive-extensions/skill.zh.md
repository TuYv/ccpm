---
name: r3-reactive-extensions
description: Build reactive/event-driven C# with R3 (Cysharp's modern reimplementation of Reactive Extensions). Covers the Observable<T>/Observer<T> model, the OnErrorResume error contract, async dispatch with AwaitOperation, Task/IAsyncEnumerable integration, TimeProvider/FrameProvider scheduling, the concurrency contract, and how R3 differs from System.Reactive (Rx.NET).
invocable: false
---
# R3：面向 .NET 的现代响应式扩展

R3 是 [Cysharp](https://github.com/Cysharp/R3) 对响应式扩展从头开始的重新实现——“dotnet/reactive 和 UniRx 的全新未来”。它保留了基于事件的 LINQ 编程模型，但重新构建了核心类型、错误契约和调度器，以解决 `System.Reactive`（Rx.NET）中长期存在的问题。在 C# 中组合事件流、UI 输入、计时器或基于推送的管道时，请使用此技能。

**权威来源**（在代码和文档中链接至这些来源）：
- 仓库：https://github.com/Cysharp/R3
- README（完整的操作符参考）：https://github.com/Cysharp/R3/blob/main/README.md
- 作者的设计原理说明：https://neuecc.medium.com/r3-a-new-modern-reimplementation-of-reactive-extensions-for-c-cf29abcc5826

## 何时使用此技能

在以下情况中使用此技能：
- 组合随时间发生的**事件**——UI 输入、传感器/数据源更新、websocket 消息、领域事件
- 你需要 debounce、throttle、merge、combine-latest、distinct-until-changed 等操作符
- 使用 `ReactiveProperty` / `BindableReactiveProperty` 构建 **MVVM** 状态
- 在基于推送的流与 `Task` / `async` 和 `IAsyncEnumerable` 之间建立桥接
- 从 `System.Reactive`、UniRx 或 `IObservable<T>` 代码迁移
- 你遇到了 Rx 的痛点：订阅因异常而终止、调度器开销或难以排查泄漏

**不适合使用此工具的场景：**请求/响应式 I/O（使用 `async/await`）、具有**背压**的有界生产者/消费者模式（使用 `System.Threading.Channels`），或具有批处理/背压的服务端流处理（使用 Akka.NET Streams）。与所有 Rx 实现一样，R3 **基于推送且没有背压**。有关如何在这些方案之间进行选择，请参阅 `csharp-concurrency-patterns` 技能。

## 参考文件

- [rx-net-differences.md](rx-net-differences.md)：与 System.Reactive（Rx.NET）相比的所有重要差异——新的核心类型、错误模型、操作符重命名、移除的 API、调度器替换，以及迁移检查清单。
- [async-and-integration-patterns.md](async-and-integration-patterns.md)：常见模式——使用 `AwaitOperation` 进行异步分发、`Task` 集成、`IAsyncEnumerable` 往返转换、`ReactiveProperty`/MVVM、subject，以及订阅生命周期。
- [scheduling-and-concurrency.md](scheduling-and-concurrency.md)：R3 如何处理**并发更新**（线程契约、`Synchronize`、`ObserveOn`）、`TimeProvider` 与 `FrameProvider` 的对比、各自在何时必不可少，以及如何使用伪 provider 进行确定性测试。

> 此技能中的所有内容均已针对 **R3 1.3.1** 进行实证验证。捕获的输出
> 会作为证据出现在参考文件中。

---

## R3 为何存在（“为什么使用它”）

作者（[neuecc](https://neuecc.medium.com/r3-a-new-modern-reimplementation-of-reactive-extensions-for-c-cf29abcc5826)）
构建 R3 是为了解决 `System.Reactive` 中的具体缺陷：

1. **异常会悄无声息地终止订阅。** 在 Rx 中，管道内的一个异常就会调用
   `OnError` 并且*永久取消订阅*——对于长期存在的事件流而言，这是一个“价值十亿美元的错误”
   （单个有问题的 UI 事件就会导致整个订阅中断）。R3 会将错误路由到
   `OnErrorResume`，并且**默认保持订阅存活**。
2. **`IScheduler` 既笨重又令人困惑。** 经测量发现，`ImmediateScheduler`/`Merge`
   会导致实际的服务器内存/CPU 膨胀。R3 移除了 `IScheduler`，改用 .NET 8 的 `TimeProvider`
   （墙上时钟）以及新的 `FrameProvider`（帧时钟）。
3. **订阅泄漏很难查找。** R3 将每个 `Observable<T>` 都设计为抽象类，使所有订阅
   都汇集到同一个位置，从而让 `ObservableTracker` 能够列出每个仍然存活的订阅及其堆栈跟踪。
4. **Rx 与 async 的融合方式很别扭。** R3 将 Rx 视为**事件优先**，并添加显式
   桥接机制（`AwaitOperation`、`FromAsync`、`ToAsyncEnumerable`），而不是假装事件
   是基于拉取的序列。
5. **一个库，适用于所有 UI。** 一个平台中立的核心，加上面向 Unity、
   Godot、WPF、WinForms、Avalonia、WinUI3、MAUI、Stride、MonoGame 和 Blazor 的轻量 provider 包。

---

## 安装

```bash
dotnet add package R3
# Platform glue (pick what applies): R3.WPF, R3.Avalonia, R3.WinForms, R3.Unity (UPM),
# R3.Godot, ObservableCollections.R3, etc. See the repo README for the full list.
```

```csharp
using R3;
```

---

## 心智模型

R3 使用**抽象类**取代了 Rx 的**接口**，并将 Rx 的双方法错误契约替换为携带结果的单一完成通知。

```csharp
public abstract class Observable<T>
{
    public IDisposable Subscribe(Observer<T> observer);     // tracked centrally
    protected abstract IDisposable SubscribeCore(Observer<T> observer);
}

public abstract class Observer<T> : IDisposable               // the observer IS the subscription
{
    public void OnNext(T value);
    public void OnErrorResume(Exception error);               // error WITHOUT unsubscribing
    public void OnCompleted(Result result);                   // success OR failure terminates
}
```

其语法为 `(OnNext | OnErrorResume)* OnCompleted(Result)?`。请注意它与 Rx 的 `OnNext* (OnError | OnCompleted)?` 之间的区别：**错误与终止相互解耦**。错误仅仅是一条通知；只有 `OnCompleted` 会结束流，并且它会携带一个 `Result`，其值为 `Result.Success` 或 `Result.Failure(exception)`。

### 快速开始

```csharp
using R3;

var subscription = Observable
    .EveryValueChanged(model, m => m.SearchText)   // emits when the property changes
    .Debounce(TimeSpan.FromMilliseconds(300))      // Rx called this "Throttle" (see differences)
    .DistinctUntilChanged()
    .SubscribeAwait(async (text, ct) =>
    {
        var results = await _api.SearchAsync(text, ct);
        Render(results);
    }, AwaitOperation.Switch);                      // cancel the in-flight search on a new keystroke

// Dispose to unsubscribe; or route into a DisposableBag / AddTo(token).
subscription.Dispose();
```

---

## 已验证的核心行为

### 默认情况下，错误不会终止序列

```csharp
var subject = new Subject<int>();
subject.Select(x => 100 / x).Subscribe(
    onNext:        x => Console.WriteLine($"next {x}"),
    onErrorResume: e => Console.WriteLine($"errorResume {e.GetType().Name}"),
    onCompleted:   (Result r) => Console.WriteLine($"completed IsSuccess={r.IsSuccess}"));

subject.OnNext(2);   // next 50
subject.OnNext(0);   // errorResume DivideByZeroException   <-- NOT terminated
subject.OnNext(5);   // next 20                             <-- subscription is still alive!
subject.OnCompleted(); // completed IsSuccess=True
```

这是相较于 Rx 最大的一项行为变更。若要恢复经典的“错误会终止序列”行为，请插入 `.OnErrorResumeAsFailure()`——随后错误将流向 `OnCompleted(Result.Failure(e))`，且下游的 `OnNext` 将停止。可使用 `Catch` 进行恢复。完整的运行记录以及（刻意缺失的）`Retry` 机制说明，请参阅 [rx-net-differences.md](rx-net-differences.md)。

### 异步分派是显式的

R3 的异步操作符（`SubscribeAwait`、`SelectAwait`、`WhereAwait`、……）接受一个 `AwaitOperation`，用于决定当值到达的速度快于异步工作完成的速度时应如何处理：

| `AwaitOperation` | 重叠行为 | 典型用途 |
|------------------|------------------|-------------|
| `Sequential`（默认） | 将值排队，逐个运行 | 有序处理 |
| `Drop` | 当一个操作正在运行时忽略新值 | 防抖提交 / 冷却 |
| `Switch` | 取消正在运行的操作，启动新操作 | 输入即搜索、以最新结果为准 |
| `Parallel` | 全部并发运行 | 独立扇出 |
| `SequentialParallel` | 并发运行，按顺序发出结果 | 并行映射、有序输出 |
| `ThrottleFirstLast` | 运行突发序列中的第一个和最后一个 | 前沿/后沿采样 |

经验证，这些操作的行为与上述描述完全一致（包括 `Switch` 会取消被取代操作的
`CancellationToken`）。请参阅 [async-and-integration-patterns.md](async-and-integration-patterns.md)。

### Task 和 IAsyncEnumerable 桥接

```csharp
// Task -> Observable
await Observable.FromAsync(async ct => await LoadAsync(ct)).FirstAsync();

// Observable -> Task (terminal operators return Task<T>)
List<int> all = await source.ToListAsync();
int last      = await source.LastAsync();

// IAsyncEnumerable -> Observable, and back
await asyncEnumerable.ToObservable().ForEachAsync(Handle);
await foreach (var x in source.ToAsyncEnumerable()) { /* ... */ }
```

均已验证可正常工作。详细信息和完整的终结操作符列表请参阅
[async-and-integration-patterns.md](async-and-integration-patterns.md)。

---

## R3 如何处理并发更新

**R3 不会对并发生产者进行串行化。** 与 Rx 一样，它遵循 Rx 语法约定：不得从多个线程
并发或重入调用 `OnNext`。操作符（`Where`、`Select`、`Subject` 等）**内部未加锁**。
如果多个线程同时向有状态的下游推送 `OnNext`，**会破坏状态**——在测试中，向一个
`List<T>` 订阅者并发调用 `OnNext` 20,000 次，会丢失约一半的元素，并在操作符链内部抛出异常。

解决方法是显式定义边界：

```csharp
// Multiple producer threads -> one serialized consumer
subject.Synchronize()                  // lock-based gate; delivery becomes single-threaded
       .Where(x => x.IsValid)
       .Subscribe(Handle);             // verified: 10000/10000 items, no corruption

// Or marshal onto a context/threadpool, which also serializes delivery:
source.ObserveOnThreadPool().Subscribe(Handle);

// For shared MVVM state written from many threads:
var counter = new SynchronizedReactiveProperty<int>(0);   // thread-safe writes
```

**实用规则：**如果可能有多个线程向一个流发布数据，请紧接在数据源之后使用 `Synchronize()`（或某个
`ObserveOn*`），或者使用 `SynchronizedReactiveProperty`。完整的竞态复现过程和输出请参阅
[scheduling-and-concurrency.md](scheduling-and-concurrency.md)。

---

## 时间与帧：TimeProvider 和 FrameProvider

R3 对“何时”有**两种**定义，并且二者都是可以在测试中伪造的抽象：

- **`TimeProvider`**（.NET 8 BCL 类型）= 挂钟时间。由 `Delay`、`Debounce`、
  `Interval`、`Timer`、`Timeout` 使用。这是服务器/业务代码使用的时间概念。
- **`FrameProvider`**（R3 特有）= *帧时钟*。由 `EveryUpdate`、`DelayFrame(n)`、
  `IntervalFrame(n)` 等使用。

**何时需要 FrameProvider？** 当“进度”以渲染/更新 tick 而非经过时间来衡量时：
- **游戏引擎**（Unity、Godot、Stride、MonoGame）——逻辑 tick 跟随引擎的更新循环，
  因而能够遵循暂停和时间缩放，并与渲染保持同步。
- **UI 渲染循环**（WPF/Avalonia/WinUI 合成帧）——逐帧响应。
- **确定性测试**——`FakeFrameProvider.Advance(n)` 无需经过任何真实时间即可推进帧，
  正如 `FakeTimeProvider.Advance(timeSpan)` 推进时钟一样。

普通的服务器/业务代码几乎从不需要 `FrameProvider`——那属于 `TimeProvider`
的适用范围。两种 fake 都能让依赖时间的管道完全具有确定性；示例请参阅
[scheduling-and-concurrency.md](scheduling-and-concurrency.md)。

---

## 最佳实践摘要

### 应该做
- 将 `OnErrorResume` 作为默认方式：将流设计为能够承受个别错误事件。
- 当你确实希望错误终止流时，添加 `.OnErrorResumeAsFailure()`。
- 为每个异步操作符有意识地选择一种 `AwaitOperation`（最新结果优先时使用 `Switch`，
  保持顺序时使用 `Sequential`，实现冷却时使用 `Drop`）。
- 在任何由多个线程向其发布数据的源之后添加 `Synchronize()` / `ObserveOn*`。
- 向时间操作符传入 `TimeProvider`，向帧操作符传入 `FrameProvider`，以便测试能够
  使用 `FakeTimeProvider` / `FakeFrameProvider`。
- 管理生命周期：将订阅放入 `DisposableBag`、`CompositeDisposable`，或使用
  `.AddTo(cancellationToken)`；在开发环境中启用 `ObservableTracker` 以发现泄漏。
- 使用 `ReactiveProperty` 表示已去重的可观察状态；使用 `BindableReactiveProperty`
  表示与 XAML 绑定的状态。

### 不应该做
- 不要假定异常会终止流（那是 Rx 的行为，不是 R3）。
- 不要使用那些已被 R3 重命名的 Rx 名称：应使用 `Debounce`（而非 `Throttle`）、`ThrottleLast`
  （而非 `Sample`）、`Chunk`（而非 `Buffer`）。`Retry`、`GroupBy`、`Finally` 和普通的 `Buffer`
  在 1.3.1 中**不存在**——请参阅差异文件了解替代方案。
- 不要在缺少 `Synchronize()` 的情况下，从多个线程并发/重入地调用 `OnNext`。
- 不要将 R3 用于需要背压的吞吐管道——请使用 Channels 或 Akka.NET Streams。
- 不要阻塞等待终止操作符（`.Result`/`.Wait()`）；它们返回 `Task<T>`——请使用 `await`。

---

## 其他资源

- **R3 仓库：** https://github.com/Cysharp/R3
- **完整 README / 操作符参考：** https://github.com/Cysharp/R3/blob/main/README.md
- **设计原理（neuecc）：** https://neuecc.medium.com/r3-a-new-modern-reimplementation-of-reactive-extensions-for-c-cf29abcc5826
- **NuGet：** https://www.nuget.org/packages/R3
- **`TimeProvider`（BCL）：** https://learn.microsoft.com/en-us/dotnet/api/system.timeprovider
- **`FakeTimeProvider`：** https://www.nuget.org/packages/Microsoft.Extensions.TimeProvider.Testing
- **相关 skill：** `csharp-concurrency-patterns`（在 R3、async/await、Channels 与 Akka.NET 之间进行选择）