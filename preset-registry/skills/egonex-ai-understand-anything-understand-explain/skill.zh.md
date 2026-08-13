---
name: understand-explain
description: Use when you need a deep-dive explanation of a specific file, function, or module in the codebase
argument-hint: "[file-path]"
---
# /understand-explain

对特定代码组件给出全面、深入的说明。

## 图结构参考

知识图 JSON 结构如下：
- `project` — {name, description, languages, frameworks, analyzedAt, gitCommitHash}
- `nodes[]` — 每个节点包含 {id, type, name, filePath?, summary, tags[], complexity, languageNotes?}
  - 代码节点类型：file, function, class, module, concept
  - 非代码节点类型：config, document, service, table, endpoint, pipeline, schema, resource
  - 领域/知识节点类型：domain, flow, step, article, entity, topic, claim, source
  - ID 使用节点类型作为前缀，例如 `file:path`、`function:path:name`、`config:path`、`article:path`
- `edges[]` — 每条边包含 {source, target, type, direction, weight}
  - 关键类型：imports, contains, calls, depends_on, configures, documents, deploys, triggers, contains_flow, flow_step, related, cites
- `layers[]` — 每个层包含 {id, name, description, nodeIds[]}
- `tour[]` — 每个条目包含 {order, title, description, nodeIds[]}

## 高效阅读方法

1. 在读取完整文件之前，先使用 Grep 在 JSON 中搜索相关条目
2. 只阅读你需要的部分，不要将整个图一次性全部放入上下文
3. 节点名称和摘要字段是理解内容最有用的信息
4. 边描述了组件之间的连接关系——按 imports 和 calls 跟踪依赖链

## 说明

1. **解析数据目录 `$UA_DIR`。** 执行 `UA_DIR=$([ -d .understand-anything ] && echo .understand-anything || echo .ua)` — 当 `.understand-anything/` 已存在时使用旧版目录，否则使用新的 `.ua/`。检查 `$UA_DIR/knowledge-graph.json` 是否存在；如果不存在，告知用户先运行 `/understand`。

2. **在使用基于图谱的上下文前先检查图谱新鲜度**：
   - 从图谱元数据中读取 `project.gitCommitHash` 作为 `GRAPH_COMMIT_RAW`。在任何 Git diff 中使用前先解析为一个提交，再与 `git rev-parse HEAD` 比对，并从项目根目录检查项目范围内已提交与工作区变更：
     ```bash
     GRAPH_COMMIT=$(git rev-parse --verify --end-of-options "${GRAPH_COMMIT_RAW}^{commit}" 2>/dev/null)
     git rev-parse HEAD
     git diff --name-only "$GRAPH_COMMIT" HEAD -- .
     git diff --cached --name-only -- .
     git diff --name-only -- .
     git ls-files --others --exclude-standard -- .
     ```
   - 必须使用 `-- .` 的 pathspec：仅触及同仓库中的其他 sibling monorepo 项目的提交不应使该图谱变为过期。仅提交哈希不一致并不表示过期，只要项目 diff 为空即可。
   - 在每条命令的输出中忽略所选数据目录（`.ua/` 或旧的 `.understand-anything/`），因为它只包含生成的图谱制品，不是项目源码漂移。
   - 如果已提交 diff 或任一工作区命令报告了项目文件，在说明图谱上下文可能遗漏这些变更之前先发出警告。建议：运行 `/understand` 以刷新图谱。
   - 仅在 `GRAPH_COMMIT_RAW` 成功解析为提交后才执行提交 diff。若图谱提交或 Git 元数据缺失、无效或不可用，请给出简短的尽力警告并继续，不要阻塞流程。

3. **定位目标节点**——使用 Grep 在知识图中搜索组件：`"$ARGUMENTS"`
   - 对于文件路径（例如 `src/auth/login.ts`）：搜索匹配的 `"filePath"`
   - 对于函数写法（例如 `src/auth/login.ts:verifyToken`）：按文件路径过滤后，在 `"name"` 字段中搜索函数名
   - 记录准确的节点 `id`、`type`、`summary`、`tags` 和 `complexity`

4. **查找所有连接边**——在 edges 区段用目标节点的 ID 进行 Grep：
   - `"source"` 匹配 → 该节点调用/导入/依赖的对象（出边）
   - `"target"` 匹配 → 调用/导入/依赖该节点的对象（入边）
   - 记录已连接的节点 ID 与边类型

5. **读取连接节点**——对第 4 步中得到的每个连接节点 ID，在 nodes 区段 Grep 这些 ID，获取它们的 `name`、`summary` 和 `type`，用于构建该组件的邻域关系。

6. **识别层级**——在 `"layers"` 区段中搜索目标节点的 ID，找出其所属的架构层及该层描述。

7. **读取实际源码文件**——读取该节点 `filePath` 指向的源码文件，进行深度分析。

8. **结合上下文解释该组件**：
   - 说明其在架构中的角色（所属层级、存在原因）
   - 内部结构（其包含的函数、类——来自 `contains` 边）
   - 外部连接（它导入了什么、谁调用它、它依赖什么——来自 edges）
   - 数据流（输入 → 处理 → 输出——基于源码）
   - 以读者可能不熟悉该编程语言为前提，提供清晰说明
   - 突出展示值得理解的模式、惯用法或复杂性
