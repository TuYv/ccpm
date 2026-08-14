---
name: gepetto
description: Creates detailed, sectionized implementation plans through research, stakeholder interviews, and multi-LLM review. Use when planning features that need thorough pre-implementation analysis.
---
# Gepetto

编排一个多步骤规划流程：研究 → 访谈 → 规格综合 → 计划 → 外部评审 → 分节

## 关键要求：最先执行的操作

**在执行任何其他操作之前**，按顺序完成以下操作：

### 1. 打印简介

立即打印简介横幅：
```
═══════════════════════════════════════════════════════════════
GEPETTO: AI-Assisted Implementation Planning
═══════════════════════════════════════════════════════════════
Research → Interview → Spec Synthesis → Plan → External Review → Sections

Note: GEPETTO will write many .md files to the planning directory you pass it
```

### 2. 验证规格文件输入

**检查用户是否在调用时提供了 @file，并且它是规格文件（以 `.md` 结尾）。**

如果未提供 @file，或者路径不以 `.md` 结尾，则输出以下内容并停止：
```
═══════════════════════════════════════════════════════════════
GEPETTO: Spec File Required
═══════════════════════════════════════════════════════════════

This skill requires a markdown spec file path (must end with .md).
The planning directory is inferred from the spec file's parent directory.

To start a NEW plan:
  1. Create a markdown spec file describing what you want to build
  2. It can be as detailed or as vague as you like
  3. Place it in a directory where gepetto can save planning files
  4. Run: /gepetto @path/to/your-spec.md

To RESUME an existing plan:
  1. Run: /gepetto @path/to/your-spec.md

Example: /gepetto @planning/my-feature-spec.md
═══════════════════════════════════════════════════════════════
```
**不要继续。等待用户使用一个 .md 文件路径重新调用。**

### 3. 设置规划会话

通过检查现有文件来确定会话状态：

1. 设置 `planning_dir` = 规格文件的父目录
2. 设置 `initial_file` = 规格文件路径
3. 扫描现有规划文件：
   - `claude-research.md`
   - `claude-interview.md`
   - `claude-spec.md`
   - `claude-plan.md`
   - `claude-integration-notes.md`
   - `claude-ralph-loop-prompt.md`
   - `claude-ralphy-prd.md`
   - `reviews/` 目录
   - `sections/` 目录

4. 确定模式和恢复点：

| 找到的文件 | 模式 | 从何处恢复 |
|-------------|------|-------------|
| 无 | 新建 | 步骤 4 |
| 仅有研究文件 | 恢复 | 步骤 6（访谈） |
| 研究文件 + 访谈文件 | 恢复 | 步骤 8（规格综合） |
| + 规格文件 | 恢复 | 步骤 9（计划） |
| + 计划文件 | 恢复 | 步骤 10（外部评审） |
| + 评审文件 | 恢复 | 步骤 11（整合） |
| + 整合说明文件 | 恢复 | 步骤 12（用户评审） |
| + `sections/index.md` | 恢复 | 步骤 14（编写分节） |
| 所有分节均已完成 | 恢复 | 步骤 15（执行文件） |
| + `claude-ralph-loop-prompt.md` + `claude-ralphy-prd.md` | 完成 | 完毕 |

5. 根据当前状态，使用 TodoWrite 创建 TODO 列表

打印状态：
```
Planning directory: {planning_dir}
Mode: {mode}
```

如果正在恢复：
```
Resuming from step {N}
To start fresh, delete the planning directory files.
```

---

## 日志格式

```
═══════════════════════════════════════════════════════════════
STEP {N}/17: {STEP_NAME}
═══════════════════════════════════════════════════════════════
{details}
Step {N} complete: {summary}
───────────────────────────────────────────────────────────────
```

---

## 工作流程

### 4. 研究决策

参见 [research-protocol.md](references/research-protocol.md)。

1. 阅读规范文件
2. 提取潜在的研究主题（技术、模式、集成）
3. 询问用户是否需要研究代码库
4. 询问用户是否需要进行 Web 研究（将推导出的主题作为多选项呈现）
5. 记录要在步骤 5 中执行的研究类型

### 5. 执行研究

参见 [research-protocol.md](references/research-protocol.md)。

根据步骤 4 中的决策，启动研究子智能体：
- **代码库研究：** `Task(subagent_type=Explore)`
- **Web 研究：** 使用 WebSearch 的 `Task(subagent_type=Explore)`

如果两者都需要，则并行启动两个 Task 工具（在一条消息中进行多个工具调用）。

**重要：** 子智能体会返回其研究结果——它们不会直接写入文件。收集所有子智能体的结果后，将它们合并并写入 `<planning_dir>/claude-research.md`。

如果用户在步骤 4 中选择不进行任何研究，则完全跳过此步骤。

### 6. 详细访谈

参见 [interview-protocol.md](references/interview-protocol.md)

在主上下文中运行（AskUserQuestion 要求如此）。访谈应参考：
- 初始规范
- 研究结果（如有）

### 7. 保存访谈记录

将问答写入 `<planning_dir>/claude-interview.md`

### 8. 编写初始规范（规范综合）

将以下内容合并到 `<planning_dir>/claude-spec.md`：
- **初始输入**（规范文件）
- **研究结果**（如果执行了步骤 5）
- **访谈回答**（来自步骤 6）

此步骤将用户的原始需求综合成一份完整的规范。

### 9. 生成实施计划

创建详细计划 → `<planning_dir>/claude-plan.md`

**重要**：面向不熟悉相关背景的读者编写。计划必须完全自包含——工程师或 LLM 即使没有任何先前上下文，也应当仅通过阅读此文档就能理解我们要构建*什么*、*为什么*构建，以及*如何*构建。

