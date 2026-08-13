---
name: shopify-apps
description: Shopify app development - Remix, Admin API, checkout extensions
when-to-use: When building Shopify apps or extensions
user-invocable: false
effort: medium
---
# Shopify 应用开发技能


用于使用 Remix、Shopify App 框架和结账 UI 扩展构建 Shopify 应用。

**来源：** [Shopify 开发文档](https://shopify.dev/docs/apps) | [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) | [Admin API](https://shopify.dev/docs/api/admin-graphql)

---

## 前置条件

### 所需账户和工具

```bash
# 1. Shopify Partner Account (free)
# Sign up at: https://partners.shopify.com

# 2. Development Store
# Create in Partner Dashboard → Stores → Add store → Development store

# 3. Shopify CLI
npm install -g @shopify/cli

# 4. Node.js 18.20+ or 20.10+
node --version
```

### Partner Dashboard 设置

1. 在 partners.shopify.com 创建 Partner 账户
2. 创建用于测试的开发商店
3. 在 Partner Dashboard → Apps → Create app 中创建应用
4. 记录你的 API key 和 API secret

---

## 快速开始

### 搭建新应用

```bash
# Create new Shopify app with Remix
shopify app init

# Answer prompts:
# - App name
# - Template: Remix (recommended)
# - Language: JavaScript or TypeScript

# Start development
cd your-app-name
shopify app dev
```

### 项目结构

```
shopify-app/
├── app/
│   ├── routes/
│   │   ├── app._index/          # Main app page
│   │   │   └── route.jsx
│   │   ├── app.jsx              # App layout with Polaris
│   │   ├── auth.$.jsx           # Auth catch-all
│   │   ├── auth.login/          # Login page
│   │   │   └── route.jsx
│   │   ├── webhooks.app.uninstalled.jsx
│   │   ├── webhooks.app.scopes_update.jsx
│   │   └── webhooks.gdpr.jsx    # GDPR compliance (REQUIRED)
│   ├── shopify.server.js        # Shopify app config
│   ├── db.server.js             # Prisma client
│   └── entry.server.jsx
├── extensions/                   # Checkout/theme extensions
│   └── my-extension/
│       ├── src/
│       │   └── index.tsx
│       ├── shopify.extension.toml
│       └── package.json
├── prisma/
│   └── schema.prisma            # Session storage
├── shopify.app.toml             # App configuration
├── package.json
└── vite.config.js
```

---

## 应用配置

### shopify.app.toml

```toml
# App configuration - managed by Shopify CLI
client_id = "your-api-key"
name = "Your App Name"
handle = "your-app-handle"
application_url = "https://your-app.onrender.com"
embedded = true

[webhooks]
api_version = "2025-01"

# Required: App lifecycle webhooks
[[webhooks.subscriptions]]
topics = ["app/uninstalled"]
uri = "/webhooks/app/uninstalled"

[[webhooks.subscriptions]]
topics = ["app/scopes_update"]
uri = "/webhooks/app/scopes_update"

# Required: GDPR compliance webhooks
[[webhooks.subscriptions]]
compliance_topics = [
  "customers/data_request",
  "customers/redact",
  "shop/redact",
]
uri = "/webhooks/gdpr"

[access_scopes]
scopes = "read_products,write_products"

[auth]
redirect_urls = [
  "https://your-app.onrender.com/auth/callback",
  "https://your-app.onrender.com/auth/shopify/callback",
]

[pos]
embedded = false

[build]
dev_store_url = "your-dev-store.myshopify.com"
automatically_update_urls_on_dev = true
```

### shopify.server.js

```javascript
import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,  // Use GraphQL only
  },
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
```

---

## 身份验证

### 路由保护

```javascript
// app/routes/app._index/route.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../../shopify.server";

export const loader = async ({ request }) => {
  // This authenticates the request and redirects to login if needed
  const { admin, session } = await authenticate.admin(request);

  // Now you have access to admin API and session
  const shop = session.shop;

  return json({ shop });
};

export default function Index() {
  const { shop } = useLoaderData();
  return <div>Connected to: {shop}</div>;
}
```

### Webhook 身份验证

```javascript
// app/routes/webhooks.app.uninstalled.jsx
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Clean up shop data on uninstall
  await prisma.session.deleteMany({ where: { shop } });

  return new Response(null, { status: 200 });
};
```

---

## GraphQL Admin API

### 基本查询模式

```javascript
// app/shopify/adminApi.server.js
export async function getShopId(admin) {
  const response = await admin.graphql(`
    query getShopId {
      shop {
        id
        name
        email
        myshopifyDomain
      }
    }
  `);

  const data = await response.json();
  return data.data?.shop;
}
```

### 使用变量的查询

```javascript
export async function getProducts(admin, first = 10) {
  const response = await admin.graphql(`
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            status
            variants(first: 5) {
              edges {
                node {
                  id
                  price
                  inventoryQuantity
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `, {
    variables: { first }
  });

  const data = await response.json();
  return data.data?.products?.edges.map(e => e.node);
}
```

### 变更操作

```javascript
export async function createProduct(admin, input) {
  const response = await admin.graphql(`
    mutation createProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      input: {
        title: input.title,
        descriptionHtml: input.description,
        status: "DRAFT"
      }
    }
  });

  const data = await response.json();
  const result = data.data?.productCreate;

  if (result?.userErrors?.length > 0) {
    throw new Error(result.userErrors.map(e => e.message).join(", "));
  }

  return result?.product;
}
```

### 元字段（应用设置存储）

```javascript
// Get metafield
export async function getMetafield(admin, namespace, key) {
  const response = await admin.graphql(`
    query getShopMetafield($namespace: String!, $key: String!) {
      shop {
        id
        metafield(namespace: $namespace, key: $key) {
          id
          value
        }
      }
    }
  `, {
    variables: { namespace, key }
  });

  const data = await response.json();
  const metafield = data.data?.shop?.metafield;

  return {
    shopId: data.data?.shop?.id,
    value: metafield?.value ? JSON.parse(metafield.value) : null,
  };
}

