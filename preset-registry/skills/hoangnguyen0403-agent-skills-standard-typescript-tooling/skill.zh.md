---
name: typescript-tooling
description: Development tools, linting, and build config for TypeScript. Use when configuring ESLint, Prettier, Jest, Vitest, tsconfig, or any TS build tooling.
metadata:
  triggers:
    files:
    - 'tsconfig.json'
    - '.eslintrc.*'
    - 'jest.config.*'
    - 'package.json'
    keywords:
    - eslint
    - prettier
    - jest
    - vitest
    - build
    - compile
    - lint
---
# TypeScript 工具链

## **优先级：P1（高）**

## 实施指南

- **编译器**：CI 构建使用 `tsc`；开发环境使用 `esbuild` 或 `ts-node`。
- **代码检查**：强制使用带有 `@typescript-eslint/recommended` 的 `ESLint`。启用严格类型检查。
- **格式化**：通过 `lint-staged` 和 `.prettierrc` 强制使用 `Prettier`。
- **测试**：使用 `Vitest`（或 `Jest`）进行单元测试/集成测试。目标行覆盖率 > 80%。
- **构建**：使用 `tsup`（库打包）或 `Vite`（Web 应用程序）。
- **TypeScript 配置**：长期目标是启用 `strict: true`。对于现有项目，应逐步迁移：先启用 `strictNullChecks`，然后启用 `noImplicitAny`、`strictFunctionTypes`。不要一次性切换到 `strict: true`。
- **CI/CD**：始终在构建流水线中运行 `tsc --noEmit`，以捕获类型错误。
- **错误抑制**：对于有文档说明的边界情况，优先使用 `@ts-expect-error`，而不是 `@ts-ignore`。

## ESLint 配置

至少启用 `@typescript-eslint/recommended`。当 tsconfig 中的 `strict: false` 时，`no-unsafe-*` 规则可能会产生过多干扰信息——应使用 `@ts-expect-error` 进行选择性抑制，而不是全局禁用。

有关常见代码检查问题（请求类型、未使用的参数、测试模拟类型）和 tsconfig 迁移示例，请参阅[参考文档](references/REFERENCE.md)。

## 验证工作流（强制）

编辑任何 `.ts` / `.tsx` 文件后：

1. 调用 `getDiagnostics`（typescript-lsp MCP 工具）——实时显示类型错误。
2. 在 CI 中运行 `tsc --noEmit`——捕获 LSP 可能遗漏的项目级错误。
3. 运行 `eslint --fix`——自动修复格式和代码检查违规问题。

> **typescript-lsp MCP 未配置时的后备方案**：直接运行 `tsc --noEmit`。

`getDiagnostics` 可提供最快的反馈循环。每次提交前，都应对修改过的文件使用它。使用 `getHover` 检查推断类型，在重命名符号之前使用 `getReferences`。

## 反模式

- **禁止使用 `@ts-ignore`**：使用 `@ts-expect-error`——它能以自解释的方式表明意图，并在错误消失时使检查失败。
- **请求对象禁止使用 `any`**：从 `src/common/interfaces/` 导入集中定义的接口。
- **禁止全局使用 `eslint-disable`**：按行抑制；应改为修复根本原因。
- **现有代码库禁止一次性切换到 `strict: true`**：应从 `strictNullChecks` 开始逐步迁移。

## 参考资料

- [配置示例与代码检查模式](references/REFERENCE.md)