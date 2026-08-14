---
description: Implement new CLI commands in ts/packages/cli/ using Effect.ts patterns, service wiring, and @effect/cli declarations.
---
# 实现 CLI 命令

在 `ts/packages/cli/` 中实现新的命令和子命令。涵盖文件创建、Effect 模式、服务接线、选项声明、输出约定和注册。

## 适用场景

- 根据规范或设计实现新的 CLI 命令
- 向现有命令组添加子命令
- 将新命令接入命令树
- 了解现有命令的工作方式，以便扩展它们

有关 CLI **设计**（参数、标志、帮助文本、用户体验），请改为参阅 `create-cli` skill。
有关 CLI **端到端测试**，请改为参阅 `create-cli-e2e` skill。

## 架构

该 CLI 使用 `@effect/cli` 声明命令，使用 `effect` 作为运行时，并采用通过 Effect layers 进行依赖注入的面向服务架构。

有关完整的架构参考（服务、effects、模型、依赖项、vendor 子模块位置），请参阅 `ts/packages/cli/AGENTS.md`。

```
src/
├── bin.ts                    # Entry point — layer composition, error handling, runtime
├── commands/
│   ├── index.ts              # Command tree — registers all commands
│   ├── $default.cmd.ts       # Root command with global options (--log-level)
│   ├── version.cmd.ts        # Simple data command
│   ├── whoami.cmd.ts         # Data command with service dependency
│   ├── login.cmd.ts          # Complex command (options, spinner, polling)
│   ├── logout.cmd.ts         # Action command (no stdout data)
│   ├── upgrade.cmd.ts        # Action command (delegates to service)
│   ├── generate/
│   │   ├── generate.cmd.ts   # Parent command group for `composio generate`
│   │   ├── generate-py.cmd.ts # `composio generate py`
│   │   └── generate-ts.cmd.ts # `composio generate ts`
│   ├── manage/
│   │   └── manage.cmd.ts     # Parent command group for `composio manage`
│   ├── ts/
│   │   ├── ts.cmd.ts         # Existing TS generation internals, referenced from generate/
│   │   └── commands/
│   │       └── ts.generate.cmd.ts  # Reusable TS generation logic
│   └── py/
│       ├── py.cmd.ts         # Existing Python generation internals, referenced from generate/
│       └── commands/
│           └── py.generate.cmd.ts
├── services/                 # Effect services (dependency injection)
├── effects/                  # Reusable Effect computations
├── models/                   # Effect Schema definitions
├── generation/               # Code generation pipeline
├── effect-errors/            # Error capture and formatting
└── ui/                       # Terminal output helpers
```

### 文件命名约定

- 命令文件：`<name>.cmd.ts`（例如 `version.cmd.ts`、`login.cmd.ts`）
- 子命令实现文件：位于 `commands/` 内的 `<parent>.<name>.cmd.ts`（例如 `ts.generate.cmd.ts`）
- 父命令组：位于命令组层级的 `<name>.cmd.ts`（例如 `generate/generate.cmd.ts`、`manage/manage.cmd.ts`）
- 包装器子命令入口点也可以与其父命令组位于同一目录（例如 `generate/generate-py.cmd.ts`、`generate/generate-ts.cmd.ts`）

## 创建新命令
### 第 1 步：创建命令文件

创建 `src/commands/<name>.cmd.ts`。

**最小模板**（数据命令，无选项）：

```typescript
import { Command } from '@effect/cli';
import { Effect } from 'effect';
import { TerminalUI } from 'src/services/terminal-ui';

export const myCmd = Command.make('my-command', {}).pipe(
  Command.withDescription('Brief description of what the command does.'),
  Command.withHandler(() =>
    Effect.gen(function* () {
      const ui = yield* TerminalUI;

      // Compute result...
      const result = 'some-value';

      yield* ui.log.info(result);   // Decoration → stderr
      yield* ui.output(result);     // Data → stdout (for scripts)
    })
  )
);
```

