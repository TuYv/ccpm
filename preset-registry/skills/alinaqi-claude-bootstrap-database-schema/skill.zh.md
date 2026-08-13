---
name: database-schema
description: Schema awareness - read before coding, type generation, prevent column errors
when-to-use: Before writing any database queries or modifying data models
user-invocable: false
paths: ["**/schema.*", "**/migrations/**", "**/models/**", "**/*.prisma", "**/drizzle/**"]
effort: medium
---
# 数据库模式感知技能


**问题：** Claude 会在会话过程中忘记模式细节——使用错误的列名、遗漏字段、类型不正确。TDD 能在运行时发现这些问题，但我们可以更早地预防它们。

---

## 核心规则：编写数据库代码前先阅读模式

**强制要求：在编写任何涉及数据库的代码之前：**

```
┌─────────────────────────────────────────────────────────────┐
│  1. READ the schema file (see locations below)              │
│  2. VERIFY columns/types you're about to use exist          │
│  3. REFERENCE schema in your response when writing queries  │
│  4. TYPE-CHECK using generated types (Drizzle/Prisma/etc)   │
└─────────────────────────────────────────────────────────────┘
```

**如果模式文件不存在 → 请先创建它，再继续操作。**

---

## 模式文件位置（按技术栈分类）

| 技术栈 | 模式位置 | 类型生成 |
|-------|-----------------|-----------------|
| **Drizzle** | `src/db/schema.ts` or `drizzle/schema.ts` | 内置 TypeScript |
| **Prisma** | `prisma/schema.prisma` | `npx prisma generate` |
| **Supabase** | `supabase/migrations/*.sql` + types | `supabase gen types typescript` |
| **SQLAlchemy** | `app/models/*.py` or `src/models.py` | Pydantic 模型 |
| **TypeORM** | `src/entities/*.ts` | 装饰器 = 类型 |
| **Raw SQL** | `schema.sql` or `migrations/` | 需要手动定义类型 |

### 模式参考文件（推荐）

创建 `_project_specs/schema-reference.md` 以便快速查阅：

```markdown
# Database Schema Reference

*Auto-generated or manually maintained. Claude: READ THIS before database work.*

## Tables

### users
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| email | text | NO | - | Unique |
| name | text | YES | - | Display name |
| created_at | timestamptz | NO | now() | - |
| updated_at | timestamptz | NO | now() | - |

### orders
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | NO | - | FK → users.id |
| status | text | NO | 'pending' | enum: pending/paid/shipped/delivered |
| total_cents | integer | NO | - | Amount in cents |
| created_at | timestamptz | NO | now() | - |

## Relationships
- users 1:N orders (user_id)

## Enums
- order_status: pending, paid, shipped, delivered
```

---

## 编码前检查清单（数据库工作）

在编写任何数据库代码之前，Claude 必须：

```markdown
### Schema Verification Checklist
- [ ] Read schema file: `[path to schema]`
- [ ] Columns I'm using exist: [list columns]
- [ ] Types match my code: [list type mappings]
- [ ] Relationships are correct: [list FKs]
- [ ] Nullable fields handled: [list nullable columns]
```

**实际示例：**

```markdown
### Schema Verification for TODO-042 (Add order history endpoint)

- [x] Read schema: `src/db/schema.ts`
- [x] Columns exist: orders.id, orders.user_id, orders.status, orders.total_cents, orders.created_at
- [x] Types: id=uuid→string, total_cents=integer→number, status=text→OrderStatus enum
- [x] Relationships: orders.user_id → users.id (many-to-one)
- [x] Nullable: none of these columns are nullable
```

---

## 类型生成命令

### Drizzle（TypeScript）

```typescript
// Schema defines types automatically
// src/db/schema.ts
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'),
  totalCents: integer('total_cents').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Inferred types - USE THESE
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
```

### Prisma

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  orders    Order[]
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}

model Order {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  user       User     @relation(fields: [userId], references: [id])
  status     String   @default("pending")
  totalCents Int      @map("total_cents")
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("orders")
}
```

```bash
# Generate types after schema changes
npx prisma generate
```

### Supabase

```bash
# Generate TypeScript types from live database
supabase gen types typescript --local > src/types/database.ts

# Or from remote
supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

```typescript
// Use generated types
import { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];
type NewUser = Database['public']['Tables']['users']['Insert'];
type Order = Database['public']['Tables']['orders']['Row'];
```

### SQLAlchemy（Python）

```python
# app/models/user.py
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    orders = relationship("Order", back_populates="user")
```

```python
# app/schemas/user.py - Pydantic for API validation
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str | None = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
```

---

## 感知模式的 TDD 工作流

针对数据库工作扩展标准 TDD 工作流：

