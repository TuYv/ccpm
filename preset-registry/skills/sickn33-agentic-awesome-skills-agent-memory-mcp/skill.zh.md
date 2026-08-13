---
name: agent-memory-mcp
description: "A hybrid memory system that provides persistent, searchable knowledge management for AI agents (Architecture, Patterns, Decisions)."
risk: critical
source: community
date_added: "2026-02-27"
---
# Agent Memory 技能

该技能提供一个持久化、可搜索的记忆库，并会自动与项目文档同步。它作为 MCP 服务器运行，以支持读取/写入/搜索长期记忆。

## 先决条件

- Node.js（v18+）

## 配置

1. **审核仓库**：
   让用户批准对指定仓库的网络访问权限，然后将固定修订版本克隆到临时目录，而不是活动技能路径：

   ```bash
   review_dir="$(mktemp -d)"
   git clone --filter=blob:none https://github.com/webzler/agentMemory.git "$review_dir/agent-memory"
   git -C "$review_dir/agent-memory" checkout --detach 0409b7b7bb6fe443d0d4b6a6b1ee0d4df214f3cd
   git -C "$review_dir/agent-memory" ls-files
   ```

   读取所有随附文件并检查 `package.json`、锁文件、生命周期脚本、网络行为、凭据访问和文件系统作用域。展示发现结果和准确的提交哈希，然后等待用户明确批准。

2. **安装已审核修订版**：

   在批准后，将审核后的树复制到用户选择的位置。仅在审核了包脚本后再安装锁定依赖：

   ```bash
   cd <approved-agent-memory-directory>
   npm ci
   npm run compile
   ```

3. **启动 MCP 服务器**：
   使用辅助脚本激活当前项目的记忆库：

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

- **参数**：`query`（string）、`type?`（string）、`tags?`（string[]）
- **用法**："Find all authentication patterns" -> `memory_search({ query: "authentication", type: "pattern" })`

### `memory_write`

记录新知识或决策。

- **参数**：`key`（string）、`type`（string）、`content`（string）、`tags?`（string[]）
- **用法**："Save this architecture decision" -> `memory_write({ key: "auth-v1", type: "decision", content: "..." })`

### `memory_read`

按 key 检索特定记忆内容。

- **参数**：`key`（string）
- **用法**："Get the auth design" -> `memory_read({ key: "auth-v1" })`

### `memory_stats`

查看记忆使用情况分析。

- **用法**："Show memory statistics" -> `memory_stats({})`

## 仪表盘

该技能包含一个独立的仪表盘，用于可视化记忆使用情况。

```bash
npm run start-dashboard <absolute_path_to_target_workspace>
```

访问地址：`http://localhost:3333`

## 使用时机
该技能适用于执行概览中所述的工作流或操作。

## 局限性
- 仅在任务明确符合上述范围时使用本技能。
- 不要将输出视为环境特定验证、测试或专家审核的替代。
- 如果缺少必要输入、权限、安全边界或成功标准，请停止并请求澄清。
- 在更改固定修订版本前请重新审视上游；提交固定有助于提高复现性，但不能保证可信任。
