---
name: moai-workflow-design
description: >
  Unified design workflow skill — handles Path A (Claude Design handoff bundle import,
  via Figma extractor when needed) and design-brief context loading from .moai/design/
  (research, system, spec). Validates DTCG tokens, enforces brand-context constitutional
  priority. Use for /moai design workflow — NOT for general design system documentation.

when_to_use: >
  Use for the /moai design workflow: Path A Claude Design handoff-bundle
  import (via Figma extractor when needed), design-brief context loading
  from .moai/design/, DTCG token validation, and brand-context
  constitutional priority.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "0.1.0"
  category: "workflow"
  status: "active"
  updated: "2026-05-22"
  tags: "design, import, handoff-bundle, claude-design, design-tokens, components, figma, meta-harness, brief, attach, context"
  related-skills: "moai-domain-brand-design, moai-workflow-gan-loop, moai-meta-harness, moai-domain-design-handoff"

progressive_disclosure:
  enabled: true
  level1_tokens: 120
  level2_tokens: 5000
---
# 设计工作流（`moai-workflow-design`）

统一的 `/moai design` 工作流技能。负责处理两项互补职责：

1. **设计产物导入** — 路径 A（Claude Design 交付包，ZIP/HTML）和路径
   B1（通过 meta-harness 使用 Figma 提取器）。生成经过 DTCG 验证的设计令牌，保存至
   `.moai/design/tokens.json`，供 `expert-frontend` 使用。
2. **设计简报上下文加载** — 在运行 `expert-frontend` 或
   `moai-domain-brand-design` 之前，自动将 `.moai/design/` 中人工编写的简报
   （`spec.md`、`system.md`、`research.md`）加载到编排器提示词中。

品牌上下文（`.moai/project/brand/`）是所有路径的根本性上位约束——任何
路径都不得覆盖品牌约束（设计章程 §3.1、§3.3）。

## 快速参考

**保留输出路径**（设计章程 §3.2，不得与人工文件冲突）：
`tokens.json`、`components.json`、`assets/`、`import-warnings.json`、`brief/BRIEF-*.md`、
`copy.json`、`path-selection.json`——均位于 `.moai/design/` 下。

**路径选择**（当 `/moai design` 需要进行选择时，通过 AskUserQuestion 展示）：
1. **路径 A — Claude Design**（推荐）— 交付包（ZIP 或 HTML）
2. **路径 B1 — Figma** — meta-harness 动态生成 `moai-harness-figma-extractor`

选择结果持久化至 `.moai/design/path-selection.json`。

**上下文加载优先级顺序**（来自已吸收的 design-context 技能的 REQ-2 / AC-4）：
`spec > system > research`。当超出令牌预算时，按相反优先级移除——绝不
移除 `spec`。默认 `token_budget: 20000`，来自 `design.yaml design_docs.token_budget`。

**令牌估算**：`estimated_tokens = ceiling(char_count / 4) * 1.10`。

## 实施指南

### 第 1 部分 — 路径 A：Claude Design 交付包

**支持的格式（第 1 阶段）**：
- `ZIP` — 包含 `manifest.json`、`tokens.json`、`components/`、`assets/` 的 Claude Design 导出文件
- `HTML` — 单文件 Claude Design 导出文件

**不支持的格式（第 2 阶段路线图）**：DOCX、PPTX、PDF、Canva 链接——返回
`DESIGN_IMPORT_UNSUPPORTED_FORMAT` 并引导至路径 B。

**版本白名单**：根据 `.moai/config/sections/design.yaml` 中的
`supported_bundle_versions` 检查 `manifest.json` 的 `format_version`。当前默认值：`["1.0"]`。
不匹配 → `DESIGN_IMPORT_UNSUPPORTED_VERSION`。

