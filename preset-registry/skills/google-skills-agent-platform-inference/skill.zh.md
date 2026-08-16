---
name: agent-platform-inference
metadata:
  category: AiAndMachineLearning
description: >-
  Connects to and performs inference with Google Cloud Agent Platform GenAI
  models, including First-Party Gemini models and Third-Party OpenMaaS models
  (Llama, DeepSeek, Qwen, etc.). Use when you need to generate code for calling
  Gemini or OpenMaaS models, authenticate with GenAI SDK, OpenAI SDK, or legacy
  Agent Platform SDK, configure base URLs and global/regional endpoints, or troubleshoot
  429 Resource Exhausted (DSQ), 400 User Validation, or 404 Not Found errors.
  Don't use for deploying models to endpoints or for running model evaluations.
---
# Agent Platform GenAI 推理技能

本技能提供有关如何进行身份验证并连接到 Google Cloud Agent Platform 以使用生成式 AI 模型的说明。涵盖：

*   **第一方发布商模型**（Gemini）——第 2 节。
*   **第三方发布商模型**（OpenMaaS：Llama、DeepSeek、Qwen 等）
    ——第 3 节。
*   **自定义端点**（位于数值型 `projects/.../endpoints/<id>`
    资源上的任意模型——经过调优的 Gemini 模型、通过
    `agent-platform-deploy` 技能从 Model Garden 自行部署的开源大语言模型，
    以及旧版自定义模型）——第 4 节。

## 安全与确认级别（关键）

在代表用户执行任何命令或脚本之前，你必须根据所请求的操作遵循
以下安全级别。（本技能为只读；省略了其他安全级别）：

1.  **R 级：只读/推理（`client.models.generate_content`,
    `client.chat.completions.create`, `client.completions.create`,
    `client.embeddings.create`）**
    *   在代表用户执行模型推理之前，需要通过“Yes”/“No”选项进行
        **交互式确认**，以防止产生意外费用或消耗配额。确认提示必须清楚说明
        拟执行的推理及其关键参数（例如目标模型 ID、SDK 选择、输入提示词）。
        未明确说明参数的自然语言改述并不足够。
    *   **同一轮次限制**：不得在展示确认提示的同一轮次中执行推理脚本或
        命令。停止并等待用户回复；只有在用户明确回复“Yes”或表示批准后
        才能执行。
    *   **黄金标准示例**：> 我将使用以下参数执行模型推理。请在我
        继续之前确认这些信息：> * **模型 ID**：`deepseek-ai/deepseek-v3.2-maas` > * **SDK**：
        OpenAI SDK（通过 Vertex AI Endpoint）> * **输入提示词**：“解释
        量子计算的概念……” > 是否确认？[Yes/No]

## 阶段 0：环境设置

**关键**：在运行 `scripts/` 目录中的任何 Python 示例脚本
（例如 `scripts/openmaas_openai_sdk.py`）之前，你**必须**按照以下步骤
确保环境已正确初始化：

