---
name: ln-403-task-rework
description: "Fixes tasks in To Rework by applying reviewer feedback, then returns to To Review. Use when task was rejected during review."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-line__outline, mcp__hex-line__read_file, mcp__hex-line__edit_file, mcp__hex-line__write_file, mcp__hex-line__verify, mcp__hex-line__changes, mcp__hex-line__inspect_path
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）相对于此技能目录。

# 任务返工执行器

**类型：** L3 工作器

对单个标记为 To Rework 的任务执行返工，并将其交回审核。

## 目的与范围
- 加载完整任务、审核者评论和父级 Story；理解所要求的更改。
- 根据反馈进行修复，遵循 KISS/YAGNI，并与指南/技术方案保持一致。
- 仅更新此任务：To Rework -> In Progress -> To Review；不触碰其他任务。

**Hex-line 加速（如果可用）：** 在读取大型代码文件之前使用 `outline(file_path)`。使用 `read_file()` 进行探索；在执行任何需要 `revision` 和校验和的编辑之前，使用 `read_file(edit_ready=true, verbosity="full")`。编辑后：`edit_file(base_revision=rev)` → `verify(checksums)`。使用 `changes()` 展示已修复的内容。
## 输入

返工期间，使用 `read_file()` 和 `edit_file()` 作为处理代码/配置/脚本/测试文件的主要方式。默认情况下，让 `read_file()` 优先用于探索；仅当你即将使用其版本/校验和协议时，才请求 `edit_ready=true, verbosity="full"`。仅当 hex-line 不可用时，才回退使用内置的 Read/Edit。

| 输入 | 必需 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `taskId` | 是 | 参数、父级 Story、看板、用户 | 要返工的任务 |

**解析方式：** 任务解析链。
**状态过滤器：** To Rework

## 任务存储模式

**强制阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/tracker_provider_contract.md` 和 `references/input_resolution_pattern.md`

提取：`task_provider` = 任务管理 → 提供商（`linear` | `github` | `file`）。此技能中的操作保持与提供商无关——规范操作集请参阅 `references/tracker_provider_contract.md`，传输绑定请参阅 `provider_*.md`。

此技能使用的跟踪器操作：`getTask`、`getStory`、`listComments`、`updateStatus`（To Rework → In Progress → To Review）、`addComment`。各提供商的传输方式位于 `references/provider_file.md, references/provider_github.md, references/provider_linear.md`。

**强制阅读：** 加载 `references/mcp_tool_preferences.md`——只要可用，就始终对代码文件使用 hex-line MCP。除非 hex-line 已停止运行，否则不得回退到标准 Read/Edit。

## 工作流（简明）
1) **解析 taskId：** 按照指南运行任务解析链（状态过滤器：[To Rework]）。
2) **加载任务：** 通过已配置的跟踪器提供商读取任务和审核备注（`getTask`、`listComments`）；通过 `getStory` 获取父级 Story。
2b) **目标门禁：** **强制阅读：** 加载 `references/goal_articulation_gate.md`——陈述此次返工的真实目标（实际出了什么问题，而不是“应用反馈”）。结合 5 Whys（`references/problem_solving.md`），确保在阐明返工目标的同时也阐明根本原因。以下不是目标：仅处理表象而不解决根本原因的肤浅补丁。
3) **规划修复：** 将每条评论映射到一项操作；确认未添加新范围。
4) **实施：** **强制阅读：** 加载 `references/code_efficiency_criterion.md`——遵循任务计划/复选框；处理配置/硬编码问题；更新“受影响的组件”和“现有代码影响”中注明的文档/测试。交接前，完成 3 项效率自检。
5) **质量：** 运行类型检查/lint（或项目中的等效检查）；确保修复符合指南/手册/ADR/研究。
6) **根本原因分析：** 询问“为什么代理会生成错误的代码？”分类：缺少上下文 | 使用了错误的模式 | AC 不明确 | 文档/模板存在缺口。如果发现文档/模板缺口 → 更新相关文件（指南、模板、CLAUDE.md），以防止问题再次发生。
7) **交接：** 通过已配置的跟踪器提供商将任务设置为 To Review（`updateStatus`）；在看板中移动该任务；添加总结评论，其中应提及已解决的反馈和根本原因分类。

## 关键规则
- 仅处理单个任务；绝不批量更新。
- 不要标记为 Done；只能标记为 To Review（由审阅者决定是否标记为 Done）。
- 使用与任务一致的语言（EN/RU）。
- 不要在此创建新测试/任务；仅在受到影响时更新现有测试。
- **不要提交。** 保持所有更改未提交——由审阅者审阅并提交。

## 运行时摘要工件

**必须阅读：** 加载 `references/coordinator_summary_contract.md`、`references/worker_runtime_contract.md`、`references/task_worker_runtime_contract.md`

共享约定：
- 输出 `summary_kind=task-status`
- 独立模式省略 `runId` 和 `summaryArtifactPath`
- 托管模式在工作器写入经过验证的摘要之前，同时传入 `runId` 和准确的 `summaryArtifactPath`

**Monitor（2.1.98+）：** 当验证命令预计耗时超过 30 秒时，使用 `Monitor`。后备方案：`Bash(run_in_background=true)`。

## 完成定义
- [ ] 已完整阅读任务和审阅反馈，并映射相应操作。
- [ ] 已应用修复；按要求更新文档/测试。
- [ ] 已通过质量检查（类型检查/lint 或项目标准）。
- [ ] 已对根本原因进行分类（缺少上下文 | 模式错误 | AC 不明确 | 文档缺口）；如果发现缺口，已更新文档/模板。
- [ ] 状态已设为 To Review；看板已更新；已添加包含修复项和根本原因的摘要评论。
- [ ] 已将运行时摘要工件写入共享的 task-status 位置。

## 参考文件
- **环境状态：** `references/environment_state_contract.md`
- **存储模式操作：** `references/storage_mode_detection.md`
- **[必须] 问题解决方法：** `references/problem_solving.md`
- 看板格式：`docs/tasks/kanban_board.md`

---
**版本：** 3.0.0
**最后更新：** 2025-12-23