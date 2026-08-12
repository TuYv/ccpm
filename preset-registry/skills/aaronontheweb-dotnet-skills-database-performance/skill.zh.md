---
name: database-performance
description: Database access patterns for performance. Separate read/write models, avoid N+1 queries, use AsNoTracking, apply row limits, and never do application-side joins. Works with EF Core and Dapper.
invocable: false
tags: [cqrs, performance, patterns]
---
# 数据库性能模式

## 何时使用此技能

在以下情况下使用此技能：
- 设计数据访问层
- 优化缓慢的数据库查询
- 在 EF Core 和 Dapper 之间进行选择
- 避免常见的性能陷阱

---

## 核心原则

1. **分离读模型和写模型** - 不要对两者使用相同的类型
2. **采用批处理思维** - 避免 N+1 查询
3. **只检索所需内容** - 不要使用 SELECT *
4. **应用行数限制** - 始终设置可配置的 Take/Limit
5. **在 SQL 中执行连接** - 切勿在应用程序代码中执行
6. **读取时使用 AsNoTracking** - EF Core 的变更跟踪开销很大

---

## 读写模型分离（CQRS 模式）

**读模型和写模型有着根本区别——它们具有不同的结构、列和用途。** 不要创建单一的“User”实体并在所有地方重复使用它。

- **读模型**是反规范化的，针对查询效率进行了优化，并返回多种投影类型（UserProfile、UserSummary、UserDetailForAdmin）
- **写模型**是规范化的，以验证为重点，并接受强类型命令（CreateUserCommand、UpdateUserCommand）

### 架构

```
src/
  MyApp.Data/
    Users/
      # Read side - multiple optimized projections
      IUserReadStore.cs
      PostgresUserReadStore.cs

      # Write side - command handlers
      IUserWriteStore.cs
      PostgresUserWriteStore.cs

      # Read DTOs - lightweight, denormalized
      UserProfile.cs
      UserSummary.cs

      # Write commands - validation-focused
      CreateUserCommand.cs
      UpdateUserCommand.cs
    Orders/
      IOrderReadStore.cs
      IOrderWriteStore.cs
      (similar structure...)
```

### 读存储接口

```csharp
// Read models: Multiple specialized projections optimized for different use cases
public interface IUserReadStore
{
    // Returns detailed profile for single-user view
    Task<UserProfile?> GetByIdAsync(UserId id, CancellationToken ct = default);

    // Returns lightweight info for lookups
    Task<UserProfile?> GetByEmailAsync(EmailAddress email, CancellationToken ct = default);

    // Returns paginated summaries - only what the list view needs
    Task<IReadOnlyList<UserSummary>> GetAllAsync(int limit, UserId? cursor = null, CancellationToken ct = default);

    // Boolean query - no entity needed
    Task<bool> EmailExistsAsync(EmailAddress email, CancellationToken ct = default);
}
```

### 写存储接口

```csharp
// Write model: Accepts strongly-typed commands, minimal return values
public interface IUserWriteStore
{
    // Returns only the created ID - caller doesn't need the full entity
    Task<UserId> CreateAsync(CreateUserCommand command, CancellationToken ct = default);

    // Update validates command, returns void (success or throws)
    Task UpdateAsync(UserId id, UpdateUserCommand command, CancellationToken ct = default);

    // Delete is simple and explicit
    Task DeleteAsync(UserId id, CancellationToken ct = default);
}
```

**图中展示的关键结构差异：**
- 读存储返回多个不同的 DTO（UserProfile、UserSummary、bool 标志）
- 写存储返回最少量的数据（创建时仅返回 UserId）或 void
- 读取查询是无状态投影——无需跟踪
- 写入操作侧重于命令验证，而不是之后检索数据
- 读写操作可以由不同的数据库/表提供支持（最终一致性模式）

---

## 始终应用行数限制

**绝不要返回无界结果集。** 每个读取方法都应具有可配置的限制。

### 模式：限制参数

```csharp
public interface IOrderReadStore
{
    // Limit is required, not optional
    Task<IReadOnlyList<OrderSummary>> GetByCustomerAsync(
        CustomerId customerId,
        int limit,
        OrderId? cursor = null,
        CancellationToken ct = default);
}

// Implementation
public async Task<IReadOnlyList<OrderSummary>> GetByCustomerAsync(
    CustomerId customerId,
    int limit,
    OrderId? cursor = null,
    CancellationToken ct = default)
{
    await using var connection = await _dataSource.OpenConnectionAsync(ct);

    const string sql = """
        SELECT id, customer_id, total, status, created_at
        FROM orders
        WHERE customer_id = @CustomerId
        AND (@Cursor IS NULL OR created_at < (SELECT created_at FROM orders WHERE id = @Cursor))
        ORDER BY created_at DESC
        LIMIT @Limit
        """;

    var rows = await connection.QueryAsync<OrderRow>(sql, new
    {
        CustomerId = customerId.Value,
        Cursor = cursor?.Value,
        Limit = limit
    });

    return rows.Select(r => r.ToOrderSummary()).ToList();
}
```

