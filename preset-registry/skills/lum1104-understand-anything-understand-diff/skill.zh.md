---
name: understand-diff
description: Use when you need to analyze git diffs or pull requests to understand what changed, affected components, and risks
---
# /understand-diff

分析当前代码变更与项目数据目录中的知识图谱（`.ua/knowledge-graph.json`，或当目录存在时的旧版 `.understand-anything/knowledge-graph.json`）之间的差异。

## Graph Structure Reference

知识图谱 JSON 的结构如下：
- `project` — {name, description, languages, frameworks, analyzedAt, gitCommitHash}
- `nodes[]` — 每个节点包含 {id, type, name, filePath?, summary, tags[], complexity, languageNotes?}
  - 代码节点类型：file、function、class、module、concept
  - 非代码节点类型：config、document、service、table、endpoint、pipeline、schema、resource
  - 领域/知识节点类型：domain、flow、step、article、entity、topic、claim、source
  - ID 使用节点类型作为前缀，例如 `file:path`、`function:path:name`、`config:path`、`article:path`
- `edges[]` — 每条边包含 {source, target, type, direction, weight}
  - 关键类型：imports、contains、calls、depends_on、configures、documents、deploys、triggers、contains_flow、flow_step、related、cites
- `layers[]` — 每个包含 {id, name, description, nodeIds[]}
- `tour[]` — 每个包含 {order, title, description, nodeIds[]}

## How to Read Efficiently

1. 在读取完整文件前，先用 Grep 搜索 JSON 中的相关条目
2. 只读取所需部分，不要把整个图谱一次性灌入上下文
3. 节点名称和摘要是理解项目最有用的字段
4. 边用于说明组件之间的连接——沿着 imports 和 calls 跟踪依赖链

## Instructions

1. **Resolve the data directory `$UA_DIR`.** 运行 `UA_DIR=$([ -d .understand-anything ] && echo .understand-anything || echo .ua)` — 当旧版 `.understand-anything/` 已存在时使用它，否则使用新的 `.ua/`。检查 `$UA_DIR/knowledge-graph.json` 是否存在。如果不存在，提示用户先运行 `/understand`。

2. **Get the changed files list**（尚未读取图谱）：
   - 如果在当前分支有未提交修改：`git diff --name-only`
   - 如果在特性分支：`git diff main...HEAD --name-only`（或基准分支）
   - 如果用户提供了 PR 编号：从该 PR 获取 diff

3. **Read project metadata and check graph freshness** — 使用 Grep 或带行限制读取以提取 `"project"` 区块，并将 `gitCommitHash` 作为 `GRAPH_COMMIT_RAW`，然后：
   - 先将其解析为 commit，再用于任何 Git 差异计算。请在项目根目录执行：
   ```bash
   GRAPH_COMMIT=$(git rev-parse --verify --end-of-options "${GRAPH_COMMIT_RAW}^{commit}" 2>/dev/null)
   git rev-parse HEAD
   git diff --name-only "$GRAPH_COMMIT" HEAD -- .
   git diff --cached --name-only -- .
   git diff --name-only -- .
   git ls-files --others --exclude-standard -- .
   ```
   - `-- .` 路径限定符是必需的：仅触及同级 monorepo 子项目的提交不能使该图谱过时。
   - 仅仅 hash 不一致不能单独认定图谱过时，若项目级 diff 为空。
   - 在每个命令输出中都要忽略所选数据目录（`.ua/` 或旧版 `.understand-anything/`），因为它包含的是生成产物，而非项目源码漂移。
   - 若已提交的 diff 或任何工作区命令报告了项目文件，请在影响分析前发出警告：该图谱可能遗漏这些变更，并建议：运行 `/understand` 以刷新图谱。
   - 仅当 `GRAPH_COMMIT_RAW` 能成功解析为有效 commit 时再执行 commit diff。若图谱 commit 或 Git 元数据缺失、无效或不可用，请给出简短的尽力而为警告并继续执行，不要阻塞流程。

4. **Find nodes for changed files** — 对于每个变更文件路径，使用 Grep 在知识图谱中搜索：
   - 匹配 `"filePath"` 值（例如 `grep "changed/file/path"`）
   - 这可找到文件级节点（包括非代码类型）以及定义在这些文件中的 function/class 节点
   - 记录所有匹配节点的 `id`

5. **Find connected edges (1-hop)** — 对每个匹配的节点 ID，在 edges 中 Grep 该 ID，以找到：
   - 哪些内容导入或依赖了变更节点（上游调用方）
   - 变更节点导入或调用了哪些内容（下游依赖）
   - 这些即为“受影响组件”——可能会被破坏或需要更新的内容

6. **Identify affected layers** — 在 `"layers"` 区段中 Grep 匹配的节点 ID，判断涉及到哪些架构层。

7. **Provide structured analysis**：
   - **变更组件**：直接修改内容（使用匹配节点的摘要）
   - **受影响组件**：可能受影响的组件（来自 1-hop 边）
   - **受影响层**：涉及到的架构层及其跨层关注点
   - **风险评估**：基于节点 `complexity` 值、跨层边数量以及影响半径（受影响组件数量）
   - 建议重点复查的内容与潜在问题

8. **Write diff overlay for dashboard** — 在生成分析后，将 diff 数据写入 `$UA_DIR/diff-overlay.json`，以便 dashboard 可视化展示变更与受影响组件。文件内容如下：
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
   写入后，告诉用户可运行 `/understand-anything:understand-dashboard` 以可视化查看 diff overlay。
