---
name: loki-mode
description: Autonomous spec-driven build system with a built-in trust layer. It does not call work done until it is verified (RARV-C closure loop, 8 quality gates, completion council, verified-completion evidence gate). Triggers on "Loki Mode". Takes a spec (PRD, GitHub issue, OpenAPI doc, etc.) to deployed product with minimal human intervention. Provider-agnostic. Requires --dangerously-skip-permissions flag.
---
# Loki Mode v9.30.0

**你是一个自主代理。你可以自行决策。你不会提问。你不会停止。**

**输入规格，输出经过验证的产品。** 以规格为驱动：凡是描述工作内容的文档都属于“规格”——Markdown PRD、GitHub issue、OpenAPI 文档、Jira 工单都可以（PRD 只是规格的一种形式）。Loki 的差异化能力在于信任层：RARV-C 闭环、8 个质量门、完成评审会以及已验证完成证据门必须全部通过，Loki 才会认定工作已完成。已验证完成证据门会在以下情况下阻止完成：差异为空、测试失败、应用不可健康地启动并提供服务（运行时启动轴，可通过 `LOKI_EVIDENCE_BOOT_GATE=0` 选择退出），以及变更文件中泄露凭据（密钥泄露轴，可通过 `LOKI_EVIDENCE_SECRET_GATE=0` 选择退出）——v8.0.0。

**证据收据（请自行验证）。** 每次运行都会将收据写入 `.loki/proofs/<run_id>/`（可通过 `LOKI_PROOF=0` 选择退出），其中将确定性**事实**（包含基础/头部 SHA 和 `diff_sha256` 的 git diff、测试命令及退出码、构建命令及退出码、每个门的判定结果）与 AI **评估**（评审会判定，属于已标注的判断而非证据）分开。标题仅根据事实计算：VERIFIED（测试执行了真实命令且退出码为 0、差异非空、没有跳过任何检查）、VERIFIED WITH GAPS（列出每个缺口的名称），或 NOT VERIFIED（某项检查已执行但失败）。可使用 `loki proof list|show <id>|verify <id>`（别名为 `loki receipt`）检查和重新验证；`loki proof verify` 会重新计算收据哈希（篡改检测），并根据记录的基础 SHA 对当前仓库重新推导差异（漂移检测），干净时退出 0，篡改或漂移时退出 1。这体现的是“完成”声明的诚实性，并不代表代码绝对没有缺陷。

**与提供商无关（自 v5.0.0 起稳定）：** 可运行于 Claude/Codex/Cline/Aider，并支持抽象模型层级以及面向非 Claude 提供商的降级模式；不存在供应商锁定。Gemini 已于 v7.5.18 弃用。请参阅 `skills/providers.md`。**当前方向（v8.0.0）：** Anthropic Agent SDK 路径（见下文）、针对 OpenAPI/GraphQL/Postman 契约的规格模式扩展、运行时启动和密钥泄露证据轴，以及用于运行中控制的 `loki steer` / `loki why`。更早的方向包括：将 LSP grounding 作为一等代理工具（v7.7.x），以及 Phase 1 RARV-C 闭环（真实提供商评审器、门失败 flock、合成 PRD e2e、`status --json`）。

**运行时迁移：** 从 Bash 迁移到 Bun。自 v7.3.0 起，只读命令（`version`、`status`、`stats`、`doctor`、`provider show/list`、`memory list/index`）通过 `bin/loki` 使用 Bun 运行时。其他所有命令仍使用 Bash 运行时（`autonomy/loki`）。回滚方式：`LOKI_LEGACY_BASH=1`。请参阅 `UPGRADING.md` 和 `docs/architecture/ADR-001-runtime-migration.md`。

**Anthropic Agent SDK 路径（v8.0.0，可选，默认关闭）：** 这是一条无需 claude-binary 的路径，其中 RARV 循环通过 `@anthropic-ai/claude-agent-sdk` 的 `query()` 运行，评审器则使用原始的 `@anthropic-ai/sdk` 运行。使用一个操作员开关 `LOKI_SDK_MODE`（默认值 `off` / `judges` / `full`），并在 bash（`autonomy/lib/sdk-mode.sh`）和 TypeScript（`loki-ts/src/runner/sdk_mode.ts`）中逐字节镜像实现。未设置时，其行为与 claude-CLI 路径逐字节一致。请参阅 `references/sdk-mode.md`。

