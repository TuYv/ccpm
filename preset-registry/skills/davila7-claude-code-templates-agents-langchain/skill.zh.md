---
name: langchain
description: Framework for building LLM-powered applications with agents, chains, and RAG. Supports multiple providers (OpenAI, Anthropic, Google), 500+ integrations, ReAct agents, tool calling, memory management, and vector store retrieval. Use for building chatbots, question-answering systems, autonomous agents, or RAG applications. Best for rapid prototyping and production deployments.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Agents, LangChain, RAG, Tool Calling, ReAct, Memory Management, Vector Stores, LLM Applications, Chatbots, Production]
dependencies: [langchain, langchain-core, langchain-openai, langchain-anthropic]
---
# LangChain - 使用智能体与 RAG 构建 LLM 应用

用于构建 LLM 驱动型应用的最受欢迎框架。

## 何时使用 LangChain

**在以下情况下使用 LangChain：**
- 构建具备工具调用和推理能力的智能体（ReAct 模式）
- 实现 RAG（检索增强生成）管道
- 需要轻松切换 LLM 提供商（OpenAI、Anthropic、Google）
- 创建具有对话记忆功能的聊天机器人
- 快速构建 LLM 应用原型
- 借助 LangSmith 可观测性进行生产环境部署

**指标**：
- **GitHub 星标数超过 119,000**
- **超过 272,000 个代码仓库**使用 LangChain
- **超过 500 项集成**（模型、向量存储、工具）
- **超过 3,800 名贡献者**

**改用替代方案的情况**：
- **LlamaIndex**：专注于 RAG，更适合文档问答
- **LangGraph**：适用于复杂的有状态工作流，提供更强的控制能力
- **Haystack**：适用于生产级搜索管道
- **Semantic Kernel**：适用于 Microsoft 生态系统

## 快速开始

### 安装

```bash
# Core library (Python 3.10+)
pip install -U langchain

# With OpenAI
pip install langchain-openai

# With Anthropic
pip install langchain-anthropic

# Common extras
pip install langchain-community  # 500+ integrations
pip install langchain-chroma     # Vector store
```

### LLM 基本用法

```python
from langchain_anthropic import ChatAnthropic

# Initialize model
llm = ChatAnthropic(model="claude-sonnet-4-5-20250929")

# Simple completion
response = llm.invoke("Explain quantum computing in 2 sentences")
print(response.content)
```

### 创建智能体（ReAct 模式）

```python
from langchain.agents import create_agent
from langchain_anthropic import ChatAnthropic

# Define tools
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"It's sunny in {city}, 72°F"

def search_web(query: str) -> str:
    """Search the web for information."""
    return f"Search results for: {query}"

# Create agent (<10 lines!)
agent = create_agent(
    model=ChatAnthropic(model="claude-sonnet-4-5-20250929"),
    tools=[get_weather, search_web],
    system_prompt="You are a helpful assistant. Use tools when needed."
)

# Run agent
result = agent.invoke({"messages": [{"role": "user", "content": "What's the weather in Paris?"}]})
print(result["messages"][-1].content)
```

## 核心概念

### 1. 模型 - LLM 抽象

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

# Swap providers easily
llm = ChatOpenAI(model="gpt-4o")
llm = ChatAnthropic(model="claude-sonnet-4-5-20250929")
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash-exp")

# Streaming
for chunk in llm.stream("Write a poem"):
    print(chunk.content, end="", flush=True)
```

### 2. 链 - 顺序操作

```python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# Define prompt template
prompt = PromptTemplate(
    input_variables=["topic"],
    template="Write a 3-sentence summary about {topic}"
)

# Create chain
chain = LLMChain(llm=llm, prompt=prompt)

# Run chain
result = chain.run(topic="machine learning")
```

### 3. 智能体 - 使用工具进行推理

**ReAct（推理 + 行动）模式：**

```python
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool

# Define custom tool
calculator = Tool(
    name="Calculator",
    func=lambda x: eval(x),
    description="Useful for math calculations. Input: valid Python expression."
)

