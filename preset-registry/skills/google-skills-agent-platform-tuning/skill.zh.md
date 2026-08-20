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

本技能提供使用 Agent Platform 调优服务对大语言模型进行微调的流程性知识
（包括开放模型和 Gemini 模型）。它涵盖从环境设置和数据准备到作业
配置、监控和部署的完整生命周期。

## 工作流决策树

1.  **模型类别识别**：用户是否明确说明他们希望调优 **开放模型** 还是
    **Gemini 模型**？

    -   **否** → **停止**。询问用户希望调优开放模型还是
        Gemini 模型。**环境设置请求的重要例外：** 如果用户明确询问环境设置说明（例如
        “需要进行哪些环境设置？”），你**必须**在初始回复中提供完整的
        [阶段 0 环境设置](#phase-0)说明，*同时*就模型类别提出澄清问题。
    -   如果用户提供了具体的调优目的，你应推荐三种模型：一种开放模型、一种 Gemini 模型，
        以及第三种通常推荐的选择。简要列出每种模型的优缺点（例如，Gemini
        模型可能更昂贵等）。**关键：** 在此步骤中，你必须阅读
        `references/models.md`，并且只能推荐该目录中明确列出的模型。不要推荐
        Mistral 等不受支持的模型。如果用户指定的模型不在目录中，
        请遵循该目录中的回退规则。在确认类别之前，不要继续进行模型
        配置。
    -   **是** → 继续。

2.  **环境检查**：环境（认证、API、IAM、虚拟环境）是否已
    初始化？

    -   **否** → 转至[阶段 0：环境与 IAM 设置](#phase-0)。
    -   **是** → 继续。

3.  **数据集状态**：数据集是否已准备为 JSONL 格式，**其结构是否
    对调优有效**，并且是否已上传到 Google Cloud Storage？

    ```
    -   **No** → Go to [Phase 1: Dataset Preparation & Upload](#phase-1).
    -   **Yes** → Proceed.
    ```

4.  **列选择确认**：你是否已向用户展示各列并确认映射关系？

    -   **否** → **停止**。继续之前，你必须按照阶段 1.0 中的说明展示样本并获得用户对
        列映射的确认。
    -   **是** → 继续。

5.  **配置**：用户是否已提供目标模型和超参数，或已明确同意你的建议？

    -   **否** → 转至
        [阶段 2：模型配置与推荐](#phase-2)。
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

8.  **部署**：经过调优的模型是否已部署（如需要）？

    ```
    -   **No** → 前往 [阶段 5：模型部署](#phase-5-model-deployment)。
    -   **Yes** → 任务完成。
    ```

## 阶段 0：环境与 IAM 设置 {#phase-0}

在继续之前，确保基础环境已准备就绪。

### 0.1 身份验证与项目上下文

-   检查是否已安装 `gcloud` CLI。如果尚未安装，在继续之前提示用户授权安装。如果已安装，则更新它：

```bash
gcloud components update --quiet > /dev/null 2>&1
```

-   验证 `gcloud auth list`。如果未通过身份验证，请运行 `gcloud auth login`。
-   确保已知 `project`。使用 `gcloud config get project` 获取当前项目。
-   **关键：请求确认。** 必须提示用户确认获取到的项目后才能继续，以防他们想要切换到其他项目。还必须确认位置——有关应建议的位置，请参阅第 0.2 节，这取决于模型类别。

### 0.2 位置

位置处理**取决于模型类别**，该类别在工作流决策树中确定。这两个类别支持的位置不同——绝不可将一个类别的位置应用于另一个类别。

-   **开放模型**共用一组固定位置，建议选择 `global`。
-   **Gemini 模型**因模型而异，必须查询。当前它们不接受 `global`。

如果用户指定的位置对于其模型和类别无效，请停止。回复错误信息，说明所请求的位置不受支持，列出有效的位置，并且不要请求数据集、不要继续执行任何其他设置步骤，也不要静默地在其他位置重试。

#### 开放模型（建议：`global`）

**建议使用 `global`，并与用户确认。** 将其作为唯一的推荐选项提出，而不是先让用户选择区域，也不要引导他们改选特定区域。

以下是开放模型调优仅可使用的位置：

-   `global`（推荐选择）
-   `us-central1`
-   `europe-west4`
-   `us-west1`
-   `us-east5`
-   `asia-southeast1`

`global` 端点会自动选择具有可用容量的受支持区域，因此最有可能成功获得调度。预先固定区域会将作业限制在该单一区域的容量内，这就是为什么对于开放模型调优，建议使用 `global`。


-   **用户指定了位置** → 原样使用该位置，前提是它为 `global` 或上述列出的区域之一。不要劝说他们改用其他位置。
-   **用户询问哪些位置受支持** → 回答该问题。分享上述列表，并说明建议使用 `global` 及其原因。绝不可隐瞒该信息。
-   **用户未指定位置** → 建议使用 `global`，并在继续之前请他们确认。说明 `global` 允许服务选择具有可用容量的区域。不要静默假定使用 `global`。

提出单一选择的目的，是避免让区域选择成为用户在其他任何操作发生之前都必须解决的决策——这种顺序正是此前阻碍用户的原因。这并不是隐藏列表的理由：只要用户询问，就列出该列表；在拒绝不受支持的位置时，也要列出该列表。

**仅**在以下情况下回退到明确指定的区域，并告知用户你这样做的原因：

-   **CMEK。** 使用客户管理的加密密钥时，`global` 会因 `FAILED_PRECONDITION` 错误而被拒绝。受 CMEK 保护的作业必须指定保存该密钥的区域。

-   **数据驻留。** 如果用户要求作业保留在特定司法管辖区内，请遵循其区域要求。`global` 当前会在 `us-central1` 或 `europe-west4` 中运行作业。

如果 `global` 作业被接受但随后因 `FAILED_PRECONDITION` 错误失败，且错误提示模型不支持全局端点微调，则该模型尚未接入全局端点。模型本身仍然可以微调：从上方列表中选择一个明确区域重新提交一次（`us-central1` 是最稳妥的选择），并告知用户你切换的原因。

##### 使用 `global` 作业

-   API 主机保持为 `aiplatform.googleapis.com`。不存在 `global-aiplatform.googleapis.com` 主机。
-   服务会在运行时将 `global` 解析为实际区域。子资源（微调后的模型、检查点、TensorBoard）会在其资源名称中返回该**实际**区域，而不是 `global`。在将其用于监控或部署之前，请从返回的资源名称中读取位置；绝不要假定它仍是 `global`。
-   配额在各区域之间共享，因此固定区域不会获得额外配额。

#### Gemini 模型（按模型查询）

目前 Gemini 微调**不接受**`global`——服务会在创建作业时以 `FAILED_PRECONDITION` 错误拒绝它，因此不要在这里建议使用它。


**Gemini 没有统一的区域允许列表。** 支持微调的区域因模型和模型版本而异：某些 Gemini 模型仅限于两个区域，而另一些则支持更多区域。不要复用上方开放模型列表，也不要假定某个区域可从一个 Gemini 模型沿用到另一个模型。

提交之前，请在监督式微调文档中查找所选模型，并阅读其 **“Supported endpoint for model tuning”**
行：
[监督式微调](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/tuning/supervised-tuning)


-   **用户询问支持哪些区域** → 查找该特定模型，并告知他们文档中的说明。不要凭记忆或根据开放模型列表作答，也不要针对其他 Gemini 模型作答。
-   **模型所在行列出了特定区域** → 用户的区域必须是其中之一。如果不是，停止操作并报告该模型支持的区域。
-   **模型所在行缺失或文档不清楚** → 请用户提供区域，而不是猜测一个区域。

在继续之前，先与用户确认区域。请注意，某些 Gemini 模型也会限制 CMEK，并且仅在 `us` 和 `eu` 多区域端点上提供微调模型，因此在承诺支持它们之前，请检查同一张表中的这些限制。

### 0.3 启用 API

确保已启用 `aiplatform.googleapis.com` 和 `storage.googleapis.com`。

```bash
gcloud services enable aiplatform.googleapis.com storage.googleapis.com \
    --project=YOUR_PROJECT
```

### 0.4 IAM 权限

验证以下身份具有所需角色。

-   **Agent Platform 服务代理**：
    `service-PROJECT_NUMBER@gcp-sa-aiplatform.iam.gserviceaccount.com`
-   **Managed OSS Fine Tuning 服务代理**：
    `service-PROJECT_NUMBER@gcp-sa-vertex-moss-ft.iam.gserviceaccount.com`
-   **用户身份**：运行命令的账户。

### 0.5 Python 依赖项

此技能中的脚本会导入 `vertexai`（来自 `google-cloud-aiplatform`）、
`google-genai`、`google-cloud-storage` 和 `datasets`。

**关键代理指令：** **不要**创建虚拟环境，并且在检查之前不要安装任何内容。venv 初始为空，会隐藏环境已提供的软件包，从而强制执行一次冗余的、耗时数分钟的安装。

先进行探测，仅当探测失败时才安装：

```bash
python3 -c "import vertexai, google.genai, google.cloud.storage, datasets" \
  || pip install -r references/requirements.txt
```

然后使用普通的 `python3 scripts/...` 运行每个脚本，**不要**添加激活前缀。

`references/requirements.txt` 中的固定版本仅作为环境尚未提供这些 SDK 时的后备方案。不要将其应用在正常工作的环境之上：它们会降级其他工具可能共用的软件包。

## 阶段 1：数据集准备与上传 {#phase-1}

### 1.0 数据集发现与确认

-   **用户提供的数据集验证：** 如果用户在其提示中指定了数据集
    文件名或路径，请验证其在工作区中的存在性
    （例如，通过脚本执行或检查拼写错误）。
    *   **如果在任何位置都找不到该文件**，你**必须**告知用户
        该数据集文件不存在或无法访问。你**必须**
        提示用户提供有效的数据集路径。或者，如果在搜索期间
        在工作区中找到了候选数据集文件，你**必须**向用户展示这些候选项，
        并要求他们选择其中一个。在报告文件缺失或展示候选项后，你**必须**
        立即停止工具执行，并等待用户响应。
        **不要**请求对 90/10 验证集划分的许可，并且**不要**
        在收到用户对有效数据集文件的
        选择之前尝试上传数据集。
    *   **如果找到并验证了该文件**，请继续执行下方的步骤 1.1 格式化与
        验证。
-   **自动发现：从用户存储桶：** 如果用户没有数据集，
    并且在 Hugging Face 参考资料中找不到合适的替代方案，则主动提出
    在用户的 GCS 存储桶中搜索潜在训练数据。优先
    搜索扩展名为 `.jsonl`、`.json`、`.csv` 和
    `.parquet` 的文件。如果找到此类文件，请读取每个文件的前几行/记录，
    以确定它们是否包含适合微调的文本数据（例如，
    prompt/completion 对），这些数据可以被修改为遵循
    [数据准备指南](references/data_prep.md)，并且与所请求的
    微调任务相关。**未经提示，切勿**搜索。
-   **自动发现：从任务到 Huggingface：** 如果用户有特定
    任务，请参阅 [Huggingface 数据集参考](references/hf_datasets.md)，
    并在存在合适数据集时从中推荐一个。对于每个
    推荐的数据集，请提供一些有关该数据集的信息，并提供一些
    合理的数据集划分。> [!IMPORTANT] > **关键：请求确认和
    列选择。** 在执行数据集准备或上传之前，请勿继续
    ，直到你完成以下 > 步骤并获得用户确认： > 1.
    **数据集和划分确认：** 向用户展示数据集及其 > 可用划分，并让他们确认要使用哪个。 > 2. **列
    选择（Hugging Face 或自定义数据集）：** 你必须： > - 提供所选数据集
    划分中所有可用列的列表。 > - **展示数据集中的若干样本**，以帮助用户 > 理解内容并选择列。 > - 推荐应映射到
    `prompt`（或用户 > 消息）和 `completion`（或助手响应）的列，
    并在适用时提供几个 > 合理选项。 > - 要求用户
    确认列映射，或指定要使用哪些 > 列。

### 1.1 格式化与验证

-   **转换**：如果数据为 CSV、JSON 或 Parquet 格式，请使用
    `scripts/prepare_dataset.py` 进行转换。
-   **验证集拆分确认**：如果用户只提供训练数据集，**你必须提示用户**
    征求其许可，将训练数据集按 90/10 拆分以形成验证数据集（使用
    `--validation_split 0.1`）。如果用户同意，则进行拆分。如果用户
    拒绝，则仅使用训练数据集，不使用验证数据集。**不要**提供 80/20 的拆分选项；
    出于
    [数据准备指南](references/data_prep.md#sizing-the-validation-split)
    中给出的原因，调优服务会拒绝该选项。
-   **验证**：如果数据已经是 JSONL 格式，请在上传前验证它。
    仅具有 `.jsonl` 扩展名并不足够。你必须确认内容模式对调优有效
    （例如，正确的 system/user/model 角色）。

```bash
python3 scripts/prepare_dataset.py \
    --input my_data.jsonl \
    --format <messages|messages_gemini> \
    --validate_only
```

*（对开放模型使用 `--format messages`，对
Gemini 模型使用 `--format messages_gemini`。）* - 有关所需模式，请参阅[数据准备指南](references/data_prep.md)。

### 1.2 上传

将格式化后的 `.jsonl` 文件上传到 GCS，并使用唯一目录（例如，使用
日期时间戳），以避免覆盖不同运行产生的输出。

```bash
ARTIFACTS="gs://YOUR_BUCKET/tuning_agent_job_<datetime>/dataset.jsonl"
gcloud storage cp dataset.jsonl "$ARTIFACTS"
```

## 阶段 2：模型配置与推荐 {#phase-2}

帮助用户选择最佳模型和参数。**在提交作业前，始终征求用户确认。**

-   如果用户未在其提示中指定特定模型，请根据**模型目录**计算
    推荐。
-   **提示确认：** 向用户展示推荐的模型，并在配置超参数前
    请求其确认。

### 2.1 配置

#### 对于开放模型

-   根据[调优指南](references/tuning_guide.md)以及
    [模型目录](references/models.md)中的模型专属基线，推荐 `tuning_mode`、
    `epochs`、`learning_rate` 和 `adapter_size`。

#### 验证实时模型 ID

提交作业前，运行 `scripts/list_models.py`，并且仅从其 `models` 输出中选择
`--base_model`。不要自行编造 ID 或版本号。

```bash
python3 scripts/list_models.py --project YOUR_PROJECT --filter gemini
```

输出：`{"models": [...], "total_count": N, "truncated": bool}`。

-   对于 Gemini，去除 `google/` 和 `@default`（例如，
    `google/gemini-2.5-flash@default` → `gemini-2.5-flash`）；对于开放模型，
    原样传递 `publisher/family@version`。
-   跳过以 `-embedding`、`-tts`、`-image`、
    `-computer-use` 或 `-native-audio` 结尾的 Gemini 变体；它们不可调优。
-   如果 `truncated` 为 `true`，请使用更精确的 `--filter`（例如
    `gemini-2.5`）重新运行，然后再判定目标版本不可用。
-   如果 `models` 为空，停止并询问用户。

### 2.2 计算成本（仅限开放模型）

-   我们可以根据数据集以及在[模型目录](references/models.md)中选择的模型，粗略估算调优成本：

    ```bash
    python3 scripts/calculate_cost.py \
        --input my_data.jsonl \
        --model MODEL_NAME \
        --tuning_mode TUNING_MODE \
        --epochs epochs
    ```

    `--model` 接受显示名称（`Qwen 3 8B`），或者传递给 `--base_model` 的同一资源名称（`qwen/qwen3@qwen3-8b`），因此可以直接复用步骤 2.1 中选择的值。

> [!NOTE] **处理缺少数据集错误：** 如果 `scripts/calculate_cost.py`
> 因找不到数据集文件（例如 `my_data.jsonl` 或 `dummy_data.jsonl`）而失败，
> 你**必须**告知用户数据集文件不存在或无法访问。你**必须**提示用户提供有效的
> 数据集路径，并立即停止工具执行以等待其回复。**不要**重试或循环，**不要**编造具体的成本数字，
> 并且在从用户处收到有效数据集之前，**不要**提示用户批准提交作业。

-   **请求确认：** 向用户展示推荐的超参数配置和预估成本，并在继续提交作业之前请求其批准。务必说明预估成本仅为估算，可能与实际计费成本有所不同。

## 阶段 3：调优作业执行 {#phase-3-tuning-job-execution}

**关键飞行前检查（GCS 验证）：** 在提出确认提示或提交任何调优作业之前，你**必须**验证指定的训练数据集 GCS URI（例如 `gs://dummy_bucket/dataset.jsonl` 或 `gs://YOUR_BUCKET/...`）确实存在且可访问。运行 `gcloud storage
ls $DATASET_URI`（或 `gsutil ls`）。

*   **如果验证失败**（例如 `BucketNotFound`、`404`、`AccessDenied`，或表明存储桶为虚拟/缺失存储桶），你**必须**告知用户 GCS 存储桶或数据集不存在或无法访问。你**必须**提示用户为数据集提供有效的 GCS URI，并立即停止工具执行以等待其回复。在从用户处收到有效的数据集 URI 之前，**不要**提出确认提示，且**不要**执行任何调优脚本。
*   **如果验证成功**，则继续提出以下确认提示。

### 对于 Gemini 模型

检查 `scripts/tune_gemini_model.py` 是否存在。

-   **如果 `scripts/tune_gemini_model.py` 存在：** 使用此脚本提交 Gemini 模型调优作业。

    ```bash
    python3 scripts/tune_gemini_model.py
    ```

-   **如果 `scripts/tune_gemini_model.py` 不存在：** 指导用户通过 Google Cloud Console UI 或使用 Python 的 Agent Platform SDK 手动配置并提交调优作业。

### 对于开放模型

使用 `scripts/tune_open_model.py` 提交开放模型调优作业。通过以下位置的可用模型文档识别模型 ID：
[文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/open-model-tuning#supported-models)。

`--base_model` 接受的是发布方模型**资源名称**
（`{publisher}/{model_id}@{version_id}`），而不是目录中显示的名称。有关格式、
已验证示例以及如何查找你没有的名称，请参阅 `references/models.md` 中的“模型资源名称格式”。

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

此脚本仅适用于开放模型；如果省略 `--location`，则会回退为 `global`。始终显式传入用户在第 0.2 节确认的位置，
以便该位置在你提交供审批的命令字符串中可见。

> [!WARNING] **开放模型必须提供 `--output_uri`。** Python SDK
> 将其声明为 `output_uri: Optional[str] = None`，但调优后端会拒绝未提供它的开放模型作业，并返回
> `INVALID_ARGUMENT: The output_uri
> field is required for this model.`。在这里应将 SDK 的“可选”签名视为错误，并始终传入 GCS 目标位置。

由于该标志是必需的，因此你必须在提交之前确定调优后的模型写入到何处。**绝不能编造存储桶名称、根据项目编号推导名称，
或未经提示便运行 `gcloud storage buckets create`。** 创建存储桶是一项变更操作，并且受下方 Tier M 确认策略的约束。

-   **用户指定了存储桶或 URI** → 使用它，并按第 1.2 节所述追加一个每作业唯一的目录。
-   **第 1.2 节中已将某个存储桶用于数据集上传** → 建议将其复用于输出，并要求用户确认。
-   **两者皆非** → **停止并询问用户**希望将调优后的模型存储在何处。将为他们创建存储桶作为选项之一提供。如果他们接受，
    提议确切的存储桶名称和位置，获得明确确认后，才创建它。

> [!IMPORTANT] **需要交互式确认（Tier M）：** 在继续提交作业之前，你**必须**在确认提示中向用户展示包含
> 所有字面标志的拟议命令字符串，并提供“是”和“否”选项。

> **关键：** 向用户展示此确认提示时，你必须将其作为直接的纯文本响应输出，并立即停止工具执行。
> 不要在同一轮中调用任何命令执行或交互式工具，因为意外的工具调用可能会被模拟框架自动回复并导致无限循环。
> 立即让出执行权，等待用户回复。

## 阶段 4：监控 {#phase-4-monitoring}

通过脚本输出中提供的 Cloud Console 链接监控作业。`--location` 是必需的，并且必须与提交时使用的位置相同：
即使工作实际上在后台的真实区域中运行，提交到 `global` 的开放模型作业也要使用 `--location global` 进行轮询。

此外，询问用户是否希望你在后台为其监控作业状态。如果他们同意，请将 `scripts/monitor_tuning_job.py` 作为后台任务执行，定期轮询作业状态并通知用户以显示状态。如果用户拒绝，则完全由用户自行检查状态。

## 阶段 5：模型部署 {#phase-5-model-deployment}

调优作业 `SUCCEEDED` 后，部署模型。

部署需要真实区域——此处 `--region=global` 无效。如果作业在 `global` 上运行，请从已调优模型的资源名称（`projects/.../locations/<REGION>/models/...`）中读取区域并在那里部署；不要猜测。

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

> [!IMPORTANT] **需要交互式确认（Tier M）：** 在继续部署之前，你**必须**在确认提示中向用户展示包含所有字面量标志的建议命令字符串，并提供“是”和“否”选项。

> **关键：** 向用户展示此确认提示时，你**必须**将其作为直接的纯文本响应输出，并立即停止工具执行。请勿在同一轮中调用任何命令执行或交互式工具，因为意外的工具调用可能会被模拟工具自动回复，从而导致无限循环。立即让出以等待用户回复。

有关特定开放模型的硬件建议，请参阅[模型目录](references/models.md)。

## 资源

-   [数据准备指南](references/data_prep.md)
-   [模型目录](references/models.md)
-   [调优指南](references/tuning_guide.md)
-   `scripts/prepare_dataset.py`：数据转换与验证。
-   `scripts/tune_open_model.py`：开放模型调优作业提交。