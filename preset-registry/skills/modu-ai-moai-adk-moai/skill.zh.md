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

- 核心身份、编排原则、智能体目录：CLAUDE.md
- 质量门禁、安全边界：.claude/rules/moai/core/moai-constitution.md
- SPEC 工作流阶段、令牌预算：.claude/rules/moai/workflow/spec-workflow.md
- 开发方法论（DDD/TDD）：.claude/rules/moai/workflow/spec-workflow.md（Run Phase 章节）
- 智能体定义：参见 CLAUDE.md 第 4 节。创建智能体时，请使用 builder-harness 子智能体（artifact_type=agent）。
- @MX 标签规则和协议：.claude/rules/moai/workflow/mx-tag-protocol.md

---

## 路由观测账本

在分派子命令或工作流时，编排器会在分派时通过 `moai harness ledger record` 将路由决策记录到仅追加的 routing-ledger（`.moai/state/routing-ledger.jsonl`）中——请求文本通过 stdin 传入，并且仅存储保护隐私的摘要，绝不会逐字存储用户文本。当路由后的流水线到达门禁点时，会通过 `moai harness ledger evidence` 追加机器证据（门禁退出结果、审计裁定、verify-log 路径）。结果绝不会作为输入提供；它只能根据机器证据最终确定。此观测功能是可选启用且采用失败开放机制——它绝不会阻塞路由。注意：记录取决于编排器在分派时是否实际调用 `moai harness ledger record`；当观测功能选择启用但未发出该记录调用时，账本将保持为空——这表示一次未记录的分派，而不是选择关闭时的空操作。不要将空的 routing-ledger 解读为“选择启用功能已禁用”。

---

## 意图路由器

### 原始用户输入

$ARGUMENTS

### 路由说明

[HARD] 按照以下严格优先级顺序对上方的原始用户输入进行路由。提取输入的第一个单词以匹配子命令。子命令关键字之后的所有文本都是要传递给匹配工作流的上下文——它不是路由信号，并且不得影响所选工作流。

## 执行模式标志（互斥）

- `--team`：强制使用 Phase 4 四模式目录（`.claude/rules/moai/workflow/orchestration-mode-selection.md` §A）中的智能体团队，但受其能力门禁约束
- `--solo`：强制串行（子智能体——每个阶段使用单个顺序执行的智能体）
- 无标志：编排器在 Phase 4 从完整的四模式目录中自动选择；复杂度自动选择阈值统一在 `orchestration-mode-selection.md` §B.1 中说明（机器源：`workflow.yaml` `auto_selection`），此处不再重复

`--team` / `--solo` 标志是对该目录的强制覆盖；无标志时的默认行为通过目录决策树（§B）及其能力门禁进行解析。`--mode` 分派轴是一个独立的轴——参见 `orchestration-mode-selection.md` §G.1 中的对照表（对应关系，而非合并）。

### 优先级 1：显式子命令匹配

[硬性要求] 从上方的原始用户输入部分提取第一个单词。如果它与下方任一子命令（或其别名）匹配，请立即路由到对应工作流。不要分析剩余文本来进行路由——这些文本是已匹配工作流的上下文：

[硬性要求] 混合语言防护：仅当以下条件之一成立时，才应用首词子命令匹配：(a) 输入完全由 ASCII/拉丁字符组成，或 (b) 消息以字面量 `/moai ` 斜杠形式作为前缀。当消息在第一个词元之后包含非拉丁文字（韩文/日文/中文等）时，不要根据开头的英文单词立即路由——应将其视为可能嵌入的外来词，并继续执行优先级 3，对整条消息进行语义分类。理由：CJK 技术写作会在句首嵌入诸如 'goal'、'run'、'fix'、'plan' 等英文外来词；立即执行首词路由会导致误判。

