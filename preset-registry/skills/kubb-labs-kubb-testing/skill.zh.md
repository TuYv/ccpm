---
name: testing
description: Testing, CI, and troubleshooting guidance for running the repository's test suite and interpreting CI failures.
---
# 测试 Skill

此 Skill 可帮助 Agent 就运行测试、满足 CI 要求以及调试测试或类型检查失败提供建议。

## 何时使用

- 当用户询问如何运行测试或调试失败的 CI 时
- 当说明合并前需要完成哪些检查时

## 功能

- 说明测试运行器和 CI 所在位置
- 列出要在本地运行的命令
- 提供常见失败的故障排查提示

## 建议使用的命令

```bash
pnpm test                 # Run all tests
pnpm test "<test name>"  # Run a specific test
```

## 断言风格

对于完整值断言，优先使用带有显式字面量的 `toStrictEqual`（或 `toEqual`）。
它会内联说明预期结果，能够捕获多余的键或值为 `undefined` 的键，并且不会在
有人运行 `vitest -u` 时悄无声息地发生偏移。

- 使用 `toStrictEqual(literal)` 断言完整返回的对象/数组。
- 对于特定的行为检查，使用聚焦的匹配器（`toBe`、`toHaveLength`、`toContain`、单字段
  `toEqual`）——不要对这些检查使用快照。
- 仅将 `toMatchInlineSnapshot` / `toMatchFileSnapshot` 用于大型生成输出
  （例如生成的源文件），即手动维护字面量不切实际的情况——不要用于中小型结构化值。

## 合并前要求（Agent 应提醒）

- 所有测试都必须通过
- `pnpm typecheck` 必须在所有软件包中成功执行
- 代码检查应无问题（`pnpm lint`）

## 故障排查提示

- 移动文件或更改导入后，运行 `pnpm lint && pnpm typecheck`
- 对于不稳定的测试：建议重新运行 CI，并检查日志中是否存在特定于环境的失败