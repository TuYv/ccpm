---
name: m10-performance
description: "CRITICAL: Use for performance optimization. Triggers: performance, optimization, benchmark, profiling, flamegraph, criterion, slow, fast, allocation, cache, SIMD, make it faster, 性能优化, 基准测试"
user-invocable: false
---
# 性能优化

> **第 2 层：设计选择**

## 核心问题

**瓶颈是什么，优化是否值得？**

优化之前：
- 是否已经测量过？（不要猜测）
- 可接受的性能是多少？
- 优化是否会增加复杂性？

---

## 性能决策 → 实现

| 目标 | 设计选择 | 实现 |
|------|---------------|----------------|
| 减少分配 | 预分配、复用 | `with_capacity`、对象池 |
| 提高缓存效率 | 连续数据 | `Vec`、`SmallVec` |
| 并行化 | 数据并行 | `rayon`、线程 |
| 避免复制 | 零复制 | 引用、`Cow<T>` |
| 减少间接访问 | 内联数据 | `smallvec`、数组 |

---

## 思考提示

优化之前：

1. **是否已经测量过？**
   - 先进行性能分析 → flamegraph、perf
   - 进行基准测试 → criterion、cargo bench
   - 找出实际热点

2. **优先级是什么？**
   - 算法（提升 10x-1000x）
   - 数据结构（提升 2x-10x）
   - 分配（提升 2x-5x）
   - 缓存（提升 1.5x-3x）

3. **需要做出什么权衡？**
   - 复杂性与速度
   - 内存与 CPU
   - 延迟与吞吐量

---

## 向上追溯 ↑

追溯到领域约束（第 3 层）：

```
"How fast does this need to be?"
    ↑ Ask: What's the performance SLA?
    ↑ Check: domain-* (latency requirements)
    ↑ Check: Business requirements (acceptable response time)
```

| 问题 | 追溯到 | 需要询问 |
|----------|----------|-----|
| 延迟要求 | domain-* | 可接受的响应时间是多少？ |
| 吞吐量需求 | domain-* | 每秒需要处理多少个请求？ |
| 内存限制 | domain-* | 内存预算是多少？ |

---

## 向下追溯 ↓

追溯到实现（第 1 层）：

```
"Need to reduce allocations"
    ↓ m01-ownership: Use references, avoid clone
    ↓ m02-resource: Pre-allocate with_capacity

"Need to parallelize"
    ↓ m07-concurrency: Choose rayon or threads
    ↓ m07-concurrency: Consider async for I/O-bound

"Need cache efficiency"
    ↓ Data layout: Prefer Vec over HashMap when possible
    ↓ Access patterns: Sequential over random access
```

---

## 快速参考

| 工具 | 用途 |
|------|---------|
| `cargo bench` | 微基准测试 |
| `criterion` | 统计基准测试 |
| `perf` / `flamegraph` | CPU 性能分析 |
| `heaptrack` | 分配跟踪 |
| `valgrind` / `cachegrind` | 缓存分析 |

## 优化优先级

```
1. Algorithm choice     (10x - 1000x)
2. Data structure       (2x - 10x)
3. Allocation reduction (2x - 5x)
4. Cache optimization   (1.5x - 3x)
5. SIMD/Parallelism     (2x - 8x)
```

## 常用技术

| 技术 | 适用场景 | 实现方式 |
|-----------|------|-----|
| 预分配 | 大小已知 | `Vec::with_capacity(n)` |
| 避免克隆 | 热路径 | 使用引用或 `Cow<T>` |
| 批量操作 | 大量小操作 | 先收集再处理 |
| SmallVec | 通常较小 | `smallvec::SmallVec<[T; N]>` |
| 内联缓冲区 | 固定大小的数据 | 使用数组而非 Vec |

---

## 常见错误

| 错误 | 错误原因 | 更好的做法 |
|---------|-----------|--------|
| 未经性能分析就进行优化 | 优化目标错误 | 先进行性能分析 |
| 在调试模式下进行基准测试 | 结果没有意义 | 始终使用 `--release` |
| 使用 LinkedList | 对缓存不友好 | 使用 `Vec` 或 `VecDeque` |
| 隐式 `.clone()` | 不必要的分配 | 使用引用 |
| 过早优化 | 浪费精力 | 先让它正常工作 |

---

## 反模式

| 反模式 | 不良原因 | 更好的做法 |
|--------------|---------|--------|
| 通过克隆来规避生命周期问题 | 性能开销 | 正确的所有权设计 |
| 所有内容都使用 Box | 间接访问开销 | 尽可能使用栈 |
| 对小型集合使用 HashMap | 额外开销 | 使用 Vec 并进行线性搜索 |
| 在循环中拼接字符串 | O(n^2) | `String::with_capacity` 或 `format!` |

---

## 相关技能

| 使用场景 | 请参阅 |
|------|-----|
| 减少克隆 | m01-ownership |
| 并发方案 | m07-concurrency |
| 智能指针选择 | m02-resource |
| 领域需求 | domain-* |