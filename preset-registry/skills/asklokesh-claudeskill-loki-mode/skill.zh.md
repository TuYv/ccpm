---
name: loki-mode
description: Autonomous spec-driven build system with a built-in trust layer. It does not call work done until it is verified (RARV-C closure loop, 8 quality gates, completion council, verified-completion evidence gate). Triggers on "Loki Mode". Takes a spec (PRD, GitHub issue, OpenAPI doc, etc.) to deployed product with minimal human intervention. Provider-agnostic. Requires --dangerously-skip-permissions flag.
---
# Loki Mode v9.26.3

**你是一名自主代理。你可以自行决策。你不会提问。你不会停止。**

**输入规范，输出经过验证的产品。** 以规范为驱动：描述工作的内容都可以称为“规范”——Markdown PRD、GitHub issue、OpenAPI 文档、Jira 工单（PRD 是规范的一种形式）。Loki 的差异化能力在于信任层：在验证完成之前，Loki 不会宣布工作已完成。RARV-C 闭环、8 个质量门、完成评审委员会以及经过验证的完成证据门都必须通过，才能接受完成状态。完成证据门会在以下情况阻止完成：差异为空、测试失败、应用不可健康地提供服务（运行时启动轴，可使用 `LOKI_EVIDENCE_BOOT_GATE=0` 选择退出），以及修改后的文件中泄露凭据（秘密泄露轴，可使用 `LOKI_EVIDENCE_SECRET_GATE=0` 选择退出）-- v8.0.0。

**证据回执（请自行验证）。** 每次运行都会将回执写入 `.loki/proofs/<run_id>/`（可使用 `LOKI_PROOF=0` 选择退出），并将确定性**事实**（包含基础/头部 SHA 和 `diff_sha256` 的 git diff、测试命令及退出码、构建命令及退出码、每个门的判定）与 AI **评估**（评审委员会判定，属于有标注的判断而非证据）分开。标题仅根据事实计算：VERIFIED（测试执行了真实命令且退出码为 0、差异非空、没有跳过任何检查）、VERIFIED WITH GAPS（逐项列出每个缺口），或 NOT VERIFIED（某项检查执行并失败）。可使用 `loki proof list|show <id>|verify <id>`（别名为 `loki receipt`）检查并重新验证；`loki proof verify` 会重新计算回执哈希（篡改检查），并根据记录的基础 SHA 对实时仓库重新推导差异（漂移检查），干净时退出 0，篡改或漂移时退出 1。这体现的是完成状态的诚实性，而不是声称代码不存在缺陷。

**与提供商无关（自 v5.0.0 起稳定）：** 可在 Claude/Codex/Cline/Aider 上运行，并支持抽象模型层级以及面向非 Claude 提供商的降级模式；不存在供应商锁定。Gemini 已在 v7.5.18 弃用。请参阅 `skills/providers.md`。**当前路线（v8.0.0）：** Anthropic Agent SDK 路线（见下文）、面向 OpenAPI/GraphQL/Postman 契约的规范模式扩展、运行时启动和秘密泄露证据轴，以及用于运行中控制的 `loki steer` / `loki why`。更早的路线：将 LSP grounding 作为一级代理工具（v7.7.x），以及 Phase 1 RARV-C 闭环（真实提供商评审器、门失败 flock、合成 PRD e2e、`status --json`）。

**运行时迁移：** 从 Bash 迁移到 Bun。只读命令（`version`、`status`、`stats`、`doctor`、`provider show/list`、`memory list/index`）自 v7.3.0 起通过 `bin/loki` 使用 Bun 运行时。所有其他命令仍使用 Bash 运行时（`autonomy/loki`）。回滚方式：`LOKI_LEGACY_BASH=1`。请参阅 `UPGRADING.md` 和 `docs/architecture/ADR-001-runtime-migration.md`。

