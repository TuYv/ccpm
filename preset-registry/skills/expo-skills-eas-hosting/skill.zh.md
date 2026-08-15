---
name: eas-hosting
description: EAS service (paid). Deploy Expo websites and Expo Router API routes to EAS Hosting - export the web bundle, run eas deploy for production and PR preview URLs, manage environment secrets and custom domains, and work within the Cloudflare Workers runtime. Also covers authoring API routes (+api.ts handlers, HTTP methods, request handling, CORS). Use when deploying an Expo web app or API routes, setting up EAS Hosting, or configuring hosting environments and domains. Not for native builds or store releases - use the eas-app-stores skill for those.
version: 1.0.0
license: MIT
---
# EAS Hosting

> **EAS 服务会产生费用。** EAS Hosting 是一项付费的 Expo Application Services 产品，设有免费套餐限额；生产环境部署会消耗你的套餐请求量和带宽配额。请参阅 https://expo.dev/pricing。编写 API 路由和导出 Web Bundle 是免费且开源的，你也可以自行托管导出的服务器输出，而不使用 EAS Hosting。

EAS Hosting 会将你的 Expo **Web 应用和 API 路由**部署到 Expo 托管的边缘网络（Cloudflare Workers）。使用 `npx expo export -p web` 导出 Web Bundle，并通过 `eas deploy` 发布——同一命令也会部署与其一起打包的所有 Expo Router API 路由。本 Skill 涵盖网站部署、API 路由编写和托管运行时；有关部署工作流，请参阅下方的“部署”部分。

## 何时使用 API 路由

在以下情况下使用 API 路由：

- **服务端密钥** — API 密钥、数据库凭据或绝不能传到客户端的令牌
- **数据库操作** — 不应暴露的直接数据库查询
- **第三方 API 代理** — 调用外部服务（OpenAI、Stripe 等）时隐藏 API 密钥
- **服务端验证** — 写入数据库之前验证数据
- **Webhook 端点** — 接收来自 Stripe 或 GitHub 等服务的回调
- **速率限制** — 在服务端控制访问
- **高负载计算** — 卸载在移动设备上执行较慢的处理任务

## 何时不应使用 API 路由

在以下情况下避免使用 API 路由：

- **数据已经公开** — 改为直接请求公共 API
- **不需要密钥** — 静态数据或可安全地在客户端执行的操作
- **需要实时更新** — 使用 WebSocket 或 Supabase Realtime 等服务
- **简单的 CRUD** — 考虑使用 Firebase、Supabase 或 Convex 等托管后端
- **文件上传** — 使用直传存储方案（S3 预签名 URL、Cloudflare R2）
- **仅需身份验证** — 改用 Clerk、Auth0 或 Firebase Auth

## 文件结构

API 路由位于 `app` 目录中，并以 `+api.ts` 为后缀：

```
app/
  api/
    hello+api.ts          → GET /api/hello
    users+api.ts          → /api/users
    users/[id]+api.ts     → /api/users/:id
  (tabs)/
    index.tsx
```

## 基本 API 路由

```ts
// app/api/hello+api.ts
export function GET(request: Request) {
  return Response.json({ message: "Hello from Expo!" });
}
```

## HTTP 方法

为每种 HTTP 方法导出对应的命名函数：

```ts
// app/api/items+api.ts
export function GET(request: Request) {
  return Response.json({ items: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ created: body }, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return Response.json({ updated: body });
}

export async function DELETE(request: Request) {
  return new Response(null, { status: 204 });
}
```

## 动态路由

```ts
// app/api/users/[id]+api.ts
export function GET(request: Request, { id }: { id: string }) {
  return Response.json({ userId: id });
}
```

## 请求处理

### 查询参数

```ts
export function GET(request: Request) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const limit = url.searchParams.get("limit") ?? "10";

  return Response.json({ page, limit });
}
```

### 请求头

```ts
export function GET(request: Request) {
  const auth = request.headers.get("Authorization");

  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ authenticated: true });
}
```

### JSON 请求体

```ts
export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  return Response.json({ success: true });
}
```

## 环境变量

对服务端密钥使用 `process.env`：

```ts
// app/api/ai+api.ts
export async function POST(request: Request) {
  const { prompt } = await request.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  return Response.json(data);
}
```

设置环境变量：

- **本地**：创建 `.env` 文件（切勿提交）
- **EAS Hosting**：使用 `eas env:create` 或 Expo 控制面板

## CORS 请求头

为 Web 客户端添加 CORS：

```ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export function GET() {
  return Response.json({ data: "value" }, { headers: corsHeaders });
}
```

## 错误处理

```ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Process...
    return Response.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

## 本地测试

启动支持 API 路由的开发服务器：

```bash
npx expo serve
```

这会在 `http://localhost:8081` 启动一个完全支持 API 路由的本地服务器。

