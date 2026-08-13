---
name: understand-explain
description: Use when you need a deep-dive explanation of a specific file, function, or module in the codebase
argument-hint: "[file-path]"
---
# /understand-explain

对特定代码组件提供深入、全面的解释。

## 图结构参考

知识图谱 JSON 的结构如下：
- `project` — {name, description, languages, frameworks, analyzedAt, gitCommitHash}
- `nodes[]` — 每个节点包含 {id, type, name, filePath?, summary, tags[], complexity, languageNotes?}
  - 代码节点类型：file、function、class、module、concept
  - 非代码节点类型：config、document、service、table、endpoint、pipeline、schema、resource
  - 领域/知识节点类型：domain、flow、step、article、entity、topic、claim、source
  - ID 使用节点类型作为前缀，例如 `file:path`、`function:path:name`、`config:path`、`article:path`
- `edges[]` — 每个包含 {source, target, type, direction, weight}
  - 关键类型：imports、contains、calls、depends_on、configures、documents、deploys、triggers、contains_flow、flow_step、related、cites
- `layers[]` — 每个包含 {id, name, description, nodeIds[]}
- `tour[]` — 每个包含 {order, title, description, nodeIds[]}

## 高效阅读方法

1. 在读取完整文件之前，先使用 `Grep` 在 JSON 中搜索相关条目
2. 只读取需要的部分，不要把整个图谱一次性放入上下文
3. 节点名称和摘要字段是理解的最有用字段
4. 边记录了组件之间如何连接——按 `imports` 和 `calls` 跟进依赖链

## 指令

1. **解析数据目录 `$UA_DIR`。** 运行 `UA_DIR=$([ -d .understand-anything ] && echo .understand-anything || echo .ua)` —— 当已存在旧版 `.understand-anything/` 时使用它，否则使用新版 `.ua/`。检查 `$UA_DIR/knowledge-graph.json` 是否存在；如果不存在，请告知用户先运行 `/understand`。

2. **在使用基于图谱的上下文前检查图谱新鲜度**：
   - 从图谱元数据读取 `project.gitCommitHash` 作为 `GRAPH_COMMIT_RAW`。在使用该值进行任何 Git diff 前先解析为提交，再与 `git rev-parse HEAD` 对比，并检查项目根目录下已提交与工作区变更：
     ```bash
     GRAPH_COMMIT=$(git rev-parse --verify --end-of-options "${GRAPH_COMMIT_RAW}^{commit}" 2>/dev/null)
     git rev-parse HEAD
     git diff --name-only "$GRAPH_COMMIT" HEAD -- .
     git diff --cached --name-only -- .
     git diff --name-only -- .
     git ls-files --others --exclude-standard -- .
     ```
   - `-- .` 的路径限定符是必需的：只改动同级单体项目的提交不应使此图谱变为过期。仅因哈希不一致并不足以说明图谱过期，只要项目差异为空即可。
   - 在每条命令的输出中忽略所选数据目录（`.ua/` 或旧版 `.understand-anything/`），因为它只包含生成的图谱工件，不是项目源码漂移。
   - 如果已提交 diff 或任何工作区命令报告了项目文件，在说明前先给出警告：图谱衍生上下文可能会遗漏这些变更。建议：运行 `/understand` 以刷新图谱。
   - 仅当 `GRAPH_COMMIT_RAW` 成功解析为提交时才运行提交差异比较。如果图谱提交或 Git 元数据缺失、无效或不可用，请给出简短的尽量完整提示并继续执行，不要阻塞。

3. **查找目标节点**——使用 `Grep` 在知识图谱中搜索组件：`$ARGUMENTS`
   - 对于文件路径（例如 `src/auth/login.ts`）：按 `filePath` 匹配
   - 对于函数标注（例如 `src/auth/login.ts:verifyToken`）：在 `name` 字段中按函数名搜索，并按文件路径筛选
   - 记录准确的节点 `id`、`type`、`summary`、`tags` 和 `complexity`

4. **查找所有连接边**——在 edges 中用 `Grep` 搜索目标节点 ID：
   - `"source"` 命中 → 表示该节点调用/导入/依赖的对象（出边）
   - `"target"` 命中 → 表示调用该节点/导入该节点/依赖该节点的对象（入边）
   - 记录连接的节点 ID 和边类型

5. **读取连接节点**——对第 4 步中得到的每个连接节点 ID，用 `Grep` 在 nodes 部分读取其 `name`、`summary` 和 `type`，构建该组件的邻域上下文。

6. **识别所属层**——在 `layers` 部分用目标节点 ID 执行 `Grep`，找到其所属的架构层及该层描述。

7. **读取实际源文件**——读取该节点 `filePath` 指向的源文件以进行深入剖析。

8. **解释组件在上下文中的作用**：
   - 说明其在架构中的角色（属于哪一层、存在原因）
   - 说明内部结构（它包含的函数、类——来自 `contains` 边）
   - 说明外部连接（它导入了什么、被谁调用、依赖什么——来自边）
   - 说明数据流（输入 → 处理 → 输出——基于源代码）
   - 用于说明时假设读者可能不了解该编程语言
   - 突出需要理解的模式、惯用法或复杂点