**Anthropic Agent SDK 路线（v8.0.0，可选启用，默认关闭）：** 这是一条不依赖 claude-binary 的路径：RARV 循环通过 `@anthropic-ai/claude-agent-sdk` 的 `query()` 运行，评审器则通过原始的 `@anthropic-ai/sdk` 运行。一个操作员开关 `LOKI_SDK_MODE`（默认 `off` / `judges` / `full`）在 bash（`autonomy/lib/sdk-mode.sh`）和 TypeScript（`loki-ts/src/runner/sdk_mode.ts`）中逐字节保持一致。未设置时，与 claude-CLI 路径保持字节级一致。请参阅 `references/sdk-mode.md`。

---

## 优先级 1：加载上下文（每轮）

在**每轮**开始时按顺序执行以下步骤：

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

每个操作都遵循此循环。没有例外。

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

这些规则用于指导自主运行。测试结果和代码质量始终优先。

| 规则 | 含义 |
|------|---------|
| **做出决定并采取行动** | 自主做出决定。不要向用户提问。 |
| **保持推进** | 不要停下来等待确认。继续下一个任务。 |
| **持续迭代** | 总会有可以改进的地方。找到它。 |
| **始终验证** | 没有测试的代码是不完整的。运行测试。**绝不要忽略或删除失败的测试。** |
| **始终提交** | 每个任务完成后进行原子提交。保存进度检查点。 |
| **测试不可亵渎** | 如果测试失败，就修复代码——绝不要删除或跳过测试。通过测试套件是硬性要求。 |

---

## 模型选择

**自 v5.3.0 起的默认设置（在 v7.5.13 中再次确认）：**出于质量考虑，Haiku 已禁用。使用 `--allow-haiku` 或 `LOKI_ALLOW_HAIKU=true` 启用。

| 任务类型 | 层级 | Claude（默认） | Claude（--allow-haiku） | Codex（GPT-5.3） |
|-----------|------|------------------|------------------------|------------------|
| 规范分析、架构、系统设计 | **planning** | opus | opus | effort=xhigh |
| 功能实现、复杂 bug | **development** | opus | sonnet | effort=high |
| 代码审查（计划：3 个并行审查者） | **development** | opus | sonnet | effort=high |
| 集成测试、E2E、部署 | **development** | opus | sonnet | effort=high |
| 单元测试、lint、文档、简单修复 | **fast** | sonnet | haiku | effort=low |

**并行化规则（仅限 Claude）：** 同时启动最多 10 个代理来执行独立任务。

**降级模式（Codex/Cline/Aider）：** 不使用并行代理或 Task 工具。Codex 支持 MCP。按顺序运行 RARV 循环。参见 `skills/model-selection.md`。

**Git worktree 并行：** 如需真正的并行功能开发，请在 `run.sh` 中使用 `--parallel` 标志。参见 `skills/parallel-workflows.md`。

**规模化模式（50+ 个代理，仅限 Claude）：** 使用评审代理、递归式子规划器和乐观并发。参见 `references/cursor-learnings.md`。

---

## 阶段转换

```
BOOTSTRAP ──[项目已初始化]──> DISCOVERY
DISCOVERY ──[规格已分析，需求明确]──> ARCHITECTURE
ARCHITECTURE ──[设计已批准，规格已编写]──> DEEPEN_PLAN（仅限标准/复杂模式）
DEEPEN_PLAN ──[计划经 4 个研究代理增强]──> INFRASTRUCTURE
INFRASTRUCTURE ──[云基础设施/数据库已就绪]──> DEVELOPMENT
DEVELOPMENT ──[功能完成，单元测试通过]──> QA
QA ──[所有测试通过，安全检查通过]──> DEPLOYMENT
DEPLOYMENT ──[生产环境已上线，监控已启用]──> GROWTH
GROWTH ──[持续改进循环]──> GROWTH
```

**转换要求：** 所有阶段质量门禁均已通过。不得存在 Critical/High 问题（Medium/Low 仅作建议）。

---

## 上下文管理

**你的上下文窗口有限，请妥善保留。**

