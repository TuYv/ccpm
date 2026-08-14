---
name: do
description: This skill should be used for structured feature development with codebase understanding. Triggers on /do command. Provides a 5-phase workflow (Understand, Clarify, Design, Implement, Complete) using codeagent-wrapper to orchestrate code-explorer, code-architect, code-reviewer, and develop agents in parallel.
allowed-tools: ["Bash(python3:*/.claude/skills/do/scripts/setup-do.py*)", "Bash(python3:*/.claude/skills/do/scripts/task.py*)"]
---
# do - 功能开发编排器

用于系统化功能开发的编排器。通过 `codeagent-wrapper` 调用代理，绝不直接编写代码。

## 循环初始化（必需）

通过 `/do <task>` 触发时，立即初始化任务目录，无需询问是否使用 worktree：

```bash
python3 "$HOME/.claude/skills/do/scripts/setup-do.py" "<task description>"
```

这会在 `.claude/do-tasks/` 下创建一个任务目录，其中包含：
- `task.md`：包含 YAML frontmatter（元数据）和 Markdown 正文（需求/上下文）的单个文件

**Worktree 决策推迟到阶段 4（实现）再进行。** 阶段 1-3 均为只读，不需要 worktree 隔离。

## 任务目录管理

使用 `task.py` 管理任务状态：

```bash
# Update phase
python3 "$HOME/.claude/skills/do/scripts/task.py" update-phase 2

# Check status
python3 "$HOME/.claude/skills/do/scripts/task.py" status

# List all tasks
python3 "$HOME/.claude/skills/do/scripts/task.py" list
```

## Worktree 模式

**仅在需要时**创建 worktree（即阶段 4：实现之前）。如果用户选择 worktree 模式：

1. 使用 `--worktree` 标志运行初始化脚本以创建 worktree：
   ```bash
   python3 "$HOME/.claude/skills/do/scripts/setup-do.py" --worktree "<task description>"
   ```

2. 使用 `DO_WORKTREE_DIR` 环境变量将 `codeagent-wrapper` 的 develop 代理定向到该 worktree。**不要在后续调用中传递 `--worktree`**——否则每次都会创建一个新的 worktree。

```bash
# Save the worktree path from setup output, then prefix all develop calls:
DO_WORKTREE_DIR=<worktree_dir> codeagent-wrapper --agent develop - . <<'EOF'
...
EOF
```

只读代理（code-explorer、code-architect、code-reviewer）不需要 `DO_WORKTREE_DIR`。

## 硬性约束

1. **绝不直接编写代码。** 将所有代码更改委派给 `codeagent-wrapper` 代理。
2. **并行优先。** 通过 `codeagent-wrapper --parallel` 运行相互独立的任务。
3. **每个阶段结束后更新阶段。** 使用 `task.py update-phase <N>`。
4. **预期 `codeagent-wrapper` 调用会长时间运行。** 高推理模式可能需要很长时间。
5. **超时不是逃避手段。** 如果调用超时，请缩小范围后重试。
6. **将 worktree 决策推迟到阶段 4。** 仅在即将实现之前询问是否使用 worktree 模式。如果启用，请在 develop 代理调用前添加 `DO_WORKTREE_DIR=<path>`。初始化后绝不传递 `--worktree`。

## 代理

| 代理 | 用途 | 是否需要 --worktree |
|-------|---------|------------------|
| `code-explorer` | 追踪代码、梳理架构、查找模式 | 否（只读） |
| `code-architect` | 设计方案、制定文件计划和构建顺序 | 否（只读） |
| `code-reviewer` | 审查错误、简洁性和约定 | 否（只读） |
| `develop` | 实现代码、运行测试 | **是**——使用 `DO_WORKTREE_DIR` 环境变量前缀 |

## 问题严重程度定义

**阻塞性问题**（需要用户输入）：
- 影响核心功能或正确性
- 安全漏洞
- 与现有模式存在架构冲突
- 需求含糊且存在多种有效解释

**次要问题**（无需询问，自动修复）：
- 代码风格不一致
- 命名改进
- 缺少文档
- 非关键性的测试覆盖率缺口

## 五阶段工作流

### 阶段 1：理解（并行，无交互）

**目标：** 同时理解需求并梳理代码库。

**操作：** 并行运行 `code-architect` 和 2-3 个 `code-explorer` 任务。

```bash
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: p1_requirements
agent: code-architect
workdir: .
---CONTENT---
Analyze requirements completeness (score 1-10):
1. Extract explicit requirements, constraints, acceptance criteria
2. Identify blocking questions (issues that prevent implementation)
3. Identify minor clarifications (nice-to-have but can proceed without)

Output format:
- Completeness score: X/10
- Requirements: [list]
- Non-goals: [list]
- Blocking questions: [list, if any]

---TASK---
id: p1_similar_features
agent: code-explorer
workdir: .
---CONTENT---
Find 1-3 similar features, trace end-to-end. Return: key files with line numbers, call flow, extension points.

---TASK---
id: p1_architecture
agent: code-explorer
workdir: .
---CONTENT---
Map architecture for relevant subsystem. Return: module map + 5-10 key files.

---TASK---
id: p1_conventions
agent: code-explorer
workdir: .
---CONTENT---
Identify testing patterns, conventions, config. Return: test commands + file locations.
EOF
```

