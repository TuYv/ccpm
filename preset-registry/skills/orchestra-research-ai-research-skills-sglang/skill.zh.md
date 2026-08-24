---
name: sglang
description: Fast structured generation and serving for LLMs with RadixAttention prefix caching. Use for JSON/regex outputs, constrained decoding, agentic workflows with tool calls, or when you need 5× faster inference than vLLM with prefix sharing. Powers 300,000+ GPUs at xAI, AMD, NVIDIA, and LinkedIn.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Inference Serving, SGLang, Structured Generation, RadixAttention, Prefix Caching, Constrained Decoding, Agents, JSON Output, Fast Inference, Production Scale]
dependencies: [sglang, torch, transformers]
---
# SGLang

借助 RadixAttention 实现自动前缀缓存的高性能 LLM 和 VLM 服务框架。

## 何时使用 SGLang

**在以下情况下使用 SGLang：**
- 需要结构化输出（JSON、正则表达式、语法）
- 构建具有重复前缀的智能体（系统提示词、工具）
- 代理式工作流中的函数调用
- 具有共享上下文的多轮对话
- 需要更快的 JSON 解码速度（相比标准方式快 3 倍）

**在以下情况下改用 vLLM：**
- 不需要结构化的简单文本生成
- 不需要前缀缓存
- 希望使用成熟且经过广泛测试的生产系统

**在以下情况下改用 TensorRT-LLM：**
- 追求单请求延迟最低（不需要批处理）
- 仅使用 NVIDIA 部署
- 需要在 H100 上进行 FP8/INT4 量化

## 快速开始

### 安装

```bash
# pip install (recommended)
pip install "sglang[all]"

# With FlashInfer (faster, CUDA 11.8/12.1)
pip install sglang[all] flashinfer -i https://flashinfer.ai/whl/cu121/torch2.4/

# From source
git clone https://github.com/sgl-project/sglang.git
cd sglang
pip install -e "python[all]"
```

### 启动服务器

```bash
# Basic server (Llama 3-8B)
python -m sglang.launch_server \
    --model-path meta-llama/Meta-Llama-3-8B-Instruct \
    --port 30000

# With RadixAttention (automatic prefix caching)
python -m sglang.launch_server \
    --model-path meta-llama/Meta-Llama-3-8B-Instruct \
    --port 30000 \
    --enable-radix-cache  # Default: enabled

# Multi-GPU (tensor parallelism)
python -m sglang.launch_server \
    --model-path meta-llama/Meta-Llama-3-70B-Instruct \
    --tp 4 \
    --port 30000
```

### 基本推理

```python
import sglang as sgl

# Set backend
sgl.set_default_backend(sgl.OpenAI("http://localhost:30000/v1"))

# Simple generation
@sgl.function
def simple_gen(s, question):
    s += "Q: " + question + "\n"
    s += "A:" + sgl.gen("answer", max_tokens=100)

# Run
state = simple_gen.run(question="What is the capital of France?")
print(state["answer"])
# Output: "The capital of France is Paris."
```

### 结构化 JSON 输出

```python
import sglang as sgl

@sgl.function
def extract_person(s, text):
    s += f"Extract person information from: {text}\n"
    s += "Output JSON:\n"

    # Constrained JSON generation
    s += sgl.gen(
        "json_output",
        max_tokens=200,
        regex=r'\{"name": "[^"]+", "age": \d+, "occupation": "[^"]+"\}'
    )

# Run
state = extract_person.run(
    text="John Smith is a 35-year-old software engineer."
)
print(state["json_output"])
# Output: {"name": "John Smith", "age": 35, "occupation": "software engineer"}
```

## RadixAttention（核心创新）

**作用**：自动缓存并复用不同请求之间的公共前缀。

**性能**：
- 对于共享系统提示词的代理式工作负载，速度提升 **5 倍**
- 对于重复示例的少样本提示，速度提升 **10 倍**
- **零配置** —— 自动生效

**工作原理**：
1. 为所有已处理的 token 构建基数树
2. 自动检测共享前缀
3. 为匹配的前缀复用 KV 缓存
4. 仅计算新 token

