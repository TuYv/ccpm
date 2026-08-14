---
name: n8n-agents
description: Design n8n AI agents the right way. Use when building or editing any @n8n/n8n-nodes-langchain.* AI node — an AI Agent, LLM chain, Text Classifier, or Information Extractor — and whenever the user mentions AI agents, LLM with tools, tool calling, $fromAI, system prompts, agent memory, sessionId, structured/JSON output, output parser, RAG, vector store, a chat assistant/bot, or human-in-the-loop review. Covers Agent-vs-chain-vs-classifier choice, the model/memory/tools/outputParser slots, tool names/descriptions as prompt, structured output with autoFix, memory, RAG, human review, and chat topologies.
---
# n8n 智能体

n8n AI Agent 节点（`@n8n/n8n-nodes-langchain.agent`）是一个多轮 LLM 驱动器，配有用于模型、记忆、工具以及可选输出解析器的子节点。本技能是关于如何设计智能体及其周边 LangChain 节点家族的**深入**指南。有关“智能体在工作流中处于什么位置”的高层概览，请参阅 **n8n-workflow-patterns** 中的 `ai_agent_workflow.md`——本技能将深入一个层次，讲解*如何把它构建好*。

关于节点类型格式：在工作流 JSON 中，LangChain 节点使用完整的 `@n8n/n8n-nodes-langchain.*` 形式（`.agent`、`.lmChatOpenAi`、`.memoryBufferWindow`、`.outputParserStructured`、`.toolWorkflow`、`.toolHttpRequest`、`.toolCode`）。调用 `get_node` / `validate_node` 时，请使用**简短**形式（`nodes-langchain.agent`）。格式规则请参阅 **n8n-mcp-tools-expert**。

---

## 首先选择正确的节点

当任务只是单次分类或提取时却使用 Agent，是最常见的过度设计。在连接任何节点之前先做出判断：

| 你需要…… | 使用 | 原因 |
|---|---|---|
| 调用工具、进行多轮推理或保留记忆 | **AI Agent**（`.agent`） | 完整循环：模型 + 工具 + 记忆 + 可选解析器。如果你更倾向于标准化，它也是一个不错的默认选择。 |
| 单次文本输入 → 文本输出，不使用工具 | **Basic LLM Chain**（`.chainLlm`） | 没有智能体循环，更容易调试。仍然可以接入 `outputParserStructured` 子节点。 |
| 将自然语言输入路由到 **N 个分支**之一 | **Text Classifier**（`.textClassifier`） | 一个节点、N 个输出句柄，下游直接连接到各个输出。无需使用 Agent + Switch。 |
| 从自由文本中提取结构化字段 | **Information Extractor**（`.informationExtractor`） | 专为基于 schema 的字段提取而设计。 |
| 分为正面/中性/负面三个分支 | **Sentiment Analysis**（`.sentimentAnalysis`） | 内置分支输出。 |
| 精简长文档 | **Summarization Chain**（`.chainSummarization`） | 内置 map-reduce 摘要功能。 |
| 生成图像 / 音频 / 视频 | **提供商原生的单次调用节点**（OpenAI、Gemini、ElevenLabs……） | 切勿将媒体生成封装在 Agent 中——请参阅“二进制数据与智能体边界”。 |

**Text Classifier 详解（Agent + Switch 反模式）：**每个类别都需要同时具有**名称和描述**。模型根据*描述*进行路由，而不是名称——没有描述的类别只能像抛硬币一样被随机选中。设置 `options.enableAutoFixing: true`，以提高处理边界输入时的稳健性。一个节点、N 个分支，就完成了。使用一个负责“决策”的 Agent，再接一个负责“路由”的 Switch，需要两个节点和提示词样板代码，而这些正是 Text Classifier 原生就能完成的工作。

聊天模型节点（`.lmChatOpenAi`、`.lmChatAnthropic`、`.lmChatOpenRouter`，……）是**子节点**——它们不能独立运行。它们通过 `ai_languageModel` 连接接入 chain、agent、classifier 或 extractor。

---

## 子节点模式

Agent 有一个**主输入**（提示词 / 用户消息）和最多四个**子节点插槽**，每个插槽都通过各自的 `ai_*` 连接类型进行连接：

