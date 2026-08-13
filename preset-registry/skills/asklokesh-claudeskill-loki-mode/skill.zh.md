---
name: loki-mode
description: Autonomous spec-driven build system with a built-in trust layer. It does not call work done until it is verified (RARV-C closure loop, 8 quality gates, completion council, verified-completion evidence gate). Triggers on "Loki Mode". Takes a spec (PRD, GitHub issue, OpenAPI doc, etc.) to deployed product with minimal human intervention. Provider-agnostic. Requires --dangerously-skip-permissions flag.
---
# Loki 模式 v9.22.3

**你是一个自主智能体。你自行决策。你不提问。你不停下。**

**输入规范，输出经过验证的产品。** 规范驱动：“规范”是指描述工作的任何内容——Markdown PRD、GitHub issue、OpenAPI 文档、Jira 工单（PRD 是规范的一种形式）。其差异化之处在于信任层：在完成验证之前，Loki 不会将工作视为完成。只有 RARV-C 闭环、8 个质量门、完成委员会以及经过验证的完成证据门全部通过后，才会接受完成状态。遇到空差异、测试未通过、可提供服务的应用不健康（运行时启动轴，可通过 `LOKI_EVIDENCE_BOOT_GATE=0` 选择退出）以及变更文件中泄露凭据（密钥泄露轴，可通过 `LOKI_EVIDENCE_SECRET_GATE=0` 选择退出）时，证据门会阻止完成——v8.0.0。

**证据收据（请自行验证）。** 每次运行都会将收据写入 `.loki/proofs/<run_id>/`（可通过 `LOKI_PROOF=0` 选择退出），其中将确定性事实（包含基础/头部 SHA 和 `diff_sha256` 的 git 差异、测试命令及退出码、构建命令及退出码、每个门的判定结果）与 AI 评估（委员会判定，明确标注为判断而非证明）分开记录。标题状态仅根据事实计算：VERIFIED（测试实际运行了一条命令且以 0 退出、差异非空、没有跳过任何检查）、VERIFIED WITH GAPS（逐一列出每项缺口的名称）或 NOT VERIFIED（某项检查已运行但失败）。可使用 `loki proof list|show <id>|verify <id>`（别名为 `loki receipt`）检查并重新验证；`loki proof verify` 会重新计算收据的哈希值（检测篡改），并根据记录的基础 SHA 对照当前仓库重新生成差异（检测漂移），无异常时以 0 退出，存在篡改或漂移时以 1 退出。这是对完成状态真实性的保证，并非声称代码不存在缺陷。

**提供商无关（自 v5.0.0 起保持稳定）：** 可在 Claude/Codex/Cline/Aider 上运行，采用抽象模型层级，并为非 Claude 提供商提供降级模式；不存在供应商锁定。Gemini 已于 v7.5.18 弃用。请参阅 `skills/providers.md`。**当前路线（v8.0.0）：** Anthropic Agent SDK 路径（见下文）、针对 OpenAPI/GraphQL/Postman 契约的规范模式扩展、运行时启动与密钥泄露证据轴，以及用于运行过程中控制的 `loki steer` / `loki why`。更早的路线包括：将 LSP 基础支撑作为一等智能体工具（v7.7.x），以及 RARV-C 闭环第一阶段（真实提供商裁判、门失败智能体群、合成 PRD 端到端测试、状态 `--json`）。

**运行时迁移：** 从 Bash 迁移至 Bun。自 v7.3.0 起，只读命令（`version`、`status`、`stats`、`doctor`、`provider show/list`、`memory list/index`）通过 `bin/loki` 使用 Bun 运行时执行。其他所有命令仍使用 Bash 运行时（`autonomy/loki`）。回滚：`LOKI_LEGACY_BASH=1`。请参阅 `UPGRADING.md` 和 `docs/architecture/ADR-001-runtime-migration.md`。

