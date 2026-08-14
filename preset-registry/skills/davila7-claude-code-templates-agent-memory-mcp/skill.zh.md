---
name: agent-memory-mcp
author: Amit Rathiesh
description: A hybrid memory system that provides persistent, searchable knowledge management for AI agents (Architecture, Patterns, Decisions).
---
# Agent Memory Skill

此技能提供一个持久化、可搜索的记忆库，并会自动与项目文档同步。它作为 MCP 服务器运行，支持读取、写入和搜索长期记忆。

## 前置条件

- Node.js (v18+)

## 设置

1. **克隆仓库**：
   将 `agentMemory` 项目克隆到智能体的工作区或并列目录中：

   ```bash
   git clone https://github.com/webzler/agentMemory.git .agent/skills/agent-memory
   ```

2. **安装依赖项**：

   ```bash
   cd .agent/skills/agent-memory
   npm install
   npm run compile
   ```

3. **启动 MCP 服务器**：
   使用辅助脚本为当前项目激活记忆库：

   ```bash
   npm run start-server <project_id> <absolute_path_to_target_workspace>
   ```

   _当前目录示例：_

   ```bash
   npm run start-server my-project $(pwd)
   ```

## 功能（MCP 工具）

### `memory_search`

按查询、类型或标签搜索记忆。

- **参数**：`query`（字符串）、`type?`（字符串）、`tags?`（字符串数组）
- **用法**：“查找所有身份验证模式” -> `memory_search({ query: "authentication", type: "pattern" })`

### `memory_write`

记录新知识或决策。

- **参数**：`key`（字符串）、`type`（字符串）、`content`（字符串）、`tags?`（字符串数组）
- **用法**：“保存此架构决策” -> `memory_write({ key: "auth-v1", type: "decision", content: "..." })`

### `memory_read`

按键检索特定的记忆内容。

- **参数**：`key`（字符串）
- **用法**：“获取身份验证设计” -> `memory_read({ key: "auth-v1" })`

### `memory_stats`

查看记忆使用情况的分析数据。

- **用法**：“显示记忆统计信息” -> `memory_stats({})`

## 仪表板

此技能包含一个用于可视化记忆使用情况的独立仪表板。

```bash
npm run start-dashboard <absolute_path_to_target_workspace>
```

访问地址：`http://localhost:3333`