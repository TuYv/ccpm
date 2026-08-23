---
name: antigravity-sdk-e2e-dev
description: Spin up a live local Omnigent server and exercise the Antigravity (Gemini) SDK harness end-to-end — build antigravity agents, run real turns, smoke-test, and bug-bash. Load when developing, testing, or debugging the antigravity harness (omnigent/inner/antigravity_executor.py, antigravity_harness.py, omnigent/onboarding/antigravity_auth.py) or its auth / model / tool-bridge behavior.
---
# Antigravity SDK 运行框架：端到端开发与测试

`antigravity` 运行框架驱动 Google 的 **Antigravity Python SDK**
（`google-antigravity`，即进程内的 `Agent`/`Conversation`），并将
Omnigent 的 `sys_*` 工具作为 `custom_tools` 桥接到该 SDK 中。它是 **Gemini 原生的**：
使用 Gemini / Antigravity API 密钥（或 Vertex AI）进行身份验证，并且**没有
OpenAI 兼容网关 / Databricks 路径**。本技能提供了一套经过验证的方法，
用于针对实时本地服务器**真正运行**该框架，而不仅仅是运行单元测试。

> 该运行框架会从你当前检出的代码中作为**本地运行器**运行，因此
> `omni run <bundle> --server <url>` 测试的正是你当前使用的代码。

## 前置条件（请先检查这些条件）

1. **你当前位于要测试的分支。** Antigravity 运行框架已合并到
   `main`（#194）。除非要验证特定分支，否则请在 `main` 上测试。
2. **已配置 Gemini API 密钥。** 该 SDK *必须*使用密钥（`AIza…`）；
   不提供登录流程。请进行验证（仅输出布尔值——切勿打印密钥）：
   ```bash
   .venv/bin/python -c "from omnigent.onboarding.antigravity_auth import antigravity_api_key_configured as c; import os; print('config:', c(), 'env:', bool(os.environ.get('GEMINI_API_KEY') or os.environ.get('ANTIGRAVITY_API_KEY')))"
   ```
   如果两者均为 `False`，请运行 `omni setup` → **Antigravity** 并粘贴一个密钥，或者
   `export GEMINI_API_KEY=AIza…`。
3. **已安装 `google-antigravity`**（`antigravity` 额外依赖项——
   `pip install "omnigent[antigravity]"`）：
   `.venv/bin/python -c "import google.antigravity as a; print(a.__file__)"`。
4. **glibc ≥ ~2.36。** 该 SDK 会启动一个**原生 `localharness` 二进制文件**，
   它需要较新的 glibc（`GLIBC_ABI_DT_RELR`）。请运行 `ldd --version | head -1` 检查。
   在较旧的主机上，轮次会在设置阶段失败并显示
   `RuntimeError: … localharness: … version 'GLIBC_ABI_DT_RELR' not found`。在
   glibc-2.31 主机上的开发环境变通方法：通过
   `ANTIGRAVITY_HARNESS_PATH=/path/to/shim` 将 SDK 指向一个加载器垫片，
   由该垫片通过较新 glibc 的加载器运行*未经修改的*捆绑二进制文件
   （参阅自动记忆说明 `antigravity-harness-glibc-native-binary.md`）。
   该垫片仅用于开发——真正的解决方案是使用 glibc-≥2.36 的主机。
5. **能够通过网络连接 Gemini 后端。** 该原生二进制文件会与
   Google 的 API 通信；在网络受限的主机上，如果某一轮次挂起或连接失败，
   通常是网络出口问题，而不是运行框架缺陷。

## 第 1 步——启动本地服务器

```bash
cd /path/to/omnigent
.venv/bin/omni server --background          # spawns a detached server on a free loopback port
.venv/bin/omni server status         # prints the URL, e.g. http://127.0.0.1:6767
```

在下文中，将**输出的 URL**用作 `$SERVER`。（你也可以使用
`omnigent server --port 7777 --no-open` 在固定端口上运行前台服务器。）

## 第 2 步——构建 Antigravity 智能体包

包含 `spec_version` 的规范**必须是一个包含 `config.yaml` 的目录**——
而不能是单个 `.yaml` 文件。最小化 Antigravity 智能体（无 `auth:` 块 → 
它会从 `antigravity:` 配置 / 环境变量中解析密钥）：