# Create agent with tools
agent = create_tool_calling_agent(
    llm=llm,
    tools=[calculator, search_web],
    prompt="Answer questions using available tools"
)

# Create executor
agent_executor = AgentExecutor(agent=agent, tools=[calculator], verbose=True)

# Run with reasoning
result = agent_executor.invoke({"input": "What is 25 * 17 + 142?"})
```

### 4. 记忆 - 对话历史

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# Add memory to track conversation
memory = ConversationBufferMemory()

conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# Multi-turn conversation
conversation.predict(input="Hi, I'm Alice")
conversation.predict(input="What's my name?")  # Remembers "Alice"
```

## RAG（检索增强生成）

### 基础 RAG 流程

```python
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA

# 1. Load documents
loader = WebBaseLoader("https://docs.python.org/3/tutorial/")
docs = loader.load()

# 2. Split into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
splits = text_splitter.split_documents(docs)

# 3. Create embeddings and vector store
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=OpenAIEmbeddings()
)

# 4. Create retriever
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# 5. Create QA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True
)

# 6. Query
result = qa_chain({"query": "What are Python decorators?"})
print(result["result"])
print(f"Sources: {result['source_documents']}")
```

### 带记忆的对话式 RAG

```python
from langchain.chains import ConversationalRetrievalChain

# RAG with conversation memory
qa = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=retriever,
    memory=ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )
)

# Multi-turn RAG
qa({"question": "What is Python used for?"})
qa({"question": "Can you elaborate on web development?"})  # Remembers context
```

## 高级智能体模式

### 结构化输出

```python
from langchain_core.pydantic_v1 import BaseModel, Field

# Define schema
class WeatherReport(BaseModel):
    city: str = Field(description="City name")
    temperature: float = Field(description="Temperature in Fahrenheit")
    condition: str = Field(description="Weather condition")

# Get structured response
structured_llm = llm.with_structured_output(WeatherReport)
result = structured_llm.invoke("What's the weather in SF? It's 65F and sunny")
print(result.city, result.temperature, result.condition)
```

### 并行工具执行

```python
from langchain.agents import create_tool_calling_agent

# Agent automatically parallelizes independent tool calls
agent = create_tool_calling_agent(
    llm=llm,
    tools=[get_weather, search_web, calculator]
)

# This will call get_weather("Paris") and get_weather("London") in parallel
result = agent.invoke({
    "messages": [{"role": "user", "content": "Compare weather in Paris and London"}]
})
```

### 流式智能体执行

```python
# Stream agent steps
for step in agent_executor.stream({"input": "Research AI trends"}):
    if "actions" in step:
        print(f"Tool: {step['actions'][0].tool}")
    if "output" in step:
        print(f"Output: {step['output']}")
```

## 常见模式

### 多文档问答

```python
from langchain.chains.qa_with_sources import load_qa_with_sources_chain

# Load multiple documents
docs = [
    loader.load("https://docs.python.org"),
    loader.load("https://docs.numpy.org")
]

# QA with source citations
chain = load_qa_with_sources_chain(llm, chain_type="stuff")
result = chain({"input_documents": docs, "question": "How to use numpy arrays?"})
print(result["output_text"])  # Includes source citations
```

### 带错误处理的自定义工具

```python
from langchain.tools import tool

@tool
def risky_operation(query: str) -> str:
    """Perform a risky operation that might fail."""
    try:
        # Your operation here
        result = perform_operation(query)
        return f"Success: {result}"
    except Exception as e:
        return f"Error: {str(e)}"

# Agent handles errors gracefully
agent = create_agent(model=llm, tools=[risky_operation])
```

### LangSmith 可观测性

```python
import os

# Enable tracing
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-api-key"
os.environ["LANGCHAIN_PROJECT"] = "my-project"

# All chains/agents automatically traced
agent = create_agent(model=llm, tools=[calculator])
result = agent.invoke({"input": "Calculate 123 * 456"})

# View traces at smith.langchain.com
```

## 向量存储

### Chroma（本地）

