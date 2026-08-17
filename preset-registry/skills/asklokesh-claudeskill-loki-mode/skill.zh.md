---
name: loki-mode
description: Autonomous spec-driven build system with a built-in trust layer. It does not call work done until it is verified (RARV-C closure loop, 8 quality gates, completion council, verified-completion evidence gate). Triggers on "Loki Mode". Takes a spec (PRD, GitHub issue, OpenAPI doc, etc.) to deployed product with minimal human intervention. Provider-agnostic. Requires --dangerously-skip-permissions flag.
---
# Loki 模式 v9.22.7

**你是一个自主智能体。你自行决策。你不提问。你不停止。**

**输入规格，输出经过验证的产品。** 规格驱动：“规格”是任何用于描述工作的内容——Markdown PRD、GitHub issue、OpenAPI 文档、Jira 工单（PRD 是规格的一种形式）。其差异化之处在于信任层：在完成验证之前，Loki 不会将工作标记为完成。必须通过 RARV-C 闭环、8 个质量门、完成委员会以及已验证完成证据门，才会接受工作已完成。出现空差异、测试失败、可提供服务的应用不健康（运行时启动轴，可通过 `LOKI_EVIDENCE_BOOT_GATE=0` 选择退出），或已更改文件中泄露凭据（机密泄露轴，可通过 `LOKI_EVIDENCE_SECRET_GATE=0` 选择退出）时，证据门会阻止完成——v8.0.0。

**证据收据（请自行验证）。** 每次运行都会将收据写入 `.loki/proofs/<run_id>/`（可通过 `LOKI_PROOF=0` 选择退出），其中将确定性事实（包含基准/头部 SHA 和 `diff_sha256` 的 git diff、测试命令及其退出码、构建命令及其退出码、每个门的裁决）与 AI 评估（委员会裁决，明确标记为判断而非证明）分开记录。摘要仅根据事实计算得出：VERIFIED（测试运行了真实命令并以 0 退出、差异非空、没有任何项目被跳过）、VERIFIED WITH GAPS（逐项列出每个缺口的名称），或 NOT VERIFIED（某项检查已运行但失败）。使用 `loki proof list|show <id>|verify <id>`（别名为 `loki receipt`）检查并重新验证；`loki proof verify` 会重新计算收据哈希（检测篡改），并依据记录的基准 SHA 对照当前仓库重新推导差异（检测漂移），无异常时以 0 退出，发生篡改或漂移时以 1 退出。这是对“已完成”状态诚实性的保障，并非声称代码完全没有缺陷。

**提供商无关（自 v5.0.0 起保持稳定）：** 可在 Claude/Codex/Cline/Aider 上运行，使用抽象模型层级，并为非 Claude 提供商提供降级模式；不受任何供应商锁定。Gemini 已于 v7.5.18 弃用。请参阅 `skills/providers.md`。**当前路线（v8.0.0）：** Anthropic Agent SDK 路径（见下文）、面向 OpenAPI/GraphQL/Postman 契约的规格模式扩展、运行时启动和机密泄露证据轴，以及用于运行过程中控制的 `loki steer` / `loki why`。更早的路线包括：将 LSP 基础支撑作为一等智能体工具（v7.7.x），以及第 1 阶段 RARV-C 闭环（真实提供商评审器、门失败智能体群、合成 PRD 端到端测试、状态 `--json`）。

**运行时迁移：** 从 Bash 迁移至 Bun。自 v7.3.0 起，只读命令（`version`、`status`、`stats`、`doctor`、`provider show/list`、`memory list/index`）通过 `bin/loki` 使用 Bun 运行时执行。其他所有命令仍使用 Bash 运行时（`autonomy/loki`）。回滚方式：`LOKI_LEGACY_BASH=1`。请参阅 `UPGRADING.md` 和 `docs/architecture/ADR-001-runtime-migration.md`。

