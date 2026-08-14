---
name: llama-cpp
description: Runs LLM inference on CPU, Apple Silicon, and consumer GPUs without NVIDIA hardware. Use for edge deployment, M1/M2/M3 Macs, AMD/Intel GPUs, or when CUDA is unavailable. Supports GGUF quantization (1.5-8 bit) for reduced memory and 4-10× speedup vs PyTorch on CPU.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Inference Serving, Llama.cpp, CPU Inference, Apple Silicon, Edge Deployment, GGUF, Quantization, Non-NVIDIA, AMD GPUs, Intel GPUs, Embedded]
dependencies: [llama-cpp-python]
---
# llama.cpp

采用纯 C/C++ 实现、依赖极少的 LLM 推理，针对 CPU 和非 NVIDIA 硬件进行了优化。

## 何时使用 llama.cpp

**在以下情况下使用 llama.cpp：**
- 在仅配备 CPU 的机器上运行
- 部署在 Apple Silicon（M1/M2/M3/M4）上
- 使用 AMD 或 Intel GPU（无 CUDA）
- 边缘部署（Raspberry Pi、嵌入式系统）
- 需要无需 Docker/Python 的简单部署方式

**在以下情况下改用 TensorRT-LLM：**
- 拥有 NVIDIA GPU（A100/H100）
- 需要最大吞吐量（100K+ tok/s）
- 在配备 CUDA 的数据中心运行

**在以下情况下改用 vLLM：**
- 拥有 NVIDIA GPU
- 需要 Python 优先的 API
- 希望使用 PagedAttention

## 快速开始

### 安装

```bash
# macOS/Linux
brew install llama.cpp

# Or build from source
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# With Metal (Apple Silicon)
make LLAMA_METAL=1

# With CUDA (NVIDIA)
make LLAMA_CUDA=1

# With ROCm (AMD)
make LLAMA_HIP=1
```

### 下载模型

```bash
# Download from HuggingFace (GGUF format)
huggingface-cli download \
    TheBloke/Llama-2-7B-Chat-GGUF \
    llama-2-7b-chat.Q4_K_M.gguf \
    --local-dir models/

# Or convert from HuggingFace
python convert_hf_to_gguf.py models/llama-2-7b-chat/
```

### 运行推理

```bash
# Simple chat
./llama-cli \
    -m models/llama-2-7b-chat.Q4_K_M.gguf \
    -p "Explain quantum computing" \
    -n 256  # Max tokens

# Interactive chat
./llama-cli \
    -m models/llama-2-7b-chat.Q4_K_M.gguf \
    --interactive
```

### 服务器模式

```bash
# Start OpenAI-compatible server
./llama-server \
    -m models/llama-2-7b-chat.Q4_K_M.gguf \
    --host 0.0.0.0 \
    --port 8080 \
    -ngl 32  # Offload 32 layers to GPU

# Client request
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-2-7b-chat",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

## 量化格式

### GGUF 格式概览

| 格式 | 位数 | 大小（7B） | 速度 | 质量 | 使用场景 |
|--------|------|-----------|-------|---------|----------|
| **Q4_K_M** | 4.5 | 4.1 GB | 快 | 良好 | **推荐的默认选项** |
| Q4_K_S | 4.3 | 3.9 GB | 更快 | 较低 | 速度至关重要 |
| Q5_K_M | 5.5 | 4.8 GB | 中等 | 更好 | 质量至关重要 |
| Q6_K | 6.5 | 5.5 GB | 较慢 | 最佳 | 最高质量 |
| Q8_0 | 8.0 | 7.0 GB | 慢 | 优秀 | 最小程度的质量下降 |
| Q2_K | 2.5 | 2.7 GB | 最快 | 较差 | 仅用于测试 |

### 选择量化格式

```bash
# General use (balanced)
Q4_K_M  # 4-bit, medium quality

# Maximum speed (more degradation)
Q2_K or Q3_K_M

# Maximum quality (slower)
Q6_K or Q8_0

# Very large models (70B, 405B)
Q3_K_M or Q4_K_S  # Lower bits to fit in memory
```

## 硬件加速

### Apple Silicon（Metal）

```bash
# Build with Metal
make LLAMA_METAL=1

# Run with GPU acceleration (automatic)
./llama-cli -m model.gguf -ngl 999  # Offload all layers

# Performance: M3 Max 40-60 tokens/sec (Llama 2-7B Q4_K_M)
```

### NVIDIA GPU（CUDA）

```bash
# Build with CUDA
make LLAMA_CUDA=1

# Offload layers to GPU
./llama-cli -m model.gguf -ngl 35  # Offload 35/40 layers

# Hybrid CPU+GPU for large models
./llama-cli -m llama-70b.Q4_K_M.gguf -ngl 20  # GPU: 20 layers, CPU: rest
```

### AMD GPU（ROCm）

```bash
# Build with ROCm
make LLAMA_HIP=1

# Run with AMD GPU
./llama-cli -m model.gguf -ngl 999
```

## 常见模式

### 批处理

```bash
# Process multiple prompts from file
cat prompts.txt | ./llama-cli \
    -m model.gguf \
    --batch-size 512 \
    -n 100
```

### 约束生成

```bash
# JSON output with grammar
./llama-cli \
    -m model.gguf \
    -p "Generate a person: " \
    --grammar-file grammars/json.gbnf

# Outputs valid JSON only
```

### 上下文大小

```bash
# Increase context (default 512)
./llama-cli \
    -m model.gguf \
    -c 4096  # 4K context window

# Very long context (if model supports)
./llama-cli -m model.gguf -c 32768  # 32K context
```

## 性能基准

### CPU 性能（Llama 2-7B Q4_K_M）

| CPU | 线程数 | 速度 | 成本 |
|-----|---------|-------|------|
| Apple M3 Max | 16 | 50 tok/s | $0（本地） |
| AMD Ryzen 9 7950X | 32 | 35 tok/s | $0.50/小时 |
| Intel i9-13900K | 32 | 30 tok/s | $0.40/小时 |
| AWS c7i.16xlarge | 64 | 40 tok/s | $2.88/小时 |

### GPU 加速（Llama 2-7B Q4_K_M）

| GPU | 速度 | 相比 CPU | 成本 |
|-----|-------|--------|------|
| NVIDIA RTX 4090 | 120 tok/s | 3-4× | $0（本地） |
| NVIDIA A10 | 80 tok/s | 2-3× | $1.00/小时 |
| AMD MI250 | 70 tok/s | 2× | $2.00/小时 |
| Apple M3 Max (Metal) | 50 tok/s | 约相同 | $0（本地） |

## 支持的模型

**LLaMA 系列**：
- Llama 2 (7B, 13B, 70B)
- Llama 3 (8B, 70B, 405B)
- Code Llama

**Mistral 系列**：
- Mistral 7B
- Mixtral 8x7B, 8x22B

**其他**：
- Falcon, BLOOM, GPT-J
- Phi-3, Gemma, Qwen
- LLaVA（视觉）、Whisper（音频）

**查找模型**：https://huggingface.co/models?library=gguf

## 参考资料

- **[量化指南](references/quantization.md)** - GGUF 格式、转换、质量对比
- **[服务器部署](references/server.md)** - API 端点、Docker、监控
- **[优化](references/optimization.md)** - 性能调优、CPU+GPU 混合模式

## 资源

- **GitHub**：https://github.com/ggerganov/llama.cpp
- **模型**：https://huggingface.co/models?library=gguf
- **Discord**：https://discord.gg/llama-cpp