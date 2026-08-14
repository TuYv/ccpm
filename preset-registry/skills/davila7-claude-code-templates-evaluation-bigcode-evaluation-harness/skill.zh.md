---
name: evaluating-code-models
description: Evaluates code generation models across HumanEval, MBPP, MultiPL-E, and 15+ benchmarks with pass@k metrics. Use when benchmarking code models, comparing coding abilities, testing multi-language support, or measuring code generation quality. Industry standard from BigCode Project used by HuggingFace leaderboards.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Evaluation, Code Generation, HumanEval, MBPP, MultiPL-E, Pass@k, BigCode, Benchmarking, Code Models]
dependencies: [bigcode-evaluation-harness, transformers>=4.25.1, accelerate>=0.13.2, datasets>=2.6.1]
---
# BigCode Evaluation Harness - 代码模型基准测试

## 快速开始

BigCode Evaluation Harness 可在 15 个以上的基准测试中评估代码生成模型，包括 HumanEval、MBPP 和 MultiPL-E（18 种语言）。

**安装**：
```bash
git clone https://github.com/bigcode-project/bigcode-evaluation-harness.git
cd bigcode-evaluation-harness
pip install -e .
accelerate config
```

**在 HumanEval 上评估**：
```bash
accelerate launch main.py \
  --model bigcode/starcoder2-7b \
  --tasks humaneval \
  --max_length_generation 512 \
  --temperature 0.2 \
  --n_samples 20 \
  --batch_size 10 \
  --allow_code_execution \
  --save_generations
```

**查看可用任务**：
```bash
python -c "from bigcode_eval.tasks import ALL_TASKS; print(ALL_TASKS)"
```

## 常见工作流

### 工作流 1：标准代码基准评估

在核心代码基准测试（HumanEval、MBPP、HumanEval+）上评估模型。

**检查清单**：
```
Code Benchmark Evaluation:
- [ ] Step 1: Choose benchmark suite
- [ ] Step 2: Configure model and generation
- [ ] Step 3: Run evaluation with code execution
- [ ] Step 4: Analyze pass@k results
```

**步骤 1：选择基准测试套件**

**Python 代码生成**（最常见）：
- **HumanEval**：164 道手工编写的题目，函数补全
- **HumanEval+**：与 HumanEval 相同的 164 道题目，但测试数量多 80 倍（更严格）
- **MBPP**：500 道众包题目，入门级难度
- **MBPP+**：399 道精选题目，测试数量多 35 倍

**多语言**（18 种语言）：
- **MultiPL-E**：将 HumanEval/MBPP 翻译为 C++、Java、JavaScript、Go、Rust 等语言

**高级**：
- **APPS**：10,000 道题目（入门/面试/竞赛）
- **DS-1000**：涵盖 7 个库的 1,000 道数据科学题目

**步骤 2：配置模型和生成参数**

```bash
# Standard HuggingFace model
accelerate launch main.py \
  --model bigcode/starcoder2-7b \
  --tasks humaneval \
  --max_length_generation 512 \
  --temperature 0.2 \
  --do_sample True \
  --n_samples 200 \
  --batch_size 50 \
  --allow_code_execution

# Quantized model (4-bit)
accelerate launch main.py \
  --model codellama/CodeLlama-34b-hf \
  --tasks humaneval \
  --load_in_4bit \
  --max_length_generation 512 \
  --allow_code_execution

# Custom/private model
accelerate launch main.py \
  --model /path/to/my-code-model \
  --tasks humaneval \
  --trust_remote_code \
  --use_auth_token \
  --allow_code_execution
```

**步骤 3：运行评估**

```bash
# Full evaluation with pass@k estimation (k=1,10,100)
accelerate launch main.py \
  --model bigcode/starcoder2-7b \
  --tasks humaneval \
  --temperature 0.8 \
  --n_samples 200 \
  --batch_size 50 \
  --allow_code_execution \
  --save_generations \
  --metric_output_path results/starcoder2-humaneval.json
```

**步骤 4：分析结果**

结果位于 `results/starcoder2-humaneval.json`：
```json
{
  "humaneval": {
    "pass@1": 0.354,
    "pass@10": 0.521,
    "pass@100": 0.689
  },
  "config": {
    "model": "bigcode/starcoder2-7b",
    "temperature": 0.8,
    "n_samples": 200
  }
}
```

### 工作流 2：多语言评估（MultiPL-E）

评估跨 18 种编程语言的代码生成能力。

