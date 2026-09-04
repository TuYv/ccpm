---
name: tensorrt-llm
description: Optimizes LLM inference with NVIDIA TensorRT for maximum throughput and lowest latency. Use for production deployment on NVIDIA GPUs (A100/H100), when you need 10-100x faster inference than PyTorch, or for serving models with quantization (FP8/INT4), in-flight batching, and multi-GPU scaling.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Inference Serving, TensorRT-LLM, NVIDIA, Inference Optimization, High Throughput, Low Latency, Production, FP8, INT4, In-Flight Batching, Multi-GPU]
dependencies: [tensorrt-llm, torch]
---
# TensorRT-LLM

NVIDIA 的开源库，用于优化 LLM 推理，在 NVIDIA GPU 上提供业界领先的性能。

## 何时使用 TensorRT-LLM

**在以下情况使用 TensorRT-LLM：**
- 部署在 NVIDIA GPU 上（A100、H100、GB200）
- 需要最大吞吐量（Llama 3 上超过 24,000 tokens/秒）
- 实时应用需要低延迟
- 使用量化模型（FP8、INT4、FP4）
- 跨多个 GPU 或节点进行扩展

**在以下情况改用 vLLM：**
- 需要更简单的设置和以 Python 为主的 API
- 想在不进行 TensorRT 编译的情况下使用 PagedAttention
- 使用 AMD GPU 或非 NVIDIA 硬件

**在以下情况改用 llama.cpp：**
- 部署在 CPU 或 Apple Silicon 上
- 需要在没有 NVIDIA GPU 的情况下进行边缘部署
- 想要更简单的 GGUF 量化格式

## 快速开始

### 安装

```bash
# Docker (recommended)
docker pull nvidia/tensorrt_llm:latest

# pip install
pip install tensorrt_llm==1.2.0rc3

# Requires CUDA 13.0.0, TensorRT 10.13.2, Python 3.10-3.12
```

### 基本推理

```python
from tensorrt_llm import LLM, SamplingParams

# Initialize model
llm = LLM(model="meta-llama/Meta-Llama-3-8B")

# Configure sampling
sampling_params = SamplingParams(
    max_tokens=100,
    temperature=0.7,
    top_p=0.9
)

# Generate
prompts = ["Explain quantum computing"]
outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(output.text)
```

### 使用 trtllm-serve 提供服务

```bash
# Start server (automatic model download and compilation)
trtllm-serve meta-llama/Meta-Llama-3-8B \
    --tp_size 4 \              # Tensor parallelism (4 GPUs)
    --max_batch_size 256 \
    --max_num_tokens 4096

# Client request
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Meta-Llama-3-8B",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

## 核心特性

### 性能优化
- **In-flight batching**：生成过程中的动态批处理
- **Paged KV cache**：高效的内存管理
- **Flash Attention**：优化的注意力内核
- **量化**：FP8、INT4、FP4，带来 2-4 倍的推理加速
- **CUDA graphs**：降低内核启动开销

### 并行策略
- **张量并行（TP）**：将模型拆分到多个 GPU 上
- **流水线并行（PP）**：按层分布
- **专家并行**：面向混合专家模型
- **多节点**：扩展到单机之外

### 高级特性
- **投机解码**：利用草稿模型加速生成
- **LoRA 服务**：高效的多适配器部署
- **分离式服务**：将预填充与生成分离开来

## 常见模式

### 量化模型（FP8）

```python
from tensorrt_llm import LLM

# Load FP8 quantized model (2× faster, 50% memory)
llm = LLM(
    model="meta-llama/Meta-Llama-3-70B",
    dtype="fp8",
    max_num_tokens=8192
)

# Inference same as before
outputs = llm.generate(["Summarize this article..."])
```

### 多 GPU 部署

```python
# Tensor parallelism across 8 GPUs
llm = LLM(
    model="meta-llama/Meta-Llama-3-405B",
    tensor_parallel_size=8,
    dtype="fp8"
)
```

### 批量推理

```python
# Process 100 prompts efficiently
prompts = [f"Question {i}: ..." for i in range(100)]

outputs = llm.generate(
    prompts,
    sampling_params=SamplingParams(max_tokens=200)
)

# Automatic in-flight batching for maximum throughput
```

## 性能基准

**Meta Llama 3-8B**（H100 GPU）：
- 吞吐量：24,000 tokens/秒
- 延迟：每个 token 约 10ms
- 对比 PyTorch：**快 100 倍**

**Llama 3-70B**（8× A100 80GB）：
- FP8 量化：比 FP16 快 2 倍
- 内存：使用 FP8 减少 50%

## 支持的模型

- **LLaMA 系列**：Llama 2、Llama 3、CodeLlama
- **GPT 系列**：GPT-2、GPT-J、GPT-NeoX
- **Qwen**：Qwen、Qwen2、QwQ
- **DeepSeek**：DeepSeek-V2、DeepSeek-V3
- **Mixtral**：Mixtral-8x7B、Mixtral-8x22B
- **视觉**：LLaVA、Phi-3-vision
- HuggingFace 上有 **100 多个模型**

## 参考资料

- **[优化指南](references/optimization.md)** - 量化、批处理、KV cache 调优
- **[多 GPU 设置](references/multi-gpu.md)** - 张量/流水线并行、多节点
- **[服务指南](references/serving.md)** - 生产部署、监控、自动扩缩容

## 资源

- **文档**：https://nvidia.github.io/TensorRT-LLM/
- **GitHub**：https://github.com/NVIDIA/TensorRT-LLM
- **模型**：https://huggingface.co/models?library=tensorrt_llm
