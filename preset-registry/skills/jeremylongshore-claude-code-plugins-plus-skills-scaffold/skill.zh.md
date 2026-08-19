---
name: scaffold
description: |
  Use when starting hyperflow in a new project, refreshing the .hyperflow/ cache, or installing auto-detection shims (AGENTS.md, CLAUDE.md). One-shot project setup; does not start the spec → scope → dispatch chain.
  Trigger with /hyperflow:scaffold, "init hyperflow", "set up hyperflow", "refresh hyperflow", "install hyperflow shims".
allowed-tools: Read, Write, Edit, Bash(git:*), Bash(sha256sum:*), Bash(ls:*), Bash(find:*), Bash(scripts/*:*), Glob, Grep, Agent, AskUserQuestion
argument-hint: "[--tools all|claude-code|opencode|agents|codex|cursor|antigravity|grok] [--force] [--dry-run]"
version: 3.1.3
license: MIT
compatibility: Designed for Claude Code
tags: [setup, initialization, project-analysis]
---
# 脚手架

一次性项目设置。分析代码库，构建 `.hyperflow/` 缓存，初始化记忆骨架，并可选地为其他 AI 工具安装检测垫片。不会启动计划 → 分派链——准备就绪后请调用 `/hyperflow:plan`。

## 第 1 步 — 分析缓存

检查项目根目录是否存在 `.hyperflow/`。

**如果不存在 — 分派并行搜索器（单条消息，六次 Agent 调用）：**

| 标签 | 生成的文件 | 发现内容 |
|---|---|---|
| `Searcher — analyzing tech stack` | `profile.md` | 名称、语言、框架、构建命令 |
| `Searcher — mapping folder structure` | `architecture.md` | 目录、模式、路由、数据流 |
| `Searcher — extracting conventions` | `conventions.md` | 命名、风格、代码检查规则 |
| `Searcher — scanning dependencies` | `dependencies.md` | UI 库、状态管理、数据获取、数据库、认证 |
| `Searcher — auditing test setup` | `testing.md` | 运行器、E2E、模式、命令 |
| `Searcher — reading git workflow` | `git-workflow.md` | 分支、提交、CI/CD、PR 约定 |

有关每个文件所包含内容，请参阅 [project-analysis.md](references/project-analysis.md)。

**如果存在 — 过期检查：**
计算已跟踪配置文件的 SHA256，并与 `.hyperflow/.checksums` 进行比较。仅刷新过期文件。输出 `Refreshing — <comma-separated list of stale files>`。

**分析完成后：**
- 写入 `.hyperflow/.checksums`（`package.json`、`tsconfig.json`、eslint/biome 配置等文件的 SHA256）
- 写入 `.hyperflow/.version`（来自 `skills/hyperflow/VERSION` 的当前插件版本），以便将缓存标记为当前版本。会话启动迁移器（`scripts/migrate-cache.py`）会在后续会话中读取此标记，并在插件版本变更时将旧缓存向前迁移——缺失或旧版本标记会触发幂等的增量迁移（新增记忆文件、刷新原则副本）。
- 如果 `.hyperflow/` 尚未被排除，则追加到 `.gitignore`

## 第 2 步 — 记忆骨架

如果不存在，则创建 `.hyperflow/memory/`：

```
.hyperflow/memory/
├── doctrine.md          ← copied from skills/hyperflow/DOCTRINE.md
├── index.md
├── learnings.md         ← empty stub (populated by /hyperflow:dispatch wrap-up)
├── decisions.md
├── pitfalls.md
├── patterns.md
├── conventions.md
├── session-context.md   ← [populated by session-start hook, NOT by scaffold]
└── archive/.gitkeep
```

**session-context.md — 由会话启动钩子填充，而非 scaffold：**
Scaffold 会创建空的 `.hyperflow/memory/` 目录；它**不会**写入 `session-context.md`。该文件由 `hooks/session-start` 在每个 Claude Code 会话开始时生成，它会将 `.hyperflow/profile.md`、`architecture.md` 和 `conventions.md` 拼接为一个打包文件。这实现了模式 L3（会话缓存上下文）：精简工作器读取一个打包文件，而非三个独立的源文件。

**限制：**在会话期间对 `profile.md`、`architecture.md` 或 `conventions.md` 所做的修改，直到下一次会话启动前都不会传播到 `session-context.md`。如果工作器怀疑内容已过期，仍可直接 `Read` 源文件。

**生成 `doctrine.md`（幂等）：**
- 来源：`skills/hyperflow/DOCTRINE.md`（规范的编排规则）
- 如果 `.hyperflow/memory/doctrine.md` 不存在，则复制它。
- 如果它已存在，则将其修改时间戳（或 SHA256）与来源文件进行比较。如果来源较新，则重新复制。如果已是最新，则跳过并打印 `doctrine.md — checksum match`。
- 这启用了模式 P5（精简工作者提示）：工作者按需 `Read` doctrine，而不是在每个提示中内联接收它。

**`learnings.md`（幂等）：**
- 如果不存在，则创建一个空存根，内容为单个标题 `# Learnings` 和一行 `<!-- populated by /hyperflow:dispatch wrap-up -->`。
- 如果它已存在且包含内容，则**不要**覆盖。必须在刷新期间保留先前运行中累积的 learnings。

**其他存根**：如果 `decisions.md`、`pitfalls.md`、`patterns.md`、`conventions.md` 中的任意文件不存在，则将其创建为空存根：一个与文件名相匹配的标题式 H1，以及一行 `<!-- to be populated by future runs -->`。

**不要为 `index.md` 创建存根。** 它是派生文件——`scripts/memory-index.py` 会在每个会话开始时根据类别文件写入它。手写存根会在下一次运行时被覆盖。

**精简提示说明：** scaffold 现已填充 memory 骨架。运行 `/hyperflow:dispatch` 后，工作者将默认使用 `skills/hyperflow/worker-prompt-lean.md`；传入 `--thorough` 可回退到完整的内联模板。

**迁移：** 如果 `~/.claude/hyperflow-memory.md` 存在，请将与当前项目路径匹配的条目迁移到相应的 memory 文件中。为迁移的条目添加 `[migrated]` 标签。

## 第 3 步 —— 检测垫片

提供运行 `scripts/setup-detection.sh --tools all` 的选项，以生成 AGENTS.md、CLAUDE.md 和特定提供商的垫片。

支持的工具：`claude-code`（CLAUDE.md）、`opencode` / `agents` / `codex` / `cursor`（AGENTS.md）、`antigravity`（AGENTS.md + `.agent/workflows/`）、`grok`（AGENTS.md + `.grok/rules/hyperflow.md`）、`all`（所有工具）。

标志 —— `--tools <all|claude-code|opencode|agents|codex|cursor|antigravity|grok>`、`--force`、`--dry-run`。

默认值 —— `--tools all`。通过 `AskUserQuestion` 询问一次用户是否要跳过任意工具。

## 第 4 步 —— 摘要

打印已创建、已跳过和已迁移的内容（风格优雅，不使用图标）：

```text
Hyperflow 初始化完成
  已创建   .hyperflow/{profile,architecture,conventions,dependencies,testing,git-workflow}.md
  已创建   .hyperflow/.checksums
  已创建   .hyperflow/memory/doctrine.md — 已从 skills/hyperflow/DOCTRINE.md 复制
  已创建   .hyperflow/memory/{index,learnings,decisions,pitfalls,patterns,conventions}.md
  已创建   .hyperflow/memory/session-context.md — 由 hooks/session-start 填充（非 scaffold）
  已跳过   .gitignore 条目 — 已存在
  已迁移   来自 ~/.claude/hyperflow-memory.md 的 3 个条目
  垫片     AGENTS.md、CLAUDE.md

Memory 骨架已填充 —— 工作者将默认使用精简提示（skills/hyperflow/worker-prompt-lean.md）。
向 /hyperflow:dispatch 传入 --thorough 可回退到完整的内联模板。
```

## 交接

此技能**不会**自动串联。初始化是项目设置，而不是功能开发。当用户想要开始开发功能时，应调用 `/hyperflow:plan`。

## 规范

完整规则见 [DOCTRINE.md](../hyperflow/DOCTRINE.md)。输出风格见 [output-style.md](references/output-style.md)。

## 概览

`/hyperflow:scaffold` 是一次性项目设置。它通过 6 个并行搜索器分析代码库，构建 `.hyperflow/` 缓存（profile、architecture、conventions、dependencies、testing、git-workflow），初始化 memory 骨架，并可选地写入检测 shim（CLAUDE.md、AGENTS.md、Grok 规则、Antigravity workflows）。它不会启动 plan → dispatch 链——准备就绪后请调用 `/hyperflow:plan`。

## 前置条件

- Git 仓库（建议使用，以便进行 tag 检测和 git-workflow 分析；如果不存在也能优雅降级）。
- 对项目根目录具有写入权限，以创建 `.hyperflow/`。
- 仅迁移时需要：此前全局安装遗留的 `~/.claude/hyperflow-memory.md`。

## 指令

编号步骤位于上方的 [步骤 1 — 分析缓存](#step-1--analysis-cache) 至 [步骤 4 — 摘要](#step-4--summary) 中。摘要：

1. 检查项目根目录是否存在 `.hyperflow/`；如果不存在，则在一条消息中派发 6 个并行搜索器，生成 profile.md、architecture.md、conventions.md、dependencies.md、testing.md、git-workflow.md。
2. 如果存在，则重新计算 SHA256 校验和，仅刷新过期文件。
3. 创建 `.hyperflow/memory/` 骨架：将 `skills/hyperflow/DOCTRINE.md` 复制为 `doctrine.md`（幂等——仅当源文件较新时重新复制）；创建空的 `learnings.md` 占位文件（如果已有内容则跳过）；如果不存在，则创建 `decisions.md`、`pitfalls.md`、`patterns.md`、`conventions.md` 占位文件。`index.md` 和 `.checksums` 是派生文件——留给 `scripts/memory-index.py` 处理。
4. 如果找到遗留的 `~/.claude/hyperflow-memory.md`，则迁移其中匹配的条目。
5. 当用户选择这些工具时，提供 `scripts/setup-detection.sh --tools all`，以写入 CLAUDE.md、AGENTS.md 以及 Grok/Antigravity shim。
6. 打印已创建 / 已跳过 / 已迁移工件的摘要。

## 输出

参见上方 [步骤 4 — 摘要](#step-4--summary) 下的摘要块。格式：纯英文，使用 em-dash 分隔，包含 Created / Skipped / Migrated / Shims 各部分。不使用图标。

步骤 2 会在 `.hyperflow/memory/` 下生成以下文件：

| 文件 | 来源 | 幂等性 |
|---|---|---|
| `doctrine.md` | 从 `skills/hyperflow/DOCTRINE.md` 复制 | 如果源文件较新则重新复制；如果校验和匹配则跳过 |
| `learnings.md` | 空占位文件（包含 `# Learnings` 标题） | 如果已有内容则永不覆盖——保留已积累的学习内容 |
| `decisions.md`、`pitfalls.md`、`patterns.md`、`conventions.md` | 空占位文件 | 如果不存在则创建；如果已存在则跳过 |
| `index.md`、`.checksums` | 由 `scripts/memory-index.py` 派生（不是 scaffold） | Scaffold 不会创建这些文件；session-start hook 会在每次运行时根据类别文件重新构建它们。 |
| `session-context.md` | 由 `hooks/session-start` 填充（不是 scaffold） | Scaffold 不会创建此文件；session-start hook 会在会话开始时通过拼接 `profile.md`、`architecture.md` 和 `conventions.md` 生成它。精简 worker 会引用此捆绑内容（模式 L3）。 |

## 错误处理

| 失败情况 | 行为 |
|---|---|
| 不是 git 仓库 | 跳过 git-workflow.md 搜索器；在摘要中打印 `(skipped — no git)`。 |
| 某些搜索器失败 | 在 profile.md 中为失败的文件标记 `(partial)`；继续执行。其他 5 个来源仍会生成有效输出。 |
| `.hyperflow/` 存在但缺少 `.checksums` | 将所有已跟踪的配置视为过期；刷新全部配置。 |
| `~/.claude/hyperflow-memory.md` 格式错误 | 跳过迁移；打印 `Migration skipped — legacy file parse failed at line N`。原文件保持不变。 |
| `setup-detection.sh` 缺失或不可执行 | 打印 `Detection shims skipped — scripts/setup-detection.sh not runnable`。初始化仍会成功。 |
| `.gitignore` 写入受阻 | 打印警告以及建议手动添加的行；继续执行。 |

## 示例

### 全新项目

```
/hyperflow:scaffold

Searcher — analyzing tech stack
Searcher — mapping folder structure
Searcher — extracting conventions
Searcher — scanning dependencies
Searcher — auditing test setup
Searcher — reading git workflow

Hyperflow init complete
  Created   .hyperflow/{profile,architecture,conventions,dependencies,testing,git-workflow}.md
  Created   .hyperflow/.checksums
  Created   .hyperflow/memory/doctrine.md — copied from skills/hyperflow/DOCTRINE.md
  Created   .hyperflow/memory/{index,learnings,decisions,pitfalls,patterns,conventions}.md
  Note      .hyperflow/memory/session-context.md — will be populated by hooks/session-start on next session
  Created   .gitignore entry — .hyperflow/
  Shims     CLAUDE.md, AGENTS.md

Memory skeleton populated — workers will use lean prompts by default.
```

### 依赖升级后的刷新

```
/hyperflow:scaffold

Refreshing — dependencies.md, profile.md
Hyperflow refresh complete
  Updated   .hyperflow/dependencies.md, profile.md
  Skipped   architecture, conventions, testing, git-workflow — checksum match
  Shims     unchanged
```

### 试运行

```
/hyperflow:scaffold --dry-run

Would create   .hyperflow/profile.md (~120 lines)
Would create   .hyperflow/architecture.md (~200 lines)
... (full list)
No files written.
```

## 资源

- [project-analysis.md](references/project-analysis.md) — 每个生成文件所记录的内容。
- [DOCTRINE.md](../hyperflow/DOCTRINE.md) — 编排规则（第 0 层项目分析）。
- [output-style.md](references/output-style.md) — 摘要块格式。