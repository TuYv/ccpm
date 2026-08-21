---
name: moai-foundation-context
description: >
  Manages context window optimization, session state persistence, and
  token budget allocation for multi-agent workflows. Use for token
  budget management, context limits, or session handoff across agents.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
user-invocable: false
metadata:
  version: "3.1.0"
  category: "foundation"
  status: "active"
  updated: "2026-01-11"
  modularized: "false"
  tags: "foundation, context, session, token-optimization, state-management, multi-agent"
  aliases: "moai-foundation-context"
  replaces: "moai-core-context-budget, moai-core-session-state"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000

# MoAI Extension: Triggers
triggers:
  keywords: ["token", "context", "session", "budget", "optimization", "handoff", "state", "memory", "/clear", "context window", "token limit", "session persistence", "context management", "multi-agent"]
  agents:
    - "manager-spec"
    - "manager-ddd"
    - "manager-strategy"
    - "manager-quality"
    - "manager-docs"
    - "manager-project"
  phases:
    - "plan"
    - "run"
    - "sync"
---
## 快速参考

企业级上下文与会话管理——为 Claude Code 提供统一的上下文优化和会话状态管理，支持 200K token 预算管理、会话持久化和多智能体交接协议。

核心能力：

- 200K token 预算分配与监控
- 支持持久化的会话状态跟踪
- 上下文感知的 token 优化
- 多智能体交接协议
- 渐进式披露和内存管理
- 会话分叉以支持并行探索

适用场景：

- 会话初始化和清理
- 持续时间超过 10 分钟的长时间运行工作流
- 多智能体编排
- 上下文窗口接近限制，超过 150K token
- 在 Haiku 和 Sonnet 之间切换模型
- 工作流阶段转换

关键原则：

避免最后 20%：在上下文窗口的最后五分之一，性能会下降。

积极清理：对于 SPEC 工作流，每 1-3 条消息执行一次 /clear。

精简内存文件：每个文件保持在 500 行以内。

禁用未使用的 MCP：最大限度减少工具定义开销。

质量优于数量：10% 的相关上下文胜过 90% 的噪声。

---

## 实施指南

### 功能

- Claude Code 会话的智能上下文窗口管理
- 基于优先级缓存的渐进式文件加载
- token 预算跟踪和优化提醒
- 跨 /clear 边界选择性保留上下文
- MCP 集成上下文持久化

### 适用场景

- 管理超过 150K token 限制的大型代码库
- 优化长时间运行的开发会话中的 token 使用
- 跨会话重置保留关键上下文
- 协调共享上下文的多智能体工作流
- 调试 Claude Code 中与上下文相关的问题

### 核心模式

模式 1——渐进式文件加载：

按优先级层级加载文件。第 1 层包括始终加载的 CLAUDE.md 和 config.json。第 2 层包括当前 SPEC 和实现文件。第 3 层包括相关模块和依赖项。第 4 层包括按需加载的参考文档。

模式 2——上下文检查点：

监控 token 使用情况，在达到 150K 时发出警告，在达到 180K 时发出严重警告。识别需要保留的必要上下文。执行 /clear 以重置会话。自动重新加载第 1 层和第 2 层文件。使用保留的上下文继续工作。

模式 3——MCP 上下文连续性：

通过存储 agent_id，跨 /clear 保留 MCP 智能体上下文。执行 /clear 后，通过重新初始化 MCP 智能体恢复上下文。

## 核心模式详解

### 模式 1：Token 预算管理

概念：对 200K token 上下文窗口进行战略性分配和监控。

预算明细：系统提示词和指令约占 15K token，即 7.5%，其中包括占 8K 的 CLAUDE.md、占 4K 的命令定义和占 3K 的 Skill 元数据。活动对话约占 80K token，即 40%，其中包括占 50K 的最近消息、占 20K 的上下文缓存和占 10K 的活动引用。采用渐进式披露的参考上下文约占 50K，即 25%，其中包括占 15K 的项目结构、占 20K 的相关 Skills 和占 15K 的工具定义。紧急恢复预留约占 55K token，即 27.5%，其中包括占 10K 的会话状态快照、占 15K 的 TAGs 和交叉引用、占 20K 的错误恢复上下文以及占 10K 的空闲缓冲区。