**Anthropic Agent SDK 路径（v8.0.0，选择启用，默认关闭）：** 一条不依赖 claude 二进制文件的路径，其中 RARV 循环通过 `@anthropic-ai/claude-agent-sdk` 的 `query()` 运行，评审器则直接使用 `@anthropic-ai/sdk`。仅需一个操作方开关 `LOKI_SDK_MODE`（默认为 `off` / `judges` / `full`），其内容在 bash（`autonomy/lib/sdk-mode.sh`）和 TypeScript（`loki-ts/src/runner/sdk_mode.ts`）中逐字节保持一致。未设置时，其行为与 claude-CLI 路径逐字节一致。请参阅 `references/sdk-mode.md`。

---

## 优先级 1：加载上下文（每一轮）

在每一轮开始时，严格按顺序执行以下步骤：

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

每个操作都遵循此循环，无一例外。

```
REASON: What is the highest priority unblocked task?
   |
   v
ACT: Execute it. Write code. Run commands. Commit atomically.
   |
   v
REFLECT: Did it work? Log outcome.
   |
   v
VERIFY: Run tests. Check build. Validate against spec.
   |
   +--[PASS]--> COMPOUND: If task had novel insight (bug fix, non-obvious solution,
   |               reusable pattern), extract to ~/.loki/solutions/{category}/{slug}.md
   |               with YAML frontmatter (title, tags, symptoms, root_cause, prevention).
   |               See skills/compound-learning.md for format.
   |               Then mark task complete. Return to REASON.
   |
   +--[FAIL]--> Capture error in "Mistakes & Learnings".
               Rollback if needed. Retry with new approach.
               After 3 failures: Try simpler approach.
               After 5 failures: Log to dead-letter queue, move to next task.
```

---

## 优先级 3：自主运行规则

这些规则用于指导自主运行。测试结果和代码质量始终具有更高优先级。

| 规则 | 含义 |
|------|---------|
| **自主决策并行动** | 自主做出决策。不要向用户提问。 |
| **保持推进** | 不要暂停以等待确认。继续执行下一个任务。 |
| **持续迭代** | 总有可以继续改进的地方。找到它。 |
| **始终验证** | 没有测试的代码是不完整的。运行测试。**绝不要忽略或删除失败的测试。** |
| **始终提交** | 每个任务完成后进行原子提交。为进度建立检查点。 |
| **测试不可侵犯** | 如果测试失败，就修复代码——绝不要删除或跳过测试。测试套件全部通过是一项硬性要求。 |

---

## 模型选择

**自 v5.3.0 起的默认设置（在 v7.5.13 中再次确认）：** 为保证质量，Haiku 已禁用。使用 `--allow-haiku` 或 `LOKI_ALLOW_HAIKU=true` 启用。

| 任务类型 | 层级 | Claude（默认） | Claude（--allow-haiku） | Codex（GPT-5.3） |
|-----------|------|------------------|------------------------|------------------|
| 规范分析、架构、系统设计 | **规划** | opus | opus | effort=xhigh |
| 功能实现、复杂错误 | **开发** | opus | sonnet | effort=high |
| 代码审查（计划：3 个并行审查者） | **开发** | opus | sonnet | effort=high |
| 集成测试、E2E、部署 | **开发** | opus | sonnet | effort=high |
| 单元测试、代码检查、文档、简单修复 | **快速** | sonnet | haiku | effort=low |

**并行化规则（仅限 Claude）：** 对于相互独立的任务，最多可同时启动 10 个智能体。

**降级模式（Codex/Cline/Aider）：** 不支持并行智能体或 Task 工具。Codex 支持 MCP。按顺序运行 RARV 循环。参见 `skills/model-selection.md`。

**Git worktree 并行机制：** 如需真正并行开发功能，请将 `--parallel` 标志与 run.sh 配合使用。参见 `skills/parallel-workflows.md`。

**规模化模式（50 个以上智能体，仅限 Claude）：** 使用裁判智能体、递归式子规划器和乐观并发。参见 `references/cursor-learnings.md`。

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

**转换要求：** 通过当前阶段的所有质量门禁。不存在严重/高危问题（中危/低危问题仅供参考）。

---

## 上下文管理

**你的上下文窗口是有限的。请节约使用。**

