---
name: m15-anti-pattern
description: "Use when reviewing code for anti-patterns. Keywords: anti-pattern, common mistake, pitfall, code smell, bad practice, code review, is this an anti-pattern, better way to do this, common mistake to avoid, why is this bad, idiomatic way, beginner mistake, fighting borrow checker, clone everywhere, unwrap in production, should I refactor, 反模式, 常见错误, 代码异味, 最佳实践, 地道写法"
user-invocable: false
---
# 反模式

> **第 2 层：设计选择**

## 核心问题

**这种模式是否掩盖了设计问题？**

审查代码时：
- 这是在解决症状还是根本原因？
- 是否存在更符合惯用法的方法？
- 这段代码是在对抗 Rust，还是顺应 Rust？

---

## 反模式 → 更好的模式

| 反模式 | 为什么不好 | 更好的方式 |
|--------------|---------|--------|
| 到处使用 `.clone()` | 掩盖所有权问题 | 正确使用引用或所有权 |
| 在生产环境中使用 `.unwrap()` | 导致运行时 panic | 使用 `?`、`expect` 或进行错误处理 |
| 单一所有者时使用 `Rc` | 不必要的开销 | 使用简单所有权 |
| 为方便而使用 `unsafe` | 存在 UB 风险 | 寻找安全的模式 |
| 通过 `Deref` 实现 OOP | API 具有误导性 | 使用组合和 trait |
| 巨大的 match 分支 | 难以维护 | 提取为方法 |
| 到处使用 `String` | 浪费内存分配 | 使用 `&str`、`Cow<str>` |
| 忽略 `#[must_use]` | 错误被遗漏 | 进行处理或使用 `let _ =` |

---

## 思考提示

看到可疑代码时：

1. **这是症状还是根本原因？**
   - 为了避开借用而进行 Clone？→ 所有权设计问题
   - “因为它不会失败”而使用 Unwrap？→ 存在未处理的情况

2. **符合惯用法的代码会是什么样？**
   - 使用引用而非 clone
   - 使用迭代器而非索引循环
   - 使用模式匹配而非标志位

3. **这是否在对抗 Rust？**
   - 对抗借用检查器 → 重构代码
   - 过度使用 unsafe → 寻找安全的模式

---

## 向上追溯 ↑

追溯至设计层面的理解：

```
"Why does my code have so many clones?"
    ↑ Ask: Is the ownership model correct?
    ↑ Check: m09-domain (data flow design)
    ↑ Check: m01-ownership (reference patterns)
```

| 反模式 | 追溯至 | 问题 |
|--------------|----------|----------|
| 到处 Clone | m01-ownership | 谁应该拥有这些数据？ |
| 到处 Unwrap | m06-error-handling | 错误处理策略是什么？ |
| 到处使用 Rc | m09-domain | 所有权是否清晰？ |
| 对抗生命周期 | m09-domain | 是否应该改变数据结构？ |

---

## 向下追溯 ↓

追溯至实现（第 1 层）：

```
"Replace clone with proper ownership"
    ↓ m01-ownership: Reference patterns
    ↓ m02-resource: Smart pointer if needed

"Replace unwrap with proper handling"
    ↓ m06-error-handling: ? operator
    ↓ m06-error-handling: expect with message
```

---

## 初学者最常犯的 5 个错误

| 排名 | 错误 | 修复方式 |
|------|---------|-----|
| 1 | 通过 Clone 逃避借用检查器 | 使用引用 |
| 2 | 在生产环境中使用 Unwrap | 使用 `?` 传播错误 |
| 3 | 所有内容都使用 String | 使用 `&str` |
| 4 | 使用索引循环 | 使用迭代器 |
| 5 | 对抗生命周期 | 重构为拥有数据所有权 |

## 代码异味 → 重构

| 异味 | 表明 | 重构方式 |
|-------|-----------|-------------|
| 大量 `.clone()` | 所有权不清晰 | 明确数据流 |
| 大量 `.unwrap()` | 缺少错误处理 | 添加正确的错误处理 |
| 大量 `pub` 字段 | 封装被破坏 | 使用私有字段 + 访问器 |
| 深层嵌套 | 逻辑复杂 | 提取方法 |
| 函数过长 | 承担多项职责 | 拆分 |
| 巨大的 enum | 缺少抽象 | 使用 trait + 类型 |

---

## 常见错误模式

| 错误 | 反模式成因 | 修复方法 |
|-------|-------------------|-----|
| E0382 移动后使用 | 克隆与所有权混淆 | 正确使用引用 |
| 生产环境中发生 Panic | 到处使用 Unwrap | 使用 ?、模式匹配 |
| 性能低下 | 所有文本都使用 String | 使用 &str、Cow |
| 与借用检查器反复斗争 | 结构不合理 | 重构 |
| 内存膨胀 | 到处使用 Rc/Arc | 使用简单所有权 |

---

## 已弃用 → 更好的做法

| 已弃用 | 更好的做法 |
|------------|--------|
| 基于索引的循环 | `.iter()`、`.enumerate()` |
| `collect::<Vec<_>>()` 后再迭代 | 链式使用迭代器 |
| 手动实现 unsafe cell | `Cell`、`RefCell` |
| 使用 `mem::transmute` 进行类型转换 | `as` 或 `TryFrom` |
| 自定义链表 | `Vec`、`VecDeque` |
| `lazy_static!` | `std::sync::OnceLock` |

---

## 快速审查清单

- [ ] 不无故使用 `.clone()`
- [ ] 库代码中不使用 `.unwrap()`
- [ ] 带有不变量的字段不使用 `pub`
- [ ] 可以使用迭代器时，不使用索引循环
- [ ] `&str` 足够时，不使用 `String`
- [ ] 不忽略 `#[must_use]` 警告
- [ ] 使用 `unsafe` 时必须添加 SAFETY 注释
- [ ] 不使用超大型函数（>50 行）

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 所有权模式 | m01-ownership |
| 错误处理 | m06-error-handling |
| 心智模型 | m14-mental-model |
| 性能 | m10-performance |