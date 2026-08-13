---
name: alterlab-esm
description: Run ESM protein language models — ESM3 for generative multimodal protein design across sequence, structure, and function, and ESM C for efficient embeddings and representations — locally or via the cloud Forge API. Use when working with protein sequences, structures, or function prediction, designing novel proteins, generating protein embeddings, performing inverse folding, or doing protein-engineering tasks. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs under `uv run python` with the `esm` package (pin `esm>=3.1,<3.2`; requires Python >=3.10). Local model weights run best on a CUDA GPU; CPU works for ESM C embeddings but is slow. The cloud Forge/Biohub API path requires an EvolutionaryScale token (ESM3ForgeInferenceClient)."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# ESM：进化尺度建模

## 概述

ESM 提供了先进的蛋白质语言模型，用于理解、生成和设计蛋白质。此 Skill 支持使用两个模型系列：ESM3，用于跨序列、结构和功能的生成式蛋白质设计；ESM C，用于高效的蛋白质表征学习和嵌入。

## 核心能力

### 1. 使用 ESM3 生成蛋白质序列

使用多模态生成建模来生成具有所需特性的新型蛋白质序列。

**适用场景：**
- 设计具有特定功能特性的蛋白质
- 补全部分蛋白质序列
- 生成现有蛋白质的变体
- 创建具有所需结构特征的蛋白质

**基本用法：**

```python
from esm.models.esm3 import ESM3
from esm.sdk.api import ESM3InferenceClient, ESMProtein, GenerationConfig

# Load model locally
model: ESM3InferenceClient = ESM3.from_pretrained("esm3-sm-open-v1").to("cuda")

# Create protein prompt
protein = ESMProtein(sequence="MPRT___KEND")  # '_' represents masked positions

# Generate completion
protein = model.generate(protein, GenerationConfig(track="sequence", num_steps=8))
print(protein.sequence)
```

**通过 Forge API 进行远程/云端使用：**

```python
from esm.sdk.forge import ESM3ForgeInferenceClient
from esm.sdk.api import ESMProtein, GenerationConfig

# Connect to Forge
model = ESM3ForgeInferenceClient(model="esm3-medium-2024-08", url="https://forge.evolutionaryscale.ai", token="<token>")

# Generate
protein = model.generate(protein, GenerationConfig(track="sequence", num_steps=8))
```

有关 ESM3 模型的详细规格、高级生成配置以及多模态提示示例，请参阅 `references/esm3-api.md`。

### 2. 结构预测与逆向折叠

使用 ESM3 的结构轨道进行基于序列的结构预测或逆向折叠（基于结构设计序列）。

**结构预测：**

```python
from esm.sdk.api import ESM3InferenceClient, ESMProtein, GenerationConfig

# Predict structure from a complete sequence
protein = ESMProtein(sequence="MPRTKEINDAGLIVHSP")
protein_with_structure = model.generate(
    protein,
    # num_steps controls how many structure tokens are decoded per step;
    # use the sequence length (not a "_" count — the sequence is complete here)
    GenerationConfig(track="structure", num_steps=len(protein.sequence))
)

# Access predicted structure
coordinates = protein_with_structure.coordinates  # 3D coordinates
pdb_string = protein_with_structure.to_pdb()
```

**逆向折叠（基于结构生成序列）：**

```python
# Design sequence for a target structure
protein_with_structure = ESMProtein.from_pdb("target_structure.pdb")
protein_with_structure.sequence = None  # Remove sequence

# Generate sequence that folds to this structure
designed_protein = model.generate(
    protein_with_structure,
    GenerationConfig(track="sequence", num_steps=50, temperature=0.7)
)
```

### 3. 使用 ESM C 生成蛋白质嵌入

为下游任务生成高质量嵌入，例如功能预测、分类或相似性分析。

**适用场景：**
- 提取用于机器学习的蛋白质表示
- 计算序列相似性
- 为蛋白质分类提取特征
- 对蛋白质相关任务进行迁移学习

**基本用法：**

