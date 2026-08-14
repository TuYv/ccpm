# 使用 LlamaIndex 和 Composio 构建智能体

使用 LlamaIndex 和 Composio Tool Router 构建由 RAG 增强的 AI 智能体。

## 安装

```bash
npm install @composio/core @composio/llamaindex llamaindex
```

```bash
pip install composio-llamaindex llama-index llama-index-llms-openai
```

**查找最新版本：**
```bash
npm view llamaindex version
pip index versions llama-index | grep "Available versions" | head -1
```

## 集成方法

**LlamaIndex 是一个智能体提供程序** - 使用 Tool Router 实现用户隔离。

### 使用 Tool Router 的 Python 示例

```python
from llama_index.core.agent import ReActAgent
from llama_index.llms.openai import OpenAI
from composio_llamaindex import ComposioToolSet, App

toolset = ComposioToolSet()

def create_agent(user_id: str):
    # Create session
    session = toolset.create(
        user_id=user_id,
        toolkits=["github"],
        manage_connections=True
    )

    tools = session.tools()

    # Create agent
    llm = OpenAI(model="gpt-4o")
    agent = ReActAgent.from_tools(tools, llm=llm, verbose=True)

    return agent

agent = create_agent("user_123")
response = agent.chat("Create a GitHub issue titled 'Bug Report'")
print(response)
```

### 使用 Tool Router 的 TypeScript 示例

```typescript
import { Composio } from '@composio/core';
import { LlamaIndexProvider } from '@composio/llamaindex';
import { OpenAI, FunctionCallingAgent } from 'llamaindex';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new LlamaIndexProvider(),
});

async function createAgent(userId: string) {
  // Create session
  const session = await composio.create(userId, {
    toolkits: ['github'],
    manageConnections: true
  });

  const tools = await session.tools();

  // Create agent
  const llm = new OpenAI({ model: 'gpt-4o' });
  const agent = new FunctionCallingAgent({
    llm,
    tools,
    verbose: true,
  });

  return agent;
}

const agent = await createAgent('user_123');
const response = await agent.chat({ message: 'Create a GitHub issue' });
```

### MCP 集成

```python
# LlamaIndex also supports MCP for framework flexibility
from composio import Composio

composio = Composio()
session = composio.create(user_id="user_123", toolkits=["github"])

# Use session.mcp.url with LlamaIndex MCP adapters
```

## 主要功能

- **ReAct 智能体**：推理 + 行动模式
- **RAG + 工具**：将检索与操作相结合
- **Workflows 1.0**：事件驱动的编排
- **查询引擎**：用于高级 RAG 的工具

## 主要资源

- **LlamaIndex 文档**：https://developers.llamaindex.ai/python/framework/
- **Tool Router 指南**：`/building-agents`
- **智能体指南**：https://developers.llamaindex.ai/python/framework/use_cases/agents/
- **工作流**：https://www.llamaindex.ai/blog/announcing-workflows-1-0-a-lightweight-framework-for-agentic-systems

## 环境变量

```bash
OPENAI_API_KEY=sk-...
COMPOSIO_API_KEY=...
```

## 后续步骤

1. 使用 `/building-agents` 获取完整指南
2. 查看 `ts/examples/llamaindex/` 获取完整示例
3. 查看 [LlamaIndex 文档](https://developers.llamaindex.ai/)了解 RAG 模式