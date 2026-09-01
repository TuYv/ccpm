---
name: understand-onboard
description: Use when you need to generate an onboarding guide for new team members joining a project
---
# /understand-onboard

从项目的知识图谱生成一份全面的新人入门指南。

## 图结构参考

知识图谱 JSON 具有如下结构：
- `project` — {name, description, languages, frameworks, analyzedAt, gitCommitHash}
- `nodes[]` — 每个节点包含 {id, type, name, filePath?, summary, tags[], complexity, languageNotes?}
  - 代码节点类型：file, function, class, module, concept
  - 非代码节点类型：config, document, service, table, endpoint, pipeline, schema, resource
  - 领域/知识节点类型：domain, flow, step, article, entity, topic, claim, source
  - ID 使用节点类型作为前缀，例如 `file:path`, `function:path:name`, `config:path`, `article:path`
- `edges[]` — 每个边包含 {source, target, type, direction, weight}
  - 关键类型：imports, contains, calls, depends_on, configures, documents, deploys, triggers, contains_flow, flow_step, related, cites
- `layers[]` — 每个层包含 {id, name, description, nodeIds[]}
- `tour[]` — 每个巡览步骤包含 {order, title, description, nodeIds[]}

## 如何高效阅读

1. 在读取完整文件之前，先用 Grep 在 JSON 中搜索相关条目
2. 只读取需要的部分——不要把整个图谱转储到上下文中
3. 节点名称和摘要是理解内容最有用的字段
4. 边告诉你组件如何连接——沿着 imports 和 calls 追踪依赖链

## 操作说明

1. **解析数据目录 `$UA_DIR`。** 运行 `UA_DIR=$([ -d .understand-anything ] && echo .understand-anything || echo .ua)` —— 如果旧版 `.understand-anything/` 已经存在，则使用它，否则使用新版 `.ua/`。检查 `$UA_DIR/knowledge-graph.json` 是否存在。如果不存在，告知用户先运行 `/understand`。

2. **在使用图谱派生的上下文之前检查图谱新鲜度**：
   - 从图谱元数据中读取 `project.gitCommitHash` 作为 `GRAPH_COMMIT_RAW`。先将其解析为一个提交，再用于任何 Git diff，然后将其与 `git rev-parse HEAD` 比较，并从项目根目录检查项目范围内的已提交更改和工作区更改：
     ```bash
     GRAPH_COMMIT=$(git rev-parse --verify --end-of-options "${GRAPH_COMMIT_RAW}^{commit}" 2>/dev/null)
     git rev-parse HEAD
     git diff --name-only "$GRAPH_COMMIT" HEAD -- .
     git diff --cached --name-only -- .
     git diff --name-only -- .
     git ls-files --others --exclude-standard -- .
     ```
   - `-- .` pathspec 是必需的：只影响同级 monorepo 项目的提交不得使该图谱失效。如果项目 diff 为空，仅哈希不匹配并不表示图谱过期。
   - 在每条命令的输出中忽略所选数据目录（`.ua/` 或旧版 `.understand-anything/`），因为它包含生成的图谱产物，而不是项目源码漂移。
   - 如果已提交 diff 或任何工作区命令报告了项目文件，在生成指南之前警告用户入门内容可能遗漏这些更改。建议：运行 `/understand` 刷新图谱。
   - 只有在 `GRAPH_COMMIT_RAW` 成功解析后才运行提交 diff。如果图谱提交或 Git 元数据缺失、无效或不可用，请给出简短的尽力而为警告并继续，而不是阻塞。

3. **读取项目元数据** —— 使用 Grep 或带行数限制的 Read 提取 `"project"` 部分（name, description, languages, frameworks）。

4. **读取 layers** —— Grep 搜索 `"layers"` 以获取完整的 layers 数组。它们定义了架构，并将作为指南的结构。

5. **读取 tour** —— Grep 搜索 `"tour"` 以获取引导式巡览步骤。它们提供了推荐的学习路径。

6. **只读取文件级结构节点** —— 使用 Grep 在知识图谱中查找具有文件级类型（`file`, `config`, `document`, `service`, `pipeline`, `table`, `schema`, `resource`, `endpoint`）的节点。跳过函数级和类级节点，以保持指南的高层次。提取每个节点的 `name`, `filePath`, `summary` 和 `complexity`。

7. **识别复杂度热点** —— 从文件级节点中找出 `complexity` 值最高的节点。这些是新开发者需要谨慎接触的区域。

8. **生成入门指南**，包含以下部分：
   - **项目概览**：名称、语言、框架、描述（来自项目元数据）
   - **架构层**：每个层的名称、描述和关键文件（来自 layers + 文件节点）
   - **关键概念**：重要模式和设计决策（来自节点摘要和 tags）
   - **引导式巡览**：分步讲解（来自 tour 部分）
   - **文件映射**：每个关键文件的作用（来自文件级节点，按层组织）
   - **复杂度热点**：需要谨慎接触的区域（来自 complexity 值）

9. 格式化为干净的 Markdown
10. 主动提供将指南保存到项目中的 `docs/UA_ONBOARDING.md`
11. 建议用户将其提交到仓库供团队使用
