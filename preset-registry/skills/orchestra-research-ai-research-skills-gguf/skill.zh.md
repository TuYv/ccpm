---
name: gguf-quantization
description: GGUF format and llama.cpp quantization for efficient CPU/GPU inference. Use when deploying models on consumer hardware, Apple Silicon, or when needing flexible quantization from 2-8 bit without GPU requirements.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [GGUF, Quantization, llama.cpp, CPU Inference, Apple Silicon, Model Compression, Optimization]
dependencies: [llama-cpp-python>=0.2.0]
---
# GGUF - llama.cpp 的量化格式

GGUF（GPT-Generated Unified Format，GPT 生成的统一格式）是 llama.cpp 的标准文件格式，支持灵活的量化选项，可在 CPU、Apple Silicon 和 GPU 上实现高效推理。

## 何时使用 GGUF

**在以下情况下使用 GGUF：**
- 在消费级硬件（笔记本电脑、台式机）上部署
- 在 Apple Silicon（M1/M2/M3）上使用 Metal 加速运行
- 需要不依赖 GPU 的 CPU 推理
- 需要灵活的量化选项（Q2_K 到 Q8_0）
- 使用本地 AI 工具（LM Studio、Ollama、text-generation-webui）

**主要优势：**
- **通用硬件支持**：支持 CPU、Apple Silicon、NVIDIA、AMD
- **无需 Python 运行时**：纯 C/C++ 推理
- **灵活量化**：支持使用多种方法（K-quants）进行 2-8 位量化
- **生态系统支持**：支持 LM Studio、Ollama、koboldcpp 等
- **imatrix**：通过重要性矩阵提升低位量化的质量

**以下情况请改用其他方案：**
- **AWQ/GPTQ**：在 NVIDIA GPU 上通过校准实现最高准确率
- **HQQ**：面向 HuggingFace 的快速免校准量化
- **bitsandbytes**：与 transformers 库轻松集成
- **TensorRT-LLM**：以最高速度在 NVIDIA 环境中进行生产部署

## 快速开始

### 安装

```bash
# Clone llama.cpp
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp

# Build (CPU)
make

# Build with CUDA (NVIDIA)
make GGML_CUDA=1

# Build with Metal (Apple Silicon)
make GGML_METAL=1

# Install Python bindings (optional)
pip install llama-cpp-python
```

### 将模型转换为 GGUF

```bash
# Install requirements
pip install -r requirements.txt

# Convert HuggingFace model to GGUF (FP16)
python convert_hf_to_gguf.py ./path/to/model --outfile model-f16.gguf

# Or specify output type
python convert_hf_to_gguf.py ./path/to/model \
    --outfile model-f16.gguf \
    --outtype f16
```

### 量化模型

```bash
# Basic quantization to Q4_K_M
./llama-quantize model-f16.gguf model-q4_k_m.gguf Q4_K_M

# Quantize with importance matrix (better quality)
./llama-imatrix -m model-f16.gguf -f calibration.txt -o model.imatrix
./llama-quantize --imatrix model.imatrix model-f16.gguf model-q4_k_m.gguf Q4_K_M
```

### 运行推理

```bash
# CLI inference
./llama-cli -m model-q4_k_m.gguf -p "Hello, how are you?"

# Interactive mode
./llama-cli -m model-q4_k_m.gguf --interactive

# With GPU offload
./llama-cli -m model-q4_k_m.gguf -ngl 35 -p "Hello!"
```

## 量化类型

### K-quant 方法（推荐）

| 类型 | 位数 | 大小（7B） | 质量 | 使用场景 |
|------|------|-----------|---------|----------|
| Q2_K | 2.5 | ~2.8 GB | 低 | 极限压缩 |
| Q3_K_S | 3.0 | ~3.0 GB | 中低 | 内存受限 |
| Q3_K_M | 3.3 | ~3.3 GB | 中 | 均衡选择 |
| Q4_K_S | 4.0 | ~3.8 GB | 中高 | 良好平衡 |
| Q4_K_M | 4.5 | ~4.1 GB | 高 | **推荐的默认选项** |
| Q5_K_S | 5.0 | ~4.6 GB | 高 | 侧重质量 |
| Q5_K_M | 5.5 | ~4.8 GB | 非常高 | 高质量 |
| Q6_K | 6.0 | ~5.5 GB | 极佳 | 接近原始质量 |
| Q8_0 | 8.0 | ~7.2 GB | 最佳 | 最高质量 |

