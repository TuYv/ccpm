# 在真实场景中测试 Composio SDK

使用临时测试项目验证 Composio SDK 的可行性。切勿提交这些测试。

## 概述

此技能通过创建临时测试项目来帮助验证 SDK 功能，这些项目将：
- 测试智能体式（Tool Router）和非智能体式（Direct Tools）两种方法
- 使用 HackerNews 等无需身份验证的应用进行快速验证
- 识别 SDK 或提供商中的错误和质量问题
- 自动清理——绝不提交到代码仓库

## 测试方法

### 1. 创建临时测试项目

始终使用 .agent_cache 目录进行测试：
```bash
# Create test directory in .agent_cache (gitignored)
TEST_DIR=".agent_cache/sdk-test-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Initialize project
npm init -y
npm install @composio/core openai
```

### 2. 测试非智能体式提供商（Direct Tools）

测试不使用 Tool Router 的简单工具执行：

```typescript
// test-direct-tools.ts
import { Composio } from '@composio/core';
import OpenAI from 'openai';

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testDirectTools() {
  // Get HackerNews tools (no auth required)
  const tools = await composio.tools.get('default', {
    toolkits: ['hackernews']
  });

  console.log(`✓ Got ${tools.length} HackerNews tools`);

  // Test with OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [{ role: 'user', content: 'Get top 5 HackerNews stories' }],
    tools: tools,
  });

  // Handle tool calls
  if (response.choices[0].message.tool_calls) {
    const result = await composio.provider.handleToolCalls('default', response);
    console.log('✓ Tool execution successful');
    return result;
  }
}

testDirectTools().catch(console.error);
```

### 3. 测试智能体式提供商（Tool Router）

测试使用 Tool Router 实现用户隔离的会话：

```typescript
// test-tool-router.ts
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
});

async function testToolRouter() {
  // Create session for test user
  const session = await composio.create('test-user-001', {
    toolkits: ['hackernews'],
    manageConnections: false, // Non-auth app
  });

  console.log('✓ Created Tool Router session');

  const tools = await session.tools();
  console.log(`✓ Got ${Object.keys(tools).length} tools from session`);

  // Test with Vercel AI SDK
  const result = await generateText({
    model: openai('gpt-5.2'),
    prompt: 'Get the top 3 HackerNews stories',
    tools,
    maxSteps: 5,
  });

  console.log('✓ Tool Router execution successful');
  return result.text;
}

testToolRouter().catch(console.error);
```

### 4. 测试 MCP 集成

测试 MCP 协议兼容性：

```typescript
// test-mcp.ts
import { Composio } from '@composio/core';

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

async function testMCP() {
  const session = await composio.create('test-user-mcp', {
    toolkits: ['hackernews'],
    manageConnections: false,
  });

  console.log('✓ MCP Session created');
  console.log('  URL:', session.mcp.url);
  console.log('  Headers:', Object.keys(session.mcp.headers));

  // Test MCP endpoint accessibility
  const response = await fetch(session.mcp.url + '/tools', {
    headers: session.mcp.headers,
  });

  console.log('✓ MCP endpoint accessible:', response.ok);
  return response.ok;
}

testMCP().catch(console.error);
```

## 运行测试

```bash
# Run direct tools test
npx tsx test-direct-tools.ts

# Run Tool Router test
npm install @composio/vercel ai @ai-sdk/openai
npx tsx test-tool-router.ts

# Run MCP test
npx tsx test-mcp.ts

# Clean up (always run after testing)
cd .. && rm -rf "$TEST_DIR"
```

## 测试内容

1. **安装**：`npm install @composio/core` 是否可以正常运行？
2. **类型安全**：TypeScript 类型是否正确？
3. **工具发现**：能否从工具包中获取工具？
4. **工具执行**：工具能否成功执行？
5. **错误处理**：错误信息是否清晰？
6. **会话管理**：Tool Router 是否能创建会话？
7. **MCP 协议**：MCP 端点是否可访问？
8. **提供商集成**：提供商软件包是否正常工作？

## 报告问题

发现缺陷或质量问题时：

1. **SDK 核心问题**：在 GitHub Issues 中报告，并提供：
   - 最小复现代码
   - 预期行为与实际行为
   - SDK 版本和环境

2. **提供商问题**：注明存在问题的提供商软件包

3. **文档问题**：指出缺失或不正确的文档

## 最佳实践

- **始终使用 .agent_cache**：切勿在主仓库中创建测试
- **使用无需身份验证的应用**：使用 HackerNews、公共 API 进行快速测试
- **渐进式测试**：从简单工具开始，然后测试复杂工作流
- **清理**：测试后始终删除测试目录
- **检查最新版本**：使用 `npm view @composio/core version`

## 可用的环境变量

假设以下环境变量可用：
```bash
COMPOSIO_API_KEY    # Composio API key
OPENAI_API_KEY      # OpenAI API key
ANTHROPIC_API_KEY   # Anthropic API key
```

## 快速测试模板

```bash
# One-liner to create and test
TEST_DIR=".agent_cache/sdk-test-$(date +%s)" && \
mkdir -p "$TEST_DIR" && cd "$TEST_DIR" && \
npm init -y && npm install @composio/core openai && \
echo "console.log('SDK Test Ready')" > test.ts && \
npx tsx test.ts && \
cd .. && rm -rf "$TEST_DIR"
```

## 后续步骤

1. 阅读 `/building-agents`，了解完整的 Tool Router 文档
2. 查看提供商专属 Skill，获取集成示例
3. 将测试期间发现的所有缺陷报告给团队