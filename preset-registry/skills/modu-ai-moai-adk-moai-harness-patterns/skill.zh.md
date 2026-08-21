---
name: moai-harness-patterns
description: >
  MoAI-ADK harness pattern library — unified domain knowledge covering hook/CI dispatch
  (PostToolUse, SessionStart, GitHub Actions, release automation), workflow patterns
  (SPEC structure, EARS, MX tags, plan-run-sync pipeline), and Go quality gates (testing,
  linting, coverage, race detection, LSP). Use for moai-adk-go harness work — NOT for
  general MoAI agent patterns (see moai-foundation-cc).
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "0.1.0"
  category: "domain"
  status: "active"
  updated: "2026-05-22"
  tags: "harness, hooks, ci, github-actions, spec, plan-run-sync, ears, mx-tag, go-test, golangci-lint, coverage, lsp, quality-gate"

progressive_disclosure:
  enabled: true
  level1_tokens: 120
  level2_tokens: 5000

triggers:
  keywords: ["hook", "PostToolUse", "SessionStart", "CI", "GitHub Actions", "GoReleaser", "handle-", "settings.json", "SPEC", "plan", "run", "sync", "EARS", "MX tag", "AC-", "REQ-", "go test", "lint", "vet", "coverage", "golangci-lint", "LSP", "race", "t.TempDir", "flaky"]
  agents: ["moai-harness-hook-ci-specialist", "moai-harness-workflow-specialist", "moai-harness-quality-specialist", "manager-spec", "manager-develop", "manager-docs", "manager-quality", "expert-devops"]
  phases: ["plan", "run", "sync"]
  languages: ["go"]
---
# MoAI-ADK Harness 模式（`moai-harness-patterns`）

面向 `moai-adk-go` 的统一 Harness 领域知识。此技能整合了此前拆分在不同技能中的三个专业领域：

1. **Hook 与 CI** — Shell Hook 包装器、GitHub Actions、发布自动化
2. **工作流** — SPEC 结构、EARS 需求、plan-run-sync 流水线、MX 标签
3. **质量** — Go 测试、Lint、覆盖率、竞态检测、LSP 门禁

每个 Harness 专家代理（`moai-harness-hook-ci-specialist`、
`moai-harness-workflow-specialist`、`moai-harness-quality-specialist`）都会加载此单一
技能以共享上下文。通过项目特定模式补充通用代理（`expert-devops`、`manager-spec`、
`manager-quality`）。

## 快速参考

### Hook 系统架构

```
Claude Code hook event
  -> .claude/hooks/moai/handle-{event}.sh  (shell wrapper)
  -> moai hook {event}                     (Go binary handler)
  -> internal/hook/{handler}.go            (Go handler logic)
```

共有 **27 个 Hook 事件**，涵盖 Session、Tool、Agent、State、Permissions、Interaction、Team
和 Worktree 类别。验证方式：`ls .claude/hooks/moai/handle-*.sh | wc -l` == 27。完整
事件列表位于 `.claude/rules/moai/core/agent-hooks.md`。

### SPEC 工作流流水线

```
/moai plan "description"  → manager-spec       → SPEC document with EARS requirements
/moai run SPEC-XXX        → manager-develop    → Implementation (TDD or DDD)
/moai sync SPEC-XXX       → manager-docs       → Documentation + PR creation
```

### 质量目标

`go vet ./...` 和 `golangci-lint run` 在所有阶段都必须为零错误。
`go test ./...` 在所有阶段都必须全部通过；运行阶段的 `-race` 必须检测不到任何竞态。
覆盖率：同步阶段每个包 >= 85%（`go test -cover ./...`）；关键包
（`internal/cli/`、`internal/template/`）>= 90%。LSP 门禁：运行阶段 = 零错误 / 零类型
错误 / 零 Lint 错误；同步阶段额外增加警告数量上限（最多 10 个）。

## 实施指南

### 第 1 节 — Hook 与 CI 模式

**Hook 包装器模式**（轻量 Shell 包装器，由 Go 完成实际工作）：通过
`INPUT=$(cat)` 读取 stdin JSON，并通过管道传递给 `moai hook {event} <<< "$INPUT"`。文件位于
`.claude/hooks/moai/handle-{event}.sh`。

