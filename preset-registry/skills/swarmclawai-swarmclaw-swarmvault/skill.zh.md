---
name: swarmvault
description: Use when working with a SwarmVault knowledge vault (raw/, wiki/, swarmvault.schema.md). Establishes schema-first conventions and prefers graph queries over broad search.
homepage: https://swarmvault.ai
metadata:
  openclaw:
    capabilities: [knowledge-base, knowledge-graph, retrieval, vault]
    requires:
      bins: [npx]
---
# SwarmVault

当 agent 启用了指向某个 vault 目录的 SwarmVault MCP 服务器（传输方式为 `stdio`，命令为 `npx -y @swarmvaultai/cli mcp`）时使用。

SwarmVault 工作区是一个三层知识系统：

- `raw/` — 不可变的原始输入（PDF、转录文本、代码、邮件、URL、表格）。绝不编辑。
- `wiki/` — 由 agent 和 SwarmVault 编译器所有的生成式 markdown。页面带有 frontmatter（`page_id`、`source_ids`、`node_ids`、`freshness`、`source_hashes`）。
- `state/` — 生成的索引、图和审批记录。视为 `compile` 的不透明输出。

vault 契约位于工作区根目录的 `swarmvault.schema.md`。vault 配置位于 `swarmvault.config.json`。

## 规则

1. 在进行任何编译或查询工作之前，**先阅读 `swarmvault.schema.md`**。它定义了此特定 vault 的分类、命名、新鲜度规则和溯源（grounding）约定。
2. 当 `wiki/graph/report.md` 存在时，**在大范围搜索文件之前先阅读它**；否则从 `wiki/index.md` 开始。两者都概述了 vault 结构，使你无需重新扫描全部内容。
3. **将 `raw/` 视为不可变的。**绝不编辑、重命名或删除其中的文件。新来源通过 `ingest` 添加。
4. **将 `wiki/` 视为编译器所有。**编辑时应完整保留 frontmatter 字段：`page_id`、`source_ids`、`node_ids`、`freshness`、`source_hashes`。如果这些字段发生漂移，下一次 `compile` 将覆盖该页面或将其标记出来。
5. 对于“X 与 Y 有何关联”或“什么依赖于 Z”这类问题，**优先使用图查询而非 grep/glob**。vault 的类型化图比文本搜索更可靠。
6. **将高价值答案保存**到 `wiki/outputs/`（使用 `query` 或 `explore` 工具），而不是只留在对话中。这样它们就会成为 vault 的一等内容，供下次使用。

## 工具面板

SwarmVault MCP 服务器提供以下工具（工具名称由 SwarmClaw 加上前缀 `mcp_<sanitized server name>_`，例如 `mcp_SwarmVault_query_vault`）。请将用户意图匹配到最接近的工具：

Vault 检查：
- `workspace_info` — 返回当前 vault 路径和概要统计。当你从未接触过此 vault 时，先使用它。
- `list_sources` — 列出 `raw/` 下的来源清单。
- `search_pages` — 跨已编译的 wiki 页面进行全文搜索。
- `read_page` — 按相对于 `wiki/` 的路径读取特定 wiki 页面。

图（对于关系类问题，优先于 grep 使用）：
- `graph_report` — 机器可读的图报告和信任工件。在进行大范围搜索之前先阅读它。
- `query_graph` — 从搜索种子遍历图，无需调用 LLM 提供商。
- `get_node` — 解释某个图节点及其页面、社区、邻居和分组模式。
- `get_neighbors` — 某个节点或页面目标的邻居。
- `get_hyperedges` — 列出图超边，可选过滤。
- `shortest_path` — 两个图目标之间的最短路径。
- `god_nodes` — 连接度最高的节点（vault 的枢纽）。
- `blast_radius` — 影响分析：哪些内容依赖于此文件或模块？

问答：
- `query_vault` — 对 vault 提出自然语言问题。返回带溯源的引用。传入 `save: true` 可将答案持久化到 `wiki/outputs/`。

摄取与维护：
- `ingest_input` — 将文件路径或 URL 添加到 `raw/` 并注册为受管理的来源。
- `compile_vault` — 重新推导 `wiki/` 页面、图和搜索索引。在摄取之后、schema 变更之后或新鲜度过期时运行。
- `lint_vault` — 防漂移检查和 vault 健康检查。

如果 MCP 服务器不可用，但 agent 拥有 `shell` 或 `execute` 工具，则可以通过 `swarmvault <subcommand>`（或 `npx -y @swarmvaultai/cli <subcommand>`）执行相同的操作，并将工作目录设为 vault 根目录。

## 工作流

针对 vault 的新问题：

1. 如果尚未调用 `workspace_info`，请先调用，然后阅读 `swarmvault.schema.md`。如果存在 `wiki/graph/report.md` 或 `wiki/index.md`，请快速浏览。
2. 使用 `query_vault`（或对于关系类问题使用 `query_graph` / `get_node` / `shortest_path`）。引用返回的 `source_ids` 和 `node_ids`。
3. 如果答案暴露出缺口，建议通过 `ingest_input` 添加缺失的来源，然后执行 `compile_vault`。
4. 使用 `query_vault` 并传入 `save: true` 保存最终答案，使其成为 `wiki/outputs/` 下的 vault 内容。

对于用户提到的新来源：

1. 对该文件/URL 执行 `ingest_input`。
2. 执行 `compile_vault` 以推导出新的 wiki 页面、图和搜索索引。
3. 执行 `lint_vault` 以检查 frontmatter 和链接。
4. 浏览 `wiki/sources/` 中的新页面并确认出处。

## 边界

- 不要针对 `swarmvault.schema.md` 的未审查变更运行 `compile` —— 先执行 `lint`。
- 未经用户确认，不要将候选页面（`wiki/candidates/`）提升至 `wiki/concepts/` 或 `wiki/entities/`；审批流程的存在自有其理由。
- 没有明确要求时，不要将 vault 图推送到 Neo4j 或导出到 Obsidian。
