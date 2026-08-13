---
name: alterlab-matchms
description: Computes mass-spectral similarity and identifies compounds for metabolomics with matchms — comparing mass spectra, scoring similarity (cosine, modified cosine), and searching spectral libraries to annotate unknowns. Use when matching MS/MS spectra, identifying metabolites, or library searching; for full LC-MS/MS proteomics pipelines use pyopenms. Part of the AlterLab Academic Skills suite.
license: Apache-2.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Matchms

## 概述

Matchms 是一个用于质谱数据处理和分析的开源 Python 库。它可以从多种格式导入谱图、标准化元数据、过滤峰、计算谱图相似度，并构建可复现的分析工作流。

## 核心功能

### 1. 导入和导出质谱数据

从多种文件格式加载谱图并导出处理后的数据：

```python
from matchms.importing import load_from_mgf, load_from_mzml, load_from_msp, load_from_json
from matchms.exporting import save_as_mgf, save_as_msp, save_as_json

# Import spectra
spectra = list(load_from_mgf("spectra.mgf"))
spectra = list(load_from_mzml("data.mzML"))
spectra = list(load_from_msp("library.msp"))

# Export processed spectra
save_as_mgf(spectra, "output.mgf")
save_as_json(spectra, "output.json")
```

**支持的格式：**
- mzML 和 mzXML（原始质谱格式）
- MGF（Mascot 通用格式）
- MSP（谱图库格式）
- JSON（兼容 GNPS）
- metabolomics-USI 引用
- Pickle（Python 序列化）

有关导入/导出的详细文档，请参阅 `references/importing_exporting.md`。

### 2. 谱图过滤和处理

应用全面的过滤器来标准化元数据并优化峰数据：

```python
from matchms.filtering import default_filters, normalize_intensities
from matchms.filtering import select_by_relative_intensity, require_minimum_number_of_peaks

# Apply default metadata harmonization filters
spectrum = default_filters(spectrum)

# Normalize peak intensities
spectrum = normalize_intensities(spectrum)

# Filter peaks by relative intensity
spectrum = select_by_relative_intensity(spectrum, intensity_from=0.01, intensity_to=1.0)

# Require minimum peaks
spectrum = require_minimum_number_of_peaks(spectrum, n_required=5)
```

**过滤器类别：**
- **元数据处理**：统一化合物名称、推导化学结构、标准化加合物、校正电荷
- **峰过滤**：归一化强度、按 m/z 或强度筛选、移除前体峰
- **质量控制**：要求最少峰数、验证前体 m/z、确保元数据完整性
- **化学注释**：添加指纹、推导 InChI/SMILES、修复结构不匹配

Matchms 提供 40 多种过滤器。有关完整的过滤器参考，请参阅 `references/filtering.md`。

### 3. 计算谱图相似度

使用多种相似度指标比较谱图：

```python
from matchms import calculate_scores
from matchms.similarity import CosineGreedy, ModifiedCosineGreedy, CosineHungarian

# Calculate cosine similarity (fast, greedy algorithm)
scores = calculate_scores(references=library_spectra,
                         queries=query_spectra,
                         similarity_function=CosineGreedy())

# Calculate modified cosine (accounts for precursor m/z differences)
scores = calculate_scores(references=library_spectra,
                         queries=query_spectra,
                         similarity_function=ModifiedCosineGreedy(tolerance=0.1))

# Get best matches. The cosine functions return a structured score
# (score + matched-peak count), so to SORT you must name the field to
# sort by — `sort=True` alone raises IndexError. The field is
# "<FunctionName>_score", e.g. "ModifiedCosineGreedy_score" / "CosineGreedy_score".
best_matches = scores.scores_by_query(query_spectra[0],
                                      name="ModifiedCosineGreedy_score",
                                      sort=True)[:10]
```

**可用的相似度函数：**
- **CosineGreedy/CosineHungarian**：基于峰的余弦相似度，使用不同的匹配算法
- **ModifiedCosineGreedy**（也称 `ModifiedCosineHungarian`）：考虑前体质量差异的余弦相似度。请注意重命名——该类已不再称为 `ModifiedCosine`。
- **NeutralLossesCosine**：基于中性丢失模式的相似度
- **FingerprintSimilarity**：使用指纹计算分子结构相似度
- **MetadataMatch**：比较用户定义的元数据字段
- **PrecursorMzMatch/ParentMassMatch**：简单的基于质量的筛选

有关相似度函数的详细文档，请参阅 `references/similarity.md`。

### 4. 构建处理管道

创建可复现的多步骤分析工作流：

