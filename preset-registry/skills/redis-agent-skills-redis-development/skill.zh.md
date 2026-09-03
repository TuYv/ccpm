---
name: redis-development
description: Redis performance optimization and best practices. Use this skill when working with Redis data structures, Redis Query Engine (RQE), vector search with RedisVL, semantic caching with LangCache, or optimizing Redis performance.
license: MIT
metadata:
  author: redis
  version: "1.0.0"
---
# Redis 最佳实践

Redis 综合性能优化指南，涵盖 Redis Query Engine、向量搜索和语义缓存。包含 11 个类别共 29 条规则，按影响程度排定优先级，用于指导自动化优化和代码生成。

## 何时应用

在以下情况时参考这些指南：
- 设计 Redis 数据模型和键结构
- 实现缓存、会话或实时功能
- 使用 Redis Query Engine（FT.CREATE、FT.SEARCH、FT.AGGREGATE）
- 使用 RedisVL 构建向量搜索或 RAG 应用
- 使用 LangCache 实现语义缓存
- 优化 Redis 性能和内存使用

## 按优先级划分的规则类别

| 优先级 | 类别 | 影响程度 | 前缀 |
|----------|----------|--------|--------|
| 1 | 数据结构与键 | 高 | `data-` |
| 2 | 内存与过期 | 高 | `ram-` |
| 3 | 连接与性能 | 高 | `conn-` |
| 4 | JSON 文档 | 中 | `json-` |
| 5 | Redis Query Engine | 高 | `rqe-` |
| 6 | 向量搜索与 RedisVL | 高 | `vector-` |
| 7 | 语义缓存 | 中 | `semantic-cache-` |
| 8 | Streams 与 Pub/Sub | 中 | `stream-` |
| 9 | 集群与复制 | 中 | `cluster-` |
| 10 | 安全 | 高 | `security-` |
| 11 | 可观测性 | 中 | `observe-` |

## 快速参考

### 1. 数据结构与键（高）

- `data-choose-structure` - 选择合适的数据结构
- `data-key-naming` - 使用一致的键命名规范

### 2. 内存与过期（高）

- `ram-limits` - 配置内存限制与淘汰策略
- `ram-ttl` - 为缓存键设置 TTL

### 3. 连接与性能（高）

- `conn-blocking` - 在生产环境中避免慢命令
- `conn-pipelining` - 对批量操作使用管道
- `conn-pooling` - 使用连接池或多路复用
- `conn-timeouts` - 配置连接超时

### 4. JSON 文档（中）

- `json-partial-updates` - 使用 JSON 路径进行部分更新
- `json-vs-hash` - 合理选择 JSON 或 Hash

### 5. Redis Query Engine（高）

- `rqe-dialect` - 查询语法使用 DIALECT 2
- `rqe-field-types` - 选择正确的字段类型
- `rqe-index-creation` - 仅为需要查询的字段建立索引
- `rqe-index-management` - 管理索引以实现零停机更新
- `rqe-query-optimization` - 编写高效的查询

### 6. 向量搜索与 RedisVL（高）

- `vector-algorithm-choice` - 根据需求选择 HNSW 还是 FLAT
- `vector-hybrid-search` - 使用混合搜索获得更好的结果
- `vector-index-creation` - 正确配置向量索引
- `vector-rag-pattern` - 正确实现 RAG 模式

### 7. 语义缓存（中）

- `semantic-cache-best-practices` - 正确配置语义缓存
- `semantic-cache-langcache-usage` - 使用 LangCache 缓存 LLM 响应

### 8. Streams 与 Pub/Sub（中）

- `stream-choosing-pattern` - 合理选择 Streams 还是 Pub/Sub

### 9. 集群与复制（中）

- `cluster-hash-tags` - 对多键操作使用 Hash Tags
- `cluster-read-replicas` - 为读密集型工作负载使用只读副本

### 10. 安全（高）

- `security-acls` - 使用 ACL 实现细粒度访问控制
- `security-auth` - 在生产环境中始终使用身份验证
- `security-network` - 保护网络访问安全

### 11. 可观测性（中）

- `observe-commands` - 使用可观测性命令进行调试
- `observe-metrics` - 监控关键 Redis 指标

## 如何使用

阅读各规则文件以获取详细说明和代码示例：

```
rules/rqe-index-creation.md
rules/vector-rag-pattern.md
```

每个规则文件包含：
- 简要说明其重要性所在
- 附带解释的正确示例
- 要么是 “Incorrect”（错误）示例（针对会造成实际危害的反模式），要么是 “When to use / When NOT needed”（何时使用 / 何时不需要）的指导（针对可选功能）
- 补充背景信息和参考资料

## 完整汇编文档

如需所有规则完整展开的完整指南：`AGENTS.md`
