---
name: alterlab-qiime2-amplicon
description: 'Runs 16S/ITS amplicon (microbiome) analysis with the QIIME 2 amplicon distribution (2026.1; renamed to "qiime2" in 2026.4) in the correct order: manifest import, cutadapt trim-paired primer removal BEFORE dada2 denoise-paired (trunc-len chosen from the demux quality .qzv), feature-classifier classify-sklearn against a version-matched SILVA 138 or Greengenes2 classifier, and diversity core-metrics-phylogenetic — teaching the .qza/.qzv artifact-and-provenance model and the 2026.1 feature-table summarize change (the former summarize_plus). Use when the request mentions QIIME2, QIIME 2, qiime, 16S, 18S, ITS, amplicon, microbiome, ASV, DADA2 denoising, feature table, taxonomic classification, or core-metrics diversity. For downstream alpha/beta diversity, PCoA, and PERMANOVA on the exported feature table prefer alterlab-scikit-bio; this is conda-only (no pip install). Part of the AlterLab Academic Skills suite.'
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*) Bash(qiime:*) Bash(conda:*)
compatibility: "Requires the QIIME 2 amplicon conda environment (cannot be pip-installed); commands are run via the `qiime` CLI. Pretrained classifiers and reference data are downloaded from the QIIME 2 Library. The helper scripts in scripts/ are stdlib-only and run under `uv run python` without a QIIME 2 env."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# QIIME 2 扩增子——16S/ITS 微生物组流程（FASTQ → 特征表 → 分类注释 → 多样性）

这是用于标记基因（扩增子）微生物组分析的命令行工作流运行入口。给定原始的、已拆分样本的双端测序数据后，它会遵循 **QIIME 2 的标准顺序**——导入 → 引物修剪 → 去噪 → 分类 → 多样性分析——并讲解人们最容易出错的两件事：**在 DADA2 之前修剪引物**，以及 **.qza/.qzv 溯源模型**。这是一个从原始数据到结果的流程，最终会将特征表交给内存分析技能（参见下方的路由说明）。

固定使用 **QIIME 2 2026.1**（`amplicon` 发行版）。前向兼容说明：该发行版将在 **2026.4 中重命名为 `qiime2`**——环境名称和频道 URL 会发生变化，但下方的插件命令不会改变。

## 何时使用此技能

当请求涉及从测序读段开始运行扩增子/微生物组流程时，请使用此技能：

- “对我的双端测序读段运行 QIIME 2 16S 流程。”
- “我有 ITS 扩增子 FASTQ——使用 DADA2 去噪并进行分类注释。”
- “构建特征表/ASV 表，并使用 SILVA 进行分类。”
- “根据质量图选择截短长度，并运行 core-metrics 多样性分析。”
- “如何在 QIIME 2 中于 DADA2 之前修剪引物？”
- “QIIME 2 命令的正确执行顺序是什么？”

### 不会触发——将这些请求路由至其他技能

| 请求实际涉及…… | 路由至 |
|------------------------------|----------|
| 对已导出的特征表/距离表执行 Alpha/Beta 多样性、UniFrac、**PCoA 排序、PERMANOVA**（内存中，Python） | `alterlab-scikit-bio` |
| 在 QIIME 2 之外构建/操作系统发育树、可视化系统发育树或进行比较系统发育分析 | `alterlab-phylogenetics` / `alterlab-etetoolkit` |
| **宏基因组鸟枪法测序**分类谱分析、MAG 组装、功能基因分析（而非标记基因扩增子） | 不属于此技能——仅限扩增子；指出此能力缺口 |
| **RNA-seq** 转录本定量（salmon/kallisto）、差异表达分析 | `alterlab-rnaseq-quant` → `alterlab-pydeseq2` |
| **变异检测** FASTQ → VCF（生殖系/体细胞） | `alterlab-nf-core-sarek` |
| 蛋白质/核苷酸**序列相似性搜索**（BLAST+/DIAMOND） | `alterlab-blast` |
| **空间**转录组学邻域/富集分析 | `alterlab-squidpy-spatial` |
| 快速的一次性基因/序列/数据库查询 | `alterlab-gget` |
| 读写 BAM/SAM/VCF、修改比对文件 | `alterlab-pysam` |

此技能**仅适用于扩增子（标记基因）**。如果数据是宏基因组鸟枪法测序、单细胞数据，或除 16S/18S/ITS 标记基因测序之外的任何数据，请说明这一点并停止。

## Artifact 模型（.qza / .qzv）——请先阅读此部分

QIIME 2 中的所有内容都是记录自身溯源信息的**带类型压缩 Artifact**：

- **`.qza`**——QIIME 2 **Artifact**：数据（特征表、序列、分类器）以及嵌入的**语义类型**（例如 `SampleData[PairedEndSequencesWithQuality]`、`FeatureTable[Frequency]`）和生成该 Artifact 的每项操作所构成的完整**溯源图**。
- **`.qzv`**——**Visualization**：供人查看的报告（质量图、汇总结果、多样性 Emperor 图）。将其拖入 **https://view.qiime2.org**（离线、浏览器内运行），或运行 `qiime tools view file.qzv`。
- 溯源是实现可复现性的关键优势：任何 `.qza/.qzv` 都包含生成它时使用的确切命令、参数和插件版本。请保留 Artifact，而不只是导出文件。

