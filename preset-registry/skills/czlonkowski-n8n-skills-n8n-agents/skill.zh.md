---
name: n8n-agents
description: Design n8n AI agents the right way. Use when building or editing any @n8n/n8n-nodes-langchain.* AI node — an AI Agent, LLM chain, Text Classifier, or Information Extractor — and whenever the user mentions AI agents, LLM with tools, tool calling, $fromAI, system prompts, agent memory, sessionId, structured/JSON output, output parser, RAG, vector store, a chat assistant/bot, or human-in-the-loop review. Covers Agent-vs-chain-vs-classifier choice, the model/memory/tools/outputParser slots, tool names/descriptions as prompt, structured output with autoFix, memory, RAG, human review, and chat topologies.
---
# n8n Agent

n8n AI Agent 节点（`@n8n/n8n-nodes-langchain.agent`）是一个多轮 LLM 驱动器，带有用于模型、记忆、工具以及可选输出解析器的子节点。这份 skill 是围绕 Agent 及 LangChain 家族进行设计的**深入**指南。若要了解“Agent 在工作流中的适用位置”这一高层次概览，请参阅 **n8n-workflow-patterns** `ai_agent_workflow.md` — 本 skill 将进一步深入 *如何将其构建得更好*。

关于节点类型格式：在工作流 JSON 中，LangChain 节点使用较长的 `@n8n/n8n-nodes-langchain.*` 形式（`.agent`、`.lmChatOpenAi`、`.memoryBufferWindow`、`.outputParserStructured`、`.toolWorkflow`、`.toolHttpRequest`、`.toolCode`）。调用 `get_node` / `validate_node` 时，请使用**短格式**（`nodes-langchain.agent`）。格式规则请参阅 **n8n-mcp-tools-expert**。

---

## 先选择正确的节点

如果任务只是一次性的分类或提取，却直接使用 Agent，这是最常见的过度构建。在连接任何节点之前先做决定：

| 你需要…… | 使用 | 原因 |
|---|---|---|
| 调用工具、进行多轮推理，或保留记忆 | **AI Agent**（`.agent`） | 完整循环：模型 + 工具 + 记忆 + 可选解析器。如果你希望统一标准，这也是一个很好的默认选择。 |
| 一次性实现文本输入 → 文本输出，不使用工具 | **Basic LLM Chain**（`.chainLlm`） | 没有 Agent 循环，更容易调试。仍然接受 `outputParserStructured` 子节点。 |
| 将自然语言输入路由到 **N 个分支**中的一个 | **Text Classifier**（`.textClassifier`） | 一个节点、N 个输出连接点，下游可直接分别连接到每个分支。不要使用 Agent + Switch。 |
| 从自由文本中提取结构化字段 | **Information Extractor**（`.informationExtractor`） | 专门用于根据 schema 提取字段。 |
| 将内容分为正面/中性/负面三类 | **Sentiment Analysis**（`.sentimentAnalysis`） | 内置分支输出。 |
| 压缩长文档 | **Summarization Chain**（`.chainSummarization`） | 内置 map-reduce 摘要功能。 |
| 生成图像 / 音频 / 视频 | **提供商原生的单次调用节点**（OpenAI、Gemini、ElevenLabs……） | 切勿将媒体生成封装在 Agent 中 — 请参阅“Binary and the agent boundary”。 |

**Text Classifier 详情（Agent + Switch 反模式）：**每个类别都需要同时具备**名称和描述**。模型会根据*描述*而不是名称进行路由 — 没有描述的类别会被随机选中。为提高边界输入的稳健性，请设置 `options.enableAutoFixing: true`。一个节点、N 个分支，就这么简单。使用 Agent“决定”后再由 Switch“路由”，相当于用两个节点加上提示词模板来实现 Text Classifier 原生提供的功能。

聊天模型节点（`.lmChatOpenAi`、`.lmChatAnthropic`、`.lmChatOpenRouter`、……）是**子节点** — 它们不能独立运行。它们通过 `ai_languageModel` 连接接入 chain、agent、classifier 或 extractor。

