---
name: coding-guidelines
description: "Use when asking about Rust code style or best practices. Keywords: naming, formatting, comment, clippy, rustfmt, lint, code style, best practice, P.NAM, G.FMT, code review, naming convention, variable naming, function naming, type naming, 命名规范, 代码风格, 格式化, 最佳实践, 代码审查, 怎么命名"
source: https://rust-coding-guidelines.github.io/rust-coding-guidelines-zh/
user-invocable: false
---
# Rust 编码指南（50 条核心规则）

## 命名（Rust 特有）

| 规则 | 指南 |
|------|-----------|
| 不使用 `get_` 前缀 | 使用 `fn name()`，而非 `fn get_name()` |
| 迭代器惯例 | `iter()` / `iter_mut()` / `into_iter()` |
| 转换命名 | `as_`（低成本且借用）、`to_`（高成本）、`into_`（所有权） |
| 静态变量前缀 | `static` 使用 `G_CONFIG`，`const` 不使用前缀 |

## 数据类型

| 规则 | 指南 |
|------|-----------|
| 使用 newtype | 使用 `struct Email(String)` 表达领域语义 |
| 优先使用切片模式 | `if let [first, .., last] = slice` |
| 预分配 | `Vec::with_capacity()`、`String::with_capacity()` |
| 避免滥用 Vec | 固定大小的数据使用数组 |

## 字符串

| 规则 | 指南 |
|------|-----------|
| 优先使用字节 | 处理 ASCII 时使用 `s.bytes()`，而非 `s.chars()` |
| 使用 `Cow<str>` | 可能需要修改借用的数据时 |
| 使用 `format!` | 而非使用 `+` 拼接字符串 |
| 避免嵌套迭代 | 对字符串使用 `contains()` 的复杂度为 O(n*m) |

## 错误处理

| 规则 | 指南 |
|------|-----------|
| 使用 `?` 传播 | 不使用 `try!()` 宏 |
| 优先使用 `expect()` 而非 `unwrap()` | 当值保证存在时 |
| 使用断言检查不变量 | 在函数入口处使用 `assert!` |

## 内存

| 规则 | 指南 |
|------|-----------|
| 使用有意义的生命周期名称 | 使用 `'src`、`'ctx`，而不只是 `'a` |
| 对 RefCell 使用 `try_borrow()` | 避免 panic |
| 使用遮蔽进行转换 | `let x = x.parse()?` |

## 并发

| 规则 | 指南 |
|------|-----------|
| 明确锁的获取顺序 | 防止死锁 |
| 对基本类型使用原子类型 | 不要为 bool/usize 使用 Mutex |
| 谨慎选择内存顺序 | Relaxed/Acquire/Release/SeqCst |

## 异步

| 规则 | 指南 |
|------|-----------|
| CPU 密集型任务使用同步方式 | 异步用于 I/O |
| 不要跨 await 持有锁 | 使用作用域限定的守卫 |

## 宏

| 规则 | 指南 |
|------|-----------|
| 除非必要，否则避免使用 | 优先使用函数/泛型 |
| 遵循 Rust 语法 | 宏输入应当看起来像 Rust 代码 |

## 已弃用 → 更佳选择

| 已弃用 | 更佳选择 | 起始版本 |
|------------|--------|-------|
| `lazy_static!` | `std::sync::OnceLock` | 1.70 |
| `once_cell::Lazy` | `std::sync::LazyLock` | 1.80 |
| `std::sync::mpsc` | `crossbeam::channel` | - |
| `std::sync::Mutex` | `parking_lot::Mutex` | - |
| `failure`/`error-chain` | `thiserror`/`anyhow` | - |
| `try!()` | `?` 运算符 | 2018 |

## 快速参考

```
Naming: snake_case (fn/var), CamelCase (type), SCREAMING_CASE (const)
Format: rustfmt (just use it)
Docs: /// for public items, //! for module docs
Lint: #![warn(clippy::all)]
```

Claude 非常了解 Rust 惯例。以上是一些不那么显而易见的 Rust 特有规则。