---
name: infra-audit
license: MIT
description: >-
  Reads docker-compose, env files, ORM configs, and connection strings to map
  current infrastructure. Flags missing layers (cache, queue, analytics) based
  on observed access patterns. Outputs a structured infrastructure manifest.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - infra
  - infrastructure
  - what databases
  - what systems
  - docker-compose
  - infra audit
  - map infrastructure
  - what does this connect to
last-updated: 2026-03-29
---
# /infra-audit —— 基础设施审计器

## 使用时机

- 在向项目添加新的数据库、缓存或队列之前
- 在接手一个不熟悉的代码库、需要了解其基础设施时
- 在规划跨多个服务的 workspace 行动之前
- 当有人问“这个项目与哪些系统通信？”时

**以下情况请勿使用：**
- 用户已经了解基础设施，只是想接通某个东西时（使用 `/architect`）
- 问题关乎代码架构而非基础设施时（使用 `/research`）

## 协议

### 第 1 步：发现

扫描项目中的基础设施配置文件。逐一检查以下类别：

**容器编排：**
- `docker-compose.yml`、`docker-compose.*.yml`
- `Dockerfile`、`*.dockerfile`
- `k8s/`、`kubernetes/`、`helm/`、`charts/`

**环境变量与密钥：**
- `.env`、`.env.*`、`.env.example`、`.env.local`
- 配置目录中的 `*.env` 文件

**数据库与 ORM：**
- Prisma：`prisma/schema.prisma`
- Drizzle：`drizzle.config.ts`、`drizzle/`
- TypeORM：`ormconfig.*`、`data-source.ts`
- Sequelize：`.sequelizerc`、`config/database.*`
- Knex：`knexfile.*`
- SQLAlchemy：`alembic.ini`、`alembic/`
- Django：`settings.py`（DATABASES 部分）
- Rails：`config/database.yml`
- Go：在 go.mod 中查找 `pgx`、`gorm`、`sqlx`

**消息队列与事件流：**
- Redis：连接字符串，以及 package.json/requirements.txt/go.mod 中的 `ioredis`、`redis`
- RabbitMQ：`amqplib`、`pika`、`amqp` 导入
- Kafka：`kafkajs`、`confluent-kafka`、`sarama` 导入
- NATS：`nats`、`nats.go` 导入
- SQS/SNS：`@aws-sdk/client-sqs`、boto3 中的 sqs 引用

**缓存：**
- Redis（多重用途——需注明是用作缓存、pub/sub 还是主存储）
- Memcached：`memcached`、`pylibmc` 导入

**搜索：**
- Elasticsearch：`@elastic/elasticsearch`、`elasticsearch-py`
- Meilisearch、Typesense、Algolia 客户端库

**对象存储：**
- S3：`@aws-sdk/client-s3`、boto3 中的 s3 引用
- MinIO、GCS、Azure Blob 客户端库

**外部 API：**
- Stripe、Twilio、SendGrid、Auth0、Firebase、Supabase 客户端库
- 任何指向外部服务的 `NEXT_PUBLIC_*` 或 `VITE_*` 环境变量

**CI/CD：**
- `.github/workflows/`、`.gitlab-ci.yml`、`Jenkinsfile`、`bitbucket-pipelines.yml`

对每个发现的项目，记录：
- **是什么**：系统（例如 "PostgreSQL 15"）
- **在哪里**：配置文件路径和行号
- **如何连**：连接方式（直连、连接池、ORM、SDK）
- **角色**：主存储、缓存、队列、搜索、认证等

### 第 2 步：追踪连接

对每个发现的系统，追踪应用程序如何与其建立连接：

1. 在环境文件或配置中查找连接字符串
2. 查找客户端初始化代码（导入语句、`new Client()`、`createPool()`）
3. 确定哪些模块/服务在使用该连接
4. 如存在连接池、重试逻辑、健康检查，一并记录

构建一张连接图：
```
App --> [pool: 10] --> PostgreSQL (primary store)
App --> [ioredis]  --> Redis (cache + pub/sub)
App --> [SDK]      --> Stripe (payments)
```

### 第 3 步：分析模式

根据已连接的内容及其使用方式，识别：

**访问模式：**
- 读多写少还是写多读少（查看 ORM 使用中的查询模式）
- 实时还是批处理（是否存在 WebSocket/SSE、cron 任务）
- 请求/响应式还是事件驱动（队列使用、webhook 处理器）

**缺失的层**（仅在证据支持确有需要时才标记）：