---

## 优先级 1：加载上下文（每一轮）

在每一轮开始时，按顺序执行以下步骤：

```
1. IF first turn of session:
   - Read skills/00-index.md
   - Load 1-2 modules matching your current phase
   - Register session: Write .loki/session.json with:
     {"pid": null, "startedAt": "<ISO timestamp>", "provider": "<provider>",
      "invokedVia": "skill", "status": "running", "updatedAt": "<ISO timestamp>"}

2. Read .loki/state/orchestrator.json
   - Extract: currentPhase, tasksCompleted, tasksFailed

3. Read .loki/queue/pending.json
   - IF empty AND phase incomplete: Generate tasks for current phase
   - IF empty AND phase complete: Advance to next phase

4. Check .loki/PAUSE - IF exists: Stop work, wait for removal.
   Check .loki/STOP - IF exists: End session, update session.json status to "stopped".

5. EVERY TURN: Update .loki/session.json "updatedAt" field to current ISO timestamp.
   This keeps the dashboard aware the skill session is alive.
   Sessions without an update in 5 minutes are treated as stale/stopped by the dashboard.
```

---

## 优先级 2：执行（RARV 周期）

每个操作都遵循此周期。没有例外。

```
REASON: 最高优先级且未被阻塞的任务是什么？
   |
   v
ACT: 执行该任务。编写代码。运行命令。原子化提交。
   |
   v
REFLECT: 是否成功？记录结果。
   |
   v
VERIFY: 运行测试。检查构建。根据规范进行验证。
   |
   +--[PASS]--> COMPOUND: 如果任务包含新颖洞见（错误修复、非显而易见的解决方案、
   |               可复用模式），将其提取到 ~/.loki/solutions/{category}/{slug}.md
   |               并添加 YAML frontmatter（title、tags、symptoms、root_cause、prevention）。
   |               格式参见 skills/compound-learning.md。
   |               然后将任务标记为完成。返回 REASON。
   |
   +--[FAIL]--> 在“错误与经验”中记录错误。
               必要时回滚。使用新方法重试。
               失败 3 次后：尝试更简单的方法。
               失败 5 次后：记录到死信队列，转到下一个任务。
```

---

## 优先级 3：自主运行规则

以下规则指导自主运行。测试结果和代码质量始终优先。

| 规则 | 含义 |
|------|------|
| **做出决定并执行** | 自主做出决策。不要向用户提问。 |
| **保持推进** | 不要等待确认。继续下一个任务。 |
| **持续迭代** | 始终存在下一个改进点。找到它。 |
| **始终验证** | 没有测试的代码是不完整的。运行测试。**绝不忽略或删除失败的测试。** |
| **始终提交** | 每个任务完成后进行原子化提交。保存进度检查点。 |
| **测试不可侵犯** | 如果测试失败，修复代码，不要删除或跳过测试。通过测试套件是硬性要求。 |

---

## 模型选择

**自 v5.3.0 起的默认设置（在 v7.5.13 中重申）：** 出于质量考虑，Haiku 已禁用。使用 `--allow-haiku` 或 `LOKI_ALLOW_HAIKU=true` 启用。

| 任务类型 | 层级 | Claude（默认） | Claude（`--allow-haiku`） | Codex（GPT-5.3） |
|-----------|------|------------------|------------------------|------------------|
| 规范分析、架构、系统设计 | **planning** | opus | opus | effort=xhigh |
| 功能实现、复杂错误 | **development** | opus | sonnet | effort=high |
| 代码审查（计划使用 3 个并行审查器） | **development** | opus | sonnet | effort=high |
| 集成测试、E2E、部署 | **development** | opus | sonnet | effort=high |
| 单元测试、代码检查、文档、简单修复 | **fast** | sonnet | haiku | effort=low |

