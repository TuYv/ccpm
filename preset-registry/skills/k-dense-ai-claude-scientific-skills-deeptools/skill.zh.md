---
name: deeptools
description: NGS analysis toolkit. BAM to bigWig conversion, QC (correlation, PCA, fingerprints), heatmaps/profiles (TSS, peaks), for ChIP-seq, RNA-seq, ATAC-seq visualization.
license: BSD license
allowed-tools: Read Write Edit Bash
compatibility: Requires Python >3.8 and deepTools 3.5.6-compatible dependencies. The upstream project recommends conda/bioconda for full dependency resolution; repo examples use uv with pinned PyPI installs for reproducible command-line workflows.
metadata:
  version: "1.2"
  skill-author: K-Dense Inc.
---
# deepTools：NGS 数据分析工具包

## 概述

deepTools 是一套全面的 Python 命令行工具，旨在处理和分析高通量测序数据。使用 deepTools 可对 ChIP-seq、RNA-seq、ATAC-seq、MNase-seq 及其他 NGS 实验执行质量控制、数据标准化、样本比较，并生成适合发表的可视化图表。

**核心功能：**
- 将 BAM 比对结果转换为标准化覆盖度轨迹（bigWig/bedGraph）
- 质量控制评估（指纹图、相关性、覆盖度）
- 样本比较与相关性分析
- 围绕基因组特征生成热图和 profile 图
- 富集分析与 peak 区域可视化

## 何时使用此 Skill

在以下情况下应使用此 skill：

- **文件转换**："将 BAM 转换为 bigWig"、"生成覆盖度轨迹"、"标准化 ChIP-seq 数据"
- **质量控制**："检查 ChIP 质量"、"比较重复样本"、"评估测序深度"、"QC 分析"
- **可视化**："创建 TSS 周围的热图"、"绘制 ChIP 信号"、"可视化富集"、"生成 profile 图"
- **样本比较**："比较处理组与对照组"、"计算样本相关性"、"PCA 分析"
- **分析工作流**："分析 ChIP-seq 数据"、"RNA-seq 覆盖度"、"ATAC-seq 分析"、"完整工作流"
- **处理特定文件类型**：基因组学语境中的 BAM 文件、bigWig 文件、BED 区域文件

## 快速开始

对于刚开始使用 deepTools 的用户，请从文件验证和常见工作流开始：

### 1. 验证输入文件

在运行任何分析之前，使用验证脚本验证 BAM、bigWig 和 BED 文件：

```bash
python scripts/validate_files.py --bam sample1.bam sample2.bam --bed regions.bed
```

该脚本会检查文件是否存在、BAM 索引以及格式是否正确。

### 2. 生成工作流模板

对于标准分析，使用工作流生成器创建自定义脚本：

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

### 3. 最常见的操作

请参阅 `assets/quick_reference.md`，了解常用命令和参数。

## 安装

```bash
uv pip install deepTools==3.5.6
```

上游建议使用 conda/bioconda 解决完整的依赖关系，尤其是在共享 HPC 系统上：

```bash
conda install -c conda-forge -c bioconda deeptools
```

对于 Apple Silicon，当原生 conda 软件包不可用时，上游文档记录了上述 PyPI 安装方式，或使用 `osx-64` conda 环境。

## 核心工作流和工具类别

ChIP-seq QC、完整 ChIP-seq 分析、RNA-seq 覆盖度和
ATAC-seq 分析的完整命令序列，以及 BAM/bigWig 处理、质量控制和可视化
工具类别，位于 [references/core_workflows.md](references/core_workflows.md) 和
[references/workflows.md](references/workflows.md) 中。各工具的选项位于
[references/tools_reference.md](references/tools_reference.md) 中。

## 归一化方法

选择正确的归一化方法对于有效比较至关重要。请参阅 `references/normalization_methods.md` 获取全面指导。

**快速选择指南：**

