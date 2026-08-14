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

NVIDIA 的开源库，用于优化 LLM 推理，在 NVIDIA GPU 上实现业界领先的性能。

## 何时使用 TensorRT-LLM

**在以下情况下使用 TensorRT-LLM：**
- 在 NVIDIA GPU（A100、H100、GB200）上部署
- 需要最大吞吐量（Llama 3 上每秒 24,000+ 个 token）
- 实时应用需要低延迟
- 使用量化模型（FP8、INT4、FP4）
- 跨多个 GPU 或节点扩展

**在以下情况下改用 vLLM：**
- 需要更简单的设置和 Python 优先的 API
- 希望使用 PagedAttention，但不想进行 TensorRT 编译
- 使用 AMD GPU 或非 NVIDIA 硬件

**在以下情况下改用 llama.cpp：**
- 在 CPU 或 Apple Silicon 上部署
- 需要在没有 NVIDIA GPU 的边缘环境中部署
- 希望使用更简单的 GGUF 量化格式

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

## 主要功能

### 性能优化
- **动态批处理**：在生成过程中动态组批
- **分页 KV 缓存**：高效的内存管理
- **Flash Attention**：优化的注意力内核
- **量化**：使用 FP8、INT4、FP4 实现快 2-4 倍的推理
- **CUDA 图**：减少内核启动开销

### 并行
- **张量并行（TP）**：将模型拆分到多个 GPU 上
- **流水线并行（PP）**：按层分布
- **专家并行**：用于混合专家模型
- **多节点**：扩展到单台机器之外

### 高级功能
- **推测解码**：使用草稿模型加快生成速度
- **LoRA 服务**：高效的多适配器部署
- **解耦式服务**：分离预填充和生成

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
- 吞吐量：24,000 tokens/sec
- 延迟：每个 token 约 10ms
- 与 PyTorch 相比：**快 100 倍**

**Llama 3-70B**（8× A100 80GB）：
- FP8 量化：比 FP16 快 2 倍
- 内存：使用 FP8 可减少 50%

## 支持的模型

- **LLaMA 系列**：Llama 2、Llama 3、CodeLlama
- **GPT 系列**：GPT-2、GPT-J、GPT-NeoX
- **Qwen**：Qwen、Qwen2、QwQ
- **DeepSeek**：DeepSeek-V2、DeepSeek-V3
- **Mixtral**：Mixtral-8x7B、Mixtral-8x22B
- **视觉模型**：LLaVA、Phi-3-vision
- HuggingFace 上的 **100 多个模型**

## 参考资料

- **[优化指南](references/optimization.md)** - 量化、批处理、KV cache 调优
- **[多 GPU 设置](references/multi-gpu.md)** - 张量/流水线并行、多节点
- **[服务指南](references/serving.md)** - 生产部署、监控、自动扩缩容

## 资源

- **文档**：https://nvidia.github.io/TensorRT-LLM/
- **GitHub**：https://github.com/NVIDIA/TensorRT-LLM
- **模型**：https://huggingface.co/models?library=tensorrt_llm