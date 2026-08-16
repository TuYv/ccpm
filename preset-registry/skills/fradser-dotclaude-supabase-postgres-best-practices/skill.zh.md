---
name: supabase-postgres-best-practices
description: Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.
license: MIT
metadata:
  author: supabase
  version: "1.1.1"
  organization: Supabase
  date: January 2026
  abstract: Comprehensive Postgres performance optimization guide for developers using Supabase and Postgres. Contains performance rules across 8 categories, prioritized by impact from critical (query performance, connection management) to incremental (advanced features). Each rule includes detailed explanations, incorrect vs. correct SQL examples, query plan analysis, and specific performance metrics to guide automated optimization and code generation.
---
# Supabase Postgres 最佳实践

由 Supabase 维护的 Postgres 综合性能优化指南。包含横跨 8 个类别的规则，并按影响程度确定优先级，用于指导自动化查询优化和模式设计。

## 何时应用

在以下情况下参考这些准则：
- 编写 SQL 查询或设计模式
- 实现索引或进行查询优化
- 审查数据库性能问题
- 配置连接池或扩展
- 针对 Postgres 特有功能进行优化
- 使用行级安全性（RLS）

## 按优先级划分的规则类别

| 优先级 | 类别 | 影响 | 前缀 |
|----------|----------|--------|--------|
| 1 | 查询性能 | 严重 | `query-` |
| 2 | 连接管理 | 严重 | `conn-` |
| 3 | 安全性与 RLS | 严重 | `security-` |
| 4 | 模式设计 | 高 | `schema-` |
| 5 | 并发与锁定 | 中高 | `lock-` |
| 6 | 数据访问模式 | 中 | `data-` |
| 7 | 监控与诊断 | 中低 | `monitor-` |
| 8 | 高级功能 | 低 | `advanced-` |

## 使用方法

阅读各个规则文件，了解详细说明和 SQL 示例：

```
references/query-missing-indexes.md
references/query-partial-indexes.md
references/_sections.md
```

每个规则文件包含：
- 对其重要性的简要说明
- 错误的 SQL 示例及说明
- 正确的 SQL 示例及说明
- 可选的 EXPLAIN 输出或指标
- 其他背景信息和参考资料
- Supabase 特定说明（如适用）

## 参考资料

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security