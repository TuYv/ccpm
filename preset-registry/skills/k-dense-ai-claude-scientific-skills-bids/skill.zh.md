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

脑成像数据结构（BIDS）是一项用于组织和描述神经科学及生物医学研究数据集的社区标准。它定义了统一的文件命名约定、目录层级结构和元数据模式，使数据集能够被人类和软件工具立即理解。BIDS 由 BIDS 规范（当前为 v1.11.x）管理，并由 BIDS-Standard GitHub 组织通过社区协作维护。

虽然 BIDS 起源于 MRI，但其应用范围已经远远超出神经成像领域。目前，该规范涵盖 11 种模态，涉及成像、神经电生理学和行为数据：

- **成像**：MRI（结构、功能、弥散、场图、灌注/ASL）、PET、显微镜
- **神经电生理学**：EEG、MEG、iEEG（颅内 EEG）、EMG
- **其他**：NIRS（近红外光谱）、动作捕捉、不含成像的行为数据、MR 波谱

活跃的 BEP 正在进一步扩展 BIDS——尤其是 BEP032（微电极神经电生理学）将增加对细胞外记录的支持，包括 Neuropixels 探针，使 BIDS 能够覆盖动物神经科学研究中一种广泛采用的方法（另请参阅 neuropixels-analysis skill）。

主要数据存储库（OpenNeuro、DANDI）、顶级期刊（NeuroImage、Human Brain Mapping、Scientific Data）以及资助机构（NIH、ERC）都要求或强烈鼓励采用 BIDS。

BIDS 的 Python 生态系统以 **PyBIDS**（`pybids`）为核心，用于查询和索引 BIDS 数据集；同时使用 **bids-validator**（基于 Deno，可作为 PyPI 软件包 `bids-validator-deno` 安装，也可直接通过 Deno 使用）进行合规性检查。DICOM 通常使用 **HeuDiConv**、**dcm2bids** 或 **BIDScoin** 转换为 BIDS。

## 使用此 Skill 的时机

在以下情况下应用此 skill：
- 将原始神经科学数据（成像、神经电生理学、行为数据）组织为符合 BIDS 的目录结构
- 查询现有 BIDS 数据集，以便按受试者、会话、任务、运行或模态查找特定文件
- 在共享或提交数据集之前，根据 BIDS 规范对其进行验证
- 将扫描仪生成的 DICOM 数据转换为 BIDS 格式
- 编写或编辑 JSON 附属元数据文件
- 创建符合 BIDS 的衍生数据（预处理数据、分析输出）
- 为新数据集设置 `dataset_description.json`
- 使用 BIDS 实体（受试者、会话、任务、采集、运行等）
- 配置 `.bidsignore` 以便从验证中排除文件
- 准备数据，以便上传至 OpenNeuro、DANDI 或其他支持 BIDS 的数据存储库

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

[references/core_workflows.md](references/core_workflows.md) 中记录了十二个工作流领域，每个领域都包含可运行的代码示例：

1. **BIDS 目录结构** — 所需的布局以及每种模态所属的位置。
2. **`dataset_description.json`** — 必需字段及其生成方式。
3. **使用 PyBIDS 进行查询** — `BIDSLayout`、实体过滤器、支持自动继承的附属元数据，以及根据实体构建路径。
4. **验证** — 通过 PyPI 封装器使用 `bids-validator`（推荐）、直接通过 Deno 使用、使用旧版 Node validator，以及使用 `.bidsignore` 排除文件。
5. **实体与文件命名** — 实体顺序和命名语法。
6. **DICOM 到 BIDS 的转换** — HeuDiConv（包括开箱即用的 ReproIn 路径以及 reconnaissance → heuristic → convert 流程）和 dcm2bids（基于配置文件）。
7. **元数据附属文件** — 每种模态所需和推荐的 JSON 字段。
8. **Events 文件** — task fMRI 的事件时间和列约定。
9. **Participants 文件** — `participants.tsv` 及其数据字典。
10. **Derivatives** — derivatives 布局及其 `dataset_description.json`。
11. **高级 PyBIDS** — 索引缓存、包括 derivatives、混杂回归量以及 DataFrame 输出。
12. **BIDS-Apps** — 标准调用模式，以及 fMRIPrep、MRIQC 和 QSIPrep。

尽早并经常进行验证：PyBIDS 在为数据集建立索引时会验证其结构，因此索引失败通常意味着命名或元数据存在问题，而不是代码错误。

## 参考资料

此 skill 包含详细的参考文档：

