---
name: pi-native-e2e-dev
description: Spin up a live local Omnigent server + runner and exercise the native Pi TUI harness (pi-native) end-to-end — launch the real `pi` CLI via `omnigent pi`, drive turns through the web/bridge, smoke-test, and bug-bash. Load when developing, testing, or debugging the pi-native harness (omnigent/inner/pi_native_executor.py, pi_native_harness.py, omnigent/pi_native.py, pi_native_bridge.py, pi_native_credentials.py) or its bridge / extension / auth / model behavior.
---
# Pi 原生测试框架：端到端开发与测试（本地服务器/运行器）

`pi-native` 测试框架封装了**真正的 Pi 编码智能体 TUI**
（`@earendil-works/pi-coding-agent`，即 `pi` CLI）。与 SDK 测试框架
（cursor / copilot / antigravity）不同，它**不会**在进程内运行：`omnigent pi`
会确保主机守护进程已启动，该守护进程会生成一个**运行器**，由运行器在其管理的
**tmux** 终端中启动 `pi`，然后你的 TTY 会附加到该终端。Omnigent Web UI
中的轮次通过**文件收件箱桥接器**和一个打包的 **JS 扩展**
（`pi.sendUserMessage`）转发到这个实时运行的 `pi` 进程中。本技能提供了一套经过验证的流程，
用于**真正针对实时本地服务器和运行器**运行它，而不仅仅是运行单元测试。

> 与其他测试框架一样，运行器会从你的**当前检出版本**中导入代码，因此
> 在这里进行测试时，运行的正是你当前使用的代码。（由 CWD/venv 选择代码，
> 而不是 `PYTHONPATH`。）

## 实际在哪里运行什么

```
your TTY ── (attach / pexpect) ──► omnigent pi (CLI, local)
                                        │ ensures
                                        ▼
                                  host daemon ──► local Omnigent server (AP)
                                        │ spawns                      ▲
                                        ▼                             │ HTTP
                                  runner ── launches ──► pi (TUI, in tmux)
                                                              │ loads
                                                              ▼
                                                 omnigent pi-native extension (JS)
```

有两种方式可将一个轮次传递给 Pi——两种都要测试：

1. **在 TUI 中输入**（通过你所附加的终端）。这会以原生方式执行 Pi；
   扩展会将对话记录镜像回服务器（`POST …/events`）。
2. **Web / API 消息。**服务器 → 运行器 → **`PiNativeExecutor.run_turn`** →
   `enqueue_user_message()` 写入 `inbox/<ordinal>_msg_*.json` → 常驻
   扩展轮询收件箱 → `pi.sendUserMessage(...)`。这是最值得覆盖的
   测试框架特有路径。

## 前置条件（请先检查这些）

1. **你当前位于想要测试的分支上**，并且从该检出版本运行
   （使用此仓库中的 `.venv/bin/omnigent` / `.venv/bin/python`）。
2. **`pi` CLI 位于 PATH 中**——没有它，测试框架便无法启动：
   ```bash
   which pi && pi --version
   # install if missing:  npm install -g @earendil-works/pi-coding-agent
   # or point at an explicit binary:  export OMNIGENT_PI_PATH=/path/to/pi
   .venv/bin/python -c "from omnigent.onboarding.harness_readiness import harness_is_configured; print('pi-native ready:', harness_is_configured('pi-native'))"
   ```
3. **`tmux` 位于 PATH 中。**原生封装器会将你的 TTY 附加到
   运行器管理的 Pi tmux 窗格（如果缺少它，`_preflight_local_tools` 会直接失败）。
4. **`node` 位于 PATH 中。**该扩展是在 Pi 内执行的 JS（端到端扩展测试也需要它）。
   `node --version`。
