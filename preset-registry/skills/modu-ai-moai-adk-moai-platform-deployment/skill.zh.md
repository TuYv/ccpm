---
name: moai-platform-deployment
description: >
  Deployment and hosting platform specialist covering Vercel, Railway, and Convex.
  Use when deploying applications, configuring edge functions, setting up continuous
  deployment, or managing serverless infrastructure.
license: Apache-2.0
user-invocable: false
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(npm:*), Bash(npx:*), Bash(docker:*), Bash(git:*), WebFetch, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
metadata:
  version: "2.0.0"
  category: "platform"
  status: "active"
  updated: "2026-02-09"
  platforms: "Vercel, Railway, Convex"
  tags: "deployment, hosting, vercel, railway, convex, edge, containers, serverless, real-time"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 4500

# MoAI Extension: Triggers
triggers:
  keywords: ["deploy", "deployment", "hosting", "vercel", "railway", "convex", "edge functions", "containers", "docker", "serverless", "real-time", "preview deployment", "continuous deployment"]
  agents: ["expert-devops", "expert-backend", "expert-frontend"]
  phases: ["run", "sync"]
---
# 部署平台专家

全面的部署平台指南，涵盖 Vercel（边缘优先）、Railway（容器优先）和 Convex（实时后端）。

---

## 平台快速选型

### 各平台的适用场景

**Vercel** - 边缘优先部署：
- 使用 SSR/SSG 的 Next.js 应用
- 需要全球 CDN 分发
- 对低于 50ms 的边缘延迟有严格要求
- 需要用于团队协作的预览部署
- 需要托管式存储（KV、Blob、Postgres）

**Railway** - 容器优先部署：
- 全栈容器化应用
- 自定义运行时环境
- 多服务架构
- 持久卷存储
- WebSocket/gRPC 长连接

**Convex** - 实时后端：
- 协作式实时应用
- 响应式数据同步
- TypeScript 优先的后端需求
- 乐观 UI 更新
- 面向文档的数据模型

---

## 决策指南

### 按应用类型选择

**Web 应用（前端 + API）**：
- Next.js → Vercel（集成效果最佳）
- 搭配自定义 API 的 React/Vue → Railway（灵活）
- 实时协作 → Convex + Vercel

**移动端后端**：
- REST/GraphQL → Railway（连接稳定）
- 实时同步 → Convex（响应式查询）
- 边缘 API → Vercel（全球低延迟）

**全栈单体应用**：
- 容器化 → Railway（支持 Docker）
- Serverless → Vercel（Next.js API 路由）
- 实时 → Convex（内置响应式能力）

### 按基础设施需求选择

**计算需求**：
- 边缘计算 → Vercel（30 多个边缘节点）
- 自定义运行时 → Railway（Docker 灵活性）
- Serverless TypeScript → Convex（托管运行时）

**存储需求**：
- Redis/KV → Vercel KV 或 Railway
- PostgreSQL → Vercel Postgres 或 Railway
- 文件存储 → Vercel Blob 或 Railway 卷
- 文档数据库 → Convex（内置）

**网络需求**：
- CDN 分发 → Vercel（内置）
- 私有网络 → Railway（服务网格）
- 实时 WebSocket → Convex（内置）或 Railway

---

## 常见部署模式

### 模式 1：Next.js 搭配数据库

**技术栈**：Vercel + Vercel Postgres/KV

**设置步骤**：
1. 将 Next.js 应用部署到 Vercel
2. 配置 Vercel Postgres 作为数据库
3. 使用 Vercel KV 存储会话/缓存
4. 配置环境变量
5. 为动态内容启用 ISR

**最适合**：具有标准数据库需求的 Web 应用、电子商务网站、内容型网站

### 模式 2：容器化多服务架构

**技术栈**：Railway + Docker

**设置步骤**：
1. 创建多阶段 Dockerfile
2. 在 railway.toml 中配置服务
3. 设置私有网络
4. 配置持久卷
5. 启用自动扩缩容

**最适合**：微服务、复杂后端、自定义技术栈

### 模式 3：实时协作应用

**技术栈**：Convex + Vercel/Railway（前端）

**设置步骤**：
1. 初始化 Convex 后端
2. 定义 schema 和服务端函数
3. 将前端部署到 Vercel/Railway
4. 配置 Convex provider
5. 实现乐观更新

**最适合**：协作工具、实时仪表板、聊天应用

### 模式 4：混合边缘 + 容器

**技术栈**：Vercel（前端/边缘）+ Railway（后端服务）

**设置步骤**：
1. 将 Next.js 前端部署到 Vercel
2. 将后端服务部署到 Railway
3. 配置 CORS 和 API 端点
4. 设置用于路由的边缘中间件
5. 为 Railway 使用私有网络

**最适合**：需要复杂后端的高性能应用和全球分发场景

### 模式 5：无服务器全栈

**技术栈**：Vercel（前端 + API 路由）+ Convex（后端）

**设置步骤**：
1. 构建带有 API 路由的 Next.js 应用
2. 初始化 Convex 作为数据层
3. 配置身份验证（Clerk/Auth0）
4. 将前端部署到 Vercel
5. 连接 Convex 客户端

