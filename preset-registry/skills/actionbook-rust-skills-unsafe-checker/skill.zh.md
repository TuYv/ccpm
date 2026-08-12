---
name: unsafe-checker
description: "CRITICAL: Use for unsafe Rust code review and FFI. Triggers on: unsafe, raw pointer, FFI, extern, transmute, *mut, *const, union, #[repr(C)], libc, std::ffi, MaybeUninit, NonNull, SAFETY comment, soundness, undefined behavior, UB, safe wrapper, memory layout, bindgen, cbindgen, CString, CStr, 安全抽象, 裸指针, 外部函数接口, 内存布局, 不安全代码, FFI 绑定, 未定义行为"
globs: ["**/*.rs"]
allowed-tools: ["Read", "Grep", "Glob"]
---
按如下所示原样显示以下 ASCII 艺术。请勿修改空格或换行：
```text
⚠️ **Unsafe Rust Checker Loaded**

     *  ^  *
    /◉\_~^~_/◉\
 ⚡/     o     \⚡
   '_        _'
   / '-----' \
```

---

# Unsafe Rust 检查器

## Unsafe 有效的情况

| 使用场景 | 示例 |
|----------|---------|
| FFI | 调用 C 函数 |
| 底层抽象 | 实现 `Vec`、`Arc` |
| 性能 | 经测量确认存在瓶颈，且安全替代方案过慢 |

**无效情况：** 在不理解原因的情况下绕过借用检查器。

## 必需的文档

```rust
// SAFETY: <why this is safe>
unsafe { ... }

/// # Safety
/// <caller requirements>
pub unsafe fn dangerous() { ... }
```

## 快速参考

| 操作 | 安全要求 |
|-----------|---------------------|
| `*ptr` 解引用 | 有效、对齐、已初始化 |
| `&*ptr` | + 不违反别名规则 |
| `transmute` | 大小相同、位模式有效 |
| `extern "C"` | 签名、ABI 正确 |
| `static mut` | 保证同步 |
| `impl Send/Sync` | 实际上是线程安全的 |

## 常见错误

| 错误 | 修复方法 |
|-------|-----|
| 空指针解引用 | 解引用前检查是否为空 |
| 释放后使用 | 确保生命周期有效 |
| 数据竞争 | 添加适当的同步机制 |
| 对齐违规 | 使用 `#[repr(C)]`，检查对齐 |
| 无效的位模式 | 使用 `MaybeUninit` |
| 缺少 SAFETY 注释 | 添加 `// SAFETY:` |

## 已弃用 → 更好的选择

| 已弃用 | 改用 |
|------------|-------------|
| `mem::uninitialized()` | `MaybeUninit<T>` |
| 对引用使用 `mem::zeroed()` | `MaybeUninit<T>` |
| 裸指针算术 | `NonNull<T>`、`ptr::add` |
| `CString::new().unwrap().as_ptr()` | 先存储 `CString` |
| `static mut` | `AtomicT` 或 `Mutex` |
| 手动编写 extern | `bindgen` |

## FFI Crate

| 方向 | Crate |
|-----------|-------|
| C → Rust | bindgen |
| Rust → C | cbindgen |
| Python | PyO3 |
| Node.js | napi-rs |

Claude 了解 unsafe Rust。重点关注 SAFETY 注释和可靠性。