1.  **Google Cloud 身份验证**：使用你的 Google Cloud 凭据进行身份验证，
    并为 Agent Platform 访问配置有效的应用默认凭据（ADC）：

    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```

2.  **启用 API**（如果尚未启用）：

    ```bash
    gcloud services enable aiplatform.googleapis.com
    ```

3.  **Python 依赖项**：这些脚本会导入 `vertexai`（来自
    `google-cloud-aiplatform`）、`google-genai` 和 `openai`。**不要**创建
    虚拟环境——虚拟环境初始为空，并会隐藏当前环境已经提供的软件包，
    从而迫使你进行多余的安装。先进行探测，并且只安装缺少的内容：

```bash
    python3 -c "import vertexai, google.genai, openai" \
      || pip install -r scripts/requirements.txt
    ```

    `scripts/requirements.txt` 中固定的版本号是针对尚未提供这些 SDK 的环境所准备的后备方案；不要在一个已经正常工作的环境中额外应用它们。

4.  **验证设置（可选）**：一次性运行所有示例脚本，以验证环境能否端到端正常工作：

    ```bash
    ./scripts/verify_all.sh
    ```

5.  **执行**：直接使用 `python3 scripts/...` 运行脚本。无需事先激活任何环境。



> [!IMPORTANT] **关键：模型 ID 与可用性** * **Gemini 模型**：有关有效的模型 ID 和区域，请参阅
> [Gemini 模型][gemini-models-docs]。*
> **OpenMaaS 模型**：有关 Llama、DeepSeek、Qwen 等模型，请参阅
> [在 Agent Platform 上使用开放模型](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/use-open-models)
>。* **列表不完整**：本 Skill 中列出的模型 ID **仅为示例**，可能不完整或已过时。*
> **操作**：生成代码前，始终使用上述链接核实模型 ID 和区域。
>
> \[gemini-models-docs]:
> https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/migrate
>
>
> ## 工作流决策树

1.  **模型系列识别**：用户是否已指定要调用 **Gemini**（第一方）模型还是 **OpenMaaS**（第三方，例如
    Llama、DeepSeek、Qwen）模型？

    *   **否** -> 询问用户希望使用哪个模型系列。如果用户提供了具体的模型名称，则根据名称推断其所属系列。
    *   **是** -> 继续执行第 2 步。

2.  **SDK 选择**：用户希望使用哪个 SDK？

    *   **Gemini + GenAI SDK**（Gemini 的首选方案）-> 前往 [1. Gemini
        模型]。
    *   **Gemini + 旧版 Vertex AI SDK** -> 前往 [1. Gemini 模型]。
    *   **OpenMaaS + OpenAI SDK**（OpenMaaS 的首选方案）-> 前往 [2.
        OpenMaaS 模型]。
    *   **OpenMaaS + GenAI SDK** -> 前往 [2. OpenMaaS 模型]。
    *   **不确定** -> 默认使用所选模型系列的首选 SDK。

3.  **问题排查**：用户是否正在报告错误（429 Resource Exhausted、
    400 User Validation、404 Not Found 等）？

    *   **是** -> 前往 [3. 问题排查与常见错误代码]。
    *   **否** -> 按照第 2 步中选择的 SDK 继续操作。

## 0.5 发布商端点的区域可用性检查（Gemini + LoRA 基础模型）

> [!NOTE] 如果符合以下任一情况，**跳过本节**：
>
> - 用户正在调用自定义端点（§4）——通过数字形式的 `projects/.../endpoints/<id>` 提供服务的微调 Gemini 模型、自行部署的 OSS LLM（Llama、
>   DeepSeek、Qwen、Gemma 等），或旧版自定义模型。这些请求会发送到特定的端点资源，其区域在部署时已经固定；如果调用方区域不匹配，端点查询会直接返回 404，
>   且不会产生推理费用。前往 §4。
> - 用户正在调用 OpenMaaS 发布商模型（§2）——通过全局 `openapi` 基础 URL 提供服务的 Llama、DeepSeek、
>   Qwen 等模型。这些模型不像第一方 Gemini 那样具有逐区域的可用性限制。前往 §2。
>
> **仅当用户调用第一方托管的 Gemini 模型**（`gemini-*`，通过 §1）时，才应用本节；这也包括基于 Gemini 的微调 LoRA 适配器——这些请求通过发布商端点路由，而该端点的区域可用性确实会有所不同。

在响应任何为第一方托管 Gemini 模型（`gemini-*`）或微调后的 Gemini LoRA 适配器（通过数字端点 ID + 用户声明的基础模型来识别）指定了特定区域的推理请求之前，你**必须**通过实时 API 调用验证该模型在该区域中确实可用。不要依赖 Google 搜索、训练语料库知识或发布方文档来判断可用性——区域可用性经常变化，有出处依据的文本也可能已过时或有误。

仅探测用户询问的确切模型和区域。不要探测其他模型作为“对照”——你无法根据模型 B 的状态推断模型 A 的可用性，因为另一个模型本身也可能由于无关原因而无法在参考区域中使用。

对于第一方 Gemini 模型，使用最小有效载荷进行真实的 `:generateContent` 调用来探测：

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    "https://${LOCATION_ID}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/${MODEL_ID}:generateContent" \
    -d "{\"contents\":{\"role\":\"user\",\"parts\":{\"text\":\"${PROBE_TEXT:-hi}\"}}}"
```

