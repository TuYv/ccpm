---
name: efcore-patterns
description: Entity Framework Core best practices including NoTracking by default, query splitting for navigation collections, migration management, dedicated migration services, and common pitfalls to avoid.
invocable: false
---
# Entity Framework Core 模式

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 在新项目中设置 EF Core
- 优化查询性能
- 管理数据库迁移
- 将 EF Core 与 .NET Aspire 集成
- 调试变更跟踪问题
- 高效加载多个导航集合（查询拆分）

## 核心原则

1. **默认使用 NoTracking** - 大多数查询都是只读的；按需启用跟踪
2. **绝不手动编辑迁移** - 始终使用 CLI 命令
3. **专用迁移服务** - 将迁移执行与应用程序启动分离
4. **使用 ExecutionStrategy 进行重试** - 处理瞬时数据库故障
5. **显式更新** - 使用 NoTracking 时，显式将实体标记为待更新

---

## 模式 1：默认使用 NoTracking

配置 DbContext，默认禁用变更跟踪。这可以提高读取密集型工作负载的性能。

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
        // Disable change tracking by default for better performance on read-only queries
        // Use .AsTracking() explicitly for queries that need to track changes
        ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
    }

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Customer> Customers => Set<Customer>();
}
```

### NoTracking 启用时

**只读查询可正常工作：**
```csharp
// ✅ Fast read - no tracking overhead
var orders = await dbContext.Orders
    .Where(o => o.Status == OrderStatus.Pending)
    .ToListAsync();
```

**写入操作需要显式处理：**
```csharp
// ❌ WRONG - Entity not tracked, SaveChanges does nothing
var order = await dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
order.Status = OrderStatus.Shipped;
await dbContext.SaveChangesAsync(); // Nothing happens!

// ✅ CORRECT - Explicitly mark entity for update
var order = await dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
order.Status = OrderStatus.Shipped;
dbContext.Orders.Update(order); // Marks entire entity as modified
await dbContext.SaveChangesAsync();

// ✅ ALSO CORRECT - Use AsTracking() for the query
var order = await dbContext.Orders
    .AsTracking()
    .FirstOrDefaultAsync(o => o.Id == orderId);
order.Status = OrderStatus.Shipped;
await dbContext.SaveChangesAsync(); // Works!
```

### 何时使用跟踪

| 场景 | 是否使用跟踪？ | 原因 |
|----------|---------------|-----|
| 在 UI 中显示数据 | 否 | 只读，不进行更新 |
| API GET 端点 | 否 | 返回数据，不进行修改 |
| 更新单个实体 | 是，或显式调用 Update() | 需要保存更改 |
| 涉及导航属性的复杂更新 | 是 | 跟踪机制会处理关系 |
| 批量操作 | 否 + ExecuteUpdate | 效率更高 |

### 显式 Add/Update 模式

```csharp
public class OrderService
{
    private readonly ApplicationDbContext _db;

    // CREATE - Always use Add (works regardless of tracking)
    public async Task<Order> CreateOrderAsync(Order order)
    {
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return order;
    }

    // UPDATE - Explicitly mark as modified
    public async Task UpdateOrderStatusAsync(Guid orderId, OrderStatus newStatus)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderId)
            ?? throw new NotFoundException($"Order {orderId} not found");

        order.Status = newStatus;
        order.UpdatedAt = DateTimeOffset.UtcNow;

        // Explicitly mark as modified since DbContext uses NoTracking by default
        _db.Orders.Update(order);
        await _db.SaveChangesAsync();
    }

    // DELETE - Attach and remove
    public async Task DeleteOrderAsync(Guid orderId)
    {
        var order = new Order { Id = orderId };
        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();
    }
}
```

---

## 模式 2：绝不手动编辑迁移

**关键要求：** 始终使用 EF Core CLI 命令管理迁移。绝不要：
- 手动编辑迁移文件（在 `Up()`/`Down()` 中添加自定义 SQL 除外）
- 直接删除迁移文件
- 重命名迁移文件
- 在项目之间复制迁移

### 创建迁移

```bash
# Create a new migration
dotnet ef migrations add AddCustomerTable \
    --project src/MyApp.Infrastructure \
    --startup-project src/MyApp.Api

