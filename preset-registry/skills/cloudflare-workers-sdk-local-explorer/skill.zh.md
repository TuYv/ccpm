---
name: local-explorer
description: How to add products/resources to the local explorer or local API. Use when implementing new local APIs, or UI routes under packages/miniflare/src/workers/local-explorer or packages/local-explorer-ui.
---
# Cloudflare 本地资源管理器产品

在向本地 API 和/或本地资源管理器添加新产品或资源类型时，请使用此技能。

## 从这里开始

编辑前请阅读以下文件：

- `packages/miniflare/src/workers/local-explorer/explorer.worker.ts`
- `packages/miniflare/src/plugins/core/explorer.ts`
- `packages/miniflare/src/plugins/core/types.ts`
- `packages/miniflare/src/workers/local-explorer/resources/` 中的一个现有资源实现，最好选择与新产品最相似的产品
- `packages/miniflare/test/plugins/local-explorer/` 中一个对应的测试

如果涉及 UI 更改，还请阅读：

- `packages/local-explorer-ui/src/components/Sidebar.tsx`
- `packages/local-explorer-ui/src/routes/` 下的现有路由文件
- `packages/local-explorer-ui/src/__e2e__/` 下的现有产品端到端测试

## 工作流程

1. 将 API 接口添加到 `packages/miniflare/scripts/openapi-filter-config.ts`。
2. 从完整的 Cloudflare OpenAPI 规范生成 Miniflare 的筛选后规范和后端类型：

```bash
OPENAPI_INPUT_PATH=<path-to-full-openapi-spec> pnpm --dir packages/miniflare generate:api
```

3. 检查 `packages/miniflare/src/workers/local-explorer/openapi.local.json` 和生成的类型。如果生成的 schema 包含本地资源管理器不支持的字段，请在 `openapi-filter-config.ts` 中添加忽略项并重新生成。
4. 资源管理器 worker 应当能够访问所有用户资源绑定。确保 `proxyBindings` 包含新产品的绑定，并确保 `getExplorerServices()` 暴露资源管理器 worker 所需的所有额外绑定。通过 `packages/miniflare/src/plugins/core/explorer.ts` 中的 `constructExplorerBindingMap()` 和 `constructExplorerWorkerOpts()` 接入产品绑定。
5. 在 `packages/miniflare/src/plugins/core/types.ts` 中添加或扩展资源绑定元数据。
6. 在 `packages/miniflare/src/workers/local-explorer/resources/<product>.ts` 中实现处理程序。如果适用，请务必考虑跨实例聚合。
7. 在 `packages/miniflare/src/workers/local-explorer/explorer.worker.ts` 中注册 Hono 路由。
8. 使用 `generated/zod.gen.ts` 中生成的 Zod schema，通过 `validateRequestBody()` 和 `validateQuery()` 验证请求体和查询参数。
9. 除非该产品的现有端点使用不同的响应格式，否则请使用 `common.ts` 中的 `wrapResponse()` 和 `errorResponse()` 返回 Cloudflare API 信封格式响应。
10. 在 `packages/miniflare/test/plugins/local-explorer/<product>.spec.ts` 中添加 Miniflare 测试。
11. 重新生成 UI API 客户端：

```bash
pnpm --dir packages/local-explorer-ui build
```

12. 添加 UI 路由/组件。新 UI 请使用 Kumo 组件。请参阅 https://github.com/cloudflare/kumo/blob/main/AGENTS.md。
13. 对于新增的可见产品流程，请在 `packages/local-explorer-ui/src/__e2e__/<product>/` 下添加 Playwright 端到端测试。

## OpenAPI 规则

- 不要直接编辑 `packages/miniflare/src/workers/local-explorer/openapi.local.json` 或 `packages/miniflare/src/workers/local-explorer/generated/` 等生成文件。
- 如果存在公共 API，优先使用上游 Cloudflare API 路径。
- 仅对本地专用 API 或 Cloudflare 公共 API 中不存在的 API 使用 `openapi-filter-config.ts` 中的 `extensions.paths`。
- 对不支持的参数、标头、请求体属性和响应字段添加忽略项，而不是假装支持它们。

## 后端模式

- 本地列表端点（例如列出 KV 命名空间）不应实现分页，因为这可能需要跨实例聚合。以单个资源为目标时应支持分页，例如列出特定命名空间中的 KV 键。
- 对于跨 Worker 聚合，请使用 `aggregation.ts` 中的 `aggregateListResults()`、`getPeerUrlsIfAggregating()` 和 `fetchFromPeer()`；不要自行实现对等实例发现。当产品可能跨多个实例时，请同时为仅本地行为和聚合行为添加测试。
- 如果 API 需要直接访问文件系统，请通过回环服务（`c.env.MINIFLARE_LOOPBACK`）调用 Node.js 端点。本地资源管理器 API 在 workerd 内部运行，因此无法直接访问主机文件系统。
- 如果端点需要运行时绑定本身不提供的元数据，请将该元数据放入 `BindingIdMap`，并通过 `CoreBindings.JSON_LOCAL_EXPLORER_BINDING_MAP` 传递。
- 如果产品应显示在 `/api/local/workers` 中，请将其添加到 `WorkerResourceBindings`，并在 `constructExplorerWorkerOpts()` 中填充。

## UI 模式

- UI API 客户端根据 `packages/miniflare/src/workers/local-explorer/openapi.local.json` 生成到 `packages/local-explorer-ui/src/api/generated/` 中。
- 侧边栏资源来自 `/api/local/workers`；当产品应显示在导航中时，请更新 `LocalExplorerWorkerBindings` 的用法和 `Sidebar.tsx`。
- 在 `packages/local-explorer-ui/src/routes/` 下添加路由文件。TanStack Router 会在 UI 构建/开发期间重新生成 `src/routeTree.gen.ts`。
- 遵循侧边栏模式时，请通过产品链接传递 `worker` 查询参数，以保留 Worker 选择状态。
- 对于新的 UI 组件，请尽可能使用 Kumo。不要引入一套并行的组件系统。
- 不要使用 tailwindCSS 颜色令牌，请改用 Kumo 颜色令牌。