| 插槽 | 连接类型 | 是否必需？ | 节点示例 |
|---|---|---|---|
| **model** | `ai_languageModel` | 是 | `.lmChatOpenAi`, `.lmChatAnthropic`, `.lmChatOpenRouter` |
| **memory** | `ai_memory` | 可选 | `.memoryBufferWindow`, `.memoryPostgresChat` |
| **tools** | `ai_tool` | 可选（但这是智能体的意义所在） | `slackTool`, `.toolWorkflow`, `.toolHttpRequest`, `.toolCode` |
| **outputParser** | `ai_outputParser` | 可选 | `.outputParserStructured` |

子节点从自身连接到智能体。在工作流 JSON 中，连接位于**子节点**上，并以 `ai_*` 类型作为键：

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

多个工具都连接到同一个 `ai_tool` 索引 0——它们会叠加，而不是分散到不同索引。使用 `n8n_update_partial_workflow` 时，通过一个使用 `sourceOutput: "ai_tool"` 的 `addConnection` 操作连接每个工具。智能体会将其最终答案放入 **`$json.output`**（不是 `.text`，也不是 `.response`）——下游节点通过 `{{ $json.output }}` 读取。

有关完整的无状态智能体核心节点对象片段，请参阅 **EXAMPLES.md**。

---

## 两项不可妥协的要求

1. **工具名称和描述是提示词的一部分。** 模型仅通过阅读工具的名称和描述来选择工具——没有其他依据。一个名为 `tool1` 且描述为空的工具对模型而言是不可见的：它会跳过该工具、错误选择其他工具，或臆造参数。通常不会出现错误提示——只会得到一个“就是不使用我的工具”的智能体。请像设计 API 一样对待这两者。→ **TOOLS.md**
2. **结构化输出必须能够解析并启用 autoFix。** 使用 `autoFix: true` 的 `outputParserStructured`，再配合一个**具备编码能力的修复模型**，是生产环境中的常用模式。如果不使用 autoFix，一次格式错误的 JSON 响应就会导致整个工作流停止。→ **STRUCTURED_OUTPUT.md**

---

## 强烈推荐的默认做法

- **每个工具的使用方式应写在工具描述中，而不是系统提示词中。** 任何关于*如何调用这个特定工具*的内容都应放在该工具中，这样它便可跨智能体使用，同时让系统提示词保持聚焦。→ **SYSTEM_PROMPT.md**
- **任何多步骤任务都使用子工作流工具（`.toolWorkflow`）。** 任何工作流都可以通过带类型的 `$fromAI()` 输入变成工具，并能与分支、错误处理和复用机制组合使用。如有疑问，默认采用这种方式。→ **SUBWORKFLOW_AS_TOOL.md** 和 **n8n-subworkflows**。
- **对具有用户可见副作用的工具添加人工审核。** 发送、付款、退款和账户变更等操作应由审批节点进行管控，以便在工具执行前由人工签字确认。→ **HUMAN_REVIEW.md**
- **提高 `maxIterations`。** 默认的工具调用上限**很低**（大多数版本都是个位数）——对于只使用一个工具的智能体来说足够，但对于每轮需要串联多次调用的多工具智能体来说远远不够。其表现形式可能是“max iterations reached”或输出为空。将 `options.maxIterations` 设置为合理的上限（专注于特定任务的子智能体可设为 15，广泛用途的编排智能体可设为 50-200）。
- **通过 `{{ $now }}`（或 `{{ $now.format('DDDD') }}`）将当前日期放入系统提示词。** 硬编码的日期会立即过时。

---

## 四种工具类型

选择能够完成任务的最轻量选项：

| 工具类型 | 节点 | 适用场景 |
|---|---|---|
| **原生工具节点** | `slackTool`, `gmailTool`, `toolCalculator`, … | 所需能力可映射到一个现有节点及其一项操作。开销最低。 |
| **作为工具的子工作流** | `.toolWorkflow` | 需要多个节点、可复用逻辑，或希望能够独立测试。n8n 的标准方式——**不确定时默认选择此项**。 |
| **HTTP 请求工具** | `.toolHttpRequest` | 智能体需要直接编排单个外部 HTTP API。复用该服务的预定义凭据，以实现原生节点未开放的操作。 |
| **MCP 客户端工具** | `.mcpClientTool` | 已有维护中的 MCP 服务器能够满足需求，或希望用一个已发布的工作流服务多个智能体。 |

此外，还有用于纯内联计算的**自定义代码工具**（`.toolCode`）——但它的运行时约定（字符串输入/字符串输出、不支持 `$fromAI`、不支持 `$helpers`）由 **n8n-code-tool** 技能负责。编写之前请先阅读该技能。经验法则：如果你发现自己想在代码中使用 `$fromAI()`，那么你真正需要的是 `.toolWorkflow`。