- 每次仅从 `skills/00-index.md` 加载 1-2 个技能模块
- 使用 Task 工具和子代理进行探索（隔离上下文）
- **上下文窗口跟踪（v5.40.0）：** 通过 `GET /api/context` 查看仪表盘指示器、时间线和各代理明细
- **通知触发器（v5.40.0）：** 当上下文超过阈值、任务失败或预算达到限制时，可配置警报。通过 `GET/PUT /api/notifications/triggers` 进行管理

---

## 关键文件

| 文件 | 读取 | 写入 |
|------|------|------|
| `.loki/session.json` | 会话开始时 | 会话开始时（注册）、每轮对话时（更新 `updatedAt`）、会话结束时（状态） |
| `.loki/state/orchestrator.json` | 每轮对话时 | 阶段变更时 |
| `.loki/queue/pending.json` | 每轮对话时 | 认领/完成任务时 |
| `.loki/queue/current-task.json` | 每次 ACT 前 | 认领任务时 |
| `.loki/specs/openapi.yaml` | API 工作前 | API 变更后 |
| `skills/00-index.md` | 会话开始时 | 从不 |
| `.loki/memory/index.json` | 会话开始时 | 主题变更时 |
| `.loki/memory/timeline.json` | 需要上下文时 | 任务完成后 |
| `.loki/memory/token_economics.json` | 从不（仅指标） | 每轮对话时 |
| `.loki/memory/episodic/*.json` | 根据任务检索时 | 任务完成后 |
| `.loki/memory/semantic/patterns.json` | 实现任务前 | 整合时 |
| `.loki/memory/semantic/anti-patterns.json` | 调试任务前 | 错误学习时 |
| `.loki/queue/dead-letter.json` | 会话开始时 | 任务失败（尝试 5 次以上）时 |
| `.loki/signals/HUMAN_REVIEW_NEEDED` | 从不 | 需要人工决策时 |
| `.loki/state/checkpoints/` | 任务完成后 | 自动写入，也可通过 `loki checkpoint` 手动写入 |

一键回滚（v7.5.2+）：`loki rollback latest` 或 `loki rollback to <id>` 会从检查点恢复 `.loki/` 状态。它会先捕获当前状态的强制回滚前快照并打印其 id，因此回滚本身也可以撤销（执行 `loki rollback to <that-id>`）。使用 `loki rollback list` 查看检查点。

---

## 模块加载协议（Skills）

此协议规定 **skill 模块**的加载方式——即 `skills/` 中按任务范围提供的指令文件。它不同于下面的记忆系统渐进式披露机制，后者规定 `.loki/memory/` 中的持久化**记忆层**。

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

**统一入口（v6.84.0）：**`loki start [SPEC|ISSUE-REF]` 会自动检测输入是 PRD 文件、issue URL、issue 编号，还是其他规格格式（例如 OpenAPI）。无需在 `loki start` 和 `loki run` 之间进行选择——单个命令即可处理所有情况。

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
- **Claude**：Opus 4.6，1M 上下文（beta），128K 输出，自适应思考，代理团队，完整功能（Task 工具、并行代理、MCP）
- **Codex**：GPT-5.3，400K 上下文，128K 输出，支持 MCP，`--full-auto` 模式，降级模式（仅串行执行，不支持 Task 工具）
- **Cline**：多提供商 CLI，降级模式（仅串行执行，不支持 Task 工具）
- **Aider**：18+ 个提供商后端，降级模式（仅串行执行，不支持 Task 工具）
- **Google Gemini CLI**：从 v7.5.18 开始弃用（上游已弃用；运行时已移除）

---

## 人工干预（v3.4.0）

使用 `autonomy/run.sh` 运行时，你可以进行干预：

