---
name: mnemos
description: Task-scoped memory lifecycle — typed MnemoGraph prevents lossy context compaction by treating facts/decisions/code-refs/handoffs as distinct node types with per-type eviction policies
when-to-use: "When you need durable working memory across compactions — checkpoint decisions, preserve task handoffs, or audit what was remembered"
user-invocable: false
effort: high
---
# Mnemos — 任务范围内的记忆生命周期

## 功能

Mnemos 可防止有损的上下文压缩破坏你最需要的结构化知识。它将你的工作记忆视为一个**类型化图**（MnemoGraph），其中不同类型的知识具有不同的淘汰策略：

- **GoalNodes** 和 **ConstraintNodes** 永不被淘汰——它们会在所有压缩过程中保留下来
- **ResultNodes** 在被淘汰前会进行压缩（保留摘要）
- **ContextNodes** 可在其激活权重下降时被淘汰
- **CheckpointNodes** 会持久化到磁盘，以便恢复会话

## 疲劳模型

Mnemos 监控“智能体疲劳”的 4 个维度——全部通过钩子数据被动观测，无需手动输入：

| 维度 | 权重 | 信号来源 | 衡量内容 |
|-----------|--------|--------------|-----------------|
| Token 利用率 | 0.40 | Statusline JSON | 上下文窗口的占用程度 |
| 范围分散度 | 0.25 | PreToolUse 文件路径 | 智能体在多少个目录之间来回切换 |
| 重读比率 | 0.20 | PreToolUse Read 调用 | 智能体重复读取已读文件的频率（上下文丢失） |
| 错误密度 | 0.15 | PostToolUse 结果 | 工具调用失败所占的比例（智能体陷入困境） |

疲劳状态及对应操作：

| 状态 | 分数 | 操作 |
|-------|-------|--------|
| FLOW | 0.0–0.4 | 正常运行 |
| COMPRESS | 0.4–0.6 | 运行微整合（压缩 3 个 ResultNodes，淘汰 1 个冷 ContextNode） |
| PRE-SLEEP | 0.6–0.75 | 写入检查点，运行整合 |
| REM | 0.75–0.9 | 写入紧急检查点，考虑收尾 |
| EMERGENCY | 0.9+ | 写入检查点，立即移交 |

## 使用方法

### 自动模式（由钩子处理一切）：
1. **Statusline** 在每次 API 调用时写入 `fatigue.json`
2. **PreToolUse** 钩子在每次编辑前读取疲劳度，并在达到 0.60+ 时自动创建检查点
3. **PreCompact** 钩子写入紧急检查点和压缩标记，并告知摘要器应保留哪些内容
4. **SessionStart "compact"** 在压缩后立即触发，重新注入完整检查点（主要恢复方式）
5. **SessionStart "startup|resume"** 在新会话或恢复的会话中加载最近的检查点
6. **PreToolUse fallback**（无 matcher）会在 SessionStart 未触发时检测压缩标记
7. **Stop** 钩子写入最终检查点，供下一会话使用

### 压缩后恢复（三层防御）：
当 Claude Code 压缩上下文（占用率约为 83%）时，Mnemos 会使用三层防御：
- **第 1 层（PreCompact）**：为摘要器输出强制保留指令，并内联检查点内容。写入 `.mnemos/just-compacted` 标记。
- **第 2 层（SessionStart "compact"）**：**主要重新注入方式。** 当 Claude 在压缩后恢复时立即触发——先于智能体的任何操作。它会消费该标记，并将完整检查点注入新的上下文。根据 RFC（唤醒状态重建），这是推荐的方法。
- **第 3 层（PreToolUse fallback）**：如果 SessionStart 未触发（旧版本、边缘情况），首次工具调用会触发 `mnemos-post-compact-inject.sh`，由其检测标记并执行注入。仅作为安全保障。

结果：压缩后，你会看到一个“压缩后上下文已恢复（CONTEXT RESTORED AFTER COMPACTION）”块，其中包含你的目标、约束、正在处理的内容和进度。从那里继续即可。

