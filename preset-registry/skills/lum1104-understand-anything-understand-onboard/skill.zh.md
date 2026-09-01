---
name: understand-onboard
description: Use when you need to generate an onboarding guide for new team members joining a project
---
# /understand-onboard

根据项目知识图谱生成一份全面的**入职指南**。

## 图结构参考

知识图谱 JSON 具有以下结构：
- `project` — {name, description, languages, frameworks, analyzedAt, gitCommitHash}
- `nodes[]` — 每个节点包含 {id, type, name, filePath?, summary, tags[], complexity, languageNotes?}
  - 代码节点类型：`file`, `function`, `class`, `module`, `concept`
  - 非代码节点类型：`config`, `document`, `service`, `table`, `endpoint`, `pipeline`, `schema`, `resource`
  - 领域/知识节点类型：`domain`, `flow`, `step`, `article`, `entity`, `topic`, `claim`, `source`
  - ID 以节点类型为前缀，例如 `file:path`, `function:path:name`, `config:path`, `article:path`
- `edges[]` — 每条包含 {source, target, type, direction, weight}
  - 关键类型：`imports`, `contains`, `calls`, `depends_on`, `configures`, `documents`, `deploys`, `triggers`, `contains_flow`, `flow_step`, `related`, `cites`
- `layers[]` — 每个包含 {id, name, description, nodeIds[]}
- `tour[]` — 每个包含 {order, title, description, nodeIds[]}

## 高效读取方法

1. 在读取完整文件前，先用 Grep 在 JSON 中搜索相关条目
2. 仅读取所需部分，不要将整张图一次性灌入上下文
3. 节点名称与摘要是理解内容最有价值的字段
4. 边表示组件之间的连接——沿着 `imports` 和 `calls` 跟踪依赖链

## 说明

1. **解析数据目录 `$UA_DIR`。** 执行 `UA_DIR=$([ -d .understand-anything ] && echo .understand-anything || echo .ua)`；该命令会在 `.understand-anything/` 已存在时使用其旧版本目录，否则使用新的 `.ua/`。检查 `$UA_DIR/knowledge-graph.json` 是否存在；若不存在，提示用户先运行 `/understand`。

2. **在使用图谱派生上下文前检查图谱新鲜度：**
   - 从图谱元数据读取 `project.gitCommitHash`，命名为 `GRAPH_COMMIT_RAW`。在用于任何 Git diff 前先将其解析为 commit，再与 `git rev-parse HEAD` 对比，并检查项目根目录下已提交与工作区变更：
     ```bash
     GRAPH_COMMIT=$(git rev-parse --verify --end-of-options "${GRAPH_COMMIT_RAW}^{commit}" 2>/dev/null)
     git rev-parse HEAD
     git diff --name-only "$GRAPH_COMMIT" HEAD -- .
     git diff --cached --name-only -- .
     git diff --name-only -- .
     git ls-files --others --exclude-standard -- .
     ```
   - `-- .` pathspec 是必需的：仅修改了同一 monorepo 内其他同级项目的 commit 不应令本项目图谱过时。当项目差异为空时，仅哈希不一致不应视为过时。
   - 在每个命令输出中都要忽略所选数据目录（`.ua/` 或旧版 `.understand-anything/`），因为其中是生成的图谱产物，不属于项目源码漂移。
   - 若提交差异或任意工作区命令报告了项目文件，请在生成指南前警告：入职内容可能遗漏这些变更，并建议运行：`/understand` 刷新图谱。
   - 仅当 `GRAPH_COMMIT_RAW` 成功解析为 commit 时才运行 commit diff。如果图谱 commit 或 Git 元数据缺失、无效或不可用，则给出简短的 best-effort 警告并继续，不要阻塞。

3. **读取项目元数据**——使用 Grep 或带行数限制的 Read 提取 `"project"` 区段（name、description、languages、frameworks）。

4. **读取层级信息**——使用 Grep 查找 `"layers"` 获取完整 layers 数组。它们定义了架构并将用于组织指南结构。

5. **读取导览路径**——使用 Grep 查找 `"tour"` 获取引导式学习步骤，提供推荐学习路径。

6. **只读取文件级结构节点**——在知识图中用 Grep 查找文件级类型节点（`file`, `config`, `document`, `service`, `pipeline`, `table`, `schema`, `resource`, `endpoint`），跳过函数级与类级节点以保持指南高层化。提取每个节点的 `name`、`filePath`、`summary` 和 `complexity`。

7. **识别复杂度热点**——从文件级节点中找出 `complexity` 值最高的节点，这些区域应提醒新开发者谨慎上手。

8. **生成入职指南**，包含以下部分：
   - **项目概览**：名称、语言、框架、描述（来自项目元数据）
   - **架构分层**：每层名称、描述与关键文件（来自 layers 与文件节点）
   - **关键概念**：重要模式与设计决策（来自节点摘要与 tags）
   - **导览路径**：逐步引导（来自 tour）
   - **文件映射**：各关键文件功能说明（来自文件级节点，按层组织）
   - **复杂度热点**：需重点关注的区域（来自 complexity 值）

9. 以清晰的 markdown 格式输出  
10. 提示是否将指南保存到项目中的 `docs/UA_ONBOARDING.md`  
11. 建议用户将其提交到仓库，便于团队共享