- **plan**（别名：spec）：SPEC 文档创建工作流
- **run**（别名：impl）：DDD/TDD 实现工作流（依据 quality.yaml constitution.development_mode）
- **sync**（别名：docs、pr）：文档同步和 PR 创建
- **project**（别名：init）：项目文档生成
- **feedback**（别名：fb）：创建 GitHub issue
- **fix**：单次自动修复错误
- **loop**：迭代式自动修复，直至满足完成条件
- **mx**：扫描代码库并添加 MX 标签注释
- **review**（别名：code-review）：进行代码审查，包括安全性和 MX 标签合规性检查
- **clean**（别名：dead-code）：识别并安全移除死代码
- **codemaps**：在 `.moai/project/codemaps/` 中生成架构文档
- **gate**（别名：check、pre-commit）：轻量级提交前质量门禁（lint+format+type-check+test）
- **e2e**（别名：e2e-test、end-to-end）：多平台端到端测试（Web/移动端/桌面端），支持自动检测项目类型并优先选择 CLI 工具链
- **harness**（别名：hrn）：harness 生命周期管理——学习生命周期动词（status / apply / rollback &lt;date&gt; / disable）+ v4 生命周期动词（list / edit / remove / doctor），全部通过统一的 `moai harness` Go 二进制文件 Cobra 子命令树进行分派；斜杠命令是文档中面向用户的入口
- **goal**：条件声明式通用智能体循环——设定完成条件（`/moai goal "<condition>"`）、检查状态、清除或恢复；由 `stop-goal` Stop hook 在每轮结束时进行评估
- **todo**（别名：backlog）：待办队列——斜杠命令界面包含两种操作：添加条目（`/moai todo "<description>"`）和列出队列（不带参数的 `/moai todo`）。选取下一张卡片和移除卡片是仅限 CLI 的动词，分别通过 `moai todo next [<n>]` 和 `moai todo done <n>` 运行；这是操作者进入看板的入口

### 优先级 2：SPEC-ID 检测

仅当优先级 1 未匹配时：检查原始用户输入是否包含与 SPEC-XXX 匹配的模式（例如 SPEC-AUTH-001）。如果找到，则自动路由到 **run** 工作流。该 SPEC-ID 将成为 DDD/TDD 实现的目标。

### 优先级 3：自然语言分类

仅当优先级 1 和优先级 2 均未匹配时：将完整 Raw User Input 的意图按自然语言进行分类。当第一个单词与已知子命令匹配时，永远不会进入此优先级。

[强制] 下方列出的提示词是**英文示例**，而非字面匹配要求。对于任何 `conversation_language`，都应按语义对意图进行分类——表达相同意图的韩语、日语、中文或其他语言请求应采用完全相同的路由。不得要求请求中出现对应的英文字面词元。

- 规划和设计类语言（design、architect、plan、spec、requirements、feature request）路由至 **plan**
- 质量门禁类语言（format、check、pre-commit、quality gate）路由至 **gate**
- E2E 和用户旅程测试类语言（e2e、end-to-end test、browser test、mobile app test、desktop app test、user journey）路由至 **e2e**——这些是语义示例；任何以 conversation_language 表达 E2E 测试意图的请求均采用完全相同的路由
- 安全类语言（security、audit、owasp、vulnerability、injection、xss、csrf）路由至 **review**（使用 `--security` 范围）
- 代码审查类语言（review my code、code review、check my PR、look at my changes、take a look at my changes）路由至 **review**
- 错误和修复类语言（fix、error、bug、broken、failing、lint）路由至 **fix**
- 迭代和重复类语言（keep fixing、until done、repeat、iterate、all errors）路由至 **loop**
- 无用代码和清理类语言（dead code、unused code、safely remove、cleanup、orphaned code）路由至 **clean**
- 文档类语言（document、sync、docs、readme、changelog、PR）路由至 **sync** 或 **project**
- 架构图谱类语言（architecture map、code maps、dependency graph、structure documentation）路由至 **codemaps**
- 反馈和错误报告类语言（report、feedback、suggestion、issue）路由至 **feedback**
- MX 标签类语言（mx tag、annotation、code context、legacy annotate）路由至 **mx**
- 待办事项类语言（add to the backlog、note this for later、what should I work on next、remind me to）路由至 **todo**——这些是语义示例；任何以 conversation_language 表达“将此事项加入队列，但现在不要开始处理”意图的请求均采用完全相同的路由
- 具有明确范围的实现类语言（implement、build、create、add、develop）路由至 **moai**（默认自主执行）

### 优先级 4：默认行为

如果经过所有优先级检查后意图仍不明确，请使用 AskUserQuestion 展示最匹配的 2-3 个工作流，让用户进行选择。

如果意图显然是开发任务，但没有特定的路由信号，则默认使用 **moai** 工作流（plan -> run -> sync 流水线）进行完全自主执行。

---

## 工作流快速参考

### plan - 创建 SPEC 文档

