---
name: understand-diff
description: Use when you need to analyze git diffs or pull requests to understand what changed, affected components, and risks
---
# /understand-diff

对照项目数据目录中的知识图谱分析当前代码变更（`.ua/knowledge-graph.json`；如果存在旧版 `.understand-anything/knowledge-graph.json`，则使用该目录）。

## 图结构参考

知识图谱 JSON 具有如下结构：
- `project` — {name, description, languages, frameworks, analyzedAt, gitCommitHash}
- `nodes[]` — 每一项包含 {id, type, name, filePath?, summary, tags[], complexity, languageNotes?}
  - 代码节点类型：file, function, class, module, concept
  - 非代码节点类型：config, document, service, table, endpoint, pipeline, schema, resource
  - 领域/知识节点类型：domain, flow, step, article, entity, topic, claim, source
  - ID 使用节点类型作为前缀，例如 `file:path`、`function:path:name`、`config:path`、`article:path`
- `edges[]` — 每一项包含 {source, target, type, direction, weight}
  - 关键类型：imports, contains, calls, depends_on, configures, documents, deploys, triggers, contains_flow, flow_step, related, cites
- `layers[]` — 每一项包含 {id, name, description, nodeIds[]}
- `tour[]` — 每一项包含 {order, title, description, nodeIds[]}

## 如何高效阅读

1. 在读取完整文件之前，先使用 Grep 在 JSON 中搜索相关条目
2. 只读取你需要的部分 — 不要把整个图谱转储到上下文中
3. 节点名称和摘要是理解内容最有用的字段
4. 边告诉你组件如何连接 — 沿着 imports 和 calls 跟踪依赖链

## 指令

1. **解析数据目录 `$UA_DIR`。** 运行 `UA_DIR=$([ -d .understand-anything ] && echo .understand-anything || echo .ua)` — 如果旧版 `.understand-anything/` 已存在，则使用它；否则使用新的 `.ua/`。检查 `$UA_DIR/knowledge-graph.json` 是否存在。如果不存在，告诉用户先运行 `/understand`。

2. **获取变更文件列表**（此时不要读取图谱）：
   - 如果在包含未提交变更的分支上：`git diff --name-only`
   - 如果在功能分支上：`git diff main...HEAD --name-only`（或基础分支）
   - 如果用户指定了 PR 编号：从该 PR 获取 diff

3. **读取项目元数据并检查图谱新鲜度** — 使用 Grep 或带行数限制的 Read 提取 `"project"` 部分，包括作为 `GRAPH_COMMIT_RAW` 的 `gitCommitHash`，然后：
   - 在将解析出的提交用于任何 Git diff 之前，先将其解析为提交。从项目根目录比较解析出的提交与 `git rev-parse HEAD`，并检查项目范围内的已提交变更和工作区变更：
     ```bash
     GRAPH_COMMIT=$(git rev-parse --verify --end-of-options "${GRAPH_COMMIT_RAW}^{commit}" 2>/dev/null)
     git rev-parse HEAD
     git diff --name-only "$GRAPH_COMMIT" HEAD -- .
     git diff --cached --name-only -- .
     git diff --name-only -- .
     git ls-files --others --exclude-standard -- .
     ```
   - `-- .` pathspec 是必需的：仅修改同级 monorepo 项目的提交不应使该图谱失效。当项目 diff 为空时，仅哈希不匹配并不代表图谱已过期。
   - 在每个命令的输出中忽略所选数据目录（`.ua/` 或旧版 `.understand-anything/`），因为它包含生成的图谱工件，而不是项目源码漂移。
   - 如果已提交 diff 或任何工作区命令报告了项目文件，请在影响分析之前警告图谱可能遗漏这些变更。建议：运行 `/understand` 刷新图谱。
   - 仅在 `GRAPH_COMMIT_RAW` 成功解析时运行提交 diff。如果图谱提交或 Git 元数据缺失、无效或不可用，给出简短的最佳努力警告并继续，而不是阻塞流程。

4. **查找变更文件对应的节点** — 对每个变更文件路径，使用 Grep 在知识图谱中搜索：
   - 具有匹配 `"filePath"` 值的节点（例如 `grep "changed/file/path"`）
   - 这会找到文件级节点（包括非代码类型）以及定义在这些文件中的 function/class 节点
   - 记录所有匹配节点的 `id` 值

5. **查找连接的边（1 跳）** — 对每个匹配的节点 ID，在边中 Grep 该 ID，以找到：
   - 导入或依赖于变更节点的内容（上游调用方）
   - 变更节点导入或调用的内容（下游依赖）
   - 这些是“受影响组件” — 可能会损坏或需要更新的内容

6. **识别受影响的层** — 在 `"layers"` 部分中 Grep 匹配的节点 ID，以确定涉及哪些架构层。

7. **提供结构化分析**：
   - **Changed Components**：被直接修改的内容（附带匹配节点的摘要）
   - **Affected Components**：可能受到影响的内容（来自 1 跳边）
   - **Affected Layers**：涉及哪些架构层以及跨层关注点
   - **Risk Assessment**：基于节点 `complexity` 值、跨层边数量和影响范围（受影响组件数量）
   - 建议需要仔细审查的内容以及潜在问题

8. **为仪表板写入 diff overlay** — 在生成分析后，将 diff 数据写入 `$UA_DIR/diff-overlay.json`，以便仪表板可视化变更和受影响的组件。该文件包含：
   ```json
   {
     "version": "1.0.0",
     "baseBranch": "<the base branch used>",
     "generatedAt": "<ISO timestamp>",
     "changedFiles": ["<list of changed file paths>"],
     "changedNodeIds": ["<node IDs from step 4>"],
     "affectedNodeIds": ["<node IDs from step 5, excluding changedNodeIds>"]
   }
   ```
   写入后，告诉用户可以运行 `/understand-anything:understand-dashboard` 来可视化查看 diff overlay。
