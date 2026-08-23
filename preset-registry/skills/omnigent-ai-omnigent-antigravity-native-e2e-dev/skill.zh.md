---
name: antigravity-native-e2e-dev
description: Spin up a live local Omnigent server + runner and exercise the native Antigravity (agy) TUI harness (antigravity-native) end-to-end — launch the real `agy` CLI via `omnigent antigravity`, drive turns through the web UI, smoke-test, and bug-bash. Load when developing, testing, or debugging the antigravity-native harness (omnigent/inner/antigravity_native_executor.py, omnigent/antigravity_native.py, antigravity_native_bridge.py, antigravity_native_rpc.py, antigravity_native_reader.py, antigravity_native_launch.py) or its agy launch / RPC mirror / tmux delivery / OAuth / MCP-relay behavior. NOT the in-process `antigravity` Gemini SDK harness.
---
# Antigravity 原生工具框架：端到端开发与测试（本地服务器/运行器）

`antigravity-native` 工具框架封装了**真正的 Antigravity `agy` TUI**（即
`agy` CLI，通过 `antigravity.google/cli/install.sh` 安装）。`omnigent
antigravity` 会确保主机守护进程处于运行状态，由守护进程生成的**运行器**会在运行器拥有的
**tmux** 终端中启动 `agy`，然后你的 TTY 会连接到该终端。这**不是**
进程内的 `antigravity` Gemini-SDK 工具框架——后者使用 Gemini *API 密钥*运行 `google-antigravity`；
而本工具框架驱动仅支持 OAuth 的 `agy` CLI，并通过 **connect-RPC** 对其进行镜像。
本技能是一套已经过验证的方案，用于**真正连接到实时本地服务器和运行器**
来运行它——而不只是运行单元测试。

> 与其他原生工具框架一样，运行器从你的**当前检出版本**导入，因此在这里进行测试时，
> 实际运行的正是你当前使用的代码。（由 CWD/venv 选择代码，而不是 `PYTHONPATH`。）

## 实际在哪里运行哪些内容

```
your TTY ── (attach / pexpect) ──► omnigent antigravity (CLI, local)
                                        │ ensures
                                        ▼
                                  host daemon ──► local Omnigent server (AP)
                                        │ spawns                      ▲
                                        ▼                  connect-RPC │ HTTP
                                  runner ── launches ──► agy (TUI, in tmux)
                                        │                              │
                                        ├── write path: type web turns into the TUI
                                        │   (tmux bracketed paste → real USER_INPUT step)
                                        └── read path: RPC read driver mirrors agy's
                                            trajectory steps back into the session
```

有三种传输方式，很容易混淆：

