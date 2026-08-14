# 使用 Mastra 与 Composio 构建智能体

使用 Mastra 与 Composio Tool Router 构建 AI 智能体。

## 安装

```bash
npm install @composio/core @composio/mastra @mastra/core
```

**查找最新版本：**
```bash
npm view @mastra/core version
npm view @composio/mastra version
```

## 集成方法

**Mastra 是一个智能体提供方**——使用 Tool Router 实现用户隔离。

### 将原生工具与 Tool Router 配合使用

```typescript
import { Composio } from '@composio/core';
import { MastraProvider } from '@composio/mastra';
import { Agent } from '@mastra/core/agent';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new MastraProvider(),
});

async function createAgent(userId: string) {
  // Create session
  const session = await composio.create(userId, {
    toolkits: ['github'],
    manageConnections: true
  });

  const tools = await session.tools();

  // Create agent
  const agent = new Agent({
    id: 'github-agent',
    name: 'GitHub Agent',
    instructions: 'You manage GitHub repositories',
    model: 'openai/gpt-4o',
    tools: {
      ...tools,  // Spread Composio tools
    },
  });

  return agent;
}

const agent = await createAgent('user_123');
const result = await agent.generate({
  prompt: 'Create a GitHub issue titled "Bug Report"',
});

console.log(result.text);
```

### 使用 Tool Router 进行流式传输

```typescript
async function streamAgent(userId: string, prompt: string) {
  const session = await composio.create(userId, {
    toolkits: ['github'],
    manageConnections: true
  });

  const tools = await session.tools();

  const agent = new Agent({
    id: 'agent',
    model: 'openai/gpt-4o',
    tools: { ...tools },
    maxSteps: 10,
  });

  // Stream response
  const stream = await agent.stream({
    prompt,
    onStepFinish: (step) => {
      console.log('Step completed:', step);
    },
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
}
```

## 主要特性

- **40 多个模型提供方**：OpenAI、Anthropic、Google、Mistral、Groq 等。
- **自主智能体**：解决开放式任务
- **流式传输支持**：实时响应
- **v1.0 已发布**：2026 年 1 月——已可用于生产环境

## 主要资源

- **Mastra 文档**：https://mastra.ai/docs
- **Tool Router 指南**：`/building-agents`
- **智能体指南**：https://mastra.ai/docs/agents/overview
- **GitHub**：https://github.com/mastra-ai/mastra

## 环境变量

```bash
OPENAI_API_KEY=sk-...  # Or other model provider
COMPOSIO_API_KEY=...
```

## 后续步骤

1. 使用 `/building-agents` 查看综合指南
2. 查看 `ts/examples/mastra/` 获取完整示例
3. 查看 [Mastra 文档](https://mastra.ai/docs)，了解多提供方路由