```python
from esm.models.esmc import ESMC
from esm.sdk.api import ESMProtein, LogitsConfig

# Load ESM C model (note: local from_pretrained names use UNDERSCORES)
model = ESMC.from_pretrained("esmc_300m").to("cuda")

# Encode, then request embeddings via the logits() API
protein = ESMProtein(sequence="MPRTKEINDAGLIVHSP")
protein_tensor = model.encode(protein)
out = model.logits(protein_tensor, LogitsConfig(sequence=True, return_embeddings=True))

embeddings = out.embeddings   # (1, L+2, hidden_dim), incl. BOS/EOS tokens
logits = out.logits.sequence  # per-position amino-acid logits
```

不要调用 `model.forward(...)` 来获取嵌入——`forward` 返回的是原始模型输出，而不是可用的表示张量。请使用 `model.logits(..., LogitsConfig(return_embeddings=True)).embeddings`。

**批量处理：**

```python
# Encode multiple proteins and pull mean-pooled embeddings
proteins = [
    ESMProtein(sequence="MPRTKEIND"),
    ESMProtein(sequence="AGLIVHSPQ"),
    ESMProtein(sequence="KTEFLNDGR"),
]
cfg = LogitsConfig(sequence=True, return_embeddings=True)
embeddings_list = [
    model.logits(model.encode(p), cfg).embeddings.mean(dim=1) for p in proteins
]
```

有关 ESM C 模型的详细信息、效率比较和高级嵌入策略，请参阅 `references/esm-c-api.md`。

### 4. 功能条件控制与注释

使用 ESM3 的功能轨道生成带有特定功能注释的蛋白质，或根据序列预测功能。

**功能条件生成：**

```python
from esm.sdk.api import ESMProtein, FunctionAnnotation, GenerationConfig

# Create protein with desired function
protein = ESMProtein(
    sequence="_" * 200,  # Generate 200 residue protein
    function_annotations=[
        FunctionAnnotation(label="fluorescent_protein", start=50, end=150)
    ]
)

# Generate sequence with specified function
functional_protein = model.generate(
    protein,
    GenerationConfig(track="sequence", num_steps=200)
)
```

### 5. 思维链生成

使用 ESM3 的思维链生成方法迭代优化蛋白质设计。

```python
from esm.sdk.api import GenerationConfig

# Multi-step refinement
protein = ESMProtein(sequence="MPRT" + "_" * 100 + "KEND")

# Step 1: Generate initial structure
config = GenerationConfig(track="structure", num_steps=50)
protein = model.generate(protein, config)

# Step 2: Refine sequence based on structure
config = GenerationConfig(track="sequence", num_steps=50, temperature=0.5)
protein = model.generate(protein, config)

# Step 3: Predict function
config = GenerationConfig(track="function", num_steps=20)
protein = model.generate(protein, config)
```

### 6. 使用 Forge API 进行批量处理

使用 Forge 的异步执行器高效处理多个蛋白质。

```python
from esm.sdk.forge import ESM3ForgeInferenceClient
import asyncio

client = ESM3ForgeInferenceClient(model="esm3-medium-2024-08", token="<token>")

# Async batch processing
async def batch_generate(proteins_list):
    tasks = [
        client.async_generate(protein, GenerationConfig(track="sequence"))
        for protein in proteins_list
    ]
    return await asyncio.gather(*tasks)

# Execute
proteins = [ESMProtein(sequence=f"MPRT{'_' * 50}KEND") for _ in range(10)]
results = asyncio.run(batch_generate(proteins))
```

有关 Forge API 的详细文档、身份验证、速率限制和批量处理模式，请参阅 `references/forge-api.md`。

## 模型选择指南

**ESM3 模型（生成式）：**
- `esm3-sm-open-v1` (1.4B) - 开放权重，可在本地使用，适合实验
- `esm3-medium-2024-08` (7B) - 质量与速度之间的最佳平衡（仅限 Forge）
- `esm3-large-2024-03` (98B) - 质量最高，速度较慢（仅限 Forge）