---

## 子节点模式

Agent 具有一个**主输入**（提示词 / 用户消息）以及最多四个**子节点插槽**，每个插槽都通过独立的 `ai_*` 连接类型进行连接：

| 插槽 | 连接类型 | 是否必需？ | 节点示例 |
|---|---|---|---|
| **model** | `ai_languageModel` | 是 | `.lmChatOpenAi`, `.lmChatAnthropic`, `.lmChatOpenRouter` |
| **memory** | `ai_memory` | 可选 | `.memoryBufferWindow`, `.memoryPostgresChat` |
| **tools** | `ai_tool` | 可选（但这正是 agent 的作用所在） | `slackTool`, `.toolWorkflow`, `.toolHttpRequest`, `.toolCode` |
| **outputParser** | `ai_outputParser` | 可选 | `.outputParserStructured` |

子节点从自身连接到 agent。在工作流 JSON 中，连接位于**子节点**上，以 `ai_*` 类型作为键：

```json
"Main LLM": {
  "ai_languageModel": [[{ "node": "AI Agent", "type": "ai_languageModel", "index": 0 }]]
},
"Simple Memory": {
  "ai_memory": [[{ "node": "AI Agent", "type": "ai_memory", "index": 0 }]]
},
"Search customer DB": {
  "ai_tool": [[{ "node": "AI Agent", "type": "ai_tool", "index": 0 }]]
}
```

多个工具都会连接到同一个 `ai_tool` 索引 0 ——它们会叠加，而不是分别连接到不同的索引。使用 `n8n_update_partial_workflow` 时，通过使用 `sourceOutput: "ai_tool"` 的 `addConnection` 操作分别连接每个工具。agent 会将最终答案放入 **`$json.output`**（不是 `.text`，也不是 `.response`）——下游节点读取 `{{ $json.output }}`。

有关无状态 agent-core 节点对象的完整代码片段，请参阅 **EXAMPLES.md**。

---

## 两条不可妥协的原则

1. **工具名称和描述是提示词的一部分。**模型通过读取工具的名称和描述来选择工具——除此之外别无其他依据。名为 `tool1` 且描述为空的工具对模型来说是不可见的：模型会跳过它、错误选择它，或臆造参数。通常不会出现错误——只会表现为 agent “不使用我的工具”。应将这两者都视为 API 设计的一部分。→ **TOOLS.md**
2. **结构化输出必须能够解析并执行 autoFix。**在生产环境中，应使用带有 `autoFix: true` 和**具备编码能力的修复模型**的 `outputParserStructured`。如果没有 autoFix，一次格式错误的 JSON 响应就会使整个工作流停止。→ **STRUCTURED_OUTPUT.md**

---

## 强烈推荐的默认设置

- **每个工具的使用说明应放在工具描述中，而不是系统提示词中。**任何关于*如何调用这个特定工具*的内容，都应放在工具自身的描述中，这样它就能在不同 agent 之间传递，同时保持系统提示词聚焦。→ **SYSTEM_PROMPT.md**
- **任何多步骤任务都应使用子工作流工具（`.toolWorkflow`）。**任何工作流都可以通过带类型的 `$fromAI()` 输入变成工具，并支持分支、错误处理和复用。拿不准时，默认使用这一方式。→ **SUBWORKFLOW_AS_TOOL.md** 和 **n8n-subworkflows**。
- **对具有用户可见副作用的工具使用人工审核进行包装。**发送、付款、退款、账户变更等操作，都应在审批节点后执行，以便人工在工具触发前进行确认。→ **HUMAN_REVIEW.md**
- **提高 `maxIterations`。**默认的工具调用上限**很低**（大多数版本都只有个位数）——对于单工具 agent 来说足够，但对于每轮需要串联多次调用的多工具 agent 来说远远不够。其表现可能是“达到最大迭代次数”或输出为空。将 `options.maxIterations` 设置为合理的上限（专注型子 agent 设为 15，广泛型编排器设为 50-200）。
- **通过 `{{ $now }}`（或 `{{ $now.format('DDDD') }}`）将当前日期放入系统提示词中。**硬编码的日期会立即过时。

