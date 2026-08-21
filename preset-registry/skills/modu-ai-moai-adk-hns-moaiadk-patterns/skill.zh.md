---
name: hns-moaiadk-patterns
description: >
  moai-adk-go domain-patterns reference for the 4 harness specialists
  (cli-template-specialist, quality-specialist, workflow-specialist,
  hook-ci-specialist). Covers the CLI/template/config/hook/spec subsystem
  architecture, key source paths, the Pipeline specialist delegation map, the
  Template-First build cycle, the namespace separation contract, and common
  add-a-template / add-a-hook / add-an-agent / add-a-SPEC workflows. Loaded by
  the specialists when working on moai-adk-go's own Go codebase and templates.
allowed-tools: Read, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "1.0.0"
  category: "harness/domain-patterns"
  status: "active"
  updated: "2026-06-17"
  tags: "moai-adk-go,cli,template,harness,patterns"
progressive_disclosure:
  level_1_tokens: 120
  level_2_tokens: 4500
  level_3_optional: true
triggers:
  agents:
    - cli-template-specialist
    - quality-specialist
    - workflow-specialist
    - hook-ci-specialist
  keywords: moai-adk-go, internal/cli, internal/template, embed.go, make build, go:embed, template-first, harness namespace
paths: "internal/**/*.go,internal/template/templates/**,.claude/**,.moai/**"
---
# moai-adk-go 领域模式

## 架构快速参考

moai-adk-go 是一个 Go 二进制程序（`moai`），包含四个子系统：

1. **CLI**（`internal/cli/*.go`、`cmd/moai/`）— Cobra 命令：`init`、
   `update`、`hook`、`build`、`glm`、`cc`、`cg`、`version`、`doctor`、
   `spec`。子命令处理程序从标准输入读取用于钩子的 JSON，并为编排器输出结构化
   结果。
2. **模板系统**（`internal/template/`）— 基于 `go:embed` 的脚手架。
   源文件位于 `internal/template/templates/`，通过
   `internal/template/embed.go` 中的 `//go:embed all:templates` 嵌入二进制程序（没有生成的
   `.go` 文件）。`make build` 会重新编译二进制程序。
   `TemplateContext`（`{{.GoBinPath}}` / `{{.HomeDir}}`）在执行 `moai init` 时渲染。
3. **配置**（`internal/config/`）— `defaults.go`（阈值的单一来源）、
   `envkeys.go`（环境变量常量）、`TemplateContext` 渲染器。
4. **钩子 + CI**（`.claude/hooks/moai/*.sh`、`.github/workflows/`）— 调用
   `moai hook <event>` 的 bash 包装钩子；CI 守卫强制确保模板
   中立性。

此外还有管理项目自身开发的 **SPEC 生命周期**（`.moai/specs/`）
（plan→run→sync→Mx）。

## 关键源文件路径

| 子系统 | 路径 | 说明 |
|-----------|------|-------|
| Cobra 命令 | `internal/cli/*.go` | 从 `cmd/moai/` 接入 |
| 模板源文件 | `internal/template/templates/**` | 首先在此处编辑 |
| 嵌入式资源 | `internal/template/embed.go` | `//go:embed all:templates`（没有生成的文件） |
| 配置默认值 | `internal/config/defaults.go` | 阈值的单一事实来源 |
| 环境变量常量 | `internal/config/envkeys.go` | 不硬编码环境变量名称 |
| SPEC 文档 | `.moai/specs/SPEC-*/` | 规格/计划/验收/进度 |
| 时代分类器 | `internal/spec/era.go` | `ClassifyEra()` H-1..H-6 |
| 钩子脚本 | `.claude/hooks/moai/*.sh` | 仅使用 bash，不使用 Python |
| CI 工作流 | `.github/workflows/*.yaml` | 中立性守卫已启用 |
| Harness 代理 | `.claude/agents/harness/*.md` | 用户所有（本 Skill） |

## 流水线专家委派图

此 Harness 是一个四阶段流水线；每位专家都会委派给保留的
代理（绝不归档，也绝不替换它们）：

```
CLI/Template ──→ quality ──→ workflow ──→ hook/CI
  │                │            │            │
  ├─ manager-develop (tdd, backend)
  ├─ Explore (read-only)
  ├─ sync-auditor (4-dim scoring)
  ├─ sync-phase-quality-gate.sh (Stop hook)
  ├─ manager-spec (plan)
  ├─ manager-develop (run)
  ├─ manager-docs (sync)
  ├─ plan-auditor (audit)
  ├─ builder-harness (artifact_type=hook|command|plugin)
  └─ Agent(general-purpose, model: opus, tools: ..., prompt: "...CI specialist...")
```

