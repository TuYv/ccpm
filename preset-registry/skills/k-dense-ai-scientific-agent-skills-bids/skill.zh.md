---
name: bids
description: >
  Use this skill when working with Brain Imaging Data Structure (BIDS) datasets:
  organizing neuroscience and biomedical data (MRI, EEG, MEG, iEEG, PET, microscopy,
  NIRS, motion capture, EMG, MR spectroscopy, behavioral), querying BIDS layouts,
  validating compliance, converting DICOM to BIDS, writing metadata sidecars, or
  creating BIDS derivatives.
license: https://creativecommons.org/licenses/by/4.0/
metadata:
  version: "1.1"
  skill-author: Yaroslav Halchenko
---
# 脑成像数据结构（BIDS）

## 概述

脑成像数据结构（BIDS）是一项用于组织和描述神经科学及生物医学研究数据集的社区标准。它定义了一致的文件命名约定、目录层级和元数据模式，使数据集能够被人类和软件工具立即理解。BIDS 受 BIDS Specification（当前为 v1.11.x）管理，并由 BIDS-Standard GitHub 组织代表社区维护。

虽然 BIDS 起源于 MRI，但其适用范围已经远远超出神经成像。该规范目前涵盖 11 种模态，涉及成像、电生理学和行为数据：

- **成像**：MRI（结构、功能、扩散、场图、灌注/ASL）、PET、显微镜
- **电生理学**：EEG、MEG、iEEG（颅内 EEG）、EMG
- **其他**：NIRS（近红外光谱）、动作捕捉、不含成像的行为数据、MR 波谱

活跃的 BEP 正在进一步扩展 BIDS——尤其是 BEP032（微电极电生理学）将增加对细胞外记录的支持，包括 Neuropixels 探针，使 BIDS 能够覆盖动物神经科学研究中一种广泛采用的方法（另请参阅 neuropixels-analysis skill）。

主要数据存储库（OpenNeuro、DANDI）、领先期刊（NeuroImage、Human Brain Mapping、Scientific Data）和资助机构（NIH、ERC）要求或强烈鼓励采用 BIDS。

BIDS 的 Python 生态系统以 **PyBIDS**（`pybids`）为核心，用于查询和索引 BIDS 数据集；同时使用 **bids-validator**（基于 Deno，可作为 PyPI 软件包 `bids-validator-deno` 安装，也可直接通过 Deno 使用）进行合规性检查。DICOM 到 BIDS 的转换通常使用 **HeuDiConv**、**dcm2bids** 或 **BIDScoin** 完成。

## 何时使用此技能

在以下情况下应用此技能：
- 将原始神经科学数据（成像、电生理学、行为数据）组织为符合 BIDS 的目录结构
- 查询现有 BIDS 数据集，以根据 subject、session、task、run 或 modality 查找特定文件
- 在共享或提交数据集之前，根据 BIDS 规范验证数据集
- 将扫描仪生成的 DICOM 数据转换为 BIDS 格式
- 编写或编辑 JSON sidecar 元数据文件
- 创建符合 BIDS 的衍生数据（预处理数据、分析输出）
- 为新数据集设置 `dataset_description.json`
- 使用 BIDS entities（subject、session、task、acquisition、run 等）
- 配置 `.bidsignore` 以从验证中排除文件
- 准备数据，以便上传到 OpenNeuro、DANDI 或其他支持 BIDS 的数据存储库

## 安装

```bash
# Core BIDS querying library
uv pip install pybids

# BIDS validator (Deno-based, installed via PyPI wrapper)
uv pip install bids-validator-deno
# Alternative: install directly via Deno
# deno install -g -A npm:bids-validator

# DICOM-to-BIDS converters (install as needed)
uv pip install heudiconv       # HeuDiConv - heuristic-based DICOM conversion
uv pip install dcm2bids        # dcm2bids - config-file-based conversion
# BIDScoin: uv pip install bidscoin

# Useful companions
uv pip install nibabel          # NIfTI/other neuroimaging file I/O
uv pip install pydicom          # DICOM file reading (used by converters)
```

## 核心工作流

十二个工作流领域，每个都附有可运行的代码，记录在
[references/core_workflows.md](references/core_workflows.md) 中：

