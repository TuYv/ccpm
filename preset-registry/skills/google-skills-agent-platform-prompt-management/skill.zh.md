---
name: agent-platform-prompt-management
metadata:
  category: AiAndMachineLearning
description: >-
  Manages and orchestrates prompts in Agent Platform. Use when you need to create,
  list, retrieve, version, or delete managed prompts in Agent Platform. Don't use
  for model training, model deployment to endpoints, or managing non-Agent Platform
  prompts.
---
## 使用指南

要有效使用此技能：

1.  **生成代码**：向用户提供以下 Python 代码片段，帮助他们在 Agent Platform 中
    管理提示词。

2.  **不要搜索文件系统**：不要尝试在文件系统中查找用于执行这些操作的 Python
    文件或脚本。

## 安全与确认级别（关键）

在代表用户执行任何命令或脚本之前，你必须根据所请求的操作遵循
以下安全级别，以防止提示词资源被意外修改或永久删除：

1.  **R 级：只读（`list`、`get`）**
    *   无需确认。立即执行以收集信息。
2.  **M 级：可变更且可逆（`create`）**

    *   执行提示词创建之前，需要通过“Yes”/“No”选项进行**交互式确认**，
        以防止无意中创建过多资源或错误配置。确认提示必须清楚说明
        拟创建的提示词及其关键参数（例如显示名称、
        模板文本、目标模型）。未指定参数的自然语言转述
        不足以作为确认。
    *   **同轮限制**：不得在给出确认提示的同一轮中
        执行创建代码。请停止并等待用户回复；只有在获得明确的“Yes”或批准后
        才能执行。
    *   **标准示例**：

        > 我将在 Agent Platform 中使用以下参数创建一个提示词。
        > 在继续操作之前，请确认以下信息：
        >
        > *   **显示名称**：`Customer Support Greeting`
        > *   **目标模型**：`gemini-2.5-pro`
        > *   **模板文本**："Hello {{user_name}}, how can I help..."
        >
        > 你确认吗？[Yes/No]

3.  **D 级：破坏性且不可逆（`delete`）**

    *   执行提示词删除之前，需要用户进行**明确的文字确认**（例如“I confirm”或“Yes,
        delete it”），以防止生产环境中的提示词资产被意外
        永久删除。在进行任何预检之前请求确认。
    *   **同轮限制**：绝不能在请求文字确认的同一轮中执行。
        等待用户在新一轮中回复。
    *   **标准示例**：

        > 我将从 Agent Platform 中永久删除以下提示词。
        > 此操作不可逆。在继续操作之前，请明确输入确认内容
        >（例如“I confirm”）：
        >
        > *   **提示词 ID**：`prompt_12345abc`
        > *   **显示名称**：`Legacy Outdated Prompt`
        >
        > 请输入确认内容以继续。

## 阶段 0：环境设置

**关键**：在用户运行以下任何 Python 代码片段之前，你必须
建议他们按照以下步骤确保环境已正确初始化：

1.  **Google Cloud 身份验证**：使用你的 Google Cloud 账号进行身份验证，
    并配置有效的应用默认凭据（ADC），以访问 Agent
    Platform：

```bash
    gcloud auth login
    gcloud auth application-default login
    ```

2.  **Python 依赖项**：此技能需要 `google-cloud-aiplatform` 和
    `google-genai`。**不要**创建虚拟环境——虚拟环境初始为空，
    并且会隐藏当前环境已经提供的软件包，从而导致不必要的重复
    安装。请先探测，并仅安装缺失的依赖项：

    ```bash
    python3 -c "import vertexai, google.genai" \
      || pip install google-cloud-aiplatform google-genai
    ```

3.  **执行**：使用普通的 `python3` 运行 Python 代码片段。无需先
    激活任何环境。

> [!TIP]
>
> **占位符参数替换：**以下 Python 脚本使用大写字符串占位符
> （例如 `"PROJECT_ID"`、`"LOCATION_ID"` 和 `"PROMPT_ID"`）。
> 在生成或提供脚本之前，你**必须**使用用户提示中提供的（或从上下文中发现的）
> 实际项目 ID、区域和提示词 ID 值动态替换这些占位符。

## 1. 通过 Agent Platform SDK 管理提示词

该 SDK 在预览模块中提供了高级 `Prompt` 类。

### 创建提示词（M 级）

需要在 Agent Platform 中创建新的托管提示词时使用。

*   **参考资料**：有关详细说明和 Python 代码片段，请参阅
    [create.md](references/create.md)。

### 列出提示词（R 级）

```python
import vertexai
from vertexai.preview import prompts

vertexai.init(project="PROJECT_ID", location="LOCATION_ID")

all_prompts = prompts.list()
for p in all_prompts:
    print(f"Name: {p.display_name}, ID: {p.prompt_id}")
```

### 检索并使用提示词（R 级）

```python
import vertexai
from vertexai.preview import prompts

vertexai.init(project="PROJECT_ID", location="LOCATION_ID")

retrieved_prompt = prompts.get(prompt_id="PROMPT_ID")
# Versions are supported: prompts.get(prompt_id="PROMPT_ID", version_id="2")

# Assemble with variables (kwargs must match template variable names)
assembled = retrieved_prompt.assemble_contents(text="The quick brown fox...")
print(assembled)
```

### 删除提示词（D 级）

**关键要求**：必须将数字提示词 ID（例如
`"1234567890123456789"`）传递给 `prompts.delete()`。SDK 会使用
`vertexai.init()` 中的项目和位置，在内部构建完整的资源路径。

**需要确认**：作为 D 级（破坏性）操作，智能体在生成或提供删除代码之前，
必须暂停并要求用户明确地再次手动输入提示词 ID 进行高强度确认。此操作
不可逆。

> [!IMPORTANT]
>
> **在新的轮次中收到用户回复之前，绝不要提前提供或执行任何删除代码。**
> 绝不能推测或假定用户会予以确认。在同一并行轮次中请求确认并提供代码，
> 属于严重的安全违规行为。

```python
import vertexai
from vertexai.preview import prompts

vertexai.init(project="PROJECT_ID", location="LOCATION_ID")

prompts.delete(prompt_id="PROMPT_ID")
```

## 2. 最佳实践

-   **幂等性**：
    *   **Tier R**（List、Get）：本身具有幂等性。
    *   **Tier D**（Delete）：对不存在或已删除的资源重新执行删除操作会返回 NOT_FOUND。应将其视为成功。
-   **占位符**：在提示模板中使用标准占位符语法（变量名用双花括号括起来）。
-   **版本控制**：更新生产环境中的提示时，始终标记或记录版本 ID。
-   **模型引用**：创建提示时指定目标模型 ID（例如 `gemini-2.5-pro`），以确保一致性。
-   **底层架构**：使用 Dataset API 时，始终使用正确的
    `metadata_schema_uri` 和嵌套的 `metadata` 结构，以确保 Agent Platform Studio 和 Prompts SDK
    能够识别该提示。