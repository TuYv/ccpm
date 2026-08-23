---
name: copilot-sdk-e2e-dev
description: Spin up a live local Omnigent server and exercise the GitHub Copilot SDK harness end-to-end — build copilot agents, run real turns, smoke-test, and bug-bash. Load when developing, testing, or debugging the copilot harness (omnigent/inner/copilot_executor.py, copilot_harness.py, omnigent/onboarding/copilot_auth.py) or its auth / model / tool-bridge behavior.
---
# Copilot SDK 运行框架：端到端开发与测试

`copilot` 运行框架驱动 **GitHub Copilot SDK**（`github-copilot-sdk`，
导入名为 `copilot`）——为每个 Omnigent 会话维护持久化的
`CopilotClient` + `CopilotSession`——并将 Omnigent 的 `sys_*` 工具作为 SDK
`Tool` 接入 Copilot。Python SDK **捆绑了其所驱动的 Copilot CLI 二进制文件**
作为后端服务器，因此无需单独安装 `@github/copilot`。本技能提供了一套经过验证的方案，
用于针对实时本地服务器**实际运行**它，而不仅仅是运行单元测试。

> 该运行框架会从你当前检出的代码中作为**本地运行器**运行，因此
> `omni run <bundle> --server <url>` 测试的正是你当前使用的代码。

## 前置条件（请先检查这些项目）

1. **你当前位于想要测试的分支。** copilot 运行框架是一项
   可选附加功能——使用 `uv sync --frozen --group test --extra copilot`
   安装它（不会影响其他附加功能）。注意：直接运行
   `uv run --frozen --group test` 会重新同步虚拟环境，并**移除** copilot
   SDK；进行实时测试时，请直接调用 `.venv/bin/omni` / `.venv/bin/python`，
   并避免在会话期间使用 `uv run`。
2. **SDK 已安装：**
   `.venv/bin/python -c "import copilot; print(copilot.__file__)"`。
3. **已配置具有 Copilot 访问权限的 GitHub token。** Copilot 需要一个
   具有 "Copilot Requests" 权限的细粒度 PAT，或者来自 GitHub CLI / Copilot CLI
   应用的 OAuth token（经典 `ghp_` PAT 会被拒绝）。
   进行验证（仅输出布尔值——切勿打印 token）：
   ```bash
   .venv/bin/python -c "from omnigent.onboarding.copilot_auth import copilot_github_token_configured; import os; print('config:', copilot_github_token_configured(), 'env:', bool(os.environ.get('GH_TOKEN') or os.environ.get('COPILOT_GITHUB_TOKEN')))"
   ```
   如果二者均为 `False`，请运行 `omni setup` 并注册 Copilot token，或者运行
   `export GH_TOKEN=$(gh auth token)`（前提是 `gh` 已登录到拥有
   Copilot 权限的账户）。使用 `gh api /copilot_internal/user`
   检查该账户的权限（查找 `chat_enabled`/`cli_enabled`）。
4. **网络可以出站访问 GitHub 的 Copilot 后端。** 在网络受限的主机上，
   如果某一轮交互卡住或连接失败，通常是出站访问问题，而不是运行框架的 bug。

## 第 1 步——启动本地服务器

```bash
cd /path/to/omnigent
.venv/bin/omni server --port 7788 --no-open    # foreground; or `omni server --background` for detached
curl -s http://127.0.0.1:7788/health           # {"status":"ok"}
```

将下面的 URL 用作 `$SERVER`。

## 第 2 步——构建 copilot 智能体包

包含 `spec_version` 的规格**必须是一个包含 `config.yaml` 的目录**——
而不能是单个 `.yaml` 文件。最小化的 copilot 智能体：

```bash
mkdir -p /tmp/copilot-dev
cat > /tmp/copilot-dev/config.yaml <<'YAML'
spec_version: 1
name: copilot-dev
description: Copilot SDK dev/test agent.
executor:
  type: omnigent
  config:
    harness: copilot
    # model: gpt-5-mini      # optional; omit for Copilot auto-select
prompt: |
  You are a terse test agent. Answer in as few words as possible.
YAML
```

对于子代理、工具、护栏/策略，请复制
`examples/polly/config.yaml` 和 `examples/debby/config.yaml` 中的字段结构。（请在
`guardrails.policies:` 下声明策略——在 `spec_version` + `config.yaml` 路径中，顶层
`policies:` 键会被静默丢弃。）

## 第 3 步——运行一轮（并进行冒烟测试）