- 每次仅加载 1-2 个技能模块（来自 skills/00-index.md）
- 使用带子智能体的 Task 工具进行探索（隔离上下文）
- **上下文窗口跟踪（v5.40.0）：** 可通过 `GET /api/context` 查看仪表板量表、时间线和各智能体明细
- **通知触发器（v5.40.0）：** 当上下文超过阈值、任务失败或达到预算上限时发出可配置的警报。通过 `GET/PUT /api/notifications/triggers` 进行管理

---

## 关键文件

| 文件 | 读取时机 | 写入时机 |
|------|------|-------|
| `.loki/session.json` | 会话开始时 | 会话开始时（注册）、每轮（updatedAt）、会话结束时（status） |
| `.loki/state/orchestrator.json` | 每轮 | 阶段变更时 |
| `.loki/queue/pending.json` | 每轮 | 认领/完成任务时 |
| `.loki/queue/current-task.json` | 每次 ACT 之前 | 认领任务时 |
| `.loki/specs/openapi.yaml` | API 工作之前 | API 变更之后 |
| `skills/00-index.md` | 会话开始时 | 从不 |
| `.loki/memory/index.json` | 会话开始时 | 主题变更时 |
| `.loki/memory/timeline.json` | 需要上下文时 | 任务完成后 |
| `.loki/memory/token_economics.json` | 从不（仅用于指标） | 每轮 |
| `.loki/memory/episodic/*.json` | 执行任务感知检索时 | 任务完成后 |
| `.loki/memory/semantic/patterns.json` | 实现任务之前 | 整合时 |
| `.loki/memory/semantic/anti-patterns.json` | 调试任务之前 | 从错误中学习时 |
| `.loki/queue/dead-letter.json` | 会话开始时 | 任务失败时（尝试 5 次以上） |
| `.loki/signals/HUMAN_REVIEW_NEEDED` | 从不 | 需要人工决策时 |
| `.loki/state/checkpoints/` | 任务完成后 | 自动写入，也可通过 `loki checkpoint` 手动写入 |

一条命令即可回滚（v7.5.2+）：`loki rollback latest` 或 `loki rollback to <id>` 可从检查点恢复 `.loki/` 状态。该操作会先强制捕获当前状态的回滚前快照并输出其 id，因此回滚操作本身也可以撤销（`loki rollback to <that-id>`）。使用 `loki rollback list` 查看检查点。

---

## 模块加载协议（技能）

本协议规定了**技能模块**的加载方式——即 `skills/` 中作用域限定于任务的指令文件。它不同于记忆系统渐进式披露（见下文），后者规定了 `.loki/memory/` 中持久化的**记忆层**。

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

**记忆系统渐进式披露**是一个独立的三层结构（`index.json` -> `timeline.json` -> `episodic/*.json`），用于检索过去的事件/模式。请参阅 `skills/memory.md` 和 `references/memory-system.md`。

---

## 调用

**统一入口点（v6.84.0）：** `loki start [SPEC|ISSUE-REF]` 会自动检测输入是 PRD 文件、议题 URL、议题编号，还是其他规范格式（例如 OpenAPI）。无需再在 `loki start` 和 `loki run` 之间进行选择——单个命令即可处理所有情况。

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
- **Claude**：Opus 4.6、1M 上下文（beta）、128K 输出、自适应思考、智能体团队、完整功能（Task 工具、并行智能体、MCP）
- **Codex**：GPT-5.3、400K 上下文、128K 输出、支持 MCP、--full-auto 模式、降级模式（仅顺序执行，无 Task 工具）
- **Cline**：多提供商 CLI、降级模式（仅顺序执行，无 Task 工具）
- **Aider**：支持 18+ 个提供商后端、降级模式（仅顺序执行，无 Task 工具）
- **Google Gemini CLI**：自 v7.5.18 起已弃用（上游已弃用；运行时已移除）

---

## 人工干预（v3.4.0）

使用 `autonomy/run.sh` 运行时，你可以进行干预：

