---
name: go-test-quality
description: >
  Go testing patterns for production-grade code: subtests, test helpers,
  fixtures, golden files, httptest, testcontainers, fuzz testing, and
  testing/synctest. Covers mocking strategies, test isolation, coverage
  analysis, and test design philosophy. Use when writing tests, improving
  coverage, reviewing test quality, setting up test infrastructure, or
  choosing a testing approach. Trigger examples: "add tests", "improve
  coverage", "write tests for this", "test helpers", "mock this dependency",
  "integration test", "fuzz test", "flaky test", "synctest", "goroutine leak
  in tests".
  Not for: benchmarking methodology (go-performance-review), security
  testing (go-security-audit), table-driven patterns (go-test-table-driven).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Container-based integration tests require Docker.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.4.1"
---
# Go 测试质量

测试就是生产代码。它们会在每次提交时于 CI 中运行，记录行为，也是凌晨 3 点某个函数出问题时你首先会阅读的内容。  
请以对待处理资金的代码时同样的严谨态度来编写测试。

按需加载的详细参考资料：

- `references/helpers-and-fixtures.md` — 测试辅助函数、带选项的工厂函数、
  `t.Cleanup`、golden 文件、mock 实现。
- `references/integration-testing.md` — `httptest` recorder 和 server、
  testcontainers、构建标签、`TestMain`、模糊测试。

仅当下面的摘要不足以解决问题时，才阅读参考文件。

## 1. 测试设计理念

### 测试行为，而不是实现

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

当多个 `assert` 调用用于验证同一行为的不同方面时（例如转账后两个账户的状态），这样做没有问题。一个同时检查创建、更新和删除的测试，其实是三个伪装成一个的测试。

### 像描述 bug 一样命名测试

测试失败时，仅看名称就应该能知道哪里出了问题：

```go
// ✅ Good — reads like a sentence
func TestOrderService_Cancel_RefundsPartiallyShippedItems(t *testing.T) { ... }
func TestParseConfig_ReturnsErrorOnMissingRequiredField(t *testing.T) { ... }

// ❌ Bad — says nothing useful
func TestCancel(t *testing.T) { ... }
func TestRateLimiter_Success(t *testing.T) { ... }
```

## 2. 使用子测试组织场景

使用 `t.Run` 将相关场景归 agrupate 在父测试下。每个子测试都有自己的设置、独立的失败信息，以及在 CI 输出中的独立名称：

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

1. **始终在测试工具函数中调用 `t.Helper()`**，这样失败信息会指向调用方，而不是辅助函数。
2. **对于复杂的测试对象，使用带函数选项的工厂函数** — 提供默认值，并允许每个测试单独覆盖，绝不要使用包含 15 个参数的构造函数。
3. **优先使用 `t.Cleanup`，而不是 `defer`** — 即使在 `t.FailNow()` 之后它也会运行，并且其作用域限定于测试，而不是函数。

完整实现见 `references/helpers-and-fixtures.md`。

## 4. 选择测试类型

| 情况 | 方法 | 详情 |
|---|---|---|
| 纯函数，3 个以上数据用例 | 表驱动测试 | go-test-table-driven skill |
| 独立的 HTTP 处理器 | `httptest.NewRecorder` + mock store | `references/integration-testing.md` |
| 完整的路由/中间件栈 | `httptest.NewServer` | `references/integration-testing.md` |
| 真实数据库行为 | testcontainers + 构建标签 | `references/integration-testing.md` |
| 复杂输出（JSON、HTML、SQL） | `testdata/` 中的 Golden 文件 | `references/helpers-and-fixtures.md` |
| 针对不可信输入的解析器/验证器 | 模糊测试 | `references/integration-testing.md` |

## 5. Mock 规则

- 对于小型接口（≤3 个方法），使用**基于接口的手写 mock**：
  一个包含函数字段和调用记录的结构体。
- 对于简单的接缝使用**函数注入**（`now func() time.Time`）。
- **不要 mock：**值对象、纯函数、标准库，或
  同一包中的自有代码。测试真实实现。
- 如果你 mock 了所有东西，那么你测试的是 mock，而不是代码。

## 6. 并行性与覆盖率

```go
func TestSlugify(t *testing.T) {
    t.Parallel() // safe: pure function, no shared state
    // ...
}
```

当测试共享可变状态、数据库、
文件或进程级状态（`os.Setenv`）时，不要使用 `t.Parallel()`。

```bash
go test -race -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
```

**目标：**业务逻辑 80%+，关键路径（认证、支付）95%+，
处理器 70%+。不要追求生成代码和简单 getter 的 100% 覆盖率。

## 7. 测试并发代码

永远不要使用 `time.Sleep` 同步测试。它在生效时很慢，
在不生效时又很不稳定。

`testing/synctest`（Go 1.25+）会在带有虚拟时钟的 bubble 中运行测试。
只要 bubble 中的每个 goroutine 都被阻塞，时间就会立即推进，因此
一个一小时的超时测试会在微秒内完成，并且结果是确定的。

