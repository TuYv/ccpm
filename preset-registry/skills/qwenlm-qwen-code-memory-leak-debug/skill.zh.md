---
name: memory-leak-debug
description: Diagnose memory leaks in the Qwen Code CLI using heap snapshots and
  the chrome-devtools CLI. Use when investigating high memory usage, unbounded
  growth, or suspected object retention issues.
---
# 内存泄漏调试

通过捕获堆快照，并使用 `chrome-devtools` CLI 工具分析保留对象大小，诊断 Qwen Code Node.js CLI 中的内存泄漏。

## 前置条件

- `chrome-devtools` CLI（来自 `chrome-devtools-mcp` package）。如果未找到，在获得用户确认后使用以下命令安装：
  `npm i chrome-devtools-mcp@latest -g`
  参见 https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/cli.md
- Node.js 22+（用于支持 `--heapsnapshot-signal`）

## 第 1 步：使用快照信号启动 CLI

使用 tmux，这样你可以与 TUI 交互，并从另一个窗格触发快照。使用 tmux-real-user-testing 辅助脚本：

```bash
HELPER=.qwen/skills/tmux-real-user-testing/scripts/tmux-real-user-log.sh
eval "$(bash "$HELPER" start memleak . \
  env QWEN_CODE_NO_RELAUNCH=true NODE_OPTIONS=--heapsnapshot-signal=SIGUSR2 \
  npm run dev)"
echo "SESSION=$SESSION OUTDIR=$OUTDIR"
```

`eval` 会导出 `SESSION` 和 `OUTDIR`。注意：shell 环境不会在不同的工具调用之间持久化——保存输出中的会话名称，并在后续命令中显式使用它。

注意：

- `npm run dev` 通过 tsx 直接从 TypeScript 源码运行——不需要构建步骤，并且对 core/cli 的更改会立即生效。
- `QWEN_CODE_NO_RELAUNCH=true` 可阻止 CLI 生成子进程，因此 PID 管理更加简单。
- `NODE_OPTIONS` 会通过 npm → tsx → node CLI 传递该标志。

获取实际 node 进程的 PID。使用 `npm run dev` 时，存在一个进程链（npm → node scripts/dev.js → tsx → node CLI），因此需要沿进程树找到最内层的 node 子进程：

```bash
NODE_PID=$(bash .qwen/skills/memory-leak-debug/scripts/find-leaf-node.sh "<session-name>")
```

若要分析生产构建产物（例如验证 tree-shaking），请先执行 `npm run bundle`，然后使用
`env QWEN_CODE_NO_RELAUNCH=true node --heapsnapshot-signal=SIGUSR2 dist/cli.js`
作为命令。由于 node 是窗格中的直接进程，因此 PID 查找更加简单：

```bash
NODE_PID=$(tmux list-panes -t "<session-name>" -F '#{pane_pid}')
```

## 第 2 步：运行疑似发生泄漏的操作

通过 tmux 驱动 TUI（参见 tmux-real-user-testing skill 中的模式）。按时间间隔获取快照以进行比较：

```bash
kill -USR2 $NODE_PID   # snapshot 1 (baseline)
# ... use the CLI via tmux send-keys ...
kill -USR2 $NODE_PID   # snapshot 2 (after activity)
# ... more activity ...
kill -USR2 $NODE_PID   # snapshot 3 (confirm growth trend)
```

快照会写入 CLI 的工作目录，文件名格式为
`Heap.<timestamp>.<pid>.<seq>.heapsnapshot`。

## 第 3 步：启动 chrome-devtools Daemon

```bash
chrome-devtools start --experimentalMemory --headless --no-usage-statistics
```

这会以文件分析模式启动 daemon——不需要浏览器或实时 Node 连接。内存工具完全基于 `.heapsnapshot` 文件运行。

## 第 4 步：识别泄漏

### 加载并汇总

```bash
chrome-devtools load_memory_snapshot /abs/path/to/snapshot.heapsnapshot
```

返回堆总大小、V8 堆细分信息和节点数量。

### 获取带保留大小的类级聚合数据

```bash
chrome-devtools get_memory_snapshot_details /abs/path/to/snapshot.heapsnapshot
```

输出格式为 CSV：`uid, className, count, selfSize, maxRetainedSize`。

跨快照进行比较，以查找其数量或保留大小无限增长的类。

### 检查发生泄漏的类的实例

```bash
chrome-devtools get_nodes_by_class /abs/path/to/snapshot.heapsnapshot <uid>
```

其中，`<uid>` 来自 `get_memory_snapshot_details` 的输出。返回各个实例及其
`id`、`retainedSize` 和 `nodeIndex`。

### 跟踪保留者链

```bash
chrome-devtools get_node_retainers /abs/path/to/snapshot.heapsnapshot <nodeId>
```

其中，`<nodeId>` 是 `get_nodes_by_class` 输出中的 `id` 字段。显示是什么持有
该对象使其保持存活状态——沿着链路查找根保留路径。

## 步骤 5：确定根本原因

常见模式：

- **无限增长的缓冲区/数组**：一个不断累积条目而不进行驱逐的数组
  （例如，`performance.measure()` → `measureEntryBuffer`）。
- **事件监听器泄漏**：在生命周期很长的 emitter 上注册监听器，却没有进行
  清理。
- **闭包捕获**：闭包无意中捕获了一个生命周期超出预期范围的大对象。
- **模块级缓存**：位于模块作用域的 Map/Set 随使用量增长。

保留者链告诉你对象是被_什么_持有的；类聚合数据的增长速率告诉你它泄漏得_有多快_。

## 步骤 6：验证修复

应用修复后：

1. 重新构建：`npm run bundle`
2. 使用相同的工作负载重复步骤 1-4。
3. 确认发生泄漏的类的数量趋于稳定（不再随活动量增长）。

## 清理

```bash
HELPER=.qwen/skills/tmux-real-user-testing/scripts/tmux-real-user-log.sh
bash "$HELPER" finish "<session-name>" "<outdir>"
chrome-devtools stop
rm *.heapsnapshot  # if no longer needed
```

## 完整示例

参见 `examples/react-reconciler-performance-measure-leak.md`，其中介绍了 ink 7
升级导致的泄漏，该泄漏由 `PerformanceMeasure` 对象引起了约 143 MB 的内存保留。