目的：使用 GEARS 格式和“研究-规划-标注”循环创建全面的规范文档。
阶段：深度研究（research.md）-> SPEC 规划 -> 标注循环（1-6 次迭代）-> 创建 SPEC -> 独立审查（plan-auditor）
代理：manager-spec（主要）、Explore（研究）、plan-auditor（质量门禁）、manager-git（条件性）
技能：moai-workflow-spec、moai-foundation-thinking（依据 delegation.yaml）
标志：--branch、--resume SPEC-XXX、--issue（选择启用；根据延迟创建分支的选择启用策略，默认跳过创建 GitHub Issue）
有关详细的编排流程：请阅读 ${CLAUDE_SKILL_DIR}/workflows/plan.md

### run - DDD/TDD 实现

目的：通过配置的开发方法论实现 SPEC 要求。
智能体：manager-develop（根据 quality.yaml 设置 cycle_type=ddd|tdd，主要）、manager-git
技能：moai-workflow-tdd、moai-workflow-ddd（根据 delegation.yaml；按所选 cycle_type）+ 根据任务注入领域 moai-ref-*
标志：--resume SPEC-XXX、--team（实验性 — 重新允许使用智能体团队；请参阅执行模式标志）
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/run.md

### sync - 文档同步和 PR

目的：使文档与代码变更保持同步，并准备拉取请求。
智能体：manager-docs（主要）、sync-auditor（质量门禁）、manager-git
技能：moai-workflow-project（根据 delegation.yaml）
模式：auto、force、status、project。标志：--merge、--skip-mx
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/sync.md

### gate - 提交前质量门禁

目的：轻量级提交前质量检查，并行运行 lint、format、type-check 和 tests。也作为自动预检查集成到 run（阶段 15）和 sync（阶段 1）工作流中。
智能体：直接执行（不委派给智能体）
标志：--fix、--staged、--file PATH
集成：由 run 工作流（阶段 15）和 sync 工作流（阶段 1）自动调用，并采用 --fix 行为。
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/gate.md

### e2e - 多平台端到端测试

目的：通过项目类型自动检测、CLI 优先的工具链选择（Playwright、Maestro、Playwright-Electron、WebdriverIO + tauri-service）以及最小化令牌消耗的执行方式，为 Web、移动和桌面应用程序创建并运行 E2E 测试。
智能体：e2e-tester（主要 — 检测、旅程映射、脚本创建、执行、录制）
技能：moai-foundation-quality、moai-ref-testing-pyramid（根据 delegation.yaml）
标志：--tool、--platform、--record、--url、--journey、--headless、--browser、--timeout、--retry
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/e2e.md

### goal - 条件声明式智能体循环

目的：启用完成条件（机械式命令 + 模型声明）；`stop-goal` 停止钩子评估器会阻止每个轮次结束，直到满足条件或达到轮次上限（默认为 30）。
动词：`/moai goal "<condition>"`（注册 + 启用）、`status [--all]`、`clear`、`resume`。
推进模式：自主（默认）与半自主 — 在实现启动审批时选择；两种模式下门禁均为强制要求。
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/goal.md

### todo - 待办队列

目的：保存操作者接下来想要处理的工作。`backlog` 没有归属会话，因此将事项接纳到看板中始终由操作者执行 — 这就是执行该操作的界面。
动词 — 斜杠命令界面：`/moai todo "<description>"`（追加）、不带参数的 `/moai todo`（列出）。仅限 CLI：`moai todo next`（输出队列中的卡片；`moai todo next <n> [--spec <SPEC-ID>]` 将一项标记为已选取 — 选取操作本身通过 AskUserQuestion 呈现）、`moai todo done <n>`（移除）。
状态：`.moai/state/kanban/backlog.json` — 项目本地、不提交、原子写入。
选取权属于操作者：绝不预先选择，绝不根据推断的优先级重新排序，绝不根据 TODO 注释或议题自动填充。
启用：当 `.moai/config/sections/workflow.yaml` 中的 `workflow.todo.enabled` 为 `false` 时，请勿通过推断路由到此工作流 — 如果操作者未指定子命令，则直接回答形似待办事项的表述，而不是将其加入队列。此门禁仅约束自动路由：显式的 `/moai todo` 或 `/moai todo "<description>"` 仍会正常运行，与该键不存在或为 `true` 时完全相同。该标志抑制的是引导，而不是功能 — `moai todo` 仍保持注册状态，且每个动词都继续有效，因此拒绝或静默忽略已明确指定的调用属于缺陷，而非预期行为。
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/todo.md

