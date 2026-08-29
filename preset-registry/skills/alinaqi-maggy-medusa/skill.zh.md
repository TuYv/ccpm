---
name: medusa
description: Medusa headless commerce - modules, workflows, API routes, admin UI
when-to-use: When building with Medusa commerce platform
user-invocable: false
effort: medium
---
# Medusa 电商 Skill


用于使用 Medusa 构建无头电商系统——开源、原生支持 Node.js，并且完全可定制。

**来源：** [Medusa 文档](https://docs.medusajs.com) | [API 参考](https://docs.medusajs.com/api/store) | [GitHub](https://github.com/medusajs/medusa)

---

## 为什么选择 Medusa

| 特性 | 优势 |
|---------|---------|
| **开源** | 自行托管，不受供应商锁定，采用 MIT 许可证 |
| **原生支持 Node.js** | 使用 TypeScript，技术栈熟悉，易于定制 |
| **无头架构** | 支持任意前端（Next.js、Remix、移动端） |
| **模块化** | 仅使用所需功能，可扩展任何部分 |
| **内置管理后台** | 包含控制面板，并且可定制 |

---

## 快速开始

### 前置条件

```bash
# Required
node --version  # v20+ LTS
git --version
# PostgreSQL running locally or remote
```

### 创建新项目

```bash
# Scaffold new Medusa application
npx create-medusa-app@latest my-store

# This creates:
# - Medusa backend
# - PostgreSQL database (auto-configured)
# - Admin dashboard
# - Optional: Next.js storefront

cd my-store
npm run dev
```

### 访问地址

| URL | 用途 |
|-----|---------|
| `http://localhost:9000` | 后端 API |
| `http://localhost:9000/app` | 管理控制面板 |
| `http://localhost:8000` | 店面（如果已安装） |

### 创建管理员用户

```bash
npx medusa user -e admin@example.com -p supersecret
```

---

## 项目结构

```
medusa-store/
├── src/
│   ├── admin/                    # Admin UI customizations
│   │   ├── widgets/              # Dashboard widgets
│   │   └── routes/               # Custom admin pages
│   ├── api/                      # Custom API routes
│   │   ├── store/                # Public storefront APIs
│   │   │   └── custom/
│   │   │       └── route.ts
│   │   └── admin/                # Admin APIs
│   │       └── custom/
│   │           └── route.ts
│   ├── jobs/                     # Scheduled tasks
│   ├── modules/                  # Custom business logic
│   ├── workflows/                # Multi-step processes
│   ├── subscribers/              # Event listeners
│   └── links/                    # Module relationships
├── .medusa/                      # Auto-generated (don't edit)
├── medusa-config.ts              # Configuration
├── package.json
└── tsconfig.json
```

---

## 配置

### medusa-config.ts

```typescript
import { defineConfig, loadEnv } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000",
      authCors: process.env.AUTH_CORS || "http://localhost:9000",
    },
    redisUrl: process.env.REDIS_URL,
  },
  admin: {
    disable: false,
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
  modules: [
    // Add custom modules here
  ],
});
```

### 环境变量

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/medusa
REDIS_URL=redis://localhost:6379

# CORS (comma-separated for multiple origins)
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000

# Backend URL
MEDUSA_BACKEND_URL=http://localhost:9000

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
COOKIE_SECRET=your-super-secret-cookie-key
```

---

## 自定义 API 路由

### Store API（公开）

```typescript
// src/api/store/hello/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.json({
    message: "Hello from custom store API!",
  });
}

// Accessible at: GET /store/hello
```

### Admin API（受保护）

```typescript
// src/api/admin/analytics/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const orderService = req.scope.resolve(Modules.ORDER);

  const orders = await orderService.listOrders({
    created_at: {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    },
  });

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  res.json({
    orderCount: orders.length,
    totalRevenue,
  });
}

// Accessible at: GET /admin/analytics (requires auth)
```

### 带参数的路由

```typescript
// src/api/store/products/[id]/reviews/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params;

  // Fetch reviews for product
  const reviews = await getReviewsForProduct(id);

  res.json({ reviews });
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params;
  const { rating, comment, customerId } = req.body;

  const review = await createReview({
    productId: id,
    rating,
    comment,
    customerId,
  });

  res.status(201).json({ review });
}