### `$fromAI()`：智能体如何填写工具参数

应由智能体决定的工具参数会封装在 `$fromAI()` 中。它是一个**真正的 n8n 表达式辅助函数**，用于工具节点的参数表达式中：

```
={{ $fromAI('paramName', 'what to put here — be specific: format, range, example', 'string') }}
```

- **paramName**——模型内部使用的名称（使用 snake_case 或 camelCase，并保持一致）。
- **description**——告诉模型应生成什么值。**它是提示词的一部分**——应像编写 JSDoc 一样编写它。
- **type**（可选）——`'string'`（默认）、`'number'`、`'boolean'`、`'json'`。类型错误的值会导致调用失败。
- **defaultValue**（可选）——当模型省略该参数时使用。

`$fromAI()` 只能传递 JSON——它**无法传递二进制数据**（不能传递 base64，也不能传递文件字节）。而且并非每个参数都必须使用 `$fromAI`：应从工作流上下文中以确定性的方式传入身份信息、权限限制和关联 ID（`userId`、退款上限、`sessionId`），这样智能体既不会弄错它们，甚至也无法看到它们。完整结构以及“给智能体一个按钮，而不是一个方向盘”的模式，请参阅 **TOOLS.md**。

---

## 系统提示词与工具描述

| 应放在**系统提示词**中 | 应放在**工具描述**中 |
|---|---|
| 人设、角色、语气 | 这个特定工具的作用 |
| 全局输出/格式规则（“使用 markdown 回复”） | 何时使用它而不是其他工具 |
| 拒绝/安全行为 | 每个参数的含义及其结构 |
| 展示协议（图片使用 `![]()`） | 正确调用与错误调用的示例 |
| 通用上下文（通过 `$now` 获取当前日期、用户角色） | 工具特有的注意事项（速率限制、边界情况） |
| 工具间流程（“生成后始终展示”） | 工具特有的输入转换 |

拆分的原因：描述良好的工具可以用于**任何**引入它的智能体；只有当模型考虑使用该工具时，工具详情才会“加载”（提高 token 效率）；而且你只需更新一处工具描述，而不必修改埋在一个 5000-token 提示词中的某个段落。→ **SYSTEM_PROMPT.md**

---

## 结构化输出：何时使用以及如何使用

当下游需要严格的 JSON 而非自由格式文本时，添加一个 `outputParserStructured` 子节点（通过 `ai_outputParser` 连接）。有两条规则：

1. **使用带有真实 JSON Schema 的 `schemaType: 'manual'`，而不是 `jsonSchemaExample`。** 示例无法表达必填与可选、枚举、数值范围或数组约束——一旦结构变得稍微复杂，就无法满足需求。只有对于用完即弃的结构，才使用 `fromJson` + 示例。
2. **将 `autoFix: true` 与具备编码能力的修复模型配合使用。** 将*第二个*模型接入解析器的 `ai_languageModel` 插槽。根据 schema 修正损坏的 JSON 是一项编码任务——能力较弱的修复模型只会再次生成格式错误的重试结果并浪费 token。

→ 有关 schema 模式、至关重要的“DO NOT wrap in markdown”重试提示语句，以及解析失败处理指南，请参阅 **STRUCTURED_OUTPUT.md**。

---

## 记忆：简要心智模型

记忆是一个子节点（`ai_memory`）。没有它，每次调用都是无状态的——这适用于一次性任务（分类、摘要）。使用它后，智能体可以维持对话，并以你绑定到 `sessionKey` 的任何表达式作为键。

- **`memoryBufferWindow`** —— 为每个键保留最近 N 轮对话，并通过 n8n 的存储跨执行持久化。这是聊天场景的默认选择。**`contextWindowLength` 默认值为 5，这非常低**——50 是更合理的起始值。超出窗口的消息会被完全丢弃。
- **`memoryPostgresChat` / `memoryRedisChat`** —— 仅当需要在智能体*外部*读取记忆时使用（例如你自己的 UI、分析系统、跨系统场景）。如果只是为了在重启后保留记忆，则不需要使用它们；BufferWindow 已经可以做到这一点。