**带选项的模板：**

```typescript
import { Command, Options } from '@effect/cli';
import { Effect, Option } from 'effect';
import { TerminalUI } from 'src/services/terminal-ui';
import { ComposioToolkitsRepository } from 'src/services/composio-clients';

// Define options at module level
const toolkitSlug = Options.text('toolkit').pipe(
  Options.withDescription('Toolkit slug to look up.')
);

const searchOpt = Options.optional(
  Options.text('search')
).pipe(
  Options.withDescription('Search query to filter results.')
);

export const myCmd = Command.make('my-command', { toolkitSlug, searchOpt }).pipe(
  Command.withDescription('Brief description.'),
  Command.withHandler(({ toolkitSlug, searchOpt }) =>
    Effect.gen(function* () {
      const ui = yield* TerminalUI;
      const client = yield* ComposioToolkitsRepository;

      yield* ui.intro('composio my-command');

      // Use options — searchOpt is Option<string>
      const search = Option.getOrUndefined(searchOpt);

      // Fetch data with spinner
      const result = yield* ui.withSpinner(
        'Fetching data...',
        client.getToolkits(),
        { successMessage: 'Done', errorMessage: 'Failed to fetch' }
      );

      // Output
      yield* ui.note(formatResult(result), 'Result');
      yield* ui.output(formatResult(result));
      yield* ui.outro('Done');
    })
  )
);
```

### 第 2 步：注册命令

将命令添加到 `src/commands/index.ts`：

```typescript
import { myCmd } from './my-command.cmd';

const $cmd = $defaultCmd.pipe(
  Command.withSubcommands([
    versionCmd,
    upgradeCmd,
    whoamiCmd,
    loginCmd,
    logoutCmd,
    generateCmd,
    manageCmd,
    myCmd,  // Add here
  ])
);
```

### 第 3 步：添加所需的服务层（如有）

如果你的命令使用了 `bin.ts` 中尚未提供的新服务，请添加其层：

```typescript
// In src/bin.ts
const layers = Layer.mergeAll(
  // ... existing layers
  MyNewServiceLive,  // Add if needed
);
```

大多数命令只使用已提供的服务。`ComposioToolkitsRepository` 服务由 `bin.ts` 中的 `ComposioToolkitsRepositoryCachedLive` 提供——你无需为基础存储库添加单独的层。

## 创建子命令组

对于类似 `composio manage toolkits list`、`composio manage toolkits info` 的命令：

### 第 1 步：创建目录结构

```
src/commands/manage/toolkits/
├── toolkits.cmd.ts              # Parent command group under `manage`
└── commands/
    ├── toolkits.list.cmd.ts     # composio manage toolkits list
    └── toolkits.info.cmd.ts     # composio manage toolkits info
```

### 第 2 步：创建父命令

`src/commands/manage/toolkits/toolkits.cmd.ts`：
```typescript
import { Command } from '@effect/cli';
import { toolkitsCmd$List } from './commands/toolkits.list.cmd';
import { toolkitsCmd$Info } from './commands/toolkits.info.cmd';

export const toolkitsCmd = Command.make('toolkits').pipe(
  Command.withDescription('Discover and inspect available toolkits.'),
  Command.withSubcommands([toolkitsCmd$List, toolkitsCmd$Info])
);
```

### 第 3 步：创建各个子命令