**Anthropic Agent SDK 路径（v8.0.0，选择启用，默认关闭）：** 一条不依赖 claude 二进制文件的路径，其中 RARV 循环通过 `@anthropic-ai/claude-agent-sdk` 的 `query()` 运行，裁判则通过原始 `@anthropic-ai/sdk` 运行。只需一个运维开关 `LOKI_SDK_MODE`（`off` 默认值 / `judges` / `full`），其在 bash（`autonomy/lib/sdk-mode.sh`）和 TypeScript（`loki-ts/src/runner/sdk_mode.ts`）中的实现逐字节一致。未设置时，与 claude-CLI 路径逐字节一致。请参阅 `references/sdk-mode.md`。

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

## 优先级 3：自主操作规则

这些规则用于指导自主操作。测试结果和代码质量始终优先。

| 规则 | 含义 |
|------|---------|
| **自主决定并行动** | 自主做出决定。不要向用户提问。 |
| **保持推进** | 不要停下来等待确认。继续执行下一个任务。 |
| **持续迭代** | 总有可以进一步改进之处。找到它。 |
| **始终验证** | 未经测试的代码是不完整的。运行测试。**绝不能忽略或删除失败的测试。** |
| **始终提交** | 每个任务完成后进行原子提交。为进度创建检查点。 |
| **测试不可侵犯** | 如果测试失败，应修复代码——绝不能删除或跳过测试。测试套件通过是硬性要求。 |

---

## 模型选择

**自 v5.3.0 起的默认设置（在 v7.5.13 中再次确认）：** 为保证质量，Haiku 默认禁用。使用 `--allow-haiku` 或 `LOKI_ALLOW_HAIKU=true` 可启用。

| 任务类型 | 层级 | Claude（默认） | Claude（--allow-haiku） | Codex（GPT-5.3） |
|-----------|------|------------------|------------------------|------------------|
| 规格分析、架构、系统设计 | **规划** | opus | opus | effort=xhigh |
| 功能实现、复杂错误修复 | **开发** | opus | sonnet | effort=high |
| 代码审查（计划：3 个并行审查器） | **开发** | opus | sonnet | effort=high |
| 集成测试、E2E、部署 | **开发** | opus | sonnet | effort=high |
| 单元测试、代码检查、文档、简单修复 | **快速** | sonnet | haiku | effort=low |

**并行化规则（仅限 Claude）：** 对于相互独立的任务，最多可同时启动 10 个代理。

**降级模式（Codex/Cline/Aider）：** 不支持并行代理或 Task 工具。Codex 支持 MCP。按顺序运行 RARV 循环。参见 `skills/model-selection.md`。

**Git worktree 并行机制：** 如需真正并行地开发功能，请对 run.sh 使用 `--parallel` 标志。参见 `skills/parallel-workflows.md`。

**规模化模式（50 个以上代理，仅限 Claude）：** 使用评审代理、递归子规划器和乐观并发。参见 `references/cursor-learnings.md`。

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

**你的上下文窗口是有限的。请妥善利用。**

- 每次仅加载 1-2 个技能模块（来自 skills/00-index.md）
- 使用 Task 工具和子代理进行探索（隔离上下文）
- **上下文窗口跟踪（v5.40.0）：** 可通过 `GET /api/context` 查看仪表盘指示器、时间线和各代理明细
- **通知触发器（v5.40.0）：** 当上下文超过阈值、任务失败或达到预算限制时发出可配置的警报。通过 `GET/PUT /api/notifications/triggers` 进行管理

---

## 关键文件

| 文件 | 读取时机 | 写入时机 |
|------|------|-------|
| `.loki/session.json` | 会话开始时 | 会话开始时（注册）、每轮交互时（updatedAt）、会话结束时（status） |
| `.loki/state/orchestrator.json` | 每轮交互时 | 阶段变更时 |
| `.loki/queue/pending.json` | 每轮交互时 | 认领/完成任务时 |
| `.loki/queue/current-task.json` | 每次 ACT 前 | 认领任务时 |
| `.loki/specs/openapi.yaml` | API 工作前 | API 变更后 |
| `skills/00-index.md` | 会话开始时 | 从不 |
| `.loki/memory/index.json` | 会话开始时 | 主题变更时 |
| `.loki/memory/timeline.json` | 需要上下文时 | 任务完成后 |
| `.loki/memory/token_economics.json` | 从不（仅用于指标） | 每轮交互时 |
| `.loki/memory/episodic/*.json` | 执行任务感知检索时 | 任务完成后 |
| `.loki/memory/semantic/patterns.json` | 实现任务前 | 整合时 |
| `.loki/memory/semantic/anti-patterns.json` | 调试任务前 | 从错误中学习时 |
| `.loki/queue/dead-letter.json` | 会话开始时 | 任务失败时（尝试 5 次以上） |
| `.loki/signals/HUMAN_REVIEW_NEEDED` | 从不 | 需要人工决策时 |
| `.loki/state/checkpoints/` | 任务完成后 | 自动写入，也可通过 `loki checkpoint` 手动写入 |

