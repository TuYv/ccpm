---
name: cloudflare-d1
description: Cloudflare D1 SQLite database with Workers, Drizzle ORM, migrations
when-to-use: When working with Cloudflare D1 or Workers
user-invocable: false
paths: ["wrangler.toml", "src/worker*", "**/d1/**"]
effort: medium
---
# Cloudflare D1 技能


Cloudflare D1 是一个为 Cloudflare Workers 设计的无服务器 SQLite 数据库，具有全球分布和零冷启动特性。

**来源：** [D1 文档](https://developers.cloudflare.com/d1/) | [Drizzle + D1](https://orm.drizzle.team/docs/connect-cloudflare-d1) | [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

## 核心原则

**边缘侧的 SQLite、纳入版本控制的迁移、用于类型安全的 Drizzle。**

D1 将 SQLite 的简洁性带到了无服务器环境中。应针对水平扩展（多个小型数据库）而不是垂直扩展（一个大型数据库）进行设计。使用 Drizzle ORM 实现类型安全的查询和迁移。

---

## D1 技术栈

| 组件 | 用途 |
|-----------|---------|
| **D1** | 无服务器 SQLite 数据库 |
| **Workers** | 应用程序的边缘运行时 |
| **Wrangler** | 用于开发和部署的 CLI |
| **Drizzle ORM** | 支持迁移的类型安全 ORM |
| **Drizzle Kit** | 迁移工具 |
| **Hono** | 轻量级 Web 框架（可选） |

---

## 项目设置

### 创建 Worker 项目
```bash
# Create new project
npm create cloudflare@latest my-app -- --template "worker-typescript"
cd my-app

# Install dependencies
npm install drizzle-orm
npm install -D drizzle-kit
```

### 创建 D1 数据库
```bash
# Create database (creates both local and remote)
npx wrangler d1 create my-database

# Output:
# [[d1_databases]]
# binding = "DB"
# database_name = "my-database"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 配置 wrangler.toml
```toml
name = "my-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
migrations_dir = "drizzle"
migrations_table = "drizzle_migrations"
```

### 生成 TypeScript 类型
```bash
# Generate env types from wrangler.toml
npx wrangler types

# Creates worker-configuration.d.ts:
# interface Env {
#   DB: D1Database;
# }
```

---

## Drizzle ORM 设置

### Schema 定义
```typescript
// src/db/schema.ts
import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['user', 'admin'] }).default('user'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  published: integer('published', { mode: 'boolean' }).default(false),
  viewCount: integer('view_count').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique()
});

export const postTags = sqliteTable('post_tags', {
  postId: integer('post_id').references(() => posts.id),
  tagId: integer('tag_id').references(() => tags.id)
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

### Drizzle 配置
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!
  }
});
```

### 数据库客户端
```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;
export * from './schema';
```

---

## 迁移工作流

### 生成迁移
```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Output: drizzle/0000_initial.sql
```

### 在本地应用迁移
```bash
# Apply to local D1
npx wrangler d1 migrations apply my-database --local

# Or via Drizzle
npx drizzle-kit migrate
```

### 将迁移应用到生产环境
```bash
# Apply to remote D1
npx wrangler d1 migrations apply my-database --remote

# Preview first (dry run)
npx wrangler d1 migrations apply my-database --remote --dry-run
```

### 迁移文件示例
```sql
-- drizzle/0000_initial.sql
CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `name` text NOT NULL,
  `role` text DEFAULT 'user',
  `created_at` text DEFAULT CURRENT_TIMESTAMP,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

CREATE TABLE `posts` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `content` text,
  `author_id` integer REFERENCES `users`(`id`),
  `published` integer DEFAULT false,
  `view_count` integer DEFAULT 0,
  `created_at` text DEFAULT CURRENT_TIMESTAMP
);
```

---

## Worker 实现

### 使用 Hono 的基础 Worker
```typescript
// src/index.ts
import { Hono } from 'hono';
import { createDb, users, posts } from './db';
import { eq, desc } from 'drizzle-orm';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware to inject db
app.use('*', async (c, next) => {
  c.set('db', createDb(c.env.DB));
  await next();
});

