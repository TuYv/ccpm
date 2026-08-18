---
name: go-cli
description: >
  Build command-line tools in Go: flag handling, subcommands, stdin/stdout
  discipline, exit codes, signal handling, and when Cobra/Viper earn their
  weight over the standard library. Use when: "build a CLI", "add a
  subcommand", "parse flags", "exit codes", "handle Ctrl+C", "cobra
  command", "read from stdin", "CLI UX".
  Not for: HTTP APIs (go-api-design), scaffolding (go-project-layout),
  service configuration (go-architecture-review).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go CLI 设计

优秀的 CLI 是一个行为规范的 Unix 公民：选项先于魔法，stdout
用于数据，stderr 用于诊断，退出码值得脚本信赖，并且 Ctrl+C
确实能够停止程序。

## 1. 结构：可测试的 main

```go
func main() {
    ctx, stop := signal.NotifyContext(context.Background(),
        os.Interrupt, syscall.SIGTERM)
    defer stop()

    if err := run(ctx, os.Args[1:], os.Stdin, os.Stdout, os.Stderr); err != nil {
        fmt.Fprintln(os.Stderr, "error:", err)
        os.Exit(1)
    }
}

func run(ctx context.Context, args []string, stdin io.Reader, stdout, stderr io.Writer) error {
    fs := flag.NewFlagSet("mytool", flag.ContinueOnError)
    fs.SetOutput(stderr)
    verbose := fs.Bool("v", false, "verbose output")
    out := fs.String("o", "-", "output file (- for stdout)")
    if err := fs.Parse(args); err != nil {
        return err
    }
    // ...
    _ = verbose
    _ = out
    return nil
}
```

- `signal.NotifyContext` 会让 Ctrl+C 取消上下文——每个长时间运行的操作都接收 `ctx`，并干净地停止。
- `run` 接收参数和流——测试可以直接使用 `strings.Reader`/`bytes.Buffer` 调用它，无需子进程。
- `os.Exit` 只出现在 `main` 中（它会跳过 defer）。

## 2. stdout 与 stderr

- **stdout**：程序的输出——数据、结果，以及你要通过管道传递的内容。
- **stderr**：日志、进度、警告和用法错误。
- `--json` 或检测是否连接了管道（`!term.IsTerminal(int(os.Stdout.Fd()))`）
  应当静默装饰性内容，绝不能改变数据。

```go
// ✅ Good — result to stdout, progress to stderr
fmt.Fprintf(stderr, "processed %d files\n", n)
fmt.Fprintln(stdout, result)

// ❌ Bad — mixing both into stdout breaks every pipe
fmt.Printf("processing...\ndone: %s\n", result)
```

## 3. 退出码

| Code | Meaning |
|---|---|
| 0 | 成功 |
| 1 | 通用运行时失败 |
| 2 | 用法错误（错误的选项/参数）——flag package 的约定 |
| >2 | 工具特定的、有文档说明的含义（例如 grep 的 1 = 未匹配） |

在一个地方（`main`）将错误映射为退出码，而不要散落 `os.Exit`
调用。如果脚本需要根据不同失败情况进行分支处理，请定义哨兵错误并进行转换：`errors.Is(err, ErrNoMatch) → 1`。

## 4. 选项和参数

- 选项用于配置，位置参数用于主要操作数：
  `mytool -v convert input.yaml`，而不是 `mytool --input=input.yaml`。
- 每个选项都要有用法字符串；`-h`/`-help` 输出是首要的用户体验。
- 对于文件参数，接受 `-` 表示“stdin/stdout”。
- 默认行为必须安全：破坏性行为必须通过显式选项启用（`--force`），绝不能默认开启。
- 从环境变量或文件中读取机密信息，绝不要从选项中读取（`ps` 会泄露 argv）。

## 5. 子命令

标准库足以应对少量命令：

```go
switch fs.Arg(0) {
case "serve":
    return runServe(ctx, fs.Args()[1:], stdout, stderr)
case "migrate":
    return runMigrate(ctx, fs.Args()[1:], stdout, stderr)
default:
    fmt.Fprintln(stderr, usage)
    return fmt.Errorf("unknown command %q", fs.Arg(0))
}
```

当你需要嵌套命令、生成帮助信息/补全内容以及大量选项时，采用 **Cobra**——这种结构足以抵消引入依赖的代价：

```go
var rootCmd = &cobra.Command{Use: "mytool", SilenceUsage: true}

var serveCmd = &cobra.Command{
    Use:   "serve",
    Short: "Start the server",
    RunE: func(cmd *cobra.Command, args []string) error {
        return serve(cmd.Context(), addr) // RunE returns errors; no os.Exit
    },
}

func init() {
    serveCmd.Flags().StringVar(&addr, "addr", ":8080", "listen address")
    rootCmd.AddCommand(serveCmd)
}
```

Cobra 规则：始终使用 `RunE`（不要使用 `Run` + `os.Exit`），设置
`SilenceUsage: true`，这样运行时错误不会转储帮助信息，并向下传递
`cmd.Context()`。仅当确实需要分层配置
（flags > env > file）时才添加 Viper——对于大多数工具，
`flag` + `os.Getenv` 就足够了。

## 6. 面向人类和机器的输出

- 使用 `--json` 标志供机器消费；默认面向人类使用表格/文本格式。
- 当 stdout 不是终端或设置了 `NO_COLOR` 时，绝不输出 ANSI 颜色。
- 进度条/加载动画输出到 stderr，并且仅在 stdout 是终端时显示。

## 验证清单

1. `run(ctx, args, stdin, stdout, stderr)` 模式——无需子进程即可测试逻辑
2. 已接入 `signal.NotifyContext`；长时间运行的操作遵守 ctx 取消
3. 数据输出到 stdout，诊断信息输出到 stderr——通过管道传输进行验证
4. 退出码：成功为 0，使用错误为 2，其他情况使用已记录的退出码；仅在 main 中使用 `os.Exit`
5. 每个标志都有使用说明；已检查 `-h` 输出
6. 接受 `-` 作为 stdin/stdout 的输入输出目标（对于涉及文件的操作）
7. 破坏性操作要求显式标志
8. 不通过 argv 传递机密信息
9. Cobra（如果使用）：所有地方都使用 RunE，设置 SilenceUsage，传递 context
10. 对于非 TTY 和 NO_COLOR，禁用颜色/加载动画