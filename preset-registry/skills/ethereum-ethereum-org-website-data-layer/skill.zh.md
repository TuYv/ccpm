---
name: data-layer
description: This skill provides patterns for working with the data-layer module. Use when creating/editing files in src/data-layer/, src/lib/data/, or adding new data sources.
---
# 数据层

## 架构

```
src/data-layer/
├── fetchers/         # Fetch functions (one per data source)
│   └── developer-tools/  # Multi-file fetcher (builder resources, GitHub/npm stats, ranking)
├── index.ts          # Public API - typed getter functions
├── tasks.ts          # KEYS constant + Trigger.dev scheduled tasks
├── storage.ts        # get/set abstraction (Netlify Blobs or mock files)
├── s3.ts             # S3 image upload utility for external images
├── docs.md           # Module documentation
├── mocks/            # Mock data files for local development
└── .env.example      # Environment variables for data-layer/Trigger.dev

src/lib/data/
└── index.ts          # Next.js caching adapter (createCachedGetter)
```

## 环境变量

数据层使用位于 `src/data-layer/.env.local` 的**专用 `.env.local`**，与根目录下的 `.env.local` 分开：执行 `cp src/data-layer/.env.example src/data-layer/.env.local`，填写各项密钥（所有选项请参见 `.env.example`），然后运行 `pnpm trigger:dev` 在本地执行任务。`GITHUB_TOKEN_READ_ONLY` 和 Sentry 变量与主应用共享（需在两个文件中配置）；其他所有内容（API 密钥、Netlify Blobs 令牌、S3 凭据、Trigger.dev 配置）仅供数据层使用。在生产环境中，请在 Trigger.dev 项目控制面板中配置变量——应用和数据层运行在相互独立的环境中。

## 关键文件

`tasks.ts` 定义了 `KEYS` 常量以及 `WEEKLY`/`DAILY`/`HOURLY` 任务元组；`index.ts` 包含单行 getter——两者的示例请参见下方的“添加新的数据源”。

### storage.ts - 存储抽象

`get<T>(key)` / `set(key, data)` 会在 Netlify Blobs（生产环境）和本地 mock JSON 文件之间切换（本地开发时使用 `USE_MOCK_DATA=true`）。

### s3.ts - 图片上传工具

用于上传外部图片的集中式 S3 上传工具。Fetcher 使用此工具将外部图片上传到单个 S3 bucket，从而降低 Next.js `remotePatterns` 的复杂度。

```typescript
// Upload single image
const s3Url = await uploadToS3(sourceUrl, "events/logos")

// Batch upload (parallel)
const s3Urls = await uploadManyToS3(urls, "apps/banners")
```

主要特性：

- **SSRF 防护** - 阻止私有/内部网络地址
- **去重** - 使用源 URL 的 SHA256 哈希作为 key
- **存在性检查** - 如果已上传则跳过
- **5MB 大小限制** - 对于较大的图片返回 `null`
- **Content-Type 检测** - 从 header 获取，或回退到 URL 扩展名

## 规则

### 1. Getter 必须是纯透传

`index.ts` 中不得进行转换——只使用 `get<T>(KEYS.X)`：

```typescript
// Correct
export const getEventsData = () => get<EventItem[]>(KEYS.EVENTS)

// Wrong - no transformations in getters
export const getEventsData = () => {
  const data = await get<EventItem[]>(KEYS.EVENTS)
  return data?.map(transform) ?? null
}
```

所有转换都应放在 fetcher 中（`src/data-layer/fetchers/`）。

### 2. KEYS 是唯一事实来源

所有任务 ID 都在 `tasks.ts` 的 `KEYS` 中定义。`index.ts` 中的 getter 以及 `WEEKLY`/`DAILY`/`HOURLY` 中的任务元组必须使用相同的 key。

### 3. 通过 lib/data 暴露以进行缓存

在 `src/lib/data/index.ts` 中添加缓存包装器：

```typescript
export const getEventsData = createCachedGetter(
  dataLayer.getEventsData,
  ["events-data"],
  CACHE_REVALIDATE_DAY // or CACHE_REVALIDATE_HOUR
)
```

`revalidate` 参数的类型为 `number | false`。传入 `false` 是一种有意采用的模式，用于使路由保持完全静态——有限的重新验证时间会使页面启用 ISR，而对于读取 `public/content/` 文件的页面，这在 Netlify 上会失败。示例：`src/lib/data/index.ts` 中的 `getStaticAppsData`，它由嵌入 MDX 页面的组件使用（数据仅在部署时刷新）。

### 4. 使用 S3 存储外部图片

应在 fetcher 中将外部图片上传到 S3，以集中管理图片域名：

```typescript
// In fetcher - correct
import { uploadToS3 } from "../s3"

const logoUrl = await uploadToS3(event.logoImage, "events/logos")
return { ...event, logoImage: logoUrl ?? "" }
```

始终处理 `null` 返回值（上传失败），并使用回退值/空字符串。

### 5. 使 fetcher 与应用保持隔离

Fetcher 运行在 Trigger.dev 上——其运行时、部署环境和 bundle 均与 Next.js 应用分离。不能假定应用的文件系统、环境或模块可用。

任何超出 `src/data-layer/` 范围的 import 或运行时依赖都是一个警示信号。允许使用：类型（`@/lib/types`、`@/lib/interfaces`）、纯常量（`@/lib/constants`）以及不依赖应用运行时的纯工具函数。不允许使用：任何读取 `process.cwd()` 的内容、来自 `app/` 或 `public/` 的任何内容、来自 `src/components/` 的任何内容，或来自 `src/lib/data/` 的任何内容（该目录包装了 data layer，会造成循环依赖）。

如果 fetcher 需要应用中的数据——内容文件、frontmatter 等——请通过 GitHub API 经网络获取，并将仓库视为外部系统。请参阅 `fetchGitHubContributors.ts` 中的模式。不要使用 `trigger.config.ts` 中的 `additionalFiles` 规避这一限制；将应用文件打包进 data-layer 部署会重新产生这种耦合。

## 添加新的数据源

1. **在 `src/data-layer/fetchers/fetchNewData.ts` 中创建 fetcher**：

   ```typescript
   export async function fetchNewData(): Promise<YourDataType> {
     // Fetch and transform data here
   }
   ```

2. **在 `src/data-layer/tasks.ts` 的 `KEYS` 中添加 key**：

   ```typescript
   export const KEYS = {
     // ...existing keys
     NEW_DATA: "fetch-new-data",
   } as const
   ```

3. **将 task tuple 添加到 `tasks.ts` 中的 `WEEKLY`、`DAILY` 或 `HOURLY`**（getter 和 tuple 必须使用相同的 `KEYS` 条目——规则 2）：

   ```typescript
   const DAILY: TaskDef[] = [
     // ...existing tasks
     [KEYS.NEW_DATA, fetchNewData],
   ]
   ```

4. **在 `src/data-layer/index.ts` 中添加 getter**：

   ```typescript
   export const getNewData = () => get<YourDataType>(KEYS.NEW_DATA)
   ```

5. **在 `src/data-layer/mocks/fetch-new-data.json` 中添加 mock 文件**（当 `USE_MOCK_DATA=true` 时读取）

6. **在 `src/lib/data/index.ts` 中添加缓存包装器**：
   ```typescript
   export const getNewData = createCachedGetter(
     dataLayer.getNewData,
     ["new-data"],
     CACHE_REVALIDATE_HOUR
   )
   ```