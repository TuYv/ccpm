# 使用 Composio SDK 构建 AI 智能体

本技能为使用 Composio SDK 和各种提供商框架构建 AI 智能体提供全面指导。

## 概述

Composio 集成了 10 多种主流 AI 智能体框架，让你能够为智能体添加工具和外部集成。每个特定于框架的技能都提供：
- 安装和设置提供商 SDK
- 查找最新的 SDK 版本（NPM/PyPI）
- 官方文档链接和最新示例
- 使用 Composio 工具构建智能体的代码示例
- 最佳实践和故障排查技巧

## 安装 Composio 软件包

### 在 Composio SDK 仓库（当前工作区）中工作

如果你正在 Composio SDK 仓库中进行开发，请从工作区安装软件包：

**TypeScript：**
```bash
pnpm i @composio/core @composio/<provider> --workspace
```

**示例：**
```bash
pnpm i @composio/core @composio/openai --workspace
```

### 外部项目（SDK 仓库之外）

对于 Composio SDK 仓库之外的项目，请从 NPM/PyPI 安装：

**TypeScript：**
```bash
npm install @composio/core @composio/<provider>
```

**Python：**
```bash
pip install composio-<provider>
# or
uv pip install composio-<provider>
```

**示例：**
```bash
# TypeScript
npm install @composio/core @composio/openai

# Python
pip install composio-openai
```

## 可用的框架技能

使用 `/building-agents-using-<framework>` 访问特定指南：

### 1. **building-agents-using-openai**
使用 OpenAI 的 Chat Completions API、Assistants API 和 Agents API 构建智能体。
- **语言**：TypeScript、Python
- **主要特性**：函数调用、流式处理、并行工具调用
- **模型**：GPT-4o、GPT-4o-mini、GPT-4 Turbo
- **使用场景**：通用智能体、聊天机器人、自动化

**调用：** `/building-agents-using-openai`

### 2. **building-agents-using-anthropic**
使用 Anthropic 的 Claude API 和 Claude Agent SDK 构建智能体。
- **语言**：TypeScript、Python
- **主要特性**：提示词缓存、长上下文、思考块
- **模型**：Claude 3.7 Sonnet、Claude 3.5 Sonnet、Claude 3 Opus
- **使用场景**：复杂推理、代码分析、长文档

**调用：** `/building-agents-using-anthropic`

### 3. **building-agents-using-langchain**
使用 LangChain 和 LangGraph 构建适用于生产环境的工作流智能体。
- **语言**：TypeScript、Python
- **主要特性**：基于图的智能体、中间件、状态管理
- **框架**：建议在生产环境中使用 LangGraph
- **使用场景**：多步骤工作流、带操作的 RAG、复杂智能体

**调用：** `/building-agents-using-langchain`

### 4. **building-agents-using-langgraph**
使用 LangGraph（v1.0）构建有状态且持久可靠的智能体。
- **语言**：TypeScript、Python
- **主要特性**：持久执行、人在回路、持久化记忆
- **状态**：已可用于生产环境（v1.0 于 2025 年末发布）
- **使用场景**：长时间运行的工作流、受监督智能体、多智能体系统

**调用：** `/building-agents-using-langgraph`

### 5. **building-agents-using-google**
使用 Google 的 Gemini API 和 GenAI SDK 构建智能体。
- **语言**：TypeScript、Python
- **主要功能**：组合式函数调用、并行执行、思考
- **模型**：Gemini 3 Flash/Pro、Gemini 2.5 Flash/Pro
- **使用场景**：多步骤工作流、基于位置的服务、数据分析

**调用：** `/building-agents-using-google`

### 6. **building-agents-using-vercel**
使用 Vercel AI SDK 为 TypeScript/JavaScript 应用程序构建智能体。
- **语言**：TypeScript、JavaScript
- **主要功能**：ToolLoopAgent、流式传输、多提供商支持（40+）
- **框架**：Next.js、Node.js、React、Vue、Svelte
- **使用场景**：AI 聊天机器人、Web 应用程序、全栈 AI

**调用：** `/building-agents-using-vercel`

### 7. **building-agents-using-llamaindex**
使用 LlamaIndex 构建由 RAG 增强的智能体。
- **语言**：TypeScript、Python
- **主要功能**：ReAct 智能体、将查询引擎用作工具、工作流
- **框架**：用于复杂智能体系统的 Workflows 1.0
- **使用场景**：RAG + 操作、文档机器人、代码助手

**调用：** `/building-agents-using-llamaindex`

### 8. **building-agents-using-mastra**
使用 Gatsby 团队推出的现代 TypeScript 框架 Mastra 构建智能体。
- **语言**：TypeScript
- **主要功能**：自主智能体、40+ 模型提供商、流式传输
- **状态**：v1.0 已于 2026 年 1 月发布
- **使用场景**：GitHub 自动化、Web 搜索、多工具工作流

**调用：** `/building-agents-using-mastra`

