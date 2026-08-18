---
name: cli-developer
description: Use when building CLI tools, implementing argument parsing, or adding interactive prompts. Invoke for parsing flags and subcommands, displaying progress bars and spinners, generating bash/zsh/fish completion scripts, CLI design, shell completions, and cross-platform terminal applications using commander, click, typer, or cobra.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: devops
  triggers: CLI, command-line, terminal app, argument parsing, shell completion, interactive prompt, progress bar, commander, click, typer, cobra
  role: specialist
  scope: implementation
  output-format: code
  related-skills: devops-engineer
---
# CLI 开发者

## 核心工作流程

1. **分析 UX** — 识别用户工作流程、命令层级和常见任务。在编写代码前，先列出所有命令及其预期的 `--help` 输出进行验证。
2. **设计命令** — 规划子命令、标志、参数和配置。确认标志命名保持一致，且没有破坏现有签名。
3. **实现** — 使用适合该语言的 CLI 框架进行构建（参见下方的参考指南）。完成命令接入后，运行 `<cli> --help` 验证帮助文本是否正确显示，并运行 `<cli> --version` 确认版本输出。
4. **完善** — 添加补全、帮助文本、错误消息和进度指示器。验证颜色输出的 TTY 检测以及 SIGINT 的优雅处理。
5. **测试** — 运行跨平台冒烟测试；对启动时间进行基准测试（目标：<50ms）。

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| 设计模式 | `references/design-patterns.md` | 子命令、标志、配置、架构 |
| Node.js CLI | `references/node-cli.md` | commander、yargs、inquirer、chalk |
| Python CLI | `references/python-cli.md` | click、typer、argparse、rich |
| Go CLI | `references/go-cli.md` | cobra、viper、bubbletea |
| UX 模式 | `references/ux-patterns.md` | 进度条、颜色、帮助文本 |

## 快速入门示例

### Node.js（commander）

```js
#!/usr/bin/env node
// npm install commander
const { program } = require('commander');

program
  .name('mytool')
  .description('Example CLI')
  .version('1.0.0');

program
  .command('greet <name>')
  .description('Greet a user')
  .option('-l, --loud', 'uppercase the greeting')
  .action((name, opts) => {
    const msg = `Hello, ${name}!`;
    console.log(opts.loud ? msg.toUpperCase() : msg);
  });

program.parse();
```

有关 Python（click/typer）和 Go（cobra）的快速入门示例，请参阅 `references/python-cli.md` 和 `references/go-cli.md`。

## 约束

### 必须做到
- 将启动时间保持在 50ms 以内
- 提供清晰、可执行的错误消息
- 支持 `--help` 和 `--version` 标志
- 使用一致的标志命名约定
- 优雅地处理 SIGINT（Ctrl+C）
- 尽早验证用户输入
- 同时支持交互式和非交互式模式
- 在 Windows、macOS 和 Linux 上进行测试

### 严禁

- **不必要地阻塞同步 I/O** — 应改用异步读取或流式处理。
- **在输出将被管道传输时打印到 stdout** — 将日志/诊断信息写入 stderr。
- **在输出不是 TTY 时使用颜色** — 在应用颜色前进行检测：
  ```js
  // Node.js
  const useColor = process.stdout.isTTY;
  ```
  ```python
  # Python
  import sys
  use_color = sys.stdout.isatty()
  ```
  ```go
  // Go
  import "golang.org/x/term"
  useColor := term.IsTerminal(int(os.Stdout.Fd()))
  ```
- **破坏现有命令签名** — 将标志/子命令重命名视为破坏性变更。
- **要求在 CI/CD 环境中进行交互式输入** — 始终通过标志或环境变量提供非交互式回退方案。
- **硬编码路径或平台特定逻辑** — 应改用 `os.homedir()` / `os.UserHomeDir()` / `Path.home()`。
- **未提供 shell 补全就发布** — 上述三个框架都内置了补全生成功能。

## 输出模板

实现 CLI 功能时，请提供：
1. 命令结构（主入口、子命令）
2. 配置处理（文件、环境变量、标志）
3. 带错误处理的核心实现
4. Shell 补全脚本（如适用）
5. 对 UX 设计决策的简要说明

## 知识参考

CLI 框架（commander、yargs、oclif、click、typer、argparse、cobra、viper）、终端 UI（chalk、inquirer、rich、bubbletea）、测试（快照测试、E2E）、分发（npm、pip、homebrew、releases）、性能优化

[文档](https://jeffallan.github.io/claude-skills/skills/devops/cli-developer/)。