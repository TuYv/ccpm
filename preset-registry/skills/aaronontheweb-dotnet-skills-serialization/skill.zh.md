---
name: serialization
description: Choose the right serialization format for .NET applications. Prefer schema-based formats (Protobuf, MessagePack) over reflection-based (Newtonsoft.Json). Use System.Text.Json with AOT source generators for JSON scenarios.
invocable: false
---
# .NET 中的序列化

## 何时使用此技能

在以下情况使用此技能：
- 为 API、消息传递或持久化选择序列化格式
- 从 Newtonsoft.Json 迁移到 System.Text.Json
- 实现与 AOT 兼容的序列化
- 为分布式系统设计线路格式
- 优化序列化性能

---

## 基于模式与基于反射的对比

| 方面 | 基于模式 | 基于反射 |
|--------|--------------|------------------|
| **示例** | Protobuf、MessagePack、System.Text.Json（源代码生成） | Newtonsoft.Json、BinaryFormatter |
| **载荷中的类型信息** | 无（使用外部模式） | 有（嵌入类型名称） |
| **版本控制** | 显式字段编号/名称 | 隐式（类型结构） |
| **性能** | 快（无反射） | 较慢（运行时反射） |
| **与 AOT 兼容** | 是 | 否 |
| **线路兼容性** | 极佳 | 较差 |

**建议**：对于任何跨越进程边界的数据，都应使用基于模式的序列化。

---

## 格式建议

| 使用场景 | 推荐格式 | 原因 |
|----------|-------------------|-----|
| **REST API** | System.Text.Json（源代码生成） | 标准且与 AOT 兼容 |
| **gRPC** | Protocol Buffers | 原生格式，版本控制能力极佳 |
| **Actor 消息传递** | MessagePack 或 Protobuf | 紧凑、快速且版本安全 |
| **事件溯源** | Protobuf 或 MessagePack | 必须能够永久处理旧事件 |
| **缓存** | MessagePack | 紧凑、快速 |
| **配置** | JSON（System.Text.Json） | 人类可读 |
| **日志记录** | JSON（System.Text.Json） | 结构化且可解析 |

### 应避免的格式

| 格式 | 问题 |
|--------|---------|
| **BinaryFormatter** | 存在安全漏洞，已弃用，切勿使用 |
| **Newtonsoft.Json 默认设置** | 载荷中的类型名称会因重命名而失效 |
| **DataContractSerializer** | 复杂，版本控制能力较差 |
| **XML** | 冗长、缓慢且复杂 |

---

## 将 System.Text.Json 与源生成器配合使用

对于 JSON 序列化，请将 System.Text.Json 与源生成器配合使用，以实现 AOT 兼容性并提升性能。

### 设置

```csharp
// Define a JsonSerializerContext with all your types
[JsonSerializable(typeof(Order))]
[JsonSerializable(typeof(OrderItem))]
[JsonSerializable(typeof(Customer))]
[JsonSerializable(typeof(List<Order>))]
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
public partial class AppJsonContext : JsonSerializerContext { }
```

### 用法

```csharp
// Serialize with context
var json = JsonSerializer.Serialize(order, AppJsonContext.Default.Order);

// Deserialize with context
var order = JsonSerializer.Deserialize(json, AppJsonContext.Default.Order);

// Configure in ASP.NET Core
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonContext.Default);
});
```

### 优势

- **运行时无反射** - 所有类型信息均在编译时生成
- **与 AOT 兼容** - 可用于 Native AOT 发布
- **速度更快** - 无需运行时类型分析
- **可安全裁剪** - 链接器明确知道需要保留哪些内容

---

## Protocol Buffers (Protobuf)

最适合：Actor 系统、gRPC、事件溯源以及任何长期使用的线格式。

### 设置

```bash
dotnet add package Google.Protobuf
dotnet add package Grpc.Tools
```

### 定义 Schema