### 手动 CLI：
```bash
mnemos init                    # Initialize .mnemos/
mnemos status                  # Show node counts + fatigue
mnemos fatigue                 # Detailed fatigue breakdown
mnemos checkpoint --force      # Write checkpoint now
mnemos resume                  # Output checkpoint for context
mnemos consolidate             # Run micro-consolidation
mnemos nodes --type goal       # List active GoalNodes
mnemos add goal "Build auth"   # Add a GoalNode
mnemos bridge-icpg             # Import iCPG ReasonNodes
mnemos ingest-claude --all     # Ingest Claude Code transcripts (see below)
mnemos haze --recent 10        # Show per-session haziness scores
```

## Claude 对话记录摄取与模糊度

Mnemos 可以摄取 Claude Code 会话对话记录（位于 `~/.claude/projects/` 下的每会话 JSONL），并为每个会话的**模糊度**评分——用于衡量智能体应对任务时的困难程度。`Stop` 钩子会在会话退出时自动执行此操作；也可以手动执行。

**存储的内容：**仅包括结构化字段（角色、工具名称、文件路径、错误标志、时间戳），以及每轮对话经过**脱敏处理的 200 字符预览**。完整内容绝不会被持久化，并且机密信息（API 密钥、令牌、PEM 块、JWT、凭据）会在任何内容写入磁盘之前被脱敏。

**模糊度**是基于五个维度计算的加权分数，每个维度的取值范围均为 `[0,1]`：

| 维度 | 权重 | 衡量内容 |
|-----------|--------|------------------|
| correction_density | 0.30 | 每个符合条件的用户轮次中的用户纠正次数 |
| redo_ratio | 0.25 | 出错后被再次修改的编辑占比 |
| first_try_error_rate | 0.20 | 编辑后 3 轮内出现错误的比例 |
| orphan_tool_use_rate | 0.15 | 没有匹配结果的工具调用占比 |
| backtrack_norm | 0.10 | `git revert`/`reset --hard`/`restore` 调用 |

综合分数映射到以下等级：`clear` < 0.25 ≤ `cloudy` < 0.50 ≤ `hazy` < 0.75 ≤ `lost`。

```bash
mnemos ingest-claude --all              # ingest every transcript + score
mnemos ingest-claude --session <id>     # one session by id
mnemos ingest-claude --transcript <f>   # a specific JSONL file
mnemos haze --recent 10                 # table of recent sessions
mnemos haze --session <id>              # per-dimension breakdown
```

摄取是幂等的（通过 `last_line_offset` 恢复）。可以在每个项目中使用 `touch .mnemos/claude-log.disabled` **选择退出**。

## 智能体指令

处理任务时：

1. 在开始时**创建 GoalNode**：`mnemos add goal "what you're trying to achieve" --task-id session-1`
2. 为不变量**添加 ConstraintNodes**：`mnemos add constraint "API backward compatibility" --scope src/api/`
3. 在执行长时间操作前**检查疲劳度**：`mnemos fatigue`
4. 在子目标边界处**创建检查点**：`mnemos checkpoint`
5. **恢复会话时**：SessionStart 钩子会自动加载你的检查点

## iCPG 集成

Mnemos 与 iCPG（意图增强型代码属性图）集成：
- `mnemos bridge-icpg` 将活跃的 ReasonNode 导入为 GoalNode
- 后置条件/不变量将成为 ConstraintNode
- 检查点包含 iCPG 状态（活跃意图、未解决的漂移）

## 存储

所有内容均位于 `.mnemos/` 中（已被 git 忽略）：
- `mnemo.db` — SQLite MnemoGraph
- `fatigue.json` — 实时 token 指标（状态栏会在每次 API 调用时更新）
- `signals.jsonl` — 行为信号日志（由 PreToolUse + PostToolUse 钩子追加）
- `checkpoint-latest.json` — 最新的检查点
- `checkpoints/` — 已归档的检查点