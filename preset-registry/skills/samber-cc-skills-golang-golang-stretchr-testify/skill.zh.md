---
name: golang-stretchr-testify
description: "Comprehensive guide to stretchr/testify for Golang testing. Covers assert, require, mock, and suite packages in depth. Use when writing tests with testify, creating mocks, setting up test suites, or choosing between assert and require. Covers testify assertions, mock expectations, argument matchers, call verification, suite lifecycle, and advanced patterns like Eventually, JSONEq, and custom matchers. Apply when the codebase imports github.com/stretchr/testify."
user-invocable: true
license: MIT
compatibility: Designed for Claude Code, Codex or similar harness, and for projects using Golang.
metadata:
  author: samber
  version: "1.3.1"
  openclaw:
    emoji: "✅"
    homepage: https://github.com/samber/cc-skills-golang
    requires:
      bins:
        - go
        - gotests
    install:
      - kind: go
        package: github.com/cweill/gotests/...@latest
        bins: [gotests]
    skill-library-version: "1.11.1"
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(golangci-lint:*) Bash(git:*) Agent WebFetch mcp__context7__resolve-library-id mcp__context7__query-docs Bash(gotests:*) AskUserQuestion Bash(godig:*) Bash(gopls:*) LSP mcp__gopls__*
paths:
  - "**/*.go"
---
**角色设定：** 你是一名把测试当作可执行规格说明的 Go 工程师。你编写测试是为了约束行为、让失败自解释——而不是为了凑覆盖率指标。

**模式：**

- **编写模式** — 向代码库添加新的测试或 mock。
- **评审模式** — 审计现有测试代码中是否存在对 testify 的误用。

# stretchr/testify

testify 通过易读的断言、mock 和套件补充了 Go 的 `testing` 包。它并不取代 `testing` —— 始终以 `*testing.T` 作为入口。

本技能内容并不详尽——更多信息请参阅库文档和代码示例：

- 如需 Go 包文档、符号、版本、导入方和已知漏洞，→ 参见 `samber/cc-skills-golang@golang-pkg-go-dev` 技能（`godig`）；就 Go 包的事实信息而言，优先于 Context7。
- 如需在你自己的代码中导航该库的用法（定义、调用点、诊断信息），→ 参见 `samber/cc-skills-golang@golang-gopls` 技能（`gopls`）。
- 对于 pkg.go.dev 上未索引的文档，Context7 仍是备选方案。

## assert vs require

两者提供完全相同的断言，区别在于失败时的行为：

- **assert**：记录失败并继续执行 —— 可一次性看到所有失败
- **require**：调用 `t.FailNow()` —— 用于继续执行会导致 panic 或产生误导的前置条件

为了可读性，使用 `assert.New(t)` / `require.New(t)`。将它们命名为 `is` 和 `must`：

```go
func TestParseConfig(t *testing.T) {
    is := assert.New(t)
    must := require.New(t)

    cfg, err := ParseConfig("testdata/valid.yaml")
    must.NoError(err)    // stop if parsing fails — cfg would be nil
    must.NotNil(cfg)

    is.Equal("production", cfg.Environment)
    is.Equal(8080, cfg.Port)
    is.True(cfg.TLS.Enabled)
}
```

**规则**：前置条件（setup、错误检查）用 `require`，验证用 `assert`。切勿随意混用。

## 核心断言

```go
is := assert.New(t)

// Equality
is.Equal(expected, actual)              // DeepEqual + exact type
is.NotEqual(unexpected, actual)
is.EqualValues(expected, actual)        // converts to common type first
is.EqualExportedValues(expected, actual)

// Nil / Bool / Emptiness
is.Nil(obj)                  is.NotNil(obj)
is.True(cond)                is.False(cond)
is.Empty(collection)         is.NotEmpty(collection)
is.Len(collection, n)

// Contains (strings, slices, map keys)
is.Contains("hello world", "world")
is.Contains([]int{1, 2, 3}, 2)
is.Contains(map[string]int{"a": 1}, "a")

// Comparison
is.Greater(actual, threshold)     is.Less(actual, ceiling)
is.Positive(val)                  is.Negative(val)
is.Zero(val)

// Errors
is.Error(err)                     is.NoError(err)
is.ErrorIs(err, ErrNotFound)      // walks error chain
is.ErrorAs(err, &target)
is.ErrorContains(err, "not found")

// Type
is.IsType(&User{}, obj)
is.Implements((*io.Reader)(nil), obj)
```