`src/commands/manage/toolkits/commands/toolkits.list.cmd.ts`：
```typescript
import { Command, Options } from '@effect/cli';
import { Effect, Option } from 'effect';
import { TerminalUI } from 'src/services/terminal-ui';
import { ComposioToolkitsRepository } from 'src/services/composio-clients';

const searchOpt = Options.optional(
  Options.text('search')
).pipe(
  Options.withDescription('Search toolkits by name or description.')
);

export const toolkitsCmd$List = Command.make('list', { searchOpt }).pipe(
  Command.withDescription('List available toolkits.'),
  Command.withHandler(({ searchOpt }) =>
    Effect.gen(function* () {
      const ui = yield* TerminalUI;
      const client = yield* ComposioToolkitsRepository;

      const toolkits = yield* ui.withSpinner(
        'Fetching toolkits...',
        client.getToolkits(),
        { successMessage: 'Toolkits loaded' }
      );

      // Format and output
      const output = toolkits
        .map(t => `${t.slug} - ${t.meta.description}`)
        .join('\n');

      yield* ui.log.info(output);
      yield* ui.output(output);
    })
  )
);
```

### 第 4 步：在 `manage/manage.cmd.ts` 中注册父命令

```typescript
import { Command } from '@effect/cli';
import { toolkitsCmd } from './toolkits/toolkits.cmd';

export const manageCmd = Command.make('manage').pipe(
  Command.withDescription('Manage existing Composio resources.'),
  Command.withSubcommands([
    // ... existing manage subcommands
    toolkitsCmd,
  ])
);
```

## 选项声明模式
选项使用 `@effect/cli` 的 `Options` API 在模块级别声明。上面的模板演示了最常见的类型（必填文本、可选文本）。有关其他选项类型，请参阅 `ts/vendor/effect/packages/cli/src/Options.ts`。

`Options.optional(Options.text(...))`（包装形式）和 `Options.text(...).pipe(Options.optional)`（管道形式）均有效。请选择可读性更好的形式。

### 常见模式：

```typescript
import { Options } from '@effect/cli';

// Boolean flag (with default)
const verbose = Options.boolean('verbose').pipe(
  Options.withDefault(false),
  Options.withDescription('Enable verbose output.')
);

// Text with alias
const output = Options.optional(
  Options.text('output')
).pipe(
  Options.withAlias('o'),
  Options.withDescription('Output path.')
);

// Choice from fixed set
const format = Options.choice('format', ['json', 'table', 'plain']).pipe(
  Options.withDefault('table'),
  Options.withDescription('Output format.')
);
```

### 在处理程序中使用选项

```typescript
Command.make('my-cmd', { search, verbose }).pipe(
  Command.withHandler(({ search, verbose }) =>
    Effect.gen(function* () {
      // search: Option<string> — use Option.getOrUndefined, Option.match, Option.isSome
      const searchValue = Option.getOrUndefined(search);

      // verbose: boolean — direct use
      if (verbose) { yield* Effect.logDebug('Verbose mode'); }
    })
  )
);
```

## 输出约定

请遵循 `ts/packages/cli/AGENTS.md` §「Output Conventions」中的输出约定（使用 `ui.output()` 将数据输出到 stdout，将装饰性内容输出到 stderr）。

**数据命令** — 生成脚本应捕获的值：

```typescript
yield* ui.note(apiKey, 'API Key');   // Decoration → stderr (pretty box)
yield* ui.output(apiKey);            // Data → stdout (scripts capture)
```

**操作命令** — 执行副作用，不产生数据：

```typescript
yield* ui.log.success('Logged out successfully.');
// NO ui.output() call — nothing for scripts to capture
```

## TerminalUI 加载指示器

`TerminalUI` 服务提供两种加载指示器 API。有关输出/装饰方法（`output`、`log.*`、`note`、`intro`、`outro`），请参阅 `ts/packages/cli/src/services/terminal-ui.ts`。

```typescript
// Automatic: wraps an Effect, auto-stops on success/error
const result = yield* ui.withSpinner(
  'Loading...',
  someEffect,
  { successMessage: 'Done!', errorMessage: 'Failed!' }
);

// Manual: full control over message updates
const result = yield* ui.useMakeSpinner('Loading...', spinner =>
  Effect.gen(function* () {
    yield* spinner.message('Step 1...');
    const data = yield* fetchStep1;
    yield* spinner.message('Step 2...');
    const result = yield* fetchStep2(data);
    yield* spinner.stop('All done!');
    return result;
  })
);
```

