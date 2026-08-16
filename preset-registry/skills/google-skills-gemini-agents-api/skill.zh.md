---
name: gemini-agents-api
metadata:
  category: AiAndMachineLearning
description: Manages custom Agent resources on Gemini Enterprise Agent Platform. Use when the user wants to programmatically create, configure, list, update, or delete stateful, server-managed Agent resources (including mounting files, skills, and tools) before executing conversations.
---
# Gemini Enterprise Agent Platform - 托管式 Agents API 技能

此技能提供完整的说明、REST 请求端点和 JSON 载荷结构，用于以编程方式管理 Gemini Enterprise Agent Platform（Agent Platform）上的**自定义 Agent 资源**。

**Managed Agents API** 构成了该平台的**控制平面**。开发者可使用它预配、检索、更新和删除定制的有状态 Agent 容器，这些容器配备了系统指令、沙盒化文件、自定义技能注册表以及本地/远程工具。
---

## 1. 身份验证与设置

所有发送到控制平面的 REST 请求都必须包含一个派生自应用默认凭据（ADC）的 Bearer 令牌，并以生产环境全局端点为目标。

### 1. 设置环境变量

运行请求之前，请设置所需的项目变量和访问令牌：

```bash
export PROJECT_ID="your-project-id"
export LOCATION="global"
export ACCESS_TOKEN=$(gcloud auth print-access-token)
```

> [!IMPORTANT]
> **API 位置支持**：
> `LOCATION` 环境变量必须设置为 Gemini Enterprise Agent Platform 的 **Managed Agents API** 当前支持的区域位置（例如 `global` 或其他可用的区域端点）。


### 2. 端点 URL

生产环境的 Agents 控制平面端点为：

```http
https://aiplatform.googleapis.com/v1beta1/projects/{PROJECT_ID}/locations/{LOCATION}/agents
```

---

## 2. 以编程方式管理 Agent（控制平面 CRUD）

### 1. 创建 Agent（长时间运行的操作）

要创建新的 Agent 资源，请使用自定义配置发送 `POST` 请求。你可以将 **Google Cloud Storage** 存储桶中的远程文件、文件夹或技能直接挂载到 Agent 容器的工作区中。创建 Agent 是一个长时间运行的操作（LRO），会启动一个异步作业。

*   **方法**：`POST`
*   **端点**：`https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/agents`

#### 请求载荷

```bash
curl -X POST "https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/agents" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "id": "my-custom-agent",
    "base_agent": "antigravity-preview-05-2026",
    "description": "A professional agent configured with remote tools and mounted Cloud Storage directories.",
    "system_instruction": "You are a helpful, domain-expert assistant.",
    "tools": [
      {"type": "code_execution"},
      {"type": "filesystem"},
      {"type": "google_search"},
      {"type": "url_context"}
    ],
    "base_environment": {
      "type": "remote",
      "sources": [
        {
          "type": "gcs",
          "source": "gs://your-agent-bucket-name/skills",
          "target": "/.agent/skills"
        }
      ],
      "network": {
        "allowlist": [
          { "domain": "*" }
        ]
      }
    }
  }'
```

#### LRO 操作响应

由于预配 Agent 需要一些时间，该端点会立即返回一个操作跟踪对象：

```json
{
  "name": "projects/1234567890/locations/global/operations/operation-987654321-abcde",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1beta1.CreateAgentOperationMetadata",
    "genericMetadata": {
      "createTime": "2026-05-14T19:00:00.123456Z",
      "updateTime": "2026-05-14T19:00:01.654321Z"
    }
  }
}
```

#### [高级] 挂载 Skill Registry 资源

要直接从 Skill Registry 服务挂载技能，而不是从 Cloud Storage 挂载，请替换载荷中的 Cloud Storage 来源项：

```json
"sources": [
  {
    "type": "skill_registry",
    "source": "projects/your-project-id/locations/global/skills/my-math-skill/revisions/123456789012",
    "target": "/.agent/skills"
  }
]
```

#### [高级] 配置模型上下文协议（MCP）服务器

要为智能体配置第三方 MCP 服务器，请直接在创建请求内的 `"tools"` 参数数组下添加服务器元数据。平台会将工具执行请求安全地路由到外部 MCP 服务器。

> [!IMPORTANT]
> **MCP 安全性说明**：在描述 MCP 工具配置时，你必须说明平台会将工具请求安全地路由到指定的 MCP 服务器，并且只会将自定义标头/令牌发送到该 URL，从而保证标头的机密性。

```json
"tools": [
  {
    "type": "mcp",
    "name": "my-mcp-server",
    "url": "https://mcp.yourcompany.com/api",
    "headers": {
      "Authorization": "Bearer YOUR_MCP_AUTH_TOKEN"
    }
  }
]
```

*   **name**：MCP 服务器的描述性名称。
*   **url**：外部 MCP 服务器的端点 URL。
*   **headers**：（可选）调用服务器所需的、包含身份验证令牌（例如 API 密钥、不记名令牌）的自定义键值对。平台保证这些标头只会发送到指定的 MCP 服务器 URL。

> [!TIP]
> **在交互时覆盖 MCP（数据平面）**：
> 创建对话交互（数据平面）时，你可以通过在 `interactions.create` 的 `"tools"` 载荷中传递 `"type": "mcp_server"`，直接动态覆盖或提供 MCP 工具。有关详细信息，请参阅 Interactions API 文档。

---

### 2. 轮询 LRO 状态

要跟踪智能体创建状态并获取最终就绪的资源，请轮询创建响应的 `name` 字段中返回的操作 URL。

*   **方法**：`GET`
*   **端点**：`https://aiplatform.googleapis.com/v1beta1/{OPERATION_NAME}`

