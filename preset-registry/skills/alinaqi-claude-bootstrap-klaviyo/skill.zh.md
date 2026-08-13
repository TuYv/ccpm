---
name: klaviyo
description: Klaviyo email/SMS marketing - profiles, events, flows, segmentation
when-to-use: When integrating Klaviyo for email/SMS marketing
user-invocable: false
effort: medium
---
# Klaviyo 电商营销 Skill


用于集成 Klaviyo 电子邮件/短信营销——包括客户资料、事件跟踪、营销活动、流程和细分。

**来源：** [Klaviyo API 文档](https://developers.klaviyo.com/en/docs) | [API 参考](https://developers.klaviyo.com/en/reference/api-overview)

---

## 为什么选择 Klaviyo

| 功能 | 优势 |
|---------|---------|
| **原生支持电商** | 专为在线商店打造，提供深度集成 |
| **基于事件** | 可通过任何客户操作触发流程 |
| **细分** | 基于行为和属性进行高级筛选 |
| **电子邮件 + 短信** | 在统一平台中管理两种渠道 |
| **分析** | 按营销活动进行收入归因 |

---

## API 基础知识

### 基础 URL

| 类型 | URL |
|------|-----|
| 服务端（私有） | `https://a.klaviyo.com/api` |
| 客户端（公开） | `https://a.klaviyo.com/client` |

### 身份验证

```typescript
// Server-side: Private API Key
const headers = {
  "Authorization": "Klaviyo-API-Key pk_xxxxxxxxxxxxxxxxxxxxxxxx",
  "Content-Type": "application/json",
  "revision": "2024-10-15",  // API version
};

// Client-side: Public API Key (6 characters)
const publicKey = "XXXXXX";  // Company ID
// Use as query param: ?company_id=XXXXXX
```

### API 密钥作用域

| 作用域 | 访问权限 |
|-------|--------|
| 只读 | 仅查看数据 |
| 完全访问 | 读取 + 写入（默认） |
| 自定义 | 特定权限 |

---

## 安装

### Node.js

```bash
npm install klaviyo-api
```

```typescript
// lib/klaviyo.ts
import { ApiClient, EventsApi, ProfilesApi, ListsApi } from "klaviyo-api";

const client = new ApiClient();
client.setApiKey(process.env.KLAVIYO_PRIVATE_KEY!);

export const eventsApi = new EventsApi(client);
export const profilesApi = new ProfilesApi(client);
export const listsApi = new ListsApi(client);
```

### Python

```bash
pip install klaviyo-api
```

```python
# lib/klaviyo.py
from klaviyo_api import KlaviyoAPI

klaviyo = KlaviyoAPI(
    api_key=os.environ["KLAVIYO_PRIVATE_KEY"],
    max_delay=60,
    max_retries=3
)
```

### 直接使用 HTTP（适用于任何语言）

```typescript
// lib/klaviyo.ts
const KLAVIYO_BASE_URL = "https://a.klaviyo.com/api";

async function klaviyoRequest(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: object
) {
  const response = await fetch(`${KLAVIYO_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
      "Content-Type": "application/json",
      revision: "2024-10-15",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Klaviyo API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}
```

---

## 客户资料（客户）

### 创建/更新客户资料

```typescript
// Upsert profile (create or update)
async function upsertProfile(data: ProfileInput) {
  return klaviyoRequest("/profiles", "POST", {
    data: {
      type: "profile",
      attributes: {
        email: data.email,
        phone_number: data.phone, // E.164 format: +1234567890
        first_name: data.firstName,
        last_name: data.lastName,
        properties: {
          // Custom properties
          lifetime_value: data.ltv,
          plan: data.plan,
          signup_source: data.source,
        },
        location: {
          city: data.city,
          region: data.state,
          country: data.country,
          zip: data.zip,
        },
      },
    },
  });
}
```

```python
# Python
def upsert_profile(data):
    return klaviyo.Profiles.create_or_update_profile({
        "data": {
            "type": "profile",
            "attributes": {
                "email": data["email"],
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "properties": {
                    "plan": data.get("plan"),
                }
            }
        }
    })
```

### 获取个人资料

```typescript
async function getProfileByEmail(email: string) {
  const response = await klaviyoRequest(
    `/profiles?filter=equals(email,"${email}")`
  );
  return response.data[0];
}

async function getProfileById(profileId: string) {
  return klaviyoRequest(`/profiles/${profileId}`);
}
```

### 更新个人资料属性

```typescript
async function updateProfileProperties(
  profileId: string,
  properties: Record<string, any>
) {
  return klaviyoRequest(`/profiles/${profileId}`, "PATCH", {
    data: {
      type: "profile",
      id: profileId,
      attributes: {
        properties,
      },
    },
  });
}

// Usage
await updateProfileProperties("profile_id", {
  last_purchase_date: new Date().toISOString(),
  total_orders: 5,
  vip_status: true,
});
```

---

## 事件（追踪）

### 追踪事件（服务端）

```typescript
async function trackEvent(data: EventInput) {
  return klaviyoRequest("/events", "POST", {
    data: {
      type: "event",
      attributes: {
        profile: {
          data: {
            type: "profile",
            attributes: {
              email: data.email,
              // or phone_number, or external_id
            },
          },
        },
        metric: {
          data: {
            type: "metric",
            attributes: {
              name: data.eventName,
            },
          },
        },
        properties: data.properties,
        value: data.value, // For revenue tracking
        unique_id: data.uniqueId, // Deduplication
        time: data.timestamp || new Date().toISOString(),
      },
    },
  });
}
```

### 常见电子商务事件

```typescript
// Viewed Product
await trackEvent({
  email: customer.email,
  eventName: "Viewed Product",
  properties: {
    ProductID: product.id,
    ProductName: product.name,
    ProductURL: product.url,
    ImageURL: product.image,
    Price: product.price,
    Categories: product.categories,
  },
});

// Added to Cart
await trackEvent({
  email: customer.email,
  eventName: "Added to Cart",
  properties: {
    ProductID: product.id,
    ProductName: product.name,
    Quantity: quantity,
    Price: product.price,
    CartTotal: cart.total,
    ItemNames: cart.items.map(i => i.name),
  },
  value: product.price * quantity,
});

// Started Checkout
await trackEvent({
  email: customer.email,
  eventName: "Started Checkout",
  properties: {
    CheckoutURL: checkout.url,
    ItemCount: cart.itemCount,
    Categories: cart.categories,
    ItemNames: cart.items.map(i => i.name),
  },
  value: cart.total,
});

// Placed Order
await trackEvent({
  email: customer.email,
  eventName: "Placed Order",
  properties: {
    OrderId: order.id,
    ItemCount: order.itemCount,
    Categories: order.categories,
    ItemNames: order.items.map(i => i.name),
    Items: order.items.map(i => ({
      ProductID: i.productId,
      ProductName: i.name,
      Quantity: i.quantity,
      Price: i.price,
      ImageURL: i.image,
      ProductURL: i.url,
    })),
    BillingAddress: order.billingAddress,
    ShippingAddress: order.shippingAddress,
  },
  value: order.total,
  uniqueId: order.id, // Prevent duplicate orders
});

// Fulfilled Order
await trackEvent({
  email: customer.email,
  eventName: "Fulfilled Order",
  properties: {
    OrderId: order.id,
    TrackingNumber: fulfillment.trackingNumber,
    TrackingURL: fulfillment.trackingUrl,
    Carrier: fulfillment.carrier,
  },
});

// Cancelled Order
await trackEvent({
  email: customer.email,
  eventName: "Cancelled Order",
  properties: {
    OrderId: order.id,
    Reason: cancellation.reason,
  },
  value: -order.total, // Negative value for refunds
});
```

### 客户端追踪（JavaScript）

```html
<!-- Add to your site -->
<script async src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=XXXXXX"></script>

<script>
  // Identify user
  klaviyo.identify({
    email: "customer@example.com",
    first_name: "John",
    last_name: "Doe",
  });

  // Track event
  klaviyo.track("Viewed Product", {
    ProductID: "prod_123",
    ProductName: "Blue T-Shirt",
    Price: 29.99,
  });

  // Track with value
  klaviyo.track("Added to Cart", {
    ProductID: "prod_123",
    ProductName: "Blue T-Shirt",
    Price: 29.99,
    $value: 29.99,  // Revenue tracking
  });
</script>
```

---

## 列表与分群

### 将档案添加到列表

```typescript
async function addToList(listId: string, emails: string[]) {
  return klaviyoRequest(`/lists/${listId}/relationships/profiles`, "POST", {
    data: emails.map(email => ({
      type: "profile",
      attributes: { email },
    })),
  });
}

// By profile ID
async function addProfileToList(listId: string, profileId: string) {
  return klaviyoRequest(`/lists/${listId}/relationships/profiles`, "POST", {
    data: [{ type: "profile", id: profileId }],
  });
}
```

### 从列表中移除

```typescript
async function removeFromList(listId: string, profileId: string) {
  return klaviyoRequest(
    `/lists/${listId}/relationships/profiles`,
    "DELETE",
    {
      data: [{ type: "profile", id: profileId }],
    }
  );
}
```

### 获取列表成员

```typescript
async function getListMembers(listId: string, cursor?: string) {
  const params = new URLSearchParams({
    "page[size]": "100",
  });
  if (cursor) {
    params.set("page[cursor]", cursor);
  }

  return klaviyoRequest(`/lists/${listId}/profiles?${params}`);
}
```

### 创建列表

```typescript
async function createList(name: string) {
  return klaviyoRequest("/lists", "POST", {
    data: {
      type: "list",
      attributes: { name },
    },
  });
}
```

---

## 营销活动

### 获取营销活动

```typescript
async function getCampaigns(status?: "draft" | "scheduled" | "sent") {
  const params = new URLSearchParams();
  if (status) {
    params.set("filter", `equals(status,"${status}")`);
  }

  return klaviyoRequest(`/campaigns?${params}`);
}
```

### 获取营销活动效果

```typescript
async function getCampaignMetrics(campaignId: string) {
  return klaviyoRequest(
    `/campaign-recipient-estimations/${campaignId}`,
    "GET"
  );
}
```

---

## 流程（自动化）

### 获取流程

```typescript
async function getFlows() {
  return klaviyoRequest("/flows");
}

async function getFlowById(flowId: string) {
  return klaviyoRequest(`/flows/${flowId}`);
}
```

### 常见流程触发条件

| 流程类型 | 触发事件 |
|-----------|---------------|
| 欢迎系列 | 添加到列表 |
| 弃购召回 | 添加到购物车 + 未购买 |
| 浏览放弃 | 查看商品 + 未加入购物车 |
| 购买后跟进 | 下单 |
| 客户召回 | X 天内无订单 |
| 评价请求 | 订单已履约 |

---

## Webhook

### 创建 Webhook

```typescript
async function createWebhook(data: WebhookInput) {
  return klaviyoRequest("/webhooks", "POST", {
    data: {
      type: "webhook",
      attributes: {
        name: data.name,
        endpoint_url: data.url,
        secret_key: data.secret,
        topics: data.topics, // e.g., ["profile.created", "event.created"]
      },
    },
  });
}
```

### Webhook 主题

| 主题 | 触发条件 |
|-------|---------|
| `profile.created` | 创建新资料 |
| `profile.updated` | 资料属性发生变化 |
| `profile.merged` | 资料合并 |
| `event.created` | 追踪到新事件 |
| `list.member.added` | 资料添加到列表 |
| `list.member.removed` | 资料从列表中移除 |

### 验证 Webhook 签名

```typescript
import crypto from "crypto";

function verifyKlaviyoWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express handler
app.post("/webhooks/klaviyo", (req, res) => {
  const signature = req.headers["klaviyo-webhook-signature"] as string;

  if (!verifyKlaviyoWebhook(JSON.stringify(req.body), signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const { type, data } = req.body;

  switch (type) {
    case "profile.created":
      handleNewProfile(data);
      break;
    case "event.created":
      handleNewEvent(data);
      break;
  }

  res.status(200).json({ received: true });
});
```

---

## 速率限制

| 时间窗口 | 限制 |
|--------|-------|
| 突发 | 75 个请求/秒 |
| 稳定 | 700 个请求/分钟 |

### 处理速率限制

```typescript
async function klaviyoRequestWithRetry(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: object,
  retries = 3
): Promise<any> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(`${KLAVIYO_BASE_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
        "Content-Type": "application/json",
        revision: "2024-10-15",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get("Retry-After") || "5");
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      continue;
    }

    if (!response.ok) {
      throw new Error(`Klaviyo error: ${response.status}`);
    }

    return response.json();
  }

  throw new Error("Max retries exceeded");
}
```

---

## 分页

```typescript
async function getAllProfiles() {
  const profiles = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ "page[size]": "100" });
    if (cursor) {
      params.set("page[cursor]", cursor);
    }

    const response = await klaviyoRequest(`/profiles?${params}`);
    profiles.push(...response.data);

    cursor = response.links?.next
      ? new URL(response.links.next).searchParams.get("page[cursor]")
      : undefined;
  } while (cursor);

  return profiles;
}
```

---

## 筛选与排序

```typescript
// Filter by date
const recentEvents = await klaviyoRequest(
  `/events?filter=greater-than(datetime,2024-01-01T00:00:00Z)`
);

// Filter by property
const vipProfiles = await klaviyoRequest(
  `/profiles?filter=equals(properties.vip_status,true)`
);

// Multiple filters (AND)
const filtered = await klaviyoRequest(
  `/profiles?filter=and(equals(properties.plan,"pro"),greater-than(properties.ltv,1000))`
);

// Sorting
const sorted = await klaviyoRequest(
  `/profiles?sort=-created`  // Descending by created date
);

// Sparse fieldsets (only return specific fields)
const sparse = await klaviyoRequest(
  `/profiles?fields[profile]=email,first_name,properties`
);
```

---

## 集成模式

### 电子商务订单同步

```typescript
// After order is placed
async function syncOrderToKlaviyo(order: Order) {
  // 1. Upsert customer profile
  await upsertProfile({
    email: order.customerEmail,
    firstName: order.customerFirstName,
    lastName: order.customerLastName,
    phone: order.customerPhone,
  });

  // 2. Update lifetime metrics
  await updateProfileProperties(
    await getProfileIdByEmail(order.customerEmail),
    {
      last_order_date: new Date().toISOString(),
      total_orders: order.customerOrderCount,
      lifetime_value: order.customerLifetimeValue,
    }
  );

  // 3. Track order event
  await trackEvent({
    email: order.customerEmail,
    eventName: "Placed Order",
    properties: {
      OrderId: order.id,
      Items: order.items,
      // ... other properties
    },
    value: order.total,
    uniqueId: order.id,
  });
}
```

### 订阅状态同步

```typescript
// When subscription changes
async function syncSubscriptionStatus(user: User, status: string) {
  await updateProfileProperties(user.klaviyoProfileId, {
    subscription_status: status,
    subscription_plan: user.plan,
    subscription_updated_at: new Date().toISOString(),
  });

  await trackEvent({
    email: user.email,
    eventName: `Subscription ${status}`,
    properties: {
      plan: user.plan,
      mrr: user.mrr,
    },
    value: status === "cancelled" ? -user.mrr : user.mrr,
  });
}
```

---

## 环境变量

```bash
# .env
KLAVIYO_PRIVATE_KEY=pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
KLAVIYO_PUBLIC_KEY=XXXXXX
KLAVIYO_WEBHOOK_SECRET=your_webhook_secret
```

添加到 `credentials.md`：
```python
'KLAVIYO_PRIVATE_KEY': r'pk_[a-f0-9]{32}',
'KLAVIYO_PUBLIC_KEY': r'[A-Z0-9]{6}',
```

---

## 检查清单

### 设置

- [ ] 已创建 Klaviyo 账户
- [ ] 已生成私有 API 密钥
- [ ] 已记录公共 API 密钥（公司 ID）
- [ ] 已在请求头中设置 API 修订版本

### 集成

- [ ] 注册/更新时同步用户档案
- [ ] 已跟踪关键事件（浏览、购物车、订单）
- [ ] 订单事件包含 Items 数组
- [ ] 使用 $value 跟踪收入
- [ ] 使用唯一 ID 进行去重

### 测试

- [ ] 测试用户档案创建
- [ ] 测试事件跟踪
- [ ] 在 Klaviyo 控制面板中验证事件
- [ ] 测试 Webhook 交付
- [ ] 测试速率限制处理

---

## 反面模式

- **缺少电子邮件/电话号码** - 每个用户档案至少需要一个标识符
- **重复事件** - 对订单/交易使用 unique_id
- **缺少 Items 数组** - 产品推荐需要此数组
- **仅使用客户端跟踪** - 服务端跟踪更加可靠
- **忽略速率限制** - 实现指数退避
- **硬编码 API 密钥** - 使用环境变量
- **缺少收入跟踪** - 包含 $value 以进行 ROI 归因