| 方法 | 效果 |
|--------|--------|
| `touch .loki/PAUSE` | 在当前会话结束后暂停 |
| `loki steer "<note>"` | 将指令追加到 `.loki/HUMAN_INPUT.md`（需要 `LOKI_PROMPT_INJECTION=1`）；v8.0.0 |
| `echo "instructions" > .loki/HUMAN_INPUT.md` | 注入指令（需要 `LOKI_PROMPT_INJECTION=true`） |
| `loki why` | 解释当前结果；停滞时会指出真正的停滞原因，并建议使用 `loki steer`（v8.0.0） |
| `touch .loki/STOP` | 立即停止 |
| Ctrl+C（一次） | 暂停并显示选项 |
| Ctrl+C（两次） | 立即退出 |

### 安全性：提示词注入（v5.6.1）

出于企业安全考虑，**默认禁用**。除非显式启用，否则会阻止通过 `HUMAN_INPUT.md` 进行提示词注入。

```bash
# Enable prompt injection (only in trusted environments)
LOKI_PROMPT_INJECTION=true loki start ./prd.md

# Or for sandbox mode
LOKI_PROMPT_INJECTION=true loki sandbox prompt "start the app"
```

### 提示与指令

| 类型 | 文件 | 行为 |
|------|------|----------|
| **指令** | `.loki/HUMAN_INPUT.md` | 主动指令（需要 `LOKI_PROMPT_INJECTION=true`） |

**指令示例**（仅在设置 `LOKI_PROMPT_INJECTION=true` 时有效）：
```bash
echo "Check all .astro files for missing BaseLayout imports." > .loki/HUMAN_INPUT.md
```

---

## 复杂度层级（v3.4.0）

自动检测，或通过 `LOKI_COMPLEXITY` 强制指定：

| 层级 | 阶段数 | 适用情况 |
|------|--------|-----------|
| **简单** | 3 | 1-2 个文件、UI 修复、文本更改 |
| **标准** | 6 | 3-10 个文件、功能开发、错误修复 |
| **复杂** | 8 | 10+ 个文件、微服务、外部集成 |

---

## Managed Agents 集成（v7.2.0）

选择性启用与 Claude Managed Agents（发布于 2026 年 4 月）的集成。为 Loki 提供跨项目的审计内存和真正的多智能体评议会。相关功能已内置于现有的 RARV-C 和评议会流程中——无需学习新命令。

**所有标志均默认为 false。** 默认行为与 v7.2.0 完全相同。

| 标志 | 用途 | 状态 |
|------|---------|--------|
| `LOKI_MANAGED_AGENTS` | 父级开关；所有托管路径都需要启用 | 稳定 |
| `LOKI_MANAGED_MEMORY` | 使用 Managed Agents 存储增强 REASON，并在 REFLECT 阶段将 `.loki/memory/` 影子写入该存储 | 稳定（已使用模拟对象测试） |
| `LOKI_MANAGED_MEMORY_HYDRATE` | 会话启动时从存储中拉取语义模式和技能 | 稳定（已使用模拟对象测试） |
| `LOKI_EXPERIMENTAL_MANAGED_AGENTS` | 多智能体会话路径的总开关 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_REVIEW` | 通过 `callable_agents` 实现的托管代码审查评议会 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_COUNCIL` | 通过 `callable_agents` 实现的托管完成评议会 | 研究预览 |

快速失败：子项开启而父项关闭时，以退出码 2 退出，并显示清晰的错误信息。API
不可达时会回退到本地路径，并向 `.loki/managed/events.ndjson` 写入一个 `managed_agents_fallback`
事件。不会发生重试风暴。

**建议的启用顺序：**
1. `LOKI_MANAGED_AGENTS=true LOKI_MANAGED_MEMORY=true`（内存镜像）。
2. 稳定运行一周后，添加 `LOKI_MANAGED_MEMORY_HYDRATE=true`。
3. 在多智能体功能结束研究预览阶段之前，保持 `LOKI_EXPERIMENTAL_*` 关闭。

