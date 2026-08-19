---
name: deepspot-m
description: Generate transcriptome-wide virtual spatial transcriptomics from H&E histology with DeepSpot-M. Use when you need spatial gene expression in log1p-CPM for 224x224 tiles at about 20x, want to query protein-coding genes by symbol instead of a fixed panel, or want to run prediction across a whole slide after tiling with histolab.
license: PolyForm-Noncommercial-1.0.0
compatibility: Needs deepspotm 1.0.0 from PyPI (Python 3.10 to 3.13) plus PyTorch. Weights at ratschlab/DeepSpotM on Hugging Face are gated and licensed CC-BY-NC-SA-4.0, so request access on the model page and then run huggingface-cli login. A CUDA GPU speeds up batched inference.
allowed-tools: Read Write Edit Bash
metadata:
  version: "1.0"
  skill-author: Ratschlab, ETH Zurich
---
# DeepSpot-M

## 概述

DeepSpot-M 是一个多模态基础模型，可将 224x224 的 H&E 组织学图块映射到以
log1p-CPM 表示的空间基因表达。输出是虚拟空间转录组：每个查询基因在每个图块上对应一个
值，并按照这些图块来源的网格进行排列。

一个经过 LoRA 适配的病理学基础骨干网络（Midnight）对图块进行标记化处理。一个
交叉注意力基因解码器使每个基因查询能够关注图块 token，而基因路由器超网络则利用冻结的生物学嵌入
（Evo 2、Orthrus、ProtT5、scGPT、Apertus）构建基因特异性投影。基因以可查询嵌入的形式进入模型，
而不是作为固定的输出槽位，因此发布的模型覆盖约 19k 个蛋白编码基因组成的面板，其中包括训练期间
未见过的基因。该面板随权重以 `tokens.csv` 提供，并通过 `model.gene_names` 暴露；本次发布中无法查询
不在该面板内的基因。

应用于 TCGA 后，该模型生成了一个虚拟空间转录组图谱，涵盖 32 种癌症类型的 28,664 张切片。

## 许可

代码采用 PolyForm Noncommercial 1.0.0 许可，权重采用 CC-BY-NC-SA-4.0 许可。请将其用于
非商业研究，并在重新分发输出结果前检查这两项许可。

## 安装

```bash
uv pip install deepspotm==1.0.0
```

1.0.0 版本面向 Python 3.10 至 3.13，并会安装 PyTorch。如果希望进行 GPU 推理，请先安装
与 CUDA 版本匹配的 PyTorch 构建版本。

## 模型访问

权重受到访问限制：

1. 打开 <https://huggingface.co/ratschlab/DeepSpotM> 并申请访问权限。
2. 获得访问权限后，对将要下载权重的机器进行身份验证：

```bash
huggingface-cli login
```

`from_pretrained` 会读取缓存的令牌，因此每台机器只需登录一次。

## 快速开始

```python
from deepspotm import DeepSpotM

model, image_processor = DeepSpotM.from_pretrained("ratschlab/DeepSpotM", source="scgpt")

vals = model.predict_genes(image_processor(pil_tile).unsqueeze(0), ["EPCAM", "CD3D"])
```

`pil_tile` 是一张大小恰好为 224x224 像素的 PIL 图像。`image_processor` 会将其转换为
张量，`unsqueeze(0)` 会添加批次维度，而 `predict_genes` 接收该批次以及一个 HGNC 基因符号列表。
返回值采用 log1p-CPM 表示，并按照你传入的基因列表对齐，因此应将该列表与输出结果一并保存，以便
保留列标签。符号必须位于发布的约 19k 基因面板（`model.gene_names`）中；未知符号会引发
`KeyError`，并列出有问题的基因。

## 图块要求

图块必须是 224x224 的 RGB 图像，放大倍数约为 20x（每像素约 0.5 微米）。请在流水线边界处检查
尺寸，而不是将未经检查的裁剪图直接传入：

