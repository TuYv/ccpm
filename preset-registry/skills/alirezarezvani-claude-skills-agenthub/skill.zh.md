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

| 命令 | 描述 |
|---------|-------------|
| `/hub:init` | 创建新的协作会话 — 任务、智能体数量、评估标准 |
| `/hub:spawn` | 在隔离的 worktree 中启动 N 个并行子智能体 |
| `/hub:status` | 显示 DAG 状态、智能体进度、分支状态 |
| `/hub:eval` | 按指标或 LLM 评审对智能体结果进行排名 |
| `/hub:merge` | 合并胜出分支，归档落选分支 |
| `/hub:board` | 读写智能体留言板 |
| `/hub:run` | 一次性完成整个生命周期：初始化 → 基线 → 生成 → 评估 → 合并 |

## 智能体模板

使用 `--template` 生成智能体时，智能体会遵循预定义的迭代模式：

| 模板 | 模式 | 使用场景 |
|----------|---------|----------|
| `optimizer` | 编辑 → 评估 → 保留/丢弃 → 重复 10 次 | 性能、延迟、大小 |
| `refactorer` | 重构 → 测试 → 迭代直至通过 | 代码质量、技术债务 |
| `test-writer` | 编写测试 → 测量覆盖率 → 重复 | 测试覆盖缺口 |
| `bug-fixer` | 复现 → 诊断 → 修复 → 验证 | Bug 修复方案 |

模板定义在 `references/agent-templates.md` 中。

## 此 Skill 何时激活

触发短语：
- “尝试多种方法”
- “让智能体相互竞争”
- “并行优化”
- “生成 N 个智能体”
- “比较不同的解决方案”
- “扇出”或“锦标赛”
- “生成内容变体”
- “比较不同的草稿”
- “对文案进行 A/B 测试”
- “探索多种策略”

## 协调器协议

主 Claude Code 会话充当协调器。它遵循以下生命周期：

```
INIT → DISPATCH → MONITOR → EVALUATE → MERGE
```

### 1. 初始化

运行 `/hub:init` 创建会话。这会生成：
- `.agenthub/sessions/{session-id}/config.yaml` — 任务配置
- `.agenthub/sessions/{session-id}/state.json` — 状态机
- `.agenthub/board/` — 留言板频道

### 2. 分派

运行 `/hub:spawn` 启动智能体。对于每个智能体 1..N：
- 将任务分派发布到 `.agenthub/board/dispatch/`
- 通过 Agent 工具并使用 `isolation: "worktree"` 生成智能体
- 在单条消息中启动所有智能体（并行）

### 3. 监控

运行 `/hub:status` 检查进度：
- `dag_analyzer.py --status --session {id}` 显示分支状态
- 留言板的 `progress/` 频道包含智能体更新

### 4. 评估

运行 `/hub:eval` 对结果进行排名：
- **指标模式**：在每个 worktree 中运行评估命令，解析数值结果
- **评审模式**：读取差异，由协调器按质量排名
- **混合模式**：先使用指标，若结果相同则由 LLM 评审

### 5. 合并

运行 `/hub:merge` 完成最终处理：
- 使用 `git merge --no-ff` 将胜出者合并到基础分支
- 为落选者添加标签：`git tag hub/archive/{session}/agent-{i}`
- 清理 worktree
- 将合并摘要发布到留言板

## 智能体协议

每个子智能体都会收到以下提示模式：

```
You are agent-{i} in hub session {session-id}.
Your task: {task description}

Instructions:
1. Read your assignment at .agenthub/board/dispatch/{seq}-agent-{i}.md
2. Work in your worktree — make changes, run tests, iterate
3. Commit all changes with descriptive messages
4. Write your result summary to .agenthub/board/results/agent-{i}-result.md
5. Exit when done
```

智能体无法看到彼此的工作。它们不会相互通信。它们只会将内容写入消息板，供协调器读取。

## DAG 模型

### 分支命名

```
hub/{session-id}/agent-{N}/attempt-{M}
```

- 会话 ID：基于时间戳（`YYYYMMDD-HHMMSS`）
- 智能体 N：按顺序编号（1 到智能体总数）
- 尝试次数 M：重试时递增（通常为 1）

### 前沿检测

前沿 = 没有子分支的分支末端。等同于 AgentHub 的“leaves”查询。

```bash
python scripts/dag_analyzer.py --frontier --session {id}
```

### 不可变性

DAG 仅允许追加：
- 切勿对智能体分支执行变基或强制推送
- 切勿删除提交（归档后仅删除分支引用）
- 通过 git 标签保留每一种方案

## 消息板

位置：`.agenthub/board/`

### 频道

| 频道 | 写入者 | 读取者 | 用途 |
|---------|--------|--------|---------|
| `dispatch/` | 协调器 | 智能体 | 任务分配 |
| `progress/` | 智能体 | 协调器 | 状态更新 |
| `results/` | 智能体 + 协调器 | 所有人 | 最终结果 + 合并摘要 |

### 帖子格式

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

### 消息板规则

- 仅允许追加：切勿编辑或删除帖子
- 唯一文件名：`{seq:03d}-{author}-{timestamp}.md`
- 所有帖子都必须包含 YAML 前置元数据

## 评估模式

### 基于指标

最适合：基准测试、测试通过率、文件大小、响应时间。

```bash
python scripts/result_ranker.py --session {id} \
  --eval-cmd "pytest bench.py --json" \
  --metric p50_ms --direction lower
```

排名器会在每个智能体的工作树目录中运行评估命令，并从标准输出中解析指标。

### LLM 评审

最适合：代码质量、可读性、架构决策。

协调器读取每个智能体的差异（`git diff base...agent-branch`），并按以下标准排名：
1. 正确性（是否解决了任务？）
2. 简洁性（优先选择改动行数较少的方案）
3. 质量（执行干净利落、结构良好）

### 混合模式

先运行指标评估。如果排名靠前的智能体之间差距在 10% 以内，则使用 LLM 评审来打破平局。

## 会话生命周期

```
init → running → evaluating → merged
                            → archived (if no winner)
```

状态转换由 `session_manager.py` 管理：

| 来源 | 目标 | 触发条件 |
|------|----|---------|
| `init` | `running` | `/hub:spawn` 完成 |
| `running` | `evaluating` | 所有智能体返回 |
| `evaluating` | `merged` | `/hub:merge` 完成 |
| `evaluating` | `archived` | 无获胜者 / 全部失败 |

## 主动触发条件

出现以下情况时，协调器应采取行动：

| 信号 | 操作 |
|--------|--------|
| 所有智能体均崩溃 | 发布失败摘要，建议使用不同约束重试 |
| 相较基线没有改进 | 归档会话，建议采用不同方案 |
| 检测到孤立工作树 | 运行 `session_manager.py --cleanup {id}` |
| 会话卡在 `running` 状态 | 检查消息板中的进度，考虑设置超时 |

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
| `dag_analyzer.py` | 前沿检测、DAG 图、分支状态 |
| `board_manager.py` | 留言板 CRUD（频道、帖子、话题串） |
| `result_ranker.py` | 按指标或差异质量对智能体进行排名 |
| `session_manager.py` | 会话状态机和清理 |

## 相关技能

- **autoresearch-agent** — 单智能体优化循环（需要 N 个智能体相互竞争时使用 AgentHub）
- **self-improving-agent** — 自修改智能体（需要外部竞争时使用 AgentHub）
- **git-worktree-manager** — Git worktree 实用工具（AgentHub 在内部使用 worktree）