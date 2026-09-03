---
name: cmux-debug
description: Verifies ccusage terminal output in a real cmux pane. Use when changing responsive tables, column widths, progress bars, spinners, or colors, or when a long-running command's output must be captured beyond the visible viewport.
---
# cmux 调试

经管道输出的 stdout 并不是终端：宽度检测、颜色、进度显示和 spinner 都会走不同的分支，因此非交互式运行无法确认渲染变更。请改为在 cmux surface 中运行命令，并读回窗格内容。

使用列举命令（`cmux --help`、`cmux capabilities --json`）选定目标，然后针对同一个 surface 进行发送和捕获——捕获结果只对命令实际运行所在的窗格有意义：

```sh
cmux send --workspace <workspace> --surface <surface> "printf '\\033c'; cd <cwd>; <command>\n"
cmux capture-pane --workspace <workspace> --surface <surface> --scrollback --lines 120
```

开头的屏幕重置可将上一次运行的输出排除在捕获之外，而 `--scrollback` 则让超出视口长度的输出得以保留；不带该参数时，`cmux read-screen` 只返回可见屏幕。

对于响应式布局的 bug，请在同一次 send 中一并捕获几何信息，从而可以确证这些宽度正是命令实际看到的宽度：

```sh
cmux send --workspace <workspace> --surface <surface> "printf '\\033c'; stty size; printf 'COLUMNS=%s\n' \"\$COLUMNS\"; cd <cwd>; <command>\n"
```

然后对照该宽度检查渲染出的表格：不应出现折行，日期、模型或总计列也不应被截断。再以较窄的宽度重复一次——布局回归问题往往最先在那里暴露出来。

如果 `cmux capabilities --json` 中缺少 `capture-pane` 或 `read-screen`，则回退到 socket RPC，它接受的是 UUID 而非引用：

```sh
cmux rpc surface.read_text '{"workspace_id":"<workspace_uuid>","surface_id":"<surface_uuid>","scrollback":true,"lines":120}'
```
