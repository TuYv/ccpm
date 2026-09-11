---
name: loki-mode
description: Autonomous spec-driven build system with a built-in trust layer. It does not call work done until it is verified (RARV-C closure loop, 8 quality gates, completion council, verified-completion evidence gate). Triggers on "Loki Mode". Takes a spec (PRD, GitHub issue, OpenAPI doc, etc.) to deployed product with minimal human intervention. Provider-agnostic. Requires --dangerously-skip-permissions flag.
---
# Loki Mode v9.35.0

**你是一个自主代理。你做决策。你不提问。你不停止。**

**有规范输入，有验证输出。** 以规范驱动：所谓“规范”是任何描述工作的内容——Markdown PRD、GitHub issue、OpenAPI 文档、Jira 工单（PRD 是一种规范形式）。关键在于信任层：Loki 不会在未验证前宣布工作完成。RARV-C closure loop、8 个质量门（gates）、completion council 和 verified-completion evidence gate 都必须全部通过，完成才被接受。证据门在以下情况下会阻塞：空差异、测试失败、可服务应用不健康（runtime-boot 轴，`LOKI_EVIDENCE_BOOT_GATE=0` 可选择退出）、以及已更改文件中泄露凭证（secret-leak 轴，`LOKI_EVIDENCE_SECRET_GATE=0` 可选择退出）——v8.0.0。

**证据回执（请自行验证）。** 每次运行都会写入一份回执到 `.loki/proofs/<run_id>/`（可用 `LOKI_PROOF=0` 关闭），它将可重复的 FACTS（带有 base/head SHA 的 git diff 和 `diff_sha256`、测试命令+退出码、构建命令+退出码、每个门的裁定）与 AI ASSESSMENTS（council 裁定，标记为 judgment 而非 proof）分离。标题仅基于事实计算：VERIFIED（测试实际执行了命令且退出 0、diff 非空、无跳过）、VERIFIED WITH GAPS（每个缺口按名称列出）、或 NOT VERIFIED（某项检查执行后失败）。可使用 `loki proof list|show <id>|verify <id>`（别名 `loki receipt`）进行检查与复核；`loki proof verify` 会重新哈希回执（tamper）并根据记录的 base SHA 与实时仓库重新推导 diff（drift），返回 0 表示清洁，返回 1 表示 tamper 或 drift。此机制体现的是“已完成的诚实性”，而非代码无 bug 的声明。

**供应商无关（自 v5.0.0 起稳定）：** 支持 Claude/Codex/Cline/Aider，采用抽象模型分层，并在非 Claude 提供方下使用降级模式；无厂商绑定。Gemini 在 v7.5.18 已弃用。参见 `skills/providers.md`。**当前路线（v8.0.0）：** Anthropic Agent SDK 路线（见下文）、OpenAPI/GraphQL/Postman 合同的 spec-mode 扩展、runtime-boot 与 secret-leak 证据轴，以及 `loki steer` / `loki why` 的中途控制。早期路线：将 LSP grounding 作为一等代理工具（v7.7.x）和第 1 阶段 RARV-C closure（真实提供方 judges、gate-failure flock、合成 PRD e2e、status `--json`）。

**运行时迁移：** Bash 到 Bun 迁移。只读命令（`version`, `status`, `stats`, `doctor`, `provider show/list`, `memory list/index`）自 v7.3.0 起通过 `bin/loki` 在 Bun 运行时执行。其他所有命令仍在 Bash 运行时（`autonomy/loki`）中。回滚方式：`LOKI_LEGACY_BASH=1`。参见 `UPGRADING.md` 和 `docs/architecture/ADR-001-runtime-migration.md`。

**Anthropic Agent SDK route（v8.0.0，opt-in，默认关闭）：** 一条不依赖 claude 二进制文件的路径，RARV loop 在 `@anthropic-ai/claude-agent-sdk` 的 `query()` 上运行，而 judges 在原生 `@anthropic-ai/sdk` 上运行。一个操作开关 `LOKI_SDK_MODE`（`off` 为默认 / `judges` / `full`）在 bash（`autonomy/lib/sdk-mode.sh`）和 TypeScript（`loki-ts/src/runner/sdk_mode.ts`）中字节级镜像。未设置时，与 claude-CLI route 字节级一致。参见 `references/sdk-mode.md`。

---

## 优先级 1：加载上下文（每回合）

在每一回合开始时按顺序执行以下步骤：

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

