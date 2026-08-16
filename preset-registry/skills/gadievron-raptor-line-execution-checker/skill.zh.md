---
name: Line Execution Checker
description: Check if specific lines were executed using gcov data
user-invocable: false
version: 1.0
author: Claude
tags:
  - coverage
  - gcov
  - testing
---
# 行执行检查器

## 用途
用于检查特定源代码行是否在测试运行期间执行过的快速工具。

## 工具：line-checker

### 构建
```bash
g++ -O3 -std=c++17 line_checker.cpp -o line-checker
```

### 用法
```bash
# Single line
./line-checker file.c:42

# Multiple lines
./line-checker file.c:42 main.c:100 util.c:55
```

### 输出
```
file.c:42 EXECUTED (5 times)
main.c:100 NOT EXECUTED
util.c:55 EXECUTED (12 times)
```

### 退出代码
- 0：所有行均已执行
- 1：一个或多个代码行未执行
- 2：错误

## 前提条件
必须存在之前使用 `--coverage` 标志运行测试所生成的覆盖率数据。

## 当用户询问时
“file.c 的第 X 行是否执行过？”或“检查这些代码行是否被覆盖”

### 步骤
1. 验证 `.gcda` 文件是否存在：`find . -name "*.gcda" -print -quit`
2. 如有需要，构建工具：`g++ -O3 -std=c++17 line_checker.cpp -o line-checker`
3. 运行：`./line-checker file.c:X`
4. 向用户报告结果

## 交互示例
用户：“parser.c 的第 127 行是否执行过？”

```bash
./line-checker parser.c:127
# Output: parser.c:127 EXECUTED (3 times)
```

响应：“是的，第 127 行在测试期间执行了 3 次。”