监控阈值：当使用量超过 85% 时，触发紧急压缩并执行 clear 命令。当使用量超过 75% 时，延后处理非关键上下文，并警告用户即将达到限制。当使用量超过 60% 时，跟踪上下文增长模式。

用例：防止长时间运行的 SPEC-First 工作流发生上下文溢出。

### 模式 2：激进的 /clear 策略

概念：在关键检查点主动清除上下文，以保持效率。

强制执行 /clear 的时机：在 /moai:1-plan 完成后执行，以节省 45-50K tokens。当上下文超过 150K tokens 时执行，以防止溢出。当对话超过 50 条消息时执行，以移除过时的历史记录。在主要阶段转换之前执行，以获得干净的初始状态。在模型切换期间执行，用于从 Haiku 移交给 Sonnet。

用例：在 SPEC-Run-Sync 周期中最大限度提高 token 使用效率。

### 模式 3：会话状态持久化

概念：通过状态快照在中断后保持会话连续性。

会话状态层：L1 是适用于 Claude 4.5+ 的上下文感知层，负责 token 预算跟踪、上下文窗口位置、自动摘要触发器以及模型特定优化。L2 是当前任务、变量和范围的活动上下文。L3 是近期操作和决策的会话历史记录。L4 是 SPEC 进度和里程碑的项目状态。L5 是偏好、语言和专业水平的用户上下文。L6 是工具、权限和环境的系统状态。

用例：在中断后恢复长时间运行的任务，而不会丢失上下文。

### 模式 4：多智能体移交协议

概念：以最小的 token 开销在智能体之间无缝传递上下文。

移交包内容：包括 handoff_id、from_agent、to_agent；包含 session_id、model、context_position、available_tokens 和 user_language 的 session_context；包含 spec_id、current_phase、completed_steps 和 next_step 的 task_context；以及包含 last_checkpoint、recovery_tokens_reserved 和 session_fork_available 的 recovery_info。

移交验证：检查 token 预算，确保至少有 30K 的可用缓冲区。验证智能体兼容性。必要时触发上下文压缩。

用例：高效执行从 Plan 到 Run 再到 Sync 的工作流。

### 模式 5：渐进式披露与内存优化

概念：根据相关性和需要渐进式加载上下文。

渐进式摘要：提取关键句子，按 0.3 的目标比例将 50K 压缩至 15K。添加指向原始内容的引用指针。将原始内容存储在会话归档中，以便恢复。最终可节省约 35K tokens。

上下文标记：避免使用 "The user configuration from the previous 20 messages..." 之类具有高 token 成本的短语，改用 "Refer to @CONFIG-001 for user preferences" 之类的高效引用。

用例：在最大限度减少 token 开销的同时保持上下文连续性。

---

## 高级文档

有关详细模式和实现策略，请参阅：

- modules/token-budget-allocation.md - 预算明细、分配策略、监控阈值
- modules/session-state-management.md - 状态层、持久化、恢复模式
- modules/context-optimization.md - 渐进式披露、摘要、内存管理
- modules/handoff-protocols.md - 智能体间通信、包格式、验证
- modules/memory-mcp-optimization.md - 内存文件结构、MCP 服务器配置
- modules/reference.md - API 参考、故障排除、最佳实践

---

## 最佳实践

推荐实践：

- 创建 SPEC 后立即执行 /clear
- 监控令牌使用量并据此进行规划
- 使用上下文感知的令牌预算跟踪
- 在重大操作前创建检查点
- 对长工作流应用渐进式摘要
- 启用会话持久化以便恢复
- 使用会话分叉进行并行探索
- 确保每个内存文件少于 500 行
- 禁用未使用的 MCP 服务器以减少开销

必需实践：

通过定期清理周期维护有界的上下文历史记录。无限制的上下文累积会降低性能，并使令牌成本呈指数级增长。这可防止上下文溢出、保持稳定的响应质量，并减少 60-70% 的令牌浪费。