## 模板优先构建周期

添加或编辑任何会交付到用户项目中的内容时：

1. 首先编辑 `internal/template/templates/<path>`。
2. 运行 `make build` → 重新编译二进制程序（模板通过
   `embed.go` 中的 `//go:embed all:templates` 嵌入；没有生成的 `.go` 文件）。
3. 同步到本地：`moai update`（或手动复制）。
4. 验证本地 `.claude/` / `.moai/` 是否与模板一致。
5. 运行 `go test ./internal/template/...`（包括中立性审计）。

在没有模板源的情况下，切勿直接编辑 `.claude/` 或 `.moai/`。唯一可信来源是 `templates/`——请在其中编辑文件，然后运行 `make build`。

## 命名空间隔离契约

由 `moai update` 强制执行的两个命名空间：

| 命名空间 | 位置 | 所有者 | `moai update` 行为 |
|-----------|----------|-------|------------------------|
| 模板管理 | `internal/template/templates/**` → `.claude/agents/{core,expert,meta}/`、`moai-*` skills | MoAI-ADK 发行版 | 同步时覆盖本地内容 |
| 用户所有（此验证框架） | `.claude/agents/harness/`、`harness-*` skills、`.moai/harness/` | 项目开发者 | 绝不删除或修改；更新前备份 |

规范的用户所有 skill 前缀为 `harness-*`（在命名空间对齐后由 Go 强制机制识别，SPEC-V3R6-HARNESS-NAMESPACE-V2-001）。旧版 `my-harness-*` 形式会在向后兼容弃用窗口期内保留；新 skill 必须使用不带其他内容的 `harness-*` 前缀。

## 常见工作流

### 添加模板

1. 在 `internal/template/templates/<path>` 创建文件。
2. `make build`。
3. `moai update`（或通过 `./moai init /tmp/test-project` 进行测试）。
4. `go test ./internal/template/... -run TestTemplateNeutralityAudit`。

### 添加 hook

1. 编写 `.claude/hooks/moai/handle-<event>.sh`（bash，读取 stdin JSON，调用 `moai hook <event>`）。
2. 在 `.claude/settings.json` 中接入，使用 `"$CLAUDE_PROJECT_DIR/..."` 引号形式并设置 `timeout: 5`。
3. 如果该 hook 可通过模板分发，请将包装器模板源和 settings.json 条目都添加到 `internal/template/templates/`。

### 添加 agent（验证框架专家）

1. 创建 `.claude/agents/harness/<role>-specialist.md`，其中包含 `name`、采用触发条件形式的 `description`、`skills:` 数组（配套 skill）以及 `tools:`（CSV 字符串）。
2. 确保配套的 `harness-*` skill 已存在（否则自激活冒烟检查会失败）。

### 添加 SPEC

1. `/moai plan "<description>"` → `manager-spec` 编写规划阶段产物。
2. 由 `plan-auditor` 执行独立审计门禁。
3. **实施启动审批**人工门禁（编排器运行 `AskUserQuestion`）。
4. `/moai run SPEC-<ID>` → `manager-develop`（cycle_type 依据 quality.yaml）。
5. `/moai sync SPEC-<ID>` → `manager-docs`。
6. 由 `sync-auditor` 执行四维门禁。
7. 在单个同步提交上执行三阶段关闭（在 §E.4 中填充 `sync_commit_sha`；同步提交承载 `implemented → completed` 转换——根据 SPEC-V3R6-LIFECYCLE-REDESIGN-001，原先独立的 `mx_commit_sha` / §E.5 Mx 阶段步骤已停用；MX Tag 验证是同步的一个子步骤）。

## 交叉引用

- CLAUDE.local.md §2（模板优先规则）、§7（hooks）、§21（仅限开发的命令）
- `.claude/rules/moai/development/agent-authoring.md` — agent frontmatter schema
- `.claude/rules/moai/development/skill-authoring.md` — skill frontmatter schema
- `.claude/rules/moai/workflow/archived-agent-rejection.md` §C — 迁移表
- `.claude/skills/moai-meta-harness/SKILL.md` § 命名空间隔离