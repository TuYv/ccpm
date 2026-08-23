---
name: nuxt-i18n
description: Internationalize Nuxt applications with @nuxtjs/i18n. Use when configuring locales or browser detection, translating messages or routes, building locale switchers, handling fallbacks, lazy-loading messages, or adding locale SEO.
license: MIT
---
# Nuxt I18n

Nuxt I18n 负责区域设置消息、本地化路由、语言检测和区域设置元数据。Nuxt 负责外围页面、渲染和服务器生命周期。

## 工作流程

1. 检查已安装的 `@nuxtjs/i18n` 版本、`nuxt.config.*`、`i18n/i18n.config.*`、区域设置文件以及受影响的页面。当区域设置代码、文件、`defaultLocale` 和路由策略保持一致时，即可认为已理解当前配置。
2. 打开下方最匹配且范围最小的指南。将模块选项保留在 `nuxt.config` 中，将 Vue I18n 选项保留在 `i18n.config` 中，并将翻译消息保留在区域设置文件中。
3. 使用本地化链接和模块组合式函数进行实现，以便路由、消息加载和 SEO 共享同一个区域设置状态。
4. 运行 `nuxi prepare` 和项目的类型检查，然后分别使用默认区域设置和一个次要区域设置访问受影响的路由。当两种区域设置都能呈现预期的消息、URL、语言元数据和回退行为时，即表示更改已完成。

## 路由

| 任务                                                                                 | 打开                                         |
| ------------------------------------------------------------------------------------ | -------------------------------------------- |
| 安装、区域设置对象、文件布局、浏览器检测或 Vue I18n 配置                             | [配置](references/configuration.md) |
| 翻译键、插值、复数、日期、数字或运行时消息加载                                       | [消息](references/messages.md)           |
| 路由策略、本地化链接、切换器、自定义路径、动态 slug 或 SEO                           | [路由和 SEO](references/routing.md)     |
| Nuxt 页面、中间件、数据获取、SSR 状态或服务器路由                                    | `nuxt` 技能                                 |

## 基础配置

```bash
npx nuxi@latest module add @nuxtjs/i18n
```

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
    ],
  },
})
```

```json
{
  "welcome": "Welcome"
}
```

默认情况下，区域设置文件从 `i18n/locales/` 解析。请在配置、路由辅助函数、区域设置文件和回退规则中使用相同的区域设置代码。