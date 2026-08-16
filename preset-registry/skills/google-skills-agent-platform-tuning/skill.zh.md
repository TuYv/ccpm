---
name: agent-platform-tuning
metadata:
  category: AiAndMachineLearning
description: >-
  Agent Platform Model Tuning. Use when you need to fine-tune open models
  or Gemini models using Agent Platform infrastructure. Don't use for model
  training outside Agent Platform, model deployment to endpoints (use
  `agent-platform-deploy`), or managing serving endpoints (use
  `agent-platform-endpoint-management`).
---
# Agent Platform 模型调优

## 概述

此技能提供使用 Agent Platform 调优服务微调大型语言模型（包括开放模型和 Gemini 模型）的流程性知识。它涵盖从环境设置和数据准备，到作业配置、监控及部署的完整生命周期。

## 工作流决策树

1.  **模型类别识别**：用户是否已明确说明他们希望调优**开放模型**还是 **Gemini 模型**？

    -   **否** → **停止**。询问用户是希望调优开放模型还是 Gemini 模型。**环境设置请求的关键例外：**如果用户具体询问环境设置说明（例如，“需要进行哪些环境设置？”），你**必须**在首次回复中提供完整的[阶段 0 环境设置](#phase-0)说明，*同时*提出有关模型类别的澄清问题。
    -   如果用户提供了具体的调优用途，你应推荐三个模型：一个开放模型、一个 Gemini 模型，以及第三个通常推荐的选项。简要列出每个模型的优缺点（例如，Gemini 模型可能更昂贵等）。**关键：**你必须在此步骤中读取 `references/models.md`，并且仅推荐该目录中明确列出的模型。不要推荐 Mistral 等不受支持的模型。如果用户指定的模型不在该目录中，请遵循该目录中的回退规则。在确认类别之前，不要继续进行模型配置。
    -   **是** → 继续。

2.  **环境检查**：环境（身份验证、API、IAM、虚拟环境）是否已初始化？

    -   **否** → 转到[阶段 0：环境与 IAM 设置](#phase-0)。
    -   **是** → 继续。

3.  **数据集状态**：数据集是否已准备为 JSONL 格式、**其结构是否对调优有效**，以及是否已上传到 Google Cloud Storage？

    ```
    -   **No** → Go to [Phase 1: Dataset Preparation & Upload](#phase-1).
    -   **Yes** → Proceed.
    ```

4.  **列选择确认**：你是否已向用户展示各列并确认映射关系？

    -   **否** → **停止**。在继续之前，你必须按照阶段 1.0 中的说明展示样本并获得用户对列映射的确认。
    -   **是** → 继续。

5.  **配置**：用户是否已提供目标模型和超参数，或明确同意你的建议？

    -   **否** → 转到
        [阶段 2：模型配置与建议](#phase-2)。
    -   **是** → 继续。

6.  **作业状态**：调优作业是否已提交？

    ```
    -   **No** → Go to
        [Phase 3: Tuning Job Execution](#phase-3-tuning-job-execution).
    -   **Yes** → Proceed.
    ```

7.  **作业完成情况**：调优作业是否已完成？

    ```
    -   **No** → Go to [Phase 4: Monitoring](#phase-4-monitoring).
    -   **Yes** → Proceed.
    ```

8.  **部署**：调优后的模型是否已部署（如需要）？

    ```
    -   **No** → Go to [Phase 5: Model Deployment](#phase-5-model-deployment).
    -   **Yes** → Task Complete.
    ```

## 阶段 0：环境与 IAM 设置 {#phase-0}

在继续之前，请确保基础环境已准备就绪。

### 0.1 身份验证与项目上下文

-   检查是否已安装 `gcloud` CLI。如果尚未安装，请先征得用户许可再进行
    安装。如果已安装，请更新它：

```bash
gcloud components update --quiet > /dev/null 2>&1
```

-   验证 `gcloud auth list`。如果尚未通过身份验证，请运行 `gcloud auth login`。
-   确保 `project` 已知。使用 `gcloud config get project` 获取当前项目。
-   **关键：请求确认。** 在继续之前，你必须提示用户确认所获取的项目，
    以防他们想切换到其他项目。还必须确认位置——关于应建议哪个位置，
    请参阅第 0.2 节，这取决于模型类别。

### 0.2 位置

位置处理方式**取决于你在工作流决策树中确定的模型类别**。这两个类别
支持的位置不同——切勿将一个类别的位置用于另一个类别。

-   **开放模型**共用一组固定的位置，推荐选择 `global`。
-   **Gemini 模型**因模型而异，必须进行查询。目前它们不接受 `global`。

如果用户指定的位置对其模型和类别无效，请停止。返回错误，指出请求的
位置不受支持，列出有效位置，并且不要询问数据集，不要继续执行任何其他
设置步骤，也不要在其他位置静默重试。

#### 开放模型（推荐：`global`）

**推荐 `global` 并请用户确认。** 将其作为唯一的推荐选项提出，而不是先让
用户选择区域，也不要引导用户改用某个特定区域。

以下是开放模型调优仅有的可用位置：

-   `global`（推荐选项）
-   `us-central1`
-   `europe-west4`
-   `us-west1`
-   `us-east5`
-   `asia-southeast1`

`global` 端点会自动选择具有可用容量的受支持区域，因此最有可能成功完成
调度。预先固定区域会将作业限制在该区域的容量范围内，这就是为什么
`global` 是开放模型调优的推荐位置。


-   **用户指定了位置** → 原样使用该位置，前提是它为 `global` 或上述区域
    之一。不要劝说用户改用其他位置。
-   **用户询问支持哪些位置** → 回答该问题。提供上述列表，并说明推荐
    `global` 及其原因。绝不能隐瞒该选项。
-   **用户未指定位置** → 建议使用 `global`，并在继续之前请用户确认。
    说明 `global` 允许服务选择具有可用容量的区域。不要静默假定使用
    `global`。

提出单一选项的目的，是避免将区域选择变成用户在进行任何其他操作之前必须解决的决策——正是这种先后顺序之前阻碍了用户继续操作。这并不意味着要隐藏列表：只要用户询问，就应列出该列表；在拒绝不受支持的位置时，也应列出该列表。

**仅**在以下情况下回退到显式区域，并告知用户这样做的原因：

-   **CMEK。** `global` 会拒绝客户管理的加密密钥，并返回 `FAILED_PRECONDITION` 错误。受 CMEK 保护的作业必须指定密钥所在的区域。

-   **数据驻留。** 如果用户要求作业保留在特定司法管辖区内，请遵循其区域选择。`global` 当前会在 `us-central1` 或 `europe-west4` 中运行作业。

如果 `global` 作业已被接受，但随后失败，并出现 `FAILED_PRECONDITION` 错误，提示该模型不支持全局端点调优，则说明该模型尚未接入全局端点。模型本身仍然可以调优：从上面的列表中选择一个显式区域重新提交一次（`us-central1` 是最稳妥的选择），并告知用户切换区域的原因。

##### 使用 `global` 作业

-   API 主机仍为 `aiplatform.googleapis.com`。不存在 `global-aiplatform.googleapis.com` 主机。
-   服务会在运行时将 `global` 解析为实际区域。子资源（调优后的模型、检查点、TensorBoard）在其资源名称中返回的是该**实际**区域，而不是 `global`。在使用资源进行监控或部署之前，请从返回的资源名称中读取位置；切勿假定它仍然是 `global`。
-   配额由各区域共享，因此固定到某个区域不会获得额外配额。

#### Gemini 模型（按模型逐一查询）

目前 Gemini 调优**不接受 `global`**——服务会在创建作业时拒绝它，并返回 `FAILED_PRECONDITION` 错误，因此不要在此处推荐它。


**Gemini 不存在统一的区域允许列表。** 支持的调优区域因模型和模型版本而异：某些 Gemini 模型仅限两个区域，而其他模型则支持更多区域。请勿复用上面的开放模型列表，也不要假定某个 Gemini 模型支持的区域同样适用于另一个 Gemini 模型。

提交之前，请在监督式微调文档中查找所选模型，并查看其 **“支持的模型调优端点”** 行：
[监督式调优](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/tuning/supervised-tuning)


-   **用户询问支持哪些区域** → 查找该特定模型，并告知用户文档中的说明。不要凭记忆或根据开放模型列表作答，也不要用其他 Gemini 模型的信息回答。
-   **该模型对应的行列出了特定区域** → 用户的区域必须是其中之一。如果不是，请停止并报告该模型支持的区域。
-   **该模型对应的行不存在或文档含义不明确** → 询问用户要使用的区域，而不是猜测。

继续操作前，请与用户确认区域。请注意，某些 Gemini 模型还会限制 CMEK，并且仅在 `us` 和 `eu` 多区域端点上提供调优后的模型，因此在作出承诺之前，请检查同一张表以了解这些限制。

### 0.3 启用 API

确保已启用 `aiplatform.googleapis.com` 和 `storage.googleapis.com`。

```bash
gcloud services enable aiplatform.googleapis.com storage.googleapis.com \
    --project=YOUR_PROJECT
```

### 0.4 IAM 权限

验证以下身份是否拥有所需角色。

-   **Agent Platform 服务代理**：
    `service-PROJECT_NUMBER@gcp-sa-aiplatform.iam.gserviceaccount.com`
-   **Managed OSS Fine Tuning 服务代理**：
    `service-PROJECT_NUMBER@gcp-sa-vertex-moss-ft.iam.gserviceaccount.com`
-   **用户身份**：运行命令的账号。

### 0.5 Python 依赖项

此技能中的脚本会导入 `vertexai`（来自 `google-cloud-aiplatform`）、
`google-genai`、`google-cloud-storage` 和 `datasets`。

**关键代理指令：** 请**勿**创建虚拟环境，并且在检查之前不要安装任何内容。venv
初始为空，会隐藏环境中已经提供的软件包，从而导致不必要且耗时数分钟的重复安装。

请先探测，仅在探测失败时安装：

```bash
python3 -c "import vertexai, google.genai, google.cloud.storage, datasets" \
  || pip install -r references/requirements.txt
```

然后使用普通的 `python3 scripts/...` 运行每个脚本——不要添加激活前缀。

`references/requirements.txt` 中固定的版本是针对环境尚未提供这些 SDK 时的后备方案。不要在正常工作的环境上应用这些版本要求：这会降级其他工具可能共享的软件包。

## 阶段 1：数据集准备与上传 {#phase-1}

### 1.0 数据集发现与确认

-   **用户提供的数据集验证：** 如果用户在提示中指定了数据集文件名或路径，请验证它是否存在于工作区中（例如，通过执行脚本或检查是否存在拼写错误）。
    *   **如果在任何位置都找不到该文件**，你**必须**告知用户数据集文件不存在或无法访问。你**必须**
        提示用户提供有效的数据集路径。或者，如果你在搜索工作区时发现了候选数据集文件，你**必须**
        将这些候选文件展示给用户，并要求用户选择其中一个。在报告文件缺失或展示候选文件后，你**必须**
        立即停止工具执行，并等待用户回复。在收到用户选择的有效数据集文件之前，**不要**
        请求进行 80/20 验证集拆分的许可，也**不要**
        尝试上传数据集。
    *   **如果已找到并验证该文件**，请继续执行下面的步骤 1.1 格式化与验证。
-   **自动发现：从用户存储桶中发现：** 如果用户没有数据集，并且在 Hugging Face 参考资料中也找不到合适的替代方案，请提出搜索用户的 GCS 存储桶，以寻找潜在的训练数据。优先搜索扩展名为 `.jsonl`、`.json`、`.csv` 和
    `.parquet` 等的文件。如果找到此类文件，请读取每个文件的前几行/前几条记录，以确定它们是否包含适合调优的文本数据（例如提示/补全对），这些数据应能够按照
    [数据准备指南](references/data_prep.md)进行修改，并且与请求的调优任务相关。**不要**
    在未事先征得同意的情况下进行搜索。
-   **自动发现：从任务到 Hugging Face：** 如果用户有特定任务，请参阅 [Hugging Face 数据集参考](references/hf_datasets.md)，如果其中存在适用的数据集，请从中推荐一个。对于推荐的每个数据集，请提供一些关于该数据集的信息，并给出一些合理的数据拆分方案。 > [!IMPORTANT] > **关键：请求确认并选择列。** 在执行以下 > 步骤并获得用户确认之前，不要继续 > 准备或上传数据集： > 1.
    **数据集和拆分确认：** 向用户展示数据集及 > 可用的拆分，并让他们确认要使用哪一个。 > 2. **列选择（Hugging Face 或自定义数据集）：** 你必须： > - 提供所选数据集 > 拆分中所有可用列的列表。 > - **展示数据集中的几个样本**，以帮助用户 > 了解内容并选择列。 > - 推荐应将哪些列映射到
    `prompt`（或用户 > 消息）和 `completion`（或助手回复）；如果适用，请提供几个 > 合理的选项。 > - 要求用户确认列映射，或指定要使用的 > 列。

### 1.1 格式化与验证

-   **转换**：如果数据采用 CSV、JSON 或 Parquet 格式，请使用
    `scripts/prepare_dataset.py` 进行转换。
-   **验证集拆分确认**：如果用户只提供了训练
    数据集，**你必须询问用户**是否允许按 80/20 的比例拆分
    训练数据集，以形成验证数据集（使用
    `--validation_split 0.2`）。如果用户同意，则继续拆分。如果用户
    拒绝，则仅使用训练数据集，不使用验证数据集。
-   **验证**：如果数据已经是 JSONL 格式，请在上传前进行验证。
    仅有 `.jsonl` 扩展名并不足够。你必须验证其
    内容模式对于调优是否有效（例如，是否具有正确的 system/user/model 角色）。

```bash
python3 scripts/prepare_dataset.py \
    --input my_data.jsonl \
    --format <messages|messages_gemini> \
    --validate_only
```

*（开放模型使用 `--format messages`，Gemini 模型使用
`--format messages_gemini`。）* - 有关所需模式，请参阅[数据准备指南](references/data_prep.md)。

### 1.2 上传

将格式化后的 `.jsonl` 文件上传到 GCS，并使用唯一目录（例如带有
日期时间戳的目录），以避免覆盖不同运行产生的输出。

```bash
ARTIFACTS="gs://YOUR_BUCKET/tuning_agent_job_<datetime>/dataset.jsonl"
gcloud storage cp dataset.jsonl "$ARTIFACTS"
```

## 阶段 2：模型配置与推荐 {#phase-2}

帮助用户选择最佳模型和参数。**提交作业前始终征求用户
确认。**

-   如果用户未在提示中指定具体模型，请根据
    **模型目录**计算推荐结果。
-   **请求确认：**向用户展示推荐的模型，并在
    配置超参数之前请求其确认。

### 2.1 配置

#### 对于开放模型

-   根据[调优指南](references/tuning_guide.md)和
    [模型目录](references/models.md)中特定于模型的基准，推荐 `tuning_mode`、`epochs`、`learning_rate` 和 `adapter_size`。

#### 验证实时模型 ID

提交作业前，运行 `scripts/list_models.py`，并且只能从其 `models`
输出中选择 `--base_model`。不得编造 ID 或版本号。

```bash
python3 scripts/list_models.py --project YOUR_PROJECT --filter gemini
```

输出：`{"models": [...], "total_count": N, "truncated": bool}`。

-   对于 Gemini，请移除 `google/` 和 `@default`（例如
    `google/gemini-2.5-flash@default` → `gemini-2.5-flash`）；对于开放模型，
    按原样传递 `publisher/family@version`。
-   跳过以 `-embedding`、`-tts`、`-image`、
    `-computer-use` 或 `-native-audio` 结尾的 Gemini 变体；它们不可调优。
-   如果 `truncated` 为 `true`，请使用范围更窄的 `--filter`（例如
    `gemini-2.5`）重新运行，然后再判定目标版本不可用。
-   如果 `models` 为空，请停止并询问用户。

### 2.2 计算成本（仅限开放模型）

-   我们可以根据数据集和[模型目录](references/models.md)中
    选定的模型，粗略估算调优成本：

```bash
    python3 scripts/calculate_cost.py \
        --input my_data.jsonl \
        --model MODEL_NAME \
        --tuning_mode TUNING_MODE \
        --epochs epochs
    ```

> [!NOTE] **处理数据集缺失错误：** 如果 `scripts/calculate_cost.py`
> 因找不到数据集文件（例如 `my_data.jsonl` 或 `dummy_data.jsonl`）
> 而失败，你**必须**告知用户该数据集文件不存在或无法访问。
> 你**必须**提示用户提供有效的数据集路径，并立即停止工具执行，
> 等待用户响应。**不要**重试或循环，**不要**虚构具体的成本数值，
> 并且在收到用户提供的有效数据集之前，**不要**请求用户批准提交作业。

-   **请求确认：** 向用户展示推荐的超参数配置和预估成本，并在继续提交作业
    之前征得用户同意。务必说明预估成本仅为估算值，可能与实际账单费用
    存在差异。

## 阶段 3：调优作业执行 {#phase-3-tuning-job-execution}

**关键的运行前检查（GCS 验证）：** 在提出确认请求或提交任何调优作业之前，
你**必须**验证指定的训练数据集 GCS URI（例如 `gs://dummy_bucket/dataset.jsonl` 或
`gs://YOUR_BUCKET/...`）确实存在且可访问。运行 `gcloud storage
ls $DATASET_URI`（或 `gsutil ls`）。

*   **如果验证失败**（例如出现 `BucketNotFound`、`404`、`AccessDenied`，
    或表明存储桶为虚拟/缺失状态），你**必须**告知用户该 GCS 存储桶或数据集
    不存在或无法访问。你**必须**提示用户提供有效的数据集 GCS URI，并立即
    停止工具执行，等待用户响应。在收到用户提供的有效数据集 URI 之前，
    **不要**提出确认请求，也**不要**执行任何调优脚本。
*   **如果验证成功**，则继续提出下方的确认请求。

### 对于 Gemini 模型

检查 `scripts/tune_gemini_model.py` 是否存在。

-   **如果 `scripts/tune_gemini_model.py` 存在：** 使用此脚本提交 Gemini 模型调优
    作业。

    ```bash
    python3 scripts/tune_gemini_model.py
    ```

-   **如果 `scripts/tune_gemini_model.py` 不存在：** 指示用户通过 Google Cloud Console UI
    或使用 Agent Platform SDK for Python 手动配置并提交调优作业。

### 对于开放模型

使用 `scripts/tune_open_model.py` 提交开放模型调优作业。通过
[文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/open-model-tuning#supported-models)
中的可用模型文档确定模型 ID。


```bash
python3 scripts/tune_open_model.py \
    --project YOUR_PROJECT \
    --location global \
    --base_model BASE_MODEL_ID \
    --train_dataset gs://YOUR_BUCKET/tuning_agent_job_<datetime>/dataset.jsonl \
    --output_uri gs://YOUR_BUCKET/tuning_agent_job_<datetime>/output \
    --epochs EPOCHS \
    --learning_rate LR \
    --tuning_mode MODE
```

此脚本仅适用于开放模型，如果省略 `--location`，则回退到 `global`。始终显式传入用户在第 0.2 节中确认的位置，以便该位置在你提交给用户审批的命令字符串中清晰可见。

> [!IMPORTANT] **需要交互式确认（Tier M）：** 在继续提交作业之前，你**必须**在确认提示中向用户展示包含所有字面量标志的拟议命令字符串，并提供“Yes”和“No”选项。

> **关键：** 向用户显示此确认提示时，你必须以直接的纯文本响应形式输出该提示，并立即停止工具执行。不要在同一轮中调用任何命令执行工具或交互式工具，因为模拟环境可能会自动回复意外的工具调用，并导致无限循环。立即暂停并等待用户回复。

## 阶段 4：监控 {#phase-4-monitoring}

通过脚本输出中提供的 Cloud Console 链接监控作业。`--location` 是必需的，并且必须与你提交作业时使用的位置相同：在 `global` 上提交的开放模型作业应使用 `--location global` 进行轮询，即使相关工作实际上在幕后某个真实区域中运行。

此外，询问用户是否希望你在后台替他们监控作业状态。如果他们同意，则将 `scripts/monitor_tuning_job.py` 作为后台任务执行，以定期轮询作业状态并通知用户查看状态。如果用户拒绝，则将状态检查完全交由用户自行处理。

## 阶段 5：模型部署 {#phase-5-model-deployment}

调优作业达到 `SUCCEEDED` 状态后，部署模型。

部署需要使用真实区域——此处不允许使用 `--region=global`。如果作业在 `global` 上运行，请从已调优模型的资源名称（`projects/.../locations/<REGION>/models/...`）中读取区域并部署到该区域；不要猜测。

```bash
ARTIFACTS="gs://YOUR_BUCKET/tuning_agent_job_<datetime>/output/postprocess/node-0/checkpoints/final"
gcloud ai model-garden models deploy \
    --project=YOUR_PROJECT \
    --region=YOUR_LOCATION \
    --model="$ARTIFACTS" \
    --machine-type=MACHINE_TYPE \
    --accelerator-type=ACCELERATOR_TYPE \
    --accelerator-count=COUNT
```

> [!IMPORTANT] **需要交互式确认（Tier M）：** 在继续部署之前，你**必须**在确认提示中向用户展示包含所有字面量标志的拟议命令字符串，并提供“Yes”和“No”选项。

> **关键：** 向用户显示此确认提示时，你必须以直接的纯文本响应形式输出该提示，并立即停止工具执行。不要在同一轮中调用任何命令执行工具或交互式工具，因为模拟环境可能会自动回复意外的工具调用，并导致无限循环。立即暂停并等待用户回复。

有关特定开放模型的硬件建议，请参阅[模型目录](references/models.md)。

## 资源

-   [数据准备指南](references/data_prep.md)
-   [模型目录](references/models.md)
-   [调优指南](references/tuning_guide.md)
-   `scripts/prepare_dataset.py`：数据转换和验证。
-   `scripts/tune_open_model.py`：提交开放模型调优作业。