---
name: session-wrap
description: This skill should be used when the user asks to "wrap up session", "end session", "session wrap", "/wrap", "document learnings", "what should I commit", or wants to analyze completed work before ending a coding session.
version: 2.0.0
---
# Session Wrap 技能

包含多智能体分析的全面会话收尾工作流。

## 执行流程

```
┌─────────────────────────────────────────────────────┐
│  1. Check Git Status                                │
├─────────────────────────────────────────────────────┤
│  2. Phase 1: 4 Analysis Agents (Parallel)           │
│     ┌─────────────────┬─────────────────┐           │
│     │  doc-updater    │  automation-    │           │
│     │  (docs update)  │  scout          │           │
│     ├─────────────────┼─────────────────┤           │
│     │  learning-      │  followup-      │           │
│     │  extractor      │  suggester      │           │
│     └─────────────────┴─────────────────┘           │
├─────────────────────────────────────────────────────┤
│  3. Phase 2: Validation Agent (Sequential)          │
│     ┌───────────────────────────────────┐           │
│     │       duplicate-checker           │           │
│     │  (Validate Phase 1 proposals)     │           │
│     └───────────────────────────────────┘           │
├─────────────────────────────────────────────────────┤
│  4. Integrate Results & AskUserQuestion             │
├─────────────────────────────────────────────────────┤
│  5. Execute Selected Actions                        │
└─────────────────────────────────────────────────────┘
```

## 步骤 1：检查 Git 状态

```bash
git status --short
git diff --stat HEAD~3 2>/dev/null || git diff --stat
```

## 步骤 2：第 1 阶段——分析智能体（并行）

并行执行 4 个智能体（在单条消息中发出 4 个 Task 调用）。

### 会话摘要（提供给所有智能体）

```
Session Summary:
- Work: [Main tasks performed in session]
- Files: [Created/modified files]
- Decisions: [Key decisions made]
```

### 并行执行

```
Task(
    subagent_type="doc-updater",
    description="Document update analysis",
    prompt="[Session Summary]\n\nAnalyze if CLAUDE.md, context.md need updates."
)

Task(
    subagent_type="automation-scout",
    description="Automation pattern analysis",
    prompt="[Session Summary]\n\nAnalyze repetitive patterns or automation opportunities."
)

Task(
    subagent_type="learning-extractor",
    description="Learning points extraction",
    prompt="[Session Summary]\n\nExtract learnings, mistakes, and new discoveries."
)

Task(
    subagent_type="followup-suggester",
    description="Follow-up task suggestions",
    prompt="[Session Summary]\n\nSuggest incomplete tasks and next session priorities."
)
```

### 智能体职责

| 智能体 | 职责 | 输出 |
|-------|------|--------|
| **doc-updater** | 分析 CLAUDE.md/context.md 需要的更新 | 具体要添加的内容 |
| **automation-scout** | 检测自动化模式 | skill/command/agent 建议 |
| **learning-extractor** | 提取学习要点 | TIL 格式摘要 |
| **followup-suggester** | 建议后续任务 | 按优先级排序的任务列表 |

## 步骤 3：第 2 阶段——校验智能体（顺序执行）

在第 1 阶段完成后运行（依赖第 1 阶段的结果）。

```
Task(
    subagent_type="duplicate-checker",
    description="Phase 1 proposal validation",
    prompt="""
Validate Phase 1 analysis results.

## doc-updater proposals:
[doc-updater results]

## automation-scout proposals:
[automation-scout results]

Check if proposals duplicate existing docs/automation:
1. Complete duplicate: Recommend skip
2. Partial duplicate: Suggest merge approach
3. No duplicate: Approve for addition
"""
)
```

## 步骤 4：整合结果

```markdown
## Wrap Analysis Results

### Documentation Updates
[doc-updater summary]
- Duplicate check: [duplicate-checker feedback]

### Automation Suggestions
[automation-scout summary]
- Duplicate check: [duplicate-checker feedback]

### Learning Points
[learning-extractor summary]

### Follow-up Tasks
[followup-suggester summary]
```

## 步骤 5：选择操作

```
AskUserQuestion(
    questions=[{
        "question": "Which actions would you like to perform?",
        "header": "Wrap Options",
        "multiSelect": true,
        "options": [
            {"label": "Create commit (Recommended)", "description": "Commit changes"},
            {"label": "Update CLAUDE.md", "description": "Document new knowledge/workflows"},
            {"label": "Create automation", "description": "Generate skill/command/agent"},
            {"label": "Skip", "description": "End without action"}
        ]
    }]
)
```

## 步骤 6：执行所选操作

仅执行用户选择的操作。

---

## 快速参考

### 何时使用

- 重要工作会话结束时
- 切换到其他项目之前
- 完成某个功能或修复某个 bug 之后

### 何时跳过

- 仅涉及琐碎改动的极短会话
- 只是阅读/浏览代码
- 快速解答的一次性问题

### 参数

- 为空：以交互方式继续（完整工作流）
- 提供了消息：将其用作提交信息并直接提交

## 附加资源

有关详细的编排模式，请参见 `references/multi-agent-patterns.md`。
