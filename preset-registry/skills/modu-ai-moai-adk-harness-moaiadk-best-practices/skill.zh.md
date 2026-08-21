---
name: harness-moaiadk-best-practices
description: >
  moai-adk-go best-practices reference for the 4 harness specialists
  (cli-template-specialist, quality-specialist, workflow-specialist,
  hook-ci-specialist). Covers TRUST 5 gates, Go test isolation
  (t.TempDir, no OTEL env in parallel tests), hardcoding-prevention rules
  (env constants in envkeys.go, thresholds in defaults.go), the
  AskUserQuestion orchestrator-only boundary, the deferred-tool preload rule,
  the archived-agent rejection contract, and verification-claim integrity.
  Loaded by the specialists when authoring or reviewing moai-adk-go code.
allowed-tools: Read, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "1.0.0"
  category: "harness/best-practices"
  status: "active"
  updated: "2026-06-17"
  tags: "moai-adk-go,best-practices,trust5,testing,hardcoding"
progressive_disclosure:
  level_1_tokens: 120
  level_2_tokens: 4000
  level_3_optional: true
triggers:
  agents:
    - cli-template-specialist
    - quality-specialist
    - workflow-specialist
    - hook-ci-specialist
  keywords: TRUST 5, t.TempDir, envkeys.go, defaults.go, AskUserQuestion, archived-agent, verification-claim, deferred tool
paths: "internal/**/*.go,**/*_test.go,.claude/rules/**"
---
# moai-adk-go 最佳实践

## TRUST 5 质量门禁

每项变更在完成前都必须通过以下五个维度：

| 支柱 | 门禁 | 失败处理 |
|--------|------|----------------|
| **已测试** | 运行带覆盖率的 `go test ./...` | 阻止合并；生成缺失的测试 |
| **可读** | `golangci-lint run` | 发出警告；建议重构 |
| **统一** | `go fmt` + `goimports` | 自动格式化或发出警告 |
| **安全** | 与 OWASP 对齐的审查（每次生成一个 opus 代理） | 阻止操作；要求审查 |
| **可追踪** | Conventional Commits 正则表达式 | 建议格式 |

覆盖率目标：每个包最低 85%；关键包达到 90% 以上
（`internal/cli`、`internal/template`、`internal/hook`）。

## 测试隔离

- 临时目录**始终**使用 `t.TempDir()`——自动清理，位于 `os.TempDir()` 下。
- **macOS 路径陷阱**：`t.TempDir()` 返回 `/var/folders/...`。Go 的
  `filepath.Join(cwd, absPath)` 不会去除开头的 `/`：
  `filepath.Join("/a/b", "/var/folders/x")` → `"/a/b/var/folders/x"`（错误）。
  在 CLI 命令中解析用户提供的路径时，请使用 `filepath.Abs()`。
- **并行测试中不得设置 OTEL 环境变量**（CLAUDE.local.md §WARN）：切勿在并行测试中
  使用 `t.Setenv("OTEL_EXPORTER_*", ...)`——OTEL SDK 会在首次使用时根据环境变量
  初始化全局状态，从而导致数据竞争。请改用虚假/无操作导出器；或让父测试不并行运行。
- GLM 集成测试中**不得使用 `t.Setenv("HOME", tmpDir)`**——这会污染并行测试。
  请使用 `t.TempDir()` + 显式路径构造。
- **修复任何测试后**，运行完整测试套件（`go test ./...`）以发现连锁故障。
  调试不稳定测试时使用 `-count=1` 禁用缓存；使用 `-race` 检查并发安全性。

## 防止硬编码

- **URL / 模型名称 / 组织名称 / API 标头** → 提取为 `const`。
- **环境变量名称** → 在 `internal/config/envkeys.go` 中定义为常量；
  所有位置均引用该常量。切勿内联原始环境变量字符串。
- **阈值** → 统一以 `internal/config/defaults.go` 为唯一来源。
  切勿在多个包中重复定义同一阈值。
