---
name: agent-platform-rag-engine-management
metadata:
  category: AiAndMachineLearning
description: >-
  Manage and query Agent Platform RAG Engine Corpora and retrieve grounded
  contexts using the Google GenAI SDK. Use when listing RAG corpora or files,
  inspecting a corpus, retrieving contexts, or generating content grounded in a
  RAG corpus. Do not use for standard database queries (use SQL/Spanner skills),
  Google Workspace RAG, or other RAG products like gRAG.
---
# Agent Platform RAG Engine 管理

此技能提供有关如何使用 Agent Platform Python SDK 与 Agent Platform RAG Engine 交互的说明。你必须使用 `vertexai` Python SDK 执行 RAG Engine 操作，而不是使用原始 REST 调用或 MCP 工具，因为这些代码旨在由外部客户端运行。

## 安全与确认级别（关键）

在代表用户执行任何命令或脚本之前，你必须根据所请求的操作遵循以下安全级别：

1.  **级别 R：只读（`list_corpora`、`list_files`、`get_corpus`、`retrieval_query`）**
    *   无需确认。立即执行以收集信息或检索有依据的上下文。
2.  **级别 RC：只读但会消耗计算资源（`client.models.generate_content`）**
    *   在执行有依据的内容生成之前，需要通过提供 'Yes'/'No' 选项进行**交互式确认**。确认提示必须清楚说明拟执行的生成操作及其关键参数（例如目标语料库 ID、查询文本、目标模型）。未指定确切参数的自然语言转述并不充分，因为必须明确列出参数，以确保用户对特定资源和配置给予无歧义的批准。
    *   **同一轮次限制**：不得在展示确认提示的同一轮次中执行生成代码。请停止并等待用户回复；只有在收到明确的 'Yes' / 批准后才能执行。
    *   **黄金标准示例**：
        > 我将使用以下参数执行有依据的内容生成。请在我继续之前确认这些信息：
        > *   **目标语料库 ID**：`projects/123/locations/us/ragCorpora/abc`
        > *   **目标模型**：`gemini-2.5-pro`
        > *   **查询文本**："公司的远程办公政策是什么？"
        > 是否确认？[Yes/No]

## 阶段 0：环境设置

**关键**：在运行下面的任何 Python 代码片段之前，你必须按照以下步骤确保环境已正确初始化：

1.  **Google Cloud 身份验证**：使用你的 Google Cloud 凭据进行身份验证，并为 Agent Platform 访问配置有效的应用默认凭据（ADC）：
    
    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```
2.  **虚拟环境**：创建并激活专用虚拟环境：
    
    ```bash
    python3 -m venv ~/rag_agent_venv
    source ~/rag_agent_venv/bin/activate
    ```
3.  **安装依赖项**：安装所需的 Agent Platform SDK：
    
    ```bash
    pip install google-cloud-aiplatform google-genai
    ```
4.  **执行**：提醒用户，每次执行 Python 代码片段时，都必须先确保此虚拟环境已激活。

## 工作流决策树

1.  **信息收集**：用户是否已提供项目 ID、区域和语料库 ID？

*   **否** -> 前往 [1. 列出语料库和文件]，以发现所需的资源名称和 ID。仅当发现失败时才询问用户。
    *   **是** -> 继续。

2.  **任务类型**：用户想要做什么？

    *   **列出语料库和文件** -> 前往 [1. 列出语料库和文件]。
    *   **检查语料库** -> 前往 [2. 获取/检查 RAG Engine
        语料库]。
    *   **搜索上下文** -> 前往 [3. 检索上下文]。
    *   **使用 RAG Engine 回答问题** -> 前往 [4. 使用检索到的上下文
        回答用户]。

> [!TIP] **占位符参数替换：** 以下 Python 脚本使用了
> 带方括号的字符串占位符（例如 `"{project_id}"`、`"{region}"` 和
> `"{corpus_id}"`）。在生成、提供或执行脚本之前，你**必须**使用
> 用户提示（或当前上下文）中提供的实际 Project ID、Region 和 Corpus ID 值
> 动态替换这些占位符。

## 1. 列出语料库和文件（发现）

如果你不知道语料库或文件的资源名称，则必须先将其列出
以发现它们。转换为列表时，SDK 会自动处理分页，
但对于大型数据集，你也可以使用手动分页。

### 1.1 列出和发现语料库

```python
import vertexai
from vertexai.preview import rag

