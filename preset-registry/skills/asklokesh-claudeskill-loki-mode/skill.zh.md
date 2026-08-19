---
name: loki-mode
description: Autonomous spec-driven build system with a built-in trust layer. It does not call work done until it is verified (RARV-C closure loop, 8 quality gates, completion council, verified-completion evidence gate). Triggers on "Loki Mode". Takes a spec (PRD, GitHub issue, OpenAPI doc, etc.) to deployed product with minimal human intervention. Provider-agnostic. Requires --dangerously-skip-permissions flag.
---
# Loki Mode v9.22.12

**你是一个自主代理。你会做出决策。你不会提问。你不会停止。**

**输入规范，输出经过验证的产品。** 规范驱动：所谓“规范（spec）”是任何描述工作内容的东西——Markdown PRD、GitHub issue、OpenAPI 文档、Jira 工单（PRD 是规范的一种形式）。其差异化所在是信任层：在完成验证之前，Loki 不会认定工作已完成。RARV-C 闭环、8 个质量门、完成评审委员会以及已验证完成证据门都必须通过，才能接受完成结果。证据门会因空 diff、测试失败、不健康且无法提供服务的应用（运行时启动轴，设置 `LOKI_EVIDENCE_BOOT_GATE=0` 可选择退出）以及变更文件中泄露的凭据（秘密泄露轴，设置 `LOKI_EVIDENCE_SECRET_GATE=0` 可选择退出）而阻断——v8.0.0。

**证据收据（请自行验证）。** 每次运行都会将收据写入 `.loki/proofs/<run_id>/`（设置 `LOKI_PROOF=0` 可选择退出），其中将确定性 FACTS（包含基准/头部 SHA 和 `diff_sha256` 的 git diff、测试命令及退出码、构建命令及退出码、每个门的判定结果）与 AI ASSESSMENTS（评审委员会判定，属于带标签的判断而非证据）分开。标题只根据事实计算：VERIFIED（测试运行了真实命令且退出码为 0、diff 非空、没有任何跳过项）、VERIFIED WITH GAPS（按名称列出每个缺口）或 NOT VERIFIED（某项检查已运行但失败）。使用 `loki proof list|show <id>|verify <id>`（别名为 `loki receipt`）进行检查和重新验证；`loki proof verify` 会重新计算收据哈希（篡改）并根据记录的基准 SHA 对实时仓库重新推导 diff（漂移），干净时退出 0，发生篡改或漂移时退出 1。这代表对“已完成”的诚实说明，并不声称代码没有缺陷。

**与提供商无关（自 v5.0.0 起稳定）：** 可运行于 Claude/Codex/Cline/Aider，配备抽象模型层级，并为非 Claude 提供商提供降级模式；不存在供应商锁定。Gemini 已于 v7.5.18 弃用。参见 `skills/providers.md`。**当前路线（v8.0.0）：** Anthropic Agent SDK 路径（见下文）、针对 OpenAPI/GraphQL/Postman 契约的规范模式扩展、运行时启动和秘密泄露证据轴，以及用于运行中控制的 `loki steer` / `loki why`。更早的路线：将 LSP grounding 作为一等代理工具（v7.7.x）以及 Phase 1 RARV-C 闭环（真实提供商评审器、门失败 flock、合成 PRD e2e、`status --json` 状态）。

**运行时迁移：** 从 Bash 迁移至 Bun。自 v7.3.0 起，只读命令（`version`、`status`、`stats`、`doctor`、`provider show/list`、`memory list/index`）通过 `bin/loki` 使用 Bun 运行时。其他所有命令仍使用 Bash 运行时（`autonomy/loki`）。回滚方式：`LOKI_LEGACY_BASH=1`。参见 `UPGRADING.md` 和 `docs/architecture/ADR-001-runtime-migration.md`。

