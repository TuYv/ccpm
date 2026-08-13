---
name: alterlab-tiledbvcf
description: Store and query genomic variant data at scale with TileDB-VCF — ingest VCF/BCF into compressed TileDB arrays, add samples incrementally, run fast parallel region/sample queries, and export back to VCF. Use when managing population-genomics variant datasets that are too large for flat VCF, building joint variant stores, or querying thousands of samples by region. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "tiledbvcf-py is distributed via the `tiledb` conda channel (not PyPI/conda-forge/bioconda); native osx-arm64 builds exist for Apple Silicon. Local VCF stores work offline. TileDB Cloud features require a TileDB Cloud account and TILEDB_REST_TOKEN."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# TileDB-VCF

## 概述

TileDB-VCF 是一个高性能 C++ 库，提供 Python 和 CLI 接口，可高效存储和检索基因组变异检出数据。它基于 TileDB 的稀疏数组技术构建，支持以可扩展的方式摄取 VCF/BCF 文件，无需执行成本高昂的合并操作即可增量添加样本，并可对存储在本地或云端的变异数据执行高效的并行查询。

## 何时使用此 Skill

此 Skill 适用于以下情况：
- 从大量单样本 VCF/BCF 文件构建可查询的压缩变异数据存储（队列/群体数据集规模过大，不适合使用扁平 VCF）
- 无需重新合并即可将新样本增量添加到现有存储中
- 跨多个样本查询特定基因组区域（按区域/样本分区读取）
- 将区域/样本子集导出回 VCF/BCF，供下游工具使用
- 处理云存储（S3、Azure、GCS）或 TileDB Cloud 上的变异数据
- 为可扩展的基因组变异工作流构建原型或开展教学

## 快速开始

### 安装

**首选方法：通过 `tiledb` channel 使用 conda/mamba。** `tiledbvcf-py` 不在 PyPI、conda-forge 或 bioconda 上提供，而是通过 `tiledb` Anaconda channel 发布，并提供原生 `osx-arm64` 构建版本（在 Apple Silicon 上无需 Rosetta/`CONDA_SUBDIR` 变通方案）。支持 Python 3.9–3.12。
```bash
# Native Apple Silicon (osx-arm64) — also works on osx-64 / linux-64
conda create -n tiledb-vcf -c conda-forge -c tiledb \
  python=3.12 tiledbvcf-py=0.40 pandas pyarrow numpy
conda activate tiledb-vcf
```

**替代方法：Docker 镜像**（拉取 CLI/Python 接口；latest 标签会跟踪当前版本）
```bash
docker pull tiledb/tiledbvcf-py     # Python interface
docker pull tiledb/tiledbvcf-cli    # Command-line interface
```

### 基本示例

**创建并填充数据集：**
```python
import tiledbvcf

# Create a new dataset
ds = tiledbvcf.Dataset(uri="my_dataset", mode="w",
                      cfg=tiledbvcf.ReadConfig(memory_budget_mb=1024))

# Ingest VCF files (must be single-sample with indexes)
# Requirements:
# - VCFs must be single-sample (not multi-sample)
# - Must have indexes: .csi (bcftools) or .tbi (tabix)
ds.ingest_samples(["sample1.vcf.gz", "sample2.vcf.gz"])
```

**查询变异数据：**
```python
# Open existing dataset for reading
ds = tiledbvcf.Dataset(uri="my_dataset", mode="r")

# Query specific regions and samples
df = ds.read(
    attrs=["sample_name", "pos_start", "pos_end", "alleles", "fmt_GT"],
    regions=["chr1:1000000-2000000", "chr2:500000-1500000"],
    samples=["sample1", "sample2", "sample3"]
)
print(df.head())
```

**导出为 VCF：**
```python
import os

# Export two VCF samples
ds.export(
    regions=["chr21:8220186-8405573"],
    samples=["HG00101", "HG00097"],
    output_format="v",
    output_dir=os.path.expanduser("~"),
)
```

## 核心功能

### 1. 数据集创建和摄取

创建 TileDB-VCF 数据集，并从多个 VCF/BCF 文件中增量摄取变异数据。这适用于构建群体基因组学数据库和队列研究。

**要求：**
- **仅支持单样本 VCF**：不支持多样本 VCF
- **必须提供索引文件**：VCF/BCF 文件必须带有索引（.csi 或 .tbi）

**常见操作：**
- 使用优化的数组模式创建新数据集
- 并行摄取单个或多个 VCF/BCF 文件
- 增量添加新样本，无需重新处理现有数据
- 配置内存使用量和压缩设置
- 处理各种 VCF 格式以及 INFO/FORMAT 字段
- 恢复中断的摄取过程
- 在摄取期间验证数据完整性


### 2. 高效查询和筛选