**settings.json 调用规则**：始终为 `$CLAUDE_PROJECT_DIR` 加引号（例如
`"$CLAUDE_PROJECT_DIR/.claude/hooks/moai/handle-X.sh"`）；设置超时时间（默认 5 秒，后处理最长
10 秒）；使用完整路径，不要依赖 PATH。

**代理作用域 Hook** 在代理 YAML frontmatter 的 `hooks:` 映射下声明（按事件：
`PreToolUse`、`PostToolUse`、`SubagentStop` 等），包含 `matcher` 正则表达式，以及用于调用
`handle-agent-hook.sh {action}` 的 `command` Shell 命令。默认超时时间为 5 秒（后处理为 10 秒）。

**GitHub Actions 工作流** 位于 `.github/workflows/`：`ci.yml`（推送/PR 到 main — 矩阵
ubuntu/macos/windows × Go 1.24，Lint + 测试 + 构建）；`release.yml`（标签 `v*` —
GoReleaser 5 个平台）；`release-drafter.yml`（PR 合并到 main — 自动添加标签 + 起草
变更日志）；`auto-merge.yml`（Dependabot CI 通过 — squash）；`codeql.yml`（推送/PR — Go
安全分析）；`spec-lint.yml`（PR — SPEC frontmatter 验证）；
`spec-status-auto-sync.yml`（定时任务 — 状态漂移检测）；`docs-i18n-check.yml`
（涉及 docs-site 的 PR — 4 种语言区域的同步验证）。

**发布流程** — 始终使用 `./scripts/release.sh vX.Y.Z "description"`（或
`--hotfix`）；切勿手动推送标签。流程链：脚本 → 标签 → `release.yml` → GoReleaser →
5 平台二进制文件 → GitHub Release → Release Drafter 更新变更日志。

**Hook 处理器测试**：`internal/hook/` 中的 Go 单元测试从 stdin 读取 JSON，并
直接测试处理器逻辑。

### 第 2 节 — 工作流模式

`.moai/specs/<SPEC-ID>/` 下的 **SPEC 结构**：`spec.md`（EARS + AC）、`plan.md`（M1..Mn
里程碑）、`acceptance.md`（二元 AC + REQ↔AC 可追溯性，Tier M+）、`scenarios.md`
（Tier L）、`risks.md`（Tier L）、`progress.md`（运行期间自动生成）。Tier S = 2 个
产物（spec + plan，AC 内联）；Tier M = 3 个（增加 acceptance.md）；Tier L = 5 个（增加
设计 + 研究）。

**SPEC 命名**：`SPEC-V{major}R{minor}-{CATEGORY}-{NUMBER}`。类别：WF、ORC、RT、
SPC、HOOK、CI、CON、MX、CLI、TUI、BRAIN、STATUSLINE、HYBRID、MIG、GLM。

**EARS 需求模式**：普遍型（`The system shall [action]`）；事件驱动型
（`When [event], the system shall [action]`）；非预期行为型（`If [bad condition], the system
shall [action]`）；状态驱动型（`While [state], the system shall [action]`）；可选功能型
（`Where [feature] enabled, the system shall [action]`）。

**MX 标签类型**：`@MX:NOTE`（上下文/意图、新增的导出函数）；`@MX:WARN`（危险
区域，需要 `@MX:REASON` — goroutine、复杂度 >= 15）；`@MX:ANCHOR`（不变量
契约、具有 >= 3 个调用方的高 fan_in 函数）；`@MX:TODO`（未完成的工作、未经测试的
公共函数）。每个文件的上限：3 ANCHOR / 5 WARN / 10 NOTE / 5 TODO。

**主分支规划原则**：SPEC 计划 PR 合并到 main（而非功能分支）。运行阶段
使用 worktree 隔离。同步 PR 携带完整审查历史合并到 main。

**里程碑**：M1 基础 → M2 核心 → M3 集成 → M4 边界情况 → M5 完善。
**波次**：包含 30+ 个任务的 SPEC 拆分为多个波次 PR；在 `progress.md` 中跟踪。

**AC 格式**：`AC-{SHORT}-{NN}: {verifiable condition}`，包含 `Verification:` 命令
和 `Priority: P0|P1|P2`。

**SPEC 状态生命周期（8 值枚举）**：
`draft → planned → in-progress → implemented → completed`，备选状态：`superseded`、
`archived`、`rejected`。