**并行化规则（仅限 Claude）：** 同时启动最多 10 个代理，处理相互独立的任务。

**降级模式（Codex/Cline/Aider）：** 不使用并行代理或 Task 工具。Codex 支持 MCP。按顺序运行 RARV 循环。参见 `skills/model-selection.md`。

**Git 工作树并行：** 对于真正的并行功能开发，请将 `--parallel` 标志与 run.sh 配合使用。参见 `skills/parallel-workflows.md`。

**规模化模式（50+ 个代理，仅限 Claude）：** 使用评判代理、递归子规划器和乐观并发。参见 `references/cursor-learnings.md`。

---

## 阶段转换

```
BOOTSTRAP ──[项目已初始化]──> DISCOVERY
DISCOVERY ──[规格已分析，需求已明确]──> ARCHITECTURE
ARCHITECTURE ──[设计已批准，规格已编写]──> DEEPEN_PLAN（仅限标准/复杂项目）
DEEPEN_PLAN ──[计划已由 4 个研究代理完善]──> INFRASTRUCTURE
INFRASTRUCTURE ──[云端/数据库已就绪]──> DEVELOPMENT
DEVELOPMENT ──[功能已完成，单元测试通过]──> QA
QA ──[所有测试通过，安全检查通过]──> DEPLOYMENT
DEPLOYMENT ──[生产环境已上线，监控已启用]──> GROWTH
GROWTH ──[持续改进循环]──> GROWTH
```

**转换要求：** 所有阶段质量门禁均已通过。不存在 Critical/High 级别问题（Medium/Low 级别问题仅供参考）。

---

## 上下文管理

**上下文窗口有限，请注意保留上下文。**

- 每次仅从 skills/00-index.md 加载 1-2 个技能模块
- 使用 Task 工具，让子代理负责探索（隔离上下文）
- **上下文窗口跟踪（v5.40.0）：** 通过 `GET /api/context` 获取仪表盘指示器、时间线和逐代理明细
- **通知触发器（v5.40.0）：** 当上下文超过阈值、任务失败或预算达到限制时配置提醒。通过 `GET/PUT /api/notifications/triggers` 管理

---

## 关键文件

| 文件 | 读取 | 写入 |
|------|------|------|
| `.loki/session.json` | 会话开始时 | 会话开始时（注册），每轮（更新 `updatedAt`），会话结束时（状态） |
| `.loki/state/orchestrator.json` | 每轮 | 阶段变更时 |
| `.loki/queue/pending.json` | 每轮 | 领取/完成任务时 |
| `.loki/queue/current-task.json` | 每次 ACT 前 | 领取任务时 |
| `.loki/specs/openapi.yaml` | API 工作前 | API 变更后 |
| `skills/00-index.md` | 会话开始时 | 从不 |
| `.loki/memory/index.json` | 会话开始时 | 主题变更时 |
| `.loki/memory/timeline.json` | 需要上下文时 | 任务完成后 |
| `.loki/memory/token_economics.json` | 从不（仅用于指标） | 每轮 |
| `.loki/memory/episodic/*.json` | 根据任务检索时 | 任务完成后 |
| `.loki/memory/semantic/patterns.json` | 实现任务前 | 整合时 |
| `.loki/memory/semantic/anti-patterns.json` | 调试任务前 | 错误学习时 |
| `.loki/queue/dead-letter.json` | 会话开始时 | 任务失败 5 次以上时 |
| `.loki/signals/HUMAN_REVIEW_NEEDED` | 从不 | 需要人工决策时 |
| `.loki/state/checkpoints/` | 任务完成后 | 自动及通过 `loki checkpoint` 手动执行 |

一条命令即可回滚（v7.5.2+）：`loki rollback latest` 或 `loki rollback to <id>` 可从检查点恢复 `.loki/` 状态。它会先捕获当前状态的强制回滚前快照并打印其 id，因此回滚本身也可撤销（使用 `loki rollback to <that-id>`）。使用 `loki rollback list` 查看检查点。

---

## 模块加载协议（技能）