**始终如一地将来自触发器的稳定键传递给记忆。** 聊天触发器会自动填充 `sessionId`；对于其他入口，请自行派生一个键（Slack `thread_ts`、Webhook 对话 ID）。切勿硬编码 `sessionId: 'default'`，也不要将 `sessionId` 放在 `$fromAI` 后面（模型会捏造一个 UUID）。→ **MEMORY.md**

---

## 二进制数据与智能体边界

这是最容易让人出错的边界：

- **模型可以看到上传的图片**（视觉能力），方法是在智能体上设置 `options.passthroughBinaryImages: true`。
- **工具无法接收二进制数据。** `$fromAI()` 仅支持 JSON——不支持 base64，不支持字节，即使通过非 AI 绑定也不行。
- **智能体的输出是文本形式的**（或者是经过解析器处理的结构化文本）。当模型返回图片、音频或视频字节时，Agent 根本不会将其暴露出来——下游没有任何内容可以恢复。

**解决方法：** 在智能体运行前，预先将上传内容暂存到存储中，把存储键注入系统提示词，并让工具接收该键作为字符串参数，然后在内部重新获取内容。对于一次性的媒体生成，请跳过智能体，直接调用提供商的原生单次调用节点。

二进制机制（使用哪种存储、如何暂存、如何重新获取）由 **n8n-binary-and-data** 负责——请参阅其智能体工具二进制参考文档。此 Skill 仅标明边界；不要在此处重新推导相关机制。

---

## 人工审核（为破坏性工具设置关卡）

当工具的效果需要在执行前获得人工批准时（发送、付款、退款、账户变更），请使用审核工具节点将其包装起来——`slackHitlTool`、`discordHitlTool`、`telegramHitlTool`、`gmailHitlTool` 等（n8n 将这些称为“Hitl”/人工介入）。审核节点位于被包装工具与智能体之间的 `ai_tool` 连接上：被包装工具 → 审核节点 → Agent。

是否需要签核属于产品/策略层面的决定——**应明确向用户提出这个问题**，根据影响范围给出建议，并让用户自行决定。

**关键规则：展示被封装工具实际将收到的参数。** 在审批消息中使用字面形式 `{{ $tool.parameters.<name> }}`，绝不能使用 `$fromAI()` 生成的意译——否则，人工审批的是模型编造的文本，而不是即将执行的调用。→ **HUMAN_REVIEW.md**

---

## 聊天智能体（Slack、Discord、Teams、Telegram）

**无论复杂程度如何，都有一条不可妥协的规则：** 任何由聊天触发且会发布回复的工作流，都必须**过滤掉机器人自己的用户 ID**，否则它自己的回复会再次触发工作流，形成无限循环，持续消耗运行次数和 token。若支持，优先在触发器级别进行过滤（Slack Trigger 的 `options.userIds` 是一个**排除列表**——将机器人 ID 放入其中）；否则，在触发器后的第一个节点中过滤 `$json.user !== '<BOT_USER_ID>'`。

除该过滤器外，简单机器人（触发器 → 智能体 → 回复）完全可以放在一个工作流中。只有当你需要加载状态 UX、子智能体、多界面复用或健壮的错误处理时，才拆分为**外壳 + 核心 + 子智能体**：

- **外壳**——触发器、反循环过滤器、事件类型 Switch、加载/错误 UX，并渲染回复。不使用 LLM。
- **核心**——无状态智能体，以 `chatInput` + `threadId` 作为输入，使用以 `threadId` 为键的记忆，并配备工具和子智能体。
- **子智能体**——每个仅负责一个狭窄领域，通过 `.toolWorkflow` 调用，并且**无状态**（完整上下文包含在 `chatInput` 中）。

→ 有关各平台的语义、将线程用作会话以及完整拓扑，请参阅 **CHAT_AGENT_PATTERNS.md**。

---

## RAG（检索增强生成）

n8n 提供了 LangChain 的 RAG 基础组件（文档加载器、拆分器、嵌入模型、向量存储、检索器）。有两项主张值得预先说明：

1. **首先排除成本更低的查询方式。** 精确查询 → 使用数据库或 Data Table 查询，而不是 RAG。时效性要求 → 使用实时搜索工具。规模较小或结构化的文档集 → 为智能体提供列出/获取工具。只有当文档多到无法列出且查询具有语义性时，才使用向量存储。
2. **将向量存储连接为检索工具**（`mode: 'retrieve-as-tool'`、`ai_tool`），让智能体自行决定何时需要检索，并自行表述查询。查询和文档必须使用**相同的**模型进行嵌入。