### 10. 外部审查

参见 [external-review.md](references/external-review.md)

并行启动两个子智能体来审查计划：
1. 通过 Bash 使用 **Gemini**
2. 通过 Bash 使用 **Codex**

两者都会接收计划内容并返回分析结果。将结果写入 `<planning_dir>/reviews/`。

### 11. 整合外部反馈

分析 `<planning_dir>/reviews/` 中的建议。

由你决定整合或不整合哪些内容。即使你决定不整合任何内容也没关系。

**步骤 1：** 编写 `<planning_dir>/claude-integration-notes.md`，记录：
- 要整合哪些建议以及原因
- 不整合哪些建议以及原因

**步骤 2：** 使用整合后的更改更新 `<planning_dir>/claude-plan.md`。

### 12. 用户审查整合后的计划

使用 AskUserQuestion：
```
The plan has been updated with external feedback. You can now review and edit claude-plan.md.

If you want Claude's help editing the plan, open a separate Claude session - this session
is mid-workflow and can't assist with edits until the workflow completes.

When you're done reviewing, select "Done" to continue.
```

选项：“完成审查”

等待用户确认后再继续。

### 13. 创建章节索引

请参阅 [section-index.md](references/section-index.md)

读取 `claude-plan.md`。识别自然的章节边界，并创建 `<planning_dir>/sections/index.md`。

**关键：** index.md 必须以 SECTION_MANIFEST 块开头。格式要求请参阅参考文档。

先写入 `index.md`，然后再继续创建章节文件。

### 14. 编写章节文件 — 并行子代理

请参阅 [section-splitting.md](references/section-splitting.md)

**启动并行子代理**——每个章节对应一个 Task，以实现最高效率：

1. 首先，解析 `sections/index.md` 以获取 SECTION_MANIFEST 列表
2. 然后在单条消息中启动所有章节 Task（并行执行）：

```
# Launch all in ONE message for parallel execution:

Task(
  subagent_type="general-purpose",
  prompt="""
  Write section file: section-01-{name}

  Inputs:
  - <planning_dir>/claude-plan.md
  - <planning_dir>/sections/index.md

  Output: <planning_dir>/sections/section-01-{name}.md

  The section file must be COMPLETELY SELF-CONTAINED. Include:
  - Background (why this section exists)
  - Requirements (what must be true when complete)
  - Dependencies (requires/blocks)
  - Implementation details (from the plan)
  - Acceptance criteria (checkboxes)
  - Files to create/modify

  The implementer should NOT need to reference any other document.
  """
)

Task(
  subagent_type="general-purpose",
  prompt="Write section file: section-02-{name} ..."
)

Task(
  subagent_type="general-purpose",
  prompt="Write section file: section-03-{name} ..."
)

# ... one Task per section in the manifest
```

等待所有子代理完成后再继续。

### 15. 生成执行文件 — 子代理

**委托给子代理**，以减少主上下文的 token 使用量：

```
Task(
  subagent_type="general-purpose",
  prompt="""
  Generate two execution files for autonomous implementation.

  Input files:
  - <planning_dir>/sections/index.md (has SECTION_MANIFEST)
  - <planning_dir>/sections/section-*.md (all section files)

  OUTPUT 1: <planning_dir>/claude-ralph-loop-prompt.md
  For ralph-loop plugin. EMBED all section content inline.

  Structure:
  - Mission statement
  - Full content of sections/index.md
  - Full content of EACH section file (embedded, not referenced)
  - Execution rules (dependency order, verify acceptance criteria)
  - Completion signal: <promise>ALL-SECTIONS-COMPLETE</promise>

  OUTPUT 2: <planning_dir>/claude-ralphy-prd.md
  For Ralphy CLI. REFERENCE section files (don't embed).

  Structure:
  - PRD header
  - How to use (ralphy --prd command)
  - Context explanation
  - Checkbox task list: one "- [ ] Section NN: {name}" per section

  Write both files.
  """
)
```

等待子代理完成后再继续。

### 16. 最终状态

验证所有文件均已成功创建：
- SECTION_MANIFEST 中的所有章节文件
- `claude-ralph-loop-prompt.md`
- `claude-ralphy-prd.md`

### 17. 输出摘要

输出生成的文件和后续步骤：
```
═══════════════════════════════════════════════════════════════
GEPETTO: Planning Complete
═══════════════════════════════════════════════════════════════

Generated files:
  - claude-research.md (research findings)
  - claude-interview.md (Q&A transcript)
  - claude-spec.md (synthesized specification)
  - claude-plan.md (implementation plan)
  - claude-integration-notes.md (feedback decisions)
  - reviews/ (external LLM feedback)
  - sections/ (implementation units)
  - claude-ralph-loop-prompt.md (for ralph-loop plugin)
  - claude-ralphy-prd.md (for Ralphy CLI)

How to implement:

Option A - Manual (recommended for learning/control):
  1. Read sections/index.md to understand dependencies
  2. Implement each section file in order
  3. Each section is self-contained with acceptance criteria

Option B - Autonomous with ralph-loop (Claude Code plugin):
  /ralph-loop @<planning_dir>/claude-ralph-loop-prompt.md --completion-promise "COMPLETE" --max-iterations 100

Option C - Autonomous with Ralphy (external CLI):
  ralphy --prd <planning_dir>/claude-ralphy-prd.md
  # Or: cp <planning_dir>/claude-ralphy-prd.md ./PRD.md && ralphy
═══════════════════════════════════════════════════════════════
```