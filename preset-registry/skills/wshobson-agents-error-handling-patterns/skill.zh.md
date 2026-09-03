---
name: error-handling-patterns
description: Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications. Use when implementing error handling, designing APIs, or improving application reliability.
---
# 错误处理模式

构建具备健壮错误处理策略的高韧性应用，优雅地处理故障，并提供出色的调试体验。

## 何时使用此技能

- 在新功能中实现错误处理
- 设计容错性强的 API
- 调试生产环境问题
- 提升应用可靠性
- 为用户和开发者创建更好的错误消息
- 实现重试与熔断器模式
- 处理异步/并发错误
- 构建容错的分布式系统

## 核心概念

### 1. 错误处理理念

**异常 vs Result 类型：**

- **异常**：传统的 try-catch 方式，会打断控制流
- **Result 类型**：显式表达成功/失败，函数式风格
- **错误码**：C 语言风格，需要纪律
- **Option/Maybe 类型**：用于可空值

**各自的使用时机：**

- 异常：意外错误、异常情况
- Result 类型：预期错误、校验失败
- Panic/崩溃：不可恢复的错误、程序缺陷

### 2. 错误类别

**可恢复的错误：**

- 网络超时
- 文件缺失
- 无效的用户输入
- API 速率限制

**不可恢复的错误：**

- 内存耗尽
- 栈溢出
- 程序缺陷（空指针等）

## 详细的模式与示例

详细的模式文档位于 `references/details.md`。当上方的导航层级不足以满足需求时，请阅读该文件。

## 最佳实践

1. **快速失败**：尽早校验输入，快速失败
2. **保留上下文**：包含堆栈跟踪、元数据、时间戳
3. **有意义的消息**：说明发生了什么以及如何修复
4. **合理记录日志**：错误 = 记录日志，预期失败 = 不要刷屏日志
5. **在合适的层级处理**：在能够有效处理的地方捕获异常
6. **清理资源**：使用 try-finally、上下文管理器、
