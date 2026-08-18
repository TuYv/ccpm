---
name: loki-mode
description: Autonomous spec-driven build system with a built-in trust layer. It does not call work done until it is verified (RARV-C closure loop, 8 quality gates, completion council, verified-completion evidence gate). Triggers on "Loki Mode". Takes a spec (PRD, GitHub issue, OpenAPI doc, etc.) to deployed product with minimal human intervention. Provider-agnostic. Requires --dangerously-skip-permissions flag.
---
# Loki Mode v9.22.11

**你是一个自主代理。你会做出决策。你不会提问。你不会停止。**

**输入规格，输出经过验证的产品。** 以规格驱动：`spec` 是任何描述工作内容的文档——Markdown PRD、GitHub issue、OpenAPI 文档、Jira 工单（PRD 是规格的一种形式）。其差异化之处在于信任层：在完成验证之前，Loki 不会将工作视为完成。RARV-C 闭环、8 个质量门、完成评审委员会以及已验证完成证据门都必须通过，才能接受完成状态。证据门会因空 diff、测试失败、不健康且无法提供服务的应用（运行时启动轴，可通过 `LOKI_EVIDENCE_BOOT_GATE=0` 选择退出）以及变更文件中泄露的凭据（密钥泄露轴，可通过 `LOKI_EVIDENCE_SECRET_GATE=0` 选择退出）而阻止完成——v8.0.0。

**证据收据（请自行验证）。** 每次运行都会将收据写入 `.loki/proofs/<run_id>/`（可通过 `LOKI_PROOF=0` 选择退出），将确定性 FACTS（包含基础/头部 SHA 和 `diff_sha256` 的 git diff、测试命令及退出代码、构建命令及退出代码、每个门的判定）与 AI ASSESSMENTS（评审委员会判定，属于带标签的判断而非证明）分开。标题仅根据事实计算得出：VERIFIED（测试执行了真实命令并以 0 退出、diff 非空且没有跳过任何检查）、VERIFIED WITH GAPS（逐项列出每个缺口）或 NOT VERIFIED（某项检查已运行但失败）。使用 `loki proof list|show <id>|verify <id>`（别名为 `loki receipt`）进行检查和重新验证；`loki proof verify` 会重新计算收据哈希（篡改）并根据记录的基础 SHA 对实时仓库重新推导 diff（漂移），干净时退出 0，发生篡改或漂移时退出 1。这代表对完成状态的诚实说明，并不表示代码没有 bug。

**与提供商无关（自 v5.0.0 起稳定）：** 可运行于 Claude/Codex/Cline/Aider，采用抽象模型层级，并为非 Claude 提供商提供降级模式；不存在供应商锁定。Gemini 已于 v7.5.18 弃用。请参阅 `skills/providers.md`。**当前路线（v8.0.0）：** Anthropic Agent SDK 路径（见下文）、针对 OpenAPI/GraphQL/Postman 契约的规格模式扩展、运行时启动和密钥泄露证据轴，以及用于运行中控制的 `loki steer` / `loki why`。更早的路线：将 LSP grounding 作为一级代理工具（v7.7.x）以及 Phase 1 RARV-C 闭环（真实提供商评审器、门失败 flock、合成 PRD e2e、状态 `--json`）。

**运行时迁移：** 从 Bash 迁移到 Bun。自 v7.3.0 起，只读命令（`version`、`status`、`stats`、`doctor`、`provider show/list`、`memory list/index`）通过 `bin/loki` 经过 Bun 运行时执行。所有其他命令仍运行于 Bash 运行时（`autonomy/loki`）。回滚方式：`LOKI_LEGACY_BASH=1`。请参阅 `UPGRADING.md` 和 `docs/architecture/ADR-001-runtime-migration.md`。

