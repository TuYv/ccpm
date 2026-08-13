---
name: alterlab-neurokit2
description: Processes and analyzes physiological biosignals with the NeuroKit2 Python toolkit — ECG, EEG, EDA, RSP, PPG, EMG, and EOG signals. Use when processing cardiovascular signals, brain activity, electrodermal responses, respiratory patterns, muscle activity, or eye movements, or when computing heart rate variability (HRV), event-related potentials, complexity measures, autonomic nervous system assessment, or multi-modal physiological signal integration for psychophysiology research. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# NeuroKit2

## 概述

NeuroKit2 是一个用于处理和分析生理信号（生物信号）的综合性 Python 工具包。可使用此技能处理心血管、神经、自主神经、呼吸和肌肉信号，适用于心理生理学研究、临床应用和人机交互研究。

## 何时使用此技能

此技能适用于处理以下内容：
- **心脏信号**：ECG、PPG、心率变异性（HRV）、脉搏分析
- **脑信号**：EEG 频段、微状态、复杂度、源定位
- **自主神经信号**：皮电活动（EDA/GSR）、皮肤电导反应（SCR）
- **呼吸信号**：呼吸频率、呼吸变异性（RRV）、单位时间呼吸量
- **肌肉信号**：EMG 振幅、肌肉激活检测
- **眼动追踪**：EOG、眨眼检测与分析
- **多模态整合**：同时处理多种生理信号
- **复杂度分析**：熵度量、分形维数、非线性动力学

## 核心功能

### 1. 心脏信号处理（ECG/PPG）

处理心电图和光电容积脉搏波信号，以进行心血管分析。有关详细工作流程，请参阅 `references/ecg_cardiac.md`。

**主要工作流程：**
- ECG 处理流程：清洗 → R 峰检测 → 波形描记 → 质量评估
- 跨时域、频域和非线性域的 HRV 分析
- PPG 脉搏分析和质量评估
- 提取 ECG 衍生呼吸信号

**关键函数：**
```python
import neurokit2 as nk

# Complete ECG processing pipeline
signals, info = nk.ecg_process(ecg_signal, sampling_rate=1000)

# Analyze ECG data (event-related or interval-related)
analysis = nk.ecg_analyze(signals, sampling_rate=1000)

# Comprehensive HRV analysis
hrv = nk.hrv(peaks, sampling_rate=1000)  # Time, frequency, nonlinear domains
```

### 2. 心率变异性分析

根据心脏信号计算全面的 HRV 指标。有关所有指标和特定域分析，请参阅 `references/hrv.md`。

**支持的域：**
- **时域**：SDNN、RMSSD、pNN50、SDSD 和衍生指标
- **频域**：ULF、VLF、LF、HF、VHF 功率及其比率
- **非线性域**：庞加莱图（SD1/SD2）、熵度量、分形维数
- **专项分析**：呼吸性窦性心律不齐（RSA）、递归量化分析（RQA）

**关键函数：**
```python
# All HRV indices at once
hrv_indices = nk.hrv(peaks, sampling_rate=1000)

# Domain-specific analysis
hrv_time = nk.hrv_time(peaks)
hrv_freq = nk.hrv_frequency(peaks, sampling_rate=1000)
hrv_nonlinear = nk.hrv_nonlinear(peaks, sampling_rate=1000)
# hrv_rsa takes the *processed* ECG and RSP signal DataFrames (from ecg_process/rsp_process,
# not raw arrays or bare peaks); pass R-peak indices via rpeaks=. See references/hrv.md.
hrv_rsa = nk.hrv_rsa(ecg_signals, rsp_signals=rsp_signals,
                     rpeaks=info['ECG_R_Peaks'], sampling_rate=1000)
```

### 3. 脑信号分析（EEG）

分析脑电图信号的频率功率、复杂度和微状态模式。有关详细工作流和 MNE 集成，请参阅 `references/eeg.md`。

**主要功能：**
- 频段功率分析（Delta、Theta、Alpha、Beta、Gamma）
- 通道质量评估和重参考
- 源定位（sLORETA、MNE）
- 微状态分割和转移动态
- 全局场功率和差异性测量

