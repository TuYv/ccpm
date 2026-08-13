---
name: alterlab-deeptools
description: Process and visualize deep-sequencing coverage with the deepTools CLI — convert BAM to bigWig (bamCoverage), build log2 ratio tracks (bamCompare), run QC (multiBamSummary correlation, PCA, plotFingerprint), apply the ATAC-seq Tn5 shift (alignmentSieve --ATACshift), and make TSS/peak heatmaps and profiles (computeMatrix, plotHeatmap, plotProfile). Use for coverage tracks, signal heatmaps/profiles, normalization (RPGC/CPM/RPKM), and effective-genome-size lookups for ChIP-seq, ATAC-seq, MNase-seq, or RNA-seq. NOT for per-read/CIGAR/MAPQ BAM record access — that is pysam. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# deepTools：NGS 数据分析工具包

## 概述

deepTools 是一套全面的 Python 命令行工具，专为处理和分析高通量测序数据而设计。使用 deepTools 可对 ChIP-seq、RNA-seq、ATAC-seq、MNase-seq 和其他 NGS 实验执行质量控制、数据归一化、样本比较，并生成可用于发表的高质量可视化图表。

**核心功能：**
- 将 BAM 比对结果转换为归一化的覆盖度轨道（bigWig/bedGraph）
- 质量控制评估（指纹图、相关性、覆盖度）
- 样本比较和相关性分析
- 生成基因组特征周围的热图和剖面图
- 富集分析和峰区域可视化

## 何时使用此 Skill

此 Skill 适用于以下情况：

- **文件转换**：“将 BAM 转换为 bigWig”“生成覆盖度轨道”“归一化 ChIP-seq 数据”
- **质量控制**：“检查 ChIP 质量”“比较生物学重复”“评估测序深度”“QC 分析”
- **可视化**：“创建 TSS 周围的热图”“绘制 ChIP 信号”“可视化富集情况”“生成剖面图”
- **样本比较**：“比较处理组与对照组”“计算样本相关性”“PCA 分析”
- **分析工作流**：“分析 ChIP-seq 数据”“RNA-seq 覆盖度”“ATAC-seq 分析”“完整工作流”
- **处理特定文件类型**：基因组学场景中的 BAM 文件、bigWig 文件和 BED 区域文件

## 快速入门

对于刚开始使用 deepTools 的用户，建议从文件验证和常用工作流入手：

### 1. 验证输入文件

运行任何分析之前，请使用验证脚本验证 BAM、bigWig 和 BED 文件：

```bash
python scripts/validate_files.py --bam sample1.bam sample2.bam --bed regions.bed
```

该脚本会检查文件是否存在、BAM 索引以及格式是否正确。

### 2. 生成工作流模板

对于标准分析，请使用工作流生成器创建自定义脚本：

```bash
# List available workflows
python scripts/workflow_generator.py --list

# Generate ChIP-seq QC workflow
python scripts/workflow_generator.py chipseq_qc -o qc_workflow.sh \
    --input-bam Input.bam --chip-bams "ChIP1.bam ChIP2.bam" \
    --genome-size 2913022398

# Make executable and run
chmod +x qc_workflow.sh
./qc_workflow.sh
```

### 3. 最常用的操作

有关常用命令和参数，请参阅 `assets/quick_reference.md`。

## 安装

```bash
uv pip install deeptools
```

## 核心工作流

deepTools 工作流通常遵循以下模式：**QC → 归一化 → 比较/可视化**

### ChIP-seq 质量控制工作流

当用户请求 ChIP-seq QC 或质量评估时：

1. **生成工作流脚本**：使用 `scripts/workflow_generator.py chipseq_qc`
2. **关键 QC 步骤**：
   - 样本相关性（multiBamSummary + plotCorrelation）
   - PCA 分析（plotPCA）
   - 覆盖度评估（plotCoverage）
   - 片段大小验证（bamPEFragmentSize）
   - ChIP 富集强度（plotFingerprint）