### fix - 自动修复错误

目的：自主检测并修复 LSP 错误、代码检查问题和类型错误。
智能体：manager-develop（cycle_type=autofix）、具有领域白名单（修复）的 Agent(general-purpose)
技能：moai-workflow-ddd（依据 delegation.yaml）+ 根据任务注入的领域 moai-ref-*
标志：--dry、--sequential、--level N、--resume、--team（实验性 — 重新允许使用智能体团队；参见执行模式标志）
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/fix.md

### loop - 迭代式自动修复

目的：重复修复问题，直到满足完成条件或达到最大迭代次数。
智能体：manager-develop（cycle_type=autofix）、具有领域白名单的 Agent(general-purpose)
技能：moai-workflow-loop（依据 delegation.yaml）+ 根据任务注入的领域 moai-ref-*
标志：--max N、--auto-fix、--seq
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/loop.md

### mx - MX 标签扫描与注解

目的：扫描代码库并添加 @MX 代码级注解，为 AI 智能体提供上下文。
智能体：Explore（扫描）、具有后端范围（注解）的 Agent(general-purpose)
标志：--all、--dry、--priority P1-P4、--force、--team（实验性 — 重新允许使用智能体团队；参见执行模式标志）
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/mx.md

### review - 代码审查

目的：从多个视角进行代码审查，包括安全性、性能、质量和用户体验分析。
智能体：sync-auditor（审查）、具有安全范围的 Agent(general-purpose)
技能：moai-foundation-quality、moai-ref-owasp-checklist（依据 delegation.yaml；根据各审查视角注入相应的参考技能）
标志：--staged、--branch、--security、--team（实验性 — 重新允许使用智能体团队；参见执行模式标志）
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/review.md

### clean - 移除无用代码

目的：识别并安全移除未使用的代码，同时通过测试进行验证。
智能体：manager-develop、具有重构范围的 Agent(general-purpose)
技能：moai-workflow-ddd（依据 delegation.yaml）
标志：--dry、--safe-only、--file PATH
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/clean.md

### codemaps - 架构文档

目的：扫描代码库并生成架构文档。
智能体：Explore、manager-docs
标志：--force、--area AREA
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/codemaps.md

### (default) - MoAI 自主工作流

目的：完整的自主研究 -> 规划 -> 注解 -> 运行 -> 同步流水线。
阶段：并行探索（research.md）-> 生成 SPEC -> 注解周期 -> 实现 -> 同步
智能体：Explore、manager-spec、plan-auditor（质量门禁）、manager-develop、manager-docs、manager-git、sync-auditor（质量门禁）
技能：moai-workflow-spec、moai-workflow-tdd（依据 delegation.yaml）+ 根据任务注入的领域 moai-ref-*
标志：--loop、--max N、--branch、--pr、--resume SPEC-XXX、--team（实验性 — 重新允许使用智能体团队；参见执行模式标志）、--solo、--issue（选择启用；依据后期分支选择启用策略，默认跳过创建 GitHub Issue）
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/moai.md

### project - 项目文档

目的：通过分析现有代码库生成项目文档。  
代理：Explore、manager-docs、具有 devops 范围的 Agent(general-purpose)（可选）  
技能：moai-workflow-project（依据 delegation.yaml）  
输出：.moai/project/ 中的 product.md、structure.md、tech.md  
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/project.md

### feedback - 创建 GitHub Issue

目的：收集用户反馈并创建 GitHub Issue。  
代理：orchestrator-direct（通过 gh CLI 记录反馈）  
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/feedback.md

### harness - Harness 生命周期 + 自然语言构建（基于参数的分支）

这个单一的 `harness` 子命令会根据 `$ARGUMENTS` 的第一个词元分派到以下两个工作流之一（基于参数的路由——不会引入第二个命令）。在执行任何工作流特定逻辑之前应用路由规则：

- **保留动词**（`status` / `apply` / `rollback` / `disable`）→ 路由到现有的 **harness 学习生命周期**工作流（下方分支 A）。此路径保持不变。
- **保留动词**（`list` / `edit` / `remove` / `doctor`）→ 路由到 **harness-v4 生命周期**处理程序（下方分支 A.1）。这些操作通过 `moai harness <verb>` Go 二进制子命令枚举、编辑、原子化移除 harness-v4 条目，并运行引用完整性冒烟门禁（`doctor`）。
- **其他任何内容**（自然语言形式的 harness 创建请求，例如 "build a harness for CLI template development"）→ 路由到 **harness 构建入口**工作流（下方分支 B）。

