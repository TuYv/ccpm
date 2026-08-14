---
name: using-n8n-mcp-skills
description: "Use when building, editing, validating, testing, or debugging an n8n workflow through the n8n-mcp MCP server — designing a flow, configuring a node, writing an expression or Code node, wiring credentials, or fixing one that misbehaves. The entry-point skill for the n8n-mcp-skills pack: it routes you to the right specialist skill, gives working knowledge of every n8n-mcp tool from turn one, and states the rules that keep workflows from breaking in production. Always consult it first on any n8n, workflow, node, or automation task — even a quick one-off, and even when the user names no skill — because n8n's surface drifts between versions and the specialist skills prevent silent failures."
---
# 使用 n8n-mcp 技能

这是一个**路由器**，而不是参考文档。它会告诉你，即将执行的操作应遵循哪个技能的规则。技能正文中包含实际指导——请使用 Skill 工具调用它们。如有疑问，宁可多加载一些技能，也不要少加载。

社区版 **n8n-mcp** 服务器和 n8n 本身的更新速度都快于任何模型的训练数据截止时间。工具名称、参数、节点 `typeVersion` 以及默认行为都会随版本发布而变化。当你发现偏差时——例如技能中提到的工具不存在、参数结构与 `get_node` 返回的结果不匹配，或实际行为与技能描述不同——请信任**实时工具**，告知用户，并建议更新技能包和实例。

## 不可妥协的规则

以下三条规则没有例外。每一条都能避免一类看似正确、却会在生产环境中出问题的工作流。

1. **执行任何 n8n 操作之前，都要调用相关技能**——而不只是在调用 MCP 之前。
   在编写表达式、配置节点、设计工作流、连接节点或编写 Code 之前，请调用对应的技能。PreToolUse 钩子会在影响最大的工具调用上提醒你，但它们**仅存在于 Claude Code 插件安装方式中**。在其他任何环境中——包括上传到 Claude.ai 的技能，以及任何将此技能包作为 Agent Plugin 加载的客户端（Codex、Cursor、Copilot 等）——都不会有任何机制提醒你，责任完全在你自己。除非你在本次会话中已看到钩子触发，否则应假定当前没有钩子。
2. **激活前必须进行验证并核查。** 激活前运行 `validate_workflow`（或按 id 运行
   `n8n_validate_workflow`），并在每次创建或更新后调用 `n8n_get_workflow`，检查
   `connections` 对象。仅靠验证无法发现被静默丢弃的连线、Merge 索引差一错误，以及从未连接的错误输出。验证通过只表示 JSON 格式正确——并不表示工作流正确。
3. **绝不能将密钥放入文本字段。** 令牌、API 密钥和密码必须始终通过 n8n 凭据系统处理。如果没有原生节点，请使用带有官方凭据类型的 HTTP Request 节点。用 Set 节点保存令牌，再通过 `{{ $json.token }}` 引用，只不过是多绕了几步的泄露。请参阅 `n8n-mcp-tools-expert`。

## 依靠技能，而不是训练数据

n8n 不断变化。“凭记忆”写出的参数名称往往会悄无声息地出错——它们能以普通字符串的形式通过验证，却在运行时毫无作用。相比回忆，应信任技能和实时工具（`get_node`、`search_nodes`、`tools_documentation`）。如果技能与你的记忆冲突，请信任技能。如果 `get_node` 与技能冲突，请信任工具并指出这一偏差。

## 强烈推荐的默认做法

每项技能都规定了各自的例外情况；以下是默认做法。

- **Code 节点是最后的手段。** 首先使用表达式，其次在 Edit Fields 中使用箭头函数，只有两者都无法完成任务时才使用 Code 节点。请参阅 `n8n-code-javascript`。
- **为 0–1 个消费者提供数据的 Set 节点几乎总是错误的。** 应改为直接在消费者中内联表达式。请参阅 `n8n-expression-syntax`。
- **逐项迭代会自动进行。** 当默认的逐项执行已经能够处理相应情况时，不要为了“让它循环”而添加 Loop Over Items 节点。
- **始终依据实时模式进行配置，绝不要依赖记忆。** 设置参数前先调用 `get_node`。请参阅 `n8n-node-configuration`。

## 危险信号：「即将 ___」→ 调用 ___