---

## 四种工具类型

选择能够完成任务的最轻量选项：

| 工具类型 | 节点 | 适用场景 |
|---|---|---|
| **原生工具节点** | `slackTool`、`gmailTool`、`toolCalculator`，…… | 所需能力可以映射到一个现有节点和一个操作。开销最低。 |
| **作为工具的子工作流** | `.toolWorkflow` | 需要多个节点、可复用逻辑，或希望具备独立的可测试性。n8n 的标准方式——**不确定时默认选择此项**。 |
| **HTTP Request Tool** | `.toolHttpRequest` | 智能体应直接编排单个外部 HTTP API。复用服务预定义的凭据，以支持原生节点未暴露的操作。 |
| **MCP Client Tool** | `.mcpClientTool` | 已有受维护的 MCP 服务器能够覆盖该需求，或希望让一个已发布的工作流服务于多个智能体。 |

此外，还有一个用于纯内联计算的 **Custom Code Tool**（`.toolCode`）——但它的运行时契约（字符串输入 / 字符串输出，不支持 `$fromAI`、不支持 `$helpers`）由 **n8n-code-tool** skill 负责。在编写这类工具之前，请先阅读该 skill。经验法则：如果你发现自己想在代码中使用 `$fromAI()`，那么你需要的是 `.toolWorkflow`。

### `$fromAI()`：智能体如何填写工具参数

需要由智能体决定的工具参数，应使用 `$fromAI()` 包裹。它是一个**真正的 n8n 表达式辅助函数**，用于工具节点的参数表达式中：

```
={{ $fromAI('paramName', 'what to put here — be specific: format, range, example', 'string') }}
```

- **paramName** — 模型在内部使用的名称（使用 snake_case 或 camelCase，并保持一致）。
- **description** — 告诉模型应生成什么值。**它是提示词的一部分**——应像编写 JSDoc 一样编写。
- **type**（可选）— `'string'`（默认值）、`'number'`、`'boolean'`、`'json'`。类型错误的值会导致调用失败。
- **defaultValue**（可选）— 模型未提供该值时使用。

`$fromAI()` 只能承载 JSON——它**不能承载二进制数据**（不支持 base64，不支持文件字节）。而且并非每个参数都必须使用 `$fromAI`：应从工作流上下文中确定性地传入身份信息、权限限制和关联 ID（`userId`、退款上限、`sessionId`），这样智能体既无法填错，也无法看到这些信息。→ 完整的结构说明以及“给智能体一个按钮，而不是方向盘”的模式，请参阅 **TOOLS.md**。

---

## 系统提示词与工具描述的区别

| 属于**系统提示词** | 属于**工具的描述** |
|---|---|
| 角色设定、职责、语气 | 该特定工具的功能 |
| 全局输出/格式规则（“以 markdown 格式响应”） | 何时使用该工具，以及何时使用其他工具 |
| 拒绝 / 安全行为 | 每个参数的含义及其形态 |
| 展示协议（图像使用 `![]()`） | 良好调用与不良调用的示例 |
| 通用上下文（通过 `$now` 获取当前日期、用户角色） | 工具特有的注意事项（速率限制、边界情况） |
| 工具间流程（“生成后始终进行展示”） | 工具特有的输入转换 |

为何要进行拆分：描述完善的工具可以用于**任何**使用它的智能体；只有当模型考虑使用某个工具时，工具详细信息才会“加载”（节省 token）；并且你只需更新一处工具描述，而不是修改埋藏在 5000-token 提示词中的一段文字。→ **SYSTEM_PROMPT.md**

---

## 结构化输出：何时以及如何使用

当下游需要严格的 JSON，而不是自由格式文本时，添加一个 `outputParserStructured` 子节点（连接 `ai_outputParser`）。需要遵循两条规则：

