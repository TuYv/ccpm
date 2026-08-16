---
name: gemini-interactions-api
metadata:
  category: AiAndMachineLearning
description: Guides the usage of Gemini Interactions API on Gemini Enterprise Agent Platform. Use when the user wants to use the stateful, server-managed Interactions API for multi-turn conversations, background execution, streaming, structured output, and function calling on the Agent Platform.
---
# Gemini Interactions API 技能

本技能提供有关如何在 Gemini Enterprise Agent Platform 上对有状态、由服务器管理的 **Gemini Interactions API** 进行身份验证、建立连接和使用的说明。


Interactions API 是执行生成式 AI 智能体对话、后台研究任务、多轮聊天以及结构化多步骤工作流的现代化推荐方式。

> [!IMPORTANT] **关键：统一 SDK、最新模型与 GEAP 定向** *
> **统一 SDK**：使用 Google Gen AI SDK（Python 使用
> **`google-genai >= 2.3.0`**，JS/TS 使用 **`@google/genai >= 2.3.0`**）。SDK 版本
> `>= 2.0.0` 是启用 steps schema 的最低版本，但 `>= 2.3.0` 是
> 受支持且推荐的最低版本。`google-cloud-aiplatform`、
> `@google-cloud/vertexai` 和 `google-generativeai` 等旧版 SDK 严格不支持
> Interactions。* *强制要求*：在说明客户端初始化或编写 import 代码时，
> 你**必须**明确告知/警告用户，`google-cloud-aiplatform` 或
> `google-generativeai` 等旧版软件包严格不支持 interactions。* **仅限最新
> 模型**：使用 `gemini-3.5-flash`（快速、均衡、多模态——
> 推荐的默认选择）、`gemini-3.1-pro-preview`（复杂推理、编码、
> 研究）或 `gemini-3.1-flash-lite`（经济高效、高频率的
> 轻量级任务）。请参阅
> [最新模型版本](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/migrate)
> 以检查新的更新。旧版模型（`gemini-3-flash-preview`、
> `gemini-2.5-*`、`gemini-2.0-*`、`gemini-1.5-*`）已弃用，且不
> 支持 interactions。* *强制要求*：在任何 interaction 响应中，
> 你都**必须**警告用户，`gemini-2.5-*`、
> `gemini-2.0-*` 或 `gemini-1.5-*` 等旧版模型已弃用，并且
> Interactions API 不支持这些模型。* **GEAP 需要已预配的智能体（目前尚不支持直接调用基础模型）**：
> 在 Gemini Enterprise Agent Platform（GEAP）上，通过 Interactions API
> 直接调用/调用基础模型（`model="..."`）**尚不受支持**。你
> **必须**使用 `agent="<AGENT_ID>"` 参数指定已预配的智能体或端点，
> 而不是使用 `model="..."`。因此，本技能中的代码示例使用
> `agent=...`。（这是与 Interactions 的
> [ai.google.dev](https://ai.google.dev/gemini-api/docs/interactions)
> 文档之间的主要区别，后者使用 `model=...`——虽然 `model=...` 在
> 其他 Gemini API 场景中有效，但在 Agent Platform 上**不受支持**。）
> 请按照 [Agent Platform 文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform)
> 预配智能体，并将其 ID 作为 `agent` 传入。* **轮次级参数**：
> `tools`、`system_instruction` 和 `generation_config` 等参数仅对当前轮次有效。每次
> interaction 请求都**必须**传入这些参数。

## 1. 身份验证

运行任何代码之前，请确保已使用应用默认凭据（ADC）完成身份验证，并已启用所需的 API。

1.  **登录**：
    
    ```bash
    gcloud auth application-default login
    ```
2.  **启用 API**（如果尚未启用）：
    
    ```bash
    gcloud services enable aiplatform.googleapis.com
    ```

---

## 2. 客户端初始化

你可以使用环境变量（推荐）初始化客户端，也可以传入显式配置参数。

### 选项 A：环境变量（推荐）

配置环境变量，让 SDK 自动解析设置：

```bash
export GOOGLE_GENAI_USE_ENTERPRISE=true
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="global"
```

#### Python

```python
from google import genai

# The SDK automatically picks up the environment variables
client = genai.Client()
```

#### TypeScript/JavaScript

```typescript
import { GoogleGenAI } from "@google/genai";

// The SDK automatically picks up the environment variables
const ai = new GoogleGenAI();
```

### 选项 B：显式内联参数

或者，直接在代码中传入配置值：

#### Python

```python
from google import genai
import google.auth

_, project_id = google.auth.default()
client = genai.Client(enterprise=True, project=project_id, location="global")
```

#### TypeScript/JavaScript

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    enterprise: {
        project: "your-project-id",
        location: "global"
    }
});
```

---

## 3. 核心 Interactions API 用法

### 快速入门（单轮）

提交单个提示词并读取最终文本响应。在现代架构中，输出内容从 `steps` 列表中获取。

#### Python

```python
interaction = client.interactions.create(
    agent="your-agent-id",  # GEAP: target a provisioned agent, not a base model
    input="Explain serverless computing in one sentence."
)
# Use the output_text convenience accessor (combined text from the trailing model_output steps)
print(interaction.output_text)
```

#### TypeScript/JavaScript

```typescript
const interaction = await ai.interactions.create({
    agent: "your-agent-id", // GEAP: target a provisioned agent, not a base model
    input: "Explain serverless computing in one sentence."
});
console.log(interaction.output_text);
```

---

### 有状态对话（多轮）

Interactions 默认是有状态的。将对话状态存储在云端，并在后续轮次中使用 `previous_interaction_id` 引用该状态。

#### Python

```python
# Turn 1: Introduce ourselves
# Interactions are stored by default (store=True); pass store=False to disable
# server-side retention (which also disables previous_interaction_id and background).
turn1 = client.interactions.create(
    agent="your-agent-id",
    input="Hi! My name is John. I am working on AI agents.",
    store=True
)
print(f"Turn 1: {turn1.output_text}")

