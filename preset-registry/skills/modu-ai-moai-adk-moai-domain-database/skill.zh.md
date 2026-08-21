---
name: moai-domain-database
description: >
  Database specialist covering PostgreSQL, MongoDB, Redis, Oracle, and cloud database
  platforms (Neon, Supabase, Firestore). Use for schema design, query optimization,
  indexing strategies, data modeling, or cloud database selection.
  Cloud vendor guide absorbed from moai-platform-database-cloud.

when_to_use: >
  Use for schema design, query optimization, indexing strategies, and
  ORMs/ODMs (Prisma, Mongoose, SQLAlchemy, Drizzle). Covers PostgreSQL,
  MongoDB, Redis, Oracle, and cloud databases (Neon, Supabase, Firestore).

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Bash(psql:*), Bash(mysql:*), Bash(sqlite3:*), Bash(mongosh:*), Bash(redis-cli:*), Bash(npm:*), Bash(npx:*), Bash(prisma:*), Bash(neonctl:*), Bash(firebase:*), Bash(supabase:*), Grep, Glob
user-invocable: false
metadata:
  version: "2.0.0"
  category: "domain"
  status: "active"
  updated: "2026-04-25"
  tags: "database, postgresql, mongodb, redis, oracle, data-patterns, performance, neon, supabase, firestore, cloud-database, serverless"
  author: "MoAI-ADK Team"
  related-skills: "moai-platform-database-cloud"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# 数据库领域专家

## 快速参考

企业级数据库专业能力——全面涵盖 PostgreSQL、MongoDB、Redis、Oracle，以及面向可扩展现代应用的高级数据管理模式与实现。

核心能力：

- PostgreSQL：高级关系型模式、优化与扩展
- MongoDB：文档建模、聚合与 NoSQL 性能调优
- Redis：内存缓存、实时分析与分布式系统
- Oracle：企业级模式、PL/SQL、分区与层次查询
- 多数据库：混合架构与数据集成模式
- 性能：查询优化、索引策略与扩展
- 运维：连接管理、迁移与监控

适用场景：

- 设计数据库模式与数据模型
- 实现缓存策略与性能优化
- 构建可扩展的数据架构
- 使用多数据库系统
- 优化数据库查询与性能

---

## 实施指南

### 快速入门工作流

数据库栈初始化：

创建一个 DatabaseManager 实例并配置多个数据库连接。使用连接字符串、大小为 20 的连接池以及已启用的查询日志来设置 PostgreSQL。使用连接字符串、数据库名称以及已启用的分片来配置 MongoDB。使用连接字符串、最大连接数 50 以及已启用的集群来配置 Redis。使用统一接口跨所有数据库类型查询包含个人资料和分析数据的用户数据。

单数据库操作：

使用迁移命令运行 PostgreSQL 模式迁移，并指定数据库类型和迁移文件路径。通过指定集合名称和管道 JSON 文件来执行 MongoDB 聚合管道。通过指定键模式和 TTL 值来预热 Redis 缓存。

### 核心组件

PostgreSQL 模块：

- 高级模式设计与约束
- 复杂查询优化与索引
- 窗口函数与 CTE
- 分区与物化视图
- 连接池与性能调优

MongoDB 模块：

- 文档建模与模式设计
- 用于分析的聚合管道
- 索引策略与性能
- 分片与扩展模式
- 数据一致性与验证

Redis 模块：

- 多层缓存策略
- 实时分析与计数
- 分布式锁与协调
- 发布/订阅消息传递与流
- 包括 HyperLogLog 和 Geo 在内的高级数据结构

Oracle 模块：

- 层次与递归查询模式（CONNECT BY）
- PL/SQL 过程、包与批量操作
- 分区策略（范围、列表、哈希、复合）
- 企业级功能与语句缓存
- LOB 处理与大数据处理

---

## 高级模式

### 多数据库架构

多模型持久化模式：

