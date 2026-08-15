---
name: go-test-quality
description: >
  Go testing patterns for production-grade code: subtests, test helpers, fixtures,
  golden files, httptest, testcontainers, property-based testing, and fuzz testing.
  Covers mocking strategies, test isolation, coverage analysis, and test design philosophy.
  Use when writing tests, improving coverage, reviewing test quality,
  setting up test infrastructure, or choosing a testing approach.
  Trigger examples: "add tests", "improve coverage", "write tests for this",
  "test helpers", "mock this dependency", "integration test", "fuzz test".
  Do NOT use for performance benchmarking methodology (use go-performance-review),
  security testing (use go-security-audit), or table-driven test patterns
  specifically (use go-test-table-driven).
license: MIT
metadata:
  version: "1.1.0"
---
# Go 测试质量

测试是生产代码。它们会在 CI 中随每次提交运行，它们记录了行为，
而且当某个函数在凌晨 3 点出故障时，它们是你首先阅读的内容。
请像编写处理资金的代码一样谨慎地编写测试。

可按需加载的详细参考资料：

- `references/helpers-and-fixtures.md` — 测试辅助函数、带选项的工厂函数、
  `t.Cleanup`、黄金文件、模拟实现。
- `references/integration-testing.md` — httptest recorder 和 server、
  testcontainers、构建标签、`TestMain`、模糊测试。

仅当以下摘要不足以满足需要时，才阅读参考文件。

## 1. 测试设计理念

### 测试行为，而非实现

```go
// ✅ Good — tests what the function DOES
func TestTransferFunds_InsufficientBalance(t *testing.T) {
    from := NewAccount("alice", 100)
    to := NewAccount("bob", 0)

    err := TransferFunds(from, to, 150)

    require.ErrorIs(t, err, ErrInsufficientFunds)
    assert.Equal(t, 100, from.Balance(), "sender balance should be unchanged")
    assert.Equal(t, 0, to.Balance(), "receiver balance should be unchanged")
}

// ❌ Bad — tests HOW the function does it
// asserts debit() was called before credit(), rollback() was called,
// internal mutex was locked — breaks on every refactor
```

### 每个逻辑概念对应一个断言

当多个 `assert` 调用验证的是同一行为的不同方面时（例如转账后两个账户的状态），
使用多个 `assert` 没有问题。一个同时检查创建、更新和删除的测试，
其实是三个伪装成一个的测试。

### 像写缺陷报告一样命名测试

当测试失败时，仅凭名称就应该能说明哪里出了问题：

```go
// ✅ Good — reads like a sentence
func TestOrderService_Cancel_RefundsPartiallyShippedItems(t *testing.T) { ... }
func TestParseConfig_ReturnsErrorOnMissingRequiredField(t *testing.T) { ... }

// ❌ Bad — says nothing useful
func TestCancel(t *testing.T) { ... }
func TestRateLimiter_Success(t *testing.T) { ... }
```

## 2. 使用子测试组织场景

使用 `t.Run` 将相关场景归入一个父测试。每个子测试都有自己的设置、
自己的失败结果，并且在 CI 输出中有自己的名称：

```go
func TestUserService_Create(t *testing.T) {
    svc := setupUserService(t)

    t.Run("succeeds with valid input", func(t *testing.T) {
        user, err := svc.Create(ctx, CreateUserInput{Name: "Alice", Email: "alice@example.com"})
        require.NoError(t, err)
        assert.NotEmpty(t, user.ID)
    })

    t.Run("rejects duplicate email", func(t *testing.T) {
        _, _ = svc.Create(ctx, CreateUserInput{Name: "Alice", Email: "taken@example.com"})
        _, err := svc.Create(ctx, CreateUserInput{Name: "Bob", Email: "taken@example.com"})
        require.ErrorIs(t, err, ErrDuplicateEmail)
    })
}
```

## 3. 测试辅助函数规则

1. 在测试工具函数中**始终调用 `t.Helper()`**，这样失败信息会指向
   调用方，而不是辅助函数。
2. 对复杂测试对象使用**带函数式选项的工厂函数**——
   提供默认值，并允许各测试单独覆盖；绝不要使用包含 15 个参数的构造函数。
3. **优先使用 `t.Cleanup`，而不是 `defer`**——它即使在 `t.FailNow()`
   之后也会运行，并且其作用域属于测试，而不是函数。

完整实现见 `references/helpers-and-fixtures.md`。

## 4. 选择测试类型

| 场景 | 方法 | 详情 |
|---|---|---|
| 纯函数，有 3 个以上数据用例 | 表驱动测试 | go-test-table-driven 技能 |
| 单独测试 HTTP 处理器 | `httptest.NewRecorder` + 模拟存储 | `references/integration-testing.md` |
| 完整的路由/中间件栈 | `httptest.NewServer` | `references/integration-testing.md` |
| 真实的数据库行为 | testcontainers + 构建标签 | `references/integration-testing.md` |
| 复杂输出（JSON、HTML、SQL） | `testdata/` 中的黄金文件 | `references/helpers-and-fixtures.md` |
| 处理不可信输入的解析器/验证器 | 模糊测试 | `references/integration-testing.md` |

## 5. 模拟规则

- 对于小型接口（≤3 个方法），使用**基于接口的手写模拟对象**：
  一个包含函数字段并记录调用的结构体。
- 对于简单的接缝，使用**函数注入**（`now func() time.Time`）。
- **不要模拟：**值对象、纯函数、标准库，或
  同一包中的自有代码。应测试真实实现。
- 如果模拟一切，你测试的就是模拟对象，而不是自己的代码。

## 6. 并行与覆盖率

```go
func TestSlugify(t *testing.T) {
    t.Parallel() // safe: pure function, no shared state
    // ...
}
```

当测试共享可变状态、数据库、文件或进程级状态（`os.Setenv`）时，
不要使用 `t.Parallel()`。

```bash
go test -race -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
```

**目标：**业务逻辑 80% 以上，关键路径（身份验证、支付）95% 以上，
处理器 70% 以上。不要为了生成代码和简单的 getter 追求 100% 覆盖率。

## 反模式

- 🔴 没有断言的测试——始终通过，什么也证明不了
- 🔴 使用 `time.Sleep` 进行同步——应使用通道或轮询
- 🔴 测试依赖执行顺序——每个测试都必须能够独立运行
- 🔴 模拟一切——最终测试的是模拟对象，而不是自己的代码
- 🟡 使用 `Test1`、`TestSuccess` 之类的测试名称——名称应描述场景
- 🟡 直接访问私有字段——应通过公共 API 进行测试
- 🟡 没有边界情况：空值、nil、零值、最大值、Unicode
- 🟡 庞大的共享初始化——每个测试应该只设置自身所需的内容
- 🟢 对任何接收不可信输入的代码进行模糊测试
- 🟢 使用黄金文件比较复杂输出

## 验证清单

1. 每个测试都有有意义的断言（不存在空测试体）
2. 测试名称描述场景，而不是方法
3. 每个测试工具函数中都调用了 `t.Helper()`
4. 使用 `t.Cleanup()` 清理资源
5. 在安全的情况下使用 `t.Parallel()`，在不安全的情况下避免使用
6. 使用 `testing.Short()` 或构建标签保护集成测试
7. 模拟对象保持最小化——只模拟外部依赖
8. 覆盖边界情况：空值、nil、零值、边界值
9. `go test -race ./...` 通过
10. 覆盖率有实际意义，而不只是数字很高