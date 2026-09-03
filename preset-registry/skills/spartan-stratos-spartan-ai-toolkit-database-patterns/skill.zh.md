---
name: database-patterns
description: Database design patterns including schema design, migrations, soft deletes, and Exposed ORM. Use when creating tables, writing migrations, or implementing repositories.
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---
# 数据库模式 — 快速参考

## 硬性规则

| 规则 | 使用 | 避免使用 |
|------|------|-------|
| 数据类型 | TEXT | VARCHAR |
| 主键 | UUID | SERIAL, BIGINT |
| 软删除 | deleted_at TIMESTAMP | DELETE FROM |
| 外键 | 应用层校验 | REFERENCES, ON DELETE CASCADE |
| 标准列 | id, created_at, updated_at, deleted_at | 省略其中任意一列 |

## 迁移模板

包含表、触发器以及软删除部分索引的 SQL 迁移。

> 完整的 SQL 模板见 code-templates.md。

## Exposed 表对象

继承 `UUIDTable`，使用 `text()` 而非 `varchar()`，并添加标准时间戳列。

> 完整模板见 code-templates.md。

## 实体数据类

实现 `Entity<Instant>`，包含所有业务字段 + `createdAt`、`updatedAt`、`deletedAt`。

> 完整模板见 code-templates.md。

## Repository 模式

接口 + `Default*` 实现。读操作走 `db.replica`，写操作走 `db.primary`。通过更新 `deletedAt` 实现软删除。`convert()` 方法将 `ResultRow` 映射为实体。

> 完整的接口 + 实现代码见 code-templates.md。

## 创建新表时

完整清单：
1. SQL 迁移文件（使用序列中的下一个编号）
2. `module-repository/table/` 中的表对象
3. `module-repository/entity/` 中的实体数据类
4. `module-repository/constant/` 中的枚举/常量（如有需要）
5. Repository 接口 + 实现
6. Repository 的工厂 bean
7. Repository 测试

## Flyway 规则

- 绝不添加用于填补已部署序列空缺的迁移
- 绝不重命名已部署的迁移文件
- 迁移编号必须从最新编号起顺序递增
- 保持迁移简单、专注（每次迁移只处理一张表）

## 易错点

- **只有 `id` 需要 `.value` —— 其他列都直接访问。** `row[Table.id].value` 得到 UUID，而 `row[Table.projectId]` 已经直接返回 UUID。对非 id 列添加 `.value` 会导致编译错误。
- **`gen_random_uuid()` 与 `uuid_generate_v4()` —— 每个项目只选其一。** 混用虽然能运行，但会给代码评审造成困扰。请查看项目现有的迁移，确认其使用的是哪一个。
- **继承 SoftDeleteTable 时不要重新声明 `createdAt`、`updatedAt`、`deletedAt`。** 这些列是继承而来的。再次声明会导致重复列错误。
- **创建索引时忘记 `WHERE deleted_at IS NULL` 会浪费空间。** 软删除表上的每个索引都应是部分索引。完整索引会把没人查询的死记录也包含进去。
- **存储 JSON 的文本列在 Exposed 中仍应使用 `text()`。** Postgres 中用 JSONB，Kotlin 中用 `text()`，在实体层进行序列化/反序列化。