**结果解读：**
- **相关性**：重复样本应聚类在一起，并具有较高的相关性（>0.9）
- **指纹图**：富集效果好的 ChIP 会呈现陡峭上升；平坦的对角线表示富集效果较差
- **覆盖度**：评估测序深度是否足以支持分析

完整工作流详情见 `references/workflows.md` → “ChIP-seq 质量控制工作流”

### ChIP-seq 完整分析工作流

对于从 BAM 到可视化的完整 ChIP-seq 分析：

1. **生成覆盖度轨道**并进行标准化（bamCoverage）
2. **创建比较轨道**（使用 bamCompare 计算 log2 比率）
3. **计算特征周围的信号矩阵**（computeMatrix）
4. **生成可视化结果**（plotHeatmap、plotProfile）
5. **在峰区域进行富集分析**（plotEnrichment）

使用 `scripts/workflow_generator.py chipseq_analysis` 生成模板。

完整命令序列见 `references/workflows.md` → “ChIP-seq 分析工作流”

### RNA-seq 覆盖度工作流

对于链特异性 RNA-seq 覆盖度轨道：

使用带有 `--filterRNAstrand` 的 bamCoverage 来分离正向链和反向链。

**重要：**切勿对 RNA-seq 使用 `--extendReads`（这会使读段跨剪接位点延伸）。

标准化方法：固定分箱使用 CPM，基因水平分析使用 RPKM。

可用模板：`scripts/workflow_generator.py rnaseq_coverage`

详情见 `references/workflows.md` → “RNA-seq 覆盖度工作流”

### ATAC-seq 分析工作流

ATAC-seq 需要进行 Tn5 偏移校正：

1. **偏移读段**：使用带有 `--ATACshift` 的 alignmentSieve
2. **生成覆盖度**：使用 bamCoverage
3. **分析片段大小**（预期出现核小体梯状模式）
4. **在峰区域进行可视化**（如果可用）

模板：`scripts/workflow_generator.py atacseq`

完整工作流见 `references/workflows.md` → “ATAC-seq 工作流”

## 工具类别和常见任务

deepTools 命令分为三类。各类别的快速命令示例位于
`references/usage_playbook.md` → “按类别划分的内联命令示例”；
完整参数文档位于 `references/tools_reference.md`。

- **BAM/bigWig 处理** — bamCoverage、bamCompare、multiBamSummary、
  multiBigwigSummary、correctGCBias、alignmentSieve
  （`tools_reference.md` → “BAM 和 bigWig 文件处理工具”）
- **质量控制** — plotFingerprint、plotCoverage、plotCorrelation、plotPCA、
  bamPEFragmentSize（`tools_reference.md` → “质量控制工具”）
- **可视化** — computeMatrix、plotHeatmap、plotProfile、plotEnrichment
  （`tools_reference.md` → “可视化工具”）

## 标准化方法

选择正确的标准化方法对于进行有效比较至关重要。请参阅 `references/normalization_methods.md` 获取全面指导。

**快速选择指南：**

- **ChIP-seq 覆盖度**：使用 RPGC 或 CPM
- **ChIP-seq 比较**：使用带有 log2 和 readCount 的 bamCompare
- **RNA-seq 分箱**：使用 CPM
- **RNA-seq 基因**：使用 RPKM（考虑基因长度）
- **ATAC-seq**：使用 RPGC 或 CPM

**标准化方法：**
- **RPGC**：1× 基因组覆盖度（需要 --effectiveGenomeSize）
- **CPM**：每百万条已比对读段的计数
- **RPKM**：每百万条读段中每 kb 的读段数（考虑区域长度）
- **BPM**：每百万个分箱
- **None**：原始计数（不建议用于比较）

完整说明：`references/normalization_methods.md`

## 有效基因组大小

RPGC 归一化需要有效基因组大小。常用值如下：