**ESM C 模型（嵌入）：**
- `esmc_300m` (30 layers) - 轻量、推理速度快；开放权重，可在本地运行
- `esmc_600m` (36 layers) - 性能均衡；开放权重，可在本地运行
- `esmc-6b-2024-12` (80 layers) - 表征质量最高；仅限 Forge/Biohub API

命名注意事项：本地 `ESMC.from_pretrained(...)` 名称使用**下划线**（`esmc_300m`、`esmc_600m`）。Forge/Biohub 客户端字符串使用**连字符并带有日期**（例如 `esmc-6b-2024-12`）。

**选择标准：**
- **本地开发/测试：** 使用 `esm3-sm-open-v1` 或 `esmc_300m`
- **生产级质量：** 通过 Forge 使用 `esm3-medium-2024-08`
- **最高准确率：** 使用 `esm3-large-2024-03` 或 `esmc-6b-2024-12`
- **高吞吐量：** 使用带批量执行器的 Forge API
- **成本优化：** 使用更小的模型，并实施缓存策略

## 安装

**基本安装**（固定主版本——SDK 仍处于 alpha 阶段，次版本之间的 API 不稳定）：

```bash
uv pip install "esm>=3.1,<3.2"
```

**安装 Flash Attention（推荐，可加快 GPU 推理）：**

```bash
uv pip install flash-attn --no-build-isolation
```

Forge/Biohub 客户端（`ESM3ForgeInferenceClient`）已包含在 `esm` 包中，无需额外安装。请前往 https://forge.evolutionaryscale.ai 获取 API 令牌。

## 常见工作流

有关详细示例和完整工作流，请参阅 `references/workflows.md`，其中包括：
- 使用思维链设计新型 GFP
- 蛋白质变体生成和筛选
- 基于结构的序列优化
- 功能预测流水线
- 基于嵌入的聚类和分析

## 参考资料

此技能包含全面的参考文档：

- `references/esm3-api.md` - ESM3 模型架构、API 参考、生成参数和多模态提示
- `references/esm-c-api.md` - ESM C 模型详情、嵌入策略和性能优化
- `references/forge-api.md` - Forge 平台文档、身份验证、批量处理和部署
- `references/workflows.md` - 完整示例和常见工作流模式

这些参考资料包含详细的 API 规范、参数说明和高级用法模式。请根据具体任务的需要加载它们。

## 最佳实践

**对于生成任务：**
- 从较小的模型开始进行原型设计（`esm3-sm-open-v1`）
- 使用温度参数控制多样性（0.0 = 确定性，1.0 = 多样化）
- 对复杂设计使用思维链进行迭代优化
- 使用结构预测或湿实验验证生成的序列

**对于嵌入任务：**
- 尽可能批量处理序列以提高效率
- 缓存嵌入以用于重复分析
- 计算相似度时对嵌入进行归一化
- 根据下游任务的要求选择合适的模型大小

**对于生产部署：**
- 使用 Forge API，以获得可扩展性并使用最新模型
- 为 API 调用实现错误处理和重试逻辑
- 监控令牌使用量并实施速率限制
- 考虑使用 AWS SageMaker 部署专用基础设施

## 资源和文档

- **GitHub 仓库：** https://github.com/evolutionaryscale/esm
- **Forge 平台：** https://forge.evolutionaryscale.ai
- **科学论文：** Hayes 等人，Science（2025）- https://www.science.org/doi/10.1126/science.ads0018
- **博客文章：**
  - ESM3 发布： https://www.evolutionaryscale.ai/blog/esm3-release
  - ESM C 发布： https://www.evolutionaryscale.ai/blog/esm-cambrian
- **社区：** Slack 社区：https://bit.ly/3FKwcWd
- **模型权重：** HuggingFace EvolutionaryScale 组织

## 负责任的使用

ESM 专为蛋白质工程、药物发现和科学研究中的有益应用而设计。在设计新型蛋白质时，请遵循负责任生物设计框架（https://responsiblebiodesign.ai/）。在进行实验验证之前，请考虑蛋白质设计在生物安全和伦理方面的影响。