当使用量超过 150K 个令牌时，立即响应令牌预算警告。在上下文窗口最后 20% 的范围内运行会导致性能显著下降。

在会话恢复操作期间执行状态验证检查。无效状态可能导致多步骤流程中的工作流失败和数据丢失。

在执行任何上下文清理操作之前持久化会话标识符。会话 ID 是恢复中断工作流的唯一可靠机制。

当使用量达到 85% 阈值时，执行上下文压缩或清理。这可保留 55K 个令牌的应急储备，并防止被迫中断。

---

## 配合使用效果良好

- moai-cc-memory - 内存管理和上下文持久化
- moai-cc-configuration - 会话配置和偏好设置
- moai-core-workflow - 工作流状态持久化和恢复
- moai-cc-agents - 跨会话的智能体状态管理
- moai-foundation-trust - 质量门禁集成

---

## 工作流集成

会话初始化：使用模式 1 初始化令牌预算，使用模式 3 加载会话状态，使用模式 5 设置渐进式披露，并使用模式 4 配置交接协议。

SPEC 优先工作流：执行 /moai:1-plan，然后必须执行 /clear 以节省 45-50K 个令牌，接着执行 /moai:2-run SPEC-XXX，然后使用模式 4 进行多智能体交接，接着执行 /moai:3-sync SPEC-XXX，最后使用模式 3 持久化会话状态。

上下文监控：使用模式 1 持续跟踪令牌使用量，使用模式 5 应用渐进式披露，在达到阈值时使用模式 2 执行 /clear，并使用模式 4 验证交接。

---

## 成功指标

- 令牌效率：通过积极清理减少 60-70%
- 上下文开销：系统/技能元数据少于 15K 个令牌
- 交接成功率：通过验证达到 95% 以上
- 会话恢复：通过状态持久化将恢复时间控制在 5 秒以内
- 内存优化：每个内存文件少于 500 行

---

状态：生产就绪（企业级）
模块化架构：SKILL.md + 6 个模块
集成：针对 Plan-Run-Sync 工作流进行了优化
生成工具：MoAI-ADK Skill Factory

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化借口

| 合理化借口 | 事实 |
|---|---|
| “我还剩下大量上下文，无需优化” | 上下文的填充速度比预期更快。读取 10 个每个 500 行的文件会消耗 50% 的预算。 |
| “为了全面了解，我会读取完整文件” | 当你只需要 50 行时却读取 1000 行，会浪费 950 行上下文。应先使用 Grep 查找相关部分。 |
| “/clear 会丢失太多上下文，我会继续进行” | 超过 150K 个令牌会导致推理能力下降。通过持久化 SPEC 后按计划执行 /clear，比输出质量下降更好。 |
| “会话状态不需要持久化，我会记住” | 在执行 /clear 或重启会话后，你不会记得这些状态。SPEC 文档和任务列表才是持久化机制。 |
| “令牌预算跟踪维护起来太复杂” | 预算跟踪只是算术。悄无声息地超出预算会降低质量，而这更难调试。 |
| “我会预先加载所有技能，以做好准备” | 预先加载会将令牌浪费在可能永远不会触发的技能上。渐进式披露正是为此而存在的。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 对超过 200 行的文件进行完整读取（未使用 offset/limit）
- 上下文使用量超过 150K tokens，且未执行 /clear 或压缩
- 在单个会话中多次读取同一文件，且未使用缓存
- 由于未维护 SPEC 或任务列表，导致会话交接时丢失进度
- 任何阶段转换讨论中均未提及 token 预算

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 使用 offset/limit 或通过 Grep 读取大型文件（200 行以上）
- [ ] 在 Read 之前使用 Grep 定位具体行号
- [ ] 跟踪上下文，并在达到 150K 阈值前执行 /clear
- [ ] 在执行 /clear 前，将会话状态持久化到 SPEC 文档或任务列表中
- [ ] 同一会话中未对相同内容进行重复文件读取

<!-- moai:evolvable-end -->