```python
from langchain_chroma import Chroma

vectorstore = Chroma.from_documents(
    documents=docs,
    embedding=OpenAIEmbeddings(),
    persist_directory="./chroma_db"
)
```

### Pinecone（云端）

```python
from langchain_pinecone import PineconeVectorStore

vectorstore = PineconeVectorStore.from_documents(
    documents=docs,
    embedding=OpenAIEmbeddings(),
    index_name="my-index"
)
```

### FAISS（相似度搜索）

```python
from langchain_community.vectorstores import FAISS

vectorstore = FAISS.from_documents(docs, OpenAIEmbeddings())
vectorstore.save_local("faiss_index")

# Load later
vectorstore = FAISS.load_local("faiss_index", OpenAIEmbeddings())
```

## 文档加载器

```python
# Web pages
from langchain_community.document_loaders import WebBaseLoader
loader = WebBaseLoader("https://example.com")

# PDFs
from langchain_community.document_loaders import PyPDFLoader
loader = PyPDFLoader("paper.pdf")

# GitHub
from langchain_community.document_loaders import GithubFileLoader
loader = GithubFileLoader(repo="user/repo", file_filter=lambda x: x.endswith(".py"))

# CSV
from langchain_community.document_loaders import CSVLoader
loader = CSVLoader("data.csv")
```

## 文本分割器

```python
# Recursive (recommended for general text)
from langchain.text_splitter import RecursiveCharacterTextSplitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", " ", ""]
)

# Code-aware
from langchain.text_splitter import PythonCodeTextSplitter
splitter = PythonCodeTextSplitter(chunk_size=500)

# Semantic (by meaning)
from langchain_experimental.text_splitter import SemanticChunker
splitter = SemanticChunker(OpenAIEmbeddings())
```

## 最佳实践

1. **从简单开始** - 大多数情况下使用 `create_agent()`
2. **启用流式输出** - 为较长的响应提供更好的用户体验
3. **添加错误处理** - 工具可能会失败，应妥善处理
4. **使用 LangSmith** - 对调试智能体至关重要
5. **优化分块大小** - RAG 建议使用 500-1000 个字符
6. **对提示词进行版本管理** - 跟踪生产环境中的变更
7. **缓存嵌入向量** - 成本较高，应尽可能缓存
8. **监控成本** - 使用 LangSmith 跟踪 token 用量

## 性能基准

| 操作 | 延迟 | 备注 |
|-----------|---------|-------|
| 简单的 LLM 调用 | ~1-2s | 取决于提供商 |
| 使用 1 个工具的智能体 | ~3-5s | ReAct 推理开销 |
| RAG 检索 | ~0.5-1s | 向量搜索 + LLM |
| 为 1000 个文档生成嵌入向量 | ~10-30s | 取决于模型 |

## LangChain 与 LangGraph 对比

| 功能 | LangChain | LangGraph |
|---------|-----------|-----------|
| **最适合** | 快速构建智能体、RAG | 复杂工作流 |
| **抽象层级** | 高 | 低 |
| **启动所需代码量** | <10 行 | ~30 行 |
| **控制能力** | 简单 | 完全控制 |
| **有状态工作流** | 有限 | 原生支持 |
| **循环图** | 不支持 | 支持 |
| **人在回路** | 基础 | 高级 |

**在以下情况使用 LangGraph：**
- 需要带循环的有状态工作流
- 需要细粒度控制
- 构建多智能体系统
- 构建具有复杂逻辑的生产应用

## 参考资料

- **[智能体指南](references/agents.md)** - ReAct、工具调用、流式输出
- **[RAG 指南](references/rag.md)** - 文档加载器、检索器、问答链
- **[集成指南](references/integration.md)** - 向量存储、LangSmith、部署

## 资源

- **GitHub**: https://github.com/langchain-ai/langchain ⭐ 119,000+
- **文档**: https://docs.langchain.com
- **API 参考**: https://reference.langchain.com/python
- **LangSmith**: https://smith.langchain.com（可观测性）
- **版本**: 0.3+（稳定版）
- **许可证**: MIT