跨基因组区域、样本和变异属性高性能地查询变异数据。这适用于关联研究、变异发现和群体分析。

**常见操作：**
- 查询特定基因组区域（单个或多个）
- 按样本名称或样本组筛选
- 提取特定变异属性（位置、等位基因、基因型、质量）
- 高效访问 INFO 和 FORMAT 字段
- 结合空间筛选和基于属性的筛选
- 以流式方式处理大型查询结果
- 跨样本或区域执行聚合


### 3. 数据导出和互操作性

将数据导出为各种格式，以供下游分析或与其他基因组学工具集成。这适用于共享数据集、创建分析子集或向其他流水线提供数据。

**常见操作：**
- 导出为标准 VCF/BCF 格式
- 使用选定字段生成 TSV 文件
- 创建特定于样本/区域的子集
- 保留数据来源和元数据
- 无损导出数据，保留所有注释
- 使用压缩输出格式
- 对大型数据集进行流式导出


### 4. 群体基因组学工作流

TileDB-VCF 非常适合大规模群体基因组学分析，此类分析需要高效访问众多样本和基因组区域中的变异数据。

**常见工作流：**
- 全基因组关联研究（GWAS）数据准备
- 稀有变异负荷检验
- 群体分层分析
- 跨群体计算等位基因频率
- 对大型队列进行质量控制
- 变异注释和筛选
- 跨群体比较分析


## 核心概念

### 数组模式和数据模型

**TileDB-VCF 数据模型：**
- 将变异存储为以基因组坐标作为维度的稀疏数组
- 将样本存储为属性，以便高效执行特定于样本的查询
- 保留 INFO 和 FORMAT 字段及其原始数据类型
- 自动压缩和分块，以实现最佳存储效果

**模式配置：**
```python
# Partition a large read across region/sample space
config = tiledbvcf.ReadConfig(
    memory_budget_mb=2048,        # memory budget in MB
    region_partition=(0, 10),     # (partition_index, num_partitions) over regions
    sample_partition=(0, 4),      # (partition_index, num_partitions) over samples
)
```

### 坐标系统和区域

**重要：** TileDB-VCF 遵循 VCF 标准，使用**从 1 开始的基因组坐标**：
- 位置从 1 开始（第一个碱基位于位置 1）
- 范围的两端均包含在内
- 区域 "chr1:1000-2000" 包含位置 1000-2000（共 1001 个碱基）

**区域指定格式：**
```python
# Single region
regions = ["chr1:1000000-2000000"]

# Multiple regions
regions = ["chr1:1000000-2000000", "chr2:500000-1500000"]

# Whole chromosome
regions = ["chr1"]
```

**注意：**`regions=` 字符串始终采用从 1 开始的闭区间坐标——start <= 0 会引发 "Regions must be 1-based" 错误。系统不会隐式执行 BED 风格的转换。若要使用从 0 开始的左闭右开 BED 区间，请通过 `read(bed_file="regions.bed", ...)` 传入 BED 文件，而不要使用 `regions=` 列表。

### 内存管理

**性能注意事项：**
1. **设置适当的内存预算**，具体取决于可用的系统内存
2. 对超大型结果集**使用流式查询**
3. **对大型数据摄取任务进行分区**，以避免内存耗尽
4. 为重复的区域访问**配置 tile 缓存**
5. 对多个文件**使用并行摄取**
6. 通过合并相邻区域来**优化区域查询**

### 云存储集成

TileDB-VCF 可与云存储无缝协作：
```python
# S3 dataset
ds = tiledbvcf.Dataset(uri="s3://bucket/dataset", mode="r")

# Azure Blob Storage
ds = tiledbvcf.Dataset(uri="azure://container/dataset", mode="r")

# Google Cloud Storage
ds = tiledbvcf.Dataset(uri="gcs://bucket/dataset", mode="r")
```

## 常见陷阱

1. **摄取期间内存耗尽：** 对大型 VCF 文件使用适当的内存预算和批处理
2. **低效的区域查询：** 合并相邻区域，而不是执行大量独立查询
3. **缺少样本名称：** 确保 VCF 标头中的样本名称与查询中指定的样本相匹配
4. **坐标系统混淆：** 请记住，TileDB-VCF 与 VCF 标准一样使用从 1 开始的坐标
5. **大型结果集：** 对返回数百万个变异的查询使用流式处理或分页
6. **云权限：** 确保已为云存储访问配置正确的身份验证
7. **并发访问：** 多个写入器同时写入同一数据集可能会导致数据损坏——请使用适当的锁定机制

## CLI 用法

TileDB-VCF 提供了一个命令行界面，其中包含以下子命令：

