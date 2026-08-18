---
name: go-test-table-driven
description: >
  Deep dive on table-driven tests in Go: when to use them, when to avoid
  them, struct design, subtest naming, advanced patterns like test matrices
  and shared setup, and refactoring bloated tables into clean ones. Use when
  writing table-driven tests, refactoring test tables, reviewing table test
  structure, or deciding whether table-driven is the right approach. Trigger
  examples: "table-driven test", "table test", "test cases struct", "test
  matrix", "parametrize tests", "data-driven test", "refactor test table".
  Not for: general test strategy, mocks, golden files, fuzzing
  (go-test-quality), benchmarks (go-performance-review).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.2.1"
---
# Go 表驱动测试

表驱动测试是强大的 Go 惯用法，但前提是使用得当。大多数代码库要么没有充分使用它们（10 个复制粘贴的测试），要么过度使用它们（一个 200 行 struct 中包含复杂的分支逻辑）。本技能涵盖了恰当的使用场景。

按需加载的详细参考资料：

- `references/patterns.md` — 完整的可运行示例：规范表格、`wantErr`/`wantErrIs`、并行表格、基于 map 的表格、仅错误表格、为提升可读性而进行的 struct 对齐。
- `references/refactoring.md` — 识别臃肿的表格，并将其重写为显式子测试，包含重构前后的示例。

仅当以下摘要不足以应对当前任务时，才读取参考文件。

## 1. 表驱动测试适用的场景

仅当以下条件全部满足时才使用表格：

- 所有用例测试的是**同一个函数**
- 使用**相同的断言模式** — 输入，输出，比较
- **用例仅数据不同**，而不是设置或验证逻辑不同
- **3 个及以上用例** — 少于 3 个时，显式测试更清晰

典型使用场景：纯函数、解析器、验证器、格式化器。

```go
func TestParseSize(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    int64
        wantErr bool
    }{
        {name: "plain bytes", input: "1024", want: 1024},
        {name: "kilobytes suffix", input: "4KB", want: 4096},
        {name: "empty string", input: "", wantErr: true},
        {name: "negative size", input: "-1", wantErr: true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParseSize(tt.input)
            if tt.wantErr {
                require.Error(t, err)
                return
            }
            require.NoError(t, err)
            assert.Equal(t, tt.want, got)
        })
    }
}
```

每个用例都具有相同的形态，循环体只有几行，新增一个用例只需添加一个 struct 字面量。没有分支，没有条件判断。

## 2. 不应使用表驱动测试的场景

- **复杂的按用例设置** — struct 中的 `setupMock`/`setupFunc` 函数字段意味着表格正在隐藏复杂性。应编写显式子测试。
- **少于 3 个用例** — struct 定义的代码量超过了两个普通测试函数。
- **多个分支路径** — 循环体中的 `if tt.shouldError` / `if tt.wantRedirect` 意味着每个分支都是一个假装共享结构的不同测试。应将它们拆分。

请参阅 `references/refactoring.md`，了解针对每种坏味道的重构前后改写示例。

## 3. Struct 设计规则

1. **每个字段必须至少在 2 个用例之间发生变化。** 值在所有用例中都相同的字段属于设置内容，应移到表格之外。
2. 将 `name` 字段命名为描述场景的**简短句子**：`"returns error for negative amount"`，而不是 `"case1"` 或 `"success"`。
3. **对于“是否应报错？”使用 `wantErr bool`** — 先检查它，并在循环体中尽早 `return`。
4. 当调用方必须检测特定错误时，使用带有哨兵值的 **`wantErrIs error`**；使用 `require.ErrorIs` 进行断言。
5. **≤5 个字段。** 更多字段意味着场景对表格来说过于复杂 — 应拆分为独立的测试函数。

完整的字段模式示例位于 `references/patterns.md`。

## 4. 循环体必须保持简单

表驱动测试的核心是每个用例采用完全相同的执行逻辑。
将循环体控制在约 10 行以内：调用、错误检查、比较。
如果其中不断累积条件分支或针对单个用例的设置，说明这个表格已经超出
其适用范围，应重构为明确的子测试。

## 5. 并行表驱动测试

```go
for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        got := Transform(tt.input)
        assert.Equal(t, tt.want, got)
    })
}
```

- Go 1.22+ 会在每次迭代中为循环变量创建作用域，因此无需进行 `tt := tt` 捕获。
  对于 Go <1.22，仍然需要该捕获。
- 仅当被测函数没有副作用且不存在共享的可变状态时，才使用 `t.Parallel()`。

## 6. 重构臃肿的表格

| 症状 | 修复方式 |
|---|---|
| 结构体包含 8 个以上字段 | 按场景拆分为多个测试函数 |
| 结构体中有 `setupFunc` 字段 | 提取为具有明确设置步骤的独立子测试 |
| 循环体中存在 `if tt.shouldX` | 每个分支都是不同的测试，应将其拆分 |
| 每个用例中相同的 3 个字段完全一致 | 移至表格外的共享设置中 |
| 新增一个用例时必须理解其他所有用例 | 表格已超出其有效生命周期 |

## 决策流程图

1. **函数是否为纯函数（输入 → 输出，无副作用）？**
   是 → 表驱动测试可能是理想选择。进入第 2 步。
   否 → 先考虑明确的子测试。

2. **所有用例是否共享完全相同的断言模式？**
   是 → 使用表驱动测试。进入第 3 步。
   否 → 使用明确的子测试。

3. **每个用例能否用 ≤5 个结构体字段表达？**
   是 → 使用表驱动测试。
   否 → 按场景拆分为独立的测试函数。

4. **循环体是否 ≤10 行？**
   是 → 一切就绪。
   否 → 表格正在隐藏复杂性。进行重构。

## 验证清单

1. 表格结构体仅包含在各用例之间变化的字段
2. 每个用例都具有描述性的 `name` 字段
3. 循环体不超过 10 行，且没有分支
4. 结构体中没有 `setupFunc` 或 `mockFunc` 字段
5. `wantErr` 是简单的布尔值或哨兵值，而非字符串匹配
6. 用例覆盖：正常路径、错误路径、边界情况（空、nil、零、最大值）
7. `t.Run` 包装每个用例以创建具名子测试
8. 仅当函数无副作用时使用 `t.Parallel()`