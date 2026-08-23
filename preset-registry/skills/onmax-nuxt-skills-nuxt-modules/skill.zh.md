---
name: nuxt-modules
description: "Use when creating Nuxt modules: (1) Published npm modules (@nuxtjs/, nuxt-), (2) Local project modules (modules/ directory), (3) Runtime extensions (components, composables, plugins), (4) Server extensions (API routes, middleware), (5) Releasing/publishing modules to npm, (6) Setting up CI/CD workflows for modules. Provides defineNuxtModule patterns, Kit utilities, hooks, E2E testing, and release automation."
license: MIT
---
# Nuxt 模块开发

创建用于扩展框架功能的 Nuxt 模块指南。

**相关技能：** `nuxt`（基础）、`vue`（运行时模式）

## 快速开始

```bash
npx nuxi init -t module my-module
cd my-module && npm install
npm run dev        # Start playground
npm run dev:build  # Build in watch mode
npm run test       # Run tests
```

## 可用指南

- **[references/development.md](references/development.md)** - 模块结构、defineNuxtModule、Kit 工具函数、钩子
- **[references/testing-and-publishing.md](references/testing-and-publishing.md)** - E2E 测试、最佳实践、发布与分发
- **[references/ci-workflows.md](references/ci-workflows.md)** - 可直接复制粘贴的 CI/CD 工作流模板

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/development.md](references/development.md) - 如果要构建模块功能、使用 defineNuxtModule 或使用 Kit 工具函数
- [ ] [references/testing-and-publishing.md](references/testing-and-publishing.md) - 如果要编写 E2E 测试、发布到 npm 或遵循最佳实践
- [ ] [references/ci-workflows.md](references/ci-workflows.md) - 如果要为模块设置 CI/CD 工作流

**请勿一次性加载所有文件。** 仅加载与当前任务相关的文件。

## 模块类型

| 类型      | 位置             | 使用场景                          |
| --------- | ---------------- | -------------------------------- |
| 已发布    | npm package      | `@nuxtjs/`、`nuxt-` 分发          |
| 本地      | `modules/` dir   | 项目特定的扩展                    |
| 内联      | `nuxt.config.ts` | 简单的一次性钩子                  |

## 项目结构

```
my-module/
├── src/
│   ├── module.ts           # Entry point
│   └── runtime/            # Injected into user's app
│       ├── components/
│       ├── composables/
│       ├── plugins/
│       └── server/
├── playground/             # Dev testing
└── test/fixtures/          # E2E tests
```

## 资源

- [模块指南](https://nuxt.com/docs/guide/going-further/modules)
- [Nuxt Kit](https://nuxt.com/docs/api/kit)
- [模块起始模板](https://github.com/nuxt/starter/tree/module)