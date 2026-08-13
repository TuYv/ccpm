---
name: understand-chat
description: Use when you need to ask questions about a codebase or understand code using a knowledge graph
argument-hint: "[query]"
---
# /understand-chat

使用项目的数据目录中的知识图谱（`.ua/knowledge-graph.json`，或当存在该目录时的遗留 `.understand-anything/knowledge-graph.json`）来回答有关该代码库的问题。

## 图谱结构参考

知识图谱 JSON 的结构如下：
- `project` — {name, description, languages, frameworks, analyzedAt, gitCommitHash}
- `nodes[]` — 每个节点都包含 {id, type, name, filePath?, summary, tags[], complexity, languageNotes?}
  - 代码节点类型：file, function, class, module, concept
  - 非代码节点类型：config, document, service, table, endpoint, pipeline, schema, resource
  - 领域/知识节点类型：domain, flow, step, article, entity, topic, claim, source
  - ID 使用节点类型作为前缀，例如 `file:path`、`function:path:name`、`config:path`、`article:path`
- `edges[]` — 每个都包含 {source, target, type, direction, weight}
  - 关键类型：imports, contains, calls, depends_on, configures, documents, deploys, triggers, contains_flow, flow_step, related, cites
- `layers[]` — 每个都包含 {id, name, description, nodeIds[]}
- `tour[]` — 每个都包含 {order, title, description, nodeIds[]}

## 高效阅读方法

1. 在读取完整文件前，先使用 Grep 在 JSON 中搜索相关条目
2. 只读取所需部分，不要一次性将整张图全部倒入上下文
3. 节点名称和摘要字段是理解最有价值的内容
4. 边记录了组件之间的连接——按 imports 和 calls 跟随依赖链

## 使用说明

1. **解析数据目录 `$UA_DIR`。** 运行 `UA_DIR=$([ -d .understand-anything ] && echo .understand-anything || echo .ua)` — 当 `.understand-anything/` 已存在时这是旧版目录，否则是新版本 `.ua/`。检查当前项目根目录下是否存在 `$UA_DIR/knowledge-graph.json`。如果不存在，请告知用户先运行 `/understand`。

2. **在使用图谱衍生上下文前检查图谱时效性**：
   - 读取 `project.gitCommitHash` 作为 `GRAPH_COMMIT_RAW`。在将其用于任何 Git 差异比较前先解析为 commit，然后与 `git rev-parse HEAD` 对比，并检查项目范围内已提交与工作区更改，执行于项目根目录：
     ```bash
     GRAPH_COMMIT=$(git rev-parse --verify --end-of-options "${GRAPH_COMMIT_RAW}^{commit}" 2>/dev/null)
     git rev-parse HEAD
     git diff --name-only "$GRAPH_COMMIT" HEAD -- .
     git diff --cached --name-only -- .
     git diff --name-only -- .
     git ls-files --others --exclude-standard -- .
     ```
   - `-- .` 路径参数是必需的：仅触及同级 monorepo 项目的提交不应使该图谱变为过期。仅有哈希不一致并不代表过期，前提是项目差异为空。
   - 在所有命令输出中忽略所选数据目录（`.ua/` 或旧版 `.understand-anything/`），因为它只包含生成的图谱产物，不是项目源代码变动。
   - 如果已提交差异或任一工作区命令报告了项目文件，请在回答前发出警告，说明图谱衍生上下文可能遗漏这些变更。建议：运行 `/understand` 来刷新图谱。
   - 仅在 `GRAPH_COMMIT_RAW` 成功解析为 commit 时才执行 commit 差异比较。如果图谱 commit 或 Git 元数据缺失、无效或不可用，请给出简短的最佳努力级警告并继续执行，不要阻塞流程。

3. **仅读取项目元数据**——使用 Grep 或带行数限制的 Read，从文件顶部提取仅 `"project"` 部分用于上下文（name、description、languages、frameworks）。

4. **查找相关节点**——使用 Grep 在知识图谱文件中按用户查询关键词搜索：`$ARGUMENTS`
   - 搜索 `"name"` 字段：`grep -i "query_keyword"` 在图谱文件中
   - 搜索 `"summary"` 字段以寻找语义匹配
   - 搜索 `"tags"` 数组以匹配主题
   - 记录所有匹配节点的 `id` 值

5. **查找连接边**——对每个匹配节点 ID，在 `edges` 部分中 Grep 该 ID，以找到：
   - 它导入或依赖了什么（下游）
   - 有什么调用或导入了它（上游）
   - 这将得到查询周边的 1-hop 子图

6. **读取层级上下文**——Grep `"layers"` 以理解匹配节点所属的架构层。

7. **仅基于相关子图回答查询**：
   - 引用图谱中具体的文件、函数与关系
   - 说明相关层级及其原因
   - 保持简洁但全面——将概念链接到实际代码位置
   - 若查询未匹配到任何节点，需说明并从图谱中建议相关术语
