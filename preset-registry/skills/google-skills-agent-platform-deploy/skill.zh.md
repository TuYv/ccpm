---
name: agent-platform-deploy
metadata:
  category: AiAndMachineLearning
description: >-
  Deploy open models or custom weights from Model Garden to Agent Platform
  endpoints, check the status of an in-progress deployment operation, or clean
  up resources by undeploying models and deleting endpoints. Use when asked to
  actively deploy a model, list the Model Garden CATALOG of available models,
  check if a specific model is deployable
  (`gcloud ai model-garden models list-deployment-config`), query deployment
  cost, troubleshoot deployment errors (like quota limits), or undeploy/clean
  up endpoints. Also use when copying and deploying a 1P Tuned Model. Don't
  use for pure listing/discovery questions of the form "is X deployed?",
  "list my endpoints", or "which regions have models running?" — for those
  use `agent-platform-endpoint-management`. Don't use for public Vertex AI
  deployments (use the `vertex-deploy`
  skill) or for running model evaluations (use the `agent-platform-eval-flywheel`
  skill).
---
# Agent Platform Model Garden 部署技能

此技能提供有关将 Agent Platform Model Garden 中的开放模型部署到端点，以及随后取消部署模型以清理资源的说明。

## 1P 调优模型复制与部署

如果需要将 **1P（第一方）调优模型** 从源项目复制到目标区域或项目，并将其部署到新创建的端点，请参阅
[1P 调优模型复制与部署指南](references/copy_deploy_guide.md)。

## 安全与确认级别（重要）

在代表用户执行任何命令之前，必须根据所请求的操作遵循以下安全级别：

1.  **级别 R：只读（`list`、`describe`、`list-deployment-config`）**
    *   **规则**：无需确认。可以立即执行这些命令以收集用户所需的信息。
2.  **级别 M：可变更且可逆（`deploy`、`undeploy-model`）**
    *   **规则**：需要用户明确确认。必须向用户展示清晰的确认提示，说明拟执行的命令。必须等待用户明确确认后才能执行。对于 `undeploy-model`，必须先验证端点和已部署模型是否存在；如果 `describe` 或 `list` 返回 404 或空结果，必须停止并告知用户，而不是尝试取消部署。
    *   **同轮限制**：不得在展示确认提示的同一轮中运行命令。提出确认请求后必须结束当前轮次并等待用户回复；只有在获得明确批准后才能执行。先打印预览，然后在用户有机会回答之前调用工具，不算获得确认。
3.  **级别 D：破坏性且不可逆（`delete`）**
    *   **规则**：需要**明确的输入确认**。必须输出一条消息，说明端点或模型删除的不可逆性质，并要求用户输入 "I confirm" 或 "Yes, delete it"，然后才能执行删除命令。

## 1. 前提条件

部署之前，请确保已设置正确的项目和区域。以下命令使用占位变量 `PROJECT_ID` 和 `LOCATION_ID`。

确保已完成身份验证：

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project $PROJECT_ID
```

## 2. 发现可部署模型

可以列出 Model Garden 中可用的模型，并检查这些模型是否可以自行部署。

```bash
gcloud ai model-garden models list
```

若要查看特定模型支持的机器类型和加速器，请传入从上述 `models list` 输出中获取的 `MODEL_ID`。将下面的 `<PUBLISHER>/<FAMILY>@<VERSION-ID>` 替换为目录输出中的准确字符串，此占位符特意不是真实的模型 ID：

```bash
gcloud ai model-garden models list-deployment-config \
    --model="<PUBLISHER>/<FAMILY>@<VERSION-ID>"
