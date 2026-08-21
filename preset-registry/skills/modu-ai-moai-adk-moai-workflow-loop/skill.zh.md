---
name: moai-workflow-loop
description: >
  Ralph Engine - Automated feedback loop with LSP diagnostics and AST-grep
  integration for continuous code quality improvement. Use when implementing
  error-driven development, automated fixing, or continuous quality validation
  workflows.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
effort: low
user-invocable: false
metadata:
  version: "1.2.0"
  category: "workflow"
  status: "active"
  updated: "2026-01-11"
  tags: "lsp, ast-grep, feedback-loop, code-quality, automation, diagnostics, ralph"
---
# Ralph Engine

自动反馈循环系统，集成 LSP 诊断、AST-grep 安全扫描和测试验证，用于持续改进代码质量。

## 预设架构——作为目标预设的 Ralph Engine

`/moai loop` 技能（`.claude/skills/moai/workflows/loop.md`）将此 Ralph Engine 重新表达为一个构建于目标引擎之上的**目标预设**：扫描阶段会构建一个有限的问题队列，而“迭代直至完成”的决策则委托给目标引擎（`stop-goal`），并预先填入条件“队列已清空 + 诊断无异常”。在此**预设架构**中，本 SKILL.md 记录了由目标预设扫描所驱动的底层 LSP / AST-grep / 测试 / 覆盖率诊断机制；该预设在这套机制之上叠加目标引擎组合，而不对其进行任何更改。循环的四个象限（基于目标的扫描、基于轮次的 `/moai fix`、基于时间的节奏、主动式 CI 监视）都是同一个目标引擎上的预设，而不是相互独立的引擎。

## 快速参考

核心能力：

- LSP 集成：来自语言服务器的实时诊断
- AST-grep 扫描：结构化代码分析和安全检查
- 反馈循环：迭代修正错误，直至满足完成条件
- Hook 系统：通过 PostToolUse 和 Stop Hook 与 Claude Code 无缝集成

关键组件：

- post_tool__lsp_diagnostic：在 Write/Edit 操作后执行 LSP 诊断
- stop__loop_controller：循环迭代控制
- ralph.yaml：配置设置

命令：

- /moai：一键式“规划-运行-同步”自动化（默认）
- /moai loop：启动反馈循环
- /moai fix：执行一次自动修复

适用场景：

- 以零错误为目标实现功能
- 自动改进代码质量
- 持续集成工作流
- 错误驱动的开发模式

## 实现指南

### 架构概览

Ralph Engine 采用分层架构。/moai:loop、/moai:fix 和 /moai 等用户命令进入命令层。命令层调用 Hook 系统，其中包含用于 LSP 诊断的 PostToolUse Hook，以及用于循环控制的 Stop Hook。Hook 系统连接到后端服务，包括 LSP 客户端（MoAILSPClient）、AST-grep 扫描器和测试运行器。后端服务将结果传递给完成检查，由其评估错误是否为零、测试是否通过以及覆盖率是否达标。系统根据完成检查的结果决定继续循环或完成执行。

### 配置

ralph.yaml 配置文件包含以下部分和设置。

在 ralph 部分下，enabled 控制 Ralph 是否启用（默认为 true）。

在 lsp 部分下，auto_start 控制语言服务器自动启动（默认为 true），timeout_seconds 设置连接超时时间（默认为 30 秒），graceful_degradation 启用在 LSP 不可用时回退到代码检查工具（默认为 true）。

在 ast_grep 部分下，enabled 控制 AST-grep 集成（默认为 true），security_scan 启用安全规则检查（默认为 true），quality_scan 启用代码质量规则检查（默认为 true）。

在 loop 部分下，max_iterations 设置最大循环迭代次数（默认为 10），auto_fix 控制是否自动应用修复（默认为 false，需要确认），require_confirmation 要求在修复前获得用户批准（默认为 true）。

在 loop 的 completion 子部分下，zero_errors 要求不存在 LSP 或编译器错误（默认为 true），zero_warnings 要求不存在警告（默认为 false，因此是可选条件），tests_pass 要求所有测试均通过（默认为 true），coverage_threshold 设置最低覆盖率百分比（默认为 85）。

