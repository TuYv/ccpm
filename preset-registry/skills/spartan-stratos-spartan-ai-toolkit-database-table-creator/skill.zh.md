---
name: database-table-creator
description: Creates database table with full Kotlin synchronization (SQL migration → Table → Entity → Repository → Tests). Use when adding new database tables or entities.
allowed_tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---
# 数据库表创建技能

通过 SQL 迁移、Kotlin 代码和全面的测试，创建完整的数据库表实现。

## 此技能的功能

生成：
1. **SQL 迁移** - 带软删除、索引、触发器的 PostgreSQL 表
2. **Kotlin Table 对象** - Exposed ORM 表定义（继承 UUIDTable）
3. **实体数据类** - 实现 Entity<Instant> 的 Kotlin 实体
4. **Repository 接口 + 实现** - 带软删除的 CRUD 操作
5. **Repository 测试** - 全面的测试覆盖（7 个以上测试）
6. **Factory Bean** - 依赖注入注册

## 关键规则

### 数据库设计 (rules/database/SCHEMA.md)

**SQL 要求**：
- ❌ 禁止外键约束（绝不使用 REFERENCES 或 FOREIGN KEY）
- ✅ 字符串使用 TEXT（而非 VARCHAR）
- ✅ 必须包含：id (UUID)、created_at、updated_at、deleted_at
- ✅ 所有索引必须带有 `WHERE deleted_at IS NULL`
- ✅ 添加软删除索引：`WHERE deleted_at IS NOT NULL`
- ✅ 为 updated_at 添加更新触发器

**Kotlin 要求**：
- ✅ Table 必须继承 `UUIDTable`（而非 `Table`）
- ✅ 实体必须实现 `Entity<Instant>`
- ✅ 所有查询必须过滤 `deletedAt.isNull()`
- ❌ 禁止 `!!` 操作符（pre-commit 钩子禁止使用）
- ✅ 仅软删除（设置 deletedAt，绝不硬删除）

## 工作流程

### 第 1 步：创建 SQL 迁移

位置：`database-migration/sql/{number}-{description}.sql`

```sql
-- ============================================================================
-- Description: [Describe what this migration does]
-- Table: {table_name}
-- ============================================================================

CREATE TABLE {table_name} (
    -- Primary key (REQUIRED)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Business columns
    name TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'active',
    user_id UUID,
    count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,

    -- Standard timestamps (REQUIRED)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Unique index (allows duplicate soft-deleted records)
CREATE UNIQUE INDEX idx_{table_name}_email_unique
    ON {table_name}(email) WHERE deleted_at IS NULL;

-- Foreign key index (NO FK constraint, just index)
CREATE INDEX idx_{table_name}_user_id
    ON {table_name}(user_id) WHERE deleted_at IS NULL;

-- Soft delete index (REQUIRED)
CREATE INDEX idx_{table_name}_deleted_at
    ON {table_name}(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update trigger (REQUIRED)
CREATE TRIGGER update_{table_name}_updated_at
BEFORE UPDATE ON {table_name}
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

**关键要求**：
- 使用 TEXT 而非 VARCHAR
- 禁止 REFERENCES 或 FOREIGN KEY
- 所有索引都带 WHERE 子句
- 必须有软删除索引
- 必须有更新触发器

### 第 2 步：运行迁移

```bash
./gradlew :app:module-repository:flywayMigrate
```

确认成功后再继续。

### 第 3-10 步：Kotlin 实现

> 所有 Kotlin 代码模板（Table、Entity、Repository、Factory Bean、测试）请参见 `kotlin-templates.md`。

按以下顺序进行：
1. **第 3 步** — Table 对象（继承 `UUIDTable`，使用 `text()` 而非 `varchar()`）
2. **第 4 步** — 实体数据类（实现 `Entity<Instant>`）
3. **第 5 步** — 常量/枚举（如需要）
4. **第 6 步** — Repository 接口
5. **第 7 步** — Repository 实现（写操作用 `db.primary`，读操作用 `db.replica`，始终过滤 `deletedAt.isNull()`）
6. **第 8 步** — Factory bean 注册
7. **第 9 步** — Repository 测试（至少 7 个测试，必须包含软删除验证）
8. **第 10 步** — 运行测试：`./gradlew test`

## 需要避免的常见错误

> 常见错误和反模式请参见 `examples.md`。

## 成功标准

✅ SQL 迁移成功运行
✅ 使用 TEXT（而非 VARCHAR）
✅ 无外键约束
✅ 所有索引都带 WHERE 子句
✅ Kotlin Table 继承 UUIDTable
✅ 实体实现 Entity<Instant>
✅ 所有查询过滤 deletedAt.isNull()
✅ 无 !! 操作符
✅ 仅软删除（无硬删除）
✅ Factory bean 已注册
✅ 全部 7 个以上测试通过