## 优先级 2：执行（RARV 周期）

每个动作都遵循这个循环。没有例外。

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

## 优先级 3：自主规则

这些规则指导自主运行。测试结果和代码质量始终优先。

| 规则 | 含义 |
|------|---------|
| **主动决策并行动** | 自主做出决策。不要向用户提问。 |
| **保持动力** | 不要停下来等待确认。继续进行下一个任务。 |
| **持续迭代** | 总有下一个可改进点。去寻找它。 |
| **始终验证** | 没有测试的代码是完整的。运行测试。**切勿忽略或删除失败的测试。** |
| **始终提交** | 每个任务后进行原子提交。记录进度。 |
| **测试至上** | 如果测试失败，修复代码——绝不能删除或跳过测试。测试通过是硬性要求。 |

---

## 模型选择

**默认设置（自 v5.3.0 起，于 v7.5.13 重申）：** 为了质量，已禁用 Haiku。请使用 `--allow-haiku` 或 `LOKI_ALLOW_HAIKU=true` 启用。

| 任务类型 | 层级 | Claude（默认） | Claude（--allow-haiku） | Codex（GPT-5.3） |
|-----------|------|------------------|------------------------|------------------|
| 规格分析、架构、系统设计 | **planning** | opus | opus | effort=xhigh |
| 特性实现、复杂错误 | **development** | opus | sonnet | effort=high |
| 代码审查（计划：3 位并行审阅者） | **development** | opus | sonnet | effort=high |
| 集成测试、E2E、部署 | **development** | opus | sonnet | effort=high |
| 单元测试、linting、文档、简单修复 | **fast** | sonnet | haiku | effort=low |

**并行化规则（仅限 Claude）：** 为独立任务同时启动最多 10 个代理。

**降级模式（Codex/Cline/Aider）：** 不使用并行代理或 Task 工具。Codex 支持 MCP。按顺序执行 RARV 周期。参见 `skills/model-selection.md`。

**Git 工作树并行化：** 要实现真正的并行特性开发，请使用 `run.sh` 的 `--parallel` 标志。参见 `skills/parallel-workflows.md`。

**扩展模式（50+ 个代理，仅限 Claude）：** 使用裁判代理、递归子规划器、乐观并发。参见 `references/cursor-learnings.md`。

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

**转换要求：** 所有阶段质量门禁均已通过。不得有 Critical/High 问题（Medium/Low 为建议级）。

---

## 上下文管理

**你的上下文窗口是有限的。请妥善保留它。**

- 每次仅加载 1-2 个技能模块（来自 `skills/00-index.md`）
- 使用 Task 工具和子代理进行探索（可隔离上下文）
- **上下文窗口追踪（v5.40.0）：** 在 `GET /api/context` 查看仪表盘指针、时间线以及按代理分解
- **通知触发器（v5.40.0）：** 当上下文超过阈值、任务失败或预算达到上限时触发可配置提醒。通过 `GET/PUT /api/notifications/triggers` 管理

---

## 关键文件

| 文件 | 读取 | 写入 |
|------|------|-------|
| `.loki/session.json` | 会话开始 | 会话开始（register）、每回合（updatedAt）、会话结束（status） |
| `.loki/state/orchestrator.json` | 每回合 | 阶段变更时 |
| `.loki/queue/pending.json` | 每回合 | 领取/完成任务时 |
| `.loki/queue/current-task.json` | 每次 ACT 前 | 领取任务时 |
| `.loki/specs/openapi.yaml` | API 工作前 | API 变更后 |
| `skills/00-index.md` | 会话开始 | 从不 |
| `.loki/memory/index.json` | 会话开始 | 主题变更时 |
| `.loki/memory/timeline.json` | 上下文需求时 | 任务完成后 |
| `.loki/memory/token_economics.json` | 从不（仅指标） | 每回合 |
| `.loki/memory/episodic/*.json` | 任务感知检索时 | 任务完成后 |
| `.loki/memory/semantic/patterns.json` | 实施任务前 | 汇总时 |
| `.loki/memory/semantic/anti-patterns.json` | 调试任务前 | 错误学习时 |
| `.loki/queue/dead-letter.json` | 会话开始 | 任务失败时（5 次及以上尝试） |
| `.loki/signals/HUMAN_REVIEW_NEEDED` | 从不 | 需要人工决策时 |
| `.loki/state/checkpoints/` | 任务完成后 | 通过 `loki checkpoint` 自动 + 手动 |

