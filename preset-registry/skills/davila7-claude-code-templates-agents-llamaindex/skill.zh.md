---
name: llamaindex
description: Data framework for building LLM applications with RAG. Specializes in document ingestion (300+ connectors), indexing, and querying. Features vector indices, query engines, agents, and multi-modal support. Use for document Q&A, chatbots, knowledge retrieval, or building RAG pipelines. Best for data-centric LLM applications.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Agents, LlamaIndex, RAG, Document Ingestion, Vector Indices, Query Engines, Knowledge Retrieval, Data Framework, Multimodal, Private Data, Connectors]
dependencies: [llama-index, openai, anthropic]
---
# LlamaIndex - 面向 LLM 应用的数据框架

连接 LLM 与你的数据的领先框架。

## 何时使用 LlamaIndex

**在以下情况下使用 LlamaIndex：**
- 构建 RAG（检索增强生成）应用
- 需要基于私有数据进行文档问答
- 从多个来源摄取数据（300+ 个连接器）
- 为 LLM 创建知识库
- 使用企业数据构建聊天机器人
- 需要从文档中提取结构化数据

**指标**：
- **45,100+ GitHub 星标**
- **23,000+ 个代码仓库**使用 LlamaIndex
- **300+ 个数据连接器**（LlamaHub）
- **1,715+ 位贡献者**
- **v0.14.7**（稳定版）

**改用其他方案的情况**：
- **LangChain**：用途更广泛，更适合智能体
- **Haystack**：生产级搜索流水线
- **txtai**：轻量级语义搜索
- **Chroma**：仅需要向量存储

## 快速开始

### 安装

```bash
# Starter package (recommended)
pip install llama-index

# Or minimal core + specific integrations
pip install llama-index-core
pip install llama-index-llms-openai
pip install llama-index-embeddings-openai
```

### 5 行 RAG 示例

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# Load documents
documents = SimpleDirectoryReader("data").load_data()

# Create index
index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine()
response = query_engine.query("What did the author do growing up?")
print(response)
```

## 核心概念

### 1. 数据连接器 - 加载文档

```python
from llama_index.core import SimpleDirectoryReader, Document
from llama_index.readers.web import SimpleWebPageReader
from llama_index.readers.github import GithubRepositoryReader

# Directory of files
documents = SimpleDirectoryReader("./data").load_data()

# Web pages
reader = SimpleWebPageReader()
documents = reader.load_data(["https://example.com"])

# GitHub repository
reader = GithubRepositoryReader(owner="user", repo="repo")
documents = reader.load_data(branch="main")

# Manual document creation
doc = Document(
    text="This is the document content",
    metadata={"source": "manual", "date": "2025-01-01"}
)
```

### 2. 索引 - 组织数据

```python
from llama_index.core import VectorStoreIndex, ListIndex, TreeIndex

# Vector index (most common - semantic search)
vector_index = VectorStoreIndex.from_documents(documents)

# List index (sequential scan)
list_index = ListIndex.from_documents(documents)

# Tree index (hierarchical summary)
tree_index = TreeIndex.from_documents(documents)

# Save index
index.storage_context.persist(persist_dir="./storage")

# Load index
from llama_index.core import load_index_from_storage, StorageContext
storage_context = StorageContext.from_defaults(persist_dir="./storage")
index = load_index_from_storage(storage_context)
```

### 3. 查询引擎 - 提出问题

```python
# Basic query
query_engine = index.as_query_engine()
response = query_engine.query("What is the main topic?")
print(response)

# Streaming response
query_engine = index.as_query_engine(streaming=True)
response = query_engine.query("Explain quantum computing")
for text in response.response_gen:
    print(text, end="", flush=True)

# Custom configuration
query_engine = index.as_query_engine(
    similarity_top_k=3,          # Return top 3 chunks
    response_mode="compact",     # Or "tree_summarize", "simple_summarize"
    verbose=True
)
```

### 4. 检索器 - 查找相关文本块

```python
# Vector retriever
retriever = index.as_retriever(similarity_top_k=5)
nodes = retriever.retrieve("machine learning")

# With filtering
retriever = index.as_retriever(
    similarity_top_k=3,
    filters={"metadata.category": "tutorial"}
)

# Custom retriever
from llama_index.core.retrievers import BaseRetriever

class CustomRetriever(BaseRetriever):
    def _retrieve(self, query_bundle):
        # Your custom retrieval logic
        return nodes
```

## 使用工具的智能体

### 基础智能体

```python
from llama_index.core.agent import FunctionAgent
from llama_index.llms.openai import OpenAI

# Define tools
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b

def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

# Create agent
llm = OpenAI(model="gpt-4o")
agent = FunctionAgent.from_tools(
    tools=[multiply, add],
    llm=llm,
    verbose=True
)