**可用的子命令：**
- `create` - 创建一个空的 TileDB-VCF 数据集
- `store` - 将样本摄取到 TileDB-VCF 数据集中
- `export` - 从 TileDB-VCF 数据集中导出数据
- `list` - 列出 TileDB-VCF 数据集中存在的所有样本名称
- `stat` - 输出 TileDB-VCF 数据集的高级统计信息
- `utils` - 用于处理 TileDB-VCF 数据集的实用工具
- `version` - 输出版本信息并退出

```bash
# Create empty dataset
tiledbvcf create --uri my_dataset

# Ingest samples (requires single-sample VCFs with indexes)
tiledbvcf store --uri my_dataset --samples sample1.vcf.gz,sample2.vcf.gz

# Export data
tiledbvcf export --uri my_dataset \
  --regions "chr1:1000000-2000000" \
  --sample-names "sample1,sample2"

# List all samples
tiledbvcf list --uri my_dataset

# Show dataset statistics
tiledbvcf stat --uri my_dataset
```

## 高级功能

以下是 `Dataset` 对象（以 mode="r" 打开）的方法，而不是顶层 `tiledbvcf` 函数。不存在 `read_allele_frequency` 或 `sample_qc` 函数——请使用下列方法。

### 等位基因计数 / 频率
```python
ds = tiledbvcf.Dataset(uri="my_dataset", mode="r")

# Internal allele-count (AC) array, returned as a pandas DataFrame
ac_df = ds.read_allele_count(region="chr1:1000000-2000000")

# Apply an allele-frequency filter at read time on a normal read()
df = ds.read(
    attrs=["sample_name", "pos_start", "alleles", "fmt_GT"],
    regions=["chr1:1000000-2000000"],
    set_af_filter="<0.01",  # keep variants with AF below threshold
)
```

### 变异统计信息（QC）
```python
# Internal variant-stats array (per-variant aggregate stats) as a DataFrame
stats_df = ds.read_variant_stats(region="chr1:1000000-2000000")
```
注意：`read_allele_count` 和 `read_variant_stats` 要求在摄取数据集时启用相应的内部数组（在近期版本中默认启用）。

### TileDB 配置透传
```python
# Pass raw TileDB Embedded config keys (e.g. cloud creds, cache sizing)
config = tiledbvcf.ReadConfig(
    memory_budget_mb=4096,
    tiledb_config={
        "sm.tile_cache_size": "1000000000",
        "vfs.s3.region": "us-east-1",
    },
)
```


## 资源

- TileDB-VCF GitHub（源代码、问题、版本发布）：https://github.com/TileDB-Inc/TileDB-VCF
- 群体基因组学指南（Academy）：https://cloud.tiledb.com/academy/structure/life-sciences/population-genomics/
- Python API 参考文档：https://tiledb-inc.github.io/TileDB-VCF/documentation/reference/Dataset.html
- TileDB Cloud（托管式、分布式）：https://cloud.tiledb.com

## 扩展至 TileDB Cloud

当工作负载超出单节点处理能力时（大致而言：超过 1000 个样本、超过 100 GB 的 VCF，或者需要分布式计算 / 共享访问），可以通过 `tiledb-cloud-py` 在 TileDB Cloud 上摄取和查询相同的数据集。本地 `tiledbvcf` API 保持不变；云端软件包增加了分布式编排功能。

**设置**
```bash
pip install "tiledb-cloud[life-sciences]"   # cloud client with genomics extras
export TILEDB_REST_TOKEN="your_api_token"   # auth is automatic from this env var
```

**分布式摄取和读取。** 云端 VCF 入口位于 `tiledb.cloud.vcf` 中：
- `tiledb.cloud.vcf.ingest(...)` — 将数据分布式摄取到 `tiledb://namespace/dataset` URI
- `tiledb.cloud.vcf.build_read_dag(...)` — 为区域/样本构建分布式读取 DAG

确切的函数签名和资源参数会随版本而变化，因此请查阅当前的 Cloud API 参考文档，而不要对其进行硬编码：https://cloud.tiledb.com/academy/structure/life-sciences/population-genomics/api-reference/cloud/

仍可通过常规的 `tiledbvcf.Dataset` API 打开云端托管的数据集，只需传入 `tiledb://` URI，以及一个携带凭据的 `tiledb_config`：
```python
import tiledbvcf

cfg = {"rest.token": "your_api_token"}  # or rely on TILEDB_REST_TOKEN
ds = tiledbvcf.Dataset("tiledb://TileDB-Inc/gvcf-1kg-dragen-v376",
                       mode="r", tiledb_config=cfg)
df = ds.read(
    attrs=["sample_name", "fmt_GT", "fmt_AD", "fmt_DP"],
    regions=["chr13:32396898-32397044", "chr13:32398162-32400268"],
    samples=ds.samples(),
)
```