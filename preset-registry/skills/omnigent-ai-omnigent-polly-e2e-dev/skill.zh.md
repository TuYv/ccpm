---
name: polly-e2e-dev
description: End-to-end test the polly multi-agent coding orchestrator's critical user journeys (CUJs). Two halves — a deterministic mock-LLM driver (polly_cuj.py) that boots a throwaway local server + mock LLM and asserts the substrate (boot, bridged sys_* tool dispatch, the blast_radius / spawn_bounds / headless_subagent_purpose_guard guardrails, fan-out delegation), and a live real-CLI recipe (real claude/codex/pi, real worktrees/PRs) for polly's actual judgment. Load when developing, testing, or debugging examples/polly — its config.yaml, the claude_code/codex/pi sub-agents, the investigate/fanout/cross-review skills, or the omnigent.inner.nessie.policies guardrails — or reproducing a polly orchestration bug.
---
# polly 编排器：端到端 CUJ 开发与测试

`polly`（`examples/polly/`）是一个多智能体**编码编排器**：一个自身不编写任何代码的 `claude-sdk`“大脑”，它将所有工作委派给三个编码子智能体——`claude_code`（Claude 原生）、`codex`（Codex 原生）和 `pi`（无头、多模型）。其关键用户旅程是编排行为，而不是单轮回答：

- **花名册预检**——第一轮运行 `command -v claude codex pi`，仅将任务路由给 CLI 解析成功的工作器。
- **调查**——将只读工作分派给 `explore`/`search` 子智能体；根据它们的报告进行综合。
- **扇出**——多个相互独立的任务，每个任务都位于自己的 git 工作树中并由各自的子智能体处理，且各自创建自己的 PR。
- **交叉审查**——实现者的 diff 由一个**不同供应商**的子智能体进行验证（仅提供 diff + 契约）；阻塞性问题将转化为修复任务。
- **计划门禁 / 收件箱**——在计划门禁阶段引入人工；通过收件箱 + 自动唤醒进行监督，绝不进行忙轮询。
- **防护规则**（`omnigent.inner.nessie.policies`）——`blast_radius`（拒绝强制推送 / `rm -rf /`）、`spawn_bounds`（限制每轮的分派次数）、`headless_subagent_purpose_guard`（每次分派都必须包含 `args.purpose`）。

此技能通过两种方式测试这些 CUJ。请**同时使用两者**——它们覆盖不同的方面：

| 部分 | 证明的内容 | 所需条件 |
|------|----------------|-------|
| **模拟循环**（`polly_cuj.py`） | **底层机制/运行机制**——大脑是*脚本化的*，因此该部分以确定性的方式验证包加载、服务端策略解析、桥接的 `sys_*` 工具分派、防护规则的 DENY，以及扇出，且无需凭据 | 无（模拟 LLM） |
| **实时流程** | polly 的**判断能力**——真实大脑是否会正确执行预检、分解、委派、交叉审查并引入人工 | 真实的 `claude`/`codex`/`pi` + 模型凭据 + 网络 |

> 与同级的测试工具技能一样，各轮次从你的**当前检出版本**运行
>（`omni run <bundle> --server <url>` = 本地运行器 + 远程服务器），因此测试
> 实际执行的正是你当前检出版本中的代码。

## 解释器

驱动程序和 CLI 需要仓库的 Python ≥3.12 环境。如果缺少 `.venv/`，
请从当前检出版本创建一次：

```bash
uv run --frozen python -c "import omnigent; print('ok')"   # builds .venv
```

然后在下文中使用 `.venv/bin/python` / `.venv/bin/omni`。

---

## A 部分——确定性的模拟循环（`polly_cuj.py`）

该驱动程序会启动一个用后即弃的本地 Omnigent 服务器（其中包含
`omnigent.inner.nessie.policies`——polly 的防护规则所解析的模块），以及
仓库中的模拟 LLM 服务器；随后，它会重写 polly 包，使其使用连接到模拟服务器的
`openai-agents` 测试工具，然后运行多轮 `omnigent run`，其中大脑是
*脚本化的*（文本或工具调用）。它会为每个场景输出一条 `SUMMARY {json}`，并在
任何检查失败时以非零状态码退出。

```bash
.venv/bin/python .claude/skills/polly-e2e-dev/polly_cuj.py --list-scenarios
.venv/bin/python .claude/skills/polly-e2e-dev/polly_cuj.py --scenario all
.venv/bin/python .claude/skills/polly-e2e-dev/polly_cuj.py --scenario guardrail_purpose --keep
```

使用 `… | grep '^SUMMARY' | python -m json.tool` 读取结果。针对全部五个场景，每次运行大约需要 45–55 秒；无需凭据或网络出口。

### 场景目录

