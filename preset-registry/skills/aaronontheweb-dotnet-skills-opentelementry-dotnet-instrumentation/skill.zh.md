---
name: opentelemetry-net-instrumentation
description: Provides guidance for implementing OpenTelemetry instrumentation in .NET codebases, covering tracing (Activities/Spans), metrics, logs, naming conventions, error handling, performance, SDK setup, resources, context propagation, and API design best practices.
version: 2.0.0
tags:
  - opentelemetry
  - dotnet
  - observability
  - tracing
  - metrics
  - logs
  - performance
---
# OpenTelemetry .NET 插桩技能

## 何时使用

- 为 .NET 代码添加 OpenTelemetry 插桩（跟踪、指标、日志）
- 创建或修改 ActivitySource、Meter，或 `ILogger` 的用法
- 设置 OpenTelemetry SDK、资源、导出器或采样
- 审查遥测实现是否符合规范
- 优化插桩性能
- 设计将成为公共 API 一部分的遥测 API
- 实现跨服务边界的上下文传播

## 架构：.NET 与众不同

**关键**：.NET 的 OpenTelemetry 实现与其他平台有根本区别。.NET **在框架本身中**提供跟踪、指标和日志 API。
这意味着 **OTel 不提供独立的插桩 API**——它使用 .NET 内置 API，并充当收集/导出层。

### 三种内置 .NET API（主要——零依赖）

| 信号 | .NET 框架 API | 命名空间 |
|--------|-------------------|-----------|
| **跟踪** | `ActivitySource` / `Activity` | `System.Diagnostics` |
| **指标** | `Meter` / `Counter<T>` / `Histogram<T>` / 等 | `System.Diagnostics.Metrics` |
| **日志** | `ILogger<T>` | `Microsoft.Extensions.Logging` |

这些是库作者应当用于插桩的**主要且唯一的 API**。
它们随 .NET 运行时一起提供——**无需 NuGet 包**。

### OTel 收集/导出层（次要——仅限应用程序根部）

OTel NuGet 包是**收集和导出层**，仅在应用程序
组合根部添加（而不是在库中）：

| 包 | 用途 | 何时添加 |
|---------|---------|-------------|
| `OpenTelemetry.Extensions.Hosting` | ASP.NET Core / 通用主机的 DI 集成 | 仅限应用程序 |
| `OpenTelemetry.Exporter.Console` | 控制台导出器（开发/测试） | 仅限应用程序 |
| `OpenTelemetry.Exporter.OpenTelemetryProtocol` | OTLP 导出器（生产环境） | 仅限应用程序 |
| `OpenTelemetry.Exporter.Prometheus*` | Prometheus 指标端点 | 仅限应用程序 |
| `OpenTelemetry.Instrumentation.AspNetCore` | 自动插桩 ASP.NET Core 请求 | 仅限应用程序 |
| `OpenTelemetry.Instrumentation.Http` | 自动插桩 HttpClient 调用 | 仅限应用程序 |
| `OpenTelemetry.Instrumentation.SqlClient` | 自动插桩 SQL 调用 | 仅限应用程序 |

### 包选择指南

**在添加任何 OpenTelemetry NuGet 包之前，请先与用户讨论其中的权衡：**

> “你即将添加一个 OTel NuGet 包。这是一个需要将遥测数据
> 导出到可观测性后端（Jaeger、Prometheus、OTLP collector）的应用程序吗？
> 如果你正在编写库，很可能**不需要任何** OTel 包——只需使用
> `System.Diagnostics.ActivitySource` / `System.Diagnostics.Metrics.Meter`，并让
> 使用该库的应用程序配置导出管道。你想继续吗？”

**库作者**：**不要添加任何内容**。仅使用 `System.Diagnostics.*` 和 `ILogger`。
由使用该库的应用程序接入 SDK 和导出器。

**应用程序作者**：添加 `OpenTelemetry.Extensions.Hosting`，以及所需的导出器和插桩库。完整的设置模式请参阅 [sdk-resources-and-logs-reference.md](sdk-resources-and-logs-reference.md)。

**切勿将** `OpenTelemetry.Api` 添加到库中——`System.Diagnostics.*` 就是 API。

有关 SDK 设置、资源配置、导出器、采样和日志集成的信息，请参阅 [sdk-resources-and-logs-reference.md](sdk-resources-and-logs-reference.md)。

