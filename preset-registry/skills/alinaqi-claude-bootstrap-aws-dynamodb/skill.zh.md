---
name: aws-dynamodb
description: AWS DynamoDB single-table design, GSI patterns, SDK v3 TypeScript/Python
when-to-use: When working with DynamoDB tables or AWS SDK data operations
user-invocable: false
paths: ["**/dynamodb*", "**/dynamo*", "serverless.*", "template.yaml"]
effort: medium
---
# AWS DynamoDB 技能


DynamoDB 是一种完全托管的 NoSQL 数据库，旨在任何规模下提供个位数毫秒级性能。掌握单表设计和访问模式建模。

**来源：** [DynamoDB 文档](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/) | [SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/) | [最佳实践](https://aws.amazon.com/blogs/database/single-table-vs-multi-table-design-in-amazon-dynamodb/)

---

## 核心原则

**围绕访问模式而非实体进行设计。坚持访问模式优先。**

DynamoDB 要求你在设计架构之前明确查询需求。围绕数据的访问方式而非数据之间的关系进行建模。单表设计使用通用键属性将多种实体类型存储在一个表中。

---

## 核心概念

| 概念 | 描述 |
|---------|-------------|
| **分区键（PK）** | 主键属性——决定数据分布 |
| **排序键（SK）** | 可选的辅助键，用于分区内的范围查询 |
| **GSI** | 全局二级索引——备用的分区键/排序键 |
| **LSI** | 本地二级索引——分区相同，排序方式不同 |
| **项** | 单条记录（最大 400 KB） |
| **属性** | 项中的字段 |

---

## 单表设计

### 为什么使用单表？
- 通过单次查询获取相关数据
- 减少往返请求和成本
- 支持跨实体类型的事务
- 简化运维（备份、恢复、IAM）

### 通用键模式
```typescript
// Instead of entity-specific keys:
// userId, orderId, productId

// Use generic keys that work for all entities:
interface BaseItem {
  PK: string;   // Partition Key
  SK: string;   // Sort Key
  GSI1PK?: string;  // First GSI partition key
  GSI1SK?: string;  // First GSI sort key
  EntityType: string;
  // ... entity-specific attributes
}
```

### 示例：电子商务架构
```typescript
// Users
{ PK: 'USER#123', SK: 'PROFILE', EntityType: 'User', name: 'John', email: 'john@test.com' }
{ PK: 'USER#123', SK: 'ADDRESS#1', EntityType: 'Address', street: '123 Main', city: 'NYC' }

// Orders for user (1:N relationship)
{ PK: 'USER#123', SK: 'ORDER#2024-001', EntityType: 'Order', total: 99.99, status: 'shipped' }
{ PK: 'USER#123', SK: 'ORDER#2024-002', EntityType: 'Order', total: 49.99, status: 'pending' }

// Order details (query by order ID using GSI)
{ PK: 'USER#123', SK: 'ORDER#2024-001', GSI1PK: 'ORDER#2024-001', GSI1SK: 'ORDER', ... }
{ PK: 'ORDER#2024-001', SK: 'ITEM#1', GSI1PK: 'ORDER#2024-001', GSI1SK: 'ITEM#1', productId: 'PROD#456', qty: 2 }

// Products
{ PK: 'PROD#456', SK: 'PRODUCT', EntityType: 'Product', name: 'Widget', price: 29.99 }
```

### 涵盖的访问模式
```
1. Get user profile          → Query PK='USER#123', SK='PROFILE'
2. Get user with addresses   → Query PK='USER#123', SK begins_with 'ADDRESS'
3. Get all user orders       → Query PK='USER#123', SK begins_with 'ORDER'
4. Get order by ID           → Query GSI1, PK='ORDER#2024-001'
5. Get order with items      → Query GSI1, PK='ORDER#2024-001'
6. Get product details       → Query PK='PROD#456', SK='PRODUCT'
```

---

## SDK v3 设置（TypeScript）

### 安装依赖项
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

### 客户端配置
```typescript
// lib/dynamodb.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  // For local development with DynamoDB Local
  ...(process.env.DYNAMODB_LOCAL && {
    endpoint: 'http://localhost:8000',
    credentials: { accessKeyId: 'local', secretAccessKey: 'local' }
  })
});

// Document client for simplified operations
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,  // Important: match v2 behavior
    convertClassInstanceToMap: true
  },
  unmarshallOptions: {
    wrapNumbers: false
  }
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE || 'MyTable';
```

### 类型定义
```typescript
// types/dynamodb.ts
export interface BaseItem {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  EntityType: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseItem {
  EntityType: 'User';
  userId: string;
  email: string;
  name: string;
}

export interface Order extends BaseItem {
  EntityType: 'Order';
  orderId: string;
  userId: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
}

// Key builders
export const keys = {
  user: (userId: string) => ({
    PK: `USER#${userId}`,
    SK: 'PROFILE'
  }),
  userOrders: (userId: string) => ({
    PK: `USER#${userId}`,
    SKPrefix: 'ORDER#'
  }),
  order: (userId: string, orderId: string) => ({
    PK: `USER#${userId}`,
    SK: `ORDER#${orderId}`,
    GSI1PK: `ORDER#${orderId}`,
    GSI1SK: 'ORDER'
  })
};
```

---

## CRUD 操作

### 写入项目（创建/更新）
```typescript
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamodb';
import { User, keys } from './types';