# Use agent
response = agent.chat("What is 25 * 17 + 142?")
print(response)
```

### RAG 智能体（文档搜索 + 工具）

```python
from llama_index.core.tools import QueryEngineTool

# Create index as before
index = VectorStoreIndex.from_documents(documents)

# Wrap query engine as tool
query_tool = QueryEngineTool.from_defaults(
    query_engine=index.as_query_engine(),
    name="python_docs",
    description="Useful for answering questions about Python programming"
)

# Agent with document search + calculator
agent = FunctionAgent.from_tools(
    tools=[query_tool, multiply, add],
    llm=llm
)

# Agent decides when to search docs vs calculate
response = agent.chat("According to the docs, what is Python used for?")
```

## 高级 RAG 模式

### 聊天引擎（对话式）

```python
from llama_index.core.chat_engine import CondensePlusContextChatEngine

# Chat with memory
chat_engine = index.as_chat_engine(
    chat_mode="condense_plus_context",  # Or "context", "react"
    verbose=True
)

# Multi-turn conversation
response1 = chat_engine.chat("What is Python?")
response2 = chat_engine.chat("Can you give examples?")  # Remembers context
response3 = chat_engine.chat("What about web frameworks?")
```

### 元数据过滤

```python
from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter

# Filter by metadata
filters = MetadataFilters(
    filters=[
        ExactMatchFilter(key="category", value="tutorial"),
        ExactMatchFilter(key="difficulty", value="beginner")
    ]
)

retriever = index.as_retriever(
    similarity_top_k=3,
    filters=filters
)

query_engine = index.as_query_engine(filters=filters)
```

### 结构化输出

```python
from pydantic import BaseModel
from llama_index.core.output_parsers import PydanticOutputParser

class Summary(BaseModel):
    title: str
    main_points: list[str]
    conclusion: str

# Get structured response
output_parser = PydanticOutputParser(output_cls=Summary)
query_engine = index.as_query_engine(output_parser=output_parser)

response = query_engine.query("Summarize the document")
summary = response  # Pydantic model
print(summary.title, summary.main_points)
```

## 数据摄取模式

### 多种文件类型

```python
# Load all supported formats
documents = SimpleDirectoryReader(
    "./data",
    recursive=True,
    required_exts=[".pdf", ".docx", ".txt", ".md"]
).load_data()
```

### 网页抓取

```python
from llama_index.readers.web import BeautifulSoupWebReader

reader = BeautifulSoupWebReader()
documents = reader.load_data(urls=[
    "https://docs.python.org/3/tutorial/",
    "https://docs.python.org/3/library/"
])
```

### 数据库

```python
from llama_index.readers.database import DatabaseReader

reader = DatabaseReader(
    sql_database_uri="postgresql://user:pass@localhost/db"
)
documents = reader.load_data(query="SELECT * FROM articles")
```

### API 端点

```python
from llama_index.readers.json import JSONReader

reader = JSONReader()
documents = reader.load_data("https://api.example.com/data.json")
```

## 向量存储集成

### Chroma（本地）

```python
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

# Initialize Chroma
db = chromadb.PersistentClient(path="./chroma_db")
collection = db.get_or_create_collection("my_collection")

# Create vector store
vector_store = ChromaVectorStore(chroma_collection=collection)

# Use in index
from llama_index.core import StorageContext
storage_context = StorageContext.from_defaults(vector_store=vector_store)
index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
```

### Pinecone（云端）

```python
from llama_index.vector_stores.pinecone import PineconeVectorStore
import pinecone

# Initialize Pinecone
pinecone.init(api_key="your-key", environment="us-west1-gcp")
pinecone_index = pinecone.Index("my-index")

# Create vector store
vector_store = PineconeVectorStore(pinecone_index=pinecone_index)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
```

### FAISS（快速）

```python
from llama_index.vector_stores.faiss import FaissVectorStore
import faiss

# Create FAISS index
d = 1536  # Dimension of embeddings
faiss_index = faiss.IndexFlatL2(d)

vector_store = FaissVectorStore(faiss_index=faiss_index)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
```

## 自定义

### 自定义 LLM

```python
from llama_index.llms.anthropic import Anthropic
from llama_index.core import Settings

# Set global LLM
Settings.llm = Anthropic(model="claude-sonnet-4-5-20250929")

# Now all queries use Anthropic
query_engine = index.as_query_engine()
```

### 自定义嵌入模型

```python
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# Use HuggingFace embeddings
Settings.embed_model = HuggingFaceEmbedding(
    model_name="sentence-transformers/all-mpnet-base-v2"
)

index = VectorStoreIndex.from_documents(documents)
```

### 自定义提示词模板

```python
from llama_index.core import PromptTemplate

qa_prompt = PromptTemplate(
    "Context: {context_str}\n"
    "Question: {query_str}\n"
    "Answer the question based only on the context. "
    "If the answer is not in the context, say 'I don't know'.\n"
    "Answer: "
)