5. **身份验证可解析（仅限布尔值/ID——绝不要打印密钥）。**原生 Pi
   通常从它自己的 `~/.pi/agent` 登录。Omnigent 则会桥接你通过
   `omnigent setup` 设置的提供商，写入由系统管理的每会话 `models.json`，
   并传递 `--provider omnigent --model <resolved>`。验证它将使用的配置：
   ```bash
   .venv/bin/python -c "from omnigent.pi_native_credentials import resolve_pi_native_provider as r; p=r(); print('provider:', getattr(p,'provider_id',None), '| api:', getattr(p,'api',None), '| model:', getattr(p,'model',None))"
   ```
   `None` → 未配置 omnigent 提供商；Pi 会回退到它自己的 `/login`
   （运行 `omnigent setup`，或直接登录 `pi`）。Databricks 默认配置
   会解析为 AI-Gateway 的 `anthropic-messages` 接口，并使用刷新的
   bearer token。
6. **能够通过网络访问模型后端。**在受严格限制的主机上，如果某个轮次挂起或连接失败，
   通常是网络出口问题，而不是测试框架的缺陷。

## 第 1 步——启动本地服务器（真实服务器 + runner）

```bash
cd /path/to/omnigent
.venv/bin/omni server --background          # detached managed server on a free loopback port
.venv/bin/omni server status         # prints the URL, e.g. http://127.0.0.1:6767
SERVER=http://127.0.0.1:6767         # use the printed URL below
curl -s "$SERVER/health"             # {"status":"ok"}
```

（`omnigent pi --server ""` 也会自动启动一个持久化的本地服务器并使用它——这对于一次性的手动运行很方便，但对于下文通过脚本观察 API，使用一个已知的 `$SERVER` URL 更合适。）

## 第 2 步——启动原生 Pi 终端并连接到本地服务器

`omnigent pi` **会附加一个交互式 TUI**，因此请在能够让它持续运行的地方启动。可采用两种模式：

**A. 后台终端（推荐用于脚本化驱动）。** 在一个终端中启动它，并从另一个终端进行驱动和观察：

```bash
.venv/bin/omnigent pi --server "$SERVER" 2>&1   # attaches the Pi TUI; leave it running
```

它会向 stderr 输出 `Web UI: <url>` 和恢复提示——从中获取会话 id（`…/c/<conv_…>` 这一段）。将其保存下来，供下面的 API 调用使用：

```bash
CONV=conv_xxxxxxxx   # from the "Web UI:" line / resume hint
```

**B. PTY 驱动程序（完全自动化）。** 使用 `pexpect` 驱动它，方式与 `claude-native-e2e-test` skill 的 `cuj_driver.py` 完全相同（这是一个经过验证、可推广的基础方案）：在 PTY 中以 `cwd=<checkout>` 启动 `omnigent pi --server <url>`，从输出的 URL 中捕获 conv id，发送按键输入／轮询 API，然后**终止整个进程树**（参见清理——`pexpect` 的 Ctrl-C 只会*脱离* tmux）。

需要透传的 Pi CLI 参数放在命令之后（持久化为 `terminal_launch_args`），例如 `omnigent pi --server "$SERVER" -- --model <id>`；配置了 provider 时，omnigent 仍会注入 `--provider omnigent --model <resolved>`（参见 `pi_native_credentials.py`）。

## 第 3 步——驱动一轮对话（并进行冒烟测试）

**通过 web/bridge 路径（会执行 `PiNativeExecutor`）。** 向正在运行的会话发送一条用户消息；runner 会通过 harness → bridge inbox → extension → `pi.sendUserMessage` 路由该消息：

```bash
curl -s -X POST "$SERVER/v1/sessions/$CONV/events" \
  -H 'content-type: application/json' \
  -d '{"type":"message","data":{"role":"user","content":[{"type":"input_text","text":"Reply with exactly the single word: PONG"}]}}'
```

然后**观察**镜像后的对话记录（extension 会通过 `POST …/events` 将 Pi 的输出转发回来）：

```bash
sleep 20
curl -s "$SERVER/v1/sessions/$CONV/items" | python -m json.tool | tail -40
```

正常运行时，会看到你的 `user` 消息**以及**一个非空的 `assistant` 回复（`PONG`）被镜像到会话中——这证明了整个链路均可正常工作：server → runner → harness → inbox → extension → Pi → transcript forwarder。你还会看到 Pi 在所附加的 TUI 中渲染该消息。