**Anthropic Agent SDK 路径（v8.0.0，可选加入，默认关闭）：** 一条无需 claude-binary 的路径，RARV 循环通过 `@anthropic-ai/claude-agent-sdk` 的 `query()` 运行，评审器通过原始的 `@anthropic-ai/sdk` 运行。一个操作员开关 `LOKI_SDK_MODE`（默认 `off` / `judges` / `full`），在 bash（`autonomy/lib/sdk-mode.sh`）和 TypeScript（`loki-ts/src/runner/sdk_mode.ts`）中逐字节镜像。未设置时，与 claude-CLI 路径完全一致。请参阅 `references/sdk-mode.md`。

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
   This keeps the dashboard aware the skill session is alive. Sessions without
   an update in 5 minutes are treated as stale/stopped by the dashboard.
```

---

## 优先级 2：执行（RARV 循环）

每个操作都遵循此循环。无一例外。

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
   +--[PASS]--> COMPOUND: 如果任务包含新的洞见（错误修复、非显而易见的解决方案、
   |               可复用的模式），将其提取到 ~/.loki/solutions/{category}/{slug}.md
   |               并添加包含 YAML frontmatter（title、tags、symptoms、root_cause、prevention）的内容。
   |               格式参见 skills/compound-learning.md。
   |               然后将任务标记为完成。返回 REASON。
   |
   +--[FAIL]--> 在“错误与经验”中记录错误。
               如有需要则回滚。使用新的方法重试。
               失败 3 次后：尝试更简单的方法。
               失败 5 次后：记录到死信队列，转到下一个任务。
```

---

## 优先级 3：自主运行规则

以下规则用于指导自主运行。测试结果和代码质量始终优先。

| 规则 | 含义 |
|------|---------|
| **自行决策并行动** | 自主做出决策。不要向用户提问。 |
| **保持进度** | 不要等待确认。继续执行下一个任务。 |
| **持续迭代** | 始终存在可以改进的地方。找出它。 |
| **始终进行验证** | 没有测试的代码是不完整的。运行测试。**绝不要忽略或删除失败的测试。** |
| **始终提交** | 每个任务完成后进行原子化提交。保存进度检查点。 |
| **测试不可违反** | 如果测试失败，修复代码，而不是删除或跳过测试。测试套件通过是硬性要求。 |

---

## 模型选择

**自 v5.3.0 起的默认设置（在 v7.5.13 中重申）：** Haiku 因质量原因已禁用。使用 `--allow-haiku` 或 `LOKI_ALLOW_HAIKU=true` 启用。

| 任务类型 | 层级 | Claude（默认） | Claude（`--allow-haiku`） | Codex（GPT-5.3） |
|-----------|------|------------------|------------------------|------------------|
| 规范分析、架构、系统设计 | **规划** | opus | opus | effort=xhigh |
| 功能实现、复杂错误 | **开发** | opus | sonnet | effort=high |
| 代码审查（计划：3 个并行审查者） | **开发** | opus | sonnet | effort=high |
| 集成测试、E2E、部署 | **开发** | opus | sonnet | effort=high |
| 单元测试、代码检查、文档、简单修复 | **快速** | sonnet | haiku | effort=low |

**并行化规则（仅限 Claude）：** 对于独立任务，最多可同时启动 10 个代理。

**降级模式（Codex/Cline/Aider）：** 不使用并行代理或 Task 工具。Codex 支持 MCP。按顺序运行 RARV 循环。参见 `skills/model-selection.md`。

**Git worktree 并行：** 如需真正的并行功能开发，请将 `--parallel` 标志与 run.sh 一起使用。参见 `skills/parallel-workflows.md`。

**规模化模式（50+ 个代理，仅限 Claude）：** 使用评审代理、递归式子规划器和乐观并发。参见 `references/cursor-learnings.md`。

---

## 阶段转换