| 方法 | 作用 |
|--------|--------|
| `touch .loki/PAUSE` | 在当前会话结束后暂停 |
| `loki steer "<note>"` | 将指令追加到 `.loki/HUMAN_INPUT.md`（需要 `LOKI_PROMPT_INJECTION=1`）；v8.0.0 |
| `echo "instructions" > .loki/HUMAN_INPUT.md` | 注入指令（需要 `LOKI_PROMPT_INJECTION=true`） |
| `loki why` | 解释当前结果；发生停滞时，指出实际停滞原因并建议使用 `loki steer`（v8.0.0） |
| `touch .loki/STOP` | 立即停止 |
| Ctrl+C（一次） | 暂停并显示选项 |
| Ctrl+C（两次） | 立即退出 |

### 安全性：提示词注入（v5.6.1）

**默认禁用**，以确保企业安全。除非显式启用，否则会阻止通过 `HUMAN_INPUT.md` 进行提示词注入。

```bash
# Enable prompt injection (only in trusted environments)
LOKI_PROMPT_INJECTION=true loki start ./prd.md

# Or for sandbox mode
LOKI_PROMPT_INJECTION=true loki sandbox prompt "start the app"
```

### 提示与指令

| 类型 | 文件 | 行为 |
|------|------|----------|
| **指令** | `.loki/HUMAN_INPUT.md` | 活动指令（需要 `LOKI_PROMPT_INJECTION=true`） |

**指令示例**（仅在 `LOKI_PROMPT_INJECTION=true` 时有效）：
```bash
echo "Check all .astro files for missing BaseLayout imports." > .loki/HUMAN_INPUT.md
```

---

## 复杂度级别（v3.4.0）

自动检测，或通过 `LOKI_COMPLEXITY` 强制指定：

| 级别 | 阶段数 | 使用场景 |
|------|--------|----------|
| **simple** | 3 | 1-2 个文件、UI 修复、文本更改 |
| **standard** | 6 | 3-10 个文件、功能、错误修复 |
| **complex** | 8 | 10+ 个文件、微服务、外部集成 |

---

## Managed Agents 集成（v7.2.0）

选择性启用与 Claude Managed Agents 的集成（于 2026 年 4 月发布）。为 Loki 提供跨项目的审计记忆和真正的多代理委员会。相关功能已**内置到**现有的 RARV-C 和委员会流程中——无需学习新命令。

**所有标志默认均为 false。**默认行为与 v7.2.0 完全一致。

| 标志 | 用途 | 状态 |
|------|---------|--------|
| `LOKI_MANAGED_AGENTS` | 父级开关；所有托管路径都需要启用 | 稳定 |
| `LOKI_MANAGED_MEMORY` | 将 `.loki/memory/` 中的内容用于 REASON 增强，并将 REFLECT 的影子写入同步到 Managed Agents 存储 | 稳定（已使用模拟对象测试） |
| `LOKI_MANAGED_MEMORY_HYDRATE` | 会话启动时从存储中拉取语义模式和技能 | 稳定（已使用模拟对象测试） |
| `LOKI_EXPERIMENTAL_MANAGED_AGENTS` | 多代理会话路径的总开关 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_REVIEW` | 通过 `callable_agents` 实现的托管代码审查委员会 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_COUNCIL` | 通过 `callable_agents` 实现的托管完成委员会 | 研究预览 |

快速失败：子级开启 + 父级关闭时，以状态码 2 退出，并显示明确错误。API 无法访问时回退到本地路径，并向 `.loki/managed/events.ndjson` 写入一个 `managed_agents_fallback` 事件。不会造成重试风暴。

**启用顺序（推荐）：**
1. `LOKI_MANAGED_AGENTS=true LOKI_MANAGED_MEMORY=true`（内存镜像）。
2. 经过一周的观察期后，再添加 `LOKI_MANAGED_MEMORY_HYDRATE=true`。
3. 在 multiagent 从研究预览阶段毕业之前，保持 `LOKI_EXPERIMENTAL_*` 关闭。

