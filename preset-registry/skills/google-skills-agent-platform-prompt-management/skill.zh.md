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

要有效使用此 skill：

1.  **通过 Python 执行操作**：使用执行环境中的
    `run_command` 运行下面的 Python 代码片段，代表用户在 Agent
    Platform 中管理 prompts。获得批准后，不要将执行委托给用户，也不要声称无法访问。

2.  **禁止搜索文件系统**：不要尝试在文件系统中查找用于这些操作的
    Python 文件或脚本。

## 安全与确认级别（重要）

在代表用户执行任何命令或脚本之前，必须根据所请求的操作遵守以下安全级别，以防止 prompt 资源被意外修改或永久删除：

1.  **级别 R：只读（`list`、`get`）**
    *   无需确认。立即执行以收集信息。
2.  **级别 M：可变更且可逆（`create`）**

    *   在执行 prompt 创建之前，需要通过交互方式提供带有“Yes”/“No”选项的确认，以防止意外创建资源或错误配置。确认提示必须清楚说明计划创建的 prompt 及其关键参数（例如显示名称、模板文本、目标模型）。仅使用未具体说明参数的自然语言转述是不够的。
    *   **同轮限制**：不得在展示确认提示的同一轮中执行创建代码。停止并等待用户回复；只有在用户明确回复“Yes”/批准后才能执行。
    *   卡片中的每个参数都必须能追溯到用户明确说过的内容。目标模型由用户选择，不能使用默认值：如果用户未指定模型，必须先询问，然后才能构建卡片。不要沿用此处示例或 `references/create.md` 中出现的模型。
    *   **标准示例**：对于这样一位用户：“为 `gemini-2.5-pro` 创建一个名为 Customer Support Greeting 的 prompt，模板为 Hello {{user_name}}, how can I help...”：

        > 我将使用以下参数在 Agent Platform 中创建一个 prompt。请先确认这些信息，然后我再继续：
        >
        > *   **显示名称**：`Customer Support Greeting`
        > *   **目标模型**：`gemini-2.5-pro`
        > *   **模板文本**："Hello {{user_name}}, how can I help..."
        >
        > 是否确认？[Yes/No]

3.  **级别 D：破坏性且不可逆（`delete`）**

    *   在执行 prompt 删除之前，需要明确的文字确认（例如“I confirm”或“Yes, delete it”），以防止生产环境中的 prompt 资源被意外永久丢失。在进行任何预检之前，先请求确认。
    *   **同轮限制**：绝不能在请求文字确认的同一轮中执行操作。等待用户在新一轮中回复。
    *   **标准示例**：

        > 我将从 Agent Platform 中永久删除以下 prompt。
        > 此操作不可逆。请明确输入确认内容（例如“I confirm”）后，我再继续：
        >
        > *   **Prompt ID**：`prompt_12345abc`
        > *   **显示名称**：`Legacy Outdated Prompt`
        >
        > 请键入确认内容以继续。

## 阶段 0：环境设置

**关键**：在用户运行下面的任何 Python 代码片段之前，**必须**
建议其按照以下步骤确保环境已正确初始化：

1.  **Google Cloud 身份验证**：使用 Google Cloud 账号进行身份验证，
    并为 Agent
    Platform 访问配置有效的 Application Default Credentials (ADC)：

    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```

2.  **Python 依赖项**：此 skill 需要 `google-cloud-aiplatform` 和
    `google-genai`。**不要创建虚拟环境**，因为虚拟环境一开始为空，
    并且会隐藏环境中已经提供的软件包，导致重复安装。请进行探测，只安装缺失的软件包：

    ```bash
    python3 -c "import vertexai, google.genai" \
      || pip install google-cloud-aiplatform google-genai
    ```

3.  **执行**：使用普通的 `python3` 运行 Python 代码片段。无需先激活任何环境。

> [!TIP]
>
> **占位参数替换：**下面的 Python 脚本使用大写字符串占位符（例如 `"PROJECT_ID"`、`"LOCATION_ID"`、`"PROMPT_ID"` 和 `"MODEL_ID"`）。在生成或提供脚本之前，**必须**根据用户提示中提供的实际 Project ID、Region、Prompt ID 和目标模型值（或从上下文中发现的值）动态替换这些占位符。如果用户未提供其中某个值，请询问用户，不能通过猜测合理的值来满足占位符要求。

## 1. 通过 Agent Platform SDK 管理 Prompts

SDK 在 preview 模块中提供了高级 `Prompt` 类。

### 创建 Prompt（Tier M）

当需要在 Agent Platform 中创建新的托管 prompt 时使用。

*   **参考**：详细说明和 Python 代码片段请参阅 [create.md](references/create.md)。

### 列出 Prompts（Tier R）

```python
import vertexai
from vertexai.preview import prompts