| 生物体 | 组装版本 | 大小 | 用法 |
|----------|----------|------|-------|
| 人类 | GRCh38/hg38 | 2,913,022,398 | `--effectiveGenomeSize 2913022398` |
| 小鼠 | GRCm38/mm10 | 2,652,783,500 | `--effectiveGenomeSize 2652783500` |
| 斑马鱼 | GRCz11 | 1,368,780,147 | `--effectiveGenomeSize 1368780147` |
| *果蝇* | dm6 | 142,573,017 | `--effectiveGenomeSize 142573017` |
| *秀丽隐杆线虫* | ce10/ce11 | 100,286,401 | `--effectiveGenomeSize 100286401` |

包含特定读长对应值的完整表格：`references/effective_genome_sizes.md`

## 各工具的通用参数

许多 deepTools 命令都具有以下选项：

**性能：**
- `--numberOfProcessors, -p`：启用并行处理（始终使用可用的核心）
- `--region`：处理特定区域以进行测试（例如 `chr1:1-1000000`）

**读段过滤：**
- `--ignoreDuplicates`：移除 PCR 重复序列（推荐用于大多数分析）
- `--minMappingQuality`：按比对质量进行过滤（例如 `--minMappingQuality 10`）
- `--minFragmentLength` / `--maxFragmentLength`：片段长度范围
- `--samFlagInclude` / `--samFlagExclude`：SAM 标志过滤

**读段处理：**
- `--extendReads`：将读段延伸至片段长度（ChIP-seq：是，RNA-seq：否）
- `--centerReads`：将读段定位到片段中点，以获得更清晰的信号

## 最佳实践

### 文件验证
**始终先验证文件**，使用 `scripts/validate_files.py` 检查：
- 文件是否存在且可读
- 是否存在 BAM 索引（.bai 文件）
- BED 格式是否正确
- 文件大小是否合理

### 分析策略

1. **从质控开始**：继续后续步骤之前，先进行相关性、覆盖度和指纹分析
2. **在小区域上测试**：使用 `--region chr1:1-10000000` 进行参数测试
3. **记录命令**：保存完整命令行以确保可复现性
4. **使用一致的归一化方法**：在样本比较中对所有样本应用相同的方法
5. **验证基因组组装版本**：确保 BAM 和 BED 文件使用匹配的基因组构建版本

### ChIP-seq 特定事项

- **始终延伸读段**：对 ChIP-seq 使用 `--extendReads 200`
- **移除重复序列**：大多数情况下使用 `--ignoreDuplicates`
- **先检查富集情况**：在详细分析之前运行 plotFingerprint
- **GC 校正**：仅在检测到显著偏差时应用；GC 校正后切勿使用 `--ignoreDuplicates`

### RNA-seq 特定事项

- **切勿延伸读段**：不要对 RNA-seq 延伸读段（否则会跨越剪接位点）
- **链特异性**：对于链特异性文库，使用 `--filterRNAstrand forward/reverse`
- **归一化**：区间使用 CPM，基因使用 RPKM

### ATAC-seq 特定事项

- **应用 Tn5 校正**：使用带有 `--ATACshift` 的 alignmentSieve
- **片段过滤**：设置适当的最小和最大片段长度
- **检查核小体模式**：片段大小图应呈现梯状模式

### 性能优化

1. **使用多个处理器**：`--numberOfProcessors 8`（或可用的核心）
2. **增大区间大小**，以加快处理速度并减小文件
3. **分别处理各条染色体**，以适应内存有限的系统
4. **预先过滤 BAM 文件**：使用 alignmentSieve 创建可重复使用的过滤后文件
5. **使用 bigWig 而非 bedGraph**：bigWig 经过压缩且处理速度更快

## 故障排除

### 常见问题

**缺少 BAM 索引：**
```bash
samtools index input.bam
```

**内存不足：**
使用 `--region` 逐个处理染色体：
```bash
bamCoverage --bam input.bam -o chr1.bw --region chr1
```

**处理速度慢：**
增大 `--numberOfProcessors` 和/或 `--binSize`

**bigWig 文件过大：**
增大 bin 大小：`--binSize 50` 或更大

