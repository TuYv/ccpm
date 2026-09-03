---
name: service-mesh-observability
description: Implement comprehensive observability for service meshes including distributed tracing, metrics, and visualization. Use when setting up mesh monitoring, debugging latency issues, or implementing SLOs for service communication.
---
# 服务网格可观测性

Istio、Linkerd 及服务网格部署的可观测性模式完整指南。

## 何时使用本技能

- 设置跨服务的分布式追踪
- 实现服务网格指标和仪表盘
- 调试延迟和错误问题
- 为服务通信定义 SLO
- 可视化服务依赖关系
- 排查网格连接问题

## 核心概念

### 1. 可观测性的三大支柱

```
┌─────────────────────────────────────────────────────┐
│                  Observability                       │
├─────────────────┬─────────────────┬─────────────────┤
│     Metrics     │     Traces      │      Logs       │
│                 │                 │                 │
│ • Request rate  │ • Span context  │ • Access logs   │
│ • Error rate    │ • Latency       │ • Error details │
│ • Latency P50   │ • Dependencies  │ • Debug info    │
│ • Saturation    │ • Bottlenecks   │ • Audit trail   │
└─────────────────┴─────────────────┴─────────────────┘
```

### 2. 网格的黄金信号

| 信号           | 描述                      | 告警阈值          |
| -------------- | ------------------------- | ----------------- |
| **延迟**       | 请求耗时 P50、P99         | P99 > 500ms       |
| **流量**       | 每秒请求数                | 异常检测          |
| **错误**       | 5xx 错误率                | > 1%              |
| **饱和度**     | 资源利用率                | > 80%             |

## 模板与详细示例

完整的模板库和详细示例位于 `references/details.md` 中。当你需要具体模板时，请阅读该文件。

## 最佳实践

### 推荐做法

- **合理采样** - 开发环境 100%，生产环境 1-10%
- **使用追踪上下文** - 一致地传播请求头
- **设置告警** - 针对黄金信号
- **关联指标/追踪** - 使用 exemplar
- **有策略地保留数据** - 热/冷存储分层

### 避免做法

- **不要过度采样** - 存储成本会不断累积
- **不要忽视基数** - 限制标签取值
- **不要跳过仪表盘** - 可视化依赖关系
- **不要忘记成本** - 监控可观测性成本
