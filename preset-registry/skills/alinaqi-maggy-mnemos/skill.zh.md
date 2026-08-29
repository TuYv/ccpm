---
name: mnemos
description: Task-scoped memory lifecycle — typed MnemoGraph prevents lossy context compaction by treating facts/decisions/code-refs/handoffs as distinct node types with per-type eviction policies
when-to-use: "When you need durable working memory across compactions — checkpoint decisions, preserve task handoffs, or audit what was remembered"
user-invocable: false
effort: high
---
# Mnemos — 任务范围内的记忆生命周期

## 功能

Mnemos 可防止有损的上下文压缩破坏你最需要的结构化知识。它将工作记忆视为一个**类型化图**（MnemoGraph），其中不同类型的知识具有不同的驱逐策略：

- **GoalNodes** 和 **ConstraintNodes** 永远不会被驱逐——它们会在所有压缩过程中保留
- **ResultNodes** 会在被驱逐前进行压缩（保留摘要）
- **ContextNodes** 会在其激活权重降低时被驱逐
- **CheckpointNodes** 会持久化到磁盘，以便恢复会话

## 疲劳模型

Mnemos 监控“代理疲劳”的 4 个维度——所有数据都从 hook 数据中被动观测，无需手动输入：

| 维度 | 权重 | 信号来源 | 衡量内容 |
|-----------|--------|--------------|-----------------|
| Token 利用率 | 0.40 | Statusline JSON | 上下文窗口的占用程度 |
| 范围分散度 | 0.25 | PreToolUse 文件路径 | 代理在多少个目录之间来回切换 |
| 重读比率 | 0.20 | PreToolUse Read 调用 | 代理重新读取已读文件的频率（上下文丢失） |
| 错误密度 | 0.15 | PostToolUse 结果 | 工具调用失败的比例（代理遇到困难） |

疲劳状态及操作：

| 状态 | 分数 | 操作 |
|-------|-------|--------|
| FLOW | 0.0–0.4 | 正常运行 |
| COMPRESS | 0.4–0.6 | 执行微整合（压缩 3 个 ResultNodes，驱逐 1 个冷 ContextNode） |
| PRE-SLEEP | 0.6–0.75 | 写入检查点，执行整合 |
| REM | 0.75–0.9 | 执行紧急检查点，考虑收尾 |
| EMERGENCY | 0.9+ | 写入检查点，立即交接 |

## 使用方法

### 自动方式（hooks 处理一切）：
1. **Statusline** 在每次 API 调用时写入 `fatigue.json`
2. **PreToolUse** hook 在每次编辑前读取疲劳状态，并在达到 0.60+ 时自动创建检查点
3. **PreCompact** hook 写入紧急检查点和压缩标记，并告知摘要器需要保留的内容
4. **SessionStart "compact"** 在压缩后立即触发，重新注入完整检查点（主要恢复机制）
5. **SessionStart "startup|resume"** 在新会话或恢复的会话中加载上一个检查点
6. **PreToolUse fallback**（无 matcher）会在 SessionStart 未触发时检测压缩标记
7. **Stop** hook 为下一次会话写入最终检查点

### 压缩后恢复（三层防御）：
当 Claude Code 压缩上下文（约达到 83% 的占用率）时，Mnemos 使用三层机制：
- **第 1 层（PreCompact）**：向摘要器输出明确的保留指令，并附带内联检查点内容。写入 `.mnemos/just-compacted` 标记。
- **第 2 层（SessionStart "compact"）**：**主要的重新注入机制。** 在 Claude 压缩后恢复时立即触发——早于任何代理操作。它会使用该标记，并将完整检查点注入到全新的上下文中。这是 RFC（唤醒状态重建）所推荐的方法。
- **第 3 层（PreToolUse fallback）**：如果 SessionStart 未触发（旧版本、边缘情况），第一次工具调用会触发 `mnemos-post-compact-inject.sh`，由它检测标记并执行注入。仅作为安全网。

结果：压缩后，你将看到一个“CONTEXT RESTORED AFTER COMPACTION”块，其中包含你的目标、约束条件、正在处理的内容以及进展。请从那里继续。

