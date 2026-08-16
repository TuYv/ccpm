---
name: next-devtools-guide
description: Provides guidance on using the next-devtools MCP server. Use when working with Next.js projects that have the MCP server configured, when the user encounters connection issues, or when needing help with error detection, route inspection, Server Action tracing, or Cache Components migration.
user-invocable: false
---
# Next.js DevTools MCP

**要求**：Node.js v20.19+、npm 或 pnpm，运行时诊断需要 Next.js 16+。

**功能总数**：7 个工具 + 2 个提示词 + 17 个资源 = 26 项可用功能。

**工具命名**：所有工具均遵循 `mcp__plugin_frontend_next-devtools__<tool-name>` 格式。为简洁起见，本文档使用缩写名称。

有关完整的工具表和 `nextjs_call` 工具名称，请参阅 `references/tools-reference.md`。

## 工具（7）

| 工具 | 用途 |
|------|---------|
| `init` | 使用文档优先行为初始化 MCP 上下文 |
| `nextjs_index` | 发现正在运行的 Next.js 开发服务器和可用的 MCP 工具 |
| `nextjs_call` | 在正在运行的 Next.js 开发服务器上调用特定的 MCP 工具 |
| `nextjs_docs` | 按路径获取 Next.js 官方文档 |
| `browser_eval` | 用于测试的 Playwright 浏览器自动化 |
| `enable_cache_components` | 迁移到 Next.js 16 Cache Components 模式 |
| `upgrade_nextjs_16` | 指导升级到 Next.js 16 |

## 提示词（2）

| 提示词 | 用途 |
|--------|---------|
| `upgrade-nextjs-16` | 完整的升级指南，包括执行 codemod 和手动修复 |
| `enable-cache-components` | 完整的 Cache Components 设置，包括自动修复错误 |

## 资源（17）

**Cache Components（13）：**
- `cache-components://overview` - AI 智能体常犯的严重错误、快速参考
- `cache-components://core-mechanics` - 根本性的范式转变和 cacheComponents 行为
- `cache-components://public-caches` - 使用 'use cache' 的公共缓存机制
- `cache-components://private-caches` - 使用 'use cache: private' 的私有缓存机制
- `cache-components://runtime-prefetching` - 预取配置和过期时间规则
- `cache-components://request-apis` - 异步 params、searchParams、cookies()、headers() 模式
- `cache-components://cache-invalidation` - updateTag()、revalidateTag() 模式和策略
- `cache-components://advanced-patterns` - cacheLife()、cacheTag()、草稿模式
- `cache-components://build-behavior` - 预渲染、静态外壳、构建时行为
- `cache-components://error-patterns` - 常见错误和解决方案
- `cache-components://test-patterns` - 来自 125+ 个固件的真实测试驱动模式
- `cache-components://reference` - 心智模型、API 参考、检查清单
- `cache-components://route-handlers` - 在 Route Handlers（API Routes）中使用 'use cache'

**其他（4）：**
- `nextjs-fundamentals://use-client` - 了解何时以及为何在 Server Components 中使用 'use client'
- `nextjs16://migration/beta-to-stable` - 从 Next.js 16 beta 迁移到稳定版的完整指南
- `nextjs16://migration/examples` - 迁移到 Next.js 16 的真实示例
- `nextjs-docs://llms-index` - 完整的 Next.js 文档索引

## 会话初始化

在每个会话开始时调用 `init`，以建立文档优先行为和工具使用指导。

## 快速开始

**Next.js 16+（运行时诊断）：**

1. 启动开发服务器：`npm run dev`（或 `pnpm dev`）
2. 调用 `init` 以初始化 MCP 上下文
3. 调用 `nextjs_index` 以发现正在运行的服务器和可用工具
4. 使用所需的 `toolName` 调用 `nextjs_call`，以在开发服务器上执行工具

**所有 Next.js 版本（自动化和文档）：**

在 `init` 之后，根据需要使用 `upgrade_nextjs_16`、`enable_cache_components`、`nextjs_docs` 或 `browser_eval`。

## 常见工作流

**实现更改之前**：调用 `nextjs_index` 了解当前应用程序状态，然后使用适当的工具调用 `nextjs_call`。

**错误检测**：调用 `nextjs_index`，然后调用 `nextjs_call` 并设置 `toolName="get_errors"`。

**路由检查**：调用 `nextjs_index`，然后调用 `nextjs_call` 并设置 `toolName="get_routes"`。

**Server Action 追踪**：调用 `nextjs_call`，设置 `toolName="get_server_action_by_id"` 并提供适当的参数。

**文档搜索**：读取 `nextjs-docs://llms-index` MCP 资源以获取正确的路径，然后使用该路径调用 `nextjs_docs`。

**重要提示**：`nextjs_call` 的 `args` 参数必须是一个对象。如果工具不接受任何参数，请完全省略 `args`。

## 故障排除

**MCP 服务器无法连接：**

- 验证是否为 Next.js v16+
- 确认已在 `.mcp.json` 中配置 `next-devtools-mcp`
- 启动或重启开发服务器（`npm run dev`）
- 如果 `nextjs_index` 自动发现失败，请询问用户其开发服务器运行在哪个端口，并将该端口作为 `port` 参数传入

**"No server info found"**：开发服务器必须处于运行状态。如果使用的是 Next.js 15 或更早版本，请使用 `upgrade_nextjs_16` 工具。

**Module not found**：清除 npx 缓存并重启 MCP 客户端。

## 最佳实践

- 在会话开始时，先调用 `init`，然后再使用其他工具
- 使用 `nextjs_index` 或 `nextjs_call` 之前先启动开发服务器
- 对于错误检测和诊断，优先使用 `nextjs_index`/`nextjs_call`，而不是 `browser_eval`
- 仅将 `browser_eval` 用于需要实际页面渲染或 JavaScript 执行的任务
- 调用 `nextjs_docs` 之前，先读取 `nextjs-docs://llms-index` 资源