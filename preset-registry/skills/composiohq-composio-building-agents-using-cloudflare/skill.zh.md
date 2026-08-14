# 使用 Cloudflare 与 Composio 构建智能体

使用 Cloudflare Workers AI 和 Composio Tool Router 构建部署在边缘的 AI 智能体。

## 安装

```bash
npm install @composio/core @composio/cloudflare agents @cloudflare/ai-utils
npm install wrangler -D  # For development
```

**查找最新版本：**
```bash
npm view agents version
npm view @composio/cloudflare version
```

## 集成方式

**Cloudflare 是智能体提供商** - 使用 Tool Router 实现用户隔离。

### 将原生工具与 Tool Router 结合使用

```typescript
import { Agent } from 'agents';
import { Composio } from '@composio/core';
import { CloudflareProvider } from '@composio/cloudflare';

export class MyAgent extends Agent {
  private composio: Composio;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    this.composio = new Composio({
      apiKey: env.COMPOSIO_API_KEY,
      provider: new CloudflareProvider(),
    });
  }

  async onStart() {
    // Initialize with user-specific session
    const session = await this.composio.create(this.userId, {
      toolkits: ['github'],
      manageConnections: true
    });

    this.tools = await session.tools();
  }

  async handleMessage(message: string) {
    // Use tools with Cloudflare AI
    const response = await this.ai.run('@cf/meta/llama-3.1-70b-instruct', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: message },
      ],
      tools: this.tools,
    });

    return response;
  }
}
```

### wrangler.toml 配置

```toml
name = "my-agent"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[durable_objects.bindings]]
name = "MY_AGENT"
class_name = "MyAgent"

[ai]
binding = "AI"

[vars]
COMPOSIO_API_KEY = "your-key-here"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["MyAgent"]
```

## 主要功能

- **边缘部署**：在全球范围内实现低延迟
- **Durable Objects**：持久化智能体状态
- **Workers AI**：在边缘运行模型
- **嵌入式函数调用**：AI 自动执行函数

## 重要资源

- **Cloudflare Agents SDK**：https://developers.cloudflare.com/agents/
- **Tool Router 指南**：`/building-agents`
- **Workers AI**：https://developers.cloudflare.com/workers-ai/
- **函数调用**：https://developers.cloudflare.com/workers-ai/features/function-calling/

## 环境变量

```bash
COMPOSIO_API_KEY=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

## 部署

```bash
# Deploy with Wrangler
npx wrangler deploy

# Tail logs
npx wrangler tail
```

## 后续步骤

1. 使用 `/building-agents` 获取全面指南
2. 查看 `ts/examples/cloudflare-wrangler/` 获取完整示例
3. 查阅 [Cloudflare 文档](https://developers.cloudflare.com/agents/)了解边缘功能