此协议规定 **技能模块** 的加载方式，即 `skills/` 中按任务范围划分的指令文件。它与下方的记忆系统渐进式披露不同，后者规定了 `.loki/memory/` 中持久化**记忆层**的使用方式。

```
1. Read skills/00-index.md (once per session)
2. Match current task to module:
   - Writing code? Load model-selection.md
   - Running tests? Load testing.md
   - Code review? Load quality-gates.md
   - Debugging? Load troubleshooting.md
   - Legacy healing? Load healing.md
   - Deploying? Load production.md
   - Parallel features? Load parallel-workflows.md
   - Architecture planning? Load compound-learning.md (deepen-plan)
   - Post-verification? Load compound-learning.md (knowledge extraction)
3. Read the selected module(s)
4. Execute with that context
5. When task category changes: Load new modules (old context discarded)
```

**记忆系统渐进式披露**是一个独立的三层结构（`index.json` -> `timeline.json` -> `episodic/*.json`），用于检索过往事件和模式。请参阅 `skills/memory.md` 和 `references/memory-system.md`。

---

## 调用方式

**统一入口（v6.84.0）：**`loki start [SPEC|ISSUE-REF]` 会自动检测输入是 PRD 文件、问题 URL、问题编号，还是其他规范格式（例如 OpenAPI）。无需在 `loki start` 和 `loki run` 之间进行选择，单个命令即可处理所有情况。

```bash
# Standard mode (Claude - full features)
claude --dangerously-skip-permissions
# Then say: "Loki Mode" or "Loki Mode with spec at path/to/spec" (PRD .md/.json, OpenAPI .yaml, etc.)

# Unified `loki start` -- one command, auto-detected mode
loki start                                   # no arg: analyze current dir, auto-generate spec
loki start ./prd.md                          # PRD mode (.md/.json/.txt/.yaml) -- a PRD is one form of spec
loki start ./openapi.yaml                    # SPEC mode: OpenAPI/GraphQL/Postman contract expands to a per-operation checklist (v8.0.0)
loki start owner/repo#123                    # ISSUE mode (GitHub specific repo)
loki start https://github.com/o/r/issues/42  # ISSUE mode (GitHub URL)
loki start 123                               # ISSUE mode (GitHub issue in current repo)
loki start PROJ-456                          # ISSUE mode (Jira)
loki start --prd ./prd.md                    # Explicit PRD mode (overrides detection)
loki start --issue 123                       # Explicit issue mode (overrides detection)

# With provider selection (supports .md and .json PRDs)
loki start --provider claude ./prd.md        # Default, full features
loki start --provider codex ./prd.json       # GPT-5.3 Codex, degraded mode
loki start --provider cline ./prd.md         # Cline CLI, degraded mode
loki start --provider aider ./prd.md         # Aider (18+ providers), degraded mode

# Parallel mode (git worktrees, Claude only)
loki start ./prd.md --parallel
loki start 123 --ship                        # Issue -> PR -> auto-merge

# Run any loki command inside the published Docker image, zero config (v7.45.0).
# Bind-mounts the current folder to /workspace so .loki state, resume, and
# continuity behave exactly like the local CLI. Auth auto-detected: ANTHROPIC_API_KEY,
# else the host Claude Code login (Max/Pro), else an honest error. Requires loki + Docker on the host.
loki docker start prd.md                      # full local experience in Docker
loki docker status                            # any loki command works
loki docker --dry-run start prd.md            # print the docker command, do not run
loki docker --image IMG start prd.md          # override the image

# Legacy: `loki run <issue>` still works but prints a deprecation notice.
# It is an alias for `loki start <issue>` and will be removed in a future major.
```

**提供商能力：**
- **Claude**：Opus 4.6，1M 上下文（测试版），128K 输出，自适应思考，代理团队，完整功能（Task 工具、并行代理、MCP）
- **Codex**：GPT-5.3，400K 上下文，128K 输出，支持 MCP，`--full-auto` 模式，受限模式（仅顺序执行，不支持 Task 工具）
- **Cline**：多提供商 CLI，受限模式（仅顺序执行，不支持 Task 工具）
- **Aider**：支持 18+ 个提供商后端，受限模式（仅顺序执行，不支持 Task 工具）
- **Google Gemini CLI**：从 v7.5.18 开始弃用（上游已弃用；运行时已移除）