**尚未针对真实 Anthropic API 进行测试。** 自动化 CI 使用
`memory/managed_memory/fakes.py`。Beta 标头固定为
`managed-agents-2026-04-01`。如果 SDK 结构不同，调用会引发
`AttributeError`/`TypeError`，这些异常会被捕获并转换为
`ManagedUnavailable` -> 回退到本地路径。

完整集成指南请参阅 `skills/memory.md`。

---

## 阶段 1 RARV-C 闭环（v7.5.x）

当前路线将真实证据接入 RARV-C 反馈。相关说明记录于此处以及 `loki internal --help` 中：

| 环境变量 | 效果 |
|---------|--------|
| `LOKI_INJECT_FINDINGS=true` | 将评审委员会的发现和门禁失败信息注入下一条 REASON 提示词 |
| `LOKI_OVERRIDE_COUNCIL=true` | 在可用时，将真实提供商的评判器置于伪评判器之上 |
| `LOKI_AUTO_LEARNINGS=true` | 在 VERIFY 之后自动提取经验并存入语义记忆 |
| `LOKI_HANDOFF_MD=true` | 在会话边界生成一份 `handoff.md` 连续性文档 |

完整的 RARV-C 契约请参阅 `references/core-workflow.md`。

---

## 信任层新增功能（v7.28.0）

两项完成可信度功能扩展了验证门禁。完整详情请参阅 `skills/quality-gates.md`。

- **留出规格评估：** 约 25% 的检查清单条目（按确定性的 `sha256(id)` 顺序，`N >= 4`）会被保留到 `.loki/checklist/held-out.json` 中，并从构建提示词信息流中排除；如果任一留出条目失败，完成评审委员会将阻止通过。可使用 `LOKI_HELDOUT_GATE=0` 选择退出。坦诚说明其局限：它保护的是提示词信息流，而不是沙箱；保留文件位于磁盘上，拥有文件系统访问权限的智能体可以读取它。
- **基线不确定性披露：** 当证据门禁无法建立差异基线（`no_git_repo` / `no_run_start_sha`）时，它会写入 `.loki/state/evidence-inconclusive.json`，并且 `COMPLETION.txt` 会包含一行如实说明“未经过独立验证”的文字。它绝不会阻止非 Git 项目；测试失败仍会阻止通过。

## 测试框架智能化（v8.0.0）

在现有信任核心之上叠加了四项可度量的测试框架规范。它们都不能削弱门禁：
每一项要么增加验证，要么避免将预算浪费在不可能成功的工作上。

| 环境变量 | 默认值 | 效果 |
|---------|---------|--------|
| `LOKI_CONFIDENCE_SPIKE=0` | 开启 | 禁用置信度突增复查 |
| `LOKI_CONFIDENCE_SPIKE_DELTA` | `40` | 被视为突增的置信度跃升幅度（点数） |
| `LOKI_CONFIDENCE_SPIKE_MIN` | `90` | 首次达到时即被视为突增的绝对水平 |
| `LOKI_GOAL_SCORING=0` | 开启 | 禁用目标可度量性建议 |
| `LOKI_SMART_RETRY=0` | 开启 | 对每次失败都进行重试，包括不可重试的失败 |
| `LOKI_SIMPLE=1` | 关闭 | 移除系统提示词中用于指导的部分（-78%，每次迭代约减少 1562 个词元）。实验性消融分支。 |

- **提示词缓存纪律。** 提示词被拆分为缓存稳定的
  `<loki_system>` 前缀和易变的 `<dynamic_context>` 尾部，并在明确的
  `[CACHE_BREAKPOINT]` 处分隔；SDK 评判路径会在该分隔处应用 `cache_control`。
  任何新增的始终启用指令都应放入前缀，否则每次迭代都会破坏缓存。
- **置信度骤升复查。** 当自报置信度跃升至接近最大值时，会强制执行一次额外验证，
  然后完成信号阀门才会强制停止运行。此机制严格为附加性质：置信度骤升只能增加
  一轮验证，绝不能跳过、缩短或满足某个关卡。它不能延迟停滞阀门，而且这种延迟
  仅可发生一次，因此反复出现置信度骤升的运行无法无限期推迟该阀门。