**解析流程**：
1. 从编排器接收交付包文件路径
2. 验证文件是否存在 → 若缺失则返回 `DESIGN_IMPORT_NOT_FOUND`
3. 验证格式（扩展名 + 魔数：ZIP 为 `PK\x03\x04`，HTML 为 DOCTYPE/`<html`）
4. **提取前进行安全扫描** — 列出 ZIP 条目；拒绝可执行文件（`.sh`、`.exe`、
   `.bat`、`.cmd`、`.ps1`、`.py`、`.rb`、`.pl`）、符号链接、路径遍历（`../`、`..\`）、
   绝对路径 → `DESIGN_IMPORT_SECURITY_REJECT`
5. 读取 `manifest.json`，验证版本
6. 提取：`tokens.json` → `.moai/design/tokens.json`；`components/` → `components.json`；
   `assets/**` → `.moai/design/assets/`；`copy.json` → `.moai/design/copy.json`
7. 验证令牌结构（必需键：`colors`、`typography`、`spacing`）；缺少
   键 → 警告，而非失败
8. 报告提取结果

**预期的 ZIP 结构**：`manifest.json`（format_version、claude_design_version、
created_at）+ `tokens.json`（colors、typography、spacing、radii、shadows）+ 可选的
`components/`（HTML 或 JSON 规范）+ 可选的 `assets/`（图像、字体、图标）+ 可选的
`copy.json`（结构化文案）。

**输出令牌模式**（标准化为 MoAI）：顶层键 `colors`、`typography`、
`spacing`、`radii`、`shadows`，以及 `source: "claude-design-bundle"` 和 `bundle_version`。

**字段标准化**（静默重命名，并记录到 import-warnings.json）：
`primary_color`/`brand_color` → `colors.primary`；`heading_font` →
`typography.fontFamily.heading`；`base_spacing` → `spacing.base`。

**资产安全**：验证图像 MIME（png、jpg、gif、webp、svg、ico）和字体格式
（woff2、woff、ttf、otf）。拒绝嵌套 ZIP。从 SVG 元数据中移除 script 标签。

### 第 2 部分 — 路径 B1：Figma 提取器（元编排器）

**前置条件**：编排器策略 `moai-meta-harness`。路径 B1 不提供
静态 Figma 技能，而是动态生成。当用户选择路径 B1 时，调用
`moai-meta-harness` 生成 `.claude/skills/harness-figma-extractor/SKILL.md`
（项目级，并通过 `harness-*` 前缀归用户所有——`moai update` 永不
覆盖）。元编排器第 5 阶段（定制）通过苏格拉底式访谈收集：
Figma 文件 ID、将页面映射到令牌类别的页面选择器、凭据引用
（环境变量名，例如 `FIGMA_TOKEN`；其值绝不存储在技能文件中）。生成的提取器
会在 `.moai/design/` 中生成 `tokens.json` + `components.json`；在
`expert-frontend` 使用之前运行 DTCG 验证。

### 第 3 部分 — 设计简报上下文加载

当 `design_docs.auto_load_on_design_command: true` 时，在 `/moai design` 的
B2.5 阶段自动加载人工编写的简报。也可以使用显式 `dir` 参数独立调用。

**配置解析**：从 `.moai/config/sections/design.yaml` 读取 `design_docs`。
如果不存在，则使用编译时内置的默认值：
- `dir: .moai/design`
- `auto_load_on_design_command: true`
- `token_budget: 20000`
- `priority: [spec, system, research]`

当该键不存在时，记录 `design_docs not configured — using defaults`。

**裸令牌 → 文件名映射**：
- `spec` → `<dir>/spec.md`
- `system` → `<dir>/system.md`
- `research` → `<dir>/research.md`

**步骤**：
1. **目录检查**：对 `<dir>/` 执行 Glob。缺失 → 仅输出标题，并记录
   `design docs not initialized — run /moai init or SPEC-DESIGN-DOCS-001 to create`。
2. **自动加载门控**：从 B2.5 阶段调用时，检查 `auto_load_on_design_command`。为 False → 跳过。
3. **并行读取**：在单个批处理并行工具调用集中发出所有候选文件的 Read。
4. **过滤 `_TBD_` 文件**：仅包含脚手架内容（空行、`_TBD_`、
   没有正文的标题或 `<!--`/`>` 注释）的文件会被跳过。记录
   `skip: <token> — _TBD_ only`。
5. **令牌预算执行**：按优先级顺序纳入文件，直至累计
   `estimated_tokens` 即将超出预算。溢出 → 丢弃最低优先级的内容（先丢弃 `research`，
   再丢弃 `system`；绝不丢弃 `spec`）。单个文件过大 → 在最近的
   `##`/`###` 边界处截断，并追加 `> truncated: <filename> at char_offset=N`。
6. **构建输出块**——第一个非空行必须恰好为 `## Design Context (from
   .moai/design/)`。对于每个文件，先添加 `> source: .moai/design/<filename>`，然后添加
   内容（或截断后的内容）。
7. **警告部分**（遇到无法读取的文件时）：在内容后追加
   `> warnings: [<token1> unreadable: <reason>, ...]`。

**全为 `_TBD_` 的情况**：仅输出标题并记录日志  
`design docs present but all are _TBD_ — no content loaded`.

### 错误代码（路径 A）

- `DESIGN_IMPORT_NOT_FOUND` — 缺少捆绑包路径 → 引导至路径 B
- `DESIGN_IMPORT_UNSUPPORTED_FORMAT` — 非 ZIP/HTML 格式 → 引导至路径 B
- `DESIGN_IMPORT_UNSUPPORTED_VERSION` — 版本不在白名单中。必需的 stderr（以下 3
  行缺一不可）：`Detected bundle version: v<N>`；`Supported versions: <list from
  design.yaml>`；`Switch to path B: run /moai design and select 'Code-based brand design'`.
- `DESIGN_IMPORT_SECURITY_REJECT` — 检测到可执行文件/符号链接/路径遍历/绝对路径。
  列出违规条目。不得创建 `.moai/design/` 目录。
- `DESIGN_IMPORT_MISSING_MANIFEST` — ZIP 中没有 `manifest.json` → 引导至路径 B

在每个错误后附加**回退指引**：指示用户在确保
`.moai/project/brand/visual-identity.md` 完整后，运行 `/moai design` 并
选择 "Code-based brand design (moai-domain-brand-design)"。

### 部分捆绑包恢复

有效捆绑包缺少可选组件 → 提取现有内容，将警告记录到
`.moai/design/import-warnings.json`，然后继续生成部分输出。绝不允许静默失败。

## 可良好配合的组件

`moai-domain-brand-design`（路径 B 回退方案/上下文消费者）、`moai-domain-design-handoff`
（为路径 A 生成 `claude-design-handoff/`）、`moai-workflow-gan-loop`（使用令牌和
上下文作为基线）、`moai-meta-harness`（为路径 B1 生成 Figma 提取器）、
`expert-frontend`（主要消费者）、`.claude/rules/moai/design/constitution.md`（品牌
优先级和保留路径）。

## 常见的自我辩解

- “对可信捆绑包跳过安全扫描” — “可信”无法验证。无一例外地扫描每个捆绑包。
- “预算紧张时丢弃 spec.md” — spec.md 的优先级为 1，绝不能丢弃。依次丢弃 research → system → 上报处理。
- “_TBD_ 文件包含有用的上下文” — `_TBD_` 表示仅有脚手架。应跳过，以免污染提示词。
- “路径 B1 需要硬编码的 Figma 提取器” — 路径 B1 使用 meta-harness 生成。禁止使用静态 Figma skill。
- “品牌上下文只是众多输入之一” — 品牌上下文是宪法级父级；发生冲突时应以品牌为准。

## 危险信号

- 未经安全扫描便继续解析捆绑包
- 接受包含 `../`、符号链接或可执行文件的 ZIP 条目
- 绕过 `manifest.json` 版本验证
- 设计上下文块缺少规范标题 `## Design Context (from .moai/design/)`
- 超出预算时丢弃 `spec.md`（违反优先级）
- 将 Figma API 令牌值存储在 skill 文件中（仅允许使用环境变量名）
- 将输出写入 `.moai/design/` 保留路径集之外

## 验证

- [ ] 路径 A 的安全扫描会拒绝包含 `..` 和符号链接的测试夹具
- [ ] 路径 A 生成具有标准化 schema 的 `.moai/design/tokens.json`
- [ ] 调用路径 B1 时会触发 `moai-meta-harness`（无静态 skill）
- [ ] 上下文加载输出以 `## Design Context (from .moai/design/)` 开头
- [ ] 因预算而截断时附加 `> truncated: <filename> at char_offset=N`
- [ ] 全为 `_TBD_` 时仅输出标题并记录日志
- [ ] 对路径 A 和路径 B1 的输出运行 DTCG 验证
- [ ] DTCG frozen-guard CI 测试引用此 skill 名称

REQ 覆盖范围：（内部来源已省略）..003，（路径 A）；REQ-1..16（上下文）。

<!-- 根据技能整合策略，从 moai-workflow-design-import + moai-workflow-design-context 吸收 -->