---
name: iris-development
description: Iris is Redis's umbrella for AI-focused products. Use this skill when integrating with the Iris Redis Agent Memory (RAM) data plane on Redis Cloud — recording session events for an AI agent, creating or searching long-term memories, configuring a memory store, or tuning background memory promotion. Code examples use the official `redis-agent-memory` (Python) and `@redis-iris/agent-memory` (TypeScript) SDKs.
license: MIT
metadata:
  author: redis
  version: "1.0.0"
---
# Iris: Redis Agent Memory

**Iris** 是 Redis 面向 AI 的产品系列的统一品牌。本技能目前涵盖该系列中的一个产品：**Redis Agent Memory (RAM)** —— 面向 AI 智能体的持久化记忆层，以 Redis Cloud 托管服务的形式提供。其他 Iris 产品发布后将以独立章节的形式加入。

Redis Agent Memory 提供一个 REST/JSON 数据平面 API，包含两个记忆层级：

- **会话记忆（Session memory）** —— 每个会话的只追加（append-only）对话历史（工作记忆）。
- **长期记忆（Long-term memory）** —— 从会话中提取（或直接创建）的、可进行语义搜索的记录。

一个由 Redis Cloud 管理的后台**提升（promotion）**工作进程会从会话事件中提取持久性事实，并将其写入长期记忆。

## 官方 SDK

所有代码示例均使用官方 SDK：


| 语言       | 包名                       | 类名          | 安装方式                           |
| ---------- | -------------------------- | ------------- | ---------------------------------- |
| Python     | `redis-agent-memory`       | `AgentMemory` | `pip install redis-agent-memory`   |
| TypeScript | `@redis-iris/agent-memory` | `AgentMemory` | `npm add @redis-iris/agent-memory` |


两款 SDK 都会从 `AGENT_MEMORY_API_KEY` 读取 Bearer 令牌，并从 `AGENT_MEMORY_STORE_ID` 读取默认存储 ID。生产环境的数据平面 URL 为 `https://gcp-us-east4.memory.redis.io`；开通服务后，你的服务所对应的确切 URL 也会显示在 Cloud 控制台中。

## 适用场景

在以下情况中参考这些指南：

- 在 Redis Cloud 上创建记忆服务（[https://cloud.redis.io/#/agent-memory](https://cloud.redis.io/#/agent-memory)）
- 为智能体接入调用 `AgentMemory.add_session_event(...)` / `addSessionEvent(...)` 的逻辑
- 使用 `search_long_term_memory(...)` / `searchLongTermMemory(...)` 搜索长期记忆
- 在会话事件与直接写入长期记忆之间进行选择

## 按优先级划分的规则类别


| 优先级 | 类别             | 影响   | 前缀         |
| ------ | ---------------- | ------ | ------------ |
| 1      | 设置与云服务     | HIGH   | `setup-`     |
| 2      | 会话记忆 / 事件  | HIGH   | `session-`   |
| 3      | 长期记忆         | HIGH   | `ltm-`       |
| 4      | 记忆提升         | MEDIUM | `promotion-` |


## 快速参考

### 1. 设置与云服务（HIGH）

- [`setup-cloud-service`](references/setup-cloud-service.md) - 在 Redis Cloud 上创建记忆服务
- [`setup-auth-token`](references/setup-auth-token.md) - 使用存储 API 密钥对 SDK 进行身份验证

### 2. 会话记忆 / 事件（HIGH）

- [`session-when-to-use`](references/session-when-to-use.md) - 选择使用会话事件还是直接写入长期记忆
- [`session-add-event`](references/session-add-event.md) - 正确地追加会话事件
- [`session-retrieval`](references/session-retrieval.md) - 检索会话记忆及单个事件

### 3. 长期记忆（HIGH）

- [`ltm-bulk-create`](references/ltm-bulk-create.md) - 使用幂等 ID 批量创建长期记忆
- [`ltm-search`](references/ltm-search.md) - 带过滤条件的长期记忆语义搜索
- [`ltm-organize`](references/ltm-organize.md) - 使用 namespace、ownerId、topics 和 memoryType 组织记录

### 4. 记忆提升（MEDIUM）

- [`promotion-overview`](references/promotion-overview.md) - 后台提升的工作原理

## 使用方法

阅读 `references/` 目录下的各个规则文件，以获取详细说明和代码示例：

```
references/setup-cloud-service.md
references/session-add-event.md
references/promotion-overview.md
```

每个规则文件包含：

- 简要说明其重要性
- 包含 Python 和 TypeScript SDK 代码的正确示例
- "Incorrect"（错误）示例，或 "When to use / When NOT needed"（何时使用 / 何时不需要）指引
- 补充背景与参考资料
