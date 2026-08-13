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
> **[仅限授权使用]** 本技能会写入或更新 `AGENTS.md`、`.agents/rules/`、可选的平台指令文件，以及目标项目中的时间戳备份。请先读取已检测到的输入与拟输出内容，在更改目标文件前先获取批准，并且仅在用户预期的项目范围内使用。

## 何时使用

当用户想要：

- 创建完整、项目特定的 `AGENTS.md`，而非通用代理规则；
- 为检测到的框架、测试、数据库、样式或多包仓库生成配套规则；
- 创建精简版 `AGENTS.md`、预览不写入的变更，或在技术栈变化后更新现有指令。

不要在未检查目标项目的情况下凭空编造约定、覆盖项目范围外的指令，也不要将生成的指引当作人工审核的替代。

基于目标项目生成定制化 `AGENTS.md` + `.agents/rules/*.md`，而非带占位符的模板，而是与项目实际工具链匹配的动态文档。

## 你会得到什么

对于使用 **Bun + Next.js 16 + Tailwind + Vitest + Server Actions** 的项目，本技能会生成：

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

不会生成的规则：`backend.md`（无 NestJS）、`database.md`（无 ORM）、`i18n.md`（硬编码西班牙语）、`forms.md`（手动输入）、`styling.md`（样式规则并入前端规则）。

## 激活约定

为目标项目生成 `AGENTS.md` + `.agents/rules/*.md`。切勿猜测——先读取项目的真实文件。

### 模式选择

| 用户表述 | 模式 | 输出 |
|-----------|------|--------|
| "simple AGENTS.md"、"just the basics"、"minimal" | **Minimal** | 单一 `AGENTS.md`（约 30 行，无规则文件） |
| "full AGENTS.md"、"with rules"、"complete"，或未明确指定 | **Full** | `AGENTS.md` + `.agents/rules/*.md` |
| "update AGENTS.md"、"refresh"、"my stack changed" | **Update** | 对现有内容做差异比对，仅重新生成变更部分 |

### 预览模式

如果用户要求“preview”“show what would change”“dry-run”，请执行完整检测但**不要**写入文件。展示检测摘要、将创建的文件、跳过的规则，以及示例输出。

## 硬性规则

- **先读后写，但绝不读取密钥。** 生成前读取 `package.json`、非密钥配置文件和目录结构。不要打开 `.env`、`.env.local`、凭据存储或其他可能包含密钥的文件。环境变量名称仅从 `.env.example` 的占位符和 `process.env.NAME` 类源码引用中提取，不读取或汇报其值。
- **先检测包管理器。** 检查 lockfile：`bun.lock`→bun、`pnpm-lock.yaml`→pnpm、`package-lock.json`→npm、`yarn.lock`→yarn。严禁默认使用 npm。所有命令必须使用检测到的包管理器。
- **仅生成适用内容。** 前端-only项目不生成后端规则；无 ORM 则不生成数据库规则。
- **默认不执行项目脚本。** 包管理器脚本是仓库控制的 shell 入口。可检测并记录候选的格式化/校验命令，但除非用户在审阅了精确脚本体与调用工具后另行请求执行，否则不要运行。
- **校验命令。** 输出中的每条命令都必须存在于 `package.json` 的 scripts 键中。
- **不允许占位符。** 检查输出中是否仍有 `{{`、`TODO`、`add here`、`...`。若有则拒绝。
- **先备份。** 如文件已存在，先复制到 `.agents/backups/`，并带时间戳。

## 执行步骤

### 通用

1. `git rev-parse --show-toplevel` → 项目根目录。
2. **先检测包管理器**：检查 lockfile。`bun.lock`→bun、`pnpm-lock.yaml`→pnpm、`package-lock.json`→npm、`yarn.lock`→yarn。严禁默认使用 npm。
3. 读取 `package.json`（scripts、依赖、workspaces）。保存脚本以供后续校验。
4. 读取非密钥配置文件并探索目录结构。排除 `.env*` 文件，除占位符-only 的 `.env.example` 外；不要读取密钥值。
5. 选择模式（如有歧义则提问）。