// Set metafield
export async function setMetafield(admin, namespace, key, value, shopId) {
  const response = await admin.graphql(`
    mutation CreateMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      metafields: [{
        namespace,
        key,
        type: "json",
        value: JSON.stringify(value),
        ownerId: shopId,
      }]
    }
  });

  const data = await response.json();
  const errors = data.data?.metafieldsSet?.userErrors;

  if (errors?.length > 0) {
    throw new Error(errors.map(e => e.message).join(", "));
  }

  return data.data?.metafieldsSet?.metafields?.[0];
}
```

---

## GDPR 合规（必需）

**所有 Shopify 应用都必须处理 GDPR Webhook。**这是通过 App Store 审核的必要条件。

```javascript
// app/routes/webhooks.gdpr.jsx
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, session } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  switch (topic) {
    case "customers/data_request":
      // Return any customer data you store
      // If you don't store customer data, return empty
      return json({ customer_data: null });

    case "customers/redact":
      // Delete customer data
      // Example: await deleteCustomerData(payload.customer.id);
      return json({ success: true });

    case "shop/redact":
      // Delete all shop data (48 hours after uninstall)
      // Clean up metafields, database records, etc.
      if (session) {
        const { admin } = await authenticate.admin(request);
        await admin.graphql(`
          mutation metafieldDelete($input: MetafieldsDeleteInput!) {
            metafieldsDelete(input: $input) {
              deletedId
            }
          }
        `, {
          variables: {
            input: {
              namespace: "your_app",
              key: "settings",
              ownerType: "SHOP"
            }
          }
        });
      }
      return json({ success: true });

    default:
      return json({ error: "Unhandled topic" }, { status: 400 });
  }
};
```

---

## 使用 Polaris 构建 UI

### 应用布局

```javascript
// app/routes/app.jsx
import { Outlet } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import polarisTranslations from "@shopify/polaris/locales/en.json";

export default function App() {
  return (
    <AppProvider i18n={polarisTranslations}>
      <Outlet />
    </AppProvider>
  );
}
```

### 设置页面模式

```javascript
// app/routes/app._index/route.jsx
import { useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Banner,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { getMetafield, setMetafield, getShopId } from "../../shopify/adminApi.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const { shopId, value } = await getMetafield(admin, "your_app", "settings");
  return json({ shopId, settings: value });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const settings = {
    apiKey: formData.get("apiKey"),
    enabled: formData.get("enabled") === "true",
  };

  try {
    const shopId = await getShopId(admin);
    await setMetafield(admin, "your_app", "settings", settings, shopId.id);
    return json({ success: true, message: "Settings saved!" });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
};

export default function Settings() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const [formState, setFormState] = useState({
    apiKey: settings?.apiKey || "",
    enabled: settings?.enabled ?? true,
  });

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("apiKey", formState.apiKey);
    formData.append("enabled", String(formState.enabled));
    submit(formData, { method: "post" });
  };

  return (
    <Page
      title="App Settings"
      primaryAction={{
        content: "Save",
        onAction: handleSubmit,
      }}
    >
      <Layout>
        {actionData?.message && (
          <Layout.Section>
            <Banner tone="success">{actionData.message}</Banner>
          </Layout.Section>
        )}

        {actionData?.error && (
          <Layout.Section>
            <Banner tone="critical">{actionData.error}</Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <FormLayout>
              <TextField
                label="API Key"
                value={formState.apiKey}
                onChange={(value) => setFormState({ ...formState, apiKey: value })}
                autoComplete="off"
              />

              <Select
                label="Enable Integration"
                options={[
                  { label: "Enabled", value: "true" },
                  { label: "Disabled", value: "false" },
                ]}
                value={String(formState.enabled)}
                onChange={(value) =>
                  setFormState({ ...formState, enabled: value === "true" })
                }
              />
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

## 结账 UI 扩展

### 扩展配置

```toml
# extensions/my-extension/shopify.extension.toml
api_version = "2025-01"

[[extensions]]
name = "My Checkout Extension"
handle = "my-checkout-extension"
type = "ui_extension"

[[extensions.targeting]]
module = "./src/index.tsx"
target = "purchase.thank-you.block.render"

[extensions.capabilities]
api_access = true
network_access = true

# Access app metafields in extension
[[extensions.metafields]]
namespace = "your_app"
key = "settings"
```

### 扩展目标位置

| 目标 | 位置 |
|--------|----------|
| `purchase.thank-you.block.render` | 感谢页面 |
| `purchase.checkout.block.render` | 结账页面 |
| `customer-account.order-status.block.render` | 订单状态 |
| `customer-account.page.render` | 客户账户页面 |
| `admin.product-details.block.render` | 后台产品页面 |

### 扩展组件

```tsx
// extensions/my-extension/src/index.tsx
import {
  reactExtension,
  useShop,
  useAppMetafields,
  useApi,
  View,
  BlockStack,
  Heading,
  Text,
  Button,
  Spinner,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.thank-you.block.render", () => (
  <Extension />
));

function Extension() {
  const shop = useShop();
  const { orderConfirmation } = useApi();
  const order = orderConfirmation.current.order;

  // Access app metafields
  const metafields = useAppMetafields({
    namespace: "your_app",
    key: "settings"
  });

  const settings = metafields[0]?.metafield?.value
    ? JSON.parse(metafields[0].metafield.value)
    : null;

  if (!settings?.enabled) {
    return null;
  }

  return (
    <View border="base" padding="base">
      <BlockStack>
        <Heading level={2}>Thank You!</Heading>
        <Text>Order #{order.id} confirmed</Text>
        <Text appearance="subdued">
          Shop: {shop.myshopifyDomain}
        </Text>
      </BlockStack>
    </View>
  );
}
```

### 使用外部 API 的扩展

```tsx
// extensions/my-extension/src/hooks/useExternalApi.ts
import { useState, useEffect } from "react";

export function useExternalApi(surveyId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!surveyId) {
      setLoading(false);
      return;
    }

    fetch(`https://api.example.com/surveys/${surveyId}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [surveyId]);

  return { data, loading, error };
}
```

---

## 数据库（Prisma）

### 会话存储架构

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // or "sqlite" for dev
  url      = env("DATABASE_URL")
}

// Required for Shopify session storage
model Session {
  id            String    @id
  shop          String
  state         String
  isOnline      Boolean   @default(false)
  scope         String?
  expires       DateTime?
  accessToken   String
  userId        BigInt?
  firstName     String?
  lastName      String?
  email         String?
  accountOwner  Boolean   @default(false)
  locale        String?
  collaborator  Boolean?  @default(false)
  emailVerified Boolean?  @default(false)

  @@index([shop])
}

// Your app's custom models
model AppSettings {
  id        String   @id @default(uuid())
  shop      String   @unique
  settings  Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 数据库客户端

```javascript
// app/db.server.js
import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances in development
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export { prisma };
```

---

## 部署

### 环境变量

```bash
# .env (DO NOT COMMIT)
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_products,write_products
SHOPIFY_APP_URL=https://your-app.onrender.com
DATABASE_URL=postgresql://...
```

### Render 部署

```yaml
# render.yaml
services:
  - type: web
    name: shopify-app
    runtime: node
    plan: starter
    buildCommand: npm install && npm run setup && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: shopify-db
          property: connectionString
      - key: SHOPIFY_API_KEY
        sync: false
      - key: SHOPIFY_API_SECRET
        sync: false
      - key: SCOPES
        sync: false
      - key: SHOPIFY_APP_URL
        sync: false

databases:
  - name: shopify-db
    plan: starter
```

### 部署命令

```bash
# Deploy app to Shopify
shopify app deploy

# This:
# 1. Builds extensions
# 2. Uploads to Shopify
# 3. Creates new app version
```

---

## 常用权限范围

| 权限范围 | 访问权限 |
|-------|--------|
| `read_products` | 查看产品 |
| `write_products` | 创建/编辑产品 |
| `read_orders` | 查看订单 |
| `write_orders` | 创建/编辑订单 |
| `read_customers` | 查看客户 |
| `write_customers` | 创建/编辑客户 |
| `read_checkouts` | 查看结账数据 |
| `write_checkouts` | 修改结账 |
| `read_themes` | 查看主题 |
| `write_themes` | 修改主题 |
| `read_content` | 查看元字段/文件 |
| `write_content` | 修改元字段/文件 |

---

## CLI 命令

```bash
# Development
shopify app dev                    # Start dev server with tunnel
shopify app dev --reset            # Reset app config

# Configuration
shopify app config link            # Link to existing app
shopify app config use             # Switch config
shopify app env show               # Show env vars

# Extensions
shopify app generate extension     # Create new extension
shopify app build                  # Build all extensions

# Deployment
shopify app deploy                 # Deploy to Shopify
shopify app versions list          # List app versions

# Store
shopify app open                   # Open app in dev store
```

---

## 测试

### 单元测试

```javascript
// __tests__/adminApi.test.js
import { describe, it, expect, vi } from 'vitest';
import { getShopId, setMetafield } from '../app/shopify/adminApi.server';

describe('Admin API', () => {
  it('gets shop ID', async () => {
    const mockAdmin = {
      graphql: vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          data: { shop: { id: 'gid://shopify/Shop/123' } }
        })
      })
    };

    const result = await getShopId(mockAdmin);
    expect(result.id).toBe('gid://shopify/Shop/123');
  });
});
```

### 使用 Playwright 进行 E2E 测试

```typescript
// e2e/app.spec.ts
import { test, expect } from '@playwright/test';

test('app settings page loads', async ({ page }) => {
  // Note: Requires authenticated session
  await page.goto('/app');

  await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  await expect(page.getByLabel('API Key')).toBeVisible();
});

test('saves settings successfully', async ({ page }) => {
  await page.goto('/app');

  await page.fill('[name="apiKey"]', 'test-key-123');
  await page.click('button:has-text("Save")');

  await expect(page.getByText('Settings saved')).toBeVisible();
});
```

---

## 速率限制

### 基于成本的 GraphQL 限制

```javascript
// Check rate limit status in response
const response = await admin.graphql(`
  query {
    shop { name }
  }
`);

const data = await response.json();

// Rate limit info in extensions
const throttleStatus = data.extensions?.cost?.throttleStatus;
// {
//   maximumAvailable: 1000,
//   currentlyAvailable: 950,
//   restoreRate: 50  // points per second
// }
```

### 处理限流

```javascript
async function graphqlWithRetry(admin, query, variables, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await admin.graphql(query, { variables });
    const data = await response.json();

    if (data.errors?.some(e => e.extensions?.code === 'THROTTLED')) {
      const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    return data;
  }
  throw new Error('Max retries exceeded');
}
```

---

## 检查清单

### 开发前

- [ ] 已创建合作伙伴账户
- [ ] 已创建开发商店
- [ ] 已在合作伙伴控制面板中创建应用
- [ ] 已安装 Shopify CLI
- [ ] 已使用 Remix 模板搭建应用脚手架

### 提交前

- [ ] 已实现 GDPR Webhook（customers/data_request、customers/redact、shop/redact）
- [ ] 应用卸载 Webhook 会清理数据
- [ ] 未硬编码 API 密钥
- [ ] 所有 API 调用均有错误处理
- [ ] 已处理速率限制
- [ ] 响应式 UI（可在移动端管理后台正常使用）
- [ ] 始终如一地使用 Polaris 组件
- [ ] 扩展目标指向正确的界面
- [ ] 已配置隐私政策 URL
- [ ] 已完成应用列表信息

### 安全性

- [ ] 已验证会话令牌
- [ ] Webhook HMAC 验证（由 SDK 处理）
- [ ] 客户端代码中无敏感数据
- [ ] 所有密钥均使用环境变量
- [ ] 强制使用 HTTPS

---

## 反模式

- **使用 REST API** - 使用 GraphQL Admin API（REST 已弃用）
- **在元字段中存储密钥** - 使用环境变量
- **忽略速率限制** - 实现指数退避
- **跳过 GDPR Webhook** - App Store 要求必须实现
- **大型 GraphQL 查询** - 使用分页，并且仅查询所需字段
- **轮询更新** - 改用 Webhook
- **自定义身份验证流程** - 通过 SDK 使用 Shopify 的 OAuth 流程