#### 分支 A — harness 学习生命周期（保留动词：status / apply / rollback / disable）

目的：通过斜杠命令路径向用户呈现 harness 学习子系统（观察器、四层提案阶梯、五层安全管道）。生命周期动词（status / apply / rollback / disable）通过统一的 `moai harness` Go 二进制 Cobra 子命令树进行分派，由该命令树执行文件系统操作。Tier-4 应用受编排器发出的 AskUserQuestion 约束。  
技能：moai-harness-learner（Tier-4 呈现配套技能）。项目特定的 harness 生成由 v4 Builder（`builder-harness` 代理，分支 B）处理。  
动词：status（层级分布 + 遥测）| apply（下一个 Tier-4 提案 → AskUserQuestion → 五层管道 → 快照 + 写入）| rollback &lt;YYYY-MM-DD&gt;（恢复快照）| disable（设置 learning.enabled: false）  
产物：`.moai/harness/usage-log.jsonl`、`.moai/harness/proposals/`、`.moai/harness/learning-history/snapshots/`、`.moai/harness/learning-history/applied/`、`.moai/harness/learning-history/frozen-guard-violations.jsonl`  
权威 SPEC：harness 基础策略（取代 V3R3-HARNESS-001、V3R3-HARNESS-LEARNING-001、V3R3-PROJECT-HARNESS-001）  
有关详细编排：阅读 ${CLAUDE_SKILL_DIR}/workflows/harness.md

#### 分支 A.1 — harness-v4 生命周期（保留动词：list / edit / remove / doctor）

目的：管理 harness-v4 条目——枚举已构建的 harness，定位其清单和专家文件以供编辑，原子化移除 harness 及其全部产物，或运行引用完整性冒烟门禁。这四个动词分派到 `moai harness <verb>` Go 二进制子命令，由其执行文件系统操作（扫描 `.claude/commands/harness/*.md` 并与 `manifest.json` 联接；执行带有故障关闭式孤立项防护的原子化移除；doctor 交叉验证清单、专家和技能文件是否存在）。  
动词：list（枚举所有 harness：名称 + 领域 + 入口命令；如果清单声明了调度，还包括已声明的调度——间隔 + 机制；没有调度的 harness 与引入调度功能之前的基线呈现完全相同）| edit &lt;name&gt;（显示清单 + 专家 + 技能路径以供编辑——清单是 SSOT）| remove &lt;name&gt;（原子化移除命令 + 工作流 + 专家 + 技能 + 清单；如果任何产物缺失则故障关闭；当清单声明了调度时，打印注销通知并注明已声明的机制——cron 对应 CronDelete，loop 对应会话范围的循环取消——该信息在删除前根据清单计算）| doctor（引用完整性冒烟门禁：验证每个已构建 harness 的清单、专家和技能文件均存在且相互引用正确；不符合 schema 的调度声明属于 ERROR 严重级别的发现项）  
CLI：`moai harness list [--json]`、`moai harness edit <name> [--json]`、`moai harness remove <name>`、`moai harness doctor`（均支持 `--project-root`）  
产物：`.claude/commands/harness/<name>.md`（轻量包装命令）、`.claude/commands/harness/<name>/manifest.json`（SSOT）、`.claude/workflows/hns-<name>-run.js`（Runner）、`.claude/agents/harness/hns-<name>*-specialist.md`（专家）、`.claude/skills/hns-<name>*/`（配套技能）  
命名空间：`.claude/commands/harness/`、`.claude/workflows/hns-*.js`、`.claude/agents/harness/` 和 `.claude/skills/hns-*/` 归用户所有——`moai update` 会保留它们（如有需要则备份，绝不覆盖）。使用 `harness-` 或 `my-harness-` 前缀的旧版本生成内容同样会被保留（基于识别的向后兼容）；Builder 仅生成采用 `hns-` 命名的内容。

#### 分支 B — harness 构建入口（自然语言请求）

