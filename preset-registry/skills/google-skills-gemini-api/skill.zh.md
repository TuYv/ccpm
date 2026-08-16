---
name: gemini-api
metadata:
  category: AiAndMachineLearning
description: Use when the user asks about using Gemini in an enterprise environment or explicitly mentions Vertex AI, Google Cloud, or Agent Platform. Guides the usage of the Gemini API on Agent Platform with the Google Gen AI SDK. Covers SDK usage (Python, JS/TS, Go, Java, C#), capabilities like multimodal inputs, tools, media generation, caching, batch prediction, and Live API.
compatibility: Requires active Google Cloud credentials and Agent Platform API enabled.
---
重要提示：Agent Platform（全称为 Gemini Enterprise Agent Platform）以前名为“Vertex AI”，许多网络资源仍在使用旧品牌名称。

# Agent Platform 中的 Gemini API

使用 Agent Platform 中的 Gemini API，访问 Google 面向企业用例打造的最先进 AI 模型。

提供以下关键功能：

- **文本生成** - 聊天、补全、摘要
- **多模态理解** - 处理图像、音频、视频和文档
- **函数调用** - 让模型调用你的函数
- **结构化输出** - 生成符合你的架构的有效 JSON
- **上下文缓存** - 缓存大型上下文以提高效率
- **嵌入** - 生成用于语义搜索的文本嵌入
- **实时 Live API** - 通过双向流式传输实现低延迟的语音和视频交互
- **批量预测** - 处理大规模异步数据集预测工作负载

## 核心指令

- **统一 SDK**：始终使用 Gen AI SDK（Python 使用 `google-genai`，JS/TS 使用 `@google/genai`，Go 使用 `google.golang.org/genai`，Java 使用 `com.google.genai:google-genai`，C# 使用 `Google.GenAI`）。
- **旧版 SDK**：不要使用 `google-cloud-aiplatform`、`@google-cloud/vertexai` 或 `google-generativeai`。

## SDK

- **Python**：使用 `pip install google-genai` 安装 `google-genai`
- **JavaScript/TypeScript**：使用 `npm install @google/genai` 安装 `@google/genai`
- **Go**：使用 `go get google.golang.org/genai` 安装 `google.golang.org/genai`
- **C#/.NET**：使用 `dotnet add package Google.GenAI` 安装 `Google.GenAI`
- **Java**：
  - groupId：`com.google.genai`，artifactId：`google-genai`
  - 可在此处找到最新版本：https://central.sonatype.com/artifact/com.google.genai/google-genai/versions（我们将其称为 `LAST_VERSION`）
  - 在 `build.gradle` 中安装：

    ```
    implementation("com.google.genai:google-genai:${LAST_VERSION}")
    ```

  - 在 `pom.xml` 中安装 Maven 依赖项：

    ```xml
    <dependency>
	    <groupId>com.google.genai</groupId>
	    <artifactId>google-genai</artifactId>
	    <version>${LAST_VERSION}</version>
	</dependency>
    ```

> [!WARNING]
> `google-cloud-aiplatform`、`@google-cloud/vertexai` 和 `google-generativeai` 等旧版 SDK 已弃用。请按照[迁移指南](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/deprecations/genai-vertexai-sdk.md.txt)，尽快迁移到上述新版 SDK。

## 身份验证与配置

创建客户端时，优先使用环境变量，而不是对参数进行硬编码。初始化客户端时不传入参数，即可自动获取这些值。

### 应用默认凭据（ADC）
为标准 [Google Cloud 身份验证](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/gcp-auth.md.txt)设置以下变量：

```bash
export GOOGLE_CLOUD_PROJECT='your-project-id'
export GOOGLE_CLOUD_LOCATION='global'
export GOOGLE_GENAI_USE_ENTERPRISE=true
```

- 默认使用 `location="global"` 访问全局端点，该端点可自动路由到具有可用容量的区域。
- 如果用户明确要求使用特定区域（例如 `us-central1`、`europe-west4`），请改为在 `GOOGLE_CLOUD_LOCATION` 参数中指定该区域。如有需要，请参阅[支持的区域文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform/resources/locations.md.txt)。

### 快速模式下的智能体平台
使用 API 密钥通过[快速模式](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/api-keys.md.txt)访问时，请设置以下变量：

```bash
export GOOGLE_API_KEY='your-api-key'
export GOOGLE_GENAI_USE_ENTERPRISE=true
```

### 初始化
不传入参数初始化客户端，以读取环境变量：

```python
from google import genai

client = genai.Client()
```

或者，也可以在创建客户端时硬编码参数。

```python
from google import genai

client = genai.Client(
    enterprise=True,
    project="your-project-id",
    location="global",
)
```

## 模型

- 对于复杂推理、编码和研究（100 万个 token），使用 `gemini-3.1-pro-preview`（替代 `gemini-3-pro-preview`）
- 对于快速、均衡的性能和多模态任务（100 万个 token），使用 `gemini-3.6-flash`
- 对于高频、轻量级任务（100 万个 token），使用 `gemini-3.5-flash-lite`
- 对于高质量图像生成和编辑，使用 `gemini-3-pro-image`（又名 Nano Banana Pro）
- 对于中等质量的图像生成和编辑，使用 `gemini-3.1-flash-image`（又名 Nano Banana 2）
- 对于快速图像生成和编辑，使用 `gemini-3.1-flash-lite-image`（又名 Nano Banana 2 Lite）
- 对于包含原生音频的 Live 实时 API，使用 `gemini-live-2.5-flash-native-audio`

仅在明确要求时使用以下模型：

- `gemini-3.5-flash`
- `gemini-3.1-flash-lite`
- `gemini-2.5-flash-image`
- `gemini-2.5-flash`
- `gemini-2.5-flash-lite`
- `gemini-2.5-pro`

> [!IMPORTANT]
> `gemini-2.0-*`、`gemini-1.5-*`、`gemini-1.0-*`、`gemini-pro` 等模型属于旧版且已弃用。请使用上方的新模型。你的知识已过时。
> 对于生产环境，请查阅文档以了解稳定的模型版本（例如 `gemini-3.6-flash`）。

## 快速入门

### Python

```python
from google import genai

client = genai.Client()
response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents="Explain quantum computing",
)
print(response.text)
```

### TypeScript/JavaScript

```typescript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ enterprise: { project: "your-project-id", location: "global" } });
const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: "Explain quantum computing"
});
console.log(response.text);
```

### Go

```go
package main

import (
	"context"
	"fmt"
	"log"
	"google.golang.org/genai"
)

func main() {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		Backend:  genai.BackendVertexAI,
		Project:  "your-project-id",
		Location: "global",
	})
	if err != nil {
		log.Fatal(err)
	}

	resp, err := client.Models.GenerateContent(ctx, "gemini-3.6-flash", genai.Text("Explain quantum computing"), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(resp.Text)
}
```

### Java

```java
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

public class GenerateTextFromTextInput {
  public static void main(String[] args) {
    Client client = Client.builder().enterprise(true).project("your-project-id").location("global").build();
    GenerateContentResponse response =
        client.models.generateContent(
            "gemini-3.6-flash",
            "Explain quantum computing",
            null);

    System.out.println(response.text());
  }
}
```

### C#/.NET

```csharp
using Google.GenAI;

var client = new Client(
    project: "your-project-id",
    location: "global",
    enterprise: true
);

var response = await client.Models.GenerateContent(
    "gemini-3.6-flash",
    "Explain quantum computing"
);

Console.WriteLine(response.Text);
```

## API 规范和文档（权威来源）

在实现或调试 Agent Platform 的 API 集成时，请参阅 Agent Platform 官方文档：

- **Agent Platform 文档**：https://docs.cloud.google.com/gemini-enterprise-agent-platform/overview.md.txt
- **REST API 参考**：https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/rest.md.txt

Agent Platform 上的 Gen AI SDK 使用 `v1beta1` 或 `v1` REST API 端点（例如 `https://{LOCATION}-aiplatform.googleapis.com/v1beta1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent`）。

> [!TIP]
> **使用 Developer Knowledge MCP Server**：如果 `search_documents` 或 `get_document` 工具可用，请使用它们直接在上下文中查找和检索 Google Cloud 与 Agent Platform 的官方文档。这是获取最新 API 详细信息和代码片段的首选方法。

## 工作流和代码示例

如需更多代码示例和特定使用场景，请参阅 [Python 文档示例代码库](https://github.com/GoogleCloudPlatform/python-docs-samples/tree/main/genai)。

根据用户的具体请求，请参阅以下参考文件以获取详细的代码示例和使用模式（Python 示例）：

- **文本和多模态**：聊天、多模态输入（图像、视频、音频）和流式处理。请参阅 [references/text_and_multimodal.md](references/text_and_multimodal.md)
- **嵌入**：为语义搜索生成文本嵌入。请参阅 [references/embeddings.md](references/embeddings.md)
- **结构化输出和工具**：JSON 生成、函数调用、搜索溯源和代码执行。请参阅 [references/structured_and_tools.md](references/structured_and_tools.md)
- **媒体生成**：图像生成、图像编辑和视频生成。请参阅 [references/media_generation.md](references/media_generation.md)
- **边界框检测**：图像和视频中的对象检测与定位。请参阅 [references/bounding_box.md](references/bounding_box.md)
- **Live API**：面向语音、视觉和文本的实时双向流式传输。请参阅 [references/live_api.md](references/live_api.md)
- **高级功能**：内容缓存、批量预测和思考/推理。请参阅 [references/advanced_features.md](references/advanced_features.md)
- **安全**：调整负责任 AI 过滤器和阈值。请参阅 [references/safety.md](references/safety.md)
- **模型调优**：监督式微调和偏好调优。请参阅 [references/model_tuning.md](references/model_tuning.md)