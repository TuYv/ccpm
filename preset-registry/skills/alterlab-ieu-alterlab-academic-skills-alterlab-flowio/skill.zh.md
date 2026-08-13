---
name: alterlab-flowio
description: Parse and write FCS (Flow Cytometry Standard) files v2.0-3.1 with FlowIO — extract event data as NumPy arrays, read $-keyword metadata and channel/parameter definitions, and convert events to CSV or pandas DataFrame. Use when loading raw .fcs flow-cytometry files, inspecting channels and metadata, or preprocessing cytometry data for downstream gating and analysis. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# FlowIO：流式细胞术标准文件处理器

## 概述

FlowIO 是一个轻量级 Python 库，用于读取和写入流式细胞术标准（FCS）文件。它能够解析 FCS 元数据、提取事件数据，并以最少的依赖项创建新的 FCS 文件。支持 FCS 2.0、3.0 和 3.1 版本，非常适合后端服务、数据管道和基本的流式细胞术文件操作。

## 何时使用此 Skill

在以下情况下使用此 Skill：

- 需要解析 FCS 文件或提取元数据
- 需要将流式细胞术数据转换为 NumPy 数组
- 需要将事件数据导出为 FCS 格式
- 需要拆分包含多个数据集的 FCS 文件
- 必须提取通道信息（散射光、荧光、时间）
- 需要验证或检查流式细胞术文件
- 在进行高级分析之前需要预处理

**相关工具：**对于高级分析（补偿、设门、FlowJo/GatingML 支持），建议将 **FlowKit** 库作为 FlowIO 的配套工具。

## 安装

```bash
uv pip install flowio
```

需要 Python 3.9 或更高版本。

## 快速开始

```python
from flowio import FlowData

# Read FCS file and inspect
flow = FlowData('experiment.fcs')
print(f"FCS Version: {flow.version}")
print(f"Events: {flow.event_count}")
print(f"Channels: {flow.pnn_labels}")

# Get event data as NumPy array, shape (events, channels)
events = flow.as_array()
```

```python
import numpy as np
from flowio import create_fcs

# Write a new FCS file from a NumPy array.
# Gotcha: create_fcs takes a WRITABLE BINARY FILE HANDLE (not a path) and a
# FLATTENED 1-D event array — pass data.flatten(), not the 2-D matrix.
data = np.array([[100, 200, 50], [150, 180, 60]], dtype='float32')  # 2 events, 3 channels
with open('output.fcs', 'wb') as fh:
    create_fcs(fh, data.flatten(), ['FSC-A', 'SSC-A', 'FL1-A'])
```

## 核心工作流程

1. **读取** — 构造一个 `FlowData('file.fcs')` 实例。若只读取元数据（更节省内存），请使用 `only_text=True`；对于存在问题的文件，可传入偏移量/null 通道标志。
2. **检查** — 读取 `flow.version`、`flow.event_count`、`flow.pnn_labels`、`flow.pns_labels`、通道类型索引以及 `flow.text` 元数据字典。
3. **提取** — 通过 `flow.as_array()` 获取 NumPy 数组（已预处理），或通过 `flow.as_array(preprocess=False)` 获取原始数组。根据需要按通道类型进行切片。
4. **转换/导出** — 转换为 pandas DataFrame 或 CSV；也可以使用 `flow.write_fcs(path, ...)`（接收路径）或 `create_fcs(fh, data.flatten(), ...)`（接收二进制文件句柄和展平后的事件数据）写入新的 FCS 文件。输出始终为 FCS 3.1 格式，并使用单精度浮点数。
5. **多数据集** — 如果文件包含多个数据集，请使用 `read_multiple_data_sets()`，而不是构造函数。

## 路由指南

- **需要确切的函数签名、属性、异常或 FCS 关键字定义？**
  请阅读 `references/api_reference.md`。
- **正在执行某项核心操作（读取/解析、元数据、创建、导出、多数据集、预处理）？**
  请阅读 `references/workflows.md` 获取完整代码。
- **需要任务操作指南（检查文件、批量处理目录、FCS→CSV、筛选事件、提取通道）？**
  请阅读 `references/recipes.md`。
- **遇到错误，或需要最佳实践、文件结构或故障排除信息？**
  请阅读 `references/error-handling-and-troubleshooting.md`。

## 参考资料

- `references/api_reference.md` — 完整的 `FlowData` 类、实用函数
  （`read_multiple_data_sets`、`create_fcs`）、异常类、FCS 文件
  结构、常见的 TEXT 段关键字、通道类型和示例工作流。
- `references/workflows.md` — 核心操作的完整代码：读取/解析、
  元数据与通道提取、创建文件、导出/修改、
  多数据集处理和数据预处理。
- `references/recipes.md` — 完整示例：检查内容、批量
  处理目录、FCS→CSV 转换、事件过滤与重新导出，以及
  通道提取与统计。
- `references/error-handling-and-troubleshooting.md` — 异常处理
  模式、最佳实践、FCS 文件结构说明、故障排除表，
  以及集成说明（NumPy、pandas、FlowKit、Web 应用）。

## 总结

FlowIO 为流式细胞术工作流提供必要的 FCS 文件处理功能——可用于
解析、元数据提取和文件创建。对于简单的文件
操作和数据提取，仅使用 FlowIO 即可；对于复杂分析
（补偿、门控），请与 FlowKit 或其他专业工具集成。