| 信号 | 可能缺失 | 所需证据 |
|---|---|---|
| 热点路径中重复出现相同的数据库查询 | 缓存层（Redis/Memcached） | 3 个以上请求处理函数中出现同一查询 |
| 用 `setTimeout`/`setInterval` 处理延迟任务 | 任务队列（Bull/BullMQ/Celery） | 无需阻塞响应的处理逻辑 |
| 通过 `LIKE '%term%'` 实现全文搜索 | 搜索引擎（Elasticsearch/Meilisearch） | 对超过 1 万行的文本搜索 |
| 大文件上传存储在数据库或本地磁盘 | 对象存储（S3/MinIO） | 用于用户内容的二进制列或 `fs.writeFile` |
| 在生产表上执行分析查询 | 分析型数据库（Snowflake/BigQuery/ClickHouse） | 聚合查询与 OLTP 混杂 |
| 多个服务共享同一个数据库 | 事件总线或 API 网关 | 2 个以上代码仓库写入同一 schema |
| 没有连接池 | 连接池工具（PgBouncer） | serverless/高并发场景下的直连 |

**除非证据就在代码中，否则不要将某项标记为缺失。**

### 第 4 步：编写清单

将基础设施清单输出到 `.planning/infra-manifest.md`：

```markdown
# Infrastructure Manifest

> Generated: {ISO date}
> Project: {project name from package.json or repo name}

## Current Systems

### {System Name} -- {Role}
- **Type**: {database|cache|queue|search|storage|auth|payments|...}
- **Product**: {PostgreSQL 15|Redis 7|Stripe SDK|...}
- **Config**: `{file path}`
- **Connection**: {method -- pooled, direct, SDK, ORM}
- **Used by**: {modules/services that import the client}

(repeat for each system)

## Connection Graph

{ASCII diagram of connections -- use /ascii-diagram conventions}

## Access Patterns

- {Pattern 1}: {evidence}
- {Pattern 2}: {evidence}

## Opportunities

### {Opportunity Title}
- **Signal**: {what in the code suggests this}
- **System**: {what would address it -- e.g., "Redis as cache layer"}
- **Impact**: {what improves -- latency, scalability, separation of concerns}
- **Effort**: low | medium | high

(repeat for each opportunity)

## Multi-Repo Considerations

{If the project references other repos, APIs, or shared databases, note them here.
This section feeds directly into /workspace if the user wants to act on opportunities
that span repos.}
```

### 第 5 步：返回

向用户展示一份摘要：
- 发现了多少个系统
- 连接图（内联展示，而不仅仅写入文件）
- 按信号强度排序的主要机会
- 是否有机会需要跨仓库协调（建议使用 `/workspace`）

## 边缘情况

- **没有 docker-compose 或环境变量文件**：扫描源代码中硬编码的连接字符串。
  许多项目在没有正式配置文件的情况下建立连接。检查 `src/`、`lib/`、`config/`
  中的连接模式。将缺少外部化配置本身记录为一项发现。
- **包含多个服务的 Monorepo**：将每个服务目录视为独立的扫描目标。
  生成一份按服务分节的清单。记录跨服务共享的数据库。
- **`.planning/` 不存在**：在写入清单前先创建它。
- **未发现任何基础设施**：报告该项目似乎仅包含客户端，或没有
  外部依赖。这是一项有效发现，并非错误。
- **环境变量文件中存在密钥**：绝不在清单中包含实际的密钥值。只记录
  变量名以及它连接的是哪个系统，而非具体值。

## 上下文门控

**披露**：“正在审计基础设施配置。未修改任何文件。”
**可逆性**：绿色——只读审计；仅写入 `.planning/infra-manifest.md`；可通过 `rm .planning/infra-manifest.md` 撤销。
**信任门控：**
- 任意：完整审计、清单生成、机会分析。

## 质量门控

- [ ] 每个发现的系统都包含：类型、产品、配置路径、连接方式
- [ ] 连接图覆盖所有发现的系统
- [ ] 机会引用具体的代码证据（file:line），而非猜测
- [ ] 清单中不出现任何密钥值
- [ ] 清单已写入 `.planning/infra-manifest.md`
- [ ] 如存在跨仓库信号，填写多仓库考量部分

## 退出协议

```
---HANDOFF---
- Scanned {N} config files, found {M} external systems
- Key systems: {list top 3-4}
- Top opportunity: {highest-signal opportunity}
- Multi-repo scope: {yes/no -- if yes, suggest /workspace}
- Reversibility: green — delete .planning/infra-manifest.md to undo
---
```