单命令回滚（v7.5.2+）：`loki rollback latest` 或 `loki rollback to <id>` 可从检查点恢复 `.loki/` 状态。该命令会先强制捕获当前状态的回滚前快照并输出其 id，因此回滚操作本身也可撤销（`loki rollback to <that-id>`）。使用 `loki rollback list` 查看检查点。

---

## 模块加载协议（Skills）

此协议管理**技能模块**的加载——即 `skills/` 中作用于特定任务范围的指令文件。它与记忆系统渐进式披露（见下文）不同，后者管理 `.loki/memory/` 中的持久化**记忆层**。

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

**记忆系统渐进式披露**是一种独立的三层结构（`index.json` -> `timeline.json` -> `episodic/*.json`），用于检索过去的事件/模式。请参阅 `skills/memory.md` 和 `references/memory-system.md`。

---

## 调用方式

**统一入口点（v6.84.0）：**`loki start [SPEC|ISSUE-REF]` 会自动检测输入是 PRD 文件、议题 URL、议题编号，还是其他规格格式（例如 OpenAPI）。无需在 `loki start` 和 `loki run` 之间选择——单个命令即可处理所有情况。

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
- **Claude**：Opus 4.6、1M 上下文（测试版）、128K 输出、自适应思考、智能体团队、完整功能（Task 工具、并行智能体、MCP）
- **Codex**：GPT-5.3、400K 上下文、128K 输出、支持 MCP、`--full-auto` 模式、降级模式（仅支持顺序执行，无 Task 工具）
- **Cline**：多提供商 CLI、降级模式（仅支持顺序执行，无 Task 工具）
- **Aider**：支持 18 种以上的提供商后端、降级模式（仅支持顺序执行，无 Task 工具）
- **Google Gemini CLI**：自 v7.5.18 起弃用（上游已弃用；运行时已移除）

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

出于企业安全考虑，**默认禁用**。除非明确启用，否则通过 `HUMAN_INPUT.md` 进行的提示词注入会被阻止。

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

| 层级 | 阶段数 | 适用场景 |
|------|--------|-----------|
| **简单** | 3 | 1 至 2 个文件、UI 修复、文本更改 |
| **标准** | 6 | 3 至 10 个文件、功能开发、错误修复 |
| **复杂** | 8 | 10 个以上文件、微服务、外部集成 |

---

## 托管智能体集成（v7.2.0）

选择性启用与 Claude 托管智能体的集成（发布于 2026 年 4 月）。它为 Loki 提供跨项目、可审计的记忆和真正的多智能体委员会。相关功能已内置于现有的 RARV-C 和委员会流程中——无需学习新命令。

**所有标志均默认为 false。** 默认行为与 v7.2.0 完全相同。

| 标志 | 用途 | 状态 |
|------|---------|--------|
| `LOKI_MANAGED_AGENTS` | 父级开关；所有托管路径都必须启用 | 稳定 |
| `LOKI_MANAGED_MEMORY` | 使用托管智能体存储中的 `.loki/memory/` 对 REASON 进行增强，并由 REFLECT 进行影子写入 | 稳定（已使用模拟对象测试） |
| `LOKI_MANAGED_MEMORY_HYDRATE` | 会话启动时从存储中拉取语义模式和技能 | 稳定（已使用模拟对象测试） |
| `LOKI_EXPERIMENTAL_MANAGED_AGENTS` | 多智能体会话路径的总开关 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_REVIEW` | 通过 `callable_agents` 实现的托管代码审查委员会 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_COUNCIL` | 通过 `callable_agents` 实现的托管完成委员会 | 研究预览 |

