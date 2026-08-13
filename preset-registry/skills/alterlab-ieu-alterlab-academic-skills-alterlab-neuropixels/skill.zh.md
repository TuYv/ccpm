---
name: alterlab-neuropixels
description: Analyze Neuropixels 1.0/2.0 extracellular electrophysiology with SpikeInterface — load SpikeGLX/Open Ephys recordings, preprocess and motion-correct, run Kilosort4 spike sorting, compute quality metrics, apply Allen/IBL curation, and do AI-assisted visual inspection. Use when working with neural recordings, spike sorting, or extracellular electrophysiology, or when the user mentions Neuropixels, SpikeGLX, Open Ephys, Kilosort, quality metrics, or unit curation. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Neuropixels 数据分析

## 概述

一个用于分析 Neuropixels 高密度神经记录的综合工具包，采用 SpikeInterface、Allen Institute 和 International Brain Laboratory（IBL）的当前最佳实践。支持从原始数据到可供发表的已整理单元的完整工作流程。

## 何时使用此 Skill

此 Skill 适用于：
- 处理 Neuropixels 记录（.ap.bin、.lf.bin、.meta 文件）
- 加载 SpikeGLX、Open Ephys 或 NWB 格式的数据
- 预处理神经记录（滤波、CAR、坏通道检测）
- 检测并校正记录中的运动/漂移
- 运行尖峰排序（Kilosort4、SpykingCircus2、Mountainsort5）
- 计算质量指标（SNR、ISI 违规率、存在率）
- 使用 Allen/IBL 标准整理单元
- 创建神经数据可视化
- 将结果导出到 Phy 或 NWB

## 支持的硬件与格式

| 探针 | 电极数 | 通道数 | 备注 |
|-------|-----------|----------|-------|
| Neuropixels 1.0 | 960 | 384 | 需要 phase_shift 校正 |
| Neuropixels 2.0（单探针） | 1280 | 384 | 更密集的几何布局 |
| Neuropixels 2.0（4 柄） | 5120 | 384 | 多脑区记录 |

| 格式 | 扩展名 | 读取器 |
|--------|-----------|--------|
| SpikeGLX | `.ap.bin`, `.lf.bin`, `.meta` | `si.read_spikeglx()` |
| Open Ephys | `.continuous`, `.oebin` | `si.read_openephys()` |
| NWB | `.nwb` | `si.read_nwb()` |

## 快速开始

### 基本导入与设置

```python
import spikeinterface.full as si

# Bundled helper functions live in scripts/neuropixels_pipeline.py
from scripts.neuropixels_pipeline import (
    load_recording, preprocess, check_drift, correct_motion,
    run_spike_sorting, postprocess, curate_units, export_results, run_pipeline,
)

# Configure parallel processing
job_kwargs = dict(n_jobs=-1, chunk_duration='1s', progress_bar=True)
```

### 加载数据

```python
# SpikeGLX (most common)
recording = si.read_spikeglx('/path/to/data', stream_id='imec0.ap')

# Open Ephys (common for many labs)
recording = si.read_openephys('/path/to/Record_Node_101/')

# Check available streams
streams, ids = si.get_neo_streams('spikeglx', '/path/to/data')
print(streams)  # ['imec0.ap', 'imec0.lf', 'nidq']

# For testing with subset of data
recording = recording.frame_slice(0, int(60 * recording.get_sampling_frequency()))
```

### 完整流程（单条命令）

```python
# Run full analysis pipeline (writes all outputs under output_path/)
from scripts.neuropixels_pipeline import run_pipeline

run_pipeline(
    data_path='/path/to/data',
    output_path='output/',
    sorter='kilosort4',
    stream_name='imec0.ap',
    apply_motion_correction=True,
    curation_method='allen',
)

# Results are written to disk:
#   output/sorting_output/    spike sorter output
#   output/analyzer/          SortingAnalyzer (waveforms, metrics)
#   output/quality_metrics.csv
#   output/curation_labels.json
```

或者从命令行运行：

```bash
python scripts/neuropixels_pipeline.py /path/to/data output/ --sorter kilosort4 --curation allen
```

## 标准分析工作流程

### 1. 预处理

```python
# Recommended preprocessing chain
rec = si.highpass_filter(recording, freq_min=400)
rec = si.phase_shift(rec)  # Required for Neuropixels 1.0
bad_ids, _ = si.detect_bad_channels(rec)
rec = rec.remove_channels(bad_ids)
rec = si.common_reference(rec, operator='median')

# Or use the bundled wrapper (returns the preprocessed recording + bad channel ids)
from scripts.neuropixels_pipeline import preprocess
rec, bad_channels = preprocess(recording)
```

### 2. 检查并校正漂移

