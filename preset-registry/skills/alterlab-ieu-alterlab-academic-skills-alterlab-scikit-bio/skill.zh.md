---
name: alterlab-scikit-bio
description: Analyze biological data with scikit-bio — sequence analysis and alignments, phylogenetic trees, alpha/beta diversity metrics (including UniFrac), ordination (PCoA), PERMANOVA statistics, and FASTA/Newick I/O. Use for microbiome and community-ecology analysis — computing diversity, distance matrices, and ordination from feature tables. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# scikit-bio

## 概述

scikit-bio 是一个用于处理生物数据的综合性 Python 库。此技能适用于涵盖序列操作、比对、系统发育学、微生物生态学和多元统计的生物信息学分析。

## 何时使用此技能

当用户有以下需求时，应使用此技能：
- 处理生物序列（DNA、RNA、蛋白质）
- 需要读写生物学文件格式（FASTA、FASTQ、GenBank、Newick、BIOM 等）
- 执行序列比对或搜索基序
- 构建或分析系统发育树
- 计算多样性指标（α/β 多样性、UniFrac 距离）
- 执行排序分析（PCoA、CCA、RDA）
- 对生物学/生态学数据运行统计检验（PERMANOVA、ANOSIM、Mantel）
- 分析微生物组或群落生态学数据
- 处理来自语言模型的蛋白质嵌入
- 需要操作生物数据表

## 核心功能

### 1. 序列操作

使用专门用于 DNA、RNA 和蛋白质数据的类处理生物序列。

**主要操作：**
- 从 FASTA、FASTQ、GenBank、EMBL 格式中读写序列
- 序列切片、拼接和搜索
- 反向互补、转录（DNA→RNA）和翻译（RNA→蛋白质）
- 使用正则表达式查找基序和模式
- 计算距离（基于汉明距离、k-mer）
- 处理序列质量分数和元数据

**常见模式：**
```python
import skbio

# Read sequences from file
seq = skbio.DNA.read('input.fasta')

# Sequence operations
rc = seq.reverse_complement()
rna = seq.transcribe()
protein = rna.translate()

# Find motifs
motif_positions = seq.find_with_regex('ATG[ACGT]{3}')

# Check for properties
has_degens = seq.has_degenerates()
seq_no_gaps = seq.degap()
```

**重要说明：**
- 对于具有字符集规则和验证机制的序列，请使用 `DNA`、`RNA`、`Protein` 类
- 对于不受字母表限制的通用序列，请使用 `Sequence` 类
- 从 FASTQ 文件加载时，质量分数会自动载入位置元数据
- 元数据类型：序列级（ID、描述）、位置级（每个碱基）、区间级（区域/特征）

### 2. 序列比对

使用动态规划算法执行双序列比对和多序列比对。

**主要功能：**
- 通过统一的 `pair_align` API 执行全局（Needleman-Wunsch）和局部（Smith-Waterman）双序列比对
- 可配置评分（匹配/错配元组、命名替换矩阵、仿射空位代价）
- 通过 `PairAlignPath` 处理 CIGAR 字符串
- 使用 `TabularMSA` 存储和操作多序列比对

**常见模式：**
```python
from skbio.alignment import pair_align, pair_align_nucl, pair_align_prot, TabularMSA
from skbio import DNA

# Pairwise alignment (0.7+ unified API). mode='global' (default) or 'local'.
seq1, seq2 = DNA('ATCGATCGATCG'), DNA('ATCGGGGATCG')
res = pair_align(seq1, seq2, mode='local')
print(res.score)
aligned = res.paths[0].to_aligned((seq1, seq2))  # tuple of aligned sequences

# Nucleotide / protein convenience wrappers with sensible defaults
res = pair_align_nucl(seq1, seq2)                       # DNA/RNA
# res = pair_align_prot(p1, p2, sub_score='BLOSUM62')   # protein

# Read multiple alignment from file
msa = TabularMSA.read('alignment.fasta', constructor=DNA)
consensus = msa.consensus()
```

**重要说明：**
- `pair_align` 返回一个命名元组 `(score, paths, matrices)`；`paths` 是由 `PairAlignPath` 对象组成的列表（数量最多为 `max_paths`）。
- `sub_score` 接受 `(match, mismatch)` 元组、命名矩阵字符串（例如 `'BLOSUM62'`）或 `SubstitutionMatrix`；`gap_cost` 接受单个值（线性）或 `(open, extend)` 元组（仿射——推荐用于生物序列）。
- 较旧的 `local_pairwise_align_ssw`、`StripedSmithWaterman` 和 `*_pairwise_align`/`AlignScorer` 接口已在 0.6–0.7 版本中被移除或弃用；请改用 `pair_align*`。

