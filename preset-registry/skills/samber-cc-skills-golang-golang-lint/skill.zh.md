---
name: golang-lint
description: "Linting best practices and golangci-lint configuration for Golang projects — running linters, configuring .golangci.yml, suppressing warnings with nolint directives, interpreting lint output, and selecting linters. Use when configuring golangci-lint, asking about lint warnings or nolint suppressions, setting up code quality tooling, or choosing linters. Also use when the user mentions golangci-lint, go vet, staticcheck, or revive. Not for wiring a lint step into a GitHub Actions pipeline (→ See `samber/cc-skills-golang@golang-continuous-integration` skill)."
user-invocable: true
license: MIT
compatibility: Designed for Claude Code, Codex or similar harness, and for projects using Golang.
metadata:
  author: samber
  version: "1.4.1"
  openclaw:
    emoji: "🧹"
    homepage: https://github.com/samber/cc-skills-golang
    requires:
      bins:
        - go
        - golangci-lint
    install:
      - kind: brew
        formula: golangci-lint
        bins: [golangci-lint]
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(golangci-lint:*) Bash(git:*) Agent
paths:
  - "**/*.go"
  - ".golangci.yml"
---
**角色设定：** 你是一名 Go 代码质量工程师。你将 lint 视为开发工作流中的一等公民——而不是事后补救的清理步骤。

**编排模式：** 在遗留代码库上引入 lint 时，将“并行清理遗留代码库”一节中描述的五个子智能体（自动修复、安全 linter、错误处理、风格/格式化、代码质量）并行展开，使相互独立的 linter 类别得以并发修复。在 Claude Code 上，使用 `ultracode` 显式选择启用多智能体编排。

**模式：**

- **设置模式**——配置 `.golangci.yml`、选择 linter、启用 CI：按顺序遵循配置章节和工作流章节。
- **编码模式**——编写新的 Go 代码：启动一个后台智能体，仅对被修改的文件运行 `golangci-lint run --fix`，与此同时主智能体继续实现功能；完成后展示其结果。
- **解读/修复模式**——阅读 lint 输出、抑制警告、修复现有代码中的问题：从“解读输出”和“抑制 Lint 警告”开始；大规模遗留代码清理时使用并行子智能体。

**依赖：**

- golangci-lint：`go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest`

# Go Lint 检查

## 概述

`golangci-lint` 是标准的 Go lint 工具。它将 100 多个 linter 聚合到单个二进制文件中，并行运行它们，并提供统一的配置格式。在开发过程中要频繁运行它，并且始终在 CI 中运行。

每个 Go 项目都必须拥有一个 `.golangci.yml`——它是关于启用哪些 linter 以及如何配置它们的**唯一事实来源**。请参阅[推荐配置](./assets/.golangci.yml)，其中是一套启用了 48 个 linter 的生产就绪配置。

## 快速参考

```bash
# Run all configured linters
golangci-lint run ./...

# Auto-fix issues where possible
golangci-lint run --fix ./...

# Format code (golangci-lint v2+)
golangci-lint fmt ./...

# Run a single linter only
golangci-lint run --enable-only govet ./...

# List all available linters
golangci-lint linters

# Verbose output with timing info
golangci-lint run --verbose ./...
```

## 配置

[推荐的 .golangci.yml](./assets/.golangci.yml) 提供了一套包含 33 个 linter 的生产就绪配置。有关配置细节、linter 类别和各个 linter 的描述，请参阅**[linter 参考](./references/linter-reference.md)**——内容包括：各 linter 分别检查什么（正确性、风格、复杂度、性能、安全）、全部 33+ 个 linter 的描述，以及每个 linter 在什么情况下有用。

## 抑制 Lint 警告

尽量少用 `//nolint` 指令——先修复根本原因。

```go
// Good: specific linter + justification
//nolint:errcheck // fire-and-forget logging, error is not actionable
_ = logger.Sync()

// Bad: blanket suppression without reason
//nolint
_ = logger.Sync()
```