1. **BIDS 目录结构** — 必需的布局以及每种模态应放置的位置。
2. **`dataset_description.json`** — 必填字段及其生成方法。
3. **使用 PyBIDS 查询** — `BIDSLayout`、实体筛选器、具有
   自动继承功能的 sidecar 元数据，以及根据实体构建路径。
4. **验证** — 通过 PyPI 包装器使用 `bids-validator`（推荐）、直接通过 Deno
   使用、旧版 Node 验证器，以及使用 `.bidsignore` 排除文件。
5. **实体与文件命名** — 实体顺序和命名语法。
6. **DICOM 到 BIDS 的转换** — HeuDiConv（包括开箱即用的 ReproIn 路径以及
   侦察 → 启发式规则 → 转换的流程）和 dcm2bids（基于配置文件）。
7. **元数据 sidecar 文件** — 每种模态所需和推荐的 JSON 字段。
8. **事件文件** — 任务 fMRI 事件时间和列约定。
9. **参与者文件** — `participants.tsv` 及其数据字典。
10. **衍生数据** — 衍生数据布局及其 `dataset_description.json`。
11. **高级 PyBIDS** — 索引缓存、包含衍生数据、混杂回归变量，以及
    DataFrame 输出。
12. **BIDS-Apps** — 标准调用模式，以及 fMRIPrep、MRIQC 和 QSIPrep。

尽早并频繁地验证：PyBIDS 在为数据集建立索引时会验证其结构，因此索引失败通常意味着
命名或元数据问题，而不是代码错误。

## 参考材料

此技能包含详细的参考文档：