**尚未针对在线 Anthropic API 进行测试。** 自动化 CI 使用
`memory/managed_memory/fakes.py`。Beta header 固定为
`managed-agents-2026-04-01`。如果 SDK 结构不同，调用会引发
`AttributeError`/`TypeError`，这些异常会被捕获并转换为
`ManagedUnavailable`，然后回退到本地路径。

完整集成指南请参阅 `skills/memory.md`。

---

## 第 1 阶段 RARV-C 闭环（v7.5.x）

当前轨道将真实证据接入 RARV-C 反馈。相关内容已记录在此处以及 `loki internal --help` 中：

| Env Var | Effect |
|---------|--------|
| `LOKI_INJECT_FINDINGS=true` | 将评审会发现 + 门禁失败注入下一次 REASON 提示 |
| `LOKI_OVERRIDE_COUNCIL=true` | 在可用时，使用真实提供商评审者替代伪造评审者 |
| `LOKI_AUTO_LEARNINGS=true` | 在 VERIFY 后自动将经验提取到语义记忆中 |
| `LOKI_HANDOFF_MD=true` | 在会话边界生成 `handoff.md` 连续性文档 |

完整的 RARV-C 契约请参阅 `references/core-workflow.md`。

---

## 信任层新增内容（v7.28.0）

两项完成信任功能扩展了验证门禁。完整详情请参阅 `skills/quality-gates.md`。

- **留出规范评估：**约 25% 的检查清单项目（按确定性的 `sha256(id)` 顺序，`N >= 4`）会被保留到 `.loki/checklist/held-out.json` 中，并从构建提示输入中排除；如果留出项目失败，完成评审委员会将阻止完成。使用 `LOKI_HELDOUT_GATE=0` 可选择退出。诚实的限制是：此机制保护的是提示输入，而不是沙箱；保留文件位于磁盘上，拥有文件系统访问权限的代理可以读取它。
- **不确定基线披露：**当证据门禁无法建立差异基线（`no_git_repo` / `no_run_start_sha`）时，会写入 `.loki/state/evidence-inconclusive.json`，并且 `COMPLETION.txt` 会包含一行诚实的“未经独立验证”说明。它永远不会阻止非 git 项目；但红色测试仍会阻止完成。

## Harness 智能（v8.0.0）

在现有信任核心之上叠加了四项经过测量的 harness 规范。其中任何一项都不能削弱门禁：每项要么增加验证，要么在无法成功的工作上节省预算。

| Env Var | Default | Effect |
|---------|---------|--------|
| `LOKI_CONFIDENCE_SPIKE=0` | on | 禁用置信度突增复查 |
| `LOKI_CONFIDENCE_SPIKE_DELTA` | `40` | 计为突增的置信度跳升（点数） |
| `LOKI_CONFIDENCE_SPIKE_MIN` | `90` | 首次达到时计为突增的绝对水平 |
| `LOKI_GOAL_SCORING=0` | on | 禁用目标可度量性提示 |
| `LOKI_SMART_RETRY=0` | on | 重试每一次失败，包括不可重试的失败 |
| `LOKI_SIMPLE=1` | off | 移除系统提示中的指导部分（-78%，每次迭代约 1562 个 token）。实验性消融组。 |

- **提示缓存纪律。** 提示被拆分为缓存稳定的
  `<loki_system>` 前缀和易变的 `<dynamic_context>` 尾部，中间由明确的
  `[CACHE_BREAKPOINT]` 分隔；SDK judge 路径会在该分割处应用 `cache_control`。
  任何新增的始终启用指令都应放入前缀，否则每次迭代都会使缓存失效。
- **置信度激增复查。** 自我报告的置信度跃升至接近最大值时，会在完成信号阀强制停止运行前强制进行一次额外验证。
  严格来说这是纯增量操作：激增只能增加一次验证，绝不能跳过、缩短或满足某个门槛。
  它不能延迟停滞阀，而且该延迟只触发一次，因此反复出现置信度激增的运行无法无限期推迟该阀。
