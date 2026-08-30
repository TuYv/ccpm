---
name: supabase
description: Core Supabase CLI, migrations, RLS, Edge Functions
when-to-use: When working with Supabase - database, auth, storage, or edge functions
user-invocable: false
paths: ["supabase/**", "**/supabase.*", "**/.env*"]
effort: medium
---
# Supabase 核心技能


所有 Supabase 项目通用的核心概念、CLI 工作流和模式。

**来源：** [Supabase 文档](https://supabase.com/docs) | [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)

---

## 核心原则

**本地优先，将迁移纳入版本控制，绝不直接操作生产环境。**

使用 Supabase CLI 进行本地开发，将所有变更记录为迁移，并通过 CI/CD 部署。

---

## Supabase 技术栈

| 服务 | 用途 |
|---------|---------|
| **数据库** | 带扩展的 PostgreSQL |
| **身份验证** | 用户身份验证、OAuth 提供商 |
| **存储** | 支持 RLS 的文件存储 |
| **Edge Functions** | 无服务器 Deno 函数 |
| **Realtime** | WebSocket 订阅 |
| **Vector** | AI 嵌入（pgvector） |

---

## CLI 设置

### 安装与登录
```bash
# macOS
brew install supabase/tap/supabase

# npm (alternative)
npm install -g supabase

# Login
supabase login
```

### 初始化项目
```bash
# In your project directory
supabase init

# Creates:
# supabase/
# ├── config.toml      # Local config
# ├── seed.sql         # Seed data
# └── migrations/      # SQL migrations
```

### 连接到远程项目
```bash
# Get project ref from dashboard URL: https://supabase.com/dashboard/project/<ref>
supabase link --project-ref <project-id>

# Pull existing schema
supabase db pull
```

### 启动本地技术栈
```bash
supabase start

# Output:
# API URL: http://localhost:54321
# GraphQL URL: http://localhost:54321/graphql/v1
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Anon key: eyJ...
# Service role key: eyJ...
```

---

## 迁移工作流

### 选项 1：Dashboard + Diff（快速原型开发）
```bash
# 1. Make changes in local Studio (localhost:54323)
# 2. Generate migration from diff
supabase db diff -f <migration_name>

# 3. Review generated SQL
cat supabase/migrations/*_<migration_name>.sql

# 4. Reset to test
supabase db reset
```

### 选项 2：直接编写迁移（推荐）
```bash
# 1. Create empty migration
supabase migration new create_users_table

# 2. Edit the migration file
# supabase/migrations/<timestamp>_create_users_table.sql

# 3. Apply locally
supabase db reset
```

### 选项 3：ORM 迁移（最佳开发体验）
使用 Drizzle（TypeScript）或 SQLAlchemy（Python）——请参阅特定框架的技能说明。

### 部署迁移
```bash
# Push to remote (staging/production)
supabase db push

# Check migration status
supabase migration list
```

---

## 数据库模式

### 对所有表启用 RLS
```sql
-- Always enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Default deny - must create policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);
```

### 常见 RLS 策略
```sql
-- Public read
CREATE POLICY "Public read access"
  ON public.posts FOR SELECT
  USING (true);

-- Authenticated users only
CREATE POLICY "Authenticated users can insert"
  ON public.posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Owner access
CREATE POLICY "Users can update own records"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin access (using custom claim)
CREATE POLICY "Admins have full access"
  ON public.posts FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 链接到 auth.users
```sql
-- Profile table linked to auth
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 种子数据

### supabase/seed.sql
```sql
-- Runs on `supabase db reset`
-- Use ON CONFLICT for idempotency

INSERT INTO public.profiles (id, username, avatar_url)
VALUES
  ('d0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a', 'testuser', null),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'admin', null)
ON CONFLICT (id) DO NOTHING;
```

---

## 环境变量

### 必需变量
```bash
# Public (safe for client-side)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Private (server-side only - NEVER expose)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres
```

### 本地环境与生产环境
```bash
# .env.local (local development)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from supabase start>
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# .env.production (remote)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=<from dashboard>
DATABASE_URL=<connection pooler URL>
```

### 连接池
```bash
# Transaction mode (recommended for serverless)
# Add ?pgbouncer=true to URL
DATABASE_URL=postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true

# Session mode (for migrations, long transactions)
DATABASE_URL=postgresql://...@pooler.supabase.com:5432/postgres
```

---

## Edge Functions

### 创建函数
```bash
supabase functions new hello-world
```

### 基本结构
```typescript
// supabase/functions/hello-world/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { name } = await req.json();

  return new Response(
    JSON.stringify({ message: `Hello ${name}!` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### 使用身份验证上下文
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  return new Response(JSON.stringify({ user_id: user.id }));
});
```

### 部署
```bash
# Serve locally
supabase functions serve

# Deploy single function
supabase functions deploy hello-world

# Deploy all
supabase functions deploy
```

---

## 存储

### 创建存储桶（在迁移中）
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## CLI 快速参考

```bash
# Lifecycle
supabase start                   # Start local stack
supabase stop                    # Stop local stack
supabase status                  # Show status & credentials

# Database
supabase db reset                # Reset + migrations + seed
supabase db push                 # Push to remote
supabase db pull                 # Pull remote schema
supabase db diff -f <name>       # Generate migration from diff
supabase db lint                 # Check for issues

# Migrations
supabase migration new <name>    # Create migration
supabase migration list          # List migrations
supabase migration up            # Apply pending (remote)

# Functions
supabase functions new <name>    # Create function
supabase functions serve         # Local dev
supabase functions deploy        # Deploy all

# Types
supabase gen types typescript --local > types/database.ts

# Project
supabase link --project-ref <id> # Link to remote
supabase projects list           # List projects
```

---

## CI/CD 模板

```yaml
# .github/workflows/supabase.yml
name: Supabase CI/CD

on:
  push:
    branches: [main]
  pull_request:

env:
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1

      - name: Start Supabase
        run: supabase start

      - name: Run migrations
        run: supabase db reset

      - name: Lint database
        run: supabase db lint

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1

      - name: Link project
        run: supabase link --project-ref $SUPABASE_PROJECT_ID

      - name: Push migrations
        run: supabase db push

      - name: Deploy functions
        run: supabase functions deploy
```

---

## 反模式

- **直接修改生产环境** - 始终使用迁移
- **禁用 RLS** - 在所有用户数据表上启用
- **在客户端使用 service key** - 切勿暴露 service role key
- **没有连接池** - 对无服务器环境使用 pooler
- **提交 .env** - 将其添加到 .gitignore
- **跳过迁移审查** - 始终检查生成的 SQL
- **没有种子数据** - 使用 seed.sql 确保本地开发环境一致