// Accessible at:
// GET  /store/products/:id/reviews
// POST /store/products/:id/reviews
```

### 中间件

```typescript
// src/api/middlewares.ts
import { defineMiddlewares } from "@medusajs/framework/http";
import { authenticate } from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/protected/*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/admin/*",
      middlewares: [authenticate("user", ["session", "bearer"])],
    },
  ],
});
```

---

## 模块（自定义业务逻辑）

### 创建自定义模块

```typescript
// src/modules/reviews/index.ts
import { Module } from "@medusajs/framework/utils";
import ReviewModuleService from "./service";

export const REVIEW_MODULE = "reviewModuleService";

export default Module(REVIEW_MODULE, {
  service: ReviewModuleService,
});
```

```typescript
// src/modules/reviews/service.ts
import { MedusaService } from "@medusajs/framework/utils";

class ReviewModuleService extends MedusaService({}) {
  async createReview(data: CreateReviewInput) {
    // Implementation
  }

  async getProductReviews(productId: string) {
    // Implementation
  }

  async getAverageRating(productId: string) {
    // Implementation
  }
}

export default ReviewModuleService;
```

### 注册模块

```typescript
// medusa-config.ts
import { REVIEW_MODULE } from "./src/modules/reviews";

export default defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/reviews",
      options: {},
    },
  ],
});
```

### 在 API 中使用模块

```typescript
// src/api/store/products/[id]/reviews/route.ts
import { REVIEW_MODULE } from "../../../modules/reviews";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const reviewService = req.scope.resolve(REVIEW_MODULE);

  const reviews = await reviewService.getProductReviews(id);
  const averageRating = await reviewService.getAverageRating(id);

  res.json({ reviews, averageRating });
}
```

---

## 工作流

### 定义工作流

```typescript
// src/workflows/create-order-with-notification/index.ts
import {
  createWorkflow,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";

const createOrderStep = createStep(
  "create-order",
  async (input: CreateOrderInput, { container }) => {
    const orderService = container.resolve(Modules.ORDER);

    const order = await orderService.createOrders(input);

    return new StepResponse(order, order.id);
  },
  // Compensation (rollback) function
  async (orderId, { container }) => {
    const orderService = container.resolve(Modules.ORDER);
    await orderService.deleteOrders([orderId]);
  }
);

const sendNotificationStep = createStep(
  "send-notification",
  async (order: Order, { container }) => {
    const notificationService = container.resolve("notificationService");

    await notificationService.send({
      to: order.email,
      template: "order-confirmation",
      data: { order },
    });

    return new StepResponse({ sent: true });
  }
);

export const createOrderWithNotificationWorkflow = createWorkflow(
  "create-order-with-notification",
  (input: CreateOrderInput) => {
    const order = createOrderStep(input);
    const notification = sendNotificationStep(order);

    return { order, notification };
  }
);
```

### 执行工作流

```typescript
// In an API route
import { createOrderWithNotificationWorkflow } from "../../../workflows/create-order-with-notification";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { result } = await createOrderWithNotificationWorkflow(req.scope).run({
    input: req.body,
  });

  res.json(result);
}
```

---

## 订阅者（事件监听器）

### 创建订阅者

```typescript
// src/subscribers/order-placed.ts
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data.id;

  console.log(`Order placed: ${orderId}`);

  // Send notification, update analytics, etc.
  const notificationService = container.resolve("notificationService");
  await notificationService.sendOrderConfirmation(orderId);
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
```

### 常见事件

| 事件 | 触发条件 |
|-------|---------|
| `order.placed` | 创建新订单 |
| `order.updated` | 修改订单 |
| `order.canceled` | 取消订单 |
| `order.completed` | 完成订单 |
| `customer.created` | 注册新客户 |
| `product.created` | 添加新商品 |
| `product.updated` | 修改商品 |
| `inventory.updated` | 库存变更 |

---

## 定时任务

```typescript
// src/jobs/sync-inventory.ts
import type { MedusaContainer } from "@medusajs/framework";

export default async function syncInventoryJob(container: MedusaContainer) {
  const inventoryService = container.resolve("inventoryService");

  console.log("Running inventory sync...");

  await inventoryService.syncFromExternalSource();

  console.log("Inventory sync complete");
}

export const config = {
  name: "sync-inventory",
  schedule: "0 */6 * * *", // Every 6 hours
};
```

---

## 管理后台 UI 自定义

### 自定义小组件

```tsx
// src/admin/widgets/sales-overview.tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Text } from "@medusajs/ui";

