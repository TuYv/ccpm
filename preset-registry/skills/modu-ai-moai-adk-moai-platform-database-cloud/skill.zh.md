---
name: moai-platform-database-cloud
description: >
  Cloud database platform specialist covering Neon (serverless PostgreSQL), Supabase
  (PostgreSQL 16 with real-time), and Firebase Firestore (NoSQL with offline sync).
  Use when choosing or setting up cloud databases.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Bash(psql:*), Bash(npm:*), Bash(npx:*), Bash(neonctl:*), Bash(firebase:*), Bash(supabase:*), Grep, Glob, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
user-invocable: false
metadata:
  version: "2.0.0"
  category: "platform"
  status: "active"
  updated: "2026-02-09"
  modularized: "true"
  tags: "database, postgresql, nosql, serverless, real-time, offline, cloud"
  context7-libraries: "/neondatabase/neon, /supabase/supabase, /firebase/firebase-docs"
  related-skills: "moai-platform-auth, moai-lang-typescript, moai-domain-backend"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 4500

# MoAI Extension: Triggers
triggers:
  keywords: ["neon", "supabase", "firestore", "cloud database", "serverless postgresql", "real-time database", "offline sync", "pgvector", "rls", "database branching", "vector database", "nosql", "mobile database"]
  agents: ["expert-backend", "expert-devops", "manager-spec"]
  phases: ["plan", "run"]
  languages: ["typescript", "javascript", "python", "go"]
---
# moai-platform-database-cloud：云数据库平台专家

## 快速参考

云数据库平台覆盖范围：整合了 Neon（无服务器 PostgreSQL）、Supabase（支持实时功能的 PostgreSQL 16）和 Firebase Firestore（支持离线同步的 NoSQL）相关专业知识。

### 平台比较

Neon 提供无服务器 PostgreSQL，支持自动扩缩容、数据库分支以及计算资源缩容至零，从而优化成本。最适合无服务器应用、预览环境，以及使用连接池的边缘部署。

Supabase 提供 PostgreSQL 16，并支持用于 AI/ML 的 pgvector、适用于多租户应用的行级安全性、实时订阅，以及集成式身份验证和存储。最适合需要实时功能和向量搜索的全栈应用。

Firestore 提供 NoSQL 文档数据库，支持实时同步、离线缓存、安全规则以及针对移动端优化的 SDK。最适合移动优先应用、离线优先架构和跨平台开发。

### 快速决策指南

需要支持自动扩缩容的无服务器 PostgreSQL：使用 Neon。

需要用于 CI/CD 的数据库分支：使用 Neon 分支。

需要兼容边缘环境的数据库：使用 Neon 并配合连接池。

需要用于 AI/ML 的向量搜索：使用 Supabase 并配合 pgvector。

需要行级安全性：使用 Supabase RLS 策略。

需要实时订阅：使用 Supabase 实时功能或 Firestore 监听器。

需要离线优先的移动应用：使用启用了离线持久化的 Firestore。

需要具备实时功能的 SQL：使用 Supabase。

需要 NoSQL 的灵活性：使用 Firestore。

### 数据库类型选择

SQL 与 NoSQL 决策：对于具有复杂关系、需要 ACID 事务和查询灵活性的结构化数据，选择 SQL（Neon、Supabase）。对于灵活的模式、离线优先的移动应用以及跨客户端实时同步，选择 NoSQL（Firestore）。

PostgreSQL 变体：如需无服务器自动扩缩容和分支功能，选择 Neon。如需集成功能（身份验证、存储、实时功能）和 pgvector，选择 Supabase。

---

## 平台选择矩阵

### 用例匹配

无服务器应用可受益于 Neon 的自动扩缩容和缩容至零功能，从而显著降低成本。

多租户 SaaS 可受益于 Supabase 行级安全性提供的自动租户隔离。

AI/ML 应用可受益于 Supabase pgvector 提供的向量嵌入和相似性搜索。

实时协作可受益于 Supabase Postgres Changes 或 Firestore 实时监听器。

移动优先应用可受益于 Firestore 离线缓存和针对移动端优化的 SDK。

预览环境可受益于 Neon 数据库分支，从而为每个 PR 创建独立数据库。

边缘部署可受益于 Neon 连接池，以实现与边缘运行时的兼容性。

跨平台应用可受益于 Firestore 在 iOS、Android、Web 和 Flutter 上提供的统一 SDK。

### 功能比较

无服务器计算：Neon（自动扩缩容、缩容至零）、Supabase（Supavisor 连接池）、Firestore（内置无服务器能力）。

数据库分支：Neon（即时写时复制）、Supabase（不可用）、Firestore（不可用）。

向量搜索：Neon（通过 pgvector 扩展）、Supabase（原生 pgvector，支持 HNSW）、Firestore（不可用）。

实时订阅：Neon（通过逻辑复制）、Supabase（原生 Postgres Changes）、Firestore（原生监听器）。

离线支持：Neon（不可用）、Supabase（有限支持）、Firestore（通过 IndexedDB 提供一流支持）。

安全模型：Neon（连接级）、Supabase（行级安全性）、Firestore（安全规则）。

移动端 SDK：Neon（社区驱动程序）、Supabase（原生 TypeScript/JS）、Firestore（官方移动端 SDK）。

### 定价比较

Neon 免费套餐：3GB 存储空间、每月 100 个计算小时，空闲时缩容至零且不收费。

Supabase 免费套餐：500MB 数据库、1GB 文件存储空间、每月 2GB 带宽、5 万 MAU。

Firestore 免费套餐：1GB 存储空间、每日 5 万次读取、每日 2 万次写入，包含实时监听器。

---

## 常见数据库模式

### 连接管理