1. **使用 `schemaType: 'manual'` 配合真正的 JSON Schema，而不是 `jsonSchemaExample`。** 示例无法表达必填与可选字段、枚举、数值范围或数组约束——形状一旦变得稍微复杂一些，你很快就会发现它不够用。只有对于临时使用的简单形状，才使用 `fromJson` 加示例。
2. **使用 `autoFix: true`，并配备具备编码能力的修复模型。** 将*第二个*模型连接到解析器的 `ai_languageModel` 插槽。根据 Schema 修复损坏的 JSON 是一项编码任务——能力较弱的修复模型只会再次生成格式错误的重试结果，并浪费 token。

→ **STRUCTURED_OUTPUT.md**，参阅其中的 Schema 模式、起关键作用的“不要包装在 markdown 中”重试行，以及解析失败处理手册。

---

## 记忆：简要心智模型

记忆是一个子节点（`ai_memory`）。没有它，每次调用都是无状态的——这对于一次性任务（分类、摘要）是正确的。使用记忆后，Agent 会持有一个由你绑定到 `sessionKey` 的表达式作为键的对话。

- **`memoryBufferWindow`** — 为每个键保留最近 N 次交互，并通过 n8n 的存储机制跨执行持久化。聊天场景的默认选项。**`contextWindowLength` 默认为 5，这个值非常低**——50 是更合理的起始值。超出窗口的消息会被完全丢弃。
- **`memoryPostgresChat` / `memoryRedisChat`** — 仅当记忆必须在 Agent *之外*被读取时使用（你自己的 UI、分析系统、跨系统场景）。如果只是为了在重启后保留记忆，则不需要它们；BufferWindow 已经能够做到这一点。

**始终将稳定的键从触发器一致地传递到记忆节点。** 聊天触发器会自动填充 `sessionId`；对于其他入口，则自行生成一个（例如 Slack 的 `thread_ts`、Webhook 的会话 ID）。绝不要硬编码 `sessionId: 'default'`，也绝不要将 `sessionId` 放在 `$fromAI` 后面（模型会凭空生成一个 UUID）。→ **MEMORY.md**

---

## 二进制数据与 Agent 边界

这是最容易让人困惑的边界：

- **模型可以看到上传的图像**（视觉能力），前提是在 Agent 上设置 `options.passthroughBinaryImages: true`。
- **工具无法接收二进制数据。** `$fromAI()` 仅支持 JSON——不支持 base64，不支持字节，即使通过非 AI 绑定也不行。
- **Agent 的输出是文本形态的**（或在使用解析器时为结构化文本）。当模型返回图像/音频/视频字节时，Agent 完全不会将其向下游传递——下游没有任何东西可以恢复。

**解决方法：** 在 Agent 运行前，先将上传内容暂存到存储中，将存储键注入系统提示词，并让工具接受字符串类型的键作为参数，在内部重新获取内容。对于一次性的媒体生成任务，跳过 Agent，直接调用提供商原生的单次调用节点。

二进制数据的具体机制（使用哪种存储、如何暂存、如何重新获取）由 **n8n-binary-and-data** 负责——参阅其 Agent 工具二进制数据参考。本技能只标记边界；不要在这里重新推导这些机制。

---

## 人工审核（为破坏性工具设置门控）

当某个工具的效果需要在执行前获得人工批准时（发送、付款、退款、账户变更），使用审核工具节点包装它——`slackHitlTool`、`discordHitlTool`、`telegramHitlTool`、`gmailHitlTool` 等。（n8n 将这些节点称为“Hitl”/human-in-the-loop。）审核节点位于被包装工具与 Agent 之间的 `ai_tool` 连接上：被包装工具 → 审核节点 → Agent。

是否需要签字确认取决于产品/政策决策——**将这个问题呈现给用户**，根据影响范围给出建议，并让用户决定。

