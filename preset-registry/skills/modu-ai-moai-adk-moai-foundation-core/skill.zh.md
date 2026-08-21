---
name: moai-foundation-core
description: >
  Provides MoAI-ADK foundational principles including TRUST 5 quality framework,
  SPEC-First DDD methodology, delegation patterns, progressive disclosure,
  agent catalog reference, and token budget management (absorbed from moai-foundation-context).
  Use when referencing TRUST 5 gates, SPEC workflow, or context window optimization.

when_to_use: >
  Use for MoAI-ADK foundations: the TRUST 5 quality framework, SPEC-First
  DDD methodology, delegation patterns, progressive disclosure,
  token/context-window budget management, GEARS/EARS formats, and session
  handoff.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob
user-invocable: false
metadata:
  version: "3.0.0"
  category: "foundation"
  status: "active"
  updated: "2026-07-10"
  modularized: "true"
  tags: "foundation, core, orchestration, agents, commands, trust-5, spec-first-ddd, token-budget, context-window, session-state"
  related-skills: "moai-foundation-cc, moai-foundation-thinking"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# MoAI Foundation Core

支撑 MoAI-ADK AI 驱动开发工作流的基础原则和架构模式。

核心理念：通过经过验证的模式和自动化工作流，实现质量优先、领域驱动、模块化且高效的 AI 开发。

## 快速参考

什么是 MoAI Foundation Core？

确保 AI 驱动开发质量、效率和可扩展性的六项基本原则：

1. TRUST 5 Framework - 质量门禁系统（Tested、Readable、Unified、Secured、Trackable）
2. SPEC-First DDD - 规范驱动的领域驱动开发工作流
3. 委派模式 - 通过专用代理进行任务编排（绝不直接执行）
4. Token 优化 - 200K 预算管理和上下文效率优化
5. 渐进式披露 - 三级知识交付（快速、实现、高级）
6. 模块化系统 - 用于实现可扩展性的文件拆分和参考架构

快速访问：

- 质量标准位于 modules/trust-5-framework.md
- 开发工作流位于 modules/spec-first-ddd.md
- 代理协调位于 modules/delegation-patterns.md
- 预算管理位于 modules/token-optimization.md
- 内容结构位于 modules/progressive-disclosure.md
- 文件组织位于 modules/modular-system.md
- 代理目录位于 modules/agents-reference.md
- 命令参考位于 modules/commands-reference.md
- 安全与约束位于 modules/execution-rules.md

使用场景：

- 按照质量标准创建新代理
- 按照结构指南开发新技能
- 复杂工作流编排
- Token 预算规划与优化
- 文档架构设计
- 质量门禁配置

---

## 实现指南

### 1. TRUST 5 Framework - 质量保证系统

目的：通过自动化质量门禁确保代码质量、安全性和可维护性。

五大支柱：

Tested 支柱：保持全面的测试覆盖率，并通过特征测试确保行为得到保留。运行项目的测试运行器并启用覆盖率（例如 go test -cover、pytest --cov、cargo test、npm test -- --coverage）。失败时阻止合并并生成缺失的测试。特征测试捕获遗留代码的当前行为，而规范测试则验证新代码的领域需求。高测试覆盖率能够确保代码可靠性、减少生产环境缺陷，并在重构期间保留原有行为。

Readable 支柱：使用清晰且具有描述性的命名约定。运行项目的代码检查器（例如 golangci-lint、ruff、eslint、clippy）。失败时发出警告并提出重构改进建议。清晰的命名能够提高代码可理解性、团队协作效率和维护速度。

Unified 支柱：采用一致的格式和导入模式。运行项目的格式化工具（例如 gofmt、black、prettier、rustfmt）。失败时自动格式化代码或发出警告。一致性可以消除风格争议和合并冲突，并提高可读性。

