# 使用 OpenAI 和 Composio 构建智能体

使用 OpenAI 的 API 和 Composio 工具构建 AI 智能体。

## 安装

```bash
npm install @composio/core @composio/openai openai
npm install @composio/openai-agents @openai/agents  # For Agents API
```

```bash
pip install composio-openai
```

**查找最新版本：**
```bash
npm view openai version
pip index versions openai | grep "Available versions" | head -1
```

## 集成方式

**OpenAI 是非智能体式提供商**——使用直接工具（不支持 Tool Router）。

### Chat Completions API

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
}
```

```python
from composio_openai import ComposioToolSet, Action
from openai import OpenAI

openai_client = OpenAI(api_key="YOUR_KEY")
composio_toolset = ComposioToolSet(api_key="YOUR_KEY")

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

### OpenAI Agents API（智能体式——需要 Tool Router）

```typescript
import { Composio } from '@composio/core';
import { OpenAIAgentsProvider } from '@composio/openai-agents';
import { Agent, run } from '@openai/agents';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new OpenAIAgentsProvider()
});

async function createAgent(userId: string) {
  // Create session for user
  const session = await composio.create(userId, {
    toolkits: ['github'],
    manageConnections: true
  });

  const tools = await session.tools();

  const agent = new Agent({
    name: 'GitHub Agent',
    model: 'gpt-4o',
    instructions: 'You help with GitHub operations',
    tools
  });

  return agent;
}

const agent = await createAgent('user_123');
const result = await run(agent, 'Create a GitHub issue');
```

## 关键资源

- **OpenAI 文档**：https://platform.openai.com/docs
- **函数调用**：https://platform.openai.com/docs/guides/function-calling
- **Agents API**：https://platform.openai.com/docs/agents
- **OpenAI Agents SDK（智能体式）**：将 Tool Router 与 `@composio/openai-agents` 配合使用

## 环境变量

```bash
OPENAI_API_KEY=sk-...
COMPOSIO_API_KEY=...
```

## 后续步骤

1. 对于 Agents API（智能体式），请使用 `/building-agents`
2. 查看 `ts/examples/openai/` 中的完整示例
3. 有关 API 功能，请参阅 [OpenAI 文档](https://platform.openai.com/docs)