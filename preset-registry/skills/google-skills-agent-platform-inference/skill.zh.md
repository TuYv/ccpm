---
name: agent-platform-inference
metadata:
  category: AiAndMachineLearning
description: >-
  Connects to and performs inference with Google Cloud Agent Platform GenAI
  models, including First-Party Gemini models and Third-Party OpenMaaS models
  (Llama, DeepSeek, Qwen, etc.). Use when asked to perform inference, ask a
  model a question, run a test prompt, execute chat completions, or generate
  code for calling Gemini or OpenMaaS models, authenticate with GenAI SDK,
  OpenAI SDK, or legacy Agent Platform SDK, configure base URLs and
  global/regional endpoints, or troubleshoot 429 Resource Exhausted (DSQ), 400
  User Validation, or 404 Not Found errors. Don't use for deploying models to
  endpoints or for running model evaluations.
---
# Agent Platform GenAI 推理技能

本技能提供有关进行身份验证并连接到 Google
Cloud Agent Platform 以使用生成式 AI 模型的说明。内容涵盖：

*   **第一方发布商模型** (Gemini) — 第 2 节。
*   **第三方发布商模型** (OpenMaaS: Llama, DeepSeek, Qwen 等)
    — 第 3 节。
*   **自定义端点**（任何位于数值型 `projects/.../endpoints/<id>`
    资源上的模型 — 微调后的 Gemini 模型、通过 `agent-platform-deploy` 技能从 Model Garden
    自行部署的 OSS LLM，以及旧版自定义模型）—
    第 4 节。

## 安全与确认层级（关键）

在代表用户执行任何命令或脚本之前，你必须根据所请求的操作遵守以下安全层级。（本技能为只读；其他安全层级已省略）：

1.  **层级 R：只读 / 推理（`client.models.generate_content`,
    `client.chat.completions.create`, `client.completions.create`,
    `client.embeddings.create`）**
    *   在代表用户执行模型推理之前，需要提供带有“是”/“否”选项的**交互式确认**，
        以防止意外的费用或配额消耗。
    *   **确认卡片中的必填字段**：确认提示必须清晰说明拟执行的推理操作，并明确列出以下
        所有参数：
        *   **项目 ID**：Google Cloud 项目 ID 或编号（例如
            `123456789012`、`my-project`）。
        *   **区域 / 位置**：目标区域（例如 `us-central1`、
            `global`）。
        *   **模型 ID**：确切的模型 ID（例如 `gemini-2.5-flash`、
            `deepseek-ai/deepseek-v3.2-maas`）。
        *   **SDK**：SDK 选择（例如 `Google GenAI SDK (google-genai)`、
            `OpenAI SDK`）。
        *   **输入提示**（或 **输入图像** / **输入媒体**）：提示文本
            或媒体 URI。
        *   如有指定，任何额外的生成参数（例如 `max_output_tokens`、
            `response_schema`）。
        未明确列出这些参数的自然语言释义并不充分。
    *   **同轮限制**：不得在展示确认提示的同一轮中执行推理脚本或
        命令。停止并等待用户回复；仅在获得明确的“是”/
        批准后才执行。
    *   **黄金标准示例**：
        > 我将使用以下参数执行模型推理。请在我继续之前确认这些信息：
        > * **项目 ID**：`my-project`
        > * **区域**：`us-central1`
        > * **模型 ID**：`gemini-2.5-pro`
        > * **SDK**：Google GenAI SDK (`google-genai`)
        > * **输入提示**："用 3 句话总结《哈姆雷特》的情节"
        >
        > 是否确认？[是/否]

## 阶段 0：环境设置

**关键**：在运行 `scripts/`
目录中的任何 Python 示例脚本之前（例如 `scripts/openmaas_openai_sdk.py`），你必须通过遵循以下步骤确保环境已正确初始化：