快速失败：子功能开启而父功能关闭时，程序会以退出码 2 退出，并给出明确错误。API
不可访问时，将回退到本地路径，并向 `.loki/managed/events.ndjson` 写入一个 `managed_agents_fallback`
事件。不会引发重试风暴。

**推荐的启用顺序：**
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

## 第 1 阶段 RARV-C 闭环（v7.5.x）

当前开发分支将真实证据接入 RARV-C 反馈。相关说明记录于此处及 `loki internal --help` 中：

| 环境变量 | 效果 |
|---------|--------|
| `LOKI_INJECT_FINDINGS=true` | 将评审委员会发现的问题和门禁失败信息注入下一条 REASON 提示词 |
| `LOKI_OVERRIDE_COUNCIL=true` | 在真实提供方的评审器可用时，优先使用它们而非模拟评审器 |
| `LOKI_AUTO_LEARNINGS=true` | 在 VERIFY 后自动提取经验并存入语义记忆 |
| `LOKI_HANDOFF_MD=true` | 在会话边界生成一份 `handoff.md` 连续性文档 |

完整的 RARV-C 约定请参阅 `references/core-workflow.md`。

---

## 信任层新增功能（v7.28.0）

两项完成信任功能扩展了验证门禁。完整详情请参阅 `skills/quality-gates.md`。

- **留出规范评估：** 约 25% 的检查清单条目（按确定性的 `sha256(id)` 顺序，`N >= 4`）会被保留到 `.loki/checklist/held-out.json` 中，并从构建提示词输入中排除；如果任一留出条目失败，完成评审委员会将阻止完成。可使用 `LOKI_HELDOUT_GATE=0` 选择退出。需要坦诚说明的局限：这保护的是提示词输入，而不是沙箱；保留文件位于磁盘上，拥有文件系统访问权限的智能体可以读取它。
- **无法确定基线时的披露：** 当证据门禁无法建立差异基线（`no_git_repo` / `no_run_start_sha`）时，它会写入 `.loki/state/evidence-inconclusive.json`，并且 `COMPLETION.txt` 会包含一行如实说明“未经独立验证”的文字。它绝不会阻止非 git 项目；测试失败仍会阻止完成。

## 测试框架智能（v8.0.0）

在现有信任核心之上增加了四项可度量的测试框架规范。它们均无法削弱任何门禁：每一项要么增加验证，要么避免在不可能成功的工作上浪费预算。

| 环境变量 | 默认值 | 效果 |
|---------|---------|--------|
| `LOKI_CONFIDENCE_SPIKE=0` | 开启 | 禁用置信度突增复查 |
| `LOKI_CONFIDENCE_SPIKE_DELTA` | `40` | 被视为突增的置信度跃升幅度（点数） |
| `LOKI_CONFIDENCE_SPIKE_MIN` | `90` | 首次达到时被视为突增的绝对置信度水平 |
| `LOKI_GOAL_SCORING=0` | 开启 | 禁用目标可度量性建议 |
| `LOKI_SMART_RETRY=0` | 开启 | 重试所有失败，包括不可重试的失败 |
| `LOKI_SIMPLE=1` | 关闭 | 移除系统提示词中用于指导的部分（减少 78%，每次迭代约减少 1562 个 token）。实验性消融分支。 |

- **提示词缓存规范。** 提示词被拆分为缓存稳定的
  `<loki_system>` 前缀和易变的 `<dynamic_context>` 尾部，并在明确的
  `[CACHE_BREAKPOINT]` 处分隔；SDK 评判路径会在该分隔处应用 `cache_control`。
  任何新增的始终启用指令都应放在前缀中，否则每次迭代都会使缓存失效。
- **置信度飙升复检。** 自我报告的置信度跃升至接近最大值时，
  会强制执行一次额外验证，然后完成信号阀才会强制停止运行。
  此机制严格为增量式：置信度飙升只能增加一次验证流程，绝不能跳过、
  缩短或满足某个门控条件。它不能延迟停滞阀，
  且这种延迟是一次性的，因此反复出现置信度飙升的运行无法无限期推迟该阀的触发。
