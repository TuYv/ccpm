---
name: "agenthub"
description: "Multi-agent collaboration plugin that spawns N parallel subagents competing on the same task via git worktree isolation. Agents work independently, results are evaluated by metric or LLM judge, and the best branch is merged. Use when: user wants multiple approaches tried in parallel — code optimization, content variation, research exploration, or any task that benefits from parallel competition. Requires: a git repo."
license: MIT
metadata:
  version: 2.1.2
  author: Alireza Rezvani
  category: engineering
  updated: 2026-03-17
---
# AgentHub — 多智能体协作

生成 N 个并行 AI 智能体，让它们针对同一任务展开竞争。每个智能体都在隔离的 git worktree 中工作。协调器评估结果并合并胜出者。

## 斜杠命令

| Command | Description |
|---------|-------------|
| `/hub:hub-init` | 创建新的协作会话 — 任务、智能体数量、评估标准 |
| `/hub:spawn` | 在隔离的 worktree 中启动 N 个并行子智能体 |
| `/hub:hub-status` | 显示 DAG 状态、智能体进度、分支状态 |
| `/hub:eval` | 按指标或 LLM 评审对智能体结果进行排名 |
| `/hub:merge` | 合并胜出分支，归档失败分支 |
| `/hub:board` | 读取/写入智能体消息板 |
| `/hub:run` | 一次性执行完整生命周期：初始化 → 基线 → 启动 → 评估 → 合并 |

## 智能体模板

使用 `--template` 启动时，智能体会遵循预定义的迭代模式：

| Template | Pattern | Use Case |
|----------|---------|----------|
| `optimizer` | 编辑 → 评估 → 保留/丢弃 → 重复 10 次 | 性能、延迟、大小 |
| `refactorer` | 重构 → 测试 → 迭代直至通过 | 代码质量、技术债务 |
| `test-writer` | 编写测试 → 测量覆盖率 → 重复 | 测试覆盖率缺口 |
| `bug-fixer` | 复现 → 诊断 → 修复 → 验证 | Bug 修复方案 |

模板定义于 `references/agent-templates.md`。

## 此技能的激活时机

触发短语：
- "try multiple approaches"
- "have agents compete"
- "parallel optimization"
- "spawn N agents"
- "compare different solutions"
- "fan-out" 或 "tournament"
- "generate content variations"
- "compare different drafts"
- "A/B test copy"
- "explore multiple strategies"

## 协调器协议

主 Claude Code 会话是协调器。它遵循以下生命周期：

```
INIT → DISPATCH → MONITOR → EVALUATE → MERGE
```

### 1. 初始化

运行 `/hub:hub-init` 创建会话。这会生成：
- `.agenthub/sessions/{session-id}/config.yaml` — 任务配置
- `.agenthub/sessions/{session-id}/state.json` — 状态机
- `.agenthub/board/` — 消息板频道

### 2. 分发

运行 `/hub:spawn` 启动智能体。对于每个智能体 1..N：
- 将任务分配发布到 `.agenthub/board/dispatch/`
- 通过 Agent 工具并使用 `isolation: "worktree"` 启动
- 在单条消息中启动所有智能体（并行）

### 3. 监控

运行 `/hub:hub-status` 检查进度：
- `dag_analyzer.py --status --session {id}` 显示分支状态
- 消息板的 `progress/` 频道包含智能体更新

### 4. 评估

运行 `/hub:eval` 对结果进行排名：
- **Metric mode**：在每个 worktree 中运行评估命令，解析数值结果
- **Judge mode**：读取差异内容，由协调器按质量排名
- **Hybrid**：先使用指标评估，对于平局再使用 LLM 评审

### 5. 合并

运行 `/hub:merge` 完成最终处理：
- 使用 `git merge --no-ff` 将胜出者合并到基础分支
- 为失败者添加标签：`git tag hub/archive/{session}/agent-{i}`
- 清理 worktree
- 将合并摘要发布到消息板

## 智能体协议

每个子智能体都会收到以下格式的提示：

```
你是 hub 会话 {session-id} 中的 agent-{i}。
你的任务：{task description}

说明：
1. 阅读位于 .agenthub/board/dispatch/{seq}-agent-{i}.md 的任务分配
2. 在你的 worktree 中工作 — 修改内容、运行测试、反复迭代
3. 使用描述性消息提交所有修改
4. 将结果摘要写入 .agenthub/board/results/agent-{i}-result.md
5. 完成后退出
```

