---
name: moai-workflow-project
description: >
  Integrated project management system covering documentation, language initialization,
  template optimization, docs generation, and JIT document loading. Absorbed from
  moai-workflow-templates, moai-docs-generation, and moai-workflow-jit-docs.

when_to_use: >
  Use for integrated project management: documentation scaffolding
  (product/structure/tech.md), multilingual language initialization,
  template and boilerplate optimization, docs generation (Sphinx, MkDocs,
  TypeDoc, OpenAPI), and JIT document loading.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Bash(git:*), Bash(npm:*), Bash(npx:*), Bash(uv:*), Bash(pip:*), Bash(ls:*), Bash(mkdir:*), Grep, Glob, WebFetch, WebSearch
user-invocable: false
metadata:
  version: "3.0.0"
  category: "workflow"
  status: "active"
  updated: "2026-04-25"
  modularized: "true"
  tags: "workflow, project, documentation, initialization, templates, boilerplate, scaffolding, jit-docs, docs-generation"
  aliases: "moai-workflow-project"
  related-skills: "moai-workflow-spec, moai-workflow-docs-claim-check"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# MoAI Workflow 项目——集成式项目管理系统

一个综合性的项目管理系统，将文档生成、多语言支持和模板优化集成到统一架构中，并提供智能自动化和 Claude Code 集成。

范围：将文档管理、语言初始化和模板优化整合为一个统一且协调的系统，支持从初始化到维护的完整项目生命周期。

目标用户：用于项目设置、文档生成、多语言支持和性能优化的 Claude Code 智能体。

---

## 快速参考

核心能力：

- 文档管理：基于模板的生成，支持多语言
- 语言初始化：检测、配置、本地化
- 模板优化：包含性能优化的分析
- 统一接口：所有能力的单一入口

主要功能：

- 自动检测项目类型并选择模板
- 多语言文档（英语、韩语、日语、中文）
- 具备基准测试功能的智能模板优化
- SPEC 驱动的文档更新
- 多格式导出（Markdown、HTML、PDF）

支持的项目类型：Web 应用、移动应用、CLI 工具、库、ML 项目。

---

## 实施指南

### 模块架构

三个能力领域：

- 文档管理：基于模板的生成、项目类型检测、多语言支持、SPEC 集成、多格式导出
- 语言初始化：自动检测、配置管理、智能体提示词本地化、区域设置管理
- 模板优化：复杂度分析、性能优化、备份/恢复、基准测试

### 核心工作流

三个工作流：项目初始化、根据 SPEC 生成文档、模板性能优化。每个工作流均遵循三步模式（配置 → 执行 → 审查结果）。

有关详细的分步流程，请参阅[核心工作流演练](references/workflows.md)。

### 语言与本地化

自动语言检测：分析文件内容、配置文件、系统区域设置和目录结构。

多语言文档：特定语言的目录（例如 `docs/ko`、`docs/en`）、语言协商、自动重定向。

智能体提示词本地化：特定语言的指令、文化语境、令牌成本优化。

有关令牌成本分析和区域设置配置，请参阅[语言与本地化详情](references/language-localization.md)。

### 模板优化

性能分析：文件大小、复杂度、性能瓶颈、优化机会、资源使用情况、备份建议。

优化技术：减少空白、结构优化、降低复杂度、性能缓存。

### 配置管理

集成配置涵盖项目元数据、语言设置与成本、文档状态、模板优化结果、模块初始化状态。

语言设置：conversation_language（面向用户）、agent_prompt_language（内部使用，通常为英语以降低成本）、文档语言（按语言分别设置）。

更新会触发配置文件修改、文档结构更新和模板本地化。

有关完整字段参考和支持的语言元数据，请参阅[配置模式和语言字段](references/configuration.md)。

---

## 高级实现

有关高级模式（自定义模板、性能缓存、批处理、集成工作流），请参阅 [references/reference.md](references/reference.md) 和 [references/examples.md](references/examples.md)。

---

## 资源

### 性能指标

| 操作 | 典型耗时 |
|-----------|------------------|
| 完整文档生成 | 2-5 秒 |
| 语言检测分析 | ~500 ms |
| 模板优化 | 10-30 秒 |
| 配置更新 | ~100 ms |

内存：基础占用约 50MB，大型项目额外占用 10-50MB，优化缓存占用 5-20MB。

文件大小：每个项目的文档为 50-200KB，优化备份与原文件大小相同，配置文件为 5-10KB。

---

## 可配合使用