### 阶段 2：澄清（有条件）

**目标：** 仅解决会阻碍工作的歧义。

**操作：**
1. 检查 `p1_requirements` 输出中是否存在阻塞性问题
2. **如果存在阻塞性问题** → 使用 AskUserQuestion
3. **如果不存在阻塞性问题（完整度 >= 8）** → 跳至阶段 3

### 阶段 3：设计（无交互）

**目标：** 制定最小改动的实施计划。

```bash
codeagent-wrapper --agent code-architect - . <<'EOF'
Design minimal-change implementation:
- Reuse existing abstractions
- Minimize new files
- Follow established patterns from Phase 1 exploration

Output:
- File touch list with specific changes
- Build sequence
- Test plan
- Risks and mitigations
EOF
```

### 阶段 4：实现 + 审查

**目标：** 在同一阶段构建功能并进行审查。

**步骤 1：决定是否使用 worktree 模式（仅在此时）**

使用 AskUserQuestion 询问：

```
Develop in a separate worktree? (Isolates changes from main branch)
- Yes (Recommended for larger changes)
- No (Work directly in current directory)
```

如果用户选择 worktree：
```bash
python3 "$HOME/.claude/skills/do/scripts/setup-do.py" --worktree "<task description>"
# Save the worktree path from output for DO_WORKTREE_DIR
```

**步骤 2：调用 develop 智能体**

对于全栈项目，将任务拆分为后端和前端任务，并为每个任务注入 `skills:`。当任务可以拆分时使用 `--parallel`；当改动较小或仅涉及单一领域时，使用单个智能体。

**单一领域示例**（如果启用了 worktree，则以 `DO_WORKTREE_DIR` 为前缀）：

```bash
# With worktree:
DO_WORKTREE_DIR=<worktree_dir> codeagent-wrapper --agent develop --skills golang-base-practices - . <<'EOF'
Implement with minimal change set following the Phase 3 blueprint.
- Follow Phase 1 patterns
- Add/adjust tests per Phase 3 plan
- Run narrowest relevant tests
EOF

# Without worktree:
codeagent-wrapper --agent develop --skills golang-base-practices - . <<'EOF'
Implement with minimal change set following the Phase 3 blueprint.
- Follow Phase 1 patterns
- Add/adjust tests per Phase 3 plan
- Run narrowest relevant tests
EOF
```

**全栈并行示例**（根据阶段 3 的设计调整任务 ID、技能和内容）：

```bash
# With worktree:
DO_WORKTREE_DIR=<worktree_dir> codeagent-wrapper --parallel <<'EOF'
---TASK---
id: p4_backend
agent: develop
workdir: .
skills: golang-base-practices
---CONTENT---
Implement backend changes following Phase 3 blueprint.
- Follow Phase 1 patterns
- Add/adjust tests per Phase 3 plan

---TASK---
id: p4_frontend
agent: develop
workdir: .
skills: frontend-design,vercel-react-best-practices
dependencies: p4_backend
---CONTENT---
Implement frontend changes following Phase 3 blueprint.
- Follow Phase 1 patterns
- Add/adjust tests per Phase 3 plan
EOF

# Without worktree: remove DO_WORKTREE_DIR prefix
```

注意：根据阶段 3 的设计输出选择要注入的技能。仅注入与每项任务所属领域相关的技能。

**步骤 3：审查**

**步骤 3：审查**

并行运行审查：

```bash
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: p4_correctness
agent: code-reviewer
workdir: .
---CONTENT---
Review for correctness, edge cases, failure modes.
Classify each issue as BLOCKING or MINOR.

---TASK---
id: p4_simplicity
agent: code-reviewer
workdir: .
---CONTENT---
Review for KISS: remove bloat, collapse needless abstractions.
Classify each issue as BLOCKING or MINOR.
EOF
```

**步骤 4：处理审查结果**

- **仅有 MINOR 问题** → 通过 `develop` 自动修复，无需用户交互
- **存在 BLOCKING 问题** → 使用 AskUserQuestion：“立即修复 / 按现状继续”

### 阶段 5：完成（无需交互）

**目标：** 记录所构建的内容。

```bash
codeagent-wrapper --agent code-reviewer - . <<'EOF'
Write completion summary:
- What was built
- Key decisions/tradeoffs
- Files modified (paths)
- How to verify (commands)
- Follow-ups (optional)
EOF
```

输出完成信号：
```
<promise>DO_COMPLETE</promise>
```