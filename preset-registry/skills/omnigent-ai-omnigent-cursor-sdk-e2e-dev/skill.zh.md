---
name: cursor-sdk-e2e-dev
description: Spin up a live local Omnigent server and exercise the Cursor SDK harness end-to-end — build cursor agents, run real turns, smoke-test, and bug-bash. Load when developing, testing, or debugging the cursor harness (omnigent/inner/cursor_executor.py, cursor_harness.py, cursor_auth.py) or its auth / model / tool-bridge behavior.
---
# Cursor SDK 测试框架：端到端开发与测试

`cursor` 测试框架驱动 **Cursor Python SDK**（`cursor_sdk`，即通过本地桥接运行的
`AsyncAgent`），并将 Omnigent 的 `sys_*` 工具作为 SDK `custom_tools` 桥接到
Cursor 中。本技能提供了一套经过验证的方案，用于在实时本地服务器上**真正地**运行它——而不只是运行单元测试。

> 该测试框架会从你当前检出的代码中作为**本地运行器**运行，因此
> `omni run <bundle> --server <url>` 测试的正是你当前使用的代码。

## 前置条件（请先检查这些项目）

1. **你当前位于想要测试的分支上。** cursor 测试框架已合并到
   `main`（#203/#204）。除非要验证特定分支，否则请在 `main` 上测试。
2. **已配置 Cursor API 密钥。** SDK *必须*使用 API 密钥
   （`crsr_…`）；无法通过 `cursor-agent login` 完成登录。请验证（仅输出布尔值——
   切勿打印密钥）：
   ```bash
   .venv/bin/python -c "from omnigent.onboarding.cursor_auth import cursor_api_key_configured; import os; print('config:', cursor_api_key_configured(), 'env:', bool(os.environ.get('CURSOR_API_KEY')))"
   ```
   如果两者均为 `False`，请运行 `omni setup` 并注册 Cursor 密钥，或者
   `export CURSOR_API_KEY=crsr_…`。
3. **已安装 `cursor-sdk`**（基线依赖项）：
   `.venv/bin/python -c "import cursor_sdk; print(cursor_sdk.__file__)"`。
4. **能够通过网络访问 Cursor 后端。** 桥接子进程会与
   Cursor 自有的 API 通信；在网络受限的主机上，如果某轮交互卡住或连接失败，
   通常是网络出口问题，而不是测试框架的缺陷。

## 第 1 步——启动本地服务器

```bash
cd /path/to/omnigent
.venv/bin/omni server --background          # spawns a detached server on a free loopback port
.venv/bin/omni server status         # prints the URL, e.g. http://127.0.0.1:6767
```

在下文中，将**打印出的 URL**用作 `$SERVER`。（你也可以使用
`omnigent server --port 7777 --no-open`，在固定端口上运行前台服务器。）

## 第 2 步——构建 cursor 智能体 bundle

包含 `spec_version` 的 spec **必须是一个包含 `config.yaml` 的目录**——
而不能是单个 `.yaml` 文件。最小化的 cursor 智能体如下：

```bash
mkdir -p /tmp/cursor-dev
cat > /tmp/cursor-dev/config.yaml <<'YAML'
spec_version: 1
name: cursor-dev
description: Cursor SDK dev/test agent.
executor:
  type: omnigent
  config:
    harness: cursor
    # model: gpt-5            # optional; omit for cursor "auto"
prompt: |
  You are a terse test agent. Answer in as few words as possible.
YAML
```

对于子智能体、工具、防护措施/策略，请参考
`examples/polly/config.yaml` 和 `examples/debby/config.yaml` 中的字段结构。

## 第 3 步——运行一轮交互（并进行冒烟测试）

```bash
SERVER=http://127.0.0.1:6767   # the URL from `omni server status`
timeout 280 .venv/bin/omni run /tmp/cursor-dev \
  -p "Reply with exactly the single word: PONG" \
  --server "$SERVER" 2>&1
```

正常运行时会先打印连接信息，然后打印助手回复（`PONG`）。如果
成功运行，则说明整个技术栈均工作正常：密钥、网络出口、桥接和测试框架。

- **Shell / 文件工具：**添加 `--tools coding`。
- **指定模型：**添加 `--model gpt-5`（或 `composer-1`、`auto`、
  `databricks-claude-opus-4-8` 等）。

## 目标场景

| 目标 | 方法 |
|------|-----|
| 原生工具（shell/edit/read） | 使用 `--tools coding`，提示创建→读取→编辑文件并运行 shell 命令；确认它确实对磁盘进行了操作 |
| 桥接的 `sys_*` / 子代理分派 | 声明一个子代理（`tools.agents`/`spawn`），提示 Cursor 代理进行委派——这会测试 `custom_tools` 守护线程桥接（`run_coroutine_threadsafe`） |
| 模型路由 | 使用多个不同的 `--model` 值运行同一个 bundle；记录实际运行的是哪个模型 |
| 策略 / 护栏 | 添加一个拒绝特定关键字的护栏；确认 `PHASE_LLM_REQUEST`/`PHASE_LLM_RESPONSE` 会阻止它 |
| 并发 / 泄漏 | 同时启动多个 `omni run … &`；然后运行 `pgrep -af "cursor-sdk-bridge|cursor_sdk"`，检查是否存在孤立的桥接子进程 |

## 注意事项（这些问题会耗费大量时间）