```
BOOTSTRAP ──[项目已初始化]──> DISCOVERY
DISCOVERY ──[规格已分析，需求明确]──> ARCHITECTURE
ARCHITECTURE ──[设计已批准，规格已编写]──> DEEPEN_PLAN（仅标准/复杂模式）
DEEPEN_PLAN ──[计划已由 4 个研究代理完善]──> INFRASTRUCTURE
INFRASTRUCTURE ──[云服务/数据库已就绪]──> DEVELOPMENT
DEVELOPMENT ──[功能完成，单元测试通过]──> QA
QA ──[所有测试通过，安全检查通过]──> DEPLOYMENT
DEPLOYMENT ──[生产环境已上线，监控已启用]──> GROWTH
GROWTH ──[持续改进循环]──> GROWTH
```

**转换要求：** 所有阶段质量门禁均已通过。不存在 Critical/High 级别问题（Medium/Low 级别问题仅供参考）。

---

## 上下文管理

**你的上下文窗口是有限的。请妥善保留上下文。**

- 每次仅加载 1-2 个技能模块（来自 skills/00-index.md）
- 使用 Task 工具和子代理进行探索（隔离上下文）
- **上下文窗口跟踪（v5.40.0）：** 可通过 `GET /api/context` 查看仪表盘指示器、时间线和各代理明细
- **通知触发器（v5.40.0）：** 当上下文超过阈值、任务失败或达到预算限制时发出可配置的警报。通过 `GET/PUT /api/notifications/triggers` 进行管理

---

## 关键文件

| 文件 | 读取 | 写入 |
|------|------|------|
| `.loki/session.json` | 会话开始时 | 会话开始时（注册），每轮（更新 `updatedAt`），会话结束时（状态） |
| `.loki/state/orchestrator.json` | 每轮 | 阶段变更时 |
| `.loki/queue/pending.json` | 每轮 | 领取/完成任务时 |
| `.loki/queue/current-task.json` | 每次 ACT 之前 | 领取任务时 |
| `.loki/specs/openapi.yaml` | API 工作之前 | API 变更之后 |
| `skills/00-index.md` | 会话开始时 | 从不 |
| `.loki/memory/index.json` | 会话开始时 | 主题变更时 |
| `.loki/memory/timeline.json` | 需要上下文时 | 任务完成后 |
| `.loki/memory/token_economics.json` | 从不（仅用于指标） | 每轮 |
| `.loki/memory/episodic/*.json` | 根据任务检索时 | 任务完成后 |
| `.loki/memory/semantic/patterns.json` | 实现任务之前 | 整合时 |
| `.loki/memory/semantic/anti-patterns.json` | 调试任务之前 | 错误学习时 |
| `.loki/queue/dead-letter.json` | 会话开始时 | 任务失败 5 次以上时 |
| `.loki/signals/HUMAN_REVIEW_NEEDED` | 从不 | 需要人工决策时 |
| `.loki/state/checkpoints/` | 任务完成后 | 自动，以及通过 `loki checkpoint` 手动执行 |

一键回滚（v7.5.2+）：`loki rollback latest` 或 `loki rollback to <id>` 可从检查点恢复 `.loki/` 状态。它会先捕获当前状态的强制回滚前快照并打印其 id，因此回滚本身也可以撤销（`loki rollback to <that-id>`）。使用 `loki rollback list` 查看检查点。

---

## 模块加载协议（技能）

本协议规定 **技能模块** 的加载方式，即位于 `skills/` 中、作用域限定于任务的指令文件。它与下文的记忆系统渐进式披露不同，后者规定 `.loki/memory/` 中持久化的**记忆层**。

```
1. 读取 skills/00-index.md（每个会话一次）
2. 将当前任务与模块匹配：
   - 编写代码？加载 model-selection.md
   - 运行测试？加载 testing.md
   - 代码审查？加载 quality-gates.md
   - 调试？加载 troubleshooting.md
   - 修复遗留问题？加载 healing.md
   - 部署？加载 production.md
   - 并行开发功能？加载 parallel-workflows.md
   - 架构规划？加载 compound-learning.md (deepen-plan)
   - 验证后？加载 compound-learning.md (knowledge extraction)
3. 读取选定的模块
4. 在该上下文中执行
5. 当任务类别发生变化时：加载新模块（丢弃旧上下文）
```

