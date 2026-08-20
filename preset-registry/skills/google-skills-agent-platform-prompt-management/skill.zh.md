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

1.  **生成代码**：向用户提供以下 Python 代码片段，帮助
    他们在 Agent Platform 中管理提示词。

2.  **不得搜索文件系统**：请勿尝试在
    文件系统中查找用于这些操作的 Python 文件或脚本。

## 安全与确认分级（关键）

在代表用户执行任何命令或脚本之前，必须根据所请求的操作遵循
以下安全分级，以防止提示词资源被意外修改或永久删除：

1.  **R 级：只读（`list`、`get`）**
    *   无需确认。立即执行以收集信息。
2.  **M 级：可修改且可撤销（`create`）**

    *   在执行提示词创建之前，必须提供带有“是”/“否”选项的**交互式确认**，
        以防止意外的资源泛滥
        或配置错误。确认提示必须清楚说明拟议创建的
        提示词及其关键参数（例如显示名称、
        模板文本、目标模型）。未指定参数的自然语言转述并不足够。
    *   **同一轮次限制**：不得在呈现确认提示的同一
        轮次中执行创建代码。停止并等待用户的
        回复；仅在获得明确的“是”/批准后执行。
    *   卡片中的每个参数都必须能够追溯到用户所说的内容。
        目标模型是用户的选择，而不是默认值：如果用户未
        指定模型，请在构建卡片之前询问。不得沿用此处示例中
        或 `references/create.md` 中出现的模型。
    *   **黄金标准示例**——对于说“为 gemini-2.5-pro 创建一个名为
        Customer Support Greeting 的提示词，模板为 Hello
        {{user_name}}, how can I help...”的用户：

        > 我将在 Agent Platform 中使用以下
        > 参数创建提示词。请在我继续之前确认这些信息：
        >
        > *   **显示名称**：`Customer Support Greeting`
        > *   **目标模型**：`gemini-2.5-pro`
        > *   **模板文本**："Hello {{user_name}}, how can I help..."
        >
        > 是否确认？[是/否]

3.  **D 级：破坏性且不可逆（`delete`）**

    *   在执行提示词删除之前，必须获得**明确的文本输入确认**（例如“我确认”或“是，
        删除它”），以防止意外
        永久丢失生产环境的提示词资产。在执行任何预检之前
        请求确认。
    *   **同一轮次限制**：在请求文本输入确认的同一轮次中，绝不要执行。
        等待用户在新的轮次中回复。
    *   **黄金标准示例**：

        > 我将从 Agent Platform 中永久删除以下提示词。
        > 此操作不可逆。请在我继续之前明确输入你的确认
        > （例如“我确认”）：
        >
        > *   **提示词 ID**：`prompt_12345abc`
        > *   **显示名称**：`Legacy Outdated Prompt`
        >
        > 请键入你的确认以继续。

## 阶段 0：环境设置

**关键**：在用户运行下面任何 Python 代码片段之前，你**必须**
建议他们按照以下步骤确保环境已正确初始化：

1.  **Google Cloud 身份验证**：使用你的 Google Cloud 账号进行身份验证，
    并为 Agent Platform 访问配置有效的应用默认凭据 (ADC)：

    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```

2.  **Python 依赖项**：此技能需要 `google-cloud-aiplatform` 和
    `google-genai`。**不要**创建虚拟环境——它一开始是空的，并且会隐藏环境已经提供的包，
    从而迫使进行冗余安装。先探测，并且仅安装缺失的包：

    ```bash
    python3 -c "import vertexai, google.genai" \
      || pip install google-cloud-aiplatform google-genai
    ```

3.  **执行**：使用普通的 `python3` 运行 Python 代码片段。无需先激活任何环境。

> [!TIP]
>
> **占位符参数替换：** 以下 Python 脚本使用大写字符串占位符
> （例如 `"PROJECT_ID"`、`"LOCATION_ID"`、`"PROMPT_ID"` 和
> `"MODEL_ID"`）。在生成或提供这些脚本之前，你**必须**将这些占位符动态替换为
> 用户提示中提供的（或从已发现的上下文中获取的）实际项目 ID、区域、提示 ID 和目标模型值。
> 如果用户未提供其中之一，请询问——不得通过猜测貌似合理的值来满足占位符。

## 1. 通过 Agent Platform SDK 管理提示

SDK 在预览模块中提供了一个高级 `Prompt` 类。

### 创建提示（Tier M）

当你需要在 Agent Platform 中创建新的托管提示时使用。

*   **参考：** 有关详细说明和 Python 代码片段，请参阅 [create.md](references/create.md)。

### 列出提示（Tier R）

```python
import vertexai
from vertexai.preview import prompts

vertexai.init(project="PROJECT_ID", location="LOCATION_ID")

all_prompts = prompts.list()
for p in all_prompts:
    print(f"Name: {p.display_name}, ID: {p.prompt_id}")
```

### 检索并使用提示（Tier R）

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

### 删除提示（Tier D）

**关键**：你必须将数字提示 ID（例如
`"1234567890123456789"`）传递给 `prompts.delete()`。SDK 会使用
`vertexai.init()` 中的项目和位置在内部构建完整资源路径。

**需要确认**：作为 Tier D（破坏性）操作，代理在生成或提供删除代码之前，**必须**
暂停并要求用户以明确、高摩擦的输入方式再次确认提示 ID。该操作不可逆。

> [!IMPORTANT]
>
> **在收到用户在新一轮对话中的回复之前，绝不要抢先提供或执行任何删除代码。** 你绝不能推测或假定用户会给予确认。在同一个并行轮次中请求确认并提供代码，属于严重的安全违规。

```python
import vertexai
from vertexai.preview import prompts

vertexai.init(project="PROJECT_ID", location="LOCATION_ID")

prompts.delete(prompt_id="PROMPT_ID")
```

## 2. 最佳实践

-   **幂等性**：
    *   **R 层级**（列表、获取）：天然具备幂等性。
    *   **D 层级**（删除）：对不存在或已删除的资源重复执行删除操作会返回 NOT_FOUND。将其视为成功。
-   **占位符**：在提示模板中使用标准占位符语法（变量名包含在双花括号中）。
-   **版本控制**：对生产环境提示进行更新时，始终标记或记录版本 ID。
-   **模型引用**：提示是针对目标模型 ID 创建的，代码片段中使用 `"MODEL_ID"` 占位符表示该 ID。和其他占位符一样，它是必须替换的，且应根据用户所说的内容进行替换——如果用户没有指定模型，请询问。不要擅自替换为看似合理的当前模型，例如 `gemini-2.5-pro`。
-   **底层架构**：使用 Dataset API 时，始终使用正确的 `metadata_schema_uri` 和嵌套的 `metadata` 结构，以确保提示能被 Agent Platform Studio 和 Prompts SDK 识别。