1.  **Google Cloud 身份验证**：使用您的 Google Cloud 凭据进行身份验证，并为 Agent Platform 访问配置有效的应用默认凭据 (ADC)：

    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```

2.  **启用 API**（如果尚未启用）：

    ```bash
    gcloud services enable aiplatform.googleapis.com
    ```

3.  **Python 依赖项**：这些脚本导入 `vertexai`（来自
    `google-cloud-aiplatform`）、`google-genai` 和 `openai`。**不要**创建虚拟环境——它一开始是空的，会隐藏环境已提供的软件包，从而强制进行冗余安装。请先探测，仅安装缺失的依赖项：

    ```bash
    python3 -c "import vertexai, google.genai, openai" \
      || pip install -r scripts/requirements.txt
    ```

    `scripts/requirements.txt` 是为尚未提供这些 SDK 的环境准备的后备方案；不要在正常工作的环境上安装它。

4.  **验证设置（可选）**：一次性运行所有示例脚本，以验证环境端到端正常工作：

    ```bash
    ./scripts/verify_all.sh
    ```

5.  **执行**：使用普通的 `python3 scripts/...` 运行脚本。无需先激活任何环境。



> [!IMPORTANT] **关键：模型 ID 与可用性** * **Gemini 模型**：请参阅
> [Gemini 模型][gemini-models-docs]，了解有效的模型 ID 和区域。*
> **OpenMaaS 模型**：请参阅
> [在 Agent Platform 上使用开放模型](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/use-open-models)，
> 了解 Llama、DeepSeek、Qwen 等模型。* **不完整的列表**：此技能中列出的模型 ID **仅为示例**，可能不完整或已过时。*
> **操作**：生成代码前，务必使用上述链接验证模型 ID 和区域。
>
> \[gemini-models-docs]:
> https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/migrate
>

## 参数落地与澄清协议（关键）

在准备代码或展示 Tier R 确认卡之前，您**必须**确保所有必要参数均已明确：

1.  **缺少模型 ID、模型系列或 SDK（关键）**：
    *   如果用户**尚未**指定要使用的模型或模型系列（例如，“运行测试提示词”、“让生成式 AI 模型……”，或“向 DeepSeek 提问”但未指定模型版本），或者尚未指定 SDK 偏好：
    *   **绝不**猜测、主动提供或默认使用某个模型（例如
        `gemini-2.5-flash`、`gemini-2.5-pro` 或 `deepseek-v3.2-maas`）。
        在未询问的情况下，于确认卡中提出默认模型将违反参数落地要求。
    *   **您必须停止并询问用户**：“您想使用哪个模型（或模型系列，例如 Gemini、Llama、DeepSeek 或 Qwen），以及哪种 SDK 偏好（例如 Google GenAI SDK 或 OpenAI SDK）？”如果未指定，还应询问目标区域和项目 ID。
    *   只有在用户指定模型（以及任何缺失的 SDK 偏好）后，您才应继续准备执行并展示 Tier R 确认提示。

2.  **缺少 Project ID 或 Region**：
    *   如果用户未在提示或对话上下文中指定 project ID 或 region，**询问**用户提供 project ID 和 region（例如：“您希望使用哪个 project ID 和 region？”）。不要默默假设某个项目或区域。
    *   **OpenMaaS 位置**：OpenMaaS publisher models 托管在 `global`
        （例如 `deepseek-ai/deepseek-v3.2-maas`、
        `meta/llama-3.3-70b-instruct-maas`）或区域端点（例如
        `us-central1`，对应 `deepseek-ai/deepseek-r1-0528-maas`）。
        配置 OpenMaaS models 的推理时，使用适当的端点：

        *   全局：`https://aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/global/endpoints/openapi`
        *   区域：`https://{REGION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{REGION}/endpoints/openapi`

        并在确认卡片和最终响应中明确体现 region。

3.  **SDK 选择**：
    *   如果用户指定了 model 但未指定 SDK，则使用该 model family 的首选 SDK（Gemini 使用 GenAI SDK `google-genai`，OpenMaaS 使用 OpenAI SDK `openai`）。

4.  **通过 Python 在沙箱中执行（关键）**：
    *   通过 `run_command` 在沙箱中执行 model inference 时，**始终**使用官方 SDK 运行 Python 代码（例如，编写并运行使用 `google-genai`、`openai` 或 `vertexai` 的 Python 脚本）。
        不要使用原始 curl 命令执行最终推理。

## 工作流决策树

1.  **是否指定了 Model？**
    *   **否**（用户未提供 model name/family） -> **询问用户**希望使用哪个 model 或 model family、目标 region 以及 SDK 偏好。
    *   **信息不完整**（例如用户只说了“DeepSeek”或“Llama”，未提供版本） -> **询问用户**偏好的具体 model version
        （例如 `deepseek-ai/deepseek-r1-0528-maas`、
        `deepseek-ai/deepseek-v3.2-maas`、`meta/llama-3.3-70b-instruct-maas`）。
    *   **是** -> 继续执行第 2 步。

