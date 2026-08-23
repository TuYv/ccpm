---
name: vite
description: Vite build tool configuration, plugin API, SSR, and Vite 8 Rolldown migration. Use when working with Vite projects, vite.config.ts, Vite plugins, or building libraries/SSR apps with Vite.
license: MIT
metadata:
  author: Anthony Fu
  version: "2026.1.31"
  source: Generated from https://github.com/vitejs/vite, scripts at https://github.com/antfu/skills
---
# Vite

> 基于 Vite 8 测试版（由 Rolldown 驱动）。Vite 8 使用 Rolldown 打包器和 Oxc 转换器。

Vite 是下一代前端构建工具，提供快速的开发服务器（原生 ESM + HMR）和优化的生产构建。

## 偏好

- 使用 TypeScript：优先使用 `vite.config.ts`
- 始终使用 ESM，避免使用 CommonJS

## 核心

| 主题          | 描述                                                                           | 参考                                             |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| 配置          | `vite.config.ts`、`defineConfig`、条件配置、`loadEnv`                          | [核心配置](references/core-config.md)            |
| 功能          | `import.meta.glob`、资源查询（`?raw`、`?url`）、`import.meta.env`、HMR API      | [核心功能](references/core-features.md)          |
| 插件 API      | Vite 特有钩子、虚拟模块、插件顺序                                              | [核心插件 API](references/core-plugin-api.md)    |

## 构建与 SSR

| 主题          | 描述                                                             | 参考                                         |
| ------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| 构建与 SSR    | 库模式、SSR 中间件模式、`ssrLoadModule`、JavaScript API           | [构建与 SSR](references/build-and-ssr.md)    |

## 高级

| 主题              | 描述                                                              | 参考                                                   |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| 环境 API          | Vite 6+ 多环境支持、自定义运行时                                  | [环境 API](references/environment-api.md)              |
| Rolldown 迁移     | Vite 8 变更：Rolldown 打包器、Oxc 转换器、配置迁移                 | [Rolldown 迁移](references/rolldown-migration.md)       |

## 快速参考

### CLI 命令

```bash
vite              # Start dev server
vite build        # Production build
vite preview      # Preview production build
vite build --ssr  # SSR build
```

### 常用配置

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  resolve: { alias: { '@': '/src' } },
  server: { port: 3000, proxy: { '/api': 'http://localhost:8080' } },
  build: { target: 'esnext', outDir: 'dist' },
})
```

### 官方插件

- `@vitejs/plugin-vue` - Vue 3 SFC 支持
- `@vitejs/plugin-vue-jsx` - Vue 3 JSX
- `@vitejs/plugin-react` - 使用 Oxc/Babel 的 React
- `@vitejs/plugin-react-swc` - 使用 SWC 的 React
- `@vitejs/plugin-legacy` - 旧版浏览器支持

## 跨 Skill 参考

- **测试** → 使用 `vitest` Skill（Vite 原生测试）
- **Vue 项目** → 使用 `vue` Skill 获取组件模式
- **库打包** → 对 TypeScript 库使用 `tsdown` Skill