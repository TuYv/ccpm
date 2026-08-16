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
# Agent Platform Model Garden 部署 Skill

此 Skill 提供相关说明，用于将 Agent Platform Model Garden 中的开放模型部署到端点，以及随后取消部署这些模型以清理资源。

## 1P 微调模型复制与部署

如果需要将 **1P（第一方）微调模型**从源项目复制到目标区域或项目，并将其部署到新创建的端点，请参阅 [1P 微调模型复制与部署指南](references/copy_deploy_guide.md)。

## 安全与确认分级（关键）

在代表用户执行任何命令之前，你必须根据所请求的操作遵守以下安全分级：

1.  **R 级：只读（`list`、`describe`、`list-deployment-config`）**
    *   **规则**：无需确认。你可以立即执行这些命令，为用户收集信息。
2.  **M 级：会产生变更且可逆（`deploy`、`undeploy-model`）**
    *   **规则**：这需要用户明确确认。你必须向用户显示清晰的确认提示，说明拟执行的命令。你必须等待用户明确确认后再执行。对于 `undeploy-model`，你必须首先验证端点和已部署模型是否存在；如果 `describe` 或 `list` 返回 404 或空结果，你必须停止操作并告知用户，而不是尝试取消部署。
3.  **D 级：破坏性且不可逆（`delete`）**
    *   **规则**：这需要**明确输入确认文本**。你必须输出一条文本消息，说明删除端点或模型的操作不可逆，并要求用户输入 "I confirm" 或 "Yes, delete it"，然后才能执行删除命令。

## 1. 前提条件

部署前，请确保已设置正确的项目和区域。以下命令使用占位变量 `PROJECT_ID` 和 `LOCATION_ID`。

确保你已完成身份验证：

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project $PROJECT_ID
```

## 2. 查找可部署的模型

你可以列出 Model Garden 中可用的模型，并检查它们是否支持自行部署。

```bash
gcloud ai model-garden models list
```

要查看特定模型支持哪些机器类型和加速器，请传入从上述 `models list` 输出中获取的 `MODEL_ID`。将下面的 `<PUBLISHER>/<FAMILY>@<VERSION-ID>` 替换为目录输出中的确切字符串——该占位符有意不使用真实的模型 ID：

```bash
gcloud ai model-garden models list-deployment-config \
    --model="<PUBLISHER>/<FAMILY>@<VERSION-ID>"