如果你发现自己产生了以下任何想法，请停下来，先调用指定的技能。

| 想法 | 调用 |
|---|---|
| 「这个工作流很简单，我直接构建就好」 | `n8n-workflow-patterns` — 大多数「简单」流程最终都会包含 10 个以上的节点 |
| 「我会添加一个 Set 节点来映射这些字段」 | `n8n-expression-syntax` — 仅向 ≤1 个下游节点提供数据的 Set 节点是头号反模式 |
| 「我直接使用 Code 节点吧，这样更简单」 | `n8n-code-javascript` — 使用门槛很高；大多数此类需求用表达式或 Edit Fields 即可完成 |
| 「用户提到了数据，我就用 Python 编写」 | `n8n-code-javascript` — 默认使用 JS；只有用户明确要求时才使用 Python（`n8n-code-python`） |
| 「我正在编写供 AI agent 调用的代码」 | `n8n-code-tool` — 它与 Code 节点的运行时契约不同 |
| 「日期运算——我添加一个 DateTime 节点吧」 | `n8n-expression-syntax` — 几乎总是应该直接内联使用 Luxon |
| 「我要把 3 个数据源连接到 Merge」 | `n8n-node-configuration` — Merge 默认只有 2 个输入；第 3 个输入会被静默丢弃 |
| 「验证已通过，可以激活了」 | `n8n-validation-expert` + `n8n-workflow-patterns` — 运行反模式扫描 |
| 「验证抛出了一个我不理解的错误」 | `n8n-validation-expert` — 了解每个错误和警告的含义，以及哪些必须修复、哪些只是最佳实践建议 |
| 「我要在这里引用 `$json.x`」 | `n8n-expression-syntax` — 在分支较多的工作流中，优先使用 `$('Node').item.json.x` |
| 「这个 webhook/定时流程只需处理成功路径」 | `n8n-error-handling` — 为每个可能失败的节点连接错误分支；4xx 是调用方的错误，5xx 是你的错误 |
| 「我要把这个文件/图像作为 JSON 传递」 | `n8n-binary-and-data` — 文件内容位于 `$binary` 中，并且无法跨越 agent-tool 边界 |
| 「我要连接一个 AI agent，并给模型提供一些工具」 | `n8n-agents` — 工具名称和描述本身就是提示词；记忆、结构化输出和拓扑结构中都存在陷阱 |
| 「我要把这段逻辑复制到另一个工作流中」/「这个工作流变得越来越大了」 | `n8n-subworkflows` — 将其提取为可复用的子工作流；构建前先搜索 |
| 「我要创建该凭据 / 打开该工作流」（账户拥有 >1 个实例） | `n8n-multi-instance` — 每次调用都会发送到当前目标实例；读取请求发错实例时不会报错，而存在歧义的凭据写入会以 `INSTANCE_AMBIGUOUS` 失败并关闭 |

## 技能索引

| 技能 | 适用场景 |
|---|---|
| `using-n8n-mcp-skills` | 此路由器（自动加载）。它会指出负责你当前任务的技能。 |
| `n8n-mcp-tools-expert` | 选择或调用任何 n8n-mcp 工具；节点发现；凭据；数据表；安全审计；模板 |
| `n8n-workflow-patterns` | 设计或构建工作流；选择架构（webhook / HTTP API / database / AI agent / scheduled / batch） |
| `n8n-node-configuration` | 配置任何节点；与操作相关的必填字段；属性依赖关系；精确的字段编辑 |
| `n8n-expression-syntax` | 编写 `{{ }}`、`$json`/`$node`/`$now`；在节点之间映射数据；转换操作的把关者；Set 节点使用规范 |
| `n8n-validation-expert` | 解读验证错误/警告；误报；验证循环；自动修复；审查现有工作流 |
| `n8n-code-javascript` | 任何使用 JavaScript 的 Code 节点；数据访问；`this.helpers`；DateTime；SplitInBatches 循环模式 |
| `n8n-code-python` | 明确要求使用 Python 的 Code 节点；标准库限制 |
| `n8n-code-tool` | 可由 AI agent 调用的 Custom Code Tool（`toolCode`）——返回字符串，不支持 `$fromAI`/`$input` |
| `n8n-error-handling` | Webhook/API 或无人值守的工作流；连接错误输出；重试；4xx/5xx 响应结构；静默失败 |
| `n8n-binary-and-data` | 文件、图像、PDF、附件、上传/下载、视觉处理；向 agent tool 传递文件或从中接收文件 |
| `n8n-subworkflows` | 可复用 / 多步骤构建；Execute Workflow；提取共享逻辑；Define-Below 输入；全部执行与逐项执行；将工作流公开为 agent tool |
| `n8n-agents` | AI Agent / 带工具的 LLM / Text Classifier；工具设计与 `$fromAI`；系统提示词；结构化输出；记忆；RAG；人工审核；聊天机器人 |
| `n8n-multi-instance` | 拥有多个实例的账户（存在 `n8n_instances` 工具）；切换目标实例；写入凭据前进行验证；从意外的 `NOT_FOUND`、错误/空读取结果或因 `INSTANCE_AMBIGUOUS` 而失败并关闭的凭据写入中恢复 |
| `n8n-self-hosting` | *部署，而非工作流构建* — 在 VM 上自托管 / 安装 / 部署 n8n（Docker Compose + Caddy、单机模式与队列模式），或对其进行更新 / 备份 / 加固。它会自行触发；不属于上述构建流程的一部分。 |