```
┌─────────────────────────────────────────────────────────────┐
│  0. SCHEMA: Read and verify schema before anything else     │
│     └─ Read schema file                                     │
│     └─ Complete Schema Verification Checklist               │
│     └─ Note any missing columns/tables needed               │
├─────────────────────────────────────────────────────────────┤
│  1. RED: Write tests that use correct column names          │
│     └─ Import generated types                               │
│     └─ Use type-safe queries in tests                       │
│     └─ Tests should fail on logic, NOT schema errors        │
├─────────────────────────────────────────────────────────────┤
│  2. GREEN: Implement with type-safe queries                 │
│     └─ Use ORM types, not raw strings                       │
│     └─ TypeScript/mypy catches column mismatches            │
├─────────────────────────────────────────────────────────────┤
│  3. VALIDATE: Type check catches schema drift               │
│     └─ tsc --noEmit / mypy catches wrong columns            │
│     └─ Tests validate runtime behavior                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 常见的模式错误（以及如何预防）

| 错误 | 示例 | 预防措施 |
|---------|---------|------------|
| 列名错误 | `user.userName` 与 `user.name` | 阅读模式，使用生成的类型 |
| 类型错误 | 将 `totalCents` 用作字符串 | 通过类型生成捕获此错误 |
| 缺少可空检查 | 字段可为空时使用 `user.name!` | 模式会标明可空字段 |
| 外键关系错误 | `order.userId` 与 `order.user_id` | 检查模式中的列名 |
| 缺少列 | 使用不存在的 `user.avatar` | 编码前阅读模式 |
| 枚举值错误 | `status: 'complete'` 与 `'completed'` | 在模式参考文档中记录枚举 |

### 类型安全的查询示例

**Drizzle（在编译时捕获错误）：**
```typescript
// ✅ Correct - uses schema-defined columns
const user = await db.select().from(users).where(eq(users.email, email));

// ❌ Wrong - TypeScript error: 'userName' doesn't exist
const user = await db.select().from(users).where(eq(users.userName, email));
```

**Prisma（在编译时捕获错误）：**
```typescript
// ✅ Correct
const user = await prisma.user.findUnique({ where: { email } });

// ❌ Wrong - TypeScript error
const user = await prisma.user.findUnique({ where: { userName: email } });
```

**原始 SQL（无保护——应避免使用）：**
```typescript
// ❌ Dangerous - no type checking, easy to get wrong
const result = await db.query('SELECT * FROM users WHERE user_name = $1', [email]);
// Should be 'email' not 'user_name' - won't catch until runtime
```

---

## 迁移工作流

需要更改模式时：

```
┌─────────────────────────────────────────────────────────────┐
│  1. Update schema file (Drizzle/Prisma/SQLAlchemy)          │
├─────────────────────────────────────────────────────────────┤
│  2. Generate migration                                       │
│     └─ Drizzle: npx drizzle-kit generate                    │
│     └─ Prisma: npx prisma migrate dev --name add_column     │
│     └─ Supabase: supabase migration new add_column          │
├─────────────────────────────────────────────────────────────┤
│  3. Regenerate types                                         │
│     └─ Prisma: npx prisma generate                          │
│     └─ Supabase: supabase gen types typescript              │
├─────────────────────────────────────────────────────────────┤
│  4. Update schema-reference.md                               │
├─────────────────────────────────────────────────────────────┤
│  5. Run type check - find all broken code                    │
│     └─ npm run typecheck                                    │
├─────────────────────────────────────────────────────────────┤
│  6. Fix type errors, update tests, run full validation       │
└─────────────────────────────────────────────────────────────┘
```

---

## 会话启动协议

**启动涉及数据库工作的会话时：**

1. 立即读取 schema 文件
2. 如果 `_project_specs/schema-reference.md` 存在，则读取该文件
3. 在会话状态中注明相关的表和列
4. 编写代码时明确引用 schema

**会话状态示例：**
```markdown
## Current Session - Database Context

**Schema read:** ✓ src/db/schema.ts
**Tables in scope:** users, orders, order_items
**Key columns:**
- users: id, email, name, created_at
- orders: id, user_id, status, total_cents
- order_items: id, order_id, product_id, quantity, price_cents
```

---

## 反模式

- ❌ **猜测列名** - 始终先读取 schema
- ❌ **使用原始 SQL 字符串** - 使用支持类型生成的 ORM
- ❌ **未经验证就硬编码** - 使用任何列之前检查 schema
- ❌ **忽略类型错误** - schema 漂移会以类型错误的形式体现
- ❌ **未重新生成类型** - 迁移后始终重新生成类型
- ❌ **假定可为空** - 检查 schema 以确认列是否可为空

---

## 检查清单

### 设置
- [ ] schema 文件位于标准位置
- [ ] 已配置类型生成
- [ ] 已创建 `_project_specs/schema-reference.md`
- [ ] schema 变更时会重新生成类型

### 每项任务
- [ ] 编写数据库代码前已读取 schema
- [ ] 已完成 schema 验证检查清单
- [ ] 使用生成的类型（而非原始字符串）
- [ ] 类型检查通过（可捕获列错误）
- [ ] 测试使用正确的 schema