```bash
SERVER=http://127.0.0.1:7788
timeout 280 .venv/bin/omni run /tmp/copilot-dev \
  -p "Reply with exactly the single word: PONG" \
  --server "$SERVER" 2>&1
```

正常运行时会先打印连接信息，然后打印回复（`PONG`）。如果能够正常工作，
则说明整个技术栈均正常：令牌、出站访问、内置 CLI、运行框架。

- **Shell / 文件工具：**添加 `--tools coding`。
- **指定模型：**添加 `--model gpt-5-mini`（或 `claude-haiku-4.5`、`auto`）。

## 针对性场景

| 目标 | 方法 |
|------|-----|
| 原生工具（shell/edit/read） | 使用 `--tools coding`，在提示词中要求创建→读取→编辑文件；确认它确实对磁盘进行了操作 |
| 桥接的 `sys_*` / 子代理分派 | 声明一个子代理（运行框架使用 `copilot`，以满足身份验证要求），提示父代理进行委派——这会测试 SDK `Tool` 异步处理器到 `_tool_executor` 的桥接 |
| 模型路由 | 使用多个 `--model` 值运行同一个包；未知 id 会**明确地**失败，`databricks-*` id 会在发出警告后回退为自动选择 |
| LLM 阶段策略 | 添加一条拒绝某个关键词的护栏；确认 `PHASE_LLM_REQUEST`/`PHASE_LLM_RESPONSE` 会将其阻止 |
| 并发 / 泄漏 | 同时启动多个 `omni run … &`；然后运行 `pgrep -af "copilot/bin/copilot"`，检查是否存在成为孤儿进程的内置 CLI 子进程 |

## 在 copilot 大脑上运行 polly（或任何编排器）

copilot 运行框架不仅可以作为独立代理，还可以充当**异步编排器**大脑（polly / debby）——它通过桥接的
`sys_*` 工具分派任务给子代理，并综合它们的结果。有两种测试方式：

**1. 已提交的回归保护测试（大脑冒烟测试）。**
`tests/e2e/test_polly_copilot_e2e.py` 会从当前检出的代码启动本地服务器，并使用
`--harness copilot --model auto` 运行 `examples/polly`，断言大脑能够启动并回复。除非已配置 Copilot 令牌，否则该测试会被**跳过**（因此，没有令牌的 CI 会跳过它）。运行方式如下：

```bash
.venv/bin/python -m pytest -o addopts="" tests/e2e/test_polly_copilot_e2e.py -v
```

**2. 完整编排（分派 → 收集 → 综合）。**使用
`polly-e2e-dev` 驱动程序（位于内部 `agent-framework` 克隆中）——它会启动本地服务器、轮询 AP API、自动响应信息征询，并断言扇出行为。使用 `--brain-harness copilot` 在 copilot 上驱动大脑，并且**始终传入 Copilot 目录中的 `--brain-model`**（`auto`、`claude-haiku-4.5`、
`gpt-5-mini`）：该驱动程序的默认 `--brain-model` 是一个 Claude id，而 Copilot
（没有 Databricks 网关）无法路由该 id。在 agent-framework 克隆中运行：

```bash
.venv/bin/python .claude/skills/polly-e2e-dev/polly_driver.py \
  --local --code-dir <this-worktree> \
  --cuj smoke --brain-harness copilot --brain-model auto      # brain only
# --cuj fanout  …  and  --cuj review-pr --repo omnigent-ai/omnigent --pr <n>  …
#   exercise real sub-agent dispatch (claude_code + codex) under a copilot brain.
```

所有三个 CUJ（smoke / fanout / review-pr）均可在 Copilot brain 上通过（已实时验证：
fanout 调度了 8 个子代理，8/8 成功，并完成了一次综合）。请注意，`omni run -p`
会在调度轮次结束后退出（brain 会停驻，直到被唤醒），因此子代理的
最终答案会写入服务器端——请通过 AP API
（`GET /v1/sessions/{id}/items`，子会话）读取，而不要只查看 stdout。

## 注意事项（这些问题确实会耗费大量时间）

1. **`config.yaml` 中的 `server:` 默认指向一台*远程*服务器。** 省略
   `--server` 会将你的轮次发送到该远程部署——它可能**已过时**，并
   以 `executor.config.harness: must be one of […]` 为由拒绝 Copilot harness。
   **始终传入 `--server http://127.0.0.1:<port>`。**（如果*本地*服务器
   拒绝 `copilot`，说明它运行的是过时代码——请从你的检出目录重新启动它。）
