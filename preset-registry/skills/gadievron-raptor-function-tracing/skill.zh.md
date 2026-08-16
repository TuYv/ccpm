---
name: Function Call Tracing
description: Instrument C/C++ with -finstrument-functions for execution tracing and Perfetto visualisation
user-invocable: false
version: 1.0
author: Claude
tags:
  - tracing
  - profiling
  - instrumentation
  - perfetto
---
# 函数调用追踪

## 目的
通过逐线程日志和 Perfetto 可视化追踪 C/C++ 程序中的所有函数调用。

## 组件

### 1. 插桩库（trace_instrument.c）
捕获函数进入/退出，并写入逐线程日志。

**构建：**
```bash
gcc -c -fPIC trace_instrument.c -o trace_instrument.o
gcc -shared trace_instrument.o -o libtrace.so -ldl -lpthread
```

### 2. Perfetto 转换器（trace_to_perfetto.cpp）
将日志转换为供 Perfetto UI 使用的 Chrome JSON。

**构建：**
```bash
g++ -O3 -std=c++17 trace_to_perfetto.cpp -o trace_to_perfetto
```

## 用法

### 第 1 步：添加到构建配置
```makefile
CFLAGS += -finstrument-functions -g
LDFLAGS += -L. -ltrace -ldl -lpthread
```

### 第 2 步：构建目标
```bash
make
```

### 第 3 步：运行
```bash
export LD_LIBRARY_PATH=.:$LD_LIBRARY_PATH
./program
# Creates trace_<tid>.log files
```

### 第 4 步：转换为 Perfetto 格式
```bash
./trace_to_perfetto trace_*.log -o trace.json
# Open trace.json in ui.perfetto.dev
```

## 日志格式
```
[seq] [timestamp] [dots] [ENTRY|EXIT!] function_name
[0] [1.000000000]  [ENTRY] main
[1] [1.000050000] . [ENTRY] helper
[2] [1.000100000] . [EXIT!] helper
[3] [1.000150000]  [EXIT!] main
```

- 点表示调用深度
- 时间戳采用秒.纳秒格式
- 每个线程一个日志文件

## 当用户请求追踪时

### 步骤
1. 将 `trace_instrument.c` 和 `trace_to_perfetto.cpp` 复制到项目中
2. 构建插桩库
3. 将 `-finstrument-functions` 添加到 CFLAGS
4. 将 `-L. -ltrace -ldl -lpthread` 添加到 LDFLAGS
5. 构建项目
6. 设置 `LD_LIBRARY_PATH` 并运行
7. 转换日志：`./trace_to_perfetto trace_*.log -o trace.json`
8. 提供 ui.perfetto.dev 的链接

### 构建系统检测
**Makefile：** 有条件地添加标志
```makefile
ENABLE_TRACE ?= 0
ifeq ($(ENABLE_TRACE),1)
    CFLAGS += -finstrument-functions -g
    LDFLAGS += -L. -ltrace -ldl -lpthread
endif
```

**CMake：** 添加选项
```cmake
option(ENABLE_TRACE "Enable tracing" OFF)
if(ENABLE_TRACE)
    add_compile_options(-finstrument-functions -g)
    link_libraries(trace dl pthread)
endif()
```

## 输出
- **trace_<tid>.log**：逐线程文本日志
- **trace.json**：Perfetto Chrome JSON 格式
- 在 https://ui.perfetto.dev 查看

## Perfetto JSON 格式
函数 ENTRY → "B"（开始）事件
函数 EXIT! → "E"（结束）事件
所有线程按时间戳对齐到单个文件中。