### 3. 系统发育树

构建、操作和分析表示进化关系的系统发育树。

**主要功能：**
- 根据距离矩阵构建树（UPGMA、WPGMA、邻接法、GME、BME）
- 树操作（剪枝、重新定根、遍历）
- 距离计算（谱系距离、表型距离、Robinson-Foulds 距离）
- ASCII 可视化
- Newick 格式输入/输出

**常见模式：**
```python
from skbio import TreeNode
from skbio.tree import nj

# Read tree from file
tree = TreeNode.read('tree.nwk')

# Construct tree from distance matrix
tree = nj(distance_matrix)

# Tree operations
subtree = tree.shear(['taxon1', 'taxon2', 'taxon3'])
tips = [node for node in tree.tips()]
lca = tree.lowest_common_ancestor(['taxon1', 'taxon2'])

# Calculate distances
patristic_dist = tree.find('taxon1').distance(tree.find('taxon2'))
cophenetic_matrix = tree.cophenetic_matrix()

# Compare tree topologies (Robinson-Foulds)
rf_distance = tree.compare_rfd(other_tree)
```

**重要说明：**
- 树构建功能位于 `skbio.tree` 中：`nj`（邻接法）、`upgma`（假设存在分子钟）以及 `gme`/`bme`（贪心/平衡最小进化法）。
- Robinson-Foulds 距离使用 `tree.compare_rfd(other)`；模块级函数 `rf_dists()` 用于计算多棵树之间的成对 RF 距离。（`robinson_foulds` 已重命名。）
- GME 和 BME 对大型树具有很高的可扩展性。
- 树可以是有根树或无根树；某些度量要求特定的定根方式。

### 4. 多样性分析

计算用于微生物生态学和群落分析的 alpha 与 beta 多样性指标。

**主要功能：**
- Alpha 多样性：丰富度、Shannon 熵、Simpson 指数、Faith 系统发育多样性、Pielou 均匀度
- Beta 多样性：Bray-Curtis、Jaccard、加权/未加权 UniFrac、欧几里得距离
- 系统发育多样性指标（需要提供树作为输入）
- 稀释分析和子采样
- 与排序分析和统计检验集成

**常见模式：**
```python
from skbio.diversity import alpha_diversity, beta_diversity
import skbio

# Alpha diversity
alpha = alpha_diversity('shannon', counts_matrix, ids=sample_ids)
faith_pd = alpha_diversity('faith_pd', counts_matrix, ids=sample_ids,
                          tree=tree, taxa=feature_ids)

# Beta diversity
bc_dm = beta_diversity('braycurtis', counts_matrix, ids=sample_ids)
unifrac_dm = beta_diversity('unweighted_unifrac', counts_matrix,
                           ids=sample_ids, tree=tree, taxa=feature_ids)

# Get available metrics
from skbio.diversity import get_alpha_diversity_metrics
print(get_alpha_diversity_metrics())
```

**重要说明：**
- 计数必须是表示丰度的整数，而不是相对频率。
- 系统发育指标的特征 ID 参数是 `taxa=`（在 0.6 中由 `otu_ids=` 重命名；整个项目已使用“taxon”取代“OTU”术语）。普通丰富度指标是 `observed_features`，而不是旧的 `observed_otus`。
- 系统发育指标（Faith's PD、UniFrac）需要提供 `tree`，以及与树的叶节点匹配的 `taxa`（特征）ID。
- 仅计算特定样本对时，请使用 `partial_beta_diversity()`。
- Alpha 多样性返回 `pandas.Series`；Beta 多样性返回 `DistanceMatrix`。

### 5. 排序方法

将高维生物数据降维至可视化的低维空间。

**主要功能：**
- 基于距离矩阵的 PCoA（主坐标分析）
- 用于列联表的 CA（对应分析）
- 带环境约束的 CCA（典范对应分析）
- 用于线性关系的 RDA（冗余分析）
- 用于特征解释的双标图投影

**常见模式：**
```python
from skbio.stats.ordination import pcoa, cca

# PCoA from distance matrix
pcoa_results = pcoa(distance_matrix)
pc1 = pcoa_results.samples['PC1']
pc2 = pcoa_results.samples['PC2']

# CCA: y = samples-by-features table, x = samples-by-constraints (environment)
cca_results = cca(feature_table, environmental_matrix)

# Save/load ordination results
pcoa_results.write('ordination.txt')
results = skbio.OrdinationResults.read('ordination.txt')
```