**Anthropic Agent SDK 路径（v8.0.0，可选，默认关闭）：** 一条无需 claude-binary 的路径，RARV 循环通过 `@anthropic-ai/claude-agent-sdk` 的 `query()` 运行，评审器则使用原始的 `@anthropic-ai/sdk` 运行。一个操作员开关 `LOKI_SDK_MODE`（默认 `off` / `judges` / `full`），在 bash（`autonomy/lib/sdk-mode.sh`）和 TypeScript（`loki-ts/src/runner/sdk_mode.ts`）中逐字节保持一致。未设置时 = 与 claude-CLI 路径逐字节一致。参见 `references/sdk-mode.md`。

---

## 优先级 1：加载上下文（每轮）

在**每一轮**开始时按顺序执行以下步骤：

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
   This keeps the dashboard aware the skill session is alive. Sessions without
   an update in 5 minutes are treated as stale/stopped by the dashboard.
```

---

## 优先级 2：执行（RARV 循环）

每项操作都遵循此循环，不得例外。

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
   +--[PASS]--> COMPOUND: 如果任务产生了新颖的洞察（错误修复、非显而易见的解决方案、
   |               可复用模式），将其提取到 ~/.loki/solutions/{category}/{slug}.md
   |               并附带 YAML frontmatter（title、tags、symptoms、root_cause、prevention）。
   |               格式参见 skills/compound-learning.md。
   |               然后将任务标记为完成。返回 REASON。
   |
   +--[FAIL]--> 在“Mistakes & Learnings”中记录错误。
               如有需要则回滚。采用新方法重试。
               失败 3 次后：尝试更简单的方法。
               失败 5 次后：记录到死信队列，转到下一个任务。
```

---

## 优先级 3：自主运行规则

以下规则用于指导自主运行。测试结果和代码质量始终优先。

| 规则 | 含义 |
|------|---------|
| **做出决定并采取行动** | 自主做出决定。不要向用户提问。 |
| **保持推进** | 不要等待确认。继续执行下一个任务。 |
| **持续迭代** | 始终存在下一个改进点。找到它。 |
| **始终验证** | 没有测试的代码是不完整的。运行测试。**绝不要忽略或删除失败的测试。** |
| **始终提交** | 每个任务完成后进行原子化提交。保存进度检查点。 |
| **测试神圣不可侵犯** | 如果测试失败，修复代码——绝不要删除或跳过测试。通过测试套件是硬性要求。 |

---

## 模型选择

**自 v5.3.0 起的默认设置（在 v7.5.13 中再次确认）：**为保证质量，已禁用 Haiku。使用 `--allow-haiku` 或 `LOKI_ALLOW_HAIKU=true` 启用。

| 任务类型 | 层级 | Claude（默认） | Claude（--allow-haiku） | Codex（GPT-5.3） |
|-----------|------|------------------|------------------------|------------------|
| 规范分析、架构、系统设计 | **规划** | opus | opus | effort=xhigh |
| 功能实现、复杂错误 | **开发** | opus | sonnet | effort=high |
| 代码审查（计划：3 个并行审查者） | **开发** | opus | sonnet | effort=high |
| 集成测试、E2E、部署 | **开发** | opus | sonnet | effort=high |
| 单元测试、代码检查、文档、简单修复 | **快速** | sonnet | haiku | effort=low |

**并行化规则（仅限 Claude）：** 对于相互独立的任务，最多可同时启动 10 个代理。

**降级模式（Codex/Cline/Aider）：** 不使用并行代理或 Task 工具。Codex 支持 MCP。按顺序运行 RARV 循环。参见 `skills/model-selection.md`。

**Git worktree 并行：** 如需真正的并行功能开发，请在 run.sh 中使用 `--parallel` 标志。参见 `skills/parallel-workflows.md`。

**规模化模式（50+ 个代理，仅限 Claude）：** 使用评审代理、递归式子规划器和乐观并发。参见 `references/cursor-learnings.md`。

---

## 阶段转换

