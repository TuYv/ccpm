---
name: moai
description: >
  MoAI unified orchestrator for autonomous development. Routes natural
  language or subcommands (plan, run, sync, project, fix, loop, mx,
  feedback, review, clean, codemaps, gate, e2e, harness, goal, todo) to
  specialized agents.
allowed-tools: Agent, AskUserQuestion, Skill, TaskCreate, TaskUpdate, TaskList, TaskGet, Bash, Read, Write, Edit, Glob, Grep
argument-hint: "[subcommand] [args] | \"natural language task\""
---
## 执行前上下文

!`git status --porcelain 2>/dev/null || true`
!`git branch --show-current 2>/dev/null || true`

## 必需文件

.moai/config/sections/*.yaml

---

## 权威参考

所有工作流的规则和约束始终从以下来源加载。请勿在此处重复其内容：

- 核心身份、编排原则、代理目录：CLAUDE.md
- 质量门禁、安全边界：.claude/rules/moai/core/moai-constitution.md
- SPEC 工作流阶段、令牌预算：.claude/rules/moai/workflow/spec-workflow.md
- 开发方法论（DDD/TDD）：.claude/rules/moai/workflow/spec-workflow.md（Run Phase 部分）
- 代理定义：请参阅 CLAUDE.md 第 4 节。创建代理时，请使用 builder-harness 子代理（artifact_type=agent）。
- @MX 标签规则和协议：.claude/rules/moai/workflow/mx-tag-protocol.md

---

## 路由观察账本

在分派子命令或工作流时，编排器会在分派时通过 `moai harness ledger record` 将路由决策记录到仅追加的 routing-ledger（`.moai/state/routing-ledger.jsonl`）中——请求文本通过 stdin 传入，仅存储保护隐私的摘要，绝不会逐字存储用户文本。当已路由的流水线到达门禁点时，会通过 `moai harness ledger evidence` 追加机器证据（门禁退出结果、审计裁决、verify-log 路径）。结果绝不会作为输入提供；它仅根据机器证据最终确定。此观察功能为选择启用且采用故障开放机制——它绝不会阻塞路由。注意：记录取决于编排器在分派时实际调用 `moai harness ledger record`；当可观察性选择启用但未发出该记录调用时，账本将保持为空——这表示一次未记录的分派，而不是选择未启用时的空操作。不要将空的 routing-ledger 解读为“选择启用已禁用”。

---

## 意图路由器

### 原始用户输入

$ARGUMENTS

### 路由说明

[HARD] 使用下方严格的优先级顺序对上述原始用户输入进行路由。提取输入的第一个单词以匹配子命令。子命令关键字之后的所有文本均为要传递给匹配工作流的 CONTEXT——它不是路由信号，并且不得影响所选工作流。

## 执行模式标志（互斥）

- `--team`：强制使用 Phase 4 四模式目录中的代理团队（`.claude/rules/moai/workflow/orchestration-mode-selection.md` §A），但须通过其能力门禁
- `--solo`：强制使用串行模式（子代理——每个阶段使用单个顺序执行的代理）
- 无标志：编排器在 Phase 4 从完整的四模式目录中自动选择；复杂度自动选择阈值统一定义于 `orchestration-mode-selection.md` §B.1（机器来源：`workflow.yaml` `auto_selection`），此处不再重复

`--team` / `--solo` 标志是对该目录的强制覆盖；无标志时的默认行为通过目录决策树（§B）及其能力门禁确定。`--mode` 分派轴是一个独立的轴——请参阅 `orchestration-mode-selection.md` §G.1 中的对照表（对应关系，而非合并）。

### 优先级 1：显式子命令匹配

[硬性要求] 从上方的原始用户输入部分提取第一个单词。如果它与下方任何子命令（或其别名）匹配，请立即路由到对应工作流。不要分析剩余文本来进行路由——剩余文本是已匹配工作流的上下文：

[硬性要求] 混合语言防护：仅当满足以下任一条件时，才应用首词子命令匹配：(a) 输入完全由 ASCII/拉丁字符组成，或 (b) 消息以字面量 `/moai ` 斜杠形式为前缀。当消息在第一个词元之后包含非拉丁文字（韩文/日文/中文等）时，不要因开头的英文单词而立即路由——应将其视为可能嵌入的外来词，并继续执行优先级 3，对整条消息进行语义分类。理由：CJK 技术写作会在句首嵌入诸如 'goal'、'run'、'fix'、'plan' 等英文外来词；立即按首词路由会导致误判。

- **plan**（别名：spec）：SPEC 文档创建工作流
- **run**（别名：impl）：DDD/TDD 实现工作流（依据 quality.yaml constitution.development_mode）
- **sync**（别名：docs、pr）：文档同步和 PR 创建
- **project**（别名：init）：项目文档生成
- **feedback**（别名：fb）：创建 GitHub issue
- **fix**：一次性自动修复错误
- **loop**：迭代式自动修复，直至满足完成条件
- **mx**：扫描代码库中的 MX 标签并添加注解
- **review**（别名：code-review）：进行代码审查，包括安全性和 MX 标签合规性检查
- **clean**（别名：dead-code）：识别并安全移除死代码
- **codemaps**：在 `.moai/project/codemaps/` 中生成架构文档
- **gate**（别名：check、pre-commit）：轻量级提交前质量门禁（lint+format+type-check+test）
- **e2e**（别名：e2e-test、end-to-end）：多平台端到端测试（Web/移动端/桌面端），支持自动检测项目类型并优先选择 CLI 工具链
- **harness**（别名：hrn）：harness 生命周期管理——学习生命周期动词（status / apply / rollback &lt;date&gt; / disable）+ v4 生命周期动词（list / edit / remove / doctor），全部通过统一的 `moai harness` Go 二进制 Cobra 子命令树进行分发；斜杠命令是文档中面向用户的入口点
- **goal**：由条件声明的通用智能体循环——设定完成条件（`/moai goal "<condition>"`）、检查状态、清除或恢复；在每轮结束时由 `stop-goal` Stop hook 进行评估
- **todo**（别名：backlog）：待办队列——斜杠命令界面涵盖两种操作：添加事项（`/moai todo "<description>"`）和列出队列（不带参数的 `/moai todo`）。选择下一张卡片和移除卡片是仅限 CLI 的动词，分别以 `moai todo next [<n>]` 和 `moai todo done <n>` 运行；这是操作者进入看板的入口点

### 优先级 2：SPEC-ID 检测

仅当优先级 1 未匹配时：检查原始用户输入是否包含匹配 SPEC-XXX 的模式（例如 SPEC-AUTH-001）。如果找到，则自动路由到 **run** 工作流。该 SPEC-ID 将成为 DDD/TDD 实现的目标。

### 优先级 3：自然语言分类

仅当优先级 1 和优先级 2 均未匹配时：将整个原始用户输入的意图作为自然语言进行分类。当第一个单词与已知子命令匹配时，绝不会进入此优先级。

[硬性要求] 下面列出的提示词是**英文示例**，而非字面匹配要求。应针对任何 `conversation_language` 进行语义意图分类——表达相同意图的韩语、日语、中文或其他语言请求，都应路由到相同工作流。不得要求输入中必须出现对应的英文字面词元。

- 规划和设计类语言（设计、架构、计划、规格、需求、功能请求）路由到 **plan**
- 质量门禁类语言（格式化、检查、预提交、质量门禁）路由到 **gate**
- E2E 和用户旅程测试类语言（e2e、端到端测试、浏览器测试、移动应用测试、桌面应用测试、用户旅程）路由到 **e2e**——这些是语义示例；任何 `conversation_language` 中表达 E2E 测试意图的请求都应路由到相同工作流
- 安全类语言（安全、审计、owasp、漏洞、注入、xss、csrf）路由到 **review**（使用 `--security` 范围）
- 代码审查类语言（审查我的代码、代码审查、检查我的 PR、查看我的变更）路由到 **review**
- 错误和修复类语言（修复、错误、缺陷、损坏、失败、lint）路由到 **fix**
- 迭代和重复类语言（持续修复、直到完成、重复、迭代、所有错误）路由到 **loop**
- 死代码和清理类语言（死代码、未使用的代码、安全移除、清理、孤立代码）路由到 **clean**
- 文档类语言（编写文档、同步、文档、readme、changelog、PR）路由到 **sync** 或 **project**
- 架构图谱类语言（架构图、代码图谱、依赖关系图、结构文档）路由到 **codemaps**
- 反馈和错误报告类语言（报告、反馈、建议、问题）路由到 **feedback**
- MX 标签类语言（mx 标签、注解、代码上下文、遗留代码注解）路由到 **mx**
- 待办事项类语言（添加到待办列表、记下来以后再做、我接下来应该做什么、提醒我）路由到 **todo**——这些是语义示例；任何 `conversation_language` 中表达“将此事项加入队列，但现在不要开始”的请求都应路由到相同工作流
- 具有明确范围的实现类语言（实现、构建、创建、添加、开发）路由到 **moai**（默认自主执行）

### 优先级 4：默认行为

如果经过所有优先级检查后意图仍然模糊，请使用 AskUserQuestion 展示最匹配的 2-3 个工作流，让用户选择。

如果意图显然是开发任务，但没有特定的路由信号，则默认使用 **moai** 工作流（plan -> run -> sync 流水线）进行完全自主执行。

---

## 工作流快速参考

### plan - 创建 SPEC 文档

目的：使用 GEARS 格式，通过“研究-规划-注解”循环创建全面的规格文档。
阶段：深度研究（research.md）-> SPEC 规划 -> 注解循环（1-6 次迭代）-> 创建 SPEC -> 独立审查（plan-auditor）
代理：manager-spec（主要）、Explore（研究）、plan-auditor（质量门禁）、manager-git（条件性使用）
技能：moai-workflow-spec、moai-foundation-thinking（依据 delegation.yaml）
标志：--branch、--resume SPEC-XXX、--issue（选择启用；根据延迟创建分支的选择启用策略，默认跳过创建 GitHub Issue）
有关详细的编排说明：阅读 ${CLAUDE_SKILL_DIR}/workflows/plan.md

### run - DDD/TDD 实现

目的：通过配置的开发方法论实现 SPEC 要求。
代理：manager-develop（根据 quality.yaml 设置 cycle_type=ddd|tdd，主要代理）、manager-git
技能：moai-workflow-tdd、moai-workflow-ddd（根据 delegation.yaml；由 cycle_type 选择）+ 根据任务注入领域相关的 moai-ref-*
标志：--resume SPEC-XXX、--team（实验性功能 — 已重新允许 Agent Teams；请参阅执行模式标志）
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/run.md

### sync - 文档同步和 PR

目的：使文档与代码变更保持同步并准备拉取请求。
代理：manager-docs（主要代理）、sync-auditor（质量门禁）、manager-git
技能：moai-workflow-project（根据 delegation.yaml）
模式：auto、force、status、project。标志：--merge、--skip-mx
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/sync.md

### gate - 提交前质量门禁

目的：轻量级提交前质量检查，并行运行 lint、format、type-check 和测试。它也作为自动预检查集成到 run（阶段 15）和 sync（阶段 1）工作流中。
代理：直接执行（不委派给代理）
标志：--fix、--staged、--file PATH
集成：由 run 工作流（阶段 15）和 sync 工作流（阶段 1）自动调用，并采用 --fix 行为。
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/gate.md

### e2e - 多平台端到端测试

目的：在 Web、移动端和桌面应用程序中创建并运行 E2E 测试，支持项目类型自动检测、CLI 优先的工具链选择（Playwright、Maestro、Playwright-Electron、WebdriverIO + tauri-service），以及最小化 token 消耗的执行方式。
代理：e2e-tester（主要代理 — 检测、旅程映射、脚本创建、执行、录制）
技能：moai-foundation-quality、moai-ref-testing-pyramid（根据 delegation.yaml）
标志：--tool、--platform、--record、--url、--journey、--headless、--browser、--timeout、--retry
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/e2e.md

### goal - 条件声明式代理循环

目的：设定完成条件（机械命令 + 模型声明）；`stop-goal` Stop-hook 评估器会阻止每一轮结束，直到满足条件或达到轮次上限（默认为 30）。
动词：`/moai goal "<condition>"`（注册 + 启用）、`status [--all]`、`clear`、`resume`。
推进模式：自主（默认）与半自主 — 在实现启动审批时选择；两种模式下门禁均为强制要求。
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/goal.md

### todo - 待办队列

目的：保存操作者接下来想要处理的工作。`backlog` 没有归属会话，因此将事项纳入看板始终是操作者的行为 — 这就是执行该操作的界面。
动词 — 斜杠命令界面：`/moai todo "<description>"`（追加）、不带参数的 `/moai todo`（列出）。仅限 CLI：`moai todo next`（输出队列中的卡片；`moai todo next <n> [--spec <SPEC-ID>]` 将其中一个标记为已选取 — 选取操作本身通过 AskUserQuestion 呈现）、`moai todo done <n>`（移除）。
状态：`.moai/state/kanban/backlog.json` — 项目本地文件，不提交，采用原子写入。
选取权属于操作者：绝不预先选择，绝不根据推断出的优先级重新排序，绝不从 TODO 注释或 issue 中自动填充。
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/todo.md

### fix - 自动修复错误

目的：自主检测并修复 LSP 错误、lint 问题和类型错误。
代理：manager-develop（cycle_type=autofix）、具有领域白名单（修复）的 Agent(general-purpose)
技能：moai-workflow-ddd（依据 delegation.yaml）+ 根据任务注入领域 moai-ref-*
标志：--dry、--sequential、--level N、--resume、--team（实验性功能——重新允许 Agent Teams；参见执行模式标志）
有关详细编排流程：阅读 ${CLAUDE_SKILL_DIR}/workflows/fix.md

### loop - 迭代式自动修复

目的：重复修复问题，直到满足完成条件或达到最大迭代次数。
代理：manager-develop（cycle_type=autofix）、具有领域白名单的 Agent(general-purpose)
技能：moai-workflow-loop（依据 delegation.yaml）+ 根据任务注入领域 moai-ref-*
标志：--max N、--auto-fix、--seq
有关详细编排流程：阅读 ${CLAUDE_SKILL_DIR}/workflows/loop.md

### mx - MX 标签扫描与注解

目的：扫描代码库并添加 @MX 代码级注解，为 AI 代理提供上下文。
代理：Explore（扫描）、具有后端范围的 Agent(general-purpose)（注解）
标志：--all、--dry、--priority P1-P4、--force、--team（实验性功能——重新允许 Agent Teams；参见执行模式标志）
有关详细编排流程：阅读 ${CLAUDE_SKILL_DIR}/workflows/mx.md

### review - 代码审查

目的：从安全性、性能、质量和 UX 等多个视角进行代码审查。
代理：sync-auditor（审查）、具有安全范围的 Agent(general-purpose)
技能：moai-foundation-quality、moai-ref-owasp-checklist（依据 delegation.yaml；根据各审查视角注入相应的参考技能）
标志：--staged、--branch、--security、--team（实验性功能——重新允许 Agent Teams；参见执行模式标志）
有关详细编排流程：阅读 ${CLAUDE_SKILL_DIR}/workflows/review.md

### clean - 移除死代码

目的：识别并安全移除未使用的代码，同时通过测试进行验证。
代理：manager-develop、具有重构范围的 Agent(general-purpose)
技能：moai-workflow-ddd（依据 delegation.yaml）
标志：--dry、--safe-only、--file PATH
有关详细编排流程：阅读 ${CLAUDE_SKILL_DIR}/workflows/clean.md

### codemaps - 架构文档

目的：扫描代码库并生成架构文档。
代理：Explore、manager-docs
标志：--force、--area AREA
有关详细编排流程：阅读 ${CLAUDE_SKILL_DIR}/workflows/codemaps.md

### (default) - MoAI 自主工作流

目的：完整的自主研究 -> 规划 -> 注解 -> 运行 -> 同步流水线。
阶段：并行探索（research.md）-> 生成 SPEC -> 注解周期 -> 实现 -> 同步
代理：Explore、manager-spec、plan-auditor（质量门禁）、manager-develop、manager-docs、manager-git、sync-auditor（质量门禁）
技能：moai-workflow-spec、moai-workflow-tdd（依据 delegation.yaml）+ 根据任务注入领域 moai-ref-*
标志：--loop、--max N、--branch、--pr、--resume SPEC-XXX、--team（实验性功能——重新允许 Agent Teams；参见执行模式标志）、--solo、--issue（选择启用；根据后期分支选择启用策略，默认跳过创建 GitHub Issue）
有关详细编排流程：阅读 ${CLAUDE_SKILL_DIR}/workflows/moai.md

### project - 项目文档

目的：通过分析现有代码库生成项目文档。
代理：Explore、manager-docs、具有 devops 作用域的 Agent(general-purpose)（可选）
技能：moai-workflow-project（根据 delegation.yaml）
输出：.moai/project/ 中的 product.md、structure.md、tech.md
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/project.md

### feedback - GitHub Issue 创建

目的：收集用户反馈并创建 GitHub Issue。
代理：orchestrator-direct（通过 gh CLI 记录反馈）
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/feedback.md

### harness - Harness 生命周期 + 自然语言构建（基于参数的分支）

此单一 `harness` 子命令根据 `$ARGUMENTS` 的第一个标记分派到以下两个工作流之一（基于参数的路由——不会引入第二个命令）。在执行任何工作流特定逻辑之前应用路由规则：

- **保留动词**（`status` / `apply` / `rollback` / `disable`）→ 路由到现有的 **harness 学习生命周期**工作流（下方分支 A）。此路径保持不变。
- **保留动词**（`list` / `edit` / `remove` / `doctor`）→ 路由到 **harness-v4 生命周期**处理程序（下方分支 A.1）。这些操作通过 `moai harness <verb>` Go 二进制子命令列举、编辑、原子移除 harness-v4 条目，并运行引用完整性冒烟门禁（`doctor`）。
- **其他任何内容**（自然语言 harness 创建请求，例如 "build a harness for CLI template development"）→ 路由到 **harness 构建入口**工作流（下方分支 B）。

#### 分支 A — harness 学习生命周期（保留动词：status / apply / rollback / disable）

目的：通过斜杠命令路径向用户呈现 harness 学习子系统（观察器、4 层提案阶梯、5 层安全流水线）。生命周期动词（status / apply / rollback / disable）通过统一的 `moai harness` Go 二进制 Cobra 子命令树进行分派，由其执行文件系统操作。第 4 层应用由编排器发出的 AskUserQuestion 进行门禁控制。
技能：moai-harness-learner（第 4 层呈现配套技能）。项目特定的 harness 生成由 v4 Builder（`builder-harness` 代理，分支 B）处理。
动词：status（层级分布 + 遥测）| apply（下一个第 4 层提案 → AskUserQuestion → 5 层流水线 → 快照 + 写入）| rollback &lt;YYYY-MM-DD&gt;（恢复快照）| disable（设置 learning.enabled: false）
产物：`.moai/harness/usage-log.jsonl`、`.moai/harness/proposals/`、`.moai/harness/learning-history/snapshots/`、`.moai/harness/learning-history/applied/`、`.moai/harness/learning-history/frozen-guard-violations.jsonl`
权威 SPEC：harness 基础策略（取代 V3R3-HARNESS-001、V3R3-HARNESS-LEARNING-001、V3R3-PROJECT-HARNESS-001）
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/harness.md

#### 分支 A.1 — harness-v4 生命周期（保留动词：list / edit / remove / doctor）

目的：管理 harness-v4 条目——列举已构建的 harness、定位其 manifest + specialist 文件以进行编辑、以原子方式移除 harness 及其所有产物，或运行引用完整性冒烟门禁。这四个动词分派到执行文件系统工作的 `moai harness <verb>` Go 二进制子命令（扫描 `.claude/commands/harness/*.md` 并与 `manifest.json` 联接；通过失败关闭式孤立项预防实现原子移除；doctor 交叉检查 manifest/specialist/skill 文件是否存在）。
动词：list（列举所有 harness：名称 + 领域 + 入口命令，以及 manifest 声明的计划——间隔 + 机制；没有计划的 harness 与引入计划之前的基线呈现方式完全相同）| edit &lt;name&gt;（显示用于编辑的 manifest + specialist + skill 路径——manifest 是 SSOT）| remove &lt;name&gt;（原子移除 command + workflow + specialists + skills + manifest；若缺少任何产物则以失败关闭方式处理；当 manifest 声明了计划时，输出一条注销通知，其中包含声明的机制——cron 使用 CronDelete，loop 使用会话作用域的循环取消——该信息在删除前从 manifest 计算得出）| doctor（引用完整性冒烟门禁：验证每个已构建 harness 的 manifest/specialist/skill 文件均存在且能正确交叉引用；无效的 schedule 声明是一项 ERROR 严重级别的发现）
CLI：`moai harness list [--json]`、`moai harness edit <name> [--json]`、`moai harness remove <name>`、`moai harness doctor`（均支持 `--project-root`）
产物：`.claude/commands/harness/<name>.md`（轻量包装命令）、`.claude/commands/harness/<name>/manifest.json`（SSOT）、`.claude/workflows/hns-<name>-run.js`（Runner）、`.claude/agents/harness/hns-<name>*-specialist.md`（specialists）、`.claude/skills/hns-<name>*/`（配套 skills）
命名空间：`.claude/commands/harness/`、`.claude/workflows/hns-*.js`、`.claude/agents/harness/` 和 `.claude/skills/hns-*/` 均为用户所有——`moai update` 会保留它们（必要时备份，绝不覆盖）。带有 `harness-` 或 `my-harness-` 前缀的旧版生成内容同样会被保留（基于识别的向后兼容性）；Builder 仅生成 `hns-` 名称。

#### 分支 B — harness 构建入口（自然语言请求）

目的：通过上下文优先发现（提取领域 / 目标 / 约束 / 范围），将自然语言形式的 harness 创建请求转化为具体的 harness；推导 harness `<name>`（名称从请求中推导得出——并非由用户静态提供）；由编排器明确批准；然后转换到编排器直接执行的 Builder（4 个信号驱动阶段：ANALYZE / PLAN / GENERATE / ACTIVATE）。当意图清晰度低于 100% 时，编排器必须执行 AskUserQuestion 苏格拉底式问答轮次（每轮最多 4 个问题）。
Agent：builder-harness（v4 Builder——特定于项目的 harness 生成）
Builder：编排器直接处理（而非动态工作流脚本）——该入口的阶段 0-3 会移交给 `${CLAUDE_SKILL_DIR}/workflows/harness-builder.md`，由其执行四阶段创建逻辑。编排器直接持有 PLAN→GENERATE 的 AskUserQuestion 批准门禁；该门禁轮次还包含重复执行问题（可选的清单 `schedule`，仅发现型定时运行），而 ACTIVATE 会在冒烟测试门禁通过后注册声明的计划。若请求同时引用现有 harness 并包含调度意图，则会路由到入口工作流的计划改造分支（先于名称冲突处理进行评估），而不是进入创建流水线。
有关详细编排流程：请阅读 ${CLAUDE_SKILL_DIR}/workflows/harness-build-entry.md

---

## 执行指令

激活此 Skill 后，按顺序执行以下步骤：

步骤 1 - 解析参数：
从原始用户输入中提取子命令关键字和标志。可识别的全局标志：--resume [ID]、--seq、--team、--solo。同时检测输入文本中的 `ultrathink` 关键字。

**关键：深度分析模式：**
- 检测到 `ultrathink` 关键字 → 激活 Claude 原生扩展推理（xhigh effort 模式）。这是 Claude 的原生行为，不依赖 MCP。

步骤 1.5 - 标志与子命令兼容性验证：
[硬性要求] 解析子命令和标志（步骤 1）后，必须在路由之前验证标志与子命令的兼容性。如果检测到禁止的组合，立即停止所有后续处理，并使用用户的 conversation_language 输出错误。不得继续执行步骤 2。

禁止的标志与子命令组合：

| 标志 | 允许的子命令 | 禁止的子命令 |
|------|---------------------|------------------------|
| `--branch` | `plan`、默认（自主模式） | `run`、`sync` |

原因：`--branch` 会在 SPEC 初始化时创建功能分支，因此 `/moai run` 和 `/moai sync` 必须在 `plan` 已建立的分支上运行——在生命周期中途重新创建该分支会破坏 SPEC 生命周期，因此会在路由器层被拒绝。

已退役的 `--worktree` 标志将单独处理：携带该标志的请求不属于禁止组合错误，而属于使用已退役标志的情况。请告知用户，plan 不再创建工作区，替代方式是先进入一个工作区。

错误消息模板（韩语 conversation_language；替换为实际的标志和子命令）：
```
에러: --branch 플래그는 /moai plan 전용입니다.
/moai run 과 /moai sync 는 plan 단계에서 만든 브랜치를 그대로 씁니다.