1. **`config.yaml` 中的 `server:` 默认指向*远程*服务器**（例如
   Databricks Apps URL）。省略 `--server` 会将你的请求发送到该远程
   部署——它可能已经**过时**，并会拒绝 Cursor harness，报错
   `executor.config.harness: must be one of […], got 'cursor'`。进行本地测试时，**务必传入
   `--server http://127.0.0.1:<port>`**。（该允许列表位于
   `omnigent/spec/_omnigent_compat.py`；如果*本地*服务器拒绝 `cursor`，
   说明它运行的是过时代码——请从你的 checkout 中重启它。）
2. **包含 `spec_version` 的 spec 必须是一个目录并包含 `config.yaml`**，绝不能是
   单个 `.yaml` 文件。
3. **Cursor 需要 `crsr_` API 密钥**（不支持 CLI 登录）。解析优先级：
   spec 中的 `executor.auth`（api_key）> 已存储的 `cursor:` 配置块（`omni
   setup`）> 环境中的 `CURSOR_API_KEY`。
4. **不使用 Databricks gateway。** Cursor 仅与 Cursor 后端通信，因此
   `databricks-*` 模型会被静默解析为 Cursor 的 `auto`——它*不会*
   像 claude-sdk/codex/pi 那样通过 AI Gateway 进行路由。
5. **使用账户模型目录中的模型 ID。** 裸写的 `gpt-5` **无效**；
   SDK 会拒绝未知 ID。实际环境中已见的有效示例包括：`default`、
   `composer-2.5`、`claude-opus-4-8`、`gpt-5.5`。使用 `--model` 运行并查看
   SDK 的 `Available models:` 列表，以发现当前可用的模型集合。
6. **每轮需要 30–90 秒**——务必使用 `timeout 280` 包装命令。
7. **本地 runner 拓扑：** `omni run <bundle> --server <url>` 使用你的
   **当前 checkout** 运行 harness；服务器仅保存状态。托管的
   `omni server --background` 服务器从启动它的 venv 中运行。
8. **绝不要在日志或命令中打印/回显 Cursor 密钥。**

## 代码与测试

- **执行器（SDK 桥接）：** `omnigent/inner/cursor_executor.py`
- **封装（HARNESS_CURSOR_* env → 执行器）：** `omnigent/inner/cursor_harness.py`
- **身份验证 / 密钥解析：** `omnigent/onboarding/cursor_auth.py`
- **Spawn 环境：** `omnigent/runtime/workflow.py` 中的 `_build_cursor_spawn_env`

```bash
# Unit tests (use --frozen; the cwsandbox extra is unsatisfiable on public PyPI here)
uv run --frozen --group test python -m pytest \
  tests/inner/test_cursor_executor.py \
  tests/runtime/test_cursor_spawn_env.py \
  tests/onboarding/test_cursor_auth.py -q
# Gated end-to-end harness test
uv run --frozen --group test python -m pytest tests/e2e/omnigent/test_per_harness_cursor.py -q
```

## Bug 集中排查（并行展开）

为了对测试框架进行压力测试，请并行运行多个场景探针——每个探针都会构建一个
bundle，并针对同一个 `$SERVER` 执行真实轮次，然后报告出现的问题。
最高价值的测试目标包括：`custom_tools` 桥接（挂起 / 工具结果丢失 /
错误被报告为成功）、模型路由、策略执行、流式输出
渲染，以及拆卸后残留的孤儿桥接进程。

## 已知的棘手问题（通过实时 Bug 集中排查发现——“截至本文撰写时”）

以下是测试期间需要留意的、实际观察到的 cursor 测试框架行为（其中一些问题在你
阅读本文时可能已经修复——请进行验证）：

- **启动失败会被吞掉。** 无效或不可用的 `--model`（或任何
  桥接启动错误）会使 `omni run -p` 以 **0 状态码和空输出**退出，而
  服务器会记录一个 `failed` 会话以及一个用户永远看不到的 `RuntimeError`
  条目。如果某个轮次没有返回任何内容，请检查会话状态 / 条目
  (`GET /v1/sessions/{id}/items`)——不要假定执行成功。（claude-sdk 会呈现
  此类错误；cursor 目前还不会。）
- **内置编码工具会绕过 `on:[tool_call]` 策略。** Cursor 的原生
  shell/文件工具（`--tools coding`）不会发出 `tool_call` 事件，因此
  `on:[tool_call]` 防护规则（例如 `blast_radius`）永远无法感知它们——即使存在 DENY 策略，内置
  shell 仍然可以运行 `git push --force`。**桥接的 `sys_*`
  工具则会被正确管控。** 不要依赖 `on:[tool_call]` 防护规则来约束
  cursor 内置工具。
- **助手文本连写。** 相邻的助手文本块会在没有分隔符的情况下拼接，
  因此前置工具调用说明可能会与工具调用后的回答粘连在一起。
- **非正常退出会留下孤儿桥接进程。** 正常拆卸会回收该进程（
  #221 的 `aclose` 修复有效），但 `SIGKILL`/硬退出会留下一个孤儿
  `cursor-sdk-bridge`。硬终止后，请使用 `pgrep -af cursor-sdk-bridge` 进行排查。

## 清理

```bash
.venv/bin/omni server stop      # stop the managed background server
rm -rf /tmp/cursor-dev          # remove scratch bundles
pgrep -af "cursor-sdk-bridge"   # confirm no orphaned bridge subprocesses linger
```