2. **包含 `spec_version` 的 spec 必须是一个目录加 `config.yaml`**，绝不能是
   单个 `.yaml` 文件。
3. **Copilot 需要 GitHub token**（具有 Copilot Requests 权限的细粒度 PAT，或
   gh/Copilot-CLI OAuth token）。解析优先级：spec `executor.auth`
   (api_key) > 已存储的 `copilot:` 配置块（`omni setup`）> 环境中的
   `COPILOT_GITHUB_TOKEN` / `GH_TOKEN` / `GITHUB_TOKEN`。传统 `ghp_` 会被拒绝。
4. **不支持 Databricks gateway。** Copilot 仅与 GitHub 后端通信，因此
   `databricks-*` 模型会被静默解析为 Copilot 的自动选择——它
   *不会*像 claude-sdk/codex/pi 那样通过 AI Gateway 路由。
5. **使用账户目录中的 model id。** free_limited 提供 `auto`、
   `claude-haiku-4.5`、`gpt-5-mini`。运行 `.venv/bin/python` 加 `client.list_models()`
   以发现当前可用集合；未知 id 会明确失败（服务器端会话失败）。
6. **轮次需要 30–90 秒**——始终使用 `timeout 280` 包裹。
7. **绝不要在日志或命令中打印/回显 GitHub token**。

## 代码与测试

- **Executor（SDK 桥接）：** `omnigent/inner/copilot_executor.py`
- **封装（HARNESS_COPILOT_* env → executor）：** `omnigent/inner/copilot_harness.py`
- **认证 / token 解析：** `omnigent/onboarding/copilot_auth.py`
- **生成环境：** `omnigent/runtime/workflow.py` 中的 `_build_copilot_spawn_env`

```bash
uv run --frozen --group test python -m pytest \
  tests/inner/test_copilot_executor.py \
  tests/inner/test_copilot_harness.py \
  tests/runtime/test_copilot_spawn_env.py \
  tests/onboarding/test_copilot_auth.py -q
```

## 集中找错（扇出）

为了对 harness 进行压力测试，请并行运行多个场景探针——每个探针都会构建一个
bundle，并针对同一个 `$SERVER` 运行真实轮次，然后报告出现的问题。
最值得关注的目标包括：`Tool` 异步处理程序桥接（挂起 / 工具
结果丢失 / 将错误报告为成功）、模型路由、策略执行、
流式输出渲染，以及拆卸后遗留的捆绑 CLI 进程。
请与 AP API（`GET /v1/sessions/{id}/items`）进行交叉核对——启动失败时可能以
0 退出且 stdout 为空，而服务器却记录了一个 `failed` 会话。

## 已知的棘手问题（通过实时集中找错发现——“截至本文撰写时”）

- **原生工具会绕过 `on:[tool_call]` 策略，并且不会被记录。** Copilot 的
  内置 `create`/`view`/`edit`/`bash` 在 SDK 内部运行，因此
  `on:[tool_call]` DENY 防护规则（例如 `blast_radius`）永远无法看到它们，而且它们
  不会在记录中留下 `function_call` 项（只有流式叙述）。
  **桥接的 `sys_*` 工具会受到约束并被记录。** 请在
  LLM 阶段（会触发的 `PHASE_LLM_REQUEST`/`RESPONSE`）或通过 OS-env
  sandbox 对 Copilot 的内置工具进行约束——不要使用 `on:[tool_call]`。（与 cursor harness 的情况相同。）
- **Copilot 会明确失败（不同于 cursor 会吞掉启动失败）。** 错误 token、
  空或无效模型以及未知 model id 都会以非零状态退出并给出清晰错误，
  同时还会生成服务器端失败会话和错误项——已经过验证，不会被吞掉。
- **针对异步 orchestrator 执行 `omni run -p` 会在调度轮次结束后退出**，
  因此已委派子代理的最终答案会持久化到服务器端，但在单次模式下可能
  不会到达 stdout。请通过 AP API 读取会话以查看该答案。
- **非优雅退出可能会遗留捆绑 CLI。** 优雅拆卸会将其回收
  （`client.stop()`）；发生 `SIGKILL`/硬退出后，请执行
  `pgrep -af "copilot/bin/copilot"` 进行清理。

## 清理

```bash
.venv/bin/omni server stop        # or kill the foreground `omni server`
rm -rf /tmp/copilot-dev           # remove scratch bundles
pgrep -af "copilot/bin/copilot"   # confirm no orphaned bundled-CLI subprocesses linger
```