**重要说明：**
- PCoA 适用于任何距离/相异度矩阵
- CCA 可揭示影响群落组成的环境驱动因素
- 排序结果包括特征值、解释比例以及样本/特征坐标
- 结果可与绘图库（matplotlib、seaborn、plotly）集成

### 6. 统计检验

执行专用于生态和生物数据的假设检验。

**主要功能：**
- PERMANOVA：使用距离矩阵检验组间差异
- ANOSIM：另一种组间差异检验
- PERMDISP：检验组间离散程度的同质性
- Mantel 检验：检验距离矩阵之间的相关性
- Bioenv：查找与距离相关的环境变量

**常见模式：**
```python
from skbio.stats.distance import permanova, anosim, mantel

# Test if groups differ significantly
permanova_results = permanova(distance_matrix, grouping, permutations=999)
print(f"p-value: {permanova_results['p-value']}")

# ANOSIM test
anosim_results = anosim(distance_matrix, grouping, permutations=999)

# Mantel test between two distance matrices
mantel_results = mantel(dm1, dm2, method='pearson', permutations=999)
print(f"Correlation: {mantel_results[0]}, p-value: {mantel_results[1]}")
```

**重要说明：**
- 置换检验可提供非参数显著性检验
- 使用 999 次或更多次置换，以获得稳健的 p 值
- PERMANOVA 对离散程度差异敏感；应搭配 PERMDISP 使用
- Mantel 检验用于评估矩阵相关性（例如，地理距离与遗传距离）

### 7. 文件 I/O 与格式转换

支持读写 19 种以上的生物学文件格式，并可自动检测格式。

**支持的格式：**
- 序列：FASTA、FASTQ、GenBank、EMBL、QSeq
- 比对：Clustal、PHYLIP、Stockholm
- 树：Newick
- 表：BIOM（HDF5 和 JSON）
- 距离：分隔符分隔的方阵
- 分析：BLAST+6/7、GFF3、排序分析结果
- 元数据：带验证的 TSV/CSV

**常见模式：**
```python
import skbio

# Read with automatic format detection
seq = skbio.DNA.read('file.fasta', format='fasta')
tree = skbio.TreeNode.read('tree.nwk')

# Write to file
seq.write('output.fasta', format='fasta')

# Generator for large files (memory efficient)
for seq in skbio.io.read('large.fasta', format='fasta', constructor=skbio.DNA):
    process(seq)

# Convert formats
seqs = list(skbio.io.read('input.fastq', format='fastq', constructor=skbio.DNA))
skbio.io.write(seqs, format='fasta', into='output.fasta')
```

**重要说明：**
- 对大型文件使用生成器，以避免内存问题
- 指定 `into` 参数时，可以自动检测格式
- 某些对象可以写入多种格式
- 通过 `verify=False` 支持 stdin/stdout 管道传输

### 8. 距离矩阵

使用统计方法创建和操作距离/相异度矩阵。

**主要功能：**
- 存储对称（DistanceMatrix）或非对称（DissimilarityMatrix）数据
- 基于 ID 的索引和切片
- 与多样性分析、排序分析和统计检验集成
- 读写分隔符分隔的文本格式

**常见模式：**
```python
from skbio import DistanceMatrix
import numpy as np

# Create from array
data = np.array([[0, 1, 2], [1, 0, 3], [2, 3, 0]])
dm = DistanceMatrix(data, ids=['A', 'B', 'C'])

# Access distances
dist_ab = dm['A', 'B']
row_a = dm['A']

# Read from file
dm = DistanceMatrix.read('distances.txt')

# Use in downstream analyses
pcoa_results = pcoa(dm)
permanova_results = permanova(dm, grouping)
```

**重要说明：**
- DistanceMatrix 强制要求矩阵对称且对角线为零
- DissimilarityMatrix 允许非对称值
- ID 支持与元数据和生物学知识集成
- 与 pandas、numpy 和 scikit-learn 兼容

### 9. 生物学表

处理微生物组研究中常见的特征表（OTU/ASV 表）。

**主要功能：**
- BIOM 格式 I/O（HDF5 和 JSON）
- 与 pandas、polars、AnnData、numpy 集成
- 数据增强技术（phylomix、mixup、成分数据方法）
- 样本/特征过滤和归一化
- 元数据集成

**常见模式：**
```python
from skbio.table import Table

# Read BIOM table
table = Table.read('table.biom')

# Access data
sample_ids = table.ids(axis='sample')
feature_ids = table.ids(axis='observation')
counts = table.matrix_data  # scipy sparse; .toarray() for dense

# Filter
filtered = table.filter(sample_ids_to_keep, axis='sample')

# To pandas (sparse by default)
df = table.to_dataframe(dense=True)
```