```protobuf
// orders.proto
syntax = "proto3";

message Order {
    string id = 1;
    string customer_id = 2;
    repeated OrderItem items = 3;
    int64 created_at_ticks = 4;

    // Adding new fields is always safe
    string notes = 5;  // Added in v2 - old readers ignore it
}

message OrderItem {
    string product_id = 1;
    int32 quantity = 2;
    int64 price_cents = 3;
}
```

### 版本控制规则

```protobuf
// SAFE: Add new fields with new numbers
message Order {
    string id = 1;
    string customer_id = 2;
    string shipping_address = 5;  // NEW - safe
}

// SAFE: Remove fields (old readers ignore unknown, new readers use default)
// Just stop using the field, keep the number reserved
message Order {
    string id = 1;
    // customer_id removed, but field 2 is reserved
    reserved 2;
}

// UNSAFE: Change field types
message Order {
    int32 id = 1;  // Was: string - BREAKS!
}

// UNSAFE: Reuse field numbers
message Order {
    reserved 2;
    string new_field = 2;  // Reusing 2 - BREAKS!
}
```

---

## MessagePack

最适合：高性能场景、紧凑型负载、Actor 消息传递。

### 设置

```bash
dotnet add package MessagePack
dotnet add package MessagePack.Annotations
```

### 使用契约

```csharp
[MessagePackObject]
public sealed class Order
{
    [Key(0)]
    public required string Id { get; init; }

    [Key(1)]
    public required string CustomerId { get; init; }

    [Key(2)]
    public required IReadOnlyList<OrderItem> Items { get; init; }

    [Key(3)]
    public required DateTimeOffset CreatedAt { get; init; }

    // New field - old readers skip unknown keys
    [Key(4)]
    public string? Notes { get; init; }
}

// Serialize
var bytes = MessagePackSerializer.Serialize(order);

// Deserialize
var order = MessagePackSerializer.Deserialize<Order>(bytes);
```

### AOT 兼容设置

```csharp
// Use source generator for AOT
[MessagePackObject]
public partial class Order { }  // partial enables source gen

// Configure resolver
var options = MessagePackSerializerOptions.Standard
    .WithResolver(CompositeResolver.Create(
        GeneratedResolver.Instance,  // Generated
        StandardResolver.Instance));
```

---

## 从 Newtonsoft.Json 迁移

### 常见问题

| Newtonsoft | System.Text.Json | 解决方法 |
|------------|------------------|-----|
| JSON 中的 `$type` | 默认不支持 | 使用判别器或自定义转换器 |
| `JsonProperty` | `JsonPropertyName` | 使用不同的特性 |
| `DefaultValueHandling` | `DefaultIgnoreCondition` | 使用不同的 API |
| `NullValueHandling` | `DefaultIgnoreCondition` | 使用不同的 API |
| 私有 setter | 需要 `[JsonInclude]` | 显式选择启用 |
| 多态 | `[JsonDerivedType]`（.NET 7+） | 显式判别器 |

### 迁移模式

```csharp
// Newtonsoft (reflection-based)
public class Order
{
    [JsonProperty("order_id")]
    public string Id { get; set; }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string? Notes { get; set; }
}

// System.Text.Json (source-gen compatible)
public sealed record Order(
    [property: JsonPropertyName("order_id")]
    string Id,

    string? Notes  // Null handling via JsonSerializerOptions
);

[JsonSerializable(typeof(Order))]
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.SnakeCaseLower,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
public partial class OrderJsonContext : JsonSerializerContext { }
```

### 使用鉴别器实现多态

```csharp
// .NET 7+ polymorphism
[JsonDerivedType(typeof(CreditCardPayment), "credit_card")]
[JsonDerivedType(typeof(BankTransferPayment), "bank_transfer")]
public abstract record Payment(decimal Amount);

public sealed record CreditCardPayment(decimal Amount, string Last4) : Payment(Amount);
public sealed record BankTransferPayment(decimal Amount, string AccountNumber) : Payment(Amount);

// Serializes as:
// { "$type": "credit_card", "amount": 100, "last4": "1234" }
```