# Turn 2: Refer back to the stored turn state
turn2 = client.interactions.create(
    agent="your-agent-id",
    input="What is my name?",
    previous_interaction_id=turn1.id
)
print(f"Turn 2: {turn2.output_text}")
```

#### TypeScript/JavaScript

```typescript
// Turn 1 (interactions are stored by default; pass store: false to disable)
const turn1 = await ai.interactions.create({
    agent: "your-agent-id",
    input: "Hi! My name is John. I am working on AI agents.",
    store: true
});

// Turn 2
const turn2 = await ai.interactions.create({
    agent: "your-agent-id",
    input: "What is my name?",
    previousInteractionId: turn1.id
});
console.log(turn2.output_text);
```

---

### 实时流式传输

实时流式传输响应。传入 `stream=True` 会返回一个可迭代的分块生成器。

#### Python

```python
# The stream yields typed events, not full interaction snapshots. The sequence is:
# interaction.created -> (step.start -> step.delta(s) -> step.stop)+ -> interaction.completed
for event in client.interactions.create(
    agent="your-agent-id",
    input="Write a short poem about debugging.",
    stream=True
):
    if event.event_type == "step.delta":
        if event.delta.type == "text":
            print(event.delta.text, end="", flush=True)
    elif event.event_type == "interaction.completed":
        print()
```

#### TypeScript/JavaScript

```typescript
// The stream yields typed events, not full interaction snapshots. The sequence is:
// interaction.created -> (step.start -> step.delta(s) -> step.stop)+ -> interaction.completed
const responseStream = await ai.interactions.create({
    agent: "your-agent-id",
    input: "Write a short poem about debugging.",
    stream: true
});

for await (const event of responseStream) {
    if (event.event_type === "step.delta") {
        if (event.delta.type === "text") {
            process.stdout.write(event.delta.text);
        }
    } else if (event.event_type === "interaction.completed") {
        console.log();
    }
}
```

---

### 结构化输出（Pydantic / 多态 `response_format`）

获取与模式匹配的结构化、类型安全的 JSON。在现代 Interactions API 中，多态 `response_format` 参数直接接收目标模式结构。

#### Python

```python
from pydantic import BaseModel, Field

class Book(BaseModel):
    title: str = Field(description="The title of the book")
    author: str = Field(description="The book's author")
    year_published: int

interaction = client.interactions.create(
    agent="your-agent-id",
    input="Recommend one famous sci-fi book.",
    response_format=Book
)

# The text will be a valid JSON matching the Book schema
print(interaction.output_text)
```

#### TypeScript/JavaScript

```typescript
import { Type } from "@google/genai";

const BookSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The title of the book" },
        author: { type: Type.STRING, description: "The book's author" },
        yearPublished: { type: Type.INTEGER }
    },
    required: ["title", "author", "yearPublished"]
};

const interaction = await ai.interactions.create({
    agent: "your-agent-id",
    input: "Recommend one famous sci-fi book.",
    responseFormat: BookSchema
});

console.log(interaction.output_text);
```

---

### 函数调用（智能体工具使用）

定义本地工具（函数），并将执行结果提交到有状态的交互历史记录中。

#### Python

```python
import json

def get_stock_price(ticker: str) -> float:
    """Gets the stock price for a given ticker symbol."""
    if ticker.upper() == "GOOG":
        return 175.50
    return 100.0

