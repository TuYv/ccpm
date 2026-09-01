---
name: stuck
description: Diagnose frozen, stuck, or slow Qwen Code sessions on this machine. Scans for problematic processes, high CPU/memory usage, hung subprocesses, and debug logs. Use /stuck or /stuck <PID> to focus on a specific process.
argument-hint: '[PID or symptom]'
allowedTools:
  - run_shell_command
  - read_file
---
# /stuck — 诊断冻结/缓慢的 Qwen Code 会话

用户认为这台机器上的另一个 Qwen Code 会话已冻结、卡住或运行非常缓慢。请进行调查并生成诊断报告。

## 检查内容

扫描其他 Qwen Code 进程（排除当前进程——排除运行此提示时看到的 PID）。由于 Qwen Code 是 Node.js CLI（`#!/usr/bin/env node`），进程名称（`comm` 列）始终是 `node`（如果使用 Bun 运行，则为 `bun`）。通过查看 `command` 列来识别 Qwen Code 会话：查找位于目录名以 `qwen-code` 开头的目录中的脚本路径（匹配 `qwen-code/`、`qwen-code-dev/`、worktree 克隆等）——目录名必须位于路径开头或 `/` 之后，以避免误匹配 `analyze-qwen-code/` 之类的不相关名称——或者查找以 `/qwen` 结尾的 bin 调用（全局符号链接）。避免宽泛地匹配 `qwen-code` 子字符串：这会将仅通过 `--cwd` 传递 qwen-code 路径的插件代理误判为目标进程。

会话卡住的迹象：

- **持续高 CPU（>=90%）** — 可能是无限循环。间隔 1-2 秒采样两次，以确认这不是瞬时峰值。
- **进程状态为 `D` / `U`（不可中断睡眠）** — 通常是 I/O 卡死。Linux 使用 `D`，macOS/BSD 使用 `U`。查看 `ps` 输出中的 `state` 列；只关注第一个字符（忽略 `+`、`s`、`<` 等修饰符）。
- **进程状态为 `T`（已停止）** — 用户可能误按了 Ctrl+Z。
- **进程状态为 `Z`（僵尸）** — 父进程未回收该进程。
- **RSS 极高（>=4GB）** — 可能存在内存泄漏，导致会话运行缓慢。
- **状态为 `S` 且 CPU 占用较低** — 最常见的卡住特征：向模型 API 发起的 HTTPS 请求卡住。单独来看，这并不是进程级别的异常信号，但如果用户报告“卡住”，则应将其视为运行第 3 步网络检查的强烈信号。
- **卡住的子进程** — 卡住的 `git`、`node` 或 shell 子进程可能会冻结父进程。对每个会话检查 `pgrep -P <pid>`（然后使用 `ps -p` 检查状态——参见第 3 步）。

## 参数验证

如果用户提供了参数，则仅当该参数完全由数字 0-9 组成时，才将其视为 PID。任何其他内容——字母、空白字符、标点符号——都无法通过检查；在这种情况下，将其视为自由文本形式的症状描述（仅作为报告的指导信息，绝不能代入 shell 命令）。严格限制为纯数字白名单，比枚举 shell 元字符更加安全。

## 调查步骤

**前置步骤 — 解析运行时基础目录。** 下面两个路径都需要使用该目录（第 1 步中的 sidecar 枚举、第 3 步中的调试日志查找，以及 PID 快速路径）。基础目录按以下优先级确定：`QWEN_RUNTIME_DIR` 环境变量、`advanced.runtimeOutputDir` 设置、`QWEN_HOME` 环境变量，最后是 `~/.qwen`。

```
RUNTIME_DIR="${QWEN_RUNTIME_DIR:-}"
[ -z "$RUNTIME_DIR" ] && command -v jq >/dev/null && RUNTIME_DIR=$(jq -r '.advanced.runtimeOutputDir // empty' "${QWEN_HOME:-$HOME/.qwen}/settings.json" 2>/dev/null)
# `advanced.runtimeOutputDir` may be `~/...` or relative; mirror Storage.resolvePath() before using in globs
[ -n "$RUNTIME_DIR" ] && RUNTIME_DIR="${RUNTIME_DIR/#\~/$HOME}"
[ -n "$RUNTIME_DIR" ] && case "$RUNTIME_DIR" in /*) ;; *) RUNTIME_DIR="$(cd "$RUNTIME_DIR" 2>/dev/null && pwd)" || RUNTIME_DIR="" ;; esac
RUNTIME_DIR="${RUNTIME_DIR:-${QWEN_HOME:-$HOME/.qwen}}"
```

（如果未安装 `jq`，设置层会被静默跳过——环境变量 / 默认值回退机制可以覆盖常见情况。）

**针对性诊断的快速路径**——如果提供了仅包含数字的 PID 参数，则跳过第 1 步枚举。在转储任何详细信息前，先验证该 PID 是否对应一个仍在运行且属于当前用户的 Qwen Code 进程：

