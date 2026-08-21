---
name: moai-domain-frontend
description: >
  Frontend development specialist covering React 19, Next.js 16, Vue 3.5,
  and modern UI/UX patterns with component architecture. Use when building
  web UIs, implementing components, optimizing frontend performance, or
  integrating state management.

when_to_use: >
  Use for frontend development: React 19, Next.js 16, Vue 3.5 components,
  responsive UIs, TypeScript/JavaScript, state management, hooks, props,
  JSX/TSX, DOM, CSS, Tailwind, and client-side browser performance.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob
user-invocable: false
metadata:
  version: "2.1.0"
  category: "domain"
  status: "active"
  updated: "2026-03-28"
  tags: "frontend, react, nextjs, vue, ui, components"
  author: "MoAI-ADK Team"
---
# 前端开发专家

## 快速参考

现代前端开发——涵盖 React 19、Next.js 16、Vue 3.5 的综合模式。

核心能力：

- React 19：服务器组件、并发特性、cache()、Suspense
- Next.js 16：App Router、Server Actions、ISR、Route handlers
- Vue 3.5：Composition API、TypeScript、Pinia 状态管理
- 组件架构：设计系统、复合组件、CVA
- 性能：代码分割、动态导入、记忆化、Framer Motion 动画

适用场景：

- 现代 Web 应用开发
- 组件库创建
- 前端性能优化
- 注重无障碍性的 UI/UX

---

## 模式

### 框架模式

React 19 模式：

- Server Components、并发特性、cache() API、表单处理

Next.js 16 模式：

- App Router、Server Actions、ISR、Route Handlers、Parallel Routes

Vue 3.5 模式：

- Composition API、Composables、响应式、Pinia、Provide/Inject

### 架构模式

组件架构：

- 设计令牌、CVA 变体、复合组件、无障碍性

状态管理：

- Zustand、Redux Toolkit、React Context、Pinia

性能优化：

- 代码分割、动态导入、图像优化、记忆化

AI 辅助前端模式：

- 视觉参考策略、Playwright 验证、动效设计、推理级别调优

Vercel React 最佳实践：

- 来自 Vercel Engineering 的 8 个类别、共 45 条规则
- 消除瀑布流、包体积优化、服务端性能
- 客户端数据获取、重新渲染优化、渲染性能

---

## 实现快速入门

### React 19 服务器组件

创建一个异步页面组件，使用 React 中的 cache 函数对数据获取进行记忆化。导入 Suspense 以处理加载状态。定义一个 getData 函数，该函数使用 id 参数从 API 端点获取数据并返回 JSON。在页面组件中，使用 Suspense 包裹 DataDisplay 组件，并以 Skeleton 作为 fallback，同时将等待 getData 返回的结果作为 data prop 传入。

### Next.js Server Action

创建一个包含 use server 指令的 server action 文件。从 next/cache 导入 revalidatePath，并从 zod 导入 z 以进行验证。定义一个 schema，其中 title 最少包含 1 个字符，content 最少包含 10 个字符。createPost 函数接收 FormData，使用 safeParse 进行验证，验证失败时返回错误，在数据库中创建 post，并针对 posts 页面调用 revalidatePath。

### Vue Composable

创建一个接收 userId ref 参数的 useUser composable。将 user 定义为可空 ref，将 loading 定义为布尔值 ref，并将 fullName 定义为连接 firstName 和 lastName 的 computed property。使用 watchEffect 将 loading 设置为 true，异步获取 user data，将其赋值给 user ref，然后将 loading 设置为 false。返回 user、loading 和 fullName refs。

### CVA 组件

从 class-variance-authority 导入 cva 和 VariantProps。使用 inline-flex、items-center、justify-center、rounded-md 和 font-medium 的基础类定义 buttonVariants。添加 variants object，其中 variant options 包括 default（primary background with hover）和 outline（border with hover accent）。添加 size options，包括 sm（h-9、px-3、text-sm）、default（h-10、px-4）和 lg（h-11、px-8）。为 variant 和 size 设置 defaultVariants。导出一个 Button 组件，将这些 variants 应用于 button element className。

---

## 配合良好的技能与规则

- moai-domain-backend - 全栈开发
- moai-library-shadcn - 组件库集成
- moai-domain-uiux - UI/UX 设计原则
- `.claude/rules/moai/languages/typescript.md` - TypeScript 模式（通过 frontmatter 中的 paths 自动加载）
- moai-workflow-testing - 前端测试

---

## 技术栈

框架：React 19、Next.js 16、Vue 3.5、Nuxt 3

语言：TypeScript 5.9+、JavaScript ES2024

样式：Tailwind CSS 3.4+、CSS Modules、shadcn/ui

动画：Framer Motion

状态管理：Zustand、Redux Toolkit、Pinia

测试：Vitest、Testing Library、Playwright

验证：Playwright（视觉检查、功能测试）

---

## 资源

官方文档：

- React：https://react.dev/
- Next.js：https://nextjs.org/docs
- Vue：https://vuejs.org/

---

版本：2.1.0
最后更新：2026-03-28

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “无障碍功能可以在发布后再添加” | 发布后再实现无障碍功能意味着重写，而不是简单添加。语义化 HTML 和 ARIA 是基础，而非装饰。 |
| “这个组件太简单了，不需要单独测试” | 简单组件会组合成复杂的 UI。一个损坏的简单组件会在所有使用它的地方引发连锁故障。 |
| “服务器组件总是更快” | 服务器组件会增加网络往返。具有适当缓存的客户端组件可能优于未经优化的服务器组件。应进行测量，而不是凭空假设。 |
| “我暂时直接使用 any 作为 TypeScript 类型” | any 会使下游所有代码失去类型检查。一个 any 会影响整个调用链。 |
| “全局 CSS 对这个项目来说没问题” | 随着项目增长，全局 CSS 会产生优先级冲突。作用域样式（CSS modules、Tailwind）可以避免冲突。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 组件在未经清理的情况下渲染用户提供的 HTML（XSS 攻击途径）
- 在组件 props 或 state 定义中使用 TypeScript `any` 类型
- 异步数据获取组件未定义加载或错误状态
- 交互元素缺少无障碍属性（aria-label、role）
- 包体积无正当理由增加超过 50KB
- 组件超过 300 行，且未拆分为子组件

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 所有交互元素都有无障碍名称（aria-label 或可见文本）
- [ ] 组件能够处理加载、错误和空状态
- [ ] 新增或修改的代码中不存在 TypeScript `any`（展示 grep 结果）
- [ ] 已测量新依赖对包体积的影响（展示分析器输出）
- [ ] 用户提供的内容经过适当的转义或清理后再渲染
- [ ] 组件少于 300 行，或已拆分并具有清晰的子组件边界

<!-- moai:evolvable-end -->

## 重构说明

**重构范围**（推迟到未来的子 SPEC）：
- 将正文精简为指向 moai-ref-react-patterns 和 moai-library-nextra 的路由/委派内容
- 将特定于框架的深入讲解提取到 Level-3 模块中
- 删除与库技能和参考技能中的内容重复的部分

此技能在 v3.0 中予以保留，但其主体内容将在后续的 SPEC 中进行重构。