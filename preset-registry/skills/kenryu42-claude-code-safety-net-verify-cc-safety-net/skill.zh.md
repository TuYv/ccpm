---
name: verify-cc-safety-net
description: Launch and drive the real cc-safety-net CLI — the hook decision path, explain, status/doctor, logs, and the local policy GUI — against an isolated home, capturing evidence. Use when a change needs proof in the running app, not just the test suite.
---
# 验证 cc-safety-net

cc-safety-net 是一个 CLI（`cc-safety-net` / `ccsn`），编码代理 CLI 将其作为工具使用前钩子调用：描述工具调用的 JSON 从 stdin 输入，允许/拒绝决定从 stdout 输出，并且每个决定都会追加到活动 home 目录下的审计日志中。用户还会运行诊断命令（`status`、`doctor`、`explain`、`logs`）以及本地 Web GUI（`gui`）。

**每次运行的安全不变量：**

- 待测命令字符串（`git reset --hard`、`rm -rf /`、……）是分析器的输入。它们会进入
  JSON 负载或 `explain` 参数。绝不要在 shell 中执行它们。
- 绝不要针对真实 home 目录运行 CLI。每次调用都必须通过 `./ccsn-isolated`（参见
  Helpers）进行，它会将 `HOME`、`CC_SAFETY_NET_HOME` 和 `CC_SAFETY_NET_AUDIT_HOME` 重定向到一个
  可丢弃的目录。直接使用 `bun run src/cli/cc-safety-net.ts` 会写入开发者真实的
  `~/.cc-safety-net/logs`。
- 在验证运行中绝不要执行 `install`、`update` 或 `uninstall`（CLI 或 GUI Integrations 选项卡）：安装检测
  和 npx 缓存清理会触及 `$HOME` 以外的真实机器状态。

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

一次性命令（hook、explain、status、logs、doctor）不需要服务器——每次驱动都是从 `$REPO/.agents/skills/verify-cc-safety-net/` 发起的一次
`./ccsn-isolated …` 调用。

唯一的长期运行实例是 GUI：

```bash
cd "$WS" && "$REPO/.agents/skills/verify-cc-safety-net/ccsn-isolated" gui --no-open > "$EVIDENCE/gui.log" 2>&1 &
GUI_PID=$!
```

当 `gui.log` 包含 `CC Safety Net policy GUI: http://127.0.0.1:<port>/?token=<token>` 时即表示就绪
（轮询它；会在约 2 秒内出现）。服务器自行选择空闲端口，因此实例永不会冲突。清理：`kill $GUI_PID`——终止你启动的 PID，绝不要按进程名终止。

隔离：只要每次运行各自拥有 `CCSN_VERIFY_HOME`，两个运行可以并行进行。

## Doctor

在驱动之前，先证明该实例值得驱动——在 skill 目录中：

```bash
./ccsn-isolated --version        # must print "dev" — source checkout, not an installed copy
./ccsn-isolated status | head -6 # must print "CC Safety Net — ready" with Level standard
./ccsn-isolated doctor --json --skip-update-check > "$EVIDENCE/doctor.json"
```

如果 `--version` 输出 semver，说明你运行的是打包副本而不是此 checkout——停止。`doctor.json` 中健康状态意味着 `engineSelfTest.failed` 为 0 且 `configState.state` 为 `"ready"`。
不要以 doctor 的退出码作为门槛：在全新的隔离 home 下，它仅因未配置集成而退出 1（`findings` 中的 `integration.none-configured`），这是隔离环境的固有属性，
不是缺陷。任何其他 error 严重级别的发现都意味着该 checkout 已损坏——停止并报告，而不是继续驱动功能。
首次 hook 驱动后，额外确认隔离生效：`$CCSN_VERIFY_HOME/.cc-safety-net/logs/` 下存在条目，且 `ls ~/.cc-safety-net/logs/*/*/*ccsn-verify* 2>/dev/null`
找不到任何内容（每个探测会话 ID 都以 `ccsn-verify-` 开头，因此可通过真实日志树中的文件名识别泄漏）。

## 驱动方式

三种驱动方式；每个功能的具体方案位于 [features/](features/README.md)。

**Hook（生产路径）。** 编写 coding CLI 将发送的 payload，通过管道传入，捕获
stdout 和 exit code：

```bash
printf '%s' '{"hook_event_name":"PreToolUse","tool_name":"Bash","session_id":"ccsn-verify-'"$RUN_ID"'-reset","cwd":"'"$WS"'","tool_input":{"command":"git reset --hard"}}' \
  | ./ccsn-isolated hook --claude-code
```

