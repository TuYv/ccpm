---
name: go-cli
description: >
  Build command-line tools in Go: flag handling, subcommands, stdin/stdout
  discipline, exit codes, signal handling, and when Cobra/Viper earn their
  weight over the standard library.
  Use when: "build a CLI", "add a subcommand", "parse flags", "exit codes",
  "handle Ctrl+C", "cobra command", "read from stdin", "CLI UX".
  Do NOT use for: HTTP API design (use go-api-design), project scaffolding
  in general (use go-project-layout), or configuration of services
  (use go-architecture-review).
license: MIT
metadata:
  version: "1.0.0"
---
# Go CLI 设计

一个优秀的 CLI 应当是行为规范的 Unix 公民：优先使用明确的标志而非魔法行为，将数据输出到 stdout，将诊断信息输出到 stderr，提供脚本可以信赖的退出码，并且按下 Ctrl+C 时能够真正停止运行。

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

- `signal.NotifyContext` 会让 Ctrl+C 取消上下文——每个耗时较长的操作都接收 `ctx` 并干净地停止。
- `run` 接收参数和流——测试可以直接使用 `strings.Reader`/`bytes.Buffer` 调用它，无需启动子进程。
- `os.Exit` 只在 `main` 中调用（它会跳过 defer）。

## 2. stdout 与 stderr

- **stdout**：程序的输出——数据、结果，也就是通过管道传递的内容。
- **stderr**：日志、进度、警告、用法错误。
- `--json` 或检测到管道（`!term.IsTerminal(int(os.Stdout.Fd()))`）时，应隐藏装饰性内容，但绝不能改变数据。

```go
// ✅ Good — result to stdout, progress to stderr
fmt.Fprintf(stderr, "processed %d files\n", n)
fmt.Fprintln(stdout, result)

// ❌ Bad — mixing both into stdout breaks every pipe
fmt.Printf("processing...\ndone: %s\n", result)
```

## 3. 退出码

| 代码 | 含义 |
|---|---|
| 0 | 成功 |
| 1 | 通用运行时失败 |
| 2 | 用法错误（错误的标志/参数）——flag 包的约定 |
| >2 | 工具特有且有文档说明的含义（例如 grep 的 1 = 无匹配） |

应在一个地方（`main`）将错误映射为退出码，而不是在各处零散调用 `os.Exit`。如果脚本需要根据不同的失败类型执行分支逻辑，请定义哨兵错误并进行转换：`errors.Is(err, ErrNoMatch) → 1`。

## 4. 标志与参数

- 选项使用标志，主要操作数使用位置参数：使用 `mytool -v convert input.yaml`，而不是 `mytool --input=input.yaml`。
- 每个标志都应有用法说明字符串；`-h`/`-help` 输出是最主要的用户体验。
- 对于文件参数，接受 `-` 表示“stdin/stdout”。
- 默认行为必须安全：破坏性行为应由显式标志（`--force`）启用，绝不能默认开启。
- 从环境变量或文件中读取密钥，绝不能通过标志传入（`ps` 会泄露 argv）。

## 5. 子命令

使用标准库即可，适合命令数量不多的情况：

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

当你需要嵌套命令、自动生成的帮助信息/补全功能以及大量标志时，请采用 **Cobra**——这些结构所带来的收益足以抵消引入依赖的成本：

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

Cobra 规则：始终使用 `RunE`（绝不要使用 `Run` + `os.Exit`），设置
`SilenceUsage: true`，这样运行时错误就不会输出帮助信息，并向下传递
`cmd.Context()`。仅当分层配置
（flags > env > file）确实是需求时才添加 Viper——对于大多数工具，
`flag` + `os.Getenv` 已经足够。

## 6. 面向人类和机器的输出

- 提供 `--json` 标志供机器使用；面向人类时默认使用表格/文本。
- 当 stdout 不是终端或设置了 `NO_COLOR` 时，绝不要输出 ANSI 颜色。
- 进度条/加载动画应输出到 stderr，并且仅在其为终端时显示。

## 验证清单

1. 使用 `run(ctx, args, stdin, stdout, stderr)` 模式——无需子进程即可测试逻辑
2. 已接入 `signal.NotifyContext`；长时间运行的操作会响应 ctx 取消
3. 数据输出到 stdout，诊断信息输出到 stderr——已通过管道验证
4. 退出码：0 表示成功，2 表示用法错误，其他情况使用已记录的退出码；`os.Exit` 仅在 main 中使用
5. 每个标志都有用法文本；已审查 `-h` 输出
6. 在需要文件参数的地方，接受 `-` 作为 stdin/stdout
7. 破坏性操作需要显式标志
8. 不通过 argv 传递机密信息
9. Cobra（如果使用）：所有地方都使用 RunE、设置 SilenceUsage，并传播 context
10. 在非 TTY 环境和设置 NO_COLOR 时禁用颜色/加载动画