对于针对微调后 Gemini LoRA 适配器的推理，使用上面相同的 `:generateContent` 调用探测目标区域中的**基础模型**，并将 `${MODEL_ID}` 设置为基础模型（例如，如果适配器基于 `gemini-2.5-flash` 进行微调，则设置为 `gemini-2.5-flash`）。如果 LoRA 适配器的基础模型在某个区域不可用，该适配器就无法在该区域提供服务。

解释探测结果并采取行动：

-   **200** — 模型在该区域可用。继续执行 §1 中的 SDK 设置。
-   **404** — 模型在该区域不可用。停止。明确告知用户该模型未在该区域提供，并列出其可用区域（来源为 [Gemini 模型][gemini-models-docs] 或 `gcloud ai model-garden models list --filter="name~$MODEL_NAME"`，且不使用 `--region`）。不要静默切换区域。不要继续为不受支持的区域编写推理代码或 SDK 初始化代码。不要运行额外的“对照”探测来复核 404——目标区域的探测结果具有权威性。
-   **任何其他结果**（权限被拒绝、配额问题、暂时性故障等）— 不要断定模型可用或不可用。用通俗语言解释根本原因（例如，“你的账号无权访问此项目的 Vertex AI API——请在控制台中启用该 API 或切换项目”）以及具体的后续操作。

## 1. Gemini 模型

对于 Gemini 模型（例如 `gemini-2.5-pro`、`gemini-3-flash-preview`），**GenAI SDK**（`google-genai`）是**首选**方法。旧版 `vertexai` SDK 仍受支持，但对于新项目，建议使用 GenAI SDK。

> [!IMPORTANT]
> **预览版模型（包括 Gemini 3.1）**通常**仅**在 `global` 区域可用。稳定版模型可在 `us-central1` 和其他区域使用。

### 选择合适的 SDK

*   **Gemini 模型**：**GenAI SDK** (`google-genai`) 是**首选**。可使用
    OpenAI SDK 以实现兼容性，或在需要时使用旧版 SDK (`vertexai`)。
*   **OpenMaaS 模型**：**强烈建议使用 OpenAI SDK**。如果有特定的基础设施要求，可使用 GenAI SDK
    或旧版 SDK。

### 安装

```bash
pip install google-genai
```

### Python 示例（GenAI SDK - 首选）

完整代码请参阅 [`scripts/gemini_genai_sdk.py`](scripts/gemini_genai_sdk.py)。

### 替代方案：OpenAI SDK（聊天补全）

将标准 OpenAI SDK 与 Agent Platform 端点配合使用。这非常适合实现
交叉兼容性。

完整代码请参阅 [`scripts/gemini_openai_sdk.py`](scripts/gemini_openai_sdk.py)。

### 旧版方案：Agent Platform SDK

旧版 `vertexai` SDK 仍被广泛使用，但对于新的 Gemini 项目，首选
`google-genai`。

完整代码请参阅 [`scripts/gemini_vertexai_sdk.py`](scripts/gemini_vertexai_sdk.py)。

