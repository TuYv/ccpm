---
name: moai-harness-cli-template
description: >
  CLI/Template domain knowledge for moai-adk-go covering cobra commands, go:embed template
  system, YAML config, and template rendering pipeline.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-05-14"
  modularized: "false"
  tags: "cli, template, cobra, go:embed, config, yaml, moai-cli"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000

# MoAI Extension: Triggers
triggers:
  keywords: ["cobra", "command", "template", "embed", "config", "yaml", "moai init", "moai update", "moai build", "rendering", "internal/cli", "internal/template"]
  agents:
    - "moai-harness-cli-template-specialist"
    - "expert-backend"
  phases:
    - "run"
  languages:
    - "go"
---
# CLI/模板领域知识

moai-adk-go 的 CLI 和模板系统相关领域知识。通过项目特定模式补充 `expert-backend`。

## 快速参考

### 架构概览

```
moai binary (Go)
  ├── internal/cli/          ~50 cobra command files
  ├── internal/template/
  │   ├── templates/         Source of truth for all templates
  │   ├── embedded.go        Auto-generated (go:embed)
  │   ├── context.go         TemplateContext with GoBinPath, HomeDir
  │   └── renderer.go        Template rendering engine
  └── internal/config/       Configuration loading and defaults
```

### 关键模式

1. **模板优先规则**：必须先将 `.claude/` 或 `.moai/` 下的新文件添加到 `internal/template/templates/`，然后运行 `make build`
2. **嵌入系统**：`embedded.go` 中的 `//go:embed templates/*`——自动生成，切勿编辑
3. **模板变量**：`{{.GoBinPath}}`（初始化时的绝对路径）、`{{.HomeDir}}`（初始化时的绝对路径）
4. **回退路径**：在 `.sh.tmpl` 文件中使用 `$HOME`（而非 `.HomeDir`），以提供运行时灵活性
5. **16 种语言中立性**：模板平等对待所有 16 种受支持的语言——不存在“主要”语言

### 构建周期

```bash
# 1. Edit templates
vim internal/template/templates/.claude/skills/...

# 2. Regenerate embedded files
make build

# 3. Run tests
go test ./internal/template/...

# 4. Verify
ls -la internal/template/embedded.go
```

### 命令结构

每个 cobra 命令都位于 `internal/cli/<command>.go` 中，其对应测试位于 `<command>_test.go` 中。命令遵循以下模式：
- `root.go` 中的 `rootCmd`，通过 `init()` 注册子命令
- 每个命令文件：`var <cmd>Cmd = &cobra.Command{...}` + `func init() { rootCmd.AddCommand(...) }`

### 配置系统

- 主配置：`.moai/config/config.yaml`
- 分区：`.moai/config/sections/*.yaml`（quality、language、user、workflow、harness、design）
- 优先级：环境变量 > 用户配置 > 模板默认值
- 环境变量键：`internal/config/envkeys.go`（常量，切勿硬编码）

## 实施指南

### 添加新的 Cobra 命令

1. 创建包含 cobra 命令结构体的 `internal/cli/<command>.go`
2. 在 `init()` 函数中注册
3. 使用 `t.TempDir()` 创建 `internal/cli/<command>_test.go`
4. 如果命令会修改模板，则将模板文件添加到 `internal/template/templates/`
5. 如果模板发生更改，运行 `make build`
6. 运行 `go test ./internal/cli/...` 进行验证

### 添加新的模板文件

1. 将文件添加到 `internal/template/templates/<path>`
2. 如果文件需要变量替换，请使用 `.tmpl` 扩展名
3. 如有需要，在 `renderer.go` 中注册直通令牌（例如 `$HOME`）
4. 运行 `make build` 重新生成 `embedded.go`
5. 运行 `go test ./internal/template/...`

### 模板渲染管线

```
TemplateContext{GoBinPath, HomeDir}
  -> renderer.Render(templateContent, context)
  -> Output file (variable substitution applied)
```

保留的直通令牌（不进行替换，按原样传递）：
- `$HOME`、`$PATH`、`$CLAUDE_PROJECT_DIR`
- Shell 脚本中的环境变量引用

### 错误包装约定

```go
// Correct: use fmt.Errorf with %w
if err != nil {
    return fmt.Errorf("deploy template: %w", err)
}

// Wrong: string concatenation
if err != nil {
    return fmt.Errorf("deploy template: " + err.Error())
}
```

## 交叉引用

- CLAUDE.local.md 第 2 节：模板优先规则和文件同步
- CLAUDE.local.md 第 8 节：模板变量策略
- `.claude/rules/moai/development/coding-standards.md`：编码约定
- `moai-foundation-cc` skill：Claude Code 编写模式
- `moai-foundation-core` skill：SPEC 系统和 TRUST 5