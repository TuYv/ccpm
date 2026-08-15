---
name: go-data-structures
description: >
  Correct use of Go's built-in data structures: slices (nil vs empty, append
  semantics, aliasing, preallocation), maps (comma-ok, sets, iteration order),
  arrays, and choosing between them.
  Use when: "slice vs array", "nil slice", "empty slice", "preallocate",
  "map iteration", "use a set in Go", "slice aliasing", "append gotcha",
  "copy a slice", "sync.Map or mutex".
  Do NOT use for: protecting structures shared across goroutines
  (use go-concurrency-review), allocation profiling (use go-performance-review),
  or generic container design (use go-design-patterns).
license: MIT
metadata:
  version: "1.0.0"
---
# Go 数据结构

切片和映射看似简单，却隐藏着这门语言中最棘手的陷阱。
以下规则可防止那些能够逃过代码审查的别名、nil 和迭代错误。

## 1. Nil 切片与空切片

```go
var a []int          // nil slice — len 0, cap 0, no allocation
b := []int{}         // empty slice — len 0, allocated header
c := make([]int, 0)  // empty slice — same as b
```

- `len`、`cap`、`range` 和 `append` 对这三者的处理完全相同。
- **优先使用 nil 切片**表示“没有元素”；不要仅仅为了返回“空”而进行分配。
- 例外情况：JSON。`nil` 会被序列化为 `null`，空切片则会被序列化为 `[]`。
  如果 API 契约要求 `[]`，请显式返回空切片。
- 切勿在逻辑中区分 nil 与空切片——应检查 `len(s) == 0`。

## 2. Append 语义与别名

`append` 可能返回相同的底层数组，也可能返回一个新数组。这两种情况
都会导致问题：

```go
// ❌ Bad — result may alias the input
func addSuffix(base []string) []string {
    return append(base, "suffix") // if cap(base) > len(base),
}                                 // this WRITES INTO base's array

// ✅ Good — force a copy when the input must not be touched
func addSuffix(base []string) []string {
    out := make([]string, len(base), len(base)+1)
    copy(out, base)
    return append(out, "suffix")
}
```

```go
// ❌ Bad — subslice keeps the whole 64 MB alive
func header(big []byte) []byte {
    return big[:512] // backing array is still the full big
}

// ✅ Good — copy the window you keep
func header(big []byte) []byte {
    return slices.Clone(big[:512]) // Go 1.21+; or copy() manually
}
```

规则：函数要么拥有一个切片，要么复制它。返回调用方切片的子切片，
或者向其中追加元素，都会隐式共享内存。

## 3. 预分配

当最终大小已知或存在上限时，只分配一次：

```go
// ✅ Good — one allocation
names := make([]string, 0, len(users))
for _, u := range users {
    names = append(names, u.Name)
}

// ❌ Bad — repeated growth and copying
var names []string
for _, u := range users {
    names = append(names, u.Name)
}
```

映射也是如此：`make(map[string]int, len(items))`。
大小未知时不要预分配——错误设置过大的 cap 会浪费
内存；对于冷路径，使用 `append` 自动扩容即可。

## 4. 映射基础

```go
// Comma-ok distinguishes "missing" from "zero value"
count, ok := hits[key]
if !ok { /* key absent */ }

// Zero value reads are safe; writes to a nil map PANIC
var m map[string]int
_ = m["x"]      // 0, fine
m["x"] = 1      // panic: assignment to entry in nil map — make() first

// Iteration order is RANDOM and differs between runs.
// Sort keys when output must be deterministic:
keys := slices.Sorted(maps.Keys(m)) // Go 1.23+
for _, k := range keys {
    fmt.Println(k, m[k])
}
```

- 映射值不可寻址：当值为结构体时，`m[k].Field = v` 无法通过编译。
  应使用指针映射，或者执行读取、修改、写回操作。
- 在 `range` 期间删除元素是安全的；在 `range` 期间插入元素的行为
  未指定（新键可能会被访问，也可能不会）。

## 5. 集合

惯用的集合实现是使用空结构体作为值的映射：

```go
seen := make(map[string]struct{}, len(items))
for _, it := range items {
    if _, dup := seen[it.ID]; dup {
        continue
    }
    seen[it.ID] = struct{}{}
    process(it)
}
```

`struct{}` 占用零字节；`map[string]bool` 也可以，并且当你要使用 `if seen[id]` 测试成员是否存在时，可读性更好。

## 6. 数组与切片

- 数组（`[4]byte`）是值：赋值和传递会复制整个数组。当元素可比较时，数组可以使用 `==` 进行比较。
- 对于具有值语义的固定大小数据，应使用数组：哈希（`[32]byte`）、IPv4 地址、固定矩阵、映射键。
- 其他所有情况都应使用切片。接收 `[100]int` 的函数每次调用都会复制 800 字节——这几乎总是错误的做法。

## 7. 选择数据结构

| 需求 | 使用 |
|---|---|
| 有序、可增长的集合 | `[]T` |
| 成员检查／去重 | `map[K]struct{}` |
| 键→值查找 | `map[K]V` |
| 固定大小、值语义、可比较 | `[N]T` 数组 |
| FIFO 队列（单个 goroutine） | 带头部索引的切片；频繁增删时使用 `container/list` |
| 栈 | 切片 + `append` / `s[:len(s)-1]` |
| 并发映射，键只写一次、读取多次 | `sync.Map`——否则使用互斥锁 + 映射 |

`sync.Map` 是适用于特殊场景的工具（仅追加缓存、不相交的键集合）。默认使用 `map` + `sync.RWMutex`；有关锁定模式，请参阅并发 skill。

## 验证清单

1. 不应有任何逻辑区分 nil 切片和空切片；使用 `len()` 判断是否为空
2. 面向 JSON 的切片在契约要求 `[]` 时应明确为空（而非 nil）
3. 不要对函数不拥有的切片执行 `append`；应显式进行复制
4. 不要在未使用 `slices.Clone`/`copy` 的情况下长期持有大型数组的子切片
5. 已知大小时，应为切片和映射预分配容量
6. 只要“缺失”与零值含义不同，就应使用 comma-ok
7. 不要向可能为 nil 的映射写入数据
8. 要生成确定性输出，应在迭代映射键之前对其排序
9. 集合应构建为 `map[K]struct{}`（或为提高可读性而使用 `map[K]bool`）
10. 仅在需要值语义或可比较性时使用数组