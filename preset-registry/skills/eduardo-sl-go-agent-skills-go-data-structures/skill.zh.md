---
name: go-data-structures
description: >
  Correct use of Go's built-in data structures: slices (nil vs empty, append
  semantics, aliasing, preallocation), maps (comma-ok, sets, iteration
  order), arrays, and choosing between them. Use when: "slice vs array",
  "nil slice", "empty slice", "preallocate", "map iteration", "use a set in
  Go", "slice aliasing", "append gotcha", "copy a slice", "sync.Map or
  mutex".
  Not for: structures shared across goroutines (go-concurrency-review),
  allocation profiling (go-performance-review), generic containers
  (go-design-patterns).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go 数据结构

切片和映射看似简单，却隐藏着这门语言中最棘手的问题。
以下规则可以避免那些能够逃过代码审查的别名、`nil` 和迭代错误。

## 1. Nil 切片与空切片

```go
var a []int          // nil slice — len 0, cap 0, no allocation
b := []int{}         // empty slice — len 0, allocated header
c := make([]int, 0)  // empty slice — same as b
```

- `len`、`cap`、`range` 和 `append` 对这三者的处理完全相同。
- **优先使用 nil 切片**作为“没有元素”的值；不要仅仅为了返回“空”而进行分配。
- 例外情况：JSON。`nil` 会被编码为 `null`，空切片会被编码为 `[]`。
  如果 API 契约要求返回 `[]`，则应显式返回空切片。
- 逻辑中绝不要区分 nil 和空切片——检查 `len(s) == 0` 即可。

## 2. Append 语义与别名

`append` 可能返回同一个底层数组，也可能返回一个新数组。这两种情况
都可能带来问题：

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

规则：一个函数要么拥有一个切片，要么复制它。返回调用者切片的子切片，
或向调用者切片追加内容，都会在不知不觉中共享内存。

## 3. 预分配

当最终大小已知或有明确上限时，只分配一次：

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

映射也一样：`make(map[string]int, len(items))`。
大小未知时不要预分配——错误地设置一个很大的容量会浪费内存；
对于冷路径，让 `append` 自行增长即可。

## 4. 映射要点

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

- 映射值不可寻址：对于结构体值，`m[k].Field = v` 无法编译。请使用指针映射，或采用读-修改-写方式。
- 在 `range` 期间删除元素是安全的；在 `range` 期间插入元素的行为未定义（新键可能会被访问，也可能不会）。

## 5. 集合

惯用的集合是一个值为 empty-struct 的 map：

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

`struct{}` 占用零字节；`map[string]bool` 也可以使用；当你会通过
`if seen[id]` 测试成员是否存在时，后者的可读性更好。

## 6. 数组与切片

- 数组（`[4]byte`）是值：赋值和传参都会复制整个数组。当元素可比较时，数组可以使用 `==` 进行比较。
- 对于具有值语义的固定大小数据，使用数组：哈希值（`[32]byte`）、IPv4 地址、固定矩阵、map 键。
- 其他情况都使用切片。一个接收 `[100]int` 的函数每次调用都会复制 800 字节——这几乎总是错误的。

## 7. 结构选择

| 需求 | 使用 |
|---|---|
| 有序、可增长的集合 | `[]T` |
| 成员判断 / 去重 | `map[K]struct{}` |
| 键→值查找 | `map[K]V` |
| 固定大小、值语义、可比较 | `[N]T` 数组 |
| FIFO 队列（单个 goroutine） | 带头部索引的切片，或在高频变动场景中使用 `container/list` |
| 栈 | 切片 + `append` / `s[:len(s)-1]` |
| 并发 map，只写一次、多次读取的键 | `sync.Map` —— 否则使用互斥锁 + map |

`sync.Map` 是一种特殊场景下的工具（只追加缓存、互不相交的键集合）。默认使用 `map` +
`sync.RWMutex`；锁定模式请参阅并发 skill。

## 验证清单

1. 没有逻辑区分 nil 切片和空切片；使用 `len()` 判断是否为空
2. 面向 JSON 的切片在契约要求 `[]` 时显式设为空（而不是 nil）
3. 不对函数不拥有的切片执行 `append`；明确创建副本
4. 不保留大型数组的长期子切片而不使用 `slices.Clone`/`copy`
5. 在大小已知时，为切片和 map 预分配容量
6. 在“缺失”与零值有区别的所有地方使用 comma-ok
7. 不向可能为 nil 的 map 写入
8. 对于需要确定性输出的路径，在遍历前对 map 键排序
9. 将集合构建为 `map[K]struct{}`（或为提高可读性使用 `map[K]bool`）
10. 仅在值语义或可比较性是重点时使用数组