### Full 模式

1. 读取 `assets/agents-full.md`——这是包含全部章节和填充规则的 AGENTS.md 结构。
2. 读取项目文件并使用真实数据填充每个占位符，严禁使用泛化文字。
3. 在项目根目录生成 `AGENTS.md`。将内容包裹在 `<!-- AGENTS-GENERATED-START -->` / `<!-- AGENTS-GENERATED-END -->` 之间。
4. 对每个适用的规则类别，读取 `assets/` 中对应模板并在 `.agents/rules/` 生成规则文件。
5. 如果检测到 Claude（`.claude/` 或 `CLAUDE.md`）：从 `assets/claude.md` 生成精简版 `CLAUDE.md`。
6. 检测到平台文件时：从 `assets/platform.md` 生成对应文件。

### Minimal 模式

1. 读取 `assets/agents-minimal.md`——30 行标准 agents.md 格式。
2. 仅生成单一 `AGENTS.md`。

### Update 模式

1. 备份现有文件。
2. 重新检测项目状态。
3. 对旧版与新版进行差异对比。仅重新生成发生变化的分类。

### 生成后

- 报告检测到的 `[format cmd]` 与 `[lint cmd]` 作为未执行候选；两者都不自动运行，只有在用户另行授权且其精确的项目控制脚本体已审阅后才执行其中一个。
- 扫描 `{{`、`TODO`、`...`，如有则修复。
- 校验所有命令是否存在于 `package.json` 的 scripts 中。
- 若 `AGENTS.md` 超过 300 行，发出警告；若超过 500 行，将内容迁移至规则文件。
- 在声明完成前，用约定式提交格式总结所有变更。
- 报告：检测结果、生成内容、跳过内容，以及置信度评分。

## 输出约定

返回：
- 使用的模式及原因
- 已创建/修改的文件
- 检测摘要（全部类别）
- 已生成与已跳过的规则（附原因）
- 置信度评分

## 局限性

- 生成的指引为建议稿，需人工审核后才能采纳或提交。
- 命令校验仅限于目标项目可见的脚本和文件，无法证明工具、服务或特定平台命令在所有环境下可运行。
- 项目提供的 package 脚本是未经信任的可执行代码。生成与记录脚本并不代表可以运行它。
- 该技能未获得权限不得在目标项目范围外写入，也不能替代项目特定的安全、构建或部署评审。

## 参考

| 优先级 | 文件 | 用途 |
|----------|------|------|
| **必需** | `assets/agents-full.md` | 完整 AGENTS.md 模板，含全部 25+ 章节和填充规则 |
| **必需** | `assets/agents-minimal.md` | 30 行标准 AGENTS.md 模板 |
| Full 模式 | `assets/architecture.md` | 架构规则模板 |
| Full 模式 | `assets/frontend-patterns.md` | 前端模式模板 |
| Full 模式 | `assets/server-actions.md` | 服务端操作 / 后端模板 |
| Full 模式 | `assets/testing.md` | 测试策略模板 |
| Full 模式 | `assets/git-workflow.md` | Git 工作流模板 |
| Full 模式 | `assets/sdd-workflow.md` | SDD 工作流模板 |
| Full 模式 | `assets/styling.md` | 样式规则模板 |
| Full 模式 | `assets/forms.md` | 表单模式模板 |
| Full 模式 | `assets/database.md` | 数据库规则模板 |
| Full 模式 | `assets/i18n.md` | 国际化规则模板 |
| Full 模式 | `assets/backend.md` | 后端 / NestJS 模板 |
| 条件 | `assets/claude.md` | CLAUDE.md——仅在检测到 Claude 时生成 |
| 条件 | `assets/platform.md` | 多平台文件 |
| 条件 | `assets/agents-nested.md` | Monorepo 嵌套式 AGENTS.md |
| 参考 | `references/decision-matrix.md` | 完整检测逻辑与边界场景 |
| 参考 | `references/example-output/README.md` | 质量基准 |
| 参考 | `references/template-filling-guide.md` | 占位符填充规则 |