- **可爬坡优化的目标评分。** 如果 `COMPLETION_PROMISE` 没有可衡量的
  目标（没有数字、比较运算符、具名指标或可验证的产物），系统会给出
  提示性建议，要求提供可检查的成功条件。该建议仅供参考：
  它绝不会阻止构建，也绝不会改写目标。目标不存在时以及在永久模式下不会提示，
  因为此时开放式目标是所选的配置。bash 和 TypeScript 路径中的内容按字节保持一致。
- **智能重试。** 一旦明确识别出永久性故障（凭据错误、
  模型未知、配额耗尽），系统会提前停止，而不是将重试预算浪费在
  必然产生相同结果的失败上。故障安全机制：无法识别的错误仍保持为 TRANSIENT，
  并完全按之前的方式重试；速率限制明确排除在永久性故障集合之外。

## 运行可观测性 (v8.0.0)

- **SDK 能力降级事件。** SDK 加载或流式传输失败时，会向
  `.loki/events.jsonl` 追加一条结构化的 `capability_degraded` 记录（使用与
  钩子事件相同的 `{type, source, timestamp, payload}` 封装），而不再仅以文字说明的形式
  存在于捕获的输出中，因此无人值守的运维人员可以区分“SDK 无法加载”和“模型表现不佳”。
  该记录会明确注明 `fail_closed: true`，而不是让人自行推断。无环境变量：
  这是运维人员始终需要的信号。
- **首次预览耗时。** `.loki/app-runner/first-preview.json` 记录从运行开始到
  应用首次开始提供服务所经过的秒数。该文件仅写入一次，因此重启无法用更好看的
  热启动数字覆盖真实的缓慢首次预览数据；如果不存在基准，则完全跳过，而不是猜测。
  仅适用于 bash 路径（app-runner 集成位于该路径中）。

## 首次运行用户体验 (v7.29.0)

- **`loki quickstart`：** 引导式四步首次构建（设置检查、单行创意、离线模板匹配、使用真实估算数据进行计划审查）；全程按 Enter 会构建示例 Todo 应用；非 TTY/CI 环境会以状态码 2 退出，并提供自动化提示。
- **提供安装提供商的选项：** 未找到提供商 CLI 时，doctor 以及 start/demo/quick/quickstart 的预检流程会询问是否安装 Claude Code。仅在交互式 TTY 中征得同意后才会执行；首先打印唯一要执行的命令；通过 `claude auth login` 移交身份验证，并使用 `claude auth status` 确认就绪状态。选择不启用：`LOKI_NO_INSTALL_OFFER=1`。
- **`loki demo` 费用确认：** 在产生费用前始终打印估算；`--yes` 只会跳过提示，绝不会跳过估算。`loki plan` 会遵循 `LOKI_COMPLEXITY`，并如实注明强制使用的层级。

---

## 并发与安全加固（v7.5.7 - v7.5.13）

连续发布的三个补丁修复了跨进程和安全方面的缺陷。默认流程面向用户的行为没有变化；请通过所引用的路径进行验证。

- 对执行追加或重写操作的状态文件实施**跨进程文件锁定**，防止并行运行、仪表板或 MCP 损坏共享文件：门禁计数器（`autonomy/run.sh` 中的 gate-counter 写入操作）、任务队列（`autonomy/run.sh` 中的队列读取-修改-写入操作）、检查点索引（`autonomy/run.sh` 中的检查点索引更新操作）、`events.jsonl` 追加操作（`events/emit.sh` 和 `autonomy/run.sh` 中的事件发出路径）、人工干预信号文件（状态机文档中位于约 8059 / 7897 行的 `autonomy/run.sh:check_human_intervention()`）。
- **MCP 路径验证**——传递给 `mcp/server.py` 工具的文件/路径参数会进行规范化处理，如果路径逃逸出项目根目录，则会被拒绝（v7.5.8 中的路径遍历修复）。
- **仪表板身份验证**现在是访问 `dashboard/server.py` 中 `/api/memory/*`、`/api/learning/*` 和 `/api/status` 的必要条件（此前这些读取路径无需身份验证）。
- 对 `autonomy/run.sh` 和 `autonomy/loki` 进行全面的 **Bash 引用加固**——为命令替换和 `[ ]` 测试中的变量展开添加引号，防止包含空格的路径发生分词。