（v7.5.2+）单命令回滚：`loki rollback latest` 或 `loki rollback to <id>` 会从检查点恢复 `.loki/` 状态。它会先捕获当前状态的强制回滚前快照并打印其 id，因此回滚本身也是可撤销的（`loki rollback to <that-id>`）。使用 `loki rollback list` 查看检查点。

---

## 模块加载协议（Skills）

此协议规定 **skill 模块**的加载方式，即 `skills/` 中按任务范围提供的指令文件。它与下方的记忆系统渐进式披露机制不同，后者管理 `.loki/memory/` 中的持久化**记忆层**。

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

**记忆系统渐进式披露**是一个独立的 3 层结构（`index.json` -> `timeline.json` -> `episodic/*.json`），用于检索过往事件和模式。请参阅 `skills/memory.md` 和 `references/memory-system.md`。

---

## 调用

**统一入口（v6.84.0）：** `loki start [SPEC|ISSUE-REF]` 会自动检测输入是 PRD 文件、问题 URL、问题编号，还是其他规范格式（例如 OpenAPI）。无需在 `loki start` 和 `loki run` 之间进行选择，单个命令即可处理所有情况。

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

**提供者能力：**
- **Claude**: Opus 4.6，1M 上下文（beta），128K 输出，自适应思考，智能体团队，完整功能（Task tool、parallel agents、MCP）
- **Codex**: GPT-5.3，400K 上下文，128K 输出，支持 MCP，--full-auto 模式，降级（仅顺序执行，无 Task tool）
- **Cline**: 多提供商 CLI，降级模式（仅顺序执行，无 Task tool）
- **Aider**: 18+ 提供商后端，降级模式（仅顺序执行，无 Task tool）
- **Google Gemini CLI**: 从 v7.5.18 起已弃用（上游已弃用；运行时已移除）

---

## 人工干预 (v3.4.0)

使用 `autonomy/run.sh` 运行时，你可以进行干预：

| 方法 | 效果 |
|--------|--------|
| `touch .loki/PAUSE` | 在当前会话后暂停 |
| `loki steer "<note>"` | 将指令追加到 `.loki/HUMAN_INPUT.md`（需要 `LOKI_PROMPT_INJECTION=1`）；v8.0.0 |
| `echo "instructions" > .loki/HUMAN_INPUT.md` | 注入指令（需要 `LOKI_PROMPT_INJECTION=true`） |
| `loki why` | 解释当前结果；在停顿时给出真实停顿原因并建议使用 `loki steer`（v8.0.0） |
| `touch .loki/STOP` | 立即停止 |
| Ctrl+C（一次） | 暂停，显示选项 |
| Ctrl+C（两次） | 立即退出 |

### 安全：提示注入 (v5.6.1)

**默认禁用**以确保企业安全。除非明确启用，否则通过 `HUMAN_INPUT.md` 的提示注入会被阻止。

```bash
# 启用提示注入（仅在可信环境中）
LOKI_PROMPT_INJECTION=true loki start ./prd.md

# 或用于沙箱模式
LOKI_PROMPT_INJECTION=true loki sandbox prompt "start the app"
```

### 提示与指令

| 类型 | 文件 | 行为 |
|------|------|----------|
| **Directive** | `.loki/HUMAN_INPUT.md` | 有效指令（需要 `LOKI_PROMPT_INJECTION=true`） |

**示例指令**（仅在 `LOKI_PROMPT_INJECTION=true` 下生效）：
```bash
echo "Check all .astro files for missing BaseLayout imports." > .loki/HUMAN_INPUT.md
```

---

## 复杂度层级 (v3.4.0)

自动检测或使用 `LOKI_COMPLEXITY` 强制设置：

| 层级 | 阶段 | 使用场景 |
|------|--------|----------|
| **simple** | 3 | 1-2 个文件，UI 修复，文本更改 |
| **standard** | 6 | 3-10 个文件，功能开发，缺陷修复 |
| **complex** | 8 | 10+ 个文件，微服务，外部集成 |

---

## 管理托管智能体集成 (v7.2.0)

与 Claude Managed Agents 的可选集成（2026 年 4 月发布）。为 Loki 提供跨项目的审计内存和真正的多智能体委员会。功能已内置到现有 RARV-C 和 council 流程中——无需学习新命令。

