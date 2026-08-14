---
description: CLI design guidelines — arguments, flags, subcommands, help, output, errors, interactivity, config precedence. Apply when designing new commands or reviewing CLI UX.
globs:
  - "ts/packages/cli/src/**/*.ts"
alwaysApply: false
---
# CLI 设计指南

设计 CLI 的表层接口（语法 + 行为），以人为本，同时便于脚本使用。
改编自 [clig.dev](https://clig.dev/)，适用于我们的 TypeScript + Effect.ts + Clack 技术栈。

## 何时使用

- 设计 CLI 规范（实现之前）或重构 CLI 的表层接口。
- 添加新命令、标志或交互式提示。
- 评审 CLI 用户体验决策。

设计命令后，使用 `implement-cli-command` skill 来构建它。
实现后，使用 `create-cli-e2e` skill 编写端到端测试。

## 技术栈与架构

完整的架构参考请参阅 `ts/packages/cli/AGENTS.md`，其中包括依赖项、服务、effect 和供应商子模块的位置。

## 输出约定

CLI 将人类可读的装饰性内容与机器可读的数据分开。完整规范请参阅 `ts/packages/cli/AGENTS.md` §“输出约定”。

关键规则：添加命令时，请问：“它是否会产生脚本应当捕获的值？”
- **是** → 使用 `ui.output(value)` 输出数据，使用 `ui.log.*` / `ui.note()` 输出上下文。
- **否** → 仅使用 `ui.log.*` / `ui.note()` / `ui.intro()` / `ui.outro()`。

**显示状态变更。** 当命令修改状态时，说明发生了什么变化以及新的状态：

```typescript
// After logout:
yield* ui.log.info('Removed API key from ~/.composio/user-config.json');

// After generate:
yield* ui.log.success('Generated 42 tools across 5 toolkits → src/generated/');
```

## 参数与标志

通过 `@effect/cli` 定义选项：

```typescript
const toolkits = Options.text('toolkits').pipe(
  Options.optional,
  Options.withDescription('Comma-separated toolkit slugs'),
);
const force = Options.boolean('force').pipe(
  Options.withAlias('f'),
  Options.withDefault(false),
);
```

原则：
- 为了清晰性和可扩展性，优先使用标志而非位置参数。
- 为所有标志提供长名称版本；仅为最常用的标志提供单字母别名。
- 默认值应适合大多数用户。
- 切勿通过标志接收密钥——它们会泄露到 `ps` 输出和 shell 历史记录中。应改用 `--password-file`、stdin 或密钥管理器。
- 当输入/输出为文件路径时，支持使用 `-` 表示 stdin/stdout。

标准标志名称：

| 标志 | 简写 | 用途 |
| ---- | ----- | ------- |
| `--help` | `-h` | 显示帮助（由 @effect/cli 内置提供） |
| `--version` | | 将版本打印到 stdout |
| `--quiet` | `-q` | 减少输出 |
| `--verbose` | `-v` | 增加输出（切勿将 `-v` 用于版本） |
| `--debug` | `-d` | 调试输出 |
| `--force` | `-f` | 跳过确认 |
| `--dry-run` | `-n` | 仅预览 |
| `--json` | | 结构化输出 |
| `--output` | `-o` | 输出文件路径 |
| `--no-input` | | 禁用提示；如果缺少必需输入则失败 |
| `--no-browser` | | 跳过打开浏览器的步骤 |
| `--no-color` | | 禁用彩色输出 |

## 子命令

```typescript
const login = Command.make('login', { noBrowser }, handler);
const generate = Command.make('generate', { toolkits, typeTools }, handler);
const root = Command.make('composio').pipe(
  Command.withSubcommands([login, generate, /* ... */]),
);
```

- 始终遵循动词-名词模式：`composio login`、`composio generate`。
- 通过父命令组合共享全局标志。
- 支持 `composio help <subcmd>` 和 `composio <subcmd> --help`。
- 避免使用含义模糊的命令对（如 `update` 与 `upgrade`），除非二者有明确区别。

## 交互性

所有交互式 UI 均使用 `@clack/prompts`。所有 Clack 输出都通过 `{ output: process.stderr }` 发送到 stderr。

| 提示 | 使用场景 |
| ------ | ----------- |
| `text()` | 自由格式文本输入 |
| `password()` | 密钥输入（禁用回显） |
| `confirm()` | 是/否决策 |
| `select()` | 从列表中选择一项 |
| `multiselect()` | 从列表中选择多项 |
| `spinner()` | 长时间运行的操作 |
| `log.info/warn/error/step()` | 带样式的状态消息 |
| `note()` | 以方框展示的上下文信息 |
| `intro()` / `outro()` | 会话开始/结束标记 |

规则：
- 仅当 stdin 是 TTY 时才显示提示。
- `--no-input`：绝不显示提示；如果缺少必需输入，则失败并显示可操作的消息。
- 明确提示退出方式（Ctrl-C）。
- 破坏性操作：交互模式下要求确认，非交互模式下要求使用 `--force`。

## 错误处理

- 使用 `effect-errors/` 模块捕获错误并设置格式。
- 捕获预期错误并将其改写为用户易于理解的内容；默认不显示堆栈跟踪。
- 将最重要的信息放在最后；有意识地使用红色。
- 对于意外崩溃：提供调试信息路径和错误报告说明。

**编写可操作的错误消息。** 告诉用户*哪里出了问题*以及*如何修复*：

```
// Bad:
Error: EACCES

// Good:
Can't write to ~/.composio/user-config.json.
You might need to fix permissions: chmod +w ~/.composio/user-config.json

// Bad:
Error: 401

// Good:
API key is invalid or expired.
Run `composio login` to authenticate again.
```

当用户输错子命令或标志时，**建议更正**。如果用户运行了 `composio genrate`，则建议使用 `composio generate`。

退出代码：

| 代码 | 含义 |
| ---- | ------- |
| `0` | 成功 |
| `1` | 一般性失败 |
| `2` | 用法无效（解析/验证错误） |

## 帮助与文档

- `@effect/cli` 根据 Command/Options 声明生成帮助文本。
- 如果运行时缺少必需参数，则显示简洁的帮助信息、1–2 个示例，以及“使用 --help 获取更多信息”。
- 优先展示示例；先显示常用标志。
- 在适用时为每个子命令提供文档 URL 链接。
- 同时提供终端帮助（离线、与版本同步）和 Web 文档（可搜索、可链接）。

良好的帮助文本结构：

```
USAGE
  $ composio generate [--toolkits <slugs>] [--type-tools]

OPTIONS
  --toolkits <slugs>   Comma-separated toolkit slugs (default: all)
  --type-tools         Generate full type definitions
  -o, --output <dir>   Output directory (default: @composio/core/generated)

EXAMPLES
  $ composio generate
  $ composio generate --toolkits github,slack --type-tools

COMMANDS
  composio generate ts   Generate TypeScript stubs
  composio generate py   Generate Python stubs
```

当有助于用户继续操作流程时，**建议接下来可运行的命令**：

```
✔ Logged in as user@example.com
  Next: run `composio generate` to generate type stubs for your toolkits.
```

## 配置优先级

从高到低：**命令行标志 > 进程环境变量 > 项目配置 > 用户配置 > 系统配置**。

- Composio 前缀：应用配置使用 `COMPOSIO_*`，调试配置使用 `DEBUG_OVERRIDE_*`。
- 用户配置存储在 `~/.composio/` 中。
- 遵循常见环境变量：`NO_COLOR`、`DEBUG`、`EDITOR`、`PAGER`、`TERM`、`TMPDIR`、`HOME`。

## 命名

- 子命令名称：简单、小写，并尽可能使用单个单词。
- 避免使用过于通用、可能与系统工具冲突的名称。
- 名称应简短但不能晦涩——易于输入很重要。
- 绝不要创建隐式的全匹配子命令，以免妨碍未来扩展。
- 不要允许任意缩写（将 `g` 预留给 `generate` 会阻碍未来添加其他以 `g` 开头的命令）。
- 仅在映射关系明确且稳定时使用显式别名。

## 健壮性与性能

- 尽早验证；快速失败，并提供清晰的错误消息。
- 在约 100 毫秒内输出内容（尤其是在网络 I/O 之前）。在进行任何网络调用之前，立即启动 Clack 加载指示器。
- 对耗时较长的任务，通过 Clack 加载指示器显示进度（仅限交互模式）。
- 为网络调用设置超时；允许配置超时时间。
- 确保重复运行安全：尽可能实现幂等；失败后可恢复。
- **仅崩溃式设计**：假定清理操作可能不会执行。将清理工作推迟到下一次调用，而不是依赖关闭钩子。如果缓存文件只写入了一部分，下一次运行应检测到并重建该文件。

## 调用示例

```bash
# Interactive — user sees Clack decoration on stderr
composio login
composio generate --toolkits github,slack

# Piped — only data on stdout, no decoration
composio whoami | pbcopy
API_KEY=$(composio whoami)
composio version | cat

# Non-interactive with force
composio logout --force --no-input

# Debug mode
composio generate --debug --verbose
```

## 参考资料

- 社区 CLI 指南：https://clig.dev/
- CLI 架构：`ts/packages/cli/AGENTS.md`
- @effect/cli 源代码：`ts/vendor/effect/packages/cli/src/`
- @clack/prompts 源代码：`ts/vendor/clack/packages/prompts/src/`