```python
TILE_PX = 224

def require_tile(tile):
    """Return an RGB 224x224 tile, or raise if the crop is the wrong size."""
    if tile.size != (TILE_PX, TILE_PX):
        raise ValueError(
            f"DeepSpot-M expects a {TILE_PX}x{TILE_PX} tile at about 20x "
            f"(~0.5 microns per pixel); got {tile.size[0]}x{tile.size[1]}. "
            "Re-tile at the matching level or resample the crop."
        )
    return tile.convert("RGB")
```

在与 0.5 微米/像素最接近的切片层级提取图块，然后
在该层级裁剪为 224x224。从更粗糙的层级重采样会改变骨干网络
读取的纹理。

## 保持依赖项可选

`deepspotm` 及其权重是一个重量级的受限依赖项。在需要它的函数内部导入它，
以便周边项目无需安装它也能完成安装、导入和测试，并将
`ImportError` 转换为一条列出每个步骤的消息：

```python
DEEPSPOTM_HELP = (
    "DeepSpot-M is unavailable. Install it with `uv pip install deepspotm==1.0.0`, request "
    "access to the gated weights at https://huggingface.co/ratschlab/DeepSpotM, then "
    "authenticate with `huggingface-cli login`."
)

def load_deepspotm(source="scgpt"):
    try:
        from deepspotm import DeepSpotM
    except ImportError as exc:
        raise RuntimeError(DEEPSPOTM_HELP) from exc
    return DeepSpotM.from_pretrained("ratschlab/DeepSpotM", source=source)
```

## 嵌入来源

`source` 选择路由器用于构建投影的冻结基因嵌入。它是以下
五个值之一：

| `source`  | 基因嵌入                    |
| --------- | --------------------------------- |
| `evo2`    | 基因组序列                  |
| `orthrus` | RNA                               |
| `prott5`  | 蛋白质序列                  |
| `scgpt`   | 单细胞表达            |
| `apertus` | 语言模型                    |

每种嵌入都提供了基因身份的不同视角。每次运行选择一种；当该选择对分析很重要时，
让相同的图块通过多个来源运行。有关完整的调用接口、批处理和设备放置、基因符号
处理及输出单位，请参阅
`references/api.md`。

## 全切片工作流程

预测以图块为单位，因此切片尺度的运行包括一个图块化步骤，随后进行批量
推理：

1. 使用 `histolab` 技能在网格上提取 224x224 图块，并保留每个图块的
   坐标。
2. 使用 `torch.stack` 处理并堆叠图块形成批次。
3. 针对每个批次使用相同的基因列表调用一次 `predict_genes`。
4. 将各批次连接为图块×基因矩阵，并附加坐标。

该矩阵就是切片的虚拟空间转录组图谱，可直接放入 `AnnData` 以进行下游空间分析。
`references/whole_slide.md` 提供了一个完整的循环示例、批次大小设置以及
`AnnData` 组装步骤。

## 常见用例

- 肿瘤切片中标记基因的空间表达图谱。
- 针对没有匹配检测实验的切片队列进行全转录组预测。
- 通过符号查询约 19k 个面板基因中的任意基因，包括训练中未见的基因 —
  远超典型空间检测面板中仅数百个基因。
- 为仅形态学的组织学流程添加表达通道。
- 构建切片级队列图谱，如同针对 TCGA 所做的那样。

## 详细参考资料

- `references/api.md`：完整介绍 `from_pretrained` 和 `predict_genes`、五种嵌入
  来源及其选择方法、批处理、设备放置、基因符号处理，以及如何转换 log1p-CPM 输出。
- `references/whole_slide.md`：使用 histolab 进行图块化、切片尺度的预测循环、
  组装和存储图块×基因矩阵，以及队列尺度运行。

## 主要来源

- 论文：<https://doi.org/10.64898/2026.06.19.26356060>（medRxiv，发布于 2026 年 6 月 22 日）
- 代码：<https://github.com/ratschlab/DeepSpotM>
- 权重：<https://huggingface.co/ratschlab/DeepSpotM>
- PyPI：<https://pypi.org/project/deepspotm/>