# With a specific DbContext (if you have multiple)
dotnet ef migrations add AddCustomerTable \
    --context ApplicationDbContext \
    --project src/MyApp.Infrastructure \
    --startup-project src/MyApp.Api
```

### 移除迁移

```bash
# Remove the last migration (if not yet applied)
dotnet ef migrations remove \
    --project src/MyApp.Infrastructure \
    --startup-project src/MyApp.Api

# NEVER do this:
# rm Migrations/20240101_AddCustomerTable.cs  # ❌ BAD!
```

### 应用迁移

```bash
# Apply all pending migrations
dotnet ef database update \
    --project src/MyApp.Infrastructure \
    --startup-project src/MyApp.Api

# Apply to a specific migration
dotnet ef database update AddCustomerTable \
    --project src/MyApp.Infrastructure \
    --startup-project src/MyApp.Api

# Rollback to a previous migration
dotnet ef database update PreviousMigrationName \
    --project src/MyApp.Infrastructure \
    --startup-project src/MyApp.Api
```

### 生成 SQL 脚本

```bash
# Generate SQL script for all migrations
dotnet ef migrations script \
    --project src/MyApp.Infrastructure \
    --startup-project src/MyApp.Api \
    --output migrations.sql

# Generate idempotent script (safe to run multiple times)
dotnet ef migrations script \
    --idempotent \
    --project src/MyApp.Infrastructure \
    --startup-project src/MyApp.Api
```

---

## 模式 3：配合 Aspire 使用专用迁移服务

使用专用迁移服务，将迁移执行与主应用程序分离。这样可以确保：
- 迁移在应用启动之前完成
- 明确实现关注点分离
- 在测试环境中以可控方式进行数据播种

### 项目结构

```
src/
├── MyApp.AppHost/           # Aspire orchestration
├── MyApp.Api/               # Main application
├── MyApp.Infrastructure/    # DbContext and migrations
└── MyApp.MigrationService/  # Dedicated migration runner
```

### MigrationService Program.cs

```csharp
using MyApp.Infrastructure.Data;
using MyApp.MigrationService;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

// Add Aspire service defaults
builder.AddServiceDefaults();

// Add PostgreSQL DbContext
var connectionString = builder.Configuration.GetConnectionString("appdb")
    ?? throw new InvalidOperationException("Connection string 'appdb' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
        npgsqlOptions.MigrationsAssembly("MyApp.Infrastructure")));

// Add the migration worker
builder.Services.AddHostedService<MigrationWorker>();

var host = builder.Build();
host.Run();
```

### MigrationWorker.cs

```csharp
public class MigrationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IHostApplicationLifetime _hostApplicationLifetime;
    private readonly ILogger<MigrationWorker> _logger;

    public MigrationWorker(
        IServiceProvider serviceProvider,
        IHostApplicationLifetime hostApplicationLifetime,
        ILogger<MigrationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _hostApplicationLifetime = hostApplicationLifetime;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Migration service starting...");

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            await RunMigrationsAsync(dbContext, stoppingToken);

            _logger.LogInformation("Migration service completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Migration service failed: {Error}", ex.Message);
            throw;
        }
        finally
        {
            // Stop the application after migrations complete
            _hostApplicationLifetime.StopApplication();
        }
    }

    private async Task RunMigrationsAsync(ApplicationDbContext dbContext, CancellationToken ct)
    {
        // Use execution strategy for transient failure handling
        var strategy = dbContext.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync(ct);

            if (pendingMigrations.Any())
            {
                _logger.LogInformation("Applying {Count} pending migrations...",
                    pendingMigrations.Count());

                await dbContext.Database.MigrateAsync(ct);

                _logger.LogInformation("Migrations applied successfully.");
            }
            else
            {
                _logger.LogInformation("No pending migrations. Database is up to date.");
            }
        });
    }
}
```

### AppHost 配置

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres");
var db = postgres.AddDatabase("appdb");

// Migrations run first, then exit
var migrations = builder.AddProject<Projects.MyApp_MigrationService>("migrations")
    .WaitFor(db)
    .WithReference(db);

// API waits for migrations to complete
var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WaitForCompletion(migrations)  // Key: waits for migrations to finish
    .WithReference(db);
```