- **ChIP-seq coverage**：使用 RPGC 或 CPM
- **ChIP-seq comparison**：使用带有 log2 和 readCount 的 bamCompare
- **RNA-seq bins**：使用 CPM
- **RNA-seq genes**：使用 RPKM（考虑基因长度）
- **ATAC-seq**：使用 RPGC 或 CPM

**归一化方法：**
- **RPGC**：1× 基因组覆盖度（需要 --effectiveGenomeSize）
- **CPM**：每百万比对 reads 的计数
- **RPKM**：每 kb 每百万 reads（按每个 bin 长度和文库大小缩放）
- **BPM**：每百万 bins，类似于对分箱信号进行 TPM 风格的缩放
- **None**：原始计数（不建议用于比较）

完整说明：`references/normalization_methods.md`

## 有效基因组大小

RPGC 归一化需要有效基因组大小。常用值如下：

| 生物体 | 组装版本 | 大小 | 用法 |
|----------|----------|------|-------|
| 人类 | GRCh38/hg38 | 2,913,022,398 | `--effectiveGenomeSize 2913022398` |
| 人类 | T2T/CHM13CAT_v2 | 3,117,292,070 | `--effectiveGenomeSize 3117292070` |
| 小鼠 | GRCm39/mm39 | 2,654,621,783 | `--effectiveGenomeSize 2654621783` |
| 小鼠 | GRCm38/mm10 | 2,652,783,500 | `--effectiveGenomeSize 2652783500` |
| 斑马鱼 | GRCz11 | 1,368,780,147 | `--effectiveGenomeSize 1368780147` |
| *果蝇* | dm6 | 142,573,017 | `--effectiveGenomeSize 142573017` |
| *秀丽隐杆线虫* | ce10/ce11 | 100,286,401 | `--effectiveGenomeSize 100286401` |

包含读取长度特异性值的完整表格：`references/effective_genome_sizes.md`

## 工具间通用参数

许多 deepTools 命令共享以下选项：

**性能：**
- `--numberOfProcessors, -p`：启用并行处理（始终使用可用核心数）
- `max` / `max/2`：`--numberOfProcessors` 支持的值；在调度器环境下很有用，因为近期 deepTools 版本会更谨慎地检测 CPU 亲和性
- `--region`：处理特定区域以进行测试（例如，`chr1:1-1000000`）

**读取过滤：**
- `--ignoreDuplicates`：移除 PCR 重复（推荐用于大多数分析）
- `--minMappingQuality`：按比对质量过滤（例如，`--minMappingQuality 10`）
- `--minFragmentLength` / `--maxFragmentLength`：片段长度边界
- `--samFlagInclude` / `--samFlagExclude`：SAM 标志过滤

**读取处理：**
- `--extendReads`：延伸至片段长度（ChIP-seq：是，RNA-seq：否）
- `--centerReads`：以片段中点为中心，以获得更清晰的信号

## 最佳实践

### 文件验证
**始终先验证文件**，使用 `scripts/validate_files.py` 检查：
- 文件是否存在且可读
- 是否存在 BAM 索引（.bai 文件）
- BED 格式是否正确
- 文件大小是否合理

### 分析策略

1. **从 QC 开始**：在继续之前运行相关性、覆盖度和指纹图分析
2. **在小区域上测试**：使用 `--region chr1:1-10000000` 进行参数测试
3. **记录命令**：保存完整命令行以确保可复现性
4. **使用一致的归一化方法**：在比较中对各样本应用相同的方法
5. **验证基因组组装版本**：确保 BAM 和 BED 文件使用匹配的基因组版本

### ChIP-seq 特定内容

- **始终延伸 reads** 用于 ChIP-seq：`--extendReads 200`
- **移除重复项**：大多数情况下使用 `--ignoreDuplicates`
- **先检查富集情况**：在进行详细分析之前运行 plotFingerprint
- **GC 校正**：仅在检测到显著偏倚时应用；GC 校正后绝不要使用 `--ignoreDuplicates`

### RNA-seq 特定内容