```

> [!NOTE] 某些模型，尤其是 Hugging Face 模型，部署时可能需要 Hugging Face 访问令牌。

> [!TIP] **模型推荐说明：**每当你准备在回复中指出具体的模型版本时，不要凭记忆进行推荐。这适用于以下所有情况，而不仅限于直接部署请求：
>
> *   用户要求部署模型，但未指定具体模型。
> *   你在执行 `list`、`describe` 或 `undeploy` 操作后主动提出下一步建议（例如，“你希望我将 `<model>` 部署到此端点吗？”）。
> *   用户提出一般性的“我应该使用什么？”/“适合 X 的优质模型是什么？”问题。
> *   你正在用户可见的示例命令中填写 `MODEL_ID` 值，而不是使用类似 `<PUBLISHER>/<FAMILY>@<VERSION-ID>` 的占位符。
>
> 新模型版本发布频繁，旧版本可能会被弃用，因此依赖训练语料库中有关现有模型的知识并不可靠。请遵循以下流程：
>
> 1.  如果上下文中尚未明确，请**澄清使用场景**（任务类型、质量与延迟及成本之间的优先级、硬件/配额限制、许可证限制）。如果用户已提供足够的信息，则跳过此步骤。
> 2.  使用 `gcloud ai model-garden models list` **查询实时目录**。适当时使用 `--filter` 缩小范围（例如 `--filter="name~gemma"`、`--filter="name~llama"`、`--filter="name~qwen"`、`--filter="name~deepseek"`）。在你从此项目的目录输出中看到具体模型版本之前，绝不要向用户指出该版本。
> 3.  在模型系列中**选择符合使用场景的最新正式可用版本**。如果存在多种大小变体，请选择符合用户硬件条件和成本承受能力的变体。除非较新的主要版本被标记为预览版/实验版，且用户明确要求稳定选项，否则应优先选择较新的主要版本，而不是较旧版本。
> 4.  在回复中指出模型之前，使用 `gcloud ai model-garden models list-deployment-config --model="<publisher>/<family>@<version>"` **验证确切的模型 ID 是否可部署**。
> 5.  在推荐中**逐字引用模型 ID**，与其在目录中显示的内容完全一致。不要改述为模型系列标签（“Gemma”、“Llama”）。
>
> 以下第 3 节示例中的 `MODEL_ID` 值有意使用不代表实际内容的占位符（`<PUBLISHER>/<FAMILY>@<VERSION-ID>`）。不要将它们替换为凭记忆得出的模型名称并作为面向用户的推荐——始终先重新执行第 2 至第 4 步，然后引用目录中的确切字符串。

## 2.1 发布方端点的区域可用性检查（Gemini + LoRA 基础模型）

> [!NOTE] 如果用户请求部署来自 Model Garden 的开放权重模型（Gemma、Llama、DeepSeek、Qwen 或任何用户提供的权重），**请跳过本节**——即通过 `gcloud ai model-garden models deploy` 部署到专用端点的任何模型。这些模型没有按区域划分的可用性限制；Model Garden 目录是全球性的。对于非常用区域，实际的失败原因是：(a) 该区域不提供所请求的加速器/机器类型，或 (b) 项目没有配额——这两种情况都会在部署时、任何资源预配之前以明确的错误形式呈现（§3 的成本确认关卡会捕获这些错误）。请直接转到 §3。
>
> **仅当用户请求提供第一方托管 Gemini 模型**（`google/gemini-*`）或微调后的 Gemini LoRA 适配器时，**才应用本节**——这两者都通过发布方端点进行路由，而此类端点的区域可用性确实会有所不同。

在响应任何为第一方托管模型（`google/gemini-*`）或微调后的 Gemini LoRA 适配器指定了特定区域的部署请求之前，你**必须**通过实时 API 调用验证该模型在该区域是否实际可用。不要依赖 Google 搜索、训练语料知识或发布方文档来判断可用性——区域可用性经常变化，有出处依据的文本也可能已经过时或有误。

仅探测用户询问的确切模型和区域。不要探测其他模型作为“对照”——你无法根据模型 B 的状态推断模型 A 的可用性，因为另一个模型本身可能由于无关原因在参考区域中不可用。

对于第一方发布方模型（`google/*`），请使用最小有效负载执行真实的 `:generateContent` 调用进行探测：

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    "https://${LOCATION_ID}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/${MODEL_ID}:generateContent" \
    -d "{\"contents\":{\"role\":\"user\",\"parts\":{\"text\":\"${PROBE_TEXT:-hi}\"}}}"
```

对于微调后的 Gemini LoRA 模型（在基础 Gemini 模型之上部署用户微调的适配器），请在目标区域使用上面相同的 `:generateContent` 调用探测**基础模型**，并将 `${MODEL_ID}` 设置为该基础模型（例如，如果适配器基于 `gemini-2.5-flash` 进行微调，则设置为 `gemini-2.5-flash`）。如果基础模型在某个区域不可用，LoRA 适配器也无法在该区域提供服务。

解释探测结果并采取相应操作：

-   **200** —— 模型在该区域可用。继续部署。
-   **404** —— 模型在该区域不可用。停止。明确告知用户该区域不提供此模型，并列出该模型可用的区域（通过不带 `--region` 的 `gcloud ai model-garden models list
    --filter="name~$MODEL_NAME"` 获取）。不要静默切换区域。不要继续为不受支持的区域编写部署代码或 SDK 初始化代码。不要运行额外的“对照”探测来复核 404——目标区域的探测结果具有权威性。
-   **任何其他结果**（权限被拒绝、配额问题、暂时性故障等）——不要断定模型可用或不可用。用通俗语言解释根本原因（例如，“你的账号无权访问此项目的 Vertex AI API——请在控制台中启用该 API 或切换项目”）以及下一步应采取的具体操作。

## 3. 部署模型

> [!WARNING] 部署模型（尤其是大型模型）会消耗大量
> 计算资源并产生费用。
>
> 1.  你**必须**参考
>     [Agent Platform 预测定价](https://cloud.google.com/products/gemini-enterprise-agent-platform/pricing?hl=en#prediction-and-explanation)，
>     根据请求的 `--machine-type` 和 `--accelerator-type`（以及数量）
>     计算粗略的费用估算。
> 2.  你**必须**向用户提供此费用估算，并警告用户
>     这是**标价**，由于可能存在折扣或预留，其实际账单可能与此不同。
> 3.  在执行任何 `deploy` 命令之前，你**始终必须**请求用户明确确认
>     同意估算的费用。

要部署模型，请使用 `deploy` 命令。对于长时间运行的部署，强烈建议使用
`--asynchronous` 标志，然后在必要时轮询状态。

### 示例：从 Model Garden 部署开放权重模型

以下是一个用于部署模型的典型 bash 脚本。你可以直接运行此代码块。

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
命令。请在 `--model` 标志中提供自定义权重文件夹的 Google
Cloud Storage (GCS) URI，而不是 Model Garden 模型 ID。

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

当你使用 `--asynchronous` 标志异步部署模型时，`deploy` 命令将返回一个操作 ID。你可以使用此 ID 检查部署的当前状态。

```bash
gcloud ai operations describe YOUR_OPERATION_ID \
    --region=$LOCATION_ID
```

> [!NOTE] 作为代理，如果用户提供了操作 ID，或者刚刚与你一起启动了部署，你也可以主动提出为用户检查部署状态。

或者，你可以列出端点以查看它是否已经出现，并在 Cloud Console 的“在线预测”标签页下进行检查。

```bash
gcloud ai endpoints list \
    --region=$LOCATION_ID
```

注意：大型模型（大约 20B+ 参数）可能需要 15-20 分钟才能完全部署并开始提供服务。

### 验证部署

如果模型已成功部署，请通过发起预测调用进行测试验证。由于 Model Garden 模型通常部署到专用端点，因此不应使用 `gcloud ai endpoints predict`。你必须获取端点的专用 DNS 名称，并发送 `curl` 请求。

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

要停止产生费用，你必须从端点取消部署模型。如果你还没有确切的端点 ID 和已部署模型 ID，则需要执行多个步骤。

### 示例：查找并取消部署模型

以下 bash 脚本演示了如何查找 ID 并取消部署模型。

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

> [!WARNING] 未取消部署模型将导致系统持续对已分配的计算资源收费，
> 即使你没有发送预测请求也是如此。测试后务必清理资源。

## 6. 故障排除

### 部署失败：配额或资源已耗尽

如果部署由于 `QUOTA_EXCEEDED` 或 `RESOURCE_EXHAUSTED` 错误而失败（或一直处于错误状态），则请求的特定硬件（例如 `NVIDIA_L4`
或 `g2-standard-24`）在你选择的区域中不可用，或超出了
项目的配额限制。

**解决方案：** 仔细查看返回的错误消息。它通常会
建议当前有可用资源的其他区域或机器类型。
**询问用户并获得确认**，然后使用建议的
`--region` 或 `--machine-type` 参数重试部署。

> [!WARNING] 如果替代建议涉及更改机器类型或
> 加速器，你**必须**使用
> [Agent Platform 预测定价](https://cloud.google.com/products/gemini-enterprise-agent-platform/pricing?hl=en#prediction-and-explanation)
> 重新计算预估费用，提醒用户标价与实际账单金额可能存在差异，并在重试部署前
> 获得用户对新费用的明确确认。