## 创建新服务

如果你的命令所需的功能未被现有服务涵盖（完整列表请参阅 `ts/packages/cli/AGENTS.md`）：

1. 在 `src/services/<name>.ts` 中定义服务接口和标签
2. 创建一个 `Live` 层实现
3. 在 `src/bin.ts` 中注册该层

简单的服务模式可参考 `src/services/upgrade-binary.ts`，带缓存的复杂服务模式可参考 `src/services/composio-clients.ts`。

## 错误处理模式

### 可选值

```typescript
yield* ctx.data.apiKey.pipe(
  Option.match({
    onNone: () => ui.log.warn('Not logged in. Run `composio login`.'),
    onSome: apiKey =>
      Effect.gen(function* () {
        yield* ui.output(apiKey);
      }),
  })
);
```

### 使用 catchTag 处理类型化错误

```typescript
yield* client.getToolkitsBySlugs(slugs).pipe(
  Effect.catchTag('services/InvalidToolkitsError', error =>
    Effect.gen(function* () {
      yield* ui.log.error(`Invalid toolkits: ${error.invalidToolkits.join(', ')}`);
      return yield* Effect.fail(error);
    })
  )
);
```

### 记录非致命错误

```typescript
yield* riskyOperation.pipe(
  Effect.catchAll(error =>
    Effect.logWarning(`Non-critical failure: ${error.message}`)
  )
);
```

## 并行获取数据

使用带有 `concurrency` 配置的 `Effect.all` 并行调用 API：

```typescript
const [toolkits, tools, triggerTypes] = yield* Effect.all(
  [
    client.getToolkits(),
    client.getTools(slugs),
    client.getTriggerTypes(slugs),
  ],
  { concurrency: 'unbounded' }
);
```

## 提取可复用逻辑

对于共享逻辑的命令（例如，`composio generate` 委托给 `composio generate ts`）：
```typescript
// In ts.generate.cmd.ts — export the logic separately
export function generateTypescriptTypeStubs(params: { ... }) {
  return Effect.gen(function* () {
    const ui = yield* TerminalUI;
    // ... implementation
  });
}

// The command uses it
export const tsCmd$Generate = Command.make('generate', { ... }).pipe(
  Command.withHandler(params => generateTypescriptTypeStubs(params))
);

// Other commands can reuse it
// In generate/generate-ts.cmd.ts
import { generateTypescriptTypeStubs } from '../ts/commands/ts.generate.cmd';
yield* Match.value(envLang).pipe(
  Match.when('TypeScript', () => generateTypescriptTypeStubs({ ... })),
  Match.when('Python', () => generatePythonTypeStubs({ ... })),
  Match.exhaustive
);
```

## 使用指数退避进行重试

对于轮询操作（例如，等待 OAuth）：

```typescript
import { Schedule } from 'effect';

const result = yield* ui.useMakeSpinner('Waiting...', spinner =>
  Effect.retry(
    Effect.gen(function* () {
      const status = yield* client.getSession(session);
      if (status.status === 'linked') return status;
      return yield* Effect.fail(new Error('Still pending'));
    }),
    Schedule.exponential('0.3 seconds').pipe(
      Schedule.intersect(Schedule.recurs(15)),
      Schedule.intersect(Schedule.spaced('5 seconds'))
    )
  ).pipe(
    Effect.tap(() => spinner.stop('Success!')),
    Effect.tapError(() => spinner.error('Timed out'))
  )
);
```

## 检查清单

实现新命令时：

