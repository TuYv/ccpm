---
name: alterlab-pathml
description: Run full computational-pathology workflows with PathML — whole-slide-image (WSI) analysis across 160+ slide formats, multiplexed immunofluorescence (CODEX, Vectra, MERFISH), nucleus segmentation/classification (HoVer-Net, HACTNet), tissue- and cell-graph construction, HDF5 dataset management, and deep-learning model training on pathology data. Use when the user builds end-to-end deep-learning pathology pipelines, analyzes multiplexed or spatial-proteomics slides, or segments nuclei. For lightweight H&E slide preprocessing, tissue masking, or plain Random/Grid/Score tile extraction prefer alterlab-histolab instead. Part of the AlterLab Academic Skills suite.
license: GPL-2.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# PathML

## 概述

PathML 是一个面向计算病理学工作流的综合性 Python 工具包，旨在促进全切片病理图像的机器学习和图像分析。该框架提供模块化、可组合的工具，用于加载各种切片格式、预处理图像、构建空间图、训练深度学习模型，以及分析来自 CODEX 和多重免疫荧光等技术的多参数成像数据。

## 何时使用此技能

此技能适用于：
- 加载和处理各种专有格式的全切片图像（WSI）
- 通过染色归一化预处理 H&E 染色的组织图像
- 细胞核检测、分割和分类工作流
- 构建用于空间分析的细胞图和组织图
- 在病理学数据上训练或部署机器学习模型（HoVer-Net、HACTNet）
- 分析用于空间蛋白质组学的多参数成像数据（CODEX、Vectra、MERFISH）
- 对多重免疫荧光中的标志物表达进行定量分析
- 使用 HDF5 存储管理大规模病理学数据集
- 基于图块的分析和拼接操作

## 核心功能

PathML 提供六大功能领域，参考文件中对这些功能进行了详细说明：

### 1. 图像加载与格式

加载 160 多种专有格式的全切片图像，包括 Aperio SVS、Hamamatsu NDPI、Leica SCN、Zeiss ZVI、DICOM 和 OME-TIFF。PathML 会自动处理供应商特定的格式，并提供统一接口，用于访问图像金字塔、元数据和感兴趣区域。

**参见：** `references/image_loading.md`，了解支持的格式、加载策略以及如何处理不同的切片类型。

### 2. 预处理流水线

通过组合用于图像处理、质量控制、染色归一化、组织检测和掩膜操作的变换，构建模块化预处理流水线。PathML 的 Pipeline 架构支持在大型数据集上进行可复现、可扩展的预处理。

**关键变换：**
- `StainNormalizationHE` - Macenko/Vahadane 染色归一化
- `TissueDetectionHE`、`NucleusDetectionHE` - 组织/细胞核分割
- `MedianBlur`、`GaussianBlur` - 降噪
- `LabelArtifactTileHE` - 伪影质量控制

**参见：** `references/preprocessing.md`，了解完整的变换目录、流水线构建和预处理工作流。

### 3. 图构建

构建表示细胞及组织层级关系的空间图。从分割后的对象中提取特征，以创建适用于图神经网络和空间分析的图结构表示。

**参见：** `references/graphs.md`，了解图构建方法、特征提取和空间分析工作流。

### 4. 机器学习

训练和部署用于细胞核检测、分割和分类的深度学习模型。PathML 集成了 PyTorch，并提供预构建模型（HoVer-Net、HACTNet）、自定义 DataLoaders 以及用于推理的 ONNX 支持。

**关键模型：**
- **HoVer-Net** - 同时进行细胞核分割和分类
- **HACTNet** - 分层细胞类型分类

**另请参阅：** `references/machine_learning.md`，了解模型训练、评估、推理工作流以及公共数据集的使用方法。

### 5. 多参数成像

分析来自 CODEX、Vectra、MERFISH 和其他多重成像平台的空间蛋白质组学和基因表达数据。PathML 提供专用的切片类和转换，用于处理多参数数据、使用 Mesmer 进行细胞分割以及执行定量工作流。

**另请参阅：** `references/multiparametric.md`，了解 CODEX/Vectra 工作流、细胞分割、标记物定量以及与 AnnData 的集成。

### 6. 数据管理

使用 HDF5 格式高效存储和管理大型病理学数据集。PathML 在针对机器学习工作流优化的统一存储结构中处理图块、掩码、元数据和提取的特征。

**另请参阅：** `references/data_management.md`，了解 HDF5 集成、图块管理、数据集组织和批处理策略。

## 快速入门

### 安装

PathML 固定使用特定版本的 OpenSlide、Bio-Formats（通过 JPype/JVM）和 DeepCell。维护者建议使用 conda 环境；仅使用 pip 安装经常会因 OpenSlide/Java 原生依赖而失败。在固定版本之前，请根据 PathML README 核实受支持的 Python 版本。

```bash
# PathML expects its native deps (OpenSlide, a JDK for Bio-Formats) present first.
uv pip install pathml
```

### 基本工作流示例

```python
from pathml.core import HESlide
from pathml.preprocessing import Pipeline, StainNormalizationHE, TissueDetectionHE

# Load a whole-slide image. Use the HESlide convenience class for H&E,
# or SlideData(filepath=..., slide_type=types.HE) for the generic constructor.
# (There is no SlideData.from_slide.)
wsi = HESlide("path/to/slide.svs", name="example")

# Create preprocessing pipeline
pipeline = Pipeline([
    TissueDetectionHE(),
    StainNormalizationHE(target="normalize", stain_estimation_method="macenko"),
])

# Run the pipeline on the slide (SlideData.run handles tiling + transforms)
wsi.run(pipeline)

# Access processed tiles
for tile in wsi.tiles:
    processed_image = tile.image
    tissue_mask = tile.masks["tissue"]
```

### 常见工作流

**H&E 图像分析：**
1. 使用适当的切片类加载 WSI
2. 应用组织检测和染色归一化
3. 执行细胞核检测或训练分割模型
4. 提取特征并构建空间图
5. 进行下游分析

**多参数成像（CODEX）：**
1. 使用 `CODEXSlide` 加载 CODEX 切片
2. 使用 `CollapseRunsCODEX` 合并多轮运行的通道数据
3. 使用 `SegmentMIF`（Mesmer）分割细胞
4. 使用 `QuantifyMIF` 定量每个细胞的标记物表达
5. 从 `slide.counts` 读取生成的 AnnData，以进行单细胞分析

**训练机器学习模型：**
1. 使用 `pathml.datasets` DataModule（例如 `PanNukeDataModule`）或 `TileDataset` 准备数据
2. 使用标准 PyTorch 循环训练 `HoVerNet`（或其他模型）
3. 使用 `post_process_batch_hovernet` 对预测结果进行后处理
4. 在留出的测试集上进行评估
5. 可选择导出为 ONNX 以进行推理

## 参考文件

加载相关参考文件，以获取详细的 API、工作流程和注意事项：

- `references/image_loading.md` - WSI 格式、切片类、加载策略
- `references/preprocessing.md` - 变换目录、流水线构建、染色归一化
- `references/graphs.md` - 图构建器、特征提取、空间分析
- `references/machine_learning.md` - HoVer-Net/HACTNet、训练、数据集、ONNX 推理
- `references/multiparametric.md` - CODEX/Vectra/多重免疫荧光、细胞分割、定量分析
- `references/data_management.md` - h5path 存储、图块管理、批处理

PathML 的 API 接口会随版本而变化；请将参考代码视为工作流程脚手架，并根据已安装的版本（`python -c "import pathml; print(pathml.__version__)"`）和官方 API 文档 https://pathml.readthedocs.io/ 确认准确的类名和方法名。