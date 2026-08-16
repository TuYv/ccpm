---
name: agent-platform-model-registry
metadata:
  category: AiAndMachineLearning
description: >-
  Agent Platform Model Registry Management. Use when you need to upload, list,
  describe, update, or delete machine learning models (and their versions)
  in the Agent Platform Model Registry. Don't use for model training, model
  deployment to endpoints, or managing non-Agent Platform models.
---
# Agent Platform 模型注册表管理

## 概述

此技能提供了有关管理 Agent Platform 模型注册表中机器学习模型的说明。内容涵盖列出模型、查看模型详细信息、上传新模型或新版本、更新元数据以及删除模型。

## 安全与确认级别（关键）

在代表用户执行任何命令之前，你必须根据所请求的操作遵循以下安全级别：

1.  **R 级：只读（`list`、`describe`、`get`）**
    *   无需确认。立即执行以收集信息。
2.  **M 级：可变更且可逆（`upload`、`update`）**
    *   需要使用“Yes”/“No”选项进行**交互式确认**。确认提示必须包含确切的、逐字一致的命令字符串及所有必需标志（例如 `--region=us-central1`、`--display-name="..."`）——仅使用自然语言改述并不足够。
    *   **同轮限制**：绝不要在展示确认提示的同一轮中执行该命令。停止并等待用户回复；只有在用户明确回复“Yes”或表示批准后才能执行。
3.  **D 级：破坏性且不可逆（`delete`）**
    *   需要用户**明确输入确认内容**（例如“I confirm”或“Yes, delete it”）。应立即请求确认——在执行任何预检之前（不要先检查模型是否已部署到端点）。
    *   **同轮限制**：绝不要在请求用户输入确认内容的同一轮中执行。等待用户在新一轮中回复。

## 阶段 0：环境设置

**关键**：在运行任何命令之前，你必须按照以下步骤确保环境已正确初始化：

1.  **Google Cloud 身份验证**：使用你的 Google Cloud 凭据进行身份验证，并为 Agent Platform 访问配置有效的应用默认凭据（ADC）：

    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```

2.  **设置项目**：为后续命令配置当前项目：

    ```bash
    gcloud config set project $PROJECT_ID
    ```

3.  **区域**：在下方每条命令中始终指定 `--region=$LOCATION_ID`。不要使用 `global`。

## 1. 列出模型（R 级）

使用此命令查找注册表中的现有模型并获取其数字 ID。无需确认。

```bash
gcloud ai models list \
    --region=$LOCATION_ID
```

## 2. 查看模型详情（R 级）

获取特定模型或版本的完整元数据。无需确认。

```bash
gcloud ai models describe $MODEL_ID \
    --region=$LOCATION_ID
```

要指定特定版本：

```bash
gcloud ai models describe ${MODEL_ID}@${VERSION_ID} \
    --region=$LOCATION_ID
```

## 3. 上传模型（M 级）

注册新模型或现有模型的新版本。这是一项长时间运行的操作。**继续之前，此操作需要显示内联确认卡片。**

### 示例：上传自定义模型

```bash
gcloud ai models upload \
    --region=$LOCATION_ID \
    --display-name="my-custom-model" \
    --container-image-uri="gcr.io/my-project/my-model:latest" \
    --artifact-uri="gs://my-bucket/path/to/artifacts"
```

> [!IMPORTANT]
>
> 这是一个 M 级操作——请参阅上文的[安全与确认级别]。

要上传现有模型的新版本，请使用 `--parent-model` 标志或
指定父模型 ID。

## 4. 更新模型（M 级）

更新显示名称、描述或标签等元数据字段。**此操作要求在继续之前
显示内联确认卡片。**

```bash
gcloud ai models update $MODEL_ID \
    --region=$LOCATION_ID \
    --display-name="new-display-name" \
    --description="Updated description"
```

> [!IMPORTANT]
>
> 这是一个 M 级操作——请参阅上文的[安全与确认级别]。

## 5. 删除模型（D 级）

永久删除模型及其所有版本。**此操作要求在继续之前
明确键入确认。**

```bash
gcloud ai models delete $MODEL_ID \
    --region=$LOCATION_ID
```

> [!WARNING]
>
> 此操作不可逆。删除之前，必须从所有
> 端点取消部署该模型的所有版本。

## 6. 搜索发布商模型（R 级）

在生成交互式模型详情之前，你必须通过
搜索 Model Garden 发布商模型来验证 `model_id`。无需确认。

使用 `gcloud ai` CLI 搜索匹配的发布商模型。

```bash
gcloud ai model-garden models list --model-filter="<model_name_or_query>" --full-resource-name --format=json
```

这将返回匹配模型的列表。从
结果中提取准确的 `name` 字段（例如 `publishers/google/models/gemma2` 或
`publishers/qwen/models/qwen3-coder`），将其用作经过验证的 `model_id`。