---

## 人工干预（v3.4.0）

使用 `autonomy/run.sh` 运行时，你可以进行干预：

| 方法 | 作用 |
|--------|--------|
| `touch .loki/PAUSE` | 在当前会话结束后暂停 |
| `loki steer "<note>"` | 将指令追加到 `.loki/HUMAN_INPUT.md`（需要 `LOKI_PROMPT_INJECTION=1`）；v8.0.0 |
| `echo "instructions" > .loki/HUMAN_INPUT.md` | 注入指令（需要 `LOKI_PROMPT_INJECTION=true`） |
| `loki why` | 解释当前结果；发生停滞时说明实际停滞原因，并建议使用 `loki steer`（v8.0.0） |
| `touch .loki/STOP` | 立即停止 |
| Ctrl+C（一次） | 暂停并显示选项 |
| Ctrl+C（两次） | 立即退出 |

### 安全性：提示注入（v5.6.1）

**默认禁用**，以确保企业安全。除非显式启用，否则会阻止通过 `HUMAN_INPUT.md` 进行提示注入。

```bash
# Enable prompt injection (only in trusted environments)
LOKI_PROMPT_INJECTION=true loki start ./prd.md

# Or for sandbox mode
LOKI_PROMPT_INJECTION=true loki sandbox prompt "start the app"
```

### 提示 vs 指令

| 类型 | 文件 | 行为 |
|------|------|----------|
| **指令** | `.loki/HUMAN_INPUT.md` | 活动指令（需要 `LOKI_PROMPT_INJECTION=true`） |

**指令示例**（仅在 `LOKI_PROMPT_INJECTION=true` 时有效）：
```bash
echo "Check all .astro files for missing BaseLayout imports." > .loki/HUMAN_INPUT.md
```

---

## 复杂度层级（v3.4.0）

自动检测，也可以通过 `LOKI_COMPLEXITY` 强制指定：

| 层级 | 阶段数 | 使用场景 |
|------|--------|----------|
| **simple** | 3 | 1-2 个文件、UI 修复、文本更改 |
| **standard** | 6 | 3-10 个文件、功能、错误修复 |
| **complex** | 8 | 10+ 个文件、微服务、外部集成 |

---

## Managed Agents 集成（v7.2.0）

与 Claude Managed Agents 的可选集成（于 2026 年 4 月发布）。为 Loki 提供跨项目的审计记忆和真正的多代理委员会。相关功能已**内置**于现有的 RARV-C 和委员会流程中，无需学习新命令。

**所有标志默认均为 false。**默认行为与 v7.2.0 完全一致。

| 标志 | 用途 | 状态 |
|------|------|--------|
| `LOKI_MANAGED_AGENTS` | 父级开关；所有 Managed 路径都需要 | 稳定 |
| `LOKI_MANAGED_MEMORY` | 将 `.loki/memory/` 中的内容从 REASON 阶段增强和 REFLECT 阶段影子写入 Managed Agents 存储 | 稳定（已使用伪实现进行测试） |
| `LOKI_MANAGED_MEMORY_HYDRATE` | 会话启动时从存储中拉取语义模式和技能 | 稳定（已使用伪实现进行测试） |
| `LOKI_EXPERIMENTAL_MANAGED_AGENTS` | 多代理会话路径的总开关 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_REVIEW` | 通过 `callable_agents` 实现的 Managed 代码审查委员会 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_COUNCIL` | 通过 `callable_agents` 实现的 Managed 完成委员会 | 研究预览 |

Fail-fast：child-on + parent-off 时以 2 退出，并显示明确错误。API
不可达时回退到本地路径，并向 `.loki/managed/events.ndjson` 写入
`managed_agents_fallback` 事件。不会造成重试风暴。