在 hooks 部分下，post_tool_lsp 包含 enabled（默认为 true）和 severity_threshold（默认为 error）。stop_loop_controller 的 enabled 默认设置为 true。

### Hook 集成

#### PostToolUse Hook

PostToolUse Hook 会在 Write 和 Edit 操作后触发。调用时，Claude Code 会提供 Hook 输入，其中包含 tool_name（例如 Write），以及包含 file_path 和 content 的 tool_input。

该 Hook 会处理诊断信息，并返回 Hook 输出，其中 hookSpecificOutput 包含 hookEventName（PostToolUse）和描述诊断结果的 additionalContext。例如，上下文可能会报告 LSP 在 file.py 中发现了 2 个错误和 3 个警告，并包含带行号的具体错误消息。

退出代码 0 表示无需采取操作。退出代码 2 表示发现错误，需要处理。

#### 用于循环控制器的 Stop Hook

Stop Hook 会在 Claude 每次响应后触发。该 Hook 会读取位于 .moai/cache/.moai_loop_state.json 的循环状态文件。此状态包含 active 状态（true 或 false）、当前迭代次数、max_iterations 限制、上一次迭代的 last_error_count，以及完成时的 completion_reason。

该 Hook 返回的输出中，hookSpecificOutput 包含 hookEventName（Stop）和报告循环状态的 additionalContext。例如，它可能报告 Ralph Loop CONTINUE，当前为 10 次迭代中的第 3 次，存在 2 个错误，并说明下一步操作是修复剩余错误。

退出代码 0 表示循环已完成或未激活。退出代码 1 表示继续循环，仍有更多工作需要完成。

### LSP 客户端用法

Go LSP 客户端已集成到 Hook 系统中。LSP 诊断信息会通过工具使用后 Hook（moai hook post-tool-use）自动收集。

要获取文件的诊断信息，请使用文件路径异步调用 get_diagnostics 方法。

通过遍历每个诊断对象来处理返回的诊断信息。将 severity 属性与 DiagnosticSeverity.ERROR 进行比较以识别错误。从 diag.range.start.line 获取行号，从 diag.message 获取消息。

### 完成条件

当所有已启用的条件都得到满足时，循环完成。

zero_errors 条件（默认为 true）要求不存在 LSP 或编译器错误。

zero_warnings 条件（默认为 false）可选地要求不存在警告。

tests_pass 条件（默认为 true）要求所有测试均通过。

coverage_threshold 条件（默认为 85）要求达到最低覆盖率百分比。

## 高级模式

### 自定义完成条件

通过实现检查函数，使用自定义条件扩展循环控制器。例如，创建一个函数来统计代码库中的 TODO 注释，并且仅在数量归零时返回 true。

### 与 CI/CD 集成

若要与 GitHub Actions 集成，请创建一个工作流步骤，使用 /moai:loop 命令和 max-iterations 标志运行 Claude。将 MOAI_LOOP_ACTIVE 环境变量设置为 true 以启用循环模式。

### 优雅降级

当 LSP 不可用时，系统会回退到使用 ruff 或 eslint 等工具进行基于 linter 的诊断，然后回退到编译器错误检测，最后回退到测试失败检测。

## 故障排除

### 循环未启动

检查配置中的 ralph.enabled 是否设置为 true。确认未设置 MOAI_DISABLE_LOOP_CONTROLLER 环境变量。确保状态文件所在位置可写。

### 缺少 LSP 诊断

检查 .lsp.json 文件中的 LSP 服务器配置。确认已安装适用于你的语言的语言服务器。检查是否未设置 MOAI_DISABLE_LSP_DIAGNOSTIC 环境变量。

### 循环卡住

检查 max_iterations 设置，确保其允许足够的迭代次数。检查完成条件，确认这些条件可以实现。发送任意消息以中断循环，或删除状态文件（.moai/cache/.moai_loop_state.json）以重置。

## 可配合使用

技能：

- moai-foundation-quality：TRUST 5 验证
- `moai ast-grep` / `moai ast-edit`：安全扫描模式与重写
- moai-workflow-testing：DDD 集成
- `.claude/rules/moai/languages/python.md`：Python 特定模式（通过 paths frontmatter 自动加载）
- `.claude/rules/moai/languages/typescript.md`：TypeScript 特定模式（通过 paths frontmatter 自动加载）