**关键规则：展示封装工具将接收的实际参数。** 在审批消息中使用字面量 `{{ $tool.parameters.<name> }}`，绝不要使用 `$fromAI()` 的改写——否则人类批准的是模型编造的文本，而不是即将执行的调用。→ **HUMAN_REVIEW.md**

---

## 聊天代理（Slack、Discord、Teams、Telegram）

**无论复杂程度如何，唯一不可妥协的要求是：**任何由聊天触发且会发布回复的工作流都 MUST **过滤掉机器人自己的用户 ID**，否则机器人自己的回复会再次触发该工作流，形成无限循环，消耗运行次数和 token。优先使用触发器级别的过滤（Slack Trigger 的 `options.userIds` 是一个**排除列表**——将机器人 ID 放入其中）；否则在触发器之后的第一个节点中使用 `$json.user !== '<BOT_USER_ID>'` 进行过滤。

除了该过滤之外，简单的机器人（触发器 → 代理 → 回复）放在一个工作流中即可正常运行。只有在需要加载状态 UX、子代理、多平台复用或健壮的错误处理时，才拆分为 **shell + core + sub-agents**：

- **Shell** — 触发器、反循环过滤、事件类型 Switch、加载/错误 UX，以及渲染回复。不使用 LLM。
- **Core** — 无状态代理，输入为 `chatInput` + `threadId`，以 `threadId` 为键的记忆，以及工具和子代理。
- **Sub-agents** — 每个子代理负责一个狭窄的领域，通过 `.toolWorkflow` 调用，**无状态**（完整上下文放在 `chatInput` 中）。

→ **CHAT_AGENT_PATTERNS.md**，了解各平台的语义、以线程作为会话，以及完整的拓扑结构。

---

## 持久化 n8n Agents (n8n_manage_agents)

**持久化 n8n Agent** 与上文介绍的 AI Agent 节点是不同的产物：它是一个独立的助手记录——包括模型、指令、工具、技能、任务、记忆和渠道——由 n8n 自身存储和版本管理，通过 `n8n_manage_agents`（n8n 的实例级 MCP 服务器）进行管理，而不是工作流 JSON 中的节点。

| 你需要…… | 使用 |
|---|---|
| 工作流内部的一个推理步骤，并通过 `ai_*` 子节点连接 | **AI Agent 节点**（本 skill，上文） |
| 一个拥有自身生命周期的独立助手——可独立于任何单一工作流进行草稿、验证、发布、版本管理和渠道配置 | **Persisted Agent** (`n8n_manage_agents`) |

**前置条件：**已配置 `N8N_MCP_ACCESS_TOKEN`（与 Public API key 分开），并且 n8n **2.34+** 已启用 agents 模块。每个操作都需要该 token，包括 `reference`/`search`——没有它，任何操作都无法运行。除此之外，`reference` 和 `search` 适用于任何 Agent，无论其是否暴露给 MCP；其他所有操作都要求目标 Agent 已暴露给 MCP（通过此工具创建的 Agent 会自动暴露——暴露限制只对在此工具操作它们之前就已存在的 Agent 生效）。

**构建顺序：**
1. `action: "reference"` — 首先读取配置 schema 和确切的变更操作，然后再进行任何其他操作。
2. `action: "discover_assets"` — 列出 Agent 实际可以连接的资源。需要传入 `projectId`（来自 `n8n_list_catalog({kind: "projects"})`）和 `kind`：`models`（需同时传入 `provider`）、`integrations`、`workflows`、`subagents` 或 `mcpServers`。每种 kind 调用一次。
3. `action: "create"` — `projectId`、`name`、`config`。
4. `action: "mutate"` — 每次调用处理一个资源（`config.patch`、`skill.upsert`/`delete`、`task.upsert`/`delete`、`customTool.upsert`/`delete`），并始终携带**最新**的 hash。注意两个名称：n8n 将其返回为 `configHash`，并要求你将其作为 `args.baseConfigHash` 传回。`args` 会原样转发给 n8n，因此任何字段名只要稍有偏差，返回的就是 `INVALID_ARGS`，而不是有帮助的更正——这正是第 1 步要先读取 schema 的原因。过期的 hash 会返回 `STALE_CONFIG`——重新执行 `get`，使用最新的 hash 重试。
5. `action: "validate"` — 在提供 `call` 或 `publish` 之前执行。
6. `action: "publish"` — **仅在用户明确请求时执行**，绝不要主动执行。