2.  **Model Family 和 SDK 选择**：
    *   **Gemini**（例如 `gemini-2.5-pro`、`gemini-2.5-flash`） -> 首选：
        **GenAI SDK**（`google-genai`）。继续执行 [1. Gemini Models]。
    *   **OpenMaaS**（例如 `deepseek-ai/*`、`meta/llama-*`、`qwen/*`） ->
        首选：**OpenAI SDK**（`openai`）。继续执行 [2. OpenMaaS Models]。
    *   **Custom Endpoint**（数字 endpoint ID
        `projects/.../endpoints/<id>`） -> 继续执行 [4. Custom Endpoints]。

3.  **故障排查**：用户是否报告了错误（429 Resource Exhausted、
    400 User Validation、404 Not Found、由于 token limits 导致的空响应等）？
    *   **是** -> 继续执行 [5. Troubleshooting & Common Error Codes]。
    *   **否** -> 展示包含所有必填字段（Project ID、Region、Model ID、SDK、Input Prompt）的 Tier R 确认提示，等待用户确认，然后通过 Python SDK 执行。

## 0.5 发布商端点的区域可用性检查（Gemini + LoRA 基础模型）

> [!NOTE] **如果符合以下任一情况，请跳过本节**：
>
> - 用户正在调用自定义端点（§4）——即部署在数值型 `projects/.../endpoints/<id>` 上的调优 Gemini 模型、自行部署的 OSS LLM（Llama、DeepSeek、Qwen、Gemma 等）或传统自定义模型。这些请求会命中特定的端点资源，其区域在部署时已固定；如果调用方所在区域不匹配，端点查找会直接返回清晰的 404，且不会产生推理费用。请转到 §4。
> - 用户正在调用 OpenMaaS 发布商模型（§2）——即通过全局 `openapi` 基础 URL 提供的 Llama、DeepSeek、Qwen 等模型。这些模型不像第一方 Gemini 那样具有按区域限制的可用性。请转到 §2。
>
> **仅当**用户调用第一方托管 Gemini 模型（`gemini-*`，通过 §1 调用）时，才应用本节；这也包括基于 Gemini 的微调 LoRA 适配器——这些请求会通过发布商端点路由，而发布商端点的区域可用性确实会发生变化。

在响应任何针对第一方托管 Gemini 模型（`gemini-*`）或微调 Gemini LoRA 适配器（通过数值型端点 ID + 用户声明的基础模型标识）且指定了具体区域的推理请求之前，你**必须**通过实时 API 调用验证该模型是否确实在该区域可用。不要依赖 Google Search、训练语料中的知识或发布商文档来判断可用性——区域可用性经常变化，基于已有文本得出的结论可能已经过时或不正确。

只探测用户请求的确切模型和区域。不要将其他模型作为“对照”进行探测——你无法根据模型 B 的状态推断模型 A 的可用性，因为模型 B 可能由于与参考区域无关的原因，在该区域本身也不可用。

对于第一方 Gemini 模型，请使用真实的 `:generateContent` 调用和最小有效负载进行探测：

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    "https://${LOCATION_ID}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/${MODEL_ID}:generateContent" \
    -d "{\"contents\":{\"role\":\"user\",\"parts\":{\"text\":\"${PROBE_TEXT:-hi}\"}}}"
