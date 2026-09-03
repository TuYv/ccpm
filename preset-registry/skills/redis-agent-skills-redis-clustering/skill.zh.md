---
name: redis-clustering
description: Redis Cluster and replication guidance covering hash tags for multi-key operations, avoiding CROSSSLOT errors, and reading from replicas to scale read-heavy workloads. Use when designing keys for a sharded Redis Cluster, debugging CROSSSLOT errors on MGET / SDIFF / pipelines, configuring a multi-key transaction in a cluster, or routing reads to replicas for caches, analytics, or dashboards.
license: MIT
metadata:
  author: Redis, Inc.
  version: "0.1.0"
---
# Redis 集群

针对分片式 Redis Cluster（以及独立的主从复制部署）中键设计与读请求路由的指导。涵盖最容易让新接触集群的用户吃亏的两种故障模式：多键操作上的 `CROSSSLOT` 错误，以及读流量导致主节点过载。

## 适用场景

- 为 Redis Cluster 部署设计键。
- 调试 `MGET`、`SDIFF`、事务或流水线上的 `CROSSSLOT` 错误。
- 实现涉及多个键的事务 / Lua 脚本。
- 在不增加分片的情况下扩展读流量。

## 1. 用于多键操作的哈希标签

Redis Cluster 通过对键名做哈希，将键分布到 16,384 个槽位上。任何涉及**多个键**的命令（`MGET`、`SDIFF`、`SUNIONSTORE`、事务、流水线、包含多个 `KEYS[]` 的 Lua 脚本）都要求所有键位于**同一个槽位**——否则服务器会返回 `CROSSSLOT` 错误。

哈希标签（hash tag）正是用来满足这一要求的：在槽位分配中，只有 `{` 和 `}` 之间的部分参与哈希计算，因此共享同一哈希标签的两个键总会落在同一个槽位上。

```python
# Same slot — multi-key ops work
redis.set("{user:1001}:profile",  "...")
redis.set("{user:1001}:settings", "...")
redis.lmove("{user:1001}:pending", "{user:1001}:processed", "LEFT", "RIGHT")
```

```python
# Different keys, no hash tag — CROSSSLOT on multi-key commands in cluster mode
redis.set("user:1001:profile",  "...")
redis.set("user:1001:settings", "...")
pipe = redis.pipeline()
pipe.get("user:1001:profile")
pipe.get("user:1001:settings")
pipe.execute()  # CROSSSLOT error in cluster
```

经验法则：

- **使用限定在有意义的实体范围内的标签**，例如 `{user:1001}`。避免使用裸的 `{1001}`——互不相关的命名空间（`purchase:{1001}`、`employee:{1001}`）会全部挤到同一个槽位上。
- **只在实际需要多键操作的地方加标签。** 到处加标签会制造热点，违背分片的初衷。
- 对带哈希标签的键执行单键命令完全没问题，因此后续补充标签是渐进可行的——但在生产环境中重命名键非常麻烦，所以要为将来要分组的实体提前规划好标签方案。

参见 [references/hash-tags.md](references/hash-tags.md)。

## 2. 面向读多写少负载的只读副本

如果读远多于写，可以把读流量路由到副本，从而释放主节点容量。这在 Redis Cluster（每个分片有 1 个或多个副本）和独立的主从复制部署中都适用。

```python
# Redis Cluster: enable replica reads on the client
from redis.cluster import RedisCluster

rc = RedisCluster(host="localhost", port=6379, read_from_replicas=True)
rc.set("key", "value")     # → primary
value = rc.get("key")       # → may be served by a replica
```

对于非集群部署，将两个客户端分别指向对应的节点：

```python
primary = Redis(host="primary-host", port=6379)
replica = Redis(host="replica-host", port=6379)
primary.set("key", "value")
value = replica.get("key")
```

代价在于一致性：**副本是最终一致的**。不要从副本上读取你自己刚写入的数据；也不要对任何要求严格新鲜度的场景（资金余额、幂等状态）使用副本读取。适合的场景：缓存层、数据分析、仪表盘、推荐信息流。

参见 [references/read-replicas.md](references/read-replicas.md)。

## 参考资料

- [Redis Cluster 规范 —— 哈希标签](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/#hash-tags)
- [Redis：集群中的多键操作](https://redis.io/docs/latest/operate/rs/databases/durability-ha/clustering/#multikey-operations)
- [Redis：复制](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)