使用 curl 测试：

```bash
curl http://localhost:8081/api/hello
curl -X POST http://localhost:8081/api/users -H "Content-Type: application/json" -d '{"name":"Test"}'
```

## 部署到 EAS Hosting

### 前置条件

```bash
npm install -g eas-cli
eas login
```

### 部署

部署会同时发布 Web Bundle 和所有 Expo Router API 路由，`eas deploy` 会处理这两部分。无论你拥有的是完整网站、仅包含 API 路由的后端，还是两者兼有，都会执行导出。

```bash
# Export the web bundle (includes any API routes)
npx expo export -p web

# Deploy a preview (PR-style URL)
npx eas-cli@latest deploy

# Deploy to production
npx eas-cli@latest deploy --prod
```

所有内容都会部署到 EAS Hosting（Cloudflare Workers）。

### 生产环境变量

```bash
# Create a secret
eas env:create --name OPENAI_API_KEY --value sk-xxx --environment production

# Or use the Expo dashboard
```

### 自定义域名

在 `eas.json` 或 Expo 控制面板中进行配置。

### 使用 EAS Workflows 实现自动化

使用 `type: deploy` 工作流，在每次推送到 main 分支时部署网站（以及 API 路由）：

`.eas/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches:
      - main

# https://docs.expo.dev/eas/workflows/syntax/#deploy
jobs:
  deploy_web:
    type: deploy
    params:
      prod: true
```

拉取请求的预览部署使用相同的作业类型，并将 `prod: false`：

```yaml
name: Web PR Preview

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  preview:
    type: deploy
    params:
      prod: false
```

如需编写或验证这些示例之外的工作流 YAML，请使用 `eas-workflows` skill。

## EAS Hosting 运行时（Cloudflare Workers）

API 路由运行在 Cloudflare Workers 上。主要限制如下：

### 缺失或受限的 API

- **不支持 Node.js 文件系统** — `fs` 模块不可用
- **不支持原生 Node 模块** — 请使用 Web API 或 polyfill
- **执行时间有限** — CPU 密集型任务的超时时间为 30 秒
- **不支持持久连接** — WebSocket 需要使用 Durable Objects
- **fetch 可用** — 请使用标准 fetch 发起 HTTP 请求

### 改用 Web API

```ts
// Use Web Crypto instead of Node crypto
const hash = await crypto.subtle.digest(
  "SHA-256",
  new TextEncoder().encode("data")
);

// Use fetch instead of node-fetch
const response = await fetch("https://api.example.com");

// Use Response/Request (already available)
return new Response(JSON.stringify(data), {
  headers: { "Content-Type": "application/json" },
});
```

### 数据库选项

由于文件系统不可用，请使用云数据库：

- **Cloudflare D1** — 边缘 SQLite
- **Turso** — 分布式 SQLite
- **PlanetScale** — 无服务器 MySQL
- **Supabase** — 提供 REST API 的 Postgres
- **Neon** — 无服务器 Postgres

使用 Turso 的示例：

```ts
// app/api/users+api.ts
import { createClient } from "@libsql/client/web";

const db = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET() {
  const result = await db.execute("SELECT * FROM users");
  return Response.json(result.rows);
}
```

## 从客户端调用 API 路由

```ts
// From React Native components
const response = await fetch("/api/hello");
const data = await response.json();

// With body
const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "John" }),
});
```

## 常见模式

### 身份验证中间件

```ts
// utils/auth.ts
export async function requireAuth(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify token...
  return { userId: "123" };
}

// app/api/protected+api.ts
import { requireAuth } from "../../utils/auth";

export async function GET(request: Request) {
  const { userId } = await requireAuth(request);
  return Response.json({ userId });
}
```

### 代理外部 API

```ts
// app/api/weather+api.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const city = url.searchParams.get("city");

  const response = await fetch(
    `https://api.weather.com/v1/current?city=${city}&key=${process.env.WEATHER_API_KEY}`
  );

  return Response.json(await response.json());
}
```

## 规则

- 绝不要在客户端代码中暴露 API 密钥或机密信息
- 始终验证并清理用户输入
- 使用正确的 HTTP 状态码（200、201、400、401、404、500）
- 使用 try/catch 妥善处理错误
- 保持 API 路由职责单一——每个端点只负责一项功能
- 使用 TypeScript 确保类型安全
- 在服务端记录错误以便调试

## 提交反馈
如果你在此 skill 中发现错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "eas-hosting" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI 代理反复失败，或者用户不得不接手某项 Expo 任务，请加载 expo-skill-feedback skill 并遵循其 eval-candidate 流程，而不要重复使用上述命令。