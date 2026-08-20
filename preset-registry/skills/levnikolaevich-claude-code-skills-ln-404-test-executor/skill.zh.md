---
name: ln-404-test-executor
description: "Executes test tasks (label 'tests') through Todo to To Review with risk-based limits. Use for test task execution. Not for implementation tasks."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-line__outline, mcp__hex-line__read_file, mcp__hex-line__edit_file, mcp__hex-line__write_file, mcp__hex-line__verify, mcp__hex-line__changes, mcp__hex-line__inspect_path
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 测试任务执行器

**类型：** L3 工作器

运行单个 Story 的最终测试任务（标签为 `"tests"`），完成实施/执行并将其推进至 To Review。

## 目的与范围
- 仅处理带有 `"tests"` 标签的任务；其他任务交由 ln-401 处理。
- 遵循包含 11 个部分的测试任务计划（E2E/集成/单元测试、基础设施/文档/清理）。
- 强制执行基于风险的约束：覆盖优先级 ≥15 的场景；每项测试均满足实用性标准；不进行框架/数据库/库/性能测试。
- 仅更新此任务的跟踪器/看板状态：Todo -> In Progress -> To Review。

**Hex-line 加速（如可用）：** 在读取测试目标之前使用 `outline(file_path)`。使用范围较窄的 `inspect_path(path=<relevant test dir>)` 来了解测试结构；如果确实需要获取 `tests/` 的完整广泛清单，请明确选择 `max_entries=0`，而不是假定默认的模式数量上限会显示所有内容。
先使用 `grep_search(output_mode="summary")` 查找测试/辅助程序/夹具，只有在后续编辑需要规范代码片段时，才升级为 `output_mode="content", edit_ready=true`；仅将 `allow_large_output=true` 用作明确的覆盖选项。将 `read_file()` 和 `edit_file()` 作为处理测试/代码/配置文件的主要方式。正常检查时，让 `read_file()` 保持发现模式；对于需要遵循修订/校验和协议的编辑，请在编辑前使用 `read_file(edit_ready=true, verbosity="full")`。交接前使用 `verify()` 和 `changes()`。仅当 hex-line 不可用时，才回退使用内置的 Read/Edit。

## 输入

| 输入 | 必需 | 来源 | 说明 |
|-------|----------|--------|-------------|
| `taskId` | 是 | 参数、父 Story、看板、用户 | 要执行的测试任务 |

**解析：** 任务解析链。
**状态过滤器：** Todo（标签：tests）

## 任务存储模式

