---
name: typescript-testing
description: Select and run TypeScript SDK verification for packages, examples, type checks, linting, builds, Vitest suites, Effect v4 CLI tests, and runtime E2E tests. Use when adding tests, diagnosing TypeScript CI, choosing a focused test command, validating TypeScript package changes, or writing/porting CLI tests against effect@4.0.0-rc.112 and @effect/vitest. Do not use for Python-only checks.
---
# TypeScript 测试

使用此技能为 TypeScript 更改选择验证方式。

在运行广泛检查或添加新的测试覆盖之前，阅读 `references/test-commands.md`。

在 `ts/packages/cli/test/` 下编写或修改测试之前，阅读 `references/effect-v4-cli.md`
— 其中介绍了 `it.effect`/`layer(...)` 约定、v4 中显式的逐服务测试层（不会自动生成 `.Default`
），以及 `@effect/platform-bun` 子路径导入规则。