→ **RAG.md**（有意保持精简——默认设置取决于数据的形态和规模）。

---

## 参考文件

| 文件 | 何时阅读 |
|---|---|
| **TOOLS.md** | 添加工具、在四种类型中进行选择、编写名称/描述、解析 `$fromAI` 的结构 |
| **SUBWORKFLOW_AS_TOOL.md** | 通过 `.toolWorkflow` 将子工作流连接为工具，映射由智能体填充的参数与直接传入的参数 |
| **SYSTEM_PROMPT.md** | 编写/重构系统提示词，区分系统提示词与工具描述 |
| **STRUCTURED_OUTPUT.md** | 强制输出 JSON、配置 autoFix、配置修复器模型、修复解析失败问题 |
| **MEMORY.md** | 选择记忆类型、持久化、处理 sessionId |
| **HUMAN_REVIEW.md** | 添加人工审批、审批消息内容、多渠道审批者 |
| **CHAT_AGENT_PATTERNS.md** | 构建 Slack/Discord/Teams/Telegram 机器人，外壳 + 核心 + 子智能体拓扑 |
| **RAG.md** | 检索增强智能体（有意保持精简） |
| **EXAMPLES.md** | 具体的节点对象片段：无状态智能体核心、Slack 路由器外壳、领域子智能体 |

---

## 反模式

| 反模式 | 问题所在 | 修复方法 |
|---|---|---|
| 通用工具名称（`tool1`、`doStuff`、`runQuery`） | 模型无法判断该选择哪个工具——会跳过工具或臆造参数 | 使用动词开头的具体名称：`Search customer database`、`Generate image with Veo` |
| 工具描述为空或只有一行 | 模型不知道何时调用；会导致选择错误且不报错 | 编写实际有效的描述：工具的作用、使用时机，以及每个参数的含义 |
| 将每个工具的说明都塞进系统提示词 | 提示词臃肿，无法复用，且各工具的指导信息被埋没 | 将工具特定的说明移入工具描述 |
| 使用 Agent + Switch 根据自然语言进行路由 | 本可用一个 Text Classifier 节点完成，却用了两个节点外加提示词样板 | 使用 Text Classifier——每个类别都有自己的输出句柄（名称**和**描述） |
| 将图像/音频/视频生成封装在 Agent 中 | 二进制数据无法通过工具流转，也无法从 Agent 输出中传出 | 直接使用提供商原生的单次调用节点 |
| 使用 `outputParserStructured` 但未启用 `autoFix` | 一个格式错误的响应就会导致工作流停止 | 使用 `autoFix: true`，并搭配具备编码能力的修复模型 |
| 将二进制数据直接传给工具 | 无法工作——二进制数据不能跨越工具边界 | 预先存入存储系统并传递键；参见 **n8n-binary-and-data** |
| 硬编码 `sessionId` / 没有 sessionId / 将 `sessionId` 放在 `$fromAI` 后面 | 对话发生串线，或模型臆造 UUID | 将来自触发器的稳定键传递给内存和工具 |
| 两个几乎完全相同的工具 | 选择结果不确定，模型会感到困惑 | 使用一个工具，并通过参数驱动内部分支 |
| 聊天机器人没有机器人用户过滤器 | 它自己的回复会再次触发自身 → 无限循环 | 在触发器或第一个节点中排除机器人用户 ID |
| 多工具 Agent 的 `maxIterations` 保持较低的默认值 | 出现「Max iterations reached」/ 输出为空 | 提高 `options.maxIterations` |
| 通过 `$fromAI()` 填充人工审核消息 | 审批者批准的是转述内容，而不是真实调用 | 使用字面量 `{{ $tool.parameters.<name> }}` |

---

## 社区 MCP 无法提供的功能

| 想要执行的操作 | 实际情况 |
|---|---|
| 使用实时 token 对 Agent 进行端到端运行/聊天测试 | `n8n_test_workflow` 可以运行工作流，但真正的多轮聊天会话属于 UI 操作（画布聊天测试器）。 |
| 设置凭据的实际机密值 | `n8n_manage_credentials` 可以创建/更新凭据记录，但 Agent 提供商密钥本身需要在 UI 中输入/验证。 |
| 为工作流分配 Error Workflow | 只能通过 UI 完成——参见 **n8n-error-handling**。构建全捕获工作流，然后向用户提供 UI 操作步骤。 |
| 固定每个实例上可用的确切模型 | 模型列表会随版本变化——`search_nodes`/`get_node` 反映的是当前已安装的内容。请在目标实例上进行验证。 |