```go
import "testing/synctest"

func TestCacheExpiry(t *testing.T) {
    synctest.Test(t, func(t *testing.T) {
        c := NewCache(time.Hour)
        c.Set("k", "v")

        time.Sleep(59 * time.Minute) // instant: fake clock
        if _, ok := c.Get("k"); !ok {
            t.Fatal("entry expired early")
        }

        time.Sleep(2 * time.Minute)
        if _, ok := c.Get("k"); ok {
            t.Fatal("entry outlived its TTL")
        }
    })
}
```

`synctest.Wait()` 会阻塞，直到 bubble 中所有其他 goroutine 都已被持久阻塞
——使用它来替代休眠，以便让后台 goroutine 到达一个
已知位置。

在 Go 1.24 中，该包位于 `GOEXPERIMENT=synctest` 之后，入口点是
`synctest.Run`。低于 1.24 时，使用带截止时间的轮询来代替休眠。

### 在测试中检测 goroutine 泄漏

泄漏 goroutine 的测试会在本地通过，却会让整个测试套件变得不稳定。

```go
import "go.uber.org/goleak"

// Whole package, in TestMain:
func TestMain(m *testing.M) { goleak.VerifyTestMain(m) }

// Or per test:
func TestWorker(t *testing.T) {
    defer goleak.VerifyNone(t)
    // ... every goroutine started here must exit before the test returns
}
```

将其添加到任何会启动 goroutine 的包中。`go test -race` 可以发现数据竞争；但它无法发现永远不会退出的 goroutine。

## 8. 测试上下文、基准测试与产物

使用 `t.Context()`（Go 1.24+）而不是 `context.Background()`。它会在 `t.Cleanup` 函数运行前被取消，因此任何阻塞在该上下文上的操作都会在测试结束时解除阻塞——包括测试超时或失败的情况。

```go
func TestFetch(t *testing.T) {
    ctx := t.Context()
    got, err := client.Fetch(ctx, "id-1") // cancelled automatically at test end
    // ...
}
```

使用 `for b.Loop()`（Go 1.24+）编写基准测试，而不是 `for range b.N`。它只运行一次初始化代码，无需 sink 变量即可让参数和结果保持存活，并且不会被优化掉。

```go
// ✅ Go 1.24+
func BenchmarkEncode(b *testing.B) {
    in := makeInput()
    for b.Loop() {
        Encode(in)
    }
}

// ❌ Pre-1.24 form — needs a package-level sink to defeat dead-code elimination
func BenchmarkEncode(b *testing.B) {
    in := makeInput()
    for range b.N {
        sink = Encode(in)
    }
}
```

使用 `b.ReportAllocs()` 报告分配情况，并使用 `benchstat` 比较运行结果。

在工具链支持时，还可以使用以下两个较新的报告钩子：

- `t.Attr("build", sha)`（Go 1.25+）会将键值对写入测试日志，供 CI 解析。
- `t.ArtifactDir()` 配合 `go test -artifacts`（Go 1.26+）可以为测试提供一个在运行结束后仍会保留的目录——将失败的 golden 输出、捕获的 HTTP 响应体或性能分析文件写入那里，而不是写入代码仓库。

## 反模式

- 🔴 没有断言的测试——总是通过，什么也证明不了
- 🔴 使用 `time.Sleep` 进行同步——使用 `testing/synctest`、channel 或轮询
- 🔴 测试依赖执行顺序——每个测试都必须能够独立运行
- 🔴 对所有内容进行模拟——最终测试的是模拟对象，而不是你的代码
- 🟡 使用 `Test1`、`TestSuccess` 之类的测试名称——应命名具体场景
- 🟡 访问私有字段——应通过公共 API 进行测试
- 🟡 没有边界情况：空值、nil、零值、最大值、unicode
- 🟡 巨大的共享初始化代码——每个测试只应初始化自身所需的内容
- 🟢 对任何接收不可信输入的代码进行模糊测试
- 🟢 对复杂输出比较使用 golden 文件
- 🟡 测试中使用 `context.Background()`——使用 `t.Context()`
- 🟡 在 Go 1.24+ 中使用 `for range b.N`——使用 `for b.Loop()`

## 验证清单

1. 每个测试都有有意义的断言（不存在空的测试函数体）
2. 测试名称描述具体场景，而不是方法
3. 每个测试工具函数都调用 `t.Helper()`
4. 使用 `t.Cleanup()` 清理资源
5. 在安全的地方使用 `t.Parallel()`，不安全时避免使用
6. 使用 `testing.Short()` 或构建标签保护集成测试
7. 模拟对象保持最小化——只模拟外部依赖
8. 测试套件中的任何地方都不使用 `time.Sleep` 进行同步
9. 会启动 goroutine 的包使用 `goleak` 进行验证
10. 基准测试使用 `for b.Loop()` 并调用 `b.ReportAllocs()`
8. 覆盖边界情况：空值、nil、零值、边界值
9. `go test -race ./...` 通过
10. 覆盖率应具有实际意义，而不只是数字较高