```

对于针对微调 Gemini LoRA 适配器的推理，请使用上面相同的 `:generateContent` 调用，在目标区域探测其**基础模型**，并将 `${MODEL_ID}` 设置为基础模型（例如，如果适配器基于 `gemini-2.5-flash` 进行调优，则设置为 `gemini-2.5-flash`）。如果基础模型在某个区域不可用，LoRA 适配器也无法在该区域提供服务。

解释探测结果并采取相应行动：

-   **200** —— 模型在该区域可用。继续按照 §1 设置 SDK。
-   **404** —— 模型在该区域不可用。停止。明确告知用户该模型未在该区域提供服务，并列出它可用的区域（从 [Gemini 模型][gemini-models-docs] 或不带 `--region` 的 `gcloud ai model-garden models list
    --filter="name~$MODEL_NAME"` 获取）。不要静默切换区域。不要继续为不受支持的区域编写推理代码或初始化 SDK。不要运行额外的“对照”探测来再次确认 404——目标区域的探测结果具有权威性。
-   **任何其他结果**（权限被拒绝、配额不足、临时故障等）——不要据此判断模型可用或不可用。用通俗语言解释根本原因（例如：“你的账号无权访问此项目的 Vertex AI API——请在控制台中启用该 API，或切换项目”），并说明下一步具体应采取的操作。

## 1. Gemini 模型

对于 Gemini 模型（例如 `gemini-2.5-pro`、`gemini-3-flash-preview`），
**GenAI SDK**（`google-genai`）是**首选**方法。旧版
`vertexai` SDK 仍受支持，但对于新项目，建议使用 GenAI SDK。

> [!IMPORTANT]
> **预览版模型（包括 Gemini 3.1）**通常**仅**在
> `global` 区域可用。稳定版模型可在 `us-central1` 和其他区域使用。

### 选择合适的 SDK

*   **Gemini 模型**：**GenAI SDK**（`google-genai`）是**首选**。如需兼容性，
    可使用 OpenAI SDK；如有需要，也可以使用旧版 SDK（`vertexai`）。
*   **OpenMaaS 模型**：**强烈建议**使用 **OpenAI SDK**。如果有特定的基础设施要求，
    可使用 GenAI SDK 或旧版 SDK。

### 安装

```bash
pip install google-genai
```

### Python 示例（GenAI SDK - 首选）

完整代码请参见 [`scripts/gemini_genai_sdk.py`](scripts/gemini_genai_sdk.py)。

### 替代方案：OpenAI SDK（Chat Completions）

使用标准 OpenAI SDK 和 Agent Platform 端点。这对于跨平台兼容性非常有帮助。

完整代码请参见 [`scripts/gemini_openai_sdk.py`](scripts/gemini_openai_sdk.py)。

### 旧版：Agent Platform SDK

旧版 `vertexai` SDK 仍被广泛使用，但对于新的 Gemini 项目，优先使用
`google-genai`。

完整代码请参见 [`scripts/gemini_vertexai_sdk.py`](scripts/gemini_vertexai_sdk.py)。

**文档**：
[Google GenAI SDK](https://github.com/googleapis/python-genai)

**文档**：
[Agent Platform Gemini Models](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/google-models)

## 2. OpenMaaS 模型（Llama、DeepSeek、Qwen 等）

对于 OpenMaaS（Model-as-a-Service）模型，**强烈建议**使用标准的
**OpenAI SDK**，并配合特定的 Vertex AI 端点。

> [!WARNING] 虽然 `GenerativeModel` *可以*支持部分 OpenMaaS 模型，但
> **不建议**这样做。为获得最佳兼容性（尤其是
> Chat Completions），请使用 OpenAI SDK。

### 安装

```bash
pip install openai google-auth
```

### OpenAI SDK 的身份验证

你**必须**使用 Google Cloud OAuth 访问令牌作为 OpenAI SDK 的 API 密钥。

```python
import subprocess

def get_gcp_access_token():
    return subprocess.check_output(
        ["gcloud", "auth", "print-access-token"]
    ).decode("utf-8").strip()
```

> [!NOTE] Google Cloud 访问令牌通常在 1 小时后过期。上面的
> `get_gcp_access_token()` 函数会在调用时获取一个*最新*令牌。对于长时间运行的
> 应用程序，你需要实现刷新机制。详情请参见
> [Refresh the access token](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/migrate/openai/auth-and-credentials?hl=en#refresh_your_credentials)。

### 配置（Base URL）



-   **全局端点**（对于大多数需要全球可用性的模型，推荐使用）：
    `https://aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/global/endpoints/openapi`
-   **区域端点**：
    `https://{REGION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{REGION}/endpoints/openapi`

### Python 示例（OpenMaaS - Chat Completions）

完整代码请参阅 [`scripts/openmaas_openai_sdk.py`](scripts/openmaas_openai_sdk.py)。

> [!TIP] **替代方案：环境变量** 你可以在 shell 中设置环境变量，而无需更新代码。
>
> **替代方案：环境变量** 你可以在 shell 中设置环境变量，而无需更新代码。

```bash
export OPENAI_BASE_URL="https://aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/global/endpoints/openapi"
export OPENAI_API_KEY="$(gcloud auth application-default print-access-token)"
```
> 然后无需传入参数即可初始化客户端：`client = OpenAI()`

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