Secured 支柱：遵循 OWASP 安全标准。通过适当的代理或参考技能呈现安全发现（例如，生成一个附带安全指令的 per-spawn general-purpose agent，或者加载 moai-ref-owasp-checklist / moai-ref-llm-security 参考）。失败时阻止合并并要求进行安全审查。安全漏洞会带来严重的业务和法律风险。

可追踪支柱：编写清晰且结构化的提交消息。匹配 Git 提交消息正则表达式模式（Conventional Commits）。验证失败时建议正确的提交消息格式。清晰的历史记录有助于调试、审计和协作。

集成点：用于自动验证的预提交钩子、用于实施质量门禁的 CI/CD 流水线、用于 TRUST 5 验证的 Agent 工作流（moai-foundation-quality 编排）、用于质量指标的文档。

详细参考：modules/trust-5-framework.md

---

### 2. SPEC-First DDD - 开发工作流

目的：规范驱动开发，确保在实现之前明确需求。

三阶段工作流：

阶段 1 SPEC (/moai plan)：workflow-spec 生成 GEARS 格式（主要格式；EARS 作为针对 88 个 v3 之前 SPEC 的 6 个月向后兼容旧版参考予以保留）。输出为 .moai/specs/SPEC-XXX/spec.md。执行 /clear 可节省 45-50K 个 token。

阶段 2 DDD (/moai run)：使用 ANALYZE 分析需求，使用 PRESERVE 保留现有行为，使用 IMPROVE 进行增强。以至少 85% 的覆盖率进行验证。

阶段 3 文档 (/moai sync)：API 文档、架构图、项目报告。

GEARS 格式（当前表示法）：五种模式——普遍型 `The <subject> shall <behavior>`，用于系统范围内始终生效的需求；事件驱动型 `When <event> the <subject> shall <behavior>`，用于触发—响应需求；状态驱动型 `While <state> the <subject> shall <behavior>`，用于条件行为；Where（能力门控）`Where <capability or feature flag>, the <subject> shall <behavior>`，用于以能力为条件的行为；事件检测型（取代已弃用的条件模态）`When <undesired-condition-detected>, the <subject> shall <response>`，用于故障模式处理。统一复合子句：`[Where ...][While ...][When ...] The <subject> shall <behavior>`——三个修饰语可以任意组合串联。`<subject>` 已泛化，可以是任何名词（系统、组件、服务、代理、函数、制品）。请参阅 `.claude/skills/moai-workflow-spec/SKILL.md` 中的权威编写指南 § “GEARS 格式”。

EARS 格式（旧版参考，提供 6 个月向后兼容——于 2026-11-22 到期）：五种模式，即普遍型 / 事件驱动型（WHEN/THEN）/ 状态驱动型（WHILE）/ 非预期型（SHALL NOT）/ 可选型（WHERE possible）。88 个 v3 之前的 SPEC 继续使用 EARS；对于新 SPEC 中残留的已弃用条件模态，lint 引擎会发出 `LegacyEARSKeyword` 警告（非严格模式下为警告，使用 `moai spec lint --strict` 时为错误）。新 SPEC 应使用 GEARS。请参阅 `modules/spec-ears-format.md`（旧版参考，已弃用——请参阅 GEARS 格式指南）。

Token 预算：SPEC 使用 30K，DDD 使用 180K，文档使用 40K，总计 250K。

关键实践：在阶段 1 之后执行 /clear 以初始化上下文。

详细参考：modules/spec-first-ddd.md

---

### 3. 委派模式 - Agent 编排

目的：将任务委派给专业代理，避免直接执行。

核心原则：MoAI 必须通过 Agent() 将所有工作委派给专业代理。直接执行会绕过专业化能力、质量门禁和 token 优化。正确的委派可将任务成功率提高 40%，并支持并行执行。

委派语法：MoAI 通过自然语言进行委派——“使用 {agent} 子代理来 {task}”——并携带完整的上下文、约束条件和理由。编排器绝不会传递 `subagent_type` 代码字面量；它会使用叙述性提示词生成 `Agent()`（或针对领域工作的 `Agent(general-purpose)`）。

