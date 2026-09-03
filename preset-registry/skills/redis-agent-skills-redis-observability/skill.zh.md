---
name: redis-observability
description: Redis observability guidance — which metrics to monitor (memory, connections, hit ratio, ops/sec, rejected connections), which built-in commands to reach for during incident triage (SLOWLOG, INFO, MEMORY DOCTOR, CLIENT LIST, FT.PROFILE), and when to use the Redis Insight GUI. Use when setting up monitoring or alerts for a Redis instance, diagnosing a performance regression, profiling a slow FT.SEARCH query, or wiring Redis metrics into Prometheus, Datadog, or similar.
license: MIT
metadata:
  author: Redis, Inc.
  version: "0.1.0"
---
# Redis 可观测性

关注什么、运行什么、对什么发出告警。涵盖每个 Redis 部署都应监控的指标，以及用于临时诊断的内置命令。

## 适用场景

- 为 Redis 实例设置监控或告警。
- 诊断 Redis 性能退化（高延迟、内存压力、连接风暴）。
- 分析慢速 `FT.SEARCH` 或流水线的性能。
- 将 Redis 指标接入 Prometheus、Datadog、CloudWatch 或类似系统。

## 1. 监控这些指标

这些指标来自 `INFO`，应导出到你的监控系统。

| 指标 | 含义 | 告警条件 |
|---|---|---|
| `used_memory` | 当前内存使用量 | 超过 `maxmemory` 的 80% |
| `connected_clients` | 已打开的连接数 | 突然激增或骤降 |
| `blocked_clients` | 等待阻塞操作的客户端 | 持续 > 0 |
| `instantaneous_ops_per_sec` | 当前吞吐量 | 显著下降 |
| `keyspace_hits` / `keyspace_misses` | 缓存命中率 | 命中率 < 80% |
| `rejected_connections` | 触及 `maxclients` 上限 | > 0 |
| `rdb_last_save_time` | 上次持久化快照时间 | 相对于 RPO 过旧 |

```python
info = redis.info()
hit_ratio = info["keyspace_hits"] / max(1, info["keyspace_hits"] + info["keyspace_misses"])
print(f"Memory:    {info['used_memory_human']}")
print(f"Clients:   {info['connected_clients']}")
print(f"Ops/sec:   {info['instantaneous_ops_per_sec']}")
print(f"Hit ratio: {hit_ratio:.1%}")
```

参见 [references/metrics.md](references/metrics.md)。

## 2. 用于调试的内置命令

当情况看起来不对劲时，可以使用这些命令。

| 主题 | 命令 |
|---|---|
| 慢命令 | `SLOWLOG GET 10` / `SLOWLOG LEN` / `SLOWLOG RESET` |
| 服务器快照 | `INFO all`（或 `INFO memory` / `INFO stats` / `INFO clients` / `INFO replication`） |
| 内存诊断 | `MEMORY DOCTOR` / `MEMORY STATS` / `MEMORY USAGE <key>` |
| 连接 | `CLIENT LIST` / `CLIENT INFO` |
| RQE / 搜索 | `FT.INFO <idx>` / `FT.PROFILE <idx> SEARCH QUERY "..."` |

事件排查中最有用的两个命令：

- **`SLOWLOG GET`** 用于查找超过 `slowlog-log-slower-than` 阈值（默认 10ms）的查询。输出会显示具体的命令以及以微秒为单位的耗时。
- **`MEMORY DOCTOR`** 用于排查内存压力——它会返回一段摘要，说明当前内存使用有何异常。

```python
for entry in redis.slowlog_get(10):
    print(f"{entry['duration']}μs  {entry['command']}")
```

参见 [references/commands.md](references/commands.md)。

## 3. Redis Insight

在交互式使用场景（运行查询、浏览键、分析索引性能）中，[Redis Insight](https://redis.io/insight/) 是官方 GUI。它以可视化方式呈现同样的 `SLOWLOG` / `INFO` / `FT.PROFILE` 数据，并包含支持自然语言查询的 Redis Copilot。在开发和事件响应期间非常有用；但不能替代将指标导出到监控系统。

## 参考资料

- [Redis：延迟监控](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis Insight](https://redis.io/insight/)