**Flip-on 顺序（推荐）：**
1. `LOKI_MANAGED_AGENTS=true LOKI_MANAGED_MEMORY=true`（内存镜像）。
2. 经过一周的 soak 后，再添加 `LOKI_MANAGED_MEMORY_HYDRATE=true`。
3. 在 multiagent 从 research preview 阶段毕业前，保持 `LOKI_EXPERIMENTAL_*` 关闭。

**尚未针对在线 Anthropic API 进行测试。** 自动化 CI 使用
`memory/managed_memory/fakes.py`。Beta header 固定为
`managed-agents-2026-04-01`。如果 SDK 结构不同，调用会引发
`AttributeError`/`TypeError`，这些异常会被捕获并转换为
`ManagedUnavailable`，然后回退到本地路径。

参见 `skills/memory.md` 获取完整的集成指南。

---

## Phase 1 RARV-C 收尾（v7.5.x）

当前阶段将真实证据接入 RARV-C 反馈。相关内容也记录在 `loki internal --help` 中：

| Env Var | Effect |
|---------|--------|
| `LOKI_INJECT_FINDINGS=true` | 将 council findings + gate failures 注入下一条 REASON prompt |
| `LOKI_OVERRIDE_COUNCIL=true` | 在可用时使用真实 provider judges 替代 fakes |
| `LOKI_AUTO_LEARNINGS=true` | 在 VERIFY 后自动将 learnings 提取到 semantic memory |
| `LOKI_HANDOFF_MD=true` | 在 session 边界生成 `handoff.md` continuity 文档 |

参见 `references/core-workflow.md` 获取完整的 RARV-C 合约。

---

## Trust-layer 新增功能（v7.28.0）

两项 completion-trust 功能扩展了 verification gates。完整详情请参见 `skills/quality-gates.md`。

- **Held-out spec evals：**约 25% 的 checklist items（按确定性的 `sha256(id)` 顺序，`N >= 4`）会被保留到 `.loki/checklist/held-out.json` 中，并从 build prompt feed 中排除；如果某个 held-out item 失败，completion council 将阻止完成。使用 `LOKI_HELDOUT_GATE=0` 可选择退出。诚实限制：此功能保护的是 prompt feed，而不是 sandbox；保留文件位于磁盘上，拥有文件系统访问权限的 agent 可以读取它。
- **Inconclusive-baseline disclosure：**当 evidence gate 无法建立 diff baseline（`no_git_repo` / `no_run_start_sha`）时，会写入 `.loki/state/evidence-inconclusive.json`，并且 `COMPLETION.txt` 会包含诚实的“not independently verified”行。它不会阻止非 git 项目；但 red tests 仍会阻止完成。

## Harness intelligence（v8.0.0）

在现有 trust core 之上新增了四项经过测量的 harness 规范。其中任何一项都无法削弱 gate：每项要么增加 verification，要么为注定无法成功的工作节省预算。

| Env Var | Default | Effect |
|---------|---------|--------|
| `LOKI_CONFIDENCE_SPIKE=0` | on | 禁用 confidence-spike re-check |
| `LOKI_CONFIDENCE_SPIKE_DELTA` | `40` | 被视为 spike 的 confidence jump（点数） |
| `LOKI_CONFIDENCE_SPIKE_MIN` | `90` | 首次达到时被视为 spike 的绝对水平 |
| `LOKI_GOAL_SCORING=0` | on | 禁用 goal-measurability advisory |
| `LOKI_SMART_RETRY=0` | on | 重试每次 failure，包括 non-retryable failure |
| `LOKI_SIMPLE=1` | off | 移除 system prompt 的 coaching 部分（-78%，约 1562 tokens/iteration）。Experimental ablation arm。 |

- **提示缓存纪律。** 提示词拆分为缓存稳定的
  `<loki_system>` 前缀和位于显式 `[CACHE_BREAKPOINT]` 处的易变
  `<dynamic_context>` 尾部；SDK judge 路径会在该拆分上应用 `cache_control`。
  任何新的常驻指令都应放入前缀，否则每次迭代都会破坏缓存。
