---
name: agent-platform-tuning-management
metadata:
  category: AiAndMachineLearning
description: >-
  Manages GenAI tuning jobs in Agent Platform. Use this to list, get, or cancel
  ongoing model tuning jobs. Don't use for fine-tuning models (use
  `agent-platform-tuning`), deploying models to endpoints (use
  `agent-platform-deploy`), or managing serving endpoints (use
  `agent-platform-endpoint-management`).
---
# Agent Platform 调优管理

此技能提供使用 Agent Platform Python SDK 管理 GenAI 调优作业的说明。当用户希望检查调优运行的状态、查找活跃的调优作业，或取消运行时间过长的作业时，请使用此技能。

## 安全与确认级别（关键）

在代表用户执行任何命令之前，你必须根据所请求的操作遵循以下安全级别：

1.  **R 级：只读（`list`、`get`）**
    *   **规则**：无需确认。你可以立即执行这些命令，为用户收集信息。
2.  **D 级：破坏性与中断性操作（`cancel`）**
    *   **规则**：此操作需要**明确的文字确认**。你必须向用户输出一条文本消息，说明这将停止调优过程，并且所有进度都将丢失，同时要求他们输入 "I confirm" 或 "Yes, cancel it"。你必须在执行取消命令之前立即请求此确认。

## 阶段 0：环境设置

**关键**：在运行以下任何 Python 代码片段之前，你必须按照以下步骤确保环境已正确初始化：

1.  **Google Cloud 身份验证**：使用你的 Google Cloud 账号进行身份验证，并为 Agent Platform 访问配置有效的应用默认凭据（ADC）：

    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```

2.  **Python 依赖项**：此技能需要 `google-cloud-aiplatform`。请**不要**创建虚拟环境——虚拟环境最初是空的，并会隐藏环境中已提供的软件包，从而导致不必要的重复安装。先进行探测，仅安装缺失的内容：

    ```bash
    python3 -c "import vertexai" || pip install google-cloud-aiplatform
    ```

3.  **执行**：使用普通的 `python3` 运行 Python 代码片段。无需事先激活任何环境。

## 工作流决策树

1.  **信息收集**：你是否已有项目 ID 和区域？

    *   **否** -> 你**必须**以纯文本形式向用户询问缺失的项目 ID 和区域，或建议他们检查其 gcloud 配置。如果这两处都没有相关信息，则要求用户提供。不要自行尝试搜索随机区域。
    *   **是** -> 继续执行步骤 2。

2.  **任务类型**：用户想要执行什么操作？

    *   **查找或列出作业** -> 使用 Python SDK 列出调优作业。（R 级）
    *   **检查状态/查看特定作业** -> 使用 Python SDK 获取调优作业详细信息。（R 级）
    *   **取消作业** -> 请求确认，然后使用 Python SDK 取消调优作业。（D 级）

## 使用 Python SDK

> [!NOTE]
>
> **资源验证与缺失的项目/作业：**如果执行 Python 代码片段时出现错误（例如 `403 Permission Denied`、`404 Not Found`、`INVALID_ARGUMENT`，或提示项目或作业 ID 为虚假值/缺失），你**必须**告知用户该项目或调优作业不存在或无法访问。你**必须**提示用户提供有效的项目 ID 或作业 ID，并立即停止工具执行，等待用户回复。在收到用户提供的有效详细信息之前，**不要**重试或循环，**不要**假定资源有效，也**不要**执行更多脚本。

### 1. 列出调优作业（Tier R）

如果用户询问“我有哪些正在运行的调优作业？”或希望查找特定的作业 ID：

```python
from google.cloud import aiplatform_v1

project_id = "YOUR_PROJECT_ID"
region = "YOUR_REGION"
parent = f"projects/{project_id}/locations/{region}"

client = aiplatform_v1.GenAiTuningServiceClient(
    client_options={"api_endpoint": f"{region}-aiplatform.googleapis.com"}
)

jobs = client.list_tuning_jobs(parent=parent)
for job in jobs:
    print(f"Name: {job.name}")
    print(f"Base Model: {job.base_model}")
    print(f"State: {job.state}")
```

### 2. 获取特定作业的详细信息（Tier R）

如果用户提供了调优作业 ID 并询问其状态：

```python
from google.cloud import aiplatform_v1

project_id = "YOUR_PROJECT_ID"
region = "YOUR_REGION"
job_id = "YOUR_JOB_ID"  # 19-digit ID
name = f"projects/{project_id}/locations/{region}/tuningJobs/{job_id}"

client = aiplatform_v1.GenAiTuningServiceClient(
    client_options={"api_endpoint": f"{region}-aiplatform.googleapis.com"}
)

job = client.get_tuning_job(name=name)
print(f"Name: {job.name}")
print(f"Base Model: {job.base_model}")
print(f"State: {job.state}")
print(f"Tuning Model: {job.tuned_model_display_name}")
```

### 3. 取消作业（Tier D）

如果用户明确要求停止、中止或取消正在运行的调优作业：

**安全检查**：**此操作需要用户明确输入确认后才能继续。** 你必须先请求用户确认，然后才能生成或提供此脚本，即使用户已经提供了作业 ID；但如果用户明确使用了确认性语言，例如“是的，我确认，取消调优作业 123456”，则无需再次确认。

> [!IMPORTANT]
>
> **在新一轮对话中收到用户的回复之前，绝对不要提前提供或执行任何取消代码。** 你绝不能推测或假定用户会确认。在同一轮回复中一边请求确认、一边提供代码，属于严重的安全违规行为。

```python
from google.cloud import aiplatform_v1

project_id = "YOUR_PROJECT_ID"
region = "YOUR_REGION"
job_id = "YOUR_JOB_ID"  # 19-digit ID
name = f"projects/{project_id}/locations/{region}/tuningJobs/{job_id}"

client = aiplatform_v1.GenAiTuningServiceClient(
    client_options={"api_endpoint": f"{region}-aiplatform.googleapis.com"}
)

client.cancel_tuning_job(name=name)
print(f"Successfully requested cancellation for {name}")
```