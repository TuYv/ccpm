---
name: moai-workflow-thinking
description: >
  Sequential Thinking MCP for structured step-by-step analysis via --deepthink flag.
  Separate from UltraThink which is Claude's native extended reasoning mode.
  Use for multi-step analysis or architecture decisions.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob, mcp__sequential-thinking__sequentialthinking
effort: high
user-invocable: false
metadata:
  version: "2.0.0"
  category: "workflow"
  status: "active"
  modularized: "false"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 3000

# MoAI Extension: Triggers
triggers:
  keywords: ["sequential thinking", "deepthink", "deep analysis", "complex problem", "architecture decision", "technology selection", "trade-off", "breaking change"]
  phases:
    - plan
  agents:
    - manager-strategy
    - manager-spec
---
# 顺序思考 MCP（--deepthink）

通过 `mcp__sequential-thinking__sequentialthinking` MCP 工具进行结构化的分步推理。

## 关键：三种不同的推理模式

MoAI 有三种相互独立的深度分析模式。它们并不是同一回事：

| 模式 | 触发方式 | 机制 | 是否使用 MCP 工具？ | 是否兼容 GLM？ | 模型 |
|------|---------|-----------|-----------|-----------------|-------|
| `--deepthink` | 显式使用 `--deepthink` 标志 | 顺序思考 MCP 工具 | 是 — `mcp__sequential-thinking__sequentialthinking` | 否 — 会生成 server_tool_use 内容类型 | 任意 |
| `ultrathink` | 关键字或自动检测 | Claude 原生扩展推理（高强度） | 否 — Claude 原生功能 | 是 — 无特殊内容类型 | 任意 |
| 自适应思考 | 在 Opus 4.7 上自动启用 | Opus 4.7 唯一支持的思考模式 | 否 — 内置功能 | 是 | 仅限 Opus 4.7 |

**规则：**
- `--deepthink` → 始终调用顺序思考 MCP。绝不能用于原生推理。
- `ultrathink` → 始终使用 Claude 的原生扩展推理。绝不能调用顺序思考 MCP。
- 两者可以共存：`ultrathink --deepthink` 会分别激活这两种模式。
- 自适应思考 → Opus 4.7 的内置推理。让模型根据任务复杂度自动调整思考深度。
- 在 Opus 4.7 上：不要硬编码固定的推理预算。自适应思考会覆盖固定预算指令。

## 激活触发条件（仅限 --deepthink）

当且仅当显式提供 `--deepthink` 标志时，使用顺序思考 MCP：

- 将复杂问题拆解为多个步骤
- 进行允许修订的规划和设计
- 架构决策会影响 3 个或更多文件
- 在多个选项之间进行技术选型
- 权衡性能与可维护性
- 正在考虑破坏性变更
- 存在多种解决同一问题的方法
- 重复出现错误

## 工具参数

**必需参数：**
- `thought`（字符串）：当前思考步骤的内容
- `nextThoughtNeeded`（布尔值）：是否需要继续下一步思考
- `thoughtNumber`（整数）：当前思考步骤编号（从 1 开始）
- `totalThoughts`（整数）：预计所需的思考步骤总数

**可选参数：**
- `isRevision`（布尔值）：是否对之前的思考进行修订
- `revisesThought`（整数）：正在重新审视的思考步骤
- `branchFromThought`（整数）：替代方案的分支起点
- `branchId`（字符串）：分支标识符
- `needsMoreThoughts`（布尔值）：是否需要超出预计数量的更多思考步骤

## 使用模式

**步骤 1 - 初始分析：**
```
thought: "Analyzing the problem: [describe problem]"
nextThoughtNeeded: true
thoughtNumber: 1
totalThoughts: 5
```

**步骤 2 - 分解：**
```
thought: "Breaking down: [sub-problems]"
nextThoughtNeeded: true
thoughtNumber: 2
totalThoughts: 5
```

**步骤 3 - 修订（如有需要）：**
```
thought: "Revising thought 2: [correction]"
isRevision: true
revisesThought: 2
thoughtNumber: 3
totalThoughts: 5
nextThoughtNeeded: true
```

**最终步骤 - 结论：**
```
thought: "Conclusion: [final answer]"
thoughtNumber: 5
totalThoughts: 5
nextThoughtNeeded: false
```

## 指南

1. 首先给出合理的 totalThoughts 估算值
2. 修正之前的思考时使用 isRevision
3. 保持 thoughtNumber 的顺序
4. 仅在完成时将 nextThoughtNeeded 设置为 false
5. 使用分支来探索替代方案

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化借口

| 合理化借口 | 事实 |
|---|---|
| “这个问题很简单，我不需要进行顺序思考也能想清楚” | 简单的问题往往隐藏着二阶效应。结构化思考会迫使你逐一列举这些影响。 |
| “思考步骤只是内部过程，我不需要记录它们” | 未记录的推理无法接受审查。思维链是结论的依据。 |
| “我已经知道答案了，思考框架只是额外负担” | 确认偏误会让人忽略反证。该框架会迫使你考虑替代方案。 |
| “为这个决策创建分支未免小题大做” | 当决策存在多个可行路径时，即使只是简短比较，也能从明确的分支对比中受益。 |
| “我会改用 UltraThink，反正它们是同一回事” | UltraThink 是原生的扩展推理。Sequential Thinking 是基于 MCP 的结构化分析。它们服务于不同目的，并具有不同的 API 兼容性。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 在没有记录推理链的情况下做出架构决策
- 顺序思考会话结束时，nextThoughtNeeded 仍为 true
- 尽管遇到了矛盾，思维链中却没有修正步骤
- 识别出两个或更多可行的替代方案时，没有使用分支
- 将 --deepthink 标志与 UltraThink 混淆（使用了错误的工具）

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 思维链具有明确的 totalThoughts 估算值，且该估算已达成或经过修订
- [ ] 最后一个思考步骤将 nextThoughtNeeded 设置为 false，并给出结论
- [ ] 如果遇到矛盾，至少存在一个修正步骤
- [ ] 识别出多个替代方案时使用了分支（显示分支 ID）
- [ ] 结论引用具体的思考编号作为支持依据

<!-- moai:evolvable-end -->