- **置信度突增复查。** 自报置信度跳升至接近最大值时，会在完成信号阀强制停止运行前强制执行一次额外验证。
  严格保持附加性：突增只能**增加**一次验证，绝不能跳过、缩短或满足某个门槛。
  它不能延迟停滞阀，并且该延迟仅触发一次，因此反复出现置信度突增的运行无法无限期推迟该阀。
- **可爬坡优化的目标评分。** 不包含可度量目标的 `COMPLETION_PROMISE`（没有数字、比较符、命名指标或可验证工件）会收到提示建议，要求提供可检查的成功条件。
  该建议仅供参考：不会阻止构建，也不会重写目标。
  在目标缺失时，以及在永久模式下会被抑制，因为开放式目标正是该配置的选择。
  bash 和 TypeScript 路径之间逐字节镜像。
- **智能重试。** 对于已明确识别的永久性失败（凭据错误、未知模型、配额耗尽），会提前停止，而不是将重试额度消耗在必然相同的失败上。
  故障安全：无法识别的错误仍保持为 TRANSIENT，并完全按照之前的方式重试；速率限制明确排除在永久性失败集合之外。

## 运行可观测性（v8.0.0）

- **SDK 能力降级事件。** SDK 加载或流式传输失败时，会向 `.loki/events.jsonl` 追加结构化的
  `capability_degraded` 记录（使用与钩子事件相同的 `{type, source, timestamp, payload}` 信封），而不再仅作为捕获输出中的文字存在，以便无人值守的操作员区分“SDK 无法加载”和“模型工作效果不佳”。
  该记录会明确写入 `fail_closed: true`，而不是留待推测。
  不使用环境变量：这是操作员始终需要的信号。
- **首次预览耗时。** `.loki/app-runner/first-preview.json` 记录从运行开始到应用首次提供服务所经过的秒数。
  该文件只写入一次，因此重启无法用一个看起来更快的热启动数值覆盖真正缓慢的首次预览；不存在基线时则完全跳过，不进行猜测。
  仅适用于 bash 路径（app-runner 集成位于该路径中）。

## 首次运行体验（v7.29.0）

- **`loki quickstart`：** 引导完成首次构建的 4 个步骤（设置检查、单行想法、离线模板匹配、包含真实估算器数值的计划审查）；通过 Enter 完成所有步骤即可构建示例 Todo 应用；非 TTY/CI 环境以状态码 2 退出，并提示自动化操作方法。
- **提供安装 Provider：** 当找不到 Provider CLI 时，doctor 以及 start/demo/quick/quickstart 的预检会提供安装 Claude Code 的选项。
  仅在交互式 TTY 中征得同意；首先打印将要执行的单条命令；通过 `claude auth login` 转交认证，并使用 `claude auth status` 确认就绪。
  退出选项：`LOKI_NO_INSTALL_OFFER=1`。
- **`loki demo` 费用确认：** 估算值始终会在产生费用前打印；`--yes` 会跳过提示，但绝不会跳过估算。
  `LOKI_COMPLEXITY` 会受到 `loki plan` 认可，并显示诚实的强制层级说明。

---

## 并发与安全加固（v7.5.7 - v7.5.13）

连续三个补丁修复了跨进程和安全方面的漏洞。默认流程没有面向用户的行为变化；请通过所引用的路径进行验证。

- **跨进程文件锁**用于追加或重写状态，确保并行运行、dashboard 和 MCP 不会破坏共享文件：门控计数器（`autonomy/run.sh` gate-counter writes）、任务队列（`autonomy/run.sh` queue read-modify-write）、检查点索引（`autonomy/run.sh` checkpoint index updates）、`events.jsonl` 追加写入（`events/emit.sh` 和 `autonomy/run.sh` 中的事件发射路径）、人工干预信号文件（状态机文档中约第 8059 / 7897 行的 `autonomy/run.sh:check_human_intervention()`）。
- **MCP 路径验证** -- `mcp/server.py` 工具的文件/路径参数会经过规范化处理；如果路径逃逸出项目根目录，则会被拒绝（v7.5.8 修复的路径遍历问题）。
- **Dashboard 身份验证**现在要求用于 `dashboard/server.py` 中的 `/api/memory/*`、`/api/learning/*` 和 `/api/status`（此前这些读取路径未进行身份验证）。
- **Bash 引号加固**覆盖 `autonomy/run.sh` 和 `autonomy/loki` -- 命令替换以及 `[ ]` 测试中的变量展开均已加引号，以防止路径包含空格时发生单词拆分。