async function createUser(userId: string, data: { email: string; name: string }): Promise<User> {
  const now = new Date().toISOString();
  const item: User = {
    ...keys.user(userId),
    EntityType: 'User',
    userId,
    email: data.email,
    name: data.name,
    createdAt: now,
    updatedAt: now
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)'  // Prevent overwrite
  }));

  return item;
}
```

### 获取项目（读取）
```typescript
import { GetCommand } from '@aws-sdk/lib-dynamodb';

async function getUser(userId: string): Promise<User | null> {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: keys.user(userId)
  }));

  return (result.Item as User) || null;
}
```

### 查询（列出/搜索）
```typescript
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

// Get all orders for a user
async function getUserOrders(userId: string): Promise<Order[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'ORDER#'
    },
    ScanIndexForward: false  // Newest first
  }));

  return (result.Items as Order[]) || [];
}

// Query GSI by order ID
async function getOrderById(orderId: string): Promise<Order | null> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `ORDER#${orderId}`
    }
  }));

  return (result.Items?.[0] as Order) || null;
}

// Paginated query
async function getUserOrdersPaginated(
  userId: string,
  pageSize: number = 20,
  lastKey?: Record<string, any>
): Promise<{ items: Order[]; lastKey?: Record<string, any> }> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'ORDER#'
    },
    Limit: pageSize,
    ExclusiveStartKey: lastKey
  }));

  return {
    items: (result.Items as Order[]) || [],
    lastKey: result.LastEvaluatedKey
  };
}
```

### 更新项目
```typescript
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