### 使用 EF Core 进行分页

```csharp
public async Task<PaginatedList<OrderSummary>> GetOrdersAsync(
    CustomerId customerId,
    Paginator paginator,
    CancellationToken ct = default)
{
    var query = _context.Orders
        .AsNoTracking()
        .Where(o => o.CustomerId == customerId.Value)
        .OrderByDescending(o => o.CreatedAt);

    var totalCount = await query.CountAsync(ct);

    var orders = await query
        .Skip((paginator.PageNumber - 1) * paginator.PageSize)
        .Take(paginator.PageSize)  // Always limit!
        .Select(o => new OrderSummary(
            new OrderId(o.Id),
            o.Total,
            o.Status,
            o.CreatedAt))
        .ToListAsync(ct);

    return new PaginatedList<OrderSummary>(
        orders,
        totalCount,
        paginator.PageSize,
        paginator.PageNumber);
}
```

---

## 对读取查询使用 AsNoTracking

EF Core 的更改跟踪开销很大。应为只读查询禁用它。

```csharp
// DO: Disable tracking for reads
var users = await _context.Users
    .AsNoTracking()
    .Where(u => u.IsActive)
    .ToListAsync();

// DON'T: Track entities you won't modify
var users = await _context.Users
    .Where(u => u.IsActive)
    .ToListAsync();  // Change tracking enabled - wasteful
```

### 配置默认行为

```csharp
// For read-heavy applications, consider this in DbContext
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
}
```

然后在需要时显式启用跟踪：

```csharp
var user = await _context.Users
    .AsTracking()  // Explicit - we intend to modify
    .FirstOrDefaultAsync(u => u.Id == userId);
```

---

## 避免 N+1 查询

N+1 问题：先获取一个列表，然后逐一查询每个项目的关联数据。

### 问题

```csharp
// BAD: N+1 queries
var orders = await _context.Orders.ToListAsync();

foreach (var order in orders)
{
    // Each iteration hits the database!
    var items = await _context.OrderItems
        .Where(i => i.OrderId == order.Id)
        .ToListAsync();
}
```

### 解决方案 1：Include（EF Core）

```csharp
// GOOD: Single query with join
var orders = await _context.Orders
    .AsNoTracking()
    .Include(o => o.Items)
    .ToListAsync();
```

### 解决方案 2：批量查询（Dapper）

```csharp
// GOOD: Two queries, no N+1
const string sql = """
    SELECT id, customer_id, total FROM orders WHERE customer_id = @CustomerId;
    SELECT oi.* FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE o.customer_id = @CustomerId;
    """;

using var multi = await connection.QueryMultipleAsync(sql, new { CustomerId = customerId });
var orders = (await multi.ReadAsync<OrderRow>()).ToList();
var items = (await multi.ReadAsync<OrderItemRow>()).ToList();

// Join in memory (acceptable - data already fetched)
foreach (var order in orders)
{
    order.Items = items.Where(i => i.OrderId == order.Id).ToList();
}
```

---

## 绝不要在应用程序端执行连接

**连接必须在 SQL 中执行，而不是在 C# 中。**

```csharp
// BAD: Application join - two queries, memory waste
var customers = await _context.Customers.ToListAsync();
var orders = await _context.Orders.ToListAsync();

var result = customers.Select(c => new
{
    Customer = c,
    Orders = orders.Where(o => o.CustomerId == c.Id).ToList()  // O(n*m) in memory!
});

// GOOD: SQL join - single query
var result = await _context.Customers
    .AsNoTracking()
    .Include(c => c.Orders)
    .ToListAsync();

// GOOD: Explicit join (Dapper)
const string sql = """
    SELECT c.id, c.name, COUNT(o.id) as order_count
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id, c.name
    """;
```

---

## 避免笛卡尔积爆炸

多次调用 `Include` 可能导致笛卡尔积。

```csharp
// DANGEROUS: Can explode into millions of rows
var product = await _context.Products
    .Include(p => p.Reviews)      // 100 reviews
    .Include(p => p.Images)       // 20 images
    .Include(p => p.Categories)   // 5 categories
    .FirstOrDefaultAsync(p => p.Id == id);
// Result: 100 * 20 * 5 = 10,000 rows transferred!
```

### 解决方案：拆分查询

