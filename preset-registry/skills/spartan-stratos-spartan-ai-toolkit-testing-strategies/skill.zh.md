---
name: testing-strategies
description: Testing patterns for Micronaut/Kotlin backend including repository tests, integration tests, and test data builders. Use when writing tests, setting up test infrastructure, or improving coverage.
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---
# 测试策略 — 快速参考

> 有关 @MicronautTest 配置、Retrofit 客户端设置以及连接池调优，请参阅 `integration-test-setup.md`。
>
> 有关包含 MockK、测试数据构建器和断言在内的完整代码模式，请参阅 `examples.md`。

## 集成测试

每个端点都需要一个集成测试。继承 `AbstractControllerTest`，使用来自 `module-client` 的 Retrofit 客户端，并在 `@AfterEach` 中用 `truncateAllTables()` 进行清理。

关键规则：
- **始终使用 Retrofit 客户端** — 绝不使用裸的 `HttpRequest`
- 通过 `accessToken()` 生成真实的 JWT 令牌
- 对完整的 HTTP 栈进行端到端测试，不 mock 管理器

## 测试命名

```kotlin
@Test
fun `{action} - {expected outcome}`() = runBlocking { }

// Examples:
fun `getEmployee - returns employee by id`() = runBlocking { }
fun `getEmployee - returns 404 when not found`() = runBlocking { }
fun `createEmployee - fails with 401 when not authenticated`() = runBlocking { }
```

## 每个端点必需的测试覆盖

1. **正常路径** — 基本的成功场景
2. **未找到** — 资源不存在时返回 404
3. **认证失败** — 无令牌时返回 401
4. **软删除** — 已删除的记录不会被返回

```kotlin
@Test
fun `getById - returns 404 when not found`() = runBlocking {
  val token = accessToken(prepareUser())
  assertThrows<HttpException> {
    runBlocking {
      client.getById(authorization = token, id = UUID.randomUUID())
    }
  }.also {
    assertThat(it.code()).isEqualTo(404)
  }
}
```

## 仓储测试

继承 `AbstractRepositoryTest`。每个仓储至少需要以下测试：

```kotlin
class DefaultEmployeeRepositoryTest : AbstractRepositoryTest() {

  private val repository = DefaultEmployeeRepository(database)

  @BeforeEach
  fun cleanup() { database.primary.truncateAllTables() }

  @Test
  fun `insert - happy path`() { }

  @Test
  fun `byId - returns entity when exists`() { }

  @Test
  fun `byId - returns null when not exists`() { }

  @Test
  fun `byId - returns null when soft deleted`() { }

  @Test
  fun `deleteById - soft deletes entity`() { }

  @Test
  fun `update - updates selected fields`() { }
}
```

## MockK 规则

- 使用 `mockk<T>()` 创建 mock
- 对挂起函数使用 `coEvery` / `coVerify`（而非 `every`/`verify`）
- 使用 `slot<T>()` + `capture()` 验证传递了哪些参数
- 使用来自 `kotlinx.coroutines.test` 的 `runTest { }` — 而非 `runBlocking`。`runTest` 会处理虚拟时间并捕获协程问题。
- 使用带注释的 AAA 模式：`// Given`、`// When`、`// Then`
- 使用 `@Nested` + `@DisplayName` 对相关测试进行分组

> 有关完整的 MockK 代码示例、`@Nested` 模式、测试数据构建器和 AssertJ 断言，请参阅 `examples.md`。

## 注意事项

**连接池耗尽：** 如果并行测试因 "cannot acquire connection" 而失败，请将 `maxPoolSize` 提高到 20。配置片段请参阅 `integration-test-setup.md`。

**MockK + 协程：** 对挂起函数务必使用 `coEvery`/`coVerify`。普通的 `every`/`verify` 无法生效，并会产生令人困惑的错误。

## 运行测试

```bash
./gradlew test                                                    # All tests
./gradlew test --tests "com.yourcompany.EmployeeControllerTest"   # One class
./gradlew :app:module-repository:test                             # One module
```