올바른 사용법:
  /moai plan SPEC-XXX --branch    (브랜치 생성)
  /moai run SPEC-XXX              (기존 브랜치 재사용)
  /moai sync SPEC-XXX             (기존 브랜치 재사용)

--branch 플래그를 뺀 형태로 다시 실행하세요.
```

已弃用标志的提示消息（`--worktree`）：
```
안내: --worktree 플래그는 폐기됐습니다. plan 은 더 이상 작업 공간을 만들지 않습니다.

격리된 공간에서 작업하려면 먼저 들어간 뒤 plan 을 실행하세요:
  moai cc -w <이름>              (그 자리에서 진입)
  moai cg -w <이름> --spawn      (새 tmux 창, 현재 세션 유지)
  /moai plan "<설명>"
```

对于英语（`en` conversation_language），翻译该消息；结构保持完全一致。

步骤 2 - 路由到工作流：
应用意图路由器（优先级 1 至优先级 4）来确定目标工作流。如果存在歧义，使用 AskUserQuestion 向用户澄清。

步骤 2.2 - 记录路由决策：
路由解析完成后（步骤 2），立即将路由决策记录到仅追加的路由账本（`.moai/state/routing-ledger.jsonl`），以便能够观察自动调用。运行：

```
echo "<raw request text>" | moai harness ledger record --subcommand <matched> --mode <phase-4-mode> --tier <tier> --level <harness-level> --session <session-id>
```

请求文本通过 stdin 传入，并且只会存储保护隐私的摘要，绝不会逐字存储用户文本（策略来源：上文的 § Routing Observation Ledger）。此步骤为选择性启用且采用故障开放机制：如果 PATH 中不存在 `moai` CLI，或者命令以非零状态退出，则不记录任何内容并继续——它绝不会阻塞路由、绝不会限制工作流，也绝不会触发重试循环。未记录的分派属于观测缺口，而不是错误。

步骤 2.5 - 项目文档检查：
在执行 plan、run、sync、fix、loop 或默认工作流之前，通过检查 `.moai/project/product.md` 来验证项目文档是否存在。如果 product.md 不存在，使用 AskUserQuestion 以用户的 conversation_language 询问用户：

问题：未找到项目文档。是否要先创建项目文档？
选项：
- 创建项目文档（推荐）：通过引导式访谈生成 product.md、structure.md 和 tech.md。这有助于 MoAI 理解你的项目上下文，从而在后续所有工作流中提供更好的结果。
- 跳过并继续：在没有项目文档的情况下继续。MoAI 对你的项目将掌握较少的上下文。

此检查不适用于：project、feedback 子命令。

[硬性要求] 面向初学者的选项设计：
MoAI 工作流中的所有 AskUserQuestion 调用都必须遵循以下规则：
- 第一个选项必须始终是推荐选项，并明确标注“（推荐）”后缀
- 每个选项都必须包含详细说明，解释其作用及影响

步骤 2.8 - 需求分析与完成条件：
在加载工作流主体（步骤 3）之前，为已路由的请求生成一条需求分析记录：

1. **需求摘要**（1-3 句话）：用编排器自己的话重述用户提出的请求。
2. **完成条件**：表示“完成”的最终状态。如果该条件可由机器验证（测试退出代码、lint 无错误状态、grep 计数、有界轮次），则根据 `.claude/rules/moai/workflow/goal-directive.md`，以与 `/moai goal` 兼容的形式表达（一个可衡量的最终状态 + 明确的检查方式 + 边界条款）。不要创建并行的评估器：当目标引擎可用时（hooks 已启用——评估器是 `stop-goal` Stop hook），通过 `/moai goal` 启用该条件；否则，编排器在每一轮中评估完全相同的条件文本（优雅降级——不引入新机制）。
3. **流水线契约**：`full-pipeline`（默认自然语言路由——run 阶段完成后自动衔接到 sync）或 `single-phase`（显式 `run`/`sync` 子命令——将衔接作为“（推荐）”的下一步选项提供，绝不静默触发）。
4. **编排形态预信号**：Phase 4 的四模式选择（`orchestration-mode-selection.md` §A）的早期输入——在此处注明，在 Phase 4 决定。

简单范围豁免：对于 `feedback`、`gate`、`codemaps`、`sync` 状态模式，以及符合 `askuser-protocol.md` § 歧义触发条件与例外的任何 Stage-1-Clarify 例外，完全跳过此步骤。
苏格拉底式优先顺序：当意图清晰度低于 100% 时，应先进行苏格拉底式访谈（依照 `askuser-protocol.md`），然后再推导完成条件——该条件编码的是已充分澄清的意图，绝非猜测。
推导出的完成条件绝不授权自主进入运行阶段——在 plan→run 边界处，仍必须获得实施启动批准。

步骤 3 - 加载工作流详情：
读取目标子命令对应的 `workflows/<name>.md`。（Agent Teams 静态层已停用；根据 `.claude/rules/moai/workflow/orchestration-mode-selection.md`，`--team` 标志会回退到子代理模式——不存在单独的 `team/<name>.md` 工作流文件。）

步骤 4 - 读取配置：
根据需要，从 .moai/config/sections/*.yaml 分区文件中加载相关配置。

步骤 5 - 初始化任务跟踪：
使用 TaskCreate 注册发现的工作项，并将其状态设为 pending。

步骤 6 - 执行工作流阶段：
遵循特定工作流的阶段说明。通过 Agent() 将所有实施工作委派给适当的代理。在指定的检查点通过 AskUserQuestion 获取用户批准。每次生成实施/审查 Agent() 之前，应用 `.claude/rules/moai/workflow/skill-routing.md` §1：根据委派映射（`.moai/config/sections/delegation.yaml`）注入 0-3 行 `At start, invoke Skill("<name>") for <reason>`。

步骤 7 - 跟踪进度：
随着工作推进，使用 TaskUpdate 更新任务状态（pending 到 in_progress 再到 completed）。

步骤 8 - 展示结果：
使用 Markdown 格式，以用户的 conversation_language 向其展示结果。

步骤 9 - 声明完成：
当所有工作流阶段均成功完成时，在完成报告（横幅/正文）中说明工作流已完成，使结果明确无歧义。

步骤 10 - 引导后续步骤：
使用 AskUserQuestion，根据已完成的工作流向用户提供合理的后续操作。

---

版本：2.8.0
最后更新：2026-07-07