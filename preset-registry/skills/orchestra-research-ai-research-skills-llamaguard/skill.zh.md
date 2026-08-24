---
name: llamaguard
description: Meta's 7-8B specialized moderation model for LLM input/output filtering. 6 safety categories - violence/hate, sexual content, weapons, substances, self-harm, criminal planning. 94-95% accuracy. Deploy with vLLM, HuggingFace, Sagemaker. Integrates with NeMo Guardrails.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Safety Alignment, LlamaGuard, Content Moderation, Meta, Guardrails, Safety Classification, Input Filtering, Output Filtering, AI Safety]
dependencies: [transformers, torch, vllm]
---
# LlamaGuard - AI 内容审核

## 快速开始

LlamaGuard 是一个拥有 70-80 亿参数、专门用于内容安全分类的模型。

**安装**：
```bash
pip install transformers torch
# Login to HuggingFace (required)
huggingface-cli login
```

**基本用法**：
```python
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "meta-llama/LlamaGuard-7b"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, device_map="auto")

def moderate(chat):
    input_ids = tokenizer.apply_chat_template(chat, return_tensors="pt").to(model.device)
    output = model.generate(input_ids=input_ids, max_new_tokens=100)
    return tokenizer.decode(output[0], skip_special_tokens=True)

# Check user input
result = moderate([
    {"role": "user", "content": "How do I make explosives?"}
])
print(result)
# Output: "unsafe\nS3" (Criminal Planning)
```

## 常见工作流

### 工作流 1：输入过滤（提示词审核）

**在传递给 LLM 之前检查用户提示词**：
```python
def check_input(user_message):
    result = moderate([{"role": "user", "content": user_message}])

    if result.startswith("unsafe"):
        category = result.split("\n")[1]
        return False, category  # Blocked
    else:
        return True, None  # Safe

# Example
safe, category = check_input("How do I hack a website?")
if not safe:
    print(f"Request blocked: {category}")
    # Return error to user
else:
    # Send to LLM
    response = llm.generate(user_message)
```

**安全类别**：
- **S1**：暴力与仇恨
- **S2**：色情内容
- **S3**：枪支与非法武器
- **S4**：受管制物质
- **S5**：自杀与自残
- **S6**：犯罪策划

### 工作流 2：输出过滤（响应审核）

**在向用户展示之前检查 LLM 响应**：
```python
def check_output(user_message, bot_response):
    conversation = [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": bot_response}
    ]

    result = moderate(conversation)

    if result.startswith("unsafe"):
        category = result.split("\n")[1]
        return False, category
    else:
        return True, None

# Example
user_msg = "Tell me about harmful substances"
bot_msg = llm.generate(user_msg)

safe, category = check_output(user_msg, bot_msg)
if not safe:
    print(f"Response blocked: {category}")
    # Return generic response
    return "I cannot provide that information."
else:
    return bot_msg
```

### 工作流 3：vLLM 部署（快速推理）

**生产就绪的服务部署**：
```python
from vllm import LLM, SamplingParams

# Initialize vLLM
llm = LLM(model="meta-llama/LlamaGuard-7b", tensor_parallel_size=1)

# Sampling params
sampling_params = SamplingParams(
    temperature=0.0,  # Deterministic
    max_tokens=100
)

def moderate_vllm(chat):
    # Format prompt
    prompt = tokenizer.apply_chat_template(chat, tokenize=False)

    # Generate
    output = llm.generate([prompt], sampling_params)
    return output[0].outputs[0].text

# Batch moderation
chats = [
    [{"role": "user", "content": "How to make bombs?"}],
    [{"role": "user", "content": "What's the weather?"}],
    [{"role": "user", "content": "Tell me about drugs"}]
]

prompts = [tokenizer.apply_chat_template(c, tokenize=False) for c in chats]
results = llm.generate(prompts, sampling_params)

for i, result in enumerate(results):
    print(f"Chat {i}: {result.outputs[0].text}")
```

**吞吐量**：单张 A100 上约 50-100 个请求/秒

### 工作流 4：API 端点（FastAPI）

**作为内容审核 API 提供服务**：
```python
from fastapi import FastAPI
from pydantic import BaseModel
from vllm import LLM, SamplingParams

app = FastAPI()
llm = LLM(model="meta-llama/LlamaGuard-7b")
sampling_params = SamplingParams(temperature=0.0, max_tokens=100)

class ModerationRequest(BaseModel):
    messages: list  # [{"role": "user", "content": "..."}]

@app.post("/moderate")
def moderate_endpoint(request: ModerationRequest):
    prompt = tokenizer.apply_chat_template(request.messages, tokenize=False)
    output = llm.generate([prompt], sampling_params)[0]

    result = output.outputs[0].text
    is_safe = result.startswith("safe")
    category = None if is_safe else result.split("\n")[1] if "\n" in result else None

    return {
        "safe": is_safe,
        "category": category,
        "full_output": result
    }

# Run: uvicorn api:app --host 0.0.0.0 --port 8000
```