`action: "call"` 会使用真实凭据和真实工具运行代理——这是实时执行，而不是试运行。结果可能会携带需要人工决策的工具调用 `approvals[]`；**绝不要代替用户批准**——将这些请求呈现给用户，并且仅在用户做出决定后恢复执行。

**自定义工具是第三种代码运行时——不要复用另外两种。** `customTool.upsert` 的请求体是 **TypeScript**，并且只能导入 `@n8n/agents` 和 `zod`。它不是 Code 节点（JavaScript/Python，返回 `[{json: …}]`），也不是 **n8n-code-tool** 中介绍的 AI-agent Custom Code Tool（`@n8n/n8n-nodes-langchain.toolCode`，返回字符串，不支持 `$fromAI()`）。这里最容易犯的错误就是使用错误的约定，因为这三者都是“编写由代理调用的代码”。在编写之前，先通过 `action: "reference"` 读取其结构；编译失败或未知的 `agentId` 会以 `AGENT_TOOL_ERROR` 的形式报告。

**凭据注意事项：**在 n8n 2.36.x 上，代理运行时会拒绝 `azureOpenAiApi` 和 `aws` 凭据（报告为 `missing: ["credential"]`）；响应中的 `hint` 会列出可接受的类型。

**在不留下残留数据的情况下进行测试：**为临时代理命名为 `[TEST] …`，完成后将其 `delete`——持久化的 Agent 会在创建它的会话结束后继续存在，这一点不同于可以保持未激活状态的工作流。

→ **n8n-mcp-tools-expert** 中的 `## Agents`，介绍该工具的完整操作列表和错误代码。

---

## RAG（检索增强生成）

n8n 提供 LangChain RAG 原语（文档加载器、分割器、嵌入模型、向量存储、检索器）。有两点建议需要提前说明：

1. **先排除成本更低的查询方式。** 精确查询 → 使用数据库或 Data Table 查询，而不是 RAG。需要最新信息 → 使用实时搜索工具。文档集较小或结构化 → 为代理提供列表/获取工具。只有当文档过多而无法列出，且查询具有语义性时，才应使用向量存储。
2. **将向量存储连接为检索工具**（`mode: 'retrieve-as-tool'`、`ai_tool`），这样代理可以决定何时需要检索，并自行组织查询。使用**同一个**模型来嵌入查询和文档。

→ **RAG.md**（有意保持精简——默认配置取决于数据形态和规模）。

---

## 参考文件

| 文件 | 何时阅读 |
|---|---|
| **TOOLS.md** | 添加工具、在四种类型之间进行选择、编写名称/描述、了解 `$fromAI` 的组成 |
| **SUBWORKFLOW_AS_TOOL.md** | 通过 `.toolWorkflow` 将子工作流连接为工具，映射由代理填充的参数与直接传入的参数 |
| **SYSTEM_PROMPT.md** | 编写/重构系统提示词，了解系统提示词与工具描述的职责划分 |
| **STRUCTURED_OUTPUT.md** | 强制输出 JSON、配置 autoFix、设置修复模型、修复解析失败问题 |
| **MEMORY.md** | 选择记忆类型、了解持久化、处理 sessionId |
| **HUMAN_REVIEW.md** | 添加人工审批、编写审批消息内容、配置多渠道审批人 |
| **CHAT_AGENT_PATTERNS.md** | 构建 Slack/Discord/Teams/Telegram 机器人，了解 shell + core + 子代理拓扑 |
| **RAG.md** | 构建检索增强代理（有意保持精简） |
| **EXAMPLES.md** | 查看具体的节点对象片段：无状态代理核心、Slack 路由 shell、领域子代理 |

