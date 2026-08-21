---
name: common-performance-engineering
description: Enforce universal standards for high-performance development. Use when profiling bottlenecks, reducing latency, fixing memory leaks, improving throughput, or optimizing algorithm complexity in any language.
metadata:
  triggers:
    files:
    - '**/*.ts'
    - '**/*.tsx'
    - '**/*.go'
    - '**/*.dart'
    - '**/*.java'
    - '**/*.kt'
    - '**/*.swift'
    - '**/*.py'
    keywords:
    - performance
    - optimize
    - profile
    - scalability
    - latency
    - throughput
    - memory leak
    - bottleneck
---
# 性能工程标准

## **优先级：P0（严重）**

## 工作流程

1. **建立基线**：在进行任何更改之前先进行性能分析——测量 CPU、内存和延迟。
2. **识别**：找出首要瓶颈（N+1 查询、热点循环、内存泄漏）。
3. **修复**：应用下文章节中的针对性优化。
4. **验证**：重新进行性能分析，以确认改进并检查是否出现回归。

## 资源管理

- **内存效率**：
 - 避免内存泄漏：显式清理监听器、观察器和流。
 - 优化数据结构：使用 `Set` 进行查找，使用 `List` 进行迭代。
 - 延迟初始化：仅在需要时初始化开销较大的对象。
- **CPU 优化**：
 - 以 O(1) 或 O(n) 为目标；避免在关键路径中使用 O(n^2)。
 - 将繁重计算卸载到后台线程或工作线程。
 - 对纯函数且计算开销较大的函数进行记忆化。

有关记忆化和批处理模式，请参阅[实现示例](references/implementation.md)。

## 网络与 I/O

- **减少有效载荷**：使用高效的序列化（Protobuf、JSON 压缩）和压缩算法（gzip/br）。
- **批处理**：将多个小型请求组合成单个批量操作。
- **缓存**：实现具有适当 TTL 和失效机制的多级缓存（内存 -> 存储 -> 网络）。
- **非阻塞 I/O**：对于文件系统和网络访问，始终使用异步操作。

## UI/UX 性能

- **尽量减少主线程工作**：通过将任务卸载到工作线程，保持动画和交互流畅。
- **虚拟化**：对长列表或大型数据集使用延迟加载或虚拟化。
- **Tree Shaking**：确保构建工具移除未使用的代码和依赖项。

## 监控与测试

- **基准测试**：为性能关键型函数编写微基准测试。
- **SLI/SLO**：定义服务等级指标（延迟、吞吐量）和目标。
- **负载测试**：测试系统在峰值和压力条件下的行为。

## 反模式

- **禁止过早优化**：先进行性能分析，只修复已证实的瓶颈。
- **禁止 N+1 查询**：始终对数据访问操作进行批处理和分页。
- **禁止在主线程上执行同步 I/O**：所有文件和网络访问均使用异步方式。

## 参考资料

- [实现模式](references/implementation.md) — 性能分析模式、基准测试设置

## 规范响应锚点

应用此技能时，请在相关情况下保留下列领域术语或与之等效的具体示例：
- lazy

- 其他基于任务的精确锚点：premature