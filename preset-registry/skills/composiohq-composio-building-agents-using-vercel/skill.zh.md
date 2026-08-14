# 使用 Vercel AI SDK 与 Composio 构建智能体

使用 Vercel AI SDK 和 Composio Tool Router 构建具有用户隔离工具会话的 AI 智能体。

## 安装

```bash
npm install @composio/core @composio/vercel ai @ai-sdk/openai
```

**查找最新版本：**
```bash
npm view ai version
npm view @composio/vercel version
```

## 集成方式

**Vercel AI SDK 是智能体式提供程序**——使用 Tool Router 实现用户隔离。

### 原生工具（推荐）

```typescript
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
});

async function runAgent(userId: string, prompt: string) {
  // Create user session
  const session = await composio.create(userId, {
    toolkits: ['github'],
    manageConnections: true
  });

  // Get native Vercel-formatted tools
  const tools = await session.tools();

  // Use with Vercel AI SDK
  const result = await generateText({
    model: openai('gpt-4o'),
    prompt,
    tools,
    maxSteps: 10,
  });

  return result.text;
}

await runAgent('user_123', 'Create a GitHub issue');
```

### MCP 集成（可选）

```typescript
import { Composio } from '@composio/core';
import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';
import { streamText } from 'ai';

const composio = new Composio();

async function runAgentMCP(userId: string, prompt: string) {
  // Create session
  const session = await composio.create(userId, {
    toolkits: ['github'],
    manageConnections: true
  });

  // Connect via MCP
  const client = await createMCPClient({
    transport: {
      type: 'http',
      url: session.mcp.url,
      headers: session.mcp.headers
    }
  });

  const tools = await client.tools();

  // Use with any framework
  const stream = await streamText({
    model: openai('gpt-4o'),
    prompt,
    tools,
  });

  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk);
  }
}
```

## 关键资源

- **Vercel AI SDK 文档**：https://ai-sdk.dev/docs/introduction
- **Tool Router 指南**：`/building-agents`
- **构建智能体指南**：https://vercel.com/kb/guide/how-to-build-ai-agents-with-vercel-and-the-ai-sdk
- **原生工具与 MCP 对比**：使用原生工具可获得更好的性能，使用 MCP 可获得更高的框架灵活性

## 环境变量

```bash
COMPOSIO_API_KEY=...
OPENAI_API_KEY=...  # Or other model provider
```

## 后续步骤

1. 使用 `/building-agents` 查看全面的 Tool Router 文档
2. 查看 `ts/examples/vercel/` 获取完整示例
3. 参阅 [Vercel AI SDK 文档](https://ai-sdk.dev)了解特定于框架的功能