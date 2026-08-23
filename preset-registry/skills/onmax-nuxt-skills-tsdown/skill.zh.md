---
name: tsdown
description: Use when bundling TypeScript libraries - provides tsdown configuration, dual ESM/CJS output, .d.ts generation, package validation, and plugin authoring
license: MIT
---
# tsdown

由 Rolldown + Oxc 驱动的 TypeScript 打包器。可直接替代 tsup。

## 使用场景

- 构建 TypeScript 库
- 生成 .d.ts 声明
- 发布 npm 包
- 同时输出 ESM/CJS
- Vue/React 组件库

## 快速开始

```bash
npm i -D tsdown typescript
```

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  format: 'esm',
  dts: true,
  exports: true,
})
```

```bash
tsdown           # Build
tsdown --watch   # Watch mode
```

## 参考文件

| 任务                                          | 文件                                  |
| --------------------------------------------- | ------------------------------------- |
| 配置文件、CLI、入口点                | [config.md](references/config.md)     |
| 格式、目标、dts、exports、验证      | [output.md](references/output.md)     |
| Shims、unbundle、监视、框架、WASM      | [features.md](references/features.md) |
| 插件、钩子、lint、编程式调用、迁移 | [advanced.md](references/advanced.md) |

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/config.md](references/config.md) - 如果要设置 tsdown.config.ts、CLI 或入口点
- [ ] [references/output.md](references/output.md) - 如果要配置输出格式、目标、.d.ts、exports 或验证
- [ ] [references/features.md](references/features.md) - 如果要使用 shims、unbundle、监视模式、框架集成或 WebAssembly
- [ ] [references/advanced.md](references/advanced.md) - 如果要编写插件、使用 lint/验证、编程式 API 或从 tsup 迁移

**不要一次加载所有文件。** 只加载与你当前任务相关的文件。

## 跨 Skill 引用

- **库模式** → 使用 `ts-library` skill
- **Vue 组件库** → 使用 `vue` skill
- **包管理** → 使用 `pnpm` skill