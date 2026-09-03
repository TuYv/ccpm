---
name: postgres
description: |
  Use this skill for any PostgreSQL database work — table design, indexing, data types, constraints, extensions (pgvector, PostGIS, TimescaleDB), search, and migrations.

  **Trigger when user asks to:**
  - Design or modify PostgreSQL tables, schemas, or data models
  - Choose data types, constraints, indexes, or partitioning strategies
  - Work with pgvector embeddings, semantic search, or RAG
  - Set up full-text search, hybrid search, or BM25 ranking
  - Use PostGIS for spatial/geographic data
  - Set up TimescaleDB hypertables for time-series data
  - Migrate tables to hypertables or evaluate migration candidates
  - Plan or execute safe schema migrations with zero downtime
  - Create, fork, or manage databases with Ghost

  **Keywords:** PostgreSQL, Postgres, SQL, schema, table design, indexes, constraints, pgvector, PostGIS, TimescaleDB, hypertable, semantic search, hybrid search, BM25, time-series, migration, Ghost
license: Apache-2.0
metadata:
  author: tigerdata
---
# PostgreSQL 专家技能

本技能通过专门的参考文档提供全面的 PostgreSQL 专业知识。请根据任务加载相应的参考文档。

## 可用参考文档

### 表设计
- **[design-postgres-tables](references/design-postgres-tables.md)** — 数据类型、约束、索引、JSONB 模式、分区以及 PostgreSQL 最佳实践。**适用于任何常规的表/模式设计任务。**
- **[design-postgis-tables](references/design-postgis-tables.md)** — PostGIS 空间表设计：geometry 与 geography 类型、SRID、空间索引以及基于位置的查询模式。**适用于涉及地理或空间数据的任务。**

### 搜索
- **[pgvector-semantic-search](references/pgvector-semantic-search.md)** — 使用 pgvector 进行向量相似度搜索：HNSW/IVFFlat 索引、halfvec 存储、量化、过滤搜索与调优。**适用于嵌入、RAG 或语义搜索。**
- **[postgres-hybrid-text-search](references/postgres-hybrid-text-search.md)** — 使用 RRF 将 BM25 关键词搜索与 pgvector 语义搜索相结合的混合搜索。**适用于需要结合关键词搜索与基于语义的搜索的场景。**

### TimescaleDB
- **[setup-timescaledb-hypertables](references/setup-timescaledb-hypertables.md)** — 超表创建、压缩、保留策略、连续聚合与索引。**适用于从零开始搭建 TimescaleDB 的场景。**
- **[find-hypertable-candidates](references/find-hypertable-candidates.md)** — 用于分析现有表并为其超表转换适合度打分的 SQL 查询。**适用于评估哪些表需要迁移的场景。**
- **[migrate-postgres-tables-to-hypertables](references/migrate-postgres-tables-to-hypertables.md)** — 分步迁移：分区列选择、原地迁移 vs 蓝绿迁移、验证。**适用于执行迁移的场景。**

### 迁移
- **[postgres-database-migration](references/postgres-database-migration.md)** — DDL 锁参考、安全迁移模式、超时策略、回滚规划以及基于 fork 的测试。**适用于在生产数据库上规划或执行模式变更的场景。**

### 数据库管理
- **[ghost-database](references/ghost-database.md)** — Ghost 是一款专为 AI 智能体设计的托管 PostgreSQL 服务。可通过 CLI 或 MCP 创建、fork、暂停、恢复和查询数据库。**适用于用户需要为智能体工作流提供数据库，或希望 fork 数据库以进行安全实验的场景。**

## 使用方法

1. 根据上述描述，确定与用户任务相匹配的参考文档。
2. 加载该参考文档文件，以获取详细说明和 SQL 模板。
3. 对于涉及多个领域的任务（例如“设计一个支持向量搜索的表”），请根据需要加载多个参考文档。
