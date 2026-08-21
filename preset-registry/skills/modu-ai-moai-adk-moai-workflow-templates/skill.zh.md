---
name: moai-workflow-templates
description: >
  Template management system for code boilerplates, feedback templates, scaffolding,
  and project optimization workflows. Use when creating templates, generating
  boilerplate files, or managing scaffolding.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
user-invocable: false
metadata:
  version: "3.1.0"
  category: "workflow"
  status: "active"
  updated: "2026-01-11"
  modularized: "true"
  tags: "workflow, templates, boilerplate, scaffolding, optimization, feedback"
  aliases: "moai-workflow-templates"
  replaces: "moai-core-code-templates, moai-core-feedback-templates, moai-project-template-optimizer"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000

# MoAI Extension: Triggers
triggers:
  keywords: ["template", "boilerplate", "scaffolding", "code template", "project template", "feedback template", "GitHub issue", "template optimization"]
  phases: ["plan"]
  agents: ["manager-project", "builder-skill"]
---
# 企业级模板管理

统一的模板系统，结合代码样板、反馈模板和项目优化工作流，实现快速开发并确保模式一致性。

## 快速参考

核心能力：

- 面向 FastAPI、React、Vue 和 Next.js 的代码模板库
- 涵盖 6 种类型的 GitHub Issue 反馈模板
- 项目模板优化与智能合并
- 模板版本管理与历史记录
- 备份发现与恢复
- 模式复用与自定义

适用场景：

- 搭建新项目或新功能的基础结构
- 使用 /moai:9-feedback 创建 GitHub Issue
- 在 MoAI-ADK 更新后优化模板结构
- 从项目备份中恢复
- 管理模板版本和自定义内容
- 生成样板代码

主要功能：

- 代码模板：FastAPI、React、Vue、Docker 和 CI/CD 模板
- 反馈模板：6 种 GitHub Issue 类型，包括缺陷、功能、改进、重构、文档和问题
- 模板优化器：智能合并、备份恢复和版本跟踪
- 模式库：适用于常见场景的可复用模式

模块快速入口：

- 代码模板文档位于 modules/code-templates.md
- 反馈模板文档位于 modules/feedback-templates.md
- 模板优化器文档位于 modules/template-optimizer.md

## 实施指南

### 功能

- 适用于常见架构的项目模板
- 遵循最佳实践的样板代码生成
- 可配置的模板变量和自定义选项
- 支持多种框架，包括 React、FastAPI 和 Spring
- 集成测试和 CI/CD 配置

### 适用场景

- 使用经过验证的架构模式快速启动新项目
- 确保组织内多个项目之间的一致性
- 使用合理的结构快速构建新功能原型
- 通过标准化的项目布局帮助新开发者入职
- 按照团队约定生成微服务或模块

### 核心模式

模式 1 - 模板结构：

模板按目录层级组织。顶层 templates 目录包含特定于框架的子目录。后端框架目录（例如 fastapi-backend）包含用于定义变量的 template.json，以及包含 main.py、models 子目录和 tests 子目录的 src 目录。前端框架目录（例如 nextjs-frontend）包含 template.json、app 目录和 components 目录。全栈模板包含相互独立的 backend 和 frontend 子目录。

模式 2 - 模板变量：

模板变量在包含两个主要部分的 JSON 配置文件中定义。variables 部分定义 PROJECT_NAME、AUTHOR、LICENSE 和 PYTHON_VERSION 等键值对。files 部分将文件模式映射到处理模式：标记为 substitute 的文件会替换变量，而标记为 copy 的文件会原样传输。

模式 3 - 模板生成：

模板生成过程遵循五个步骤。首先，加载模板目录结构。其次，替换标记为需要替换的文件中的变量。第三，原样复制静态文件。第四，运行生成后钩子，例如安装依赖项和初始化 git。第五，验证生成的项目结构。

## 核心模式详解

### 模式 1：代码模板脚手架

概念：使用生产就绪的样板代码快速搭建项目脚手架。

要生成项目，请加载适当的模板，例如 backend/fastapi。使用项目名称、所需功能（例如 auth、database 和 celery）以及自定义设置（例如数据库类型）配置脚手架。执行脚手架操作以创建项目结构。

有关完整的库和示例，请参阅代码模板模块文档。

---

### 模式 2：GitHub 反馈模板

概念：用于统一创建 GitHub Issue 的结构化模板。

六种模板类型：错误报告、功能请求、改进、重构、文档和问题/讨论。

