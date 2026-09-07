---
name: dwarf-expert
description: Analyzes DWARF debug information in compiled binaries. Use when inspecting .debug_* sections, DIE trees, or DW_TAG_/DW_AT_ entries with dwarfdump/llvm-dwarfdump or readelf, verifying debug info with llvm-dwarfdump --verify, answering DWARF standard questions, or writing code that parses DWARF (libdwarf, pyelftools, gimli).
effort: medium
allowed-tools: Read Write Edit Bash Grep Glob WebSearch WebFetch
---
# DWARF 专家

围绕 DWARF 调试信息提供专业能力：解析与搜索 DWARF、验证其完整性、回答关于标准的问题，以及编写使用它的代码。不在范围内：运行时调试（用 gdb/lldb）、超出 DWARF 段之外的逆向工程（用 Ghidra/IDA），以及特定于编译器的 DWARF 生成 bug。

# 权威来源

当精确性很重要时，请查找标准细节，而不是凭记忆回答：

1. **dwarfstd.org** — 官方规范。用网络搜索查找具体章节，例如 "DWARF5 DW_TAG_subprogram attributes site:dwarfstd.org"。
2. **LLVM** — `llvm/lib/DebugInfo/DWARF/` 是可靠的参考实现：`DWARFDie.cpp`（DIE 与属性访问）、`DWARFUnit.cpp`（编译单元）、`DWARFDebugLine.cpp`（行号表）、`DWARFVerifier.cpp`（校验）。
3. **libdwarf** — 参考 C 实现，位于 github.com/davea42/libdwarf-code。

# 用 dwarfdump 进行解析与搜索

针对 DWARF 相关工作，优先使用 `dwarfdump` 而非 `readelf`。它有两种实现——libdwarf 的 `dwarfdump` 和 LLVM 的 `llvm-dwarfdump`——选项各不相同，而直接敲 `dwarfdump` 命令时可能是其中任一种：先检查 `dwarfdump --version`。下面的选项是 LLVM 的。

在 macOS 上，链接后的 Mach-O 可执行文件不带 DWARF：调试信息留在 `.o` 文件中，直到 `dsymutil` 将其收集到 `.dSYM` 包里。将 `dwarfdump` 指向 dSYM（或目标文件），而不是可执行文件。`pyelftools` 只支持 ELF——对 Mach-O 做脚本化处理时，请继续使用 LLVM 工具。

- `--all`：转储所有 DWARF 节；`--debug-info`、`--debug-line` 等只转储单个节
- `--show-children [--recurse-depth=<n>]`：打印所选条目时包含子 DIE——参数、局部变量和结构体成员是函数与类型 DIE 的子 DIE
- `--show-parents [--parent-recurse-depth=<n>]`：包含父 DIE
- `--show-form`：打印属性 form 类型，在编码细节重要时使用
- `--find=<name>`：通过加速表做精确名称查找——快但不穷尽；未命中时退回到 `--name`
- `--name=<pattern> [--ignore-case] [--regex]`：穷尽式 DIE 名称搜索
- `--lookup=<address>`：查找覆盖某个地址的 DIE
- `--verbose`：打印底层编码细节

## 搜索 DIE

随着查询变得更复杂，逐级采用以下策略：

1. **名称或地址匹配**：`--find`，然后是 `--name`；地址用 `--lookup`。
2. **属性或类型查询**（例如所有类型为 `float *` 的参数）：转储后过滤。`grep -B` 会带入携带每个 DIE 偏移的头部行：`llvm-dwarfdump file | grep -B 5 "float \*" | grep DW_TAG_formal_parameter`，然后用 `--debug-info=<offset> --show-children` 按偏移打印各个 DIE（`--lookup` 接受的是程序地址，不是 DIE 偏移）。
3. **多属性或结构性查询**：当 grep 管道变得脆弱时，改用 `pyelftools` 编写 Python 脚本。

# 验证 DWARF 完整性

- `llvm-dwarfdump --verify <binary>`：结构性检查（单元链、DIE 关系、地址范围）。`--error-display=<quiet|summary|details|full>` 控制详细程度；`--verify-json=<path>` 输出机器可读的错误摘要；只依赖退出码的检查用 `--quiet`。
- `llvm-dwarfdump --statistics <binary>`：以 JSON 输出调试信息质量指标——跨编译器版本或优化级别比较，以发现退化。

在产出 DWARF 之后（编译器、二进制重写器）、调试器在某个二进制上行为异常时，以及针对已知正确的文件开发 DWARF 工具时，都要进行验证。

当新一代编译器产出了旧版 DWARF 时，说明构建显式传入了 `-gdwarf-N`——现代 gcc 和 clang 默认使用 v4/v5，因此请检查构建系统，而不要假设是工具链默认值。GCC 会把它的标志嵌入 `DW_AT_producer`，所以往往直接就能读出这一指定；clang 的 producer 字符串不携带标志。旧版本在实际环境中仍然常见，除表面形式外读取方式相同：在 v2 输出中，成员偏移表现为位置表达式（`DW_OP_plus_uconst`），链接名表现为 `DW_AT_MIPS_linkage_name`。

# readelf

用于一般的 ELF 结构，或当 `dwarfdump` 不可用时：

- `--debug-dump=<section>`：转储某个 DWARF 节（`info`、`line`……）
- `--dwarf-depth=<n>` / `--dwarf-start=<n>`：限制 DIE 深度 / 起始偏移

# 编写解析 DWARF 的代码

优先使用现有库，而不是手工解析：

| 库 | 语言 | 说明 |
|---------|----------|-------|
| `libdwarf` | C/C++ | github.com/davea42/libdwarf-code — 底层；用于实现 `dwarfdump` |
| `pyelftools` | Python | github.com/eliben/pyelftools — 也能解析一般 ELF |
| `gimli` | Rust | github.com/gimli-rs/gimli — 搭配 `object` 来加载容器文件 |
| `debug/dwarf` | Go | 标准库 |
| `LibObjectFile` | .NET | github.com/xoofx/LibObjectFile — 也处理 ELF/PE 目标文件 |

一次性脚本默认用 Python 配 `pyelftools`，除非任务另有要求。

需要处理的 DWARF 特有陷阱——也是评审 DWARF 代码时要检查的要点：

- 属性是可选的：DIE 可能省略 `DW_AT_name`、`DW_AT_type`、范围等。
- 属性间接性：DIE 的属性可能位于其 `DW_AT_abstract_origin`（内联实例）或 `DW_AT_specification`（非内联定义）所引用的 DIE 上——先解析完整条链，再下结论说数据缺失。
- 类型链：限定符和修饰符（`DW_TAG_const_type`、`DW_TAG_pointer_type`……）包裹底层类型；沿 `DW_AT_type` 链接一路走下去以到达基础类型。
