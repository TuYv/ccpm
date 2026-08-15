---
name: go-test-table-driven
description: >
  Deep dive on table-driven tests in Go: when to use them, when to avoid them,
  struct design, subtest naming, advanced patterns like test matrices and
  shared setup, and refactoring bloated tables into clean ones.
  Use when writing table-driven tests, refactoring test tables, reviewing
  table test structure, or deciding whether table-driven is the right approach.
  Trigger examples: "table-driven test", "table test", "test cases struct",
  "test matrix", "parametrize tests", "data-driven test", "refactor test table".
  Do NOT use for general test strategy, mocking, golden files, or fuzz testing
  (use go-test-quality). Do NOT use for benchmarks (use go-performance-review).
license: MIT
metadata:
  version: "1.1.0"
---
# Go 表驱动测试

表驱动测试是一种强大的 Go 惯用法——前提是使用得当。大多数代码库要么未能充分利用它们（10 个复制粘贴的测试），要么过度使用它们（在一个 200 行的结构体中包含复杂的分支逻辑）。本技能涵盖二者之间的最佳平衡点。

可按需加载的详细参考资料：

- `references/patterns.md` — 完整的实用示例：规范表格、
  `wantErr`/`wantErrIs`、并行表格、基于 map 的表格、仅错误
  表格，以及为提高可读性而进行的结构体对齐。
- `references/refactoring.md` — 识别臃肿的表格并将其重写为
  显式子测试，包含重写前后的示例。

仅当下方摘要不足以应对当前任务时，才读取参考文件。

## 1. 表驱动测试的适用场景

仅当以下所有条件都满足时才使用表格：

- 所有用例测试的是**同一个函数**
- **断言模式相同**——输入、输出、比较
- **用例之间仅数据不同**，而非设置或验证逻辑不同
- **至少 3 个用例**——少于 3 个时，显式测试更清晰

典型用例：纯函数、解析器、验证器、格式化器。

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

每个用例都具有相同的结构，循环体只有几行代码，并且添加一个用例只需新增一个结构体字面量。没有分支，也没有条件判断。

## 2. 不应使用表驱动测试的场景

- **每个用例都有复杂的设置逻辑**——结构体中的 `setupMock`/`setupFunc` 函数字段
  意味着表格隐藏了复杂性。应编写显式子测试。
- **少于 3 个用例**——结构体定义的代码量比两个普通测试函数
  还多。
- **存在多个分支路径**——循环体中的 `if tt.shouldError` / `if tt.wantRedirect`
  意味着每个分支其实都是不同的测试，只是假装共享同一种结构。
  应将其拆分。

有关每种代码异味重写前后的示例，请参阅 `references/refactoring.md`。

## 3. 结构体设计规则

1. **每个字段都必须在至少 2 个用例之间有所变化。** 如果某个字段在所有位置的
   值都相同，那么它属于设置逻辑——应将其移到表格之外。
2. **将 `name` 字段命名为描述场景的简短句子**：
   `"returns error for negative amount"`，而不是 `"case1"` 或 `"success"`。
3. **使用 `wantErr bool` 表示“是否应该出错？”**——先检查它，并在循环体中
   提前 `return`。
4. 当调用方必须检测某个特定错误时，**将 `wantErrIs error` 与哨兵错误配合使用**；
   使用 `require.ErrorIs` 进行断言。
5. **不超过 5 个字段。** 更多字段意味着场景对于表格而言过于复杂——
   应拆分为单独的测试函数。

完整的字段模式示例请参见 `references/patterns.md`。

## 4. 循环体必须保持简单

表驱动测试的要点是让每个用例使用完全相同的执行逻辑。
将循环体控制在约 10 行以内：调用、错误检查、比较。
如果循环体中不断增加条件判断或针对各用例的设置，那么表驱动测试已经超出了其适用范围——应将其重构为显式子测试。

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

- Go 1.22+ 会为每次迭代限定循环变量的作用域，因此无需使用 `tt := tt` 捕获变量。对于 Go <1.22，仍然需要进行捕获。
- 仅当被测函数没有副作用且不存在共享的可变状态时，才使用 `t.Parallel()`。

## 6. 重构臃肿的表驱动测试

| 症状 | 修复方法 |
|---|---|
| 结构体有 8 个以上字段 | 按场景拆分为多个测试函数 |
| 结构体中存在 `setupFunc` 字段 | 提取为具有显式设置逻辑的独立子测试 |
| 循环体中存在 `if tt.shouldX` | 每个分支都是不同的测试——将其拆分 |
| 每个用例中都有相同的 3 个字段 | 将其移到表外的共享设置中 |
| 添加一个用例需要理解其他所有用例 | 表驱动测试已超出其适用范围 |

## 决策流程图

1. **函数是否为纯函数（输入 → 输出，无副作用）？**
   是 → 表驱动测试可能是理想选择。转到第 2 步。
   否 → 优先考虑显式子测试。

2. **所有用例是否共享完全相同的断言模式？**
   是 → 使用表驱动测试。转到第 3 步。
   否 → 使用显式子测试。

3. **每个用例能否用不超过 5 个结构体字段表示？**
   是 → 使用表驱动测试。
   否 → 按场景拆分为单独的测试函数。

4. **循环体是否不超过 10 行？**
   是 → 一切就绪。
   否 → 表驱动测试正在掩盖复杂性。进行重构。

## 验证清单

1. 表结构体仅包含各用例之间会发生变化的字段
2. 每个用例都有描述性的 `name` 字段
3. 循环体不超过 10 行，且不包含分支
4. 结构体中没有 `setupFunc` 或 `mockFunc` 字段
5. `wantErr` 是简单的布尔值或哨兵值，而不是字符串匹配
6. 用例覆盖：正常路径、错误路径、边界情况（空值、nil、零值、最大值）
7. 使用 `t.Run` 包装每个用例，以创建具名子测试
8. 仅当函数无副作用时才使用 `t.Parallel()`