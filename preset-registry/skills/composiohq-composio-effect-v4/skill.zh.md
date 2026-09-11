---
name: effect-v4
description: Write, review, or upgrade Effect v4 code in the Composio CLI, cli-keyring, and json-schema-to-effect-schema packages, all pinned exactly to effect@4.0.0-rc.112 — Context.Service and explicit layers, Schema.TaggedError and typed recovery, the effect/unstable/cli command surface, and the vendored effect source oracle. Use when writing or reviewing Effect v4 code, answering a v4 API question, working in effect/unstable/cli, defining a Context.Service service, modeling an error with Schema.TaggedError, bumping the Effect prerelease pins, or verifying an unfamiliar API against ts/vendor/effect. Do not use for CLI command UX/wiring design (use cli-command) or CLI E2E tests (use cli-e2e).
---
# Effect v4

CLI、`@composio/cli-keyring` 和 `@composio/json-schema-to-effect-schema` 基于 Effect v4（候选发布版）运行。以下每项声明都以迁移后的源代码为依据，而非凭借对 v3 的记忆。

## 确切版本矩阵

`effect`、`@effect/platform-bun` 和 `@effect/vitest`
固定为完全相同的 **`4.0.0-rc.112`**，绝不能使用 `^`、`@next`，也不能在不同软件包之间使用不匹配的预发布版本。`@effect/cli` 和 `@effect/platform` 不再作为依赖存在；其 API 已整合到 `effect` 和 `effect/unstable/*` 中。完整矩阵（还包括 `typescript`、`vitest`）请参阅 [versions.json](versions.json)。

## 后续阅读

- [references/core-patterns.md](references/core-patterns.md) — 服务、层、类型化错误、Schema、`Effect.gen` 与 `Effect.fn` 的选择，以及 v3→v4 重命名表（标记为历史内容，用于识别过时模式）。
- [references/cli-surface.md](references/cli-surface.md) — `effect/unstable/cli`：`Command`、`Flag`、`Argument`、`GlobalFlag`、`CliConfig`、自定义的 `CliOutput.Formatter`，以及运行器的双重打印规则。
- [references/upgrade-workflow.md](references/upgrade-workflow.md) — 升级到更新预发布版本的流程。

这些参考文档中的代码摘录均来自仓库中真实且当前可编译的文件（每段摘录处都注明了路径），并非独立示例。经过编译检查的事实来源始终是所引用的文件本身；当文件内容与参考文档不一致时，应以文件为准并修正参考文档。

## 不可妥协的要求

- 对于 effect 值，使用 `Effect.gen(function* () {...})` —— 包括具名模块常量，这是主要形式；对于带参数的辅助函数，使用 `(params) => Effect.gen(...)`。
  `Effect.fn(...)` 是函数形式，其 effect 会携带堆栈帧注解（可选的名称字符串会为每次调用添加一个跟踪 span）；对于服务成员和应当能在错误报告中追溯来源的组合器回调，这种形式很有价值。所有形式都会在每次执行时重新运行其函数体。参见 core-patterns 中的 "`Effect.gen` vs `Effect.fn`"。
- 使用 `Context.Service` 定义服务，并通过 `Layer.succeed`/`Layer.effect`/`Layer.provide` 显式构建 `static readonly Default`/`layer` 层。V4 不会自动为你生成层。
- 使用 `Schema.TaggedError`（如果不需要 Schema 字段，也可以使用普通的 `Data.TaggedError`）来建模预期失败，并使用 `Effect.catchTag`/`catchTags`/`Match` 恢复，绝不能手动比较 `_tag` 字符串。
- 使用 `Effect.tryPromise({ try, catch })` 包装可能失败的 Promise；`Effect.promise` 会将 rejection 转换为 defect。在 Effect 工作流中不得使用 `async`/`await` 或 `try`/`catch` —— `ts/packages/cli/src` 中的 ESLint 会禁止这些写法。
- 在根据记忆使用任何 v3 软件包名称和 API 之前，都必须先对照 `ts/vendor/effect`（只读的源代码事实来源，绝不编辑或从中导入）以及已安装的 `effect@4.0.0-rc.112` 类型定义进行验证。源代码可能领先于已发布的软件包；编译器是兼容性的门槛。

## 验证

```bash
pnpm typecheck
pnpm --filter @composio/cli test
```

编辑此 skill 或其描述后，运行 `pnpm validate:agent-skills` 和 `pnpm validate:skill-routing`，并使用以下命令，针对固定版本的软件包编译此 skill 中的 TypeScript 代码块以及 `typescript-testing/references/effect-v4-cli.md` 中的 TypeScript 代码块：

```bash
node .agents/skills/effect-v4/scripts/check-examples.mjs
```

引用仓库文件且包含无法解析的导入的代码块，其 fence 信息字符串为 `no-check`。