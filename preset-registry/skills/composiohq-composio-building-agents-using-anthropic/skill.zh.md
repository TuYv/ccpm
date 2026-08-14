# 使用 Anthropic 与 Composio 构建智能体

使用 Anthropic 的 Claude API 和 Composio 工具构建 AI 智能体。

## 安装

```bash
npm install @composio/core @composio/anthropic @anthropic-ai/sdk
npm install @composio/claude-agent-sdk @anthropic-ai/claude-agent-sdk  # For Agent SDK
```

```bash
pip install composio-anthropic
```

**查找最新版本：**
```bash
npm view @anthropic-ai/sdk version
pip index versions anthropic | grep "Available versions" | head -1
```

## 集成方式

**Anthropic Messages API 是非智能体式的**——使用直接工具。**Claude Agent SDK 是智能体式的**——使用 Tool Router。

### Messages API（非智能体式）

```typescript
import { Composio } from '@composio/core';
import { AnthropicProvider } from '@composio/anthropic';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new AnthropicProvider({ cacheTools: true }),
});

// Get tools
const tools = await composio.tools.get('default', { toolkits: ['github'] });

// Use with Claude
const message = await anthropic.messages.create({
  model: 'claude-3-7-sonnet-latest',
  max_tokens: 1024,
  tools: tools,
  messages: [{ role: 'user', content: 'Create a GitHub issue' }],
});

// Handle tool calls
const toolResults = await composio.provider.handleToolCalls('default', message);
```

```python
from composio_anthropic import ComposioToolSet, Action
from anthropic import Anthropic

client = Anthropic(api_key="YOUR_KEY")
composio_toolset = ComposioToolSet(api_key="YOUR_KEY")

# Get tools
tools = composio_toolset.get_tools(actions=[Action.GITHUB_CREATE_ISSUE])

# Use with Claude
message = client.messages.create(
    model="claude-3-7-sonnet-latest",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "Create a GitHub issue"}]
)

# Handle tool calls
tool_results = composio_toolset.handle_tool_calls(message)
```

### Claude Agent SDK（智能体式——需要 Tool Router）

```typescript
import { Composio } from '@composio/core';
import { ClaudeAgentSDKProvider } from '@composio/claude-agent-sdk';
import { query } from '@anthropic-ai/claude-agent-sdk';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new ClaudeAgentSDKProvider()
});

async function runAgent(userId: string, prompt: string) {
  // Create session
  const session = await composio.create(userId, {
    toolkits: ['github'],
    manageConnections: true
  });

  const tools = await session.tools();

  // Use with Claude Agent SDK
  const stream = await query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5-20250929',
      permissionMode: 'bypassPermissions',
      tools
    }
  });

  for await (const event of stream) {
    if (event.type === 'result' && event.subtype === 'success') {
      console.log(event.result);
    }
  }
}
```

## 关键资源

- **Anthropic 文档**：https://docs.anthropic.com/
- **工具使用指南**：https://docs.anthropic.com/en/docs/build-with-claude/tool-use
- **Claude Agent SDK**：https://docs.anthropic.com/en/docs/agents
- **Messages API（非智能体式）**：直接工具
- **Claude Agent SDK（智能体式）**：使用 Tool Router

## 环境变量

```bash
ANTHROPIC_API_KEY=sk-ant-...
COMPOSIO_API_KEY=...
```

## 后续步骤

1. 对于 Agent SDK（智能体开发），请使用 `/building-agents`
2. 查看 `ts/examples/anthropic/` 获取完整示例
3. 有关 Claude 功能，请参阅 [Anthropic 文档](https://docs.anthropic.com/)