---
name: azure-cosmosdb
description: Azure Cosmos DB partition keys, consistency levels, change feed, SDK patterns
when-to-use: When working with Azure Cosmos DB
user-invocable: false
paths: ["**/cosmos*", "**/azure*"]
effort: medium
---
## 核心原则

**明智地选择分区键，根据访问模式进行设计，并理解一致性的权衡。**

Cosmos DB 将数据分布在多个分区中。分区键的选择决定了可扩展性、性能和成本。设计时应确保数据均匀分布并提高查询效率。

---

## Cosmos DB API

| API | 使用场景 |
|-----|----------|
| **NoSQL (Core)** | 文档数据库，灵活性最高 |
| **MongoDB** | 兼容 MongoDB 线路协议 |
| **PostgreSQL** | 分布式 PostgreSQL（Citus） |
| **Apache Cassandra** | 宽列存储 |
| **Apache Gremlin** | 图数据库 |
| **Table** | 键值存储（兼容 Azure Table Storage） |

本技能重点介绍 **NoSQL (Core) API**——最常见的选择。

---

## 关键概念

| 概念 | 描述 |
|---------|-------------|
| **容器** | 项目的集合（类似于表） |
| **项目** | 单个文档/记录（JSON） |
| **分区键** | 决定数据分布方式 |
| **逻辑分区** | 具有相同分区键的项目 |
| **物理分区** | 存储单元（最大 50GB、10K RU/s） |
| **RU（请求单位）** | 吞吐量的计量单位 |

---

## 分区键设计

### 良好的分区键
```typescript
// High cardinality, even distribution, used in queries

// E-commerce: userId for user data
{ "id": "order-123", "userId": "user-456", ... }  // PK: /userId

// Multi-tenant: tenantId
{ "id": "doc-1", "tenantId": "tenant-abc", ... }  // PK: /tenantId

// IoT: deviceId for telemetry
{ "id": "reading-1", "deviceId": "device-789", ... }  // PK: /deviceId

// Logs: synthetic key (date + category)
{ "id": "log-1", "partitionKey": "2024-01-15_errors", ... }  // PK: /partitionKey
```

### 分层分区键
```typescript
// For multi-level distribution (e.g., tenant → user)
// Container created with: /tenantId, /userId

{
  "id": "order-123",
  "tenantId": "acme-corp",
  "userId": "user-456",
  "items": [...]
}

// Query within tenant and user efficiently
```

### 不良的分区键
```typescript
// Avoid:
// - Low cardinality (status, type, boolean)
// - Monotonically increasing (timestamp, auto-increment)
// - Frequently updated fields
// - Fields not used in queries

// Bad: Only 3 values → hot partitions
{ "status": "pending" | "completed" | "cancelled" }

// Bad: All writes go to latest partition
{ "timestamp": "2024-01-15T10:30:00Z" }
```

---

## SDK 设置（TypeScript）

### 安装
```bash
npm install @azure/cosmos
```

### 初始化客户端
```typescript
// lib/cosmosdb.ts
import { CosmosClient, Database, Container } from '@azure/cosmos';

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DATABASE!;

const client = new CosmosClient({ endpoint, key });

// Or with connection string
// const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);

export const database: Database = client.database(databaseId);

export function getContainer(containerId: string): Container {
  return database.container(containerId);
}
```

### 类型定义
```typescript
// types/cosmos.ts
export interface BaseItem {
  id: string;
  _ts?: number;      // Auto-generated timestamp
  _etag?: string;    // For optimistic concurrency
}

export interface User extends BaseItem {
  userId: string;    // Partition key
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order extends BaseItem {
  userId: string;    // Partition key
  orderId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}
```

---

## CRUD 操作

### 创建项目
```typescript
import { getContainer } from './cosmosdb';
import { User } from './types';

const usersContainer = getContainer('users');

async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const now = new Date().toISOString();
  const user: User = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now
  };

  const { resource } = await usersContainer.items.create(user);
  return resource as User;
}
```

