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

数据层使用位于 `src/data-layer/.env.local` 的**专用 `.env.local` 文件**，与主应用根目录中的 `.env.local` 相互独立。

### 本地开发设置

1. 复制示例文件：

   ```bash
   cp src/data-layer/.env.example src/data-layer/.env.local
   ```

2. 填写所需的 API 密钥（所有选项请参阅 `.env.example`）

3. 在本地运行 Trigger.dev 任务：
   ```bash
   pnpm trigger:dev
   ```

### 变量类别

- **与主应用共享**：`GITHUB_TOKEN_READ_ONLY`、Sentry 变量（需在两个文件中配置）
- **仅供数据层使用**：API 密钥（CoinGecko、Beaconcha.in、Dune、Google 等）、Netlify Blobs 令牌、S3 凭据、Trigger.dev 配置

### 生产环境（Trigger.dev Cloud）

在 Trigger.dev 项目仪表板中配置环境变量。主应用与数据层在不同的环境中运行。

## 关键文件

### tasks.ts - 唯一事实来源

定义所有任务键和定时作业：

```typescript
export const KEYS = {
  ETH_PRICE: "fetch-eth-price",
  L2BEAT: "fetch-l2beat",
  // ...
} as const

const WEEKLY: TaskDef[] = [[KEYS.GITHUB_CONTRIBUTORS, fetchGitHubContributors]]

const DAILY: TaskDef[] = [
  [KEYS.APPS, fetchApps],
  [KEYS.EVENTS, fetchEvents],
]

const HOURLY: TaskDef[] = [
  [KEYS.ETH_PRICE, fetchEthPrice],
  [KEYS.TOTAL_ETH_STAKED, fetchTotalEthStaked],
]
```

### index.ts - 简单的 Getter 函数

单行透传函数：

```typescript
export const getEthPrice = () => get<EthPriceData>(KEYS.ETH_PRICE)
export const getL2beatData = () => get<L2beatData>(KEYS.L2BEAT)
```

### storage.ts - 存储抽象

简单的 get/set，会在 Netlify Blobs（生产环境）和本地 JSON 文件（开发环境）之间切换：

```typescript
export async function get<T>(key: string): Promise<T | null>
export async function set(key: string, data: unknown): Promise<void>
```

本地开发使用 `USE_MOCK_DATA=true` 环境变量。

### s3.ts - 图片上传工具

用于外部图片的集中式 S3 上传工具。Fetcher 使用它将外部图片上传至同一个 S3 存储桶，从而降低 Next.js `remotePatterns` 的复杂性。

```typescript
// Upload single image
const s3Url = await uploadToS3(sourceUrl, "events/logos")

// Batch upload (parallel)
const s3Urls = await uploadManyToS3(urls, "apps/banners")
```

主要特性：

- **SSRF 防护** - 阻止访问私有/内部网络地址
- **去重** - 使用源 URL 的 SHA256 哈希作为键
- **存在性检查** - 如果已上传，则跳过
- **5MB 大小限制** - 对于过大的图片返回 `null`
- **Content-Type 检测** - 从响应头获取，或回退到根据 URL 扩展名判断

## 规则

### 1. Getter 必须是纯透传

不要在 `index.ts` 中进行转换——只需调用 `get<T>(KEYS.X)`：

```typescript
// Correct
export const getEventsData = () => get<EventItem[]>(KEYS.EVENTS)

// Wrong - no transformations in getters
export const getEventsData = () => {
  const data = await get<EventItem[]>(KEYS.EVENTS)
  return data?.map(transform) ?? null
}
```

所有转换都应放在 fetcher（`src/data-layer/fetchers/`）中。

### 2. KEYS 是唯一事实来源

所有任务 ID 都定义在 `tasks.ts` 的 `KEYS` 中。`index.ts` 中的 getter 与 `WEEKLY`/`DAILY`/`HOURLY` 中的任务元组必须使用相同的键。

### 3. 通过 lib/data 暴露以支持缓存

在 `src/lib/data/index.ts` 中添加缓存包装器：

```typescript
export const getEventsData = createCachedGetter(
  dataLayer.getEventsData,
  ["events-data"],
  CACHE_REVALIDATE_DAY // or CACHE_REVALIDATE_HOUR
)
```

`revalidate` 参数的类型为 `number | false`。传入 `false` 是一种有意采用的模式，用于让路由保持完全静态——设置有限的重新验证时间会让页面启用 ISR，而对于读取 `public/content/` 文件的页面，这在 Netlify 上会失败。例如：`src/lib/data/index.ts` 中的 `getStaticAppsData`，它由嵌入 MDX 页面中的组件使用（数据仅在部署时刷新）。

### 4. 对外部图片使用 S3

外部图片应在 fetcher 中上传至 S3，以集中管理图片域名：

```typescript
// In fetcher - correct
import { uploadToS3 } from "../s3"

const logoUrl = await uploadToS3(event.logoImage, "events/logos")
return { ...event, logoImage: logoUrl ?? "" }
```

始终使用回退值/空字符串处理 `null` 返回值（上传失败）。

### 5. 保持 fetcher 与应用隔离

Fetcher 运行在 Trigger.dev 上——它与 Next.js 应用使用不同的运行时、部署和 bundle。Fetcher 不能假定应用的文件系统、环境或模块可用。

任何延伸到 `src/data-layer/` 之外的导入或运行时依赖都应被视为警示信号。允许：类型（`@/lib/types`、`@/lib/interfaces`）、纯常量（`@/lib/constants`），以及不包含应用运行时依赖的纯工具函数。不允许：任何读取 `process.cwd()` 的内容、任何来自 `app/` 或 `public/` 的内容、任何来自 `src/components/` 的内容，或 `src/lib/data/`（它包装了数据层，并会产生循环依赖）。

如果 fetcher 需要应用中的数据——内容文件、frontmatter 等——应通过 GitHub API 经由网络获取，并将该仓库视为外部系统。有关此模式，请参阅 `fetchGitHubContributors.ts`。不要尝试在 `trigger.config.ts` 中使用 `additionalFiles` 来绕过此限制；将应用文件打包进数据层部署会重新引入这种耦合。

## 添加新的数据源

1. **创建 fetcher**，位置为 `src/data-layer/fetchers/fetchNewData.ts`：

```typescript
   export async function fetchNewData(): Promise<YourDataType> {
     // Fetch and transform data here
   }
   ```

2. **添加键**到 `src/data-layer/tasks.ts` 中的 `KEYS`：

   ```typescript
   export const KEYS = {
     // ...existing keys
     NEW_DATA: "fetch-new-data",
   } as const
   ```

3. **添加任务元组**到 `tasks.ts` 中的 `WEEKLY`、`DAILY` 或 `HOURLY`：

   ```typescript
   const DAILY: TaskDef[] = [
     // ...existing tasks
     [KEYS.NEW_DATA, fetchNewData],
   ]
   ```

4. **添加 getter** 到 `src/data-layer/index.ts`：

   ```typescript
   export const getNewData = () => get<YourDataType>(KEYS.NEW_DATA)
   ```

5. **添加 mock 文件** `src/data-layer/mocks/fetch-new-data.json`，用于本地开发

6. **添加缓存包装器**到 `src/lib/data/index.ts`：
   ```typescript
   export const getNewData = createCachedGetter(
     dataLayer.getNewData,
     ["new-data"],
     CACHE_REVALIDATE_HOUR
   )
   ```