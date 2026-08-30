---
name: using-n8n-mcp-skills
description: "Use when building, editing, validating, testing, or debugging an n8n workflow through the n8n-mcp MCP server — designing a flow, configuring a node, writing an expression or Code node, wiring credentials, or fixing one that misbehaves. The entry-point skill for the n8n-mcp-skills pack: it routes you to the right specialist skill, gives working knowledge of every n8n-mcp tool from turn one, and states the rules that keep workflows from breaking in production. Always consult it first on any n8n, workflow, node, or automation task — even a quick one-off, and even when the user names no skill — because n8n's surface drifts between versions and the specialist skills prevent silent failures."
---
# 使用 n8n-mcp 技能

这是一个**路由器**，而不是参考文档。它会告诉你即将执行的操作由哪个技能负责。技能正文包含实际指南——请使用 Skill 工具调用它们。如有疑问，宁可加载更多技能，也不要少加载。

社区 **n8n-mcp** 服务器和 n8n 本身的变化速度都快于任何模型的训练截止时间。工具名称、参数、节点 `typeVersion` 以及默认行为都会随着版本发布而变化。当你发现存在差异时——例如某个技能提到的工具不存在、参数形状与 `get_node` 返回的不一致、实际行为与技能描述不同——请以**实时工具**为准，告知用户，并建议更新技能包和实例。

## 不可妥协的规则

以下三条规则没有例外。每条规则都能避免一类看似正确、但在生产环境中会出问题的工作流。

1. **在执行任何 n8n 操作之前调用相关技能**——不只是 MCP 调用之前。在编写表达式、配置节点、设计工作流、连接节点，或编写 Code 之前，都要调用匹配的技能。PreToolUse 钩子会在影响最大的工具调用之前提醒你，但它们**仅存在于 Claude Code 插件安装中**。在其他所有环境中——包括 Claude.ai 技能上传，以及将此技能包作为 Agent Plugin 加载的任何客户端（Codex、Cursor、Copilot 及其他客户端）——都不会有任何提示，完全由你自行负责。除非你在本次会话中看到钩子触发，否则请假定当前没有钩子。
2. **在激活之前进行验证并核查。** 在激活之前运行 `validate_workflow`（或按 id 调用 `n8n_validate_workflow`），并在每次创建或更新之后调用 `n8n_get_workflow`，检查 `connections` 对象。仅验证会遗漏静默丢失的连线、Merge 索引偏移一位，以及从未连接的错误输出。验证通过只意味着 JSON 格式正确——并不意味着工作流正确。
3. **机密信息绝不能放入文本字段。** Token、API 密钥和密码始终要通过 n8n 凭据系统传递。如果不存在原生节点，请使用带有官方凭据类型的 HTTP Request 节点。使用 `{{ $json.token }}` 引用 Token 的 Set 节点，只是多了几步的泄露。请参阅 `n8n-mcp-tools-expert`。

## 依赖技能，而不是训练数据

n8n 在不断变化。“记住的”参数名称通常会悄无声息地出错——它们会作为普通字符串通过验证，然后在运行时不起作用。请相信技能和实时工具（`get_node`、`search_nodes`、`tools_documentation`），而不是凭回忆。如果某个技能与记忆相矛盾，请相信技能。如果 `get_node` 与某个技能相矛盾，请相信工具，并标记这一差异。

## 强默认规则

每个技能都拥有自己的例外情况；以下是默认规则。

- **Code 节点是最后手段。** 优先使用表达式，然后是在 Edit Fields 中使用箭头函数，只有当这两者都无法完成任务时才使用 Code 节点。请参阅 `n8n-code-javascript`。
- **向 0–1 个消费者提供数据的 Set 节点几乎总是错误的。** 应直接在消费者中内联表达式。请参阅 `n8n-expression-syntax`。
- **逐项迭代是自动进行的。** 当默认的逐项执行已经可以处理这种情况时，不要为了“让它循环”而添加 Loop Over Items 节点。
- **根据实时 schema 进行配置，绝不要凭记忆。** 在设置参数之前先调用 `get_node`。请参阅 `n8n-node-configuration`。

## 红旗信号：“正要 ___” → 调用 ___

如果你发现自己正在这样想，请停下来，先调用指定的 skill。