智能体：

- manager-develop：DDD 实现
- manager-develop (cycle_type=autofix)：复杂调试和修复建议（原 manager-quality 调试角色）
- /moai gate 技能或 sync-phase-quality-gate.sh Stop hook：质量验证（原 manager-quality gate 角色）

命令：

- /moai:2-run：DDD 实现
- /moai:3-sync：文档同步

## 参考

### 环境变量

设置 MOAI_DISABLE_LSP_DIAGNOSTIC 后会禁用 LSP hook。

设置 MOAI_DISABLE_LOOP_CONTROLLER 后会禁用循环 hook。

MOAI_LOOP_ACTIVE 表示循环当前是否处于活动状态。

MOAI_LOOP_ITERATION 包含当前迭代编号。

CLAUDE_PROJECT_DIR 包含项目根路径。

### 文件位置

配置存储在 .moai/config/sections/ralph.yaml。

循环状态存储在 .moai/cache/.moai_loop_state.json。

LSP hook 位于 .claude/hooks/moai/post_tool__lsp_diagnostic。

循环 hook 位于 .claude/hooks/moai/stop__loop_controller。

### 支持的语言

LSP 诊断适用于 MoAI 支持的全部 16 种语言：C++、C#、Elixir、Flutter、Go、Java、JavaScript、Kotlin、PHP、Python、R、Ruby、Rust、Scala、Swift 和 TypeScript。Ralph 通过标记文件检测项目语言（例如，Go 使用 `go.mod`，Python 使用 `pyproject.toml`，TypeScript 使用 `tsconfig.json`，Rust 使用 `Cargo.toml`，Flutter 使用 `pubspec.yaml`），并按需启动匹配的语言服务器。用户只需安装其项目实际需要的服务器；缺少服务器时会发出警告并跳过，同时提供安装提示，绝不会导致严重故障。有关语言服务器到二进制文件的完整映射表，请参阅 `references/reference.md`。根据 `.claude/rules/moai/development/coding-standards.md` § Language Policy（16 种语言中立性约定），任何语言都不会获得高于其他语言的优先级。

---

Version: 1.2.0
Last Updated: 2026-01-11
Status: 活跃
Integration: Claude Code Hooks, LSP Protocol, AST-grep
Skill Name: moai-workflow-loop（原名 moai-ralph）

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “循环结束后，我会手动修复剩余错误” | 需要手动跟进意味着循环没有完成其任务。遗留的错误就是最终交付的错误。 |
| “循环已达到最大迭代次数，剩余问题无关紧要” | 迭代限制是为了控制成本，而不是作为质量合格的标志。应报告未解决的问题清单。 |
| “LSP 警告不是真正的错误” | 在多次迭代中持续存在的警告表明结构性问题被忽略了。应解决这些问题，或明确地将其抑制。 |
| “我已经修复了根本原因，其他诊断会自行消失” | 级联修复并无保证。再次运行诊断流程，并验证每个问题是否都已解决。 |
| “ast-grep 规则对这个代码库来说过于严格” | 规则反映了项目约定。应在说明理由后禁用特定规则，而不是跳过整个扫描。 |
| “本次迭代没有取得进展，我应该停止” | 连续 2 次迭代停滞会触发升级，而不是静默退出。请遵循升级协议。 |

**500 行规则**：涉及超过 500 行的更改应安排单独的循环迭代，并进行有针对性的诊断。大规模更改会掩盖单个回归问题。

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 循环在仍有未解决错误且没有停滞报告的情况下退出
- 同一诊断连续多次出现在迭代中，却未得到处理
- 完全禁用 ast-grep 扫描，而不是禁用特定规则
- 循环运行时，未在迭代开始时获取 LSP 基线
- 在两次循环迭代之间手动更改代码，却未重新运行诊断

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 每次迭代都记录在进度日志中，并包含错误数量的变化值
- [ ] 最后一次迭代显示零错误，或提供明确的停滞报告
- [ ] 循环开始时已获取 LSP 基线（显示诊断数量）
- [ ] 循环期间至少运行过一次 ast-grep 扫描（显示输出）
- [ ] 已记录未解决的事项及其无法修复的原因
- [ ] 连续两次迭代之间的诊断数量均未增加

<!-- moai:evolvable-end -->