- **输入驱动的冒烟测试：** 不使用 POST，而是直接在所附加的 TUI 中输入提示词，并确认它能够回答且回复会镜像到 `…/items`。
- **指定模型：** 参见第 2 步中的参数透传说明；在 Prereq-5 探测中确认解析后的模型。

## 检查桥接目录（调试）

测试框架为某个会话写入的所有内容都位于经过哈希处理的桥接目录下：

```bash
.venv/bin/python -c "from omnigent.pi_native import pi_bridge_dir_for_session as d; print(d('$CONV'))"
# ~/.omnigent/pi-native/<sha256(conv)[:32]>/
#   inbox/                 <- *.json user_message / interrupt payloads (poller drains + deletes)
#   sessions/              <- pi --session-dir state
#   config.json            <- sessionId, serverUrl, inboxDir, authHeaders (extension config)
#   omnigent_pi_native_extension.js
ls -la "$(.venv/bin/python -c "from omnigent.pi_native import pi_bridge_dir_for_session as d; print(d('$CONV'))")/inbox"
```

如果排队的消息始终未到达 Pi，请观察 `inbox/*.json` 是否被取走。托管的 Pi 配置目录（`PI_CODING_AGENT_DIR`）中保存了生成的 `models.json`，该文件用于连接 Pi 的提供商/模型。关键环境变量：`HARNESS_PI_NATIVE_BRIDGE_DIR`、`HARNESS_PI_NATIVE_REQUEST_SESSION_ID`、`OMNIGENT_PI_NATIVE_CONFIG`、`OMNIGENT_PI_PATH`（旧版为 `HARNESS_PI_PATH`）、`PI_CODING_AGENT_DIR`。

## 针对性场景

| 目标 | 操作方式 |
|------|-----|
| Web→Pi 传递 | POST 一条消息（步骤 3）；确认出现新的 `inbox/*.json`，随后被取走，并且回复被镜像到 `…/items` |
| 原生工具（shell/edit/read） | 提示 Pi 创建→读取→编辑文件并运行 shell 命令；确认它确实修改了磁盘 |
| 恢复 | 停止 TUI，运行 `omnigent pi --server "$SERVER" --resume "$CONV"`——将重新连接；`--resume`（无值）会打开 pi-native 选择器 |
| 中断 | 在轮次执行期间，将中断加入队列（`pi_native_bridge.enqueue_interrupt(bridge_dir)`），或使用 UI 中的停止功能；确认 Pi 的 `abort()` 被触发，且下一轮未受影响（参见 `test_pi_native_interrupt_replay_e2e.py`） |
| 策略/防护规则 | 添加一条拒绝某个关键字的防护规则；原生 Pi 工具调用由扩展通过 POST `…/policies/evaluate` 进行管控（而不是由轮次范围的求值器管控）——确认 DENY 会阻止调用 |
| 模型路由 | 切换配置的提供商/模型；重新检查前置条件 5 中的探针，并确认回答仍能正常返回 |
| 并发/泄漏 | 驱动多个会话；然后全面检查是否存在孤立的 `pi` / runner / tmux 进程（参见“清理”） |

## 注意事项（这些问题确实会耗费大量时间）

1. **这是 TUI，不是 `omni run`。** 请使用 `omnigent pi`。pi-native 不存在 `omni run <bundle>` 路径；执行器只会将内容加入桥接队列——Pi 必须处于运行状态（已连接），轮次才能得到处理。
2. **`config.yaml` 中的 `server:` 默认指向远程服务器。** 始终传入 `--server "$SERVER"`（或传入 `--server ""` 以自动启动本地服务器）。如果*本地*服务器拒绝 `pi-native`，说明它运行的是过时代码——请从你的检出目录重新启动它（允许列表：`omnigent/spec/_omnigent_compat.py`）。
3. **没有身份验证就无法使用实时 LLM。** 如果前置条件 5 中的探针输出 `None`，并且 `pi` 尚未登录，则轮次不会获得真实回答。请通过 `omnigent setup` 配置提供商，或使用 `pi` 的 `/login`。
4. **CLI 进程必须能够访问 tmux。** 直接连接 tmux 要求在本地可见由 runner 所有的套接字；缺少套接字或 `tmux` 会导致连接失败。
5. **每个轮次大约需要 20–90 秒**——请为脚本等待时间/`timeout` 设置充足余量。
6. **绝不要打印/回显提供商密钥或网关令牌。** 请使用上面的布尔值/ID 探针。