### 旧版方法

| 类型 | 描述 |
|------|-------------|
| Q4_0 | 4 位，基础方法 |
| Q4_1 | 4 位，使用增量 |
| Q5_0 | 5 位，基础方法 |
| Q5_1 | 5 位，使用增量 |

**建议**：使用 K-quant 方法（Q4_K_M、Q5_K_M），以获得最佳的质量/大小比。

## 转换工作流

### 工作流 1：从 HuggingFace 转换为 GGUF

```bash
# 1. Download model
huggingface-cli download meta-llama/Llama-3.1-8B --local-dir ./llama-3.1-8b

# 2. Convert to GGUF (FP16)
python convert_hf_to_gguf.py ./llama-3.1-8b \
    --outfile llama-3.1-8b-f16.gguf \
    --outtype f16

# 3. Quantize
./llama-quantize llama-3.1-8b-f16.gguf llama-3.1-8b-q4_k_m.gguf Q4_K_M

# 4. Test
./llama-cli -m llama-3.1-8b-q4_k_m.gguf -p "Hello!" -n 50
```

### 工作流 2：使用重要性矩阵（质量更好）

```bash
# 1. Convert to GGUF
python convert_hf_to_gguf.py ./model --outfile model-f16.gguf

# 2. Create calibration text (diverse samples)
cat > calibration.txt << 'EOF'
The quick brown fox jumps over the lazy dog.
Machine learning is a subset of artificial intelligence.
Python is a popular programming language.
# Add more diverse text samples...
EOF

# 3. Generate importance matrix
./llama-imatrix -m model-f16.gguf \
    -f calibration.txt \
    --chunk 512 \
    -o model.imatrix \
    -ngl 35  # GPU layers if available

# 4. Quantize with imatrix
./llama-quantize --imatrix model.imatrix \
    model-f16.gguf \
    model-q4_k_m.gguf \
    Q4_K_M
```

### 工作流 3：多种量化

```bash
#!/bin/bash
MODEL="llama-3.1-8b-f16.gguf"
IMATRIX="llama-3.1-8b.imatrix"

# Generate imatrix once
./llama-imatrix -m $MODEL -f wiki.txt -o $IMATRIX -ngl 35

# Create multiple quantizations
for QUANT in Q4_K_M Q5_K_M Q6_K Q8_0; do
    OUTPUT="llama-3.1-8b-${QUANT,,}.gguf"
    ./llama-quantize --imatrix $IMATRIX $MODEL $OUTPUT $QUANT
    echo "Created: $OUTPUT ($(du -h $OUTPUT | cut -f1))"
done
```

## Python 用法

### llama-cpp-python

```python
from llama_cpp import Llama

# Load model
llm = Llama(
    model_path="./model-q4_k_m.gguf",
    n_ctx=4096,          # Context window
    n_gpu_layers=35,     # GPU offload (0 for CPU only)
    n_threads=8          # CPU threads
)

# Generate
output = llm(
    "What is machine learning?",
    max_tokens=256,
    temperature=0.7,
    stop=["</s>", "\n\n"]
)
print(output["choices"][0]["text"])
```

### 聊天补全

```python
from llama_cpp import Llama

llm = Llama(
    model_path="./model-q4_k_m.gguf",
    n_ctx=4096,
    n_gpu_layers=35,
    chat_format="llama-3"  # Or "chatml", "mistral", etc.
)

messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is Python?"}
]

response = llm.create_chat_completion(
    messages=messages,
    max_tokens=256,
    temperature=0.7
)
print(response["choices"][0]["message"]["content"])
```

### 流式输出

```python
from llama_cpp import Llama

llm = Llama(model_path="./model-q4_k_m.gguf", n_gpu_layers=35)

# Stream tokens
for chunk in llm(
    "Explain quantum computing:",
    max_tokens=256,
    stream=True
):
    print(chunk["choices"][0]["text"], end="", flush=True)
```

## 服务器模式

### 启动 OpenAI 兼容服务器

