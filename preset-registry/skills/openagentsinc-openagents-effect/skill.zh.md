---
name: effect
description: |
  Opinionated guide for building production TypeScript applications with Effect v4. Use when implementing Effect workflows, services, layers, schemas, configuration, schedules, caches, streams, HTTP clients, or tests.
license: MIT
compatibility: Requires Effect v4. Examples are reviewed against the version documented in this repository.
---
# Effect

使用当前的 Effect v4 API 以及本技能中的生产环境默认设置。除非任务明确要求更改既有项目约定，否则仍应优先遵循这些约定。

## 来源规则

在猜测之前，请先检查：

- 最近的 `AGENTS.md` 以及项目本地的任何 Effect 实践文档
- 项目锁定的 `effect` 包源码和版本
- 当已安装的软件包无法解答问题时，查看当前上游 Effect 源码

## 分支选择器

仅阅读与任务匹配的分支参考文档。

- 数据模型、schema、品牌类型、变体、可选键或解码器：阅读 `references/SCHEMA.md`。
- 服务、模块接口、layer、运行时装配、错误、`Effect.fn` 或测试服务：阅读 `references/SERVICES_LAYERS.md`。
- 运行时配置、环境变量、`ConfigProvider` 或 `layerConfig`：阅读 `references/CONFIG.md`。
- 重试、重复、轮询、退避、抖动、感知速率限制的策略或 pass 循环：阅读 `references/SCHEDULING.md`。
- 记忆化、按键 TTL 缓存、并发查询去重或请求批处理：阅读 `references/CACHING.md`。
- 流、事件源、异步可迭代对象、队列/pubsub、分页、背压或流消费者：阅读 `references/STREAMS.md`。
- 出站 HTTP 调用、Effect HttpClient、状态处理或 HTTP 速率限制：阅读 `references/HTTP_CLIENTS.md`。
- Effect 测试、时间、休眠、并发同步或伪实现：阅读 `references/TESTING.md`。

如果任务横跨多个分支，请在编辑前阅读所有匹配的文件。

## 核心默认设置

- 使用 `Effect.gen(function* () { ... })` 组合工作流。
- 使用 `Effect.fn("Domain.operation")` 定义公开服务方法和非简单的内部服务方法。
- 仅对明确不需要栈帧/span 元数据的内部辅助函数使用 `Effect.fnUntraced`。
- 当代码库尚未统一采用其他当前服务标签风格时，应用服务优先使用 `Context.Service`。
- 使用 `Layer.effect(Service, Effect.gen(...))` 构建真实服务实现，并返回 `Service.of({ ... })`。
- 使用 `Schema.Struct(...)` 加同名 `interface` 对记录建模。
- 使用 `Schema.TaggedErrorClass` 对类型化 Effect 错误建模。
- 通过 `Config` 读取运行时配置，不要在应用逻辑中直接访问 `process.env`。
- 使用 `Schedule` 实现重试、重复、轮询、节奏控制和退避策略。
- 对于随时间发出多个值，并且需要拉取、背压、中断或转换的带 Effect 数据源，使用 `Stream`。
- 在 Effect 应用程序中进行出站 HTTP 调用时，如果 Effect HTTP 客户端模块提供的类型化错误、layer 和客户端转换有用，则优先使用这些模块。
- 相比休眠，优先使用感知 Effect 的测试、显式 layer 和确定性同步。
- 在不可信边界处优先使用解码器和 `schema.makeEffect(...)`。仅在可信构造中使用会抛出异常的 `schema.make(...)`，并且绝不要使用类型断言跳过验证。

## 快速选择指南

