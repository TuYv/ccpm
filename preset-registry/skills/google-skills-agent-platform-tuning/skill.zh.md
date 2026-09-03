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

此技能提供使用 Agent Platform 调优服务对大型语言模型（包括开放模型和 Gemini 模型）进行微调的流程知识。内容涵盖从环境设置和数据准备，到作业配置、监控和部署的完整生命周期。

## 工作流决策树

1.  **模型类别识别**：用户是否明确说明希望调优**开放模型**还是 **Gemini 模型**？

    -   **否** → **停止**。询问用户希望调优开放模型还是 Gemini 模型。**环境设置请求的关键例外情况：**如果用户明确询问环境设置说明（例如“需要什么环境设置？”），你**必须**在初始响应中提供完整的 [Phase 0 环境设置](#phase-0)说明，*同时*询问有关模型类别的澄清问题。
    -   如果用户提供了具体的调优目的，你应推荐三个模型：一个开放模型、一个 Gemini 模型，以及第三个通常推荐的选择。简要列出每个模型的优缺点（例如，Gemini 模型可能成本更高等）。**关键要求：**在此步骤中必须读取 `references/models.md`，并且只能推荐该目录中明确列出的模型。不要推荐不受支持的模型，例如 Mistral。如果用户指定的模型不在目录中，请遵循该目录中的回退规则。在模型类别得到确认之前，不要继续进行模型配置。
    -   **是** → 继续。

2.  **环境检查**：环境（身份验证、API、IAM、Venv）是否已初始化？

    -   **否** → 转到 [Phase 0：环境与 IAM 设置](#phase-0)。
    -   **是** → 继续。

3.  **数据集状态**：数据集是否已准备为 JSONL 格式、**其结构是否对调优有效**，并且是否已上传到 Google Cloud Storage？

    ```
    -   **否** → 转到 [Phase 1：数据集准备与上传](#phase-1)。
    -   **是** → 继续。
    ```

4.  **列选择确认**：你是否已向用户展示列并确认映射关系？

    -   **否** → **停止**。必须按照 Phase 1.0 中的说明展示样本并获取用户对列映射的确认，然后才能继续。
    -   **是** → 继续。

5.  **配置**：用户是否提供了目标模型和超参数，或明确同意你的推荐？

    -   **否** → 转到
        [Phase 2：模型配置与推荐](#phase-2)。
    -   **是** → 继续。

6.  **作业状态**：调优作业是否已提交？

    ```
    -   **否** → 转到
        [Phase 3：调优作业执行](#phase-3-tuning-job-execution)。
    -   **是** → 继续。
    ```

7.  **作业完成情况**：调优作业是否已完成？

    ```
    -   **否** → 转到 [Phase 4：监控](#phase-4-monitoring)。
    -   **是** → 继续。
    ```

8.  **部署**：调优后的模型是否已部署（如有需要）？

    ```
    -   **No** → Go to [Phase 5: Model Deployment](#phase-5-model-deployment).
    -   **Yes** → Task Complete.
    ```

## 阶段 0：环境与 IAM 设置 {#phase-0}

在继续之前，确保基础环境已准备就绪。

### 0.1 身份验证与项目上下文

-   检查是否已安装 `gcloud` CLI。如果尚未安装，请在继续之前请求用户允许安装。如果已安装，则进行更新：

```bash
gcloud components update --quiet > /dev/null 2>&1
```

-   验证 `gcloud auth list`。如果尚未完成身份验证，则运行 `gcloud auth login`。
-   确保已知晓 `project`。使用 `gcloud config get project` 获取当前项目。
-   **关键：请求确认。** 在继续之前，必须提示用户确认获取到的项目，以防用户希望切换到其他项目。同时也必须确认位置，具体应提议哪个位置请参见 0.2 节，该位置取决于模型类别。

### 0.2 位置

位置处理**取决于你在工作流决策树中确定的模型类别**。这两个类别支持的地点不同，不得将一个类别的地点应用于另一个类别。

-   **开放模型**共享一组固定的位置，推荐使用 `global`。
-   **Gemini 模型**因模型而异，必须进行查询。目前不接受 `global`。

如果用户指定的位置对其模型和类别无效，立即停止。回复一条错误消息，指出所请求的位置不受支持，并列出有效位置；不要请求数据集，不要继续执行任何其他设置步骤，也不要默默地在其他位置重试。

#### 开放模型（推荐：`global`）

**推荐使用 `global`，并向用户确认。** 将其作为唯一推荐选项提出，而不是先让用户选择区域；不要引导用户转而选择某个特定区域。

这些是开放模型调优可用的唯一位置：

-   `global`（推荐选项）
-   `us-central1`
-   `europe-west4`
-   `us-west1`
-   `us-east5`
-   `asia-southeast1`

`global` 端点会自动选择具有可用容量的受支持区域，因此最有可能成功安排任务。预先固定某个区域会将任务限制在该区域的容量范围内，这就是开放模型调优推荐使用 `global` 的原因。

-   **用户指定了位置** → 只要该位置是 `global` 或上述区域之一，就按原样使用。不要劝阻用户使用该位置。
-   **用户询问支持哪些位置** → 回答该问题。分享上述列表，并说明推荐使用 `global` 及其原因。绝不要隐瞒这一点。
-   **用户未指定位置** → 提议使用 `global`，并请求用户在继续之前确认。说明 `global` 允许服务选择具有可用容量的区域。不要默默假定使用 `global`。

提出单个选项的目的是避免让用户必须先解决区域选择问题，才能进行其他操作，这种顺序正是之前阻碍用户的原因。这并不是隐藏列表的理由：用户要求时应引用列表，拒绝不受支持的位置时也应引用列表。

仅在以下情况下回退到明确区域，并告知用户这样做的原因：

-   **CMEK。** 客户管理的加密密钥在 `global` 上会被拒绝，并返回 `FAILED_PRECONDITION` 错误。受 CMEK 保护的作业必须指定保存密钥的区域。

-   **数据驻留。** 如果用户要求作业留在特定司法管辖区内，则遵循其区域要求。`global` 当前会在 `us-central1` 或 `europe-west4` 中的任一区域运行作业。

如果 `global` 作业被接受，但随后失败并返回 `FAILED_PRECONDITION` 错误，指出模型不支持全局端点调优，则表示该模型尚未接入全局端点。模型本身仍然支持调优：从上述列表中选择一个明确区域重新提交一次（`us-central1` 是最稳妥的选择），并告知用户切换区域的原因。

##### 使用 `global` 作业

-   API 主机仍为 `aiplatform.googleapis.com`。不存在 `global-aiplatform.googleapis.com` 主机。
-   服务会在运行时将 `global` 解析为实际区域。子资源（调优后的模型、检查点、TensorBoard）返回的资源名称中会包含该**实际**区域，而不是 `global`。在将其用于监控或部署之前，应从返回的资源名称中读取位置；绝不要假设它仍然是 `global`。
-   配额在各区域之间共享，因此固定区域不会带来额外配额。

#### Gemini 模型（逐个模型查询）

目前 `global` **不接受 Gemini 调优**，服务会在创建作业时返回 `FAILED_PRECONDITION` 错误并拒绝，因此不要在此处提出使用它。

**Gemini 没有统一的区域允许列表。** 受支持的调优区域因模型及模型版本而异：某些 Gemini 模型仅限于两个区域，而其他模型支持更多区域。不要重复使用上面的开放模型列表，也不要假设某个区域可以从另一个 Gemini 模型沿用。

提交之前，请在监督式微调文档中查询所选模型，并阅读其 **“Supported endpoint for model tuning”** 行：
[监督式调优](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/tuning/supervised-tuning)

-   **用户询问支持哪些区域** → 查询该特定模型，并告知用户文档中的内容。不要凭记忆回答，也不要根据开放模型列表回答，更不要回答其他 Gemini 模型的情况。
-   **模型的行列出了具体区域** → 用户的区域必须是其中之一。如果不是，停止操作并报告该模型支持的区域。
-   **模型的行不存在或文档不明确** → 询问用户所需区域，不要猜测。

在继续之前，请向用户确认区域。请注意，某些 Gemini 模型也会限制 CMEK，并且仅在 `us` 和 `eu` 多区域端点上提供调优模型，因此在向用户承诺这些功能之前，请查看同一张表中的相关限制。

### 0.3 启用 API

确保已启用 `aiplatform.googleapis.com` 和 `storage.googleapis.com`。

```bash
gcloud services enable aiplatform.googleapis.com storage.googleapis.com \
    --project=YOUR_PROJECT
```

### 0.4 IAM 权限

验证以下身份是否具有所需角色。

-   **Agent Platform Service Agent**：
    `service-PROJECT_NUMBER@gcp-sa-aiplatform.iam.gserviceaccount.com`
-   **Managed OSS Fine Tuning Service Agent**：
    `service-PROJECT_NUMBER@gcp-sa-vertex-moss-ft.iam.gserviceaccount.com`
-   **用户身份**：运行命令的账号。

### 0.5 Python 依赖项

此技能中的脚本会导入 `vertexai`（来自 `google-cloud-aiplatform`）、`google-genai`、`google-cloud-storage` 和 `datasets`。

**关键代理指令：**请勿创建虚拟环境，也不要在检查之前安装任何内容。虚拟环境一开始是空的，会隐藏环境中已有的软件包，从而导致重复安装数分钟。

先进行探测，仅在探测失败时安装：

```bash
python3 -c "import vertexai, google.genai, google.cloud.storage, datasets" \
  || pip install -r references/requirements.txt
```

然后使用普通的 `python3 scripts/...` 运行每个脚本，不要添加激活前缀。

`references/requirements.txt` 中的固定版本是为环境中尚未提供这些 SDK 的情况准备的备用方案。不要在环境正常工作的情况下应用这些固定版本，否则可能会降级其他工具共享的软件包。

## 阶段 1：数据集准备与上传 {#phase-1}

### 1.0 数据集发现与确认

-   **验证用户提供的数据集：**如果用户在提示中指定了数据集文件名或路径，请在工作区中验证其是否存在（例如，通过执行脚本或检查拼写）。
    *   **如果在任何位置都找不到该文件**，则**必须**告知用户数据集文件不存在或无法访问。**必须**提示用户提供有效的数据集路径。或者，如果在搜索过程中于工作区内找到了候选数据集文件，则**必须**将候选项展示给用户，并要求用户选择其中一个。报告文件缺失或展示候选项后，**必须**立即停止工具执行，并等待用户回复。**不要**询问是否允许进行 90/10 验证集拆分，也**不要**在收到用户对有效数据集文件的选择之前尝试上传数据集。
    *   **如果已找到并验证文件**，则继续执行下面的第 1.1 步“格式化与验证”。
-   **自动发现：从用户存储桶中发现：**如果用户没有数据集，并且 Hugging Face 参考中也找不到合适的替代数据集，请主动提出搜索用户的 GCS 存储桶，以查找潜在的训练数据。优先搜索扩展名为 `.jsonl`、`.json`、`.csv` 和 `.parquet` 的文件。如果找到此类文件，请读取每个文件的前几行/条记录，以确定其中是否包含适合调优的文本数据（例如，提示/补全对），这些数据应能够按照[数据准备指南](references/data_prep.md)进行修改，并且与用户请求的调优任务相关。**请勿在未先征得用户同意的情况下进行搜索。**
-   **自动发现：从任务到 Huggingface：**如果用户有特定任务，请参考 [Huggingface 数据集参考](references/hf_datasets.md)，并在其中存在合适数据集时进行推荐。对于每个推荐的数据集，请提供一些有关该数据集的信息，并提供一些合理的数据集拆分。 > [!IMPORTANT] > **关键：请求确认并选择列。**在执行数据集准备或上传之前，不得继续操作 >，必须先完成以下步骤并获得用户确认： > 1. **数据集和拆分确认：**向用户展示数据集及可用拆分，> 并让用户确认要使用哪些拆分。 > 2. **列选择（Hugging Face 或自定义数据集）：**你必须： > - 列出所选数据集 > 拆分中的所有可用列。 > - **展示数据集中的一些样本**，帮助用户 > 理解内容并选择列。 > - 建议哪些列应映射到 `prompt`（或用户 > 消息）和 `completion`（或助手响应），并在适用时 > 提供几个合理选项。 > - 要求用户确认列映射，或指定要使用的列。

### 1.1 格式与验证

-   **转换**：如果数据为 CSV、JSON 或 Parquet 格式，请使用
    `scripts/prepare_dataset.py` 进行转换。
-   **验证集划分确认**：如果用户仅提供了训练数据集，**必须提示用户并征求其许可**，以将训练数据集按 90/10 划分为验证数据集（使用 `--validation_split 0.1`）。如果用户同意，则继续执行划分。如果用户拒绝，则仅使用训练数据集，不使用验证数据集。**不要**提供 80/20 划分选项；调优服务会拒绝这种划分，具体原因请参见
    [数据准备指南](references/data_prep.md#sizing-the-validation-split)。
-   **验证**：如果数据已经是 JSONL 格式，请在上传前进行验证。
    仅有 `.jsonl` 扩展名并不足够。必须验证内容 schema 是否符合调优要求（例如，system/user/model 角色是否正确）。

```bash
python3 scripts/prepare_dataset.py \
    --input my_data.jsonl \
    --format <messages|messages_gemini> \
    --validate_only
```

*（开放模型使用 `--format messages`，Gemini 模型使用 `--format messages_gemini`。）* 请参阅[数据准备指南](references/data_prep.md)了解所需的 schema。

### 1.2 上传

使用唯一目录（例如包含日期时间戳的目录）将格式化后的 `.jsonl` 文件上传到 GCS，以避免覆盖不同运行产生的输出。

```bash
ARTIFACTS="gs://YOUR_BUCKET/tuning_agent_job_<datetime>/dataset.jsonl"
gcloud storage cp dataset.jsonl "$ARTIFACTS"
```

## 阶段 2：模型配置与推荐 {#phase-2}

帮助用户选择最佳模型和参数。**提交作业前必须始终征求用户确认。**

-   如果用户未在提示中指定具体模型，请根据**模型目录**计算推荐结果。
-   **请求确认**：向用户展示推荐模型，并在配置超参数前请求用户确认。

### 2.1 配置

#### 开放模型

-   根据[调优指南](references/tuning_guide.md)和[模型目录](references/models.md)中的特定模型基线，推荐 `tuning_mode`、`epochs`、`learning_rate` 和 `adapter_size`。

#### 验证实时模型 ID

提交作业前，运行 `scripts/list_models.py`，并且只能从其 `models` 输出中选择 `--base_model`。不要臆造 ID 或版本号。

```bash
python3 scripts/list_models.py --project YOUR_PROJECT --filter gemini
```

输出：`{"models": [...], "total_count": N, "truncated": bool}`。

-   对于 Gemini，去掉 `google/` 和 `@default`（例如
    `google/gemini-2.5-flash@default` → `gemini-2.5-flash`）；对于开放模型，按原样传递 `publisher/family@version`。
-   跳过以 `-embedding`、`-tts`、`-image`、`-computer-use` 或 `-native-audio` 结尾的 Gemini 变体；这些模型不可调优。
-   如果 `truncated` 为 `true`，请使用更严格的 `--filter` 重新运行（例如
    `gemini-2.5`），然后再判断目标版本是否不可用。
-   如果 `models` 为空，请停止并询问用户。

### 2.2 计算成本（仅限开放模型）

-   我们可以根据数据集和[模型目录](references/models.md)中选定的模型，
    计算调优成本的粗略估算：

    ```bash
    python3 scripts/calculate_cost.py \
        --input my_data.jsonl \
        --model MODEL_NAME \
        --tuning_mode TUNING_MODE \
        --epochs epochs
    ```

    `--model` 可以接受显示名称（`Qwen 3 8B`），也可以接受你传递给
    `--base_model` 的相同资源名称（`qwen/qwen3@qwen3-8b`），因此可以直接
    复用步骤 2.1 中选择的值。

> [!NOTE] **处理数据集缺失错误：** 如果 `scripts/calculate_cost.py`
> 因为找不到数据集文件（例如 `my_data.jsonl` 或 `dummy_data.jsonl`）
> 而失败，你**必须**告知用户数据集文件不存在或无法访问。你**必须**提示用户
> 提供有效的数据集路径，并立即停止工具执行，等待用户回复。
> **不要**重试或循环执行，**不要**臆造具体的成本数值，并且在收到用户提供的有效数据集之前，
> **不要**提示用户批准提交作业。

-   **请求确认：** 向用户展示推荐的超参数配置和估算成本，并在继续提交作业之前请求用户批准。
    请务必说明估算成本仅供参考，可能与实际计费成本有所不同。

## 阶段 3：调优作业执行 {#phase-3-tuning-job-execution}

**关键的飞行前检查（GCS 验证）：** 在提出确认提示或提交任何调优作业之前，你**必须**验证
指定的训练数据集 GCS URI（例如 `gs://dummy_bucket/dataset.jsonl` 或 `gs://YOUR_BUCKET/...`）
确实存在且可访问。运行 `gcloud storage ls $DATASET_URI`（或 `gsutil ls`）。

*   **如果验证失败**（例如出现 `BucketNotFound`、`404`、`AccessDenied`，或表明存储桶为虚拟/缺失存储桶），
    你**必须**告知用户 GCS 存储桶或数据集不存在或无法访问。你**必须**提示用户提供有效的数据集 GCS URI，
    并立即停止工具执行，等待用户回复。在收到用户提供的有效数据集 URI 之前，**不要**提出确认提示，
    也**不要**执行任何调优脚本。
*   **如果验证成功**，继续提出下面的确认提示。

### 对于 Gemini 模型

检查 `scripts/tune_gemini_model.py` 是否存在。

-   **如果 `scripts/tune_gemini_model.py` 存在：** 使用此脚本提交 Gemini 模型调优作业。

    ```bash
    python3 scripts/tune_gemini_model.py
    ```

-   **如果 `scripts/tune_gemini_model.py` 不存在：** 指导用户通过 Google Cloud Console UI
    或使用 Agent Platform SDK for Python 手动配置并提交调优作业。

### 对于开放模型

使用 `scripts/tune_open_model.py` 提交开放模型调优作业。使用可用的模型文档
在[文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/open-model-tuning#supported-models)
中确定模型 id。

`--base_model` 接受的是发布商模型**资源名称**
（`{publisher}/{model_id}@{version_id}`），而不是目录中显示的名称。有关格式、经过验证的示例，以及如何查找尚未掌握的名称，请参阅
`references/models.md` 中的“Model Resource Name Format”。

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

此脚本仅适用于开放模型；如果省略 `--location`，则会回退到 `global`。始终在命令中显式传入用户在第 0.2 节确认的位置，以便在提交审批时能够看到该参数。

> [!WARNING] **开放模型必须提供 `--output_uri`。** Python SDK 将其声明为 `output_uri: Optional[str] = None`，但调优后端会拒绝省略该参数的开放模型任务，并返回 `INVALID_ARGUMENT: The output_uri field is required for this model.`。在此处应将 SDK 的“可选”签名视为错误，并始终传入 GCS 目标位置。

由于该参数是必需的，你必须先确定调优后的模型写入位置，之后才能提交任务。**绝不要臆造 bucket 名称、根据项目编号推导 bucket 名称，或未经提示运行 `gcloud storage buckets create`。**创建 bucket 属于变更操作，受下方 Tier M 确认政策约束。

-   **用户指定了 bucket 或 URI** → 使用该位置，并按照第 1.2 节所述追加每个任务唯一的目录。
-   **第 1.2 节中的数据集上传已使用某个 bucket** → 提议复用该 bucket 存储输出，并请用户确认。
-   **两者都没有** → **停止并询问用户希望将调优后的模型存储在哪里。**将为用户创建 bucket 作为选项之一。如果用户接受，请提出确切的 bucket 名称和位置，获得明确确认后再创建。

> [!IMPORTANT] **需要交互式确认（Tier M）：**在继续提交任务之前，**必须**向用户展示包含所有字面参数的拟议命令字符串，并通过确认提示询问用户，提供“Yes”和“No”选项。

> **关键：**向用户展示此确认提示时，**必须**将其作为直接的纯文本回复输出，并立即停止工具执行。同一轮中**不要**调用任何命令执行工具或交互式工具，因为意外的工具调用可能会被模拟器自动回复，从而导致无限循环。立即等待用户回复。

## 阶段 4：监控 {#phase-4-monitoring}

通过脚本输出中提供的 Cloud Console 链接监控任务。
`--location` 是必需的，并且必须与提交任务时使用的位置相同：在 `global` 上提交的开放模型任务必须使用 `--location global` 进行轮询，即使任务实际在后台的某个真实区域中运行。

此外，询问用户是否希望你在后台为其监控作业状态。
如果用户同意，则将 `scripts/monitor_tuning_job.py` 作为后台任务执行，定期轮询作业状态并通知用户显示状态。
如果用户拒绝，则完全由用户自行检查状态。

## 阶段 5：模型部署 {#phase-5-model-deployment}

调优作业变为 `SUCCEEDED` 后，部署模型。

部署需要真实区域，此处 `--region=global` 无效。如果作业在 `global` 上运行，则从调优模型的资源名称（`projects/.../locations/<REGION>/models/...`）中读取区域，并在那里进行部署；不要猜测。

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

> [!IMPORTANT] **需要交互式确认（Tier M）：** 在继续部署之前，你**必须**向用户展示拟执行的命令字符串，其中包含所有字面量标志，并通过确认提示让用户选择“Yes”或“No”。

> **关键：** 向用户显示此确认提示时，你**必须**将其作为直接的纯文本响应输出，并立即停止工具执行。
> 不要在同一轮中调用任何命令执行工具或交互式工具，因为意外的工具调用可能会被模拟器自动回复，从而导致无限循环。立即等待用户回复。

有关特定开放模型的硬件建议，请参阅[模型目录](references/models.md)。

## 资源

-   [数据准备指南](references/data_prep.md)
-   [模型目录](references/models.md)
-   [调优指南](references/tuning_guide.md)
-   `scripts/prepare_dataset.py`：数据转换与验证。
-   `scripts/tune_open_model.py`：开放模型调优作业提交。