# Turn 1: Pass tools to the model
interaction = client.interactions.create(
    agent="your-agent-id",
    input="What is the stock price of GOOG?",
    tools=[get_stock_price]
)

# In the flat steps schema, a tool request is a top-level step of type
# "function_call" with flat `name` and `arguments` fields (no nested tool_calls).
for step in interaction.steps:
    if step.type == "function_call" and step.name == "get_stock_price":
        ticker_arg = step.arguments.get("ticker")
        price = get_stock_price(ticker_arg)

        # Turn 2: Submit the result back as a function_result step. Reference the
        # originating call via call_id=step.id, and pass tools again (turn-scoped).
        final_turn = client.interactions.create(
            agent="your-agent-id",
            input=[
                {
                    "type": "function_result",
                    "name": step.name,
                    "call_id": step.id,
                    "result": [{"type": "text", "text": json.dumps(price)}],
                }
            ],
            tools=[get_stock_price],
            previous_interaction_id=interaction.id
        )
        print(final_turn.output_text)
```

#### TypeScript/JavaScript

```typescript
import { Type } from "@google/genai";

// Define local tool
function getStockPrice({ ticker }: { ticker: string }): number {
    if (ticker.toUpperCase() === "GOOG") {
        return 175.50;
    }
    return 100.00;
}

// Turn 1: Pass tools to the model
const toolDeclaration = {
    functionDeclarations: [{
        name: "getStockPrice",
        description: "Gets the stock price for a given ticker symbol.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                ticker: { type: Type.STRING, description: "The stock ticker symbol" }
            },
            required: ["ticker"]
        }
    }]
};

const interaction = await ai.interactions.create({
    agent: "your-agent-id",
    input: "What is the stock price of GOOG?",
    tools: [toolDeclaration]
});

// In the flat steps schema, a tool request is a top-level step of type
// "function_call" with flat `name` and `arguments` fields (no nested toolCalls).
const fcStep = interaction.steps.find(s => s.type === "function_call");
if (fcStep && fcStep.name === "getStockPrice") {
    const tickerArg = fcStep.arguments.ticker as string;
    const price = getStockPrice({ ticker: tickerArg });

    // Turn 2: Submit the result back as a function_result step. Reference the
    // originating call via call_id=fcStep.id, and pass tools again (turn-scoped).
    const finalTurn = await ai.interactions.create({
        agent: "your-agent-id",
        input: [{
            type: "function_result",
            name: fcStep.name,
            call_id: fcStep.id,
            result: [{ type: "text", text: JSON.stringify(price) }]
        }],
        tools: [toolDeclaration],
        previousInteractionId: interaction.id
    });
    console.log(finalTurn.output_text);
}
```

---

## 4. 通过 REST 访问 Interactions API

对于基于 Shell 的脚本、调试或非 Python/JS 环境，你可以通过 `curl` 使用原始 HTTP/REST 请求，直接与有状态的 Interactions API 通信。

### 1. REST 端点

Interactions 的 REST API 端点为：

```http
POST https://aiplatform.googleapis.com/v1beta1/projects/{PROJECT_ID}/locations/{LOCATION}/interactions
```

*   **LOCATION**：使用 `global`（如果需要，也可以使用自定义区域）。
*   **PROJECT_ID**：你的 Google Cloud 项目 ID。

### 2. 设置变量和身份验证请求头

设置目标智能体 ID（例如模型或自定义智能体路径），以及通过应用默认凭据生成的访问令牌：

```bash
AGENT_ID="your-agent-id"
ACCESS_TOKEN=$(gcloud auth print-access-token)
```

### 3. 单轮交互载荷

使用智能体变量发送请求以启动交互：

```bash
curl -X POST "https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/global/interactions" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "'"${AGENT_ID}"'",
    "input": [{
      "type": "user_input",
      "content": [{
        "type": "text",
        "text": "Explain serverless computing in one sentence."
      }]
    }]
  }'
```

#### 响应示例
同步 POST 请求会返回一个 JSON 对象，其中包含对话步骤的详细信息和唯一标识符：

```json
{
  "id": "your-interaction-id",
  "status": "completed",
  "steps": [
    {
      "type": "model_output",
      "content": [
        {
          "type": "text",
          "text": "Serverless computing is a cloud execution model where the cloud provider dynamically manages the allocation and provisioning of servers, charging customers based on actual usage rather than pre-purchased capacity."
        }
      ]
    }
  ],
  "usage": {
    "total_tokens": 24751,
    "total_input_tokens": 23894,
    "total_output_tokens": 857
  },
  "created": "2026-05-08T10:44:43Z",
  "updated": "2026-05-08T10:44:43Z",
  "environment_id": "your-environment-id",
  "object": "interaction"
}
```

### 4. 多轮有状态交互载荷

要以有状态方式继续现有对话，请在 JSON 载荷中指定 `previous_interaction_id`：

```bash
curl -X POST "https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/global/interactions" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "'"${AGENT_ID}"'",
    "store": true,
    "previous_interaction_id": "YOUR_PREVIOUS_INTERACTION_ID",
    "input": [{
      "type": "user_input",
      "content": [{
        "type": "text",
        "text": "Can you elaborate on that?"
      }]
    }]
  }'