目的：通过上下文优先发现（提取领域 / 目标 / 约束 / 范围），将自然语言的 harness 创建请求转化为具体的 harness；推导 harness `<name>`（名称从请求中推导得出——并非由用户静态提供）；由编排器明确发出批准；随后进入编排器直接驱动的 Builder（4 个信号驱动阶段：ANALYZE / PLAN / GENERATE / ACTIVATE）。当意图清晰度低于 100% 时，编排器必须执行 AskUserQuestion 苏格拉底式问答轮次（每轮最多 4 个问题）。
Agent：builder-harness（v4 Builder — 项目专属的 harness 生成）
Builder：编排器直接处理（而非 dynamic-workflow 脚本）——该入口的阶段 0-3 会移交给 `${CLAUDE_SKILL_DIR}/workflows/harness-builder.md`，由其执行四阶段创建逻辑。编排器直接持有 PLAN→GENERATE 的 AskUserQuestion 批准门禁；该门禁轮次还包含重复执行问题（可选的清单 `schedule`，仅限发现用途的定时运行），而 ACTIVATE 会在冒烟测试门禁通过后注册已声明的计划。若请求同时引用现有 harness 并包含调度意图，则会路由到入口工作流的计划改造分支（先于名称冲突处理进行评估），而不是进入创建流水线。
有关详细的编排方式：请阅读 ${CLAUDE_SKILL_DIR}/workflows/harness-build-entry.md

---

## 执行指令

激活此技能后，按顺序执行以下步骤：

步骤 1 - 解析参数：
从原始用户输入中提取子命令关键字和标志。可识别的全局标志：--resume [ID]、--seq、--team、--solo。同时检测输入文本中的 `ultrathink` 关键字。

**关键：深度分析模式：**
- 检测到 `ultrathink` 关键字 → 激活 Claude 原生扩展推理（xhigh effort 模式）。这是 Claude 的原生行为，不依赖 MCP。

步骤 1.5 - 标志与子命令兼容性验证：
[硬性要求] 解析子命令和标志（步骤 1）后，必须在路由之前验证标志与子命令的兼容性。如果检测到禁止的组合，停止所有后续处理，并使用用户的 conversation_language 输出错误。不得继续执行步骤 2。

禁止的标志与子命令组合：

| 标志 | 允许的子命令 | 禁止的子命令 |
|------|---------------------|------------------------|
| `--branch` | `plan`、默认（自主） | `run`、`sync` |

理由：`--branch` 会在 SPEC 初始化时创建功能分支，因此 `/moai run` 和 `/moai sync` 必须在 `plan` 已建立的分支上运行——在生命周期中途重新创建分支会破坏 SPEC 生命周期，因此会在路由器层被拒绝。

已退役的 `--worktree` 标志需要单独处理：携带该标志的请求不属于禁止组合错误，而是使用了已退役的标志。告知用户，plan 不再创建工作区，替代方式是先进入一个工作区。

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

已弃用标志的消息（`--worktree`）：
```
안내: --worktree 플래그는 폐기됐습니다. plan 은 더 이상 작업 공간을 만들지 않습니다.

격리된 공간에서 작업하려면 먼저 들어간 뒤 plan 을 실행하세요:
  moai cc -w <이름>              (그 자리에서 진입)
  moai cg -w <이름> --spawn      (새 tmux 창, 현재 세션 유지)
  /moai plan "<설명>"
```

对于英语（`en` conversation_language），翻译该消息；结构保持完全一致。

步骤 2 - 路由到工作流：
应用意图路由器（从优先级 1 到优先级 4）来确定目标工作流。如果存在歧义，请使用 AskUserQuestion 向用户确认。

步骤 2.2 - 记录路由决策：
路由解析完成后（步骤 2），立即将路由决策记录到仅追加的路由账本（`.moai/state/routing-ledger.jsonl`）中，以便观察自动调用。运行：

```
echo "<raw request text>" | moai harness ledger record --subcommand <matched> --mode <phase-4-mode> --tier <tier> --level <harness-level> --session <session-id>
```

请求文本通过 stdin 管道传入，并且只会存储保护隐私的摘要，绝不会逐字存储用户文本（策略来源：上文 § 路由观察账本）。此步骤为选择启用且失败时放行：如果 PATH 中不存在 `moai` CLI，或者命令以非零状态退出，则不记录任何内容并继续——它绝不会阻止路由、绝不会限制工作流，也绝不会触发重试循环。未记录的分派属于观察缺口，而不是错误。

步骤 2.5 - 项目文档检查：
在执行 plan、run、sync、fix、loop 或 default 工作流之前，通过检查 `.moai/project/product.md` 来确认项目文档是否存在。如果 product.md 不存在，请使用 AskUserQuestion 以用户的 conversation_language 询问用户：