## n8n-mcp 工具——从第一轮开始就应掌握的知识

限定名称的形式类似于 `mcp__<server>__<tool>`（`<server>` 通常是 `n8n-mcp`）。这弥补了工具的完整描述在首次使用前不会加载所造成的信息缺口。

**两类工具，以及如何判断你拥有哪一类。** 下方的文档和验证工具可离线工作，并且始终存在。`n8n_*` 管理工具需要与实时 n8n 实例通信，且**仅在实例连接后才会出现**。如果这些工具不存在，并不代表出现了故障，也无需重试——请直接说明这一点，并根据用户的安装方式引导其采用正确的解决方法：

- **托管版（`https://api.n8n-mcp.com/mcp`）**——通过客户端首次使用时显示的 OAuth 提示登录，然后在控制面板中连接 n8n 实例。无需设置环境变量，也无需将 API 密钥粘贴到配置文件中。
- **自行托管（`npx n8n-mcp`、Docker）**——服务器环境中必须有 `N8N_API_URL` 和 `N8N_API_KEY`，并且需要在客户端启动前将其导出。

`n8n_health_check` 可确认连接正常，并返回解析得到的实例。

**发现与文档**
- `tools_documentation`——所有工具的元文档；使用 `{topic:"ai_agents_guide", depth:"full"}` 获取智能体指南。
- `search_nodes`——通过关键词查找节点。
- `get_node`——节点信息。接受单个**短格式** `nodeType`（`nodes-base.httpRequest`、`nodes-langchain.agent`），以及 `detail`（minimal/standard/full）和 `mode`（info/docs/search_properties/versions）。
- `validate_node`——单独验证一个节点的配置（配置方案：minimal/runtime/ai-friendly/strict）。
- `search_templates` / `get_template`——模板库（可按关键词、节点、任务、元数据查询）。

**构建与编辑**
- `n8n_create_workflow`——根据完整的工作流 JSON 创建工作流。
- `n8n_update_partial_workflow`——增量差异操作（`{id, operations:[…]}`）：addNode、updateNode、patchNodeField、addConnection、setNodeGroups、activateWorkflow 等。编辑时优先使用。
- **画布分组**（n8n 2.28+）无需管理即可在编辑后保留：删除已分组的节点时，该节点会从所属分组中移除；当某个分组不再能被 n8n 接受时，该分组会被解除，以确保编辑仍能生效——节点和连接保持不变，每项调整都会在 `details.warnings` 中报告。要创建或更改分组，请使用 `setNodeGroups` 操作（完整替换；`[]` 会解除所有分组）。请参阅 `n8n-mcp-tools-expert`。
- `n8n_update_full_workflow`——完整替换。
- `n8n_autofix_workflow`——自动修复常见问题。
- `n8n_deploy_template`——将模板部署到实例。

**验证**（必要但不充分——始终需要配合反模式扫描）
- `validate_workflow`——输入完整 JSON，输出错误、警告和修复项。此处的节点类型使用**长格式**（`n8n-nodes-base.set`）。
- `n8n_validate_workflow`——通过 `{id}` 验证已部署的工作流（不检查节点 JSON）。