vertexai.init(project="{project_id}", location="{region}")

# Approach A: List ALL (Automatic Pagination)
# The SDK's Pager iterates through all pages for you.
all_corpora = list(rag.list_corpora())
print(f"Found {len(all_corpora)} corpora in total.")
for c in all_corpora:
    print(f"Corpus Name: {c.name} | Display Name: {c.display_name}")

# Approach B: Manual Pagination (for very large projects)
pager = rag.list_corpora(page_size=10)
# Process first page
for c in pager:
    print(f"Corpus: {c.display_name}")

# Get next page if needed
if pager.next_page_token:
    second_page = rag.list_corpora(
        page_size=10, page_token=pager.next_page_token
    )
```

### 1.2 列出和发现文件

要了解语料库中包含哪些文件（及其类型），请将它们列出并检查
`display_name`（通常包含扩展名）。

```python
import vertexai
from vertexai.preview import rag

vertexai.init(project="{project_id}", location="{region}")
corpus_name = (
    "projects/{project_id}/locations/{region}/ragCorpora/{corpus_id}"
)

# List files with automatic pagination
files = list(rag.list_files(corpus_name=corpus_name))
print(f"Found {len(files)} files.")

for f in files:
    # High-level SDK RagFile objects usually have name, display_name,
    # description
    print(f"File: {f.display_name} | Resource: {f.name}")
    # Tip: Check extension to understand file type (PDF, TXT, etc.)
    if f.display_name.lower().endswith(".pdf"):
        print("  Type: PDF")
    elif f.display_name.lower().endswith(".txt"):
        print("  Type: Plain Text")
```

## 2. 获取/检查 Agent Platform RAG Engine 语料库

要检索现有 Agent Platform RAG Engine 语料库的详细信息：

```python
import vertexai
from vertexai.preview import rag

vertexai.init(project="{project_id}", location="{region}")

# To get details of a specific corpus
corpus_name = (
    "projects/{project_id}/locations/{region}/ragCorpora/{corpus_id}"
)
corpus = rag.get_corpus(name=corpus_name)
print(f"Corpus Name: {corpus.name}")
print(f"Display Name: {corpus.display_name}")
```

## 3. 检索上下文

要根据查询从 RAG Engine 语料库中检索相关上下文：

```python
import vertexai
from vertexai.preview import rag

vertexai.init(project="{project_id}", location="{region}")

corpus_name = (
    "projects/{project_id}/locations/{region}/ragCorpora/{corpus_id}"
)
query = "What is the speed of light?"

# Retrieve contexts
response = rag.retrieval_query(
    rag_corpora=[corpus_name],
    text=query,
    similarity_top_k=3
)

for context in response.contexts.contexts:
    print(f"Context text: {context.text}")
    print(f"Source: {context.source_uri}")
```

## 4. 使用检索到的上下文回答用户

要将检索到的上下文与 Agent Platform 模型结合使用，以生成有依据的响应：

```python
from google import genai
from google.genai import types

client = genai.Client(enterprise=True, project="{project_id}", location="{region}")
corpus_name = (
    "projects/{project_id}/locations/{region}/ragCorpora/{corpus_id}"
)

# Define the Agent Platform RAG Engine tool pointing to the corpus
rag_tool = types.Tool(
    retrieval=types.Retrieval(
        vertex_rag_store=types.VertexRagStore(
            rag_resources=[types.VertexRagStoreRagResource(rag_corpus=corpus_name)],
            rag_retrieval_config=types.RagRetrievalConfig(
                top_k=3,
                filter=types.RagRetrievalConfigFilter(
                    vector_similarity_threshold=0.5,
                ),
            ),
        )
    )
)

# Generate content using the RAG Engine tool
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What is the speed of light?",
    config=types.GenerateContentConfig(
        tools=[rag_tool]
    )
)
print(response.text)
```