### 第 3 节 — 质量模式

**关键测试隔离规则**：(1) 始终使用 `t.TempDir()` — 在 `/tmp` 下自动清理；
(2) `filepath.Join` 陷阱：`Join("/a/b", "/var/folders/x")` = `/a/b/var/folders/x`（错误）
— 使用 `filepath.Abs()`；(3) `OTEL_*` 环境变量绝不能在并行测试中使用 `t.Setenv`
（全局状态竞争）；(4) 完成任何修复后，运行完整测试套件（`go test ./...`）；(5) 调试
不稳定测试时，通过 `go test -count=1 ./...` 禁用缓存。

**测试执行**：`go test ./...`（完整）、`-race`（竞态检测）、`-cover`（覆盖率）、
`-run TestX ./pkg/`（指定测试）、`-count=1`（调试不稳定测试时禁用缓存）、`-v`（详细输出）。

**表驱动测试模式**：标准 Go 约定 — `tests := []struct{name, input,
want string; wantErr bool}{...}` + `for _, tt := range tests { t.Run(tt.name, ...) }`。
每一行都应覆盖正常路径 + 错误路径 + 边界情况。

**各阶段的 LSP 质量门禁阈值**：

| 阶段 | LSP 错误 | 类型错误 | Lint 错误 | 警告 |
|---|---|---|---|---|
| 计划 | 已记录基线 | 基线 | 基线 | 基线 |
| 运行 | 要求为零 | 要求为零 | 要求为零 | — |
| 同步 | 要求为零 | 要求为零 | 要求为零 | 最多 10 个 |

**提交前质量门禁**：`go vet ./... && golangci-lint run && go test ./...`。

**覆盖率报告**：先运行 `go test -coverprofile=coverage.out ./...`，然后运行
`go tool cover -html=coverage.out`。

**常见质量问题**：对绝对路径使用 `filepath.Join` → 改用 `filepath.Abs()`；
并行测试中的 OTEL 数据竞争 → 使用伪造/无操作导出器；测试写入临时目录之外的位置 →
始终使用 `t.TempDir()`；CI 不稳定 → 使用 `go test -race -count=1`。

## 交叉引用

`.claude/rules/moai/core/agent-hooks.md`（钩子生命周期）、`.claude/rules/moai/workflow/
spec-workflow.md`（规范的 SPEC 工作流）、`.claude/skills/moai/references/mx-tag.md`
（MX 标签协议）、`.moai/config/sections/quality.yaml`（质量配置）、`CLAUDE.local.md`
§6（测试）+ §7（钩子开发）、`CLAUDE.md` §6（TRUST 5）、`.github/workflows/ci.yml`
和 `release.yml`。

## 配合使用效果良好

3 个工具链专家（`moai-harness-hook-ci-specialist`、`moai-harness-workflow-specialist`、
`moai-harness-quality-specialist`）会加载此技能。还包括：`manager-develop`（MX 标签 +
EARS + 质量）、`manager-quality`（TRUST 5）、`manager-git`（CI 自动修复推送）、
`expert-devops`（发布 + Actions）、`moai-workflow-ci-loop`（CI 运行时同级技能）、
`moai-foundation-quality`（更广泛的编排）、`moai-foundation-core`（TRUST 5 + SPEC
概述）。

## 验证

- [ ] 存在 27 个钩子处理脚本（`ls .claude/hooks/moai/handle-*.sh | wc -l` == 27）
- [ ] `go vet ./... && golangci-lint run && go test ./...` 通过
- [ ] `go test -race ./...` 通过（无 goroutine 泄漏）
- [ ] 包覆盖率 >= 85%；`internal/cli/` 和 `internal/template/` >= 90%
- [ ] SPEC frontmatter 通过 `spec-lint.yml`
- [ ] 每个文件的 MX 标签数量 ≤ 3 个 ANCHOR / 5 个 WARN / 10 个 NOTE / 5 个 TODO
- [ ] 与基线相比，`golangci-lint run --timeout=2m` 的新增问题为零
- [ ] 发布使用 `scripts/release.sh`，绝不手动推送 `git tag`

<!-- 整合自 moai-harness-hook-ci + moai-harness-workflow + moai-harness-quality (SPEC-V3R6-SKILL-CONSOLIDATE-001, 2026-05-22) -->