```bash
mkdir -p /tmp/agy-dev
cat > /tmp/agy-dev/config.yaml <<'YAML'
spec_version: 1
name: agy-dev
description: Antigravity SDK dev/test agent.
executor:
  type: omnigent
  config:
    harness: antigravity
    model: gemini-3.5-flash      # default; gemini-3-pro 404s on a plain AI-Studio key
prompt: |
  You are a terse test agent. Answer in as few words as possible.
YAML
```

对于子代理、工具、护栏/策略，请从
`examples/polly/config.yaml` 和 `examples/debby/config.yaml` 复制字段结构。

## 第 3 步——运行一个轮次（并进行冒烟测试）

```bash
SERVER=http://127.0.0.1:6767   # the URL from `omni server status`
timeout 280 .venv/bin/omni run /tmp/agy-dev \
  -p "Reply with exactly the single word: PONG" \
  --server "$SERVER" 2>&1
```

一次正常的运行会先输出连接信息，然后输出助手回复（`PONG`）。如果
运行成功，则说明整个技术栈均正常：Gemini 密钥、glibc/原生二进制文件、出站网络、
流式传输、harness。

- **Shell / 文件工具：**添加 `--tools coding`。
- **指定模型：**添加 `--model gemini-2.5-flash`（或其他 Gemini id）。

## 针对性场景

| 目标 | 方法 |
|------|-----|
| 原生工具（shell/edit/read） | 使用 `--tools coding`，提示代理创建→读取→编辑文件并运行 shell 命令；确认它确实操作了磁盘 |
| 桥接的 `sys_*` / 子代理分派 | 声明一个子代理（`tools.agents`/`spawn`），提示代理进行委派——这会测试 `custom_tools` 桥接 + `PostToolCallHook` |
| 模型路由 | 使用多个 `--model` Gemini id 运行同一个 bundle；记录哪些模型实际能够运行 |
| Vertex AI 身份验证 | 设置 `executor.config.vertex: true` + `project`/`location`，并使用 GCP 应用默认凭据代替 API 密钥 |
| 策略 / 护栏 | 添加一个拒绝某个关键词的护栏；确认它会阻止请求（参见下面的**棘手问题**——合并时，LLM 阶段 + 工具调用的强制执行尚不完整） |
| 每会话 brain 覆盖 | 运行一个 bundle 代理（polly/debby），并选择 `antigravity` 作为 brain harness（它位于 `BRAIN_HARNESS_LABELS` 中） |
| 并发 / 泄漏 | 同时启动多个 `omni run … &`；然后运行 `pgrep -af localharness`，检查是否存在孤立的原生子进程 |

## 注意事项（这些问题确实很耗时间）

1. **`config.yaml` 中的 `server:` 默认指向一个*远程*服务器。**省略
   `--server` 会将你的轮次发送到该远程部署——它可能已经**过时**，并且会以
   `executor.config.harness: must be one of […], got 'antigravity'` 为由拒绝 antigravity harness。
   进行本地测试时，**务必传入 `--server http://127.0.0.1:<port>`**。
   （该允许列表位于 `omnigent/spec/_omnigent_compat.py`；如果*本地*服务器拒绝
   `antigravity`，说明它正在运行过时的代码——请从你的 checkout 中重启它。）
2. **包含 `spec_version` 的 spec 必须是一个目录 + `config.yaml`**，绝不能是
   单个 `.yaml` 文件。
3. **Antigravity 需要 Gemini 密钥**（无需登录）。解析优先级：spec
   `executor.auth`（api_key）> 已存储的 `antigravity:` 配置块（`omni setup`）
   > 环境中的 `GEMINI_API_KEY` / `ANTIGRAVITY_API_KEY`。Vertex AI 需通过
   `executor.config` 中的 `vertex`/`project`/`location` 显式启用。
4. **不支持 OpenAI gateway / Databricks。**该 SDK 没有 `base_url`；`databricks`
   或通用 `provider` 身份验证会被**警告并忽略**，运行会回退到环境中的 Gemini 凭据。
   不要指望 `databricks-*` 模型像 claude-sdk/codex/pi 那样通过
   AI Gateway 进行路由。
5. **模型 id 是 Gemini id。**默认为 `gemini-3.5-flash`。`gemini-3-pro`
   **使用普通 AI-Studio 密钥时会返回 404**——除非你的密钥拥有 Pro 访问权限，否则请使用
   `gemini-2.5-flash` / `gemini-3.5-flash`。
6. **原生二进制文件需要 glibc ≥ ~2.36**（参见前提条件 4）。这是
   “它甚至无法启动”最常见的原因；在认定是 harness bug 之前，请先检查这一点。