**文档**：
[Google GenAI SDK](https://github.com/googleapis/python-genai)

**文档**：
[Agent Platform Gemini 模型](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/google-models)

## 2. OpenMaaS 模型（Llama、DeepSeek、Qwen 等）

对于 OpenMaaS（模型即服务）模型，**强烈建议**采用的方法是
将标准 **OpenAI SDK** 与特定的 Vertex AI 端点配合使用。

> [!WARNING] 虽然 `GenerativeModel` *可以*支持某些 OpenMaaS 模型，但
> **不建议**这样做。请使用 OpenAI SDK 以获得最佳兼容性（尤其是对于
> 聊天补全）。

### 安装

```bash
pip install openai google-auth
```

### OpenAI SDK 的身份验证

你**必须**使用 Google Cloud OAuth 访问令牌作为 OpenAI
SDK 的 API 密钥。

```python
import google.auth
from google.auth.transport.requests import Request

def get_gcp_access_token():
    creds, _ = google.auth.default()
    creds.refresh(Request())
    return creds.token
```

> [!NOTE] Google Cloud 访问令牌通常会在 1 小时后过期。上面的
> `get_gcp_access_token()` 函数会在调用时获取一个*新的*令牌。对于长时间运行的
> 应用程序，你需要实现刷新机制。有关详细信息，请参阅
> [刷新访问令牌](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/migrate/openai/auth-and-credentials?hl=en#refresh_your_credentials)。

### 配置（基础 URL）



-   **全局端点**（建议用于大多数需要全局
    可用性的模型）：
    `https://aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/global/endpoints/openapi`
-   **区域端点**：
    `https://{REGION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{REGION}/endpoints/openapi`


### Python 示例（OpenMaaS - 聊天补全）

完整代码请参阅 [`scripts/openmaas_openai_sdk.py`](scripts/openmaas_openai_sdk.py)。

> [!TIP] **替代方案：环境变量** 你可以在 shell 中设置环境
> 变量，而无需更新代码。
>
> **替代方案：环境变量** 你可以在 shell 中设置环境变量，而无需更新代码。

```bash
export OPENAI_BASE_URL="https://aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/global/endpoints/openapi"
export OPENAI_API_KEY="$(gcloud auth application-default print-access-token)"
```
> 然后不传入参数初始化客户端：`client = OpenAI()`

### Python 示例（OpenMaaS - Completions API）

以下模型支持旧版 Completions API：`zai-org/glm-5-maas`、
`moonshotai/kimi-k2-thinking-maas`、`minimaxai/minimax-m2-maas`、
`deepseek-ai/deepseek-v3.1-maas` 和 `deepseek-ai/deepseek-v3.2-maas`。

```python
response = client.completions.create(
    model="deepseek-ai/deepseek-v3.2-maas",
    prompt="Once upon a time",
    max_tokens=100
)
print(response.choices[0].text)
```

### Python 示例（OpenMaaS - Embeddings）

```python
# Verify specific Embedding Model ID on Model Garden (e.g., intfloat/multilingual-e5-small)
response = client.embeddings.create(
    model="intfloat/multilingual-e5-large-maas",
    input="The quick brown fox jumps over the lazy dog",
)
print(response.data[0].embedding)
```

### 替代方案：GenAI SDK

`google-genai` SDK 也可以通过 `vertexai`
后端访问 OpenMaaS 模型。

完整代码请参阅 [`scripts/openmaas_genai_sdk.py`](scripts/openmaas_genai_sdk.py)。

> [!IMPORTANT]
> **模型 ID 格式**：通过 GenAI SDK 使用 OpenMaaS 时，**必须**使用完整
> 路径：`publishers/PUBLISHER/models/MODEL`（例如，
> `publishers/zai-org/models/glm-5-maas`）。

### 旧版：Agent Platform SDK（OpenMaaS）

对于 OpenMaaS，你也可以使用 `GenerativeModel`（如果支持）。

完整代码请参阅 [`scripts/openmaas_vertexai_sdk.py`](scripts/openmaas_vertexai_sdk.py)。

> [!IMPORTANT] **模型 ID 格式**：通过 Agent Platform SDK 使用 OpenMaaS 时，
> **必须**使用完整路径：`publishers/PUBLISHER/models/MODEL`。

### 模型参考与可用性

**文档**：
[在 Agent Platform 上使用开放模型](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/use-open-models)

> [!TIP]
> **通过自行部署获得控制权**：如果你需要 MaaS 未提供的**专用硬件**
> （GPU/TPU）、**容量保障**或**特定区域部署**，可以将这些模型**自行部署**到 Agent Platform
> Endpoints。在 Model Garden 中搜索该模型并点击“Deploy”，以选择
> 机器类型。有关部署工作流，请参阅 `agent-platform-deploy` skill；
> 有关如何调用生成的自行部署端点，请参阅**本 skill 的第 4 节**
> （在专用端点 DNS 上使用 `/chat/completions`，
> 而不是上面的 OpenMaaS 发布方 URL）。

> [!IMPORTANT] **查找推理示例**：上面的列表是一个起点。
> 要获取**权威的**推理代码片段（尤其是 Chat
> Completions 的载荷结构）：1. 查阅
> [在 Agent Platform 上使用开放模型](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/use-open-models)
> 列表。2. 点击特定模型的链接（例如“DeepSeek-V3”），访问
> 其 **Model Garden** 页面。3. 在 Model Garden 页面上查找 **“Sample Code”** 或 **“Use this
> model”**按钮，以获取适用于该特定模型版本的准确 `curl` 或 Python
> 代码。

> [!NOTE] 此列表**并不完整**。有关受支持模型的完整列表，请参阅
> [在 Agent Platform 上使用开放模型](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/use-open-models)。

模型系列       | 模型 ID 示例                                    | 位置           | 备注
:------------ | :--------------------------------------------- | :------------ | :----
**Llama 4**   | `meta/llama-4-maverick-17b-128e-instruct-maas` | `us-east5`    |
**Llama 4**   | `meta/llama-4-scout-17b-16e-instruct-maas`     | `us-east5`    |
**Llama 3.3** | `meta/llama-3.3-70b-instruct-maas`             | `us-central1` |
**DeepSeek**  | `deepseek-ai/deepseek-v3.2-maas`               | `global`      | 仅限全球
**DeepSeek**  | `deepseek-ai/deepseek-v3.1-maas`               | `us-west2`    | 仅限 US-West2
**DeepSeek**  | `deepseek-ai/deepseek-r1-0528-maas`            | `us-central1` |
**Qwen 3**    | `qwen/qwen3-coder-480b-a35b-instruct-maas`     | `global`      |
**Qwen 3**    | `qwen/qwen3-next-80b-a3b-instruct-maas`        | `global`      |
**Kimi**      | `moonshotai/kimi-k2-thinking-maas`             | `global`      |
**MiniMax**   | `minimaxai/minimax-m2-maas`                    | `global`      |
**GLM**       | `zai-org/glm-4.7-maas`, `zai-org/glm-5-maas`   | `global`      |

## 4. 自定义端点（调优后的 Gemini、自行部署的开源 LLM、旧版自定义模型）

本节介绍如何调用属于你的项目的 Agent Platform
**端点**，即具有如下数字资源名称的端点：
`projects/.../endpoints/5875254126916403200`。这不同于调用第 2 节和第 3 节中的发布方 MaaS 接口（后者访问的是
`publishers/.../models/...` 或 `endpoints/openapi`，而不是你的端点
ID）。

> [!IMPORTANT]
>
> **发布方 MaaS 与你的端点（不要混淆）。**第 3 节中的
> OpenMaaS 示例（例如 `meta/llama-3.3-70b-instruct-maas`）访问位于
> `/v1/projects/.../locations/.../endpoints/openapi` 的
> **共享发布方 URL**。本节中的方案访问位于 `/v1/projects/.../endpoints/<id>` 的
> **你的**端点。
> 如果你通过 Model Garden 的“Deploy”部署了 Llama / Gemma / 等模型
> （而非 MaaS 发布方产品），请遵循本节，而不是第 3 节。

> [!IMPORTANT]
>
> **两个相互独立的维度决定调用形式：**
>
> **维度 1——模型系列**决定 RPC 方法和载荷：
>
> | 端点提供的模型 | 方法 | 载荷 |
> |---|---|---|
> | **调优后的 Gemini 模型**（Gemini 调优的输出——端点已为你完成部署） | `:generateContent` | `contents` / `generationConfig` |
> | **自行部署的开源 LLM**（通过 Model Garden 部署的 Llama、DeepSeek、Qwen、Gemma、Mistral 等） | `/chat/completions` | 与 OpenAI 兼容的 `messages` |
> | **旧版自定义模型**（分类、回归、自定义训练、嵌入模型） | `:predict` | `instances` / `parameters` |
>
> 运行 `gcloud ai endpoints describe <ENDPOINT_ID> --region=<REGION>
> --format=json` 并检查 `deployedModels[].model` 以确定类型：
> 包含 `gemini` → 调优后的 Gemini；匹配开源发布方
> （`meta/`、`google/gemma-`、`deepseek-ai/`、`qwen/` 等）→ 开源 LLM；
> 否则 → 很可能是旧版自定义模型。
>
> **维度 2——端点类型（共享或专用）**决定 URL 主机：
>
> | `dedicatedEndpointEnabled` | 主机 |
> |---|---|
> | `false`（默认——共享端点） | `<REGION>-aiplatform.googleapis.com` |
> | `true`（专用端点，拥有自己的 DNS） | `dedicatedEndpointDns` 的值（格式：`<ENDPOINT_ID>.<REGION>-<PROJECT_NUM>.prediction.vertexai.goog`） |
>
> 无法通过共享的
> `<REGION>-aiplatform.googleapis.com` 主机访问专用端点（根据
> `Endpoint.dedicated_endpoint_enabled` proto：*“启用专用端点后，你将无法向共享
> DNS 发送请求”*）。始终检查 describe 输出中的 `dedicatedEndpointDns`：
> 如果已设置，则将其用作主机；否则使用共享主机。
>
> 在两种主机上，**路径始终为
> `/v1/projects/.../locations/.../endpoints/<id>/...`**。
> `/v1/`（GA）和 `/v1beta1/`（beta）都会路由到同一个后端；本技能中的方案使用 `/v1/`。公开的
> [Gemma 部署笔记本](https://github.com/GoogleCloudPlatform/vertex-ai-samples/blob/main/notebooks/community/model_garden/model_garden_gemma_deployment_on_vertex.ipynb)
> 仍使用 `/v1beta1/`，该版本同样有效。

### 4a. REST 用法示例 — 调优后的 Gemini 模型

Gemini 调优的输出始终是一个已为你部署好的端点，可通过共享主机上的 `:generateContent` 访问。

```bash
PROJECT_ID=my-project
ENDPOINT_ID=5875254126916403200
REGION=us-central1
TOKEN=$(gcloud auth application-default print-access-token)

curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/endpoints/${ENDPOINT_ID}:generateContent" \
  -d '{
    "contents": [
      {"role": "user", "parts": [{"text": "Hello! Introduce yourself briefly."}]}
    ],
    "generationConfig": {
      "temperature": 0.2
    }
  }'
```

> [!WARNING]
>
> **如果设置了 `maxOutputTokens`，请为思考模型留出充足的额度。**
> Gemini 2.5 Pro（以及其他启用了思考功能的模型）会生成计入 `maxOutputTokens` 的“思考”
> token，而且这些 token 会在生成任何用户可见文本之前产生。如果上限较小（例如 100），
> 整个额度都会被思考过程消耗，导致响应中的 `text` 部分为空，但
> `usageMetadata.candidatesTokenCount` 不为零。
>
> 如果不需要限制输出长度，请完全省略 `maxOutputTokens`，让模型根据需要自由输出。
> 如果确实要设置：对于任何类似聊天的用途，请设为 `>= 512`；对于一段文本的输出，
> 请设为 `>= 1024`。如果响应中出现 `finishReason: "MAX_TOKENS"` 且没有 `text`
> 内容，则说明设置的上限过低。

### 4b. REST 用法示例 — 自行部署的开源 LLM（Llama、DeepSeek、Qwen、Gemma 等）

自行部署的开源 LLM 可能位于**共享**端点或**专用**端点上，具体取决于部署时的配置（创建时的 `dedicated_endpoint_enabled`）。下面的用法示例通过检查 describe 输出中的 `dedicatedEndpointDns` 来兼容这两种情况。

```bash
PROJECT_ID=my-project
ENDPOINT_ID=5875254126916403200
REGION=us-central1
TOKEN=$(gcloud auth application-default print-access-token)

# Step 1: discover host. dedicatedEndpointDns is empty for shared endpoints.
DEDICATED_DNS=$(gcloud ai endpoints describe "$ENDPOINT_ID" \
  --project="$PROJECT_ID" --region="$REGION" \
  --format="value(dedicatedEndpointDns)")

if [ -n "$DEDICATED_DNS" ]; then
  HOST="$DEDICATED_DNS"
else
  HOST="${REGION}-aiplatform.googleapis.com"
fi

# Step 2: call /chat/completions. Path is identical for both hosts.
curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://${HOST}/v1/projects/${PROJECT_ID}/locations/${REGION}/endpoints/${ENDPOINT_ID}/chat/completions" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello! Introduce yourself briefly."}
    ]
  }'
```

> [!NOTE]
>
> -   `max_tokens`（不是 `maxOutputTokens`）— 这是与 OpenAI 兼容的术语，而不是 Vertex 的术语。完全省略该字段可让模型根据需要自由输出；只有在需要限制输出时才显式设置。
> -   对于端点部署，OpenAI 风格载荷中的 `"model"` 字段可以省略（或设置为 `""`）— 端点已经决定由哪个模型处理请求。
> -   同一端点还为文本补全模型提供 `/completions`（旧版文本补全）接口，并为嵌入模型提供 `/embeddings` 接口。
> -   **推理模型**（DeepSeek-R1、Kimi-K2-Thinking、GLM-5 变体等）会生成计入 `max_tokens` 的思考 token，而且这些 token 会在生成最终答案之前产生 — 与第 4a 节中的 Gemini 2.5 Pro 存在相同的问题。如果确实设置了 `max_tokens`，但得到空的 `choices[0].message.content` 或 `finish_reason: "length"`，请提高该值（聊天场景设为 >= 1024，较长的思考链设为 >= 2048），或者省略该字段。

Python 对应实现（OpenAI SDK）——与公开的
[Gemma 部署笔记本](https://github.com/GoogleCloudPlatform/vertex-ai-samples/blob/main/notebooks/community/model_garden/model_garden_gemma_deployment_on_vertex.ipynb)一致：

```python
import google.auth
from google.auth.transport.requests import Request
import openai

from google.cloud import aiplatform

PROJECT_ID = "my-project"
ENDPOINT_ID = "5875254126916403200"
REGION = "us-central1"

aiplatform.init(project=PROJECT_ID, location=REGION)
endpoint = aiplatform.Endpoint(
    f"projects/{PROJECT_ID}/locations/{REGION}/endpoints/{ENDPOINT_ID}"
)
endpoint_resource_name = endpoint.resource_name  # full projects/.../endpoints/<id>
dedicated_dns = endpoint.gca_resource.dedicated_endpoint_dns  # empty if shared

host = dedicated_dns if dedicated_dns else f"{REGION}-aiplatform.googleapis.com"
base_url = f"https://{host}/v1/{endpoint_resource_name}"

creds, _ = google.auth.default()
creds.refresh(Request())

client = openai.OpenAI(base_url=base_url, api_key=creds.token)
response = client.chat.completions.create(
    model="",  # endpoint determines the served model
    messages=[{"role": "user", "content": "Hello! Introduce yourself briefly."}],
    # Omit max_tokens to let the model emit as much as it wants. Set it
    # only if you need to cap output length (see notes above).
)
print(response.choices[0].message.content)
```

另请参阅：`agent-platform-deploy` 技能的第 4 节“验证部署”，
其中在部署后使用了相同的模式。

### 4c. REST 方法——旧版 `:predict`（自定义模型 / 分类 / 嵌入）

主机发现逻辑与 4b 相同（根据
`dedicatedEndpointDns` 使用共享端点或专用端点）：

```bash
DEDICATED_DNS=$(gcloud ai endpoints describe "$ENDPOINT_ID" \
  --project="$PROJECT_ID" --region="$REGION" \
  --format="value(dedicatedEndpointDns)")
HOST=${DEDICATED_DNS:-${REGION}-aiplatform.googleapis.com}

curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://${HOST}/v1/projects/${PROJECT_ID}/locations/${REGION}/endpoints/${ENDPOINT_ID}:predict" \
  -d '{
    "instances": [{"key": "value"}],
    "parameters": {}
  }'
```

`instances` 的确切结构因模型而异；请查阅已部署
模型的文档或用于部署该模型的 Model Garden 卡片。

### 4d. Python（Vertex AI SDK）——调优后的 Gemini 模型

```python
from google import genai
import google.auth

_, project_id = google.auth.default()
client = genai.Client(vertexai=True, project=project_id, location="us-central1")

ENDPOINT_ID = "5875254126916403200"
response = client.models.generate_content(
    model=f"projects/{project_id}/locations/us-central1/endpoints/{ENDPOINT_ID}",
    contents="Hello! Introduce yourself briefly.",
    config={"temperature": 0.2},  # add max_output_tokens only if you need a cap
)
print(response.text)
```

## 5. 故障排除与常见错误代码

### 429：资源耗尽

*   **原因**：OpenMaaS 和 Gemini 模型使用**动态共享配额（DSQ）**。
    资源会被汇集，并根据可用情况动态分配。429
    错误表示共享资源池暂时耗尽，并不一定意味着
    *你的*特定项目配额已用尽（但也有这种可能）。
*   **解决方案**：实施严格的**指数退避和重试**策略。
*   **高吞吐量**：对于需要高吞吐量或
    有保障容量的生产工作负载，请考虑使用**预置吞吐量（PT）**。
*   **重要提示**：通过常规云端流程（Cloud
    Console）申请增加配额**不适用于** DSQ 限制。
*   **文档**：
    [配额和限制（DSQ）](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/quotas)

### 400：用户验证错误

*   **原因**：请求格式无效、参数不受支持或 Model ID 不正确。
*   **操作**：仔细检查请求载荷和参数。确认 Model ID 和区域正确无误。
*   **自定义端点**：根据第 4 节中的决策表选择正确的方法和主机：
    *   调优后的 Gemini + 你调用了 `:predict` → 切换到 `:generateContent`
        （第 4a 节）。错误消息中会提到“Required instances format mismatch”。
    *   OSS LLM（Llama/DeepSeek/Qwen/Gemma 等）+ 你调用了
        `:generateContent` 或 `:predict` → 切换到 `/chat/completions`
        （第 4b 节）。错误可能是 404、405 或“method not allowed”。
    *   旧版/自定义训练的模型 + 你调用了 `:generateContent` 或
        `/chat/completions` → 切换到 `:predict`（第 4c 节）。
*   **通过共享主机访问了专用端点（反之亦然）**：
    *   症状：DNS 解析失败（`Could not resolve host`）或 404。
    *   原因：专用端点不接受发送到
        `<REGION>-aiplatform.googleapis.com` 的流量，而专用 DNS
        （`*.prediction.vertexai.goog`）仅在
        `dedicatedEndpointEnabled` 为 true 时存在。
    *   操作：重新检查 `gcloud ai endpoints describe ... --format=json`
        输出中的 `dedicatedEndpointDns` 字段；仅当其非空时才使用它（参照
        第 4b/4c 节中的主机发现代码片段）。

### Gemini 已部署端点的响应文本为空

*   **原因**：`maxOutputTokens` 设置得过低。Gemini 2.5 Pro 和其他
    思考模型会生成“thoughts” token，这些 token 会在任何用户可见文本
    之前计入预算。当上限较小（例如 100）时，全部预算都会被 thoughts
    消耗，导致响应中的 `text` 部分为空，但
    `usageMetadata.candidatesTokenCount` 非零且
    `finishReason: "MAX_TOKENS"`。
*   **操作**：完全省略 `maxOutputTokens`（让模型根据需要生成任意长度的
    内容），或对于聊天类用途将其提高到 >= 512，对于较长输出提高到
    >= 1024。详情请参阅第 4 节“自定义端点”。

### 404：未找到/模型不可用

*   **原因**：模型未启用，或在指定的项目或区域中不可用。
*   **操作**：
    1.  **检查位置可用性**：
        *   **OpenMaaS**：确认模型在你的区域中可用。请参阅
            [按位置划分的模型可用性](https://docs.cloud.google.com/gemini-enterprise-agent-platform/resources/locations#genai-open-models)。
        *   **Gemini**：
            *   **权威来源**：始终查看
                [Gemini 模型位置](https://docs.cloud.google.com/gemini-enterprise-agent-platform/resources/locations#google-models)
                以获取权威列表。
            *   **预览版模型**：所有预览版模型（例如 Gemini 3.1、
                实验版本）通常**仅**在
                `us-central1` 或 `global` 区域可用。
            *   **稳定版模型**：（例如 Gemini 2.5 Pro）在
                `us-central1`、`europe-west4` 和许多其他区域可用。
            *   **重要提示**：如果遇到 404/400 错误，请尝试将客户端
                位置切换到 `us-central1` 或 `global`。
    2.  **启用 Llama 模型**：对于 **Llama 3.3** 和 **Llama 4**，使用前
        **必须**先在 Model Garden 中启用模型。前往
        [Model Garden](https://console.cloud.google.com/agent-platform/model-garden)，
        搜索模型卡片（例如“Llama 3.3 API Service”），然后点击
        **启用**。只有完成此操作后，才能发出推理请求。