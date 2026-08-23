---
name: nuxthub
description: Use when building NuxtHub v0.10.6 applications - provides database (Drizzle ORM with sqlite/postgresql/mysql), KV storage, blob storage, and cache APIs. Covers configuration, schema definition, migrations, multi-cloud deployment (Cloudflare, Vercel), and the new hub:db, hub:kv, hub:blob virtual module imports.
license: MIT
---
# NuxtHub v0.10.6

全栈 Nuxt 框架，提供数据库、KV、Blob 和缓存功能。支持多云平台（Cloudflare、Vercel、Deno、Netlify）。

**关于 Nuxt 服务端模式：**使用 `nuxt` skill（server.md）
**关于使用数据库的内容：**使用 `nuxt-content` skill

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/wrangler-templates.md](references/wrangler-templates.md) - 手动配置用于 Cloudflare 部署的 wrangler.jsonc 时
- [ ] [references/providers.md](references/providers.md) - 部署到 Vercel、Netlify、Deno、AWS，或配置外部数据库/存储提供商时

**不要一次性加载所有文件。**只加载与当前任务相关的文件。

## 安装

```bash
npx nuxi module add hub
```

## 配置

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxthub/core'],
  hub: {
    db: 'sqlite', // 'sqlite' | 'postgresql' | 'mysql'
    kv: true,
    blob: true,
    cache: true,
    dir: '.data', // local storage directory
    remote: false // use production bindings in dev (v0.10+)
  }
})
```

### 高级配置

```ts
hub: {
  db: {
    dialect: 'postgresql',
    driver: 'postgres-js', // Optional: auto-detected
    casing: 'snake_case',  // camelCase JS -> snake_case DB (v0.10.3+)
    migrationsDirs: ['server/db/custom-migrations/'],
    applyMigrationsDuringBuild: true, // default
    replica: { // Read replica support (v0.10.6+)
      connection: { connectionString: process.env.DATABASE_REPLICA_URL }
    }
  },
  remote: true // Use production Cloudflare bindings in dev (v0.10+)
}
```

**remote 模式：**启用后，本地开发期间将连接到生产环境的 D1/KV/R2，而不是使用本地模拟。适用于使用生产数据进行测试。

**数据库副本（v0.10.6+）：**配置只读副本以分担数据库负载。查询会自动使用副本，而写入操作会发送到主数据库。

## 数据库

通过 Drizzle ORM 提供类型安全的 SQL。`db` 和 `schema` 会在服务端自动导入。

### Schema 定义

放置在 `server/db/schema.ts` 或 `server/db/schema/*.ts` 中：

```ts
// server/db/schema.ts (SQLite)
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  createdAt: integer({ mode: 'timestamp' }).notNull()
})
```

PostgreSQL 版本：

```ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  createdAt: timestamp().notNull().defaultNow()
})
```

### 数据库 API

```ts
// db and schema are auto-imported on server-side
import { db, schema } from 'hub:db'

// Select
const users = await db.select().from(schema.users)
const user = await db.query.users.findFirst({ where: eq(schema.users.id, 1) })

// Insert
const [newUser] = await db.insert(schema.users).values({ name: 'John', email: 'john@example.com' }).returning()

// Update
await db.update(schema.users).set({ name: 'Jane' }).where(eq(schema.users.id, 1))

// Delete
await db.delete(schema.users).where(eq(schema.users.id, 1))
```

### 迁移

```bash
npx nuxt db generate                  # Generate migrations from schema
npx nuxt db migrate                   # Apply pending migrations
npx nuxt db sql "SELECT * FROM users" # Execute raw SQL
npx nuxt db drop <TABLE>              # Drop a specific table
npx nuxt db drop-all                  # Drop all tables (v0.10+)
npx nuxt db squash                    # Squash migrations into one (v0.10+)
npx nuxt db mark-as-migrated [NAME]   # Mark as migrated without running
```

迁移会在执行 `npx nuxi dev` 和 `npx nuxi build` 时自动应用。迁移记录保存在 `_hub_migrations` 表中。

### 数据库提供商

| 方言       | 本地                 | 生产环境                                                           |
| ---------- | -------------------- | ------------------------------------------------------------------ |
| sqlite     | `.data/db/sqlite.db` | D1（Cloudflare）、Turso（`TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`）  |
| postgresql | PGlite               | postgres-js（`DATABASE_URL`）、neon-http（v0.10.2+，`DATABASE_URL`） |
| mysql      | -                    | mysql2（`DATABASE_URL`、`MYSQL_URL`）                               |

## KV 存储

键值存储。`kv` 会在服务端自动导入。

```ts
import { kv } from 'hub:kv'

await kv.set('key', { data: 'value' })
await kv.set('key', value, { ttl: 60 }) // TTL in seconds
const value = await kv.get('key')
const exists = await kv.has('key')
await kv.del('key')
const keys = await kv.keys('prefix:')
await kv.clear('prefix:')
```

限制：值最大为 25 MiB，键最大为 512 字节。

### KV 提供商

| 提供商        | 软件包           | 环境变量                                             |
| ------------- | ---------------- | ---------------------------------------------------- |
| Upstash       | `@upstash/redis` | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Redis         | `ioredis`        | `REDIS_URL`                                          |
| Cloudflare KV | -                | wrangler.jsonc 中的 `KV` 绑定                        |
| Deno KV       | -                | 在 Deno Deploy 上自动启用                            |
| Vercel        | -                | `KV_REST_API_URL`, `KV_REST_API_TOKEN`               |

## Blob 存储

文件存储。`blob` 会在服务端自动导入。

### Blob API

```ts
import { blob } from 'hub:blob'

// Upload
const result = await blob.put('path/file.txt', body, {
  contentType: 'text/plain',
  access: 'public', // 'public' | 'private' (v0.10.2+)
  addRandomSuffix: true,
  prefix: 'uploads'
})
// Returns: { pathname, contentType, size, httpEtag, uploadedAt }

// Download
const file = await blob.get('path/file.txt') // Returns Blob or null

// List
const { blobs, cursor, hasMore, folders } = await blob.list({ prefix: 'uploads/', limit: 10, folded: true })

// Serve (with proper headers)
return blob.serve(event, 'path/file.txt')

// Delete
await blob.del('path/file.txt')
await blob.del(['file1.txt', 'file2.txt']) // Multiple

// Metadata only
const meta = await blob.head('path/file.txt')
```

### 上传辅助工具

```ts
// Server: Validate + upload handler
export default eventHandler(async (event) => {
  return blob.handleUpload(event, {
    formKey: 'files',
    multiple: true,
    ensure: { maxSize: '10MB', types: ['image/png', 'image/jpeg'] },
    put: { addRandomSuffix: true, prefix: 'images' }
  })
})

// Validate before manual upload
ensureBlob(file, { maxSize: '10MB', types: ['image'] })

// Multipart upload for large files (>10MB)
export default eventHandler(async (event) => {
  return blob.handleMultipartUpload(event) // Route: /api/files/multipart/[action]/[...pathname]
})
```

### Vue 组合式函数

```ts
// Simple upload
const upload = useUpload('/api/upload')
const result = await upload(inputElement)

// Multipart with progress
const mpu = useMultipartUpload('/api/files/multipart')
const { completed, progress, abort } = mpu(file)
```

### Blob 提供商

| 提供商        | 软件包         | 配置                                                                 |
| ------------- | -------------- | -------------------------------------------------------------------- |
| Cloudflare R2 | -              | wrangler.jsonc 中的 `BLOB` 绑定                                      |
| Vercel Blob   | `@vercel/blob` | `BLOB_READ_WRITE_TOKEN`                                              |
| S3            | `aws4fetch`    | `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION` |

## 缓存

响应和函数缓存。

### 路由处理程序缓存

```ts
export default cachedEventHandler((event) => {
  return { data: 'cached', date: new Date().toISOString() }
}, {
  maxAge: 60 * 60, // 1 hour
  getKey: event => event.path
})
```

### 函数缓存

```ts
export const getStars = defineCachedFunction(
  async (event: H3Event, repo: string) => {
    const data = await $fetch(`https://api.github.com/repos/${repo}`)
    return data.stargazers_count
  },
  { maxAge: 3600, name: 'ghStars', getKey: (event, repo) => repo }
)
```

### 缓存失效

```ts
// Remove specific
await useStorage('cache').removeItem('nitro:functions:getStars:repo-name.json')

// Clear by prefix
await useStorage('cache').clear('nitro:handlers')
```

缓存键格式：`${group}:${name}:${getKey(...args)}.json`（默认值：group='nitro'，name='handlers'|'functions'|'routes'）

## 部署

### Cloudflare

NuxtHub 会根据你的 hub 配置自动生成 `wrangler.json`——无需手动创建 wrangler.jsonc：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  hub: {
    db: {
      dialect: 'sqlite',
      driver: 'd1',
      connection: { databaseId: '<database-id>' }
    },
    kv: {
      driver: 'cloudflare-kv-binding',
      namespaceId: '<kv-namespace-id>'
    },
    cache: {
      driver: 'cloudflare-kv-binding',
      namespaceId: '<cache-namespace-id>'
    },
    blob: {
      driver: 'cloudflare-r2',
      bucketName: '<bucket-name>'
    }
  }
})
```

**可观测性（推荐）：** 为生产环境部署启用日志记录：

```jsonc
// wrangler.jsonc (optional)
{
  "observability": {
    "logs": {
      "enabled": true,
      "head_sampling_rate": 1,
      "invocation_logs": true,
      "persist": true
    }
  }
}
```

通过 Cloudflare 控制面板或 CLI 创建资源：

```bash
npx wrangler d1 create my-db              # Get database-id
npx wrangler kv namespace create KV       # Get kv-namespace-id
npx wrangler kv namespace create CACHE    # Get cache-namespace-id
npx wrangler r2 bucket create my-bucket   # Get bucket-name
```

部署：创建 [Cloudflare Workers 项目](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create)，关联 Git 仓库。绑定将在构建时自动配置。

**环境：** 对预览部署使用 `CLOUDFLARE_ENV=preview`。

有关手动 wrangler.jsonc 模式，请参阅 [references/wrangler-templates.md](references/wrangler-templates.md)；有关所有提供商配置，请参阅 [references/providers.md](references/providers.md)。

### 其他提供商

有关以下平台的详细部署模式，请参阅 [references/providers.md](references/providers.md)：

- **Vercel：** Postgres、Turso、Vercel Blob、Vercel KV
- **Netlify：** 外部数据库、S3、Upstash Redis
- **Deno Deploy：** Deno KV
- **AWS/自托管：** S3、RDS、自定义配置

### 通过 HTTP 使用 D1

从非 Cloudflare 主机查询 D1：

```ts
hub: {
  db: { dialect: 'sqlite', driver: 'd1-http' }
}
```

需要：`NUXT_HUB_CLOUDFLARE_ACCOUNT_ID`、`NUXT_HUB_CLOUDFLARE_API_TOKEN`、`NUXT_HUB_CLOUDFLARE_DATABASE_ID`

## 构建时钩子

```ts
// Extend schema
nuxt.hook('hub:db:schema:extend', async ({ dialect, paths }) => {
  paths.push(await resolvePath(`./schema/custom.${dialect}`))
})

// Add migration directories
nuxt.hook('hub:db:migrations:dirs', (dirs) => {
  dirs.push(resolve('./db-migrations'))
})

// Post-migration queries (idempotent)
nuxt.hook('hub:db:queries:paths', (paths, dialect) => {
  paths.push(resolve(`./seed.${dialect}.sql`))
})
```

## 类型共享

```ts
// shared/types/db.ts
import type { users } from '~/server/db/schema'

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

## WebSocket / 实时通信

启用实验性 WebSocket：

```ts
// nuxt.config.ts
nitro: { experimental: { websocket: true } }
```

```ts
// server/routes/ws/chat.ts
export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe('chat')
    peer.publish('chat', 'User joined')
  },
  message(peer, message) {
    peer.publish('chat', message.text())
  },
  close(peer) {
    peer.unsubscribe('chat')
  }
})
```

## 已弃用（v0.10）

已移除 Cloudflare 特有功能：

- `hubAI()` -> 使用带有 Workers AI Provider 的 AI SDK
- `hubBrowser()` -> Puppeteer
- `hubVectorize()` -> Vectorize
- NuxtHub Admin -> 将于 2025 年 12 月 31 日停止服务
- `npx nuxthub deploy` -> 使用 wrangler deploy

## 快速参考

| 功能   | 导入                                  | 访问方式                           |
| ------ | ------------------------------------- | ---------------------------------- |
| 数据库 | `import { db, schema } from 'hub:db'` | `db.select()`, `db.insert()`, etc. |
| KV     | `import { kv } from 'hub:kv'`         | `kv.get()`, `kv.set()`, etc.       |
| Blob   | `import { blob } from 'hub:blob'`     | `blob.put()`, `blob.get()`, etc.   |

所有内容都会在服务器端自动导入。

## 资源

- [安装](https://hub.nuxt.com/docs/getting-started/installation)
- [从 v0.9 迁移](https://hub.nuxt.com/docs/getting-started/migration)
- [数据库](https://hub.nuxt.com/docs/database)
- [Blob](https://hub.nuxt.com/docs/blob)
- [KV](https://hub.nuxt.com/docs/kv)
- [缓存](https://hub.nuxt.com/docs/cache)
- [部署](https://hub.nuxt.com/docs/getting-started/deploy)