const SalesOverviewWidget = () => {
  return (
    <Container>
      <Heading level="h2">Sales Overview</Heading>
      <Text>Your custom sales data here...</Text>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.list.before", // Where to show the widget
});

export default SalesOverviewWidget;
```

### 小组件区域

| 区域 | 位置 |
|------|----------|
| `order.list.before` | 订单列表之前 |
| `order.details.after` | 订单详情之后 |
| `product.list.before` | 商品列表之前 |
| `product.details.after` | 商品详情之后 |
| `customer.list.before` | 客户列表之前 |

### 自定义管理后台路由

```tsx
// src/admin/routes/analytics/page.tsx
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading } from "@medusajs/ui";
import { ChartBar } from "@medusajs/icons";

const AnalyticsPage = () => {
  return (
    <Container>
      <Heading level="h1">Analytics Dashboard</Heading>
      {/* Your analytics charts */}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Analytics",
  icon: ChartBar,
});

export default AnalyticsPage;
```

---

## Store API（内置）

### 商品

```typescript
// Frontend: Fetch products
const response = await fetch("http://localhost:9000/store/products");
const { products } = await response.json();

// With filters
const response = await fetch(
  "http://localhost:9000/store/products?" +
  new URLSearchParams({
    category_id: "cat_123",
    limit: "20",
    offset: "0",
  })
);
```

### 购物车

```typescript
// Create cart
const { cart } = await fetch("http://localhost:9000/store/carts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    region_id: "reg_123",
  }),
}).then(r => r.json());

// Add item
await fetch(`http://localhost:9000/store/carts/${cart.id}/line-items`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    variant_id: "variant_123",
    quantity: 1,
  }),
});

// Complete cart (create order)
const { order } = await fetch(
  `http://localhost:9000/store/carts/${cart.id}/complete`,
  { method: "POST" }
).then(r => r.json());
```

### 客户身份验证

```typescript
// Register
await fetch("http://localhost:9000/store/customers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "customer@example.com",
    password: "password123",
    first_name: "John",
    last_name: "Doe",
  }),
});

// Login
const { token } = await fetch("http://localhost:9000/store/auth/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "customer@example.com",
    password: "password123",
  }),
}).then(r => r.json());

// Authenticated request
await fetch("http://localhost:9000/store/customers/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## 支付集成

### Stripe 设置

```bash
npm install @medusajs/payment-stripe
```

```typescript
// medusa-config.ts
export default defineConfig({
  modules: [
    {
      resolve: "@medusajs/payment-stripe",
      options: {
        apiKey: process.env.STRIPE_API_KEY,
      },
    },
  ],
});
```

### 在管理后台中

1. 前往 Settings → Regions
2. 将 Stripe 添加为支付提供商
3. 为每个区域进行配置

---

## 部署

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Render

```yaml
# render.yaml
services:
  - type: web
    name: medusa-backend
    runtime: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: medusa-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: COOKIE_SECRET
        generateValue: true

databases:
  - name: medusa-db
    plan: starter
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 9000
CMD ["npm", "run", "start"]
```

---

## CLI 命令

```bash
# Development
npm run dev                    # Start dev server

# Database
npx medusa db:migrate          # Run migrations
npx medusa db:sync             # Sync schema

# Users
npx medusa user -e email -p pass  # Create admin user

# Build
npm run build                  # Build for production
npm run start                  # Start production server
```

---

## 检查清单

### 设置

- [ ] PostgreSQL 数据库已配置
- [ ] Redis 已配置（可选但推荐）
- [ ] 管理员用户已创建
- [ ] CORS 来源已配置
- [ ] JWT/Cookie 密钥已设置

### 自定义

- [ ] 用于业务逻辑的自定义模块
- [ ] 用于前端的自定义 API 路由
- [ ] 用于事件处理的订阅器
- [ ] 用于复杂操作的工作流

### 部署

- [ ] 环境变量已配置
- [ ] 数据库迁移已运行
- [ ] HTTPS 已启用
- [ ] 管理后台 URL 已 secured

---

## 反模式

- **编辑 .medusa 文件夹** - 自动生成，之后会被覆盖
- **直接访问数据库** - 使用服务和模块
- **复杂操作跳过工作流** - 工作流提供回滚功能
- **硬编码 URL** - 使用环境变量
- **忽略 TypeScript 错误** - 框架依赖类型安全