- **绝不要延伸 reads** 用于 RNA-seq（这会跨越剪接位点）
- **链特异性**：对于常见的 dUTP 型链特异性文库，使用 `--filterRNAstrand forward/reverse`；在解读链标签之前确认文库方向
- **归一化**：bin 使用 CPM，基因使用 RPKM

### ATAC-seq 特定内容

- **应用 Tn5 校正**：使用带有 `--ATACshift` 的 alignmentSieve
- **仅使用正确配对的 reads 进行偏移**：`--ATACshift` 等同于 `--shift 4 -5 5 -4`，并会筛选出正确配对的片段
- **片段筛选**：设置适当的最小/最大片段长度
- **检查核小体模式**：片段大小图应显示阶梯状模式

### 性能优化

1. **使用多个处理器**：`--numberOfProcessors 8`（或可用核心数）
2. **增大 bin 大小**以加快处理速度并减小文件体积
3. **分别处理各条染色体**，适用于内存受限的系统
4. **预筛选 BAM 文件**：使用 alignmentSieve 创建可重复使用的筛选后文件
5. **使用 bigWig 而非 bedGraph**：前者经过压缩且处理更快

## 故障排除

### 常见问题

**缺少 BAM 索引：**
```bash
samtools index input.bam
```

**内存不足：**
使用 `--region` 分别处理各条染色体：
```bash
bamCoverage --bam input.bam -o chr1.bw --region chr1
```

**处理速度慢：**
增加 `--numberOfProcessors` 和/或增大 `--binSize`

**bigWig 文件过大：**
增大 bin 大小：`--binSize 50` 或更大

### 验证错误

运行验证脚本以识别问题：
```bash
python scripts/validate_files.py --bam *.bam --bed regions.bed
```

常见错误及其解决方案会在脚本输出中说明。

## 参考文档

此技能包含全面的参考文档：

### references/tools_reference.md
按类别组织的所有 deepTools 命令完整文档：
- BAM 和 bigWig 处理工具（9 个工具）
- 质量控制工具（6 个工具）
- 可视化工具（3 个工具）
- 杂项工具（3 个工具，包括 `bigwigAverage`）

每个工具均包括：
- 用途和概述
- 附带说明的关键参数
- 使用示例
- 重要说明和最佳实践

**在以下情况下使用此参考：** 用户询问特定工具、参数或详细用法时。

### references/workflows.md
常见分析的完整工作流示例：
- ChIP-seq 质量控制工作流
- ChIP-seq 完整分析工作流
- RNA-seq 覆盖度工作流
- ATAC-seq 分析工作流
- 多样本比较工作流
- 峰区域分析工作流
- 故障排除和性能优化建议

**在以下情况下使用此参考：** 用户需要完整的分析管道或工作流示例时。

### references/normalization_methods.md
归一化方法综合指南：
- 各方法的详细说明（RPGC、CPM、RPKM、BPM 等）
- 各方法的适用场景
- 公式与解读
- 按实验类型划分的选择指南
- 常见陷阱与解决方案
- 快速参考表

**在以下情况使用此参考资料：** 用户询问归一化、比较样本或应使用哪种方法时。

### references/effective_genome_sizes.md
有效基因组大小的取值和用法：
- 常见生物的取值（人类、小鼠、果蝇、线虫、斑马鱼）
- 特定读长的取值
- 计算方法
- 何时以及如何在命令中使用
- 自定义基因组计算说明

**在以下情况使用此参考资料：** 用户需要基因组大小来进行 RPGC 归一化或 GC 偏倚校正时。

## 辅助脚本

### scripts/validate_files.py

验证用于 deepTools 分析的 BAM、bigWig 和 BED 文件。检查文件是否存在、索引和格式。

**用法：**
```bash
python scripts/validate_files.py --bam sample1.bam sample2.bam \
    --bed peaks.bed --bigwig signal.bw
```

**何时使用：** 在开始任何分析之前，或排查错误时。

### scripts/workflow_generator.py

