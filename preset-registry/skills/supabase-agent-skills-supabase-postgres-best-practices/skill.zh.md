---
name: supabase-postgres-best-practices
description: "Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Postgres database: creating or altering tables and columns (including choosing column types), schema design, migrations and declarative schema files, RLS policies and the tests that verify them, indexes, triggers, database functions, queues and scheduled jobs (pg_cron, pgmq), vector/semantic search (pgvector), and restoring dumps (pg_restore) or importing data. Also load it when diagnosing slow queries, high CPU, timeouts, EXPLAIN plans, connection exhaustion, locking, bloat, or rows visible to the wrong user or tenant. This is not just a performance guide — schema, migration, security, and SQL authoring tasks need these rules too, even for a one-column change or a single query."
license: MIT
metadata:
  author: supabase
  version: "1.1.1"
  organization: Supabase
  date: January 2026
  abstract: Comprehensive Postgres performance optimization guide for developers using Supabase and Postgres. Contains performance rules across 8 categories, prioritized by impact from critical (query performance, connection management) to incremental (advanced features). Each rule includes detailed explanations, incorrect vs. correct SQL examples, query plan analysis, and specific performance metrics to guide automated optimization and code generation.
---
# Supabase Postgres 最佳实践

由 Supabase 维护的 Postgres 全面性能优化指南。包含 8 个类别的规则，按影响程度划分优先级，用于指导自动化查询优化和 schema 设计。

## 何时应用

在下列情况下参考这些指南：
- 编写 SQL 查询或设计 schema
- 创建索引或进行查询优化
- 审查数据库性能问题
- 配置连接池或扩缩容
- 针对 Postgres 特有特性进行优化
- 使用行级安全（RLS）

## 按优先级排序的规则类别

| 优先级 | 类别 | 影响 | 前缀 |
|----------|----------|--------|--------|
| 1 | 查询性能 | 严重 | `query-` |
| 2 | 连接管理 | 严重 | `conn-` |
| 3 | 安全与 RLS | 严重 | `security-` |
| 4 | Schema 设计 | 高 | `schema-` |
| 5 | 并发与锁 | 中高 | `lock-` |
| 6 | 数据访问模式 | 中 | `data-` |
| 7 | 监控与诊断 | 中低 | `monitor-` |
| 8 | 高级特性 | 低 | `advanced-` |

## 如何使用

阅读各个规则文件以获取详细说明和 SQL 示例：

```
references/query-missing-indexes.md
references/query-partial-indexes.md
references/_sections.md
```

每个规则文件包含：
- 简要说明为何重要
- 附有说明的错误 SQL 示例
- 附有说明的正确 SQL 示例
- 可选的 EXPLAIN 输出或指标
- 补充的上下文和参考资料
- Supabase 特定的说明（如适用）

## 参考资料

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security