```python
from scripts.neuropixels_pipeline import check_drift, correct_motion

# Check for drift (always do this!) — detects/localizes peaks and saves
# a drift plot to <output_folder>/drift_check.png, returns a dict with
# 'drift_estimate' (μm range).
drift_info = check_drift(rec, output_folder='output/')

# Apply correction if needed
if drift_info['drift_estimate'] > 20:  # microns
    rec = correct_motion(rec, output_folder='output/', preset='nonrigid_fast_and_accurate')
```

### 3. 尖峰排序

```python
# Kilosort4 (recommended, requires GPU)
sorting = si.run_sorter('kilosort4', rec, folder='ks4_output')

# CPU alternatives
sorting = si.run_sorter('tridesclous2', rec, folder='tdc2_output')
sorting = si.run_sorter('spykingcircus2', rec, folder='sc2_output')
sorting = si.run_sorter('mountainsort5', rec, folder='ms5_output')

# Check available sorters
print(si.installed_sorters())
```

### 4. 后处理

```python
# Create analyzer and compute all extensions
analyzer = si.create_sorting_analyzer(sorting, rec, sparse=True)

analyzer.compute('random_spikes', max_spikes_per_unit=500)
analyzer.compute('waveforms', ms_before=1.0, ms_after=2.0)
analyzer.compute('templates', operators=['average', 'std'])
analyzer.compute('spike_amplitudes')
analyzer.compute('correlograms', window_ms=50.0, bin_ms=1.0)
analyzer.compute('unit_locations', method='monopolar_triangulation')
analyzer.compute('quality_metrics')

metrics = analyzer.get_extension('quality_metrics').get_data()
```

### 5. 筛选

```python
# Allen Institute criteria (conservative)
good_units = metrics.query("""
    presence_ratio > 0.9 and
    isi_violations_ratio < 0.5 and
    amplitude_cutoff < 0.1
""").index.tolist()

# Or use automated curation (returns {unit_id: 'good'|'mua'|'noise'})
from scripts.neuropixels_pipeline import curate_units
labels = curate_units(metrics, method='allen')  # 'allen', 'ibl', 'strict'
```

### 6. AI 辅助筛选（针对不确定的单元）

在 Claude Code 中使用此技能时，Claude 可以直接分析波形图并提供专业的筛选决策。推荐的工作流程是使用 SpikeInterface 渲染每个单元的汇总图，并让 Claude 检查这些图：

```python
import spikeinterface.widgets as sw
import matplotlib.pyplot as plt

# Find borderline units worth a visual look
uncertain = metrics.query('snr > 3 and snr < 8').index.tolist()

# Render a summary figure per uncertain unit (waveform + correlogram + amplitudes)
for unit_id in uncertain:
    sw.plot_unit_summary(analyzer, unit_id=unit_id)
    plt.savefig(f'ai_curation/unit_{unit_id}_summary.png', dpi=150, bbox_inches='tight')
    plt.close()
```

**Claude Code 集成**：在 Claude Code 中运行时，可让 Claude 直接检查已保存的波形图/互相关图——无需配置 API。

### 7. 生成分析报告

```python
# The bundled run_pipeline writes a machine-readable summary.json
# (sampling rate, duration, channel count, unit counts) into output_path/.
import json
with open('output/summary.json') as f:
    summary = json.load(f)
print(summary)

# For a browsable HTML report of waveforms/metrics, use SpikeInterface's exporter:
si.export_report(analyzer, output_folder='output/report/')
# Open output/report/index.html for figures and the per-unit table
```

### 8. 导出结果

```python
# Export to Phy for manual review
si.export_to_phy(analyzer, output_folder='phy_export/',
                 compute_pc_features=True, compute_amplitudes=True)

# Export to NWB (via NeuroConv — SpikeInterface has no native NWB exporter)
# pip install neuroconv
from neuroconv.tools.spikeinterface import write_sorting, write_recording
write_recording(recording=rec, nwbfile_path='output.nwb', overwrite=True)
write_sorting(sorting=sorting, nwbfile_path='output.nwb')

# Save quality metrics
metrics.to_csv('quality_metrics.csv')
```

## 常见陷阱与最佳实践

1. 在尖峰排序之前**始终检查漂移**——漂移 > 10μm 会显著影响质量
2. 对 Neuropixels 1.0 探针**使用 phase_shift**（2.0 无需使用）
3. **保存预处理后的数据**以避免重复计算——使用 `rec.save(folder='preprocessed/')`
4. 为 Kilosort4 **使用 GPU**——其速度比基于 CPU 的替代方案快 10-50 倍
5. **手动检查不确定的单元**——自动整理只是起点
6. **结合指标与 AI**——对明确的情况使用指标，对临界单元使用 AI
7. **记录所用阈值**——不同的分析可能需要不同的标准
8. 对关键实验**导出到 Phy**——人工监督很有价值

