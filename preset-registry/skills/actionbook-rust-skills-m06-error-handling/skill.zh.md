---
name: m06-error-handling
description: "CRITICAL: Use for error handling. Triggers: Result, Option, Error, ?, unwrap, expect, panic, anyhow, thiserror, when to panic vs return Result, custom error, error propagation, 错误处理, Result 用法, 什么时候用 panic"
user-invocable: false
---
# 错误处理

> **第 1 层：语言机制**

## 核心问题

**这个失败是预期情况，还是程序错误？**

在选择错误处理策略之前：
- 这在正常运行期间可能失败吗？
- 应该由谁处理这个失败？
- 调用方需要哪些上下文？

---

## 错误 → 设计问题

| 模式 | 不要只说 | 应该这样问 |
|---------|----------------|-------------|
| unwrap 导致 panic | “使用 ?” | None/Err 在这里真的可能出现吗？ |
| 使用 ? 时类型不匹配 | “使用 anyhow” | 错误类型的设计是否正确？ |
| 错误上下文丢失 | “添加 .context()” | 调用方需要知道什么？ |
| 错误变体过多 | “使用 Box<dyn Error>” | 错误粒度是否合适？ |

---

## 思考提示

在处理错误之前：

1. **这是什么类型的失败？**
   - 预期情况 → Result<T, E>
   - 缺失属于正常情况 → Option<T>
   - 程序错误/不变量遭到破坏 → panic!
   - 无法恢复 → panic!

2. **由谁处理？**
   - 调用方 → 使用 ? 传播
   - 当前函数 → 使用 match/if-let
   - 用户 → 友好的错误消息
   - 程序员 → 通过 panic 并附带消息

3. **需要哪些上下文？**
   - 错误类型 → thiserror 变体
   - 调用链 → anyhow::Context
   - 调试信息 → anyhow 或 tracing

---

## 向上追溯 ↑

当错误策略不明确时：

```
"Should I return Result or Option?"
    ↑ Ask: Is absence/failure normal or exceptional?
    ↑ Check: m09-domain (what does domain say?)
    ↑ Check: domain-* (error handling requirements)
```

| 情况 | 追溯至 | 问题 |
|-----------|----------|----------|
| unwrap 过多 | m09-domain | 数据模型是否正确？ |
| 错误上下文设计 | m13-domain-error | 需要怎样的恢复方式？ |
| 库错误与应用错误 | m11-ecosystem | 使用者是谁？ |

---

## 向下追溯 ↓

从设计到实现：

```
"Expected failure, library code"
    ↓ Use: thiserror for typed errors

"Expected failure, application code"
    ↓ Use: anyhow for ergonomic errors

"Absence is normal (find, get, lookup)"
    ↓ Use: Option<T>

"Bug or invariant violation"
    ↓ Use: panic!, assert!, unreachable!

"Need to propagate with context"
    ↓ Use: .context("what was happening")
```

---

## 快速参考

| 模式 | 适用场景 | 示例 |
|---------|------|---------|
| `Result<T, E>` | 可恢复的错误 | `fn read() -> Result<String, io::Error>` |
| `Option<T>` | 缺失属于正常情况 | `fn find() -> Option<&Item>` |
| `?` | 传播错误 | `let data = file.read()?;` |
| `unwrap()` | 仅用于开发/测试 | `config.get("key").unwrap()` |
| `expect()` | 不变量成立 | `env.get("HOME").expect("HOME set")` |
| `panic!` | 无法恢复 | `panic!("critical failure")` |

## 库与应用

| 上下文 | 错误处理 crate | 原因 |
|---------|-------------|-----|
| 库 | `thiserror` | 为使用者提供类型化错误 |
| 应用 | `anyhow` | 符合人体工程学的错误处理 |
| 混合 | 两者 | 在边界处使用 thiserror，在内部使用 anyhow |

## 决策流程图

```
Is failure expected?
├─ Yes → Is absence the only "failure"?
│        ├─ Yes → Option<T>
│        └─ No → Result<T, E>
│                 ├─ Library → thiserror
│                 └─ Application → anyhow
└─ No → Is it a bug?
        ├─ Yes → panic!, assert!
        └─ No → Consider if really unrecoverable

Use ? → Need context?
├─ Yes → .context("message")
└─ No → Plain ?
```

---

## 常见错误

| 错误 | 原因 | 修复方法 |
|-------|-------|-----|
| `unwrap()` panic | 未处理 None/Err | 使用 `?` 或 match |
| 类型不匹配 | 错误类型不同 | 使用 `anyhow` 或 `From` |
| 上下文丢失 | 使用 `?` 时未提供上下文 | 添加 `.context()` |
| `cannot use ?` | 缺少 Result 返回值 | 返回 `Result<(), E>` |

---

## 反模式

| 反模式 | 问题所在 | 更好的做法 |
|--------------|---------|--------|
| 到处使用 `.unwrap()` | 在生产环境中发生 panic | `.expect("reason")` 或 `?` |
| 静默忽略错误 | 隐藏 bug | 处理或传播错误 |
| 对预期错误使用 `panic!` | 用户体验差，且无法恢复 | Result |
| 到处使用 Box<dyn Error> | 丢失类型信息 | thiserror |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 领域错误策略 | m13-domain-error |
| Crate 边界 | m11-ecosystem |
| 类型安全的错误 | m05-type-driven |
| 心智模型 | m14-mental-model |