**示例**（带有系统提示的 Agent）：

```
Request 1: [SYSTEM_PROMPT] + "What's the weather?"
→ Computes full prompt (1000 tokens)

Request 2: [SAME_SYSTEM_PROMPT] + "Book a flight"
→ Reuses system prompt KV cache (998 tokens)
→ Only computes 2 new tokens
→ 5× faster!
```

## 结构化生成模式

### 带 schema 的 JSON

```python
@sgl.function
def structured_extraction(s, article):
    s += f"Article: {article}\n\n"
    s += "Extract key information as JSON:\n"

    # JSON schema constraint
    schema = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "author": {"type": "string"},
            "summary": {"type": "string"},
            "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]}
        },
        "required": ["title", "author", "summary", "sentiment"]
    }

    s += sgl.gen("info", max_tokens=300, json_schema=schema)

state = structured_extraction.run(article="...")
print(state["info"])
# Output: Valid JSON matching schema
```

### 正则约束生成

```python
@sgl.function
def extract_email(s, text):
    s += f"Extract email from: {text}\n"
    s += "Email: "

    # Email regex pattern
    s += sgl.gen(
        "email",
        max_tokens=50,
        regex=r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    )

state = extract_email.run(text="Contact john.doe@example.com for details")
print(state["email"])
# Output: "john.doe@example.com"
```

### 基于语法的生成

```python
@sgl.function
def generate_code(s, description):
    s += f"Generate Python code for: {description}\n"
    s += "```python\n"

    # EBNF grammar for Python
    python_grammar = """
    ?start: function_def
    function_def: "def" NAME "(" [parameters] "):" suite
    parameters: parameter ("," parameter)*
    parameter: NAME
    suite: simple_stmt | NEWLINE INDENT stmt+ DEDENT
    """

    s += sgl.gen("code", max_tokens=200, grammar=python_grammar)
    s += "\n```"
```

## 使用函数调用的 Agent 工作流

```python
import sglang as sgl

# Define tools
tools = [
    {
        "name": "get_weather",
        "description": "Get weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string"}
            }
        }
    },
    {
        "name": "book_flight",
        "description": "Book a flight",
        "parameters": {
            "type": "object",
            "properties": {
                "from": {"type": "string"},
                "to": {"type": "string"},
                "date": {"type": "string"}
            }
        }
    }
]

@sgl.function
def agent_workflow(s, user_query, tools):
    # System prompt (cached with RadixAttention)
    s += "You are a helpful assistant with access to tools.\n"
    s += f"Available tools: {tools}\n\n"

    # User query
    s += f"User: {user_query}\n"
    s += "Assistant: "

    # Generate with function calling
    s += sgl.gen(
        "response",
        max_tokens=200,
        tools=tools,  # SGLang handles tool call format
        stop=["User:", "\n\n"]
    )

# Multiple queries reuse system prompt
state1 = agent_workflow.run(
    user_query="What's the weather in NYC?",
    tools=tools
)
# First call: Computes full system prompt

state2 = agent_workflow.run(
    user_query="Book a flight to LA",
    tools=tools
)
# Second call: Reuses system prompt (5× faster)
```

## 性能基准

### RadixAttention 加速

**少样本提示**（提示中包含 10 个示例）：
- vLLM：2.5 秒/请求
- SGLang：**0.25 秒/请求**（快 10 倍）
- 吞吐量：提高 4 倍

**Agent 工作流**（1000-token system prompt）：
- vLLM：1.8 秒/请求
- SGLang：**0.35 秒/请求**（快 5 倍）

**JSON 解码**：
- 标准：45 tok/s
- SGLang：**135 tok/s**（快 3 倍）

### 吞吐量（Llama 3-8B，A100）

| 工作负载 | vLLM | SGLang | 加速比 |
|----------|------|--------|---------|
| 简单生成 | 2500 tok/s | 2800 tok/s | 1.12× |
| 少样本（10 个示例） | 500 tok/s | 5000 tok/s | 10× |
| Agent（工具调用） | 800 tok/s | 4000 tok/s | 5× |
| JSON 输出 | 600 tok/s | 2400 tok/s | 4× |

## 多轮对话

```python
@sgl.function
def multi_turn_chat(s, history, new_message):
    # System prompt (always cached)
    s += "You are a helpful AI assistant.\n\n"

    # Conversation history (cached as it grows)
    for msg in history:
        s += f"{msg['role']}: {msg['content']}\n"

    # New user message (only new part)
    s += f"User: {new_message}\n"
    s += "Assistant: "
    s += sgl.gen("response", max_tokens=200)