---

## 反模式

| 反模式 | 问题所在 | 修复方法 |
|---|---|---|
| 通用工具名称（`tool1`、`doStuff`、`runQuery`） | 模型无法判断应选择哪个工具——会跳过工具或臆造参数 | 使用以动词开头的具体名称：`Search customer database`、`Generate image with Veo` |
| 空的或只有一行的工具描述 | 模型不知道何时调用；工具选择不佳，也无法处理错误 | 编写真正的描述：说明工具的功能、使用时机，以及每个参数的含义 |
| 将每个工具的说明硬塞进系统提示词 | 提示词臃肿、无法复用，而且针对工具的指导会被埋没 | 将工具专属说明移入工具描述 |
| Agent + Switch 用于自然语言路由 | 两个节点加提示词模板，而 Text Classifier 一个节点即可完成 | 使用 Text Classifier——每个类别都有自己的输出端口（包括名称**和**描述） |
| 在 Agent 中包装图像/音频/视频生成 | 二进制数据无法通过工具流转，也无法从 Agent 输出 | 直接使用提供商原生的单次调用节点 |
| 使用不带 `autoFix` 的 `outputParserStructured` | 一次格式错误的响应就会使工作流停止 | 设置 `autoFix: true` + 一个具备编码能力的修复模型 |
| 将二进制数据直接传给工具 | 无法工作——二进制数据无法跨越工具边界 | 预先将数据存储到存储服务中，传递键值；参见 **n8n-binary-and-data** |
| 硬编码 `sessionId` / 不设置 sessionId / 将 `sessionId` 放在 `$fromAI` 后面 | 会话相互串线，或模型伪造 UUID | 从触发器向 memory 和工具传递一个稳定的键 |
| 两个几乎完全相同的工具 | 选择结果不确定，模型会感到困惑 | 使用一个工具，通过参数驱动内部的分支逻辑 |
| 没有机器人用户过滤器的聊天机器人 | 它自己的回复会再次触发自身 → 无限循环 | 在触发器或第一个节点处排除机器人用户 ID |
| 多工具 Agent 将 `maxIterations` 保持为较低的默认值 | 出现“达到最大迭代次数”或输出为空 | 提高 `options.maxIterations` |
| 使用 `$fromAI()` 填充人工审核消息 | 审批者批准的是改写后的内容，而不是真实调用 | 使用字面量 `{{ $tool.parameters.<name> }}` |

---

## 社区 MCP 无法提供的功能

| 想要执行的操作 | 实际情况 |
|---|---|
| 以交互方式对工作流的 AI Agent 节点进行端到端聊天测试 | `n8n_test_workflow` 会运行工作流，但针对该节点进行真正的多轮聊天会话属于 UI 活动（画布聊天测试器）。相比之下，持久化 Agent 可以通过 `n8n_manage_agents` 的 `call` 实时运行——参见上面的“持久化 n8n Agents”。 |
| 设置凭证的实际密钥值 | `n8n_manage_credentials` 可以创建/更新凭证记录，但 Agent 提供商的密钥本身需要在 UI 中输入/验证。 |
| 分配工作流的 Error Workflow | 仅限 UI——参见 **n8n-error-handling**。先构建全局捕获流程，然后将 UI 操作步骤交给用户。 |
| 固定每个实例确切的模型可用性 | 模型列表会随版本变化——`search_nodes`/`get_node` 反映的是已安装的内容。请在目标实例上进行验证。 |

MCP **可以**执行的操作包括：搜索和检查每个 LangChain 节点（`search_nodes`、`get_node`），验证节点配置和整个图（`validate_node`、`validate_workflow`），构建和修补 Agent 及其子节点（在 `ai_*` 输出端口上使用带有 `addConnection` 的 `n8n_update_partial_workflow`），进行测试（`n8n_test_workflow`），以及提取已保存的 JSON 来验证连线（`n8n_get_workflow`）。完整的 AI-agent 深入指南也位于 `tools_documentation({topic: "ai_agents_guide", depth: "full"})`。

