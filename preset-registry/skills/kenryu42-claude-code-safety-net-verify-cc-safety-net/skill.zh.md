---
name: verify-cc-safety-net
description: Launch and drive the real cc-safety-net CLI — the hook decision path, explain, status/doctor, logs, and the local policy GUI — against an isolated home, capturing evidence. Use when a change needs proof in the running app, not just the test suite.
---
I’ll inspect the repository and the verification skill files first, then run the required isolated doctor checks before exercising the CLI and GUI. I’ll keep all dangerous command strings as analyzer inputs only and record results under a disposable verification home.I’m locating the repository’s verification harness and checking the worktree state so the run uses the existing project conventions and does not disturb unrelated changes.# 验证 cc-safety-net

cc-safety-net 是一个 CLI（`cc-safety-net` / `ccsn`），编码代理 CLI 将其作为工具使用前钩子调用：工具调用的 JSON 描述通过 stdin 传入，允许/拒绝决定通过 stdout 输出，并且每个决定都会追加到活动 home 下的审计日志中。用户也可以运行诊断命令（`status`、`doctor`、`explain`、`logs`）以及本地 Web GUI（`gui`）。

**每次运行都必须满足以下安全不变量：**

- 测试中的命令字符串（`git reset --hard`、`rm -rf /` 等）是分析器的输入。它们只能放入 JSON 负载或作为 `explain` 参数。绝不能在 shell 中执行。
- 绝不能针对真实 home 运行 CLI。每次调用都必须经过 `./ccsn-isolated`（参见 Helpers），它会将 `HOME`、`CC_SAFETY_NET_HOME` 和 `CC_SAFETY_NET_AUDIT_HOME` 重定向到一次性目录。直接运行 `bun run src/entries/bin.ts` 会写入开发者真实的 `~/.cc-safety-net/logs`。
- 验证运行中绝不能驱动 `install`、`update` 或 `uninstall`（CLI 或 GUI 的 Integrations 标签页）：安装检测和 npx 缓存清理会访问 `$HOME` 之外的真实机器状态。

## 启动

无需构建步骤：CLI 使用 bun 从源码运行。设置一次隔离运行：

```bash
REPO=/Users/kenryu/Developer/420024-lab/cc-safety-net   # or `git rev-parse --show-toplevel`
RUN_ID=verify-$(date +%Y%m%d-%H%M%S)
export CCSN_VERIFY_HOME=$REPO/artifacts/verify-homes/$RUN_ID   # disposable fake $HOME
EVIDENCE=$REPO/artifacts/verify/$RUN_ID                        # proof artifacts (gitignored)
WS=$CCSN_VERIFY_HOME/workspace                                 # cwd the "agent" works in
mkdir -p "$CCSN_VERIFY_HOME" "$EVIDENCE" "$WS"
```

单次命令（hook、explain、status、logs、doctor）无需服务器——每次调用都从 `$REPO/.agents/skills/verify-cc-safety-net/` 运行一次 `./ccsn-isolated …`。

唯一的长时间运行实例是 GUI：

```bash
cd "$WS" && "$REPO/.agents/skills/verify-cc-safety-net/ccsn-isolated" gui --no-open > "$EVIDENCE/gui.log" 2>&1 &
GUI_PID=$!
```

当 `gui.log` 包含 `CC Safety Net policy GUI: http://127.0.0.1:<port>/?token=<token>` 时即表示就绪（轮询检查；通常在约 2 秒内出现）。服务器会自行选择空闲端口，因此不同实例之间不会冲突。清理：`kill $GUI_PID`——只能终止你启动的 PID，绝不能按进程名终止。

隔离：只要每次运行使用各自的 `CCSN_VERIFY_HOME`，就可以并行运行两个实例。

## Doctor

开始驱动前，先证明该实例值得驱动——从技能目录运行：

```bash
./ccsn-isolated --version        # must print "dev" — source checkout, not an installed copy
./ccsn-isolated status | head -6 # must print "CC Safety Net — ready" with Level standard
./ccsn-isolated doctor --json --skip-update-check > "$EVIDENCE/doctor.json"
```

如果 `--version` 输出的是语义化版本号，那么你运行的是打包版本，而不是此代码检出版本——停止操作。`doctor.json` 健康的条件是 `engineSelfTest.failed` 为 0 且 `configState.state` 为 `"ready"`。不要以 doctor 的退出代码作为门槛：在全新的隔离 home 下，它仅仅因为未配置集成（`findings` 中的 `integration.none-configured`）而以 1 退出，这是隔离环境固有的情况，不是缺陷。任何其他错误级别的 finding 都表示代码检出版本已损坏——停止操作并报告，而不要继续驱动功能。

完成第一次 hook 驱动后，还要额外确认隔离仍然有效：`$CCSN_VERIFY_HOME/.cc-safety-net/logs/` 下存在条目，并且 `ls ~/.cc-safety-net/logs/*/*/*ccsn-verify* 2>/dev/null` 找不到任何内容（每个探测会话 ID 都以 `ccsn-verify-` 开头，因此可以通过文件名在真实日志树中识别泄漏）。

## 驱动方式

三种驱动方式；各功能的具体配方位于 [features/](features/README.md)。

