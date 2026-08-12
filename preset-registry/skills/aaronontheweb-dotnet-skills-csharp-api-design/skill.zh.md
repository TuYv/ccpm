---
name: api-design
description: Design stable, compatible public APIs using extend-only design principles. Manage API compatibility, wire compatibility, and versioning for NuGet packages and distributed systems.
invocable: false
---
# 公共 API 设计与兼容性

## 何时使用此技能

在以下情况下使用此技能：
- 为 NuGet 包或库设计公共 API
- 更改现有公共 API
- 规划分布式系统的线路格式变更
- 实施版本控制策略
- 审查拉取请求中是否存在破坏性变更

---

## 三种兼容性类型

| 类型 | 定义 | 范围 |
|------|------------|-------|
| **API/源代码** | 代码可针对较新版本成功编译 | 公共方法签名、类型 |
| **二进制** | 已编译代码可针对较新版本运行 | 程序集布局、方法标记 |
| **线路** | 序列化数据可由其他版本读取 | 网络协议、持久化格式 |

破坏其中任何一种兼容性都会给用户升级带来阻力。

---

## 仅扩展设计

稳定 API 的基础：**绝不移除或修改，只进行扩展**。

### 三大支柱

1. **以前的功能不可变** - 一旦发布，其行为和签名即被锁定
2. **通过新构造提供新功能** - 添加重载、新类型、可选择启用的功能
3. **仅在弃用期结束后移除** - 以年为单位，而非以发布版本为单位

### 优势

- 旧代码在新版本中可继续运行
- 新旧路径并存
- 默认情况下升级不会造成破坏
- 用户可以按照自己的计划升级

