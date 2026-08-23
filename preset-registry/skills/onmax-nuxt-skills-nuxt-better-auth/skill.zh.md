---
name: nuxt-better-auth
description: Use when implementing auth in Nuxt apps with @onmax/nuxt-better-auth - provides useUserSession composable, server auth helpers, route protection, and Better Auth plugins integration.
license: MIT
---
# Nuxt Better Auth

基于 [Better Auth](https://www.better-auth.com/) 构建的 Nuxt 4+ 身份认证模块。提供组合式函数、服务器工具和路由保护功能。

> **Alpha 状态**：此模块目前处于 Alpha 阶段（v0.0.2-alpha.19），不建议用于生产环境。API 可能会发生变化。

## 适用场景

- 安装/配置 `@onmax/nuxt-better-auth`
- 实现登录/注册/退出登录流程
- 保护路由（客户端和服务器端）
- 在 API 路由中访问用户会话
- 集成 Better Auth 插件（管理员、通行密钥、双重身份验证）
- 使用 NuxtHub 设置数据库
- 对外部身份认证后端使用 clientOnly 模式
- 使用 `@nuxtjs/i18n` 添加国际化支持

**对于 Nuxt 模式：**使用 `nuxt` skill
**对于 NuxtHub 数据库：**使用 `nuxthub` skill

## 可用指南

| 文件                                                                 | 主题                                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **[references/installation.md](references/installation.md)**         | 模块设置、环境变量、配置文件                                   |
| **[references/client-auth.md](references/client-auth.md)**           | useUserSession、signIn/signUp/signOut、BetterAuthState、安全重定向 |
| **[references/server-auth.md](references/server-auth.md)**           | serverAuth、getUserSession、requireUserSession                         |
| **[references/route-protection.md](references/route-protection.md)** | routeRules、definePageMeta、中间件                                 |
| **[references/plugins.md](references/plugins.md)**                   | Better Auth 插件（管理员、通行密钥、双重身份验证）                              |
| **[references/database.md](references/database.md)**                 | NuxtHub 集成、Drizzle 模式、带外键的自定义表            |
| **[references/client-only.md](references/client-only.md)**           | 外部身份认证后端、clientOnly 模式、CORS                           |
| **[references/types.md](references/types.md)**                       | AuthUser、AuthSession、类型扩充                               |

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/installation.md](references/installation.md) - 如果要安装或配置模块
- [ ] [references/client-auth.md](references/client-auth.md) - 如果要构建登录/注册/退出登录流程
- [ ] [references/server-auth.md](references/server-auth.md) - 如果要保护 API 路由或在服务器端访问用户会话
- [ ] [references/route-protection.md](references/route-protection.md) - 如果要使用 routeRules 或 definePageMeta 进行身份认证
- [ ] [references/plugins.md](references/plugins.md) - 如果要集成 Better Auth 插件（管理员、通行密钥、双重身份验证）
- [ ] [references/database.md](references/database.md) - 如果要使用 NuxtHub 或 Drizzle 设置数据库
- [ ] [references/client-only.md](references/client-only.md) - 如果要通过 clientOnly 模式使用外部身份认证后端
- [ ] [references/types.md](references/types.md) - 如果要使用 AuthUser、AuthSession 或类型扩充

**不要一次性加载所有文件。** 只加载与当前任务相关的内容。

## 核心概念

| 概念                   | 描述                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `useUserSession()`     | 客户端组合式函数——提供 user、session、loggedIn、signIn/Out 方法 |
| `requireUserSession()` | 服务端辅助函数——未通过身份验证时抛出 401/403                  |
| `auth` 路由模式        | `'user'`、`'guest'`、`{ user: {...} }` 或 `false`             |
| `serverAuth()`         | 在服务端路由中获取 Better Auth 实例                           |

## 快速参考

```ts
// Client: useUserSession()
const { user, loggedIn, signIn, signOut } = useUserSession()
await signIn.email({ email, password }, { onSuccess: () => navigateTo('/') })
```

```ts
// Server: requireUserSession()
const { user } = await requireUserSession(event, { user: { role: 'admin' } })
```

```ts
// nuxt.config.ts: Route protection
routeRules: {
  '/admin/**': { auth: { user: { role: 'admin' } } },
  '/login': { auth: 'guest' },
  '/app/**': { auth: 'user' }
}
```

## 资源

- [模块文档](https://github.com/onmax/nuxt-better-auth)
- [Better Auth 文档](https://www.better-auth.com/)

---

_Token 效率：主技能约 300 个 token，每个子文件约 800-1200 个 token_