- **bids_schema.json**：机器可读的 BIDS 模式（来自 https://bids-specification.readthedocs.io/en/stable/schema.json）。这是实体定义、排序规则、文件名模板、每种数据类型允许的后缀以及元数据字段要求的权威来源。BEP 特定模式位于 https://github.com/bids-standard/bids-schema/tree/main/BEPs。
- **beps.yml**：所有 BIDS 扩展提案的当前列表，包含标题、负责人、状态和链接（来自 [bids-website](https://github.com/bids-standard/bids-website/blob/main/data/beps/beps.yml)）
- **bids_specification.md**：实体表、数据类型参考、目录结构规则、模板空间和规范变更日志的人类可读摘要
- **metadata_fields.md**：每种 BIDS 模态（anat、func、dwi、fmap、eeg、meg、pet 等）所需和推荐的 JSON sidecar 字段
- **conversion_tools.md**：HeuDiConv、dcm2bids 和 BIDScoin 的详细工作流，包括启发式规则/配置示例及故障排除

使用以下命令更新模式和 BEP：`python scripts/update_schema.py`

## 常见问题及解决方案

### 1. 验证器报告“不是 BIDS 数据集”
**原因**：根目录中缺少 `dataset_description.json`。
**修复方法**：创建该文件，至少包含 `{"Name": "...", "BIDSVersion": "1.10.0"}`。

### 2. 受试者不一致警告
**原因**：并非所有受试者都拥有相同的一组文件（某些缺少会话、运行等）。
**修复方法**：这是警告，不是错误。如果是有意为之，请使用 `--ignoreSubjectConsistency`。在 `participants.tsv` 或 `scans.tsv` 中记录缺失数据。

### 3. 缺少 SliceTiming
**原因**：`dcm2niix` 无法从 DICOM 头文件中提取切片时间信息。
**修复方法**：根据扫描协议确定切片顺序，并手动添加到 JSON 附属文件中。常见模式包括：升序、降序、交错（奇数优先或偶数优先）。

### 4. 相位编码方向混淆
**原因**：轴标签（i/j/k 与 x/y/z 与 LR/AP/SI）容易混淆。
**修复方法**：在 BIDS 中，使用 NIfTI 图像轴：`i`=第一轴，`j`=第二轴，`k`=第三轴。`-` 表示负方向。对于标准轴位采集：`j` 通常是前后方向。请通过采集协议进行验证。

### 5. PyBIDS 在大型数据集上运行缓慢
**原因**：每次调用 `BIDSLayout()` 时都会进行完整的文件系统索引。
**修复方法**：使用 `database_path` 将索引缓存到 SQLite 文件中：
```python
layout = BIDSLayout("/data", database_path="/data/.pybids_cache.db")
```

### 6. PyBIDS 找不到衍生数据
**原因**：衍生数据目录缺少其自身的 `dataset_description.json`。
**修复方法**：每个衍生数据目录都必须包含 `dataset_description.json`，其中应包含 `"DatasetType": "derivative"`。

### 7. 事件文件时间不正确
**原因**：`onset` 时间相对于错误的参考点（例如触发时间而非第一个体积）。
**修复方法**：起始时间必须以该运行采集的第一个体积为参考，单位为秒。如果丢弃了虚拟扫描，请将其纳入考虑。

### 8. TSV 文件验证失败
**原因**：编码或分隔符问题（使用空格而非制表符、BOM 字符、Windows 换行符）。
**修复方法**：确保使用 UTF-8 编码、制表符分隔的值以及 Unix 换行符（`\n`）。缺失值使用 `n/a`（而不是 `NA`、`NaN` 或空值）。

## 最佳实践

1. **尽早并频繁验证** - 每次转换或修改后都运行 BIDS 验证器。在错误累积之前修复它们。

2. **使用元数据继承** - 将共享元数据（例如 `TaskName`、扫描仪参数）放在顶层附属文件中，而不是在每个受试者目录中重复存放。

3. **保留 sourcedata** - 将原始 DICOM（或其他原始）数据存储在 `sourcedata/` 下，以便转换可复现。将 `sourcedata/` 添加到 `.bidsignore`。

4. **从一开始就使用一致的命名** - 在数据采集前定义 BIDS 命名方案。对扫描协议使用 ReproIn 命名约定，以实现自动转换。

5. **记录数据集文档** - 编写详尽的 `README`，说明研究设计、采集参数、已知问题以及任何偏离 BIDS 的情况。

6. **使用 scans.tsv 记录运行级元数据** - 记录每次运行的采集时间和质量备注：
   ```
   filename	acq_time	quality
   func/sub-01_task-rest_bold.nii.gz	2025-01-15T10:30:00	good
   ```

7. **对数据集进行版本管理** - 使用 `CHANGES` 记录数据集修改。对于大型数据集的完整版本控制，可考虑使用 DataLad。

8. **对解剖图像进行去面部化处理** - 在共享前从 T1w/T2w 图像中移除面部特征（例如使用 `pydeface`、`mri_deface` 或 `afni_refacer`）。将去面部化版本存储为主要数据，或使用 `_defacemask` 文件。

9. **使用 BIDS URI 记录溯源信息** - 在衍生数据中，使用 BIDS URI 引用源文件：`bids::sub-01/anat/sub-01_T1w.nii.gz`。

10. **优先使用社区工具** - 在可能的情况下，使用成熟的 BIDS-Apps（fMRIPrep、MRIQC、QSIPrep），而不是自定义流水线。它们能够正确处理 BIDS I/O，并生成符合 BIDS 规范的衍生数据。

11. **研究 bids-examples** - [bids-examples](https://github.com/bids-standard/bids-examples) 仓库是原型 BIDS 数据集的权威集合，涵盖不同的模态和使用场景（MRI、fMRI、DWI、EEG、MEG、iEEG、PET、ASL、遗传学、衍生数据等）。在组织自己的数据集时，可以将其作为参考；也可以将其用作 BIDS 工具的测试数据，或借此了解特定模态应如何组织。每个示例都通过了 BIDS 验证器的验证。

## BIDS 扩展提案（BEP）

BEP 是由社区推动的提案，旨在将 BIDS 扩展到新的模态、衍生数据或元数据。包含状态、负责人和链接的完整列表位于 `references/beps.yml` 中（从 [bids-website](https://github.com/bids-standard/bids-website/blob/main/data/beps/beps.yml) 获取）。特定 BEP 的 schema 预览可在 https://github.com/bids-standard/bids-schema/tree/main/BEPs 查看。

**当前 BEP**（截至 schema 更新）：

| BEP | 标题 | 内容 | 状态 |
|-----|-------|---------|--------|
| 004 | 磁敏感加权成像 | 原始数据 | 正在寻找新的负责人 |
| 011 | 结构预处理衍生数据 | 衍生数据 | 已有 PR（#518） |
| 012 | 功能预处理衍生数据 | 衍生数据 | 已有 PR（#519），schema 已实现 |
| 014 | 仿射变换和非线性场形变 | 衍生数据 | X5 格式开发中 |
| 016 | 弥散加权成像衍生数据 | 衍生数据 | 已有 PR（#2211） |
| 017 | 通用 BIDS 连接数据 schema | 衍生数据 | 开发中 |
| 021 | 通用电生理衍生数据 | 衍生数据 | 开发中 |
| 023 | PET 预处理衍生数据 | 衍生数据 | 开发中 |
| 024 | 计算机断层扫描 | 原始数据 | 正在寻找贡献者 |
| 026 | 微电极记录 | 原始数据 | 正在寻找新的负责人 |
| 028 | 溯源信息 | 元数据 | 已有 PR（#2099） |
| 032 | 微电极电生理 | 原始数据 | 已有 PR（#2307），预览可用——涵盖 Neuropixels 和其他细胞外探针；与 neuropixels-analysis skill 相关 |
| 033 | 高级弥散加权成像 | 原始数据 | 正在寻找贡献者 |
| 034 | 计算建模 | 衍生数据 | 已有 PR（#967） |
| 035 | 使用不合规衍生数据进行大型分析 | 衍生数据 | 开发中 |
| 036 | 表型数据指南 | 原始数据 | 社区评审中 |
| 037 | 非侵入性脑刺激 | 原始数据 | 开发中 |
| 039 | 基于降维的网络 | 原始数据 | 开发中 |
| 040 | 功能性超声 | 原始数据 | 开发中 |
| 041 | 统计模型衍生数据 | 衍生数据 | 正在收集反馈 |
| 043 | BIDS 术语映射 | 元数据 | 正在收集反馈 |
| 044 | 刺激材料 | 原始数据 | 已有 PR（#2022），社区评审中 |
| 045 | 外周生理记录 | 原始数据 | 已有 PR（#2267） |
| 046 | 弥散纤维束成像 | 衍生数据 | 开发中 |
| 047 | 行为实验的音频/视频记录 | 原始数据 | 已有 PR（#2231） |

**相关标准：**
- **BIDS-Stats Models**：用于定义基于 GLM 的神经影像分析的 JSON 规范
- **BIDS-Derivatives**（BEP003）：预处理/分析输出的标准（已部分合并至规范中）

## 相关工具生态

| 工具 | 用途 |
|------|---------|
| **fMRIPrep** | fMRI 预处理（生成 BIDS 衍生数据） |
| **MRIQC** | MRI 质量控制（生成 BIDS 衍生数据） |
| **QSIPrep** | 弥散 MRI 预处理 |
| **TemplateFlow** | 采用类似 BIDS 命名方式的神经影像模板和图谱 |
| **Fitlins** | BIDS Stats Models 实现 |
| **DataLad** | 大型数据集的版本控制，与 BIDS 集成 |
| **OpenNeuro** | 免费的 BIDS 数据集存储库 |
| **DANDI** | 神经生理学数据档案（部分模态使用 BIDS） |
| **HeuDiConv** | 使用启发式 Python 文件将 DICOM 转换为 BIDS |
| **dcm2bids** | 使用 JSON 配置将 DICOM 转换为 BIDS |
| **BIDScoin** | 使用 GUI 和 YAML 配置将 DICOM 转换为 BIDS |
| **nwb2bids** | 将 NWB（Neurodata Without Borders）文件转换为 BIDS |
| **CuBIDS** | BIDS 数据集整理与协调 |
| **bids2table** | BIDS 数据集的高效表格化索引 |
| **bids-examples** | 涵盖所有模态的原型 BIDS 数据集规范集合 |

## 文档

- **BIDS 规范**：https://bids-specification.readthedocs.io/
- **BIDS 网站**：https://bids.neuroimaging.io/
- **PyBIDS 文档**：https://bids-standard.github.io/pybids/
- **BIDS Validator**：https://github.com/bids-standard/bids-validator
- **BIDS 入门套件**：https://bids-standard.github.io/bids-starter-kit/
- **BIDS 示例**：https://github.com/bids-standard/bids-examples — 每种 BIDS 模态的规范参考数据集；可用作模板和测试数据
- **HeuDiConv 文档**：https://heudiconv.readthedocs.io/
- **原始 BIDS 论文**：Gorgolewski 等人（2016），Scientific Data，doi:10.1038/sdata.2016.44