`google-genai` SDK 也可以通过 `vertexai` 后端访问 OpenMaaS 模型。

完整代码请参阅 [`scripts/openmaas_genai_sdk.py`](scripts/openmaas_genai_sdk.py)。

> [!IMPORTANT]
> **模型 ID 格式**：对于使用 OpenMaaS 的 GenAI SDK，你**必须**使用完整路径：`publishers/PUBLISHER/models/MODEL`（例如：
> `publishers/zai-org/models/glm-5-maas`）。

### 旧版：Agent Platform SDK（OpenMaaS）

对于 OpenMaaS，你也可以使用 `GenerativeModel`（如果支持）。

完整代码请参阅 [`scripts/openmaas_vertexai_sdk.py`](scripts/openmaas_vertexai_sdk.py)。

> [!IMPORTANT] **模型 ID 格式**：对于使用 OpenMaaS 的 Agent Platform SDK，你**必须**使用完整路径：`publishers/PUBLISHER/models/MODEL`。

### 模型参考与可用性

**文档**：
[在 Agent Platform 上使用开放模型](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/use-open-models)

> [!TIP]
> **自行部署以获得控制权**：如果你需要 MaaS 未提供的**专用硬件**
> （GPU/TPU）、**有保障的容量**或**特定的区域部署**，你可以将这些模型**自行部署**到 Agent Platform
> Endpoints。在 Model Garden 中搜索模型并点击“Deploy”以选择机器类型。请参阅 `agent-platform-deploy` skill 了解部署工作流，并参阅**本 skill 的第 4 节**，了解如何调用生成的自行部署端点（在专用端点
> DNS 上使用 `/chat/completions`，而不是上面的 OpenMaaS 发布者 URL）。

> [!IMPORTANT] **查找推理示例**：上面的列表只是起点。要获取**权威的**推理代码片段（尤其是 Chat
> Completions 负载结构），请执行以下操作：1. 查阅
> [在 Agent Platform 上使用开放模型](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/use-open-models)
> 列表。2. 点击特定模型的链接（例如“DeepSeek-V3”），访问其 **Model Garden**
> 页面。3. 在 Model Garden 页面中查找 **“Sample Code”** 或 **“Use this
> model”** 按钮，以获取该特定模型版本准确的 `curl` 或 Python
> 代码。

> [!NOTE] 此列表**并不完整**。请参阅
> [在 Agent Platform 上使用开放模型](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/use-open-models)
> 以获取受支持模型的完整列表。

模型系列 | 模型 ID 示例 | 区域 | 备注
:------------ | :--------------------------------------------- | :------------ | :----
**Llama 4**   | `meta/llama-4-maverick-17b-128e-instruct-maas` | `us-east5`    |
**Llama 4**   | `meta/llama-4-scout-17b-16e-instruct-maas`     | `us-east5`    |
**Llama 3.3** | `meta/llama-3.3-70b-instruct-maas`             | `us-central1` |
**DeepSeek**  | `deepseek-ai/deepseek-v3.2-maas`               | `global`      | 仅限 Global
**DeepSeek**  | `deepseek-ai/deepseek-v3.1-maas`               | `us-west2`    | 仅限 US-West2
**DeepSeek**  | `deepseek-ai/deepseek-r1-0528-maas`            | `us-central1` |
**Qwen 3**    | `qwen/qwen3-coder-480b-a35b-instruct-maas`     | `global`      |
**Qwen 3**    | `qwen/qwen3-next-80b-a3b-instruct-maas`        | `global`      |
**Kimi**      | `moonshotai/kimi-k2-thinking-maas`             | `global`      |
**MiniMax**   | `minimaxai/minimax-m2-maas`                    | `global`      |
**GLM**       | `zai-org/glm-4.7-maas`, `zai-org/glm-5-maas`   | `global`      |

## 4. 自定义端点（微调后的 Gemini、自行部署的 OSS LLM、旧版自定义）

本节介绍如何调用属于你的项目的 Agent Platform **端点**上的模型——即资源名称为数字形式的对象，例如
`projects/.../endpoints/5875254126916403200`。这不同于调用第 2 节和第 3 节中的发布商 MaaS 接口（后者访问的是
`publishers/.../models/...` 或 `endpoints/openapi`，而非你的端点
ID）。