7. **每个轮次大约需要 10–60 秒**——始终使用 `timeout 280` 包裹命令。
8. **本地运行器拓扑：**`omni run <bundle> --server <url>` 会从你的
   **当前 checkout** 运行 harness；服务器仅保存状态。托管的
   `omni server --background` 服务器从启动它的 venv 运行。
9. **切勿在日志或命令中打印/回显 Gemini 密钥。**

## 代码与测试

- **执行器（SDK 驱动程序）：** `omnigent/inner/antigravity_executor.py`
- **封装（HARNESS_ANTIGRAVITY_* 环境变量 → 执行器）：** `omnigent/inner/antigravity_harness.py`
- **身份验证 / 密钥解析：** `omnigent/onboarding/antigravity_auth.py`
- **生成环境：** `omnigent/runtime/workflow.py` 中的 `_build_antigravity_spawn_env`

```bash
# Unit tests (use --frozen; the cwsandbox extra is unsatisfiable on public PyPI here)
uv run --frozen --group test python -m pytest \
  tests/inner/test_antigravity_executor.py \
  tests/inner/test_antigravity_harness.py \
  tests/runtime/test_antigravity_spawn_env.py \
  tests/onboarding/test_antigravity_auth.py -q
# (or, if uv re-resolve is blocked on your host: .venv/bin/python -m pytest <same paths> -q)
```

目前还没有受门控的、针对单个工具封装的 antigravity 端到端测试（它被有意排除在
`tests/e2e/omnigent/test_run_harness_without_agent_e2e.py` 中实时运行的无 AGENT 工具封装矩阵之外，因为该矩阵
通过 Databricks 网关进行身份验证，而 antigravity 原生使用 Gemini）。
此技能就是实时覆盖。

## Bug 大排查（扇出）

若要对工具封装进行压力测试，请并行运行多个场景探针——每个探针都会构建一个
bundle，并针对同一个 `$SERVER` 运行真实轮次，然后报告出现的问题。
最具价值的目标包括：`custom_tools` 桥接（挂起 / 工具结果丢失 /
将错误报告为成功）、模型路由、策略执行、流式输出
渲染、跨轮次的历史记录保留，以及拆除后遗留的 `localharness`
进程。

## 已知的棘手问题（通过合并审查发现——“截至撰写本文时”）

其中一些问题按原样合并，且已有**正在推进的修复 PR（#276–#281）**——请针对
你签出的版本进行验证：

- **原生/内置工具会绕过 TOOL_CALL 策略。** 合并时只安装了一个
  `PostToolCallHook`（执行后触发，无法阻止），因此 DENY/ASK 防护规则无法在 SDK 的原生 shell/文件工具
  运行之前对其进行管控。桥接的 `sys_*` 工具会通过服务器进行路由。*（修复：策略执行 PR。）*
- **`run_turn` 中未评估 LLM_REQUEST / LLM_RESPONSE 策略**（提示词
  拒绝 / 输出阻止会被静默忽略）。*（修复：策略执行 PR。）*
- **全新/重建会话中的历史记录。** SDK 没有历史记录注入 API，
  因此前序轮次会以纯文本 `"Conversation so far: …"` 前缀的形式重放
  （仅包含用户/助手文本；不会重建工具调用）。*（PR #278。）*
- **`sys_list_models` 可能会为 antigravity 过多报告 OpenAI 系列模型**
  （为进行共享查找，它被映射到了 openai 系列）；worker 仅运行
  Gemini。*（修复：openai 系列清理 PR。）*
- **每会话 `/model` 覆盖设置**曾因错误的“无管道支持”
  错误而被拒绝。*（PR #276。）* **全局 `auth:`（一个 OpenAI 密钥）**可能会被用作
  Gemini 密钥。*（PR #277。）* **工具参数 schema** 曾被丢弃（模型无法获知
  参数结构）。*（PR #279。）*
- **失败的轮次**（例如 glibc 错误、错误的模型）会表现为一个 `failed`
  会话和一个错误项——如果某个轮次返回的内容很少，请检查
  `GET /v1/sessions/{id}` 的状态和 `…/items`，而不要假定执行成功。

## 清理

```bash
.venv/bin/omni server stop      # stop the managed background server
rm -rf /tmp/agy-dev             # remove scratch bundles
pgrep -af "localharness"        # confirm no orphaned native subprocesses linger
```