## 核心原则

### 弹性优先
**关键要求**：诊断/追踪/指标逻辑中的异常绝不能影响应用程序处理。
- 假定 Activity 实例可能为 null。除 Activity 扩展方法外，始终防范 null Activity 引用（使用 `activity?.ExtensionMethod()`）
- 使用适当的 null 检查保护所有插桩代码

### API 表面意识
- 发出的任何遥测数据都会成为公共 API 表面的一部分
- 变更须遵循破坏性变更准则
- 默认情况下应发出遥测数据（用户通过 OpenTelemetry 扩展选择启用收集）
- 例外：高基数指标维度可能需要显式选择启用

### 标准合规性
- 遵循 Microsoft 的[分布式追踪插桩](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-instrumentation-walkthroughs)最佳实践
- 遵循 [OpenTelemetry 语义约定](https://opentelemetry.io/docs/specs/semconv/)
- 属性值支持：**string、boolean、double (IEEE 754)、int64、byte arrays，以及由这些基本类型构成的 homogeneous arrays**。根据 [OTel AnyValue 规范](https://opentelemetry.io/docs/specs/otel/common/#anyvalue)，null/空值是有效且有意义的——必须存储它们并将其传递给导出器。
- 属性**键**必须是非 null、非空字符串

## 追踪 / Span（Activity）

### ActivitySource 设置

```csharp
// ✅ CORRECT: Use ActivitySource, not DiagnosticSource
public class MyFeature
{
    // Primary ActivitySource - name typically matches the component or NuGet package name
    private static readonly ActivitySource ActivitySource = new("MyApp.MyComponent", "1.0.0");

    // Specialized ActivitySource for opt-in scenarios
    private static readonly ActivitySource DetailedActivitySource = new("MyApp.MyComponent.Detailed", "1.0.0");
}
```

**规则**：
- 每个组件都要为常规 Activity 定义一个主要的 `ActivitySource`
- 名称通常与组件或 NuGet 包相匹配（例如 `"MyCompany.MyLibrary"`）
- 使用 SemVer 为 ActivitySource 设置版本
- 为专用或选择启用的场景创建单独的 `ActivitySource`。使用分层的源名称，例如 `MyCompany.MyLibrary` 和 `MyCompany.MyLibrary.Detailed`，以便使用方应用程序可以通过 `AddSource(...)` 仅订阅所需的源，并且后端可以按插桩范围进行筛选。

### 创建 Activity

```csharp
// ✅ Check HasListeners, null-check, then guard expensive work behind IsAllDataRequested
if (ActivitySource.HasListeners())
{
    using var activity = ActivitySource.StartActivity("ProcessItem", ActivityKind.Internal);
    if (activity != null && activity.IsAllDataRequested)
    {
        activity.DisplayName = "Processing order #12345";
        activity.SetTag("app.item_id", itemId);
        activity.SetTag("app.item_type", itemType);
    }
}

// ❌ WRONG: Don't start activities in fire-and-forget tasks where the
// using scope ends before the async work completes (AsyncLocal context is lost)
async Task HelperAsync()
{
    using var activity = ActivitySource.StartActivity("Helper");
    _ = Task.Run(() => DoWorkAsync()); // ❌ activity disposed before task completes
}
```

**规则**：
- 创建前检查 `ActivitySource.HasListeners()`（零分配快速路径）
- 创建后始终对 Activity 进行 null 检查（监听器可能会将其过滤掉或不对其采样）
- 切勿在异步辅助方法中启动 Activity（`Activity.Current` 使用 `AsyncLocal`）
- 仅在 `activity.IsAllDataRequested` 为 true 时才执行开销较大的标签计算
- 使用 W3C TraceContext。.NET Core 3.0+ / .NET 5+ 默认使用该格式；对于较旧的 TFM 或 .NET Framework 应用，可在启动时设置 `Activity.DefaultIdFormat = ActivityIdFormat.W3C`，并使用 `Activity.ForceDefaultIdFormat = true` 覆盖分层父级格式。

### Activity 命名

```csharp
// ✅ Unique operation name, friendly display name (null-check before accessing)
using var activity = ActivitySource.StartActivity(
    name: "ProcessItem",              // Unique, identifies class of spans
    kind: ActivityKind.Internal
);
if (activity != null)
    activity.DisplayName = "Processing order #12345"; // User-friendly, can be specific

// ❌ WRONG: Don't include runtime data in operation name
using var badActivity = ActivitySource.StartActivity($"Process_{itemId}"); // ❌
```

**规则**：
- 每种 Span 类型都有唯一的 `OperationName`（用于标识在统计上值得关注的一类 Span）
- 操作名称不应包含运行时数据（只能包含编译时/配置时信息）
- 使用易于阅读的 `DisplayName` 表示具体信息
- 遵循 [OpenTelemetry Span 命名约定](https://opentelemetry.io/docs/specs/otel/trace/api/#span)

### SpanKind 选择

选择正确的 `ActivityKind`，以明确 Span 在分布式追踪中的角色：

| `ActivityKind` | OTel SpanKind | 使用场景 |
|----------------|---------------|-------------|
| `Internal` | `INTERNAL` | 默认值——不跨越远程边界的进程内操作 |
| `Server` | `SERVER` | 处理传入的请求/响应调用（HTTP 服务器、gRPC 服务器、RPC 服务器） |
| `Client` | `CLIENT` | 发起传出的请求/响应调用（HTTP 客户端、数据库客户端、RPC 调用） |
| `Producer` | `PRODUCER` | 将延迟执行的工作加入队列/发布出去（消息队列发布、事件发出、作业入队） |
| `Consumer` | `CONSUMER` | 将延迟执行的工作出队/进行处理（消息队列接收、事件处理、作业出队） |

**规则**：
- 单个 Span 不应承担多个用途
- 在将传出 Span 的 `SpanContext` 注入请求之前，先创建该 Span。如果先注入，传播的将是父级上下文，导致传出 Span 处于悬空状态（与下游调用没有连接）。
- 有关包含示例的详细 SpanKind 指南，请参阅 [traces-and-propagation-reference.md](traces-and-propagation-reference.md)

### Span 属性（标签）

```csharp
// ✅ Application code: use your own namespace
activity?.SetTag("myapp.order_id", orderId);
activity?.SetTag("myapp.payment.status", "confirmed");

// ✅ Manual infrastructure instrumentation: use semantic conventions
// activity?.SetTag("db.system.name", "postgresql"); // custom database client
// activity?.SetTag("http.request.method", "GET"); // custom HTTP transport

// Values can be strings, numbers, booleans, or homogeneous arrays
activity?.SetTag("app.item_count", 42);
activity?.SetTag("app.related_ids", new int[] { 1, 2, 3 });

// ❌ WRONG: PascalCase, hyphen delimiter, plural, or unrelated namespace
activity?.SetTag("MyApp.OrderId", orderId);     // ❌ Wrong case
activity?.SetTag("myapp.order-id", orderId);    // ❌ Wrong delimiter
```

**规则**：
- 命名空间前缀应与你的组件匹配：`myapp.*`、`myapp.db.*`
- 全部使用小写字母，以下划线（`_`）分隔，并使用单数形式
- 属性值：字符串、布尔值、双精度浮点数、int64、字节数组、同构数组（根据 [AnyValue 规范](https://opentelemetry.io/docs/specs/otel/common/#anyvalue)，可以为 null/空值）
- **业务/领域属性**：使用你自己的命名空间（`myapp.*`）。
- **手动插桩的 HTTP、数据库、消息传递或 RPC 概念**：使用[语义约定](https://opentelemetry.io/docs/specs/semconv/)。不要重复自动插桩已发出的属性。不要使用 OTel 命名空间作为自定义属性的前缀。

### Activity 状态和错误

```csharp
try
{
    await ProcessItemAsync(); // ✅ success: leave status Unset, do not call SetStatus(Ok) — see rules below
}
catch (Exception ex)
{
    if (activity != null)
    {
        activity.SetStatus(ActivityStatusCode.Error, ex.Message); // modern API
        activity.SetTag("error.type", ex.GetType().FullName);
    }
    throw;
}
```

**规则**（依据[记录错误](https://opentelemetry.io/docs/specs/semconv/general/recording-errors/)和 [Set Status API 规范](https://opentelemetry.io/docs/specs/otel/trace/api/#set-status)）：
- 成功时将 span 状态保留为 **Unset**——不要调用 `SetStatus(ActivityStatusCode.Ok)`。
- `Ok` 供应用程序代码使用，而不是插桩库。trace API 规范指出：“除非明确配置为这样做，否则插桩库不应将状态码设置为 `Ok`（……）应用程序开发者和运维人员可以将状态码设置为 `Ok`”——通常用于覆盖库报告的、但他们认定不是真正失败的 `Error`（例如抑制干扰性较强的 404）。一旦设置，`Ok` 就是最终状态；之后的调用会被忽略。”
- 失败时：**应该**设置 `ActivityStatusCode.Error`，**应该**设置 `error.type` 标签，**应该**将状态描述设置为异常消息。
- 使用 `SetStatus`——不再需要旧版的 `otel.status_code`/`otel.status_description` 标签。
- **不要**记录经过重试或处理后使操作正常完成的错误——`Error` 状态和 `error.type` 描述的是失败的操作，而不是已经恢复的操作。

### 记录异常——继续发出 Span 事件，并添加日志选择启用机制

`exceptions-spans`——即 `Activity.AddEvent(new ActivityEvent("exception", ...))` 背后的约定——已被标记为 **Deprecated**，并推荐改用 `exceptions-logs`，但 .NET 生态系统尚未跟进：没有任何 `OpenTelemetry.*` .NET 包实现规范中的 `OTEL_SEMCONV_EXCEPTION_SIGNAL_OPT_IN` 选择启用机制（已针对 `OpenTelemetry.Api` 1.17.0 验证），而且 `OpenTelemetry.Instrumentation.AspNetCore` 1.17.0 本身仍通过 `Activity.AddException` 记录异常，也就是使用 span 事件。这意味着，典型 .NET 用户当前已接入的导出器、后端和仪表板都是为读取异常 span 事件而构建的，而不是基于日志的异常。**继续将 span 事件作为默认实现**——仅仅因为底层规范文档被标记为 Deprecated 就不再使用它们，会在当前工具链中悄无声息地破坏异常可见性。应在此基础上叠加较新的日志路径，并将其作为选择启用功能，这与规范自身针对插桩从 span 事件迁移时所描述的过渡指导完全一致：

```csharp
// Mirrors the spec's OTEL_SEMCONV_EXCEPTION_SIGNAL_OPT_IN values: unset/anything else → spans only (today's default), "logs/dup" → both, "logs" → logs only.
private static readonly string? ExceptionSignalOptIn = Environment.GetEnvironmentVariable("OTEL_SEMCONV_EXCEPTION_SIGNAL_OPT_IN");
private static readonly bool EmitSpanEvents = ExceptionSignalOptIn != "logs";
private static readonly bool EmitLogs = ExceptionSignalOptIn is "logs" or "logs/dup";

try
{
    await ProcessItemAsync();
}
catch (Exception ex)
{
    activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
    activity?.SetTag("error.type", ex.GetType().FullName);

    if (EmitSpanEvents) // ✅ default — what current .NET tooling and dashboards actually consume today
    {
        activity?.AddEvent(new ActivityEvent("exception", tags: new ActivityTagsCollection
        {
            ["exception.type"] = ex.GetType().FullName,
            ["exception.message"] = ex.Message,
            ["exception.stacktrace"] = ex.ToString()
        }));
    }

    if (EmitLogs) // opt-in — the spec's forward direction; pass the exception instance while `activity` is still Activity.Current so the SDK derives trace_id/span_id and exception.type/message/stacktrace from it
    {
        logger.LogError(ex, "Item processing failed");
    }

    throw;
}
```

**规则**：
- 不要在 span 事件上设置 `exception.escaped`——它已被明确弃用：“不再建议记录已被处理且未逃逸出 span 作用域的异常。”
- 支持 `OTEL_SEMCONV_EXCEPTION_SIGNAL_OPT_IN`（`logs` / `logs/dup`），以便已准备就绪的消费者可以选择启用日志或双重发射，但默认仅使用 span——这是规范自身的过渡指导，并非可有可无的附加功能；它的存在正是为了避免任何人在尚未准备好之前被迫在两种信号之间二选一。
- 发射日志时（选择启用或双重发射），按照 `exceptions-logs` 选择严重性：对于未处理的异常（尤其是在 `SERVER`/`CONSUMER` span 上），使用 `ERROR`；对于预期由调用方处理的异常（尤其是在 `CLIENT`/`PRODUCER` span 上），使用 `WARN`；对于不表示实际问题的异常（例如客户端取消的请求），使用 `DEBUG`；只有当异常导致应用程序关闭时，才使用 `FATAL`。
- 日志调用**必须**在与其关联的 span 仍为当前 span 时发生——规范要求“由同时为同一操作记录 span 的插桩所发射的异常事件，必须与对应的 span 上下文相关联。”如果在 `using` activity 作用域结束后，从已分离的错误报告回调中记录日志，则会悄无声息地关联到错误的 span，或者完全不关联任何 span。请参阅下文的[访问 Activity](#accessing-activities)。
- 只有在稳定的主版本上维持双重发射至少六个月（规范规定的最低期限），**并且**确认你的实际消费者能够读取基于日志的异常之后，才切换为仅使用 `logs`——不要仅依据固定时间表进行切换。

完整模式请参阅 [traces-and-propagation-reference](traces-and-propagation-reference.md)，其中包括：核心中不依赖日志记录的库，如何仍能公开回调，使单独的 OTel 集成包可以在正确的 span 处于活动状态时捕获异常详细信息。

### 访问 Activity

```csharp
var current = Activity.Current; // ❌ may be a user-created ambient span
using var ownedActivity = ActivitySource.StartActivity("MyOperation"); // ✅ captured reference
ownedActivity?.SetTag("myapp.key", value);
```
**规则**：不要依赖 `Activity.Current` 获取你所拥有的 span；用户代码可以通过 `AsyncLocal` 替换它。仅在捕获的 `Activity` 仍处于活动状态时传递/存储它。存储 `ActivityContext` 以用于传播标识。

### Span 链接

链接将一个 span 与其他存在因果关系、但不属于直接父子关系的 span 连接起来——例如批处理、分散/聚合以及跨越 trace 边界。

```csharp
var links = new List<ActivityLink>
{
    new(activityContext1),
    new(activityContext2),
};

var activity = ActivitySource.StartActivity(
    ActivityKind.Internal, name: "batch-process", links: links);
```

有关完整的链接模式（包括批处理、分散/聚合和跨越 trace 边界），请参阅 [traces-and-propagation-reference.md](traces-and-propagation-reference.md)。

### 上下文传播

分布式追踪需要使用 W3C `traceparent` 标头跨进程边界（HTTP 调用、消息队列等）传播 trace 上下文。在 .NET 中，这由 `DistributedContextPropagator` 处理。OTel SDK 默认配置 W3C TraceContext 传播。

有关传播模式、自定义传播器以及针对非标准传输方式的手动注入/提取，请参阅 [traces-and-propagation-reference.md](traces-and-propagation-reference.md)。

## 指标

### Meter 和指标类设置

```csharp
public sealed class OrderProcessingMetrics : IDisposable
{
    private readonly Meter meter = new("MyApp.OrderProcessing", "1.0.0");
    private readonly Histogram<double> processingDuration =
        meter.CreateHistogram<double>("myapp.order.processing.duration", unit: "s");
    private readonly Counter<long> itemsProcessed =
        meter.CreateCounter<long>("myapp.order.processing.count", unit: "{order}");

    public void Dispose() => meter.Dispose();
}
```

**命名约定**（遵循 [OTel 语义约定](https://opentelemetry.io/docs/specs/semconv/general/metrics/)）：
- 使用单数名称和嵌套层级：`myapp.order.processing.duration`
- 定义单位（s、ms、{item}、{connection}）；避免使用技术性后缀（`_counter`、`_histogram`）
- 在采用效果得到验证之前，从 1.0.0 之前的版本开始

### Instrument 类型概览

.NET 提供 7 种指标 Instrument 类型。请为你的测量选择正确的类型：

| Instrument | .NET API | 行为 | 典型用途 |
|------------|---------|----------|-------------|
| **Counter** | `CreateCounter<T>` | 单调递增 | 请求计数、错误计数 |
| **UpDownCounter** | `CreateUpDownCounter<T>` | 增加或减少 | 队列大小、活动连接数 |
| **Histogram** | `CreateHistogram<T>` | 值的分布 | 持续时间、响应大小 |
| **Gauge** | `CreateGauge<T>`（.NET 9+） | 同步瞬时值 | 记录当前测量值 |
| **ObservableCounter** | `CreateObservableCounter<T>` | 异步回调、单调递增 | 定期轮询的总数 |
| **ObservableGauge** | `CreateObservableGauge<T>` | 异步回调、非单调 | CPU/内存使用率 |
| **ObservableUpDownCounter** | `CreateObservableUpDownCounter<T>` | 异步回调、双向变化 | 按优先级统计的活动任务数 |

完整的创建/记录示例和可观测回调模式，请参阅 [metrics-and-instruments-reference.md](metrics-and-instruments-reference.md)。

### 指标记录方法命名

```csharp
// ✅ Action/outcome-based naming, separate methods per outcome
public void OrderProcessingSucceeded(string orderType, TimeSpan duration) { /* Record */ }
public void OrderProcessingFailed(string orderType, Exception ex, TimeSpan duration) { /* Record */ }
public void ConnectionOpened() => connectionsOpen.Add(1);
public void ConnectionClosed() => connectionsOpen.Add(-1);

// ❌ WRONG: Name after metric, confusing signature
public void RecordOrderProcessingDuration(...) { } // ❌ don't name after metric
public void RecordError(bool succeeded, Exception? ex) { } // ❌ confusing signature
```

**规则**：
- 根据操作/结果命名（`OrderProcessingSucceeded`），而不是根据指标命名（`RecordXxx`）
- 为每种结果使用单独的方法（避免使用布尔标志和可选异常）
- 状态变化采用基于事件的命名：`ConnectionOpened()`、`ItemQueued()`

### 指标维度

```csharp
// ✅ Low-cardinality, predefined dimensions
processingDuration.Record(duration.TotalSeconds,
    new KeyValuePair<string, object?>("myapp.order_type", orderType),  // bounded set
    new KeyValuePair<string, object?>("outcome", "success"));         // bounded set

// ❌ High-cardinality: unbounded values cause cardinality explosion
failureCount.Add(1, new KeyValuePair<string, object?>("order_id", orderId)); // ❌ unbounded
```

**规则**：
- 维度必须是预定义且低基数的（条目类型、队列名称、结果）
- 避免无界值（每个唯一值都会产生一个新的时间序列行 → 基数爆炸）
- 高基数维度必须通过配置显式启用
- 各组件间的名称应保持一致：`myapp.region` 在任何地方都表示相同的含义
- 用户可以启用[范例](https://opentelemetry.io/docs/languages/dotnet/metrics/exemplars/)来关联跟踪（而不是通过维度）

## 性能要求

默认情况下，插桩的开销必须很低。请遵循以下规则以尽量减少开销：

### 零分配快速路径

```csharp
// ✅ CORRECT: Guard with cheap checks
if (ActivitySource.HasListeners())
{
    using var activity = ActivitySource.StartActivity("Operation");
    // ... expensive work
}

// ✅ CORRECT: Use TagList (struct) for metrics
var tags = new TagList
{
    { "myapp.order_type", orderType },
    { "outcome", "success" }
};
counter.Add(1, tags);
```

### 计时

```csharp
// ✅ Timestamp math (no allocation)
var startTime = Stopwatch.GetTimestamp();
try { await ProcessAsync(); }
finally { var duration = Stopwatch.GetElapsedTime(startTime); metrics.OrderProcessingSucceeded(orderType, duration); }

// ❌ Allocates: Stopwatch.StartNew() or IDisposable timing wrappers
```

### 避免隐式分配

```csharp
// ❌ Allocates: string interpolation without IsAllDataRequested guard
activity?.SetTag("item", $"Processing {itemId}"); // ❌

// ✅ Guard expensive work behind IsAllDataRequested
if (activity?.IsAllDataRequested == true)
    activity.SetTag("item", $"Processing {itemId}");
```

**规则**：
- 不要使用 `Stopwatch.StartNew()`（使用 `Stopwatch.GetTimestamp()`/`GetElapsedTime`）
- 优先使用 `TagList`（结构体），而不是数组/字典
- 在没有保护措施的情况下，不要在热路径中使用 LINQ、字符串插值或异步状态机

## 测试要求

### Span 测试

```csharp
[Test]
public async Task Should_create_processing_span_with_correct_parent()
{
    // Arrange
    using var parent = new Activity("Parent").Start();

    // Act
    await handler.Handle(item);

    // Assert
    var processingSpan = recordedActivities.Single(a => a.OperationName == "ProcessItem");
    Assert.AreEqual(parent.Id, processingSpan.ParentId);
    Assert.AreEqual("myapp.item_type", processingSpan.Tags.First().Key);
}

[Test]
public void Should_not_introduce_breaking_changes_to_span_names()
{
    // Ensures string values in span names are under test
    Assert.AreEqual("ProcessItem", MyFeature.SpanName);
}
```

**规则**：
- 测试各 Span Activity 连接到哪些对象
- 测试字符串值（Span 名称、标签名称），以防止破坏性变更
- 请记住：遥测是公共 API 的一部分

## 版本控制

- 遥测版本控制与包版本控制解耦
- 使用 SemVer 语义
- Trace 和 Metric 使用各自独立的版本（独立演进）
- 在其采用情况和实用性得到验证之前，先使用低于 1.0.0 的版本

```csharp
private static readonly ActivitySource ActivitySource = new("MyApp.MyComponent", "0.9.0");
private readonly Meter meter = new("MyApp.MyComponent", "0.8.0");
```

## 日志

.NET 日志通过内置的 `ILogger` API 与 OpenTelemetry 集成。OTel SDK 在日志构建器上提供 `AddOpenTelemetry()`，用于收集、处理和导出日志。日志记录会通过 `TraceId`/`SpanId` 自动与 Trace 关联。

有关完整的日志集成模式，包括关联、脱敏、结构化日志记录和严重级别过滤，请参阅 [sdk-resources-and-logs-reference.md](sdk-resources-and-logs-reference.md)。

## 参考文件

- [traces-and-propagation-reference.md](traces-and-propagation-reference.md)：通过示例深入讲解 SpanKind、Span Link（批处理、分散/聚合、Trace 边界）、上下文传播（W3C traceparent、DistributedContextPropagator、自定义传播器）、Baggage，以及完整的现代异常记录模式。
- [metrics-and-instruments-reference.md](metrics-and-instruments-reference.md)：全部 7 种 Metric Instrument 类型及其创建/记录代码和使用时机指南、可观测 Instrument 回调模式、Dimension 深入讲解、Exemplar、默认聚合方式和单位。
- [sdk-resources-and-logs-reference.md](sdk-resources-and-logs-reference.md)：SDK 初始化（ASP.NET Core + Console）、Resource 配置（ResourceBuilder、AddService、AddDetector、自定义 Detector）、Exporter（OTLP、Console、Jaeger、Zipkin、Prometheus）、Instrumentation Library、采样（内置、自定义、环境变量、基于头部/尾部的采样）、日志集成（ILogger、关联、脱敏、结构化日志记录）和环境变量配置。

## 参考资料

- [OTel 规范概述](https://opentelemetry.io/docs/specs/otel/overview/)
- [OTel 语义约定](https://opentelemetry.io/docs/specs/semconv/)
- [OTel 通用规范（AnyValue）](https://opentelemetry.io/docs/specs/otel/common/)
- [OTel 追踪 SDK 规范](https://opentelemetry.io/docs/specs/otel/trace/sdk/)
- [OTel 指标 SDK 规范](https://opentelemetry.io/docs/specs/otel/metrics/sdk/)
- [OTel 日志规范](https://opentelemetry.io/docs/specs/otel/logs/)
- [OTel 资源规范](https://opentelemetry.io/docs/specs/otel/resource/)
- [OTel 上下文规范](https://opentelemetry.io/docs/specs/otel/context/)
- [使用 OpenTelemetry 实现 .NET 可观测性（MS Learn）](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/observability-with-otel)
- [OTel .NET 手动插桩](https://opentelemetry.io/docs/languages/dotnet/instrumentation/)
- [OTel .NET 指标检测工具](https://opentelemetry.io/docs/languages/dotnet/metrics/instruments/)
- [OTel .NET 采样](https://opentelemetry.io/docs/languages/dotnet/sampling/)
- [OTel .NET 零代码插桩](https://opentelemetry.io/docs/zero-code/net/)