创建一个 DataRouter 类，用于初始化与 PostgreSQL、MongoDB、Redis 和 Oracle 的连接。实现 get_user_profile 方法，从 PostgreSQL 或 Oracle 获取结构化用户数据，从 MongoDB 获取灵活的个人资料数据，并从 Redis 获取实时状态，然后合并所有数据源。实现 update_user_data 方法，将结构化数据更新路由到 PostgreSQL/Oracle，将个人资料数据更新路由到 MongoDB，并将实时数据更新路由到 Redis，随后执行缓存失效。

数据同步：

创建一个 DataSyncManager 类，用于跨数据库同步用户数据。实现 sync_user_data 方法：从 PostgreSQL 检索用户，为 MongoDB 创建搜索文档，将其更新插入 MongoDB 搜索集合，创建缓存数据，并使用 TTL 更新 Redis 缓存。

### 性能优化

查询性能分析：

对于 PostgreSQL，对查询执行 EXPLAIN ANALYZE BUFFERS，并使用 QueryAnalyzer 生成优化建议。对于 MongoDB，创建 AggregationOptimizer 来分析和优化聚合管道。对于 Redis，检索信息指标，并使用 PerformanceAnalyzer 生成建议。

扩展策略：

通过提供副本连接 URL 配置 PostgreSQL 只读副本。使用分片键和分片数量设置 MongoDB 分片。通过提供集群节点 URL 配置 Redis 集群。

---

## 配合使用效果良好

互补 Skill：

- moai-domain-backend - API 集成和业务逻辑
- moai-foundation-core - 数据库迁移和 Schema 管理
- moai-workflow-project - 数据库项目设置和配置
- moai-platform-supabase - Supabase 数据库集成模式
- moai-platform-neon - Neon 数据库集成模式
- moai-platform-firestore - Firestore 数据库集成模式

技术集成：

- ORM 和 ODM，包括 SQLAlchemy、Mongoose 和 TypeORM
- 使用 PgBouncer 和连接池进行连接池化
- 迁移工具，包括 Alembic、Flyway 和 Data Pump
- 使用 pg_stat_statements、MongoDB Atlas 和 Oracle AWR 进行监控
- 使用 python-oracledb 进行 Oracle 连接和 PL/SQL 执行
- 缓存失效和同步

---

## 技术栈

关系型数据库：

- PostgreSQL 14+ 作为主数据库
- MySQL 8.0+ 作为替代方案
- 使用 PgBouncer 和 SQLAlchemy 进行连接池化

NoSQL 数据库：

- MongoDB 6.0+ 作为主要文档存储
- 文档建模和验证
- 聚合框架
- 分片和复制

内存数据库：

- Redis 7.0+ 作为主要缓存
- 使用 Redis Stack 实现高级功能
- 集群和高可用性
- 高级数据结构

企业级数据库：

- Oracle 19c+ / 21c+ 用于企业级工作负载
- python-oracledb（cx_Oracle 的后继者）
- PL/SQL 过程和包
- 分区和高级分析

支持工具：

- 迁移工具，包括 Alembic 和 Flyway
- 使用 Prometheus 和 Grafana 进行监控
- ORM 和 ODM，包括 SQLAlchemy 和 Mongoose
- 连接管理实用工具

性能特性：

- 查询优化和分析
- 索引管理和策略
- 缓存层和失效
- 负载均衡和故障转移

---

## 资源