为常见 deepTools 工作流程生成可自定义的 bash 脚本模板。

**可用工作流程：**
- `chipseq_qc`：ChIP-seq 质量控制
- `chipseq_analysis`：完整的 ChIP-seq 分析
- `rnaseq_coverage`：链特异性 RNA-seq 覆盖度分析
- `atacseq`：具有 Tn5 校正的 ATAC-seq

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

**何时使用：** 用户请求标准工作流程或需要可自定义的模板脚本时。

## 资源

### assets/quick_reference.md

快速参考卡，包含最常用的命令、有效基因组大小和典型工作流程模式。

**何时使用：** 用户需要快速命令示例而非详细文档时。

## 处理用户请求

### 面向新用户

1. 从验证安装开始
2. 使用 `scripts/validate_files.py` 验证输入文件
3. 根据实验类型推荐合适的工作流程
4. 使用 `scripts/workflow_generator.py` 生成工作流程模板
5. 指导用户进行自定义和执行

### 面向有经验的用户

1. 为所请求的操作提供具体工具命令
2. 参考 `references/tools_reference.md` 中的相应章节
3. 建议优化方案和最佳实践
4. 为问题提供故障排查建议

### 面向特定任务

**“将 BAM 转换为 bigWig”：**
- 使用 bamCoverage 并采用合适的归一化方式
- 根据使用场景推荐 RPGC 或 CPM
- 提供相应生物的有效基因组大小
- 建议相关参数（extendReads、ignoreDuplicates、binSize）

**“检查 ChIP 质量”：**
- 运行完整 QC 工作流程，或专门使用 plotFingerprint
- 说明如何解读结果
- 根据结果建议后续操作

**“创建热图”：**
- 指导完成两步流程：computeMatrix → plotHeatmap
- 帮助选择合适的矩阵模式（reference-point 与 scale-regions）
- 建议可视化参数和聚类选项

**“比较样本”：**
- 推荐使用 bamCompare 进行双样本比较
- 建议使用 multiBamSummary + plotCorrelation 进行多样本比较
- 指导选择归一化方法

### 引用文档

当用户需要详细信息时：
- **工具详情**：引导至 `references/tools_reference.md` 中的具体章节
- **工作流**：使用 `references/workflows.md` 获取完整的分析流程
- **标准化**：查阅 `references/normalization_methods.md` 以选择方法
- **基因组大小**：参考 `references/effective_genome_sizes.md`

## 交互示例

**用户：“我需要分析我的 ChIP-seq 数据”**

响应方式：
1. 询问可用文件（BAM 文件、峰值、基因）
2. 使用验证脚本验证文件
3. 生成 chipseq_analysis 工作流模板
4. 根据其具体文件和生物体进行定制
5. 在脚本运行时解释每个步骤

**用户：“我应该使用哪种标准化方法？”**

响应方式：
1. 询问实验类型（ChIP-seq、RNA-seq 等）
2. 询问比较目标（样本内或样本间）
3. 查阅 `references/normalization_methods.md` 中的选择指南
4. 推荐合适的方法并说明理由
5. 提供带参数的命令示例

**用户：“在 TSS 周围创建一个热图”**

响应方式：
1. 确认 bigWig 和基因 BED 文件可用
2. 在 TSS 处使用 reference-point 模式的 computeMatrix
3. 使用具有适当可视化参数的 plotHeatmap
4. 如果数据集较大，建议使用聚类
5. 提供轮廓图作为补充

## 关键提醒

- **先验证文件**：分析前始终验证输入文件
- **标准化很重要**：根据比较类型选择合适的方法
- **谨慎延伸 reads**：ChIP-seq 使用 YES，RNA-seq 使用 NO
- **使用所有核心**：将 `--numberOfProcessors` 设置为可用核心数
- **在区域上测试**：使用 `--region` 进行参数测试
- **先检查 QC**：在详细分析前运行质量控制
- **记录一切**：保存命令以确保可重复性
- **参考文档**：使用全面的参考资料获取详细指导