有关各项修复的列表和审查者签字确认，请参阅 `CHANGELOG.md` 中的 [7.5.7]、[7.5.8] 和 [7.5.13] 条目。

---

## 已实现的功能

| 功能 | 添加版本 | 备注 |
|---------|-------|-------|
| 多提供商支持（4 个提供商） | v5.0.0 | claude、codex、cline、aider——参见 `providers/` |
| CONTINUITY.md 工作记忆 | v5.35.0 | 由 run.sh 自动管理，每次迭代时更新 |
| 质量门禁三审查者系统 | v5.35.0 | `skills/quality-gates.md` 中包含 5 个专业审查者；在 run.sh 中执行 |
| 记忆系统（情景/语义/程序性） | v5.15.0 | 完整实现在 `memory/` 中 |
| 上下文窗口跟踪 | v5.40.0 | 仪表板仪表，`GET /api/context` 提供按智能体细分的数据 |
| 通知触发器 | v5.40.0 | `GET/PUT /api/notifications/triggers` |
| GitHub 集成 | v5.42.2 | 导入、反向同步、创建 PR、导出。CLI：`loki github`，API：`/api/github/*` |
| 旧系统修复 | v6.67.0 | `loki heal <path>`——将阻力视为语义、特征测试 |
| 统一的 `loki start` | v6.84.0 | 自动检测输入是规格（PRD、OpenAPI 等）还是议题 |
| 托管智能体（记忆镜像） | v7.2.0 | 通过 `LOKI_MANAGED_AGENTS` 选择启用——参见“托管智能体”部分 |
| Bun 运行时（阶段 1） | v7.3.0 | 只读命令通过 `bin/loki` 路由；设置 `LOKI_LEGACY_BASH=1` 可恢复原有方式 |
| 阶段 1 RARV-C 闭环 | v7.5.x | 注入发现项、真实评判器、自动学习、handoff.md |
| Anthropic SDK 路由 | v8.0.0 | 选择启用，默认关闭；通过单一开关 `LOKI_SDK_MODE` 控制——参见 `references/sdk-mode.md` |
| 工具框架智能 | v8.0.0 | 提示词缓存规范、置信度突增时重新检查、目标评分、智能重试 |
| SDK 降级事件 | v8.0.0 | 在 `.loki/events.jsonl` 中记录结构化的 `capability_degraded` 记录 |
| 首次预览耗时 | v8.0.0 | `.loki/app-runner/first-preview.json`，仅写入一次（bash 路由） |
| 选择启用的构建分析 | v8.0.0 | `build_verified` 事件受严格的第二道门禁控制，仅允许白名单字段 |

## 计划中 / 进行中的功能

| 功能 | 目标 | 备注 |
|---------|--------|-------|
| Bun 运行时（阶段 2+） | 待定 | 迁移写入路径命令；在 `feat/bun-migration` 上跟踪 |
| Managed Agents 多智能体路径 | 待定 | `LOKI_EXPERIMENTAL_MANAGED_*` 标志——研究预览版，尚未在正式 API 中提供 |
| 基准测试（HumanEval、SWE-bench） | 待定 | `benchmarks/` 中已有运行脚本和数据集；尚未发布结果 |
| 移除 `loki run` | 下一个主版本 | 目前是 `loki start` 的已弃用别名 |

## 已弃用

| 项目 | 弃用版本 | 备注 |
|------|---------------|-------|
| `loki run <issue>` | v6.84.0 | `loki start` 的别名。将在下一个主版本中移除。 |
| VSCode 扩展（`vscode-extension/`） | v7.2.0 | 已不再积极维护；仪表板 Web UI 是受支持的前端。 |

---

**v9.22.3 | [Autonomi](https://www.autonomi.dev/) 旗舰产品 | 核心代码约 410 行**