## 代码与测试

- **执行器（桥接入队）：** `omnigent/inner/pi_native_executor.py`
- **封装器包装（`harness: pi-native`）：** `omnigent/inner/pi_native_harness.py`
- **CLI 启动 / 守护进程运行器 / tmux 附加：** `omnigent/pi_native.py`
  （`run_pi_native`）；`omnigent/cli.py` 中的 CLI 命令 `pi(...)`
- **桥接器（收件箱、扩展/配置写入器）：** `omnigent/pi_native_bridge.py`
- **身份验证/模型 → Pi `models.json`：** `omnigent/pi_native_credentials.py`
- **扩展（JS，轮询收件箱，发送事件/策略）：**
  `omnigent/resources/pi_native/omnigent_pi_native_extension.js`
- **就绪门控：** `omnigent/onboarding/harness_readiness.py`

```bash
.venv/bin/python -m pytest \
  tests/test_pi_native_bridge.py \
  tests/test_pi_native_credentials.py \
  tests/test_pi_native_extension.py \
  tests/test_pi_native_interrupt_replay_e2e.py -q   # interrupt e2e needs `node`
# JS unit tests: node omnigent/resources/pi_native/omnigent_pi_native_extension.test.js
```

## Bug 排查（扇出）

针对同一个 `$SERVER`，使用多个场景探针对封装器进行压力测试：web→收件箱→扩展的传递路径（消息丢失 / 收件箱无法清空）、中断重放语义、原生工具策略门控、转录转发器的保真度（每个助手块是否都到达 `…/items`？）、恢复/重新附加，以及拆除后遗留的 `pi`/运行器/tmux。交叉检查 API——启动失败可能会导致 TUI 为空，而会话中却记录了错误。

## 代码中的注意事项（请在实际运行中验证——并非实时 Bug 排查日志）

- **收件箱为空 = 没有轮次。** `PiNativeExecutor` 在消息被*排入队列*后就会生成 `TurnComplete`，而不是等到 Pi *回复*后；实际回复由扩展异步提供。应根据 `…/items` 判断成功与否，而不是根据 POST 是否返回 `queued: true`。
- **原生 Pi 工具调用会绕过轮次范围的评估器。** 它们仅受扩展的 `POST …/policies/evaluate` 门控；如果扩展的 `config.json` 缺少 `serverUrl`/`authHeaders`，门控会静默失效。
- **重建会话时的历史记录**依赖桥接目录下 Pi 自身的 `--session-dir` 状态，而非 Omnigent 重新注入转录。

## 拆除——不可妥协

pexpect 的 Ctrl-C **只会与 tmux 分离**；运行器、tmux 服务器和 `pi` 会继续运行。从子进程 PID 开始拆除进程树（`ps --ppid …` → SIGTERM/SIGKILL），并单独执行 `tmux -S <sock> kill-server`（tmux 服务器会被重新挂接到 init）。然后确认没有任何进程残留：

```bash
.venv/bin/omni server stop                 # stop the managed server + local daemon
pgrep -af "(^|/)pi( |$)|harnesses\._runner|runner\._entry|tmux"   # confirm no orphans
# remove a session's bridge dir if you want a clean slate:
# rm -rf "$(.venv/bin/python -c "from omnigent.pi_native import pi_bridge_dir_for_session as d; print(d('$CONV'))")"
```

## 诚实原则

如果无法进入就绪的 Pi TUI（缺少 `pi`、没有 `tmux`/`node`、没有身份验证、无头环境限制），请如实说明——不要声称某个轮次已经通过。最有力的证据是通过 API 观察到的往返过程：你的 `user` 消息以及非空的 `assistant` 回复都被镜像到 `GET /v1/sessions/$CONV/items` 中。