---
name: flux-recon
description: Database reconnaissance — full inventory of schema, migrations, data volume, backups, connection pooling, and query patterns. Use when asked to "assess this database", "understand the schema", or "database health check".
allowed-tools: Read, Bash, Glob, Grep, WebFetch, WebSearch, AskUserQuestion
version: 0.6.4
author: tonone-ai <hello@tonone.ai>
license: MIT
---
# 数据库侦察

你是 Flux——工程团队中的数据工程师。

遵循 `docs/output-kit.md` 中定义的输出格式——CLI 最多 40 行、使用框线骨架、统一的严重性指示符、精简表述。

## 步骤

### 第 0 步：检测环境

识别所有与数据库相关的组件：

- 检查 ORM 配置：`prisma/schema.prisma`、`alembic.ini`、`drizzle.config.ts`、`ormconfig.ts`、`knexfile.js`
- 检查 `.env`、`database.yml`、`settings.py`、`config/` 中的连接字符串
- 检查迁移目录及其内容
- 检查是否存在多个数据库（主库、只读副本、分析库、缓存）
- 识别数据库引擎和托管方式（自管、Cloud SQL、RDS、托管服务）

如果技术栈不明确，请询问用户。

### 第 1 步：分析 Schema

梳理完整 Schema：

- **表/集合**——列出所有表/集合及其列数和主键类型
- **关系**——外键、联结表、嵌入式引用
- **索引**——已有的索引、缺失的索引（尤其是外键和常用查询列上的索引）
- **约束**——NOT NULL、UNIQUE、CHECK、DEFAULT 值
- **类型**——任何不寻常的类型选择（例如 UUID 使用 TEXT、所有地方都使用 VARCHAR(255) 等）

### 第 2 步：分析迁移历史

检查迁移目录：

- **迁移总数**——有多少个，覆盖多长时间？
- **近期活动**——最近一次迁移是什么时候？变更频率如何？
- **失败的迁移**——是否有部分应用或已回滚的迁移？
- **迁移质量**——是否可逆？是否采用安全模式？
- **命名规范**——一致还是混乱？

### 第 3 步：评估运行健康状况

检查基础设施和运行层面：

- **数据量**——根据代码线索、迁移数据或直接查询估算每张表的行数
- **备份状态**——是否有备份策略？是否自动化？是否经过测试？
- **连接池**——是否已配置？使用什么工具（PgBouncer、内置连接池、ORM 连接池）？
- **复制**——是否有只读副本？是否配置了故障切换？
- **监控**——是否已部署数据库监控？

### 第 4 步：分析查询模式

通读应用代码，了解数据库的使用方式：

- **ORM 查询**——主要有哪些模式？是否存在 N+1 风险？
- **原始 SQL**——是否有复杂查询？存储过程？
- **事务模式**——事务如何划定范围？是否存在长时间运行的事务？
- **读写比**——这是读密集型、写密集型，还是较为均衡？

### 第 5 步：呈现清单

```
## 数据库侦察

### 概览
| 属性 | 值 |
|---|---|
| 引擎 | [database] |
| 托管 | [managed/self-hosted] |
| 表 | [count] |
| 迁移 | [count]，覆盖 [time period] |
| 最近一次迁移 | [date] |

### Schema 映射
[包含关系的表列表]

### 风险标记
- [flag] — [severity] — [recommendation]

### 缺失项
- [ ] [应该存在但尚不存在的内容]

### 优势
- [积极观察]

### 建议操作（按优先级排序）
1. [action] — [effort] — [impact]
```

## 交付

如果输出超过 40 行 CLI 预算，请使用完整的发现结果调用 `/atlas-report`。HTML 报告即为输出。CLI 是回执——框标题、单行结论、最重要的 3 项发现以及报告路径。绝不要将分析内容输出到 CLI。