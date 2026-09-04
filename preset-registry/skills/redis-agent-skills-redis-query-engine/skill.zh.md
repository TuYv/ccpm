---
name: redis-query-engine
description: Redis Query Engine (RQE) guidance covering FT.CREATE schema design, field type selection (TEXT, TAG, NUMERIC, GEO, GEOSHAPE, VECTOR), DIALECT 2 query syntax, efficient FT.SEARCH and FT.AGGREGATE queries, zero-downtime index updates via aliases, and the SKIPINITIALSCAN option. Use when defining a search index on Hash or JSON documents, picking between TEXT and TAG for filtering, writing FT.SEARCH queries with filters and SORTBY, managing or swapping indexes in production, or troubleshooting slow searches with FT.PROFILE.
license: MIT
metadata:
  author: Redis, Inc.
  version: "0.1.0"
---
# Redis 查询引擎

关于使用 Redis 查询引擎（RQE）对 Hash 或 JSON 文档进行索引和搜索的指导。涵盖使用 `FT.CREATE` 进行 schema 设计、字段类型选择、查询语法、索引生命周期管理，以及最常见的性能陷阱。

## 何时使用

- 创建、修改或审查 RQE 索引（`FT.CREATE`、`FT.ALTER`）。
- 编写或优化 `FT.SEARCH` / `FT.AGGREGATE` 查询。
- 为字段在 `TEXT`、`TAG`、`NUMERIC`、`GEO`、`GEOSHAPE` 或 `VECTOR` 之间做选择。
- 在不停机的情况下推出新的索引 schema。
- 创建一个只覆盖新写入键的索引。

## 1. 使用 DIALECT 2（现代默认值）

`DIALECT 2` 是基线要求。其他方言（1、3、4）自 Redis 8 起已被弃用。大多数现代客户端库已默认使用它——但为了可移植性，请在原始命令中显式指定。

```
FT.SEARCH idx:products "@name:laptop" DIALECT 2
```

向量搜索查询**要求**使用 `DIALECT 2`。它还能以可预期的方式处理特殊字符和 NULL 值。

参见 [references/dialect.md](references/dialect.md)。

## 2. 选择正确的字段类型

字段类型既决定了你能查询什么，也决定了查询有多快。请使用能够支持你的访问模式的、最窄的类型。

| 字段类型 | 适用场景 | 说明 |
|---|---|---|
| `TEXT` | 需要全文搜索 | 分词 + 词干化；**不**适合精确匹配 |
| `TAG` | 精确匹配 / 过滤 | 加上 `SORTABLE UNF` 可获得最快的标签查询 |
| `NUMERIC` | 范围查询、排序 | 价格、计数、时间戳 |
| `GEO` | 经纬度点查询 | 单个点（门店、用户） |
| `GEOSHAPE` | 多边形 / 区域查询 | 配送区域、地区 |
| `VECTOR` | 相似度搜索 | HNSW 或 FLAT；参见 redis-vector-search |

典型的错误是“因为它是字符串”就对类别或状态字段使用 `TEXT`。对这类字段 `TAG` 要快 10 倍。

参见 [references/field-types.md](references/field-types.md)。

## 3. 只索引你要查询的内容——并始终设置前缀

不带 `PREFIX` 的 `FT.CREATE` 会索引数据库中**每一个**匹配的键；如果 schema 很宽，这可能使索引体积和写入延迟急剧膨胀。

```
FT.CREATE idx:products ON HASH PREFIX 1 product:
    SCHEMA
        name TEXT WEIGHT 2.0
        category TAG SORTABLE
        price NUMERIC SORTABLE
        location GEO
```

经验法则：

- 从最小化的 schema 开始。随着新查询模式的出现再添加字段。
- 始终设置 `PREFIX`（或通过 `FILTER` 表达式过滤）。
- 添加字段后使用 `FT.INFO idx:<name>` 监控索引大小。
- 只在真正用于排序的字段上使用 `SORTABLE`；它有内存开销。

参见 [references/index-creation.md](references/index-creation.md)。

## 4. 零停机更新索引——使用别名

在生产环境中进行 schema 变更时，让应用查询始终指向一个别名，然后切换底层的索引。

```
FT.CREATE idx:products_v2 ON HASH PREFIX 1 product: SCHEMA ...
FT.ALIASUPDATE products idx:products_v2

# App queries are stable:
FT.SEARCH products "@category:{electronics}"
```

实用的管理命令：`FT.INFO`、`FT.DROPINDEX`、`FT._LIST`、`FT.ALIASADD/UPDATE/DEL`。

参见 [references/index-management.md](references/index-management.md)。

## 5. SKIPINITIALSCAN——仅当历史数据无关紧要时使用

默认情况下，`FT.CREATE` 会遍历所有匹配前缀的现有键并对它们建立索引。仅在以下情况使用 `SKIPINITIALSCAN`：

- 你在为*新*功能建立索引，而现有数据不应可被查询。
- 现有数据量太大，无法同步扫描。
- 你在为事件流建立索引，只有未来发生的事件才有意义。

对大多数 schema 迁移而言，默认行为（扫描全部）正是你想要的。

参见 [references/skip-initial-scan.md](references/skip-initial-scan.md)。

## 6. 编写具体的查询，而不是 `*`

在分页或聚合之前，先用过滤器缩小结果集。

```
# Good — specific filter, limited fields returned
FT.SEARCH idx:products "@category:{electronics} @price:[100 500]"
    LIMIT 0 20
    RETURN 3 name price category
```

```
# Bad — full scan plus unbounded LIMIT
FT.SEARCH idx:products "*" LIMIT 0 10000
```

其他优化手段：

- `SORTBY` 要求排序字段上有 `SORTABLE`。没有它，排序会很慢。
- 尽早设置 `LIMIT`；否则引擎仍会处理限制之上的全部内容。
- 用 `RETURN` 返回特定字段——如果只需要少数几个字段，就不要取回整个文档。
- 当查询缓慢时，使用 `FT.PROFILE idx:<name> SEARCH QUERY "<query>"` 进行性能剖析。

参见 [references/query-optimization.md](references/query-optimization.md)。

## 参考资料

- [Redis：查询引擎——索引](https://redis.io/docs/latest/develop/interact/search-and-query/indexing/)
- [Redis：查询语法](https://redis.io/docs/latest/develop/interact/search-and-query/query/)
- [Redis：查询方言](https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/dialects/)
- [Redis：管理（别名、dropindex）](https://redis.io/docs/latest/develop/interact/search-and-query/administration/)
- [FT.CREATE](https://redis.io/docs/latest/commands/ft.create/)