状态：生产就绪
最后更新：2026-01-11
维护者：MoAI-ADK 数据库团队

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我不需要索引，表很小” | 表会增长。在 1K 行时难以察觉的索引缺失问题，到 1M 行时就会演变成生产事故。 |
| “我以后再添加迁移” | 没有迁移的 Schema 变更无法复现。每次变更都必须具备可逆的迁移脚本。 |
| “这个查询在开发环境中运行良好” | 开发数据库的数据集很小。生产环境中的查询计划在大规模数据下会有巨大差异。应先执行 Explain analyze。 |
| “NoSQL 不需要 Schema 设计” | 无 Schema 并不意味着无设计。文档结构决策会影响每个查询和索引。 |
| “我只是添加一列，这不会造成破坏性变更” | 添加没有默认值的 NOT NULL 列会导致现有插入操作失败。添加列时需要提供默认值或通过迁移回填数据。 |
| “连接池由框架处理” | 框架默认值是通用配置。必须根据工作负载调整池大小、超时时间和空闲限制。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 提交了架构变更，但没有对应的迁移文件
- 生产代码中的查询使用 SELECT *，而不是显式列出列名
- WHERE、JOIN 或 ORDER BY 子句中使用的列没有索引
- 连接字符串硬编码在源代码中，而不是通过环境变量提供
- 事务作用域横跨面向用户的 HTTP 请求持续时间（长时间持有锁）
- 对涉及大型表的新查询，没有提供 EXPLAIN ANALYZE 输出

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 每项架构变更都有对应的迁移文件（展示迁移文件列表）
- [ ] 经常查询的列都有索引（展示索引定义）
- [ ] 已使用代表性数据对新查询运行 EXPLAIN ANALYZE（展示输出）
- [ ] 连接凭据来自环境变量
- [ ] 事务作用域尽可能小，且不横跨 I/O 等待
- [ ] 备份与恢复流程已记录并经过测试
- [ ] 连接池设置已配置明确的大小和超时时间

<!-- moai:evolvable-end -->

---

## 云厂商指南（吸收自 moai-platform-database-cloud）

针对 Neon、Supabase 和 Firebase Firestore 的云数据库平台选型与配置。

### 快速决策指南

| 需求 | 平台 |
|------|----------|
| 具备自动扩缩容能力的无服务器 PostgreSQL | Neon |
| 用于 CI/CD 预览的数据库分支 | Neon 分支功能 |
| 兼容边缘环境的连接池 | Neon + Neon Proxy |
| 用于 AI/ML 的向量搜索（pgvector） | Supabase |
| 用于多租户应用的行级安全性 | Supabase RLS |
| 实时订阅 + 全栈能力 | Supabase |
| 移动优先且支持离线同步 | Firebase Firestore |
| 跨平台（iOS/Android/Web） | Firebase Firestore |

### Neon（无服务器 PostgreSQL）

主要特性：计算资源自动扩缩容、缩容至零、数据库分支、pg_bouncer 连接池。

设置：
```bash
npm install @neondatabase/serverless
# Connection string: postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
```

分支工作流：为每个 PR 创建一个分支（`neonctl branches create --name pr-123`），运行迁移和测试，并在合并时删除。空闲期间成本为零。

### Supabase（PostgreSQL 16）

主要特性：pgvector、行级安全性、实时订阅、内置身份验证/存储。

RLS 策略模式：
```sql
CREATE POLICY "users_own_data" ON items
  FOR ALL USING (auth.uid() = user_id);
```

pgvector 搜索：`SELECT * FROM embeddings ORDER BY embedding <-> $1 LIMIT 10;`

### Firebase Firestore（NoSQL）

主要特性：实时同步、离线缓存、安全规则、移动端 SDK。

安全规则模式：
```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

离线持久化：通过 `enableIndexedDbPersistence(db)`（Web）启用，或使用 SDK 默认设置（移动端）。

## 重构说明

**重构范围**（推迟至未来的子 SPEC）：
- 将 moai-domain-db-docs 工作流技能与此查询/架构设计技能分离
- 将云厂商深度解析内容（Neon、Supabase、Firestore）提取到专用的 Level-3 模块中
- 整合不同数据库类型之间相互重叠的 ORM 模式内容

此技能保留在 v3.0 中，但其正文将在后续 SPEC 中进行重构。云供应商相关内容已在 Wave 1.2 中从 moai-platform-database-cloud 吸收合并。