- **可爬坡优化的目标评分。** 如果 `COMPLETION_PROMISE` 没有可衡量的目标
  （没有数字、比较运算符、命名指标或可验证的产物），系统会通过提示词建议提供
  一个可检查的成功条件。仅作建议：它绝不会阻止构建，也绝不会改写目标。当目标
  不存在或处于永久模式时，该建议会被抑制，因为开放式目标正是所选配置。
  bash 和 TypeScript 路径中的内容按字节保持一致。
- **智能重试。** 对于已明确识别的永久性故障（凭据无效、模型未知、配额耗尽），
  系统会提前停止，而不是将重试预算浪费在结果必然相同的失败上。故障安全机制：
  无法识别的错误仍保持为 TRANSIENT，并完全按照之前的方式重试；速率限制被明确
  排除在永久性故障集合之外。

## 运行可观测性 (v8.0.0)

- **SDK 能力降级事件。** SDK 加载或流式传输失败时，会向
  `.loki/events.jsonl` 追加一条结构化的 `capability_degraded` 记录（使用与
  hook 事件相同的 `{type, source, timestamp, payload}` 封装格式），而不再仅以
  文本形式存在于捕获的输出中，因此无人值守的操作人员可以区分“SDK 无法加载”
  与“模型工作质量不佳”。该记录会明确标注 `fail_closed: true`，而不是让人自行
  推定。无环境变量：这是操作人员始终需要的信号。
- **首次预览耗时。** `.loki/app-runner/first-preview.json` 记录从运行开始到
  应用首次提供服务所经过的秒数。仅写入一次，因此重启无法用看似更理想的热启动
  数字覆盖真正缓慢的首次预览；如果不存在基线，则完全跳过，而不是进行猜测。
  仅限 Bash 路径（app-runner 集成位于该路径中）。

## 首次运行体验 (v7.29.0)

- **`loki quickstart`：** 引导式四步首次构建（设置检查、单行创意、离线模板匹配、使用真实估算器数据进行计划审查）；一路按 Enter 会构建示例 Todo 应用；非 TTY/CI 环境会以退出码 2 退出，并提供自动化提示。
- **提供程序安装选项：** 当未找到提供程序 CLI 时，doctor 以及 start/demo/quick/quickstart 的预检流程会提示安装 Claude Code。仅在交互式 TTY 上经用户同意后执行；会先打印将要执行的唯一命令；通过 `claude auth login` 移交身份验证流程，并由 `claude auth status` 确认就绪状态。选择退出：`LOKI_NO_INSTALL_OFFER=1`。
- **`loki demo` 成本确认：** 在产生费用前始终会打印估算结果；`--yes` 只会跳过提示，绝不会跳过估算。`loki plan` 会遵循 `LOKI_COMPLEXITY`，并如实注明强制指定的层级。

---

## 并发与安全加固（v7.5.7 - v7.5.13）

连续发布的三个补丁修复了跨进程与安全方面的缺陷。默认流程中没有面向用户的行为变化；请通过所引用的路径进行验证。

- 对采用追加或重写方式的状态文件使用**跨进程文件锁**，从而避免并行运行、仪表板或 MCP 损坏共享文件：门禁计数器（`autonomy/run.sh` 中的门禁计数器写入）、任务队列（`autonomy/run.sh` 中的队列读取-修改-写入）、检查点索引（`autonomy/run.sh` 中的检查点索引更新）、追加 `events.jsonl`（`events/emit.sh` 和 `autonomy/run.sh` 中的事件发出路径）、人工干预信号文件（`autonomy/run.sh:check_human_intervention()`，根据状态机文档，位于约 8059 / 7897 行）。
- **MCP 路径验证** -- 传递给 `mcp/server.py` 工具的文件/路径参数会进行规范化；如果路径逃逸出项目根目录，则会被拒绝（v7.5.8 中的路径遍历修复）。
- **仪表板身份验证**现在是访问 `dashboard/server.py` 中 `/api/memory/*`、`/api/learning/*` 和 `/api/status` 的必要条件（此前这些读取路径无需身份验证）。
- 对 `autonomy/run.sh` 和 `autonomy/loki` 进行了全面的 **Bash 引号加固** -- 为命令替换和 `[ ]` 测试中的变量展开添加引号，以防止包含空格的路径发生分词。

