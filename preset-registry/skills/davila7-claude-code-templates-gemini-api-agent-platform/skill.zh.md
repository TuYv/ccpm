---
name: gemini-api-agent-platform
description: Guides the usage of the Gemini API on Agent Platform with the Google Gen AI SDK for enterprise AI applications. Covers SDK usage (Python, JS/TS, Go, Java, C#), capabilities like Live API, tools, multimedia generation, caching, and batch prediction.
compatibility: Requires active Google Cloud credentials and Agent Platform API enabled.
source: google/skills (Apache 2.0)
---
重要提示：Agent Platform（全称 Gemini Enterprise Agent Platform）之前名为“Vertex AI”，许多网络资源仍在使用旧品牌名称。

# Agent Platform 中的 Gemini API

使用 Agent Platform 中的 Gemini API，访问 Google 专为企业用例构建的最先进 AI 模型。

提供以下关键能力：

- **文本生成** - 聊天、补全、摘要
- **多模态理解** - 处理图像、音频、视频和文档
- **函数调用** - 让模型调用你的函数
- **结构化输出** - 生成与你的 schema 匹配的有效 JSON
- **上下文缓存** - 缓存大型上下文以提高效率
- **实时 Live API** - 为低延迟语音和视频交互提供双向流式传输
- **批量预测** - 处理大规模异步数据集预测工作负载

## 核心指令

- **统一 SDK**：始终使用 Gen AI SDK（Python 使用 `google-genai`，JS/TS 使用 `@google/genai`，Go 使用 `google.golang.org/genai`，Java 使用 `com.google.genai:google-genai`，C# 使用 `Google.GenAI`）。
- **旧版 SDK**：请勿使用 `google-cloud-aiplatform`、`@google-cloud/vertexai` 或 `google-generativeai`。

## SDK

- **Python**：使用 `pip install google-genai` 安装 `google-genai`
- **JavaScript/TypeScript**：使用 `npm install @google/genai` 安装 `@google/genai`
- **Go**：使用 `go get google.golang.org/genai` 安装 `google.golang.org/genai`
- **C#/.NET**：使用 `dotnet add package Google.GenAI` 安装 `Google.GenAI`
- **Java**：
  - groupId：`com.google.genai`，artifactId：`google-genai`
  - 可在此处找到最新版本：https://central.sonatype.com/artifact/com.google.genai/google-genai/versions（将其称为 `LAST_VERSION`）
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
> `google-cloud-aiplatform`、`@google-cloud/vertexai` 和 `google-generativeai` 等旧版 SDK 已弃用。请按照迁移指南，立即迁移到上述新版 SDK。

## 身份验证与配置

创建客户端时，优先使用环境变量，而不是对参数进行硬编码。初始化客户端时不传入参数，即可自动读取这些值。

### 应用默认凭据（ADC）
为标准 [Google Cloud 身份验证](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/gcp-auth)设置以下变量：
```bash
export GOOGLE_CLOUD_PROJECT='your-project-id'
export GOOGLE_CLOUD_LOCATION='global'
export GOOGLE_GENAI_USE_VERTEXAI=true
```
- 默认使用 `location="global"` 访问全局端点，该端点可自动将请求路由到具有可用容量的区域。
- 如果用户明确要求使用特定区域（例如 `us-central1`、`europe-west4`），请改为在 `GOOGLE_CLOUD_LOCATION` 参数中指定该区域。如有需要，请参阅[支持的区域文档](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/locations)。

### Express 模式下的智能体平台
使用 API 密钥启用 [Express 模式](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/api-keys?usertype=expressmode)时，请设置以下变量：
```bash
export GOOGLE_API_KEY='your-api-key'
export GOOGLE_GENAI_USE_VERTEXAI=true
```

### 初始化
不传入任何参数来初始化客户端，以便读取环境变量：
```python
from google import genai
client = genai.Client()
```

或者，也可以在创建客户端时直接写入参数。

```python
from google import genai
client = genai.Client(vertexai=True, project="your-project-id", location="global")
```

## 模型

- 使用 `gemini-3.1-pro-preview` 处理复杂推理、编码和研究任务（100 万 token）
  - 重要：不要使用 `gemini-3-pro-preview`
- 使用 `gemini-3-flash-preview` 实现快速、均衡的性能以及多模态能力（100 万 token）
- 使用 `gemini-3.1-flash-lite-preview` 处理高频、轻量级任务（100 万 token）
- 使用 `gemini-3-pro-image-preview` 进行 Nano Banana Pro 图像生成和编辑
- 使用 `gemini-3.1-flash-image-preview` 进行 Nano Banana 2 图像生成和编辑
- 使用 `gemini-live-2.5-flash-native-audio` 调用包含原生音频支持的 Live Realtime API

仅在明确要求时使用以下模型：

- `gemini-2.5-flash-image`
- `gemini-2.5-flash`
- `gemini-2.5-flash-lite`
- `gemini-2.5-pro`

> [!IMPORTANT]
> `gemini-2.0-*`、`gemini-1.5-*`、`gemini-1.0-*`、`gemini-pro` 等模型属于旧版模型，且已弃用。请使用上方列出的新模型。你的知识已过时。
> 对于生产环境，请查阅文档以了解稳定的模型版本（例如 `gemini-3-flash`）。

## 快速开始

### Python
```python
from google import genai
client = genai.Client()
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="Explain quantum computing"
)
print(response.text)
```

### TypeScript/JavaScript
```typescript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ vertexai: { project: "your-project-id", location: "global" } });
const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

	resp, err := client.Models.GenerateContent(ctx, "gemini-3-flash-preview", genai.Text("Explain quantum computing"), nil)
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
    Client client = Client.builder().vertexAi(true).project("your-project-id").location("global").build();
    GenerateContentResponse response =
        client.models.generateContent(
            "gemini-3-flash-preview",
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
    vertexAI: true
);

var response = await client.Models.GenerateContent(
    "gemini-3-flash-preview",
    "Explain quantum computing"
);

Console.WriteLine(response.Text);
```

## API 规范与文档（权威来源）

在实现或调试 Agent Platform 的 API 集成时，请参阅官方 Agent Platform 文档：
- **Agent Platform 文档**：https://docs.cloud.google.com/gemini-enterprise-agent-platform/overview
- **REST API 参考**：https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/rest

Agent Platform 上的 Gen AI SDK 使用 `v1beta1` 或 `v1` REST API 端点（例如，`https://{LOCATION}-aiplatform.googleapis.com/v1beta1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent`）。

> [!TIP]
> **使用 Developer Knowledge MCP Server**：如果 `search_documents` 或 `get_document` 工具可用，请使用它们直接在上下文中查找和检索 Google Cloud 与 Agent Platform 的官方文档。这是获取最新 API 详细信息和代码片段的首选方法。

## 工作流和代码示例

有关其他代码示例和具体使用场景，请参考 [Python 文档示例代码库](https://github.com/GoogleCloudPlatform/python-docs-samples/tree/main/genai)。

根据用户的具体请求，请参考以下文件，获取详细的代码示例和使用模式（Python 示例）：

- **文本与多模态**：聊天、多模态输入（图像、视频、音频）和流式传输。请参阅 [references/text_and_multimodal.md](references/text_and_multimodal.md)
- **嵌入**：为语义搜索生成文本嵌入。请参阅 [references/embeddings.md](references/embeddings.md)
- **结构化输出与工具**：JSON 生成、函数调用、搜索依据和代码执行。请参阅 [references/structured_and_tools.md](references/structured_and_tools.md)
- **媒体生成**：图像生成、图像编辑和视频生成。请参阅 [references/media_generation.md](references/media_generation.md)
- **边界框检测**：在图像和视频中进行对象检测与定位。请参阅 [references/bounding_box.md](references/bounding_box.md)
- **Live API**：面向语音、视觉和文本的实时双向流式传输。请参阅 [references/live_api.md](references/live_api.md)
- **高级功能**：内容缓存、批量预测和思考/推理。请参阅 [references/advanced_features.md](references/advanced_features.md)
- **安全性**：调整负责任 AI 过滤器和阈值。请参阅 [references/safety.md](references/safety.md)
- **模型调优**：监督式微调和偏好调优。请参阅 [references/model_tuning.md](references/model_tuning.md)