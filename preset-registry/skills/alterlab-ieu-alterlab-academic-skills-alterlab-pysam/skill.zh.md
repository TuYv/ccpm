---
name: alterlab-pysam
description: Read and write genomic alignment and variant files in Python with pysam (htslib bindings) — SAM/BAM/CRAM alignments, VCF/BCF variants, and FASTA/FASTQ sequences, plus region extraction and per-base coverage/pileup. Use when scripting NGS data-processing pipelines that parse, filter, index, or compute coverage over BAM/CRAM/VCF files. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Pysam

## 概述

Pysam 是一个用于读取、操作和写入基因组数据集的 Python 模块。它提供了面向 htslib 的 Pythonic 接口，可读写 SAM/BAM/CRAM 比对文件、VCF/BCF 变异文件以及 FASTA/FASTQ 序列。它还可以查询带有 tabix 索引的文件、执行用于覆盖度分析的 pileup 分析，以及运行 samtools/bcftools 命令。

## 何时使用此技能

以下情况应使用此技能：
- 处理测序比对文件（BAM/CRAM）
- 分析遗传变异（VCF/BCF）
- 提取参考序列或基因区域
- 处理原始测序数据（FASTQ）
- 计算覆盖度或读取深度
- 实现生物信息学分析流水线
- 对测序数据进行质量控制
- 变异检测和注释工作流

## 快速开始

### 安装
```bash
uv pip install pysam
```

### 基本示例

**读取比对文件：**
```python
import pysam

# Open BAM file and fetch reads in region
samfile = pysam.AlignmentFile("example.bam", "rb")
for read in samfile.fetch("chr1", 1000, 2000):
    print(f"{read.query_name}: {read.reference_start}")
samfile.close()
```

**读取变异文件：**
```python
# Open VCF file and iterate variants
vcf = pysam.VariantFile("variants.vcf")
for variant in vcf:
    print(f"{variant.chrom}:{variant.pos} {variant.ref}>{variant.alts}")
vcf.close()
```

**查询参考序列：**
```python
# Open FASTA and extract sequence
fasta = pysam.FastaFile("reference.fasta")
sequence = fasta.fetch("chr1", 1000, 2000)
print(sequence)
fasta.close()
```

## 核心功能

### 1. 比对文件操作（SAM/BAM/CRAM）

使用 `AlignmentFile` 类处理已比对的测序读段。它适用于分析比对结果、计算覆盖度、提取读段或进行质量控制。

**常用操作：**
- 打开并读取 BAM/SAM/CRAM 文件
- 获取特定基因组区域中的读段
- 按比对质量、标志或其他条件筛选读段
- 写入筛选或修改后的比对结果
- 计算覆盖度统计信息
- 执行 pileup 分析（逐碱基覆盖度）
- 访问读段序列、质量分数和比对信息

**参考：** 有关以下内容的详细文档，请参阅 `references/alignment_files.md`：
- 打开和读取比对文件
- AlignedSegment 属性和方法
- 使用 `fetch()` 按区域获取数据
- 用于覆盖度计算的 pileup 分析
- 写入和创建 BAM 文件
- 坐标系统和索引
- 性能优化技巧

### 2. 变异文件操作（VCF/BCF）

使用 `VariantFile` 类处理变异检测流水线生成的遗传变异。它适用于变异分析、筛选、注释或群体遗传学研究。

**常用操作：**
- 读取和写入 VCF/BCF 文件
- 查询特定区域中的变异
- 访问变异信息（位置、等位基因、质量）
- 提取样本的基因型数据
- 按质量、等位基因频率或其他条件筛选变异
- 使用附加信息注释变异
- 提取样本或区域子集

**参考：** 有关以下内容的详细文档，请参阅 `references/variant_files.md`：
- 打开和读取变异文件
- VariantRecord 属性和方法
- 访问 INFO 和 FORMAT 字段
- 处理基因型和样本
- 创建和写入 VCF 文件
- 筛选变异和提取变异子集
- 多样本 VCF 操作

### 3. 序列文件操作（FASTA/FASTQ）

使用 `FastaFile` 随机访问参考序列，使用 `FastxFile` 读取原始测序数据。这适用于提取基因序列、根据参考序列验证变异或处理原始读段。

**常见操作：**
- 按基因组坐标查询参考序列
- 提取基因或感兴趣区域的序列
- 读取包含质量分数的 FASTQ 文件
- 验证变异的参考等位基因
- 计算序列统计信息
- 按质量或长度筛选读段
- 在 FASTA 和 FASTQ 格式之间转换

**参考资料：** 有关以下内容的详细文档，请参阅 `references/sequence_files.md`：
- FASTA 文件访问和索引
- 按区域提取序列
- 处理基因的反向互补序列
- 顺序读取 FASTQ 文件
- 质量分数转换和筛选
- 使用 tabix 索引文件（BED、GTF、GFF）
- 常见序列处理模式

### 4. 集成式生物信息学工作流

Pysam 擅长集成多种文件类型，以进行全面的基因组分析。常见工作流会结合比对文件、变异文件和参考序列。

**常见工作流：**
- 计算特定区域的覆盖度统计信息
- 根据已比对读段验证变异
- 使用覆盖度信息注释变异
- 提取变异位置周围的序列
- 根据多个条件筛选比对结果或变异
- 生成用于可视化的覆盖度轨道
- 跨多种数据类型进行质量控制