集成：由 /moai:9-feedback 命令自动触发。

有关所有模板类型及其用法，请参阅反馈模板模块文档。

---

### 模式 3：模板优化与智能合并

概念：在保留用户自定义内容的同时，智能合并模板更新。

智能合并算法：三方合并过程如下。首先，从备份中提取用户自定义内容。其次，从当前模板中获取最新的模板默认值。最后，按照适当的优先级进行合并，其中 template_structure 使用最新的默认值，user_config 保留用户设置，custom_content 保留用户修改。

有关完整的工作流和示例，请参阅模板优化器模块文档。

---

### 模式 4：备份发现与恢复

概念：通过智能恢复实现自动化备份管理。

恢复流程：该流程分为四个步骤。首先，使用备份标识符加载备份元数据。其次，验证备份完整性，如果备份已损坏，则引发错误。第三，从经过验证的备份中提取自定义内容。第四，将提取的自定义内容应用到当前项目。

有关完整实现，请参阅模板优化器模块中有关恢复流程的章节。

---

### 模式 5：模板版本管理

概念：跟踪模板版本并维护更新历史记录。

版本跟踪：template_optimization 配置部分存储 last_optimized 时间戳、backup_version 标识符、template_version 版本号，以及包含 language、team_settings 和 domains 等项的 customizations_preserved 列表。

有关完整实现，请参阅模板优化器模块中有关版本跟踪的章节。

---

## 模块参考

### 核心模块

- modules/code-templates.md 中的代码模板：样板代码库、脚手架模式和框架模板
- modules/feedback-templates.md 中的反馈模板：6 种 GitHub Issue 类型、使用示例和最佳实践
- modules/template-optimizer.md 中的模板优化器：智能合并算法、备份恢复和版本管理

### 模块内容

代码模板包括 FastAPI REST API 模板、React 组件模板、Docker 和 CI/CD 模板，以及带有脚手架模式的模板变量。

反馈模板包括缺陷报告模板、功能请求模板、改进模板、重构模板、文档模板、问题模板，以及与 /moai:9-feedback 命令的集成。

模板优化器包括六阶段优化工作流、智能合并算法、备份发现与恢复，以及带历史记录的版本跟踪。

## 高级文档

有关详细的模式和实现策略，请参阅代码模板指南以获取完整的模板库，参阅反馈模板以获取议题模板参考，并参阅模板优化器以了解优化和合并策略。

## 最佳实践

### 核心要求

- 使用模板确保项目结构一致
- 更新期间保留用户自定义内容
- 在进行重大模板变更之前创建备份
- 遵循模板结构约定
- 记录自定义修改
- 使用智能合并更新模板
- 在配置中跟踪模板版本
- 在生产环境中使用之前测试模板

### 质量标准

[HARD] 应用变更之前，记录对所有模板默认设置的修改。
原因：模板默认设置是所有项目的基准，未记录的变更会在团队之间造成混乱和不一致。
影响：如果缺少文档，团队将无法理解默认设置为何偏离标准，从而导致维护问题和实现冲突。

[HARD] 执行模板优化工作流之前创建备份。
原因：模板优化涉及结构性变更，如果没有干净的还原点，这些变更可能难以撤销。
影响：缺少备份可能导致用户自定义内容永久丢失，需要手动重建项目特定的配置。

[HARD] 在模板更新工作流中解决所有合并冲突。
原因：未解决的冲突会导致配置损坏，使模板无法正常运行。
影响：忽略冲突会导致运行时错误、行为不一致和项目不稳定，需要紧急修复。

[SOFT] 在整个项目中保持一致的模板模式用法。
原因：混用不同的模板模式会增加认知负担，使代码库更难理解和维护。
影响：不一致的模式会降低代码的可预测性，并延长新团队成员的上手时间。

[HARD] 在所有模板更新过程中保留完整的自定义历史记录。
原因：自定义历史记录提供项目特定决策的审计轨迹，并支持回滚到之前的状态。
影响：历史记录丢失后，将无法了解变更的原因，从而无法对未来的修改做出明智决策。

[HARD] 在部署到生产环境之前，通过测试验证模板功能。
原因：未经测试的模板可能包含仅在生产环境中才会暴露的错误，从而导致系统故障。
影响：未经测试的模板导致生产故障，会造成停机、数据问题和紧急回滚，进而影响用户。

