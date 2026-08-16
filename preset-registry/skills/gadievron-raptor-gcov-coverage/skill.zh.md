---
name: Code Coverage with gcov
description: Add gcov code coverage instrumentation to C/C++ projects
user-invocable: false
version: 1.0
author: Claude
tags:
  - coverage
  - gcov
  - testing
---
# 使用 gcov 进行代码覆盖率分析

## 目的
使用 gcov 对 C/C++ 程序进行插桩，以测量测试覆盖率。

## 工作原理

### 启用覆盖率构建
```bash
gcc --coverage -o program source.c
```

### 运行程序
```bash
./program
# Creates .gcda files with execution data
```

### 生成报告

**文本报告：**
```bash
gcov source.c
# Creates source.c.gcov with line-by-line coverage
```

**HTML 报告：**
```bash
gcovr --html-details -o coverage.html
```

## 覆盖率标志

- `--coverage`（`-fprofile-arcs -ftest-coverage -lgcov` 的简写）
- 同时添加到 `CFLAGS` 和 `LDFLAGS`

## 构建系统集成

### Makefile
```makefile
ENABLE_COVERAGE ?= 0
ifeq ($(ENABLE_COVERAGE),1)
    CFLAGS += --coverage
    LDFLAGS += --coverage
endif
```

### CMake
```cmake
option(ENABLE_COVERAGE "Enable coverage" OFF)
if(ENABLE_COVERAGE)
    add_compile_options(--coverage)
    add_link_options(--coverage)
endif()
```

## 当用户请求覆盖率分析时

### 步骤
1. 检测构建系统（Makefile/CMake/其他）
2. 将 `--coverage` 添加到 CFLAGS 和 LDFLAGS
3. 清理之前的构建：`make clean` 或 `rm -f *.gcda *.gcno`
4. 启用覆盖率构建：`make ENABLE_COVERAGE=1` 或 `cmake -DENABLE_COVERAGE=ON`
5. 运行测试：`make test` 或 `./test_suite`
6. 生成报告：`gcovr --html-details coverage.html --print-summary`
7. 提供摘要和 HTML 报告的路径

## 输出

**文本（.gcov 文件）：**
```
        -:    0:Source:main.c
        5:   42:    int x = 10;
    #####:   43:    unused_code();
```
- `5:` = 执行了 5 次
- `#####:` = 未执行
- `-:` = 不可执行

**HTML：** 使用颜色标记覆盖情况的交互式报告

## 指标
- **行覆盖率**：已执行行数 / 总行数
- **分支覆盖率**：已采用分支数 / 总分支数  
- **函数覆盖率**：已调用函数数 / 总函数数

目标：行覆盖率达到 80% 以上，分支覆盖率达到 70% 以上