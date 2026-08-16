---
name: rr-debugger
description: Deterministic debugging with rr record-replay. Use when debugging crashes, ASAN faults, or when reverse execution is needed. Provides reverse-next, reverse-step, reverse-continue commands and crash trace extraction.
user-invocable: false
---
# rr 确定性调试器

rr 提供确定性的记录-重放调试，并具备完整的反向执行能力。

## 核心工作流程

1. **记录**：`rr record <program> [args]`
2. **重放**：`rr replay`（进入支持反向执行的 gdb 界面）

## 反向执行命令

所有标准 gdb 命令均可使用，此外还支持以下反向命令：

- `reverse-next` / `rn`：反向单步执行，越过函数调用
- `reverse-step` / `rs`：反向单步进入函数
- `reverse-continue` / `rc`：反向继续执行至上一个断点
- `reverse-stepi` / `rsi`：反向执行一条指令
- `reverse-nexti` / `rni`：反向执行并越过一条指令

## 崩溃跟踪提取

### 常规崩溃

执行 `rr record <crashing-program>` 后：

```bash
rr replay
# In gdb:
reverse-next 100    # Go back 100 steps (adjust N as needed)
# Now step forward to see execution leading to crash:
next
next
...
```

### ASAN 崩溃

执行 `rr record <asan-program>` 后：

```bash
rr replay
# In gdb:
bt                  # View stack trace
up                  # Issue "up" commands until last app frame (before ASAN runtime)
break *$pc          # Set breakpoint at that location
reverse-continue    # Go back to last app instruction before ASAN
# Now step forward to see execution leading to fault:
next
next
...
```

## 检查变量和内存

可在任意位置使用标准 gdb 命令：

- `print <var>`：输出变量值
- `print *<ptr>`：解引用指针
- `x/<format> <address>`：检查内存
  - `x/10xb <addr>`：以十六进制显示 10 个字节
  - `x/s <addr>`：显示该地址处的字符串
- `info locals`：显示局部变量
- `info args`：显示函数参数

## 源代码视图与汇编视图

- `list`：显示当前位置附近的源代码
- `disassemble`：显示当前位置附近的汇编代码
- `layout src`：TUI 源代码视图
- `layout asm`：TUI 汇编视图
- `set disassemble-next-line on`：每次单步执行时显示汇编代码

## 自动化脚本

使用 `scripts/crash_trace.py` 自动提取崩溃前的执行跟踪。