问题：未找到项目文档。是否要先创建项目文档？
选项：
- 创建项目文档（推荐）：通过引导式访谈生成 product.md、structure.md、tech.md。这有助于 MoAI 理解你的项目上下文，从而在后续所有工作流中提供更好的结果。
- 跳过并继续：在没有项目文档的情况下继续。MoAI 对你的项目所掌握的上下文将会更少。

此检查不适用于：project、feedback 子命令。

[硬性要求] 对初学者友好的选项设计：
MoAI 工作流中的所有 AskUserQuestion 调用都必须遵循以下规则：
- 第一个选项必须始终为推荐选项，并明确带有“（推荐）”后缀
- 每个选项都必须包含详细说明，解释其作用及影响

步骤 2.8 - 需求分析与完成条件：
在加载工作流主体（步骤 3）之前，为已路由的请求生成一条需求分析记录：

1. **需求摘要**（1-3 句话）：说明用户提出了什么要求，并用编排器自己的语言重新表述。
2. **完成条件**：表示“完成”的最终状态。如果该条件可由机器验证（测试退出代码、lint 无错误状态、grep 计数、有界轮次），则按照 `.claude/rules/moai/workflow/goal-directive.md` 以与 `/moai goal` 兼容的形式表达（一个可衡量的最终状态 + 明确的检查方式 + 边界条款）。不要另行创造并行评估器：当目标引擎可用时（hooks 已启用——评估器是 `stop-goal` Stop hook），通过 `/moai goal` 启用该条件；否则，编排器在每轮中根据完全相同的条件文本进行评估（优雅降级——不引入新机制）。
3. **流水线契约**：`full-pipeline`（默认的自然语言路由——run 阶段完成后自动衔接到 sync）或 `single-phase`（显式的 `run`/`sync` 子命令——衔接操作会作为“（推荐）”的后续步骤选项提供，绝不会静默触发）。
4. **编排形态预信号**：Phase 4 四种模式选择（`orchestration-mode-selection.md` §A）的早期输入——在此处记录，在 Phase 4 决定。

简单范围豁免：对于 `feedback`、`gate`、`codemaps`、`sync` 状态模式，以及 `askuser-protocol.md` § Ambiguity Triggers and Exceptions 中规定的任何 Stage-1-Clarify 例外情况，完全跳过此步骤。
苏格拉底优先顺序：当意图清晰度低于 100% 时，先进行苏格拉底式访谈（依据 `askuser-protocol.md`），然后再推导完成条件——该条件应编码已充分澄清的意图，而绝非猜测。
推导出的完成条件绝不授权自主进入运行阶段——在 plan→run 边界仍必须获得实施启动批准。

步骤 3 - 加载工作流详情：
读取目标子命令对应的 `workflows/<name>.md`。（Agent Teams 静态层已弃用；`--team` 标志会根据 `.claude/rules/moai/workflow/orchestration-mode-selection.md` 回退到子代理模式——不存在单独的 `team/<name>.md` 工作流文件。）

步骤 4 - 读取配置：
根据需要从 .moai/config/sections/*.yaml 分区文件中加载相关配置。

步骤 5 - 初始化任务跟踪：
使用 TaskCreate 注册发现的工作项，并将其状态设为 pending。

步骤 6 - 执行工作流阶段：
遵循特定于工作流的阶段说明。通过 Agent() 将所有实施工作委派给适当的代理。在指定的检查点通过 AskUserQuestion 获取用户批准。每次生成实施/审查 Agent() 之前，应用 `.claude/rules/moai/workflow/skill-routing.md` §1：根据委派映射（`.moai/config/sections/delegation.yaml`）注入 0-3 行 `At start, invoke Skill("<name>") for <reason>`。

步骤 7 - 跟踪进度：
随着工作推进，使用 TaskUpdate 更新任务状态（pending 到 in_progress 再到 completed）。

步骤 8 - 展示结果：
使用 Markdown 格式，以用户的 conversation_language 向其展示结果。

步骤 9 - 声明完成：
当所有工作流阶段均成功完成后，在完成报告（横幅/正文）中声明工作流已完成，使结果清晰明确。

步骤 10 - 指引后续步骤：
使用 AskUserQuestion，根据已完成的工作流向用户提供合理的后续操作。

---

版本：2.8.0
最后更新：2026-07-07