1. 创建 `src/commands/<name>.cmd.ts`（对于子命令，则创建 `src/commands/<group>/commands/<group>.<name>.cmd.ts`）
2. 使用 `Options.*` 在模块级别定义选项
3. 使用 `Command.make(name, options).pipe(Command.withDescription(...), Command.withHandler(...))` 创建命令
4. 在处理函数中，使用 `yield* ServiceName` 解析服务
5. 遵循输出约定：使用 `ui.output()` 输出数据，使用 `ui.log.*` 输出修饰性内容
6. 在 `src/commands/index.ts` 中注册（或在父命令组的命令文件中注册）
7. 如果使用新服务，请将其层添加到 `src/bin.ts`
8. 通过构建进行验证：`cd ts/packages/cli && pnpm build`
9. 为新命令添加录制内容（参见下方的**录制**部分）

如果构建失败，请检查：(1) 是否缺少服务导入；(2) 是否在预期为 `string` 的位置使用了 `Option<string>`（使用 `Option.getOrUndefined` 或 `Option.match`）；(3) 命令是否未从其文件中导出。

## 录制

新命令应包含用于文档的 VHS 录制内容。录制会生成用于演示命令实际运行效果的 SVG 和 asciicast。

### 第 1 步：向 recordings.yaml 添加条目

在 `ts/packages/cli/recordings/recordings.yaml` 中的适当分组下添加录制条目：

```yaml
recordings:
  my-command:
    - name: help
      description: Show my-command help
      command: "composio my-command --help"
      height: dynamic  # Use for commands whose output exceeds 750px

    - name: basic
      description: Run my-command with default options
      command: "composio my-command"
```

每个条目包含：
- `name` — 录制文件的文件名（会生成 `<name>.svg`、`<name>.ascii`、`<name>.tape`）
- `command` — 要录制的确切 shell 命令
- `description` —（可选）即时显示在命令上方的注释
- `sleepAfterEnter` —（可选）覆盖按下 Enter 后的默认等待时间（默认值：`6s`）
- `height` —（可选）设为 `'dynamic'`，通过两遍录制自动调整大小；也可设为固定的像素数。省略时使用默认高度（750px）

对于会产生较长输出的命令（帮助文本、完整列表），请使用 `height: dynamic`。对于输出较短的命令（版本、无结果、受限查询），使用固定高度即可。

### 第 2 步：运行录制器

```bash
cd ts/packages/cli
bun scripts/record.ts
```

需要在环境中设置 `COMPOSIO_API_KEY`，并确保 `vhs` 和 `composio` 位于 `PATH` 中。

### 输出结构

```
recordings/
├── recordings.yaml                    # Config
├── tapes/<group>/<name>.tape          # Generated VHS tape files (committed)
├── svgs/<group>/<name>.svg            # SVG recordings
└── ascii/<group>/<name>.ascii         # Asciicast recordings
```

## 参考文件

| 文件 | 用途 |
|---|---|
| `src/commands/version.cmd.ts` | 最简单的命令（无选项，除 TerminalUI 外不使用其他服务） |
| `src/commands/whoami.cmd.ts` | 带有服务依赖的数据命令 |
| `src/commands/login.cmd.ts` | 复杂命令（选项、加载指示器、轮询、重试） |
| `src/commands/logout.cmd.ts` | 操作命令（无 stdout 数据） |
| `src/commands/upgrade.cmd.ts` | 委托给服务的操作命令 |
| `src/commands/generate/generate.cmd.ts` | 父级 `generate` 命令和委托入口点 |
| `src/commands/manage/manage.cmd.ts` | 父级 `manage` 命令和子命令注册 |
| `src/commands/ts/commands/ts.generate.cmd.ts` | 供 `generate ts` 使用的可复用 TS 生成逻辑 |
| `src/commands/index.ts` | 命令树注册 |
| `src/bin.ts` | 入口点、层组合、错误处理 |
| `src/services/terminal-ui.ts` | TerminalUI 服务接口 |
| `src/services/composio-clients.ts` | API 客户端服务（HTTP、分页、指标） |
| `ts/packages/cli/AGENTS.md` | CLI 架构、服务、Effect、输出约定 |