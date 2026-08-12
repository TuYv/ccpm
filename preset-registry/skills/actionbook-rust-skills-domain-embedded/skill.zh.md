---
name: domain-embedded
description: "Use when developing embedded/no_std Rust. Keywords: embedded, no_std, microcontroller, MCU, ARM, RISC-V, bare metal, firmware, HAL, PAC, RTIC, embassy, interrupt, DMA, peripheral, GPIO, SPI, I2C, UART, embedded-hal, cortex-m, esp32, stm32, nrf, 嵌入式, 单片机, 固件, 裸机"
globs: ["**/Cargo.toml", "**/.cargo/config.toml"]
user-invocable: false
---
## 项目上下文（自动注入）

**目标配置：**
!`cat .cargo/config.toml 2>/dev/null || echo "No .cargo/config.toml found"`

---

# 嵌入式领域

> **第 3 层：领域约束**

## 领域约束 → 设计影响

| 领域规则 | 设计约束 | Rust 影响 |
|-------------|-------------------|------------------|
| 无堆 | 栈分配 | heapless，不使用 Box/Vec |
| 无 std | 仅使用 Core | #![no_std] |
| 实时性 | 可预测的时序 | 不使用动态分配 |
| 资源受限 | 最小化内存占用 | 静态缓冲区 |
| 硬件安全 | 安全的外设访问 | HAL + 所有权 |
| 中断安全 | ISR 中不阻塞 | 原子操作、临界区 |

---

## 关键约束

### 禁止动态分配

```
RULE: Cannot use heap (no allocator)
WHY: Deterministic memory, no OOM
RUST: heapless::Vec<T, N>, arrays
```

### 中断安全

```
RULE: Shared state must be interrupt-safe
WHY: ISR can preempt at any time
RUST: Mutex<RefCell<T>> + critical section
```

### 硬件所有权

```
RULE: Peripherals must have clear ownership
WHY: Prevent conflicting access
RUST: HAL takes ownership, singletons
```

---

## 向下追溯 ↓

从约束到设计（第 2 层）：

```
"Need no_std compatible data structures"
    ↓ m02-resource: heapless collections
    ↓ Static sizing: heapless::Vec<T, N>

"Need interrupt-safe state"
    ↓ m03-mutability: Mutex<RefCell<Option<T>>>
    ↓ m07-concurrency: Critical sections

"Need peripheral ownership"
    ↓ m01-ownership: Singleton pattern
    ↓ m12-lifecycle: RAII for hardware
```

---

## 分层栈

| 层 | 示例 | 用途 |
|-------|----------|---------|
| PAC | stm32f4, esp32c3 | 寄存器访问 |
| HAL | stm32f4xx-hal | 硬件抽象 |
| 框架 | RTIC, Embassy | 并发 |
| Trait | embedded-hal | 可移植驱动程序 |

## 框架对比

| 框架 | 风格 | 最适合 |
|-----------|-------|----------|
| RTIC | 基于优先级 | 中断驱动型应用 |
| Embassy | 异步 | 复杂状态机 |
| 裸机 | 手动 | 简单应用 |

## 关键 Crate

| 用途 | Crate |
|---------|-------|
| 运行时（ARM） | cortex-m-rt |
| Panic 处理程序 | panic-halt, panic-probe |
| 集合 | heapless |
| HAL Trait | embedded-hal |
| 日志记录 | defmt |
| 烧录/调试 | probe-run |

## 设计模式

| 模式 | 用途 | 实现 |
|---------|---------|----------------|
| no_std 配置 | 裸机 | `#![no_std]` + `#![no_main]` |
| 入口点 | 启动 | `#[entry]` 或 embassy |
| 静态状态 | ISR 访问 | `Mutex<RefCell<Option<T>>>` |
| 固定缓冲区 | 无堆 | `heapless::Vec<T, N>` |

## 代码模式：静态外设

```rust
#![no_std]
#![no_main]

use cortex_m::interrupt::{self, Mutex};
use core::cell::RefCell;

static LED: Mutex<RefCell<Option<Led>>> = Mutex::new(RefCell::new(None));

#[entry]
fn main() -> ! {
    let dp = pac::Peripherals::take().unwrap();
    let led = Led::new(dp.GPIOA);

    interrupt::free(|cs| {
        LED.borrow(cs).replace(Some(led));
    });

    loop {
        interrupt::free(|cs| {
            if let Some(led) = LED.borrow(cs).borrow_mut().as_mut() {
                led.toggle();
            }
        });
    }
}
```

---

## 常见错误

| 错误 | 领域违规 | 修复方法 |
|---------|-----------------|-----|
| 使用 Vec | 堆分配 | heapless::Vec |
| 未使用临界区 | 与 ISR 发生竞态 | Mutex + interrupt::free |
| 在 ISR 中阻塞 | 中断丢失 | 延迟到主循环处理 |
| 不安全地使用外设 | 硬件冲突 | HAL 所有权 |

---

## 追溯到第 1 层

| 约束 | 第 2 层模式 | 第 1 层实现 |
|------------|-----------------|------------------------|
| 无堆 | 静态集合 | heapless::Vec<T, N> |
| ISR 安全 | 临界区 | Mutex<RefCell<T>> |
| 硬件所有权 | 单例 | take().unwrap() |
| no_std | 仅使用 Core | #![no_std], #![no_main] |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 静态内存 | m02-resource |
| 内部可变性 | m03-mutability |
| 中断模式 | m07-concurrency |
| 针对硬件的 Unsafe | unsafe-checker |