## 需要调整的关键参数

### 预处理
- `freq_min`：高通截止频率（通常为 300-400 Hz）
- `detect_threshold`：坏通道检测灵敏度

### 运动校正
- `preset`：'kilosort_like'（快速）或 'nonrigid_accurate'（更适合严重漂移）

### 尖峰排序（Kilosort4）
- `batch_size`：每个批次的样本数（默认为 30000）
- `nblocks`：漂移块数量（对于长时间记录应增加）
- `Th_learned`：检测阈值（越低 = 尖峰越多）

### 质量指标
- `snr_threshold`：信噪比阈值（通常为 3-5）
- `isi_violations_ratio`：不应期违规比例（0.01-0.5）
- `presence_ratio`：记录覆盖率（0.5-0.95）

## 随附资源

### scripts/preprocess_recording.py
自动化预处理脚本：
```bash
python scripts/preprocess_recording.py /path/to/data --output preprocessed/
```

### scripts/run_sorting.py
运行尖峰排序：
```bash
python scripts/run_sorting.py preprocessed/ --sorter kilosort4 --output sorting/
```

### scripts/compute_metrics.py
计算质量指标并应用整理规则：
```bash
python scripts/compute_metrics.py sorting/ preprocessed/ --output metrics/ --curation allen
```

### scripts/export_to_phy.py
导出到 Phy 以进行手动整理：
```bash
python scripts/export_to_phy.py metrics/analyzer --output phy_export/
```

### assets/analysis_template.py
完整的分析模板。复制并自定义：
```bash
cp assets/analysis_template.py my_analysis.py
# Edit parameters and run
python my_analysis.py
```

### references/standard_workflow.md
详细的分步工作流程，并包含每个阶段的说明。

### references/api_reference.md
按模块组织的函数速查参考。

### references/plotting_guide.md
用于生成出版质量图表的综合可视化指南。

## 详细参考指南

| 主题 | 参考文档 |
|-------|-----------|
| 完整工作流程 | [references/standard_workflow.md](references/standard_workflow.md) |
| API 参考 | [references/api_reference.md](references/api_reference.md) |
| 绘图指南 | [references/plotting_guide.md](references/plotting_guide.md) |
| 预处理 | [references/PREPROCESSING.md](references/PREPROCESSING.md) |
| 脉冲分选 | [references/SPIKE_SORTING.md](references/SPIKE_SORTING.md) |
| 运动校正 | [references/MOTION_CORRECTION.md](references/MOTION_CORRECTION.md) |
| 质量指标 | [references/QUALITY_METRICS.md](references/QUALITY_METRICS.md) |
| 自动整理 | [references/AUTOMATED_CURATION.md](references/AUTOMATED_CURATION.md) |
| AI 辅助整理 | [references/AI_CURATION.md](references/AI_CURATION.md) |
| 波形分析 | [references/ANALYSIS.md](references/ANALYSIS.md) |

## 安装

```bash
# Core packages
pip install spikeinterface[full] probeinterface neo

# Spike sorters
pip install kilosort          # Kilosort4 (GPU required)
pip install spykingcircus     # SpykingCircus2 (CPU)
pip install mountainsort5     # Mountainsort5 (CPU)

# Our toolkit ships as local scripts (scripts/) — no pip install needed;
# run them directly or import from scripts.neuropixels_pipeline

# Optional: AI curation
pip install anthropic

# Optional: IBL tools
pip install ibl-neuropixel ibllib
```

## 项目结构

```
project/
├── raw_data/
│   └── recording_g0/
│       └── recording_g0_imec0/
│           ├── recording_g0_t0.imec0.ap.bin
│           └── recording_g0_t0.imec0.ap.meta
├── preprocessed/           # Saved preprocessed recording
├── motion/                 # Motion estimation results
├── sorting_output/         # Spike sorter output
├── analyzer/               # SortingAnalyzer (waveforms, metrics)
├── phy_export/             # For manual curation
├── ai_curation/            # AI analysis reports
└── results/
    ├── quality_metrics.csv
    ├── curation_labels.json
    └── output.nwb
```

## 其他资源

- **SpikeInterface 文档**：https://spikeinterface.readthedocs.io/
- **Neuropixels 教程**：https://spikeinterface.readthedocs.io/en/stable/how_to/analyze_neuropixels.html
- **Kilosort4 GitHub**：https://github.com/MouseLand/Kilosort
- **IBL Neuropixel 工具**：https://github.com/int-brain-lab/ibl-neuropixel
- **Allen Institute ecephys**：https://github.com/AllenInstitute/ecephys_spike_sorting
- **Bombcell（自动质量控制）**：https://github.com/Julie-Fabre/bombcell
- **SpikeAgent（AI 整理）**：https://github.com/SpikeAgent/SpikeAgent