### 9. **building-agents-using-cloudflare**
使用 Cloudflare Workers AI 和 Agents SDK 构建部署在边缘的智能体。
- **语言**：TypeScript、JavaScript
- **主要功能**：边缘部署、嵌入式函数调用、Durable Objects
- **平台**：Cloudflare Workers、Workers AI
- **使用场景**：低延迟智能体、实时聊天、API 编排

**调用：** `/building-agents-using-cloudflare`

### 10. **building-agents-using-crewai**
使用 CrewAI 构建用于协作式 AI 的多智能体团队。
- **语言**：Python
- **主要功能**：基于角色的智能体、任务依赖关系、YAML 配置
- **框架**：轻量、快速、独立于 LangChain
- **使用场景**：研究与报告、内容创作、数据分析

**调用：** `/building-agents-using-crewai`

### 11. **building-agents-using-autogen**
使用 Microsoft AutoGen 构建多智能体对话系统。
- **语言**：Python
- **主要功能**：多智能体聊天、AutoGen Studio、事件驱动核心
- **状态**：Microsoft Agent Framework 是其后继框架
- **使用场景**：多智能体对话、研究、客户支持

**调用：** `/building-agents-using-autogen`

## 查找最新的 SDK 版本

每项技能都包含用于查找 Composio 软件包和提供商 SDK 最新版本的命令。

### 查找最新的 Composio 软件包版本

**NPM（TypeScript）：**
```bash
npm view @composio/<provider> version
# Example
npm view @composio/openai version
```

**PyPI（Python）：**
```bash
pip index versions composio-<provider> | grep "Available versions" | head -1
# Example
pip index versions composio-openai | grep "Available versions" | head -1
```

### 查找最新的提供商 SDK 版本

**NPM (TypeScript)：**
```bash
npm view <provider-package> version
# Example
npm view openai version
```

**PyPI (Python)：**
```bash
pip index versions <provider-package> | grep "Available versions" | head -1
# Example
pip index versions openai | grep "Available versions" | head -1
```

## 工具路由器与直接工具

Composio SDK 根据提供商类型支持两种集成方式：

### 🤖 智能体提供商（仅限工具路由器）

这些框架支持完整的修改器功能，并且对于用户隔离的会话，**必须使用工具路由器**：

| 框架 | 软件包 | 使用工具路由器的原因 |
|-----------|---------|----------------|
| **Vercel AI SDK** | `@composio/vercel` | 多智能体支持、修改器 |
| **LangChain** | `@composio/langchain` | 复杂链、状态管理 |
| **LangGraph** | `@composio/langchain` | 有状态工作流、持久性 |
| **Mastra** | `@composio/mastra` | 多提供商路由 |
| **LlamaIndex** | `@composio/llamaindex` | RAG + 智能体、工作流 |
| **Claude Agent SDK** | `@composio/claude-agent-sdk` | Claude 智能体框架 |
| **OpenAI Agents** | `@composio/openai-agents` | OpenAI Agents API |
| **Cloudflare** | `@composio/cloudflare` | 边缘智能体、Durable Objects |
| **CrewAI** | Python | 多智能体团队 |
| **AutoGen** | Python | 多智能体对话 |

**工具路由器的优势：**
- ✅ **用户隔离**：每位用户都有自己的工具会话
- ✅ **自动身份验证**：聊天内 OAuth 流程
- ✅ **作用域访问**：按用户控制工具包
- ✅ **连接管理**：自动处理 OAuth
- ✅ **生产就绪**：专为多用户应用程序构建

### 📦 非智能体提供商（直接工具）

这些提供商仅支持模式修改器，并使用**直接工具**方式：

| 框架 | 软件包 | 使用直接工具的原因 |
|-----------|---------|-----------------|
| **OpenAI** | `@composio/openai` | Chat Completions、Assistants API |
| **Anthropic** | `@composio/anthropic` | Claude Messages API |
| **Google Gemini** | `@composio/google` | GenAI SDK |

**直接工具的特点：**
- ✅ 对单用户应用更简单
- ✅ 无需会话管理
- ⚠️ 不适用于多用户生产应用
- ⚠️ 需要手动进行身份验证

### 工具路由器快速入门

```typescript
import { Composio } from '@composio/core';
import { OpenAI } from 'openai';

const composio = new Composio();
const openai = new OpenAI();

async function runAgent(userId: string, prompt: string) {
  // Create isolated session for user
  const session = await composio.create(userId, {
    toolkits: ['github'],
    manageConnections: true  // Enable auto-authentication
  });

  // Get tools from session
  const tools = await session.tools();

  // Use with OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    tools: tools,
  });

  // Handle tool calls
  if (response.choices[0].message.tool_calls) {
    const result = await composio.provider.handleToolCalls(userId, response);
    return result;
  }
}

// Each user gets isolated tools
await runAgent('user_123', 'Create a GitHub issue');
await runAgent('user_456', 'Check my Gmail');  // Different user, different session
```

### 集成框架的工具路由器