**Hook（生产路径）。** 写入编码 CLI 将发送的 payload，将其通过管道传入，捕获
stdout 和退出代码：

```bash
printf '%s' '{"hook_event_name":"PreToolUse","tool_name":"Bash","session_id":"ccsn-verify-'"$RUN_ID"'-reset","cwd":"'"$WS"'","tool_input":{"command":"git reset --hard"}}' \
  | ./ccsn-isolated hook --claude-code
```

拒绝时输出 `{"hookSpecificOutput":{…,"permissionDecision":"deny","permissionDecisionReason":"…Rule: git.reset-hard…"}}`；
允许时不输出任何内容。两者的退出代码均为 0，决策取自 stdout JSON，而不是退出代码。
`hook` 还接受 `--cursor`、`--gemini-cli`、`--copilot-cli`、`--kimi-code`、`--grok-build`、
`--hermes-agent`、`--antigravity-cli`（payload 结构有所不同；请参阅
`src/hosts/<id>/hook.ts` 中的集成实现）。

**纯 CLI。** `./ccsn-isolated explain --json "<command>"`、`status`、`doctor --json
--skip-update-check`、`logs --json [--all]`。`logs` 的作用域限定为当前工作目录，
请从 Hook payload 的 `cwd` 所指定的同一个 `$WS` 中运行（`ccsn-isolated` 会基于当前工作目录运行相对路径命令，
因此请先执行 `cd "$WS"`）。

**GUI。** 使用 curl 驱动 API（`GET /api/policy?token=$TOKEN`；POST 请求还需要
`x-cc-safety-net-token: $TOKEN` 请求头），或者在打印出的 URL 上使用浏览器（playwright-cli 或
claude-in-chrome）访问页面。视图通过 hash 路由：`#overview`、`#activity`、`#policy`、
`#rules`、`#integrations`、`#settings`；稳定句柄是元素 id（`#tester-input`、
`#tester-run`、`#tester-result`、`#save`、`#activity-feed`）以及
`a[data-nav="<view>"]`。

## 证据

所有内容都会写入 `$EVIDENCE`（`artifacts/verify/<run-id>/`，已被 gitignore，清理后仍会保留）。

- 执行真实的用户路径：通过 `hook --<integration>` 传入 payload，必须完全按照主机 CLI
  发送的方式进行，而不是调用 `checkCommand` 库或内部函数。
- 捕获操作及其产生的状态：对于 Hook 决策，保存 payload、stdout 决策和退出代码，然后将其与副作用配对，
  即 `$CCSN_VERIFY_HOME/.cc-safety-net/logs/<cwd-slug>/<YYYY-MM>/<date>-<session_id>.jsonl` 中的审计条目
  （或其缺失情况：默认策略下的普通允许也会被记录，因此要断言内容，而不是仅断言是否存在）。
- Hook 会回答；主机负责执行。Hook 证明涵盖决策和审计轨迹，但无法证明文件得以保留；暂存哨兵文件也无法证明任何事情（此测试框架不会执行命令）。存活证明位于
  `tests/e2e` 中，其中会运行一个真实的主机执行器。
- 允许证明是一个否定性证明：空 stdout、退出代码为 0，以及针对该 session id 的 `allow` 审计条目，三者缺一不可。请全部捕获，仅有空 stdout 也可能意味着管道吞掉了崩溃。
- GUI 证明：截图中要显示视图名称，并附上 API 响应或磁盘上的策略文件
  （`$CCSN_VERIFY_HOME/.cc-safety-net/policy.json`），以证明修改已生效。
- 每个工件都要记录：功能 ID、确切命令以及所使用的入口点。

## 清理

```bash
kill $GUI_PID 2>/dev/null          # only if this run started a GUI
/bin/rm -rf "$CCSN_VERIFY_HOME"    # /bin/rm — plain rm may be aliased to trash on this machine
```

清理会移除隔离的 home 目录以及本次运行启动的任何 GUI 进程，不会移除其他内容。绝不要
删除 `$EVIDENCE`，绝不要触碰真实的 `~/.cc-safety-net`，也绝不要按进程名称终止进程
（其他 bun 进程并非由你启动）。失败的尝试也必须执行清理。

## 辅助工具

`ccsn-isolated`（可执行文件，位于此目录中）会在隔离的 home 目录下从源代码运行 CLI：

```bash
CCSN_VERIFY_HOME=/abs/disposable/dir ./ccsn-isolated <command> [args...]
```

它要求 `CCSN_VERIFY_HOME` 必须是绝对路径，会将 `HOME`/`USERPROFILE`/
`CC_SAFETY_NET_HOME`/`CC_SAFETY_NET_AUDIT_HOME` 重定向到其中，会清空开发者 shell 可能导出的
`CC_SAFETY_NET_LEVEL`/`STRICT`/`PARANOID*`/`WORKTREE` 覆盖值，并执行
`bun run <repo>/src/entries/bin.ts "$@"`，同时透传 stdin/stdout/退出代码，因此 hook 负载可以直接通过管道传入。它会从当前工作目录运行 CLI；对于依赖 cwd 的命令（例如
`logs`），请先 `cd` 到 `$WS`。