三种模式：

依赖任务采用顺序模式：使用 manager-spec 子代理编写 SPEC，然后使用 manager-develop 子代理在将该 SPEC 作为上下文的情况下实现它。

独立工作采用并行模式：在一个轮次中生成多个 Agent(general-purpose) 队友——例如，一个接收后端指令，另一个接收前端指令——前提是这些工作彼此独立。

基于分析的任务采用条件模式：使用 Explore 子代理进行只读诊断，然后根据分析结果将其路由给适当的保留代理（由 manager-develop 进行修复，或由 sync-auditor 进行质量评分）。

代理选择：涉及 1 个文件的简单任务按顺序使用 1-2 个代理。涉及 3-5 个文件的中等任务按顺序使用 2-3 个代理。涉及 10 个以上文件的复杂任务混合使用 5 个以上代理。特定领域的工作（后端 / 前端 / 安全 / 性能 / 重构）在运行阶段由 manager-develop 处理，或者由每次生成的 Agent(general-purpose) 根据 `.claude/rules/moai/workflow/archived-agent-rejection.md` 中的领域白名单处理。

详细参考：modules/delegation-patterns.md

---

### 4. Token 优化 - 预算管理

目的：通过策略性上下文管理高效利用 200K Token 预算。

预算分配：

SPEC 阶段使用 30K Token。策略是仅加载需求，并在完成后执行 /clear。规范阶段仅需最少的上下文来分析需求。可为实现阶段节省 45-50K Token。

DDD 阶段使用 180K Token。策略是选择性加载文件，仅加载与实现相关的文件。实现需要深入的上下文，但不需要完整的代码库。可在预算范围内支持规模扩大 70% 的实现。

Docs 阶段使用 40K Token。策略是缓存结果并复用模板。文档基于已完成的工作产物构建。可减少 60% 的重复文件读取。

所有阶段的总预算为 250K Token。在各阶段之间重置上下文，可提供清晰的上下文边界并防止 Token 膨胀。可在相同预算内支持规模扩大 2-3 倍的项目。

Token 节省策略：

阶段分离：在各阶段之间执行 /clear；在 /moai plan 后执行可节省 45-50K；在上下文超过 150K 时执行；在 50 条以上消息后执行。

选择性加载：仅加载必要的文件。

上下文优化：目标为 20-30K Token。

模型选择：使用 Sonnet 保证质量，使用 Haiku 提升速度并降低成本；其费率便宜 70%，总计可节省 60-70%。

详细参考：modules/token-optimization.md

---

### 5. 渐进式披露 - 内容架构

目的：通过三级知识传递，在价值与深度之间取得平衡。

三个层级：

快速参考层级：投入 30 秒时间，了解核心原则和基本概念，约 1,000 Token。为时间有限的用户快速提供价值。用户仅需投入 5% 的时间，即可获得 80% 的理解。

实施级别：投入 5 分钟时间，涵盖工作流、实用示例、集成模式，约 3,000 个 token。通过可操作的指导衔接概念与执行。无需深厚专业知识即可立即开展高效工作。

高级级别：投入 10 分钟以上时间，涵盖深入的技术解析、边缘情况、优化技术，约 5,000 个 token。为复杂场景提供精通级知识。通过全面覆盖将问题升级率降低 70%。

SKILL.md 结构（最多 500 行）：快速参考部分、实施指南部分、高级模式部分、协同使用部分。

模块架构：以 SKILL.md 作为入口点并包含交叉引用，modules 目录用于存放大小不受限制的深入内容，examples.md 用于存放可运行示例，reference.md 用于存放外部链接。

超过 500 行时的文件拆分：SKILL.md 包含 80-120 行的快速参考内容、180-250 行的实施内容、80-140 行的高级内容以及 10-20 行的参考资料。溢出内容放入 modules/topic.md。

详细参考：modules/progressive-disclosure.md

---

### 6. 模块化系统 - 文件组织

目的：支持无限内容扩展的可伸缩文件结构。