| 想法 | 调用 |
|---|---|
| “这个工作流很简单，我直接构建就好” | `n8n-workflow-patterns` — 大多数“简单”流程上线时都有 10 个以上节点 |
| “我添加一个 Set 节点来映射这些字段” | `n8n-expression-syntax` — Set 的输出仅供 ≤1 个下游节点使用，是最常见的反模式 |
| “我直接用一个 Code 节点，更简单” | `n8n-code-javascript` — 标准要求很高；大多数场景其实用表达式或 Edit Fields 就够了 |
| “用户提到了数据，我来写 Python” | `n8n-code-javascript` — 默认使用 JS；只有明确要求时才使用 Python (`n8n-code-python`) |
| “我正在编写供 AI agent 调用的代码” | `n8n-code-tool` — 其运行时契约与 Code 节点不同 |
| “日期计算——我放一个 DateTime 节点进去” | `n8n-expression-syntax` — 几乎总是直接使用内联 Luxon 更合适 |
| “我用 3 个来源连接一个 Merge” | `n8n-node-configuration` — Merge 默认只有 2 个输入；第三个输入会被静默丢弃 |
| “验证通过了，我可以激活了” | `n8n-validation-expert` + `n8n-workflow-patterns` — 运行反模式扫描 |
| “验证抛出了一个我不理解的错误” | `n8n-validation-expert` — 了解每个错误和警告的含义，以及哪些必须修复、哪些属于最佳实践建议 |
| “我在这里引用 `$json.x`” | `n8n-expression-syntax` — 在包含分支的工作流中，优先使用 `$('Node').item.json.x` |
| “这个 webhook/定时流程只处理成功路径就够了” | `n8n-error-handling` — 为每个可能失败的节点连接错误分支；4xx 是调用方错误，5xx 是你的错误 |
| “我把这个文件/图像作为 JSON 传递就好” | `n8n-binary-and-data` — 文件内容位于 `$binary` 中，并且无法跨越 agent-tool 边界 |
| “我连接一个 AI agent，再给模型一些工具” | `n8n-agents` — 工具名称和描述就是提示词；memory、结构化输出和拓扑结构中都有容易踩坑的地方 |
| “我把这段逻辑复制到另一个工作流中” / “这个工作流越来越大了” | `n8n-subworkflows` — 提取一个可复用的子工作流；构建前先搜索 |
| “我创建那个 credential / 打开那个 workflow” （账户有 >1 个实例） | `n8n-multi-instance` — 每次调用都会命中当前指定的实例；读取操作会静默路由到错误实例，而存在歧义的 credential 写入会以 `INSTANCE_AMBIGUOUS` 失败并安全终止 |

## Skill 索引

| Skill | 在以下情况下使用 |
|---|---|
| `using-n8n-mcp-skills` | 此路由器（自动加载）。指出负责你当前任务的 skill。 |
| `n8n-mcp-tools-expert` | 选择或调用任何 n8n-mcp 工具；节点发现；credentials；数据表；安全审计；模板 |
| `n8n-workflow-patterns` | 设计或构建工作流；选择架构（webhook / HTTP API / 数据库 / AI agent / 定时 / 批处理） |
| `n8n-node-configuration` | 配置任何节点；了解与操作相关的必填字段；属性依赖关系；精准修改字段 |
| `n8n-expression-syntax` | 编写 `{{ }}`、`$json`/`$node`/`$now`；在节点之间映射数据；转换守门规则；Set 节点规范 |
| `n8n-validation-expert` | 解读验证错误/警告；误报；验证循环；自动修复；审查现有工作流 |
| `n8n-code-javascript` | 在 Code 节点中使用 JavaScript；访问数据；`this.helpers`；DateTime；SplitInBatches 循环模式 |
| `n8n-code-python` | 明确要求使用 Python 的 Code 节点；标准库限制 |
| `n8n-code-tool` | 可由 AI agent 调用的 Custom Code Tool (`toolCode`) — 返回字符串，不使用 `$fromAI`/`$input` |
| `n8n-error-handling` | Webhook/API 或无人值守工作流；连接错误输出；重试；4xx/5xx 响应结构；静默失败 |
| `n8n-binary-and-data` | 文件、图像、PDF、附件、上传/下载、视觉；向 agent tool 传入或从中传出文件 |
| `n8n-subworkflows` | 可复用/多步骤构建；Execute Workflow；提取共享逻辑；Define-Below 输入；all-vs-each；将工作流公开为 agent tool |
| `n8n-agents` | AI Agent / LLM-with-tools / Text Classifier；工具设计与 `$fromAI`；系统提示词；结构化输出；memory；RAG；人工审核；聊天机器人 |
| `n8n-multi-instance` | 包含多个实例的账户（存在 `n8n_instances` 工具）；切换目标实例；credential 写入前进行验证；从意外的 `NOT_FOUND`、错误/空的读取结果或 `INSTANCE_AMBIGUOUS` credential 写入失败并安全终止中恢复 |
| `n8n-self-hosting` | *部署，而非工作流构建* — 在 VM 上自行托管/安装/部署 n8n（Docker Compose + Caddy、单节点模式与队列模式），或更新/备份/加固 n8n。该 skill 会自行触发；不属于上述构建流程的一部分。 |

## n8n-mcp 工具——从第一轮开始掌握的工作知识