> [!IMPORTANT]
>
> **发布商 MaaS 与你的端点（请勿混淆）。** 第 3 节中的
> OpenMaaS 示例（例如 `meta/llama-3.3-70b-instruct-maas`）访问的是
> 位于 `/v1/projects/.../locations/.../endpoints/openapi` 的
> **共享发布商 URL**。本节中的示例访问的是位于 `/v1/projects/.../endpoints/<id>` 的**你的**
> 端点。如果你通过 Model Garden 的“Deploy”部署了 Llama / Gemma / 等模型
> （而非 MaaS 发布商产品），请遵循本节，而不是
> 第 3 节。

> [!IMPORTANT]
>
> **活动端点发现与唯一事实来源**：
>
> *   若要检查模型或微调后的 Gemini 适配器是否已部署并可供
>     推理运行，请执行：
>
>     `gcloud ai endpoints list --project=<PROJECT_ID> --region=<REGION> --format=json`。
>
> *   **`gcloud ai endpoints list` 是活动服务端点的唯一权威
>     来源。**
> *   不要依赖过去 `gcloud ai tuning-jobs list` 记录中的历史
>     `job.tunedModel.endpoint` 标识符——这些标识符记录了微调期间最初创建端点的位置，
>     但如果该端点后来被删除、取消部署或过期，它就不再处于活动状态。
> *   如果 `gcloud ai endpoints list` 返回空的 `[]`，或者请求的微调
>     模型未部署在任何列出的端点上，请直接向用户报告该区域中未找到活动端点，并停止。**绝不要**
>     臆测历史/已删除的端点已准备就绪，也**绝不要**
>     在没有明确用户指示和新的 Tier R 确认提示的情况下，静默替换为基础模型。

