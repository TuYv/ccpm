---
name: redis-connections
description: Redis client and connection guidance covering connection pooling, multiplexing, pipelining, client-side caching with RESP3, avoiding slow commands (KEYS, SMEMBERS, HGETALL), and tuning socket timeouts. Use when configuring a Redis client (redis-py, Jedis, Lettuce, NRedisStack), batching commands for throughput, eliminating per-request connection creation, iterating large keyspaces with SCAN, enabling client-side caching for read-heavy workloads, or setting connect and read timeouts.
license: MIT
metadata:
  author: Redis, Inc.
  version: "0.1.0"
---
# Redis 连接

关于如何高效与 Redis 通信的客户端侧指南：如何共享连接、如何批量执行命令、哪些命令不应在生产环境中调用、何时启用客户端缓存，以及如何设置既能快速失败又不影响正常流量的超时时间。

## 适用场景

- 创建或评审 Redis 客户端配置（redis-py、Jedis、Lettuce、go-redis、NRedisStack）。
- 发起大量小型 Redis 调用，并想知道延迟来自哪里。
- 迭代大型键空间、集合、哈希或列表。
- 为热点键启用客户端缓存。
- 调优连接 / 读 / 写超时。

## 1. 连接池或多路复用——绝不要每个请求一个连接

Redis 客户端代码中最大的错误就是为每次操作都新建一个 TCP 连接。应始终采用以下两种方式之一：

- **连接池（Pool）**——维持 N 个持久连接，由应用在每次调用时租用（redis-py `ConnectionPool`、Jedis `JedisPooled`、go-redis 客户端）。
- **多路复用（Multiplex）**——所有请求共享单个连接（Lettuce、NRedisStack）。

| 模式 | 采用者 | 说明 |
|---|---|---|
| 连接池 | redis-py, Jedis, go-redis | 池耗尽时后续租用会阻塞；根据并发量设置池的大小 |
| 多路复用 | Lettuce, NRedisStack | 单个连接；**无法**执行 `BLPOP` 之类的阻塞命令 |

```python
# redis-py — connection pool
pool = redis.ConnectionPool(host="localhost", port=6379, max_connections=50)
r = redis.Redis(connection_pool=pool)
```

Python + Java + Lettuce 的示例见 [references/pooling.md](references/pooling.md)。

## 2. 用管道批量处理工作

对于 N 条彼此结果互不依赖的命令，使用管道（pipelining）作为单个批次发送。一次往返代替 N 次。

```python
pipe = redis.pipeline()
for user_id in user_ids:
    pipe.get(f"user:{user_id}")
results = pipe.execute()
```

出于性能考虑应使用**非事务性**管道，只有当你确实需要原子性时才使用 `pipeline(transaction=True)`（参见 redis-core 的事务指南）。

参见 [references/pipelining.md](references/pipelining.md)。

## 3. 避免扫描全量数据的命令

任何遍历整个键空间（或整个大型容器）的操作都会阻塞服务器。应改用增量式变体。

| 不要使用 | 应使用 |
|---|---|
| `KEYS pattern` | `SCAN` 游标循环 |
| `SMEMBERS large_set` | `SSCAN` |
| `HGETALL large_hash` | `HSCAN` |
| 对巨型列表使用 `LRANGE 0 -1` | 分页（`LRANGE 0 100`） |

```python
cursor = 0
while True:
    cursor, keys = redis.scan(cursor, match="user:*", count=100)
    for key in keys:
        process(key)
    if cursor == 0:
        break
```

**阻塞命令（`BLPOP`、`BRPOP`、`BLMOVE`）是另一回事**——它们有意等待数据，对队列消费者完全适用，但务必传入超时时间，并且不要在多路复用连接（Lettuce、NRedisStack）上执行它们。

参见 [references/blocking.md](references/blocking.md)。

## 4. 为热点键启用客户端缓存

对于读多写少的数据（配置、功能开关、每个请求都要读取的会话），启用 RESP3 客户端缓存。客户端保留一份本地副本，服务器在写入时使其失效——从而省去热点读取的往返开销。

```python
client = redis.Redis(
    host="localhost",
    port=6379,
    protocol=3,                                    # RESP3 is required
    cache_config=redis.CacheConfig(max_size=1000),
)
```

对于写密集型工作负载或频繁变化的数据，不要启用它——失效通知流量会超过带来的节省。

参见 [references/client-cache.md](references/client-cache.md)。

## 5. 设置显式超时

默认值因客户端而异，可能过于宽松。应选择与*应用自身*故障模型相匹配的值：

```python
r = redis.Redis(
    host="localhost",
    socket_connect_timeout=2.0,   # fail fast on dead nodes
    socket_timeout=5.0,           # tune to expected operation time
    retry_on_timeout=True,
)
```

经验法则：连接超时应短于读/写超时。延迟敏感路径使用紧凑超时 + 超时重试；批量任务则使用更长的超时。

参见 [references/timeouts.md](references/timeouts.md)。

## 参考资料

- [Redis：连接池与多路复用](https://redis.io/docs/latest/develop/clients/pools-and-muxing/)
- [Redis：管道](https://redis.io/docs/latest/develop/use/pipelining/)
- [Redis：SCAN](https://redis.io/docs/latest/commands/scan/)
- [Redis：客户端缓存](https://redis.io/docs/latest/develop/clients/client-side-caching/)
- [Redis：客户端](https://redis.io/docs/latest/develop/clients/)