```python
from matchms import SpectrumProcessor
from matchms.filtering import default_filters, normalize_intensities
from matchms.filtering import select_by_relative_intensity, remove_peaks_around_precursor_mz

# Define a processing pipeline. Each step is a callable, a registered filter
# name (str), or a ("filter_name", {kwargs}) tuple (introspectable via
# processor.processing_steps). NOTE: default_filters is a composite, so pass it
# as the callable — the string "default_filters" is not a registered name.
processor = SpectrumProcessor([
    default_filters,
    "normalize_intensities",
    ("select_by_relative_intensity", {"intensity_from": 0.01}),
    ("remove_peaks_around_precursor_mz", {"mz_tolerance": 17}),
])

# A SpectrumProcessor is NOT callable. Use .process_spectrum() for one
# spectrum, or .process_spectra() for a list (returns a (spectra, report)
# tuple — unpack it, don't treat the result as the spectra list).
processed_spectra, report = processor.process_spectra(spectra)
# single spectrum: processed = processor.process_spectrum(spectrum)
```

### 5. 使用 Spectrum 对象

核心 `Spectrum` 类包含质谱数据：

```python
from matchms import Spectrum
import numpy as np

# Create a spectrum
mz = np.array([100.0, 150.0, 200.0, 250.0])
intensities = np.array([0.1, 0.5, 0.9, 0.3])
metadata = {"precursor_mz": 250.5, "ionmode": "positive"}

spectrum = Spectrum(mz=mz, intensities=intensities, metadata=metadata)

# Access spectrum properties
print(spectrum.peaks.mz)           # m/z values
print(spectrum.peaks.intensities)  # Intensity values
print(spectrum.get("precursor_mz")) # Metadata field

# Visualize spectra
spectrum.plot()
spectrum.plot_against(reference_spectrum)
```

### 6. 元数据管理

标准化并统一谱图元数据：

```python
# Metadata is automatically harmonized
spectrum.set("Precursor_mz", 250.5)  # Gets harmonized to lowercase key
print(spectrum.get("precursor_mz"))   # Returns 250.5

# Derive chemical information
from matchms.filtering import derive_inchi_from_smiles, derive_inchikey_from_inchi
from matchms.filtering import add_fingerprint

spectrum = derive_inchi_from_smiles(spectrum)
spectrum = derive_inchikey_from_inchi(spectrum)
# fingerprint_type must be one of: "daylight", "morgan1", "morgan2", "morgan3"
# (the digit is the Morgan radius). Plain "morgan" is NOT valid.
spectrum = add_fingerprint(spectrum, fingerprint_type="morgan2", nbits=2048)
```

## 常见工作流

典型的质谱分析工作流包括：
- 加载和预处理谱图库
- 将未知谱图与参考库进行匹配
- 质量筛选和数据清理
- 大规模相似度比较
- 基于网络的谱图聚类

详细示例请参阅 `references/workflows.md`。

## 安装

```bash
uv pip install matchms
```

分子结构处理（SMILES/InChI/指纹）需要 rdkit；在当前版本中，它已随 matchms 基础安装一起提供——无需单独安装 `[chemistry]` 扩展依赖。如果 `import rdkit` 失败，请显式运行 `uv pip install rdkit`。

以下 API 说明已针对 **matchms 0.33.x** 进行验证。

## 版本注意事项（已针对 matchms 0.33.x 验证）

以下问题很容易令人困惑，本文中的代码示例已将它们考虑在内：

- **`SpectrumProcessor` 实例不可调用。** 对单个谱图使用
  `processor.process_spectrum(spectrum)`，对列表使用
  `processor.process_spectra(spectra)`——后者返回的是
  `(processed_spectra, report)` 元组，而不是单独的列表。
- 对余弦系列评分调用 **`scores_by_query(query, sort=True)` 会引发 `IndexError`**。
  必须传入 `name="<FunctionName>_score"`（例如
  `"CosineGreedy_score"`），以便结构化评分知道应按哪个字段排序。
- **`scores.scores[i, j]` 是结构化元素**，而不是浮点数——它同时包含
  `..._score` 和 `..._matches` 字段。若需要纯浮点数矩阵，请使用
  `scores.to_array("CosineGreedy_score")`；不存在 `to_dataframe`/`to_list`。
- **`add_fingerprint(fingerprint_type=...)`** 仅接受 `"daylight"`、
  `"morgan1"`、`"morgan2"`、`"morgan3"`（不支持 `"morgan"`，也不支持 `radius=` 参数）。

## 参考文档

详细的参考文档位于 `references/` 目录中：
- `filtering.md` - 完整的过滤函数参考及说明
- `similarity.md` - 所有相似度指标及其适用场景
- `importing_exporting.md` - 文件格式详情和 I/O 操作
- `workflows.md` - 常见分析模式和示例

如需了解特定 matchms 功能的详细信息，请按需加载这些参考文档。