async function updateUser(userId: string, updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
  // Build update expression dynamically
  const updateParts: string[] = ['#updatedAt = :updatedAt'];
  const names: Record<string, string> = { '#updatedAt': 'updatedAt' };
  const values: Record<string, any> = { ':updatedAt': new Date().toISOString() };

  if (updates.name !== undefined) {
    updateParts.push('#name = :name');
    names['#name'] = 'name';
    values[':name'] = updates.name;
  }

  if (updates.email !== undefined) {
    updateParts.push('#email = :email');
    names['#email'] = 'email';
    values[':email'] = updates.email;
  }

  const result = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: keys.user(userId),
    UpdateExpression: `SET ${updateParts.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW',
    ConditionExpression: 'attribute_exists(PK)'  // Must exist
  }));

  return result.Attributes as User;
}

// Atomic counter increment
async function incrementOrderCount(userId: string): Promise<void> {
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: keys.user(userId),
    UpdateExpression: 'SET orderCount = if_not_exists(orderCount, :zero) + :inc',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':inc': 1
    }
  }));
}
```

### 删除项目
```typescript
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

async function deleteUser(userId: string): Promise<void> {
  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: keys.user(userId),
    ConditionExpression: 'attribute_exists(PK)'
  }));
}
```

---

## 批量操作

### 批量写入（最多 25 个项目）
```typescript
import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

async function batchCreateItems(items: BaseItem[]): Promise<void> {
  // DynamoDB allows max 25 items per batch
  const chunks = [];
  for (let i = 0; i < items.length; i += 25) {
    chunks.push(items.slice(i, i + 25));
  }

  for (const chunk of chunks) {
    await docClient.send(new BatchWriteCommand({
      RequestItems: {
        [TABLE_NAME]: chunk.map(item => ({
          PutRequest: { Item: item }
        }))
      }
    }));
  }
}
```

### 批量获取（最多 100 个项目）
```typescript
import { BatchGetCommand } from '@aws-sdk/lib-dynamodb';

async function batchGetUsers(userIds: string[]): Promise<User[]> {
  const result = await docClient.send(new BatchGetCommand({
    RequestItems: {
      [TABLE_NAME]: {
        Keys: userIds.map(id => keys.user(id))
      }
    }
  }));

  return (result.Responses?.[TABLE_NAME] as User[]) || [];
}
```

---

## 事务

### TransactWrite（原子化多项目操作）
```typescript
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

async function createOrderWithItems(
  userId: string,
  orderId: string,
  orderData: { total: number },
  items: { productId: string; quantity: number }[]
): Promise<void> {
  const now = new Date().toISOString();

  const transactItems = [
    // Create order
    {
      Put: {
        TableName: TABLE_NAME,
        Item: {
          ...keys.order(userId, orderId),
          EntityType: 'Order',
          orderId,
          userId,
          total: orderData.total,
          status: 'pending',
          createdAt: now,
          updatedAt: now
        },
        ConditionExpression: 'attribute_not_exists(PK)'
      }
    },
    // Update user's order count
    {
      Update: {
        TableName: TABLE_NAME,
        Key: keys.user(userId),
        UpdateExpression: 'SET orderCount = if_not_exists(orderCount, :zero) + :inc',
        ExpressionAttributeValues: { ':zero': 0, ':inc': 1 }
      }
    },
    // Add order items
    ...items.map((item, index) => ({
      Put: {
        TableName: TABLE_NAME,
        Item: {
          PK: `ORDER#${orderId}`,
          SK: `ITEM#${index}`,
          GSI1PK: `ORDER#${orderId}`,
          GSI1SK: `ITEM#${index}`,
          EntityType: 'OrderItem',
          productId: item.productId,
          quantity: item.quantity,
          createdAt: now
        }
      }
    }))
  ];

  await docClient.send(new TransactWriteCommand({
    TransactItems: transactItems
  }));
}
```

---

## GSI 模式

### 稀疏索引
```typescript
// Only items with GSI1PK attribute appear in the index
// Useful for "featured" or "flagged" items

// Featured products (only some products have GSI1PK)
{ PK: 'PROD#1', SK: 'PRODUCT', GSI1PK: 'FEATURED', GSI1SK: 'PROD#1', ... }  // In index
{ PK: 'PROD#2', SK: 'PRODUCT', ... }  // Not in index (no GSI1PK)

// Query featured products
const featured = await docClient.send(new QueryCommand({
  TableName: TABLE_NAME,
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :pk',
  ExpressionAttributeValues: { ':pk': 'FEATURED' }
}));
```

### 倒排索引（GSI）
```typescript
// Main table: User -> Orders (PK=USER#, SK=ORDER#)
// GSI: Orders by status (GSI1PK=STATUS#, GSI1SK=ORDER#)

{ PK: 'USER#123', SK: 'ORDER#001', GSI1PK: 'STATUS#pending', GSI1SK: 'ORDER#001', ... }
{ PK: 'USER#456', SK: 'ORDER#002', GSI1PK: 'STATUS#shipped', GSI1SK: 'ORDER#002', ... }

// Get all pending orders across all users
const pending = await docClient.send(new QueryCommand({
  TableName: TABLE_NAME,
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :pk',
  ExpressionAttributeValues: { ':pk': 'STATUS#pending' }
}));
```

### 多属性复合键（2025 年 11 月起）
```typescript
// New feature: Up to 4 attributes per partition/sort key
// No more synthetic keys like "TOURNAMENT#WINTER2024#REGION#NA-EAST"

// Table definition (IaC)
const table = {
  AttributeDefinitions: [
    { AttributeName: 'tournament', AttributeType: 'S' },
    { AttributeName: 'region', AttributeType: 'S' },
    { AttributeName: 'score', AttributeType: 'N' }
  ],
  GlobalSecondaryIndexes: [{
    IndexName: 'TournamentRegionIndex',
    KeySchema: [
      { AttributeName: 'tournament', KeyType: 'HASH' },  // Composite PK part 1
      { AttributeName: 'region', KeyType: 'HASH' },      // Composite PK part 2
      { AttributeName: 'score', KeyType: 'RANGE' }
    ]
  }]
};
```

---

## Python（boto3）

### 设置
```python
# requirements.txt
boto3>=1.34.0

