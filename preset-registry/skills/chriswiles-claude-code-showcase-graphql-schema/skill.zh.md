---
name: graphql-schema
description: GraphQL queries, mutations, and code generation patterns. Use when creating GraphQL operations, working with Apollo Client, or generating types.
---
# GraphQL Schema 模式

## 核心规则

1. **绝不要内联 `gql` 字面量** - 创建 `.gql` 文件
2. **创建或修改 `.gql` 文件后始终运行 codegen**
3. **始终为 mutation 添加 `onError` 处理程序**
4. **使用生成的 hooks** - 绝不要编写原始 Apollo hooks

## 文件结构

```
src/
├── components/
│   └── ItemList/
│       ├── ItemList.tsx
│       ├── GetItems.gql           # Query definition
│       └── GetItems.generated.ts  # Auto-generated (don't edit)
└── graphql/
    └── mutations/
        └── CreateItem.gql         # Shared mutations
```

## 创建 Query

### 第 1 步：创建 .gql 文件

```graphql
# src/components/ItemList/GetItems.gql
query GetItems($limit: Int, $offset: Int) {
  items(limit: $limit, offset: $offset) {
    id
    name
    description
    createdAt
  }
}
```

### 第 2 步：运行 codegen

```bash
npm run gql:typegen
```

### 第 3 步：导入并使用生成的 hook

```typescript
import { useGetItemsQuery } from './GetItems.generated';

const ItemList = () => {
  const { data, loading, error, refetch } = useGetItemsQuery({
    variables: { limit: 20, offset: 0 },
  });

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (loading && !data) return <LoadingSkeleton />;
  if (!data?.items.length) return <EmptyState />;

  return <List items={data.items} />;
};
```

## 创建 Mutation

### 第 1 步：创建 .gql 文件

```graphql
# src/graphql/mutations/CreateItem.gql
mutation CreateItem($input: CreateItemInput!) {
  createItem(input: $input) {
    id
    name
    description
  }
}
```

### 第 2 步：运行 codegen

```bash
npm run gql:typegen
```

### 第 3 步：使用时必须进行错误处理

```typescript
import { useCreateItemMutation } from 'graphql/mutations/CreateItem.generated';

const CreateItemForm = () => {
  const [createItem, { loading }] = useCreateItemMutation({
    // Success handling
    onCompleted: (data) => {
      toast.success({ title: 'Item created' });
      navigation.goBack();
    },
    // ERROR HANDLING IS REQUIRED
    onError: (error) => {
      console.error('createItem failed:', error);
      toast.error({ title: 'Failed to create item' });
    },
    // Cache update
    update: (cache, { data }) => {
      if (data?.createItem) {
        cache.modify({
          fields: {
            items: (existing = []) => [...existing, data.createItem],
          },
        });
      }
    },
  });

  return (
    <Button
      onPress={() => createItem({ variables: { input: formValues } })}
      isDisabled={!isValid || loading}
      isLoading={loading}
    >
      Create
    </Button>
  );
};
```

## Mutation UI 要求

**关键：每个 mutation 触发器都必须：**

1. **在 mutation 执行期间禁用** - 防止重复点击
2. **显示加载状态** - 提供视觉反馈
3. **具有 onError 处理程序** - 让用户知道操作失败
4. **显示成功反馈** - 让用户知道操作成功

```typescript
// CORRECT - Complete mutation pattern
const [submit, { loading }] = useSubmitMutation({
  onError: (error) => {
    console.error('submit failed:', error);
    toast.error({ title: 'Save failed' });
  },
  onCompleted: () => {
    toast.success({ title: 'Saved' });
  },
});

<Button
  onPress={handleSubmit}
  isDisabled={!isValid || loading}
  isLoading={loading}
>
  Submit
</Button>
```

## 查询选项

### 获取策略

| 策略 | 适用场景 |
|--------|----------|
| `cache-first` | 数据很少变化 |
| `cache-and-network` | 希望快速响应且保持数据最新（默认） |
| `network-only` | 始终需要最新数据 |
| `no-cache` | 从不缓存（很少使用） |

### 常用选项

```typescript
useGetItemsQuery({
  variables: { id: itemId },

  // Fetch strategy
  fetchPolicy: 'cache-and-network',

  // Re-render on network status changes
  notifyOnNetworkStatusChange: true,

  // Skip if condition not met
  skip: !itemId,

  // Poll for updates
  pollInterval: 30000,
});
```

## 乐观更新

用于提供即时的 UI 反馈：

```typescript
const [toggleFavorite] = useToggleFavoriteMutation({
  optimisticResponse: {
    toggleFavorite: {
      __typename: 'Item',
      id: itemId,
      isFavorite: !currentState,
    },
  },
  onError: (error) => {
    // Rollback happens automatically
    console.error('toggleFavorite failed:', error);
    toast.error({ title: 'Failed to update' });
  },
});
```

### 不应使用乐观更新的情况

- 可能无法通过验证的操作
- 包含服务器生成值的操作
- 破坏性操作（删除）
- 会影响其他用户的操作

## 片段

用于复用字段选择：

```graphql
# src/graphql/fragments/ItemFields.gql
fragment ItemFields on Item {
  id
  name
  description
  createdAt
  updatedAt
}
```

在查询中使用：

```graphql
query GetItems {
  items {
    ...ItemFields
  }
}
```

## 反模式

```typescript
// WRONG - Inline gql
const GET_ITEMS = gql`
  query GetItems { items { id } }
`;

// CORRECT - Use .gql file + generated hook
import { useGetItemsQuery } from './GetItems.generated';


// WRONG - No error handler
const [mutate] = useMutation(MUTATION);

// CORRECT - Always handle errors
const [mutate] = useMutation(MUTATION, {
  onError: (error) => {
    console.error('mutation failed:', error);
    toast.error({ title: 'Operation failed' });
  },
});


// WRONG - Button not disabled during mutation
<Button onPress={submit}>Submit</Button>

// CORRECT - Disabled and loading
<Button onPress={submit} isDisabled={loading} isLoading={loading}>
  Submit
</Button>
```

## 代码生成命令

```bash
# Generate types from .gql files
npm run gql:typegen

# Download schema + generate types
npm run sync-types
```

## 与其他技能的集成

- **react-ui-patterns**：查询的加载、错误和空状态
- **testing-patterns**：在测试中模拟生成的钩子
- **formik-patterns**：变更提交模式