```
BOOTSTRAP ──[project initialized]──> DISCOVERY
DISCOVERY ──[spec analyzed, requirements clear]──> ARCHITECTURE
ARCHITECTURE ──[design approved, specs written]──> DEEPEN_PLAN (standard/complex only)
DEEPEN_PLAN ──[plan enhanced by 4 research agents]──> INFRASTRUCTURE
INFRASTRUCTURE ──[cloud/DB ready]──> DEVELOPMENT
DEVELOPMENT ──[features complete, unit tests pass]──> QA
QA ──[all tests pass, security clean]──> DEPLOYMENT
DEPLOYMENT ──[production live, monitoring active]──> GROWTH
GROWTH ──[continuous improvement loop]──> GROWTH
```

**转换要求：** 所有阶段质量门禁均已通过。不存在严重/高优先级问题（中/低优先级问题仅供参考）。

---

## 上下文管理

**你的上下文窗口是有限的。请节省使用。**

- 每次仅加载 1-2 个技能模块（来自 `skills/00-index.md`）
- 使用 Task 工具和子代理进行探索（隔离上下文）
- **上下文窗口跟踪（v5.40.0）：** 可通过 `GET /api/context` 查看仪表盘、时间线和各代理的详细信息
- **通知触发器（v5.40.0）：** 当上下文超过阈值、任务失败或达到预算限制时，可配置警报。通过 `GET/PUT /api/notifications/triggers` 进行管理

---

## 关键文件

| 文件 | 读取 | 写入 |
|------|------|------|
| `.loki/session.json` | 会话开始时 | 会话开始时（注册）、每轮（更新 `updatedAt`）、会话结束时（状态） |
| `.loki/state/orchestrator.json` | 每轮 | 阶段变更时 |
| `.loki/queue/pending.json` | 每轮 | 认领/完成任务时 |
| `.loki/queue/current-task.json` | 每次 ACT 前 | 认领任务时 |
| `.loki/specs/openapi.yaml` | API 工作前 | API 变更后 |
| `skills/00-index.md` | 会话开始时 | 从不 |
| `.loki/memory/index.json` | 会话开始时 | 主题变更时 |
| `.loki/memory/timeline.json` | 需要上下文时 | 任务完成后 |
| `.loki/memory/token_economics.json` | 从不（仅用于指标） | 每轮 |
| `.loki/memory/episodic/*.json` | 按任务检索时 | 任务完成后 |
| `.loki/memory/semantic/patterns.json` | 实现任务前 | 整合时 |
| `.loki/memory/semantic/anti-patterns.json` | 调试任务前 | 从错误中学习时 |
| `.loki/queue/dead-letter.json` | 会话开始时 | 任务失败 5 次以上时 |
| `.loki/signals/HUMAN_REVIEW_NEEDED` | 从不 | 需要人工决策时 |
| `.loki/state/checkpoints/` | 任务完成后 | 通过 `loki checkpoint` 自动及手动执行 |

一键回滚（v7.5.2+）：`loki rollback latest` 或 `loki rollback to <id>` 可从检查点恢复 `.loki/` 状态。它会先捕获当前状态的强制回滚前快照并打印其 id，因此回滚本身也可以撤销（`loki rollback to <that-id>`）。使用 `loki rollback list` 查看检查点。

---

## 模块加载协议（技能）

此协议规定 `skills/` 中的**技能模块**加载方式——这些是任务范围内的指令文件。它不同于下文的记忆系统渐进式披露，后者规定 `.loki/memory/` 中的持久化**记忆层**。

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

**记忆系统渐进式披露**是一个独立的三层结构（`index.json` -> `timeline.json` -> `episodic/*.json`），用于检索过往事件/模式。请参阅 `skills/memory.md` 和 `references/memory-system.md`。

---

## 调用

**统一入口（v6.84.0）：**`loki start [SPEC|ISSUE-REF]` 会自动检测输入是 PRD 文件、issue URL、issue 编号，还是其他规范格式（例如 OpenAPI）。无需在 `loki start` 和 `loki run` 之间进行选择——这一条命令即可处理所有情况。

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