---

## 模式 4：用于瞬态故障的 ExecutionStrategy

对于可能发生瞬态故障的操作，始终使用 `CreateExecutionStrategy()`：

```csharp
public async Task UpdateWithRetryAsync(Guid id, Action<Order> update)
{
    var strategy = _dbContext.Database.CreateExecutionStrategy();

    await strategy.ExecuteAsync(async () =>
    {
        var order = await _dbContext.Orders
            .AsTracking()
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return;

        update(order);
        await _dbContext.SaveChangesAsync();
    });
}
```

**重要提示：** 不能将 `CreateExecutionStrategy()` 与用户发起的事务一起使用。如果需要在事务中进行重试：

```csharp
var strategy = _dbContext.Database.CreateExecutionStrategy();

await strategy.ExecuteAsync(async () =>
{
    // Transaction must be INSIDE the strategy callback
    await using var transaction = await _dbContext.Database.BeginTransactionAsync();

    try
    {
        // ... your operations ...
        await _dbContext.SaveChangesAsync();
        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
});
```

---

## 模式 5：使用 ExecuteUpdate/ExecuteDelete 进行批量操作

对于批量操作，请使用 EF Core 7+ 的 `ExecuteUpdateAsync` 和 `ExecuteDeleteAsync`，而不是加载实体：

```csharp
// ❌ SLOW - Loads all entities into memory
var expiredOrders = await _db.Orders
    .Where(o => o.ExpiresAt < DateTimeOffset.UtcNow)
    .ToListAsync();

foreach (var order in expiredOrders)
{
    order.Status = OrderStatus.Expired;
}
await _db.SaveChangesAsync();

// ✅ FAST - Single SQL UPDATE statement
await _db.Orders
    .Where(o => o.ExpiresAt < DateTimeOffset.UtcNow)
    .ExecuteUpdateAsync(setters => setters
        .SetProperty(o => o.Status, OrderStatus.Expired)
        .SetProperty(o => o.UpdatedAt, DateTimeOffset.UtcNow));

// ✅ FAST - Single SQL DELETE statement
await _db.Orders
    .Where(o => o.Status == OrderStatus.Cancelled && o.CreatedAt < cutoffDate)
    .ExecuteDeleteAsync();
```

---

## 常见陷阱

### 1. 使用 NoTracking 时忘记执行更新

```csharp
// ❌ Silent failure - entity not tracked
var customer = await _db.Customers.FindAsync(id);
customer.Name = "New Name";
await _db.SaveChangesAsync(); // Does nothing!

// ✅ Explicit update
var customer = await _db.Customers.FindAsync(id);
customer.Name = "New Name";
_db.Customers.Update(customer);
await _db.SaveChangesAsync();
```

### 2. N+1 查询问题

```csharp
// ❌ N+1 queries - one query per order
var customers = await _db.Customers.ToListAsync();
foreach (var customer in customers)
{
    var orders = customer.Orders; // Lazy load triggers query
}

// ✅ Eager loading - single query
var customers = await _db.Customers
    .Include(c => c.Orders)
    .ToListAsync();
```

### 3. 多个 DbContext 实例导致的跟踪冲突

```csharp
// ❌ Tracking conflict - entity tracked by different context
var order1 = await _db1.Orders.AsTracking().FindAsync(id);
var order2 = await _db2.Orders.AsTracking().FindAsync(id);
order2.Status = OrderStatus.Shipped;
await _db2.SaveChangesAsync(); // May throw or behave unexpectedly

// ✅ Use single context or detach first
_db1.Entry(order1).State = EntityState.Detached;
```