拒绝时打印 `{"hookSpecificOutput":{…,"permissionDecision":"deny","permissionDecisionReason":"…Rule: git.reset-hard…"}}`；
允许时不打印任何内容。两者的 exit code 都是 0，决策信息只在 stdout JSON 中，而不在 exit code 中。
`hook` 还接受 `--cursor`、`--gemini-cli`、`--copilot-cli`、`--kimi-code`、`--grok-build`、
`--hermes-agent`、`--antigravity-cli`（payload 结构有所不同；请参阅
`src/integrations/<id>/hook.ts` 中的集成实现）。

**Plain CLI。** `./ccsn-isolated explain --json "<command>"`、`status`、`doctor --json
--skip-update-check`、`logs --json [--all]`。`logs` 的作用域限定为当前工作目录，需在与 hook payload 的
`cwd` 所指向的同一个 `$WS` 中运行（`ccsn-isolated` 会从当前工作目录执行相对路径命令，因此先执行
`cd "$WS"`）。

**GUI。** 使用 curl 驱动 API（`GET /api/policy?token=$TOKEN`；POST 请求还需要
`x-cc-safety-net-token: $TOKEN` header），或者在打印出的 URL 上通过浏览器（playwright-cli 或
claude-in-chrome）访问页面。视图通过 hash 路由：`#overview`、`#activity`、`#policy`、
`#rules`、`#integrations`、`#settings`；稳定句柄是元素 id（`#tester-input`、
`#tester-run`、`#tester-result`、`#save`、`#activity-feed`）以及
`a[data-nav="<view>"]`。

## 证据

所有内容都会写入 `$EVIDENCE`（`artifacts/verify/<run-id>/`，被 gitignored，清理后仍会保留）。

- 运行真实的用户路径：通过 `hook --<integration>` 传入 payload，必须与宿主 CLI 实际发送的内容完全一致，不要调用 `checkCommand` library 或内部函数。
- 捕获操作及其结果状态：对于 hook 决策，保存 payload、stdout 决策和 exit code，然后将其与副作用配对，也就是 `$CCSN_VERIFY_HOME/.cc-safety-net/logs/<cwd-slug>/<YYYY-MM>/<date>-<session_id>.jsonl` 中的审计条目（或其缺失：默认策略下的普通允许操作也会被记录，因此应断言内容，而不是仅断言文件是否存在）。
- hook 负责回答，宿主负责执行。hook 证明覆盖决策和审计轨迹，但无法证明文件得以保留；而暂存 sentinel 也无法证明任何事情（此 harness 不会执行命令）。存活证明位于 `tests/e2e`，其中会运行真实的宿主 runner。
- 允许证明是一种否定性证明：空 stdout、exit 0，以及针对该 session id 的 `allow` 审计条目，三者必须同时满足。请全部捕获，仅有空 stdout 也可能是被管道吞掉的崩溃。
- GUI 证明：截图中应显示视图名称，并附上 API 响应或磁盘上的 policy 文件（`$CCSN_VERIFY_HOME/.cc-safety-net/policy.json`），以证明修改已生效。
- 每个 artifact 都要记录：功能 ID、精确命令，以及所使用的 entry point。

## 清理

```bash
kill $GUI_PID 2>/dev/null          # only if this run started a GUI
/bin/rm -rf "$CCSN_VERIFY_HOME"    # /bin/rm — plain rm may be aliased to trash on this machine
```

清理会移除此运行启动的隔离主目录和所有 GUI 进程，不会移除任何其他内容。绝不
删除 `$EVIDENCE`，绝不触碰真实的 `~/.cc-safety-net`，也绝不按进程名称终止进程
（其他 bun 进程不属于你）。即使尝试失败后也要运行此操作。

## 辅助工具

`ccsn-isolated`（本目录中的可执行文件）会在隔离主目录下从源码运行 CLI：

```bash
CCSN_VERIFY_HOME=/abs/disposable/dir ./ccsn-isolated <command> [args...]
```

它要求 `CCSN_VERIFY_HOME` 为绝对路径，会将 `HOME`/`USERPROFILE`/
`CC_SAFETY_NET_HOME`/`CC_SAFETY_NET_AUDIT_HOME` 重定向到其中，清空开发者 shell 可能导出的 `CC_SAFETY_NET_LEVEL`/
`STRICT`/`PARANOID*`/`WORKTREE` 覆盖项，并通过 stdin/stdout/退出码直通执行
`bun run <repo>/src/cli/cc-safety-net.ts "$@"`，因此 hook 负载可直接通过管道传入。
它会从你当前的 cwd 运行 CLI；对于如 `logs` 等按 cwd 作用域执行的命令，请 `cd` 到 `$WS`。