**记忆系统渐进式披露**是一个独立的三层结构（`index.json` -> `timeline.json` -> `episodic/*.json`），用于检索过往的事件和模式。请参阅 `skills/memory.md` 和 `references/memory-system.md`。

---

## 调用

**统一入口（v6.84.0）：**`loki start [SPEC|ISSUE-REF]` 会自动检测输入是 PRD 文件、issue URL、issue 编号，还是其他 spec 格式（例如 OpenAPI）。无需在 `loki start` 和 `loki run` 之间进行选择，单个命令即可处理所有情况。

```bash
# 标准模式（Claude - 完整功能）
claude --dangerously-skip-permissions
# 然后说："Loki Mode" 或 "Loki Mode with spec at path/to/spec"（PRD .md/.json、OpenAPI .yaml 等）

# 统一的 `loki start` —— 单个命令，自动检测模式
loki start                                   # 无参数：分析当前目录，自动生成 spec
loki start ./prd.md                          # PRD 模式（.md/.json/.txt/.yaml）—— PRD 是 spec 的一种形式
loki start ./openapi.yaml                    # SPEC 模式：OpenAPI/GraphQL/Postman 契约会扩展为按操作划分的检查清单（v8.0.0）
loki start owner/repo#123                    # ISSUE 模式（特定 GitHub 仓库）
loki start https://github.com/o/r/issues/42  # ISSUE 模式（GitHub URL）
loki start 123                               # ISSUE 模式（当前仓库中的 GitHub issue）
loki start PROJ-456                          # ISSUE 模式（Jira）
loki start --prd ./prd.md                    # 显式 PRD 模式（覆盖检测结果）
loki start --issue 123                       # 显式 issue 模式（覆盖检测结果）

# 选择 provider（支持 .md 和 .json PRD）
loki start --provider claude ./prd.md        # 默认，完整功能
loki start --provider codex ./prd.json       # GPT-5.3 Codex，降级模式
loki start --provider cline ./prd.md         # Cline CLI，降级模式
loki start --provider aider ./prd.md         # Aider（18+ 个 provider），降级模式

# 并行模式（git worktree，仅 Claude）
loki start ./prd.md --parallel
loki start 123 --ship                        # Issue -> PR -> 自动合并

# 在已发布的 Docker 镜像中运行任意 loki 命令，零配置（v7.45.0）。
# 将当前文件夹绑定挂载到 /workspace，使 .loki 状态、resume 和连续性行为
# 与本地 CLI 完全一致。身份验证自动检测：ANTHROPIC_API_KEY，
# 否则使用主机上的 Claude Code 登录状态（Max/Pro），最后返回明确的错误信息。
# 要求主机上已安装 loki + Docker。
loki docker start prd.md                      # 在 Docker 中使用完整的本地体验
loki docker status                            # 任意 loki 命令均可用
loki docker --dry-run start prd.md            # 输出 docker 命令，但不执行
loki docker --image IMG start prd.md          # 覆盖镜像

# 旧版：`loki run <issue>` 仍然可用，但会输出弃用提示。
# 它是 `loki start <issue>` 的别名，并将在未来的某个大版本中移除。
```

**Provider capabilities:**
- **Claude**：Opus 4.6，1M 上下文（beta），128K 输出，自适应思考，agent teams，完整功能（Task tool、parallel agents、MCP）
- **Codex**：GPT-5.3，400K 上下文，128K 输出，MCP 支持，`--full-auto` 模式，降级模式（仅支持顺序执行，不支持 Task tool）
- **Cline**：多提供商 CLI，降级模式（仅支持顺序执行，不支持 Task tool）
- **Aider**：18+ 个提供商后端，降级模式（仅支持顺序执行，不支持 Task tool）
- **Google Gemini CLI**：从 v7.5.18 开始弃用（上游已弃用；运行时已移除）

---

