---
name: ts-library
description: Use when authoring TypeScript libraries or npm packages - covers project setup, package.json exports, build tooling (tsdown/unbuild), API design patterns, type inference tricks, testing, and publishing to npm. Use when bundling, configuring dual CJS/ESM output, or setting up release workflows.
license: MIT
---
# TypeScript 库开发

从研究 unocss、shiki、unplugin、vite、vitest、vueuse、zod、trpc、drizzle-orm 等项目中提炼出的高质量 TypeScript 库开发模式。

## 适用场景

- 启动新的 TypeScript 库项目（单包或 monorepo）
- 为双 CJS/ESM 配置 package.json exports
- 为库开发配置 tsconfig
- 选择构建工具（tsdown、unbuild）
- 设计类型安全的 API（构建器、工厂、插件模式）
- 编写高级 TypeScript 类型
- 配置 vitest 以测试库
- 配置发布工作流和 CI

**对于 Nuxt 模块开发：** 使用 `nuxt-modules` 技能

## 快速参考

| 当前工作                   | 加载文件                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| 新项目配置                 | [references/project-setup.md](references/project-setup.md)         |
| 包导出                     | [references/package-exports.md](references/package-exports.md)     |
| tsconfig 选项              | [references/typescript-config.md](references/typescript-config.md) |
| 构建配置                   | [references/build-tooling.md](references/build-tooling.md)         |
| ESLint 配置                | [references/eslint-config.md](references/eslint-config.md)         |
| API 设计模式               | [references/api-design.md](references/api-design.md)               |
| 类型推断技巧               | [references/type-patterns.md](references/type-patterns.md)         |
| 测试配置                   | [references/testing.md](references/testing.md)                     |
| 发布工作流                 | [references/release.md](references/release.md)                     |
| CI/CD 配置                 | [references/ci-workflows.md](references/ci-workflows.md)           |

## 加载文件

**根据你的任务，考虑加载以下参考文件：**

- [ ] [references/project-setup.md](references/project-setup.md) - 如果要启动新的 TypeScript 库项目
- [ ] [references/package-exports.md](references/package-exports.md) - 如果要配置 package.json exports 或双 CJS/ESM
- [ ] [references/typescript-config.md](references/typescript-config.md) - 如果要配置或修改 tsconfig.json
- [ ] [references/build-tooling.md](references/build-tooling.md) - 如果要配置 tsdown、unbuild 或构建脚本
- [ ] [references/eslint-config.md](references/eslint-config.md) - 如果要为库开发配置 ESLint
- [ ] [references/api-design.md](references/api-design.md) - 如果要设计公共 API、构建器模式或插件系统
- [ ] [references/type-patterns.md](references/type-patterns.md) - 如果要使用高级 TypeScript 类型或类型推断
- [ ] [references/testing.md](references/testing.md) - 如果要配置 vitest 或为库代码编写测试
- [ ] [references/release.md](references/release.md) - 如果要配置发布工作流或版本控制
- [ ] [references/ci-workflows.md](references/ci-workflows.md) - 如果要配置 GitHub Actions 或 CI/CD 流水线

**不要一次性加载所有文件。** 仅加载与你当前任务相关的内容。

## 新建库工作流

1. 创建项目结构 → 加载 [references/project-setup.md](references/project-setup.md)
2. 配置 `package.json` 导出 → 加载 [references/package-exports.md](references/package-exports.md)
3. 使用 tsdown 设置构建 → 加载 [references/build-tooling.md](references/build-tooling.md)
4. 验证构建：`pnpm build && pnpm pack --dry-run` — 检查输出是否包含 `.mjs`、`.cjs`、`.d.ts`
5. 添加测试 → 加载 [references/testing.md](references/testing.md)
6. 配置发布 → 加载 [references/release.md](references/release.md)

## 快速开始

```json
// package.json (minimal)
{
  "name": "my-lib",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": ["dist"]
}
```

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
})
```

## 核心原则

- ESM 优先：使用 `"type": "module"` 并输出 `.mjs`
- 双格式：始终同时支持 CJS 和 ESM 使用者
- 现代 TypeScript 使用 `moduleResolution: "Bundler"`
- 大多数构建使用 tsdown，复杂情况使用 unbuild
- 智能默认值：检测环境，不强制配置
- 可摇树优化：延迟 getter，正确设置 `sideEffects: false`

_Token 效率：主 skill 约 300 个 token，每份参考文档约 800-1200 个 token_