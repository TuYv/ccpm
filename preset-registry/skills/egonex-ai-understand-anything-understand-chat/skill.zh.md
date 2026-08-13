---
name: understand-chat
description: Use when you need to ask questions about a codebase or understand code using a knowledge graph
argument-hint: "[query]"
---
# /understand-chat

使用项目数据目录中的知识图谱（` .ua/knowledge-graph.json`，或当该目录存在时使用旧版 `.understand-anything/knowledge-graph.json`）来回答关于该代码库的问题。

## 图谱结构说明

知识图谱 JSON 的结构如下：
- `project` — {name, description, languages, frameworks, analyzedAt, gitCommitHash}
- `nodes[]` — 每个节点包含 {id, type, name, filePath?, summary, tags[], complexity, languageNotes?}
  - 代码节点类型：file, function, class, module, concept
  - 非代码节点类型：config, document, service, table, endpoint, pipeline, schema, resource
  - 领域/知识节点类型：domain, flow, step, article, entity, topic, claim, source
  - ID 使用节点类型作为前缀，例如 `file:path`、`function:path:name`、`config:path`、`article:path`
- `edges[]` — 每个包含 {source, target, type, direction, weight}
  - 关键类型：imports, contains, calls, depends_on, configures, documents, deploys, triggers, contains_flow, flow_step, related, cites
- `layers[]` — 每个包含 {id, name, description, nodeIds[]}
- `tour[]` — 每个包含 {order, title, description, nodeIds[]}

## 高效读取方式

1. 在读取完整文件前，先用 Grep 搜索 JSON 中的相关条目
2. 只读取你需要的部分，不要将整张图谱全部输出到上下文中
3. 节点名称和摘要字段是理解项目的最有价值信息
4. 边用于说明组件如何连接——沿着 imports 和 calls 追踪依赖链

## 使用说明

1. **解析数据目录 `$UA_DIR`。** 执行 `UA_DIR=$([ -d .understand-anything ] && echo .understand-anything || echo .ua)` — 当 `.understand-anything/` 已存在时使用旧版目录，否则使用新版 `.ua/`。检查当前项目根目录下是否存在 `$UA_DIR/knowledge-graph.json`。如果不存在，请告诉用户先运行 `/understand`。

2. **在使用图谱派生上下文前检查图谱新鲜度**：
   - 从图谱元数据读取 `project.gitCommitHash` 为 `GRAPH_COMMIT_RAW`。在用于任何 Git diff 前先将其解析为 commit，再与 `git rev-parse HEAD` 对比，并检查项目范围内已提交和工作区中的变更（以项目根目录为基准）：
     ```bash
     GRAPH_COMMIT=$(git rev-parse --verify --end-of-options "${GRAPH_COMMIT_RAW}^{commit}" 2>/dev/null)
     git rev-parse HEAD
     git diff --name-only "$GRAPH_COMMIT" HEAD -- .
     git diff --cached --name-only -- .
     git diff --name-only -- .
     git ls-files --others --exclude-standard -- .
     ```
   - `-- .` 路径限定符是必需的：仅影响同级 monorepo 项目的提交不应使该图谱失效。仅有 hash 不一致在项目差异为空时并不表示图谱过期。
   - 在每个命令的输出中忽略所选数据目录（`.ua/` 或旧版 `.understand-anything/`），因为其中包含生成的图谱工件，不是项目源码漂移。
   - 如果已提交差异或任意工作区命令报告了项目文件，需在回答前提示：图谱派生的上下文可能遗漏这些变更。建议执行：Run `/understand` 来刷新图谱。
   - 仅在 `GRAPH_COMMIT_RAW` 成功解析为 commit 时再运行提交差异检查；若图谱提交或 Git 元数据缺失、无效或不可用，请给出简短的 best-effort 警告后继续，而不是阻塞。

3. **仅读取项目元数据**——用 Grep 或带行数限制的 Read 只提取文件顶部的 `"project"` 部分以获取上下文（name、description、languages、frameworks）。

4. **搜索相关节点**——用 Grep 在知识图谱文件中按用户查询关键词搜索：`$ARGUMENTS`
   - 搜索 `"name"` 字段：`grep -i "query_keyword"` 于图谱文件
   - 搜索 `"summary"` 字段以匹配语义相关内容
   - 搜索 `"tags"` 数组以匹配主题
   - 记录所有匹配节点的 `id` 值

5. **查找关联边**——对于每个匹配的节点 ID，在 `edges` 区块中用 Grep 查找：
   - 它导入或依赖了哪些内容（下游）
   - 有哪些内容调用或导入它（上游）
   - 这样可形成围绕查询的 1-hop 子图

6. **读取层级上下文**——查找 `"layers"` 以了解匹配节点所属的架构层。

7. **仅使用相关子图回答查询**：
   - 引用具体文件、函数和关系
   - 说明哪些层（layer）相关及原因
   - 回答要简洁但全面——将概念链接到实际代码位置
   - 如果查询未匹配到任何节点，需明确说明，并给出图谱中的相关术语建议