Neon Serverless Driver 需要 @neondatabase/serverless 包，并使用 neon 函数执行查询。使用 DATABASE_URL 进行直接连接，使用 DATABASE_URL_POOLED 以兼容无服务器/边缘环境。

Supabase Client 使用 @supabase/supabase-js 和 createClient 函数。客户端使用环境变量 SUPABASE_URL 和 SUPABASE_ANON_KEY，服务端使用 SUPABASE_SERVICE_ROLE_KEY。

Firestore Client 使用 firebase/app 和 firebase/firestore，并通过 initializeFirestore 进行初始化。使用 persistentLocalCache 启用离线持久化，并使用 persistentMultipleTabManager 支持多标签页。

### 迁移策略

使用 Supabase CLI，通过 supabase migration new 和 supabase db push 管理 Supabase 架构。

在 Neon 中，使用 neonctl 或 Neon API 执行数据库分支和重置操作。

使用 Firebase CLI，通过 firebase deploy --only firestore:rules 部署 Firestore Security Rules。

### ORM 集成

Neon 支持使用 drizzle-orm/neon-http 适配器的 Drizzle ORM、使用 @prisma/adapter-neon 的 Prisma，以及使用 @neondatabase/serverless 的直接 SQL。

Supabase 支持通过 @supabase/supabase-js 客户端使用直接 SQL、通过 Postgres 驱动程序使用 Drizzle ORM，以及通过连接字符串使用 Prisma。

Firestore SDK 是主要接口，无需 ORM 抽象层。

---

## Context7 文档访问

如需最新的平台文档，请使用 Context7 MCP 工具：

Neon：使用 mcp__context7__resolve-library-id，并以 "neondatabase/neon" 作为查询来获取库 ID，然后使用 mcp__context7__get-library-docs，并指定 "branching"、"connection pooling" 或 "auto-scaling" 等主题。

Supabase：使用 mcp__context7__resolve-library-id，并以 "supabase" 作为查询来获取库 ID，然后使用 mcp__context7__get-library-docs，并指定 "postgresql pgvector"、"row-level-security" 或 "realtime" 等主题。

Firestore：使用 mcp__context7__resolve-library-id，并以 "firebase" 作为查询来获取库 ID，然后使用 mcp__context7__get-library-docs，并指定 "firestore security-rules"、"firestore offline" 或 "firestore real-time" 等主题。

---

## 平台专项深入介绍

有关特定平台的实现模式、架构细节和高级功能，请参阅参考文件：

Neon Serverless PostgreSQL 详见 reference/neon.md，其中涵盖数据库分支工作流、自动扩缩容配置、PITR 和备份、无服务器驱动程序的使用、Drizzle 和 Prisma ORM 集成，以及边缘部署模式。

Supabase PostgreSQL 16 详见 reference/supabase.md，其中涵盖用于 AI/ML 的 pgvector、行级安全性策略、实时订阅与在线状态、使用 Deno 的 Edge Functions、搭配 CDN 的 Storage、身份验证集成，以及 TypeScript 客户端模式。

Firebase Firestore 详见 reference/firestore.md，其中涵盖 NoSQL 文档建模、带元数据的实时监听器、离线缓存与同步、使用自定义声明的 Security Rules、事务与批量操作、复合索引，以及移动端 SDK 模式。

有关对比分析和迁移指南，请参阅 reference/comparison.md，其中涵盖 SQL 与 NoSQL 的决策矩阵、PostgreSQL 变体比较、平台间迁移策略、功能对等关系映射，以及成本优化策略。

---

## 协同使用

- moai-platform-auth：用于与 Supabase Auth 或 Firebase Auth 集成身份验证
- moai-lang-typescript：用于所有平台上的 TypeScript 模式
- moai-lang-flutter：用于 Firestore 移动端 SDK 模式
- moai-domain-backend：用于集成数据库的后端架构
- moai-domain-mobile：用于移动优先的数据库模式
- moai-quality-security：用于安全最佳实践（RLS 策略、Security Rules）

---

状态：生产就绪
生成工具：MoAI-ADK Skill Factory v2.0
最后更新：2026-02-09
版本：2.0.0（整合版）
平台：Neon、Supabase、Firestore

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化借口

| 合理化借口 | 事实 |
|---|---|
| “无服务器数据库会自动扩缩容，我不需要考虑限制” | 无服务器计费也会自动扩展。自动扩缩容数据库上的未优化查询会导致意外账单。 |
| “我会在生产环境中使用免费层，它的容量足够” | 免费层存在连接数限制和存储上限，并且不提供 SLA。生产工作负载需要生产级保障。 |
| “实时订阅总是比轮询更好” | 实时订阅会让连接保持打开状态。在大规模场景下，这会耗尽连接池。当数据新鲜度容忍度允许时，应使用轮询。 |
| “我会在应用程序构建完成后再选择数据库” | 数据库选择会影响模式设计、查询模式和数据建模。过晚选择意味着需要重构早期决策。 |
| “连接池由平台处理” | 平台连接池具有默认限制。如果没有显式配置，无服务器函数可能会迅速耗尽连接池。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 生产应用程序运行在免费层数据库方案上
- 无服务器函数部署未配置连接池
- 在每 30 秒轮询一次即可满足需求的场景中使用实时订阅
- 数据库凭据存储在代码中，而不是环境密钥中
- 未配置备份或时间点恢复

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 数据库方案适合生产工作负载（非免费套餐）
- [ ] 已配置具有明确限制的连接池（展示配置）
- [ ] 凭据存储在环境密钥中，而非源代码中
- [ ] 已配置并测试备份策略（展示备份计划）
- [ ] 已使用代表性数据测量查询性能（展示查询耗时）
- [ ] 已记录实时与轮询方案的选择及其理由

<!-- moai:evolvable-end -->