Agents **看不到**彼此的工作。他们**不会**互相通信。他们只会向协调器读取的看板写入内容。

## DAG 模型

### 分支命名

```
hub/{session-id}/agent-{N}/attempt-{M}
```

- Session ID：基于时间戳（`YYYYMMDD-HHMMSS`）
- Agent N：顺序编号（1 到 agent-count）
- Attempt M：重试时递增（通常为 1）

### 前沿检测

前沿 = 没有子分支的分支顶端。等同于 AgentHub 的“leaves”查询。

```bash
python scripts/dag_analyzer.py --frontier --session {id}
```

### 不可变性

DAG 仅允许追加：
- 永远不要对 agent 分支执行 rebase 或 force-push
- 永远不要删除提交（归档后只能删除分支引用）
- 每种方案都通过 git 标签予以保留

## 消息看板

位置：`.agenthub/board/`

### 频道

| 频道 | 写入者 | 读取者 | 用途 |
|---------|--------|--------|---------|
| `dispatch/` | 协调器 | Agents | 任务分配 |
| `progress/` | Agents | 协调器 | 状态更新 |
| `results/` | Agents + 协调器 | 所有人 | 最终结果 + 合并摘要 |

### 发布格式

```markdown
---
author: agent-1
timestamp: 2026-03-17T14:30:22Z
channel: results
parent: null
---

## Result Summary

- **Approach**: Replaced O(n²) sort with hash map
- **Files changed**: 3
- **Metric**: 142ms (baseline: 180ms, delta: -38ms)
- **Confidence**: High — all tests pass
```

### 看板规则

- 仅允许追加：永远不要编辑或删除帖子
- 文件名必须唯一：`{seq:03d}-{author}-{timestamp}.md`
- 所有帖子都必须包含 YAML frontmatter

## 评估模式

### 基于指标

适用于：基准测试、测试通过率、文件大小、响应时间。

```bash
python scripts/result_ranker.py --session {id} \
  --eval-cmd "pytest bench.py --json" \
  --metric p50_ms --direction lower
```

ranker 会在每个 agent 的工作树目录中运行评估命令，并从 stdout 中解析指标。

### LLM 评审

适用于：代码质量、可读性、架构决策。

协调器读取每个 agent 的差异（`git diff base...agent-branch`），并按照以下标准排名：
1. 正确性（是否解决了任务？）
2. 简洁性（改动行数更少者优先）
3. 质量（执行过程清晰、结构良好）

### 混合模式

先运行指标评估。如果排名靠前的 agents 之间差距在 10% 以内，则使用 LLM 评审来打破平局。

## 会话生命周期

```
init → running → evaluating → merged
                            → archived (if no winner)
```

状态转换由 `session_manager.py` 管理：

| 起始状态 | 目标状态 | 触发条件 |
|------|----|---------|
| `init` | `running` | `/hub:spawn` 完成 |
| `running` | `evaluating` | 所有 agents 返回 |
| `evaluating` | `merged` | `/hub:merge` 完成 |
| `evaluating` | `archived` | 没有胜出者 / 全部失败 |

## 主动触发条件

协调器应在出现以下情况时采取行动：

| 信号 | 操作 |
|--------|--------|
| 所有 agents 均崩溃 | 发布失败摘要，建议使用不同约束条件重试 |
| 没有比基线更好的结果 | 归档会话，建议采用不同方案 |
| 检测到孤立工作树 | 运行 `session_manager.py --cleanup {id}` |
| 会话卡在 `running` 状态 | 检查看板中的进度，考虑超时 |

## 安装

```bash
# Copy to your Claude Code skills directory
cp -r engineering/agenthub ~/.claude/skills/agenthub

# Or install via ClawHub
clawhub install agenthub
```

## 脚本

| 脚本 | 用途 |
|--------|---------|
| `hub_init.py` | 初始化 `.agenthub/` 结构和会话 |
| `dag_analyzer.py` | 前沿检测、DAG 图和分支状态 |
| `board_manager.py` | 消息板 CRUD（频道、帖子、线程） |
| `result_ranker.py` | 按指标或差异质量对代理进行排名 |
| `session_manager.py` | 会话状态机和清理 |

## 相关技能

- **autoresearch-agent** — 单代理优化循环（当你希望 N 个代理相互竞争时，使用 AgentHub）
- **self-improving-agent** — 自我修改代理（当你希望进行外部竞争时，使用 AgentHub）
- **git-worktree-manager** — Git worktree 工具（AgentHub 在内部使用 worktree）