**检查清单**：
```
Multi-Language Evaluation:
- [ ] Step 1: Generate solutions (host machine)
- [ ] Step 2: Run evaluation in Docker (safe execution)
- [ ] Step 3: Compare across languages
```

**步骤 1：在主机上生成解决方案**

```bash
# Generate without execution (safe)
accelerate launch main.py \
  --model bigcode/starcoder2-7b \
  --tasks multiple-py,multiple-js,multiple-java,multiple-cpp \
  --max_length_generation 650 \
  --temperature 0.8 \
  --n_samples 50 \
  --batch_size 50 \
  --generation_only \
  --save_generations \
  --save_generations_path generations_multi.json
```

**步骤 2：在 Docker 容器中进行评估**

```bash
# Pull the MultiPL-E Docker image
docker pull ghcr.io/bigcode-project/evaluation-harness-multiple

# Run evaluation inside container
docker run -v $(pwd)/generations_multi.json:/app/generations.json:ro \
  -it evaluation-harness-multiple python3 main.py \
  --model bigcode/starcoder2-7b \
  --tasks multiple-py,multiple-js,multiple-java,multiple-cpp \
  --load_generations_path /app/generations.json \
  --allow_code_execution \
  --n_samples 50
```

**支持的语言**：Python、JavaScript、Java、C++、Go、Rust、TypeScript、C#、PHP、Ruby、Swift、Kotlin、Scala、Perl、Julia、Lua、R、Racket

### 工作流 3：指令微调模型评估

使用正确的格式评估聊天/指令模型。

**检查清单**：
```
Instruction Model Evaluation:
- [ ] Step 1: Use instruction-tuned tasks
- [ ] Step 2: Configure instruction tokens
- [ ] Step 3: Run evaluation
```

**步骤 1：选择指令任务**

- **instruct-humaneval**：使用指令提示的 HumanEval
- **humanevalsynthesize-{lang}**：HumanEvalPack 代码合成任务

**步骤 2：配置指令词元**

```bash
# For models with chat templates (e.g., CodeLlama-Instruct)
accelerate launch main.py \
  --model codellama/CodeLlama-7b-Instruct-hf \
  --tasks instruct-humaneval \
  --instruction_tokens "<s>[INST],</s>,[/INST]" \
  --max_length_generation 512 \
  --allow_code_execution
```

**步骤 3：用于指令模型的 HumanEvalPack**

```bash
# Test code synthesis across 6 languages
accelerate launch main.py \
  --model codellama/CodeLlama-7b-Instruct-hf \
  --tasks humanevalsynthesize-python,humanevalsynthesize-js \
  --prompt instruct \
  --max_length_generation 512 \
  --allow_code_execution
```

### 工作流 4：比较多个模型

用于模型比较的基准测试套件。

**步骤 1：创建评估脚本**

```bash
#!/bin/bash
# eval_models.sh

MODELS=(
  "bigcode/starcoder2-7b"
  "codellama/CodeLlama-7b-hf"
  "deepseek-ai/deepseek-coder-6.7b-base"
)
TASKS="humaneval,mbpp"

for model in "${MODELS[@]}"; do
  model_name=$(echo $model | tr '/' '-')
  echo "Evaluating $model"

  accelerate launch main.py \
    --model $model \
    --tasks $TASKS \
    --temperature 0.2 \
    --n_samples 20 \
    --batch_size 20 \
    --allow_code_execution \
    --metric_output_path results/${model_name}.json
done
```

**步骤 2：生成对比表**

```python
import json
import pandas as pd

models = ["bigcode-starcoder2-7b", "codellama-CodeLlama-7b-hf", "deepseek-ai-deepseek-coder-6.7b-base"]
results = []

for model in models:
    with open(f"results/{model}.json") as f:
        data = json.load(f)
        results.append({
            "Model": model,
            "HumanEval pass@1": f"{data['humaneval']['pass@1']:.3f}",
            "MBPP pass@1": f"{data['mbpp']['pass@1']:.3f}"
        })

df = pd.DataFrame(results)
print(df.to_markdown(index=False))
```

## 何时使用以及何时选择替代方案

**在以下情况下使用 BigCode Evaluation Harness：**
- 专门评估**代码生成**模型
- 需要进行**多语言**评估（通过 MultiPL-E 支持 18 种语言）
- 使用单元测试（pass@k）测试**功能正确性**
- 针对 **BigCode/HuggingFace 排行榜**进行基准测试
- 评估**中间填充**（FIM）能力

