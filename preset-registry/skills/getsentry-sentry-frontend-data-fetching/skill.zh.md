---
name: frontend-data-fetching
description: Fetch data in Sentry's frontend with TanStack Query and apiOptions. Use when adding or editing React code in static/ that calls the API — useQuery/useMutation/useInfiniteQuery, apiOptions, queryOptions/mutationOptions, fetchMutation, reading response headers/pagination, or conditional fetching. Trigger on "fetch data", "add an API call", "useQuery", "useMutation", "apiOptions", "queryFn", "pagination headers", "X-Hits", or "why is my query type wrong".
---
# 前端数据获取（TanStack Query + apiOptions）

将 `apiOptions` 与 TanStack Query 的 `useQuery` 配合使用。**不要使用 `useApiQuery`、`getApiQueryData` 或 `setApiQueryData`**——它们已被弃用。

```typescript
import {skipToken, useQuery} from '@tanstack/react-query';
import {apiOptions} from 'sentry/utils/api/apiOptions';

// Basic usage
const query = useQuery(
  apiOptions.as<ResponseType>()('/organizations/$organizationIdOrSlug/endpoint/', {
    path: {organizationIdOrSlug: organization.slug},
    staleTime: 30_000,
  })
);

// Conditional fetching — pass skipToken as path to disable the query
const query = useQuery(
  apiOptions.as<ResponseType>()('/organizations/$organizationIdOrSlug/items/$itemId/', {
    path: itemId ? {organizationIdOrSlug: organization.slug, itemId} : skipToken,
    staleTime: 30_000,
  })
);
```

关键规则：

- **必须指定 `staleTime`**——你必须选择一个值（`0`、以毫秒为单位的数字、`Infinity` 或 `'static'`）。
- **基于 `apiOptions` 构建抽象层**，而不是基于 `useQuery`。返回 options 对象，以便使用者可以将其传给 `useQuery`、`useQueries`、`prefetchQuery` 等。
- **缓存存储的是 `{json, headers}`**，而不仅仅是响应体。默认情况下，`apiOptions` 使用 `select` 提取 `.json`，但 `getQueryData`、`setQueryData`、`retry` 函数和 `predicate` 回调接收到的都是原始的 `ApiResponse<T>` 结构。
- **绝不要**对 Query 使用 `api.requestPromise`——它返回的结构不正确。如果必须手动编写 `queryFn`，请使用 `apiFetch`。

## TanStack Query 类型推断——绝不要在调用处传递泛型

**至关重要**：绝不要在调用处向 `useQuery`、`useMutation`、`mutationOptions`、`queryOptions` 或任何 TanStack Query 函数传递类型参数。让 TypeScript 根据你的 `queryFn`/`mutationFn` 和回调推断类型。在调用处传递泛型会破坏类型推断、掩盖 bug，并增加维护负担。

```typescript
// ❌ NEVER pass generics to useQuery, useMutation, mutationOptions, etc.
useMutation<ResponseType, RequestError, Variables, Context>({...})
mutationOptions<ResponseType, RequestError, Variables, Context>({...})
useQuery<ResponseType, RequestError>({...})

// ✅ Let types be inferred — annotate the mutationFn/queryFn instead
useMutation({
  mutationFn: (variables: MyVariables) =>
    fetchMutation<MyResponse>({...}),
})
```

具体规则：

1. **为 `mutationFn` 的参数指定类型**，而不是为 hook/函数的泛型指定类型。变量类型会从 `mutationFn` 的签名中传递。
2. **使用 `fetchMutation<T>`** 指定返回值类型——在 `fetchMutation` 上使用泛型是正确的，因为它用于指定 API 响应的类型。
3. **绝不要将错误泛型显式指定为 `RequestError`**——这相当于一种隐蔽的类型断言。默认情况下，错误类型是 `Error`。当你需要访问 `RequestError` 特有的属性时，请使用运行时类型收窄（`if (error instanceof RequestError)`）。
4. **绝不要显式指定上下文类型**——它会根据 `onMutate` 的返回值进行推断。创建单独的 `type FooContext = {...}` 并将其作为泛型传递是没有必要的。
5. **同一规则也适用于查询**——`useQuery`、`queryOptions`、`useInfiniteQuery` 等。类型会从 `queryFn` 和 `select` 中传递。

```typescript
// ❌ Explicit context type + error assertion
type MyContext = {previousData: Item[]};

mutationOptions<Item, RequestError, UpdateItemVars, MyContext>({
  mutationFn: variables => fetchMutation({...}),
  onMutate: async () => {
    const previousData = queryClient.getQueryData(itemQueryOptions);
    return {previousData};
  },
  onError: (_error, _variables, context) => {
    queryClient.setQueryData(key, context?.previousData);
  },
})

// ✅ Everything is inferred
mutationOptions({
  mutationFn: (variables: UpdateItemVars) =>
    fetchMutation<Item>({...}),
  onMutate: async () => {
    const previousData = queryClient.getQueryData(itemQueryOptions);
    return {previousData};
  },
  onError: (_error, _variables, context) => {
    // context type is inferred from onMutate return
    queryClient.setQueryData(key, context?.previousData);
  },
})
```

## 访问响应标头（分页、命中数）

默认情况下，`apiOptions` 仅从响应中选择 JSON 正文。如果需要响应标头（例如用于分页的 `Link`，或用于总数统计的 `X-Hits` / `X-Max-Hits`），请使用 `selectJsonWithHeaders` 覆盖 `select`：

```typescript
import {useQuery} from '@tanstack/react-query';
import {apiOptions, selectJsonWithHeaders} from 'sentry/utils/api/apiOptions';

const {data} = useQuery({
  ...apiOptions.as<Item[]>()('/organizations/$organizationIdOrSlug/items/', {
    path: {organizationIdOrSlug: organization.slug},
    query: {cursor, per_page: 25},
    staleTime: 0,
  }),
  select: selectJsonWithHeaders,
});

// data is ApiResponse<Item[]> — an object with `json` and `headers`
const items = data?.json ?? [];
const pageLinks = data?.headers.Link; // string | undefined
const totalHits = data?.headers['X-Hits']; // number | undefined
const maxHits = data?.headers['X-Max-Hits']; // number | undefined
```

请注意，`X-Hits` 和 `X-Max-Hits` 已被解析为 `number | undefined`，无需使用 `parseInt`。