- 普通对象记录：`Schema.Struct(...)` 加同名 `interface`。
- 标量 ID/值对象：受约束的品牌 schema。
- 内部工作流决策或状态：`Data.TaggedEnum<...>` 加 `Data.taggedEnum<...>()` 构造函数和穷尽式 `$match`。
- 可复用的跨边界带标签变体：`Schema.TaggedStruct(...)` 加同名 `interface`。
- 跨边界带标签联合：使用带有 `.cases`、`.guards` 和 `.match` 的 `Schema.TaggedUnion(...)`。
- 外部/自定义判别字段（例如 `type`）：`Schema.Struct({ type: Schema.tag("variant"), ... })`，并在需要联合辅助功能时加上 `Schema.toTaggedUnion("type")`。
- 预期的类型化失败：`Schema.TaggedErrorClass`。
- 未知的边界载荷：`Schema.decodeUnknownEffect(...)`。
- 服务边界：`Context.Service<Service, Interface>()(...)` 加 `Layer.effect(...)` 加 `Service.of(...)`。
- 公开或非简单的内部服务方法：`Effect.fn("Domain.operation")`。
- 运行时配置：在 layer 中读取 `Config` 配方。在测试中使用 `ConfigProvider` 覆盖。
- 事件源：使用 `Stream.runForEach(...)` 消费 `Stream`，并在所属 layer 中使用 `Effect.forkScoped` 将其 fork。
- 队列支持的事件源：生产者边界使用 `Queue`，消费者使用 `Stream.fromQueue(...)`。
- 广播事件源：使用 `PubSub` / `Stream.fromPubSub(...)`，或对最新值状态使用 `SubscriptionRef`。
- 轮询工作进程：`runPass().pipe(Effect.repeat(Schedule.spaced(...)))`，在重复之前处理类型化的 pass 失败。
- 重试瞬态操作：使用带有有界 `Schedule` 的 `Effect.retry(...)` / `Effect.retryOrElse(...)`。
- 具有 TTL 和并发查询去重的按键查询缓存：当其生命周期和淘汰模型适用时，优先使用 `Cache.make(...)` / 感知 exit 的 `Cache.makeWith(...)`。
- 记忆化单个 Effect 结果：`Effect.cached(...)` / `Effect.cachedWithTTL(...)`。
- 将 N 个键批量合并为一次后端调用（仅当存在真实的批处理端点时）：`Effect.request(...)` + `RequestResolver`。
- Effect 应用程序中的 HTTP 请求：优先使用 Effect `HttpClient` 加请求/响应 schema 解码。
- HTTP 瞬态重试：`HttpClient.retryTransient(...)`。
- 时间敏感测试：使用 `TestClock`，而不是真实休眠。
- 并发/后台测试同步：使用 `Deferred`、`Queue`、`Latch`、`Ref` 或显式测试钩子。

## 边界规则

- 保持 HTTP 处理器精简：解码输入、读取上下文、调用服务，并将类型化错误映射为传输层响应。
- 将业务规则放在服务或领域函数中，而不是传输层处理器中。
- 在适配器边界处，将 HTTP 客户端、SDK、CLI 和外部集成封装为具名 Effect。
- 当持久化行中的值并非天然可信时，使用 Schema 或 SQL 专用辅助工具进行解码。
- 将提供方/网络调用置于权威数据库事务之外。
- 仅当当前边界能够给出真实有效的响应时，才捕获错误或重试。
- 仅当操作已被证明具有幂等性时才重试。
- 除非该边界具有真正的回退方案，否则应让重试耗尽后的失败保持可见。

## 禁止事项

- 不要使用 `as any`、非空断言或未经检查的类型转换来掩盖 Effect 类型问题。
- 不要将 `Schema.Class` 或 `Schema.TaggedClass` 作为默认的应用数据建模模式引入。
- 当 `Schema.TaggedErrorClass` 适用时，不要手动编写 `_tag` 错误类。
- 当类型化错误恢复已足够时，不要使用原因级恢复。
- 不要将 `Layer.mergeAll(...)` 或 `provideMerge(...)` 用作盲目地让代码通过编译的工具。
- 不要通过 `Context.Reference` 默认值隐藏必需的应用权限、凭据、持久化能力、传输机制或外部服务。
- 当存在确定性的同步原语时，不要在测试中添加任意的 `Effect.sleep(...)`。
- 当 `effect/Cache` 适用时，不要手动编写 Map/TTL/清理缓存或进行中的请求去重逻辑。