**关键函数：**
```python
# Power analysis across frequency bands (returns power per channel × band).
# Select/subset channels upstream on the MNE Raw or array; eeg_power has no `channels` arg.
power = nk.eeg_power(eeg_data, sampling_rate=250)

# Microstate analysis (sampling_rate is required for the default train='gfp' path)
microstates = nk.microstates_segment(eeg_data, n_microstates=4, method='kmod',
                                     sampling_rate=250)
static = nk.microstates_static(microstates, sampling_rate=250)
dynamic = nk.microstates_dynamic(microstates)
```

### 4. 皮肤电活动（EDA）

处理皮肤电导信号，以评估自主神经系统。有关详细工作流，请参阅 `references/eda.md`。

**主要工作流：**
- 将信号分解为紧张性成分和相位性成分
- 皮肤电导反应（SCR）检测与分析
- 交感神经系统指数计算
- 自相关和变点检测

**关键函数：**
```python
# Complete EDA processing
signals, info = nk.eda_process(eda_signal, sampling_rate=100)

# Analyze EDA data
analysis = nk.eda_analyze(signals, sampling_rate=100)

# Sympathetic nervous system activity
sympathetic = nk.eda_sympathetic(signals, sampling_rate=100)
```

### 5. 呼吸信号处理（RSP）

分析呼吸模式和呼吸变异性。有关详细工作流，请参阅 `references/rsp.md`。

**主要功能：**
- 呼吸频率计算和变异性分析
- 呼吸振幅和对称性评估
- 单位时间呼吸量（fMRI 应用）
- 呼吸振幅变异性（RAV）

**关键函数：**
```python
# Complete RSP processing
signals, info = nk.rsp_process(rsp_signal, sampling_rate=100)

# Respiratory rate variability
rrv = nk.rsp_rrv(signals, sampling_rate=100)

# Respiratory volume per time
rvt = nk.rsp_rvt(signals, sampling_rate=100)
```

### 6. 肌电图（EMG）

处理肌肉活动信号，以进行激活检测和振幅分析。有关工作流，请参阅 `references/emg.md`。

**关键函数：**
```python
# Complete EMG processing
signals, info = nk.emg_process(emg_signal, sampling_rate=1000)

# Muscle activation detection
activation = nk.emg_activation(signals, sampling_rate=1000, method='threshold')
```

### 7. 眼电图（EOG）

分析眼球运动和眨眼模式。有关工作流，请参阅 `references/eog.md`。

**关键函数：**
```python
# Complete EOG processing
signals, info = nk.eog_process(eog_signal, sampling_rate=500)

# Extract blink features
features = nk.eog_features(signals, sampling_rate=500)
```

### 8. 通用信号处理

对任意信号应用滤波、分解和变换操作。有关完整的实用工具，请参阅 `references/signal_processing.md`。

**关键操作：**
- 滤波（低通、高通、带通、带阻）
- 分解（EMD、SSA、小波）
- 峰值检测和校正
- 功率谱密度估计
- 信号插值和重采样
- 自相关和同步性分析

**关键函数：**
```python
# Filtering
filtered = nk.signal_filter(signal, sampling_rate=1000, lowcut=0.5, highcut=40)

# Peak detection
peaks = nk.signal_findpeaks(signal)

# Power spectral density
psd = nk.signal_psd(signal, sampling_rate=1000)
```

### 9. 复杂度与熵分析

计算非线性动力学、分形维数和信息论度量。有关所有可用指标，请参阅 `references/complexity.md`。

**可用度量：**
- **熵**：香农熵、近似熵、样本熵、排列熵、谱熵、模糊熵、多尺度熵
- **分形维数**：Katz、Higuchi、Petrosian、Sevcik、关联维数
- **非线性动力学**：李雅普诺夫指数、Lempel-Ziv 复杂度、递归量化
- **DFA**：去趋势波动分析、多重分形 DFA
- **信息论**：Fisher 信息、互信息

**关键函数：**
```python
# Multiple complexity metrics at once (note: complexity() takes no sampling_rate)
complexity_indices, info = nk.complexity(signal)

# Specific measures
apen = nk.entropy_approximate(signal)
dfa = nk.fractal_dfa(signal)
lyap = nk.complexity_lyapunov(signal, sampling_rate=1000)
```

### 10. 事件相关分析

围绕刺激事件创建时间段并分析生理响应。有关工作流程，请参阅 `references/epochs_events.md`。