[SOFT] 在合理的复杂度限制内设计模板，以确保可维护性。
原因：模板过于复杂时，一旦出现问题，就会难以理解、修改和调试。
影响：过于复杂的模板会降低开发速度，并增加自定义过程中出错的可能性。

[HARD] 使用内置版本管理系统跟踪模板版本。
原因：版本跟踪有助于了解模板演变、检查兼容性并协调更新。
影响：如果没有版本跟踪，团队将无法确定哪些模板功能可用，也无法安全地协调跨项目更新。

## 配合使用效果良好

代理：

- workflow-project：项目初始化
- core-planner：模板规划
- workflow-spec：SPEC 模板生成

技能：

- moai-project-config-manager：配置管理和验证
- moai-cc-configuration：Claude Code 设置集成
- moai-foundation-specs：SPEC 模板生成
- moai-docs-generation：文档模板脚手架
- moai-core-workflow：模板驱动的工作流

命令：

- /moai:0-project：使用模板初始化项目
- /moai:9-feedback：选择反馈模板并创建议题

## 工作流集成

项目初始化工作流：使用模式 1 选择代码模板，搭建项目结构，应用自定义设置，并使用模式 5 初始化版本跟踪。

反馈提交流程：执行 /moai:9-feedback 命令，使用模式 2 选择议题类型，填写模板字段，并自动生成 GitHub 议题。

模板更新工作流：检测模板版本变更，使用模式 4 创建备份，使用模式 3 运行智能合并，并使用模式 5 更新版本历史记录。

## 成功指标

- 脚手架搭建时间：新项目为 2 分钟，而手动搭建需要 30 分钟
- 模板采用率：95% 的项目使用模板
- 自定义内容保留率：更新期间保留 100% 的用户内容
- 反馈完整率：95% 的 GitHub 议题包含完整信息
- 合并成功率：99% 的冲突自动解决

## 变更日志

- v3.1.0 (2026-01-11)：转换为 CLAUDE.md 文档标准，移除代码块和表格
- v3.0.0 (2026-01-08)：采用模块化架构的主版本
- v2.0.0 (2025-11-24)：将 moai-core-code-templates、moai-core-feedback-templates 和 moai-project-template-optimizer 统一为包含 5 个核心模式的单一技能
- v1.0.0 (2025-11-22)：最初的独立技能

---

状态：生产就绪（企业级）
模块化架构：SKILL.md + 3 个核心模块
集成：针对 Plan-Run-Sync 工作流进行了优化
生成工具：MoAI-ADK Skill Factory

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我会将模板文件直接添加到 .claude/，而不是 internal/template/templates/” | 模板优先规则是 HARD 要求。本地文件会在 moai update 时被覆盖。请编辑模板源文件。 |
| “此模板仅用于我们的项目，因此语言中立性并不适用” | 模板会分发给使用全部 16 种受支持语言的每一位 moai init 用户。必须保持语言中立。 |
| “make build 很慢，我直接手动复制文件即可” | 手动复制会导致其与 embedded.go 不一致。下一次 moai update 会在不作提示的情况下还原手动复制的内容。 |
| “与其参数化，不如直接硬编码模板变量，这样更简单” | 当用户使用不同的操作系统或用户名时，硬编码路径会失效。请使用 Go 模板变量或 $HOME。 |
| “我会跳过模板，添加一个仅限本地使用的覆盖项” | 本地覆盖项缺少文档记录且不可移植。应优先使用支持条件渲染的模板。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 在 `.claude/` 或 `.moai/` 中添加了新文件，但 `internal/template/templates/` 中没有对应文件
- 模板文件包含绝对路径（例如 /Users/username 或 /home/username）
- 模板文件更改后未执行 make build
- 当技能与语言无关时，模板文件却将某种特定编程语言硬编码为主要语言
- 在 `.sh.tmpl` 文件的回退路径中使用了 Go 模板变量 `.HomeDir`

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] `.claude/`、`.moai/`、`.agency/` 下的每个新文件都有对应的模板源文件
- [ ] 模板更改后 `make build` 成功执行（显示构建输出）
- [ ] 模板文件中没有用户特定的绝对路径（搜索 /Users/ 或 /home/）
- [ ] 包含语言列表的模板文件平等对待全部 16 种语言
- [ ] `.sh.tmpl` 文件使用 `$HOME` 作为回退路径，而不是 `.HomeDir`
- [ ] 本地副本与模板输出之间的 `diff` 未显示任何意外差异

<!-- moai:evolvable-end -->