- **跨平台路径** → 优先使用 `$HOME`、`HOMEBREW_PREFIX` 等。在
  `.sh.tmpl` 的回退路径中使用 `$HOME`（而非 `.HomeDir`），因为 `.HomeDir`
  会在 `moai init` 时固定下来，对于使用非标准目录结构的用户会失效。
- **仅允许**在 `CLAUDE.local.md`、`settings.local.json`
  以及位于 `t.TempDir()` 内的 `_test.go` 文件中进行硬编码。

## AskUserQuestion 边界（仅限编排器）

- `AskUserQuestion` 是唯一面向用户的提问渠道，且仅供 MoAI 编排器（主会话）使用。
- **子代理（包括这些测试框架专用代理）不得调用
  AskUserQuestion。** 如果需要用户输入，请向编排器返回结构化的阻塞报告
  （参见 `.claude/rules/moai/core/askuser-protocol.md`
  § 阻塞报告格式）。
- **延迟工具预加载**：`AskUserQuestion`、`TaskCreate`、`TaskUpdate`、
  `TaskList`、`TaskGet` 均为延迟工具——其模式不会在会话开始时加载。
  编排器在首次使用前必须调用
  `ToolSearch(query: "select:AskUserQuestion,TaskCreate,...")`。
  子代理同样受此约束。
- 禁止在响应文本中使用自由形式的自然语言提问——始终通过 AskUserQuestion
  （编排器）或阻塞报告（子代理）传递。

## 已归档代理拒绝契约

12 个代理已被归档，生成的流程框架文件中严禁在任何位置引用它们——不得出现在 `delegates-to` 中，不得出现在正文中，也不得出现在示例中。已归档名称的完整列表位于规范 SSOT `.claude/rules/moai/workflow/archived-agent-rejection.md` §B；本技能不会重复这些字面名称（在每个生成的文件中重复它们，会重新引入拒绝契约旨在抑制的确切词元）。

以下 8 个保留代理是唯一有效的委派目标：

```
manager-spec, manager-develop, manager-docs, manager-git,
plan-auditor, sync-auditor, builder-harness, Explore (Anthropic built-in)
```

对于先前由已归档领域专家代理提供的领域专业知识，请在委派时使用按生成实例配置的模式：`Agent(subagent_type: "general-purpose", model: "opus", tools: "<whitelist>", prompt: "...<domain> specialist: <conventions>...")`。完整迁移表（第 #1-#12 行）请参阅 `.claude/rules/moai/workflow/archived-agent-rejection.md` §C，该表会将每个已归档代理映射到其规范的保留代理或按生成实例配置的替代项。

## 验证声明完整性

根据 `.claude/rules/moai/core/verification-claim-integrity.md`：

- **不得作出未经观察的声明。** 仅当执行者运行了命令并观察到输出时，“测试通过”/“覆盖率 87%”/“lint 无错误”等断言才有效。未运行的命令属于验证缺口，绝不能视为通过。
- **不得作出未经观察的缺陷声明。** 仅根据前置元数据文本或 grep 匹配结果推断缺陷/债务/偏移——而未使用相应领域的专用工具（`moai spec audit`、`go test -cover`、`golangci-lint`）——只能算作假设，而非已验证的缺陷。2026-06-17 事件是规范的完整示例（29 个 SPEC 被错误标记为“需要关闭的 Mx 债务”；`moai spec audit` 显示全部 29 个均受历史兼容规则保护）。
- **基线归属。** 每项验证声明都必须注明所运行的命令及观察到的逐字输出，并以本次运行中的当前代码树为衡量基准。来自其他 SPEC/包/时间点的数字属于沿用数据，而非基线。
- **5 节报告格式**：声明 / 证据 / 基线归属 / 缺口 / 残余风险。缺口部分是防线——强制自己列出哪些内容**未被**观察。

## 交叉引用

- CLAUDE.local.md §6（测试）、§14（硬编码）、§19（AskUserQuestion）
- `.claude/rules/moai/core/verification-claim-integrity.md` v1.1.0
- `.claude/rules/moai/core/askuser-protocol.md`
- `.claude/rules/moai/workflow/archived-agent-rejection.md`
- `.claude/rules/moai/development/coding-standards.md`