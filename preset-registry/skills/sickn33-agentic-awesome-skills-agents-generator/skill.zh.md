---
name: agents-generator
description: "Generate project-specific AGENTS.md and companion rules by analyzing a codebase. Supports full, minimal, update, and dry-run modes with package-manager detection, monorepos, backups, managed blocks, confidence scoring, and command validation."
category: developer-tools
risk: critical
source: https://github.com/OJPalenzuela/agents-generator/tree/7a3201208a01bd25e69ad11e665efc1392f5356a
source_repo: OJPalenzuela/agents-generator
source_type: community
date_added: "2026-08-02"
author: OJPalenzuela
tags: [agents-md, project-conventions, developer-tools, codebase-analysis, ai-agents]
tools: [claude, cursor, copilot, opencode, codex, gemini]
license: MIT
license_source: https://github.com/OJPalenzuela/agents-generator/blob/7a3201208a01bd25e69ad11e665efc1392f5356a/LICENSE
allowed-tools: Read Write Edit Bash(ls:*) Bash(git:*) Bash(tree:*) Bash(find:*) Grep Glob WebFetch
metadata:
  author: OJPalenzuela
  version: "1.2.3"
---
# 技能：agents-generator

> [!WARNING]
> **[仅限授权使用]** 此技能会写入或更新 `AGENTS.md`、`.agents/rules/`、可选平台说明文件，以及目标项目中的时间戳备份文件。请先读取已检测到的输入与拟输出内容，获得批准后再修改目标文件，并且仅在用户预期的项目范围内使用。

## 使用时机

当用户希望：

- 创建完整、项目特定的 `AGENTS.md`，而非通用代理规则；
- 为检测到的框架、测试、数据库、样式或 monorepo 包生成配套规则；
- 生成精简版 `AGENTS.md`、预览变更而不写入，或在技术栈变更后更新现有说明。

不要将其用于在未检查目标项目的情况下发明约定、覆盖范围外的说明，或将生成的指南当作人工评审的替代。

该技能会为目标项目生成定制化 `AGENTS.md` + `.agents/rules/*.md`，而不是带占位符的模板，而是与项目真实工具链匹配的可持续文档。

## 可产出内容

从使用 **Bun + Next.js 16 + Tailwind + Vitest + Server Actions** 的项目中，技能会生成：

```
AGENTS.md
├── Setup commands: bun install, bun dev, bun run test:run, bun doctor
├── Verification Cycle: bunx tsc --noEmit → bun run lint → bun run test:run → bun doctor
├── Conventions: "Bun always. Plain TypeScript types + guards."
└── Architecture → .agents/rules/architecture.md

.agents/rules/
├── architecture.md       ← ASCII diagram with real directories, exact versions
├── frontend-patterns.md  ← Component rules, state locations, trust boundaries
├── server-actions.md     ← downloadVideo() flow, DownloadResult type, rate limiter
├── testing.md            ← "74 tests in 5 files", vitest commands, mock patterns
├── git-workflow.md       ← Conventional commits, pre-commit checks
└── sdd-workflow.md       ← Preflight defaults, post-apply verification
```

不生成的规则：`backend.md`（无 NestJS）、`database.md`（无 ORM）、`i18n.md`（硬编码为西班牙语）、`forms.md`（手动输入）、`styling.md`（Tailwind 已包含在前端规则中）。

## 激活约定

为目标项目生成 `AGENTS.md` + `.agents/rules/*.md`。不得猜测——必须先读取项目的实际文件。

### 模式选择

| 用户表述 | 模式 | 输出 |
|-----------|------|--------|
| "simple AGENTS.md", "just the basics", "minimal" | **Minimal** | 单个 `AGENTS.md`（约 30 行，无规则文件） |
| "full AGENTS.md", "with rules", "complete" 或默认 | **Full** | `AGENTS.md` + `.agents/rules/*.md` |
| "update AGENTS.md", "refresh", "my stack changed" | **Update** | 对现有内容做差异对比，仅重新生成变更部分 |

### 干运行模式

如果用户要求 “preview”“show what would change”“dry-run”：执行全部检测但不写入文件。展示检测摘要、将创建的文件、跳过的规则以及示例输出。

## 强制规则

- **先读后写，但禁止读取密钥。** 先读取 `package.json`、非密钥配置文件和目录结构后再生成任何内容。严禁打开 `.env`、`.env.local`、凭据存储或其他包含密钥的文件。环境变量名只可从 `.env.example` 的占位符和如 `process.env.NAME` 的源码引用中推断，不得读取或报告其值。
- **优先检测包管理器。** 检查锁文件：`bun.lock`→bun，`pnpm-lock.yaml`→pnpm，`package-lock.json`→npm，`yarn.lock`→yarn。严禁默认使用 npm。所有命令均按检测到的包管理器执行。
- **只生成适用项。** 前端-only 项目不生成后端规则；没有 ORM 就不生成数据库规则。
- **默认不执行项目脚本。** 仓库脚本是由仓库控制的 shell 入口。检测并记录候选的格式化/校验命令，但除非用户在精确查看脚本体和所调用工具后另行请求执行，否则不要运行。
- **校验命令。** 输出中的每个命令都必须存在于 `package.json` 的 scripts 键中。
- **不使用占位符。** 扫描输出中的 `{{`、`TODO`、`add here`、`...`。若仍有出现则拒绝。
- **先备份。** 若文件已存在，先复制到 `.agents/backups/`，并带时间戳。