```

### 5. 流式输出载荷
要实时流式传输更新（Server-Sent Events 格式），请在载荷中传入 `"stream": true`：

```bash
curl -X POST "https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/global/interactions" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "'"${AGENT_ID}"'",
    "stream": true,
    "input": [{
      "type": "user_input",
      "content": [{
        "type": "text",
        "text": "Write a long story about space travel."
      }]
    }]
  }'
```

端点将返回分块流，其中每个事件都以包含 JSON 更新的 `data: ` 开头，JSON 更新中包含 `event_type` 和步骤内容。

> **`curl` 如何处理流式传输：**
> 默认情况下，传入 `"stream": true` 时，服务器会使用 `Transfer-Encoding: chunked` 和 `Content-Type: text/event-stream`（服务器发送事件，Server-Sent Events）进行响应。`curl` 会自动保持连接打开，并在服务器推送传入的数据块时将其实时输出到 `stdout`。用户无需轮询或进一步拉取；完整的事件序列会持续流式传输，直至完成。

--------------------------------------------------------------------------------

## 5. 数据模型与步骤类型参考

`Interaction` 响应包含 `steps`，它是一个由带类型的步骤对象组成的数组，
表示当前交互轮次的结构化时间线。应读取当前步骤的
`type`，而不是假定最后一个步骤是文本——末尾步骤可能是
`function_call` 或 `thought`。

### 步骤类型

**用户步骤：**

*   `user_input`：用户输入（文本、音频、多模态）。包含一个 `content`
    数组。（这就是 REST 输入载荷使用 `"type": "user_input"`，**而不是**
    `"role": "user"` 的原因。）

**模型/服务器步骤：**

*   `model_output`：模型的最终生成结果。包含一个 `content` 数组，其中可含
    `text`、`image`、`audio` 等。（REST 响应使用 `"type": "model_output"`，
    **而不是** `"role": "model"`。）
*   `thought`：模型推理/思维链。具有 `signature` 字段和
    可选的 `summary`。
*   `function_call`：工具调用请求，具有扁平的 `id`、`name` 和 `arguments`
    字段（**不存在**嵌套的 `tool_calls` 列表）。
*   `function_result`：你发回的工具结果，具有 `call_id`、`name` 和
    `result` 字段。
*   `google_search_call` / `google_search_result`、`code_execution_call` /
    `code_execution_result`、`url_context_call` / `url_context_result`、
    `mcp_server_tool_call` / `mcp_server_tool_result`、`file_search_call` /
    `file_search_result`：内置和远程工具步骤。

### 内容类型（位于 `model_output` 和 `user_input` 步骤的 `content` 数组内）

*   `text`：文本内容（`text` 字段）。
*   `image` / `audio` / `document` / `video`：包含 `data`、`mime_type`
    或 `uri` 的内容。

### 便捷访问器

*   `output_text`：末尾 `model_output` 步骤中的合并文本。
    相比手动遍历 `steps[-1].content[0].text`，应优先使用此访问器，因为当
    最后一个步骤是工具调用或思维时，手动遍历会失效。

### 流式事件类型

| 事件                    | 描述                                              |
| ----------------------- | ------------------------------------------------- |
| `interaction.created`   | 交互已创建；包含元数据。                          |
| `step.start`            | 新步骤开始。包含步骤的 `type` 和                  |
:                         : 初始元数据。                                      :
| `step.delta`            | 当前步骤的增量数据。包含一个带类型的              |
:                         : `delta` 对象（例如 `delta.type == "text"`        :
:                         : 并带有 `delta.text`）。                           :
| `step.stop`             | 步骤已完成。包含 `index`。                        |
| `interaction.completed` | 交互已完成。包含最终的 `usage`。                  |

### 存储与保留

交互默认会被存储（`store=True`），从而支持 `previous_interaction_id` 和后台执行等有状态功能。传入 `store=False` 会禁用服务器端保留，因此也会禁用 `previous_interaction_id` 和 `background`——在该模式下，你必须在每轮交互中通过 `input` 传入完整的对话历史。