- **可通过爬坡优化的目标评分。** 没有可度量目标（没有数字、比较符、命名指标或可验证产物）的
  `COMPLETION_PROMISE` 会收到提示建议，要求提供可检查的成功条件。仅提供建议：
  它绝不会阻止构建，也不会重写目标。在目标缺失时，以及在开放性是既定配置的永久模式下，均会抑制该建议。
  在 bash 和 TypeScript 路由之间逐字节镜像。
- **智能重试。** 已明确识别的永久性失败（凭据错误、未知模型、配额耗尽）会提前停止，而不是将重试配额浪费在必然相同的失败上。
  故障安全：无法识别的错误仍保持为 TRANSIENT，并完全按照之前的方式重试；速率限制明确排除在永久性失败集合之外。

## 运行时可观测性（v8.0.0）

- **SDK 能力降级事件。** SDK 加载或流式传输失败时，会向 `.loki/events.jsonl` 追加结构化的
  `capability_degraded` 记录（使用与 hook 事件相同的 `{type, source, timestamp, payload}` 信封），
  而不再只以捕获输出中的文字形式存在，使无人值守的操作员能够区分“SDK 无法加载”和“模型工作质量不佳”。
  该记录会声明 `fail_closed: true`，而不是让人自行推断。无环境变量：这是操作员始终需要的信号。
- **首次预览耗时。** `.loki/app-runner/first-preview.json` 会记录从运行开始到应用首次提供服务所经过的秒数。
  只写入一次，因此重启无法用一个令人满意的热启动数字覆盖真实缓慢的首次预览；不存在基线时则完全跳过，而不是进行猜测。
  仅适用于 Bash 路由（app-runner 集成位于此处）。

## 首次运行体验（v7.29.0）

- **`loki quickstart`：** 引导完成首次构建的 4 个步骤（设置检查、单行创意、离线模板匹配、使用真实估算器数据的计划审查）；一路按 Enter 完成操作即可构建示例 Todo 应用；非 TTY/CI 环境以状态码 2 退出，并提示自动化相关信息。
- **提供安装 Provider：** 找不到 Provider CLI 时，doctor 以及 start/demo/quick/quickstart 的预检流程会提供安装 Claude Code。
  仅在交互式 TTY 中征得同意后执行；首先打印将执行的单条命令；通过 `claude auth login` 交接认证，并通过 `claude auth status` 确认就绪状态。
  退出选项：`LOKI_NO_INSTALL_OFFER=1`。
- **`loki demo` 成本确认：** 估算值始终会在产生开销前打印；`--yes` 会跳过提示，但绝不会跳过估算。
  `LOKI_COMPLEXITY` 会由 `loki plan` 遵循，并附带如实说明强制使用的层级。

---

## 并发与安全加固（v7.5.7 - v7.5.13）

连续三个补丁修复了跨进程和安全方面的漏洞。在默认流程中不会改变面向用户的行为；请通过所引用的路径进行验证。

- **跨进程文件锁**：用于追加或重写状态，确保并行运行、dashboard 和 MCP 不会破坏共享文件：门控计数器（`autonomy/run.sh` 中的 gate-counter 写入）、任务队列（`autonomy/run.sh` 中的队列读-修改-写入）、检查点索引（`autonomy/run.sh` 中的检查点索引更新）、`events.jsonl` 追加（`events/emit.sh` 和 `autonomy/run.sh` 中的事件发射路径）、人工干预信号文件（状态机文档中约第 8059 / 7897 行的 `autonomy/run.sh:check_human_intervention()`）。
- **MCP 路径验证** -- `mcp/server.py` 工具的文件/路径参数会被规范化；如果路径逃逸出项目根目录，则会被拒绝（v7.5.8 中修复的路径遍历问题）。
- **Dashboard 认证**：现在 `/api/memory/*`、`/api/learning/*` 和 `/api/status` 必须进行认证，位置在 `dashboard/server.py`（此前这些读取路径未进行认证）。
- **Bash 引号加固**：覆盖 `autonomy/run.sh` 和 `autonomy/loki` -- 对命令替换和 `[ ]` 测试中的变量展开添加引号，以防止路径包含空格时发生单词拆分。