## 执行步骤

### 通用

1. `git rev-parse --show-toplevel` → 项目根目录。
2. **优先检测包管理器**：检查锁文件。`bun.lock`→bun，`pnpm-lock.yaml`→pnpm，`package-lock.json`→npm，`yarn.lock`→yarn。严禁默认 npm。
3. 读取 `package.json`（scripts、deps、workspaces）。保存 scripts 以供校验。
4. 读取非密钥配置文件并探索目录结构。排除除仅占位符形式 `.env.example` 外的 `.env*` 文件；禁止读取密钥值。
5. 选择模式（若不明确则询问）。

### 全量模式

1. 读取 `assets/agents-full.md`——该文件为含所有章节和填充规则的 AGENTS.md 结构。
2. 读取项目文件并用真实数据填充每个占位符。严禁使用通用文本。
3. 在项目根目录生成 `AGENTS.md`。将内容包裹在 `<!-- AGENTS-GENERATED-START -->` / `<!-- AGENTS-GENERATED-END -->` 之间。
4. 对每个适用的规则类别，从 `assets/` 中读取对应模板并在 `.agents/rules/` 中生成规则文件。
5. 若检测到 Claude（`.claude/` 或 `CLAUDE.md`）：从 `assets/claude.md` 生成精简版 `CLAUDE.md`。
6. 若检测到平台文件：从 `assets/platform.md` 生成。

### 精简模式

1. 读取 `assets/agents-minimal.md`——30 行标准 agents.md 格式。
2. 生成单个 `AGENTS.md`。

### 更新模式

1. 备份现有文件。
2. 重新检测项目状态。
3. 对比新旧内容。仅重新生成发生变化的类别。

### 后续生成

- 上报检测到的 `[format cmd]` 和 `[lint cmd]` 作为未执行候选项。两者都不要自动运行；仅在用户另行授权且精确审阅了其脚本体和所调用工具后再执行。
- 扫描 `{{`、`TODO`、`...`。若发现，修复后再继续。
- 校验所有命令都存在于 `package.json` scripts 中。
- 若 AGENTS.md 超过 300 行则告警；若超 500 行则将内容迁移至规则文件。
- 在声明完成前，使用约定式提交格式总结所有更改。
- 报告：已检测内容、已生成内容、已跳过内容及置信度评分。

## 输出约定

返回以下内容：
- 使用的模式及原因
- 创建/修改的文件
- 检测摘要（全部类别）
- 已生成与已跳过的规则（含原因）
- 置信度评分

## 限制

- 生成的说明为提案，必须经过人工审核后才可采纳或提交。
- 命令校验仅限于目标项目内可见的脚本与文件，无法证明工具、服务或平台特定命令在所有环境下都可用。
- 项目提供的包脚本是“非可信”的可执行代码。生成与记录某脚本并不代表授权运行该脚本。
- 该技能不授权在用户意图范围外写入，也不替代项目特定的安全、构建或部署审核。

## 参考

| 优先级 | 文件 | 用途 |
|----------|------|------|
| **必需** | `assets/agents-full.md` | 含全部 25+ 章节和填充规则的完整 AGENTS.md 模板 |
| **必需** | `assets/agents-minimal.md` | 30 行标准 AGENTS.md 模板 |
| 全量模式 | `assets/architecture.md` | 架构规则模板 |
| 全量模式 | `assets/frontend-patterns.md` | 前端模式模板 |
| 全量模式 | `assets/server-actions.md` | Server Actions / 后端模板 |
| 全量模式 | `assets/testing.md` | 测试策略模板 |
| 全量模式 | `assets/git-workflow.md` | Git 工作流模板 |
| 全量模式 | `assets/sdd-workflow.md` | SDD 工作流模板 |
| 全量模式 | `assets/styling.md` | 样式规则模板 |
| 全量模式 | `assets/forms.md` | 表单模式模板 |
| 全量模式 | `assets/database.md` | 数据库规则模板 |
| 全量模式 | `assets/i18n.md` | i18n 规则模板 |
| 全量模式 | `assets/backend.md` | 后端/NestJS 模板 |
| 条件性 | `assets/claude.md` | CLAUDE.md——仅当检测到 Claude 时 |
| 条件性 | `assets/platform.md` | 多平台文件 |
| 条件性 | `assets/agents-nested.md` | Monorepo 嵌套 AGENTS.md |
| 参考 | `references/decision-matrix.md` | 完整检测逻辑与边界情形 |
| 参考 | `references/example-output/README.md` | 质量基准 |
| 参考 | `references/template-filling-guide.md` | 占位符填充规则