// List users
app.get('/users', async (c) => {
  const db = c.get('db');
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

// Get user by ID
app.get('/users/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));

  const user = await db.select().from(users).where(eq(users.id, id)).get();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  return c.json(user);
});

// Create user
app.post('/users', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ email: string; name: string }>();

  const result = await db.insert(users).values({
    email: body.email,
    name: body.name
  }).returning();

  return c.json(result[0], 201);
});

// Update user
app.put('/users/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json<Partial<{ email: string; name: string }>>();

  const result = await db.update(users)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(users.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }
  return c.json(result[0]);
});

// Delete user
app.delete('/users/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));

  const result = await db.delete(users).where(eq(users.id, id)).returning();

  if (result.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }
  return c.json({ deleted: true });
});

export default app;
```

### 原始 D1 API（不使用 ORM）
```typescript
// src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/users' && request.method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM users ORDER BY created_at DESC'
      ).all();
      return Response.json(results);
    }

    if (url.pathname === '/users' && request.method === 'POST') {
      const body = await request.json() as { email: string; name: string };

      const result = await env.DB.prepare(
        'INSERT INTO users (email, name) VALUES (?, ?) RETURNING *'
      ).bind(body.email, body.name).first();

      return Response.json(result, { status: 201 });
    }

    return new Response('Not Found', { status: 404 });
  }
};
```

---

## 查询模式

### Select 查询
```typescript
import { eq, and, or, like, gt, desc, asc, count, sql } from 'drizzle-orm';

// Basic select
const allPosts = await db.select().from(posts);

// Select specific columns
const titles = await db.select({ id: posts.id, title: posts.title }).from(posts);

// Where clause
const published = await db.select().from(posts).where(eq(posts.published, true));

// Multiple conditions
const recentPublished = await db.select().from(posts).where(
  and(
    eq(posts.published, true),
    gt(posts.createdAt, '2024-01-01')
  )
);

// OR conditions
const featured = await db.select().from(posts).where(
  or(
    eq(posts.viewCount, 1000),
    like(posts.title, '%featured%')
  )
);

// Order and limit
const topPosts = await db.select()
  .from(posts)
  .orderBy(desc(posts.viewCount))
  .limit(10);

// Pagination
const page2 = await db.select()
  .from(posts)
  .orderBy(desc(posts.createdAt))
  .limit(10)
  .offset(10);

// Count
const postCount = await db.select({ count: count() }).from(posts);
```

### Join
```typescript
// Inner join
const postsWithAuthors = await db.select({
  post: posts,
  author: users
})
.from(posts)
.innerJoin(users, eq(posts.authorId, users.id));

// Left join
const allPostsWithAuthors = await db.select()
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id));

// Many-to-many via junction table
const postsWithTags = await db.select({
  post: posts,
  tag: tags
})
.from(posts)
.leftJoin(postTags, eq(posts.id, postTags.postId))
.leftJoin(tags, eq(postTags.tagId, tags.id));
```

### Insert、Update、Delete
```typescript
// Insert single
const newUser = await db.insert(users).values({
  email: 'user@example.com',
  name: 'John Doe'
}).returning();

// Insert multiple
await db.insert(users).values([
  { email: 'a@test.com', name: 'Alice' },
  { email: 'b@test.com', name: 'Bob' }
]);

// Upsert (insert or update on conflict)
await db.insert(users)
  .values({ email: 'user@test.com', name: 'New Name' })
  .onConflictDoUpdate({
    target: users.email,
    set: { name: 'New Name' }
  });

// Update
await db.update(posts)
  .set({ published: true })
  .where(eq(posts.id, 1));

// Update with increment
await db.update(posts)
  .set({ viewCount: sql`${posts.viewCount} + 1` })
  .where(eq(posts.id, 1));

// Delete
await db.delete(posts).where(eq(posts.id, 1));
```

### 事务
```typescript
// D1 supports transactions via batch
const results = await db.batch([
  db.insert(users).values({ email: 'a@test.com', name: 'A' }),
  db.insert(users).values({ email: 'b@test.com', name: 'B' }),
  db.update(posts).set({ published: true }).where(eq(posts.id, 1))
]);

// Raw D1 batch
const batchResults = await env.DB.batch([
  env.DB.prepare('INSERT INTO users (email, name) VALUES (?, ?)').bind('a@test.com', 'A'),
  env.DB.prepare('INSERT INTO users (email, name) VALUES (?, ?)').bind('b@test.com', 'B')
]);
```

---

## 本地开发

### 启动开发服务器
```bash
# Local development with D1
npx wrangler dev