**所有标志默认为 false。** 默认行为与 v7.2.0 相同。

| 标志 | 用途 | 状态 |
|------|---------|--------|
| `LOKI_MANAGED_AGENTS` | 总开关；托管路径所需 | 稳定 |
| `LOKI_MANAGED_MEMORY` | REASON 增强 + REFLECT 阴影写入从 `.loki/memory/` 到 Managed Agents 存储 | 稳定（已使用 fake 进行测试） |
| `LOKI_MANAGED_MEMORY_HYDRATE` | 会话启动时从存储拉取语义模式 + 技能 | 稳定（已使用 fake 进行测试） |
| `LOKI_EXPERIMENTAL_MANAGED_AGENTS` | 多智能体会话路径的总开关 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_REVIEW` | 通过 `callable_agents` 的托管代码评审委员会 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_COUNCIL` | 通过 `callable_agents` 的托管完成委员会 | 研究预览 |

快速失败（fail-fast）：`child-on + parent-off` 会以明确错误退出码 `2`。API
不可达时将回退到本地路径，并向 `.loki/managed/events.ndjson` 写入
`managed_agents_fallback` 事件。不会出现重试风暴。

**建议开启顺序（推荐）：**
1. `LOKI_MANAGED_AGENTS=true LOKI_MANAGED_MEMORY=true`（内存镜像）。
2. 在一周磨合后加入 `LOKI_MANAGED_MEMORY_HYDRATE=true`。
3. 将 `LOKI_EXPERIMENTAL_*` 保持关闭，直到多代理从研究预览毕业。

**未针对真实 Anthropic API 进行测试。** 自动化 CI 使用
`memory/managed_memory/fakes.py`。Beta header 固定为
`managed-agents-2026-04-01`。如果 SDK 形状不一致，调用会抛出
`AttributeError`/`TypeError`，这些错误会被捕获并转换为
`ManagedUnavailable`，随后回退到本地路径。

完整集成指南见 `skills/memory.md`。

---

## 第1阶段 RARV-C 闭环（v7.5.x）

当前路线将真实证据接入 RARV-C 反馈。该内容在此处及 `loki internal --help`
中有说明：

| 环境变量 | 效果 |
|---------|--------|
| `LOKI_INJECT_FINDINGS=true` | 将 council findings 与 gate failures 注入到下一次 REASON 提示 |
| `LOKI_OVERRIDE_COUNCIL=true` | 在可用时优先使用真实 provider judges 而非假值 |
| `LOKI_AUTO_LEARNINGS=true` | 在 VERIFY 后自动将学习内容提取到语义记忆 |
| `LOKI_HANDOFF_MD=true` | 在会话边界生成 `handoff.md` 延续性文档 |

完整 RARV-C 契约见 `references/core-workflow.md`。

---

## 信任层补充（v7.28.0）

两个 completion-trust 特性扩展了验证门控。完整细节见
`skills/quality-gates.md`。

- **留出验证样本：** 约 25% 的 checklist 条目（按确定性 `sha256(id)` 顺序，`N >= 4`）会被保留到 `.loki/checklist/held-out.json`，并从构建提示词输入中排除；若留出项失败，completion council 将阻塞流程。可通过 `LOKI_HELDOUT_GATE=0` 选择退出。诚实的局限在于：它只保护提示词输入，而不是沙箱；该保留文件在磁盘上，具备文件系统访问权限的代理可以读取。
- **不确定基线披露：** 当证据门控无法建立差异基线（`no_git_repo` / `no_run_start_sha`）时，会写入
  `.loki/state/evidence-inconclusive.json`，且 `COMPLETION.txt` 会携带诚实的
  “not independently verified” 行。它不会阻塞非 git 项目；红色测试仍然会阻塞。

## Harness intelligence（v8.0.0）

在现有信任核心上叠加了四个经测量的 harness 纪律。它们都不能削弱门控：每个都要么增加验证，要么在必失败的工作上节省预算。

| 环境变量 | 默认 | 效果 |
|---------|---------|--------|
| `LOKI_CONFIDENCE_SPIKE=0` | 开启 | 禁用置信度尖峰重检 |
| `LOKI_CONFIDENCE_SPIKE_DELTA` | `40` | 判定为尖峰的置信度跃升（点数） |
| `LOKI_CONFIDENCE_SPIKE_MIN` | `90` | 首次到达时视为尖峰的绝对阈值 |
| `LOKI_GOAL_SCORING=0` | 开启 | 禁用目标可测性咨询 |
| `LOKI_SMART_RETRY=0` | 开启 | 重试所有失败，包括不可重试失败 |
| `LOKI_SIMPLE=1` | 关闭 | 去掉系统提示词的教练部分（-78%，约 1562 token/轮次）。实验性剥离分支。 |

