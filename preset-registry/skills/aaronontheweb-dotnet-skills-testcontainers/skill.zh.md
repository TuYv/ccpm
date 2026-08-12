---
name: testcontainers-integration-tests
description: Write integration tests using TestContainers for .NET with xUnit. Covers infrastructure testing with real databases, message queues, and caches in Docker containers instead of mocks.
invocable: false
---
# 使用 TestContainers 进行集成测试

## 何时使用此 Skill

在以下情况使用此 Skill：
- 编写需要真实基础设施（数据库、缓存、消息队列）的集成测试
- 针对实际数据库测试数据访问层
- 验证消息队列集成
- 测试 Redis 缓存行为
- 避免对基础设施组件使用模拟
- 确保测试可在类似生产环境的环境中运行
- 测试数据库迁移和架构变更

## 参考文件

- [database-patterns.md](database-patterns.md)：SQL Server、PostgreSQL 和迁移测试示例
- [infrastructure-patterns.md](infrastructure-patterns.md)：Redis、RabbitMQ、多容器网络、容器复用和 Respawn

## 核心原则

1. **使用真实基础设施而非模拟** - 使用容器中的实际数据库/服务，而不是模拟
2. **测试隔离** - 每个测试使用全新的容器或全新的数据
3. **自动清理** - TestContainers 负责处理容器生命周期和清理
4. **快速启动** - 适当时，在同一个类的测试之间复用容器
5. **兼容 CI/CD** - 在启用 Docker 的 CI 环境中无缝运行
6. **端口随机化** - 容器使用随机端口以避免冲突

## 为什么选择 TestContainers 而不是模拟？

### 模拟基础设施存在的问题

```csharp
// BAD: Mocking a database
public class OrderRepositoryTests
{
    private readonly Mock<IDbConnection> _mockDb = new();

    [Fact]
    public async Task GetOrder_ReturnsOrder()
    {
        // This doesn't test real SQL behavior, constraints, or performance
        _mockDb.Setup(db => db.QueryAsync<Order>(It.IsAny<string>()))
            .ReturnsAsync(new[] { new Order { Id = 1 } });

        var repo = new OrderRepository(_mockDb.Object);
        var order = await repo.GetOrderAsync(1);

        Assert.NotNull(order);
    }
}
```

问题：无法测试实际的 SQL 查询、会遗漏约束/索引、带来错误的信心，也无法发现 SQL 语法错误。

### 更好的方式：使用 TestContainers 和真实数据库

```csharp
// GOOD: Testing against a real database
public class OrderRepositoryTests : IAsyncLifetime
{
    private readonly TestcontainersContainer _dbContainer;
    private IDbConnection _connection;

    public OrderRepositoryTests()
    {
        _dbContainer = new TestcontainersBuilder<TestcontainersContainer>()
            .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
            .WithEnvironment("ACCEPT_EULA", "Y")
            .WithEnvironment("SA_PASSWORD", "Your_password123")
            .WithPortBinding(1433, true)
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();
        var port = _dbContainer.GetMappedPublicPort(1433);
        var connectionString = $"Server=localhost,{port};Database=TestDb;User Id=sa;Password=Your_password123;TrustServerCertificate=true";
        _connection = new SqlConnection(connectionString);
        await _connection.OpenAsync();
        await RunMigrationsAsync(_connection);
    }

    public async Task DisposeAsync()
    {
        await _connection.DisposeAsync();
        await _dbContainer.DisposeAsync();
    }

    [Fact]
    public async Task GetOrder_WithRealDatabase_ReturnsOrder()
    {
        await _connection.ExecuteAsync(
            "INSERT INTO Orders (Id, CustomerId, Total) VALUES (1, 'CUST1', 100.00)");

        var repo = new OrderRepository(_connection);
        var order = await repo.GetOrderAsync(1);

        Assert.NotNull(order);
        Assert.Equal("CUST1", order.CustomerId);
        Assert.Equal(100.00m, order.Total);
    }
}
```

有关完整的 SQL Server、PostgreSQL 和迁移测试示例，请参阅 [database-patterns.md](database-patterns.md)。

有关 Redis、RabbitMQ、多容器网络、容器复用和 Respawn 数据库重置模式，请参阅 [infrastructure-patterns.md](infrastructure-patterns.md)。

## 必需的 NuGet 包

```xml
<ItemGroup>
  <PackageReference Include="Testcontainers" Version="*" />
  <PackageReference Include="xunit" Version="*" />
  <PackageReference Include="xunit.runner.visualstudio" Version="*" />

  <!-- Database-specific packages -->
  <PackageReference Include="Microsoft.Data.SqlClient" Version="*" />
  <PackageReference Include="Npgsql" Version="*" /> <!-- For PostgreSQL -->
  <PackageReference Include="MySqlConnector" Version="*" /> <!-- For MySQL -->

  <!-- Other infrastructure -->
  <PackageReference Include="StackExchange.Redis" Version="*" /> <!-- For Redis -->
  <PackageReference Include="RabbitMQ.Client" Version="*" /> <!-- For RabbitMQ -->
</ItemGroup>
```

## 最佳实践

1. **始终使用 IAsyncLifetime** - 正确执行异步设置和拆卸
2. **等待端口可用** - 使用 `WaitStrategy` 确保容器已就绪
3. **使用随机端口** - 让 TestContainers 自动分配端口
4. **在测试之间清理数据** - 使用新容器或截断表
5. **尽可能复用容器** - 比为每个测试创建新容器更快
6. **测试真实查询** - 不要只测试模拟对象；要验证实际的 SQL 行为
7. **验证约束** - 测试外键、唯一约束和索引
8. **测试事务** - 验证回滚和提交行为
9. **使用真实数据** - 使用与生产环境类似的数据量进行测试
10. **处理清理工作** - 始终在 `DisposeAsync` 中释放容器

## 常见问题及解决方案

### 容器启动超时

```csharp
_container = new TestcontainersBuilder<TestcontainersContainer>()
    .WithImage("postgres:latest")
    .WithWaitStrategy(Wait.ForUnixContainer()
        .UntilPortIsAvailable(5432)
        .WithTimeout(TimeSpan.FromMinutes(2)))
    .Build();
```

### 端口已被占用

始终使用随机端口映射：
```csharp
.WithPortBinding(5432, true) // true = assign random public port
```

### 容器未被清理

确保正确释放：
```csharp
public async Task DisposeAsync()
{
    await _connection?.DisposeAsync();
    await _container?.DisposeAsync();
}
```

### 测试在 CI 中失败但在本地通过

确保 CI 支持 Docker：
```yaml
# GitHub Actions
runs-on: ubuntu-latest # Has Docker pre-installed
```

## CI/CD 集成

### GitHub Actions

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 9.0.x

    - name: Run Integration Tests
      run: |
        dotnet test tests/YourApp.IntegrationTests \
          --filter Category=Integration \
          --logger trx

    - name: Cleanup Containers
      if: always()
      run: docker container prune -f
```

## 性能提示

1. **复用容器** - 在同一个集合的测试之间共享夹具
2. **使用 Respawn** - 无需重新创建容器即可重置数据
3. **并行执行** - TestContainers 会自动处理端口冲突
4. **使用轻量级镜像** - Alpine 版本体积更小、速度更快
5. **缓存镜像** - Docker 会在本地缓存已拉取的镜像