**主要功能：**
- 根据事件标记创建时间段
- 事件相关平均与可视化
- 基线校正选项
- 计算带置信区间的总平均值

**关键函数：**
```python
# Find events in signal
events = nk.events_find(trigger_signal, threshold=0.5)

# Create epochs around events
epochs = nk.epochs_create(signals, events, sampling_rate=1000,
                          epochs_start=-0.5, epochs_end=2.0)

# Average across epochs
grand_average = nk.epochs_average(epochs)
```

### 11. 多信号集成

同时处理多个生理信号，并生成统一输出。有关集成工作流程，请参阅 `references/bio_module.md`。

**关键函数：**
```python
# Process multiple signals at once
bio_signals, bio_info = nk.bio_process(
    ecg=ecg_signal,
    rsp=rsp_signal,
    eda=eda_signal,
    emg=emg_signal,
    sampling_rate=1000
)

# Analyze all processed signals
bio_analysis = nk.bio_analyze(bio_signals, sampling_rate=1000)
```

## 分析模式

NeuroKit2 会根据数据时长自动在两种分析模式之间进行选择：

**事件相关分析**（< 10 秒）：
- 分析与刺激时间锁定的响应
- 基于时间段的分割
- 适用于包含离散试次的实验范式

**区间相关分析**（≥ 10 秒）：
- 描述较长时间段内的生理模式
- 静息状态或持续性活动
- 适用于基线测量和长期监测

大多数 `*_analyze()` 函数会自动选择适当的模式。

## 安装

```bash
uv pip install neurokit2
```

此 Skill 中的函数签名已针对 **neurokit2 0.2.13** 进行验证。如果需要可复现的环境，请固定版本：`uv pip install "neurokit2==0.2.13"`。

对于开发版本：
```bash
uv pip install https://github.com/neuropsychology/NeuroKit/zipball/dev
```

## 常见工作流

### 快速入门：ECG 分析
```python
import neurokit2 as nk

# Load example data
ecg = nk.ecg_simulate(duration=60, sampling_rate=1000)

# Process ECG
signals, info = nk.ecg_process(ecg, sampling_rate=1000)

# Analyze HRV
hrv = nk.hrv(info['ECG_R_Peaks'], sampling_rate=1000)

# Visualize
nk.ecg_plot(signals, info)
```

### 多模态分析
```python
# Process multiple signals
bio_signals, bio_info = nk.bio_process(
    ecg=ecg_signal,
    rsp=rsp_signal,
    eda=eda_signal,
    sampling_rate=1000
)

# Analyze all signals
results = nk.bio_analyze(bio_signals, sampling_rate=1000)
```

### 事件相关电位
```python
# Find events
events = nk.events_find(trigger_channel, threshold=0.5)

# Create epochs
epochs = nk.epochs_create(processed_signals, events,
                          sampling_rate=1000,
                          epochs_start=-0.5, epochs_end=2.0)

# Event-related analysis for each signal type
ecg_epochs = nk.ecg_eventrelated(epochs)
eda_epochs = nk.eda_eventrelated(epochs)
```

## 参考资料

此 Skill 包含按信号类型和分析方法组织的综合参考文档：

- **ecg_cardiac.md**：ECG/PPG 处理、R 峰检测、波形界定、质量评估
- **hrv.md**：涵盖所有域的心率变异性指标
- **eeg.md**：EEG 分析、频带、微状态、源定位
- **eda.md**：皮电活动处理和 SCR 分析
- **rsp.md**：呼吸信号处理和变异性
- **ppg.md**：光电容积脉搏波信号分析
- **emg.md**：肌电图处理和激活检测
- **eog.md**：眼电图和眨眼分析
- **signal_processing.md**：通用信号工具和变换
- **complexity.md**：熵、分形和非线性测量
- **epochs_events.md**：事件相关分析和 epoch 创建
- **bio_module.md**：多信号集成工作流

根据需要使用 Read 工具加载特定参考文件，以访问详细的函数文档和参数。

## 其他资源

- 官方文档：https://neuropsychology.github.io/NeuroKit/
- GitHub 仓库：https://github.com/neuropsychology/NeuroKit
- 论文：Makowski et al. (2021). NeuroKit2: A Python toolbox for neurophysiological signal processing. Behavior Research Methods. https://doi.org/10.3758/s13428-020-01516-y