---

## 与其他技能的集成

- **n8n-workflow-patterns** (`ai_agent_workflow.md`) — “工作流中的 agent”这一高层结构。本技能将深入介绍；如需了解架构，请从这里开始。
- **n8n-mcp-tools-expert** — 节点类型格式（`get_node` 的简写形式，以及 JSON 中的完整形式）和工具选择指南。在进行任何 MCP 调用前请先查阅。
- **n8n-node-configuration** — agent 和子节点中由 `displayOptions` 驱动的字段；Slack/Block Kit 消息结构（`NODE_FAMILY_GOTCHAS.md` 中的 Slack 部分）。
- **n8n-expression-syntax** — `{{ }}`、`$json.output`、`$now` 以及 `$fromAI`/`$tool.parameters` 都依赖正确的表达式语法。
- **n8n-code-tool** — Custom Code Tool 的运行时约定（输入和输出均为字符串，不使用 `$fromAI`）。编写 `.toolCode` 前请先阅读。
- **n8n-subworkflows** — `.toolWorkflow` 所构建于其上的子工作流基础原语（Execute Workflow Trigger 的输入/输出、命名，以及构建前的搜索）。
- **n8n-binary-and-data** — 负责 agent-工具之间的二进制边界机制（暂存上传文件、返回生成的文件）。
- **n8n-validation-expert** — 解读 `validate_workflow` 结果，包括 AI 连接问题（将工具连接到 `main` 而不是 `ai_tool` 会被标记为未连接）。
- **n8n-error-handling** — 工具子工作流和 agent-core 调用上的 `onError: 'continueErrorOutput'`；聊天外壳中的错误体验。
- **n8n-code-javascript / n8n-code-python** — 工具子工作流内部 Code 节点的逻辑（与 Code Tool 使用不同的沙箱）。

---

## 快速参考清单

发布 agent 前：

- [ ] **节点选择正确**：需要工具/记忆/多轮对话时使用 Agent；需要路由时使用 Text Classifier；需要提取字段时使用 Information Extractor；需要处理媒体时使用原生节点
- [ ] 通过 `ai_languageModel` 连接 **模型**
- [ ] **每个工具**都有以动词开头的明确名称，且具有真实的描述
- [ ] **`$fromAI()` 描述**应具体说明格式、范围和示例；identity/limits/sessionId 应以确定性的方式传递，而不是通过 `$fromAI`
- [ ] **每个工具的指导信息**应放在工具描述中，而不是系统提示词中
- [ ] 系统提示词中使用 **`$now`**（不要硬编码日期）
- [ ] 对于多工具 agent，提高 **`maxIterations`**
- [ ] **记忆**应使用来自触发器的稳定 `sessionKey` 作为键（不要使用 `'default'`，也不要使用 `$fromAI`）；将 `contextWindowLength` 从 5 调高
- [ ] **结构化输出**：使用 `schemaType: 'manual'` + `autoFix: true` + 具备编码能力的修复模型
- [ ] **破坏性工具**应包裹在人机审核流程中；审批消息使用 `$tool.parameters`，而不是 `$fromAI`
- [ ] **聊天机器人**应过滤机器人自身的用户 ID（在触发器层或第一个节点中）
- [ ] **二进制数据**：通过 `passthroughBinaryImages` 将数据提供给模型进行视觉处理；工具获取存储键，绝不直接获取字节
- [ ] 使用 `validate_workflow` 完成验证，并使用 `n8n_get_workflow` 进行确认（子节点应连接到 `ai_*`，而不是 `main`）

---

**请记住**：agent 的效果取决于其工具名称、工具描述和系统提示词规范。模型看不到你的连线方式——它看到的是系统提示词，以及一组带有名称和描述的工具。像设计 API 一样设计这些内容，大多数“agent 不按预期工作”的问题都会随之消失。