**最适合**：快速原型开发、初创企业、实时 Web 应用

---

## 基本配置

### Vercel 快速入门

**vercel.json**：
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "fra1"],
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**边缘函数**：
```typescript
export const runtime = "edge"
export const preferredRegion = ["iad1", "sfo1"]

export async function GET(request: Request) {
  const country = request.geo?.country || "Unknown"
  return Response.json({ country })
}
```

### Railway 快速入门

**railway.toml**：
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
numReplicas = 2

[deploy.resources]
memory = "2GB"
cpu = "2.0"
```

**多阶段 Dockerfile**：
```dockerfile
# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runner stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER appuser
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Convex 快速入门

**convex/schema.ts**：
```typescript
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  messages: defineTable({
    text: v.string(),
    userId: v.id("users"),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .searchIndex("search_text", {
      searchField: "text",
      filterFields: ["userId"],
    }),
})
```

**React 集成**：
```typescript
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"

export function Messages() {
  const messages = useQuery(api.messages.list)
  const sendMessage = useMutation(api.messages.send)

  if (!messages) return <div>Loading...</div>

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg._id}>{msg.text}</div>
      ))}
    </div>
  )
}
```

---

## CI/CD 集成

### GitHub Actions - Vercel

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### GitHub Actions - Railway

```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g @railway/cli
      - run: railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### GitHub Actions - Convex

```yaml
name: Deploy to Convex
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx convex deploy
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

---

## 高级模式

### 蓝绿部署（Vercel）

部署新版本，在预览 URL 上进行测试，然后使用 Vercel SDK 切换生产环境别名，实现零停机发布。

### 多区域部署（Railway）

在 railway.toml 中配置部署区域：
```toml
[deploy.regions]
name = "us-west"
replicas = 2

[[deploy.regions]]
name = "eu-central"
replicas = 1
```

### 乐观更新（Convex）

```typescript
const sendMessage = useMutation(api.messages.send)

const handleSend = (text: string) => {
  sendMessage({ text })
    .then(() => console.log("Sent"))
    .catch(() => console.log("Failed, rolled back"))
}
```

---

## 平台特定详情

有关各平台的详细模式、配置选项和高级用例，请参阅：

- **reference/vercel.md** - 边缘函数、ISR、分析、存储
- **reference/railway.md** - Docker、多服务、卷、扩缩容
- **reference/convex.md** - 响应式查询、服务端函数、文件存储
- **reference/comparison.md** - 功能矩阵、定价、迁移指南

---

## 可搭配使用

- moai-domain-backend，用于后端架构模式
- moai-domain-frontend，用于前端集成
- `.claude/rules/moai/languages/typescript.md`，用于 TypeScript 最佳实践（通过 paths frontmatter 自动加载）
- `.claude/rules/moai/languages/python.md`，用于在 Railway 上部署 Python（通过 paths frontmatter 自动加载）
- moai-platform-auth，用于身份验证集成
- moai-platform-database，用于数据库模式

---

状态：生产就绪
版本：2.0.0
更新日期：2026-02-09
平台：Vercel、Railway、Convex

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我会在开发完成后配置部署平台” | 部署配置会影响构建输出、环境变量和运行时行为。应尽早配置。 |
| “预览部署是可选的” | 预览部署可以在上线生产环境之前发现部署特有的错误。它成本很低，却能避免大量损失。 |
| “所有环境中的环境变量都相同” | 生产、预发布和开发环境需要不同的数据库 URL、API 密钥和功能标志。所有环境共用一套环境变量会带来安全风险。 |
| “无服务器冷启动可以忽略不计” | 冷启动会给首次请求增加 200-2000ms 的延迟。对于面向用户的 API，这一点很重要。应进行测量并采取缓解措施。 |
| “我不需要回滚策略，重新部署即可” | 重新部署需要几分钟，而回滚只需几秒钟。当生产环境宕机时，分秒必争。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 构建日志中可见生产环境变量
- 未针对拉取请求配置预览部署
- 预发布环境和生产环境共用同一个环境
- 回滚机制未记录或未经测试
- 构建产物包含开发依赖项或源映射

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 按环境（dev、staging、production）分离环境变量
- [ ] 已针对拉取请求配置预览部署（展示平台配置）
- [ ] 回滚流程已记录并经过测试（展示回滚命令或流程）
- [ ] 生产构建不包含开发依赖项和源映射
- [ ] 可从干净的 git 检出成功部署（不依赖本地状态）
- [ ] 已测量无服务器函数的冷启动时间（展示计时数据）

<!-- moai:evolvable-end -->

## 重构说明

**R4 审核结论**（2026-04-23）：重构——将三平台缩减为仅以 Vercel 为主；Railway/Convex 仅作文档参考
**SPEC**：SPEC-V3R2-WF-001 §6.2 第 271 行
**重构范围**（推迟至未来的子 SPEC）：
- 将 Vercel 提升为主要平台并提供完整指南；将 Railway 和 Convex 降级为仅作文档参考
- 将 Railway 和 Convex 的深入讲解移至三级模块
- 添加 CI/CD 流水线模式章节（GitHub Actions、Vercel CI 集成）

此技能在 v3.0 中予以保留，但其正文将在后续 SPEC 中进行重构。