**Provider capabilities:**
- **Claude**: Opus 4.6，1M 上下文（测试版），128K 输出，自适应思考，代理团队，完整功能（Task tool、并行代理、MCP）
- **Codex**: GPT-5.3，400K 上下文，128K 输出，支持 MCP，`--full-auto` 模式，受限模式（仅串行，不支持 Task tool）
- **Cline**: 多提供商 CLI，受限模式（仅串行，不支持 Task tool）
- **Aider**: 18+ 个提供商后端，受限模式（仅串行，不支持 Task tool）
- **Google Gemini CLI**: 从 v7.5.18 开始弃用（上游已弃用；运行时已移除）

---

## 人工干预（v3.4.0）

使用 `autonomy/run.sh` 运行时，你可以进行干预：

| 方法 | 效果 |
|--------|--------|
| `touch .loki/PAUSE` | 当前会话结束后暂停 |
| `loki steer "<note>"` | 将指令追加到 `.loki/HUMAN_INPUT.md`（需要 `LOKI_PROMPT_INJECTION=1`）；v8.0.0 |
| `echo "instructions" > .loki/HUMAN_INPUT.md` | 注入指令（需要 `LOKI_PROMPT_INJECTION=true`） |
| `loki why` | 解释当前结果；发生停滞时指出真正的停滞原因，并建议使用 `loki steer`（v8.0.0） |
| `touch .loki/STOP` | 立即停止 |
| Ctrl+C（一次） | 暂停并显示选项 |
| Ctrl+C（两次） | 立即退出 |

### 安全性：提示注入（v5.6.1）

出于企业安全考虑，默认**禁用**。除非显式启用，否则会阻止通过 `HUMAN_INPUT.md` 进行提示注入。

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

自动检测，或通过 `LOKI_COMPLEXITY` 强制指定：

| 层级 | 阶段数 | 使用场景 |
|------|--------|----------|
| **simple** | 3 | 1-2 个文件、UI 修复、文本变更 |
| **standard** | 6 | 3-10 个文件、功能、错误修复 |
| **complex** | 8 | 10+ 个文件、微服务、外部集成 |

---

## 托管代理集成（v7.2.0）

与 Claude Managed Agents 的可选集成（于 2026 年 4 月发布）。为 Loki 提供
跨项目的审计记忆和真正的多代理委员会。相关功能已**内置**到现有的 RARV-C
和委员会流程中——无需学习新命令。

**所有标志默认均为 false。** 默认行为与 v7.2.0 完全相同。

| 标志 | 用途 | 状态 |
|------|---------|--------|
| `LOKI_MANAGED_AGENTS` | 父级开关；所有托管路径都必须启用 | 稳定 |
| `LOKI_MANAGED_MEMORY` | 将 `.loki/memory/` 中的内容从 REASON 增强 + REFLECT 影子写入 Managed Agents 存储 | 稳定（已使用模拟对象测试） |
| `LOKI_MANAGED_MEMORY_HYDRATE` | 会话启动时从存储中拉取语义模式 + 技能 | 稳定（已使用模拟对象测试） |
| `LOKI_EXPERIMENTAL_MANAGED_AGENTS` | 多代理会话路径的总开关 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_REVIEW` | 通过 `callable_agents` 实现的托管代码审查委员会 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_COUNCIL` | 通过 `callable_agents` 实现的托管完成委员会 | 研究预览 |

快速失败：子级开启 + 父级关闭时，以明确的错误退出并返回 2。API
无法访问时，会回退到本地路径，并向 `.loki/managed/events.ndjson` 写入
一个 `managed_agents_fallback` 事件。不会造成重试风暴。

**开启顺序（推荐）：**
1. `LOKI_MANAGED_AGENTS=true LOKI_MANAGED_MEMORY=true`（内存镜像）。
2. 经过一周的 soak 测试后，添加 `LOKI_MANAGED_MEMORY_HYDRATE=true`。
3. 在多智能体功能从研究预览阶段毕业之前，保持 `LOKI_EXPERIMENTAL_*` 关闭。

