---
name: agent-memory
description: A hybrid memory system that provides persistent, searchable knowledge management for AI agents.
risk: critical
source: https://github.com/webzler/agentMemory/tree/main/
source_repo: webzler/agentMemory
source_type: community
date_added: 2026-07-01
license: MIT
license_source: https://github.com/webzler/agentMemory/blob/main/LICENSE
---
# `agentMemory` 技能
## 何时使用

当你需要一个为 AI 智能体提供持久化、可检索知识管理的混合记忆系统时，请使用此技能。

此技能通过提供一个持久化、可检索的记忆库来扩展你的能力，该记忆库会自动与项目文档同步。

## 前置条件

- 已安装 Node.js
- 检查项目中是否已安装 `agentMemory`：
  ```bash
  ls -la .agentMemory
  ```

## 设置

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **构建项目**：
   ```bash
   npm run compile
   ```

3. **启动记忆服务器**：
   你需要运行 MCP 服务器以与记忆库进行交互。
   ```bash
   npm run start-server <project_id> <absolute_path_to_workspace>
   ```
   *注意：该技能通常作为后台进程或通过 mcp-server 配置运行。确保其运行状态是关键。*

## 能力（MCP 工具）

服务器启动后，你可以使用以下工具：

### `memory_search`
按查询、类型或标签搜索记忆。
- **参数**：`query`（字符串）、`type?`（字符串）、`tags?`（字符串数组）
- **用法**：“查找所有身份验证模式” -> `memory_search({ query: "authentication", type: "pattern" })`

### `memory_write`
记录新的知识或决策。
- **参数**：`key`（字符串）、`type`（字符串）、`content`（字符串）、`tags?`（字符串数组）
- **用法**：“保存这条架构决策” -> `memory_write({ key: "auth-v1", type: "decision", content: "..." })`

### `memory_read`
按 key 检索特定记忆内容。
- **参数**：`key`（字符串）
- **用法**：“获取 auth 设计” -> `memory_read({ key: "auth-v1" })`

### `memory_stats`
查看记忆使用情况的分析数据。
- **用法**：“显示记忆统计” -> `memory_stats({})`

## 工作流

1. **初始化**：首次在某个项目中运行时，它可能会尝试从 `.kilocode/`、`.clinerules/` 或 `.roo/` 导入现有的 Markdown 记忆库。
2. **开发循环**：
   - **任务前**：搜索相关上下文记忆。
   - **任务中**：使用读取/搜索回答问题。
   - **任务后**：将新发现写入记忆。
3. **同步**：你的写入会自动同步到项目中的标准 Markdown 文件。

## 局限性

- 仅在任务与其上游来源和本地项目上下文明确匹配时使用此技能。
- 在应用更改前，请先验证命令、生成代码、依赖、凭据和外部服务行为。
- 不要将示例视为环境特定测试、安全评审，或高风险/高成本操作的替代，也不要替代用户对破坏性操作的批准。