| 场景 | 脚本让大脑执行… | 硬性检查 |
|---|---|---|
| `boot` | 使用文本回复 | 退出码为 0 + 非空洞回复（包加载、服务端策略解析、轮次完成） |
| `tool_dispatch` | 调用 `sys_os_shell` 写入哨兵文件 | 文件出现在磁盘上（桥接的 `sys_*` 分派正常工作；`blast_radius` 允许良性 shell 操作） |
| `guardrail_purpose` | 调用 `sys_session_send`，但**不提供** `args.purpose` | 工具输出包含 `Denied by policy: … must declare what kind of work it is`（`headless_subagent_purpose_guard`） |
| `guardrail_blast_radius` | 调用 `sys_os_shell("git push --force …")` | 工具输出包含 `Denied by policy: … blast-radius policy` |
| `fanout_dispatch` | 在一个轮次中发出 6 个 `sys_session_send` | 创建 ≥2 个子代理分派句柄（扇出基础设施）。**发现：**报告是否触发了 `spawn_bounds` 上限（参见已知尖锐边缘） |

### 可验证的修改前→修改后循环

该驱动程序是为*循环*而存在的，而不是用于一次性运行。要证明某项修复有效：

1. 在**未修复的**代码上运行该场景 → 某项检查结果为 `false`（基线）。
2. 进行修改。
3. 运行**相同的**场景 → 该检查结果**翻转**为 `true`。

只有当某项检查发生翻转时，修复才是“可验证的”。如果没有翻转，就无法证明该修改产生了任何作用——请继续处理。要覆盖新机制，请添加一个 `scenario_*` 函数，并在 `_SCENARIOS` 中添加一行（每个函数都会构建一个包、为模拟对象编写脚本、运行一个轮次，并断言一个**可观察到的效果**——会话项、拒绝哨兵或磁盘上的文件）。

### 模拟循环能够与不能证明的内容

由于大脑是按脚本运行的，因此它测试的是**机制**：工具分派、防护规则关卡、会话持久化和扇出管道。它**不会**测试 polly 的判断能力（*真实*大脑是否进行了预检、分解、选择正确的供应商、交叉审查）。这些需要通过实时操作流程来测试。

---

## B 部分——实时操作流程（真实的 claude/codex/pi）

### 前置条件（请先检查）

1. **你位于想要测试的分支上。**
2. **大脑已配置 Claude 提供商**（`omni setup`、`ANTHROPIC_API_KEY` 或 Databricks 默认配置）。只验证布尔值——绝不要打印密钥。
3. **工作器 CLI 位于 PATH 中**——这*就是*成员列表预检：
   ```bash
   command -v claude codex pi || true
   ```
   只有成功解析到工作器的二进制文件时，该工作器才可启动。交叉审查要求至少有**两个不同的供应商**可用。
4. 能够通过**网络出口**连接模型后端；如果想创建真实 PR，**`gh`** 必须已通过身份验证。

### 运行一个实时轮次

```bash
.venv/bin/omni server --background && .venv/bin/omni server status   # prints $SERVER, e.g. http://127.0.0.1:6767
SERVER=http://127.0.0.1:6767
timeout 280 .venv/bin/omni run examples/polly \
  -p "Investigate how the runner enforces tool-call policies and report file:line evidence." \
  --server "$SERVER" 2>&1
```

始终传入 `--server "$SERVER"`；省略它会将请求路由到已配置的**远程**部署，而该部署可能已过时，并拒绝包中的某些部分。

### 观察 CUJ（CLI + HTTP API + 文件系统）

获取会话 ID，然后读取记录和副作用：

```bash
SID=$(curl -s "$SERVER/v1/sessions?kind=default&order=desc&limit=1" | python -c "import sys,json;print(json.load(sys.stdin)['data'][0]['id'])")
curl -s "$SERVER/v1/sessions/$SID/items"          | python -m json.tool | tail -60   # brain transcript + tool calls
curl -s "$SERVER/v1/sessions/$SID/child_sessions" | python -m json.tool             # dispatched sub-agents
git worktree list                                  # fanout: one per task
cat .polly/registry.json 2>/dev/null               # polly's task list
gh pr list --author "@me"                          # each implementer opens its own PR
```

### 各 CUJ 的实时操作手册

| CUJ | 如何驱动 | 观察要点 |
|---|---|---|
| 阵容预检 | 在缺少某个 CLI 的机器上进行首次实时轮次 | polly 会告诉你哪个工作节点不可用，并绕过它进行路由 |
| 调查 | 提出一个只读问题（“解释/审计/为什么 X 会……”） | `child_sessions` 中包含 `purpose: explore/search`；回答引用子代理的报告，而不是 polly 自己进行深度读取的结果 |
| 扇出 | 提出 2–3 项相互独立的更改 | 每项任务对应一个工作树、一个子代理和一个 PR |
| 交叉审查 | 让一个实现者完成任务 | 由一个**来自不同供应商的**审查子代理以 `purpose: review` 执行审查；阻塞性问题会被发回给**同一个**实现者会话 |
| 计划门禁 / 收件箱 | 一项多步骤任务 | polly 在计划门禁处暂停以等待人工批准；分派后结束当前轮次，并由收件箱自动唤醒（不进行忙轮询） |
| 防护规则（ASK） | 一项会执行推送/合并的任务 | 运行器显示批准卡片；`ask_timeout: 86400` 使其保持打开状态 |