---

## 线格式兼容性模式

### 宽容读取器

旧代码必须能够安全地忽略未知字段：

```csharp
// Protobuf/MessagePack: Automatic - unknown fields skipped
// System.Text.Json: Configure to allow
var options = new JsonSerializerOptions
{
    UnmappedMemberHandling = JsonUnmappedMemberHandling.Skip
};
```

### 先引入读取，再引入写入

对于新格式，先部署反序列化器，再部署序列化器：

```csharp
// Phase 1: Add deserializer (deployed everywhere)
public Order Deserialize(byte[] data, string manifest) => manifest switch
{
    "Order.V1" => DeserializeV1(data),
    "Order.V2" => DeserializeV2(data),  // NEW - can read V2
    _ => throw new NotSupportedException()
};

// Phase 2: Enable serializer (next release, after V1 deployed everywhere)
public (byte[] data, string manifest) Serialize(Order order) =>
    _useV2Format
        ? (SerializeV2(order), "Order.V2")
        : (SerializeV1(order), "Order.V1");
```

### 切勿嵌入类型名称

```csharp
// BAD: Type name in payload - renaming class breaks wire format
{
    "$type": "MyApp.Order, MyApp.Core",
    "id": "123"
}

// GOOD: Explicit discriminator - refactoring safe
{
    "type": "order",
    "id": "123"
}
```

---

## 性能比较

大致吞吐量（越高越好）：

| 格式 | 序列化 | 反序列化 | 大小 |
|--------|-----------|-------------|------|
| MessagePack | ★★★★★ | ★★★★★ | ★★★★★ |
| Protobuf | ★★★★★ | ★★★★★ | ★★★★★ |
| System.Text.Json（源生成） | ★★★★☆ | ★★★★☆ | ★★★☆☆ |
| System.Text.Json（反射） | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ |
| Newtonsoft.Json | ★★☆☆☆ | ★★☆☆☆ | ★★★☆☆ |

对于热点路径，优先使用 MessagePack 或 Protobuf。

---

## Akka.NET 序列化

对于 Akka.NET Actor 系统，请使用基于模式的序列化：

```hocon
akka {
  actor {
    serializers {
      messagepack = "Akka.Serialization.MessagePackSerializer, Akka.Serialization.MessagePack"
    }
    serialization-bindings {
      "MyApp.Messages.IMessage, MyApp" = messagepack
    }
  }
}
```

请参阅 [Akka.NET 序列化文档](https://getakka.net/articles/networking/serialization.html)。

---

## 最佳实践

### 应当这样做

```csharp
// Use source generators for System.Text.Json
[JsonSerializable(typeof(Order))]
public partial class AppJsonContext : JsonSerializerContext { }

// Use explicit field numbers/keys
[MessagePackObject]
public class Order
{
    [Key(0)] public string Id { get; init; }
}

// Use records for immutable message types
public sealed record OrderCreated(OrderId Id, CustomerId CustomerId);
```

### 不要这样做

```csharp
// Don't use BinaryFormatter (ever)
var formatter = new BinaryFormatter();  // Security risk!

// Don't embed type names in wire format
settings.TypeNameHandling = TypeNameHandling.All;  // Breaks on rename!

// Don't use reflection serialization for hot paths
JsonConvert.SerializeObject(order);  // Slow, not AOT-compatible
```

---

## 资源

- **System.Text.Json 源生成**：https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/source-generation
- **Protocol Buffers**：https://protobuf.dev/
- **MessagePack-CSharp**：https://github.com/MessagePack-CSharp/MessagePack-CSharp
- **Akka.NET 序列化**：https://getakka.net/articles/networking/serialization.html
- **线格式兼容性**：https://getakka.net/community/contributing/wire-compatibility.html