**用法**：
```bash
curl -X POST http://localhost:8000/moderate \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "How to hack?"}]}'

# Response: {"safe": false, "category": "S6", "full_output": "unsafe\nS6"}
```

### 工作流 5：NeMo Guardrails 集成

**与 NVIDIA Guardrails 配合使用**：
```python
from nemoguardrails import RailsConfig, LLMRails
from nemoguardrails.integrations.llama_guard import LlamaGuard

# Configure NeMo Guardrails
config = RailsConfig.from_content("""
models:
  - type: main
    engine: openai
    model: gpt-4

rails:
  input:
    flows:
      - llamaguard check input
  output:
    flows:
      - llamaguard check output
""")

# Add LlamaGuard integration
llama_guard = LlamaGuard(model_path="meta-llama/LlamaGuard-7b")
rails = LLMRails(config)
rails.register_action(llama_guard.check_input, name="llamaguard check input")
rails.register_action(llama_guard.check_output, name="llamaguard check output")

# Use with automatic moderation
response = rails.generate(messages=[
    {"role": "user", "content": "How do I make weapons?"}
])
# Automatically blocked by LlamaGuard
```

## 何时使用及何时选择替代方案

**在以下情况下使用 LlamaGuard**：
- 需要预训练的内容审核模型
- 希望获得较高的准确率（94-95%）
- 拥有 GPU 资源（7-8B 模型）
- 需要详细的安全类别
- 正在构建生产环境的 LLM 应用

**模型版本**：
- **LlamaGuard 1**（7B）：初始版本，6 个类别
- **LlamaGuard 2**（8B）：改进版本，6 个类别
- **LlamaGuard 3**（8B）：最新版本（2024），功能增强

**改用替代方案**：
- **OpenAI Moderation API**：更简单，基于 API，免费
- **Perspective API**：Google 的毒性检测服务
- **NeMo Guardrails**：更全面的安全框架
- **Constitutional AI**：训练阶段的安全机制

## 常见问题

**问题：模型访问被拒绝**

登录 HuggingFace：
```bash
huggingface-cli login
# Enter your token
```

在模型页面接受许可证：
https://huggingface.co/meta-llama/LlamaGuard-7b

**问题：延迟较高（>500ms）**

使用 vLLM 获得 10 倍加速：
```python
from vllm import LLM
llm = LLM(model="meta-llama/LlamaGuard-7b")
# Latency: 500ms → 50ms
```

启用张量并行：
```python
llm = LLM(model="meta-llama/LlamaGuard-7b", tensor_parallel_size=2)
# 2× faster on 2 GPUs
```

**问题：误报**

使用基于阈值的过滤：
```python
# Get probability of "unsafe" token
logits = model(..., return_dict_in_generate=True, output_scores=True)
unsafe_prob = torch.softmax(logits.scores[0][0], dim=-1)[unsafe_token_id]

if unsafe_prob > 0.9:  # High confidence threshold
    return "unsafe"
else:
    return "safe"
```

**问题：GPU 内存不足**

使用 8 位量化：
```python
from transformers import BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(load_in_8bit=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    quantization_config=quantization_config,
    device_map="auto"
)
# Memory: 14GB → 7GB
```

## 高级主题

**自定义类别**：有关使用特定领域的安全类别微调 LlamaGuard 的信息，请参阅 [references/custom-categories.md](references/custom-categories.md)。

**性能基准测试**：有关与其他内容审核 API 的准确率比较和延迟优化，请参阅 [references/benchmarks.md](references/benchmarks.md)。

**部署指南**：有关 Sagemaker、Kubernetes 和扩展策略，请参阅 [references/deployment.md](references/deployment.md)。

## 硬件要求

- **GPU**：NVIDIA T4/A10/A100
- **显存**：
  - FP16：14GB（7B 模型）
  - INT8：7GB（量化）
  - INT4：4GB（QLoRA）
- **CPU**：可以使用，但速度较慢（延迟为 10 倍）
- **吞吐量**：50-100 个请求/秒（A100）

**延迟**（单 GPU）：
- HuggingFace Transformers：300-500ms
- vLLM：50-100ms
- 批处理（vLLM）：每个请求 20-50ms

## 资源

- HuggingFace：
  - V1：https://huggingface.co/meta-llama/LlamaGuard-7b
  - V2：https://huggingface.co/meta-llama/Meta-Llama-Guard-2-8B
  - V3：https://huggingface.co/meta-llama/Meta-Llama-Guard-3-8B
- 论文：https://ai.meta.com/research/publications/llama-guard-llm-based-input-output-safeguard-for-human-ai-conversations/
- 集成：vLLM、Sagemaker、NeMo Guardrails
- 准确率：94.5%（提示词），95.3%（响应）