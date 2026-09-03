---
name: next-best-practices
description: Next.js best practices - file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling
user-invocable: false
---
# Next.js 最佳实践

在编写或评审 Next.js 代码时应用以下规则。

## 文件约定

以下内容详见 [file-conventions.md](./file-conventions.md)：
- 项目结构与特殊文件
- 路由段（动态、捕获所有、分组）
- 并行路由与拦截路由
- v16 中间件重命名（middleware → proxy）

## RSC 边界

检测无效的 React Server Component 模式。

以下内容详见 [rsc-boundaries.md](./rsc-boundaries.md)：
- 异步客户端组件检测（无效）
- 不可序列化 props 检测
- Server Action 例外情况

## 异步模式

Next.js 15+ 的异步 API 变更。

以下内容详见 [async-patterns.md](./async-patterns.md)：
- 异步 `params` 和 `searchParams`
- 异步 `cookies()` 和 `headers()`
- 迁移 codemod

## 运行时选择

以下内容详见 [runtime-selection.md](./runtime-selection.md)：
- 默认使用 Node.js 运行时
- 何时适合使用 Edge 运行时

## 指令

以下内容详见 [directives.md](./directives.md)：
- `'use client'`、`'use server'`（React）
- `'use cache'`（Next.js）

## 函数

以下内容详见 [functions.md](./functions.md)：
- 导航钩子：`useRouter`、`usePathname`、`useSearchParams`、`useParams`
- 服务端函数：`cookies`、`headers`、`draftMode`、`after`
- 生成函数：`generateStaticParams`、`generateMetadata`

## 错误处理

以下内容详见 [error-handling.md](./error-handling.md)：
- `error.tsx`、`global-error.tsx`、`not-found.tsx`
- `redirect`、`permanentRedirect`、`notFound`
- `forbidden`、`unauthorized`（认证错误）
- 在 catch 块中使用 `unstable_rethrow`

## 数据模式

以下内容详见 [data-patterns.md](./data-patterns.md)：
- Server Components 与 Server Actions 与 Route Handlers 的对比
- 避免数据瀑布（`Promise.all`、Suspense、预加载）
- 客户端组件的数据获取

## Route Handlers

以下内容详见 [route-handlers.md](./route-handlers.md)：
- `route.ts` 基础
- GET 处理器与 `page.tsx` 的冲突
- 环境行为（没有 React DOM）
- 何时使用它而非 Server Actions

## 元数据与 OG 图片

以下内容详见 [metadata.md](./metadata.md)：
- 静态与动态元数据
- `generateMetadata` 函数
- 使用 `next/og` 生成 OG 图片
- 基于文件的元数据约定

## 图片优化

以下内容详见 [image.md](./image.md)：
- 始终使用 `next/image` 而非 `<img>`
- 远程图片配置
- 响应式 `sizes` 属性
- 模糊占位符
- 针对 LCP 的优先加载

## 字体优化

以下内容详见 [font.md](./font.md)：
- `next/font` 设置
- Google 字体、本地字体
- Tailwind CSS 集成
- 预加载字符子集

## 打包

以下内容详见 [bundling.md](./bundling.md)：
- 与服务端不兼容的包
- CSS 导入（而非 link 标签）
- Polyfill（已内置）
- ESM/CommonJS 问题
- 包体积分析

## 脚本

以下内容详见 [scripts.md](./scripts.md)：
- `next/script` 与原生 script 标签的对比
- 内联脚本需要 `id`
- 加载策略
- 使用 `@next/third-parties` 接入 Google Analytics

## 水合（Hydration）错误

以下内容详见 [hydration-error.md](./hydration-error.md)：
- 常见原因（浏览器 API、日期、无效 HTML）
- 使用错误浮层进行调试
- 针对各原因的修复方法

## Suspense 边界

以下内容详见 [suspense-boundaries.md](./suspense-boundaries.md)：
- `useSearchParams` 和 `usePathname` 导致的 CSR 退出（bailout）
- 哪些钩子需要 Suspense 边界

## 并行与拦截路由

以下内容详见 [parallel-routes.md](./parallel-routes.md)：
- 使用 `@slot` 和 `(.)` 拦截器实现弹窗（Modal）模式
- 用 `default.tsx` 提供回退内容
- 使用 `router.back()` 正确关闭弹窗

## 自托管

以下内容详见 [self-hosting.md](./self-hosting.md)：
- 用于 Docker 的 `output: 'standalone'`
- 面向多实例 ISR 的缓存处理器
- 开箱即用与需要额外配置的功能

## 调试技巧

以下内容详见 [debug-tricks.md](./debug-tricks.md)：
- 用于 AI 辅助调试的 MCP 端点
- 使用 `--debug-build-paths` 重新构建特定路由
