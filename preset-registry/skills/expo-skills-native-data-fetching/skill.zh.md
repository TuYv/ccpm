---
name: native-data-fetching
description: Use when implementing or debugging ANY network request, API call, or data fetching. Covers fetch API, React Query, SWR, error handling, caching, offline support, and Expo Router data loaders (`useLoaderData`).
version: 1.0.0
license: MIT
---
# Expo 网络功能

**任何网络相关工作，包括 API 请求、数据获取、缓存或网络调试，你都必须使用此技能。**

## 参考资料

根据需要查阅以下资源：

```
references/
  expo-router-loaders.md   Route-level data loading with Expo Router loaders (web, SDK 55+)
```

## 使用场景

在以下情况下使用此技能：

- 实现 API 请求
- 设置数据获取（React Query、SWR）
- 使用 Expo Router 数据加载器（`useLoaderData`，Web SDK 55+）
- 调试网络故障
- 实现缓存策略
- 处理离线场景
- 身份验证/令牌管理
- 配置 API URL 和环境变量

## 偏好

- 避免使用 axios，优先使用 expo/fetch

## 常见问题与解决方案

### 1. Fetch 基本用法

**简单的 GET 请求**：

```tsx
const fetchUser = async (userId: string) => {
  const response = await fetch(`https://api.example.com/users/${userId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
```

**带请求体的 POST 请求**：

```tsx
const createUser = async (userData: UserData) => {
  const response = await fetch("https://api.example.com/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
```

---

### 2. React Query（TanStack Query）

**设置**：

```tsx
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

**获取数据**：

```tsx
import { useQuery } from "@tanstack/react-query";

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <Profile user={data} />;
}
```

**数据变更**：

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleSubmit = (data: UserData) => {
    mutation.mutate(data);
  };

  return <Form onSubmit={handleSubmit} isLoading={mutation.isPending} />;
}
```

---

### 3. 错误处理

**全面的错误处理**：

```tsx
class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || "Request failed",
        response.status,
        error.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error (no internet, timeout, etc.)
    throw new ApiError("Network error", 0, "NETWORK_ERROR");
  }
};
```

**重试逻辑**：

```tsx
const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retries = 3
) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithErrorHandling(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      // Exponential backoff
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
};
```

---

### 4. 身份验证

**令牌管理**：

```tsx
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export const auth = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  removeToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

// Authenticated fetch wrapper
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = await auth.getToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};
```

**令牌刷新**：

```tsx
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const getValidToken = async (): Promise<string> => {
  const token = await auth.getToken();

  if (!token || isTokenExpired(token)) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }
    return refreshPromise!;
  }

  return token;
};
```

---

### 5. 离线支持

**检查网络状态**：

```tsx
import NetInfo from "@react-native-community/netinfo";

// Hook for network status
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
  }, []);

  return isOnline;
}
```

**使用 React Query 实现离线优先**：

```tsx
import { onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// Sync React Query with network status
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(state.isConnected ?? true);
  });
});

// Queries will pause when offline and resume when online
```

---

### 6. 环境变量

**使用环境变量进行 API 配置**：

Expo 支持带有 `EXPO_PUBLIC_` 前缀的环境变量。这些变量会在构建时内联，并可在 JavaScript 代码中使用。

```tsx
// .env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_API_VERSION=v1

// Usage in code
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/users`);
  return response.json();
};
```

**特定于环境的配置**：

```tsx
// .env.development
EXPO_PUBLIC_API_URL=http://localhost:3000

// .env.production
EXPO_PUBLIC_API_URL=https://api.production.com
```

**使用环境配置创建 API 客户端**：

```tsx
// api/client.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined");
}

export const apiClient = {
  get: async <T,>(path: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  post: async <T,>(path: string, body: unknown): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};
```

**重要说明**：

- 只有以 `EXPO_PUBLIC_` 为前缀的变量才会暴露给客户端 bundle
- 切勿将密钥（具有写入权限的 API 密钥、数据库密码）放入 `EXPO_PUBLIC_` 变量中——它们在构建后的应用中可见
- 环境变量在**构建时**内联，而不是运行时
- 更改 `.env` 文件后，请重启开发服务器
- 对于 API 路由中的服务端密钥，请使用不带 `EXPO_PUBLIC_` 前缀的变量

**TypeScript 支持**：

```tsx
// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_VERSION?: string;
    }
  }
}

export {};
```

---

### 7. 请求取消

**卸载时取消**：

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then((response) => response.json())
    .then(setData)
    .catch((error) => {
      if (error.name !== "AbortError") {
        setError(error);
      }
    });

  return () => controller.abort();
}, [url]);
```

**使用 React Query**（自动）：

```tsx
// React Query automatically cancels requests when queries are invalidated
// or components unmount
```

---

## 决策树

```
User asks about networking
  |-- Route-level data loading (web, SDK 55+)?
  |   \-- Expo Router loaders — see references/expo-router-loaders.md
  |
  |-- Basic fetch?
  |   \-- Use fetch API with error handling
  |
  |-- Need caching/state management?
  |   |-- Complex app -> React Query (TanStack Query)
  |   \-- Simpler needs -> SWR or custom hooks
  |
  |-- Authentication?
  |   |-- Token storage -> expo-secure-store
  |   \-- Token refresh -> Implement refresh flow
  |
  |-- Error handling?
  |   |-- Network errors -> Check connectivity first
  |   |-- HTTP errors -> Parse response, throw typed errors
  |   \-- Retries -> Exponential backoff
  |
  |-- Offline support?
  |   |-- Check status -> NetInfo
  |   \-- Queue requests -> React Query persistence
  |
  |-- Environment/API config?
  |   |-- Client-side URLs -> EXPO_PUBLIC_ prefix in .env
  |   |-- Server secrets -> Non-prefixed env vars (API routes only)
  |   \-- Multiple environments -> .env.development, .env.production
  |
  \-- Performance?
      |-- Caching -> React Query with staleTime
      |-- Deduplication -> React Query handles this
      \-- Cancellation -> AbortController or React Query
```

## 常见错误

**错误：没有错误处理**

```tsx
const data = await fetch(url).then((r) => r.json());
```

**正确：检查响应状态**

```tsx
const response = await fetch(url);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
```

**错误：将令牌存储在 AsyncStorage 中**

```tsx
await AsyncStorage.setItem("token", token); // Not secure!
```

**正确：使用 SecureStore 存储敏感数据**

```tsx
await SecureStore.setItemAsync("token", token);
```

## 调用示例

用户：“如何在 React Native 中发起 API 调用？”
-> 使用 fetch，并添加错误处理

用户：“我应该使用 React Query 还是 SWR？”
-> 复杂应用使用 React Query，需求较简单时使用 SWR

用户：“我的应用需要支持离线运行”
-> 使用 NetInfo 获取状态，使用 React Query 持久化实现缓存

用户：“如何处理身份验证令牌？”
-> 存储在 expo-secure-store 中，并实现刷新流程

用户：“API 调用速度很慢”
-> 检查缓存策略，使用 React Query 的 staleTime
用户：“如何为开发环境和生产环境配置不同的 API URL？”
-> 在 .env.development 和 .env.production 文件中使用 EXPO*PUBLIC* 环境变量
用户：“我的 API key 应该放在哪里？”
-> 客户端安全的 key：在 .env 中使用 EXPO*PUBLIC*。机密 key：仅在 API routes 中使用不带前缀的环境变量

用户：“如何在 Expo Router 中为页面加载数据？”
-> 有关路由级 loader（Web、SDK 55+），请参阅 references/expo-router-loaders.md。对于原生端，请使用 React Query 或 fetch。