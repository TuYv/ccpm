---
name: alterlab-histolab
description: Extract and preprocess tiles from whole-slide images (WSI) with histolab — OpenSlide-backed slide loading, tissue detection and masks, Random/Grid/Score tile extraction, and image/morphological filters for H&E preprocessing. Use when the user needs lightweight WSI slide preprocessing — building tile datasets for ML training, tissue segmentation, or quick tile-based inspection of histopathology slides. For end-to-end computational-pathology, deep-learning model training, nucleus segmentation, or multiplexed/spatial-proteomics (CODEX, Vectra) pipelines prefer alterlab-pathml instead. Part of the AlterLab Academic Skills suite.
license: Apache-2.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Histolab

## 概述

Histolab 是一个用于处理数字病理学全切片图像（WSI）的 Python 库。它能够自动检测组织、从十亿像素图像中提取信息丰富的图块，并为深度学习流水线准备数据集。该库支持多种 WSI 格式，实现了复杂的组织分割功能，并提供灵活的图块提取策略。

## 何时使用此 Skill

使用 histolab 构建轻量级 WSI 图块流水线：组织检测、构建用于机器学习训练的图块数据集、处理 H&E 染色，以及对组织病理学切片进行快速的图块分析。对于高级空间蛋白质组学、多重成像或完整的深度学习病理学流水线，请改用 `pathml`。

## 安装

```bash
uv pip install "histolab==0.7.0"
```

histolab 封装了 **OpenSlide** C 库，但 pip 软件包中并未捆绑该库。在 macOS 上，请使用 `brew install openslide` 安装；如果未安装，任何 `import histolab.slide` 都会失败并显示 `Couldn't locate OpenSlide dylib`。以下示例固定使用 histolab 0.7.0；旧版本中的 API 有所不同。

## 核心工作流

1. 使用 `Slide(path, processed_path=...)` **加载**切片，并检查其尺寸和层级。
2. 使用掩膜（`TissueMask` 或 `BiggestTissueBoxMask`）**检测组织**。
3. 在正式提取之前，使用 `tiler.locate_tiles(slide)` **预览**图块位置。
4. 使用三种图块划分器之一（Random/Grid/Score）**提取**图块。

最小示例：

```python
from histolab.slide import Slide
from histolab.tiler import RandomTiler

slide = Slide("slide.svs", processed_path="output/")
# n_tiles, level, seed are CONSTRUCTOR args — not args to locate_tiles/extract.
tiler = RandomTiler(tile_size=(512, 512), n_tiles=100, level=0, seed=42)
tiler.locate_tiles(slide)   # preview locations on the thumbnail first
tiler.extract(slide)        # writes PNGs into processed_path
```

**API 易错点（histolab 0.7.0）：** `locate_tiles()` 和 `extract()` 仅接受 `slide`、可选的 `extraction_mask`，以及日志记录/样式相关的关键字参数——它们**不**接受 `n_tiles`。请在图块划分器的构造函数中设置 `n_tiles`（以及 `seed`、`level`、`tile_size`、`check_tissue`、`tissue_percent`）。`extraction_mask` 应传递给 `extract()`/`locate_tiles()`，绝不能传递给构造函数。

可完整复制粘贴的流水线（快速入门、5 个端到端工作流，以及按功能分类的示例）位于 `references/workflows.md`。

## 核心功能

### 1. 切片管理

加载、检查和处理 WSI 文件（SVS、TIFF、NDPI 等）：访问元数据（尺寸、放大倍数、属性）、生成缩略图，以及处理金字塔式/多层级结构。关键类：`Slide`。

有关切片初始化、内置示例数据集（`prostate_tissue`、`ovarian_tissue`、`breast_tissue`、`heart_tissue`、`aorta_tissue`，以及带有笔迹标记和 IHC 的样本）、金字塔层级和多切片处理，请参阅 `references/slide_management.md`。

### 2. 组织检测和掩膜

