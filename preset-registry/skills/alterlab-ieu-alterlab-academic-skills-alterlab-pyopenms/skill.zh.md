---
name: alterlab-pyopenms
description: Build complete mass-spectrometry workflows with pyOpenMS — feature detection, peptide identification, protein quantification, and full LC-MS/MS pipelines across many MS file formats (mzML, mzXML) and algorithms. Use for comprehensive proteomics and MS data processing — for simple spectral comparison and metabolite identification use matchms. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.1.0"
---
# PyOpenMS

## 概述

PyOpenMS 为计算质谱分析库 OpenMS 提供 Python 绑定，可用于分析蛋白质组学和代谢组学数据。适用于处理质谱文件格式、处理谱图数据、检测特征、鉴定肽段/蛋白质，以及执行定量分析。

## 安装

使用 uv 安装（pyOpenMS 3.x——此处示例已在 3.5 版本中验证）：

```bash
uv pip install "pyopenms>=3.4"
```

验证安装：

```python
import pyopenms
print(pyopenms.__version__)
```

> 版本说明：pyOpenMS 3.x 移除了旧版 `FeatureFinder` 外观接口。请使用
> `FeatureFinderAlgorithmPicked`（原 `"centroided"` 算法）；对于
> 代谢组学，请使用 `MassTraceDetection` → `ElutionPeakDetection` →
> `FeatureFindingMetabo` 流程。请参阅 `references/feature_detection.md`。

## 核心功能

PyOpenMS 将功能划分为以下领域：

### 1. 文件 I/O 和数据格式

处理质谱文件格式，并在不同表示形式之间进行转换。

**支持的格式**：mzML、mzXML、TraML、mzTab、FASTA、pepXML、protXML、mzIdentML、featureXML、consensusXML、idXML

基本文件读取：

```python
import pyopenms as ms

# Read mzML file
exp = ms.MSExperiment()
ms.MzMLFile().load("data.mzML", exp)

# Access spectra
for spectrum in exp:
    mz, intensity = spectrum.get_peaks()
    print(f"Spectrum: {len(mz)} peaks")
```

**有关文件处理的详细信息**：请参阅 `references/file_io.md`

### 2. 信号处理

通过平滑、滤波、质心化和归一化来处理原始谱图数据。

基本谱图处理：

```python
# Smooth spectrum with Gaussian filter
gaussian = ms.GaussFilter()
params = gaussian.getParameters()
params.setValue("gaussian_width", 0.1)
gaussian.setParameters(params)
gaussian.filterExperiment(exp)
```

**有关算法的详细信息**：请参阅 `references/signal_processing.md`

### 3. 特征检测

跨谱图和样本检测并关联特征，以进行定量分析。

```python
# Detect features in centroided data (pyOpenMS 3.x API)
ff = ms.FeatureFinderAlgorithmPicked()
params = ff.getParameters()          # defaults for the "centroided" algorithm
ff.setParameters(params)

features = ms.FeatureMap()
seeds = ms.FeatureMap()              # empty seeds = detect de novo
ff.run(exp, features, params, seeds)
```

**有关完整工作流程的信息**：请参阅 `references/feature_detection.md`

### 4. 肽段和蛋白质鉴定

与搜索引擎集成并处理鉴定结果。

**支持的引擎**：Comet、Mascot、MSGFPlus、XTandem、OMSSA、Myrimatch

基本鉴定工作流程：

```python
# Load identification data.
# pyOpenMS 3.x: protein_ids is a plain list, peptide_ids MUST be a
# PeptideIdentificationList (a plain [] is rejected by load()).
protein_ids = []
peptide_ids = ms.PeptideIdentificationList()
ms.IdXMLFile().load("identifications.idXML", protein_ids, peptide_ids)

# Compute q-values (target-decoy FDR), then filter at 1%.
# fdr.apply() requires target/decoy hits annotated with a 'target_decoy'
# meta value (run PeptideIndexer on a concatenated target-decoy search first).
fdr = ms.FalseDiscoveryRate()
fdr.apply(peptide_ids)               # rewrites scores to q-values (lower = better)
ms.IDFilter().filterHitsByScore(peptide_ids, 0.01)
ms.IDFilter().removeEmptyIdentifications(peptide_ids)
```

**有关详细工作流**：请参阅 `references/identification.md`

### 5. 代谢组学分析

执行非靶向代谢组学预处理和分析。

典型工作流：
1. 加载并处理原始数据
2. 检测特征
3. 对齐各样本间的保留时间
4. 将特征关联到共识图
5. 使用化合物数据库进行注释

**有关完整的代谢组学工作流**：请参阅 `references/metabolomics.md`

## 数据结构

PyOpenMS 使用以下主要对象：

- **MSExperiment**：谱图和色谱图的集合
- **MSSpectrum**：包含 m/z 和强度数据对的单张质谱图
- **MSChromatogram**：色谱轨迹
- **Feature**：带有质量指标的已检测色谱峰
- **FeatureMap**：特征集合
- **PeptideIdentification**：肽段搜索结果
- **ProteinIdentification**：蛋白质搜索结果

**有关详细文档**：请参阅 `references/data_structures.md`

## 常见工作流

### 快速入门：加载并探索数据

```python
import pyopenms as ms

# Load mzML file
exp = ms.MSExperiment()
ms.MzMLFile().load("sample.mzML", exp)

# Get basic statistics
print(f"Number of spectra: {exp.getNrSpectra()}")
print(f"Number of chromatograms: {exp.getNrChromatograms()}")

# Examine first spectrum
spec = exp.getSpectrum(0)
print(f"MS level: {spec.getMSLevel()}")
print(f"Retention time: {spec.getRT()}")
mz, intensity = spec.get_peaks()
print(f"Peaks: {len(mz)}")
```

### 参数管理

大多数算法使用参数系统：

```python
# Get algorithm parameters
algo = ms.GaussFilter()
params = algo.getParameters()

# View available parameters
for param in params.keys():
    print(f"{param}: {params.getValue(param)}")

# Modify parameters
params.setValue("gaussian_width", 0.2)
algo.setParameters(params)
```

### 导出至 Pandas

将数据转换为 pandas DataFrame 以供分析：

```python
import pyopenms as ms
import pandas as pd

# Load feature map
fm = ms.FeatureMap()
ms.FeatureXMLFile().load("features.featureXML", fm)

# Convert to DataFrame
df = fm.get_df()
print(df.head())
```

## 与其他工具集成

PyOpenMS 可与以下工具集成：
- **Pandas**：将数据导出为 DataFrame
- **NumPy**：处理峰数组
- **Scikit-learn**：对 MS 数据进行机器学习
- **Matplotlib/Seaborn**：可视化
- **R**：通过 rpy2 桥接

## 资源

- **官方文档**：https://pyopenms.readthedocs.io
- **OpenMS 文档**：https://www.openms.org
- **GitHub**：https://github.com/OpenMS/OpenMS

## 参考资料

- `references/file_io.md` - 全面的文件格式处理
- `references/signal_processing.md` - 信号处理算法
- `references/feature_detection.md` - 特征检测与关联
- `references/identification.md` - 肽段和蛋白质鉴定
- `references/metabolomics.md` - 代谢组学专用工作流
- `references/data_structures.md` - 核心对象和数据结构