# db.py
import boto3
from boto3.dynamodb.conditions import Key, Attr
import os

dynamodb = boto3.resource(
    'dynamodb',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    endpoint_url=os.getenv('DYNAMODB_LOCAL_ENDPOINT')  # For local dev
)

table = dynamodb.Table(os.getenv('DYNAMODB_TABLE', 'MyTable'))
```

### 操作
```python
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

def create_user(user_id: str, email: str, name: str) -> dict:
    now = datetime.utcnow().isoformat()
    item = {
        'PK': f'USER#{user_id}',
        'SK': 'PROFILE',
        'EntityType': 'User',
        'userId': user_id,
        'email': email,
        'name': name,
        'createdAt': now,
        'updatedAt': now
    }

    table.put_item(
        Item=item,
        ConditionExpression='attribute_not_exists(PK)'
    )
    return item


def get_user(user_id: str) -> Optional[dict]:
    response = table.get_item(
        Key={'PK': f'USER#{user_id}', 'SK': 'PROFILE'}
    )
    return response.get('Item')


def get_user_orders(user_id: str) -> List[dict]:
    response = table.query(
        KeyConditionExpression=Key('PK').eq(f'USER#{user_id}') & Key('SK').begins_with('ORDER#'),
        ScanIndexForward=False
    )
    return response.get('Items', [])


def update_user(user_id: str, **updates) -> dict:
    update_parts = ['#updatedAt = :updatedAt']
    names = {'#updatedAt': 'updatedAt'}
    values = {':updatedAt': datetime.utcnow().isoformat()}

    for key, value in updates.items():
        update_parts.append(f'#{key} = :{key}')
        names[f'#{key}'] = key
        values[f':{key}'] = value

    response = table.update_item(
        Key={'PK': f'USER#{user_id}', 'SK': 'PROFILE'},
        UpdateExpression=f'SET {", ".join(update_parts)}',
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
        ReturnValues='ALL_NEW'
    )
    return response['Attributes']


def delete_user(user_id: str) -> None:
    table.delete_item(
        Key={'PK': f'USER#{user_id}', 'SK': 'PROFILE'}
    )
```

---

## 本地开发

### DynamoDB Local
```bash
# Docker
docker run -d -p 8000:8000 amazon/dynamodb-local

# Create table locally
aws dynamodb create-table \
  --endpoint-url http://localhost:8000 \
  --table-name MyTable \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    'IndexName=GSI1,KeySchema=[{AttributeName=GSI1PK,KeyType=HASH},{AttributeName=GSI1SK,KeyType=RANGE}],Projection={ProjectionType=ALL}' \
  --billing-mode PAY_PER_REQUEST
```

### NoSQL Workbench
AWS 提供了 [NoSQL Workbench](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.html)，用于可视化数据建模和查询。

---

## CLI 快速参考

```bash
# Table operations
aws dynamodb create-table --cli-input-json file://table.json
aws dynamodb describe-table --table-name MyTable
aws dynamodb delete-table --table-name MyTable

# Item operations
aws dynamodb put-item --table-name MyTable --item '{"PK":{"S":"USER#1"},"SK":{"S":"PROFILE"}}'
aws dynamodb get-item --table-name MyTable --key '{"PK":{"S":"USER#1"},"SK":{"S":"PROFILE"}}'
aws dynamodb delete-item --table-name MyTable --key '{"PK":{"S":"USER#1"},"SK":{"S":"PROFILE"}}'

# Query
aws dynamodb query --table-name MyTable \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{":pk":{"S":"USER#1"}}'

# Scan (avoid in production)
aws dynamodb scan --table-name MyTable --limit 10
```

---

## 反模式

- **扫描操作** - 始终使用带有适当键条件的 Query
- **热分区** - 使用高基数分区键来分散写入
- **大型项目** - 将项目大小控制在 400KB 以下；大型数据应使用 S3
- **GSI 过多** - 每个 GSI 都会复制数据；请谨慎设计
- **忽略容量** - 监控已消耗容量，对于可变负载使用按需模式
- **没有条件表达式** - 始终使用 ConditionExpression 进行验证
- **获取所有属性** - 使用 ProjectionExpression 限制数据
- **无理由采用多表设计** - 除非访问模式不重叠，否则首选单表设计