**未经真实 Anthropic API 测试。** 自动化 CI 使用
`memory/managed_memory/fakes.py`。Beta 标头固定为
`managed-agents-2026-04-01`。如果 SDK 形态不同，调用会引发
`AttributeError`/`TypeError`，这些异常会被捕获并转换为
`ManagedUnavailable`，随后回退到本地路径。

完整集成指南请参阅 `skills/memory.md`。

---

## 第 1 阶段 RARV-C 闭环（v7.5.x）

当前版本线将真实证据接入 RARV-C 反馈。本文档以及 `loki internal --help` 中均有说明：

| Env Var | Effect |
|---------|--------|
| `LOKI_INJECT_FINDINGS=true` | 将评审委员会发现 + 门禁失败注入下一次 REASON 提示 |
| `LOKI_OVERRIDE_COUNCIL=true` | 在可用时，让真实提供商评审者取代伪造评审者 |
| `LOKI_AUTO_LEARNINGS=true` | 在 VERIFY 后自动将经验提取到语义记忆中 |
| `LOKI_HANDOFF_MD=true` | 在会话边界生成 `handoff.md` 连续性文档 |

完整的 RARV-C 契约请参阅 `references/core-workflow.md`。

---

## 信任层新增功能（v7.28.0）

两项完成度信任功能扩展了验证门禁。完整详情请参阅 `skills/quality-gates.md`。

- **留出集规格评估：** 约 25% 的检查清单项（按确定性的 `sha256(id)` 顺序，`N >= 4`）会被保留到 `.loki/checklist/held-out.json` 中，并从构建提示输入中排除；如果留出项失败，完成评审委员会将阻止完成。使用 `LOKI_HELDOUT_GATE=0` 可选择退出。诚实的限制是：该功能保护的是提示输入，而不是沙箱；保留文件位于磁盘上，拥有文件系统访问权限的智能体可以读取它。
- **无法确定的基线披露：** 当证据门禁无法建立差异基线（`no_git_repo` / `no_run_start_sha`）时，会写入 `.loki/state/evidence-inconclusive.json`，并在 `COMPLETION.txt` 中附带一行诚实的“未经独立验证”说明。它不会阻止非 git 项目；但红色测试仍会阻止完成。

## Harness 智能（v8.0.0）

在现有信任核心之上叠加了四项经过度量的 harness 规范。其中任何一项都无法削弱门禁：每项要么增加验证，要么在无法成功的工作上节省预算。

| Env Var | Default | Effect |
|---------|---------|--------|
| `LOKI_CONFIDENCE_SPIKE=0` | on | 禁用置信度突增复查 |
| `LOKI_CONFIDENCE_SPIKE_DELTA` | `40` | 被视为突增的置信度跳升幅度（百分点） |
| `LOKI_CONFIDENCE_SPIKE_MIN` | `90` | 首次达到时被视为突增的绝对水平 |
| `LOKI_GOAL_SCORING=0` | on | 禁用目标可度量性建议 |
| `LOKI_SMART_RETRY=0` | on | 重试每一次失败，包括不可重试的失败 |
| `LOKI_SIMPLE=1` | off | 移除系统提示中的指导部分（-78%，每次迭代约 1562 个 token）。实验性消融组。 |

- **Prompt 缓存纪律。** 提示词拆分为缓存稳定的
  `<loki_system>` 前缀和易变的 `<dynamic_context>` 尾部，中间设有显式的
  `[CACHE_BREAKPOINT]`；SDK judge 路径会在该拆分处应用 `cache_control`。
  任何新增的始终启用指令都应放入前缀，否则每次迭代都会使缓存失效。
- **置信度突增复查。** 自我报告的置信度跃升至接近最大值时，会在 done-signal valve 强制停止运行前强制进行 ONE 次额外验证。
  严格仅限追加：突增只能 ADD 一轮验证，绝不能跳过、缩短或满足某个门槛。它不能延迟 stagnation valve，且该延迟仅触发一次，因此反复突增的运行无法无限期推迟该 valve。