有关各项修复的列表和审查者签署确认，请参阅 `CHANGELOG.md` 中的 [7.5.7]、[7.5.8]、[7.5.13] 条目。

---

## 已实现的功能

| 功能 | 添加版本 | 备注 |
|---------|-------|-------|
| 多提供商支持（4 个提供商） | v5.0.0 | claude、codex、cline、aider -- 参见 `providers/` |
| CONTINUITY.md 工作记忆 | v5.35.0 | 由 run.sh 自动管理，每次迭代时更新 |
| 质量门禁三审查者系统 | v5.35.0 | `skills/quality-gates.md` 中包含 5 名专业审查者；在 run.sh 中执行 |
| 记忆系统（情景/语义/程序性） | v5.15.0 | 完整实现在 `memory/` 中 |
| 上下文窗口跟踪 | v5.40.0 | 仪表板仪表，每个智能体的明细位于 `GET /api/context` |
| 通知触发器 | v5.40.0 | `GET/PUT /api/notifications/triggers` |
| GitHub 集成 | v5.42.2 | 导入、反向同步、创建 PR、导出。CLI：`loki github`，API：`/api/github/*` |
| 遗留系统修复 | v6.67.0 | `loki heal <path>` -- 将摩擦视为语义、特征测试 |
| 统一的 `loki start` | v6.84.0 | 自动检测输入是规范（PRD、OpenAPI 等）还是议题 |
| 托管智能体（记忆镜像） | v7.2.0 | 通过 `LOKI_MANAGED_AGENTS` 选择启用 -- 参见“托管智能体”部分 |
| Bun 运行时（第 1 阶段） | v7.3.0 | 只读命令通过 `bin/loki` 路由；设置 `LOKI_LEGACY_BASH=1` 可恢复原行为 |
| 第 1 阶段 RARV-C 闭环 | v7.5.x | 发现项注入、真实裁判、自动学习、handoff.md |
| Anthropic SDK 路由 | v8.0.0 | 选择启用，默认关闭；通过单一开关 `LOKI_SDK_MODE` 控制 -- 参见 `references/sdk-mode.md` |
| 执行框架智能化 | v8.0.0 | 提示缓存规范、置信度突增复查、目标评分、智能重试 |
| SDK 降级事件 | v8.0.0 | 在 `.loki/events.jsonl` 中记录结构化的 `capability_degraded` 记录 |
| 首次预览耗时 | v8.0.0 | `.loki/app-runner/first-preview.json`，仅写入一次（bash 路由） |
| 选择启用的构建分析 | v8.0.0 | `build_verified` 事件受严格的第二道门禁控制，仅允许白名单字段 |

## 计划中 / 进行中的功能

| 功能 | 目标版本 | 备注 |
|---------|--------|-------|
| Bun 运行时（第 2 阶段及以后） | 待定 | 迁移写入路径命令；在 `feat/bun-migration` 上跟踪 |
| 托管式智能体多智能体路径 | 待定 | `LOKI_EXPERIMENTAL_MANAGED_*` 标志——研究预览版，尚未在正式 API 中提供 |
| 基准测试（HumanEval、SWE-bench） | 待定 | `benchmarks/` 中已有运行脚本和数据集；尚未发布结果 |
| 移除 `loki run` | 下一个主要版本 | 目前是 `loki start` 的已弃用别名 |

## 已弃用

| 项目 | 弃用于 | 备注 |
|------|---------------|-------|
| `loki run <issue>` | v6.84.0 | `loki start` 的别名。将在下一个主要版本中移除。 |
| VSCode 扩展（`vscode-extension/`） | v7.2.0 | 已不再积极维护；仪表板 Web UI 是受支持的前端。 |

---

**v9.22.7 | [Autonomi](https://www.autonomi.dev/) 旗舰产品 | 核心代码约 410 行**