---
name: moai-foundation-quality
description: >
  TRUST 5 quality principles and how MoAI enforces them through agents,
  the 3-level harness, /moai gate, and sync-auditor scoring. Use for code
  review, quality gate checks, coverage targets, or TRUST 5 compliance.

when_to_use: >
  Use for code-quality guidance: TRUST 5 principles (Tested, Readable,
  Unified, Secured, Trackable), the 3-level harness (minimal/standard/
  thorough), /moai gate (lint+format+type+test), coverage targets,
  security checks, language-aware toolchains, code-smell detection, and
  technical-debt triage.

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
  tags: "foundation, quality, testing, validation, trust-5, best-practices, code-review"
  aliases: "moai-foundation-quality"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# TRUST 5 质量原则与执行机制

此技能提供有关 MoAI 质量模型的背景知识：五项 TRUST 5 原则、代理如何执行这些原则、三级保障机制，以及 `/moai gate` 所运行的语言感知工具链。MoAI **不提供**质量验证库——质量通过代理（`manager-develop`、`sync-auditor`）、斜杠命令（`/moai gate`、`/moai review`）和保障机制（minimal/standard/thorough）来执行。

## 快速参考

**TRUST 5 原则**（可测试、可读、统一、安全、可追踪）是质量维度，而不是代码对象。每项代码变更都会依据全部五个维度进行评估。

**质量机制**（真正的执行层）：

- `/moai gate` —— 并行运行 lint + format + type-check + test，作为提交前质量门禁（<30 秒）。自动检测项目语言并运行相应的工具链。
- `manager-develop`（run 阶段）—— 通过 `cycle_type` ∈ {tdd, ddd,
  autofix} 实施；所选周期决定测试与行为的产出方式。
- `sync-auditor` —— 以 4 个维度进行独立且审慎的质量评估（功能性、安全性、工艺、统一性），总分采用各维度的调和平均数，而不是算术平均数。
- 三级保障机制 —— minimal（快速验证）、standard（默认检查）、thorough（完整的 sync-auditor + TRUST 5）。由复杂度评估器根据 SPEC 范围自动确定。
- LSP 质量门禁 —— 特定阶段的阈值（run：零错误/类型错误/
  lint 错误；sync：零错误、最多 10 个警告、LSP 无问题）。

## MoAI 质量模型

MoAI 不提供 Python SDK，也不提供任何用于质量验证的库。质量通过工作流、代理和门禁命令来执行。此技能说明这些组成部分如何协同工作，使 Claude 调用能够正确判断质量。

### 各阶段如何执行 TRUST 5

| 阶段 | 质量检查 | 负责人 |
|-------|--------------|-------|
| plan | 记录 LSP 基线；在计划中识别质量风险 | manager-spec |
| run | 零错误/类型错误/lint 错误；测试通过；达到覆盖率要求 | manager-develop（cycle_type 决定采用的方式） |
| sync | lint 无问题（≤10 个警告）；文档已更新；再次确认 TRUST 5 | manager-docs，随后由 sync-auditor 评分 |
| audit | 独立的 4 维度评分（功能性/安全性/工艺/统一性） | sync-auditor |

### cycle_type 与质量（manager-develop）

run 阶段的 `cycle_type` 决定如何将质量内建于开发过程：

- **tdd** —— 测试驱动开发（RED-GREEN-REFACTOR）。先通过一个失败的测试来定义行为，再进行实现。最适合新功能。
- **ddd** —— 领域驱动重构（ANALYZE-PRESERVE-IMPROVE）。
  在保留行为的前提下转换现有代码。最适合重构和减少技术债务。
- **autofix** —— 诊断驱动的修复（LSP / lint / type errors）。最适合
  `/moai fix` 和回归问题恢复。

有关各周期的具体机制，请参阅 Skill("moai-workflow-tdd")、Skill("moai-workflow-ddd") 和
Skill("moai-workflow-loop")。

## TRUST 5 原则

TRUST 5 是五个质量维度的助记词。应将每个维度视为针对任何变更都要提出的问题，而不是需要计算的分数。

- **T — 已测试（Tested）**：变更是否有测试？测试是否通过？覆盖率是否达到或超过项目阈值（默认为 85% 以上）？对于现有的未测试代码，是否有特征测试来捕获当前行为？
- **R — 可读（Readable）**：命名是否清晰？注释是否使用英语（或配置的代码注释语言）？新贡献者能否在没有讲解的情况下理解其逻辑？
- **U — 统一（Unified）**：变更是否符合文件现有的约定（命名、错误处理、导入）？是否已使用项目的格式化工具进行格式化？文件内部的一致性优先于个人偏好。
- **S — 安全（Secured）**：是否验证了所有外部输入？是否遵循 OWASP Web 安全指南？凭据是否未纳入版本控制（而是使用环境变量）？请参阅 moai-ref-owasp-checklist。
- **T — 可追踪（Trackable）**：提交是否遵循 Conventional Commits？是否引用其实现的 SPEC / issue？能否将变更追溯到某项需求？

有关各原则的评估清单和“不适用”防护规则，请参阅 [TRUST 5 原则](modules/trust5-validation.md)。

## 质量门禁与三级执行框架

执行框架级别决定质量验证的深入程度。该级别由复杂度估算器根据 SPEC 范围自动确定。

| 级别 | 执行内容 | 适用情况 |
|-------|-----------|------|
| minimal | 仅进行快速验证（lint + type + test） | 小型 SPEC、低风险 |
| standard | 默认检查（lint + type + test + format） | 大多数 SPEC |
| thorough | 完整的 sync-auditor + 4 维 TRUST 5 评分 | 大型 SPEC、高风险 |