**在以下情况下改用替代方案：**
- **lm-evaluation-harness**：通用 LLM 基准测试（MMLU、GSM8K、HellaSwag）
- **EvalPlus**：测试用例更多、要求更严格的 HumanEval+/MBPP+
- **SWE-bench**：解决真实世界中的 GitHub issue
- **LiveCodeBench**：无污染、持续更新的题目
- **CodeXGLUE**：代码理解任务（克隆检测、缺陷预测）

## 支持的基准测试

| 基准测试 | 题目数 | 语言 | 指标 | 使用场景 |
|-----------|----------|-----------|--------|----------|
| HumanEval | 164 | Python | pass@k | 标准代码补全 |
| HumanEval+ | 164 | Python | pass@k | 更严格的评估（80 倍测试） |
| MBPP | 500 | Python | pass@k | 入门级题目 |
| MBPP+ | 399 | Python | pass@k | 更严格的评估（35 倍测试） |
| MultiPL-E | 164×18 | 18 种语言 | pass@k | 多语言评估 |
| APPS | 10,000 | Python | pass@k | 竞赛级别 |
| DS-1000 | 1,000 | Python | pass@k | 数据科学（pandas、numpy 等） |
| HumanEvalPack | 164×3×6 | 6 种语言 | pass@k | 生成/修复/解释 |
| Mercury | 1,889 | Python | 效率 | 计算效率 |

## 常见问题

**问题：结果与论文中报告的结果不同**

检查以下因素：
```bash
# 1. Verify n_samples (need 200 for accurate pass@k)
--n_samples 200

# 2. Check temperature (0.2 for greedy-ish, 0.8 for sampling)
--temperature 0.8

# 3. Verify task name matches exactly
--tasks humaneval  # Not "human_eval" or "HumanEval"

# 4. Check max_length_generation
--max_length_generation 512  # Increase for longer problems
```

**问题：CUDA 内存不足**

```bash
# Use quantization
--load_in_8bit
# OR
--load_in_4bit

# Reduce batch size
--batch_size 1

# Set memory limit
--max_memory_per_gpu "20GiB"
```

**问题：代码执行挂起或超时**

使用 Docker 安全执行：
```bash
# Generate on host (no execution)
--generation_only --save_generations

# Evaluate in Docker
docker run ... --allow_code_execution --load_generations_path ...
```

**问题：指令模型得分较低**

确保使用正确的指令格式：
```bash
# Use instruction-specific tasks
--tasks instruct-humaneval

# Set instruction tokens for your model
--instruction_tokens "<s>[INST],</s>,[/INST]"
```

**问题：MultiPL-E 语言执行失败**

使用专用 Docker 镜像：
```bash
docker pull ghcr.io/bigcode-project/evaluation-harness-multiple
```

## 命令参考

| 参数 | 默认值 | 说明 |
|----------|---------|-------------|
| `--model` | - | HuggingFace 模型 ID 或本地路径 |
| `--tasks` | - | 以逗号分隔的任务名称 |
| `--n_samples` | 1 | 每道题的样本数（计算 pass@k 时为 200） |
| `--temperature` | 0.2 | 采样温度 |
| `--max_length_generation` | 512 | 最大 token 数（提示词 + 生成内容） |
| `--batch_size` | 1 | 每个 GPU 的批次大小 |
| `--allow_code_execution` | False | 启用代码执行（必需） |
| `--generation_only` | False | 仅生成而不评估 |
| `--load_generations_path` | - | 加载预先生成的解决方案 |
| `--save_generations` | False | 保存生成的代码 |
| `--metric_output_path` | results.json | 指标输出文件 |
| `--load_in_8bit` | False | 8 位量化 |
| `--load_in_4bit` | False | 4 位量化 |
| `--trust_remote_code` | False | 允许自定义模型代码 |
| `--precision` | fp32 | 模型精度（fp32/fp16/bf16） |

## 硬件要求

| 模型大小 | 显存（fp16） | 显存（4 位） | 耗时（HumanEval，n=200） |
|------------|-------------|--------------|-------------------------|
| 7B | 14GB | 6GB | 约 30 分钟（A100） |
| 13B | 26GB | 10GB | 约 1 小时（A100） |
| 34B | 68GB | 20GB | 约 2 小时（A100） |

## 资源

- **GitHub**：https://github.com/bigcode-project/bigcode-evaluation-harness
- **文档**：https://github.com/bigcode-project/bigcode-evaluation-harness/tree/main/docs
- **BigCode 排行榜**：https://huggingface.co/spaces/bigcode/bigcode-models-leaderboard
- **HumanEval 数据集**：https://huggingface.co/datasets/openai/openai_humaneval
- **MultiPL-E**：https://github.com/nuprl/MultiPL-E