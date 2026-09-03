---
name: typescript
description: Guides ccusage TypeScript and JavaScript work. Use before reading or editing .ts, .tsx, .js, or .jsx files, including the npm launcher, Node tests, build and fixture scripts, mocks, and typed literals.
paths:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
globs: '*.ts,*.tsx,*.js,*.jsx'
---
# ccusage TypeScript

运行时 CLI 行为位于 `rust/` 下的 Rust 代码中。新的适配器逻辑应放在那里，
而不是这里，除非用户将工作范围限定在包这一层。仍然保留在
TypeScript 和 JavaScript 中的内容有：

- `apps/ccusage/src/cli.js` — 原生二进制启动器，由其旁边的 `cli.test.ts` 覆盖。
- `apps/ccusage/scripts/generate-large-fixture.ts` — 基准测试夹具生成器，通过 `just generate-large-fixture` 运行；它借助 Nix shebang 在 Bun 下执行，除它的 `bun-globals.d.ts` 之外，该目录的其余部分是 Nushell 和 Babashka。
- `nix/tools/models-dev-gen/` — models.dev 定价快照生成器；`just gen-models-dev-pricing` 重新运行它，`just gen-bun-nix` 刷新它的 `bun.nix`。
- `docs/.vitepress/config.ts` 以及根目录的 TypeScript 配置或脚本，前提是改动不仅仅涉及文档内容。

## 风格

除常规 TypeScript 实践之外：本地导入使用 `.ts` 扩展名、优先使用静态导入而非动态导入、文件路径使用 Node 路径工具、导出仅限于模块外部会用到的值。

类型字面量使用 `satisfies` 而不是 `as` 断言，这样多余或缺失的属性依然会导致类型检查失败——包括对象字面量、mock、配置对象、夹具数据、预期的行数据。在 mock 上下文上使用 `as any` 会完全失去这种检查。只有在 `satisfies` 无法表达该操作时才使用 `as`，例如从未类型化的外部边界收窄数据，或适配要求名义类型的 API，并且要将其保持在局部。

对于精确字面值或只读元组有助于发现错误的静态字面量数据，添加 `as const`，包括表驱动用例：

```ts
const reportCases = [
	{ type: 'daily', period: '2026-05-16' },
	{ type: 'monthly', period: '2026-05' },
] as const satisfies readonly ReportCase[];
```

对基于可辨识联合或字面量联合的 switch，在 default 分支用 `satisfies never` 收尾，这样新增的变体在对应分支存在之前会令类型检查失败。使用 `@ts-expect-error` 加一段简短说明来抑制错误，而不是 `@ts-ignore`，这样一旦底层错误消失，该抑制本身就会报错。

## 路由

- Node 测试：迭代期间使用 `just test-node`；布局与运行器接线见 `.agents/skills/testing/references/node-test.md`。
- 启动器、基准测试、打包脚本或原生 CLI 性能：`profile`。
- TypeScript 重复检查：`ast-grep` 或 `rg`。这里没有 similarity-ts 工作流。
- 仓库范围的格式化、类型检查及各类检查配方：`development`。