**参数顺序**：始终为 `(expected, actual)` —— 交换顺序会产生令人困惑的 diff 输出。

## 高级断言

```go
is.ElementsMatch([]string{"b", "a", "c"}, result)             // unordered comparison
is.InDelta(3.14, computedPi, 0.01)                            // float tolerance
is.JSONEq(`{"name":"alice"}`, `{"name": "alice"}`)             // ignores whitespace/key order
is.WithinDuration(expected, actual, 5*time.Second)
is.Regexp(`^user-[a-f0-9]+$`, userID)

// Async polling
is.Eventually(func() bool {
    status, _ := client.GetJobStatus(jobID)
    return status == "completed"
}, 5*time.Second, 100*time.Millisecond)

// Async polling with rich assertions
is.EventuallyWithT(func(c *assert.CollectT) {
    resp, err := client.GetOrder(orderID)
    assert.NoError(c, err)
    assert.Equal(c, "shipped", resp.Status)
}, 10*time.Second, 500*time.Millisecond)
```

## testify/mock

对接口进行 mock，以隔离被测单元。嵌入 `mock.Mock`，用 `m.Called()` 实现方法，并始终通过 `AssertExpectations(t)` 进行验证。

关键匹配器：`mock.Anything`、`mock.AnythingOfType("T")`、`mock.MatchedBy(func)`。调用修饰符：`.Once()`、`.Times(n)`、`.Maybe()`、`.Run(func)`。

有关 mock 的定义、参数匹配器、调用修饰符、返回序列以及验证，参见 [Mock 参考](./references/mock.md)。

## testify/suite

套件将相关测试分组，并共享 setup/teardown。

### 生命周期

```
SetupSuite()    → once before all tests
  SetupTest()   → before each test
    TestXxx()
  TearDownTest() → after each test
TearDownSuite() → once after all tests
```

### 示例

```go
type TokenServiceSuite struct {
    suite.Suite
    store   *MockTokenStore
    service *TokenService
}

func (s *TokenServiceSuite) SetupTest() {
    s.store = new(MockTokenStore)
    s.service = NewTokenService(s.store)
}

func (s *TokenServiceSuite) TestGenerate_ReturnsValidToken() {
    s.store.On("Save", mock.Anything, mock.Anything).Return(nil)
    token, err := s.service.Generate("user-42")
    s.NoError(err)
    s.NotEmpty(token)
    s.store.AssertExpectations(s.T())
}

// Required launcher
func TestTokenServiceSuite(t *testing.T) {
    suite.Run(t, new(TokenServiceSuite))
}
```

`s.Equal()` 之类的套件方法行为类似 `assert`。如需 require：`s.Require().NotNil(obj)`。

## 常见错误

- **忘记 `AssertExpectations(t)`** —— 未经验证时，mock 的预期会静默通过
- **`is.Equal(ErrNotFound, err)`** —— 遇到被包装的错误时会失败。使用 `is.ErrorIs` 遍历错误链
- **参数顺序颠倒** —— testify 假定参数顺序为 `(expected, actual)`。颠倒会产生反向的 diff
- **用 `assert` 做守卫检查** —— 测试失败后仍继续执行，并在 nil 解引用时 panic。应使用 `require`
- **缺少 `suite.Run()`** —— 没有这个启动函数，会静默地一个测试都不执行
- **比较指针** —— `is.Equal(ptr1, ptr2)` 比较的是地址。请解引用或使用 `EqualExportedValues`

## Linter

使用 `testifylint` 来捕捉错误的参数顺序、assert/require 误用等问题。参见 `samber/cc-skills-golang@golang-lint` 技能。

## 交叉引用

- → 通用测试模式、表驱动测试（table-driven tests）与 CI，参见 `samber/cc-skills-golang@golang-testing` 技能
- → testifylint 配置，参见 `samber/cc-skills-golang@golang-lint` 技能