**强制阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/tracker_provider_contract.md` 和 `references/input_resolution_pattern.md`

**强制阅读：** 加载 `references/ci_tool_detection.md` —— 测试命令执行所需的紧凑输出标志、pipefail、先规范化再截断策略。

提取：`task_provider` = 任务管理 → 提供商（`linear` | `github` | `file`）。此技能中的操作与提供商无关——有关规范操作集，请参阅 `references/tracker_provider_contract.md`；有关传输绑定，请参阅 `provider_*.md`。

此技能使用的跟踪器操作：`getTask`、`getStory`、`updateStatus`（Todo → In Progress → To Review）、`addComment`（测试结果）。各提供商的传输方式位于 `references/provider_file.md, references/provider_github.md, references/provider_linear.md`。

**强制阅读：** 加载 `references/mcp_tool_preferences.md` —— 只要可用，始终使用 hex-line MCP 处理代码文件。除非 hex-line 不可用，否则不得回退到标准 Read/Edit。

## 工作流（简要）
1) **解析 taskId：** 按照指南运行任务解析链（状态过滤器：[Todo, label: tests]）。
2) **加载任务：** 通过已配置的跟踪器提供商（`getTask`）获取完整的测试任务描述；阅读关联的指南/手册/ADR/研究资料；审阅父 Story（`getStory`）以及已提供的手动测试结果。
2b) **目标门禁：** **强制阅读：** 加载 `references/goal_articulation_gate.md` —— 说明这些测试的真实目标（必须验证哪些业务行为，而不是“编写测试”）。非目标：测试基础设施或框架行为，而非业务逻辑。隐藏约束：实施变更可能会破坏哪些现有测试。
3) **阅读环境文档：** **阅读 `docs/project/infrastructure.md`** —— 获取服务器 IP、端口和服务端点。**阅读 `docs/project/runbook.md`** —— 了解测试环境设置、Docker 命令和测试执行前提条件。使用运行手册中的原样命令。
4) **验证计划：** 检查是否覆盖优先级 ≥15 的场景并满足实用性标准；确保重点关注业务流程（不进行仅针对基础设施的测试）。
5) **开始工作：** 通过已配置的跟踪器提供商（`updateStatus`）将任务设置为 In Progress；在看板中移动任务。
6) **实施并运行：** **强制阅读：** 加载 `references/code_efficiency_criterion.md` —— 根据计划编写/更新测试；复用现有夹具/辅助程序；运行测试；修复失败的现有测试；按要求更新基础设施/文档部分。交接前，验证 3 项效率自检（尤其是：复用夹具，而不是重复编写设置代码）。
7) **完成：** 确保数量/优先级仍在限制范围内；将任务设置为 To Review；在看板中移动任务；添加评论，总结覆盖范围、运行过的命令以及所有偏差。

## 关键规则
- 仅处理单个任务；不得批量更新。
- 不要标记为 Done；由审阅者批准。任务最终必须处于 To Review 状态。
- 与任务使用的语言（EN/RU）保持一致。
- 不进行框架/库/数据库/性能/负载测试；专注于业务逻辑的正确性（而非基础设施吞吐量）。
- 遵守限制和优先级；如有违反，立即停止并返回调查结果。
- **不要提交。** 保持所有更改未提交——由审阅者审查并提交。

## 运行时摘要产物

**必须阅读：** 加载 `references/coordinator_summary_contract.md`、`references/worker_runtime_contract.md`、`references/task_worker_runtime_contract.md`

共享约定：
- 输出 `summary_kind=task-status`
- 独立模式省略 `runId` 和 `summaryArtifactPath`
- 托管模式必须在工作器写入经过验证的摘要之前，同时传入 `runId` 和准确的 `summaryArtifactPath`

**Monitor（2.1.98+）：** 对于预计耗时超过 30 秒的测试/覆盖率命令，使用 `Monitor`。备用方案：`Bash(run_in_background=true)`。

## 完成定义
- [ ] 任务已识别为测试任务并设置为 In Progress；看板已更新
- [ ] 计划已通过验证（优先级/限制），并已阅读指南
- [ ] 测试已实现/更新并执行；已有失败已修复
- [ ] 已按照任务计划应用文档/基础设施更新
- [ ] 任务已设置为 To Review；看板卡片已移动；已添加包含命令和覆盖率的摘要评论
- [ ] 运行时摘要产物已写入共享的 task-status 位置。

## 测试失败分析规程

**关键要求：** 当**新编写的测试**失败时，必须在进行任何更改之前停止并分析（新测试失败通常表明实现中存在缺陷，而非测试本身有问题——盲目修复会掩盖根本原因）。

**步骤 1：验证测试的正确性**
- 测试是否完全符合 AC 要求？（Story 中的 Given/When/Then）
- 根据业务逻辑，预期值是否正确？
- 如果不确定：查询 `ref_search_documentation(query="[domain] expected behavior")`

**步骤 2：决策**
| 测试符合 AC？ | 操作 |
|------------------|--------|
| 是 | **代码中存在缺陷** → 修复实现，而非测试 |
| 否 | 测试有误 → 修复测试断言 |
| 不确定 | **强制要求：** 查询 MCP Ref，并在更改前询问用户 |

**步骤 3：记录在跟踪器评论中**（`addComment`）
“测试 [name] 失败。分析：[测试正确 / 测试错误]。操作：[修复了代码 / 修复了测试]。原因：[理由]”

**危险信号（需要用户确认）：**
- ⚠️ 更改断言以匹配实际输出（“让测试变绿”）
- ⚠️ 删除“无法正常工作”的测试用例
- ⚠️ 弱化预期（例如，使用 `toContain` 而不是 `toEqual`）

**安全操作（可以继续）：**
- ✅ 修复测试设置/模拟数据中的拼写错误
- ✅ 修复代码以符合 AC 要求
- ✅ 添加缺失的测试设置步骤

## 测试编写原则

### 1. 严格断言——任何不匹配都应失败

**默认使用精确匹配断言：**

| 严格（优先） | 宽松（除非有充分理由，否则避免） |
|-----------------|--------------------------------|
| 精确相等检查 | 部分匹配/子字符串匹配 |
| 精确长度检查 | “具有任意长度”检查 |
| 完整对象比较 | 部分对象匹配 |
| 精确类型检查 | 真值/假值检查 |

**禁止使用 WARN 级别的断言**——测试只能是 PASS 或 FAIL，不能有警告。

### 2. 对确定性输出进行基于预期结果的测试

**对于确定性响应（API、转换）：**
- 对复杂的确定性输出使用**快照/黄金文件测试**
- 将实际输出与预期参考文件进行比较
- 在比较前对动态数据进行规范化（时间戳 → 固定值，UUID → 占位符）

### 3. 黄金法则

> “如果你知道预期值，就断言精确值。”

**禁止：**当精确值已知时，使用宽松断言来“让测试通过”。

## 参考文件
- **环境状态：**`references/environment_state_contract.md`
- **存储模式操作：**`references/storage_mode_detection.md`
- 看板格式：`docs/tasks/kanban_board.md`
- **强制阅读：**加载 `references/research_tool_fallback.md`

---
**版本：**3.2.0
**最后更新：**2026-01-15