将语义类型视为契约：一个操作只接受其声明类型的工件，这正是导入（步骤 1）如此重要的原因。

## 规范顺序（不要调整顺序）

```
manifest import → cutadapt trim-paired (primers) → dada2 denoise-paired
   → feature-table summarize → feature-classifier classify-sklearn
   → phylogeny → diversity core-metrics-phylogenetic
```

**引物修剪必须在 DADA2 之前进行。** DADA2 会对每个位点的错误率进行建模；残留的引物/接头碱基会破坏该错误模型，并增加伪 ASV。先使用 `cutadapt trim-paired` 进行修剪，然后再进行去噪。（如果你的 reads 已经不含引物——例如 EMP 风格的数据——可以跳过 cutadapt，但应先验证，不要想当然。）

### 0. 安装/激活环境（仅限 conda——不要使用 pip）

QIIME 2 **无法通过 pip 安装**；它以 conda 环境的形式发布。对于 2026.1
（已验证的环境文件位于 `qiime2/distributions`）：

```bash
# macOS (Apple Silicon / Intel) — 2026.1 amplicon distribution
conda env create \
  --name qiime2-amplicon-2026.1 \
  --file https://raw.githubusercontent.com/qiime2/distributions/dev/2026.1/amplicon/released/qiime2-amplicon-macos-latest-conda.yml
# Linux: swap the filename for qiime2-amplicon-ubuntu-latest-conda.yml
conda activate qiime2-amplicon-2026.1
qiime info   # confirm version + installed plugins
```

对于 **2026.4**，官方命令使用了重命名后的发行版
（`--name rachis-qiime2-2026.4`，文件为 `rachis-qiime2-*-conda.yml`）；请参阅 QIIME 2
Library 快速入门。完整的安装详情和环境文件矩阵：
[`references/installation.md`](references/installation.md)。

> 批量 DADA2 去噪和分类器训练会消耗大量 CPU/RAM。在 Cem 的 M4 Max 上，这些任务可以在本地顺利运行——不要通过 API 运行它们，而应在已执行 `conda activate` 的 shell 中运行。

### 1. 导入已拆分的双端 reads（manifest）

使用 **manifest**（一个将样本 ID → 绝对 FASTQ 路径进行映射的 TSV），以便精确控制哪些文件映射到哪些样本。格式：`PairedEndFastqManifestPhred33V2`
（已在 `q2-types` 中验证）。

```bash
qiime tools import \
  --type 'SampleData[PairedEndSequencesWithQuality]' \
  --input-format PairedEndFastqManifestPhred33V2 \
  --input-path manifest.tsv \
  --output-path demux.qza

qiime demux summarize \
  --i-data demux.qza \
  --o-visualization demux.qzv     # ← READ THIS to choose trunc-len
```

Manifest 模式、单端和 EMP 变体，以及 ITS 注意事项：
[`references/import_and_manifest.md`](references/import_and_manifest.md)。
使用 [`scripts/make_manifest.py`](scripts/make_manifest.py)
从 FASTQ 文件夹生成 manifest。

### 2. 使用 cutadapt 修剪引物（在 DADA2 之前）

```bash
qiime cutadapt trim-paired \
  --i-demultiplexed-sequences demux.qza \
  --p-front-f GTGYCAGCMGCCGCGGTAA \   # forward primer (example: 515F)
  --p-front-r GGACTACNVGGGTWTCTAAT \  # reverse primer (example: 806R)
  --p-discard-untrimmed \
  --o-trimmed-sequences demux-trimmed.qza
qiime demux summarize --i-data demux-trimmed.qza --o-visualization demux-trimmed.qzv
```

`--p-discard-untrimmed` 会丢弃未找到引物的 reads（对于靶向扩增子，这通常正是你想要的）。操作名称和 flag 名称已经通过 `q2-cutadapt` 源码验证。按区域选择引物（515F/806R、ITS1F/ITS2 等）：
[`references/pipeline_steps.md`](references/pipeline_steps.md)。

### 3. 使用 DADA2 去噪 → ASV + feature table

打开 `demux-trimmed.qzv`，查看**交互式质量图**，并在质量中位数开始下降的位置选择截断长度（正向和反向分别选择）。截断后的 read 长度仍须保留足够的重叠区域，以便合并双端 reads。

```bash
qiime dada2 denoise-paired \
  --i-demultiplexed-seqs demux-trimmed.qza \
  --p-trunc-len-f 0 --p-trunc-len-r 0 \   # ← set from the quality .qzv (0 = no truncation)
  --p-trim-left-f 0 --p-trim-left-r 0 \
  --o-representative-sequences rep-seqs.qza \
  --o-table table.qza \
  --o-denoising-stats denoising-stats.qza
qiime metadata tabulate \
  --m-input-file denoising-stats.qza --o-visualization denoising-stats.qzv
```