`/moai gate` 是轻量级的提交前入口：它会并行运行 lint + format + type-check + test，且不会应用任何修复。这是获取质量反馈最快的方式。如需更深入的审查，请使用 `/moai review`。

## 语言感知工具链

质量门禁会自动检测项目语言，并运行相应的工具链。未安装的工具会被妥善跳过；没有可识别语言标记的项目会直接通过门禁，不显示任何信息。此技能与语言无关——对支持的 16 种语言一视同仁。

| 语言 | Lint | 格式化 | 测试 |
|----------|------|--------|------|
| Go | go vet → golangci-lint | gofmt | go test |
| Python | ruff | black | pytest |
| TypeScript / JavaScript | eslint | prettier | jest / mocha |
| Rust | cargo clippy | rustfmt | cargo test |
| Java / Kotlin |（按项目配置的 linter）|（按项目配置）| junit |
| Ruby | rubocop | rubocop | rspec |
| PHP | phpstan / phpcs | php-cs-fixer | pest / phpunit |
| ... |（支持 16 种语言；自动检测）| | |

有关完整的工具链映射以及 `/moai gate` 如何检测语言，请参阅[语言感知工具链](references/reference.md#language-aware-toolkchains)。

## 模块参考

每个模块均按需加载。请加载与当前任务相关的模块。

- [TRUST 5 原则](modules/trust5-validation.md) — 五个维度，包括评估问题、各原则检查清单以及“不适用”防护机制。
- [主动分析](modules/proactive-analysis.md) — `/moai gate`、`/moai review` 和 `/moai loop` 如何主动发现质量问题，以及如何对发现的问题进行分级处置。
- [最佳实践](modules/best-practices.md) — 使用 WebSearch / WebFetch 获取最新的框架/库最佳实践，并根据这些实践进行验证。
- [集成模式](modules/integration-patterns.md) — 质量如何融入 SPEC 工作流阶段（plan/run/sync）和 harness 级别。

## 参考文件

- [examples.md](references/examples.md) — 完整演示的 TRUST 5 评估示例，以及 gate/review 分级处置演练。在将 TRUST 5 应用于具体变更时加载。
- [reference.md](references/reference.md) — 质量机制参考：harness 级别详情、语言工具链表、代理角色以及 sync-auditor 评分模型。需要权威映射关系时加载。

## 配合使用效果良好

代理（有关 11 个代理的目录，请参阅 CLAUDE.md §4）：

- `manager-develop` — run 阶段实现；通过 cycle_type 负责 Tested 和 Unified 原则。
- `sync-auditor` — 独立的四维质量评分（Functionality / Security / Craft / Consistency）。
- `Explore`（Anthropic 内置）— 在评估质量之前对代码库进行只读探索。

技能：

- `moai-foundation-core` — TRUST 5 框架交叉参考和 SPEC 工作流基础。
- `moai-ref-testing-pyramid` — 测试金字塔策略、覆盖率目标和测试模式。
- `moai-ref-owasp-checklist` — 用于 Secured 原则的 OWASP Top 10 安全检查清单。
- `moai-workflow-tdd` / `moai-workflow-ddd` / `moai-workflow-loop` — manager-develop 使用的 cycle_type 工作流。

命令：

- `/moai gate` — 提交前质量门禁（lint + format + type + test）。
- `/moai review` — 包含安全性和 MX-tag 合规性检查的代码审查。
- `/moai fix` — 自动检测并修复 LSP/lint/type 错误。
- `/moai loop` — 迭代修复循环，直至问题解决或达到最大迭代次数。

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “这些 linter 警告是误报” | 对于误报，应使用行内注释进行抑制。忽略它们会让团队养成忽略真实问题的习惯。 |
| “安全扫描可以等到发布前再做” | 安全漏洞会不断累积。发现得越晚，返工成本越高。应持续进行扫描。 |
| “覆盖率已经足够高了，剩余 15% 都是边界情况” | 边界情况正是生产环境缺陷的高发之处。未覆盖的代码才是风险最高的代码。 |
| “代码审查是主观的，自动化检查就足够了” | 自动化可以发现语法问题和模式问题。代码审查则可以发现设计缺陷、命名混乱和抽象缺失。 |
| “对于热修复来说，TRUST 5 太官僚了” | 缺少质量门禁的热修复会引发下一次热修复。对热修复执行 TRUST 5 是最低要求，而不是最高要求。 |

**切斯特顿栅栏原则**：在移除质量检查之前，先理解当初为何要添加它。在不了解其历史的情况下移除关卡，会再次引发它原本旨在防止的故障。

**左移原则**：缺陷发现得越早，修复成本就越低。质量检查应置于开发循环中，而不是放在开发流程的末尾。

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 对代码检查器或类型检查器的警告进行全局抑制，而不是逐行抑制
- 在处理用户输入或身份验证时未查阅 OWASP 检查清单
- 对新增功能的提交未生成覆盖率报告
- 未提供理由便以“不适用”为由跳过 TRUST 5 维度
- 已生成质量报告，但未对发现的问题采取任何行动

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 代码检查器运行无误，或其余警告均带有说明理由的行内抑制注释（展示命令输出）
- [ ] 已针对与安全相关的变更审查 OWASP 检查清单（展示检查清单引用）
- [ ] 已生成覆盖率报告且达到阈值（展示工具输出）
- [ ] 已评估全部五个 TRUST 5 维度（展示每个维度的评估）
- [ ] 已对质量问题进行分类处置，并为每个问题制定解决计划
- [ ] 代码检查器配置中不存在全局禁用规则

<!-- moai:evolvable-end -->