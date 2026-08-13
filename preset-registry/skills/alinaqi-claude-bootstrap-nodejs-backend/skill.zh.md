---
name: nodejs-backend
description: Node.js backend patterns with Express/Fastify, repositories
when-to-use: When working on Node.js backend code - API routes, middleware, server setup
user-invocable: false
paths: ["src/api/**", "src/routes/**", "src/server/**", "src/middleware/**", "server/**", "api/**"]
effort: medium
---
# Node.js 后端技能


---

## 项目结构

```
project/
├── src/
│   ├── core/                   # Pure business logic
│   │   ├── types.ts            # Domain types
│   │   ├── errors.ts           # Domain errors
│   │   └── services/           # Pure functions
│   │       ├── user.ts
│   │       └── order.ts
│   ├── infra/                  # Side effects
│   │   ├── http/               # HTTP layer
│   │   │   ├── server.ts       # Server setup
│   │   │   ├── routes/         # Route handlers
│   │   │   └── middleware/     # Express middleware
│   │   ├── db/                 # Database
│   │   │   ├── client.ts       # DB connection
│   │   │   ├── repositories/   # Data access
│   │   │   └── migrations/     # Schema migrations
│   │   └── external/           # Third-party APIs
│   ├── config/                 # Configuration
│   │   └── index.ts            # Env vars, validated
│   └── index.ts                # Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
└── CLAUDE.md
```

---

## API 设计

### 路由处理器模式
```typescript
// routes/users.ts
import { Router } from 'express';
import { z } from 'zod';
import { createUser } from '../../core/services/user';
import { UserRepository } from '../db/repositories/user';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export function createUserRoutes(userRepo: UserRepository): Router {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const input = CreateUserSchema.parse(req.body);
      const user = await createUser(input, userRepo);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
```

### 在组合根中进行依赖注入
```typescript
// index.ts
import { createApp } from './infra/http/server';
import { createDbClient } from './infra/db/client';
import { UserRepository } from './infra/db/repositories/user';
import { createUserRoutes } from './infra/http/routes/users';

async function main(): Promise<void> {
  const db = await createDbClient();
  const userRepo = new UserRepository(db);
  
  const app = createApp({
    userRoutes: createUserRoutes(userRepo),
  });
  
  app.listen(3000);
}
```

---

## 错误处理

### 领域错误
```typescript
// core/errors.ts
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

### 全局错误处理器
```typescript
// middleware/errorHandler.ts
import { ErrorRequestHandler } from 'express';
import { DomainError } from '../../core/errors';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', details: err.errors },
    });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
};
```

---

## 数据库模式

### 仓储模式
```typescript
// db/repositories/user.ts
import { Kysely } from 'kysely';
import { Database, User } from '../types';

export class UserRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<User | null> {
    return this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst() ?? null;
  }

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return this.db
      .insertInto('users')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
```

### 事务
```typescript
async function transferFunds(
  fromId: string,
  toId: string,
  amount: number,
  db: Kysely<Database>
): Promise<void> {
  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('accounts')
      .set((eb) => ({ balance: eb('balance', '-', amount) }))
      .where('id', '=', fromId)
      .execute();

    await trx
      .updateTable('accounts')
      .set((eb) => ({ balance: eb('balance', '+', amount) }))
      .where('id', '=', toId)
      .execute();
  });
}
```

---

## 配置

### 已验证的配置
```typescript
// config/index.ts
import { z } from 'zod';

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse(process.env);
}
```

---

## 测试

### 单元测试（核心）
```typescript
// tests/unit/services/user.test.ts
import { createUser } from '../../../src/core/services/user';

describe('createUser', () => {
  it('creates user with valid data', async () => {
    const mockRepo = {
      create: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
      findByEmail: jest.fn().mockResolvedValue(null),
    };

    const result = await createUser({ email: 'test@example.com', name: 'Test' }, mockRepo);

    expect(result.email).toBe('test@example.com');
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
  });
});
```

### 集成测试（API）
```typescript
// tests/integration/users.test.ts
import request from 'supertest';
import { createTestApp, createTestDb } from '../helpers';

describe('POST /users', () => {
  let app: Express;
  let db: TestDb;

  beforeAll(async () => {
    db = await createTestDb();
    app = createTestApp(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('creates user and returns 201', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'new@example.com', name: 'New User' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('new@example.com');
  });
});
```

---

## Node.js 反模式

- ❌ 回调地狱——使用 async/await
- ❌ 未处理的 Promise 拒绝——始终捕获，或交由错误处理器捕获
- ❌ 阻塞事件循环——将繁重计算卸载出去
- ❌ 在代码中存放密钥——使用环境变量
- ❌ SQL 字符串拼接——使用参数化查询
- ❌ 不进行输入验证——在 API 边界进行验证
- ❌ 在生产环境中使用 Console.log——使用适当的日志记录器
- ❌ 缺少优雅关闭——处理 SIGTERM
- ❌ 单体路由文件——按资源拆分