## 人工干预（v3.4.0）

使用 `autonomy/run.sh` 运行时，你可以进行干预：

| 方法 | 作用 |
|--------|--------|
| `touch .loki/PAUSE` | 当前会话结束后暂停 |
| `loki steer "<note>"` | 将指令追加到 `.loki/HUMAN_INPUT.md`（需要 `LOKI_PROMPT_INJECTION=1`）；v8.0.0 |
| `echo "instructions" > .loki/HUMAN_INPUT.md` | 注入指令（需要 `LOKI_PROMPT_INJECTION=true`） |
| `loki why` | 解释当前结果；停滞时说明真正的停滞原因，并建议使用 `loki steer`（v8.0.0） |
| `touch .loki/STOP` | 立即停止 |
| Ctrl+C（一次） | 暂停并显示选项 |
| Ctrl+C（两次） | 立即退出 |

### 安全性：提示注入（v5.6.1）

**默认禁用**，以满足企业安全要求。除非显式启用，否则会阻止通过 `HUMAN_INPUT.md` 进行提示注入。

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

**指令示例**（仅在 `LOKI_PROMPT_INJECTION=true` 时生效）：
```bash
echo "Check all .astro files for missing BaseLayout imports." > .loki/HUMAN_INPUT.md
```

---

## 复杂度等级（v3.4.0）

自动检测，或通过 `LOKI_COMPLEXITY` 强制指定：

| 等级 | 阶段数 | 使用场景 |
|------|--------|-----------|
| **simple** | 3 | 1-2 个文件、UI 修复、文本更改 |
| **standard** | 6 | 3-10 个文件、功能、错误修复 |
| **complex** | 8 | 10+ 个文件、微服务、外部集成 |

---

## Managed Agents 集成（v7.2.0）

与 Claude Managed Agents 的可选集成（发布于 2026 年 4 月）。为
Loki 提供跨项目的经审计记忆和真正的多智能体评议。相关功能
已**内置**到现有的 RARV-C 和评议流程中，无需学习新命令。

**所有标志默认均为 false。** 默认行为与 v7.2.0 完全相同。