限定名称的格式为 `mcp__<server>__<tool>`（`<server>` 通常是 `n8n-mcp`）。这解决了工具完整描述直到首次使用时才加载的问题。

**两个层级，以及如何判断你拥有哪一个。** 下面的文档和验证工具离线即可工作，并且始终存在。`n8n_*` 管理工具需要与正在运行的 n8n 实例通信，**只有在连接了一个实例后才会出现**。如果这些工具不存在，并不表示出现了故障，也没有需要重试的操作——请明确说明这一点，并根据用户的安装方式指出正确的解决方法：

- **托管版 (`https://api.n8n-mcp.com/mcp`)** — 通过客户端首次使用时显示的 OAuth 提示登录，然后在控制面板中连接 n8n 实例。不需要环境变量，也不要将 API 密钥粘贴到配置文件中。
- **自托管版 (`npx n8n-mcp`, Docker)** — 服务器需要在其环境中配置 `N8N_API_URL` 和 `N8N_API_KEY`，并在客户端启动前导出这些变量。

`n8n_health_check` 可确认连接是否正常，并返回解析出的实例。

**发现与文档**
- `tools_documentation` — 每个工具的元文档；使用 `{topic:"ai_agents_guide", depth:"full"}` 获取代理指南。
- `search_nodes` — 按关键字查找节点。
- `get_node` — 节点信息。接受单个**短格式** `nodeType`（`nodes-base.httpRequest`, `nodes-langchain.agent`），以及 `detail`（minimal/standard/full）和 `mode`（info/docs/search_properties/versions）。
- `validate_node` — 独立验证单个节点的配置（配置档案：minimal/runtime/ai-friendly/strict）。
- `search_templates` / `get_template` — 模板库（按关键字、节点、任务、元数据查找）。

**构建与编辑**
- `n8n_create_workflow` — 根据完整的工作流 JSON 创建工作流。
- `n8n_update_partial_workflow` — 增量差异操作（`{id, operations:[…]}`）：addNode、updateNode、patchNodeField、addConnection、setNodeGroups、activateWorkflow 等。编辑时优先使用。
- **画布分组**（n8n 2.28+）会在编辑过程中保留，无需管理：被移除的分组节点会从其分组中清除，而 n8n 不再接受的分组会被取消分组，以确保编辑仍能应用——节点和连接不会改变，每项调整都会在 `details.warnings` 中报告。要创建或更改分组，请使用 `setNodeGroups` 操作（完整替换；`[]` 会取消所有分组）。参见 `n8n-mcp-tools-expert`。
- `n8n_update_full_workflow` — 完整替换。
- `n8n_autofix_workflow` — 自动修复常见问题。
- `n8n_deploy_template` — 将模板部署到实例。

**验证**（必要但并不充分——始终与反模式扫描配合使用）
- `validate_workflow` — 输入完整 JSON，输出错误/警告/修复结果。此处的节点类型使用**长格式**（`n8n-nodes-base.set`）。
- `n8n_validate_workflow` — 通过 `{id}` 验证已部署的工作流（无需检查节点 JSON）。

**检查与生命周期**
- `n8n_get_workflow` — 获取工作流（full / structure / active / filtered / minimal）。使用它在编辑后验证 `connections`；`mode="filtered"` + `nodeNames` 可读取一个较大的节点（例如较长的 Code 源代码），而无需拉取整个工作流，以免客户端侧发生截断。
- `n8n_list_workflows` — 列出/筛选工作流（复制逻辑前先进行搜索）。
- `n8n_delete_workflow`、`n8n_workflow_versions`（历史记录/回滚/差异；`source: "local"` = n8n-mcp 自有的快照，`source: "native"` = n8n 自有的历史记录，包括用户在 UI 中所做的编辑——参见 `n8n-mcp-tools-expert`）、`n8n_instances`（仅适用于多实例账户：列出/切换目标实例——参见 `n8n-multi-instance`）、`n8n_health_check`（返回已解析的 `instanceName`，以及一个 `officialMcp` 区块，用于说明下方的实例级 MCP 服务器是否已配置并可访问）。

**测试与运行**
- `n8n_test_workflow` — 运行真实节点（Code、HTTP、数据库写入、发送操作都会实际执行）。存在副作用时，运行前询问用户。`method` 用于选择路径：`auto`（默认）和 `trigger` 会通过 HTTP 触发 **active** 工作流中的 webhook/form/chat 触发器；`prepare`/`pinned`/`direct` 则通过 n8n 自己的 MCP 服务器执行，可以运行完全没有 HTTP 触发器的工作流（Manual、Schedule、sub-workflow）——参见 `n8n-mcp-tools-expert`。
- `n8n_executions` — 列出/检查执行记录。**不存在 `execute_workflow` 工具。**
- `n8n_evaluations` — 评估测试运行：列出运行记录、聚合指标、逐案例结果（n8n ≥ 2.30），以及用于启动或停止运行的 `run`/`cancel`（n8n ≥ 2.32）。`run` 会让工作流针对其完整数据集执行——真实节点会实际运行，因此需要先询问用户。403 可能意味着 API 密钥是在该操作所需的最低版本之前创建的（请为 testRun 作用域重新创建密钥）、当前套餐未授权使用 evaluations，或密钥所有者无权访问该工作流——对于 `run`/`cancel`，具体来说需要 `workflow:execute` 作用域。