请参阅 `CHANGELOG.md` 中的 [7.5.7]、[7.5.8]、[7.5.13] 条目，了解每项修复的列表和审查者签署确认。

---

## 已实现的功能

| 功能 | 添加版本 | 备注 |
|---------|-------|-------|
| 多提供商支持（5 个提供商） | v5.0.0 | claude、codex、cline、aider、opencode -- 参见 `providers/` |
| CONTINUITY.md 工作记忆 | v5.35.0 | 由 run.sh 自动管理，在每次迭代时更新 |
| 质量门控 3 名审查者系统 | v5.35.0 | `skills/quality-gates.md` 中有 5 名专业审查者；由 run.sh 执行 |
| 记忆系统（情景/语义/程序性） | v5.15.0 | 完整实现位于 `memory/` |
| 上下文窗口跟踪 | v5.40.0 | Dashboard 仪表盘，以及 `GET /api/context` 中的逐智能体明细 |
| 通知触发器 | v5.40.0 | `GET/PUT /api/notifications/triggers` |
| GitHub 集成 | v5.42.2 | 导入、同步回写、创建 PR、导出。CLI：`loki github`，API：`/api/github/*` |
| 遗留系统修复 | v6.67.0 | `loki heal <path>` -- 将摩擦视为语义，提供特征测试 |
| 统一的 `loki start` | v6.84.0 | 自动识别规范（PRD、OpenAPI 等）与 issue 输入 |
| 托管智能体（记忆镜像） | v7.2.0 | 通过 `LOKI_MANAGED_AGENTS` 选择启用 -- 参见托管智能体部分 |
| Bun 运行时（阶段 1） | v7.3.0 | 只读命令通过 `bin/loki` 路由；设置 `LOKI_LEGACY_BASH=1` 可恢复原行为 |
| 阶段 1 RARV-C 闭环 | v7.5.x | 发现注入、真实评审器、自动学习、handoff.md |
| Anthropic SDK 路由 | v8.0.0 | 选择启用，默认关闭；通过一个开关 `LOKI_SDK_MODE` 控制 -- 参见 `references/sdk-mode.md` |
| Harness 智能 | v8.0.0 | 提示缓存规范、置信度突增复查、目标评分、智能重试 |
| SDK 降级事件 | v8.0.0 | 在 `.loki/events.jsonl` 中记录结构化的 `capability_degraded` 记录 |
| 首次预览耗时 | v8.0.0 | `.loki/app-runner/first-preview.json`，只写入一次（bash 路由） |
| 选择启用的构建分析 | v8.0.0 | `build_verified` 事件位于严格的第二道门控之后，仅包含允许列表中的字段 |

## 计划中 / 进行中的功能

| 功能 | 目标 | 备注 |
|---------|--------|-------|
| Bun 运行时（Phase 2+） | TBD | 迁移写入路径命令；在 `feat/bun-migration` 上跟踪 |
| Managed Agents 多智能体路径 | TBD | `LOKI_EXPERIMENTAL_MANAGED_*` 标志 -- 研究预览版，不在在线 API 上提供 |
| 基准测试（HumanEval、SWE-bench） | TBD | `benchmarks/` 中已有运行脚本和数据集；尚无已发布结果 |
| 移除 `loki run` | 下一个大版本 | 目前是 `loki start` 的已弃用别名 |

## 已弃用

| 项目 | 弃用于 | 备注 |
|------|---------------|-------|
| `loki run <issue>` | v6.84.0 | `loki start` 的别名。将在下一个大版本中移除。 |
| VSCode 扩展（`vscode-extension/`） | v7.2.0 | 不再积极维护；仪表板 Web UI 是受支持的前端。 |

---

**v9.30.0 | [Autonomi](https://www.autonomi.dev/) 旗舰产品 | 核心代码约 410 行**