**参考资料：** 有关以下内容的详细示例，请参阅 `references/common_workflows.md`：
- 质量控制工作流（BAM 统计信息、参考序列一致性）
- 覆盖度分析（逐碱基覆盖度、低覆盖度检测）
- 变异分析（注释、按读段支持度筛选）
- 序列提取（变异上下文、基因序列）
- 读段筛选和子集提取
- 集成模式（BAM+VCF、VCF+BED 等）
- 复杂工作流的性能优化

## 关键概念

### 坐标系统

**重要：** Pysam 使用**从 0 开始、左闭右开**的坐标（Python 约定）：
- 起始位置从 0 开始（第一个碱基位于位置 0）
- 结束位置不包含在范围内
- 区域 1000-2000 包含碱基 1000-1999（共 1000 个碱基）

**例外：** `fetch()` 中的区域字符串遵循 samtools 约定（从 1 开始）：
```python
samfile.fetch("chr1", 999, 2000)      # 0-based: positions 999-1999
samfile.fetch("chr1:1000-2000")       # 1-based string: positions 1000-2000
```

**VCF 文件：** 文件格式使用从 1 开始的坐标，但 `VariantRecord.start` 从 0 开始。

### 索引要求

随机访问特定基因组区域需要索引文件：
- **BAM 文件**：需要 `.bai` 索引（使用 `pysam.index()` 创建）
- **CRAM 文件**：需要 `.crai` 索引
- **FASTA 文件**：需要 `.fai` 索引（使用 `pysam.faidx()` 创建）
- **VCF.gz 文件**：需要 `.tbi` tabix 索引（使用 `pysam.tabix_index()` 创建）
- **BCF 文件**：需要 `.csi` 索引

如果没有索引，请使用 `fetch(until_eof=True)` 进行顺序读取。

### 文件模式

打开文件时指定格式：
- `"rb"` - 读取 BAM（二进制）
- `"r"` - 读取 SAM（文本）
- `"rc"` - 读取 CRAM
- `"wb"` - 写入 BAM
- `"w"` - 写入 SAM
- `"wc"` - 写入 CRAM

### 性能注意事项

1. 对于随机访问操作，**始终使用已建立索引的文件**
2. 对于按列分析，**使用 `pileup()`**，而不是重复执行 fetch 操作
3. 对于计数，**使用 `count()`**，而不是手动迭代计数
4. 分析相互独立的基因组区域时，**并行处理各区域**
5. **显式关闭文件**以释放资源
6. 对于无索引的顺序处理，**使用 `until_eof=True`**
7. 除非必要，否则**避免使用多个迭代器**（如有需要，请使用 `multiple_iterators=True`）

## 常见陷阱

1. **坐标混淆：** 请记住，不同上下文使用从 0 开始或从 1 开始的坐标系统
2. **缺少索引：** 许多操作都需要索引文件——请先创建索引
3. **部分重叠：** `fetch()` 返回与区域边界重叠的 reads，而不仅仅是完全包含在区域内的 reads
4. **无边界 pileup：** `pileup(chrom, start, stop)` 会为重叠 reads 跨越的每个位置生成列，而不仅仅是 `start..stop`——请传入 `truncate=True` 以限制在请求的窗口内
5. **静默丢弃低碱基质量数据：** `count_coverage()` 默认使用 `quality_threshold=15`，因此会忽略低质量碱基；设置 `quality_threshold=0` 可统计所有碱基
6. **迭代器作用域：** 保持对 pileup 迭代器的引用处于有效状态，以避免出现 "PileupProxy accessed after iterator finished" 错误
5. **质量分数编辑：** 更改 `query_sequence` 后，无法就地修改 `query_qualities`——请先创建副本
6. **流式处理限制：** 流式处理仅支持 stdin/stdout，不支持任意 Python 文件对象
7. **线程安全：** 尽管在 I/O 期间会释放 GIL，但全面的线程安全性尚未得到充分验证

## 命令行工具

Pysam 提供对 samtools 和 bcftools 命令的访问：

```python
# Sort BAM file
pysam.samtools.sort("-o", "sorted.bam", "input.bam")

# Index BAM
pysam.samtools.index("sorted.bam")

# View specific region
pysam.samtools.view("-b", "-o", "region.bam", "input.bam", "chr1:1000-2000")

# BCF tools
pysam.bcftools.view("-O", "z", "-o", "output.vcf.gz", "input.vcf")
```

**错误处理：**
```python
try:
    pysam.samtools.sort("-o", "output.bam", "input.bam")
except pysam.SamtoolsError as e:
    print(f"Error: {e}")
```

## 资源

### references/

各项主要功能的详细文档：

- **alignment_files.md** - SAM/BAM/CRAM 操作的完整指南，包括 AlignmentFile 类、AlignedSegment 属性、fetch 操作、pileup 分析以及写入 alignments

- **variant_files.md** - VCF/BCF 操作的完整指南，包括 VariantFile 类、VariantRecord 属性、genotype 处理、INFO/FORMAT 字段以及多样本操作

- **sequence_files.md** - FASTA/FASTQ 操作的完整指南，包括 FastaFile 和 FastxFile 类、sequence 提取、质量分数处理以及访问已建立 tabix 索引的文件

- **common_workflows.md** - 综合生物信息学工作流的实用示例，涵盖多种文件类型的组合使用，包括质量控制、覆盖度分析、变异验证和序列提取

## 获取帮助

有关特定操作的详细信息，请参阅相应的参考文档：

- 处理 BAM 文件或计算覆盖度 → `alignment_files.md`
- 分析变异或基因型 → `variant_files.md`
- 提取序列或处理 FASTQ → `sequence_files.md`
- 整合多种文件类型的复杂工作流 → `common_workflows.md`

官方文档：https://pysam.readthedocs.io/