vertexai.init(project="PROJECT_ID", location="LOCATION_ID")

all_prompts = prompts.list()
for p in all_prompts:
    print(f"Name: {p.display_name}, ID: {p.prompt_id}")
```

### 获取并使用 Prompt（Tier R）

```python
import vertexai
from vertexai.preview import prompts

vertexai.init(project="PROJECT_ID", location="LOCATION_ID")

retrieved_prompt = prompts.get(prompt_id="PROMPT_ID")
# Attributes on retrieved Prompt:
# - retrieved_prompt.prompt_id (e.g. "123456789...")
# - retrieved_prompt.prompt_data (template text string)
# - retrieved_prompt.model_name (target model)
# - retrieved_prompt.prompt_name (display name, or
#   retrieved_prompt._dataset.display_name)
# Versions are supported: prompts.get(prompt_id="PROMPT_ID", version_id="2")

# Assemble with variables (kwargs must match template variable names)
assembled = retrieved_prompt.assemble_contents(text="The quick brown fox...")
print(assembled)
```

### 删除 Prompt（Tier D）

**关键**：必须将数字形式的 prompt ID（例如
`"1234567890123456789"`）传递给 `prompts.delete()`。SDK 会使用 `vertexai.init()` 中的项目和位置，在内部构造完整的资源路径。

**需要确认**：作为 Tier D（破坏性）操作，代理在执行删除代码之前，**必须**暂停并请求用户以高门槛方式手动输入提示 ID 进行再次确认。该操作不可逆。
用户回复手动确认（例如“I confirm”）后，立即通过 `run_command` 执行删除代码。

> [!IMPORTANT]
>
> **在收到用户于新回合中的回复之前，绝 NEVER 预先执行任何删除代码。** 不得推测或假定用户会进行确认。在同一个并行回合中请求确认并运行代码属于严重的安全违规行为。

```python
import vertexai
from vertexai.preview import prompts

vertexai.init(project="PROJECT_ID", location="LOCATION_ID")

prompts.delete(prompt_id="PROMPT_ID")
```

### 删除后的验证

当用户要求列出提示或检查某个已删除的提示是否已不存在时，列出提示，并明确说明已删除的提示 ID 是否存在。如果未找到，请明确确认：*“我已验证，ID 为 `<PROMPT_ID>` 的提示已不再存在于该项目中。”*

## 2. 最佳实践

-   **幂等性**：
    *   **Tier R**（List、Get）：本身具有幂等性。
    *   **Tier D**（Delete）：对不存在或已删除的资源重复执行删除会返回 NOT_FOUND。将其视为成功。
-   **占位符**：在提示模板中使用标准占位符语法（将变量名放在双花括号中）。
-   **版本控制**：更新生产环境提示时，始终标记或记录版本 ID。
-   **模型引用**：提示是针对目标模型 ID 创建的，代码片段将其作为 `"MODEL_ID"` 占位符传递。与其他占位符一样，它是必须替换的，并且应根据用户所述内容进行替换。如果用户没有指定模型，请询问。不要替换为看似合理的当前模型，例如 `gemini-2.5-pro`。
-   **底层架构**：使用 Dataset API 时，始终使用正确的 `metadata_schema_uri` 和嵌套的 `metadata` 结构，以确保 Agent Platform Studio 和 Prompts SDK 能够识别该提示。