标准结构：创建 .claude/skills/skill-name/ 目录，其中包含作为核心文件且不超过 500 行的 SKILL.md、用于存放大小不受限制的扩展内容（包括 patterns.md）的 modules 目录、用于存放可运行示例的 examples.md、用于存放外部链接的 reference.md、用于存放实用工具的 scripts 目录（可选）以及 templates 目录（可选）。

文件原则：SKILL.md 通过渐进式披露和交叉引用保持在 500 行以内。modules 目录以主题为中心，不设大小限制，且内容自成一体。examples.md 中的内容可直接复制粘贴，并附有注释。reference.md 包含 API 文档和资源。

交叉引用语法：将模块引用为“详情见 modules/patterns.md”，将示例引用为“示例见 examples.md#auth”，将外部文档引用为“外部资料见 reference.md#api”。

发现流程：SKILL.md 到主题，再到 modules/topic.md，最后到深入解析。

详细参考：modules/modular-system.md

---

## 高级实施

详细模块参考资料中提供了高级模式，包括跨模块集成、质量验证和错误处理。

关键高级主题：

- 跨模块集成：结合 TRUST 5 + SPEC-First DDD
- Token 优化的委派：通过上下文重置实现并行执行
- 渐进式智能体工作流：升级模式
- 质量验证：执行前/执行后验证
- 错误处理：委派失败恢复

详细参考：references/examples.md，获取可运行的代码示例

---

## 协同使用

智能体：builder-harness，用于基于基础原则生成智能体/技能/框架；manager-spec，用于编写计划阶段内容；manager-develop，用于运行阶段实施；manager-docs，用于同步阶段文档编写；sync-auditor，用于独立进行 TRUST 5 质量评分；super-advisor，用于按需提供高推理能力咨询。

技能：用于 Claude Code 创作（技能、智能体、插件、钩子）的 moai-foundation-cc；用于 GEARS 格式规范（当前使用；EARS 保留作为旧版参考）的 moai-workflow-spec；用于 ANALYZE-PRESERVE-IMPROVE 执行流程的 moai-workflow-ddd；用于 RED-GREEN-REFACTOR 循环的 moai-workflow-tdd；用于 TRUST 5 验证编排的 moai-foundation-quality；用于战略推理以及通过 ultrathink 关键词进行自适应思考的 moai-foundation-thinking。

工具：AskUserQuestion，用于直接与用户交互以及处理澄清需求。

命令：/moai plan 用于 SPEC-First 阶段 1，/moai run 用于 DDD 阶段 2，/moai sync 用于文档阶段 3，/moai feedback 用于持续改进，/clear 用于令牌管理。

基础模块（扩展文档）：modules/agents-reference.md 提供保留的 11 个智能体目录（10 个 MoAI 自定义智能体 + 1 个 Anthropic 内置 `Explore` 智能体），modules/commands-reference.md 提供由 6 个核心命令组成的工作流，modules/execution-rules.md 提供安全、Git 策略和合规规则。有关迁移对 12 个已归档智能体（`manager-strategy`、`manager-quality`、`manager-brain`、`manager-project`、`claude-code-guide`、`researcher` 以及 6 个 `expert-*` 智能体）的引用，请参阅 `.claude/rules/moai/workflow/archived-agent-rejection.md`。

---

## 快速决策指南

新智能体：首要原则是 TRUST 5 和委派。辅助原则是令牌优化和模块化。

新技能：首要原则是渐进式和模块化。辅助原则是 TRUST 5 和令牌优化。

工作流：首要原则是委派模式。辅助原则是 SPEC-First 和令牌优化。

质量：首要原则是 TRUST 5 框架。辅助原则是 SPEC-First DDD。

预算：首要原则是令牌优化。辅助原则是渐进式和模块化。

文档：首要原则是渐进式和模块化。辅助原则是令牌优化。

