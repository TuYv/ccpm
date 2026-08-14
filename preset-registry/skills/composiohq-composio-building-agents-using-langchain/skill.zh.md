# 使用 LangChain 和 Composio 构建智能体

使用 LangChain/LangGraph 与 Composio Tool Router 构建 AI 智能体。

## 安装

```bash
npm install @composio/core @composio/langchain langchain @langchain/core @langchain/openai
```

```bash
pip install composio-langchain langchain langchain langchain-openai
```

**查找最新版本：**
```bash
npm view langchain version
pip index versions langchain | grep "Available versions" | head -1
```

## 集成方式

**LangChain 是一个智能体提供方**——请使用 Tool Router（或使用 MCP 以获得更高的灵活性）。

### 通过 Tool Router 使用原生工具

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { Composio } from '@composio/core';
import { LangchainProvider } from '@composio/langchain';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new LangchainProvider(),
});

async function runAgent(userId: string, prompt: string) {
  // Create session
  const session = await composio.create(userId, {
    toolkits: ['github'],
    manageConnections: true
  });

  const tools = await session.tools();

  // Use with LangChain
  const llm = new ChatOpenAI({ model: 'gpt-4o' });
  const agent = llm.bindTools(tools);

  const result = await agent.invoke(prompt);
  return result;
}
```

```python
from langchain_openai import ChatOpenAI
from composio_langchain import ComposioToolSet, App

composio_toolset = ComposioToolSet()

def run_agent(user_id: str, prompt: str):
    # Create session
    session = composio_toolset.create(
        user_id=user_id,
        toolkits=["github"],
        manage_connections=True
    )

    tools = session.tools()

    # Use with LangChain
    llm = ChatOpenAI(model="gpt-4o")
    agent = llm.bind_tools(tools)

    result = agent.invoke(prompt)
    return result
```

### MCP 集成

```typescript
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { Composio } from '@composio/core';

const composio = new Composio();

async function runAgentMCP(userId: string) {
  const session = await composio.create(userId, {
    toolkits: ['github']
  });

  const client = new MultiServerMCPClient({
    composio: {
      transport: 'http',
      url: session.mcp.url,
      headers: session.mcp.headers
    }
  });

  const tools = await client.getTools();
  // Use tools with LangChain
}
```

## 关键资源

- **LangChain 文档**：https://python.langchain.com/docs/introduction/
- **Tool Router 指南**：`/building-agents`
- **智能体文档**：https://docs.langchain.com/oss/python/langchain/agents
- **在生产环境中使用 LangGraph**：更灵活的智能体运行时

## 环境变量

```bash
OPENAI_API_KEY=sk-...  # Or other LLM provider
COMPOSIO_API_KEY=...
```

## 后续步骤

1. 使用 `/building-agents` 获取完整指南
2. 使用 `/building-agents-using-langgraph` 构建有状态智能体
3. 查看 `ts/examples/langchain/` 获取完整示例