```
kill -0 <pid> 2>/dev/null || { echo "PID <pid> is dead, or owned by another user"; exit 0; }
ps -p <pid> -o command= -ww 2>/dev/null | grep -qE '((^|/)qwen-code[^ /]*/[^ ]*\.(js|ts|mjs|cjs)( |$)|/qwen( |$))' || { echo "PID <pid> is yours but is not a Qwen Code process — refusing to dump details"; exit 0; }
```

如果任一保护检查输出消息，则停止诊断并逐字显示该消息。否则，收集统计信息和 sidecar 映射，然后跳转到第 3 步：

```
ps -p <pid> -o pid=,pcpu=,rss=,etime=,state=,comm=,command= -ww
grep -El '"pid"[[:space:]]*:[[:space:]]*<pid>\b' "$RUNTIME_DIR"/projects/*/chats/*.runtime.json 2>/dev/null
```

注意：与第 2 步一样，`command=` 列可能包含作为 CLI 参数传入的凭据（例如 `--openai-api-key=sk-…`）。在报告中引用这些值之前，将其脱敏为 `***`。

必须使用 `-E`，这样 `\b` 才会被解释为单词边界（不带 `-E` 的 BSD `grep` 会将 `\b` 视为退格字符，在 macOS 上会静默返回空结果）。`-l` 标志会返回匹配的 sidecar 文件路径；去掉 `.runtime.json` 后的文件名就是第 3 步读取调试日志时使用的会话 ID。如果匹配到多个 sidecar（这种情况很少见——仅会在 PID 重用导致遗留文件时发生），优先选择最近修改的文件：`ls -t <matches> | head -n 1`。

否则（未提供参数，或参数仅描述症状），运行下面的常规路径：

1. **通过 runtime sidecar 枚举仍在运行的会话**（首选且可靠）：

   Qwen Code 会为每个交互式会话在 `"$RUNTIME_DIR"/projects/<sanitized-cwd>/chats/<sessionId>.runtime.json` 写入一个 `runtime.json` sidecar。每个文件都包含 `{schema_version, pid, session_id, work_dir, hostname, started_at, qwen_version}`——这是 `(pid, session_id, work_dir)` 映射的权威来源。

   一次性筛选出仍在运行的 `(pid, sidecar-path)` 对。使用 Node（保证可用——qwen-code 需要它），而不是 `jq`（默认 macOS / 精简 Linux 环境中通常未安装），从而避免该路径静默降级：

   ```
   node -e 'const fs=require("fs"); for (const f of process.argv.slice(1)) { try { const p=JSON.parse(fs.readFileSync(f,"utf8")).pid; if (p) { try { process.kill(p,0); console.log(p+" "+f); } catch {} } } catch {} }' "$RUNTIME_DIR"/projects/*/chats/*.runtime.json 2>/dev/null
   ```

   PID 重用虽然少见，但确实可能发生——在第 2 步与 `ps` 交叉引用时，跳过那些仍在运行的 PID 所对应的命令行已不再像 Qwen Code 进程的配对。

   **如果命令没有输出任何内容**（没有 sidecar，或没有仍在运行的 PID），则继续执行第 2 步——`ps` 是可用的回退方案。

2. **通过 `ps` 列出 Qwen Code 进程**（macOS/Linux）——用于为每个仍在运行的会话补充 CPU/RSS/状态/运行时长信息，并捕获可能在 sidecar 功能存在之前就已启动的会话：

```
   ps -xo pid=,pcpu=,rss=,etime=,state=,comm=,command= -u "$(id -u)" -ww | grep -E '((^|/)qwen-code[^ /]*/[^ ]*\.(js|ts|mjs|cjs)( |$)|/qwen( |$))' | grep -v grep
   ```

   `-u "$(id -u)"` 将扫描范围限制为当前用户 — 在共享主机上，这可以避免将其他用户的 Qwen 进程路径/参数暴露到聊天中。`-ww` 禁用列截断，因此较长的 "qwen" 路径不会被截断。`comm` 列将显示为 `node` 或 `bun`，而不是 `qwen`；筛选出 `command` 列包含 qwen 路径的行（例如 `qwen-code/dist/cli.js`，或以 `/qwen` 结尾的 bin 符号链接）。将其与第 1 步中的 PID 交叉核对。

   注意：在 macOS 和 Linux 上，`ps` 报告的 `rss` 单位都是 **kilobytes**。要以 MB 报告，请除以 1024；要以 GB 报告，请除以 1048576。4GB 阈值为 `4194304` KB — 可以将原始 `rss` 值与其比较，也可以将 GB 值与 4 比较。不要先除以一次再与 4 比较；那样会将每个大于 4MB 的进程都标记为“非常高的 RSS”。

   注意：完整命令行可能包含作为 CLI 参数传入的凭据（例如 `--openai-api-key=sk-…`）。在报告中引用这些值之前，请将其脱敏为 `***`。

