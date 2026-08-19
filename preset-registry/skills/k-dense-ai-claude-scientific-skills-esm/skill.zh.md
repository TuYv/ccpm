---
name: esm
description: Use when working directly with the `esm` Python SDK, ESM3 or ESMC model IDs, Forge/Biohub inference clients, or ESMFold2 folding workflows.
license: MIT license
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
---
# ESM：进化尺度建模

## 概述

ESM 提供用于理解、生成和设计蛋白质的蛋白质语言模型。对于当前的 EvolutionaryScale/Biohub 工作流，请使用此 skill：ESM3 用于生成式设计，ESMC 用于表示学习和嵌入，托管的 Forge/Biohub 推理，以及 ESMFold2 全原子结构预测。

## 核心功能

### 1. 使用 ESM3 生成蛋白质序列

使用多模态生成建模来生成具有期望属性的新型蛋白质序列。

**使用场景：**
- 设计具有特定功能属性的蛋白质
- 补全部分蛋白质序列
- 生成现有蛋白质的变体
- 创建具有期望结构特征的蛋白质

**基本用法：**

```python
from esm.models.esm3 import ESM3
from esm.sdk.api import ESM3InferenceClient, ESMProtein, GenerationConfig

# Load local open weights after accepting the license on Hugging Face.
model: ESM3InferenceClient = ESM3.from_pretrained("esm3-open").to("cuda")

# Create protein prompt
protein = ESMProtein(sequence="MPRT___KEND")  # '_' represents masked positions

# Generate completion
protein = model.generate(protein, GenerationConfig(track="sequence", num_steps=8))
print(protein.sequence)
```

**通过 Forge API 进行远程/云端使用：**

```python
import os
import esm
from esm.sdk.api import ESMProtein, GenerationConfig

# Same interface as local ESM3; token from ESM_API_KEY (see Authentication)
model = esm.sdk.client("esm3-medium-2024-08", token=os.environ["ESM_API_KEY"])

# Generate
protein = model.generate(protein, GenerationConfig(track="sequence", num_steps=8))
```

参见 `references/esm3-api.md`，了解详细的 ESM3 模型规范、高级生成配置和多模态提示示例。

### 2. 结构预测与逆折叠

使用 ESM3 的结构轨道，从序列进行结构预测，或执行逆折叠（根据结构设计序列）。

**结构预测：**

```python
from esm.sdk.api import ESM3InferenceClient, ESMProtein, GenerationConfig

# Predict structure from sequence
protein = ESMProtein(sequence="MPRTKEINDAGLIVHSP...")
protein_with_structure = model.generate(
    protein,
    GenerationConfig(track="structure", num_steps=protein.sequence.count("_"))
)

# Access predicted structure
coordinates = protein_with_structure.coordinates  # 3D coordinates
pdb_string = protein_with_structure.to_pdb()
```

**逆折叠（从结构生成序列）：**

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

为功能预测、分类或相似性分析等下游任务生成高质量嵌入。

**使用场景：**
- 提取用于机器学习的蛋白质表示
- 计算序列相似度
- 提取用于蛋白质分类的特征
- 针对蛋白质相关任务进行迁移学习

**基本用法：**

```python
from esm.models.esmc import ESMC
from esm.sdk.api import ESMProtein, LogitsConfig

# Load ESM C model
model = ESMC.from_pretrained("esmc_300m").to("cuda")

# Get embeddings
protein = ESMProtein(sequence="MPRTKEINDAGLIVHSP...")
protein_tensor = model.encode(protein)
logits_output = model.logits(
    protein_tensor,
    LogitsConfig(sequence=True, return_embeddings=True),
)
embeddings = logits_output.embeddings
```

**批处理：**

```python
# Encode multiple proteins
proteins = [
    ESMProtein(sequence="MPRTKEIND..."),
    ESMProtein(sequence="AGLIVHSPQ..."),
    ESMProtein(sequence="KTEFLNDGR...")
]

embeddings_list = [
    model.logits(
        model.encode(p),
        LogitsConfig(sequence=True, return_embeddings=True),
    ).embeddings
    for p in proteins
]
```

请参阅 `references/esm-c-api.md`，了解 ESM C 模型的详细信息、效率比较以及高级嵌入策略。

### 4. 函数条件控制与注释

使用 ESM3 的函数轨道生成具有特定功能注释的蛋白质，或根据序列预测功能。

**函数条件控制生成：**

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

使用 ESM3 的思维链生成方法，迭代改进蛋白质设计。

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

### 6. 使用 Forge API 进行批处理

使用 Forge 的异步方法高效处理多个蛋白质。