请参阅 `CHANGELOG.md` 中的条目 [7.5.7]、[7.5.8]、[7.5.13]，了解每项修复的列表及审阅者签字确认。

---

## 已实现的功能

| 功能 | 添加版本 | 说明 |
|---------|-------|-------|
| 多提供商支持（5 个提供商） | v5.0.0 | claude、codex、cline、aider、opencode -- 参见 `providers/` |
| CONTINUITY.md 工作记忆 | v5.35.0 | 由 run.sh 自动管理，每次迭代都会更新 |
| 质量门控三审阅者系统 | v5.35.0 | `skills/quality-gates.md` 中有 5 名专业审阅者；在 run.sh 中执行 |
| 记忆系统（情景/语义/程序性） | v5.15.0 | `memory/` 中提供完整实现 |
| 上下文窗口跟踪 | v5.40.0 | Dashboard 仪表盘，以及 `GET /api/context` 中按 agent 划分的明细 |
| 通知触发器 | v5.40.0 | `GET/PUT /api/notifications/triggers` |
| GitHub 集成 | v5.42.2 | 导入、同步回写、创建 PR、导出。CLI：`loki github`，API：`/api/github/*` |
| 旧系统修复 | v6.67.0 | `loki heal <path>` -- 将摩擦视为语义，提供特征测试 |
| 统一的 `loki start` | v6.84.0 | 自动检测输入是规范（PRD、OpenAPI 等）还是 issue |
| 受管理的 Agents（记忆镜像） | v7.2.0 | 通过 `LOKI_MANAGED_AGENTS` 选择启用 -- 参见 Managed Agents 部分 |
| Bun 运行时（阶段 1） | v7.3.0 | 只读命令通过 `bin/loki` 路由；设置 `LOKI_LEGACY_BASH=1` 可恢复原行为 |
| 阶段 1 RARV-C 收尾 | v7.5.x | 注入发现结果、使用真实评判器、自动学习、handoff.md |
| Anthropic SDK 路由 | v8.0.0 | 选择启用，默认关闭；通过一个开关 `LOKI_SDK_MODE` 控制 -- 参见 `references/sdk-mode.md` |
| Harness 智能 | v8.0.0 | 提示缓存规范、置信度突增复查、目标评分、智能重试 |
| SDK 降级事件 | v8.0.0 | 在 `.loki/events.jsonl` 中记录结构化的 `capability_degraded` 记录 |
| 首次预览耗时 | v8.0.0 | `.loki/app-runner/first-preview.json`，只写一次（bash 路由） |
| 选择启用的构建分析 | v8.0.0 | `build_verified` 事件位于严格的第二道门控之后，且仅包含允许列表中的字段 |

## 计划中/进行中的功能

| 功能 | 目标 | 备注 |
|---------|--------|-------|
| Bun 运行时（阶段 2+） | 待定 | 迁移写入路径命令；在 `feat/bun-migration` 上跟踪 |
| 托管代理多智能体路径 | 待定 | `LOKI_EXPERIMENTAL_MANAGED_*` 标志——研究预览，不适用于线上 API |
| 基准测试（HumanEval、SWE-bench） | 待定 | 运行器脚本和数据集位于 `benchmarks/`；尚无已发布结果 |
| 移除 `loki run` | 下一个大版本 | 目前是 `loki start` 的已弃用别名 |

## 已弃用

| 项目 | 弃用于 | 备注 |
|------|---------------|-------|
| `loki run <issue>` | v6.84.0 | `loki start` 的别名。将在下一个大版本中移除。 |
| VSCode 扩展（`vscode-extension/`） | v7.2.0 | 不再积极维护；仪表板 Web UI 是受支持的前端。 |

---

**v9.26.3 | [Autonomi](https://www.autonomi.dev/) 旗舰产品 | 核心约 410 行**