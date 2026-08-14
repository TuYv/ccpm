# 使用 LangGraph 与 Composio 构建智能体

使用 LangGraph 和 Composio Tool Router 构建有状态、持久可靠的 AI 智能体。

## 安装

```bash
npm install @composio/core @composio/langchain @langchain/langgraph @langchain/core
```

```bash
pip install composio-langchain langgraph langgraph-checkpoint-sqlite
```

**查找最新版本：**
```bash
npm view @langchain/langgraph version
pip index versions langgraph | grep "Available versions" | head -1
```

## 集成方法

**LangGraph 是一个智能体提供方**——使用 Tool Router 实现用户隔离。

### 使用 Tool Router 的 Python 示例

```python
from langgraph.graph import StateGraph, MessagesAnnotation, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_openai import ChatOpenAI
from composio_langchain import ComposioToolSet

toolset = ComposioToolSet()

def create_agent(user_id: str):
    # Create session
    session = toolset.create(
        user_id=user_id,
        toolkits=["github"],
        manage_connections=True
    )

    tools = session.tools()

    # Create graph
    tool_node = ToolNode(tools)
    model = ChatOpenAI(model="gpt-4o").bind_tools(tools)

    def should_continue(state):
        last_message = state["messages"][-1]
        return "tools" if hasattr(last_message, "tool_calls") and last_message.tool_calls else END

    def call_model(state):
        return {"messages": [model.invoke(state["messages"])]}

    workflow = StateGraph(MessagesAnnotation)
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", tool_node)
    workflow.add_edge(START, "agent")
    workflow.add_edge("tools", "agent")
    workflow.add_conditional_edges("agent", should_continue)

    # Compile with checkpointer for durability
    memory = SqliteSaver.from_conn_string(":memory:")
    app = workflow.compile(checkpointer=memory)

    return app

# Use with thread_id for persistence
app = create_agent("user_123")
result = app.invoke(
    {"messages": [{"role": "user", "content": "Create a GitHub issue"}]},
    config={"configurable": {"thread_id": "user-123"}}
)
```

### 使用 Tool Router 的 TypeScript 示例

```typescript
import { StateGraph, MessagesAnnotation, START, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { Composio } from '@composio/core';
import { LangchainProvider } from '@composio/langchain';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new LangchainProvider(),
});

async function createAgent(userId: string) {
  const session = await composio.create(userId, {
    toolkits: ['github'],
    manageConnections: true
  });

  const tools = await session.tools();
  const toolNode = new ToolNode(tools);
  const model = new ChatOpenAI({ model: 'gpt-4o' }).bindTools(tools);

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', async (state) => ({ messages: [await model.invoke(state.messages)] }))
    .addNode('tools', toolNode)
    .addEdge(START, 'agent')
    .addEdge('tools', 'agent')
    .addConditionalEdges('agent', (state) => {
      const last = state.messages[state.messages.length - 1];
      return last.tool_calls?.length ? 'tools' : END;
    });

  return workflow.compile();
}
```

## 核心特性

- **持久执行**：智能体在发生故障后仍可继续运行
- **人在回路**：暂停以等待批准
- **持久记忆**：跨会话保存状态
- **生产就绪**：v1.0 已于 2025 年末发布

## 核心资源

- **LangGraph 文档**：https://docs.langchain.com/oss/python/langgraph/
- **工具路由指南**：`/building-agents`
- **LangGraph v1.0**：https://www.blog.langchain.com/langchain-langgraph-1dot0/

## 环境变量

```bash
OPENAI_API_KEY=sk-...
COMPOSIO_API_KEY=...
```

## 后续步骤

1. 使用 `/building-agents` 获取全面指南
2. 查看 `ts/examples/langchain/` 中的完整示例
3. 有关高级功能，请参阅 [LangGraph 文档](https://docs.langchain.com/oss/python/langgraph/)