# 使用 Google Gemini 与 Composio 构建智能体

使用 Google 的 Gemini API 和 Composio 工具构建 AI 智能体。

## 安装

```bash
npm install @composio/core @composio/google @google/genai
```

```bash
pip install composio-google google-genai
```

**查找最新版本：**
```bash
npm view @google/genai version
pip index versions google-genai | grep "Available versions" | head -1
```

## 集成方式

**Google Gemini 是非智能体式提供商**——使用直接工具（不支持 Tool Router）。

### TypeScript 示例

```typescript
import { Composio } from '@composio/core';
import { GoogleProvider } from '@composio/google';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new GoogleProvider(),
});

// Get tools
const tools = await composio.tools.get('default', { toolkits: ['github'] });

// Use with Gemini
const response = await genai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: 'Create a GitHub issue',
  config: {
    tools: tools,
    temperature: 1.0  // Required for Gemini 3
  },
});

// Handle function calls
if (response.functionCalls) {
  const results = await composio.provider.handleToolCalls('default', response);
}
```

### Python 示例

```python
from composio_google import ComposioToolSet, Action
from google import genai
from google.genai import types

client = genai.Client(api_key="YOUR_KEY")
composio_toolset = ComposioToolSet(api_key="YOUR_KEY")

# Get tools
tools = composio_toolset.get_tools(actions=[Action.GITHUB_CREATE_ISSUE])

# Use with Gemini
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="Create a GitHub issue",
    config=types.GenerateContentConfig(
        tools=tools,
        temperature=1.0
    )
)

# Handle function calls
tool_results = composio_toolset.handle_tool_calls(response)
```

## 主要特性

- **组合式函数调用**：自动串联多个函数
- **并行执行**：同时执行相互独立的函数
- **内部思考**：Gemini 3 模型可对复杂请求进行推理

## 重要资源

- **Gemini API 文档**：https://ai.google.dev/gemini-api/docs
- **函数调用**：https://ai.google.dev/gemini-api/docs/function-calling
- **可用模型**：Gemini 3 Pro/Flash、Gemini 2.5 Pro/Flash

## 环境变量

```bash
GOOGLE_API_KEY=...
COMPOSIO_API_KEY=...
```

## 后续步骤

1. 查看 `ts/examples/google/` 中的完整示例
2. 有关 API 功能，请参阅 [Gemini 文档](https://ai.google.dev)
3. 注意：Gemini 3 模型的温度必须设为 1.0