### 手动 CLI：
```bash
mnemos init                    # 初始化 .mnemos/
mnemos status                  # 显示节点数量 + 疲劳度
mnemos fatigue                 # 详细的疲劳度分解
mnemos checkpoint --force      # 立即写入检查点
mnemos resume                  # 输出用于恢复上下文的检查点
mnemos consolidate             # 运行微型整合
mnemos nodes --type goal       # 列出活动的 GoalNodes
mnemos add goal "Build auth"   # 添加一个 GoalNode
mnemos bridge-icpg             # 导入 iCPG ReasonNodes
mnemos ingest-claude --all     # 导入 Claude Code 转录（见下文）
mnemos haze --recent 10        # 显示每个会话的模糊度分数
```

## Claude 转录导入与模糊度

Mnemos 可以导入 Claude Code 会话转录（`~/.claude/projects/` 下每个会话对应的 JSONL），并为每个会话评估**模糊度**——用于衡量代理在多大程度上遇到了困难。`Stop` hook 会在会话退出时自动执行此操作；也可以手动执行。

**存储内容：**仅存储结构化字段（角色、工具名称、文件路径、错误标志、时间戳），以及每轮对话经过**脱敏处理的 200 字符预览**。不会持久化完整内容，并且 API 密钥、令牌、PEM 块、JWT、凭据等机密信息会在写入磁盘前进行脱敏。

**模糊度**是对五个维度加权后的分数，每个维度的取值范围均为 `[0,1]`：

| 维度 | 权重 | 衡量内容 |
|-----------|--------|------------------|
| correction_density | 0.30 | 每个符合条件的用户回合中的用户纠正次数 |
| redo_ratio | 0.25 | 发生错误后被重新修改的编辑所占比例 |
| first_try_error_rate | 0.20 | 编辑后 3 个回合内出现错误的比例 |
| orphan_tool_use_rate | 0.15 | 没有匹配结果的工具调用所占比例 |
| backtrack_norm | 0.10 | `git revert`/`reset --hard`/`restore` 调用 |

综合分数对应以下等级：`clear` < 0.25 ≤ `cloudy` < 0.50 ≤ `hazy` < 0.75 ≤ `lost`。

```bash
mnemos ingest-claude --all              # 导入所有转录 + 评分
mnemos ingest-claude --session <id>     # 按 id 导入单个会话
mnemos ingest-claude --transcript <f>   # 导入指定的 JSONL 文件
mnemos haze --recent 10                 # 显示最近会话的表格
mnemos haze --session <id>              # 按维度显示详细分解
```

导入操作具有幂等性（通过 `last_line_offset` 恢复）。**可按项目选择退出**，方法是执行 `touch .mnemos/claude-log.disabled`。

## 代理指令

处理任务时：

1. **开始时创建一个 GoalNode**：`mnemos add goal "what you're trying to achieve" --task-id session-1`
2. **为不变量添加 ConstraintNodes**：`mnemos add constraint "API backward compatibility" --scope src/api/`
3. **执行长时间操作前检查疲劳度**：`mnemos fatigue`
4. **在子目标边界处创建检查点**：`mnemos checkpoint`
5. **恢复会话时**：SessionStart hook 会自动加载你的检查点

## iCPG 集成

Mnemos 与 iCPG（意图增强型代码属性图）衔接：
- `mnemos bridge-icpg` 将活跃的 ReasonNodes 导入为 GoalNodes
- 后置条件/不变量成为 ConstraintNodes
- 检查点包含 iCPG 状态（活跃意图、未解决的漂移）

## 存储

所有内容都存储在 `.mnemos/` 中（已加入 gitignore）：
- `mnemo.db` — SQLite MnemoGraph
- `fatigue.json` — 实时令牌指标（由 statusline 在每次 API 调用时更新）
- `signals.jsonl` — 行为信号日志（由 PreToolUse + PostToolUse hooks 追加）
- `checkpoint-latest.json` — 最近的检查点
- `checkpoints/` — 已归档的检查点