### 4. 未始终如一地使用异步操作

```csharp
// ❌ Blocking call in async context
var orders = _db.Orders.ToList(); // Blocks thread

// ✅ Async all the way
var orders = await _db.Orders.ToListAsync();
```

### 5. 在循环内执行查询

```csharp
// ❌ Query per iteration
foreach (var orderId in orderIds)
{
    var order = await _db.Orders.FindAsync(orderId);
    // process order
}

// ✅ Single query
var orders = await _db.Orders
    .Where(o => orderIds.Contains(o.Id))
    .ToListAsync();
```

---

## DI 中的 DbContext 生命周期

### ASP.NET Core（默认使用 Scoped）

```csharp
// Scoped = one instance per HTTP request
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
```

### 后台服务（创建作用域）

```csharp
public class MyBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // ✅ Create scope for each unit of work
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // ... use dbContext ...
    }
}
```

### Actor / 长生命周期对象（工厂模式）

```csharp
public class OrderActor : ReceiveActor
{
    private readonly IDbContextFactory<ApplicationDbContext> _dbFactory;

    public OrderActor(IDbContextFactory<ApplicationDbContext> dbFactory)
    {
        _dbFactory = dbFactory;

        ReceiveAsync<GetOrder>(async msg =>
        {
            // Create fresh context for each operation
            await using var db = await _dbFactory.CreateDbContextAsync();
            var order = await db.Orders.FindAsync(msg.OrderId);
            Sender.Tell(order);
        });
    }
}

// Registration
builder.Services.AddDbContextFactory<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
```

---

## 模式 6：通过查询拆分防止笛卡尔积爆炸

当你通过 `Include()` 加载多个导航集合时，EF Core 会生成单个查询，这可能导致笛卡尔积爆炸。如果你有 10 个订单，每个订单包含 10 个条目，最终会得到 100 行，而不是 10 + 10 行。

### 全局配置（推荐用于大多数情况）

在 DbContext 配置中全局启用查询拆分：

```csharp
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        }));
```

### 针对单个查询覆盖配置

当你确定单个查询效率更高时，使用单个查询：

```csharp
// Use single query when you know the structure is well-understood
var orders = await dbContext.Orders
    .Include(o => o.Items)
    .Include(o => o.Payments)
    .AsSingleQuery()  // Override global split behavior
    .ToListAsync();
```

### 权衡

| 行为 | 优点 | 缺点 |
|-----------|-------|-------|
| SplitQuery | 不会发生笛卡尔积爆炸，更适合大型集合 | 多次往返，可能存在一致性问题 |
| SingleQuery | 单次往返，具备事务一致性 | 多个集合会导致笛卡尔积爆炸 |

**建议**：全局默认使用 `SplitQuery`，对于已知单个查询效果更好的特定查询，使用 `AsSingleQuery()` 进行覆盖。

### 何时应优先使用 SingleQuery

- 小型且结构明确的导航图（2-3 层）
- 始终需要所有相关数据的查询
- 往返成本低于笛卡尔积爆炸成本的性能关键路径

### 何时优先使用 SplitQuery

- 导航关系图庞大或不可预测
- 多对多关系
- 查询加载的集合可能并非全部都需要

---

## 使用 EF Core 进行测试

### 内存提供程序（仅限单元测试）

```csharp
// Only for simple unit tests - doesn't match real database behavior
var options = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
    .Options;

using var context = new ApplicationDbContext(options);
```

### 使用 TestContainers 的真实数据库（集成测试）

有关正确进行数据库测试的方法，请参阅 `testcontainers-integration-tests` skill。

```csharp
// Use real PostgreSQL in container
var container = new PostgreSqlBuilder()
    .WithImage("postgres:16-alpine")
    .Build();

await container.StartAsync();

var options = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseNpgsql(container.GetConnectionString())
    .Options;
```