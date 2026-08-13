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
# agentMemory Skill
## 何时使用

当你需要一个混合式记忆系统，为 AI 代理提供持久化且可搜索的知识管理时使用此 skill。

此 skill 通过提供一个持久化、可搜索的记忆库来扩展你的能力，并会自动与项目文档同步。

## 先决条件

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
   *注意：该 skill 通常以后台进程或通过 mcp-server 配置运行，关键是确保它在运行。*

## 能力（MCP 工具）

服务器启动后，你可以使用以下工具：

### `memory_search`
按查询、类型或标签搜索记忆。
- **参数**：`query` (string)、`type?` (string)、`tags?` (string[])
- **用法**：“查找所有认证模式” -> `memory_search({ query: "authentication", type: "pattern" })`

### `memory_write`
记录新的知识或决策。
- **参数**：`key` (string)、`type` (string)、`content` (string)、`tags?` (string[])
- **用法**：“保存这条架构决策” -> `memory_write({ key: "auth-v1", type: "decision", content: "..." })`

### `memory_read`
按 key 检索特定记忆内容。
- **参数**：`key` (string)
- **用法**：“获取认证设计” -> `memory_read({ key: "auth-v1" })`

### `memory_stats`
查看记忆使用情况分析。
- **用法**：“显示记忆统计” -> `memory_stats({})`

## 工作流

1. **初始化**：首次在项目中运行时，它可能会尝试从 `.kilocode/`、`.clinerules/` 或 `.roo/` 导入现有的 markdown 记忆库。
2. **开发循环**：
   - **任务前**：搜索记忆以获取相关上下文。
   - **任务中**：使用读取/搜索回答问题。
   - **任务后**：将新发现写入记忆。
3. **同步**：你的写入会自动同步到项目中的标准 markdown 文件。

## 局限性

- 仅在任务明确匹配其上游来源和本地项目上下文时才使用此 skill。
- 在应用变更前，请先核验命令、生成代码、依赖项、凭据以及外部服务行为。
- 不要将示例视为环境特定测试、安全审查或对破坏性或高成本操作所需用户批准的替代品。