模块深入解析：modules/trust-5-framework.md、modules/spec-first-ddd.md、modules/delegation-patterns.md、modules/token-optimization.md、modules/progressive-disclosure.md、modules/modular-system.md、modules/agents-reference.md、modules/commands-reference.md、modules/execution-rules.md。

完整示例：references/examples.md
外部资源：references/reference.md

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化借口

| 合理化借口 | 事实 |
|---|---|
| “TRUST 5 是指导原则，而不是门禁” | TRUST 5 是一道严格的质量门禁。完成前，所有五个维度都必须通过。 |
| “这个改动很小，我可以跳过 SPEC” | 每个没有 SPEC 的改动都无法追踪。缺少 SPEC 的改动会不断累积，最终形成无法管理的技术债务。 |
| “对于简单任务，委派给智能体是一种额外开销” | MoAI 是编排者，而不是实现者。跳过委派会绕过领域专业知识和质量检查。 |
| “代码显然是正确的，我会跳过质量门禁” | 显然正确的代码仍然需要证据。测试和代码检查是验证机制；信心不是。 |
| “渐进式披露对此项目并不重要” | 即使是小型项目，也能从令牌高效的技能加载中受益。披露关乎上下文预算，而不是项目规模。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- MoAI 直接执行实现代码，而不是委派给代理
- 仅部分检查 TRUST 5 个维度（只检查了可测试性和可读性，忽略了安全性）
- SPEC 文档存在，但没有验收标准
- 未参考选择决策树就选择了代理
- 以“稍后检查”为由跳过质量门禁

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 已处理 TRUST 5 的全部五个维度（可测试、可读、统一、安全、可追踪）
- [ ] 已记录代理选择及其理由，且与决策树一致
- [ ] SPEC 文档包含验收标准，并明确要求提供可观察的证据
- [ ] 委派链可追踪：MoAI -> 代理 -> 执行
- [ ] 已在技能 frontmatter 中配置渐进式披露级别

<!-- moai:evolvable-end -->

---

## 令牌预算（吸收自 moai-foundation-context）

上下文窗口优化、/clear 策略、会话状态持久化以及多代理交接模式。

### 上下文窗口目标

有关各模型类别的权威 `/clear` 阈值表（1M/GLM = 50%，200K/256K = 90%），请参阅 `.claude/rules/moai/workflow/context-window-management.md` § 上下文窗口目标。不要在此重复阈值（SSOT）。

### 阶段令牌分配

| 阶段 | 预算 | 策略 |
|-------|--------|----------|
| /moai plan | 30,000 | 仅加载需求，完成后执行 /clear |
| /moai run | 180,000 | 选择性加载文件，按需加载技能 |
| /moai sync | 40,000 | 缓存结果，减少重复读取 |

### /clear 策略

必须执行 /clear 的时机：
1. `/moai plan` 完成后（在 `/moai run` 之前）
2. 当上下文超过 150,000 个令牌时（Sonnet/标准）
3. 在重大阶段转换之前

切勿在以下情况下使用 /clear：代理任务执行期间，或会话状态尚未持久化时。

### 会话状态持久化

在执行 /clear 之前，将进行中的状态持久化到 `.moai/specs/<SPEC-ID>/progress.md`：
- 当前任务状态（已完成、进行中、受阻）
- 文件修改摘要
- 下一步所需操作
- 执行 /clear 后用于粘贴回来以恢复工作的消息

恢复消息格式：
```
Wave <N> 이어서 진행. SPEC-<ID>부터 <approach>.
progress.md: .moai/specs/<ID>/progress.md
다음 단계: <command>.
```

### 多代理交接

在接近上下文上限时委派给子代理：
1. 在调用 Agent() 之前，将发现总结到 progress.md 中
2. 在生成提示词中仅传递必要的上下文（避免转储完整文件）
3. 子代理返回时，其结果会计入父级上下文——请将这一点纳入考量
4. 如果返回后父级上下文超过 120,000 个令牌，请保存并执行 /clear

完整的优化模式：[modules/token-optimization.md](modules/token-optimization.md)