### 验证错误

运行验证脚本以识别问题：
```bash
python scripts/validate_files.py --bam *.bam --bed regions.bed
```

脚本输出中说明了常见错误及其解决方案。

## 参考文档

按需加载匹配的参考文档：

| 参考文档 | 加载时机 |
|-----------|-----------|
| `references/tools_reference.md` | 用户询问特定工具、参数或详细用法时。按类别列出所有命令（BAM/bigWig 9 个、QC 6 个、可视化 3 个、杂项 2 个），并提供参数、示例和说明。 |
| `references/workflows.md` | 用户需要完整的分析流程时。包括 ChIP-seq QC、ChIP-seq 分析、RNA-seq 覆盖度、ATAC-seq、多样本比较、峰区域分析和性能提示。 |
| `references/normalization_methods.md` | 用户询问归一化、样本比较或应使用哪种方法时。包括各方法的详细说明（RPGC/CPM/RPKM/BPM……）、公式、选择指南和常见陷阱。 |
| `references/effective_genome_sizes.md` | 用户需要用于 RPGC 归一化或 GC 偏差校正的基因组大小时。包括各物种和特定读长的数值，以及自定义基因组的计算方法。 |
| `references/usage_playbook.md` | 驱动该 Skill 时：包括针对各类请求的操作手册、交互示例、按类别整理的快速命令示例，以及用于搜索上述参考文档的 grep 方法。 |

## 辅助脚本

### scripts/validate_files.py

验证用于 deepTools 分析的 BAM、bigWig 和 BED 文件。检查文件是否存在、索引及格式。

**用法：**
```bash
python scripts/validate_files.py --bam sample1.bam sample2.bam \
    --bed peaks.bed --bigwig signal.bw
```

**使用时机：** 开始任何分析之前，或排查错误时。

### scripts/workflow_generator.py

为常见的 deepTools 工作流程生成可自定义的 bash 脚本模板。

**可用工作流程：**
- `chipseq_qc`：ChIP-seq 质量控制
- `chipseq_analysis`：完整的 ChIP-seq 分析
- `rnaseq_coverage`：链特异性 RNA-seq 覆盖度
- `atacseq`：带 Tn5 校正的 ATAC-seq

**用法：**
```bash
# List workflows
python scripts/workflow_generator.py --list

# Generate workflow
python scripts/workflow_generator.py chipseq_qc -o qc.sh \
    --input-bam Input.bam --chip-bams "ChIP1.bam ChIP2.bam" \
    --genome-size 2913022398 --threads 8

# Run generated workflow
chmod +x qc.sh
./qc.sh
```

**使用时机：** 用户请求标准工作流程或需要可自定义的模板脚本时。

## 资源

### assets/quick_reference.md

快速参考卡，包含最常用的命令、有效基因组大小和典型工作流程模式。

**使用时机：** 用户需要快速命令示例而不需要详细文档时。

## 处理用户请求

针对不同请求的操作手册（新用户与有经验的用户、针对“将 BAM 转换为 bigWig”/“检查 ChIP 质量”/“创建热图”/“比较样本”的特定任务响应）、交互示例，以及用于搜索参考资料的 grep 用法，均位于 `references/usage_playbook.md` 中。其共同流程是：先验证文件 → 选择正确的工作流/归一化方法 → 生成或运行命令 → 解释结果。

## 关键提醒

- **谨慎延伸 reads**：ChIP-seq 应使用 `--extendReads`，RNA-seq 不应使用（否则会跨越剪接位点）
- **bamCompare 中的归一化选项互斥**：RPGC 是一个 `--normalizeUsing` 值；`--scaleFactorsMethod` 仅接受 readCount/SES/None
- **RPGC 要求提供 `--effectiveGenomeSize`**；请验证组装版本与你的 BAM/BED 基因组构建版本一致
- **首先检查 QC**（plotFingerprint、correlation），然后再进行详细分析；使用 `--region` 测试参数