每个框架 Skill 都包含工具路由器示例。请参阅：
- `/building-agents-using-openai` - 搭配 OpenAI 使用工具路由器
- `/building-agents-using-anthropic` - 搭配 Claude 使用工具路由器
- `/building-agents-using-vercel` - 搭配 Vercel AI SDK 使用工具路由器
- 以及所有其他框架 Skill

### 进一步了解工具路由器

如需完整的工具路由器文档，请使用：
```bash
/composio-tool-router
```

## 快速入门示例

以下是一个通过 OpenAI 使用直接工具的快速示例（单用户）：

### TypeScript

```typescript
import { Composio } from '@composio/core';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

// Get tools
const tools = await composio.tools.get('default', { toolkits: ['github'] });

// Use with OpenAI
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Create a GitHub issue' }],
  tools: tools,
});

// Handle tool calls
if (response.choices[0].message.tool_calls) {
  const result = await composio.provider.handleToolCalls('default', response);
  console.log(result);
}
```

### Python

```python
from composio_openai import ComposioToolSet, Action
from openai import OpenAI

openai_client = OpenAI(api_key="YOUR_OPENAI_KEY")
composio_toolset = ComposioToolSet(api_key="YOUR_COMPOSIO_KEY")

# Get tools
tools = composio_toolset.get_tools(actions=[Action.GITHUB_CREATE_ISSUE])

# Use with OpenAI
response = openai_client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Create a GitHub issue"}],
    tools=tools,
)

# Handle tool calls
result = composio_toolset.handle_tool_calls(response)
```

## 提供商对比

| 提供商 | 语言 | 最适合 | 复杂度 | 成熟度 |
|----------|-----------|----------|------------|----------|
| OpenAI | TS, Py | 通用用途、函数调用 | 低 | 成熟 |
| Anthropic | TS, Py | 复杂推理、长上下文 | 低 | 成熟 |
| LangChain | TS, Py | 多智能体工作流原型设计 | 中 | 成熟 |
| LangGraph | TS, Py | 生产级有状态智能体 | 高 | 成熟（v1.0） |
| Google Gemini | TS, Py | 组合式函数调用 | 低 | 成熟 |
| Vercel AI SDK | TS | 全栈 Web 应用程序 | 低 | 成熟（v6.0） |
| LlamaIndex | TS, Py | RAG + 智能体 | 中 | 成熟 |
| Mastra | TS | 现代 TypeScript 应用 | 低 | 新兴（v1.0 2026） |
| Cloudflare | TS | 部署在边缘的智能体 | 中 | 发展中 |
| CrewAI | Py | 多智能体团队 | 中 | 成熟 |
| AutoGen | Py | 研究型多智能体系统 | 高 | 成熟 |

## Composio 通用功能

所有框架都支持以下 Composio 功能：

### 1. 工具管理
```typescript
// Get tools by app
const tools = await composio.tools.get('default', { apps: ['github', 'slack'] });

// Get specific actions
const tools = await composio.tools.get('default', { actions: ['GITHUB_CREATE_ISSUE'] });

// Get by toolkit
const tools = await composio.tools.get('default', { toolkits: ['github'] });
```

### 2. 已连接的账户
```typescript
// Manage user integrations
const account = await composio.connectedAccounts.initiate({
  integrationId: 'github',
  entityId: 'user-123',
});
```

### 3. 自定义工具
```typescript
import { experimental_createTool } from '@composio/core';
import { z } from 'zod';

// Custom tools are session-scoped: define a local tool, then attach it
// when creating a Tool Router session.
const myTool = experimental_createTool('MY_TOOL', {
  name: 'My Tool',
  description: 'Tool description',
  inputParams: z.object({ param: z.string() }),
  execute: async input => ({ result: input.param }),
});

const session = await composio.create('user-id', {
  experimental: { customTools: [myTool] },
});
```

## 环境变量

大多数示例需要：

```bash
# Composio
COMPOSIO_API_KEY=...

# LLM Provider (choose one or more)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

## 文档资源

- **Composio 文档**：https://docs.composio.dev/
- **Composio GitHub**：https://github.com/composiohq/composio-sdk
- **API 参考**：https://docs.composio.dev/api-reference
- **示例**：查看此仓库中的 `ts/examples/` 和 `python/examples/`

## 获取帮助

- **Discord**：https://discord.gg/composio
- **GitHub Issues**：https://github.com/composiohq/composio-sdk/issues
- **文档**：https://docs.composio.dev/

## 后续步骤

1. 从上面的列表中选择一个框架
2. 调用相应的 Skill（例如 `/building-agents-using-openai`）
3. 按照安装和设置说明操作
4. 尝试代码示例
5. 构建你的智能体！

## 提示

- **从简单入手** - 首先使用 OpenAI 或 Anthropic，它们最容易设置
- **使用 LangGraph** 构建生产环境中的有状态智能体
- **尝试 Vercel AI SDK** 构建全栈 Web 应用程序
- **使用 CrewAI** 构建多智能体协作系统
- **查看示例**，获取仓库中可运行的代码
- **阅读框架文档**，了解每个 Skill 中链接的高级功能