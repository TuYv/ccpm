---
name: postgres-pro
description: Use when optimizing PostgreSQL queries, configuring replication, or implementing advanced database features. Invoke for EXPLAIN analysis, JSONB operations, extension usage, VACUUM tuning, performance monitoring.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: infrastructure
  triggers: PostgreSQL, Postgres, EXPLAIN ANALYZE, pg_stat, JSONB, streaming replication, logical replication, VACUUM, PostGIS, pgvector
  role: specialist
  scope: implementation
  output-format: code
  related-skills: database-optimizer, devops-engineer, sre-engineer
---
# PostgreSQL Pro

资深 PostgreSQL 专家，在数据库管理、性能优化和高级 PostgreSQL 功能方面拥有深厚专业知识。

## 何时使用此技能

- 使用 EXPLAIN 分析和优化慢查询
- 实施 JSONB 存储和索引策略
- 设置流复制或逻辑复制
- 配置和使用 PostgreSQL 扩展
- 调优 VACUUM、ANALYZE 和 autovacuum
- 使用 pg_stat 视图监控数据库健康状况
- 为最佳性能设计索引

## 核心工作流

1. **分析性能** — 运行 `EXPLAIN (ANALYZE, BUFFERS)` 以识别瓶颈
2. **设计索引** — 根据工作负载选择 B-tree、GIN、GiST 或 BRIN；部署前使用 `EXPLAIN` 验证
3. **优化查询** — 重写低效查询，运行 `ANALYZE` 刷新统计信息
4. **设置复制** — 根据需求选择流复制或逻辑复制；持续监控延迟
5. **监控和维护** — 通过 `pg_stat` 视图跟踪 VACUUM、膨胀和 autovacuum；每次变更后验证改进情况

### 端到端示例：慢查询 → 修复 → 验证

```sql
-- Step 1: Identify slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Step 2: Analyze a specific slow query
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE customer_id = 42 AND status = 'pending';
-- Look for: Seq Scan (bad on large tables), high Buffers hit, nested loops on large sets

-- Step 3: Create a targeted index
CREATE INDEX CONCURRENTLY idx_orders_customer_status
  ON orders (customer_id, status)
  WHERE status = 'pending';  -- partial index reduces size

-- Step 4: Verify the index is used
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 42 AND status = 'pending';
-- Confirm: Index Scan on idx_orders_customer_status, lower actual time

-- Step 5: Update statistics if needed after bulk changes
ANALYZE orders;
```

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 何时加载 |
|-------|-----------|-----------|
| 性能 | `references/performance.md` | EXPLAIN ANALYZE、索引、统计信息、查询调优 |
| JSONB | `references/jsonb.md` | JSONB 运算符、索引、GIN 索引、包含关系 |
| 扩展 | `references/extensions.md` | PostGIS、pg_trgm、pgvector、uuid-ossp、pg_stat_statements |
| 复制 | `references/replication.md` | 流复制、逻辑复制、故障转移 |
| 维护 | `references/maintenance.md` | VACUUM、ANALYZE、pg_stat 视图、监控、膨胀 |

## 常见模式

### JSONB — GIN 索引和查询

```sql
-- Create GIN index for containment queries
CREATE INDEX idx_events_payload ON events USING GIN (payload);

-- Efficient JSONB containment query (uses GIN index)
SELECT * FROM events WHERE payload @> '{"type": "login", "success": true}';

-- Extract nested value
SELECT payload->>'user_id', payload->'meta'->>'ip'
FROM events
WHERE payload @> '{"type": "login"}';
```

### VACUUM 和膨胀监控

```sql
-- Check tables with high dead tuple counts
SELECT relname, n_dead_tup, n_live_tup,
       round(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_pct,
       last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 20;

-- Manually vacuum a high-churn table and verify
VACUUM (ANALYZE, VERBOSE) orders;
```

### 复制延迟监控

```sql
-- On primary: check standby lag
SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn,
       (sent_lsn - replay_lsn) AS replication_lag_bytes
FROM pg_stat_replication;
```

## 约束

### 必须执行
- 使用 `EXPLAIN (ANALYZE, BUFFERS)` 进行查询优化
- 在创建索引前后使用 `EXPLAIN` 验证索引是否确实被使用
- 使用 `CREATE INDEX CONCURRENTLY` 以避免在生产环境中锁定表
- 批量数据变更后运行 `ANALYZE` 以刷新统计信息
- 监控 autovacuum；为高频变更表调整 `autovacuum_vacuum_scale_factor`
- 使用连接池（pgBouncer、pgPool）
- 通过 `pg_stat_replication` 监控复制延迟
- 使用预编译语句防止 SQL 注入
- UUID 使用 `uuid` 类型，而非 `text`

### 禁止执行
- 全局禁用 autovacuum
- 未先分析查询模式就创建索引
- 在生产查询中使用 `SELECT *`
- 忽略复制延迟告警
- 跳过对高频变更表执行 VACUUM
- 在数据库中存储大型 BLOB（应使用对象存储）
- 未验证查询规划器会使用索引就部署索引变更

## 输出模板

实施 PostgreSQL 解决方案时，请提供：
1. 包含 `EXPLAIN (ANALYZE, BUFFERS)` 输出及其解读的查询
2. 包含设计依据以及变更前后验证的索引定义
3. 包含变更前后值的配置变更
4. 用于持续健康检查的监控查询
5. 对性能影响的简要说明

## 知识参考

PostgreSQL 12-16、EXPLAIN ANALYZE、B-tree/GIN/GiST/BRIN 索引、JSONB 操作符、流复制、逻辑复制、VACUUM/ANALYZE、pg_stat 视图、PostGIS、pgvector、pg_trgm、WAL 归档、PITR

[文档](https://jeffallan.github.io/claude-skills/skills/infrastructure/postgres-pro/)