### 读取项目（点读取）
```typescript
// Most efficient read - requires id AND partition key
async function getUser(userId: string, id: string): Promise<User | null> {
  try {
    const { resource } = await usersContainer.item(id, userId).read<User>();
    return resource || null;
  } catch (error: any) {
    if (error.code === 404) return null;
    throw error;
  }
}

// If id equals partition key value
async function getUserById(userId: string): Promise<User | null> {
  try {
    const { resource } = await usersContainer.item(userId, userId).read<User>();
    return resource || null;
  } catch (error: any) {
    if (error.code === 404) return null;
    throw error;
  }
}
```

### 查询项目
```typescript
// Query within partition (efficient)
async function getUserOrders(userId: string): Promise<Order[]> {
  const ordersContainer = getContainer('orders');

  const { resources } = await ordersContainer.items
    .query<Order>({
      query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@userId', value: userId }]
    })
    .fetchAll();

  return resources;
}

// Cross-partition query (use sparingly)
async function getOrdersByStatus(status: string): Promise<Order[]> {
  const ordersContainer = getContainer('orders');

  const { resources } = await ordersContainer.items
    .query<Order>({
      query: 'SELECT * FROM c WHERE c.status = @status',
      parameters: [{ name: '@status', value: status }]
    })
    .fetchAll();

  return resources;
}

// Paginated query
async function getOrdersPaginated(
  userId: string,
  pageSize: number = 10,
  continuationToken?: string
): Promise<{ items: Order[]; continuationToken?: string }> {
  const ordersContainer = getContainer('orders');

  const queryIterator = ordersContainer.items.query<Order>(
    {
      query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@userId', value: userId }]
    },
    {
      maxItemCount: pageSize,
      continuationToken
    }
  );

  const { resources, continuationToken: nextToken } = await queryIterator.fetchNext();

  return {
    items: resources,
    continuationToken: nextToken
  };
}
```

### 更新项目
```typescript
// Replace entire item
async function updateUser(userId: string, id: string, updates: Partial<User>): Promise<User> {
  const existing = await getUser(userId, id);
  if (!existing) throw new Error('User not found');

  const updated: User = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const { resource } = await usersContainer.item(id, userId).replace(updated);
  return resource as User;
}

// Partial update (patch operations)
async function patchUser(userId: string, id: string, operations: any[]): Promise<User> {
  const { resource } = await usersContainer.item(id, userId).patch(operations);
  return resource as User;
}

// Usage:
await patchUser('user-123', 'user-123', [
  { op: 'set', path: '/name', value: 'New Name' },
  { op: 'set', path: '/updatedAt', value: new Date().toISOString() },
  { op: 'incr', path: '/loginCount', value: 1 }
]);
```

### 删除项目
```typescript
async function deleteUser(userId: string, id: string): Promise<void> {
  await usersContainer.item(id, userId).delete();
}
```

### 乐观并发控制（ETag）
```typescript
async function updateUserWithETag(
  userId: string,
  id: string,
  updates: Partial<User>,
  etag: string
): Promise<User> {
  const existing = await getUser(userId, id);
  if (!existing) throw new Error('User not found');

  const updated: User = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  try {
    const { resource } = await usersContainer.item(id, userId).replace(updated, {
      accessCondition: { type: 'IfMatch', condition: etag }
    });
    return resource as User;
  } catch (error: any) {
    if (error.code === 412) {
      throw new Error('Document was modified by another process');
    }
    throw error;
  }
}
```

---

## 一致性级别

| 级别 | 保证 | 延迟 | 使用场景 |
|-------|-----------|---------|----------|
| **强一致性** | 线性一致读 | 最高 | 金融、库存 |
| **有限过期一致性** | 在限定范围内保持一致 | 高 | 排行榜、计数器 |
| **会话一致性** | 读到自己的写入 | 中 | 用户会话（默认） |
| **一致前缀** | 有序读取 | 低 | 社交动态 |
| **最终一致性** | 不保证顺序 | 最低 | 分析、日志 |

### 为每个请求设置一致性
```typescript
// Override default consistency
const { resource } = await usersContainer.item(id, userId).read<User>({
  consistencyLevel: 'Strong'
});

// For queries
const { resources } = await container.items.query(
  { query: 'SELECT * FROM c' },
  { consistencyLevel: 'BoundedStaleness' }
).fetchAll();
```

---

## 批处理操作