自动识别组织区域，并过滤背景/伪影。关键类：`TissueMask`（所有组织区域）、`BiggestTissueBoxMask`（最大区域的边界框——默认选项）以及 `BinaryMask`（自定义掩膜的基类）。

选择掩膜：
- `TissueMask`：多个组织切片，全面分析
- `BiggestTissueBoxMask`：单个主要切片，排除伪影（默认）
- 自定义 `BinaryMask`：特定 ROI、排除标注、自定义分割

有关检测过滤器的工作原理、使用 `locate_mask()` 可视化掩膜，以及自定义矩形掩膜/标注排除掩膜的方法，请参阅 `references/tissue_masks.md`。

### 3. 图块提取

使用以下三种策略之一从大型 WSI 中提取较小区域：

- **RandomTiler** — 提取固定数量、随机定位的图块。最适合对多样化区域进行采样、探索和生成训练数据。关键参数：`n_tiles`、`seed`。
- **GridTiler** — 在组织范围内按系统化网格提取。最适合完整覆盖、空间分析和重建。关键参数：`pixel_overlap`。
- **ScoreTiler** — 根据评分函数提取排名最高的图块。最适合信息丰富的区域和质量驱动的选择。关键参数：`scorer`（NucleiScorer、CellularityScorer、自定义）。

通用参数：`tile_size`、`level`（0 = 最高分辨率）、`check_tissue`、
`tissue_percent`（默认 80%）、`extraction_mask`。**提取前始终使用
`locate_tiles()` 进行预览。**

有关评分器、报告和高级（多层级、分层）提取模式，请参阅
`references/tile_extraction.md`。

### 4. 过滤器和预处理

应用图像处理过滤器进行组织检测、质量控制和预处理：
- **图像过滤器** — `RgbToGrayscale`、`RgbToHsv`、`RgbToHed`、`OtsuThreshold`、
  `Invert`、`StretchContrast`、`HistogramEqualization`、`Lambda`。
- **形态学过滤器** — `BinaryDilation`、`BinaryErosion`、`BinaryOpening`、
  `BinaryClosing`、`RemoveSmallObjects`、`RemoveSmallHoles`。
- **组合** — `Compose`（位于 `histolab.filters.image_filters` 中）可将过滤器串联为管线。将自定义过滤器作为位置可变参数传递给掩膜：
  `TissueMask(RgbToGrayscale(), OtsuThreshold(), ...)`。

有关过滤器串联、常用管线（组织检测、笔迹去除、细胞核增强）和质量控制过滤器，请参阅
`references/filters_preprocessing.md`。

### 5. 可视化

显示载玻片、掩膜、图块位置和提取质量：缩略图、通过 `locate_mask()` 实现的掩膜叠加、通过 `locate_tiles()` 实现的图块位置预览、图块拼图和评分分布。

有关拼图、质量评估图、多载玻片比较以及导出高分辨率图像/PDF 报告，请参阅
`references/visualization.md`。

## 参考资料索引

- `references/workflows.md` — 快速入门、各项功能的示例，以及 5 个
  端到端实例工作流（探索性、网格、评分驱动、多载玻片、
  自定义组织检测）。
- `references/slide_management.md` — 加载/检查载玻片、示例数据集、
  金字塔层级、多载玻片处理。
- `references/tissue_masks.md` — `TissueMask`/`BiggestTissueBoxMask`/`BinaryMask`、
  自定义掩膜、掩膜可视化和集成。
- `references/tile_extraction.md` — Random/Grid/Score 图块提取器比较、评分器、
  CSV 报告、高级提取模式。
- `references/filters_preprocessing.md` — 图像和形态学过滤器、过滤器
  组合、预处理管线、质量控制过滤器。
- `references/visualization.md` — 缩略图、掩膜/图块预览、拼图、
  质量图、图像导出。
- `references/best_practices.md` — 最佳实践、常见用例和
  故障排除（无图块、背景图块、提取速度慢、伪影）。

加载你所需的特定参考文件，以获取详细的实现指导、故障排除方法或高级功能说明。