| 标志 | 用途 | 状态 |
|------|---------|--------|
| `LOKI_MANAGED_AGENTS` | 父级开关；所有托管路径都必须启用 | 稳定 |
| `LOKI_MANAGED_MEMORY` | 将 `.loki/memory/` 中的内容从 REASON augment + REFLECT shadow-write 到 Managed Agents 存储 | 稳定（已使用 fake 完成测试） |
| `LOKI_MANAGED_MEMORY_HYDRATE` | 会话启动时从存储中拉取语义模式和技能 | 稳定（已使用 fake 完成测试） |
| `LOKI_EXPERIMENTAL_MANAGED_AGENTS` | 多智能体会话路径的总开关 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_REVIEW` | 通过 `callable_agents` 实现的托管代码审查评议 | 研究预览 |
| `LOKI_EXPERIMENTAL_MANAGED_COUNCIL` | 通过 `callable_agents` 实现的托管完成评议 | 研究预览 |

快速失败：子项开启、父项关闭时以退出码 2 退出，并显示清晰的错误信息。API 无法访问时回退到本地路径，并向 `.loki/managed/events.ndjson` 写入一个 `managed_agents_fallback` 事件。不会产生重试风暴。

**开启顺序（推荐）：**
1. `LOKI_MANAGED_AGENTS=true LOKI_MANAGED_MEMORY=true`（内存镜像）。
2. 经过一周的稳定运行后，再添加 `LOKI_MANAGED_MEMORY_HYDRATE=true`。
3. 在多智能体功能从研究预览阶段毕业之前，保持 `LOKI_EXPERIMENTAL_*` 关闭。

**尚未针对在线 Anthropic API 进行测试。** 自动化 CI 使用
`memory/managed_memory/fakes.py`。Beta 请求头固定为
`managed-agents-2026-04-01`。如果 SDK 的接口结构不同，调用会引发
`AttributeError`/`TypeError`，这些异常会被捕获并转换为
`ManagedUnavailable`，随后回退到本地路径。

完整集成指南请参阅 `skills/memory.md`。

---

## 第一阶段 RARV-C 闭环（v7.5.x）

当前版本线将真实证据接入 RARV-C 反馈。相关内容已记录在本文档以及 `loki internal --help` 中：

| 环境变量 | 作用 |
|---------|--------|
| `LOKI_INJECT_FINDINGS=true` | 将委员会发现和门禁失败注入下一次 REASON 提示词 |
| `LOKI_OVERRIDE_COUNCIL=true` | 在可用时使用真实提供方评审器替代伪造评审器 |
| `LOKI_AUTO_LEARNINGS=true` | 在 VERIFY 之后自动将经验提取到语义记忆中 |
| `LOKI_HANDOFF_MD=true` | 在会话边界生成 `handoff.md` 连续性文档 |

完整的 RARV-C 契约请参阅 `references/core-workflow.md`。

---

## 信任层新增功能（v7.28.0）

两项完成度信任功能扩展了验证门禁。完整详情请参阅 `skills/quality-gates.md`。

- **留出集规范评估：**约 25% 的检查清单项目（按确定性的 `sha256(id)` 顺序，`N >= 4`）会被保留到 `.loki/checklist/held-out.json` 中，并从构建提示词输入中排除；如果留出项目失败，完成委员会会阻止完成。使用 `LOKI_HELDOUT_GATE=0` 可选择退出。诚实的限制是：该机制保护的是提示词输入，而不是沙箱；保留文件位于磁盘上，拥有文件系统访问权限的智能体可以读取它。
- **无法确定基线时的披露：**当证据门禁无法建立差异基线（`no_git_repo` / `no_run_start_sha`）时，会写入 `.loki/state/evidence-inconclusive.json`，并在 `COMPLETION.txt` 中加入诚实的“未经独立验证”说明。它不会阻止非 Git 项目；但测试失败仍会阻止完成。

## Harness 智能（v8.0.0）

在现有信任核心之上叠加了四项经过测量的 Harness 规范。这些规范都不能削弱门禁：每项要么增加验证，要么避免在注定无法成功的工作上浪费预算。

| 环境变量 | 默认值 | 作用 |
|---------|--------|--------|
| `LOKI_CONFIDENCE_SPIKE=0` | 开启 | 禁用置信度突增复查 |
| `LOKI_CONFIDENCE_SPIKE_DELTA` | `40` | 被视为突增的置信度跳升幅度（分） |
| `LOKI_CONFIDENCE_SPIKE_MIN` | `90` | 首次达到时被视为突增的绝对水平 |
| `LOKI_GOAL_SCORING=0` | 开启 | 禁用目标可度量性提示 |
| `LOKI_SMART_RETRY=0` | 开启 | 对每次失败都进行重试，包括不可重试的失败 |
| `LOKI_SIMPLE=1` | 关闭 | 移除系统提示词中的指导部分（-78%，每次迭代约 1562 个 token）。实验性消融分支。 |

- **提示词缓存纪律。** 提示词在显式的 `[CACHE_BREAKPOINT]` 处分为缓存稳定的
  `<loki_system>` 前缀和易变的 `<dynamic_context>` 尾部；SDK judge 路径会在该分割处应用
  `cache_control`。任何新的始终启用的指令都必须放入前缀，否则每次迭代都会使缓存失效。
- **置信度突增复查。** 自报置信度跃升至接近最大值时，在完成信号阀强制停止运行前，必须额外进行一次验证。
  严格来说这是纯增量行为：突增只能增加一次验证，绝不能跳过、缩短或满足某个门槛。它不能延迟停滞阀，而且该延迟仅触发一次，因此反复突增的运行无法无限期推迟该阀。
- **可进行爬坡优化的目标评分。** 没有可度量目标的 `COMPLETION_PROMISE`（没有数字、比较运算符、命名指标或可验证产物）会收到一条提示建议，要求提供可检查的成功条件。该建议仅用于提示：绝不会阻止构建，也不会重写目标。目标缺失时，以及在永久模式下会抑制该提示，因为开放式目标正是该配置的选择。bash 和 TypeScript 路径逐字节镜像实现。
- **智能重试。** 对于已明确识别的永久性失败（凭据错误、未知模型、配额耗尽），会提前停止，而不是将重试额度消耗在必然重复的失败上。故障安全行为：无法识别的错误仍保持为 TRANSIENT，并完全按照之前的方式重试；速率限制明确排除在永久性失败集合之外。

## 运行时可观测性（v8.0.0）

- **SDK 能力降级事件。** SDK 加载或流式传输失败时，会向 `.loki/events.jsonl` 追加一条结构化的
  `capability_degraded` 记录（使用与 hook 事件相同的 `{type, source, timestamp, payload}` 封装），而不再只作为捕获输出中的文字存在，这样无人值守的操作员可以区分“SDK 无法加载”和“模型工作质量差”。该记录会写明 `fail_closed: true`，而不是留待推断。没有环境变量：这是操作员始终需要的信号。
- **首次预览耗时。** `.loki/app-runner/first-preview.json` 记录从运行开始到应用首次提供服务所经过的秒数。只写入一次，因此重启不会用一个令人误判的热启动数值覆盖真正缓慢的首次预览；没有基线时会完全跳过，而不是进行猜测。仅适用于 Bash 路径（app-runner 集成位于该路径中）。

## 首次运行体验（v7.29.0）

- **`loki quickstart`：** 引导完成首次构建的 4 个步骤（设置检查、单行想法、离线模板匹配、使用真实估算器数据进行计划审查）；一路按 Enter 完成所有步骤即可构建示例 Todo 应用；非 TTY/CI 环境退出 2，并给出自动化提示。
- **提供商安装选项：** 找不到任何提供商 CLI 时，doctor 以及 start/demo/quick/quickstart 的预检流程会提供安装 Claude Code。仅在交互式 TTY 中经过用户同意后执行；执行前会先打印将要执行的单条命令；通过 `claude auth login` 交接认证，并使用 `claude auth status` 确认已准备就绪。退出选项：`LOKI_NO_INSTALL_OFFER=1`。
- **`loki demo` 成本确认：** 估算值始终会在产生费用前打印；`--yes` 会跳过提示，但绝不会跳过估算。`loki plan` 会遵循 `LOKI_COMPLEXITY`，并诚实地注明被强制采用的层级。

---

## 并发与安全加固（v7.5.7 - v7.5.13）

连续三个补丁修复了跨进程和安全方面的漏洞。在默认流程中不会改变面向用户的行为；请通过所引用的路径进行验证。

- **跨进程文件锁**应用于追加或重写状态，因此并行运行、dashboard 和 MCP 不会破坏共享文件：门控计数器（`autonomy/run.sh` 门控计数器写入）、任务队列（`autonomy/run.sh` 队列读-改-写）、检查点索引（`autonomy/run.sh` 检查点索引更新）、`events.jsonl` 追加（`events/emit.sh` 和 `autonomy/run.sh` 中的事件发出路径）、人工干预信号文件（状态机文档中约第 8059 / 7897 行的 `autonomy/run.sh:check_human_intervention()`）。
- **MCP 路径验证** -- 对 `mcp/server.py` 工具的文件/路径参数进行规范化处理；如果路径逃逸出项目根目录，则会被拒绝（v7.5.8 修复的路径遍历问题）。
- **Dashboard 身份验证**现在要求用于 `dashboard/server.py` 中的 `/api/memory/*`、`/api/learning/*` 和 `/api/status`（此前这些读取路径无需身份验证）。
- **Bash 引用加固**覆盖 `autonomy/run.sh` 和 `autonomy/loki` -- 对命令替换和 `[ ]` 测试中的变量展开进行引用，以防止路径包含空格时发生单词拆分。

请参阅 `CHANGELOG.md` 中的 [7.5.7]、[7.5.8]、[7.5.13] 条目，了解每项修复的列表和审阅者签字确认。

---

## 已实现的功能

| 功能 | 添加版本 | 备注 |
|---------|-------|-------|
| 多提供商支持（4 个提供商） | v5.0.0 | claude、codex、cline、aider -- 参见 `providers/` |
| CONTINUITY.md 工作记忆 | v5.35.0 | 由 run.sh 自动管理，每次迭代都会更新 |
| 质量门控三审阅者系统 | v5.35.0 | `skills/quality-gates.md` 中有 5 名专业审阅者；在 run.sh 中执行 |
| 记忆系统（情景/语义/程序性） | v5.15.0 | `memory/` 中提供完整实现 |
| 上下文窗口跟踪 | v5.40.0 | Dashboard 仪表盘，以及 `GET /api/context` 中的按 agent 划分明细 |
| 通知触发器 | v5.40.0 | `GET/PUT /api/notifications/triggers` |
| GitHub 集成 | v5.42.2 | 导入、同步回写、创建 PR、导出。CLI：`loki github`，API：`/api/github/*` |
| 遗留系统修复 | v6.67.0 | `loki heal <path>` -- 将摩擦视为语义，提供特征测试 |
| 统一的 `loki start` | v6.84.0 | 自动检测输入是规范（PRD、OpenAPI 等）还是 issue |
| 受管控的 Agents（记忆镜像） | v7.2.0 | 通过 `LOKI_MANAGED_AGENTS` 选择启用 -- 参见 Managed Agents 部分 |
| Bun 运行时（第 1 阶段） | v7.3.0 | 只读命令通过 `bin/loki` 路由；设置 `LOKI_LEGACY_BASH=1` 可恢复原行为 |
| 第 1 阶段 RARV-C 闭环 | v7.5.x | 注入发现结果、使用真实评判器、自动学习、handoff.md |
| Anthropic SDK 路由 | v8.0.0 | 选择启用，默认关闭；使用一个开关 `LOKI_SDK_MODE` -- 参见 `references/sdk-mode.md` |
| Harness 智能能力 | v8.0.0 | 提示词缓存规范、置信度突增复查、目标评分、智能重试 |
| SDK 降级事件 | v8.0.0 | 在 `.loki/events.jsonl` 上生成结构化的 `capability_degraded` 记录 |
| 首次预览耗时 | v8.0.0 | `.loki/app-runner/first-preview.json`，仅写入一次（bash 路由） |
| 选择启用的构建分析 | v8.0.0 | `build_verified` 事件由严格的第二道门控控制，且仅允许白名单字段 |

## 计划中 / 进行中的功能

| 功能 | 目标 | 备注 |
|---------|--------|-------|
| Bun 运行时（第 2 阶段及以后） | 待定 | 迁移写入路径命令；跟踪于 `feat/bun-migration` |
| Managed Agents 多智能体路径 | 待定 | `LOKI_EXPERIMENTAL_MANAGED_*` 标志 —— 研究预览版，不适用于线上 API |
| 基准测试（HumanEval、SWE-bench） | 待定 | `benchmarks/` 中已有运行器脚本和数据集；尚未发布结果 |
| 移除 `loki run` | 下一个大版本 | 当前是 `loki start` 的已弃用别名 |

## 已弃用

| 项目 | 弃用于 | 备注 |
|------|---------------|-------|
| `loki run <issue>` | v6.84.0 | `loki start` 的别名。将在下一个大版本中移除。 |
| VSCode 扩展（`vscode-extension/`） | v7.2.0 | 不再积极维护；仪表板 Web UI 是受支持的前端。 |

---

**v9.22.11 | [Autonomi](https://www.autonomi.dev/) 旗舰产品 | 核心代码约 410 行**