- **bids_schema.json**：机器可读的 BIDS schema（来自 https://bids-specification.readthedocs.io/en/stable/schema.json）。这是实体定义、排序规则、文件名模板、每种 datatype 允许的后缀以及元数据字段要求的权威来源。BEP 专用 schema 位于 https://github.com/bids-standard/bids-schema/tree/main/BEPs。
- **beps.yml**：所有 BIDS Extension Proposals 的当前列表，包含标题、负责人、状态和链接（来自 [bids-website](https://github.com/bids-standard/bids-website/blob/main/data/beps/beps.yml)）
- **bids_specification.md**：对实体表、datatype 参考、目录结构规则、模板空间和规范变更日志的人类可读摘要
- **metadata_fields.md**：每种 BIDS 模态（anat、func、dwi、fmap、eeg、meg、pet 等）所需和推荐的 JSON 附属文件字段
- **conversion_tools.md**：HeuDiConv、dcm2bids 和 BIDScoin 的详细工作流，包括 heuristic/config 示例和故障排除

使用以下命令更新 schema 和 BEP：`python scripts/update_schema.py`

## 常见问题及解决方案

### 1. 验证器报告 "Not a BIDS dataset"
**原因**：根目录缺少 `dataset_description.json`。
**修复**：创建该文件，至少包含 `{"Name": "...", "BIDSVersion": "1.10.0"}`。

### 2. Inconsistent subjects 警告
**原因**：并非所有 subject 都具有相同的文件集合（例如缺少某些 sessions、runs 等）。
**修复**：这是警告而非错误。如果这是有意为之，请使用 `--ignoreSubjectConsistency`。在 `participants.tsv` 或某个 `scans.tsv` 中记录缺失数据。

### 3. 缺少 SliceTiming
**原因**：`dcm2niix` 无法从 DICOM 头信息中提取切片时序。
**修复**：根据扫描协议确定切片顺序，并手动添加到 JSON sidecar 中。常见模式包括：升序、降序、交错（奇数优先或偶数优先）。

### 4. 相位编码方向混淆
**原因**：轴标签（i/j/k 与 x/y/z、LR/AP/SI）容易造成混淆。
**修复**：在 BIDS 中，使用 NIfTI 图像轴：`i`=第一轴，`j`=第二轴，`k`=第三轴。`-` 表示负方向。对于标准轴向采集：`j` 通常表示前后方向。请根据采集协议进行验证。

### 5. PyBIDS 在大型数据集上运行缓慢
**原因**：每次调用 `BIDSLayout()` 时都会对整个文件系统建立索引。
**修复**：使用 `database_path` 将索引缓存到 SQLite 文件中：
```python
layout = BIDSLayout("/data", database_path="/data/.pybids_cache.db")
```

### 6. PyBIDS 找不到衍生数据
**原因**：衍生数据目录缺少自己的 `dataset_description.json`。
**修复**：每个衍生数据目录都必须包含带有 `"DatasetType": "derivative"` 的 `dataset_description.json`。

### 7. Events 文件的时间不正确
**原因**：`onset` 时间相对于错误的参考点（例如触发时间而不是第一个 volume）。
**修复**：`onset` 必须以秒为单位，并相对于该次 run 采集的第一个 volume。若丢弃了 dummy scans，请将其计入。

### 8. TSV 文件验证失败
**原因**：编码或分隔符问题（使用空格而不是制表符、存在 BOM 字符、使用 Windows 换行符）。
**修复**：确保使用 UTF-8 编码和 Unix 换行符（`\n`）的制表符分隔值。缺失值请使用 `n/a`（不要使用 `NA`、`NaN` 或空值）。

## 最佳实践

1. **尽早并频繁地进行验证** - 每次转换或修改后都运行 BIDS validator。在问题叠加之前修复错误。

2. **使用元数据继承** - 将共享元数据（例如 `TaskName`、扫描仪参数）放在顶层 sidecar 文件中，而不是在每个被试的目录中重复。

3. **保留 sourcedata** - 将原始 DICOM（或其他原始）数据存储在 `sourcedata/` 下，以确保转换过程可复现。将 `sourcedata/` 添加到 `.bidsignore` 中。

4. **从一开始就使用一致的命名方式** - 在数据采集前定义 BIDS 命名方案。对扫描协议使用 ReproIn 命名约定，以支持自动转换。

5. **记录数据集信息** - 编写详尽的 `README`，描述研究设计、采集参数、已知问题以及任何偏离 BIDS 的情况。

6. **使用 scans.tsv 记录 run 级元数据** - 记录每次 run 的采集时间和质量备注：
   ```
   filename	acq_time	quality
   func/sub-01_task-rest_bold.nii.gz	2025-01-15T10:30:00	good
   ```

7. **对数据集进行版本控制** - 使用 `CHANGES` 记录数据集修改。对于大型数据集，可考虑使用 DataLad 进行完整的版本控制。

8. **对解剖图像进行去面部化处理** - 在共享 T1w/T2w 图像前移除面部特征（例如使用 `pydeface`、`mri_deface` 或 `afni_refacer`）。将去面部化版本存储为主要数据，或使用 `_defacemask` 文件。

9. **使用 BIDS URI 表示溯源信息** - 在衍生数据中，使用 BIDS URI 引用源文件：`bids::sub-01/anat/sub-01_T1w.nii.gz`。

10. **优先使用社区工具** - 在可能的情况下，使用成熟的 BIDS-Apps（fMRIPrep、MRIQC、QSIPrep），而不是自定义流程。它们能够正确处理 BIDS I/O，并生成符合 BIDS 规范的衍生数据。

11. **研究 bids-examples** - [bids-examples](https://github.com/bids-standard/bids-examples) 仓库是原型 BIDS 数据集的权威集合，涵盖不同模态和使用场景（MRI、fMRI、DWI、EEG、MEG、iEEG、PET、ASL、遗传学、衍生数据等）。在组织自己的数据集时，可将其作为参考；也可将其用作 BIDS 工具的测试数据，或借此了解特定模态应如何组织。每个示例都通过了 BIDS 验证器的检查。

## BIDS 扩展提案（BEP）

BEP 是由社区推动的提案，旨在将 BIDS 扩展到新的模态、衍生数据或元数据。包含状态、负责人和链接的完整列表位于 `references/beps.yml` 中（从 [bids-website](https://github.com/bids-standard/bids-website/blob/main/data/beps/beps.yml) 获取）。特定 BEP 的 schema 预览可在 https://github.com/bids-standard/bids-schema/tree/main/BEPs 查看。

**当前 BEP**（截至 schema 更新）：

| BEP | 标题 | 内容 | 状态 |
|-----|-------|---------|--------|
| 004 | 磁敏感加权成像 | 原始数据 | 正在寻找新的负责人 |
| 011 | 结构预处理衍生数据 | 衍生数据 | 已有 PR (#518) |
| 012 | 功能预处理衍生数据 | 衍生数据 | 已有 PR (#519)，schema 已实现 |
| 014 | 仿射变换和非线性场形变 | 衍生数据 | X5 格式开发中 |
| 016 | 弥散加权成像衍生数据 | 衍生数据 | 已有 PR (#2211) |
| 017 | 通用 BIDS 连接数据 schema | 衍生数据 | 开发中 |
| 021 | 通用电生理衍生数据 | 衍生数据 | 开发中 |
| 023 | PET 预处理衍生数据 | 衍生数据 | 开发中 |
| 024 | 计算机断层扫描 | 原始数据 | 正在寻找贡献者 |
| 026 | 微电极记录 | 原始数据 | 正在寻找新的负责人 |
| 028 | 溯源信息 | 元数据 | 已有 PR (#2099) |
| 032 | 微电极电生理 | 原始数据 | 已有 PR (#2307)，预览可用——涵盖 Neuropixels 和其他细胞外探针；与 neuropixels-analysis skill 相关 |
| 033 | 高级弥散加权成像 | 原始数据 | 正在寻找贡献者 |
| 034 | 计算建模 | 衍生数据 | 已有 PR (#967) |
| 035 | 使用不符合规范的衍生数据进行大规模分析 | 衍生数据 | 开发中 |
| 036 | 表型数据指南 | 原始数据 | 社区评审中 |
| 037 | 非侵入性脑刺激 | 原始数据 | 开发中 |
| 039 | 基于降维的网络 | 原始数据 | 开发中 |
| 040 | 功能性超声 | 原始数据 | 开发中 |
| 041 | 统计模型衍生数据 | 衍生数据 | 正在收集反馈 |
| 043 | BIDS 术语映射 | 元数据 | 正在收集反馈 |
| 044 | 刺激材料 | 原始数据 | 已有 PR (#2022)，社区评审中 |
| 045 | 外周生理记录 | 原始数据 | 已有 PR (#2267) |
| 046 | 弥散纤维束成像 | 衍生数据 | 开发中 |
| 047 | 行为实验的音频/视频记录 | 原始数据 | 已有 PR (#2231) |

**相关标准：**
- **BIDS-Stats Models**：用于定义基于 GLM 的神经影像分析的 JSON 规范
- **BIDS-Derivatives**（BEP003）：预处理/分析输出的标准（已部分合并到规范中）

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
| **DANDI** | 神经生理学数据档案库（部分模态使用 BIDS） |
| **HeuDiConv** | 使用启发式 Python 文件将 DICOM 转换为 BIDS |
| **dcm2bids** | 使用 JSON 配置将 DICOM 转换为 BIDS |
| **BIDScoin** | 使用 GUI 和 YAML 配置将 DICOM 转换为 BIDS |
| **nwb2bids** | 将 NWB（Neurodata Without Borders）文件转换为 BIDS |
| **CuBIDS** | BIDS 数据集整理与协调 |
| **bids2table** | 高效地对 BIDS 数据集进行表格化索引 |
| **bids-examples** | 涵盖所有模态的原型 BIDS 数据集规范集合 |

## 文档

- **BIDS 规范**：https://bids-specification.readthedocs.io/
- **BIDS 网站**：https://bids.neuroimaging.io/
- **PyBIDS 文档**：https://bids-standard.github.io/pybids/
- **BIDS 验证器**：https://github.com/bids-standard/bids-validator
- **BIDS 入门套件**：https://bids-standard.github.io/bids-starter-kit/
- **BIDS 示例**：https://github.com/bids-standard/bids-examples — 每种 BIDS 模态的规范参考数据集；可用作模板和测试数据
- **HeuDiConv 文档**：https://heudiconv.readthedocs.io/
- **BIDS 原始论文**：Gorgolewski 等人（2016），Scientific Data，doi:10.1038/sdata.2016.44