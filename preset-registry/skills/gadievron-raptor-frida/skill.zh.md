---
name: frida
description: Dynamic instrumentation via Frida - attach to or spawn a process, load a JS hook script, capture send() events into a lifecycle-managed run directory. Supports local, USB-attached, and remote frida-server targets.
---
# Frida - 动态插桩（alpha）

在运行时 Hook 目标，以确认 LLM 标记的汇点是否确实执行、跟踪 API 调用、绕过 SSL 固定，以及扫描内存中的秘密信息。

## 使用场景

- `/scan` 或 `/agentic` 标记了某个汇点，而你希望在将其视为可利用之前，确认它是否会在运行时触发。
- 二进制文件或移动应用正在执行某些不透明的操作，而几分钟的 API 跟踪就能揭示其行为轮廓。
- 启用了证书固定的移动应用正在阻止你的 MITM 代理。
- 无法使用 `rr` 记录的崩溃（macOS）需要函数调用跟踪。

## 安装

```bash
pipx install frida-tools                       # host CLI + python bindings
raptor doctor                                  # confirms frida is detected
```

对于远程/移动目标，请在目标端安装匹配的 `frida-server`。请参阅 `docs/frida.md`。注意：大多数 `frida-server` 二进制文件默认绑定到 `127.0.0.1`——请使用 `-l 0.0.0.0:27042` 启动，或通过 SSH 转发端口 27042。

## 调用方式

斜杠命令会提供 libexec 包装器；请将其作为 Bash 运行。生命周期（输出目录、运行状态）由包装器处理。

```
libexec/raptor-frida --target <pid|name|bundle-id|binary>
                     (--template <name> | --script <path>)
                     [--host HOST[:PORT]] [--usb]
                     [--duration N] [--spawn] [--unsafe-attach]
```

不使用 Claude 会话时的等效 CLI：`raptor frida ...`。

## 模板

```bash
raptor frida --list-templates
```

| 名称 | 用途 |
|------|---------|
| `api-trace` | Hook `open`/`read`/`write`/`connect`/`fork`/`execve` 等。最实用的默认选项。 |
| `ssl-unpin` | 绕过 iOS/macOS Security.framework、OpenSSL `SSL_get_verify_result` 和 Android `X509TrustManager`。 |

通过 `--script ./hook.js` 使用操作者提供的脚本——采用相同的 `send(...)` 捕获路径。

## 示例

```bash
# Trace API calls in a local PID for 30s
raptor frida --target 1234 --template api-trace --duration 30

# Spawn a binary and watch its first minute
raptor frida --target ./victim --template api-trace --duration 60

# Bypass SSL pinning on a USB-attached mobile target. Spawn by bundle id (frida resolves bundle ids for spawn); attach-by-name needs the running process's name, not the bundle id, so --spawn is the reliable form.
raptor frida --target com.example.app --template ssl-unpin --usb --spawn --duration 120

# Connect to remote frida-server
raptor frida --target target-proc --host 10.10.20.1 --template api-trace

# Operator-supplied hook
raptor frida --target Safari --script ./my-hook.js --duration 30
```

## 输出布局

```
<run-dir>/
  events.jsonl       # one JSON object per send() from the script
  metadata.json      # target, host info, timings, errors
  script.js          # copy of the script that ran
  frida-report.md    # short human-readable summary
```

`<run-dir>` 由 `libexec/raptor-run-lifecycle` 解析：
- 存在活动的 `/project`：`out/projects/<name>/frida-<timestamp>/`
- 否则：`out/frida_<timestamp>/`

## 故障模式（首先阅读 `metadata.json`）

| 错误片段 | 可能的原因 |
|---|---|
| `ptrace denied` | Linux `kernel.yama.ptrace_scope` ≥ 1。请降低该值，或通过生成进程后附加的方式运行。 |
| `task_for_pid` | 目标使用了 macOS 强化运行时，或属于系统进程——需要禁用 SIP，或使用包含 `get-task-allow` 权限的签名。 |
| `unable to connect to remote frida-server` | 目标未运行，或仅绑定到了 localhost。请通过 SSH 转发 27042 端口，或重新绑定。 |
| `frida-python not installed` | `pipx install frida-tools`。 |

## 威胁模型

由 Frida 插桩的目标是**不可信的**——这正是使用它的意义所在。运行器封装在使用 `frida` 配置文件的 `core.sandbox.run()` 中（允许 ptrace，设置 `skip_pid_ns=True` 以访问 `/proc`，并设置 `restrict_reads=True`、`fake_home=True`）：

- **生成模式**（`--target ./binary`）：`block_network=True`——目标无法访问外部网络。
- **附加模式**（`--target <pid|name>`）：不改变网络——该进程已在运行，并保留其所需的全部网络连接能力。
- **`--unsafe-attach`**：完全绕过沙箱（适用于系统进程和 SIP 目标）。相关信息会记录在 `metadata.json` 中。

## 流水线集成

当运行目录中存在证据时，Frida 输出会自动被下游流水线使用：

| 使用方 | 读取内容 | 产出内容 |
|----------|--------------|-----------------|
| `/agentic` 可达性预检 | `events.jsonl` 中的函数名 | 为清单项添加 `metadata.frida_runtime_trace`；将 `FRIDA_RUNTIME_TRACE` 见证提升为 SOUND |
| `/validate` 阶段 B | `events.jsonl` 中的函数名 | 为攻击路径步骤添加 `runtime_evidence` 注解；接近度下限设为 6 |
| `/understand --map` 上下文桥接 | `events.jsonl` 中的文件操作 | 将 `ObserveProfile` 合并到上下文映射中（读取/写入/stat/connect 路径） |
| 覆盖率存储 | `coverage.drcov`（bb-coverage 模板） | 通过现有的 `import_drcov` 流水线生成函数级覆盖率标记 |

无需任何标志——使用方通过 `packages.frida.evidence.discover_evidence()` 发现证据，并通过 `packages.frida.available()` 进行条件检查。

### 编程式 API（用于编排脚本）

```python
from packages.frida.active import auto_observe, observe_target, observe_paired

# Single binary spawn — runs under sandbox frida profile
run_dir = observe_target("/path/to/binary", template="api-trace", duration_sec=30)

# Network service — paired observation via netns coordinator
run_dir = observe_paired(["./server", "--port", "8080"],
                         template="api-trace", wait_port=8080)

# Pipeline hook — skips if fresh evidence already exists
run_dir = auto_observe("/path/to/binary", search_dirs=[out_dir])
```

## 状态

Alpha 阶段。目前随附四个模板（`api-trace`、`bb-coverage`、`ssl-unpin`、`binary-flow-trace`）；更丰富的模板集仍在开发中（与 @Splinters-io 合作）。已自动集成到 `/validate` 中（阶段 B 通过 `frida_validation_bridge` 收集运行时证据）。计划在 macOS 上集成到 `/crash-analysis`。已放弃的 PR #57 中由 LLM 引导的自主模式有意**未**包含在此版本中。