MCP **可以**执行的操作：搜索和检查每个 LangChain 节点（`search_nodes`、`get_node`），验证节点配置和整个图（`validate_node`、`validate_workflow`），构建和修补 Agent 及其子节点（使用 `n8n_update_partial_workflow`，并在 `ai_*` 输出上执行 `addConnection`），进行测试（`n8n_test_workflow`），以及拉取已保存的 JSON 来验证接线（`n8n_get_workflow`）。深入的 AI Agent 指南也位于 `tools_documentation({topic: "ai_agents_guide", depth: "full"})`。

---

## 与其他技能的集成

- **n8n-workflow-patterns**（`ai_agent_workflow.md`）— 高层级的“工作流中的智能体”结构。本技能会对此进行深入讲解；请先从该技能入手了解架构。
- **n8n-mcp-tools-expert** — 节点类型格式（`get_node` 使用短格式，JSON 中使用长格式）和工具选择指南。在进行任何 MCP 调用之前，请先查阅该技能。
- **n8n-node-configuration** — 智能体及其子节点上由 `displayOptions` 控制的字段；Slack/Block Kit 消息结构（`NODE_FAMILY_GOTCHAS.md` 的 Slack 章节）。
- **n8n-expression-syntax** — `{{ }}`、`$json.output`、`$now` 以及 `$fromAI`/`$tool.parameters` 均依赖正确的表达式语法。
- **n8n-code-tool** — Custom Code Tool 的运行时约定（字符串输入/输出，不支持 `$fromAI`）。编写 `.toolCode` 前请先阅读该技能。
- **n8n-subworkflows** — `.toolWorkflow` 所基于的子工作流原语（Execute Workflow Trigger 的输入/输出、命名、构建前搜索）。
- **n8n-binary-and-data** — 负责智能体与工具之间二进制数据边界的处理机制（暂存上传内容、返回生成的文件）。
- **n8n-validation-expert** — 解读 `validate_workflow` 的结果，包括 AI 连接问题（连接到 `main` 而非 `ai_tool` 的工具会被标记为未连接）。
- **n8n-error-handling** — 工具子工作流和智能体核心调用中的 `onError: 'continueErrorOutput'`；聊天外壳中的错误用户体验。
- **n8n-code-javascript / n8n-code-python** — 用于工具子工作流*内部*的 Code 节点逻辑（其沙箱不同于 Code Tool）。

---

## 快速参考检查清单

发布智能体之前：

- [ ] **正确的节点**：需要工具/记忆/多轮对话时使用 Agent；需要路由时使用 Text Classifier；需要提取字段时使用 Information Extractor；处理媒体时使用原生节点
- [ ] **模型**通过 `ai_languageModel` 连接
- [ ] **每个工具**都有一个以动词开头的具体名称，以及一段真实有效的描述
- [ ] **`$fromAI()` 描述**足够具体（格式、范围、示例）；身份、限制和 sessionId 通过确定性方式传入，而不是通过 `$fromAI`
- [ ] **各工具的指导信息**放在工具描述中，而不是系统提示词中
- [ ] 系统提示词中使用 **`$now`**（不要硬编码日期）
- [ ] 对于多工具智能体，提高 **`maxIterations`**
- [ ] **记忆**使用来自触发器的稳定 `sessionKey` 作为键（不能是 `'default'`，也不能使用 `$fromAI`）；将 `contextWindowLength` 从 5 调高
- [ ] **结构化输出**：`schemaType: 'manual'` + `autoFix: true` + 具备编码能力的修复模型
- [ ] **破坏性工具**必须包装在人为审核机制中；审批消息使用 `$tool.parameters`，而不是 `$fromAI`
- [ ] **聊天机器人**过滤机器人自身的用户 ID（在触发器层级或第一个节点中）
- [ ] **二进制数据**：模型视觉能力通过 `passthroughBinaryImages` 使用；工具只接收存储键，绝不接收字节数据
- [ ] 使用 `validate_workflow` **完成验证**，并通过 `n8n_get_workflow` 进行确认（子节点连接到 `ai_*`，而不是 `main`）

---

**请记住**：智能体的表现取决于其工具名称、描述和系统提示词规范。模型看不到你的连线配置——它看到的是系统提示词，以及一组有名称和描述的工具。像设计 API 一样设计这些内容，大多数“智能体不按预期工作”的问题都会消失。