3. **对于任何可疑情况**，收集更多上下文。如果仅进程状态就能解释问题（`T` = 意外停止，`Z` = 父进程未回收），直接跳到报告即可 — 检查子进程 / 日志 / 堆栈不会增加任何信息。否则：
   - 子进程（包含状态，因此挂起的 `git` / `node` 也会显示出来）：`CHILDREN=$(pgrep -P <pid> | tr '\n' ',' | sed 's/,$//'); [ -n "$CHILDREN" ] && ps -p "$CHILDREN" -o pid=,ppid=,pcpu=,state=,etime=,command= -ww`。单次调用 `ps`（避免为每个子进程分别派生一个进程），并使用 `-ww` 确保较长的子进程命令行不会被截断。
   - 如果 CPU 占用率较高：在 1-2 秒后再次采样，以确认这是持续性的
   - **网络挂起** — 如果 CPU 占用率较低且状态为 `S`，但用户报告“卡住”，最可能的原因是对模型 API 的 HTTPS 请求挂起。macOS：`lsof -nP -i -p <pid> 2>/dev/null | head -20`（`-nP` 标志会跳过反向 DNS 和端口查询，因为这些操作本身也可能挂起）。如果 `lsof` 本身运行缓慢，请在前面加上 `timeout 10`（在使用 Homebrew coreutils 的 macOS 上则使用 `gtimeout 10`）。Linux：`ss -tnp 2>/dev/null | grep "pid=<pid>,"`。注意，`ss -tnp` 的 `-p` 需要 root 或 `CAP_NET_ADMIN` 权限 — 没有这些权限时，PID 列会显示为 `-`，而 grep 会返回空结果。如果没有匹配项，但 `ss -t 2>/dev/null` 确实显示了 ESTABLISHED 套接字，请改用 `lsof -nP -i -p <pid>`，而不要报告“没有连接”。与模型主机（dashscope、openai、anthropic 等）建立的长期 `ESTABLISHED` 连接，且近期没有流量，是最确凿的证据。
   - **调试日志** — 从 `"$RUNTIME_DIR"/debug/latest` 开始（指向最近会话的符号链接）；如果它与可疑 PID 的会话匹配，通常就是正确的日志。否则，从 sidecar 推断会话 ID，并读取 `"$RUNTIME_DIR"/debug/<session-id>.txt`。使用 `tail -n 200 <path>` 限制读取范围 — 调试日志可能达到 GB 大小。最后几百行通常会显示会话在挂起前正在执行的操作。调试日志可能包含其他会话的提示词、文件内容或令牌 — 只粘贴与挂起相关的行，并且绝不要引用其中碰巧看到的机密信息/API 密钥。

4. **考虑获取堆栈转储**，用于真正冻结的进程（高级选项，可选）：
   - macOS：`sample <pid> 3` 可获取 3 秒的原生堆栈采样。如果 `sample` 自身似乎也卡住了（目标进程的 Mach task port 可能因内核级冻结而失效），请对其进行包装：`timeout 15 sample <pid> 3`（或在 Homebrew coreutils 中使用 `gtimeout 15 ...`）。堆栈帧可能包含函数参数，其中有保存在内存中的 API 密钥或令牌——在将转储内容加入报告之前，请将此类值编辑为 `***`。
   - Linux：使用 `cat /proc/<pid>/stack` 获取内核堆栈（只读，不需要 `ptrace` 权限）。不要为此使用 `strace -p`：它需要 `CAP_SYS_PTRACE`（在 `kernel.yama.ptrace_scope=1` 时通常会被拒绝），而且 `strace -c` 会一直阻塞到目标进程退出——对于你正在诊断的这类卡住进程，它本身也会挂起。
   - 这部分内容很多——只有在进程明显挂起，并且你想了解其_原因_时才获取

## 报告

直接向用户提交结构化诊断报告，并包含以下部分：

**对于发现的每个卡住/运行缓慢的会话：**

- PID、CPU%、RSS（以 MB 为单位）、进程状态、运行时长、完整命令行
- 子进程及其状态
- 你对可能问题的诊断
- 如果获取了调试日志，则提供相关日志末尾内容
- 如果获取了堆栈转储，则提供堆栈转储输出
- 建议用户自行决定的下一步操作（例如：“如果会话没有响应，用户可以考虑执行 `kill <pid>`”、“可能正在等待 I/O——检查磁盘”、“意外停止——用户可以使用 `kill -CONT <pid>` 恢复运行”）。不要自行执行这些操作——将它们作为选项提供给用户。

**如果每个会话看起来都正常**，请直接告知用户——无需提供诊断转储。说明你检查了多少个会话，以及没有任何会话表现出卡住的迹象。

**如果完全没有找到会话**（sidecar 数量为零且没有匹配的 `ps` 行），请明确说明这一点：你搜索了哪个 `RUNTIME_DIR`，以及 `ps` 没有返回当前用户的 qwen 相关进程。建议该会话可能已经退出。

## 注意事项

- 不要终止或发送信号给任何进程——这只是诊断操作。
- 如果用户提供了参数（例如特定的 PID 或症状），请优先关注该参数。