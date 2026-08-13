---
name: agent-memory-mcp
description: "A hybrid memory system that provides persistent, searchable knowledge management for AI agents (Architecture, Patterns, Decisions)."
risk: critical
source: community
date_added: "2026-02-27"
---
# Agent Memory 技能

该技能提供一个持久、可搜索的记忆库，并会自动与项目文档同步。它作为 MCP 服务器运行，允许读取/写入/搜索长期记忆。

## 先决条件

- Node.js (v18+)

## 设置

1. **回顾仓库**：
   请要求用户批准对指定仓库的网络访问权限，然后将固定修订版克隆到临时目录，而不是活动的 skills 路径：

   ```bash
   review_dir="$(mktemp -d)"
   git clone --filter=blob:none https://github.com/webzler/agentMemory.git "$review_dir/agent-memory"
   git -C "$review_dir/agent-memory" checkout --detach 0409b7b7bb6fe443d0d4b6a6b1ee0d4df214f3cd
   git -C "$review_dir/agent-memory" ls-files
   ```

   阅读所有捆绑文件并检查 `package.json`、锁文件、生命周期脚本、网络行为、凭证访问和文件系统范围。展示发现结果和精确提交号，然后等待用户明确批准。

2. **安装已审查的修订版**：

   在获得批准后，将审查过的代码树复制到用户选定的位置。仅在包脚本审查完毕后再安装锁定依赖：

   ```bash
   cd <approved-agent-memory-directory>
   npm ci
   npm run compile
   ```

3. **启动 MCP 服务器**：
   使用辅助脚本为你当前的项目激活记忆库：

   ```bash
   npm run start-server <project_id> <absolute_path_to_target_workspace>
   ```

   _当前目录示例：_

   ```bash
   npm run start-server my-project $(pwd)
   ```

## 能力（MCP 工具）

### `memory_search`

按查询、类型或标签搜索记忆。

- **参数**：`query` (string)、`type?` (string)、`tags?` (string[])
- **用法**："查找所有身份验证模式" -> `memory_search({ query: "authentication", type: "pattern" })`

### `memory_write`

记录新的知识或决策。

- **参数**：`key` (string)、`type` (string)、`content` (string)、`tags?` (string[])
- **用法**："保存这个架构决策" -> `memory_write({ key: "auth-v1", type: "decision", content: "..." })`

### `memory_read`

按 key 检索特定记忆内容。

- **参数**：`key` (string)
- **用法**："获取认证设计" -> `memory_read({ key: "auth-v1" })`

### `memory_stats`

查看记忆使用统计。

- **用法**："显示记忆统计信息" -> `memory_stats({})`

## 仪表板

该技能包含一个独立的仪表板，用于可视化记忆使用情况。

```bash
npm run start-dashboard <absolute_path_to_target_workspace>
```

访问地址：`http://localhost:3333`

## 何时使用
该技能适用于执行概述中描述的工作流或操作。

## 限制
- 仅在任务明确符合上述范围时使用此技能。
- 不要将输出视为环境特定验证、测试或专家评审的替代。
- 如果缺少所需输入、权限、安全边界或成功标准，请停止并请求澄清。
- 更改固定修订版前请重新审查上游；提交固定有助于复现，但不保证可信任。