```python
import os
import asyncio
import esm
from esm.sdk.api import ESMProtein, GenerationConfig

client = esm.sdk.client("esm3-medium-2024-08", token=os.environ["ESM_API_KEY"])

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

有关详细的 Forge API 文档、身份验证、速率限制和批处理模式，请参阅 `references/forge-api.md`。

## 模型选择指南

**ESM3 模型（生成式）：**
- `esm3-open` (1.4B) - 开放权重，接受 Hugging Face 许可后可本地使用
- `esm3-medium-2024-08` (7B) - 质量与速度的最佳平衡（仅限 Forge）
- `esm3-large-2024-03` (98B) - 最高质量，速度较慢（仅限 Forge）

**ESM C 模型（嵌入）：**
- `esmc_300m` / `esmc-300m-2024-12` (30 layers) - 轻量、推理速度快（开放权重，本地使用）
- `esmc_600m` / `esmc-600m-2024-12` (36 layers) - 性能均衡（开放权重，本地使用）
- `esmc-6b-2024-12` (80 layers) - 最高质量（Forge API；本地 6B 权重需要 Forge 或 SageMaker）

本地 `ESMC.from_pretrained()` 示例使用带下划线的别名（`esmc_300m`、`esmc_600m`）。托管 API 客户端使用带日期的模型 ID，例如 `esmc-600m-2024-12`。

**选择标准：**
- **本地开发/测试：** 使用 `esm3-open` 或 `esmc_300m`
- **生产质量：** 通过 Forge 使用 `esm3-medium-2024-08`
- **最高准确率：** 通过 Forge 使用 `esm3-large-2024-03` 或 `esmc-6b-2024-12`
- **高吞吐量：** 使用 Forge 或 Biohub API，并明确限制异步并发数
- **成本优化：** 使用较小的模型，并实施缓存策略

## 安装

从 PyPI 安装（EvolutionaryScale 的 [PyPI 上的 `esm`](https://pypi.org/project/esm/)）。当前 PyPI 版本：**3.2.3**（2025 年 10 月 14 日）。要求 **Python >=3.12,<3.13**。

**基本安装：**

```bash
uv pip install "esm==3.2.3"
```

**使用 Flash Attention（推荐用于在 NVIDIA GPU 上加快推理）：**

```bash
uv pip install "esm==3.2.3"
uv pip install flash-attn --no-build-isolation
```

Forge 客户端随 `esm` 包一起提供——无需额外安装即可进行 ESM3 或 ESMC Forge 推理。

## 身份验证

Forge API 访问需要 API 密钥。切勿将令牌硬编码到脚本中，也不要将其提交到版本控制系统。

1. 检查环境中是否已设置 `ESM_API_KEY`。
2. 如果未设置，则仅检查本地 `.env` 中的 `ESM_API_KEY`（不要加载无关的密钥）。
3. 如果仍然缺失，请在 [Biohub 开发者控制台](https://biohub.ai/developer-console/api-keys)中为 Biohub API 创建密钥，或在 [Forge](https://forge.evolutionaryscale.ai) 中为旧版 Forge 托管的 ESM3/ESMC 访问创建密钥。

```python
import os

token = os.environ["ESM_API_KEY"]  # raises KeyError if unset
```

当省略 `token` 时，`esm.sdk.client()` 会自动读取 `ESM_API_KEY`。将端点 URL 固定为受信任的主机，例如 `https://forge.evolutionaryscale.ai` 或 `https://biohub.ai`；不要接受来自不受信任用户输入的 API 主机。

**Biohub 平台：** EvolutionaryScale 和 Forge 现在通过 [biohub.ai](https://biohub.ai) 提供当前的托管模型。SDK 类名可能仍引用“Forge”。有关 ESMFold2 和 Biohub 特定设置，请参阅 `references/biohub-platform.md`。

## 常见工作流

有关详细示例和完整工作流，请参阅 `references/workflows.md`，其中包括：
- 使用思维链进行新型 GFP 设计
- 蛋白质变体生成与筛选
- 基于结构的序列优化
- 功能预测流水线
- 基于嵌入的聚类与分析

## 参考资料

此技能包含全面的参考文档：

- `references/esm3-api.md` - ESM3 模型架构、API 参考、生成参数和多模态提示
- `references/esm-c-api.md` - ESM C 模型详情、嵌入策略和性能优化
- `references/forge-api.md` - Forge 平台文档、身份验证、批处理和部署
- `references/biohub-platform.md` - Biohub API 迁移、ESMFold2 结构预测和开发者控制台身份验证
- `references/workflows.md` - 完整示例和常见工作流模式

这些参考资料包含详细的 API 规范、参数说明和高级使用模式。请根据具体任务按需加载。

## 最佳实践

**对于生成任务：**
- 从较小的模型开始进行原型设计（`esm3-open`）
- 使用 temperature 参数控制多样性（0.0 = 确定性，1.0 = 多样性）
- 对于复杂设计，使用思维链实现迭代式优化
- 使用结构预测或湿实验验证生成的序列

**对于嵌入任务：**
- 尽可能对序列进行批处理，以提高效率
- 缓存嵌入结果，以便重复分析
- 计算相似度时对嵌入进行归一化
- 根据下游任务需求使用适当大小的模型

**对于生产部署：**
- 使用 Forge API 以获得可扩展性和最新模型
- 为 API 调用实现错误处理和重试逻辑
- 监控 token 使用量并实施速率限制
- 考虑使用 AWS SageMaker 部署专用基础设施

## 资源和文档

- **GitHub 仓库：** https://github.com/Biohub/esm （当前的 ESMC/ESMFold2/Biohub 文档；ESM3 文档仍从该仓库链接）
- **Forge 平台：** https://forge.evolutionaryscale.ai
- **Biohub 平台：** https://biohub.ai
- **科学论文：** Hayes et al., Science (2025) - https://www.science.org/doi/10.1126/science.ads0018
- **博客文章：**
  - ESM3 发布：https://www.evolutionaryscale.ai/blog/esm3-release
  - ESM C 发布：https://www.evolutionaryscale.ai/blog/esm-cambrian
- **社区：** Slack 社区位于 https://bit.ly/3FKwcWd
- **模型权重：** Hugging Face EvolutionaryScale 和 Biohub 组织

## 负责任的使用

ESM 旨在用于蛋白质工程、药物发现和科学研究等有益应用。在设计新型蛋白质时，请遵循负责任生物设计框架（https://responsiblebiodesign.ai/）和 Biohub 可接受使用政策（https://biohub.org/acceptable-use-policy/）。在进行实验验证之前，请考虑蛋白质设计的生物安全和伦理影响。