```

> [!NOTE] 某些模型，尤其是 Hugging Face 模型，可能需要 Hugging
> Face Access Token 才能部署。

> [!TIP] **模型推荐说明：** 每当你即将在响应中提及某个具体的模型版本时，**不要凭记忆进行推荐**。以下所有情况均适用，不仅限于直接部署请求：
>
> *   **用户要求部署模型，但未指定模型。**
> *   **在执行 `list`、`describe` 或 `undeploy` 操作后主动提出下一步建议**（例如“是否要将 `<model>` 部署到此端点？”）。
> *   **用户提出一般性的“我应该使用什么？”或“针对 X，有什么合适的模型？”问题。**
> *   **在展示给用户的示例命令中填写 `MODEL_ID` 值**（而不是使用 `<PUBLISHER>/<FAMILY>@<VERSION-ID>` 这类占位符）。
>
> 新的模型版本会频繁发布，旧版本也可能被弃用，因此训练语料中关于现有模型的信息并不可靠。请遵循以下流程：
>
> 1.  **如果使用场景尚不明确，请先澄清使用场景**（任务类型、质量与延迟及成本之间的优先级、硬件/配额限制、许可证限制）。如果用户已经提供了足够的信息，则跳过此步骤。
> 2.  **使用 `gcloud ai model-garden models list` 查询实时目录**。适当时使用 `--filter` 进行缩小范围（例如 `--filter="name~gemma"`、`--filter="name~llama"`、`--filter="name~qwen"`、`--filter="name~deepseek"`）。在看到该项目的目录输出之前，绝不要向用户提及任何具体的模型版本。
> 3.  **选择符合使用场景的模型系列中最新的正式可用版本**。如果存在多个大小变体，则选择符合用户硬件/成本承受范围的版本。除非该版本被标记为预览版/实验版且用户明确要求稳定选项，否则优先选择较新的主要版本。
> 4.  **使用 `gcloud ai model-garden models list-deployment-config --model="<publisher>/<family>@<version>"` 验证确切的模型 ID 是否可部署**，然后再在响应中提及该模型。
> 5.  **在推荐中逐字引用模型 ID**，使其与目录中的显示完全一致。不要将其概括为模型系列名称（例如“Gemma”、“Llama”）。
>
> 下方 §3 示例中的 `MODEL_ID` 值是有意设置的非实质性占位符（`<PUBLISHER>/<FAMILY>@<VERSION-ID>`）。不要将其替换为凭记忆得出的模型名称来进行面向用户的推荐：始终先重新执行步骤 2-4，然后引用目录中的确切字符串。

## 2.1 Publisher 端点的区域可用性检查（Gemini + LoRA 基础模型）

> [!NOTE] **如果用户要求从 Model Garden 部署开放权重模型（Gemma、Llama、DeepSeek、Qwen 或任何用户提供的权重），请跳过此部分**，也就是任何通过 `gcloud ai model-garden models deploy` 部署到专用端点的模型。这些模型没有按区域划分的可用性限制；Model Garden 目录是全局的。对于不常见区域，真正可能导致失败的因素是：(a) 请求的加速器/机器类型在该区域不可用，或 (b) 项目没有配额。这两种情况都会在部署时、资源配置之前以明确的错误形式出现（§3 的成本确认门会捕获这些错误）。请直接进入 §3。
>
> **仅当用户要求提供一方托管的 Gemini 模型（`google/gemini-*`）或经过微调的 Gemini LoRA 适配器时，才应用此部分**；这两者都会通过区域可用性确实存在差异的 publisher 端点进行路由。

在响应任何指定了特定区域的部署请求之前，只要请求涉及第一方托管模型（`google/gemini-*`）或经过微调的 Gemini LoRA 适配器，你**必须**通过进行实时 API 调用来验证该模型确实在该区域可用。不要依赖 Google Search、训练语料库知识或发布者文档来声称模型可用性，因为区域可用性经常变化，基于这些来源的文字可能已经过时或不准确。

只探测用户请求的确切模型和区域。不要将其他模型作为“对照”进行探测，因为无法根据模型 B 的状态推断模型 A 的可用性；参考区域中的另一个模型可能由于无关原因本身也不可用。

对于第一方发布者模型（`google/*`），使用最小有效负载进行真实的 `:generateContent` 调用：

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    "https://${LOCATION_ID}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/${MODEL_ID}:generateContent" \
    -d "{\"contents\":{\"role\":\"user\",\"parts\":{\"text\":\"${PROBE_TEXT:-hi}\"}}}"
```

对于经过微调的 Gemini LoRA 模型（在基础 Gemini 模型之上部署用户调优的适配器），在目标区域探测**基础模型**，使用上述相同的 `:generateContent` 调用，并将 `${MODEL_ID}` 设置为基础模型（例如，如果适配器基于 `gemini-2.5-flash` 进行微调，则设置为 `gemini-2.5-flash`）。如果基础模型在某个区域不可用，LoRA 适配器也无法在该区域提供服务。

解读探测结果并采取相应行动：

-   **200** — 模型在该区域可用。继续部署。
-   **404** — 模型在该区域不可用。停止操作。明确告知用户该模型不在该区域提供，并列出模型可用的区域（通过不带 `--region` 的 `gcloud ai model-garden models list
    --filter="name~$MODEL_NAME"` 获取）。不要悄悄切换区域。不要继续为不受支持的区域编写部署代码或初始化 SDK。不要运行额外的“对照”探测来复核 404 — 目标区域的探测结果具有权威性。
-   **任何其他结果**（权限被拒绝、配额不足、暂时性故障等）— 不要据此得出模型可用或不可用的结论。用通俗语言解释根本原因（例如：“你的账号无权访问此项目的 Vertex AI API — 请在控制台中启用它，或切换项目”），并说明具体的下一步操作。

## 3. 部署模型

> [!WARNING] 部署模型，尤其是大型模型，会消耗大量计算资源并产生费用。
>
> 1.  在提出部署方案之前，你**必须**先计算用户请求的 `--machine-type` 对应的每小时费用。按以下顺序尝试，并在失败时继续下一项（工具不可用、工具返回的 `status !=
>     "success"`、脚本以非零状态退出、脚本拒绝该机器类型）：
>
>     a. 如果 `estimate_cost` 工具可用且返回 `status ==
>     "success"`，使用其结果 — 它通过 `CostEstimationService` 返回实时解析 SKU 后的价格（机器 + 加速器 + 总计），而不是硬编码的快照价格。任何其他状态（包括 `error`）都应继续执行 (b)。
>
>     b. 否则，运行 `scripts/calculate_cost.py`。加速器类型和数量由 Model Garden 为每种机器类型固定，并会自动推导。例如：
>
>     ```bash
>     python3 scripts/calculate_cost.py \
>         --machine-type=g2-standard-48
>     ```
>
>     如果脚本以非零状态退出（未知的 `--machine-type` — 对于 Model Garden 目录中已有但尚未收录在价格快照中的机器，这是正常情况，例如目前的 A4/B200），继续执行 (c)。不要编造数字。
>
>     c. 如果工具不可用且脚本不知道请求的机器类型，则回退到
>     [Agent Platform prediction pricing](https://cloud.google.com/products/gemini-enterprise-agent-platform/pricing?hl=en#prediction-and-explanation)。直接从该页面读取加速器及每小时费率，并在向用户提供的估算中引用该 URL。
>
> 2.  你**必须**向用户提供此费用估算，并警告用户这只是**标价**，由于潜在的折扣、预留以及非 `us-central1` 区域等因素，实际账单可能有所不同。
> 3.  在执行任何 `deploy` 命令之前，你**始终必须**请求用户明确确认并同意估算费用。

要部署模型，请使用 `deploy` 命令。对于长时间运行的部署，强烈建议使用
`--asynchronous` 标志，然后在必要时轮询状态。

### 示例：从 Model Garden 部署开放权重模型

下面是一个典型的 bash 脚本，用于部署模型。你可以直接运行此代码块。

```bash
#!/bin/bash
# Example script to deploy an open-weights model from Model Garden.
#
# NOTE: MODEL_ID below is a PLACEHOLDER, not a real model ID. Substitute it
# with a value from a live `gcloud ai model-garden models list` (see §2)
# before running this script, and do NOT quote the placeholder back to the
# user as a recommended model.

PROJECT_ID=$(gcloud config get-value project)
LOCATION_ID="us-central1" # Recommended default region
MODEL_ID="<PUBLISHER>/<FAMILY>@<VERSION-ID>" # PLACEHOLDER — replace with the exact ID from `gcloud ai model-garden models list`

echo "Deploying model $MODEL_ID to project $PROJECT_ID in $LOCATION_ID..."

# Model Garden can automatically select the required hardware based on the list-deployment-config if hardware params are omitted.
# Below is a comprehensive command with all supported parameters:
gcloud ai model-garden models deploy \
    --project=$PROJECT_ID \
    --region=$LOCATION_ID \
    --model=$MODEL_ID \
    --machine-type="g2-standard-48" \
    --accelerator-type="NVIDIA_L4" \
    --accelerator-count=4 \
    --endpoint-display-name="my-open-model-deployment" \
    --hugging-face-access-token="YOUR_HF_TOKEN" \
    --reservation-affinity="reservation-affinity-type=specific-reservation,key=compute.googleapis.com/reservation-name,values=my-reservation" \
    --asynchronous

echo "Deployment initiated asynchronously."
```

### 示例：部署自定义权重

要使用自定义权重部署模型，可以使用完全相同的 `deploy`
命令。无需提供 Model Garden 模型 ID，而是在 `--model` 标志中提供自定义权重文件夹的 Google
Cloud Storage (GCS) URI。

```bash
#!/bin/bash
# Example script to deploy a model with custom weights from a GCS bucket

PROJECT_ID=$(gcloud config get-value project)
LOCATION_ID="us-central1"
# Replace with the gs:// URI pointing to your custom weights
MODEL_GCS_URI="gs://your-bucket-name/path/to/custom-weights"

echo "Deploying custom model from $MODEL_GCS_URI to project $PROJECT_ID in $LOCATION_ID..."

gcloud ai model-garden models deploy \
    --project=$PROJECT_ID \
    --region=$LOCATION_ID \
    --model=$MODEL_GCS_URI \
    --machine-type="g2-standard-12" \
    --accelerator-type="NVIDIA_L4" \
    --endpoint-display-name="my-custom-model" \
    --asynchronous

echo "Deployment initiated asynchronously."
```

## 4. 检查部署状态

当你使用 `--asynchronous` 标志异步部署模型时，
`deploy` 命令会返回操作 ID。你可以使用此 ID 检查部署的当前状态。

```bash
gcloud ai operations describe YOUR_OPERATION_ID \
    --region=$LOCATION_ID
```

> [!NOTE] 作为代理，如果用户提供操作 ID，或者刚刚与你一起发起了部署，
> 你也可以主动提出为用户检查部署状态。

或者，您可以列出端点，查看它是否显示在列表中，并在 Cloud Console 的 "Online prediction" 标签页下进行检查。

```bash
gcloud ai endpoints list \
    --region=$LOCATION_ID
```

注意：大型模型（大约 20B 或更多参数）可能需要 15-20 分钟才能完成部署并开始提供服务。

### 验证部署

如果模型已成功部署，请通过发起预测调用进行测试验证。由于 Model Garden 模型通常部署到 Dedicated Endpoints，因此不应使用 `gcloud ai endpoints predict`。相反，您必须获取端点的专用 DNS 名称，并发送 `curl` 请求。

> [!TIP] 请用户尝试使用自己的提示词查看结果。
> 否则使用默认提示词。

使用以下脚本：

```bash
#!/bin/bash
PROJECT_ID=$(gcloud config get-value project)
LOCATION_ID="us-central1"
ENDPOINT_ID="YOUR_ENDPOINT_ID"
PROMPT=${1:-"Explain quantum computing in simple terms."}

echo "Fetching dedicated Endpoint DNS..."
ENDPOINT_URL=$(gcloud ai endpoints describe $ENDPOINT_ID --project=$PROJECT_ID --region=$LOCATION_ID --format="value(dedicatedEndpointDns)")

if [ -z "$ENDPOINT_URL" ]; then
    echo "Error: Could not retrieve a dedicated endpoint URL. Verify your ENDPOINT_ID."
    exit 1
fi

echo "Sending prediction request to $ENDPOINT_URL..."
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  "https://${ENDPOINT_URL}/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/endpoints/${ENDPOINT_ID}/chat/completions" \
  -d '{
    "model": "'"$ENDPOINT_ID"'",
    "messages": [
      {
        "role": "user",
        "content": "'"$PROMPT"'"
      }
    ]
  }'
```

## 5. 取消部署和清理

要停止产生费用，您必须从端点取消部署模型。如果您还不知道确切的端点 ID 和已部署模型 ID，这将是一个多步骤过程。

### 示例：查找模型并取消部署

下面是一个演示如何查找这些 ID 并取消部署模型的 bash 脚本。

```bash
#!/bin/bash
# Example script to undeploy a model

PROJECT_ID=$(gcloud config get-value project)
LOCATION_ID="us-central1"
# The model ID used during deployment (without the provider prefix sometimes, or exactly as listed in describe)
# It's usually easier to find the specific ID via `gcloud ai models list`
# For this example, let's assume we know the exact Endpoint ID and Deployed Model ID.

# 1. Find the Endpoint ID
echo "Listing endpoints in $LOCATION_ID:"
gcloud ai endpoints list --project=$PROJECT_ID --region=$LOCATION_ID

# (Assuming you extracted ENDPOINT_ID from the above output)
# ENDPOINT_ID="your_endpoint_id"

# 2. Find the Deployed Model ID
echo "Listing models in $LOCATION_ID to find model description:"
gcloud ai models list --project=$PROJECT_ID --region=$LOCATION_ID

# (Assuming you found the specific MODEL_ID)
# MODEL_ID="your_model_id"
# gcloud ai models describe $MODEL_ID --project=$PROJECT_ID --region=$LOCATION_ID
# (Extract the deployedModelId from the output)
# DEPLOYED_MODEL_ID="your_deployed_model_id"

# 3. Undeploy
echo "Undeploying model $DEPLOYED_MODEL_ID from endpoint $ENDPOINT_ID..."
gcloud ai endpoints undeploy-model $ENDPOINT_ID \
    --project=$PROJECT_ID \
    --region=$LOCATION_ID \
    --deployed-model-id=$DEPLOYED_MODEL_ID

echo "Model undeployed."

# 4. Delete Endpoint
echo "Deleting endpoint $ENDPOINT_ID..."
gcloud ai endpoints delete $ENDPOINT_ID \
    --project=$PROJECT_ID \
    --region=$LOCATION_ID \
    --quiet
echo "Endpoint deleted."

# 5. Delete Model
echo "Deleting model $MODEL_ID..."
gcloud ai models delete $MODEL_ID \
    --project=$PROJECT_ID \
    --region=$LOCATION_ID \
    --quiet
echo "Model deleted."
```

> [!WARNING] 未能取消部署模型将导致为已分配的计算资源持续计费，
> 即使您没有发送预测请求也是如此。测试后务必清理资源。

## 6. 故障排除

### 部署失败：配额或资源耗尽

如果您的部署因 `QUOTA_EXCEEDED` 或
`RESOURCE_EXHAUSTED` 错误而失败（或一直处于错误状态），则表明所请求的特定硬件（例如 `NVIDIA_L4`
或 `g2-standard-24`）在您选择的区域中不可用，或者超出了
您项目的配额限制。

**解决方案：** 仔细查看返回的错误消息。它通常会
推荐当前有可用容量的替代区域或机器类型。
**请求用户确认**，以便使用建议的
`--region` 或 `--machine-type` 参数重试部署。

> [!WARNING] 如果替代建议涉及更改机器类型或
> 加速器，您**必须**使用新参数重新运行
> `scripts/calculate_cost.py` 以重新计算预估成本（参见 §3），向用户警告
> 标价与实际计费之间的差异，并在重试部署前获得用户对
> 新成本的明确确认。