```bash
curl -X GET "https://aiplatform.googleapis.com/v1beta1/projects/1234567890/locations/global/operations/operation-987654321-abcde" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"
```

#### 进行中的响应

```json
{
  "name": "projects/1234567890/locations/global/operations/operation-987654321-abcde",
  "metadata": { ... }
}
```

#### 成功完成的响应

容器就绪后，`"done": true` 会被设置，并且已完成的 `Agent` 资源描述会位于 `"response"` 内：

```json
{
  "name": "projects/1234567890/locations/global/operations/operation-987654321-abcde",
  "done": true,
  "response": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1beta1.Agent",
    "name": "projects/your-project-id/locations/global/agents/my-custom-agent",
    "base_agent": "antigravity-preview-05-2026",
    "description": "A professional agent configured with remote tools and mounted Cloud Storage directories.",
    "system_instruction": "You are a helpful, domain-expert assistant."
  }
}
```

---

### 3. 获取智能体

检索现有自定义智能体的配置元数据、工具和环境设置。

*   **方法**：`GET`
*   **端点**：`https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/agents/{AGENT_ID}`

```bash
curl -X GET "https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/global/agents/my-custom-agent" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"
```

#### 响应示例
返回自定义智能体资源的完整配置状态：

```json
{
  "name": "projects/your-project-id/locations/global/agents/my-custom-agent",
  "base_agent": "antigravity-preview-05-2026",
  "description": "A professional agent configured with remote tools and mounted Cloud Storage directories.",
  "system_instruction": "You are a helpful, domain-expert assistant.",
  "tools": [
    {"type": "code_execution"},
    {"type": "filesystem"},
    {"type": "google_search"},
    {"type": "url_context"}
  ],
  "base_environment": {
    "type": "remote",
    "sources": [
      {
        "type": "gcs",
        "source": "gs://your-agent-bucket-name/skills",
        "target": "/.agent/skills"
      }
    ],
    "network": {
      "allowlist": [
        { "domain": "*" }
      ]
    }
  }
}
```

---

### 4. 列出智能体

检索目标 Google Cloud 项目下配置的所有自定义智能体的列表。

*   **方法**：`GET`
*   **端点**：`https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/agents`

```bash
curl -X GET "https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/global/agents" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"
```

#### 响应示例
返回目标项目下配置的所有自定义智能体的 JSON 列表：

```json
{
  "agents": [
    {
      "name": "projects/your-project-id/locations/global/agents/my-custom-agent",
      "base_agent": "antigravity-preview-05-2026",
      "description": "A professional agent configured with remote tools and mounted Cloud Storage directories.",
      "system_instruction": "You are a helpful, domain-expert assistant."
    },
    {
      "name": "projects/your-project-id/locations/global/agents/my-telecom-agent",
      "base_agent": "antigravity-preview-05-2026",
      "description": "A highly specialized telecom support agent.",
      "system_instruction": "You are a professional telecom support agent. Follow system policies carefully."
    }
  ]
}
```

---

### 5. 更新 Agent（修补配置）

就地修改自定义 Agent 资源的配置字段（例如指令、描述、工具或挂载）。你**必须**使用 `update_mask` 查询参数指定要更新的字段。

> [!IMPORTANT]
> **更新掩码要求**：在演示更新操作时，必须始终明确说明：更新 Agent 配置时，必须使用 `update_mask` 参数准确指定要修改的字段，以避免覆盖其他配置设置。

*   **方法**：`PATCH`
*   **端点**：`https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/agents/{AGENT_ID}?update_mask=system_instruction`

```bash
curl -X PATCH "https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/global/agents/my-custom-agent?update_mask=system_instruction" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-custom-agent",
    "system_instruction": "You are a highly specialized telecom support agent. Follow system policies carefully."
  }'
```

---

### 6. 删除 Agent

当不再需要自定义 Agent 资源时，将其删除以释放后端工作区容器。

*   **方法**：`DELETE`
*   **端点**：`https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/agents/{AGENT_ID}`

```bash
curl -X DELETE "https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/global/agents/my-custom-agent" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

#### 响应示例
成功的删除请求会返回空的 JSON 响应正文，HTTP 状态为 `200 OK`：

```json
{}
```

---

## 3. 与自定义 Agent 交互（数据平面）

使用**控制平面**（本 Skill）以编程方式创建并预配自定义有状态 Agent 后，你可以通过**数据平面**（**Interactions API**）与其进行多轮聊天、工具执行和流式对话。

> [!IMPORTANT]
> **Interactions 参考资料**：在说明或展示如何与自定义 Agent 开始对话时，必须始终明确引导用户参阅 `gemini-interactions-api` Skill，以了解完整的对话和流式传输选项。

要与你的自定义 Agent 交互：

1.  获取 Agent 的资源路径名称（例如 `projects/{PROJECT_ID}/locations/global/agents/{AGENT_ID}`）。
2.  在数据平面对话请求中，通过 **`agent`** 参数直接传入此资源路径。

#### Python 示例

```python
interaction = client.interactions.create(
    agent="projects/your-project-id/locations/global/agents/my-custom-agent",
    input="Hello! Who are you?"
)
```

#### REST / curl 示例

```json
{
  "agent": "projects/your-project-id/locations/global/agents/my-custom-agent",
  "input": [{
    "type": "user_input",
    "content": [{"type": "text", "text": "Hello! Who are you?"}]
  }]
}
```

有关使用已预配 Agent 运行对话的完整说明、Python 和 TS/JS 代码块以及流式传输设置，请参阅 **`gemini-interactions-api`** Skill 指南（`../gemini-interactions-api/SKILL.md`）。