### 事务批处理（同一分区）
```typescript
async function createOrderWithItems(userId: string, order: Order, items: any[]): Promise<void> {
  const ordersContainer = getContainer('orders');

  const operations = [
    { operationType: 'Create' as const, resourceBody: order },
    ...items.map(item => ({
      operationType: 'Create' as const,
      resourceBody: { ...item, userId, orderId: order.orderId }
    }))
  ];

  const { result } = await ordersContainer.items.batch(operations, userId);

  // Check if any operation failed
  if (result.some(r => r.statusCode >= 400)) {
    throw new Error('Batch operation failed');
  }
}
```

### 批量操作
```typescript
// For large-scale imports (not transactional)
async function bulkImportUsers(users: User[]): Promise<void> {
  const operations = users.map(user => ({
    operationType: 'Create' as const,
    resourceBody: user,
    partitionKey: user.userId
  }));

  // Process in chunks
  const chunkSize = 100;
  for (let i = 0; i < operations.length; i += chunkSize) {
    const chunk = operations.slice(i, i + chunkSize);
    await usersContainer.items.bulk(chunk);
  }
}
```

---

## 更改源

### 处理更改
```typescript
import { ChangeFeedStartFrom } from '@azure/cosmos';

async function processChangeFeed(): Promise<void> {
  const container = getContainer('orders');

  const changeFeedIterator = container.items.changeFeed({
    changeFeedStartFrom: ChangeFeedStartFrom.Beginning()
  });

  while (changeFeedIterator.hasMoreResults) {
    const { result: items, statusCode } = await changeFeedIterator.fetchNext();

    if (statusCode === 304) {
      // No new changes
      await sleep(1000);
      continue;
    }

    for (const item of items) {
      console.log('Changed item:', item);
      // Process the change...
    }
  }
}

// For production, use Change Feed Processor with lease container
```

### 更改源处理器模式
```typescript
async function startChangeFeedProcessor(): Promise<void> {
  const sourceContainer = getContainer('orders');
  const leaseContainer = getContainer('leases');

  const changeFeedProcessor = sourceContainer.items.changeFeed
    .for(item => {
      // Process each change
      console.log('Processing:', item);
    })
    .withLeaseContainer(leaseContainer)
    .build();

  await changeFeedProcessor.start();
}
```

---

## Python SDK

### 安装
```bash
pip install azure-cosmos
```

### 设置与操作
```python
# cosmos_db.py
import os
from azure.cosmos import CosmosClient, PartitionKey
from azure.cosmos.exceptions import CosmosResourceNotFoundError
from typing import Optional, List
from datetime import datetime
import uuid

# Initialize client
endpoint = os.environ['COSMOS_ENDPOINT']
key = os.environ['COSMOS_KEY']
database_name = os.environ['COSMOS_DATABASE']

client = CosmosClient(endpoint, key)
database = client.get_database_client(database_name)


def get_container(container_name: str):
    return database.get_container_client(container_name)


# CRUD Operations
users_container = get_container('users')


def create_user(email: str, name: str, user_id: str = None) -> dict:
    user_id = user_id or str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    user = {
        'id': user_id,
        'userId': user_id,  # Partition key
        'email': email,
        'name': name,
        'createdAt': now,
        'updatedAt': now
    }

    return users_container.create_item(user)


def get_user(user_id: str) -> Optional[dict]:
    try:
        return users_container.read_item(item=user_id, partition_key=user_id)
    except CosmosResourceNotFoundError:
        return None


def query_users(email_domain: str) -> List[dict]:
    query = "SELECT * FROM c WHERE CONTAINS(c.email, @domain)"
    parameters = [{'name': '@domain', 'value': email_domain}]

    return list(users_container.query_items(
        query=query,
        parameters=parameters,
        enable_cross_partition_query=True
    ))


def update_user(user_id: str, **updates) -> dict:
    user = get_user(user_id)
    if not user:
        raise ValueError('User not found')

    user.update(updates)
    user['updatedAt'] = datetime.utcnow().isoformat()

    return users_container.replace_item(item=user_id, body=user)


def delete_user(user_id: str) -> None:
    users_container.delete_item(item=user_id, partition_key=user_id)


# Paginated query
def get_users_paginated(page_size: int = 10, continuation_token: str = None):
    query = "SELECT * FROM c ORDER BY c.createdAt DESC"

    items = users_container.query_items(
        query=query,
        enable_cross_partition_query=True,
        max_item_count=page_size,
        continuation_token=continuation_token
    )

    page = items.by_page()
    results = list(next(page))

    return {
        'items': results,
        'continuation_token': page.continuation_token
    }
```