> [!IMPORTANT]
>
> **两个正交轴决定调用形态：**
>
> **轴 1 — 模型系列**决定 RPC 方法和载荷：
>
> | 端点服务对象 | 方法 | 载荷 |
> |---|---|---|
> | **经过调优的 Gemini 模型**（Gemini 调优的输出结果——端点已为你部署完毕） | `:generateContent` | `contents` / `generationConfig` |
> | **自行部署的 OSS LLM**（Llama、DeepSeek、Qwen、Gemma、Mistral 等，通过 Model Garden 部署） | `/chat/completions` | 兼容 OpenAI 的 `messages` |
> | **旧版自定义模型**（分类、回归、自定义训练、嵌入） | `:predict` | `instances` / `parameters` |
>
> 运行 `gcloud ai endpoints describe <ENDPOINT_ID> --region=<REGION>
> --format=json` 并检查 `deployedModels[].model` 以作出判断：
> 包含 `gemini` → 经调优的 Gemini；匹配 OSS 发布者
> （`meta/`、`google/gemma-`、`deepseek-ai/`、`qwen/`、...）→ OSS LLM；
> 否则 → 很可能是旧版自定义模型。
>
> **轴 2 — 端点类型（共享或专用）**决定 URL 主机：
>
> | `dedicatedEndpointEnabled` | 主机 |
> |---|---|
> | `false`（默认——共享端点） | `<REGION>-aiplatform.googleapis.com` |
> | `true`（专用端点，拥有自己的 DNS） | `dedicatedEndpointDns` 的值（格式：`<ENDPOINT_ID>.<REGION>-<PROJECT_NUM>.prediction.vertexai.goog`） |
>
> 专用端点**无法**通过共享的
> `<REGION>-aiplatform.googleapis.com` 主机访问（根据
> `Endpoint.dedicated_endpoint_enabled` proto：*"启用专用端点后，
> 你将无法向共享 DNS 发送请求"*）。始终检查 describe 输出中的
> `dedicatedEndpointDns`：如果已设置，则将其用作主机；
> 否则使用共享主机。
>
> **在两个主机上，路径始终为
> `/v1/projects/.../locations/.../endpoints/<id>/...`**。
> `/v1/`（GA）和 `/v1beta1/`（beta）都会路由到相同的后端；本
> skill 中的示例使用 `/v1/`。公开的
> [Gemma 部署笔记本](https://github.com/GoogleCloudPlatform/vertex-ai-samples/blob/main/notebooks/community/model_garden/model_garden_gemma_deployment_on_vertex.ipynb)
> 仍使用 `/v1beta1/`，该版本同样可用。
>
> ### 4a. REST 示例 — 经调优的 Gemini 模型
>
> Gemini 调优的输出结果始终是一个已为你部署完毕的端点，
> 可通过共享主机和 `:generateContent` 访问。
>
> ```bash
> PROJECT_ID=my-project
> ENDPOINT_ID=5875254126916403200
> REGION=us-central1
> TOKEN=$(gcloud auth application-default print-access-token)
>
> curl -sS -X POST \
>   -H "Authorization: Bearer $TOKEN" \
>   -H "Content-Type: application/json" \
>   "https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/endpoints/${ENDPOINT_ID}:generateContent" \
>   -d '{
>     "contents": [
>       {"role": "user", "parts": [{"text": "Hello! Introduce yourself briefly."}]}
>     ],
>     "generationConfig": {
>       "temperature": 0.2
>     }
>   }'
> ```
>
> > [!WARNING]
> >
> > **如果设置 `maxOutputTokens`，请为思考模型留出充足余量。**
> > Gemini 2.5 Pro（以及其他启用了思考能力的模型）会生成“思考”
> > token，这些 token 会在任何用户可见文本之前计入 `maxOutputTokens`。
> > 当上限较小时（例如 100），整个预算都会被思考内容消耗，
> > 响应中的 `text` 部分为空，但 `usageMetadata.candidatesTokenCount`
> > 非零。
> >
> > 如果不需要限制输出长度，请完全省略 `maxOutputTokens`，
> > 让模型按需生成内容。如果确实需要设置：
> > 对于任何类似聊天的用途，使用 `>= 512`；对于一段输出，
> > 使用 `>= 1024`。如果在响应中看到 `finishReason: "MAX_TOKENS"`，
> > 且没有 `text` 内容，说明你的上限设置得太低。

### 4b. REST 配方 — 自行部署的 OSS LLM（Llama、DeepSeek、Qwen、Gemma 等）

自行部署的 OSS LLM 可能位于**共享**或**专用**端点上，
具体取决于部署时的配置（创建时的 `dedicated_endpoint_enabled`）。
下面的配方通过检查 describe 输出中的 `dedicatedEndpointDns`
来处理这两种情况。

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
> -   `max_tokens`（不是 `maxOutputTokens`）——这是 OpenAI 兼容的
>     术语，而不是 Vertex 的术语。完全省略它即可让模型尽可能多地输出；
>     仅当你需要限制输出时才显式设置它。
> -   对于端点部署，OpenAI 风格载荷中的 `"model"` 字段可以省略（或
>     设为 `""`）——端点已决定由哪个模型为请求提供服务。
> -   同一端点还会为嵌入模型公开 `/completions`（旧版文本补全）
>     和 `/embeddings`。
> -   **推理模型**（DeepSeek-R1、Kimi-K2-Thinking、GLM-5 变体等）
>     会输出思考 token，这些 token 会在最终答案**之前**计入 `max_tokens`——
>     与第 4a 节中的 Gemini 2.5 Pro 存在相同的问题。
>     如果你确实设置了 `max_tokens`，并且得到空的
>     `choices[0].message.content` 或 `finish_reason: "length"`，请提高它
>     （聊天至少为 1024，较长的思维链至少为 2048），或者省略它。

Python 等效实现（OpenAI SDK）——与公开的
[Gemma 部署笔记本](https://github.com/GoogleCloudPlatform/vertex-ai-samples/blob/main/notebooks/community/model_garden/model_garden_gemma_deployment_on_vertex.ipynb)
保持一致：

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

import subprocess

token = subprocess.check_output(
    ["gcloud", "auth", "print-access-token"]
).decode("utf-8").strip()

client = openai.OpenAI(base_url=base_url, api_key=token)
response = client.chat.completions.create(
    model="",  # endpoint determines the served model
    messages=[{"role": "user", "content": "Hello! Introduce yourself briefly."}],
    # Omit max_tokens to let the model emit as much as it wants. Set it
    # only if you need to cap output length (see notes above).
)
print(response.choices[0].message.content)
```

另请参阅：`agent-platform-deploy` skill 第 4 节“验证部署”，
其中在部署后使用相同的模式。

### 4c. REST 方案 — 旧版 `:predict`（自定义 / 分类 / 嵌入）

与 4b 相同的主机发现逻辑（根据
`dedicatedEndpointDns` 使用共享或专用主机）：

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

确切的 `instances` 结构因模型而异；请查阅已部署模型的文档，
或其部署来源的 Model Garden 卡片。

### 4d. Python（Vertex AI SDK）— 微调后的 Gemini 模型

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

*   **原因**：OpenMaaS 和 Gemini 模型使用 **动态共享配额 (DSQ)**。
    资源会汇集起来，并根据可用性动态分配。429
    错误表示共享池暂时耗尽，并不一定意味着
    *你的*特定项目配额已用尽（尽管也可能如此）。
*   **解决方案**：实施严格的**指数退避和重试**策略。
*   **高吞吐量**：对于需要高吞吐量或
    有保障容量的生产工作负载，请考虑使用**预配吞吐量 (PT)**。
*   **重要提示**：通过常规云流程（Cloud
    Console）增加配额，**不**适用于 DSQ 约束。
*   **文档**：
    [配额和限制 (DSQ)](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/quotas)

### 400：用户验证错误

*   **原因**：请求格式无效、参数不受支持，或模型
    ID 不正确。
*   **操作**：再次检查请求负载和参数。确认
    模型 ID 和区域正确。
*   **自定义端点**：请根据第 4 节的
    决策表选择正确的方法 + 主机：
    *   微调后的 Gemini + 你调用了 `:predict` → 改用 `:generateContent`
        （第 4a 节）。错误信息会提及“Required instances format mismatch”。
    *   OSS LLM（Llama/DeepSeek/Qwen/Gemma 等）+ 你调用了
        `:generateContent` 或 `:predict` → 改用 `/chat/completions`
        （第 4b 节）。错误可能为 404、405 或“method not allowed”。
    *   旧版 / 自定义训练 + 你调用了 `:generateContent` 或
        `/chat/completions` → 改用 `:predict`（第 4c 节）。
*   **在共享主机上访问专用端点（或反之）**：
    *   症状：DNS 解析失败（`Could not resolve host`）或 404。
    *   原因：专用端点不接受来自
        `<REGION>-aiplatform.googleapis.com` 的流量，且专用 DNS
        (`*.prediction.vertexai.goog`) 仅在
        `dedicatedEndpointEnabled` 为 true 时存在。
    *   操作：重新检查 `gcloud ai endpoints describe ... --format=json`
        中的 `dedicatedEndpointDns` 字段；仅当其非空时使用它（遵循
        第 4b/4c 节中的主机发现代码片段）。

### Gemini 部署端点上的空响应文本

*   **原因**：`maxOutputTokens` 设置得过低。Gemini 2.5 Pro 和其他思考模型会生成“thoughts”令牌，这些令牌会在任何用户可见文本**之前**计入预算。设置较小上限时（例如 100），整个预算会被 thoughts 消耗，响应会包含空的 `text` 部分，但 `usageMetadata.candidatesTokenCount` 非零，且 `finishReason: "MAX_TOKENS"`。
*   **操作**：完全省略 `maxOutputTokens`（让模型按需输出），或针对类聊天用途将其提高到 >= 512，针对较长输出提高到 >= 1024。详见第 4 节“自定义端点”。

### 404：未找到 / 模型不可用

*   **原因**：模型未启用，或在指定项目或区域中不可用。
*   **操作**：
    1.  **检查区域可用性**：
        *   **OpenMaaS**：确认该模型在你的区域中可用。参见[按区域划分的模型可用性](https://docs.cloud.google.com/gemini-enterprise-agent-platform/resources/locations#genai-open-models)。
        *   **Gemini**：
            *   **权威来源**：始终查看[Gemini 模型区域](https://docs.cloud.google.com/gemini-enterprise-agent-platform/resources/locations#google-models)，获取权威列表。
            *   **预览模型**：所有预览模型（例如 Gemini 3.1、实验版本）通常**仅**在 `us-central1` 或 `global` 区域可用。
            *   **稳定模型**：（例如 Gemini 2.5 Pro）可在 `us-central1`、`europe-west4` 和许多其他区域使用。
            *   **重要提示**：如果遇到 404/400 错误，请尝试将客户端区域切换为 `us-central1` 或 `global`。
    2.  **启用 Llama 模型**：对于 **Llama 3.3** 和 **Llama 4**，你**必须**先在 Model Garden 中启用模型才能使用。前往[Model Garden](https://console.cloud.google.com/agent-platform/model-garden)，搜索模型卡片（例如“Llama 3.3 API Service”），然后点击**启用**。只有这样，你才能发起推理请求。