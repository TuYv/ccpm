---
name: agent-platform-endpoint-management
metadata:
  category: AiAndMachineLearning
description: >-
  Manages Agent Platform serving endpoints. Use when you need to create, list,
  describe, update, or delete serving endpoints for model deployment on Agent
  Platform. Also use when troubleshooting endpoint permission, quota, or resource
  busy errors. Don't use for deploying models to endpoints or for running
  model evaluations.
---
# Agent Platform 端点管理

## 概述

此技能提供有关管理 Agent Platform 端点的流程性知识。
端点是提供稳定 URL 以进行在线预测的逻辑服务主机。
必须先创建端点，然后才能将模型部署到该端点。

## 安全与确认层级（关键）

在代表用户执行任何命令之前，你必须根据所请求的操作遵循以下安全层级：

1.  **层级 R：只读（`list`、`describe`、`get`）**
    *   无需确认。立即执行以收集信息。
2.  **层级 M：可变更且可逆（`create`、`update`）**
    *   需要提供带有“Yes”/“No”选项的**交互式确认**。确认提示必须包含确切、完整的命令字符串以及所有必需的标志（例如 `--region=us-central1`、`--display-name="..."`）
        ——仅使用自然语言转述并不足够。
    *   **同一轮次限制**：绝不能在展示确认提示的同一轮次中执行命令。停止并等待用户回复；仅在用户明确回复“Yes”或表示批准后执行。
3.  **层级 D：破坏性且不可逆（`delete`）**
    *   需要用户**明确键入确认内容**（例如“I confirm”或“Yes,
        delete it”）。立即请求确认——必须在任何预检之前进行（不要先执行 `describe`，也不要先检查端点是否为空）。
    *   **同一轮次限制**：绝不能在请求用户键入确认内容的同一轮次中执行命令。等待用户在新一轮对话中回复。

## 阶段 0：环境设置

**关键**：在运行任何命令之前，你必须按照以下步骤确保环境已正确初始化：

1.  **Google Cloud 身份验证**：使用你的 Google Cloud 凭据进行身份验证，并配置有效的应用默认凭据（ADC），以访问 Agent Platform：

    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```

2.  **设置项目**：为后续命令配置当前项目：

    ```bash
    gcloud config set project $PROJECT_ID
    ```

3.  **区域**：在下面的每条命令中始终指定 `--region=$LOCATION_ID`。不要使用 `global`。如果用户未提供区域，请要求用户指定。

## 1. 列出端点（层级 R）

使用此命令发现特定区域中的现有端点并检索其 ID。无需确认。

```bash
gcloud ai endpoints list \
    --region=$LOCATION_ID
```

*（可选）* 对于分页，你必须使用 `--limit=$LIMIT` 来限制返回的端点总数。你还可以追加 `--page-size=$PAGE_SIZE` 来控制 API 分块，或追加 `--page-token=$PAGE_TOKEN` 以获取后续页面。

> [!IMPORTANT]
>
> 始终指定 `--region`。不要使用“global”。如果用户未提供区域，请要求用户指定。

## 2. 描述端点（层级 R）

检索特定端点的完整元数据。无需确认。

```bash
gcloud ai endpoints describe $ENDPOINT_ID \
    --region=$LOCATION_ID
```

## 3. 创建端点（Tier M）

创建新的端点资源。父资源为位置。**此操作需要在继续之前显示内联确认卡片。**

```bash
gcloud ai endpoints create \
    --region=$LOCATION_ID \
    --display-name="my-endpoint"
```

> [!IMPORTANT]
>
> **你必须先请求交互式确认。**确认提示中**必须**显示原样的命令字符串。例如：
>
> ```bash
> gcloud ai endpoints create --region=$LOCATION_ID --display-name="my-endpoint"
> ```
>
> 或确切的标志。不得在提出确认请求的同一轮中执行此命令。

## 4. 更新端点（Tier M）

更新端点元数据，例如显示名称或标签。**此操作需要在继续之前显示内联确认卡片。**

```bash
gcloud ai endpoints update $ENDPOINT_ID \
    --region=$LOCATION_ID \
    --display-name="new-display-name"
```

先通过列出端点或描述该端点来检查端点是否存在。

> [!IMPORTANT]
>
> **你必须先请求交互式确认。**确认提示中**必须**显示原样的命令字符串。例如：
>
> ```bash
> gcloud ai endpoints update $ENDPOINT_ID --region=$LOCATION_ID --display-name="new-display-name"
> ```
>
> 或确切的标志。**关键：**严禁在请求确认的同一轮中执行此命令。当你请求确认时，必须立即停止并等待用户回复。

## 5. 删除端点（Tier D）

永久删除端点资源。**此操作需要在继续之前获得明确的输入式确认。**

```bash
gcloud ai endpoints delete $ENDPOINT_ID \
    --region=$LOCATION_ID
```

> [!WARNING]
>
> 必须先从端点**取消部署**所有模型，然后才能删除该端点。在收到删除操作的输入式确认之前，不要运行 `describe`。

## 6. 流量拆分（Tier M）

你可以在更新期间，管理同一端点上部署的不同模型之间的流量拆分。**此操作需要在继续之前显示内联确认卡片。**

```bash
# Example: Deploying a model with a specific traffic split is usually done
# via 'gcloud ai endpoints deploy-model'.
```

有关部署和取消部署模型的说明，请参阅 `agent-platform-deploy` Skill。

## 故障排除

-   **403 权限被拒绝**：确保已分配 `aiplatform.admin` 或 `owner` 角色。
-   **超出配额**：在 Cloud Console 中检查该区域的端点配额。
-   **资源忙碌**：如果删除失败，请检查模型是否仍在取消部署。