务必检查 `denoising-stats.qzv`：合并率或嵌合体保留率较低，通常意味着 trunc-len 设置过于激进（没有重叠区域），或者引物尚未被剪除。

### 4. 汇总 feature table — 注意 2026.1 中的变更

```bash
qiime feature-table summarize \
  --i-table table.qza \
  --m-sample-metadata-file sample-metadata.tsv \
  --o-summary table.qzv
```

**2026.1 破坏性变更（已通过发布说明验证）：**旧的 `summarize` 可视化工具已重命名为 `_summarize`，而原来的 **`summarize_plus` pipeline 现在改名为 `summarize`**——因此，如今的 `feature-table summarize` *就是*增强版汇总（它还会生成 feature/sample frequency artifacts）。调用 `summarize_plus` 的旧教程必须改用 `summarize`。详情：
[`references/version_notes.md`](references/version_notes.md)。

### 5. 分配 taxonomy — 版本匹配的 classifier

```bash
qiime feature-classifier classify-sklearn \
  --i-classifier silva-138-99-nb-classifier.qza \   # MUST match your QIIME 2 version
  --i-reads rep-seqs.qza \
  --o-classification taxonomy.qza
qiime metadata tabulate --m-input-file taxonomy.qza --o-visualization taxonomy.qzv
```

预训练的朴素贝叶斯 classifier 是经过 **pickle 序列化的 scikit-learn** 模型——它只能在与训练它时相同的 QIIME 2 版本中加载。请从 QIIME 2 Library 下载专为**你的**版本构建的 classifier（16S/18S 使用 SILVA 138，16S 使用 Greengenes2，ITS 使用 UNITE）。版本匹配陷阱以及自行训练的方法：
[`references/classifiers.md`](references/classifiers.md)。

### 6. 系统发育树 + 核心多样性

```bash
qiime phylogeny align-to-tree-mafft-fasttree \
  --i-sequences rep-seqs.qza \
  --o-alignment aligned.qza --o-masked-alignment masked.qza \
  --o-tree unrooted-tree.qza --o-rooted-tree rooted-tree.qza

qiime diversity core-metrics-phylogenetic \
  --i-phylogeny rooted-tree.qza \
  --i-table table.qza \
  --p-sampling-depth 1103 \           # ← choose from table.qzv rarefaction; see below
  --m-metadata-file sample-metadata.tsv \
  --output-dir core-metrics
```

**采样深度**是稀释分析的下限：每个样本都会被随机抽样至该读取数，
低于此深度的样本则会被丢弃。应根据 `table.qzv` 选择该值，在测序深度与样本
保留率之间取得平衡——切勿猜测。`core-metrics-phylogenetic` 可一次性生成 Faith's PD、Shannon、
观测特征数、Bray-Curtis / Jaccard / 加权和未加权 UniFrac 距离矩阵，
以及 Emperor PCoA `.qzv` 文件。

对于**基于导出表格进行的统计分析和排序分析**（PERMANOVA、自定义 PCoA、使用 Python
计算 alpha/beta 多样性指标），请导出并交由 **`alterlab-scikit-bio`** 处理——它是此流水线的
内存分析配套工具。

## 导出并交由下游处理

```bash
qiime tools export --input-path table.qza --output-path exported/   # → feature-table.biom
qiime tools export --input-path taxonomy.qza --output-path exported/ # → taxonomy.tsv
```

`scripts/check_artifact.py` 会读取 `.qza/.qzv`（它其实就是一个 zip 文件），并打印其语义
类型、UUID 和溯源操作列表，**无需安装 QIIME 2**——这有助于进行
健全性检查，确认制品符合下游步骤的预期。

## 报告前的自检

- 是否在 DADA2 **之前**修剪了引物？如果 `--p-discard-untrimmed` 丢弃了几乎
  所有内容，则引物序列很可能有误。
- 是否根据**质量 `.qzv`** 选择了截断长度，以及 `denoising-stats.qzv` 是否显示
  合理的合并与非嵌合体保留率？
- 分类器是否与当前运行的 QIIME 2 版本**相匹配**？
- `--p-sampling-depth` 是否有 `table.qzv` 作为依据，而不是凭空猜测？
- 是否调用了 `feature-table summarize`（2026.1 = 原 `summarize_plus`），而非已移除的
  操作名称？

## 参考资料

- [`references/installation.md`](references/installation.md) — conda 环境文件（2026.1 / 2026.4 重命名）、`qiime info`，以及不使用 pip 的原因。
- [`references/import_and_manifest.md`](references/import_and_manifest.md) — 清单格式、单端/EMP/ITS 导入。
- [`references/pipeline_steps.md`](references/pipeline_steps.md) — 各步骤的参数、按区域划分的引物集、降噪质控结果解读。
- [`references/classifiers.md`](references/classifiers.md) — SILVA 138 / Greengenes2 / UNITE、版本匹配、自行训练分类器。
- [`references/version_notes.md`](references/version_notes.md) — 2026.1 版本变更、2026.4 `qiime2` 重命名、`summarize` 变更。

AlterLab Academic Skills 套件的一部分。