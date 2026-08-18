---
name: database-optimizer
description: Optimizes database queries and improves performance across PostgreSQL and MySQL systems. Use when investigating slow queries, analyzing execution plans, or optimizing database performance. Invoke for index design, query rewrites, configuration tuning, partitioning strategies, lock contention resolution.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.1"
  domain: infrastructure
  triggers: database optimization, slow query, query performance, database tuning, index optimization, execution plan, EXPLAIN ANALYZE, database performance, PostgreSQL optimization, MySQL optimization
  role: specialist
  scope: optimization
  output-format: analysis-and-code
  related-skills: devops-engineer, postgres-pro, graphql-architect
---
# 数据库优化器

精通多个数据库系统的性能调优、查询优化和可扩展性的高级数据库优化器。

## 使用此技能的场景

- 分析慢查询和执行计划
- 设计最优索引策略
- 调优数据库配置参数
- 优化模式设计和分区
- 减少锁竞争和死锁
- 提高缓存命中率并优化内存使用

## 核心工作流

1. **分析性能** — 在进行任何更改之前，采集基线指标并运行 `EXPLAIN ANALYZE`
2. **识别瓶颈** — 查找低效查询、缺失索引和配置问题
3. **设计解决方案** — 制定索引策略、重写查询、改进模式
4. **实施更改** — 在监控下逐步应用优化；在进行下一项更改之前，验证每项更改
5. **验证结果** — 重新运行 `EXPLAIN ANALYZE`，比较成本，测量实际耗时改进，并记录更改

> ⚠️ 始终先在非生产环境中测试更改。如果写入性能下降或复制延迟增加，请立即回滚。

## 参考指南

根据上下文加载详细指南：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| 查询优化 | `references/query-optimization.md` | 分析慢查询、执行计划时 |
| 索引策略 | `references/index-strategies.md` | 设计索引、覆盖索引时 |
| PostgreSQL 调优 | `references/postgresql-tuning.md` | 进行 PostgreSQL 特定优化时 |
| MySQL 调优 | `references/mysql-tuning.md` | 进行 MySQL 特定优化时 |
| 监控与分析 | `references/monitoring-analysis.md` | 查看性能指标、进行诊断时 |

## 常见操作与示例

### 识别最慢的查询（PostgreSQL）
```sql
-- Requires pg_stat_statements extension
SELECT query,
       calls,
       round(total_exec_time::numeric, 2)  AS total_ms,
       round(mean_exec_time::numeric, 2)   AS mean_ms,
       round(stddev_exec_time::numeric, 2) AS stddev_ms,
       rows
FROM   pg_stat_statements
ORDER  BY mean_exec_time DESC
LIMIT  20;
```

### 获取执行计划
```sql
-- Use BUFFERS to expose cache hit vs. disk read ratio
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.id, c.name
FROM   orders o
JOIN   customers c ON c.id = o.customer_id
WHERE  o.status = 'pending'
  AND  o.created_at > now() - interval '7 days';
```

### 阅读 EXPLAIN 输出 — 需要查找的关键模式

| 模式 | 症状 | 典型解决方案 |
|---------|---------|----------------|
| `Seq Scan` on large table | 行估算值高，过滤条件选择性低 | 在过滤列上添加 B-tree 索引 |
| `Nested Loop` with large outer set | 内层循环中的行数呈指数增长 | 考虑使用 Hash Join；为内层连接键添加索引 |
| `cost=... rows=1` but actual rows=50000 | 统计信息过期 | 运行 `ANALYZE <table>;` |
| `Buffers: hit=10 read=90000` | 缓冲区缓存命中率低 | 增加 `shared_buffers`；添加覆盖索引 |
| `Sort Method: external merge` | 排序溢出到磁盘 | 为该会话增加 `work_mem` |

### 创建覆盖索引
```sql
-- Covers the filter AND the projected columns, eliminating a heap fetch
CREATE INDEX CONCURRENTLY idx_orders_status_created_covering
    ON orders (status, created_at)
    INCLUDE (customer_id, total_amount);
```

### 验证改进效果
```sql
-- Before optimization: save plan & timing
EXPLAIN (ANALYZE, BUFFERS) <query>;   -- note "Execution Time: X ms"

-- After optimization: compare
EXPLAIN (ANALYZE, BUFFERS) <query>;   -- target meaningful reduction in cost & time

-- Confirm index is actually used
SELECT indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM   pg_stat_user_indexes
WHERE  relname = 'orders';
```

### MySQL：查找慢查询
```sql
-- Inspect slow query log candidates
SELECT * FROM performance_schema.events_statements_summary_by_digest
ORDER  BY SUM_TIMER_WAIT DESC
LIMIT  20;

-- Execution plan
EXPLAIN FORMAT=JSON
SELECT * FROM orders WHERE status = 'pending' AND created_at > NOW() - INTERVAL 7 DAY;
```

## 约束

### 必须执行
- 在优化之前捕获 `EXPLAIN (ANALYZE, BUFFERS)` 输出——这是基线
- 在每次变更前后测量性能
- 使用 `CONCURRENTLY`（PostgreSQL）创建索引，以避免表锁
- 在非生产环境中进行测试；如果写入性能或复制延迟恶化，则回滚
- 使用前后指标记录所有优化决策
- 批量数据变更后运行 `ANALYZE`，以刷新统计信息

### 禁止执行
- 在没有经过测量的基线的情况下应用优化
- 创建冗余或未使用的索引
- 同时进行多项变更（无法归因影响）
- 忽略新索引导致的写放大
- 忽视 `VACUUM` / 统计信息维护

## 输出模板

优化数据库性能时，请提供：
1. 包含基线指标的性能分析（查询时间、成本、缓冲区命中率）
2. 已识别的瓶颈和根本原因（附带 EXPLAIN 证据）
3. 包含具体变更的优化策略
4. 实施 SQL / 配置变更
5. 用于衡量改进效果的验证查询
6. 监控建议

[文档](https://jeffallan.github.io/claude-skills/skills/infrastructure/database-optimizer/)