对于防护规则的 **DENY** 集合（强制推送、`rm -rf /`、未标记的分派、扇出上限），优先使用**模拟循环**——它具有确定性，并且不会产生真实副作用。

---

## CUJ 覆盖图

| CUJ | 模拟循环 | 实时操作方案 |
|---|---|---|
| 启动 / 轮次完成 | `boot` | 任意实时轮次 |
| 桥接的 `sys_*` 分派 | `tool_dispatch` | `…/items` 中的工具调用 |
| `headless_subagent_purpose_guard` | `guardrail_purpose` ✅ | （拒绝——优先使用模拟） |
| `blast_radius` | `guardrail_blast_radius` ✅ | 推送/合并时显示 ASK 卡片 |
| `spawn_bounds` | `fanout_dispatch`（发现项）⚠️ | 实时验证上限 |
| 扇出委派 | `fanout_dispatch`（句柄） | `child_sessions` + 工作树 + PR |
| 调查 / 交叉审查 / 计划门禁 / 收件箱 | —（需要判断） | 使用上面的实时操作手册 |

---

## 已知的易踩坑点（在构建此技能时发现——请验证，可能会变化）

- **`spawn_bounds` 的单轮次上限不会在本地服务器端路径中触发。**
  该上限是一个*有状态的*单轮次计数器，但服务器会在每次 `tools/call` 时重建策略引擎（`_build_policy_engine_from_spec`、`sessions.py`），因此计数器会在每次调用时重置。无状态策略（`purpose_guard`、`blast_radius`）不受影响。`fanout_dispatch` 会将此情况报告为发现项，而不是让测试失败。请在存在持久化单轮次引擎的**实时环境**中验证该上限。
- **两种拒绝格式。**桥接的 `sys_*` 工具将拒绝显示为 `{"error": "Denied by policy: <reason>"}`；SDK 函数工具则使用 `[Denied by policy: <name>] {json}`。两者都包含 `Denied by policy:` 标记——请匹配该标记以及特定于策略的原因片段（驱动程序就是这样做的）。
- **实时扇出需要工作节点 CLI。**在模拟循环中，子代理会被重写为 `openai-agents`，因此分派不需要任何二进制文件。在实时环境中，缺少 `claude`/`codex`/`pi` 会导致对应工作节点启动失败——请将其视为 UNAVAILABLE。
- **默认服务器陷阱。**`config.yaml` 中的 `server:` 指向远程部署；进行本地测试时始终传入 `--server "$SERVER"`。

## 代码与测试

- **Bundle / prompt / guardrails：** `examples/polly/config.yaml`
- **子代理：** `examples/polly/agents/{claude_code,codex,pi}/config.yaml`
- **编排技能：** `examples/polly/skills/{investigate,fanout,cross-review}/SKILL.md`
- **防护策略：** `omnigent/inner/nessie/policies.py`
- **运行器侧门禁：** `omnigent/runner/policy.py`；服务端工具调用
  强制执行：`omnigent/server/routes/sessions.py`
- **模拟 LLM 服务器：** `tests/server/integration/mock_llm_server.py`

```bash
# Existing pytest e2e for polly (mock-LLM) — complementary to this skill:
uv run --frozen --group test python -m pytest \
  tests/e2e/test_polly_e2e.py \
  tests/e2e/test_polly_cost_advisor_e2e.py \
  tests/e2e/test_polly_subagent_model_e2e.py -q
```

## 清理——不可妥协

驱动程序会回收它启动的所有内容，包括每轮 `omni run` 所生成的、每个对话对应的
`omnigent.host._daemon_entry` / `runner._entry` / `harnesses._runner`
子进程（仅向服务器发送 SIGTERM 会使这些进程成为孤儿进程）。清理范围限定于当前解释器，因此绝不会影响其他
工作树。完成**实时**会话后，请手动清理：

```bash
.venv/bin/omni server stop
pgrep -af "$(pwd)/.venv/bin/python -m omnigent" | grep -E "_entry|_runner|_daemon" || echo clean
```

## 如实报告

如果工作器 CLI、凭据或出口网络不可用，请说明实时 CUJ 已被
**跳过**——不要声称它已通过。最有力的证据是复现的
基线加上翻转后的检查结果（模拟循环），或在
`…/items` + `…/child_sessions` 中观察到的往返过程（实时）。请报告真实的 `SUMMARY` 行，而不是对摘要的
再次总结。