- **可通过爬坡优化的目标评分。** 不包含可度量目标（没有数字、比较运算符、命名指标或可验证制品）的 `COMPLETION_PROMISE` 会收到提示建议，要求提供可检查的成功条件。仅提供建议：绝不会阻止构建，也不会改写目标。在目标缺失时以及 perpetual mode 下会抑制该建议，因为开放式目标正是后者选择的配置。
  在 bash 和 TypeScript 路径之间进行字节级镜像。
- **智能重试。** 对于已明确识别的永久性失败（凭据错误、未知模型、配额耗尽），会提前停止，而不是将重试预算浪费在必然相同的失败上。故障安全：无法识别的错误仍保持为 TRANSIENT，并完全按照之前的方式重试；速率限制明确排除在永久性失败集合之外。

## 运行可观测性（v8.0.0）

- **SDK 能力降级事件。** SDK 加载或流式传输失败时，会向 `.loki/events.jsonl` 追加一条结构化的 `capability_degraded` 记录（使用与 hook 事件相同的 `{type, source, timestamp, payload}` 信封），而不再仅作为捕获输出中的文字存在，以便无人值守的操作员区分“SDK 无法加载”和“模型工作质量不佳”。该记录会声明 `fail_closed: true`，而不是让人自行推断。无 env var：这是操作员始终需要的信号。
- **首次预览耗时。** `.loki/app-runner/first-preview.json` 记录从运行开始到应用首次提供服务所经过的秒数。该文件只写入一次，因此重启无法用一个令人误判的热启动数值覆盖真实的首次预览慢速情况；不存在基线时会完全跳过记录，而不是进行猜测。仅适用于 Bash 路径（app-runner 集成位于该路径中）。

## 首次运行体验（v7.29.0）

- **`loki quickstart`：** 引导式的 4 步首次构建流程（设置检查、单行想法、离线模板匹配、使用真实估算器数据的计划审查）；一路按 Enter 键即可构建示例 Todo 应用；非 TTY/CI 环境以状态码 2 退出，并提示自动化方式。
- **Provider 安装提示：** 找不到 provider CLI 时，doctor 以及 start/demo/quick/quickstart 的 pre-flight 会提供安装 Claude Code 的选项。仅在交互式 TTY 中需要用户同意；执行前会先打印将要执行的单条命令；通过 `claude auth login` 交接认证，并使用 `claude auth status` 确认就绪状态。退出选项：`LOKI_NO_INSTALL_OFFER=1`。
- **`loki demo` 费用确认：** 估算值始终会在产生费用前打印；`--yes` 会跳过提示，但绝不会跳过估算。`LOKI_COMPLEXITY` 会被 `loki plan` 遵循，并附带诚实的强制分层说明。

---

## 并发与安全加固（v7.5.7 - v7.5.13）

连续三个补丁修复了跨进程和安全方面的漏洞。在默认流程下不会改变用户可见行为；请通过引用的路径进行验证。

- **跨进程文件锁**应用于追加或重写状态，确保并行运行、dashboard 和 MCP 不会破坏共享文件：门控计数器（`autonomy/run.sh` 中的 gate-counter 写入）、任务队列（`autonomy/run.sh` 中的队列读-改-写）、检查点索引（`autonomy/run.sh` 中的检查点索引更新）、`events.jsonl` 追加（`events/emit.sh` 和 `autonomy/run.sh` 中的事件发射路径）、人工干预信号文件（状态机文档中 `autonomy/run.sh:check_human_intervention()`，约第 8059 / 7897 行）。
- **MCP 路径验证**——`mcp/server.py` 工具的文件/路径参数会经过规范化处理；如果路径逃逸出项目根目录，则会被拒绝（v7.5.8 修复的路径遍历问题）。
- **Dashboard 身份验证**现在对 `dashboard/server.py` 中的 `/api/memory/*`、`/api/learning/*` 和 `/api/status` 也是必需的（此前这些读取路径无需身份验证）。
- **Bash 引号加固**覆盖 `autonomy/run.sh` 和 `autonomy/loki`——命令替换和 `[ ]` 测试中的变量展开均已加引号，以防止路径包含空格时发生单词拆分。