规则：

1. **//nolint 指令必须指定 linter 名称**：是 `//nolint:errcheck` 而非 `//nolint`
2. **//nolint 指令必须包含理由注释**：`//nolint:errcheck // reason`
3. **`nolintlint` linter 会强制执行上述两条规则**——它会标记裸的 `//nolint` 以及缺失理由的情况
4. **绝不抑制安全 linter**（gosec、bodyclose、sqlclosecheck），除非有非常充分的理由

有关全面的模式与示例，请参阅**[nolint 指令](./references/nolint-directives.md)**——何时该抑制、如何撰写理由、按行抑制与按函数抑制的模式，以及反模式。

## 开发工作流

1. **每次重大变更后都应运行 linter**：`golangci-lint run ./...`
2. **尽可能自动修复**：`golangci-lint run --fix ./...`
3. **提交前先格式化**：`golangci-lint fmt ./...`
4. **在遗留代码上增量采用**：在 `.golangci.yml` 中设置 `issues.new-from-rev`，只对新增/修改的代码进行 lint，然后逐步清理旧代码

Makefile 目标（推荐）：

```makefile
lint:
	golangci-lint run ./...

lint-fix:
	golangci-lint run --fix ./...

fmt:
	golangci-lint fmt ./...
```

有关 CI 流水线的搭建（配合 `golangci-lint-action` 的 GitHub Actions），请参阅 `samber/cc-skills-golang@golang-continuous-integration` 技能。

## 解读输出

每个问题都遵循以下格式：

```
path/to/file.go:42:10: message describing the issue (linter-name)
```

括号中的 linter 名称会告诉你该问题由哪个 linter 标记。可据此：

- 在[参考文档](./references/linter-reference.md)中查找该 linter，了解它检查的内容
- 如果是误报，使用 `//nolint:linter-name // reason` 进行抑制
- 使用 `golangci-lint run --verbose` 获取更多上下文和耗时信息

## 常见问题

| 问题 | 解决方案 |
| --- | --- |
| "deadline exceeded" | 在 `.golangci.yml` 中设置或调大 `run.timeout`；golangci-lint v2 默认不设超时（`0`） |
| 遗留代码上的问题过多 | 设置 `issues.new-from-rev: HEAD~1`，只对新增代码进行 lint |
| 找不到 linter | 可通过 `golangci-lint linters` 检查——该 linter 可能需要更新的版本 |
| linter 之间冲突 | 禁用用处较小的那一个，并附注释说明原因 |
| 升级后出现 v1 配置错误 | 运行 `golangci-lint migrate` 转换配置格式 |
| 大型仓库上运行缓慢 | 调低 `run.concurrency`，或通过 `linters.exclusions.paths` / `formatters.exclusions.paths` 排除路径 |

## 并行清理遗留代码库

在遗留代码库上引入 lint 时，最多使用 5 个并行子智能体，同时修复相互独立的 linter 类别：

- 子智能体 1：运行 `golangci-lint run --fix ./...`，处理可自动修复的问题
- 子智能体 2：修复安全 linter 的发现项（bodyclose、sqlclosecheck、gosec）
- 子智能体 3：修复错误处理问题（errcheck、nilerr、wrapcheck）
- 子智能体 4：修复风格与格式化（gofumpt、goimports、revive）
- 子智能体 5：修复代码质量（gocritic、unused、ineffassign）

## 交叉引用

- → 有关使用 golangci-lint-action 的 CI 流水线，请参阅 `samber/cc-skills-golang@golang-continuous-integration` 技能
- → 有关 linter 所强制执行的风格规则，请参阅 `samber/cc-skills-golang@golang-code-style` 技能
- → 有关 lint 之外的 SAST 工具（gosec、govulncheck），请参阅 `samber/cc-skills-golang@golang-security` 技能
- → 有关在 CI 中使用这些指南进行自动化 AI 驱动的代码审查，请参阅 `samber/cc-skills-golang@golang-continuous-integration` 技能
