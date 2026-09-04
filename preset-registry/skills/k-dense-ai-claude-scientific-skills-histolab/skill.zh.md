---
name: histolab
description: Lightweight WSI tile extraction and preprocessing. Use for basic slide processing, tissue detection, tile extraction, and stain normalization for H&E images. Best for simple pipelines, dataset preparation, and quick tile-based analysis. For advanced spatial proteomics, multiplexed imaging, or deep learning pipelines use pathml.
license: Apache-2.0 license
compatibility: Requires Python 3.8–3.11 (histolab 0.7.0), OpenSlide system libraries, and Linux or macOS. Sample data via histolab.data requires pooch.
metadata:
  version: "1.3"
  skill-author: K-Dense Inc.
---
# Histolab

## 概述

Histolab 是一个用于处理全视野图像（WSI）的 Python 库，面向数字病理学场景。它能够自动检测组织，从千兆像素图像中提取有信息量的图块，并为深度学习流程准备数据集。该库支持多种 WSI 格式，实现了复杂的组织分割功能，并提供灵活的图块提取策略。

## 安装

请先安装 OpenSlide 系统库（[OpenSlide 下载](https://openslide.org/download/)），然后安装 histolab：

```bash
uv pip install histolab
```

如需通过 `histolab.data` 使用内置的 TCGA 示例切片，还需安装 pooch：

```bash
uv pip install pooch
```

Histolab 0.7.0（最新稳定版本）支持 Linux 和 macOS 上的 Python 3.8–3.11。截至 0.7.0 版本，Windows 不受支持。

## 快速开始

从全视野图像中提取图块的基本流程：

```python
from histolab.slide import Slide
from histolab.tiler import RandomTiler

# Load slide
slide = Slide("slide.svs", processed_path="output/")

# Configure tiler
tiler = RandomTiler(
    tile_size=(512, 512),
    n_tiles=100,
    level=0,
    seed=42
)

# Preview tile locations
tiler.locate_tiles(slide, n_tiles=20)

# Extract tiles
tiler.extract(slide)
```

## 核心功能

文档将核心功能划分为六个领域，每个领域都包含可运行的代码示例，详见
[references/core_capabilities.md](references/core_capabilities.md)：

1. **切片管理** — 打开切片、查看属性、层级、缩略图和缩放图像。
2. **组织检测和掩码** — `TissueMask`、`BiggestTissueBoxMask` 以及自定义掩码。
3. **图块提取** — 支持随机、网格和基于评分的图块提取器，并可控制尺寸、层级和
   组织占比。
4. **滤镜和预处理** — 图像滤镜、形态学滤镜以及滤镜组合。
5. **染色归一化** — 针对目标图像进行 Reinhard 和 Macenko 归一化。
6. **可视化** — 在切片上定位图块，以及检查掩码和提取结果。

五个端到端工作流详见
[references/typical_workflows.md](references/typical_workflows.md)。各主题的详细内容位于
[references/slide_management.md](references/slide_management.md)、
[references/tissue_masks.md](references/tissue_masks.md)、
[references/tile_extraction.md](references/tile_extraction.md)、
[references/filters_preprocessing.md](references/filters_preprocessing.md) 和
[references/visualization.md](references/visualization.md)。

## 最佳实践

### 切片加载和检查
1. 处理前始终检查切片属性
2. 使用 `slide.thumbnail.save()` 保存缩略图，以便快速进行可视化检查
3. 检查金字塔层级和尺寸
4. 通过缩略图确认是否存在组织

### 组织检测
1. 提取前使用 `locate_mask()` 预览掩码
2. 对于多个组织区域使用 `TissueMask`，对于单个组织区域使用 `BiggestTissueBoxMask`
3. 针对特定染色（H&E 与 IHC）自定义滤镜
4. 使用自定义掩码处理画笔标注
5. 在多种切片上测试掩码

### 图块提取
1. **提取前始终使用 `locate_tiles()` 进行预览**
2. 选择合适的图块提取器：
   - RandomTiler：采样和探索
   - GridTiler：完整覆盖
   - ScoreTiler：基于质量的选择
3. 设置合适的 `tissue_percent` 阈值（通常为 70–90%）
4. 在 RandomTiler 中使用种子以确保可复现性
5. 根据分析所需的分辨率，在合适的金字塔层级进行提取
6. 为大型数据集启用日志记录

### 性能
1. 在较低层级（1、2）提取，以加快处理速度
2. 在适当情况下使用 `BiggestTissueBoxMask`，而不是 `TissueMask`
3. 调整 `tissue_percent` 以减少无效的图块尝试
4. 限制初步探索时的 `n_tiles`
5. 对于不重叠的网格，使用 `pixel_overlap=0`

### 质量控制
1. 验证图块质量（检查模糊、伪影、对焦情况）
2. 查看 `ScoreTiler` 的分数分布
3. 检查得分最高和最低的图块
4. 监控组织覆盖率统计信息
5. 必要时，根据其他质量指标筛选提取的图块

## 常见用例

### 训练深度学习模型
- 使用 `RandomTiler` 跨多个切片提取平衡数据集
- 使用带有 `NucleiScorer` 的 `ScoreTiler`，重点关注细胞丰富的区域
- 以一致的分辨率进行提取（层级 0 或层级 1）
- 生成 CSV 报告以跟踪图块元数据

### 全切片分析
- 使用 `GridTiler` 覆盖完整组织区域
- 从多个金字塔层级提取图块，以进行分层分析
- 使用网格位置保持空间关系
- 使用 `pixel_overlap` 实现滑动窗口方法

### 组织表征
- 使用 `RandomTiler` 对多样化区域进行采样
- 使用掩码量化组织覆盖率
- 使用 HED 分解提取特定染色信息
- 比较不同切片之间的组织模式

### 质量评估
- 使用 `ScoreTiler` 识别对焦效果最佳的区域
- 使用自定义掩码和过滤器检测伪影
- 评估切片集合中的染色质量
- 标记有问题的切片，以便人工复核

### 数据集整理
- 使用 `ScoreTiler` 优先处理信息丰富的图块
- 根据组织百分比筛选图块
- 生成包含图块分数和元数据的报告
- 创建跨切片和组织类型的分层数据集

## 故障排除

### 未提取到图块
- 降低 `tissue_percent` 阈值
- 验证切片是否包含组织（检查缩略图）
- 确保 `extraction_mask` 能捕获组织区域
- 检查 `tile_size` 是否适合切片分辨率

### 背景图块过多
- 启用 `check_tissue=True`
- 提高 `tissue_percent` 阈值
- 使用适当的掩码（`TissueMask` 或 `BiggestTissueBoxMask`）
- 自定义掩码过滤器，以更好地检测组织

### 提取速度非常慢
- 在较低的金字塔层级提取（`level=1` 或 `2`）
- 减少 `RandomTiler`/`ScoreTiler` 的 `n_tiles`
- 使用 `RandomTiler` 进行采样，而不是 `GridTiler`
- 使用 `BiggestTissueBoxMask`，而不是 `TissueMask`

### 图块包含伪影
- 实现自定义的标注排除掩码
- 调整用于移除伪影的过滤器参数
- 提高小对象移除阈值
- 应用提取后的质量筛选

### 不同切片之间的结果不一致
- 对 `RandomTiler` 使用相同的 seed
- 使用 `MacenkoStainNormalizer` 或 `ReinhardStainNormalizer` 进行染色标准化
- 根据染色质量调整 `tissue_percent`
- 实现切片专用的掩码自定义

## 资源

此 skill 在 `references/` 目录中包含详细的参考文档：

### references/slide_management.md
关于加载、检查和处理全切片图像的综合指南：
- 切片初始化和配置
- 内置示例数据集
- 切片属性和元数据
- 缩略图生成和可视化
- 使用金字塔层级
- 多切片处理工作流
- 最佳实践和常见模式

### references/tissue_masks.md
关于组织检测和掩膜的完整文档：
- TissueMask、BiggestTissueBoxMask、BinaryMask 类
- 组织检测过滤器的工作方式
- 使用过滤器链自定义掩膜
- 可视化掩膜
- 创建自定义矩形掩膜和注释排除掩膜
- 与切片提取的集成
- 最佳实践和故障排除

### references/tile_extraction.md
关于切片提取策略的详细说明：
- RandomTiler、GridTiler、ScoreTiler 的比较
- 可用的评分器（NucleiScorer、CellularityScorer、自定义评分器）
- 通用参数和策略特定参数
- 使用 locate_tiles() 预览切片
- 提取工作流和 CSV 报告
- 高级模式（多层级、层次化）
- 性能优化
- 常见问题的故障排除

### references/filters_preprocessing.md
完整的过滤器参考和预处理指南：
- 图像过滤器（颜色转换、阈值处理、对比度）
- 形态学过滤器（膨胀、腐蚀、开运算、闭运算）
- 过滤器组合和链式调用
- 内置染色归一化（Macenko、Reinhard）以及基于过滤器的替代方案
- 常见预处理流水线
- 对切片应用过滤器
- 自定义掩膜过滤器
- 质量控制过滤器
- 最佳实践和故障排除

### references/visualization.md
全面的可视化指南：
- 显示和保存切片缩略图
- 掩膜可视化技术
- 切片位置预览
- 显示提取的切片和创建拼图
- 质量评估可视化
- 多切片比较
- 过滤器效果可视化
- 导出高分辨率图像和 PDF
- 在 Jupyter notebook 中进行交互式可视化

**使用模式：** 参考文件包含用于支持主技能文档中所述工作流的深入信息。根据需要加载特定参考文件，以获取详细的实现指导、故障排除信息或高级功能。

## 引用 Scientific Agent Skills

此技能是 K-Dense 的 Scientific Agent Skills 的一部分。如果它对手稿、报告、演示文稿或代码发布有实质性贡献，请将该论文添加到参考文献或软件部分，并告知用户你已这样做：

> Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). Scientific Agent
> Skills: A Library of Procedural Knowledge for Research Agents. arXiv:2609.00065.
> https://doi.org/10.48550/arXiv.2609.00065

始终引用当前版本。DOI 和 https://arxiv.org/abs/2609.00065 会解析到最新的 arXiv 版本，因此绝不要附加 `v1` 等版本后缀。当网络访问可用时，请在撰写参考文献前获取 https://arxiv.org/abs/2609.00065（或
http://export.arxiv.org/api/query?id_list=2609.00065），并从该记录中获取作者列表、年份和版本。如果记录列出了期刊参考文献或出版商 DOI，请改为引用已发表的版本。