**重要说明：**
- `Table` 是 scikit-bio 对 BIOM `Table` 的重新导出；应从 `skbio.table` 导入（而不是从顶层 `skbio` 命名空间导入）。
- 按照 BIOM 约定，`observation` = 特征（分类群/OTU/ASV），`sample` = 样本；`matrix_data` 是以观测为行、样本为列的稀疏矩阵。
- 可通过 `Table(data, observation_ids, sample_ids)` 构造函数或 `Table.from_tsv` / `from_json` / `from_hdf5` 从现有数据构建（不存在 `from_dataframe`）。
- BIOM 表是 QIIME 2 工作流中的标准格式；对于大型表，HDF5 比 JSON 更高效。

### 10. 蛋白质嵌入

使用蛋白质语言模型嵌入进行下游分析。

**主要功能：**
- 存储蛋白质语言模型（ESM、ProtTrans 等）生成的嵌入
- 将嵌入转换为距离矩阵
- 生成用于可视化的排序对象
- 导出为 numpy/pandas 格式，用于机器学习工作流

**常见模式：**
```python
from skbio.embedding import (
    ProteinEmbedding, ProteinVector,
    embed_vec_to_distances, embed_vec_to_ordination, embed_vec_to_numpy,
)

# Per-residue embedding for one protein (e.g. an ESM output)
emb = ProteinEmbedding(embedding_array, sequence)

# One fixed-length vector per protein (e.g. a mean-pooled embedding)
vecs = [ProteinVector(vec, seq) for vec, seq in zip(vectors, sequences)]

# Module-level helpers operate on a collection of *Vector objects:
arr = embed_vec_to_numpy(vecs)                      # ndarray for ML
dm = embed_vec_to_distances(vecs, metric='euclidean')   # DistanceMatrix
ord_results = embed_vec_to_ordination(vecs)             # OrdinationResults (PCoA)
```

**重要说明：**
- 请区分 `*Embedding`（单个序列的逐位置矩阵）与 `*Vector`（每个序列对应一个汇总向量）。
- `to_distances`/`to_ordination`/`to_numpy`/`to_dataframe` 转换是针对向量列表的**模块级函数**（`embed_vec_to_*`），而不是嵌入对象的方法。
- 输出（`DistanceMatrix`、`OrdinationResults`）可直接接入 scikit-bio 的多样性分析、排序分析和统计分析生态系统。

## 最佳实践

### 安装
```bash
uv pip install "scikit-bio>=0.7,<0.8"   # examples here target the 0.7 API
```
从 0.6 到 0.7 的版本更新重命名了多个接口（`otu_ids`→`taxa`、`observed_otus`→`observed_features`、`robinson_foulds`→`compare_rfd`），并使用 `pair_align*` 替换了旧的成对比对函数。如果你依赖这些接口，请固定版本。

### 性能注意事项
- 对大型序列文件使用生成器，以尽量减少内存占用
- 对于超大型系统发育树，优先使用 GME 或 BME，而不是 NJ
- Beta 多样性计算可使用 `partial_beta_diversity()` 进行并行化
- 对于大型表格，BIOM 格式（HDF5）比 JSON 更高效

### 与生态系统集成
- 序列可通过标准格式与 Biopython 互操作
- 表格可与 pandas、polars 和 AnnData 集成
- 距离矩阵与 scikit-learn 兼容
- 排序结果可使用 matplotlib/seaborn/plotly 进行可视化
- 可与 QIIME 2 工件（BIOM、树、距离矩阵）无缝协作

### 常见工作流
1. **微生物组多样性分析**：读取 BIOM 表格 → 计算 alpha/beta 多样性 → 排序分析（PCoA）→ 统计检验（PERMANOVA）
2. **系统发育分析**：读取序列 → 比对 → 构建距离矩阵 → 构建树 → 计算系统发育距离
3. **序列处理**：读取 FASTQ → 质量过滤 → 修剪/清理 → 查找基序 → 翻译 → 写入 FASTA
4. **比较基因组学**：读取序列 → 成对比对 → 计算距离 → 构建树 → 分析演化支系

## 参考文档

有关详细的 API 信息、参数规范和高级用法示例，请参阅 `references/api_reference.md`，其中包含以下方面的全面文档：
- 所有功能的完整方法签名和参数
- 复杂工作流的扩展代码示例
- 常见问题的故障排除
- 性能优化技巧
- 与其他库的集成模式

## 其他资源

- 官方文档：https://scikit.bio/docs/latest/
- GitHub 仓库：https://github.com/scikit-bio/scikit-bio
- 论坛支持：https://forum.qiime2.org（scikit-bio 是 QIIME 2 生态系统的一部分）