```csharp
// GOOD: Multiple queries, no Cartesian explosion
var product = await _context.Products
    .AsSplitQuery()
    .Include(p => p.Reviews)
    .Include(p => p.Images)
    .Include(p => p.Categories)
    .FirstOrDefaultAsync(p => p.Id == id);
// Result: 4 separate queries, ~125 rows total
```

### 解决方案：显式投影

```csharp
// BEST: Only fetch what you need
var product = await _context.Products
    .AsNoTracking()
    .Where(p => p.Id == id)
    .Select(p => new ProductDetail(
        p.Id,
        p.Name,
        p.Description,
        p.Reviews.OrderByDescending(r => r.CreatedAt).Take(10).ToList(),
        p.Images.Take(5).ToList(),
        p.Categories.Select(c => c.Name).ToList()))
    .FirstOrDefaultAsync();
```

---

## 限制列大小

在 EF Core 模型中定义最大长度，以防止数据过大。

```csharp
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(u => u.Email)
            .HasMaxLength(254)  // RFC 5321 limit
            .IsRequired();

        builder.Property(u => u.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(u => u.Bio)
            .HasMaxLength(500);

        // For truly large content, use text type explicitly
        builder.Property(u => u.Notes)
            .HasColumnType("text");
    }
}
```

---

## 不要构建泛型仓储

泛型仓储会掩盖查询复杂性，并使优化变得困难。

```csharp
// BAD: Generic repository
public interface IRepository<T>
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();  // No limit!
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);  // Can't optimize
}

// GOOD: Purpose-built read stores
public interface IOrderReadStore
{
    Task<OrderDetail?> GetByIdAsync(OrderId id, CancellationToken ct = default);
    Task<IReadOnlyList<OrderSummary>> GetByCustomerAsync(CustomerId id, int limit, CancellationToken ct = default);
    Task<IReadOnlyList<OrderSummary>> GetPendingAsync(int limit, CancellationToken ct = default);
}
```

**泛型仓储存在的问题：**
- 无法优化特定查询
- 无法强制实施限制
- 掩盖 N+1 问题
- 很容易获取过多数据
- 容易导致对数据访问缺乏深入思考

---

## 将 Dapper 用于读取密集型工作负载

对于复杂的读取查询，使用带有显式 SQL 的 Dapper 通常更简洁、更快速。

```csharp
public sealed class PostgresUserReadStore : IUserReadStore
{
    private readonly NpgsqlDataSource _dataSource;

    public PostgresUserReadStore(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<UserProfile?> GetByIdAsync(UserId id, CancellationToken ct = default)
    {
        await using var connection = await _dataSource.OpenConnectionAsync(ct);

        const string sql = """
            SELECT id, email, name, bio, created_at
            FROM users
            WHERE id = @Id
            """;

        var row = await connection.QuerySingleOrDefaultAsync<UserRow>(
            sql, new { Id = id.Value });

        return row?.ToUserProfile();
    }

    // Internal row type for Dapper mapping
    private sealed class UserRow
    {
        public Guid id { get; set; }
        public string email { get; set; } = null!;
        public string name { get; set; } = null!;
        public string? bio { get; set; }
        public DateTime created_at { get; set; }

        public UserProfile ToUserProfile() => new(
            Id: new UserId(id),
            Email: new EmailAddress(email),
            Name: new PersonName(name),
            Bio: bio,
            CreatedAt: new DateTimeOffset(created_at, TimeSpan.Zero));
    }
}
```

---

## 何时使用 EF Core，何时使用 Dapper

| 场景 | 建议 |
|----------|---------------|
| 简单的 CRUD | EF Core |
| 复杂的读取查询 | Dapper |
| 带验证的写入操作 | EF Core |
| 批量操作 | Dapper 或原生 SQL |
| 报表/分析 | Dapper |
| 领域逻辑繁重的写入操作 | EF Core |

你可以在同一项目中同时使用两者——使用 EF Core 进行写入，使用 Dapper 进行读取。

---

## 快速参考

| 反模式 | 解决方案 |
|--------------|----------|
| 没有行数限制 | 为每个读取方法添加 `limit` 参数 |
| SELECT * | 仅投影所需的列 |
| N+1 查询 | 使用 Include 或批量查询 |
| 应用程序联接 | 在 SQL 中执行联接 |
| 笛卡尔积爆炸 | 使用 AsSplitQuery 或投影 |
| 跟踪只读数据 | 使用 AsNoTracking |
| 通用仓储 | 使用专门构建的读/写存储 |
| 无界字符串 | 在模型中配置 MaxLength |

---

## 资源

- **EF Core 性能**: https://learn.microsoft.com/en-us/ef/core/performance/
- **Dapper**: https://github.com/DapperLib/Dapper
- **AsSplitQuery**: https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries