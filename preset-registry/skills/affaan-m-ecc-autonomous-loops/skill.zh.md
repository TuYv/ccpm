---
name: autonomous-loops
description: "Patterns and architectures for autonomous Claude Code loops — from simple sequential pipelines to RFC-driven multi-agent DAG systems."
origin: ECC
---
# 自主循环技能

> 兼容性说明（v1.8.0）：`autonomous-loops` 将保留一个版本。
> 目前规范技能名称为 `continuous-agent-loop`。新的循环指南
> 应在该技能中编写，同时保留此技能以避免
> 破坏现有工作流。

用于让 Claude Code 在循环中自主运行的模式、架构和参考实现。涵盖从简单的 `claude -p` 流水线到完整的 RFC 驱动型多智能体 DAG 编排等各种方案。

## 何时使用

- 设置无需人工干预即可运行的自主开发工作流
- 为你的问题选择合适的循环架构（简单或复杂）
- 构建 CI/CD 风格的持续开发流水线
- 运行具有合并协调机制的并行智能体
- 实现跨循环迭代的上下文持久化
- 为自主工作流添加质量门禁和清理步骤

## 循环模式谱系

从最简单到最复杂：

| 模式 | 复杂度 | 最适合 |
|---------|-----------|----------|
| [顺序流水线](#1-sequential-pipeline-claude--p) | 低 | 日常开发步骤、脚本化工作流 |
| [NanoClaw REPL](#2-nanoclaw-repl) | 低 | 交互式持久会话 |
| [无限智能体循环](#3-infinite-agentic-loop) | 中 | 并行内容生成、规范驱动型工作 |
| [持续 Claude PR 循环](#4-continuous-claude-pr-loop) | 中 | 具有 CI 门禁的多日迭代项目 |
| [去粗糙化模式](#5-the-de-sloppify-pattern) | 附加项 | 在任何实现者步骤之后进行质量清理 |
| [Ralphinho / RFC 驱动型 DAG](#6-ralphinho--rfc-driven-dag-orchestration) | 高 | 大型功能、具有合并队列的多单元并行工作 |

---

## 1. 顺序流水线（`claude -p`）

**最简单的循环。** 将日常开发拆分为一系列非交互式 `claude -p` 调用。每次调用都是一个具有明确提示词的专注步骤。

### 核心见解

> 如果你无法理清这样的循环，就意味着你甚至无法在交互模式下驱动 LLM 修复你的代码。

`claude -p` 标志让 Claude Code 使用提示词以非交互方式运行，并在完成后退出。将多次调用串联起来即可构建流水线：

```bash
#!/bin/bash
# daily-dev.sh — Sequential pipeline for a feature branch

set -e

# Step 1: Implement the feature
claude -p "Read the spec in docs/auth-spec.md. Implement OAuth2 login in src/auth/. Write tests first (TDD). Do NOT create any new documentation files."

# Step 2: De-sloppify (cleanup pass)
claude -p "Review all files changed by the previous commit. Remove any unnecessary type tests, overly defensive checks, or testing of language features (e.g., testing that TypeScript generics work). Keep real business logic tests. Run the test suite after cleanup."

# Step 3: Verify
claude -p "Run the full build, lint, type check, and test suite. Fix any failures. Do not add new features."

# Step 4: Commit
claude -p "Create a conventional commit for all staged changes. Use 'feat: add OAuth2 login flow' as the message."
```

### 关键设计原则

1. **每个步骤彼此隔离** — 每次调用 `claude -p` 都使用全新的上下文窗口，这意味着步骤之间不会发生上下文串扰。
2. **顺序很重要** — 步骤按顺序执行。每个步骤都基于上一步留下的文件系统状态继续操作。
3. **否定式指令很危险** — 不要说“不要测试类型系统”。应改为添加单独的清理步骤（参见[去粗糙化模式](#5-the-de-sloppify-pattern)）。
4. **退出代码会传播** — `set -e` 会在发生失败时停止流水线。

### 变体

**使用模型路由：**
```bash
# Research with Opus (deep reasoning)
claude -p --model opus "Analyze the codebase architecture and write a plan for adding caching..."

# Implement with Sonnet (fast, capable)
claude -p "Implement the caching layer according to the plan in docs/caching-plan.md..."

# Review with Opus (thorough)
claude -p --model opus "Review all changes for security issues, race conditions, and edge cases..."
```

**使用环境上下文：**
```bash
# Pass context via files, not prompt length
echo "Focus areas: auth module, API rate limiting" > .claude-context.md
claude -p "Read .claude-context.md for priorities. Work through them in order."
rm .claude-context.md
```

**使用 `--allowedTools` 限制：**
```bash
# Read-only analysis pass
claude -p --allowedTools "Read,Grep,Glob" "Audit this codebase for security vulnerabilities..."

# Write-only implementation pass
claude -p --allowedTools "Read,Write,Edit,Bash" "Implement the fixes from security-audit.md..."
```

---

## 2. NanoClaw REPL

**ECC 内置的持久化循环。** 一个能够感知会话的 REPL，它会同步调用 `claude -p`，并携带完整的对话历史记录。

```bash
# Start the default session
node scripts/claw.js

# Named session with skill context
CLAW_SESSION=my-project CLAW_SKILLS=tdd-workflow,security-review node scripts/claw.js
```

### 工作原理

1. 从 `~/.claude/claw/{session}.md` 加载对话历史记录
2. 每条用户消息都会连同完整历史记录一起作为上下文发送给 `claude -p`
3. 响应会追加到会话文件中（以 Markdown 作为数据库）
4. 会话在重启后仍会保留

### 何时使用 NanoClaw，何时使用顺序流水线

| 使用场景 | NanoClaw | 顺序流水线 |
|----------|----------|-------------------|
| 交互式探索 | 是 | 否 |
| 脚本化自动化 | 否 | 是 |
| 会话持久化 | 内置 | 手动 |
| 上下文累积 | 随每轮增长 | 每个步骤均为全新上下文 |
| CI/CD 集成 | 较差 | 极佳 |

完整详情请参阅 `/claw` 命令文档。

---

## 3. 无限智能体循环

**一个双提示词系统**，用于编排并行子智能体，以实现规范驱动的生成。由 disler 开发（致谢：@disler）。

### 架构：双提示词系统

```
PROMPT 1 (Orchestrator)              PROMPT 2 (Sub-Agents)
┌─────────────────────┐             ┌──────────────────────┐
│ Parse spec file      │             │ Receive full context  │
│ Scan output dir      │  deploys   │ Read assigned number  │
│ Plan iteration       │────────────│ Follow spec exactly   │
│ Assign creative dirs │  N agents  │ Generate unique output │
│ Manage waves         │             │ Save to output dir    │
└─────────────────────┘             └──────────────────────┘
```

### 模式

1. **规范分析** — 编排器读取定义生成内容的规范文件（Markdown）
2. **目录侦察** — 扫描现有输出，查找最大的迭代编号
3. **并行部署** — 启动 N 个子智能体，每个子智能体均具有：
   - 完整规范
   - 独特的创意方向
   - 特定的迭代编号（无冲突）
   - 现有迭代的快照（用于确保唯一性）
4. **波次管理** — 在无限模式下，以每波 3-5 个智能体的方式持续部署，直至上下文耗尽

### 通过 Claude Code 命令实现

创建 `.claude/commands/infinite.md`：

```markdown
Parse the following arguments from $ARGUMENTS:
1. spec_file — path to the specification markdown
2. output_dir — where iterations are saved
3. count — integer 1-N or "infinite"

PHASE 1: Read and deeply understand the specification.
PHASE 2: List output_dir, find highest iteration number. Start at N+1.
PHASE 3: Plan creative directions — each agent gets a DIFFERENT theme/approach.
PHASE 4: Deploy sub-agents in parallel (Task tool). Each receives:
  - Full spec text
  - Current directory snapshot
  - Their assigned iteration number
  - Their unique creative direction
PHASE 5 (infinite mode): Loop in waves of 3-5 until context is low.
```

**调用：**
```bash
/project:infinite specs/component-spec.md src/ 5
/project:infinite specs/component-spec.md src/ infinite
```

### 批处理策略

| 数量 | 策略 |
|-------|----------|
| 1-5 | 所有智能体同时运行 |
| 6-20 | 每批 5 个 |
| infinite | 每波 3-5 个，复杂程度逐步提升 |

### 关键洞察：通过分配确保唯一性

不要依赖智能体自行实现差异化。编排器会为每个智能体**分配**特定的创意方向和迭代编号。这可以防止并行智能体之间出现重复概念。

---

## 4. 持续 Claude PR 循环

**一个生产级 shell 脚本**，它会让 Claude Code 持续循环运行，创建 PR、等待 CI，并自动合并。由 AnandChowdhary 创建（致谢：@AnandChowdhary）。

### 核心循环

```
┌─────────────────────────────────────────────────────┐
│  CONTINUOUS CLAUDE ITERATION                        │
│                                                     │
│  1. Create branch (continuous-claude/iteration-N)   │
│  2. Run claude -p with enhanced prompt              │
│  3. (Optional) Reviewer pass — separate claude -p   │
│  4. Commit changes (claude generates message)       │
│  5. Push + create PR (gh pr create)                 │
│  6. Wait for CI checks (poll gh pr checks)          │
│  7. CI failure? → Auto-fix pass (claude -p)         │
│  8. Merge PR (squash/merge/rebase)                  │
│  9. Return to main → repeat                         │
│                                                     │
│  Limit by: --max-runs N | --max-cost $X             │
│            --max-duration 2h | completion signal     │
└─────────────────────────────────────────────────────┘
```

### 安装

> **警告：** 请在审查代码后，从其代码仓库安装 continuous-claude。不要将外部脚本直接通过管道传给 bash。

### 用法

```bash
# Basic: 10 iterations
continuous-claude --prompt "Add unit tests for all untested functions" --max-runs 10

# Cost-limited
continuous-claude --prompt "Fix all linter errors" --max-cost 5.00

# Time-boxed
continuous-claude --prompt "Improve test coverage" --max-duration 8h

# With code review pass
continuous-claude \
  --prompt "Add authentication feature" \
  --max-runs 10 \
  --review-prompt "Run npm test && npm run lint, fix any failures"

# Parallel via worktrees
continuous-claude --prompt "Add tests" --max-runs 5 --worktree tests-worker &
continuous-claude --prompt "Refactor code" --max-runs 5 --worktree refactor-worker &
wait
```

### 跨迭代上下文：SHARED_TASK_NOTES.md

关键创新：使用一个可跨迭代持久保存的 `SHARED_TASK_NOTES.md` 文件：

```markdown
## Progress
- [x] Added tests for auth module (iteration 1)
- [x] Fixed edge case in token refresh (iteration 2)
- [ ] Still need: rate limiting tests, error boundary tests

## Next Steps
- Focus on rate limiting module next
- The mock setup in tests/helpers.ts can be reused
```

Claude 会在迭代开始时读取此文件，并在迭代结束时更新它。这弥合了各次独立 `claude -p` 调用之间的上下文缺口。

### CI 失败恢复

当 PR 检查失败时，Continuous Claude 会自动：
1. 通过 `gh run list` 获取失败的运行 ID
2. 使用 CI 修复上下文启动新的 `claude -p`
3. Claude 通过 `gh run view` 检查日志、修复代码、提交并推送
4. 再次等待检查完成（最多尝试 `--ci-retry-max` 次）

### 完成信号

Claude 可以通过输出一个魔法短语来表示“我已完成”：

```bash
continuous-claude \
  --prompt "Fix all bugs in the issue tracker" \
  --completion-signal "CONTINUOUS_CLAUDE_PROJECT_COMPLETE" \
  --completion-threshold 3  # Stops after 3 consecutive signals
```

连续三次迭代发出完成信号后，循环将停止，从而避免在已经完成的工作上浪费运行次数。

### 关键配置

| 标志 | 用途 |
|------|---------|
| `--max-runs N` | 在 N 次成功迭代后停止 |
| `--max-cost $X` | 在花费达到 $X 后停止 |
| `--max-duration 2h` | 在指定时间过去后停止 |
| `--merge-strategy squash` | squash、merge 或 rebase |
| `--worktree <name>` | 通过 git worktrees 并行执行 |
| `--disable-commits` | 试运行模式（不执行 git 操作） |
| `--review-prompt "..."` | 为每次迭代添加审查步骤 |
| `--ci-retry-max N` | 自动修复 CI 失败（默认值：1） |

---

## 5. 去草率化模式

**适用于任何循环的附加模式。** 在每个实施者步骤之后添加一个专门的清理/重构步骤。

### 问题

当你要求 LLM 使用 TDD 进行实现时，它会过于字面化地理解“编写测试”：
- 验证 TypeScript 类型系统是否正常工作的测试（测试 `typeof x === 'string'`）
- 对类型系统已经保证的内容进行过度防御性的运行时检查
- 测试框架行为而不是业务逻辑
- 过多的错误处理，掩盖了实际代码

### 为什么不使用否定式指令？

在“实现者”提示词中加入“不要测试类型系统”或“不要添加不必要的检查”，会产生下游影响：
- 模型会对所有测试都变得犹豫
- 它会跳过合理的边界情况测试
- 质量会以不可预测的方式下降

### 解决方案：独立处理阶段

与其限制实现者，不如让它进行全面处理。然后再添加一个专注于清理的智能体：

```bash
# Step 1: Implement (let it be thorough)
claude -p "Implement the feature with full TDD. Be thorough with tests."

# Step 2: De-sloppify (separate context, focused cleanup)
claude -p "Review all changes in the working tree. Remove:
- Tests that verify language/framework behavior rather than business logic
- Redundant type checks that the type system already enforces
- Over-defensive error handling for impossible states
- Console.log statements
- Commented-out code

Keep all business logic tests. Run the test suite after cleanup to ensure nothing breaks."
```

### 在循环中的应用

```bash
for feature in "${features[@]}"; do
  # Implement
  claude -p "Implement $feature with TDD."

  # De-sloppify
  claude -p "Cleanup pass: review changes, remove test/code slop, run tests."

  # Verify
  claude -p "Run build + lint + tests. Fix any failures."

  # Commit
  claude -p "Commit with message: feat: add $feature"
done
```

### 核心洞见

> 与其添加会对下游质量产生影响的否定性指令，不如增加一个独立的去冗余处理阶段。两个各有侧重的智能体胜过一个受到约束的智能体。

---

## 6. Ralphinho / RFC 驱动的 DAG 编排

**最复杂精密的模式。** 这是一套由 RFC 驱动的多智能体流水线，它将规范拆分为依赖关系 DAG，让每个单元通过分层质量流水线，并通过智能体驱动的合并队列完成落地。由 enitrat 创建（致谢：@enitrat）。

### 架构概览

```
RFC/PRD Document
       │
       ▼
  DECOMPOSITION (AI)
  Break RFC into work units with dependency DAG
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  RALPH LOOP (up to 3 passes)                         │
│                                                      │
│  For each DAG layer (sequential, by dependency):     │
│                                                      │
│  ┌── Quality Pipelines (parallel per unit) ───────┐  │
│  │  Each unit in its own worktree:                │  │
│  │  Research → Plan → Implement → Test → Review   │  │
│  │  (depth varies by complexity tier)             │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌── Merge Queue ─────────────────────────────────┐  │
│  │  Rebase onto main → Run tests → Land or evict │  │
│  │  Evicted units re-enter with conflict context  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### RFC 拆分

AI 读取 RFC 并生成工作单元：

```typescript
interface WorkUnit {
  id: string;              // kebab-case identifier
  name: string;            // Human-readable name
  rfcSections: string[];   // Which RFC sections this addresses
  description: string;     // Detailed description
  deps: string[];          // Dependencies (other unit IDs)
  acceptance: string[];    // Concrete acceptance criteria
  tier: "trivial" | "small" | "medium" | "large";
}
```

**拆分规则：**
- 优先采用数量更少、内聚性更强的单元（最大限度降低合并风险）
- 尽量减少单元之间的文件重叠（避免冲突）
- 测试必须与实现放在同一个单元中（绝不要拆分为“实现 X”与“测试 X”）
- 仅在存在真实代码依赖时设置依赖关系

依赖关系 DAG 决定执行顺序：
```
Layer 0: [unit-a, unit-b]     ← no deps, run in parallel
Layer 1: [unit-c]             ← depends on unit-a
Layer 2: [unit-d, unit-e]     ← depend on unit-c
```

### 复杂度层级

不同层级采用不同深度的流水线：

| 层级 | 流水线阶段 |
|------|----------------|
| **简单琐碎** | 实现 → 测试 |
| **小型** | 实现 → 测试 → 代码审查 |
| **中型** | 研究 → 规划 → 实现 → 测试 → PRD 审查 + 代码审查 → 审查修复 |
| **大型** | 研究 → 规划 → 实现 → 测试 → PRD 审查 + 代码审查 → 审查修复 → 最终审查 |

这样既能避免在简单变更上执行成本高昂的操作，也能确保架构变更得到全面审查。

### 独立的上下文窗口（消除作者偏见）

每个阶段都在独立的智能体进程中运行，并拥有自己的上下文窗口：

| 阶段 | 模型 | 目的 |
|-------|-------|---------|
| 研究 | Sonnet | 阅读代码库和 RFC，生成上下文文档 |
| 规划 | Opus | 设计实现步骤 |
| 实现 | Codex | 按照计划编写代码 |
| 测试 | Sonnet | 运行构建和测试套件 |
| PRD 审查 | Sonnet | 检查是否符合规范 |
| 代码审查 | Opus | 检查质量和安全性 |
| 审查修复 | Codex | 处理审查发现的问题 |
| 最终审查 | Opus | 质量关卡（仅限大型层级） |

**关键设计：**审查者从未编写过其所审查的代码。这消除了作者偏见——它是自我审查中遗漏问题最常见的原因。

### 带驱逐机制的合并队列

质量流水线完成后，各单元进入合并队列：

```
Unit branch
    │
    ├─ Rebase onto main
    │   └─ Conflict? → EVICT (capture conflict context)
    │
    ├─ Run build + tests
    │   └─ Fail? → EVICT (capture test output)
    │
    └─ Pass → Fast-forward main, push, delete branch
```

**文件重叠智能处理：**
- 不重叠的单元以推测方式并行落地
- 重叠的单元逐个落地，每次都进行变基

**驱逐恢复：**
被驱逐时，系统会捕获完整上下文（冲突文件、差异、测试输出），并在下一次 Ralph 迭代时将其反馈给实现者：

```markdown
## MERGE CONFLICT — RESOLVE BEFORE NEXT LANDING

Your previous implementation conflicted with another unit that landed first.
Restructure your changes to avoid the conflicting files/lines below.

{full eviction context with diffs}
```

### 阶段之间的数据流

```
research.contextFilePath ──────────────────→ plan
plan.implementationSteps ──────────────────→ implement
implement.{filesCreated, whatWasDone} ─────→ test, reviews
test.failingSummary ───────────────────────→ reviews, implement (next pass)
reviews.{feedback, issues} ────────────────→ review-fix → implement (next pass)
final-review.reasoning ────────────────────→ implement (next pass)
evictionContext ───────────────────────────→ implement (after merge conflict)
```

### 工作树隔离

每个单元都在隔离的工作树中运行（使用 jj/Jujutsu，而不是 git）：
```
/tmp/workflow-wt-{unit-id}/
```

同一单元的各个流水线阶段**共享**一个工作树，从而在研究 → 规划 → 实现 → 测试 → 审查的整个过程中保留状态（上下文文件、计划文件、代码变更）。

### 关键设计原则

1. **确定性执行** — 预先分解可锁定并行关系和执行顺序
2. **在高杠杆节点进行人工审查** — 工作计划是唯一杠杆效应最高的干预点
3. **关注点分离** — 每个阶段使用独立的上下文窗口和独立的智能体
4. **带上下文的冲突恢复** — 完整的逐出上下文支持智能地重新运行，而不是盲目重试
5. **由层级驱动的深度** — 琐碎变更跳过研究/审查；大型变更接受最大程度的审视
6. **可恢复的工作流** — 完整状态持久化到 SQLite；可从任意位置恢复

### 何时使用 Ralphinho，何时使用更简单的模式

| 信号 | 使用 Ralphinho | 使用更简单的模式 |
|--------|--------------|-------------------|
| 多个相互依赖的工作单元 | 是 | 否 |
| 需要并行实现 | 是 | 否 |
| 很可能出现合并冲突 | 是 | 否（顺序执行即可） |
| 单文件变更 | 否 | 是（顺序流水线） |
| 多日项目 | 是 | 可能（continuous-claude） |
| 已经编写了规范/RFC | 是 | 可能 |
| 针对一件事快速迭代 | 否 | 是（NanoClaw 或流水线） |

---

## 选择正确的模式

### 决策矩阵

```
任务是否是单个聚焦的变更？
├─ 是 → 顺序流水线或 NanoClaw
└─ 否 → 是否有书面规范/RFC？
         ├─ 是 → 是否需要并行实现？
         │        ├─ 是 → Ralphinho（DAG 编排）
         │        └─ 否 → Continuous Claude（迭代式 PR 循环）
         └─ 否 → 是否需要同一事物的多种变体？
                  ├─ 是 → Infinite Agentic Loop（规范驱动的生成）
                  └─ 否 → 带 de-sloppify 的顺序流水线
```

### 组合模式

这些模式可以很好地组合使用：

1. **顺序流水线 + De-Sloppify** — 最常见的组合。每个实现步骤都会进行一次清理。

2. **Continuous Claude + De-Sloppify** — 在每次迭代中添加带有 de-sloppify 指令的 `--review-prompt`。

3. **任意循环 + 验证** — 在提交前，使用 ECC 的 `/verify` 命令或 `verification-loop` 技能作为关卡。

4. **在更简单的循环中采用 Ralphinho 的分层方法** — 即使在顺序流水线中，也可以将简单任务分配给 Haiku，将复杂任务分配给 Opus：
   ```bash
   # Simple formatting fix
   claude -p --model haiku "Fix the import ordering in src/utils.ts"

   # Complex architectural change
   claude -p --model opus "Refactor the auth module to use the strategy pattern"
   ```

---

## 反模式

### 常见错误

1. **没有退出条件的无限循环** — 始终设置最大运行次数、最大成本、最长持续时间或完成信号。

2. **迭代之间没有上下文桥梁** — 每次 `claude -p` 调用都会从全新状态开始。使用 `SHARED_TASK_NOTES.md` 或文件系统状态来衔接上下文。

3. **重复尝试同一种失败方式** — 如果某次迭代失败，不要只是重试。捕获错误上下文，并将其提供给下一次尝试。

4. **使用否定指令，而不是清理轮次** — 不要说“不要做 X”。添加一个单独的轮次来移除 X。

5. **所有智能体共用一个上下文窗口** — 对于复杂工作流，应将不同关注点拆分到不同的智能体进程中。审查者绝不能同时是作者。

6. **在并行工作中忽略文件重叠** — 如果两个并行智能体可能编辑同一个文件，就需要制定合并策略（依次落地、变基或解决冲突）。

---

## 参考资料

| 项目 | 作者 | 链接 |
|---------|--------|------|
| Ralphinho | enitrat | 来源：@enitrat |
| Infinite Agentic Loop | disler | 来源：@disler |
| Continuous Claude | AnandChowdhary | 来源：@AnandChowdhary |
| NanoClaw | ECC | 此仓库中的 `/claw` 命令 |
| Verification Loop | ECC | 此仓库中的 `skills/verification-loop/` |