- moai-foundation-core：核心执行模式和 SPEC 驱动的工作流
- moai-foundation-cc：Claude Code 集成和配置
- moai-workflow-docs：统一文档管理
- moai-workflow-templates：模板优化策略
- moai-library-nextra：文档架构

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “项目文档只需设置一次，无须持续更新” | 过时的 product.md 和 tech.md 会误导每一个基于它们编写的 SPEC。它们是需要持续维护的文档。 |
| “代码库变化不大，所以 structure.md 会一直保持准确” | 每个新增目录的 PR 都会使 structure.md 失效。每次调用 /moai project 时都应同步。 |
| “我了解技术栈，不需要 tech.md” | tech.md 不是为你准备的，而是为每一个在执行操作前查阅项目上下文的智能体准备的。 |
| “生成 codemaps 太耗时” | codemaps 是唯一能让智能体无须读取每个文件便可获得文件级认知的产物，其收益足以抵消成本。 |
| “我会在功能完成后编写项目文档” | 事后编写的文档记录的是实际构建的内容，而非最初的意图。功能开发前编写的文档能够指导构建过程。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- product.md 引用了代码库中不存在的功能
- tech.md 列出的框架版本与实际依赖文件中的版本不同
- structure.md 缺少磁盘上实际存在的目录
- 项目拥有 10 个以上源文件，但 codemaps/ 目录为空或不存在
- /moai project 上次运行已超过 30 天（检查文件修改日期）

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] product.md 存在并描述了当前产品范围（与 README 比较）
- [ ] tech.md 列出的依赖项与实际锁定文件一致（package.json、go.mod 等）
- [ ] structure.md 中的顶层目录与项目根目录的 `ls` 输出一致
- [ ] codemaps/ 中每个主要包或模块至少包含一个 codemap 文件
- [ ] 所有三份文档均已在当前会话中或自上次结构变更后更新
- [ ] 生成的文档中未残留占位文本（“TODO”、“TBD”）

<!-- moai:evolvable-end -->

---

## 模板优化（整合自 moai-workflow-templates）

代码样板、反馈模板、脚手架和项目模板优化。

### 核心能力

- 代码模板库：FastAPI、React、Vue、Next.js 样板
- GitHub Issue 反馈模板：6 种类型（错误、功能、问题、文档、性能、安全）
- 项目模板优化：缩减大小、复杂度分析、智能合并
- 模板版本管理、备份发现与恢复

### 模板应用工作流

1. 识别模板类别：代码样板、反馈模板或项目脚手架
2. 选择与项目技术栈和语言匹配的模板变体
3. 应用自定义变量（项目名称、作者、许可证、框架版本）
4. 根据模式或现有约定验证渲染后的输出
5. 可选择运行模板优化器以减少冗余

### 模板优化流程

分析指标：文件大小、复杂度评分、冗余率、加载性能。
优化技术：减少空白、去重、简化结构。
应用优化前始终创建备份（`backup: true`）。

---

## 文档生成（整合自 moai-docs-generation）

使用 Sphinx、MkDocs、TypeDoc、OpenAPI 和 Nextra 生成技术文档。涵盖项目配置发现、如何与现有文档站点集成，以及使框架文档和技术指南内容保持最新的最佳实践。

### 支持的生成器

| 生成器 | 使用场景 | 主要格式 |
|-----------|----------|----------------|
| Sphinx | Python 项目、API 文档 | RST / Markdown |
| MkDocs | 通用项目 | Markdown |
| TypeDoc | TypeScript 库 | TypeScript JSDoc |
| OpenAPI / Swagger | REST API | YAML / JSON |
| Nextra | Next.js 文档站点 | MDX |

### 生成工作流

1. 检测项目类型并选择适当的生成器
2. 提取文档来源：文档字符串、JSDoc、OpenAPI 规范、SPEC 文档
3. 应用 `.moai/config/sections/language.yaml` 中的项目语言和品牌设置
4. 以配置的格式（Markdown、HTML、PDF）生成输出
5. 更新 `/moai sync` 产物：README、CHANGELOG、API 参考文档

---

## JIT 文档加载（整合自 moai-workflow-jit-docs）

JIT 文档（即时文档）——根据用户意图和对话上下文，按需发现并加载文档。

### 主要工具

- WebSearch/WebFetch（``, ``）：官方库文档
- WebFetch / WebSearch：最新在线文档
- Read、Grep、Glob：本地项目文档

### 触发模式

- 用户询问有关某个库或框架的具体技术问题
- 检测到技术关键词（库名称、框架名称、API 名称）
- 需要领域专业知识（身份验证、数据库、部署）
- 运行阶段需要实施指导

### 加载优先级

1. 本地项目文档（`.moai/`、README、SPEC 文档）
2. WebSearch/WebFetch（官方且版本匹配的库文档）
3. WebSearch + WebFetch（最新在线资源）

令牌预算：每次 JIT 加载 5000 个令牌。如果源内容超出预算，请进行总结。