**资源：**
- [仅扩展设计](https://aaronstannard.com/extend-only-design/)
- [开源软件兼容性标准](https://aaronstannard.com/oss-compatibility-standards/)

---

## API 变更指南

### 安全的变更（适用于任何版本）

```csharp
// SAFE: Add NEW overload methods that delegate to existing methods
// Existing method - do not modify its signature
public void Process(Order order) { ... }
// New overload - safe to add
public void Process(Order order, CancellationToken ct)
{
    // implementation that handles cancellation
}

// SAFE: Add NEW overloads for additional functionality
// Existing method - do not modify
public void Send(Message msg) { ... }
// New overload - safe to add
public void Send(Message msg, Priority priority)
{
    // implementation that handles priority
}

// ADD new types, interfaces, enums
public interface IOrderValidator { }
public enum OrderStatus { Pending, Complete, Cancelled }

// ADD new members to existing types
public class Order
{
    public DateTimeOffset? ShippedAt { get; init; }  // NEW
}
```

### 不安全的变更（绝不进行或仅限主版本）

```csharp
// REMOVE or RENAME public members
public void ProcessOrder(Order order);  // Was: Process()

// CHANGE parameter types or order
public void Process(int orderId);  // Was: Process(Order order)

// CHANGE return types
public Order? GetOrder(string id);  // Was: public Order GetOrder()

// CHANGE access modifiers
internal class OrderProcessor { }  // Was: public

// ADD optional parameters to EXISTING methods (binary incompatible!)
// The compiled IL method signature changes - callers compiled against
// the old signature will get MissingMethodException at runtime.
// Optional parameter defaults are baked into the CALLER's assembly at compile time.
public void Process(Order order, CancellationToken ct = default);  // Breaks binary compat!
public void Send(Message msg, Priority priority = Priority.Normal);  // Breaks binary compat!
// Correct approach: add a NEW overload method instead (see Safe Changes above)

// ADD required parameters without defaults
public void Process(Order order, ILogger logger);  // Breaks callers!
```

### 弃用模式

```csharp
// Step 1: Mark as obsolete with version (any release)
[Obsolete("Obsolete since v1.5.0. Use ProcessAsync instead.")]
public void Process(Order order) { }

// Step 2: Add new recommended API (same release)
public Task ProcessAsync(Order order, CancellationToken ct = default);

// Step 3: Remove in next major version (v2.0+)
// Only after users have had time to migrate
```

---

## API 审批测试

通过自动化 API 表面测试防止意外的破坏性变更。

### 使用 ApiApprover + Verify

```bash
dotnet add package PublicApiGenerator
dotnet add package Verify.Xunit
```

```csharp
[Fact]
public Task ApprovePublicApi()
{
    var api = typeof(MyLibrary.PublicClass).Assembly.GeneratePublicApi();
    return Verify(api);
}
```

创建 `ApprovePublicApi.verified.txt`：

```csharp
namespace MyLibrary
{
    public class OrderProcessor
    {
        public OrderProcessor() { }
        public void Process(Order order) { }
        public Task ProcessAsync(Order order, CancellationToken ct = default) { }
    }
}
```

**任何 API 变更都会导致测试失败**——审查者必须明确批准这些变更。

### PR 审查流程

1. PR 包含对 `*.verified.txt` 文件的更改
2. 审查者可以在差异中看到确切的 API 表面变更
3. 破坏性变更会立即显现
4. 必须经过审慎决策才能批准

---

## 线协议兼容性

对于分布式系统，序列化数据必须能够跨版本读取。

### 要求

| 方向 | 要求 |
|-----------|-------------|
| **向后兼容** | 旧写入方 → 新读取方（当前版本能够读取旧数据） |
| **向前兼容** | 新写入方 → 旧读取方（旧版本能够读取新数据） |

要实现零停机滚动升级，两者都不可或缺。

### 安全地演进线格式

**阶段 1：添加读取端支持（选择启用）**

```csharp
// New message type - readers deployed first
public sealed record HeartbeatV2(
    Address From,
    long SequenceNr,
    long CreationTimeMs);  // NEW field

// Deserializer handles both old and new
public object Deserialize(byte[] data, string manifest) => manifest switch
{
    "Heartbeat" => DeserializeHeartbeatV1(data),   // Old format
    "HeartbeatV2" => DeserializeHeartbeatV2(data), // New format
    _ => throw new NotSupportedException()
};
```

**阶段 2：启用写入端（选择停用，在下一个次版本中）**

```csharp
// Config to enable new format (off by default initially)
akka.cluster.use-heartbeat-v2 = on
```

**阶段 3：设为默认值（未来版本）**

在已安装用户群体采用读取端代码之后。

### 基于模式的序列化

优先使用基于模式的格式，而不是基于反射的格式：

| 格式 | 类型 | 线协议兼容性 |
|--------|------|-------------------|
| **Protocol Buffers** | 基于模式 | 极佳——使用显式字段编号 |
| **MessagePack** | 基于模式 | 良好——使用契约时 |
| **System.Text.Json** | 基于模式（配合源生成） | 良好——使用显式属性 |
| Newtonsoft.Json | 基于反射 | 较差——负载中包含类型名称 |
| BinaryFormatter | 基于反射 | 极差——切勿使用 |

详见 `dotnet/serialization` skill。

---

## 封装模式

### 内部 API

显式标记非公开 API：

```csharp
// Attribute for documentation
[InternalApi]
public class ActorSystemImpl { }

// Namespace convention
namespace MyLibrary.Internal
{
    public class InternalHelper { }  // Public for extensibility, not for users
}
```

明确说明：

> 位于 `.Internal` 命名空间中或标有 `[InternalApi]` 的类型可能会在任意版本之间发生变更，恕不另行通知。

### 密封类

```csharp
// DO: Seal classes not designed for inheritance
public sealed class OrderProcessor { }

// DON'T: Leave unsealed by accident
public class OrderProcessor { }  // Users might inherit, blocking changes
```

### 接口隔离

```csharp
// DO: Small, focused interfaces
public interface IOrderReader
{
    Order? GetById(OrderId id);
}

public interface IOrderWriter
{
    Task SaveAsync(Order order);
}

// DON'T: Monolithic interfaces (can't add methods without breaking)
public interface IOrderRepository
{
    Order? GetById(OrderId id);
    Task SaveAsync(Order order);
    // Adding new methods breaks all implementations!
}
```

---

## 版本控制策略

### 语义化版本控制（实用版）

| 版本 | 允许的变更 |
|---------|----------------|
| **补丁版本** (1.0.x) | Bug 修复、安全补丁 |
| **次版本** (1.x.0) | 新功能、弃用、移除已废弃内容 |
| **主版本** (x.0.0) | 破坏性变更、移除旧 API |

### 关键原则

1. **不制造意外的破坏性变更** - 即使是主版本，也应提前公布并进行规划
2. **随时可以扩展** - 新 API 可以在任何版本中发布
3. **先弃用，再移除** - 至少在一个次版本中使用 `[Obsolete]`
4. **说明时间安排** - 用户需要规划升级

### 切斯特顿栅栏原则

> 在移除或更改某项内容之前，先理解它为何存在。

假定每个公开 API 都有人使用。如果你想更改它：
1. 在 GitHub 上公开讨论提案
2. 记录迁移路径
3. 提供弃用期
4. 在计划的版本中发布

---

## Pull Request 检查清单

审查涉及公开 API 的 PR 时：

- [ ] **未移除公开成员**（改用 `[Obsolete]`）
- [ ] **未更改签名**（改为添加重载）
- [ ] **未新增必需参数**（使用默认值）
- [ ] **已更新 API 审批测试**（已审查 `.verified.txt` 变更）
- [ ] **线格式变更需显式启用**（先支持读取端）
- [ ] **已记录破坏性变更**（发布说明、迁移指南）

---

## 反模式

### 伪装成修复的破坏性变更

```csharp
// "Bug fix" that breaks users
public async Task<Order> GetOrderAsync(OrderId id)  // Was sync!
{
    // "Fixed" to be async - but breaks all callers
}

// Correct: Add new method, deprecate old
[Obsolete("Use GetOrderAsync instead")]
public Order GetOrder(OrderId id) => GetOrderAsync(id).Result;

public async Task<Order> GetOrderAsync(OrderId id) { }
```

### 静默行为变更

```csharp
// Changing defaults breaks users who relied on old behavior
public void Configure(bool enableCaching = true)  // Was: false!

// Correct: New parameter with new name
public void Configure(
    bool enableCaching = false,  // Original default preserved
    bool enableNewCaching = true)  // New behavior opt-in
```

### 多态序列化

```csharp
// AVOID: Type names in wire format
{ "$type": "MyApp.Order, MyApp", "Id": 123 }

// Renaming Order class = wire break!

// PREFER: Explicit discriminators
{ "type": "order", "id": 123 }
```

---

## 资源

- [进行公共 API 变更](https://getakka.net/community/contributing/api-changes-compatibility.html)
- [线路格式变更](https://getakka.net/community/contributing/wire-compatibility.html)
- [仅扩展设计](https://aaronstannard.com/extend-only-design/)
- [开源软件兼容性标准](https://aaronstannard.com/oss-compatibility-standards/)
- [语义化版本控制](https://semver.org/)
- [PublicApiGenerator](https://github.com/PublicApiGenerator/PublicApiGenerator)