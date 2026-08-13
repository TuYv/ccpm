---
name: supabase-nextjs
description: Next.js with Supabase and Drizzle ORM
when-to-use: When building a Next.js app with Supabase backend
user-invocable: false
paths: ["src/app/**", "src/db/**", "supabase/**"]
effort: medium
---
# Supabase + Next.js 技能


结合 Supabase Auth 和 Drizzle ORM 的 Next.js App Router 模式。

**来源：** [Supabase Next.js 指南](https://supabase.com/docs/guides/auth/server-side/nextjs) | [Drizzle + Supabase](https://supabase.com/docs/guides/database/drizzle)

---

## 核心原则

**使用 Drizzle 进行查询，使用 Supabase 进行身份验证和存储，并默认使用服务器组件。**

使用 Drizzle ORM 实现类型安全的数据库访问。使用 Supabase 客户端进行身份验证、存储和实时通信。优先使用服务器组件；仅在需要时使用客户端组件。

---

## 项目结构

```
project/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── (dashboard)/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── [...]/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   └── ui/
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   ├── schema.ts             # Schema definitions
│   │   └── queries/              # Query functions
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client
│   │   │   └── middleware.ts     # Auth middleware helper
│   │   └── auth.ts               # Auth helpers
│   └── middleware.ts             # Next.js middleware
├── supabase/
│   ├── migrations/
│   └── config.toml
├── drizzle.config.ts
└── .env.local
```

---

## 设置

### 安装依赖
```bash
npm install @supabase/supabase-js @supabase/ssr drizzle-orm postgres
npm install -D drizzle-kit
```

### 环境变量
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start>

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=<from supabase start>
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

---

## Drizzle 设置

### drizzle.config.ts
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ['public'],
});
```

### src/db/index.ts
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // Required for Supabase connection pooling
});

export const db = drizzle(client, { schema });
```

### src/db/schema.ts
```typescript
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // References auth.users
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').references(() => profiles.id).notNull(),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

---

## Supabase 客户端

### src/lib/supabase/client.ts（浏览器）
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### src/lib/supabase/server.ts（服务器组件/操作）
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  );
}
```

### src/lib/supabase/middleware.ts（用于中间件）
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
```

---

## 中间件

### src/middleware.ts
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const publicRoutes = ['/', '/login', '/signup', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## 身份验证辅助函数

### src/lib/auth.ts
```typescript
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireGuest() {
  const user = await getUser();
  if (user) {
    redirect('/dashboard');
  }
}
```

---

## 身份验证页面

### src/app/(auth)/login/page.tsx
```typescript
import { requireGuest } from '@/lib/auth';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage() {
  await requireGuest();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </div>
  );
}
```

### src/components/auth/login-form.tsx
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### src/app/(auth)/callback/route.ts
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
```

---

## 服务器操作

### src/app/actions/posts.ts
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { posts, NewPost } from '@/db/schema';
import { requireAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function createPost(formData: FormData) {
  const user = await requireAuth();

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  const [post] = await db.insert(posts).values({
    authorId: user.id,
    title,
    content,
  }).returning();

  revalidatePath('/dashboard');
  redirect(`/posts/${post.id}`);
}

export async function updatePost(id: string, formData: FormData) {
  const user = await requireAuth();

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  await db.update(posts)
    .set({ title, content })
    .where(eq(posts.id, id));

  revalidatePath(`/posts/${id}`);
}

export async function deletePost(id: string) {
  const user = await requireAuth();

  await db.delete(posts).where(eq(posts.id, id));

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
```

---

## 数据获取

### src/db/queries/posts.ts
```typescript
import { db } from '@/db';
import { posts, profiles } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getPublishedPosts(limit = 10) {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      author: profiles.name,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
}

export async function getUserPosts(userId: string) {
  return db
    .select()
    .from(posts)
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt));
}

export async function getPostById(id: string) {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  return post ?? null;
}
```

### 在服务器组件中
```typescript
// src/app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth';
import { getUserPosts } from '@/db/queries/posts';

export default async function DashboardPage() {
  const user = await requireAuth();
  const posts = await getUserPosts(user.id);

  return (
    <div>
      <h1>Your Posts</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

---

## 存储

### 上传组件
```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function AvatarUpload({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
    }

    setUploading(false);
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleUpload}
      disabled={uploading}
    />
  );
}
```

### 获取公开 URL
```typescript
import { createClient } from '@/lib/supabase/server';

export async function getAvatarUrl(userId: string) {
  const supabase = await createClient();

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(`${userId}/avatar.png`);

  return data.publicUrl;
}
```

---

## 实时功能

### 带订阅的客户端组件
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Post } from '@/db/schema';

export function RealtimePosts({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [payload.new as Post, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setPosts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new as Post : p))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

---

## OAuth 提供商

### src/components/auth/oauth-buttons.tsx
```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

export function OAuthButtons() {
  const handleOAuth = async (provider: 'google' | 'github') => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="space-y-2">
      <button onClick={() => handleOAuth('google')}>
        Continue with Google
      </button>
      <button onClick={() => handleOAuth('github')}>
        Continue with GitHub
      </button>
    </div>
  );
}
```

---

## 退出登录

### 服务端操作
```typescript
// src/app/actions/auth.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

### 退出登录按钮
```typescript
'use client';

import { signOut } from '@/app/actions/auth';

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit">Sign Out</button>
    </form>
  );
}
```

---

## 反模式

- **使用 Supabase 客户端执行数据库查询** - 使用 Drizzle 以确保类型安全
- **在客户端组件中获取数据** - 优先使用服务端组件
- **未使用中间件进行身份验证** - 会话刷新至关重要
- **同步调用 `cookies()`** - 在 Next.js 15+ 中必须使用 await
- **在客户端中使用服务密钥** - 切勿暴露，只能在服务端使用
- **缺少 revalidatePath** - 数据变更后始终进行重新验证
- **未处理身份验证错误** - 显示用户友好的消息