query_engine = index.as_query_engine(text_qa_template=qa_prompt)
```

## 多模态 RAG

### 图像 + 文本

```python
from llama_index.core import SimpleDirectoryReader
from llama_index.multi_modal_llms.openai import OpenAIMultiModal

# Load images and documents
documents = SimpleDirectoryReader(
    "./data",
    required_exts=[".jpg", ".png", ".pdf"]
).load_data()

# Multi-modal index
index = VectorStoreIndex.from_documents(documents)

# Query with multi-modal LLM
multi_modal_llm = OpenAIMultiModal(model="gpt-4o")
query_engine = index.as_query_engine(llm=multi_modal_llm)

response = query_engine.query("What is in the diagram on page 3?")
```

## 评估

### 响应质量

```python
from llama_index.core.evaluation import RelevancyEvaluator, FaithfulnessEvaluator

# Evaluate relevance
relevancy = RelevancyEvaluator()
result = relevancy.evaluate_response(
    query="What is Python?",
    response=response
)
print(f"Relevancy: {result.passing}")

# Evaluate faithfulness (no hallucination)
faithfulness = FaithfulnessEvaluator()
result = faithfulness.evaluate_response(
    query="What is Python?",
    response=response
)
print(f"Faithfulness: {result.passing}")
```

## 最佳实践

1. **大多数情况下使用向量索引** - 性能最佳
2. **将索引保存到磁盘** - 避免重新建立索引
3. **合理切分文档** - 512-1024 个 token 为最佳
4. **添加元数据** - 支持筛选和跟踪
5. **使用流式传输** - 为较长的响应提供更好的用户体验
6. **开发期间启用详细输出** - 查看检索过程
7. **评估响应** - 检查相关性和忠实度
8. **使用聊天引擎进行对话** - 内置记忆功能
9. **持久化存储** - 避免丢失索引
10. **监控成本** - 跟踪嵌入和 LLM 使用量

## 常见模式

### 文档问答系统

```python
# Complete RAG pipeline
documents = SimpleDirectoryReader("docs").load_data()
index = VectorStoreIndex.from_documents(documents)
index.storage_context.persist(persist_dir="./storage")

# Query
query_engine = index.as_query_engine(
    similarity_top_k=3,
    response_mode="compact",
    verbose=True
)
response = query_engine.query("What is the main topic?")
print(response)
print(f"Sources: {[node.metadata['file_name'] for node in response.source_nodes]}")
```

### 带记忆功能的聊天机器人

```python
# Conversational interface
chat_engine = index.as_chat_engine(
    chat_mode="condense_plus_context",
    verbose=True
)

# Multi-turn chat
while True:
    user_input = input("You: ")
    if user_input.lower() == "quit":
        break
    response = chat_engine.chat(user_input)
    print(f"Bot: {response}")
```

## 性能基准

| 操作 | 延迟 | 备注 |
|-----------|---------|-------|
| 为 100 个文档建立索引 | ~10-30s | 一次性操作，可持久化 |
| 查询（向量） | ~0.5-2s | 检索 + LLM |
| 流式查询 | 首个 token 约需 ~0.5s | 更好的用户体验 |
| 带工具的智能体 | ~3-8s | 多次工具调用 |

## LlamaIndex 与 LangChain 对比

| 特性 | LlamaIndex | LangChain |
|---------|------------|-----------|
| **最适合** | RAG、文档问答 | 智能体、通用 LLM 应用 |
| **数据连接器** | 300+（LlamaHub） | 100+ |
| **RAG 定位** | 核心功能 | 众多功能之一 |
| **学习曲线** | 对 RAG 更容易 | 更陡峭 |
| **可定制性** | 高 | 非常高 |
| **文档** | 极佳 | 良好 |

**在以下情况下使用 LlamaIndex：**
- 主要用例是 RAG
- 需要大量数据连接器
- 希望使用更简单的 API 实现文档问答
- 构建知识检索系统

**在以下情况下使用 LangChain：**
- 构建复杂智能体
- 需要更通用的工具
- 希望获得更高的灵活性
- 构建复杂的多步骤工作流

## 参考文档

- **[查询引擎指南](references/query_engines.md)** - 查询模式、自定义、流式传输
- **[智能体指南](references/agents.md)** - 工具创建、RAG 智能体、多步骤推理
- **[数据连接器指南](references/data_connectors.md)** - 300 多个连接器、自定义加载器

## 资源

- **GitHub**: https://github.com/run-llama/llama_index ⭐ 45,100+
- **文档**: https://developers.llamaindex.ai/python/framework/
- **LlamaHub**: https://llamahub.ai（数据连接器）
- **LlamaCloud**: https://cloud.llamaindex.ai（企业版）
- **Discord**: https://discord.gg/dGcwcsnxhU
- **版本**: 0.14.7+
- **许可证**: MIT