- **提示缓存规范。** 提示词在显式的 `[CACHE_BREAKPOINT]` 处分为一个缓存稳定的
  `<loki_system>` 前缀和一个易变的 `<dynamic_context>` 尾部；SDK judge 路径会在该分界处应用
  `cache_control`。任何新的常驻指令都应放在前缀中，否则每次迭代都会使缓存失效。
- **置信度飙升复检。** 当自报置信度跃升到接近最大值时，会在 done-signal valve 强制终止运行之前再执行
  ONE 次额外校验。严格为增量行为：飙升只能**增加**一次验证轮次，不能跳过、缩短或满足某个闸门。它不能延迟
  stagnation valve，并且延迟为一次性，因此反复飙升的运行也不能无限期推迟该阀门。
- **可爬坡目标评分。** 对于没有可度量目标（无数字、比较符、命名指标或可验证产物）的
  `COMPLETION_PROMISE`，会触发提示建议，要求给出可检查的成功条件。仅为建议：它不会阻塞构建，也不会改写目标。对缺失目标和
  perpetual 模式会被抑制，其中开放式结尾是已选配置。该行为在 bash 与 TypeScript 路由之间完全字节对齐。
- **智能重试。** 明确识别出的永久性失败（凭据错误、未知模型、配额用尽）会提前停止，而不是在必然重复失败上消耗重试预算。故障保护：
  未识别错误仍保持 `TRANSIENT` 并按原样重试，且速率限制被明确排除在永久失败集合之外。

## Operational observability (v8.0.0)

- **SDK 能力降级事件。** SDK 加载或流式处理失败会向 `.loki/events.jsonl` 追加一个结构化的
  `capability_degraded` 记录（与 hook events 相同的 `{type, source, timestamp, payload}` 封装），而不仅仅以
  纯文本形式出现在采集输出中，以便无人值守时可区分“SDK 无法加载”与“模型表现不佳”。该记录会写入
  `fail_closed: true`，而不是让人猜测。无需环境变量：这是操作员始终需要的信号。
- **首次预览耗时。** `.loki/app-runner/first-preview.json` 记录从运行开始到应用首次可服务的耗时秒数。
  只写一次，因此重启不能用一个更快的热启动数值覆盖真实的首次预览缓慢；当不存在基线时会直接跳过而不是猜测。
  仅 Bash 路由（app-runner 集成位于此）。

## First-run UX (v7.29.0)

- **`loki quickstart`：** 引导式 4 步首次构建（setup check、单行 idea、离线模板匹配、含真实估算数据的
  计划复核）；贯穿所有步骤按回车可构建示例 Todo 应用；非 TTY/CI 环境下以状态码 2 退出，并给出自动化提示。
- **提供安装程序。** 当未发现提供者 CLI 时，doctor 以及 start/demo/quick/quickstart 预检会在交互式
  TTY 上提供安装 Claude Code 的选项；仅在可交互 TTY 下才会提示；首先打印将要执行的单条命令；通过 `claude
  auth login` 完成鉴权交接，并由 `claude auth status` 确认就绪。可选退出：`LOKI_NO_INSTALL_OFFER=1`。
- **`loki demo` 成本确认：** 估算会始终在消费前打印；`--yes` 会跳过提示，但不会跳过估算输出。`LOKI_COMPLEXITY`
  会被 `loki plan` 采用，并附带诚实的强制层级说明。

---
## 并发与安全加固（v7.5.7 - v7.5.13）

连续三次补丁修复了跨进程和安全性缺口。默认流程没有用户可见的行为变化；请通过所引用的路径进行验证。