```bash
# Start server
./llama-server -m model-q4_k_m.gguf \
    --host 0.0.0.0 \
    --port 8080 \
    -ngl 35 \
    -c 4096

# Or with Python bindings
python -m llama_cpp.server \
    --model model-q4_k_m.gguf \
    --n_gpu_layers 35 \
    --host 0.0.0.0 \
    --port 8080
```

### 与 OpenAI 客户端配合使用

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8080/v1",
    api_key="not-needed"
)

response = client.chat.completions.create(
    model="local-model",
    messages=[{"role": "user", "content": "Hello!"}],
    max_tokens=256
)
print(response.choices[0].message.content)
```

## 硬件优化

### Apple Silicon（Metal）

```bash
# Build with Metal
make clean && make GGML_METAL=1

# Run with Metal acceleration
./llama-cli -m model.gguf -ngl 99 -p "Hello"

# Python with Metal
llm = Llama(
    model_path="model.gguf",
    n_gpu_layers=99,     # Offload all layers
    n_threads=1          # Metal handles parallelism
)
```

### NVIDIA CUDA

```bash
# Build with CUDA
make clean && make GGML_CUDA=1

# Run with CUDA
./llama-cli -m model.gguf -ngl 35 -p "Hello"

# Specify GPU
CUDA_VISIBLE_DEVICES=0 ./llama-cli -m model.gguf -ngl 35
```

### CPU 优化

```bash
# Build with AVX2/AVX512
make clean && make

# Run with optimal threads
./llama-cli -m model.gguf -t 8 -p "Hello"

# Python CPU config
llm = Llama(
    model_path="model.gguf",
    n_gpu_layers=0,      # CPU only
    n_threads=8,         # Match physical cores
    n_batch=512          # Batch size for prompt processing
)
```

## 与工具集成

### Ollama

```bash
# Create Modelfile
cat > Modelfile << 'EOF'
FROM ./model-q4_k_m.gguf
TEMPLATE """{{ .System }}
{{ .Prompt }}"""
PARAMETER temperature 0.7
PARAMETER num_ctx 4096
EOF

# Create Ollama model
ollama create mymodel -f Modelfile

# Run
ollama run mymodel "Hello!"
```

### LM Studio

1. 将 GGUF 文件放入 `~/.cache/lm-studio/models/`
2. 打开 LM Studio 并选择模型
3. 配置上下文长度和 GPU 卸载
4. 开始推理

### text-generation-webui

```bash
# Place in models folder
cp model-q4_k_m.gguf text-generation-webui/models/

# Start with llama.cpp loader
python server.py --model model-q4_k_m.gguf --loader llama.cpp --n-gpu-layers 35
```

## 最佳实践

1. **使用 K-quants**：Q4_K_M 可在质量与大小之间实现最佳平衡
2. **使用 imatrix**：对于 Q4 及以下量化，始终使用重要性矩阵
3. **GPU 卸载**：在显存允许的情况下卸载尽可能多的层
4. **上下文长度**：从 4096 开始，并根据需要增加
5. **线程数**：与物理 CPU 核心数匹配，而非逻辑核心数
6. **批大小**：增大 n_batch 可加快提示词处理速度

## 常见问题

**模型加载缓慢：**
```bash
# Use mmap for faster loading
./llama-cli -m model.gguf --mmap
```

**内存不足：**
```bash
# Reduce GPU layers
./llama-cli -m model.gguf -ngl 20  # Reduce from 35

# Or use smaller quantization
./llama-quantize model-f16.gguf model-q3_k_m.gguf Q3_K_M
```

**低比特量化时质量较差：**
```bash
# Always use imatrix for Q4 and below
./llama-imatrix -m model-f16.gguf -f calibration.txt -o model.imatrix
./llama-quantize --imatrix model.imatrix model-f16.gguf model-q4_k_m.gguf Q4_K_M
```

## 参考资料

- **[高级用法](references/advanced-usage.md)** - 批处理、推测解码、自定义构建
- **[故障排除](references/troubleshooting.md)** - 常见问题、调试、基准测试

## 资源

- **代码仓库**：https://github.com/ggml-org/llama.cpp
- **Python 绑定**：https://github.com/abetlen/llama-cpp-python
- **预量化模型**：https://huggingface.co/TheBloke
- **GGUF 转换器**：https://huggingface.co/spaces/ggml-org/gguf-my-repo
- **许可证**：MIT