**检查与生命周期**
- `n8n_get_workflow`——获取工作流（full / structure / active / filtered / minimal）。编辑后使用它验证 `connections`；通过 `mode="filtered"` + `nodeNames` 可只读取一个内容量大的节点（例如包含较长 Code 源代码的节点），而不必拉取整个工作流，以免在客户端被截断。
- `n8n_list_workflows`——列出/筛选工作流（避免逻辑重复前应先搜索）。
- `n8n_delete_workflow`、`n8n_workflow_versions`（历史记录/回滚）、`n8n_instances`（仅限多实例账户：列出/切换目标实例——请参阅 `n8n-multi-instance`）、`n8n_health_check`（返回解析得到的 `instanceName`）。

**测试与运行**
- `n8n_test_workflow` — 运行真实节点（Code、HTTP、数据库写入、发送等操作都会实际触发）。存在副作用时，运行前须征得用户同意。
- `n8n_executions` — 列出/检查执行记录。**不存在 `execute_workflow` 工具。**
- `n8n_evaluations` — 评估测试运行：列出运行、聚合指标、逐用例结果（n8n ≥ 2.30），以及用于启动或停止运行的 `run`/`cancel`（n8n ≥ 2.32）。`run` 会针对整个数据集执行工作流——真实节点会实际触发，因此须先征得用户同意。403 可能表示 API 密钥是在该操作要求的最低版本之前创建的（请重新创建密钥以获取 testRun 作用域）、当前套餐未授权使用评估功能，或密钥所有者无权访问该工作流——对于 `run`/`cancel`，具体需要 `workflow:execute` 作用域。

**数据、文件夹、凭据、审计**
- `n8n_manage_datatable` — 数据表 CRUD、筛选、试运行。
- `n8n_manage_folders` — 工作流文件夹 CRUD，并提供内容数量统计（n8n ≥ 2.19，已注册的 Community 层级及以上；`projectId` 默认为 `personal`）。通过 `n8n_create_workflow` 的 `parentFolderId` 或 `moveToFolder` 操作（n8n ≥ 2.32）放置工作流。放置信息是只写的——请通过文件夹的 `get` 数量统计进行验证，切勿通过读取工作流来验证。使用不带 `transferToFolderId` 的 `delete` 会将该文件夹中的工作流移动到项目根目录并将其归档——这些工作流仍然存在，但会被停用（`transferToFolderId: "0"` = 转移到项目根目录且不归档）。
- `n8n_manage_credentials` — 凭据 CRUD + `getSchema` 发现。
- `n8n_audit_instance` — 安全审计（硬编码密钥、未经身份验证的 Webhook、错误处理缺口）。

> **节点类型形式陷阱：** `get_node` / `validate_node` 使用短形式（`nodes-base.set`）；
> `validate_workflow` / `n8n_create_workflow` 中的工作流 JSON 使用长形式
> （`n8n-nodes-base.set`）。混用它们是一种常见且不会报错的错误——请参阅 `n8n-mcp-tools-expert`。

## 按顺序执行的协议

1. 从索引中识别匹配的技能，并**在第一次 MCP 调用之前调用它**。
2. 如果不确定，每个会话浏览一次 `tools_documentation`，以重新了解工具范围。
3. 配置任何节点之前先调用 `get_node`——读取实时 schema，不要凭空假设。
4. 构建/编辑后，**激活前调用 `validate_workflow`**，并在之后调用 **`n8n_get_workflow`** 以检查 `connections`。
5. 指出你发现的任何偏差（工具缺失、参数变化、行为不一致）。

## 不确定时

- **找不到用户在 UI 中构建的工作流？** 最常见的原因是该工作流的 MCP 访问未开启。请让用户在 n8n 中打开该工作流，进入 Settings，然后启用 MCP 访问。
- **用户说它坏了？** 相信他们。根据 `get_node` 重新检查参数、追踪数据引用，并检查执行记录。请参阅 `n8n-validation-expert`。
- **没有匹配的技能，而且任务并非微不足道？** 猜测前先询问。

这些是带有明确倾向性的最佳实践，而非硬性法则。不认同某项判断？它们全都是 markdown——
直接编辑该技能即可。