- **跨进程文件锁**用于 append-or-rewrite 状态，以便并行运行 / dashboard / MCP 不会破坏共享文件：门控计数器（`autonomy/run.sh` gate-counter 写入）、任务队列（`autonomy/run.sh` 队列 read-modify-write）、检查点索引（`autonomy/run.sh` 检查点索引更新）、`events.jsonl` 追加（`events/emit.sh` 和 `autonomy/run.sh` 中的事件发送路径）、人工干预信号文件（按状态机文档，`autonomy/run.sh:check_human_intervention()` 在约 8059 / 7897 行）。
- **MCP 路径校验**——`mcp/server.py` 工具的 file/path 参数已标准化，并在逃离项目根目录时被拒绝（v7.5.8 的路径遍历修复）。
- `dashboard/server.py` 中，对 `/api/memory/*`、`/api/learning/*` 和 `/api/status` 现在要求进行 dashboard 认证（先前为未认证读取路径）。
- `autonomy/run.sh` 和 `autonomy/loki` 的 **Bash 引号强化**——命令替换和 `[ ]` 测试中的变量展开都加上引号，以避免路径中含空格导致的词拆分问题。

请参阅 `CHANGELOG.md` 的 [7.5.7]、[7.5.8]、[7.5.13] 条目，查看逐项修复清单和审阅者签署。

---

## 已实现功能

| 功能 | 添加版本 | 说明 |
|---------|-------|-------|
| 多提供商支持（5 个提供商） | v5.0.0 | claude、codex、cline、aider、opencode -- 见 `providers/` |
| CONTINUITY.md working memory | v5.35.0 | 由 run.sh 自动管理，每次迭代更新 |
| 质量门 3 审核人体系 | v5.35.0 | `skills/quality-gates.md` 中有 5 名专业审核人；在 run.sh 中执行 |
| Memory System（情景/语义/程序性） | v5.15.0 | `memory/` 中的完整实现 |
| Context Window Tracking | v5.40.0 | 仪表盘仪表、`GET /api/context` 的逐代理分解 |
| Notification Triggers | v5.40.0 | `GET/PUT /api/notifications/triggers` |
| GitHub 集成 | v5.42.2 | 导入、回写同步、PR 创建、导出。CLI：`loki github`，API：`/api/github/*` |
| Legacy System Healing | v6.67.0 | `loki heal <path>` -- friction-as-semantics、特征测试 |
| Unified `loki start` | v6.84.0 | 自动识别规格（PRD、OpenAPI 等）与 issue 输入 |
| Managed Agents（memory mirror） | v7.2.0 | 通过 `LOKI_MANAGED_AGENTS` 可选启用 -- 见 Managed Agents 部分 |
| Bun runtime（第一阶段） | v7.3.0 | 只读命令通过 `bin/loki` 路由；`LOKI_LEGACY_BASH=1` 可回退 |
| 第一阶段 RARV-C 关闭 | v7.5.x | Findings 注入、真实裁判、自动学习、`handoff.md` |
| Anthropic SDK 路径 | v8.0.0 | 可选启用，默认关闭；单一开关 `LOKI_SDK_MODE` -- 见 `references/sdk-mode.md` |
| Harness intelligence | v8.0.0 | Prompt-cache 约束、confidence-spike 复查、目标评分、智能重试 |
| SDK 降级事件 | v8.0.0 | 在 `.loki/events.jsonl` 上结构化记录 `capability_degraded` |
| 首次预览时间 | v8.0.0 | `.loki/app-runner/first-preview.json`，写一次（bash 路由） |
| Opt-in build analytics | v8.0.0 | `build_verified` 事件在严格第二道闸后触发，仅允许 `allowlist` 字段 |

## 计划中 / 进行中的功能

| 特性 | 目标 | 说明 |
|---------|--------|-------|
| Bun 运行时（Phase 2+） | TBD | 迁移写路径命令；已在 `feat/bun-migration` 中跟踪 |
| 托管代理 multiagent 路径 | TBD | `LOKI_EXPERIMENTAL_MANAGED_*` 标志 -- 研究预览，不在正式 API 中 |
| 基准测试（HumanEval、SWE-bench） | TBD | 运行脚本和数据集位于 `benchmarks/`；尚无公开结果 |
| `loki run` 移除 | 下一个 major | 目前是 `loki start` 的已弃用别名 |

## 已弃用

| 项目 | 弃用版本 | 说明 |
|------|---------------|-------|
| `loki run <issue>` | v6.84.0 | `loki start` 的别名。将于下一个 major 版本中移除。 |
| VSCode 扩展（`vscode-extension/`） | v7.2.0 | 不再积极维护；dashboard web UI 是受支持的前端。 |

---

**v9.35.0 | [Autonomi](https://www.autonomi.dev/) 旗舰产品 | ~410 行核心**