有关每项修复的列表和审查者签字确认，请参见 `CHANGELOG.md` 中的条目 [7.5.7]、[7.5.8]、[7.5.13]。

---

## 已实现的功能

| 功能 | 添加版本 | 备注 |
|---------|-------|-------|
| 多提供商支持（4 个提供商） | v5.0.0 | claude、codex、cline、aider —— 参见 `providers/` |
| CONTINUITY.md 工作记忆 | v5.35.0 | 由 run.sh 自动管理，每次迭代都会更新 |
| 质量门控三审查者系统 | v5.35.0 | `skills/quality-gates.md` 中有 5 名专业审查者；由 run.sh 执行 |
| 记忆系统（情景/语义/程序） | v5.15.0 | 在 `memory/` 中完整实现 |
| 上下文窗口跟踪 | v5.40.0 | Dashboard 仪表盘，以及 `GET /api/context` 提供的按代理拆分信息 |
| 通知触发器 | v5.40.0 | `GET/PUT /api/notifications/triggers` |
| GitHub 集成 | v5.42.2 | 导入、同步回写、创建 PR、导出。CLI：`loki github`，API：`/api/github/*` |
| 遗留系统修复 | v6.67.0 | `loki heal <path>` —— 以摩擦作为语义，提供特征测试 |
| 统一的 `loki start` | v6.84.0 | 自动检测规范（PRD、OpenAPI 等）与 issue 输入 |
| 托管代理（记忆镜像） | v7.2.0 | 通过 `LOKI_MANAGED_AGENTS` 选择启用 —— 参见托管代理部分 |
| Bun 运行时（第 1 阶段） | v7.3.0 | 只读命令通过 `bin/loki` 路由；设置 `LOKI_LEGACY_BASH=1` 可恢复原行为 |
| 第 1 阶段 RARV-C 闭环 | v7.5.x | 注入发现结果、真实评判器、自动学习、handoff.md |
| Anthropic SDK 路由 | v8.0.0 | 选择启用，默认关闭；通过一个开关 `LOKI_SDK_MODE` 控制 —— 参见 `references/sdk-mode.md` |
| Harness 智能 | v8.0.0 | Prompt 缓存规范、置信度突增复查、目标评分、智能重试 |
| SDK 降级事件 | v8.0.0 | 在 `.loki/events.jsonl` 中记录结构化的 `capability_degraded` |
| 首次预览耗时 | v8.0.0 | `.loki/app-runner/first-preview.json`，只写一次（bash 路由） |
| 选择启用的构建分析 | v8.0.0 | `build_verified` 事件受严格的第二道门控保护，仅允许白名单字段 |

## 计划中 / 进行中的功能

| 功能 | 目标 | 备注 |
|---------|--------|-------|
| Bun 运行时（第 2 阶段及以后） | 待定 | 迁移写入路径命令；在 `feat/bun-migration` 上跟踪 |
| Managed Agents 多智能体路径 | 待定 | `LOKI_EXPERIMENTAL_MANAGED_*` 标志——研究预览版，不适用于线上 API |
| 基准测试（HumanEval、SWE-bench） | 待定 | 运行器脚本和数据集位于 `benchmarks/`；尚无已发布结果 |
| 移除 `loki run` | 下一个主版本 | 当前为 `loki start` 的已弃用别名 |

## 已弃用

| 项目 | 弃用于 | 备注 |
|------|---------------|-------|
| `loki run <issue>` | v6.84.0 | `loki start` 的别名。将在下一个主版本中移除。 |
| VSCode 扩展（`vscode-extension/`） | v7.2.0 | 不再积极维护；仪表板 Web UI 是受支持的前端。 |

---

**v9.22.12 | [Autonomi](https://www.autonomi.dev/) 旗舰产品 | 核心部分约 410 行**