**数据、文件夹、凭据、审计**
- `n8n_manage_datatable` — Data Table 的 CRUD、筛选和 dry-run。`addColumn`/`deleteColumn`/`renameColumn` 会通过 n8n 的 MCP 服务器修改现有表的列（Public API 无法执行这些操作）——`deleteColumn` 会连同列中的值一起删除。
- `n8n_manage_folders` — 工作流文件夹 CRUD，并包含内容计数（n8n ≥ 2.19，已注册的 Community 层级及更高层级；`projectId` 默认为 `personal`）。通过 `n8n_create_workflow` 中的 `parentFolderId` 或 `moveToFolder` 操作放置工作流（n8n ≥ 2.32）。放置操作是只写的——通过文件夹的 `get` 计数进行验证，绝不要通过读取工作流来验证。未提供 `transferToFolderId` 的 `delete` 会将该文件夹中的工作流移至项目根目录并将其 ARCHIVES——它们仍然存在，但已停用（`transferToFolderId: "0"` = 转移到项目根目录但不归档）。
- `n8n_manage_credentials` — 凭据 CRUD + `getSchema` 发现。
- `n8n_audit_instance` — 安全审计（硬编码密钥、未进行身份验证的 webhooks、错误处理缺口）。

**实例级 MCP 服务器** — 与 Public API 并列的第二个端点，由 `N8N_MCP_ACCESS_TOKEN` 控制访问（n8n 2.34+）。`n8n_health_check` 会报告其是否可访问；没有该令牌时，这些调用会返回 `NOT_CONFIGURED`，而不是以晦涩的方式失败。
- `n8n_manage_agents` — 持久化的 n8n **Agents**：一种具有自身生命周期（模型、指令、技能、任务、记忆、频道）的独立助手工件，**不是** AI Agent 工作流节点。`call` 会使用真实凭据实时运行它，并可能返回 `approvals[]`；仅当用户要求时才执行 `publish`。参见 `n8n-agents`。
- `n8n_explore_node_resources` — 通过真实凭据解析节点的实时下拉选项/资源定位器值，而不是猜测 ID。参见 `n8n-node-configuration`。
- `n8n_list_catalog` — 列出 `projects`（以获取 `projectId`）或 `tags`。这里唯一一个无需令牌也能使用的工具。
- 同一个服务器还支持 `n8n_test_workflow` 的 `prepare`/`pinned`/`direct`、`n8n_workflow_versions` 的 `source: "native"`，以及 `n8n_manage_datatable` 的列操作。这些操作还会按工作流受其“Available in MCP”设置的控制；拒绝时会返回 `WORKFLOW_NOT_EXPOSED`，而启用该设置（`exposeToMcp: true`）是可见且持久的更改——请先询问用户。

> **节点类型格式陷阱：** `get_node` / `validate_node` 接受 SHORT 格式（`nodes-base.set`）；  
> `validate_workflow` / `n8n_create_workflow` 中的工作流 JSON 使用 LONG 格式  
>（`n8n-nodes-base.set`）。混用这两种格式是一个常见且不会显式报错的错误——请参阅 `n8n-mcp-tools-expert`。

## 按顺序执行协议

1. 从索引中识别匹配的 skill，并在第一次 MCP 调用**之前调用它**。
2. 如果不确定工具表面情况，每个会话浏览一次 `tools_documentation` 以刷新工具信息。
3. 在配置任何节点之前先调用 `get_node`——读取实时 schema，不要想当然。
4. 构建 / 编辑后，在激活之前先调用 **`validate_workflow`**，然后调用 **`n8n_get_workflow`** 检查 `connections`。
5. 发现任何偏差都要指出（缺失的工具、发生变化的参数、行为不一致）。

## 不确定时

- **找不到用户在 UI 中创建的工作流？** 最常见的原因是未开启按工作流配置的 MCP 访问权限。请让用户在 n8n 中打开该工作流，进入 Settings，并启用 MCP 访问权限。
- **用户说它坏了？** 相信用户。根据 `get_node` 重新检查参数，追踪数据引用，检查执行情况。请参阅 `n8n-validation-expert`。
- **没有合适的 skill，且任务并不简单？** 先询问，不要猜测。

这些是带有明确倾向的最佳实践，而不是硬性规定。有不同意见？这全都是 markdown——编辑该 skill。