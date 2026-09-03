---
name: ccusage-typescript
description: Guides ccusage TypeScript package and tooling work. Use when editing apps/ccusage .ts/.js files, Vitest tests, Bun scripts, package launchers, schema tooling, or benchmark scripts.
paths:
  - 'apps/ccusage/**/*.ts'
  - 'apps/ccusage/**/*.js'
  - 'docs/**/*.ts'
  - 'scripts/**/*.ts'
globs: 'apps/ccusage/**/*.ts,apps/ccusage/**/*.js,docs/**/*.ts,scripts/**/*.ts'
---
# ccusage TypeScript

使用本技能处理剩余的 TypeScript 和 JavaScript 包层面内容：

- `apps/ccusage/src/cli.ts` 原生二进制启动器。
- `apps/ccusage/scripts/**` 下的包、schema、基准测试和原生暂存脚本。
- 针对 TypeScript 包/工具行为的 Vitest 覆盖测试。
- 当变更不仅限于文档内容时，涉及 VitePress 及根目录 TypeScript 配置或脚本的情况。

运行时 CLI 行为应归属于 `rust/crates/ccusage` 下的 Rust。除非用户明确将工作范围限定在包层，否则不要新增 TypeScript 适配器逻辑。

## 风格

如需详细的 TypeScript 规范，请使用 `typescript-style`。在本仓库中：

- 对带类型的字面量、mock、配置对象和表驱动用例，优先使用 `satisfies` 和 `as const satisfies`。
- 避免不安全的 `as` 断言，尤其是 `as any`。
- 本地导入使用 `.ts` 扩展名。
- 文件路径使用 Node 的路径工具函数。
- 在包代码中使用 `logger.ts` 而非 `console.log`。
- 不要使用动态导入，尤其是在 Vitest 代码块中。
- 导出应仅限于模块外部会用到的值。

## Vitest

Vitest 仍适用于 TypeScript 包启动器、schema 产物、基准测试脚本以及文档/包工具。生产 CLI 运行时行为请优先使用 Rust 测试。

阅读 `references/vitest.md` 了解 ccusage 特有的 Vitest 模式。阅读 `../tdd/references/vitest-running-and-modifiers.md` 获取更广泛的 Vitest 命令与修饰符示例，阅读 `../tdd/references/vitest-readability.md` 获取以行为为核心的断言示例。

## Bun 与包脚本

在修改 Bun 运行时 API（例如 `Bun.$`、`Bun.file()`、`Bun.write()`、`Bun.spawn()`、`Bun.argv`、`Bun.stdout`、`Bun.stderr` 或 `Bun.stringWidth()`）之前，请先使用 `bun-api-reference`。

分析 TypeScript 启动器、基准测试或打包脚本性能时，请使用 `bun-cpu-profile`。分析原生 CLI 性能时，请使用 `ccusage-rust-profile`。

本仓库中没有 TypeScript 相似度检测技能。除非重新引入专门的 similarity-ts 工作流，否则请使用 `ast-grep` 或 `rg` 进行 TypeScript 重复检查。

## 验证

迭代过程中运行有针对性的检查，收尾前再执行常规的根目录工作流：

```sh
pnpm run test:vitest
pnpm run format
pnpm typecheck
pnpm run test
```
