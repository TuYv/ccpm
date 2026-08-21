---
name: harness-moaiadk-patterns
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

moai-adk-go 是一个包含四个子系统的 Go 二进制程序（`moai`）：

1. **CLI**（`internal/cli/*.go`、`cmd/moai/`）— Cobra 命令：`init`、
   `update`、`hook`、`build`、`glm`、`cc`、`cg`、`version`、`doctor`、
   `spec`。子命令处理程序从标准输入读取用于钩子的 JSON，并为编排器输出结构化
   内容。
2. **模板系统**（`internal/template/`）— 基于 `go:embed` 的脚手架。
   源文件位于 `internal/template/templates/`，通过
   `internal/template/embed.go` 中的 `//go:embed all:templates` 嵌入二进制文件（没有生成的
   `.go` 文件）。`make build` 会重新编译二进制文件。
   `TemplateContext`（`{{.GoBinPath}}` / `{{.HomeDir}}`）在执行 `moai init` 时渲染。
3. **配置**（`internal/config/`）— `defaults.go`（阈值的单一来源）、
   `envkeys.go`（环境变量常量）、`TemplateContext` 渲染器。
4. **钩子 + CI**（`.claude/hooks/moai/*.sh`、`.github/workflows/`）— 调用
   `moai hook <event>` 的 bash 包装钩子；CI 防护机制会强制确保模板
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
| SPEC 文档 | `.moai/specs/SPEC-*/` | 规范/计划/验收/进度 |
| 时代分类器 | `internal/spec/era.go` | `ClassifyEra()` H-1..H-6 |
| 钩子脚本 | `.claude/hooks/moai/*.sh` | 仅使用 bash，不使用 Python |
| CI 工作流 | `.github/workflows/*.yaml` | 中立性防护已启用 |
| 验证框架代理 | `.claude/agents/harness/*.md` | 用户所有（本技能） |

## 流水线专家委派映射

此验证框架是一条四阶段流水线；每位专家都会委派给保留的
代理（绝不归档，也绝不替代它们）：

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

## 模板优先的构建周期

添加或编辑任何将交付到用户项目中的内容时：

1. 首先编辑 `internal/template/templates/<path>`。
2. 运行 `make build` → 重新编译二进制文件（模板通过
   `embed.go` 中的 `//go:embed all:templates` 嵌入；没有生成的 `.go` 文件）。
3. 同步到本地：`moai update`（或手动复制）。
4. 验证本地 `.claude/` / `.moai/` 是否与模板一致。
5. 运行 `go test ./internal/template/...`（包含中立性审计）。

在没有模板源的情况下，切勿直接编辑 `.claude/` 或 `.moai/`。唯一事实来源是
`templates/`——应编辑其中的文件，然后运行 `make build`。

## 命名空间隔离约定

两个命名空间，由 `moai update` 强制执行：

| 命名空间 | 位置 | 所有者 | `moai update` 行为 |
|-----------|----------|-------|------------------------|
| 模板管理 | `internal/template/templates/**` → `.claude/agents/{core,expert,meta}/`、`moai-*` 技能 | MoAI-ADK 发行版 | 同步时覆盖本地内容 |
| 用户所有（本工具集） | `.claude/agents/harness/`、`harness-*` 技能、`.moai/harness/` | 项目开发者 | 绝不删除或修改；更新前备份 |

规范的用户所有技能前缀是 `harness-*`（在命名空间同步后由 Go
强制机制识别，SPEC-V3R6-HARNESS-NAMESPACE-V2-001）。
旧版 `my-harness-*` 形式将在向后兼容的弃用窗口期内保留；新技能必须使用不带其他前缀的 `harness-*` 前缀。

## 常见工作流

### 添加模板

1. 在 `internal/template/templates/<path>` 创建文件。
2. `make build`。
3. `moai update`（或通过 `./moai init /tmp/test-project` 测试）。
4. `go test ./internal/template/... -run TestTemplateNeutralityAudit`。

### 添加钩子

1. 编写 `.claude/hooks/moai/handle-<event>.sh`（bash，读取 stdin JSON，调用
   `moai hook <event>`）。
2. 在 `.claude/settings.json` 中接入，使用 `"$CLAUDE_PROJECT_DIR/..."` 引号形式 +
   `timeout: 5`。
3. 如果该钩子可通过模板分发，请将包装脚本模板源以及
   settings.json 条目添加到 `internal/template/templates/`。

### 添加代理（工具集专家）

1. 创建 `.claude/agents/harness/<role>-specialist.md`，包含 `name`、
   触发器形式的 `description`、`skills:` 数组（配套技能）、`tools:`
   （CSV 字符串）。
2. 确保配套的 `harness-*` 技能存在（否则自激活
   冒烟门禁将失败）。

### 添加 SPEC

1. `/moai plan "<description>"` → `manager-spec` 编写规划阶段产物。
2. `plan-auditor` 独立审计门禁。
3. **实施启动审批** 人工门禁（编排器运行
   `AskUserQuestion`）。
4. `/moai run SPEC-<ID>` → `manager-develop`（cycle_type 由 quality.yaml 决定）。
5. `/moai sync SPEC-<ID>` → `manager-docs`。
6. `sync-auditor` 四维门禁。
7. 在单个同步提交上完成三阶段关闭（在 §E.4 中填充 `sync_commit_sha`；同步提交承载 `implemented → completed` 状态转换——根据 SPEC-V3R6-LIFECYCLE-REDESIGN-001，之前独立的 `mx_commit_sha` / §E.5 Mx 阶段步骤已停用；MX 标签验证是同步子步骤）。

## 交叉引用

- CLAUDE.local.md §2（模板优先规则）、§7（钩子）、§21（仅限开发的命令）
- `.claude/rules/moai/development/agent-authoring.md` — 代理 frontmatter 模式
- `.claude/rules/moai/development/skill-authoring.md` — 技能 frontmatter 模式
- `.claude/rules/moai/workflow/archived-agent-rejection.md` §C — 迁移表
- `.claude/skills/moai-meta-harness/SKILL.md` § 命名空间隔离