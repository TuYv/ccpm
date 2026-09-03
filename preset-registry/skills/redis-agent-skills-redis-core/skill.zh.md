---
name: redis-core
description: Core Redis modeling guidance — choose the right data structure (String, Hash, List, Set, Sorted Set, JSON, Stream, Vector Set) and use consistent colon-separated key names. Use when designing a Redis data model, caching objects, deciding between Hash and JSON, building counters, leaderboards, membership sets, or session stores, or when reviewing/cleaning up Redis key naming.
license: MIT
metadata:
  author: Redis, Inc.
  version: "0.1.0"
---
# Redis 核心

关于在 Redis 中进行数据建模的基础指南。涵盖数据类型选择和键名约定——这两项决策对内存占用、性能和可维护性的影响最为直接。

## 何时应用

- 缓存对象、会话或用户级状态。
- 计数器、排行榜、最近项目列表、唯一成员集合。
- 审查或重构 Redis 键名。
- 为实体在 Redis Hash 和 JSON 文档之间做选择。

## 1. 选择合适的数据结构

选择与*访问模式*相匹配的类型，而不仅仅是数据的形状。

| 使用场景 | 推荐类型 | 原因 |
|---|---|---|
| 简单值、计数器 | String | 原子性的 `INCR`/`DECR`、`SET`/`GET` |
| 字段需要独立更新的对象 | Hash | 按字段读写，无需重写整个对象 |
| 队列、最近 N 项 | List | 两端均为 O(1) 的 push/pop |
| 唯一项、成员资格检查 | Set | O(1) 的 `SADD`/`SISMEMBER`/`SCARD` |
| 排名、基于分数的范围查询 | Sorted Set | 按分数排序；`ZADD`/`ZRANGE`/`ZRANK` |
| 嵌套/分层数据 | JSON | 路径级更新、嵌套数组、RQE 索引 |
| 事件日志、扇出式消息分发 | Stream | 持久化、消费者组 |
| 向量相似度 | Vector Set | 原生向量存储，支持 HNSW |

**常见反模式：**把扁平对象塞进序列化的字符串里。更新一个字段意味着获取 + 解析 + 修改 + 重写。应改用 Hash。

完整的理由说明和 Python/Java 示例见 [references/choose-data-structure.md](references/choose-data-structure.md)。

## 2. 使用一致的键名

使用带有稳定层级结构的 `colon-separated` 段：

```
{entity}:{id}:{attribute}
user:1001:profile
user:1001:settings
order:2024:items
session:abc123
article:987:likes
game:space-invaders:leaderboard
```

经验法则：

- **小写、冒号分隔。**不含空格，不混用大小写（`User_1001_Profile` 是错误示范）。
- **保持键简短但可读**——键驻留在内存中，而且会出现在每条命令里。
- **不要把完整 URL 或长字符串用作键。**提取一个简短的标识符，或使用该 URL 的哈希摘要。
- **多租户场景使用前缀**（`tenant:42:user:7:cart`），这样扫描和 ACL 就能干净地针对单个租户。
- **保持一致。**每个服务选定一种约定，并应用到所有键上。

清理示例与边界情况见 [references/key-naming.md](references/key-naming.md)。

## 参考资料

- [Redis：选择合适的数据类型](https://redis.io/docs/latest/develop/data-types/compare-data-types/)
- [Redis：键](https://redis.io/docs/latest/develop/use/keyspace/)