1. **写入路径 = 在 TUI 中输入。** 每个 Web/移动端轮次都会通过 tmux
   *输入*到 agy 窗格中（`inject_user_message_via_tui`），从而在 TUI 所显示的
   **同一个**级联上创建真正的 `CORTEX_STEP_TYPE_USER_INPUT` 步骤
   (#1156/#1158)。它**不是**通过 `SendUserCascadeMessage` 传递的（该无头
   RPC 路径已弃用；`antigravity_native.py` 模块头部仍写着“通过 RPC 传递”
   ——这是文档更新滞后，执行器的行为才是权威依据）。
2. **读取路径 = RPC。** `antigravity_native_reader` 轮询/流式读取 agy 的 connect-RPC
   轨迹步骤，并将其镜像到 Omnigent 会话中。
3. **控制 = RPC。** 中断使用 `CancelCascadeSteps`；工具/权限提示通过
   `HandleCascadeUserInteraction` 回答（在 Omnigent 中呈现为信息征询）。

## 前置条件（请先检查这些）

1. **你位于想要测试的分支上**，并从该检出版本运行
   （使用此仓库中的 `.venv/bin/omnigent` / `.venv/bin/python`）。
2. **`agy` CLI 位于 PATH 中**（或位于 `~/.local/bin/agy`）——缺少它时，
   工具框架无法启动：
   ```bash
   which agy || ls -l ~/.local/bin/agy
   agy --version
   # install if missing (shell installer, NOT npm):
   #   curl -fsSL https://antigravity.google/cli/install.sh | bash   # then restart shell
   .venv/bin/python -c "from omnigent.onboarding.harness_readiness import harness_is_configured; print('antigravity-native ready:', harness_is_configured('antigravity-native'))"
   ```
3. **`agy` 已登录（OAuth）。** agy **仅支持 OAuth**——它没有 `agy login`；
   你需要直接运行一次 `agy`，然后在浏览器中完成登录。它会**忽略
   `GEMINI_API_KEY`**（API 密钥身份验证属于单独的 `antigravity` SDK
   工具框架）。验证方式如下（不会输出任何机密信息）：
   ```bash
   .venv/bin/python -c "from omnigent.onboarding.gemini_auth import gemini_login_detected; print('agy oauth token present:', gemini_login_detected())"
   agy models   # exits 0 and lists models only when signed in; else 'Please sign in'
   ```
   `False` / 非零退出码 → 运行一次 `agy` 并登录。agy 的令牌位于
   `~/.gemini` 下（macOS 上截至 1.0.10 版本使用 `oauth_creds.json`，
   Linux 上使用 `antigravity-cli/antigravity-oauth-token`）；macOS 上的
   agy 1.1.7+ 不会写入令牌文件，而是将凭据保存在钥匙串中，因此
   `gemini_login_detected()` 在该环境中会回退到运行 `agy models`。
4. **`tmux` 位于 PATH 中。** agy 终端是由运行器拥有的 tmux 窗格；CLI
   会连接到该窗格，执行器则通过 `tmux send-keys` 驱动它
   （如果没有 tmux，`_preflight_local_tools` 会直接报错退出）。
5. **能够通过网络访问 Google 的 Antigravity 后端。** 如果在受到严格限制的主机上，
   某个轮次卡住或连接失败，通常是网络出口问题，而不是工具框架缺陷。

> 此处无需 `node`，也无需 provider/gateway 配置（这与 pi/cursor
> native 不同）：agy 是一个自托管二进制文件，身份验证使用继承的 Google OAuth。

## 第 1 步——启动本地服务器（真实服务器 + runner）

```bash
cd /path/to/omnigent
.venv/bin/omni server --background          # detached managed server on a free loopback port
.venv/bin/omni server status         # prints the URL, e.g. http://127.0.0.1:6767
SERVER=http://127.0.0.1:6767         # use the printed URL below
curl -s "$SERVER/health"             # {"status":"ok"}
```

（`omnigent antigravity --server ""` 也会自动生成一个持久化本地服务器并
使用它——这对于一次性手动运行很方便，但对于下文通过脚本观测 API，
使用已知的 `$SERVER` URL 更合适。）

## 第 2 步——启动连接到本地服务器的 agy 终端

`omnigent antigravity` **会附加一个交互式 TUI**，因此请在能够
使其保持打开的位置运行。可采用两种模式：

**A. 后台终端（推荐用于脚本化驱动）。** 在一个
终端中启动，在另一个终端中驱动/观测：

```bash
.venv/bin/omnigent antigravity --server "$SERVER" 2>&1   # attaches the agy TUI; leave it running
# add a model:  --model gemini-2.5-pro   ;   pass-through agy args go at the end
```

它会将 `Web UI: <url>` 和恢复提示打印到 stderr——从中获取会话 ID
（`…/c/<conv_…>` 这一段），用于下文的 API 调用：

```bash
CONV=conv_xxxxxxxx   # from the "Web UI:" line / resume hint
```

**B. PTY 驱动程序（完全自动化）。** 像
`claude-native-e2e-test` skill 的 `cuj_driver.py` 一样，通过 `pexpect`
驱动它：在 PTY 中使用 `cwd=<checkout>` 生成 `omnigent antigravity
--server <url>`，从打印出的 URL 中捕获 conv ID，然后驱动/轮询 API，最后
**拆除整个进程树**
（参见 Teardown——pexpect 的 Ctrl-C 只会*分离* tmux）。

> runner **拥有** agy 终端：绑定 runner 时会自动为会话创建
> antigravity 终端，而 CLI 会*重新附加*，而不是自行启动终端。不要针对同一会话
> 手动启动第二个 `agy`——重复启动会返回 500 并破坏 runner 的桥接状态（之后
> web-turn 注入会失败并提示 "bridge state is missing"）。

## 第 3 步——驱动一个轮次（并进行冒烟测试）

**通过 Web 路径（会执行 `AntigravityNativeExecutor`）。** 向正在运行的会话
发送一条用户消息；runner 会将其路由到 harness，后者的 `_deliver`
会把消息输入 agy TUI（真实的 `USER_INPUT` 步骤）：

```bash
curl -s -X POST "$SERVER/v1/sessions/$CONV/events" \
  -H 'content-type: application/json' \
  -d '{"type":"message","data":{"role":"user","content":[{"type":"input_text","text":"Reply with exactly the single word: PONG"}]}}'
```

然后**观测**镜像后的对话记录（RPC 读取驱动程序会将 agy 的步骤
发回）：

```bash
sleep 25
curl -s "$SERVER/v1/sessions/$CONV/items" | python -m json.tool | tail -40
```

正常运行时，能够看到你的 `user` 消息**以及**镜像到会话中的非空
`assistant` 回复（`PONG`）——这证明了整个堆栈都正常工作：server → runner →
executor → tmux paste → agy turn → connect-RPC read driver → transcript mirror。
你还会看到提示词和回复呈现在已附加的 agy TUI 中（实现一致性正是通过 TUI
输入的写入路径的核心意义）。

- **输入驱动的冒烟测试：** 不要使用 POST，而是直接在已连接的
  agy TUI 中输入提示词，并确认它能回答且同步到 `…/items`。
- **模型：** 使用 agy TUI 的 `/model` 选择模型；下一次 Web 轮次会回显该
  选择（执行器会从最新的 `USER_INPUT` 步骤中读取它）。

## 检查桥接状态（调试）

每个会话的桥接状态都存放在一个哈希目录下（以*桥接 ID* 为键，默认值为
Omnigent 对话 ID）：

```bash
.venv/bin/python -c "from omnigent.antigravity_native_bridge import bridge_dir_for_bridge_id as d; print(d('$CONV'))"
# ~/.omnigent/antigravity-native/<sha256(bridge_id)[:32]>/
#   state.json     <- {session_id, conversation_id (agy's real UUID once minted), active_turn_id}
#   tmux.json      <- {socket_path, tmux_target} the executor types into (send-keys)
#   bridge.json    <- token for the Omnigent MCP relay (sys_* tools)
#   agy-home/.gemini/...  <- per-session ISOLATED HOME: a COPY of your OAuth token
#                            + onboarding markers + config/mcp_config.json (relay)
```

关键事实：
- agy 会生成它**自己的** UUID 级联；全新启动时会先设置一个 `agy_conv_*`
  **占位符**，直到冷启动通过 `StartCascade` 生成真实 ID，并将其写入
  `state.json`（同时通过 PATCH 将其设为 `external_session_id`）。针对
  占位符的 RPC 调用会被跳过——“尚未就绪”。
- **隔离的 HOME**（`agy-home/`）可确保你真实的 `~/.gemini` 永远不会被
  修改：中继的 `mcp_config.json` 和 agy 的每会话状态都存放在那里。
  agy 的 `/mcp` 面板应显示带有 `sys_*` 工具的 `✓ omnigent`。
- 环境变量：`HARNESS_ANTIGRAVITY_NATIVE_BRIDGE_DIR`、
  `HARNESS_ANTIGRAVITY_NATIVE_REQUEST_SESSION_ID`。

## 针对性场景

| 目标 | 方法 |
|------|-----|
| Web→TUI 传递 | POST 一条消息（步骤 3）；确认它显示在 agy TUI 中，并且同步到 `…/items` |
| 原生工具（shell/edit/read） | 提示 agy 创建→读取→编辑文件并运行命令；确认它确实修改了磁盘 |
| Omnigent MCP 中继（`sys_*`） | 在 agy TUI 中运行 `/mcp` → 应显示 `✓ omnigent`；提示 agy 调用 `sys_session_list` / 生成子代理 |
| 权限请求 | 使用需要审批的工具时，agy 的 `request-review` 会以 **Omnigent 引导请求**（交互桥接）的形式呈现；在 Web UI 中作出响应，并确认工具运行 |
| 中断 | 在轮次执行过程中点击 UI 中的停止 → `CancelCascadeSteps`（仅适用于 RUNNING 状态的级联；因交互而处于 WAITING 状态的步骤需要通过 DENY 解除阻塞，而不是取消） |
| 模型回显 | 在 TUI 中使用 `/model`，然后发起 Web 轮次——确认使用了新模型（最新 `USER_INPUT` 步骤的 `planModel`） |
| 恢复 | 停止后运行 `omnigent antigravity --server "$SERVER" --resume "$CONV"`；`--resume`（不带值）会打开 antigravity-native 选择器 |
| 并发 / 泄漏 | 驱动多个会话；在清理后排查是否存在孤立的 `agy` / tmux 进程 |

## 易踩的坑（这些问题确实很耗时间）

1. **这是 TUI，不是 `omni run`。** 使用 `omnigent antigravity`。执行器只会
   将内容传入实时 agy 窗格——agy 必须正在运行（已连接），轮次才能得到
   处理。
2. **`config.yaml` 中的 `server:` 默认指向远程服务器。** 始终传入
   `--server "$SERVER"`（本地模式则使用 `--server ""`）。如果*本地*服务器拒绝
   `antigravity-native`，说明它已过时——请从你的检出代码中重启它
   （允许列表：`omnigent/spec/_omnigent_compat.py`）。
3. **仅支持 OAuth。** agy 会忽略 `GEMINI_API_KEY`；如果 `agy models` 提示“登录”，
   那么任何 Web 轮次都无法获得真实回答。请先单独运行一次 `agy`。
4. **CLI 进程必须能够访问 tmux**，才能直接连接；执行器的 send-keys 会在
   运行器侧针对公布的套接字执行。
5. **隔离的 HOME。** 不要期待你真实的 `~/.gemini` 发生变化——agy 在
   `<bridge_dir>/agy-home` 下运行。调试时请查看那里（以及 agy 自己的对话存储
   `~/.gemini/antigravity-cli`）。
6. **不要为同一会话重复启动 agy**——终端由运行器管理（参见
   步骤 2）。
7. **每个轮次耗时约为 20–120 秒**——请为脚本化等待/`timeout` 留出充足余量。
8. **绝不要打印/回显 OAuth 令牌。** 请使用布尔值/`agy models` 探测。

## 代码与测试

- **执行器（写入路径——向 TUI 中输入）：** `omnigent/inner/antigravity_native_executor.py`
- **Harness 封装（`harness: antigravity-native`）：** `omnigent/inner/antigravity_native_harness.py`
- **CLI 启动 / 守护进程运行器 / tmux 附加：** `omnigent/antigravity_native.py`
  (`run_antigravity_native`)；`omnigent/cli.py` 中的 CLI 命令 `antigravity(...)`
- **agy argv / 身份验证模式 / 权限标志：** `omnigent/antigravity_native_launch.py`
- **桥接器（状态、tmux 投递、隔离的 HOME、MCP 中继）：** `omnigent/antigravity_native_bridge.py`
- **connect-RPC 客户端（端口发现、发送/取消/交互）：** `omnigent/antigravity_native_rpc.py`
- **RPC 读取驱动程序（轨迹镜像）：** `omnigent/antigravity_native_reader.py`
- **步骤 / 交互 / 审计：** `omnigent/antigravity_native_steps.py`,
  `omnigent/antigravity_native_interactions.py`, `omnigent/antigravity_native_audit.py`
- **OAuth 检测：** `omnigent/onboarding/gemini_auth.py`
- **设计/计划文档：** `docs/antigravity-native-rpc-core-design.md`,
  `docs/antigravity-native-rpc-core-plan.md`

```bash
.venv/bin/python -m pytest \
  tests/test_antigravity_native.py \
  tests/test_antigravity_native_bridge.py \
  tests/test_antigravity_native_launch.py \
  tests/test_antigravity_native_rpc.py \
  tests/test_antigravity_native_reader.py \
  tests/test_antigravity_native_steps.py \
  tests/test_antigravity_native_interactions.py \
  tests/test_antigravity_native_audit.py \
  tests/inner/test_antigravity_native_executor.py -q
```

## 缺陷集中测试（并行展开）

针对同一个 `$SERVER` 对 Harness 进行压力测试：web→TUI 投递路径（轮次丢失 /
重复、有终端值守时的 TUI 粘贴竞争）、RPC 读取镜像（每个
agy 步骤是否都会到达 `…/items`？读取器重启后是否有重复项？）、MCP 中继
（`sys_*` 可访问且受门控）、权限请求、中断
（`CancelCascadeSteps`）与处于等待交互状态的步骤之间的对比、模型回显、恢复，以及
拆除后遗留的 `agy`/tmux。交叉核对 API——启动失败时，
TUI 可能保持为空，而会话中会记录错误。

## 代码中的注意事项（实时验证）

- **冷启动前使用占位符。** 在 agy 生成其真实 cascade id 之前，桥接器
  状态中保存的是一个 `agy_conv_*` 占位符，并且会跳过 RPC；过早触发的轮次
  只会排入 TUI 队列。
- **权限门控是全有或全无的，并且是事后执行。** agy 仅支持
  `--dangerously-skip-permissions`（不会触发工具调用前钩子），因此无头启动
  会自动绕过权限，而真正的 Omnigent 门控是权限请求加事后审计
  （`antigravity_native_audit`），而不是对每次工具调用进行事前拦截。
- **过时的模块头部。** `antigravity_native.py` 顶部的文档字符串称 web 轮次
  通过 `SendUserCascadeMessage` RPC 发送——实际执行器会改为向 TUI 中输入
  （#1156/#1158）。以 `antigravity_native_executor.py` 为准。

## 拆除——不可妥协

pexpect Ctrl-C 会从 tmux **分离**；运行器、tmux 服务器和 `agy` 会继续
运行。从子进程 PID 开始拆除进程树（`ps --ppid …` →
SIGTERM/SIGKILL），并另行执行 `tmux -S <sock> kill-server`。然后验证：

```bash
.venv/bin/omni server stop                 # stop the managed server + local daemon
pgrep -af "(^|/)agy( |$)|harnesses\._runner|runner\._entry|tmux"   # confirm no orphans
# clean a session's bridge dir (incl. its isolated agy HOME) if you want a reset:
# rm -rf "$(.venv/bin/python -c "from omnigent.antigravity_native_bridge import bridge_dir_for_bridge_id as d; print(d('$CONV'))")"
```

## 诚实说明

如果你无法进入已就绪的 agy TUI（缺少 `agy`、未登录、没有 `tmux`、
无头环境限制、无法访问外部网络），请如实说明——不要声称某一轮已成功完成。最有力的
证据是通过 API 观察到的往返过程：你的 `user` 消息**以及**一个
非空的 `assistant` 回复均已镜像到 `GET /v1/sessions/$CONV/items` 中，并且
该轮交互已呈现在附加的 agy TUI 中。