# With specific port
npx wrangler dev --port 8787
```

### 数据库管理
```bash
# Execute SQL locally
npx wrangler d1 execute my-database --local --command "SELECT * FROM users"

# Execute SQL file
npx wrangler d1 execute my-database --local --file ./seed.sql

# Open SQLite shell
npx wrangler d1 execute my-database --local --command ".tables"
```

### Drizzle Studio
```bash
# Run Drizzle Studio for visual DB management
npx drizzle-kit studio
```

### 填充数据
```sql
-- seed.sql
INSERT INTO users (email, name, role) VALUES
  ('admin@example.com', 'Admin User', 'admin'),
  ('user@example.com', 'Test User', 'user');

INSERT INTO posts (title, content, author_id, published) VALUES
  ('First Post', 'Hello World!', 1, true),
  ('Draft Post', 'Work in progress...', 1, false);
```

```bash
# Seed local database
npx wrangler d1 execute my-database --local --file ./seed.sql
```

---

## 多环境配置

### wrangler.toml
```toml
name = "my-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Development
[env.dev]
[[env.dev.d1_databases]]
binding = "DB"
database_name = "my-database-dev"
database_id = "dev-database-id"

# Staging
[env.staging]
[[env.staging.d1_databases]]
binding = "DB"
database_name = "my-database-staging"
database_id = "staging-database-id"

# Production
[env.production]
[[env.production.d1_databases]]
binding = "DB"
database_name = "my-database-prod"
database_id = "prod-database-id"
```

### 部署到各环境
```bash
# Deploy to staging
npx wrangler deploy --env staging

# Deploy to production
npx wrangler deploy --env production

# Apply migrations to staging
npx wrangler d1 migrations apply my-database-staging --remote --env staging
```

---

## 测试

### 集成测试
```typescript
// tests/api.test.ts
import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
import { describe, beforeAll, afterAll, it, expect } from 'vitest';

describe('API', () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true }
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it('should list users', async () => {
    const res = await worker.fetch('/users');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should create user', async () => {
    const res = await worker.fetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', name: 'Test' })
    });
    expect(res.status).toBe(201);
  });
});
```

---

## CLI 快速参考

```bash
# Database
wrangler d1 create <name>                    # Create database
wrangler d1 list                             # List databases
wrangler d1 info <name>                      # Database info
wrangler d1 delete <name>                    # Delete database

# Migrations
wrangler d1 migrations list <name>           # List migrations
wrangler d1 migrations apply <name> --local  # Apply locally
wrangler d1 migrations apply <name> --remote # Apply to production

# SQL execution
wrangler d1 execute <name> --command "SQL"   # Run SQL
wrangler d1 execute <name> --file ./file.sql # Run SQL file
wrangler d1 execute <name> --local           # Run on local
wrangler d1 execute <name> --remote          # Run on production

# Development
wrangler dev                                 # Start local server
wrangler types                               # Generate TypeScript types
wrangler deploy                              # Deploy to production

# Drizzle
drizzle-kit generate                         # Generate migrations
drizzle-kit migrate                          # Apply migrations
drizzle-kit studio                           # Open Drizzle Studio
drizzle-kit push                             # Push schema (dev only)
```

---

## D1 限制与注意事项

| 限制 | 值 |
|-------|-------|
| **数据库大小** | 最大 10 GB |
| **行大小** | 最大 1 MB |
| **SQL 语句** | 最大 100 KB |
| **批次大小** | 1000 条语句 |
| **每日读取次数（免费）** | 500 万次 |
| **每日写入次数（免费）** | 100,000 次 |

---

## 反模式

- **单个大型数据库** - 应设计为多个较小的数据库（每个租户一个）
- **没有迁移** - 始终对架构变更进行版本控制
- **到处使用原始 SQL** - 使用 Drizzle 以确保类型安全
- **不连接远程环境** - 部署前始终针对真实的 D1 进行测试
- **在 D1 中存储大型 Blob** - 使用 R2 进行文件存储
- **复杂连接** - D1 是 SQLite；保持查询简单
- **不进行批处理** - 对多个操作使用 batch
- **忽略限制** - 监控免费层级的使用情况