# Turn 1
history = []
state = multi_turn_chat.run(history=history, new_message="Hi there!")
history.append({"role": "User", "content": "Hi there!"})
history.append({"role": "Assistant", "content": state["response"]})

# Turn 2 (reuses Turn 1 KV cache)
state = multi_turn_chat.run(history=history, new_message="What's 2+2?")
# Only computes new message (much faster!)

# Turn 3 (reuses Turn 1 + Turn 2 KV cache)
state = multi_turn_chat.run(history=history, new_message="Tell me a joke")
# Progressively faster as history grows
```

## 高级功能

### 推测解码

```bash
# Launch with draft model (2-3× faster)
python -m sglang.launch_server \
    --model-path meta-llama/Meta-Llama-3-70B-Instruct \
    --speculative-model meta-llama/Meta-Llama-3-8B-Instruct \
    --speculative-num-steps 5
```

### 多模态（视觉模型）

```python
@sgl.function
def describe_image(s, image_path):
    s += sgl.image(image_path)
    s += "Describe this image in detail: "
    s += sgl.gen("description", max_tokens=200)

state = describe_image.run(image_path="photo.jpg")
print(state["description"])
```

### 批处理与并行请求

```python
# Automatic batching (continuous batching)
states = sgl.run_batch(
    [
        simple_gen.bind(question="What is AI?"),
        simple_gen.bind(question="What is ML?"),
        simple_gen.bind(question="What is DL?"),
    ]
)

# All 3 processed in single batch (efficient)
```

## OpenAI 兼容 API

```bash
# Start server with OpenAI API
python -m sglang.launch_server \
    --model-path meta-llama/Meta-Llama-3-8B-Instruct \
    --port 30000

# Use with OpenAI client
curl http://localhost:30000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "default",
    "messages": [
      {"role": "system", "content": "You are helpful"},
      {"role": "user", "content": "Hello"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'

# Works with OpenAI Python SDK
from openai import OpenAI
client = OpenAI(base_url="http://localhost:30000/v1", api_key="EMPTY")

response = client.chat.completions.create(
    model="default",
    messages=[{"role": "user", "content": "Hello"}]
)
```

## 支持的模型

**文本模型**：
- Llama 2、Llama 3、Llama 3.1、Llama 3.2
- Mistral、Mixtral
- Qwen、Qwen2、QwQ
- DeepSeek-V2、DeepSeek-V3
- Gemma、Phi-3

**视觉模型**：
- LLaVA、LLaVA-OneVision
- Phi-3-Vision
- Qwen2-VL

**来自 HuggingFace 的 100+ 个模型**

## 硬件支持

**NVIDIA**：A100、H100、L4、T4（CUDA 11.8+）
**AMD**：MI300、MI250（ROCm 6.0+）
**Intel**：配备 GPU 的 Xeon（即将推出）
**Apple**：通过 MPS 支持 M1/M2/M3（实验性）

## 参考资料

- **[结构化生成指南](references/structured-generation.md)** - JSON schemas、regex、grammars、validation
- **[RadixAttention 深入解析](references/radix-attention.md)** - 工作原理、优化、基准测试
- **[生产环境部署](references/deployment.md)** - 多 GPU、监控、自动扩缩容

## 资源

- **GitHub**：https://github.com/sgl-project/sglang
- **文档**：https://sgl-project.github.io/
- **论文**：RadixAttention（arXiv:2312.07104）
- **Discord**：https://discord.gg/sglang