---

## 索引

### 自定义索引策略
```json
{
  "indexingMode": "consistent",
  "automatic": true,
  "includedPaths": [
    { "path": "/userId/?" },
    { "path": "/status/?" },
    { "path": "/createdAt/?" }
  ],
  "excludedPaths": [
    { "path": "/content/*" },
    { "path": "/_etag/?" }
  ],
  "compositeIndexes": [
    [
      { "path": "/userId", "order": "ascending" },
      { "path": "/createdAt", "order": "descending" }
    ]
  ]
}
```

### 创建带索引的容器
```typescript
await database.containers.createIfNotExists({
  id: 'orders',
  partitionKey: { paths: ['/userId'] },
  indexingPolicy: {
    indexingMode: 'consistent',
    includedPaths: [
      { path: '/userId/?' },
      { path: '/status/?' },
      { path: '/createdAt/?' }
    ],
    excludedPaths: [
      { path: '/*' }  // Exclude all by default
    ]
  }
});
```

---

## 吞吐量管理

### 预配吞吐量
```typescript
// Container level
await database.containers.createIfNotExists({
  id: 'orders',
  partitionKey: { paths: ['/userId'] },
  throughput: 1000  // RU/s
});

// Scale throughput
const container = database.container('orders');
await container.throughput.replace(2000);
```

### 自动缩放
```typescript
await database.containers.createIfNotExists({
  id: 'orders',
  partitionKey: { paths: ['/userId'] },
  maxThroughput: 10000  // Auto-scales 10% to 100%
});
```

### 无服务器
```typescript
// No throughput configuration needed
// Pay per request (good for dev/test, intermittent workloads)
await database.containers.createIfNotExists({
  id: 'orders',
  partitionKey: { paths: ['/userId'] }
  // No throughput = serverless
});
```

---

## CLI 快速参考

```bash
# Azure CLI
az cosmosdb create --name myaccount --resource-group mygroup
az cosmosdb sql database create --account-name myaccount --name mydb --resource-group mygroup
az cosmosdb sql container create \
  --account-name myaccount \
  --database-name mydb \
  --name orders \
  --partition-key-path /userId \
  --throughput 400

# Query
az cosmosdb sql query --account-name myaccount --database-name mydb \
  --container-name orders --query "SELECT * FROM c"

# Keys
az cosmosdb keys list --name myaccount --resource-group mygroup
az cosmosdb keys list --name myaccount --resource-group mygroup --type connection-strings
```

---

## 成本优化

| 策略 | 影响 |
|----------|--------|
| **选择合适的分区键** | 避免热分区（浪费 RU） |
| **仅为查询内容建立索引** | 降低写入 RU 成本 |
| **使用点读取** | 1 RU，而查询需要 3+ RU |
| **开发/测试使用无服务器模式** | 按请求付费 |
| **生产环境使用自动缩放** | 在低流量期间缩容 |
| **对临时数据使用 TTL** | 自动删除旧项目 |

### 生存时间（TTL）
```typescript
// Enable TTL on container
await database.containers.createIfNotExists({
  id: 'sessions',
  partitionKey: { paths: ['/userId'] },
  defaultTtl: 3600  // 1 hour
});

// Per-item TTL
const session = {
  id: 'session-123',
  userId: 'user-456',
  ttl: 1800  // Override: 30 minutes
};
```

---

## 反模式

- **糟糕的分区键** - 基数过低会导致热点分区
- **跨分区查询** - 成本高昂；应针对单分区查询进行设计
- **过度索引** - 会增加写入成本；仅为查询涉及的路径建立索引
- **大型项** - 最大为 2MB；将 Blob 存储在 Azure Blob Storage 中
- **忽略 RU 成本** - 监控并优化高成本查询
- **处处使用强一致性** - 除非确有需要，否则使用 Session（默认）
- **没有重试逻辑** - 使用指数退避处理 429（限流）
- **缺少 TTL** - 为临时数据/会话数据设置 TTL