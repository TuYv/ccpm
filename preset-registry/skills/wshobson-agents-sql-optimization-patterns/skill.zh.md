---
name: sql-optimization-patterns
description: Master SQL query optimization, indexing strategies, and EXPLAIN analysis to dramatically improve database performance and eliminate slow queries. Use when debugging slow queries, designing database schemas, or optimizing application performance.
---
# SQL 优化模式

通过系统化优化、合理的索引设计和查询计划分析，将缓慢的数据库查询转变为闪电般的快速操作。

## 何时使用此技能

- 调试运行缓慢的查询
- 设计高性能的数据库 schema
- 优化应用响应时间
- 降低数据库负载和成本
- 提升不断增长的数据集的可扩展性
- 分析 EXPLAIN 查询计划
- 实现高效的索引
- 解决 N+1 查询问题

## 核心概念

### 1. 查询执行计划（EXPLAIN）

理解 EXPLAIN 输出是优化的基础。

**PostgreSQL EXPLAIN：**

```sql
-- Basic explain
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- With actual execution stats
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user@example.com';

-- Verbose output with more details
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT u.*, o.order_total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days';
```

**需要关注的关键指标：**

- **Seq Scan**：全表扫描（对大表通常很慢）
- **Index Scan**：使用索引（好）
- **Index Only Scan**：使用索引而不触碰表（最好）
- **Nested Loop**：连接方法（适用于小数据集）
- **Hash Join**：连接方法（适用于较大的数据集）
- **Merge Join**：连接方法（适用于已排序的数据）
- **Cost**：估算的查询成本（越低越好）
- **Rows**：预计返回的行数
- **Actual Time**：实际执行时间

### 2. 索引策略

索引是最强大的优化工具。

**索引类型：**

- **B-Tree**：默认类型，适合等值和范围查询
- **Hash**：仅适用于等值（=）比较
- **GIN**：全文搜索、数组查询、JSONB
- **GiST**：几何数据、全文搜索
- **BRIN**：块范围索引（Block Range INdex），适用于具有相关性的超大表

```sql
-- Standard B-Tree index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (order matters!)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial index (index subset of rows)
CREATE INDEX idx_active_users ON users(email)
WHERE status = 'active';

-- Expression index
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- Covering index (include additional columns)
CREATE INDEX idx_users_email_covering ON users(email)
INCLUDE (name, created_at);

-- Full-text search index
CREATE INDEX idx_posts_search ON posts
USING GIN(to_tsvector('english', title || ' ' || body));

-- JSONB index
CREATE INDEX idx_metadata ON events USING GIN(metadata);
```

### 3. 查询优化模式

**避免 SELECT \*：**

```sql
-- Bad: Fetches unnecessary columns
SELECT * FROM users WHERE id = 123;

-- Good: Fetch only what you need
SELECT id, email, name FROM users WHERE id = 123;
```

**高效使用 WHERE 子句：**

```sql
-- Bad: Function prevents index usage
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Good: Create functional index or use exact match
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
-- Then:
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Or store normalized data
SELECT * FROM users WHERE email = 'user@example.com';
```

**优化 JOIN：**

```sql
-- Bad: Cartesian product then filter
SELECT u.name, o.total
FROM users u, orders o
WHERE u.id = o.user_id AND u.created_at > '2024-01-01';

-- Good: Filter before join
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01';

-- Better: Filter both tables
SELECT u.name, o.total
FROM (SELECT * FROM users WHERE created_at > '2024-01-01') u
JOIN orders o ON u.id = o.user_id;
```

## 详细模式与实例

详细的模式文档位于 `references/details.md`。当上方的导航层级不足以满足需求时，请阅读该文件。

## 最佳实践

1. **有选择地建立索引**：过多的索引会拖慢写入速度
2. **监控查询性能**：使用慢查询日志
3. **保持统计信息更新**：定期运行 ANALYZE
4. **使用合适的数据类型**：更小的类型 = 更好的性能
5. **审慎地进行规范化**：在规范化与性能之间取得平衡
6. **缓存频繁访问的数据**：使用应用级缓存
7. **连接池**：复用数据库连接
8. **定期维护**：VACUUM、ANALYZE、重建索引

```sql
-- Update statistics
ANALYZE users;
ANALYZE VERBOSE orders;

-- Vacuum (PostgreSQL)
VACUUM ANALYZE users;
VACUUM FULL users;  -- Reclaim space (locks table)

-- Reindex
REINDEX INDEX idx_users_email;
REINDEX TABLE users;
```

## 常见陷阱

- **过度索引**：每个索引都会拖慢 INSERT/UPDATE/DELETE
- **未使用的索引**：浪费空间并拖慢写入
- **缺失索引**：查询缓慢、全表扫描
- **隐式类型转换**：导致无法使用索引
- **OR 条件**：无法高效地使用索引
- **前导通配符的 LIKE**：`LIKE '%abc'` 无法使用索引
- **WHERE 中的函数**：除非存在函数索引，否则无法使用索引

## 监控查询

```sql
-- Find slow queries (PostgreSQL)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Find missing indexes (PostgreSQL)
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / seq_scan AS avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 10;

-- Find unused indexes (PostgreSQL)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```
